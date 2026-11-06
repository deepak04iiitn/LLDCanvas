import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'ZoomService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_meetings', 'Map<string, Meeting>'),
    attr('-', '_meeting_participants', 'Map<string, MeetingParticipant>'),
    attr('-', '_chat_messages', 'Map<string, ChatMessage>'),
    attr('-', '_recordings', 'Map<string, Recording>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createMeeting', 'name: string', 'Meeting'),
    method('+', 'createMeetingParticipant', 'name: string', 'MeetingParticipant'),
    method('+', 'createChatMessage', 'name: string', 'ChatMessage'),
    method('+', 'createRecording', 'name: string', 'Recording'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getMeeting', 'id: string', 'Meeting'),
    method('+', 'getMeetingParticipant', 'id: string', 'MeetingParticipant'),
    method('+', 'getChatMessage', 'id: string', 'ChatMessage'),
    method('+', 'getRecording', 'id: string', 'Recording'),
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
  cls('n2', 'Meeting', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'MeetingParticipant', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'ChatMessage', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Recording', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("zoom")


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


class Meeting:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Meeting.id is required")
        if not name or not name.strip():
            raise ValueError("Meeting.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Meeting.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Meeting {self.id} has invalid status={self.status}")
        log.info("[Meeting.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Meeting {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Meeting.close] id=%s -> CLOSED", self.id)


class MeetingParticipant:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("MeetingParticipant.id is required")
        if not name or not name.strip():
            raise ValueError("MeetingParticipant.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[MeetingParticipant.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"MeetingParticipant {self.id} has invalid status={self.status}")
        log.info("[MeetingParticipant.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"MeetingParticipant {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[MeetingParticipant.close] id=%s -> CLOSED", self.id)


class ChatMessage:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ChatMessage.id is required")
        if not name or not name.strip():
            raise ValueError("ChatMessage.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ChatMessage.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ChatMessage {self.id} has invalid status={self.status}")
        log.info("[ChatMessage.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ChatMessage {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ChatMessage.close] id=%s -> CLOSED", self.id)


class Recording:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Recording.id is required")
        if not name or not name.strip():
            raise ValueError("Recording.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Recording.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Recording {self.id} has invalid status={self.status}")
        log.info("[Recording.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Recording {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Recording.close] id=%s -> CLOSED", self.id)


class ZoomService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._meetings: Dict[str, Meeting] = {}
        self._meeting_participants: Dict[str, MeetingParticipant] = {}
        self._chat_messages: Dict[str, ChatMessage] = {}
        self._recordings: Dict[str, Recording] = {}
        log.info("[ZoomService.__init__] system ready; managing: User, Meeting, MeetingParticipant, ChatMessage, Recording")

    def create_user(self, name: str) -> User:
        """UML: ZoomService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[ZoomService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[ZoomService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_meeting(self, name: str) -> Meeting:
        """UML: ZoomService.create_meeting(name) -> Meeting"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Meeting name is required")
        with self._lock:
            item_id = f"MEE-{self._seq:04d}"
            self._seq += 1
            obj = Meeting(item_id, cleaned)
            obj.validate()
            self._meetings[item_id] = obj
            log.info("[ZoomService.create_meeting] stored %s in _meetings (count=%s)", item_id, len(self._meetings))
            return obj

    def get_meeting(self, item_id: str) -> Meeting:
        with self._lock:
            obj = self._meetings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Meeting id: {item_id}")
            log.info("[ZoomService.get_meeting] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_meeting_participant(self, name: str) -> MeetingParticipant:
        """UML: ZoomService.create_meeting_participant(name) -> MeetingParticipant"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("MeetingParticipant name is required")
        with self._lock:
            item_id = f"MEE-{self._seq:04d}"
            self._seq += 1
            obj = MeetingParticipant(item_id, cleaned)
            obj.validate()
            self._meeting_participants[item_id] = obj
            log.info("[ZoomService.create_meeting_participant] stored %s in _meeting_participants (count=%s)", item_id, len(self._meeting_participants))
            return obj

    def get_meeting_participant(self, item_id: str) -> MeetingParticipant:
        with self._lock:
            obj = self._meeting_participants.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MeetingParticipant id: {item_id}")
            log.info("[ZoomService.get_meeting_participant] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_chat_message(self, name: str) -> ChatMessage:
        """UML: ZoomService.create_chat_message(name) -> ChatMessage"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ChatMessage name is required")
        with self._lock:
            item_id = f"CHA-{self._seq:04d}"
            self._seq += 1
            obj = ChatMessage(item_id, cleaned)
            obj.validate()
            self._chat_messages[item_id] = obj
            log.info("[ZoomService.create_chat_message] stored %s in _chat_messages (count=%s)", item_id, len(self._chat_messages))
            return obj

    def get_chat_message(self, item_id: str) -> ChatMessage:
        with self._lock:
            obj = self._chat_messages.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ChatMessage id: {item_id}")
            log.info("[ZoomService.get_chat_message] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_recording(self, name: str) -> Recording:
        """UML: ZoomService.create_recording(name) -> Recording"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Recording name is required")
        with self._lock:
            item_id = f"REC-{self._seq:04d}"
            self._seq += 1
            obj = Recording(item_id, cleaned)
            obj.validate()
            self._recordings[item_id] = obj
            log.info("[ZoomService.create_recording] stored %s in _recordings (count=%s)", item_id, len(self._recordings))
            return obj

    def get_recording(self, item_id: str) -> Recording:
        with self._lock:
            obj = self._recordings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Recording id: {item_id}")
            log.info("[ZoomService.get_recording] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[ZoomService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[ZoomService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct ZoomService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = ZoomService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Meeting (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_meeting("sample-meeting")

    log.info("========== STEP 4: Create MeetingParticipant (UML class) ==========")
    system.create_meeting_participant("sample-meeting_participant")

    log.info("========== STEP 5: Create ChatMessage (UML class) ==========")
    system.create_chat_message("sample-chat_message")

    log.info("========== STEP 6: Create Recording (UML class) ==========")
    system.create_recording("sample-recording")

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


class Meeting {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Meeting(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Meeting.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Meeting.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Meeting.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Meeting " + id + " invalid status");
    }
    System.out.println("[Meeting.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Meeting " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Meeting.close] id=" + id + " -> CLOSED");
  }
}


class MeetingParticipant {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  MeetingParticipant(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("MeetingParticipant.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MeetingParticipant.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[MeetingParticipant.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("MeetingParticipant " + id + " invalid status");
    }
    System.out.println("[MeetingParticipant.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("MeetingParticipant " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[MeetingParticipant.close] id=" + id + " -> CLOSED");
  }
}


class ChatMessage {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ChatMessage(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ChatMessage.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ChatMessage.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ChatMessage.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ChatMessage " + id + " invalid status");
    }
    System.out.println("[ChatMessage.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ChatMessage " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ChatMessage.close] id=" + id + " -> CLOSED");
  }
}


class Recording {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Recording(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Recording.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Recording.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Recording.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Recording " + id + " invalid status");
    }
    System.out.println("[Recording.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Recording " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Recording.close] id=" + id + " -> CLOSED");
  }
}

public class ZoomService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Meeting> meetings = new LinkedHashMap<>();
  private final Map<String, MeetingParticipant> meeting_participants = new LinkedHashMap<>();
  private final Map<String, ChatMessage> chat_messages = new LinkedHashMap<>();
  private final Map<String, Recording> recordings = new LinkedHashMap<>();

  public ZoomService() {
    System.out.println("[ZoomService.__init__] system ready");
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
      System.out.println("[ZoomService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[ZoomService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Meeting createMeeting(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Meeting name required");
    }
    lock.lock();
    try {
      String id = String.format("MEE-%04d", seq++);
      Meeting obj = new Meeting(id, name.trim());
      obj.validate();
      meetings.put(id, obj);
      System.out.println("[ZoomService.createMeeting] stored " + id + " count=" + meetings.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Meeting getMeeting(String id) {
    lock.lock();
    try {
      Meeting obj = meetings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Meeting id: " + id);
      }
      System.out.println("[ZoomService.getMeeting] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public MeetingParticipant createMeetingParticipant(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MeetingParticipant name required");
    }
    lock.lock();
    try {
      String id = String.format("MEE-%04d", seq++);
      MeetingParticipant obj = new MeetingParticipant(id, name.trim());
      obj.validate();
      meeting_participants.put(id, obj);
      System.out.println("[ZoomService.createMeetingParticipant] stored " + id + " count=" + meeting_participants.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public MeetingParticipant getMeetingParticipant(String id) {
    lock.lock();
    try {
      MeetingParticipant obj = meeting_participants.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MeetingParticipant id: " + id);
      }
      System.out.println("[ZoomService.getMeetingParticipant] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ChatMessage createChatMessage(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ChatMessage name required");
    }
    lock.lock();
    try {
      String id = String.format("CHA-%04d", seq++);
      ChatMessage obj = new ChatMessage(id, name.trim());
      obj.validate();
      chat_messages.put(id, obj);
      System.out.println("[ZoomService.createChatMessage] stored " + id + " count=" + chat_messages.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ChatMessage getChatMessage(String id) {
    lock.lock();
    try {
      ChatMessage obj = chat_messages.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ChatMessage id: " + id);
      }
      System.out.println("[ZoomService.getChatMessage] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Recording createRecording(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Recording name required");
    }
    lock.lock();
    try {
      String id = String.format("REC-%04d", seq++);
      Recording obj = new Recording(id, name.trim());
      obj.validate();
      recordings.put(id, obj);
      System.out.println("[ZoomService.createRecording] stored " + id + " count=" + recordings.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Recording getRecording(String id) {
    lock.lock();
    try {
      Recording obj = recordings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Recording id: " + id);
      }
      System.out.println("[ZoomService.getRecording] found id=" + obj.getId());
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
      System.out.println("[ZoomService.closeUser] closing " + id);
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
      System.out.println("[ZoomService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct ZoomService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    ZoomService system = new ZoomService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Meeting ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createMeeting("sample-meeting");
    System.out.println("========== STEP 4: Create MeetingParticipant ==========");
    system.createMeetingParticipant("sample-meeting_participant");
    System.out.println("========== STEP 5: Create ChatMessage ==========");
    system.createChatMessage("sample-chat_message");
    System.out.println("========== STEP 6: Create Recording ==========");
    system.createRecording("sample-recording");
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


class Meeting {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Meeting.id required')
    }

    if (!name?.trim()) {
      throw new Error('Meeting.name required')
    }
    console.log(\`[Meeting.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Meeting \${this.id} invalid status\`)
    }
    console.log(\`[Meeting.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Meeting \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Meeting.close] id=\${this.id} -> CLOSED\`)
  }
}


class MeetingParticipant {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('MeetingParticipant.id required')
    }

    if (!name?.trim()) {
      throw new Error('MeetingParticipant.name required')
    }
    console.log(\`[MeetingParticipant.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`MeetingParticipant \${this.id} invalid status\`)
    }
    console.log(\`[MeetingParticipant.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`MeetingParticipant \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[MeetingParticipant.close] id=\${this.id} -> CLOSED\`)
  }
}


class ChatMessage {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ChatMessage.id required')
    }

    if (!name?.trim()) {
      throw new Error('ChatMessage.name required')
    }
    console.log(\`[ChatMessage.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ChatMessage \${this.id} invalid status\`)
    }
    console.log(\`[ChatMessage.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ChatMessage \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ChatMessage.close] id=\${this.id} -> CLOSED\`)
  }
}


class Recording {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Recording.id required')
    }

    if (!name?.trim()) {
      throw new Error('Recording.name required')
    }
    console.log(\`[Recording.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Recording \${this.id} invalid status\`)
    }
    console.log(\`[Recording.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Recording \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Recording.close] id=\${this.id} -> CLOSED\`)
  }
}

class ZoomService {
  private seq = 1
  private users = new Map<string, User>()
  private meetings = new Map<string, Meeting>()
  private meeting_participants = new Map<string, MeetingParticipant>()
  private chat_messages = new Map<string, ChatMessage>()
  private recordings = new Map<string, Recording>()
  constructor() {
    console.log('[ZoomService.__init__] system ready')
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
    console.log(\`[ZoomService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[ZoomService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createMeeting(name: string): Meeting {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Meeting name required')
    }
    const id = \`MEE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Meeting(id, cleaned)
    obj.validate()
    this.meetings.set(id, obj)
    console.log(\`[ZoomService.createMeeting] stored \${id} count=\${this.meetings.size}\`)
    return obj
  }

  getMeeting(id: string): Meeting {
    const obj = this.meetings.get(id)
    if (!obj) {
      throw new Error(\`unknown Meeting id: \${id}\`)
    }
    console.log(\`[ZoomService.getMeeting] found id=\${obj.id}\`)
    return obj
  }

  createMeetingParticipant(name: string): MeetingParticipant {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('MeetingParticipant name required')
    }
    const id = \`MEE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new MeetingParticipant(id, cleaned)
    obj.validate()
    this.meeting_participants.set(id, obj)
    console.log(\`[ZoomService.createMeetingParticipant] stored \${id} count=\${this.meeting_participants.size}\`)
    return obj
  }

  getMeetingParticipant(id: string): MeetingParticipant {
    const obj = this.meeting_participants.get(id)
    if (!obj) {
      throw new Error(\`unknown MeetingParticipant id: \${id}\`)
    }
    console.log(\`[ZoomService.getMeetingParticipant] found id=\${obj.id}\`)
    return obj
  }

  createChatMessage(name: string): ChatMessage {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ChatMessage name required')
    }
    const id = \`CHA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ChatMessage(id, cleaned)
    obj.validate()
    this.chat_messages.set(id, obj)
    console.log(\`[ZoomService.createChatMessage] stored \${id} count=\${this.chat_messages.size}\`)
    return obj
  }

  getChatMessage(id: string): ChatMessage {
    const obj = this.chat_messages.get(id)
    if (!obj) {
      throw new Error(\`unknown ChatMessage id: \${id}\`)
    }
    console.log(\`[ZoomService.getChatMessage] found id=\${obj.id}\`)
    return obj
  }

  createRecording(name: string): Recording {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Recording name required')
    }
    const id = \`REC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Recording(id, cleaned)
    obj.validate()
    this.recordings.set(id, obj)
    console.log(\`[ZoomService.createRecording] stored \${id} count=\${this.recordings.size}\`)
    return obj
  }

  getRecording(id: string): Recording {
    const obj = this.recordings.get(id)
    if (!obj) {
      throw new Error(\`unknown Recording id: \${id}\`)
    }
    console.log(\`[ZoomService.getRecording] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[ZoomService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[ZoomService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct ZoomService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new ZoomService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Meeting ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createMeeting('sample-meeting')
  console.log('========== STEP 4: Create MeetingParticipant ==========')
  system.createMeetingParticipant('sample-meeting_participant')
  console.log('========== STEP 5: Create ChatMessage ==========')
  system.createChatMessage('sample-chat_message')
  console.log('========== STEP 6: Create Recording ==========')
  system.createRecording('sample-recording')
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


class Meeting {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Meeting(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Meeting requires id and name");
    }
    cout << "[Meeting.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Meeting invalid status");
    }
    cout << "[Meeting.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Meeting cannot close");
    }
    status_ = "CLOSED";
    cout << "[Meeting.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class MeetingParticipant {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  MeetingParticipant(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("MeetingParticipant requires id and name");
    }
    cout << "[MeetingParticipant.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("MeetingParticipant invalid status");
    }
    cout << "[MeetingParticipant.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("MeetingParticipant cannot close");
    }
    status_ = "CLOSED";
    cout << "[MeetingParticipant.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ChatMessage {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ChatMessage(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ChatMessage requires id and name");
    }
    cout << "[ChatMessage.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ChatMessage invalid status");
    }
    cout << "[ChatMessage.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ChatMessage cannot close");
    }
    status_ = "CLOSED";
    cout << "[ChatMessage.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Recording {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Recording(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Recording requires id and name");
    }
    cout << "[Recording.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Recording invalid status");
    }
    cout << "[Recording.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Recording cannot close");
    }
    status_ = "CLOSED";
    cout << "[Recording.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class ZoomService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Meeting> meetings_;
  unordered_map<string, MeetingParticipant> meeting_participants_;
  unordered_map<string, ChatMessage> chat_messages_;
  unordered_map<string, Recording> recordings_;
public:
  ZoomService() {
    cout << "[ZoomService.__init__] system ready" << endl;
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
    cout << "[ZoomService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[ZoomService.getUser] found " << id << endl;
    return it->second;
  }

  Meeting createMeeting(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Meeting name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEE-%04d", seq_++);
    Meeting obj{buf, name};
    obj.validate();
    meetings_.emplace(obj.id(), obj);
    cout << "[ZoomService.createMeeting] stored " << obj.id() << endl;
    return obj;
  }

  Meeting getMeeting(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = meetings_.find(id);
    if (it == meetings_.end()) {
      throw out_of_range("unknown Meeting id");
    }
    cout << "[ZoomService.getMeeting] found " << id << endl;
    return it->second;
  }

  MeetingParticipant createMeetingParticipant(const string& name) {
    if (name.empty()) {
      throw invalid_argument("MeetingParticipant name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEE-%04d", seq_++);
    MeetingParticipant obj{buf, name};
    obj.validate();
    meeting_participants_.emplace(obj.id(), obj);
    cout << "[ZoomService.createMeetingParticipant] stored " << obj.id() << endl;
    return obj;
  }

  MeetingParticipant getMeetingParticipant(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = meeting_participants_.find(id);
    if (it == meeting_participants_.end()) {
      throw out_of_range("unknown MeetingParticipant id");
    }
    cout << "[ZoomService.getMeetingParticipant] found " << id << endl;
    return it->second;
  }

  ChatMessage createChatMessage(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ChatMessage name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CHA-%04d", seq_++);
    ChatMessage obj{buf, name};
    obj.validate();
    chat_messages_.emplace(obj.id(), obj);
    cout << "[ZoomService.createChatMessage] stored " << obj.id() << endl;
    return obj;
  }

  ChatMessage getChatMessage(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = chat_messages_.find(id);
    if (it == chat_messages_.end()) {
      throw out_of_range("unknown ChatMessage id");
    }
    cout << "[ZoomService.getChatMessage] found " << id << endl;
    return it->second;
  }

  Recording createRecording(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Recording name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REC-%04d", seq_++);
    Recording obj{buf, name};
    obj.validate();
    recordings_.emplace(obj.id(), obj);
    cout << "[ZoomService.createRecording] stored " << obj.id() << endl;
    return obj;
  }

  Recording getRecording(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = recordings_.find(id);
    if (it == recordings_.end()) {
      throw out_of_range("unknown Recording id");
    }
    cout << "[ZoomService.getRecording] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[ZoomService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct ZoomService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  ZoomService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createMeeting("sample-meeting");
  system.createMeetingParticipant("sample-meeting_participant");
  system.createChatMessage("sample-chat_message");
  system.createRecording("sample-recording");
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


type Meeting struct {
  ID     string
  Name   string
  Status string
}

func NewMeeting(id, name string) (*Meeting, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Meeting requires id and name")
  }
  obj := &Meeting{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Meeting.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Meeting) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Meeting invalid status")
  }
  fmt.Printf("[Meeting.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Meeting) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Meeting %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Meeting.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type MeetingParticipant struct {
  ID     string
  Name   string
  Status string
}

func NewMeetingParticipant(id, name string) (*MeetingParticipant, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("MeetingParticipant requires id and name")
  }
  obj := &MeetingParticipant{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[MeetingParticipant.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *MeetingParticipant) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("MeetingParticipant invalid status")
  }
  fmt.Printf("[MeetingParticipant.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *MeetingParticipant) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("MeetingParticipant %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[MeetingParticipant.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ChatMessage struct {
  ID     string
  Name   string
  Status string
}

func NewChatMessage(id, name string) (*ChatMessage, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ChatMessage requires id and name")
  }
  obj := &ChatMessage{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ChatMessage.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ChatMessage) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ChatMessage invalid status")
  }
  fmt.Printf("[ChatMessage.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ChatMessage) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ChatMessage %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ChatMessage.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Recording struct {
  ID     string
  Name   string
  Status string
}

func NewRecording(id, name string) (*Recording, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Recording requires id and name")
  }
  obj := &Recording{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Recording.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Recording) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Recording invalid status")
  }
  fmt.Printf("[Recording.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Recording) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Recording %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Recording.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type ZoomService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  meetings map[string]*Meeting
  meeting_participants map[string]*MeetingParticipant
  chat_messages map[string]*ChatMessage
  recordings map[string]*Recording
}

func NewZoomService() *ZoomService {
  fmt.Println("[ZoomService.__init__] system ready")
  return &ZoomService{
    seq: 1,
    users: map[string]*User{},
    meetings: map[string]*Meeting{},
    meeting_participants: map[string]*MeetingParticipant{},
    chat_messages: map[string]*ChatMessage{},
    recordings: map[string]*Recording{},
  }
}

func (s *ZoomService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[ZoomService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *ZoomService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[ZoomService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *ZoomService) CreateMeeting(name string) (*Meeting, error) {
  if name == "" {
    return nil, fmt.Errorf("Meeting name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEE-%04d", s.seq)
  s.seq++
  obj, err := NewMeeting(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.meetings[id] = obj
  fmt.Printf("[ZoomService.CreateMeeting] stored %s\\n", id)
  return obj, nil
}

func (s *ZoomService) GetMeeting(id string) (*Meeting, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.meetings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Meeting id: %s", id)
  }
  fmt.Printf("[ZoomService.GetMeeting] found %s\\n", id)
  return obj, nil
}

func (s *ZoomService) CreateMeetingParticipant(name string) (*MeetingParticipant, error) {
  if name == "" {
    return nil, fmt.Errorf("MeetingParticipant name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEE-%04d", s.seq)
  s.seq++
  obj, err := NewMeetingParticipant(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.meeting_participants[id] = obj
  fmt.Printf("[ZoomService.CreateMeetingParticipant] stored %s\\n", id)
  return obj, nil
}

func (s *ZoomService) GetMeetingParticipant(id string) (*MeetingParticipant, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.meeting_participants[id]
  if !ok {
    return nil, fmt.Errorf("unknown MeetingParticipant id: %s", id)
  }
  fmt.Printf("[ZoomService.GetMeetingParticipant] found %s\\n", id)
  return obj, nil
}

func (s *ZoomService) CreateChatMessage(name string) (*ChatMessage, error) {
  if name == "" {
    return nil, fmt.Errorf("ChatMessage name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CHA-%04d", s.seq)
  s.seq++
  obj, err := NewChatMessage(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.chat_messages[id] = obj
  fmt.Printf("[ZoomService.CreateChatMessage] stored %s\\n", id)
  return obj, nil
}

func (s *ZoomService) GetChatMessage(id string) (*ChatMessage, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.chat_messages[id]
  if !ok {
    return nil, fmt.Errorf("unknown ChatMessage id: %s", id)
  }
  fmt.Printf("[ZoomService.GetChatMessage] found %s\\n", id)
  return obj, nil
}

func (s *ZoomService) CreateRecording(name string) (*Recording, error) {
  if name == "" {
    return nil, fmt.Errorf("Recording name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REC-%04d", s.seq)
  s.seq++
  obj, err := NewRecording(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.recordings[id] = obj
  fmt.Printf("[ZoomService.CreateRecording] stored %s\\n", id)
  return obj, nil
}

func (s *ZoomService) GetRecording(id string) (*Recording, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.recordings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Recording id: %s", id)
  }
  fmt.Printf("[ZoomService.GetRecording] found %s\\n", id)
  return obj, nil
}

func (s *ZoomService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[ZoomService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct ZoomService ==========")
  system := NewZoomService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateMeeting("sample-meeting")
  system.CreateMeetingParticipant("sample-meeting_participant")
  system.CreateChatMessage("sample-chat_message")
  system.CreateRecording("sample-recording")
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


sealed class Meeting {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Meeting(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Meeting requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Meeting.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Meeting invalid status");
    }
    Console.WriteLine("[Meeting.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Meeting " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Meeting.close] id=" + Id + " -> CLOSED");
  }
}


sealed class MeetingParticipant {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public MeetingParticipant(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MeetingParticipant requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[MeetingParticipant.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("MeetingParticipant invalid status");
    }
    Console.WriteLine("[MeetingParticipant.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("MeetingParticipant " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[MeetingParticipant.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ChatMessage {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ChatMessage(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ChatMessage requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ChatMessage.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ChatMessage invalid status");
    }
    Console.WriteLine("[ChatMessage.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ChatMessage " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ChatMessage.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Recording {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Recording(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Recording requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Recording.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Recording invalid status");
    }
    Console.WriteLine("[Recording.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Recording " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Recording.close] id=" + Id + " -> CLOSED");
  }
}

sealed class ZoomService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Meeting> _meetings = new();
  private readonly Dictionary<string, MeetingParticipant> _meeting_participants = new();
  private readonly Dictionary<string, ChatMessage> _chat_messages = new();
  private readonly Dictionary<string, Recording> _recordings = new();
  public ZoomService() {
    Console.WriteLine("[ZoomService.__init__] system ready");
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
      Console.WriteLine("[ZoomService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[ZoomService.GetUser] found " + id);
      return obj;
    }
  }

  public Meeting CreateMeeting(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Meeting name required");
    }
    lock (_gate) {
      var id = string.Format("MEE-{0:D4}", _seq++);
      var obj = new Meeting(id, name.Trim());
      obj.Validate();
      _meetings[id] = obj;
      Console.WriteLine("[ZoomService.CreateMeeting] stored " + id);
      return obj;
    }
  }

  public Meeting GetMeeting(string id) {
    lock (_gate) {
      if (!_meetings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Meeting id: " + id);
      }
      Console.WriteLine("[ZoomService.GetMeeting] found " + id);
      return obj;
    }
  }

  public MeetingParticipant CreateMeetingParticipant(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MeetingParticipant name required");
    }
    lock (_gate) {
      var id = string.Format("MEE-{0:D4}", _seq++);
      var obj = new MeetingParticipant(id, name.Trim());
      obj.Validate();
      _meeting_participants[id] = obj;
      Console.WriteLine("[ZoomService.CreateMeetingParticipant] stored " + id);
      return obj;
    }
  }

  public MeetingParticipant GetMeetingParticipant(string id) {
    lock (_gate) {
      if (!_meeting_participants.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown MeetingParticipant id: " + id);
      }
      Console.WriteLine("[ZoomService.GetMeetingParticipant] found " + id);
      return obj;
    }
  }

  public ChatMessage CreateChatMessage(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ChatMessage name required");
    }
    lock (_gate) {
      var id = string.Format("CHA-{0:D4}", _seq++);
      var obj = new ChatMessage(id, name.Trim());
      obj.Validate();
      _chat_messages[id] = obj;
      Console.WriteLine("[ZoomService.CreateChatMessage] stored " + id);
      return obj;
    }
  }

  public ChatMessage GetChatMessage(string id) {
    lock (_gate) {
      if (!_chat_messages.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ChatMessage id: " + id);
      }
      Console.WriteLine("[ZoomService.GetChatMessage] found " + id);
      return obj;
    }
  }

  public Recording CreateRecording(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Recording name required");
    }
    lock (_gate) {
      var id = string.Format("REC-{0:D4}", _seq++);
      var obj = new Recording(id, name.Trim());
      obj.Validate();
      _recordings[id] = obj;
      Console.WriteLine("[ZoomService.CreateRecording] stored " + id);
      return obj;
    }
  }

  public Recording GetRecording(string id) {
    lock (_gate) {
      if (!_recordings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Recording id: " + id);
      }
      Console.WriteLine("[ZoomService.GetRecording] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[ZoomService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct ZoomService ==========");
    var system = new ZoomService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateMeeting("sample-meeting");
    system.CreateMeetingParticipant("sample-meeting_participant");
    system.CreateChatMessage("sample-chat_message");
    system.CreateRecording("sample-recording");
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

export const zoomSolution: ProblemSolution = {
  slug: 'zoom',
  title: 'Video Conferencing (Zoom) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a video conferencing system like Zoom supporting scheduled meetings, screen sharing, recording, and participant management. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Schedule meetings with a unique join link and meeting ID',
      'Join meetings as host or participant (up to 100 participants)',
      'Audio and video toggles per participant',
      'Screen and application sharing',
      'In-meeting chat with the group or privately',
      'Recording meetings to cloud or local storage',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Schedule meetings with a unique join link and meeting ID?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Join meetings as host or participant (up to 100 participants)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Audio and video toggles per participant?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Screen and application sharing?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'In-meeting chat with the group or privately?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. ZoomService is the facade stereotype. User, Meeting, MeetingParticipant, ChatMessage, Recording are concrete domain classes with id/name/status and validate/close.',
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
          'Construct ZoomService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'ZoomService', responsibility: 'UML facade - orchestrates Video Conferencing (Zoom).', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Meeting', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MeetingParticipant', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ChatMessage', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Recording', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from ZoomService to User, Meeting, MeetingParticipant, ChatMessage, Recording. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on ZoomService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'ZoomService', responsibility: 'UML facade - orchestrates Video Conferencing (Zoom).', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Meeting', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MeetingParticipant', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ChatMessage', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Recording', responsibility: 'UML class - domain object for Video Conferencing (Zoom).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'ZoomService exposes create/get/close and owns composed collections.' },
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
      'main constructs ZoomService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct ZoomService.',
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
