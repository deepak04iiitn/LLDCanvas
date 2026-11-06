import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('svc', 'RateLimitService', 40, 30, [
    attr('-', 'defaultRule', 'Rule'),
    attr('-', 'rules', 'Map<string, Rule>'),
    attr('-', 'limiters', 'Map<string, RateLimiter>'),
    attr('-', 'clock', 'Clock'),
  ], [
    method('+', 'RateLimitService', 'defaultRule, clock', '', { isConstructor: true }),
    method('+', 'check', 'clientId, endpoint, tier', 'Decision'),
    method('+', 'setRule', 'endpoint, tier, rule: Rule', 'void'),
    method('-', 'resolveKey', 'endpoint, tier', 'string'),
  ], 'facade'),
  iface('rl', 'RateLimiter', 480, 30, [
    method('+', 'allow', 'clientId: string', 'Decision'),
  ]),
  cls('fac', 'LimiterFactory', 860, 30, [], [
    method('+', 'create', 'rule: Rule, clock: Clock', 'RateLimiter', { isStatic: true }),
  ]),
  cls('fw', 'FixedWindowLimiter', 40, 330, [
    attr('-', 'state', 'Map<client, (windowStart, count)>'),
  ], [
    method('+', 'allow', 'clientId', 'Decision'),
  ]),
  cls('sw', 'SlidingWindowLimiter', 340, 330, [
    attr('-', 'logs', 'Map<client, Deque<timestamp>>'),
  ], [
    method('+', 'allow', 'clientId', 'Decision'),
  ]),
  cls('tb', 'TokenBucketLimiter', 640, 330, [
    attr('-', 'buckets', 'Map<client, (tokens, last)>'),
    attr('-', 'refillRate', 'double'),
  ], [
    method('+', 'allow', 'clientId', 'Decision'),
  ]),
  cls('lb', 'LeakyBucketLimiter', 940, 330, [
    attr('-', 'levels', 'Map<client, (level, last)>'),
    attr('-', 'leakRate', 'double'),
  ], [
    method('+', 'allow', 'clientId', 'Decision'),
  ]),
  cls('rule', 'Rule', 40, 600, [
    attr('-', 'limit', 'int'),
    attr('-', 'windowSeconds', 'double'),
    attr('-', 'algorithm', 'Algorithm'),
  ], []),
  enm('alg', 'Algorithm', 340, 600, ['FIXED_WINDOW', 'SLIDING_WINDOW', 'TOKEN_BUCKET', 'LEAKY_BUCKET']),
  cls('dec', 'Decision', 640, 600, [
    attr('-', 'allowed', 'bool'),
    attr('-', 'limit', 'int'),
    attr('-', 'remaining', 'int'),
    attr('-', 'resetAfter', 'double'),
    attr('-', 'retryAfter', 'double'),
  ], [
    method('+', 'status', '', 'int'),
    method('+', 'headers', '', 'Map<string, string>'),
  ]),
]

const edges = [
  edge('e1', 'svc', 'rl', 'aggregation', 'right', 'left', { label: 'routes to', targetMultiplicity: '0..*' }),
  edge('e2', 'fw', 'rl', 'realization', 'top', 'bottom'),
  edge('e3', 'sw', 'rl', 'realization', 'top', 'bottom'),
  edge('e4', 'tb', 'rl', 'realization', 'top', 'bottom'),
  edge('e5', 'lb', 'rl', 'realization', 'top', 'bottom'),
  edge('e6', 'svc', 'rule', 'association', 'bottom', 'top', { label: 'resolves', targetMultiplicity: '0..*' }),
  edge('e7', 'svc', 'fac', 'dependency', 'right@90', 'bottom', { label: 'builds via' }),
  edge('e8', 'fac', 'rl', 'dependency', 'left', 'right'),
  edge('e9', 'rule', 'alg', 'association', 'right', 'left'),
  edge('e10', 'tb', 'dec', 'dependency', 'bottom', 'top', { label: 'returns' }),
]

