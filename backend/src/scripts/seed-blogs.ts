/**
 * Seed 10 long-form SEO-optimised blog posts.
 * Content is stored as structured JSON blocks (see backend/src/types/blog-content.ts)
 * instead of Markdown, so display never depends on parsing free-form text.
 * Run: npx ts-node -r dotenv/config src/scripts/seed-blogs.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Blog } from '../models/blog.model'
import { BlogBlock } from '../types/blog-content'
import { buildTocAndIds, calcReadingTime } from '../utils/blog-content'

const AUTHOR = { name: 'LLDCanvas Team', role: 'Engineering', avatar: '' }

// ─── Blog 1: system-design-interview-guide ──────────────────────────────────────────────────
const blog1Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "System design interviews are the most misunderstood round in software engineering hiring. Candidates spend months grinding algorithm problems but walk into design rounds unprepared, treating them like a trivia quiz instead of a structured conversation about trade-offs."
  },
  {
    "type": "paragraph",
    "text": "This guide gives you a complete, battle-tested framework for tackling any system design question - from \"design Twitter\" to \"design a distributed rate limiter\" - at companies like Google, Meta, Amazon, Uber, and Flipkart."
  },
  {
    "type": "quote",
    "text": "Before you start: if you want to practice what you learn here, [LLDCanvas's Interview Mode](/features/interview-mode) gives you a timed canvas, structured problem briefs, and analytics on your performance across 110+ real LLD and HLD questions."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "What Interviewers Actually Evaluate"
  },
  {
    "type": "paragraph",
    "text": "Most candidates think system design is about knowing the \"right\" answer. It isn't. There is rarely a single correct architecture - there are architectures with well-understood trade-offs, and interviewers are scoring how you reason about them."
  },
  {
    "type": "paragraph",
    "text": "Interviewers evaluate four dimensions:"
  },
  {
    "type": "numbered",
    "items": [
      "**Problem clarification** - Do you ask the right questions before jumping to a solution?",
      "**Structured thinking** - Can you break a complex, ambiguous problem into manageable pieces?",
      "**Technical depth** - Do you know *why* you chose a particular database, queue, or caching strategy, not just its name?",
      "**Trade-off reasoning** - Can you articulate the pros and cons of each decision, including the ones you didn't pick?"
    ]
  },
  {
    "type": "paragraph",
    "text": "A candidate who picks a \"suboptimal\" architecture but explains the trade-offs clearly will almost always score higher than one who jumps straight to the \"correct\" answer without reasoning through it."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "The 6-Step Framework"
  },
  {
    "type": "paragraph",
    "text": "Use this framework as a timer in your head during a 45-60 minute interview. It keeps you from over-indexing on one section and running out of time before you reach trade-offs."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Step 1: Clarify Requirements (~5 minutes)"
  },
  {
    "type": "paragraph",
    "text": "Never start designing until you understand what you're building. Ask about:"
  },
  {
    "type": "bullets",
    "items": [
      "**Functional requirements** - what does the system do, and what features are explicitly out of scope?",
      "**Non-functional requirements** - expected scale, latency targets, availability, and consistency needs.",
      "**Constraints** - is the workload read-heavy or write-heavy? Global or regional? Real-time or batch?"
    ]
  },
  {
    "type": "paragraph",
    "text": "Example, for \"design a URL shortener\":"
  },
  {
    "type": "bullets",
    "items": [
      "How many URLs are created per day? (100M/day works out to roughly 1,150 writes/second)",
      "How long does a shortened URL stay valid?",
      "Do we need click analytics?",
      "Is 99.9% or 99.99% availability required?"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Step 2: Estimate Scale (~3 minutes)"
  },
  {
    "type": "paragraph",
    "text": "Back-of-the-envelope math signals engineering maturity to the interviewer. Three formulas cover most cases:"
  },
  {
    "type": "bullets",
    "items": [
      "**Traffic**: QPS = (requests per day) / 86,400",
      "**Storage**: (records per day) x (bytes per record) x (retention in years)",
      "**Bandwidth**: QPS x (average payload size)"
    ]
  },
  {
    "type": "paragraph",
    "text": "Applied to a URL shortener handling 100M writes/day and 10B reads/day:"
  },
  {
    "type": "bullets",
    "items": [
      "Write QPS: ~1,150/s",
      "Read QPS: ~115,000/s (a 100:1 read-to-write ratio)",
      "Storage per URL: ~500 bytes, so 100M x 500B = 50GB/day"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Step 3: Define the API (~5 minutes)"
  },
  {
    "type": "paragraph",
    "text": "Design the public interface before the internals - it forces you to nail down exactly what the system must support."
  },
  {
    "type": "code",
    "lang": "text",
    "code": "POST /shorten\nBody: { url: \"https://very-long-url.com/...\", alias?: \"my-link\", ttl?: 86400 }\nResponse: { shortUrl: \"https://lldcanvas.app/abc123\" }\n\nGET /{shortCode}\nResponse: 301 Redirect to original URL"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Step 4: Design the High-Level Architecture (~15 minutes)"
  },
  {
    "type": "paragraph",
    "text": "Draw the major components and how requests flow through them:"
  },
  {
    "type": "bullets",
    "items": [
      "**Client -> Load Balancer -> API Servers -> Database** as the request backbone.",
      "Add a **cache** (Redis) in front of the database for hot reads.",
      "Add a **CDN** for static assets.",
      "Add a **message queue** (Kafka) for anything that can be processed asynchronously."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Step 5: Deep Dive into Components (~15 minutes)"
  },
  {
    "type": "paragraph",
    "text": "Pick 2-3 critical components and go deep rather than skimming everything. For a URL shortener, that means database choice and caching strategy."
  },
  {
    "type": "bullets",
    "items": [
      "**Database choice**: this is a key-value access pattern, so a NoSQL store like DynamoDB or Cassandra fits well.",
      "**Short code generation**: Base62-encode an auto-incremented ID to produce a compact, collision-free code.",
      "**Caching**: keep an LRU cache in Redis for the top 20% of URLs, which typically serve 80% of traffic.",
      "**TTL**: match cache TTL to URL expiry so stale entries don't linger.",
      "**Pattern**: use cache-aside - check the cache first, and fall back to the database on a miss."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Step 6: Address Trade-offs (~5 minutes)"
  },
  {
    "type": "paragraph",
    "text": "Close by naming the failure modes and how the system degrades:"
  },
  {
    "type": "bullets",
    "items": [
      "What happens if Redis goes down? The system falls back to the database with a tolerable latency increase.",
      "What if a single URL goes viral? This is the hot key problem - solve it with a local, in-process cache on each app server.",
      "CAP theorem applies here: for a URL shortener, choosing availability over strict consistency (AP) is an acceptable trade-off."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Core Building Blocks to Master"
  },
  {
    "type": "paragraph",
    "text": "Beyond the framework, most system design questions draw from the same small set of building blocks. Master these once and you can reuse them across dozens of problems."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Databases"
  },
  {
    "type": "table",
    "headers": [
      "Type",
      "Best For",
      "Examples"
    ],
    "rows": [
      [
        "Relational",
        "ACID transactions, complex queries",
        "PostgreSQL, MySQL"
      ],
      [
        "Document",
        "Flexible schema, nested data",
        "MongoDB"
      ],
      [
        "Key-Value",
        "Caching, sessions, simple lookups",
        "Redis, DynamoDB"
      ],
      [
        "Wide-Column",
        "Time-series, high write throughput",
        "Cassandra"
      ],
      [
        "Search",
        "Full-text search",
        "Elasticsearch"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Caching Strategies"
  },
  {
    "type": "bullets",
    "items": [
      "**Cache-aside (lazy loading)**: the app checks the cache first; on a miss it loads from the database and populates the cache.",
      "**Write-through**: writes go to the cache and database simultaneously - strong consistency, but higher write latency.",
      "**Write-behind (write-back)**: writes go to the cache only, and get flushed to the database asynchronously - fast writes, but risk of data loss."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Consistent Hashing"
  },
  {
    "type": "paragraph",
    "text": "Consistent hashing distributes data across nodes in a way that minimizes reshuffling when nodes are added or removed. It's the mechanism behind Redis Cluster, Cassandra's partitioning, and CDN request routing."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "CAP Theorem"
  },
  {
    "type": "paragraph",
    "text": "A distributed system can guarantee at most two of three properties: Consistency, Availability, and Partition Tolerance. Since network partitions are unavoidable in practice, the real choice is between consistency and availability."
  },
  {
    "type": "bullets",
    "items": [
      "**CP systems** favor strong consistency and may sacrifice availability during a partition - examples: HBase, ZooKeeper.",
      "**AP systems** stay available and may return stale data during a partition - examples: Cassandra, DynamoDB."
    ]
  },
  {
    "type": "quote",
    "text": "Tip: don't just memorize CP vs. AP labels - practice justifying *why* a specific system (a bank ledger vs. a social feed) should land on one side or the other. That reasoning is what interviewers are actually listening for."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Common System Design Questions"
  },
  {
    "type": "paragraph",
    "text": "A handful of questions recur across companies because they each stress a different part of the framework above. Here's how the core ideas map onto three classics."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Design Twitter"
  },
  {
    "type": "bullets",
    "items": [
      "Read-heavy workload, roughly a 100:1 read-to-write ratio.",
      "**Fan-out on write** for users with fewer than about 1M followers - push new posts directly into follower timelines.",
      "**Fan-out on read** for celebrities - writing to 50M timelines on every post is prohibitively expensive.",
      "**Hybrid approach**: celebrity posts are pulled at read time, while regular users' posts are pushed at write time."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Design WhatsApp"
  },
  {
    "type": "bullets",
    "items": [
      "WebSockets maintain persistent connections between clients and servers.",
      "Message routing flows sender -> WebSocket server -> message queue -> recipient.",
      "A **presence service** built on Redis pub/sub tracks online/offline status.",
      "Message storage favors Cassandra, since the workload is write-heavy and naturally time-ordered."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Design YouTube"
  },
  {
    "type": "bullets",
    "items": [
      "Upload pipeline: raw video -> transcoding -> multiple resolutions -> CDN distribution.",
      "HLS (HTTP Live Streaming) enables adaptive bitrate playback.",
      "Video metadata lives in PostgreSQL; the actual video files are stored in S3 or GCS."
    ]
  },
  {
    "type": "quote",
    "text": "Want to work through these end-to-end instead of just reading about them? [Practice Design Twitter, WhatsApp, and YouTube](/dashboard/problems) on LLDCanvas with a real canvas and structured feedback."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "System design interviews reward structured thinking over encyclopedic knowledge. Master the 6-step framework, understand the core building blocks - databases, caching, consistent hashing, and CAP theorem - deeply enough to derive an architecture rather than recall one, and practice articulating trade-offs on every decision you make."
  },
  {
    "type": "paragraph",
    "text": "Do this consistently and a 45-minute design round stops feeling like an interrogation and starts feeling like a conversation you're driving."
  },
  {
    "type": "quote",
    "text": "Start practicing today with [LLDCanvas's Interview Mode](/features/interview-mode) - 110+ real problems, timed sessions, and analytics to track your improvement."
  }
]

// ─── Blog 2: lld-interview-roadmap ──────────────────────────────────────────────────
const blog2Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "Low-Level Design (LLD) is the art of designing the internal structure of a software system - the classes, interfaces, methods, relationships, and design patterns that make a feature correct, maintainable, and easy to extend as requirements change. Where High-Level Design asks \"what services do we need and how do they talk to each other,\" LLD asks \"what does the code inside one of those services actually look like.\""
  },
  {
    "type": "paragraph",
    "text": "This roadmap takes you from OOP fundamentals to a repeatable framework for solving any LLD interview problem. It is organized as five phases, each building on the last. Work through them in order, and pair the reading with actual practice - LLD is a skill you build with your hands, not one you absorb by reading alone."
  },
  {
    "type": "quote",
    "text": "**Practice as you learn:** [LLDCanvas](/features/editor) gives you a UML canvas with 23 pre-wired design pattern templates and 110+ practice problems, so you can go from concept to working class diagram in the same sitting."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Phase 1: OOP Fundamentals"
  },
  {
    "type": "paragraph",
    "text": "Every design pattern and every SOLID principle is ultimately an application of four core ideas. If these are shaky, everything built on top of them will be too."
  },
  {
    "type": "bullets",
    "items": [
      "**Encapsulation** - Bundle data and behavior together, and hide implementation details behind a controlled interface.",
      "**Abstraction** - Expose *what* a component does while hiding *how* it does it.",
      "**Inheritance** - Model \"is-a\" relationships between classes.",
      "**Polymorphism** - Let the same interface produce different behavior depending on the underlying type."
    ]
  },
  {
    "type": "paragraph",
    "text": "Encapsulation is the one interview candidates skip most often - they expose raw fields with public getters and setters and call it a day. Real encapsulation means the object protects its own invariants:"
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// Good: encapsulated with controlled access and enforced invariants\npublic class BankAccount {\n  private double balance;\n\n  public void deposit(double amount) {\n    if (amount &lt;= 0) {\n      throw new IllegalArgumentException(\"Amount must be positive\");\n    }\n    this.balance += amount;\n  }\n\n  public void withdraw(double amount) {\n    if (amount &lt;= 0 || amount &gt; balance) {\n      throw new IllegalArgumentException(\"Invalid withdrawal amount\");\n    }\n    this.balance -= amount;\n  }\n\n  public double getBalance() {\n    return balance;\n  }\n}"
  },
  {
    "type": "paragraph",
    "text": "Notice there is no `setBalance()`. The balance can only change through methods that enforce business rules - that is the difference between a data bag and a properly encapsulated object."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Phase 2: SOLID Principles"
  },
  {
    "type": "paragraph",
    "text": "SOLID is not a checklist to recite - it is a set of pressure-tests you apply to a class diagram. When an interviewer asks \"why did you split this into two classes,\" a SOLID principle is usually the correct answer."
  },
  {
    "type": "table",
    "headers": [
      "Principle",
      "One-line Summary"
    ],
    "rows": [
      [
        "**S**ingle Responsibility",
        "One class, one reason to change"
      ],
      [
        "**O**pen/Closed",
        "Open for extension, closed for modification"
      ],
      [
        "**L**iskov Substitution",
        "A subclass must be usable anywhere its parent is used, without surprises"
      ],
      [
        "**I**nterface Segregation",
        "Prefer several small, focused interfaces over one fat interface"
      ],
      [
        "**D**ependency Inversion",
        "Depend on abstractions, not concrete implementations"
      ]
    ]
  },
  {
    "type": "paragraph",
    "text": "In practice, most LLD interview failures trace back to violating just two of these: Single Responsibility (a `PaymentService` that also sends emails and logs analytics) and Dependency Inversion (a class that `new`s up its own dependencies instead of accepting them through the constructor)."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Phase 3: Design Patterns"
  },
  {
    "type": "paragraph",
    "text": "Patterns are named solutions to recurring design problems. You do not need to memorize all 23 Gang-of-Four patterns before an interview, but you should be able to recognize the handful that show up constantly and implement them from memory."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Creational Patterns"
  },
  {
    "type": "paragraph",
    "text": "**Singleton** guarantees exactly one instance of a class exists, with a single global access point. It shows up whenever you model a shared resource like a database connection pool or a configuration registry."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public class DatabaseConnection {\n  private static volatile DatabaseConnection instance;\n\n  private DatabaseConnection() {\n    // private constructor prevents external instantiation\n  }\n\n  public static DatabaseConnection getInstance() {\n    if (instance == null) {\n      synchronized (DatabaseConnection.class) {\n        if (instance == null) {\n          instance = new DatabaseConnection();\n        }\n      }\n    }\n    return instance;\n  }\n}"
  },
  {
    "type": "paragraph",
    "text": "The double-checked locking above avoids paying a synchronization cost on every call after the instance is created - a detail interviewers love to probe on when you say \"just make it thread-safe.\""
  },
  {
    "type": "bullets",
    "items": [
      "**Factory Method** - Let subclasses decide which concrete class to instantiate.",
      "**Builder** - Construct a complex object step by step, useful when a constructor would otherwise need ten optional parameters."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Structural Patterns"
  },
  {
    "type": "bullets",
    "items": [
      "**Decorator** - Attach new behavior to an object at runtime without subclassing it.",
      "**Facade** - Offer a simplified interface over a complex subsystem.",
      "**Composite** - Treat individual objects and compositions of objects uniformly, ideal for tree-shaped data like a file system or a UI layout."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Behavioral Patterns"
  },
  {
    "type": "paragraph",
    "text": "**Observer** defines a one-to-many dependency so that when one object changes state, all its dependents are notified automatically. It is the backbone of event systems, pub/sub, and UI state management."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface Observer {\n  void update(Event event);\n}\n\npublic class EventBus {\n  private final Map&lt;String, List&lt;Observer&gt;&gt; subscribers = new HashMap&lt;&gt;();\n\n  public void subscribe(String eventType, Observer observer) {\n    subscribers.computeIfAbsent(eventType, k -&gt; new ArrayList&lt;&gt;()).add(observer);\n  }\n\n  public void publish(String eventType, Event data) {\n    subscribers.getOrDefault(eventType, List.of())\n               .forEach(observer -&gt; observer.update(data));\n  }\n}"
  },
  {
    "type": "bullets",
    "items": [
      "**Strategy** - Make an algorithm swappable at runtime by encapsulating each variant behind a common interface.",
      "**Command** - Encapsulate a request (and its undo logic) as a standalone object.",
      "**State** - Let an object change its behavior when its internal state changes, replacing sprawling conditional logic with state classes."
    ]
  },
  {
    "type": "quote",
    "text": "Struggling to remember which pattern fits which problem? [LLDCanvas's pattern templates](/features/editor) let you drag a pattern onto the canvas and see its class structure pre-wired, so you learn the shape by using it."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Phase 4: The LLD Problem-Solving Framework"
  },
  {
    "type": "paragraph",
    "text": "Interviewers are not grading whether you know every pattern - they are grading whether you can go from a vague prompt (\"design a parking lot\") to a coherent class diagram in 30-40 minutes without freezing. A repeatable framework removes the guesswork about what to do next."
  },
  {
    "type": "numbered",
    "items": [
      "**Clarify requirements (2 min)** - What types of entities exist? What operations must the system support? What is explicitly out of scope?",
      "**Identify core entities (3 min)** - The nouns in the requirements usually become your classes: `Vehicle`, `ParkingSpot`, `Ticket`, `PaymentProcessor`.",
      "**Define relationships (3 min)** - Work out has-a, belongs-to, and implements relationships between the entities you just listed.",
      "**Identify applicable design patterns (5 min)** - Does a Strategy fit the pricing logic? Does a Factory fit spot allocation? Don't force a pattern where a plain class will do.",
      "**Write the class structure (15 min)** - Start with interfaces and abstract classes to lock in the contracts, then fill in concrete implementations.",
      "**Handle edge cases (5 min)** - Concurrency (two cars claiming the same spot), null checks, validation, and what happens when capacity is exceeded."
    ]
  },
  {
    "type": "paragraph",
    "text": "Timeboxing each step matters as much as the step itself. Candidates who skip step 1 and jump straight to code almost always have to backtrack once the interviewer clarifies a requirement they assumed incorrectly."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Phase 5: Practice Problems by Difficulty"
  },
  {
    "type": "paragraph",
    "text": "Reading about patterns builds recognition; solving problems builds recall under pressure. Work through the tiers below in order - each tier introduces a new wrinkle (concurrency, state machines, multi-actor systems) on top of the fundamentals from the previous one."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Easy"
  },
  {
    "type": "bullets",
    "items": [
      "[Parking Lot](/dashboard/problems/parking-lot) - entity modeling and simple allocation strategy",
      "[Vending Machine](/dashboard/problems/vending-machine) - a clean introduction to the State pattern",
      "[Library Management](/dashboard/problems/library-management) - relationships and basic inventory tracking"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Medium"
  },
  {
    "type": "bullets",
    "items": [
      "[LRU Cache](/dashboard/problems/simple-lru-cache) - data structure design under strict time-complexity constraints",
      "[Elevator System](/dashboard/problems/elevator-system) - scheduling logic and concurrent requests",
      "[Hotel Booking](/dashboard/problems/hotel-booking) - inventory management with date-range overlaps",
      "[ATM Machine](/dashboard/problems/atm-machine) - State pattern plus transactional integrity"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Hard"
  },
  {
    "type": "bullets",
    "items": [
      "[Splitwise](/dashboard/problems/splitwise) - graph-based debt simplification across multiple actors",
      "[Chess Game](/dashboard/problems/chess-game) - complex rule validation and move-generation logic",
      "[Stock Exchange](/dashboard/problems/online-stock-brokerage) - order matching and high-concurrency correctness"
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "LLD mastery rests on three things: deeply understanding OOP principles, internalizing patterns until you reach for them instinctively rather than by memorized checklist, and practicing enough problems that entity identification becomes automatic instead of a source of interview anxiety."
  },
  {
    "type": "paragraph",
    "text": "Follow this roadmap in order, keep the practice cadence consistent, and most engineers find they are solving LLD problems with real confidence within four to eight weeks."
  },
  {
    "type": "quote",
    "text": "Ready to put this roadmap into practice? Head to [LLDCanvas's problem set](/features/interview-questions) and start with an Easy problem today - the fastest way to internalize a framework is to use it under a timer."
  }
]

// ─── Blog 3: hld-vs-lld-explained ──────────────────────────────────────────────────
const blog3Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "Picture the same interview prompt handed to two different candidates: \"Design Netflix.\" One candidate spends 45 minutes drawing boxes labeled CDN, transcoding pipeline, recommendation service, and load balancer, then debates SQL versus NoSQL for the watch-history store. The other spends 45 minutes sketching a UML diagram with `VideoPlayer`, `Subscription`, `User`, and `WatchHistory` classes, arguing about whether playback state belongs in a `State` pattern or a simple enum."
  },
  {
    "type": "paragraph",
    "text": "Both candidates were asked to \"design Netflix.\" Neither is wrong. They were simply in different rounds. The first is a **High-Level Design (HLD)** interview, testing whether you can architect a system that serves 200 million concurrent users. The second is a **Low-Level Design (LLD)** interview, testing whether you can model a feature in clean, extensible object-oriented code. Confusing the two is the single most common reason strong engineers stumble in system design interviews - they answer the wrong question well instead of the right question adequately."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "What HLD Actually Tests"
  },
  {
    "type": "paragraph",
    "text": "HLD interviews evaluate your ability to reason about a system at the scale of servers, networks, and data stores rather than classes and methods. The interviewer wants to see you navigate trade-offs between consistency and availability, decide how to partition data across machines, and justify why a particular piece of infrastructure belongs where it does."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "What You're Expected to Produce"
  },
  {
    "type": "bullets",
    "items": [
      "**System components** - API gateways, application servers, caches, message queues, and CDNs, and how they connect",
      "**Data store choices** - SQL versus NoSQL, and how data is modeled, sharded, and replicated",
      "**API contracts** - the external interfaces (REST, gRPC, GraphQL) that clients use to talk to the system",
      "**End-to-end data flow** - what happens, in order, from the moment a request leaves the client to the moment a response returns",
      "**Scalability strategy** - horizontal scaling, load balancing, caching layers, and how the design survives 10x traffic"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Worked Example: Design Instagram (HLD)"
  },
  {
    "type": "paragraph",
    "text": "A typical HLD answer traces the request path through independently scalable services, each backed by the data store best suited to its access pattern:"
  },
  {
    "type": "code",
    "lang": "text",
    "code": "Users -> DNS -> CDN (static assets)\n             -> Load Balancer\n               -> API Gateway\n                 -> User Service     -> PostgreSQL (users, follows)\n                 -> Post Service     -> PostgreSQL (posts) + S3 (images)\n                 -> Feed Service     -> Redis (pre-computed feeds)\n                 -> Search Service   -> Elasticsearch\n                 -> Notification     -> Kafka -> Push Service"
  },
  {
    "type": "paragraph",
    "text": "Notice what is absent: no class names, no method signatures. The conversation stays at the level of \"which service owns this data\" and \"how do these services stay in sync,\" not \"what fields does a Post object have.\""
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "What LLD Actually Tests"
  },
  {
    "type": "paragraph",
    "text": "LLD interviews zoom into a single feature or component and evaluate whether you can translate requirements into clean, extensible object-oriented code. The interviewer cares far less about servers and far more about whether your `Post` class can support a new media type next quarter without a rewrite."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "What You're Expected to Produce"
  },
  {
    "type": "bullets",
    "items": [
      "**Classes and interfaces** - concrete names, attributes, and method signatures, not just boxes",
      "**Relationships** - inheritance, composition, and aggregation, and *why* each was chosen over the alternatives",
      "**Design patterns** - which patterns (Factory, Strategy, Observer, State, and similar) fit the problem, applied deliberately rather than forced in",
      "**Core algorithms** - pseudocode or real code for the non-trivial logic, such as feed ranking or conflict resolution"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Worked Example: Design the Instagram Post Feature (LLD)"
  },
  {
    "type": "paragraph",
    "text": "The same product surface, now modeled as extensible objects instead of infrastructure:"
  },
  {
    "type": "code",
    "lang": "java",
    "code": "interface MediaContent {\n  String getId();\n  String getUrl();\n  MediaType getType();\n}\n\nclass Post {\n  private String id;\n  private User author;\n  private List<MediaContent> media;   // supports carousel posts\n  private String caption;\n  private PostVisibility visibility;  // PUBLIC, FOLLOWERS, CLOSE_FRIENDS\n  private int likesCount;\n}\n\n// Factory for creating different media types\nclass MediaFactory {\n  public static MediaContent create(MediaType type, String url) {\n    return switch (type) {\n      case PHOTO -> new Photo(url);\n      case VIDEO -> new Video(url);\n      case REEL  -> new Reel(url);\n    };\n  }\n}"
  },
  {
    "type": "paragraph",
    "text": "Here the interesting decisions are: why `MediaContent` is an interface instead of an enum-tagged field, why a `MediaFactory` centralizes creation logic, and how `PostVisibility` will interact with the feed service's filtering rules. That last point is exactly where LLD and HLD reconnect - a well-designed class still has to be efficient at scale."
  },
  {
    "type": "quote",
    "text": "If pseudocode and class relationships are the part that feels shaky, work through the [LLD interview roadmap](/blog/lld-interview-roadmap) and drill real prompts on [LLDCanvas](/features/interview-questions)."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "HLD vs LLD: Side by Side"
  },
  {
    "type": "table",
    "headers": [
      "Dimension",
      "HLD",
      "LLD"
    ],
    "rows": [
      [
        "Focus",
        "Services, data stores, and communication between them",
        "Classes, interfaces, and the relationships between them"
      ],
      [
        "Typical duration",
        "45-60 minutes",
        "45-60 minutes"
      ],
      [
        "Deliverable",
        "Architecture / component diagram",
        "Class diagram and key pseudocode"
      ],
      [
        "Skills tested",
        "Distributed systems, CAP trade-offs, capacity estimation",
        "OOP fundamentals, SOLID principles, design patterns"
      ],
      [
        "Example prompts",
        "Design Twitter, Netflix, Uber, WhatsApp",
        "Design a Parking Lot, Elevator System, Chess Game"
      ],
      [
        "Common mistake",
        "Skipping scale/traffic estimation before designing",
        "Jumping to code before clarifying requirements"
      ]
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "How to Tell Which Round You're In"
  },
  {
    "type": "paragraph",
    "text": "The prompt itself is usually the biggest clue, but so is the language the interviewer uses once you start talking."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Signs It's an HLD Round"
  },
  {
    "type": "bullets",
    "items": [
      "The prompt names a large consumer product: \"Design Twitter,\" \"Design Netflix,\" \"Design Uber\"",
      "The interviewer asks about scale early: \"How would this handle 10 million daily active users?\"",
      "You're expected to draw boxes and arrows representing services and data flow, not classes"
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Signs It's an LLD Round"
  },
  {
    "type": "bullets",
    "items": [
      "The prompt names a bounded, self-contained system: \"Design a Parking Lot,\" \"Design an Elevator,\" \"Design a Chess Game\"",
      "The interviewer asks \"what classes would you create?\" or \"how would you structure this in code?\"",
      "You're expected to produce a UML-style class diagram and defend specific design pattern choices"
    ]
  },
  {
    "type": "paragraph",
    "text": "When the prompt is genuinely ambiguous - and \"design Netflix\" alone can go either way - it is completely acceptable, even expected, to ask directly: \"Should I focus on the overall system architecture, or on the class-level design of a specific feature?\" That one question can save you from spending 40 minutes drawing microservices when the interviewer wanted to see your `VideoPlayer` state machine."
  },
  {
    "type": "quote",
    "text": "Not sure which side needs more work? The [system design interview guide](/blog/system-design-interview-guide) covers HLD prep end to end, and pairs well with hands-on LLD practice on [LLDCanvas](/)."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Preparing for Both"
  },
  {
    "type": "paragraph",
    "text": "Because the two rounds test genuinely different muscles, they need genuinely different preparation, and most candidates over-invest in one at the expense of the other."
  },
  {
    "type": "numbered",
    "items": [
      "**For HLD:** Practice back-of-the-envelope capacity estimation until it's fast and automatic - QPS, storage growth, and bandwidth. Study how real systems (Netflix, Uber, WhatsApp) solve scaling problems, and be ready to justify SQL versus NoSQL for a given access pattern.",
      "**For LLD:** Get comfortable identifying which design pattern fits a scenario *before* you start writing classes. Practice going from a one-paragraph prompt to a class diagram in under 15 minutes, and rehearse defending composition versus inheritance out loud.",
      "**For both:** Always clarify requirements and constraints before designing anything. The single biggest score-killer in either round is producing a confident answer to a question the interviewer never asked."
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "HLD and LLD are not competing skills - they are complementary halves of the same job. HLD gives you the architectural vision to design a system that survives real traffic; LLD gives you the discipline to build the components inside that system so they stay maintainable as requirements change. An engineer who can only do one is only half-ready for a senior interview loop."
  },
  {
    "type": "paragraph",
    "text": "The fastest way to get comfortable telling them apart is to practice both against the same prompt: sketch the architecture, then zoom into one service and model it in code. That switch in altitude, done deliberately, is exactly what interviewers are checking for."
  },
  {
    "type": "quote",
    "text": "Ready to practice the switch? Work through curated HLD and LLD prompts side by side on [LLDCanvas](/features/interview-questions)."
  }
]

// ─── Blog 4: lld-interview-questions ──────────────────────────────────────────────────
const blog4Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "These are the 25 Low-Level Design questions that show up most often across interview reports from Google, Amazon, Meta, Flipkart, Swiggy, Uber, Ola, CRED, Razorpay, and other top product companies. The ranking below reflects real frequency, not just popularity on paper -- if you can only prepare a subset before an interview, work top to bottom."
  },
  {
    "type": "paragraph",
    "text": "Rather than skim 25 shallow summaries, go deep on the first handful. Interviewers reuse the same underlying patterns -- State, Strategy, Factory, Observer -- across almost every question on this list, so mastering how they apply to a Parking Lot or an LRU Cache transfers directly to a dozen other prompts you haven't seen yet."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "The Top LLD Questions"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "1. Design a Parking Lot System"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** Very high | **Companies:** Amazon, Google, Flipkart. This is the single most-asked LLD question in the industry -- almost every machine-coding round includes some variant of it, because it packs inheritance, composition, and concurrency into one deceptively simple domain."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `ParkingLot`, `ParkingFloor`, `ParkingSpot`, `Vehicle` (Car / Bike / Truck), `Ticket`, `Payment`",
      "**Key patterns:** Factory (creating vehicle types), Strategy (pricing rules by spot type or duration), Singleton (a single `ParkingLot` instance), Observer (display boards reacting to occupancy changes)"
    ]
  },
  {
    "type": "paragraph",
    "text": "The detail that separates a strong answer from a mediocre one is how `ParkingSpot` decides what it can hold. Don't hardcode a switch on vehicle type inside the spot -- model spot compatibility as data (a `SpotType` that knows what it `accommodates()`) so adding a new vehicle or spot size never touches existing classes. This is the cleanest test of the Open/Closed Principle in the whole question, and interviewers probe it hardest."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public class ParkingSpot {\n  private SpotType type;\n  private boolean occupied;\n  private Vehicle currentVehicle;\n\n  public boolean canFit(Vehicle vehicle) {\n    return !occupied && type.accommodates(vehicle.getType());\n  }\n\n  public void parkVehicle(Vehicle vehicle) {\n    this.currentVehicle = vehicle;\n    this.occupied = true;\n  }\n}"
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "2. Design an LRU Cache"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** Very high | **Companies:** Google, Amazon, Uber. Less about class modeling and more about picking the right two data structures and wiring them together correctly under time pressure."
  },
  {
    "type": "bullets",
    "items": [
      "**Core structure:** a `HashMap` for O(1) key lookup paired with a doubly linked list for O(1) move-to-front and eviction",
      "**Why not just one:** a hashmap alone can't track recency order in O(1); a linked list alone can't locate a node in O(1) -- the combination is what makes both operations constant time"
    ]
  },
  {
    "type": "paragraph",
    "text": "The trap most candidates fall into is updating recency inside `get()` but forgetting to do it on `put()` for an existing key, or forgetting to remove the evicted node from the map as well as the list. Mention the dummy head/tail sentinel nodes out loud -- they eliminate null-checks at the boundaries and are what separates clean code from a pile of edge cases."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public class LRUCache<K, V> {\n  private final int capacity;\n  private final Map<K, Node<K, V>> map = new HashMap<>();\n  private final Node<K, V> head = new Node<>(null, null);\n  private final Node<K, V> tail = new Node<>(null, null);\n\n  public LRUCache(int capacity) {\n    this.capacity = capacity;\n    head.next = tail;\n    tail.prev = head;\n  }\n\n  public V get(K key) {\n    Node<K, V> node = map.get(key);\n    if (node == null) return null;\n    moveToFront(node);\n    return node.value;\n  }\n\n  public void put(K key, V value) {\n    if (map.containsKey(key)) {\n      map.get(key).value = value;\n      moveToFront(map.get(key));\n      return;\n    }\n    if (map.size() == capacity) {\n      Node<K, V> lru = tail.prev;\n      remove(lru);\n      map.remove(lru.key);\n    }\n    Node<K, V> node = new Node<>(key, value);\n    map.put(key, node);\n    addToFront(node);\n  }\n}"
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "3. Design an Elevator System"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** High | **Companies:** Amazon, Uber, Flipkart. This question tests whether you can model a system that reacts to external events over time, not just a static data structure."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `Elevator`, `ElevatorController`, `Request` (internal floor button vs. external hall call), `Door`",
      "**Key patterns:** State (`IDLE` / `MOVING_UP` / `MOVING_DOWN` / `DOOR_OPEN`), Strategy (the scheduling algorithm), Observer (floor displays and call buttons)"
    ]
  },
  {
    "type": "paragraph",
    "text": "Real elevators don't serve requests first-come-first-served -- they use the SCAN (or LOOK) algorithm: keep moving in one direction, picking up every request along the way, and only reverse once nothing is left ahead. Say this explicitly; it's the single fact that signals you've thought past 'moving between floors' into how dispatch actually works."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface ElevatorState {\n  void handleRequest(ElevatorController controller, int floor);\n}\n\npublic class MovingUpState implements ElevatorState {\n  public void handleRequest(ElevatorController controller, int floor) {\n    if (floor > controller.getCurrentFloor()) {\n      controller.addStop(floor);\n    } else {\n      controller.queueForNextDirection(floor);\n    }\n  }\n}\n\npublic class ElevatorController {\n  private ElevatorState state = new IdleState();\n\n  public void setState(ElevatorState state) {\n    this.state = state;\n  }\n}"
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "4. Design a Vending Machine"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** High | **Companies:** Google, Microsoft, Amazon. A compact, self-contained state machine that's ideal for testing whether you reach for the State pattern instead of a tangle of boolean flags."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `VendingMachine`, `Inventory`, `Product`, `Coin`/`Payment`, `VendingState`",
      "**Key patterns:** State (`Idle` / `HasMoney` / `Dispense` / `ReturnChange`), Singleton (one machine instance), Factory (building the right product or coin objects)"
    ]
  },
  {
    "type": "paragraph",
    "text": "Each state should implement a common `VendingState` interface with methods like `insertCoin()`, `selectProduct()`, and `dispense()`, and each concrete state decides which of those calls are even legal from that point. This is a textbook State pattern, and interviewers use it specifically to check whether you default to a five-branch if/else chain or to real polymorphism."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface VendingState {\n  void insertCoin(VendingMachine machine, Coin coin);\n  void selectProduct(VendingMachine machine, String code);\n  void dispense(VendingMachine machine);\n}\n\npublic class IdleState implements VendingState {\n  public void insertCoin(VendingMachine machine, Coin coin) {\n    machine.addBalance(coin.getValue());\n    machine.setState(new HasMoneyState());\n  }\n\n  public void selectProduct(VendingMachine machine, String code) {\n    throw new IllegalStateException(\"Insert coin first\");\n  }\n\n  public void dispense(VendingMachine machine) {\n    throw new IllegalStateException(\"Insert coin first\");\n  }\n}"
  },
  {
    "type": "divider"
  },
  {
    "type": "quote",
    "text": "**Practice these live:** All 25 problems in this list are available on [LLDCanvas](/features/interview-questions) with a problem brief, staged hints, and a UML canvas -- so you design before you code, the way a real interview works."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "5. Design a Library Management System"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** High | **Companies:** Amazon, Flipkart, and most product companies with an internal-tools flavor to their interview loop."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `Library`, `Book` (catalog metadata), `BookItem` (one physical copy), `Member`, `Loan`/`Reservation`",
      "**Key patterns:** Factory (member/account types), Strategy (fine calculation), Observer (notifying members when a reserved title becomes available)"
    ]
  },
  {
    "type": "paragraph",
    "text": "The modeling decision that matters most here is separating `Book` from `BookItem`. `Book` is the catalog entry -- title, author, ISBN -- while `BookItem` is one physical, borrowable copy with its own barcode and status. Collapse these into a single class and you can't represent a popular title with five copies, three of which are checked out; keep them separate and reservations, fines, and availability all fall out naturally."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "6. Design an ATM Machine"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** High | **Companies:** Amazon, banks and fintechs, and most generalist product companies."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `ATM`, `Card`, `Account`, `Transaction`, `CashDispenser`",
      "**Key patterns:** State (card inserted -> PIN entry -> transaction selection -> dispensing), Chain of Responsibility (breaking a withdrawal amount into denominations), Command (encapsulating each transaction type)"
    ]
  },
  {
    "type": "paragraph",
    "text": "Treat the ATM itself as a state machine first -- it's what stops your code from allowing a withdrawal before a PIN has been entered. Then treat cash dispensing as a Chain of Responsibility: a handler for 2000-rupee notes hands off the remainder to a handler for 500s, which hands off to 100s, so adding a new denomination never touches the withdrawal logic itself."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "7. Design a Chess Game"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** Medium-high | **Companies:** Google, Amazon, and companies that want to test polymorphism specifically rather than system-design breadth."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `Board`, `Piece` (King, Queen, Rook, Bishop, Knight, Pawn), `Player`, `Move`",
      "**Key patterns:** Abstract Factory (piece creation per side), Strategy (each piece's movement rule), Command (moves, enabling undo/redo and move history)"
    ]
  },
  {
    "type": "paragraph",
    "text": "Every `Piece` subclass should implement its own `getValidMoves(Board board)` -- that's the whole exercise. If you find yourself writing a big switch statement inside `Board` to figure out how a bishop moves, you've missed the point of the question; the polymorphism has to live on the piece, not on the board."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "8. Design a Ride-Sharing System (Uber / Lyft)"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** High, and rising | **Companies:** Uber, Ola, Amazon, and most companies in the mobility or logistics space."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `Rider`, `Driver`, `Trip`, `Location`, `MatchingService`, `Fare`",
      "**Key patterns:** Strategy (matching and pricing algorithms), Observer (live location updates to both parties), State (trip lifecycle), Factory (vehicle-tier specific trip objects)"
    ]
  },
  {
    "type": "paragraph",
    "text": "The trip itself is a state machine -- `REQUESTED` -> `MATCHED` -> `IN_PROGRESS` -> `COMPLETED`/`CANCELLED` -- and interviewers expect you to enumerate those states unprompted. The harder part they're actually probing for is the matching strategy: can you describe, even at a high level, how you'd find the nearest available driver using a geospatial index like a grid or geohash, instead of scanning every driver in the city?"
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "9. Design a Hotel Booking System"
  },
  {
    "type": "paragraph",
    "text": "**Frequency:** Medium-high | **Companies:** Amazon, Flipkart, and travel-tech companies running Airbnb- or MakeMyTrip-style rounds."
  },
  {
    "type": "bullets",
    "items": [
      "**Core entities:** `Hotel`, `Room` (by type/rate), `Booking`, `Guest`, `Payment`",
      "**Key patterns:** Factory (room-type creation), Strategy (dynamic pricing by season or demand), Command (booking actions for cancellation/modification)"
    ]
  },
  {
    "type": "paragraph",
    "text": "This question is really a concurrency question wearing a modeling costume. The core requirement is guaranteeing that no two guests can book the same room for overlapping dates -- which means your availability check and your booking write must be atomic (a database transaction with proper locking, or an optimistic-concurrency version check), not two separate steps that can race each other."
  },
  {
    "type": "divider"
  },
  {
    "type": "quote",
    "text": "Shaky on when to reach for Strategy versus State versus Observer? The [Design Patterns for LLD Interviews guide](/blog/design-patterns-guide) walks through exactly when each pattern earns its place in an interview answer."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Questions 10-25: Quick Reference"
  },
  {
    "type": "paragraph",
    "text": "The remaining questions appear less often individually, but you should still recognize the core pattern for each at a glance. Use this table as a final review pass the night before an interview."
  },
  {
    "type": "table",
    "headers": [
      "#",
      "Problem",
      "Top Patterns",
      "Key Insight"
    ],
    "rows": [
      [
        "10",
        "Pub-Sub System",
        "Observer, Strategy, Factory",
        "Decide push vs. pull delivery up front -- it shapes everything else"
      ],
      [
        "11",
        "Snake and Ladder",
        "State, Command",
        "Board state is immutable; only player position changes each turn"
      ],
      [
        "12",
        "Splitwise",
        "Graph, Strategy",
        "Simplify group debts with a min-cash-flow algorithm"
      ],
      [
        "13",
        "Movie Ticket Booking",
        "Factory, Strategy, Command",
        "Seat locks need a short expiry, or inventory gets stuck"
      ],
      [
        "14",
        "Food Delivery",
        "State, Observer, Strategy",
        "Order status is a state machine; notify every watcher on transition"
      ],
      [
        "15",
        "LinkedIn Clone",
        "Composite, Observer",
        "Model connections as a graph, not a flat list"
      ],
      [
        "16",
        "Online Auction",
        "Observer, Strategy, State",
        "The auction itself is a state machine: open, bidding, closed"
      ],
      [
        "17",
        "Car Rental",
        "Factory, Strategy, Command",
        "Track availability as a matrix of vehicle x date range"
      ],
      [
        "18",
        "Course Registration",
        "Factory, Observer, Composite",
        "Prerequisites form a directed graph, not a flat list"
      ],
      [
        "19",
        "Task Manager",
        "Observer, Command, Composite",
        "Tasks are state machines that can contain subtasks"
      ],
      [
        "20",
        "Inventory System",
        "Observer, Strategy, Factory",
        "Low-stock triggers should be event-driven, not polled"
      ],
      [
        "21",
        "Stock Exchange",
        "Command, Observer, Strategy",
        "The real challenge is the order-matching engine"
      ],
      [
        "22",
        "Coffee Vending Machine",
        "State, Factory",
        "Same shape as the vending machine, but ingredient stock replaces coins"
      ],
      [
        "23",
        "Hospital Management",
        "Factory, Observer, Strategy",
        "Patient triage needs priority-based scheduling, not FIFO"
      ],
      [
        "24",
        "Restaurant Management",
        "Observer, Decorator, State",
        "Order customization (extra cheese, no onions) suits Decorator well"
      ],
      [
        "25",
        "Airline Management",
        "State, Factory, Strategy",
        "Booking uses a hold-then-confirm two-step flow, not a single write"
      ]
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "Twenty-five questions is a lot to hold in your head at once, but they collapse into a much smaller set of ideas once you notice the overlap: State machines show up in more than half of them, Strategy in nearly all, and Observer in most of the rest. Learn those three patterns well enough to recognize them instantly, and this stops looking like 25 separate problems and starts looking like the same handful of decisions applied to different domains."
  },
  {
    "type": "paragraph",
    "text": "If you only have time to prepare a handful of these before an interview, prioritize questions 1 through 4 -- they're asked most frequently, they cover the widest range of patterns, and interviewers routinely default to one of them when they don't have a specific system in mind. Everything from question 5 onward is a variation you'll recognize once the core four are second nature."
  },
  {
    "type": "quote",
    "text": "**Next step:** Work through the full [LLD Interview Roadmap](/blog/lld-interview-roadmap) to turn this list into a structured, week-by-week study plan."
  }
]

// ─── Blog 5: solid-principles-explained ──────────────────────────────────────────────────
const blog5Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "Robert C. Martin (\"Uncle Bob\") coined the SOLID acronym in 2000 to describe five object-oriented design principles that had already been circulating in the industry for years. More than two decades later, SOLID is still the most common vocabulary interviewers reach for when they ask you to design or critique a class hierarchy, because the principles capture recurring failure modes rather than abstract theory."
  },
  {
    "type": "paragraph",
    "text": "Each principle answers a version of the same question: *when requirements change, how much of my code has to change with them?* Code that violates SOLID tends to work fine on day one and become brittle by month three - new features require touching classes that have nothing to do with the feature, and a single bug fix ripples across the codebase. Learning to spot these violations, and to fix them with the right pattern, is one of the highest-leverage skills for both interviews and production work."
  },
  {
    "type": "table",
    "headers": [
      "Principle",
      "One-line summary"
    ],
    "rows": [
      [
        "Single Responsibility (SRP)",
        "A class should have only one reason to change."
      ],
      [
        "Open/Closed (OCP)",
        "Software entities should be open for extension but closed for modification."
      ],
      [
        "Liskov Substitution (LSP)",
        "Subtypes must be substitutable for their base types without breaking correctness."
      ],
      [
        "Interface Segregation (ISP)",
        "Clients should not be forced to depend on methods they do not use."
      ],
      [
        "Dependency Inversion (DIP)",
        "Depend on abstractions, not on concrete implementations."
      ]
    ]
  },
  {
    "type": "quote",
    "text": "Want to see SOLID applied inside full design problems, not just toy examples? The [revision notes on LLDCanvas](/features/revision-notes) walk through all five principles with interactive, annotated code."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "S - Single Responsibility Principle (SRP)"
  },
  {
    "type": "paragraph",
    "text": "**Definition:** a class should have only one reason to change. In practice this means a class should own exactly one job - one axis along which requirements can evolve - and delegate everything else. SRP is the principle interviewers probe most often because \"God classes\" that mix business logic, persistence, and presentation are extremely common in real codebases."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// BAD: Employee has three separate reasons to change -\n// a payroll rule change, a database schema change, or a report format change.\npublic class Employee {\n    public double calculatePay() {\n        // business/payroll logic\n        return baseSalary * 1.1;\n    }\n\n    public void save() {\n        // JDBC / SQL persistence logic\n        String sql = \"INSERT INTO employees VALUES (...)\";\n        // execute(sql);\n    }\n\n    public String generateReport() {\n        // report formatting logic\n        return \"Employee Report: \" + this.toString();\n    }\n}"
  },
  {
    "type": "paragraph",
    "text": "Notice that a change to how paychecks are calculated, a change to the database vendor, and a change to report formatting all land in the same file. Three unrelated teams could end up editing `Employee` in the same sprint, and a typo in the reporting method can break something that has nothing to do with reports."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// GOOD: each class has exactly one responsibility.\npublic class Employee {\n    private double baseSalary;\n    public double calculatePay() {\n        return baseSalary * 1.1;\n    }\n}\n\npublic class EmployeeRepository {\n    public void save(Employee e) {\n        // JDBC / SQL persistence logic lives here only\n    }\n}\n\npublic class EmployeeReportGenerator {\n    public String generate(Employee e) {\n        return \"Employee Report: \" + e;\n    }\n}"
  },
  {
    "type": "paragraph",
    "text": "The payoff is isolation: a schema migration only touches `EmployeeRepository`, a new payslip format only touches `EmployeeReportGenerator`, and none of that logic needs to be re-tested when the other two change. SRP is also what makes unit testing tractable - a class with one responsibility needs far fewer mocks and far fewer test permutations."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "O - Open/Closed Principle (OCP)"
  },
  {
    "type": "paragraph",
    "text": "**Definition:** software entities (classes, modules, functions) should be open for extension but closed for modification. In other words, adding a new behavior should mean *adding new code*, not editing code that already works and is already tested."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// BAD: every new customer tier means editing this method again.\npublic class DiscountCalculator {\n    public double calculate(Order order) {\n        if (order.getType() == CustomerType.REGULAR) {\n            return order.getTotal() * 0.05;\n        } else if (order.getType() == CustomerType.PREMIUM) {\n            return order.getTotal() * 0.10;\n        }\n        // A new tier means: modify this method, redeploy, retest everything.\n        return 0;\n    }\n}"
  },
  {
    "type": "paragraph",
    "text": "This `if/else` chain grows forever, and every edit risks breaking a discount rule that used to work. It also violates SRP in a subtle way - `DiscountCalculator` now has to know about every customer type that will ever exist."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// GOOD: Strategy pattern - new tiers are new classes, DiscountCalculator never changes.\npublic interface DiscountStrategy {\n    double calculate(Order order);\n}\n\npublic class RegularDiscount implements DiscountStrategy {\n    public double calculate(Order order) { return order.getTotal() * 0.05; }\n}\n\npublic class PremiumDiscount implements DiscountStrategy {\n    public double calculate(Order order) { return order.getTotal() * 0.10; }\n}\n\npublic class DiscountCalculator {\n    private final DiscountStrategy strategy;\n    public DiscountCalculator(DiscountStrategy strategy) { this.strategy = strategy; }\n    public double calculate(Order order) { return strategy.calculate(order); }\n}"
  },
  {
    "type": "paragraph",
    "text": "Adding a `LoyaltyDiscount` tier now means writing one new class and wiring it in - `DiscountCalculator` itself is never touched again, so it never needs to be re-reviewed or re-tested for regressions. This is the principle underneath most of the Strategy, Decorator, and Factory patterns you'll be asked about in LLD interviews."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "L - Liskov Substitution Principle (LSP)"
  },
  {
    "type": "paragraph",
    "text": "**Definition:** objects of a subclass must be substitutable for objects of the superclass without altering the correctness of the program. If code that works with a `Shape` breaks when handed a specific subclass, that subclass has violated its parent's contract - inheritance is being used for code reuse instead of for a genuine \"is-a\" relationship."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// BAD: Square \"is-a\" Rectangle in geometry, but not in code -\n// overriding setWidth/setHeight breaks the Rectangle contract.\npublic class Rectangle {\n    protected int width, height;\n    public void setWidth(int w)  { this.width = w; }\n    public void setHeight(int h) { this.height = h; }\n    public int getArea() { return width * height; }\n}\n\npublic class Square extends Rectangle {\n    @Override\n    public void setWidth(int w)  { width = height = w; }  // silently changes height too!\n    @Override\n    public void setHeight(int h) { width = height = h; }  // silently changes width too!\n}\n\n// Any code written and tested against Rectangle now breaks:\nRectangle r = new Square();\nr.setWidth(5);\nr.setHeight(10);\nassert r.getArea() == 50; // FAILS - actually returns 100"
  },
  {
    "type": "paragraph",
    "text": "The bug isn't in `Square` or `Rectangle` individually - it's that `Square` cannot honor every promise `Rectangle` makes (independent width/height mutation), yet the type system claims it can. Any caller that trusted the `Rectangle` contract now gets silently wrong answers."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// GOOD: no inheritance relationship where none truly exists.\n// Both shapes implement a shared, narrower contract instead.\npublic interface Shape {\n    int getArea();\n}\n\npublic class Rectangle implements Shape {\n    private final int width, height;\n    public Rectangle(int w, int h) { this.width = w; this.height = h; }\n    public int getArea() { return width * height; }\n}\n\npublic class Square implements Shape {\n    private final int side;\n    public Square(int side) { this.side = side; }\n    public int getArea() { return side * side; }\n}"
  },
  {
    "type": "paragraph",
    "text": "Making both shapes immutable and independent removes the shared mutable state that caused the contract violation in the first place. The general lesson generalizes well beyond geometry: before extending a class, ask whether every method the base class exposes still makes sense - and behaves identically - on the subclass. If not, favor composition or a shared interface over inheritance."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "I - Interface Segregation Principle (ISP)"
  },
  {
    "type": "paragraph",
    "text": "**Definition:** clients should not be forced to depend on methods they do not use. Wide, \"fat\" interfaces force every implementer to either support behavior that makes no sense for it, or throw exceptions from stub methods - both are red flags in a design review."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// BAD: a single fat interface forces every worker to implement everything.\npublic interface WorkerInterface {\n    void work();\n    void eat();\n    void sleep();\n}\n\npublic class Robot implements WorkerInterface {\n    public void work()  { /* does actual work */ }\n    public void eat()   { throw new UnsupportedOperationException(); }\n    public void sleep() { throw new UnsupportedOperationException(); }\n}"
  },
  {
    "type": "paragraph",
    "text": "`Robot` is forced to declare methods it can never meaningfully implement. Any code that iterates over `WorkerInterface` and calls `eat()` polymorphically will now crash the moment a `Robot` is in the list - the interface made a promise on the class's behalf that the class cannot keep."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// GOOD: split into focused, single-purpose interfaces.\npublic interface Workable  { void work();  }\npublic interface Eatable   { void eat();   }\npublic interface Sleepable { void sleep(); }\n\npublic class Robot implements Workable {\n    public void work() { /* does actual work */ }\n}\n\npublic class HumanWorker implements Workable, Eatable, Sleepable {\n    public void work()  { /* ... */ }\n    public void eat()   { /* ... */ }\n    public void sleep() { /* ... */ }\n}"
  },
  {
    "type": "paragraph",
    "text": "Now each class only implements the capabilities it genuinely has, and code that depends on `Eatable` can never accidentally be handed a `Robot`. Smaller interfaces also make mocking in unit tests trivial - you implement exactly the one method the test needs, nothing more."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "D - Dependency Inversion Principle (DIP)"
  },
  {
    "type": "paragraph",
    "text": "**Definition:** high-level modules should not depend on low-level modules - both should depend on abstractions. DIP is what makes a codebase testable and swappable: business logic should never `new` up a concrete database, HTTP client, or file writer directly."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// BAD: OrderService is welded to one concrete database implementation.\npublic class OrderService {\n    private MySQLOrderRepository repository = new MySQLOrderRepository();\n\n    public void placeOrder(Order order) {\n        repository.save(order);\n    }\n}"
  },
  {
    "type": "paragraph",
    "text": "There is no way to unit test `OrderService` without a real MySQL connection, and no way to switch to Postgres, DynamoDB, or an in-memory store for tests without rewriting `OrderService` itself. The high-level policy (\"place an order\") is chained to a low-level detail (\"MySQL\")."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// GOOD: OrderService depends on an abstraction, not a concrete class.\npublic interface OrderRepository {\n    void save(Order order);\n}\n\npublic class MySQLOrderRepository implements OrderRepository {\n    public void save(Order order) { /* JDBC logic */ }\n}\n\npublic class OrderService {\n    private final OrderRepository repository;\n\n    public OrderService(OrderRepository repository) {\n        this.repository = repository; // injected, not constructed\n    }\n\n    public void placeOrder(Order order) {\n        repository.save(order);\n    }\n}"
  },
  {
    "type": "paragraph",
    "text": "`OrderService` now only knows about the `OrderRepository` contract. Tests can inject an in-memory fake, production can inject `MySQLOrderRepository`, and a future migration to a different database only requires a new class that implements the same interface - `OrderService` never changes. This is the principle behind dependency injection frameworks like Spring, and it is the reason \"program to an interface, not an implementation\" shows up in nearly every design pattern."
  },
  {
    "type": "quote",
    "text": "Curious how these five principles show up inside real interview problems, not isolated snippets? Browse [LLDCanvas's practice problems](/features/interview-questions) to apply SOLID to full class designs."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "SOLID is not a checklist to recite - it's a diagnostic lens. When a class is hard to test, ask whether it's doing too much (SRP). When adding a feature means editing five existing files, ask whether the design should have been open for extension instead (OCP). When a subclass needs special-case handling from its callers, question the inheritance itself (LSP). When an implementation is full of stub methods, split the interface (ISP). And when a class can't be tested without a live dependency, invert that dependency (DIP)."
  },
  {
    "type": "paragraph",
    "text": "In an interview, the strongest signal you can give isn't reciting definitions - it's noticing a violation in your own design mid-explanation and refactoring toward the right pattern out loud. That instinct only comes from having written both the violation and the fix enough times that the smell becomes automatic."
  }
]

