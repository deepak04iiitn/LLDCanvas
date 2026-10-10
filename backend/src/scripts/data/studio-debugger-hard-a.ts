import { pack, node, edge, pos, type DebuggerPackSeed, type DebuggerCategory } from '../seed-studio-debugger-lib'

function issue(
  slug: string,
  n: number,
  elementIds: string[],
  category: DebuggerCategory,
  explanationKeywords: string[],
  modelAnswer: string,
  hints: [string, string],
  aliases?: string[],
) {
  return {
    id: `iss-${slug}-${n}`,
    elementIds,
    category,
    ...(aliases ? { aliases } : {}),
    explanationKeywords,
    modelAnswer,
    hints,
  }
}

function briefing(names: string[], start: string, methods: string) {
  return (
    `This challenge is a broken UML sketch around: ${names.join(', ')}.\n\n` +
    `Your job is to investigate - click classes and relationships, notice what feels overloaded, oddly connected, or hard to extend - then mark issues with a category and a short "why."\n\n` +
    `Start by opening ${start} and reading its methods (${methods}).\n\n` +
    `Do not assume the answer from the title alone; use the diagram.`
  )
}

function requirement(count: number, goal: string) {
  return `There are exactly ${count} design problems to find. Inspect the diagram, mark each with a category and a short "why," then repair so ${goal}.`
}