const py = `from __future__ import annotations
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
    algorithm: Algorithm = Algorithm.FIXED_WINDOW


@dataclass(frozen=True)
class Decision:
    allowed: bool
    limit: int
    remaining: int
    reset_after: float              # seconds until the quota is fully restored / window rolls
    retry_after: float = 0.0        # seconds until the next request would be admitted

    @property
    def status(self) -> int:
        return 200 if self.allowed else 429

    def headers(self) -> Dict[str, str]:
        h = {
            "X-RateLimit-Limit": str(self.limit),
            "X-RateLimit-Remaining": str(self.remaining),
            "X-RateLimit-Reset": str(math.ceil(self.reset_after)),
        }
        if not self.allowed:
            h["Retry-After"] = str(max(1, math.ceil(self.retry_after)))
        return h


class RateLimiter(ABC):
    """Strategy: one algorithm bound to one Rule. State is kept per client."""

    @abstractmethod
    def allow(self, client_id: str) -> Decision: ...


class _BaseLimiter(RateLimiter):
    def __init__(self, rule: Rule, clock: Clock):
        if rule.limit <= 0 or rule.window_seconds <= 0:
            raise ValueError("limit and window must be positive")
        self.rule = rule
        self._clock = clock
        self._lock = Lock()  # coarse per-limiter lock; shard by client for more throughput

    def allow(self, client_id: str) -> Decision:
        with self._lock:
            return self._allow(client_id, self._clock())

    @abstractmethod
    def _allow(self, client_id: str, now: float) -> Decision: ...


class FixedWindowLimiter(_BaseLimiter):
    """Counter per aligned window. O(1) memory per client, but allows 2N bursts at a boundary."""

    def __init__(self, rule: Rule, clock: Clock):
        super().__init__(rule, clock)
        self._state: Dict[str, list] = {}  # client -> [window_start, count]

    def _allow(self, client_id: str, now: float) -> Decision:
        w, limit = self.rule.window_seconds, self.rule.limit
        start = math.floor(now / w) * w
        st = self._state.get(client_id)
        if st is None or st[0] != start:
            st = [start, 0]
            self._state[client_id] = st
        reset = start + w - now
        if st[1] < limit:
            st[1] += 1
            return Decision(True, limit, limit - st[1], reset)
        return Decision(False, limit, 0, reset, retry_after=reset)


class SlidingWindowLimiter(_BaseLimiter):
    """Sliding log: exact, no boundary burst, O(N) memory per client."""

    def __init__(self, rule: Rule, clock: Clock):
        super().__init__(rule, clock)
        self._logs: Dict[str, Deque[float]] = {}

    def _allow(self, client_id: str, now: float) -> Decision:
        w, limit = self.rule.window_seconds, self.rule.limit
        log = self._logs.setdefault(client_id, deque())
        while log and log[0] <= now - w:
            log.popleft()
        if len(log) < limit:
            log.append(now)
            return Decision(True, limit, limit - len(log), log[0] + w - now)
        retry = log[0] + w - now
        return Decision(False, limit, 0, retry, retry_after=retry)


class TokenBucketLimiter(_BaseLimiter):
    """Capacity = limit, refills limit/window tokens per second. Allows short bursts."""

    def __init__(self, rule: Rule, clock: Clock):
        super().__init__(rule, clock)
        self._rate = rule.limit / rule.window_seconds
        self._buckets: Dict[str, Tuple[float, float]] = {}  # client -> (tokens, last_ts)

    def _allow(self, client_id: str, now: float) -> Decision:
        limit = self.rule.limit
        tokens, last = self._buckets.get(client_id, (float(limit), now))
        tokens = min(float(limit), tokens + (now - last) * self._rate)
        if tokens >= 1.0:
            tokens -= 1.0
            self._buckets[client_id] = (tokens, now)
            return Decision(True, limit, int(tokens + 1e-9), (limit - tokens) / self._rate)
        self._buckets[client_id] = (tokens, now)
        retry = (1.0 - tokens) / self._rate
        return Decision(False, limit, 0, retry, retry_after=retry)


class LeakyBucketLimiter(_BaseLimiter):
    """Leaky bucket as a meter: each request adds 1, level drains at limit/window per second."""

    def __init__(self, rule: Rule, clock: Clock):
        super().__init__(rule, clock)
        self._rate = rule.limit / rule.window_seconds
        self._levels: Dict[str, Tuple[float, float]] = {}  # client -> (level, last_ts)

    def _allow(self, client_id: str, now: float) -> Decision:
        limit = self.rule.limit
        level, last = self._levels.get(client_id, (0.0, now))
        level = max(0.0, level - (now - last) * self._rate)
        if level + 1.0 <= limit:
            level += 1.0
            self._levels[client_id] = (level, now)
            return Decision(True, limit, int(limit - level + 1e-9), level / self._rate)
        self._levels[client_id] = (level, now)
        retry = (level + 1.0 - limit) / self._rate
        return Decision(False, limit, 0, level / self._rate, retry_after=retry)


class LimiterFactory:
    _BUILDERS = {
        Algorithm.FIXED_WINDOW: FixedWindowLimiter,
        Algorithm.SLIDING_WINDOW: SlidingWindowLimiter,
        Algorithm.TOKEN_BUCKET: TokenBucketLimiter,
        Algorithm.LEAKY_BUCKET: LeakyBucketLimiter,
    }

    @staticmethod
    def create(rule: Rule, clock: Clock) -> RateLimiter:
        return LimiterFactory._BUILDERS[rule.algorithm](rule, clock)


class RateLimitService:
    """Resolves the most specific rule for (endpoint, tier) and delegates to its limiter.

    Precedence: (endpoint, tier) > (endpoint, *) > (*, tier) > (*, *) default.
    Counters are kept per client AND per endpoint.
    """

    def __init__(self, default_rule: Rule, clock: Clock = time.monotonic):
        self._default = default_rule
        self._clock = clock
        self._rules: Dict[str, Rule] = {}
        self._limiters: Dict[str, RateLimiter] = {}
        self._lock = Lock()

    def set_rule(self, endpoint: str, tier: str, rule: Rule) -> None:
        """Runtime update: new requests use the new rule immediately; that rule's counters restart."""
        with self._lock:
            key = f"{endpoint}|{tier}"
            self._rules[key] = rule
            self._limiters.pop(key, None)

    def check(self, client_id: str, endpoint: str = "*", tier: str = "*") -> Decision:
        with self._lock:
            key = self._resolve_key(endpoint, tier)
            limiter = self._limiters.get(key)
            if limiter is None:
                limiter = LimiterFactory.create(self._rules.get(key, self._default), self._clock)
                self._limiters[key] = limiter
        return limiter.allow(f"{client_id}|{endpoint}")

    def _resolve_key(self, endpoint: str, tier: str) -> str:
        for key in (f"{endpoint}|{tier}", f"{endpoint}|*", f"*|{tier}"):
            if key in self._rules:
                return key
        return "*|*"


def demo() -> None:
    now = [0.0]
    svc = RateLimitService(Rule(3, 10, Algorithm.FIXED_WINDOW), clock=lambda: now[0])
    svc.set_rule("/search", "pro", Rule(5, 10, Algorithm.TOKEN_BUCKET))
    for i in range(4):
        d = svc.check("alice", "/home", "free")
        print(i + 1, d.status, d.headers())
    now[0] = 10.0
    print("after window:", svc.check("alice", "/home", "free").status)


if __name__ == "__main__":
    demo()
`