// ─── Blog 6: design-patterns-guide ──────────────────────────────────────────────────
const blog6Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "A **design pattern** is a reusable, named solution to a problem that recurs in a particular context of object-oriented design. Patterns are not code you copy-paste - they are a shared vocabulary. When one engineer says \"just make it a Strategy\" instead of explaining a five-step refactor, the whole team saves time. That shared vocabulary is exactly why patterns show up so often in low-level design (LLD) interviews: they let you communicate a design decision in one word instead of a paragraph."
  },
  {
    "type": "paragraph",
    "text": "The canonical reference is the 1994 book *Design Patterns: Elements of Reusable Object-Oriented Software* by Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides - collectively known as the **Gang of Four (GoF)**. It catalogs 23 patterns split into three families: **Creational** (how objects get created), **Structural** (how objects and classes are composed into larger structures), and **Behavioral** (how objects communicate and share responsibility). This guide covers all 23, with working Java for the ten you are most likely to actually write in an interview or a real codebase."
  },
  {
    "type": "quote",
    "text": "**Practice on a canvas:** [LLDCanvas's editor](/features/editor) ships with pre-wired templates for every GoF pattern, so you can trace the class relationships instead of just reading about them."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Creational Patterns"
  },
  {
    "type": "paragraph",
    "text": "Creational patterns abstract away the details of *how* and *when* objects are instantiated, so client code depends on interfaces rather than concrete constructors."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Singleton"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Guarantee that a class has exactly one instance and provide a single global point of access to it. **Used in:** loggers, configuration managers, connection pools, thread pools - anywhere a shared, expensive-to-create resource must not be duplicated. The main interview trap is thread safety: a naive lazy-initialized singleton can produce two instances under concurrent access, which is why double-checked locking (or an enum, or a static holder class) is expected in a serious answer."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public class Logger {\n    private static volatile Logger instance;\n\n    private Logger() {}\n\n    public static Logger getInstance() {\n        if (instance == null) {\n            synchronized (Logger.class) {\n                if (instance == null) {\n                    instance = new Logger();\n                }\n            }\n        }\n        return instance;\n    }\n\n    public void log(String message) {\n        System.out.println(\"[LOG] \" + message);\n    }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Factory Method"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Define an interface for creating an object, but let subclasses decide which concrete class to instantiate. **Used in:** payment processors that vary by provider, document parsers that vary by file type, UI toolkits that render differently per OS. The caller only ever talks to the abstract type, so adding a new variant means adding a new subclass - no existing code changes, which is the whole point of the open-closed principle."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public abstract class PaymentProcessor {\n    public abstract Payment createPayment(double amount);\n\n    public void process(double amount) {\n        Payment payment = createPayment(amount);\n        payment.validate();\n        payment.charge();\n        payment.sendReceipt();\n    }\n}\n\npublic class StripeProcessor extends PaymentProcessor {\n    @Override\n    public Payment createPayment(double amount) {\n        return new StripePayment(amount);\n    }\n}\n\npublic class PayPalProcessor extends PaymentProcessor {\n    @Override\n    public Payment createPayment(double amount) {\n        return new PayPalPayment(amount);\n    }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Builder"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Separate the construction of a complex object from its representation, so the same construction process can build different representations - and so callers avoid a constructor with ten optional parameters. **Used in:** HTTP client requests, SQL query builders, immutable domain objects with many optional fields. A fluent builder also makes call sites self-documenting, since every argument is named."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "HttpRequest request = new HttpRequest.Builder(\"GET\", \"https://api.example.com\")\n    .header(\"Authorization\", \"Bearer token123\")\n    .timeout(Duration.ofSeconds(30))\n    .retry(3)\n    .build();"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "A few more creational patterns"
  },
  {
    "type": "bullets",
    "items": [
      "**Abstract Factory:** Produces families of related objects (for example, a `WindowsFactory` that creates matching `WindowsButton` and `WindowsCheckbox` objects) without specifying their concrete classes.",
      "**Prototype:** Creates new objects by cloning an existing, fully-configured instance instead of building one from scratch - useful when object construction is expensive or configuration-heavy."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Structural Patterns"
  },
  {
    "type": "paragraph",
    "text": "Structural patterns describe how classes and objects are composed into larger structures while keeping those structures flexible and efficient."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Decorator"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Attach additional responsibilities to an object dynamically, as a flexible alternative to subclassing. **Used in:** Java I/O streams (`BufferedReader` wrapping a `FileReader`), UI components (scrollable, bordered widgets), and middleware that wraps a request handler with logging, caching, or auth checks. Each decorator implements the same interface as the object it wraps, so decorators stack transparently."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface Coffee {\n    double cost();\n}\n\npublic class SimpleCoffee implements Coffee {\n    public double cost() { return 1.00; }\n}\n\npublic abstract class CoffeeDecorator implements Coffee {\n    protected final Coffee wrapped;\n    protected CoffeeDecorator(Coffee wrapped) { this.wrapped = wrapped; }\n}\n\npublic class MilkDecorator extends CoffeeDecorator {\n    public MilkDecorator(Coffee wrapped) { super(wrapped); }\n    public double cost() { return wrapped.cost() + 0.30; }\n}\n\npublic class SugarDecorator extends CoffeeDecorator {\n    public SugarDecorator(Coffee wrapped) { super(wrapped); }\n    public double cost() { return wrapped.cost() + 0.20; }\n}\n\n// Usage\nCoffee coffee = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));\nSystem.out.println(coffee.cost()); // 1.50"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Facade"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Provide a single, simplified interface to a complex subsystem of many interacting classes. **Used in:** e-commerce checkout flows, where one method call quietly coordinates inventory, payment, shipping, and notifications. A facade does not hide the subsystem's classes from callers who need finer control - it just gives everyone else a one-line entry point for the common case."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public class OrderFacade {\n    private final InventoryService inventory;\n    private final PaymentService payment;\n    private final ShippingService shipping;\n    private final NotificationService notifications;\n\n    public OrderFacade(InventoryService inventory, PaymentService payment,\n                        ShippingService shipping, NotificationService notifications) {\n        this.inventory = inventory;\n        this.payment = payment;\n        this.shipping = shipping;\n        this.notifications = notifications;\n    }\n\n    public void placeOrder(Order order) {\n        inventory.reserve(order.getItems());\n        payment.charge(order.getCustomer(), order.getTotal());\n        shipping.schedule(order);\n        notifications.sendConfirmation(order.getCustomer());\n    }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Composite"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Compose objects into tree structures and let clients treat individual objects and compositions of objects uniformly. **Used in:** file systems (files and folders), UI component trees, and org charts. Both the leaf and the container implement the same interface, so code that walks the tree never needs to check \"is this a file or a folder?\"."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface FileSystemNode {\n    long size();\n}\n\npublic class File implements FileSystemNode {\n    private final long sizeInBytes;\n    public File(long sizeInBytes) { this.sizeInBytes = sizeInBytes; }\n    public long size() { return sizeInBytes; }\n}\n\npublic class Folder implements FileSystemNode {\n    private final List<FileSystemNode> children = new ArrayList<>();\n\n    public void add(FileSystemNode node) { children.add(node); }\n\n    public long size() {\n        return children.stream().mapToLong(FileSystemNode::size).sum();\n    }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "A few more structural patterns"
  },
  {
    "type": "bullets",
    "items": [
      "**Adapter:** Converts the interface of a class into another interface clients expect - for example, wrapping a legacy `XmlParser` behind a `JsonParser`-shaped interface.",
      "**Bridge:** Decouples an abstraction from its implementation so the two can vary independently, such as a `Shape` hierarchy that can render through different `DrawingAPI` implementations.",
      "**Flyweight:** Shares fine-grained objects to support large numbers of them efficiently - the classic example is caching glyph objects when rendering text.",
      "**Proxy:** Provides a stand-in for another object to control access to it, adding lazy loading, caching, access control, or logging without changing the real object."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Behavioral Patterns"
  },
  {
    "type": "paragraph",
    "text": "Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects - how they communicate and stay loosely coupled while doing so."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Observer"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically. **Used in:** stock price feeds, event-driven UIs, pub/sub messaging systems. The subject only knows about a generic observer interface, so new subscriber types can be added without touching the subject."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface StockObserver {\n    void onPriceChange(String symbol, double price);\n}\n\npublic class StockMarket {\n    private final Map<String, List<StockObserver>> observers = new HashMap<>();\n\n    public void subscribe(String symbol, StockObserver observer) {\n        observers.computeIfAbsent(symbol, k -> new ArrayList<>()).add(observer);\n    }\n\n    public void updatePrice(String symbol, double price) {\n        observers.getOrDefault(symbol, List.of())\n                 .forEach(o -> o.onPriceChange(symbol, price));\n    }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Strategy"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Define a family of interchangeable algorithms, encapsulate each one, and let the client swap them at runtime. **Used in:** payment methods at checkout, sorting/compression algorithms chosen by data size, route-calculation engines that switch between fastest-route and shortest-route logic. The context class holds a reference to a strategy interface and never has an `if/else` chain over algorithm types."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface PaymentStrategy {\n    void pay(double amount);\n}\n\npublic class CreditCardStrategy implements PaymentStrategy {\n    public void pay(double amount) { System.out.println(\"Charged $\" + amount + \" to credit card\"); }\n}\n\npublic class UpiStrategy implements PaymentStrategy {\n    public void pay(double amount) { System.out.println(\"Paid $\" + amount + \" via UPI\"); }\n}\n\npublic class Checkout {\n    private PaymentStrategy strategy;\n\n    public void setStrategy(PaymentStrategy strategy) { this.strategy = strategy; }\n\n    public void checkout(double amount) { strategy.pay(amount); }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Command"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Encapsulate a request as a standalone object, so requests can be queued, logged, parameterized, and - crucially - undone. **Used in:** text editor undo/redo stacks, remote controls, task queues, and transactional operations that need rollback. Each command knows how to `execute()` and how to `undo()`, and an invoker just holds a history of executed commands."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface Command {\n    void execute();\n    void undo();\n}\n\npublic class LightOnCommand implements Command {\n    private final Light light;\n    public LightOnCommand(Light light) { this.light = light; }\n    public void execute() { light.turnOn(); }\n    public void undo() { light.turnOff(); }\n}\n\npublic class RemoteControl {\n    private final Deque<Command> history = new ArrayDeque<>();\n\n    public void submit(Command command) {\n        command.execute();\n        history.push(command);\n    }\n\n    public void undoLast() {\n        if (!history.isEmpty()) history.pop().undo();\n    }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "State"
  },
  {
    "type": "paragraph",
    "text": "**Intent:** Allow an object to alter its behavior when its internal state changes, so it appears to change its class. **Used in:** ATMs, vending machines, and order lifecycle management (`PLACED` -> `PAID` -> `SHIPPED` -> `DELIVERED`). Instead of a single class riddled with state-flag conditionals, each state is its own class that knows exactly which transitions are legal from there."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface OrderState {\n    void next(OrderContext context);\n}\n\npublic class PlacedState implements OrderState {\n    public void next(OrderContext context) {\n        System.out.println(\"Payment received, order is now PAID\");\n        context.setState(new PaidState());\n    }\n}\n\npublic class PaidState implements OrderState {\n    public void next(OrderContext context) {\n        System.out.println(\"Order shipped, now SHIPPED\");\n        context.setState(new ShippedState());\n    }\n}\n\npublic class OrderContext {\n    private OrderState state = new PlacedState();\n    public void setState(OrderState state) { this.state = state; }\n    public void advance() { state.next(this); }\n}"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "A few more behavioral patterns"
  },
  {
    "type": "bullets",
    "items": [
      "**Chain of Responsibility:** Passes a request along a chain of handlers until one of them handles it - the model behind HTTP middleware and authentication pipelines.",
      "**Template Method:** Defines the skeleton of an algorithm in a base class and lets subclasses override individual steps without changing the overall structure.",
      "**Iterator:** Provides a way to access elements of a collection sequentially without exposing its underlying representation - what every `for-each` loop relies on.",
      "**Mediator:** Centralizes complex communication between a set of objects into one mediator object, so those objects no longer reference each other directly (common in chat rooms and air-traffic-control style systems).",
      "**Memento:** Captures and externalizes an object's internal state so it can be restored later, without violating encapsulation - the basis of undo history and save/restore snapshots.",
      "**Visitor:** Lets you add new operations to a group of related classes without modifying them, by having each class accept a visitor object.",
      "**Interpreter:** Defines a representation for a language's grammar along with an interpreter that uses it to evaluate sentences - the basis of rule engines and simple expression parsers."
    ]
  },
  {
    "type": "quote",
    "text": "**See patterns in real problems:** browse [LLDCanvas's interview question bank](/features/interview-questions) to see which pattern fits problems like Parking Lot, Elevator System, and Rate Limiter."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "Twenty-three patterns is a lot to memorize, but you do not need all of them equally. In interviews and in production code, a small subset does most of the work: **Singleton, Factory Method, Builder, Decorator, Facade, Observer, Strategy, Command,** and **State** cover the overwhelming majority of LLD problems you will encounter, from parking lots to rate limiters to order-management systems. Learn those nine deeply - their intent, their trade-offs, and how to code them cold - and treat the remaining fourteen as a recognition vocabulary you can look up when the situation calls for them."
  },
  {
    "type": "paragraph",
    "text": "The fastest way to make a pattern stick is to apply it to a problem you actually care about solving, not to memorize its class diagram. Pick a pattern, pick a real system, and build it."
  }
]

// ─── Blog 7: oop-concepts-for-interviews ──────────────────────────────────────────────────
const blog7Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "Object-oriented programming is not a trivia topic reserved for the first ten minutes of an interview — it is the lens through which every low-level design question gets evaluated. When an interviewer asks you to design a parking lot, a rate limiter, or a splitwise clone, they are really asking: *can you organize state and behavior so the system stays correct as it grows?* That question is answered entirely by how well you apply encapsulation, abstraction, inheritance, and polymorphism."
  },
  {
    "type": "paragraph",
    "text": "This guide walks through each of the four pillars with a concrete **before/after** Java example, then covers the two decisions that separate a junior design from a senior one: composition vs. inheritance, and interface vs. abstract class. It closes with the questions interviewers actually ask about OOP, so you can check your understanding before walking into the room."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "1. Encapsulation"
  },
  {
    "type": "paragraph",
    "text": "Encapsulation means bundling related data and the behavior that operates on it into a single unit, and restricting direct access to that internal state. It is the difference between a class that merely *stores* fields and one that *protects invariants*. If any part of your codebase can reach in and mutate a field without going through validated logic, that class has no real encapsulation, no matter how many methods it has."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// Without encapsulation\npublic class BankAccount {\n  public double balance;  // Direct access = no validation\n}\n\nBankAccount account = new BankAccount();\naccount.balance = -1000;  // Allowed! Nothing stops this.\n\n// With encapsulation\npublic class BankAccount {\n  private double balance;\n\n  public void deposit(double amount) {\n    if (amount <= 0) {\n      throw new IllegalArgumentException(\"Amount must be positive\");\n    }\n    balance += amount;\n  }\n\n  public void withdraw(double amount) {\n    if (amount <= 0 || amount > balance) {\n      throw new IllegalArgumentException(\"Invalid withdrawal amount\");\n    }\n    balance -= amount;\n  }\n\n  public double getBalance() {\n    return balance;\n  }\n}"
  },
  {
    "type": "paragraph",
    "text": "The payoff isn't stylistic. Once `balance` is private and only reachable through `deposit`/`withdraw`, the class becomes the single source of truth for what a valid state looks like. You can add logging, transaction limits, or currency conversion inside those methods later without touching a single caller — because callers never depended on the internal representation in the first place."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "2. Abstraction"
  },
  {
    "type": "paragraph",
    "text": "Abstraction exposes only the essential operations a client needs, and hides how those operations are implemented. It is easy to confuse with encapsulation, but the two solve different problems: encapsulation protects *state*, abstraction simplifies *interface*. A well-abstracted system lets you swap an entire implementation without any caller noticing."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// Without abstraction - client is coupled to a specific provider\npublic class CheckoutService {\n  private final RazorpayClient razorpay = new RazorpayClient();\n\n  public void checkout(Cart cart) {\n    razorpay.charge(cart.getTotal(), \"INR\"); // stuck with Razorpay forever\n  }\n}\n\n// With abstraction\npublic interface PaymentGateway {\n  boolean processPayment(double amount, String currency);\n  PaymentStatus getStatus(String transactionId);\n}\n\npublic class CheckoutService {\n  private final PaymentGateway gateway; // Razorpay, Stripe, or a mock in tests\n\n  public CheckoutService(PaymentGateway gateway) {\n    this.gateway = gateway;\n  }\n\n  public void checkout(Cart cart) {\n    gateway.processPayment(cart.getTotal(), \"INR\");\n  }\n}"
  },
  {
    "type": "paragraph",
    "text": "With the interface in place, `CheckoutService` never knows or cares which gateway is behind it. That is what makes it trivially testable (inject a fake `PaymentGateway`) and what lets the business switch payment providers in a region without a rewrite. This is also the mechanism behind the Strategy and Dependency Injection patterns you will use constantly in LLD rounds."
  },
  {
    "type": "quote",
    "text": "If you want to see abstraction used at scale in a real design, work through the [Strategy pattern examples](/features/design-patterns) and notice how every one of them hides an interface behind a swappable implementation."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "3. Inheritance"
  },
  {
    "type": "paragraph",
    "text": "Inheritance lets a child class acquire the properties and behavior of a parent class, and is appropriate for genuine **is-a** relationships — a `SavingsAccount` *is a* `BankAccount`, a `Dog` *is an* `Animal`. Used well, it eliminates duplication. Used to force a relationship that is really \"has-a\" or \"can-do\", it creates a rigid hierarchy that breaks the moment requirements shift."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// Without inheritance - duplicated logic across account types\npublic class SavingsAccount {\n  private double balance;\n  public void deposit(double amount) { /* same validation copy-pasted */ }\n}\npublic class CurrentAccount {\n  private double balance;\n  public void deposit(double amount) { /* same validation copy-pasted again */ }\n}\n\n// With inheritance - shared behavior lives in one place\npublic abstract class BankAccount {\n  protected double balance;\n\n  public void deposit(double amount) {\n    if (amount <= 0) throw new IllegalArgumentException(\"Invalid amount\");\n    balance += amount;\n  }\n\n  public abstract double getInterestRate();\n}\n\npublic class SavingsAccount extends BankAccount {\n  public double getInterestRate() { return 0.04; }\n}\n\npublic class CurrentAccount extends BankAccount {\n  public double getInterestRate() { return 0.0; }\n}"
  },
  {
    "type": "paragraph",
    "text": "The shared `deposit` validation now lives exactly once, and each subclass only adds what genuinely differs. The danger interviewers are probing for is a hierarchy that goes three or four levels deep to reuse a single method, which tightly couples unrelated classes and makes every change ripple outward. That danger is exactly why the next section exists."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "4. Polymorphism"
  },
  {
    "type": "paragraph",
    "text": "Polymorphism lets objects of different types be treated through a common interface, with the correct behavior selected automatically. It comes in two flavors that interviewers routinely test: **compile-time polymorphism** (method overloading, resolved by the compiler based on argument types) and **runtime polymorphism** (method overriding, resolved by the JVM based on the actual object type at execution time)."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "// Runtime polymorphism (overriding)\nabstract class Animal {\n  abstract void speak();\n}\nclass Dog extends Animal { void speak() { System.out.println(\"Woof!\"); } }\nclass Cat extends Animal { void speak() { System.out.println(\"Meow!\"); } }\nclass Bird extends Animal { void speak() { System.out.println(\"Tweet!\"); } }\n\nAnimal[] animals = { new Dog(), new Cat(), new Bird() };\nfor (Animal a : animals) {\n  a.speak(); // the correct override runs, decided at runtime\n}\n\n// Compile-time polymorphism (overloading)\nclass Calculator {\n  int add(int a, int b) { return a + b; }\n  double add(double a, double b) { return a + b; }\n  int add(int a, int b, int c) { return a + b + c; }\n}"
  },
  {
    "type": "paragraph",
    "text": "Without polymorphism, the caller in the loop above would need an `if (animal instanceof Dog)` chain that grows every time a new animal type is added — a classic violation of the Open/Closed Principle. Polymorphism moves that branching decision into the type system itself, so adding a `Fish` class requires zero changes to existing calling code."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Composition vs. Inheritance"
  },
  {
    "type": "paragraph",
    "text": "Interviewers push hard here because Java doesn't allow multiple class inheritance, and real systems constantly need to combine independent behaviors. Consider an amphibious vehicle that needs to both drive and sail: `class Amphibious extends LandVehicle, WaterVehicle` is a compile error. Composition solves it by having the class *hold* the behaviors it needs rather than *becoming* them."
  },
  {
    "type": "code",
    "lang": "java",
    "code": "public interface Driveable { void drive(); }\npublic interface Sailable  { void sail();  }\n\npublic class AmphibiousVehicle implements Driveable, Sailable {\n  private final DriveEngine driveEngine = new DriveEngine();\n  private final SailEngine sailEngine = new SailEngine();\n\n  public void drive() { driveEngine.drive(); }\n  public void sail()  { sailEngine.sail();  }\n}"
  },
  {
    "type": "table",
    "headers": [
      "Aspect",
      "Inheritance",
      "Composition"
    ],
    "rows": [
      [
        "Relationship modeled",
        "\"is-a\"",
        "\"has-a\""
      ],
      [
        "Coupling",
        "Tight - subclass depends on parent's internals",
        "Loose - depends only on an interface"
      ],
      [
        "Flexibility",
        "Fixed at compile time",
        "Can swap the contained object at runtime"
      ],
      [
        "Multiple behaviors",
        "Not possible for classes in Java",
        "Trivial - implement multiple interfaces"
      ],
      [
        "Risk",
        "Fragile base class problem as hierarchy deepens",
        "Slightly more boilerplate (delegation methods)"
      ]
    ]
  },
  {
    "type": "bullets",
    "items": [
      "Reach for inheritance only when the relationship is truly \"is-a\" and the subclass should be usable anywhere the parent is expected (the Liskov Substitution Principle).",
      "Reach for composition when you are combining independent capabilities, need to change behavior at runtime, or the hierarchy would otherwise exceed two levels.",
      "When in doubt, composition is the safer default - it is easier to compose two small pieces than to untangle a deep inheritance chain later."
    ]
  },
  {
    "type": "quote",
    "text": "This is literally Effective Java, Item 18: \"favor composition over inheritance.\" See it applied across real interview problems in the [LLD practice problems](/features/interview-questions)."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Interface vs. Abstract Class"
  },
  {
    "type": "paragraph",
    "text": "Once you've decided to share behavior through a common type, you still have to pick the mechanism. The two are not interchangeable, and interviewers will ask you to justify the choice."
  },
  {
    "type": "table",
    "headers": [
      "Feature",
      "Interface",
      "Abstract Class"
    ],
    "rows": [
      [
        "Multiple inheritance",
        "Yes - a class can implement many",
        "No - single parent only"
      ],
      [
        "Constructor",
        "No",
        "Yes"
      ],
      [
        "Fields",
        "Only `static final` constants",
        "Any field type, including mutable state"
      ],
      [
        "Method bodies",
        "Default/static methods only",
        "Full implementations allowed"
      ],
      [
        "Use when",
        "Defining a pure contract or capability",
        "Sharing partial implementation plus state"
      ]
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Common OOP Interview Questions"
  },
  {
    "type": "numbered",
    "items": [
      "**What is the difference between overloading and overriding?** Overloading is compile-time polymorphism - same method name, different parameter list, resolved by the compiler within one class. Overriding is runtime polymorphism - a subclass re-implements a parent's method, resolved by the JVM based on the actual object at runtime.",
      "**Can a constructor be overridden?** No. Constructors are never inherited by subclasses, so \"overriding\" one is not a valid concept - each class defines its own.",
      "**What is the diamond problem, and how does Java avoid it?** It's the ambiguity that arises when a class inherits the same method from two parents through multiple inheritance. Java sidesteps it by disallowing multiple class inheritance entirely; when two interfaces provide conflicting default methods, the implementing class is forced to resolve the conflict explicitly.",
      "**Why does encapsulation matter if the getters and setters just expose the same field anyway?** Encapsulation isn't about hiding the field, it's about controlling the door to it - validation, side effects, and future changes all live behind that one entry point instead of being scattered across every caller.",
      "**When would you choose an abstract class over an interface if both support default methods now?** Choose the abstract class when subclasses need to share actual state (fields) or a constructor that sets up common initialization; choose the interface when you are only defining a capability a class opts into."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "The four pillars are not independent facts to memorize - they compound. Encapsulation protects the state that abstraction hides behind a clean interface; inheritance and composition are the two competing tools for sharing that abstraction across types; polymorphism is what makes the whole system extensible without rewriting existing callers. An interviewer watching you design a system is really watching whether these four ideas show up naturally in your class diagram, not whether you can recite their definitions."
  },
  {
    "type": "paragraph",
    "text": "The fastest way to internalize this is to apply it under time pressure. Take a class you've written recently and ask: does anything reach past its public methods? Does its hierarchy model a real \"is-a\", or was it shortcut to avoid writing an interface? Answering that honestly, on a handful of real problems, will do more for your interview readiness than reading another list of definitions."
  },
  {
    "type": "quote",
    "text": "Ready to apply these pillars end-to-end? Work through a full design in the [LLD interview roadmap](/features/interview-questions) and pressure-test your class design against real interview problems."
  }
]

// ─── Blog 8: crack-system-design-faang ──────────────────────────────────────────────────
const blog8Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "Every FAANG company runs a system design interview, but no two of them are testing the same thing. A design that impresses at Netflix - heavy on chaos engineering and streaming pipelines - can fall flat at Apple, where privacy and on-device processing dominate the conversation. Treating \"system design interview prep\" as one generic skill is the single biggest reason strong engineers walk out of these rounds with weak scores."
  },
  {
    "type": "paragraph",
    "text": "The good news is that the underlying evaluation is more consistent than it looks. Every company scores you against roughly the same rubric, and layered on top of that rubric is a company-specific lens shaped by what that business actually runs in production. Learn the rubric once, then learn the five lenses below, and you can walk into any FAANG onsite already knowing what the interviewer is listening for."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Universal Scoring Rubric"
  },
  {
    "type": "paragraph",
    "text": "Strip away the company branding and almost every FAANG interview packet scores candidates against the same six dimensions. Interviewers fill this rubric out whether the question is \"design YouTube\" or \"design a parking garage\"."
  },
  {
    "type": "table",
    "headers": [
      "Dimension",
      "What They Evaluate"
    ],
    "rows": [
      [
        "**Requirements**",
        "Did you ask the right clarifying questions before designing anything?"
      ],
      [
        "**Architecture**",
        "Is the overall shape of the system sound - services, data flow, boundaries?"
      ],
      [
        "**Deep Dives**",
        "Can you go deep on the one or two components that actually matter?"
      ],
      [
        "**Scale**",
        "Does the design hold up at the stated (or implied) scale, and do the numbers back that up?"
      ],
      [
        "**Trade-offs**",
        "Can you articulate the pros and cons of your choices instead of presenting them as the only option?"
      ],
      [
        "**Communication**",
        "Is the explanation structured, confident, and easy to follow under time pressure?"
      ]
    ]
  },
  {
    "type": "quote",
    "text": "**Practice with a timer:** Use [LLDCanvas's Interview Mode](/features/interview-mode) to simulate the real 45-minute clock and get scored against this exact rubric."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Google"
  },
  {
    "type": "paragraph",
    "text": "Google interviewers are calibrated to planetary scale by default - if your numbers only work for a few million users, expect follow-up questions until they don't. The bar is less about knowing trendy technologies and more about clean, minimal designs: Google engineers are famous for pushing back on over-engineering, so a simple design defended well usually beats a complex one defended poorly. Because so much of Google's own infrastructure (Spanner, Bigtable, Chubby) solves consistency and consensus problems, interviewers expect you to reason fluently about consistency models and leader election (Paxos/Raft) when relevant, even if you never name-drop the internal systems."
  },
  {
    "type": "bullets",
    "items": [
      "Anchor every scale claim in real numbers - DAUs, QPS, storage growth per year - rather than vague words like \"a lot of users.\"",
      "Bring up monitoring and SLO compliance unprompted; Google treats operability as part of the design, not an afterthought.",
      "Default to the simplest architecture that satisfies the requirements, then add complexity only when you can justify it.",
      "Be ready to reason about strong vs. eventual consistency and to name the trade-off, not just the term.",
      "At L5 and above, be prepared for a coding component woven into the design, not just a whiteboard discussion.",
      "Common prompts: Google Search, Google Drive, YouTube, Google Maps."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Meta"
  },
  {
    "type": "paragraph",
    "text": "Meta's system design rounds live and die on the social graph. Almost every prompt eventually routes back to how data fans out across a network of relationships, and the canonical hard problem is the \"celebrity problem\": a normal user's post fans out to a few hundred followers instantly, but a celebrity's post to 100 million followers cannot use the same write-fanout strategy. Interviewers want to see you reach for a hybrid push/pull model rather than pick one extreme. Real-time messaging and notification delivery show up constantly too, since Messenger, Instagram DMs, and WhatsApp all sit on similar infrastructure."
  },
  {
    "type": "bullets",
    "items": [
      "Know the celebrity problem cold: push (fan-out-on-write) for normal users, pull (fan-out-on-read) for high-follower accounts, and be ready to defend the crossover threshold.",
      "Expect the interviewer to push on ranking and relevance, not just delivery - \"how do you decide what shows up first\" is a common follow-up.",
      "Treat privacy and data-access boundaries as first-class design constraints, not a footnote at the end.",
      "For messaging questions, be ready to discuss delivery guarantees (at-least-once vs. exactly-once) and read-receipt consistency.",
      "Common prompts: Facebook News Feed, Instagram, WhatsApp, Messenger."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Amazon"
  },
  {
    "type": "paragraph",
    "text": "Amazon overlays its Leadership Principles onto the technical rubric - \"Customer Obsession,\" \"Ownership,\" and \"Bias for Action\" are graded alongside architecture quality, and interviewers will explicitly note whether you framed decisions in terms of customer impact. Expect a strong emphasis on high availability: Amazon runs some of the most heavily replicated, multi-region infrastructure in the industry, so \"what happens when this region goes down\" is almost guaranteed to come up. Cost-efficiency also gets more airtime here than at other companies, since AWS margins are a constant internal conversation."
  },
  {
    "type": "bullets",
    "items": [
      "Frame trade-offs in terms of customer impact first, technical elegance second - state the \"why\" in business terms before the \"how.\"",
      "Proactively discuss failure modes: what happens on node failure, AZ failure, and full region failure, and how the system degrades gracefully.",
      "Bring up cost trade-offs explicitly (storage tiering, caching to cut compute, right-sizing) - it signals ownership thinking.",
      "Reference the \"two-pizza team\" mental model when discussing service boundaries and ownership.",
      "Common prompts: Amazon.com product catalog, inventory management systems, ride-sharing/logistics style problems for AWS-adjacent teams."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Apple"
  },
  {
    "type": "paragraph",
    "text": "Apple's system design interviews are shaped by its product philosophy as much as by engineering constraints. Privacy-first design is not optional context - it is often the central constraint of the problem, so an architecture that routes everything through cloud services for convenience will be challenged immediately. Because Apple ships both the hardware and the software, interviewers also probe hardware-software integration and offline-first behavior far more than other FAANG companies: what does the experience look like with no network at all, and what syncs later?"
  },
  {
    "type": "bullets",
    "items": [
      "Explicitly weigh on-device vs. cloud processing for every major component - don't default to \"send it to the server.\"",
      "Discuss end-to-end encryption and what Apple itself can and cannot see in the data path.",
      "Design for offline-first: define what works with zero connectivity and how state reconciles once the device reconnects.",
      "Consider device and battery constraints as real design inputs, not edge cases to wave away.",
      "Common prompts: iCloud sync, Apple Pay backend, Siri request handling."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Netflix"
  },
  {
    "type": "paragraph",
    "text": "Netflix interviews assume you already think in terms of distributed failure. The company popularized chaos engineering, and interviewers expect you to design for failure from the start rather than bolt on resilience after being asked \"what if this service goes down.\" Streaming-specific questions require fluency in the video pipeline - upload, transcode, package, and distribute via CDN - along with adaptive bitrate streaming (ABR) and the HLS/DASH protocols that make smooth playback possible on flaky networks. Microservices and service-mesh patterns are the default architectural vocabulary here."
  },
  {
    "type": "bullets",
    "items": [
      "Know the video pipeline end to end: ingest, transcode into multiple bitrates/resolutions, package, then serve via CDN with edge caching.",
      "Bring up adaptive bitrate streaming and why client-side quality switching matters for a global, variable-network audience.",
      "Design for failure explicitly: circuit breakers, bulkheads, retries with backoff, and graceful degradation instead of cascading outages.",
      "Discuss chaos engineering as a validation strategy - how would you *prove* the resilience you designed for actually works.",
      "Common prompts: Netflix video streaming, the recommendation engine, Chaos Monkey-style fault-injection infrastructure."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "quote",
    "text": "**Cross-check your fundamentals:** If any of the terms above feel unfamiliar, review [LLDCanvas's system design interview guide](/blog/system-design-interview-guide) before drilling into company-specific prep."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "FAANG system design interviews are learnable precisely because they are not random. The universal rubric - requirements, architecture, deep dives, scale, trade-offs, communication - is the floor every company builds on, and it rewards the same habits everywhere: clarify before you design, drive your own deep dives, name your trade-offs out loud, and admit what you don't know instead of bluffing through it."
  },
  {
    "type": "paragraph",
    "text": "The company-specific lens is what turns a passing answer into a standout one. Read the target company's engineering blog for the last six months, notice which problems it keeps writing about, and let that shape which components you volunteer to go deep on. Then rehearse under real time pressure - the difference between knowing this material and performing it live under a 45-minute clock is the difference that actually shows up on the scorecard."
  }
]

// ─── Blog 9: distributed-systems-concepts ──────────────────────────────────────────────────
const blog9Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "Every microservice call, every database write, every cache lookup in a modern system depends on trade-offs that were formalized decades ago in distributed systems theory. When an interviewer asks 'how would you handle a network partition' or 'why does this database favor availability over consistency,' they are testing whether you understand the *reasons* behind design decisions, not just the names of tools."
  },
  {
    "type": "paragraph",
    "text": "This guide covers the theory that shows up again and again in system design interviews: the CAP theorem, consistency models, consensus algorithms like Raft and Paxos, distributed transaction patterns, and the fault-tolerance techniques that keep large systems running when parts of them inevitably fail."
  },
  {
    "type": "heading",
    "level": 2,
    "text": "CAP Theorem"
  },
  {
    "type": "paragraph",
    "text": "The CAP theorem states that a distributed data store can only guarantee two of the following three properties at once: **Consistency** (every read receives the most recent write or an error), **Availability** (every request receives a non-error response, without guaranteeing it's the latest data), and **Partition Tolerance** (the system keeps working despite dropped or delayed messages between nodes)."
  },
  {
    "type": "paragraph",
    "text": "The insight that matters in an interview is not the three letters themselves - it's that network partitions are a fact of life in any distributed system. Since partition tolerance isn't really optional, the actual decision you're making as a system designer is between **Consistency** and **Availability** during the partition. This is why CAP is often described more usefully as a CP-vs-AP choice."
  },
  {
    "type": "table",
    "headers": [
      "",
      "CP Systems (Consistency + Partition Tolerance)",
      "AP Systems (Availability + Partition Tolerance)"
    ],
    "rows": [
      [
        "Behavior during a partition",
        "Reject or block requests rather than serve stale data",
        "Keep serving requests, possibly with stale data"
      ],
      [
        "Examples",
        "HBase, ZooKeeper, etcd, MongoDB (default)",
        "Cassandra, DynamoDB, CouchDB, Riak"
      ],
      [
        "Use when",
        "Correctness matters more than uptime - financial ledgers, inventory counts, leader election",
        "Uptime matters more than perfect freshness - social feeds, shopping carts, analytics"
      ]
    ]
  },
  {
    "type": "quote",
    "text": "Want to see these trade-offs applied to a real system? Walk through [designing a rate limiter](/features/interview-questions) or [a distributed cache](/features/interview-questions), where CP vs AP choices directly affect the design."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Consistency Models"
  },
  {
    "type": "paragraph",
    "text": "\"Consistency\" is not one thing - it's a spectrum of guarantees about what a reader is allowed to see relative to writes happening elsewhere in the system. Picking the right model is a matter of matching guarantees to what your application actually needs, since stronger consistency generally costs more latency and availability."
  },
  {
    "type": "table",
    "headers": [
      "Model",
      "Guarantee",
      "Examples"
    ],
    "rows": [
      [
        "Strong (Linearizability)",
        "Every read reflects the most recent completed write, as if there were only one copy of the data",
        "Google Spanner, ZooKeeper, etcd"
      ],
      [
        "Sequential",
        "All nodes see operations in the same order, though not necessarily in real-time order",
        "Many distributed databases in default modes"
      ],
      [
        "Causal",
        "Operations that are causally related are seen in the same order by everyone; unrelated operations may be seen in different orders",
        "Cassandra (tunable), collaborative editors"
      ],
      [
        "Eventual",
        "If no new writes occur, all replicas eventually converge to the same value - with no bound on how long that takes",
        "Cassandra (default), DNS, S3 (historically)"
      ]
    ]
  },
  {
    "type": "paragraph",
    "text": "In an interview, naming the model isn't enough - explain the cost. Strong consistency typically requires coordinating with a quorum or leader on every operation, which adds latency and can reduce availability during failures. Eventual consistency avoids that coordination, trading it for the possibility that two clients briefly see different answers."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Consensus Algorithms"
  },
  {
    "type": "paragraph",
    "text": "Consensus algorithms let a cluster of nodes agree on a single value or a single ordered sequence of operations, even when some nodes crash or messages are delayed. This is the machinery underneath every CP system: someone has to decide who the leader is and which writes actually 'happened.' **Paxos** was the original formalization of this problem, but it's notoriously difficult to reason about and implement correctly. **Raft** was designed later specifically to be understandable while providing the same guarantees, which is why most modern infrastructure builds on it."
  },
  {
    "type": "paragraph",
    "text": "Raft decomposes consensus into three separate, easier-to-reason-about sub-problems:"
  },
  {
    "type": "bullets",
    "items": [
      "**Leader election** - Time is divided into numbered *terms*. Nodes start as followers; if a follower doesn't hear from a leader within a timeout, it becomes a candidate and requests votes. Whichever candidate gets votes from a majority of nodes becomes leader for that term. Randomized timeouts prevent repeated split votes.",
      "**Log replication** - The leader is the only node that accepts new writes. It appends each write to its local log and replicates that log entry to followers. Once a majority of nodes have stored the entry, the leader considers it committed and applies it to the state machine.",
      "**Safety** - Raft guarantees only one leader can exist per term, and once an entry is committed by a majority, it can never be lost or overwritten - even if the leader crashes immediately after. A node can only become leader if its log is at least as up to date as a majority of the cluster's."
    ]
  },
  {
    "type": "paragraph",
    "text": "This leader-election-plus-replicated-log pattern is what powers **etcd** (and therefore Kubernetes' cluster state), **CockroachDB**, **TiKV**, and **Consul**. If you can walk through why a five-node Raft cluster can survive two node failures but not three (majority = 3 out of 5), you've demonstrated real understanding, not memorization."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Distributed Transactions"
  },
  {
    "type": "paragraph",
    "text": "A single business operation often has to touch multiple independently-owned services. Consider placing an order:"
  },
  {
    "type": "code",
    "lang": "text",
    "code": "PlaceOrder() ->\n  1. Deduct stock in Inventory Service\n  2. Charge the customer in Payment Service\n  3. Create a shipment in Fulfillment Service"
  },
  {
    "type": "paragraph",
    "text": "If step 2 succeeds but step 3 fails, the system is left in an inconsistent state - money was charged but nothing will ship. A classic ACID transaction can't span these services because each owns its own database and shouldn't share locks with the others."
  },
  {
    "type": "paragraph",
    "text": "Two patterns solve this in practice:"
  },
  {
    "type": "bullets",
    "items": [
      "**Two-Phase Commit (2PC)** - A coordinator asks every participant to *prepare* (lock resources, confirm it can commit) and only *commits* once all participants vote yes; if any votes no, everyone rolls back. This gives strong atomicity but is blocking: if the coordinator crashes mid-protocol, participants can be stuck holding locks indefinitely. Rarely used across service boundaries in modern architectures because of this fragility.",
      "**Saga pattern** - Break the operation into a sequence of local transactions, each with a **compensating transaction** that undoes it if a later step fails. Deduct inventory (compensate: restore inventory), charge payment (compensate: refund), create shipment (compensate: cancel shipment). Sagas can be coordinated with a central orchestrator or run in a choreographed, event-driven style where each service reacts to the previous one's events."
    ]
  },
  {
    "type": "paragraph",
    "text": "Sagas trade strict atomicity for availability and service autonomy - the system is briefly inconsistent between steps, but it never blocks waiting on a coordinator, and every intermediate state has a well-defined recovery path. This is the pattern behind order processing at Uber, Amazon, and most microservice-based e-commerce systems."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Fault Tolerance"
  },
  {
    "type": "paragraph",
    "text": "Distributed systems must assume that machines, disks, and networks will fail - the goal is designing so that individual failures don't become outages. Three techniques come up constantly in interviews: replication, circuit breakers, and retries with backoff."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Replication"
  },
  {
    "type": "bullets",
    "items": [
      "**Single-leader replication** - One primary node accepts all writes and asynchronously (or semi-synchronously) streams them to replicas; reads can be spread across replicas to scale read throughput. Used by PostgreSQL streaming replication and MySQL. Simple to reason about, but failover requires promoting a new leader.",
      "**Leaderless (quorum-based) replication** - Any node can accept a write. Consistency is tuned with the formula **W + R > N**, where N is the number of replicas, W is how many must acknowledge a write, and R is how many are read from. Used by Cassandra, DynamoDB, and Riak - it trades a single point of coordination for tunable consistency per operation."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Health Checks and Circuit Breakers"
  },
  {
    "type": "paragraph",
    "text": "Health checks let load balancers and orchestrators stop routing traffic to a node that's failing, before users notice. Circuit breakers apply the same idea at the client level, protecting a caller from a struggling downstream dependency:"
  },
  {
    "type": "bullets",
    "items": [
      "**Closed** - Requests flow normally, and failures are counted. If the error rate crosses a threshold, the breaker trips **open**.",
      "**Open** - Requests fail immediately without even attempting the call, protecting the failing service from added load and giving it time to recover. After a cooldown timeout, the breaker moves to **half-open**.",
      "**Half-open** - A small number of trial requests are allowed through. If they succeed, the breaker closes again; if they fail, it reopens and the timeout restarts."
    ]
  },
  {
    "type": "paragraph",
    "text": "This pattern is implemented in libraries like Resilience4j and built into service meshes such as Istio, and it's a common building block in [circuit breaker design questions](/features/interview-questions)."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "Retries with Exponential Backoff and Jitter"
  },
  {
    "type": "paragraph",
    "text": "When a call fails transiently, retrying immediately just adds more load to an already-struggling service. Exponential backoff spaces out retries geometrically, and jitter randomizes the exact delay so that many clients retrying after the same failure don't all hammer the service in the same instant:"
  },
  {
    "type": "code",
    "lang": "text",
    "code": "retry_delay = min(base_delay * 2^attempt + random_jitter, max_delay)"
  },
  {
    "type": "paragraph",
    "text": "Without jitter, synchronized clients create a *thundering herd* - a wave of simultaneous retries that can re-trigger the very overload the retries were trying to recover from."
  },
  {
    "type": "quote",
    "text": "See these fault-tolerance patterns combined in a real design walkthrough: [Crack the System Design Interview at FAANG](/blog/crack-system-design-faang) covers how they show up in interview answers end to end."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "Distributed systems can feel overwhelming because of how many tools and acronyms surround them, but the underlying ideas are a small, learnable set: the CAP theorem forces a consistency-versus-availability choice whenever a partition happens; consistency models let you dial in exactly how strict that choice needs to be; consensus algorithms like Raft give a cluster a reliable way to agree on truth; sagas let multi-service operations stay resilient without global locks; and replication, circuit breakers, and backoff keep the whole thing standing when individual pieces fail."
  },
  {
    "type": "paragraph",
    "text": "The fastest way to make this knowledge stick is to apply it. Next time you sketch a system design, explicitly state which side of CAP you're choosing and why - that single habit is often what separates a strong interview answer from an average one."
  }
]

// ─── Blog 10: most-asked-system-design-questions ──────────────────────────────────────────────────
const blog10Content: BlogBlock[] = [
  {
    "type": "paragraph",
    "text": "System design interviews feel infinite until you notice the pattern: the same twenty or so questions get asked over and over, dressed up in different company names. Design Twitter becomes 'design a social feed.' Design WhatsApp becomes 'design a real-time messaging system.' Once you've solved the underlying problem once, you can answer five different-sounding questions with the same reasoning."
  },
  {
    "type": "paragraph",
    "text": "This is a curated list of the questions that show up most often at top tech companies, grouped by how likely you are to face them. For each one, we call out the core challenge the interviewer is actually testing and the specific architecture decisions that separate a strong answer from a generic one."
  },
  {
    "type": "quote",
    "text": "**Practice with a timer.** For each question below, run a 45-minute timed session in [LLDCanvas Interview Mode](/features/interview-mode) before checking the model answer."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Tier 1: Must Know"
  },
  {
    "type": "paragraph",
    "text": "These five come up constantly because each one forces a genuinely hard trade-off, not just a list of components. If you can defend the decisions below out loud, you can handle most variations interviewers throw at you."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "1. Design Twitter / X"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** generating a home timeline for 500M+ users where reads vastly outnumber writes, and a small number of accounts have tens of millions of followers."
  },
  {
    "type": "bullets",
    "items": [
      "**Fan-out on write:** push each new tweet into every follower's precomputed timeline cache. Reads become a single cache lookup, but posting is expensive when the author has millions of followers.",
      "**Fan-out on read:** merge tweets from all followed accounts at request time. Writes stay cheap, but a user following thousands of accounts pays for it on every page load.",
      "**Hybrid (Twitter's actual approach):** fan-out on write for regular accounts; skip fan-out entirely for celebrity accounts above a follower threshold and merge their tweets into the timeline at read time instead.",
      "Timelines are stored as bounded lists (recent N tweet IDs) in Redis, not full tweet objects, keeping the fan-out write cheap and the cache small.",
      "Tweet IDs are generated with a Snowflake-style scheme so they are roughly time-sortable without a central counter."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "2. Design WhatsApp"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** deliver messages in order, in real time, to billions of devices that connect and disconnect constantly, without losing a message when a recipient is offline."
  },
  {
    "type": "bullets",
    "items": [
      "Persistent **WebSocket** connections per device instead of polling, so the server can push messages the instant they arrive.",
      "Routing path: sender's client to a WebSocket server to a routing/session service that looks up which server the recipient is connected to (or queues for push notification if offline).",
      "**Presence** is a heartbeat mechanism: each client pings periodically, and online/offline state is tracked as a short-TTL key in Redis rather than a persistent database row.",
      "**Storage:** Cassandra, chosen because message history is write-heavy, append-only, and accessed almost entirely in time order per conversation - a pattern wide-column stores handle far better than a relational database."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "3. Design YouTube"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** the upload path and the playback path have opposite traffic shapes - uploads are write-heavy and can tolerate latency, playback is read-heavy at massive scale and cannot."
  },
  {
    "type": "bullets",
    "items": [
      "**Upload pipeline:** raw video lands in object storage, then a transcoding service (often chunked and parallelized) produces multiple resolutions and bitrates asynchronously.",
      "**Adaptive streaming:** HLS or DASH manifests let the client switch bitrate mid-playback based on measured network conditions.",
      "Encoded video files live in S3/GCS behind a **CDN**; metadata (title, description, view counts, upload status) lives in PostgreSQL.",
      "View counts are updated through an approximate, batched counter rather than an increment-per-view write, since exact real-time counts aren't worth the write contention."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "4. Design Uber"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** matching riders to drivers in real time using continuously moving location data, at a scale where naive polling or full-table geo-queries fall over."
  },
  {
    "type": "bullets",
    "items": [
      "Driver location updates every 4-5 seconds flow through **Kafka** for ingestion, decoupling the write rate from downstream matching logic.",
      "Nearby-driver queries use **Redis Geo** (geohash-based indexing) so 'find drivers within 2km' is a fast range query instead of a scan.",
      "The trip is modeled as an explicit **state machine**: REQUESTED -> DRIVER_ASSIGNED -> DRIVER_ARRIVED -> IN_PROGRESS -> COMPLETED, which makes edge cases (cancellations, timeouts) tractable to reason about.",
      "**Surge pricing** is computed per geohash cell from the live supply/demand ratio, recalculated on a short interval (about every minute) rather than continuously."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "5. Design Instagram"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** the same feed fan-out problem as Twitter, plus two extra wrinkles - content that expires and a discovery feed that isn't chronological at all."
  },
  {
    "type": "bullets",
    "items": [
      "Feed generation mirrors Twitter's **hybrid fan-out** model: precomputed for most accounts, merged at read time for very large accounts.",
      "**Stories** expire automatically: stored with a 24-hour TTL directly in Redis, with 'viewed by' tracking implemented as a Redis Set per story.",
      "**Explore/discovery** is not real-time at all - it's built by an offline collaborative-filtering pipeline that recomputes recommendations daily and serves them from a precomputed cache."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Tier 2: Frequently Asked"
  },
  {
    "type": "paragraph",
    "text": "This tier trades scale for precision - each question is narrower than a Tier 1 system, but tests a specific mechanism in depth. Interviewers use these to check whether you actually understand a concept or just name-drop it."
  },
  {
    "type": "heading",
    "level": 3,
    "text": "6. Design a URL Shortener"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** an extremely read-heavy service (redirects vastly outnumber creations) that needs short, unique, non-guessable-enough codes at scale."
  },
  {
    "type": "bullets",
    "items": [
      "**Base62 encoding of an auto-incrementing ID** is the standard answer - short, collision-free by construction, no coordination needed beyond the ID generator.",
      "The alternative, hashing the URL (MD5/SHA) and truncating, requires a collision-check step and is usually the weaker answer unless you also justify it.",
      "Redirects are cached aggressively (Redis or CDN edge) since the read:write ratio is typically 100:1 or higher."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "7. Design a Rate Limiter"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** enforcing a request limit accurately when the limiter itself is distributed across many nodes, so counters must stay consistent without becoming a bottleneck."
  },
  {
    "type": "bullets",
    "items": [
      "**Token bucket** is the algorithm of choice - it allows short bursts while enforcing a steady average rate, and is simple to reason about.",
      "The check-and-decrement has to be atomic across concurrent requests hitting different app servers, so it's implemented as a **Lua script executed inside Redis**, not as separate GET/SET calls from the app.",
      "Sliding-window counters are a common follow-up discussion when the interviewer pushes on fixed-window edge effects (bursts at window boundaries)."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "8. Design Google Drive"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** syncing files across multiple devices efficiently, without re-uploading unchanged data and without corrupting files when two devices edit at once."
  },
  {
    "type": "bullets",
    "items": [
      "Files are split into fixed-size chunks; only changed chunks are re-uploaded on an edit, not the whole file.",
      "Chunks are **deduplicated by content hash** - if two users upload the same file, or a file barely changes, the storage layer skips the redundant write.",
      "Conflicts are surfaced (versioned copies) rather than silently merged, since automatic merge is unsafe for arbitrary binary files."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "9. Design a Notification Service"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** fanning a single event out to multiple channels (push, email, SMS, in-app) reliably, when each channel has different latency, failure modes, and rate limits."
  },
  {
    "type": "bullets",
    "items": [
      "A single event is published to **Kafka**, then routed into **channel-specific queues** so a slow or failing email provider can't back up push notifications.",
      "Each channel worker handles its own retry policy and dead-letter queue independently.",
      "User preferences (which channels, quiet hours) are checked before fan-out, not after, to avoid wasted work."
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "text": "10. Design Search Autocomplete"
  },
  {
    "type": "paragraph",
    "text": "**Core challenge:** returning prefix matches in well under 100ms, at a query volume where hitting a database per keystroke is not an option."
  },
  {
    "type": "bullets",
    "items": [
      "An **in-memory trie** keyed by prefix is the standard data structure - lookups are O(length of prefix), independent of dataset size.",
      "The trie is **pre-computed from query logs**, ranked by historical frequency, and rebuilt periodically rather than updated on every query.",
      "Personalization (recent searches, location) is layered on top of the global trie result rather than replacing it."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Tier 3: Good to Know"
  },
  {
    "type": "paragraph",
    "text": "These are less likely to be the headline question, but they show up as components inside Tier 1 and Tier 2 answers, or as a quick warm-up question before the main one."
  },
  {
    "type": "bullets",
    "items": [
      "**Distributed Cache (Redis-like):** consistent hashing for key distribution, eviction policies (LRU/LFU), and replication for availability.",
      "**Message Queue (Kafka-like):** partitioned log storage, consumer groups for parallel processing, and offset tracking for at-least-once delivery.",
      "**Web Crawler:** a Bloom filter for cheap URL-seen deduplication, plus politeness controls (per-domain rate limiting) to avoid hammering any single site.",
      "**Real-time Leaderboard:** Redis Sorted Sets (`ZADD`/`ZRANK`) give O(log n) rank updates and range queries for free.",
      "**API Gateway:** a single entry point handling routing, authentication, rate limiting, and logging so individual services don't reimplement them."
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Quick Reference"
  },
  {
    "type": "table",
    "headers": [
      "Problem",
      "Core Challenge",
      "Key Decision"
    ],
    "rows": [
      [
        "Twitter / X",
        "Read-heavy feed at 500M+ users, some with huge follower counts",
        "Hybrid fan-out: write for regular users, read-time merge for celebrities"
      ],
      [
        "WhatsApp",
        "Ordered real-time delivery across billions of intermittently connected devices",
        "Persistent WebSockets + Cassandra for write-heavy message history"
      ],
      [
        "YouTube",
        "Opposite traffic shapes for upload vs. playback",
        "Async transcoding pipeline + adaptive bitrate streaming via CDN"
      ],
      [
        "Uber",
        "Real-time matching on continuously moving location data",
        "Kafka ingestion + Redis Geo for nearby-driver queries"
      ],
      [
        "Instagram",
        "Feed fan-out plus ephemeral content and non-chronological discovery",
        "Twitter-style hybrid fan-out; offline collaborative filtering for Explore"
      ],
      [
        "URL Shortener",
        "Extremely read-heavy redirects at scale",
        "Base62 encoding of an auto-incrementing ID"
      ],
      [
        "Rate Limiter",
        "Accurate limits across a distributed set of servers",
        "Token bucket enforced via Lua scripts in Redis"
      ],
      [
        "Google Drive",
        "Efficient multi-device sync without re-uploading unchanged data",
        "Chunked upload with content-hash deduplication"
      ],
      [
        "Notification Service",
        "Reliable fan-out across channels with different failure modes",
        "Kafka event bus routing into per-channel queues"
      ],
      [
        "Search Autocomplete",
        "Sub-100ms prefix matching at high query volume",
        "In-memory trie pre-computed from query logs"
      ]
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "How to Structure Your Prep"
  },
  {
    "type": "paragraph",
    "text": "Trying to prepare all fifteen-plus questions in parallel is how most candidates run out of time. A staged plan works better: **Week 1** - master the five Tier 1 questions; they cover roughly 80% of the patterns you'll be tested on. **Week 2** - work through Tier 2, where each question introduces exactly one new concept on top of what you already know. **Week 3 onward** - shift entirely to timed mock interviews using [LLDCanvas's Interview Mode](/features/interview-mode)."
  },
  {
    "type": "paragraph",
    "text": "Within each mock session, keep a fixed time budget so you build the instinct for pacing under real interview pressure:"
  },
  {
    "type": "numbered",
    "items": [
      "5 min - requirements clarification (functional and non-functional)",
      "3 min - scale estimation (back-of-envelope numbers for QPS, storage, bandwidth)",
      "5 min - API design",
      "20 min - high-level architecture",
      "10 min - deep dive on two components the interviewer cares about most",
      "2 min - trade-offs and follow-up questions"
    ]
  },
  {
    "type": "quote",
    "text": "Start with [LLDCanvas's practice problems](/features/interview-questions), then move to timed sessions in [Interview Mode](/features/interview-mode) once the fundamentals feel solid."
  },
  {
    "type": "divider"
  },
  {
    "type": "heading",
    "level": 2,
    "text": "Conclusion"
  },
  {
    "type": "paragraph",
    "text": "System design interviews reward pattern recognition more than raw memorization. The list of building blocks - fan-out strategies, geo-indexing, chunked uploads, token buckets, tries - is finite, and it repeats across nearly every question a top tech company will ask. Once you've internalized why each decision was made, not just what it is, you can adapt to a question you've never seen before."
  },
  {
    "type": "paragraph",
    "text": "Work through the tiers in order, be able to justify every architecture decision out loud, and put yourself under a timer before the real interview does it for you. For the underlying framework these questions all draw on, see the [complete system design interview guide](/blog/system-design-interview-guide)."
  }
]

// ─── Blog metadata + content ──────────────────────────────────────────────────

const BLOGS = [
  {
    slug: "system-design-interview-guide",
    title: "Complete System Design Interview Guide 2025",
    subtitle: "Everything you need to know to ace system design rounds at top tech companies",
    excerpt: "A comprehensive, step-by-step guide to system design interviews: what interviewers look for, how to structure your answer, key topics to master, and a framework you can apply to any question.",
    category: "System Design",
    tags: ["System Design","Interview Prep","FAANG","Software Engineering","Architecture"],
    isFeatured: true,
    relatedSlugs: ["lld-interview-roadmap","hld-vs-lld-explained","most-asked-system-design-questions","crack-system-design-faang"],
    seo: {"metaTitle":"Complete System Design Interview Guide 2025 | LLDCanvas","metaDescription":"Master system design interviews with our complete 2025 guide. Covers HLD, LLD, scalability, databases, caching, load balancing, and a proven answer framework.","keywords":["system design interview","system design guide","how to crack system design","HLD interview","LLD interview"]},
    faq: [{"q":"How long are system design interviews?","a":"Typically 45-60 minutes. You spend ~5 min on clarification, 35-40 min designing, and 5 min on trade-offs."},{"q":"Do I need to memorize architectures?","a":"No. Interviewers care about your reasoning process. Understand the core building blocks deeply and you can derive any architecture."},{"q":"What is the difference between HLD and LLD?","a":"High-Level Design focuses on overall architecture - services, databases, APIs. Low-Level Design focuses on class structure, design patterns, and object-oriented modeling."}],
    content: blog1Content,
  },
  {
    slug: "lld-interview-roadmap",
    title: "Ultimate Low-Level Design (LLD) Interview Roadmap",
    subtitle: "A complete learning path from OOP basics to expert-level design patterns",
    excerpt: "The definitive roadmap for mastering Low-Level Design interviews. Covers OOP fundamentals, SOLID principles, all 23 GoF design patterns, and a systematic approach to solving any LLD problem.",
    category: "Low-Level Design",
    tags: ["LLD","Low-Level Design","OOP","Design Patterns","Interview Roadmap","SOLID"],
    isFeatured: true,
    relatedSlugs: ["solid-principles-explained","design-patterns-guide","lld-interview-questions","oop-concepts-for-interviews"],
    seo: {"metaTitle":"Ultimate LLD Interview Roadmap 2025 | Low-Level Design Guide | LLDCanvas","metaDescription":"Complete Low-Level Design (LLD) roadmap for software engineering interviews. Master OOP, SOLID principles, 23 design patterns, and a proven framework for solving LLD problems.","keywords":["LLD interview","low level design roadmap","LLD preparation","machine coding round"]},
    faq: [{"q":"What is Low-Level Design (LLD)?","a":"LLD focuses on the detailed design of a software component - class structure, interfaces, design patterns, and object relationships."},{"q":"How long does it take to prepare for LLD interviews?","a":"With focused daily practice of 1-2 hours, most engineers are interview-ready in 4-8 weeks."}],
    content: blog2Content,
  },
  {
    slug: "hld-vs-lld-explained",
    title: "HLD vs LLD: Key Differences Explained with Examples",
    subtitle: "Understand when interviewers want a distributed architecture and when they want a class diagram",
    excerpt: "High-Level Design and Low-Level Design are both asked in software engineering interviews, but they test completely different skills. This guide explains the differences, what each involves, and how to prepare for both.",
    category: "System Design",
    tags: ["HLD","LLD","System Design","Software Architecture","Interview Prep"],
    isFeatured: false,
    relatedSlugs: ["system-design-interview-guide","lld-interview-roadmap","lld-interview-questions"],
    seo: {"metaTitle":"HLD vs LLD: Differences Explained with Examples | LLDCanvas","metaDescription":"Understand the difference between High-Level Design (HLD) and Low-Level Design (LLD) in software engineering interviews. Examples, diagrams, and preparation tips.","keywords":["HLD vs LLD","high level design vs low level design","system design interview types"]},
    faq: [{"q":"Which is harder, HLD or LLD?","a":"They test different skills. HLD requires broad architectural knowledge. LLD requires deep OOP and design pattern knowledge."},{"q":"Do all companies ask both HLD and LLD?","a":"Not necessarily. Product companies typically ask both. Service-based companies often focus more on LLD."}],
    content: blog3Content,
  },
  {
    slug: "lld-interview-questions",
    title: "Top 25 LLD Interview Questions and Answers (2025)",
    subtitle: "The most commonly asked Low-Level Design questions with detailed solutions and key design insights",
    excerpt: "A curated list of the top 25 LLD interview questions asked at top tech companies, with detailed answers, design patterns used, and tips for each.",
    category: "Low-Level Design",
    tags: ["LLD","Interview Questions","Low-Level Design","FAANG","Machine Coding"],
    isFeatured: false,
    relatedSlugs: ["lld-interview-roadmap","design-patterns-guide","solid-principles-explained"],
    seo: {"metaTitle":"Top 25 LLD Interview Questions and Answers 2025 | LLDCanvas","metaDescription":"Top 25 Low-Level Design (LLD) interview questions asked at Google, Amazon, Flipkart, and Uber with detailed answers and design patterns used.","keywords":["LLD interview questions","low level design questions","machine coding questions"]},
    faq: [{"q":"What are the most commonly asked LLD questions?","a":"Parking Lot, LRU Cache, Elevator System, Vending Machine, Chess Game, Hotel Booking, and ATM Machine appear most frequently."},{"q":"Should I write actual code or just class diagrams?","a":"Most LLD rounds expect working code. Draw the class diagram first, then implement the core classes."}],
    content: blog4Content,
  },
  {
    slug: "solid-principles-explained",
    title: "SOLID Principles Explained with Real-World Examples",
    subtitle: "The five principles every software engineer needs to master for clean, maintainable code",
    excerpt: "A deep dive into all five SOLID principles with real-world examples, code comparisons, and practical tips for applying them in interviews and production code.",
    category: "Object-Oriented Design",
    tags: ["SOLID","OOP","Software Design","Clean Code","Interview Prep"],
    isFeatured: false,
    relatedSlugs: ["lld-interview-roadmap","design-patterns-guide","oop-concepts-for-interviews"],
    seo: {"metaTitle":"SOLID Principles Explained with Examples 2025 | LLDCanvas","metaDescription":"Master SOLID principles with real code examples and interview tips. Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.","keywords":["SOLID principles","SOLID principles explained","single responsibility principle","dependency inversion principle"]},
    faq: [{"q":"Why are SOLID principles important in interviews?","a":"SOLID principles are the foundation of every design pattern question and every code review conversation."},{"q":"Which SOLID principle is violated most often?","a":"Single Responsibility Principle - \"God classes\" that do everything are extremely common."}],
    content: blog5Content,
  },
  {
    slug: "design-patterns-guide",
    title: "Design Patterns Every Software Engineer Must Know",
    subtitle: "A practical guide to the 23 Gang of Four patterns with real-world examples",
    excerpt: "A comprehensive guide to the 23 Gang of Four design patterns - what they are, when to use them, real-world examples, and how they appear in software engineering interviews.",
    category: "Design Patterns",
    tags: ["Design Patterns","Gang of Four","OOP","Software Engineering","GoF"],
    isFeatured: false,
    relatedSlugs: ["solid-principles-explained","lld-interview-roadmap","oop-concepts-for-interviews"],
    seo: {"metaTitle":"Design Patterns Every Software Engineer Must Know | LLDCanvas","metaDescription":"Complete guide to the 23 Gang of Four design patterns with real-world examples, code samples, and interview applications.","keywords":["design patterns","gang of four patterns","creational patterns","behavioral patterns"]},
    faq: [{"q":"How many design patterns are there?","a":"The GoF book defines 23 patterns. These form the foundation; there are many more beyond GoF."},{"q":"Which patterns are most asked in interviews?","a":"Singleton, Factory, Observer, Strategy, Decorator, Command, Template Method, Composite, and Facade are asked most frequently."}],
    content: blog6Content,
  },
  {
    slug: "oop-concepts-for-interviews",
    title: "OOP Concepts Explained for Software Engineering Interviews",
    subtitle: "Master object-oriented programming fundamentals that every interview tests",
    excerpt: "A complete guide to OOP concepts for software engineering interviews: the 4 pillars, abstraction vs encapsulation, composition vs inheritance, polymorphism types, and common interview questions.",
    category: "Object-Oriented Design",
    tags: ["OOP","Object-Oriented Programming","Interview Prep","Software Engineering"],
    isFeatured: false,
    relatedSlugs: ["solid-principles-explained","design-patterns-guide","lld-interview-roadmap"],
    seo: {"metaTitle":"OOP Concepts for Software Engineering Interviews | LLDCanvas","metaDescription":"Master OOP concepts for interviews: the 4 pillars, encapsulation, inheritance, polymorphism, abstraction, and composition vs inheritance.","keywords":["OOP concepts interview","object oriented programming interview","four pillars of OOP"]},
    faq: [{"q":"What are the 4 pillars of OOP?","a":"Encapsulation, Abstraction, Inheritance, and Polymorphism."},{"q":"When should I prefer composition over inheritance?","a":"Prefer composition when the relationship is \"has-a\" rather than \"is-a\", or when you need runtime flexibility."}],
    content: blog7Content,
  },
  {
    slug: "crack-system-design-faang",
    title: "How to Crack System Design Interviews at FAANG Companies",
    subtitle: "Insider strategies for Google, Meta, Amazon, Apple, and Netflix system design rounds",
    excerpt: "A detailed guide on cracking system design interviews at top tech companies: what each company emphasizes, how to structure your answers, scoring rubrics, and specific tips for Google, Meta, Amazon, Apple, and Netflix.",
    category: "System Design",
    tags: ["FAANG","System Design","Google","Amazon","Meta","Interview Prep"],
    isFeatured: false,
    relatedSlugs: ["system-design-interview-guide","hld-vs-lld-explained","most-asked-system-design-questions"],
    seo: {"metaTitle":"How to Crack System Design Interviews at FAANG | LLDCanvas","metaDescription":"Insider guide to cracking system design interviews at Google, Meta, Amazon, Apple, and Netflix.","keywords":["FAANG system design interview","Google system design","Amazon system design"]},
    faq: [{"q":"How is system design scored at FAANG?","a":"Most use a rubric with dimensions like problem clarification, architecture correctness, scalability, reliability, and communication."}],
    content: blog8Content,
  },
  {
    slug: "distributed-systems-concepts",
    title: "Distributed Systems Concepts Every Software Engineer Should Know",
    subtitle: "From CAP theorem to consensus algorithms - essential distributed systems knowledge for interviews",
    excerpt: "A comprehensive guide to distributed systems fundamentals: CAP theorem, consistency models, consensus algorithms, distributed transactions, fault tolerance, and how these apply in system design interviews.",
    category: "System Design",
    tags: ["Distributed Systems","CAP Theorem","Consistency","System Design","Fault Tolerance"],
    isFeatured: false,
    relatedSlugs: ["system-design-interview-guide","crack-system-design-faang","most-asked-system-design-questions"],
    seo: {"metaTitle":"Distributed Systems Concepts for Software Engineers | LLDCanvas","metaDescription":"Master distributed systems fundamentals for system design interviews: CAP theorem, consistency models, Raft, distributed transactions, and fault tolerance.","keywords":["distributed systems concepts","CAP theorem explained","consistency models","consensus algorithms"]},
    faq: [{"q":"What is the difference between consistency and availability in CAP?","a":"Consistency means every read gets the most recent write. Availability means every request receives a response. In a partition, systems must choose which to sacrifice."}],
    content: blog9Content,
  },
  {
    slug: "most-asked-system-design-questions",
    title: "Most Asked System Design Questions at Top Tech Companies (2025)",
    subtitle: "A curated list of the most frequently asked system design questions with key design insights",
    excerpt: "The most frequently asked system design questions across top tech companies, with key entities, architecture highlights, critical design decisions, and what interviewers look for in each answer.",
    category: "System Design",
    tags: ["System Design","Interview Questions","FAANG","HLD","Software Architecture"],
    isFeatured: false,
    relatedSlugs: ["system-design-interview-guide","crack-system-design-faang","hld-vs-lld-explained"],
    seo: {"metaTitle":"Most Asked System Design Interview Questions 2025 | LLDCanvas","metaDescription":"Top system design questions at Google, Meta, Amazon, Uber, and Netflix with key architecture insights and what interviewers look for.","keywords":["most asked system design questions","top system design interview questions","system design questions 2025"]},
    faq: [{"q":"How many system design questions should I prepare?","a":"Prepare 15-20 questions deeply. Most problems share common patterns (caching, queues, databases, CDNs)."}],
    content: blog10Content,
  },
]

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  let created = 0
  let updated = 0

  for (const b of BLOGS) {
    const { blocks, toc } = buildTocAndIds(b.content)
    const readingTime = calcReadingTime(blocks)
    const existing = await Blog.findOne({ slug: b.slug })

    const doc = await Blog.findOneAndUpdate(
      { slug: b.slug },
      {
        $set: {
          title: b.title,
          subtitle: b.subtitle,
          excerpt: b.excerpt,
          category: b.category,
          tags: b.tags,
          isFeatured: b.isFeatured,
          relatedSlugs: b.relatedSlugs,
          seo: b.seo,
          faq: b.faq,
          content: blocks,
          toc,
          readingTime,
          author: AUTHOR,
          status: 'published',
        },
        $setOnInsert: { publishedAt: new Date() },
      },
      { upsert: true, new: true },
    )

    if (existing) { console.log(`  UPDATE ${b.slug}  (${readingTime} min read)`); updated++ }
    else { console.log(`  CREATE ${b.slug}  (${readingTime} min read)`); created++ }
    void doc
  }

  console.log(`\nDone — created ${created}, updated ${updated}`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
