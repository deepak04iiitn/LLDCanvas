interface DesignBugSeed {
  slug: string
  title: string
  description: string
  difficulty: 'hard'
  order: number
  diagramData: {
    nodes: Array<{ id: string; data: { label: string }; position: { x: number; y: number } }>
    edges: Array<{ id: string; source: string; target: string; label: string; type?: string }>
  }
  expectedIssues: Array<{
    id: string
    type: 'srp_violation' | 'wrong_relationship' | 'missing_abstraction' | 'coupling_issue' | 'cohesion_issue' | 'god_class' | 'other'
    targetClass: string
    description: string
    interviewContext: string
  }>
  explanation: string
}

export const HARD_BUGS: DesignBugSeed[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. order=75 — Ride-Sharing Orchestrator God Service
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'ride-sharing-orchestrator-god',
    title: 'Ride-Sharing — Orchestrator God Service',
    description:
      'RideService acts as a monolithic orchestrator that handles driver matching, surge pricing, ETA calculation, route optimization, payment processing, and driver rating — all within a single class. Identify every design violation present.',
    difficulty: 'hard',
    order: 75,
    diagramData: {
      nodes: [
        { id: 'RideService',      data: { label: 'RideService' },      position: { x: 80,  y: 80  } },
        { id: 'DriverMatcher',    data: { label: 'DriverMatcher' },    position: { x: 310, y: 80  } },
        { id: 'SurgePricing',     data: { label: 'SurgePricing' },     position: { x: 540, y: 80  } },
        { id: 'ETACalculator',    data: { label: 'ETACalculator' },    position: { x: 770, y: 80  } },
        { id: 'RouteOptimizer',   data: { label: 'RouteOptimizer' },   position: { x: 80,  y: 250 } },
        { id: 'PaymentProcessor', data: { label: 'PaymentProcessor' }, position: { x: 310, y: 250 } },
        { id: 'DriverRating',     data: { label: 'DriverRating' },     position: { x: 540, y: 250 } },
        { id: 'RideRequest',      data: { label: 'RideRequest' },      position: { x: 770, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'RideRequest',   target: 'RideService',      label: 'initiates ride',       type: 'smoothstep' },
        { id: 'e2', source: 'RideService',   target: 'DriverMatcher',    label: 'matchDriver()',        type: 'smoothstep' },
        { id: 'e3', source: 'RideService',   target: 'SurgePricing',     label: 'calculateSurge()',     type: 'smoothstep' },
        { id: 'e4', source: 'RideService',   target: 'ETACalculator',    label: 'computeETA()',         type: 'smoothstep' },
        { id: 'e5', source: 'RideService',   target: 'RouteOptimizer',   label: 'optimizeRoute()',      type: 'smoothstep' },
        { id: 'e6', source: 'RideService',   target: 'PaymentProcessor', label: 'chargeRider()',        type: 'smoothstep' },
        { id: 'e7', source: 'RideService',   target: 'DriverRating',     label: 'updateRating()',       type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'RideService',
        description:
          'RideService owns six entirely distinct domain responsibilities: driver matching, surge pricing, ETA, route optimization, payment, and rating. This violates the God Class anti-pattern — the class is untestable in isolation, grows without bound, and becomes a merge-conflict hotspot as multiple teams touch it simultaneously.',
        interviewContext:
          'Senior candidates immediately name this the God Object anti-pattern and propose decomposing into focused domain services (DriverMatchingService, PricingService, NavigationService, PaymentService, RatingService) coordinated by a thin orchestration layer or a Saga. They reference DDD bounded contexts to justify the split.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'RideService',
        description:
          'There are at least six independent business axes of change: pricing model updates, routing algorithm improvements, payment gateway migration, rating policy changes, ETA algorithm changes, and matching heuristic tuning. Each independently motivates modification of RideService, a textbook SRP violation under the "reason to change" definition.',
        interviewContext:
          'Expect the candidate to articulate the Robert Martin "reason to change" formulation of SRP, not merely "one job." They should note that in a real engineering org these six axes belong to separate teams, making the single-class design a coordination and deployment bottleneck.',
      },
      {
        id: 'issue-3',
        type: 'missing_abstraction',
        targetClass: 'RideService',
        description:
          'There is no MatchingStrategy, PricingStrategy, or RoutingStrategy interface. RideService is directly coupled to concrete algorithm implementations, making it impossible to swap the matching algorithm (geo-hash vs. nearest-neighbor) or pricing algorithm (surge vs. flat) without modifying RideService itself, violating OCP.',
        interviewContext:
          'Senior engineers propose the Strategy pattern for pluggable algorithms and identify that the orchestration itself should be a Saga or Process Manager for distributed resilience. They note that algorithm interfaces also enable A/B testing of strategies independently.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'RideService',
        description:
          'RideService holds hard concrete dependencies on all six collaborators. A failure or deployment of any collaborator (e.g., PaymentProcessor going down) requires redeployment of RideService. In a microservices or distributed context, this prevents independent scaling and eliminates fault isolation between domains.',
        interviewContext:
          'Candidates should argue for async event-driven orchestration (Saga pattern) over synchronous in-process calls. Each service call should be a compensatable step. They should identify that this design also conflates orchestration (a cross-cutting concern) with domain logic.',
      },
    ],
    explanation:
      'RideService is a textbook God Class violating SRP across six domain responsibilities. The correct design decomposes it into focused domain services — DriverMatchingService, SurgePricingService, ETAService, RouteOptimizationService, PaymentService, and RatingService — each owning a single bounded context. A thin RideOrchestrationService (or an event-driven Saga for distributed deployments) coordinates these through interfaces, not concrete classes. Each domain service exposes its algorithm via the Strategy pattern, enabling independent evolution, testing, and A/B experimentation. In a distributed system the orchestration becomes a compensatable Saga with explicit rollback steps for each service call. This aligns with DDD bounded contexts, enables independent team ownership, and allows per-service deployment and scaling.',
  },

  // ─────────────────────────────────────────────────────────────
  // 2. order=76 — Distributed Cache — No Partitioning Strategy
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'distributed-cache-no-strategy',
    title: 'Distributed Cache — No Partitioning Strategy',
    description:
      'CacheCluster hardcodes modulo-based sharding inline. There is no PartitionStrategy interface, no replication abstraction, and node-failure handling logic lives in the same class alongside client-facing get/set operations.',
    difficulty: 'hard',
    order: 76,
    diagramData: {
      nodes: [
        { id: 'CacheCluster',        data: { label: 'CacheCluster' },        position: { x: 80,  y: 80  } },
        { id: 'ShardA',              data: { label: 'ShardA' },              position: { x: 310, y: 80  } },
        { id: 'ShardB',              data: { label: 'ShardB' },              position: { x: 540, y: 80  } },
        { id: 'ShardC',              data: { label: 'ShardC' },              position: { x: 770, y: 80  } },
        { id: 'NodeFailureHandler',  data: { label: 'NodeFailureHandler' },  position: { x: 80,  y: 250 } },
        { id: 'ReplicationManager',  data: { label: 'ReplicationManager' },  position: { x: 310, y: 250 } },
        { id: 'CacheClient',         data: { label: 'CacheClient' },         position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'CacheClient',        target: 'CacheCluster',       label: 'get / set',             type: 'smoothstep' },
        { id: 'e2', source: 'CacheCluster',       target: 'ShardA',             label: 'key % 3 == 0',          type: 'smoothstep' },
        { id: 'e3', source: 'CacheCluster',       target: 'ShardB',             label: 'key % 3 == 1',          type: 'smoothstep' },
        { id: 'e4', source: 'CacheCluster',       target: 'ShardC',             label: 'key % 3 == 2',          type: 'smoothstep' },
        { id: 'e5', source: 'CacheCluster',       target: 'NodeFailureHandler', label: 'handles failure inline', type: 'smoothstep' },
        { id: 'e6', source: 'CacheCluster',       target: 'ReplicationManager', label: 'replicates inline',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'CacheCluster',
        description:
          'Modulo sharding is hardcoded directly inside CacheCluster. There is no PartitionStrategy interface, so switching to consistent hashing (required to minimise key redistribution on node addition/removal) requires rewriting CacheCluster internals. Consistent hashing is the industry-standard approach for distributed caches.',
        interviewContext:
          'Senior candidates immediately identify that modulo sharding causes O(N) key invalidation on node add/remove and propose a PartitionStrategy interface with ConsistentHashStrategy and ModuloStrategy implementations. They reference virtual nodes for uniform distribution.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'CacheCluster',
        description:
          'CacheCluster is responsible for key routing, replication coordination, and failure detection simultaneously. These are three distinct concerns: routing (where to store a key), replication (how many copies), and failure handling (what to do when a node is unavailable). Each has an independent reason to change.',
        interviewContext:
          'Candidates should decompose these into a PartitionStrategy for routing, a ReplicationPolicy for copy management, and a FailoverHandler for node outage responses. Each abstraction changes at a different rate and for different reasons.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'CacheCluster',
        description:
          'CacheCluster is tightly coupled to a fixed three-shard topology. Adding or removing a shard requires modifying the modulo divisor and all routing logic inside CacheCluster. This violates OCP — the cluster should be open to topology changes without code modification.',
        interviewContext:
          'The correct design holds shard topology in a ring/config object. PartitionStrategy implementations receive the ring and are unaware of cluster internals. Senior engineers also note that cluster membership changes should be driven by gossip protocol or a service-discovery mechanism, not hardcoded.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'ReplicationManager',
        description:
          'Replication logic is invoked inline within CacheCluster with no ReplicationPolicy abstraction. There is no way to switch between no replication, synchronous primary-replica replication, and async write-behind without modifying CacheCluster. Different use cases (high-durability vs. low-latency) demand different strategies.',
        interviewContext:
          'Senior candidates propose a ReplicationPolicy interface (NoReplication, SyncReplica, AsyncWriteBehind) injected into CacheCluster. They note that write concerns (quorum vs. all) should be a parameter, mirroring Redis cluster and Dynamo replication models.',
      },
    ],
    explanation:
      'CacheCluster must be decomposed into three focused abstractions. A PartitionStrategy interface (ConsistentHashStrategy by default) decouples key-to-shard routing from cluster management, solving the O(N) key redistribution problem. A ReplicationPolicy interface handles copy configuration independently of routing. A FailoverHandler encapsulates node-down logic (e.g., retry on replica, mark degraded). CacheCluster becomes a thin coordinator that delegates to these three interfaces. Consistent hashing with virtual nodes ensures that adding or removing a shard only remaps ~1/N of keys. The shard topology should be maintained in a ClusterMembership object updated by a gossip protocol rather than hardcoded, making the cluster truly elastic. This mirrors the design of Redis Cluster and Apache Cassandra.',
  },

  // ─────────────────────────────────────────────────────────────
  // 3. order=77 — Event Sourcing — Aggregate Mixes Commands and Queries
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'event-sourcing-mixed-aggregate',
    title: 'Event Sourcing — Aggregate Mixes Commands and Queries',
    description:
      'OrderAggregate handles placeOrder() command, getOrderHistory() query, and projectBalance() projection all in one class. CQRS principles are ignored — the write and read models are unseparated, and the aggregate carries query responsibilities.',
    difficulty: 'hard',
    order: 77,
    diagramData: {
      nodes: [
        { id: 'OrderAggregate',    data: { label: 'OrderAggregate' },    position: { x: 80,  y: 80  } },
        { id: 'CommandHandler',    data: { label: 'CommandHandler' },    position: { x: 310, y: 80  } },
        { id: 'QueryHandler',      data: { label: 'QueryHandler' },      position: { x: 540, y: 80  } },
        { id: 'ProjectionService', data: { label: 'ProjectionService' }, position: { x: 770, y: 80  } },
        { id: 'EventStore',        data: { label: 'EventStore' },        position: { x: 80,  y: 250 } },
        { id: 'ReadModel',         data: { label: 'ReadModel' },         position: { x: 310, y: 250 } },
        { id: 'CommandBus',        data: { label: 'CommandBus' },        position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'CommandBus',      target: 'CommandHandler',    label: 'dispatches command',    type: 'smoothstep' },
        { id: 'e2', source: 'CommandHandler',  target: 'OrderAggregate',    label: 'placeOrder()',          type: 'smoothstep' },
        { id: 'e3', source: 'OrderAggregate',  target: 'EventStore',        label: 'appends events',        type: 'smoothstep' },
        { id: 'e4', source: 'QueryHandler',    target: 'OrderAggregate',    label: 'getOrderHistory()',     type: 'smoothstep' },
        { id: 'e5', source: 'OrderAggregate',  target: 'ProjectionService', label: 'projectBalance()',      type: 'smoothstep' },
        { id: 'e6', source: 'ProjectionService', target: 'ReadModel',       label: 'writes read model',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'srp_violation',
        targetClass: 'OrderAggregate',
        description:
          'OrderAggregate conflates three fundamentally different responsibilities: processing commands (state-mutating write-side), answering queries (read-side), and maintaining projections (read-model materialization). In event sourcing, the aggregate exists solely to validate invariants and emit events; query and projection concerns belong to separate read-side components.',
        interviewContext:
          'Senior candidates articulate the CQRS principle that write models optimise for consistency and invariant enforcement while read models optimise for query performance. They immediately separate command processing from query handling and identify that projections are event handlers, not aggregate methods.',
      },
      {
        id: 'issue-2',
        type: 'wrong_relationship',
        targetClass: 'QueryHandler',
        description:
          'QueryHandler calls directly into OrderAggregate to fulfill reads. In a proper CQRS/ES system, queries should never touch the aggregate (write model). They should read from a pre-materialised ReadModel (projection). Forcing queries through the aggregate means replaying the event stream for every read, which is O(N) in event count.',
        interviewContext:
          'Candidates should propose that QueryHandler reads directly from a denormalised ReadModel populated by a ProjectionService subscribed to the EventStore. Event replay should only occur on aggregate load for command processing, not query serving.',
      },
      {
        id: 'issue-3',
        type: 'cohesion_issue',
        targetClass: 'OrderAggregate',
        description:
          'projectBalance() is a projection concern — it materialises a read-optimised view from events. Placing it on the aggregate conflates event-sourced write-side logic with read-side materialisation. The aggregate\'s cohesion is broken because it now changes for two reasons: business rule changes and projection schema changes.',
        interviewContext:
          'The pattern is: aggregates emit events → ProjectionService listens → ProjectionService writes to ReadModel. projectBalance() belongs in a dedicated BalanceProjection class, not in the aggregate. Senior candidates recognise this as the Event Projector pattern.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'ProjectionService',
        description:
          'There is no Projection interface or abstract EventHandler for projections. ProjectionService directly wires projection logic without a consistent contract, making it impossible to register multiple projections or replay selectively. A robust event-sourced system needs a registry of named projections each subscribing to specific event types.',
        interviewContext:
          'Senior engineers propose a Projection<TState> interface with apply(event) and reset() methods. A ProjectionRegistry manages subscriptions. This enables on-demand rebuild of specific projections without reprocessing the entire event store from scratch.',
      },
    ],
    explanation:
      'The CQRS/ES pattern requires a strict write/read model separation. The write side consists of OrderAggregate (invariant enforcement only), CommandHandler (command dispatch), and EventStore (event persistence). The read side consists of ProjectionService implementing a Projection interface, listening to EventStore events and materialising a ReadModel. QueryHandler reads exclusively from ReadModel, never touching the aggregate. projectBalance() becomes a BalanceProjection implementing Projection<BalanceState>. This design makes reads O(1) (precomputed), writes consistent with domain invariants, and projections independently rebuildable. Separate scaling of command and query paths is now possible, a core benefit of CQRS/ES.',
  },

  // ─────────────────────────────────────────────────────────────
  // 4. order=78 — Microservices — Saga Without Compensation
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'microservice-saga-no-compensate',
    title: 'Microservices — Saga Without Compensation',
    description:
      'OrderSaga calls PaymentService, InventoryService, and ShipmentService sequentially. There is no rollback or compensation step on failure, no SagaStep abstraction, and partial failures leave the system in an inconsistent distributed state.',
    difficulty: 'hard',
    order: 78,
    diagramData: {
      nodes: [
        { id: 'OrderSaga',            data: { label: 'OrderSaga' },            position: { x: 80,  y: 80  } },
        { id: 'PaymentService',       data: { label: 'PaymentService' },       position: { x: 310, y: 80  } },
        { id: 'InventoryService',     data: { label: 'InventoryService' },     position: { x: 540, y: 80  } },
        { id: 'ShipmentService',      data: { label: 'ShipmentService' },      position: { x: 770, y: 80  } },
        { id: 'SagaLog',              data: { label: 'SagaLog' },              position: { x: 80,  y: 250 } },
        { id: 'CompensationHandler',  data: { label: 'CompensationHandler' },  position: { x: 310, y: 250 } },
        { id: 'OrderService',         data: { label: 'OrderService' },         position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'OrderService',   target: 'OrderSaga',           label: 'starts saga',          type: 'smoothstep' },
        { id: 'e2', source: 'OrderSaga',      target: 'PaymentService',      label: 'chargeCard()',         type: 'smoothstep' },
        { id: 'e3', source: 'OrderSaga',      target: 'InventoryService',    label: 'reserveStock()',       type: 'smoothstep' },
        { id: 'e4', source: 'OrderSaga',      target: 'ShipmentService',     label: 'createShipment()',     type: 'smoothstep' },
        { id: 'e5', source: 'OrderSaga',      target: 'SagaLog',             label: 'no log written',       type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'OrderSaga',
        description:
          'There is no SagaStep abstraction encapsulating execute() and compensate() as a pair. Without this, adding a new step (e.g., NotificationService) requires modifying OrderSaga directly, and compensation logic for each step must be duplicated inline. A SagaStep interface decouples step execution from orchestration.',
        interviewContext:
          'Senior candidates propose a SagaStep<T> interface with execute() and compensate() methods, an ordered list of steps, and a reverse-compensation loop triggered on failure. They reference the Saga pattern from Chris Richardson\'s "Microservices Patterns" and distinguish choreography vs. orchestration sagas.',
      },
      {
        id: 'issue-2',
        type: 'other',
        targetClass: 'OrderSaga',
        description:
          'There are no compensation transactions. If ShipmentService fails after PaymentService and InventoryService succeed, the customer is charged and stock is reserved with no order created — a serious data consistency violation. Each step needs a paired compensating transaction: refundPayment(), releaseReservation(), cancelShipment().',
        interviewContext:
          'This is the core of the Saga pattern. Senior candidates enumerate the compensating transactions for each step and identify that compensations must also be idempotent (retryable). They note that compensation != rollback — it is a new forward transaction that semantically undoes prior effects.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'OrderSaga',
        description:
          'OrderSaga directly calls service APIs synchronously. In a distributed system, synchronous sequential calls create a chain of temporal coupling: if any service is slow or unavailable, the entire saga blocks. The design provides no timeout, circuit breaker, or async step-completion model.',
        interviewContext:
          'Senior engineers propose async saga execution using an event-driven model (each service emits completion/failure events that the saga reacts to) or an explicit saga log journal for durability. They should mention the outbox pattern for reliable saga state persistence across service boundaries.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'SagaLog',
        description:
          'SagaLog exists as a node but is never written to in the buggy design (no edge to it from OrderSaga in practice). Without a durable saga journal recording which steps have completed, a saga coordinator crash means the saga cannot be resumed. The saga log is critical for exactly-once-effect guarantees.',
        interviewContext:
          'Candidates should argue that a Saga requires a durable log (often called a saga journal or outbox table) written atomically with each step transition. This enables crash recovery and idempotent step replay. They should know the SagaManager pattern where a persistent entity owns saga state.',
      },
    ],
    explanation:
      'A correct Saga implementation introduces a SagaStep<T> interface with execute() and compensate() methods. OrderSaga holds an ordered list of SagaStep instances and a SagaLog for durable state. On success, steps execute in order. On failure at step N, steps N-1 through 0 have their compensate() called in reverse order. All compensations must be idempotent. For async resilience, the saga should be event-driven: each service emits a domain event on completion or failure, and the SagaOrchestrator reacts to advance or compensate. The SagaLog (or outbox table) records transitions atomically with step execution, enabling crash recovery. This design matches the Saga pattern as described in Microservices Patterns and used in systems like Apache Camel and Axon Framework.',
  },

  // ─────────────────────────────────────────────────────────────
  // 5. order=79 — Search Engine — No Index Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'search-engine-no-index',
    title: 'Search Engine — No Index Abstraction',
    description:
      'SearchEngine directly scans documents with linear search. There is no Index interface, the ranking algorithm is hardcoded inline, and query parsing is mixed with ranking logic in a single class.',
    difficulty: 'hard',
    order: 79,
    diagramData: {
      nodes: [
        { id: 'SearchEngine',    data: { label: 'SearchEngine' },    position: { x: 80,  y: 80  } },
        { id: 'DocumentStore',   data: { label: 'DocumentStore' },   position: { x: 310, y: 80  } },
        { id: 'InvertedIndex',   data: { label: 'InvertedIndex' },   position: { x: 540, y: 80  } },
        { id: 'RankingAlgorithm',data: { label: 'RankingAlgorithm' },position: { x: 770, y: 80  } },
        { id: 'QueryParser',     data: { label: 'QueryParser' },     position: { x: 80,  y: 250 } },
        { id: 'IndexBuilder',    data: { label: 'IndexBuilder' },    position: { x: 310, y: 250 } },
        { id: 'SearchResult',    data: { label: 'SearchResult' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'SearchEngine',    target: 'DocumentStore',    label: 'linear scans all docs',  type: 'smoothstep' },
        { id: 'e2', source: 'SearchEngine',    target: 'RankingAlgorithm', label: 'ranks inline (TF-IDF)',  type: 'smoothstep' },
        { id: 'e3', source: 'SearchEngine',    target: 'QueryParser',      label: 'parses query inline',    type: 'smoothstep' },
        { id: 'e4', source: 'SearchEngine',    target: 'SearchResult',     label: 'returns results',        type: 'smoothstep' },
        { id: 'e5', source: 'IndexBuilder',    target: 'InvertedIndex',    label: 'builds index',           type: 'smoothstep' },
        { id: 'e6', source: 'InvertedIndex',   target: 'DocumentStore',    label: 'indexes documents',      type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'SearchEngine',
        description:
          'SearchEngine has no Index interface. InvertedIndex exists but is not used by SearchEngine — it instead performs linear document scans inline. Without an Index interface, it is impossible to switch between InvertedIndex, BitmapIndex, or TrieIndex without rewriting SearchEngine. The index type is a core extensibility point in any search system.',
        interviewContext:
          'Senior candidates define an Index interface with lookup(term): DocIdList and propose SearchEngine depends on Index, not DocumentStore. They explain that inverted indexes reduce search from O(N·M) (linear scan) to O(k) where k is the posting list size — a fundamental information retrieval concept.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'SearchEngine',
        description:
          'SearchEngine mixes query parsing (tokenisation, normalisation, Boolean logic), document retrieval (index lookup), ranking (TF-IDF scoring), and result formatting in one class. These are four distinct responsibilities each with their own testing requirements and evolution rate. The ranking algorithm alone has spawned decades of research (BM25, neural ranking).',
        interviewContext:
          'The standard decomposition is QueryParser → Query object → IndexLookup → ScoredDocList → Ranker → RankedDocList → ResultFormatter. Each stage implements a pipeline stage interface. Senior candidates reference the Pipes-and-Filters pattern or the standard IR pipeline from Manning et al.',
      },
      {
        id: 'issue-3',
        type: 'missing_abstraction',
        targetClass: 'RankingAlgorithm',
        description:
          'The ranking algorithm (TF-IDF) is hardcoded inside SearchEngine with no Ranker interface. There is no way to plug in BM25, PageRank-boosted ranking, or learned ranking models (LTR) without modifying SearchEngine. Search ranking is one of the most frequently iterated components in production systems.',
        interviewContext:
          'Expect candidates to propose a Ranker interface with score(query, document): number and a composite Ranker that combines signals (textual, recency, personalisation). They should note that A/B testing ranking algorithms in production is a first-class requirement, impossible without the abstraction.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'SearchEngine',
        description:
          'SearchEngine is directly coupled to DocumentStore for raw document access, bypassing the InvertedIndex that was built. This means every query re-reads all documents, making search O(N) regardless of corpus size. The coupling to raw storage rather than index structures is a fundamental architectural error.',
        interviewContext:
          'Candidates should identify that search queries should only touch the index (posting lists), fetching raw documents only to fill result snippets after ranking. The retrieval pipeline is: query → index lookup → candidate doc IDs → ranking → top-K doc IDs → DocumentStore.fetch(ids) for display fields only.',
      },
    ],
    explanation:
      'SearchEngine should be decomposed into a retrieval pipeline: QueryParser produces a structured Query; Index (implemented by InvertedIndex) maps terms to posting lists; Ranker (implemented by BM25Ranker or TFIDFRanker) scores candidates; ResultFormatter renders SearchResult objects. SearchEngine coordinates these via interfaces, owning no algorithm logic itself. DocumentStore is accessed only at the end to hydrate display fields for top-K results. IndexBuilder is a write-path concern separate from query-serving. This Pipeline pattern matches real information retrieval architectures (Lucene, Elasticsearch) where each stage is independently testable, replaceable, and deployable. Ranking algorithms can be A/B tested by injecting different Ranker implementations.',
  },

  // ─────────────────────────────────────────────────────────────
  // 6. order=80 — Recommendation Engine God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'recommendation-engine-god',
    title: 'Recommendation Engine God Class',
    description:
      'RecommendationEngine handles collaborative filtering, content-based filtering, A/B test routing, model training, feature engineering, and serving — all six responsibilities in a single class.',
    difficulty: 'hard',
    order: 80,
    diagramData: {
      nodes: [
        { id: 'RecommendationEngine', data: { label: 'RecommendationEngine' }, position: { x: 80,  y: 80  } },
        { id: 'CollaborativeFilter',  data: { label: 'CollaborativeFilter' },  position: { x: 310, y: 80  } },
        { id: 'ContentFilter',        data: { label: 'ContentFilter' },        position: { x: 540, y: 80  } },
        { id: 'ABTestRouter',         data: { label: 'ABTestRouter' },         position: { x: 770, y: 80  } },
        { id: 'ModelTrainer',         data: { label: 'ModelTrainer' },         position: { x: 80,  y: 250 } },
        { id: 'FeatureEngineering',   data: { label: 'FeatureEngineering' },   position: { x: 310, y: 250 } },
        { id: 'ServingLayer',         data: { label: 'ServingLayer' },         position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'RecommendationEngine', target: 'CollaborativeFilter', label: 'runs CF inline',         type: 'smoothstep' },
        { id: 'e2', source: 'RecommendationEngine', target: 'ContentFilter',       label: 'runs CBF inline',        type: 'smoothstep' },
        { id: 'e3', source: 'RecommendationEngine', target: 'ABTestRouter',        label: 'routes A/B inline',      type: 'smoothstep' },
        { id: 'e4', source: 'RecommendationEngine', target: 'ModelTrainer',        label: 'trains model inline',    type: 'smoothstep' },
        { id: 'e5', source: 'RecommendationEngine', target: 'FeatureEngineering',  label: 'engineers features',     type: 'smoothstep' },
        { id: 'e6', source: 'RecommendationEngine', target: 'ServingLayer',        label: 'serves results',         type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'RecommendationEngine',
        description:
          'RecommendationEngine has six independent responsibilities: two recommendation strategies (CF, CBF), experiment routing, offline training, feature engineering, and online serving. This is a God Class that will be touched by data scientists (algorithm changes), ML engineers (training pipeline), and backend engineers (serving) simultaneously, creating constant conflicts.',
        interviewContext:
          'Senior candidates separate the online serving path (RecommendationStrategy → ServingLayer) from the offline training path (FeaturePipeline → ModelTrainer). They name the two-tower model architecture for recommendation systems and argue that training and serving must be independently deployed and scaled.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'RecommendationEngine',
        description:
          'CollaborativeFilter and ContentFilter are concrete classes called directly. There is no RecommendationStrategy interface, making it impossible to add a new algorithm (e.g., session-based neural ranking) without modifying RecommendationEngine. The Strategy pattern is the natural fit here.',
        interviewContext:
          'Expect the candidate to propose a RecommendationStrategy interface with recommend(userId, context): ItemList and a composite EnsembleStrategy that blends multiple strategies with configurable weights — mirroring production systems like Netflix and Spotify.',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'ModelTrainer',
        description:
          'Model training (offline batch job) is mixed into the same class as online recommendation serving. Training is a background concern with different compute requirements (GPU, batch size), failure modes, and deployment cadence than serving. Co-locating them prevents independent scheduling and scaling.',
        interviewContext:
          'Candidates should articulate the training/serving split: an offline TrainingPipeline produces model artifacts stored in a ModelRegistry; the ServingLayer loads models from the registry at serving time. This decoupling is fundamental in any production ML system.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'ABTestRouter',
        description:
          'A/B test routing is hardcoded inside RecommendationEngine. Experiment routing is a cross-cutting platform concern, not a recommendation domain concern. Changes to experiment bucketing logic force changes to RecommendationEngine, and the routing cannot be reused across other product surfaces.',
        interviewContext:
          'Senior engineers extract A/B routing into a standalone ExperimentationService (or Feature Flag service) that returns the assigned variant for a user. RecommendationEngine asks "which strategy should I use?" and receives a RecommendationStrategy instance — it never knows about the experiment itself.',
      },
    ],
    explanation:
      'RecommendationEngine should be split into an online serving path and an offline training path. The serving path uses a RecommendationStrategy interface (CollaborativeFilterStrategy, ContentBasedStrategy, EnsembleStrategy) selected by an ExperimentationService. The offline training path is a separate TrainingPipeline with a FeaturePipeline, ModelTrainer, and ModelRegistry — scheduled as a background job. ServingLayer loads the latest model from ModelRegistry at startup. FeatureEngineering becomes a shared library used by both training and serving for feature consistency. The ExperimentationService is a platform-level service injecting the correct RecommendationStrategy. This design enables independent deployment of algorithms, training jobs, and the serving layer, matching the architecture of large-scale recommenders at Netflix, Spotify, and YouTube.',
  },

  // ─────────────────────────────────────────────────────────────
  // 7. order=81 — Rate Limiter — Algorithm Not Abstracted
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'rate-limiter-no-algorithm',
    title: 'Rate Limiter — Algorithm Not Abstracted',
    description:
      'RateLimiter hardcodes token-bucket logic directly. There is no RateLimitAlgorithm interface for TokenBucket, SlidingWindow, or FixedWindow alternatives. Storage access is also mixed into the same class as algorithm logic.',
    difficulty: 'hard',
    order: 81,
    diagramData: {
      nodes: [
        { id: 'RateLimiter',       data: { label: 'RateLimiter' },       position: { x: 80,  y: 80  } },
        { id: 'TokenBucket',       data: { label: 'TokenBucket' },       position: { x: 310, y: 80  } },
        { id: 'SlidingWindow',     data: { label: 'SlidingWindow' },     position: { x: 540, y: 80  } },
        { id: 'FixedWindow',       data: { label: 'FixedWindow' },       position: { x: 770, y: 80  } },
        { id: 'RateLimitStorage',  data: { label: 'RateLimitStorage' },  position: { x: 80,  y: 250 } },
        { id: 'RequestHandler',    data: { label: 'RequestHandler' },    position: { x: 310, y: 250 } },
        { id: 'RateLimitConfig',   data: { label: 'RateLimitConfig' },   position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'RequestHandler',  target: 'RateLimiter',      label: 'isAllowed(request)',    type: 'smoothstep' },
        { id: 'e2', source: 'RateLimiter',     target: 'TokenBucket',      label: 'hardcoded inline',      type: 'smoothstep' },
        { id: 'e3', source: 'RateLimiter',     target: 'RateLimitStorage', label: 'reads/writes tokens',   type: 'smoothstep' },
        { id: 'e4', source: 'RateLimiter',     target: 'RateLimitConfig',  label: 'reads config inline',   type: 'smoothstep' },
        { id: 'e5', source: 'SlidingWindow',   target: 'RateLimitStorage', label: 'unused alternative',    type: 'smoothstep' },
        { id: 'e6', source: 'FixedWindow',     target: 'RateLimitStorage', label: 'unused alternative',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'RateLimiter',
        description:
          'Token-bucket logic is hardcoded inside RateLimiter with no RateLimitAlgorithm interface. Different API endpoints require different algorithms: token bucket for burst-tolerant APIs, sliding window for strict per-second limits, fixed window for simple daily quotas. Without the abstraction, every algorithm change rewrites RateLimiter.',
        interviewContext:
          'Senior candidates propose a RateLimitAlgorithm interface with tryConsume(key, cost): boolean, injected into RateLimiter. They enumerate trade-offs: fixed window has boundary burst issues, sliding window is expensive in memory, token bucket handles burst well, leaky bucket enforces strict rate. They have seen this in Stripe, AWS API Gateway designs.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'RateLimiter',
        description:
          'RateLimiter conflates algorithm logic (token-bucket mathematics) with storage access (reading/writing counters to Redis/memory) with configuration loading. These change for different reasons: algorithm changes on policy decisions, storage changes on infrastructure decisions, configuration changes on operational requirements.',
        interviewContext:
          'The correct split is: RateLimitAlgorithm owns the mathematics, RateLimitStorage (interface with RedisStorage and InMemoryStorage implementations) owns persistence, and a RateLimiterFactory wires them from RateLimitConfig. RateLimiter becomes a thin coordinator.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'RateLimitStorage',
        description:
          'Storage access is embedded inside RateLimiter rather than behind a RateLimitStorage interface. This makes it impossible to switch from in-memory to Redis (for distributed rate limiting across multiple API gateway instances) without rewriting the algorithm class. Single-instance vs. distributed rate limiting is a fundamental deployment decision.',
        interviewContext:
          'Senior engineers note that in-memory rate limiting is incorrect for multi-instance deployments — requests hitting different instances are not coordinated. A RateLimitStorage interface with RedisAtomicStorage (using INCR + EXPIRE) and InMemoryStorage implementations enables deployment-time selection.',
      },
      {
        id: 'issue-4',
        type: 'other',
        targetClass: 'RateLimiter',
        description:
          'RateLimiter has no per-key, per-user, or per-tier limit concept. Rate limits in production systems are applied along multiple dimensions (API key, user plan, IP, endpoint). Without a LimitKey abstraction that composes these dimensions, the rate limiter cannot support differentiated limits for premium vs. free-tier users.',
        interviewContext:
          'Candidates should propose a LimitKey type combining (userId, endpoint, tier) with a LimitPolicy mapping keys to (limit, windowMs) pairs. This mirrors how AWS API Gateway Usage Plans and Stripe API rate limiting work.',
      },
    ],
    explanation:
      'RateLimiter should be refactored around a RateLimitAlgorithm interface (TokenBucketAlgorithm, SlidingWindowAlgorithm, FixedWindowAlgorithm) injected at construction time. A RateLimitStorage interface (InMemoryStorage, RedisAtomicStorage) decouples persistence from algorithm logic — Redis is required for distributed correctness. RateLimitConfig provides per-key policies mapping (userId, endpoint, tier) tuples to (limit, windowMs). RateLimiter becomes a coordinator: resolve LimitKey → lookup policy → delegate to RateLimitAlgorithm via storage. Each algorithm is independently unit-testable with a mock storage. This design matches the Cloudflare and AWS API Gateway rate limiting architectures.',
  },

  // ─────────────────────────────────────────────────────────────
  // 8. order=82 — Auth Service — Token Strategy Hardcoded
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'auth-service-no-token-strategy',
    title: 'Auth Service — Token Strategy Hardcoded',
    description:
      'AuthService hardcodes JWT validation inline. There is no TokenStrategy interface. Session management is mixed with token validation, and role-based access checks are also inlined in the same class.',
    difficulty: 'hard',
    order: 82,
    diagramData: {
      nodes: [
        { id: 'AuthService',    data: { label: 'AuthService' },    position: { x: 80,  y: 80  } },
        { id: 'JWTValidator',   data: { label: 'JWTValidator' },   position: { x: 310, y: 80  } },
        { id: 'SessionManager', data: { label: 'SessionManager' }, position: { x: 540, y: 80  } },
        { id: 'RoleChecker',    data: { label: 'RoleChecker' },    position: { x: 770, y: 80  } },
        { id: 'TokenStrategy',  data: { label: 'TokenStrategy' },  position: { x: 80,  y: 250 } },
        { id: 'UserRepository', data: { label: 'UserRepository' }, position: { x: 310, y: 250 } },
        { id: 'AuthMiddleware', data: { label: 'AuthMiddleware' }, position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'AuthMiddleware', target: 'AuthService',    label: 'authenticate(token)',    type: 'smoothstep' },
        { id: 'e2', source: 'AuthService',    target: 'JWTValidator',   label: 'validates JWT inline',   type: 'smoothstep' },
        { id: 'e3', source: 'AuthService',    target: 'SessionManager', label: 'manages session',        type: 'smoothstep' },
        { id: 'e4', source: 'AuthService',    target: 'RoleChecker',    label: 'checks roles inline',    type: 'smoothstep' },
        { id: 'e5', source: 'AuthService',    target: 'UserRepository', label: 'loads user',             type: 'smoothstep' },
        { id: 'e6', source: 'TokenStrategy',  target: 'AuthService',    label: 'not used (absent)',      type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'AuthService',
        description:
          'JWT validation is hardcoded inline with no TokenStrategy interface. Many production systems must support multiple token types simultaneously: JWT (stateless), opaque session tokens (stateful), OAuth access tokens, and API keys. Without a TokenStrategy interface, adding any new token type requires modifying AuthService.',
        interviewContext:
          'Senior candidates define a TokenStrategy interface with validate(token): Principal and propose JWTStrategy, SessionTokenStrategy, and APIKeyStrategy implementations. They note that the service should select the strategy based on token format/prefix, not with if/else inside AuthService.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'AuthService',
        description:
          'AuthService conflates authentication (is this token valid?), session management (create/destroy sessions), and authorisation (does this user have this role?). Authentication and authorisation are distinct concerns — mixing them violates SRP and makes AuthService impossible to use in contexts where only one is needed.',
        interviewContext:
          'The standard separation is: AuthenticationService (validates credentials/tokens), SessionService (manages session lifecycle), and AuthorisationService (checks permissions via RBAC/ABAC). Many frameworks enforce this split (Spring Security\'s AuthenticationManager vs. AccessDecisionManager).',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'AuthService',
        description:
          'AuthService is directly coupled to UserRepository for every authentication call. If user data is stored in multiple backends (LDAP, OAuth provider, local DB), there is no UserStore abstraction to select the appropriate backend. This also means every token validation triggers a user lookup, introducing a latency hotspot.',
        interviewContext:
          'Candidates should propose a IdentityProvider interface (LocalIdentityProvider, LDAPProvider, OAuthProvider) with a caching layer for the token → Principal mapping. JWT-based systems can avoid the user lookup entirely since claims are embedded in the token.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'RoleChecker',
        description:
          'Role checking is hardcoded inline in AuthService with no Permission or Policy abstraction. This prevents moving to attribute-based access control (ABAC) or policy-as-code (OPA) without rewriting AuthService. RBAC to ABAC is a common evolution in growing systems.',
        interviewContext:
          'Senior engineers propose a PolicyEnforcer interface with isPermitted(principal, resource, action): boolean, backed by RBACEnforcer or OPAPolicyEnforcer. This mirrors the architecture of AWS IAM, Casbin, and Zanzibar (Google\'s authorisation system).',
      },
    ],
    explanation:
      'AuthService should be decomposed along three axes. First, introduce a TokenStrategy interface (JWTStrategy, SessionTokenStrategy, APIKeyStrategy) selected by token format — AuthService delegates validation without knowing the token type. Second, extract SessionService as a standalone component managing session lifecycle independently of token validation. Third, extract an AuthorisationService with a PolicyEnforcer interface (RBACEnforcer or OPAPolicyEnforcer) for permission checks. AuthService becomes a thin orchestrator: validate token via TokenStrategy → load Principal → authorise via PolicyEnforcer. UserRepository access is cached to avoid per-request DB hits. This design aligns with Spring Security\'s layered architecture and enables independent evolution of authentication, session management, and authorisation policies.',
  },

  // ─────────────────────────────────────────────────────────────
  // 9. order=83 — Message Queue — No Consumer Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'messaging-queue-no-consumer',
    title: 'Message Queue — No Consumer Abstraction',
    description:
      'MessageBroker delivers messages to EmailConsumer, SMSConsumer, and PushConsumer with direct method calls. There is no Consumer interface, and retry logic is duplicated in each consumer class.',
    difficulty: 'hard',
    order: 83,
    diagramData: {
      nodes: [
        { id: 'MessageBroker',   data: { label: 'MessageBroker' },   position: { x: 80,  y: 80  } },
        { id: 'EmailConsumer',   data: { label: 'EmailConsumer' },   position: { x: 310, y: 80  } },
        { id: 'SMSConsumer',     data: { label: 'SMSConsumer' },     position: { x: 540, y: 80  } },
        { id: 'PushConsumer',    data: { label: 'PushConsumer' },    position: { x: 770, y: 80  } },
        { id: 'RetryHandler',    data: { label: 'RetryHandler' },    position: { x: 80,  y: 250 } },
        { id: 'DeadLetterQueue', data: { label: 'DeadLetterQueue' }, position: { x: 310, y: 250 } },
        { id: 'MessageQueue',    data: { label: 'MessageQueue' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'MessageQueue',    target: 'MessageBroker',   label: 'dequeues messages',      type: 'smoothstep' },
        { id: 'e2', source: 'MessageBroker',   target: 'EmailConsumer',   label: 'email.consume(msg)',     type: 'smoothstep' },
        { id: 'e3', source: 'MessageBroker',   target: 'SMSConsumer',     label: 'sms.consume(msg)',       type: 'smoothstep' },
        { id: 'e4', source: 'MessageBroker',   target: 'PushConsumer',    label: 'push.consume(msg)',      type: 'smoothstep' },
        { id: 'e5', source: 'EmailConsumer',   target: 'RetryHandler',    label: 'duplicate retry logic',  type: 'smoothstep' },
        { id: 'e6', source: 'SMSConsumer',     target: 'RetryHandler',    label: 'duplicate retry logic',  type: 'smoothstep' },
        { id: 'e7', source: 'RetryHandler',    target: 'DeadLetterQueue', label: 'exhausted retries',      type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'MessageBroker',
        description:
          'MessageBroker directly calls EmailConsumer, SMSConsumer, and PushConsumer by concrete type. There is no Consumer interface with a consume(message): void contract. Adding a new consumer type (e.g., WebhookConsumer) requires modifying MessageBroker, violating OCP. The broker should be oblivious to consumer implementation details.',
        interviewContext:
          'Senior candidates define a Consumer<T> interface and a consumer registry. MessageBroker holds a List<Consumer<Message>> and dispatches polymorphically. They note this mirrors the Observer pattern and how Kafka consumer groups, RabbitMQ bindings, and SQS fan-out work.',
      },
      {
        id: 'issue-2',
        type: 'cohesion_issue',
        targetClass: 'EmailConsumer',
        description:
          'Retry logic is duplicated across all three consumer classes. Retry behaviour (exponential backoff, max attempts, jitter) is a cross-cutting infrastructure concern, not domain logic. Each consumer re-implementing retry creates maintenance overhead and inconsistent behaviour — one consumer might retry 3 times while another retries 5.',
        interviewContext:
          'The correct approach is to implement retry as a decorator (RetryConsumer<T> wrapping any Consumer<T>) or as a base AbstractRetryConsumer. This is the Decorator pattern applied to cross-cutting concerns. Candidates should mention that Kafka consumer frameworks provide this out-of-the-box.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'MessageBroker',
        description:
          'MessageBroker is tightly coupled to specific consumer types through direct references. This means MessageBroker must be recompiled and redeployed when a new consumer is added or removed. In a production system, consumers should be dynamically registerable without modifying the broker.',
        interviewContext:
          'Candidates should propose a ConsumerRegistry that allows runtime registration of Consumer<T> instances. MessageBroker depends on ConsumerRegistry, not concrete consumers. This supports plugin-style consumer addition and mirrors how Spring Kafka @KafkaListener and AWS Lambda event source mappings work.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'DeadLetterQueue',
        description:
          'DeadLetterQueue exists but is only reachable through RetryHandler, which is only wired to two of the three consumers. There is no uniform DLQ policy applied consistently to all consumers. Failed messages from PushConsumer may be silently dropped if its retry handler is not wired to the DLQ.',
        interviewContext:
          'Senior engineers note that DLQ routing, retry policy, and poison pill handling should be part of the MessageBroker infrastructure, not per-consumer logic. A DeadLetterPolicy abstraction configured per-topic or per-consumer-group ensures consistency. They reference the Dead Letter Channel enterprise integration pattern.',
      },
    ],
    explanation:
      'MessageBroker should depend on a Consumer<Message> interface, with EmailConsumer, SMSConsumer, and PushConsumer as implementations registered in a ConsumerRegistry. Retry logic is extracted into a RetryConsumer<T> decorator wrapping any Consumer<T> with configurable backoff, max attempts, and jitter — applied uniformly via the registry. DeadLetterQueue routing is a broker-level policy triggered after retry exhaustion, not a per-consumer concern. MessageBroker\'s dispatch loop becomes: dequeue → resolve consumers → foreach consumer: delegate (with retry wrapper) → on exhaustion: send to DLQ. This matches the enterprise integration patterns (Dead Letter Channel, Competing Consumers) and how production message brokers like RabbitMQ and Kafka are architected.',
  },

  // ─────────────────────────────────────────────────────────────
  // 10. order=84 — Order Management — Workflow God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'order-management-workflow-god',
    title: 'Order Management — Workflow God Class',
    description:
      'OrderWorkflow manages state transitions, inventory locking, payment capture, fulfillment routing, carrier selection, and customer notification — all six concerns in a single workflow class.',
    difficulty: 'hard',
    order: 84,
    diagramData: {
      nodes: [
        { id: 'OrderWorkflow',      data: { label: 'OrderWorkflow' },      position: { x: 80,  y: 80  } },
        { id: 'InventoryLock',      data: { label: 'InventoryLock' },      position: { x: 310, y: 80  } },
        { id: 'PaymentCapture',     data: { label: 'PaymentCapture' },     position: { x: 540, y: 80  } },
        { id: 'FulfillmentRouter',  data: { label: 'FulfillmentRouter' },  position: { x: 770, y: 80  } },
        { id: 'CarrierSelector',    data: { label: 'CarrierSelector' },    position: { x: 80,  y: 250 } },
        { id: 'CustomerNotifier',   data: { label: 'CustomerNotifier' },   position: { x: 310, y: 250 } },
        { id: 'OrderState',         data: { label: 'OrderState' },         position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'OrderWorkflow',     target: 'OrderState',        label: 'transitions state',      type: 'smoothstep' },
        { id: 'e2', source: 'OrderWorkflow',     target: 'InventoryLock',     label: 'lockStock()',            type: 'smoothstep' },
        { id: 'e3', source: 'OrderWorkflow',     target: 'PaymentCapture',    label: 'capturePayment()',       type: 'smoothstep' },
        { id: 'e4', source: 'OrderWorkflow',     target: 'FulfillmentRouter', label: 'routeFulfillment()',     type: 'smoothstep' },
        { id: 'e5', source: 'OrderWorkflow',     target: 'CarrierSelector',   label: 'selectCarrier()',        type: 'smoothstep' },
        { id: 'e6', source: 'OrderWorkflow',     target: 'CustomerNotifier',  label: 'notifyCustomer()',       type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'OrderWorkflow',
        description:
          'OrderWorkflow owns six independent domain concerns across different bounded contexts: inventory (lock), payment (capture), fulfillment (routing), logistics (carrier selection), CRM (customer notification), and order lifecycle (state machine). Changes from the inventory team, payment team, and logistics team all converge on this single class.',
        interviewContext:
          'Senior candidates immediately propose decomposing this into a Saga with compensatable steps. Each step belongs to its domain: InventoryService, PaymentService, FulfillmentService, LogisticsService, NotificationService. OrderWorkflow becomes a Saga coordinator with no domain logic of its own.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'OrderState',
        description:
          'OrderState is used as a data object but the state transition logic lives in OrderWorkflow. This means state transition rules (what transitions are valid from PENDING?) are mixed with orchestration logic. The State pattern would encapsulate each state\'s valid transitions and actions, making invalid transitions compile-time or runtime detectable.',
        interviewContext:
          'Candidates should propose the State pattern: each OrderState (PendingState, InventoryLockedState, PaymentCapturedState, etc.) knows its valid transitions and triggers the appropriate next action. OrderWorkflow delegates to the current state object rather than having giant switch/if-else blocks.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'OrderWorkflow',
        description:
          'All six collaborators are synchronous hard dependencies of OrderWorkflow. A slow or failed CarrierSelector blocks the entire workflow thread. In a high-throughput order system, some steps (customer notification) should be asynchronous and non-blocking, while critical path steps (payment capture) may be synchronous.',
        interviewContext:
          'Senior engineers classify steps as critical-path (inventory lock, payment capture) vs. non-critical (carrier selection, notification) and propose async execution for non-critical steps via an event bus. They reference the Outbox pattern to ensure events are reliably published after state transitions.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'CarrierSelector',
        description:
          'Carrier selection logic is embedded directly inside OrderWorkflow (or CarrierSelector with no abstraction layer). Carrier selection is a Strategy: different rules apply for domestic vs. international, standard vs. express, and different merchant contracts. Without a CarrierSelectionStrategy interface, the selection logic is not extensible.',
        interviewContext:
          'Candidates should propose a CarrierSelectionStrategy interface with implementations like LowestCostStrategy, FastestDeliveryStrategy, and ContractPreferenceStrategy. This enables rule-based routing that can be configured per-merchant without code changes.',
      },
    ],
    explanation:
      'OrderWorkflow should be refactored into a Saga coordinator that holds a sequence of OrderSagaStep instances, each with execute() and compensate(). InventoryLockStep, PaymentCaptureStep, FulfillmentRoutingStep, CarrierSelectionStep, and CustomerNotificationStep each encapsulate one domain transition with its compensation. OrderState transitions are managed by the State pattern — each state object (PendingState, LockedState, CapturedState) defines valid transitions and guards against invalid ones. Non-critical steps (notification) are executed asynchronously via an event bus after the critical path completes. CarrierSelector uses a CarrierSelectionStrategy injected by configuration. The Outbox pattern ensures saga state and domain events are persisted atomically, enabling crash recovery.',
  },

  // ─────────────────────────────────────────────────────────────
  // 11. order=85 — CMS — No Plugin Architecture
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'content-management-no-plugin',
    title: 'CMS — No Plugin Architecture',
    description:
      'The CMS class directly extends or instantiates ImagePlugin, VideoPlugin, and FormPlugin. Adding a new plugin type requires modifying CMS source code. There is no plugin interface or plugin registry.',
    difficulty: 'hard',
    order: 85,
    diagramData: {
      nodes: [
        { id: 'CMS',               data: { label: 'CMS' },               position: { x: 80,  y: 80  } },
        { id: 'ImagePlugin',       data: { label: 'ImagePlugin' },       position: { x: 310, y: 80  } },
        { id: 'VideoPlugin',       data: { label: 'VideoPlugin' },       position: { x: 540, y: 80  } },
        { id: 'FormPlugin',        data: { label: 'FormPlugin' },        position: { x: 770, y: 80  } },
        { id: 'PluginInterface',   data: { label: 'PluginInterface' },   position: { x: 80,  y: 250 } },
        { id: 'PluginRegistry',    data: { label: 'PluginRegistry' },    position: { x: 310, y: 250 } },
        { id: 'ContentRepository', data: { label: 'ContentRepository' }, position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'CMS',            target: 'ImagePlugin',     label: 'directly instantiates',  type: 'smoothstep' },
        { id: 'e2', source: 'CMS',            target: 'VideoPlugin',     label: 'directly instantiates',  type: 'smoothstep' },
        { id: 'e3', source: 'CMS',            target: 'FormPlugin',      label: 'directly instantiates',  type: 'smoothstep' },
        { id: 'e4', source: 'CMS',            target: 'ContentRepository', label: 'stores content',       type: 'smoothstep' },
        { id: 'e5', source: 'PluginInterface', target: 'CMS',            label: 'not implemented',        type: 'smoothstep' },
        { id: 'e6', source: 'PluginRegistry',  target: 'CMS',            label: 'not used',               type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'CMS',
        description:
          'There is no ContentPlugin interface. CMS is aware of every plugin type by name, meaning every new plugin type (PDFPlugin, EcommercePlugin) requires CMS source modification. A plugin interface with render(), validate(), and getMetadata() methods would decouple CMS from all plugin implementations.',
        interviewContext:
          'Senior candidates name this as the Plugin pattern (or Microkernel pattern) and propose a ContentPlugin interface registered in a PluginRegistry keyed by content-type string. CMS resolves plugins at runtime: registry.get(contentType).render(content). This is how WordPress, Craft CMS, and Drupal are architected.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'CMS',
        description:
          'CMS has direct compile-time dependencies on ImagePlugin, VideoPlugin, and FormPlugin. This means deploying a new plugin version requires redeploying CMS. Plugin architectures should allow runtime registration from external jars/modules without recompiling the host application.',
        interviewContext:
          'Candidates should propose using a PluginRegistry populated at startup from configuration (or ServiceLoader in Java). CMS only depends on PluginInterface, never on concrete plugins. This enables third-party plugin development without access to CMS internals — the extension point model used by Eclipse, IntelliJ, and VS Code.',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'CMS',
        description:
          'CMS manages plugin lifecycle (instantiation), content storage, and content rendering in the same class. These are three distinct responsibilities. Plugin lifecycle management (registration, versioning, dependency resolution) should belong to PluginRegistry; storage should belong to ContentRepository; rendering should be delegated to plugins.',
        interviewContext:
          'The Microkernel pattern clarifies this split: the core kernel (CMS) provides extension points and core services; plugins implement extension points; a plugin registry manages lifecycle. CMS should have no rendering or plugin-creation logic.',
      },
      {
        id: 'issue-4',
        type: 'wrong_relationship',
        targetClass: 'PluginRegistry',
        description:
          'PluginRegistry and PluginInterface exist in the diagram but have no incoming edges from concrete plugins and are not used by CMS. The intended abstraction exists but is wired backwards — CMS still calls concrete classes. This is the "partial refactor" smell: the abstraction was started but never completed, leaving the system in a worse state than either design.',
        interviewContext:
          'This tests whether candidates can identify incomplete abstractions. The fix is to invert the dependency: ImagePlugin, VideoPlugin, FormPlugin all implement PluginInterface; PluginRegistry holds List<ContentPlugin>; CMS injects PluginRegistry and calls registry.resolve(contentType) rather than any concrete class.',
      },
    ],
    explanation:
      'CMS should implement the Microkernel (Plugin) pattern. A ContentPlugin interface defines the extension contract: render(content), validate(content), getSupportedType(): string. Concrete plugins (ImagePlugin, VideoPlugin, FormPlugin) implement ContentPlugin and register themselves with PluginRegistry (by content-type key). CMS depends only on PluginRegistry and ContentRepository — it has no direct plugin dependencies. At request time: CMS resolves the plugin for the content type via registry, delegates rendering, and stores via ContentRepository. New plugin types are added by implementing ContentPlugin and registering — zero changes to CMS. Plugin lifecycle (enable/disable, version) is managed entirely by PluginRegistry. This mirrors the extension-point model of IntelliJ, Eclipse, and all production CMS platforms.',
  },

  // ─────────────────────────────────────────────────────────────
  // 12. order=86 — API Gateway God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'api-gateway-god',
    title: 'API Gateway God Class',
    description:
      'Gateway handles authentication, rate limiting, request transformation, service discovery, load balancing, logging, and circuit breaking — all inline in a single class.',
    difficulty: 'hard',
    order: 86,
    diagramData: {
      nodes: [
        { id: 'Gateway',            data: { label: 'Gateway' },            position: { x: 80,  y: 80  } },
        { id: 'AuthHandler',        data: { label: 'AuthHandler' },        position: { x: 310, y: 80  } },
        { id: 'RateLimiter',        data: { label: 'RateLimiter' },        position: { x: 540, y: 80  } },
        { id: 'RequestTransformer', data: { label: 'RequestTransformer' }, position: { x: 770, y: 80  } },
        { id: 'ServiceDiscovery',   data: { label: 'ServiceDiscovery' },   position: { x: 80,  y: 250 } },
        { id: 'LoadBalancer',       data: { label: 'LoadBalancer' },       position: { x: 310, y: 250 } },
        { id: 'CircuitBreaker',     data: { label: 'CircuitBreaker' },     position: { x: 540, y: 250 } },
        { id: 'Logger',             data: { label: 'Logger' },             position: { x: 770, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Gateway', target: 'AuthHandler',        label: 'auth inline',           type: 'smoothstep' },
        { id: 'e2', source: 'Gateway', target: 'RateLimiter',        label: 'rate-limit inline',     type: 'smoothstep' },
        { id: 'e3', source: 'Gateway', target: 'RequestTransformer', label: 'transforms inline',     type: 'smoothstep' },
        { id: 'e4', source: 'Gateway', target: 'ServiceDiscovery',   label: 'discovers service',     type: 'smoothstep' },
        { id: 'e5', source: 'Gateway', target: 'LoadBalancer',       label: 'picks instance',        type: 'smoothstep' },
        { id: 'e6', source: 'Gateway', target: 'CircuitBreaker',     label: 'circuit-breaks inline', type: 'smoothstep' },
        { id: 'e7', source: 'Gateway', target: 'Logger',             label: 'logs inline',           type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'Gateway',
        description:
          'Gateway accumulates seven distinct cross-cutting concerns: authentication, rate limiting, request transformation, service discovery, load balancing, circuit breaking, and logging. This is the classic God Class anti-pattern in the API Gateway context — the class grows without bound, testing any single concern requires the entire gateway, and changes to circuit-breaking logic risk breaking authentication.',
        interviewContext:
          'Senior candidates immediately propose the Filter Chain pattern (also known as Middleware Chain or Interceptor Chain). Each concern becomes an independent GatewayFilter with process(request, chain) → forward to next. This is exactly how Kong, AWS API Gateway, and Spring Cloud Gateway are designed.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'Gateway',
        description:
          'There is no GatewayFilter interface. Without a filter chain, the execution order of concerns (auth must precede rate limiting which must precede routing) is hardcoded in Gateway\'s dispatch method. Reordering, enabling, or disabling individual concerns requires modifying Gateway itself.',
        interviewContext:
          'The GatewayFilter interface with process(RequestContext, FilterChain): ResponseContext enables an ordered pipeline. Filters are loaded from configuration (enabled, ordered by priority). Senior engineers reference the Chain of Responsibility pattern and how Nginx ngx_module_t, Kong plugins, and Spring WebFilter work.',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'Gateway',
        description:
          'Load balancing and service discovery are distinct infrastructure concerns from application-level concerns like authentication and request transformation. Mixing them prevents Gateway from using an external load balancer (e.g., L4 hardware LB) without removing internal LB code. Infrastructure concerns should be configurable independently of application concerns.',
        interviewContext:
          'Candidates should separate routing concerns (ServiceDiscovery, LoadBalancer) into a dedicated RouteResolver that Gateway delegates to after application filters. This matches the separation in Kubernetes Ingress between L7 routing rules and upstream service selection (handled by kube-proxy/service mesh).',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'CircuitBreaker',
        description:
          'CircuitBreaker is a dependency of Gateway but implemented inline rather than as a policy wrapping outbound calls. If the circuit breaker library changes (e.g., migrating from Hystrix to Resilience4j), Gateway internals must change. A CircuitBreakerPolicy interface decouples the breaker implementation from the gateway.',
        interviewContext:
          'Senior engineers note that circuit breaking should be per-upstream-service, not a single gateway-wide breaker. A CircuitBreakerRegistry keyed by service name provides per-service state. They reference Resilience4j\'s CircuitBreakerRegistry and how it integrates with Spring Cloud Gateway.',
      },
    ],
    explanation:
      'Gateway should implement the Filter Chain (Chain of Responsibility) pattern. A GatewayFilter interface with process(RequestContext, FilterChain) enables an ordered pipeline: AuthFilter → RateLimitFilter → TransformFilter → RoutingFilter → CircuitBreakerFilter → LoggingFilter. Each filter is independently configurable, testable, and deployable as a plugin. Gateway becomes a thin dispatcher that builds the chain from configuration and invokes it. ServiceDiscovery and LoadBalancer are encapsulated in a RouteResolver used by RoutingFilter. CircuitBreakerFilter delegates to a CircuitBreakerRegistry (one breaker per upstream service) backed by Resilience4j or Hystrix. This design matches Kong, AWS API Gateway, and Spring Cloud Gateway architectures and enables per-route filter configuration.',
  },

  // ─────────────────────────────────────────────────────────────
  // 13. order=87 — ML Pipeline — No Stage Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'ml-pipeline-no-stage',
    title: 'ML Pipeline — No Stage Abstraction',
    description:
      'MLPipeline chains preprocessing, feature extraction, training, evaluation, and serving in one class with no PipelineStage interface. All stages are tightly coupled, preventing independent testing or replacement.',
    difficulty: 'hard',
    order: 87,
    diagramData: {
      nodes: [
        { id: 'MLPipeline',       data: { label: 'MLPipeline' },       position: { x: 80,  y: 80  } },
        { id: 'Preprocessor',     data: { label: 'Preprocessor' },     position: { x: 310, y: 80  } },
        { id: 'FeatureExtractor', data: { label: 'FeatureExtractor' }, position: { x: 540, y: 80  } },
        { id: 'Trainer',          data: { label: 'Trainer' },          position: { x: 770, y: 80  } },
        { id: 'Evaluator',        data: { label: 'Evaluator' },        position: { x: 80,  y: 250 } },
        { id: 'ModelServer',      data: { label: 'ModelServer' },      position: { x: 310, y: 250 } },
        { id: 'PipelineStage',    data: { label: 'PipelineStage' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'MLPipeline', target: 'Preprocessor',     label: 'step 1 hardcoded',      type: 'smoothstep' },
        { id: 'e2', source: 'MLPipeline', target: 'FeatureExtractor', label: 'step 2 hardcoded',      type: 'smoothstep' },
        { id: 'e3', source: 'MLPipeline', target: 'Trainer',          label: 'step 3 hardcoded',      type: 'smoothstep' },
        { id: 'e4', source: 'MLPipeline', target: 'Evaluator',        label: 'step 4 hardcoded',      type: 'smoothstep' },
        { id: 'e5', source: 'MLPipeline', target: 'ModelServer',      label: 'step 5 hardcoded',      type: 'smoothstep' },
        { id: 'e6', source: 'PipelineStage', target: 'MLPipeline',    label: 'not implemented',       type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'MLPipeline',
        description:
          'All pipeline stages are hardcoded concrete dependencies with no PipelineStage interface. There is no way to insert a new stage (e.g., DataAugmentation between Preprocessor and FeatureExtractor), replace a stage (swap Trainer for a distributed XGBoostTrainer), or skip a stage (skip Evaluator in online serving) without modifying MLPipeline.',
        interviewContext:
          'Senior candidates propose a PipelineStage<Input, Output> interface with transform(input): output and an ordered list of stages in MLPipeline. This is the Pipes-and-Filters pattern, exactly as implemented in scikit-learn Pipeline, Apache Beam, and TFX (TensorFlow Extended).',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'MLPipeline',
        description:
          'Training and serving are fundamentally different workflows with different compute requirements, trigger mechanisms, and SLAs. MLPipeline conflates both: training is batch/offline (triggered by schedule, needs GPU), serving is online/real-time (needs low latency, no training infrastructure). Mixing them in one class prevents separate deployment.',
        interviewContext:
          'Candidates should propose separate TrainingPipeline and ServingPipeline classes. TrainingPipeline runs Preprocessor → FeatureExtractor → Trainer → Evaluator → ModelRegistry.store(). ServingPipeline runs Preprocessor → FeatureExtractor → ModelServer.predict(). The feature engineering stages are shared but the pipelines are distinct.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'Trainer',
        description:
          'Trainer is coupled to specific hyperparameter values and model type hardcoded in MLPipeline. In a production ML system, hyperparameters should be passed via a config object or experiment tracker, enabling hyperparameter search (AutoML) without code changes. The tight coupling makes reproducible experiments impossible.',
        interviewContext:
          'Senior engineers propose that Trainer receives a ModelConfig (hyperparameters, model architecture) and logs to an ExperimentTracker (MLflow, W&B). This enables reproducible runs, experiment comparison, and hyperparameter sweep without touching pipeline code.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'Evaluator',
        description:
          'Evaluator is hardcoded with specific metrics (e.g., accuracy) in the pipeline. Different model types require different evaluation metrics (RMSE for regression, F1 for imbalanced classification, NDCG for ranking). Without a MetricSet abstraction, the evaluation stage cannot be configured per experiment.',
        interviewContext:
          'Candidates should propose an EvaluationMetric interface with compute(predictions, labels): MetricResult, and Evaluator accepting a List<EvaluationMetric>. This matches scikit-learn\'s scoring parameter and TFX\'s TFMA (TensorFlow Model Analysis) design.',
      },
    ],
    explanation:
      'MLPipeline should implement the Pipes-and-Filters pattern with a PipelineStage<I,O> interface. Stages are composed into an ordered pipeline at construction time, enabling insertion, removal, and reordering without code changes. Training and serving are separated into TrainingPipeline and ServingPipeline — sharing feature engineering stages but with distinct orchestration. Trainer receives ModelConfig for reproducible experiments and logs to ExperimentTracker. Evaluator accepts a configurable List<EvaluationMetric>. ModelServer is a separate serving concern that loads the best model from ModelRegistry (selected by Evaluator thresholds). This design matches TFX, Kubeflow Pipelines, and MLflow Projects architectures, enabling MLOps best practices: versioned experiments, model registry, and independent training/serving deployment.',
  },

  // ─────────────────────────────────────────────────────────────
  // 14. order=88 — Notification Fanout — Wrong Observer Implementation
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'notification-fanout-wrong-pattern',
    title: 'Notification Fanout — Wrong Observer Implementation',
    description:
      'NotificationService holds direct references to EmailChannel, SMSChannel, PushChannel, SlackChannel, WebhookChannel, and InAppChannel concrete classes. There is no Observer interface, and adding a new channel requires modifying NotificationService.',
    difficulty: 'hard',
    order: 88,
    diagramData: {
      nodes: [
        { id: 'NotificationService', data: { label: 'NotificationService' }, position: { x: 80,  y: 80  } },
        { id: 'EmailChannel',        data: { label: 'EmailChannel' },        position: { x: 310, y: 80  } },
        { id: 'SMSChannel',          data: { label: 'SMSChannel' },          position: { x: 540, y: 80  } },
        { id: 'PushChannel',         data: { label: 'PushChannel' },         position: { x: 770, y: 80  } },
        { id: 'SlackChannel',        data: { label: 'SlackChannel' },        position: { x: 80,  y: 250 } },
        { id: 'WebhookChannel',      data: { label: 'WebhookChannel' },      position: { x: 310, y: 250 } },
        { id: 'InAppChannel',        data: { label: 'InAppChannel' },        position: { x: 540, y: 250 } },
        { id: 'Observer',            data: { label: 'Observer' },            position: { x: 770, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'NotificationService', target: 'EmailChannel',   label: 'email.send(n)',         type: 'smoothstep' },
        { id: 'e2', source: 'NotificationService', target: 'SMSChannel',     label: 'sms.send(n)',           type: 'smoothstep' },
        { id: 'e3', source: 'NotificationService', target: 'PushChannel',    label: 'push.send(n)',          type: 'smoothstep' },
        { id: 'e4', source: 'NotificationService', target: 'SlackChannel',   label: 'slack.send(n)',         type: 'smoothstep' },
        { id: 'e5', source: 'NotificationService', target: 'WebhookChannel', label: 'webhook.send(n)',       type: 'smoothstep' },
        { id: 'e6', source: 'NotificationService', target: 'InAppChannel',   label: 'inapp.send(n)',         type: 'smoothstep' },
        { id: 'e7', source: 'Observer',            target: 'NotificationService', label: 'not implemented', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'NotificationService',
        description:
          'NotificationService directly depends on six concrete channel classes instead of an Observer/NotificationChannel interface. The Observer pattern requires the subject (NotificationService) to depend only on the observer interface, never on concrete observers. Adding a 7th channel (e.g., TeamsChannel) requires modifying NotificationService, violating OCP.',
        interviewContext:
          'Senior candidates name the Observer pattern and propose a NotificationChannel interface with send(Notification): void. NotificationService holds a List<NotificationChannel> (registered via subscribe/unsubscribe). Fan-out is a single foreach loop. They also distinguish this from a pub-sub system where channels are decoupled by a message broker.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'Observer',
        description:
          'Observer interface exists in the diagram but is not implemented by any channel and not used by NotificationService. The interface was designed but never wired — a partial refactor smell. All six channels call send() with the same signature but have no shared interface, making them impossible to use polymorphically.',
        interviewContext:
          'This tests recognition of incomplete abstractions. The fix completes the pattern: each channel implements Observer (or NotificationChannel); NotificationService holds List<Observer>; the direct concrete references are removed. Candidates should identify this as an OCP violation that increases in cost with every new channel.',
      },
      {
        id: 'issue-3',
        type: 'cohesion_issue',
        targetClass: 'NotificationService',
        description:
          'NotificationService likely also contains notification preferences, user channel opt-in logic, and routing rules (send SMS only if email bounces). Mixing fan-out mechanics with preference management and fallback routing reduces cohesion. These are separate concerns: fan-out mechanics vs. routing policy vs. channel management.',
        interviewContext:
          'Candidates should propose a ChannelRouter that consults UserPreferences to determine which channels to fan out to, and NotificationService that delegates routing then executes fan-out via the observer list. This cleanly separates "where to send" from "how to send".',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'NotificationService',
        description:
          'Fan-out is synchronous — all six channel send() calls happen in sequence in the same thread. A slow or failing WebhookChannel delays InAppChannel delivery for every notification. In a production system, notification fan-out should be asynchronous and failure of one channel should not affect others.',
        interviewContext:
          'Senior engineers propose async fan-out: each channel subscription publishes to a per-channel queue; channels consume from their queue independently. This provides backpressure, retry, and fault isolation per channel. They reference the Publish-Subscribe Channel pattern from Enterprise Integration Patterns.',
      },
    ],
    explanation:
      'NotificationService should implement the Observer pattern with a NotificationChannel interface (or Observer) with send(Notification): void. All six channel classes implement NotificationChannel and are registered in NotificationService.subscribe(). Fan-out is a single polymorphic loop. A ChannelRouter consults UserPreferences to determine which channels to activate, keeping routing logic out of NotificationService. Fan-out should be asynchronous: each channel posts to an independent delivery queue, ensuring failure isolation and per-channel retry. NotificationService becomes a thin coordinator: resolve channels via ChannelRouter → enqueue per-channel delivery tasks. This matches how production notification platforms (SendGrid Event Webhooks, Firebase Cloud Messaging, Twilio) decouple channel implementations from the fan-out coordinator.',
  },

  // ─────────────────────────────────────────────────────────────
  // 15. order=89 — Inventory — Restock Saga Without Compensation
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'inventory-restock-saga-missing',
    title: 'Inventory — Restock Saga Without Compensation',
    description:
      'InventoryService calls SupplierAPI, WarehouseService, and FinanceService sequentially. There is no rollback if FinanceService rejects the purchase order. No RestockSaga abstraction and tight coupling prevents independent failure handling.',
    difficulty: 'hard',
    order: 89,
    diagramData: {
      nodes: [
        { id: 'InventoryService', data: { label: 'InventoryService' }, position: { x: 80,  y: 80  } },
        { id: 'SupplierAPI',      data: { label: 'SupplierAPI' },      position: { x: 310, y: 80  } },
        { id: 'WarehouseService', data: { label: 'WarehouseService' }, position: { x: 540, y: 80  } },
        { id: 'FinanceService',   data: { label: 'FinanceService' },   position: { x: 770, y: 80  } },
        { id: 'RestockSaga',      data: { label: 'RestockSaga' },      position: { x: 80,  y: 250 } },
        { id: 'CompensationLog',  data: { label: 'CompensationLog' },  position: { x: 310, y: 250 } },
        { id: 'StockRecord',      data: { label: 'StockRecord' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'InventoryService', target: 'SupplierAPI',      label: 'createPO() step 1',     type: 'smoothstep' },
        { id: 'e2', source: 'InventoryService', target: 'WarehouseService', label: 'reserveSlot() step 2',  type: 'smoothstep' },
        { id: 'e3', source: 'InventoryService', target: 'FinanceService',   label: 'approveBudget() step 3',type: 'smoothstep' },
        { id: 'e4', source: 'InventoryService', target: 'StockRecord',      label: 'updates stock',         type: 'smoothstep' },
        { id: 'e5', source: 'RestockSaga',      target: 'InventoryService', label: 'not orchestrating',     type: 'smoothstep' },
        { id: 'e6', source: 'CompensationLog',  target: 'RestockSaga',      label: 'not used',              type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'InventoryService',
        description:
          'InventoryService orchestrates three external service calls (createPO, reserveSlot, approveBudget) sequentially with no Saga abstraction. If FinanceService rejects at step 3, the purchase order at SupplierAPI and the warehouse slot reservation are left in place — a dangling resource leak. Without compensating transactions, the system enters an inconsistent state.',
        interviewContext:
          'Senior candidates define a RestockSaga with three steps each having execute() and compensate(): SupplierPOStep (createPO / cancelPO), WarehouseSlotStep (reserveSlot / releaseSlot), FinanceApprovalStep (approveBudget / N/A — last step needs no compensation). They apply compensations in reverse order on failure.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'InventoryService',
        description:
          'InventoryService is an inventory domain service being forced to coordinate cross-domain transactions spanning supplier, warehouse, and finance. This mixes domain logic (when to restock, reorder points) with cross-service orchestration, which is an architectural concern. The orchestration bloats InventoryService beyond its domain boundary.',
        interviewContext:
          'Candidates should propose extracting the cross-service orchestration into a dedicated RestockSagaOrchestrator (or RestockProcessManager) that lives at the application service layer. InventoryService retains only inventory domain logic. This respects DDD\'s separation of domain services from application services.',
      },
      {
        id: 'issue-3',
        type: 'other',
        targetClass: 'CompensationLog',
        description:
          'CompensationLog exists in the diagram but is not connected to the orchestration flow. Without a durable saga log, a process crash between steps leaves the saga in an unknown state with no recovery path. The saga must write to CompensationLog atomically with each step transition, enabling idempotent replay and rollback on restart.',
        interviewContext:
          'This tests knowledge of the outbox pattern and saga durability. Candidates should note that the CompensationLog (or saga journal) must be written in the same transaction as the local step effect. Without this, exactly-once semantics are impossible and crash recovery results in partial execution.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'FinanceService',
        description:
          'All three external service calls are synchronous. FinanceService approval may involve human-in-the-loop review (hours/days). Blocking a thread in InventoryService for hours to await FinanceService approval is operationally untenable. The saga should support async step completion through events or callbacks.',
        interviewContext:
          'Senior engineers propose an async saga: each step publishes a command event; the target service processes it and emits a reply event; the saga advances or compensates based on the reply. Long-running steps like finance approval use an async correlation ID pattern, matching Temporal.io and Axon Framework saga implementations.',
      },
    ],
    explanation:
      'InventoryService should delegate cross-service orchestration to a RestockSagaOrchestrator. The saga defines three steps with execute/compensate pairs: SupplierPOStep (createPO / cancelPO), WarehouseSlotStep (reserveSlot / releaseSlot), and FinanceApprovalStep (approveBudget / no compensation as last step). On step N failure, compensations for steps N-1 through 0 execute in reverse. A CompensationLog records each transition atomically with the step effect, enabling crash recovery. Long-running steps (finance approval) are handled asynchronously using event correlation: the saga emits a command event and resumes when a reply event arrives. This design matches the Saga orchestration pattern from Microservices Patterns and systems like Temporal.io.',
  },

  // ─────────────────────────────────────────────────────────────
  // 16. order=90 — Database Connection Pool — God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'database-connection-pool-god',
    title: 'Database Connection Pool — God Class',
    description:
      'ConnectionPool handles connection creation, health checking, eviction, max-size enforcement, query routing, and connection recycling all inline. Six distinct infrastructure responsibilities in one class.',
    difficulty: 'hard',
    order: 90,
    diagramData: {
      nodes: [
        { id: 'ConnectionPool',     data: { label: 'ConnectionPool' },     position: { x: 80,  y: 80  } },
        { id: 'ConnectionFactory',  data: { label: 'ConnectionFactory' },  position: { x: 310, y: 80  } },
        { id: 'HealthChecker',      data: { label: 'HealthChecker' },      position: { x: 540, y: 80  } },
        { id: 'EvictionPolicy',     data: { label: 'EvictionPolicy' },     position: { x: 770, y: 80  } },
        { id: 'QueryRouter',        data: { label: 'QueryRouter' },        position: { x: 80,  y: 250 } },
        { id: 'ConnectionRecycler', data: { label: 'ConnectionRecycler' }, position: { x: 310, y: 250 } },
        { id: 'PoolConfig',         data: { label: 'PoolConfig' },         position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'ConnectionPool', target: 'ConnectionFactory',  label: 'creates connections',    type: 'smoothstep' },
        { id: 'e2', source: 'ConnectionPool', target: 'HealthChecker',      label: 'health-checks inline',   type: 'smoothstep' },
        { id: 'e3', source: 'ConnectionPool', target: 'EvictionPolicy',     label: 'evicts inline',          type: 'smoothstep' },
        { id: 'e4', source: 'ConnectionPool', target: 'QueryRouter',        label: 'routes queries',         type: 'smoothstep' },
        { id: 'e5', source: 'ConnectionPool', target: 'ConnectionRecycler', label: 'recycles inline',        type: 'smoothstep' },
        { id: 'e6', source: 'PoolConfig',     target: 'ConnectionPool',     label: 'configures pool',        type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'ConnectionPool',
        description:
          'ConnectionPool conflates six responsibilities: connection lifecycle (create/destroy), health validation, eviction scheduling, read/write routing, recycling heuristics, and configuration management. This matches the God Class anti-pattern applied to infrastructure components. Production connection pools (HikariCP, c3p0) explicitly separate these into focused collaborators.',
        interviewContext:
          'Senior candidates note that HikariCP achieves its performance precisely by having lean, focused components. They propose ConnectionFactory (creation/destruction), HealthValidator (connection validation), EvictionPolicy (max-age, idle-timeout), and QueryRouter (read-replica routing) as distinct abstractions.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'EvictionPolicy',
        description:
          'Eviction logic is inline in ConnectionPool with no EvictionPolicy interface. Eviction needs multiple configurable strategies: evict-on-max-age (connection lifetime), evict-on-idle (connection idle timeout), evict-on-error (broken connection), and evict-on-min-evictable-idle-time. Different deployment environments need different strategies.',
        interviewContext:
          'Candidates should propose an EvictionPolicy interface with shouldEvict(Connection): boolean, with MaxAgePolicy, IdleTimeoutPolicy, and ErrorRatePolicy implementations. ConnectionPool runs a background thread that iterates idle connections and applies the policy. This matches DBCP2 and HikariCP\'s housekeeping thread design.',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'QueryRouter',
        description:
          'Query routing (primary vs. read replica selection) is a fundamentally different concern from connection pooling. ConnectionPool should provide connections; routing determines which pool (primary or replica) to use. Mixing them means scaling the read replica pool requires modifying the pooling implementation.',
        interviewContext:
          'Senior engineers separate ConnectionPool (generic pool mechanics) from DataSourceRouter (selects primary or replica DataSource based on query type annotation). This mirrors the LazyConnectionDataSourceProxy + AbstractRoutingDataSource pattern in Spring, allowing read/write splitting without coupling routing to pool mechanics.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'HealthChecker',
        description:
          'Health checking is synchronous within ConnectionPool\'s acquire() path. If a validation query (SELECT 1) is slow, every connection acquisition is delayed. Health validation should be performed asynchronously by a background maintenance thread, and connections should be pre-validated before being returned, not validated on every checkout.',
        interviewContext:
          'Candidates should know that HikariCP uses a connectionTestQuery only as fallback and relies on JDBC4 isValid() with a configurable timeout. Background validation threads pre-warm the pool. Synchronous validation on every checkout is a latency anti-pattern in high-throughput systems.',
      },
    ],
    explanation:
      'ConnectionPool should be decomposed: ConnectionFactory handles creation/destruction; EvictionPolicy (interface with MaxAgePolicy, IdleTimeoutPolicy implementations) drives background eviction via a pool maintenance thread; HealthValidator performs asynchronous pre-validation (not per-checkout blocking validation); ConnectionRecycler resets connection state before returning to pool; QueryRouter is extracted entirely into a DataSourceRouter that selects the appropriate pool (primary/replica) before acquiring. ConnectionPool becomes a pure pool mechanics component (acquire/release, size management) unaware of routing or database type. PoolConfig is a value object. This separation mirrors HikariCP\'s FastList and ConcurrentBag implementations and enables independent tuning of each concern.',
  },

  // ─────────────────────────────────────────────────────────────
  // 17. order=91 — Game Engine — No Entity-Component Pattern
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'game-engine-no-component',
    title: 'Game Engine — No Entity-Component Pattern',
    description:
      'GameEntity has render(), collide(), animate(), persist(), and updateAI() methods all directly on the entity. The Entity-Component-System (ECS) pattern is absent, leading to exponential coupling as entity types multiply.',
    difficulty: 'hard',
    order: 91,
    diagramData: {
      nodes: [
        { id: 'GameEntity',           data: { label: 'GameEntity' },           position: { x: 80,  y: 80  } },
        { id: 'RenderComponent',      data: { label: 'RenderComponent' },      position: { x: 310, y: 80  } },
        { id: 'CollisionComponent',   data: { label: 'CollisionComponent' },   position: { x: 540, y: 80  } },
        { id: 'AnimationComponent',   data: { label: 'AnimationComponent' },   position: { x: 770, y: 80  } },
        { id: 'PersistenceComponent', data: { label: 'PersistenceComponent' }, position: { x: 80,  y: 250 } },
        { id: 'AIComponent',          data: { label: 'AIComponent' },          position: { x: 310, y: 250 } },
        { id: 'ComponentSystem',      data: { label: 'ComponentSystem' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'GameEntity', target: 'RenderComponent',      label: 'render() inline',       type: 'smoothstep' },
        { id: 'e2', source: 'GameEntity', target: 'CollisionComponent',   label: 'collide() inline',      type: 'smoothstep' },
        { id: 'e3', source: 'GameEntity', target: 'AnimationComponent',   label: 'animate() inline',      type: 'smoothstep' },
        { id: 'e4', source: 'GameEntity', target: 'PersistenceComponent', label: 'persist() inline',      type: 'smoothstep' },
        { id: 'e5', source: 'GameEntity', target: 'AIComponent',          label: 'updateAI() inline',     type: 'smoothstep' },
        { id: 'e6', source: 'ComponentSystem', target: 'GameEntity',      label: 'not composing',         type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'GameEntity',
        description:
          'GameEntity directly owns all behavioral methods instead of delegating to composable Component objects. As entity types multiply (Player, Enemy, NPC, Projectile, Pickup), each subclass must override different subsets of behaviors, leading to a deep inheritance hierarchy with combinatorial explosion. ECS eliminates this by composition over inheritance.',
        interviewContext:
          'Senior candidates name the Entity-Component-System (ECS) pattern: Entity is a pure ID; Components are pure data (Position, Velocity, Health); Systems process all entities with a specific component combination. They reference Unity\'s DOTS ECS and Unreal\'s Actor-Component system as production implementations.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'GameEntity',
        description:
          'A single GameEntity class is responsible for rendering, physics/collision, animation, persistence, and AI — five completely different subsystem concerns. Each subsystem is owned by a different engine team and has independent update frequencies (physics at 60Hz, AI at 10Hz, rendering every frame). Coupling them in one object prevents independent scheduling.',
        interviewContext:
          'Candidates should articulate that Systems in ECS run at independent rates and can be parallelised. RenderSystem runs every frame, PhysicsSystem runs at fixed timestep, AISystem runs at reduced frequency. This is impossible when all behavior is methods on a monolithic entity class.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'PersistenceComponent',
        description:
          'persist() is a method on GameEntity, meaning every entity save re-serializes render state, collision data, and AI state — even fields irrelevant to persistence. This creates tight coupling between the game runtime representation and the serialisation format, making save-file evolution extremely fragile.',
        interviewContext:
          'In ECS, persistence is a concern for a PersistenceSystem that iterates only entities with a PersistableComponent (containing save-relevant data). The game runtime representation (Position, Velocity) is decoupled from the save format. Candidates should reference the Flyweight pattern for shared component data.',
      },
      {
        id: 'issue-4',
        type: 'cohesion_issue',
        targetClass: 'ComponentSystem',
        description:
          'ComponentSystem exists in the diagram but is disconnected from entity behavior — it does not process components or own any update loop. The system exists as a structural node but plays no functional role, indicating the ECS pattern was partially sketched but not implemented. Entity logic remains inline on GameEntity.',
        interviewContext:
          'The fix completes the ECS design: ComponentSystem (base interface) is implemented by RenderSystem, PhysicsSystem, AISystem, etc. Each system holds a query for entities with specific component combinations and processes them in its update() method. GameEntity becomes a pure ID (uint64) with a component map. The World/Registry connects them.',
      },
    ],
    explanation:
      'The Entity-Component-System (ECS) pattern resolves all issues. Entity becomes a pure identifier (uint64). Components (RenderComponent, CollisionComponent, AIComponent, etc.) are pure data structs with no behavior. Systems (RenderSystem, PhysicsSystem, AISystem, PersistenceSystem) contain all logic and process all entities possessing their required component combination. ComponentSystem is the System base interface with update(deltaTime). A World/Registry maps entity IDs to component sets and provides query APIs for systems. This enables: independent update rates per system, parallel system execution on separate threads, cache-friendly data layout (SoA for performance), and decoupled serialisation. Unity DOTS, Unreal Engine Actors, and Bevy (Rust game engine) all implement this architecture.',
  },

  // ─────────────────────────────────────────────────────────────
  // 18. order=92 — Fraud Detection — Rules Mixed With Infrastructure
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'fraud-detection-mixed-pipeline',
    title: 'Fraud Detection — Rules Mixed With Infrastructure',
    description:
      'FraudDetector contains rule evaluation, DB query execution, real-time scoring, case management, and alert dispatch all in one class. There is no Rule interface, and domain logic is entangled with infrastructure concerns.',
    difficulty: 'hard',
    order: 92,
    diagramData: {
      nodes: [
        { id: 'FraudDetector',    data: { label: 'FraudDetector' },    position: { x: 80,  y: 80  } },
        { id: 'RuleEngine',       data: { label: 'RuleEngine' },       position: { x: 310, y: 80  } },
        { id: 'DataAccessLayer',  data: { label: 'DataAccessLayer' },  position: { x: 540, y: 80  } },
        { id: 'RealtimeScorer',   data: { label: 'RealtimeScorer' },   position: { x: 770, y: 80  } },
        { id: 'CaseManager',      data: { label: 'CaseManager' },      position: { x: 80,  y: 250 } },
        { id: 'AlertDispatcher',  data: { label: 'AlertDispatcher' },  position: { x: 310, y: 250 } },
        { id: 'RuleInterface',    data: { label: 'RuleInterface' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'FraudDetector',   target: 'RuleEngine',       label: 'evaluates rules inline',  type: 'smoothstep' },
        { id: 'e2', source: 'FraudDetector',   target: 'DataAccessLayer',  label: 'queries DB inline',       type: 'smoothstep' },
        { id: 'e3', source: 'FraudDetector',   target: 'RealtimeScorer',   label: 'scores inline',           type: 'smoothstep' },
        { id: 'e4', source: 'FraudDetector',   target: 'CaseManager',      label: 'creates case inline',     type: 'smoothstep' },
        { id: 'e5', source: 'FraudDetector',   target: 'AlertDispatcher',  label: 'dispatches alert',        type: 'smoothstep' },
        { id: 'e6', source: 'RuleInterface',   target: 'FraudDetector',    label: 'not implemented',         type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'FraudDetector',
        description:
          'There is no FraudRule interface. All fraud rules (velocity checks, geolocation mismatch, device fingerprint anomaly) are hardcoded inside FraudDetector. Adding a new rule requires modifying the detection class, making the rule set not externally configurable and preventing business-team-driven rule management without code deploys.',
        interviewContext:
          'Senior candidates define a FraudRule interface with evaluate(Transaction): RuleResult and a RuleEngine that runs List<FraudRule> in configurable order. They reference the Rule Engine / Business Rules Engine pattern (Drools, EasyRules) and note that production fraud systems expose a no-code rule editor for business analysts.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'FraudDetector',
        description:
          'FraudDetector conflates five distinct responsibilities: rule evaluation (domain logic), DB queries (infrastructure), ML scoring (data science), case creation (case management domain), and alert dispatch (notification domain). Domain logic and infrastructure are especially problematic to mix — it makes unit testing rule logic impossible without mocking DB calls.',
        interviewContext:
          'The correct layering is: FraudRuleEngine (domain) evaluates rules against a FraudSignal; FraudRepository (infrastructure) provides historical data; MLScorer (ML infrastructure) provides real-time risk scores; FraudCaseService (case management domain) creates cases; AlertService (notification) dispatches alerts. FraudDetector becomes a thin application service coordinating these.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'DataAccessLayer',
        description:
          'FraudDetector calls DataAccessLayer inline, coupling the fraud detection algorithm to specific DB query patterns. If historical data moves to a feature store (for ML feature consistency), FraudDetector must be modified. A FraudSignalRepository interface abstracts the data source, allowing swap to a feature store or cache without changing detection logic.',
        interviewContext:
          'Candidates should propose a FraudSignalRepository interface with getHistoricalSignals(userId): FraudSignal, enabling transparent migration from a relational DB to a feature store. They should note that feature stores (Feast, Tecton) solve the training-serving skew problem by providing consistent features both offline and online.',
      },
      {
        id: 'issue-4',
        type: 'cohesion_issue',
        targetClass: 'CaseManager',
        description:
          'Case management (creating fraud investigation cases, assigning to analysts, tracking resolution) is a separate bounded context from fraud detection (determining whether a transaction is fraudulent). Conflating them means CaseManager changes (new case workflow) force FraudDetector changes, and vice versa.',
        interviewContext:
          'Senior engineers separate detection (FraudDetectionService outputs a FraudDecision) from case management (FraudCaseService consumes FraudDecision via event and creates cases). This is a classic domain event decoupling: FraudDetectionService publishes a FraudDetectedEvent; CaseManager subscribes. Bounded context separation via events.',
      },
    ],
    explanation:
      'FraudDetector should be decomposed along domain boundaries. A FraudRule interface enables a pluggable RuleEngine with configurable rule sets. FraudSignalRepository abstracts data access, enabling feature store migration. MLScorer is a separate infrastructure component providing real-time risk scores. FraudDetectionService (application service) coordinates RuleEngine and MLScorer to produce a FraudDecision, then publishes a FraudDetectedEvent. FraudCaseService subscribes to FraudDetectedEvent and manages the case lifecycle independently. AlertService subscribes to high-severity decisions for dispatch. This event-driven bounded context separation mirrors production fraud systems at Stripe, PayPal, and Adyen, enabling independent evolution of detection logic, case management workflows, and alerting policies.',
  },

  // ─────────────────────────────────────────────────────────────
  // 19. order=93 — Supply Chain — Shipment State Without Pattern
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'supply-chain-no-state',
    title: 'Supply Chain — Shipment State Without Pattern',
    description:
      'Shipment has a giant status enum with if/else branches in every method. The State pattern is missing. Shipment also sends customer notifications directly, violating SRP.',
    difficulty: 'hard',
    order: 93,
    diagramData: {
      nodes: [
        { id: 'Shipment',             data: { label: 'Shipment' },             position: { x: 80,  y: 80  } },
        { id: 'CreatedState',         data: { label: 'CreatedState' },         position: { x: 310, y: 80  } },
        { id: 'InTransitState',       data: { label: 'InTransitState' },       position: { x: 540, y: 80  } },
        { id: 'DeliveredState',       data: { label: 'DeliveredState' },       position: { x: 770, y: 80  } },
        { id: 'StateHandler',         data: { label: 'StateHandler' },         position: { x: 80,  y: 250 } },
        { id: 'NotificationService',  data: { label: 'NotificationService' },  position: { x: 310, y: 250 } },
        { id: 'ShipmentRepository',   data: { label: 'ShipmentRepository' },   position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Shipment', target: 'CreatedState',        label: 'if CREATED: ...',         type: 'smoothstep' },
        { id: 'e2', source: 'Shipment', target: 'InTransitState',      label: 'if IN_TRANSIT: ...',      type: 'smoothstep' },
        { id: 'e3', source: 'Shipment', target: 'DeliveredState',      label: 'if DELIVERED: ...',       type: 'smoothstep' },
        { id: 'e4', source: 'Shipment', target: 'NotificationService', label: 'notifies customer',       type: 'smoothstep' },
        { id: 'e5', source: 'Shipment', target: 'ShipmentRepository',  label: 'self-persists',           type: 'smoothstep' },
        { id: 'e6', source: 'StateHandler', target: 'Shipment',        label: 'not used',                type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'Shipment',
        description:
          'Shipment uses a status enum with if/else (or switch) blocks in every method (ship(), deliver(), cancel(), getNextActions()). As the number of states grows (CREATED, PENDING_PICKUP, IN_TRANSIT, AT_CUSTOMS, OUT_FOR_DELIVERY, DELIVERED, RETURNED), each new state requires modifying every method. The State pattern eliminates this by encapsulating each state\'s behavior.',
        interviewContext:
          'Senior candidates propose the State pattern: each state (CreatedState, InTransitState, DeliveredState) implements a ShipmentState interface with ship(), deliver(), cancel() methods. Shipment delegates all behavior to its current ShipmentState. Adding a new state means adding a new class, not modifying existing ones. They reference how workflow engines implement this.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'Shipment',
        description:
          'Shipment directly calls NotificationService to send customer notifications on state change. A domain entity should not have dependencies on notification infrastructure. This couples the Shipment domain model to the notification delivery mechanism, making unit testing Shipment require mocking notification infrastructure.',
        interviewContext:
          'The correct approach is for Shipment to emit a domain event (ShipmentStatusChangedEvent) on each state transition. NotificationService subscribes to this event and handles notifications independently. This is the Domain Events pattern from DDD — entities raise events, infrastructure subscribes. Entities have no infrastructure dependencies.',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'Shipment',
        description:
          'Shipment calls ShipmentRepository to self-persist (Active Record pattern). This couples the domain entity to persistence infrastructure. In a DDD architecture, repositories are called by application services or domain services, not by entities themselves. Self-persisting entities make transaction boundary management and testing difficult.',
        interviewContext:
          'Candidates should argue for the Repository pattern where application services call ShipmentRepository.save(shipment) after state transitions. Shipment remains a pure domain object with no infrastructure dependencies. They should contrast Active Record (Rails, Django) with Domain Model patterns and explain when each is appropriate.',
      },
      {
        id: 'issue-4',
        type: 'cohesion_issue',
        targetClass: 'StateHandler',
        description:
          'StateHandler exists but is not connected to Shipment. The State pattern infrastructure exists as placeholder nodes but Shipment still uses inline if/else. This is an incomplete refactoring — state objects exist structurally but Shipment has not been updated to delegate to them, leaving the codebase in a worse hybrid state.',
        interviewContext:
          'This tests whether candidates can spot incomplete architectural migrations. The completion requires: (1) ShipmentState interface with all transition methods; (2) concrete state implementations; (3) Shipment.currentState field replacing the enum; (4) all method bodies replaced by currentState.method(this) delegations; (5) states raise domain events instead of calling services.',
      },
    ],
    explanation:
      'Shipment should implement the State pattern: ShipmentState interface with transition methods (ship, deliver, cancel, returnToSender), implemented by CreatedState, PendingPickupState, InTransitState, DeliveredState, ReturnedState. Shipment holds a currentState field and delegates all method calls to it — no if/else on enum. State objects raise domain events (ShipmentShippedEvent, ShipmentDeliveredEvent) instead of calling NotificationService directly. Application service calls ShipmentRepository.save() after state transitions. NotificationService subscribes to domain events via an event bus, decoupling delivery mechanism from domain logic. Each new state is a new class with no modifications to Shipment or existing states, fully satisfying OCP.',
  },

  // ─────────────────────────────────────────────────────────────
  // 20. order=94 — Multi-Tenant SaaS — No Tenant Isolation Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'multi-tenant-no-isolation',
    title: 'Multi-Tenant SaaS — No Tenant Isolation Abstraction',
    description:
      'TenantService uses tenantId parameters threaded through every method call. There is no TenantContext. Data access is not abstracted per tenant, creating risk of cross-tenant data leakage.',
    difficulty: 'hard',
    order: 94,
    diagramData: {
      nodes: [
        { id: 'TenantService',      data: { label: 'TenantService' },      position: { x: 80,  y: 80  } },
        { id: 'TenantContext',      data: { label: 'TenantContext' },      position: { x: 310, y: 80  } },
        { id: 'DataAccessLayer',    data: { label: 'DataAccessLayer' },    position: { x: 540, y: 80  } },
        { id: 'TenantConfig',       data: { label: 'TenantConfig' },       position: { x: 770, y: 80  } },
        { id: 'UserRepository',     data: { label: 'UserRepository' },     position: { x: 80,  y: 250 } },
        { id: 'BillingRepository',  data: { label: 'BillingRepository' },  position: { x: 310, y: 250 } },
        { id: 'AuditLogger',        data: { label: 'AuditLogger' },        position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'TenantService',   target: 'DataAccessLayer',   label: 'query(tenantId, ...)',  type: 'smoothstep' },
        { id: 'e2', source: 'TenantService',   target: 'UserRepository',    label: 'find(tenantId, userId)',type: 'smoothstep' },
        { id: 'e3', source: 'TenantService',   target: 'BillingRepository', label: 'getBilling(tenantId)', type: 'smoothstep' },
        { id: 'e4', source: 'TenantService',   target: 'AuditLogger',       label: 'log(tenantId, event)', type: 'smoothstep' },
        { id: 'e5', source: 'TenantContext',   target: 'TenantService',     label: 'not used',             type: 'smoothstep' },
        { id: 'e6', source: 'TenantConfig',    target: 'TenantService',     label: 'reads config inline',  type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'TenantService',
        description:
          'tenantId is a raw parameter threaded through every method signature. This "primitive obsession" means a programming error (forgetting to pass tenantId, passing the wrong ID) silently causes cross-tenant data access — a critical security vulnerability. A TenantContext bound to the request thread provides automatic, unforgeable tenant scoping.',
        interviewContext:
          'Senior candidates propose a TenantContext stored in a ThreadLocal (or request-scoped bean) populated at the authentication boundary. All repositories read tenantId from TenantContext automatically, never from method parameters. This pattern is used by Stripe, Salesforce, and all production SaaS platforms to enforce isolation.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'DataAccessLayer',
        description:
          'DataAccessLayer applies tenant filtering inline (e.g., WHERE tenant_id = ?) but this logic is not abstracted into a TenantAwareRepository. Any repository that forgets the WHERE clause causes cross-tenant data leakage. A base TenantAwareRepository that automatically appends the tenantId filter from TenantContext is a security-critical abstraction.',
        interviewContext:
          'Candidates should propose a TenantAwareRepository base class (or query interceptor) that injects the tenant filter from TenantContext before every query executes. Hibernate multi-tenancy filters and row-level security in Postgres are production implementations of this pattern. Missing this is a SOC2/GDPR violation.',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'TenantService',
        description:
          'TenantService orchestrates user management, billing, data access, and audit logging for multiple tenants. Tenant isolation is a cross-cutting infrastructure concern, not a single service\'s responsibility. TenantService should be a thin coordination layer; isolation enforcement should be automatic at the repository/infrastructure layer.',
        interviewContext:
          'Senior engineers distinguish between the TenantService (application-layer coordination of tenant-specific business logic) and the tenant isolation infrastructure (TenantContext + TenantAwareRepository). Isolation must be enforced at the infrastructure level to be reliable — not at the service level where it can be accidentally bypassed.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'TenantConfig',
        description:
          'Tenant configuration (feature flags, limits, custom settings) is read inline in TenantService. Without a TenantConfigProvider abstraction, configuration can not be sourced from different backends (DB, config service, cache) or refreshed dynamically. Tenant config changes require service restarts.',
        interviewContext:
          'Candidates should propose a TenantConfigProvider interface with getConfig(tenantId): TenantConfig, backed by a CachedTenantConfigProvider that refreshes on TTL expiry. This enables dynamic per-tenant feature flag changes without redeployment, a fundamental SaaS operational requirement.',
      },
    ],
    explanation:
      'Multi-tenant isolation requires a TenantContext (ThreadLocal or request-scoped bean) populated by an AuthFilter at the request boundary. All repositories extend TenantAwareRepository which automatically appends WHERE tenant_id = TenantContext.current() to every query — tenant isolation is not a parameter but an automatic invariant. TenantConfigProvider is an interface with a CachedTenantConfigProvider implementation, enabling dynamic config refresh. TenantService becomes a thin application service: it does not pass tenantId as a parameter but relies on TenantContext. AuditLogger reads TenantContext automatically for every log entry. This architecture is security-by-default — forgetting to pass tenantId is impossible because it does not exist as a parameter. Stripe, Salesforce, and all major SaaS platforms implement this pattern.',
  },

  // ─────────────────────────────────────────────────────────────
  // 21. order=95 — Workflow Engine — No Step Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'workflow-engine-no-step',
    title: 'Workflow Engine — No Step Abstraction',
    description:
      'WorkflowExecutor runs approval, validation, enrichment, notification, and audit steps inline with no WorkflowStep interface. There is no Chain of Responsibility pattern, and adding a new step requires modifying the executor.',
    difficulty: 'hard',
    order: 95,
    diagramData: {
      nodes: [
        { id: 'WorkflowExecutor',  data: { label: 'WorkflowExecutor' },  position: { x: 80,  y: 80  } },
        { id: 'ApprovalStep',      data: { label: 'ApprovalStep' },      position: { x: 310, y: 80  } },
        { id: 'ValidationStep',    data: { label: 'ValidationStep' },    position: { x: 540, y: 80  } },
        { id: 'EnrichmentStep',    data: { label: 'EnrichmentStep' },    position: { x: 770, y: 80  } },
        { id: 'NotificationStep',  data: { label: 'NotificationStep' },  position: { x: 80,  y: 250 } },
        { id: 'AuditStep',         data: { label: 'AuditStep' },         position: { x: 310, y: 250 } },
        { id: 'WorkflowStep',      data: { label: 'WorkflowStep' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'WorkflowExecutor', target: 'ValidationStep',   label: 'step 1 hardcoded',      type: 'smoothstep' },
        { id: 'e2', source: 'WorkflowExecutor', target: 'EnrichmentStep',   label: 'step 2 hardcoded',      type: 'smoothstep' },
        { id: 'e3', source: 'WorkflowExecutor', target: 'ApprovalStep',     label: 'step 3 hardcoded',      type: 'smoothstep' },
        { id: 'e4', source: 'WorkflowExecutor', target: 'NotificationStep', label: 'step 4 hardcoded',      type: 'smoothstep' },
        { id: 'e5', source: 'WorkflowExecutor', target: 'AuditStep',        label: 'step 5 hardcoded',      type: 'smoothstep' },
        { id: 'e6', source: 'WorkflowStep',     target: 'WorkflowExecutor', label: 'not implemented',       type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'WorkflowExecutor',
        description:
          'All five steps are hardcoded concrete dependencies. There is no WorkflowStep interface, so adding a new step (e.g., ComplianceCheckStep) requires modifying WorkflowExecutor. The Chain of Responsibility pattern would allow steps to be composed dynamically from configuration, enabling workflow definition without code changes.',
        interviewContext:
          'Senior candidates name the Chain of Responsibility pattern and propose WorkflowStep interface with execute(context): StepResult and next(): Optional<WorkflowStep>. WorkflowExecutor holds the head of the chain and iterates it. They reference Activiti, Camunda, and Apache Camel as production workflow engine implementations.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'WorkflowExecutor',
        description:
          'WorkflowExecutor knows the specific business steps (validation, enrichment, approval, notification, audit) and their execution order. The executor should only know how to run a generic chain of WorkflowStep objects — it should not contain knowledge of specific business steps. Business step composition belongs in a WorkflowDefinition or WorkflowFactory.',
        interviewContext:
          'The Executor/Definition split: WorkflowExecutor is a generic engine that runs List<WorkflowStep>; WorkflowDefinition is a configuration object specifying which steps compose a particular workflow; WorkflowFactory creates WorkflowDefinitions. This enables different workflows (onboarding, loan approval, order fulfillment) to share the same executor.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'ApprovalStep',
        description:
          'ApprovalStep is synchronous in WorkflowExecutor. Human-approval workflows may take days. Blocking a thread on human approval is not feasible in production. The workflow engine needs support for async step completion, where a step suspends the workflow and resumes when an external signal arrives (approval callback, timer expiry).',
        interviewContext:
          'Senior engineers propose async step types implementing AsyncWorkflowStep with suspend() and resume(correlationId) methods. The workflow state is persisted to a WorkflowStore between steps. This matches Temporal.io\'s workflow/activity model and BPMN user task concepts in Camunda.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'AuditStep',
        description:
          'Audit logging is a cross-cutting concern but is implemented as an explicit step in the workflow chain. This means audit can be bypassed if someone removes AuditStep from the chain, and the audit step must be remembered for every workflow definition. Audit should be an automatic aspect applied to all steps via a decorator or AOP, not a manual chain member.',
        interviewContext:
          'Candidates should propose an AuditingWorkflowStep decorator that wraps any WorkflowStep and logs entry/exit. A WorkflowExecutor can automatically wrap every step with this decorator at construction time. This is the Decorator pattern applied to cross-cutting concerns, mirroring how Spring AOP applies transaction and logging advice.',
      },
    ],
    explanation:
      'WorkflowExecutor should implement the Chain of Responsibility pattern with a WorkflowStep interface (execute(WorkflowContext): StepResult). WorkflowExecutor holds List<WorkflowStep> injected at construction time via a WorkflowDefinition. Step composition (which steps, in what order) is configuration, not code. Async steps implement AsyncWorkflowStep with suspend/resume semantics backed by a WorkflowStore for durable state — enabling days-long human approval workflows. AuditStep is replaced by an AuditingWorkflowStep decorator applied automatically to every step by the executor — audit becomes unforgeable. New steps are added by implementing WorkflowStep and registering in WorkflowDefinition. This mirrors Camunda BPMN, Temporal.io, and Apache Camel workflow architectures.',
  },

  // ─────────────────────────────────────────────────────────────
  // 22. order=96 — Auction Bidding — No Optimistic Lock Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'bidding-system-concurrent-no-lock',
    title: 'Auction Bidding — No Optimistic Lock Abstraction',
    description:
      'BidService accepts bids without version checking. There is no VersionedEntity abstraction. Concurrent bids on the same auction item can corrupt the highest-bid state due to lost-update race conditions.',
    difficulty: 'hard',
    order: 96,
    diagramData: {
      nodes: [
        { id: 'BidService',            data: { label: 'BidService' },            position: { x: 80,  y: 80  } },
        { id: 'AuctionItem',           data: { label: 'AuctionItem' },           position: { x: 310, y: 80  } },
        { id: 'VersionedEntity',       data: { label: 'VersionedEntity' },       position: { x: 540, y: 80  } },
        { id: 'BidRepository',         data: { label: 'BidRepository' },         position: { x: 770, y: 80  } },
        { id: 'OptimisticLockHandler', data: { label: 'OptimisticLockHandler' }, position: { x: 80,  y: 250 } },
        { id: 'BidValidator',          data: { label: 'BidValidator' },          position: { x: 310, y: 250 } },
        { id: 'AuctionEvent',          data: { label: 'AuctionEvent' },          position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'BidService',   target: 'AuctionItem',           label: 'read currentHighest',   type: 'smoothstep' },
        { id: 'e2', source: 'BidService',   target: 'BidValidator',          label: 'validate bid',          type: 'smoothstep' },
        { id: 'e3', source: 'BidService',   target: 'BidRepository',         label: 'save bid (no version)', type: 'smoothstep' },
        { id: 'e4', source: 'BidService',   target: 'AuctionEvent',          label: 'emit BidPlaced',        type: 'smoothstep' },
        { id: 'e5', source: 'VersionedEntity', target: 'AuctionItem',        label: 'not extended',          type: 'smoothstep' },
        { id: 'e6', source: 'OptimisticLockHandler', target: 'BidService',   label: 'not used',              type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'AuctionItem',
        description:
          'AuctionItem has no version field. BidService reads the current highest bid, validates the new bid against it, then saves — a classic check-then-act race condition. Two concurrent bidders reading the same highest bid and both passing validation will both persist, with the last write winning and one bid silently lost. This is the lost-update problem.',
        interviewContext:
          'Senior candidates propose that AuctionItem extends VersionedEntity (with a version: number field) and BidService issues an optimistic lock update: UPDATE auction_items SET highest_bid=?, version=version+1 WHERE id=? AND version=?. On version mismatch, throw OptimisticLockException and retry. They reference JPA @Version and PostgreSQL optimistic locking.',
      },
      {
        id: 'issue-2',
        type: 'other',
        targetClass: 'BidService',
        description:
          'There is no bid placement idempotency. A bid request retried by the client (network timeout) may result in the same bid being placed twice. Without an idempotency key checked before persistence, duplicate bids inflate the bid count and may cause invalid auction state. Bid placement must be idempotent by bid request ID.',
        interviewContext:
          'Senior engineers require a bidRequestId on every bid, checked for existence before processing. On duplicate: return the original BidResult without processing. They note this is the Idempotent Receiver pattern — critical for any financial transaction in a distributed system.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'BidService',
        description:
          'BidService performs optimistic lock retry logic inline. Retry-on-conflict is a reusable cross-cutting concern that should be abstracted into OptimisticLockHandler. Without this abstraction, every command that updates a versioned entity must re-implement the retry loop, creating duplicate logic and inconsistent retry budgets.',
        interviewContext:
          'Candidates should propose an OptimisticLockHandler with retry(command, maxAttempts, backoff): Result that wraps any versioned update with consistent retry semantics. AOP or a decorator can apply this automatically to all versioned repository operations. They should discuss exponential backoff with jitter to prevent retry storms.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'VersionedEntity',
        description:
          'VersionedEntity exists as a structural node but AuctionItem does not extend it. The optimistic locking infrastructure is architected but not connected to the entities that need it. AuctionItem is missing the version field and the corresponding DB column, meaning concurrent bids will corrupt state regardless of the retry handler.',
        interviewContext:
          'This is a classic "incomplete abstraction" problem. Senior candidates verify that all mutable aggregates subject to concurrent writes extend VersionedEntity. They also note that pessimistic locking (SELECT FOR UPDATE) is an alternative for high-contention auctions, trading throughput for simplicity, and discuss when each is preferred.',
      },
    ],
    explanation:
      'AuctionItem must extend VersionedEntity with a monotonically incrementing version field. BidService issues an optimistic lock UPDATE: SET highestBid=new, version=version+1 WHERE id=? AND version=current. On OptimisticLockException, OptimisticLockHandler retries with exponential backoff up to a configurable max. BidValidator checks bid amount against the freshly-read highest bid within the retry loop. Bid placement uses a bidRequestId for idempotency: BidRepository checks for prior processing before applying. AuctionEvent (BidPlacedEvent) is emitted after confirmed persistence. For extremely high-contention auctions (flash sales), a Redis-based serialized bid queue per auction item provides stronger guarantees than DB optimistic locking. This design eliminates the lost-update race condition while maintaining horizontal scalability.',
  },

  // ─────────────────────────────────────────────────────────────
  // 23. order=97 — Logging Framework — No Appender Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'logging-framework-no-appender',
    title: 'Logging Framework — No Appender Abstraction',
    description:
      'Logger writes to file, sends to Kafka, and pushes to Splunk all inline in the same class. There is no Appender interface. Log level checking is also embedded inline with no separation.',
    difficulty: 'hard',
    order: 97,
    diagramData: {
      nodes: [
        { id: 'Logger',            data: { label: 'Logger' },            position: { x: 80,  y: 80  } },
        { id: 'FileAppender',      data: { label: 'FileAppender' },      position: { x: 310, y: 80  } },
        { id: 'KafkaAppender',     data: { label: 'KafkaAppender' },     position: { x: 540, y: 80  } },
        { id: 'SplunkAppender',    data: { label: 'SplunkAppender' },    position: { x: 770, y: 80  } },
        { id: 'AppenderInterface', data: { label: 'AppenderInterface' }, position: { x: 80,  y: 250 } },
        { id: 'LogLevel',          data: { label: 'LogLevel' },          position: { x: 310, y: 250 } },
        { id: 'LogFormatter',      data: { label: 'LogFormatter' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Logger',            target: 'FileAppender',      label: 'writes file inline',    type: 'smoothstep' },
        { id: 'e2', source: 'Logger',            target: 'KafkaAppender',     label: 'sends Kafka inline',    type: 'smoothstep' },
        { id: 'e3', source: 'Logger',            target: 'SplunkAppender',    label: 'pushes Splunk inline',  type: 'smoothstep' },
        { id: 'e4', source: 'Logger',            target: 'LogLevel',          label: 'checks level inline',   type: 'smoothstep' },
        { id: 'e5', source: 'AppenderInterface', target: 'Logger',            label: 'not implemented',       type: 'smoothstep' },
        { id: 'e6', source: 'LogFormatter',      target: 'Logger',            label: 'not used',              type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'Logger',
        description:
          'Logger has no Appender interface. All three output destinations are hardcoded inside Logger with concrete implementations. Adding a new destination (DatadogAppender, CloudWatchAppender) requires modifying Logger. The Appender interface with append(LogEvent): void is the fundamental extensibility mechanism of every production logging framework.',
        interviewContext:
          'Senior candidates name this directly as the Appender pattern from Log4j/Logback and propose Logger holds List<Appender>. They describe how Logback\'s ch.qos.logback.core.Appender works and how AsyncAppender wraps synchronous appenders for non-blocking logging. Adding appenders is configuration, not code.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'Logger',
        description:
          'Logger is responsible for log level filtering, log event creation, message formatting, and multi-destination delivery — four distinct concerns. LogFormatter should be a separate abstraction (PatternFormatter, JSONFormatter, StructuredFormatter) injected into Logger. Level filtering should be a Filter abstraction applied before delivery.',
        interviewContext:
          'Logback\'s filter chain (ch.qos.logback.core.filter.Filter) demonstrates this: filters are separate objects with decide(LogEvent) returning FilterReply. Formatters (Encoders in Logback) are also separate. Logger becomes: receive event → apply filters → format → dispatch to appenders.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'KafkaAppender',
        description:
          'Kafka and Splunk are synchronous calls inline in Logger.log(). A slow Kafka broker or Splunk endpoint causes every log statement in the application to block. This is a critical performance anti-pattern — logging must never block the calling thread. Appenders should be asynchronous by default, using a non-blocking queue.',
        interviewContext:
          'Candidates must propose an AsyncAppender that wraps any Appender, puts events on a bounded BlockingQueue, and drains it on a background thread. On queue full: drop with a warning (lossy) or block (non-lossy). Log4j2\'s AsyncLogger and Logback\'s AsyncAppender implement exactly this. Synchronous I/O in the hot path is a latency anti-pattern.',
      },
      {
        id: 'issue-4',
        type: 'cohesion_issue',
        targetClass: 'Logger',
        description:
          'Log level check (if (level >= configuredLevel)) is embedded inside Logger. This prevents per-appender level filtering (send DEBUG to file, only ERROR to Splunk) and per-logger-name level overrides (set com.payments to DEBUG without affecting all loggers). Level filtering is a hierarchical concern that should be an independent Filter abstraction.',
        interviewContext:
          'Senior engineers describe logger hierarchy: named loggers inherit level from parent unless overridden (log4j Logger hierarchy). Per-appender level filters (ThresholdFilter in Logback) enable different verbosity per destination. This allows DEBUG locally, ERROR in production Splunk — a fundamental operational requirement.',
      },
    ],
    explanation:
      'Logger should be refactored around an Appender interface (append(LogEvent): void) with FileAppender, KafkaAppender, and SplunkAppender as implementations. Logger holds List<Appender> configured at startup. LogFormatter (PatternFormatter, JSONFormatter) is injected and applied before dispatch. Level filtering uses a Filter interface (ThresholdFilter, MarkerFilter) applied per-appender, enabling different verbosity per destination. All I/O-bound appenders are wrapped in an AsyncAppender that drains a non-blocking queue on a background thread, ensuring Logger.log() never blocks the calling thread. Logger hierarchy provides per-name level overrides. This precisely mirrors Log4j2 and Logback architectures — every production Java logging framework has converged on this design.',
  },

  // ─────────────────────────────────────────────────────────────
  // 24. order=98 — IoT Device Manager God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'iot-device-manager-god',
    title: 'IoT Device Manager God Class',
    description:
      'DeviceManager handles provisioning, telemetry ingestion, firmware update, alert rule evaluation, device shadow management, and billing — six responsibilities in one class.',
    difficulty: 'hard',
    order: 98,
    diagramData: {
      nodes: [
        { id: 'DeviceManager',      data: { label: 'DeviceManager' },      position: { x: 80,  y: 80  } },
        { id: 'ProvisioningService',data: { label: 'ProvisioningService' }, position: { x: 310, y: 80  } },
        { id: 'TelemetryIngester',  data: { label: 'TelemetryIngester' },  position: { x: 540, y: 80  } },
        { id: 'FirmwareUpdater',    data: { label: 'FirmwareUpdater' },    position: { x: 770, y: 80  } },
        { id: 'AlertRuleEngine',    data: { label: 'AlertRuleEngine' },    position: { x: 80,  y: 250 } },
        { id: 'DeviceShadow',       data: { label: 'DeviceShadow' },       position: { x: 310, y: 250 } },
        { id: 'BillingModule',      data: { label: 'BillingModule' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'DeviceManager', target: 'ProvisioningService', label: 'provisions inline',     type: 'smoothstep' },
        { id: 'e2', source: 'DeviceManager', target: 'TelemetryIngester',   label: 'ingests inline',        type: 'smoothstep' },
        { id: 'e3', source: 'DeviceManager', target: 'FirmwareUpdater',     label: 'updates firmware',      type: 'smoothstep' },
        { id: 'e4', source: 'DeviceManager', target: 'AlertRuleEngine',     label: 'evaluates rules',       type: 'smoothstep' },
        { id: 'e5', source: 'DeviceManager', target: 'DeviceShadow',        label: 'syncs shadow',          type: 'smoothstep' },
        { id: 'e6', source: 'DeviceManager', target: 'BillingModule',       label: 'meters usage',          type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'DeviceManager',
        description:
          'DeviceManager owns six completely different operational domains: device lifecycle (provisioning), data ingestion (telemetry), OTA updates (firmware), rule processing (alerts), state synchronisation (shadow), and revenue (billing). Each domain has independent scalability needs, deployment cadence, and team ownership — collocating them creates a deployment monolith.',
        interviewContext:
          'Senior candidates decompose along bounded contexts mirroring AWS IoT Core\'s service boundaries: IoT Core (connection/provisioning), IoT Rules Engine (alert rules), Device Shadow Service, Greengrass (OTA), and usage-based billing as a separate microservice. They argue for event-driven integration via an IoT event bus.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'TelemetryIngester',
        description:
          'Telemetry ingestion is a very high-throughput concern (millions of messages/second from IoT devices) while billing, provisioning, and shadow sync are lower-throughput operations. Mixing them in one class means the entire DeviceManager must be scaled to handle telemetry throughput, even for components that process far less traffic.',
        interviewContext:
          'Senior engineers propose that TelemetryIngester be a dedicated high-throughput path: device → MQTT broker → Kafka topic → TelemetryIngester consumer group. Alert rule evaluation subscribes to the same Kafka topic. This enables independent horizontal scaling of the ingestion path vs. the control plane.',
      },
      {
        id: 'issue-3',
        type: 'missing_abstraction',
        targetClass: 'AlertRuleEngine',
        description:
          'Alert rules are evaluated inline in DeviceManager with no AlertRule abstraction. IoT alert rules change frequently (new sensor thresholds, new device types) and should be configurable by customers without code deployments. Without a Rule interface, every new rule type requires a DeviceManager change.',
        interviewContext:
          'Candidates should propose an AlertRule interface with evaluate(TelemetryEvent): Optional<Alert>, managed by a RuleRegistry. Rules are persisted as data (JSON/YAML) and loaded at runtime — enabling no-code rule management. This mirrors AWS IoT Rules Engine and Azure IoT Hub message routing architectures.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'DeviceShadow',
        description:
          'Device shadow synchronisation is tightly coupled to DeviceManager\'s main execution path. A shadow sync failure (network partition to the shadow store) blocks the entire device management operation. Shadow sync should be an eventually-consistent asynchronous operation, not a synchronous step in the main device management flow.',
        interviewContext:
          'Senior engineers note that AWS IoT Device Shadow uses eventual consistency: the device reports desired/reported state asynchronously via MQTT topics. DeviceManager should publish shadow update events to a bus; a dedicated ShadowSyncService subscribes and handles synchronisation with the shadow store independently.',
      },
    ],
    explanation:
      'DeviceManager should be decomposed into independent services mirroring AWS IoT Core\'s architecture. ProvisioningService handles device registration and certificate management. TelemetryIngester is a high-throughput stream processor consuming from an MQTT-to-Kafka bridge. AlertRuleEngine subscribes to the telemetry stream and evaluates AlertRule instances loaded from a RuleRegistry. DeviceShadow is an eventually-consistent state store updated via async events. FirmwareUpdater is an OTA campaign service operating on its own schedule. BillingModule subscribes to usage events for metered billing. All services communicate via events, enabling independent scaling, deployment, and failure isolation. This matches the bounded context decomposition of AWS IoT Core, Azure IoT Hub, and Google Cloud IoT.',
  },

  // ─────────────────────────────────────────────────────────────
  // 25. order=99 — Subscription Billing — No Pricing Strategy
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'subscription-billing-no-strategy',
    title: 'Subscription Billing — No Pricing Strategy',
    description:
      'BillingEngine has monthly, annual, usage-based, and tiered pricing as nested if/else blocks. There is no PricingStrategy interface. Renewal, dunning, and tax logic are also inlined in the same class.',
    difficulty: 'hard',
    order: 99,
    diagramData: {
      nodes: [
        { id: 'BillingEngine',   data: { label: 'BillingEngine' },   position: { x: 80,  y: 80  } },
        { id: 'MonthlyPricing',  data: { label: 'MonthlyPricing' },  position: { x: 310, y: 80  } },
        { id: 'AnnualPricing',   data: { label: 'AnnualPricing' },   position: { x: 540, y: 80  } },
        { id: 'UsagePricing',    data: { label: 'UsagePricing' },    position: { x: 770, y: 80  } },
        { id: 'TieredPricing',   data: { label: 'TieredPricing' },   position: { x: 80,  y: 250 } },
        { id: 'RenewalService',  data: { label: 'RenewalService' },  position: { x: 310, y: 250 } },
        { id: 'DunningService',  data: { label: 'DunningService' },  position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'BillingEngine', target: 'MonthlyPricing', label: 'if MONTHLY: ...',        type: 'smoothstep' },
        { id: 'e2', source: 'BillingEngine', target: 'AnnualPricing',  label: 'if ANNUAL: ...',         type: 'smoothstep' },
        { id: 'e3', source: 'BillingEngine', target: 'UsagePricing',   label: 'if USAGE_BASED: ...',    type: 'smoothstep' },
        { id: 'e4', source: 'BillingEngine', target: 'TieredPricing',  label: 'if TIERED: ...',         type: 'smoothstep' },
        { id: 'e5', source: 'BillingEngine', target: 'RenewalService', label: 'renewals inline',        type: 'smoothstep' },
        { id: 'e6', source: 'BillingEngine', target: 'DunningService', label: 'dunning inline',         type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'BillingEngine',
        description:
          'Four pricing models are implemented as if/else branches inside BillingEngine. There is no PricingStrategy interface. Adding a new pricing model (seat-based, volume, hybrid) requires modifying BillingEngine and all its if/else branches. Pricing logic is the most frequently changing area in SaaS billing.',
        interviewContext:
          'Senior candidates propose a PricingStrategy interface with calculateAmount(subscription, usageData): Money. Each pricing model is a separate class. BillingEngine selects the strategy based on subscription.pricingModel and delegates — never knowing the strategy implementation. This mirrors Stripe Billing and Chargebee\'s pricing model architecture.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'BillingEngine',
        description:
          'BillingEngine mixes price calculation, renewal scheduling, dunning (failed payment retry workflow), and tax computation. These are entirely separate business processes with different teams, schedules, and failure modes. Renewal is a scheduled job; dunning is a multi-step recovery workflow; tax is a compliance concern potentially outsourced to Avalara/TaxJar.',
        interviewContext:
          'Senior engineers propose: BillingEngine (price calculation only), RenewalService (subscription renewal scheduler), DunningService (failed payment recovery workflow), TaxService (tax calculation, possibly via external provider). Each is independently deployable and testable.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'DunningService',
        description:
          'Dunning is hardcoded inline in BillingEngine. Dunning is a stateful multi-step workflow (retry D+1, D+3, D+7, then cancel) that requires persistent state, configurable retry schedules, and customer communication. Embedding it inline makes the retry schedule a code constant rather than a configurable policy.',
        interviewContext:
          'Candidates should propose DunningService as a separate workflow with a DunningPolicy interface specifying retry intervals and max attempts. The dunning state machine (pending → retrying → resolved / cancelled) should use the State pattern. Stripe\'s Smart Retries and Recurly\'s dunning management are production implementations.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'UsagePricing',
        description:
          'Usage-based pricing requires metered usage data ingested from usage events. BillingEngine directly queries usage data inline, coupling billing to the usage data model and its storage. A UsageAggregator abstraction should precompute billable usage that BillingEngine queries via an interface, decoupling billing from usage data formats.',
        interviewContext:
          'Senior engineers propose a UsageMeterService that aggregates raw events into billable usage snapshots. BillingEngine calls UsageMeterService.getBillableUsage(subscriptionId, period) — never touching raw event data. This matches how AWS tracks service usage for billing and how Stripe Meters work.',
      },
    ],
    explanation:
      'BillingEngine should implement the Strategy pattern with a PricingStrategy interface (calculateAmount(subscription, usage): Money). MonthlyPricingStrategy, AnnualPricingStrategy, UsageBasedStrategy, and TieredPricingStrategy are independent classes selected by a PricingStrategyFactory. BillingEngine contains only price calculation delegation — no renewal, dunning, or tax logic. RenewalService is an independent scheduled service with configurable renewal windows. DunningService is a separate stateful workflow with a DunningPolicy interface defining retry schedule. TaxService is an interface backed by TaxJar or Avalara for compliance. UsageMeterService pre-aggregates raw usage for UsageBasedStrategy. Each component changes independently, enabling the rapid pricing model iteration that SaaS businesses require.',
  },

  // ─────────────────────────────────────────────────────────────
  // 26. order=100 — Distributed Locking — No Lock Provider Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'distributed-lock-no-abstraction',
    title: 'Distributed Locking — No Lock Provider Abstraction',
    description:
      'LockManager directly calls Redis with SETNX for distributed locking. There is no LockProvider interface, retry backoff is hardcoded, and there is no guarantee that locks are released on process crash.',
    difficulty: 'hard',
    order: 100,
    diagramData: {
      nodes: [
        { id: 'LockManager',     data: { label: 'LockManager' },     position: { x: 80,  y: 80  } },
        { id: 'RedisClient',     data: { label: 'RedisClient' },     position: { x: 310, y: 80  } },
        { id: 'LockProvider',    data: { label: 'LockProvider' },    position: { x: 540, y: 80  } },
        { id: 'ZookeeperClient', data: { label: 'ZookeeperClient' }, position: { x: 770, y: 80  } },
        { id: 'RetryPolicy',     data: { label: 'RetryPolicy' },     position: { x: 80,  y: 250 } },
        { id: 'LockReleaser',    data: { label: 'LockReleaser' },    position: { x: 310, y: 250 } },
        { id: 'LockConfig',      data: { label: 'LockConfig' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'LockManager',  target: 'RedisClient',     label: 'SETNX inline',           type: 'smoothstep' },
        { id: 'e2', source: 'LockManager',  target: 'RetryPolicy',     label: 'retry hardcoded',        type: 'smoothstep' },
        { id: 'e3', source: 'LockManager',  target: 'LockConfig',      label: 'reads config',           type: 'smoothstep' },
        { id: 'e4', source: 'LockProvider', target: 'LockManager',     label: 'not used',               type: 'smoothstep' },
        { id: 'e5', source: 'LockReleaser', target: 'LockManager',     label: 'no release guarantee',   type: 'smoothstep' },
        { id: 'e6', source: 'ZookeeperClient', target: 'LockProvider', label: 'alternative unused',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'LockManager',
        description:
          'LockManager is hard-coupled to Redis via SETNX with no LockProvider interface. Different deployment environments may use Zookeeper (strongly consistent), Redis (performant), or a DB row lock (simple). Without abstraction, migrating from Redis to Zookeeper for stronger consistency requires rewriting LockManager. Redlock (distributed Redis lock) is a commonly expected alternative.',
        interviewContext:
          'Senior candidates define a LockProvider interface with tryAcquire(key, ttl): Optional<Lock> and release(lock): void. Implementations include RedisLockProvider (SETNX with Lua release script), ZookeeperEphemeralLockProvider, and DBAdvisoryLockProvider. Redlock requires multiple Redis instances and should be named separately.',
      },
      {
        id: 'issue-2',
        type: 'other',
        targetClass: 'LockReleaser',
        description:
          'There is no guarantee that locks are released on process crash. SETNX without a TTL (or with a separately-set EXPIRE) creates a TOCTOU race: if the process dies between SETNX and EXPIRE, the lock is held forever. The atomic SET key value NX PX ttl command must be used, and lock release must validate token ownership via a Lua script to prevent releasing another process\'s lock.',
        interviewContext:
          'This is a well-known Redis distributed lock pitfall. Senior candidates know: (1) use SET key token NX PX ttl atomically; (2) release via Lua: if GET key == token then DEL key. This prevents releasing a lock whose TTL has expired and been re-acquired by another process. They reference the Redlock paper and Redisson library.',
      },
      {
        id: 'issue-3',
        type: 'missing_abstraction',
        targetClass: 'RetryPolicy',
        description:
          'Retry backoff for lock acquisition is hardcoded in LockManager (e.g., Thread.sleep(100)). Without a RetryPolicy interface, it is impossible to configure exponential backoff with jitter (essential to prevent retry storms), a max-wait deadline, or a non-blocking async retry model. Different callers need different retry budgets.',
        interviewContext:
          'Candidates should propose a RetryPolicy interface with nextDelay(attempt): Duration. ExponentialBackoffWithJitter and FixedDelayPolicy are implementations. LockManager (or a LockAcquisitionTemplate) applies the policy in the acquisition retry loop. They should also discuss try-lock with timeout vs. infinite retry semantics.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'LockManager',
        description:
          'LockManager is used by callers who must remember to call release() in a finally block. This is a leaky abstraction — lock release becomes a caller responsibility and will be forgotten in error paths. A withLock(key, action) template method pattern guarantees release within the framework, never the caller.',
        interviewContext:
          'Senior engineers propose a LockTemplate with withLock(key, ttl, Supplier<T>): T that acquires, runs the action, and always releases in a try-finally — even on exception. This is the same pattern as Java\'s Lock.lock()/unlock() vs. synchronized blocks. Callers should never see acquire/release as separate operations.',
      },
    ],
    explanation:
      'LockManager should be refactored around a LockProvider interface (tryAcquire(key, ttl, token): boolean, release(key, token): void). RedisLockProvider uses the atomic SET key token NX PX ttl command and a Lua release script for token-validated release. ZookeeperEphemeralLockProvider uses ephemeral znodes for stronger consistency. RetryPolicy interface (ExponentialBackoffWithJitter implementation) decouples retry behaviour from acquisition logic. A LockTemplate provides withLock(key, ttl, action) that guarantees release in try-finally. LockConfig provides per-key TTL and retry settings. LockReleaser is absorbed into LockProvider implementations. This design eliminates the forever-lock bug, prevents lock theft, and enables provider swap. It mirrors Redisson\'s RLock and Curator\'s InterProcessMutex designs.',
  },

  // ─────────────────────────────────────────────────────────────
  // 27. order=101 — Event-Driven — No Event Schema Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'event-driven-no-schema-registry',
    title: 'Event-Driven — No Event Schema Abstraction',
    description:
      'EventBus serializes every event type inline with custom JSON logic. There is no Event interface or schema registry. Consumers deserialise with explicit type checks, making the event contract implicit and fragile.',
    difficulty: 'hard',
    order: 101,
    diagramData: {
      nodes: [
        { id: 'EventBus',       data: { label: 'EventBus' },       position: { x: 80,  y: 80  } },
        { id: 'OrderEvent',     data: { label: 'OrderEvent' },     position: { x: 310, y: 80  } },
        { id: 'PaymentEvent',   data: { label: 'PaymentEvent' },   position: { x: 540, y: 80  } },
        { id: 'SchemaRegistry', data: { label: 'SchemaRegistry' }, position: { x: 770, y: 80  } },
        { id: 'EventSerializer',data: { label: 'EventSerializer' },position: { x: 80,  y: 250 } },
        { id: 'EventConsumer',  data: { label: 'EventConsumer' },  position: { x: 310, y: 250 } },
        { id: 'EventProducer',  data: { label: 'EventProducer' },  position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'EventProducer',  target: 'EventBus',       label: 'publish(rawJson)',       type: 'smoothstep' },
        { id: 'e2', source: 'EventBus',       target: 'OrderEvent',     label: 'if type==ORDER: ...',    type: 'smoothstep' },
        { id: 'e3', source: 'EventBus',       target: 'PaymentEvent',   label: 'if type==PAYMENT: ...',  type: 'smoothstep' },
        { id: 'e4', source: 'EventBus',       target: 'EventConsumer',  label: 'dispatch raw JSON',      type: 'smoothstep' },
        { id: 'e5', source: 'SchemaRegistry', target: 'EventBus',       label: 'not used',               type: 'smoothstep' },
        { id: 'e6', source: 'EventSerializer',target: 'EventBus',       label: 'not used',               type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'EventBus',
        description:
          'EventBus handles serialisation/deserialisation inline with type-switch logic on raw JSON. There is no Event interface with a getEventType(): string contract, no schema-based serialisation, and no schema registry. This makes the event contract entirely implicit — producers and consumers are coupled by convention, breaking silently on schema changes.',
        interviewContext:
          'Senior candidates propose a DomainEvent interface (eventId, eventType, occurredAt, payload) and an EventSerializer interface (serialize/deserialize). SchemaRegistry stores Avro or JSON Schema per event type/version, enabling backward-compatibility validation at publish time. They reference Confluent Schema Registry with Avro and the event schema-as-contract principle.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'EventConsumer',
        description:
          'EventConsumer receives raw JSON and performs type checks internally to route to the correct handler. This couples the consumer to the producer\'s JSON structure. A schema evolution (renaming a field) silently breaks all consumers without any compile-time or startup-time detection.',
        interviewContext:
          'Senior engineers propose that consumers declare the event types they consume (with version) and EventBus validates schema compatibility at subscription time using SchemaRegistry. Avro schema evolution rules (backward/forward/full compatibility) prevent breaking consumers. They reference the Consumer-Driven Contract Testing pattern (Pact).',
      },
      {
        id: 'issue-3',
        type: 'srp_violation',
        targetClass: 'EventBus',
        description:
          'EventBus mixes event routing, serialisation, type resolution, and delivery into one class. Serialisation (how) is a separate concern from routing (to whom) and delivery (guarantees, retry). These three concerns should be separated: EventSerializer handles format, EventRouter handles subscription matching, EventDelivery handles reliability guarantees.',
        interviewContext:
          'Candidates should decompose EventBus into: EventSerializer (Avro/JSON/Protobuf), EventRouter (subscription matching), and EventDelivery (at-least-once vs. exactly-once). This matches how Kafka, Pulsar, and EventBridge are layered internally — serialisation is separate from routing topology.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'SchemaRegistry',
        description:
          'SchemaRegistry is present but not used by EventBus. Without it, there is no governance over event schema evolution. Any producer can publish a schema-breaking change and crash all consumers. The SchemaRegistry must be consulted at publish time to enforce backward compatibility before accepting a new event schema version.',
        interviewContext:
          'Senior candidates describe schema validation as a publishing gate: producer registers new schema → SchemaRegistry validates against compatibility rules → only compatible schemas are accepted → consumers always deserialise safely. They reference Confluent Schema Registry\'s compatibility levels: BACKWARD, FORWARD, FULL, NONE.',
      },
    ],
    explanation:
      'EventBus should depend on a DomainEvent interface (eventId, eventType, schemaVersion, payload) and an EventSerializer interface (Avro or JSON Schema backed). SchemaRegistry validates schema compatibility at publish time — incompatible schemas are rejected before any consumer receives a breaking change. EventConsumer declares which (eventType, minVersion) it handles; EventBus delivers only compatible events. EventBus decomposes into EventSerializer (format), EventRouter (subscription), and EventDelivery (reliability). OrderEvent and PaymentEvent implement DomainEvent with versioned schemas registered in SchemaRegistry. Schema evolution follows Avro backward-compatibility rules. This mirrors the Confluent Schema Registry + Kafka architecture used in event-driven systems at LinkedIn, Uber, and Airbnb, enabling safe schema evolution in production.',
  },

  // ─────────────────────────────────────────────────────────────
  // 28. order=102 — Feature Flag Service — God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'feature-flag-service-god',
    title: 'Feature Flag Service — God Class',
    description:
      'FeatureFlagService evaluates rules, stores flag configurations, manages A/B tests, captures analytics, controls rollout percentages, and handles kill switches — six distinct concerns in one class.',
    difficulty: 'hard',
    order: 102,
    diagramData: {
      nodes: [
        { id: 'FeatureFlagService',  data: { label: 'FeatureFlagService' },  position: { x: 80,  y: 80  } },
        { id: 'RuleEvaluator',       data: { label: 'RuleEvaluator' },       position: { x: 310, y: 80  } },
        { id: 'FlagConfigStore',     data: { label: 'FlagConfigStore' },     position: { x: 540, y: 80  } },
        { id: 'ABTestManager',       data: { label: 'ABTestManager' },       position: { x: 770, y: 80  } },
        { id: 'AnalyticsCollector',  data: { label: 'AnalyticsCollector' },  position: { x: 80,  y: 250 } },
        { id: 'RolloutManager',      data: { label: 'RolloutManager' },      position: { x: 310, y: 250 } },
        { id: 'KillSwitch',          data: { label: 'KillSwitch' },          position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'FeatureFlagService', target: 'RuleEvaluator',      label: 'evaluates inline',       type: 'smoothstep' },
        { id: 'e2', source: 'FeatureFlagService', target: 'FlagConfigStore',    label: 'reads config inline',    type: 'smoothstep' },
        { id: 'e3', source: 'FeatureFlagService', target: 'ABTestManager',      label: 'routes A/B inline',      type: 'smoothstep' },
        { id: 'e4', source: 'FeatureFlagService', target: 'AnalyticsCollector', label: 'tracks inline',          type: 'smoothstep' },
        { id: 'e5', source: 'FeatureFlagService', target: 'RolloutManager',     label: 'checks rollout %',       type: 'smoothstep' },
        { id: 'e6', source: 'FeatureFlagService', target: 'KillSwitch',         label: 'checks kill switch',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'FeatureFlagService',
        description:
          'FeatureFlagService conflates six distinct responsibilities: targeting rule evaluation (domain), config persistence (infrastructure), experiment management (data science), analytics (telemetry), rollout control (operations), and kill switch (incident response). Each concern has a different team owner and change velocity. This is a God Class that will see constant cross-team conflicts.',
        interviewContext:
          'Senior candidates decompose along the LaunchDarkly/Unleash architecture: FlagEvaluationEngine (rule evaluation), FlagConfigRepository (storage), ExperimentService (A/B assignment), AnalyticsService (impression tracking), RolloutStrategy (percentage logic), and an emergency KillSwitchService. The evaluation engine is the hot path; everything else is ancillary.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'RuleEvaluator',
        description:
          'Rule evaluation is inline in FeatureFlagService with no FlagRule interface. Feature flag targeting rules (user segment, geo, plan tier, percentage) need to be composable and configurable at runtime by non-engineers. Without a FlagRule abstraction, every new targeting dimension requires code deployment.',
        interviewContext:
          'Candidates should propose a FlagRule interface with evaluate(EvaluationContext): boolean, with SegmentRule, PercentageRule, GeoRule implementations composable via AND/OR operators. FlagConfig stores a rule tree. This is how LaunchDarkly\'s targeting rules work — composable boolean expressions evaluated against a user context.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'ABTestManager',
        description:
          'A/B test experiment management is conflated with feature flag evaluation. Experiment assignment (which variant for this user?) is an experiment platform concern with statistical significance requirements, whereas feature flags are an operational concern. Coupling them means you cannot use feature flags without the experiment infrastructure overhead.',
        interviewContext:
          'Senior engineers separate feature flags (binary on/off, operational control) from experiments (multi-variant, statistical significance, exposure logging). An experiment flag references an ExperimentService for variant assignment; a plain flag uses simple rollout logic. LaunchDarkly, Optimizely, and Statsig enforce this separation.',
      },
      {
        id: 'issue-4',
        type: 'srp_violation',
        targetClass: 'AnalyticsCollector',
        description:
          'Analytics tracking (impression events, flag evaluation telemetry) is mixed into the flag evaluation hot path. Analytics is a fire-and-forget concern that must never add latency to flag evaluation. Inline analytics capture blocks flag evaluation on analytics backend slowdowns and couples the evaluation SLA to the analytics pipeline SLA.',
        interviewContext:
          'Candidates must propose fire-and-forget analytics: flag evaluation completes synchronously; impression events are enqueued to an async analytics buffer (ring buffer or Kafka producer with acks=0). AnalyticsCollector drains the buffer in the background. This is how LaunchDarkly\'s SDK batches events — evaluation is O(1), analytics is decoupled.',
      },
    ],
    explanation:
      'FeatureFlagService should decompose into: FlagEvaluationEngine (hot path — evaluates FlagRule tree against EvaluationContext synchronously in microseconds), FlagConfigRepository (loads flag definitions from a config store with local caching for low-latency reads), RolloutStrategy (percentage bucketing using consistent hashing on userId), ExperimentService (multi-variant assignment with exposure logging — separate from plain flags), KillSwitchService (emergency flag override with real-time propagation), and an async AnalyticsBuffer (impression events fire-and-forget). FlagEvaluationEngine is the only component in the request hot path. This matches the LaunchDarkly SDK architecture: local evaluation with server-pushed config updates, async event batching, and sub-millisecond flag evaluation latency.',
  },

  // ─────────────────────────────────────────────────────────────
  // 29. order=103 — CQRS — Query Side Without Projection Layer
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'cqrs-query-side-no-projection',
    title: 'CQRS — Query Side Without Projection Layer',
    description:
      'QueryService reads directly from the write-model database. There is no projection layer or read model. Query and command paths share the same aggregate, and CQRS is not properly separated.',
    difficulty: 'hard',
    order: 103,
    diagramData: {
      nodes: [
        { id: 'QueryService',      data: { label: 'QueryService' },      position: { x: 80,  y: 80  } },
        { id: 'WriteModel',        data: { label: 'WriteModel' },        position: { x: 310, y: 80  } },
        { id: 'ReadModel',         data: { label: 'ReadModel' },         position: { x: 540, y: 80  } },
        { id: 'ProjectionService', data: { label: 'ProjectionService' }, position: { x: 770, y: 80  } },
        { id: 'CommandHandler',    data: { label: 'CommandHandler' },    position: { x: 80,  y: 250 } },
        { id: 'EventStore',        data: { label: 'EventStore' },        position: { x: 310, y: 250 } },
        { id: 'QueryModel',        data: { label: 'QueryModel' },        position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'CommandHandler',    target: 'WriteModel',        label: 'writes aggregate',      type: 'smoothstep' },
        { id: 'e2', source: 'CommandHandler',    target: 'EventStore',        label: 'appends events',        type: 'smoothstep' },
        { id: 'e3', source: 'QueryService',      target: 'WriteModel',        label: 'reads write model!',    type: 'smoothstep' },
        { id: 'e4', source: 'ProjectionService', target: 'ReadModel',         label: 'not projecting',        type: 'smoothstep' },
        { id: 'e5', source: 'QueryService',      target: 'QueryModel',        label: 'bypasses read model',   type: 'smoothstep' },
        { id: 'e6', source: 'EventStore',        target: 'ProjectionService', label: 'not subscribed',        type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'QueryService',
        description:
          'QueryService reads from WriteModel — the exact violation CQRS is designed to prevent. The write model is normalised for consistency and aggregate invariants, not for query performance. Reading from it under query load introduces lock contention on the write side, making the write path slower. CQRS requires QueryService to read from a dedicated ReadModel.',
        interviewContext:
          'Senior candidates articulate that CQRS separates the write model (normalised, consistent, optimised for invariant enforcement) from the read model (denormalised, optimised for query performance, eventually consistent). Queries touching the write model negate both scalability and performance benefits of CQRS.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'ProjectionService',
        description:
          'ProjectionService exists but is not subscribed to EventStore — it does not materialise events into ReadModel. Without this connection, ReadModel is never populated, forcing QueryService to fall back on WriteModel. The projection pipeline (EventStore → ProjectionService → ReadModel) is the core of the CQRS read side and is entirely absent.',
        interviewContext:
          'Candidates should complete the projection pipeline: ProjectionService subscribes to EventStore (via event bus or change data capture), handles each event type with a specific projector, and writes denormalised data to ReadModel. ReadModel schema is optimised for the query (e.g., pre-joined, indexed on query fields).',
      },
      {
        id: 'issue-3',
        type: 'cohesion_issue',
        targetClass: 'QueryModel',
        description:
          'QueryModel exists as a structural node but is not returned by QueryService — QueryService queries WriteModel instead, bypassing QueryModel. QueryModel represents the read-optimised schema (e.g., a materialised view or document store) that should be the sole data source for queries. Its disconnection indicates a half-implemented CQRS design.',
        interviewContext:
          'Candidates should wire QueryService → QueryModel (which reads from ReadModel) and disconnect QueryService from WriteModel. They should note that QueryModel may be a different database technology altogether (Elasticsearch for full-text, Redis for caching, Cassandra for time-series) selected for query characteristics, not write characteristics.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'WriteModel',
        description:
          'WriteModel and ReadModel share the same database (implicit from the diagram). In CQRS, using the same DB for write and read models re-introduces the coupling CQRS eliminates. Read models should use a separate storage technology optimised for the query access pattern, with async synchronisation from the write model via projections.',
        interviewContext:
          'Senior engineers propose that WriteModel uses a relational DB optimised for transactional consistency; ReadModel uses a document store or search index optimised for query patterns. ProjectionService bridges them via async event consumption. They note that eventual consistency on the read side is an explicit design choice requiring business acceptance.',
      },
    ],
    explanation:
      'Proper CQRS requires strict separation: CommandHandler writes to WriteModel and appends to EventStore. ProjectionService subscribes to EventStore events and materialises denormalised ReadModel views in a query-optimised store (Elasticsearch, Redis, or a read-replica with materialised views). QueryService reads exclusively from ReadModel via QueryModel — never touching WriteModel. WriteModel and ReadModel may use different database technologies. The read side is eventually consistent, which must be a deliberate business-acceptable trade-off. QueryModel provides a query-language abstraction over ReadModel, enabling the underlying store to be swapped. This design enables independent scaling of read and write paths, read path using read-replicas/caches without affecting write-side consistency.',
  },

  // ─────────────────────────────────────────────────────────────
  // 30. order=104 — P2P File Sharing — No Routing Abstraction
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'peer-to-peer-no-routing',
    title: 'P2P File Sharing — No Routing Abstraction',
    description:
      'PeerNetwork hardcodes DHT lookup inline. There is no RoutingStrategy abstraction. The class also handles piece management, bandwidth throttling, and tracker communication — four responsibilities in one.',
    difficulty: 'hard',
    order: 104,
    diagramData: {
      nodes: [
        { id: 'PeerNetwork',     data: { label: 'PeerNetwork' },     position: { x: 80,  y: 80  } },
        { id: 'DHTRouter',       data: { label: 'DHTRouter' },       position: { x: 310, y: 80  } },
        { id: 'PieceManager',    data: { label: 'PieceManager' },    position: { x: 540, y: 80  } },
        { id: 'BandwidthThrottle',data:{ label: 'BandwidthThrottle'},position: { x: 770, y: 80  } },
        { id: 'TrackerClient',   data: { label: 'TrackerClient' },   position: { x: 80,  y: 250 } },
        { id: 'RoutingStrategy', data: { label: 'RoutingStrategy' }, position: { x: 310, y: 250 } },
        { id: 'PeerConnection',  data: { label: 'PeerConnection' },  position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'PeerNetwork',    target: 'DHTRouter',        label: 'DHT lookup inline',     type: 'smoothstep' },
        { id: 'e2', source: 'PeerNetwork',    target: 'PieceManager',     label: 'manages pieces',        type: 'smoothstep' },
        { id: 'e3', source: 'PeerNetwork',    target: 'BandwidthThrottle',label: 'throttles inline',      type: 'smoothstep' },
        { id: 'e4', source: 'PeerNetwork',    target: 'TrackerClient',    label: 'announces to tracker',  type: 'smoothstep' },
        { id: 'e5', source: 'RoutingStrategy',target: 'PeerNetwork',      label: 'not used',              type: 'smoothstep' },
        { id: 'e6', source: 'PeerConnection', target: 'PeerNetwork',      label: 'connects peers',        type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'PeerNetwork',
        description:
          'DHT peer lookup is hardcoded inline with no RoutingStrategy interface. P2P networks support multiple peer discovery mechanisms: DHT (Kademlia), centralised tracker (BitTorrent announce), PEX (Peer Exchange), and LSD (Local Service Discovery). Without a RoutingStrategy abstraction, PeerNetwork cannot support multiple discovery modes or be tested with a stub router.',
        interviewContext:
          'Senior candidates define a RoutingStrategy interface with findPeers(infoHash): List<PeerAddress>. DHTRoutingStrategy, TrackerRoutingStrategy, and PEXRoutingStrategy are implementations. PeerNetwork holds List<RoutingStrategy> for hybrid discovery — trying DHT first, falling back to tracker. This mirrors libtorrent\'s peer-source abstraction.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'PeerNetwork',
        description:
          'PeerNetwork conflates four responsibilities: peer routing (which peers have the file), piece management (which pieces to request, rarest-first algorithm), bandwidth throttling (upload/download rate limiting), and tracker communication (announce). Each is an independent concern with its own algorithms (rarest-first for pieces, token bucket for bandwidth).',
        interviewContext:
          'Candidates should decompose: RoutingStrategy (peer discovery), PieceSelector (rarest-first or sequential download strategy), BandwidthLimiter (token bucket rate control), and TrackerClient (HTTP/UDP announce protocol). PeerNetwork becomes a coordinator using these abstractions. They should reference BitTorrent specification components.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'BandwidthThrottle',
        description:
          'Bandwidth throttling is hardcoded inline in PeerNetwork, meaning the throttle algorithm (token bucket parameters) cannot be configured at runtime. A P2P client must allow users to set upload/download speed limits dynamically. Without a BandwidthLimiter interface with adjustRate(bytesPerSecond), runtime reconfiguration is impossible.',
        interviewContext:
          'Senior engineers propose a BandwidthLimiter interface with tryConsume(bytes): boolean and a TokenBucketLimiter implementation with a setRate(bytesPerSec) method. PeerConnection applies the limiter for each data transfer. Rate changes propagate to the running limiter without reconnecting peers.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'TrackerClient',
        description:
          'Tracker communication is both a discovery mechanism and a peer coordination protocol (announcing seeding/leeching status). Mixing tracker protocol (HTTP announce, scrape) with general peer network coordination in PeerNetwork means tracker protocol changes affect the entire P2P stack. TrackerClient should be an independent, swappable implementation of RoutingStrategy.',
        interviewContext:
          'Candidates should note that BitTorrent supports both HTTP trackers and UDP trackers with different protocols. TrackerClient should implement RoutingStrategy (for peer discovery) and a separate AnnounceService (for periodic tracker announces). This separation matches how libtorrent, qBittorrent, and Transmission implement their torrent client internals.',
      },
    ],
    explanation:
      'PeerNetwork should depend on a RoutingStrategy interface (findPeers(infoHash)) with DHTRoutingStrategy (Kademlia), TrackerRoutingStrategy, and PEXRoutingStrategy implementations — used in a priority order for hybrid discovery. PieceSelector implements rarest-first or sequential selection strategy as an injectable algorithm. BandwidthLimiter (TokenBucketLimiter) provides runtime-configurable rate limiting per connection. TrackerClient implements both RoutingStrategy and a periodic AnnounceService. PeerNetwork becomes a coordinator: route → connect (PeerConnection) → select pieces (PieceSelector) → throttle transfers (BandwidthLimiter). Each component is independently testable and configurable. This decomposition mirrors libtorrent\'s internal architecture which has separate tracker, DHT, piece picker, and bandwidth manager components.',
  },

  // ─────────────────────────────────────────────────────────────
  // 31. order=105 — API Versioning — No Version Strategy
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'api-versioning-no-strategy',
    title: 'API Versioning — No Version Strategy',
    description:
      'APIRouter has v1/v2/v3 handlers with inline if/else on the version header. There is no VersionStrategy or handler registry. Adding v4 requires modifying APIRouter, violating OCP.',
    difficulty: 'hard',
    order: 105,
    diagramData: {
      nodes: [
        { id: 'APIRouter',       data: { label: 'APIRouter' },       position: { x: 80,  y: 80  } },
        { id: 'V1Handler',       data: { label: 'V1Handler' },       position: { x: 310, y: 80  } },
        { id: 'V2Handler',       data: { label: 'V2Handler' },       position: { x: 540, y: 80  } },
        { id: 'V3Handler',       data: { label: 'V3Handler' },       position: { x: 770, y: 80  } },
        { id: 'VersionStrategy', data: { label: 'VersionStrategy' }, position: { x: 80,  y: 250 } },
        { id: 'HandlerRegistry', data: { label: 'HandlerRegistry' }, position: { x: 310, y: 250 } },
        { id: 'RequestContext',  data: { label: 'RequestContext' },  position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'RequestContext', target: 'APIRouter',       label: 'incoming request',      type: 'smoothstep' },
        { id: 'e2', source: 'APIRouter',      target: 'V1Handler',       label: 'if version==v1',        type: 'smoothstep' },
        { id: 'e3', source: 'APIRouter',      target: 'V2Handler',       label: 'if version==v2',        type: 'smoothstep' },
        { id: 'e4', source: 'APIRouter',      target: 'V3Handler',       label: 'if version==v3',        type: 'smoothstep' },
        { id: 'e5', source: 'VersionStrategy',target: 'APIRouter',       label: 'not used',              type: 'smoothstep' },
        { id: 'e6', source: 'HandlerRegistry',target: 'APIRouter',       label: 'not used',              type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'APIRouter',
        description:
          'Version selection is hardcoded as if/else inside APIRouter. Adding a new API version requires modifying APIRouter — a direct OCP violation. A HandlerRegistry mapping version strings to RequestHandler implementations enables zero-modification version addition. V4Handler registration does not touch APIRouter at all.',
        interviewContext:
          'Senior candidates propose a HandlerRegistry<ApiVersion, RequestHandler> and a version extraction step. APIRouter becomes: extract version from request → registry.lookup(version) → delegate. They note the same pattern works for URL-based versioning (api/v1/), header-based (Accept: application/vnd.api+json;version=2), and query-param versioning.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'VersionStrategy',
        description:
          'There is no VersionStrategy for extracting the API version from the request. Different APIs use different version negotiation mechanisms: URL path (/v1/), Accept header (Content-Type versioning/MIME versioning), custom header (X-API-Version), or query parameter (?version=2). Without a VersionStrategy interface, the extraction mechanism is hardcoded in APIRouter.',
        interviewContext:
          'Candidates should propose a VersionStrategy interface with extractVersion(RequestContext): ApiVersion, with UrlPathVersionStrategy, AcceptHeaderVersionStrategy, and QueryParamVersionStrategy implementations. APIRouter injects the appropriate VersionStrategy for the API\'s versioning scheme. The strategy is also responsible for default version resolution.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'V1Handler',
        description:
          'V1Handler, V2Handler, and V3Handler are direct concrete dependencies of APIRouter. If V1Handler needs to be deprecated and removed, APIRouter must be modified to remove the reference. In a mature API platform, deprecation is a configuration change (remove from registry), not a code change.',
        interviewContext:
          'Candidates should note that version lifecycle (deprecated, sunset) should be metadata on the HandlerRegistry entry, not code logic. An API version deprecation filter can inject Deprecation and Sunset headers based on registry metadata. Removing a version is a registry operation — no APIRouter changes needed.',
      },
      {
        id: 'issue-4',
        type: 'other',
        targetClass: 'APIRouter',
        description:
          'There is no version negotiation fallback. If a client requests v5 (not yet deployed) or v0 (removed), APIRouter has no graceful degradation — it will likely return a null-pointer or silent 500 error. A VersionNegotiator that selects the closest compatible version or returns a structured 410 Gone/406 Not Acceptable response is needed.',
        interviewContext:
          'Senior engineers propose a VersionNegotiationPolicy: if exact version not found, return 406 Not Acceptable with a list of supported versions. For deprecated versions, add Sunset header. For sunset versions, return 410 Gone. This matches REST API versioning best practices from the IETF RFC for the Sunset HTTP Header (RFC 8594).',
      },
    ],
    explanation:
      'APIRouter should be decomposed into: VersionStrategy (extracts version from request — URL, header, or query param), HandlerRegistry (maps version to RequestHandler implementation), and VersionNegotiationPolicy (handles unknown/deprecated/sunset versions). APIRouter becomes: VersionStrategy.extract(request) → HandlerRegistry.lookup(version, policy) → handler.handle(request). Adding a new version is a registry registration — no APIRouter changes. Deprecation and sunset are HandlerRegistry metadata driving response headers. This design supports all common versioning schemes by swapping VersionStrategy. It matches how Spring\'s RequestMappingHandlerMapping, Kong API versioning plugins, and AWS API Gateway work — version routing as configuration, not code.',
  },

  // ─────────────────────────────────────────────────────────────
  // 32. order=106 — Resilience — No Circuit Breaker Pattern
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'resilience-no-circuit-breaker',
    title: 'Resilience — No Circuit Breaker Pattern',
    description:
      'ServiceClient retries failed calls with Thread.sleep inside the caller class. There is no CircuitBreaker abstraction. Retry, timeout, and fallback logic are all mixed directly into the service calling code.',
    difficulty: 'hard',
    order: 106,
    diagramData: {
      nodes: [
        { id: 'ServiceClient',  data: { label: 'ServiceClient' },  position: { x: 80,  y: 80  } },
        { id: 'CircuitBreaker', data: { label: 'CircuitBreaker' }, position: { x: 310, y: 80  } },
        { id: 'RetryPolicy',    data: { label: 'RetryPolicy' },    position: { x: 540, y: 80  } },
        { id: 'FallbackHandler',data: { label: 'FallbackHandler' },position: { x: 770, y: 80  } },
        { id: 'TimeoutManager', data: { label: 'TimeoutManager' }, position: { x: 80,  y: 250 } },
        { id: 'HealthMonitor',  data: { label: 'HealthMonitor' },  position: { x: 310, y: 250 } },
        { id: 'CircuitState',   data: { label: 'CircuitState' },   position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'ServiceClient',  target: 'RetryPolicy',     label: 'Thread.sleep retry',    type: 'smoothstep' },
        { id: 'e2', source: 'ServiceClient',  target: 'FallbackHandler', label: 'inline fallback',       type: 'smoothstep' },
        { id: 'e3', source: 'ServiceClient',  target: 'TimeoutManager',  label: 'timeout inline',        type: 'smoothstep' },
        { id: 'e4', source: 'CircuitBreaker', target: 'ServiceClient',   label: 'not wrapping calls',    type: 'smoothstep' },
        { id: 'e5', source: 'CircuitState',   target: 'CircuitBreaker',  label: 'not tracked',           type: 'smoothstep' },
        { id: 'e6', source: 'HealthMonitor',  target: 'CircuitBreaker',  label: 'not feeding state',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'ServiceClient',
        description:
          'There is no CircuitBreaker wrapping outbound calls. Without a circuit breaker, when a downstream service fails, ServiceClient retries indefinitely with Thread.sleep, causing thread exhaustion (thread-per-request models) or queue buildup (reactive models). A circuit breaker opens after a failure threshold, failing fast and allowing recovery — the fundamental distributed system resilience pattern.',
        interviewContext:
          'Senior candidates name the Circuit Breaker pattern (Martin Fowler) with three states: CLOSED (normal), OPEN (fast-fail), HALF_OPEN (probe recovery). They reference Resilience4j\'s CircuitBreaker, Hystrix, and the Polly library (.NET). They explain that fast-fail is better than slow-fail for dependent services.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'ServiceClient',
        description:
          'ServiceClient conflates business call logic with resilience cross-cutting concerns: retry, timeout, circuit breaking, and fallback. These are orthogonal concerns that should be applied as decorators/interceptors. Any change to retry policy (from 3 to 5 attempts) requires modifying ServiceClient, and the policy cannot be reused across other service callers.',
        interviewContext:
          'Senior engineers propose the Decorator pattern: ResilienceDecorator wraps any ServiceClient call, applying retry → circuit breaker → timeout → fallback in a configurable chain. Resilience4j\'s Decorators.ofSupplier() demonstrates this: each resilience pattern is a decorator applied independently. ServiceClient contains only the HTTP call.',
      },
      {
        id: 'issue-3',
        type: 'other',
        targetClass: 'RetryPolicy',
        description:
          'Thread.sleep-based retry blocks the calling thread, wasting thread resources during backoff. In high-concurrency systems, retrying with Thread.sleep causes thread-pool saturation when a downstream service is degraded. Non-blocking retry (scheduled retry on a timer thread, or reactive retry with delay) is required to maintain throughput under degradation.',
        interviewContext:
          'Candidates must distinguish blocking retry (Thread.sleep — appropriate only in low-concurrency batch jobs) from non-blocking retry (ScheduledExecutorService or reactive retry operators like Mono.retryWhen). In a reactive or high-concurrency system, Thread.sleep in a retry loop is a critical correctness bug, not just a performance issue.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'FallbackHandler',
        description:
          'Fallback logic is inlined in ServiceClient. The fallback strategy (return cached value, return empty, throw specific exception, call secondary service) is business logic that changes independently of the retry and circuit-breaking infrastructure. Inlining prevents testing the fallback in isolation and coupling changes the calling class.',
        interviewContext:
          'Senior engineers propose FallbackHandler<T> as an interface with getFallback(Throwable): T, injected into the resilience decorator. Different callers provide different fallback strategies. Resilience4j\'s @CircuitBreaker(fallbackMethod=...) annotation demonstrates this separation — the fallback is a separate method, not inline code.',
      },
    ],
    explanation:
      'ServiceClient should be wrapped with a Resilience4j (or custom) decorator chain: TimeoutDecorator (non-blocking deadline) → CircuitBreakerDecorator (CLOSED/OPEN/HALF_OPEN state machine tracking failure rate) → RetryDecorator (exponential backoff with jitter, non-blocking via ScheduledExecutor) → FallbackDecorator (injected FallbackHandler<T>). ServiceClient itself contains only the HTTP call — zero resilience logic. CircuitState transitions are driven by HealthMonitor tracking success/failure rates over a sliding window. Each decorator is independently testable and reusable across all service clients. This design matches Resilience4j\'s composable decorator API and Netflix Hystrix\'s isolation model, enabling per-service-dependency resilience configuration without modifying calling code.',
  },

  // ─────────────────────────────────────────────────────────────
  // 33. order=107 — Tenant Billing Report God Class
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'tenant-billing-report-god',
    title: 'Tenant Billing Report God Class',
    description:
      'TenantBillingReport fetches usage, applies pricing tiers, converts currency, generates a PDF, emails the invoice, and posts to accounting — six responsibilities in one class.',
    difficulty: 'hard',
    order: 107,
    diagramData: {
      nodes: [
        { id: 'TenantBillingReport', data: { label: 'TenantBillingReport' }, position: { x: 80,  y: 80  } },
        { id: 'UsageFetcher',        data: { label: 'UsageFetcher' },        position: { x: 310, y: 80  } },
        { id: 'PricingEngine',       data: { label: 'PricingEngine' },       position: { x: 540, y: 80  } },
        { id: 'CurrencyConverter',   data: { label: 'CurrencyConverter' },   position: { x: 770, y: 80  } },
        { id: 'PDFGenerator',        data: { label: 'PDFGenerator' },        position: { x: 80,  y: 250 } },
        { id: 'EmailSender',         data: { label: 'EmailSender' },         position: { x: 310, y: 250 } },
        { id: 'AccountingPoster',    data: { label: 'AccountingPoster' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'TenantBillingReport', target: 'UsageFetcher',      label: 'fetches usage',         type: 'smoothstep' },
        { id: 'e2', source: 'TenantBillingReport', target: 'PricingEngine',     label: 'applies tiers',         type: 'smoothstep' },
        { id: 'e3', source: 'TenantBillingReport', target: 'CurrencyConverter', label: 'converts currency',     type: 'smoothstep' },
        { id: 'e4', source: 'TenantBillingReport', target: 'PDFGenerator',      label: 'generates PDF',         type: 'smoothstep' },
        { id: 'e5', source: 'TenantBillingReport', target: 'EmailSender',       label: 'emails invoice',        type: 'smoothstep' },
        { id: 'e6', source: 'TenantBillingReport', target: 'AccountingPoster',  label: 'posts to accounting',   type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'TenantBillingReport',
        description:
          'TenantBillingReport has six independent reasons to change: usage data model changes, pricing tier updates, currency conversion provider migration, PDF template changes, email service provider switch, and accounting system integration changes. Any single change (e.g., switching PDF library) forces touching a class that also contains pricing logic — a high-risk, high-coupling design.',
        interviewContext:
          'Senior candidates immediately propose decomposing into focused services: BillingDataService (usage fetch), PricingEngine (tier application), CurrencyService (FX conversion), InvoiceRenderer (PDF generation), NotificationService (email), and AccountingIntegration (ERP posting). TenantBillingReport becomes an application service orchestrating these.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'TenantBillingReport',
        description:
          'PDF generation and email delivery are presentation/delivery concerns entirely separate from the business logic of calculating what a tenant owes. Billing calculation should produce a BillingStatement domain object; rendering and delivery are separate pipeline stages. Mixing them makes billing calculation untestable without mocking a PDF library.',
        interviewContext:
          'Candidates should propose a two-phase design: Phase 1 (domain) — BillingStatement calculation (usage → pricing → currency → Statement); Phase 2 (delivery) — statement.render(PDFRenderer) → email → accounting post. Statement is a pure value object. Delivery mechanisms are injected as interfaces, testable independently.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'CurrencyConverter',
        description:
          'Currency conversion is a live FX rate lookup from an external provider (e.g., ECB, Open Exchange Rates). Calling it inline in TenantBillingReport without a CurrencyService interface means the billing report depends on external API availability. Network failures during FX lookup fail the entire billing report generation for that tenant.',
        interviewContext:
          'Senior engineers propose a CurrencyService interface with a CachedCurrencyService implementation that refreshes FX rates on a background schedule. Billing uses cached rates at invoice cut time, never making a synchronous external call during report generation. This also ensures all invoices in a billing run use the same exchange rates — a compliance requirement.',
      },
      {
        id: 'issue-4',
        type: 'coupling_issue',
        targetClass: 'AccountingPoster',
        description:
          'AccountingPoster posts to an ERP system (QuickBooks, NetSuite, Xero) synchronously within TenantBillingReport. ERP API failures fail the billing report. Accounting posting is a background integration concern that should happen asynchronously after invoice generation, with independent retry logic and not blocking invoice delivery to the customer.',
        interviewContext:
          'Candidates should propose that after invoice generation, an InvoiceGeneratedEvent is published. AccountingIntegrationService subscribes and posts to the ERP asynchronously with its own retry/DLQ. Customer invoice delivery (email) and ERP posting are decoupled — ERP downtime does not delay customer invoices.',
      },
    ],
    explanation:
      'TenantBillingReport should be an application service orchestrating focused domain and infrastructure components. BillingDataService fetches usage; PricingEngine applies tier pricing (Strategy pattern for MonthlyStrategy, TieredStrategy); CachedCurrencyService provides FX rates from a background-refreshed cache; InvoiceRenderer (injected PDFRenderer or HTMLRenderer) generates the invoice document; NotificationService sends the email asynchronously. After InvoiceGeneratedEvent is published, AccountingIntegration subscribes and posts to ERP independently. TenantBillingReport produces a BillingStatement domain object — all delivery mechanisms receive it independently. Each component is independently testable and deployable, and ERP failures never delay customer invoice delivery.',
  },

  // ─────────────────────────────────────────────────────────────
  // 34. order=108 — Order Saga — Orchestration Using Choreography Pattern Wrong
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'orchestration-vs-choreography-wrong',
    title: 'Order Saga — Orchestration Using Choreography Pattern Wrong',
    description:
      'OrderSaga is designed as an orchestrator (meant to call services directly) but instead subscribes to events from all services (choreography style). The two patterns are mixed, causing unclear ownership of saga state, unclear compensation triggers, and fragmented control flow.',
    difficulty: 'hard',
    order: 108,
    diagramData: {
      nodes: [
        { id: 'OrderSaga',          data: { label: 'OrderSaga' },          position: { x: 80,  y: 80  } },
        { id: 'PaymentService',     data: { label: 'PaymentService' },     position: { x: 310, y: 80  } },
        { id: 'InventoryService',   data: { label: 'InventoryService' },   position: { x: 540, y: 80  } },
        { id: 'ShipmentService',    data: { label: 'ShipmentService' },    position: { x: 770, y: 80  } },
        { id: 'EventBus',           data: { label: 'EventBus' },           position: { x: 80,  y: 250 } },
        { id: 'SagaOrchestrator',   data: { label: 'SagaOrchestrator' },   position: { x: 310, y: 250 } },
        { id: 'OrderEventHandler',  data: { label: 'OrderEventHandler' },  position: { x: 540, y: 250 } },
        { id: 'SagaLog',            data: { label: 'SagaLog' },            position: { x: 770, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'OrderSaga',         target: 'PaymentService',    label: 'direct call + subscribe', type: 'smoothstep' },
        { id: 'e2', source: 'OrderSaga',         target: 'InventoryService',  label: 'direct call + subscribe', type: 'smoothstep' },
        { id: 'e3', source: 'OrderSaga',         target: 'ShipmentService',   label: 'direct call + subscribe', type: 'smoothstep' },
        { id: 'e4', source: 'EventBus',          target: 'OrderSaga',         label: 'receives events',          type: 'smoothstep' },
        { id: 'e5', source: 'SagaOrchestrator',  target: 'OrderSaga',         label: 'not the coordinator',      type: 'smoothstep' },
        { id: 'e6', source: 'OrderEventHandler', target: 'EventBus',          label: 'also subscribes',          type: 'smoothstep' },
        { id: 'e7', source: 'SagaLog',           target: 'SagaOrchestrator',  label: 'not persisting state',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'other',
        targetClass: 'OrderSaga',
        description:
          'OrderSaga mixes orchestration (direct calls to PaymentService, InventoryService, ShipmentService) with choreography (subscribing to events from EventBus). Orchestration pattern requires the saga to be the single source of truth for control flow via direct calls. Choreography requires each service to react to events without a central coordinator. Mixing both means saga state is split between the orchestrator\'s internal state and event subscriptions, making it impossible to determine saga progress from a single source.',
        interviewContext:
          'Senior candidates clearly distinguish the two patterns: Orchestration (one central coordinator issues commands, owns all saga state, makes compensation decisions) vs. Choreography (each service emits domain events, next service reacts, no central coordinator, compensation triggered by failure events). They explain when to prefer each: orchestration for complex compensatable transactions, choreography for simpler eventually-consistent flows.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'SagaOrchestrator',
        description:
          'SagaOrchestrator exists but is not acting as the central coordinator — OrderSaga has usurped this role while also subscribing to events. SagaOrchestrator should be the only component issuing commands to services and the only component tracking saga state. Having two "coordinators" (OrderSaga and SagaOrchestrator) creates ambiguity: which one decides to compensate on failure?',
        interviewContext:
          'The fix requires a clean separation: if orchestration, SagaOrchestrator is the sole coordinator — it calls services directly, maintains state in SagaLog, and triggers compensations. OrderSaga becomes a value object (saga definition: steps and compensations). OrderEventHandler is used only in the choreography alternative design, not here. Senior candidates design one or the other, never both.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'OrderEventHandler',
        description:
          'OrderEventHandler subscribes to EventBus independently, processing events that overlap with OrderSaga\'s event subscriptions. This creates dual-processing: the same event may trigger both OrderSaga and OrderEventHandler, leading to duplicate compensation attempts, duplicate state updates, or conflicting saga advancement. Event consumers must be exclusive per saga instance.',
        interviewContext:
          'Candidates should identify that in an orchestrated saga, event handlers exist only to receive service replies to commands previously issued by the orchestrator. Each reply event must carry a sagaId correlation, and only the orchestrator for that sagaId processes the reply. OrderEventHandler is appropriate only in a choreography design — not alongside a direct-call orchestrator.',
      },
      {
        id: 'issue-4',
        type: 'missing_abstraction',
        targetClass: 'SagaLog',
        description:
          'SagaLog is not connected to SagaOrchestrator. Without a durable saga log recording current saga state (which steps completed, which compensations are pending), a crash during saga execution results in an irrecoverable inconsistent distributed state. The saga log is the critical durability component that enables exactly-once-effect guarantees and crash recovery in an orchestrated saga.',
        interviewContext:
          'Senior engineers specify that SagaOrchestrator must write to SagaLog in the same transaction as each step\'s local effect (outbox pattern). On restart, SagaOrchestrator loads in-progress sagas from SagaLog and replays from the last committed step. They reference Temporal.io\'s workflow history and Axon Framework\'s saga persistence.',
      },
    ],
    explanation:
      'The design must commit to either orchestration or choreography — never both. For an orchestrated saga: SagaOrchestrator is the sole coordinator. It issues commands directly to PaymentService, InventoryService, and ShipmentService; tracks saga state in SagaLog (via outbox pattern, atomically with each step); triggers compensations in reverse order on failure. OrderSaga is a value object defining steps and compensations. OrderEventHandler is used only as a reply listener keyed by sagaId correlation. EventBus carries only reply events from services back to the orchestrator — no side subscriptions. For a choreographed saga: remove SagaOrchestrator entirely; each service reacts to domain events and emits its own; compensation is triggered by failure events; no central coordinator. The correct choice here is orchestration (complex compensatable flow). Temporal.io, Axon Framework, and MassTransit Saga implement the orchestrated model with durable state management.',
  },
]