const java = `import java.util.*;
import java.util.function.DoubleSupplier;

enum Algorithm { FIXED_WINDOW, SLIDING_WINDOW, TOKEN_BUCKET, LEAKY_BUCKET }

record Rule(int limit, double windowSeconds, Algorithm algorithm) {
  Rule {
    if (limit <= 0 || windowSeconds <= 0) throw new IllegalArgumentException("limit/window must be positive");
  }
}

record Decision(boolean allowed, int limit, int remaining, double resetAfter, double retryAfter) {
  int status() { return allowed ? 200 : 429; }
  Map<String, String> headers() {
    Map<String, String> h = new LinkedHashMap<>();
    h.put("X-RateLimit-Limit", String.valueOf(limit));
    h.put("X-RateLimit-Remaining", String.valueOf(remaining));
    h.put("X-RateLimit-Reset", String.valueOf((long) Math.ceil(resetAfter)));
    if (!allowed) h.put("Retry-After", String.valueOf(Math.max(1L, (long) Math.ceil(retryAfter))));
    return h;
  }
}

interface RateLimiter {
  Decision allow(String clientId);
}

abstract class BaseLimiter implements RateLimiter {
  protected final Rule rule;
  private final DoubleSupplier clock;
  protected BaseLimiter(Rule rule, DoubleSupplier clock) { this.rule = rule; this.clock = clock; }
  @Override public synchronized Decision allow(String clientId) {
    return doAllow(clientId, clock.getAsDouble());
  }
  protected abstract Decision doAllow(String clientId, double now);
}

class FixedWindowLimiter extends BaseLimiter {
  private final Map<String, double[]> state = new HashMap<>(); // {windowStart, count}
  FixedWindowLimiter(Rule r, DoubleSupplier c) { super(r, c); }
  @Override protected Decision doAllow(String id, double now) {
    double w = rule.windowSeconds();
    double start = Math.floor(now / w) * w;
    double[] st = state.get(id);
    if (st == null || st[0] != start) { st = new double[]{start, 0}; state.put(id, st); }
    double reset = start + w - now;
    if (st[1] < rule.limit()) {
      st[1]++;
      return new Decision(true, rule.limit(), rule.limit() - (int) st[1], reset, 0);
    }
    return new Decision(false, rule.limit(), 0, reset, reset);
  }
}

class SlidingWindowLimiter extends BaseLimiter {
  private final Map<String, ArrayDeque<Double>> logs = new HashMap<>();
  SlidingWindowLimiter(Rule r, DoubleSupplier c) { super(r, c); }
  @Override protected Decision doAllow(String id, double now) {
    double w = rule.windowSeconds();
    ArrayDeque<Double> log = logs.computeIfAbsent(id, k -> new ArrayDeque<>());
    while (!log.isEmpty() && log.peekFirst() <= now - w) log.pollFirst();
    if (log.size() < rule.limit()) {
      log.addLast(now);
      return new Decision(true, rule.limit(), rule.limit() - log.size(), log.peekFirst() + w - now, 0);
    }
    double retry = log.peekFirst() + w - now;
    return new Decision(false, rule.limit(), 0, retry, retry);
  }
}

class TokenBucketLimiter extends BaseLimiter {
  private final double rate;
  private final Map<String, double[]> buckets = new HashMap<>(); // {tokens, lastTs}
  TokenBucketLimiter(Rule r, DoubleSupplier c) { super(r, c); rate = r.limit() / r.windowSeconds(); }
  @Override protected Decision doAllow(String id, double now) {
    int limit = rule.limit();
    double[] b = buckets.computeIfAbsent(id, k -> new double[]{limit, now});
    b[0] = Math.min(limit, b[0] + (now - b[1]) * rate);
    b[1] = now;
    if (b[0] >= 1.0) {
      b[0] -= 1.0;
      return new Decision(true, limit, (int) (b[0] + 1e-9), (limit - b[0]) / rate, 0);
    }
    double retry = (1.0 - b[0]) / rate;
    return new Decision(false, limit, 0, retry, retry);
  }
}

class LeakyBucketLimiter extends BaseLimiter {
  private final double rate;
  private final Map<String, double[]> levels = new HashMap<>(); // {level, lastTs}
  LeakyBucketLimiter(Rule r, DoubleSupplier c) { super(r, c); rate = r.limit() / r.windowSeconds(); }
  @Override protected Decision doAllow(String id, double now) {
    int limit = rule.limit();
    double[] s = levels.computeIfAbsent(id, k -> new double[]{0, now});
    s[0] = Math.max(0, s[0] - (now - s[1]) * rate);
    s[1] = now;
    if (s[0] + 1.0 <= limit) {
      s[0] += 1.0;
      return new Decision(true, limit, (int) (limit - s[0] + 1e-9), s[0] / rate, 0);
    }
    return new Decision(false, limit, 0, s[0] / rate, (s[0] + 1.0 - limit) / rate);
  }
}

final class LimiterFactory {
  private LimiterFactory() {}
  static RateLimiter create(Rule r, DoubleSupplier clock) {
    return switch (r.algorithm()) {
      case FIXED_WINDOW -> new FixedWindowLimiter(r, clock);
      case SLIDING_WINDOW -> new SlidingWindowLimiter(r, clock);
      case TOKEN_BUCKET -> new TokenBucketLimiter(r, clock);
      case LEAKY_BUCKET -> new LeakyBucketLimiter(r, clock);
    };
  }
}

/** Precedence: (endpoint,tier) > (endpoint,*) > (*,tier) > (*,*). Counters per client per endpoint. */
class RateLimitService {
  private final Rule defaultRule;
  private final DoubleSupplier clock;
  private final Map<String, Rule> rules = new HashMap<>();
  private final Map<String, RateLimiter> limiters = new HashMap<>();

  RateLimitService(Rule defaultRule, DoubleSupplier clock) { this.defaultRule = defaultRule; this.clock = clock; }
  RateLimitService(Rule defaultRule) { this(defaultRule, () -> System.nanoTime() / 1e9); }

  synchronized void setRule(String endpoint, String tier, Rule rule) {
    String key = endpoint + "|" + tier;
    rules.put(key, rule);
    limiters.remove(key); // new rule takes effect on the next request; its counters restart
  }

  Decision check(String clientId, String endpoint, String tier) {
    RateLimiter limiter;
    synchronized (this) {
      String key = resolveKey(endpoint, tier);
      limiter = limiters.computeIfAbsent(key,
          k -> LimiterFactory.create(rules.getOrDefault(k, defaultRule), clock));
    }
    return limiter.allow(clientId + "|" + endpoint);
  }

  private String resolveKey(String endpoint, String tier) {
    for (String k : new String[]{endpoint + "|" + tier, endpoint + "|*", "*|" + tier}) {
      if (rules.containsKey(k)) return k;
    }
    return "*|*";
  }
}
`

const ts = `type Clock = () => number // seconds
type Algorithm = 'FIXED_WINDOW' | 'SLIDING_WINDOW' | 'TOKEN_BUCKET' | 'LEAKY_BUCKET'

interface Rule { limit: number; windowSeconds: number; algorithm: Algorithm }

class Decision {
  constructor(
    public readonly allowed: boolean,
    public readonly limit: number,
    public readonly remaining: number,
    public readonly resetAfter: number,
    public readonly retryAfter = 0,
  ) {}
  get status() { return this.allowed ? 200 : 429 }
  headers(): Record<string, string> {
    const h: Record<string, string> = {
      'X-RateLimit-Limit': String(this.limit),
      'X-RateLimit-Remaining': String(this.remaining),
      'X-RateLimit-Reset': String(Math.ceil(this.resetAfter)),
    }
    if (!this.allowed) h['Retry-After'] = String(Math.max(1, Math.ceil(this.retryAfter)))
    return h
  }
}

interface RateLimiter { allow(clientId: string): Decision }

// JS is single-threaded per event loop, so no locks are needed here.
abstract class BaseLimiter implements RateLimiter {
  constructor(protected readonly rule: Rule, protected readonly clock: Clock) {
    if (rule.limit <= 0 || rule.windowSeconds <= 0) throw new Error('limit/window must be positive')
  }
  allow(clientId: string): Decision { return this.doAllow(clientId, this.clock()) }
  protected abstract doAllow(clientId: string, now: number): Decision
}

class FixedWindowLimiter extends BaseLimiter {
  private state = new Map<string, { start: number; count: number }>()
  protected doAllow(id: string, now: number): Decision {
    const { limit, windowSeconds: w } = this.rule
    const start = Math.floor(now / w) * w
    let st = this.state.get(id)
    if (!st || st.start !== start) { st = { start, count: 0 }; this.state.set(id, st) }
    const reset = start + w - now
    if (st.count < limit) {
      st.count++
      return new Decision(true, limit, limit - st.count, reset)
    }
    return new Decision(false, limit, 0, reset, reset)
  }
}

class SlidingWindowLimiter extends BaseLimiter {
  private logs = new Map<string, number[]>()
  protected doAllow(id: string, now: number): Decision {
    const { limit, windowSeconds: w } = this.rule
    const log = this.logs.get(id) ?? []
    this.logs.set(id, log)
    while (log.length && log[0] <= now - w) log.shift() // use a ring buffer in production
    if (log.length < limit) {
      log.push(now)
      return new Decision(true, limit, limit - log.length, log[0] + w - now)
    }
    const retry = log[0] + w - now
    return new Decision(false, limit, 0, retry, retry)
  }
}

class TokenBucketLimiter extends BaseLimiter {
  private rate = this.rule.limit / this.rule.windowSeconds
  private buckets = new Map<string, { tokens: number; last: number }>()
  protected doAllow(id: string, now: number): Decision {
    const { limit } = this.rule
    const b = this.buckets.get(id) ?? { tokens: limit, last: now }
    this.buckets.set(id, b)
    b.tokens = Math.min(limit, b.tokens + (now - b.last) * this.rate)
    b.last = now
    if (b.tokens >= 1) {
      b.tokens -= 1
      return new Decision(true, limit, Math.floor(b.tokens + 1e-9), (limit - b.tokens) / this.rate)
    }
    const retry = (1 - b.tokens) / this.rate
    return new Decision(false, limit, 0, retry, retry)
  }
}

class LeakyBucketLimiter extends BaseLimiter {
  private rate = this.rule.limit / this.rule.windowSeconds
  private levels = new Map<string, { level: number; last: number }>()
  protected doAllow(id: string, now: number): Decision {
    const { limit } = this.rule
    const s = this.levels.get(id) ?? { level: 0, last: now }
    this.levels.set(id, s)
    s.level = Math.max(0, s.level - (now - s.last) * this.rate)
    s.last = now
    if (s.level + 1 <= limit) {
      s.level += 1
      return new Decision(true, limit, Math.floor(limit - s.level + 1e-9), s.level / this.rate)
    }
    return new Decision(false, limit, 0, s.level / this.rate, (s.level + 1 - limit) / this.rate)
  }
}

const LimiterFactory = {
  create(rule: Rule, clock: Clock): RateLimiter {
    switch (rule.algorithm) {
      case 'FIXED_WINDOW': return new FixedWindowLimiter(rule, clock)
      case 'SLIDING_WINDOW': return new SlidingWindowLimiter(rule, clock)
      case 'TOKEN_BUCKET': return new TokenBucketLimiter(rule, clock)
      case 'LEAKY_BUCKET': return new LeakyBucketLimiter(rule, clock)
    }
  },
}

/** Precedence: (endpoint,tier) > (endpoint,*) > (*,tier) > (*,*). Counters per client per endpoint. */
class RateLimitService {
  private rules = new Map<string, Rule>()
  private limiters = new Map<string, RateLimiter>()
  constructor(private defaultRule: Rule, private clock: Clock = () => performance.now() / 1000) {}

  setRule(endpoint: string, tier: string, rule: Rule): void {
    const key = endpoint + '|' + tier
    this.rules.set(key, rule)
    this.limiters.delete(key) // takes effect on the next request; counters for this rule restart
  }

  check(clientId: string, endpoint = '*', tier = '*'): Decision {
    const key = this.resolveKey(endpoint, tier)
    let limiter = this.limiters.get(key)
    if (!limiter) {
      limiter = LimiterFactory.create(this.rules.get(key) ?? this.defaultRule, this.clock)
      this.limiters.set(key, limiter)
    }
    return limiter.allow(clientId + '|' + endpoint)
  }

  private resolveKey(endpoint: string, tier: string): string {
    for (const k of [endpoint + '|' + tier, endpoint + '|*', '*|' + tier]) {
      if (this.rules.has(k)) return k
    }
    return '*|*'
  }
}

export { RateLimitService, Decision, LimiterFactory }
export type { Rule, RateLimiter, Algorithm }
`

