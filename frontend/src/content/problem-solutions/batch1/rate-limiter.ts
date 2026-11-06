import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('svc', 'RateLimitService', GRID.x(0), GRID.y(0), [
    attr('-', 'defaultRule', 'Rule'),
    attr('-', 'rules', 'Map<String, Rule>'),
    attr('-', 'limiters', 'Map<String, RateLimiter>'),
  ], [
    method('+', 'check', 'clientId: String, endpoint: String, tier: String', 'Decision'),
    method('+', 'setRule', 'endpoint: String, tier: String, rule: Rule', 'void'),
  ]),
  iface('rl', 'RateLimiter', GRID.x(2.5), GRID.y(0), [
    method('+', 'allow', 'clientId: String', 'Decision'),
  ]),
  cls('fac', 'LimiterFactory', GRID.x(4), GRID.y(0), [], [
    method('+', 'create', 'rule: Rule, clock: Clock', 'RateLimiter', { isStatic: true }),
  ]),
  cls('rule', 'Rule', GRID.x(0), GRID.y(1), [
    attr('-', 'limit', 'int'),
    attr('-', 'windowSeconds', 'double'),
    attr('-', 'algorithm', 'Algorithm'),
  ], []),
  cls('fw', 'FixedWindowLimiter', GRID.x(1), GRID.y(1), [
    attr('-', 'state', 'Map<String, (start, count)>'),
  ], [
    method('+', 'allow', 'clientId: String', 'Decision'),
  ]),
  cls('sw', 'SlidingWindowLimiter', GRID.x(2), GRID.y(1), [
    attr('-', 'logs', 'Map<String, Deque<double>>'),
  ], [
    method('+', 'allow', 'clientId: String', 'Decision'),
  ]),
  cls('tb', 'TokenBucketLimiter', GRID.x(3), GRID.y(1), [
    attr('-', 'buckets', 'Map<String, (tokens, last)>'),
    attr('-', 'refillRate', 'double'),
  ], [
    method('+', 'allow', 'clientId: String', 'Decision'),
  ]),
  cls('lb', 'LeakyBucketLimiter', GRID.x(4), GRID.y(1), [
    attr('-', 'levels', 'Map<String, (level, last)>'),
    attr('-', 'leakRate', 'double'),
  ], [
    method('+', 'allow', 'clientId: String', 'Decision'),
  ]),
  enm('alg', 'Algorithm', GRID.x(0), GRID.y(2), ['FIXED_WINDOW', 'SLIDING_WINDOW', 'TOKEN_BUCKET', 'LEAKY_BUCKET']),
  cls('dec', 'Decision', GRID.x(4), GRID.y(2), [
    attr('-', 'allowed', 'boolean'),
    attr('-', 'limit', 'int'),
    attr('-', 'remaining', 'int'),
    attr('-', 'retryAfter', 'double'),
  ], [
    method('+', 'status', '', 'int'),
    method('+', 'headers', '', 'Map<String, String>'),
  ]),
]

const edges = [
  edge('e1', 'svc', 'rl', 'aggregation', 'right', 'left', { label: 'routes to', targetMultiplicity: '0..*' }),
  edge('e2', 'fw', 'rl', 'realization', 'top', 'bottom@15'),
  edge('e3', 'sw', 'rl', 'realization', 'top', 'bottom@38'),
  edge('e4', 'tb', 'rl', 'realization', 'top', 'bottom@62'),
  edge('e5', 'lb', 'rl', 'realization', 'top', 'bottom@85'),
  edge('e6', 'fac', 'rl', 'dependency', 'left', 'right', { label: 'creates' }),
  edge('e7', 'svc', 'rule', 'association', 'bottom', 'top', { label: 'resolves', targetMultiplicity: '0..*' }),
  edge('e8', 'rule', 'alg', 'association', 'bottom', 'top'),
  edge('e9', 'lb', 'dec', 'dependency', 'bottom', 'top', { label: 'returns' }),
]

const py = `"""Rate Limiter - medium-level LLD interview reference (Python)."""
from __future__ import annotations
import math
import time
from abc import ABC, abstractmethod
from collections import deque
from dataclasses import dataclass
from enum import Enum
from threading import Lock
from typing import Callable, Deque, Dict, Tuple

Clock = Callable[[], float]  # seconds; injectable so tests never sleep


class Algorithm(Enum):
    FIXED_WINDOW = "fixed"
    SLIDING_WINDOW = "sliding"
    TOKEN_BUCKET = "token"
    LEAKY_BUCKET = "leaky"


@dataclass(frozen=True)

class Rule:
    limit: int                      # N requests ...
    window_seconds: float           # ... per window
    algorithm: Algorithm = Algorithm.TOKEN_BUCKET


@dataclass(frozen=True)

class Decision:
    allowed: bool
    limit: int
    remaining: int
    retry_after: float = 0.0        # seconds until the next request would be admitted

    @property
    def status(self) -> int:
        return 200 if self.allowed else 429

    def headers(self) -> Dict[str, str]:
        h = {
            "X-RateLimit-Limit": str(self.limit),
            "X-RateLimit-Remaining": str(self.remaining),
        }
        if not self.allowed:
            h["Retry-After"] = str(math.ceil(self.retry_after))
        return h


class RateLimiter(ABC):
    @abstractmethod
    def allow(self, client_id: str) -> Decision:
        ...


class FixedWindowLimiter(RateLimiter):
    """Counter per client per aligned window. Cheap, but allows 2x bursts at a boundary."""

    def __init__(self, rule: Rule, clock: Clock):
        self._rule, self._clock = rule, clock
        self._state: Dict[str, Tuple[float, int]] = {}  # client -> (window_start, count)
        self._lock = Lock()

    def allow(self, client_id: str) -> Decision:
        now, w, limit = self._clock(), self._rule.window_seconds, self._rule.limit
        start = math.floor(now / w) * w
        with self._lock:
            win, count = self._state.get(client_id, (start, 0))
            if win != start:
                win, count = start, 0
            if count < limit:
                self._state[client_id] = (win, count + 1)
                return Decision(True, limit, limit - count - 1)
            self._state[client_id] = (win, count)
            return Decision(False, limit, 0, retry_after=start + w - now)


class SlidingWindowLimiter(RateLimiter):
    """Log of timestamps per client. Exact, but O(limit) memory per client."""

    def __init__(self, rule: Rule, clock: Clock):
        self._rule, self._clock = rule, clock
        self._logs: Dict[str, Deque[float]] = {}
        self._lock = Lock()

    def allow(self, client_id: str) -> Decision:
        now, w, limit = self._clock(), self._rule.window_seconds, self._rule.limit
        with self._lock:
            log = self._logs.setdefault(client_id, deque())
            while log and log[0] <= now - w:
                log.popleft()
            if len(log) < limit:
                log.append(now)
                return Decision(True, limit, limit - len(log))
            return Decision(False, limit, 0, retry_after=log[0] + w - now)


class TokenBucketLimiter(RateLimiter):
    """Bucket of capacity=limit refilled at limit/window tokens per second. Allows bursts."""

    def __init__(self, rule: Rule, clock: Clock):
        self._rule, self._clock = rule, clock
        self._rate = rule.limit / rule.window_seconds
        self._buckets: Dict[str, Tuple[float, float]] = {}  # client -> (tokens, last_refill)
        self._lock = Lock()

    def allow(self, client_id: str) -> Decision:
        now, limit = self._clock(), self._rule.limit
        with self._lock:
            tokens, last = self._buckets.get(client_id, (float(limit), now))
            tokens = min(float(limit), tokens + (now - last) * self._rate)
            if tokens >= 1.0:
                tokens -= 1.0
                self._buckets[client_id] = (tokens, now)
                return Decision(True, limit, int(tokens))
            self._buckets[client_id] = (tokens, now)
            return Decision(False, limit, 0, retry_after=(1.0 - tokens) / self._rate)


class LeakyBucketLimiter(RateLimiter):
    """Water level rises by 1 per request and drains at limit/window per second (meter variant)."""

    def __init__(self, rule: Rule, clock: Clock):
        self._rule, self._clock = rule, clock
        self._rate = rule.limit / rule.window_seconds
        self._levels: Dict[str, Tuple[float, float]] = {}  # client -> (level, last_leak)
        self._lock = Lock()

    def allow(self, client_id: str) -> Decision:
        now, limit = self._clock(), self._rule.limit
        with self._lock:
            level, last = self._levels.get(client_id, (0.0, now))
            level = max(0.0, level - (now - last) * self._rate)
            if level + 1.0 <= limit + 1e-9:
                level += 1.0
                self._levels[client_id] = (level, now)
                return Decision(True, limit, int(limit - level + 1e-9))
            self._levels[client_id] = (level, now)
            return Decision(False, limit, 0, retry_after=(level + 1.0 - limit) / self._rate)


class LimiterFactory:
    @staticmethod
    def create(rule: Rule, clock: Clock) -> RateLimiter:
        kinds = {
            Algorithm.FIXED_WINDOW: FixedWindowLimiter,
            Algorithm.SLIDING_WINDOW: SlidingWindowLimiter,
            Algorithm.TOKEN_BUCKET: TokenBucketLimiter,
            Algorithm.LEAKY_BUCKET: LeakyBucketLimiter,
        }
        return kinds[rule.algorithm](rule, clock)


class RateLimitService:
    """Facade: picks the rule for (endpoint, tier) and delegates to that rule's limiter."""

    def __init__(self, default_rule: Rule, clock: Clock = time.monotonic):
        self._default = default_rule
        self._clock = clock
        self._rules: Dict[str, Rule] = {}
        self._limiters: Dict[str, RateLimiter] = {}
        self._lock = Lock()

    @staticmethod
    def _key(endpoint: str, tier: str) -> str:
        return endpoint + "|" + tier

    def set_rule(self, endpoint: str, tier: str, rule: Rule) -> None:
        key = self._key(endpoint, tier)
        with self._lock:
            self._rules[key] = rule
            self._limiters.pop(key, None)  # next check builds a limiter for the new rule

    def check(self, client_id: str, endpoint: str, tier: str = "free") -> Decision:
        key = self._key(endpoint, tier)
        with self._lock:
            limiter = self._limiters.get(key)
            if limiter is None:
                rule = self._rules.get(key, self._default)
                limiter = LimiterFactory.create(rule, self._clock)
                self._limiters[key] = limiter
        return limiter.allow(client_id)


class FakeClock:
    def __init__(self) -> None:
        self.t = 0.0

    def __call__(self) -> float:
        return self.t


if __name__ == "__main__":
    clock = FakeClock()
    for algo in Algorithm:
        clock.t = 0.0
        svc = RateLimitService(Rule(3, 10.0, algo), clock)
        results = [svc.check("alice", "/search").allowed for _ in range(4)]
        clock.t = 10.0
        results.append(svc.check("alice", "/search").allowed)
        print(algo.name, results)  # [True, True, True, False, True]

    clock.t = 0.0
    svc = RateLimitService(Rule(3, 10.0, Algorithm.FIXED_WINDOW), clock)
    svc.set_rule("/login", "free", Rule(1, 60.0, Algorithm.SLIDING_WINDOW))
    first = svc.check("bob", "/login")
    second = svc.check("bob", "/login")
    print(first.status, second.status, second.headers())
`

