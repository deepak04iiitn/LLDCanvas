import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('pub', 'Publisher', GRID.x(0), GRID.y(0), [
    attr('-', 'name', 'String'),
    attr('-', 'broker', 'PubSubBroker'),
  ], [
    method('+', 'publish', 'topic: String, payload: String', 'Message'),
  ]),
  cls('br', 'PubSubBroker', GRID.x(1), GRID.y(0), [
    attr('-', 'exact', 'Map<String, List<Subscription>>'),
    attr('-', 'wildcards', 'List<Subscription>'),
    attr('-', 'sequences', 'Map<String, long>'),
  ], [
    method('+', 'subscribe', 'pattern: String, s: Subscriber', 'Subscription'),
    method('+', 'unsubscribe', 'sub: Subscription', 'boolean'),
    method('+', 'publish', 'topic: String, payload: String', 'Message'),
  ]),
  cls('sub', 'Subscription', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'long'),
    attr('-', 'pattern', 'String'),
    attr('-', 'subscriber', 'Subscriber'),
  ], []),
  iface('si', 'Subscriber', GRID.x(3), GRID.y(0), [
    method('+', 'onMessage', 'message: Message', 'void'),
  ]),
  cls('tm', 'TopicMatcher', GRID.x(1), GRID.y(1), [], [
    method('+', 'validateTopic', 'topic: String', 'void', { isStatic: true }),
    method('+', 'validatePattern', 'pattern: String', 'void', { isStatic: true }),
    method('+', 'isWildcard', 'pattern: String', 'boolean', { isStatic: true }),
    method('+', 'matches', 'pattern: String, topic: String', 'boolean', { isStatic: true }),
  ]),
  cls('msg', 'Message', GRID.x(2), GRID.y(1), [
    attr('-', 'topic', 'String'),
    attr('-', 'payload', 'String'),
    attr('-', 'sequence', 'long'),
    attr('-', 'timestamp', 'double'),
  ], []),
  cls('cb', 'CallbackSubscriber', GRID.x(3), GRID.y(1), [
    attr('-', 'name', 'String'),
    attr('-', 'handler', 'Function<Message>'),
  ], [
    method('+', 'onMessage', 'message: Message', 'void'),
  ]),
]