const cpp = `#include <algorithm>
#include <cmath>
#include <deque>
#include <functional>
#include <map>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>
#include <unordered_map>

enum class Algorithm { FixedWindow, SlidingWindow, TokenBucket, LeakyBucket };
using Clock = std::function<double()>;  // seconds

struct Rule { int limit; double windowSeconds; Algorithm algo; };

struct Decision {
  bool allowed; int limit; int remaining; double resetAfter; double retryAfter;
  int status() const { return allowed ? 200 : 429; }
  std::map<std::string, std::string> headers() const {
    std::map<std::string, std::string> h{
        {"X-RateLimit-Limit", std::to_string(limit)},
        {"X-RateLimit-Remaining", std::to_string(remaining)},
        {"X-RateLimit-Reset", std::to_string((long)std::ceil(resetAfter))}};
    if (!allowed) h["Retry-After"] = std::to_string(std::max(1L, (long)std::ceil(retryAfter)));
    return h;
  }
};

class RateLimiter {
public:
  virtual ~RateLimiter() = default;
  virtual Decision allow(const std::string& clientId) = 0;
};

class BaseLimiter : public RateLimiter {
public:
  BaseLimiter(Rule r, Clock c) : rule_(r), clock_(std::move(c)) {
    if (r.limit <= 0 || r.windowSeconds <= 0) throw std::invalid_argument("bad rule");
  }
  Decision allow(const std::string& id) override {
    std::lock_guard<std::mutex> g(mu_);
    return doAllow(id, clock_());
  }
protected:
  virtual Decision doAllow(const std::string& id, double now) = 0;
  Rule rule_;
private:
  Clock clock_;
  std::mutex mu_;
};

class FixedWindowLimiter : public BaseLimiter {
  struct St { double start; int count; };
  std::unordered_map<std::string, St> state_;
public:
  using BaseLimiter::BaseLimiter;
protected:
  Decision doAllow(const std::string& id, double now) override {
    double w = rule_.windowSeconds, start = std::floor(now / w) * w;
    auto& st = state_[id];
    if (st.start != start) st = {start, 0};
    double reset = start + w - now;
    if (st.count < rule_.limit) { ++st.count; return {true, rule_.limit, rule_.limit - st.count, reset, 0}; }
    return {false, rule_.limit, 0, reset, reset};
  }
};

class SlidingWindowLimiter : public BaseLimiter {
  std::unordered_map<std::string, std::deque<double>> logs_;
public:
  using BaseLimiter::BaseLimiter;
protected:
  Decision doAllow(const std::string& id, double now) override {
    double w = rule_.windowSeconds;
    auto& log = logs_[id];
    while (!log.empty() && log.front() <= now - w) log.pop_front();
    if ((int)log.size() < rule_.limit) {
      log.push_back(now);
      return {true, rule_.limit, rule_.limit - (int)log.size(), log.front() + w - now, 0};
    }
    double retry = log.front() + w - now;
    return {false, rule_.limit, 0, retry, retry};
  }
};

class TokenBucketLimiter : public BaseLimiter {
  struct B { double tokens; double last; };
  std::unordered_map<std::string, B> buckets_;
  double rate_;
public:
  TokenBucketLimiter(Rule r, Clock c) : BaseLimiter(r, std::move(c)), rate_(r.limit / r.windowSeconds) {}
protected:
  Decision doAllow(const std::string& id, double now) override {
    auto it = buckets_.find(id);
    if (it == buckets_.end()) it = buckets_.emplace(id, B{(double)rule_.limit, now}).first;
    B& b = it->second;
    b.tokens = std::min((double)rule_.limit, b.tokens + (now - b.last) * rate_);
    b.last = now;
    if (b.tokens >= 1.0) {
      b.tokens -= 1.0;
      return {true, rule_.limit, (int)(b.tokens + 1e-9), (rule_.limit - b.tokens) / rate_, 0};
    }
    double retry = (1.0 - b.tokens) / rate_;
    return {false, rule_.limit, 0, retry, retry};
  }
};

class LeakyBucketLimiter : public BaseLimiter {
  struct L { double level; double last; };
  std::unordered_map<std::string, L> levels_;
  double rate_;
public:
  LeakyBucketLimiter(Rule r, Clock c) : BaseLimiter(r, std::move(c)), rate_(r.limit / r.windowSeconds) {}
protected:
  Decision doAllow(const std::string& id, double now) override {
    auto it = levels_.find(id);
    if (it == levels_.end()) it = levels_.emplace(id, L{0.0, now}).first;
    L& s = it->second;
    s.level = std::max(0.0, s.level - (now - s.last) * rate_);
    s.last = now;
    if (s.level + 1.0 <= rule_.limit) {
      s.level += 1.0;
      return {true, rule_.limit, (int)(rule_.limit - s.level + 1e-9), s.level / rate_, 0};
    }
    return {false, rule_.limit, 0, s.level / rate_, (s.level + 1.0 - rule_.limit) / rate_};
  }
};

inline std::shared_ptr<RateLimiter> createLimiter(const Rule& r, const Clock& c) {
  switch (r.algo) {
    case Algorithm::FixedWindow:   return std::make_shared<FixedWindowLimiter>(r, c);
    case Algorithm::SlidingWindow: return std::make_shared<SlidingWindowLimiter>(r, c);
    case Algorithm::TokenBucket:   return std::make_shared<TokenBucketLimiter>(r, c);
    case Algorithm::LeakyBucket:   return std::make_shared<LeakyBucketLimiter>(r, c);
  }
  throw std::invalid_argument("unknown algorithm");
}

// Precedence: (endpoint,tier) > (endpoint,*) > (*,tier) > (*,*)
class RateLimitService {
  Rule default_;
  Clock clock_;
  std::map<std::string, Rule> rules_;
  std::map<std::string, std::shared_ptr<RateLimiter>> limiters_;
  std::mutex mu_;

  std::string resolveKey(const std::string& ep, const std::string& tier) const {
    for (const auto& k : {ep + "|" + tier, ep + "|*", "*|" + tier})
      if (rules_.count(k)) return k;
    return "*|*";
  }
public:
  RateLimitService(Rule def, Clock clock) : default_(def), clock_(std::move(clock)) {}

  void setRule(const std::string& ep, const std::string& tier, Rule rule) {
    std::lock_guard<std::mutex> g(mu_);
    auto key = ep + "|" + tier;
    rules_[key] = rule;
    limiters_.erase(key);  // new rule applies to next request; counters restart
  }

  Decision check(const std::string& clientId, const std::string& ep = "*", const std::string& tier = "*") {
    std::shared_ptr<RateLimiter> limiter;
    {
      std::lock_guard<std::mutex> g(mu_);
      auto key = resolveKey(ep, tier);
      auto it = limiters_.find(key);
      if (it == limiters_.end()) {
        auto r = rules_.find(key);
        it = limiters_.emplace(key, createLimiter(r != rules_.end() ? r->second : default_, clock_)).first;
      }
      limiter = it->second;
    }
    return limiter->allow(clientId + "|" + ep);
  }
};
`