const java = `// Rate Limiter - medium-level LLD interview reference (Java 17+)
import java.util.*;
import java.util.function.DoubleSupplier;

enum Algorithm { FIXED_WINDOW, SLIDING_WINDOW, TOKEN_BUCKET, LEAKY_BUCKET }

record Rule(int limit, double windowSeconds, Algorithm algorithm) {}

record Decision(boolean allowed, int limit, int remaining, double retryAfter) {
  int status() {
    return allowed ? 200 : 429;
  }

  Map<String, String> headers() {
    Map<String, String> h = new LinkedHashMap<>();
    h.put("X-RateLimit-Limit", String.valueOf(limit));
    h.put("X-RateLimit-Remaining", String.valueOf(remaining));
    if (!allowed) {
      h.put("Retry-After", String.valueOf((long) Math.ceil(retryAfter)));
    }
    return h;
  }
}

interface RateLimiter {
  Decision allow(String clientId);
}

/** Counter per client per aligned window. Cheap, but allows 2x bursts at a boundary. */

class FixedWindowLimiter implements RateLimiter {
  private final Rule rule;
  private final DoubleSupplier clock;
  private final Map<String, double[]> state = new HashMap<>(); // client -> {windowStart, count}

  FixedWindowLimiter(Rule rule, DoubleSupplier clock) {
    this.rule = rule; this.clock = clock;
  }

  public synchronized Decision allow(String clientId) {
    double now = clock.getAsDouble();
    double w = rule.windowSeconds();
    double start = Math.floor(now / w) * w;
    double[] st = state.get(clientId);
    if (st == null || st[0] != start) {
      st = new double[] { start, 0 };
      state.put(clientId, st);
    }
    if (st[1] < rule.limit()) {
      st[1]++;
      return new Decision(true, rule.limit(), rule.limit() - (int) st[1], 0);
    }

    return new Decision(false, rule.limit(), 0, start + w - now);
  }
}

/** Log of timestamps per client. Exact, but O(limit) memory per client. */

class SlidingWindowLimiter implements RateLimiter {
  private final Rule rule;
  private final DoubleSupplier clock;
  private final Map<String, ArrayDeque<Double>> logs = new HashMap<>();

  SlidingWindowLimiter(Rule rule, DoubleSupplier clock) {
    this.rule = rule; this.clock = clock;
  }

  public synchronized Decision allow(String clientId) {
    double now = clock.getAsDouble();
    double w = rule.windowSeconds();
    ArrayDeque<Double> log = logs.computeIfAbsent(clientId, k -> new ArrayDeque<>());
    while (!log.isEmpty() && log.peekFirst() <= now - w) {
      log.pollFirst();) {
    }
      if (log.size() {
    }
      < rule.limit()) {
    }
      log.addLast(now);
      return new Decision(true, rule.limit(), rule.limit() - log.size(), 0);
    }

    return new Decision(false, rule.limit(), 0, log.peekFirst() + w - now);
  }
}

/** Bucket of capacity=limit refilled at limit/window tokens per second. Allows bursts. */

class TokenBucketLimiter implements RateLimiter {
  private final Rule rule;
  private final DoubleSupplier clock;
  private final double rate;
  private final Map<String, double[]> buckets = new HashMap<>(); // client -> {tokens, last}

  TokenBucketLimiter(Rule rule, DoubleSupplier clock) {
    this.rule = rule; this.clock = clock;
    this.rate = rule.limit() / rule.windowSeconds();
  }

  public synchronized Decision allow(String clientId) {
    double now = clock.getAsDouble();
    double[] b = buckets.computeIfAbsent(clientId, k -> new double[] { rule.limit(), now });
    b[0] = Math.min(rule.limit(), b[0] + (now - b[1]) * rate);
    b[1] = now;
    if (b[0] >= 1.0) {
      b[0] -= 1.0;
      return new Decision(true, rule.limit(), (int) b[0], 0);
    }

    return new Decision(false, rule.limit(), 0, (1.0 - b[0]) / rate);
  }
}

/** Water level rises by 1 per request and drains at limit/window per second (meter variant). */

class LeakyBucketLimiter implements RateLimiter {
  private final Rule rule;
  private final DoubleSupplier clock;
  private final double rate;
  private final Map<String, double[]> levels = new HashMap<>(); // client -> {level, last}

  LeakyBucketLimiter(Rule rule, DoubleSupplier clock) {
    this.rule = rule; this.clock = clock;
    this.rate = rule.limit() / rule.windowSeconds();
  }

  public synchronized Decision allow(String clientId) {
    double now = clock.getAsDouble();
    double[] s = levels.computeIfAbsent(clientId, k -> new double[] { 0, now });
    s[0] = Math.max(0.0, s[0] - (now - s[1]) * rate);
    s[1] = now;
    if (s[0] + 1.0 <= rule.limit() {
      + 1e-9) {
    }
      s[0] += 1.0;
      return new Decision(true, rule.limit(), (int) (rule.limit() - s[0] + 1e-9), 0);
    }

    return new Decision(false, rule.limit(), 0, (s[0] + 1.0 - rule.limit()) / rate);
  }
}

final class LimiterFactory {
  private LimiterFactory() {}
  static RateLimiter create(Rule rule, DoubleSupplier clock) {
    return switch (rule.algorithm()) {
      case FIXED_WINDOW -> new FixedWindowLimiter(rule, clock);
      case SLIDING_WINDOW -> new SlidingWindowLimiter(rule, clock);
      case TOKEN_BUCKET -> new TokenBucketLimiter(rule, clock);
      case LEAKY_BUCKET -> new LeakyBucketLimiter(rule, clock);
    };
  }
}

/** Facade: picks the rule for (endpoint, tier) and delegates to that rule's limiter. */

class RateLimitService {
  private final Rule defaultRule;
  private final DoubleSupplier clock;
  private final Map<String, Rule> rules = new HashMap<>();
  private final Map<String, RateLimiter> limiters = new HashMap<>();

  RateLimitService(Rule defaultRule, DoubleSupplier clock) {
    this.defaultRule = defaultRule; this.clock = clock;
  }

  private static String key(String endpoint, String tier) {
    return endpoint + "|" + tier;
  }

  synchronized void setRule(String endpoint, String tier, Rule rule) {
    String k = key(endpoint, tier);
    rules.put(k, rule);
    limiters.remove(k); // next check builds a limiter for the new rule
  }

  Decision check(String clientId, String endpoint, String tier) {
    RateLimiter limiter;
    synchronized (this) {
      String k = key(endpoint, tier);
      limiter = limiters.get(k);
      if (limiter == null) {
        limiter = LimiterFactory.create(rules.getOrDefault(k, defaultRule), clock);
        limiters.put(k, limiter);
      }
    }
    return limiter.allow(clientId);
  }
}

class FakeClock {
  double t = 0;
  double now() {
    return t;
  }
}

public class Main {
  public static void main(String[] args) {
    FakeClock clock = new FakeClock();
    for (Algorithm algo : Algorithm.values()) {
      clock.t = 0;
      RateLimitService svc = new RateLimitService(new Rule(3, 10.0, algo), clock::now);
      List<Boolean> results = new ArrayList<>();
      for (int i = 0; i < 4; i++) {
        results.add(svc.check("alice", "/search", "free").allowed());
      }
      clock.t = 10;
      results.add(svc.check("alice", "/search", "free").allowed());
      System.out.println(algo + " " + results); // [true, true, true, false, true]
    }

    clock.t = 0;
    RateLimitService svc = new RateLimitService(new Rule(3, 10.0, Algorithm.FIXED_WINDOW), clock::now);
    svc.setRule("/login", "free", new Rule(1, 60.0, Algorithm.SLIDING_WINDOW));
    Decision first = svc.check("bob", "/login", "free");
    Decision second = svc.check("bob", "/login", "free");
    System.out.println(first.status() + " " + second.status() + " " + second.headers());
  }
}
`

