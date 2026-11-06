import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'DistributedMessageQueueService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_topics', 'Map<string, Topic>'),
    attr('-', '_partitions', 'Map<string, Partition>'),
    attr('-', '_brokers', 'Map<string, Broker>'),
    attr('-', '_producers', 'Map<string, Producer>'),
    attr('-', '_consumers', 'Map<string, Consumer>'),
  ], [
    method('+', 'createTopic', 'name: string', 'Topic'),
    method('+', 'createPartition', 'name: string', 'Partition'),
    method('+', 'createBroker', 'name: string', 'Broker'),
    method('+', 'createProducer', 'name: string', 'Producer'),
    method('+', 'createConsumer', 'name: string', 'Consumer'),
    method('+', 'getTopic', 'id: string', 'Topic'),
    method('+', 'getPartition', 'id: string', 'Partition'),
    method('+', 'getBroker', 'id: string', 'Broker'),
    method('+', 'getProducer', 'id: string', 'Producer'),
    method('+', 'getConsumer', 'id: string', 'Consumer'),
    method('+', 'closeTopic', 'id: string', 'Topic'),
  ], 'facade'),
  cls('n1', 'Topic', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Partition', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Broker', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Producer', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Consumer', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("distributed-message-queue")


class Topic:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Topic.id is required")
        if not name or not name.strip():
            raise ValueError("Topic.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Topic.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Topic {self.id} has invalid status={self.status}")
        log.info("[Topic.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Topic {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Topic.close] id=%s -> CLOSED", self.id)


class Partition:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Partition.id is required")
        if not name or not name.strip():
            raise ValueError("Partition.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Partition.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Partition {self.id} has invalid status={self.status}")
        log.info("[Partition.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Partition {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Partition.close] id=%s -> CLOSED", self.id)


class Broker:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Broker.id is required")
        if not name or not name.strip():
            raise ValueError("Broker.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Broker.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Broker {self.id} has invalid status={self.status}")
        log.info("[Broker.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Broker {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Broker.close] id=%s -> CLOSED", self.id)


class Producer:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Producer.id is required")
        if not name or not name.strip():
            raise ValueError("Producer.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Producer.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Producer {self.id} has invalid status={self.status}")
        log.info("[Producer.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Producer {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Producer.close] id=%s -> CLOSED", self.id)


class Consumer:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Consumer.id is required")
        if not name or not name.strip():
            raise ValueError("Consumer.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Consumer.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Consumer {self.id} has invalid status={self.status}")
        log.info("[Consumer.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Consumer {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Consumer.close] id=%s -> CLOSED", self.id)


class DistributedMessageQueueService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._topics: Dict[str, Topic] = {}
        self._partitions: Dict[str, Partition] = {}
        self._brokers: Dict[str, Broker] = {}
        self._producers: Dict[str, Producer] = {}
        self._consumers: Dict[str, Consumer] = {}
        log.info("[DistributedMessageQueueService.__init__] system ready; managing: Topic, Partition, Broker, Producer, Consumer")

    def create_topic(self, name: str) -> Topic:
        """UML: DistributedMessageQueueService.create_topic(name) -> Topic"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Topic name is required")
        with self._lock:
            item_id = f"TOP-{self._seq:04d}"
            self._seq += 1
            obj = Topic(item_id, cleaned)
            obj.validate()
            self._topics[item_id] = obj
            log.info("[DistributedMessageQueueService.create_topic] stored %s in _topics (count=%s)", item_id, len(self._topics))
            return obj

    def get_topic(self, item_id: str) -> Topic:
        with self._lock:
            obj = self._topics.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Topic id: {item_id}")
            log.info("[DistributedMessageQueueService.get_topic] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_partition(self, name: str) -> Partition:
        """UML: DistributedMessageQueueService.create_partition(name) -> Partition"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Partition name is required")
        with self._lock:
            item_id = f"PAR-{self._seq:04d}"
            self._seq += 1
            obj = Partition(item_id, cleaned)
            obj.validate()
            self._partitions[item_id] = obj
            log.info("[DistributedMessageQueueService.create_partition] stored %s in _partitions (count=%s)", item_id, len(self._partitions))
            return obj

    def get_partition(self, item_id: str) -> Partition:
        with self._lock:
            obj = self._partitions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Partition id: {item_id}")
            log.info("[DistributedMessageQueueService.get_partition] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_broker(self, name: str) -> Broker:
        """UML: DistributedMessageQueueService.create_broker(name) -> Broker"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Broker name is required")
        with self._lock:
            item_id = f"BRO-{self._seq:04d}"
            self._seq += 1
            obj = Broker(item_id, cleaned)
            obj.validate()
            self._brokers[item_id] = obj
            log.info("[DistributedMessageQueueService.create_broker] stored %s in _brokers (count=%s)", item_id, len(self._brokers))
            return obj

    def get_broker(self, item_id: str) -> Broker:
        with self._lock:
            obj = self._brokers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Broker id: {item_id}")
            log.info("[DistributedMessageQueueService.get_broker] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_producer(self, name: str) -> Producer:
        """UML: DistributedMessageQueueService.create_producer(name) -> Producer"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Producer name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = Producer(item_id, cleaned)
            obj.validate()
            self._producers[item_id] = obj
            log.info("[DistributedMessageQueueService.create_producer] stored %s in _producers (count=%s)", item_id, len(self._producers))
            return obj

    def get_producer(self, item_id: str) -> Producer:
        with self._lock:
            obj = self._producers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Producer id: {item_id}")
            log.info("[DistributedMessageQueueService.get_producer] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_consumer(self, name: str) -> Consumer:
        """UML: DistributedMessageQueueService.create_consumer(name) -> Consumer"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Consumer name is required")
        with self._lock:
            item_id = f"CON-{self._seq:04d}"
            self._seq += 1
            obj = Consumer(item_id, cleaned)
            obj.validate()
            self._consumers[item_id] = obj
            log.info("[DistributedMessageQueueService.create_consumer] stored %s in _consumers (count=%s)", item_id, len(self._consumers))
            return obj

    def get_consumer(self, item_id: str) -> Consumer:
        with self._lock:
            obj = self._consumers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Consumer id: {item_id}")
            log.info("[DistributedMessageQueueService.get_consumer] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_topic(self, item_id: str) -> Topic:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._topics.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Topic id: {item_id}")
            log.info("[DistributedMessageQueueService.close_topic] closing %s via Topic.close()", item_id)
            obj.close()
            return obj

    def list_active_topics(self) -> List[Topic]:
        with self._lock:
            active = [o for o in self._topics.values() if o.status == "ACTIVE"]
            log.info("[DistributedMessageQueueService.list_active_topics] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct DistributedMessageQueueService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = DistributedMessageQueueService()

    log.info("========== STEP 2: Create primary Topic objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_topic("alpha-topic")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_topic("beta-topic")

    log.info("========== STEP 3: Create Partition (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_partition("sample-partition")

    log.info("========== STEP 4: Create Broker (UML class) ==========")
    system.create_broker("sample-broker")

    log.info("========== STEP 5: Create Producer (UML class) ==========")
    system.create_producer("sample-producer")

    log.info("========== STEP 6: Create Consumer (UML class) ==========")
    system.create_consumer("sample-consumer")

    log.info("========== STEP 7: Inspect active Topic list ==========")
    system.list_active_topics()

    log.info("========== STEP 8: Close first Topic ==========")
    system.close_topic(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_topic(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Topic.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_topic("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_topic: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_topics()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Topic {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Topic(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Topic.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Topic.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Topic.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Topic " + id + " invalid status");
    }
    System.out.println("[Topic.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Topic " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Topic.close] id=" + id + " -> CLOSED");
  }
}


class Partition {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Partition(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Partition.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Partition.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Partition.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Partition " + id + " invalid status");
    }
    System.out.println("[Partition.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Partition " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Partition.close] id=" + id + " -> CLOSED");
  }
}


class Broker {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Broker(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Broker.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Broker.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Broker.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Broker " + id + " invalid status");
    }
    System.out.println("[Broker.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Broker " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Broker.close] id=" + id + " -> CLOSED");
  }
}


class Producer {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Producer(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Producer.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Producer.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Producer.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Producer " + id + " invalid status");
    }
    System.out.println("[Producer.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Producer " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Producer.close] id=" + id + " -> CLOSED");
  }
}


class Consumer {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Consumer(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Consumer.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Consumer.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Consumer.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Consumer " + id + " invalid status");
    }
    System.out.println("[Consumer.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Consumer " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Consumer.close] id=" + id + " -> CLOSED");
  }
}

public class DistributedMessageQueueService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Topic> topics = new LinkedHashMap<>();
  private final Map<String, Partition> partitions = new LinkedHashMap<>();
  private final Map<String, Broker> brokers = new LinkedHashMap<>();
  private final Map<String, Producer> producers = new LinkedHashMap<>();
  private final Map<String, Consumer> consumers = new LinkedHashMap<>();

  public DistributedMessageQueueService() {
    System.out.println("[DistributedMessageQueueService.__init__] system ready");
  }

  public Topic createTopic(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Topic name required");
    }
    lock.lock();
    try {
      String id = String.format("TOP-%04d", seq++);
      Topic obj = new Topic(id, name.trim());
      obj.validate();
      topics.put(id, obj);
      System.out.println("[DistributedMessageQueueService.createTopic] stored " + id + " count=" + topics.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Topic getTopic(String id) {
    lock.lock();
    try {
      Topic obj = topics.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Topic id: " + id);
      }
      System.out.println("[DistributedMessageQueueService.getTopic] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Partition createPartition(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Partition name required");
    }
    lock.lock();
    try {
      String id = String.format("PAR-%04d", seq++);
      Partition obj = new Partition(id, name.trim());
      obj.validate();
      partitions.put(id, obj);
      System.out.println("[DistributedMessageQueueService.createPartition] stored " + id + " count=" + partitions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Partition getPartition(String id) {
    lock.lock();
    try {
      Partition obj = partitions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Partition id: " + id);
      }
      System.out.println("[DistributedMessageQueueService.getPartition] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Broker createBroker(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Broker name required");
    }
    lock.lock();
    try {
      String id = String.format("BRO-%04d", seq++);
      Broker obj = new Broker(id, name.trim());
      obj.validate();
      brokers.put(id, obj);
      System.out.println("[DistributedMessageQueueService.createBroker] stored " + id + " count=" + brokers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Broker getBroker(String id) {
    lock.lock();
    try {
      Broker obj = brokers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Broker id: " + id);
      }
      System.out.println("[DistributedMessageQueueService.getBroker] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Producer createProducer(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Producer name required");
    }
    lock.lock();
    try {
      String id = String.format("PRO-%04d", seq++);
      Producer obj = new Producer(id, name.trim());
      obj.validate();
      producers.put(id, obj);
      System.out.println("[DistributedMessageQueueService.createProducer] stored " + id + " count=" + producers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Producer getProducer(String id) {
    lock.lock();
    try {
      Producer obj = producers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Producer id: " + id);
      }
      System.out.println("[DistributedMessageQueueService.getProducer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Consumer createConsumer(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Consumer name required");
    }
    lock.lock();
    try {
      String id = String.format("CON-%04d", seq++);
      Consumer obj = new Consumer(id, name.trim());
      obj.validate();
      consumers.put(id, obj);
      System.out.println("[DistributedMessageQueueService.createConsumer] stored " + id + " count=" + consumers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Consumer getConsumer(String id) {
    lock.lock();
    try {
      Consumer obj = consumers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Consumer id: " + id);
      }
      System.out.println("[DistributedMessageQueueService.getConsumer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Topic closeTopic(String id) {
    lock.lock();
    try {
      Topic obj = topics.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Topic id: " + id);
      }
      System.out.println("[DistributedMessageQueueService.closeTopic] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Topic> listActiveTopics() {
    lock.lock();
    try {
      List<Topic> out = new ArrayList<>();
      for (Topic o : topics.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[DistributedMessageQueueService.listActiveTopics] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct DistributedMessageQueueService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    DistributedMessageQueueService system = new DistributedMessageQueueService();
    System.out.println("========== STEP 2: Create Topic objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Topic first = system.createTopic("alpha-topic");
    system.createTopic("beta-topic");
    System.out.println("========== STEP 3: Create Partition ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createPartition("sample-partition");
    System.out.println("========== STEP 4: Create Broker ==========");
    system.createBroker("sample-broker");
    System.out.println("========== STEP 5: Create Producer ==========");
    system.createProducer("sample-producer");
    System.out.println("========== STEP 6: Create Consumer ==========");
    system.createConsumer("sample-consumer");
    System.out.println("========== Inspect active list ==========");
    system.listActiveTopics();
    System.out.println("========== Close first Topic ==========");
    system.closeTopic(first.getId());
    try {
      system.closeTopic(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getTopic("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Topic {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Topic.id required')
    }

    if (!name?.trim()) {
      throw new Error('Topic.name required')
    }
    console.log(\`[Topic.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Topic \${this.id} invalid status\`)
    }
    console.log(\`[Topic.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Topic \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Topic.close] id=\${this.id} -> CLOSED\`)
  }
}


class Partition {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Partition.id required')
    }

    if (!name?.trim()) {
      throw new Error('Partition.name required')
    }
    console.log(\`[Partition.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Partition \${this.id} invalid status\`)
    }
    console.log(\`[Partition.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Partition \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Partition.close] id=\${this.id} -> CLOSED\`)
  }
}


class Broker {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Broker.id required')
    }

    if (!name?.trim()) {
      throw new Error('Broker.name required')
    }
    console.log(\`[Broker.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Broker \${this.id} invalid status\`)
    }
    console.log(\`[Broker.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Broker \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Broker.close] id=\${this.id} -> CLOSED\`)
  }
}


class Producer {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Producer.id required')
    }

    if (!name?.trim()) {
      throw new Error('Producer.name required')
    }
    console.log(\`[Producer.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Producer \${this.id} invalid status\`)
    }
    console.log(\`[Producer.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Producer \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Producer.close] id=\${this.id} -> CLOSED\`)
  }
}


class Consumer {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Consumer.id required')
    }

    if (!name?.trim()) {
      throw new Error('Consumer.name required')
    }
    console.log(\`[Consumer.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Consumer \${this.id} invalid status\`)
    }
    console.log(\`[Consumer.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Consumer \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Consumer.close] id=\${this.id} -> CLOSED\`)
  }
}

class DistributedMessageQueueService {
  private seq = 1
  private topics = new Map<string, Topic>()
  private partitions = new Map<string, Partition>()
  private brokers = new Map<string, Broker>()
  private producers = new Map<string, Producer>()
  private consumers = new Map<string, Consumer>()
  constructor() {
    console.log('[DistributedMessageQueueService.__init__] system ready')
  }

  createTopic(name: string): Topic {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Topic name required')
    }
    const id = \`TOP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Topic(id, cleaned)
    obj.validate()
    this.topics.set(id, obj)
    console.log(\`[DistributedMessageQueueService.createTopic] stored \${id} count=\${this.topics.size}\`)
    return obj
  }

  getTopic(id: string): Topic {
    const obj = this.topics.get(id)
    if (!obj) {
      throw new Error(\`unknown Topic id: \${id}\`)
    }
    console.log(\`[DistributedMessageQueueService.getTopic] found id=\${obj.id}\`)
    return obj
  }

  createPartition(name: string): Partition {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Partition name required')
    }
    const id = \`PAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Partition(id, cleaned)
    obj.validate()
    this.partitions.set(id, obj)
    console.log(\`[DistributedMessageQueueService.createPartition] stored \${id} count=\${this.partitions.size}\`)
    return obj
  }

  getPartition(id: string): Partition {
    const obj = this.partitions.get(id)
    if (!obj) {
      throw new Error(\`unknown Partition id: \${id}\`)
    }
    console.log(\`[DistributedMessageQueueService.getPartition] found id=\${obj.id}\`)
    return obj
  }

  createBroker(name: string): Broker {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Broker name required')
    }
    const id = \`BRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Broker(id, cleaned)
    obj.validate()
    this.brokers.set(id, obj)
    console.log(\`[DistributedMessageQueueService.createBroker] stored \${id} count=\${this.brokers.size}\`)
    return obj
  }

  getBroker(id: string): Broker {
    const obj = this.brokers.get(id)
    if (!obj) {
      throw new Error(\`unknown Broker id: \${id}\`)
    }
    console.log(\`[DistributedMessageQueueService.getBroker] found id=\${obj.id}\`)
    return obj
  }

  createProducer(name: string): Producer {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Producer name required')
    }
    const id = \`PRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Producer(id, cleaned)
    obj.validate()
    this.producers.set(id, obj)
    console.log(\`[DistributedMessageQueueService.createProducer] stored \${id} count=\${this.producers.size}\`)
    return obj
  }

  getProducer(id: string): Producer {
    const obj = this.producers.get(id)
    if (!obj) {
      throw new Error(\`unknown Producer id: \${id}\`)
    }
    console.log(\`[DistributedMessageQueueService.getProducer] found id=\${obj.id}\`)
    return obj
  }

  createConsumer(name: string): Consumer {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Consumer name required')
    }
    const id = \`CON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Consumer(id, cleaned)
    obj.validate()
    this.consumers.set(id, obj)
    console.log(\`[DistributedMessageQueueService.createConsumer] stored \${id} count=\${this.consumers.size}\`)
    return obj
  }

  getConsumer(id: string): Consumer {
    const obj = this.consumers.get(id)
    if (!obj) {
      throw new Error(\`unknown Consumer id: \${id}\`)
    }
    console.log(\`[DistributedMessageQueueService.getConsumer] found id=\${obj.id}\`)
    return obj
  }

  closeTopic(id: string): Topic {
    const obj = this.getTopic(id)
    console.log(\`[DistributedMessageQueueService.closeTopic] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveTopics(): Topic[] {
    const active = [...this.topics.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[DistributedMessageQueueService.listActiveTopics] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct DistributedMessageQueueService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new DistributedMessageQueueService()
  console.log('========== STEP 2: Create Topic objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createTopic('alpha-topic')
  system.createTopic('beta-topic')
  console.log('========== STEP 3: Create Partition ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createPartition('sample-partition')
  console.log('========== STEP 4: Create Broker ==========')
  system.createBroker('sample-broker')
  console.log('========== STEP 5: Create Producer ==========')
  system.createProducer('sample-producer')
  console.log('========== STEP 6: Create Consumer ==========')
  system.createConsumer('sample-consumer')
  system.listActiveTopics()
  console.log('========== Close first Topic ==========')
  system.closeTopic(first.id)
  try {
    system.closeTopic(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getTopic('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Topic {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Topic(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Topic requires id and name");
    }
    cout << "[Topic.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Topic invalid status");
    }
    cout << "[Topic.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Topic cannot close");
    }
    status_ = "CLOSED";
    cout << "[Topic.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Partition {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Partition(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Partition requires id and name");
    }
    cout << "[Partition.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Partition invalid status");
    }
    cout << "[Partition.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Partition cannot close");
    }
    status_ = "CLOSED";
    cout << "[Partition.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Broker {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Broker(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Broker requires id and name");
    }
    cout << "[Broker.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Broker invalid status");
    }
    cout << "[Broker.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Broker cannot close");
    }
    status_ = "CLOSED";
    cout << "[Broker.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Producer {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Producer(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Producer requires id and name");
    }
    cout << "[Producer.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Producer invalid status");
    }
    cout << "[Producer.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Producer cannot close");
    }
    status_ = "CLOSED";
    cout << "[Producer.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Consumer {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Consumer(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Consumer requires id and name");
    }
    cout << "[Consumer.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Consumer invalid status");
    }
    cout << "[Consumer.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Consumer cannot close");
    }
    status_ = "CLOSED";
    cout << "[Consumer.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class DistributedMessageQueueService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Topic> topics_;
  unordered_map<string, Partition> partitions_;
  unordered_map<string, Broker> brokers_;
  unordered_map<string, Producer> producers_;
  unordered_map<string, Consumer> consumers_;
public:
  DistributedMessageQueueService() {
    cout << "[DistributedMessageQueueService.__init__] system ready" << endl;
  }

  Topic createTopic(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Topic name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TOP-%04d", seq_++);
    Topic obj{buf, name};
    obj.validate();
    topics_.emplace(obj.id(), obj);
    cout << "[DistributedMessageQueueService.createTopic] stored " << obj.id() << endl;
    return obj;
  }

  Topic getTopic(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = topics_.find(id);
    if (it == topics_.end()) {
      throw out_of_range("unknown Topic id");
    }
    cout << "[DistributedMessageQueueService.getTopic] found " << id << endl;
    return it->second;
  }

  Partition createPartition(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Partition name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAR-%04d", seq_++);
    Partition obj{buf, name};
    obj.validate();
    partitions_.emplace(obj.id(), obj);
    cout << "[DistributedMessageQueueService.createPartition] stored " << obj.id() << endl;
    return obj;
  }

  Partition getPartition(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = partitions_.find(id);
    if (it == partitions_.end()) {
      throw out_of_range("unknown Partition id");
    }
    cout << "[DistributedMessageQueueService.getPartition] found " << id << endl;
    return it->second;
  }

  Broker createBroker(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Broker name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BRO-%04d", seq_++);
    Broker obj{buf, name};
    obj.validate();
    brokers_.emplace(obj.id(), obj);
    cout << "[DistributedMessageQueueService.createBroker] stored " << obj.id() << endl;
    return obj;
  }

  Broker getBroker(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = brokers_.find(id);
    if (it == brokers_.end()) {
      throw out_of_range("unknown Broker id");
    }
    cout << "[DistributedMessageQueueService.getBroker] found " << id << endl;
    return it->second;
  }

  Producer createProducer(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Producer name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PRO-%04d", seq_++);
    Producer obj{buf, name};
    obj.validate();
    producers_.emplace(obj.id(), obj);
    cout << "[DistributedMessageQueueService.createProducer] stored " << obj.id() << endl;
    return obj;
  }

  Producer getProducer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = producers_.find(id);
    if (it == producers_.end()) {
      throw out_of_range("unknown Producer id");
    }
    cout << "[DistributedMessageQueueService.getProducer] found " << id << endl;
    return it->second;
  }

  Consumer createConsumer(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Consumer name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CON-%04d", seq_++);
    Consumer obj{buf, name};
    obj.validate();
    consumers_.emplace(obj.id(), obj);
    cout << "[DistributedMessageQueueService.createConsumer] stored " << obj.id() << endl;
    return obj;
  }

  Consumer getConsumer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = consumers_.find(id);
    if (it == consumers_.end()) {
      throw out_of_range("unknown Consumer id");
    }
    cout << "[DistributedMessageQueueService.getConsumer] found " << id << endl;
    return it->second;
  }

  Topic closeTopic(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = topics_.find(id);
    if (it == topics_.end()) {
      throw out_of_range("unknown Topic");
    }
    cout << "[DistributedMessageQueueService.closeTopic] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct DistributedMessageQueueService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  DistributedMessageQueueService system;
  cout << "========== STEP 2: Create Topic ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createTopic("alpha-topic");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createTopic("beta-topic");
  system.createPartition("sample-partition");
  system.createBroker("sample-broker");
  system.createProducer("sample-producer");
  system.createConsumer("sample-consumer");
  system.closeTopic(first.id());
  try {
    system.closeTopic(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getTopic("MISSING-ID");
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

type Topic struct {
  ID     string
  Name   string
  Status string
}

func NewTopic(id, name string) (*Topic, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Topic requires id and name")
  }
  obj := &Topic{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Topic.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Topic) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Topic invalid status")
  }
  fmt.Printf("[Topic.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Topic) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Topic %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Topic.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Partition struct {
  ID     string
  Name   string
  Status string
}

func NewPartition(id, name string) (*Partition, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Partition requires id and name")
  }
  obj := &Partition{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Partition.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Partition) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Partition invalid status")
  }
  fmt.Printf("[Partition.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Partition) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Partition %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Partition.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Broker struct {
  ID     string
  Name   string
  Status string
}

func NewBroker(id, name string) (*Broker, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Broker requires id and name")
  }
  obj := &Broker{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Broker.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Broker) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Broker invalid status")
  }
  fmt.Printf("[Broker.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Broker) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Broker %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Broker.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Producer struct {
  ID     string
  Name   string
  Status string
}

func NewProducer(id, name string) (*Producer, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Producer requires id and name")
  }
  obj := &Producer{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Producer.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Producer) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Producer invalid status")
  }
  fmt.Printf("[Producer.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Producer) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Producer %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Producer.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Consumer struct {
  ID     string
  Name   string
  Status string
}

func NewConsumer(id, name string) (*Consumer, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Consumer requires id and name")
  }
  obj := &Consumer{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Consumer.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Consumer) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Consumer invalid status")
  }
  fmt.Printf("[Consumer.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Consumer) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Consumer %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Consumer.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type DistributedMessageQueueService struct {
  mu  sync.Mutex
  seq int
  topics map[string]*Topic
  partitions map[string]*Partition
  brokers map[string]*Broker
  producers map[string]*Producer
  consumers map[string]*Consumer
}

func NewDistributedMessageQueueService() *DistributedMessageQueueService {
  fmt.Println("[DistributedMessageQueueService.__init__] system ready")
  return &DistributedMessageQueueService{
    seq: 1,
    topics: map[string]*Topic{},
    partitions: map[string]*Partition{},
    brokers: map[string]*Broker{},
    producers: map[string]*Producer{},
    consumers: map[string]*Consumer{},
  }
}

func (s *DistributedMessageQueueService) CreateTopic(name string) (*Topic, error) {
  if name == "" {
    return nil, fmt.Errorf("Topic name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TOP-%04d", s.seq)
  s.seq++
  obj, err := NewTopic(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.topics[id] = obj
  fmt.Printf("[DistributedMessageQueueService.CreateTopic] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) GetTopic(id string) (*Topic, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.topics[id]
  if !ok {
    return nil, fmt.Errorf("unknown Topic id: %s", id)
  }
  fmt.Printf("[DistributedMessageQueueService.GetTopic] found %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) CreatePartition(name string) (*Partition, error) {
  if name == "" {
    return nil, fmt.Errorf("Partition name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAR-%04d", s.seq)
  s.seq++
  obj, err := NewPartition(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.partitions[id] = obj
  fmt.Printf("[DistributedMessageQueueService.CreatePartition] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) GetPartition(id string) (*Partition, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.partitions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Partition id: %s", id)
  }
  fmt.Printf("[DistributedMessageQueueService.GetPartition] found %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) CreateBroker(name string) (*Broker, error) {
  if name == "" {
    return nil, fmt.Errorf("Broker name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BRO-%04d", s.seq)
  s.seq++
  obj, err := NewBroker(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.brokers[id] = obj
  fmt.Printf("[DistributedMessageQueueService.CreateBroker] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) GetBroker(id string) (*Broker, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.brokers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Broker id: %s", id)
  }
  fmt.Printf("[DistributedMessageQueueService.GetBroker] found %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) CreateProducer(name string) (*Producer, error) {
  if name == "" {
    return nil, fmt.Errorf("Producer name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PRO-%04d", s.seq)
  s.seq++
  obj, err := NewProducer(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.producers[id] = obj
  fmt.Printf("[DistributedMessageQueueService.CreateProducer] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) GetProducer(id string) (*Producer, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.producers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Producer id: %s", id)
  }
  fmt.Printf("[DistributedMessageQueueService.GetProducer] found %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) CreateConsumer(name string) (*Consumer, error) {
  if name == "" {
    return nil, fmt.Errorf("Consumer name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CON-%04d", s.seq)
  s.seq++
  obj, err := NewConsumer(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.consumers[id] = obj
  fmt.Printf("[DistributedMessageQueueService.CreateConsumer] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) GetConsumer(id string) (*Consumer, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.consumers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Consumer id: %s", id)
  }
  fmt.Printf("[DistributedMessageQueueService.GetConsumer] found %s\\n", id)
  return obj, nil
}

func (s *DistributedMessageQueueService) CloseTopic(id string) (*Topic, error) {
  obj, err := s.GetTopic(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[DistributedMessageQueueService.CloseTopic] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct DistributedMessageQueueService ==========")
  system := NewDistributedMessageQueueService()
  fmt.Println("========== STEP 2: Create Topic ==========")
  first, _ := system.CreateTopic("alpha-topic")
  system.CreateTopic("beta-topic")
  system.CreatePartition("sample-partition")
  system.CreateBroker("sample-broker")
  system.CreateProducer("sample-producer")
  system.CreateConsumer("sample-consumer")
  system.CloseTopic(first.ID)
  if _, err := system.CloseTopic(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetTopic("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Topic {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Topic(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Topic requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Topic.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Topic invalid status");
    }
    Console.WriteLine("[Topic.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Topic " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Topic.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Partition {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Partition(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Partition requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Partition.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Partition invalid status");
    }
    Console.WriteLine("[Partition.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Partition " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Partition.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Broker {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Broker(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Broker requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Broker.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Broker invalid status");
    }
    Console.WriteLine("[Broker.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Broker " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Broker.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Producer {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Producer(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Producer requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Producer.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Producer invalid status");
    }
    Console.WriteLine("[Producer.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Producer " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Producer.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Consumer {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Consumer(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Consumer requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Consumer.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Consumer invalid status");
    }
    Console.WriteLine("[Consumer.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Consumer " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Consumer.close] id=" + Id + " -> CLOSED");
  }
}

sealed class DistributedMessageQueueService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Topic> _topics = new();
  private readonly Dictionary<string, Partition> _partitions = new();
  private readonly Dictionary<string, Broker> _brokers = new();
  private readonly Dictionary<string, Producer> _producers = new();
  private readonly Dictionary<string, Consumer> _consumers = new();
  public DistributedMessageQueueService() {
    Console.WriteLine("[DistributedMessageQueueService.__init__] system ready");
  }

  public Topic CreateTopic(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Topic name required");
    }
    lock (_gate) {
      var id = string.Format("TOP-{0:D4}", _seq++);
      var obj = new Topic(id, name.Trim());
      obj.Validate();
      _topics[id] = obj;
      Console.WriteLine("[DistributedMessageQueueService.CreateTopic] stored " + id);
      return obj;
    }
  }

  public Topic GetTopic(string id) {
    lock (_gate) {
      if (!_topics.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Topic id: " + id);
      }
      Console.WriteLine("[DistributedMessageQueueService.GetTopic] found " + id);
      return obj;
    }
  }

  public Partition CreatePartition(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Partition name required");
    }
    lock (_gate) {
      var id = string.Format("PAR-{0:D4}", _seq++);
      var obj = new Partition(id, name.Trim());
      obj.Validate();
      _partitions[id] = obj;
      Console.WriteLine("[DistributedMessageQueueService.CreatePartition] stored " + id);
      return obj;
    }
  }

  public Partition GetPartition(string id) {
    lock (_gate) {
      if (!_partitions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Partition id: " + id);
      }
      Console.WriteLine("[DistributedMessageQueueService.GetPartition] found " + id);
      return obj;
    }
  }

  public Broker CreateBroker(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Broker name required");
    }
    lock (_gate) {
      var id = string.Format("BRO-{0:D4}", _seq++);
      var obj = new Broker(id, name.Trim());
      obj.Validate();
      _brokers[id] = obj;
      Console.WriteLine("[DistributedMessageQueueService.CreateBroker] stored " + id);
      return obj;
    }
  }

  public Broker GetBroker(string id) {
    lock (_gate) {
      if (!_brokers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Broker id: " + id);
      }
      Console.WriteLine("[DistributedMessageQueueService.GetBroker] found " + id);
      return obj;
    }
  }

  public Producer CreateProducer(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Producer name required");
    }
    lock (_gate) {
      var id = string.Format("PRO-{0:D4}", _seq++);
      var obj = new Producer(id, name.Trim());
      obj.Validate();
      _producers[id] = obj;
      Console.WriteLine("[DistributedMessageQueueService.CreateProducer] stored " + id);
      return obj;
    }
  }

  public Producer GetProducer(string id) {
    lock (_gate) {
      if (!_producers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Producer id: " + id);
      }
      Console.WriteLine("[DistributedMessageQueueService.GetProducer] found " + id);
      return obj;
    }
  }

  public Consumer CreateConsumer(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Consumer name required");
    }
    lock (_gate) {
      var id = string.Format("CON-{0:D4}", _seq++);
      var obj = new Consumer(id, name.Trim());
      obj.Validate();
      _consumers[id] = obj;
      Console.WriteLine("[DistributedMessageQueueService.CreateConsumer] stored " + id);
      return obj;
    }
  }

  public Consumer GetConsumer(string id) {
    lock (_gate) {
      if (!_consumers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Consumer id: " + id);
      }
      Console.WriteLine("[DistributedMessageQueueService.GetConsumer] found " + id);
      return obj;
    }
  }

  public Topic CloseTopic(string id) {
    var obj = GetTopic(id);
    Console.WriteLine("[DistributedMessageQueueService.CloseTopic] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct DistributedMessageQueueService ==========");
    var system = new DistributedMessageQueueService();
    Console.WriteLine("========== STEP 2: Create Topic ==========");
    var first = system.CreateTopic("alpha-topic");
    system.CreateTopic("beta-topic");
    system.CreatePartition("sample-partition");
    system.CreateBroker("sample-broker");
    system.CreateProducer("sample-producer");
    system.CreateConsumer("sample-consumer");
    system.CloseTopic(first.Id);
    try {
      system.CloseTopic(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetTopic("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const distributedMessageQueueSolution: ProblemSolution = {
  slug: 'distributed-message-queue',
  title: 'Distributed Message Queue (Kafka-like) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a distributed, durable message queue like Apache Kafka supporting topics, partitions, consumer groups, and replay. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Producers publish messages to named topics',
      'Topics partitioned for parallel consumption',
      'Consumer groups — each message delivered to exactly one consumer per group',
      'Message retention for a configurable period (replay)',
      'At-least-once and exactly-once delivery semantics',
      'Message ordering guaranteed within a partition',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Producers publish messages to named topics?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Topics partitioned for parallel consumption?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Consumer groups — each message delivered to exactly one consumer per group?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Message retention for a configurable period (replay)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'At-least-once and exactly-once delivery semantics?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. DistributedMessageQueueService is the facade stereotype. Topic, Partition, Broker, Producer, Consumer are concrete domain classes with id/name/status and validate/close.',
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
          'Construct DistributedMessageQueueService.',
          'createTopic twice and create the related UML classes.',
          'closeTopic once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'DistributedMessageQueueService', responsibility: 'UML facade - orchestrates Distributed Message Queue (Kafka-like).', keyMembers: ['create*', 'get*', 'closeTopic'] },
    { name: 'Topic', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Partition', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Broker', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Producer', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Consumer', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from DistributedMessageQueueService to Topic, Partition, Broker, Producer, Consumer. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on DistributedMessageQueueService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'DistributedMessageQueueService', responsibility: 'UML facade - orchestrates Distributed Message Queue (Kafka-like).', keyMembers: ['create*', 'get*', 'closeTopic'] },
    { name: 'Topic', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Partition', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Broker', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Producer', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Consumer', responsibility: 'UML class - domain object for Distributed Message Queue (Kafka-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'DistributedMessageQueueService exposes create/get/close and owns composed collections.' },
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
      'main constructs DistributedMessageQueueService, creates UML domain objects, closes the primary Topic, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct DistributedMessageQueueService.',
      'createTopic for alpha and beta.',
      'create remaining UML classes.',
      'closeTopic(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createTopic("alpha..."); closeTopic(id)',
        output: '[Topic.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeTopic(alreadyClosed) or getTopic("MISSING-ID")',
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
