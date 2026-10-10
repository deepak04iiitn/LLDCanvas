/**
 * Seed Design Studio Change One Thing packs (idempotent by slug).
 *
 * Run: npx tsx src/scripts/seed-studio-change.ts
 */
import 'dotenv/config'
import { connectDB } from '../config/db'
import { ChallengePack } from '../models/studio/challenge-pack.model'

type MethodSpec = string | { name: string; returnType?: string }

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
    params: [],
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
  nodeType: string = 'class',
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

const PACKS = [
  {
    type: 'change_one' as const,
    slug: 'co-add-razorpay',
    title: 'Add Razorpay Beside Stripe',
    difficulty: 'easy' as const,
    description:
      'Finance wants Razorpay next to Stripe. Make the smallest change so a second provider fits without rewriting Order.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 1,
    tags: ['variation', 'payments'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 280, 40, ['create', 'checkout']),
        node('n2', 'el-pay', 'PaymentService', 280, 200, ['charge', 'refund']),
        node('n3', 'el-stripe', 'StripePayment', 280, 360, ['createCharge']),
      ],
      edges: [
        edge('e1', 'ed-o-p', 'n1', 'n2'),
        edge('e2', 'ed-p-s', 'n2', 'n3'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Add Razorpay support',
        body:
          'Finance just signed Razorpay. Stripe must keep working for existing customers.\n\n' +
          'Checkout / Order should not grow provider-specific if/else forever. A future third provider should be addable without opening Order again.',
        type: 'variation',
      },
      briefing:
        'What’s going on\n' +
        'Today the design is simple: Order → PaymentService → StripePayment. One provider, one path.\n\n' +
        'The problem (simple terms)\n' +
        'Product wants a second payment company (Razorpay) without rewriting the order side. If PaymentService is glued only to Stripe, every new provider becomes another edit.\n\n' +
        'What you should do\n' +
        'Make the smallest architectural change that unlocks Razorpay beside Stripe. Prefer touching payment plumbing, not Order.\n\n' +
        'Where to start\n' +
        'Look at PaymentService → StripePayment. Ask what shared idea a second provider would share with Stripe.',
      constraints: [
        'Do not put Razorpay-specific calls inside Order',
        'Stripe payment path must continue to work',
      ],
      forbidModifyElementNames: ['Order'],
      maxNewClasses: 3,
      expectedTouchHints: ['PaymentService', 'StripePayment', 'PaymentGateway', 'Razorpay'],
      protectedFlows: [
        {
          id: 'stripe',
          label: 'Stripe payment',
          mustKeepElementNames: ['Order', 'PaymentService', 'StripePayment'],
          mustReach: [
            { from: 'Order', to: 'PaymentService' },
            { from: 'PaymentService', to: 'StripePayment' },
          ],
        },
      ],
      newFlows: [
        {
          id: 'razorpay',
          label: 'Razorpay payment',
          mustKeepElementNames: ['Razorpay'],
          mustHavePathTopics: ['razorpay'],
          mustReach: [{ from: 'PaymentService', to: 'Razorpay' }],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-whatsapp-notify',
    title: 'WhatsApp + Email Notifications',
    difficulty: 'easy' as const,
    description:
      'Customers want WhatsApp as well as email. Add a second channel without breaking email.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 2,
    tags: ['variation', 'notifications'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 200, 40, ['complete']),
        node('n2', 'el-notif', 'NotificationService', 200, 200, ['notify']),
        node('n3', 'el-email', 'EmailNotification', 200, 360, ['send']),
      ],
      edges: [
        edge('e1', 'ed-o-n', 'n1', 'n2'),
        edge('e2', 'ed-n-e', 'n2', 'n3'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Add WhatsApp notifications',
        body:
          'Support wants WhatsApp in addition to email for order updates.\n\n' +
          'Email must keep working. Prefer a design where a third channel later (push, SMS) does not force another rewrite of NotificationService.',
        type: 'variation',
      },
      briefing:
        'What’s going on\n' +
        'Right now notifications are one path: Order → NotificationService → EmailNotification.\n\n' +
        'The problem (simple terms)\n' +
        'Product wants another delivery channel (WhatsApp). If NotificationService only knows Email, every new channel means editing that service again.\n\n' +
        'What you should do\n' +
        'Add WhatsApp while keeping email. Prefer an abstraction for “how we notify” if it keeps future channels cheap.\n\n' +
        'Where to start\n' +
        'Look at NotificationService → EmailNotification. What idea do Email and WhatsApp share?',
      constraints: ['Do not remove EmailNotification'],
      expectedTouchHints: ['NotificationService', 'EmailNotification', 'NotificationChannel', 'WhatsAppNotification'],
      protectedFlows: [
        {
          id: 'email',
          label: 'Email path',
          mustKeepElementNames: ['EmailNotification'],
          mustReach: [{ from: 'NotificationService', to: 'EmailNotification' }],
        },
      ],
      newFlows: [
        {
          id: 'wa',
          label: 'WhatsApp path',
          mustHavePathTopics: ['whatsapp'],
          mustReach: [{ from: 'NotificationService', to: 'WhatsAppNotification' }],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-reserve-before-pay',
    title: 'Reserve Inventory Before Payment',
    difficulty: 'medium' as const,
    description:
      'We sometimes charge customers then fail to reserve stock. Fix the order of steps: reserve first, then pay.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 3,
    tags: ['behavior'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-checkout', 'Checkout', 280, 40, ['placeOrder']),
        node('n2', 'el-pay', 'PaymentService', 80, 220, ['charge']),
        node('n3', 'el-inv', 'InventoryService', 480, 220, ['reserve', 'release']),
        node('n4', 'el-order', 'Order', 280, 380, ['save']),
      ],
      edges: [
        edge('e1', 'ed-c-p', 'n1', 'n2'),
        edge('e2', 'ed-c-i', 'n1', 'n3'),
        edge('e3', 'ed-c-o', 'n1', 'n4'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Reserve stock before payment',
        body:
          'Fraud / ops found a bad sequence: we sometimes charge the card and then fail to reserve inventory.\n\n' +
          'Checkout must reserve inventory before payment. Both InventoryService and PaymentService must stay reachable from Checkout.',
        type: 'behavior',
      },
      briefing:
        'What’s going on\n' +
        'Checkout can talk to PaymentService, InventoryService, and Order. The boxes are fine — the risk is the order of work inside placeOrder.\n\n' +
        'The problem (simple terms)\n' +
        'If you charge first and reserve second, a failed reserve leaves a charged customer with no stock. Business wants reserve → then charge.\n\n' +
        'What you should do\n' +
        'Adjust the design so that sequencing is clear: inventory reservation happens before payment. Keep Checkout as the orchestrator.\n\n' +
        'Where to start\n' +
        'Read Checkout.placeOrder and the arrows to Inventory vs Payment. Make “reserve before charge” obvious in the structure/method story.',
      expectedTouchHints: ['Checkout'],
      protectedFlows: [
        {
          id: 'reach',
          label: 'Checkout still orchestrates',
          mustReach: [
            { from: 'Checkout', to: 'PaymentService' },
            { from: 'Checkout', to: 'InventoryService' },
          ],
        },
      ],
      newFlows: [
        {
          id: 'order',
          label: 'Reserve before pay (topics)',
          mustHavePathTopics: ['reserve', 'charge'],
          mustKeepElementNames: ['Checkout', 'InventoryService', 'PaymentService'],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-domain-no-infra',
    title: 'Domain Must Not Depend on Infra',
    difficulty: 'medium' as const,
    description:
      'Architecture review: Order must stop talking to StripePayment directly. Put a payment boundary in between.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 4,
    tags: ['constraint'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 200, 40, ['pay']),
        node('n2', 'el-stripe', 'StripePayment', 200, 220, ['charge']),
        node('n3', 'el-db', 'OrderRepository', 420, 220, ['save']),
      ],
      edges: [
        edge('e1', 'ed-o-s', 'n1', 'n2'),
        edge('e2', 'ed-o-d', 'n1', 'n3'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Break domain → infrastructure dependency',
        body:
          'Architecture review flagged Order → StripePayment as domain depending on infrastructure.\n\n' +
          'Introduce a payment abstraction so Order no longer points at StripePayment. OrderRepository (persistence) may stay.',
        type: 'constraint',
      },
      briefing:
        'What’s going on\n' +
        'Order currently depends on StripePayment and OrderRepository. Saving an order is fine; knowing Stripe by name is not.\n\n' +
        'The problem (simple terms)\n' +
        'Domain (Order) should not care which payment vendor exists. Direct Order → StripePayment makes vendor swaps rewrite the domain.\n\n' +
        'What you should do\n' +
        'Insert a payment boundary. Order may still pay somehow — just not by depending on StripePayment directly.\n\n' +
        'Where to start\n' +
        'Find the Order → StripePayment arrow. That edge is what the review wants gone.',
      constraints: ['Order must not depend directly on StripePayment'],
      expectedTouchHints: ['Order', 'StripePayment', 'PaymentGateway', 'PaymentService'],
      protectedFlows: [
        {
          id: 'persist',
          label: 'Order persistence',
          mustReach: [{ from: 'Order', to: 'OrderRepository' }],
        },
      ],
      newFlows: [
        {
          id: 'no-direct',
          label: 'No Order → StripePayment',
          mustNotReach: [{ from: 'Order', to: 'StripePayment' }],
          mustHavePathTopics: ['payment'],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-remove-email',
    title: 'Remove Email Notifications',
    difficulty: 'easy' as const,
    description:
      'Email notifications are being retired. Remove that path cleanly while SMS keeps working.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 5,
    tags: ['removal'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 200, 40, ['complete']),
        node('n2', 'el-notif', 'Notifier', 200, 200, ['notify']),
        node('n3', 'el-email', 'EmailSender', 80, 360, ['send']),
        node('n4', 'el-sms', 'SmsSender', 320, 360, ['send']),
      ],
      edges: [
        edge('e1', 'ed-o-n', 'n1', 'n2'),
        edge('e2', 'ed-n-e', 'n2', 'n3'),
        edge('e3', 'ed-n-s', 'n2', 'n4'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Retire email notifications',
        body:
          'Ops is shutting down EmailSender. SMS stays as the remaining channel.\n\n' +
          'Remove unused email dependencies without breaking Order → Notifier → SmsSender.',
        type: 'removal',
      },
      briefing:
        'What’s going on\n' +
        'Notifier currently fans out to EmailSender and SmsSender after Order completes.\n\n' +
        'The problem (simple terms)\n' +
        'Email is being turned off. Leaving dead arrows/classes behind creates confusion and fake “still supported” paths.\n\n' +
        'What you should do\n' +
        'Cleanly remove email from the design. Keep the SMS notification path working end-to-end.\n\n' +
        'Where to start\n' +
        'Find Notifier → EmailSender. That relationship (and possibly EmailSender itself) should go away.',
      expectedTouchHints: ['EmailSender', 'Notifier'],
      protectedFlows: [
        {
          id: 'sms',
          label: 'SMS path',
          mustKeepElementNames: ['Order', 'Notifier', 'SmsSender'],
          mustReach: [
            { from: 'Order', to: 'Notifier' },
            { from: 'Notifier', to: 'SmsSender' },
          ],
        },
      ],
      newFlows: [
        {
          id: 'gone',
          label: 'Email removed',
          mustNotReach: [{ from: 'Notifier', to: 'EmailSender' }],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-add-upi',
    title: 'Add UPI Payments',
    difficulty: 'easy' as const,
    description:
      'India expansion needs UPI. Add UPI while card charges keep working.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 6,
    tags: ['capability'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-checkout', 'Checkout', 240, 40, ['pay']),
        node('n2', 'el-card', 'CardGateway', 240, 220, ['chargeCard']),
      ],
      edges: [edge('e1', 'ed-c-c', 'n1', 'n2')],
    },
    payload: {
      changeRequest: {
        title: 'Support UPI',
        body:
          'India launch needs UPI payments beside cards.\n\n' +
          'Card charges must keep working. If a shared payment abstraction reduces future provider cost, use it — but don’t overbuild.',
        type: 'capability',
      },
      briefing:
        'What’s going on\n' +
        'Checkout currently pays only through CardGateway. There is no UPI concept in the diagram yet.\n\n' +
        'The problem (simple terms)\n' +
        'A new payment capability is required. Bolting UPI only into Checkout as a one-off if/else will hurt when the next method arrives.\n\n' +
        'What you should do\n' +
        'Add UPI support. Keep the card path. Prefer a clean boundary if it keeps Checkout simple.\n\n' +
        'Where to start\n' +
        'Look at Checkout → CardGateway. Decide how a second payment method joins that story.',
      expectedTouchHints: ['Checkout', 'CardGateway', 'UpiGateway', 'PaymentGateway'],
      protectedFlows: [
        {
          id: 'card',
          label: 'Card payment',
          mustReach: [{ from: 'Checkout', to: 'CardGateway' }],
        },
      ],
      newFlows: [
        {
          id: 'upi',
          label: 'UPI payment',
          mustHavePathTopics: ['upi'],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-payment-fallback',
    title: 'Payment Timeout Fallback',
    difficulty: 'hard' as const,
    description:
      'Stripe can timeout. Add retry/fallback so PaymentService recovers without Order knowing about timeouts.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 7,
    tags: ['failure'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 260, 40, ['checkout']),
        node('n2', 'el-pay', 'PaymentService', 260, 200, ['charge']),
        node('n3', 'el-stripe', 'StripeClient', 260, 360, ['charge']),
      ],
      edges: [
        edge('e1', 'ed-o-p', 'n1', 'n2'),
        edge('e2', 'ed-p-s', 'n2', 'n3'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Handle provider timeouts',
        body:
          'Stripe sometimes times out under load. We need retry and/or fallback to another provider.\n\n' +
          'Order should stay unaware of timeout details — PaymentService owns recovery.',
        type: 'failure',
      },
      briefing:
        'What’s going on\n' +
        'Happy path is Order → PaymentService → StripeClient. That works until Stripe hangs.\n\n' +
        'The problem (simple terms)\n' +
        'Failure handling is missing. If Stripe times out, there is no modeled retry or fallback. Putting timeout logic inside Order would leak infrastructure worries upward.\n\n' +
        'What you should do\n' +
        'Introduce retry/fallback ideas around PaymentService. Do not modify Order.\n\n' +
        'Where to start\n' +
        'Stay under PaymentService. Ask where “try again” or “try another provider” should live.',
      forbidModifyElementNames: ['Order'],
      expectedTouchHints: ['PaymentService', 'StripeClient', 'FallbackGateway', 'RetryPolicy'],
      protectedFlows: [
        {
          id: 'order-pay',
          label: 'Order still reaches PaymentService',
          mustReach: [{ from: 'Order', to: 'PaymentService' }],
        },
      ],
      newFlows: [
        {
          id: 'fallback',
          label: 'Fallback / retry concept',
          mustHavePathTopics: ['retry', 'fallback'],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-extract-pricing',
    title: 'Extract Pricing From Order',
    difficulty: 'medium' as const,
    description:
      'Pricing rules currently live inside Order. Move pricing to its own owner while payment still works.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 8,
    tags: ['ownership'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 240, 40, [
          'create',
          'calculatePrice',
          'applyDiscount',
          'charge',
        ]),
        node('n2', 'el-pay', 'PaymentService', 240, 260, ['charge']),
      ],
      edges: [edge('e1', 'ed-o-p', 'n1', 'n2')],
    },
    payload: {
      changeRequest: {
        title: 'Pricing becomes its own owner',
        body:
          'Pricing will be owned by a separate team. Discounts and price rules should not live inside Order forever.\n\n' +
          'Extract pricing while keeping Order → PaymentService for charging.',
        type: 'ownership',
      },
      briefing:
        'What’s going on\n' +
        'Order currently create()s, calculatePrice()s, applyDiscount()s, and charge()s. Pricing policy is mixed into the order entity/service.\n\n' +
        'The problem (simple terms)\n' +
        'When pricing rules change weekly, Order becomes the edit hotspot. Ownership wants pricing elsewhere.\n\n' +
        'What you should do\n' +
        'Move pricing responsibility out (e.g. PricingService). Keep the payment path from Order.\n\n' +
        'Where to start\n' +
        'Look at calculatePrice / applyDiscount on Order — those methods are the candidates to relocate.',
      expectedTouchHints: ['Order', 'PricingService', 'PriceCalculator'],
      protectedFlows: [
        {
          id: 'pay',
          label: 'Payment still reachable',
          mustReach: [{ from: 'Order', to: 'PaymentService' }],
        },
      ],
      newFlows: [
        {
          id: 'pricing',
          label: 'Pricing abstraction',
          mustHavePathTopics: ['price'],
          mustReach: [{ from: 'Order', to: 'PricingService' }],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-sms-dont-touch',
    title: 'Add SMS — Don’t Touch Order',
    difficulty: 'medium' as const,
    description:
      'Add SMS with hard don’t-touch rules: Order, Checkout, and Email stay frozen. Work through NotificationFacade.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 9,
    tags: ['constraint', 'dont-touch'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 80, 40, ['complete']),
        node('n2', 'el-checkout', 'Checkout', 280, 40, ['finish']),
        node('n3', 'el-notif', 'NotificationFacade', 180, 200, ['notify']),
        node('n4', 'el-email', 'EmailNotification', 180, 360, ['send']),
      ],
      edges: [
        edge('e1', 'ed-o-n', 'n1', 'n3'),
        edge('e2', 'ed-c-n', 'n2', 'n3'),
        edge('e3', 'ed-n-e', 'n3', 'n4'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Add SMS notifications',
        body:
          'Product wants SMS. You may introduce at most 2 new classes.\n\n' +
          'Hard freeze: do not modify Order, Checkout, or EmailNotification. Extend through the notification side.',
        type: 'constraint',
      },
      briefing:
        'What’s going on\n' +
        'Order and Checkout both talk to NotificationFacade, which currently sends EmailNotification only.\n\n' +
        'The problem (simple terms)\n' +
        'You must add SMS, but several “important” classes are locked. This trains blast-radius discipline: change the safe seam, not everything.\n\n' +
        'What you should do\n' +
        'Add SMS with ≤2 new classes. Touch NotificationFacade / new channel classes — not Order/Checkout/Email.\n\n' +
        'Where to start\n' +
        'NotificationFacade is your allowed hinge. Email must keep working.',
      constraints: [
        'Do not modify Order',
        'Do not modify Checkout',
        'Do not modify EmailNotification',
        'At most 2 new classes',
      ],
      forbidModifyElementNames: ['Order', 'Checkout', 'EmailNotification'],
      maxNewClasses: 2,
      expectedTouchHints: ['NotificationFacade', 'SmsNotification', 'NotificationChannel'],
      protectedFlows: [
        {
          id: 'email',
          label: 'Email still works',
          mustReach: [{ from: 'NotificationFacade', to: 'EmailNotification' }],
        },
      ],
      newFlows: [
        {
          id: 'sms',
          label: 'SMS available',
          mustHavePathTopics: ['sms'],
        },
      ],
    },
  },
  {
    type: 'change_one' as const,
    slug: 'co-audit-payments',
    title: 'Audit Log Every Payment',
    difficulty: 'hard' as const,
    description:
      'Compliance wants an audit trail on every charge/refund. Prefer one place that covers Stripe and Razorpay.',
    status: 'published' as const,
    planMin: 'free' as const,
    order: 10,
    tags: ['cross-cutting'],
    diagramSnapshot: {
      version: 1,
      meta,
      nodes: [
        node('n1', 'el-order', 'Order', 240, 40, ['pay']),
        node('n2', 'el-pay', 'PaymentService', 240, 200, ['charge', 'refund']),
        node('n3', 'el-stripe', 'StripeAdapter', 120, 360, ['charge']),
        node('n4', 'el-rz', 'RazorpayAdapter', 360, 360, ['charge']),
      ],
      edges: [
        edge('e1', 'ed-o-p', 'n1', 'n2'),
        edge('e2', 'ed-p-s', 'n2', 'n3'),
        edge('e3', 'ed-p-r', 'n2', 'n4'),
      ],
    },
    payload: {
      changeRequest: {
        title: 'Audit every payment',
        body:
          'Compliance needs an audit trail for charge and refund across providers.\n\n' +
          'Prefer a single place so Stripe and Razorpay are covered without copying audit code into each adapter. Do not modify Order.',
        type: 'capability',
      },
      briefing:
        'What’s going on\n' +
        'PaymentService already fans out to StripeAdapter and RazorpayAdapter. Order just asks PaymentService to pay.\n\n' +
        'The problem (simple terms)\n' +
        'Auditing is a cross-cutting need. If you paste audit logging into both adapters, you’ll miss refunds or diverge. Better: one choke point.\n\n' +
        'What you should do\n' +
        'Add an audit concept so charge/refund are recorded once. Keep both providers reachable. Leave Order alone.\n\n' +
        'Where to start\n' +
        'PaymentService is the natural choke point above both adapters.',
      forbidModifyElementNames: ['Order'],
      expectedTouchHints: ['PaymentService', 'AuditLogger', 'PaymentGateway'],
      protectedFlows: [
        {
          id: 'providers',
          label: 'Providers reachable',
          mustReach: [
            { from: 'PaymentService', to: 'StripeAdapter' },
            { from: 'PaymentService', to: 'RazorpayAdapter' },
          ],
        },
      ],
      newFlows: [
        {
          id: 'audit',
          label: 'Audit present',
          mustHavePathTopics: ['audit'],
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
  console.log(`Done. ${upserted} change_one packs.`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