const ts = `// Rate Limiter - medium-level LLD interview reference (TypeScript)
// JavaScript is single-threaded, so the check-and-update below is already atomic.

type Clock = () => number // seconds

type Algorithm = 'FIXED_WINDOW' | 'SLIDING_WINDOW' | 'TOKEN_BUCKET' | 'LEAKY_BUCKET'

interface Rule {
  limit: number
  windowSeconds: number
  algorithm: Algorithm
}

class Decision {
  constructor(
    public readonly allowed: boolean,
    public readonly limit: number,
    public readonly remaining: number,
    public readonly retryAfter = 0,
  ) {}

  get status(): number { return this.allowed ? 200 : 429 }

  headers(): Record<string, string> {
    const h: Record<string, string> = {
      'X-RateLimit-Limit': String(this.limit),
      'X-RateLimit-Remaining': String(this.remaining),
    }

    if (!this.allowed) {
      h['Retry-After'] = String(Math.ceil(this.retryAfter))
    }
    return h
  }
}

interface RateLimiter {
  allow(clientId: string): Decision
}

// Counter per client per aligned window. Cheap, but allows 2x bursts at a boundary.

class FixedWindowLimiter implements RateLimiter {
  private state = new Map<string, { start: number; count: number }>()
  constructor(private rule: Rule, private clock: Clock) {}

  allow(clientId: string): Decision {
    const now = this.clock()
    const { limit, windowSeconds: w } = this.rule
    const start = Math.floor(now / w) * w
    let st = this.state.get(clientId)
    if (!st || st.start !== start) {
      st = { start, count: 0 }
      this.state.set(clientId, st)
    }

    if (st.count < limit) {
      st.count++
      return new Decision(true, limit, limit - st.count)
    }

    return new Decision(false, limit, 0, start + w - now)
  }
}

// Log of timestamps per client. Exact, but O(limit) memory per client.

class SlidingWindowLimiter implements RateLimiter {
  private logs = new Map<string, number[]>()
  constructor(private rule: Rule, private clock: Clock) {}

  allow(clientId: string): Decision {
    const now = this.clock()
    const { limit, windowSeconds: w } = this.rule
    const log = this.logs.get(clientId) ?? []
    this.logs.set(clientId, log)
    while (log.length > 0 && log[0] <= now - w) {
      log.shift()
    }

    if (log.length < limit) {
      log.push(now)
      return new Decision(true, limit, limit - log.length)
    }

    return new Decision(false, limit, 0, log[0] + w - now)
  }
}

// Bucket of capacity=limit refilled at limit/window tokens per second. Allows bursts.

class TokenBucketLimiter implements RateLimiter {
  private buckets = new Map<string, { tokens: number; last: number }>()
  private rate: number
  constructor(private rule: Rule, private clock: Clock) {
    this.rate = rule.limit / rule.windowSeconds
  }

  allow(clientId: string): Decision {
    const now = this.clock()
    const limit = this.rule.limit
    const b = this.buckets.get(clientId) ?? { tokens: limit, last: now }
    this.buckets.set(clientId, b)
    b.tokens = Math.min(limit, b.tokens + (now - b.last) * this.rate)
    b.last = now
    if (b.tokens >= 1) {
      b.tokens -= 1
      return new Decision(true, limit, Math.floor(b.tokens))
    }

    return new Decision(false, limit, 0, (1 - b.tokens) / this.rate)
  }
}

// Water level rises by 1 per request and drains at limit/window per second (meter variant).

class LeakyBucketLimiter implements RateLimiter {
  private levels = new Map<string, { level: number; last: number }>()
  private rate: number
  constructor(private rule: Rule, private clock: Clock) {
    this.rate = rule.limit / rule.windowSeconds
  }

  allow(clientId: string): Decision {
    const now = this.clock()
    const limit = this.rule.limit
    const s = this.levels.get(clientId) ?? { level: 0, last: now }
    this.levels.set(clientId, s)
    s.level = Math.max(0, s.level - (now - s.last) * this.rate)
    s.last = now
    if (s.level + 1 <= limit + 1e-9) {
      s.level += 1
      return new Decision(true, limit, Math.floor(limit - s.level + 1e-9))
    }

    return new Decision(false, limit, 0, (s.level + 1 - limit) / this.rate)
  }
}

class LimiterFactory {
  static create(rule: Rule, clock: Clock): RateLimiter {
    switch (rule.algorithm) {
      case 'FIXED_WINDOW': return new FixedWindowLimiter(rule, clock)
      case 'SLIDING_WINDOW': return new SlidingWindowLimiter(rule, clock)
      case 'TOKEN_BUCKET': return new TokenBucketLimiter(rule, clock)
      case 'LEAKY_BUCKET': return new LeakyBucketLimiter(rule, clock)
    }
  }
}

// Facade: picks the rule for (endpoint, tier) and delegates to that rule's limiter.

class RateLimitService {
  private rules = new Map<string, Rule>()
  private limiters = new Map<string, RateLimiter>()
  constructor(private defaultRule: Rule, private clock: Clock = () => Date.now() / 1000) {}

  private key(endpoint: string, tier: string) {
    return endpoint + '|' + tier
  }

  setRule(endpoint: string, tier: string, rule: Rule): void {
    const k = this.key(endpoint, tier)
    this.rules.set(k, rule)
    this.limiters.delete(k) // next check builds a limiter for the new rule
  }

  check(clientId: string, endpoint: string, tier = 'free'): Decision {
    const k = this.key(endpoint, tier)
    let limiter = this.limiters.get(k)
    if (!limiter) {
      limiter = LimiterFactory.create(this.rules.get(k) ?? this.defaultRule, this.clock)
      this.limiters.set(k, limiter)
    }
    return limiter.allow(clientId)
  }
}

// Demo with a fake clock
let t = 0
const clock: Clock = () => t
const algorithms: Algorithm[] = ['FIXED_WINDOW', 'SLIDING_WINDOW', 'TOKEN_BUCKET', 'LEAKY_BUCKET']
for (const algorithm of algorithms) {
  t = 0
  const svc = new RateLimitService({ limit: 3, windowSeconds: 10, algorithm }, clock)
  const results = [1, 2, 3, 4].map(() => svc.check('alice', '/search').allowed)
  t = 10
  results.push(svc.check('alice', '/search').allowed)
  console.log(algorithm, results) // [true, true, true, false, true]
}

t = 0
const svc = new RateLimitService({ limit: 3, windowSeconds: 10, algorithm: 'FIXED_WINDOW' }, clock)
svc.setRule('/login', 'free', { limit: 1, windowSeconds: 60, algorithm: 'SLIDING_WINDOW' })
const first = svc.check('bob', '/login')
const second = svc.check('bob', '/login')
console.log(first.status, second.status, second.headers())

export { RateLimitService, LimiterFactory, Decision }
export type { Rule, Algorithm, RateLimiter }
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

// Rate Limiter - medium-level LLD interview reference (C++17)

using Clock = function<double()>;  // seconds

enum class Algorithm { FixedWindow, SlidingWindow, TokenBucket, LeakyBucket };

struct Rule {
  int limit;
  double windowSeconds;
  Algorithm algorithm;
};

struct Decision {
  bool allowed;
  int limit;
  int remaining;
  double retryAfter;
  int status() const {
    return allowed ? 200 : 429;
  }
};

class RateLimiter {
public:
  virtual ~RateLimiter() = default;
  virtual Decision allow(const string& clientId) = 0;
};

// Counter per client per aligned window. Cheap, but allows 2x bursts at a boundary.

class FixedWindowLimiter : public RateLimiter {
  struct State { double start; int count; };
  Rule rule_;
  Clock clock_;
  mutex mu_;
  unordered_map<string, State> state_;
public:
  FixedWindowLimiter(Rule r, Clock c) : rule_(r), clock_(move(c)) {}
  Decision allow(const string& id) override {
    double now = clock_(), w = rule_.windowSeconds;
    double start = floor(now / w) * w;
    lock_guard<mutex> lock(mu_);
    State& st = state_[id];
    if (st.start != start) {
      st = State {
    }
      start, 0
    }
    if (st.count < rule_.limit) {
      st.count++;
      return {true, rule_.limit, rule_.limit - st.count, 0.0};
    }
    return {false, rule_.limit, 0, start + w - now};
  }
};

// Log of timestamps per client. Exact, but O(limit) memory per client.

class SlidingWindowLimiter : public RateLimiter {
  Rule rule_;
  Clock clock_;
  mutex mu_;
  unordered_map<string, deque<double>> logs_;
public:
  SlidingWindowLimiter(Rule r, Clock c) : rule_(r), clock_(move(c)) {}
  Decision allow(const string& id) override {
    double now = clock_(), w = rule_.windowSeconds;
    lock_guard<mutex> lock(mu_);
    auto& log = logs_[id];
    while (!log.empty() && log.front() <= now - w) {
      log.pop_front();) {
    }
      if (static_cast<int>(log.size()) < rule_.limit) {
    }
      log.push_back(now);
      return {true, rule_.limit, rule_.limit - static_cast<int>(log.size()), 0.0};
    }
    return {false, rule_.limit, 0, log.front() + w - now};
  }
};

// Bucket of capacity=limit refilled at limit/window tokens per second. Allows bursts.

class TokenBucketLimiter : public RateLimiter {
  struct State { double tokens; double last; };
  Rule rule_;
  Clock clock_;
  double rate_;
  mutex mu_;
  unordered_map<string, State> buckets_;
public:
  TokenBucketLimiter(Rule r, Clock c)
      : rule_(r), clock_(move(c)), rate_(r.limit / r.windowSeconds) {}
  Decision allow(const string& id) override {
    double now = clock_();
    lock_guard<mutex> lock(mu_);
    auto it = buckets_.find(id);
    if (it == buckets_.end()) {
      it = buckets_.emplace(id, State{double(rule_.limit), now}).first;
    }
    State& b = it->second;
    b.tokens = min(double(rule_.limit), b.tokens + (now - b.last) * rate_);
    b.last = now;
    if (b.tokens >= 1.0) {
      b.tokens -= 1.0;
      return {true, rule_.limit, static_cast<int>(b.tokens), 0.0};
    }
    return {false, rule_.limit, 0, (1.0 - b.tokens) / rate_};
  }
};

// Water level rises by 1 per request and drains at limit/window per second (meter variant).

class LeakyBucketLimiter : public RateLimiter {
  struct State { double level; double last; };
  Rule rule_;
  Clock clock_;
  double rate_;
  mutex mu_;
  unordered_map<string, State> levels_;
public:
  LeakyBucketLimiter(Rule r, Clock c)
      : rule_(r), clock_(move(c)), rate_(r.limit / r.windowSeconds) {}
  Decision allow(const string& id) override {
    double now = clock_();
    lock_guard<mutex> lock(mu_);
    auto it = levels_.find(id);
    if (it == levels_.end()) {
      it = levels_.emplace(id, State{0.0, now}).first;
    }
    State& s = it->second;
    s.level = max(0.0, s.level - (now - s.last) * rate_);
    s.last = now;
    if (s.level + 1.0 <= rule_.limit + 1e-9) {
      s.level += 1.0;
      return {true, rule_.limit, static_cast<int>(rule_.limit - s.level + 1e-9), 0.0};
    }
    return {false, rule_.limit, 0, (s.level + 1.0 - rule_.limit) / rate_};
  }
};

struct LimiterFactory {
  static shared_ptr<RateLimiter> create(const Rule& rule, const Clock& clock) {
    switch (rule.algorithm) {
      case Algorithm::FixedWindow: return make_shared<FixedWindowLimiter>(rule, clock);
      case Algorithm::SlidingWindow: return make_shared<SlidingWindowLimiter>(rule, clock);
      case Algorithm::TokenBucket: return make_shared<TokenBucketLimiter>(rule, clock);
      default: return make_shared<LeakyBucketLimiter>(rule, clock);
    }
  }
};

// Facade: picks the rule for (endpoint, tier) and delegates to that rule's limiter.

class RateLimitService {
  Rule default_;
  Clock clock_;
  mutex mu_;
  map<string, Rule> rules_;
  map<string, shared_ptr<RateLimiter>> limiters_;

  static string key(const string& endpoint, const string& tier) {
    return endpoint + "|" + tier;
  }
public:
  RateLimitService(Rule defaultRule, Clock clock) : default_(defaultRule), clock_(move(clock)) {}

  void setRule(const string& endpoint, const string& tier, Rule rule) {
    lock_guard<mutex> lock(mu_);
    string k = key(endpoint, tier);
    rules_[k] = rule;
    limiters_.erase(k);  // next check builds a limiter for the new rule
  }

  Decision check(const string& clientId, const string& endpoint,
                 const string& tier = "free") {
    shared_ptr<RateLimiter> limiter;
    {
      lock_guard<mutex> lock(mu_);
      string k = key(endpoint, tier);
      auto it = limiters_.find(k);
      if (it == limiters_.end()) {
        auto rit = rules_.find(k);
        Rule rule = rit != rules_.end() ? rit->second : default_;
        it = limiters_.emplace(k, LimiterFactory::create(rule, clock_)).first;
      }
      limiter = it->second;
    }
    return limiter->allow(clientId);
  }
};

int main() {
  double t = 0;
  Clock clock = [&t] { return t; };
  const char* names[] = {"FIXED_WINDOW", "SLIDING_WINDOW", "TOKEN_BUCKET", "LEAKY_BUCKET"};
  Algorithm algos[] = {Algorithm::FixedWindow, Algorithm::SlidingWindow,
                       Algorithm::TokenBucket, Algorithm::LeakyBucket};
  for (int a = 0; a < 4; a++) {
    t = 0;
    RateLimitService svc(Rule{3, 10.0, algos[a]}, clock);
    cout << names[a] << " [";
    for (int i = 0; i < 4; i++) {
      cout << (svc.check("alice", "/search").allowed ? "true " : "false ");
    }
    t = 10;
    cout << (svc.check("alice", "/search").allowed ? "true" : "false") << "]" << endl;
  }

  t = 0;
  RateLimitService svc(Rule{3, 10.0, Algorithm::FixedWindow}, clock);
  svc.setRule("/login", "free", Rule{1, 60.0, Algorithm::SlidingWindow});
  Decision first = svc.check("bob", "/login");
  Decision second = svc.check("bob", "/login");
  cout << first.status() << " " << second.status()
            << " retryAfter=" << second.retryAfter << endl;
}
`

