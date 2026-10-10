/**
 * Seed Design Studio Architecture Budget packs (idempotent by slug).
 *
 * Run: npx tsx src/scripts/seed-studio-budget.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

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
  relationshipType: string = 'dependency',
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

const WHY_COMMON = [
  'Reduce read latency',
  'Reduce database load',
  'Improve availability',
  'Future scalability',
  'Decouple providers',
  'Improve reliability',
  'Cut synchronous wait',
  'Team maintainability',
  'Other',
]

const FOOD_INVESTMENTS = [
  {
    id: 'pay-abs',
    label: 'Payment Abstraction',
    category: 'extensibility',
    cost: 2,
    summary: 'Introduce a PaymentGateway boundary so providers can swap.',
    tags: ['payment', 'extensibility', 'checkout'],
    benefits: ['Swap Stripe without rewriting OrderService', 'Clear module boundary'],
    complexities: ['Extra interface + adapters', 'Indirection for juniors'],
    risks: ['Over-abstraction if only one provider forever'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['PaymentService', 'OrderService'],
  },
  {
    id: 'pay-ifelse',
    label: 'Payment if/else',
    category: 'extensibility',
    cost: 1,
    summary: 'Quick branch on provider string inside PaymentService.',
    tags: ['payment', 'extensibility'],
    benefits: ['Ships in a day'],
    complexities: ['Branches multiply per provider'],
    risks: ['Becomes unmaintainable past 2 providers'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['PaymentService'],
    cheapHackOf: 'pay-abs',
  },
  {
    id: 'cache',
    label: 'Caching',
    category: 'scalability',
    cost: 2,
    summary: 'Cache hot reads (menus, restaurant catalog).',
    tags: ['cache', 'scalability', 'db-load', 'latency'],
    benefits: ['↓ Database load', '↓ Read latency'],
    complexities: ['Cache invalidation', 'Operational dependency'],
    risks: ['Stale data bugs'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['RestaurantCatalog', 'OrderService'],
  },
  {
    id: 'queue',
    label: 'Message Queue',
    category: 'scalability',
    cost: 3,
    summary: 'Async handoff for notifications and non-critical side effects.',
    tags: ['queue', 'scalability', 'notifications', 'reliability'],
    benefits: ['Decouple checkout from email', 'Absorb spikes'],
    complexities: ['Broker ops', 'At-least-once semantics'],
    risks: ['Duplicate processing'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['OrderService', 'NotificationService'],
  },
  {
    id: 'db-replica',
    label: 'Database Replication',
    category: 'scalability',
    cost: 4,
    summary: 'Read replicas for reporting and heavy reads.',
    tags: ['db-load', 'scalability', 'reporting'],
    benefits: ['Offload primary DB', 'Reporting isolation'],
    complexities: ['Replication lag', 'Infra cost'],
    risks: ['Stale reads'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['Database'],
  },
  {
    id: 'circuit',
    label: 'Retry / Circuit Breaker',
    category: 'reliability',
    cost: 2,
    summary: 'Timeouts, retries, and breakers around PaymentService.',
    tags: ['reliability', 'checkout', 'payment'],
    benefits: ['Survive flaky Stripe', 'Fail fast under outage'],
    complexities: ['Tuning thresholds'],
    risks: ['Retry storms if misconfigured'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['PaymentService', 'OrderService'],
  },
  {
    id: 'notify',
    label: 'Notification Service',
    category: 'maintainability',
    cost: 2,
    summary: 'Extract notifications behind their own service boundary.',
    tags: ['notifications', 'maintainability'],
    benefits: ['Clear ownership', 'Channel plugins later'],
    complexities: ['Another deployable'],
    risks: ['Premature split for MVP'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['OrderService'],
  },
  {
    id: 'event-bus',
    label: 'Event Bus',
    category: 'extensibility',
    cost: 4,
    summary: 'Domain events for order lifecycle.',
    tags: ['events', 'extensibility', 'scalability'],
    benefits: ['Loose coupling', 'Easy new consumers'],
    complexities: ['Schema evolution', 'Ops surface'],
    risks: ['Overengineering early'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['OrderService'],
  },
  {
    id: 'svc-extract',
    label: 'Service Extraction',
    category: 'maintainability',
    cost: 3,
    summary: 'Split a coarse module into independently deployable services.',
    tags: ['maintainability', 'team'],
    benefits: ['Team autonomy'],
    complexities: ['Distributed transactions', 'Latency'],
    risks: ['Distributed monolith'],
    whyOptions: WHY_COMMON,
    appliesToHints: ['OrderService'],
  },
]

const PACKS = [
  {
    type: 'budget' as const,
    slug: 'food-delivery-mvp-budget',
    title: 'Food Delivery MVP',
    description: '10K orders/day. You have 8 architecture points — you cannot buy everything.',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 1,
    tags: ['budget', 'mvp', 'food-delivery'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-customer', 'Customer', 40, 40, ['placeOrder']),
        node('n2', 'el-order', 'OrderService', 280, 40, ['create', 'confirm']),
        node('n3', 'el-pay', 'PaymentService', 280, 200, ['charge']),
        node('n4', 'el-db', 'Database', 520, 200, ['write', 'read']),
        node('n5', 'el-catalog', 'RestaurantCatalog', 520, 40, ['listMenus']),
      ],
      edges: [
        edge('e1', 'ed-c-o', 'n1', 'n2'),
        edge('e2', 'ed-o-p', 'n2', 'n3'),
        edge('e3', 'ed-p-d', 'n3', 'n4'),
        edge('e4', 'ed-o-d', 'n2', 'n4'),
        edge('e5', 'ed-o-cat', 'n2', 'n5'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Food delivery MVP: Customer → OrderService → PaymentService → Database.\n\n' +
        'Constraints\n' +
        '10K orders/day · Stripe only · Email notifications · One team · 99.5% availability.\n\n' +
        'The rule\n' +
        'You have 8 Architecture Points. You cannot afford everything — prioritize what matters now.',
      scenario:
        'Build an early-stage food delivery platform for an MVP. Only Stripe is expected for ~12 months. Checkout reliability matters most.',
      difficultyMode: 'intermediate',
      budget: {
        kind: 'points',
        total: 8,
        reserveAllowed: true,
        unitLabel: 'Architecture Points',
      },
      suggestedReserve: 2,
      priorities: [
        {
          id: 'checkout',
          label: 'Checkout reliability',
          weight: 'critical',
          coveredByTags: ['reliability', 'checkout', 'payment'],
        },
        {
          id: 'payment-ext',
          label: 'Payment extensibility',
          weight: 'medium',
          coveredByTags: ['payment', 'extensibility'],
        },
        {
          id: 'notify-lat',
          label: 'Notification latency',
          weight: 'low',
          coveredByTags: ['notifications', 'queue'],
        },
        {
          id: 'reporting',
          label: 'Reporting scalability',
          weight: 'low',
          coveredByTags: ['reporting', 'db-load'],
        },
      ],
      pressures: [
        {
          id: 'db-bottleneck',
          label: 'Database bottleneck',
          severity: 'high',
          addressedByTags: ['cache', 'db-load', 'scalability'],
        },
        {
          id: 'pay-coupling',
          label: 'Payment coupling',
          severity: 'medium',
          addressedByTags: ['payment', 'extensibility'],
          addressedByInvestmentIds: ['pay-abs', 'pay-ifelse'],
        },
        {
          id: 'notify-lag',
          label: 'Notification latency',
          severity: 'low',
          addressedByTags: ['notifications', 'queue'],
        },
        {
          id: 'deploy-complex',
          label: 'Deployment complexity',
          severity: 'medium',
          addressedByTags: ['maintainability'],
        },
      ],
      investments: FOOD_INVESTMENTS,
      constraints: {
        maxNewClasses: 4,
        maxExternalSystems: 1,
        teamSize: 4,
        deadlineDays: 21,
        maxNewAbstractions: 3,
      },
      grading: {
        opportunityCostEnabled: true,
        inflationSensitivity: 0.5,
        minCriticalCoverage: 1,
      },
      evolutionHooks: {
        linkedEvolutionSlug: 'evo-food-delivery',
        debtPressureMap: {
          'db-bottleneck': 'debt-db-bottleneck',
          'pay-coupling': 'debt-payment-coupling',
          'notify-lag': 'debt-notify-lag',
        },
        handoffBlurb:
          'Carry deferred architecture debt into the Food Delivery Evolution track and watch pressures escalate over stages.',
      },
      stages: [
        {
          id: 's0',
          dayLabel: 'Week 0',
          title: 'MVP allocation',
          narrative:
            'Allocate up to 8 points. You may reserve some for future uncertainty. Defer pressures you accept as debt.',
        },
        {
          id: 's1',
          dayLabel: 'Month 3',
          title: 'Traffic spike',
          narrative:
            'Orders hit 1M/day. Caching helps if you bought it. The database pressure escalates if left as debt.',
          budgetDelta: 2,
          revealMetrics: { ordersPerDay: 1_000_000, latencyMs: 420 },
          debtEscalations: [
            {
              pressureId: 'db-bottleneck',
              fromSeverity: 'high',
              toSeverity: 'critical',
            },
          ],
          newPriorities: [
            {
              id: 'scale-reads',
              label: 'Read path scalability',
              weight: 'critical',
              coveredByTags: ['cache', 'db-load', 'scalability'],
            },
          ],
        },
        {
          id: 's2',
          dayLabel: 'Month 6',
          title: 'Five payment providers',
          narrative:
            'Business wants Razorpay, PayPal, and more. Payment if/else debt surfaces. Reserved points can still help.',
          budgetDelta: 0,
          newPressures: [
            {
              id: 'multi-pay',
              label: 'Multi-provider payments',
              severity: 'high',
              addressedByTags: ['payment', 'extensibility'],
              addressedByInvestmentIds: ['pay-abs'],
            },
          ],
          debtEscalations: [
            {
              pressureId: 'pay-coupling',
              fromSeverity: 'medium',
              toSeverity: 'high',
            },
          ],
        },
      ],
    },
  },
  {
    type: 'budget' as const,
    slug: 'ecommerce-checkout-budget',
    title: 'E-Commerce Checkout',
    description: '50K orders/day, 99.9% availability, 8 points — prioritize reliability.',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 2,
    tags: ['budget', 'checkout', 'ecommerce'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-checkout', 'Checkout', 40, 80, ['submit']),
        node('n2', 'el-order', 'OrderService', 260, 80, ['place']),
        node('n3', 'el-pay', 'PaymentService', 480, 80, ['charge']),
        node('n4', 'el-db', 'Database', 480, 240, ['persist']),
      ],
      edges: [
        edge('e1', 'ed-c-o', 'n1', 'n2'),
        edge('e2', 'ed-o-p', 'n2', 'n3'),
        edge('e3', 'ed-p-d', 'n3', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Checkout → OrderService → PaymentService → Database.\n\n' +
        'Requirements\n' +
        '50K orders/day · Stripe only · 99.9% availability · 4-person team.\n\n' +
        'Budget\n' +
        '8 Architecture Points. Example trap: PaymentGateway(2)+Retry(2)+Cache(2)+Queue(3)=9 — you must cut.',
      scenario: 'E-commerce checkout under reliability pressure. Stripe only for now.',
      difficultyMode: 'beginner',
      budget: {
        kind: 'points',
        total: 8,
        reserveAllowed: true,
        unitLabel: 'Architecture Points',
      },
      suggestedReserve: 2,
      priorities: [
        {
          id: 'availability',
          label: '99.9% availability',
          weight: 'critical',
          coveredByTags: ['reliability', 'checkout'],
        },
        {
          id: 'payment-ext',
          label: 'Payment extensibility',
          weight: 'medium',
          coveredByTags: ['payment', 'extensibility'],
        },
        {
          id: 'latency',
          label: 'Checkout latency',
          weight: 'high',
          coveredByTags: ['cache', 'latency', 'queue'],
        },
      ],
      pressures: [
        {
          id: 'pay-flaky',
          label: 'Flaky payment provider',
          severity: 'high',
          addressedByTags: ['reliability', 'payment'],
        },
        {
          id: 'db-load',
          label: 'Database load',
          severity: 'medium',
          addressedByTags: ['cache', 'db-load'],
        },
      ],
      investments: FOOD_INVESTMENTS.filter(i =>
        ['pay-abs', 'pay-ifelse', 'cache', 'queue', 'circuit', 'db-replica', 'svc-extract', 'event-bus'].includes(
          i.id,
        ),
      ),
      constraints: { maxNewClasses: 3, teamSize: 4, deadlineDays: 14 },
      grading: { opportunityCostEnabled: true },
      stages: [
        {
          id: 's0',
          dayLabel: 'Launch week',
          title: 'Pre-launch spend',
          narrative: 'Spend wisely before launch. Reserve is allowed for Razorpay later.',
        },
        {
          id: 's1',
          dayLabel: 'Month 2',
          title: 'Razorpay required',
          narrative: 'Second payment provider arrives. Reserved points can fund PaymentGateway.',
          budgetDelta: 0,
          newPriorities: [
            {
              id: 'multi-pay',
              label: 'Multi-provider payments',
              weight: 'critical',
              coveredByTags: ['payment', 'extensibility'],
            },
          ],
        },
      ],
    },
  },
  {
    type: 'budget' as const,
    slug: 'infra-dollar-budget',
    title: 'Infra $ Budget',
    description: '$500/month infra budget — Redis, queues, and replicas compete for cash.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 3,
    tags: ['budget', 'infra', 'cost'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-api', 'ApiGateway', 40, 80, ['route']),
        node('n2', 'el-app', 'AppService', 280, 80, ['handle']),
        node('n3', 'el-db', 'PrimaryDb', 520, 80, ['query']),
      ],
      edges: [
        edge('e1', 'ed-a-s', 'n1', 'n2'),
        edge('e2', 'ed-s-d', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'Infrastructure Budget\n' +
        'You have $500/month. Every managed service has a bill. Spend where production pain is real.',
      scenario: 'Growing API with a hot primary database. Finance caps infra at $500/mo.',
      difficultyMode: 'advanced',
      budget: {
        kind: 'infra_usd',
        total: 500,
        reserveAllowed: true,
        unitLabel: '$/mo',
      },
      priorities: [
        {
          id: 'db-load',
          label: 'Reduce DB load',
          weight: 'critical',
          coveredByTags: ['cache', 'db-load'],
        },
        {
          id: 'async',
          label: 'Async side effects',
          weight: 'medium',
          coveredByTags: ['queue'],
        },
      ],
      pressures: [
        {
          id: 'db-bottleneck',
          label: 'Primary DB CPU',
          severity: 'critical',
          addressedByTags: ['cache', 'db-load'],
        },
      ],
      investments: [
        {
          id: 'redis',
          label: 'Redis cache',
          category: 'scalability',
          cost: 80,
          tags: ['cache', 'db-load'],
          benefits: ['↓ DB reads'],
          complexities: ['Invalidation'],
          risks: ['Stale data'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['AppService'],
        },
        {
          id: 'sqs',
          label: 'Managed queue',
          category: 'scalability',
          cost: 120,
          tags: ['queue'],
          benefits: ['Async workers'],
          complexities: ['Consumer ops'],
          risks: ['Lag'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['AppService'],
        },
        {
          id: 'replica',
          label: 'DB read replica',
          category: 'scalability',
          cost: 200,
          tags: ['db-load', 'reporting'],
          benefits: ['Offload primary'],
          complexities: ['Lag'],
          risks: ['Cost'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['PrimaryDb'],
        },
        {
          id: 'kafka',
          label: 'Event streaming',
          category: 'extensibility',
          cost: 250,
          tags: ['events', 'scalability'],
          benefits: ['Fan-out'],
          complexities: ['Ops heavy'],
          risks: ['Overkill'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['AppService'],
        },
      ],
      grading: { opportunityCostEnabled: true },
      stages: [
        {
          id: 's0',
          dayLabel: 'This month',
          title: 'Infra allocation',
          narrative: 'Pick managed services within $500/mo. Reserve cash if unsure.',
        },
      ],
    },
  },
  {
    type: 'budget' as const,
    slug: 'engineer-days-budget',
    title: 'Engineer-Days Budget',
    description: '20 engineer-days before launch — prioritize implementation effort.',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 4,
    tags: ['budget', 'engineering', 'time'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-web', 'WebApp', 40, 80, ['submit']),
        node('n2', 'el-api', 'BackendApi', 280, 80, ['process']),
        node('n3', 'el-pay', 'StripeClient', 520, 80, ['charge']),
      ],
      edges: [
        edge('e1', 'ed-w-a', 'n1', 'n2'),
        edge('e2', 'ed-a-p', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'Engineering Budget\n' +
        '20 engineer-days until launch. Caching is cheap; DB replication is not.',
      scenario: 'Pre-launch crunch. Prefer high-leverage, low-day investments.',
      difficultyMode: 'intermediate',
      auctionMode: false,
      budget: {
        kind: 'engineer_days',
        total: 20,
        reserveAllowed: true,
        unitLabel: 'Engineer-Days',
      },
      priorities: [
        {
          id: 'launch',
          label: 'Ship on time',
          weight: 'critical',
          coveredByTags: ['reliability', 'cache'],
        },
        {
          id: 'pay-flex',
          label: 'Payment flexibility',
          weight: 'medium',
          coveredByTags: ['payment'],
        },
      ],
      pressures: [
        {
          id: 'time',
          label: 'Schedule risk',
          severity: 'high',
          addressedByTags: ['reliability', 'cache'],
        },
      ],
      investments: [
        {
          id: 'cache-3',
          label: 'Caching',
          category: 'scalability',
          cost: 3,
          tags: ['cache'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['BackendApi'],
          benefits: ['Fast win'],
          complexities: ['Invalidation'],
          risks: ['Low'],
        },
        {
          id: 'pay-4',
          label: 'Payment abstraction',
          category: 'extensibility',
          cost: 4,
          tags: ['payment'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['StripeClient'],
          benefits: ['Provider swap'],
          complexities: ['Design time'],
          risks: ['Scope creep'],
        },
        {
          id: 'queue-6',
          label: 'Queue',
          category: 'scalability',
          cost: 6,
          tags: ['queue'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['BackendApi'],
          benefits: ['Async'],
          complexities: ['Workers'],
          risks: ['Medium'],
        },
        {
          id: 'replica-8',
          label: 'DB replication',
          category: 'scalability',
          cost: 8,
          tags: ['db-load'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['BackendApi'],
          benefits: ['Scale reads'],
          complexities: ['Ops'],
          risks: ['May miss launch'],
        },
      ],
      constraints: { deadlineDays: 20, teamSize: 3 },
      grading: { opportunityCostEnabled: true },
      stages: [
        {
          id: 's0',
          dayLabel: 'Sprint',
          title: 'Pre-launch engineering spend',
          narrative: 'Allocate up to 20 engineer-days.',
        },
      ],
    },
  },
  {
    type: 'budget' as const,
    slug: 'expert-auction-budget',
    title: 'Architecture Auction (Expert)',
    description: 'Propose your own investments with estimated cost — scarcity simulated.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'ultimate' as const,
    order: 5,
    tags: ['budget', 'expert', 'auction'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-mono', 'Monolith', 200, 100, ['handleEverything']),
      ],
      edges: [],
    },
    payload: {
      briefing:
        'Expert mode\n' +
        'No fixed menu required — pick from the catalog and/or propose custom investments with your own cost estimates.',
      scenario: 'You inherit a monolith. 10 tokens. Auction framing: build the highest-value architecture you can afford.',
      difficultyMode: 'expert',
      auctionMode: true,
      auctionBlurb: 'Tokens are scarce. Bid cost honestly — the grade checks reasoning, not perfection.',
      budget: {
        kind: 'points',
        total: 10,
        reserveAllowed: true,
        unitLabel: 'Tokens',
      },
      priorities: [
        {
          id: 'modularity',
          label: 'Modularity',
          weight: 'high',
          coveredByTags: ['maintainability', 'extensibility'],
        },
        {
          id: 'reliability',
          label: 'Reliability',
          weight: 'critical',
          coveredByTags: ['reliability'],
        },
      ],
      pressures: [
        {
          id: 'mono',
          label: 'Monolith gravity',
          severity: 'high',
          addressedByTags: ['maintainability', 'extensibility'],
        },
      ],
      investments: [
        {
          id: 'retry',
          label: 'Retry policy',
          category: 'reliability',
          cost: 1,
          costMin: 1,
          costMax: 3,
          tags: ['reliability'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['Monolith'],
          benefits: ['Transient fault tolerance'],
          complexities: ['Idempotency'],
          risks: ['Low'],
        },
        {
          id: 'module',
          label: 'Module boundary',
          category: 'maintainability',
          cost: 3,
          costMin: 2,
          costMax: 5,
          tags: ['maintainability'],
          whyOptions: WHY_COMMON,
          appliesToHints: ['Monolith'],
          benefits: ['Clear seams'],
          complexities: ['Refactor cost'],
          risks: ['Medium'],
        },
      ],
      grading: { opportunityCostEnabled: true },
      stages: [
        {
          id: 's0',
          dayLabel: 'Auction',
          title: 'Token spend',
          narrative: 'Select catalog items and/or add custom investments with estimated costs.',
        },
      ],
    },
  },
  {
    type: 'budget' as const,
    slug: 'food-budget-evolution-combo',
    title: 'Food Delivery: Budget → Evolution',
    description:
      'Allocate MVP budget first, then hand deferred debt into Architecture Evolution.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 6,
    tags: ['budget', 'evolution', 'combo', 'food-delivery'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-customer', 'Customer', 40, 40, ['placeOrder']),
        node('n2', 'el-order', 'OrderService', 280, 40, ['create', 'confirm']),
        node('n3', 'el-pay', 'PaymentService', 280, 200, ['charge']),
        node('n4', 'el-db', 'Database', 520, 200, ['write', 'read']),
        node('n5', 'el-catalog', 'RestaurantCatalog', 520, 40, ['listMenus']),
      ],
      edges: [
        edge('e1', 'ed-c-o', 'n1', 'n2'),
        edge('e2', 'ed-o-p', 'n2', 'n3'),
        edge('e3', 'ed-p-d', 'n3', 'n4'),
        edge('e4', 'ed-o-d', 'n2', 'n4'),
        edge('e5', 'ed-o-cat', 'n2', 'n5'),
      ],
    },
    payload: {
      briefing:
        'Combined journey\n' +
        '1) Spend 8 Architecture Points for the MVP.\n' +
        '2) Defer what you accept as debt.\n' +
        '3) Continue those debts in Architecture Evolution (Food Delivery).',
      scenario:
        'Same Food Delivery MVP constraints — then evolve the design as traffic and providers grow.',
      difficultyMode: 'intermediate',
      comboMode: true,
      comboBlurb: 'Budget allocation feeds Evolution — deferred debt becomes the next journey.',
      budget: {
        kind: 'points',
        total: 8,
        reserveAllowed: true,
        unitLabel: 'Architecture Points',
      },
      suggestedReserve: 2,
      priorities: [
        {
          id: 'checkout',
          label: 'Checkout reliability',
          weight: 'critical',
          coveredByTags: ['reliability', 'checkout', 'payment'],
        },
        {
          id: 'payment-ext',
          label: 'Payment extensibility',
          weight: 'medium',
          coveredByTags: ['payment', 'extensibility'],
        },
        {
          id: 'notify-lat',
          label: 'Notification latency',
          weight: 'low',
          coveredByTags: ['notifications', 'queue'],
        },
      ],
      pressures: [
        {
          id: 'db-bottleneck',
          label: 'Database bottleneck',
          severity: 'high',
          addressedByTags: ['cache', 'db-load', 'scalability'],
        },
        {
          id: 'pay-coupling',
          label: 'Payment coupling',
          severity: 'medium',
          addressedByTags: ['payment', 'extensibility'],
          addressedByInvestmentIds: ['pay-abs', 'pay-ifelse'],
        },
      ],
      investments: FOOD_INVESTMENTS,
      constraints: {
        maxNewClasses: 4,
        maxExternalSystems: 1,
        teamSize: 4,
        deadlineDays: 21,
        maxNewAbstractions: 3,
      },
      grading: { opportunityCostEnabled: true, inflationSensitivity: 0.5 },
      evolutionHooks: {
        linkedEvolutionSlug: 'evo-food-delivery',
        debtPressureMap: {
          'db-bottleneck': 'debt-db-bottleneck',
          'pay-coupling': 'debt-payment-coupling',
        },
        handoffBlurb:
          'Open Evolution with the same Food Delivery baseline — your deferred debts are the pressures to evolve next.',
      },
      stages: [
        {
          id: 's0',
          dayLabel: 'Budget phase',
          title: 'MVP spend',
          narrative: 'Allocate points now. Anything deferred becomes Evolution input.',
        },
        {
          id: 's1',
          dayLabel: 'Handoff',
          title: 'Ready for Evolution',
          narrative:
            'Review reserves and debt. After this stage, continue in Architecture Evolution.',
          budgetDelta: 0,
        },
      ],
    },
  },
]

async function main() {
  await connectDB()
  let upserted = 0
  for (const pack of PACKS) {
    await ChallengePack.findOneAndUpdate(
      { slug: pack.slug },
      { $set: pack },
      { upsert: true, new: true },
    )
    upserted += 1
    console.log(`upserted ${pack.slug}`)
  }
  console.log(`Done. ${upserted} budget packs.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
