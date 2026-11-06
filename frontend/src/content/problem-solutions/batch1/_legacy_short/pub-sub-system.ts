import type { ProblemSolution } from '../types'
import { attr, cls, edge, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('br', 'Broker', 40, 40, [
    attr('-', 'topics', 'Map<string, Topic>'),
    attr('-', 'subscriptions', 'LinkedMap<id, Subscription>'),
    attr('-', 'dispatcher', 'Dispatcher'),
    attr('-', 'lock', 'ReentrantLock'),
  ], [
    method('+', 'Broker', 'dispatcher: Dispatcher', '', { isConstructor: true }),
    method('+', 'publish', 'topic: string, payload: any', 'Message'),
    method('+', 'subscribe', 'pattern: string, s: Subscriber', 'Subscription'),
    method('+', 'unsubscribe', 'sub: Subscription', 'bool'),
  ], 'mediator'),
  cls('tp', 'Topic', 40, 340, [
    attr('-', 'name', 'string'),
    attr('-', 'sequence', 'long'),
  ], [
    method('+', 'nextSequence', '', 'long'),
  ]),
  cls('sb', 'Subscription', 340, 340, [
    attr('-', 'id', 'string'),
    attr('-', 'pattern', 'string'),
    attr('-', 'subscriber', 'Subscriber'),
  ], []),
  cls('ms', 'Message', 640, 340, [
    attr('-', 'id', 'string'),
    attr('-', 'topic', 'string'),
    attr('-', 'payload', 'any'),
    attr('-', 'sequence', 'long'),
    attr('-', 'timestamp', 'Instant'),
  ], []),
  cls('tm', 'TopicMatcher', 640, 40, [], [
    method('+', 'matches', 'pattern, topic', 'bool', { isStatic: true }),
  ], 'utility'),
  iface('su', 'Subscriber', 360, 40, [
    method('+', 'onMessage', 'm: Message', 'void'),
  ]),
  iface('dp', 'Dispatcher', 40, 640, [
    method('+', 'dispatch', 's: Subscriber, m: Message', 'void'),
    method('+', 'release', 's: Subscriber', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('sd', 'SyncDispatcher', 380, 640, [], [
    method('+', 'dispatch', 's, m', 'void'),
  ]),
  cls('ad', 'AsyncDispatcher', 700, 640, [
    attr('-', 'mailboxes', 'Map<Subscriber, Queue+Worker>'),
  ], [
    method('+', 'dispatch', 's, m', 'void'),
    method('+', 'release', 's', 'void'),
  ]),
]

const edges = [
  edge('e1', 'br', 'tp', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e2', 'br', 'sb', 'composition', 'bottom@70', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e3', 'sb', 'su', 'association', 'top', 'bottom', { label: 'notifies', targetMultiplicity: '1' }),
  edge('e4', 'br', 'dp', 'aggregation', 'bottom@25', 'top', { label: 'delegates to' }),
  edge('e5', 'sd', 'dp', 'realization', 'left', 'right'),
  edge('e6', 'ad', 'dp', 'realization', 'top', 'bottom@85'),
  edge('e7', 'br', 'tm', 'dependency', 'right', 'left', { label: 'matches with' }),
  edge('e8', 'br', 'ms', 'dependency', 'right@80', 'top', { label: 'creates' }),
  edge('e9', 'dp', 'su', 'dependency', 'right@20', 'left@70'),
]

const py = `from __future__ import annotations
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from queue import Queue
from threading import RLock, Thread
from typing import Any, Callable, Dict, List


@dataclass(frozen=True)
class Message:
    id: str
    topic: str
    payload: Any
    sequence: int          # per-topic, strictly increasing -> lets consumers verify order
    timestamp: float


class Subscriber(ABC):
    """Observer: implement this to receive messages."""

    @abstractmethod
    def on_message(self, message: Message) -> None: ...


class CallbackSubscriber(Subscriber):
    def __init__(self, name: str, fn: Callable[[Message], None]):
        self.name, self._fn = name, fn

    def on_message(self, message: Message) -> None:
        self._fn(message)


@dataclass(frozen=True)
class Subscription:
    id: str
    pattern: str
    subscriber: Subscriber


class Topic:
    def __init__(self, name: str):
        self.name = name
        self._sequence = 0

    def next_sequence(self) -> int:
        self._sequence += 1
        return self._sequence


class TopicMatcher:
    """'*' matches exactly one segment, '#' matches zero or more trailing/inner segments."""

    @staticmethod
    def is_pattern(s: str) -> bool:
        return "*" in s or "#" in s

    @staticmethod
    def matches(pattern: str, topic: str) -> bool:
        return TopicMatcher._match(pattern.split("."), 0, topic.split("."), 0)

    @staticmethod
    def _match(p: List[str], i: int, t: List[str], j: int) -> bool:
        if i == len(p):
            return j == len(t)
        if p[i] == "#":
            return any(TopicMatcher._match(p, i + 1, t, k) for k in range(j, len(t) + 1))
        if j == len(t):
            return False
        return p[i] in ("*", t[j]) and TopicMatcher._match(p, i + 1, t, j + 1)


class Dispatcher(ABC):
    """Strategy: how a message travels from broker to subscriber."""

    @abstractmethod
    def dispatch(self, subscriber: Subscriber, message: Message) -> None: ...

    def release(self, subscriber: Subscriber) -> None:
        pass

    def close(self) -> None:
        pass


def _safe_deliver(subscriber: Subscriber, message: Message) -> None:
    try:
        subscriber.on_message(message)
    except Exception:  # one bad subscriber must never break others
        pass


class SyncDispatcher(Dispatcher):
    def dispatch(self, subscriber: Subscriber, message: Message) -> None:
        _safe_deliver(subscriber, message)


_STOP = object()


class _Mailbox:
    """One FIFO queue + one worker per subscriber => per-subscriber order is preserved."""

    def __init__(self, subscriber: Subscriber):
        self._q: Queue = Queue()
        self._t = Thread(target=self._run, args=(subscriber,), daemon=True)
        self._t.start()

    def put(self, item: Any) -> None:
        self._q.put(item)

    def join(self) -> None:
        self._t.join()

    def _run(self, subscriber: Subscriber) -> None:
        while True:
            item = self._q.get()
            if item is _STOP:
                return
            _safe_deliver(subscriber, item)


class AsyncDispatcher(Dispatcher):
    def __init__(self) -> None:
        self._boxes: Dict[int, _Mailbox] = {}
        self._lock = RLock()

    def dispatch(self, subscriber: Subscriber, message: Message) -> None:
        with self._lock:
            box = self._boxes.get(id(subscriber))
            if box is None:
                box = self._boxes[id(subscriber)] = _Mailbox(subscriber)
            box.put(message)  # non-blocking enqueue

    def release(self, subscriber: Subscriber) -> None:
        with self._lock:
            box = self._boxes.pop(id(subscriber), None)
        if box:
            box.put(_STOP)  # pending messages are still delivered first

    def close(self) -> None:
        with self._lock:
            boxes, self._boxes = list(self._boxes.values()), {}
        for b in boxes:
            b.put(_STOP)
        for b in boxes:
            b.join()


class Broker:
    """Mediator between publishers and subscribers.

    The lock makes (assign sequence -> enqueue/deliver) atomic, so every subscriber
    sees the same order per topic. It is reentrant so a sync handler may publish.
    """

    def __init__(self, dispatcher: Dispatcher | None = None):
        self._dispatcher = dispatcher or SyncDispatcher()
        self._lock = RLock()
        self._topics: Dict[str, Topic] = {}
        self._subs: Dict[str, Subscription] = {}  # insertion-ordered

    def subscribe(self, pattern: str, subscriber: Subscriber) -> Subscription:
        if not pattern or ".." in pattern:
            raise ValueError("invalid pattern")
        sub = Subscription(str(uuid.uuid4()), pattern, subscriber)
        with self._lock:
            self._subs[sub.id] = sub
        return sub

    def unsubscribe(self, subscription: Subscription) -> bool:
        with self._lock:
            if self._subs.pop(subscription.id, None) is None:
                return False
            if not any(s.subscriber is subscription.subscriber for s in self._subs.values()):
                self._dispatcher.release(subscription.subscriber)
            return True

    def publish(self, topic: str, payload: Any) -> Message:
        if not topic or TopicMatcher.is_pattern(topic):
            raise ValueError("publish needs a concrete topic name (no wildcards)")
        with self._lock:
            t = self._topics.setdefault(topic, Topic(topic))
            msg = Message(str(uuid.uuid4()), topic, payload, t.next_sequence(), time.time())
            targets: Dict[int, Subscriber] = {}  # de-duplicate overlapping subscriptions
            for s in self._subs.values():
                if TopicMatcher.matches(s.pattern, topic):
                    targets.setdefault(id(s.subscriber), s.subscriber)
            for sub in targets.values():
                self._dispatcher.dispatch(sub, msg)
        return msg

    def close(self) -> None:
        self._dispatcher.close()


def demo() -> None:
    broker = Broker(AsyncDispatcher())
    got: List[str] = []
    audit = CallbackSubscriber("audit", lambda m: got.append(f"audit:{m.topic}#{m.sequence}"))
    billing = CallbackSubscriber("billing", lambda m: got.append(f"billing:{m.topic}#{m.sequence}"))
    broker.subscribe("orders.*", audit)
    s2 = broker.subscribe("orders.created", billing)
    broker.publish("orders.created", {"id": 1})
    broker.publish("orders.cancelled", {"id": 2})
    broker.unsubscribe(s2)
    broker.publish("orders.created", {"id": 3})
    broker.close()
    print(sorted(got))


if __name__ == "__main__":
    demo()
`

const java = `import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

record Message(String id, String topic, Object payload, long sequence, Instant timestamp) {}

interface Subscriber {
  void onMessage(Message message);
}

record Subscription(String id, String pattern, Subscriber subscriber) {}

final class Topic {
  final String name;
  private long sequence;
  Topic(String name) { this.name = name; }
  long nextSequence() { return ++sequence; }
}

/** '*' = exactly one segment, '#' = zero or more segments. */
final class TopicMatcher {
  private TopicMatcher() {}
  static boolean isPattern(String s) { return s.contains("*") || s.contains("#"); }
  static boolean matches(String pattern, String topic) {
    return match(pattern.split("[.]"), 0, topic.split("[.]"), 0);
  }
  private static boolean match(String[] p, int i, String[] t, int j) {
    if (i == p.length) return j == t.length;
    if (p[i].equals("#")) {
      for (int k = j; k <= t.length; k++) if (match(p, i + 1, t, k)) return true;
      return false;
    }
    if (j == t.length) return false;
    return (p[i].equals("*") || p[i].equals(t[j])) && match(p, i + 1, t, j + 1);
  }
}

interface Dispatcher {
  void dispatch(Subscriber subscriber, Message message);
  default void release(Subscriber subscriber) {}
  default void close() {}
}

final class SyncDispatcher implements Dispatcher {
  @Override public void dispatch(Subscriber s, Message m) {
    try { s.onMessage(m); } catch (RuntimeException ignored) { /* isolate bad subscribers */ }
  }
}

/** One single-thread executor per subscriber => FIFO per subscriber, parallel across subscribers. */
final class AsyncDispatcher implements Dispatcher {
  private final Map<Subscriber, ExecutorService> mailboxes = new IdentityHashMap<>();

  @Override public synchronized void dispatch(Subscriber s, Message m) {
    mailboxes.computeIfAbsent(s, k -> Executors.newSingleThreadExecutor(r -> {
      Thread t = new Thread(r, "mailbox"); t.setDaemon(true); return t;
    })).execute(() -> {
      try { s.onMessage(m); } catch (RuntimeException ignored) { }
    });
  }

  @Override public synchronized void release(Subscriber s) {
    ExecutorService ex = mailboxes.remove(s);
    if (ex != null) ex.shutdown(); // queued messages still run
  }

  @Override public void close() {
    List<ExecutorService> all;
    synchronized (this) { all = new ArrayList<>(mailboxes.values()); mailboxes.clear(); }
    for (ExecutorService ex : all) {
      ex.shutdown();
      try { ex.awaitTermination(5, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
  }
}

final class Broker {
  private final ReentrantLock lock = new ReentrantLock(); // reentrant: sync handlers may publish
  private final Dispatcher dispatcher;
  private final Map<String, Topic> topics = new HashMap<>();
  private final Map<String, Subscription> subs = new LinkedHashMap<>();

  Broker(Dispatcher dispatcher) { this.dispatcher = dispatcher; }
  Broker() { this(new SyncDispatcher()); }

  Subscription subscribe(String pattern, Subscriber subscriber) {
    if (pattern == null || pattern.isBlank() || pattern.contains("..")) throw new IllegalArgumentException("invalid pattern");
    Subscription sub = new Subscription(UUID.randomUUID().toString(), pattern, subscriber);
    lock.lock();
    try { subs.put(sub.id(), sub); } finally { lock.unlock(); }
    return sub;
  }

  boolean unsubscribe(Subscription sub) {
    lock.lock();
    try {
      if (subs.remove(sub.id()) == null) return false;
      boolean stillUsed = subs.values().stream().anyMatch(s -> s.subscriber() == sub.subscriber());
      if (!stillUsed) dispatcher.release(sub.subscriber());
      return true;
    } finally { lock.unlock(); }
  }

  Message publish(String topic, Object payload) {
    if (topic == null || topic.isBlank() || TopicMatcher.isPattern(topic))
      throw new IllegalArgumentException("publish needs a concrete topic name");
    lock.lock();
    try {
      Topic t = topics.computeIfAbsent(topic, Topic::new);
      Message msg = new Message(UUID.randomUUID().toString(), topic, payload, t.nextSequence(), Instant.now());
      Map<Subscriber, Boolean> targets = new IdentityHashMap<>(); // de-dupe overlapping patterns
      List<Subscriber> ordered = new ArrayList<>();
      for (Subscription s : subs.values()) {
        if (TopicMatcher.matches(s.pattern(), topic) && targets.put(s.subscriber(), true) == null) {
          ordered.add(s.subscriber());
        }
      }
      for (Subscriber s : ordered) dispatcher.dispatch(s, msg);
      return msg;
    } finally { lock.unlock(); }
  }

  void close() { dispatcher.close(); }
}
`

const ts = `interface Message {
  id: string
  topic: string
  payload: unknown
  sequence: number // per topic, strictly increasing
  timestamp: number
}

interface Subscriber {
  onMessage(message: Message): void | Promise<void>
}

interface Subscription { id: string; pattern: string; subscriber: Subscriber }

class Topic {
  private seq = 0
  constructor(public readonly name: string) {}
  nextSequence() { return ++this.seq }
}

/** '*' = exactly one segment, '#' = zero or more segments. */
const TopicMatcher = {
  isPattern: (s: string) => s.includes('*') || s.includes('#'),
  matches(pattern: string, topic: string): boolean {
    const match = (i: number, p: string[], j: number, t: string[]): boolean => {
      if (i === p.length) return j === t.length
      if (p[i] === '#') {
        for (let k = j; k <= t.length; k++) if (match(i + 1, p, k, t)) return true
        return false
      }
      if (j === t.length) return false
      return (p[i] === '*' || p[i] === t[j]) && match(i + 1, p, j + 1, t)
    }
    return match(0, pattern.split('.'), 0, topic.split('.'))
  },
}

interface Dispatcher {
  dispatch(s: Subscriber, m: Message): void
  release?(s: Subscriber): void
  close?(): Promise<void>
}

class SyncDispatcher implements Dispatcher {
  dispatch(s: Subscriber, m: Message) {
    try { void s.onMessage(m) } catch { /* isolate failures */ }
  }
}

/** Promise chain per subscriber => FIFO per subscriber without blocking the publisher. */
class AsyncDispatcher implements Dispatcher {
  private tails = new Map<Subscriber, Promise<void>>()
  dispatch(s: Subscriber, m: Message) {
    const prev = this.tails.get(s) ?? Promise.resolve()
    this.tails.set(s, prev.then(() => s.onMessage(m)).catch(() => undefined))
  }
  release(s: Subscriber) { this.tails.delete(s) } // already-chained deliveries still run
  async close() { await Promise.all([...this.tails.values()]) }
}

class Broker {
  private topics = new Map<string, Topic>()
  private subs = new Map<string, Subscription>() // Map keeps insertion order
  constructor(private dispatcher: Dispatcher = new SyncDispatcher()) {}

  subscribe(pattern: string, subscriber: Subscriber): Subscription {
    if (!pattern || pattern.includes('..')) throw new Error('invalid pattern')
    const sub = { id: crypto.randomUUID(), pattern, subscriber }
    this.subs.set(sub.id, sub)
    return sub
  }

  unsubscribe(sub: Subscription): boolean {
    if (!this.subs.delete(sub.id)) return false
    const stillUsed = [...this.subs.values()].some(s => s.subscriber === sub.subscriber)
    if (!stillUsed) this.dispatcher.release?.(sub.subscriber)
    return true
  }

  publish(topic: string, payload: unknown): Message {
    if (!topic || TopicMatcher.isPattern(topic)) throw new Error('publish needs a concrete topic name')
    let t = this.topics.get(topic)
    if (!t) { t = new Topic(topic); this.topics.set(topic, t) }
    const msg: Message = { id: crypto.randomUUID(), topic, payload, sequence: t.nextSequence(), timestamp: Date.now() }
    const targets = new Set<Subscriber>() // de-dupe overlapping patterns, keeps order
    for (const s of this.subs.values()) {
      if (TopicMatcher.matches(s.pattern, topic)) targets.add(s.subscriber)
    }
    for (const s of targets) this.dispatcher.dispatch(s, msg)
    return msg
  }

  async close() { await this.dispatcher.close?.() }
}

export { Broker, SyncDispatcher, AsyncDispatcher, TopicMatcher }
export type { Message, Subscriber, Subscription, Dispatcher }
`

const cpp = `#include <atomic>
#include <chrono>
#include <condition_variable>
#include <map>
#include <memory>
#include <mutex>
#include <queue>
#include <stdexcept>
#include <string>
#include <thread>
#include <unordered_map>
#include <vector>

struct Message {
  std::string id;
  std::string topic;
  std::string payload;
  long long sequence = 0;  // per topic, strictly increasing
};

class Subscriber {
public:
  virtual ~Subscriber() = default;
  virtual void onMessage(const Message& m) = 0;
};

struct Subscription {
  std::string id;
  std::string pattern;
  std::shared_ptr<Subscriber> subscriber;
};

class Topic {
  long long seq_ = 0;
public:
  explicit Topic(std::string n) : name(std::move(n)) {}
  long long nextSequence() { return ++seq_; }
  std::string name;
};

// '*' = exactly one segment, '#' = zero or more segments
class TopicMatcher {
  static std::vector<std::string> split(const std::string& s) {
    std::vector<std::string> out; std::string cur;
    for (char c : s) { if (c == '.') { out.push_back(cur); cur.clear(); } else cur += c; }
    out.push_back(cur);
    return out;
  }
  static bool match(const std::vector<std::string>& p, size_t i, const std::vector<std::string>& t, size_t j) {
    if (i == p.size()) return j == t.size();
    if (p[i] == "#") {
      for (size_t k = j; k <= t.size(); ++k) if (match(p, i + 1, t, k)) return true;
      return false;
    }
    if (j == t.size()) return false;
    return (p[i] == "*" || p[i] == t[j]) && match(p, i + 1, t, j + 1);
  }
public:
  static bool isPattern(const std::string& s) { return s.find('*') != std::string::npos || s.find('#') != std::string::npos; }
  static bool matches(const std::string& pattern, const std::string& topic) {
    return match(split(pattern), 0, split(topic), 0);
  }
};

class Dispatcher {
public:
  virtual ~Dispatcher() = default;
  virtual void dispatch(const std::shared_ptr<Subscriber>& s, const Message& m) = 0;
  virtual void release(const std::shared_ptr<Subscriber>&) {}
  virtual void close() {}
};

class SyncDispatcher : public Dispatcher {
public:
  void dispatch(const std::shared_ptr<Subscriber>& s, const Message& m) override {
    try { s->onMessage(m); } catch (...) { /* isolate bad subscribers */ }
  }
};

// One queue + worker thread per subscriber => FIFO per subscriber.
class AsyncDispatcher : public Dispatcher {
  struct Mailbox : std::enable_shared_from_this<Mailbox> {
    std::queue<Message> q;
    std::mutex m;
    std::condition_variable cv;
    bool stop = false;

    void start(std::shared_ptr<Subscriber> s) {
      std::thread([self = shared_from_this(), s] { self->run(s); }).detach();
    }
    void push(const Message& msg) {
      { std::lock_guard<std::mutex> g(m); q.push(msg); }
      cv.notify_one();
    }
    void requestStop() {
      { std::lock_guard<std::mutex> g(m); stop = true; }
      cv.notify_one();
    }
    void run(std::shared_ptr<Subscriber> s) {
      for (;;) {
        Message msg;
        {
          std::unique_lock<std::mutex> lk(m);
          cv.wait(lk, [&] { return stop || !q.empty(); });
          if (q.empty()) return;  // stopped and fully drained
          msg = std::move(q.front()); q.pop();
        }
        try { s->onMessage(msg); } catch (...) {}
      }
    }
  };

  std::mutex mu_;
  std::unordered_map<Subscriber*, std::shared_ptr<Mailbox>> boxes_;
public:
  void dispatch(const std::shared_ptr<Subscriber>& s, const Message& m) override {
    std::lock_guard<std::mutex> g(mu_);
    auto& box = boxes_[s.get()];
    if (!box) { box = std::make_shared<Mailbox>(); box->start(s); }
    box->push(m);
  }
  void release(const std::shared_ptr<Subscriber>& s) override {
    std::lock_guard<std::mutex> g(mu_);
    auto it = boxes_.find(s.get());
    if (it != boxes_.end()) { it->second->requestStop(); boxes_.erase(it); }  // drains, then exits
  }
  void close() override {
    std::lock_guard<std::mutex> g(mu_);
    for (auto& kv : boxes_) kv.second->requestStop();
    boxes_.clear();
  }
};

class Broker {
  std::recursive_mutex mu_;  // recursive: sync handlers may publish
  std::unique_ptr<Dispatcher> dispatcher_;
  std::map<std::string, Topic> topics_;
  std::vector<Subscription> subs_;  // insertion order
  std::atomic<long long> ids_{0};
public:
  explicit Broker(std::unique_ptr<Dispatcher> d = std::make_unique<SyncDispatcher>()) : dispatcher_(std::move(d)) {}

  Subscription subscribe(const std::string& pattern, std::shared_ptr<Subscriber> s) {
    if (pattern.empty() || pattern.find("..") != std::string::npos) throw std::invalid_argument("invalid pattern");
    std::lock_guard<std::recursive_mutex> g(mu_);
    Subscription sub{"sub-" + std::to_string(++ids_), pattern, std::move(s)};
    subs_.push_back(sub);
    return sub;
  }

  bool unsubscribe(const Subscription& sub) {
    std::lock_guard<std::recursive_mutex> g(mu_);
    for (auto it = subs_.begin(); it != subs_.end(); ++it) {
      if (it->id != sub.id) continue;
      subs_.erase(it);
      for (auto& other : subs_) if (other.subscriber == sub.subscriber) return true;  // still used
      dispatcher_->release(sub.subscriber);
      return true;
    }
    return false;
  }

  Message publish(const std::string& topic, const std::string& payload) {
    if (topic.empty() || TopicMatcher::isPattern(topic)) throw std::invalid_argument("concrete topic required");
    std::lock_guard<std::recursive_mutex> g(mu_);
    auto it = topics_.try_emplace(topic, topic).first;
    Message msg{"msg-" + std::to_string(++ids_), topic, payload, it->second.nextSequence()};
    std::vector<std::shared_ptr<Subscriber>> targets;  // de-dupe overlapping patterns
    for (auto& s : subs_) {
      if (!TopicMatcher::matches(s.pattern, topic)) continue;
      bool seen = false;
      for (auto& t : targets) if (t == s.subscriber) { seen = true; break; }
      if (!seen) targets.push_back(s.subscriber);
    }
    for (auto& t : targets) dispatcher_->dispatch(t, msg);
    return msg;
  }

  void close() { dispatcher_->close(); }
};
`

const goCode = `package pubsub

import (
  "fmt"
  "strings"
  "sync"
  "time"
)

type Message struct {
  ID        string
  Topic     string
  Payload   any
  Sequence  int64 // per topic, strictly increasing
  Timestamp time.Time
}

type Subscriber interface {
  ID() string
  OnMessage(Message)
}

type FuncSubscriber struct {
  id string
  Fn func(Message)
}

func NewFuncSubscriber(id string, fn func(Message)) *FuncSubscriber { return &FuncSubscriber{id, fn} }
func (f *FuncSubscriber) ID() string                                 { return f.id }
func (f *FuncSubscriber) OnMessage(m Message)                        { f.Fn(m) }

type Subscription struct {
  ID         string
  Pattern    string
  Subscriber Subscriber
}

type Topic struct {
  Name string
  seq  int64
}

func (t *Topic) NextSequence() int64 { t.seq++; return t.seq }

// '*' = exactly one segment, '#' = zero or more segments.
func IsPattern(s string) bool { return strings.ContainsAny(s, "*#") }

func Matches(pattern, topic string) bool {
  return match(strings.Split(pattern, "."), 0, strings.Split(topic, "."), 0)
}

func match(p []string, i int, t []string, j int) bool {
  if i == len(p) {
    return j == len(t)
  }
  if p[i] == "#" {
    for k := j; k <= len(t); k++ {
      if match(p, i+1, t, k) {
        return true
      }
    }
    return false
  }
  if j == len(t) {
    return false
  }
  return (p[i] == "*" || p[i] == t[j]) && match(p, i+1, t, j+1)
}

// Dispatcher is the delivery Strategy. Do not publish re-entrantly from a SyncDispatcher handler.
type Dispatcher interface {
  Dispatch(s Subscriber, m Message)
  Release(s Subscriber)
  Close()
}

func safeDeliver(s Subscriber, m Message) {
  defer func() { _ = recover() }() // isolate bad subscribers
  s.OnMessage(m)
}

type SyncDispatcher struct{}

func (SyncDispatcher) Dispatch(s Subscriber, m Message) { safeDeliver(s, m) }
func (SyncDispatcher) Release(Subscriber)               {}
func (SyncDispatcher) Close()                           {}

// AsyncDispatcher: one buffered channel + goroutine per subscriber => FIFO per subscriber.
type AsyncDispatcher struct {
  mu    sync.Mutex
  boxes map[string]chan Message
  wg    sync.WaitGroup
}

func NewAsyncDispatcher() *AsyncDispatcher {
  return &AsyncDispatcher{boxes: map[string]chan Message{}}
}

func (a *AsyncDispatcher) Dispatch(s Subscriber, m Message) {
  a.mu.Lock()
  ch, ok := a.boxes[s.ID()]
  if !ok {
    ch = make(chan Message, 1024) // a full buffer applies backpressure to the broker
    a.boxes[s.ID()] = ch
    a.wg.Add(1)
    go func() {
      defer a.wg.Done()
      for msg := range ch {
        safeDeliver(s, msg)
      }
    }()
  }
  a.mu.Unlock()
  ch <- m
}

func (a *AsyncDispatcher) Release(s Subscriber) {
  a.mu.Lock()
  defer a.mu.Unlock()
  if ch, ok := a.boxes[s.ID()]; ok {
    close(ch) // goroutine drains remaining messages, then exits
    delete(a.boxes, s.ID())
  }
}

func (a *AsyncDispatcher) Close() {
  a.mu.Lock()
  for id, ch := range a.boxes {
    close(ch)
    delete(a.boxes, id)
  }
  a.mu.Unlock()
  a.wg.Wait()
}

type Broker struct {
  mu         sync.Mutex
  dispatcher Dispatcher
  topics     map[string]*Topic
  subs       []Subscription // insertion order
  nextID     int64
}

func NewBroker(d Dispatcher) *Broker {
  if d == nil {
    d = SyncDispatcher{}
  }
  return &Broker{dispatcher: d, topics: map[string]*Topic{}}
}

func (b *Broker) Subscribe(pattern string, s Subscriber) (Subscription, error) {
  if pattern == "" || strings.Contains(pattern, "..") {
    return Subscription{}, fmt.Errorf("invalid pattern %q", pattern)
  }
  b.mu.Lock()
  defer b.mu.Unlock()
  b.nextID++
  sub := Subscription{ID: fmt.Sprintf("sub-%d", b.nextID), Pattern: pattern, Subscriber: s}
  b.subs = append(b.subs, sub)
  return sub, nil
}

func (b *Broker) Unsubscribe(sub Subscription) bool {
  b.mu.Lock()
  defer b.mu.Unlock()
  for i, s := range b.subs {
    if s.ID != sub.ID {
      continue
    }
    b.subs = append(b.subs[:i], b.subs[i+1:]...)
    for _, other := range b.subs {
      if other.Subscriber.ID() == sub.Subscriber.ID() {
        return true // still subscribed elsewhere
      }
    }
    b.dispatcher.Release(sub.Subscriber)
    return true
  }
  return false
}

func (b *Broker) Publish(topic string, payload any) (Message, error) {
  if topic == "" || IsPattern(topic) {
    return Message{}, fmt.Errorf("publish needs a concrete topic, got %q", topic)
  }
  b.mu.Lock()
  defer b.mu.Unlock()
  t, ok := b.topics[topic]
  if !ok {
    t = &Topic{Name: topic}
    b.topics[topic] = t
  }
  b.nextID++
  msg := Message{ID: fmt.Sprintf("msg-%d", b.nextID), Topic: topic, Payload: payload, Sequence: t.NextSequence(), Timestamp: time.Now()}
  seen := map[string]bool{} // de-dupe overlapping patterns
  for _, s := range b.subs {
    if Matches(s.Pattern, topic) && !seen[s.Subscriber.ID()] {
      seen[s.Subscriber.ID()] = true
      b.dispatcher.Dispatch(s.Subscriber, msg)
    }
  }
  return msg, nil
}

func (b *Broker) Close() { b.dispatcher.Close() }
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Channels;
using System.Threading.Tasks;

public sealed record Message(string Id, string Topic, object? Payload, long Sequence, DateTime Timestamp);

public interface ISubscriber {
  void OnMessage(Message message);
}

public sealed record Subscription(string Id, string Pattern, ISubscriber Subscriber);

public sealed class Topic {
  public string Name { get; }
  long _sequence;
  public Topic(string name) { Name = name; }
  public long NextSequence() => ++_sequence;
}

// '*' = exactly one segment, '#' = zero or more segments.
public static class TopicMatcher {
  public static bool IsPattern(string s) => s.Contains('*') || s.Contains('#');
  public static bool Matches(string pattern, string topic) =>
    Match(pattern.Split('.'), 0, topic.Split('.'), 0);

  static bool Match(string[] p, int i, string[] t, int j) {
    if (i == p.Length) return j == t.Length;
    if (p[i] == "#") {
      for (int k = j; k <= t.Length; k++) if (Match(p, i + 1, t, k)) return true;
      return false;
    }
    if (j == t.Length) return false;
    return (p[i] == "*" || p[i] == t[j]) && Match(p, i + 1, t, j + 1);
  }
}

public interface IDispatcher {
  void Dispatch(ISubscriber subscriber, Message message);
  void Release(ISubscriber subscriber) {}
  void Close() {}
}

public sealed class SyncDispatcher : IDispatcher {
  public void Dispatch(ISubscriber s, Message m) {
    try { s.OnMessage(m); } catch (Exception) { /* isolate bad subscribers */ }
  }
}

// One channel + reader task per subscriber => FIFO per subscriber, parallel across subscribers.
public sealed class AsyncDispatcher : IDispatcher {
  readonly Dictionary<ISubscriber, (Channel<Message> Ch, Task Worker)> _boxes = new();
  readonly object _gate = new();

  public void Dispatch(ISubscriber s, Message m) {
    Channel<Message> ch;
    lock (_gate) {
      if (!_boxes.TryGetValue(s, out var box)) {
        var c = Channel.CreateUnbounded<Message>();
        var worker = Task.Run(async () => {
          await foreach (var msg in c.Reader.ReadAllAsync()) {
            try { s.OnMessage(msg); } catch (Exception) { }
          }
        });
        _boxes[s] = box = (c, worker);
      }
      ch = box.Ch;
    }
    ch.Writer.TryWrite(m);
  }

  public void Release(ISubscriber s) {
    lock (_gate) {
      if (_boxes.Remove(s, out var box)) box.Ch.Writer.TryComplete(); // drains then ends
    }
  }

  public void Close() {
    List<(Channel<Message> Ch, Task Worker)> all;
    lock (_gate) { all = _boxes.Values.ToList(); _boxes.Clear(); }
    foreach (var b in all) b.Ch.Writer.TryComplete();
    Task.WaitAll(all.Select(b => b.Worker).ToArray());
  }
}

public sealed class Broker {
  readonly object _gate = new(); // Monitor is reentrant: sync handlers may publish
  readonly IDispatcher _dispatcher;
  readonly Dictionary<string, Topic> _topics = new();
  readonly Dictionary<string, Subscription> _subs = new();
  readonly List<string> _order = new(); // explicit insertion order for deterministic delivery

  public Broker(IDispatcher? dispatcher = null) { _dispatcher = dispatcher ?? new SyncDispatcher(); }

  public Subscription Subscribe(string pattern, ISubscriber subscriber) {
    if (string.IsNullOrWhiteSpace(pattern) || pattern.Contains("..")) throw new ArgumentException("invalid pattern");
    var sub = new Subscription(Guid.NewGuid().ToString(), pattern, subscriber);
    lock (_gate) { _subs[sub.Id] = sub; _order.Add(sub.Id); }
    return sub;
  }

  public bool Unsubscribe(Subscription sub) {
    lock (_gate) {
      if (!_subs.Remove(sub.Id)) return false;
      _order.Remove(sub.Id);
      if (!_subs.Values.Any(s => ReferenceEquals(s.Subscriber, sub.Subscriber)))
        _dispatcher.Release(sub.Subscriber);
      return true;
    }
  }

  public Message Publish(string topic, object? payload) {
    if (string.IsNullOrWhiteSpace(topic) || TopicMatcher.IsPattern(topic))
      throw new ArgumentException("publish needs a concrete topic name");
    lock (_gate) {
      if (!_topics.TryGetValue(topic, out var t)) _topics[topic] = t = new Topic(topic);
      var msg = new Message(Guid.NewGuid().ToString(), topic, payload, t.NextSequence(), DateTime.UtcNow);
      var targets = new List<ISubscriber>(); // de-dupe overlapping patterns, keep order
      foreach (var id in _order) {
        var s = _subs[id];
        if (TopicMatcher.Matches(s.Pattern, topic) && !targets.Any(x => ReferenceEquals(x, s.Subscriber)))
          targets.Add(s.Subscriber);
      }
      foreach (var s in targets) _dispatcher.Dispatch(s, msg);
      return msg;
    }
  }

  public void Close() => _dispatcher.Close();
}
`

export const pubSubSystemSolution: ProblemSolution = {
  slug: 'pub-sub-system',
  title: 'Pub/Sub System - Solution',
  overview: {
    introduction:
      'Build an in-memory publish/subscribe broker: publishers send messages to named topics, subscribers register interest (including wildcard patterns such as orders.*), and every matching subscriber receives each message in publish order. The interview focus is the Observer/Mediator structure, wildcard matching, ordering guarantees and clean separation of delivery strategy (sync vs async) - not Kafka internals.',
    constraints: [
      'Publishers address a concrete topic; subscribers address a topic or a wildcard pattern.',
      'Every matching subscriber receives every message published after it subscribed.',
      'Per-topic publish order must be preserved for each subscriber.',
      'Subscribe and unsubscribe can happen at any time, including concurrently with publishing.',
    ],
    assumptions: [
      'In-memory, single process; no persistence, replay or acknowledgements in v1.',
      'Topics are dot-separated; * matches exactly one segment and # matches zero or more segments.',
      'A subscriber matching through several subscriptions still gets one copy of each message.',
      'A failing subscriber must not prevent delivery to others.',
      'Late subscribers do not receive history (no replay) unless the interviewer asks.',
    ],
    clarificationQuestions: [
      'Is ordering required per topic, per publisher, or globally across topics?',
      'Is delivery synchronous in the publisher’s thread, or asynchronous?',
      'What wildcard grammar do we support - one segment, multi-segment, regex?',
      'Do we need at-least-once delivery, retries or a dead-letter queue?',
      'Should a new subscriber see retained or historical messages?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Identify the three roles: publisher, broker, subscriber. The broker is the only thing publishers and subscribers know about - a Mediator that implements the Observer relationship by topic. Then ask: what can vary independently? How messages are delivered (sync/async) and how topics are matched. Make both explicit seams.',
    breakdown: [
      'Define Message (with a per-topic sequence) and the Subscriber callback interface.',
      'Model Subscription as a handle so unsubscribe is precise and idempotent.',
      'Isolate wildcard logic in TopicMatcher so the broker only asks "does this pattern match?".',
      'Make delivery a Dispatcher strategy; sync is trivial, async uses one FIFO mailbox per subscriber.',
      'Decide the ordering guarantee and where the lock sits so sequence assignment and enqueue are atomic.',
      'Handle failure isolation and subscriber de-duplication last.',
    ],
    entities: [
      { name: 'Broker', responsibility: 'Mediator: registry of subscriptions, assigns sequences, resolves recipients, hands off to the Dispatcher.' },
      { name: 'Topic', responsibility: 'Owns the monotonically increasing sequence for a topic name.' },
      { name: 'Subscriber', responsibility: 'Observer callback interface: onMessage(message).' },
      { name: 'Subscription', responsibility: 'Handle binding a pattern to a subscriber; used to unsubscribe.' },
      { name: 'Message', responsibility: 'Immutable payload with id, topic, sequence and timestamp.' },
      { name: 'TopicMatcher', responsibility: 'Pure function: does a wildcard pattern match a concrete topic?' },
      { name: 'Dispatcher', responsibility: 'Delivery strategy: Sync (inline) or Async (mailbox per subscriber).' },
    ],
    relationships: [
      'Broker composes Topics and Subscriptions (they exist only inside a broker).',
      'Subscription references one Subscriber (association).',
      'Broker aggregates a Dispatcher injected at construction.',
      'Broker depends on TopicMatcher and creates Message instances per publish.',
      'SyncDispatcher and AsyncDispatcher realize Dispatcher.',
    ],
    patternsAndOop: [
      'Observer: subscribers are notified when a topic they follow receives a message.',
      'Mediator: the broker decouples publishers from subscribers.',
      'Strategy: Dispatcher selects synchronous or asynchronous delivery.',
      'Immutability: Message and Subscription are value objects, safe to share across threads.',
      'Producer-consumer: each async mailbox is a FIFO queue drained by one worker.',
    ],
    stepByStep: [
      'Clarify ordering, wildcard grammar, delivery mode and failure expectations.',
      'Define Message, Subscriber, Subscription, Topic.',
      'Implement TopicMatcher with segment-wise recursion for * and #.',
      'Implement Broker.publish: validate → lock → sequence → collect unique recipients → dispatch.',
      'Add SyncDispatcher, then AsyncDispatcher with a mailbox per subscriber.',
      'Discuss scaling matching (trie), backpressure and persistence as extensions.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'The broker owns routing and ordering; the dispatcher owns how delivery happens; the matcher owns pattern semantics. Because ordering is guaranteed by assigning a sequence and enqueuing under one lock, and each async subscriber has its own FIFO mailbox, every subscriber observes per-topic order without a global bottleneck on slow consumers.',
    classResponsibilities: [
      { name: 'Broker', responsibility: 'Subscription registry, sequence assignment, recipient resolution, dispatcher hand-off.' },
      { name: 'Topic', responsibility: 'Per-topic sequence counter.' },
      { name: 'TopicMatcher', responsibility: 'Wildcard matching rules in one testable place.' },
      { name: 'Subscriber', responsibility: 'Consumer logic provided by the client.' },
      { name: 'Dispatcher / SyncDispatcher / AsyncDispatcher', responsibility: 'Delivery mode, failure isolation and mailbox lifecycle.' },
      { name: 'Message / Subscription', responsibility: 'Immutable data carriers.' },
    ],
    interfacesAndAbstractions: [
      'Subscriber is the Observer contract; clients never see broker internals.',
      'Dispatcher hides threading: the broker calls dispatch() and does not care if it blocks.',
      'Subscription is an opaque handle, so unsubscribe does not depend on pattern or subscriber equality.',
    ],
    relationships: [
      'Composition Broker→Topic/Subscription: lifecycle is owned by the broker.',
      'Aggregation Broker→Dispatcher: dispatcher is injected and replaceable.',
      'Association Subscription→Subscriber: many subscriptions can reference one subscriber.',
      'Dependency Broker→TopicMatcher/Message: used per call, not stored.',
    ],
    solid: [
      'SRP: matching, routing and delivery are in separate classes.',
      'OCP: add a retrying or batching dispatcher without touching Broker.',
      'LSP: any Dispatcher must deliver each message to the subscriber at most once per dispatch, in call order.',
      'ISP: Subscriber exposes one method; Dispatcher’s lifecycle hooks have defaults.',
      'DIP: Broker depends on Dispatcher and Subscriber abstractions.',
    ],
    patterns: [
      { name: 'Observer', why: 'Core relationship: topic events fan out to many independent subscribers.' },
      { name: 'Mediator', why: 'Publishers and subscribers never reference each other.' },
      { name: 'Strategy', why: 'Swap sync/async (or retrying) delivery without changing routing.' },
    ],
    decisions: [
      {
        decision: 'Assign sequence and enqueue under one (reentrant) lock.',
        rationale: 'Guarantees all subscribers see the same per-topic order even with concurrent publishers.',
        tradeoff: 'Serializes publishing; partition by topic with per-topic locks for higher throughput.',
      },
      {
        decision: 'One mailbox (queue + worker) per subscriber in async mode.',
        rationale: 'Preserves FIFO per subscriber and isolates slow consumers from fast ones.',
        tradeoff: 'One thread/task per subscriber; use a bounded pool with per-subscriber serial executors at scale.',
      },
      {
        decision: 'Linear scan of subscriptions with segment-wise matching at publish time.',
        rationale: 'Simple and obviously correct for an interview-sized system.',
        tradeoff: 'O(S × segments) per publish; replace with a topic trie when S is large.',
      },
      {
        decision: 'De-duplicate recipients per message.',
        rationale: 'A subscriber with orders.* and orders.created should not see a message twice.',
        tradeoff: 'Per-publish set allocation; alternative is to allow duplicates and let subscribers handle it.',
      },
    ],
    extensibility:
      'Retained messages and replay: store a bounded log per Topic and replay on subscribe. Acknowledgements/retries: a RetryingDispatcher decorating another Dispatcher. Filtering: subscriber-supplied Predicate<Message> on Subscription. Persistence: swap the in-memory Topic log for an append-only store while keeping the Broker API.',
  },
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    steps: [
      'subscribe(pattern, subscriber) validates the pattern, stores a Subscription and returns it.',
      'publish(topic, payload) validates a concrete topic, takes the lock, and creates/looks up the Topic.',
      'The broker assigns the next per-topic sequence and builds an immutable Message.',
      'It scans subscriptions, uses TopicMatcher, and collects each matching subscriber once.',
      'Each recipient is handed to the Dispatcher (sync call or mailbox enqueue) while still under the lock.',
      'unsubscribe removes the subscription and releases the subscriber’s mailbox if it has no other subscriptions.',
    ],
    examples: [
      {
        title: 'Wildcard fan-out',
        input: 'subscribe("orders.*", audit); subscribe("orders.created", billing); publish("orders.created", A); publish("orders.cancelled", B)',
        output: 'audit: A#1, B#1 (different topics, own sequences); billing: A#1 only',
        explanation:
          'orders.* matches one segment after orders, so audit sees both. billing’s exact pattern matches only orders.created. Sequences are per topic.',
      },
      {
        title: 'Order preserved under async delivery',
        input: 'publish("orders.created", 1), 2, 3 quickly with an AsyncDispatcher',
        output: 'Every subscriber’s handler runs with payloads 1, 2, 3 in that order',
        explanation:
          'Sequence assignment and mailbox enqueue happen under the broker lock, and each subscriber has a single FIFO worker, so order cannot be reversed even if one subscriber is slow.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you make wildcard matching faster than scanning every subscription?',
      answer:
        'Index patterns in a trie keyed by topic segments, with child edges for literals, *, and #. Publishing walks the trie along the topic, touching only relevant branches: O(segments × branching) instead of O(subscriptions).',
    },
    {
      question: 'How do you handle a slow subscriber?',
      answer:
        'In async mode its mailbox grows. Use a bounded queue and pick a policy: block the publisher (backpressure), drop oldest/newest, or disconnect the subscriber. Expose metrics for queue depth.',
    },
    {
      question: 'How do you guarantee ordering across multiple publisher threads?',
      answer:
        'Order is defined by sequence assignment under the lock. For more parallelism, shard by topic: a lock per topic keeps per-topic order while unrelated topics publish concurrently.',
    },
    {
      question: 'How would you add at-least-once delivery?',
      answer:
        'Add acknowledgements: keep each message in a per-subscriber pending list until acked, retry with backoff via a RetryingDispatcher, and move poison messages to a dead-letter topic after N attempts. Subscribers must be idempotent.',
    },
    {
      question: 'What about subscribers that join late?',
      answer:
        'Keep a bounded retained log per Topic; on subscribe(replayFrom) feed historical messages through the same mailbox before live ones, using the sequence to avoid gaps and duplicates.',
    },
    {
      question: 'Can a sync handler publish another message?',
      answer:
        'Yes in the reference code because the broker lock is reentrant (Java/Python/C++/C#). In Go the mutex is not reentrant, so use the async dispatcher or hand work off to a goroutine.',
    },
  ],
  extras: {
    edgeCases: [
      'Publishing to a topic with no subscribers (message is dropped, sequence still advances).',
      'Unsubscribing twice or with an unknown handle (returns false, no exception).',
      'A subscriber matching via overlapping patterns (delivered once).',
      'A handler that throws - other subscribers still receive the message.',
      'Wildcards in a publish topic (rejected) and empty segments such as a..b (rejected).',
    ],
    commonMistakes: [
      'Delivering to subscribers outside the lock after sequencing, which can reorder messages across threads.',
      'One shared queue and worker for all subscribers, so a slow consumer blocks everyone.',
      'Letting subscriber exceptions propagate into the publisher.',
      'Embedding wildcard parsing inside Broker, making it hard to test or change.',
      'Leaking mailbox threads after unsubscribe.',
    ],
    complexity:
      'publish is O(S × k) with S subscriptions and k topic segments (O(k × b) with a trie). subscribe/unsubscribe are O(1) average (O(S) for the still-used check). Memory is O(S + T + queued messages).',
    testing: [
      'TopicMatcher table tests: *, #, mixed, empty and mismatched segment counts.',
      'Ordering test: N publishes yield 1..N sequence at every subscriber (sync and async).',
      'Unsubscribe test: no deliveries after unsubscribe, others unaffected.',
      'Failure isolation test: a throwing subscriber does not block a healthy one.',
      'Concurrency test: multiple publishers, assert per-topic monotonic order per subscriber.',
    ],
    extensions: [
      'Topic trie index and per-topic locks.',
      'Retained messages, replay and consumer groups.',
      'Acks, retries, dead-letter topics.',
      'Message filters and priorities.',
    ],
    takeaways: [
      'Broker is a Mediator; subscribers are Observers.',
      'Make delivery a Strategy and matching a pure function.',
      'State your ordering guarantee and show where the lock enforces it.',
      'Always isolate subscriber failures.',
    ],
  },
}