const edges = [
  edge('e1', 'pub', 'br', 'association', 'right', 'left', { label: 'publishes via' }),
  edge('e2', 'br', 'sub', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e3', 'sub', 'si', 'association', 'right', 'left', { label: 'delivers to' }),
  edge('e4', 'cb', 'si', 'realization', 'top', 'bottom'),
  edge('e5', 'br', 'tm', 'dependency', 'bottom', 'top', { label: 'matches with' }),
  edge('e6', 'br', 'msg', 'dependency', 'bottom@85', 'left', { label: 'creates' }),
]

const py = `"""Pub-Sub System — medium-level LLD interview reference (Python)."""
from __future__ import annotations
import sys
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from threading import Lock
from typing import Callable, Dict, List


@dataclass(frozen=True)

class Message:
    topic: str
    payload: str
    sequence: int          # per-topic, starts at 1 -> lets subscribers verify ordering
    timestamp: float


class Subscriber(ABC):
    @abstractmethod
    def on_message(self, message: Message) -> None:
        ...


class CallbackSubscriber(Subscriber):
    def __init__(self, name: str, handler: Callable[[Message], None]):
        self.name = name
        self._handler = handler

    def on_message(self, message: Message) -> None:
        self._handler(message)


@dataclass(frozen=True)

class Subscription:
    id: int
    pattern: str
    subscriber: Subscriber


class TopicMatcher:
    """Topics are dot-separated. A pattern segment '*' matches exactly one topic segment."""

    @staticmethod
    def validate_topic(topic: str) -> None:
        if not topic or "*" in topic or "" in topic.split("."):
            raise ValueError("Invalid topic: " + repr(topic))

    @staticmethod
    def validate_pattern(pattern: str) -> None:
        segments = pattern.split(".") if pattern else [""]
        for seg in segments:
            if seg == "" or ("*" in seg and seg != "*"):
                raise ValueError("Invalid pattern: " + repr(pattern))

    @staticmethod
    def is_wildcard(pattern: str) -> bool:
        return "*" in pattern.split(".")

    @staticmethod
    def matches(pattern: str, topic: str) -> bool:
        p, t = pattern.split("."), topic.split(".")
        return len(p) == len(t) and all(a == "*" or a == b for a, b in zip(p, t))


class PubSubBroker:
    def __init__(self) -> None:
        self._exact: Dict[str, List[Subscription]] = {}
        self._wildcards: List[Subscription] = []
        self._sequences: Dict[str, int] = {}
        self._next_id = 1
        self._lock = Lock()

    def subscribe(self, pattern: str, subscriber: Subscriber) -> Subscription:
        TopicMatcher.validate_pattern(pattern)
        with self._lock:
            sub = Subscription(self._next_id, pattern, subscriber)
            self._next_id += 1
            if TopicMatcher.is_wildcard(pattern):
                self._wildcards.append(sub)
            else:
                self._exact.setdefault(pattern, []).append(sub)
            return sub

    def unsubscribe(self, subscription: Subscription) -> bool:
        with self._lock:
            if TopicMatcher.is_wildcard(subscription.pattern):
                bucket = self._wildcards
            else:
                bucket = self._exact.get(subscription.pattern, [])
            if subscription not in bucket:
                return False
            bucket.remove(subscription)
            if not bucket and not TopicMatcher.is_wildcard(subscription.pattern):
                del self._exact[subscription.pattern]
            return True

    def publish(self, topic: str, payload: str) -> Message:
        TopicMatcher.validate_topic(topic)
        with self._lock:
            seq = self._sequences.get(topic, 0) + 1
            self._sequences[topic] = seq
            message = Message(topic, payload, seq, time.time())
            targets = list(self._exact.get(topic, []))
            targets += [s for s in self._wildcards if TopicMatcher.matches(s.pattern, topic)]
        targets.sort(key=lambda s: s.id)  # deterministic: first to subscribe is first to hear
        for sub in targets:  # delivered outside the lock so slow handlers cannot block subscribe()
            try:
                sub.subscriber.on_message(message)
            except Exception as exc:  # one bad subscriber must not break the others
                print("subscription", sub.id, "failed:", exc, file=sys.stderr)
        return message


class Publisher:
    def __init__(self, name: str, broker: PubSubBroker):
        self.name = name
        self._broker = broker

    def publish(self, topic: str, payload: str) -> Message:
        return self._broker.publish(topic, payload)


def make_printer(name: str) -> CallbackSubscriber:
    def handle(m: Message) -> None:
        print("[" + name + "] " + m.topic + "#" + str(m.sequence) + " " + m.payload)
    return CallbackSubscriber(name, handle)


def explode(_: Message) -> None:
    raise RuntimeError("boom")


if __name__ == "__main__":
    broker = PubSubBroker()
    all_orders = broker.subscribe("orders.*", make_printer("all-orders"))
    broker.subscribe("orders.created", make_printer("created-only"))
    broker.subscribe("orders.created", CallbackSubscriber("flaky", explode))
    broker.subscribe("payments.*", make_printer("payments"))

    checkout = Publisher("checkout", broker)
    checkout.publish("orders.created", "order#1")
    checkout.publish("orders.cancelled", "order#2")
    checkout.publish("payments.settled", "pay#9")

    broker.unsubscribe(all_orders)
    print("-- all-orders unsubscribed --")
    checkout.publish("orders.created", "order#3")
`

const java = `// Pub-Sub System — medium-level LLD interview reference (Java 17+)
import java.util.*;
import java.util.function.Consumer;

record Message(String topic, String payload, long sequence, double timestamp) {}

interface Subscriber {
  void onMessage(Message message);
}

class CallbackSubscriber implements Subscriber {
  final String name;
  private final Consumer<Message> handler;
  CallbackSubscriber(String name, Consumer<Message> handler) {
    this.name = name; this.handler = handler;
  }

  public void onMessage(Message m) {
    handler.accept(m);
  }
}

record Subscription(long id, String pattern, Subscriber subscriber) {}

/** Topics are dot-separated. A pattern segment "*" matches exactly one topic segment. */
final class TopicMatcher {
  private TopicMatcher() {}

  static void validateTopic(String topic) {
    if (topic == null || topic.isEmpty() || topic.contains("*") || hasEmptySegment(topic)) {
      throw new IllegalArgumentException("Invalid topic: " + topic);
    }
  }

  static void validatePattern(String pattern) {
    if (pattern == null || pattern.isEmpty() || hasEmptySegment(pattern)) {
      throw new IllegalArgumentException("Invalid pattern: " + pattern);
    }
    for (String seg : pattern.split("\\\\.", -1))
      if (seg.contains("*") && !seg.equals("*")) {
        throw new IllegalArgumentException("Invalid pattern: " + pattern);
      }
  }

  private static boolean hasEmptySegment(String s) {
    for (String seg : s.split("\\\\.", -1)) {
      if (seg.isEmpty()) {
        return true;
      }
    }
    return false;
  }

  static boolean isWildcard(String pattern) {
    return Arrays.asList(pattern.split("\\\\.", -1)).contains("*");
  }

  static boolean matches(String pattern, String topic) {
    String[] p = pattern.split("\\\\.", -1), t = topic.split("\\\\.", -1);
    if (p.length != t.length) {
      return false;
    }
    for (int i = 0; i < p.length; i++)
      if (!p[i].equals("*") && !p[i].equals(t[i])) {
        return false;
      }
    return true;
  }
}

class PubSubBroker {
  private final Map<String, List<Subscription>> exact = new HashMap<>();
  private final List<Subscription> wildcards = new ArrayList<>();
  private final Map<String, Long> sequences = new HashMap<>();
  private long nextId = 1;

  synchronized Subscription subscribe(String pattern, Subscriber subscriber) {
    TopicMatcher.validatePattern(pattern);
    Subscription sub = new Subscription(nextId++, pattern, subscriber);
    if (TopicMatcher.isWildcard(pattern)) {
      wildcards.add(sub);
    }
    else {
      exact.computeIfAbsent(pattern, k -> new ArrayList<>()).add(sub);
    }
    return sub;
  }

  synchronized boolean unsubscribe(Subscription sub) {
    if (TopicMatcher.isWildcard(sub.pattern())) {
      return wildcards.remove(sub);
    }
    List<Subscription> bucket = exact.get(sub.pattern());
    if (bucket == null || !bucket.remove(sub)) {
      return false;
    }
    if (bucket.isEmpty()) {
      exact.remove(sub.pattern());
    }
    return true;
  }

  Message publish(String topic, String payload) {
    TopicMatcher.validateTopic(topic);
    Message message;
    List<Subscription> targets = new ArrayList<>();
    synchronized (this) {
      long seq = sequences.merge(topic, 1L, Long::sum);
      message = new Message(topic, payload, seq, System.currentTimeMillis() / 1000.0);
      targets.addAll(exact.getOrDefault(topic, List.of()));
      for (Subscription s : wildcards)
        if (TopicMatcher.matches(s.pattern(), topic)) {
          targets.add(s);
        }
    }
    targets.sort(Comparator.comparingLong(Subscription::id)); // first to subscribe hears first
    for (Subscription s : targets) { // delivered outside the lock: slow handlers cannot block subscribe()
      try {
        s.subscriber().onMessage(message);
      } catch (RuntimeException e) { // one bad subscriber must not break the others
        System.err.println("subscription " + s.id() + " failed: " + e.getMessage());
      }
    }
    return message;
  }
}

class Publisher {
  final String name;
  private final PubSubBroker broker;
  Publisher(String name, PubSubBroker broker) {
    this.name = name; this.broker = broker;
  }

  Message publish(String topic, String payload) {
    return broker.publish(topic, payload);
  }
}

public class Main {
  static CallbackSubscriber printer(String name) {
    return new CallbackSubscriber(name, m ->
        System.out.println("[" + name + "] " + m.topic() + "#" + m.sequence() + " " + m.payload()));
  }

  public static void main(String[] args) {
    PubSubBroker broker = new PubSubBroker();
    Subscription allOrders = broker.subscribe("orders.*", printer("all-orders"));
    broker.subscribe("orders.created", printer("created-only"));
    broker.subscribe("orders.created", new CallbackSubscriber("flaky", m -> { throw new RuntimeException("boom"); }));
    broker.subscribe("payments.*", printer("payments"));

    Publisher checkout = new Publisher("checkout", broker);
    checkout.publish("orders.created", "order#1");
    checkout.publish("orders.cancelled", "order#2");
    checkout.publish("payments.settled", "pay#9");

    broker.unsubscribe(allOrders);
    System.out.println("-- all-orders unsubscribed --");
    checkout.publish("orders.created", "order#3");
  }
}
`

const ts = `// Pub-Sub System — medium-level LLD interview reference (TypeScript)
// Single-threaded runtime: bookkeeping is already atomic. Delivery is synchronous.

interface Message {
  readonly topic: string
  readonly payload: string
  readonly sequence: number // per-topic, starts at 1
  readonly timestamp: number
}

interface Subscriber {
  onMessage(message: Message): void
}

class CallbackSubscriber implements Subscriber {
  constructor(public readonly name: string, private handler: (m: Message) => void) {}
  onMessage(message: Message): void { this.handler(message) }
}

interface Subscription {
  readonly id: number
  readonly pattern: string
  readonly subscriber: Subscriber
}

// Topics are dot-separated. A pattern segment '*' matches exactly one topic segment.

class TopicMatcher {
  static validateTopic(topic: string): void {
    if (!topic || topic.includes('*') || topic.split('.').includes('')) {) {
      throw new Error('Invalid topic: ' + topic)
    }
    }
  }

  static validatePattern(pattern: string): void {
    const segments = pattern.split('.')
    if (!pattern || segments.some(s => s === '' || (s.includes('*') && s !== '*'))) {) {
      throw new Error('Invalid pattern: ' + pattern)
    }
    }
  }

  static isWildcard(pattern: string): boolean {
    return pattern.split('.').includes('*')
  }

  static matches(pattern: string, topic: string): boolean {
    const p = pattern.split('.')
    const t = topic.split('.')
    return p.length === t.length && p.every((seg, i) => seg === '*' || seg === t[i])
  }
}

class PubSubBroker {
  private exact = new Map<string, Subscription[]>()
  private wildcards: Subscription[] = []
  private sequences = new Map<string, number>()
  private nextId = 1

  subscribe(pattern: string, subscriber: Subscriber): Subscription {
    TopicMatcher.validatePattern(pattern)
    const sub: Subscription = { id: this.nextId++, pattern, subscriber }
    if (TopicMatcher.isWildcard(pattern)) {
      this.wildcards.push(sub)
    } else {
      const bucket = this.exact.get(pattern) ?? []
      bucket.push(sub)
      this.exact.set(pattern, bucket)
    }
    return sub
  }

  unsubscribe(sub: Subscription): boolean {
    const bucket = TopicMatcher.isWildcard(sub.pattern) ? this.wildcards : this.exact.get(sub.pattern)
    if (!bucket) {
      return false
    }
    const i = bucket.indexOf(sub)
    if (i < 0) {
      return false
    }
    bucket.splice(i, 1)
    if (bucket.length === 0 && !TopicMatcher.isWildcard(sub.pattern)) {
      this.exact.delete(sub.pattern)
    }
    return true
  }

  publish(topic: string, payload: string): Message {
    TopicMatcher.validateTopic(topic)
    const sequence = (this.sequences.get(topic) ?? 0) + 1
    this.sequences.set(topic, sequence)
    const message: Message = { topic, payload, sequence, timestamp: Date.now() / 1000 }

    const targets = [
      ...(this.exact.get(topic) ?? []),
      ...this.wildcards.filter(s => TopicMatcher.matches(s.pattern, topic)),
    ].sort((a, b) => a.id - b.id) // first to subscribe hears first

    for (const sub of targets) {
      try {
        sub.subscriber.onMessage(message)
      } catch (err) { // one bad subscriber must not break the others
        console.error('subscription ' + sub.id + ' failed:', err)
      }
    }
    return message
  }
}

class Publisher {
  constructor(public readonly name: string, private broker: PubSubBroker) {}
  publish(topic: string, payload: string): Message { return this.broker.publish(topic, payload) }
}

// Demo
const printer = (name: string) =>
  new CallbackSubscriber(name, m => console.log('[' + name + '] ' + m.topic + '#' + m.sequence + ' ' + m.payload))

const broker = new PubSubBroker()
const allOrders = broker.subscribe('orders.*', printer('all-orders'))
broker.subscribe('orders.created', printer('created-only'))
broker.subscribe('orders.created', new CallbackSubscriber('flaky', () => { throw new Error('boom') }))
broker.subscribe('payments.*', printer('payments'))

const checkout = new Publisher('checkout', broker)
checkout.publish('orders.created', 'order#1')
checkout.publish('orders.cancelled', 'order#2')
checkout.publish('payments.settled', 'pay#9')

broker.unsubscribe(allOrders)
console.log('-- all-orders unsubscribed --')
checkout.publish('orders.created', 'order#3')

export { PubSubBroker, Publisher, CallbackSubscriber, TopicMatcher }
export type { Message, Subscriber, Subscription }
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

// Pub-Sub System — medium-level LLD interview reference (C++17)

struct Message {
  string topic;
  string payload;
  long sequence;     // per-topic, starts at 1
  double timestamp;
};

class Subscriber {
public:
  virtual ~Subscriber() = default;
  virtual void onMessage(const Message& message) = 0;
};

class CallbackSubscriber : public Subscriber {
  function<void(const Message&)> handler_;
public:
  string name;
  CallbackSubscriber(string n, function<void(const Message&)> h)
      : handler_(move(h)), name(move(n)) {}
  void onMessage(const Message& m) override {
    handler_(m);
  }
};

struct Subscription {
  long id;
  string pattern;
  shared_ptr<Subscriber> subscriber;
};

// Topics are dot-separated. A pattern segment "*" matches exactly one topic segment.

struct TopicMatcher {
  static vector<string> split(const string& s) {
    vector<string> parts;
    stringstream ss(s);
    string seg;
    while (getline(ss, seg, '.')) {
      parts.push_back(seg);
    }
    if (!s.empty() && s.back() == '.') {
      parts.push_back("");) {
    }
      return parts;
    }
  }

  static void validateTopic(const string& topic) {
    if (topic.empty() || topic.find('*') != string::npos) {
      throw invalid_argument("Invalid topic: " + topic);
    }
    for (auto& seg : split(topic))
      if (seg.empty()) {
        throw invalid_argument("Invalid topic: " + topic);
      }
  }

  static void validatePattern(const string& pattern) {
    if (pattern.empty()) {
      throw invalid_argument("Invalid pattern");
    }
    for (auto& seg : split(pattern))
      if (seg.empty() || (seg.find('*') != string::npos && seg != "*")) {
        throw invalid_argument("Invalid pattern: " + pattern);
      }
  }

  static bool isWildcard(const string& pattern) {
    for (auto& seg : split(pattern)) {
      if (seg == "*") {
        return true;
      }
    }
    return false;
  }

  static bool matches(const string& pattern, const string& topic) {
    auto p = split(pattern), t = split(topic);
    if (p.size() {
      != t.size()) return false;
    }
    for (size_t i = 0; i < p.size(); i++)
      if (p[i] != "*" && p[i] != t[i]) {
        return false;
      }
    return true;
  }
};

class PubSubBroker {
  unordered_map<string, vector<Subscription>> exact_;
  vector<Subscription> wildcards_;
  unordered_map<string, long> sequences_;
  long nextId_ = 1;
  mutex mu_;
public:
  Subscription subscribe(const string& pattern, shared_ptr<Subscriber> subscriber) {
    TopicMatcher::validatePattern(pattern);
    lock_guard<mutex> lock(mu_);
    Subscription sub{nextId_++, pattern, move(subscriber)};
    if (TopicMatcher::isWildcard(pattern)) {
      wildcards_.push_back(sub);
    }
    else {
      exact_[pattern].push_back(sub);
    }
    return sub;
  }

  bool unsubscribe(const Subscription& sub) {
    lock_guard<mutex> lock(mu_);
    auto sameId = [&](const Subscription& s) {
      return s.id == sub.id;
    }
    if (TopicMatcher::isWildcard(sub.pattern)) {
      auto it = remove_if(wildcards_.begin(), wildcards_.end(), sameId);
      bool found = it != wildcards_.end();
      wildcards_.erase(it, wildcards_.end());
      return found;
    }

    auto bucketIt = exact_.find(sub.pattern);
    if (bucketIt == exact_.end()) {
      return false;
    }
    auto& bucket = bucketIt->second;
    auto it = remove_if(bucket.begin(), bucket.end(), sameId);
    bool found = it != bucket.end();
    bucket.erase(it, bucket.end());
    if (bucket.empty()) {
      exact_.erase(bucketIt);
    }
    return found;
  }

  Message publish(const string& topic, const string& payload) {
    TopicMatcher::validateTopic(topic);
    Message message;
    vector<Subscription> targets;
    {
      lock_guard<mutex> lock(mu_);
      long seq = ++sequences_[topic];
      double now = chrono::duration<double>(
          chrono::system_clock::now().time_since_epoch()).count();
      message = Message{topic, payload, seq, now};
      auto it = exact_.find(topic);
      if (it != exact_.end()) {
        targets = it->second;
      }
      for (auto& s : wildcards_)
        if (TopicMatcher::matches(s.pattern, topic)) {
          targets.push_back(s);
        }
    }
    sort(targets.begin(), targets.end(),
              [](const Subscription& a, const Subscription& b) { return a.id < b.id; });
    for (auto& s : targets) {  // delivered outside the lock: slow handlers cannot block subscribe()
      try {
        s.subscriber->onMessage(message);
      } catch (const exception& e) {  // one bad subscriber must not break the others
        cerr << "subscription " << s.id << " failed: " << e.what() << endl;
      }
    }
    return message;
  }
};

class Publisher {
  string name_;
  PubSubBroker& broker_;
public:
  Publisher(string name, PubSubBroker& broker) : name_(move(name)), broker_(broker) {}
  Message publish(const string& topic, const string& payload) {
    return broker_.publish(topic, payload);
  }
};

shared_ptr<Subscriber> printer(const string& name) {
  return make_shared<CallbackSubscriber>(name, [name](const Message& m) {
    cout << "[" << name << "] " << m.topic << "#" << m.sequence << " " << m.payload << endl;
  });
}

int main() {
  PubSubBroker broker;
  Subscription allOrders = broker.subscribe("orders.*", printer("all-orders"));
  broker.subscribe("orders.created", printer("created-only"));
  broker.subscribe("orders.created", make_shared<CallbackSubscriber>(
      "flaky", [](const Message&) { throw runtime_error("boom"); }));
  broker.subscribe("payments.*", printer("payments"));

  Publisher checkout("checkout", broker);
  checkout.publish("orders.created", "order#1");
  checkout.publish("orders.cancelled", "order#2");
  checkout.publish("payments.settled", "pay#9");

  broker.unsubscribe(allOrders);
  cout << "-- all-orders unsubscribed --" << endl;
  checkout.publish("orders.created", "order#3");
}
`

const goCode = `// Pub-Sub System — medium-level LLD interview reference (Go)
package main

import (
  "errors"
  "fmt"
  "sort"
  "strings"
  "sync"
  "time"
)

type Message struct {
  Topic     string
  Payload   string
  Sequence  int64 // per-topic, starts at 1
  Timestamp float64
}

type Subscriber interface {
  OnMessage(m Message)
}

type CallbackSubscriber struct {
  Name    string
  Handler func(Message)
}

func (c *CallbackSubscriber) OnMessage(m Message) {
  c.Handler(m)
}

type Subscription struct {
  ID         int64
  Pattern    string
  Subscriber Subscriber
}

// Topics are dot-separated. A pattern segment "*" matches exactly one topic segment.
func hasEmptySegment(s string) bool {
  for _, seg := range strings.Split(s, ".") {
    if seg == "" {
      return true
    }
  }
  return false
}

func validateTopic(topic string) error {
  if topic == "" || strings.Contains(topic, "*") || hasEmptySegment(topic) {
    return errors.New("invalid topic: " + topic)
  }
  return nil
}

func validatePattern(pattern string) error {
  if pattern == "" || hasEmptySegment(pattern) {
    return errors.New("invalid pattern: " + pattern)
  }
  for _, seg := range strings.Split(pattern, ".") {
    if strings.Contains(seg, "*") && seg != "*" {
      return errors.New("invalid pattern: " + pattern)
    }
  }
  return nil
}

func isWildcard(pattern string) bool {
  for _, seg := range strings.Split(pattern, ".") {
    if seg == "*" {
      return true
    }
  }
  return false
}

func matches(pattern, topic string) bool {
  p, t := strings.Split(pattern, "."), strings.Split(topic, ".")
  if len(p) != len(t) {
    return false
  }
  for i := range p {
    if p[i] != "*" && p[i] != t[i] {
      return false
    }
  }
  return true
}

type PubSubBroker struct {
  mu        sync.Mutex
  exact     map[string][]Subscription
  wildcards []Subscription
  sequences map[string]int64
  nextID    int64
}

func NewBroker() *PubSubBroker {
  return &PubSubBroker{exact: map[string][]Subscription{}, sequences: map[string]int64{}, nextID: 1}
}

func (b *PubSubBroker) Subscribe(pattern string, s Subscriber) (Subscription, error) {
  if err := validatePattern(pattern); err != nil {
    return Subscription{}, err
  }
  b.mu.Lock()
  defer b.mu.Unlock()
  sub := Subscription{ID: b.nextID, Pattern: pattern, Subscriber: s}
  b.nextID++
  if isWildcard(pattern) {
    b.wildcards = append(b.wildcards, sub)
  } else {
    b.exact[pattern] = append(b.exact[pattern], sub)
  }
  return sub, nil
}

func removeByID(list []Subscription, id int64) ([]Subscription, bool) {
  for i, s := range list {
    if s.ID == id {
      return append(list[:i:i], list[i+1:]...), true
    }
  }
  return list, false
}

func (b *PubSubBroker) Unsubscribe(sub Subscription) bool {
  b.mu.Lock()
  defer b.mu.Unlock()
  if isWildcard(sub.Pattern) {
    var ok bool
    b.wildcards, ok = removeByID(b.wildcards, sub.ID)
    return ok
  }
  bucket, ok := removeByID(b.exact[sub.Pattern], sub.ID)
  if !ok {
    return false
  }
  if len(bucket) == 0 {
    delete(b.exact, sub.Pattern)
  } else {
    b.exact[sub.Pattern] = bucket
  }
  return true
}

func (b *PubSubBroker) Publish(topic, payload string) (Message, error) {
  if err := validateTopic(topic); err != nil {
    return Message{}, err
  }
  b.mu.Lock()
  b.sequences[topic]++
  msg := Message{topic, payload, b.sequences[topic], float64(time.Now().UnixNano()) / 1e9}
  targets := append([]Subscription{}, b.exact[topic]...)
  for _, s := range b.wildcards {
    if matches(s.Pattern, topic) {
      targets = append(targets, s)
    }
  }
  b.mu.Unlock()

  sort.Slice(targets, func(i, j int) bool { return targets[i].ID < targets[j].ID })
  for _, s := range targets { // delivered outside the lock: slow handlers cannot block Subscribe
    deliver(s, msg)
  }
  return msg, nil
}

func deliver(s Subscription, m Message) {
  defer func() { // one bad subscriber must not break the others
    if r := recover(); r != nil {
      fmt.Println("subscription", s.ID, "failed:", r)
    }
  }()
  s.Subscriber.OnMessage(m)
}

type Publisher struct {
  Name   string
  broker *PubSubBroker
}

func (p *Publisher) Publish(topic, payload string) (Message, error) {
  return p.broker.Publish(topic, payload)
}

func printer(name string) Subscriber {
  return &CallbackSubscriber{Name: name, Handler: func(m Message) {
    fmt.Printf("[%s] %s#%d %s\\n", name, m.Topic, m.Sequence, m.Payload)
  }}
}

func main() {
  broker := NewBroker()
  allOrders, _ := broker.Subscribe("orders.*", printer("all-orders"))
  broker.Subscribe("orders.created", printer("created-only"))
  broker.Subscribe("orders.created", &CallbackSubscriber{Name: "flaky", Handler: func(Message) { panic("boom") }})
  broker.Subscribe("payments.*", printer("payments"))

  checkout := &Publisher{Name: "checkout", broker: broker}
  checkout.Publish("orders.created", "order#1")
  checkout.Publish("orders.cancelled", "order#2")
  checkout.Publish("payments.settled", "pay#9")

  broker.Unsubscribe(allOrders)
  fmt.Println("-- all-orders unsubscribed --")
  checkout.Publish("orders.created", "order#3")
}
`

const csharp = `// Pub-Sub System — medium-level LLD interview reference (C# 10+)
using System;
using System.Collections.Generic;
using System.Linq;

public sealed record Message(string Topic, string Payload, long Sequence, double Timestamp);

public interface ISubscriber {
  void OnMessage(Message message);
}

public sealed class CallbackSubscriber : ISubscriber {
  public string Name { get; }
  private readonly Action<Message> _handler;
  public CallbackSubscriber(string name, Action<Message> handler) {
    Name = name; _handler = handler;
  }

  public void OnMessage(Message message) {
    return _handler(message);
  }
}

public sealed record Subscription(long Id, string Pattern, ISubscriber Subscriber);

// Topics are dot-separated. A pattern segment "*" matches exactly one topic segment.
public static class TopicMatcher {
  public static void ValidateTopic(string topic) {
    if (string.IsNullOrEmpty(topic) || topic.Contains('*') || topic.Split('.').Any(s => s.Length == 0)) {
      throw new ArgumentException("Invalid topic: " + topic);
    }
  }

  public static void ValidatePattern(string pattern) {
    if (string.IsNullOrEmpty(pattern) ||) {
      pattern.Split('.').Any(s => s.Length == 0 || (s.Contains('*') && s != "*")))
    }

      throw new ArgumentException("Invalid pattern: " + pattern);
  }

  public static bool IsWildcard(string pattern) {
    return pattern.Split('.').Contains("*");
  }

  public static bool Matches(string pattern, string topic) {
    var p = pattern.Split('.');
    var t = topic.Split('.');
    return p.Length == t.Length && p.Zip(t, (a, b) {
      return a == "*" || a == b).All(ok => ok);
    }
  }
}

public sealed class PubSubBroker {
  private readonly Dictionary<string, List<Subscription>> _exact = new();
  private readonly List<Subscription> _wildcards = new();
  private readonly Dictionary<string, long> _sequences = new();
  private long _nextId = 1;
  private readonly object _gate = new();

  public Subscription Subscribe(string pattern, ISubscriber subscriber) {
    TopicMatcher.ValidatePattern(pattern);
    lock (_gate) {
      var sub = new Subscription(_nextId++, pattern, subscriber);
      if (TopicMatcher.IsWildcard(pattern)) {
        _wildcards.Add(sub);
      }
      else {
        if (!_exact.TryGetValue(pattern, out var bucket)) {
          _exact[pattern] = bucket = new List<Subscription>();
        }
        bucket.Add(sub);
      }
      return sub;
    }
  }

  public bool Unsubscribe(Subscription sub) {
    lock (_gate) {
      if (TopicMatcher.IsWildcard(sub.Pattern)) {
        return _wildcards.Remove(sub);
      }
      if (!_exact.TryGetValue(sub.Pattern, out var bucket) || !bucket.Remove(sub)) {
        return false;
      }
      if (bucket.Count == 0) {
        _exact.Remove(sub.Pattern);
      }
      return true;
    }
  }

  public Message Publish(string topic, string payload) {
    TopicMatcher.ValidateTopic(topic);
    Message message;
    List<Subscription> targets;
    lock (_gate) {
      _sequences.TryGetValue(topic, out var last);
      long seq = last + 1;
      _sequences[topic] = seq;
      double now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / 1000.0;
      message = new Message(topic, payload, seq, now);
      targets = new List<Subscription>(_exact.GetValueOrDefault(topic) ?? new List<Subscription>());
      targets.AddRange(_wildcards.Where(s => TopicMatcher.Matches(s.Pattern, topic)));
    }
    targets.Sort((a, b) => a.Id.CompareTo(b.Id)); // first to subscribe hears first
    foreach (var s in targets) { // delivered outside the lock: slow handlers cannot block Subscribe
      try {
        s.Subscriber.OnMessage(message);
      } catch (Exception e) { // one bad subscriber must not break the others
        Console.Error.WriteLine("subscription " + s.Id + " failed: " + e.Message);
      }
    }
    return message;
  }
}

public sealed class Publisher {
  public string Name { get; }
  private readonly PubSubBroker _broker;
  public Publisher(string name, PubSubBroker broker) {
    Name = name; _broker = broker;
  }

  public Message Publish(string topic, string payload) {
    return _broker.Publish(topic, payload);
  }
}

public static class Program {
  static CallbackSubscriber Printer(string name) => new(name, m =>
    Console.WriteLine("[" + name + "] " + m.Topic + "#" + m.Sequence + " " + m.Payload));

  public static void Main() {
    var broker = new PubSubBroker();
    var allOrders = broker.Subscribe("orders.*", Printer("all-orders"));
    broker.Subscribe("orders.created", Printer("created-only"));
    broker.Subscribe("orders.created", new CallbackSubscriber("flaky", _ => throw new InvalidOperationException("boom")));
    broker.Subscribe("payments.*", Printer("payments"));

    var checkout = new Publisher("checkout", broker);
    checkout.Publish("orders.created", "order#1");
    checkout.Publish("orders.cancelled", "order#2");
    checkout.Publish("payments.settled", "pay#9");

    broker.Unsubscribe(allOrders);
    Console.WriteLine("-- all-orders unsubscribed --");
    checkout.Publish("orders.created", "order#3");
  }
}
`

export const pubSubSystemSolution: ProblemSolution = {
  slug: 'pub-sub-system',
  title: 'Design a Pub-Sub Messaging System — Complete LLD Guide',
  overview: {
    introduction: [
      'Publish-subscribe is the idea behind every event bus, notification fan-out, and message broker: publishers announce that something happened on a named topic, and any number of subscribers who care about that topic hear about it — without publishers and subscribers ever knowing about each other. In an interview, the prompt “design an in-memory pub-sub system” is the Observer pattern wearing a systems-design hat.',
      'The question looks small, but it hides several real decisions. How do subscribers describe what they want — exact topic names, or patterns like orders.*? Is delivery synchronous or asynchronous? What happens when one subscriber throws? What does “in order” actually promise when several threads publish at once? A candidate who raises these questions and answers them with a clear, small design stands out from one who immediately starts talking about Kafka partitions.',
      'In this tutorial we walk the problem the way you would in the room. We clarify scope, pull out the nouns (topic, message, publisher, subscriber, subscription, broker), recognize that the broker is a mediator sitting between two families of objects, and design a topic matcher for wildcard subscriptions. Then we draw the UML and implement a medium-level broker in six languages, with a demo that includes wildcard routing, unsubscribe, and a deliberately crashing subscriber.',
      'We stick to the practice brief: publishers send to named topics, subscribers register interest in one or more topics, every active subscriber of a topic receives every message in publish order, subscribe/unsubscribe works at any time, wildcard topic subscriptions like orders.* are supported, and the whole thing is thread-safe. We keep delivery synchronous in the publishing thread and discuss asynchronous mailboxes as the natural next step.',
    ],
    constraints: [
      'Publishers send string messages to named topics; topics are created implicitly on first use.',
      'A subscriber can hold several subscriptions, each with an exact topic or a wildcard pattern.',
      'Every active subscription whose pattern matches receives every message, and messages on one topic carry a per-topic sequence number.',
      'Subscribe and unsubscribe are allowed at any time, including while messages are flowing.',
      'Publish and subscribe must be thread-safe; one failing subscriber must not affect the others.',
    ],
    assumptions: [
      'Topics are dot-separated segments such as orders.created. A * segment in a pattern matches exactly one segment, so orders.* matches orders.created but not orders.created.eu.',
      'Delivery is synchronous: publish returns after all matching subscribers have been called. This keeps ordering obvious; we discuss async mailboxes as a follow-up.',
      'Messages are not persisted or replayed; a subscriber only sees messages published after it subscribed (at-most-once, in-memory).',
      'If one client holds two matching subscriptions (for example exact and wildcard), it is called once per subscription.',
      'Payload is a string to keep the focus on the structure; real systems would use bytes or a generic type.',
    ],
    clarificationQuestions: [
      {
        question: 'Do we need wildcard subscriptions, and what syntax?',
        why: 'Wildcards change the data structure: exact topics can be hash-looked-up, patterns need a match step. Agree on a minimal syntax (single-segment *) so you do not accidentally design a regex engine.',
      },
      {
        question: 'Should delivery be synchronous or asynchronous?',
        why: 'Synchronous is simple and ordered but lets a slow subscriber block the publisher. Asynchronous needs queues and workers. State your default and mention the upgrade path.',
      },
      {
        question: 'What does “in order” mean — per topic, per publisher, or global?',
        why: 'Global ordering is expensive. Per-topic ordering is what most systems promise, and it maps neatly onto a per-topic sequence number.',
      },
      {
        question: 'What should happen if a subscriber throws or is slow?',
        why: 'Isolation is the correct answer: catch, log, continue. It shows you think about failure rather than the happy path.',
      },
      {
        question: 'Do late subscribers need history or replay?',
        why: 'If yes, you need a log per topic and offsets — a different design. Clarify early that this is a live, in-memory bus.',
      },
      {
        question: 'Is delivery guaranteed (at-least-once) or best effort?',
        why: 'Guarantees imply acknowledgements and retries. For an in-memory LLD version best effort is acceptable; saying it explicitly shows maturity.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'The first two minutes: restate and list the verbs',
        paragraphs: [
          'Restate the problem: “Publishers send messages to named topics; subscribers register interest, possibly with wildcards, and receive every matching message in order.” Then list the verbs: publish, subscribe, unsubscribe, deliver, match. Publish, subscribe, and unsubscribe will be the public API of the broker. Deliver and match are internal responsibilities you will place carefully.',
          'Ask the clarification questions and write the answers down. The sync-versus-async and ordering answers define your design more than any class diagram does. If the interviewer says “keep it simple”, you have permission for synchronous delivery with per-topic sequence numbers, which is exactly what we build.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Say out loud: “Publishers and subscribers should never reference each other — the broker is the only meeting point.” That is the one sentence the question is testing.',
        },
      },
      {
        heading: 'Recognizing the pattern: Observer through a mediator',
        paragraphs: [
          'The textbook Observer has a subject that holds a list of observers and notifies them directly. Here there are many subjects (topics) and publishers should not even know the subject object exists. So we put a mediator in the middle: the PubSubBroker owns the registry of who is interested in what, and publishers only talk to the broker.',
          'This matters because it removes coupling in both directions. A publisher can be written without knowing how many subscribers exist, and a subscriber can be added without touching any publisher. The broker is where ordering, locking, and failure isolation are enforced in one place.',
        ],
      },
      {
        heading: 'From requirements to nouns',
        paragraphs: [
          'Underline the nouns: publisher, subscriber, topic, message, subscription, wildcard. A Message is a small immutable value: topic, payload, a per-topic sequence number, and a timestamp. A Subscriber is a role — anything that can receive a message — so it is an interface with one method. A Subscription is the handle that links a pattern to a subscriber and lets the caller unsubscribe later.',
          'A Topic could be a class, but in this design it would only hold a name and a counter. Making it a first-class object invites a half-empty class. Instead the broker keeps a map from topic name to subscriptions and a map from topic name to the next sequence number. Say that decision out loud: it shows you resisted a noun for its own sake.',
        ],
        numbered: [
          'Define Message (immutable) and Subscriber (one method).',
          'Define Subscription as the registration handle.',
          'Put registry, ordering, and locking in PubSubBroker.',
          'Put pattern rules in TopicMatcher so they are testable alone.',
          'Add Publisher as a thin convenience wrapper over the broker.',
        ],
      },
      {
        heading: 'Wildcards: split the problem in two',
        paragraphs: [
          'Exact topics are fast: a hash map from topic name to list of subscriptions gives O(1) lookup. Wildcard patterns cannot be hashed by topic, so we keep them in a separate list and test each pattern against the published topic. With 1,000 subscribers per topic and mostly exact subscriptions, the common path stays fast; only wildcard subscriptions pay for matching.',
          'The matching rule is deliberately tiny: split both strings on dot, require the same segment count, and let * match any single segment. That is a few lines in every language, easy to test, and easy to explain. Extending to a multi-segment wildcard (like # or >) is a follow-up, not a requirement.',
        ],
      },
      {
        heading: 'Ordering, concurrency, and failure',
        paragraphs: [
          'Inside publish we take the broker lock for the shortest possible moment to do three things: bump the topic’s sequence number, build the immutable Message, and snapshot the list of matching subscriptions. Then we release the lock and deliver. Delivering outside the lock avoids a classic deadlock — a subscriber that calls publish or subscribe from its handler — and ensures slow handlers cannot block other threads from subscribing.',
          'The snapshot also gives a clean semantic for unsubscribe: it takes effect for the next publish. Failure isolation is a try/catch around each handler call; a throwing subscriber is logged and skipped while the rest still receive the message. The honest limitation is that two threads publishing to the same topic at once can interleave deliveries, even though sequence numbers show the true order. Strict per-subscriber ordering requires a queue per subscriber, which is our async follow-up.',
        ],
        callout: {
          title: 'What “medium level” means here',
          body: 'Exact-topic index plus wildcard list, per-topic sequence numbers, snapshot-then-deliver outside the lock, isolated failures, a runnable demo. No thread pools, no persistence, no acknowledgements — but each is easy to bolt on and you should say how.',
        },
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw PubSubBroker in the center. To its left, Publisher with an association to the broker. To its right, Subscription composed by the broker, pointing to the Subscriber interface. Below the interface, a concrete CallbackSubscriber. Below the broker, TopicMatcher and Message. Narrate one publish from left to right.',
        ],
        numbered: [
          'Clarify wildcard syntax, delivery mode, and ordering scope.',
          'Define Message, Subscriber, Subscription.',
          'Implement exact-topic subscribe, publish, and unsubscribe first.',
          'Add TopicMatcher and the wildcard list.',
          'Add failure isolation and sequence numbers.',
          'Discuss async delivery and persistence only after the sync version works.',
        ],
      },
    ],
    entities: [
      { name: 'PubSubBroker', responsibility: 'Mediator: registry of subscriptions, sequence numbers, locking, delivery.', keyMembers: ['subscribe', 'unsubscribe', 'publish'] },
      { name: 'Publisher', responsibility: 'Thin sender that only knows the broker.', keyMembers: ['publish'] },
      { name: 'Subscriber', responsibility: 'Role interface for anything that can receive a message.', keyMembers: ['onMessage'] },
      { name: 'Subscription', responsibility: 'Registration handle: id, pattern, subscriber.', keyMembers: ['id', 'pattern'] },
      { name: 'Message', responsibility: 'Immutable payload with topic, sequence, and timestamp.', keyMembers: ['topic', 'sequence'] },
      { name: 'TopicMatcher', responsibility: 'Validates topics and patterns; single-segment wildcard matching.', keyMembers: ['matches', 'isWildcard'] },
      { name: 'CallbackSubscriber', responsibility: 'Concrete subscriber that wraps a function.', keyMembers: ['handler'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Left to right: Publisher → PubSubBroker → Subscription → Subscriber, the path a message conceptually travels in reverse. Below the broker sit TopicMatcher (pattern rules) and Message (what gets created per publish); CallbackSubscriber realizes the Subscriber interface. Wide spacing keeps the composition and realization edges readable.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Think of the broker as a post office with sorting rules. Publishers drop messages addressed to a topic; subscribers have filed forwarding instructions (subscriptions) that say “send me everything addressed to this topic or pattern”. The post office stamps each message with a per-topic sequence number, works out the forwarding list while holding a short lock, and then hands copies to each subscriber outside the lock. Nobody on either side needs to know the other exists.',
        ],
      },
      {
        heading: 'Why Subscription is its own object',
        paragraphs: [
          'Unsubscribe needs an identity. If subscribe returned nothing, the caller would unsubscribe by passing the subscriber and pattern, which becomes ambiguous the moment the same subscriber has two matching subscriptions. A Subscription with a unique id solves this cleanly: unsubscribe removes exactly that registration.',
          'The id also gives deterministic delivery order. After collecting exact and wildcard matches, the broker sorts by id so the first subscriber to register is the first to be called, regardless of whether it used an exact or wildcard pattern.',
        ],
      },
      {
        heading: 'Why TopicMatcher is separate',
        paragraphs: [
          'Pattern rules change independently of broker mechanics. Today * means one segment; tomorrow someone asks for a multi-segment wildcard. Keeping validate and matches in a small static helper lets you change syntax without touching locking or delivery, and lets you unit test patterns with no broker at all.',
        ],
      },
      {
        heading: 'Publish as a three-step conversation',
        paragraphs: [
          'Step one, under the lock: increment the sequence for this topic, create the Message, and collect exact matches plus matching wildcard subscriptions. Step two, outside the lock: sort the snapshot by subscription id. Step three, still outside the lock: call each subscriber inside a try/catch. The broker returns the Message so the publisher can log the sequence number.',
          'The lock is held for O(matching subscribers) work only — never during user code. That one rule prevents both deadlocks and head-of-line blocking.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not create a Topic class, queue messages per subscriber, retry failed deliveries, persist messages, or add acknowledgements. Each of those is a genuine feature of production brokers, and each can be layered on without changing the public API: a per-subscriber mailbox sits inside the delivery step, and a log of messages sits next to the sequence counter.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'PubSubBroker', responsibility: 'Owns the registry; stamps sequence numbers; snapshots and delivers.', keyMembers: ['subscribe', 'unsubscribe', 'publish'] },
      { name: 'TopicMatcher', responsibility: 'Syntax validation and single-segment wildcard matching.', keyMembers: ['matches'] },
      { name: 'Subscription', responsibility: 'Immutable registration with a unique id.', keyMembers: ['id', 'pattern'] },
      { name: 'Subscriber / CallbackSubscriber', responsibility: 'Receive messages; callback wraps a function.', keyMembers: ['onMessage'] },
      { name: 'Publisher', responsibility: 'Convenience sender; no knowledge of subscribers.', keyMembers: ['publish'] },
      { name: 'Message', responsibility: 'Immutable value delivered to all matching subscribers.', keyMembers: ['sequence', 'payload'] },
    ],
    patterns: [
      {
        name: 'Observer',
        why: 'Many parties want to react to events from one source without the source knowing them.',
        howApplied: 'Subscribers implement onMessage; the broker keeps the list and notifies matching ones on publish.',
      },
      {
        name: 'Mediator',
        why: 'Publishers and subscribers should be decoupled from each other, not just from a single subject.',
        howApplied: 'PubSubBroker is the only object both sides reference; it owns routing and ordering rules.',
      },
      {
        name: 'Strategy (light)',
        why: 'Different subscribers react differently to the same message.',
        howApplied: 'The Subscriber interface lets any behavior plug in; CallbackSubscriber turns a lambda into one.',
      },
    ],
    decisions: [
      {
        decision: 'Synchronous delivery in the publisher’s thread.',
        rationale: 'Simple, deterministic, and easy to reason about for ordering.',
        alternativeRejected: 'A thread pool or per-subscriber queue — correct for production, but adds shutdown, back-pressure, and failure policies.',
        tradeoff: 'A slow subscriber slows the publisher. We state this and offer mailboxes as the fix.',
      },
      {
        decision: 'Index exact topics in a hash map; keep wildcards in a separate list.',
        rationale: 'Most traffic is exact-topic, so most publishes avoid pattern matching entirely.',
        alternativeRejected: 'A single list scanned on every publish — simpler but O(all subscriptions).',
        tradeoff: 'Wildcard-heavy workloads still scan all wildcards; a trie over segments is the next optimization.',
      },
      {
        decision: 'Deliver outside the broker lock using a snapshot.',
        rationale: 'Avoids deadlocks from re-entrant publish and keeps lock hold times tiny.',
        alternativeRejected: 'Delivering while holding the lock — guarantees strict order but is deadlock-prone and slow.',
        tradeoff: 'Concurrent publishers to one topic may interleave delivery; sequence numbers expose the true order.',
      },
      {
        decision: 'Catch and log subscriber exceptions.',
        rationale: 'Isolation: one buggy handler must not stop others or crash the publisher.',
        alternativeRejected: 'Propagating exceptions to the publisher — couples publishers to subscriber quality.',
        tradeoff: 'Errors can be silently logged; production systems add dead-letter queues and metrics.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: the broker routes and orders; TopicMatcher knows syntax; Subscription identifies a registration; subscribers react.',
        'Open/Closed: new subscriber types implement the interface without changing the broker. New pattern syntax changes TopicMatcher only.',
        'Liskov Substitution: any Subscriber can stand in for another; the broker never inspects the concrete type.',
        'Interface Segregation: Subscriber has a single method; publishers see only publish.',
        'Dependency Inversion: the broker depends on the Subscriber abstraction, never on concrete handlers. Publishers depend on the broker, not on subscribers.',
      ],
    },
    extensibility: [
      'Async delivery: give each subscription a bounded queue and a worker; publish enqueues and returns.',
      'Replay: store messages per topic in a bounded log and let new subscribers start from an offset.',
      'Richer wildcards: replace the wildcard list with a segment trie supporting * and a multi-segment token.',
      'Acknowledgements and retries: wrap delivery with an attempt counter and a dead-letter topic.',
      'Metrics: count published, delivered, and failed per topic.',
    ],
  },
  implementationIntro: [
    'Each implementation contains Message, Subscriber, CallbackSubscriber, Subscription, TopicMatcher, PubSubBroker, Publisher, and a demo. The demo registers an orders.* wildcard, an exact orders.created subscriber, a deliberately failing subscriber, and a payments.* subscriber; publishes a few messages; unsubscribes the wildcard; and publishes again.',
  ],
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    narrative: [
      'The broker starts empty. Four subscriptions are registered: the wildcard orders.* (id 1), the exact orders.created (id 2), a flaky exact orders.created (id 3), and the wildcard payments.* (id 4). Exact subscriptions land in the topic map; wildcards land in the wildcard list.',
      'The checkout publisher sends orders.created. The broker bumps that topic’s sequence to 1, builds the message, and collects the two exact subscriptions plus wildcards that match: orders.* matches, payments.* does not. It sorts by id and delivers to 1, 2, and 3. The flaky subscriber throws; the broker logs it and the others are unaffected.',
      'orders.cancelled has no exact subscribers, so only orders.* hears it. payments.settled reaches only payments.*. After the orders.* subscription is removed, the next orders.created (sequence 2) reaches just the exact subscribers — the wildcard is gone from the list.',
    ],
    steps: [
      'subscribe(pattern, subscriber): validate pattern, assign an id, store in exact map or wildcard list.',
      'publish(topic, payload): validate topic, then under the lock bump the sequence, build the Message, snapshot matching subscriptions.',
      'Release the lock, sort the snapshot by id.',
      'For each subscription call subscriber.onMessage(message) inside try/catch.',
      'unsubscribe(subscription): remove exactly that id from its bucket; later publishes no longer see it.',
    ],
    examples: [
      {
        title: 'Wildcard and exact routing',
        input: 'publish("orders.created", "order#1") with orders.* and exact orders.created registered',
        output: '[all-orders] orders.created#1 order#1, [created-only] orders.created#1 order#1',
        explanation: 'Both subscriptions match. The exact one comes from the topic map, the wildcard from the pattern list; delivery is ordered by subscription id.',
      },
      {
        title: 'Only wildcards match',
        input: 'publish("orders.cancelled", "order#2")',
        output: '[all-orders] orders.cancelled#1 order#2',
        explanation: 'No exact subscribers for orders.cancelled. The wildcard orders.* matches because both have two segments and the second is *.',
      },
      {
        title: 'Failure isolation',
        input: 'flaky subscriber throws on every orders.created',
        output: 'Error logged for subscription 3; other subscribers still printed',
        explanation: 'The try/catch around each handler call keeps one bad subscriber from breaking delivery.',
      },
      {
        title: 'Unsubscribe takes effect next publish',
        input: 'unsubscribe(allOrders), then publish("orders.created", "order#3")',
        output: '[created-only] orders.created#2 order#3',
        explanation: 'The wildcard is removed from the list. The sequence continues at 2, proving numbering belongs to the topic and not to a subscriber.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you make delivery asynchronous without breaking ordering?',
      answer: 'Give every subscription its own bounded queue and a single worker (or a serial executor). Publish enqueues the message and returns. Because one worker drains each queue in FIFO order, each subscriber sees messages in publish order, and a slow subscriber only fills its own queue. You then need a policy for a full queue — block, drop oldest, or disconnect — and a shutdown path that drains or discards remaining messages.',
    },
    {
      question: 'How would you support multi-level wildcards like orders.#?',
      answer: 'Store subscriptions in a trie keyed by topic segments. A * node matches any one child; a # node matches the remainder. Publishing walks the trie with the topic’s segments, collecting subscriptions at matching nodes. This replaces the linear scan over wildcards and gives O(depth) matching plus the number of matches.',
    },
    {
      question: 'What guarantees does your ordering actually provide?',
      answer: 'Messages for one topic receive increasing sequence numbers assigned under the lock, so the true order is always visible. With a single publisher thread delivery order equals sequence order. With concurrent publishers on the same topic, deliveries may interleave because we deliver outside the lock. If strict per-subscriber order is required, use the per-subscription queue described above, enqueued under the lock.',
    },
    {
      question: 'How do you prevent memory leaks from forgotten subscriptions?',
      answer: 'Make unsubscribe easy and explicit (the Subscription handle), and optionally let subscriptions be auto-closeable. For long-lived brokers, support weak references or time-to-live on subscriptions, and expose a count metric so leaks show up on dashboards.',
    },
    {
      question: 'What happens if a subscriber calls publish or subscribe inside onMessage?',
      answer: 'It works because delivery happens outside the lock — the handler can take the lock again without deadlock. The new publish gets its own sequence number and runs a nested delivery. Mention the risk of infinite loops if two topics republish each other, and that the application, not the broker, must prevent it.',
    },
    {
      question: 'How would you support at-least-once delivery?',
      answer: 'Add acknowledgements. Each delivery has an attempt count and a timeout; if the subscriber does not ack in time, redeliver up to a limit and then route to a dead-letter topic. Subscribers must become idempotent, usually by deduplicating on topic plus sequence number, which we already provide.',
    },
    {
      question: 'Why not just a Map from topic to a list of callbacks?',
      answer: 'That works for a ten-minute version, but it cannot express wildcards, cannot unsubscribe unambiguously, and mixes routing with callbacks. Subscription objects with ids and a separate matcher cost little and make each of those features trivial.',
    },
    {
      question: 'How do you test this?',
      answer: 'Unit test TopicMatcher with a table of pattern/topic pairs. Test the broker with recording subscribers: exact delivery, wildcard delivery, no delivery after unsubscribe, ordered sequence numbers, and failure isolation. For concurrency, publish from many threads and assert that the set of sequence numbers is exactly 1..N with no duplicates.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Invalid input should fail fast: publishing to a topic containing * or an empty segment, or subscribing with a malformed pattern, throws immediately. Publishing to a topic with no subscribers is legal and simply returns the message.',
      ],
      bullets: [
        'Unsubscribe twice returns false the second time.',
        'The same subscriber registered twice with matching patterns is called twice per message.',
        'A subscriber unsubscribing itself inside its own handler is safe because delivery uses a snapshot.',
        'Topic names with leading, trailing, or doubled dots are rejected.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'The most common mistake is delivering while holding the broker lock, which deadlocks the moment a handler publishes. The second is leaving exceptions uncaught so one subscriber breaks everyone. The third is scanning every subscription on every publish when most are exact topics. The fourth is tying a Subscriber to a topic inside the subscriber class, which re-couples the two sides. Finally, candidates often add a Topic class with no behavior, which just adds boilerplate.',
      ],
    },
    complexity: [
      'subscribe: O(1) amortized plus pattern validation O(length).',
      'unsubscribe: O(subscriptions in that bucket) for the list removal.',
      'publish: O(1) for the exact lookup, O(W) matcher calls for W wildcard subscriptions, plus O(m log m) to sort m matches.',
      'Memory: one Subscription per registration, one counter per distinct topic.',
    ],
    testing: {
      paragraphs: [
        'Use recording subscribers that append received messages to a list. Test the matcher in isolation, then the broker with deterministic single-threaded flows, and finally a concurrency test with many publisher threads.',
      ],
      numbered: [
        'TopicMatcher table: orders.* vs orders.created (true), orders.created.eu (false), payments.created (false).',
        'Exact and wildcard subscriptions both receive a message in id order.',
        'Unsubscribe prevents later deliveries and returns false on repeat.',
        'A throwing subscriber does not stop later subscribers.',
        'Sequence numbers per topic are 1..N with no gaps under concurrent publish.',
      ],
    },
    extensions: [
      'Asynchronous per-subscriber queues.',
      'Message replay and durable logs.',
      'Trie-based wildcard index.',
      'Acknowledgements, retries, and dead-letter topics.',
      'Typed payloads with generics.',
    ],
    takeaways: [
      'Pub-sub is Observer plus a mediator: publishers and subscribers only know the broker.',
      'Index exact topics in a map; keep wildcards separate and match them with a tiny helper.',
      'Snapshot under the lock, deliver outside it, and isolate subscriber failures.',
      'A Subscription handle makes unsubscribe unambiguous and gives deterministic ordering.',
      'State your delivery and ordering guarantees honestly, then offer the async mailbox upgrade.',
    ],
  },
}
