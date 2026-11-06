import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'OnlinePollingVotingPlatformService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_polls', 'Map<string, Poll>'),
    attr('-', '_options', 'Map<string, Option>'),
    attr('-', '_votes', 'Map<string, Vote>'),
    attr('-', '_poll_ids', 'Map<string, pollId>'),
    attr('-', '_option_ids', 'Map<string, optionId>'),
  ], [
    method('+', 'createPoll', 'name: string', 'Poll'),
    method('+', 'createOption', 'name: string', 'Option'),
    method('+', 'createVote', 'name: string', 'Vote'),
    method('+', 'createpollId', 'name: string', 'pollId'),
    method('+', 'createoptionId', 'name: string', 'optionId'),
    method('+', 'getPoll', 'id: string', 'Poll'),
    method('+', 'getOption', 'id: string', 'Option'),
    method('+', 'getVote', 'id: string', 'Vote'),
    method('+', 'getpollId', 'id: string', 'pollId'),
    method('+', 'getoptionId', 'id: string', 'optionId'),
    method('+', 'closePoll', 'id: string', 'Poll'),
  ], 'facade'),
  cls('n1', 'Poll', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Option', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Vote', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'pollId', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'optionId', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("online-polling-voting-platform")


class Poll:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Poll.id is required")
        if not name or not name.strip():
            raise ValueError("Poll.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Poll.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Poll {self.id} has invalid status={self.status}")
        log.info("[Poll.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Poll {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Poll.close] id=%s -> CLOSED", self.id)


class Option:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Option.id is required")
        if not name or not name.strip():
            raise ValueError("Option.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Option.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Option {self.id} has invalid status={self.status}")
        log.info("[Option.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Option {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Option.close] id=%s -> CLOSED", self.id)


class Vote:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Vote.id is required")
        if not name or not name.strip():
            raise ValueError("Vote.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Vote.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Vote {self.id} has invalid status={self.status}")
        log.info("[Vote.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Vote {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Vote.close] id=%s -> CLOSED", self.id)


class pollId:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("pollId.id is required")
        if not name or not name.strip():
            raise ValueError("pollId.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[pollId.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"pollId {self.id} has invalid status={self.status}")
        log.info("[pollId.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"pollId {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[pollId.close] id=%s -> CLOSED", self.id)


class optionId:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("optionId.id is required")
        if not name or not name.strip():
            raise ValueError("optionId.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[optionId.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"optionId {self.id} has invalid status={self.status}")
        log.info("[optionId.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"optionId {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[optionId.close] id=%s -> CLOSED", self.id)


class OnlinePollingVotingPlatformService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._polls: Dict[str, Poll] = {}
        self._options: Dict[str, Option] = {}
        self._votes: Dict[str, Vote] = {}
        self._poll_ids: Dict[str, pollId] = {}
        self._option_ids: Dict[str, optionId] = {}
        log.info("[OnlinePollingVotingPlatformService.__init__] system ready; managing: Poll, Option, Vote, pollId, optionId")

    def create_poll(self, name: str) -> Poll:
        """UML: OnlinePollingVotingPlatformService.create_poll(name) -> Poll"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Poll name is required")
        with self._lock:
            item_id = f"POL-{self._seq:04d}"
            self._seq += 1
            obj = Poll(item_id, cleaned)
            obj.validate()
            self._polls[item_id] = obj
            log.info("[OnlinePollingVotingPlatformService.create_poll] stored %s in _polls (count=%s)", item_id, len(self._polls))
            return obj

    def get_poll(self, item_id: str) -> Poll:
        with self._lock:
            obj = self._polls.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Poll id: {item_id}")
            log.info("[OnlinePollingVotingPlatformService.get_poll] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_option(self, name: str) -> Option:
        """UML: OnlinePollingVotingPlatformService.create_option(name) -> Option"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Option name is required")
        with self._lock:
            item_id = f"OPT-{self._seq:04d}"
            self._seq += 1
            obj = Option(item_id, cleaned)
            obj.validate()
            self._options[item_id] = obj
            log.info("[OnlinePollingVotingPlatformService.create_option] stored %s in _options (count=%s)", item_id, len(self._options))
            return obj

    def get_option(self, item_id: str) -> Option:
        with self._lock:
            obj = self._options.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Option id: {item_id}")
            log.info("[OnlinePollingVotingPlatformService.get_option] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_vote(self, name: str) -> Vote:
        """UML: OnlinePollingVotingPlatformService.create_vote(name) -> Vote"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Vote name is required")
        with self._lock:
            item_id = f"VOT-{self._seq:04d}"
            self._seq += 1
            obj = Vote(item_id, cleaned)
            obj.validate()
            self._votes[item_id] = obj
            log.info("[OnlinePollingVotingPlatformService.create_vote] stored %s in _votes (count=%s)", item_id, len(self._votes))
            return obj

    def get_vote(self, item_id: str) -> Vote:
        with self._lock:
            obj = self._votes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Vote id: {item_id}")
            log.info("[OnlinePollingVotingPlatformService.get_vote] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_poll_id(self, name: str) -> pollId:
        """UML: OnlinePollingVotingPlatformService.create_poll_id(name) -> pollId"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("pollId name is required")
        with self._lock:
            item_id = f"POL-{self._seq:04d}"
            self._seq += 1
            obj = pollId(item_id, cleaned)
            obj.validate()
            self._poll_ids[item_id] = obj
            log.info("[OnlinePollingVotingPlatformService.create_poll_id] stored %s in _poll_ids (count=%s)", item_id, len(self._poll_ids))
            return obj

    def get_poll_id(self, item_id: str) -> pollId:
        with self._lock:
            obj = self._poll_ids.get(item_id)
            if obj is None:
                raise KeyError(f"unknown pollId id: {item_id}")
            log.info("[OnlinePollingVotingPlatformService.get_poll_id] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_option_id(self, name: str) -> optionId:
        """UML: OnlinePollingVotingPlatformService.create_option_id(name) -> optionId"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("optionId name is required")
        with self._lock:
            item_id = f"OPT-{self._seq:04d}"
            self._seq += 1
            obj = optionId(item_id, cleaned)
            obj.validate()
            self._option_ids[item_id] = obj
            log.info("[OnlinePollingVotingPlatformService.create_option_id] stored %s in _option_ids (count=%s)", item_id, len(self._option_ids))
            return obj

    def get_option_id(self, item_id: str) -> optionId:
        with self._lock:
            obj = self._option_ids.get(item_id)
            if obj is None:
                raise KeyError(f"unknown optionId id: {item_id}")
            log.info("[OnlinePollingVotingPlatformService.get_option_id] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_poll(self, item_id: str) -> Poll:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._polls.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Poll id: {item_id}")
            log.info("[OnlinePollingVotingPlatformService.close_poll] closing %s via Poll.close()", item_id)
            obj.close()
            return obj

    def list_active_polls(self) -> List[Poll]:
        with self._lock:
            active = [o for o in self._polls.values() if o.status == "ACTIVE"]
            log.info("[OnlinePollingVotingPlatformService.list_active_polls] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct OnlinePollingVotingPlatformService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = OnlinePollingVotingPlatformService()

    log.info("========== STEP 2: Create primary Poll objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_poll("alpha-poll")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_poll("beta-poll")

    log.info("========== STEP 3: Create Option (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_option("sample-option")

    log.info("========== STEP 4: Create Vote (UML class) ==========")
    system.create_vote("sample-vote")

    log.info("========== STEP 5: Create pollId (UML class) ==========")
    system.create_poll_id("sample-poll_id")

    log.info("========== STEP 6: Create optionId (UML class) ==========")
    system.create_option_id("sample-option_id")

    log.info("========== STEP 7: Inspect active Poll list ==========")
    system.list_active_polls()

    log.info("========== STEP 8: Close first Poll ==========")
    system.close_poll(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_poll(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Poll.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_poll("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_poll: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_polls()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Poll {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Poll(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Poll.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Poll.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Poll.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Poll " + id + " invalid status");
    }
    System.out.println("[Poll.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Poll " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Poll.close] id=" + id + " -> CLOSED");
  }
}


class Option {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Option(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Option.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Option.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Option.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Option " + id + " invalid status");
    }
    System.out.println("[Option.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Option " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Option.close] id=" + id + " -> CLOSED");
  }
}


class Vote {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Vote(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Vote.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Vote.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Vote.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Vote " + id + " invalid status");
    }
    System.out.println("[Vote.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Vote " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Vote.close] id=" + id + " -> CLOSED");
  }
}


class pollId {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  pollId(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("pollId.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("pollId.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[pollId.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("pollId " + id + " invalid status");
    }
    System.out.println("[pollId.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("pollId " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[pollId.close] id=" + id + " -> CLOSED");
  }
}


class optionId {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  optionId(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("optionId.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("optionId.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[optionId.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("optionId " + id + " invalid status");
    }
    System.out.println("[optionId.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("optionId " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[optionId.close] id=" + id + " -> CLOSED");
  }
}

public class OnlinePollingVotingPlatformService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Poll> polls = new LinkedHashMap<>();
  private final Map<String, Option> options = new LinkedHashMap<>();
  private final Map<String, Vote> votes = new LinkedHashMap<>();
  private final Map<String, pollId> poll_ids = new LinkedHashMap<>();
  private final Map<String, optionId> option_ids = new LinkedHashMap<>();

  public OnlinePollingVotingPlatformService() {
    System.out.println("[OnlinePollingVotingPlatformService.__init__] system ready");
  }

  public Poll createPoll(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Poll name required");
    }
    lock.lock();
    try {
      String id = String.format("POL-%04d", seq++);
      Poll obj = new Poll(id, name.trim());
      obj.validate();
      polls.put(id, obj);
      System.out.println("[OnlinePollingVotingPlatformService.createPoll] stored " + id + " count=" + polls.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Poll getPoll(String id) {
    lock.lock();
    try {
      Poll obj = polls.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Poll id: " + id);
      }
      System.out.println("[OnlinePollingVotingPlatformService.getPoll] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Option createOption(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Option name required");
    }
    lock.lock();
    try {
      String id = String.format("OPT-%04d", seq++);
      Option obj = new Option(id, name.trim());
      obj.validate();
      options.put(id, obj);
      System.out.println("[OnlinePollingVotingPlatformService.createOption] stored " + id + " count=" + options.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Option getOption(String id) {
    lock.lock();
    try {
      Option obj = options.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Option id: " + id);
      }
      System.out.println("[OnlinePollingVotingPlatformService.getOption] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Vote createVote(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Vote name required");
    }
    lock.lock();
    try {
      String id = String.format("VOT-%04d", seq++);
      Vote obj = new Vote(id, name.trim());
      obj.validate();
      votes.put(id, obj);
      System.out.println("[OnlinePollingVotingPlatformService.createVote] stored " + id + " count=" + votes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Vote getVote(String id) {
    lock.lock();
    try {
      Vote obj = votes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Vote id: " + id);
      }
      System.out.println("[OnlinePollingVotingPlatformService.getVote] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public pollId createpollId(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("pollId name required");
    }
    lock.lock();
    try {
      String id = String.format("POL-%04d", seq++);
      pollId obj = new pollId(id, name.trim());
      obj.validate();
      poll_ids.put(id, obj);
      System.out.println("[OnlinePollingVotingPlatformService.createpollId] stored " + id + " count=" + poll_ids.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public pollId getpollId(String id) {
    lock.lock();
    try {
      pollId obj = poll_ids.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown pollId id: " + id);
      }
      System.out.println("[OnlinePollingVotingPlatformService.getpollId] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public optionId createoptionId(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("optionId name required");
    }
    lock.lock();
    try {
      String id = String.format("OPT-%04d", seq++);
      optionId obj = new optionId(id, name.trim());
      obj.validate();
      option_ids.put(id, obj);
      System.out.println("[OnlinePollingVotingPlatformService.createoptionId] stored " + id + " count=" + option_ids.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public optionId getoptionId(String id) {
    lock.lock();
    try {
      optionId obj = option_ids.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown optionId id: " + id);
      }
      System.out.println("[OnlinePollingVotingPlatformService.getoptionId] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Poll closePoll(String id) {
    lock.lock();
    try {
      Poll obj = polls.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Poll id: " + id);
      }
      System.out.println("[OnlinePollingVotingPlatformService.closePoll] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Poll> listActivePolls() {
    lock.lock();
    try {
      List<Poll> out = new ArrayList<>();
      for (Poll o : polls.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[OnlinePollingVotingPlatformService.listActivePolls] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct OnlinePollingVotingPlatformService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    OnlinePollingVotingPlatformService system = new OnlinePollingVotingPlatformService();
    System.out.println("========== STEP 2: Create Poll objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Poll first = system.createPoll("alpha-poll");
    system.createPoll("beta-poll");
    System.out.println("========== STEP 3: Create Option ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createOption("sample-option");
    System.out.println("========== STEP 4: Create Vote ==========");
    system.createVote("sample-vote");
    System.out.println("========== STEP 5: Create pollId ==========");
    system.createpollId("sample-poll_id");
    System.out.println("========== STEP 6: Create optionId ==========");
    system.createoptionId("sample-option_id");
    System.out.println("========== Inspect active list ==========");
    system.listActivePolls();
    System.out.println("========== Close first Poll ==========");
    system.closePoll(first.getId());
    try {
      system.closePoll(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getPoll("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Poll {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Poll.id required')
    }

    if (!name?.trim()) {
      throw new Error('Poll.name required')
    }
    console.log(\`[Poll.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Poll \${this.id} invalid status\`)
    }
    console.log(\`[Poll.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Poll \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Poll.close] id=\${this.id} -> CLOSED\`)
  }
}


class Option {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Option.id required')
    }

    if (!name?.trim()) {
      throw new Error('Option.name required')
    }
    console.log(\`[Option.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Option \${this.id} invalid status\`)
    }
    console.log(\`[Option.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Option \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Option.close] id=\${this.id} -> CLOSED\`)
  }
}


class Vote {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Vote.id required')
    }

    if (!name?.trim()) {
      throw new Error('Vote.name required')
    }
    console.log(\`[Vote.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Vote \${this.id} invalid status\`)
    }
    console.log(\`[Vote.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Vote \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Vote.close] id=\${this.id} -> CLOSED\`)
  }
}


class pollId {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('pollId.id required')
    }

    if (!name?.trim()) {
      throw new Error('pollId.name required')
    }
    console.log(\`[pollId.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`pollId \${this.id} invalid status\`)
    }
    console.log(\`[pollId.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`pollId \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[pollId.close] id=\${this.id} -> CLOSED\`)
  }
}


class optionId {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('optionId.id required')
    }

    if (!name?.trim()) {
      throw new Error('optionId.name required')
    }
    console.log(\`[optionId.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`optionId \${this.id} invalid status\`)
    }
    console.log(\`[optionId.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`optionId \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[optionId.close] id=\${this.id} -> CLOSED\`)
  }
}

class OnlinePollingVotingPlatformService {
  private seq = 1
  private polls = new Map<string, Poll>()
  private options = new Map<string, Option>()
  private votes = new Map<string, Vote>()
  private poll_ids = new Map<string, pollId>()
  private option_ids = new Map<string, optionId>()
  constructor() {
    console.log('[OnlinePollingVotingPlatformService.__init__] system ready')
  }

  createPoll(name: string): Poll {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Poll name required')
    }
    const id = \`POL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Poll(id, cleaned)
    obj.validate()
    this.polls.set(id, obj)
    console.log(\`[OnlinePollingVotingPlatformService.createPoll] stored \${id} count=\${this.polls.size}\`)
    return obj
  }

  getPoll(id: string): Poll {
    const obj = this.polls.get(id)
    if (!obj) {
      throw new Error(\`unknown Poll id: \${id}\`)
    }
    console.log(\`[OnlinePollingVotingPlatformService.getPoll] found id=\${obj.id}\`)
    return obj
  }

  createOption(name: string): Option {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Option name required')
    }
    const id = \`OPT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Option(id, cleaned)
    obj.validate()
    this.options.set(id, obj)
    console.log(\`[OnlinePollingVotingPlatformService.createOption] stored \${id} count=\${this.options.size}\`)
    return obj
  }

  getOption(id: string): Option {
    const obj = this.options.get(id)
    if (!obj) {
      throw new Error(\`unknown Option id: \${id}\`)
    }
    console.log(\`[OnlinePollingVotingPlatformService.getOption] found id=\${obj.id}\`)
    return obj
  }

  createVote(name: string): Vote {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Vote name required')
    }
    const id = \`VOT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Vote(id, cleaned)
    obj.validate()
    this.votes.set(id, obj)
    console.log(\`[OnlinePollingVotingPlatformService.createVote] stored \${id} count=\${this.votes.size}\`)
    return obj
  }

  getVote(id: string): Vote {
    const obj = this.votes.get(id)
    if (!obj) {
      throw new Error(\`unknown Vote id: \${id}\`)
    }
    console.log(\`[OnlinePollingVotingPlatformService.getVote] found id=\${obj.id}\`)
    return obj
  }

  createpollId(name: string): pollId {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('pollId name required')
    }
    const id = \`POL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new pollId(id, cleaned)
    obj.validate()
    this.poll_ids.set(id, obj)
    console.log(\`[OnlinePollingVotingPlatformService.createpollId] stored \${id} count=\${this.poll_ids.size}\`)
    return obj
  }

  getpollId(id: string): pollId {
    const obj = this.poll_ids.get(id)
    if (!obj) {
      throw new Error(\`unknown pollId id: \${id}\`)
    }
    console.log(\`[OnlinePollingVotingPlatformService.getpollId] found id=\${obj.id}\`)
    return obj
  }

  createoptionId(name: string): optionId {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('optionId name required')
    }
    const id = \`OPT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new optionId(id, cleaned)
    obj.validate()
    this.option_ids.set(id, obj)
    console.log(\`[OnlinePollingVotingPlatformService.createoptionId] stored \${id} count=\${this.option_ids.size}\`)
    return obj
  }

  getoptionId(id: string): optionId {
    const obj = this.option_ids.get(id)
    if (!obj) {
      throw new Error(\`unknown optionId id: \${id}\`)
    }
    console.log(\`[OnlinePollingVotingPlatformService.getoptionId] found id=\${obj.id}\`)
    return obj
  }

  closePoll(id: string): Poll {
    const obj = this.getPoll(id)
    console.log(\`[OnlinePollingVotingPlatformService.closePoll] closing \${id}\`)
    obj.close()
    return obj
  }

  listActivePolls(): Poll[] {
    const active = [...this.polls.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[OnlinePollingVotingPlatformService.listActivePolls] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct OnlinePollingVotingPlatformService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new OnlinePollingVotingPlatformService()
  console.log('========== STEP 2: Create Poll objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createPoll('alpha-poll')
  system.createPoll('beta-poll')
  console.log('========== STEP 3: Create Option ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createOption('sample-option')
  console.log('========== STEP 4: Create Vote ==========')
  system.createVote('sample-vote')
  console.log('========== STEP 5: Create pollId ==========')
  system.createpollId('sample-poll_id')
  console.log('========== STEP 6: Create optionId ==========')
  system.createoptionId('sample-option_id')
  system.listActivePolls()
  console.log('========== Close first Poll ==========')
  system.closePoll(first.id)
  try {
    system.closePoll(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getPoll('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Poll {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Poll(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Poll requires id and name");
    }
    cout << "[Poll.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Poll invalid status");
    }
    cout << "[Poll.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Poll cannot close");
    }
    status_ = "CLOSED";
    cout << "[Poll.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Option {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Option(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Option requires id and name");
    }
    cout << "[Option.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Option invalid status");
    }
    cout << "[Option.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Option cannot close");
    }
    status_ = "CLOSED";
    cout << "[Option.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Vote {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Vote(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Vote requires id and name");
    }
    cout << "[Vote.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Vote invalid status");
    }
    cout << "[Vote.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Vote cannot close");
    }
    status_ = "CLOSED";
    cout << "[Vote.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class pollId {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  pollId(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("pollId requires id and name");
    }
    cout << "[pollId.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("pollId invalid status");
    }
    cout << "[pollId.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("pollId cannot close");
    }
    status_ = "CLOSED";
    cout << "[pollId.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class optionId {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  optionId(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("optionId requires id and name");
    }
    cout << "[optionId.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("optionId invalid status");
    }
    cout << "[optionId.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("optionId cannot close");
    }
    status_ = "CLOSED";
    cout << "[optionId.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class OnlinePollingVotingPlatformService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Poll> polls_;
  unordered_map<string, Option> options_;
  unordered_map<string, Vote> votes_;
  unordered_map<string, pollId> poll_ids_;
  unordered_map<string, optionId> option_ids_;
public:
  OnlinePollingVotingPlatformService() {
    cout << "[OnlinePollingVotingPlatformService.__init__] system ready" << endl;
  }

  Poll createPoll(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Poll name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "POL-%04d", seq_++);
    Poll obj{buf, name};
    obj.validate();
    polls_.emplace(obj.id(), obj);
    cout << "[OnlinePollingVotingPlatformService.createPoll] stored " << obj.id() << endl;
    return obj;
  }

  Poll getPoll(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = polls_.find(id);
    if (it == polls_.end()) {
      throw out_of_range("unknown Poll id");
    }
    cout << "[OnlinePollingVotingPlatformService.getPoll] found " << id << endl;
    return it->second;
  }

  Option createOption(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Option name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "OPT-%04d", seq_++);
    Option obj{buf, name};
    obj.validate();
    options_.emplace(obj.id(), obj);
    cout << "[OnlinePollingVotingPlatformService.createOption] stored " << obj.id() << endl;
    return obj;
  }

  Option getOption(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = options_.find(id);
    if (it == options_.end()) {
      throw out_of_range("unknown Option id");
    }
    cout << "[OnlinePollingVotingPlatformService.getOption] found " << id << endl;
    return it->second;
  }

  Vote createVote(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Vote name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VOT-%04d", seq_++);
    Vote obj{buf, name};
    obj.validate();
    votes_.emplace(obj.id(), obj);
    cout << "[OnlinePollingVotingPlatformService.createVote] stored " << obj.id() << endl;
    return obj;
  }

  Vote getVote(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = votes_.find(id);
    if (it == votes_.end()) {
      throw out_of_range("unknown Vote id");
    }
    cout << "[OnlinePollingVotingPlatformService.getVote] found " << id << endl;
    return it->second;
  }

  pollId createpollId(const string& name) {
    if (name.empty()) {
      throw invalid_argument("pollId name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "POL-%04d", seq_++);
    pollId obj{buf, name};
    obj.validate();
    poll_ids_.emplace(obj.id(), obj);
    cout << "[OnlinePollingVotingPlatformService.createpollId] stored " << obj.id() << endl;
    return obj;
  }

  pollId getpollId(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = poll_ids_.find(id);
    if (it == poll_ids_.end()) {
      throw out_of_range("unknown pollId id");
    }
    cout << "[OnlinePollingVotingPlatformService.getpollId] found " << id << endl;
    return it->second;
  }

  optionId createoptionId(const string& name) {
    if (name.empty()) {
      throw invalid_argument("optionId name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "OPT-%04d", seq_++);
    optionId obj{buf, name};
    obj.validate();
    option_ids_.emplace(obj.id(), obj);
    cout << "[OnlinePollingVotingPlatformService.createoptionId] stored " << obj.id() << endl;
    return obj;
  }

  optionId getoptionId(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = option_ids_.find(id);
    if (it == option_ids_.end()) {
      throw out_of_range("unknown optionId id");
    }
    cout << "[OnlinePollingVotingPlatformService.getoptionId] found " << id << endl;
    return it->second;
  }

  Poll closePoll(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = polls_.find(id);
    if (it == polls_.end()) {
      throw out_of_range("unknown Poll");
    }
    cout << "[OnlinePollingVotingPlatformService.closePoll] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct OnlinePollingVotingPlatformService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  OnlinePollingVotingPlatformService system;
  cout << "========== STEP 2: Create Poll ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createPoll("alpha-poll");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createPoll("beta-poll");
  system.createOption("sample-option");
  system.createVote("sample-vote");
  system.createpollId("sample-poll_id");
  system.createoptionId("sample-option_id");
  system.closePoll(first.id());
  try {
    system.closePoll(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getPoll("MISSING-ID");
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

type Poll struct {
  ID     string
  Name   string
  Status string
}

func NewPoll(id, name string) (*Poll, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Poll requires id and name")
  }
  obj := &Poll{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Poll.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Poll) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Poll invalid status")
  }
  fmt.Printf("[Poll.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Poll) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Poll %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Poll.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Option struct {
  ID     string
  Name   string
  Status string
}

func NewOption(id, name string) (*Option, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Option requires id and name")
  }
  obj := &Option{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Option.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Option) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Option invalid status")
  }
  fmt.Printf("[Option.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Option) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Option %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Option.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Vote struct {
  ID     string
  Name   string
  Status string
}

func NewVote(id, name string) (*Vote, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Vote requires id and name")
  }
  obj := &Vote{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Vote.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Vote) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Vote invalid status")
  }
  fmt.Printf("[Vote.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Vote) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Vote %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Vote.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type pollId struct {
  ID     string
  Name   string
  Status string
}

func NewpollId(id, name string) (*pollId, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("pollId requires id and name")
  }
  obj := &pollId{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[pollId.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *pollId) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("pollId invalid status")
  }
  fmt.Printf("[pollId.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *pollId) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("pollId %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[pollId.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type optionId struct {
  ID     string
  Name   string
  Status string
}

func NewoptionId(id, name string) (*optionId, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("optionId requires id and name")
  }
  obj := &optionId{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[optionId.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *optionId) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("optionId invalid status")
  }
  fmt.Printf("[optionId.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *optionId) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("optionId %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[optionId.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type OnlinePollingVotingPlatformService struct {
  mu  sync.Mutex
  seq int
  polls map[string]*Poll
  options map[string]*Option
  votes map[string]*Vote
  poll_ids map[string]*pollId
  option_ids map[string]*optionId
}

func NewOnlinePollingVotingPlatformService() *OnlinePollingVotingPlatformService {
  fmt.Println("[OnlinePollingVotingPlatformService.__init__] system ready")
  return &OnlinePollingVotingPlatformService{
    seq: 1,
    polls: map[string]*Poll{},
    options: map[string]*Option{},
    votes: map[string]*Vote{},
    poll_ids: map[string]*pollId{},
    option_ids: map[string]*optionId{},
  }
}

func (s *OnlinePollingVotingPlatformService) CreatePoll(name string) (*Poll, error) {
  if name == "" {
    return nil, fmt.Errorf("Poll name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("POL-%04d", s.seq)
  s.seq++
  obj, err := NewPoll(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.polls[id] = obj
  fmt.Printf("[OnlinePollingVotingPlatformService.CreatePoll] stored %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) GetPoll(id string) (*Poll, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.polls[id]
  if !ok {
    return nil, fmt.Errorf("unknown Poll id: %s", id)
  }
  fmt.Printf("[OnlinePollingVotingPlatformService.GetPoll] found %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) CreateOption(name string) (*Option, error) {
  if name == "" {
    return nil, fmt.Errorf("Option name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("OPT-%04d", s.seq)
  s.seq++
  obj, err := NewOption(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.options[id] = obj
  fmt.Printf("[OnlinePollingVotingPlatformService.CreateOption] stored %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) GetOption(id string) (*Option, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.options[id]
  if !ok {
    return nil, fmt.Errorf("unknown Option id: %s", id)
  }
  fmt.Printf("[OnlinePollingVotingPlatformService.GetOption] found %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) CreateVote(name string) (*Vote, error) {
  if name == "" {
    return nil, fmt.Errorf("Vote name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VOT-%04d", s.seq)
  s.seq++
  obj, err := NewVote(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.votes[id] = obj
  fmt.Printf("[OnlinePollingVotingPlatformService.CreateVote] stored %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) GetVote(id string) (*Vote, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.votes[id]
  if !ok {
    return nil, fmt.Errorf("unknown Vote id: %s", id)
  }
  fmt.Printf("[OnlinePollingVotingPlatformService.GetVote] found %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) CreatepollId(name string) (*pollId, error) {
  if name == "" {
    return nil, fmt.Errorf("pollId name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("POL-%04d", s.seq)
  s.seq++
  obj, err := NewpollId(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.poll_ids[id] = obj
  fmt.Printf("[OnlinePollingVotingPlatformService.CreatepollId] stored %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) GetpollId(id string) (*pollId, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.poll_ids[id]
  if !ok {
    return nil, fmt.Errorf("unknown pollId id: %s", id)
  }
  fmt.Printf("[OnlinePollingVotingPlatformService.GetpollId] found %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) CreateoptionId(name string) (*optionId, error) {
  if name == "" {
    return nil, fmt.Errorf("optionId name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("OPT-%04d", s.seq)
  s.seq++
  obj, err := NewoptionId(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.option_ids[id] = obj
  fmt.Printf("[OnlinePollingVotingPlatformService.CreateoptionId] stored %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) GetoptionId(id string) (*optionId, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.option_ids[id]
  if !ok {
    return nil, fmt.Errorf("unknown optionId id: %s", id)
  }
  fmt.Printf("[OnlinePollingVotingPlatformService.GetoptionId] found %s\\n", id)
  return obj, nil
}

func (s *OnlinePollingVotingPlatformService) ClosePoll(id string) (*Poll, error) {
  obj, err := s.GetPoll(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[OnlinePollingVotingPlatformService.ClosePoll] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct OnlinePollingVotingPlatformService ==========")
  system := NewOnlinePollingVotingPlatformService()
  fmt.Println("========== STEP 2: Create Poll ==========")
  first, _ := system.CreatePoll("alpha-poll")
  system.CreatePoll("beta-poll")
  system.CreateOption("sample-option")
  system.CreateVote("sample-vote")
  system.CreatepollId("sample-poll_id")
  system.CreateoptionId("sample-option_id")
  system.ClosePoll(first.ID)
  if _, err := system.ClosePoll(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetPoll("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Poll {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Poll(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Poll requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Poll.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Poll invalid status");
    }
    Console.WriteLine("[Poll.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Poll " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Poll.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Option {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Option(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Option requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Option.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Option invalid status");
    }
    Console.WriteLine("[Option.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Option " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Option.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Vote {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Vote(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Vote requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Vote.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Vote invalid status");
    }
    Console.WriteLine("[Vote.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Vote " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Vote.close] id=" + Id + " -> CLOSED");
  }
}


sealed class pollId {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public pollId(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("pollId requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[pollId.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("pollId invalid status");
    }
    Console.WriteLine("[pollId.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("pollId " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[pollId.close] id=" + Id + " -> CLOSED");
  }
}


sealed class optionId {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public optionId(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("optionId requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[optionId.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("optionId invalid status");
    }
    Console.WriteLine("[optionId.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("optionId " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[optionId.close] id=" + Id + " -> CLOSED");
  }
}

sealed class OnlinePollingVotingPlatformService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Poll> _polls = new();
  private readonly Dictionary<string, Option> _options = new();
  private readonly Dictionary<string, Vote> _votes = new();
  private readonly Dictionary<string, pollId> _poll_ids = new();
  private readonly Dictionary<string, optionId> _option_ids = new();
  public OnlinePollingVotingPlatformService() {
    Console.WriteLine("[OnlinePollingVotingPlatformService.__init__] system ready");
  }

  public Poll CreatePoll(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Poll name required");
    }
    lock (_gate) {
      var id = string.Format("POL-{0:D4}", _seq++);
      var obj = new Poll(id, name.Trim());
      obj.Validate();
      _polls[id] = obj;
      Console.WriteLine("[OnlinePollingVotingPlatformService.CreatePoll] stored " + id);
      return obj;
    }
  }

  public Poll GetPoll(string id) {
    lock (_gate) {
      if (!_polls.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Poll id: " + id);
      }
      Console.WriteLine("[OnlinePollingVotingPlatformService.GetPoll] found " + id);
      return obj;
    }
  }

  public Option CreateOption(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Option name required");
    }
    lock (_gate) {
      var id = string.Format("OPT-{0:D4}", _seq++);
      var obj = new Option(id, name.Trim());
      obj.Validate();
      _options[id] = obj;
      Console.WriteLine("[OnlinePollingVotingPlatformService.CreateOption] stored " + id);
      return obj;
    }
  }

  public Option GetOption(string id) {
    lock (_gate) {
      if (!_options.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Option id: " + id);
      }
      Console.WriteLine("[OnlinePollingVotingPlatformService.GetOption] found " + id);
      return obj;
    }
  }

  public Vote CreateVote(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Vote name required");
    }
    lock (_gate) {
      var id = string.Format("VOT-{0:D4}", _seq++);
      var obj = new Vote(id, name.Trim());
      obj.Validate();
      _votes[id] = obj;
      Console.WriteLine("[OnlinePollingVotingPlatformService.CreateVote] stored " + id);
      return obj;
    }
  }

  public Vote GetVote(string id) {
    lock (_gate) {
      if (!_votes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Vote id: " + id);
      }
      Console.WriteLine("[OnlinePollingVotingPlatformService.GetVote] found " + id);
      return obj;
    }
  }

  public pollId CreatepollId(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("pollId name required");
    }
    lock (_gate) {
      var id = string.Format("POL-{0:D4}", _seq++);
      var obj = new pollId(id, name.Trim());
      obj.Validate();
      _poll_ids[id] = obj;
      Console.WriteLine("[OnlinePollingVotingPlatformService.CreatepollId] stored " + id);
      return obj;
    }
  }

  public pollId GetpollId(string id) {
    lock (_gate) {
      if (!_poll_ids.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown pollId id: " + id);
      }
      Console.WriteLine("[OnlinePollingVotingPlatformService.GetpollId] found " + id);
      return obj;
    }
  }

  public optionId CreateoptionId(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("optionId name required");
    }
    lock (_gate) {
      var id = string.Format("OPT-{0:D4}", _seq++);
      var obj = new optionId(id, name.Trim());
      obj.Validate();
      _option_ids[id] = obj;
      Console.WriteLine("[OnlinePollingVotingPlatformService.CreateoptionId] stored " + id);
      return obj;
    }
  }

  public optionId GetoptionId(string id) {
    lock (_gate) {
      if (!_option_ids.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown optionId id: " + id);
      }
      Console.WriteLine("[OnlinePollingVotingPlatformService.GetoptionId] found " + id);
      return obj;
    }
  }

  public Poll ClosePoll(string id) {
    var obj = GetPoll(id);
    Console.WriteLine("[OnlinePollingVotingPlatformService.ClosePoll] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct OnlinePollingVotingPlatformService ==========");
    var system = new OnlinePollingVotingPlatformService();
    Console.WriteLine("========== STEP 2: Create Poll ==========");
    var first = system.CreatePoll("alpha-poll");
    system.CreatePoll("beta-poll");
    system.CreateOption("sample-option");
    system.CreateVote("sample-vote");
    system.CreatepollId("sample-poll_id");
    system.CreateoptionId("sample-option_id");
    system.ClosePoll(first.Id);
    try {
      system.ClosePoll(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetPoll("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const onlinePollingVotingPlatformSolution: ProblemSolution = {
  slug: 'online-polling-voting-platform',
  title: 'Online Polling / Voting Platform - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a platform for creating polls and collecting votes at scale, with real-time result aggregation and fraud prevention. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Create a poll with multiple options and an optional end time',
      'Cast a single vote per user per poll',
      'Show live-updating vote counts and percentages',
      'Prevent duplicate voting (same user, same poll)',
      'Support anonymous vs. authenticated polls',
      'Close a poll and lock in final results',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Create a poll with multiple options and an optional end time?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Cast a single vote per user per poll?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Show live-updating vote counts and percentages?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Prevent duplicate voting (same user, same poll)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support anonymous vs. authenticated polls?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. OnlinePollingVotingPlatformService is the facade stereotype. Poll, Option, Vote, pollId, optionId are concrete domain classes with id/name/status and validate/close.',
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
          'Construct OnlinePollingVotingPlatformService.',
          'createPoll twice and create the related UML classes.',
          'closePoll once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'OnlinePollingVotingPlatformService', responsibility: 'UML facade - orchestrates Online Polling / Voting Platform.', keyMembers: ['create*', 'get*', 'closePoll'] },
    { name: 'Poll', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Option', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Vote', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'pollId', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'optionId', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from OnlinePollingVotingPlatformService to Poll, Option, Vote, pollId, optionId. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on OnlinePollingVotingPlatformService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'OnlinePollingVotingPlatformService', responsibility: 'UML facade - orchestrates Online Polling / Voting Platform.', keyMembers: ['create*', 'get*', 'closePoll'] },
    { name: 'Poll', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Option', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Vote', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'pollId', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'optionId', responsibility: 'UML class - domain object for Online Polling / Voting Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'OnlinePollingVotingPlatformService exposes create/get/close and owns composed collections.' },
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
      'main constructs OnlinePollingVotingPlatformService, creates UML domain objects, closes the primary Poll, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct OnlinePollingVotingPlatformService.',
      'createPoll for alpha and beta.',
      'create remaining UML classes.',
      'closePoll(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createPoll("alpha..."); closePoll(id)',
        output: '[Poll.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closePoll(alreadyClosed) or getPoll("MISSING-ID")',
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