const goCode = `package ratelimit

import (
  "math"
  "strconv"
  "sync"
)

type Algorithm int

const (
  FixedWindow Algorithm = iota
  SlidingWindow
  TokenBucket
  LeakyBucket
)

type Rule struct {
  Limit         int
  WindowSeconds float64
  Algo          Algorithm
}

type Decision struct {
  Allowed    bool
  Limit      int
  Remaining  int
  ResetAfter float64
  RetryAfter float64
}

func (d Decision) Status() int {
  if d.Allowed { return 200 }
  return 429
}

func (d Decision) Headers() map[string]string {
  h := map[string]string{
    "X-RateLimit-Limit":     strconv.Itoa(d.Limit),
    "X-RateLimit-Remaining": strconv.Itoa(d.Remaining),
    "X-RateLimit-Reset":     strconv.Itoa(int(math.Ceil(d.ResetAfter))),
  }
  if !d.Allowed {
    h["Retry-After"] = strconv.Itoa(int(math.Max(1, math.Ceil(d.RetryAfter))))
  }
  return h
}

type Clock func() float64 // seconds

type RateLimiter interface {
  Allow(clientID string) Decision
}

// ---- Fixed window ----

type fwState struct {
  start float64
  count int
}

type FixedWindowLimiter struct {
  mu    sync.Mutex
  rule  Rule
  clock Clock
  state map[string]*fwState
}

func (l *FixedWindowLimiter) Allow(id string) Decision {
  l.mu.Lock()
  defer l.mu.Unlock()
  now, w := l.clock(), l.rule.WindowSeconds
  start := math.Floor(now/w) * w
  st := l.state[id]
  if st == nil || st.start != start {
    st = &fwState{start: start}
    l.state[id] = st
  }
  reset := start + w - now
  if st.count < l.rule.Limit {
    st.count++
    return Decision{true, l.rule.Limit, l.rule.Limit - st.count, reset, 0}
  }
  return Decision{false, l.rule.Limit, 0, reset, reset}
}

// ---- Sliding window log ----

type SlidingWindowLimiter struct {
  mu    sync.Mutex
  rule  Rule
  clock Clock
  logs  map[string][]float64
}

func (l *SlidingWindowLimiter) Allow(id string) Decision {
  l.mu.Lock()
  defer l.mu.Unlock()
  now, w := l.clock(), l.rule.WindowSeconds
  log := l.logs[id]
  for len(log) > 0 && log[0] <= now-w {
    log = log[1:]
  }
  if len(log) < l.rule.Limit {
    log = append(log, now)
    l.logs[id] = log
    return Decision{true, l.rule.Limit, l.rule.Limit - len(log), log[0] + w - now, 0}
  }
  l.logs[id] = log
  retry := log[0] + w - now
  return Decision{false, l.rule.Limit, 0, retry, retry}
}

// ---- Token bucket ----

type bucket struct{ tokens, last float64 }

type TokenBucketLimiter struct {
  mu      sync.Mutex
  rule    Rule
  clock   Clock
  rate    float64
  buckets map[string]*bucket
}

func (l *TokenBucketLimiter) Allow(id string) Decision {
  l.mu.Lock()
  defer l.mu.Unlock()
  now, limit := l.clock(), float64(l.rule.Limit)
  b := l.buckets[id]
  if b == nil {
    b = &bucket{tokens: limit, last: now}
    l.buckets[id] = b
  }
  b.tokens = math.Min(limit, b.tokens+(now-b.last)*l.rate)
  b.last = now
  if b.tokens >= 1 {
    b.tokens--
    return Decision{true, l.rule.Limit, int(b.tokens + 1e-9), (limit - b.tokens) / l.rate, 0}
  }
  retry := (1 - b.tokens) / l.rate
  return Decision{false, l.rule.Limit, 0, retry, retry}
}

// ---- Leaky bucket (meter) ----

type LeakyBucketLimiter struct {
  mu     sync.Mutex
  rule   Rule
  clock  Clock
  rate   float64
  levels map[string]*bucket // tokens field = level
}

func (l *LeakyBucketLimiter) Allow(id string) Decision {
  l.mu.Lock()
  defer l.mu.Unlock()
  now, limit := l.clock(), float64(l.rule.Limit)
  s := l.levels[id]
  if s == nil {
    s = &bucket{tokens: 0, last: now}
    l.levels[id] = s
  }
  s.tokens = math.Max(0, s.tokens-(now-s.last)*l.rate)
  s.last = now
  if s.tokens+1 <= limit {
    s.tokens++
    return Decision{true, l.rule.Limit, int(limit - s.tokens + 1e-9), s.tokens / l.rate, 0}
  }
  return Decision{false, l.rule.Limit, 0, s.tokens / l.rate, (s.tokens + 1 - limit) / l.rate}
}

// ---- Factory + service ----

func NewLimiter(r Rule, clock Clock) RateLimiter {
  rate := float64(r.Limit) / r.WindowSeconds
  switch r.Algo {
  case SlidingWindow:
    return &SlidingWindowLimiter{rule: r, clock: clock, logs: map[string][]float64{}}
  case TokenBucket:
    return &TokenBucketLimiter{rule: r, clock: clock, rate: rate, buckets: map[string]*bucket{}}
  case LeakyBucket:
    return &LeakyBucketLimiter{rule: r, clock: clock, rate: rate, levels: map[string]*bucket{}}
  default:
    return &FixedWindowLimiter{rule: r, clock: clock, state: map[string]*fwState{}}
  }
}

// Precedence: (endpoint,tier) > (endpoint,*) > (*,tier) > (*,*)
type RateLimitService struct {
  mu       sync.Mutex
  def      Rule
  clock    Clock
  rules    map[string]Rule
  limiters map[string]RateLimiter
}

func NewRateLimitService(def Rule, clock Clock) *RateLimitService {
  return &RateLimitService{def: def, clock: clock, rules: map[string]Rule{}, limiters: map[string]RateLimiter{}}
}

func (s *RateLimitService) SetRule(endpoint, tier string, r Rule) {
  s.mu.Lock()
  defer s.mu.Unlock()
  key := endpoint + "|" + tier
  s.rules[key] = r
  delete(s.limiters, key) // next request uses the new rule; counters restart
}

func (s *RateLimitService) resolveKey(endpoint, tier string) string {
  for _, k := range []string{endpoint + "|" + tier, endpoint + "|*", "*|" + tier} {
    if _, ok := s.rules[k]; ok {
      return k
    }
  }
  return "*|*"
}

func (s *RateLimitService) Check(clientID, endpoint, tier string) Decision {
  s.mu.Lock()
  key := s.resolveKey(endpoint, tier)
  lim, ok := s.limiters[key]
  if !ok {
    rule, found := s.rules[key]
    if !found {
      rule = s.def
    }
    lim = NewLimiter(rule, s.clock)
    s.limiters[key] = lim
  }
  s.mu.Unlock()
  return lim.Allow(clientID + "|" + endpoint)
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum Algorithm { FixedWindow, SlidingWindow, TokenBucket, LeakyBucket }

public sealed record Rule(int Limit, double WindowSeconds, Algorithm Algorithm);

public sealed record Decision(bool Allowed, int Limit, int Remaining, double ResetAfter, double RetryAfter) {
  public int Status => Allowed ? 200 : 429;
  public IReadOnlyDictionary<string, string> Headers() {
    var h = new Dictionary<string, string> {
      ["X-RateLimit-Limit"] = Limit.ToString(),
      ["X-RateLimit-Remaining"] = Remaining.ToString(),
      ["X-RateLimit-Reset"] = ((long)Math.Ceiling(ResetAfter)).ToString(),
    };
    if (!Allowed) h["Retry-After"] = Math.Max(1L, (long)Math.Ceiling(RetryAfter)).ToString();
    return h;
  }
}

public interface IRateLimiter {
  Decision Allow(string clientId);
}

public abstract class BaseLimiter : IRateLimiter {
  protected readonly Rule Rule;
  readonly Func<double> _clock;
  readonly object _gate = new();
  protected BaseLimiter(Rule rule, Func<double> clock) {
    if (rule.Limit <= 0 || rule.WindowSeconds <= 0) throw new ArgumentException("bad rule");
    Rule = rule; _clock = clock;
  }
  public Decision Allow(string clientId) { lock (_gate) return DoAllow(clientId, _clock()); }
  protected abstract Decision DoAllow(string clientId, double now);
}

public sealed class FixedWindowLimiter : BaseLimiter {
  readonly Dictionary<string, (double Start, int Count)> _state = new();
  public FixedWindowLimiter(Rule r, Func<double> c) : base(r, c) {}
  protected override Decision DoAllow(string id, double now) {
    double w = Rule.WindowSeconds, start = Math.Floor(now / w) * w;
    if (!_state.TryGetValue(id, out var st) || st.Start != start) st = (start, 0);
    double reset = start + w - now;
    if (st.Count < Rule.Limit) {
      st.Count++; _state[id] = st;
      return new Decision(true, Rule.Limit, Rule.Limit - st.Count, reset, 0);
    }
    _state[id] = st;
    return new Decision(false, Rule.Limit, 0, reset, reset);
  }
}

public sealed class SlidingWindowLimiter : BaseLimiter {
  readonly Dictionary<string, Queue<double>> _logs = new();
  public SlidingWindowLimiter(Rule r, Func<double> c) : base(r, c) {}
  protected override Decision DoAllow(string id, double now) {
    double w = Rule.WindowSeconds;
    if (!_logs.TryGetValue(id, out var log)) _logs[id] = log = new Queue<double>();
    while (log.Count > 0 && log.Peek() <= now - w) log.Dequeue();
    if (log.Count < Rule.Limit) {
      log.Enqueue(now);
      return new Decision(true, Rule.Limit, Rule.Limit - log.Count, log.Peek() + w - now, 0);
    }
    double retry = log.Peek() + w - now;
    return new Decision(false, Rule.Limit, 0, retry, retry);
  }
}

public sealed class TokenBucketLimiter : BaseLimiter {
  readonly double _rate;
  readonly Dictionary<string, (double Tokens, double Last)> _buckets = new();
  public TokenBucketLimiter(Rule r, Func<double> c) : base(r, c) { _rate = r.Limit / r.WindowSeconds; }
  protected override Decision DoAllow(string id, double now) {
    int limit = Rule.Limit;
    var (tokens, last) = _buckets.TryGetValue(id, out var b) ? b : (limit, now);
    tokens = Math.Min(limit, tokens + (now - last) * _rate);
    if (tokens >= 1.0) {
      tokens -= 1.0;
      _buckets[id] = (tokens, now);
      return new Decision(true, limit, (int)(tokens + 1e-9), (limit - tokens) / _rate, 0);
    }
    _buckets[id] = (tokens, now);
    double retry = (1.0 - tokens) / _rate;
    return new Decision(false, limit, 0, retry, retry);
  }
}

public sealed class LeakyBucketLimiter : BaseLimiter {
  readonly double _rate;
  readonly Dictionary<string, (double Level, double Last)> _levels = new();
  public LeakyBucketLimiter(Rule r, Func<double> c) : base(r, c) { _rate = r.Limit / r.WindowSeconds; }
  protected override Decision DoAllow(string id, double now) {
    int limit = Rule.Limit;
    var (level, last) = _levels.TryGetValue(id, out var s) ? s : (0.0, now);
    level = Math.Max(0.0, level - (now - last) * _rate);
    if (level + 1.0 <= limit) {
      level += 1.0;
      _levels[id] = (level, now);
      return new Decision(true, limit, (int)(limit - level + 1e-9), level / _rate, 0);
    }
    _levels[id] = (level, now);
    return new Decision(false, limit, 0, level / _rate, (level + 1.0 - limit) / _rate);
  }
}

public static class LimiterFactory {
  public static IRateLimiter Create(Rule r, Func<double> clock) => r.Algorithm switch {
    Algorithm.FixedWindow => new FixedWindowLimiter(r, clock),
    Algorithm.SlidingWindow => new SlidingWindowLimiter(r, clock),
    Algorithm.TokenBucket => new TokenBucketLimiter(r, clock),
    Algorithm.LeakyBucket => new LeakyBucketLimiter(r, clock),
    _ => throw new ArgumentOutOfRangeException(nameof(r)),
  };
}

// Precedence: (endpoint,tier) > (endpoint,*) > (*,tier) > (*,*). Counters per client per endpoint.
public sealed class RateLimitService {
  readonly Rule _default;
  readonly Func<double> _clock;
  readonly Dictionary<string, Rule> _rules = new();
  readonly Dictionary<string, IRateLimiter> _limiters = new();
  readonly object _gate = new();

  public RateLimitService(Rule defaultRule, Func<double>? clock = null) {
    _default = defaultRule;
    _clock = clock ?? (() => Environment.TickCount64 / 1000.0);
  }

  public void SetRule(string endpoint, string tier, Rule rule) {
    lock (_gate) {
      var key = endpoint + "|" + tier;
      _rules[key] = rule;
      _limiters.Remove(key); // next request uses the new rule; counters restart
    }
  }

  public Decision Check(string clientId, string endpoint = "*", string tier = "*") {
    IRateLimiter limiter;
    lock (_gate) {
      var key = ResolveKey(endpoint, tier);
      if (!_limiters.TryGetValue(key, out limiter!)) {
        limiter = LimiterFactory.Create(_rules.GetValueOrDefault(key, _default), _clock);
        _limiters[key] = limiter;
      }
    }
    return limiter.Allow(clientId + "|" + endpoint);
  }

  string ResolveKey(string endpoint, string tier) =>
    new[] { endpoint + "|" + tier, endpoint + "|*", "*|" + tier }.FirstOrDefault(_rules.ContainsKey) ?? "*|*";
}
`

