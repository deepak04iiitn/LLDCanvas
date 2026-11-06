import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'WhatsappService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_messages', 'Map<string, Message>'),
    attr('-', '_chats', 'Map<string, Chat>'),
    attr('-', '_groups', 'Map<string, Group>'),
    attr('-', '_group_messages', 'Map<string, GroupMessage>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createMessage', 'name: string', 'Message'),
    method('+', 'createChat', 'name: string', 'Chat'),
    method('+', 'createGroup', 'name: string', 'Group'),
    method('+', 'createGroupMessage', 'name: string', 'GroupMessage'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getMessage', 'id: string', 'Message'),
    method('+', 'getChat', 'id: string', 'Chat'),
    method('+', 'getGroup', 'id: string', 'Group'),
    method('+', 'getGroupMessage', 'id: string', 'GroupMessage'),
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
  cls('n2', 'Message', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Chat', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Group', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'GroupMessage', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("whatsapp")


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


class Message:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Message.id is required")
        if not name or not name.strip():
            raise ValueError("Message.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Message.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Message {self.id} has invalid status={self.status}")
        log.info("[Message.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Message {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Message.close] id=%s -> CLOSED", self.id)


class Chat:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Chat.id is required")
        if not name or not name.strip():
            raise ValueError("Chat.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Chat.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Chat {self.id} has invalid status={self.status}")
        log.info("[Chat.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Chat {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Chat.close] id=%s -> CLOSED", self.id)


class Group:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Group.id is required")
        if not name or not name.strip():
            raise ValueError("Group.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Group.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Group {self.id} has invalid status={self.status}")
        log.info("[Group.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Group {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Group.close] id=%s -> CLOSED", self.id)


class GroupMessage:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("GroupMessage.id is required")
        if not name or not name.strip():
            raise ValueError("GroupMessage.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[GroupMessage.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"GroupMessage {self.id} has invalid status={self.status}")
        log.info("[GroupMessage.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"GroupMessage {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[GroupMessage.close] id=%s -> CLOSED", self.id)


class WhatsappService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._messages: Dict[str, Message] = {}
        self._chats: Dict[str, Chat] = {}
        self._groups: Dict[str, Group] = {}
        self._group_messages: Dict[str, GroupMessage] = {}
        log.info("[WhatsappService.__init__] system ready; managing: User, Message, Chat, Group, GroupMessage")

    def create_user(self, name: str) -> User:
        """UML: WhatsappService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[WhatsappService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[WhatsappService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_message(self, name: str) -> Message:
        """UML: WhatsappService.create_message(name) -> Message"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Message name is required")
        with self._lock:
            item_id = f"MES-{self._seq:04d}"
            self._seq += 1
            obj = Message(item_id, cleaned)
            obj.validate()
            self._messages[item_id] = obj
            log.info("[WhatsappService.create_message] stored %s in _messages (count=%s)", item_id, len(self._messages))
            return obj

    def get_message(self, item_id: str) -> Message:
        with self._lock:
            obj = self._messages.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Message id: {item_id}")
            log.info("[WhatsappService.get_message] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_chat(self, name: str) -> Chat:
        """UML: WhatsappService.create_chat(name) -> Chat"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Chat name is required")
        with self._lock:
            item_id = f"CHA-{self._seq:04d}"
            self._seq += 1
            obj = Chat(item_id, cleaned)
            obj.validate()
            self._chats[item_id] = obj
            log.info("[WhatsappService.create_chat] stored %s in _chats (count=%s)", item_id, len(self._chats))
            return obj

    def get_chat(self, item_id: str) -> Chat:
        with self._lock:
            obj = self._chats.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Chat id: {item_id}")
            log.info("[WhatsappService.get_chat] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_group(self, name: str) -> Group:
        """UML: WhatsappService.create_group(name) -> Group"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Group name is required")
        with self._lock:
            item_id = f"GRO-{self._seq:04d}"
            self._seq += 1
            obj = Group(item_id, cleaned)
            obj.validate()
            self._groups[item_id] = obj
            log.info("[WhatsappService.create_group] stored %s in _groups (count=%s)", item_id, len(self._groups))
            return obj

    def get_group(self, item_id: str) -> Group:
        with self._lock:
            obj = self._groups.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Group id: {item_id}")
            log.info("[WhatsappService.get_group] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_group_message(self, name: str) -> GroupMessage:
        """UML: WhatsappService.create_group_message(name) -> GroupMessage"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("GroupMessage name is required")
        with self._lock:
            item_id = f"GRO-{self._seq:04d}"
            self._seq += 1
            obj = GroupMessage(item_id, cleaned)
            obj.validate()
            self._group_messages[item_id] = obj
            log.info("[WhatsappService.create_group_message] stored %s in _group_messages (count=%s)", item_id, len(self._group_messages))
            return obj

    def get_group_message(self, item_id: str) -> GroupMessage:
        with self._lock:
            obj = self._group_messages.get(item_id)
            if obj is None:
                raise KeyError(f"unknown GroupMessage id: {item_id}")
            log.info("[WhatsappService.get_group_message] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[WhatsappService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[WhatsappService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct WhatsappService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = WhatsappService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Message (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_message("sample-message")

    log.info("========== STEP 4: Create Chat (UML class) ==========")
    system.create_chat("sample-chat")

    log.info("========== STEP 5: Create Group (UML class) ==========")
    system.create_group("sample-group")

    log.info("========== STEP 6: Create GroupMessage (UML class) ==========")
    system.create_group_message("sample-group_message")

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


class Message {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Message(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Message.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Message.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Message.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Message " + id + " invalid status");
    }
    System.out.println("[Message.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Message " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Message.close] id=" + id + " -> CLOSED");
  }
}


class Chat {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Chat(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Chat.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Chat.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Chat.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Chat " + id + " invalid status");
    }
    System.out.println("[Chat.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Chat " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Chat.close] id=" + id + " -> CLOSED");
  }
}


class Group {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Group(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Group.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Group.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Group.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Group " + id + " invalid status");
    }
    System.out.println("[Group.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Group " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Group.close] id=" + id + " -> CLOSED");
  }
}


class GroupMessage {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  GroupMessage(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("GroupMessage.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GroupMessage.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[GroupMessage.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("GroupMessage " + id + " invalid status");
    }
    System.out.println("[GroupMessage.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("GroupMessage " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[GroupMessage.close] id=" + id + " -> CLOSED");
  }
}

public class WhatsappService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Message> messages = new LinkedHashMap<>();
  private final Map<String, Chat> chats = new LinkedHashMap<>();
  private final Map<String, Group> groups = new LinkedHashMap<>();
  private final Map<String, GroupMessage> group_messages = new LinkedHashMap<>();

  public WhatsappService() {
    System.out.println("[WhatsappService.__init__] system ready");
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
      System.out.println("[WhatsappService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[WhatsappService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Message createMessage(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Message name required");
    }
    lock.lock();
    try {
      String id = String.format("MES-%04d", seq++);
      Message obj = new Message(id, name.trim());
      obj.validate();
      messages.put(id, obj);
      System.out.println("[WhatsappService.createMessage] stored " + id + " count=" + messages.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Message getMessage(String id) {
    lock.lock();
    try {
      Message obj = messages.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Message id: " + id);
      }
      System.out.println("[WhatsappService.getMessage] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Chat createChat(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Chat name required");
    }
    lock.lock();
    try {
      String id = String.format("CHA-%04d", seq++);
      Chat obj = new Chat(id, name.trim());
      obj.validate();
      chats.put(id, obj);
      System.out.println("[WhatsappService.createChat] stored " + id + " count=" + chats.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Chat getChat(String id) {
    lock.lock();
    try {
      Chat obj = chats.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Chat id: " + id);
      }
      System.out.println("[WhatsappService.getChat] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Group createGroup(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Group name required");
    }
    lock.lock();
    try {
      String id = String.format("GRO-%04d", seq++);
      Group obj = new Group(id, name.trim());
      obj.validate();
      groups.put(id, obj);
      System.out.println("[WhatsappService.createGroup] stored " + id + " count=" + groups.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Group getGroup(String id) {
    lock.lock();
    try {
      Group obj = groups.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Group id: " + id);
      }
      System.out.println("[WhatsappService.getGroup] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public GroupMessage createGroupMessage(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GroupMessage name required");
    }
    lock.lock();
    try {
      String id = String.format("GRO-%04d", seq++);
      GroupMessage obj = new GroupMessage(id, name.trim());
      obj.validate();
      group_messages.put(id, obj);
      System.out.println("[WhatsappService.createGroupMessage] stored " + id + " count=" + group_messages.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public GroupMessage getGroupMessage(String id) {
    lock.lock();
    try {
      GroupMessage obj = group_messages.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown GroupMessage id: " + id);
      }
      System.out.println("[WhatsappService.getGroupMessage] found id=" + obj.getId());
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
      System.out.println("[WhatsappService.closeUser] closing " + id);
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
      System.out.println("[WhatsappService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct WhatsappService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    WhatsappService system = new WhatsappService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Message ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createMessage("sample-message");
    System.out.println("========== STEP 4: Create Chat ==========");
    system.createChat("sample-chat");
    System.out.println("========== STEP 5: Create Group ==========");
    system.createGroup("sample-group");
    System.out.println("========== STEP 6: Create GroupMessage ==========");
    system.createGroupMessage("sample-group_message");
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


class Message {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Message.id required')
    }

    if (!name?.trim()) {
      throw new Error('Message.name required')
    }
    console.log(\`[Message.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Message \${this.id} invalid status\`)
    }
    console.log(\`[Message.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Message \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Message.close] id=\${this.id} -> CLOSED\`)
  }
}


class Chat {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Chat.id required')
    }

    if (!name?.trim()) {
      throw new Error('Chat.name required')
    }
    console.log(\`[Chat.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Chat \${this.id} invalid status\`)
    }
    console.log(\`[Chat.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Chat \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Chat.close] id=\${this.id} -> CLOSED\`)
  }
}


class Group {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Group.id required')
    }

    if (!name?.trim()) {
      throw new Error('Group.name required')
    }
    console.log(\`[Group.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Group \${this.id} invalid status\`)
    }
    console.log(\`[Group.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Group \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Group.close] id=\${this.id} -> CLOSED\`)
  }
}


class GroupMessage {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('GroupMessage.id required')
    }

    if (!name?.trim()) {
      throw new Error('GroupMessage.name required')
    }
    console.log(\`[GroupMessage.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`GroupMessage \${this.id} invalid status\`)
    }
    console.log(\`[GroupMessage.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`GroupMessage \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[GroupMessage.close] id=\${this.id} -> CLOSED\`)
  }
}

class WhatsappService {
  private seq = 1
  private users = new Map<string, User>()
  private messages = new Map<string, Message>()
  private chats = new Map<string, Chat>()
  private groups = new Map<string, Group>()
  private group_messages = new Map<string, GroupMessage>()
  constructor() {
    console.log('[WhatsappService.__init__] system ready')
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
    console.log(\`[WhatsappService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[WhatsappService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createMessage(name: string): Message {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Message name required')
    }
    const id = \`MES-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Message(id, cleaned)
    obj.validate()
    this.messages.set(id, obj)
    console.log(\`[WhatsappService.createMessage] stored \${id} count=\${this.messages.size}\`)
    return obj
  }

  getMessage(id: string): Message {
    const obj = this.messages.get(id)
    if (!obj) {
      throw new Error(\`unknown Message id: \${id}\`)
    }
    console.log(\`[WhatsappService.getMessage] found id=\${obj.id}\`)
    return obj
  }

  createChat(name: string): Chat {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Chat name required')
    }
    const id = \`CHA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Chat(id, cleaned)
    obj.validate()
    this.chats.set(id, obj)
    console.log(\`[WhatsappService.createChat] stored \${id} count=\${this.chats.size}\`)
    return obj
  }

  getChat(id: string): Chat {
    const obj = this.chats.get(id)
    if (!obj) {
      throw new Error(\`unknown Chat id: \${id}\`)
    }
    console.log(\`[WhatsappService.getChat] found id=\${obj.id}\`)
    return obj
  }

  createGroup(name: string): Group {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Group name required')
    }
    const id = \`GRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Group(id, cleaned)
    obj.validate()
    this.groups.set(id, obj)
    console.log(\`[WhatsappService.createGroup] stored \${id} count=\${this.groups.size}\`)
    return obj
  }

  getGroup(id: string): Group {
    const obj = this.groups.get(id)
    if (!obj) {
      throw new Error(\`unknown Group id: \${id}\`)
    }
    console.log(\`[WhatsappService.getGroup] found id=\${obj.id}\`)
    return obj
  }

  createGroupMessage(name: string): GroupMessage {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('GroupMessage name required')
    }
    const id = \`GRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new GroupMessage(id, cleaned)
    obj.validate()
    this.group_messages.set(id, obj)
    console.log(\`[WhatsappService.createGroupMessage] stored \${id} count=\${this.group_messages.size}\`)
    return obj
  }

  getGroupMessage(id: string): GroupMessage {
    const obj = this.group_messages.get(id)
    if (!obj) {
      throw new Error(\`unknown GroupMessage id: \${id}\`)
    }
    console.log(\`[WhatsappService.getGroupMessage] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[WhatsappService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[WhatsappService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct WhatsappService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new WhatsappService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Message ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createMessage('sample-message')
  console.log('========== STEP 4: Create Chat ==========')
  system.createChat('sample-chat')
  console.log('========== STEP 5: Create Group ==========')
  system.createGroup('sample-group')
  console.log('========== STEP 6: Create GroupMessage ==========')
  system.createGroupMessage('sample-group_message')
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


class Message {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Message(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Message requires id and name");
    }
    cout << "[Message.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Message invalid status");
    }
    cout << "[Message.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Message cannot close");
    }
    status_ = "CLOSED";
    cout << "[Message.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Chat {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Chat(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Chat requires id and name");
    }
    cout << "[Chat.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Chat invalid status");
    }
    cout << "[Chat.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Chat cannot close");
    }
    status_ = "CLOSED";
    cout << "[Chat.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Group {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Group(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Group requires id and name");
    }
    cout << "[Group.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Group invalid status");
    }
    cout << "[Group.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Group cannot close");
    }
    status_ = "CLOSED";
    cout << "[Group.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class GroupMessage {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  GroupMessage(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("GroupMessage requires id and name");
    }
    cout << "[GroupMessage.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("GroupMessage invalid status");
    }
    cout << "[GroupMessage.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("GroupMessage cannot close");
    }
    status_ = "CLOSED";
    cout << "[GroupMessage.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class WhatsappService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Message> messages_;
  unordered_map<string, Chat> chats_;
  unordered_map<string, Group> groups_;
  unordered_map<string, GroupMessage> group_messages_;
public:
  WhatsappService() {
    cout << "[WhatsappService.__init__] system ready" << endl;
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
    cout << "[WhatsappService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[WhatsappService.getUser] found " << id << endl;
    return it->second;
  }

  Message createMessage(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Message name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MES-%04d", seq_++);
    Message obj{buf, name};
    obj.validate();
    messages_.emplace(obj.id(), obj);
    cout << "[WhatsappService.createMessage] stored " << obj.id() << endl;
    return obj;
  }

  Message getMessage(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = messages_.find(id);
    if (it == messages_.end()) {
      throw out_of_range("unknown Message id");
    }
    cout << "[WhatsappService.getMessage] found " << id << endl;
    return it->second;
  }

  Chat createChat(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Chat name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CHA-%04d", seq_++);
    Chat obj{buf, name};
    obj.validate();
    chats_.emplace(obj.id(), obj);
    cout << "[WhatsappService.createChat] stored " << obj.id() << endl;
    return obj;
  }

  Chat getChat(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = chats_.find(id);
    if (it == chats_.end()) {
      throw out_of_range("unknown Chat id");
    }
    cout << "[WhatsappService.getChat] found " << id << endl;
    return it->second;
  }

  Group createGroup(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Group name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GRO-%04d", seq_++);
    Group obj{buf, name};
    obj.validate();
    groups_.emplace(obj.id(), obj);
    cout << "[WhatsappService.createGroup] stored " << obj.id() << endl;
    return obj;
  }

  Group getGroup(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = groups_.find(id);
    if (it == groups_.end()) {
      throw out_of_range("unknown Group id");
    }
    cout << "[WhatsappService.getGroup] found " << id << endl;
    return it->second;
  }

  GroupMessage createGroupMessage(const string& name) {
    if (name.empty()) {
      throw invalid_argument("GroupMessage name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GRO-%04d", seq_++);
    GroupMessage obj{buf, name};
    obj.validate();
    group_messages_.emplace(obj.id(), obj);
    cout << "[WhatsappService.createGroupMessage] stored " << obj.id() << endl;
    return obj;
  }

  GroupMessage getGroupMessage(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = group_messages_.find(id);
    if (it == group_messages_.end()) {
      throw out_of_range("unknown GroupMessage id");
    }
    cout << "[WhatsappService.getGroupMessage] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[WhatsappService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct WhatsappService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  WhatsappService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createMessage("sample-message");
  system.createChat("sample-chat");
  system.createGroup("sample-group");
  system.createGroupMessage("sample-group_message");
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


type Message struct {
  ID     string
  Name   string
  Status string
}

func NewMessage(id, name string) (*Message, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Message requires id and name")
  }
  obj := &Message{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Message.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Message) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Message invalid status")
  }
  fmt.Printf("[Message.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Message) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Message %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Message.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Chat struct {
  ID     string
  Name   string
  Status string
}

func NewChat(id, name string) (*Chat, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Chat requires id and name")
  }
  obj := &Chat{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Chat.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Chat) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Chat invalid status")
  }
  fmt.Printf("[Chat.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Chat) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Chat %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Chat.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Group struct {
  ID     string
  Name   string
  Status string
}

func NewGroup(id, name string) (*Group, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Group requires id and name")
  }
  obj := &Group{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Group.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Group) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Group invalid status")
  }
  fmt.Printf("[Group.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Group) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Group %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Group.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type GroupMessage struct {
  ID     string
  Name   string
  Status string
}

func NewGroupMessage(id, name string) (*GroupMessage, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("GroupMessage requires id and name")
  }
  obj := &GroupMessage{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[GroupMessage.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *GroupMessage) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("GroupMessage invalid status")
  }
  fmt.Printf("[GroupMessage.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *GroupMessage) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("GroupMessage %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[GroupMessage.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type WhatsappService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  messages map[string]*Message
  chats map[string]*Chat
  groups map[string]*Group
  group_messages map[string]*GroupMessage
}

func NewWhatsappService() *WhatsappService {
  fmt.Println("[WhatsappService.__init__] system ready")
  return &WhatsappService{
    seq: 1,
    users: map[string]*User{},
    messages: map[string]*Message{},
    chats: map[string]*Chat{},
    groups: map[string]*Group{},
    group_messages: map[string]*GroupMessage{},
  }
}

func (s *WhatsappService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[WhatsappService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[WhatsappService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) CreateMessage(name string) (*Message, error) {
  if name == "" {
    return nil, fmt.Errorf("Message name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MES-%04d", s.seq)
  s.seq++
  obj, err := NewMessage(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.messages[id] = obj
  fmt.Printf("[WhatsappService.CreateMessage] stored %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) GetMessage(id string) (*Message, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.messages[id]
  if !ok {
    return nil, fmt.Errorf("unknown Message id: %s", id)
  }
  fmt.Printf("[WhatsappService.GetMessage] found %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) CreateChat(name string) (*Chat, error) {
  if name == "" {
    return nil, fmt.Errorf("Chat name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CHA-%04d", s.seq)
  s.seq++
  obj, err := NewChat(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.chats[id] = obj
  fmt.Printf("[WhatsappService.CreateChat] stored %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) GetChat(id string) (*Chat, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.chats[id]
  if !ok {
    return nil, fmt.Errorf("unknown Chat id: %s", id)
  }
  fmt.Printf("[WhatsappService.GetChat] found %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) CreateGroup(name string) (*Group, error) {
  if name == "" {
    return nil, fmt.Errorf("Group name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GRO-%04d", s.seq)
  s.seq++
  obj, err := NewGroup(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.groups[id] = obj
  fmt.Printf("[WhatsappService.CreateGroup] stored %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) GetGroup(id string) (*Group, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.groups[id]
  if !ok {
    return nil, fmt.Errorf("unknown Group id: %s", id)
  }
  fmt.Printf("[WhatsappService.GetGroup] found %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) CreateGroupMessage(name string) (*GroupMessage, error) {
  if name == "" {
    return nil, fmt.Errorf("GroupMessage name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GRO-%04d", s.seq)
  s.seq++
  obj, err := NewGroupMessage(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.group_messages[id] = obj
  fmt.Printf("[WhatsappService.CreateGroupMessage] stored %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) GetGroupMessage(id string) (*GroupMessage, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.group_messages[id]
  if !ok {
    return nil, fmt.Errorf("unknown GroupMessage id: %s", id)
  }
  fmt.Printf("[WhatsappService.GetGroupMessage] found %s\\n", id)
  return obj, nil
}

func (s *WhatsappService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[WhatsappService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct WhatsappService ==========")
  system := NewWhatsappService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateMessage("sample-message")
  system.CreateChat("sample-chat")
  system.CreateGroup("sample-group")
  system.CreateGroupMessage("sample-group_message")
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


sealed class Message {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Message(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Message requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Message.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Message invalid status");
    }
    Console.WriteLine("[Message.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Message " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Message.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Chat {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Chat(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Chat requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Chat.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Chat invalid status");
    }
    Console.WriteLine("[Chat.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Chat " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Chat.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Group {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Group(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Group requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Group.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Group invalid status");
    }
    Console.WriteLine("[Group.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Group " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Group.close] id=" + Id + " -> CLOSED");
  }
}


sealed class GroupMessage {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public GroupMessage(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GroupMessage requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[GroupMessage.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("GroupMessage invalid status");
    }
    Console.WriteLine("[GroupMessage.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("GroupMessage " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[GroupMessage.close] id=" + Id + " -> CLOSED");
  }
}

sealed class WhatsappService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Message> _messages = new();
  private readonly Dictionary<string, Chat> _chats = new();
  private readonly Dictionary<string, Group> _groups = new();
  private readonly Dictionary<string, GroupMessage> _group_messages = new();
  public WhatsappService() {
    Console.WriteLine("[WhatsappService.__init__] system ready");
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
      Console.WriteLine("[WhatsappService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[WhatsappService.GetUser] found " + id);
      return obj;
    }
  }

  public Message CreateMessage(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Message name required");
    }
    lock (_gate) {
      var id = string.Format("MES-{0:D4}", _seq++);
      var obj = new Message(id, name.Trim());
      obj.Validate();
      _messages[id] = obj;
      Console.WriteLine("[WhatsappService.CreateMessage] stored " + id);
      return obj;
    }
  }

  public Message GetMessage(string id) {
    lock (_gate) {
      if (!_messages.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Message id: " + id);
      }
      Console.WriteLine("[WhatsappService.GetMessage] found " + id);
      return obj;
    }
  }

  public Chat CreateChat(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Chat name required");
    }
    lock (_gate) {
      var id = string.Format("CHA-{0:D4}", _seq++);
      var obj = new Chat(id, name.Trim());
      obj.Validate();
      _chats[id] = obj;
      Console.WriteLine("[WhatsappService.CreateChat] stored " + id);
      return obj;
    }
  }

  public Chat GetChat(string id) {
    lock (_gate) {
      if (!_chats.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Chat id: " + id);
      }
      Console.WriteLine("[WhatsappService.GetChat] found " + id);
      return obj;
    }
  }

  public Group CreateGroup(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Group name required");
    }
    lock (_gate) {
      var id = string.Format("GRO-{0:D4}", _seq++);
      var obj = new Group(id, name.Trim());
      obj.Validate();
      _groups[id] = obj;
      Console.WriteLine("[WhatsappService.CreateGroup] stored " + id);
      return obj;
    }
  }

  public Group GetGroup(string id) {
    lock (_gate) {
      if (!_groups.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Group id: " + id);
      }
      Console.WriteLine("[WhatsappService.GetGroup] found " + id);
      return obj;
    }
  }

  public GroupMessage CreateGroupMessage(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GroupMessage name required");
    }
    lock (_gate) {
      var id = string.Format("GRO-{0:D4}", _seq++);
      var obj = new GroupMessage(id, name.Trim());
      obj.Validate();
      _group_messages[id] = obj;
      Console.WriteLine("[WhatsappService.CreateGroupMessage] stored " + id);
      return obj;
    }
  }

  public GroupMessage GetGroupMessage(string id) {
    lock (_gate) {
      if (!_group_messages.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown GroupMessage id: " + id);
      }
      Console.WriteLine("[WhatsappService.GetGroupMessage] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[WhatsappService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct WhatsappService ==========");
    var system = new WhatsappService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateMessage("sample-message");
    system.CreateChat("sample-chat");
    system.CreateGroup("sample-group");
    system.CreateGroupMessage("sample-group_message");
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

export const whatsappSolution: ProblemSolution = {
  slug: 'whatsapp',
  title: 'WhatsApp Messenger - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a real-time messaging system like WhatsApp supporting 1-1 chats, group messages, media sharing, and message status (sent/delivered/read). The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Send and receive text messages in real-time',
      'Create groups with up to 256 members',
      'Share media (images, videos, documents)',
      'Message status: single tick (sent), double tick (delivered), blue tick (read)',
      'End-to-end encryption for all messages',
      'Last seen and online status',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Send and receive text messages in real-time?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Create groups with up to 256 members?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Share media (images, videos, documents)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Message status: single tick (sent), double tick (delivered), blue tick (read)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'End-to-end encryption for all messages?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. WhatsappService is the facade stereotype. User, Message, Chat, Group, GroupMessage are concrete domain classes with id/name/status and validate/close.',
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
          'Construct WhatsappService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'WhatsappService', responsibility: 'UML facade - orchestrates WhatsApp Messenger.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Message', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Chat', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Group', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GroupMessage', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from WhatsappService to User, Message, Chat, Group, GroupMessage. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on WhatsappService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'WhatsappService', responsibility: 'UML facade - orchestrates WhatsApp Messenger.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Message', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Chat', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Group', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GroupMessage', responsibility: 'UML class - domain object for WhatsApp Messenger.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'WhatsappService exposes create/get/close and owns composed collections.' },
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
      'main constructs WhatsappService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct WhatsappService.',
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
