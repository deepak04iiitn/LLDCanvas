/**
 * Design Studio "Change One Thing" — Hard A (orders 468–478).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

export const HARD_A: ChangePackSeed[] = [
  // ─── 468 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-payment-provider-outage-fallback',
    title: 'Stripe Outage Needs Fallback Path',
    difficulty: 'hard',
    description:
      'Stripe had a 40-minute outage and checkout went dark. Keep the Stripe path as primary but add a fallback provider that takes over when Stripe is unhealthy.',
    order: 468,
    tags: ['failure', 'payments', 'resilience', 'circuit-breaker'],
    nodes: [
      node('n1', 'el-checkout', 'CheckoutService', pos(1, 0), ['placeOrder']),
      node('n2', 'el-paysvc', 'PaymentService', pos(1, 1), ['charge', 'refund']),
      node('n3', 'el-stripe', 'StripeClient', pos(0, 2), ['createCharge']),
      node('n4', 'el-ledger', 'PaymentLedger', pos(2, 2), ['record']),
      node('n5', 'el-orders', 'OrderRepository', pos(2, 0), ['save', 'markPaid']),
      node('n6', 'el-metrics', 'PaymentMetrics', pos(0, 1), ['recordFailure']),
    ],
    edges: [
      edge('e1', 'ed-co-ps', 'n1', 'n2'),
      edge('e2', 'ed-ps-st', 'n2', 'n3'),
      edge('e3', 'ed-ps-le', 'n2', 'n4'),
      edge('e4', 'ed-co-or', 'n1', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-ps-me', 'n2', 'n6', 'dependency', 'left', 'right'),
    ],
    changeRequest: {
      title: 'Survive a Stripe outage',
      body:
        'During last month\'s Stripe incident every checkout failed for 40 minutes and we lost roughly $300k in orders.\n\n' +
        'Stripe stays the primary provider and its normal path must not change for healthy traffic. When Stripe is failing or timing out, payments should automatically flow through a secondary provider (e.g. Adyen) — and we must stop hammering Stripe while it is down.\n\n' +
        'CheckoutService has no business knowing which provider handled the charge.',
      type: 'failure',
    },
    briefing:
      "What's going on\n" +
      'CheckoutService places an order and calls PaymentService. PaymentService charges via StripeClient, writes to PaymentLedger and reports failures to PaymentMetrics. There is exactly one provider and no notion of provider health.\n\n' +
      'The problem (simple terms)\n' +
      'Stripe is a single point of failure. A retry loop against a dead provider makes it worse, and if you just add a second concrete client behind an if/else in PaymentService, you bake in the order of providers and cannot test the failover logic.\n\n' +
      'What you should do\n' +
      'Introduce a provider abstraction PaymentService depends on, keep Stripe as one implementation, add a fallback provider, and put a circuit breaker / failover policy between PaymentService and the providers so it flips automatically and recovers.\n\n' +
      'Where to start\n' +
      'Look at PaymentService → StripeClient. What contract do both providers share, and who decides when to stop calling the primary?',
    constraints: [
      'Do not modify CheckoutService',
      'The healthy Stripe path and PaymentLedger recording must keep working',
      'Failover decisions must live in one place, not scattered across providers',
    ],
    forbidModifyElementNames: ['CheckoutService'],
    maxNewClasses: 5,
    expectedTouchHints: ['PaymentService', 'StripeClient', 'PaymentProvider', 'AdyenClient', 'CircuitBreaker', 'FailoverPolicy'],
    protectedFlows: [
      {
        id: 'stripe-primary',
        label: 'Stripe primary charge path',
        mustKeepElementNames: ['CheckoutService', 'PaymentService', 'StripeClient'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentService' },
          { from: 'PaymentService', to: 'StripeClient' },
        ],
      },
      {
        id: 'ledger-record',
        label: 'Every charge is recorded',
        mustKeepElementNames: ['PaymentService', 'PaymentLedger'],
        mustReach: [{ from: 'PaymentService', to: 'PaymentLedger' }],
      },
      {
        id: 'order-persist',
        label: 'Order persistence from checkout',
        mustKeepElementNames: ['CheckoutService', 'OrderRepository'],
        mustReach: [{ from: 'CheckoutService', to: 'OrderRepository' }],
      },
    ],
    newFlows: [
      {
        id: 'fallback-charge',
        label: 'Charge through fallback provider when Stripe is down',
        mustKeepElementNames: ['Adyen'],
        mustHavePathTopics: ['fallback', 'provider'],
        mustReach: [{ from: 'PaymentService', to: 'Adyen' }],
      },
      {
        id: 'circuit-breaker',
        label: 'Failover decision via circuit breaker',
        mustKeepElementNames: ['Breaker'],
        mustHavePathTopics: ['circuit', 'breaker', 'failover'],
        mustReach: [{ from: 'PaymentService', to: 'Breaker' }],
      },
    ],
  }),

  // ─── 469 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-exactly-once-charge',
    title: 'Charges Must Be Exactly-Once',
    difficulty: 'hard',
    description:
      'Mobile clients on flaky networks retry checkout and customers are double-charged. Make the charge path safe to retry.',
    order: 469,
    tags: ['failure', 'payments', 'idempotency', 'retries'],
    nodes: [
      node('n1', 'el-api', 'CheckoutController', pos(1, 0), ['submit']),
      node('n2', 'el-paysvc', 'PaymentService', pos(1, 1), ['charge']),
      node('n3', 'el-gateway', 'GatewayClient', pos(0, 2), ['createCharge']),
      node('n4', 'el-charges', 'ChargeRepository', pos(2, 2), ['save', 'findByOrder']),
      node('n5', 'el-orders', 'OrderService', pos(2, 1), ['markPaid']),
      node('n6', 'el-receipt', 'ReceiptSender', pos(3, 1), ['sendReceipt']),
    ],
    edges: [
      edge('e1', 'ed-ctl-ps', 'n1', 'n2'),
      edge('e2', 'ed-ps-gw', 'n2', 'n3'),
      edge('e3', 'ed-ps-cr', 'n2', 'n4'),
      edge('e4', 'ed-ps-os', 'n2', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-os-rs', 'n5', 'n6', 'dependency', 'right', 'left'),
    ],
    changeRequest: {
      title: 'Never charge a customer twice',
      body:
        'When a mobile app loses the response after the gateway charged the card, the client retries and PaymentService charges again. Support gets ~50 double-charge tickets a week.\n\n' +
        'A retry with the same intent must return the original result without charging again — even if two retries race each other. Receipts must still be sent exactly once per order.\n\n' +
        'The normal happy path must keep working for first-time requests.',
      type: 'failure',
    },
    briefing:
      "What's going on\n" +
      'CheckoutController calls PaymentService, which charges GatewayClient, saves a ChargeRepository row and tells OrderService to mark the order paid; OrderService triggers ReceiptSender.\n\n' +
      'The problem (simple terms)\n' +
      'There is no memory of "I already tried this". A retry looks identical to a new purchase, so the gateway is called twice. Checking ChargeRepository first is not enough — two concurrent retries can both see "no charge yet".\n\n' +
      'What you should do\n' +
      'Add idempotency: a stable key per payment intent, an atomic claim of that key before calling the gateway, and a stored result that replays on retry. Pass the key through to the gateway as well so the provider can dedupe too.\n\n' +
      'Where to start\n' +
      'Look at PaymentService. What must be persisted *before* the gateway call, and who guarantees that only one request wins the claim?',
    constraints: [
      'The first-time charge path must behave exactly as today',
      'Receipts must not be sent twice for a replayed charge',
      'Do not rely on in-memory state — retries may hit different nodes',
    ],
    forbidModifyElementNames: ['ReceiptSender'],
    maxNewClasses: 5,
    expectedTouchHints: ['PaymentService', 'GatewayClient', 'IdempotencyStore', 'IdempotencyKey', 'ChargeResult'],
    protectedFlows: [
      {
        id: 'first-charge',
        label: 'First-time charge happy path',
        mustKeepElementNames: ['CheckoutController', 'PaymentService', 'GatewayClient', 'ChargeRepository'],
        mustReach: [
          { from: 'CheckoutController', to: 'PaymentService' },
          { from: 'PaymentService', to: 'GatewayClient' },
          { from: 'PaymentService', to: 'ChargeRepository' },
        ],
      },
      {
        id: 'mark-paid-receipt',
        label: 'Order marked paid and receipt sent',
        mustKeepElementNames: ['PaymentService', 'OrderService', 'ReceiptSender'],
        mustReach: [
          { from: 'PaymentService', to: 'OrderService' },
          { from: 'OrderService', to: 'ReceiptSender' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'idempotent-claim',
        label: 'Atomic idempotency claim before charging',
        mustKeepElementNames: ['Idempotency'],
        mustHavePathTopics: ['idempotency', 'key'],
        mustReach: [{ from: 'PaymentService', to: 'Idempotency' }],
      },
      {
        id: 'replay-result',
        label: 'Retry replays stored result',
        mustKeepElementNames: ['Idempotency'],
        mustHavePathTopics: ['replay', 'result'],
        mustReach: [{ from: 'Idempotency', to: 'ChargeRepository' }],
      },
    ],
  }),

  // ─── 470 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-saga-compensate-inventory',
    title: 'Failed Payment Must Release Stock',
    difficulty: 'hard',
    description:
      'Orders reserve inventory first and then charge. When the charge fails, stock stays reserved forever. Add compensation without coupling services.',
    order: 470,
    tags: ['failure', 'behavior', 'saga', 'compensation'],
    nodes: [
      node('n1', 'el-orders', 'OrderService', pos(1, 0), ['placeOrder']),
      node('n2', 'el-inv', 'InventoryService', pos(0, 1), ['reserve']),
      node('n3', 'el-pay', 'PaymentService', pos(2, 1), ['charge']),
      node('n4', 'el-ship', 'ShippingService', pos(1, 2), ['schedule']),
      node('n5', 'el-orepo', 'OrderRepository', pos(2, 0), ['save', 'updateStatus']),
      node('n6', 'el-irepo', 'StockRepository', pos(0, 2), ['decrement']),
    ],
    edges: [
      edge('e1', 'ed-o-i', 'n1', 'n2', 'dependency', 'left', 'top'),
      edge('e2', 'ed-o-p', 'n1', 'n3', 'dependency', 'right', 'top'),
      edge('e3', 'ed-o-s', 'n1', 'n4', 'dependency', 'bottom', 'top'),
      edge('e4', 'ed-o-r', 'n1', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-i-r', 'n2', 'n6'),
    ],
    changeRequest: {
      title: 'Release reserved stock when payment fails',
      body:
        'Stock is reserved before payment. If the card is declined or the payment call times out, those units stay locked and the product shows "sold out" while nothing was sold. Merchandising found 3% of SKUs phantom-locked.\n\n' +
        'Failed or timed-out payments must release the reservation and mark the order failed. This must be reliable even if OrderService crashes between steps.\n\n' +
        'Successful orders (reserve → charge → ship) must be unchanged. InventoryService and PaymentService must not call each other.',
      type: 'behavior',
    },
    briefing:
      "What's going on\n" +
      'OrderService drives the whole workflow itself: reserve in InventoryService, charge in PaymentService, then schedule ShippingService. It persists order status via OrderRepository.\n\n' +
      'The problem (simple terms)\n' +
      'The happy path is hard-coded as a straight line. Nothing says "if step 2 fails, undo step 1". A try/catch in OrderService would lose state if the process dies mid-way and tangles failure logic into the order flow.\n\n' +
      'What you should do\n' +
      'Model the workflow as a saga: a coordinator that runs steps, records progress durably, and on failure runs compensating actions in reverse (release stock, mark order failed). Give inventory a release operation and keep services unaware of each other.\n\n' +
      'Where to start\n' +
      'Look at OrderService → InventoryService / PaymentService. Who should own the sequence and the "undo" decisions?',
    constraints: [
      'InventoryService must not call PaymentService (and vice versa)',
      'Successful order flow must stay: reserve, charge, ship',
      'Saga progress must be persisted so recovery works after a crash',
    ],
    forbidModifyElementNames: ['PaymentService'],
    maxNewClasses: 5,
    expectedTouchHints: ['OrderService', 'InventoryService', 'OrderSaga', 'SagaLog', 'ReleaseReservation'],
    protectedFlows: [
      {
        id: 'happy-path',
        label: 'Successful order: reserve, charge, ship',
        mustKeepElementNames: ['OrderService', 'InventoryService', 'PaymentService', 'ShippingService'],
        mustReach: [
          { from: 'OrderService', to: 'InventoryService' },
          { from: 'OrderService', to: 'PaymentService' },
          { from: 'OrderService', to: 'ShippingService' },
        ],
      },
      {
        id: 'reserve-stock',
        label: 'Reservation persists stock decrement',
        mustKeepElementNames: ['InventoryService', 'StockRepository'],
        mustReach: [{ from: 'InventoryService', to: 'StockRepository' }],
      },
      {
        id: 'order-status',
        label: 'Order status persisted',
        mustKeepElementNames: ['OrderService', 'OrderRepository'],
        mustReach: [{ from: 'OrderService', to: 'OrderRepository' }],
      },
    ],
    newFlows: [
      {
        id: 'compensate-release',
        label: 'Payment failure triggers stock release',
        mustKeepElementNames: ['Saga'],
        mustHavePathTopics: ['compensate', 'release', 'saga'],
        mustReach: [
          { from: 'Saga', to: 'InventoryService' },
          { from: 'Saga', to: 'PaymentService' },
        ],
      },
      {
        id: 'saga-durable',
        label: 'Saga progress persisted for crash recovery',
        mustKeepElementNames: ['SagaLog'],
        mustHavePathTopics: ['saga', 'log', 'recovery'],
        mustReach: [{ from: 'Saga', to: 'SagaLog' }],
      },
      {
        id: 'no-service-coupling',
        label: 'Inventory does not know about payment',
        mustNotReach: [{ from: 'InventoryService', to: 'PaymentService' }],
      },
    ],
  }),

  // ─── 471 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-cqrs-read-model',
    title: 'Add Read Model Without Touching Write Aggregate',
    difficulty: 'hard',
    description:
      'The orders dashboard needs denormalised, fast queries. Add a read model fed by events without modifying the OrderAggregate.',
    order: 471,
    tags: ['scale', 'constraint', 'cqrs', 'events'],
    nodes: [
      node('n1', 'el-ctl', 'OrderController', pos(1, 0), ['create', 'cancel']),
      node('n2', 'el-svc', 'OrderService', pos(1, 1), ['handleCommand']),
      node('n3', 'el-agg', 'OrderAggregate', pos(0, 2), ['apply', 'cancel']),
      node('n4', 'el-repo', 'OrderRepository', pos(2, 2), ['load', 'save']),
      node('n5', 'el-pub', 'EventPublisher', pos(3, 1), ['publish']),
      node('n6', 'el-bus', 'EventBus', pos(3, 2), ['send']),
    ],
    edges: [
      edge('e1', 'ed-c-s', 'n1', 'n2'),
      edge('e2', 'ed-s-a', 'n2', 'n3', 'dependency', 'left', 'top'),
      edge('e3', 'ed-s-r', 'n2', 'n4'),
      edge('e4', 'ed-s-p', 'n2', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-p-b', 'n5', 'n6'),
    ],
    changeRequest: {
      title: 'Serve the dashboard from a read model',
      body:
        'The orders dashboard joins six tables via OrderRepository and times out for large merchants. We want a denormalised read model optimised for queries, updated asynchronously from the events we already publish.\n\n' +
        'OrderAggregate is the heart of the write side and is under change freeze: it must not be modified, and must not know that a read side exists.\n\n' +
        'The command path (create/cancel) must keep working as-is.',
      type: 'scale',
    },
    briefing:
      "What's going on\n" +
      'OrderController sends commands to OrderService, which loads/saves the OrderAggregate through OrderRepository and publishes domain events via EventPublisher to the EventBus.\n\n' +
      'The problem (simple terms)\n' +
      'Reads and writes share the same normalised model. The tempting fix — add query methods or denormalised fields to OrderAggregate — mixes read concerns into the write model and is forbidden.\n\n' +
      'What you should do\n' +
      'Introduce a projector that subscribes to the EventBus and maintains a separate read model, plus a query service/controller that reads only from it. The write side only emits events; it never touches the read model.\n\n' +
      'Where to start\n' +
      'Follow the events: EventBus is already the seam. What consumes it, what stores the projection, and what serves queries?',
    constraints: [
      'Do not modify OrderAggregate',
      'The aggregate and write path must not depend on the read model',
      'Dashboard queries must not go through OrderRepository',
    ],
    forbidModifyElementNames: ['OrderAggregate'],
    maxNewClasses: 5,
    expectedTouchHints: ['EventBus', 'OrderProjector', 'OrderReadModel', 'OrderQueryService', 'DashboardController'],
    protectedFlows: [
      {
        id: 'command-path',
        label: 'Command path through the aggregate',
        mustKeepElementNames: ['OrderController', 'OrderService', 'OrderAggregate', 'OrderRepository'],
        mustReach: [
          { from: 'OrderController', to: 'OrderService' },
          { from: 'OrderService', to: 'OrderAggregate' },
          { from: 'OrderService', to: 'OrderRepository' },
        ],
      },
      {
        id: 'event-publish',
        label: 'Domain events still published',
        mustKeepElementNames: ['OrderService', 'EventPublisher', 'EventBus'],
        mustReach: [
          { from: 'OrderService', to: 'EventPublisher' },
          { from: 'EventPublisher', to: 'EventBus' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'projection',
        label: 'Events project into the read model',
        mustKeepElementNames: ['Projector', 'ReadModel'],
        mustHavePathTopics: ['projection', 'read', 'model'],
        mustReach: [
          { from: 'Projector', to: 'EventBus' },
          { from: 'Projector', to: 'ReadModel' },
        ],
      },
      {
        id: 'query-side',
        label: 'Dashboard queries hit only the read model',
        mustKeepElementNames: ['Query'],
        mustHavePathTopics: ['query', 'dashboard'],
        mustReach: [{ from: 'Query', to: 'ReadModel' }],
      },
      {
        id: 'write-isolated',
        label: 'Write aggregate is unaware of the read model',
        mustNotReach: [{ from: 'OrderAggregate', to: 'ReadModel' }],
      },
    ],
  }),

  // ─── 472 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-multi-region-failover',
    title: 'Fail Over Writes to Secondary Region',
    difficulty: 'hard',
    description:
      'A regional outage took writes down for 2 hours. Add region-aware routing that promotes a secondary safely without split-brain.',
    order: 472,
    tags: ['scale', 'failure', 'multi-region', 'availability'],
    nodes: [
      node('n1', 'el-api', 'WriteApi', pos(1, 0), ['write']),
      node('n2', 'el-repo', 'AccountRepository', pos(1, 1), ['save', 'load']),
      node('n3', 'el-primary', 'PrimaryDatabase', pos(0, 2), ['execute']),
      node('n4', 'el-replica', 'ReplicaDatabase', pos(2, 2), ['replicate', 'read']),
      node('n5', 'el-health', 'HealthChecker', pos(3, 1), ['probe']),
      node('n6', 'el-alert', 'OnCallAlerter', pos(3, 0), ['page']),
    ],
    edges: [
      edge('e1', 'ed-a-r', 'n1', 'n2'),
      edge('e2', 'ed-r-p', 'n2', 'n3'),
      edge('e3', 'ed-r-rep', 'n2', 'n4'),
      edge('e4', 'ed-h-p', 'n5', 'n3', 'dependency', 'bottom', 'right'),
      edge('e5', 'ed-h-al', 'n5', 'n6', 'dependency', 'top', 'bottom'),
    ],
    changeRequest: {
      title: 'Fail writes over to the secondary region',
      body:
        'Last quarter our primary region was down for two hours and every write failed, even though a replica in another region was healthy.\n\n' +
        'When the primary is confirmed unhealthy, writes should move to the secondary region automatically — but never to both at once (no split-brain), and clients must not need to know which region is active.\n\n' +
        'Normal single-region writes and reads must behave exactly as before.',
      type: 'scale',
    },
    briefing:
      "What's going on\n" +
      'WriteApi writes through AccountRepository straight to PrimaryDatabase; reads can use ReplicaDatabase. HealthChecker probes the primary and pages OnCallAlerter, but nothing acts on its findings.\n\n' +
      'The problem (simple terms)\n' +
      'AccountRepository is wired to a specific database. If the primary dies, a human has to repoint everything. Letting each node decide independently risks two regions both accepting writes.\n\n' +
      'What you should do\n' +
      'Add a routing layer that owns "which region is the writer": HealthChecker feeds a failover coordinator that promotes the secondary using a single authority (lease or fencing token) so the old primary is rejected if it comes back. Repositories write through the router, not a concrete database.\n\n' +
      'Where to start\n' +
      'Look at AccountRepository → PrimaryDatabase. Who should decide the active writer, and how is a zombie primary prevented from writing?',
    constraints: [
      'WriteApi callers must not know which region is active',
      'Only one region may accept writes at a time',
      'Single-region healthy behaviour must be unchanged',
    ],
    forbidModifyElementNames: ['WriteApi'],
    maxNewClasses: 5,
    expectedTouchHints: ['AccountRepository', 'PrimaryDatabase', 'RegionRouter', 'FailoverCoordinator', 'FencingToken', 'SecondaryDatabase'],
    protectedFlows: [
      {
        id: 'primary-write',
        label: 'Healthy primary write path',
        mustKeepElementNames: ['WriteApi', 'AccountRepository', 'PrimaryDatabase'],
        mustReach: [
          { from: 'WriteApi', to: 'AccountRepository' },
          { from: 'AccountRepository', to: 'PrimaryDatabase' },
        ],
      },
      {
        id: 'replica-read',
        label: 'Replica reads preserved',
        mustKeepElementNames: ['AccountRepository', 'ReplicaDatabase'],
        mustReach: [{ from: 'AccountRepository', to: 'ReplicaDatabase' }],
      },
      {
        id: 'health-alert',
        label: 'Health probe still pages on-call',
        mustKeepElementNames: ['HealthChecker', 'OnCallAlerter'],
        mustReach: [{ from: 'HealthChecker', to: 'OnCallAlerter' }],
      },
    ],
    newFlows: [
      {
        id: 'failover-promote',
        label: 'Health drives promotion of the secondary',
        mustKeepElementNames: ['Failover'],
        mustHavePathTopics: ['failover', 'promote', 'region'],
        mustReach: [
          { from: 'HealthChecker', to: 'Failover' },
          { from: 'Failover', to: 'Secondary' },
        ],
      },
      {
        id: 'routed-writes',
        label: 'Writes go through the region router',
        mustKeepElementNames: ['Router'],
        mustHavePathTopics: ['router', 'region', 'write'],
        mustReach: [{ from: 'AccountRepository', to: 'Router' }],
      },
      {
        id: 'fencing',
        label: 'Old primary fenced after failover',
        mustKeepElementNames: ['Fencing'],
        mustHavePathTopics: ['fencing', 'lease', 'split-brain'],
        mustReach: [{ from: 'Failover', to: 'Fencing' }],
      },
    ],
  }),

  // ─── 473 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-tenant-data-isolation',
    title: 'Strict Tenant Data Isolation',
    difficulty: 'hard',
    description:
      'A report endpoint leaked one customer\'s invoices to another. Make tenant scoping structural, not something each query remembers to do.',
    order: 473,
    tags: ['constraint', 'ownership', 'multi-tenant', 'security'],
    nodes: [
      node('n1', 'el-ctl', 'ReportController', pos(1, 0), ['getInvoices']),
      node('n2', 'el-svc', 'ReportService', pos(1, 1), ['buildReport']),
      node('n3', 'el-inv', 'InvoiceRepository', pos(0, 2), ['findByCustomer']),
      node('n4', 'el-cust', 'CustomerRepository', pos(1, 2), ['findById']),
      node('n5', 'el-raw', 'RawSqlClient', pos(3, 2), ['query']),
      node('n6', 'el-db', 'SharedDatabase', pos(1, 3), ['execute']),
    ],
    edges: [
      edge('e1', 'ed-c-s', 'n1', 'n2'),
      edge('e2', 'ed-s-i', 'n2', 'n3', 'dependency', 'bottom', 'top'),
      edge('e3', 'ed-s-c', 'n2', 'n4', 'dependency', 'bottom', 'top'),
      edge('e4', 'ed-s-raw', 'n2', 'n5', 'dependency', 'right', 'top'),
      edge('e5', 'ed-i-db', 'n3', 'n6', 'dependency', 'bottom', 'left'),
      edge('e6', 'ed-c-db', 'n4', 'n6'),
    ],
    changeRequest: {
      title: 'Guarantee tenants can only see their own data',
      body:
        'A support ticket revealed that ReportService can run ad-hoc SQL via RawSqlClient without a tenant filter, and one report returned another tenant\'s invoices.\n\n' +
        'Isolation must be enforced structurally: every data access runs under an authenticated tenant context and repositories cannot be used without one. The raw, unscoped SQL path must be removed from the report flow.\n\n' +
        'Report output for a single tenant must stay identical.',
      type: 'constraint',
    },
    briefing:
      "What's going on\n" +
      'ReportController calls ReportService, which loads invoices and customers through repositories into one SharedDatabase — and also has a direct RawSqlClient it uses for a few aggregate queries.\n\n' +
      'The problem (simple terms)\n' +
      'Tenant filtering is a convention each query must remember. The raw SQL path skips it entirely, so one forgotten WHERE clause leaks data. Adding a tenantId parameter to every method just spreads the same risk around.\n\n' +
      'What you should do\n' +
      'Establish a tenant context resolved once at the edge, and make repositories (or a scoped data-access layer) require it and apply the filter themselves. Remove ReportService\'s direct raw SQL access so it cannot bypass the scope.\n\n' +
      'Where to start\n' +
      'Look at ReportService → RawSqlClient. Who owns the tenant filter, and how can the type system or structure make bypassing it impossible?',
    constraints: [
      'ReportService must not be able to reach unscoped SQL',
      'Tenant scoping must not depend on each caller passing a tenantId correctly',
      'Single-tenant report output must not change',
    ],
    forbidModifyElementNames: ['SharedDatabase'],
    maxNewClasses: 5,
    expectedTouchHints: ['ReportService', 'RawSqlClient', 'TenantContext', 'TenantScopedRepository', 'TenantResolver'],
    protectedFlows: [
      {
        id: 'invoice-report',
        label: 'Invoice report generation',
        mustKeepElementNames: ['ReportController', 'ReportService', 'InvoiceRepository', 'SharedDatabase'],
        mustReach: [
          { from: 'ReportController', to: 'ReportService' },
          { from: 'ReportService', to: 'InvoiceRepository' },
          { from: 'InvoiceRepository', to: 'SharedDatabase' },
        ],
      },
      {
        id: 'customer-lookup',
        label: 'Customer lookup in reports',
        mustKeepElementNames: ['ReportService', 'CustomerRepository', 'SharedDatabase'],
        mustReach: [
          { from: 'ReportService', to: 'CustomerRepository' },
          { from: 'CustomerRepository', to: 'SharedDatabase' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'tenant-context',
        label: 'Tenant context resolved at the edge and required by repositories',
        mustKeepElementNames: ['Tenant'],
        mustHavePathTopics: ['tenant', 'context', 'scope'],
        mustReach: [
          { from: 'ReportController', to: 'Tenant' },
          { from: 'InvoiceRepository', to: 'Tenant' },
          { from: 'CustomerRepository', to: 'Tenant' },
        ],
      },
      {
        id: 'raw-sql-removed',
        label: 'Report flow cannot use unscoped raw SQL',
        mustNotReach: [{ from: 'ReportService', to: 'RawSqlClient' }],
      },
    ],
  }),

  // ─── 474 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-outbox-publish',
    title: 'Publish Events Via Outbox Not Inline',
    difficulty: 'hard',
    description:
      'Orders commit but sometimes the event is lost, or an event goes out for an order that rolled back. Use a transactional outbox.',
    order: 474,
    tags: ['failure', 'constraint', 'outbox', 'consistency'],
    nodes: [
      node('n1', 'el-orders', 'OrderService', pos(1, 0), ['placeOrder']),
      node('n2', 'el-repo', 'OrderRepository', pos(0, 1), ['save']),
      node('n3', 'el-pub', 'EventPublisher', pos(2, 1), ['publish']),
      node('n4', 'el-broker', 'MessageBroker', pos(2, 2), ['send']),
      node('n5', 'el-inv', 'InventoryConsumer', pos(3, 2), ['onOrderPlaced']),
      node('n6', 'el-db', 'OrdersDatabase', pos(0, 2), ['transaction']),
    ],
    edges: [
      edge('e1', 'ed-o-r', 'n1', 'n2', 'dependency', 'left', 'top'),
      edge('e2', 'ed-o-p', 'n1', 'n3', 'dependency', 'right', 'top'),
      edge('e3', 'ed-p-b', 'n3', 'n4'),
      edge('e4', 'ed-r-db', 'n2', 'n6'),
      edge('e5', 'ed-c-b', 'n5', 'n4', 'dependency', 'left', 'right'),
    ],
    changeRequest: {
      title: 'Stop publishing events inline with the order write',
      body:
        'OrderService saves the order and then publishes OrderPlaced to the broker in the same request. If the broker is down, the order exists but no event goes out; if the publish succeeds and the DB commit later fails, downstream services act on an order that does not exist.\n\n' +
        'Event creation must be atomic with the order write, and delivery to the broker must happen asynchronously with retries, at-least-once.\n\n' +
        'Downstream consumers (e.g. InventoryConsumer) must keep receiving the same events.',
      type: 'failure',
    },
    briefing:
      "What's going on\n" +
      'OrderService persists via OrderRepository into OrdersDatabase and, separately, calls EventPublisher which sends to MessageBroker. InventoryConsumer reads from the broker.\n\n' +
      'The problem (simple terms)\n' +
      'Two systems, no shared transaction. The database commit and broker publish can disagree — "dual write". Retrying inline from OrderService just makes the request slow and still unsafe.\n\n' +
      'What you should do\n' +
      'Write the event into an outbox table in the same DB transaction as the order. A separate relay reads unsent outbox rows and publishes them to the broker, marking them sent. OrderService must no longer reach the broker itself.\n\n' +
      'Where to start\n' +
      'Look at OrderService → EventPublisher. What can safely be written inside the order transaction, and who owns delivery afterwards?',
    constraints: [
      'OrderService must not publish to the broker directly',
      'Outbox write and order write must share one transaction',
      'Consumers must keep receiving the same OrderPlaced events',
    ],
    forbidModifyElementNames: ['InventoryConsumer'],
    maxNewClasses: 5,
    expectedTouchHints: ['OrderService', 'EventPublisher', 'OutboxRepository', 'OutboxRelay', 'OutboxEvent'],
    protectedFlows: [
      {
        id: 'order-save',
        label: 'Order persisted transactionally',
        mustKeepElementNames: ['OrderService', 'OrderRepository', 'OrdersDatabase'],
        mustReach: [
          { from: 'OrderService', to: 'OrderRepository' },
          { from: 'OrderRepository', to: 'OrdersDatabase' },
        ],
      },
      {
        id: 'consumer-receives',
        label: 'Inventory consumer still receives events',
        mustKeepElementNames: ['EventPublisher', 'MessageBroker', 'InventoryConsumer'],
        mustReach: [
          { from: 'EventPublisher', to: 'MessageBroker' },
          { from: 'InventoryConsumer', to: 'MessageBroker' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'outbox-write',
        label: 'Event written to outbox with the order',
        mustKeepElementNames: ['Outbox'],
        mustHavePathTopics: ['outbox', 'transaction'],
        mustReach: [
          { from: 'OrderService', to: 'Outbox' },
          { from: 'Outbox', to: 'OrdersDatabase' },
        ],
      },
      {
        id: 'relay-publish',
        label: 'Relay delivers outbox rows to the broker',
        mustKeepElementNames: ['Relay'],
        mustHavePathTopics: ['relay', 'outbox', 'retry'],
        mustReach: [
          { from: 'Relay', to: 'Outbox' },
          { from: 'Relay', to: 'MessageBroker' },
        ],
      },
      {
        id: 'no-inline-publish',
        label: 'No inline publish from the order path',
        mustNotReach: [{ from: 'OrderService', to: 'MessageBroker' }],
      },
    ],
  }),

  // ─── 475 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-rate-limit-distributed',
    title: 'Distributed Rate Limit Across Nodes',
    difficulty: 'hard',
    description:
      'Each gateway node enforces its own rate limit, so scaling out multiplied every customer\'s quota. Make the limit global without slowing the hot path.',
    order: 475,
    tags: ['scale', 'rate-limiting', 'distributed', 'gateway'],
    nodes: [
      node('n1', 'el-gw', 'ApiGateway', pos(1, 0), ['handle']),
      node('n2', 'el-limiter', 'RateLimiter', pos(1, 1), ['tryAcquire']),
      node('n3', 'el-local', 'LocalCounter', pos(0, 2), ['increment', 'reset']),
      node('n4', 'el-policy', 'QuotaPolicy', pos(2, 2), ['limitFor']),
      node('n5', 'el-backend', 'BackendRouter', pos(2, 0), ['forward']),
      node('n6', 'el-log', 'AccessLog', pos(3, 1), ['record']),
    ],
    edges: [
      edge('e1', 'ed-g-l', 'n1', 'n2'),
      edge('e2', 'ed-l-lc', 'n2', 'n3'),
      edge('e3', 'ed-l-q', 'n2', 'n4'),
      edge('e4', 'ed-g-b', 'n1', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-g-al', 'n1', 'n6', 'dependency', 'right', 'top'),
    ],
    changeRequest: {
      title: 'Enforce rate limits globally across gateway nodes',
      body:
        'We scaled the gateway from 2 to 24 nodes and each keeps its own in-memory counter. A customer with a 100 req/s limit can now do up to 2,400 req/s by hitting different nodes.\n\n' +
        'Limits must be enforced across the whole fleet. The check is on the hot path (p99 budget a few ms), and a limiter outage must not take down the API.\n\n' +
        'Existing per-customer quota policy must be reused.',
      type: 'scale',
    },
    briefing:
      "What's going on\n" +
      'ApiGateway asks RateLimiter before forwarding to BackendRouter. RateLimiter counts requests in a process-local LocalCounter and reads limits from QuotaPolicy.\n\n' +
      'The problem (simple terms)\n' +
      'State lives in each node, so the effective limit is quota × node count and changes with autoscaling. Calling a central database per request would add latency and a new failure point.\n\n' +
      'What you should do\n' +
      'Move counting to a shared, fast store (e.g. Redis with atomic increments and a sliding/fixed window) behind an abstraction RateLimiter depends on. Consider a small local token budget to batch round-trips, and a defined degrade mode (fail-open or local-only) if the store is unreachable.\n\n' +
      'Where to start\n' +
      'Look at RateLimiter → LocalCounter. What contract can both a local and shared counter satisfy, and what should happen when the shared one is down?',
    constraints: [
      'Gateway request handling and QuotaPolicy must keep working',
      'The limiter must not be a hard dependency of availability',
      'Counting must be atomic across nodes',
    ],
    forbidModifyElementNames: ['ApiGateway', 'QuotaPolicy'],
    maxNewClasses: 5,
    expectedTouchHints: ['RateLimiter', 'LocalCounter', 'CounterStore', 'RedisCounterStore', 'DegradePolicy'],
    protectedFlows: [
      {
        id: 'limit-check',
        label: 'Request passes through limit check',
        mustKeepElementNames: ['ApiGateway', 'RateLimiter', 'QuotaPolicy'],
        mustReach: [
          { from: 'ApiGateway', to: 'RateLimiter' },
          { from: 'RateLimiter', to: 'QuotaPolicy' },
        ],
      },
      {
        id: 'forward',
        label: 'Allowed requests forwarded and logged',
        mustKeepElementNames: ['ApiGateway', 'BackendRouter', 'AccessLog'],
        mustReach: [
          { from: 'ApiGateway', to: 'BackendRouter' },
          { from: 'ApiGateway', to: 'AccessLog' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'shared-counter',
        label: 'Counting happens in a shared store',
        mustKeepElementNames: ['Redis'],
        mustHavePathTopics: ['redis', 'distributed', 'counter'],
        mustReach: [{ from: 'RateLimiter', to: 'Redis' }],
      },
      {
        id: 'counter-port',
        label: 'Limiter depends on a counter abstraction',
        mustKeepElementNames: ['CounterStore'],
        mustHavePathTopics: ['counter', 'store'],
        mustReach: [{ from: 'RateLimiter', to: 'CounterStore' }],
      },
      {
        id: 'degrade-mode',
        label: 'Defined behaviour when shared store is down',
        mustKeepElementNames: ['Degrade'],
        mustHavePathTopics: ['degrade', 'fallback', 'fail-open'],
        mustReach: [{ from: 'RateLimiter', to: 'Degrade' }],
      },
    ],
  }),

  // ─── 476 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-pii-redaction',
    title: 'PII Must Not Reach Analytics',
    difficulty: 'hard',
    description:
      'Legal found emails and phone numbers in the analytics warehouse. Make PII unreachable from the analytics pipeline by construction.',
    order: 476,
    tags: ['constraint', 'privacy', 'pii', 'analytics'],
    nodes: [
      node('n1', 'el-usersvc', 'UserService', pos(1, 0), ['signUp', 'updateProfile']),
      node('n2', 'el-pii', 'UserPii', pos(0, 1), ['email', 'phone', 'fullName']),
      node('n3', 'el-userrepo', 'UserRepository', pos(0, 2), ['save']),
      node('n4', 'el-analytics', 'AnalyticsService', pos(2, 1), ['track']),
      node('n5', 'el-wh', 'WarehouseSink', pos(2, 2), ['write']),
      node('n6', 'el-flags', 'FeatureFlagService', pos(3, 0), ['isEnabled']),
    ],
    edges: [
      edge('e1', 'ed-u-pii', 'n1', 'n2', 'dependency', 'left', 'top'),
      edge('e2', 'ed-u-an', 'n1', 'n4', 'dependency', 'right', 'top'),
      edge('e3', 'ed-pii-r', 'n2', 'n3'),
      edge('e4', 'ed-an-wh', 'n4', 'n5'),
      edge('e5', 'ed-an-pii', 'n4', 'n2', 'dependency', 'left', 'right'),
      edge('e6', 'ed-an-ff', 'n4', 'n6', 'dependency', 'right', 'bottom'),
    ],
    changeRequest: {
      title: 'Keep PII out of the analytics pipeline',
      body:
        'AnalyticsService reads UserPii to enrich events, so raw emails and phone numbers end up in the warehouse. That violates our GDPR data-minimisation commitments and is now an audit finding.\n\n' +
        'Analytics must receive only redacted/pseudonymous data (e.g. a hashed user id and coarse attributes). It must have no path to UserPii at all — not by accident, not by a future enrichment call.\n\n' +
        'Sign-up and profile updates, and event tracking itself, must keep working.',
      type: 'constraint',
    },
    briefing:
      "What's going on\n" +
      'UserService stores profile data in UserPii (persisted via UserRepository) and emits tracking calls to AnalyticsService, which enriches events by reading UserPii directly and writes to WarehouseSink.\n\n' +
      'The problem (simple terms)\n' +
      'Analytics has a direct dependency on the PII holder. Filtering fields later in the pipeline is fragile — one new field and it leaks again. The fix has to be structural.\n\n' +
      'What you should do\n' +
      'Insert a redaction boundary between UserService and analytics: events are built from a safe projection (pseudonymised id, allowed attributes only), and the analytics side loses any dependency on UserPii. Make the allow-list explicit rather than a deny-list.\n\n' +
      'Where to start\n' +
      'Look at AnalyticsService → UserPii. Which direction should that dependency go, and what should cross the boundary instead?',
    constraints: [
      'AnalyticsService must have no path to UserPii',
      'Redaction must be allow-list based',
      'Sign-up, profile update and event tracking must keep working',
    ],
    forbidModifyElementNames: ['UserPii'],
    maxNewClasses: 5,
    expectedTouchHints: ['AnalyticsService', 'UserPii', 'PiiRedactor', 'AnalyticsEvent', 'Pseudonymizer'],
    protectedFlows: [
      {
        id: 'profile-store',
        label: 'Profile data persisted',
        mustKeepElementNames: ['UserService', 'UserPii', 'UserRepository'],
        mustReach: [
          { from: 'UserService', to: 'UserPii' },
          { from: 'UserPii', to: 'UserRepository' },
        ],
      },
      {
        id: 'event-tracking',
        label: 'Analytics events still reach the warehouse',
        mustKeepElementNames: ['UserService', 'AnalyticsService', 'WarehouseSink'],
        mustReach: [
          { from: 'UserService', to: 'AnalyticsService' },
          { from: 'AnalyticsService', to: 'WarehouseSink' },
        ],
      },
      {
        id: 'feature-flags',
        label: 'Analytics feature flag check',
        mustKeepElementNames: ['AnalyticsService', 'FeatureFlagService'],
        mustReach: [{ from: 'AnalyticsService', to: 'FeatureFlagService' }],
      },
    ],
    newFlows: [
      {
        id: 'redaction-boundary',
        label: 'Events are redacted before analytics',
        mustKeepElementNames: ['Redactor'],
        mustHavePathTopics: ['redact', 'pii', 'allow-list'],
        mustReach: [
          { from: 'UserService', to: 'Redactor' },
          { from: 'Redactor', to: 'AnalyticsService' },
        ],
      },
      {
        id: 'analytics-no-pii',
        label: 'Analytics cannot reach PII',
        mustNotReach: [{ from: 'AnalyticsService', to: 'UserPii' }],
      },
    ],
  }),

  // ─── 477 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-booking-holds-expire',
    title: 'Expired Holds Must Free Seats Automatically',
    difficulty: 'hard',
    description:
      'Customers hold seats for 10 minutes while paying. Abandoned holds never release, so events look sold out. Add reliable automatic expiry.',
    order: 477,
    tags: ['behavior', 'failure', 'scheduling', 'booking'],
    nodes: [
      node('n1', 'el-booking', 'BookingService', pos(1, 0), ['holdSeats', 'confirm']),
      node('n2', 'el-seats', 'SeatInventory', pos(0, 1), ['lock', 'unlock', 'isFree']),
      node('n3', 'el-holds', 'HoldRepository', pos(2, 1), ['save', 'findById']),
      node('n4', 'el-pay', 'PaymentService', pos(1, 2), ['charge']),
      node('n5', 'el-notify', 'NotificationService', pos(3, 1), ['send']),
      node('n6', 'el-clock', 'SystemClock', pos(3, 0), ['now']),
    ],
    edges: [
      edge('e1', 'ed-b-s', 'n1', 'n2', 'dependency', 'left', 'top'),
      edge('e2', 'ed-b-h', 'n1', 'n3', 'dependency', 'right', 'top'),
      edge('e3', 'ed-b-p', 'n1', 'n4'),
      edge('e4', 'ed-b-n', 'n1', 'n5', 'dependency', 'right', 'left'),
      edge('e5', 'ed-h-c', 'n3', 'n6', 'dependency', 'right', 'bottom'),
    ],
    changeRequest: {
      title: 'Automatically release expired seat holds',
      body:
        'A hold is supposed to last 10 minutes, but nothing ever releases it. If the customer abandons checkout, those seats stay locked until a human runs a script. Popular events look sold out while seats are actually empty.\n\n' +
        'Expired holds must free their seats automatically and idempotently, without racing against a customer who confirms at the last second. Customers whose hold expired should be told.\n\n' +
        'Normal hold → pay → confirm must be unchanged.',
      type: 'behavior',
    },
    briefing:
      "What's going on\n" +
      'BookingService locks seats in SeatInventory and records a hold in HoldRepository (with timestamps from SystemClock). On payment it confirms. There is no process that looks at expired holds.\n\n' +
      'The problem (simple terms)\n' +
      'Expiry is data with no behaviour. Checking "is this hold expired?" only on the next customer touch means abandoned holds stay locked forever. A naive background loop can also release a seat a split-second after the customer pays.\n\n' +
      'What you should do\n' +
      'Add an expiry worker that periodically finds expired, still-pending holds and releases them. Make the transition atomic (compare-and-set on hold status) so confirm and expire cannot both win, and notify the customer.\n\n' +
      'Where to start\n' +
      'Look at HoldRepository and SeatInventory. What status transition makes "expire" and "confirm" mutually exclusive?',
    constraints: [
      'Confirm and expire must be mutually exclusive on the same hold',
      'Expiry must be idempotent so the worker can safely re-run',
      'The normal hold, pay and confirm flow must be unchanged',
    ],
    forbidModifyElementNames: ['PaymentService'],
    maxNewClasses: 5,
    expectedTouchHints: ['HoldRepository', 'SeatInventory', 'HoldExpiryWorker', 'HoldStatus', 'ExpiryPolicy'],
    protectedFlows: [
      {
        id: 'hold-seats',
        label: 'Hold seats and record the hold',
        mustKeepElementNames: ['BookingService', 'SeatInventory', 'HoldRepository'],
        mustReach: [
          { from: 'BookingService', to: 'SeatInventory' },
          { from: 'BookingService', to: 'HoldRepository' },
        ],
      },
      {
        id: 'pay-confirm',
        label: 'Pay and confirm',
        mustKeepElementNames: ['BookingService', 'PaymentService', 'NotificationService'],
        mustReach: [
          { from: 'BookingService', to: 'PaymentService' },
          { from: 'BookingService', to: 'NotificationService' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'expiry-sweep',
        label: 'Worker finds expired holds and frees seats',
        mustKeepElementNames: ['Expiry'],
        mustHavePathTopics: ['expire', 'hold', 'release'],
        mustReach: [
          { from: 'Expiry', to: 'HoldRepository' },
          { from: 'Expiry', to: 'SeatInventory' },
        ],
      },
      {
        id: 'expiry-notify',
        label: 'Customer notified of expiry',
        mustKeepElementNames: ['Expiry'],
        mustHavePathTopics: ['notify', 'expire'],
        mustReach: [{ from: 'Expiry', to: 'NotificationService' }],
      },
      {
        id: 'expiry-clock',
        label: 'Expiry uses the injected clock',
        mustReach: [{ from: 'Expiry', to: 'SystemClock' }],
      },
    ],
  }),

  // ─── 478 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-split-billing-bounded-context',
    title: 'Billing Becomes Its Own Bounded Context',
    difficulty: 'hard',
    description:
      'A new Finance team will own billing. Draw the boundary so Ordering talks to Billing only through a published contract.',
    order: 478,
    tags: ['ownership', 'bounded-context', 'ddd', 'boundaries'],
    nodes: [
      node('n1', 'el-ctl', 'OrderController', pos(1, 0), ['checkout']),
      node('n2', 'el-orders', 'OrderService', pos(1, 1), ['placeOrder', 'cancelOrder']),
      node('n3', 'el-invrepo', 'InvoiceRepository', pos(0, 2), ['save', 'findByOrder']),
      node('n4', 'el-tax', 'TaxCalculator', pos(1, 2), ['calculate']),
      node('n5', 'el-gateway', 'PaymentGateway', pos(2, 2), ['charge', 'refund']),
      node('n6', 'el-orepo', 'OrderRepository', pos(3, 1), ['save']),
      node('n7', 'el-cust', 'CustomerProfile', pos(3, 0), ['billingAddress']),
    ],
    edges: [
      edge('e1', 'ed-c-o', 'n1', 'n2'),
      edge('e2', 'ed-o-i', 'n2', 'n3', 'dependency', 'left', 'top'),
      edge('e3', 'ed-o-t', 'n2', 'n4'),
      edge('e4', 'ed-o-g', 'n2', 'n5', 'dependency', 'right', 'top'),
      edge('e5', 'ed-o-r', 'n2', 'n6', 'dependency', 'right', 'left'),
      edge('e6', 'ed-o-cu', 'n2', 'n7', 'dependency', 'top', 'left'),
    ],
    changeRequest: {
      title: 'Make Billing its own bounded context',
      body:
        'Finance is forming its own team and will own invoicing, tax and payments end-to-end, with its own deploy cadence and data store.\n\n' +
        'Today OrderService reaches directly into InvoiceRepository, TaxCalculator and PaymentGateway. That has to stop: Ordering may only talk to Billing through a narrow, published interface, and Billing must not reach back into Ordering\'s internals.\n\n' +
        'Placing and cancelling orders (including invoicing, tax and charging) must still work end-to-end.',
      type: 'ownership',
    },
    briefing:
      "What's going on\n" +
      'OrderService orchestrates everything itself: it saves invoices, calculates tax, charges via PaymentGateway, stores the order, and reads billing address from CustomerProfile. Ordering and billing concerns are one tangled module.\n\n' +
      'The problem (simple terms)\n' +
      'Billing\'s internals (invoice schema, tax rules, gateway) are used straight from Ordering. Any billing change breaks Ordering, and the Finance team cannot deploy independently or change their storage.\n\n' +
      'What you should do\n' +
      'Define a Billing API (port) owned by the Billing context. Move invoice, tax and payment collaboration behind a BillingService implementing it. OrderService depends only on the API, passing data it owns (order id, amount, customer reference) — not Billing\'s internal types. Add an anti-corruption mapping so Billing\'s model does not leak into Ordering.\n\n' +
      'Where to start\n' +
      'Look at the three arrows from OrderService into billing classes. What is the smallest contract that replaces all of them?',
    constraints: [
      'OrderService must not reach InvoiceRepository, TaxCalculator or PaymentGateway',
      'Billing must not depend on OrderService or OrderRepository',
      'Order placement and cancellation must still invoice, tax and charge end-to-end',
    ],
    forbidModifyElementNames: ['OrderController'],
    maxNewClasses: 5,
    expectedTouchHints: ['OrderService', 'BillingApi', 'BillingService', 'InvoiceRepository', 'TaxCalculator', 'PaymentGateway', 'BillingMapper'],
    protectedFlows: [
      {
        id: 'order-entry',
        label: 'Order entry and persistence',
        mustKeepElementNames: ['OrderController', 'OrderService', 'OrderRepository'],
        mustReach: [
          { from: 'OrderController', to: 'OrderService' },
          { from: 'OrderService', to: 'OrderRepository' },
        ],
      },
      {
        id: 'billing-internals',
        label: 'Billing internals still exist and work',
        mustKeepElementNames: ['InvoiceRepository', 'TaxCalculator', 'PaymentGateway'],
      },
      {
        id: 'customer-address',
        label: 'Billing address from customer profile',
        mustKeepElementNames: ['OrderService', 'CustomerProfile'],
        mustReach: [{ from: 'OrderService', to: 'CustomerProfile' }],
      },
    ],
    newFlows: [
      {
        id: 'billing-contract',
        label: 'Ordering talks to Billing through a published API',
        mustKeepElementNames: ['BillingApi'],
        mustHavePathTopics: ['billing', 'api', 'contract'],
        mustReach: [{ from: 'OrderService', to: 'BillingApi' }],
      },
      {
        id: 'billing-owns-internals',
        label: 'BillingService owns invoicing, tax and charging',
        mustKeepElementNames: ['BillingService'],
        mustHavePathTopics: ['billing', 'invoice', 'tax', 'payment'],
        mustReach: [
          { from: 'BillingService', to: 'InvoiceRepository' },
          { from: 'BillingService', to: 'TaxCalculator' },
          { from: 'BillingService', to: 'PaymentGateway' },
        ],
      },
      {
        id: 'ordering-isolated',
        label: 'Ordering no longer reaches billing internals',
        mustNotReach: [
          { from: 'OrderService', to: 'InvoiceRepository' },
          { from: 'OrderService', to: 'TaxCalculator' },
          { from: 'OrderService', to: 'PaymentGateway' },
        ],
      },
      {
        id: 'billing-isolated',
        label: 'Billing does not depend on Ordering',
        mustNotReach: [{ from: 'BillingService', to: 'OrderService' }],
      },
    ],
  }),
]