const goCode = `// Rate Limiter - medium-level LLD interview reference (Go)
package main

import (
  "fmt"
  "math"
  "sync"
)

type Clock func() float64 // seconds

type Algorithm int

const (
  FixedWindow Algorithm = iota
  SlidingWindow
  TokenBucket
  LeakyBucket
)

func (a Algorithm) String() string {
  return [...]string{"FIXED_WINDOW", "SLIDING_WINDOW", "TOKEN_BUCKET", "LEAKY_BUCKET"}[a]
}

type Rule struct {
  Limit         int
  WindowSeconds float64
  Algorithm     Algorithm
}

type Decision struct {
  Allowed    bool
  Limit      int
  Remaining  int
  RetryAfter float64
}

func (d Decision) Status() int {
  if d.Allowed {
    return 200
  }
  return 429
}

func (d Decision) Headers() map[string]string {
  h := map[string]string{
    "X-RateLimit-Limit":     fmt.Sprint(d.Limit),
    "X-RateLimit-Remaining": fmt.Sprint(d.Remaining),
  }
  if !d.Allowed {
    h["Retry-After"] = fmt.Sprint(int(math.Ceil(d.RetryAfter)))
  }
  return h
}

type RateLimiter interface {
  Allow(clientID string) Decision
}

type windowState struct {
  start float64
  count int
}

// Counter per client per aligned window. Cheap, but allows 2x bursts at a boundary.

type fixedWindow struct {
  mu    sync.Mutex
  rule  Rule
  clock Clock
  state map[string]*windowState
}

func newFixedWindow(r Rule, c Clock) *fixedWindow {
  return &fixedWindow{rule: r, clock: c, state: map[string]*windowState{}}
}

func (f *fixedWindow) Allow(id string) Decision {
  now, w := f.clock(), f.rule.WindowSeconds
  start := math.Floor(now/w) * w
  f.mu.Lock()
  defer f.mu.Unlock()
  st, ok := f.state[id]
  if !ok || st.start != start {
    st = &windowState{start: start}
    f.state[id] = st
  }
  if st.count < f.rule.Limit {
    st.count++
    return Decision{true, f.rule.Limit, f.rule.Limit - st.count, 0}
  }
  return Decision{false, f.rule.Limit, 0, start + w - now}
}

// Log of timestamps per client. Exact, but O(limit) memory per client.

type slidingWindow struct {
  mu    sync.Mutex
  rule  Rule
  clock Clock
  logs  map[string][]float64
}

func newSlidingWindow(r Rule, c Clock) *slidingWindow {
  return &slidingWindow{rule: r, clock: c, logs: map[string][]float64{}}
}

func (s *slidingWindow) Allow(id string) Decision {
  now, w := s.clock(), s.rule.WindowSeconds
  s.mu.Lock()
  defer s.mu.Unlock()
  log := s.logs[id]
  for len(log) > 0 && log[0] <= now-w {
    log = log[1:]
  }
  if len(log) < s.rule.Limit {
    log = append(log, now)
    s.logs[id] = log
    return Decision{true, s.rule.Limit, s.rule.Limit - len(log), 0}
  }
  s.logs[id] = log
  return Decision{false, s.rule.Limit, 0, log[0] + w - now}
}

// Bucket of capacity=limit refilled at limit/window tokens per second. Allows bursts.

type tokenBucket struct {
  mu      sync.Mutex
  rule    Rule
  clock   Clock
  rate    float64
  buckets map[string]*[2]float64 // {tokens, last}
}

func newTokenBucket(r Rule, c Clock) *tokenBucket {
  return &tokenBucket{rule: r, clock: c, rate: float64(r.Limit) / r.WindowSeconds,
    buckets: map[string]*[2]float64{}}
}

func (t *tokenBucket) Allow(id string) Decision {
  now := t.clock()
  t.mu.Lock()
  defer t.mu.Unlock()
  b, ok := t.buckets[id]
  if !ok {
    b = &[2]float64{float64(t.rule.Limit), now}
    t.buckets[id] = b
  }
  b[0] = math.Min(float64(t.rule.Limit), b[0]+(now-b[1])*t.rate)
  b[1] = now
  if b[0] >= 1 {
    b[0]--
    return Decision{true, t.rule.Limit, int(b[0]), 0}
  }
  return Decision{false, t.rule.Limit, 0, (1 - b[0]) / t.rate}
}

// Water level rises by 1 per request and drains at limit/window per second (meter variant).

type leakyBucket struct {
  mu     sync.Mutex
  rule   Rule
  clock  Clock
  rate   float64
  levels map[string]*[2]float64 // {level, last}
}

func newLeakyBucket(r Rule, c Clock) *leakyBucket {
  return &leakyBucket{rule: r, clock: c, rate: float64(r.Limit) / r.WindowSeconds,
    levels: map[string]*[2]float64{}}
}

func (l *leakyBucket) Allow(id string) Decision {
  now := l.clock()
  l.mu.Lock()
  defer l.mu.Unlock()
  s, ok := l.levels[id]
  if !ok {
    s = &[2]float64{0, now}
    l.levels[id] = s
  }
  s[0] = math.Max(0, s[0]-(now-s[1])*l.rate)
  s[1] = now
  limit := float64(l.rule.Limit)
  if s[0]+1 <= limit+1e-9 {
    s[0]++
    return Decision{true, l.rule.Limit, int(limit - s[0] + 1e-9), 0}
  }
  return Decision{false, l.rule.Limit, 0, (s[0] + 1 - limit) / l.rate}
}

func NewLimiter(rule Rule, clock Clock) RateLimiter {
  switch rule.Algorithm {
  case FixedWindow:
    return newFixedWindow(rule, clock)
  case SlidingWindow:
    return newSlidingWindow(rule, clock)
  case TokenBucket:
    return newTokenBucket(rule, clock)
  default:
    return newLeakyBucket(rule, clock)
  }
}

// RateLimitService is the facade: picks the rule for (endpoint, tier) and delegates.

type RateLimitService struct {
  mu          sync.Mutex
  defaultRule Rule
  clock       Clock
  rules       map[string]Rule
  limiters    map[string]RateLimiter
}

func NewRateLimitService(defaultRule Rule, clock Clock) *RateLimitService {
  return &RateLimitService{defaultRule: defaultRule, clock: clock,
    rules: map[string]Rule{}, limiters: map[string]RateLimiter{}}
}

func key(endpoint, tier string) string {
  return endpoint + "|" + tier
}

func (s *RateLimitService) SetRule(endpoint, tier string, rule Rule) {
  s.mu.Lock()
  defer s.mu.Unlock()
  k := key(endpoint, tier)
  s.rules[k] = rule
  delete(s.limiters, k) // next check builds a limiter for the new rule
}

func (s *RateLimitService) Check(clientID, endpoint, tier string) Decision {
  s.mu.Lock()
  k := key(endpoint, tier)
  limiter, ok := s.limiters[k]
  if !ok {
    rule, found := s.rules[k]
    if !found {
      rule = s.defaultRule
    }
    limiter = NewLimiter(rule, s.clock)
    s.limiters[k] = limiter
  }
  s.mu.Unlock()
  return limiter.Allow(clientID)
}

func main() {
  t := 0.0
  clock := func() float64 {
    return t
  }
  for _, algo := range []Algorithm{FixedWindow, SlidingWindow, TokenBucket, LeakyBucket} {
    t = 0
    svc := NewRateLimitService(Rule{3, 10, algo}, clock)
    var results []bool
    for i := 0; i < 4; i++ {
      results = append(results, svc.Check("alice", "/search", "free").Allowed)
    }
    t = 10
    results = append(results, svc.Check("alice", "/search", "free").Allowed)
    fmt.Println(algo, results) // [true true true false true]
  }

  t = 0
  svc := NewRateLimitService(Rule{3, 10, FixedWindow}, clock)
  svc.SetRule("/login", "free", Rule{1, 60, SlidingWindow})
  first := svc.Check("bob", "/login", "free")
  second := svc.Check("bob", "/login", "free")
  fmt.Println(first.Status(), second.Status(), second.Headers())
}
`

