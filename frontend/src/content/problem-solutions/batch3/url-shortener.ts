import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'UrlShortenerService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_short_urls', 'Map<string, ShortURL>'),
    attr('-', '_original_urls', 'Map<string, OriginalURL>'),
    attr('-', '_click_events', 'Map<string, ClickEvent>'),
    attr('-', '_analyticss', 'Map<string, Analytics>'),
  ], [
    method('+', 'createShortURL', 'name: string', 'ShortURL'),
    method('+', 'createOriginalURL', 'name: string', 'OriginalURL'),
    method('+', 'createClickEvent', 'name: string', 'ClickEvent'),
    method('+', 'createAnalytics', 'name: string', 'Analytics'),
    method('+', 'getShortURL', 'id: string', 'ShortURL'),
    method('+', 'getOriginalURL', 'id: string', 'OriginalURL'),
    method('+', 'getClickEvent', 'id: string', 'ClickEvent'),
    method('+', 'getAnalytics', 'id: string', 'Analytics'),
    method('+', 'closeShortURL', 'id: string', 'ShortURL'),
  ], 'facade'),
  cls('n1', 'ShortURL', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'OriginalURL', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'ClickEvent', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Analytics', GRID.x(1), GRID.y(1), [
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
log = logging.getLogger("url-shortener")


class ShortURL:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ShortURL.id is required")
        if not name or not name.strip():
            raise ValueError("ShortURL.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ShortURL.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ShortURL {self.id} has invalid status={self.status}")
        log.info("[ShortURL.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ShortURL {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ShortURL.close] id=%s -> CLOSED", self.id)


class OriginalURL:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("OriginalURL.id is required")
        if not name or not name.strip():
            raise ValueError("OriginalURL.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[OriginalURL.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"OriginalURL {self.id} has invalid status={self.status}")
        log.info("[OriginalURL.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"OriginalURL {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[OriginalURL.close] id=%s -> CLOSED", self.id)


class ClickEvent:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ClickEvent.id is required")
        if not name or not name.strip():
            raise ValueError("ClickEvent.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ClickEvent.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ClickEvent {self.id} has invalid status={self.status}")
        log.info("[ClickEvent.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ClickEvent {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ClickEvent.close] id=%s -> CLOSED", self.id)


class Analytics:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Analytics.id is required")
        if not name or not name.strip():
            raise ValueError("Analytics.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Analytics.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Analytics {self.id} has invalid status={self.status}")
        log.info("[Analytics.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Analytics {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Analytics.close] id=%s -> CLOSED", self.id)


class UrlShortenerService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._short_urls: Dict[str, ShortURL] = {}
        self._original_urls: Dict[str, OriginalURL] = {}
        self._click_events: Dict[str, ClickEvent] = {}
        self._analyticss: Dict[str, Analytics] = {}
        log.info("[UrlShortenerService.__init__] system ready; managing: ShortURL, OriginalURL, ClickEvent, Analytics")

    def create_short_url(self, name: str) -> ShortURL:
        """UML: UrlShortenerService.create_short_url(name) -> ShortURL"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ShortURL name is required")
        with self._lock:
            item_id = f"SHO-{self._seq:04d}"
            self._seq += 1
            obj = ShortURL(item_id, cleaned)
            obj.validate()
            self._short_urls[item_id] = obj
            log.info("[UrlShortenerService.create_short_url] stored %s in _short_urls (count=%s)", item_id, len(self._short_urls))
            return obj

    def get_short_url(self, item_id: str) -> ShortURL:
        with self._lock:
            obj = self._short_urls.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ShortURL id: {item_id}")
            log.info("[UrlShortenerService.get_short_url] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_original_url(self, name: str) -> OriginalURL:
        """UML: UrlShortenerService.create_original_url(name) -> OriginalURL"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("OriginalURL name is required")
        with self._lock:
            item_id = f"ORI-{self._seq:04d}"
            self._seq += 1
            obj = OriginalURL(item_id, cleaned)
            obj.validate()
            self._original_urls[item_id] = obj
            log.info("[UrlShortenerService.create_original_url] stored %s in _original_urls (count=%s)", item_id, len(self._original_urls))
            return obj

    def get_original_url(self, item_id: str) -> OriginalURL:
        with self._lock:
            obj = self._original_urls.get(item_id)
            if obj is None:
                raise KeyError(f"unknown OriginalURL id: {item_id}")
            log.info("[UrlShortenerService.get_original_url] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_click_event(self, name: str) -> ClickEvent:
        """UML: UrlShortenerService.create_click_event(name) -> ClickEvent"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ClickEvent name is required")
        with self._lock:
            item_id = f"CLI-{self._seq:04d}"
            self._seq += 1
            obj = ClickEvent(item_id, cleaned)
            obj.validate()
            self._click_events[item_id] = obj
            log.info("[UrlShortenerService.create_click_event] stored %s in _click_events (count=%s)", item_id, len(self._click_events))
            return obj

    def get_click_event(self, item_id: str) -> ClickEvent:
        with self._lock:
            obj = self._click_events.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ClickEvent id: {item_id}")
            log.info("[UrlShortenerService.get_click_event] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_analytics(self, name: str) -> Analytics:
        """UML: UrlShortenerService.create_analytics(name) -> Analytics"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Analytics name is required")
        with self._lock:
            item_id = f"ANA-{self._seq:04d}"
            self._seq += 1
            obj = Analytics(item_id, cleaned)
            obj.validate()
            self._analyticss[item_id] = obj
            log.info("[UrlShortenerService.create_analytics] stored %s in _analyticss (count=%s)", item_id, len(self._analyticss))
            return obj

    def get_analytics(self, item_id: str) -> Analytics:
        with self._lock:
            obj = self._analyticss.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Analytics id: {item_id}")
            log.info("[UrlShortenerService.get_analytics] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_short_url(self, item_id: str) -> ShortURL:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._short_urls.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ShortURL id: {item_id}")
            log.info("[UrlShortenerService.close_short_url] closing %s via ShortURL.close()", item_id)
            obj.close()
            return obj

    def list_active_short_urls(self) -> List[ShortURL]:
        with self._lock:
            active = [o for o in self._short_urls.values() if o.status == "ACTIVE"]
            log.info("[UrlShortenerService.list_active_short_urls] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct UrlShortenerService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = UrlShortenerService()

    log.info("========== STEP 2: Create primary ShortURL objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_short_url("alpha-short_url")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_short_url("beta-short_url")

    log.info("========== STEP 3: Create OriginalURL (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_original_url("sample-original_url")

    log.info("========== STEP 4: Create ClickEvent (UML class) ==========")
    system.create_click_event("sample-click_event")

    log.info("========== STEP 5: Create Analytics (UML class) ==========")
    system.create_analytics("sample-analytics")

    log.info("========== STEP 6: Inspect active ShortURL list ==========")
    system.list_active_short_urls()

    log.info("========== STEP 7: Close first ShortURL ==========")
    system.close_short_url(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_short_url(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from ShortURL.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_short_url("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_short_url: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_short_urls()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class ShortURL {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ShortURL(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ShortURL.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ShortURL.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ShortURL.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ShortURL " + id + " invalid status");
    }
    System.out.println("[ShortURL.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ShortURL " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ShortURL.close] id=" + id + " -> CLOSED");
  }
}


class OriginalURL {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  OriginalURL(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("OriginalURL.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OriginalURL.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[OriginalURL.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("OriginalURL " + id + " invalid status");
    }
    System.out.println("[OriginalURL.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("OriginalURL " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[OriginalURL.close] id=" + id + " -> CLOSED");
  }
}


class ClickEvent {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ClickEvent(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ClickEvent.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ClickEvent.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ClickEvent.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ClickEvent " + id + " invalid status");
    }
    System.out.println("[ClickEvent.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ClickEvent " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ClickEvent.close] id=" + id + " -> CLOSED");
  }
}


class Analytics {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Analytics(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Analytics.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Analytics.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Analytics.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Analytics " + id + " invalid status");
    }
    System.out.println("[Analytics.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Analytics " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Analytics.close] id=" + id + " -> CLOSED");
  }
}

public class UrlShortenerService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, ShortURL> short_urls = new LinkedHashMap<>();
  private final Map<String, OriginalURL> original_urls = new LinkedHashMap<>();
  private final Map<String, ClickEvent> click_events = new LinkedHashMap<>();
  private final Map<String, Analytics> analyticss = new LinkedHashMap<>();

  public UrlShortenerService() {
    System.out.println("[UrlShortenerService.__init__] system ready");
  }

  public ShortURL createShortURL(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ShortURL name required");
    }
    lock.lock();
    try {
      String id = String.format("SHO-%04d", seq++);
      ShortURL obj = new ShortURL(id, name.trim());
      obj.validate();
      short_urls.put(id, obj);
      System.out.println("[UrlShortenerService.createShortURL] stored " + id + " count=" + short_urls.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ShortURL getShortURL(String id) {
    lock.lock();
    try {
      ShortURL obj = short_urls.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ShortURL id: " + id);
      }
      System.out.println("[UrlShortenerService.getShortURL] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public OriginalURL createOriginalURL(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OriginalURL name required");
    }
    lock.lock();
    try {
      String id = String.format("ORI-%04d", seq++);
      OriginalURL obj = new OriginalURL(id, name.trim());
      obj.validate();
      original_urls.put(id, obj);
      System.out.println("[UrlShortenerService.createOriginalURL] stored " + id + " count=" + original_urls.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public OriginalURL getOriginalURL(String id) {
    lock.lock();
    try {
      OriginalURL obj = original_urls.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown OriginalURL id: " + id);
      }
      System.out.println("[UrlShortenerService.getOriginalURL] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ClickEvent createClickEvent(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ClickEvent name required");
    }
    lock.lock();
    try {
      String id = String.format("CLI-%04d", seq++);
      ClickEvent obj = new ClickEvent(id, name.trim());
      obj.validate();
      click_events.put(id, obj);
      System.out.println("[UrlShortenerService.createClickEvent] stored " + id + " count=" + click_events.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ClickEvent getClickEvent(String id) {
    lock.lock();
    try {
      ClickEvent obj = click_events.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ClickEvent id: " + id);
      }
      System.out.println("[UrlShortenerService.getClickEvent] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Analytics createAnalytics(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Analytics name required");
    }
    lock.lock();
    try {
      String id = String.format("ANA-%04d", seq++);
      Analytics obj = new Analytics(id, name.trim());
      obj.validate();
      analyticss.put(id, obj);
      System.out.println("[UrlShortenerService.createAnalytics] stored " + id + " count=" + analyticss.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Analytics getAnalytics(String id) {
    lock.lock();
    try {
      Analytics obj = analyticss.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Analytics id: " + id);
      }
      System.out.println("[UrlShortenerService.getAnalytics] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ShortURL closeShortURL(String id) {
    lock.lock();
    try {
      ShortURL obj = short_urls.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ShortURL id: " + id);
      }
      System.out.println("[UrlShortenerService.closeShortURL] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<ShortURL> listActiveShortURLs() {
    lock.lock();
    try {
      List<ShortURL> out = new ArrayList<>();
      for (ShortURL o : short_urls.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[UrlShortenerService.listActiveShortURLs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct UrlShortenerService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    UrlShortenerService system = new UrlShortenerService();
    System.out.println("========== STEP 2: Create ShortURL objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    ShortURL first = system.createShortURL("alpha-short_url");
    system.createShortURL("beta-short_url");
    System.out.println("========== STEP 3: Create OriginalURL ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createOriginalURL("sample-original_url");
    System.out.println("========== STEP 4: Create ClickEvent ==========");
    system.createClickEvent("sample-click_event");
    System.out.println("========== STEP 5: Create Analytics ==========");
    system.createAnalytics("sample-analytics");
    System.out.println("========== Inspect active list ==========");
    system.listActiveShortURLs();
    System.out.println("========== Close first ShortURL ==========");
    system.closeShortURL(first.getId());
    try {
      system.closeShortURL(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getShortURL("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class ShortURL {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ShortURL.id required')
    }

    if (!name?.trim()) {
      throw new Error('ShortURL.name required')
    }
    console.log(\`[ShortURL.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ShortURL \${this.id} invalid status\`)
    }
    console.log(\`[ShortURL.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ShortURL \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ShortURL.close] id=\${this.id} -> CLOSED\`)
  }
}


class OriginalURL {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('OriginalURL.id required')
    }

    if (!name?.trim()) {
      throw new Error('OriginalURL.name required')
    }
    console.log(\`[OriginalURL.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`OriginalURL \${this.id} invalid status\`)
    }
    console.log(\`[OriginalURL.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`OriginalURL \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[OriginalURL.close] id=\${this.id} -> CLOSED\`)
  }
}


class ClickEvent {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ClickEvent.id required')
    }

    if (!name?.trim()) {
      throw new Error('ClickEvent.name required')
    }
    console.log(\`[ClickEvent.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ClickEvent \${this.id} invalid status\`)
    }
    console.log(\`[ClickEvent.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ClickEvent \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ClickEvent.close] id=\${this.id} -> CLOSED\`)
  }
}


class Analytics {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Analytics.id required')
    }

    if (!name?.trim()) {
      throw new Error('Analytics.name required')
    }
    console.log(\`[Analytics.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Analytics \${this.id} invalid status\`)
    }
    console.log(\`[Analytics.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Analytics \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Analytics.close] id=\${this.id} -> CLOSED\`)
  }
}

class UrlShortenerService {
  private seq = 1
  private short_urls = new Map<string, ShortURL>()
  private original_urls = new Map<string, OriginalURL>()
  private click_events = new Map<string, ClickEvent>()
  private analyticss = new Map<string, Analytics>()
  constructor() {
    console.log('[UrlShortenerService.__init__] system ready')
  }

  createShortURL(name: string): ShortURL {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ShortURL name required')
    }
    const id = \`SHO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ShortURL(id, cleaned)
    obj.validate()
    this.short_urls.set(id, obj)
    console.log(\`[UrlShortenerService.createShortURL] stored \${id} count=\${this.short_urls.size}\`)
    return obj
  }

  getShortURL(id: string): ShortURL {
    const obj = this.short_urls.get(id)
    if (!obj) {
      throw new Error(\`unknown ShortURL id: \${id}\`)
    }
    console.log(\`[UrlShortenerService.getShortURL] found id=\${obj.id}\`)
    return obj
  }

  createOriginalURL(name: string): OriginalURL {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('OriginalURL name required')
    }
    const id = \`ORI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new OriginalURL(id, cleaned)
    obj.validate()
    this.original_urls.set(id, obj)
    console.log(\`[UrlShortenerService.createOriginalURL] stored \${id} count=\${this.original_urls.size}\`)
    return obj
  }

  getOriginalURL(id: string): OriginalURL {
    const obj = this.original_urls.get(id)
    if (!obj) {
      throw new Error(\`unknown OriginalURL id: \${id}\`)
    }
    console.log(\`[UrlShortenerService.getOriginalURL] found id=\${obj.id}\`)
    return obj
  }

  createClickEvent(name: string): ClickEvent {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ClickEvent name required')
    }
    const id = \`CLI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ClickEvent(id, cleaned)
    obj.validate()
    this.click_events.set(id, obj)
    console.log(\`[UrlShortenerService.createClickEvent] stored \${id} count=\${this.click_events.size}\`)
    return obj
  }

  getClickEvent(id: string): ClickEvent {
    const obj = this.click_events.get(id)
    if (!obj) {
      throw new Error(\`unknown ClickEvent id: \${id}\`)
    }
    console.log(\`[UrlShortenerService.getClickEvent] found id=\${obj.id}\`)
    return obj
  }

  createAnalytics(name: string): Analytics {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Analytics name required')
    }
    const id = \`ANA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Analytics(id, cleaned)
    obj.validate()
    this.analyticss.set(id, obj)
    console.log(\`[UrlShortenerService.createAnalytics] stored \${id} count=\${this.analyticss.size}\`)
    return obj
  }

  getAnalytics(id: string): Analytics {
    const obj = this.analyticss.get(id)
    if (!obj) {
      throw new Error(\`unknown Analytics id: \${id}\`)
    }
    console.log(\`[UrlShortenerService.getAnalytics] found id=\${obj.id}\`)
    return obj
  }

  closeShortURL(id: string): ShortURL {
    const obj = this.getShortURL(id)
    console.log(\`[UrlShortenerService.closeShortURL] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveShortURLs(): ShortURL[] {
    const active = [...this.short_urls.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[UrlShortenerService.listActiveShortURLs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct UrlShortenerService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new UrlShortenerService()
  console.log('========== STEP 2: Create ShortURL objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createShortURL('alpha-short_url')
  system.createShortURL('beta-short_url')
  console.log('========== STEP 3: Create OriginalURL ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createOriginalURL('sample-original_url')
  console.log('========== STEP 4: Create ClickEvent ==========')
  system.createClickEvent('sample-click_event')
  console.log('========== STEP 5: Create Analytics ==========')
  system.createAnalytics('sample-analytics')
  system.listActiveShortURLs()
  console.log('========== Close first ShortURL ==========')
  system.closeShortURL(first.id)
  try {
    system.closeShortURL(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getShortURL('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class ShortURL {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ShortURL(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ShortURL requires id and name");
    }
    cout << "[ShortURL.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ShortURL invalid status");
    }
    cout << "[ShortURL.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ShortURL cannot close");
    }
    status_ = "CLOSED";
    cout << "[ShortURL.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class OriginalURL {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  OriginalURL(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("OriginalURL requires id and name");
    }
    cout << "[OriginalURL.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("OriginalURL invalid status");
    }
    cout << "[OriginalURL.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("OriginalURL cannot close");
    }
    status_ = "CLOSED";
    cout << "[OriginalURL.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ClickEvent {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ClickEvent(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ClickEvent requires id and name");
    }
    cout << "[ClickEvent.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ClickEvent invalid status");
    }
    cout << "[ClickEvent.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ClickEvent cannot close");
    }
    status_ = "CLOSED";
    cout << "[ClickEvent.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Analytics {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Analytics(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Analytics requires id and name");
    }
    cout << "[Analytics.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Analytics invalid status");
    }
    cout << "[Analytics.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Analytics cannot close");
    }
    status_ = "CLOSED";
    cout << "[Analytics.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class UrlShortenerService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, ShortURL> short_urls_;
  unordered_map<string, OriginalURL> original_urls_;
  unordered_map<string, ClickEvent> click_events_;
  unordered_map<string, Analytics> analyticss_;
public:
  UrlShortenerService() {
    cout << "[UrlShortenerService.__init__] system ready" << endl;
  }

  ShortURL createShortURL(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ShortURL name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SHO-%04d", seq_++);
    ShortURL obj{buf, name};
    obj.validate();
    short_urls_.emplace(obj.id(), obj);
    cout << "[UrlShortenerService.createShortURL] stored " << obj.id() << endl;
    return obj;
  }

  ShortURL getShortURL(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = short_urls_.find(id);
    if (it == short_urls_.end()) {
      throw out_of_range("unknown ShortURL id");
    }
    cout << "[UrlShortenerService.getShortURL] found " << id << endl;
    return it->second;
  }

  OriginalURL createOriginalURL(const string& name) {
    if (name.empty()) {
      throw invalid_argument("OriginalURL name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ORI-%04d", seq_++);
    OriginalURL obj{buf, name};
    obj.validate();
    original_urls_.emplace(obj.id(), obj);
    cout << "[UrlShortenerService.createOriginalURL] stored " << obj.id() << endl;
    return obj;
  }

  OriginalURL getOriginalURL(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = original_urls_.find(id);
    if (it == original_urls_.end()) {
      throw out_of_range("unknown OriginalURL id");
    }
    cout << "[UrlShortenerService.getOriginalURL] found " << id << endl;
    return it->second;
  }

  ClickEvent createClickEvent(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ClickEvent name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CLI-%04d", seq_++);
    ClickEvent obj{buf, name};
    obj.validate();
    click_events_.emplace(obj.id(), obj);
    cout << "[UrlShortenerService.createClickEvent] stored " << obj.id() << endl;
    return obj;
  }

  ClickEvent getClickEvent(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = click_events_.find(id);
    if (it == click_events_.end()) {
      throw out_of_range("unknown ClickEvent id");
    }
    cout << "[UrlShortenerService.getClickEvent] found " << id << endl;
    return it->second;
  }

  Analytics createAnalytics(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Analytics name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ANA-%04d", seq_++);
    Analytics obj{buf, name};
    obj.validate();
    analyticss_.emplace(obj.id(), obj);
    cout << "[UrlShortenerService.createAnalytics] stored " << obj.id() << endl;
    return obj;
  }

  Analytics getAnalytics(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = analyticss_.find(id);
    if (it == analyticss_.end()) {
      throw out_of_range("unknown Analytics id");
    }
    cout << "[UrlShortenerService.getAnalytics] found " << id << endl;
    return it->second;
  }

  ShortURL closeShortURL(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = short_urls_.find(id);
    if (it == short_urls_.end()) {
      throw out_of_range("unknown ShortURL");
    }
    cout << "[UrlShortenerService.closeShortURL] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct UrlShortenerService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  UrlShortenerService system;
  cout << "========== STEP 2: Create ShortURL ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createShortURL("alpha-short_url");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createShortURL("beta-short_url");
  system.createOriginalURL("sample-original_url");
  system.createClickEvent("sample-click_event");
  system.createAnalytics("sample-analytics");
  system.closeShortURL(first.id());
  try {
    system.closeShortURL(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getShortURL("MISSING-ID");
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

type ShortURL struct {
  ID     string
  Name   string
  Status string
}

func NewShortURL(id, name string) (*ShortURL, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ShortURL requires id and name")
  }
  obj := &ShortURL{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ShortURL.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ShortURL) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ShortURL invalid status")
  }
  fmt.Printf("[ShortURL.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ShortURL) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ShortURL %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ShortURL.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type OriginalURL struct {
  ID     string
  Name   string
  Status string
}

func NewOriginalURL(id, name string) (*OriginalURL, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("OriginalURL requires id and name")
  }
  obj := &OriginalURL{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[OriginalURL.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *OriginalURL) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("OriginalURL invalid status")
  }
  fmt.Printf("[OriginalURL.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *OriginalURL) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("OriginalURL %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[OriginalURL.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ClickEvent struct {
  ID     string
  Name   string
  Status string
}

func NewClickEvent(id, name string) (*ClickEvent, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ClickEvent requires id and name")
  }
  obj := &ClickEvent{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ClickEvent.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ClickEvent) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ClickEvent invalid status")
  }
  fmt.Printf("[ClickEvent.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ClickEvent) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ClickEvent %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ClickEvent.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Analytics struct {
  ID     string
  Name   string
  Status string
}

func NewAnalytics(id, name string) (*Analytics, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Analytics requires id and name")
  }
  obj := &Analytics{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Analytics.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Analytics) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Analytics invalid status")
  }
  fmt.Printf("[Analytics.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Analytics) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Analytics %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Analytics.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type UrlShortenerService struct {
  mu  sync.Mutex
  seq int
  short_urls map[string]*ShortURL
  original_urls map[string]*OriginalURL
  click_events map[string]*ClickEvent
  analyticss map[string]*Analytics
}

func NewUrlShortenerService() *UrlShortenerService {
  fmt.Println("[UrlShortenerService.__init__] system ready")
  return &UrlShortenerService{
    seq: 1,
    short_urls: map[string]*ShortURL{},
    original_urls: map[string]*OriginalURL{},
    click_events: map[string]*ClickEvent{},
    analyticss: map[string]*Analytics{},
  }
}

func (s *UrlShortenerService) CreateShortURL(name string) (*ShortURL, error) {
  if name == "" {
    return nil, fmt.Errorf("ShortURL name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SHO-%04d", s.seq)
  s.seq++
  obj, err := NewShortURL(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.short_urls[id] = obj
  fmt.Printf("[UrlShortenerService.CreateShortURL] stored %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) GetShortURL(id string) (*ShortURL, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.short_urls[id]
  if !ok {
    return nil, fmt.Errorf("unknown ShortURL id: %s", id)
  }
  fmt.Printf("[UrlShortenerService.GetShortURL] found %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) CreateOriginalURL(name string) (*OriginalURL, error) {
  if name == "" {
    return nil, fmt.Errorf("OriginalURL name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ORI-%04d", s.seq)
  s.seq++
  obj, err := NewOriginalURL(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.original_urls[id] = obj
  fmt.Printf("[UrlShortenerService.CreateOriginalURL] stored %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) GetOriginalURL(id string) (*OriginalURL, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.original_urls[id]
  if !ok {
    return nil, fmt.Errorf("unknown OriginalURL id: %s", id)
  }
  fmt.Printf("[UrlShortenerService.GetOriginalURL] found %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) CreateClickEvent(name string) (*ClickEvent, error) {
  if name == "" {
    return nil, fmt.Errorf("ClickEvent name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CLI-%04d", s.seq)
  s.seq++
  obj, err := NewClickEvent(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.click_events[id] = obj
  fmt.Printf("[UrlShortenerService.CreateClickEvent] stored %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) GetClickEvent(id string) (*ClickEvent, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.click_events[id]
  if !ok {
    return nil, fmt.Errorf("unknown ClickEvent id: %s", id)
  }
  fmt.Printf("[UrlShortenerService.GetClickEvent] found %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) CreateAnalytics(name string) (*Analytics, error) {
  if name == "" {
    return nil, fmt.Errorf("Analytics name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ANA-%04d", s.seq)
  s.seq++
  obj, err := NewAnalytics(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.analyticss[id] = obj
  fmt.Printf("[UrlShortenerService.CreateAnalytics] stored %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) GetAnalytics(id string) (*Analytics, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.analyticss[id]
  if !ok {
    return nil, fmt.Errorf("unknown Analytics id: %s", id)
  }
  fmt.Printf("[UrlShortenerService.GetAnalytics] found %s\\n", id)
  return obj, nil
}

func (s *UrlShortenerService) CloseShortURL(id string) (*ShortURL, error) {
  obj, err := s.GetShortURL(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[UrlShortenerService.CloseShortURL] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct UrlShortenerService ==========")
  system := NewUrlShortenerService()
  fmt.Println("========== STEP 2: Create ShortURL ==========")
  first, _ := system.CreateShortURL("alpha-short_url")
  system.CreateShortURL("beta-short_url")
  system.CreateOriginalURL("sample-original_url")
  system.CreateClickEvent("sample-click_event")
  system.CreateAnalytics("sample-analytics")
  system.CloseShortURL(first.ID)
  if _, err := system.CloseShortURL(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetShortURL("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class ShortURL {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ShortURL(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ShortURL requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ShortURL.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ShortURL invalid status");
    }
    Console.WriteLine("[ShortURL.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ShortURL " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ShortURL.close] id=" + Id + " -> CLOSED");
  }
}


sealed class OriginalURL {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public OriginalURL(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OriginalURL requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[OriginalURL.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("OriginalURL invalid status");
    }
    Console.WriteLine("[OriginalURL.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("OriginalURL " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[OriginalURL.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ClickEvent {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ClickEvent(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ClickEvent requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ClickEvent.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ClickEvent invalid status");
    }
    Console.WriteLine("[ClickEvent.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ClickEvent " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ClickEvent.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Analytics {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Analytics(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Analytics requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Analytics.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Analytics invalid status");
    }
    Console.WriteLine("[Analytics.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Analytics " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Analytics.close] id=" + Id + " -> CLOSED");
  }
}

sealed class UrlShortenerService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, ShortURL> _short_urls = new();
  private readonly Dictionary<string, OriginalURL> _original_urls = new();
  private readonly Dictionary<string, ClickEvent> _click_events = new();
  private readonly Dictionary<string, Analytics> _analyticss = new();
  public UrlShortenerService() {
    Console.WriteLine("[UrlShortenerService.__init__] system ready");
  }

  public ShortURL CreateShortURL(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ShortURL name required");
    }
    lock (_gate) {
      var id = string.Format("SHO-{0:D4}", _seq++);
      var obj = new ShortURL(id, name.Trim());
      obj.Validate();
      _short_urls[id] = obj;
      Console.WriteLine("[UrlShortenerService.CreateShortURL] stored " + id);
      return obj;
    }
  }

  public ShortURL GetShortURL(string id) {
    lock (_gate) {
      if (!_short_urls.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ShortURL id: " + id);
      }
      Console.WriteLine("[UrlShortenerService.GetShortURL] found " + id);
      return obj;
    }
  }

  public OriginalURL CreateOriginalURL(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OriginalURL name required");
    }
    lock (_gate) {
      var id = string.Format("ORI-{0:D4}", _seq++);
      var obj = new OriginalURL(id, name.Trim());
      obj.Validate();
      _original_urls[id] = obj;
      Console.WriteLine("[UrlShortenerService.CreateOriginalURL] stored " + id);
      return obj;
    }
  }

  public OriginalURL GetOriginalURL(string id) {
    lock (_gate) {
      if (!_original_urls.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown OriginalURL id: " + id);
      }
      Console.WriteLine("[UrlShortenerService.GetOriginalURL] found " + id);
      return obj;
    }
  }

  public ClickEvent CreateClickEvent(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ClickEvent name required");
    }
    lock (_gate) {
      var id = string.Format("CLI-{0:D4}", _seq++);
      var obj = new ClickEvent(id, name.Trim());
      obj.Validate();
      _click_events[id] = obj;
      Console.WriteLine("[UrlShortenerService.CreateClickEvent] stored " + id);
      return obj;
    }
  }

  public ClickEvent GetClickEvent(string id) {
    lock (_gate) {
      if (!_click_events.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ClickEvent id: " + id);
      }
      Console.WriteLine("[UrlShortenerService.GetClickEvent] found " + id);
      return obj;
    }
  }

  public Analytics CreateAnalytics(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Analytics name required");
    }
    lock (_gate) {
      var id = string.Format("ANA-{0:D4}", _seq++);
      var obj = new Analytics(id, name.Trim());
      obj.Validate();
      _analyticss[id] = obj;
      Console.WriteLine("[UrlShortenerService.CreateAnalytics] stored " + id);
      return obj;
    }
  }

  public Analytics GetAnalytics(string id) {
    lock (_gate) {
      if (!_analyticss.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Analytics id: " + id);
      }
      Console.WriteLine("[UrlShortenerService.GetAnalytics] found " + id);
      return obj;
    }
  }

  public ShortURL CloseShortURL(string id) {
    var obj = GetShortURL(id);
    Console.WriteLine("[UrlShortenerService.CloseShortURL] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct UrlShortenerService ==========");
    var system = new UrlShortenerService();
    Console.WriteLine("========== STEP 2: Create ShortURL ==========");
    var first = system.CreateShortURL("alpha-short_url");
    system.CreateShortURL("beta-short_url");
    system.CreateOriginalURL("sample-original_url");
    system.CreateClickEvent("sample-click_event");
    system.CreateAnalytics("sample-analytics");
    system.CloseShortURL(first.Id);
    try {
      system.CloseShortURL(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetShortURL("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const urlShortenerSolution: ProblemSolution = {
  slug: 'url-shortener',
  title: 'URL Shortener (bit.ly) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a URL shortening service at massive scale — generating unique short codes, redirecting users, and providing analytics. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Shorten a long URL to a 7-character unique code',
      'Redirect short URL to the original URL with < 10ms latency',
      'Custom aliases (e.g., bit.ly/my-brand)',
      'Optional expiration date on short URLs',
      'Click analytics: total clicks, unique visitors, country, device',
      'Bulk URL shortening via API',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Shorten a long URL to a 7-character unique code?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Redirect short URL to the original URL with < 10ms latency?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Custom aliases (e.g., bit.ly/my-brand)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Optional expiration date on short URLs?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Click analytics: total clicks, unique visitors, country, device?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. UrlShortenerService is the facade stereotype. ShortURL, OriginalURL, ClickEvent, Analytics are concrete domain classes with id/name/status and validate/close.',
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
          'Construct UrlShortenerService.',
          'createShortURL twice and create the related UML classes.',
          'closeShortURL once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'UrlShortenerService', responsibility: 'UML facade - orchestrates URL Shortener (bit.ly).', keyMembers: ['create*', 'get*', 'closeShortURL'] },
    { name: 'ShortURL', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OriginalURL', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ClickEvent', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Analytics', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from UrlShortenerService to ShortURL, OriginalURL, ClickEvent, Analytics. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on UrlShortenerService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'UrlShortenerService', responsibility: 'UML facade - orchestrates URL Shortener (bit.ly).', keyMembers: ['create*', 'get*', 'closeShortURL'] },
    { name: 'ShortURL', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OriginalURL', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ClickEvent', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Analytics', responsibility: 'UML class - domain object for URL Shortener (bit.ly).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'UrlShortenerService exposes create/get/close and owns composed collections.' },
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
      'main constructs UrlShortenerService, creates UML domain objects, closes the primary ShortURL, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct UrlShortenerService.',
      'createShortURL for alpha and beta.',
      'create remaining UML classes.',
      'closeShortURL(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createShortURL("alpha..."); closeShortURL(id)',
        output: '[ShortURL.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeShortURL(alreadyClosed) or getShortURL("MISSING-ID")',
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
