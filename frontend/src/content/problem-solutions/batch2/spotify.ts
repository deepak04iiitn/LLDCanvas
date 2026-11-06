import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'SpotifyService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_songs', 'Map<string, Song>'),
    attr('-', '_albums', 'Map<string, Album>'),
    attr('-', '_artists', 'Map<string, Artist>'),
    attr('-', '_playlists', 'Map<string, Playlist>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createSong', 'name: string', 'Song'),
    method('+', 'createAlbum', 'name: string', 'Album'),
    method('+', 'createArtist', 'name: string', 'Artist'),
    method('+', 'createPlaylist', 'name: string', 'Playlist'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getSong', 'id: string', 'Song'),
    method('+', 'getAlbum', 'id: string', 'Album'),
    method('+', 'getArtist', 'id: string', 'Artist'),
    method('+', 'getPlaylist', 'id: string', 'Playlist'),
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
  cls('n2', 'Song', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Album', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Artist', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Playlist', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("spotify")


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


class Song:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Song.id is required")
        if not name or not name.strip():
            raise ValueError("Song.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Song.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Song {self.id} has invalid status={self.status}")
        log.info("[Song.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Song {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Song.close] id=%s -> CLOSED", self.id)


class Album:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Album.id is required")
        if not name or not name.strip():
            raise ValueError("Album.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Album.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Album {self.id} has invalid status={self.status}")
        log.info("[Album.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Album {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Album.close] id=%s -> CLOSED", self.id)


class Artist:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Artist.id is required")
        if not name or not name.strip():
            raise ValueError("Artist.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Artist.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Artist {self.id} has invalid status={self.status}")
        log.info("[Artist.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Artist {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Artist.close] id=%s -> CLOSED", self.id)


class Playlist:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Playlist.id is required")
        if not name or not name.strip():
            raise ValueError("Playlist.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Playlist.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Playlist {self.id} has invalid status={self.status}")
        log.info("[Playlist.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Playlist {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Playlist.close] id=%s -> CLOSED", self.id)


class SpotifyService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._songs: Dict[str, Song] = {}
        self._albums: Dict[str, Album] = {}
        self._artists: Dict[str, Artist] = {}
        self._playlists: Dict[str, Playlist] = {}
        log.info("[SpotifyService.__init__] system ready; managing: User, Song, Album, Artist, Playlist")

    def create_user(self, name: str) -> User:
        """UML: SpotifyService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[SpotifyService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[SpotifyService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_song(self, name: str) -> Song:
        """UML: SpotifyService.create_song(name) -> Song"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Song name is required")
        with self._lock:
            item_id = f"SON-{self._seq:04d}"
            self._seq += 1
            obj = Song(item_id, cleaned)
            obj.validate()
            self._songs[item_id] = obj
            log.info("[SpotifyService.create_song] stored %s in _songs (count=%s)", item_id, len(self._songs))
            return obj

    def get_song(self, item_id: str) -> Song:
        with self._lock:
            obj = self._songs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Song id: {item_id}")
            log.info("[SpotifyService.get_song] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_album(self, name: str) -> Album:
        """UML: SpotifyService.create_album(name) -> Album"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Album name is required")
        with self._lock:
            item_id = f"ALB-{self._seq:04d}"
            self._seq += 1
            obj = Album(item_id, cleaned)
            obj.validate()
            self._albums[item_id] = obj
            log.info("[SpotifyService.create_album] stored %s in _albums (count=%s)", item_id, len(self._albums))
            return obj

    def get_album(self, item_id: str) -> Album:
        with self._lock:
            obj = self._albums.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Album id: {item_id}")
            log.info("[SpotifyService.get_album] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_artist(self, name: str) -> Artist:
        """UML: SpotifyService.create_artist(name) -> Artist"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Artist name is required")
        with self._lock:
            item_id = f"ART-{self._seq:04d}"
            self._seq += 1
            obj = Artist(item_id, cleaned)
            obj.validate()
            self._artists[item_id] = obj
            log.info("[SpotifyService.create_artist] stored %s in _artists (count=%s)", item_id, len(self._artists))
            return obj

    def get_artist(self, item_id: str) -> Artist:
        with self._lock:
            obj = self._artists.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Artist id: {item_id}")
            log.info("[SpotifyService.get_artist] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_playlist(self, name: str) -> Playlist:
        """UML: SpotifyService.create_playlist(name) -> Playlist"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Playlist name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Playlist(item_id, cleaned)
            obj.validate()
            self._playlists[item_id] = obj
            log.info("[SpotifyService.create_playlist] stored %s in _playlists (count=%s)", item_id, len(self._playlists))
            return obj

    def get_playlist(self, item_id: str) -> Playlist:
        with self._lock:
            obj = self._playlists.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Playlist id: {item_id}")
            log.info("[SpotifyService.get_playlist] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[SpotifyService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[SpotifyService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct SpotifyService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = SpotifyService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Song (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_song("sample-song")

    log.info("========== STEP 4: Create Album (UML class) ==========")
    system.create_album("sample-album")

    log.info("========== STEP 5: Create Artist (UML class) ==========")
    system.create_artist("sample-artist")

    log.info("========== STEP 6: Create Playlist (UML class) ==========")
    system.create_playlist("sample-playlist")

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


class Song {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Song(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Song.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Song.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Song.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Song " + id + " invalid status");
    }
    System.out.println("[Song.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Song " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Song.close] id=" + id + " -> CLOSED");
  }
}


class Album {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Album(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Album.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Album.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Album.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Album " + id + " invalid status");
    }
    System.out.println("[Album.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Album " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Album.close] id=" + id + " -> CLOSED");
  }
}


class Artist {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Artist(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Artist.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Artist.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Artist.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Artist " + id + " invalid status");
    }
    System.out.println("[Artist.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Artist " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Artist.close] id=" + id + " -> CLOSED");
  }
}


class Playlist {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Playlist(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Playlist.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Playlist.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Playlist.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Playlist " + id + " invalid status");
    }
    System.out.println("[Playlist.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Playlist " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Playlist.close] id=" + id + " -> CLOSED");
  }
}

public class SpotifyService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Song> songs = new LinkedHashMap<>();
  private final Map<String, Album> albums = new LinkedHashMap<>();
  private final Map<String, Artist> artists = new LinkedHashMap<>();
  private final Map<String, Playlist> playlists = new LinkedHashMap<>();

  public SpotifyService() {
    System.out.println("[SpotifyService.__init__] system ready");
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
      System.out.println("[SpotifyService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[SpotifyService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Song createSong(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Song name required");
    }
    lock.lock();
    try {
      String id = String.format("SON-%04d", seq++);
      Song obj = new Song(id, name.trim());
      obj.validate();
      songs.put(id, obj);
      System.out.println("[SpotifyService.createSong] stored " + id + " count=" + songs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Song getSong(String id) {
    lock.lock();
    try {
      Song obj = songs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Song id: " + id);
      }
      System.out.println("[SpotifyService.getSong] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Album createAlbum(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Album name required");
    }
    lock.lock();
    try {
      String id = String.format("ALB-%04d", seq++);
      Album obj = new Album(id, name.trim());
      obj.validate();
      albums.put(id, obj);
      System.out.println("[SpotifyService.createAlbum] stored " + id + " count=" + albums.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Album getAlbum(String id) {
    lock.lock();
    try {
      Album obj = albums.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Album id: " + id);
      }
      System.out.println("[SpotifyService.getAlbum] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Artist createArtist(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Artist name required");
    }
    lock.lock();
    try {
      String id = String.format("ART-%04d", seq++);
      Artist obj = new Artist(id, name.trim());
      obj.validate();
      artists.put(id, obj);
      System.out.println("[SpotifyService.createArtist] stored " + id + " count=" + artists.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Artist getArtist(String id) {
    lock.lock();
    try {
      Artist obj = artists.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Artist id: " + id);
      }
      System.out.println("[SpotifyService.getArtist] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Playlist createPlaylist(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Playlist name required");
    }
    lock.lock();
    try {
      String id = String.format("PLA-%04d", seq++);
      Playlist obj = new Playlist(id, name.trim());
      obj.validate();
      playlists.put(id, obj);
      System.out.println("[SpotifyService.createPlaylist] stored " + id + " count=" + playlists.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Playlist getPlaylist(String id) {
    lock.lock();
    try {
      Playlist obj = playlists.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Playlist id: " + id);
      }
      System.out.println("[SpotifyService.getPlaylist] found id=" + obj.getId());
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
      System.out.println("[SpotifyService.closeUser] closing " + id);
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
      System.out.println("[SpotifyService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct SpotifyService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    SpotifyService system = new SpotifyService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Song ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSong("sample-song");
    System.out.println("========== STEP 4: Create Album ==========");
    system.createAlbum("sample-album");
    System.out.println("========== STEP 5: Create Artist ==========");
    system.createArtist("sample-artist");
    System.out.println("========== STEP 6: Create Playlist ==========");
    system.createPlaylist("sample-playlist");
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


class Song {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Song.id required')
    }

    if (!name?.trim()) {
      throw new Error('Song.name required')
    }
    console.log(\`[Song.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Song \${this.id} invalid status\`)
    }
    console.log(\`[Song.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Song \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Song.close] id=\${this.id} -> CLOSED\`)
  }
}


class Album {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Album.id required')
    }

    if (!name?.trim()) {
      throw new Error('Album.name required')
    }
    console.log(\`[Album.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Album \${this.id} invalid status\`)
    }
    console.log(\`[Album.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Album \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Album.close] id=\${this.id} -> CLOSED\`)
  }
}


class Artist {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Artist.id required')
    }

    if (!name?.trim()) {
      throw new Error('Artist.name required')
    }
    console.log(\`[Artist.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Artist \${this.id} invalid status\`)
    }
    console.log(\`[Artist.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Artist \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Artist.close] id=\${this.id} -> CLOSED\`)
  }
}


class Playlist {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Playlist.id required')
    }

    if (!name?.trim()) {
      throw new Error('Playlist.name required')
    }
    console.log(\`[Playlist.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Playlist \${this.id} invalid status\`)
    }
    console.log(\`[Playlist.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Playlist \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Playlist.close] id=\${this.id} -> CLOSED\`)
  }
}

class SpotifyService {
  private seq = 1
  private users = new Map<string, User>()
  private songs = new Map<string, Song>()
  private albums = new Map<string, Album>()
  private artists = new Map<string, Artist>()
  private playlists = new Map<string, Playlist>()
  constructor() {
    console.log('[SpotifyService.__init__] system ready')
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
    console.log(\`[SpotifyService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[SpotifyService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createSong(name: string): Song {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Song name required')
    }
    const id = \`SON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Song(id, cleaned)
    obj.validate()
    this.songs.set(id, obj)
    console.log(\`[SpotifyService.createSong] stored \${id} count=\${this.songs.size}\`)
    return obj
  }

  getSong(id: string): Song {
    const obj = this.songs.get(id)
    if (!obj) {
      throw new Error(\`unknown Song id: \${id}\`)
    }
    console.log(\`[SpotifyService.getSong] found id=\${obj.id}\`)
    return obj
  }

  createAlbum(name: string): Album {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Album name required')
    }
    const id = \`ALB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Album(id, cleaned)
    obj.validate()
    this.albums.set(id, obj)
    console.log(\`[SpotifyService.createAlbum] stored \${id} count=\${this.albums.size}\`)
    return obj
  }

  getAlbum(id: string): Album {
    const obj = this.albums.get(id)
    if (!obj) {
      throw new Error(\`unknown Album id: \${id}\`)
    }
    console.log(\`[SpotifyService.getAlbum] found id=\${obj.id}\`)
    return obj
  }

  createArtist(name: string): Artist {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Artist name required')
    }
    const id = \`ART-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Artist(id, cleaned)
    obj.validate()
    this.artists.set(id, obj)
    console.log(\`[SpotifyService.createArtist] stored \${id} count=\${this.artists.size}\`)
    return obj
  }

  getArtist(id: string): Artist {
    const obj = this.artists.get(id)
    if (!obj) {
      throw new Error(\`unknown Artist id: \${id}\`)
    }
    console.log(\`[SpotifyService.getArtist] found id=\${obj.id}\`)
    return obj
  }

  createPlaylist(name: string): Playlist {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Playlist name required')
    }
    const id = \`PLA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Playlist(id, cleaned)
    obj.validate()
    this.playlists.set(id, obj)
    console.log(\`[SpotifyService.createPlaylist] stored \${id} count=\${this.playlists.size}\`)
    return obj
  }

  getPlaylist(id: string): Playlist {
    const obj = this.playlists.get(id)
    if (!obj) {
      throw new Error(\`unknown Playlist id: \${id}\`)
    }
    console.log(\`[SpotifyService.getPlaylist] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[SpotifyService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[SpotifyService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct SpotifyService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new SpotifyService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Song ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSong('sample-song')
  console.log('========== STEP 4: Create Album ==========')
  system.createAlbum('sample-album')
  console.log('========== STEP 5: Create Artist ==========')
  system.createArtist('sample-artist')
  console.log('========== STEP 6: Create Playlist ==========')
  system.createPlaylist('sample-playlist')
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


class Song {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Song(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Song requires id and name");
    }
    cout << "[Song.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Song invalid status");
    }
    cout << "[Song.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Song cannot close");
    }
    status_ = "CLOSED";
    cout << "[Song.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Album {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Album(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Album requires id and name");
    }
    cout << "[Album.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Album invalid status");
    }
    cout << "[Album.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Album cannot close");
    }
    status_ = "CLOSED";
    cout << "[Album.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Artist {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Artist(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Artist requires id and name");
    }
    cout << "[Artist.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Artist invalid status");
    }
    cout << "[Artist.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Artist cannot close");
    }
    status_ = "CLOSED";
    cout << "[Artist.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Playlist {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Playlist(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Playlist requires id and name");
    }
    cout << "[Playlist.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Playlist invalid status");
    }
    cout << "[Playlist.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Playlist cannot close");
    }
    status_ = "CLOSED";
    cout << "[Playlist.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class SpotifyService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Song> songs_;
  unordered_map<string, Album> albums_;
  unordered_map<string, Artist> artists_;
  unordered_map<string, Playlist> playlists_;
public:
  SpotifyService() {
    cout << "[SpotifyService.__init__] system ready" << endl;
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
    cout << "[SpotifyService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[SpotifyService.getUser] found " << id << endl;
    return it->second;
  }

  Song createSong(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Song name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SON-%04d", seq_++);
    Song obj{buf, name};
    obj.validate();
    songs_.emplace(obj.id(), obj);
    cout << "[SpotifyService.createSong] stored " << obj.id() << endl;
    return obj;
  }

  Song getSong(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = songs_.find(id);
    if (it == songs_.end()) {
      throw out_of_range("unknown Song id");
    }
    cout << "[SpotifyService.getSong] found " << id << endl;
    return it->second;
  }

  Album createAlbum(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Album name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ALB-%04d", seq_++);
    Album obj{buf, name};
    obj.validate();
    albums_.emplace(obj.id(), obj);
    cout << "[SpotifyService.createAlbum] stored " << obj.id() << endl;
    return obj;
  }

  Album getAlbum(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = albums_.find(id);
    if (it == albums_.end()) {
      throw out_of_range("unknown Album id");
    }
    cout << "[SpotifyService.getAlbum] found " << id << endl;
    return it->second;
  }

  Artist createArtist(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Artist name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ART-%04d", seq_++);
    Artist obj{buf, name};
    obj.validate();
    artists_.emplace(obj.id(), obj);
    cout << "[SpotifyService.createArtist] stored " << obj.id() << endl;
    return obj;
  }

  Artist getArtist(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = artists_.find(id);
    if (it == artists_.end()) {
      throw out_of_range("unknown Artist id");
    }
    cout << "[SpotifyService.getArtist] found " << id << endl;
    return it->second;
  }

  Playlist createPlaylist(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Playlist name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PLA-%04d", seq_++);
    Playlist obj{buf, name};
    obj.validate();
    playlists_.emplace(obj.id(), obj);
    cout << "[SpotifyService.createPlaylist] stored " << obj.id() << endl;
    return obj;
  }

  Playlist getPlaylist(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = playlists_.find(id);
    if (it == playlists_.end()) {
      throw out_of_range("unknown Playlist id");
    }
    cout << "[SpotifyService.getPlaylist] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[SpotifyService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct SpotifyService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  SpotifyService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createSong("sample-song");
  system.createAlbum("sample-album");
  system.createArtist("sample-artist");
  system.createPlaylist("sample-playlist");
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


type Song struct {
  ID     string
  Name   string
  Status string
}

func NewSong(id, name string) (*Song, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Song requires id and name")
  }
  obj := &Song{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Song.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Song) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Song invalid status")
  }
  fmt.Printf("[Song.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Song) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Song %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Song.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Album struct {
  ID     string
  Name   string
  Status string
}

func NewAlbum(id, name string) (*Album, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Album requires id and name")
  }
  obj := &Album{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Album.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Album) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Album invalid status")
  }
  fmt.Printf("[Album.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Album) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Album %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Album.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Artist struct {
  ID     string
  Name   string
  Status string
}

func NewArtist(id, name string) (*Artist, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Artist requires id and name")
  }
  obj := &Artist{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Artist.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Artist) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Artist invalid status")
  }
  fmt.Printf("[Artist.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Artist) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Artist %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Artist.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Playlist struct {
  ID     string
  Name   string
  Status string
}

func NewPlaylist(id, name string) (*Playlist, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Playlist requires id and name")
  }
  obj := &Playlist{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Playlist.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Playlist) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Playlist invalid status")
  }
  fmt.Printf("[Playlist.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Playlist) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Playlist %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Playlist.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type SpotifyService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  songs map[string]*Song
  albums map[string]*Album
  artists map[string]*Artist
  playlists map[string]*Playlist
}

func NewSpotifyService() *SpotifyService {
  fmt.Println("[SpotifyService.__init__] system ready")
  return &SpotifyService{
    seq: 1,
    users: map[string]*User{},
    songs: map[string]*Song{},
    albums: map[string]*Album{},
    artists: map[string]*Artist{},
    playlists: map[string]*Playlist{},
  }
}

func (s *SpotifyService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[SpotifyService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[SpotifyService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) CreateSong(name string) (*Song, error) {
  if name == "" {
    return nil, fmt.Errorf("Song name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SON-%04d", s.seq)
  s.seq++
  obj, err := NewSong(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.songs[id] = obj
  fmt.Printf("[SpotifyService.CreateSong] stored %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) GetSong(id string) (*Song, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.songs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Song id: %s", id)
  }
  fmt.Printf("[SpotifyService.GetSong] found %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) CreateAlbum(name string) (*Album, error) {
  if name == "" {
    return nil, fmt.Errorf("Album name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ALB-%04d", s.seq)
  s.seq++
  obj, err := NewAlbum(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.albums[id] = obj
  fmt.Printf("[SpotifyService.CreateAlbum] stored %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) GetAlbum(id string) (*Album, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.albums[id]
  if !ok {
    return nil, fmt.Errorf("unknown Album id: %s", id)
  }
  fmt.Printf("[SpotifyService.GetAlbum] found %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) CreateArtist(name string) (*Artist, error) {
  if name == "" {
    return nil, fmt.Errorf("Artist name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ART-%04d", s.seq)
  s.seq++
  obj, err := NewArtist(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.artists[id] = obj
  fmt.Printf("[SpotifyService.CreateArtist] stored %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) GetArtist(id string) (*Artist, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.artists[id]
  if !ok {
    return nil, fmt.Errorf("unknown Artist id: %s", id)
  }
  fmt.Printf("[SpotifyService.GetArtist] found %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) CreatePlaylist(name string) (*Playlist, error) {
  if name == "" {
    return nil, fmt.Errorf("Playlist name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PLA-%04d", s.seq)
  s.seq++
  obj, err := NewPlaylist(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.playlists[id] = obj
  fmt.Printf("[SpotifyService.CreatePlaylist] stored %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) GetPlaylist(id string) (*Playlist, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.playlists[id]
  if !ok {
    return nil, fmt.Errorf("unknown Playlist id: %s", id)
  }
  fmt.Printf("[SpotifyService.GetPlaylist] found %s\\n", id)
  return obj, nil
}

func (s *SpotifyService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[SpotifyService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct SpotifyService ==========")
  system := NewSpotifyService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateSong("sample-song")
  system.CreateAlbum("sample-album")
  system.CreateArtist("sample-artist")
  system.CreatePlaylist("sample-playlist")
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


sealed class Song {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Song(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Song requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Song.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Song invalid status");
    }
    Console.WriteLine("[Song.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Song " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Song.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Album {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Album(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Album requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Album.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Album invalid status");
    }
    Console.WriteLine("[Album.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Album " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Album.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Artist {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Artist(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Artist requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Artist.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Artist invalid status");
    }
    Console.WriteLine("[Artist.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Artist " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Artist.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Playlist {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Playlist(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Playlist requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Playlist.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Playlist invalid status");
    }
    Console.WriteLine("[Playlist.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Playlist " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Playlist.close] id=" + Id + " -> CLOSED");
  }
}

sealed class SpotifyService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Song> _songs = new();
  private readonly Dictionary<string, Album> _albums = new();
  private readonly Dictionary<string, Artist> _artists = new();
  private readonly Dictionary<string, Playlist> _playlists = new();
  public SpotifyService() {
    Console.WriteLine("[SpotifyService.__init__] system ready");
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
      Console.WriteLine("[SpotifyService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[SpotifyService.GetUser] found " + id);
      return obj;
    }
  }

  public Song CreateSong(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Song name required");
    }
    lock (_gate) {
      var id = string.Format("SON-{0:D4}", _seq++);
      var obj = new Song(id, name.Trim());
      obj.Validate();
      _songs[id] = obj;
      Console.WriteLine("[SpotifyService.CreateSong] stored " + id);
      return obj;
    }
  }

  public Song GetSong(string id) {
    lock (_gate) {
      if (!_songs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Song id: " + id);
      }
      Console.WriteLine("[SpotifyService.GetSong] found " + id);
      return obj;
    }
  }

  public Album CreateAlbum(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Album name required");
    }
    lock (_gate) {
      var id = string.Format("ALB-{0:D4}", _seq++);
      var obj = new Album(id, name.Trim());
      obj.Validate();
      _albums[id] = obj;
      Console.WriteLine("[SpotifyService.CreateAlbum] stored " + id);
      return obj;
    }
  }

  public Album GetAlbum(string id) {
    lock (_gate) {
      if (!_albums.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Album id: " + id);
      }
      Console.WriteLine("[SpotifyService.GetAlbum] found " + id);
      return obj;
    }
  }

  public Artist CreateArtist(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Artist name required");
    }
    lock (_gate) {
      var id = string.Format("ART-{0:D4}", _seq++);
      var obj = new Artist(id, name.Trim());
      obj.Validate();
      _artists[id] = obj;
      Console.WriteLine("[SpotifyService.CreateArtist] stored " + id);
      return obj;
    }
  }

  public Artist GetArtist(string id) {
    lock (_gate) {
      if (!_artists.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Artist id: " + id);
      }
      Console.WriteLine("[SpotifyService.GetArtist] found " + id);
      return obj;
    }
  }

  public Playlist CreatePlaylist(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Playlist name required");
    }
    lock (_gate) {
      var id = string.Format("PLA-{0:D4}", _seq++);
      var obj = new Playlist(id, name.Trim());
      obj.Validate();
      _playlists[id] = obj;
      Console.WriteLine("[SpotifyService.CreatePlaylist] stored " + id);
      return obj;
    }
  }

  public Playlist GetPlaylist(string id) {
    lock (_gate) {
      if (!_playlists.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Playlist id: " + id);
      }
      Console.WriteLine("[SpotifyService.GetPlaylist] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[SpotifyService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct SpotifyService ==========");
    var system = new SpotifyService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateSong("sample-song");
    system.CreateAlbum("sample-album");
    system.CreateArtist("sample-artist");
    system.CreatePlaylist("sample-playlist");
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

export const spotifySolution: ProblemSolution = {
  slug: 'spotify',
  title: 'Music Streaming (Spotify) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a music streaming service like Spotify — song catalog, playlists, playback queues, recommendations, and offline mode. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Browse and search songs, albums, artists, and podcasts',
      'Create, edit, and share playlists',
      'Play songs with skip, repeat, shuffle controls',
      'Like songs and follow artists and playlists',
      'Personalized daily mixes and discover weekly',
      'Download songs for offline playback (premium)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Browse and search songs, albums, artists, and podcasts?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Create, edit, and share playlists?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Play songs with skip, repeat, shuffle controls?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Like songs and follow artists and playlists?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Personalized daily mixes and discover weekly?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. SpotifyService is the facade stereotype. User, Song, Album, Artist, Playlist are concrete domain classes with id/name/status and validate/close.',
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
          'Construct SpotifyService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'SpotifyService', responsibility: 'UML facade - orchestrates Music Streaming (Spotify).', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Song', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Album', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Artist', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Playlist', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from SpotifyService to User, Song, Album, Artist, Playlist. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on SpotifyService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'SpotifyService', responsibility: 'UML facade - orchestrates Music Streaming (Spotify).', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Song', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Album', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Artist', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Playlist', responsibility: 'UML class - domain object for Music Streaming (Spotify).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'SpotifyService exposes create/get/close and owns composed collections.' },
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
      'main constructs SpotifyService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct SpotifyService.',
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
