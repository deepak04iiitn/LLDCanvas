/**
 * Rich payloads for legacy Architecture Evolution slugs that existed before
 * seed-studio-evolution.ts. Imported by the main seed script.
 */

type MethodSpec = string

function method(m: MethodSpec) {
  return {
    name: m,
    returnType: 'void',
    params: [] as { name: string; type: string }[],
    visibility: 'public' as const,
    isStatic: false,
    isAbstract: false,
  }
}

function node(
  id: string,
  elementId: string,
  name: string,
  x: number,
  y: number,
  methods: MethodSpec[] = [],
) {
  return {
    id,
    position: { x, y },
    data: {
      elementId,
      nodeType: 'class',
      name,
      attributes: [],
      methods: methods.map(method),
    },
  }
}

function edge(
  id: string,
  elementId: string,
  source: string,
  target: string,
  relationshipType: 'dependency' | 'association' | 'inheritance' | 'composition' = 'dependency',
) {
  return {
    id,
    source,
    target,
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: relationshipType,
    data: { elementId, relationshipType, lineStyle: 'step' as const },
  }
}

const meta = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

const flow = (
  id: string,
  label: string,
  opts: {
    keep?: string[]
    reach?: { from: string; to: string }[]
    topics?: string[]
    notReach?: { from: string; to: string }[]
  } = {},
) => ({
  id,
  label,
  mustKeepElementNames: opts.keep,
  mustReach: opts.reach,
  mustHavePathTopics: opts.topics,
  mustNotReach: opts.notReach,
})

