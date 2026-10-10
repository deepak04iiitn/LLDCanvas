/**
 * Architecture Evolution batch-2 base tracks (34 × 3 difficulties → 102 packs).
 */
import {
  type EvolutionBaseTrack,
  flow,
  hubDiagram,
  chainDiagram,
} from '../seed-studio-evolution-lib'

const br = (going: string, journey: string, rule: string) =>
  `What's going on\n${going}\n\nThe journey\n${journey}\n\nThe rule\n${rule}`

type HoldOpts = {
  id: string
  title: string
  narrative: string
  holdPressure: string
  pressures: [string, string, string]
  flows: ReturnType<typeof flow>[]
  metrics?: EvolutionBaseTrack['holdStage']['metrics']
  hint?: string
}

function hold(o: HoldOpts): EvolutionBaseTrack['holdStage'] {
  return {
    id: o.id,
    dayLabel: 'Day 0',
    title: o.title,
    category: 'product',
    narrative: o.narrative,
    metrics: o.metrics ?? { users: 3000, ordersPerDay: 400, latencyMs: 120 },
    pressureOptions: o.pressures,
    expectedPressures: [o.holdPressure],
    mustChange: false,
    doNothingHint: o.hint ?? 'No concrete requirement yet — holding avoids speculative architecture.',
    protectedFlows: o.flows,
    complexityBudget: 1,
  }
}

type ChangeOpts = {
  id: string
  dayLabel: string
  title: string
  category: 'product' | 'scale' | 'reliability'
  narrative: string
  pressures: string[]
  expected?: string[]
  protected: ReturnType<typeof flow>[]
  newFlows: ReturnType<typeof flow>[]
  hints: string[]
  budget: number
  metrics?: EvolutionBaseTrack['holdStage']['metrics']
  debt?: EvolutionBaseTrack['changeStages'][0]['debtOpportunity']
  forbid?: string[]
  approach?: string[]
}

function ch(o: ChangeOpts): EvolutionBaseTrack['changeStages'][0] {
  return {
    id: o.id,
    dayLabel: o.dayLabel,
    title: o.title,
    category: o.category,
    narrative: o.narrative,
    metrics: o.metrics,
    pressureOptions: o.pressures,
    expectedPressures: o.expected ?? o.pressures.slice(0, 2),
    mustChange: true,
    protectedFlows: o.protected,
    newFlows: o.newFlows,
    expectedTouchHints: o.hints,
    complexityBudget: o.budget,
    debtOpportunity: o.debt,
    forbidModifyElementNames: o.forbid,
    approachHints: o.approach,
  }
}

type ExtraOpts = {
  id: string
  dayLabel: string
  title: string
  category: 'incident' | 'team' | 'legacy'
  narrative: string
  pressures: string[]
  protected: ReturnType<typeof flow>[]
  newFlows?: ReturnType<typeof flow>[]
  hints: string[]
  budget: number
}

function extra(o: ExtraOpts): NonNullable<EvolutionBaseTrack['hardExtraStages']>[number] {
  return {
    id: o.id,
    dayLabel: o.dayLabel,
    title: o.title,
    category: o.category,
    narrative: o.narrative,
    pressureOptions: o.pressures,
    expectedPressures: o.pressures.slice(0, 2),
    mustChange: true,
    protectedFlows: o.protected,
    newFlows: o.newFlows,
    expectedTouchHints: o.hints,
    complexityBudget: o.budget,
  }
}

