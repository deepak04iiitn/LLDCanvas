/**
 * Seed Architecture Microscope investigate packs.
 * Run: npx tsx src/scripts/seed-studio-microscope.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

function method(name: string, visibility: 'public' | 'private' = 'public') {
  return {
    name,
    returnType: 'void',
    params: [] as { name: string; type: string }[],
    visibility,
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
    data: {
      elementId,
      nodeType,
      name,
      stereotype,
      attributes: [],
      methods,
    },
  }
}

function edge(
  id: string,
  elementId: string,
  source: string,
  target: string,
  relationshipType = 'dependency',
  label?: string,
) {
  return {
    id,
    source,
    target,
    sourceHandle: 'bottom',
    targetHandle: 'top',
    type: relationshipType,
    data: {
      elementId,
      relationshipType,
      label,
      lineStyle: 'step' as const,
    },
  }
}

const meta = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

const FOOD_DIAGRAM = {
  version: 1,
  meta,
  nodes: [
    node('n1', 'el-ctrl', 'OrderController', 40, 40, [method('placeOrder')], 'class', 'controller'),
    node(
      'n2',
      'el-order',
      'OrderService',
      280,
      40,
      [
        method('createOrder'),
        method('cancelOrder'),
        method('calculateTotal'),
        method('reserveInventory'),
        method('processPayment'),
        method('sendNotification'),
        method('persistOrder', 'private'),
      ],
      'class',
      'application',
    ),
    node('n3', 'el-pay', 'PaymentService', 280, 220, [method('charge'), method('refund')], 'class'),
    node('n4', 'el-inv', 'InventoryService', 520, 40, [method('reserve')], 'class'),
    node('n5', 'el-notif', 'NotificationService', 520, 220, [method('notify')], 'class'),
    node('n6', 'el-gw', 'PaymentGateway', 280, 380, [method('pay'), method('refund')], 'interface'),
    node('n7', 'el-stripe', 'StripeGateway', 80, 520, [method('pay'), method('refund')], 'class', 'infrastructure'),
    node('n8', 'el-razor', 'RazorpayGateway', 480, 520, [method('pay')], 'class', 'infrastructure'),
    node('n9', 'el-repo', 'OrderRepository', 40, 220, [method('save'), method('find')], 'class', 'infrastructure'),
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
    edge('e9', 'ed-9', 'n9', 'n2'), // cycle hint: repo → order
    edge('e10', 'ed-10', 'n3', 'n7', 'dependency', 'create'),
  ],
}

const PACKS = [
  {
    type: 'microscope' as const,
    slug: 'micro-payment-coupling',
    title: 'Investigate: PaymentService Coupling',
    description: 'PaymentService has unexpectedly high fan-out. Trace why.',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 1,
    tags: ['microscope', 'coupling', 'payment'],
    diagramSnapshot: FOOD_DIAGRAM,
    payload: {
      briefing:
        'PaymentService appears tightly coupled. Use Dependency and Abstraction lenses — do not stop at the first hop.',
      prompt: 'Why does PaymentService have multiple outgoing dependencies? Which dependency creates the strongest concrete coupling?',
      answerMode: 'pick_element',
      expectedHints: ['el-gw', 'el-stripe', 'StripeGateway', 'PaymentGateway'],
      starterFocusId: 'el-pay',
      suggestedLens: 'dependencies',
      creationEdges: [{ from: 'el-pay', to: 'el-stripe' }],
      flows: [
        {
          id: 'checkout',
          label: 'Place Order',
          entryMethod: 'placeOrder',
          steps: [
            { elementId: 'el-ctrl', note: 'HTTP entry' },
            { elementId: 'el-order', note: 'orchestrates' },
            { elementId: 'el-inv' },
            { elementId: 'el-pay' },
            { elementId: 'el-gw' },
            { elementId: 'el-stripe', note: 'concrete provider' },
            { elementId: 'el-notif' },
          ],
        },
      ],
      layers: {
        'el-ctrl': 'presentation',
        'el-order': 'application',
        'el-pay': 'application',
        'el-inv': 'application',
        'el-notif': 'application',
        'el-gw': 'domain',
        'el-stripe': 'infrastructure',
        'el-razor': 'infrastructure',
        'el-repo': 'infrastructure',
      },
      grading: { soft: true },
    },
  },
  {
    type: 'microscope' as const,
    slug: 'micro-orderservice-cohesion',
    title: 'Investigate: OrderService Responsibilities',
    description: 'OrderService spans many domains. Chart cohesion without being told “god class”.',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 2,
    tags: ['microscope', 'cohesion', 'responsibility'],
    diagramSnapshot: FOOD_DIAGRAM,
    payload: {
      briefing: 'Open Responsibilities and Cohesion on OrderService. Count domains — then decide.',
      prompt:
        'Which domains does OrderService span? Pick the component that concentrates the most cross-domain work.',
      answerMode: 'pick_element',
      expectedHints: ['el-order', 'OrderService', 'payment', 'inventory', 'notification'],
      starterFocusId: 'el-order',
      suggestedLens: 'responsibilities',
      grading: { soft: true },
    },
  },
  {
    type: 'microscope' as const,
    slug: 'micro-cycle-walk',
    title: 'Investigate: Trace the Cycle',
    description: 'A directed cycle hides between OrderService and OrderRepository. Walk it.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 3,
    tags: ['microscope', 'cycles'],
    diagramSnapshot: FOOD_DIAGRAM,
    payload: {
      briefing: 'Use the Cycles lens. Trace A → B → A — do not just read “cycle detected”.',
      prompt: 'Which two components form a directed cycle? Select either participant.',
      answerMode: 'pick_element',
      expectedHints: ['el-order', 'el-repo', 'OrderService', 'OrderRepository'],
      starterFocusId: 'el-order',
      suggestedLens: 'cycles',
      grading: { soft: true },
    },
  },
  {
    type: 'microscope' as const,
    slug: 'micro-abstraction-leak',
    title: 'Investigate: Abstraction Boundary',
    description: 'PaymentGateway is an interface — but something still creates StripeGateway.',
    difficulty: 'hard' as const,
    status: 'published' as const,
    planMin: 'pro' as const,
    order: 4,
    tags: ['microscope', 'abstraction', 'creation'],
    diagramSnapshot: FOOD_DIAGRAM,
    payload: {
      briefing: 'Compare Abstraction vs Creation lenses. Who uses the interface vs who creates the concrete type?',
      prompt: 'Which component creates StripeGateway while PaymentService depends on PaymentGateway?',
      answerMode: 'pick_element',
      expectedHints: ['el-pay', 'el-stripe', 'PaymentService', 'create'],
      starterFocusId: 'el-gw',
      suggestedLens: 'creation',
      creationEdges: [{ from: 'el-pay', to: 'el-stripe' }],
      grading: { soft: true },
    },
  },
  {
    type: 'microscope' as const,
    slug: 'micro-layer-illegal',
    title: 'Investigate: Layer Crossing',
    description: 'Find a questionable dependency across architecture layers.',
    difficulty: 'medium' as const,
    status: 'published' as const,
    planMin: 'free' as const,
    order: 5,
    tags: ['microscope', 'layers'],
    diagramSnapshot: FOOD_DIAGRAM,
    payload: {
      briefing: 'Open Layers lens. Look for presentation/application reaching into infrastructure concretions.',
      prompt: 'Which infrastructure component is reached from application payment code?',
      answerMode: 'pick_element',
      expectedHints: ['el-stripe', 'StripeGateway', 'infrastructure'],
      starterFocusId: 'el-pay',
      suggestedLens: 'layers',
      layers: {
        'el-ctrl': 'presentation',
        'el-order': 'application',
        'el-pay': 'application',
        'el-stripe': 'infrastructure',
        'el-gw': 'domain',
      },
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
  console.log(`Done. ${n} microscope packs.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
