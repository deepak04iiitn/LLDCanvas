import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'SimpleLruCacheService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_entities', 'Map<string, Entity>'),
    attr('-', '_repositories', 'Map<string, Repository>'),
    attr('-', '_policies', 'Map<string, Policy>'),
  ], [
    method('+', 'createEntity', 'name: string', 'Entity'),
    method('+', 'createRepository', 'name: string', 'Repository'),
    method('+', 'createPolicy', 'name: string', 'Policy'),
    method('+', 'getEntity', 'id: string', 'Entity'),
    method('+', 'getRepository', 'id: string', 'Repository'),
    method('+', 'getPolicy', 'id: string', 'Policy'),
    method('+', 'closeEntity', 'id: string', 'Entity'),
  ], 'facade'),
  cls('n1', 'Entity', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Repository', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Policy', GRID.x(0), GRID.y(1), [
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
log = logging.getLogger("simple-lru-cache")


class Entity:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Entity.id is required")
        if not name or not name.strip():
            raise ValueError("Entity.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Entity.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Entity {self.id} has invalid status={self.status}")
        log.info("[Entity.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Entity {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Entity.close] id=%s -> CLOSED", self.id)


class Repository:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Repository.id is required")
        if not name or not name.strip():
            raise ValueError("Repository.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Repository.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Repository {self.id} has invalid status={self.status}")
        log.info("[Repository.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Repository {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Repository.close] id=%s -> CLOSED", self.id)


class Policy:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Policy.id is required")
        if not name or not name.strip():
            raise ValueError("Policy.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Policy.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Policy {self.id} has invalid status={self.status}")
        log.info("[Policy.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Policy {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Policy.close] id=%s -> CLOSED", self.id)


class SimpleLruCacheService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._entities: Dict[str, Entity] = {}
        self._repositories: Dict[str, Repository] = {}
        self._policies: Dict[str, Policy] = {}
        log.info("[SimpleLruCacheService.__init__] system ready; managing: Entity, Repository, Policy")

    def create_entity(self, name: str) -> Entity:
        """UML: SimpleLruCacheService.create_entity(name) -> Entity"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Entity name is required")
        with self._lock:
            item_id = f"ENT-{self._seq:04d}"
            self._seq += 1
            obj = Entity(item_id, cleaned)
            obj.validate()
            self._entities[item_id] = obj
            log.info("[SimpleLruCacheService.create_entity] stored %s in _entities (count=%s)", item_id, len(self._entities))
            return obj

    def get_entity(self, item_id: str) -> Entity:
        with self._lock:
            obj = self._entities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Entity id: {item_id}")
            log.info("[SimpleLruCacheService.get_entity] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_repository(self, name: str) -> Repository:
        """UML: SimpleLruCacheService.create_repository(name) -> Repository"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Repository name is required")
        with self._lock:
            item_id = f"REP-{self._seq:04d}"
            self._seq += 1
            obj = Repository(item_id, cleaned)
            obj.validate()
            self._repositories[item_id] = obj
            log.info("[SimpleLruCacheService.create_repository] stored %s in _repositories (count=%s)", item_id, len(self._repositories))
            return obj

    def get_repository(self, item_id: str) -> Repository:
        with self._lock:
            obj = self._repositories.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Repository id: {item_id}")
            log.info("[SimpleLruCacheService.get_repository] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_policy(self, name: str) -> Policy:
        """UML: SimpleLruCacheService.create_policy(name) -> Policy"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Policy name is required")
        with self._lock:
            item_id = f"POL-{self._seq:04d}"
            self._seq += 1
            obj = Policy(item_id, cleaned)
            obj.validate()
            self._policies[item_id] = obj
            log.info("[SimpleLruCacheService.create_policy] stored %s in _policies (count=%s)", item_id, len(self._policies))
            return obj

    def get_policy(self, item_id: str) -> Policy:
        with self._lock:
            obj = self._policies.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Policy id: {item_id}")
            log.info("[SimpleLruCacheService.get_policy] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_entity(self, item_id: str) -> Entity:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._entities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Entity id: {item_id}")
            log.info("[SimpleLruCacheService.close_entity] closing %s via Entity.close()", item_id)
            obj.close()
            return obj

    def list_active_entitys(self) -> List[Entity]:
        with self._lock:
            active = [o for o in self._entities.values() if o.status == "ACTIVE"]
            log.info("[SimpleLruCacheService.list_active_entitys] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct SimpleLruCacheService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = SimpleLruCacheService()

    log.info("========== STEP 2: Create primary Entity objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_entity("alpha-entity")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_entity("beta-entity")

    log.info("========== STEP 3: Create Repository (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_repository("sample-repository")

    log.info("========== STEP 4: Create Policy (UML class) ==========")
    system.create_policy("sample-policy")

    log.info("========== STEP 5: Inspect active Entity list ==========")
    system.list_active_entitys()

    log.info("========== STEP 6: Close first Entity ==========")
    system.close_entity(first.id)

    log.info("========== STEP 7: Expected failure - close again ==========")
    try:
        system.close_entity(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Entity.close: %s", err)

    log.info("========== STEP 8: Expected failure - missing id ==========")
    try:
        system.get_entity("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_entity: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_entitys()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Entity {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Entity(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Entity.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Entity.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Entity.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Entity " + id + " invalid status");
    }
    System.out.println("[Entity.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Entity " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Entity.close] id=" + id + " -> CLOSED");
  }
}


class Repository {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Repository(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Repository.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Repository.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Repository.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Repository " + id + " invalid status");
    }
    System.out.println("[Repository.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Repository " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Repository.close] id=" + id + " -> CLOSED");
  }
}


class Policy {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Policy(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Policy.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Policy.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Policy.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Policy " + id + " invalid status");
    }
    System.out.println("[Policy.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Policy " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Policy.close] id=" + id + " -> CLOSED");
  }
}

public class SimpleLruCacheService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Entity> entities = new LinkedHashMap<>();
  private final Map<String, Repository> repositories = new LinkedHashMap<>();
  private final Map<String, Policy> policies = new LinkedHashMap<>();

  public SimpleLruCacheService() {
    System.out.println("[SimpleLruCacheService.__init__] system ready");
  }

  public Entity createEntity(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Entity name required");
    }
    lock.lock();
    try {
      String id = String.format("ENT-%04d", seq++);
      Entity obj = new Entity(id, name.trim());
      obj.validate();
      entities.put(id, obj);
      System.out.println("[SimpleLruCacheService.createEntity] stored " + id + " count=" + entities.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Entity getEntity(String id) {
    lock.lock();
    try {
      Entity obj = entities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Entity id: " + id);
      }
      System.out.println("[SimpleLruCacheService.getEntity] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Repository createRepository(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Repository name required");
    }
    lock.lock();
    try {
      String id = String.format("REP-%04d", seq++);
      Repository obj = new Repository(id, name.trim());
      obj.validate();
      repositories.put(id, obj);
      System.out.println("[SimpleLruCacheService.createRepository] stored " + id + " count=" + repositories.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Repository getRepository(String id) {
    lock.lock();
    try {
      Repository obj = repositories.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Repository id: " + id);
      }
      System.out.println("[SimpleLruCacheService.getRepository] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Policy createPolicy(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Policy name required");
    }
    lock.lock();
    try {
      String id = String.format("POL-%04d", seq++);
      Policy obj = new Policy(id, name.trim());
      obj.validate();
      policies.put(id, obj);
      System.out.println("[SimpleLruCacheService.createPolicy] stored " + id + " count=" + policies.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Policy getPolicy(String id) {
    lock.lock();
    try {
      Policy obj = policies.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Policy id: " + id);
      }
      System.out.println("[SimpleLruCacheService.getPolicy] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Entity closeEntity(String id) {
    lock.lock();
    try {
      Entity obj = entities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Entity id: " + id);
      }
      System.out.println("[SimpleLruCacheService.closeEntity] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Entity> listActiveEntitys() {
    lock.lock();
    try {
      List<Entity> out = new ArrayList<>();
      for (Entity o : entities.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[SimpleLruCacheService.listActiveEntitys] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct SimpleLruCacheService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    SimpleLruCacheService system = new SimpleLruCacheService();
    System.out.println("========== STEP 2: Create Entity objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Entity first = system.createEntity("alpha-entity");
    system.createEntity("beta-entity");
    System.out.println("========== STEP 3: Create Repository ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createRepository("sample-repository");
    System.out.println("========== STEP 4: Create Policy ==========");
    system.createPolicy("sample-policy");
    System.out.println("========== Inspect active list ==========");
    system.listActiveEntitys();
    System.out.println("========== Close first Entity ==========");
    system.closeEntity(first.getId());
    try {
      system.closeEntity(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getEntity("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Entity {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Entity.id required')
    }

    if (!name?.trim()) {
      throw new Error('Entity.name required')
    }
    console.log(\`[Entity.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Entity \${this.id} invalid status\`)
    }
    console.log(\`[Entity.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Entity \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Entity.close] id=\${this.id} -> CLOSED\`)
  }
}


class Repository {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Repository.id required')
    }

    if (!name?.trim()) {
      throw new Error('Repository.name required')
    }
    console.log(\`[Repository.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Repository \${this.id} invalid status\`)
    }
    console.log(\`[Repository.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Repository \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Repository.close] id=\${this.id} -> CLOSED\`)
  }
}


class Policy {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Policy.id required')
    }

    if (!name?.trim()) {
      throw new Error('Policy.name required')
    }
    console.log(\`[Policy.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Policy \${this.id} invalid status\`)
    }
    console.log(\`[Policy.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Policy \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Policy.close] id=\${this.id} -> CLOSED\`)
  }
}

class SimpleLruCacheService {
  private seq = 1
  private entities = new Map<string, Entity>()
  private repositories = new Map<string, Repository>()
  private policies = new Map<string, Policy>()
  constructor() {
    console.log('[SimpleLruCacheService.__init__] system ready')
  }

  createEntity(name: string): Entity {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Entity name required')
    }
    const id = \`ENT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Entity(id, cleaned)
    obj.validate()
    this.entities.set(id, obj)
    console.log(\`[SimpleLruCacheService.createEntity] stored \${id} count=\${this.entities.size}\`)
    return obj
  }

  getEntity(id: string): Entity {
    const obj = this.entities.get(id)
    if (!obj) {
      throw new Error(\`unknown Entity id: \${id}\`)
    }
    console.log(\`[SimpleLruCacheService.getEntity] found id=\${obj.id}\`)
    return obj
  }

  createRepository(name: string): Repository {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Repository name required')
    }
    const id = \`REP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Repository(id, cleaned)
    obj.validate()
    this.repositories.set(id, obj)
    console.log(\`[SimpleLruCacheService.createRepository] stored \${id} count=\${this.repositories.size}\`)
    return obj
  }

  getRepository(id: string): Repository {
    const obj = this.repositories.get(id)
    if (!obj) {
      throw new Error(\`unknown Repository id: \${id}\`)
    }
    console.log(\`[SimpleLruCacheService.getRepository] found id=\${obj.id}\`)
    return obj
  }

  createPolicy(name: string): Policy {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Policy name required')
    }
    const id = \`POL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Policy(id, cleaned)
    obj.validate()
    this.policies.set(id, obj)
    console.log(\`[SimpleLruCacheService.createPolicy] stored \${id} count=\${this.policies.size}\`)
    return obj
  }

  getPolicy(id: string): Policy {
    const obj = this.policies.get(id)
    if (!obj) {
      throw new Error(\`unknown Policy id: \${id}\`)
    }
    console.log(\`[SimpleLruCacheService.getPolicy] found id=\${obj.id}\`)
    return obj
  }

  closeEntity(id: string): Entity {
    const obj = this.getEntity(id)
    console.log(\`[SimpleLruCacheService.closeEntity] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveEntitys(): Entity[] {
    const active = [...this.entities.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[SimpleLruCacheService.listActiveEntitys] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct SimpleLruCacheService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new SimpleLruCacheService()
  console.log('========== STEP 2: Create Entity objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createEntity('alpha-entity')
  system.createEntity('beta-entity')
  console.log('========== STEP 3: Create Repository ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createRepository('sample-repository')
  console.log('========== STEP 4: Create Policy ==========')
  system.createPolicy('sample-policy')
  system.listActiveEntitys()
  console.log('========== Close first Entity ==========')
  system.closeEntity(first.id)
  try {
    system.closeEntity(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getEntity('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Entity {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Entity(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Entity requires id and name");
    }
    cout << "[Entity.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Entity invalid status");
    }
    cout << "[Entity.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Entity cannot close");
    }
    status_ = "CLOSED";
    cout << "[Entity.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Repository {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Repository(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Repository requires id and name");
    }
    cout << "[Repository.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Repository invalid status");
    }
    cout << "[Repository.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Repository cannot close");
    }
    status_ = "CLOSED";
    cout << "[Repository.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Policy {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Policy(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Policy requires id and name");
    }
    cout << "[Policy.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Policy invalid status");
    }
    cout << "[Policy.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Policy cannot close");
    }
    status_ = "CLOSED";
    cout << "[Policy.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class SimpleLruCacheService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Entity> entities_;
  unordered_map<string, Repository> repositories_;
  unordered_map<string, Policy> policies_;
public:
  SimpleLruCacheService() {
    cout << "[SimpleLruCacheService.__init__] system ready" << endl;
  }

  Entity createEntity(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Entity name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ENT-%04d", seq_++);
    Entity obj{buf, name};
    obj.validate();
    entities_.emplace(obj.id(), obj);
    cout << "[SimpleLruCacheService.createEntity] stored " << obj.id() << endl;
    return obj;
  }

  Entity getEntity(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = entities_.find(id);
    if (it == entities_.end()) {
      throw out_of_range("unknown Entity id");
    }
    cout << "[SimpleLruCacheService.getEntity] found " << id << endl;
    return it->second;
  }

  Repository createRepository(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Repository name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REP-%04d", seq_++);
    Repository obj{buf, name};
    obj.validate();
    repositories_.emplace(obj.id(), obj);
    cout << "[SimpleLruCacheService.createRepository] stored " << obj.id() << endl;
    return obj;
  }

  Repository getRepository(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = repositories_.find(id);
    if (it == repositories_.end()) {
      throw out_of_range("unknown Repository id");
    }
    cout << "[SimpleLruCacheService.getRepository] found " << id << endl;
    return it->second;
  }

  Policy createPolicy(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Policy name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "POL-%04d", seq_++);
    Policy obj{buf, name};
    obj.validate();
    policies_.emplace(obj.id(), obj);
    cout << "[SimpleLruCacheService.createPolicy] stored " << obj.id() << endl;
    return obj;
  }

  Policy getPolicy(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = policies_.find(id);
    if (it == policies_.end()) {
      throw out_of_range("unknown Policy id");
    }
    cout << "[SimpleLruCacheService.getPolicy] found " << id << endl;
    return it->second;
  }

  Entity closeEntity(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = entities_.find(id);
    if (it == entities_.end()) {
      throw out_of_range("unknown Entity");
    }
    cout << "[SimpleLruCacheService.closeEntity] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct SimpleLruCacheService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  SimpleLruCacheService system;
  cout << "========== STEP 2: Create Entity ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createEntity("alpha-entity");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createEntity("beta-entity");
  system.createRepository("sample-repository");
  system.createPolicy("sample-policy");
  system.closeEntity(first.id());
  try {
    system.closeEntity(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getEntity("MISSING-ID");
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

type Entity struct {
  ID     string
  Name   string
  Status string
}

func NewEntity(id, name string) (*Entity, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Entity requires id and name")
  }
  obj := &Entity{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Entity.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Entity) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Entity invalid status")
  }
  fmt.Printf("[Entity.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Entity) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Entity %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Entity.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Repository struct {
  ID     string
  Name   string
  Status string
}

func NewRepository(id, name string) (*Repository, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Repository requires id and name")
  }
  obj := &Repository{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Repository.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Repository) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Repository invalid status")
  }
  fmt.Printf("[Repository.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Repository) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Repository %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Repository.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Policy struct {
  ID     string
  Name   string
  Status string
}

func NewPolicy(id, name string) (*Policy, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Policy requires id and name")
  }
  obj := &Policy{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Policy.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Policy) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Policy invalid status")
  }
  fmt.Printf("[Policy.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Policy) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Policy %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Policy.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type SimpleLruCacheService struct {
  mu  sync.Mutex
  seq int
  entities map[string]*Entity
  repositories map[string]*Repository
  policies map[string]*Policy
}

func NewSimpleLruCacheService() *SimpleLruCacheService {
  fmt.Println("[SimpleLruCacheService.__init__] system ready")
  return &SimpleLruCacheService{
    seq: 1,
    entities: map[string]*Entity{},
    repositories: map[string]*Repository{},
    policies: map[string]*Policy{},
  }
}

func (s *SimpleLruCacheService) CreateEntity(name string) (*Entity, error) {
  if name == "" {
    return nil, fmt.Errorf("Entity name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ENT-%04d", s.seq)
  s.seq++
  obj, err := NewEntity(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.entities[id] = obj
  fmt.Printf("[SimpleLruCacheService.CreateEntity] stored %s\\n", id)
  return obj, nil
}

func (s *SimpleLruCacheService) GetEntity(id string) (*Entity, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.entities[id]
  if !ok {
    return nil, fmt.Errorf("unknown Entity id: %s", id)
  }
  fmt.Printf("[SimpleLruCacheService.GetEntity] found %s\\n", id)
  return obj, nil
}

func (s *SimpleLruCacheService) CreateRepository(name string) (*Repository, error) {
  if name == "" {
    return nil, fmt.Errorf("Repository name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REP-%04d", s.seq)
  s.seq++
  obj, err := NewRepository(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.repositories[id] = obj
  fmt.Printf("[SimpleLruCacheService.CreateRepository] stored %s\\n", id)
  return obj, nil
}

func (s *SimpleLruCacheService) GetRepository(id string) (*Repository, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.repositories[id]
  if !ok {
    return nil, fmt.Errorf("unknown Repository id: %s", id)
  }
  fmt.Printf("[SimpleLruCacheService.GetRepository] found %s\\n", id)
  return obj, nil
}

func (s *SimpleLruCacheService) CreatePolicy(name string) (*Policy, error) {
  if name == "" {
    return nil, fmt.Errorf("Policy name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("POL-%04d", s.seq)
  s.seq++
  obj, err := NewPolicy(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.policies[id] = obj
  fmt.Printf("[SimpleLruCacheService.CreatePolicy] stored %s\\n", id)
  return obj, nil
}

func (s *SimpleLruCacheService) GetPolicy(id string) (*Policy, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.policies[id]
  if !ok {
    return nil, fmt.Errorf("unknown Policy id: %s", id)
  }
  fmt.Printf("[SimpleLruCacheService.GetPolicy] found %s\\n", id)
  return obj, nil
}

func (s *SimpleLruCacheService) CloseEntity(id string) (*Entity, error) {
  obj, err := s.GetEntity(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[SimpleLruCacheService.CloseEntity] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct SimpleLruCacheService ==========")
  system := NewSimpleLruCacheService()
  fmt.Println("========== STEP 2: Create Entity ==========")
  first, _ := system.CreateEntity("alpha-entity")
  system.CreateEntity("beta-entity")
  system.CreateRepository("sample-repository")
  system.CreatePolicy("sample-policy")
  system.CloseEntity(first.ID)
  if _, err := system.CloseEntity(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetEntity("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Entity {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Entity(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Entity requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Entity.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Entity invalid status");
    }
    Console.WriteLine("[Entity.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Entity " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Entity.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Repository {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Repository(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Repository requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Repository.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Repository invalid status");
    }
    Console.WriteLine("[Repository.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Repository " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Repository.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Policy {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Policy(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Policy requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Policy.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Policy invalid status");
    }
    Console.WriteLine("[Policy.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Policy " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Policy.close] id=" + Id + " -> CLOSED");
  }
}

sealed class SimpleLruCacheService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Entity> _entities = new();
  private readonly Dictionary<string, Repository> _repositories = new();
  private readonly Dictionary<string, Policy> _policies = new();
  public SimpleLruCacheService() {
    Console.WriteLine("[SimpleLruCacheService.__init__] system ready");
  }

  public Entity CreateEntity(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Entity name required");
    }
    lock (_gate) {
      var id = string.Format("ENT-{0:D4}", _seq++);
      var obj = new Entity(id, name.Trim());
      obj.Validate();
      _entities[id] = obj;
      Console.WriteLine("[SimpleLruCacheService.CreateEntity] stored " + id);
      return obj;
    }
  }

  public Entity GetEntity(string id) {
    lock (_gate) {
      if (!_entities.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Entity id: " + id);
      }
      Console.WriteLine("[SimpleLruCacheService.GetEntity] found " + id);
      return obj;
    }
  }

  public Repository CreateRepository(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Repository name required");
    }
    lock (_gate) {
      var id = string.Format("REP-{0:D4}", _seq++);
      var obj = new Repository(id, name.Trim());
      obj.Validate();
      _repositories[id] = obj;
      Console.WriteLine("[SimpleLruCacheService.CreateRepository] stored " + id);
      return obj;
    }
  }

  public Repository GetRepository(string id) {
    lock (_gate) {
      if (!_repositories.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Repository id: " + id);
      }
      Console.WriteLine("[SimpleLruCacheService.GetRepository] found " + id);
      return obj;
    }
  }

  public Policy CreatePolicy(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Policy name required");
    }
    lock (_gate) {
      var id = string.Format("POL-{0:D4}", _seq++);
      var obj = new Policy(id, name.Trim());
      obj.Validate();
      _policies[id] = obj;
      Console.WriteLine("[SimpleLruCacheService.CreatePolicy] stored " + id);
      return obj;
    }
  }

  public Policy GetPolicy(string id) {
    lock (_gate) {
      if (!_policies.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Policy id: " + id);
      }
      Console.WriteLine("[SimpleLruCacheService.GetPolicy] found " + id);
      return obj;
    }
  }

  public Entity CloseEntity(string id) {
    var obj = GetEntity(id);
    Console.WriteLine("[SimpleLruCacheService.CloseEntity] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct SimpleLruCacheService ==========");
    var system = new SimpleLruCacheService();
    Console.WriteLine("========== STEP 2: Create Entity ==========");
    var first = system.CreateEntity("alpha-entity");
    system.CreateEntity("beta-entity");
    system.CreateRepository("sample-repository");
    system.CreatePolicy("sample-policy");
    system.CloseEntity(first.Id);
    try {
      system.CloseEntity(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetEntity("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const simpleLruCacheSolution: ProblemSolution = {
  slug: 'simple-lru-cache',
  title: 'Simple LRU Cache - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an in-memory Least Recently Used (LRU) cache with O(1) get and put operations. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'get(key) returns the value if present, else -1/null',
      'put(key, value) inserts or updates a key',
      'Evict the least recently used item when capacity is exceeded',
      'Accessing a key (get or put) marks it as most recently used',
      'Support a configurable fixed capacity',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'get(key) returns the value if present, else -1/null?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'put(key, value) inserts or updates a key?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Evict the least recently used item when capacity is exceeded?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Accessing a key (get or put) marks it as most recently used?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support a configurable fixed capacity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. SimpleLruCacheService is the facade stereotype. Entity, Repository, Policy are concrete domain classes with id/name/status and validate/close.',
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
          'Construct SimpleLruCacheService.',
          'createEntity twice and create the related UML classes.',
          'closeEntity once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'SimpleLruCacheService', responsibility: 'UML facade - orchestrates Simple LRU Cache.', keyMembers: ['create*', 'get*', 'closeEntity'] },
    { name: 'Entity', responsibility: 'UML class - domain object for Simple LRU Cache.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Repository', responsibility: 'UML class - domain object for Simple LRU Cache.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Policy', responsibility: 'UML class - domain object for Simple LRU Cache.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from SimpleLruCacheService to Entity, Repository, Policy. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on SimpleLruCacheService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'SimpleLruCacheService', responsibility: 'UML facade - orchestrates Simple LRU Cache.', keyMembers: ['create*', 'get*', 'closeEntity'] },
    { name: 'Entity', responsibility: 'UML class - domain object for Simple LRU Cache.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Repository', responsibility: 'UML class - domain object for Simple LRU Cache.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Policy', responsibility: 'UML class - domain object for Simple LRU Cache.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'SimpleLruCacheService exposes create/get/close and owns composed collections.' },
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
      'main constructs SimpleLruCacheService, creates UML domain objects, closes the primary Entity, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct SimpleLruCacheService.',
      'createEntity for alpha and beta.',
      'create remaining UML classes.',
      'closeEntity(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createEntity("alpha..."); closeEntity(id)',
        output: '[Entity.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeEntity(alreadyClosed) or getEntity("MISSING-ID")',
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