const csharp = `// Rate Limiter - medium-level LLD interview reference (C# 10+)
using System;
using System.Collections.Generic;
using System.Linq;

public enum Algorithm { FixedWindow, SlidingWindow, TokenBucket, LeakyBucket }

public sealed record Rule(int Limit, double WindowSeconds, Algorithm Algorithm);

public sealed record Decision(bool Allowed, int Limit, int Remaining, double RetryAfter) {
  public int Status => Allowed ? 200 : 429;
  public Dictionary<string, string> Headers() {
    var h = new Dictionary<string, string> {
      ["X-RateLimit-Limit"] = Limit.ToString(),
      ["X-RateLimit-Remaining"] = Remaining.ToString(),
    };
    if (!Allowed) {
      h["Retry-After"] = ((long)Math.Ceiling(RetryAfter)).ToString();
    }
    return h;
  }
}

public interface IRateLimiter {
  Decision Allow(string clientId);
}

// Counter per client per aligned window. Cheap, but allows 2x bursts at a boundary.
public sealed class FixedWindowLimiter : IRateLimiter {
  private sealed class State { public double Start; public int Count; }
  private readonly Rule _rule;
  private readonly Func<double> _clock;
  private readonly Dictionary<string, State> _state = new();
  private readonly object _gate = new();

  public FixedWindowLimiter(Rule rule, Func<double> clock) {
    _rule = rule; _clock = clock;
  }

  public Decision Allow(string clientId) {
    double now = _clock(), w = _rule.WindowSeconds;
    double start = Math.Floor(now / w) * w;
    lock (_gate) {
      if (!_state.TryGetValue(clientId, out var st) || st.Start != start) {) {
        st = new State { Start = start, Count = 0 };
      }
        _state[clientId] = st;
      }
      if (st.Count < _rule.Limit) {
        st.Count++;
        return new Decision(true, _rule.Limit, _rule.Limit - st.Count, 0);
      }

      return new Decision(false, _rule.Limit, 0, start + w - now);
    }
  }
}

// Log of timestamps per client. Exact, but O(limit) memory per client.
public sealed class SlidingWindowLimiter : IRateLimiter {
  private readonly Rule _rule;
  private readonly Func<double> _clock;
  private readonly Dictionary<string, Queue<double>> _logs = new();
  private readonly object _gate = new();

  public SlidingWindowLimiter(Rule rule, Func<double> clock) {
    _rule = rule; _clock = clock;
  }

  public Decision Allow(string clientId) {
    double now = _clock(), w = _rule.WindowSeconds;
    lock (_gate) {
      if (!_logs.TryGetValue(clientId, out var log)) {
        _logs[clientId] = log = new Queue<double>();
      }
      while (log.Count > 0 && log.Peek() {
        <= now - w) log.Dequeue();
      }
      if (log.Count < _rule.Limit) {
        log.Enqueue(now);
        return new Decision(true, _rule.Limit, _rule.Limit - log.Count, 0);
      }

      return new Decision(false, _rule.Limit, 0, log.Peek() + w - now);
    }
  }
}

// Bucket of capacity=limit refilled at limit/window tokens per second. Allows bursts.
public sealed class TokenBucketLimiter : IRateLimiter {
  private sealed class State { public double Tokens; public double Last; }
  private readonly Rule _rule;
  private readonly Func<double> _clock;
  private readonly double _rate;
  private readonly Dictionary<string, State> _buckets = new();
  private readonly object _gate = new();

  public TokenBucketLimiter(Rule rule, Func<double> clock) {
    _rule = rule; _clock = clock; _rate = rule.Limit / rule.WindowSeconds;
  }

  public Decision Allow(string clientId) {
    double now = _clock();
    lock (_gate) {
      if (!_buckets.TryGetValue(clientId, out var b))
        _buckets[clientId] = b = new State { Tokens = _rule.Limit, Last = now };
      b.Tokens = Math.Min(_rule.Limit, b.Tokens + (now - b.Last) * _rate);
      b.Last = now;
      if (b.Tokens >= 1.0) {
        b.Tokens -= 1.0;
        return new Decision(true, _rule.Limit, (int)b.Tokens, 0);
      }

      return new Decision(false, _rule.Limit, 0, (1.0 - b.Tokens) / _rate);
    }
  }
}

// Water level rises by 1 per request and drains at limit/window per second (meter variant).
public sealed class LeakyBucketLimiter : IRateLimiter {
  private sealed class State { public double Level; public double Last; }
  private readonly Rule _rule;
  private readonly Func<double> _clock;
  private readonly double _rate;
  private readonly Dictionary<string, State> _levels = new();
  private readonly object _gate = new();

  public LeakyBucketLimiter(Rule rule, Func<double> clock) {
    _rule = rule; _clock = clock; _rate = rule.Limit / rule.WindowSeconds;
  }

  public Decision Allow(string clientId) {
    double now = _clock();
    lock (_gate) {
      if (!_levels.TryGetValue(clientId, out var s))
        _levels[clientId] = s = new State { Level = 0, Last = now };
      s.Level = Math.Max(0.0, s.Level - (now - s.Last) * _rate);
      s.Last = now;
      if (s.Level + 1.0 <= _rule.Limit + 1e-9) {
        s.Level += 1.0;
        return new Decision(true, _rule.Limit, (int)(_rule.Limit - s.Level + 1e-9), 0);
      }

      return new Decision(false, _rule.Limit, 0, (s.Level + 1.0 - _rule.Limit) / _rate);
    }
  }
}

public static class LimiterFactory {
  public static IRateLimiter Create(Rule rule, Func<double> clock) => rule.Algorithm switch {
    Algorithm.FixedWindow => new FixedWindowLimiter(rule, clock),
    Algorithm.SlidingWindow => new SlidingWindowLimiter(rule, clock),
    Algorithm.TokenBucket => new TokenBucketLimiter(rule, clock),
    _ => new LeakyBucketLimiter(rule, clock),
  };
}

// Facade: picks the rule for (endpoint, tier) and delegates to that rule's limiter.
public sealed class RateLimitService {
  private readonly Rule _default;
  private readonly Func<double> _clock;
  private readonly Dictionary<string, Rule> _rules = new();
  private readonly Dictionary<string, IRateLimiter> _limiters = new();
  private readonly object _gate = new();

  public RateLimitService(Rule defaultRule, Func<double> clock) {
    _default = defaultRule; _clock = clock;
  }

  private static string Key(string endpoint, string tier) {
    return endpoint + "|" + tier;
  }

  public void SetRule(string endpoint, string tier, Rule rule) {
    lock (_gate) {
      var k = Key(endpoint, tier);
      _rules[k] = rule;
      _limiters.Remove(k); // next check builds a limiter for the new rule
    }
  }

  public Decision Check(string clientId, string endpoint, string tier = "free") {
    IRateLimiter limiter;
    lock (_gate) {
      var k = Key(endpoint, tier);
      if (!_limiters.TryGetValue(k, out limiter!)) {
        limiter = LimiterFactory.Create(_rules.GetValueOrDefault(k, _default), _clock);
        _limiters[k] = limiter;
      }
    }
    return limiter.Allow(clientId);
  }
}

public static class Program {
  public static void Main() {
    double t = 0;
    Func<double> clock = () => t;
    foreach (var algo in Enum.GetValues<Algorithm>()) {
      t = 0;
      var svc = new RateLimitService(new Rule(3, 10.0, algo), clock);
      var results = new List<bool>();
      for (int i = 0; i < 4; i++) {
        results.Add(svc.Check("alice", "/search").Allowed);
      }
      t = 10;
      results.Add(svc.Check("alice", "/search").Allowed);
      Console.WriteLine(algo + " [" + string.Join(", ", results) + "]"); // True, True, True, False, True
    }

    t = 0;
    var svc2 = new RateLimitService(new Rule(3, 10.0, Algorithm.FixedWindow), clock);
    svc2.SetRule("/login", "free", new Rule(1, 60.0, Algorithm.SlidingWindow));
    var first = svc2.Check("bob", "/login");
    var second = svc2.Check("bob", "/login");
    Console.WriteLine(first.Status + " " + second.Status + " Retry-After=" + second.Headers()["Retry-After"]);
  }
}
`