export const EVOLUTION_BASES: EvolutionBaseTrack[] = [
  {
    key: 'payment-checkout-growth',
    title: 'Checkout Payments Evolution',
    tags: ['payments', 'checkout', 'product'],
    description:
      'Grow a single-PSP checkout into multi-provider payments and idempotent retries without bloating Order.',
    briefing: br(
      'CheckoutController → PaymentService → StripeClient persists orders through OrderRepository.',
      'Finance adds a second PSP, then peak traffic exposes double-charge risk on retries.',
      'Evolve boundaries when pressure is real. Keep checkout reachable. Sometimes Day 0 is a hold.',
    ),
    dimensions: ['product', 'scale'],
    diagram: hubDiagram(
      'pay-chk',
      'PaymentService',
      ['charge', 'refund'],
      [
        { name: 'StripeClient', methods: ['createCharge'], slot: 'left' },
        { name: 'OrderRepository', methods: ['save'], slot: 'right' },
      ],
      { name: 'CheckoutController', methods: ['submit'] },
    ),
    holdStage: hold({
      id: 'pay-h0',
      title: 'Single PSP works',
      narrative:
        'One merchant, Stripe only. Checkout completes in under 200ms. Leadership asks to “future-proof for ten PSPs” before a second contract exists.',
      holdPressure: 'premature abstraction — one PSP is enough today',
      pressures: [
        'provider coupling',
        'premature abstraction — one PSP is enough today',
        'retry/idempotency gap',
      ],
      flows: [
        flow('checkout', 'Checkout charges', {
          keep: ['CheckoutController', 'PaymentService'],
          reach: [
            { from: 'CheckoutController', to: 'PaymentService' },
            { from: 'PaymentService', to: 'StripeClient' },
          ],
        }),
      ],
      metrics: { users: 8000, ordersPerDay: 1200, latencyMs: 95 },
    }),
    changeStages: [
      ch({
        id: 'pay-s2',
        dayLabel: 'Day 90',
        title: 'Second payment provider',
        category: 'product',
        narrative:
          'PayPal signed. PaymentService must route without if/else sprawl. Order placement must stay unchanged for card users.',
        pressures: ['provider coupling', 'extensibility', 'domain→infra'],
        protected: [
          flow('stripe-path', 'Stripe path intact', {
            keep: ['PaymentService', 'StripeClient'],
            reach: [{ from: 'PaymentService', to: 'StripeClient' }],
          }),
        ],
        newFlows: [flow('multi-psp', 'Multi-provider', { topics: ['gateway', 'paypal', 'stripe'] })],
        hints: ['PaymentGateway', 'PayPalClient', 'PaymentService'],
        budget: 3,
        metrics: { ordersPerDay: 6000 },
        debt: {
          id: 'debt-idem',
          prompt: 'Retries still lack idempotency keys — fix now or after traffic spike?',
          costIfDeferred: 'Duplicate charges during network blips become support fires.',
          laterStageId: 'pay-s3',
        },
      }),
      ch({
        id: 'pay-s3',
        dayLabel: 'Day 200',
        title: 'Idempotent checkout at scale',
        category: 'scale',
        narrative:
          'Mobile clients retry aggressively. You need idempotent charge + persist without duplicating orders.',
        pressures: ['duplicate charges', 'at-least-once clients', 'consistency'],
        protected: [
          flow('checkout', 'Checkout still works', {
            keep: ['CheckoutController'],
            reach: [{ from: 'CheckoutController', to: 'PaymentService' }],
          }),
        ],
        newFlows: [flow('idem', 'Idempotent charge', { topics: ['idempotency', 'retry'] })],
        hints: ['IdempotencyStore', 'PaymentService', 'OrderRepository'],
        budget: 4,
        metrics: { ordersPerDay: 45000, latencyMs: 140 },
      }),
      ch({
        id: 'pay-s4',
        dayLabel: 'Day 320',
        title: 'Partial failure recovery',
        category: 'reliability',
        narrative:
          'Charge succeeds but DB write fails sometimes. Finance wants automatic reconciliation, not manual fixes.',
        pressures: ['split brain', 'reconciliation', 'saga vs outbox'],
        protected: [
          flow('pay-path', 'Payment path', {
            reach: [{ from: 'PaymentService', to: 'OrderRepository' }],
          }),
        ],
        newFlows: [flow('reconcile', 'Reconciliation', { topics: ['outbox', 'reconcile'] })],
        hints: ['Outbox', 'ReconciliationJob', 'PaymentService'],
        budget: 5,
        metrics: { ordersPerDay: 80000, availability: '99.5%' },
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'pay-inc',
        dayLabel: 'Day 340',
        title: 'PSP outage incident',
        category: 'incident',
        narrative:
          'Stripe partial outage during sale. You need graceful degradation and provider failover without rewriting checkout overnight.',
        pressures: ['failover', 'incident mode', 'customer trust'],
        protected: [
          flow('checkout-degraded', 'Degraded checkout', {
            keep: ['CheckoutController'],
            topics: ['checkout'],
          }),
        ],
        newFlows: [flow('failover', 'Provider failover', { topics: ['circuit', 'failover'] })],
        hints: ['PaymentRouter', 'CircuitBreaker', 'PaymentGateway'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'notification-multichannel',
    title: 'Notification Hub Evolution',
    tags: ['notifications', 'messaging', 'product'],
    description:
      'Evolve email-only alerts into push and SMS with preferences and delivery guarantees.',
    briefing: br(
      'EventHandler → Notifier → EmailSender is the only outbound path.',
      'Mobile wants push, ops wants SMS for critical alerts, then marketing wants user preferences.',
      'Channels plug in; domain events stay channel-agnostic.',
    ),
    diagram: chainDiagram(
      'notify',
      [
        { name: 'EventHandler', methods: ['onOrderPlaced'], row: 0 },
        { name: 'Notifier', methods: ['notify'], row: 1 },
        { name: 'EmailSender', methods: ['send'], row: 2 },
        { name: 'TemplateStore', methods: ['render'], row: 3, col: 2 },
      ],
      [
        { from: 'EventHandler', to: 'Notifier' },
        { from: 'Notifier', to: 'EmailSender' },
        { from: 'EmailSender', to: 'TemplateStore', type: 'association' },
      ],
    ),
    holdStage: hold({
      id: 'nt-h0',
      title: 'Email-only is fine',
      narrative:
        'Email deliverability is strong. Product sketches a “notification platform” but has no push app ship date.',
      holdPressure: 'no second channel requirement yet',
      pressures: ['channel coupling', 'no second channel requirement yet', 'template sprawl'],
      flows: [
        flow('email', 'Email notifies', {
          keep: ['EventHandler', 'Notifier', 'EmailSender'],
          reach: [
            { from: 'EventHandler', to: 'Notifier' },
            { from: 'Notifier', to: 'EmailSender' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'nt-s2',
        dayLabel: 'Day 60',
        title: 'Add push channel',
        category: 'product',
        narrative: 'iOS app launches. Order updates must reach push without breaking email.',
        pressures: ['channel coupling', 'extensibility'],
        protected: [
          flow('email', 'Email still sends', {
            reach: [{ from: 'Notifier', to: 'EmailSender' }],
          }),
        ],
        newFlows: [flow('push', 'Push channel', { topics: ['push', 'channel'] })],
        hints: ['NotificationChannel', 'PushSender', 'Notifier'],
        budget: 3,
        debt: {
          id: 'debt-prefs',
          prompt: 'Users cannot mute channels yet — build preferences now?',
          costIfDeferred: 'Marketing blasts will erode trust and spike unsubscribes.',
          laterStageId: 'nt-s3',
        },
      }),
      ch({
        id: 'nt-s3',
        dayLabel: 'Day 150',
        title: 'User preferences',
        category: 'product',
        narrative: 'Legal wants granular opt-in. Notifier must respect per-user channel rules.',
        pressures: ['compliance', 'preference model', 'defaults'],
        protected: [flow('events', 'Events still flow', { keep: ['EventHandler'] })],
        newFlows: [flow('prefs', 'Preferences honored', { topics: ['preference', 'opt'] })],
        hints: ['PreferenceService', 'Notifier'],
        budget: 4,
      }),
      ch({
        id: 'nt-s4',
        dayLabel: 'Day 280',
        title: 'At-least-once delivery',
        category: 'reliability',
        narrative: 'Queue backlog caused missed fraud alerts. Critical notifications need retry and DLQ.',
        pressures: ['delivery guarantees', 'backpressure', 'DLQ'],
        protected: [flow('notify', 'Notify path', { keep: ['Notifier'] })],
        newFlows: [flow('retry', 'Retry pipeline', { topics: ['queue', 'dlq'] })],
        hints: ['DeliveryQueue', 'RetryWorker', 'Notifier'],
        budget: 5,
        metrics: { ordersPerDay: 120000 },
      }),
    ],
  },

  {
    key: 'marketplace-sellers',
    title: 'Marketplace Seller Evolution',
    tags: ['marketplace', 'payouts', 'product'],
    description:
      'Move from single-merchant orders to multi-seller listings, commissions, and split payouts.',
    briefing: br(
      'OrderService writes orders and calls PaymentCapture directly.',
      'Third-party sellers arrive, then finance needs commission rules and delayed payouts.',
      'Separate seller money flows from buyer checkout; do not grow Order into a god object.',
    ),
    dimensions: ['product', 'business'],
    diagram: hubDiagram(
      'mkt',
      'OrderService',
      ['placeOrder', 'capture'],
      [
        { name: 'PaymentCapture', methods: ['capture'], slot: 'left' },
        { name: 'OrderStore', methods: ['save'], slot: 'right' },
      ],
      { name: 'Storefront', methods: ['checkout'] },
    ),
    holdStage: hold({
      id: 'mk-h0',
      title: 'Single merchant MVP',
      narrative:
        'You sell only first-party inventory. PM slides show “marketplace vision” but no seller onboarding pipeline exists.',
      holdPressure: 'no sellers onboarded — hold marketplace spine',
      pressures: ['marketplace readiness', 'payout coupling', 'no sellers onboarded — hold marketplace spine'],
      flows: [
        flow('order', 'Orders persist', {
          reach: [
            { from: 'Storefront', to: 'OrderService' },
            { from: 'OrderService', to: 'OrderStore' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'mk-s2',
        dayLabel: 'Day 100',
        title: 'Seller listings',
        category: 'product',
        narrative: 'External sellers list SKUs. Order must reference seller without owning catalog rules.',
        pressures: ['ownership', 'listing model'],
        protected: [flow('checkout', 'Checkout works', { keep: ['Storefront'] })],
        newFlows: [flow('seller', 'Seller on order', { topics: ['seller', 'listing'] })],
        hints: ['Seller', 'ListingService', 'OrderService'],
        budget: 4,
        debt: {
          id: 'debt-payout',
          prompt: 'Capture still settles to one merchant account — split payouts later?',
          costIfDeferred: 'Manual finance adjustments every week until payout service exists.',
          laterStageId: 'mk-s3',
        },
      }),
      ch({
        id: 'mk-s3',
        dayLabel: 'Day 220',
        title: 'Split payouts',
        category: 'product',
        narrative: 'Each line item may belong to a different seller. Payout timing and fees vary.',
        pressures: ['payout coupling', 'commission rules'],
        protected: [flow('capture', 'Capture still runs', { reach: [{ from: 'OrderService', to: 'PaymentCapture' }] })],
        newFlows: [flow('payout', 'Split payout', { topics: ['payout', 'commission'] })],
        hints: ['PayoutService', 'LedgerEntry', 'OrderService'],
        budget: 5,
      }),
      ch({
        id: 'mk-s4',
        dayLabel: 'Day 300',
        title: 'Peak sale scale',
        category: 'scale',
        narrative: 'Flash sale creates hot sellers. Order placement must stay fast while payout calculation moves async.',
        pressures: ['hot partition', 'async settlement', 'latency'],
        protected: [flow('place', 'Place order fast', { keep: ['OrderService'] })],
        newFlows: [flow('async-pay', 'Async settlement', { topics: ['event', 'settlement'] })],
        hints: ['SettlementWorker', 'OrderService'],
        budget: 5,
        metrics: { ordersPerDay: 95000, latencyMs: 180 },
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'mk-leg',
        dayLabel: 'Day 330',
        title: 'Legacy seller CSV imports',
        category: 'legacy',
        narrative:
          'Finance still uploads seller balances via CSV. You must bridge without breaking automated payouts.',
        pressures: ['legacy import', 'data parity'],
        protected: [flow('payout-auto', 'Automated payouts', { topics: ['payout'] })],
        hints: ['ImportAdapter', 'PayoutService'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'auth-session-scale',
    title: 'Auth & Session Evolution',
    tags: ['auth', 'security', 'scale'],
    description:
      'Grow password login into OAuth, refresh tokens, and session revocation at millions of users.',
    briefing: br(
      'AuthController → AuthService → UserRepository with in-memory session map.',
      'Social login lands, mobile needs refresh tokens, then security mandates global logout.',
      'Auth boundaries tighten over time; do not rewrite every API for each identity provider.',
    ),
    diagram: hubDiagram(
      'auth',
      'AuthService',
      ['login', 'validateToken'],
      [
        { name: 'UserRepository', methods: ['findByEmail'], slot: 'left' },
        { name: 'SessionStore', methods: ['put'], slot: 'right' },
      ],
      { name: 'AuthController', methods: ['signIn'] },
    ),
    holdStage: hold({
      id: 'au-h0',
      title: 'Password login sufficient',
      narrative:
        'B2B admins only, no mobile app. Security asks for “zero-trust everything” before OAuth contracts are signed.',
      holdPressure: 'OAuth not contracted — sessions OK for now',
      pressures: ['session scale', 'OAuth readiness', 'OAuth not contracted — sessions OK for now'],
      flows: [
        flow('login', 'Login works', {
          reach: [
            { from: 'AuthController', to: 'AuthService' },
            { from: 'AuthService', to: 'UserRepository' },
          ],
        }),
      ],
      metrics: { users: 12000 },
    }),
    changeStages: [
      ch({
        id: 'au-s2',
        dayLabel: 'Day 75',
        title: 'OAuth providers',
        category: 'product',
        narrative: 'Google and Apple sign-in required for consumer launch.',
        pressures: ['identity provider coupling', 'token shape'],
        protected: [flow('password', 'Password login', { topics: ['login'] })],
        newFlows: [flow('oauth', 'OAuth login', { topics: ['oauth', 'google'] })],
        hints: ['IdentityProvider', 'OAuthAdapter', 'AuthService'],
        budget: 3,
      }),
      ch({
        id: 'au-s3',
        dayLabel: 'Day 160',
        title: 'Refresh tokens',
        category: 'scale',
        narrative: 'Mobile clients cannot re-prompt daily. Short-lived access + refresh rotation needed.',
        pressures: ['token rotation', 'mobile clients'],
        protected: [flow('validate', 'Validate still works', { keep: ['AuthService'] })],
        newFlows: [flow('refresh', 'Refresh flow', { topics: ['refresh', 'token'] })],
        hints: ['TokenService', 'RefreshStore', 'AuthService'],
        budget: 4,
        debt: {
          id: 'debt-revoke',
          prompt: 'Stolen refresh tokens cannot be revoked globally yet.',
          costIfDeferred: 'Incident response requires DB surgery per user.',
          laterStageId: 'au-s4',
        },
      }),
      ch({
        id: 'au-s4',
        dayLabel: 'Day 260',
        title: 'Global session revocation',
        category: 'reliability',
        narrative: 'Credential leak requires kill-all-sessions within minutes across regions.',
        pressures: ['revocation fanout', 'incident response'],
        protected: [flow('auth', 'Auth issues tokens', { keep: ['AuthController'] })],
        newFlows: [flow('revoke', 'Revocation', { topics: ['revoke', 'session'] })],
        hints: ['RevocationBus', 'SessionStore', 'AuthService'],
        budget: 5,
        metrics: { users: 2500000 },
      }),
    ],
  },

  {
    key: 'inventory-allocation',
    title: 'Inventory Allocation Evolution',
    tags: ['inventory', 'warehouse', 'scale'],
    description:
      'Evolve simple stock counts into reservations, multi-warehouse allocation, and oversell protection.',
    briefing: br(
      'OrderPlacer → InventoryService → StockTable decrements on every order.',
      'Cart reservations arrive, then multiple warehouses, then flash-sale oversell incidents.',
      'Inventory correctness beats clever caching; evolve when oversell risk is real.',
    ),
    diagram: chainDiagram(
      'inv',
      [
        { name: 'OrderPlacer', methods: ['place'], row: 0 },
        { name: 'InventoryService', methods: ['decrement'], row: 1 },
        { name: 'StockTable', methods: ['update'], row: 2 },
      ],
      [
        { from: 'OrderPlacer', to: 'InventoryService' },
        { from: 'InventoryService', to: 'StockTable' },
      ],
    ),
    holdStage: hold({
      id: 'in-h0',
      title: 'Single warehouse counts',
      narrative:
        'One DC, low concurrency. Ops wants WMS integration “just in case” before a second warehouse opens.',
      holdPressure: 'single warehouse — reservations optional',
      pressures: ['oversell risk', 'multi-warehouse', 'single warehouse — reservations optional'],
      flows: [
        flow('decrement', 'Stock decrements', {
          reach: [
            { from: 'OrderPlacer', to: 'InventoryService' },
            { from: 'InventoryService', to: 'StockTable' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'in-s2',
        dayLabel: 'Day 80',
        title: 'Cart reservations',
        category: 'product',
        narrative: 'Checkout holds stock for 15 minutes. Blind decrement on cart add causes oversells.',
        pressures: ['reservation model', 'TTL'],
        protected: [flow('place', 'Place still works', { keep: ['OrderPlacer'] })],
        newFlows: [flow('reserve', 'Reserve stock', { topics: ['reservation', 'hold'] })],
        hints: ['Reservation', 'InventoryService'],
        budget: 3,
      }),
      ch({
        id: 'in-s3',
        dayLabel: 'Day 190',
        title: 'Multi-warehouse allocation',
        category: 'scale',
        narrative: 'Ship-from-nearest-DC rules. InventoryService must choose warehouse without OrderPlacer knowing details.',
        pressures: ['allocation strategy', 'split shipments'],
        protected: [flow('inv', 'Inventory path', { keep: ['InventoryService'] })],
        newFlows: [flow('multi-wh', 'Multi-warehouse', { topics: ['warehouse', 'allocate'] })],
        hints: ['Warehouse', 'AllocationPolicy', 'InventoryService'],
        budget: 4,
      }),
      ch({
        id: 'in-s4',
        dayLabel: 'Day 270',
        title: 'Oversell protection',
        category: 'reliability',
        narrative: 'Flash sale nearly oversold hero SKU. Need atomic reserve + idempotent release.',
        pressures: ['atomicity', 'race conditions'],
        protected: [flow('reserve-path', 'Reservation path', { topics: ['reservation'] })],
        newFlows: [flow('atomic', 'Atomic reserve', { topics: ['lock', 'compare'] })],
        hints: ['StockLedger', 'InventoryService'],
        budget: 5,
        metrics: { ordersPerDay: 60000 },
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'in-inc',
        dayLabel: 'Day 285',
        title: 'Inventory drift incident',
        category: 'incident',
        narrative: 'Nightly counts diverged from StockTable after partial WMS outage.',
        pressures: ['reconciliation', 'source of truth'],
        protected: [flow('orders', 'Orders still allocate', { keep: ['OrderPlacer'] })],
        hints: ['ReconciliationJob', 'InventoryService', 'WmsAdapter'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'streaming-playback',
    title: 'Streaming Playback Evolution',
    tags: ['streaming', 'media', 'scale'],
    description:
      'Grow direct file URLs into adaptive bitrate, DRM, and regional edge caching.',
    briefing: br(
      'PlaybackAPI → StreamService → FileStorage serves single MP4 URLs.',
      'Mobile needs HLS, studios require DRM, then global traffic needs CDN routing.',
      'Keep playback API stable; push format and DRM complexity behind services.',
    ),
    diagram: hubDiagram(
      'stream',
      'StreamService',
      ['getPlaybackUrl'],
      [
        { name: 'FileStorage', methods: ['getObject'], slot: 'left' },
        { name: 'Catalog', methods: ['getTitle'], slot: 'right' },
      ],
      { name: 'PlaybackAPI', methods: ['play'] },
    ),
    holdStage: hold({
      id: 'st-h0',
      title: 'Single MP4 works',
      narrative:
        'Web-only beta, low concurrency. Content team mentions 4K and DRM slides but no studio contract yet.',
      holdPressure: 'no DRM requirement — direct URLs OK',
      pressures: ['DRM readiness', 'CDN cost', 'no DRM requirement — direct URLs OK'],
      flows: [
        flow('play', 'Playback URL', {
          reach: [
            { from: 'PlaybackAPI', to: 'StreamService' },
            { from: 'StreamService', to: 'FileStorage' },
          ],
        }),
      ],
      metrics: { users: 50000 },
    }),
    changeStages: [
      ch({
        id: 'st-s2',
        dayLabel: 'Day 70',
        title: 'Adaptive bitrate',
        category: 'product',
        narrative: 'Mobile launch needs HLS manifests instead of one giant file.',
        pressures: ['format coupling', 'client diversity'],
        protected: [flow('api', 'API stable', { keep: ['PlaybackAPI'] })],
        newFlows: [flow('hls', 'HLS manifests', { topics: ['hls', 'manifest'] })],
        hints: ['TranscodePipeline', 'ManifestBuilder', 'StreamService'],
        budget: 4,
      }),
      ch({
        id: 'st-s3',
        dayLabel: 'Day 180',
        title: 'DRM enforcement',
        category: 'product',
        narrative: 'Licensed movies require Widevine/FairPlay. URLs must be time-limited.',
        pressures: ['license rules', 'token expiry'],
        protected: [flow('play-path', 'Play path', { keep: ['StreamService'] })],
        newFlows: [flow('drm', 'DRM tokens', { topics: ['drm', 'license'] })],
        hints: ['DrmBroker', 'LicenseToken', 'StreamService'],
        budget: 5,
      }),
      ch({
        id: 'st-s4',
        dayLabel: 'Day 260',
        title: 'Regional CDN routing',
        category: 'scale',
        narrative: 'APAC latency spikes. Route users to nearest edge without exposing origin keys.',
        pressures: ['latency', 'origin shield'],
        protected: [flow('url', 'Clients get URLs', { keep: ['PlaybackAPI'] })],
        newFlows: [flow('cdn', 'CDN routing', { topics: ['cdn', 'edge'] })],
        hints: ['CdnRouter', 'StreamService'],
        budget: 4,
        metrics: { users: 800000, latencyMs: 450 },
      }),
    ],
  },

  {
    key: 'healthcare-records',
    title: 'Healthcare Records Evolution',
    tags: ['healthcare', 'compliance', 'product'],
    description:
      'Evolve a clinic chart into structured FHIR resources, consent, and break-glass access auditing.',
    briefing: br(
      'ClinicianApp → ChartService → PatientRecord stores unstructured notes.',
      'Interop requires FHIR APIs, then consent tracking, then audit for emergency access.',
      'Patient safety and auditability outweigh speed of hacks; evolve when regulation bites.',
    ),
    dimensions: ['compliance', 'product'],
    diagram: hubDiagram(
      'health',
      'ChartService',
      ['saveNote', 'loadChart'],
      [
        { name: 'PatientRecord', methods: ['append'], slot: 'left' },
        { name: 'ClinicianDirectory', methods: ['verify'], slot: 'right' },
      ],
      { name: 'ClinicianApp', methods: ['documentVisit'] },
    ),
    holdStage: hold({
      id: 'hc-h0',
      title: 'Single-clinic notes',
      narrative:
        'One site, trusted staff. IT proposes FHIR before any hospital integration deadline exists.',
      holdPressure: 'no external exchange mandate yet',
      pressures: ['FHIR readiness', 'consent complexity', 'no external exchange mandate yet'],
      flows: [
        flow('chart', 'Chart read/write', {
          reach: [
            { from: 'ClinicianApp', to: 'ChartService' },
            { from: 'ChartService', to: 'PatientRecord' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'hc-s2',
        dayLabel: 'Day 120',
        title: 'FHIR export',
        category: 'product',
        narrative: 'Regional HIE requires structured Observation and Medication resources.',
        pressures: ['interop', 'model mismatch'],
        protected: [flow('notes', 'Notes still work', { keep: ['ChartService'] })],
        newFlows: [flow('fhir', 'FHIR export', { topics: ['fhir', 'resource'] })],
        hints: ['FhirMapper', 'ChartService', 'PatientRecord'],
        budget: 4,
      }),
      ch({
        id: 'hc-s3',
        dayLabel: 'Day 240',
        title: 'Patient consent',
        category: 'product',
        narrative: 'Sharing records across specialists requires granular consent scopes.',
        pressures: ['consent', 'minimum necessary'],
        protected: [flow('load', 'Load chart', { keep: ['ClinicianApp'] })],
        newFlows: [flow('consent', 'Consent gates', { topics: ['consent', 'scope'] })],
        hints: ['ConsentRegistry', 'ChartService'],
        budget: 4,
        debt: {
          id: 'debt-audit',
          prompt: 'Break-glass access is unaudited — fix before go-live?',
          costIfDeferred: 'Regulatory finding and loss of hospital contract.',
          laterStageId: 'hc-s4',
        },
      }),
      ch({
        id: 'hc-s4',
        dayLabel: 'Day 360',
        title: 'Break-glass audit',
        category: 'reliability',
        narrative: 'ER needs emergency access with mandatory retrospective review.',
        pressures: ['audit trail', 'emergency access'],
        protected: [flow('care', 'Care documentation', { topics: ['chart'] })],
        newFlows: [flow('audit', 'Audit trail', { topics: ['audit', 'break-glass'] })],
        hints: ['AuditLog', 'BreakGlassPolicy', 'ChartService'],
        budget: 5,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'hc-team',
        dayLabel: 'Day 380',
        title: 'Team split: clinical vs platform',
        category: 'team',
        narrative:
          'Platform team owns FHIR; clinical squad owns UX. Boundaries blur in ChartService.',
        pressures: ['ownership', 'API boundaries'],
        protected: [flow('fhir-path', 'FHIR still exports', { topics: ['fhir'] })],
        hints: ['ClinicalModule', 'InteropModule', 'ChartService'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'fintech-ledger',
    title: 'Fintech Ledger Evolution',
    tags: ['fintech', 'ledger', 'reliability'],
    description:
      'Grow balance updates into double-entry ledger, holds, and regulatory reporting snapshots.',
    briefing: br(
      'TransferAPI → WalletService → BalanceRow mutates a single balance column.',
      'Merchants need holds, then double-entry audit, then end-of-day regulatory extracts.',
      'Money movement demands traceability; refactor before shortcuts become silent losses.',
    ),
    diagram: chainDiagram(
      'fin',
      [
        { name: 'TransferAPI', methods: ['send'], row: 0 },
        { name: 'WalletService', methods: ['debit', 'credit'], row: 1 },
        { name: 'BalanceRow', methods: ['update'], row: 2 },
      ],
      [
        { from: 'TransferAPI', to: 'WalletService' },
        { from: 'WalletService', to: 'BalanceRow' },
      ],
    ),
    holdStage: hold({
      id: 'fi-h0',
      title: 'Simple balances',
      narrative:
        'P2P only, low volume. Compliance mentions double-entry before licensing milestone is scheduled.',
      holdPressure: 'license milestone not due — hold ledger rewrite',
      pressures: ['audit gap', 'double-entry', 'license milestone not due — hold ledger rewrite'],
      flows: [
        flow('transfer', 'Transfer mutates balance', {
          reach: [
            { from: 'TransferAPI', to: 'WalletService' },
            { from: 'WalletService', to: 'BalanceRow' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'fi-s2',
        dayLabel: 'Day 90',
        title: 'Authorization holds',
        category: 'product',
        narrative: 'Card top-ups need pending holds before settlement.',
        pressures: ['hold lifecycle', 'state machine'],
        protected: [flow('send', 'Send still works', { keep: ['TransferAPI'] })],
        newFlows: [flow('hold', 'Balance holds', { topics: ['hold', 'pending'] })],
        hints: ['Hold', 'WalletService'],
        budget: 3,
      }),
      ch({
        id: 'fi-s3',
        dayLabel: 'Day 200',
        title: 'Double-entry ledger',
        category: 'reliability',
        narrative: 'Finance cannot reconcile from one column. Every transfer posts balanced entries.',
        pressures: ['audit trail', 'immutability'],
        protected: [flow('wallet', 'Wallet operations', { keep: ['WalletService'] })],
        newFlows: [flow('ledger', 'Ledger entries', { topics: ['ledger', 'entry'] })],
        hints: ['Ledger', 'JournalEntry', 'WalletService'],
        budget: 5,
      }),
      ch({
        id: 'fi-s4',
        dayLabel: 'Day 310',
        title: 'Regulatory snapshots',
        category: 'scale',
        narrative: 'Daily CSV to regulator must match ledger without locking live traffic.',
        pressures: ['snapshot isolation', 'reporting lag'],
        protected: [flow('live', 'Live transfers', { keep: ['TransferAPI'] })],
        newFlows: [flow('report', 'Reg reports', { topics: ['snapshot', 'report'] })],
        hints: ['SnapshotReader', 'ReportBuilder'],
        budget: 4,
        metrics: { ordersPerDay: 400000 },
      }),
    ],
  },

  {
    key: 'saas-tenant-isolation',
    title: 'SaaS Multi-Tenant Evolution',
    tags: ['saas', 'multi-tenant', 'scale'],
    description:
      'Evolve shared-schema tenancy into row-level isolation, per-tenant quotas, and noisy-neighbor controls.',
    briefing: br(
      'TenantRouter → AppService → SharedDatabase with tenant_id on every query.',
      'Enterprise wants stronger isolation, then API quotas, then shard hot tenants.',
      'Tenant boundaries are product promises — evolve before enterprise churn, not on Day 0.',
    ),
    diagram: hubDiagram(
      'saas',
      'AppService',
      ['handleRequest'],
      [
        { name: 'SharedDatabase', methods: ['query'], slot: 'left' },
        { name: 'TenantRegistry', methods: ['resolve'], slot: 'right' },
      ],
      { name: 'TenantRouter', methods: ['route'] },
    ),
    holdStage: hold({
      id: 'sa-h0',
      title: 'Shared schema OK',
      narrative:
        '200 SMB tenants, uniform usage. Sales promises “dedicated shard” to prospects without signed deals.',
      holdPressure: 'no enterprise isolation clause signed',
      pressures: ['noisy neighbor', 'shard early', 'no enterprise isolation clause signed'],
      flows: [
        flow('request', 'Tenant request', {
          reach: [
            { from: 'TenantRouter', to: 'AppService' },
            { from: 'AppService', to: 'SharedDatabase' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'sa-s2',
        dayLabel: 'Day 100',
        title: 'Row-level security',
        category: 'product',
        narrative: 'First healthcare tenant requires provable cross-tenant read prevention.',
        pressures: ['isolation proof', 'RLS'],
        protected: [flow('multi', 'Multi-tenant queries', { keep: ['AppService'] })],
        newFlows: [flow('rls', 'RLS enforcement', { topics: ['tenant', 'rls'] })],
        hints: ['TenantContext', 'SharedDatabase', 'AppService'],
        budget: 4,
      }),
      ch({
        id: 'sa-s3',
        dayLabel: 'Day 210',
        title: 'Per-tenant quotas',
        category: 'scale',
        narrative: 'One tenant hogs API limits. Fair usage requires metering without code forks per plan.',
        pressures: ['quota', 'fair use'],
        protected: [flow('route', 'Routing works', { keep: ['TenantRouter'] })],
        newFlows: [flow('quota', 'Quota enforcement', { topics: ['quota', 'meter'] })],
        hints: ['QuotaService', 'AppService'],
        budget: 4,
      }),
      ch({
        id: 'sa-s4',
        dayLabel: 'Day 300',
        title: 'Hot tenant sharding',
        category: 'scale',
        narrative: 'Flagship customer needs dedicated DB without forking the codebase.',
        pressures: ['shard routing', 'migration'],
        protected: [flow('app', 'App logic unified', { keep: ['AppService'] })],
        newFlows: [flow('shard', 'Shard routing', { topics: ['shard', 'dedicated'] })],
        hints: ['ShardRouter', 'TenantRegistry'],
        budget: 5,
        metrics: { users: 500000 },
      }),
    ],
  },

  {
    key: 'ride-dispatch-pricing',
    title: 'Ride-Hail Dispatch Evolution',
    tags: ['ride-hail', 'dispatch', 'product'],
    description:
      'Grow nearest-driver assignment into surge zones, pooling, and corporate billing profiles.',
    briefing: br(
      'RideRequest → DispatchService → DriverPool picks closest driver with flat pricing.',
      'Surge maps arrive, then shared rides, then B2B invoicing rules.',
      'Dispatch stays orchestrator; pricing and billing rules plug in.',
    ),
    diagram: hubDiagram(
      'ride',
      'DispatchService',
      ['assignDriver', 'quoteFare'],
      [
        { name: 'DriverPool', methods: ['findNearest'], slot: 'left' },
        { name: 'FlatPricing', methods: ['calculate'], slot: 'right' },
      ],
      { name: 'RideRequest', methods: ['requestRide'] },
    ),
    holdStage: hold({
      id: 'ri-h0',
      title: 'Flat fare dispatch',
      narrative:
        'One city, stable demand. Product mocks surge UI before supply/demand telemetry exists.',
      holdPressure: 'surge not measurable — hold pricing refactor',
      pressures: ['surge readiness', 'pool complexity', 'surge not measurable — hold pricing refactor'],
      flows: [
        flow('dispatch', 'Driver assigned', {
          reach: [
            { from: 'RideRequest', to: 'DispatchService' },
            { from: 'DispatchService', to: 'DriverPool' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'ri-s2',
        dayLabel: 'Day 85',
        title: 'Surge pricing zones',
        category: 'product',
        narrative: 'Supply crunch needs zone multipliers without editing DispatchService each launch.',
        pressures: ['pricing coupling', 'geo rules'],
        protected: [flow('assign', 'Assignment works', { keep: ['DispatchService', 'DriverPool'] })],
        newFlows: [flow('surge', 'Surge quotes', { topics: ['surge', 'zone'] })],
        hints: ['SurgeEngine', 'PricingStrategy', 'DispatchService'],
        budget: 4,
        forbid: ['RideRequest'],
      }),
      ch({
        id: 'ri-s3',
        dayLabel: 'Day 175',
        title: 'Ride pooling',
        category: 'product',
        narrative: 'Match two riders on compatible routes. Assignment logic gets combinatorial.',
        pressures: ['matching', 'route overlap'],
        protected: [flow('quote', 'Quotes still work', { keep: ['DispatchService'] })],
        newFlows: [flow('pool', 'Pooled rides', { topics: ['pool', 'match'] })],
        hints: ['PoolMatcher', 'DispatchService'],
        budget: 5,
      }),
      ch({
        id: 'ri-s4',
        dayLabel: 'Day 265',
        title: 'Corporate billing',
        category: 'product',
        narrative: 'Enterprises need cost centers and monthly invoices separate from rider receipts.',
        pressures: ['billing profiles', 'receipt split'],
        protected: [flow('ride', 'Ride completes', { keep: ['RideRequest'] })],
        newFlows: [flow('corp', 'Corporate billing', { topics: ['corporate', 'invoice'] })],
        hints: ['BillingProfile', 'InvoiceService', 'DispatchService'],
        budget: 4,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'ri-inc',
        dayLabel: 'Day 280',
        title: 'Dispatch storm incident',
        category: 'incident',
        narrative: 'New Year Eve: assign loop starved drivers. Need backpressure without canceling safety.',
        pressures: ['backpressure', 'fairness'],
        protected: [flow('safe', 'Safety checks', { topics: ['dispatch'] })],
        hints: ['RateLimiter', 'DispatchService', 'DriverPool'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'food-delivery-order',
    title: 'Food Delivery Order Evolution',
    tags: ['food-delivery', 'logistics', 'product'],
    description:
      'Evolve restaurant-only orders into multi-restaurant carts, courier tracking, and SLA refunds.',
    briefing: br(
      'CustomerApp → OrderOrchestrator → RestaurantAPI places one-restaurant orders.',
      'Multi-merchant carts, live courier maps, then SLA-based auto-refunds.',
      'Orchestrator coordinates; do not embed restaurant and courier rules in the UI layer.',
    ),
    diagram: chainDiagram(
      'food',
      [
        { name: 'CustomerApp', methods: ['checkout'], row: 0 },
        { name: 'OrderOrchestrator', methods: ['place'], row: 1 },
        { name: 'RestaurantAPI', methods: ['accept'], row: 2 },
        { name: 'KitchenQueue', methods: ['enqueue'], row: 3 },
      ],
      [
        { from: 'CustomerApp', to: 'OrderOrchestrator' },
        { from: 'OrderOrchestrator', to: 'RestaurantAPI' },
        { from: 'RestaurantAPI', to: 'KitchenQueue' },
      ],
    ),
    holdStage: hold({
      id: 'fd-h0',
      title: 'Single restaurant orders',
      narrative:
        'Users order from one kitchen at a time. PM wants “Uber Eats cart” before partner APIs support splits.',
      holdPressure: 'multi-cart not supported by partners yet',
      pressures: ['multi-merchant cart', 'courier tracking', 'multi-cart not supported by partners yet'],
      flows: [
        flow('order', 'Order placed', {
          reach: [
            { from: 'CustomerApp', to: 'OrderOrchestrator' },
            { from: 'OrderOrchestrator', to: 'RestaurantAPI' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'fd-s2',
        dayLabel: 'Day 70',
        title: 'Multi-restaurant cart',
        category: 'product',
        narrative: 'Users combine bubble tea and burgers. One checkout, multiple fulfillment legs.',
        pressures: ['split fulfillment', 'pricing'],
        protected: [flow('single', 'Single restaurant still works', { keep: ['RestaurantAPI'] })],
        newFlows: [flow('multi', 'Multi-merchant', { topics: ['suborder', 'split'] })],
        hints: ['SubOrder', 'OrderOrchestrator'],
        budget: 4,
      }),
      ch({
        id: 'fd-s3',
        dayLabel: 'Day 160',
        title: 'Live courier tracking',
        category: 'product',
        narrative: 'Customers expect map dots. Location updates must not block order state machine.',
        pressures: ['real-time', 'state machine'],
        protected: [flow('place', 'Place order', { keep: ['CustomerApp'] })],
        newFlows: [flow('track', 'Courier tracking', { topics: ['courier', 'location'] })],
        hints: ['CourierTracker', 'OrderOrchestrator'],
        budget: 4,
      }),
      ch({
        id: 'fd-s4',
        dayLabel: 'Day 250',
        title: 'SLA auto-refunds',
        category: 'reliability',
        narrative: 'Late deliveries spike chargebacks. Policy engine triggers partial refunds automatically.',
        pressures: ['policy engine', 'refund coupling'],
        protected: [flow('fulfill', 'Fulfillment path', { keep: ['OrderOrchestrator'] })],
        newFlows: [flow('sla', 'SLA refunds', { topics: ['sla', 'refund'] })],
        hints: ['SlaPolicy', 'RefundService', 'OrderOrchestrator'],
        budget: 5,
        metrics: { ordersPerDay: 180000 },
      }),
    ],
  },

  {
    key: 'ticketing-reservation',
    title: 'Ticketing & Reservation Evolution',
    tags: ['ticketing', 'events', 'scale'],
    description:
      'Grow simple seat holds into inventory locks, transfer marketplace, and anti-scalping limits.',
    briefing: br(
      'BoxOffice → TicketService → SeatMap sells general admission counts.',
      'Reserved seating, peer transfers, then bot-driven sellouts force purchase limits.',
      'Seat truth is scarce — evolve locking before you trust cached counts.',
    ),
    diagram: hubDiagram(
      'tix',
      'TicketService',
      ['purchase', 'holdSeat'],
      [
        { name: 'SeatMap', methods: ['availability'], slot: 'left' },
        { name: 'PaymentGate', methods: ['charge'], slot: 'right' },
      ],
      { name: 'BoxOffice', methods: ['buy'] },
    ),
    holdStage: hold({
      id: 'tx-h0',
      title: 'GA capacity only',
      narrative:
        'Small venue, no seat map. Marketing asks for resale marketplace before first sold-out show.',
      holdPressure: 'no reserved seating — hold seat map work',
      pressures: ['seat map cost', 'scalper risk', 'no reserved seating — hold seat map work'],
      flows: [
        flow('buy', 'Ticket purchase', {
          reach: [
            { from: 'BoxOffice', to: 'TicketService' },
            { from: 'TicketService', to: 'PaymentGate' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'tx-s2',
        dayLabel: 'Day 95',
        title: 'Reserved seating',
        category: 'product',
        narrative: 'Arena upgrade requires seat-level holds during checkout.',
        pressures: ['hold TTL', 'double booking'],
        protected: [flow('pay', 'Payment path', { keep: ['PaymentGate'] })],
        newFlows: [flow('seat-hold', 'Seat holds', { topics: ['seat', 'hold'] })],
        hints: ['SeatLock', 'SeatMap', 'TicketService'],
        budget: 4,
      }),
      ch({
        id: 'tx-s3',
        dayLabel: 'Day 185',
        title: 'Transfer marketplace',
        category: 'product',
        narrative: 'Fans resell safely. Ownership must transfer atomically with barcode rotation.',
        pressures: ['ownership transfer', 'fraud'],
        protected: [flow('purchase', 'Primary sales', { keep: ['BoxOffice'] })],
        newFlows: [flow('transfer', 'Ticket transfer', { topics: ['transfer', 'resale'] })],
        hints: ['TransferService', 'TicketService'],
        budget: 4,
      }),
      ch({
        id: 'tx-s4',
        dayLabel: 'Day 275',
        title: 'Anti-scalping limits',
        category: 'scale',
        narrative: 'Bots buy out shows in seconds. Per-user limits and device fingerprinting required.',
        pressures: ['bot traffic', 'fair access'],
        protected: [flow('sale', 'Sales complete', { keep: ['TicketService'] })],
        newFlows: [flow('limit', 'Purchase limits', { topics: ['limit', 'bot'] })],
        hints: ['PurchaseLimiter', 'RiskSignal', 'TicketService'],
        budget: 5,
        metrics: { ordersPerDay: 50000, latencyMs: 200 },
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'tx-inc',
        dayLabel: 'Day 290',
        title: 'On-sale meltdown',
        category: 'incident',
        narrative: 'Queue overflow crashed SeatMap. Degraded mode must sell without corrupt inventory.',
        pressures: ['degraded mode', 'inventory truth'],
        protected: [flow('inventory', 'Inventory consistent', { topics: ['seat'] })],
        hints: ['SaleQueue', 'SeatMap', 'TicketService'],
        budget: 5,
      }),
    ],
  },

  {
    key: 'cms-content-publish',
    title: 'CMS Publishing Evolution',
    tags: ['cms', 'content', 'product'],
    description:
      'Evolve draft-and-publish pages into workflows, preview environments, and CDN cache busting.',
    briefing: br(
      'EditorUI → ContentService → PageStore saves drafts and publishes immediately.',
      'Marketing needs approvals, staging preview, then global CDN invalidation on publish.',
      'Publishing is a workflow — evolve when editors trip over each other, not before.',
    ),
    diagram: chainDiagram(
      'cms',
      [
        { name: 'EditorUI', methods: ['save'], row: 0 },
        { name: 'ContentService', methods: ['publish'], row: 1 },
        { name: 'PageStore', methods: ['write'], row: 2 },
      ],
      [
        { from: 'EditorUI', to: 'ContentService' },
        { from: 'ContentService', to: 'PageStore' },
      ],
    ),
    holdStage: hold({
      id: 'cm-h0',
      title: 'Direct publish OK',
      narrative:
        'Three editors, low traffic. CTO wants full approval workflow before second marketing hire.',
      holdPressure: 'no approval policy defined yet',
      pressures: ['workflow overhead', 'preview env cost', 'no approval policy defined yet'],
      flows: [
        flow('publish', 'Publish path', {
          reach: [
            { from: 'EditorUI', to: 'ContentService' },
            { from: 'ContentService', to: 'PageStore' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'cm-s2',
        dayLabel: 'Day 65',
        title: 'Editorial workflow',
        category: 'product',
        narrative: 'Legal must approve public copy. States: draft → review → live.',
        pressures: ['state machine', 'roles'],
        protected: [flow('save', 'Save drafts', { keep: ['EditorUI'] })],
        newFlows: [flow('workflow', 'Approval workflow', { topics: ['workflow', 'review'] })],
        hints: ['WorkflowEngine', 'ContentService'],
        budget: 3,
      }),
      ch({
        id: 'cm-s3',
        dayLabel: 'Day 150',
        title: 'Preview environment',
        category: 'product',
        narrative: 'Stakeholders preview before go-live without exposing drafts on production URLs.',
        pressures: ['preview isolation', 'tokenized URLs'],
        protected: [flow('live', 'Live publish', { keep: ['ContentService'] })],
        newFlows: [flow('preview', 'Preview site', { topics: ['preview', 'staging'] })],
        hints: ['PreviewRenderer', 'ContentService'],
        budget: 4,
      }),
      ch({
        id: 'cm-s4',
        dayLabel: 'Day 240',
        title: 'CDN cache invalidation',
        category: 'scale',
        narrative: 'Global CDN serves stale hero banners after publish. Invalidation must be reliable.',
        pressures: ['cache bust', 'eventual consistency'],
        protected: [flow('store', 'Content persisted', { keep: ['PageStore'] })],
        newFlows: [flow('cdn-inv', 'CDN invalidate', { topics: ['cdn', 'invalidate'] })],
        hints: ['CdnInvalidator', 'ContentService'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'iot-device-telemetry',
    title: 'IoT Telemetry Evolution',
    tags: ['iot', 'telemetry', 'scale'],
    description:
      'Grow device ping storage into ingestion buffers, rules engine alerts, and OTA command channels.',
    briefing: br(
      'DeviceGateway → TelemetryWriter → TimeSeriesDB accepts one metric per request.',
      'Burst traffic needs buffering, then threshold rules, then secure OTA firmware commands.',
      'Devices are unreliable clients — evolve ingestion before rules, rules before OTA.',
    ),
    diagram: hubDiagram(
      'iot',
      'TelemetryWriter',
      ['writeReading'],
      [
        { name: 'TimeSeriesDB', methods: ['insert'], slot: 'left' },
        { name: 'DeviceRegistry', methods: ['authenticate'], slot: 'right' },
      ],
      { name: 'DeviceGateway', methods: ['ingest'] },
    ),
    holdStage: hold({
      id: 'io-h0',
      title: 'Low-volume telemetry',
      narrative:
        'Pilot fleet of 500 devices. Ops wants Kafka “because IoT” before sustained >100 RPS.',
      holdPressure: 'traffic too low for streaming buffer',
      pressures: ['buffer premature', 'OTA security', 'traffic too low for streaming buffer'],
      flows: [
        flow('ingest', 'Telemetry ingested', {
          reach: [
            { from: 'DeviceGateway', to: 'TelemetryWriter' },
            { from: 'TelemetryWriter', to: 'TimeSeriesDB' },
          ],
        }),
      ],
      metrics: { users: 500, ordersPerDay: 80000 },
    }),
    changeStages: [
      ch({
        id: 'io-s2',
        dayLabel: 'Day 80',
        title: 'Ingestion buffer',
        category: 'scale',
        narrative: 'Fleet scales to 50k devices with minute-level bursts. DB cannot take synchronous writes.',
        pressures: ['write spikes', 'backpressure'],
        protected: [flow('auth', 'Device auth', { keep: ['DeviceRegistry'] })],
        newFlows: [flow('buffer', 'Buffered ingest', { topics: ['queue', 'buffer'] })],
        hints: ['IngestQueue', 'TelemetryWriter'],
        budget: 4,
      }),
      ch({
        id: 'io-s3',
        dayLabel: 'Day 170',
        title: 'Rules engine alerts',
        category: 'product',
        narrative: 'Ops wants threshold alerts without querying TSDB every second per device.',
        pressures: ['streaming rules', 'alert fatigue'],
        protected: [flow('write', 'Writes continue', { keep: ['TelemetryWriter'] })],
        newFlows: [flow('alert', 'Alert rules', { topics: ['rule', 'alert'] })],
        hints: ['RuleEngine', 'AlertDispatcher'],
        budget: 4,
      }),
      ch({
        id: 'io-s4',
        dayLabel: 'Day 260',
        title: 'OTA command channel',
        category: 'reliability',
        narrative: 'Push firmware updates with signed commands and ack tracking.',
        pressures: ['command signing', 'device offline'],
        protected: [flow('telemetry', 'Telemetry path', { keep: ['DeviceGateway'] })],
        newFlows: [flow('ota', 'OTA commands', { topics: ['ota', 'command'] })],
        hints: ['CommandBus', 'OtaCoordinator', 'DeviceRegistry'],
        budget: 5,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'io-leg',
        dayLabel: 'Day 280',
        title: 'Legacy MQTT devices',
        category: 'legacy',
        narrative: 'Old firmware speaks MQTT while new stack is HTTP. Bridge without dual writers.',
        pressures: ['protocol bridge', 'duplicate writes'],
        protected: [flow('tsdb', 'Single TSDB path', { keep: ['TimeSeriesDB'] })],
        hints: ['MqttBridge', 'TelemetryWriter'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'payroll-run',
    title: 'Payroll Run Evolution',
    tags: ['payroll', 'hr', 'reliability'],
    description:
      'Evolve monthly batch pays into mid-cycle corrections, multi-country tax, and idempotent reruns.',
    briefing: br(
      'HrPortal → PayrollRunner → EmployeeTable calculates net pay in one nightly job.',
      'Corrections mid-month, then EU tax rules, then rerun safety after partial failures.',
      'Payroll errors are trust incidents — evolve correctness before optimizing runtime.',
    ),
    diagram: chainDiagram(
      'payroll',
      [
        { name: 'HrPortal', methods: ['triggerRun'], row: 0 },
        { name: 'PayrollRunner', methods: ['calculate'], row: 1 },
        { name: 'EmployeeTable', methods: ['load'], row: 2 },
        { name: 'BankExport', methods: ['generate'], row: 3 },
      ],
      [
        { from: 'HrPortal', to: 'PayrollRunner' },
        { from: 'PayrollRunner', to: 'EmployeeTable' },
        { from: 'PayrollRunner', to: 'BankExport' },
      ],
    ),
    holdStage: hold({
      id: 'pr-h0',
      title: 'Monthly batch enough',
      narrative:
        'Single country, salaried staff. HR asks for weekly pay before policy or banking supports it.',
      holdPressure: 'pay frequency policy unchanged',
      pressures: ['weekly pay ask', 'multi-country', 'pay frequency policy unchanged'],
      flows: [
        flow('run', 'Payroll run', {
          reach: [
            { from: 'HrPortal', to: 'PayrollRunner' },
            { from: 'PayrollRunner', to: 'BankExport' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'pr-s2',
        dayLabel: 'Day 100',
        title: 'Mid-cycle corrections',
        category: 'product',
        narrative: 'Bonus adjustments after a run closed. Need adjustment entries without rewriting history.',
        pressures: ['immutable runs', 'adjustments'],
        protected: [flow('batch', 'Monthly batch', { keep: ['PayrollRunner'] })],
        newFlows: [flow('adj', 'Adjustments', { topics: ['adjustment', 'correction'] })],
        hints: ['PayAdjustment', 'PayrollRunner'],
        budget: 3,
      }),
      ch({
        id: 'pr-s3',
        dayLabel: 'Day 210',
        title: 'Multi-country tax',
        category: 'product',
        narrative: 'UK and DE employees need different tax calculators plugged into same runner.',
        pressures: ['strategy per locale', 'compliance'],
        protected: [flow('export', 'Bank export', { keep: ['BankExport'] })],
        newFlows: [flow('tax', 'Locale tax', { topics: ['tax', 'locale'] })],
        hints: ['TaxCalculator', 'LocalePolicy', 'PayrollRunner'],
        budget: 4,
      }),
      ch({
        id: 'pr-s4',
        dayLabel: 'Day 300',
        title: 'Idempotent reruns',
        category: 'reliability',
        narrative: 'Partial failure left half the company unpaid. Rerun must not double-pay.',
        pressures: ['idempotent rerun', 'checkpoint'],
        protected: [flow('calc', 'Calculate pay', { keep: ['PayrollRunner'] })],
        newFlows: [flow('rerun', 'Safe rerun', { topics: ['idempotent', 'checkpoint'] })],
        hints: ['RunLedger', 'PayrollRunner'],
        budget: 5,
      }),
    ],
  },

  {
    key: 'compliance-audit-trail',
    title: 'Compliance Audit Evolution',
    tags: ['compliance', 'audit', 'reliability'],
    description:
      'Grow ad-hoc admin logs into structured audit events, retention tiers, and tamper-evident storage.',
    briefing: br(
      'AdminConsole → ActionLogger → LogFile appends unstructured text lines.',
      'SOC2 needs queryable audit, then retention policies, then WORM storage for regulators.',
      'Audit is cross-cutting — introduce early when sales cycles depend on it.',
    ),
    dimensions: ['compliance', 'reliability'],
    diagram: chainDiagram(
      'comp',
      [
        { name: 'AdminConsole', methods: ['execute'], row: 0 },
        { name: 'ActionLogger', methods: ['log'], row: 1 },
        { name: 'LogFile', methods: ['append'], row: 2 },
      ],
      [
        { from: 'AdminConsole', to: 'ActionLogger' },
        { from: 'ActionLogger', to: 'LogFile' },
      ],
    ),
    holdStage: hold({
      id: 'co-h0',
      title: 'Text logs sufficient',
      narrative:
        'Internal admin tool, no enterprise prospects asking for SOC2 yet. File logs grep fine today.',
      holdPressure: 'no audit SLA in contracts',
      pressures: ['SOC2 pressure', 'WORM cost', 'no audit SLA in contracts'],
      flows: [
        flow('log', 'Actions logged', {
          reach: [
            { from: 'AdminConsole', to: 'ActionLogger' },
            { from: 'ActionLogger', to: 'LogFile' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'co-s2',
        dayLabel: 'Day 110',
        title: 'Structured audit events',
        category: 'product',
        narrative: 'Enterprise deal requires actor, resource, before/after in queryable form.',
        pressures: ['structured events', 'PII in logs'],
        protected: [flow('admin', 'Admin actions', { keep: ['AdminConsole'] })],
        newFlows: [flow('audit-ev', 'Audit events', { topics: ['audit', 'event'] })],
        hints: ['AuditEvent', 'AuditStore', 'ActionLogger'],
        budget: 3,
      }),
      ch({
        id: 'co-s3',
        dayLabel: 'Day 220',
        title: 'Retention tiers',
        category: 'scale',
        narrative: 'Hot 90-day search, cold 7-year archive. Costs must not balloon.',
        pressures: ['retention policy', 'tiering'],
        protected: [flow('capture', 'Events captured', { keep: ['ActionLogger'] })],
        newFlows: [flow('retain', 'Retention tiers', { topics: ['archive', 'retention'] })],
        hints: ['RetentionPolicy', 'AuditArchive'],
        budget: 4,
      }),
      ch({
        id: 'co-s4',
        dayLabel: 'Day 320',
        title: 'Tamper-evident storage',
        category: 'reliability',
        narrative: 'Regulator wants proof logs were not edited post-incident.',
        pressures: ['WORM', 'hash chain'],
        protected: [flow('query', 'Audit queryable', { topics: ['audit'] })],
        newFlows: [flow('tamper', 'Tamper evidence', { topics: ['hash', 'worm'] })],
        hints: ['ImmutableStore', 'AuditStore'],
        budget: 5,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'co-team',
        dayLabel: 'Day 335',
        title: 'Shared logging ownership',
        category: 'team',
        narrative:
          'Every team logs differently. Platform needs shared audit SDK without blocking product ships.',
        pressures: ['standardization', 'adoption'],
        protected: [flow('events', 'Events still flow', { keep: ['AuditStore'] })],
        hints: ['AuditSdk', 'ActionLogger'],
        budget: 3,
      }),
    ],
  },

  {
    key: 'search-indexing',
    title: 'Search Index Evolution',
    tags: ['search', 'indexing', 'scale'],
    description:
      'Evolve SQL LIKE search into inverted index, faceted filters, and near-real-time sync.',
    briefing: br(
      'SearchAPI → QueryService → ProductDatabase runs LIKE queries on title.',
      'Catalog grows, facets needed, then inventory updates must appear in search within seconds.',
      'Search is a read model — evolve off the critical write path.',
    ),
    diagram: hubDiagram(
      'search',
      'QueryService',
      ['search'],
      [{ name: 'ProductDatabase', methods: ['queryLike'], slot: 'left' }],
      { name: 'SearchAPI', methods: ['handle'] },
    ),
    holdStage: hold({
      id: 'se-h0',
      title: 'SQL search OK',
      narrative:
        '10k SKUs, internal users only. PM wants Elasticsearch before customer-facing search launch date.',
      holdPressure: 'no customer search launch yet',
      pressures: ['index ops cost', 'sync complexity', 'no customer search launch yet'],
      flows: [
        flow('query', 'Search queries DB', {
          reach: [
            { from: 'SearchAPI', to: 'QueryService' },
            { from: 'QueryService', to: 'ProductDatabase' },
          ],
        }),
      ],
      metrics: { latencyMs: 300 },
    }),
    changeStages: [
      ch({
        id: 'se-s2',
        dayLabel: 'Day 75',
        title: 'Dedicated search index',
        category: 'scale',
        narrative: 'LIKE scans timeout. Build inverted index updated by batch job.',
        pressures: ['full table scan', 'relevance'],
        protected: [flow('api', 'Search API', { keep: ['SearchAPI'] })],
        newFlows: [flow('index', 'Search index', { topics: ['index', 'elastic'] })],
        hints: ['SearchIndex', 'IndexBuilder', 'QueryService'],
        budget: 4,
      }),
      ch({
        id: 'se-s3',
        dayLabel: 'Day 165',
        title: 'Faceted filters',
        category: 'product',
        narrative: 'Users filter by brand, price, rating. Facets must stay consistent with index.',
        pressures: ['facet aggregation', 'filter UX'],
        protected: [flow('search', 'Search works', { keep: ['QueryService'] })],
        newFlows: [flow('facet', 'Faceted search', { topics: ['facet', 'filter'] })],
        hints: ['FacetAggregator', 'QueryService'],
        budget: 4,
      }),
      ch({
        id: 'se-s4',
        dayLabel: 'Day 255',
        title: 'Near-real-time sync',
        category: 'reliability',
        narrative: 'Out-of-stock items still appear in results. CDC or event stream must update index.',
        pressures: ['staleness', 'CDC'],
        protected: [flow('catalog', 'Catalog writes', { notReach: [{ from: 'ProductDatabase', to: 'SearchIndex' }] })],
        newFlows: [flow('sync', 'Index sync', { topics: ['cdc', 'sync'] })],
        hints: ['ChangeStream', 'IndexUpdater'],
        budget: 5,
        metrics: { latencyMs: 80 },
      }),
    ],
  },

  {
    key: 'cache-aside-catalog',
    title: 'Caching Layer Evolution',
    tags: ['caching', 'performance', 'scale'],
    description:
      'Grow direct DB reads into cache-aside, stampede protection, and invalidation on write.',
    briefing: br(
      'CatalogAPI → ProductReader → ProductDatabase fetches every request from SQL.',
      'Redis cache-aside, then thundering herd fixes, then write-through invalidation rules.',
      'Cache when measured pain exists — not because Redis is fashionable on Day 0.',
    ),
    diagram: chainDiagram(
      'cache',
      [
        { name: 'CatalogAPI', methods: ['getProduct'], row: 0 },
        { name: 'ProductReader', methods: ['load'], row: 1 },
        { name: 'ProductDatabase', methods: ['select'], row: 2 },
      ],
      [
        { from: 'CatalogAPI', to: 'ProductReader' },
        { from: 'ProductReader', to: 'ProductDatabase' },
      ],
    ),
    holdStage: hold({
      id: 'ca-h0',
      title: 'DB reads fine',
      narrative:
        'P99 40ms on product reads. Engineer proposes Redis cluster before traffic 10× or hot keys exist.',
      holdPressure: 'latency SLO met — cache adds ops burden',
      pressures: ['premature cache', 'invalidation fear', 'latency SLO met — cache adds ops burden'],
      flows: [
        flow('read', 'Read path', {
          reach: [
            { from: 'CatalogAPI', to: 'ProductReader' },
            { from: 'ProductReader', to: 'ProductDatabase' },
          ],
        }),
      ],
      metrics: { latencyMs: 40, ordersPerDay: 20000 },
    }),
    changeStages: [
      ch({
        id: 'ca-s2',
        dayLabel: 'Day 85',
        title: 'Cache-aside Redis',
        category: 'scale',
        narrative: 'Flash sale spiked DB CPU. Cache popular SKUs with TTL.',
        pressures: ['hot keys', 'TTL staleness'],
        protected: [flow('api-read', 'API reads work', { keep: ['CatalogAPI'] })],
        newFlows: [flow('cache-hit', 'Cache aside', { topics: ['redis', 'cache'] })],
        hints: ['CacheClient', 'ProductReader'],
        budget: 3,
      }),
      ch({
        id: 'ca-s3',
        dayLabel: 'Day 175',
        title: 'Stampede protection',
        category: 'reliability',
        narrative: 'Cache expiry caused synchronized DB slam. Need single-flight or probabilistic early refresh.',
        pressures: ['thundering herd', 'single-flight'],
        protected: [flow('cache', 'Cache layer', { keep: ['CacheClient'] })],
        newFlows: [flow('stampede', 'Stampede guard', { topics: ['single-flight', 'lock'] })],
        hints: ['RefreshCoordinator', 'ProductReader'],
        budget: 4,
      }),
      ch({
        id: 'ca-s4',
        dayLabel: 'Day 265',
        title: 'Write invalidation',
        category: 'reliability',
        narrative: 'Merchants update price; cache serves old value for minutes. Invalidate on write events.',
        pressures: ['cache coherence', 'event order'],
        protected: [flow('db-read', 'DB fallback', { reach: [{ from: 'ProductReader', to: 'ProductDatabase' }] })],
        newFlows: [flow('invalidate', 'Invalidation', { topics: ['invalidate', 'pubsub'] })],
        hints: ['InvalidationBus', 'ProductReader'],
        budget: 4,
        metrics: { latencyMs: 25 },
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'ca-inc',
        dayLabel: 'Day 280',
        title: 'Cache cluster failover',
        category: 'incident',
        narrative: 'Redis AZ loss. System must degrade to DB with circuit breaker, not cascade failure.',
        pressures: ['failover', 'degraded mode'],
        protected: [flow('catalog-up', 'Catalog stays up', { keep: ['CatalogAPI'] })],
        hints: ['CircuitBreaker', 'ProductReader'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'api-gateway-routing',
    title: 'API Gateway Evolution',
    tags: ['api-gateway', 'routing', 'scale'],
    description:
      'Evolve monolith-facing proxy into versioned routes, auth termination, and rate-aware routing.',
    briefing: br(
      'ClientApp → Gateway → MonolithAPI forwards all paths to one service.',
      'Mobile v2 APIs, JWT validation at edge, then traffic shaping during deploys.',
      'Gateway owns cross-cutting ingress — evolve when clients multiply, not on first user.',
    ),
    diagram: hubDiagram(
      'gw',
      'Gateway',
      ['route', 'forward'],
      [
        { name: 'MonolithAPI', methods: ['handle'], slot: 'left' },
        { name: 'RouteTable', methods: ['match'], slot: 'right' },
      ],
      { name: 'ClientApp', methods: ['call'] },
    ),
    holdStage: hold({
      id: 'gw-h0',
      title: 'Thin proxy enough',
      narrative:
        'One mobile client, one API version. Platform team wants full API management suite pre-launch.',
      holdPressure: 'single client version — YAGNI at gateway',
      pressures: ['API management suite', 'mTLS complexity', 'single client version — YAGNI at gateway'],
      flows: [
        flow('forward', 'Requests forwarded', {
          reach: [
            { from: 'ClientApp', to: 'Gateway' },
            { from: 'Gateway', to: 'MonolithAPI' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'gw-s2',
        dayLabel: 'Day 90',
        title: 'Versioned routes',
        category: 'product',
        narrative: '/v1 and /v2 must coexist during mobile rollout.',
        pressures: ['routing rules', 'deprecation'],
        protected: [flow('v1', 'V1 traffic', { topics: ['v1'] })],
        newFlows: [flow('v2', 'V2 routes', { topics: ['v2', 'route'] })],
        hints: ['RouteTable', 'Gateway'],
        budget: 3,
      }),
      ch({
        id: 'gw-s3',
        dayLabel: 'Day 180',
        title: 'Auth at the edge',
        category: 'reliability',
        narrative: 'Stop invalid JWTs from hitting monolith CPU. Terminate auth in gateway.',
        pressures: ['auth termination', 'clock skew'],
        protected: [flow('monolith', 'Monolith protected', { keep: ['MonolithAPI'] })],
        newFlows: [flow('jwt', 'JWT validation', { topics: ['jwt', 'auth'] })],
        hints: ['AuthFilter', 'Gateway'],
        budget: 4,
      }),
      ch({
        id: 'gw-s4',
        dayLabel: 'Day 270',
        title: 'Canary routing',
        category: 'scale',
        narrative: 'Deploy new monolith revision to 5% traffic without separate DNS.',
        pressures: ['canary', 'observability'],
        protected: [flow('route-all', 'All routes match', { keep: ['RouteTable'] })],
        newFlows: [flow('canary', 'Canary traffic', { topics: ['canary', 'weight'] })],
        hints: ['TrafficSplitter', 'Gateway'],
        budget: 4,
        metrics: { ordersPerDay: 500000, latencyMs: 35 },
      }),
    ],
  },

  {
    key: 'warehouse-fulfillment',
    title: 'Warehouse Fulfillment Evolution',
    tags: ['warehouse', 'fulfillment', 'scale'],
    description:
      'Grow pick-list printing into wave planning, bin optimization, and carrier label integration.',
    briefing: br(
      'OrderExporter → FulfillmentService → PickListGenerator creates FIFO pick lists.',
      'Wave picking by cutoff, slotting rules, then multi-carrier shipping labels.',
      'Fulfillment throughput matters when SLA misses cost money — not before volume.',
    ),
    diagram: chainDiagram(
      'wh',
      [
        { name: 'OrderExporter', methods: ['export'], row: 0 },
        { name: 'FulfillmentService', methods: ['fulfill'], row: 1 },
        { name: 'PickListGenerator', methods: ['generate'], row: 2 },
        { name: 'InventorySnapshot', methods: ['read'], row: 3, col: 2 },
      ],
      [
        { from: 'OrderExporter', to: 'FulfillmentService' },
        { from: 'FulfillmentService', to: 'PickListGenerator' },
        { from: 'PickListGenerator', to: 'InventorySnapshot', type: 'association' },
      ],
    ),
    holdStage: hold({
      id: 'wh-h0',
      title: 'FIFO pick lists',
      narrative:
        'Small warehouse, manual carts. WMS vendor demo urges wave engine before second shift exists.',
      holdPressure: 'volume fits FIFO — waves premature',
      pressures: ['WMS wave engine', 'slotting ROI', 'volume fits FIFO — waves premature'],
      flows: [
        flow('pick', 'Pick lists generated', {
          reach: [
            { from: 'OrderExporter', to: 'FulfillmentService' },
            { from: 'FulfillmentService', to: 'PickListGenerator' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'wh-s2',
        dayLabel: 'Day 95',
        title: 'Wave planning',
        category: 'scale',
        narrative: 'Same-day cutoff needs batched picks by carrier departure time.',
        pressures: ['batch planning', 'cutoff rules'],
        protected: [flow('export', 'Orders export', { keep: ['OrderExporter'] })],
        newFlows: [flow('wave', 'Wave picks', { topics: ['wave', 'batch'] })],
        hints: ['WavePlanner', 'FulfillmentService'],
        budget: 4,
      }),
      ch({
        id: 'wh-s3',
        dayLabel: 'Day 190',
        title: 'Bin slotting',
        category: 'product',
        narrative: 'Fast movers should sit near pack stations. Pick path length dominates labor cost.',
        pressures: ['slotting', 'SKU velocity'],
        protected: [flow('gen', 'Lists generate', { keep: ['PickListGenerator'] })],
        newFlows: [flow('slot', 'Slotting rules', { topics: ['bin', 'slot'] })],
        hints: ['SlottingPolicy', 'FulfillmentService'],
        budget: 4,
      }),
      ch({
        id: 'wh-s4',
        dayLabel: 'Day 285',
        title: 'Carrier labels',
        category: 'product',
        narrative: 'Multi-carrier rates and label print must not block pick confirmation.',
        pressures: ['carrier API', 'async label'],
        protected: [flow('fulfill', 'Fulfillment core', { keep: ['FulfillmentService'] })],
        newFlows: [flow('label', 'Shipping labels', { topics: ['carrier', 'label'] })],
        hints: ['CarrierAdapter', 'LabelService'],
        budget: 5,
        metrics: { ordersPerDay: 75000 },
      }),
    ],
  },

  {
    key: 'crm-pipeline',
    title: 'CRM Pipeline Evolution',
    tags: ['crm', 'sales', 'product'],
    description:
      'Evolve contact notes into deal stages, automation rules, and conflict-safe multi-rep ownership.',
    briefing: br(
      'SalesApp → CrmService → ContactRecord stores notes on leads.',
      'Pipeline stages, email sequences, then two reps editing same account safely.',
      'CRM grows with sales process maturity — hold fancy automation until stages are defined.',
    ),
    diagram: hubDiagram(
      'crm',
      'CrmService',
      ['updateContact', 'logActivity'],
      [{ name: 'ContactRecord', methods: ['save'], slot: 'left' }],
      { name: 'SalesApp', methods: ['view'] },
    ),
    holdStage: hold({
      id: 'cr-h0',
      title: 'Contact notes MVP',
      narrative:
        'Five reps, informal process. VP Sales wants full marketing automation before repeatable pipeline stages exist.',
      holdPressure: 'pipeline stages undefined — hold automation',
      pressures: ['automation envy', 'data model sprawl', 'pipeline stages undefined — hold automation'],
      flows: [
        flow('crm', 'Contact updates', {
          reach: [
            { from: 'SalesApp', to: 'CrmService' },
            { from: 'CrmService', to: 'ContactRecord' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'cr-s2',
        dayLabel: 'Day 80',
        title: 'Deal pipeline stages',
        category: 'product',
        narrative: 'Forecast requires stages: lead → qualified → closed. Contacts become deals.',
        pressures: ['model split', 'forecast accuracy'],
        protected: [flow('contact', 'Contacts persist', { keep: ['ContactRecord'] })],
        newFlows: [flow('deal', 'Deal stages', { topics: ['deal', 'stage'] })],
        hints: ['Deal', 'PipelineStage', 'CrmService'],
        budget: 3,
      }),
      ch({
        id: 'cr-s3',
        dayLabel: 'Day 170',
        title: 'Workflow automation',
        category: 'product',
        narrative: 'Auto-create tasks when deal idle 7 days. Rules must not hard-code in CrmService.',
        pressures: ['rule engine', 'notification noise'],
        protected: [flow('activity', 'Activity log', { keep: ['CrmService'] })],
        newFlows: [flow('auto', 'Automation rules', { topics: ['workflow', 'rule'] })],
        hints: ['RuleEngine', 'TaskScheduler', 'CrmService'],
        budget: 4,
      }),
      ch({
        id: 'cr-s4',
        dayLabel: 'Day 260',
        title: 'Optimistic concurrency',
        category: 'reliability',
        narrative: 'Two reps overwrite each other on big accounts. Need versioning or field-level merge.',
        pressures: ['lost updates', 'conflict UX'],
        protected: [flow('sales', 'Sales app works', { keep: ['SalesApp'] })],
        newFlows: [flow('conflict', 'Conflict handling', { topics: ['version', 'merge'] })],
        hints: ['VersionVector', 'ContactRecord', 'CrmService'],
        budget: 4,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'cr-leg',
        dayLabel: 'Day 275',
        title: 'Legacy spreadsheet import',
        category: 'legacy',
        narrative: 'Annual bulk import from Excel must map to new Deal model without duplicating accounts.',
        pressures: ['dedupe', 'migration'],
        protected: [flow('deals', 'Deals intact', { topics: ['deal'] })],
        hints: ['ImportMapper', 'CrmService'],
        budget: 3,
      }),
    ],
  },

  {
    key: 'chat-rooms',
    title: 'Chat Rooms Evolution',
    tags: ['chat', 'realtime', 'scale'],
    description:
      'Grow 1:1 messages into rooms, presence, read receipts, and fan-out at scale.',
    briefing: br(
      'ChatClient → MessageService → MessageStore persists sequential messages.',
      'Group rooms, online presence, then thousands of members need fan-out architecture.',
      'Realtime features stack — do not jump to sharded fan-out before group chat is a requirement.',
    ),
    diagram: chainDiagram(
      'chat',
      [
        { name: 'ChatClient', methods: ['send'], row: 0 },
        { name: 'MessageService', methods: ['deliver'], row: 1 },
        { name: 'MessageStore', methods: ['append'], row: 2 },
      ],
      [
        { from: 'ChatClient', to: 'MessageService' },
        { from: 'MessageService', to: 'MessageStore' },
      ],
    ),
    holdStage: hold({
      id: 'ch-h0',
      title: '1:1 chat works',
      narrative:
        'DM-only MVP. Design doc proposes CRDT sync before group chat is on the roadmap.',
      holdPressure: 'group chat not on roadmap yet',
      pressures: ['CRDT early', 'presence cost', 'group chat not on roadmap yet'],
      flows: [
        flow('msg', 'Messages delivered', {
          reach: [
            { from: 'ChatClient', to: 'MessageService' },
            { from: 'MessageService', to: 'MessageStore' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'ch-s2',
        dayLabel: 'Day 70',
        title: 'Group rooms',
        category: 'product',
        narrative: 'Team channels need membership and room-scoped history.',
        pressures: ['membership model', 'authorization'],
        protected: [flow('dm', 'DM still works', { keep: ['MessageService'] })],
        newFlows: [flow('room', 'Room messages', { topics: ['room', 'channel'] })],
        hints: ['Room', 'Membership', 'MessageService'],
        budget: 4,
      }),
      ch({
        id: 'ch-s3',
        dayLabel: 'Day 160',
        title: 'Presence and receipts',
        category: 'product',
        narrative: 'Users expect online dots and read cursors without hammering MessageStore.',
        pressures: ['ephemeral state', 'write amplification'],
        protected: [flow('history', 'History intact', { keep: ['MessageStore'] })],
        newFlows: [flow('presence', 'Presence', { topics: ['presence', 'receipt'] })],
        hints: ['PresenceService', 'ReceiptTracker'],
        budget: 4,
      }),
      ch({
        id: 'ch-s4',
        dayLabel: 'Day 250',
        title: 'Fan-out at scale',
        category: 'scale',
        narrative: '10k-member announcement channel. Write once, fan-out via pub/sub.',
        pressures: ['fan-out', 'hot room'],
        protected: [flow('send', 'Send message', { keep: ['ChatClient'] })],
        newFlows: [flow('fanout', 'Message fan-out', { topics: ['pubsub', 'fanout'] })],
        hints: ['FanoutBus', 'MessageService'],
        budget: 5,
        metrics: { users: 1200000 },
      }),
    ],
  },

  {
    key: 'email-marketing-campaigns',
    title: 'Email Marketing Evolution',
    tags: ['email-marketing', 'campaigns', 'scale'],
    description:
      'Evolve blast sends into segmented campaigns, unsubscribe compliance, and send throttling.',
    briefing: br(
      'MarketerUI → CampaignSender → SmtpRelay sends one list at a time.',
      'Dynamic segments, CAN-SPAM footers, then ISP throttling forces queue-based sends.',
      'Compliance and deliverability are evolution triggers — not Day 0 abstractions.',
    ),
    diagram: hubDiagram(
      'email-mkt',
      'CampaignSender',
      ['sendBatch'],
      [
        { name: 'SmtpRelay', methods: ['transmit'], slot: 'left' },
        { name: 'SubscriberList', methods: ['load'], slot: 'right' },
      ],
      { name: 'MarketerUI', methods: ['launch'] },
    ),
    holdStage: hold({
      id: 'em-h0',
      title: 'Simple blasts OK',
      narrative:
        'Monthly newsletter to 5k subs. Legal has not asked for preference center yet.',
      holdPressure: 'list size small — segmentation optional',
      pressures: ['segment envy', 'compliance FUD', 'list size small — segmentation optional'],
      flows: [
        flow('blast', 'Campaign sends', {
          reach: [
            { from: 'MarketerUI', to: 'CampaignSender' },
            { from: 'CampaignSender', to: 'SmtpRelay' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'em-s2',
        dayLabel: 'Day 85',
        title: 'Dynamic segments',
        category: 'product',
        narrative: 'Marketers target “inactive 30d” without exporting CSVs.',
        pressures: ['query cost', 'segment freshness'],
        protected: [flow('send', 'Send path', { keep: ['CampaignSender'] })],
        newFlows: [flow('segment', 'Segments', { topics: ['segment', 'filter'] })],
        hints: ['SegmentEngine', 'SubscriberList'],
        budget: 3,
      }),
      ch({
        id: 'em-s3',
        dayLabel: 'Day 175',
        title: 'Unsubscribe compliance',
        category: 'product',
        narrative: 'One-click unsubscribe and suppression list must be honored on every template.',
        pressures: ['suppression list', 'legal'],
        protected: [flow('relay', 'SMTP relay', { keep: ['SmtpRelay'] })],
        newFlows: [flow('unsub', 'Unsubscribe', { topics: ['unsubscribe', 'suppression'] })],
        hints: ['SuppressionStore', 'CampaignSender'],
        budget: 4,
      }),
      ch({
        id: 'em-s4',
        dayLabel: 'Day 265',
        title: 'Send throttling',
        category: 'scale',
        narrative: 'Large blast tripped ISP rate limits. Queue workers with adaptive throughput.',
        pressures: ['deliverability', 'backoff'],
        protected: [flow('launch', 'Marketer launches', { keep: ['MarketerUI'] })],
        newFlows: [flow('throttle', 'Throttled send', { topics: ['queue', 'throttle'] })],
        hints: ['SendQueue', 'ThrottlePolicy', 'CampaignSender'],
        budget: 4,
        metrics: { ordersPerDay: 2000000 },
      }),
    ],
  },

  {
    key: 'subscription-lifecycle',
    title: 'Subscription Billing Evolution',
    tags: ['subscription-billing', 'saas', 'product'],
    description:
      'Grow flat monthly charges into plans, proration, dunning, and usage add-ons.',
    briefing: br(
      'SignupFlow → BillingService → InvoiceGenerator bills one fixed price monthly.',
      'Tiered plans, mid-cycle upgrades with proration, then failed payment retries.',
      'Billing correctness beats feature velocity — evolve when finance rejects manual spreadsheets.',
    ),
    diagram: chainDiagram(
      'sub',
      [
        { name: 'SignupFlow', methods: ['subscribe'], row: 0 },
        { name: 'BillingService', methods: ['charge'], row: 1 },
        { name: 'InvoiceGenerator', methods: ['create'], row: 2 },
        { name: 'PaymentMethod', methods: ['charge'], row: 3, col: 2 },
      ],
      [
        { from: 'SignupFlow', to: 'BillingService' },
        { from: 'BillingService', to: 'InvoiceGenerator' },
        { from: 'BillingService', to: 'PaymentMethod' },
      ],
    ),
    holdStage: hold({
      id: 'sb-h0',
      title: 'Single plan billing',
      narrative:
        'One SKU at $29/mo. Product sketches three tiers before pricing page exists.',
      holdPressure: 'single SKU — plan matrix premature',
      pressures: ['tier envy', 'dunning complexity', 'single SKU — plan matrix premature'],
      flows: [
        flow('bill', 'Monthly bill', {
          reach: [
            { from: 'SignupFlow', to: 'BillingService' },
            { from: 'BillingService', to: 'PaymentMethod' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'sb-s2',
        dayLabel: 'Day 90',
        title: 'Tiered plans',
        category: 'product',
        narrative: 'Pro and Enterprise features need distinct entitlements and prices.',
        pressures: ['entitlement', 'plan catalog'],
        protected: [flow('existing', 'Existing subs bill', { keep: ['BillingService'] })],
        newFlows: [flow('plan', 'Plan catalog', { topics: ['plan', 'tier'] })],
        hints: ['PlanCatalog', 'Entitlement', 'BillingService'],
        budget: 4,
      }),
      ch({
        id: 'sb-s3',
        dayLabel: 'Day 180',
        title: 'Proration on change',
        category: 'product',
        narrative: 'Upgrade mid-cycle charges partial difference fairly.',
        pressures: ['proration math', 'invoice clarity'],
        protected: [flow('invoice', 'Invoices generate', { keep: ['InvoiceGenerator'] })],
        newFlows: [flow('prorate', 'Proration', { topics: ['prorate', 'upgrade'] })],
        hints: ['ProrationCalculator', 'BillingService'],
        budget: 4,
        debt: {
          id: 'debt-dun',
          prompt: 'Failed cards are not retried — add dunning now?',
          costIfDeferred: 'Involuntary churn spikes after first card expiry wave.',
          laterStageId: 'sb-s4',
        },
      }),
      ch({
        id: 'sb-s4',
        dayLabel: 'Day 270',
        title: 'Dunning retries',
        category: 'reliability',
        narrative: 'Smart retries and grace periods before canceling access.',
        pressures: ['dunning', 'access gating'],
        protected: [flow('charge', 'Charge attempts', { keep: ['PaymentMethod'] })],
        newFlows: [flow('dun', 'Dunning flow', { topics: ['dunning', 'retry'] })],
        hints: ['DunningScheduler', 'BillingService'],
        budget: 5,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'sb-inc',
        dayLabel: 'Day 285',
        title: 'Billing run incident',
        category: 'incident',
        narrative: 'Nightly job double-billed 2% of customers. Need idempotent billing runs and alerts.',
        pressures: ['idempotent job', 'customer trust'],
        protected: [flow('sub-active', 'Subscriptions active', { topics: ['subscribe'] })],
        hints: ['BillingRunLedger', 'BillingService'],
        budget: 5,
      }),
    ],
  },

  {
    key: 'document-signing',
    title: 'Document Signing Evolution',
    tags: ['document-signing', 'workflow', 'compliance'],
    description:
      'Evolve PDF upload-sign into multi-party order, templates, and tamper-evident audit trail.',
    briefing: br(
      'SignerPortal → SignService → DocumentVault stores signed PDF bytes.',
      'Signing order for three parties, reusable templates, then legal wants certificate chain audit.',
      'E-sign is legally sensitive — evolve audit before shortcuts become disputes.',
    ),
    diagram: hubDiagram(
      'esign',
      'SignService',
      ['sign', 'finalize'],
      [
        { name: 'DocumentVault', methods: ['store'], slot: 'left' },
        { name: 'SignerPortal', methods: ['view'], slot: 'right' },
      ],
    ),
    holdStage: hold({
      id: 'ds-h0',
      title: 'Single signer flow',
      narrative:
        'Internal HR docs only. Legal asks for qualified eIDAS before EU hiring starts.',
      holdPressure: 'EU hires not started — qualified sign hold',
      pressures: ['qualified eIDAS', 'template library', 'EU hires not started — qualified sign hold'],
      flows: [
        flow('sign-flow', 'Document signed', {
          reach: [
            { from: 'SignerPortal', to: 'SignService' },
            { from: 'SignService', to: 'DocumentVault' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'ds-s2',
        dayLabel: 'Day 100',
        title: 'Multi-party signing order',
        category: 'product',
        narrative: 'Buyer, seller, witness must sign in sequence with reminders.',
        pressures: ['routing order', 'state machine'],
        protected: [flow('single-sign', 'Single signer still works', { keep: ['SignService'] })],
        newFlows: [flow('multi-party', 'Signing order', { topics: ['signer', 'order'] })],
        hints: ['SigningRoute', 'SignService'],
        budget: 4,
      }),
      ch({
        id: 'ds-s3',
        dayLabel: 'Day 200',
        title: 'Reusable templates',
        category: 'product',
        narrative: 'Sales sends NDAs from templates with merge fields.',
        pressures: ['merge fields', 'versioning'],
        protected: [flow('vault', 'Vault storage', { keep: ['DocumentVault'] })],
        newFlows: [flow('template', 'Templates', { topics: ['template', 'merge'] })],
        hints: ['TemplateEngine', 'SignService'],
        budget: 3,
      }),
      ch({
        id: 'ds-s4',
        dayLabel: 'Day 300',
        title: 'Tamper-evident audit',
        category: 'reliability',
        narrative: 'Court challenge requires hash chain of each signature event.',
        pressures: ['non-repudiation', 'timestamp'],
        protected: [flow('finalize', 'Finalize works', { keep: ['SignService'] })],
        newFlows: [flow('audit-sign', 'Sign audit', { topics: ['certificate', 'audit'] })],
        hints: ['SignatureAudit', 'TimestampAuthority'],
        budget: 5,
      }),
    ],
  },

  {
    key: 'auction-bidding',
    title: 'Auction Bidding Evolution',
    tags: ['auction', 'marketplace', 'scale'],
    description:
      'Grow sealed bids into open ascending auctions, proxy bids, and anti-sniping extensions.',
    briefing: br(
      'BidderUI → AuctionEngine → BidLedger records highest bid at close.',
      'Live ascending bids, max proxy amounts, then last-second sniping rules.',
      'Auction fairness is correctness — evolve locking before flashy UX.',
    ),
    diagram: chainDiagram(
      'auction',
      [
        { name: 'BidderUI', methods: ['placeBid'], row: 0 },
        { name: 'AuctionEngine', methods: ['acceptBid'], row: 1 },
        { name: 'BidLedger', methods: ['record'], row: 2 },
      ],
      [
        { from: 'BidderUI', to: 'AuctionEngine' },
        { from: 'AuctionEngine', to: 'BidLedger' },
      ],
    ),
    holdStage: hold({
      id: 'au-h0',
      title: 'Sealed bid close',
      narrative:
        'Weekly sealed auctions, low concurrency. Product wants live countdown before traffic justifies websockets.',
      holdPressure: 'sealed format works — live auction premature',
      pressures: ['websocket cost', 'proxy complexity', 'sealed format works — live auction premature'],
      flows: [
        flow('bid', 'Bids recorded', {
          reach: [
            { from: 'BidderUI', to: 'AuctionEngine' },
            { from: 'AuctionEngine', to: 'BidLedger' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'au-s2',
        dayLabel: 'Day 75',
        title: 'Open ascending auction',
        category: 'product',
        narrative: 'Real-time current price visible. Bids must serialize per lot.',
        pressures: ['concurrency', 'visibility'],
        protected: [flow('ledger', 'Ledger append', { keep: ['BidLedger'] })],
        newFlows: [flow('live-bid', 'Live bidding', { topics: ['ascending', 'live'] })],
        hints: ['LotLock', 'AuctionEngine'],
        budget: 4,
      }),
      ch({
        id: 'au-s3',
        dayLabel: 'Day 165',
        title: 'Proxy max bids',
        category: 'product',
        narrative: 'Users set max; engine auto-increments against rivals.',
        pressures: ['proxy logic', 'tie breaks'],
        protected: [flow('accept', 'Accept bid', { keep: ['AuctionEngine'] })],
        newFlows: [flow('proxy', 'Proxy bids', { topics: ['proxy', 'max'] })],
        hints: ['ProxyBid', 'AuctionEngine'],
        budget: 4,
      }),
      ch({
        id: 'au-s4',
        dayLabel: 'Day 255',
        title: 'Anti-sniping extension',
        category: 'reliability',
        narrative: 'Bids in last 30s extend clock. Fairness without manual ops intervention.',
        pressures: ['clock sync', 'extension rules'],
        protected: [flow('ui', 'Bidder UI', { keep: ['BidderUI'] })],
        newFlows: [flow('snipe', 'Anti-snipe', { topics: ['extension', 'snipe'] })],
        hints: ['ClockPolicy', 'AuctionEngine'],
        budget: 3,
        metrics: { ordersPerDay: 8000, latencyMs: 50 },
      }),
    ],
  },

  {
    key: 'parking-reservation',
    title: 'Parking Reservation Evolution',
    tags: ['parking', 'booking', 'product'],
    description:
      'Evolve lot capacity counters into spot-level booking, dynamic pricing, and gate access codes.',
    briefing: br(
      'DriverApp → ParkingService → LotCounter decrements spaces per garage.',
      'Reserved spot numbers, peak pricing, then QR gate validation.',
      'Physical world coupling — evolve when garages demand spot-level truth.',
    ),
    diagram: hubDiagram(
      'park',
      'ParkingService',
      ['reserve', 'release'],
      [
        { name: 'LotCounter', methods: ['decrement'], slot: 'left' },
        { name: 'DriverApp', methods: ['book'], slot: 'right' },
      ],
    ),
    holdStage: hold({
      id: 'pk-h0',
      title: 'Garage-level capacity',
      narrative:
        'Airport garage only reports total free spaces. Spot sensors contract unsigned.',
      holdPressure: 'no spot sensors — counter enough',
      pressures: ['sensor integration', 'dynamic pricing', 'no spot sensors — counter enough'],
      flows: [
        flow('book', 'Reservation', {
          reach: [
            { from: 'DriverApp', to: 'ParkingService' },
            { from: 'ParkingService', to: 'LotCounter' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'pk-s2',
        dayLabel: 'Day 80',
        title: 'Spot-level holds',
        category: 'product',
        narrative: 'Garage maps show specific spots. Double-booking a spot is unacceptable.',
        pressures: ['spot lock', 'map UX'],
        protected: [flow('garage', 'Garage counter fallback', { keep: ['LotCounter'] })],
        newFlows: [flow('spot', 'Spot reservation', { topics: ['spot', 'hold'] })],
        hints: ['SpotLock', 'ParkingService'],
        budget: 4,
      }),
      ch({
        id: 'pk-s3',
        dayLabel: 'Day 170',
        title: 'Dynamic pricing',
        category: 'product',
        narrative: 'Airport peak vs off-peak rates without hard-coding in DriverApp.',
        pressures: ['pricing rules', 'transparency'],
        protected: [flow('reserve', 'Reserve works', { keep: ['ParkingService'] })],
        newFlows: [flow('price', 'Dynamic price', { topics: ['pricing', 'surge'] })],
        hints: ['PricingRule', 'ParkingService'],
        budget: 3,
      }),
      ch({
        id: 'pk-s4',
        dayLabel: 'Day 260',
        title: 'Gate access codes',
        category: 'reliability',
        narrative: 'QR rotates; gates validate offline briefly then sync.',
        pressures: ['offline gate', 'code rotation'],
        protected: [flow('driver', 'Driver books', { keep: ['DriverApp'] })],
        newFlows: [flow('gate', 'Gate validation', { topics: ['qr', 'gate'] })],
        hints: ['AccessToken', 'GateValidator', 'ParkingService'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'hotel-booking',
    title: 'Hotel Booking Evolution',
    tags: ['hotel', 'travel', 'product'],
    description:
      'Grow room-night booking into inventory by room type, overbooking policy, and channel manager sync.',
    briefing: br(
      'GuestPortal → BookingService → RoomInventory sells abstract room-night count.',
      'Room types and rates, controlled overbooking, then OTA channel sync.',
      'Travel inventory is concurrency-heavy — evolve before OTAs double-sell.',
    ),
    diagram: chainDiagram(
      'hotel',
      [
        { name: 'GuestPortal', methods: ['book'], row: 0 },
        { name: 'BookingService', methods: ['confirm'], row: 1 },
        { name: 'RoomInventory', methods: ['allocate'], row: 2 },
      ],
      [
        { from: 'GuestPortal', to: 'BookingService' },
        { from: 'BookingService', to: 'RoomInventory' },
      ],
    ),
    holdStage: hold({
      id: 'ho-h0',
      title: 'Single room pool',
      narrative:
        'Boutique hotel, 20 identical rooms. Channel manager integration quoted before any OTA contract.',
      holdPressure: 'no OTA contract — channel sync hold',
      pressures: ['OTA sync', 'overbooking risk', 'no OTA contract — channel sync hold'],
      flows: [
        flow('hotel-book', 'Booking confirms', {
          reach: [
            { from: 'GuestPortal', to: 'BookingService' },
            { from: 'BookingService', to: 'RoomInventory' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'ho-s2',
        dayLabel: 'Day 95',
        title: 'Room types and rates',
        category: 'product',
        narrative: 'Deluxe vs standard pricing. Inventory per type, not one pool.',
        pressures: ['rate plans', 'inventory split'],
        protected: [flow('portal', 'Guest books', { keep: ['GuestPortal'] })],
        newFlows: [flow('rtype', 'Room types', { topics: ['room-type', 'rate'] })],
        hints: ['RoomType', 'RatePlan', 'BookingService'],
        budget: 4,
      }),
      ch({
        id: 'ho-s3',
        dayLabel: 'Day 185',
        title: 'Overbooking policy',
        category: 'reliability',
        narrative: 'Airline-style controlled oversell with walk compensation rules.',
        pressures: ['oversell math', 'guest experience'],
        protected: [flow('inv', 'Inventory core', { keep: ['RoomInventory'] })],
        newFlows: [flow('over', 'Overbooking', { topics: ['overbook', 'walk'] })],
        hints: ['OverbookPolicy', 'BookingService'],
        budget: 4,
      }),
      ch({
        id: 'ho-s4',
        dayLabel: 'Day 275',
        title: 'Channel manager sync',
        category: 'scale',
        narrative: 'Booking.com and direct site share inventory. Sync must be bidirectional and idempotent.',
        pressures: ['double booking', 'sync lag'],
        protected: [flow('direct', 'Direct bookings', { keep: ['BookingService'] })],
        newFlows: [flow('channel', 'Channel sync', { topics: ['ota', 'channel'] })],
        hints: ['ChannelAdapter', 'InventorySync'],
        budget: 5,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'ho-inc',
        dayLabel: 'Day 290',
        title: 'Double-book incident',
        category: 'incident',
        narrative: 'OTA lag oversold New Year weekend. Need reconciliation without canceling paid guests.',
        pressures: ['reconciliation', 'guest comms'],
        protected: [flow('paid', 'Paid bookings honored', { topics: ['book'] })],
        hints: ['ReconciliationJob', 'RoomInventory', 'BookingService'],
        budget: 5,
      }),
    ],
  },

  {
    key: 'lms-enrollment',
    title: 'LMS Enrollment Evolution',
    tags: ['lms', 'education', 'product'],
    description:
      'Evolve course signup into cohorts, progress tracking, proctored exams, and certificate issuance.',
    briefing: br(
      'LearnerApp → EnrollmentService → CourseCatalog registers users on courses.',
      'Cohort schedules, lesson progress, then proctoring and certificates.',
      'Learning paths grow with accreditation requirements — hold proctoring until needed.',
    ),
    diagram: hubDiagram(
      'lms',
      'EnrollmentService',
      ['enroll', 'drop'],
      [
        { name: 'CourseCatalog', methods: ['list'], slot: 'left' },
        { name: 'LearnerApp', methods: ['browse'], slot: 'right' },
      ],
    ),
    holdStage: hold({
      id: 'lm-h0',
      title: 'Open enrollment',
      narrative:
        'Self-paced MOOC, no certificates. Accreditation body not engaged yet.',
      holdPressure: 'no accredited exams scheduled',
      pressures: ['proctor cost', 'cohort overhead', 'no accredited exams scheduled'],
      flows: [
        flow('enroll', 'Enrollment', {
          reach: [
            { from: 'LearnerApp', to: 'EnrollmentService' },
            { from: 'EnrollmentService', to: 'CourseCatalog' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'lm-s2',
        dayLabel: 'Day 85',
        title: 'Cohort schedules',
        category: 'product',
        narrative: 'Instructor-led runs start on fixed dates with seat caps.',
        pressures: ['seat cap', 'waitlist'],
        protected: [flow('self', 'Self enroll', { keep: ['EnrollmentService'] })],
        newFlows: [flow('cohort', 'Cohorts', { topics: ['cohort', 'schedule'] })],
        hints: ['Cohort', 'EnrollmentService'],
        budget: 3,
      }),
      ch({
        id: 'lm-s3',
        dayLabel: 'Day 175',
        title: 'Progress tracking',
        category: 'product',
        narrative: 'Resume video at last position; completion gates next module.',
        pressures: ['progress store', 'idempotent events'],
        protected: [flow('catalog', 'Catalog browse', { keep: ['CourseCatalog'] })],
        newFlows: [flow('progress', 'Lesson progress', { topics: ['progress', 'completion'] })],
        hints: ['ProgressTracker', 'EnrollmentService'],
        budget: 4,
      }),
      ch({
        id: 'lm-s4',
        dayLabel: 'Day 265',
        title: 'Certificates',
        category: 'product',
        narrative: 'Verified PDF credentials with public verification URL.',
        pressures: ['verification', 'revocation'],
        protected: [flow('learn', 'Learning continues', { keep: ['LearnerApp'] })],
        newFlows: [flow('cert', 'Certificates', { topics: ['certificate', 'verify'] })],
        hints: ['CertificateIssuer', 'EnrollmentService'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'social-feed-ranking',
    title: 'Social Feed Evolution',
    tags: ['social-feed', 'ranking', 'scale'],
    description:
      'Grow chronological posts into follow graph, ranked feed, and abuse-safe fan-out.',
    briefing: br(
      'FeedAPI → TimelineService → PostStore returns global chronological posts.',
      'Follow graph, engagement ranking, then celebrity fan-out on write.',
      'Ranking is a product bet — hold until follow graph exists.',
    ),
    diagram: chainDiagram(
      'social',
      [
        { name: 'FeedAPI', methods: ['loadFeed'], row: 0 },
        { name: 'TimelineService', methods: ['fetch'], row: 1 },
        { name: 'PostStore', methods: ['queryRecent'], row: 2 },
      ],
      [
        { from: 'FeedAPI', to: 'TimelineService' },
        { from: 'TimelineService', to: 'PostStore' },
      ],
    ),
    holdStage: hold({
      id: 'so-h0',
      title: 'Global chronological',
      narrative:
        'Campus beta, 2k users. ML ranking proposed before follow feature ships.',
      holdPressure: 'no follow graph — ranking premature',
      pressures: ['ML ranking early', 'fan-out cost', 'no follow graph — ranking premature'],
      flows: [
        flow('feed', 'Feed loads', {
          reach: [
            { from: 'FeedAPI', to: 'TimelineService' },
            { from: 'TimelineService', to: 'PostStore' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'so-s2',
        dayLabel: 'Day 70',
        title: 'Follow graph',
        category: 'product',
        narrative: 'Home feed shows followed authors only.',
        pressures: ['graph storage', 'fan-out read'],
        protected: [flow('api', 'Feed API', { keep: ['FeedAPI'] })],
        newFlows: [flow('follow', 'Follow graph', { topics: ['follow', 'graph'] })],
        hints: ['FollowGraph', 'TimelineService'],
        budget: 4,
      }),
      ch({
        id: 'so-s3',
        dayLabel: 'Day 160',
        title: 'Ranked feed',
        category: 'product',
        narrative: 'Blend recency and engagement without fully opaque black box.',
        pressures: ['ranking explainability', 'filter bubble'],
        protected: [flow('posts', 'Posts readable', { keep: ['PostStore'] })],
        newFlows: [flow('rank', 'Ranked feed', { topics: ['rank', 'score'] })],
        hints: ['Ranker', 'TimelineService'],
        budget: 4,
      }),
      ch({
        id: 'so-s4',
        dayLabel: 'Day 250',
        title: 'Celebrity fan-out',
        category: 'scale',
        narrative: 'Influencer post must not fan-in 10M reads on publish.',
        pressures: ['write fan-out', 'hybrid model'],
        protected: [flow('timeline', 'Timeline service', { keep: ['TimelineService'] })],
        newFlows: [flow('celeb', 'Fan-out on write', { topics: ['fanout', 'celebrity'] })],
        hints: ['FanoutWorker', 'FeedCache'],
        budget: 5,
        metrics: { users: 5000000 },
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'so-team',
        dayLabel: 'Day 265',
        title: 'Trust & safety split',
        category: 'team',
        narrative: 'Ranking team wants hooks for demotion; platform owns TimelineService spaghetti.',
        pressures: ['moderation hooks', 'ownership'],
        protected: [flow('ranked', 'Ranked feed live', { topics: ['rank'] })],
        hints: ['ModerationHook', 'TimelineService'],
        budget: 3,
      }),
    ],
  },

  {
    key: 'cdn-origin-shield',
    title: 'CDN & Origin Shield Evolution',
    tags: ['cdn', 'edge', 'scale'],
    description:
      'Evolve direct origin fetches into CDN caching, origin shield, and stale-while-revalidate.',
    briefing: br(
      'Browser → OriginServer → AssetStore serves static files from single region.',
      'CDN cache headers, shield layer in front of origin, then SWR for thundering herd.',
      'CDN when origin pain is measured — not on first static file.',
    ),
    diagram: hubDiagram(
      'cdn',
      'OriginServer',
      ['serveAsset'],
      [{ name: 'AssetStore', methods: ['read'], slot: 'left' }],
      { name: 'Browser', methods: ['request'] },
    ),
    holdStage: hold({
      id: 'cd-h0',
      title: 'Direct origin OK',
      narrative:
        'Low traffic marketing site. CDN contract ready but no latency complaints yet.',
      holdPressure: 'origin handles load — CDN optional',
      pressures: ['CDN cost', 'cache invalidation', 'origin handles load — CDN optional'],
      flows: [
        flow('asset', 'Assets served', {
          reach: [
            { from: 'Browser', to: 'OriginServer' },
            { from: 'OriginServer', to: 'AssetStore' },
          ],
        }),
      ],
      metrics: { latencyMs: 180 },
    }),
    changeStages: [
      ch({
        id: 'cd-s2',
        dayLabel: 'Day 80',
        title: 'CDN edge cache',
        category: 'scale',
        narrative: 'Global launch needs Cache-Control and edge POPs.',
        pressures: ['cache headers', 'TLS at edge'],
        protected: [flow('origin', 'Origin serves', { keep: ['OriginServer'] })],
        newFlows: [flow('edge', 'CDN edge', { topics: ['cdn', 'cache'] })],
        hints: ['CdnEdge', 'OriginServer'],
        budget: 3,
      }),
      ch({
        id: 'cd-s3',
        dayLabel: 'Day 170',
        title: 'Origin shield',
        category: 'scale',
        narrative: 'Many POPs miss cache simultaneously — shield collapses origin hits.',
        pressures: ['shield tier', 'cache hierarchy'],
        protected: [flow('store', 'Asset store', { keep: ['AssetStore'] })],
        newFlows: [flow('shield', 'Origin shield', { topics: ['shield', 'tier'] })],
        hints: ['OriginShield', 'CdnEdge'],
        budget: 4,
      }),
      ch({
        id: 'cd-s4',
        dayLabel: 'Day 260',
        title: 'Stale-while-revalidate',
        category: 'reliability',
        narrative: 'Hero asset redeploy should not stampede origin while refreshing cache.',
        pressures: ['SWR', 'revalidate'],
        protected: [flow('browser', 'Users get assets', { keep: ['Browser'] })],
        newFlows: [flow('swr', 'SWR policy', { topics: ['stale', 'revalidate'] })],
        hints: ['CachePolicy', 'OriginServer'],
        budget: 3,
        metrics: { latencyMs: 45 },
      }),
    ],
  },

  {
    key: 'fraud-scoring',
    title: 'Fraud Scoring Evolution',
    tags: ['fraud', 'risk', 'reliability'],
    description:
      'Grow manual review flags into rules engine, ML scores, and shadow-mode model rollout.',
    briefing: br(
      'Checkout → OrderValidator → RiskRules runs static threshold checks.',
      'Composable rules, ML risk score, then shadow deploy before blocking live orders.',
      'False declines hurt revenue — evolve review pipeline before auto-decline ML.',
    ),
    diagram: chainDiagram(
      'fraud',
      [
        { name: 'Checkout', methods: ['submit'], row: 0 },
        { name: 'OrderValidator', methods: ['validate'], row: 1 },
        { name: 'RiskRules', methods: ['evaluate'], row: 2 },
      ],
      [
        { from: 'Checkout', to: 'OrderValidator' },
        { from: 'OrderValidator', to: 'RiskRules' },
      ],
    ),
    holdStage: hold({
      id: 'fr-h0',
      title: 'Static rules enough',
      narrative:
        'Low fraud rate, manual review queue empty. Data science wants GPU cluster before labeled fraud dataset exists.',
      holdPressure: 'insufficient fraud labels for ML',
      pressures: ['ML hype', 'rule maintenance', 'insufficient fraud labels for ML'],
      flows: [
        flow('validate', 'Validation path', {
          reach: [
            { from: 'Checkout', to: 'OrderValidator' },
            { from: 'OrderValidator', to: 'RiskRules' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'fr-s2',
        dayLabel: 'Day 90',
        title: 'Composable rules engine',
        category: 'product',
        narrative: 'Ops toggles rules without deploy. Rules compose with priority.',
        pressures: ['rule priority', 'ops self-serve'],
        protected: [flow('checkout', 'Checkout submits', { keep: ['Checkout'] })],
        newFlows: [flow('rules', 'Rule engine', { topics: ['rule', 'engine'] })],
        hints: ['RuleEngine', 'OrderValidator'],
        budget: 3,
      }),
      ch({
        id: 'fr-s3',
        dayLabel: 'Day 180',
        title: 'ML risk score',
        category: 'product',
        narrative: 'Model outputs score alongside rules. Start advisory only.',
        pressures: ['model drift', 'explainability'],
        protected: [flow('rules-path', 'Rules still run', { keep: ['RiskRules'] })],
        newFlows: [flow('ml', 'ML score', { topics: ['model', 'score'] })],
        hints: ['RiskModel', 'FeatureStore', 'OrderValidator'],
        budget: 4,
      }),
      ch({
        id: 'fr-s4',
        dayLabel: 'Day 270',
        title: 'Shadow-mode rollout',
        category: 'reliability',
        narrative: 'New model blocks in shadow; compare before enforcing declines.',
        pressures: ['false positive', 'shadow metrics'],
        protected: [flow('live', 'Live checkout', { keep: ['Checkout'] })],
        newFlows: [flow('shadow', 'Shadow deploy', { topics: ['shadow', 'rollout'] })],
        hints: ['ShadowEvaluator', 'OrderValidator'],
        budget: 4,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'fr-inc',
        dayLabel: 'Day 285',
        title: 'False decline incident',
        category: 'incident',
        narrative: 'Bad rule blocked 8% of good orders during sale. Need kill switch and replay.',
        pressures: ['kill switch', 'replay'],
        protected: [flow('good-orders', 'Orders complete', { topics: ['checkout'] })],
        hints: ['KillSwitch', 'RuleEngine', 'OrderValidator'],
        budget: 4,
      }),
    ],
  },

  {
    key: 'rate-limit-enforcement',
    title: 'Rate Limiting Evolution',
    tags: ['rate-limiting', 'api', 'scale'],
    description:
      'Evolve global counter into per-tenant limits, sliding windows, and distributed quota sync.',
    briefing: br(
      'ApiHandler → RateLimiter → CounterStore increments one global bucket.',
      'Per-API key limits, sliding window accuracy, then multi-region quota consistency.',
      'Rate limits protect neighbors — add when abuse or noisy tenant appears, not preemptively everywhere.',
    ),
    diagram: hubDiagram(
      'rl',
      'RateLimiter',
      ['check', 'increment'],
      [{ name: 'CounterStore', methods: ['incr'], slot: 'left' }],
      { name: 'ApiHandler', methods: ['handle'] },
    ),
    holdStage: hold({
      id: 'rl-h0',
      title: 'No limits yet',
      narrative:
        'Trusted B2B partners only. SRE proposes Redis cluster limits before first abusive client.',
      holdPressure: 'no abuse observed — global limit YAGNI',
      pressures: ['distributed Redis early', 'UX throttling', 'no abuse observed — global limit YAGNI'],
      flows: [
        flow('api', 'API handled', {
          reach: [
            { from: 'ApiHandler', to: 'RateLimiter' },
            { from: 'RateLimiter', to: 'CounterStore' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'rl-s2',
        dayLabel: 'Day 75',
        title: 'Per-tenant quotas',
        category: 'scale',
        narrative: 'One partner spikes traffic. Limits must be per API key.',
        pressures: ['tenant isolation', 'burst vs sustained'],
        protected: [flow('handle', 'Handler runs', { keep: ['ApiHandler'] })],
        newFlows: [flow('quota', 'Per-tenant limit', { topics: ['quota', 'tenant'] })],
        hints: ['QuotaPolicy', 'RateLimiter'],
        budget: 3,
      }),
      ch({
        id: 'rl-s3',
        dayLabel: 'Day 165',
        title: 'Sliding window',
        category: 'reliability',
        narrative: 'Fixed window allows 2× burst at boundary. Sliding window smooths abuse.',
        pressures: ['window algorithm', 'memory cost'],
        protected: [flow('limit', 'Limit enforced', { keep: ['RateLimiter'] })],
        newFlows: [flow('slide', 'Sliding window', { topics: ['sliding', 'window'] })],
        hints: ['SlidingWindow', 'CounterStore'],
        budget: 4,
      }),
      ch({
        id: 'rl-s4',
        dayLabel: 'Day 255',
        title: 'Distributed sync',
        category: 'scale',
        narrative: 'Multi-region APIs need consistent counts without central bottleneck.',
        pressures: ['eventual consistency', 'race'],
        protected: [flow('check', 'Check path', { keep: ['ApiHandler'] })],
        newFlows: [flow('dist', 'Distributed quota', { topics: ['sync', 'region'] })],
        hints: ['QuotaSync', 'RateLimiter'],
        budget: 5,
        metrics: { ordersPerDay: 10000000, latencyMs: 15 },
      }),
    ],
  },

  {
    key: 'config-and-feature-flags',
    title: 'Config & Feature Flags Evolution',
    tags: ['config-service', 'feature-flags', 'platform'],
    description:
      'Grow env vars into dynamic config service, typed flags, and safe percentage rollouts.',
    briefing: br(
      'AppBootstrap → ConfigLoader → EnvFile reads settings at startup only.',
      'Central config with polling, feature flags with targeting, then gradual percentage rollouts.',
      'Dynamic config when deploy cadence hurts experiments — not before first production deploy.',
    ),
    dimensions: ['platform', 'reliability'],
    diagram: chainDiagram(
      'cfg',
      [
        { name: 'AppBootstrap', methods: ['start'], row: 0 },
        { name: 'ConfigLoader', methods: ['load'], row: 1 },
        { name: 'EnvFile', methods: ['read'], row: 2 },
      ],
      [
        { from: 'AppBootstrap', to: 'ConfigLoader' },
        { from: 'ConfigLoader', to: 'EnvFile' },
      ],
    ),
    holdStage: hold({
      id: 'cf-h0',
      title: 'Env file at boot',
      narrative:
        'Weekly deploys, few toggles. Platform wants LaunchDarkly before product runs one A/B test.',
      holdPressure: 'no experiments planned — flags YAGNI',
      pressures: ['flag SaaS cost', 'config service ops', 'no experiments planned — flags YAGNI'],
      flows: [
        flow('boot', 'App boots with config', {
          reach: [
            { from: 'AppBootstrap', to: 'ConfigLoader' },
            { from: 'ConfigLoader', to: 'EnvFile' },
          ],
        }),
      ],
    }),
    changeStages: [
      ch({
        id: 'cf-s2',
        dayLabel: 'Day 85',
        title: 'Dynamic config service',
        category: 'product',
        narrative: 'Change timeouts without redeploy. Poll or push updates safely.',
        pressures: ['hot reload', 'consistency'],
        protected: [flow('start', 'App starts', { keep: ['AppBootstrap'] })],
        newFlows: [flow('dynamic', 'Dynamic config', { topics: ['config', 'poll'] })],
        hints: ['ConfigService', 'ConfigLoader'],
        budget: 3,
      }),
      ch({
        id: 'cf-s3',
        dayLabel: 'Day 175',
        title: 'Feature flags with targeting',
        category: 'product',
        narrative: 'Enable beta for tenant list. Flag evaluation must be fast on request path.',
        pressures: ['targeting rules', 'eval latency'],
        protected: [flow('load', 'Config loads', { keep: ['ConfigLoader'] })],
        newFlows: [flow('flag', 'Feature flags', { topics: ['flag', 'target'] })],
        hints: ['FlagEvaluator', 'TargetingRule'],
        budget: 4,
      }),
      ch({
        id: 'cf-s4',
        dayLabel: 'Day 265',
        title: 'Percentage rollouts',
        category: 'reliability',
        narrative: 'Gradual rollout with automatic rollback hook when error rate spikes.',
        pressures: ['canary flag', 'rollback'],
        protected: [flow('bootstrap', 'Bootstrap path', { keep: ['AppBootstrap'] })],
        newFlows: [flow('rollout', 'Pct rollout', { topics: ['percentage', 'rollout'] })],
        hints: ['RolloutController', 'FlagEvaluator'],
        budget: 4,
      }),
    ],
    hardExtraStages: [
      extra({
        id: 'cf-leg',
        dayLabel: 'Day 280',
        title: 'Legacy env override',
        category: 'legacy',
        narrative: 'Some services still read EnvFile directly. Unified evaluation without big bang migration.',
        pressures: ['strangler', 'precedence rules'],
        protected: [flow('eval', 'Flags evaluate', { topics: ['flag'] })],
        hints: ['ConfigBridge', 'ConfigLoader', 'EnvFile'],
        budget: 3,
      }),
    ],
  },
]
