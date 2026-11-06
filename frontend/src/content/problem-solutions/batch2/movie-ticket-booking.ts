import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'MovieTicketBookingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_movies', 'Map<string, Movie>'),
    attr('-', '_theatres', 'Map<string, Theatre>'),
    attr('-', '_screens', 'Map<string, Screen>'),
    attr('-', '_shows', 'Map<string, Show>'),
    attr('-', '_seats', 'Map<string, Seat>'),
  ], [
    method('+', 'createMovie', 'name: string', 'Movie'),
    method('+', 'createTheatre', 'name: string', 'Theatre'),
    method('+', 'createScreen', 'name: string', 'Screen'),
    method('+', 'createShow', 'name: string', 'Show'),
    method('+', 'createSeat', 'name: string', 'Seat'),
    method('+', 'getMovie', 'id: string', 'Movie'),
    method('+', 'getTheatre', 'id: string', 'Theatre'),
    method('+', 'getScreen', 'id: string', 'Screen'),
    method('+', 'getShow', 'id: string', 'Show'),
    method('+', 'getSeat', 'id: string', 'Seat'),
    method('+', 'closeMovie', 'id: string', 'Movie'),
  ], 'facade'),
  cls('n1', 'Movie', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Theatre', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Screen', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Show', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Seat', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("movie-ticket-booking")


class Movie:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Movie.id is required")
        if not name or not name.strip():
            raise ValueError("Movie.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Movie.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Movie {self.id} has invalid status={self.status}")
        log.info("[Movie.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Movie {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Movie.close] id=%s -> CLOSED", self.id)


class Theatre:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Theatre.id is required")
        if not name or not name.strip():
            raise ValueError("Theatre.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Theatre.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Theatre {self.id} has invalid status={self.status}")
        log.info("[Theatre.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Theatre {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Theatre.close] id=%s -> CLOSED", self.id)


class Screen:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Screen.id is required")
        if not name or not name.strip():
            raise ValueError("Screen.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Screen.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Screen {self.id} has invalid status={self.status}")
        log.info("[Screen.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Screen {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Screen.close] id=%s -> CLOSED", self.id)


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


class Seat:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Seat.id is required")
        if not name or not name.strip():
            raise ValueError("Seat.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Seat.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Seat {self.id} has invalid status={self.status}")
        log.info("[Seat.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Seat {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Seat.close] id=%s -> CLOSED", self.id)


class MovieTicketBookingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._movies: Dict[str, Movie] = {}
        self._theatres: Dict[str, Theatre] = {}
        self._screens: Dict[str, Screen] = {}
        self._shows: Dict[str, Show] = {}
        self._seats: Dict[str, Seat] = {}
        log.info("[MovieTicketBookingService.__init__] system ready; managing: Movie, Theatre, Screen, Show, Seat")

    def create_movie(self, name: str) -> Movie:
        """UML: MovieTicketBookingService.create_movie(name) -> Movie"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Movie name is required")
        with self._lock:
            item_id = f"MOV-{self._seq:04d}"
            self._seq += 1
            obj = Movie(item_id, cleaned)
            obj.validate()
            self._movies[item_id] = obj
            log.info("[MovieTicketBookingService.create_movie] stored %s in _movies (count=%s)", item_id, len(self._movies))
            return obj

    def get_movie(self, item_id: str) -> Movie:
        with self._lock:
            obj = self._movies.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Movie id: {item_id}")
            log.info("[MovieTicketBookingService.get_movie] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_theatre(self, name: str) -> Theatre:
        """UML: MovieTicketBookingService.create_theatre(name) -> Theatre"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Theatre name is required")
        with self._lock:
            item_id = f"THE-{self._seq:04d}"
            self._seq += 1
            obj = Theatre(item_id, cleaned)
            obj.validate()
            self._theatres[item_id] = obj
            log.info("[MovieTicketBookingService.create_theatre] stored %s in _theatres (count=%s)", item_id, len(self._theatres))
            return obj

    def get_theatre(self, item_id: str) -> Theatre:
        with self._lock:
            obj = self._theatres.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Theatre id: {item_id}")
            log.info("[MovieTicketBookingService.get_theatre] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_screen(self, name: str) -> Screen:
        """UML: MovieTicketBookingService.create_screen(name) -> Screen"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Screen name is required")
        with self._lock:
            item_id = f"SCR-{self._seq:04d}"
            self._seq += 1
            obj = Screen(item_id, cleaned)
            obj.validate()
            self._screens[item_id] = obj
            log.info("[MovieTicketBookingService.create_screen] stored %s in _screens (count=%s)", item_id, len(self._screens))
            return obj

    def get_screen(self, item_id: str) -> Screen:
        with self._lock:
            obj = self._screens.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Screen id: {item_id}")
            log.info("[MovieTicketBookingService.get_screen] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_show(self, name: str) -> Show:
        """UML: MovieTicketBookingService.create_show(name) -> Show"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Show name is required")
        with self._lock:
            item_id = f"SHO-{self._seq:04d}"
            self._seq += 1
            obj = Show(item_id, cleaned)
            obj.validate()
            self._shows[item_id] = obj
            log.info("[MovieTicketBookingService.create_show] stored %s in _shows (count=%s)", item_id, len(self._shows))
            return obj

    def get_show(self, item_id: str) -> Show:
        with self._lock:
            obj = self._shows.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Show id: {item_id}")
            log.info("[MovieTicketBookingService.get_show] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_seat(self, name: str) -> Seat:
        """UML: MovieTicketBookingService.create_seat(name) -> Seat"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Seat name is required")
        with self._lock:
            item_id = f"SEA-{self._seq:04d}"
            self._seq += 1
            obj = Seat(item_id, cleaned)
            obj.validate()
            self._seats[item_id] = obj
            log.info("[MovieTicketBookingService.create_seat] stored %s in _seats (count=%s)", item_id, len(self._seats))
            return obj

    def get_seat(self, item_id: str) -> Seat:
        with self._lock:
            obj = self._seats.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Seat id: {item_id}")
            log.info("[MovieTicketBookingService.get_seat] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_movie(self, item_id: str) -> Movie:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._movies.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Movie id: {item_id}")
            log.info("[MovieTicketBookingService.close_movie] closing %s via Movie.close()", item_id)
            obj.close()
            return obj

    def list_active_movies(self) -> List[Movie]:
        with self._lock:
            active = [o for o in self._movies.values() if o.status == "ACTIVE"]
            log.info("[MovieTicketBookingService.list_active_movies] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct MovieTicketBookingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = MovieTicketBookingService()

    log.info("========== STEP 2: Create primary Movie objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_movie("alpha-movie")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_movie("beta-movie")

    log.info("========== STEP 3: Create Theatre (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_theatre("sample-theatre")

    log.info("========== STEP 4: Create Screen (UML class) ==========")
    system.create_screen("sample-screen")

    log.info("========== STEP 5: Create Show (UML class) ==========")
    system.create_show("sample-show")

    log.info("========== STEP 6: Create Seat (UML class) ==========")
    system.create_seat("sample-seat")

    log.info("========== STEP 7: Inspect active Movie list ==========")
    system.list_active_movies()

    log.info("========== STEP 8: Close first Movie ==========")
    system.close_movie(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_movie(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Movie.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_movie("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_movie: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_movies()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Movie {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Movie(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Movie.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Movie.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Movie.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Movie " + id + " invalid status");
    }
    System.out.println("[Movie.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Movie " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Movie.close] id=" + id + " -> CLOSED");
  }
}


class Theatre {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Theatre(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Theatre.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Theatre.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Theatre.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Theatre " + id + " invalid status");
    }
    System.out.println("[Theatre.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Theatre " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Theatre.close] id=" + id + " -> CLOSED");
  }
}


class Screen {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Screen(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Screen.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Screen.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Screen.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Screen " + id + " invalid status");
    }
    System.out.println("[Screen.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Screen " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Screen.close] id=" + id + " -> CLOSED");
  }
}


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


class Seat {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Seat(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Seat.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Seat.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Seat.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Seat " + id + " invalid status");
    }
    System.out.println("[Seat.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Seat " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Seat.close] id=" + id + " -> CLOSED");
  }
}

public class MovieTicketBookingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Movie> movies = new LinkedHashMap<>();
  private final Map<String, Theatre> theatres = new LinkedHashMap<>();
  private final Map<String, Screen> screens = new LinkedHashMap<>();
  private final Map<String, Show> shows = new LinkedHashMap<>();
  private final Map<String, Seat> seats = new LinkedHashMap<>();

  public MovieTicketBookingService() {
    System.out.println("[MovieTicketBookingService.__init__] system ready");
  }

  public Movie createMovie(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Movie name required");
    }
    lock.lock();
    try {
      String id = String.format("MOV-%04d", seq++);
      Movie obj = new Movie(id, name.trim());
      obj.validate();
      movies.put(id, obj);
      System.out.println("[MovieTicketBookingService.createMovie] stored " + id + " count=" + movies.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Movie getMovie(String id) {
    lock.lock();
    try {
      Movie obj = movies.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Movie id: " + id);
      }
      System.out.println("[MovieTicketBookingService.getMovie] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Theatre createTheatre(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Theatre name required");
    }
    lock.lock();
    try {
      String id = String.format("THE-%04d", seq++);
      Theatre obj = new Theatre(id, name.trim());
      obj.validate();
      theatres.put(id, obj);
      System.out.println("[MovieTicketBookingService.createTheatre] stored " + id + " count=" + theatres.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Theatre getTheatre(String id) {
    lock.lock();
    try {
      Theatre obj = theatres.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Theatre id: " + id);
      }
      System.out.println("[MovieTicketBookingService.getTheatre] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Screen createScreen(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Screen name required");
    }
    lock.lock();
    try {
      String id = String.format("SCR-%04d", seq++);
      Screen obj = new Screen(id, name.trim());
      obj.validate();
      screens.put(id, obj);
      System.out.println("[MovieTicketBookingService.createScreen] stored " + id + " count=" + screens.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Screen getScreen(String id) {
    lock.lock();
    try {
      Screen obj = screens.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Screen id: " + id);
      }
      System.out.println("[MovieTicketBookingService.getScreen] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[MovieTicketBookingService.createShow] stored " + id + " count=" + shows.size());
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
      System.out.println("[MovieTicketBookingService.getShow] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Seat createSeat(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Seat name required");
    }
    lock.lock();
    try {
      String id = String.format("SEA-%04d", seq++);
      Seat obj = new Seat(id, name.trim());
      obj.validate();
      seats.put(id, obj);
      System.out.println("[MovieTicketBookingService.createSeat] stored " + id + " count=" + seats.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Seat getSeat(String id) {
    lock.lock();
    try {
      Seat obj = seats.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Seat id: " + id);
      }
      System.out.println("[MovieTicketBookingService.getSeat] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Movie closeMovie(String id) {
    lock.lock();
    try {
      Movie obj = movies.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Movie id: " + id);
      }
      System.out.println("[MovieTicketBookingService.closeMovie] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Movie> listActiveMovies() {
    lock.lock();
    try {
      List<Movie> out = new ArrayList<>();
      for (Movie o : movies.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[MovieTicketBookingService.listActiveMovies] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct MovieTicketBookingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    MovieTicketBookingService system = new MovieTicketBookingService();
    System.out.println("========== STEP 2: Create Movie objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Movie first = system.createMovie("alpha-movie");
    system.createMovie("beta-movie");
    System.out.println("========== STEP 3: Create Theatre ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createTheatre("sample-theatre");
    System.out.println("========== STEP 4: Create Screen ==========");
    system.createScreen("sample-screen");
    System.out.println("========== STEP 5: Create Show ==========");
    system.createShow("sample-show");
    System.out.println("========== STEP 6: Create Seat ==========");
    system.createSeat("sample-seat");
    System.out.println("========== Inspect active list ==========");
    system.listActiveMovies();
    System.out.println("========== Close first Movie ==========");
    system.closeMovie(first.getId());
    try {
      system.closeMovie(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getMovie("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Movie {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Movie.id required')
    }

    if (!name?.trim()) {
      throw new Error('Movie.name required')
    }
    console.log(\`[Movie.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Movie \${this.id} invalid status\`)
    }
    console.log(\`[Movie.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Movie \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Movie.close] id=\${this.id} -> CLOSED\`)
  }
}


class Theatre {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Theatre.id required')
    }

    if (!name?.trim()) {
      throw new Error('Theatre.name required')
    }
    console.log(\`[Theatre.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Theatre \${this.id} invalid status\`)
    }
    console.log(\`[Theatre.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Theatre \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Theatre.close] id=\${this.id} -> CLOSED\`)
  }
}


class Screen {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Screen.id required')
    }

    if (!name?.trim()) {
      throw new Error('Screen.name required')
    }
    console.log(\`[Screen.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Screen \${this.id} invalid status\`)
    }
    console.log(\`[Screen.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Screen \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Screen.close] id=\${this.id} -> CLOSED\`)
  }
}


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


class Seat {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Seat.id required')
    }

    if (!name?.trim()) {
      throw new Error('Seat.name required')
    }
    console.log(\`[Seat.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Seat \${this.id} invalid status\`)
    }
    console.log(\`[Seat.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Seat \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Seat.close] id=\${this.id} -> CLOSED\`)
  }
}

class MovieTicketBookingService {
  private seq = 1
  private movies = new Map<string, Movie>()
  private theatres = new Map<string, Theatre>()
  private screens = new Map<string, Screen>()
  private shows = new Map<string, Show>()
  private seats = new Map<string, Seat>()
  constructor() {
    console.log('[MovieTicketBookingService.__init__] system ready')
  }

  createMovie(name: string): Movie {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Movie name required')
    }
    const id = \`MOV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Movie(id, cleaned)
    obj.validate()
    this.movies.set(id, obj)
    console.log(\`[MovieTicketBookingService.createMovie] stored \${id} count=\${this.movies.size}\`)
    return obj
  }

  getMovie(id: string): Movie {
    const obj = this.movies.get(id)
    if (!obj) {
      throw new Error(\`unknown Movie id: \${id}\`)
    }
    console.log(\`[MovieTicketBookingService.getMovie] found id=\${obj.id}\`)
    return obj
  }

  createTheatre(name: string): Theatre {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Theatre name required')
    }
    const id = \`THE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Theatre(id, cleaned)
    obj.validate()
    this.theatres.set(id, obj)
    console.log(\`[MovieTicketBookingService.createTheatre] stored \${id} count=\${this.theatres.size}\`)
    return obj
  }

  getTheatre(id: string): Theatre {
    const obj = this.theatres.get(id)
    if (!obj) {
      throw new Error(\`unknown Theatre id: \${id}\`)
    }
    console.log(\`[MovieTicketBookingService.getTheatre] found id=\${obj.id}\`)
    return obj
  }

  createScreen(name: string): Screen {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Screen name required')
    }
    const id = \`SCR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Screen(id, cleaned)
    obj.validate()
    this.screens.set(id, obj)
    console.log(\`[MovieTicketBookingService.createScreen] stored \${id} count=\${this.screens.size}\`)
    return obj
  }

  getScreen(id: string): Screen {
    const obj = this.screens.get(id)
    if (!obj) {
      throw new Error(\`unknown Screen id: \${id}\`)
    }
    console.log(\`[MovieTicketBookingService.getScreen] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[MovieTicketBookingService.createShow] stored \${id} count=\${this.shows.size}\`)
    return obj
  }

  getShow(id: string): Show {
    const obj = this.shows.get(id)
    if (!obj) {
      throw new Error(\`unknown Show id: \${id}\`)
    }
    console.log(\`[MovieTicketBookingService.getShow] found id=\${obj.id}\`)
    return obj
  }

  createSeat(name: string): Seat {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Seat name required')
    }
    const id = \`SEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Seat(id, cleaned)
    obj.validate()
    this.seats.set(id, obj)
    console.log(\`[MovieTicketBookingService.createSeat] stored \${id} count=\${this.seats.size}\`)
    return obj
  }

  getSeat(id: string): Seat {
    const obj = this.seats.get(id)
    if (!obj) {
      throw new Error(\`unknown Seat id: \${id}\`)
    }
    console.log(\`[MovieTicketBookingService.getSeat] found id=\${obj.id}\`)
    return obj
  }

  closeMovie(id: string): Movie {
    const obj = this.getMovie(id)
    console.log(\`[MovieTicketBookingService.closeMovie] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveMovies(): Movie[] {
    const active = [...this.movies.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[MovieTicketBookingService.listActiveMovies] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct MovieTicketBookingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new MovieTicketBookingService()
  console.log('========== STEP 2: Create Movie objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createMovie('alpha-movie')
  system.createMovie('beta-movie')
  console.log('========== STEP 3: Create Theatre ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createTheatre('sample-theatre')
  console.log('========== STEP 4: Create Screen ==========')
  system.createScreen('sample-screen')
  console.log('========== STEP 5: Create Show ==========')
  system.createShow('sample-show')
  console.log('========== STEP 6: Create Seat ==========')
  system.createSeat('sample-seat')
  system.listActiveMovies()
  console.log('========== Close first Movie ==========')
  system.closeMovie(first.id)
  try {
    system.closeMovie(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getMovie('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Movie {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Movie(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Movie requires id and name");
    }
    cout << "[Movie.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Movie invalid status");
    }
    cout << "[Movie.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Movie cannot close");
    }
    status_ = "CLOSED";
    cout << "[Movie.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Theatre {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Theatre(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Theatre requires id and name");
    }
    cout << "[Theatre.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Theatre invalid status");
    }
    cout << "[Theatre.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Theatre cannot close");
    }
    status_ = "CLOSED";
    cout << "[Theatre.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Screen {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Screen(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Screen requires id and name");
    }
    cout << "[Screen.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Screen invalid status");
    }
    cout << "[Screen.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Screen cannot close");
    }
    status_ = "CLOSED";
    cout << "[Screen.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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


class Seat {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Seat(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Seat requires id and name");
    }
    cout << "[Seat.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Seat invalid status");
    }
    cout << "[Seat.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Seat cannot close");
    }
    status_ = "CLOSED";
    cout << "[Seat.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class MovieTicketBookingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Movie> movies_;
  unordered_map<string, Theatre> theatres_;
  unordered_map<string, Screen> screens_;
  unordered_map<string, Show> shows_;
  unordered_map<string, Seat> seats_;
public:
  MovieTicketBookingService() {
    cout << "[MovieTicketBookingService.__init__] system ready" << endl;
  }

  Movie createMovie(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Movie name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MOV-%04d", seq_++);
    Movie obj{buf, name};
    obj.validate();
    movies_.emplace(obj.id(), obj);
    cout << "[MovieTicketBookingService.createMovie] stored " << obj.id() << endl;
    return obj;
  }

  Movie getMovie(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = movies_.find(id);
    if (it == movies_.end()) {
      throw out_of_range("unknown Movie id");
    }
    cout << "[MovieTicketBookingService.getMovie] found " << id << endl;
    return it->second;
  }

  Theatre createTheatre(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Theatre name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "THE-%04d", seq_++);
    Theatre obj{buf, name};
    obj.validate();
    theatres_.emplace(obj.id(), obj);
    cout << "[MovieTicketBookingService.createTheatre] stored " << obj.id() << endl;
    return obj;
  }

  Theatre getTheatre(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = theatres_.find(id);
    if (it == theatres_.end()) {
      throw out_of_range("unknown Theatre id");
    }
    cout << "[MovieTicketBookingService.getTheatre] found " << id << endl;
    return it->second;
  }

  Screen createScreen(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Screen name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SCR-%04d", seq_++);
    Screen obj{buf, name};
    obj.validate();
    screens_.emplace(obj.id(), obj);
    cout << "[MovieTicketBookingService.createScreen] stored " << obj.id() << endl;
    return obj;
  }

  Screen getScreen(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = screens_.find(id);
    if (it == screens_.end()) {
      throw out_of_range("unknown Screen id");
    }
    cout << "[MovieTicketBookingService.getScreen] found " << id << endl;
    return it->second;
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
    cout << "[MovieTicketBookingService.createShow] stored " << obj.id() << endl;
    return obj;
  }

  Show getShow(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = shows_.find(id);
    if (it == shows_.end()) {
      throw out_of_range("unknown Show id");
    }
    cout << "[MovieTicketBookingService.getShow] found " << id << endl;
    return it->second;
  }

  Seat createSeat(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Seat name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SEA-%04d", seq_++);
    Seat obj{buf, name};
    obj.validate();
    seats_.emplace(obj.id(), obj);
    cout << "[MovieTicketBookingService.createSeat] stored " << obj.id() << endl;
    return obj;
  }

  Seat getSeat(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = seats_.find(id);
    if (it == seats_.end()) {
      throw out_of_range("unknown Seat id");
    }
    cout << "[MovieTicketBookingService.getSeat] found " << id << endl;
    return it->second;
  }

  Movie closeMovie(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = movies_.find(id);
    if (it == movies_.end()) {
      throw out_of_range("unknown Movie");
    }
    cout << "[MovieTicketBookingService.closeMovie] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct MovieTicketBookingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  MovieTicketBookingService system;
  cout << "========== STEP 2: Create Movie ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createMovie("alpha-movie");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createMovie("beta-movie");
  system.createTheatre("sample-theatre");
  system.createScreen("sample-screen");
  system.createShow("sample-show");
  system.createSeat("sample-seat");
  system.closeMovie(first.id());
  try {
    system.closeMovie(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getMovie("MISSING-ID");
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

type Movie struct {
  ID     string
  Name   string
  Status string
}

func NewMovie(id, name string) (*Movie, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Movie requires id and name")
  }
  obj := &Movie{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Movie.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Movie) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Movie invalid status")
  }
  fmt.Printf("[Movie.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Movie) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Movie %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Movie.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Theatre struct {
  ID     string
  Name   string
  Status string
}

func NewTheatre(id, name string) (*Theatre, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Theatre requires id and name")
  }
  obj := &Theatre{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Theatre.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Theatre) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Theatre invalid status")
  }
  fmt.Printf("[Theatre.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Theatre) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Theatre %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Theatre.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Screen struct {
  ID     string
  Name   string
  Status string
}

func NewScreen(id, name string) (*Screen, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Screen requires id and name")
  }
  obj := &Screen{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Screen.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Screen) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Screen invalid status")
  }
  fmt.Printf("[Screen.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Screen) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Screen %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Screen.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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


type Seat struct {
  ID     string
  Name   string
  Status string
}

func NewSeat(id, name string) (*Seat, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Seat requires id and name")
  }
  obj := &Seat{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Seat.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Seat) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Seat invalid status")
  }
  fmt.Printf("[Seat.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Seat) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Seat %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Seat.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type MovieTicketBookingService struct {
  mu  sync.Mutex
  seq int
  movies map[string]*Movie
  theatres map[string]*Theatre
  screens map[string]*Screen
  shows map[string]*Show
  seats map[string]*Seat
}

func NewMovieTicketBookingService() *MovieTicketBookingService {
  fmt.Println("[MovieTicketBookingService.__init__] system ready")
  return &MovieTicketBookingService{
    seq: 1,
    movies: map[string]*Movie{},
    theatres: map[string]*Theatre{},
    screens: map[string]*Screen{},
    shows: map[string]*Show{},
    seats: map[string]*Seat{},
  }
}

func (s *MovieTicketBookingService) CreateMovie(name string) (*Movie, error) {
  if name == "" {
    return nil, fmt.Errorf("Movie name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MOV-%04d", s.seq)
  s.seq++
  obj, err := NewMovie(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.movies[id] = obj
  fmt.Printf("[MovieTicketBookingService.CreateMovie] stored %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) GetMovie(id string) (*Movie, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.movies[id]
  if !ok {
    return nil, fmt.Errorf("unknown Movie id: %s", id)
  }
  fmt.Printf("[MovieTicketBookingService.GetMovie] found %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) CreateTheatre(name string) (*Theatre, error) {
  if name == "" {
    return nil, fmt.Errorf("Theatre name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("THE-%04d", s.seq)
  s.seq++
  obj, err := NewTheatre(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.theatres[id] = obj
  fmt.Printf("[MovieTicketBookingService.CreateTheatre] stored %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) GetTheatre(id string) (*Theatre, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.theatres[id]
  if !ok {
    return nil, fmt.Errorf("unknown Theatre id: %s", id)
  }
  fmt.Printf("[MovieTicketBookingService.GetTheatre] found %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) CreateScreen(name string) (*Screen, error) {
  if name == "" {
    return nil, fmt.Errorf("Screen name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SCR-%04d", s.seq)
  s.seq++
  obj, err := NewScreen(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.screens[id] = obj
  fmt.Printf("[MovieTicketBookingService.CreateScreen] stored %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) GetScreen(id string) (*Screen, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.screens[id]
  if !ok {
    return nil, fmt.Errorf("unknown Screen id: %s", id)
  }
  fmt.Printf("[MovieTicketBookingService.GetScreen] found %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) CreateShow(name string) (*Show, error) {
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
  fmt.Printf("[MovieTicketBookingService.CreateShow] stored %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) GetShow(id string) (*Show, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.shows[id]
  if !ok {
    return nil, fmt.Errorf("unknown Show id: %s", id)
  }
  fmt.Printf("[MovieTicketBookingService.GetShow] found %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) CreateSeat(name string) (*Seat, error) {
  if name == "" {
    return nil, fmt.Errorf("Seat name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SEA-%04d", s.seq)
  s.seq++
  obj, err := NewSeat(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.seats[id] = obj
  fmt.Printf("[MovieTicketBookingService.CreateSeat] stored %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) GetSeat(id string) (*Seat, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.seats[id]
  if !ok {
    return nil, fmt.Errorf("unknown Seat id: %s", id)
  }
  fmt.Printf("[MovieTicketBookingService.GetSeat] found %s\\n", id)
  return obj, nil
}

func (s *MovieTicketBookingService) CloseMovie(id string) (*Movie, error) {
  obj, err := s.GetMovie(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[MovieTicketBookingService.CloseMovie] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct MovieTicketBookingService ==========")
  system := NewMovieTicketBookingService()
  fmt.Println("========== STEP 2: Create Movie ==========")
  first, _ := system.CreateMovie("alpha-movie")
  system.CreateMovie("beta-movie")
  system.CreateTheatre("sample-theatre")
  system.CreateScreen("sample-screen")
  system.CreateShow("sample-show")
  system.CreateSeat("sample-seat")
  system.CloseMovie(first.ID)
  if _, err := system.CloseMovie(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetMovie("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Movie {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Movie(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Movie requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Movie.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Movie invalid status");
    }
    Console.WriteLine("[Movie.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Movie " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Movie.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Theatre {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Theatre(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Theatre requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Theatre.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Theatre invalid status");
    }
    Console.WriteLine("[Theatre.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Theatre " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Theatre.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Screen {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Screen(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Screen requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Screen.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Screen invalid status");
    }
    Console.WriteLine("[Screen.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Screen " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Screen.close] id=" + Id + " -> CLOSED");
  }
}


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


sealed class Seat {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Seat(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Seat requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Seat.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Seat invalid status");
    }
    Console.WriteLine("[Seat.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Seat " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Seat.close] id=" + Id + " -> CLOSED");
  }
}

sealed class MovieTicketBookingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Movie> _movies = new();
  private readonly Dictionary<string, Theatre> _theatres = new();
  private readonly Dictionary<string, Screen> _screens = new();
  private readonly Dictionary<string, Show> _shows = new();
  private readonly Dictionary<string, Seat> _seats = new();
  public MovieTicketBookingService() {
    Console.WriteLine("[MovieTicketBookingService.__init__] system ready");
  }

  public Movie CreateMovie(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Movie name required");
    }
    lock (_gate) {
      var id = string.Format("MOV-{0:D4}", _seq++);
      var obj = new Movie(id, name.Trim());
      obj.Validate();
      _movies[id] = obj;
      Console.WriteLine("[MovieTicketBookingService.CreateMovie] stored " + id);
      return obj;
    }
  }

  public Movie GetMovie(string id) {
    lock (_gate) {
      if (!_movies.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Movie id: " + id);
      }
      Console.WriteLine("[MovieTicketBookingService.GetMovie] found " + id);
      return obj;
    }
  }

  public Theatre CreateTheatre(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Theatre name required");
    }
    lock (_gate) {
      var id = string.Format("THE-{0:D4}", _seq++);
      var obj = new Theatre(id, name.Trim());
      obj.Validate();
      _theatres[id] = obj;
      Console.WriteLine("[MovieTicketBookingService.CreateTheatre] stored " + id);
      return obj;
    }
  }

  public Theatre GetTheatre(string id) {
    lock (_gate) {
      if (!_theatres.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Theatre id: " + id);
      }
      Console.WriteLine("[MovieTicketBookingService.GetTheatre] found " + id);
      return obj;
    }
  }

  public Screen CreateScreen(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Screen name required");
    }
    lock (_gate) {
      var id = string.Format("SCR-{0:D4}", _seq++);
      var obj = new Screen(id, name.Trim());
      obj.Validate();
      _screens[id] = obj;
      Console.WriteLine("[MovieTicketBookingService.CreateScreen] stored " + id);
      return obj;
    }
  }

  public Screen GetScreen(string id) {
    lock (_gate) {
      if (!_screens.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Screen id: " + id);
      }
      Console.WriteLine("[MovieTicketBookingService.GetScreen] found " + id);
      return obj;
    }
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
      Console.WriteLine("[MovieTicketBookingService.CreateShow] stored " + id);
      return obj;
    }
  }

  public Show GetShow(string id) {
    lock (_gate) {
      if (!_shows.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Show id: " + id);
      }
      Console.WriteLine("[MovieTicketBookingService.GetShow] found " + id);
      return obj;
    }
  }

  public Seat CreateSeat(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Seat name required");
    }
    lock (_gate) {
      var id = string.Format("SEA-{0:D4}", _seq++);
      var obj = new Seat(id, name.Trim());
      obj.Validate();
      _seats[id] = obj;
      Console.WriteLine("[MovieTicketBookingService.CreateSeat] stored " + id);
      return obj;
    }
  }

  public Seat GetSeat(string id) {
    lock (_gate) {
      if (!_seats.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Seat id: " + id);
      }
      Console.WriteLine("[MovieTicketBookingService.GetSeat] found " + id);
      return obj;
    }
  }

  public Movie CloseMovie(string id) {
    var obj = GetMovie(id);
    Console.WriteLine("[MovieTicketBookingService.CloseMovie] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct MovieTicketBookingService ==========");
    var system = new MovieTicketBookingService();
    Console.WriteLine("========== STEP 2: Create Movie ==========");
    var first = system.CreateMovie("alpha-movie");
    system.CreateMovie("beta-movie");
    system.CreateTheatre("sample-theatre");
    system.CreateScreen("sample-screen");
    system.CreateShow("sample-show");
    system.CreateSeat("sample-seat");
    system.CloseMovie(first.Id);
    try {
      system.CloseMovie(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetMovie("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const movieTicketBookingSolution: ProblemSolution = {
  slug: 'movie-ticket-booking',
  title: 'Movie Ticket Booking - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a system like BookMyShow — users can browse movies, select showtimes, pick seats, and book tickets. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Browse movies currently showing in theatres near the user',
      'View available showtimes for a movie',
      'Select seats from an interactive seat map',
      'Reserve seats for 10 minutes while payment is processed',
      'Book tickets and receive a confirmation with QR code',
      'Support cancellation with refund policy',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Browse movies currently showing in theatres near the user?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'View available showtimes for a movie?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Select seats from an interactive seat map?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Reserve seats for 10 minutes while payment is processed?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Book tickets and receive a confirmation with QR code?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. MovieTicketBookingService is the facade stereotype. Movie, Theatre, Screen, Show, Seat are concrete domain classes with id/name/status and validate/close.',
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
          'Construct MovieTicketBookingService.',
          'createMovie twice and create the related UML classes.',
          'closeMovie once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'MovieTicketBookingService', responsibility: 'UML facade - orchestrates Movie Ticket Booking.', keyMembers: ['create*', 'get*', 'closeMovie'] },
    { name: 'Movie', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Theatre', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Screen', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Show', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from MovieTicketBookingService to Movie, Theatre, Screen, Show, Seat. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on MovieTicketBookingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'MovieTicketBookingService', responsibility: 'UML facade - orchestrates Movie Ticket Booking.', keyMembers: ['create*', 'get*', 'closeMovie'] },
    { name: 'Movie', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Theatre', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Screen', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Show', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Movie Ticket Booking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'MovieTicketBookingService exposes create/get/close and owns composed collections.' },
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
      'main constructs MovieTicketBookingService, creates UML domain objects, closes the primary Movie, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct MovieTicketBookingService.',
      'createMovie for alpha and beta.',
      'create remaining UML classes.',
      'closeMovie(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createMovie("alpha..."); closeMovie(id)',
        output: '[Movie.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeMovie(alreadyClosed) or getMovie("MISSING-ID")',
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