export const rateLimiterSolution: ProblemSolution = {
  slug: 'rate-limiter',
  title: 'Design a Rate Limiter - Complete LLD Guide',
  overview: {
    introduction: [
      'A rate limiter answers one question, thousands of times per second: “should I let this request through right now?” Every public API, login form, and SMS endpoint needs one, because without it a single noisy client - a buggy retry loop or a deliberate attacker - can starve everyone else. In an LLD interview the question is popular because it sits right between object-oriented design and algorithm knowledge: you need clean classes, but you also need to know what a token bucket actually does.',
      'Interviewers are not asking you to build Redis-backed distributed throttling across a fleet of gateways. They want to see whether you can name the common algorithms (fixed window, sliding window log, token bucket, leaky bucket), explain the trade-off of each in a sentence, and - the real design test - put them behind one interface so the rest of the system does not care which one is in use. If you can do that and then handle per-endpoint and per-tier rules plus runtime rule updates, you have covered what the problem is checking.',
      'This tutorial follows the order you should follow in the room: clarify what “limit” means, extract nouns and verbs, notice that the algorithms are interchangeable (the Strategy pattern), design a small façade that routes a request to the correct limiter, draw the UML, and then implement a medium-level but complete version in six languages. Time is injected as a clock so the demos are deterministic - a habit that also makes your tests fast and your interviewer happy.',
      'We stay inside the practice-problem brief: limit requests per client to N per window, return 429 with rate-limit headers when exceeded, support four algorithms, allow different rules per endpoint or tier, and let an admin change rules at runtime. Everything is single-process. We talk about Redis, Lua scripts, and sticky routing only in the follow-ups - that is where they belong.',
    ],
    constraints: [
      'A client is identified by a string id (user id or IP address); limits are tracked per client.',
      'A rule is “limit requests per window seconds” plus a choice of algorithm.',
      'Rules can differ per (endpoint, tier) and can be changed at runtime by an admin.',
      'A denied request returns HTTP 429 and carries X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After.',
      'The check must be fast (target under 5 ms) and thread-safe for many concurrent clients.',
    ],
    assumptions: [
      'Single process, in-memory state. Distributed enforcement is a follow-up discussion, not part of the class design.',
      'Time comes from an injectable Clock returning seconds as a double, so tests never sleep.',
      'Updating a rule for (endpoint, tier) swaps in a fresh limiter, which resets counters for that key. We call this out explicitly so the interviewer knows we chose it.',
      'Token bucket capacity equals the rule limit and refills at limit / window per second; leaky bucket is implemented as a “meter” that admits or rejects (no queue of delayed requests).',
      'Requests that match no custom rule use a default rule given at construction.',
    ],
    clarificationQuestions: [
      {
        question: 'Is the limit per user, per IP, per API key, or global?',
        why: 'It decides the key used for state. We model the key as an opaque clientId so the limiter does not care, but you should still confirm what identifies a caller.',
      },
      {
        question: 'Do we need all four algorithms or one default plus extensibility?',
        why: 'If the interviewer wants all four, Strategy is the headline. If they want one, implement it well and show the interface so others can be added in minutes.',
      },
      {
        question: 'Can bursts be allowed, or must traffic be smooth?',
        why: 'Token bucket tolerates bursts up to capacity; leaky bucket and sliding window are stricter. The answer is how you justify choosing the default algorithm.',
      },
      {
        question: 'Is this one process or a fleet of servers?',
        why: 'Single node means in-memory maps and a lock. Multiple nodes means shared state (Redis) or per-node quotas - a different conversation. State the assumption and move on.',
      },
      {
        question: 'When an admin changes a rule, should existing counters reset?',
        why: 'Resetting is simplest; migrating state across algorithms is hard and often meaningless. We reset and say so.',
      },
      {
        question: 'What should the rejected response contain?',
        why: 'Real clients retry intelligently only if you tell them when. That is why Decision carries remaining and retryAfter, not just a boolean.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'The first two minutes: restate and list the verbs',
        paragraphs: [
          'Restate the problem in one sentence: “Given a client and an endpoint, decide whether to allow the request under a configurable rule, and report how much quota remains.” Then list the verbs: check a request, configure a rule, update a rule at runtime, report quota. Those verbs become the public API of one façade - check and setRule - and everything else hides behind it.',
          'Ask the clarification questions above and write the answers down. Pay special attention to “single node or distributed” and “bursts allowed”. Those two answers pick your algorithm and your concurrency story, and having them written on the board stops the interviewer from changing the rules halfway through.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Say the algorithm trade-offs out loud in one line each: fixed window is cheap but bursty at boundaries; sliding log is exact but memory-heavy; token bucket allows controlled bursts; leaky bucket smooths output. That sentence alone separates you from candidates who only say “use a counter”.',
        },
      },
      {
        heading: 'Understand the four algorithms before you draw anything',
        paragraphs: [
          'Fixed window counts requests inside aligned time buckets, for example 100 per calendar minute. It needs one number and one timestamp per client, which is why it is the cheapest. Its flaw is the boundary: a client can send 100 requests at 12:00:59 and another 100 at 12:01:00, effectively 200 in two seconds.',
          'Sliding window log keeps the timestamp of every accepted request and, on each call, throws away timestamps older than the window. It is exact - it never allows more than the limit in any window-length interval - but it stores up to limit timestamps per client.',
          'Token bucket holds up to capacity tokens that refill at a steady rate; each request spends one. A client that has been idle accumulates a full bucket and may burst, but the long-run rate is bounded by the refill rate. Leaky bucket is the mirror image: requests pour water in, the bucket leaks at a steady rate, and overflow is rejected. Used as a meter (as we do here) it rejects instead of queueing.',
          'Notice what these have in common: the input is a client id plus the current time, the output is allow or deny with some quota information, and each keeps its own per-client state. That shared shape is exactly what an interface captures.',
        ],
      },
      {
        heading: 'From requirements to nouns',
        paragraphs: [
          'Underline the nouns: client, request, endpoint, tier, rule, limit, window, algorithm, decision, header. “Client” and “request” are inputs, not classes. “Rule” is real data: limit, window, algorithm. “Decision” is the answer - allowed or not, remaining, retry-after - and deserves its own small value object so callers do not parse booleans out of log lines.',
          '“Algorithm” is the interesting noun. It has four values today and might have a fifth tomorrow. Whenever a noun is really “a family of interchangeable behaviors”, that is a Strategy: define a RateLimiter interface with allow(clientId) and give each algorithm its own class.',
        ],
        numbered: [
          'Write the single operation every algorithm shares: allow(clientId) → Decision.',
          'Put each algorithm’s per-client state inside that algorithm’s class, not in a shared bag.',
          'Make a Rule value object the only thing needed to construct a limiter.',
          'Add a façade that maps (endpoint, tier) to a rule and a ready-made limiter.',
        ],
      },
      {
        heading: 'Discovering entities and responsibilities',
        paragraphs: [
          'RateLimiter is the interface; FixedWindowLimiter, SlidingWindowLimiter, TokenBucketLimiter, and LeakyBucketLimiter implement it. Each owns a map from clientId to its own state and its own lock. Because state lives inside the limiter, a limiter instance is created per rule - two endpoints with different rules never share counters by accident.',
          'LimiterFactory turns a Rule into the right limiter (a simple switch on Algorithm, the only switch in the system). RateLimitService is the façade the HTTP layer calls: it resolves the rule for (endpoint, tier), lazily builds and caches a limiter for that key, and delegates. Decision carries the verdict and knows how to render the HTTP status and rate-limit headers.',
        ],
      },
      {
        heading: 'Relationships and where state lives',
        paragraphs: [
          'The service aggregates limiters: they are created by the service but have no meaning to anyone else, and they are replaced when a rule changes. The limiters depend on Rule for their parameters and on a Clock for time. Rule associates with Algorithm. Every limiter returns a Decision - a dependency, not ownership.',
          'The subtle design question is where the key goes. Counters are per client, but rules are per (endpoint, tier). We resolve both: the service key picks the limiter, and the clientId picks the state inside it. That two-level lookup is what keeps rule changes cheap - replace one entry in the service map and every client of that endpoint starts fresh on the new rule.',
        ],
      },
      {
        heading: 'Concurrency without overengineering',
        paragraphs: [
          'The bug that interviewers look for is check-then-act: two threads both read count = 99, both decide “under the limit”, and both increment, letting 101 through. Each limiter therefore performs read-modify-write for one client inside a single lock. We use one lock per limiter instance, which is simple and correct; striping locks by client hash is a natural upgrade if contention appears.',
          'The service has its own small lock, held only to look up or create a limiter - never while calling allow. Holding a global lock during the algorithm would serialize every client on every endpoint. In TypeScript the event loop makes each allow call atomic, so no lock is needed; we mention that so it does not look like an omission.',
        ],
        callout: {
          title: 'What “medium level” means here',
          body: 'Four small algorithm classes, one factory, one façade, injectable clock, per-limiter locking, deterministic demo. No Redis, no Lua, no background cleanup threads - but also no pseudo-code placeholders.',
        },
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw RateLimiter in the middle and four implementing classes beneath it with realization arrows. Put RateLimitService on the left with an aggregation arrow to the interface, and LimiterFactory on the right with a dependency arrow. Below the service draw Rule and the Algorithm enum, and below the limiters draw Decision. Then narrate one request end to end.',
        ],
        numbered: [
          'Clarify scope: per-client keys, four algorithms, single process.',
          'Define RateLimiter and Decision first - they are the contract.',
          'Implement the simplest algorithm (fixed window) to prove the contract works.',
          'Add the other three behind the same interface.',
          'Add Rule, Factory, and the façade with runtime setRule.',
          'Discuss locking, then mention distribution only if asked.',
        ],
      },
    ],
    entities: [
      { name: 'RateLimitService', responsibility: 'Façade: resolves rule for (endpoint, tier), caches one limiter per key, delegates allow().', keyMembers: ['check', 'setRule'] },
      { name: 'RateLimiter', responsibility: 'Strategy interface: one decision per call.', keyMembers: ['allow'] },
      { name: 'FixedWindowLimiter', responsibility: 'Counter per aligned window; cheapest, bursty at boundaries.', keyMembers: ['state'] },
      { name: 'SlidingWindowLimiter', responsibility: 'Timestamp log per client; exact, O(limit) memory.', keyMembers: ['logs'] },
      { name: 'TokenBucketLimiter', responsibility: 'Refilling token bucket; allows bounded bursts.', keyMembers: ['buckets', 'refillRate'] },
      { name: 'LeakyBucketLimiter', responsibility: 'Draining level meter; smooth, strict admission.', keyMembers: ['levels', 'leakRate'] },
      { name: 'Rule', responsibility: 'Immutable limit, window, and algorithm choice.', keyMembers: ['limit', 'windowSeconds', 'algorithm'] },
      { name: 'Decision', responsibility: 'Verdict plus quota info; renders status and headers.', keyMembers: ['allowed', 'remaining', 'retryAfter'] },
      { name: 'LimiterFactory', responsibility: 'Maps Algorithm to a concrete limiter.', keyMembers: ['create'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Top row: the façade, the RateLimiter interface, and the factory. Middle row: Rule and the four interchangeable algorithms. Bottom row: Algorithm enum and the Decision returned by every limiter. Spacing follows the 340×260 grid so the four realization arrows fan out cleanly.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Think of the system as a router in front of a set of interchangeable engines. RateLimitService is the router: it never counts anything itself. For each (endpoint, tier) it holds one RateLimiter engine, built from the matching Rule. Each engine owns its own per-client state and thread-safety. Because every engine speaks the same interface and returns the same Decision, adding an algorithm touches the factory and nothing else.',
        ],
      },
      {
        heading: 'Why a limiter instance per rule, not per client',
        paragraphs: [
          'It is tempting to create one limiter object per client. That makes 100,000 objects, each with its own lock, and still leaves you needing a map to find them. Instead, a limiter holds a map of client → small state record. The object count is bounded by the number of rules, and the per-client footprint is a pair of numbers (or a short deque).',
          'It also makes rule updates trivial: dropping the cached limiter for a key discards all of that key’s client state at once. If you needed to preserve counters across a rule change you would add an explicit migrate step; for the interview, resetting is defensible and easy to explain.',
        ],
      },
      {
        heading: 'How each algorithm uses the clock',
        paragraphs: [
          'Fixed window computes windowStart = floor(now / window) × window and resets the count when it sees a different start. Sliding window evicts timestamps at or before now − window, then compares the log size to the limit. Token bucket adds (now − last) × rate tokens, capped at capacity, then spends one. Leaky bucket subtracts (now − last) × rate from the level, floors at zero, then tries to add one.',
          'All four are lazy: nothing runs in the background. Tokens refill and water leaks only when a request arrives, using elapsed time. That is why a fake clock makes the demos exact, and why there are no timer threads to shut down.',
        ],
      },
      {
        heading: 'Decision as a first-class object',
        paragraphs: [
          'Returning a bare boolean forces the caller to guess how to build the 429 response. Decision carries allowed, limit, remaining, and retryAfter. status() maps to 200 or 429, and headers() produces X-RateLimit-Limit, X-RateLimit-Remaining, and, when denied, Retry-After. The HTTP layer becomes a three-line adapter.',
          'Each algorithm computes retryAfter from its own state: the time until the window rolls (fixed), until the oldest log entry expires (sliding), until one token accrues (token bucket), or until enough water drains (leaky bucket). That is the detail that makes the answer feel production-minded.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not add background eviction of idle clients; mention an LRU or TTL sweep as a follow-up for memory. We did not build a distributed counter. We did not implement queueing leaky bucket (which delays requests). We did not add composite rules such as “10 per second and 1000 per hour”; that is a list of limiters AND-ed together, a one-paragraph extension.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'RateLimitService', responsibility: 'Resolve rule, cache limiter, delegate; swap limiter on rule change.', keyMembers: ['check', 'setRule', 'key'] },
      { name: 'RateLimiter implementations', responsibility: 'Own per-client state and the allow/deny math for one algorithm.', keyMembers: ['allow'] },
      { name: 'LimiterFactory', responsibility: 'Single switch on Algorithm.', keyMembers: ['create'] },
      { name: 'Rule', responsibility: 'Immutable configuration value.', keyMembers: ['limit', 'windowSeconds'] },
      { name: 'Decision', responsibility: 'Verdict, quota, retry hint, HTTP rendering.', keyMembers: ['status', 'headers'] },
    ],
    patterns: [
      {
        name: 'Strategy',
        why: 'Algorithms are interchangeable behaviors selected by configuration, and new ones will be requested.',
        howApplied: 'RateLimiter.allow(clientId) with four implementations. RateLimitService depends only on the interface.',
      },
      {
        name: 'Factory (simple)',
        why: 'Keeps the one switch on Algorithm out of the façade.',
        howApplied: 'LimiterFactory.create(rule, clock) returns the right RateLimiter.',
      },
      {
        name: 'Façade',
        why: 'The HTTP layer should call one method and not know about rules, limiters, or keys.',
        howApplied: 'RateLimitService.check(clientId, endpoint, tier).',
      },
    ],
    decisions: [
      {
        decision: 'One lock per limiter instance.',
        rationale: 'Makes check-then-act atomic for a client and keeps different endpoints from blocking each other.',
        alternativeRejected: 'One global lock - trivially correct but serializes all traffic.',
        tradeoff: 'Clients of the same limiter still contend; stripe locks by client hash if profiling demands.',
      },
      {
        decision: 'Inject a Clock instead of calling the system time inside limiters.',
        rationale: 'Deterministic tests, instant demos, and no sleeping.',
        alternativeRejected: 'Calling now() directly - simpler signatures but untestable without real waits.',
        tradeoff: 'One extra constructor parameter.',
      },
      {
        decision: 'Reset counters when a rule changes.',
        rationale: 'Converting state between algorithms is ill-defined; a clean slate is predictable.',
        alternativeRejected: 'Migrating counters - only meaningful when the algorithm stays the same.',
        tradeoff: 'A client can briefly get a fresh quota right after an admin edit.',
      },
      {
        decision: 'Leaky bucket as a meter, not a queue.',
        rationale: 'The brief asks for allow/deny. A queueing version needs workers and delayed responses.',
        alternativeRejected: 'Queue plus drain thread - correct for traffic shaping, overbuilt for this question.',
        tradeoff: 'Behaves much like token bucket with no burst credit; we say so in the follow-ups.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: each limiter does one algorithm; the service routes; Decision formats. A change to HTTP headers touches Decision only.',
        'Open/Closed: adding a GCRA or sliding-window-counter limiter means a new class and one factory line - RateLimitService is untouched.',
        'Liskov Substitution: every limiter must honor the same contract - never allow more than its rule, always return a non-negative retryAfter on denial. Any limiter can replace another in the service.',
        'Interface Segregation: RateLimiter has one method. Rule updates and admin concerns live on the service, not the limiter.',
        'Dependency Inversion: the service depends on RateLimiter and Clock abstractions, so tests pass a fake clock and even a stub limiter.',
      ],
    },
    extensibility: [
      'Add a new algorithm: implement RateLimiter, add an enum value, add a factory case.',
      'Add composite rules (per-second AND per-hour): a CompositeLimiter holding a list of limiters and returning the strictest denial.',
      'Go distributed: keep the same RateLimiter interface but back state with Redis and an atomic Lua script, or give each node a fraction of the quota.',
      'Add idle-client eviction: a periodic sweep or an LRU cache replacing the per-client maps.',
    ],
  },
  implementationIntro: [
    'Each implementation contains the same pieces: Rule, Decision, the RateLimiter interface, four algorithms, a factory, the façade, and a demo driven by a fake clock. The demo prints the same pattern for every algorithm - three allowed, one denied, then allowed again after the window has passed - and then shows a per-endpoint rule with a 429 and Retry-After.',
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
      'Alice calls /search three times with a default rule of 3 requests per 10 seconds. The service computes the key “/search|free”, finds no limiter, builds one from the default rule, and stores it. The first three calls pass; the fourth returns a Decision with allowed = false, remaining = 0, and a retryAfter derived from that algorithm’s state.',
      'Ten fake seconds later Alice calls again. A fixed-window limiter sees a new window start and resets; sliding window evicts the old timestamps; token bucket has refilled three tokens; leaky bucket has drained to empty. All four allow the request, so the demo prints the same result for every algorithm even though the internals differ.',
      'For /login the admin has called setRule with one request per 60 seconds. That removes the cached limiter, so Bob’s next call builds a sliding-window limiter from the new rule. His first call is allowed; his second is rejected with status 429 and a Retry-After of 60.',
    ],
    steps: [
      'Build the service with a default Rule and a Clock.',
      'check(clientId, endpoint, tier): compute key, look up or create the limiter under the service lock.',
      'Release the service lock, then call limiter.allow(clientId).',
      'The limiter locks, updates that client’s state from the clock, and returns a Decision.',
      'The caller maps decision.status and decision.headers into the HTTP response.',
      'setRule replaces the rule and drops the cached limiter so the next check uses the new rule.',
    ],
    examples: [
      {
        title: 'Burst then wait (all algorithms)',
        input: 'limit=3, window=10s; four calls at t=0, one call at t=10',
        output: '[allowed, allowed, allowed, denied, allowed]',
        explanation: 'The fourth call exceeds the quota. At t=10 the window rolled, the log expired, the bucket refilled, or the level drained, depending on algorithm.',
      },
      {
        title: 'Strict login rule',
        input: 'setRule("/login", "free", 1 per 60s sliding); bob calls twice',
        output: '200 then 429 with Retry-After: 60',
        explanation: 'The second call finds one timestamp in the window. retryAfter equals the oldest timestamp plus the window minus now.',
      },
      {
        title: 'Fixed window boundary burst',
        input: 'limit=3, window=10s; 3 calls at t=9.9, 3 calls at t=10.0',
        output: 'All six allowed',
        explanation: 'Two different aligned windows, so the counter resets. This is the weakness that motivates sliding window and token bucket.',
      },
    ],
  },
  followUps: [
    {
      question: 'Which algorithm would you choose by default, and why?',
      answer: 'Token bucket for most public APIs: it is cheap (two numbers per client), it allows short bursts that real users produce, and the long-run rate is strictly bounded. Choose sliding window log when the limit must be exact in every interval and the limit is small (for example login attempts). Fixed window is acceptable for coarse quotas where boundary bursts do not matter. Leaky bucket is the choice when downstream wants a smooth rate.',
    },
    {
      question: 'How do you make this work across many servers?',
      answer: 'Keep the RateLimiter interface and move the state to a shared store such as Redis. The check-then-update must be atomic, so use a Lua script or an atomic increment-and-expire for fixed window and a script for token bucket. An alternative is to give each node a slice of the quota and accept some inaccuracy. Mention the cost: every check becomes a network round trip, so you cache or batch for very hot paths.',
    },
    {
      question: 'What is the memory cost for 100,000 clients?',
      answer: 'Fixed window, token bucket, and leaky bucket store a couple of numbers per client, so a few megabytes at most. Sliding window log stores up to limit timestamps per client, which can be much larger. Add eviction for idle clients (TTL or LRU) so memory tracks active clients, not every client ever seen.',
    },
    {
      question: 'How would you allow different limits per tier without a new class per tier?',
      answer: 'Tiers are data, not types. The service already keys limiters by (endpoint, tier) and looks up a Rule for each. Adding “premium” means calling setRule for that tier. Only introduce a new class if the algorithm itself differs.',
    },
    {
      question: 'What race conditions exist and how are they handled?',
      answer: 'The classic one is check-then-act on the counter, which we avoid by doing read, compare, and update inside one critical section per limiter. The second is limiter creation: two threads could both build a limiter for the same key, so creation happens under the service lock. We release that lock before calling allow so the service never becomes a bottleneck.',
    },
    {
      question: 'How would you add a rule such as 10 per second and 1000 per hour?',
      answer: 'Create a CompositeLimiter that implements RateLimiter and holds a list of limiters. It calls each; if any denies, the composite denies and returns the largest retryAfter. You may need to roll back tokens already spent from the first limiter, or check without consuming and then commit - mention both and pick the simpler one.',
    },
    {
      question: 'Token bucket vs leaky bucket - are they the same?',
      answer: 'As meters they are mathematically equivalent: a token bucket with capacity C refilling at R is the mirror of a leaky bucket with level L draining at R. The difference is intent. A classic leaky bucket queues requests and releases them at a constant rate (traffic shaping); a token bucket lets bursts through up to capacity (policing). In this design both are policing meters.',
    },
    {
      question: 'How do you test this?',
      answer: 'Inject a fake clock and write deterministic table tests: N allowed then denied, advance time, allowed again. Test the fixed-window boundary burst explicitly. Test retryAfter values. For concurrency, start many threads against one client with limit L and assert exactly L succeed.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Clock going backwards (NTP adjustments) can produce negative elapsed time; clamp elapsed to zero or use a monotonic clock. A window or rate of zero would divide by zero, so validate the Rule at construction. A limit of zero should deny everything, which is a valid configuration.',
      ],
      bullets: [
        'First request from an unknown client starts with a full bucket or empty log.',
        'Rule update while requests are in flight: in-flight calls finish against the old limiter.',
        'Floating-point drift in leaky/token bucket: we use a small epsilon so exact boundaries behave predictably.',
        'Very large client ids or high-cardinality keys: add eviction.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'The most common mistake is one class with if/else on the algorithm name inside check. It works for ten minutes and then every new algorithm edits the same method. The second is forgetting atomicity: reading the counter, deciding, and writing in separate steps. The third is calling the real clock inside the algorithm so nothing can be tested without sleeping. The fourth is returning only a boolean and leaving the HTTP layer to invent a Retry-After.',
      ],
    },
    complexity: [
      'Fixed window, token bucket, leaky bucket: O(1) time and O(1) memory per client per check.',
      'Sliding window log: amortized O(1) time (each timestamp is added and removed once) and O(limit) memory per client.',
      'Service lookup: O(1) hash lookups for the key and the client.',
    ],
    testing: {
      paragraphs: [
        'Prefer deterministic unit tests with a fake clock over timing-based tests. Cover the contract once per algorithm and share the test body.',
      ],
      numbered: [
        'N allowed, N+1 denied, advance one window, allowed again - for every algorithm.',
        'Boundary burst for fixed window (3 at 9.9s, 3 at 10.0s).',
        'retryAfter is positive on denial and zero on success.',
        'Different clients do not share counters.',
        'setRule changes behavior for the next call.',
        'Concurrent callers against limit L produce exactly L successes.',
      ],
    },
    extensions: [
      'Composite rules (multiple windows).',
      'Distributed backend (Redis plus Lua).',
      'Idle-client eviction.',
      'GCRA or sliding-window-counter algorithm.',
      'Metrics: allowed and denied counts per rule.',
    ],
    takeaways: [
      'Put the algorithms behind one RateLimiter interface - that is the Strategy pattern doing real work.',
      'Return a Decision, not a boolean, so callers get status, remaining quota, and retry hints.',
      'Make read-modify-write atomic per client; never hold a global lock while counting.',
      'Inject the clock so every behavior is testable without sleeping.',
      'Mention distribution and eviction as follow-ups after the single-node design works.',
    ],
  },
}
