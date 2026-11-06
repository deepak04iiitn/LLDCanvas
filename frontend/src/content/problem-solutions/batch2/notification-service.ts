import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'NotificationServiceService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_notifications', 'Map<string, Notification>'),
    attr('-', '_notification_types', 'Map<string, NotificationType>'),
    attr('-', '_channels', 'Map<string, Channel>'),
    attr('-', '_templates', 'Map<string, Template>'),
    attr('-', '_user_preferences', 'Map<string, UserPreference>'),
  ], [
    method('+', 'createNotification', 'name: string', 'Notification'),
    method('+', 'createNotificationType', 'name: string', 'NotificationType'),
    method('+', 'createChannel', 'name: string', 'Channel'),
    method('+', 'createTemplate', 'name: string', 'Template'),
    method('+', 'createUserPreference', 'name: string', 'UserPreference'),
    method('+', 'getNotification', 'id: string', 'Notification'),
    method('+', 'getNotificationType', 'id: string', 'NotificationType'),
    method('+', 'getChannel', 'id: string', 'Channel'),
    method('+', 'getTemplate', 'id: string', 'Template'),
    method('+', 'getUserPreference', 'id: string', 'UserPreference'),
    method('+', 'closeNotification', 'id: string', 'Notification'),
  ], 'facade'),
  cls('n1', 'Notification', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'NotificationType', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Channel', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Template', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'UserPreference', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("notification-service")


class Notification:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Notification.id is required")
        if not name or not name.strip():
            raise ValueError("Notification.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Notification.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Notification {self.id} has invalid status={self.status}")
        log.info("[Notification.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Notification {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Notification.close] id=%s -> CLOSED", self.id)


class NotificationType:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("NotificationType.id is required")
        if not name or not name.strip():
            raise ValueError("NotificationType.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[NotificationType.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"NotificationType {self.id} has invalid status={self.status}")
        log.info("[NotificationType.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"NotificationType {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[NotificationType.close] id=%s -> CLOSED", self.id)


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


class Template:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Template.id is required")
        if not name or not name.strip():
            raise ValueError("Template.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Template.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Template {self.id} has invalid status={self.status}")
        log.info("[Template.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Template {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Template.close] id=%s -> CLOSED", self.id)


class UserPreference:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("UserPreference.id is required")
        if not name or not name.strip():
            raise ValueError("UserPreference.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[UserPreference.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"UserPreference {self.id} has invalid status={self.status}")
        log.info("[UserPreference.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"UserPreference {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[UserPreference.close] id=%s -> CLOSED", self.id)


class NotificationServiceService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._notifications: Dict[str, Notification] = {}
        self._notification_types: Dict[str, NotificationType] = {}
        self._channels: Dict[str, Channel] = {}
        self._templates: Dict[str, Template] = {}
        self._user_preferences: Dict[str, UserPreference] = {}
        log.info("[NotificationServiceService.__init__] system ready; managing: Notification, NotificationType, Channel, Template, UserPreference")

    def create_notification(self, name: str) -> Notification:
        """UML: NotificationServiceService.create_notification(name) -> Notification"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Notification name is required")
        with self._lock:
            item_id = f"NOT-{self._seq:04d}"
            self._seq += 1
            obj = Notification(item_id, cleaned)
            obj.validate()
            self._notifications[item_id] = obj
            log.info("[NotificationServiceService.create_notification] stored %s in _notifications (count=%s)", item_id, len(self._notifications))
            return obj

    def get_notification(self, item_id: str) -> Notification:
        with self._lock:
            obj = self._notifications.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Notification id: {item_id}")
            log.info("[NotificationServiceService.get_notification] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_notification_type(self, name: str) -> NotificationType:
        """UML: NotificationServiceService.create_notification_type(name) -> NotificationType"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("NotificationType name is required")
        with self._lock:
            item_id = f"NOT-{self._seq:04d}"
            self._seq += 1
            obj = NotificationType(item_id, cleaned)
            obj.validate()
            self._notification_types[item_id] = obj
            log.info("[NotificationServiceService.create_notification_type] stored %s in _notification_types (count=%s)", item_id, len(self._notification_types))
            return obj

    def get_notification_type(self, item_id: str) -> NotificationType:
        with self._lock:
            obj = self._notification_types.get(item_id)
            if obj is None:
                raise KeyError(f"unknown NotificationType id: {item_id}")
            log.info("[NotificationServiceService.get_notification_type] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_channel(self, name: str) -> Channel:
        """UML: NotificationServiceService.create_channel(name) -> Channel"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Channel name is required")
        with self._lock:
            item_id = f"CHA-{self._seq:04d}"
            self._seq += 1
            obj = Channel(item_id, cleaned)
            obj.validate()
            self._channels[item_id] = obj
            log.info("[NotificationServiceService.create_channel] stored %s in _channels (count=%s)", item_id, len(self._channels))
            return obj

    def get_channel(self, item_id: str) -> Channel:
        with self._lock:
            obj = self._channels.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Channel id: {item_id}")
            log.info("[NotificationServiceService.get_channel] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_template(self, name: str) -> Template:
        """UML: NotificationServiceService.create_template(name) -> Template"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Template name is required")
        with self._lock:
            item_id = f"TEM-{self._seq:04d}"
            self._seq += 1
            obj = Template(item_id, cleaned)
            obj.validate()
            self._templates[item_id] = obj
            log.info("[NotificationServiceService.create_template] stored %s in _templates (count=%s)", item_id, len(self._templates))
            return obj

    def get_template(self, item_id: str) -> Template:
        with self._lock:
            obj = self._templates.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Template id: {item_id}")
            log.info("[NotificationServiceService.get_template] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_user_preference(self, name: str) -> UserPreference:
        """UML: NotificationServiceService.create_user_preference(name) -> UserPreference"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("UserPreference name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = UserPreference(item_id, cleaned)
            obj.validate()
            self._user_preferences[item_id] = obj
            log.info("[NotificationServiceService.create_user_preference] stored %s in _user_preferences (count=%s)", item_id, len(self._user_preferences))
            return obj

    def get_user_preference(self, item_id: str) -> UserPreference:
        with self._lock:
            obj = self._user_preferences.get(item_id)
            if obj is None:
                raise KeyError(f"unknown UserPreference id: {item_id}")
            log.info("[NotificationServiceService.get_user_preference] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_notification(self, item_id: str) -> Notification:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._notifications.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Notification id: {item_id}")
            log.info("[NotificationServiceService.close_notification] closing %s via Notification.close()", item_id)
            obj.close()
            return obj

    def list_active_notifications(self) -> List[Notification]:
        with self._lock:
            active = [o for o in self._notifications.values() if o.status == "ACTIVE"]
            log.info("[NotificationServiceService.list_active_notifications] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct NotificationServiceService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = NotificationServiceService()

    log.info("========== STEP 2: Create primary Notification objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_notification("alpha-notification")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_notification("beta-notification")

    log.info("========== STEP 3: Create NotificationType (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_notification_type("sample-notification_type")

    log.info("========== STEP 4: Create Channel (UML class) ==========")
    system.create_channel("sample-channel")

    log.info("========== STEP 5: Create Template (UML class) ==========")
    system.create_template("sample-template")

    log.info("========== STEP 6: Create UserPreference (UML class) ==========")
    system.create_user_preference("sample-user_preference")

    log.info("========== STEP 7: Inspect active Notification list ==========")
    system.list_active_notifications()

    log.info("========== STEP 8: Close first Notification ==========")
    system.close_notification(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_notification(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Notification.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_notification("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_notification: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_notifications()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Notification {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Notification(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Notification.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Notification.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Notification.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Notification " + id + " invalid status");
    }
    System.out.println("[Notification.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Notification " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Notification.close] id=" + id + " -> CLOSED");
  }
}


class NotificationType {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  NotificationType(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("NotificationType.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("NotificationType.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[NotificationType.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("NotificationType " + id + " invalid status");
    }
    System.out.println("[NotificationType.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("NotificationType " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[NotificationType.close] id=" + id + " -> CLOSED");
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


class Template {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Template(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Template.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Template.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Template.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Template " + id + " invalid status");
    }
    System.out.println("[Template.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Template " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Template.close] id=" + id + " -> CLOSED");
  }
}


class UserPreference {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  UserPreference(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("UserPreference.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("UserPreference.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[UserPreference.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("UserPreference " + id + " invalid status");
    }
    System.out.println("[UserPreference.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("UserPreference " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[UserPreference.close] id=" + id + " -> CLOSED");
  }
}

public class NotificationServiceService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Notification> notifications = new LinkedHashMap<>();
  private final Map<String, NotificationType> notification_types = new LinkedHashMap<>();
  private final Map<String, Channel> channels = new LinkedHashMap<>();
  private final Map<String, Template> templates = new LinkedHashMap<>();
  private final Map<String, UserPreference> user_preferences = new LinkedHashMap<>();

  public NotificationServiceService() {
    System.out.println("[NotificationServiceService.__init__] system ready");
  }

  public Notification createNotification(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Notification name required");
    }
    lock.lock();
    try {
      String id = String.format("NOT-%04d", seq++);
      Notification obj = new Notification(id, name.trim());
      obj.validate();
      notifications.put(id, obj);
      System.out.println("[NotificationServiceService.createNotification] stored " + id + " count=" + notifications.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Notification getNotification(String id) {
    lock.lock();
    try {
      Notification obj = notifications.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Notification id: " + id);
      }
      System.out.println("[NotificationServiceService.getNotification] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public NotificationType createNotificationType(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("NotificationType name required");
    }
    lock.lock();
    try {
      String id = String.format("NOT-%04d", seq++);
      NotificationType obj = new NotificationType(id, name.trim());
      obj.validate();
      notification_types.put(id, obj);
      System.out.println("[NotificationServiceService.createNotificationType] stored " + id + " count=" + notification_types.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public NotificationType getNotificationType(String id) {
    lock.lock();
    try {
      NotificationType obj = notification_types.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown NotificationType id: " + id);
      }
      System.out.println("[NotificationServiceService.getNotificationType] found id=" + obj.getId());
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
      System.out.println("[NotificationServiceService.createChannel] stored " + id + " count=" + channels.size());
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
      System.out.println("[NotificationServiceService.getChannel] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Template createTemplate(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Template name required");
    }
    lock.lock();
    try {
      String id = String.format("TEM-%04d", seq++);
      Template obj = new Template(id, name.trim());
      obj.validate();
      templates.put(id, obj);
      System.out.println("[NotificationServiceService.createTemplate] stored " + id + " count=" + templates.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Template getTemplate(String id) {
    lock.lock();
    try {
      Template obj = templates.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Template id: " + id);
      }
      System.out.println("[NotificationServiceService.getTemplate] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public UserPreference createUserPreference(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("UserPreference name required");
    }
    lock.lock();
    try {
      String id = String.format("USE-%04d", seq++);
      UserPreference obj = new UserPreference(id, name.trim());
      obj.validate();
      user_preferences.put(id, obj);
      System.out.println("[NotificationServiceService.createUserPreference] stored " + id + " count=" + user_preferences.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public UserPreference getUserPreference(String id) {
    lock.lock();
    try {
      UserPreference obj = user_preferences.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown UserPreference id: " + id);
      }
      System.out.println("[NotificationServiceService.getUserPreference] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Notification closeNotification(String id) {
    lock.lock();
    try {
      Notification obj = notifications.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Notification id: " + id);
      }
      System.out.println("[NotificationServiceService.closeNotification] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Notification> listActiveNotifications() {
    lock.lock();
    try {
      List<Notification> out = new ArrayList<>();
      for (Notification o : notifications.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[NotificationServiceService.listActiveNotifications] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct NotificationServiceService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    NotificationServiceService system = new NotificationServiceService();
    System.out.println("========== STEP 2: Create Notification objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Notification first = system.createNotification("alpha-notification");
    system.createNotification("beta-notification");
    System.out.println("========== STEP 3: Create NotificationType ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createNotificationType("sample-notification_type");
    System.out.println("========== STEP 4: Create Channel ==========");
    system.createChannel("sample-channel");
    System.out.println("========== STEP 5: Create Template ==========");
    system.createTemplate("sample-template");
    System.out.println("========== STEP 6: Create UserPreference ==========");
    system.createUserPreference("sample-user_preference");
    System.out.println("========== Inspect active list ==========");
    system.listActiveNotifications();
    System.out.println("========== Close first Notification ==========");
    system.closeNotification(first.getId());
    try {
      system.closeNotification(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getNotification("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Notification {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Notification.id required')
    }

    if (!name?.trim()) {
      throw new Error('Notification.name required')
    }
    console.log(\`[Notification.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Notification \${this.id} invalid status\`)
    }
    console.log(\`[Notification.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Notification \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Notification.close] id=\${this.id} -> CLOSED\`)
  }
}


class NotificationType {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('NotificationType.id required')
    }

    if (!name?.trim()) {
      throw new Error('NotificationType.name required')
    }
    console.log(\`[NotificationType.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`NotificationType \${this.id} invalid status\`)
    }
    console.log(\`[NotificationType.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`NotificationType \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[NotificationType.close] id=\${this.id} -> CLOSED\`)
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


class Template {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Template.id required')
    }

    if (!name?.trim()) {
      throw new Error('Template.name required')
    }
    console.log(\`[Template.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Template \${this.id} invalid status\`)
    }
    console.log(\`[Template.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Template \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Template.close] id=\${this.id} -> CLOSED\`)
  }
}


class UserPreference {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('UserPreference.id required')
    }

    if (!name?.trim()) {
      throw new Error('UserPreference.name required')
    }
    console.log(\`[UserPreference.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`UserPreference \${this.id} invalid status\`)
    }
    console.log(\`[UserPreference.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`UserPreference \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[UserPreference.close] id=\${this.id} -> CLOSED\`)
  }
}

class NotificationServiceService {
  private seq = 1
  private notifications = new Map<string, Notification>()
  private notification_types = new Map<string, NotificationType>()
  private channels = new Map<string, Channel>()
  private templates = new Map<string, Template>()
  private user_preferences = new Map<string, UserPreference>()
  constructor() {
    console.log('[NotificationServiceService.__init__] system ready')
  }

  createNotification(name: string): Notification {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Notification name required')
    }
    const id = \`NOT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Notification(id, cleaned)
    obj.validate()
    this.notifications.set(id, obj)
    console.log(\`[NotificationServiceService.createNotification] stored \${id} count=\${this.notifications.size}\`)
    return obj
  }

  getNotification(id: string): Notification {
    const obj = this.notifications.get(id)
    if (!obj) {
      throw new Error(\`unknown Notification id: \${id}\`)
    }
    console.log(\`[NotificationServiceService.getNotification] found id=\${obj.id}\`)
    return obj
  }

  createNotificationType(name: string): NotificationType {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('NotificationType name required')
    }
    const id = \`NOT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new NotificationType(id, cleaned)
    obj.validate()
    this.notification_types.set(id, obj)
    console.log(\`[NotificationServiceService.createNotificationType] stored \${id} count=\${this.notification_types.size}\`)
    return obj
  }

  getNotificationType(id: string): NotificationType {
    const obj = this.notification_types.get(id)
    if (!obj) {
      throw new Error(\`unknown NotificationType id: \${id}\`)
    }
    console.log(\`[NotificationServiceService.getNotificationType] found id=\${obj.id}\`)
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
    console.log(\`[NotificationServiceService.createChannel] stored \${id} count=\${this.channels.size}\`)
    return obj
  }

  getChannel(id: string): Channel {
    const obj = this.channels.get(id)
    if (!obj) {
      throw new Error(\`unknown Channel id: \${id}\`)
    }
    console.log(\`[NotificationServiceService.getChannel] found id=\${obj.id}\`)
    return obj
  }

  createTemplate(name: string): Template {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Template name required')
    }
    const id = \`TEM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Template(id, cleaned)
    obj.validate()
    this.templates.set(id, obj)
    console.log(\`[NotificationServiceService.createTemplate] stored \${id} count=\${this.templates.size}\`)
    return obj
  }

  getTemplate(id: string): Template {
    const obj = this.templates.get(id)
    if (!obj) {
      throw new Error(\`unknown Template id: \${id}\`)
    }
    console.log(\`[NotificationServiceService.getTemplate] found id=\${obj.id}\`)
    return obj
  }

  createUserPreference(name: string): UserPreference {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('UserPreference name required')
    }
    const id = \`USE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new UserPreference(id, cleaned)
    obj.validate()
    this.user_preferences.set(id, obj)
    console.log(\`[NotificationServiceService.createUserPreference] stored \${id} count=\${this.user_preferences.size}\`)
    return obj
  }

  getUserPreference(id: string): UserPreference {
    const obj = this.user_preferences.get(id)
    if (!obj) {
      throw new Error(\`unknown UserPreference id: \${id}\`)
    }
    console.log(\`[NotificationServiceService.getUserPreference] found id=\${obj.id}\`)
    return obj
  }

  closeNotification(id: string): Notification {
    const obj = this.getNotification(id)
    console.log(\`[NotificationServiceService.closeNotification] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveNotifications(): Notification[] {
    const active = [...this.notifications.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[NotificationServiceService.listActiveNotifications] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct NotificationServiceService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new NotificationServiceService()
  console.log('========== STEP 2: Create Notification objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createNotification('alpha-notification')
  system.createNotification('beta-notification')
  console.log('========== STEP 3: Create NotificationType ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createNotificationType('sample-notification_type')
  console.log('========== STEP 4: Create Channel ==========')
  system.createChannel('sample-channel')
  console.log('========== STEP 5: Create Template ==========')
  system.createTemplate('sample-template')
  console.log('========== STEP 6: Create UserPreference ==========')
  system.createUserPreference('sample-user_preference')
  system.listActiveNotifications()
  console.log('========== Close first Notification ==========')
  system.closeNotification(first.id)
  try {
    system.closeNotification(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getNotification('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Notification {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Notification(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Notification requires id and name");
    }
    cout << "[Notification.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Notification invalid status");
    }
    cout << "[Notification.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Notification cannot close");
    }
    status_ = "CLOSED";
    cout << "[Notification.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class NotificationType {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  NotificationType(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("NotificationType requires id and name");
    }
    cout << "[NotificationType.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("NotificationType invalid status");
    }
    cout << "[NotificationType.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("NotificationType cannot close");
    }
    status_ = "CLOSED";
    cout << "[NotificationType.close] id=" << id_ << " -> CLOSED" << endl;
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


class Template {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Template(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Template requires id and name");
    }
    cout << "[Template.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Template invalid status");
    }
    cout << "[Template.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Template cannot close");
    }
    status_ = "CLOSED";
    cout << "[Template.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class UserPreference {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  UserPreference(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("UserPreference requires id and name");
    }
    cout << "[UserPreference.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("UserPreference invalid status");
    }
    cout << "[UserPreference.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("UserPreference cannot close");
    }
    status_ = "CLOSED";
    cout << "[UserPreference.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class NotificationServiceService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Notification> notifications_;
  unordered_map<string, NotificationType> notification_types_;
  unordered_map<string, Channel> channels_;
  unordered_map<string, Template> templates_;
  unordered_map<string, UserPreference> user_preferences_;
public:
  NotificationServiceService() {
    cout << "[NotificationServiceService.__init__] system ready" << endl;
  }

  Notification createNotification(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Notification name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "NOT-%04d", seq_++);
    Notification obj{buf, name};
    obj.validate();
    notifications_.emplace(obj.id(), obj);
    cout << "[NotificationServiceService.createNotification] stored " << obj.id() << endl;
    return obj;
  }

  Notification getNotification(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = notifications_.find(id);
    if (it == notifications_.end()) {
      throw out_of_range("unknown Notification id");
    }
    cout << "[NotificationServiceService.getNotification] found " << id << endl;
    return it->second;
  }

  NotificationType createNotificationType(const string& name) {
    if (name.empty()) {
      throw invalid_argument("NotificationType name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "NOT-%04d", seq_++);
    NotificationType obj{buf, name};
    obj.validate();
    notification_types_.emplace(obj.id(), obj);
    cout << "[NotificationServiceService.createNotificationType] stored " << obj.id() << endl;
    return obj;
  }

  NotificationType getNotificationType(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = notification_types_.find(id);
    if (it == notification_types_.end()) {
      throw out_of_range("unknown NotificationType id");
    }
    cout << "[NotificationServiceService.getNotificationType] found " << id << endl;
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
    cout << "[NotificationServiceService.createChannel] stored " << obj.id() << endl;
    return obj;
  }

  Channel getChannel(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = channels_.find(id);
    if (it == channels_.end()) {
      throw out_of_range("unknown Channel id");
    }
    cout << "[NotificationServiceService.getChannel] found " << id << endl;
    return it->second;
  }

  Template createTemplate(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Template name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TEM-%04d", seq_++);
    Template obj{buf, name};
    obj.validate();
    templates_.emplace(obj.id(), obj);
    cout << "[NotificationServiceService.createTemplate] stored " << obj.id() << endl;
    return obj;
  }

  Template getTemplate(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = templates_.find(id);
    if (it == templates_.end()) {
      throw out_of_range("unknown Template id");
    }
    cout << "[NotificationServiceService.getTemplate] found " << id << endl;
    return it->second;
  }

  UserPreference createUserPreference(const string& name) {
    if (name.empty()) {
      throw invalid_argument("UserPreference name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "USE-%04d", seq_++);
    UserPreference obj{buf, name};
    obj.validate();
    user_preferences_.emplace(obj.id(), obj);
    cout << "[NotificationServiceService.createUserPreference] stored " << obj.id() << endl;
    return obj;
  }

  UserPreference getUserPreference(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = user_preferences_.find(id);
    if (it == user_preferences_.end()) {
      throw out_of_range("unknown UserPreference id");
    }
    cout << "[NotificationServiceService.getUserPreference] found " << id << endl;
    return it->second;
  }

  Notification closeNotification(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = notifications_.find(id);
    if (it == notifications_.end()) {
      throw out_of_range("unknown Notification");
    }
    cout << "[NotificationServiceService.closeNotification] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct NotificationServiceService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  NotificationServiceService system;
  cout << "========== STEP 2: Create Notification ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createNotification("alpha-notification");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createNotification("beta-notification");
  system.createNotificationType("sample-notification_type");
  system.createChannel("sample-channel");
  system.createTemplate("sample-template");
  system.createUserPreference("sample-user_preference");
  system.closeNotification(first.id());
  try {
    system.closeNotification(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getNotification("MISSING-ID");
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

type Notification struct {
  ID     string
  Name   string
  Status string
}

func NewNotification(id, name string) (*Notification, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Notification requires id and name")
  }
  obj := &Notification{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Notification.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Notification) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Notification invalid status")
  }
  fmt.Printf("[Notification.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Notification) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Notification %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Notification.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type NotificationType struct {
  ID     string
  Name   string
  Status string
}

func NewNotificationType(id, name string) (*NotificationType, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("NotificationType requires id and name")
  }
  obj := &NotificationType{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[NotificationType.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *NotificationType) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("NotificationType invalid status")
  }
  fmt.Printf("[NotificationType.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *NotificationType) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("NotificationType %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[NotificationType.close] id=%s -> CLOSED\\n", o.ID)
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


type Template struct {
  ID     string
  Name   string
  Status string
}

func NewTemplate(id, name string) (*Template, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Template requires id and name")
  }
  obj := &Template{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Template.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Template) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Template invalid status")
  }
  fmt.Printf("[Template.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Template) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Template %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Template.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type UserPreference struct {
  ID     string
  Name   string
  Status string
}

func NewUserPreference(id, name string) (*UserPreference, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("UserPreference requires id and name")
  }
  obj := &UserPreference{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[UserPreference.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *UserPreference) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("UserPreference invalid status")
  }
  fmt.Printf("[UserPreference.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *UserPreference) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("UserPreference %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[UserPreference.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type NotificationServiceService struct {
  mu  sync.Mutex
  seq int
  notifications map[string]*Notification
  notification_types map[string]*NotificationType
  channels map[string]*Channel
  templates map[string]*Template
  user_preferences map[string]*UserPreference
}

func NewNotificationServiceService() *NotificationServiceService {
  fmt.Println("[NotificationServiceService.__init__] system ready")
  return &NotificationServiceService{
    seq: 1,
    notifications: map[string]*Notification{},
    notification_types: map[string]*NotificationType{},
    channels: map[string]*Channel{},
    templates: map[string]*Template{},
    user_preferences: map[string]*UserPreference{},
  }
}

func (s *NotificationServiceService) CreateNotification(name string) (*Notification, error) {
  if name == "" {
    return nil, fmt.Errorf("Notification name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("NOT-%04d", s.seq)
  s.seq++
  obj, err := NewNotification(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.notifications[id] = obj
  fmt.Printf("[NotificationServiceService.CreateNotification] stored %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) GetNotification(id string) (*Notification, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.notifications[id]
  if !ok {
    return nil, fmt.Errorf("unknown Notification id: %s", id)
  }
  fmt.Printf("[NotificationServiceService.GetNotification] found %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) CreateNotificationType(name string) (*NotificationType, error) {
  if name == "" {
    return nil, fmt.Errorf("NotificationType name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("NOT-%04d", s.seq)
  s.seq++
  obj, err := NewNotificationType(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.notification_types[id] = obj
  fmt.Printf("[NotificationServiceService.CreateNotificationType] stored %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) GetNotificationType(id string) (*NotificationType, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.notification_types[id]
  if !ok {
    return nil, fmt.Errorf("unknown NotificationType id: %s", id)
  }
  fmt.Printf("[NotificationServiceService.GetNotificationType] found %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) CreateChannel(name string) (*Channel, error) {
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
  fmt.Printf("[NotificationServiceService.CreateChannel] stored %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) GetChannel(id string) (*Channel, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.channels[id]
  if !ok {
    return nil, fmt.Errorf("unknown Channel id: %s", id)
  }
  fmt.Printf("[NotificationServiceService.GetChannel] found %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) CreateTemplate(name string) (*Template, error) {
  if name == "" {
    return nil, fmt.Errorf("Template name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TEM-%04d", s.seq)
  s.seq++
  obj, err := NewTemplate(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.templates[id] = obj
  fmt.Printf("[NotificationServiceService.CreateTemplate] stored %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) GetTemplate(id string) (*Template, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.templates[id]
  if !ok {
    return nil, fmt.Errorf("unknown Template id: %s", id)
  }
  fmt.Printf("[NotificationServiceService.GetTemplate] found %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) CreateUserPreference(name string) (*UserPreference, error) {
  if name == "" {
    return nil, fmt.Errorf("UserPreference name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("USE-%04d", s.seq)
  s.seq++
  obj, err := NewUserPreference(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.user_preferences[id] = obj
  fmt.Printf("[NotificationServiceService.CreateUserPreference] stored %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) GetUserPreference(id string) (*UserPreference, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.user_preferences[id]
  if !ok {
    return nil, fmt.Errorf("unknown UserPreference id: %s", id)
  }
  fmt.Printf("[NotificationServiceService.GetUserPreference] found %s\\n", id)
  return obj, nil
}

func (s *NotificationServiceService) CloseNotification(id string) (*Notification, error) {
  obj, err := s.GetNotification(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[NotificationServiceService.CloseNotification] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct NotificationServiceService ==========")
  system := NewNotificationServiceService()
  fmt.Println("========== STEP 2: Create Notification ==========")
  first, _ := system.CreateNotification("alpha-notification")
  system.CreateNotification("beta-notification")
  system.CreateNotificationType("sample-notification_type")
  system.CreateChannel("sample-channel")
  system.CreateTemplate("sample-template")
  system.CreateUserPreference("sample-user_preference")
  system.CloseNotification(first.ID)
  if _, err := system.CloseNotification(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetNotification("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Notification {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Notification(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Notification requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Notification.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Notification invalid status");
    }
    Console.WriteLine("[Notification.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Notification " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Notification.close] id=" + Id + " -> CLOSED");
  }
}


sealed class NotificationType {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public NotificationType(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("NotificationType requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[NotificationType.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("NotificationType invalid status");
    }
    Console.WriteLine("[NotificationType.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("NotificationType " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[NotificationType.close] id=" + Id + " -> CLOSED");
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


sealed class Template {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Template(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Template requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Template.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Template invalid status");
    }
    Console.WriteLine("[Template.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Template " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Template.close] id=" + Id + " -> CLOSED");
  }
}


sealed class UserPreference {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public UserPreference(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("UserPreference requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[UserPreference.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("UserPreference invalid status");
    }
    Console.WriteLine("[UserPreference.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("UserPreference " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[UserPreference.close] id=" + Id + " -> CLOSED");
  }
}

sealed class NotificationServiceService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Notification> _notifications = new();
  private readonly Dictionary<string, NotificationType> _notification_types = new();
  private readonly Dictionary<string, Channel> _channels = new();
  private readonly Dictionary<string, Template> _templates = new();
  private readonly Dictionary<string, UserPreference> _user_preferences = new();
  public NotificationServiceService() {
    Console.WriteLine("[NotificationServiceService.__init__] system ready");
  }

  public Notification CreateNotification(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Notification name required");
    }
    lock (_gate) {
      var id = string.Format("NOT-{0:D4}", _seq++);
      var obj = new Notification(id, name.Trim());
      obj.Validate();
      _notifications[id] = obj;
      Console.WriteLine("[NotificationServiceService.CreateNotification] stored " + id);
      return obj;
    }
  }

  public Notification GetNotification(string id) {
    lock (_gate) {
      if (!_notifications.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Notification id: " + id);
      }
      Console.WriteLine("[NotificationServiceService.GetNotification] found " + id);
      return obj;
    }
  }

  public NotificationType CreateNotificationType(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("NotificationType name required");
    }
    lock (_gate) {
      var id = string.Format("NOT-{0:D4}", _seq++);
      var obj = new NotificationType(id, name.Trim());
      obj.Validate();
      _notification_types[id] = obj;
      Console.WriteLine("[NotificationServiceService.CreateNotificationType] stored " + id);
      return obj;
    }
  }

  public NotificationType GetNotificationType(string id) {
    lock (_gate) {
      if (!_notification_types.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown NotificationType id: " + id);
      }
      Console.WriteLine("[NotificationServiceService.GetNotificationType] found " + id);
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
      Console.WriteLine("[NotificationServiceService.CreateChannel] stored " + id);
      return obj;
    }
  }

  public Channel GetChannel(string id) {
    lock (_gate) {
      if (!_channels.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Channel id: " + id);
      }
      Console.WriteLine("[NotificationServiceService.GetChannel] found " + id);
      return obj;
    }
  }

  public Template CreateTemplate(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Template name required");
    }
    lock (_gate) {
      var id = string.Format("TEM-{0:D4}", _seq++);
      var obj = new Template(id, name.Trim());
      obj.Validate();
      _templates[id] = obj;
      Console.WriteLine("[NotificationServiceService.CreateTemplate] stored " + id);
      return obj;
    }
  }

  public Template GetTemplate(string id) {
    lock (_gate) {
      if (!_templates.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Template id: " + id);
      }
      Console.WriteLine("[NotificationServiceService.GetTemplate] found " + id);
      return obj;
    }
  }

  public UserPreference CreateUserPreference(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("UserPreference name required");
    }
    lock (_gate) {
      var id = string.Format("USE-{0:D4}", _seq++);
      var obj = new UserPreference(id, name.Trim());
      obj.Validate();
      _user_preferences[id] = obj;
      Console.WriteLine("[NotificationServiceService.CreateUserPreference] stored " + id);
      return obj;
    }
  }

  public UserPreference GetUserPreference(string id) {
    lock (_gate) {
      if (!_user_preferences.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown UserPreference id: " + id);
      }
      Console.WriteLine("[NotificationServiceService.GetUserPreference] found " + id);
      return obj;
    }
  }

  public Notification CloseNotification(string id) {
    var obj = GetNotification(id);
    Console.WriteLine("[NotificationServiceService.CloseNotification] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct NotificationServiceService ==========");
    var system = new NotificationServiceService();
    Console.WriteLine("========== STEP 2: Create Notification ==========");
    var first = system.CreateNotification("alpha-notification");
    system.CreateNotification("beta-notification");
    system.CreateNotificationType("sample-notification_type");
    system.CreateChannel("sample-channel");
    system.CreateTemplate("sample-template");
    system.CreateUserPreference("sample-user_preference");
    system.CloseNotification(first.Id);
    try {
      system.CloseNotification(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetNotification("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const notificationServiceSolution: ProblemSolution = {
  slug: 'notification-service',
  title: 'Notification Service - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a multi-channel notification service that sends alerts via push, email, SMS, and in-app with user preference control. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Send notifications through multiple channels: push, email, SMS, in-app',
      'Users configure channel preferences per notification type',
      'Notification types: transactional, promotional, alert',
      'Template-based messages with dynamic variable substitution',
      'Delivery tracking: sent, delivered, read, failed',
      'Retry failed notifications with exponential backoff',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Send notifications through multiple channels: push, email, SMS, in-app?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Users configure channel preferences per notification type?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Notification types: transactional, promotional, alert?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Template-based messages with dynamic variable substitution?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Delivery tracking: sent, delivered, read, failed?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. NotificationServiceService is the facade stereotype. Notification, NotificationType, Channel, Template, UserPreference are concrete domain classes with id/name/status and validate/close.',
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
          'Construct NotificationServiceService.',
          'createNotification twice and create the related UML classes.',
          'closeNotification once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'NotificationServiceService', responsibility: 'UML facade - orchestrates Notification Service.', keyMembers: ['create*', 'get*', 'closeNotification'] },
    { name: 'Notification', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'NotificationType', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Channel', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Template', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'UserPreference', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from NotificationServiceService to Notification, NotificationType, Channel, Template, UserPreference. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on NotificationServiceService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'NotificationServiceService', responsibility: 'UML facade - orchestrates Notification Service.', keyMembers: ['create*', 'get*', 'closeNotification'] },
    { name: 'Notification', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'NotificationType', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Channel', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Template', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'UserPreference', responsibility: 'UML class - domain object for Notification Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'NotificationServiceService exposes create/get/close and owns composed collections.' },
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
      'main constructs NotificationServiceService, creates UML domain objects, closes the primary Notification, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct NotificationServiceService.',
      'createNotification for alpha and beta.',
      'create remaining UML classes.',
      'closeNotification(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createNotification("alpha..."); closeNotification(id)',
        output: '[Notification.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeNotification(alreadyClosed) or getNotification("MISSING-ID")',
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
