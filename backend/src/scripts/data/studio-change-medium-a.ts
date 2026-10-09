/**
 * Design Studio "Change One Thing" packs — medium tier, set A (orders 434–444).
 */
import { pack, node, edge, pos, type ChangePackSeed, type MethodSpec } from '../seed-studio-change-lib'

/** Typed method shorthand: m('charge', 'PaymentResult', ['orderId', 'string'], ['amount', 'number']) */
function m(name: string, returnType = 'void', ...params: [string, string][]): MethodSpec {
  return { name, returnType, params: params.map(([n, t]) => ({ name: n, type: t })) }
}

/** Five-section briefing in the same voice as the rest of the change library. */
function brief(what: string, problem: string, todo: string, start: string): string {
  return (
    `What’s going on\n${what}\n\n` +
    `The problem (simple terms)\n${problem}\n\n` +
    `What you should do\n${todo}\n\n` +
    `Where to start\n${start}`
  )
}

export const MEDIUM_A: ChangePackSeed[] = [
  // ───────────────────────────── 434 ─────────────────────────────
  pack({
    slug: 'co-reserve-then-charge',
    title: 'Reserve Inventory Before Charge',
    difficulty: 'medium',
    order: 434,
    tags: ['behavior', 'checkout', 'inventory', 'ordering'],
    description:
      'Checkout charges the card first and only then decrements stock. During a flash sale customers get charged for items that are already gone. Reorder the flow so stock is held before money moves.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-rc-checkout', 'CheckoutService', pos(1, 0), [
        m('placeOrder', 'Order', ['cartId', 'string'], ['paymentToken', 'string']),
      ]),
      node('n2', 'el-rc-pay', 'PaymentService', pos(0, 1), [
        m('charge', 'PaymentResult', ['token', 'string'], ['amount', 'number']),
        m('refund', 'void', ['paymentId', 'string']),
      ]),
      node('n3', 'el-rc-inv', 'InventoryService', pos(1, 1), [
        m('decrementStock', 'boolean', ['sku', 'string'], ['qty', 'number']),
      ], [{ name: 'stockBySku', type: 'Map<string, number>' }]),
      node('n4', 'el-rc-repo', 'OrderRepository', pos(2, 1), [
        m('save', 'void', ['order', 'Order']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-rc-1', 'n1', 'n2'),
      edge('e2', 'ed-rc-2', 'n1', 'n3'),
      edge('e3', 'ed-rc-3', 'n1', 'n4'),
    ],
    changeRequest: {
      title: 'Hold stock before charging the card',
      body:
        'During last Friday’s flash sale 312 customers were charged and then got “sorry, out of stock” emails — each one a refund, a support ticket and an angry review.\n\n' +
        'Checkout must secure the stock first, charge second, and give the stock back if the charge fails. Payments must stay unaware of inventory.',
      type: 'behavior',
    },
    briefing: brief(
      'CheckoutService.placeOrder talks to PaymentService (charge) and then InventoryService (decrementStock). The order of those calls is the whole bug — the arrows exist, but the sequence is wrong.',
      'Once the card is charged there is no clean way back. If stock is already gone, the only option is a refund. Decrementing after charging also means two concurrent buyers can both be charged for the last unit.',
      'Change the behaviour so inventory is reserved before the charge, confirmed on success and released if the charge fails. Inventory needs to express “held but not sold” — a plain decrement cannot be undone safely.',
      'Look at InventoryService: it has exactly one operation. Ask what vocabulary it is missing, then ask who should orchestrate the reserve → charge → commit/release sequence (hint: not PaymentService).',
    ),
    constraints: [
      'PaymentService must not depend on InventoryService',
      'A failed charge must give the reserved stock back',
      'Existing order persistence must keep working',
    ],
    forbidModifyElementNames: ['PaymentService'],
    expectedTouchHints: ['CheckoutService', 'InventoryService', 'StockReservation'],
    protectedFlows: [
      {
        id: 'happy-path',
        label: 'Successful checkout',
        steps: ['Validate cart', 'Charge card', 'Persist order'],
        mustKeepElementNames: ['CheckoutService', 'PaymentService', 'InventoryService', 'OrderRepository'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentService' },
          { from: 'CheckoutService', to: 'OrderRepository' },
        ],
      },
      {
        id: 'payment-isolation',
        label: 'Payments stay stock-agnostic',
        mustNotReach: [{ from: 'PaymentService', to: 'InventoryService' }],
      },
    ],
    newFlows: [
      {
        id: 'reserve-first',
        label: 'Reserve → charge → commit or release',
        steps: ['Reserve stock', 'Charge card', 'Commit reservation on success', 'Release reservation on failure'],
        mustReach: [{ from: 'CheckoutService', to: 'InventoryService' }],
        mustHavePathTopics: ['reserve', 'release'],
      },
    ],
  }),

  // ───────────────────────────── 435 ─────────────────────────────
  pack({
    slug: 'co-domain-no-razorpay',
    title: 'Domain Must Not Depend on Razorpay',
    difficulty: 'medium',
    order: 435,
    tags: ['constraint', 'payments', 'dependency-direction', 'clean-architecture'],
    description:
      'The Order domain entity calls the Razorpay SDK wrapper directly, so domain code cannot be unit-tested or reused without a payment vendor. Flip the dependency so the domain owns the contract.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-dr-checkout', 'CheckoutService', pos(1, 0), [
        m('placeOrder', 'Order', ['cartId', 'string']),
      ]),
      node('n2', 'el-dr-order', 'Order', pos(0, 1), [
        m('pay', 'PaymentResult', ['token', 'string']),
        m('markPaid', 'void', ['paymentId', 'string']),
      ], [
        { name: 'orderId', type: 'string' },
        { name: 'total', type: 'number' },
        { name: 'razorpayPaymentId', type: 'string' },
      ]),
      node('n3', 'el-dr-repo', 'OrderRepository', pos(2, 1), [
        m('save', 'void', ['order', 'Order']),
      ]),
      node('n4', 'el-dr-rzp', 'RazorpayClient', pos(0, 2), [
        m('createCharge', 'RazorpayCharge', ['amountPaise', 'number'], ['token', 'string']),
        m('refundCharge', 'void', ['chargeId', 'string']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-dr-1', 'n1', 'n2'),
      edge('e2', 'ed-dr-2', 'n1', 'n3'),
      edge('e3', 'ed-dr-3', 'n2', 'n4'),
    ],
    changeRequest: {
      title: 'Keep the domain free of Razorpay',
      body:
        'Architecture review rule: nothing in the domain layer may depend — directly or transitively — on a payment vendor SDK. Today Order.pay() calls RazorpayClient straight.\n\n' +
        'Orders must still be payable through Razorpay, and RazorpayClient is a vendor wrapper owned by another team, so you cannot edit it.',
      type: 'constraint',
    },
    briefing: brief(
      'Order is a domain entity, yet it calls RazorpayClient.createCharge and even stores a razorpayPaymentId. CheckoutService only coordinates; the vendor leak is inside the domain object.',
      'Domain unit tests need Razorpay credentials or a heavy mock, and swapping or adding a provider means editing core business code. The dependency arrow points from stable to volatile — the wrong way round.',
      'Introduce a payment gateway contract that lives on the domain side, make the domain depend only on that, and adapt Razorpay to it from the outside. The vendor wrapper itself stays as-is.',
      'Follow the arrow Order → RazorpayClient. Decide who should own the interface and in which direction the adapter arrow should point, so that no path from Order ends at Razorpay.',
    ),
    constraints: [
      'No path may lead from Order to Razorpay',
      'RazorpayClient is vendor-owned — do not modify it',
      'Orders must still be payable via Razorpay',
    ],
    forbidModifyElementNames: ['RazorpayClient'],
    expectedTouchHints: ['Order', 'PaymentGateway', 'RazorpayGateway', 'CheckoutService'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Order placement and payment',
        steps: ['Checkout builds order', 'Order is charged', 'Order is saved'],
        mustKeepElementNames: ['CheckoutService', 'Order', 'OrderRepository', 'Razorpay'],
        mustReach: [
          { from: 'CheckoutService', to: 'Order' },
          { from: 'CheckoutService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['charge'],
      },
    ],
    newFlows: [
      {
        id: 'domain-clean',
        label: 'Domain owns the payment contract',
        steps: ['Order depends on a gateway abstraction', 'Razorpay adapts to it'],
        mustNotReach: [{ from: 'Order', to: 'Razorpay' }],
        mustHavePathTopics: ['gateway'],
      },
    ],
  }),

  // ───────────────────────────── 436 ─────────────────────────────
  pack({
    slug: 'co-add-surge-pricing',
    title: 'Add Surge Pricing Mode',
    difficulty: 'medium',
    order: 436,
    tags: ['variation', 'ride-hailing', 'pricing', 'strategy'],
    description:
      'A ride-hailing app prices every trip with one flat per-km rate. Ops needs a surge mode under high demand without touching ride request handling or the flat-rate path.',
    maxNewClasses: 4,
    nodes: [
      node('n1', 'el-sp-ride', 'RideService', pos(1, 0), [
        m('requestRide', 'Ride', ['riderId', 'string'], ['pickup', 'GeoPoint'], ['drop', 'GeoPoint']),
      ]),
      node('n2', 'el-sp-price', 'RidePricing', pos(0, 1), [
        m('calculateFare', 'number', ['distanceKm', 'number'], ['durationMin', 'number']),
      ], [{ name: 'ratePerKm', type: 'number' }]),
      node('n3', 'el-sp-match', 'DriverMatcher', pos(1, 1), [
        m('findNearest', 'Driver', ['pickup', 'GeoPoint']),
      ]),
      node('n4', 'el-sp-repo', 'RideRepository', pos(2, 1), [
        m('save', 'void', ['ride', 'Ride']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-sp-1', 'n1', 'n2'),
      edge('e2', 'ed-sp-2', 'n1', 'n3'),
      edge('e3', 'ed-sp-3', 'n1', 'n4'),
    ],
    changeRequest: {
      title: 'Support surge pricing when demand is high',
      body:
        'Ops wants a surge multiplier that kicks in when ride requests in a zone outnumber available drivers. Normal zones keep paying the standard flat rate.\n\n' +
        'RideService is stable and heavily tested — requesting, matching and saving a ride must not change. Pricing rules will keep multiplying (night, airport, event), so avoid hard-wiring “if surge”.',
      type: 'variation',
    },
    briefing: brief(
      'RideService asks RidePricing for a fare, finds a driver and saves the ride. RidePricing is a single concrete class with one hard-coded rate per kilometre.',
      'Surge needs a different formula and a live demand signal. If you add a branch to RidePricing or RideService, every future pricing rule piles into the same method and the ride flow is retested each time.',
      'Open the pricing step to variation: keep the flat rate as the default, add a surge variant that needs a demand signal, and let the ride flow stay untouched.',
      'RideService must not be edited, so it should keep depending on the name RidePricing. Ask what RidePricing could become so that two behaviours can sit behind that same name.',
    ),
    constraints: [
      'Do not modify RideService',
      'Flat-rate fares must be calculated exactly as before when demand is normal',
      'Surge logic must not live inside RideService or driver matching',
    ],
    forbidModifyElementNames: ['RideService'],
    expectedTouchHints: ['RidePricing', 'SurgePricing', 'DemandMonitor', 'FlatRatePricing'],
    protectedFlows: [
      {
        id: 'flat-fare',
        label: 'Flat-rate fare',
        steps: ['Request ride', 'Price with standard rate'],
        mustKeepElementNames: ['RideService', 'RidePricing'],
        mustReach: [{ from: 'RideService', to: 'RidePricing' }],
        mustHavePathTopics: ['calculatefare'],
      },
      {
        id: 'match-and-save',
        label: 'Matching and persistence',
        mustReach: [
          { from: 'RideService', to: 'DriverMatcher' },
          { from: 'RideService', to: 'RideRepository' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'surge',
        label: 'Surge-priced ride',
        steps: ['Read zone demand', 'Apply multiplier', 'Return surge fare'],
        mustKeepElementNames: ['Surge'],
        mustHavePathTopics: ['surge', 'demand'],
        mustReach: [{ from: 'Surge', to: 'RidePricing' }],
      },
    ],
  }),

  // ───────────────────────────── 437 ─────────────────────────────
  pack({
    slug: 'co-otp-dont-touch-login',
    title: 'Add OTP Without Touching Login',
    difficulty: 'medium',
    order: 437,
    tags: ['variation', 'auth', 'open-closed', 'otp'],
    description:
      'Add one-time-password login beside the existing email+password flow. LoginService is audited and frozen — the new path must be built around it, not inside it.',
    maxNewClasses: 4,
    nodes: [
      node('n1', 'el-otp-ctrl', 'AuthController', pos(1, 0), [
        m('postLogin', 'AuthToken', ['email', 'string'], ['password', 'string']),
      ]),
      node('n2', 'el-otp-login', 'LoginService', pos(0, 1), [
        m('login', 'AuthToken', ['email', 'string'], ['password', 'string']),
      ]),
      node('n3', 'el-otp-users', 'UserRepository', pos(0, 2), [
        m('findByEmail', 'User', ['email', 'string']),
        m('findByPhone', 'User', ['phone', 'string']),
      ]),
      node('n4', 'el-otp-hash', 'PasswordHasher', pos(1, 2), [
        m('verify', 'boolean', ['plain', 'string'], ['hash', 'string']),
      ]),
      node('n5', 'el-otp-session', 'SessionStore', pos(2, 1), [
        m('createSession', 'AuthToken', ['userId', 'string']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-otp-1', 'n1', 'n2'),
      edge('e2', 'ed-otp-2', 'n2', 'n3'),
      edge('e3', 'ed-otp-3', 'n2', 'n4'),
      edge('e4', 'ed-otp-4', 'n2', 'n5', 'dependency', 'right', 'left'),
    ],
    changeRequest: {
      title: 'Let users sign in with a phone OTP',
      body:
        'Growth wants passwordless sign-in: the user enters a phone number, receives a 6-digit code by SMS and is logged in when it matches.\n\n' +
        'LoginService passed a security audit last month and is frozen — no edits, no new dependencies from it. Password login must behave exactly as before and OTP codes must expire.',
      type: 'variation',
    },
    briefing: brief(
      'AuthController hands credentials to LoginService, which checks the user, verifies the password hash and creates a session. UserRepository can already look users up by phone.',
      'The tempting fix is another if-branch in LoginService.login. That reopens audited code and couples two unrelated credential types together; the next factor (TOTP, magic link) would repeat the mistake.',
      'Add the OTP path as a sibling flow: something to issue and verify short-lived codes, something to deliver them, and a login entry point that ends in the same session creation. LoginService stays exactly as is.',
      'Start from AuthController — it is the only place that can route to a second flow. Then ask which existing collaborators (UserRepository, SessionStore) the new flow can reuse unchanged.',
    ),
    constraints: [
      'Do not modify LoginService',
      'LoginService must not depend on any OTP component',
      'OTP login must produce the same session as password login',
    ],
    forbidModifyElementNames: ['LoginService'],
    expectedTouchHints: ['AuthController', 'OtpLoginService', 'OtpStore', 'SmsSender', 'SessionStore'],
    protectedFlows: [
      {
        id: 'password-login',
        label: 'Password login',
        steps: ['Controller receives credentials', 'Verify hash', 'Create session'],
        mustKeepElementNames: ['AuthController', 'LoginService', 'UserRepository', 'PasswordHasher', 'SessionStore'],
        mustReach: [
          { from: 'AuthController', to: 'LoginService' },
          { from: 'LoginService', to: 'UserRepository' },
          { from: 'LoginService', to: 'PasswordHasher' },
          { from: 'LoginService', to: 'SessionStore' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'otp-login',
        label: 'OTP login',
        steps: ['Request code by phone', 'Deliver via SMS', 'Verify code', 'Create session'],
        mustHavePathTopics: ['otp', 'sms'],
        mustReach: [{ from: 'AuthController', to: 'Otp' }],
      },
      {
        id: 'login-untouched',
        label: 'LoginService stays OTP-free',
        mustNotReach: [{ from: 'LoginService', to: 'Otp' }],
      },
    ],
  }),

  // ───────────────────────────── 438 ─────────────────────────────
  pack({
    slug: 'co-split-notify-ownership',
    title: 'Notifications Own Their Channels',
    difficulty: 'medium',
    order: 438,
    tags: ['ownership', 'notifications', 'srp', 'orders'],
    description:
      'OrderService sends confirmation email itself while NotificationService owns SMS — channel knowledge is split across two owners. Make notifications the single owner of every channel.',
    maxNewClasses: 4,
    nodes: [
      node('n1', 'el-nt-order', 'OrderService', pos(1, 0), [
        m('confirmOrder', 'void', ['orderId', 'string']),
        m('sendConfirmationEmail', 'void', ['orderId', 'string']),
        m('shipOrder', 'void', ['orderId', 'string']),
      ]),
      node('n2', 'el-nt-repo', 'OrderRepository', pos(0, 1), [
        m('findById', 'Order', ['orderId', 'string']),
        m('save', 'void', ['order', 'Order']),
      ]),
      node('n3', 'el-nt-email', 'EmailClient', pos(1, 1), [
        m('send', 'void', ['to', 'string'], ['subject', 'string'], ['html', 'string']),
      ]),
      node('n4', 'el-nt-notify', 'NotificationService', pos(2, 1), [
        m('notifyShipped', 'void', ['orderId', 'string']),
      ]),
      node('n5', 'el-nt-sms', 'SmsClient', pos(2, 2), [
        m('sendSms', 'void', ['phone', 'string'], ['text', 'string']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-nt-1', 'n1', 'n2'),
      edge('e2', 'ed-nt-2', 'n1', 'n3'),
      edge('e3', 'ed-nt-3', 'n1', 'n4'),
      edge('e4', 'ed-nt-4', 'n4', 'n5'),
    ],
    changeRequest: {
      title: 'Move all channel knowledge into notifications',
      body:
        'Marketing wants WhatsApp added and per-user channel preferences. Today the email templates live in OrderService and the SMS logic lives in NotificationService, so every channel change touches two teams’ code.\n\n' +
        'OrderService should only say what happened (“order confirmed”, “order shipped”). The notification side decides which channels to use and how to render them.',
      type: 'ownership',
    },
    briefing: brief(
      'OrderService calls EmailClient directly for confirmations but delegates shipping updates to NotificationService, which talks to SmsClient. Ownership of “how do we reach the customer” is split.',
      'Adding WhatsApp or a preference setting means editing OrderService (an order concern) and NotificationService (a messaging concern). Order code ends up knowing about templates, vendors and delivery rules it should not care about.',
      'Make NotificationService the one owner of channels. Model channels so that email, SMS and future ones plug in the same way, and reduce OrderService to publishing order events to notifications.',
      'Compare the two arrows leaving OrderService with the one leaving NotificationService. Which of them should survive, and what shape should the things behind NotificationService take so a third channel is cheap?',
    ),
    constraints: [
      'OrderService must not call EmailClient or SmsClient directly',
      'Confirmation email and shipped SMS must both still be delivered',
      'Adding a new channel must not require editing OrderService',
    ],
    expectedTouchHints: ['OrderService', 'NotificationService', 'NotificationChannel', 'EmailChannel', 'SmsChannel'],
    protectedFlows: [
      {
        id: 'order-lifecycle',
        label: 'Order lifecycle',
        steps: ['Confirm order', 'Persist state', 'Ship order'],
        mustKeepElementNames: ['OrderService', 'OrderRepository'],
        mustReach: [{ from: 'OrderService', to: 'OrderRepository' }],
      },
      {
        id: 'existing-channels',
        label: 'Existing email and SMS delivery',
        mustKeepElementNames: ['EmailClient', 'SmsClient'],
      },
    ],
    newFlows: [
      {
        id: 'notification-ownership',
        label: 'Notifications own every channel',
        steps: ['Order publishes event', 'Notification picks channels', 'Channel delivers'],
        mustReach: [
          { from: 'OrderService', to: 'NotificationService' },
          { from: 'NotificationService', to: 'Channel' },
        ],
        mustHavePathTopics: ['channel'],
      },
    ],
  }),

  // ───────────────────────────── 439 ─────────────────────────────
  pack({
    slug: 'co-add-partial-refund',
    title: 'Support Partial Refunds',
    difficulty: 'medium',
    order: 439,
    tags: ['capability', 'payments', 'refunds', 'invariants'],
    description:
      'Refunds are all-or-nothing: RefundService always returns the entire order total. Support refunding part of an order — such as one damaged item — while making over-refunding impossible.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-pr-svc', 'RefundService', pos(1, 0), [
        m('refundOrder', 'RefundResult', ['orderId', 'string']),
      ]),
      node('n2', 'el-pr-order', 'Order', pos(0, 1), [
        m('markRefunded', 'void'),
      ], [
        { name: 'total', type: 'number' },
        { name: 'paymentId', type: 'string' },
        { name: 'status', type: 'OrderStatus' },
      ]),
      node('n3', 'el-pr-repo', 'OrderRepository', pos(1, 1), [
        m('findById', 'Order', ['orderId', 'string']),
        m('save', 'void', ['order', 'Order']),
      ]),
      node('n4', 'el-pr-gw', 'PaymentGateway', pos(2, 1), [
        m('refund', 'RefundResult', ['paymentId', 'string'], ['amount', 'number']),
      ]),
      node('n5', 'el-pr-audit', 'AuditLog', pos(1, 2), [
        m('record', 'void', ['event', 'string'], ['orderId', 'string']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-pr-1', 'n1', 'n2'),
      edge('e2', 'ed-pr-2', 'n1', 'n3'),
      edge('e3', 'ed-pr-3', 'n1', 'n4'),
      edge('e4', 'ed-pr-4', 'n3', 'n5'),
    ],
    changeRequest: {
      title: 'Allow refunding a portion of an order',
      body:
        'Support keeps cancelling whole orders to refund a single broken item. Agents should be able to refund any amount up to what the customer has not yet had back — possibly in several steps.\n\n' +
        'The existing full-refund behaviour must keep working. The payment gateway already accepts an amount, and it belongs to another team.',
      type: 'capability',
    },
    briefing: brief(
      'RefundService.refundOrder loads the order, calls PaymentGateway.refund with the whole total, flips the order to refunded and writes an audit entry. PaymentGateway.refund already takes an amount.',
      'There is nowhere to say “how much” and nowhere to remember what was already refunded. A second partial refund could silently exceed what the customer paid, and the order status would be wrong after the first one.',
      'Extend the refund capability to accept an amount, track how much has been refunded so far, and reject anything beyond the refundable balance. A full refund becomes just the case where the amount equals what is left.',
      'Look at the Order entity: it knows the total but not the refunded-so-far. Decide where the “remaining refundable” rule belongs, then see how RefundService should call it.',
    ),
    constraints: [
      'Total refunds for an order may never exceed its total',
      'PaymentGateway is owned by another team — do not modify it',
      'The existing full-refund flow must keep working',
    ],
    forbidModifyElementNames: ['PaymentGateway'],
    expectedTouchHints: ['RefundService', 'Order', 'refundPartial', 'remainingRefundable'],
    protectedFlows: [
      {
        id: 'full-refund',
        label: 'Full refund',
        steps: ['Load order', 'Refund full amount', 'Mark refunded', 'Audit'],
        mustKeepElementNames: ['RefundService', 'Order', 'OrderRepository', 'PaymentGateway'],
        mustReach: [
          { from: 'RefundService', to: 'PaymentGateway' },
          { from: 'RefundService', to: 'OrderRepository' },
        ],
      },
      {
        id: 'audit-trail',
        label: 'Refunds remain audited',
        mustKeepElementNames: ['AuditLog'],
        mustReach: [{ from: 'RefundService', to: 'AuditLog' }],
      },
    ],
    newFlows: [
      {
        id: 'partial-refund',
        label: 'Partial refund with balance check',
        steps: ['Load order', 'Check refundable balance', 'Refund amount', 'Record cumulative refunded'],
        mustHavePathTopics: ['partial', 'refundable'],
        mustReach: [{ from: 'RefundService', to: 'PaymentGateway' }],
      },
    ],
  }),

  // ───────────────────────────── 440 ─────────────────────────────
  pack({
    slug: 'co-seat-lock-ttl',
    title: 'Add Seat Lock Expiry',
    difficulty: 'medium',
    order: 440,
    tags: ['behavior', 'booking', 'concurrency', 'ttl'],
    description:
      'Seats are locked when a user starts booking and never released if they walk away. Add a time-to-live so abandoned holds free themselves.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-sl-booking', 'BookingService', pos(1, 0), [
        m('holdSeat', 'boolean', ['showId', 'string'], ['seatId', 'string'], ['userId', 'string']),
        m('confirmBooking', 'Booking', ['holdId', 'string'], ['paymentToken', 'string']),
      ]),
      node('n2', 'el-sl-inv', 'SeatInventory', pos(0, 1), [
        m('lock', 'boolean', ['showId', 'string'], ['seatId', 'string'], ['userId', 'string']),
        m('unlock', 'void', ['showId', 'string'], ['seatId', 'string']),
      ], [{ name: 'lockedSeats', type: 'Map<string, string>' }]),
      node('n3', 'el-sl-pay', 'PaymentService', pos(1, 1), [
        m('charge', 'PaymentResult', ['token', 'string'], ['amount', 'number']),
      ]),
      node('n4', 'el-sl-repo', 'BookingRepository', pos(2, 1), [
        m('save', 'void', ['booking', 'Booking']),
      ]),
      node('n5', 'el-sl-b', 'Booking', pos(1, 2), ['markConfirmed'], [
        { name: 'bookingId', type: 'string' },
        { name: 'seatId', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-sl-1', 'n1', 'n2'),
      edge('e2', 'ed-sl-2', 'n1', 'n3'),
      edge('e3', 'ed-sl-3', 'n1', 'n4'),
      edge('e4', 'ed-sl-4', 'n4', 'n5'),
    ],
    changeRequest: {
      title: 'Expire abandoned seat holds after 5 minutes',
      body:
        'On opening night the front rows were “sold out” for an hour because hundreds of users started a booking and closed the tab. Their locks never went away.\n\n' +
        'A hold must now be valid for a limited window. After it lapses the seat is bookable again and a late confirmation must be rejected. Normal bookings that finish in time are unaffected.',
      type: 'behavior',
    },
    briefing: brief(
      'BookingService.holdSeat asks SeatInventory to lock a seat; confirmBooking charges and saves. SeatInventory remembers only who holds a seat — not since when.',
      'A lock with no lifetime is a permanent lock. Without a timestamp nothing can tell “held 2 seconds ago” from “held 2 days ago”, and a slow payment could confirm a seat somebody else has since taken.',
      'Give each hold an expiry, make expired holds stop blocking others, and make confirmation fail when the hold has lapsed. Think about how time enters the design so it can be tested.',
      'Start in SeatInventory — it owns the lock state. Then decide whether expired locks are cleaned lazily when read, by a sweeper, or both, and how confirmBooking learns the hold is still valid.',
    ),
    constraints: [
      'PaymentService must stay unaware of seat locks',
      'Confirming an expired hold must fail before any charge happens',
      'Bookings completed within the window behave as today',
    ],
    expectedTouchHints: ['SeatInventory', 'SeatLock', 'Clock', 'BookingService'],
    protectedFlows: [
      {
        id: 'book-in-time',
        label: 'Booking inside the hold window',
        steps: ['Hold seat', 'Charge', 'Save booking'],
        mustKeepElementNames: ['BookingService', 'SeatInventory', 'PaymentService', 'BookingRepository'],
        mustReach: [
          { from: 'BookingService', to: 'SeatInventory' },
          { from: 'BookingService', to: 'PaymentService' },
          { from: 'BookingService', to: 'BookingRepository' },
        ],
      },
      {
        id: 'payment-isolation',
        label: 'Payments stay lock-agnostic',
        mustNotReach: [{ from: 'PaymentService', to: 'SeatInventory' }],
      },
    ],
    newFlows: [
      {
        id: 'lock-expiry',
        label: 'Holds expire',
        steps: ['Record expiry on hold', 'Ignore or purge expired holds', 'Reject late confirmation'],
        mustHavePathTopics: ['expir'],
      },
    ],
  }),

  // ───────────────────────────── 441 ─────────────────────────────
  pack({
    slug: 'co-read-replica-scale',
    title: 'Route Reads to Replica',
    difficulty: 'medium',
    order: 441,
    tags: ['scale', 'catalog', 'database', 'read-replica'],
    description:
      'Every catalog browse hits the primary database, which is also taking all writes. Send read traffic to a replica while price edits still go to the primary.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-rr-catalog', 'CatalogService', pos(0, 0), [
        m('getProduct', 'Product', ['sku', 'string']),
        m('search', 'Product[]', ['query', 'string'], ['page', 'number']),
      ]),
      node('n2', 'el-rr-admin', 'AdminCatalogService', pos(2, 0), [
        m('updatePrice', 'void', ['sku', 'string'], ['price', 'number']),
      ]),
      node('n3', 'el-rr-repo', 'ProductRepository', pos(1, 1), [
        m('findBySku', 'Product', ['sku', 'string']),
        m('searchByText', 'Product[]', ['query', 'string']),
        m('savePrice', 'void', ['sku', 'string'], ['price', 'number']),
      ]),
      node('n4', 'el-rr-db', 'PrimaryDb', pos(1, 2), [
        m('query', 'Row[]', ['sql', 'string']),
        m('execute', 'void', ['sql', 'string']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-rr-1', 'n1', 'n3'),
      edge('e2', 'ed-rr-2', 'n2', 'n3'),
      edge('e3', 'ed-rr-3', 'n3', 'n4'),
    ],
    changeRequest: {
      title: 'Serve catalog reads from a read replica',
      body:
        'Browse and search make up 95% of database load and they share one primary with all writes. During sales the primary saturates and price updates time out.\n\n' +
        'Add a read replica and route read-only catalog queries to it. Writes and anything that must see its own writes stay on the primary. A short replication lag on browse pages is acceptable; it must not break the admin who just changed a price.',
      type: 'scale',
    },
    briefing: brief(
      'CatalogService and AdminCatalogService share ProductRepository, which uses a single PrimaryDb for both reads and writes. There is no concept of a different database for a different kind of access.',
      'Scaling the primary vertically is expensive and does not stop reads from starving writes. If you just point everything at a replica, price updates fail because replicas are read-only.',
      'Introduce the replica and make the read path and the write path explicit so each reaches the right database. The public behaviour of getProduct, search and updatePrice must stay the same.',
      'Look at ProductRepository: it mixes query methods with savePrice. Think about who should decide the target database, and what the admin needs after saving (reading back from the primary).',
    ),
    constraints: [
      'All writes must still reach PrimaryDb',
      'Catalog browse and search must be able to reach the replica',
      'Do not make the admin read-after-write depend on replica freshness',
    ],
    expectedTouchHints: ['ProductRepository', 'PrimaryDb', 'ReplicaDb', 'ProductReader', 'ProductWriter'],
    protectedFlows: [
      {
        id: 'price-write',
        label: 'Admin price update',
        steps: ['Admin edits price', 'Repository persists', 'Primary executes write'],
        mustKeepElementNames: ['AdminCatalogService', 'PrimaryDb'],
        mustReach: [{ from: 'AdminCatalogService', to: 'PrimaryDb' }],
      },
      {
        id: 'catalog-api',
        label: 'Catalog API still exists',
        mustKeepElementNames: ['CatalogService', 'ProductRepository'],
        mustHavePathTopics: ['getproduct', 'search'],
      },
    ],
    newFlows: [
      {
        id: 'replica-reads',
        label: 'Browse reads go to replica',
        steps: ['Catalog query', 'Read-only data access', 'Replica serves rows'],
        mustKeepElementNames: ['Replica'],
        mustReach: [{ from: 'CatalogService', to: 'Replica' }],
      },
    ],
  }),

  // ───────────────────────────── 442 ─────────────────────────────
  pack({
    slug: 'co-idempotent-webhooks',
    title: 'Make Payment Webhooks Idempotent',
    difficulty: 'medium',
    order: 442,
    tags: ['failure', 'payments', 'webhooks', 'idempotency'],
    description:
      'The payment provider retries webhooks on timeout, and each retry credits the ledger and emails a receipt again. Make processing the same event twice a no-op.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-wh-ctrl', 'WebhookController', pos(1, 0), [
        m('handle', 'void', ['payload', 'string'], ['signature', 'string']),
        m('verifySignature', 'boolean', ['payload', 'string'], ['signature', 'string']),
      ]),
      node('n2', 'el-wh-handler', 'PaymentWebhookHandler', pos(1, 1), [
        m('onPaymentCaptured', 'void', ['event', 'PaymentEvent']),
      ]),
      node('n3', 'el-wh-order', 'OrderService', pos(0, 2), [
        m('markPaid', 'void', ['orderId', 'string']),
      ]),
      node('n4', 'el-wh-ledger', 'LedgerService', pos(1, 2), [
        m('credit', 'void', ['merchantId', 'string'], ['amount', 'number']),
      ]),
      node('n5', 'el-wh-notify', 'ReceiptMailer', pos(2, 2), [
        m('sendReceipt', 'void', ['orderId', 'string']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-wh-1', 'n1', 'n2'),
      edge('e2', 'ed-wh-2', 'n2', 'n3'),
      edge('e3', 'ed-wh-3', 'n2', 'n4'),
      edge('e4', 'ed-wh-4', 'n2', 'n5'),
    ],
    changeRequest: {
      title: 'Process each payment event exactly once',
      body:
        'The provider guarantees at-least-once delivery. On Tuesday a 30-second timeout caused four retries of the same payment.captured event: the merchant was credited four times and the customer got four receipts.\n\n' +
        'The same event id arriving again must change nothing and still return success to the provider. Concurrent duplicates must not both slip through, and a failed attempt must stay retryable.',
      type: 'failure',
    },
    briefing: brief(
      'WebhookController verifies the signature and passes the event to PaymentWebhookHandler, which marks the order paid, credits the ledger and sends a receipt. Nothing remembers which events were already seen.',
      'Every delivery looks brand new, so every side effect repeats. A simple “check then act” still races when two retries arrive together, and marking an event done before the work finishes would swallow real failures.',
      'Add an idempotency guard keyed by the provider’s event id so each event is claimed once atomically and completed only after its effects succeed. Duplicates are acknowledged but skipped.',
      'Decide where the guard sits relative to signature verification and the handler, and what small store it needs. Then ask what state an event has between “claimed” and “done”.',
    ),
    constraints: [
      'Signature verification must still happen first',
      'A duplicate event must return success without repeating side effects',
      'An event that failed midway must remain retryable',
    ],
    expectedTouchHints: ['WebhookController', 'PaymentWebhookHandler', 'IdempotencyStore'],
    protectedFlows: [
      {
        id: 'first-delivery',
        label: 'First delivery processes normally',
        steps: ['Verify signature', 'Mark order paid', 'Credit ledger', 'Send receipt'],
        mustKeepElementNames: ['WebhookController', 'PaymentWebhookHandler', 'OrderService', 'LedgerService'],
        mustReach: [
          { from: 'WebhookController', to: 'PaymentWebhookHandler' },
          { from: 'PaymentWebhookHandler', to: 'OrderService' },
          { from: 'PaymentWebhookHandler', to: 'LedgerService' },
        ],
      },
      {
        id: 'signature-check',
        label: 'Signature verification kept',
        mustHavePathTopics: ['signature'],
      },
    ],
    newFlows: [
      {
        id: 'dedupe',
        label: 'Duplicate events are no-ops',
        steps: ['Claim event id', 'Skip if already claimed', 'Complete after side effects'],
        mustReach: [{ from: 'WebhookController', to: 'Idempotency' }],
        mustHavePathTopics: ['idempot'],
      },
    ],
  }),

  // ───────────────────────────── 443 ─────────────────────────────
  pack({
    slug: 'co-extract-fee-policy',
    title: 'Extract Parking Fee Policy',
    difficulty: 'medium',
    order: 443,
    tags: ['variation', 'parking-lot', 'strategy', 'pricing'],
    description:
      'ParkingLot calculates fees with a growing if/else on vehicle type. Pull the pricing rules into a policy so weekend rates and EV discounts do not mean editing exit handling.',
    maxNewClasses: 4,
    nodes: [
      node('n1', 'el-pf-gate', 'ExitGate', pos(1, 0), [
        m('scanTicket', 'void', ['ticketId', 'string']),
      ]),
      node('n2', 'el-pf-lot', 'ParkingLot', pos(1, 1), [
        m('processExit', 'Receipt', ['ticketId', 'string']),
        m('calculateFee', 'number', ['ticket', 'Ticket'], ['exitTime', 'Date']),
        m('freeSpot', 'void', ['spotId', 'string']),
      ]),
      node('n3', 'el-pf-ticket', 'Ticket', pos(0, 2), ['durationHours'], [
        { name: 'ticketId', type: 'string' },
        { name: 'vehicleType', type: 'VehicleType' },
        { name: 'entryTime', type: 'Date' },
      ]),
      node('n4', 'el-pf-term', 'PaymentTerminal', pos(2, 2), [
        m('collect', 'boolean', ['amount', 'number']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-pf-1', 'n1', 'n2'),
      edge('e2', 'ed-pf-2', 'n2', 'n3'),
      edge('e3', 'ed-pf-3', 'n2', 'n4'),
    ],
    changeRequest: {
      title: 'Make parking fees a swappable policy',
      body:
        'ParkingLot.calculateFee has an if/else for cars, bikes and trucks. Operations now wants weekend rates, EV discounts and a mall-validation mode, each chosen per facility.\n\n' +
        'Exit handling, ticket scanning and payment collection must behave exactly as before. Fee rules must be testable without a lot, a gate or a terminal.',
      type: 'variation',
    },
    briefing: brief(
      'ExitGate scans a ticket and hands it to ParkingLot.processExit, which computes the fee, collects payment through PaymentTerminal and frees the spot. The fee arithmetic is embedded in ParkingLot.',
      'Each new pricing rule becomes another branch inside a class whose real job is orchestrating an exit. Fee changes risk breaking spot release, and the fee logic cannot be tested without constructing the whole lot.',
      'Extract fee calculation behind a policy abstraction with the current behaviour as the default implementation, so ParkingLot only asks for a fee. New rules should arrive as new policies, not new branches.',
      'Start at ParkingLot.calculateFee. Ask which data the policy needs (Ticket) and which things it must never know about (the lot itself, the terminal).',
    ),
    constraints: [
      'ParkingLot must not branch on vehicle type',
      'The policy must not depend on ParkingLot or PaymentTerminal',
      'Existing fees for cars, bikes and trucks must stay identical',
    ],
    expectedTouchHints: ['ParkingLot', 'FeePolicy', 'HourlyFeePolicy', 'Ticket'],
    protectedFlows: [
      {
        id: 'exit-and-pay',
        label: 'Exit and payment',
        steps: ['Scan ticket', 'Compute fee', 'Collect payment', 'Free spot'],
        mustKeepElementNames: ['ExitGate', 'ParkingLot', 'Ticket', 'PaymentTerminal'],
        mustReach: [
          { from: 'ExitGate', to: 'ParkingLot' },
          { from: 'ParkingLot', to: 'Ticket' },
          { from: 'ParkingLot', to: 'PaymentTerminal' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'fee-policy',
        label: 'Pluggable fee policy',
        steps: ['ParkingLot asks policy for fee', 'Policy reads ticket', 'Returns amount'],
        mustReach: [{ from: 'ParkingLot', to: 'FeePolicy' }],
        mustNotReach: [
          { from: 'FeePolicy', to: 'ParkingLot' },
          { from: 'FeePolicy', to: 'PaymentTerminal' },
        ],
        mustHavePathTopics: ['policy'],
      },
    ],
  }),

  // ───────────────────────────── 444 ─────────────────────────────
  pack({
    slug: 'co-cancel-releases-stock',
    title: 'Cancel Must Release Inventory',
    difficulty: 'medium',
    order: 444,
    tags: ['behavior', 'orders', 'inventory', 'cancellation'],
    description:
      'Cancelling an order refunds the customer but never returns the items to stock, so inventory shrinks with every cancellation. Make cancel put the stock back — exactly once and only if the goods have not shipped.',
    maxNewClasses: 3,
    nodes: [
      node('n1', 'el-cs-order', 'OrderService', pos(1, 0), [
        m('placeOrder', 'Order', ['cartId', 'string']),
        m('cancelOrder', 'void', ['orderId', 'string']),
      ]),
      node('n2', 'el-cs-inv', 'InventoryService', pos(0, 1), [
        m('decrementStock', 'boolean', ['sku', 'string'], ['qty', 'number']),
      ], [{ name: 'stockBySku', type: 'Map<string, number>' }]),
      node('n3', 'el-cs-pay', 'PaymentService', pos(1, 1), [
        m('refund', 'void', ['paymentId', 'string']),
      ]),
      node('n4', 'el-cs-ship', 'ShipmentService', pos(2, 1), [
        m('hasShipped', 'boolean', ['orderId', 'string']),
      ]),
      node('n5', 'el-cs-repo', 'OrderRepository', pos(1, 2), [
        m('findById', 'Order', ['orderId', 'string']),
        m('save', 'void', ['order', 'Order']),
      ]),
    ],
    edges: [
      edge('e1', 'ed-cs-1', 'n1', 'n2'),
      edge('e2', 'ed-cs-2', 'n1', 'n3'),
      edge('e3', 'ed-cs-3', 'n1', 'n4'),
      edge('e4', 'ed-cs-4', 'n1', 'n5'),
    ],
    changeRequest: {
      title: 'Return stock when an order is cancelled',
      body:
        'The warehouse count drifts lower every week: orders cancelled before dispatch are refunded but their units are never added back, so popular SKUs show “out of stock” while shelves are full.\n\n' +
        'Cancelling an unshipped order must give its quantities back to inventory exactly once, even if the cancel request is retried. Shipped orders are still rejected for cancellation.',
      type: 'behavior',
    },
    briefing: brief(
      'OrderService.cancelOrder checks with ShipmentService, refunds through PaymentService and saves the new status. InventoryService can only decrement; the cancel path never talks to it for the opposite direction.',
      'Stock leaves on placeOrder but never returns on cancelOrder, so the numbers only go down. Simply adding stock on every cancel call would double-count when a client retries a cancel.',
      'Teach inventory how to take stock back, call it from the cancel flow at the right moment, and make the operation safe to repeat. Keep payments out of inventory concerns.',
      'Read cancelOrder top to bottom and mark each step it already performs. The gap is a missing collaborator call — then ask what makes that call safe on a retry (hint: the order’s own status).',
    ),
    constraints: [
      'PaymentService must not depend on InventoryService',
      'Releasing stock must be safe if cancel is retried',
      'Shipped orders must still be rejected before any refund or release',
    ],
    expectedTouchHints: ['OrderService', 'InventoryService', 'Order'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Placing an order',
        steps: ['Decrement stock', 'Save order'],
        mustKeepElementNames: ['OrderService', 'InventoryService', 'OrderRepository'],
        mustReach: [
          { from: 'OrderService', to: 'InventoryService' },
          { from: 'OrderService', to: 'OrderRepository' },
        ],
      },
      {
        id: 'cancel-guards',
        label: 'Cancellation guards and refund',
        steps: ['Reject if shipped', 'Refund payment'],
        mustReach: [
          { from: 'OrderService', to: 'ShipmentService' },
          { from: 'OrderService', to: 'PaymentService' },
        ],
        mustNotReach: [{ from: 'PaymentService', to: 'InventoryService' }],
      },
    ],
    newFlows: [
      {
        id: 'release-on-cancel',
        label: 'Cancel returns stock once',
        steps: ['Verify not shipped', 'Refund', 'Release reserved quantities', 'Mark cancelled'],
        mustReach: [{ from: 'OrderService', to: 'InventoryService' }],
        mustHavePathTopics: ['release'],
      },
    ],
  }),
]