export const LEGACY_EVOLUTION_PACKS = [
  {
    type: 'evolution' as const,
    slug: 'checkout-to-marketplace',
    title: 'Checkout → Marketplace',
    difficulty: 'hard' as const,
    description:
      'Evolve a simple Order→Payment checkout into multi-provider payments, then marketplace sellers with split payouts — without turning Order into a god object.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 10,
    tags: ['evolution', 'marketplace', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 40, 40, ['checkout']),
        node('n2', 'el-payment', 'Payment', 320, 40, ['charge']),
        node('n3', 'el-razorpay', 'Razorpay', 320, 200, ['createPayment']),
        node('n4', 'el-db', 'Database', 40, 200, ['save']),
      ],
      edges: [
        edge('e1', 'ed-1', 'n1', 'n2'),
        edge('e2', 'ed-2', 'n2', 'n3'),
        edge('e3', 'ed-3', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'You own a working single-merchant checkout: Order → Payment → Razorpay, with Order also writing to Database.\n\n' +
        'The journey\n' +
        'First the business stays simple. Then finance wants more payment providers. Then the product becomes a marketplace with sellers and split payouts.\n\n' +
        'The rule\n' +
        'Evolve the existing design. Keep checkout working. Do not dump everything into Order. Sometimes holding is correct.',
      dimensions: ['business', 'product'],
      stages: [
        {
          id: 'cm-baseline',
          dayLabel: 'Day 0',
          title: 'Baseline checkout',
          category: 'product',
          narrative:
            'Launch day. One merchant, one payment provider (Razorpay). Orders place and persist. Latency is fine.\n\nLeadership asks if you should “prepare for marketplace scale.” There are no sellers yet and no second PSP.',
          metrics: { users: 2000, ordersPerDay: 150 },
          pressureOptions: [
            'provider coupling',
            'marketplace readiness',
            'none yet — single-merchant MVP is enough',
          ],
          expectedPressures: ['none yet — single-merchant MVP is enough'],
          mustChange: false,
          doNothingHint:
            'No second provider and no sellers yet. Holding avoids overengineering a marketplace spine on Day 0.',
          protectedFlows: [
            flow('checkout', 'Checkout works', {
              keep: ['Order', 'Payment'],
              reach: [
                { from: 'Order', to: 'Payment' },
                { from: 'Order', to: 'Database' },
              ],
            }),
          ],
          complexityBudget: 1,
        },
        {
          id: 'cm-multi',
          dayLabel: 'Day 120',
          title: 'Multi-provider payments',
          category: 'product',
          narrative:
            'Finance signed Stripe beside Razorpay. Checkout must support both. Editing Order for every new provider will not scale.',
          metrics: { ordersPerDay: 8000 },
          pressureOptions: ['provider coupling', 'extensibility', 'domain→infra'],
          expectedPressures: ['provider coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('checkout', 'Order still checks out', {
              keep: ['Order'],
              reach: [{ from: 'Order', to: 'Payment' }],
            }),
          ],
          newFlows: [
            flow('multi', 'Multi-provider', { topics: ['stripe', 'gateway', 'razorpay'] }),
          ],
          expectedTouchHints: ['Payment', 'PaymentGateway', 'Stripe', 'Razorpay'],
          forbidModifyElementNames: ['Order'],
          complexityBudget: 3,
          introduceCatalog: [
            {
              namePattern: 'Gateway|Provider',
              benefits: ['Add providers without rewriting Order', 'Clear payment boundary'],
              costs: ['Extra abstraction', 'More wiring'],
            },
          ],
          debtOpportunity: {
            id: 'debt-order-god',
            prompt:
              'Order still owns persistence and checkout orchestration. Extract a thinner app service now, or defer until marketplace?',
            costIfDeferred:
              'Seller + payout work will pile more methods onto Order and make marketplace extraction painful.',
            laterStageId: 'cm-sellers',
          },
        },
        {
          id: 'cm-sellers',
          dayLabel: 'Day 240',
          title: 'Marketplace sellers',
          category: 'product',
          narrative:
            'The product is now a marketplace. Multiple sellers fulfill line items. Payouts must split. Order must not become a god object that knows every seller rule.',
          metrics: { users: 200000, ordersPerDay: 50000 },
          pressureOptions: ['ownership', 'marketplace complexity', 'payout coupling'],
          expectedPressures: ['ownership', 'marketplace complexity'],
          mustChange: true,
          protectedFlows: [
            flow('checkout', 'Checkout still works', { keep: ['Order'], topics: ['checkout'] }),
          ],
          newFlows: [
            flow('seller', 'Sellers + payouts', { topics: ['seller', 'payout', 'marketplace'] }),
          ],
          expectedTouchHints: ['Order', 'Seller', 'PayoutService', 'MarketplaceOrder'],
          complexityBudget: 5,
          approachHints: ['Seller aggregate', 'Payout service', 'Order line items'],
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'ride-to-platform',
    title: 'Ride → Platform',
    difficulty: 'hard' as const,
    description:
      'Grow ride pricing from concrete strategies into promotions and corporate billing — without rewriting Ride for every new rule.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 11,
    tags: ['evolution', 'rides', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-ride', 'Ride', 40, 80, ['price', 'start']),
        node('n2', 'el-economy', 'EconomyPricing', 320, 0, ['quote']),
        node('n3', 'el-premium', 'PremiumPricing', 320, 140, ['quote']),
        node('n4', 'el-surge', 'SurgePricing', 320, 280, ['quote']),
      ],
      edges: [
        edge('e1', 'ed-r-econ', 'n1', 'n2'),
        edge('e2', 'ed-r-prem', 'n1', 'n3'),
        edge('e3', 'ed-r-surge', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Ride currently depends on EconomyPricing, PremiumPricing, and SurgePricing as concrete classes.\n\n' +
        'The journey\n' +
        'First clarify the pricing strategy boundary. Then stack promotions. Then support corporate billing profiles.\n\n' +
        'The rule\n' +
        'New pricing/promo/billing rules should plug in without editing Ride every time.',
      dimensions: ['business', 'product'],
      stages: [
        {
          id: 'rp-observe',
          dayLabel: 'Day 0',
          title: 'Pricing already works',
          category: 'product',
          narrative:
            'Rides price correctly today with three concrete strategies. Product has not asked for promotions or corporate accounts yet.\n\nIs a redesign mandatory today, or can you hold until the next real requirement?',
          pressureOptions: [
            'tight coupling to pricing concretes',
            'none yet — wait for a real product ask',
          ],
          expectedPressures: ['none yet — wait for a real product ask'],
          mustChange: false,
          doNothingHint:
            'Holding is valid if you accept the known coupling until promotions arrive — but note the smell.',
          protectedFlows: [
            flow('price', 'Ride can price', { keep: ['Ride'], topics: ['price'] }),
          ],
          complexityBudget: 1,
        },
        {
          id: 'rp-strategy',
          dayLabel: 'Day 90',
          title: 'Strategy pricing boundary',
          category: 'product',
          narrative:
            'Product wants a fourth fare type next sprint. Ride’s fan-out to concrete pricing classes is now a clear pressure. Put pricing behind a shared strategy/port.',
          pressureOptions: ['extensibility', 'coupling', 'variation'],
          expectedPressures: ['extensibility', 'coupling'],
          mustChange: true,
          protectedFlows: [flow('price', 'Pricing still works', { keep: ['Ride'], topics: ['price'] })],
          newFlows: [flow('strat', 'Strategy port', { topics: ['pricing', 'strategy', 'fare'] })],
          expectedTouchHints: ['Ride', 'PricingStrategy', 'EconomyPricing'],
          complexityBudget: 3,
        },
        {
          id: 'rp-promo',
          dayLabel: 'Day 180',
          title: 'Stackable promotions',
          category: 'product',
          narrative:
            'Marketing wants stackable promo rules (percent off, flat off, partner codes) without editing Ride for each campaign.',
          pressureOptions: ['policy change rate', 'extensibility', 'ownership'],
          expectedPressures: ['policy change rate', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('price', 'Base price', { topics: ['price'] })],
          newFlows: [flow('promo', 'Promos', { topics: ['promo', 'discount', 'coupon'] })],
          expectedTouchHints: ['PromotionEngine', 'Ride', 'PricingStrategy'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-billing-in-ride',
            prompt: 'Billing profile logic is starting to leak into Ride. Extract now or defer until corporate accounts?',
            costIfDeferred: 'Corporate billing will force a Ride rewrite under time pressure.',
            laterStageId: 'rp-corp',
          },
        },
        {
          id: 'rp-corp',
          dayLabel: 'Day 300',
          title: 'Corporate accounts',
          category: 'product',
          narrative:
            'Enterprise customers need different billing profiles (invoice vs card, cost centers). Ride should not own every billing variant.',
          pressureOptions: ['ownership', 'billing complexity', 'extensibility'],
          expectedPressures: ['ownership', 'billing complexity'],
          mustChange: true,
          protectedFlows: [flow('ride', 'Ride starts', { keep: ['Ride'], topics: ['start', 'price'] })],
          newFlows: [flow('corp', 'Corporate billing', { topics: ['corporate', 'billing', 'account'] })],
          expectedTouchHints: ['BillingProfile', 'CorporateAccount', 'Ride'],
          complexityBudget: 4,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'notifier-to-orchestrator',
    title: 'Notifier → Campaign Engine',
    difficulty: 'medium' as const,
    description:
      'Evolve Email/SMS notifier into channel ports, user preferences, and campaign orchestration.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 12,
    tags: ['evolution', 'notify', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-notifier', 'Notifier', 40, 80, ['send']),
        node('n2', 'el-email', 'EmailService', 320, 20, ['sendEmail']),
        node('n3', 'el-sms', 'SmsService', 320, 180, ['sendSms']),
      ],
      edges: [
        edge('e1', 'ed-email', 'n1', 'n2'),
        edge('e2', 'ed-sms', 'n1', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Notifier talks straight to EmailService and SmsService.\n\n' +
        'The journey\n' +
        'Add a channel port, then respect preferences, then run batch campaigns without coupling campaigns to concrete channels.\n\n' +
        'The rule\n' +
        'Channels are interchangeable delivery mechanisms. Campaigns orchestrate; they should not hard-wire SMTP.',
      dimensions: ['business', 'product'],
      stages: [
        {
          id: 'no-channels',
          dayLabel: 'Day 30',
          title: 'Channel port',
          category: 'product',
          narrative:
            'Push notifications are coming next week. Notifier’s concrete Email/SMS deps will force another edit. Introduce a channel abstraction while keeping email and SMS working.',
          pressureOptions: ['variation', 'extensibility', 'coupling'],
          expectedPressures: ['variation', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('email', 'Email path', {
              keep: ['EmailService'],
              reach: [{ from: 'Notifier', to: 'EmailService' }],
            }),
          ],
          newFlows: [flow('channel', 'Channel port', { topics: ['channel', 'push', 'notif'] })],
          expectedTouchHints: ['Notifier', 'NotificationChannel', 'PushService'],
          complexityBudget: 3,
        },
        {
          id: 'no-prefs',
          dayLabel: 'Day 120',
          title: 'User preferences',
          category: 'product',
          narrative:
            'Users can opt out of SMS or email. Sending against preferences is a compliance issue. Preferences must gate delivery.',
          pressureOptions: ['compliance', 'ownership', 'cross-cutting concern'],
          expectedPressures: ['compliance', 'ownership'],
          mustChange: true,
          protectedFlows: [flow('send', 'Notify still possible', { keep: ['Notifier'], topics: ['send'] })],
          newFlows: [flow('prefs', 'Preferences', { topics: ['preference', 'opt', 'consent'] })],
          expectedTouchHints: ['Notifier', 'PreferenceService', 'UserPreferences'],
          complexityBudget: 3,
        },
        {
          id: 'no-campaigns',
          dayLabel: 'Day 220',
          title: 'Batch campaigns',
          category: 'product',
          narrative:
            'Marketing wants batch campaigns (10k recipients). Campaign orchestration must not be copy-pasted into each channel adapter.',
          pressureOptions: ['orchestration', 'throughput', 'ownership'],
          expectedPressures: ['orchestration', 'ownership'],
          mustChange: true,
          protectedFlows: [flow('channel', 'Channels still work', { topics: ['email', 'sms', 'channel'] })],
          newFlows: [flow('camp', 'Campaigns', { topics: ['campaign', 'batch', 'orchestr'] })],
          expectedTouchHints: ['CampaignService', 'Notifier', 'NotificationChannel'],
          complexityBudget: 4,
          introduceCatalog: [
            {
              namePattern: 'Campaign|Orchestr',
              benefits: ['Batch sends without channel edits', 'Clear campaign ownership'],
              costs: ['More moving parts', 'Need rate limiting / retries'],
            },
          ],
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'cart-to-checkout-os',
    title: 'Cart → Checkout OS',
    difficulty: 'hard' as const,
    description:
      'Turn a Cart glued to InventoryDb and StripeApi into a checkout platform with ports, coupons, and multi-warehouse fulfillment.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 13,
    tags: ['evolution', 'commerce', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-cart', 'Cart', 40, 40, ['add', 'checkout']),
        node('n2', 'el-item', 'CartItem', 320, 40, ['quantity']),
        node('n3', 'el-inv', 'InventoryDb', 320, 180, ['reserve']),
        node('n4', 'el-stripe', 'StripeApi', 40, 220, ['charge']),
      ],
      edges: [
        edge('e1', 'ed-cart-item', 'n1', 'n2', 'composition'),
        edge('e2', 'ed-cart-inv', 'n1', 'n3'),
        edge('e3', 'ed-cart-stripe', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Cart owns items and talks directly to InventoryDb and StripeApi.\n\n' +
        'The journey\n' +
        'Introduce ports for payment/inventory, then a pluggable discount engine, then multi-warehouse routing — without Cart knowing every warehouse.\n\n' +
        'The rule\n' +
        'Checkout becomes a platform: Cart orchestrates, adapters implement.',
      dimensions: ['business', 'product'],
      stages: [
        {
          id: 'co-ports',
          dayLabel: 'Day 60',
          title: 'Payment + inventory ports',
          category: 'product',
          narrative:
            'You will swap Stripe and add a second warehouse DB soon. Cart’s concrete InventoryDb and StripeApi deps are the pressure.',
          pressureOptions: ['infra coupling', 'extensibility', 'testability'],
          expectedPressures: ['infra coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('checkout', 'Checkout still works', {
              keep: ['Cart', 'CartItem'],
              topics: ['checkout'],
            }),
          ],
          newFlows: [
            flow('ports', 'Ports', { topics: ['payment', 'inventory', 'gateway', 'port'] }),
          ],
          expectedTouchHints: ['Cart', 'PaymentPort', 'InventoryPort', 'StripeApi'],
          complexityBudget: 4,
        },
        {
          id: 'co-coupons',
          dayLabel: 'Day 150',
          title: 'Pluggable coupons',
          category: 'product',
          narrative:
            'Marketing ships a new coupon type every week. Discount logic must be pluggable — not if/else inside Cart.checkout.',
          pressureOptions: ['policy change rate', 'ownership', 'extensibility'],
          expectedPressures: ['policy change rate', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('checkout', 'Checkout', { keep: ['Cart'], topics: ['checkout'] })],
          newFlows: [flow('coupon', 'Coupons', { topics: ['coupon', 'discount', 'promo'] })],
          expectedTouchHints: ['DiscountEngine', 'Cart', 'Coupon'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-fulfill-in-cart',
            prompt: 'Fulfillment still implied inside Cart. Extract routing now or defer until multi-warehouse?',
            costIfDeferred: 'Multi-warehouse will force Cart edits under launch pressure.',
            laterStageId: 'co-wh',
          },
        },
        {
          id: 'co-wh',
          dayLabel: 'Day 260',
          title: 'Multi-warehouse fulfillment',
          category: 'scale',
          narrative:
            'Three warehouses go live. Routing must choose stock location without Cart growing a method per warehouse.',
          pressureOptions: ['scalability', 'ownership', 'routing complexity'],
          expectedPressures: ['ownership', 'routing complexity'],
          mustChange: true,
          protectedFlows: [flow('checkout', 'Checkout', { topics: ['checkout', 'inventory'] })],
          newFlows: [
            flow('wh', 'Warehouse routing', { topics: ['warehouse', 'fulfill', 'routing'] }),
          ],
          expectedTouchHints: ['FulfillmentService', 'Cart', 'Warehouse'],
          complexityBudget: 4,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'parking-to-smart-city',
    title: 'Parking → Smart City',
    difficulty: 'medium' as const,
    description:
      'Evolve a single lot into polymorphic fees, reservations, and a multi-lot smart-city network.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 14,
    tags: ['evolution', 'parking', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-lot', 'ParkingLot', 40, 40, ['park', 'unpark', 'fee']),
        node('n2', 'el-car', 'Car', 320, 0, ['enter']),
        node('n3', 'el-bike', 'Bike', 320, 140, ['enter']),
        node('n4', 'el-spot', 'Spot', 40, 220, ['occupy']),
      ],
      edges: [
        edge('e1', 'ed-lot-car', 'n1', 'n2'),
        edge('e2', 'ed-lot-bike', 'n1', 'n3'),
        edge('e3', 'ed-lot-spot', 'n1', 'n4', 'composition'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'ParkingLot parks cars/bikes, owns spots, and calculates fees.\n\n' +
        'The journey\n' +
        'Polymorphic fee policy → reservations → multi-lot network under one account.\n\n' +
        'The rule\n' +
        'Grow capabilities without ParkingLot knowing every vehicle or every city lot forever.',
      dimensions: ['business', 'geo'],
      stages: [
        {
          id: 'ps-fee',
          dayLabel: 'Day 45',
          title: 'Polymorphic fees',
          category: 'product',
          narrative:
            'Trucks and EVs are coming. fee() logic keyed off Car/Bike concretes will explode. Move fee policy behind a vehicle/fee abstraction.',
          pressureOptions: ['variation', 'ownership', 'extensibility'],
          expectedPressures: ['variation', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('park', 'Park works', { keep: ['ParkingLot'], topics: ['park'] })],
          newFlows: [flow('fee', 'Fee policy', { topics: ['fee', 'vehicle', 'policy', 'pricing'] })],
          expectedTouchHints: ['ParkingLot', 'FeePolicy', 'Vehicle'],
          complexityBudget: 3,
        },
        {
          id: 'ps-res',
          dayLabel: 'Day 150',
          title: 'Reservations',
          category: 'product',
          narrative:
            'Users book spots ahead of time. Holds expire. Walk-ins still work. Reservation state should not tangle park/unpark forever.',
          pressureOptions: ['state complexity', 'concurrency', 'extensibility'],
          expectedPressures: ['state complexity', 'concurrency'],
          mustChange: true,
          protectedFlows: [flow('park', 'Walk-in', { topics: ['park'] })],
          newFlows: [flow('res', 'Reservations', { topics: ['reserv', 'hold', 'book'] })],
          expectedTouchHints: ['Reservation', 'ParkingLot', 'Spot'],
          complexityBudget: 3,
        },
        {
          id: 'ps-network',
          dayLabel: 'Day 300',
          title: 'Multi-lot network',
          category: 'scale',
          narrative:
            'The city operates several lots under one account/balance. A single ParkingLot class is no longer the whole product.',
          pressureOptions: ['geo', 'multi-tenancy', 'ownership'],
          expectedPressures: ['geo', 'ownership'],
          mustChange: true,
          protectedFlows: [flow('park', 'Park still exists', { topics: ['park'] })],
          newFlows: [
            flow('net', 'Lot network', { topics: ['network', 'account', 'lot', 'city'] }),
          ],
          expectedTouchHints: ['ParkingNetwork', 'ParkingLot', 'Account'],
          complexityBudget: 4,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'media-to-streaming',
    title: 'Media → Streaming App',
    difficulty: 'medium' as const,
    description:
      'Evolve a local MediaPlayer with concrete decoders into plugin codecs, streaming sources, and DRM — without polluting the player.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 15,
    tags: ['evolution', 'media', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-player-ui', 'MediaPlayer', 40, 80, ['play']),
        node('n2', 'el-mp3', 'Mp3Decoder', 320, 0, ['decode']),
        node('n3', 'el-flac', 'FlacDecoder', 320, 160, ['decode']),
      ],
      edges: [
        edge('e1', 'ed-mp-mp3', 'n1', 'n2'),
        edge('e2', 'ed-mp-flac', 'n1', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'MediaPlayer depends on Mp3Decoder and FlacDecoder concretely.\n\n' +
        'The journey\n' +
        'Decoder plugins → streaming vs local sources → DRM/license checks outside the player core.\n\n' +
        'The rule\n' +
        'Player plays. Codecs, sources, and licenses plug in.',
      dimensions: ['product'],
      stages: [
        {
          id: 'md-decoder',
          dayLabel: 'Day 30',
          title: 'Decoder plugins',
          category: 'product',
          narrative:
            'AAC support is on the roadmap. MediaPlayer should not grow another concrete decoder dependency.',
          pressureOptions: ['variation', 'extensibility', 'coupling'],
          expectedPressures: ['variation', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('play', 'Play works', { keep: ['MediaPlayer'], topics: ['play'] })],
          newFlows: [flow('dec', 'Decoder port', { topics: ['decoder', 'codec', 'plugin'] })],
          expectedTouchHints: ['MediaPlayer', 'Decoder', 'Mp3Decoder'],
          complexityBudget: 2,
        },
        {
          id: 'md-stream',
          dayLabel: 'Day 140',
          title: 'Streaming source',
          category: 'product',
          narrative:
            'Product pivots from local files to streaming URLs. Source of bytes must be abstract — file vs stream.',
          pressureOptions: ['source variation', 'extensibility', 'latency'],
          expectedPressures: ['source variation', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('play', 'Play', { topics: ['play'] })],
          newFlows: [flow('src', 'Media source', { topics: ['stream', 'source', 'url'] })],
          expectedTouchHints: ['MediaSource', 'MediaPlayer', 'StreamSource'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-drm-in-player',
            prompt: 'License checks are being prototyped inside MediaPlayer. Extract now or defer?',
            costIfDeferred: 'DRM rules will pollute play() and block codec work.',
            laterStageId: 'md-drm',
          },
        },
        {
          id: 'md-drm',
          dayLabel: 'Day 250',
          title: 'DRM / licenses',
          category: 'reliability',
          narrative:
            'Licensed content requires checks before play. License policy must not live as if/else inside MediaPlayer.',
          pressureOptions: ['compliance', 'ownership', 'cross-cutting concern'],
          expectedPressures: ['compliance', 'ownership'],
          mustChange: true,
          protectedFlows: [flow('play', 'Play still exists', { keep: ['MediaPlayer'], topics: ['play'] })],
          newFlows: [flow('drm', 'License', { topics: ['license', 'drm', 'rights'] })],
          expectedTouchHints: ['LicenseService', 'MediaPlayer', 'DrmPolicy'],
          complexityBudget: 3,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'booking-to-ota',
    title: 'Booking → OTA',
    difficulty: 'hard' as const,
    description:
      'Grow a single-hotel BookingService into an OTA with supplier ports, multi-acquirer payments, and separate notify/refund flows.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 16,
    tags: ['evolution', 'travel', 'product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-booking', 'BookingService', 40, 40, ['book', 'cancel', 'refund', 'notify']),
        node('n2', 'el-hotel', 'HotelApi', 320, 0, ['reserve']),
        node('n3', 'el-pay', 'PayU', 320, 140, ['charge']),
        node('n4', 'el-wa', 'WhatsAppApi', 320, 280, ['send']),
      ],
      edges: [
        edge('e1', 'ed-b-hotel', 'n1', 'n2'),
        edge('e2', 'ed-b-pay', 'n1', 'n3'),
        edge('e3', 'ed-b-wa', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'BookingService talks to HotelApi, PayU, and WhatsAppApi while owning book/cancel/refund/notify.\n\n' +
        'The journey\n' +
        'Multiple hotel suppliers → multi-acquirer payments → notify/refund as separate flows.\n\n' +
        'The rule\n' +
        'OTA breadth comes from ports and collaborators — not a fatter BookingService.',
      dimensions: ['business', 'product'],
      stages: [
        {
          id: 'bk-supplier',
          dayLabel: 'Day 70',
          title: 'Supplier port',
          category: 'product',
          narrative:
            'You will onboard a second hotel supplier. HotelApi as a concrete dependency blocks that. Introduce a supplier port.',
          pressureOptions: ['supplier coupling', 'extensibility', 'infra coupling'],
          expectedPressures: ['supplier coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('book', 'Book still works', { keep: ['BookingService'], topics: ['book'] }),
          ],
          newFlows: [
            flow('sup', 'Supplier port', { topics: ['supplier', 'hotel', 'inventory'] }),
          ],
          expectedTouchHints: ['BookingService', 'HotelSupplier', 'HotelApi'],
          complexityBudget: 3,
        },
        {
          id: 'bk-pay',
          dayLabel: 'Day 160',
          title: 'Multi-acquirer payments',
          category: 'product',
          narrative:
            'PayU alone is not enough — add another acquirer. Payment should sit behind a port so BookingService does not grow provider if/else.',
          pressureOptions: ['provider coupling', 'extensibility'],
          expectedPressures: ['provider coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('book', 'Book', { topics: ['book'] })],
          newFlows: [flow('pay', 'Payments port', { topics: ['payment', 'gateway', 'payu', 'stripe'] })],
          expectedTouchHints: ['BookingService', 'PaymentGateway', 'PayU'],
          forbidModifyElementNames: ['WhatsAppApi'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-notify-in-booking',
            prompt: 'notify() still lives on BookingService. Split notify/refund flows now or defer?',
            costIfDeferred: 'Refunds + multi-channel notify will bloat BookingService further.',
            laterStageId: 'bk-notify',
          },
        },
        {
          id: 'bk-notify',
          dayLabel: 'Day 280',
          title: 'Notify + refunds as separate flows',
          category: 'product',
          narrative:
            'Refunds and multi-channel notifications are now first-class. They must not remain optional methods piled on BookingService forever.',
          pressureOptions: ['ownership', 'cross-cutting concern', 'reliability'],
          expectedPressures: ['ownership', 'cross-cutting concern'],
          mustChange: true,
          protectedFlows: [
            flow('book', 'Core booking', { keep: ['BookingService'], topics: ['book', 'cancel'] }),
          ],
          newFlows: [
            flow('nr', 'Notify + refunds', { topics: ['refund', 'notif', 'email', 'whatsapp'] }),
          ],
          expectedTouchHints: ['NotificationService', 'RefundService', 'BookingService'],
          complexityBudget: 4,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'feed-to-social',
    title: 'Feed → Social Graph',
    difficulty: 'hard' as const,
    description:
      'Evolve FeedService away from direct PushGateway into events, timeline strategies, and a moderation pipeline.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 17,
    tags: ['evolution', 'social', 'scale'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-feed', 'FeedService', 40, 80, ['publish']),
        node('n2', 'el-followers', 'FollowerStore', 320, 0, ['listFollowers']),
        node('n3', 'el-push', 'PushGateway', 320, 160, ['push']),
      ],
      edges: [
        edge('e1', 'ed-f-fol', 'n1', 'n2'),
        edge('e2', 'ed-f-push', 'n1', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'FeedService publishes by reading FollowerStore and calling PushGateway directly.\n\n' +
        'The journey\n' +
        'Emit events instead of pushing inline → timeline fan-out/fan-in strategy → moderation without editing FeedService per rule.\n\n' +
        'The rule\n' +
        'Publishing content is not the same concern as delivery, timeline materialization, or trust & safety.',
      dimensions: ['traffic', 'product', 'reliability'],
      stages: [
        {
          id: 'fd-events',
          dayLabel: 'Day 50',
          title: 'Events out — no direct push',
          category: 'scale',
          narrative:
            'Celebrity posts block publish() while PushGateway fans out. FeedService should not call PushGateway directly — emit an event/queue instead.',
          pressureOptions: ['synchronous coupling', 'scalability', 'latency'],
          expectedPressures: ['synchronous coupling', 'scalability'],
          mustChange: true,
          protectedFlows: [
            flow('pub', 'Publish exists', { keep: ['FeedService'], topics: ['publish'] }),
          ],
          newFlows: [
            flow('evt', 'No direct push / events', {
              topics: ['event', 'queue', 'async'],
              notReach: [{ from: 'FeedService', to: 'PushGateway' }],
            }),
          ],
          expectedTouchHints: ['FeedService', 'MessageQueue', 'PushGateway'],
          complexityBudget: 3,
          introduceCatalog: [
            {
              namePattern: 'Queue|Event|Bus',
              benefits: ['Publish stays fast', 'Delivery isolated'],
              costs: ['Eventual fan-out', 'At-least-once handling'],
            },
          ],
        },
        {
          id: 'fd-timeline',
          dayLabel: 'Day 160',
          title: 'Timeline strategy',
          category: 'scale',
          narrative:
            'Some users need fan-out-on-write; celebrities need fan-in-on-read. Timeline materialization should be a strategy — not hard-coded in FeedService.',
          pressureOptions: ['scalability', 'variation', 'ownership'],
          expectedPressures: ['scalability', 'variation'],
          mustChange: true,
          protectedFlows: [flow('pub', 'Publish', { topics: ['publish'] })],
          newFlows: [
            flow('tl', 'Timeline strategy', { topics: ['timeline', 'fanout', 'fanin', 'strategy'] }),
          ],
          expectedTouchHints: ['TimelineStrategy', 'FeedService', 'FollowerStore'],
          complexityBudget: 4,
          debtOpportunity: {
            id: 'debt-mod-in-feed',
            prompt: 'Ad-hoc spam checks are creeping into publish(). Extract moderation now or defer?',
            costIfDeferred: 'Trust & safety rules will fork FeedService under incident pressure.',
            laterStageId: 'fd-mod',
          },
        },
        {
          id: 'fd-mod',
          dayLabel: 'Day 280',
          title: 'Moderation pipeline',
          category: 'reliability',
          narrative:
            'Trust & safety needs a moderation pipeline (rules, queues, appeals). FeedService must not be edited for every new rule.',
          pressureOptions: ['compliance', 'ownership', 'cross-cutting concern'],
          expectedPressures: ['compliance', 'ownership'],
          mustChange: true,
          protectedFlows: [flow('pub', 'Publish still works', { topics: ['publish'] })],
          newFlows: [
            flow('mod', 'Moderation', { topics: ['moderat', 'trust', 'safety', 'review'] }),
          ],
          expectedTouchHints: ['ModerationService', 'FeedService', 'ModerationRule'],
          complexityBudget: 4,
        },
      ],
    },
  },
]
