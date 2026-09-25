/**
 * Seed Design Studio Architecture Evolution tracks (idempotent by slug).
 *
 * Run: npx tsx src/scripts/seed-studio-evolution.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'
import { LEGACY_EVOLUTION_PACKS } from './data/evolution-legacy-packs'

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
  nodeType = 'class',
) {
  return {
    id,
    position: { x, y },
    data: {
      elementId,
      nodeType,
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

const PACKS = [
  {
    type: 'evolution' as const,
    slug: 'evo-food-delivery',
    title: 'Food Delivery Platform',
    difficulty: 'hard' as const,
    description:
      'Start from a simple food-delivery MVP and evolve it through growth, payments, async notifications, regions, and reliability — including stages where holding is correct.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 1,
    tags: ['product', 'scale', 'reliability'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-cust', 'Customer', 40, 40, ['placeOrder']),
        node('n2', 'el-os', 'OrderService', 280, 40, ['createOrder', 'assignRestaurant']),
        node('n3', 'el-rest', 'Restaurant', 520, 40, ['acceptOrder']),
        node('n4', 'el-pay', 'PaymentService', 280, 220, ['charge']),
        node('n5', 'el-db', 'Database', 280, 380, ['save']),
      ],
      edges: [
        edge('e1', 'ed-c-o', 'n1', 'n2'),
        edge('e2', 'ed-o-r', 'n2', 'n3'),
        edge('e3', 'ed-o-p', 'n2', 'n4'),
        edge('e4', 'ed-o-d', 'n2', 'n5'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'You are the architect for a food-delivery startup. Day 0 is intentionally simple: Customer → OrderService → Restaurant / PaymentService / Database.\n\n' +
        'The journey\n' +
        'Over ~a year the business will add users, payment providers, async messaging, multi-region restaurants, and a hard availability target.\n\n' +
        'The rule\n' +
        'Evolve the existing design. Do not wipe and redraw. Sometimes the right move is to hold.',
      dimensions: ['traffic', 'business', 'reliability', 'geo'],
      stages: [
        {
          id: 'fd-day0',
          dayLabel: 'Day 0',
          title: 'MVP launch',
          category: 'product',
          narrative:
            'You launch with a handful of restaurants in one city. Customers place orders; restaurants accept; payments charge cards; everything persists to one database.\n\nTraffic is low. Latency is fine. The team is three engineers.\n\nLook at the baseline. Does anything need to change for launch day?',
          metrics: { users: 500, ordersPerDay: 80, latencyMs: 120 },
          pressureOptions: [
            'scalability',
            'synchronous coupling',
            'team ownership',
            'none yet — MVP pressure is low',
          ],
          expectedPressures: ['none yet — MVP pressure is low'],
          mustChange: false,
          doNothingHint:
            'For Day 0, holding is expected. Overbuilding microservices now would be proportional complexity you don’t need.',
          protectedFlows: [
            flow('order', 'Place order', {
              keep: ['OrderService', 'PaymentService'],
              reach: [{ from: 'Customer', to: 'OrderService' }],
              topics: ['order', 'charge'],
            }),
          ],
          complexityBudget: 1,
        },
        {
          id: 'fd-day30',
          dayLabel: 'Day 30',
          title: '10K daily orders',
          category: 'scale',
          narrative:
            'Orders are up to ~10,000/day. Peak dinner hours feel a bit slower, but p95 is still under 300ms and error rates are fine.\n\nLeadership asks “should we microservices this?”\n\nDecide whether the current architecture still works.',
          metrics: { users: 40000, ordersPerDay: 10000, latencyMs: 280 },
          pressureOptions: [
            'scalability',
            'latency',
            'processing bottleneck',
            'none yet — still within capacity',
          ],
          expectedPressures: ['none yet — still within capacity'],
          mustChange: false,
          doNothingHint:
            '2×–10× growth without SLOs failing usually does not require a redesign. Hold is the strong answer.',
          protectedFlows: [
            flow('order', 'Place order still works', {
              keep: ['OrderService'],
              topics: ['order'],
            }),
          ],
          complexityBudget: 2,
        },
        {
          id: 'fd-day90',
          dayLabel: 'Day 90',
          title: 'Payment bottleneck',
          category: 'scale',
          narrative:
            'Daily orders hit ~1M. PaymentService is now the bottleneck — synchronous charge calls stretch p95 past 2s at peak.\n\nUsers abandon carts. Finance also wants a second provider next quarter.\n\nThis time, holding is unlikely to be enough.',
          metrics: { users: 2_000_000, ordersPerDay: 1_000_000, latencyMs: 2100 },
          pressureOptions: [
            'scalability',
            'synchronous coupling',
            'processing bottleneck',
            'latency',
            'availability',
          ],
          expectedPressures: ['scalability', 'processing bottleneck', 'latency'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Orders still place', {
              keep: ['OrderService', 'Customer'],
              topics: ['order'],
            }),
          ],
          newFlows: [
            flow('pay-scale', 'Payment path improved', {
              topics: ['payment', 'gateway', 'queue', 'async', 'stripe', 'razorpay'],
            }),
          ],
          expectedTouchHints: ['PaymentService', 'PaymentGateway', 'OrderService'],
          complexityBudget: 4,
          introduceCatalog: [
            {
              namePattern: 'Queue|Kafka|Message|Async',
              benefits: ['Lower request latency', 'Better throughput', 'Reduced synchronous coupling'],
              costs: [
                'Eventual consistency',
                'More infrastructure',
                'Harder debugging',
                'Retry / idempotency requirements',
              ],
            },
            {
              namePattern: 'Gateway|Provider',
              benefits: ['Swap providers without rewriting OrderService', 'Clear payment boundary'],
              costs: ['Extra abstraction layer', 'More wiring to maintain'],
            },
          ],
          approachHints: ['Async payment processing', 'Payment gateway port', 'Horizontal scale PaymentService'],
          debtOpportunity: {
            id: 'debt-provider-glue',
            prompt:
              'PaymentService still has provider-specific branching. Fix the abstraction now, or defer until multi-provider lands?',
            costIfDeferred:
              'Day 150 multi-provider work becomes a painful migration instead of a small add.',
            laterStageId: 'fd-day150',
          },
        },
        {
          id: 'fd-day150',
          dayLabel: 'Day 150',
          title: 'Multiple payment providers',
          category: 'product',
          narrative:
            'Finance signed Razorpay beside Stripe. Checkout must support both. OrderService should not grow provider if/else forever.\n\nIf you deferred the payment abstraction earlier, that debt is due now.',
          metrics: { ordersPerDay: 1_200_000 },
          pressureOptions: [
            'provider coupling',
            'extensibility',
            'domain depending on infra',
            'scalability',
          ],
          expectedPressures: ['provider coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Orders still work', { keep: ['OrderService'], topics: ['order'] }),
          ],
          newFlows: [
            flow('multi', 'Multi-provider', {
              topics: ['razorpay', 'stripe', 'gateway', 'payment'],
            }),
          ],
          expectedTouchHints: ['PaymentService', 'PaymentGateway', 'Stripe', 'Razorpay'],
          forbidModifyElementNames: ['Customer'],
          complexityBudget: 4,
        },
        {
          id: 'fd-day240',
          dayLabel: 'Day 240',
          title: 'Notification delays',
          category: 'incident',
          narrative:
            'Incident: email/SMS sends are blocking order completion. Support tickets spike when the email vendor slows down.\n\nNotifications must not block the order happy path.',
          metrics: { latencyMs: 4500, availability: '99.5%' },
          pressureOptions: [
            'synchronous coupling',
            'availability',
            'latency',
            'processing bottleneck',
          ],
          expectedPressures: ['synchronous coupling', 'latency'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Order path', { keep: ['OrderService'], topics: ['order'] }),
          ],
          newFlows: [
            flow('notif', 'Async notifications', {
              topics: ['notif', 'email', 'sms', 'queue', 'async'],
            }),
          ],
          expectedTouchHints: ['NotificationService', 'OrderService', 'MessageQueue'],
          complexityBudget: 4,
          introduceCatalog: [
            {
              namePattern: 'Queue|Async|Worker|Notifier',
              benefits: ['Order path stays fast', 'Vendor slowness isolated'],
              costs: ['Eventual delivery', 'Need retries / DLQ thinking'],
            },
          ],
        },
        {
          id: 'fd-day365',
          dayLabel: 'Day 365',
          title: 'Multi-region restaurants',
          category: 'reliability',
          narrative:
            'Restaurants now operate in five countries. Latency to a single region DB hurts. Local payment methods differ. A full region outage must not take down every market.\n\nAvailability target moves toward 99.99%.',
          metrics: { users: 8_000_000, availability: '99.99%' },
          pressureOptions: [
            'geo latency',
            'failure isolation',
            'data residency',
            'scalability',
            'team ownership',
          ],
          expectedPressures: ['geo latency', 'failure isolation'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Core order', { keep: ['OrderService'], topics: ['order'] }),
          ],
          newFlows: [
            flow('region', 'Regional awareness', {
              topics: ['region', 'geo', 'replica', 'failover', 'locale'],
            }),
          ],
          expectedTouchHints: ['OrderService', 'Database', 'RegionRouter'],
          complexityBudget: 5,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'evo-parking-lot',
    title: 'Parking Lot Over Years',
    difficulty: 'medium' as const,
    description:
      'Evolve a parking lot from a single floor through EV charging, reservations, and dynamic pricing — product growth without premature scale theater.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 2,
    tags: ['product'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-lot', 'ParkingLot', 200, 40, ['park', 'unpark', 'fee']),
        node('n2', 'el-car', 'Car', 40, 220, ['enter']),
        node('n3', 'el-bike', 'Bike', 360, 220, ['enter']),
      ],
      edges: [
        edge('e1', 'ed-lot-car', 'n1', 'n2'),
        edge('e2', 'ed-lot-bike', 'n1', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Year-by-year product evolution of a parking system. You start with a single lot that parks vehicles and calculates fees inline.\n\n' +
        'The journey\n' +
        'Add floors, EV charging, reservations, then dynamic pricing — only when the story demands it.\n\n' +
        'The rule\n' +
        'Start simple. Hold when pressure is fake. Change when a real capability arrives. Do not invent a smart-city platform on Year 1.',
      dimensions: ['business'],
      stages: [
        {
          id: 'pk-y1',
          dayLabel: 'Year 1',
          title: 'Single lot MVP',
          category: 'product',
          narrative:
            'One lot, cars and bikes, park/unpark/fee. City council just approved the lot. No multi-floor requirement yet.',
          pressureOptions: ['extensibility', 'none yet — MVP is enough'],
          expectedPressures: ['none yet — MVP is enough'],
          mustChange: false,
          doNothingHint: 'Year 1 should stay simple. Hold.',
          protectedFlows: [flow('park', 'Park', { keep: ['ParkingLot'], topics: ['park'] })],
        },
        {
          id: 'pk-y2',
          dayLabel: 'Year 2',
          title: 'Multiple floors',
          category: 'product',
          narrative:
            'The building adds floors. Spots must be tracked per floor. Fee rules still exist, but inventory is now multi-level.',
          pressureOptions: ['structural complexity', 'extensibility', 'scalability'],
          expectedPressures: ['structural complexity', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('park', 'Park still works', { keep: ['ParkingLot'], topics: ['park'] })],
          newFlows: [flow('floor', 'Floors', { topics: ['floor', 'level', 'spot'] })],
          expectedTouchHints: ['ParkingLot', 'Floor', 'ParkingSpot'],
          complexityBudget: 3,
        },
        {
          id: 'pk-y3',
          dayLabel: 'Year 3',
          title: 'EV charging',
          category: 'product',
          narrative:
            'EV spots with chargers arrive. Not every spot is EV. Charging sessions must be modeled without breaking normal park/unpark.',
          pressureOptions: ['variation', 'extensibility', 'ownership'],
          expectedPressures: ['variation', 'extensibility'],
          mustChange: true,
          protectedFlows: [flow('park', 'Park', { topics: ['park'] })],
          newFlows: [flow('ev', 'EV', { topics: ['ev', 'charge', 'charger'] })],
          expectedTouchHints: ['ParkingSpot', 'Charger', 'EVSpot'],
          complexityBudget: 3,
        },
        {
          id: 'pk-y4',
          dayLabel: 'Year 4',
          title: 'Reservations',
          category: 'product',
          narrative:
            'Users can reserve spots ahead of time. Holds expire. Walk-ins still work.',
          pressureOptions: ['concurrency', 'state complexity', 'availability'],
          expectedPressures: ['state complexity', 'concurrency'],
          mustChange: true,
          protectedFlows: [flow('park', 'Walk-in park', { topics: ['park'] })],
          newFlows: [flow('res', 'Reservation', { topics: ['reserv', 'hold', 'book'] })],
          expectedTouchHints: ['Reservation', 'ParkingLot'],
          complexityBudget: 3,
        },
        {
          id: 'pk-y5',
          dayLabel: 'Year 5',
          title: 'Dynamic pricing',
          category: 'product',
          narrative:
            'Pricing now varies by hour, floor, and EV. Fee logic should not live forever inside ParkingLot.',
          pressureOptions: ['ownership', 'extensibility', 'policy change rate'],
          expectedPressures: ['ownership', 'policy change rate'],
          mustChange: true,
          protectedFlows: [flow('park', 'Park', { topics: ['park'] })],
          newFlows: [flow('price', 'Pricing', { topics: ['price', 'fee', 'pricing'] })],
          expectedTouchHints: ['PricingPolicy', 'ParkingLot', 'FeeCalculator'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-fee-in-lot',
            prompt: 'Fee still calculated inside ParkingLot. Extract pricing now or defer?',
            costIfDeferred: 'Dynamic pricing becomes a rewrite of ParkingLot.',
            laterStageId: 'pk-y5',
          },
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'evo-ride-share',
    title: 'Ride-Share Matching Growth',
    difficulty: 'hard' as const,
    description:
      'Grow a ride-share matcher from city MVP through surge pricing to multi-city — scale and geo pressures.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 3,
    tags: ['scale', 'geo'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-rider', 'Rider', 40, 80, ['requestRide']),
        node('n2', 'el-match', 'MatchingService', 280, 40, ['match', 'dispatch']),
        node('n3', 'el-driver', 'Driver', 520, 80, ['accept']),
        node('n4', 'el-trip', 'Trip', 280, 220, ['start', 'complete']),
      ],
      edges: [
        edge('e1', 'ed-r-m', 'n1', 'n2'),
        edge('e2', 'ed-m-d', 'n2', 'n3'),
        edge('e3', 'ed-m-t', 'n2', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'A ride-share MVP matches riders to drivers in one city via MatchingService.\n\n' +
        'The journey\n' +
        'Hold through early growth if capacity is fine, then introduce surge pricing cleanly, then expand to multi-city with isolation.\n\n' +
        'The rule\n' +
        'Scale and geo pressures should drive structure — not a premature platform rewrite on Day 0.',
      dimensions: ['traffic', 'geo', 'business'],
      stages: [
        {
          id: 'rs-mvp',
          dayLabel: 'Day 0',
          title: 'City MVP',
          category: 'product',
          narrative: 'One city, simple matching. Hold unless you see a real pressure.',
          pressureOptions: ['scalability', 'none yet — city MVP'],
          expectedPressures: ['none yet — city MVP'],
          mustChange: false,
          doNothingHint: 'Hold for MVP.',
          protectedFlows: [
            flow('match', 'Match', { keep: ['MatchingService'], topics: ['match'] }),
          ],
        },
        {
          id: 'rs-surge',
          dayLabel: 'Day 120',
          title: 'Surge pricing',
          category: 'product',
          narrative:
            'Peak hours need surge multipliers. Pricing policy should not tangle forever inside MatchingService.',
          pressureOptions: ['ownership', 'policy change rate', 'scalability'],
          expectedPressures: ['ownership', 'policy change rate'],
          mustChange: true,
          protectedFlows: [flow('match', 'Match', { topics: ['match'] })],
          newFlows: [flow('surge', 'Surge', { topics: ['surge', 'price', 'pricing'] })],
          expectedTouchHints: ['PricingService', 'MatchingService', 'SurgePolicy'],
          complexityBudget: 3,
        },
        {
          id: 'rs-multi',
          dayLabel: 'Day 300',
          title: 'Multi-city',
          category: 'scale',
          narrative:
            'Launch in 12 cities. Matching must be city-scoped. A city outage must not freeze the whole network.',
          pressureOptions: ['geo latency', 'failure isolation', 'scalability', 'data partitioning'],
          expectedPressures: ['geo latency', 'failure isolation', 'data partitioning'],
          mustChange: true,
          protectedFlows: [flow('match', 'Match', { topics: ['match'] })],
          newFlows: [flow('city', 'City scope', { topics: ['city', 'region', 'partition'] })],
          expectedTouchHints: ['MatchingService', 'CityRegistry'],
          complexityBudget: 4,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'evo-payments-growth',
    title: 'Payments Under Fire',
    difficulty: 'medium' as const,
    description:
      'Single PSP → multi-provider → timeout incident → audit. Business + incident pressures on payments.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 4,
    tags: ['business', 'incident'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 200, 40, ['checkout']),
        node('n2', 'el-pay', 'PaymentService', 200, 200, ['charge', 'refund']),
        node('n3', 'el-stripe', 'StripeClient', 200, 360, ['charge']),
      ],
      edges: [
        edge('e1', 'ed-o-p', 'n1', 'n2'),
        edge('e2', 'ed-p-s', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Payments start glued to Stripe via PaymentService. This track is about growing providers, surviving an outage, then satisfying audit — under real business and incident pressure.\n\n' +
        'The journey\n' +
        'Multi-PSP → timeout/outage resilience → cross-cutting audit.\n\n' +
        'The rule\n' +
        'Evolve PaymentService carefully. Prefer not to teach Order about providers or timeouts. Deferring resilience creates debt that comes due on the incident stage.',
      dimensions: ['business', 'reliability'],
      stages: [
        {
          id: 'pay-multi',
          dayLabel: 'Day 60',
          title: 'Add second PSP',
          category: 'product',
          narrative:
            'Razorpay is signed. Stripe must keep working. Prefer a gateway so Order stays clean.',
          pressureOptions: ['provider coupling', 'extensibility', 'domain→infra'],
          expectedPressures: ['provider coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('stripe', 'Stripe path', {
              keep: ['Order', 'PaymentService'],
              reach: [{ from: 'Order', to: 'PaymentService' }],
            }),
          ],
          newFlows: [flow('rz', 'Razorpay', { topics: ['razorpay', 'gateway'] })],
          expectedTouchHints: ['PaymentService', 'PaymentGateway', 'Razorpay'],
          forbidModifyElementNames: ['Order'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-no-timeouts',
            prompt: 'No timeout/fallback policy yet. Add resilience now or defer?',
            costIfDeferred: 'The next outage will force an emergency redesign.',
            laterStageId: 'pay-incident',
          },
        },
        {
          id: 'pay-incident',
          dayLabel: 'Day 120',
          title: 'Provider outage 15 minutes',
          category: 'incident',
          narrative:
            'Production incident: primary PSP unavailable for 15 minutes. Checkout failed hard. How should architecture reduce blast radius next time?',
          pressureOptions: [
            'availability',
            'failure isolation',
            'retry/fallback',
            'timeouts',
          ],
          expectedPressures: ['availability', 'retry/fallback', 'failure isolation'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Order→Payment', {
              reach: [{ from: 'Order', to: 'PaymentService' }],
            }),
          ],
          newFlows: [
            flow('fallback', 'Resilience', {
              topics: ['retry', 'fallback', 'circuit', 'timeout'],
            }),
          ],
          expectedTouchHints: ['PaymentService', 'Fallback', 'RetryPolicy'],
          complexityBudget: 4,
          introduceCatalog: [
            {
              namePattern: 'Retry|Fallback|Circuit|Timeout',
              benefits: ['Survive provider outages', 'Isolate failures'],
              costs: ['More states to reason about', 'Idempotency required'],
            },
          ],
        },
        {
          id: 'pay-audit',
          dayLabel: 'Day 200',
          title: 'Audit every payment',
          category: 'reliability',
          narrative:
            'Compliance needs an audit trail for charge and refund across providers — one choke point, not copy-paste in each adapter.',
          pressureOptions: ['cross-cutting concern', 'compliance', 'ownership'],
          expectedPressures: ['cross-cutting concern', 'compliance'],
          mustChange: true,
          protectedFlows: [
            flow('pay', 'Payment still works', { keep: ['PaymentService'], topics: ['charge'] }),
          ],
          newFlows: [flow('audit', 'Audit', { topics: ['audit'] })],
          expectedTouchHints: ['PaymentService', 'AuditLogger'],
          forbidModifyElementNames: ['Order'],
          complexityBudget: 2,
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'evo-notifications',
    title: 'Notifications Under Load',
    difficulty: 'medium' as const,
    description:
      'Sync email → multi-channel → backlog incident → async. Product + incident pressures.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 5,
    tags: ['product', 'incident'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'OrderService', 200, 40, ['complete']),
        node('n2', 'el-notif', 'Notifier', 200, 200, ['notify']),
        node('n3', 'el-email', 'EmailSender', 200, 360, ['send']),
      ],
      edges: [
        edge('e1', 'ed-o-n', 'n1', 'n2'),
        edge('e2', 'ed-n-e', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Notifications start as a synchronous email send after order complete (OrderService → Notifier → EmailSender).\n\n' +
        'The journey\n' +
        'Add more channels, then isolate vendor backlog failures with async delivery.\n\n' +
        'The rule\n' +
        'Channels are interchangeable. Order completion must not wait on a slow email vendor.',
      dimensions: ['business', 'reliability'],
      stages: [
        {
          id: 'nt-channels',
          dayLabel: 'Day 45',
          title: 'Add SMS + WhatsApp',
          category: 'product',
          narrative:
            'Support wants SMS and WhatsApp beside email. Prefer a channel abstraction.',
          pressureOptions: ['variation', 'extensibility', 'coupling'],
          expectedPressures: ['variation', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('email', 'Email kept', {
              keep: ['EmailSender'],
              reach: [{ from: 'Notifier', to: 'EmailSender' }],
            }),
          ],
          newFlows: [
            flow('multi', 'Multi-channel', { topics: ['sms', 'whatsapp', 'channel'] }),
          ],
          expectedTouchHints: ['Notifier', 'NotificationChannel', 'SmsSender'],
          complexityBudget: 4,
        },
        {
          id: 'nt-backlog',
          dayLabel: 'Day 100',
          title: 'Vendor backlog incident',
          category: 'incident',
          narrative:
            'Email vendor queues for 40 minutes. Order completion waits on notify(). Checkout looks “down”.',
          pressureOptions: ['synchronous coupling', 'availability', 'latency'],
          expectedPressures: ['synchronous coupling', 'availability'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Order complete', { keep: ['OrderService'], topics: ['complete'] }),
          ],
          newFlows: [
            flow('async', 'Async notify', { topics: ['queue', 'async', 'worker'] }),
          ],
          expectedTouchHints: ['Notifier', 'MessageQueue', 'OrderService'],
          complexityBudget: 3,
          introduceCatalog: [
            {
              namePattern: 'Queue|Worker|Async',
              benefits: ['Order path not blocked', 'Vendor isolation'],
              costs: ['Eventual delivery', 'Retry design'],
            },
          ],
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'evo-team-boundaries',
    title: 'Team Topology Pressure',
    difficulty: 'hard' as const,
    description:
      'A monolith owned by 3 engineers becomes painful when 8 teams need independent delivery. Architecture must respect ownership boundaries.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 6,
    tags: ['team'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-app', 'AppMonolith', 240, 40, [
          'auth',
          'catalog',
          'cart',
          'checkout',
          'notify',
          'admin',
        ]),
        node('n2', 'el-db', 'SharedDatabase', 240, 240, ['query']),
      ],
      edges: [edge('e1', 'ed-a-d', 'n1', 'n2')],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Architecture is also about how teams work. You start with a monolith and a shared database owned by three engineers.\n\n' +
        'The journey\n' +
        'Hold while the team is tiny. When eight teams need independent delivery, introduce ownership boundaries — modules/APIs — without requiring Kubernetes day one.\n\n' +
        'The rule\n' +
        'Org growth is a real architectural pressure. Respond proportionally.',
      dimensions: ['team'],
      stages: [
        {
          id: 'tm-3eng',
          dayLabel: 'Day 0',
          title: 'Three engineers',
          category: 'team',
          narrative:
            'Three engineers own everything. Shared DB and monolith are fine. Don’t invent platforms yet.',
          pressureOptions: ['team ownership', 'none yet — small team'],
          expectedPressures: ['none yet — small team'],
          mustChange: false,
          doNothingHint: 'Small team + monolith can be proportional. Hold.',
          protectedFlows: [
            flow('app', 'App works', { keep: ['AppMonolith'], topics: ['checkout'] }),
          ],
        },
        {
          id: 'tm-8teams',
          dayLabel: 'Day 400',
          title: 'Eight teams',
          category: 'team',
          narrative:
            'Eight teams now ship independently. Deploying auth blocks checkout. SharedDatabase becomes a conflict magnet.\n\nArchitecture must introduce clearer ownership boundaries / modules / APIs — not necessarily a full microservice zoo.',
          pressureOptions: [
            'team ownership',
            'deployment coupling',
            'shared database contention',
            'scalability',
          ],
          expectedPressures: [
            'team ownership',
            'deployment coupling',
            'shared database contention',
          ],
          mustChange: true,
          protectedFlows: [
            flow('checkout', 'Checkout capability remains', { topics: ['checkout', 'cart'] }),
          ],
          newFlows: [
            flow('bounds', 'Boundaries', {
              topics: ['auth', 'catalog', 'checkout', 'module', 'service', 'api'],
            }),
          ],
          expectedTouchHints: ['AppMonolith', 'CheckoutModule', 'AuthModule', 'CatalogModule'],
          complexityBudget: 6,
          approachHints: [
            'Modular monolith',
            'Extract bounded contexts',
            'Separate DBs per module',
          ],
        },
      ],
    },
  },

  {
    type: 'evolution' as const,
    slug: 'evo-legacy-checkout',
    title: 'Legacy Checkout Untangle',
    difficulty: 'hard' as const,
    description:
      'Inherit a tangled checkout. Grow traffic while gradually untangling — legacy evolution under scale pressure.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 7,
    tags: ['legacy', 'scale'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-co', 'CheckoutController', 240, 20, [
          'checkout',
          'price',
          'pay',
          'email',
          'log',
          'fraud',
        ]),
        node('n2', 'el-stripe', 'Stripe', 40, 220, ['charge']),
        node('n3', 'el-email', 'SmtpClient', 240, 220, ['send']),
        node('n4', 'el-db', 'SqlDb', 440, 220, ['save']),
      ],
      edges: [
        edge('e1', 'ed-c-s', 'n1', 'n2'),
        edge('e2', 'ed-c-e', 'n1', 'n3'),
        edge('e3', 'ed-c-d', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'You inherit a god CheckoutController that talks to Stripe, SMTP, and SQL while owning price/pay/email/fraud.\n\n' +
        'The journey\n' +
        'Observe first (hold), extract payment under mild pressure, then decouple side effects when traffic exposes latency.\n\n' +
        'The rule\n' +
        'Legacy evolution is incremental. You cannot rewrite everything on day one — but debt deferred has a cost.',
      dimensions: ['traffic', 'legacy'],
      stages: [
        {
          id: 'lg-inherit',
          dayLabel: 'Day 0',
          title: 'Inherit the mess',
          category: 'legacy',
          narrative:
            'Traffic is modest. The code is ugly but paying the bills. A full rewrite is riskier than living with it short-term.',
          pressureOptions: ['technical debt', 'none yet — rewrite risk higher'],
          expectedPressures: ['none yet — rewrite risk higher'],
          mustChange: false,
          doNothingHint: 'Observe first. Hold is valid on Day 0.',
          protectedFlows: [
            flow('co', 'Checkout', { keep: ['CheckoutController'], topics: ['checkout', 'pay'] }),
          ],
        },
        {
          id: 'lg-extract-pay',
          dayLabel: 'Day 90',
          title: 'Payment extraction',
          category: 'legacy',
          narrative:
            'Fraud team needs cleaner payment hooks. Extract payment without boiling the ocean.',
          pressureOptions: ['ownership', 'coupling', 'extensibility'],
          expectedPressures: ['ownership', 'coupling'],
          mustChange: true,
          protectedFlows: [
            flow('co', 'Checkout still works', {
              keep: ['CheckoutController'],
              topics: ['checkout'],
            }),
          ],
          newFlows: [
            flow('pay', 'Payment boundary', { topics: ['payment', 'gateway', 'stripe'] }),
          ],
          expectedTouchHints: ['CheckoutController', 'PaymentService', 'Stripe'],
          complexityBudget: 3,
          debtOpportunity: {
            id: 'debt-email-in-controller',
            prompt: 'Email still sent inside CheckoutController. Extract now or defer?',
            costIfDeferred: 'Later scale stage will couple notifications to checkout latency.',
            laterStageId: 'lg-scale',
          },
        },
        {
          id: 'lg-scale',
          dayLabel: 'Day 200',
          title: 'Traffic 20×',
          category: 'scale',
          narrative:
            'Orders 20×. Synchronous email and fat controller become visible latency. Deferred email debt may be due.',
          pressureOptions: ['latency', 'synchronous coupling', 'scalability'],
          expectedPressures: ['latency', 'synchronous coupling'],
          mustChange: true,
          protectedFlows: [
            flow('co', 'Checkout', { topics: ['checkout', 'pay'] }),
          ],
          newFlows: [
            flow('async', 'Decouple side effects', {
              topics: ['email', 'queue', 'notif', 'async'],
            }),
          ],
          expectedTouchHints: ['CheckoutController', 'Notifier', 'MessageQueue'],
          complexityBudget: 4,
        },
      ],
    },
  },

  // Refresh legacy stub slug from debugger seed
  {
    type: 'evolution' as const,
    slug: 'evo-multi-provider',
    title: 'Evolve to Multi-Provider Payments',
    difficulty: 'medium' as const,
    description:
      'Year-1 single provider → multi-provider without breaking Order. A short evolution track.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 8,
    tags: ['evolution', 'payments'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 40, 80, ['checkout']),
        node('n2', 'el-pay', 'Payment', 280, 80, ['charge']),
        node('n3', 'el-rz', 'Razorpay', 520, 80, ['createPayment']),
      ],
      edges: [
        edge('e1', 'ed-ord-pay', 'n1', 'n2'),
        edge('e2', 'ed-pay-rz', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Year 1 supports a single payment provider (Razorpay) behind Payment. Order asks Payment to charge.\n\n' +
        'The journey\n' +
        'Hold while there is only one PSP. When Stripe arrives, introduce a gateway so Order never learns provider details.\n\n' +
        'The rule\n' +
        'Do not redesign for imaginary providers. Change when the second provider is real.',
      stages: [
        {
          id: 'mp-hold',
          dayLabel: 'Year 1',
          title: 'Single provider OK',
          category: 'product',
          narrative: 'Only Razorpay exists. No second provider yet. Hold is fine.',
          pressureOptions: ['none yet — single provider'],
          expectedPressures: ['none yet — single provider'],
          mustChange: false,
          doNothingHint: 'Hold until a second provider is real.',
          protectedFlows: [
            flow('pay', 'Pay', {
              keep: ['Order', 'Payment'],
              reach: [{ from: 'Order', to: 'Payment' }],
            }),
          ],
        },
        {
          id: 'mp-multi',
          dayLabel: 'Year 2',
          title: 'Add Stripe',
          category: 'product',
          narrative:
            'Stripe must be supported beside Razorpay. Order must not depend on concrete providers.',
          pressureOptions: ['provider coupling', 'extensibility'],
          expectedPressures: ['provider coupling', 'extensibility'],
          mustChange: true,
          protectedFlows: [
            flow('order', 'Order→Payment', {
              keep: ['Order'],
              reach: [{ from: 'Order', to: 'Payment' }],
            }),
          ],
          newFlows: [
            flow('stripe', 'Stripe + gateway', { topics: ['stripe', 'gateway'] }),
          ],
          expectedTouchHints: ['Payment', 'PaymentGateway', 'Stripe', 'Razorpay'],
          forbidModifyElementNames: ['Order'],
          complexityBudget: 3,
        },
      ],
    },
  },
]

const ALL_PACKS = [...PACKS, ...LEGACY_EVOLUTION_PACKS]

async function main() {
  await connectDB()
  let n = 0
  for (const pack of ALL_PACKS) {
    await ChallengePack.findOneAndUpdate({ slug: pack.slug }, { $set: pack }, { upsert: true, new: true })
    console.log(`✓ evolution ${pack.slug} (${(pack.payload.stages as unknown[]).length} stages)`)
    n++
  }
  console.log(`Done. ${n} evolution tracks (core + legacy).`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
