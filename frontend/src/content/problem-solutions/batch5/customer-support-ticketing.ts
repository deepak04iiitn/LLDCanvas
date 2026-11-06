import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CustomerSupportTicketingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_tickets', 'Map<string, Ticket>'),
    attr('-', '_priorities', 'Map<string, priority>'),
    attr('-', '_slas', 'Map<string, SLA>'),
    attr('-', '_agents', 'Map<string, Agent>'),
    attr('-', '_replies', 'Map<string, Reply>'),
  ], [
    method('+', 'createTicket', 'name: string', 'Ticket'),
    method('+', 'createpriority', 'name: string', 'priority'),
    method('+', 'createSLA', 'name: string', 'SLA'),
    method('+', 'createAgent', 'name: string', 'Agent'),
    method('+', 'createReply', 'name: string', 'Reply'),
    method('+', 'getTicket', 'id: string', 'Ticket'),
    method('+', 'getpriority', 'id: string', 'priority'),
    method('+', 'getSLA', 'id: string', 'SLA'),
    method('+', 'getAgent', 'id: string', 'Agent'),
    method('+', 'getReply', 'id: string', 'Reply'),
    method('+', 'closeTicket', 'id: string', 'Ticket'),
  ], 'facade'),
  cls('n1', 'Ticket', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'priority', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'SLA', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Agent', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Reply', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("customer-support-ticketing")


class Ticket:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Ticket.id is required")
        if not name or not name.strip():
            raise ValueError("Ticket.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Ticket.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Ticket {self.id} has invalid status={self.status}")
        log.info("[Ticket.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Ticket {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Ticket.close] id=%s -> CLOSED", self.id)


class priority:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("priority.id is required")
        if not name or not name.strip():
            raise ValueError("priority.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[priority.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"priority {self.id} has invalid status={self.status}")
        log.info("[priority.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"priority {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[priority.close] id=%s -> CLOSED", self.id)


class SLA:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("SLA.id is required")
        if not name or not name.strip():
            raise ValueError("SLA.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[SLA.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"SLA {self.id} has invalid status={self.status}")
        log.info("[SLA.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"SLA {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[SLA.close] id=%s -> CLOSED", self.id)


class Agent:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Agent.id is required")
        if not name or not name.strip():
            raise ValueError("Agent.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Agent.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Agent {self.id} has invalid status={self.status}")
        log.info("[Agent.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Agent {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Agent.close] id=%s -> CLOSED", self.id)


class Reply:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Reply.id is required")
        if not name or not name.strip():
            raise ValueError("Reply.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Reply.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Reply {self.id} has invalid status={self.status}")
        log.info("[Reply.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Reply {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Reply.close] id=%s -> CLOSED", self.id)


class CustomerSupportTicketingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._tickets: Dict[str, Ticket] = {}
        self._priorities: Dict[str, priority] = {}
        self._slas: Dict[str, SLA] = {}
        self._agents: Dict[str, Agent] = {}
        self._replies: Dict[str, Reply] = {}
        log.info("[CustomerSupportTicketingService.__init__] system ready; managing: Ticket, priority, SLA, Agent, Reply")

    def create_ticket(self, name: str) -> Ticket:
        """UML: CustomerSupportTicketingService.create_ticket(name) -> Ticket"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Ticket name is required")
        with self._lock:
            item_id = f"TIC-{self._seq:04d}"
            self._seq += 1
            obj = Ticket(item_id, cleaned)
            obj.validate()
            self._tickets[item_id] = obj
            log.info("[CustomerSupportTicketingService.create_ticket] stored %s in _tickets (count=%s)", item_id, len(self._tickets))
            return obj

    def get_ticket(self, item_id: str) -> Ticket:
        with self._lock:
            obj = self._tickets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Ticket id: {item_id}")
            log.info("[CustomerSupportTicketingService.get_ticket] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_priority(self, name: str) -> priority:
        """UML: CustomerSupportTicketingService.create_priority(name) -> priority"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("priority name is required")
        with self._lock:
            item_id = f"PRI-{self._seq:04d}"
            self._seq += 1
            obj = priority(item_id, cleaned)
            obj.validate()
            self._priorities[item_id] = obj
            log.info("[CustomerSupportTicketingService.create_priority] stored %s in _priorities (count=%s)", item_id, len(self._priorities))
            return obj

    def get_priority(self, item_id: str) -> priority:
        with self._lock:
            obj = self._priorities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown priority id: {item_id}")
            log.info("[CustomerSupportTicketingService.get_priority] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_sla(self, name: str) -> SLA:
        """UML: CustomerSupportTicketingService.create_sla(name) -> SLA"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("SLA name is required")
        with self._lock:
            item_id = f"SLA-{self._seq:04d}"
            self._seq += 1
            obj = SLA(item_id, cleaned)
            obj.validate()
            self._slas[item_id] = obj
            log.info("[CustomerSupportTicketingService.create_sla] stored %s in _slas (count=%s)", item_id, len(self._slas))
            return obj

    def get_sla(self, item_id: str) -> SLA:
        with self._lock:
            obj = self._slas.get(item_id)
            if obj is None:
                raise KeyError(f"unknown SLA id: {item_id}")
            log.info("[CustomerSupportTicketingService.get_sla] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_agent(self, name: str) -> Agent:
        """UML: CustomerSupportTicketingService.create_agent(name) -> Agent"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Agent name is required")
        with self._lock:
            item_id = f"AGE-{self._seq:04d}"
            self._seq += 1
            obj = Agent(item_id, cleaned)
            obj.validate()
            self._agents[item_id] = obj
            log.info("[CustomerSupportTicketingService.create_agent] stored %s in _agents (count=%s)", item_id, len(self._agents))
            return obj

    def get_agent(self, item_id: str) -> Agent:
        with self._lock:
            obj = self._agents.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Agent id: {item_id}")
            log.info("[CustomerSupportTicketingService.get_agent] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_reply(self, name: str) -> Reply:
        """UML: CustomerSupportTicketingService.create_reply(name) -> Reply"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Reply name is required")
        with self._lock:
            item_id = f"REP-{self._seq:04d}"
            self._seq += 1
            obj = Reply(item_id, cleaned)
            obj.validate()
            self._replies[item_id] = obj
            log.info("[CustomerSupportTicketingService.create_reply] stored %s in _replies (count=%s)", item_id, len(self._replies))
            return obj

    def get_reply(self, item_id: str) -> Reply:
        with self._lock:
            obj = self._replies.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Reply id: {item_id}")
            log.info("[CustomerSupportTicketingService.get_reply] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_ticket(self, item_id: str) -> Ticket:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._tickets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Ticket id: {item_id}")
            log.info("[CustomerSupportTicketingService.close_ticket] closing %s via Ticket.close()", item_id)
            obj.close()
            return obj

    def list_active_tickets(self) -> List[Ticket]:
        with self._lock:
            active = [o for o in self._tickets.values() if o.status == "ACTIVE"]
            log.info("[CustomerSupportTicketingService.list_active_tickets] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CustomerSupportTicketingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CustomerSupportTicketingService()

    log.info("========== STEP 2: Create primary Ticket objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_ticket("alpha-ticket")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_ticket("beta-ticket")

    log.info("========== STEP 3: Create priority (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_priority("sample-priority")

    log.info("========== STEP 4: Create SLA (UML class) ==========")
    system.create_sla("sample-sla")

    log.info("========== STEP 5: Create Agent (UML class) ==========")
    system.create_agent("sample-agent")

    log.info("========== STEP 6: Create Reply (UML class) ==========")
    system.create_reply("sample-reply")

    log.info("========== STEP 7: Inspect active Ticket list ==========")
    system.list_active_tickets()

    log.info("========== STEP 8: Close first Ticket ==========")
    system.close_ticket(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_ticket(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Ticket.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_ticket("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_ticket: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_tickets()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Ticket {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Ticket(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Ticket.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Ticket.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Ticket.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Ticket " + id + " invalid status");
    }
    System.out.println("[Ticket.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Ticket " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Ticket.close] id=" + id + " -> CLOSED");
  }
}


class priority {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  priority(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("priority.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("priority.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[priority.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("priority " + id + " invalid status");
    }
    System.out.println("[priority.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("priority " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[priority.close] id=" + id + " -> CLOSED");
  }
}


class SLA {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  SLA(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("SLA.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SLA.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[SLA.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("SLA " + id + " invalid status");
    }
    System.out.println("[SLA.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("SLA " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[SLA.close] id=" + id + " -> CLOSED");
  }
}


class Agent {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Agent(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Agent.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Agent.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Agent.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Agent " + id + " invalid status");
    }
    System.out.println("[Agent.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Agent " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Agent.close] id=" + id + " -> CLOSED");
  }
}


class Reply {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Reply(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Reply.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Reply.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Reply.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Reply " + id + " invalid status");
    }
    System.out.println("[Reply.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Reply " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Reply.close] id=" + id + " -> CLOSED");
  }
}

public class CustomerSupportTicketingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Ticket> tickets = new LinkedHashMap<>();
  private final Map<String, priority> priorities = new LinkedHashMap<>();
  private final Map<String, SLA> slas = new LinkedHashMap<>();
  private final Map<String, Agent> agents = new LinkedHashMap<>();
  private final Map<String, Reply> replies = new LinkedHashMap<>();

  public CustomerSupportTicketingService() {
    System.out.println("[CustomerSupportTicketingService.__init__] system ready");
  }

  public Ticket createTicket(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Ticket name required");
    }
    lock.lock();
    try {
      String id = String.format("TIC-%04d", seq++);
      Ticket obj = new Ticket(id, name.trim());
      obj.validate();
      tickets.put(id, obj);
      System.out.println("[CustomerSupportTicketingService.createTicket] stored " + id + " count=" + tickets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Ticket getTicket(String id) {
    lock.lock();
    try {
      Ticket obj = tickets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Ticket id: " + id);
      }
      System.out.println("[CustomerSupportTicketingService.getTicket] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public priority createpriority(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("priority name required");
    }
    lock.lock();
    try {
      String id = String.format("PRI-%04d", seq++);
      priority obj = new priority(id, name.trim());
      obj.validate();
      priorities.put(id, obj);
      System.out.println("[CustomerSupportTicketingService.createpriority] stored " + id + " count=" + priorities.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public priority getpriority(String id) {
    lock.lock();
    try {
      priority obj = priorities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown priority id: " + id);
      }
      System.out.println("[CustomerSupportTicketingService.getpriority] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public SLA createSLA(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SLA name required");
    }
    lock.lock();
    try {
      String id = String.format("SLA-%04d", seq++);
      SLA obj = new SLA(id, name.trim());
      obj.validate();
      slas.put(id, obj);
      System.out.println("[CustomerSupportTicketingService.createSLA] stored " + id + " count=" + slas.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public SLA getSLA(String id) {
    lock.lock();
    try {
      SLA obj = slas.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown SLA id: " + id);
      }
      System.out.println("[CustomerSupportTicketingService.getSLA] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Agent createAgent(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Agent name required");
    }
    lock.lock();
    try {
      String id = String.format("AGE-%04d", seq++);
      Agent obj = new Agent(id, name.trim());
      obj.validate();
      agents.put(id, obj);
      System.out.println("[CustomerSupportTicketingService.createAgent] stored " + id + " count=" + agents.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Agent getAgent(String id) {
    lock.lock();
    try {
      Agent obj = agents.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Agent id: " + id);
      }
      System.out.println("[CustomerSupportTicketingService.getAgent] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Reply createReply(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Reply name required");
    }
    lock.lock();
    try {
      String id = String.format("REP-%04d", seq++);
      Reply obj = new Reply(id, name.trim());
      obj.validate();
      replies.put(id, obj);
      System.out.println("[CustomerSupportTicketingService.createReply] stored " + id + " count=" + replies.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Reply getReply(String id) {
    lock.lock();
    try {
      Reply obj = replies.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Reply id: " + id);
      }
      System.out.println("[CustomerSupportTicketingService.getReply] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Ticket closeTicket(String id) {
    lock.lock();
    try {
      Ticket obj = tickets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Ticket id: " + id);
      }
      System.out.println("[CustomerSupportTicketingService.closeTicket] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Ticket> listActiveTickets() {
    lock.lock();
    try {
      List<Ticket> out = new ArrayList<>();
      for (Ticket o : tickets.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CustomerSupportTicketingService.listActiveTickets] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CustomerSupportTicketingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CustomerSupportTicketingService system = new CustomerSupportTicketingService();
    System.out.println("========== STEP 2: Create Ticket objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Ticket first = system.createTicket("alpha-ticket");
    system.createTicket("beta-ticket");
    System.out.println("========== STEP 3: Create priority ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createpriority("sample-priority");
    System.out.println("========== STEP 4: Create SLA ==========");
    system.createSLA("sample-sla");
    System.out.println("========== STEP 5: Create Agent ==========");
    system.createAgent("sample-agent");
    System.out.println("========== STEP 6: Create Reply ==========");
    system.createReply("sample-reply");
    System.out.println("========== Inspect active list ==========");
    system.listActiveTickets();
    System.out.println("========== Close first Ticket ==========");
    system.closeTicket(first.getId());
    try {
      system.closeTicket(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getTicket("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Ticket {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Ticket.id required')
    }

    if (!name?.trim()) {
      throw new Error('Ticket.name required')
    }
    console.log(\`[Ticket.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Ticket \${this.id} invalid status\`)
    }
    console.log(\`[Ticket.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Ticket \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Ticket.close] id=\${this.id} -> CLOSED\`)
  }
}


class priority {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('priority.id required')
    }

    if (!name?.trim()) {
      throw new Error('priority.name required')
    }
    console.log(\`[priority.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`priority \${this.id} invalid status\`)
    }
    console.log(\`[priority.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`priority \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[priority.close] id=\${this.id} -> CLOSED\`)
  }
}


class SLA {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('SLA.id required')
    }

    if (!name?.trim()) {
      throw new Error('SLA.name required')
    }
    console.log(\`[SLA.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`SLA \${this.id} invalid status\`)
    }
    console.log(\`[SLA.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`SLA \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[SLA.close] id=\${this.id} -> CLOSED\`)
  }
}


class Agent {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Agent.id required')
    }

    if (!name?.trim()) {
      throw new Error('Agent.name required')
    }
    console.log(\`[Agent.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Agent \${this.id} invalid status\`)
    }
    console.log(\`[Agent.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Agent \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Agent.close] id=\${this.id} -> CLOSED\`)
  }
}


class Reply {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Reply.id required')
    }

    if (!name?.trim()) {
      throw new Error('Reply.name required')
    }
    console.log(\`[Reply.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Reply \${this.id} invalid status\`)
    }
    console.log(\`[Reply.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Reply \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Reply.close] id=\${this.id} -> CLOSED\`)
  }
}

class CustomerSupportTicketingService {
  private seq = 1
  private tickets = new Map<string, Ticket>()
  private priorities = new Map<string, priority>()
  private slas = new Map<string, SLA>()
  private agents = new Map<string, Agent>()
  private replies = new Map<string, Reply>()
  constructor() {
    console.log('[CustomerSupportTicketingService.__init__] system ready')
  }

  createTicket(name: string): Ticket {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Ticket name required')
    }
    const id = \`TIC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Ticket(id, cleaned)
    obj.validate()
    this.tickets.set(id, obj)
    console.log(\`[CustomerSupportTicketingService.createTicket] stored \${id} count=\${this.tickets.size}\`)
    return obj
  }

  getTicket(id: string): Ticket {
    const obj = this.tickets.get(id)
    if (!obj) {
      throw new Error(\`unknown Ticket id: \${id}\`)
    }
    console.log(\`[CustomerSupportTicketingService.getTicket] found id=\${obj.id}\`)
    return obj
  }

  createpriority(name: string): priority {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('priority name required')
    }
    const id = \`PRI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new priority(id, cleaned)
    obj.validate()
    this.priorities.set(id, obj)
    console.log(\`[CustomerSupportTicketingService.createpriority] stored \${id} count=\${this.priorities.size}\`)
    return obj
  }

  getpriority(id: string): priority {
    const obj = this.priorities.get(id)
    if (!obj) {
      throw new Error(\`unknown priority id: \${id}\`)
    }
    console.log(\`[CustomerSupportTicketingService.getpriority] found id=\${obj.id}\`)
    return obj
  }

  createSLA(name: string): SLA {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('SLA name required')
    }
    const id = \`SLA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new SLA(id, cleaned)
    obj.validate()
    this.slas.set(id, obj)
    console.log(\`[CustomerSupportTicketingService.createSLA] stored \${id} count=\${this.slas.size}\`)
    return obj
  }

  getSLA(id: string): SLA {
    const obj = this.slas.get(id)
    if (!obj) {
      throw new Error(\`unknown SLA id: \${id}\`)
    }
    console.log(\`[CustomerSupportTicketingService.getSLA] found id=\${obj.id}\`)
    return obj
  }

  createAgent(name: string): Agent {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Agent name required')
    }
    const id = \`AGE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Agent(id, cleaned)
    obj.validate()
    this.agents.set(id, obj)
    console.log(\`[CustomerSupportTicketingService.createAgent] stored \${id} count=\${this.agents.size}\`)
    return obj
  }

  getAgent(id: string): Agent {
    const obj = this.agents.get(id)
    if (!obj) {
      throw new Error(\`unknown Agent id: \${id}\`)
    }
    console.log(\`[CustomerSupportTicketingService.getAgent] found id=\${obj.id}\`)
    return obj
  }

  createReply(name: string): Reply {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Reply name required')
    }
    const id = \`REP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Reply(id, cleaned)
    obj.validate()
    this.replies.set(id, obj)
    console.log(\`[CustomerSupportTicketingService.createReply] stored \${id} count=\${this.replies.size}\`)
    return obj
  }

  getReply(id: string): Reply {
    const obj = this.replies.get(id)
    if (!obj) {
      throw new Error(\`unknown Reply id: \${id}\`)
    }
    console.log(\`[CustomerSupportTicketingService.getReply] found id=\${obj.id}\`)
    return obj
  }

  closeTicket(id: string): Ticket {
    const obj = this.getTicket(id)
    console.log(\`[CustomerSupportTicketingService.closeTicket] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveTickets(): Ticket[] {
    const active = [...this.tickets.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CustomerSupportTicketingService.listActiveTickets] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CustomerSupportTicketingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CustomerSupportTicketingService()
  console.log('========== STEP 2: Create Ticket objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createTicket('alpha-ticket')
  system.createTicket('beta-ticket')
  console.log('========== STEP 3: Create priority ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createpriority('sample-priority')
  console.log('========== STEP 4: Create SLA ==========')
  system.createSLA('sample-sla')
  console.log('========== STEP 5: Create Agent ==========')
  system.createAgent('sample-agent')
  console.log('========== STEP 6: Create Reply ==========')
  system.createReply('sample-reply')
  system.listActiveTickets()
  console.log('========== Close first Ticket ==========')
  system.closeTicket(first.id)
  try {
    system.closeTicket(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getTicket('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Ticket {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Ticket(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Ticket requires id and name");
    }
    cout << "[Ticket.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Ticket invalid status");
    }
    cout << "[Ticket.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Ticket cannot close");
    }
    status_ = "CLOSED";
    cout << "[Ticket.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class priority {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  priority(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("priority requires id and name");
    }
    cout << "[priority.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("priority invalid status");
    }
    cout << "[priority.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("priority cannot close");
    }
    status_ = "CLOSED";
    cout << "[priority.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class SLA {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  SLA(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("SLA requires id and name");
    }
    cout << "[SLA.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("SLA invalid status");
    }
    cout << "[SLA.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("SLA cannot close");
    }
    status_ = "CLOSED";
    cout << "[SLA.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Agent {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Agent(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Agent requires id and name");
    }
    cout << "[Agent.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Agent invalid status");
    }
    cout << "[Agent.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Agent cannot close");
    }
    status_ = "CLOSED";
    cout << "[Agent.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Reply {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Reply(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Reply requires id and name");
    }
    cout << "[Reply.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Reply invalid status");
    }
    cout << "[Reply.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Reply cannot close");
    }
    status_ = "CLOSED";
    cout << "[Reply.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CustomerSupportTicketingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Ticket> tickets_;
  unordered_map<string, priority> priorities_;
  unordered_map<string, SLA> slas_;
  unordered_map<string, Agent> agents_;
  unordered_map<string, Reply> replies_;
public:
  CustomerSupportTicketingService() {
    cout << "[CustomerSupportTicketingService.__init__] system ready" << endl;
  }

  Ticket createTicket(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Ticket name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TIC-%04d", seq_++);
    Ticket obj{buf, name};
    obj.validate();
    tickets_.emplace(obj.id(), obj);
    cout << "[CustomerSupportTicketingService.createTicket] stored " << obj.id() << endl;
    return obj;
  }

  Ticket getTicket(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tickets_.find(id);
    if (it == tickets_.end()) {
      throw out_of_range("unknown Ticket id");
    }
    cout << "[CustomerSupportTicketingService.getTicket] found " << id << endl;
    return it->second;
  }

  priority createpriority(const string& name) {
    if (name.empty()) {
      throw invalid_argument("priority name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PRI-%04d", seq_++);
    priority obj{buf, name};
    obj.validate();
    priorities_.emplace(obj.id(), obj);
    cout << "[CustomerSupportTicketingService.createpriority] stored " << obj.id() << endl;
    return obj;
  }

  priority getpriority(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = priorities_.find(id);
    if (it == priorities_.end()) {
      throw out_of_range("unknown priority id");
    }
    cout << "[CustomerSupportTicketingService.getpriority] found " << id << endl;
    return it->second;
  }

  SLA createSLA(const string& name) {
    if (name.empty()) {
      throw invalid_argument("SLA name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SLA-%04d", seq_++);
    SLA obj{buf, name};
    obj.validate();
    slas_.emplace(obj.id(), obj);
    cout << "[CustomerSupportTicketingService.createSLA] stored " << obj.id() << endl;
    return obj;
  }

  SLA getSLA(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = slas_.find(id);
    if (it == slas_.end()) {
      throw out_of_range("unknown SLA id");
    }
    cout << "[CustomerSupportTicketingService.getSLA] found " << id << endl;
    return it->second;
  }

  Agent createAgent(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Agent name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AGE-%04d", seq_++);
    Agent obj{buf, name};
    obj.validate();
    agents_.emplace(obj.id(), obj);
    cout << "[CustomerSupportTicketingService.createAgent] stored " << obj.id() << endl;
    return obj;
  }

  Agent getAgent(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = agents_.find(id);
    if (it == agents_.end()) {
      throw out_of_range("unknown Agent id");
    }
    cout << "[CustomerSupportTicketingService.getAgent] found " << id << endl;
    return it->second;
  }

  Reply createReply(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Reply name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REP-%04d", seq_++);
    Reply obj{buf, name};
    obj.validate();
    replies_.emplace(obj.id(), obj);
    cout << "[CustomerSupportTicketingService.createReply] stored " << obj.id() << endl;
    return obj;
  }

  Reply getReply(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = replies_.find(id);
    if (it == replies_.end()) {
      throw out_of_range("unknown Reply id");
    }
    cout << "[CustomerSupportTicketingService.getReply] found " << id << endl;
    return it->second;
  }

  Ticket closeTicket(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tickets_.find(id);
    if (it == tickets_.end()) {
      throw out_of_range("unknown Ticket");
    }
    cout << "[CustomerSupportTicketingService.closeTicket] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CustomerSupportTicketingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CustomerSupportTicketingService system;
  cout << "========== STEP 2: Create Ticket ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createTicket("alpha-ticket");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createTicket("beta-ticket");
  system.createpriority("sample-priority");
  system.createSLA("sample-sla");
  system.createAgent("sample-agent");
  system.createReply("sample-reply");
  system.closeTicket(first.id());
  try {
    system.closeTicket(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getTicket("MISSING-ID");
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

type Ticket struct {
  ID     string
  Name   string
  Status string
}

func NewTicket(id, name string) (*Ticket, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Ticket requires id and name")
  }
  obj := &Ticket{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Ticket.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Ticket) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Ticket invalid status")
  }
  fmt.Printf("[Ticket.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Ticket) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Ticket %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Ticket.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type priority struct {
  ID     string
  Name   string
  Status string
}

func Newpriority(id, name string) (*priority, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("priority requires id and name")
  }
  obj := &priority{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[priority.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *priority) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("priority invalid status")
  }
  fmt.Printf("[priority.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *priority) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("priority %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[priority.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type SLA struct {
  ID     string
  Name   string
  Status string
}

func NewSLA(id, name string) (*SLA, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("SLA requires id and name")
  }
  obj := &SLA{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[SLA.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *SLA) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("SLA invalid status")
  }
  fmt.Printf("[SLA.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *SLA) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("SLA %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[SLA.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Agent struct {
  ID     string
  Name   string
  Status string
}

func NewAgent(id, name string) (*Agent, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Agent requires id and name")
  }
  obj := &Agent{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Agent.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Agent) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Agent invalid status")
  }
  fmt.Printf("[Agent.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Agent) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Agent %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Agent.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Reply struct {
  ID     string
  Name   string
  Status string
}

func NewReply(id, name string) (*Reply, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Reply requires id and name")
  }
  obj := &Reply{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Reply.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Reply) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Reply invalid status")
  }
  fmt.Printf("[Reply.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Reply) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Reply %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Reply.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CustomerSupportTicketingService struct {
  mu  sync.Mutex
  seq int
  tickets map[string]*Ticket
  priorities map[string]*priority
  slas map[string]*SLA
  agents map[string]*Agent
  replies map[string]*Reply
}

func NewCustomerSupportTicketingService() *CustomerSupportTicketingService {
  fmt.Println("[CustomerSupportTicketingService.__init__] system ready")
  return &CustomerSupportTicketingService{
    seq: 1,
    tickets: map[string]*Ticket{},
    priorities: map[string]*priority{},
    slas: map[string]*SLA{},
    agents: map[string]*Agent{},
    replies: map[string]*Reply{},
  }
}

func (s *CustomerSupportTicketingService) CreateTicket(name string) (*Ticket, error) {
  if name == "" {
    return nil, fmt.Errorf("Ticket name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TIC-%04d", s.seq)
  s.seq++
  obj, err := NewTicket(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tickets[id] = obj
  fmt.Printf("[CustomerSupportTicketingService.CreateTicket] stored %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) GetTicket(id string) (*Ticket, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tickets[id]
  if !ok {
    return nil, fmt.Errorf("unknown Ticket id: %s", id)
  }
  fmt.Printf("[CustomerSupportTicketingService.GetTicket] found %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) Createpriority(name string) (*priority, error) {
  if name == "" {
    return nil, fmt.Errorf("priority name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PRI-%04d", s.seq)
  s.seq++
  obj, err := Newpriority(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.priorities[id] = obj
  fmt.Printf("[CustomerSupportTicketingService.Createpriority] stored %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) Getpriority(id string) (*priority, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.priorities[id]
  if !ok {
    return nil, fmt.Errorf("unknown priority id: %s", id)
  }
  fmt.Printf("[CustomerSupportTicketingService.Getpriority] found %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) CreateSLA(name string) (*SLA, error) {
  if name == "" {
    return nil, fmt.Errorf("SLA name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SLA-%04d", s.seq)
  s.seq++
  obj, err := NewSLA(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.slas[id] = obj
  fmt.Printf("[CustomerSupportTicketingService.CreateSLA] stored %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) GetSLA(id string) (*SLA, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.slas[id]
  if !ok {
    return nil, fmt.Errorf("unknown SLA id: %s", id)
  }
  fmt.Printf("[CustomerSupportTicketingService.GetSLA] found %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) CreateAgent(name string) (*Agent, error) {
  if name == "" {
    return nil, fmt.Errorf("Agent name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AGE-%04d", s.seq)
  s.seq++
  obj, err := NewAgent(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.agents[id] = obj
  fmt.Printf("[CustomerSupportTicketingService.CreateAgent] stored %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) GetAgent(id string) (*Agent, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.agents[id]
  if !ok {
    return nil, fmt.Errorf("unknown Agent id: %s", id)
  }
  fmt.Printf("[CustomerSupportTicketingService.GetAgent] found %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) CreateReply(name string) (*Reply, error) {
  if name == "" {
    return nil, fmt.Errorf("Reply name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REP-%04d", s.seq)
  s.seq++
  obj, err := NewReply(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.replies[id] = obj
  fmt.Printf("[CustomerSupportTicketingService.CreateReply] stored %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) GetReply(id string) (*Reply, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.replies[id]
  if !ok {
    return nil, fmt.Errorf("unknown Reply id: %s", id)
  }
  fmt.Printf("[CustomerSupportTicketingService.GetReply] found %s\\n", id)
  return obj, nil
}

func (s *CustomerSupportTicketingService) CloseTicket(id string) (*Ticket, error) {
  obj, err := s.GetTicket(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CustomerSupportTicketingService.CloseTicket] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CustomerSupportTicketingService ==========")
  system := NewCustomerSupportTicketingService()
  fmt.Println("========== STEP 2: Create Ticket ==========")
  first, _ := system.CreateTicket("alpha-ticket")
  system.CreateTicket("beta-ticket")
  system.Createpriority("sample-priority")
  system.CreateSLA("sample-sla")
  system.CreateAgent("sample-agent")
  system.CreateReply("sample-reply")
  system.CloseTicket(first.ID)
  if _, err := system.CloseTicket(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetTicket("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Ticket {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Ticket(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Ticket requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Ticket.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Ticket invalid status");
    }
    Console.WriteLine("[Ticket.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Ticket " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Ticket.close] id=" + Id + " -> CLOSED");
  }
}


sealed class priority {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public priority(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("priority requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[priority.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("priority invalid status");
    }
    Console.WriteLine("[priority.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("priority " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[priority.close] id=" + Id + " -> CLOSED");
  }
}


sealed class SLA {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public SLA(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SLA requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[SLA.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("SLA invalid status");
    }
    Console.WriteLine("[SLA.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("SLA " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[SLA.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Agent {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Agent(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Agent requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Agent.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Agent invalid status");
    }
    Console.WriteLine("[Agent.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Agent " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Agent.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Reply {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Reply(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Reply requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Reply.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Reply invalid status");
    }
    Console.WriteLine("[Reply.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Reply " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Reply.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CustomerSupportTicketingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Ticket> _tickets = new();
  private readonly Dictionary<string, priority> _priorities = new();
  private readonly Dictionary<string, SLA> _slas = new();
  private readonly Dictionary<string, Agent> _agents = new();
  private readonly Dictionary<string, Reply> _replies = new();
  public CustomerSupportTicketingService() {
    Console.WriteLine("[CustomerSupportTicketingService.__init__] system ready");
  }

  public Ticket CreateTicket(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Ticket name required");
    }
    lock (_gate) {
      var id = string.Format("TIC-{0:D4}", _seq++);
      var obj = new Ticket(id, name.Trim());
      obj.Validate();
      _tickets[id] = obj;
      Console.WriteLine("[CustomerSupportTicketingService.CreateTicket] stored " + id);
      return obj;
    }
  }

  public Ticket GetTicket(string id) {
    lock (_gate) {
      if (!_tickets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Ticket id: " + id);
      }
      Console.WriteLine("[CustomerSupportTicketingService.GetTicket] found " + id);
      return obj;
    }
  }

  public priority Createpriority(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("priority name required");
    }
    lock (_gate) {
      var id = string.Format("PRI-{0:D4}", _seq++);
      var obj = new priority(id, name.Trim());
      obj.Validate();
      _priorities[id] = obj;
      Console.WriteLine("[CustomerSupportTicketingService.Createpriority] stored " + id);
      return obj;
    }
  }

  public priority Getpriority(string id) {
    lock (_gate) {
      if (!_priorities.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown priority id: " + id);
      }
      Console.WriteLine("[CustomerSupportTicketingService.Getpriority] found " + id);
      return obj;
    }
  }

  public SLA CreateSLA(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SLA name required");
    }
    lock (_gate) {
      var id = string.Format("SLA-{0:D4}", _seq++);
      var obj = new SLA(id, name.Trim());
      obj.Validate();
      _slas[id] = obj;
      Console.WriteLine("[CustomerSupportTicketingService.CreateSLA] stored " + id);
      return obj;
    }
  }

  public SLA GetSLA(string id) {
    lock (_gate) {
      if (!_slas.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown SLA id: " + id);
      }
      Console.WriteLine("[CustomerSupportTicketingService.GetSLA] found " + id);
      return obj;
    }
  }

  public Agent CreateAgent(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Agent name required");
    }
    lock (_gate) {
      var id = string.Format("AGE-{0:D4}", _seq++);
      var obj = new Agent(id, name.Trim());
      obj.Validate();
      _agents[id] = obj;
      Console.WriteLine("[CustomerSupportTicketingService.CreateAgent] stored " + id);
      return obj;
    }
  }

  public Agent GetAgent(string id) {
    lock (_gate) {
      if (!_agents.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Agent id: " + id);
      }
      Console.WriteLine("[CustomerSupportTicketingService.GetAgent] found " + id);
      return obj;
    }
  }

  public Reply CreateReply(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Reply name required");
    }
    lock (_gate) {
      var id = string.Format("REP-{0:D4}", _seq++);
      var obj = new Reply(id, name.Trim());
      obj.Validate();
      _replies[id] = obj;
      Console.WriteLine("[CustomerSupportTicketingService.CreateReply] stored " + id);
      return obj;
    }
  }

  public Reply GetReply(string id) {
    lock (_gate) {
      if (!_replies.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Reply id: " + id);
      }
      Console.WriteLine("[CustomerSupportTicketingService.GetReply] found " + id);
      return obj;
    }
  }

  public Ticket CloseTicket(string id) {
    var obj = GetTicket(id);
    Console.WriteLine("[CustomerSupportTicketingService.CloseTicket] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CustomerSupportTicketingService ==========");
    var system = new CustomerSupportTicketingService();
    Console.WriteLine("========== STEP 2: Create Ticket ==========");
    var first = system.CreateTicket("alpha-ticket");
    system.CreateTicket("beta-ticket");
    system.Createpriority("sample-priority");
    system.CreateSLA("sample-sla");
    system.CreateAgent("sample-agent");
    system.CreateReply("sample-reply");
    system.CloseTicket(first.Id);
    try {
      system.CloseTicket(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetTicket("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const customerSupportTicketingSolution: ProblemSolution = {
  slug: 'customer-support-ticketing',
  title: 'Customer Support Ticketing System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a support ticketing system (like Zendesk) handling ticket creation, assignment, SLA tracking, and escalation. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Create a support ticket from a customer inquiry',
      'Auto-assign or manually assign a ticket to an agent',
      'Track ticket status: open, in-progress, waiting, resolved, closed',
      'Set priority and SLA deadlines per ticket',
      'Escalate a ticket that\'s about to breach its SLA',
      'Support internal notes and customer-visible replies on a ticket',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Create a support ticket from a customer inquiry?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Auto-assign or manually assign a ticket to an agent?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Track ticket status: open, in-progress, waiting, resolved, closed?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Set priority and SLA deadlines per ticket?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Escalate a ticket that\'s about to breach its SLA?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CustomerSupportTicketingService is the facade stereotype. Ticket, priority, SLA, Agent, Reply are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CustomerSupportTicketingService.',
          'createTicket twice and create the related UML classes.',
          'closeTicket once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CustomerSupportTicketingService', responsibility: 'UML facade - orchestrates Customer Support Ticketing System.', keyMembers: ['create*', 'get*', 'closeTicket'] },
    { name: 'Ticket', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'priority', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SLA', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Agent', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reply', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CustomerSupportTicketingService to Ticket, priority, SLA, Agent, Reply. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CustomerSupportTicketingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CustomerSupportTicketingService', responsibility: 'UML facade - orchestrates Customer Support Ticketing System.', keyMembers: ['create*', 'get*', 'closeTicket'] },
    { name: 'Ticket', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'priority', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SLA', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Agent', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reply', responsibility: 'UML class - domain object for Customer Support Ticketing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CustomerSupportTicketingService exposes create/get/close and owns composed collections.' },
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
      'main constructs CustomerSupportTicketingService, creates UML domain objects, closes the primary Ticket, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CustomerSupportTicketingService.',
      'createTicket for alpha and beta.',
      'create remaining UML classes.',
      'closeTicket(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createTicket("alpha..."); closeTicket(id)',
        output: '[Ticket.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeTicket(alreadyClosed) or getTicket("MISSING-ID")',
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
