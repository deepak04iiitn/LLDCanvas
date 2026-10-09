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

export const HARD_B: DebuggerPackSeed[] = [
  // 179 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-api-gateway-god',
    title: 'API Gateway Duties',
    difficulty: 'hard',
    order: 179,
    description: 'Find why one gateway class owns auth, throttling, routing, resilience and logging all at once.',
    tags: ['gateway', 'god-object', 'microservices', 'resilience'],
    nodes: [
      node('n1', 'el-jwt-verifier', 'JwtVerifier', pos(0, 0), ['verify', 'parseClaims']),
      node('n2', 'el-redis-counter', 'RedisCounter', pos(1, 0), ['increment', 'expire']),
      node('n3', 'el-service-registry', 'ServiceRegistry', pos(2, 0), ['lookup', 'register']),
      node('n4', 'el-client', 'ApiClient', pos(0, 1), ['sendRequest']),
      node('n5', 'el-gateway', 'ApiGateway', pos(1, 1),
        ['authenticate', 'rateLimit', 'transformRequest', 'discoverService', 'balanceLoad', 'logRequest', 'callWithBreaker'],
        [
          { name: 'failureCount', type: 'int', visibility: 'public' },
          { name: 'breakerOpen', type: 'boolean', visibility: 'public' },
        ]),
      node('n6', 'el-order-service', 'OrderService', pos(2, 1), ['createOrder', 'getOrder']),
      node('n7', 'el-file-logger', 'FileLogger', pos(1, 2), ['writeLine']),
    ],
    edges: [
      edge('e1', 'ed-client-gateway', 'n4', 'n5', 'dependency'),
      edge('e2', 'ed-gateway-jwt', 'n5', 'n1', 'dependency'),
      edge('e3', 'ed-gateway-redis', 'n5', 'n2', 'dependency'),
      edge('e4', 'ed-gateway-registry', 'n5', 'n3', 'dependency'),
      edge('e5', 'ed-gateway-order', 'n5', 'n6', 'dependency'),
      edge('e6', 'ed-gateway-logger', 'n5', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['ApiClient', 'ApiGateway', 'JwtVerifier', 'RedisCounter', 'ServiceRegistry', 'OrderService', 'FileLogger'],
      'ApiGateway',
      'authenticate, rateLimit, transformRequest, discoverService, balanceLoad, logRequest, callWithBreaker',
    ),
    requirement: requirement(4, 'the gateway only orchestrates a pipeline of focused collaborators behind abstractions'),
    expectedIssues: [
      issue(
        'dbg-api-gateway-god', 1,
        ['el-gateway'],
        'God Object',
        ['gateway', 'authenticate', 'rate', 'transform', 'discover', 'balance', 'breaker', 'log', 'too many', 'responsibilities'],
        'ApiGateway performs authentication, rate limiting, transformation, service discovery, load balancing, logging and circuit breaking itself. Split these into focused filters/components and let the gateway only chain them.',
        [
          'Count how many unrelated verbs appear in ApiGateway.',
          'Which of those methods would be owned by a different team in a real platform?',
        ],
        ['too many responsibilities', 'god class'],
      ),
      issue(
        'dbg-api-gateway-god', 2,
        ['ed-gateway-jwt', 'ed-gateway-redis', 'ed-gateway-logger'],
        'Tight Coupling',
        ['concrete', 'jwt', 'redis', 'file', 'logger', 'swap', 'hard-coded', 'coupled'],
        'The gateway depends directly on concrete JwtVerifier, RedisCounter and FileLogger, so changing token format, counter store or log sink forces edits to the gateway.',
        [
          'Which edges point to concrete infrastructure classes rather than roles?',
          'What would change if rate limiting moved from Redis to in-memory?',
        ],
      ),
      issue(
        'dbg-api-gateway-god', 3,
        ['el-gateway', 'ed-gateway-registry'],
        'Poor Encapsulation',
        ['public', 'failureCount', 'breakerOpen', 'state', 'expose', 'mutable', 'circuit'],
        'Circuit breaker state (failureCount, breakerOpen) is public on the gateway, so any caller can flip it. Move it into a dedicated CircuitBreaker that guards its own state.',
        [
          'Look at attribute visibility on ApiGateway.',
          'Who should be allowed to open or close a breaker?',
        ],
      ),
      issue(
        'dbg-api-gateway-god', 4,
        ['ed-gateway-order'],
        'Tight Coupling',
        ['order', 'direct', 'route', 'static', 'downstream', 'hard-coded', 'service'],
        'The gateway has a direct edge to OrderService, hard-wiring downstream routing. Routes should be resolved through discovery/configuration so new services need no gateway change.',
        [
          'What happens to the gateway when you add a PaymentService?',
          'Which edge bypasses ServiceRegistry?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['OrderService'] },
  }),

  // 180 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-ml-pipeline-no-stage',
    title: 'ML Pipeline Stages',
    difficulty: 'hard',
    order: 180,
    description: 'Find why every new ML pipeline step requires editing one monolithic class.',
    tags: ['ml', 'pipeline', 'OCP', 'coupling'],
    nodes: [
      node('n1', 'el-data-source', 'CsvDataSource', pos(0, 0), ['readRows']),
      node('n2', 'el-feature-store', 'FeatureStore', pos(1, 0), ['save', 'load']),
      node('n3', 'el-metrics-reporter', 'MetricsReporter', pos(2, 0), ['report']),
      node('n4', 'el-trainer-app', 'TrainingJob', pos(0, 1), ['run']),
      node('n5', 'el-ml-pipeline', 'MLPipeline', pos(1, 1),
        ['preprocess', 'extractFeatures', 'train', 'evaluate', 'serve'],
        [
          { name: 'modelType', type: 'String', visibility: 'public' },
          { name: 'model', type: 'SklearnModel', visibility: 'public' },
        ]),
      node('n6', 'el-sklearn-model', 'SklearnModel', pos(2, 1), ['fit', 'predict']),
      node('n7', 'el-model-server', 'ModelServer', pos(1, 2), ['deploy', 'handleRequest']),
    ],
    edges: [
      edge('e1', 'ed-job-pipeline', 'n4', 'n5', 'dependency'),
      edge('e2', 'ed-pipeline-source', 'n5', 'n1', 'dependency'),
      edge('e3', 'ed-pipeline-features', 'n5', 'n2', 'dependency'),
      edge('e4', 'ed-pipeline-metrics', 'n5', 'n3', 'dependency'),
      edge('e5', 'ed-pipeline-model', 'n5', 'n6', 'composition'),
      edge('e6', 'ed-pipeline-server', 'n5', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['TrainingJob', 'MLPipeline', 'CsvDataSource', 'FeatureStore', 'MetricsReporter', 'SklearnModel', 'ModelServer'],
      'MLPipeline',
      'preprocess, extractFeatures, train, evaluate, serve',
    ),
    requirement: requirement(3, 'new pipeline steps can be added as separate stages without editing the pipeline orchestrator'),
    expectedIssues: [
      issue(
        'dbg-ml-pipeline-no-stage', 1,
        ['el-ml-pipeline'],
        'OCP Violation',
        ['stage', 'step', 'new', 'modify', 'edit', 'interface', 'extend', 'if', 'switch', 'modelType'],
        'MLPipeline hard-codes preprocess, feature, train, evaluate and serve inline and branches on modelType. Adding a stage or algorithm means editing this class. Introduce a PipelineStage interface and compose stages.',
        [
          'What must you edit to add a data-validation step before training?',
          'What does the public modelType string hint at inside train()?',
        ],
        ['open closed', 'not extensible'],
      ),
      issue(
        'dbg-ml-pipeline-no-stage', 2,
        ['ed-pipeline-model', 'ed-pipeline-server', 'el-sklearn-model'],
        'Tight Coupling',
        ['sklearn', 'concrete', 'composition', 'model', 'server', 'hard-coded', 'swap', 'coupled'],
        'The pipeline owns a concrete SklearnModel via composition and talks straight to ModelServer. Swapping the framework or deployment target requires rewriting the pipeline. Depend on Model/Deployer abstractions.',
        [
          'Which framework is baked into the pipeline by a composition edge?',
          'Could you run the same pipeline with a PyTorch model today?',
        ],
      ),
      issue(
        'dbg-ml-pipeline-no-stage', 3,
        ['el-ml-pipeline', 'ed-job-pipeline'],
        'Poor Encapsulation',
        ['public', 'model', 'modelType', 'expose', 'mutable', 'state', 'encapsulation'],
        'MLPipeline exposes model and modelType publicly, so TrainingJob and others can mutate pipeline internals between stages. Keep them private and expose a controlled API.',
        [
          'Check the visibility of attributes on MLPipeline.',
          'Who could replace the model after training but before evaluation?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['CsvDataSource'] },
  }),

  // 181 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-notif-fanout-no-observer',
    title: 'Notification Fanout Wiring',
    difficulty: 'hard',
    order: 181,
    description: 'Find why the notification service has to know every delivery channel by name.',
    tags: ['notifications', 'observer', 'DIP', 'OCP'],
    nodes: [
      node('n1', 'el-order-service', 'OrderService', pos(0, 1), ['placeOrder', 'cancelOrder']),
      node('n2', 'el-notification-service', 'NotificationService', pos(1, 1),
        ['notifyAll', 'sendEmail', 'sendSms', 'sendPush', 'sendSlack'],
        [
          { name: 'email', type: 'EmailSender' },
          { name: 'sms', type: 'SmsSender' },
          { name: 'push', type: 'PushSender' },
          { name: 'slack', type: 'SlackSender' },
          { name: 'whatsapp', type: 'WhatsAppSender' },
          { name: 'telegram', type: 'TelegramSender' },
          { name: 'webhook', type: 'WebhookSender' },
          { name: 'inApp', type: 'InAppSender' },
        ]),
      node('n3', 'el-email-sender', 'EmailSender', pos(2, 0), ['send']),
      node('n4', 'el-sms-sender', 'SmsSender', pos(2, 1), ['send']),
      node('n5', 'el-push-sender', 'PushSender', pos(2, 2), ['send']),
      node('n6', 'el-slack-sender', 'SlackSender', pos(1, 2), ['post']),
      node('n7', 'el-user-prefs', 'UserPreferences', pos(1, 0), ['enabledChannels']),
    ],
    edges: [
      edge('e1', 'ed-order-notif', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-notif-email', 'n2', 'n3', 'composition'),
      edge('e3', 'ed-notif-sms', 'n2', 'n4', 'composition'),
      edge('e4', 'ed-notif-push', 'n2', 'n5', 'composition'),
      edge('e5', 'ed-notif-slack', 'n2', 'n6', 'composition'),
      edge('e6', 'ed-notif-prefs', 'n2', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['OrderService', 'NotificationService', 'EmailSender', 'SmsSender', 'PushSender', 'SlackSender', 'UserPreferences'],
      'NotificationService',
      'notifyAll, sendEmail, sendSms, sendPush, sendSlack',
    ),
    requirement: requirement(3, 'channels subscribe to events through an abstraction and new channels need no service edits'),
    expectedIssues: [
      issue(
        'dbg-notif-fanout-no-observer', 1,
        ['ed-notif-email', 'ed-notif-sms', 'ed-notif-push', 'ed-notif-slack'],
        'DIP Violation',
        ['concrete', 'interface', 'abstraction', 'sender', 'channel', 'depend', 'composition'],
        'NotificationService owns eight concrete sender classes. High-level policy depends on low-level details. Introduce a NotificationChannel interface and depend on that.',
        [
          'What type does each attribute in NotificationService have?',
          'Is there any shared interface between EmailSender and SmsSender?',
        ],
        ['dependency inversion'],
      ),
      issue(
        'dbg-notif-fanout-no-observer', 2,
        ['el-notification-service'],
        'OCP Violation',
        ['new channel', 'add', 'modify', 'edit', 'notifyAll', 'observer', 'subscribe', 'extend'],
        'Adding a ninth channel means adding a field and editing notifyAll. A subscriber list (Observer) would let new channels register without modifying the service.',
        [
          'What must change in notifyAll to support Discord?',
          'Which pattern lets listeners register themselves?',
        ],
        ['open closed'],
      ),
      issue(
        'dbg-notif-fanout-no-observer', 3,
        ['ed-order-notif', 'el-order-service'],
        'Tight Coupling',
        ['order', 'direct', 'notification', 'event', 'publish', 'coupled', 'publisher'],
        'OrderService calls NotificationService directly, so order logic is tied to the notification subsystem. Publish domain events and let notification code subscribe.',
        [
          'Why should placing an order know how messages get delivered?',
          'What would a domain event bus change about that edge?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['UserPreferences'] },
  }),

  // 182 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-inventory-restock-saga',
    title: 'Inventory Restock Saga',
    difficulty: 'hard',
    order: 182,
    description: 'Find why a multi-service restock flow can leave money charged and stock unreserved.',
    tags: ['saga', 'distributed', 'compensation', 'coupling'],
    nodes: [
      node('n1', 'el-stock-monitor', 'StockMonitor', pos(0, 1), ['checkLevels', 'triggerRestock']),
      node('n2', 'el-restock-saga', 'RestockSaga', pos(1, 0), ['execute', 'onStepDone']),
      node('n3', 'el-inventory-service', 'InventoryService', pos(1, 1),
        ['restock', 'orderFromSupplier', 'reserveSpace', 'payInvoice']),
      node('n4', 'el-supplier-client', 'SupplierClient', pos(2, 0), ['placeOrder', 'cancelOrder']),
      node('n5', 'el-warehouse-service', 'WarehouseService', pos(2, 1), ['reserveBay', 'releaseBay']),
      node('n6', 'el-finance-service', 'FinanceService', pos(2, 2), ['charge', 'refund'],
        [{ name: 'balance', type: 'Money', visibility: 'public' }]),
    ],
    edges: [
      edge('e1', 'ed-monitor-inventory', 'n1', 'n3', 'dependency'),
      edge('e2', 'ed-inventory-saga', 'n3', 'n2', 'association'),
      edge('e3', 'ed-inventory-supplier', 'n3', 'n4', 'dependency'),
      edge('e4', 'ed-inventory-warehouse', 'n3', 'n5', 'dependency'),
      edge('e5', 'ed-inventory-finance', 'n3', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['StockMonitor', 'RestockSaga', 'InventoryService', 'SupplierClient', 'WarehouseService', 'FinanceService'],
      'InventoryService',
      'restock, orderFromSupplier, reserveSpace, payInvoice',
    ),
    requirement: requirement(3, 'a failed step compensates earlier steps and InventoryService no longer drives each remote service directly'),
    expectedIssues: [
      issue(
        'dbg-inventory-restock-saga', 1,
        ['el-restock-saga', 'ed-inventory-saga'],
        'Pattern Misuse',
        ['saga', 'compensat', 'rollback', 'undo', 'cancel', 'refund', 'release', 'forward only'],
        'RestockSaga only has execute and onStepDone, with no compensating actions, and InventoryService bypasses it. A saga must define a compensation for every step so failures roll back supplier, warehouse and finance work.',
        [
          'What does RestockSaga offer for the failure path?',
          'SupplierClient has cancelOrder and FinanceService has refund. Who ever calls them?',
        ],
        ['saga without compensation', 'no rollback'],
      ),
      issue(
        'dbg-inventory-restock-saga', 2,
        ['ed-inventory-supplier', 'ed-inventory-warehouse', 'ed-inventory-finance'],
        'Tight Coupling',
        ['supplier', 'warehouse', 'finance', 'direct', 'orchestrat', 'coupled', 'three services', 'sequence'],
        'InventoryService calls supplier, warehouse and finance directly and in a fixed sequence. It knows each protocol and ordering, so changing a step or adding one means editing it. Delegate orchestration to the saga.',
        [
          'How many remote services does InventoryService talk to directly?',
          'What if the warehouse call fails after payment succeeded?',
        ],
      ),
      issue(
        'dbg-inventory-restock-saga', 3,
        ['el-finance-service'],
        'Poor Encapsulation',
        ['balance', 'public', 'expose', 'mutate', 'money', 'encapsulation', 'invariant'],
        'FinanceService exposes balance publicly, so callers can adjust money without going through charge/refund and without audit or invariants.',
        [
          'Inspect the attributes of FinanceService.',
          'Can a caller change the balance without calling charge?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['StockMonitor'] },
  }),

  // 183 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-connection-pool-god',
    title: 'DB Connection Pool Scope',
    difficulty: 'hard',
    order: 183,
    description: 'Find why the connection pool handles creation, health, eviction, routing and recycling all by itself.',
    tags: ['database', 'pool', 'god-object', 'SRP'],
    nodes: [
      node('n1', 'el-replica-config', 'ReplicaConfig', pos(1, 0), ['getReadHosts', 'getWriteHost']),
      node('n2', 'el-metrics-sink', 'MetricsSink', pos(2, 0), ['record']),
      node('n3', 'el-app-service', 'ReportService', pos(0, 1), ['runReport', 'resizePool', 'evictIdle', 'recycleAll']),
      node('n4', 'el-connection-pool', 'ConnectionPool', pos(1, 1),
        ['createConnection', 'healthCheck', 'evictStale', 'routeQuery', 'recycle', 'borrow', 'release']),
      node('n5', 'el-pg-connection', 'PgConnection', pos(2, 1), ['execute', 'close', 'isAlive']),
      node('n6', 'el-leak-detector', 'LeakDetector', pos(1, 2), ['track', 'report']),
    ],
    edges: [
      edge('e1', 'ed-app-pool', 'n3', 'n4', 'dependency'),
      edge('e2', 'ed-pool-replica', 'n4', 'n1', 'dependency'),
      edge('e3', 'ed-pool-metrics', 'n4', 'n2', 'dependency'),
      edge('e4', 'ed-pool-pg', 'n4', 'n5', 'composition'),
      edge('e5', 'ed-pool-leak', 'n4', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['ReportService', 'ConnectionPool', 'ReplicaConfig', 'MetricsSink', 'PgConnection', 'LeakDetector'],
      'ConnectionPool',
      'createConnection, healthCheck, evictStale, routeQuery, recycle, borrow, release',
    ),
    requirement: requirement(3, 'pool lifecycle, health and routing are separate concerns and callers only borrow and release connections'),
    expectedIssues: [
      issue(
        'dbg-connection-pool-god', 1,
        ['el-connection-pool'],
        'God Object',
        ['pool', 'create', 'health', 'evict', 'route', 'recycle', 'too many', 'responsibilities'],
        'ConnectionPool creates connections, health-checks them, evicts stale ones, routes queries to replicas and recycles them. Extract a factory, a health monitor, an eviction policy and a router so the pool just manages borrow/release.',
        [
          'List every verb in ConnectionPool. Do they share a single reason to change?',
          'Which of them concern replicas rather than pooling?',
        ],
        ['god class'],
      ),
      issue(
        'dbg-connection-pool-god', 2,
        ['el-app-service', 'ed-app-pool'],
        'SRP Violation',
        ['report', 'resize', 'evict', 'recycle', 'infrastructure', 'business', 'mix', 'single responsibility'],
        'ReportService runs business reports and also resizes, evicts and recycles the pool. Infrastructure tuning does not belong in a business service; it should live in pool management or ops code.',
        [
          'Why does a report generator call recycleAll?',
          'Which methods in ReportService have nothing to do with reports?',
        ],
        ['mixed concerns'],
      ),
      issue(
        'dbg-connection-pool-god', 3,
        ['ed-pool-pg', 'ed-pool-replica'],
        'Tight Coupling',
        ['postgres', 'pg', 'concrete', 'composition', 'replica', 'driver', 'swap', 'coupled'],
        'The pool is composed of concrete PgConnection and reads replica config itself for routing. Supporting another driver or routing policy requires editing the pool. Depend on a Connection interface and a Router.',
        [
          'Could this pool manage MySQL connections without changing code?',
          'Which edge ties routing decisions to replica config inside the pool?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['MetricsSink'] },
  }),

  // 184 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-game-entity-no-ecs',
    title: 'Game Entity Responsibilities',
    difficulty: 'hard',
    order: 184,
    description: 'Find why every game object carries rendering, physics, animation, saving and AI in one class.',
    tags: ['game', 'ecs', 'god-object', 'OCP'],
    nodes: [
      node('n1', 'el-game-world', 'GameWorld', pos(0, 1), ['update', 'spawn', 'despawn']),
      node('n2', 'el-entity', 'Entity', pos(1, 1),
        ['render', 'checkCollision', 'animate', 'saveToDisk', 'runAI'],
        [{ name: 'hitbox', type: 'Rect', visibility: 'public' }]),
      node('n3', 'el-sprite-sheet', 'SpriteSheet', pos(2, 0), ['frame']),
      node('n4', 'el-save-file', 'SaveFile', pos(2, 1), ['write', 'read']),
      node('n5', 'el-player', 'Player', pos(0, 2), ['handleInput', 'runAI']),
      node('n6', 'el-enemy', 'Enemy', pos(1, 2), ['runAI', 'saveToDisk', 'animate']),
      node('n7', 'el-ai-planner', 'AiPlanner', pos(2, 2), ['planPath']),
    ],
    edges: [
      edge('e1', 'ed-world-entity', 'n1', 'n2', 'aggregation'),
      edge('e2', 'ed-entity-sprite', 'n2', 'n3', 'dependency'),
      edge('e3', 'ed-entity-save', 'n2', 'n4', 'dependency'),
      edge('e4', 'ed-player-entity', 'n5', 'n2', 'inheritance'),
      edge('e5', 'ed-enemy-entity', 'n6', 'n2', 'inheritance'),
      edge('e6', 'ed-enemy-ai', 'n6', 'n7', 'dependency'),
    ],
    briefing: briefing(
      ['GameWorld', 'Entity', 'SpriteSheet', 'SaveFile', 'Player', 'Enemy', 'AiPlanner'],
      'Entity',
      'render, checkCollision, animate, saveToDisk, runAI',
    ),
    requirement: requirement(3, 'entities are composed from small components instead of one bloated base class'),
    expectedIssues: [
      issue(
        'dbg-game-entity-no-ecs', 1,
        ['el-entity'],
        'God Object',
        ['entity', 'render', 'collide', 'animate', 'persist', 'save', 'ai', 'too many', 'responsibilities'],
        'Entity renders, handles collision, animates, persists itself and runs AI. Split into components (Renderable, Collider, Animator, Persistable, Brain) managed by systems.',
        [
          'Which subsystems of a game engine are mentioned in one class?',
          'Would a rock need runAI or saveToDisk?',
        ],
        ['god class', 'bloated base class'],
      ),
      issue(
        'dbg-game-entity-no-ecs', 2,
        ['el-entity', 'ed-player-entity', 'ed-enemy-entity'],
        'OCP Violation',
        ['subclass', 'new behavior', 'extend', 'ecs', 'component', 'modify', 'override', 'inheritance'],
        'Every new behavior combination forces a new subclass or edits to Entity itself. An entity-component system lets behaviors be added by composition without touching the base class.',
        [
          'How would you build a flying, invulnerable, non-saved enemy today?',
          'What would composition give you that deep inheritance does not?',
        ],
        ['open closed', 'missing ecs'],
      ),
      issue(
        'dbg-game-entity-no-ecs', 3,
        ['ed-enemy-entity', 'el-enemy'],
        'Incorrect Inheritance',
        ['enemy', 'liskov', 'saveToDisk', 'override', 'no-op', 'substitut', 'is-a'],
        'Enemy inherits saveToDisk and animate but overrides them to do nothing or something different, breaking substitutability. Enemies should not inherit capabilities they do not have.',
        [
          'Which Enemy methods override base behavior to disable it?',
          'Can code that calls saveToDisk on any Entity trust the result?',
        ],
        ['liskov violation'],
      ),
    ],
    verification: { requireNoEditTo: ['SpriteSheet'] },
  }),

  // 185 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-fraud-rules-mixed',
    title: 'Fraud Detection Blend',
    difficulty: 'hard',
    order: 185,
    description: 'Find why rules, persistence, scoring, case handling and alerting are tangled in one detector.',
    tags: ['fraud', 'rules', 'god-object', 'OCP'],
    nodes: [
      node('n1', 'el-rule-config', 'RuleConfig', pos(1, 0), ['getThreshold']),
      node('n2', 'el-payment-service', 'PaymentService', pos(0, 1), ['authorize']),
      node('n3', 'el-fraud-detector', 'FraudDetector', pos(1, 1),
        ['checkVelocity', 'checkGeo', 'checkAmount', 'loadHistory', 'computeScore', 'openCase', 'sendAlert']),
      node('n4', 'el-sql-tx-db', 'SqlTransactionDb', pos(2, 0), ['queryByCard', 'insertCase']),
      node('n5', 'el-alert-mailer', 'AlertMailer', pos(2, 1), ['sendEmail']),
      node('n6', 'el-risk-model', 'RiskModel', pos(1, 2), ['score']),
    ],
    edges: [
      edge('e1', 'ed-payment-detector', 'n2', 'n3', 'dependency'),
      edge('e2', 'ed-detector-config', 'n3', 'n1', 'dependency'),
      edge('e3', 'ed-detector-db', 'n3', 'n4', 'dependency'),
      edge('e4', 'ed-detector-mailer', 'n3', 'n5', 'dependency'),
      edge('e5', 'ed-detector-model', 'n3', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['PaymentService', 'FraudDetector', 'RuleConfig', 'SqlTransactionDb', 'AlertMailer', 'RiskModel'],
      'FraudDetector',
      'checkVelocity, checkGeo, checkAmount, loadHistory, computeScore, openCase, sendAlert',
    ),
    requirement: requirement(3, 'rules plug in through a common interface and detection, case handling and alerting are separate'),
    expectedIssues: [
      issue(
        'dbg-fraud-rules-mixed', 1,
        ['el-fraud-detector'],
        'God Object',
        ['detector', 'rules', 'database', 'score', 'case', 'alert', 'too many', 'responsibilities'],
        'FraudDetector evaluates rules, loads history, computes the score, opens cases and sends alerts. Separate rule evaluation, scoring, case management and notification into their own classes.',
        [
          'Which methods are about detecting versus reacting to fraud?',
          'Which methods touch persistence?',
        ],
        ['god class'],
      ),
      issue(
        'dbg-fraud-rules-mixed', 2,
        ['el-fraud-detector', 'ed-detector-config'],
        'OCP Violation',
        ['rule', 'interface', 'new rule', 'checkVelocity', 'checkGeo', 'if', 'modify', 'extend', 'strategy'],
        'Each rule is a hard-coded checkX method in the detector. A new rule means editing FraudDetector. Define a FraudRule interface and inject a list of rules.',
        [
          'What would you edit to add a device-fingerprint check?',
          'What common abstraction is missing between checkVelocity, checkGeo and checkAmount?',
        ],
        ['missing rule interface', 'open closed'],
      ),
      issue(
        'dbg-fraud-rules-mixed', 3,
        ['ed-detector-db', 'ed-detector-mailer'],
        'DIP Violation',
        ['sql', 'mailer', 'concrete', 'interface', 'repository', 'depend', 'abstraction', 'inversion'],
        'The detector depends on concrete SqlTransactionDb and AlertMailer. Policy code should depend on TransactionRepository and AlertSender interfaces so storage and channels can change freely.',
        [
          'Which edges lead to infrastructure classes by name?',
          'How would you unit test FraudDetector without a SQL database?',
        ],
        ['dependency inversion'],
      ),
    ],
    verification: { requireNoEditTo: ['PaymentService'] },
  }),

  // 186 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-shipment-no-state',
    title: 'Supply Chain Shipment States',
    difficulty: 'hard',
    order: 186,
    description: 'Find why shipment lifecycle logic is a growing if/else on a status value with notifications mixed in.',
    tags: ['state', 'supply-chain', 'SRP', 'pattern-misuse'],
    nodes: [
      node('n1', 'el-shipment-status', 'ShipmentStatus', pos(1, 0), ['values'],
        [
          { name: 'CREATED', type: 'int', visibility: 'public' },
          { name: 'IN_TRANSIT', type: 'int', visibility: 'public' },
          { name: 'DELIVERED', type: 'int', visibility: 'public' },
        ]),
      node('n2', 'el-customer-notifier', 'CustomerNotifier', pos(2, 0), ['sendSms', 'sendEmail']),
      node('n3', 'el-ship-controller', 'ShipmentController', pos(0, 1), ['markShipped', 'markDelivered', 'forceStatus']),
      node('n4', 'el-shipment', 'Shipment', pos(1, 1),
        ['advance', 'cancel', 'notifyCustomer', 'notifyCarrier', 'notifyWarehouse'],
        [{ name: 'status', type: 'int', visibility: 'public' }]),
      node('n5', 'el-carrier-api', 'CarrierApi', pos(2, 1), ['book', 'cancelBooking']),
      node('n6', 'el-warehouse-system', 'WarehouseSystem', pos(2, 2), ['releaseStock', 'receive']),
    ],
    edges: [
      edge('e1', 'ed-ctrl-shipment', 'n3', 'n4', 'dependency'),
      edge('e2', 'ed-ctrl-status', 'n3', 'n1', 'dependency'),
      edge('e3', 'ed-shipment-status', 'n4', 'n1', 'association'),
      edge('e4', 'ed-shipment-customer', 'n4', 'n2', 'dependency'),
      edge('e5', 'ed-shipment-carrier', 'n4', 'n5', 'dependency'),
      edge('e6', 'ed-shipment-warehouse', 'n4', 'n6', 'dependency'),
    ],
    briefing: briefing(
      ['ShipmentController', 'Shipment', 'ShipmentStatus', 'CustomerNotifier', 'CarrierApi', 'WarehouseSystem'],
      'Shipment',
      'advance, cancel, notifyCustomer, notifyCarrier, notifyWarehouse',
    ),
    requirement: requirement(3, 'each lifecycle state owns its transitions and notifications are triggered outside Shipment'),
    expectedIssues: [
      issue(
        'dbg-shipment-no-state', 1,
        ['el-shipment', 'ed-shipment-status', 'el-shipment-status'],
        'Pattern Misuse',
        ['state', 'enum', 'if', 'else', 'switch', 'status', 'transition', 'int', 'polymorphism'],
        'Shipment tracks lifecycle with an int status and long if/else chains in advance() and cancel(). This is a State pattern problem: each state should be an object that knows its valid transitions.',
        [
          'What does advance() have to do for every status value?',
          'How many methods would change if you added a RETURNED state?',
        ],
        ['missing state pattern', 'enum branching'],
      ),
      issue(
        'dbg-shipment-no-state', 2,
        ['el-shipment', 'ed-shipment-customer', 'ed-shipment-carrier', 'ed-shipment-warehouse'],
        'SRP Violation',
        ['notify', 'customer', 'carrier', 'warehouse', 'lifecycle', 'mix', 'single responsibility'],
        'Shipment manages its own lifecycle and also notifies the customer, carrier and warehouse. Move side effects to listeners or state-transition hooks so Shipment has one reason to change.',
        [
          'Why does a Shipment know about sendSms?',
          'Which three outside systems does Shipment contact directly?',
        ],
        ['mixed concerns'],
      ),
      issue(
        'dbg-shipment-no-state', 3,
        ['el-ship-controller', 'ed-ctrl-status'],
        'Poor Encapsulation',
        ['forceStatus', 'public', 'status', 'bypass', 'invalid transition', 'set', 'encapsulation'],
        'Status is a public int and ShipmentController can set it with forceStatus, bypassing transition rules. Hide the state and let only the lifecycle API change it.',
        [
          'Which method on the controller can jump to any status?',
          'What stops DELIVERED from becoming CREATED?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['CarrierApi'] },
  }),

  // 187 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-multi-tenant-no-context',
    title: 'Tenant Isolation Path',
    difficulty: 'hard',
    order: 187,
    description: 'Find why tenantId is threaded through every call and isolation depends on callers behaving.',
    tags: ['multi-tenant', 'context', 'encapsulation', 'coupling'],
    nodes: [
      node('n1', 'el-tenant-config', 'TenantConfig', pos(1, 0), ['getPlan', 'getFlags']),
      node('n2', 'el-audit-log', 'AuditLog', pos(2, 0), ['record']),
      node('n3', 'el-api-controller', 'ApiController', pos(0, 1), ['handle']),
      node('n4', 'el-tenant-service', 'TenantService', pos(1, 1),
        ['getUser', 'saveInvoice', 'listOrders', 'updateSettings'],
        [{ name: 'currentTenantId', type: 'String', visibility: 'public' }]),
      node('n5', 'el-tenant-repo', 'TenantRepository', pos(2, 1), ['findAll', 'save', 'rawQuery']),
      node('n6', 'el-billing-service', 'BillingService', pos(2, 2), ['charge', 'getInvoices']),
    ],
    edges: [
      edge('e1', 'ed-controller-service', 'n3', 'n4', 'dependency'),
      edge('e2', 'ed-service-config', 'n4', 'n1', 'dependency'),
      edge('e3', 'ed-service-repo', 'n4', 'n5', 'dependency'),
      edge('e4', 'ed-service-billing', 'n4', 'n6', 'dependency'),
      edge('e5', 'ed-service-audit', 'n4', 'n2', 'dependency'),
    ],
    briefing: briefing(
      ['ApiController', 'TenantService', 'TenantConfig', 'TenantRepository', 'BillingService', 'AuditLog'],
      'TenantService',
      'getUser, saveInvoice, listOrders, updateSettings',
    ),
    requirement: requirement(3, 'the tenant is resolved once into a context and isolation no longer depends on every caller passing the right id'),
    expectedIssues: [
      issue(
        'dbg-multi-tenant-no-context', 1,
        ['el-tenant-service'],
        'Poor Encapsulation',
        ['tenantId', 'public', 'currentTenantId', 'pass', 'caller', 'isolation', 'leak', 'context'],
        'TenantService exposes currentTenantId publicly and takes tenantId in every method, so any caller can read or write another tenant\'s data. Resolve the tenant once into a TenantContext that callers cannot overwrite.',
        [
          'Who can change currentTenantId between two calls?',
          'What happens if a caller passes the wrong tenantId?',
        ],
        ['missing tenant context'],
      ),
      issue(
        'dbg-multi-tenant-no-context', 2,
        ['ed-service-repo', 'ed-service-billing', 'ed-service-audit'],
        'Tight Coupling',
        ['tenantId', 'thread', 'every', 'pass', 'propagate', 'signature', 'coupled', 'context'],
        'Repository, billing and audit all require the tenantId to be threaded explicitly through every signature. This couples each class to tenancy plumbing and makes forgetting it easy. Use an ambient TenantContext instead.',
        [
          'Which downstream calls need the same identifier repeated?',
          'What breaks when you add a new service and forget the id?',
        ],
      ),
      issue(
        'dbg-multi-tenant-no-context', 3,
        ['el-tenant-repo'],
        'Poor Encapsulation',
        ['rawQuery', 'public', 'bypass', 'filter', 'tenant', 'sql', 'expose'],
        'TenantRepository exposes rawQuery, which skips the tenant filter entirely. Data access must always apply isolation internally and not expose an unfiltered escape hatch.',
        [
          'Which repository method does not sound tenant-scoped?',
          'Can a caller read every tenant\'s rows through it?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['AuditLog'] },
  }),

  // 188 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-workflow-no-step',
    title: 'Workflow Executor Steps',
    difficulty: 'hard',
    order: 188,
    description: 'Find why every workflow step is hard-wired inside the executor and the chain is only half built.',
    tags: ['workflow', 'chain-of-responsibility', 'OCP', 'pattern-misuse'],
    nodes: [
      node('n1', 'el-audit-log', 'AuditLog', pos(1, 0), ['append']),
      node('n2', 'el-workflow-controller', 'WorkflowController', pos(0, 1), ['submit']),
      node('n3', 'el-workflow-executor', 'WorkflowExecutor', pos(1, 1),
        ['execute', 'requestApproval', 'validate', 'enrich', 'notify', 'audit']),
      node('n4', 'el-approval-handler', 'ApprovalHandler', pos(2, 0), ['setNext', 'handle'],
        [{ name: 'next', type: 'ApprovalHandler' }]),
      node('n5', 'el-schema-validator', 'SchemaValidator', pos(2, 1), ['check']),
      node('n6', 'el-enrichment-client', 'EnrichmentClient', pos(2, 2), ['lookup']),
      node('n7', 'el-email-notifier', 'EmailNotifier', pos(1, 2), ['send']),
    ],
    edges: [
      edge('e1', 'ed-controller-executor', 'n2', 'n3', 'dependency'),
      edge('e2', 'ed-executor-approval', 'n3', 'n4', 'dependency'),
      edge('e3', 'ed-executor-validator', 'n3', 'n5', 'dependency'),
      edge('e4', 'ed-executor-enrich', 'n3', 'n6', 'dependency'),
      edge('e5', 'ed-executor-notifier', 'n3', 'n7', 'dependency'),
      edge('e6', 'ed-executor-audit', 'n3', 'n1', 'dependency'),
    ],
    briefing: briefing(
      ['WorkflowController', 'WorkflowExecutor', 'ApprovalHandler', 'SchemaValidator', 'EnrichmentClient', 'EmailNotifier', 'AuditLog'],
      'WorkflowExecutor',
      'execute, requestApproval, validate, enrich, notify, audit',
    ),
    requirement: requirement(3, 'steps share one handler interface, are chained or registered in order and the executor does not know their concrete types'),
    expectedIssues: [
      issue(
        'dbg-workflow-no-step', 1,
        ['el-workflow-executor'],
        'OCP Violation',
        ['step', 'new step', 'inline', 'edit', 'modify', 'execute', 'interface', 'extend'],
        'WorkflowExecutor.execute hard-codes approval, validate, enrich, notify and audit in order. Adding, removing or reordering a step edits the executor. Steps should implement a common interface and be configured, not coded.',
        [
          'What would you edit to insert a fraud check between validate and enrich?',
          'Is there any shared type among the executor\'s collaborators?',
        ],
        ['open closed'],
      ),
      issue(
        'dbg-workflow-no-step', 2,
        ['el-approval-handler', 'ed-executor-approval'],
        'Pattern Misuse',
        ['chain', 'responsibility', 'setNext', 'next', 'handler', 'only one', 'half', 'approval'],
        'Only ApprovalHandler is built as a chain link (setNext/handle), yet the executor calls it like a plain service and the other steps are not handlers. Chain of Responsibility needs every step to share a handler interface and link to the next.',
        [
          'Which class has a next reference, and does anything use it as a chain?',
          'Why can\'t SchemaValidator be linked after ApprovalHandler?',
        ],
        ['chain of responsibility misuse'],
      ),
      issue(
        'dbg-workflow-no-step', 3,
        ['ed-executor-validator', 'ed-executor-enrich', 'ed-executor-notifier'],
        'Tight Coupling',
        ['concrete', 'validator', 'enrich', 'notifier', 'direct', 'hard-coded', 'swap', 'coupled'],
        'The executor references SchemaValidator, EnrichmentClient and EmailNotifier concretely. Replacing email with Slack or a different validator needs executor changes.',
        [
          'Which edges point at concrete step implementations?',
          'How would you run this workflow in tests with stubs?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['AuditLog'] },
  }),

  // 189 ---------------------------------------------------------------------
  pack({
    slug: 'dbg-auction-no-optimistic-lock',
    title: 'Auction Bid Concurrency',
    difficulty: 'hard',
    order: 189,
    description: 'Find why concurrent bids can silently overwrite each other and break the auction invariants.',
    tags: ['auction', 'concurrency', 'optimistic-lock', 'encapsulation'],
    nodes: [
      node('n1', 'el-auction-notifier', 'AuctionNotifier', pos(1, 0), ['outbid', 'won']),
      node('n2', 'el-bid-controller', 'BidController', pos(0, 1), ['postBid']),
      node('n3', 'el-bid-service', 'BidService', pos(1, 1), ['placeBid', 'loadAuction', 'saveAuction']),
      node('n4', 'el-auction', 'Auction', pos(2, 0), ['isOpen', 'close'],
        [
          { name: 'currentBid', type: 'Money', visibility: 'public' },
          { name: 'highestBidder', type: 'UserId', visibility: 'public' },
        ]),
      node('n5', 'el-bid-repo', 'AuctionRepository', pos(2, 1), ['findById', 'save']),
      node('n6', 'el-payment-hold', 'PaymentHold', pos(1, 2), ['holdFunds', 'release']),
    ],
    edges: [
      edge('e1', 'ed-controller-bid', 'n2', 'n3', 'dependency'),
      edge('e2', 'ed-bid-auction', 'n3', 'n4', 'dependency'),
      edge('e3', 'ed-bid-repo', 'n3', 'n5', 'dependency'),
      edge('e4', 'ed-bid-hold', 'n3', 'n6', 'dependency'),
      edge('e5', 'ed-bid-notifier', 'n3', 'n1', 'dependency'),
      edge('e6', 'ed-repo-auction', 'n5', 'n4', 'association'),
    ],
    briefing: briefing(
      ['BidController', 'BidService', 'Auction', 'AuctionRepository', 'PaymentHold', 'AuctionNotifier'],
      'BidService',
      'placeBid, loadAuction, saveAuction',
    ),
    requirement: requirement(3, 'concurrent bids are detected through a version check and the auction guards its own invariants'),
    expectedIssues: [
      issue(
        'dbg-auction-no-optimistic-lock', 1,
        ['el-bid-service', 'ed-bid-repo'],
        'Pattern Misuse',
        ['version', 'optimistic', 'lock', 'concurrent', 'read-modify-write', 'race', 'lost update', 'retry'],
        'BidService loads the auction, compares the bid and saves it with no version check. Two concurrent bids both pass validation and the last write wins. Use optimistic locking with a version field and retry on conflict.',
        [
          'What happens if two bids are loaded before either is saved?',
          'What information does the save call carry about which version it read?',
        ],
        ['lost update', 'race condition'],
      ),
      issue(
        'dbg-auction-no-optimistic-lock', 2,
        ['el-auction', 'ed-bid-auction'],
        'Poor Encapsulation',
        ['public', 'currentBid', 'highestBidder', 'mutate', 'invariant', 'placeBid', 'encapsulation'],
        'Auction exposes currentBid and highestBidder publicly and BidService mutates them directly, so Auction cannot enforce that a bid must exceed the current one. Move that rule into an Auction.acceptBid method.',
        [
          'Who enforces that a new bid is higher than currentBid?',
          'Could any class set highestBidder without checking anything?',
        ],
      ),
      issue(
        'dbg-auction-no-optimistic-lock', 3,
        ['ed-bid-hold', 'el-payment-hold'],
        'Other',
        ['hold', 'funds', 'release', 'outbid', 'ordering', 'inconsistent', 'compensat', 'payment'],
        'Funds are held before the bid is saved and are never released if the save is rejected or the bidder is outbid, leaving orphaned payment holds. Hold and release must follow the outcome of the conditional save.',
        [
          'What happens to PaymentHold if the bid is later lost?',
          'Who calls release, and when?',
        ],
        ['orphaned hold', 'inconsistent state'],
      ),
    ],
    verification: { requireNoEditTo: ['AuctionNotifier'] },
  }),
]
