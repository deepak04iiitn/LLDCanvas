import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'ContactManagementService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_contacts', 'Map<string, Contact>'),
    attr('-', '_contact_groups', 'Map<string, ContactGroup>'),
    attr('-', '_users', 'Map<string, User>'),
  ], [
    method('+', 'createContact', 'name: string', 'Contact'),
    method('+', 'createContactGroup', 'name: string', 'ContactGroup'),
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'getContact', 'id: string', 'Contact'),
    method('+', 'getContactGroup', 'id: string', 'ContactGroup'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'closeContact', 'id: string', 'Contact'),
  ], 'facade'),
  cls('n1', 'Contact', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'ContactGroup', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'User', GRID.x(0), GRID.y(1), [
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
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("contact-management")


class Contact:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Contact.id is required")
        if not name or not name.strip():
            raise ValueError("Contact.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Contact.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Contact {self.id} has invalid status={self.status}")
        log.info("[Contact.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Contact {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Contact.close] id=%s -> CLOSED", self.id)


class ContactGroup:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ContactGroup.id is required")
        if not name or not name.strip():
            raise ValueError("ContactGroup.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ContactGroup.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ContactGroup {self.id} has invalid status={self.status}")
        log.info("[ContactGroup.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ContactGroup {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ContactGroup.close] id=%s -> CLOSED", self.id)


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


class ContactManagementService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._contacts: Dict[str, Contact] = {}
        self._contact_groups: Dict[str, ContactGroup] = {}
        self._users: Dict[str, User] = {}
        log.info("[ContactManagementService.__init__] system ready; managing: Contact, ContactGroup, User")

    def create_contact(self, name: str) -> Contact:
        """UML: ContactManagementService.create_contact(name) -> Contact"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Contact name is required")
        with self._lock:
            item_id = f"CON-{self._seq:04d}"
            self._seq += 1
            obj = Contact(item_id, cleaned)
            obj.validate()
            self._contacts[item_id] = obj
            log.info("[ContactManagementService.create_contact] stored %s in _contacts (count=%s)", item_id, len(self._contacts))
            return obj

    def get_contact(self, item_id: str) -> Contact:
        with self._lock:
            obj = self._contacts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Contact id: {item_id}")
            log.info("[ContactManagementService.get_contact] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_contact_group(self, name: str) -> ContactGroup:
        """UML: ContactManagementService.create_contact_group(name) -> ContactGroup"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ContactGroup name is required")
        with self._lock:
            item_id = f"CON-{self._seq:04d}"
            self._seq += 1
            obj = ContactGroup(item_id, cleaned)
            obj.validate()
            self._contact_groups[item_id] = obj
            log.info("[ContactManagementService.create_contact_group] stored %s in _contact_groups (count=%s)", item_id, len(self._contact_groups))
            return obj

    def get_contact_group(self, item_id: str) -> ContactGroup:
        with self._lock:
            obj = self._contact_groups.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ContactGroup id: {item_id}")
            log.info("[ContactManagementService.get_contact_group] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_user(self, name: str) -> User:
        """UML: ContactManagementService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[ContactManagementService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[ContactManagementService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_contact(self, item_id: str) -> Contact:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._contacts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Contact id: {item_id}")
            log.info("[ContactManagementService.close_contact] closing %s via Contact.close()", item_id)
            obj.close()
            return obj

    def list_active_contacts(self) -> List[Contact]:
        with self._lock:
            active = [o for o in self._contacts.values() if o.status == "ACTIVE"]
            log.info("[ContactManagementService.list_active_contacts] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct ContactManagementService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = ContactManagementService()

    log.info("========== STEP 2: Create primary Contact objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_contact("alpha-contact")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_contact("beta-contact")

    log.info("========== STEP 3: Create ContactGroup (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_contact_group("sample-contact_group")

    log.info("========== STEP 4: Create User (UML class) ==========")
    system.create_user("sample-user")

    log.info("========== STEP 5: Inspect active Contact list ==========")
    system.list_active_contacts()

    log.info("========== STEP 6: Close first Contact ==========")
    system.close_contact(first.id)

    log.info("========== STEP 7: Expected failure - close again ==========")
    try:
        system.close_contact(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Contact.close: %s", err)

    log.info("========== STEP 8: Expected failure - missing id ==========")
    try:
        system.get_contact("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_contact: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_contacts()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Contact {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Contact(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Contact.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Contact.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Contact.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Contact " + id + " invalid status");
    }
    System.out.println("[Contact.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Contact " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Contact.close] id=" + id + " -> CLOSED");
  }
}


class ContactGroup {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ContactGroup(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ContactGroup.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ContactGroup.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ContactGroup.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ContactGroup " + id + " invalid status");
    }
    System.out.println("[ContactGroup.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ContactGroup " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ContactGroup.close] id=" + id + " -> CLOSED");
  }
}


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

public class ContactManagementService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Contact> contacts = new LinkedHashMap<>();
  private final Map<String, ContactGroup> contact_groups = new LinkedHashMap<>();
  private final Map<String, User> users = new LinkedHashMap<>();

  public ContactManagementService() {
    System.out.println("[ContactManagementService.__init__] system ready");
  }

  public Contact createContact(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Contact name required");
    }
    lock.lock();
    try {
      String id = String.format("CON-%04d", seq++);
      Contact obj = new Contact(id, name.trim());
      obj.validate();
      contacts.put(id, obj);
      System.out.println("[ContactManagementService.createContact] stored " + id + " count=" + contacts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Contact getContact(String id) {
    lock.lock();
    try {
      Contact obj = contacts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Contact id: " + id);
      }
      System.out.println("[ContactManagementService.getContact] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ContactGroup createContactGroup(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ContactGroup name required");
    }
    lock.lock();
    try {
      String id = String.format("CON-%04d", seq++);
      ContactGroup obj = new ContactGroup(id, name.trim());
      obj.validate();
      contact_groups.put(id, obj);
      System.out.println("[ContactManagementService.createContactGroup] stored " + id + " count=" + contact_groups.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ContactGroup getContactGroup(String id) {
    lock.lock();
    try {
      ContactGroup obj = contact_groups.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ContactGroup id: " + id);
      }
      System.out.println("[ContactManagementService.getContactGroup] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[ContactManagementService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[ContactManagementService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Contact closeContact(String id) {
    lock.lock();
    try {
      Contact obj = contacts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Contact id: " + id);
      }
      System.out.println("[ContactManagementService.closeContact] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Contact> listActiveContacts() {
    lock.lock();
    try {
      List<Contact> out = new ArrayList<>();
      for (Contact o : contacts.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[ContactManagementService.listActiveContacts] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct ContactManagementService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    ContactManagementService system = new ContactManagementService();
    System.out.println("========== STEP 2: Create Contact objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Contact first = system.createContact("alpha-contact");
    system.createContact("beta-contact");
    System.out.println("========== STEP 3: Create ContactGroup ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createContactGroup("sample-contact_group");
    System.out.println("========== STEP 4: Create User ==========");
    system.createUser("sample-user");
    System.out.println("========== Inspect active list ==========");
    system.listActiveContacts();
    System.out.println("========== Close first Contact ==========");
    system.closeContact(first.getId());
    try {
      system.closeContact(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getContact("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Contact {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Contact.id required')
    }

    if (!name?.trim()) {
      throw new Error('Contact.name required')
    }
    console.log(\`[Contact.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Contact \${this.id} invalid status\`)
    }
    console.log(\`[Contact.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Contact \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Contact.close] id=\${this.id} -> CLOSED\`)
  }
}


class ContactGroup {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ContactGroup.id required')
    }

    if (!name?.trim()) {
      throw new Error('ContactGroup.name required')
    }
    console.log(\`[ContactGroup.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ContactGroup \${this.id} invalid status\`)
    }
    console.log(\`[ContactGroup.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ContactGroup \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ContactGroup.close] id=\${this.id} -> CLOSED\`)
  }
}


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

class ContactManagementService {
  private seq = 1
  private contacts = new Map<string, Contact>()
  private contact_groups = new Map<string, ContactGroup>()
  private users = new Map<string, User>()
  constructor() {
    console.log('[ContactManagementService.__init__] system ready')
  }

  createContact(name: string): Contact {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Contact name required')
    }
    const id = \`CON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Contact(id, cleaned)
    obj.validate()
    this.contacts.set(id, obj)
    console.log(\`[ContactManagementService.createContact] stored \${id} count=\${this.contacts.size}\`)
    return obj
  }

  getContact(id: string): Contact {
    const obj = this.contacts.get(id)
    if (!obj) {
      throw new Error(\`unknown Contact id: \${id}\`)
    }
    console.log(\`[ContactManagementService.getContact] found id=\${obj.id}\`)
    return obj
  }

  createContactGroup(name: string): ContactGroup {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ContactGroup name required')
    }
    const id = \`CON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ContactGroup(id, cleaned)
    obj.validate()
    this.contact_groups.set(id, obj)
    console.log(\`[ContactManagementService.createContactGroup] stored \${id} count=\${this.contact_groups.size}\`)
    return obj
  }

  getContactGroup(id: string): ContactGroup {
    const obj = this.contact_groups.get(id)
    if (!obj) {
      throw new Error(\`unknown ContactGroup id: \${id}\`)
    }
    console.log(\`[ContactManagementService.getContactGroup] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[ContactManagementService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[ContactManagementService.getUser] found id=\${obj.id}\`)
    return obj
  }

  closeContact(id: string): Contact {
    const obj = this.getContact(id)
    console.log(\`[ContactManagementService.closeContact] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveContacts(): Contact[] {
    const active = [...this.contacts.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[ContactManagementService.listActiveContacts] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct ContactManagementService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new ContactManagementService()
  console.log('========== STEP 2: Create Contact objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createContact('alpha-contact')
  system.createContact('beta-contact')
  console.log('========== STEP 3: Create ContactGroup ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createContactGroup('sample-contact_group')
  console.log('========== STEP 4: Create User ==========')
  system.createUser('sample-user')
  system.listActiveContacts()
  console.log('========== Close first Contact ==========')
  system.closeContact(first.id)
  try {
    system.closeContact(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getContact('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Contact {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Contact(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Contact requires id and name");
    }
    cout << "[Contact.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Contact invalid status");
    }
    cout << "[Contact.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Contact cannot close");
    }
    status_ = "CLOSED";
    cout << "[Contact.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ContactGroup {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ContactGroup(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ContactGroup requires id and name");
    }
    cout << "[ContactGroup.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ContactGroup invalid status");
    }
    cout << "[ContactGroup.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ContactGroup cannot close");
    }
    status_ = "CLOSED";
    cout << "[ContactGroup.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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

class ContactManagementService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Contact> contacts_;
  unordered_map<string, ContactGroup> contact_groups_;
  unordered_map<string, User> users_;
public:
  ContactManagementService() {
    cout << "[ContactManagementService.__init__] system ready" << endl;
  }

  Contact createContact(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Contact name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CON-%04d", seq_++);
    Contact obj{buf, name};
    obj.validate();
    contacts_.emplace(obj.id(), obj);
    cout << "[ContactManagementService.createContact] stored " << obj.id() << endl;
    return obj;
  }

  Contact getContact(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = contacts_.find(id);
    if (it == contacts_.end()) {
      throw out_of_range("unknown Contact id");
    }
    cout << "[ContactManagementService.getContact] found " << id << endl;
    return it->second;
  }

  ContactGroup createContactGroup(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ContactGroup name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CON-%04d", seq_++);
    ContactGroup obj{buf, name};
    obj.validate();
    contact_groups_.emplace(obj.id(), obj);
    cout << "[ContactManagementService.createContactGroup] stored " << obj.id() << endl;
    return obj;
  }

  ContactGroup getContactGroup(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = contact_groups_.find(id);
    if (it == contact_groups_.end()) {
      throw out_of_range("unknown ContactGroup id");
    }
    cout << "[ContactManagementService.getContactGroup] found " << id << endl;
    return it->second;
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
    cout << "[ContactManagementService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[ContactManagementService.getUser] found " << id << endl;
    return it->second;
  }

  Contact closeContact(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = contacts_.find(id);
    if (it == contacts_.end()) {
      throw out_of_range("unknown Contact");
    }
    cout << "[ContactManagementService.closeContact] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct ContactManagementService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  ContactManagementService system;
  cout << "========== STEP 2: Create Contact ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createContact("alpha-contact");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createContact("beta-contact");
  system.createContactGroup("sample-contact_group");
  system.createUser("sample-user");
  system.closeContact(first.id());
  try {
    system.closeContact(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getContact("MISSING-ID");
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

type Contact struct {
  ID     string
  Name   string
  Status string
}

func NewContact(id, name string) (*Contact, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Contact requires id and name")
  }
  obj := &Contact{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Contact.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Contact) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Contact invalid status")
  }
  fmt.Printf("[Contact.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Contact) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Contact %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Contact.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ContactGroup struct {
  ID     string
  Name   string
  Status string
}

func NewContactGroup(id, name string) (*ContactGroup, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ContactGroup requires id and name")
  }
  obj := &ContactGroup{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ContactGroup.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ContactGroup) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ContactGroup invalid status")
  }
  fmt.Printf("[ContactGroup.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ContactGroup) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ContactGroup %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ContactGroup.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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

type ContactManagementService struct {
  mu  sync.Mutex
  seq int
  contacts map[string]*Contact
  contact_groups map[string]*ContactGroup
  users map[string]*User
}

func NewContactManagementService() *ContactManagementService {
  fmt.Println("[ContactManagementService.__init__] system ready")
  return &ContactManagementService{
    seq: 1,
    contacts: map[string]*Contact{},
    contact_groups: map[string]*ContactGroup{},
    users: map[string]*User{},
  }
}

func (s *ContactManagementService) CreateContact(name string) (*Contact, error) {
  if name == "" {
    return nil, fmt.Errorf("Contact name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CON-%04d", s.seq)
  s.seq++
  obj, err := NewContact(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.contacts[id] = obj
  fmt.Printf("[ContactManagementService.CreateContact] stored %s\\n", id)
  return obj, nil
}

func (s *ContactManagementService) GetContact(id string) (*Contact, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.contacts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Contact id: %s", id)
  }
  fmt.Printf("[ContactManagementService.GetContact] found %s\\n", id)
  return obj, nil
}

func (s *ContactManagementService) CreateContactGroup(name string) (*ContactGroup, error) {
  if name == "" {
    return nil, fmt.Errorf("ContactGroup name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CON-%04d", s.seq)
  s.seq++
  obj, err := NewContactGroup(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.contact_groups[id] = obj
  fmt.Printf("[ContactManagementService.CreateContactGroup] stored %s\\n", id)
  return obj, nil
}

func (s *ContactManagementService) GetContactGroup(id string) (*ContactGroup, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.contact_groups[id]
  if !ok {
    return nil, fmt.Errorf("unknown ContactGroup id: %s", id)
  }
  fmt.Printf("[ContactManagementService.GetContactGroup] found %s\\n", id)
  return obj, nil
}

func (s *ContactManagementService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[ContactManagementService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *ContactManagementService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[ContactManagementService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *ContactManagementService) CloseContact(id string) (*Contact, error) {
  obj, err := s.GetContact(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[ContactManagementService.CloseContact] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct ContactManagementService ==========")
  system := NewContactManagementService()
  fmt.Println("========== STEP 2: Create Contact ==========")
  first, _ := system.CreateContact("alpha-contact")
  system.CreateContact("beta-contact")
  system.CreateContactGroup("sample-contact_group")
  system.CreateUser("sample-user")
  system.CloseContact(first.ID)
  if _, err := system.CloseContact(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetContact("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Contact {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Contact(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Contact requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Contact.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Contact invalid status");
    }
    Console.WriteLine("[Contact.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Contact " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Contact.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ContactGroup {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ContactGroup(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ContactGroup requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ContactGroup.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ContactGroup invalid status");
    }
    Console.WriteLine("[ContactGroup.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ContactGroup " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ContactGroup.close] id=" + Id + " -> CLOSED");
  }
}


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

sealed class ContactManagementService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Contact> _contacts = new();
  private readonly Dictionary<string, ContactGroup> _contact_groups = new();
  private readonly Dictionary<string, User> _users = new();
  public ContactManagementService() {
    Console.WriteLine("[ContactManagementService.__init__] system ready");
  }

  public Contact CreateContact(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Contact name required");
    }
    lock (_gate) {
      var id = string.Format("CON-{0:D4}", _seq++);
      var obj = new Contact(id, name.Trim());
      obj.Validate();
      _contacts[id] = obj;
      Console.WriteLine("[ContactManagementService.CreateContact] stored " + id);
      return obj;
    }
  }

  public Contact GetContact(string id) {
    lock (_gate) {
      if (!_contacts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Contact id: " + id);
      }
      Console.WriteLine("[ContactManagementService.GetContact] found " + id);
      return obj;
    }
  }

  public ContactGroup CreateContactGroup(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ContactGroup name required");
    }
    lock (_gate) {
      var id = string.Format("CON-{0:D4}", _seq++);
      var obj = new ContactGroup(id, name.Trim());
      obj.Validate();
      _contact_groups[id] = obj;
      Console.WriteLine("[ContactManagementService.CreateContactGroup] stored " + id);
      return obj;
    }
  }

  public ContactGroup GetContactGroup(string id) {
    lock (_gate) {
      if (!_contact_groups.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ContactGroup id: " + id);
      }
      Console.WriteLine("[ContactManagementService.GetContactGroup] found " + id);
      return obj;
    }
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
      Console.WriteLine("[ContactManagementService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[ContactManagementService.GetUser] found " + id);
      return obj;
    }
  }

  public Contact CloseContact(string id) {
    var obj = GetContact(id);
    Console.WriteLine("[ContactManagementService.CloseContact] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct ContactManagementService ==========");
    var system = new ContactManagementService();
    Console.WriteLine("========== STEP 2: Create Contact ==========");
    var first = system.CreateContact("alpha-contact");
    system.CreateContact("beta-contact");
    system.CreateContactGroup("sample-contact_group");
    system.CreateUser("sample-user");
    system.CloseContact(first.Id);
    try {
      system.CloseContact(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetContact("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const contactManagementSolution: ProblemSolution = {
  slug: 'contact-management',
  title: 'Contact Management System (Address Book) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an address book application that stores contacts, supports search, and groups contacts into categories. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Add, edit, and delete a contact (name, phone, email, address)',
      'Search contacts by name, phone, or email (partial match)',
      'Group contacts into labeled categories (e.g. Family, Work)',
      'Merge duplicate contacts',
      'Favorite/star important contacts',
      'Export contacts to a shareable format',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Add, edit, and delete a contact (name, phone, email, address)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Search contacts by name, phone, or email (partial match)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Group contacts into labeled categories (e.g. Family, Work)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Merge duplicate contacts?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Favorite/star important contacts?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. ContactManagementService is the facade stereotype. Contact, ContactGroup, User are concrete domain classes with id/name/status and validate/close.',
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
          'Construct ContactManagementService.',
          'createContact twice and create the related UML classes.',
          'closeContact once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'ContactManagementService', responsibility: 'UML facade - orchestrates Contact Management System (Address Book).', keyMembers: ['create*', 'get*', 'closeContact'] },
    { name: 'Contact', responsibility: 'UML class - domain object for Contact Management System (Address Book).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ContactGroup', responsibility: 'UML class - domain object for Contact Management System (Address Book).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Contact Management System (Address Book).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from ContactManagementService to Contact, ContactGroup, User. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on ContactManagementService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'ContactManagementService', responsibility: 'UML facade - orchestrates Contact Management System (Address Book).', keyMembers: ['create*', 'get*', 'closeContact'] },
    { name: 'Contact', responsibility: 'UML class - domain object for Contact Management System (Address Book).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ContactGroup', responsibility: 'UML class - domain object for Contact Management System (Address Book).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Contact Management System (Address Book).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'ContactManagementService exposes create/get/close and owns composed collections.' },
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
      'main constructs ContactManagementService, creates UML domain objects, closes the primary Contact, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct ContactManagementService.',
      'createContact for alpha and beta.',
      'create remaining UML classes.',
      'closeContact(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createContact("alpha..."); closeContact(id)',
        output: '[Contact.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeContact(alreadyClosed) or getContact("MISSING-ID")',
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
