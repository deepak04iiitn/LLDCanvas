/**
 * Seed Design Studio refactor packs (idempotent by slug).
 * Also upgrades legacy refactor packs already in Mongo with behavior contracts.
 *
 * Run: npx tsx src/scripts/seed-studio-refactor.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

type MethodSpec =
  | string
  | {
      name: string
      returnType?: string
      params?: { name: string; type: string }[]
      visibility?: 'public' | 'private' | 'protected'
      isStatic?: boolean
      isAbstract?: boolean
    }

function method(m: MethodSpec) {
  if (typeof m === 'string') {
    return {
      name: m,
      returnType: 'void',
      params: [] as { name: string; type: string }[],
      visibility: 'public' as const,
      isStatic: false,
      isAbstract: false,
    }
  }
  return {
    name: m.name,
    returnType: m.returnType ?? 'void',
    params: m.params ?? [],
    visibility: m.visibility ?? 'public',
    isStatic: m.isStatic ?? false,
    isAbstract: m.isAbstract ?? false,
  }
}

function node(
  id: string,
  elementId: string,
  name: string,
  x: number,
  y: number,
  methods: MethodSpec[] = [],
  attrs: { name: string; type: string; visibility?: string }[] = [],
  nodeType: string = 'class',
) {
  return {
    id,
    position: { x, y },
    data: {
      elementId,
      nodeType,
      name,
      attributes: attrs.map(a => ({
        name: a.name,
        type: a.type,
        visibility: a.visibility ?? 'private',
      })),
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
  sourceHandle = 'bottom',
  targetHandle = 'top',
) {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: relationshipType,
    data: { elementId, relationshipType, lineStyle: 'step' as const },
  }
}

const meta = { theme: 'light' as const, zoom: 1, panX: 0, panY: 0 }

const PACKS = [
  {
    type: 'refactor' as const,
    slug: 'ref-food-order-manager',
    title: 'Food Delivery Order Flow',
    difficulty: 'medium' as const,
    description:
      'A food-delivery OrderManager does too many jobs at once. Split it into clearer pieces without losing checkout behavior.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 1,
    tags: ['order', 'extract', 'food-delivery'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node(
          'n1',
          'el-om',
          'OrderManager',
          280,
          40,
          [
            'createOrder',
            'cancelOrder',
            'calculatePrice',
            'processPayment',
            'refundPayment',
            'updateInventory',
            'sendEmail',
            'saveOrder',
            'generateInvoice',
          ],
        ),
        node('n2', 'el-pay', 'Payment', 40, 260, ['charge', 'refund']),
        node('n3', 'el-inv', 'Inventory', 280, 260, ['reserve', 'release']),
        node('n4', 'el-notif', 'Notification', 520, 260, ['sendEmail']),
        node('n5', 'el-rz', 'Razorpay', 40, 420, ['createPayment']),
        node('n6', 'el-mongo', 'MongoDB', 280, 420, ['save', 'find']),
        node('n7', 'el-email', 'Email', 520, 420, ['deliver']),
      ],
      edges: [
        edge('e1', 'ed-om-pay', 'n1', 'n2'),
        edge('e2', 'ed-om-inv', 'n1', 'n3'),
        edge('e3', 'ed-om-notif', 'n1', 'n4'),
        edge('e4', 'ed-pay-rz', 'n2', 'n5'),
        edge('e5', 'ed-inv-mongo', 'n3', 'n6'),
        edge('e6', 'ed-notif-email', 'n4', 'n7'),
        edge('e7', 'ed-om-mongo', 'n1', 'n6'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'You inherited a food-delivery checkout design. The big box is OrderManager. Look at its method list: create, cancel, price, pay, refund, inventory, email, save, invoice. One class is trying to run the whole kitchen.\n\n' +
        'The problem (simple terms)\n' +
        'When one class owns every concern, every small product change means editing the same giant class — and bugs in email can break payment, and so on.\n\n' +
        'What you should do\n' +
        'On the right canvas, improve the structure. Split responsibilities into smaller collaborators if that helps. Keep the behaviors the system already has.\n\n' +
        'Where to start\n' +
        'Read OrderManager’s methods, then follow the arrows to Payment, Inventory, and Notification. Don’t wipe the diagram and redraw from scratch.',
      requirements: [
        'Order creation',
        'Payment processing',
        'Inventory reservation',
        'Order cancellation',
        'Notifications',
      ],
      constraints: [
        'Do not remove functionality',
        'Existing behavior must remain',
        'Reduce unnecessary coupling',
        'Do not introduce more than 4 new abstractions',
      ],
      behaviorContract: {
        flows: [
          {
            id: 'create-order',
            label: 'Create Order',
            steps: [
              'Validate / create order',
              'Reserve inventory',
              'Process payment',
              'Persist order',
              'Notify customer',
            ],
            mustKeepElementNames: ['OrderManager'],
            mustReach: [
              { from: 'OrderManager', to: 'Inventory' },
              { from: 'OrderManager', to: 'Payment' },
            ],
            mustHavePathTopics: ['notif', 'email', 'payment', 'inventory'],
          },
          {
            id: 'cancel-order',
            label: 'Cancel Order',
            steps: ['Refund payment', 'Release inventory', 'Notify customer'],
            mustHavePathTopics: ['refund', 'inventory', 'email'],
          },
        ],
      },
      maxNewAbstractions: 4,
      forbidDeleteElementNames: ['OrderManager'],
      scenario: 'extract',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-decouple-payment',
    title: 'Payment Provider Wiring',
    difficulty: 'easy' as const,
    description:
      'Payment is glued to Razorpay. Make providers swappable without rewriting Order or Payment each time.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 2,
    tags: ['payment', 'decouple'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 40, 100, ['checkout', 'getTotal']),
        node('n2', 'el-pay', 'Payment', 280, 80, ['charge', 'refund'], [
          { name: 'razorpayClient', type: 'Razorpay' },
        ]),
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
        'Order asks Payment to charge. Payment holds a field typed as Razorpay and points straight at the Razorpay class.\n\n' +
        'The problem (simple terms)\n' +
        'If product wants Stripe tomorrow, you will likely open Payment and rewrite it. High-level payment logic is glued to one vendor.\n\n' +
        'What you should do\n' +
        'Refactor so a new provider can plug in without rewriting Payment (and without touching Order’s role). Keep charge/refund possible.\n\n' +
        'Where to start\n' +
        'Look at the Payment → Razorpay arrow and the razorpayClient field. Ask: “What should Payment depend on instead of a concrete vendor?”',
      requirements: ['Checkout can still charge', 'Refund path remains possible'],
      constraints: [
        'Do not remove Order or Payment',
        'New providers should be easy to add',
        'Prefer at most 2 new abstractions',
      ],
      behaviorContract: {
        flows: [
          {
            id: 'charge',
            label: 'Charge',
            steps: ['Order initiates checkout', 'Payment processes charge'],
            mustKeepElementNames: ['Order', 'Payment'],
            mustReach: [{ from: 'Order', to: 'Payment' }],
            mustHavePathTopics: ['charge', 'payment'],
          },
        ],
      },
      maxNewAbstractions: 2,
      forbidDeleteElementNames: ['Order', 'Payment'],
      scenario: 'decouple',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-split-auth',
    title: 'Login Service Responsibilities',
    difficulty: 'medium' as const,
    description:
      'AuthService is a kitchen-sink: JWT, OAuth, MFA, sessions, and email. Split it while login still works.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 3,
    tags: ['auth', 'extract'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-app', 'AppController', 40, 120, ['login']),
        node('n2', 'el-auth', 'AuthService', 280, 40, [
          'login',
          'signup',
          'issueJwt',
          'verifyJwt',
          'oauthGoogle',
          'startMfa',
          'createSession',
          'sendWelcomeEmail',
        ]),
        node('n3', 'el-users', 'UserRepository', 560, 120, ['findByEmail', 'save']),
      ],
      edges: [
        edge('e1', 'ed-app-auth', 'n1', 'n2'),
        edge('e2', 'ed-auth-users', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'AppController calls AuthService.login(). Inside AuthService you’ll also find JWT issue/verify, Google OAuth, MFA, sessions, and welcome email.\n\n' +
        'The problem (simple terms)\n' +
        'Login, security tokens, third-party OAuth, and marketing email are different jobs. Mixing them makes AuthService hard to test and risky to change.\n\n' +
        'What you should do\n' +
        'Extract clearer collaborators. Keep a path where login still reaches UserRepository, and tokens/sessions still exist somewhere.\n\n' +
        'Where to start\n' +
        'Read AuthService’s method names. Group which ones are “identity,” which are “tokens/sessions,” and which are “side effects like email.”',
      requirements: ['Login still reaches user storage', 'Token or session concern remains somewhere'],
      constraints: ['Do not delete UserRepository', 'Prefer extracting collaborators over one mega rewrite'],
      behaviorContract: {
        flows: [
          {
            id: 'login',
            label: 'Login',
            steps: ['Controller calls auth', 'User looked up or saved'],
            mustKeepElementNames: ['AppController', 'UserRepository'],
            mustReach: [{ from: 'AppController', to: 'UserRepository' }],
            mustHavePathTopics: ['login', 'jwt', 'session'],
          },
        ],
      },
      maxNewAbstractions: 4,
      forbidDeleteElementNames: ['AppController', 'UserRepository'],
      scenario: 'extract',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-break-cycle',
    title: 'Checkout Service Triangle',
    difficulty: 'hard' as const,
    description:
      'Order, Inventory, and Pricing call each other in a loop. Break the cycle so checkout is still possible.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 4,
    tags: ['cycle', 'redesign'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-os', 'OrderService', 80, 40, ['place', 'reprice']),
        node('n2', 'el-is', 'InventoryService', 360, 40, ['reserve', 'suggestSubstitute']),
        node('n3', 'el-pe', 'PricingEngine', 220, 220, ['quote', 'applyStockPenalty']),
      ],
      edges: [
        edge('e1', 'ed-os-is', 'n1', 'n2'),
        edge('e2', 'ed-is-pe', 'n2', 'n3'),
        edge('e3', 'ed-pe-os', 'n3', 'n1'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Follow the arrows carefully: OrderService → InventoryService → PricingEngine → back to OrderService. That closed loop is the whole story of this challenge.\n\n' +
        'The problem (simple terms)\n' +
        'When A needs B, B needs C, and C needs A again, you can’t change or test one piece without dragging the others. Cycles also hide who is really in charge of checkout.\n\n' +
        'What you should do\n' +
        'Restructure so place/reserve/quote still work, but without that closed cycle. An orchestrator (or one-way flow) is a common approach.\n\n' +
        'Where to start\n' +
        'Find the PricingEngine → OrderService back-edge. Ask whether pricing really needs to own/call Order, or if someone else should coordinate.',
      requirements: ['Orders can still place', 'Inventory can still reserve', 'Pricing can still quote'],
      constraints: ['Prefer breaking the Pricing → Order back-edge', 'You may introduce an orchestrator'],
      behaviorContract: {
        flows: [
          {
            id: 'place',
            label: 'Place order',
            steps: ['Reserve stock', 'Get a price quote'],
            mustKeepElementNames: ['OrderService', 'InventoryService', 'PricingEngine'],
            mustHavePathTopics: ['reserve', 'quote', 'place'],
          },
        ],
      },
      maxNewAbstractions: 3,
      forbidDeleteElementNames: ['OrderService', 'InventoryService', 'PricingEngine'],
      scenario: 'redesign',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-report-exporters',
    title: 'Report Export Paths',
    difficulty: 'medium' as const,
    description:
      'ReportService grows a new method for every export format. Make formats plug-in style instead.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 5,
    tags: ['report', 'extract'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-dash', 'Dashboard', 40, 80, ['export']),
        node('n2', 'el-rep', 'ReportService', 280, 40, [
          'build',
          'toPdf',
          'toCsv',
          'toXlsx',
          'toHtml',
          'emailPdf',
        ]),
        node('n3', 'el-blob', 'BlobStore', 520, 80, ['put']),
      ],
      edges: [
        edge('e1', 'ed-dash-rep', 'n1', 'n2'),
        edge('e2', 'ed-rep-blob', 'n2', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'Dashboard asks ReportService to export. ReportService already has toPdf, toCsv, toXlsx, toHtml — and even emailPdf. Tomorrow product will want Markdown.\n\n' +
        'The problem (simple terms)\n' +
        'Every new format means editing ReportService again. The service knows too many concrete formats instead of “build report → export somehow.”\n\n' +
        'What you should do\n' +
        'Refactor so formats can plug in. Keep Dashboard able to request an export and keep storage (BlobStore) reachable.\n\n' +
        'Where to start\n' +
        'Count the toXxx methods. Imagine adding one more format — which class would you rather leave alone?',
      requirements: ['Dashboard can still request an export', 'Reports can still be stored'],
      constraints: ['Do not delete BlobStore', 'Prefer pluggable exporters over more toXxx methods'],
      behaviorContract: {
        flows: [
          {
            id: 'export',
            label: 'Export report',
            steps: ['Dashboard requests export', 'Report is built', 'Bytes stored'],
            mustKeepElementNames: ['Dashboard', 'BlobStore'],
            mustReach: [{ from: 'Dashboard', to: 'BlobStore' }],
            mustHavePathTopics: ['report', 'pdf', 'csv', 'export'],
          },
        ],
      },
      maxNewAbstractions: 3,
      forbidDeleteElementNames: ['Dashboard', 'BlobStore'],
      scenario: 'extract',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-notifier-channels',
    title: 'Notification Delivery Path',
    difficulty: 'easy' as const,
    description:
      'Notifier is wired straight to Email and SMS. Make a new channel possible without rewriting Notifier.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 6,
    tags: ['notifier', 'decouple'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-os', 'OrderService', 40, 100, ['confirm']),
        node('n2', 'el-notif', 'Notifier', 280, 80, ['notify', 'notifyUrgent']),
        node('n3', 'el-email', 'EmailService', 520, 20, ['sendEmail']),
        node('n4', 'el-sms', 'SmsService', 520, 180, ['sendSms']),
      ],
      edges: [
        edge('e1', 'ed-os-notif', 'n1', 'n2'),
        edge('e2', 'ed-notif-email', 'n2', 'n3'),
        edge('e3', 'ed-notif-sms', 'n2', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'After confirm, OrderService asks Notifier to message the user. Notifier points at EmailService and SmsService as concrete classes.\n\n' +
        'The problem (simple terms)\n' +
        'Adding WhatsApp (or push) means editing Notifier again and wiring another concrete dependency. Channels are not treated as interchangeable.\n\n' +
        'What you should do\n' +
        'Refactor so channels are easier to evolve. Keep OrderService able to trigger a notification somehow.\n\n' +
        'Where to start\n' +
        'Look at Notifier’s outgoing arrows. Ask what shared idea Email and SMS both represent.',
      requirements: ['Order confirmation can still notify'],
      constraints: ['Do not delete OrderService', 'At most 2 new abstractions'],
      behaviorContract: {
        flows: [
          {
            id: 'notify',
            label: 'Notify after confirm',
            steps: ['Order confirms', 'Notifier delivers somehow'],
            mustKeepElementNames: ['OrderService', 'Notifier'],
            mustReach: [{ from: 'OrderService', to: 'Notifier' }],
            mustHavePathTopics: ['email', 'sms', 'notif'],
          },
        ],
      },
      maxNewAbstractions: 2,
      forbidDeleteElementNames: ['OrderService', 'Notifier'],
      scenario: 'decouple',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-cache-port',
    title: 'API Caching Path',
    difficulty: 'easy' as const,
    description:
      'ApiHandler knows Redis and in-memory cache by name. Hide caching behind one clear boundary.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 7,
    tags: ['cache', 'decouple'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-api', 'ApiHandler', 200, 40, ['get', 'setCache']),
        node('n2', 'el-redis', 'RedisCache', 40, 200, ['get', 'set']),
        node('n3', 'el-mem', 'MemoryCache', 360, 200, ['get', 'set']),
      ],
      edges: [
        edge('e1', 'ed-api-redis', 'n1', 'n2'),
        edge('e2', 'ed-api-mem', 'n1', 'n3'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'ApiHandler reads and writes through both RedisCache and MemoryCache. The handler knows two storage technologies by name.\n\n' +
        'The problem (simple terms)\n' +
        'Swapping or combining caches (or adding a third) forces edits inside ApiHandler. The API layer shouldn’t care which cache engine is underneath.\n\n' +
        'What you should do\n' +
        'Introduce a clearer boundary so the handler depends on “a cache,” not on Redis + Memory specifically. Keep get/set caching available.\n\n' +
        'Where to start\n' +
        'Compare RedisCache and MemoryCache methods — they already look alike. That similarity is a hint.',
      requirements: ['API can still read/write cache'],
      constraints: ['Prefer one abstraction over deleting caching entirely'],
      behaviorContract: {
        flows: [
          {
            id: 'cache',
            label: 'Cache access',
            steps: ['Handler uses a cache'],
            mustKeepElementNames: ['ApiHandler'],
            mustHavePathTopics: ['cache', 'get', 'set'],
          },
        ],
      },
      maxNewAbstractions: 2,
      forbidDeleteElementNames: ['ApiHandler'],
      scenario: 'decouple',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-player-weapons',
    title: 'Game Player Loadout',
    difficulty: 'medium' as const,
    description:
      'Player hard-wires Sword, Bow, and FireSpell. Restructure so a new weapon plugs in without rewriting Player.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 8,
    tags: ['game', 'extract'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-player', 'Player', 280, 40, ['attack', 'equipSword', 'equipBow', 'equipFireSpell']),
        node('n2', 'el-sword', 'Sword', 40, 220, ['swing']),
        node('n3', 'el-bow', 'Bow', 280, 220, ['shoot']),
        node('n4', 'el-spell', 'FireSpell', 520, 220, ['cast']),
      ],
      edges: [
        edge('e1', 'ed-p-sword', 'n1', 'n2'),
        edge('e2', 'ed-p-bow', 'n1', 'n3'),
        edge('e3', 'ed-p-spell', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'This is a game combat sketch. Player has attack, plus equipSword / equipBow / equipFireSpell. Arrows go from Player straight to Sword, Bow, and FireSpell.\n\n' +
        'The problem (simple terms)\n' +
        'Every new weapon means editing Player again — new equip method, new dependency arrow. Player knows concrete weapons instead of “something I can attack with.”\n\n' +
        'What you should do\n' +
        'Refactor the right canvas so new weapons can plug in without rewriting Player. Keep a Player that can still attack somehow.\n\n' +
        'Where to start\n' +
        'Open Player and read its methods. Then look at the three outgoing arrows. Ask: what shared idea do Sword, Bow, and FireSpell all represent?\n\n' +
        'Tip\n' +
        'You do not need a perfect pattern name first — aim for “Player depends on a weapon idea, not three hard-coded classes.”',
      requirements: ['Player can still attack'],
      constraints: ['Do not delete Player', 'At most 2 new abstractions'],
      behaviorContract: {
        flows: [
          {
            id: 'attack',
            label: 'Attack',
            steps: ['Player attacks using a weapon'],
            mustKeepElementNames: ['Player'],
            mustHavePathTopics: ['attack', 'sword', 'bow', 'weapon'],
          },
        ],
      },
      maxNewAbstractions: 2,
      forbidDeleteElementNames: ['Player'],
      scenario: 'extract',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-parking-fees',
    title: 'Parking Fee Calculation',
    difficulty: 'medium' as const,
    description:
      'ParkingLot parks vehicles and also hard-codes fee rules per vehicle type. Separate fee policy from the lot.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 9,
    tags: ['parking', 'cleanup'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-lot', 'ParkingLot', 200, 40, [
          'park',
          'exit',
          'calcFeeCar',
          'calcFeeBike',
          'calcFeeTruck',
        ]),
        node('n2', 'el-car', 'Car', 40, 220, ['enter']),
        node('n3', 'el-bike', 'Bike', 200, 220, ['enter']),
        node('n4', 'el-truck', 'Truck', 360, 220, ['enter']),
      ],
      edges: [
        edge('e1', 'ed-lot-car', 'n1', 'n2'),
        edge('e2', 'ed-lot-bike', 'n1', 'n3'),
        edge('e3', 'ed-lot-truck', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'ParkingLot can park and exit vehicles. It also has calcFeeCar, calcFeeBike, and calcFeeTruck — fee policy lives inside the lot.\n\n' +
        'The problem (simple terms)\n' +
        'A new vehicle type (or a weekend pricing rule) means editing ParkingLot again. Parking logistics and pricing policy are tangled.\n\n' +
        'What you should do\n' +
        'Separate fee rules from the lot so pricing can evolve on its own. Keep park/exit available, and keep fee calculation possible somewhere.\n\n' +
        'Where to start\n' +
        'Compare the three calcFee* methods. That’s usually the smell that wants its own home.',
      requirements: ['Vehicles can still park', 'Fees can still be calculated somewhere'],
      constraints: ['Do not delete ParkingLot'],
      behaviorContract: {
        flows: [
          {
            id: 'park',
            label: 'Park and fee',
            steps: ['Vehicle enters lot', 'Fee can be calculated'],
            mustKeepElementNames: ['ParkingLot'],
            mustHavePathTopics: ['park', 'fee', 'calc'],
          },
        ],
      },
      maxNewAbstractions: 3,
      forbidDeleteElementNames: ['ParkingLot'],
      scenario: 'cleanup',
    },
  },
  {
    type: 'refactor' as const,
    slug: 'ref-booking-hex',
    title: 'Hotel Booking Collaborators',
    difficulty: 'hard' as const,
    description:
      'BookingService owns search, Stripe charge, Google Calendar, and email. Thin it toward clearer ports without losing booking.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 10,
    tags: ['booking', 'redesign'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-book', 'BookingService', 240, 20, [
          'searchRooms',
          'hold',
          'confirm',
          'chargeCard',
          'refund',
          'syncCalendar',
          'emailGuest',
        ]),
        node('n2', 'el-rooms', 'RoomCatalog', 40, 220, ['findAvailable']),
        node('n3', 'el-stripe', 'StripeGateway', 240, 220, ['charge', 'refund']),
        node('n4', 'el-cal', 'GoogleCalendar', 440, 220, ['createEvent']),
      ],
      edges: [
        edge('e1', 'ed-b-rooms', 'n1', 'n2'),
        edge('e2', 'ed-b-stripe', 'n1', 'n3'),
        edge('e3', 'ed-b-cal', 'n1', 'n4'),
      ],
    },
    payload: {
      briefing:
        'What’s going on\n' +
        'BookingService searches rooms, charges via StripeGateway, syncs GoogleCalendar, and emails guests. Domain booking logic sits next to vendor APIs.\n\n' +
        'The problem (simple terms)\n' +
        'Swapping Stripe for another PSP (or Calendar for another calendar) forces edits deep inside BookingService. Infrastructure details are leaking into the booking brain.\n\n' +
        'What you should do\n' +
        'Move toward clearer ports/collaborators (payment, calendar, notify) while keeping room search and charging possible.\n\n' +
        'Where to start\n' +
        'Separate “find a room” from “talk to Stripe” from “talk to Google.” Prefer ports over deleting vendor adapters entirely.',
      requirements: ['Room search remains', 'Payment can still happen', 'Calendar sync remains possible'],
      constraints: [
        'Do not delete RoomCatalog',
        'Prefer ports over deleting vendor adapters entirely',
        'At most 4 new abstractions',
      ],
      behaviorContract: {
        flows: [
          {
            id: 'confirm',
            label: 'Confirm booking',
            steps: ['Find room', 'Charge', 'Optionally sync calendar'],
            mustKeepElementNames: ['BookingService', 'RoomCatalog'],
            mustReach: [{ from: 'BookingService', to: 'RoomCatalog' }],
            mustHavePathTopics: ['charge', 'room', 'calendar', 'email'],
          },
        ],
      },
      maxNewAbstractions: 4,
      forbidDeleteElementNames: ['BookingService', 'RoomCatalog'],
      scenario: 'redesign',
    },
  },
]

async function upgradeLegacyRefactorPacks() {
  const richByTheme: Record<string, string> = {
    'weapon-strategy-player':
      PACKS.find(p => p.slug === 'ref-player-weapons')?.payload.briefing ?? '',
    'decouple-payment-provider':
      PACKS.find(p => p.slug === 'ref-decouple-payment')?.payload.briefing ?? '',
    'notification-channels':
      PACKS.find(p => p.slug === 'ref-notifier-channels')?.payload.briefing ?? '',
    'parking-polymorphism':
      PACKS.find(p => p.slug === 'ref-parking-fees')?.payload.briefing ?? '',
    'booking-hexagonal':
      PACKS.find(p => p.slug === 'ref-booking-hex')?.payload.briefing ?? '',
    'report-exporter-strategy':
      PACKS.find(p => p.slug === 'ref-report-exporters')?.payload.briefing ?? '',
    'cache-behind-port':
      PACKS.find(p => p.slug === 'ref-cache-port')?.payload.briefing ?? '',
    'break-service-cycle':
      PACKS.find(p => p.slug === 'ref-break-cycle')?.payload.briefing ?? '',
    'split-auth-responsibilities':
      PACKS.find(p => p.slug === 'ref-split-auth')?.payload.briefing ?? '',
  }

  const legacy = await ChallengePack.find({
    type: 'refactor',
    slug: { $nin: PACKS.map(p => p.slug) },
  })
  let n = 0
  for (const doc of legacy) {
    const payload = (doc.payload ?? {}) as Record<string, unknown>
    const constraints = Array.isArray(payload.constraints)
      ? (payload.constraints as string[])
      : ['Do not remove functionality', 'Prefer smaller focused changes']
    const existing = typeof payload.briefing === 'string' ? payload.briefing : ''
    const themed = richByTheme[String(doc.slug)]
    const briefing =
      themed ||
      (existing.includes('What you should do')
        ? existing
        : `What’s going on\n${doc.description || doc.title}\n\n` +
          `The problem (simple terms)\n` +
          `The current structure is hard to change safely — responsibilities are tangled or dependencies are too concrete.\n\n` +
          `What you should do\n` +
          `Improve the architecture on the right canvas. Keep existing behavior. Do not wipe the diagram and start blank.\n\n` +
          `Where to start\n` +
          `Read the biggest class’s methods and follow its outgoing arrows. Ask what would break if product added one more variant tomorrow.`)
    const requirements = Array.isArray(payload.requirements)
      ? (payload.requirements as string[])
      : ['Core flows from the original diagram still work']
    const behaviorContract =
      payload.behaviorContract ??
      ({
        flows: [
          {
            id: 'core',
            label: 'Core behavior',
            steps: ['Keep the main collaborators reachable'],
            mustHavePathTopics: ['service', 'order', 'pay', 'cache', 'auth', 'report', 'notif'].slice(
              0,
              2,
            ),
          },
        ],
      } as const)

    doc.title = String(doc.title)
      .replace(/\b(god|DIP|OCP|SRP|concrete)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || doc.title
    if (themed && String(doc.slug) === 'weapon-strategy-player') {
      doc.description =
        'Player hard-wires Sword, Bow, and FireSpell. Restructure so a new weapon plugs in without rewriting Player.'
    }
    doc.payload = {
      ...payload,
      briefing,
      requirements,
      constraints,
      behaviorContract,
      maxNewAbstractions: payload.maxNewAbstractions ?? 4,
      scenario: payload.scenario ?? 'cleanup',
    }
    doc.markModified('payload')
    await doc.save()
    n++
    console.log(`✓ upgraded legacy refactor ${doc.slug}`)
  }
  return n
}

async function main() {
  await connectDB()
  let count = 0
  for (const pack of PACKS) {
    await ChallengePack.findOneAndUpdate({ slug: pack.slug }, { $set: pack }, { upsert: true, new: true })
    console.log(`✓ refactor ${pack.slug}`)
    count++
  }
  const legacy = await upgradeLegacyRefactorPacks()
  console.log(`Done — ${count} rich refactor packs + ${legacy} legacy upgrades`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