export const HARD_A: DebuggerPackSeed[] = [
  // 168 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-ride-orchestrator-god',
    title: 'Ride Service Orchestration',
    difficulty: 'hard',
    order: 168,
    description: 'Find why one RideService owns matching, pricing, routing, payment, and ratings for a ride-hailing platform.',
    tags: ['ride-hailing', 'god-object', 'SRP', 'coupling'],
    nodes: [
      node('n1', 'el-ride-service', 'RideService', pos(1, 1), [
        'matchDriver', 'computeSurge', 'estimateEta', 'planRoute', 'chargeRider', 'recordRating',
      ], [
        { name: 'surgeMultipliers', type: 'Map<Zone, Double>' },
        { name: 'driverRatings', type: 'Map<DriverId, List<Integer>>' },
      ]),
      node('n2', 'el-ride-rider', 'Rider', pos(0, 1), ['requestRide', 'cancelRide']),
      node('n3', 'el-ride-driver', 'Driver', pos(2, 1), ['accept', 'updateLocation']),
      node('n4', 'el-ride-trip', 'Trip', pos(1, 0), ['start', 'complete', 'getFare']),
      node('n5', 'el-ride-stripe', 'StripeClient', pos(0, 2), ['createCharge', 'refund']),
      node('n6', 'el-ride-maps', 'GoogleMapsClient', pos(2, 2), ['directions', 'distanceMatrix']),
      node('n7', 'el-ride-push', 'PushGateway', pos(0, 0), ['notify']),
    ],
    edges: [
      edge('e1', 'ed-ride-rider', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-ride-driver', 'n1', 'n3', 'association'),
      edge('e3', 'ed-ride-trip', 'n1', 'n4', 'association'),
      edge('e4', 'ed-ride-stripe', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-ride-maps', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-ride-push', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['RideService', 'Rider', 'Driver', 'Trip', 'StripeClient', 'GoogleMapsClient', 'PushGateway'],
      'RideService',
      'matchDriver, computeSurge, estimateEta, planRoute, chargeRider, recordRating',
    ),
    requirement: requirement(3, 'each ride concern has a focused owner and vendor SDKs sit behind abstractions'),
    expectedIssues: [
      issue(
        'dbg-ride-orchestrator-god', 1,
        ['el-ride-service'],
        'God Object',
        ['god', 'too many', 'everything', 'matching', 'pricing', 'payment', 'rating', 'routing', 'knows'],
        'RideService matches drivers, computes surge, estimates ETAs, plans routes, charges riders, and records ratings, and it holds the state for all of them. It is the hub every change touches. Split it into focused collaborators such as DispatchService, PricingService, EtaService, PaymentService, and RatingService, with RideService only orchestrating.',
        [
          'Count the unrelated nouns in the method list of RideService: dispatch, pricing, maps, money, reputation.',
          'If a product manager changes any one of those rules, which class do you edit?',
        ],
        ['god class', 'blob', 'monolith'],
      ),
      issue(
        'dbg-ride-orchestrator-god', 2,
        ['el-ride-service'],
        'SRP Violation',
        ['single responsibility', 'reason to change', 'surge', 'rating', 'pricing', 'dispatch', 'multiple'],
        'RideService has many independent reasons to change: surge pricing policy (business), ETA algorithms (data science), payment rules (compliance), and rating aggregation (trust and safety). Its surgeMultipliers and driverRatings fields show unrelated state living side by side. Extract a PricingPolicy and a RatingService so each change lands in one class.',
        [
          'Which teams would each want to change computeSurge, chargeRider, and recordRating independently?',
          'Look at the two attributes on RideService. Do they belong to the same concept?',
        ],
        ['SRP', 'multiple responsibilities', 'mixed concerns'],
      ),
      issue(
        'dbg-ride-orchestrator-god', 3,
        ['ed-ride-stripe', 'ed-ride-maps', 'el-ride-stripe', 'el-ride-maps'],
        'Tight Coupling',
        ['concrete', 'vendor', 'stripe', 'google', 'sdk', 'interface', 'swap', 'abstraction', 'coupled'],
        'RideService depends directly on StripeClient and GoogleMapsClient, so vendor SDK types leak into dispatch logic and the vendors cannot be swapped or faked in tests. Introduce PaymentGateway and RoutingProvider interfaces and have the vendor clients implement them.',
        [
          'What would you need to change in RideService to move from Stripe to Adyen?',
          'Look at the edges leaving RideService toward the vendor clients. Are they pointing at interfaces?',
        ],
        ['concrete dependency', 'vendor lock-in'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['PricingService', 'PaymentGateway'],
      forbidDirectEdges: [{ from: 'RideService', to: 'StripeClient' }, { from: 'RideService', to: 'GoogleMapsClient' }],
      requireNoEditTo: ['Rider', 'Driver'],
    },
  }),

  // 169 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-cache-cluster-no-partition',
    title: 'Distributed Cache Partitioning',
    difficulty: 'hard',
    order: 169,
    description: 'Find why changing how keys map to cache nodes means rewriting the cluster class and its subclasses.',
    tags: ['cache', 'partitioning', 'OCP', 'strategy'],
    nodes: [
      node('n1', 'el-cache-cluster', 'CacheCluster', pos(1, 1), [
        { name: 'get', returnType: 'Value', params: [{ name: 'key', type: 'String' }] },
        { name: 'put', params: [{ name: 'key', type: 'String' }, { name: 'value', type: 'Value' }] },
        { name: 'nodeFor', returnType: 'CacheNode', params: [{ name: 'key', type: 'String' }] },
        'evict',
      ], [
        { name: 'nodes', type: 'List<CacheNode>', visibility: 'protected' },
      ]),
      node('n2', 'el-cache-client', 'CacheClient', pos(0, 1), ['read', 'write']),
      node('n3', 'el-cache-node', 'CacheNode', pos(2, 1), ['load', 'store', 'remove']),
      node('n4', 'el-cache-ch-cluster', 'ConsistentHashCluster', pos(1, 0), ['nodeFor', 'buildRing']),
      node('n5', 'el-cache-rebalancer', 'Rebalancer', pos(1, 2), ['addNode', 'removeNode', 'migrateKeys']),
      node('n6', 'el-cache-replication', 'ReplicationManager', pos(2, 2), ['replicate', 'promoteReplica']),
      node('n7', 'el-cache-health', 'HealthMonitor', pos(0, 2), ['ping', 'markDown']),
    ],
    edges: [
      edge('e1', 'ed-cache-client-cluster', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-cache-cluster-node', 'n1', 'n3', 'aggregation'),
      edge('e3', 'ed-cache-ch-inherit', 'n4', 'n1', 'inheritance'),
      edge('e4', 'ed-cache-rebalancer-cluster', 'n5', 'n1', 'dependency'),
      edge('e5', 'ed-cache-replication-node', 'n6', 'n3', 'dependency'),
      edge('e6', 'ed-cache-health-cluster', 'n7', 'n1', 'dependency'),
    ],
    briefing: briefing(
      ['CacheCluster', 'CacheClient', 'CacheNode', 'ConsistentHashCluster', 'Rebalancer', 'ReplicationManager', 'HealthMonitor'],
      'CacheCluster',
      'get, put, nodeFor, evict',
    ),
    requirement: requirement(3, 'key-to-node mapping is a swappable strategy and no class duplicates the routing rule'),
    expectedIssues: [
      issue(
        'dbg-cache-cluster-no-partition', 1,
        ['el-cache-cluster'],
        'OCP Violation',
        ['modulo', 'hash', 'hardcoded', 'nodeFor', 'strategy', 'modify', 'extend', 'partition'],
        'CacheCluster.nodeFor hardcodes hash(key) % nodes.size(). Any new partitioning scheme (consistent hashing, range, rendezvous) requires editing CacheCluster. Extract a PartitionStrategy interface, inject it, and keep CacheCluster closed for modification.',
        [
          'Open nodeFor. How is a key mapped to a node?',
          'What would you have to edit to try rendezvous hashing instead?',
        ],
        ['open closed', 'hardcoded algorithm'],
      ),
      issue(
        'dbg-cache-cluster-no-partition', 2,
        ['el-cache-ch-cluster', 'ed-cache-ch-inherit'],
        'Pattern Misuse',
        ['inheritance', 'subclass', 'override', 'strategy', 'composition', 'partition', 'misuse'],
        'ConsistentHashCluster extends CacheCluster only to override nodeFor. Subclassing is being used as a poor-man\'s Strategy: every caching feature now has to be re-tested per partitioning flavor, and you cannot change the scheme at runtime. Use a PartitionStrategy with composition instead of inheritance.',
        [
          'What is the only real difference between CacheCluster and ConsistentHashCluster?',
          'Which pattern swaps one algorithm for another without subclassing the whole host?',
        ],
        ['inheritance for strategy', 'subclass instead of strategy'],
      ),
      issue(
        'dbg-cache-cluster-no-partition', 3,
        ['ed-cache-rebalancer-cluster', 'el-cache-rebalancer'],
        'Tight Coupling',
        ['rebalancer', 'duplicate', 'modulo', 'internal', 'nodes', 'knows', 'coupled', 'migrate'],
        'Rebalancer reaches into the cluster, reads its protected node list, and re-implements the same modulo rule to decide which keys move. The routing rule now lives in two places and any partitioning change silently breaks migration. Rebalancer should ask a shared PartitionStrategy for ownership.',
        [
          'How does Rebalancer decide which keys to migrate when a node is added?',
          'If CacheCluster changed its routing rule, would Rebalancer notice?',
        ],
        ['duplicated logic', 'leaky coupling'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['PartitionStrategy'],
      requireNoEditTo: ['CacheNode', 'HealthMonitor'],
    },
  }),

  // 170 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-event-sourcing-mixed-cqrs',
    title: 'Order Aggregate Boundaries',
    difficulty: 'hard',
    order: 170,
    description: 'Find why an event-sourced Order aggregate also serves queries and writes read models itself.',
    tags: ['event-sourcing', 'CQRS', 'aggregate', 'SRP'],
    nodes: [
      node('n1', 'el-oa-aggregate', 'OrderAggregate', pos(1, 1), [
        'placeOrder', 'cancel', 'applyEvent',
        'getOrderSummary', 'listOrdersByCustomer',
        'updateReadModel', 'reindexSearch',
      ], [
        { name: 'uncommittedEvents', type: 'List<OrderEvent>' },
      ]),
      node('n2', 'el-oa-repo', 'OrderRepository', pos(0, 1), ['load', 'save']),
      node('n3', 'el-oa-eventstore', 'EventStore', pos(2, 1), ['append', 'readStream']),
      node('n4', 'el-oa-event', 'OrderEvent', pos(1, 0), ['getType', 'getPayload']),
      node('n5', 'el-oa-readdb', 'ReadModelDb', pos(1, 2), ['upsertRow', 'query']),
      node('n6', 'el-oa-search', 'SearchIndexProjector', pos(2, 2), ['indexOrder']),
      node('n7', 'el-oa-dashboard', 'DashboardController', pos(0, 2), ['showOrders', 'showOrderDetail']),
    ],
    edges: [
      edge('e1', 'ed-oa-repo-aggregate', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-oa-aggregate-eventstore', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-oa-aggregate-event', 'n1', 'n4', 'composition'),
      edge('e4', 'ed-oa-aggregate-readdb', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-oa-aggregate-search', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-oa-dashboard-aggregate', 'n7', 'n1', 'dependency'),
    ],
    briefing: briefing(
      ['OrderAggregate', 'OrderRepository', 'EventStore', 'OrderEvent', 'ReadModelDb', 'SearchIndexProjector', 'DashboardController'],
      'OrderAggregate',
      'placeOrder, cancel, applyEvent, getOrderSummary, updateReadModel',
    ),
    requirement: requirement(3, 'commands, queries, and projections each have their own home'),
    expectedIssues: [
      issue(
        'dbg-event-sourcing-mixed-cqrs', 1,
        ['el-oa-aggregate'],
        'SRP Violation',
        ['aggregate', 'command', 'query', 'projection', 'read model', 'responsibility', 'mixed', 'invariant'],
        'OrderAggregate enforces invariants and emits events (placeOrder, cancel, applyEvent) while also answering queries (getOrderSummary, listOrdersByCustomer) and maintaining read models (updateReadModel, reindexSearch). An aggregate should only guard consistency of the write side. Move queries to read-side query handlers and projections into dedicated projectors.',
        [
          'Sort the methods on OrderAggregate into commands, queries, and projections.',
          'Which of those does an aggregate actually need to protect its invariants?',
        ],
        ['mixed responsibilities', 'aggregate too fat'],
      ),
      issue(
        'dbg-event-sourcing-mixed-cqrs', 2,
        ['ed-oa-dashboard-aggregate', 'el-oa-dashboard'],
        'Pattern Misuse',
        ['cqrs', 'query', 'read side', 'aggregate', 'separate', 'read model', 'dashboard', 'rehydrate'],
        'DashboardController calls the aggregate to read data, so every page view rehydrates the write model from its event stream. CQRS exists to avoid this: queries should go to a read-optimised model through a query service, never through the aggregate.',
        [
          'Where does DashboardController get the data it shows?',
          'Which edge bypasses the read model that already exists in this diagram?',
        ],
        ['CQRS violation', 'queries through write model'],
      ),
      issue(
        'dbg-event-sourcing-mixed-cqrs', 3,
        ['ed-oa-aggregate-readdb', 'ed-oa-aggregate-search'],
        'Pattern Misuse',
        ['projection', 'synchronous', 'eventual consistency', 'subscribe', 'event handler', 'aggregate', 'write', 'transaction'],
        'The aggregate synchronously writes ReadModelDb and the search index inside the command. Projections should be built by subscribers consuming OrderEvents from the EventStore, so the write path stays small and read models can lag, rebuild, or be added without touching the aggregate.',
        [
          'Who should react to an OrderEvent after it is stored?',
          'What happens to a placeOrder command if the search index is down?',
        ],
        ['projection coupled to command', 'dual write'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['OrderQueryService', 'OrderProjector'],
      forbidDirectEdges: [{ from: 'DashboardController', to: 'OrderAggregate' }],
      requireNoEditTo: ['EventStore'],
    },
  }),

  // 171 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-saga-no-compensate',
    title: 'Checkout Saga Flow',
    difficulty: 'hard',
    order: 171,
    description: 'Find why a failed payment leaves inventory reserved and why the saga is welded to every participant.',
    tags: ['saga', 'distributed', 'compensation', 'coupling'],
    nodes: [
      node('n1', 'el-saga-order', 'OrderSaga', pos(1, 1), [
        'execute', 'reserveInventory', 'chargePayment', 'createShipment', 'sendConfirmation',
      ], [
        { name: 'state', type: 'String' },
      ]),
      node('n2', 'el-saga-controller', 'CheckoutController', pos(0, 0), ['checkout']),
      node('n3', 'el-saga-inventory', 'InventoryService', pos(0, 1), ['reserve', 'release']),
      node('n4', 'el-saga-payment', 'PaymentService', pos(2, 1), ['charge', 'refund']),
      node('n5', 'el-saga-shipping', 'ShippingService', pos(1, 2), ['createLabel', 'cancelLabel']),
      node('n6', 'el-saga-log', 'SagaLog', pos(1, 0), ['record', 'loadPending']),
      node('n7', 'el-saga-notify', 'NotificationService', pos(2, 2), ['sendEmail']),
    ],
    edges: [
      edge('e1', 'ed-saga-controller', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-saga-inventory', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-saga-payment', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-saga-shipping', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-saga-log', 'n1', 'n6', 'association'),
      edge('e6', 'ed-saga-notify', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['OrderSaga', 'CheckoutController', 'InventoryService', 'PaymentService', 'ShippingService', 'SagaLog', 'NotificationService'],
      'OrderSaga',
      'execute, reserveInventory, chargePayment, createShipment, sendConfirmation',
    ),
    requirement: requirement(3, 'a mid-flow failure undoes completed steps and steps can be added without editing the saga body'),
    expectedIssues: [
      issue(
        'dbg-saga-no-compensate', 1,
        ['el-saga-order', 'el-saga-inventory', 'el-saga-payment'],
        'Pattern Misuse',
        ['compensation', 'rollback', 'undo', 'saga', 'release', 'refund', 'failure', 'partial'],
        'OrderSaga just calls reserve, charge, and ship in sequence. If charging fails after inventory is reserved, nothing calls release; if shipping fails nothing refunds. A saga without compensating actions is only a distributed script. Give each step an execute and compensate pair and unwind completed steps on failure.',
        [
          'InventoryService has release and PaymentService has refund. Who calls them?',
          'What state is the system in if createShipment throws?',
        ],
        ['no compensation', 'missing rollback', 'saga without compensation'],
      ),
      issue(
        'dbg-saga-no-compensate', 2,
        ['ed-saga-inventory', 'ed-saga-payment', 'ed-saga-shipping'],
        'Tight Coupling',
        ['concrete', 'service', 'step', 'interface', 'hardcoded', 'order', 'participants', 'coupled'],
        'OrderSaga calls three concrete services directly and hardcodes their order. Adding a fraud check or loyalty step means editing the saga body. Define a SagaStep interface with execute and compensate, and let the saga drive an ordered list of steps.',
        [
          'How many concrete service classes does OrderSaga know about?',
          'What would adding a fraud-check step require?',
        ],
        ['hardcoded steps', 'concrete participants'],
      ),
      issue(
        'dbg-saga-no-compensate', 3,
        ['el-saga-order', 'ed-saga-notify'],
        'SRP Violation',
        ['orchestrate', 'notify', 'state', 'persist', 'multiple', 'responsibility', 'confirmation', 'flow'],
        'OrderSaga mixes flow control with business calls, a mutable state string, and confirmation emails. State persistence belongs to a saga coordinator backed by SagaLog, and notification should be a final step or an event listener, so the saga class only decides what runs next.',
        [
          'Besides ordering steps, what else does OrderSaga do?',
          'Who is responsible for resuming a half-finished saga after a crash?',
        ],
        ['mixed concerns', 'orchestrator does too much'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['SagaStep'],
      forbidDirectEdges: [{ from: 'OrderSaga', to: 'InventoryService' }, { from: 'OrderSaga', to: 'PaymentService' }],
      requireNoEditTo: ['SagaLog'],
    },
  }),

  // 172 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-search-no-index',
    title: 'Search Engine Path',
    difficulty: 'hard',
    order: 172,
    description: 'Find why every query scans all documents and why changing ranking means editing the engine.',
    tags: ['search', 'ranking', 'OCP', 'repository'],
    nodes: [
      node('n1', 'el-se-engine', 'SearchEngine', pos(1, 1), [
        { name: 'search', returnType: 'List<SearchResult>', params: [{ name: 'query', type: 'String' }] },
        'tokenize', 'scanAllDocuments', 'scoreTfIdf', 'buildSnippet',
      ]),
      node('n2', 'el-se-parser', 'QueryParser', pos(0, 0), ['parse', 'normalize']),
      node('n3', 'el-se-store', 'DocumentStore', pos(0, 1), ['getAll', 'getById', 'save']),
      node('n4', 'el-se-doc', 'Document', pos(1, 0), ['getText', 'getTitle']),
      node('n5', 'el-se-result', 'SearchResult', pos(2, 1), ['getScore', 'getSnippet']),
      node('n6', 'el-se-stopwords', 'StopWordFilter', pos(2, 0), ['isStopWord']),
      node('n7', 'el-se-api', 'SearchController', pos(0, 2), ['handleQuery']),
    ],
    edges: [
      edge('e1', 'ed-se-api-engine', 'n7', 'n1', 'dependency'),
      edge('e2', 'ed-se-engine-parser', 'n1', 'n2', 'dependency'),
      edge('e3', 'ed-se-engine-store', 'n1', 'n3', 'dependency'),
      edge('e4', 'ed-se-store-doc', 'n3', 'n4', 'aggregation'),
      edge('e5', 'ed-se-engine-result', 'n1', 'n5', 'dependency'),
      edge('e6', 'ed-se-engine-stop', 'n1', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['SearchEngine', 'QueryParser', 'DocumentStore', 'Document', 'SearchResult', 'StopWordFilter', 'SearchController'],
      'SearchEngine',
      'search, tokenize, scanAllDocuments, scoreTfIdf, buildSnippet',
    ),
    requirement: requirement(3, 'lookups use an index abstraction and ranking can be swapped without editing SearchEngine'),
    expectedIssues: [
      issue(
        'dbg-search-no-index', 1,
        ['el-se-engine'],
        'OCP Violation',
        ['ranking', 'tf-idf', 'bm25', 'hardcoded', 'strategy', 'modify', 'scoring', 'swap'],
        'scoreTfIdf is baked into SearchEngine. Moving to BM25, adding recency boosts, or A/B testing rankers means editing the engine itself. Extract a Ranker interface (TfIdfRanker, Bm25Ranker) and inject it.',
        [
          'Which method decides result order, and where does it live?',
          'What would you edit to try BM25?',
        ],
        ['hardcoded ranking', 'open closed'],
      ),
      issue(
        'dbg-search-no-index', 2,
        ['el-se-engine'],
        'SRP Violation',
        ['tokenize', 'scan', 'rank', 'snippet', 'responsibility', 'multiple', 'query', 'highlight'],
        'SearchEngine tokenizes, scans documents, scores, and builds snippets. Each of those changes for a different reason (language support, storage, relevance, UI). Split it into a Tokenizer, a lookup component, a Ranker, and a SnippetBuilder, leaving the engine as a thin coordinator.',
        [
          'List the verbs in SearchEngine. How many different domains do they touch?',
          'Which of them would change if you added Japanese language support?',
        ],
        ['mixed responsibilities', 'engine does everything'],
      ),
      issue(
        'dbg-search-no-index', 3,
        ['ed-se-engine-store', 'el-se-store'],
        'Pattern Misuse',
        ['repository', 'getAll', 'linear', 'scan', 'index', 'inverted', 'filter', 'in memory'],
        'DocumentStore is meant to be a repository, but it only exposes getAll and the engine filters every document in memory on each query, O(n) per search. A real repository or index abstraction (InvertedIndex.lookup(term)) should answer candidate queries so the engine never loads the whole corpus.',
        [
          'What does SearchEngine call on DocumentStore for every query?',
          'What data structure lets you jump straight from a term to its documents?',
        ],
        ['linear scan', 'missing index', 'repository misuse'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['InvertedIndex', 'Ranker'],
      requireNoEditTo: ['Document', 'SearchResult'],
    },
  }),

  // 173 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-reco-engine-god',
    title: 'Recommendation Engine Scope',
    difficulty: 'hard',
    order: 173,
    description: 'Find why one RecommendationEngine trains models, runs experiments, and serves traffic at once.',
    tags: ['recommendation', 'ml', 'god-object', 'coupling'],
    nodes: [
      node('n1', 'el-reco-engine', 'RecommendationEngine', pos(1, 1), [
        'collaborativeFilter', 'contentBasedScore', 'assignExperiment', 'trainModel', 'serve', 'logImpression',
      ], [
        { name: 'modelWeights', type: 'double[]', visibility: 'public' },
        { name: 'experimentBuckets', type: 'Map<UserId, String>', visibility: 'public' },
      ]),
      node('n2', 'el-reco-profile', 'UserProfile', pos(0, 1), ['getHistory', 'getEmbedding']),
      node('n3', 'el-reco-item', 'Item', pos(2, 1), ['getFeatures', 'getEmbedding']),
      node('n4', 'el-reco-experiment', 'ExperimentConfig', pos(1, 0), ['variantFor']),
      node('n5', 'el-reco-trainer', 'SparkTrainer', pos(0, 2), ['fit', 'export']),
      node('n6', 'el-reco-cache', 'RedisFeatureCache', pos(2, 2), ['getFeatures', 'putFeatures']),
      node('n7', 'el-reco-logger', 'ImpressionLogger', pos(0, 0), ['log']),
    ],
    edges: [
      edge('e1', 'ed-reco-profile', 'n1', 'n2', 'association'),
      edge('e2', 'ed-reco-item', 'n1', 'n3', 'association'),
      edge('e3', 'ed-reco-experiment', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-reco-trainer', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-reco-cache', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-reco-logger', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['RecommendationEngine', 'UserProfile', 'Item', 'ExperimentConfig', 'SparkTrainer', 'RedisFeatureCache', 'ImpressionLogger'],
      'RecommendationEngine',
      'collaborativeFilter, contentBasedScore, assignExperiment, trainModel, serve, logImpression',
    ),
    requirement: requirement(3, 'training, serving, and experimentation are separate and infrastructure sits behind interfaces'),
    expectedIssues: [
      issue(
        'dbg-reco-engine-god', 1,
        ['el-reco-engine'],
        'God Object',
        ['god', 'training', 'serving', 'experiment', 'collaborative', 'content', 'everything', 'too many'],
        'RecommendationEngine implements two scoring algorithms, A/B experiment assignment, offline model training, online serving, and impression logging. Batch training and low-latency serving have opposite lifecycles. Split into candidate generators, an ExperimentRouter, a ModelTrainer, and a RecommendationService that only composes them.',
        [
          'Which methods run offline in batch and which run in the request path?',
          'How many different teams (ML, growth, platform) would edit this class?',
        ],
        ['god class', 'blob', 'monolith'],
      ),
      issue(
        'dbg-reco-engine-god', 2,
        ['ed-reco-trainer', 'ed-reco-cache', 'el-reco-trainer', 'el-reco-cache'],
        'Tight Coupling',
        ['spark', 'redis', 'concrete', 'infrastructure', 'interface', 'test', 'swap', 'coupled'],
        'The engine depends directly on SparkTrainer and RedisFeatureCache. Serving code cannot run without Spark classes on the classpath, and neither backend can be replaced or stubbed. Introduce ModelTrainer and FeatureStore interfaces.',
        [
          'Which classes in the diagram are infrastructure rather than domain?',
          'Could you unit-test serve() without Spark and Redis?',
        ],
        ['concrete dependency', 'infrastructure leak'],
      ),
      issue(
        'dbg-reco-engine-god', 3,
        ['el-reco-engine'],
        'Poor Encapsulation',
        ['public', 'weights', 'buckets', 'mutable', 'expose', 'encapsulation', 'state', 'race'],
        'modelWeights and experimentBuckets are public. Any caller can overwrite live model weights or reassign users between experiments mid-request. Make them private, publish immutable model snapshots, and expose only controlled operations.',
        [
          'Check the visibility of the attributes on RecommendationEngine.',
          'What happens if a controller overwrites modelWeights during serving?',
        ],
        ['public fields', 'exposed state'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['ModelTrainer', 'FeatureStore'],
      forbidDirectEdges: [{ from: 'RecommendationEngine', to: 'SparkTrainer' }, { from: 'RecommendationEngine', to: 'RedisFeatureCache' }],
      requireNoEditTo: ['UserProfile', 'Item'],
    },
  }),

  // 174 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-rate-limiter-hardcoded',
    title: 'Rate Limiter Algorithm',
    difficulty: 'hard',
    order: 174,
    description: 'Find why adding sliding-window limiting means rewriting the limiter and its storage wiring.',
    tags: ['rate-limiter', 'strategy', 'OCP', 'DIP'],
    nodes: [
      node('n1', 'el-rl-limiter', 'RateLimiter', pos(1, 1), [
        { name: 'allow', returnType: 'boolean', params: [{ name: 'clientId', type: 'String' }] },
        'refillTokens', 'consume',
      ], [
        { name: 'algorithm', type: 'String' },
      ]),
      node('n2', 'el-rl-gateway', 'ApiGateway', pos(0, 1), ['handleRequest']),
      node('n3', 'el-rl-bucket', 'TokenBucket', pos(2, 1), ['tryTake', 'refill']),
      node('n4', 'el-rl-quota', 'ClientQuota', pos(1, 0), ['getLimit', 'getWindow']),
      node('n5', 'el-rl-redis', 'RedisStore', pos(1, 2), ['incr', 'expire', 'get']),
      node('n6', 'el-rl-config', 'RateLimitConfig', pos(2, 0), ['load', 'reload']),
      node('n7', 'el-rl-metrics', 'MetricsEmitter', pos(0, 2), ['recordRejected']),
    ],
    edges: [
      edge('e1', 'ed-rl-gateway', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-rl-bucket', 'n1', 'n3', 'composition'),
      edge('e3', 'ed-rl-quota', 'n1', 'n4', 'association'),
      edge('e4', 'ed-rl-redis', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-rl-config', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-rl-metrics', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['RateLimiter', 'ApiGateway', 'TokenBucket', 'ClientQuota', 'RedisStore', 'RateLimitConfig', 'MetricsEmitter'],
      'RateLimiter',
      'allow, refillTokens, consume',
    ),
    requirement: requirement(3, 'limiting algorithms and storage are injected abstractions'),
    expectedIssues: [
      issue(
        'dbg-rate-limiter-hardcoded', 1,
        ['ed-rl-bucket', 'el-rl-bucket'],
        'DIP Violation',
        ['token bucket', 'concrete', 'abstraction', 'interface', 'algorithm', 'depend', 'RateLimitAlgorithm'],
        'RateLimiter owns a concrete TokenBucket and calls refillTokens and consume directly. The high-level policy depends on a low-level algorithm. Introduce a RateLimitAlgorithm interface (allow(key)) that TokenBucket, SlidingWindow, and LeakyBucket implement, and inject it.',
        [
          'What type does RateLimiter hold for the algorithm?',
          'Which interface is missing from the diagram?',
        ],
        ['depends on concrete', 'no abstraction'],
      ),
      issue(
        'dbg-rate-limiter-hardcoded', 2,
        ['el-rl-limiter'],
        'OCP Violation',
        ['algorithm', 'string', 'switch', 'if', 'sliding window', 'new', 'modify', 'extend'],
        'RateLimiter branches on an algorithm string and hardcodes token bucket logic in allow(). Supporting sliding-window or leaky-bucket limiting means editing this class and risking the existing path. New algorithms should be added as new RateLimitAlgorithm implementations with no changes to the limiter.',
        [
          'What is the algorithm attribute for, and what does allow do with it?',
          'What lines would change to add a sliding-window limiter?',
        ],
        ['open closed', 'conditional on algorithm'],
      ),
      issue(
        'dbg-rate-limiter-hardcoded', 3,
        ['ed-rl-redis', 'el-rl-redis'],
        'DIP Violation',
        ['redis', 'store', 'concrete', 'interface', 'storage', 'in-memory', 'test', 'abstraction'],
        'RateLimiter talks to RedisStore directly (incr, expire), so counters cannot live in memory for tests or in another backend for a different region. Depend on a CounterStore interface and let RedisStore implement it.',
        [
          'Can you unit-test the limiter without a Redis server?',
          'What would a storage-agnostic abstraction look like here?',
        ],
        ['concrete storage', 'infrastructure dependency'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['RateLimitAlgorithm', 'CounterStore'],
      forbidDirectEdges: [{ from: 'RateLimiter', to: 'TokenBucket' }, { from: 'RateLimiter', to: 'RedisStore' }],
      requireNoEditTo: ['ApiGateway'],
    },
  }),

  // 175 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-auth-token-hardcoded',
    title: 'Auth Token Validation',
    difficulty: 'hard',
    order: 175,
    description: 'Find why supporting opaque or OAuth tokens means rewriting AuthService, which also owns sessions and audit.',
    tags: ['auth', 'jwt', 'DIP', 'SRP'],
    nodes: [
      node('n1', 'el-auth-service', 'AuthService', pos(1, 1), [
        { name: 'validate', returnType: 'Principal', params: [{ name: 'token', type: 'String' }] },
        'parseJwt', 'verifySignature', 'checkExpiry', 'loadUser', 'cacheSession', 'writeAudit',
      ]),
      node('n2', 'el-auth-middleware', 'AuthMiddleware', pos(0, 1), ['handle']),
      node('n3', 'el-auth-users', 'UserRepository', pos(2, 1), ['findById']),
      node('n4', 'el-auth-jwtlib', 'JwtLibrary', pos(1, 0), ['decode', 'verify']),
      node('n5', 'el-auth-keystore', 'KeyStore', pos(2, 0), ['getPublicKey']),
      node('n6', 'el-auth-session', 'SessionCache', pos(2, 2), ['put', 'get']),
      node('n7', 'el-auth-audit', 'AuditLogger', pos(0, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-auth-middleware', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-auth-users', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-auth-jwt', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-auth-key', 'n4', 'n5', 'dependency'),
      edge('e5', 'ed-auth-session', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-auth-audit', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['AuthService', 'AuthMiddleware', 'UserRepository', 'JwtLibrary', 'KeyStore', 'SessionCache', 'AuditLogger'],
      'AuthService',
      'validate, parseJwt, verifySignature, checkExpiry, loadUser, cacheSession, writeAudit',
    ),
    requirement: requirement(3, 'token validation is pluggable and AuthService only coordinates'),
    expectedIssues: [
      issue(
        'dbg-auth-token-hardcoded', 1,
        ['ed-auth-jwt', 'el-auth-jwtlib'],
        'DIP Violation',
        ['jwt', 'concrete', 'token', 'strategy', 'interface', 'oauth', 'opaque', 'TokenStrategy'],
        'AuthService parses and verifies JWTs inline through JwtLibrary. Opaque tokens, API keys, or OAuth introspection cannot be added without editing it. Depend on a TokenStrategy (validate(token) -> Principal) and implement JwtTokenStrategy and others behind it.',
        [
          'Which format of token can AuthService handle today?',
          'What interface is missing between AuthService and JwtLibrary?',
        ],
        ['hardcoded jwt', 'missing token strategy'],
      ),
      issue(
        'dbg-auth-token-hardcoded', 2,
        ['el-auth-service'],
        'SRP Violation',
        ['validate', 'session', 'audit', 'user', 'signature', 'expiry', 'responsibility', 'multiple'],
        'AuthService verifies signatures, checks expiry, loads users, caches sessions, and writes audit entries. Cryptography, identity lookup, caching, and compliance logging change for different reasons. Keep token validation in strategies and move session and audit to decorators or separate collaborators.',
        [
          'Group the methods on AuthService by the kind of change that would trigger them.',
          'Which methods are purely about cryptographic validation?',
        ],
        ['mixed responsibilities', 'does too much'],
      ),
      issue(
        'dbg-auth-token-hardcoded', 3,
        ['ed-auth-middleware', 'el-auth-middleware'],
        'DIP Violation',
        ['middleware', 'concrete', 'AuthService', 'interface', 'authenticator', 'high-level', 'depend', 'test'],
        'AuthMiddleware depends on the concrete AuthService, so the request pipeline is tied to one authentication implementation and tests need the whole service graph. Depend on an Authenticator interface instead.',
        [
          'What does AuthMiddleware reference when it authenticates a request?',
          'Could you swap in a fake authenticator for tests?',
        ],
        ['middleware coupled to service', 'no authenticator abstraction'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['TokenStrategy', 'Authenticator'],
      forbidDirectEdges: [{ from: 'AuthService', to: 'JwtLibrary' }, { from: 'AuthMiddleware', to: 'AuthService' }],
      requireNoEditTo: ['UserRepository'],
    },
  }),

  // 176 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-mq-no-consumer-iface',
    title: 'Message Broker Delivery',
    difficulty: 'hard',
    order: 176,
    description: 'Find why adding a new delivery channel means editing the broker and the message type.',
    tags: ['messaging', 'broker', 'DIP', 'OCP'],
    nodes: [
      node('n1', 'el-mq-broker', 'MessageBroker', pos(1, 1), [
        { name: 'publish', params: [{ name: 'message', type: 'Message' }] },
        'deliver', 'retry',
      ]),
      node('n2', 'el-mq-producer', 'Producer', pos(0, 1), ['send']),
      node('n3', 'el-mq-message', 'Message', pos(1, 0), ['getChannel', 'getBody'], [
        { name: 'smtpSubject', type: 'String' },
        { name: 'phoneNumber', type: 'String' },
        { name: 'deviceToken', type: 'String' },
      ]),
      node('n4', 'el-mq-email', 'EmailSender', pos(2, 0), ['sendEmail']),
      node('n5', 'el-mq-sms', 'SmsSender', pos(2, 1), ['sendSms']),
      node('n6', 'el-mq-push', 'PushSender', pos(2, 2), ['sendPush']),
      node('n7', 'el-mq-dlq', 'DeadLetterQueue', pos(1, 2), ['park']),
    ],
    edges: [
      edge('e1', 'ed-mq-producer', 'n2', 'n1', 'dependency'),
      edge('e2', 'ed-mq-message', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-mq-email', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-mq-sms', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-mq-push', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-mq-dlq', 'n1', 'n7', 'association'),
    ],
    briefing: briefing(
      ['MessageBroker', 'Producer', 'Message', 'EmailSender', 'SmsSender', 'PushSender', 'DeadLetterQueue'],
      'MessageBroker',
      'publish, deliver, retry',
    ),
    requirement: requirement(3, 'consumers implement a shared interface and new channels need no broker changes'),
    expectedIssues: [
      issue(
        'dbg-mq-no-consumer-iface', 1,
        ['ed-mq-email', 'ed-mq-sms', 'ed-mq-push'],
        'DIP Violation',
        ['consumer', 'interface', 'concrete', 'abstraction', 'email', 'sms', 'push', 'depend'],
        'MessageBroker points directly at EmailSender, SmsSender, and PushSender. The delivery core depends on three low-level channel classes with no shared MessageConsumer abstraction. Define MessageConsumer (handle(message)) and have each sender implement it.',
        [
          'How many concrete sender types does the broker reference?',
          'What interface could all three senders share?',
        ],
        ['no consumer interface', 'depends on concretions'],
      ),
      issue(
        'dbg-mq-no-consumer-iface', 2,
        ['el-mq-message', 'el-mq-broker'],
        'Tight Coupling',
        ['message', 'smtp', 'phone', 'device', 'channel', 'fields', 'payload', 'coupled', 'format'],
        'Message carries smtpSubject, phoneNumber, and deviceToken, so the broker contract is shaped by every channel. Adding Slack means changing Message and every producer. Use a generic payload plus per-consumer adapters or typed message envelopes.',
        [
          'Look at the attributes on Message. Which channel does each belong to?',
          'Who has to change when a new channel adds its own field?',
        ],
        ['channel-specific fields', 'leaky message'],
      ),
      issue(
        'dbg-mq-no-consumer-iface', 3,
        ['el-mq-broker'],
        'OCP Violation',
        ['channel', 'switch', 'instanceof', 'if', 'new', 'extend', 'modify', 'deliver', 'register'],
        'deliver() branches on getChannel() to choose a sender. Every new channel adds another branch to the broker. Consumers should register themselves per topic or channel, and the broker should just dispatch to the registered MessageConsumer list.',
        [
          'Open deliver. How does it decide which sender to call?',
          'What must change in the broker to add a Slack channel?',
        ],
        ['open closed', 'type switch'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['MessageConsumer'],
      forbidDirectEdges: [
        { from: 'MessageBroker', to: 'EmailSender' },
        { from: 'MessageBroker', to: 'SmsSender' },
        { from: 'MessageBroker', to: 'PushSender' },
      ],
      requireNoEditTo: ['DeadLetterQueue'],
    },
  }),

  // 177 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-order-workflow-god',
    title: 'Order Workflow Hub',
    difficulty: 'hard',
    order: 177,
    description: 'Find why one OrderWorkflow drives state, stock, money, fulfilment, carriers, and notifications.',
    tags: ['workflow', 'god-object', 'coupling', 'encapsulation'],
    nodes: [
      node('n1', 'el-ow-workflow', 'OrderWorkflow', pos(1, 1), [
        'advanceState', 'reserveStock', 'authorizePayment', 'scheduleFulfillment', 'selectCarrier', 'notifyCustomer',
      ], [
        { name: 'retryCounts', type: 'Map<OrderId, Integer>' },
      ]),
      node('n2', 'el-ow-order', 'Order', pos(1, 0), ['getItems', 'getTotal'], [
        { name: 'status', type: 'String', visibility: 'public' },
      ]),
      node('n3', 'el-ow-inventory', 'InventoryDb', pos(0, 1), ['decrement', 'restock']),
      node('n4', 'el-ow-payment', 'PaymentGateway', pos(2, 1), ['authorize', 'capture']),
      node('n5', 'el-ow-warehouse', 'WarehouseSystem', pos(0, 2), ['createPickList']),
      node('n6', 'el-ow-carrier', 'FedExApi', pos(2, 2), ['createShipment', 'trackShipment']),
      node('n7', 'el-ow-email', 'EmailService', pos(0, 0), ['send']),
    ],
    edges: [
      edge('e1', 'ed-ow-order', 'n1', 'n2', 'association'),
      edge('e2', 'ed-ow-inventory', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-ow-payment', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-ow-warehouse', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-ow-carrier', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-ow-email', 'n1', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['OrderWorkflow', 'Order', 'InventoryDb', 'PaymentGateway', 'WarehouseSystem', 'FedExApi', 'EmailService'],
      'OrderWorkflow',
      'advanceState, reserveStock, authorizePayment, scheduleFulfillment, selectCarrier, notifyCustomer',
    ),
    requirement: requirement(3, 'the workflow only sequences steps and domain objects own their own state'),
    expectedIssues: [
      issue(
        'dbg-order-workflow-god', 1,
        ['el-ow-workflow'],
        'God Object',
        ['god', 'workflow', 'inventory', 'payment', 'fulfillment', 'carrier', 'notify', 'state machine', 'everything'],
        'OrderWorkflow owns the order state machine and also reserves stock, authorizes payment, schedules fulfilment, picks carriers, and sends notifications. Every business change funnels through this class. Extract step handlers (InventoryStep, PaymentStep, FulfillmentStep, NotificationStep) behind a common interface and keep the workflow as a sequencer.',
        [
          'How many different business domains does OrderWorkflow touch?',
          'If shipping rules change, do you edit the same class as when payment rules change?',
        ],
        ['god class', 'blob', 'hub class'],
      ),
      issue(
        'dbg-order-workflow-god', 2,
        ['ed-ow-payment', 'ed-ow-carrier', 'ed-ow-inventory', 'el-ow-carrier'],
        'Tight Coupling',
        ['concrete', 'fedex', 'vendor', 'interface', 'carrier', 'payment', 'inventory', 'coupled'],
        'The workflow calls InventoryDb, PaymentGateway, and a vendor-specific FedExApi directly. Changing carrier or payment provider means rewriting orchestration code. Depend on interfaces such as CarrierService, PaymentPort, and StockPort, with vendor classes as adapters.',
        [
          'Which class names in the diagram are vendor-specific?',
          'What would switching from FedEx to UPS touch?',
        ],
        ['concrete dependency', 'vendor lock-in'],
      ),
      issue(
        'dbg-order-workflow-god', 3,
        ['el-ow-order'],
        'Poor Encapsulation',
        ['status', 'public', 'string', 'transition', 'anemic', 'encapsulation', 'mutate', 'invalid'],
        'Order exposes a public status string that the workflow mutates freely. Nothing prevents invalid transitions such as delivered to pending. Make status private and enforce legal transitions inside Order using an OrderState type or guarded methods like markPaid() and markShipped().',
        [
          'Check the visibility and type of Order.status.',
          'Who prevents an order jumping from NEW straight to SHIPPED?',
        ],
        ['public status', 'anemic domain model'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['CarrierService', 'PaymentPort'],
      forbidDirectEdges: [{ from: 'OrderWorkflow', to: 'FedExApi' }],
      requireNoEditTo: ['EmailService'],
    },
  }),

  // 178 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-cms-no-plugin',
    title: 'CMS Extension Path',
    difficulty: 'hard',
    order: 178,
    description: 'Find why every new content type in the CMS is another subclass and another branch in the renderer.',
    tags: ['cms', 'plugin', 'OCP', 'inheritance'],
    nodes: [
      node('n1', 'el-cms-manager', 'ContentManager', pos(1, 1), [
        { name: 'render', returnType: 'String', params: [{ name: 'content', type: 'Content' }] },
        'publish', 'validate',
      ]),
      node('n2', 'el-cms-image', 'ImageContentManager', pos(0, 0), ['resize', 'generateThumbnail']),
      node('n3', 'el-cms-video', 'VideoContentManager', pos(1, 0), ['transcode', 'extractPoster']),
      node('n4', 'el-cms-form', 'FormContentManager', pos(2, 0), ['validateFields', 'storeSubmission']),
      node('n5', 'el-cms-repo', 'ContentRepository', pos(0, 1), ['save', 'findBySlug']),
      node('n6', 'el-cms-renderer', 'TemplateRenderer', pos(2, 1), [
        'renderPage', 'renderImageBlock', 'renderVideoBlock', 'renderFormBlock',
      ]),
      node('n7', 'el-cms-admin', 'AdminUI', pos(0, 2), ['editContent']),
    ],
    edges: [
      edge('e1', 'ed-cms-image-inherit', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-cms-video-inherit', 'n3', 'n1', 'inheritance'),
      edge('e3', 'ed-cms-form-inherit', 'n4', 'n1', 'inheritance'),
      edge('e4', 'ed-cms-manager-repo', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-cms-manager-renderer', 'n1', 'n6', 'dependency'),
      edge('e6', 'ed-cms-admin-manager', 'n7', 'n1', 'dependency'),
    ],
    briefing: briefing(
      ['ContentManager', 'ImageContentManager', 'VideoContentManager', 'FormContentManager', 'ContentRepository', 'TemplateRenderer', 'AdminUI'],
      'ContentManager',
      'render, publish, validate',
    ),
    requirement: requirement(3, 'new content types are added as plugins without editing existing classes'),
    expectedIssues: [
      issue(
        'dbg-cms-no-plugin', 1,
        ['el-cms-manager'],
        'OCP Violation',
        ['plugin', 'extend', 'modify', 'new content type', 'hook', 'extension point', 'register', 'closed'],
        'ContentManager has no extension point. New capabilities arrive only by subclassing it or editing render, publish, and validate. Add a CmsPlugin interface with hooks (canHandle, render, validate) and let the manager discover registered plugins.',
        [
          'How would a third-party add an audio content type today?',
          'Is there any place in ContentManager where new behaviour can be registered?',
        ],
        ['no extension point', 'open closed'],
      ),
      issue(
        'dbg-cms-no-plugin', 2,
        ['el-cms-image', 'el-cms-video', 'el-cms-form', 'ed-cms-image-inherit', 'ed-cms-video-inherit', 'ed-cms-form-inherit'],
        'Pattern Misuse',
        ['inheritance', 'subclass', 'plugin', 'composition', 'combination', 'explosion', 'strategy', 'decorator'],
        'Image, Video, and Form handling are implemented as subclasses of ContentManager. A page with a video and a form needs a combined subclass, causing a class explosion, and each type forces a new manager instead of a new capability. Replace the hierarchy with plugins composed into one ContentManager.',
        [
          'What would you need to build a page that contains both a video and a form?',
          'Do ImageContentManager and VideoContentManager represent different kinds of manager or different capabilities?',
        ],
        ['inheritance explosion', 'subclass instead of plugin'],
      ),
      issue(
        'dbg-cms-no-plugin', 3,
        ['el-cms-renderer', 'ed-cms-manager-renderer'],
        'OCP Violation',
        ['renderer', 'block', 'type', 'switch', 'per type', 'new', 'modify', 'template'],
        'TemplateRenderer has a renderImageBlock, renderVideoBlock, and renderFormBlock method, and presumably a switch on content type. Each new type forces another method here. Let each plugin supply a BlockRenderer, and have TemplateRenderer delegate to whichever is registered.',
        [
          'Read the method names on TemplateRenderer. What pattern do they follow?',
          'What must change in the renderer when a new content type ships?',
        ],
        ['type switch in renderer', 'per-type methods'],
      ),
    ],
    verification: {
      mustIntroduceElementNames: ['CmsPlugin'],
      forbidDirectEdges: [{ from: 'ImageContentManager', to: 'ContentManager' }],
      requireNoEditTo: ['ContentRepository', 'AdminUI'],
    },
  }),
]
