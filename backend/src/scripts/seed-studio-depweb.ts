/**
 * Seed Dependency Web investigate packs.
 * Run: npx tsx src/scripts/seed-studio-depweb.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

function method(name: string) {
  return {
    name,
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
  methods: ReturnType<typeof method>[] = [],
  nodeType = 'class',
  stereotype?: string,
) {
  return {
    id,
    position: { x, y },
    data: { elementId, nodeType, name, stereotype, attributes: [], methods },
  }
}

function edge(
  id: string,
  elementId: string,
  source: string,
  target: string,
  relationshipType = 'dependency',
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

const DIAGRAM = {
  version: 1,
  meta,
  nodes: [
    node('n1', 'el-ctrl', 'OrderController', 40, 40, [method('placeOrder')], 'class', 'controller'),
    node('n2', 'el-order', 'OrderService', 280, 40, [method('createOrder')], 'class', 'application'),
    node('n3', 'el-pay', 'PaymentService', 280, 220, [method('charge')], 'class', 'application'),
    node('n4', 'el-inv', 'InventoryService', 520, 40, [method('reserve')], 'class'),
    node('n5', 'el-notif', 'NotificationService', 520, 220, [method('notify')], 'class'),
    node('n6', 'el-gw', 'PaymentGateway', 280, 380, [method('pay')], 'interface', 'domain'),
    node('n7', 'el-stripe', 'StripeGateway', 80, 520, [method('pay')], 'class', 'infrastructure'),
    node('n8', 'el-razor', 'RazorpayGateway', 480, 520, [method('pay')], 'class', 'infrastructure'),
    node('n9', 'el-repo', 'OrderRepository', 40, 220, [method('save')], 'class', 'infrastructure'),
    node('n10', 'el-stripe-sdk', 'Stripe', 80, 660, [], 'class', 'external'),
  ],
  edges: [
    edge('e1', 'ed-1', 'n1', 'n2'),
    edge('e2', 'ed-2', 'n2', 'n3'),
    edge('e3', 'ed-3', 'n2', 'n4'),
    edge('e4', 'ed-4', 'n2', 'n5'),
    edge('e5', 'ed-5', 'n2', 'n9'),
    edge('e6', 'ed-6', 'n3', 'n6'),
    edge('e7', 'ed-7', 'n7', 'n6', 'realization'),
    edge('e8', 'ed-8', 'n8', 'n6', 'realization'),
    edge('e9', 'ed-9', 'n9', 'n2'),
    edge('e10', 'ed-10', 'n7', 'n10'),
    edge('e11', 'ed-11', 'n3', 'n7'),
  ],
}

const LAYERS = {
  'el-ctrl': 'presentation',
  'el-order': 'application',
  'el-pay': 'application',
  'el-inv': 'application',
  'el-notif': 'application',
  'el-gw': 'domain',
  'el-stripe': 'infrastructure',
  'el-razor': 'infrastructure',
  'el-repo': 'infrastructure',
  'el-stripe-sdk': 'infrastructure',
}

const FLOWS = [
  {
    id: 'checkout',
    label: 'Checkout',
    steps: [
      { elementId: 'el-ctrl' },
      { elementId: 'el-order' },
      { elementId: 'el-pay' },
      { elementId: 'el-gw' },
      { elementId: 'el-stripe' },
      { elementId: 'el-stripe-sdk' },
    ],
  },
]

const PACKS = [
  {
    type: 'depweb' as const,
    slug: 'depweb-hub-indegree',
    title: 'Find the most depended-on component',
    description: 'Which node has the highest incoming dependency concentration?',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 1,
    tags: ['depweb', 'hubs'],
    diagramSnapshot: DIAGRAM,
    payload: {
      briefing: 'Open Hotspots or inspect in-degrees. Soft evidence — pick the hub.',
      prompt: 'Which component is most depended on (highest in-degree)?',
      answerMode: 'pick_element',
      expectedHints: ['el-gw', 'PaymentGateway', 'el-order', 'OrderService'],
      suggestedLens: 'hotspots',
      layers: LAYERS,
      flows: FLOWS,
      grading: { soft: true },
    },
  },
  {
    type: 'depweb' as const,
    slug: 'depweb-cycle-order',
    title: 'Find cycles involving OrderService',
    description: 'Trace the directed cycle through OrderService.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 2,
    tags: ['depweb', 'cycles'],
    diagramSnapshot: DIAGRAM,
    payload: {
      briefing: 'Use the Cycles lens. Walk A → B → A.',
      prompt: 'Select a component that participates in a cycle with OrderService.',
      answerMode: 'pick_element',
      expectedHints: ['el-order', 'el-repo', 'OrderService', 'OrderRepository'],
      starterFocusId: 'el-order',
      suggestedLens: 'cycles',
      layers: LAYERS,
      grading: { soft: true },
    },
  },
  {
    type: 'depweb' as const,
    slug: 'depweb-blast-gateway',
    title: 'Blast radius: PaymentGateway changes',
    description: 'What gets affected if PaymentGateway changes?',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 3,
    tags: ['depweb', 'blast'],
    diagramSnapshot: DIAGRAM,
    payload: {
      briefing: 'Select PaymentGateway → Blast Radius / Simulate Change.',
      prompt: 'Which application service sits in the blast radius of PaymentGateway?',
      answerMode: 'pick_element',
      expectedHints: ['el-pay', 'PaymentService', 'el-order', 'OrderService'],
      starterFocusId: 'el-gw',
      suggestedLens: 'blast',
      layers: LAYERS,
      flows: FLOWS,
      grading: { soft: true },
    },
  },
  {
    type: 'depweb' as const,
    slug: 'depweb-path-checkout-stripe',
    title: 'Shortest path: OrderController → Stripe',
    description: 'How does checkout reach the Stripe SDK?',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 4,
    tags: ['depweb', 'paths'],
    diagramSnapshot: DIAGRAM,
    payload: {
      briefing: 'Use Paths lens: from OrderController to Stripe.',
      prompt: 'Name a hop on the shortest path from OrderController to Stripe.',
      answerMode: 'pick_element',
      expectedHints: [
        'el-ctrl',
        'el-order',
        'el-pay',
        'el-gw',
        'el-stripe',
        'el-stripe-sdk',
        'PaymentService',
        'Stripe',
      ],
      pathQuery: { from: 'OrderController', to: 'Stripe' },
      suggestedLens: 'paths',
      layers: LAYERS,
      externalIds: ['el-stripe-sdk'],
      grading: { soft: true },
    },
  },
  {
    type: 'depweb' as const,
    slug: 'depweb-layer-violation',
    title: 'Domain / Infrastructure crossing',
    description: 'Find a dependency that crosses into infrastructure concretions.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 5,
    tags: ['depweb', 'layers'],
    diagramSnapshot: DIAGRAM,
    payload: {
      briefing: 'Open Layers lens. Look for application → concrete infrastructure.',
      prompt: 'Which infrastructure component is reached from PaymentService?',
      answerMode: 'pick_element',
      expectedHints: ['el-stripe', 'StripeGateway', 'el-stripe-sdk', 'Stripe'],
      starterFocusId: 'el-pay',
      suggestedLens: 'layers',
      layers: LAYERS,
      externalIds: ['el-stripe-sdk'],
      grading: { soft: true },
    },
  },
  {
    type: 'depweb' as const,
    slug: 'depweb-out-degree',
    title: 'Highest outgoing dependency count',
    description: 'Which component depends on the most peers?',
    difficulty: 'easy' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 6,
    tags: ['depweb', 'hubs'],
    diagramSnapshot: DIAGRAM,
    payload: {
      briefing: 'Hotspots → high out, or inspect OrderService.',
      prompt: 'Which component has the highest outgoing dependency count?',
      answerMode: 'pick_element',
      expectedHints: ['el-order', 'OrderService'],
      suggestedLens: 'hotspots',
      layers: LAYERS,
      grading: { soft: true },
    },
  },
]

async function main() {
  await connectDB()
  let n = 0
  for (const pack of PACKS) {
    await ChallengePack.findOneAndUpdate({ slug: pack.slug }, { $set: pack }, { upsert: true, new: true })
    n += 1
    console.log(`upserted ${pack.slug}`)
  }
  console.log(`Done. ${n} depweb packs.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