export const rateLimiterSolution: ProblemSolution = {
  slug: 'rate-limiter',
  title: 'Rate Limiter - Solution',
  overview: {
    introduction:
      'Design an in-process rate limiter that admits at most N requests per time window for each client, rejects the rest with HTTP 429, and tells callers how much quota is left through standard headers. The interview is about isolating the algorithm behind one interface (Strategy), resolving per-endpoint and per-tier rules cleanly, and keeping per-client state correct under concurrency - not about building Redis or a distributed gateway.',
    constraints: [
      'Four algorithms must be supported behind one RateLimiter.allow(clientId) contract: fixed window, sliding window, token bucket, leaky bucket.',
      'Rules vary per endpoint and per client tier, and can be updated at runtime without restarting.',
      'Rejected requests return 429 plus X-RateLimit-* and Retry-After headers.',
      'Decisions must be correct under concurrent requests from the same client.',
    ],
    assumptions: [
      'State is in memory in a single process; distributed counters are a follow-up (shared store + atomic scripts).',
      'The client id is supplied by the caller (API key, user id, or IP) - identity extraction is out of scope.',
      'Counters are kept per client per endpoint; a rule update restarts that rule’s counters (documented trade-off).',
      'Time comes from an injectable Clock so tests are deterministic and never sleep.',
    ],
    clarificationQuestions: [
      'Is the limit per client, per endpoint, or per client-and-endpoint?',
      'Is a burst at a window boundary acceptable, or do we need a strict sliding window?',
      'Should a rule change reset existing counters or carry usage over?',
      'Which headers must we emit, and what should Retry-After be on rejection?',
      'Is this single node, or must limits be shared across a fleet?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Pull the nouns out of the brief: client, rule, algorithm, decision, endpoint, tier. The single verb that matters is allow(client). Everything else is either "which rule applies?" (resolution) or "how is quota counted?" (algorithm). Keep those two concerns in different classes.',
    breakdown: [
      'Define the contract first: allow(clientId) → Decision{allowed, limit, remaining, resetAfter, retryAfter}.',
      'Make Rule a plain immutable value (limit, window, algorithm) so it is trivial to swap at runtime.',
      'Implement each algorithm as its own RateLimiter owning per-client state; share locking in a small base class.',
      'Add a service that resolves (endpoint, tier) → Rule with a clear precedence and caches one limiter per rule.',
      'Map Decision to HTTP: status 200/429 and headers computed from the same value object.',
      'Only then discuss concurrency granularity, memory growth and distributed extensions.',
    ],
    entities: [
      { name: 'RateLimitService', responsibility: 'Facade: resolves the rule, finds/creates the limiter, namespaces counters per endpoint.' },
      { name: 'RateLimiter', responsibility: 'Strategy interface: allow(clientId) → Decision.' },
      { name: 'Fixed/Sliding/Token/Leaky limiters', responsibility: 'Concrete algorithms with their own per-client state.' },
      { name: 'Rule', responsibility: 'Immutable value: limit, window, algorithm.' },
      { name: 'Decision', responsibility: 'Result value; derives HTTP status and rate-limit headers.' },
      { name: 'LimiterFactory', responsibility: 'Builds the right limiter for a rule’s algorithm.' },
    ],
    relationships: [
      'RateLimitService aggregates many RateLimiter instances (one per resolved rule).',
      'Each concrete limiter realizes RateLimiter and holds exactly one Rule.',
      'RateLimitService resolves among many Rules but never knows algorithm internals.',
      'LimiterFactory depends on Rule.algorithm to construct implementations.',
      'Every limiter returns an immutable Decision.',
    ],
    patternsAndOop: [
      'Strategy: RateLimiter implementations are interchangeable algorithms.',
      'Factory: one place maps Algorithm → concrete limiter, so adding an algorithm touches one switch.',
      'Facade: RateLimitService hides rule resolution, caching and key namespacing.',
      'Value objects: Rule and Decision are immutable, which makes runtime swaps and testing safe.',
      'Template method: the base limiter owns locking; subclasses implement only the counting step.',
    ],
    stepByStep: [
      'Clarify scope (per client? per endpoint? single node?) and the 429/header contract.',
      'Sketch RateLimiter, Rule, Decision on the whiteboard.',
      'Implement fixed window first (simplest), then explain its boundary-burst weakness.',
      'Add sliding log (exact), then token bucket (burst-friendly) and leaky bucket (smooth).',
      'Add RateLimitService with rule precedence and runtime setRule.',
      'Walk a 429 example showing headers, then discuss locks, eviction and distributed variants.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Algorithms, rule resolution and HTTP shaping are three separate responsibilities. Limiters only count, the service only routes, and Decision only formats. That keeps every new requirement (new algorithm, new tier, new header) a local change.',
    classResponsibilities: [
      { name: 'RateLimitService', responsibility: 'Resolve rule by precedence, cache a limiter per rule key, namespace counters by endpoint, support setRule.' },
      { name: 'RateLimiter', responsibility: 'Single-method contract so callers never depend on an algorithm.' },
      { name: 'FixedWindowLimiter', responsibility: 'Counter per aligned window; O(1) memory; boundary bursts possible.' },
      { name: 'SlidingWindowLimiter', responsibility: 'Timestamp log per client; exact but O(N) memory.' },
      { name: 'TokenBucketLimiter', responsibility: 'Refilling bucket; permits bursts up to capacity at a sustained average rate.' },
      { name: 'LeakyBucketLimiter', responsibility: 'Draining meter; smooths traffic to the configured rate.' },
      { name: 'Decision', responsibility: 'Carries allowed/remaining/reset/retry and renders status + headers.' },
    ],
    interfacesAndAbstractions: [
      'RateLimiter is the seam: the service, middleware and tests depend only on allow(clientId).',
      'Clock is injected so time-based behavior is testable without sleeping.',
      'Rule is data, not behavior - algorithm choice is an enum resolved by the factory.',
    ],
    relationships: [
      'Aggregation Service→RateLimiter: limiters are created and replaced by the service but are standalone objects.',
      'Realization limiter→RateLimiter models the Strategy family.',
      'Association limiter→Rule: a limiter is bound to one immutable rule for its lifetime.',
      'Dependency on Decision: it is only a return value, never stored by the service.',
    ],
    solid: [
      'SRP: counting (limiters), routing (service) and formatting (Decision) change for different reasons.',
      'OCP: add a new algorithm by adding a class and one factory case; no existing limiter changes.',
      'LSP: every limiter honors "at most N admitted per window" semantics and returns a valid Decision.',
      'ISP: callers see one method; rule management is on the service, not on RateLimiter.',
      'DIP: the service and middleware depend on the RateLimiter abstraction and an injected Clock.',
    ],
    patterns: [
      { name: 'Strategy', why: 'Four interchangeable algorithms with identical call sites.' },
      { name: 'Factory', why: 'Centralizes algorithm → implementation mapping.' },
      { name: 'Facade', why: 'One entry point for rule resolution, caching and counter scoping.' },
    ],
    decisions: [
      {
        decision: 'One limiter instance per resolved rule, keyed internally by clientId|endpoint.',
        rationale: 'Rule updates replace a single object, and each algorithm manages a simple map of client state.',
        tradeoff: 'Replacing a rule restarts its counters; carrying state over needs a migration step per algorithm.',
      },
      {
        decision: 'Explicit precedence: (endpoint,tier) > (endpoint,*) > (*,tier) > default.',
        rationale: 'Most specific wins, which is easy to explain and to test.',
        tradeoff: 'A fixed ordering may not fit every product; a rule list with priorities is the generalization.',
      },
      {
        decision: 'Coarse lock per limiter.',
        rationale: 'Correct and simple; the critical section is a few arithmetic operations.',
        tradeoff: 'Hot limiters serialize; shard locks by hash(clientId) or use atomic per-client state to scale.',
      },
      {
        decision: 'Decision object computes the headers.',
        rationale: 'Headers and status can never disagree with the verdict.',
        tradeoff: 'HTTP concerns leak slightly into the domain; a thin HeaderMapper is an alternative.',
      },
    ],
    extensibility:
      'New algorithm (GCRA, sliding window counter): implement RateLimiter and add one factory case. New dimension (per-region, per-API-key): extend the key resolver or add a RuleResolver interface. Distributed mode: keep the RateLimiter interface and swap state maps for a shared store with atomic operations.',
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
      'Build RateLimitService with a default rule and register overrides via setRule(endpoint, tier, rule).',
      'check(clientId, endpoint, tier) resolves the most specific rule key and fetches (or lazily creates) its limiter.',
      'The limiter locks, reads the clock, refreshes the client’s state (window roll, log eviction, refill, or drain), and decides.',
      'It returns a Decision; the HTTP layer sends 200 with headers or 429 with Retry-After.',
      'Calling setRule drops the old limiter for that key, so the next request builds one with the new rule.',
    ],
    examples: [
      {
        title: 'Fixed window: 3 requests per 10 s',
        input: 'alice calls /home (free tier) 4 times at t=0, then once at t=10',
        output: '200 (rem 2), 200 (rem 1), 200 (rem 0), 429 Retry-After: 10, then 200 at t=10',
        explanation:
          'The fourth call exceeds the window counter, so it is rejected with the time left in the window. At t=10 a new aligned window starts and the counter resets.',
      },
      {
        title: 'Runtime rule update for a paid tier',
        input: 'setRule("/search", "pro", Rule(5, 10s, TOKEN_BUCKET)); check("bob", "/search", "pro") × 6 at t=0',
        output: 'First 5 allowed (remaining 4..0); 6th → 429, Retry-After: 2',
        explanation:
          'The (endpoint,tier) rule wins over the default. Capacity is 5 and refill is 0.5 tokens/s, so the next token arrives in 2 seconds.',
      },
    ],
  },
  followUps: [
    {
      question: 'Fixed window allows 2N requests across a boundary. How do you fix it?',
      answer:
        'Use a sliding window log for exactness (O(N) memory) or a sliding window counter that blends the previous and current window counts (O(1) memory, small approximation). Token bucket also bounds the burst by capacity.',
    },
    {
      question: 'How do you scale this across multiple servers?',
      answer:
        'Keep the RateLimiter interface and move state to a shared store such as Redis. Use an atomic script or INCR+EXPIRE (fixed window) or a Lua token-bucket script so check-and-update is one round trip. Discuss local pre-aggregation and failing open vs closed if the store is down.',
    },
    {
      question: 'What happens to memory for millions of clients?',
      answer:
        'Evict idle clients: for token/leaky buckets a client idle for a full window is equivalent to a fresh one, so entries can be dropped via TTL or LRU. Cap the sliding log size by the limit.',
    },
    {
      question: 'How would you reduce lock contention?',
      answer:
        'Shard state by hash(clientId) with one lock per shard, or use per-client atomic state (CAS loops). The limiter-wide lock is kept in the baseline because it is simple and obviously correct.',
    },
    {
      question: 'Should a rule update keep existing usage?',
      answer:
        'It depends on product intent. The baseline restarts counters for simplicity. For continuity, expose limiter.migrate(oldState) per algorithm, or scale token/level values proportionally to the new limit.',
    },
    {
      question: 'How do you choose between token bucket and leaky bucket?',
      answer:
        'Token bucket allows controlled bursts and is the common API default. Leaky bucket enforces a steady outflow rate and is better when the downstream cannot tolerate spikes.',
    },
  ],
  extras: {
    edgeCases: [
      'limit or window ≤ 0 in a rule - reject at construction.',
      'First request from a brand-new client (token bucket starts full, leaky bucket starts empty).',
      'Clock moving backwards - use a monotonic clock; clamp negative elapsed time.',
      'Burst exactly at a window boundary for the fixed-window algorithm.',
      'Rule updated while requests are in flight.',
    ],
    commonMistakes: [
      'Branching on the algorithm inside one giant allow() method instead of using Strategy.',
      'Calling the wall clock directly, making tests flaky.',
      'Check-then-increment without a lock - two threads both pass at the limit.',
      'Returning 429 without Retry-After or computing it from the wrong reference.',
      'Sharing one counter across endpoints when the requirement is per-endpoint.',
    ],
    complexity:
      'Fixed window, token bucket, leaky bucket: O(1) time and memory per client. Sliding log: amortized O(1) time, O(N) memory per client. Service resolution is O(1) with at most four map lookups.',
    testing: [
      'Inject a fake clock; advance time to test window rollover, refill and drain exactly.',
      'Table-driven tests per algorithm: N allowed, N+1 rejected, recovery after the window.',
      'Rule precedence tests for every combination of endpoint/tier overrides.',
      'Concurrency test: M threads hitting one client admit exactly N requests.',
      'Header tests: remaining decrements, Retry-After only on 429.',
    ],
    extensions: [
      'Sliding window counter and GCRA algorithms.',
      'Distributed store backend with atomic scripts.',
      'Priority/burst credits and per-API-key overrides.',
      'Metrics: allowed vs rejected counts per rule.',
    ],
    takeaways: [
      'Hide the algorithm behind one allow() method.',
      'Separate rule resolution from counting.',
      'Inject the clock and make decisions return a value object.',
      'Name the trade-off of each algorithm (memory, burstiness, accuracy).',
    ],
  },
}
