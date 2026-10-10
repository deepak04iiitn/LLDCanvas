/**
 * Design Studio "Change One Thing" packs — hard C (orders 490–501).
 *
 * Staff-level change requests: failure handling, scale, ownership and
 * architectural constraints on small but realistic systems.
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

function brief(going: string, problem: string, todo: string, start: string): string {
  return (
    'What’s going on\n' + going + '\n\n' +
    'The change (simple terms)\n' + problem + '\n\n' +
    'What you should do\n' + todo + '\n\n' +
    'Where to start\n' + start
  )
}

export const HARD_C: ChangePackSeed[] = [
  // ── 490 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-two-phase-commit-lite',
    title: 'Coordinate Inventory and Wallet Prepare',
    difficulty: 'hard',
    order: 490,
    description:
      'Checkout reserves stock and debits a wallet as two independent calls. A failure or crash between them leaves money or stock stranded. Make the two steps succeed or fail together.',
    tags: ['checkout', 'consistency', 'failure', 'behavior'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-tpc-checkout', 'CheckoutService', pos(1, 0), [
        'placeOrder', 'reserveStock', 'debitWallet', 'confirmOrder',
      ]),
      node('n2', 'co-tpc-inv', 'InventoryService', pos(0, 1), ['reserve', 'release', 'getAvailable']),
      node('n3', 'co-tpc-wallet', 'WalletService', pos(1, 1), ['debit', 'credit', 'getBalance']),
      node('n4', 'co-tpc-orders', 'OrderRepository', pos(2, 1), ['save', 'findById']),
      node('n5', 'co-tpc-mail', 'ReceiptMailer', pos(2, 2), ['sendReceipt']),
      node('n6', 'co-tpc-audit', 'AuditLog', pos(0, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-co-tpc-1', 'n1', 'n2'),
      edge('e2', 'ed-co-tpc-2', 'n1', 'n3'),
      edge('e3', 'ed-co-tpc-3', 'n1', 'n4'),
      edge('e4', 'ed-co-tpc-4', 'n1', 'n5'),
      edge('e5', 'ed-co-tpc-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Coordinate Inventory and Wallet Prepare',
      body:
        'Support keeps finding orders where the wallet was debited but the stock reservation failed, or stock is held for a customer who was never charged. Both services must first agree they can do the work (prepare), and only then both apply it (commit) — otherwise both back out (abort). A crash halfway through must be recoverable on restart.',
      type: 'failure',
    },
    briefing: brief(
      'CheckoutService calls InventoryService.reserve and then WalletService.debit one after the other, then saves the order. Each call succeeds or fails on its own.',
      'If the wallet debit fails after stock is reserved — or the process dies between the two calls — the system is left half-done with nobody responsible for cleaning up.',
      'Add one owner for the multi-step transaction that asks both participants to prepare, records its decision durably, then commits or aborts both. Checkout should only talk to that owner for this step. Keep order saving, receipts and audit working.',
      'CheckoutService.placeOrder is where the two calls are made. Think about what must be written down before the commit decision is acted on.',
    ),
    constraints: [
      'Either both stock and funds are applied, or neither is',
      'The commit/abort decision must be durable so a crash can be recovered',
      'No distributed locks and no new external infrastructure',
      'Do not change OrderRepository or ReceiptMailer',
    ],
    forbidModifyElementNames: ['OrderRepository', 'ReceiptMailer'],
    expectedTouchHints: ['CheckoutService', 'InventoryService', 'WalletService', 'TransactionCoordinator', 'TransactionLog'],
    protectedFlows: [
      {
        id: 'save-order',
        label: 'Save Confirmed Order',
        steps: ['Confirm order', 'Persist order'],
        mustKeepElementNames: ['CheckoutService', 'InventoryService', 'WalletService'],
        mustReach: [{ from: 'CheckoutService', to: 'OrderRepository' }],
        mustHavePathTopics: ['placeorder'],
      },
      {
        id: 'receipt',
        label: 'Send Receipt',
        steps: ['Email receipt after confirmation'],
        mustReach: [{ from: 'CheckoutService', to: 'ReceiptMailer' }],
        mustHavePathTopics: ['receipt'],
      },
      {
        id: 'audit',
        label: 'Audit Checkout',
        mustReach: [{ from: 'CheckoutService', to: 'AuditLog' }],
      },
    ],
    newFlows: [
      {
        id: 'prepare-commit',
        label: 'Prepare Both, Then Commit',
        steps: ['Ask inventory to prepare', 'Ask wallet to prepare', 'Log decision', 'Commit both'],
        mustReach: [
          { from: 'CheckoutService', to: 'TransactionCoordinator' },
          { from: 'TransactionCoordinator', to: 'InventoryService' },
          { from: 'TransactionCoordinator', to: 'WalletService' },
          { from: 'TransactionCoordinator', to: 'TransactionLog' },
        ],
        mustHavePathTopics: ['prepare', 'commit'],
      },
      {
        id: 'abort-together',
        label: 'Abort Both On Any Failure',
        steps: ['A participant refuses or times out', 'Abort the other participant', 'Log the abort'],
        mustHavePathTopics: ['abort'],
      },
    ],
  }),

  // ── 491 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-read-your-writes',
    title: 'Guarantee Read-Your-Writes After Place Order',
    difficulty: 'hard',
    order: 491,
    description:
      'Reads go to replicas to scale, but a customer who just placed an order sometimes opens "My Orders" and does not see it. Fix that without sending all reads back to the primary.',
    tags: ['orders', 'replication', 'scale', 'behavior'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-ryw-ctrl', 'OrderController', pos(1, 0), ['placeOrder', 'getMyOrders']),
      node('n2', 'co-ryw-cmd', 'OrderCommandService', pos(0, 1), ['place', 'cancel']),
      node('n3', 'co-ryw-query', 'OrderQueryService', pos(2, 1), ['listForUser', 'getById']),
      node('n4', 'co-ryw-primary', 'OrderWriteStore', pos(0, 2), ['insert', 'update']),
      node('n5', 'co-ryw-replica', 'OrderReadReplica', pos(2, 2), ['selectByUser', 'selectById']),
      node('n6', 'co-ryw-session', 'SessionStore', pos(1, 2), ['getSession', 'touch']),
    ],
    edges: [
      edge('e1', 'ed-co-ryw-1', 'n1', 'n2'),
      edge('e2', 'ed-co-ryw-2', 'n1', 'n3'),
      edge('e3', 'ed-co-ryw-3', 'n2', 'n4'),
      edge('e4', 'ed-co-ryw-4', 'n3', 'n5'),
      edge('e5', 'ed-co-ryw-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Guarantee Read-Your-Writes After Place Order',
      body:
        'Replica lag is usually under a second but spikes to several seconds at peak. A customer who places an order and immediately opens "My Orders" must see it. Other users and background browsing should keep reading from replicas so the primary does not become the bottleneck.',
      type: 'scale',
    },
    briefing: brief(
      'Writes go to OrderWriteStore, reads go to OrderReadReplica. The controller uses a session to know who the caller is.',
      'The replica can be behind the primary. Right after a write, the same user can read a stale list that is missing their own order.',
      'Give the system a way to remember how fresh a user’s data needs to be, and let the read path decide between replica and primary based on that. It should only cost the user who just wrote something — everyone else stays on replicas.',
      'The command side knows what was just written; the query side decides where to read. Something has to connect the two without them depending on each other.',
    ),
    constraints: [
      'Only users with a recent write may fall back to the primary',
      'Do not route all reads to the primary',
      'OrderCommandService and OrderQueryService must not depend directly on each other',
      'Do not change SessionStore',
    ],
    forbidModifyElementNames: ['SessionStore'],
    expectedTouchHints: ['OrderCommandService', 'OrderQueryService', 'ConsistencyTracker'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Place Order',
        steps: ['Controller calls command service', 'Insert into primary'],
        mustKeepElementNames: ['OrderCommandService', 'OrderWriteStore'],
        mustReach: [{ from: 'OrderCommandService', to: 'OrderWriteStore' }],
        mustHavePathTopics: ['place'],
      },
      {
        id: 'browse-replica',
        label: 'Browse From Replica',
        steps: ['Users without recent writes read from replica'],
        mustReach: [{ from: 'OrderQueryService', to: 'OrderReadReplica' }],
        mustHavePathTopics: ['listforuser'],
      },
      {
        id: 'session',
        label: 'Identify Caller',
        mustReach: [{ from: 'OrderController', to: 'SessionStore' }],
      },
    ],
    newFlows: [
      {
        id: 'record-write',
        label: 'Record Write Position',
        steps: ['Order is written', 'Remember user’s latest write position'],
        mustReach: [{ from: 'OrderCommandService', to: 'ConsistencyTracker' }],
        mustHavePathTopics: ['consistency'],
      },
      {
        id: 'fresh-read',
        label: 'Read Fresh When Needed',
        steps: ['Check whether replica has caught up', 'Fall back to primary only if not'],
        mustReach: [
          { from: 'OrderQueryService', to: 'ConsistencyTracker' },
          { from: 'OrderQueryService', to: 'OrderWriteStore' },
        ],
      },
    ],
  }),

  // ── 492 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-token-rotation-zero-downtime',
    title: 'Rotate API Tokens With Zero Downtime',
    difficulty: 'hard',
    order: 492,
    description:
      'Partners can only replace an API token by revoking the old one first, which breaks their integration for minutes. Support an overlap window where old and new both work.',
    tags: ['security', 'tokens', 'failure', 'constraint'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-rot-gw', 'ApiGateway', pos(1, 0), ['handle', 'authenticate']),
      node('n2', 'co-rot-val', 'TokenValidator', pos(0, 1), ['validate']),
      node('n3', 'co-rot-store', 'TokenStore', pos(0, 2), ['findByHash', 'save', 'delete']),
      node('n4', 'co-rot-admin', 'AdminController', pos(2, 1), ['issueToken', 'revokeToken']),
      node('n5', 'co-rot-clients', 'ClientRegistry', pos(1, 2), ['getClient', 'isActive']),
      node('n6', 'co-rot-audit', 'AuditLog', pos(2, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-co-rot-1', 'n1', 'n2'),
      edge('e2', 'ed-co-rot-2', 'n2', 'n3'),
      edge('e3', 'ed-co-rot-3', 'n2', 'n5'),
      edge('e4', 'ed-co-rot-4', 'n4', 'n3'),
      edge('e5', 'ed-co-rot-5', 'n4', 'n6'),
    ],
    changeRequest: {
      title: 'Rotate API Tokens With Zero Downtime',
      body:
        'Security wants tokens rotated every 90 days. Today a partner must be told the new token and the old one is revoked immediately, causing an outage until they deploy. Rotation must create a new token while the old one stays valid for a limited grace period, then expire on its own. Every rotation step must be audited, and a leaked old token must still be revocable instantly.',
      type: 'constraint',
    },
    briefing: brief(
      'ApiGateway authenticates each call through TokenValidator, which looks up a hash in TokenStore. AdminController issues and revokes tokens.',
      'There is exactly one valid token per client. Replacing it kills the old one at once, so partners cannot switch over safely.',
      'Introduce a rotation capability that owns the grace window, lets validation accept either token while it is open, and retires the old one afterwards. Keep the gateway unaware of rotation and keep instant revocation working.',
      'The validator decides what counts as valid, so that is where the overlap rule has to be visible. Who decides when the window ends?',
    ),
    constraints: [
      'Old and new token are both valid during the grace period',
      'Instant revoke must still invalidate a token immediately, even in the grace period',
      'ApiGateway must not know about rotation',
      'Every rotation step is written to the audit log',
    ],
    forbidModifyElementNames: ['ApiGateway', 'ClientRegistry'],
    expectedTouchHints: ['TokenValidator', 'TokenStore', 'TokenRotationService', 'AdminController'],
    protectedFlows: [
      {
        id: 'authenticate',
        label: 'Authenticate Request',
        steps: ['Gateway delegates to validator', 'Validator checks token hash', 'Client must be active'],
        mustKeepElementNames: ['ApiGateway', 'TokenValidator'],
        mustReach: [
          { from: 'ApiGateway', to: 'TokenValidator' },
          { from: 'TokenValidator', to: 'TokenStore' },
          { from: 'TokenValidator', to: 'ClientRegistry' },
        ],
        mustHavePathTopics: ['validate'],
      },
      {
        id: 'revoke',
        label: 'Instant Revoke',
        steps: ['Admin revokes a token', 'Token no longer validates'],
        mustReach: [{ from: 'AdminController', to: 'TokenStore' }],
        mustHavePathTopics: ['revoke'],
      },
    ],
    newFlows: [
      {
        id: 'rotate',
        label: 'Rotate With Grace Window',
        steps: ['Issue new token', 'Mark old token as expiring', 'Audit rotation'],
        mustReach: [
          { from: 'AdminController', to: 'TokenRotationService' },
          { from: 'TokenRotationService', to: 'TokenStore' },
          { from: 'TokenRotationService', to: 'AuditLog' },
        ],
        mustHavePathTopics: ['rotat', 'grace'],
      },
    ],
  }),

  // ── 493 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-multi-tenant-rate-budgets',
    title: 'Per-Tenant Rate Budgets',
    difficulty: 'hard',
    order: 493,
    description:
      'One global rate limit lets a single noisy tenant starve everyone else. Give each tenant its own budget derived from its plan, without making the hot path slower.',
    tags: ['rate-limit', 'multi-tenant', 'scale', 'ownership'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-bud-gw', 'ApiGateway', pos(1, 0), ['handle', 'reject']),
      node('n2', 'co-bud-limiter', 'RateLimiter', pos(1, 1), ['allow']),
      node('n3', 'co-bud-counter', 'CounterStore', pos(0, 2), ['increment', 'expire']),
      node('n4', 'co-bud-tenants', 'TenantRegistry', pos(2, 1), ['getTenant', 'resolveFromKey']),
      node('n5', 'co-bud-plans', 'PlanCatalog', pos(2, 2), ['getLimits', 'getPlan']),
      node('n6', 'co-bud-metrics', 'MetricsClient', pos(0, 1), ['emit']),
    ],
    edges: [
      edge('e1', 'ed-co-bud-1', 'n1', 'n2'),
      edge('e2', 'ed-co-bud-2', 'n2', 'n3'),
      edge('e3', 'ed-co-bud-3', 'n1', 'n4'),
      edge('e4', 'ed-co-bud-4', 'n2', 'n6'),
    ],
    changeRequest: {
      title: 'Per-Tenant Rate Budgets',
      body:
        'A single enterprise tenant ran a backfill last week and consumed the shared 10,000 req/min limit, so every other tenant got 429s. Each tenant needs its own budget, sized by its plan (Free, Pro, Enterprise). The decision runs on every request, so it cannot add a network call per request to look up plans. The billing team owns plan definitions and must remain the only owner.',
      type: 'scale',
    },
    briefing: brief(
      'ApiGateway asks RateLimiter whether to allow a request. RateLimiter increments one global counter in CounterStore. TenantRegistry and PlanCatalog exist but the limiter ignores them.',
      'Everyone shares one bucket. Noisy tenants hurt quiet ones, and paying customers get the same limit as free users.',
      'Make the limit per tenant, with the allowance coming from the tenant’s plan. Keep plan data owned by PlanCatalog, keep the limiter fast, and make rejections observable per tenant.',
      'The limiter needs two things it does not have today: who is calling, and how much they are allowed. Decide which class should combine them.',
    ),
    constraints: [
      'PlanCatalog stays the single owner of plan limits',
      'Counters are keyed per tenant, not global',
      'Plan lookups must be cached — no extra remote call on every request',
      'Do not change PlanCatalog or TenantRegistry',
    ],
    forbidModifyElementNames: ['PlanCatalog', 'TenantRegistry'],
    expectedTouchHints: ['RateLimiter', 'TenantBudgetPolicy', 'CounterStore'],
    protectedFlows: [
      {
        id: 'throttle',
        label: 'Throttle Requests',
        steps: ['Gateway asks limiter', 'Limiter counts the request'],
        mustKeepElementNames: ['ApiGateway', 'RateLimiter', 'CounterStore'],
        mustReach: [
          { from: 'ApiGateway', to: 'RateLimiter' },
          { from: 'RateLimiter', to: 'CounterStore' },
        ],
        mustHavePathTopics: ['allow'],
      },
      {
        id: 'metrics',
        label: 'Emit Limiter Metrics',
        mustReach: [{ from: 'RateLimiter', to: 'MetricsClient' }],
      },
    ],
    newFlows: [
      {
        id: 'tenant-budget',
        label: 'Resolve Tenant Budget',
        steps: ['Identify tenant', 'Find its plan limits (cached)', 'Count against that tenant'],
        mustReach: [
          { from: 'RateLimiter', to: 'TenantBudgetPolicy' },
          { from: 'TenantBudgetPolicy', to: 'TenantRegistry' },
          { from: 'TenantBudgetPolicy', to: 'PlanCatalog' },
        ],
        mustHavePathTopics: ['tenant', 'budget'],
      },
    ],
  }),

  // ── 494 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-chaos-inject-latency',
    title: 'Add Chaos Latency Injection Point',
    difficulty: 'hard',
    order: 494,
    description:
      'The team wants to test timeouts and retries by injecting latency into outbound calls in staging. Do it at one seam, behind a flag, without touching business clients.',
    tags: ['resilience', 'chaos', 'failure', 'capability'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-chaos-pay', 'PaymentClient', pos(0, 0), ['charge', 'refund']),
      node('n2', 'co-chaos-inv', 'InventoryClient', pos(2, 0), ['reserve', 'release']),
      node('n3', 'co-chaos-res', 'ResiliencePolicy', pos(1, 1), ['execute']),
      node('n4', 'co-chaos-http', 'HttpTransport', pos(1, 2), ['send']),
      node('n5', 'co-chaos-flags', 'FeatureFlagService', pos(2, 2), ['isEnabled', 'getVariant']),
      node('n6', 'co-chaos-metrics', 'MetricsClient', pos(0, 2), ['emit']),
    ],
    edges: [
      edge('e1', 'ed-co-chaos-1', 'n1', 'n3'),
      edge('e2', 'ed-co-chaos-2', 'n2', 'n3'),
      edge('e3', 'ed-co-chaos-3', 'n3', 'n4'),
      edge('e4', 'ed-co-chaos-4', 'n3', 'n6'),
    ],
    changeRequest: {
      title: 'Add Chaos Latency Injection Point',
      body:
        'Before the next peak we want to rehearse slow dependencies. In non-production environments, a configurable fraction of outbound calls should be delayed by a configurable amount for chosen targets. It must be impossible to enable in production by accident, and the injected delay must exercise the same timeouts and retries a real slow dependency would.',
      type: 'failure',
    },
    briefing: brief(
      'PaymentClient and InventoryClient make remote calls through ResiliencePolicy (timeouts, retries), which sends them over HttpTransport. FeatureFlagService already exists for toggles.',
      'There is no safe way to make a dependency slow on purpose. Hacking delays into the clients would pollute business code and could ship to production.',
      'Add a single injection point on the outbound path, controlled by rules and a flag, positioned so that resilience logic sees the delay. Business clients should not know it exists.',
      'If the delay is added above ResiliencePolicy it will never trigger a timeout. Think about which side of the policy the fault belongs on.',
    ),
    constraints: [
      'Business clients must not change',
      'Injection must be off unless explicitly enabled and never active in production',
      'The delay must occur beneath the resilience policy so timeouts and retries are exercised',
      'Keep one injection seam — do not add checks to each client',
    ],
    forbidModifyElementNames: ['PaymentClient', 'InventoryClient'],
    expectedTouchHints: ['HttpTransport', 'FaultInjector', 'ChaosRuleStore'],
    protectedFlows: [
      {
        id: 'payment-call',
        label: 'Payment Call Path',
        steps: ['Client wraps call in policy', 'Policy sends over transport'],
        mustKeepElementNames: ['PaymentClient', 'ResiliencePolicy', 'HttpTransport'],
        mustReach: [
          { from: 'PaymentClient', to: 'ResiliencePolicy' },
          { from: 'PaymentClient', to: 'HttpTransport' },
        ],
        mustHavePathTopics: ['charge', 'execute'],
      },
      {
        id: 'inventory-call',
        label: 'Inventory Call Path',
        mustReach: [
          { from: 'InventoryClient', to: 'ResiliencePolicy' },
          { from: 'InventoryClient', to: 'HttpTransport' },
        ],
      },
      {
        id: 'metrics',
        label: 'Call Metrics',
        mustReach: [{ from: 'ResiliencePolicy', to: 'MetricsClient' }],
      },
    ],
    newFlows: [
      {
        id: 'inject-latency',
        label: 'Inject Latency On Transport',
        steps: ['Transport asks injector for a delay', 'Injector checks flag and rules', 'Delay applied before send'],
        mustReach: [
          { from: 'HttpTransport', to: 'FaultInjector' },
          { from: 'FaultInjector', to: 'FeatureFlagService' },
        ],
        mustHavePathTopics: ['inject', 'latency'],
      },
    ],
  }),

  // ── 495 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-privacy-consent-gate',
    title: 'Marketing Must Respect Consent',
    difficulty: 'hard',
    order: 495,
    description:
      'Marketing reads the full user table to build campaign audiences, including people who opted out. Make it structurally impossible for marketing code to reach users without consent.',
    tags: ['privacy', 'consent', 'constraint'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-cons-mkt', 'MarketingService', pos(1, 0), ['sendCampaign', 'buildAudience']),
      node('n2', 'co-cons-users', 'UserRepository', pos(0, 1), ['findAll', 'findById', 'findBySegment']),
      node('n3', 'co-cons-mail', 'EmailSender', pos(1, 1), ['send']),
      node('n4', 'co-cons-camp', 'CampaignRepository', pos(2, 1), ['save', 'findById']),
      node('n5', 'co-cons-notifier', 'OrderNotifier', pos(1, 2), ['sendShippedNotice', 'sendInvoiceNotice']),
      node('n6', 'co-cons-audit', 'AuditLog', pos(2, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-co-cons-1', 'n1', 'n2'),
      edge('e2', 'ed-co-cons-2', 'n1', 'n3'),
      edge('e3', 'ed-co-cons-3', 'n1', 'n4'),
      edge('e4', 'ed-co-cons-4', 'n5', 'n3'),
      edge('e5', 'ed-co-cons-5', 'n5', 'n2'),
    ],
    changeRequest: {
      title: 'Marketing Must Respect Consent',
      body:
        'Legal found that MarketingService emailed users who withdrew marketing consent. Consent must be enforced where users are read, not remembered by each developer. Marketing may only see users who currently have consent for the specific purpose, and every audience built should be auditable. Transactional notices such as shipping updates are not marketing and must still reach every customer.',
      type: 'constraint',
    },
    briefing: brief(
      'MarketingService calls UserRepository directly to build audiences, then sends through EmailSender. OrderNotifier also sends email to customers for shipping and invoices.',
      'Nothing checks consent. Any new marketing feature can read any user, so the next mistake is one line away.',
      'Put a consent decision between marketing and users so marketing has no path to UserRepository at all, only to consenting audiences. Do not apply that gate to transactional notices.',
      'It is not enough to add an if-statement in MarketingService. The rule says there must be no dependency path from marketing to the raw user store.',
    ),
    constraints: [
      'MarketingService must have no path to UserRepository',
      'Consent is checked per purpose and evaluated at read time',
      'Transactional notices via OrderNotifier are not gated by marketing consent',
      'Audience builds are written to the audit log',
    ],
    forbidModifyElementNames: ['EmailSender', 'OrderNotifier'],
    expectedTouchHints: ['MarketingService', 'ConsentedAudience', 'ConsentGate', 'ConsentRegistry'],
    protectedFlows: [
      {
        id: 'send-campaign',
        label: 'Send Campaign',
        steps: ['Build audience', 'Send emails', 'Save campaign'],
        mustKeepElementNames: ['MarketingService', 'EmailSender', 'CampaignRepository'],
        mustReach: [
          { from: 'MarketingService', to: 'EmailSender' },
          { from: 'MarketingService', to: 'CampaignRepository' },
        ],
        mustHavePathTopics: ['sendcampaign'],
      },
      {
        id: 'transactional',
        label: 'Transactional Notices Ungated',
        steps: ['Order notifier reads user', 'Sends shipping and invoice notices'],
        mustReach: [
          { from: 'OrderNotifier', to: 'UserRepository' },
          { from: 'OrderNotifier', to: 'EmailSender' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'no-raw-users',
        label: 'Marketing Cannot Read Raw Users',
        steps: ['Marketing depends on an audience abstraction', 'Gate implements it with consent filtering'],
        mustReach: [
          { from: 'MarketingService', to: 'ConsentedAudience' },
          { from: 'ConsentGate', to: 'ConsentRegistry' },
          { from: 'ConsentGate', to: 'UserRepository' },
        ],
        mustNotReach: [{ from: 'MarketingService', to: 'UserRepository' }],
        mustHavePathTopics: ['consent'],
      },
      {
        id: 'audit-audience',
        label: 'Audit Audience Builds',
        mustReach: [{ from: 'ConsentGate', to: 'AuditLog' }],
      },
    ],
  }),

  // ── 496 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-hot-key-shard',
    title: 'Mitigate Hot Key on Product Cache',
    difficulty: 'hard',
    order: 496,
    description:
      'One viral product takes most traffic and all of it hits a single cache shard, which saturates while the rest of the cluster idles. Spread hot-key load without changing the product API.',
    tags: ['cache', 'hot-key', 'scale'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-hot-ctrl', 'ProductController', pos(1, 0), ['getProduct']),
      node('n2', 'co-hot-svc', 'ProductService', pos(1, 1), ['getProduct', 'updateProduct']),
      node('n3', 'co-hot-cache', 'ProductCache', pos(0, 2), ['get', 'put', 'invalidate']),
      node('n4', 'co-hot-redis', 'RedisClient', pos(0, 3), ['get', 'set', 'del']),
      node('n5', 'co-hot-repo', 'ProductRepository', pos(2, 2), ['findById', 'save']),
      node('n6', 'co-hot-metrics', 'MetricsClient', pos(2, 1), ['emit']),
    ],
    edges: [
      edge('e1', 'ed-co-hot-1', 'n1', 'n2'),
      edge('e2', 'ed-co-hot-2', 'n2', 'n3'),
      edge('e3', 'ed-co-hot-3', 'n3', 'n4'),
      edge('e4', 'ed-co-hot-4', 'n2', 'n5'),
      edge('e5', 'ed-co-hot-5', 'n2', 'n6'),
    ],
    changeRequest: {
      title: 'Mitigate Hot Key on Product Cache',
      body:
        'During a flash sale a single product key took 80% of cache traffic. All reads land on the one Redis shard owning that key, so latency spiked while other shards were idle. Detect hot keys automatically and serve them from multiple places, while preserving invalidation: when a product changes, every copy must go.',
      type: 'scale',
    },
    briefing: brief(
      'ProductService does cache-aside through ProductCache over RedisClient and falls back to ProductRepository. The cache key is simply the product id.',
      'A single key lives on a single shard, so no matter how many cache servers you add, one popular product caps throughput.',
      'Add hot-key awareness: notice which keys are hot, and serve those from spread-out copies (for example key replicas and a small in-process layer). Make updates invalidate every copy so reads do not go stale.',
      'ProductCache is the seam. ProductService should not learn how keys are replicated.',
    ),
    constraints: [
      'Detection is automatic — no hard-coded product ids',
      'Invalidation must remove all replicas and local copies',
      'ProductService callers see no API change',
      'Do not change ProductRepository',
    ],
    forbidModifyElementNames: ['ProductRepository', 'ProductController'],
    expectedTouchHints: ['ProductCache', 'HotKeyDetector', 'LocalNearCache', 'ReplicaKeyRouter'],
    protectedFlows: [
      {
        id: 'read-through',
        label: 'Cache-Aside Read',
        steps: ['Look in cache', 'Fall back to database'],
        mustKeepElementNames: ['ProductService', 'ProductCache', 'RedisClient'],
        mustReach: [
          { from: 'ProductController', to: 'ProductService' },
          { from: 'ProductService', to: 'ProductCache' },
          { from: 'ProductCache', to: 'RedisClient' },
          { from: 'ProductService', to: 'ProductRepository' },
        ],
        mustHavePathTopics: ['getproduct'],
      },
      {
        id: 'update',
        label: 'Update And Invalidate',
        steps: ['Save product', 'Invalidate cached copies'],
        mustReach: [{ from: 'ProductService', to: 'ProductRepository' }],
        mustHavePathTopics: ['invalidate'],
      },
    ],
    newFlows: [
      {
        id: 'detect-hot',
        label: 'Detect Hot Keys',
        steps: ['Count reads per key in a sliding window', 'Flag keys above threshold'],
        mustReach: [{ from: 'ProductCache', to: 'HotKeyDetector' }],
        mustHavePathTopics: ['hot'],
      },
      {
        id: 'spread-hot',
        label: 'Spread Hot Key Reads',
        steps: ['Hot key reads pick a replica or local copy', 'Invalidation clears all copies'],
        mustReach: [
          { from: 'ProductCache', to: 'LocalNearCache' },
          { from: 'ProductCache', to: 'ReplicaKeyRouter' },
          { from: 'ReplicaKeyRouter', to: 'RedisClient' },
        ],
        mustHavePathTopics: ['replica'],
      },
    ],
  }),

  // ── 497 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-deferred-consistency-ui',
    title: 'Show Pending State Until Projection Catches Up',
    difficulty: 'hard',
    order: 497,
    description:
      'After an order is placed, the UI polls a read model that is updated asynchronously, and shows "Order not found" for a moment. Surface an honest pending state instead.',
    tags: ['cqrs', 'eventual-consistency', 'behavior', 'scale'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-def-ctrl', 'OrderController', pos(1, 0), ['placeOrder', 'getOrderView']),
      node('n2', 'co-def-cmd', 'OrderCommandHandler', pos(0, 1), ['handlePlace']),
      node('n3', 'co-def-store', 'EventStore', pos(0, 2), ['append', 'load']),
      node('n4', 'co-def-bus', 'EventBus', pos(1, 2), ['publish', 'subscribe']),
      node('n5', 'co-def-proj', 'OrderProjector', pos(2, 2), ['apply']),
      node('n6', 'co-def-read', 'OrderReadModel', pos(2, 1), ['findById', 'upsert']),
    ],
    edges: [
      edge('e1', 'ed-co-def-1', 'n1', 'n2'),
      edge('e2', 'ed-co-def-2', 'n1', 'n6'),
      edge('e3', 'ed-co-def-3', 'n2', 'n3'),
      edge('e4', 'ed-co-def-4', 'n3', 'n4'),
      edge('e5', 'ed-co-def-5', 'n4', 'n5'),
      edge('e6', 'ed-co-def-6', 'n5', 'n6'),
    ],
    changeRequest: {
      title: 'Show Pending State Until Projection Catches Up',
      body:
        'The order screen immediately fetches the order after placing it. The event has been stored but the projector has not applied it yet, so the API returns "not found" and users re-submit, creating duplicates. The API should be able to tell the difference between "does not exist" and "exists but not visible yet", and return a pending view in the second case.',
      type: 'behavior',
    },
    briefing: brief(
      'Commands append events to EventStore, which publishes them on EventBus. OrderProjector updates OrderReadModel eventually, and OrderController reads straight from that read model.',
      'The read model has no idea how far behind it is, so a missing row could mean either an unknown order or one that simply has not been projected yet.',
      'Track how far the projection has progressed, let the command side hand back the version of what it wrote, and have the read path compare the two to return a pending state when appropriate.',
      'You need a checkpoint the projector advances, and a read-side piece that compares it with the version the client is waiting for.',
    ),
    constraints: [
      'Do not make placeOrder wait for the projection (stay asynchronous)',
      'Pending must be distinguishable from not found',
      'The projector must advance a checkpoint only after the read model is updated',
      'Do not change EventStore',
    ],
    forbidModifyElementNames: ['EventStore'],
    expectedTouchHints: ['OrderController', 'OrderProjector', 'ProjectionCheckpoint', 'OrderStatusResolver'],
    protectedFlows: [
      {
        id: 'write-path',
        label: 'Write And Project',
        steps: ['Command appends event', 'Bus delivers to projector', 'Read model updated'],
        mustKeepElementNames: ['OrderCommandHandler', 'EventStore', 'EventBus', 'OrderProjector'],
        mustReach: [
          { from: 'OrderCommandHandler', to: 'EventStore' },
          { from: 'EventStore', to: 'EventBus' },
          { from: 'EventBus', to: 'OrderProjector' },
          { from: 'OrderProjector', to: 'OrderReadModel' },
        ],
        mustHavePathTopics: ['append', 'apply'],
      },
      {
        id: 'read-path',
        label: 'Read Order View',
        mustReach: [{ from: 'OrderController', to: 'OrderReadModel' }],
        mustHavePathTopics: ['getorderview'],
      },
    ],
    newFlows: [
      {
        id: 'checkpoint',
        label: 'Advance Projection Checkpoint',
        steps: ['Projector applies event', 'Records latest processed version'],
        mustReach: [{ from: 'OrderProjector', to: 'ProjectionCheckpoint' }],
        mustHavePathTopics: ['checkpoint'],
      },
      {
        id: 'pending-view',
        label: 'Return Pending When Behind',
        steps: ['Read side compares requested version with checkpoint', 'Returns pending instead of not found'],
        mustReach: [
          { from: 'OrderController', to: 'ProjectionCheckpoint' },
          { from: 'OrderController', to: 'OrderStatusResolver' },
        ],
        mustHavePathTopics: ['pending'],
      },
    ],
  }),

  // ── 498 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-vendor-lock-escape',
    title: 'Escape Direct AWS SDK Coupling',
    difficulty: 'hard',
    order: 498,
    description:
      'Domain and batch code call the AWS S3 client directly. A customer demands on-prem storage. Break the coupling so the domain depends on a storage abstraction, not a vendor.',
    tags: ['hexagonal', 'storage', 'vendor-lock', 'constraint'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-lock-order', 'Order', pos(1, 0), ['finalize', 'exportInvoice', 'attachDocument']),
      node('n2', 'co-lock-pdf', 'PdfRenderer', pos(0, 1), ['render']),
      node('n3', 'co-lock-s3', 'S3Client', pos(1, 2), ['putObject', 'getObject', 'deleteObject']),
      node('n4', 'co-lock-job', 'ReportJob', pos(2, 0), ['runMonthly']),
      node('n5', 'co-lock-sign', 'SignedUrlService', pos(2, 1), ['createLink']),
      node('n6', 'co-lock-audit', 'AuditLog', pos(0, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-co-lock-1', 'n1', 'n2'),
      edge('e2', 'ed-co-lock-2', 'n1', 'n3'),
      edge('e3', 'ed-co-lock-3', 'n4', 'n3'),
      edge('e4', 'ed-co-lock-4', 'n5', 'n3'),
      edge('e5', 'ed-co-lock-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Escape Direct AWS SDK Coupling',
      body:
        'Sales signed a customer that must keep documents on their own on-prem object store. Today Order and ReportJob call S3Client directly, so every swap means editing domain code. Introduce a storage boundary so domain classes depend on an abstraction, and S3 becomes one replaceable implementation. Existing invoice export and signed links must keep working on S3.',
      type: 'constraint',
    },
    briefing: brief(
      'Order renders invoices with PdfRenderer and uploads them straight to S3Client. ReportJob and SignedUrlService also use S3Client. Everything knows the AWS API.',
      'The domain is welded to one vendor. An on-prem store cannot be added without touching business classes.',
      'Define a storage port owned by the domain and adapt S3Client behind it. Move Order and ReportJob onto the port. Keep signed links working by letting them go through the same boundary or an equivalent port.',
      'Draw the dependency so the arrow points from the adapter to the port, not from the domain to S3Client. Order and ReportJob must end up with no path to S3Client.',
    ),
    constraints: [
      'Order and ReportJob must have no path to S3Client',
      'S3 stays supported as one implementation of the new abstraction',
      'Invoice export and audit behaviour must be unchanged',
      'Do not change PdfRenderer',
    ],
    forbidModifyElementNames: ['PdfRenderer'],
    expectedTouchHints: ['Order', 'ReportJob', 'BlobStore', 'S3BlobStore'],
    protectedFlows: [
      {
        id: 'export-invoice',
        label: 'Export Invoice',
        steps: ['Render invoice PDF', 'Persist document', 'Audit export'],
        mustKeepElementNames: ['Order', 'PdfRenderer', 'S3Client'],
        mustReach: [
          { from: 'Order', to: 'PdfRenderer' },
          { from: 'Order', to: 'AuditLog' },
        ],
        mustHavePathTopics: ['exportinvoice'],
      },
      {
        id: 'signed-links',
        label: 'Signed Links Still Work',
        steps: ['Create a time-limited link for a stored document'],
        mustKeepElementNames: ['SignedUrlService'],
        mustHavePathTopics: ['createlink'],
      },
    ],
    newFlows: [
      {
        id: 'storage-port',
        label: 'Domain Depends On Storage Port',
        steps: ['Order and ReportJob use a storage abstraction', 'S3 adapter implements it'],
        mustReach: [
          { from: 'Order', to: 'BlobStore' },
          { from: 'ReportJob', to: 'BlobStore' },
          { from: 'S3BlobStore', to: 'S3Client' },
          { from: 'S3BlobStore', to: 'BlobStore' },
        ],
        mustNotReach: [
          { from: 'Order', to: 'S3Client' },
          { from: 'ReportJob', to: 'S3Client' },
        ],
        mustHavePathTopics: ['blob', 'store'],
      },
    ],
  }),

  // ── 499 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-canary-release-matcher',
    title: 'Canary Release Matchmaking Algorithm',
    difficulty: 'hard',
    order: 499,
    description:
      'A new matchmaking algorithm is ready but risky. Roll it out to a small, stable slice of players, compare outcomes with the current one, and keep the ability to dial it back instantly.',
    tags: ['matchmaking', 'canary', 'variation', 'scale'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-can-mm', 'MatchmakingService', pos(1, 0), ['findMatch', 'tick']),
      node('n2', 'co-can-elo', 'EloMatcher', pos(0, 1), ['pair']),
      node('n3', 'co-can-pool', 'PlayerPool', pos(1, 1), ['getWaiting', 'remove']),
      node('n4', 'co-can-lobby', 'LobbyService', pos(2, 1), ['createLobby']),
      node('n5', 'co-can-metrics', 'MetricsClient', pos(2, 2), ['emit']),
      node('n6', 'co-can-rollout', 'RolloutConfig', pos(0, 2), ['getPercent', 'isKilled']),
    ],
    edges: [
      edge('e1', 'ed-co-can-1', 'n1', 'n2'),
      edge('e2', 'ed-co-can-2', 'n1', 'n3'),
      edge('e3', 'ed-co-can-3', 'n1', 'n4'),
      edge('e4', 'ed-co-can-4', 'n1', 'n5'),
    ],
    changeRequest: {
      title: 'Canary Release Matchmaking Algorithm',
      body:
        'A skill-bucket matcher should replace the Elo matcher, but nobody trusts it with 100% of players yet. Serve it to a configurable percentage of players, chosen deterministically so a given player always gets the same algorithm during a session. Tag match-quality metrics with the algorithm so results can be compared, and honour a kill switch that sends everyone back to Elo immediately.',
      type: 'variation',
    },
    briefing: brief(
      'MatchmakingService pulls waiting players from PlayerPool, pairs them with EloMatcher, creates lobbies and emits metrics. RolloutConfig exists with a percentage and a kill switch, but nothing uses it.',
      'There is exactly one algorithm baked in. Introducing a second would currently mean replacing the first for everybody.',
      'Make the algorithm a replaceable choice, add the new matcher, and decide per player which one applies using the rollout config. Emit metrics tagged by variant. Keep Elo untouched and always the safe fallback.',
      'Look at how MatchmakingService is welded to EloMatcher. The decision about who gets which variant should live in one place, not in the matchers.',
    ),
    constraints: [
      'Assignment is deterministic per player and needs no per-request database lookup',
      'Kill switch must route every player to Elo',
      'EloMatcher behaviour stays unchanged',
      'Metrics must be tagged with the algorithm used',
    ],
    forbidModifyElementNames: ['EloMatcher', 'PlayerPool'],
    expectedTouchHints: ['MatchmakingService', 'MatchingStrategy', 'SkillBucketMatcher', 'CanaryRouter'],
    protectedFlows: [
      {
        id: 'baseline-matching',
        label: 'Baseline Matching Still Works',
        steps: ['Pull waiting players', 'Pair them', 'Create lobby'],
        mustKeepElementNames: ['MatchmakingService', 'EloMatcher'],
        mustReach: [
          { from: 'MatchmakingService', to: 'PlayerPool' },
          { from: 'MatchmakingService', to: 'LobbyService' },
        ],
        mustHavePathTopics: ['findmatch', 'pair'],
      },
      {
        id: 'metrics',
        label: 'Match Metrics',
        mustReach: [{ from: 'MatchmakingService', to: 'MetricsClient' }],
      },
    ],
    newFlows: [
      {
        id: 'canary-routing',
        label: 'Route Players To Variant',
        steps: ['Read rollout percentage and kill switch', 'Hash player id to a bucket', 'Select matcher'],
        mustReach: [
          { from: 'MatchmakingService', to: 'RolloutConfig' },
        ],
        mustHavePathTopics: ['canary', 'strategy', 'skill'],
      },
    ],
  }),

  // ── 500 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-financial-recon-job',
    title: 'Nightly Payment Reconciliation Path',
    difficulty: 'hard',
    order: 500,
    description:
      'Finance finds mismatches between our payments, the ledger and the processor’s settlement file weeks later. Add a nightly reconciliation that surfaces discrepancies and survives its own failures.',
    tags: ['payments', 'reconciliation', 'capability', 'failure'],
    maxNewClasses: 5,
    nodes: [
      node('n1', 'co-rec-pay', 'PaymentService', pos(1, 0), ['charge', 'refund']),
      node('n2', 'co-rec-gw', 'PaymentGateway', pos(0, 1), ['charge', 'refund', 'fetchSettlements']),
      node('n3', 'co-rec-payrepo', 'PaymentRepository', pos(1, 1), ['save', 'findByDay']),
      node('n4', 'co-rec-ledger', 'LedgerRepository', pos(2, 1), ['record', 'findByDay']),
      node('n5', 'co-rec-alert', 'AlertService', pos(2, 2), ['notify']),
      node('n6', 'co-rec-sched', 'JobScheduler', pos(0, 2), ['register', 'runDue']),
    ],
    edges: [
      edge('e1', 'ed-co-rec-1', 'n1', 'n2'),
      edge('e2', 'ed-co-rec-2', 'n1', 'n3'),
      edge('e3', 'ed-co-rec-3', 'n1', 'n4'),
    ],
    changeRequest: {
      title: 'Nightly Payment Reconciliation Path',
      body:
        'Every night, compare yesterday’s payments in our database with the ledger entries and the processor’s settlement report. Report anything missing, duplicated or with a different amount, and alert finance when discrepancies exceed a threshold. The job must be safe to re-run (idempotent), resume after a crash without double-reporting, and must never slow or alter the live payment path.',
      type: 'capability',
    },
    briefing: brief(
      'PaymentService charges through PaymentGateway and records each payment and ledger entry. PaymentGateway can already fetch settlements, and JobScheduler can run registered jobs. AlertService can notify people.',
      'Nothing ever compares the three sources of truth against each other. Errors are found manually, long after the fact.',
      'Add a reconciliation job that reads each source for a day, compares them, stores discrepancies, and raises an alert. Register it with the scheduler. It should be read-only with respect to payments and ledger.',
      'The live payment flow should not change at all. Think about where discrepancy results live so that re-runs are idempotent.',
    ),
    constraints: [
      'Reconciliation only reads payments and the ledger',
      'A re-run for the same day must not duplicate findings',
      'A failure in reconciliation must not affect charging',
      'Do not change PaymentService',
    ],
    forbidModifyElementNames: ['PaymentService'],
    expectedTouchHints: ['ReconciliationJob', 'DiscrepancyStore', 'JobScheduler', 'AlertService'],
    protectedFlows: [
      {
        id: 'charge',
        label: 'Charge Payment',
        steps: ['Call gateway', 'Save payment', 'Record ledger entry'],
        mustKeepElementNames: ['PaymentService', 'PaymentGateway'],
        mustReach: [
          { from: 'PaymentService', to: 'PaymentGateway' },
          { from: 'PaymentService', to: 'PaymentRepository' },
          { from: 'PaymentService', to: 'LedgerRepository' },
        ],
        mustHavePathTopics: ['charge'],
      },
    ],
    newFlows: [
      {
        id: 'nightly-recon',
        label: 'Reconcile Yesterday',
        steps: ['Scheduler triggers job', 'Load payments, ledger and settlements', 'Compare and store discrepancies'],
        mustReach: [
          { from: 'JobScheduler', to: 'ReconciliationJob' },
          { from: 'ReconciliationJob', to: 'PaymentRepository' },
          { from: 'ReconciliationJob', to: 'LedgerRepository' },
          { from: 'ReconciliationJob', to: 'PaymentGateway' },
          { from: 'ReconciliationJob', to: 'DiscrepancyStore' },
        ],
        mustHavePathTopics: ['reconcil', 'discrepanc'],
      },
      {
        id: 'alert-finance',
        label: 'Alert On Discrepancies',
        steps: ['Count discrepancies', 'Notify finance above threshold'],
        mustReach: [{ from: 'ReconciliationJob', to: 'AlertService' }],
      },
    ],
  }),

  // ── 501 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-orch-not-choreo',
    title: 'Checkout Saga Must Be Orchestrated Not Choreographed',
    difficulty: 'hard',
    order: 501,
    description:
      'Checkout steps trigger each other through events, so no single place knows the saga’s state or owns compensation. Move control into one orchestrator.',
    tags: ['saga', 'orchestration', 'ownership', 'constraint'],
    maxNewClasses: 4,
    nodes: [
      node('n1', 'co-orch-order', 'OrderService', pos(1, 0), ['placeOrder', 'onShipped']),
      node('n2', 'co-orch-bus', 'EventBus', pos(1, 1), ['publish', 'subscribe']),
      node('n3', 'co-orch-inv', 'InventoryService', pos(0, 2), ['onOrderPlaced', 'reserve', 'release']),
      node('n4', 'co-orch-pay', 'PaymentService', pos(1, 2), ['onStockReserved', 'capture', 'refund']),
      node('n5', 'co-orch-ship', 'ShippingService', pos(2, 2), ['onPaymentCaptured', 'schedule']),
      node('n6', 'co-orch-notify', 'NotificationService', pos(2, 1), ['onOrderEvent', 'send']),
    ],
    edges: [
      edge('e1', 'ed-co-orch-1', 'n1', 'n2'),
      edge('e2', 'ed-co-orch-2', 'n2', 'n3'),
      edge('e3', 'ed-co-orch-3', 'n3', 'n2'),
      edge('e4', 'ed-co-orch-4', 'n2', 'n4'),
      edge('e5', 'ed-co-orch-5', 'n4', 'n2'),
      edge('e6', 'ed-co-orch-6', 'n2', 'n5'),
      edge('e7', 'ed-co-orch-7', 'n2', 'n6'),
    ],
    changeRequest: {
      title: 'Checkout Saga Must Be Orchestrated Not Choreographed',
      body:
        'Today inventory reacts to OrderPlaced, payment reacts to StockReserved, shipping reacts to PaymentCaptured. When payment fails, nobody knows who should release the stock, and ops cannot answer "where is this order stuck?". Introduce a single orchestrator that owns the saga state and decides each next step and each compensation. Participants should only execute commands, not trigger each other. Notifications may still subscribe to events.',
      type: 'constraint',
    },
    briefing: brief(
      'Services are glued together through EventBus: each listens for the previous step’s event and publishes its own. NotificationService also subscribes to know what to tell the customer.',
      'The workflow exists only implicitly in a chain of handlers. Compensation, timeouts and visibility have no home.',
      'Add an orchestrator that keeps durable saga state and calls inventory, payment and shipping in order, compensating in reverse on failure. Remove the service-to-service triggering through the bus, but keep notification events flowing.',
      'Start at OrderService.placeOrder: it should hand the work to the orchestrator rather than just publishing an event.',
    ),
    constraints: [
      'One orchestrator owns the order of steps and the compensations',
      'Inventory, payment and shipping must not depend on each other, directly or through the bus',
      'Saga state is persisted so a restarted orchestrator can continue',
      'NotificationService keeps receiving events and is not changed',
    ],
    forbidModifyElementNames: ['NotificationService'],
    expectedTouchHints: ['OrderService', 'CheckoutSaga', 'SagaLog', 'EventBus'],
    protectedFlows: [
      {
        id: 'participants',
        label: 'Participants Still Exist',
        steps: ['Reserve stock', 'Capture payment', 'Schedule shipment'],
        mustKeepElementNames: ['InventoryService', 'PaymentService', 'ShippingService'],
        mustHavePathTopics: ['reserve', 'capture', 'schedule'],
      },
      {
        id: 'notifications',
        label: 'Customer Notifications',
        steps: ['Events are published', 'Notification service subscribes'],
        mustReach: [{ from: 'EventBus', to: 'NotificationService' }],
        mustHavePathTopics: ['publish'],
      },
    ],
    newFlows: [
      {
        id: 'orchestrate',
        label: 'Orchestrator Drives The Saga',
        steps: ['Order hands off to orchestrator', 'Orchestrator calls each participant in order', 'State is persisted after each step'],
        mustReach: [
          { from: 'OrderService', to: 'CheckoutSaga' },
          { from: 'CheckoutSaga', to: 'InventoryService' },
          { from: 'CheckoutSaga', to: 'PaymentService' },
          { from: 'CheckoutSaga', to: 'ShippingService' },
          { from: 'CheckoutSaga', to: 'SagaLog' },
        ],
        mustHavePathTopics: ['saga', 'compensat'],
      },
      {
        id: 'no-chaining',
        label: 'No Service-To-Service Triggering',
        steps: ['Participants do not trigger each other', 'Compensation is the orchestrator’s job'],
        mustNotReach: [
          { from: 'InventoryService', to: 'PaymentService' },
          { from: 'PaymentService', to: 'ShippingService' },
          { from: 'PaymentService', to: 'InventoryService' },
        ],
      },
    ],
  }),
]
