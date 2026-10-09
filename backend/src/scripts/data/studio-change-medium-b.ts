/**
 * Design Studio "Change One Thing" packs — medium B (orders 445–455).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

export const MEDIUM_B: ChangePackSeed[] = [
  // ── 445 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-retry-with-backoff',
    title: 'Add Retry With Backoff on SMS',
    difficulty: 'medium',
    order: 445,
    description:
      'The SMS gateway times out now and then and messages are silently lost. Add retry with backoff on the SMS path without changing how other channels work.',
    tags: ['notification', 'retry', 'resilience', 'failure'],
    nodes: [
      node('n1', 'el-sms-notif', 'NotificationService', pos(1, 0), ['notifyUser', 'sendSms', 'sendPush'], [
        { name: 'smsSender', type: 'SmsSender' },
      ]),
      node('n2', 'el-sms-sender', 'SmsSender', pos(0, 1), ['send', 'formatMessage']),
      node('n3', 'el-sms-gw', 'SmsGateway', pos(0, 2), ['post']),
      node('n4', 'el-sms-user', 'User', pos(1, 1), ['getPhone', 'getName']),
      node('n5', 'el-sms-log', 'DeliveryLog', pos(2, 1), ['recordSent', 'recordFailed']),
    ],
    edges: [
      edge('e1', 'ed-sms-1', 'n1', 'n2'),
      edge('e2', 'ed-sms-2', 'n1', 'n4'),
      edge('e3', 'ed-sms-3', 'n1', 'n5'),
      edge('e4', 'ed-sms-4', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Add Retry With Backoff on SMS',
      body:
        'The SMS gateway fails intermittently (timeouts, 503s). Today SmsSender calls it once and the message is lost. Retry failed sends with increasing delays, give up after a few attempts, and record the final outcome.',
      type: 'failure',
    },
    briefing:
      'What’s going on\nNotificationService hands SMS work to SmsSender, which makes a single call to SmsGateway.\n\n' +
      'The problem (simple terms)\nOne blip from the gateway and the user never gets their code.\n\n' +
      'What you should do\nAdd retry with backoff around the gateway call. Keep NotificationService’s public API unchanged and keep logging the result.\n\n' +
      'Where to start\nLook at SmsSender → SmsGateway. That is the only call that can fail transiently.',
    constraints: [
      'Retry logic belongs on the SMS path, not in NotificationService',
      'Callers of NotificationService must not change',
      'The final success or failure must still reach DeliveryLog',
    ],
    forbidModifyElementNames: ['SmsGateway', 'User'],
    maxNewClasses: 2,
    expectedTouchHints: ['SmsSender', 'DeliveryLog'],
    protectedFlows: [
      {
        id: 'notify-by-sms',
        label: 'Notify user by SMS',
        steps: ['Look up phone', 'Send via SmsSender', 'Call gateway', 'Record result'],
        mustKeepElementNames: ['NotificationService', 'SmsSender', 'SmsGateway'],
        mustReach: [
          { from: 'NotificationService', to: 'SmsSender' },
          { from: 'SmsSender', to: 'SmsGateway' },
          { from: 'NotificationService', to: 'DeliveryLog' },
        ],
        mustHavePathTopics: ['sms', 'send', 'gateway'],
      },
    ],
    newFlows: [
      {
        id: 'retry-sms',
        label: 'Retry failed SMS with backoff',
        steps: ['Gateway call fails', 'Wait with backoff', 'Retry up to max attempts', 'Record final outcome'],
        mustReach: [{ from: 'SmsSender', to: 'SmsGateway' }],
        mustHavePathTopics: ['retry', 'backoff', 'attempt'],
      },
    ],
  }),

  // ── 446 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-multi-currency-price',
    title: 'Support Multi-Currency Prices',
    difficulty: 'medium',
    order: 446,
    description:
      'Prices are plain numbers in one currency. Let a product be priced and totalled in different currencies without breaking the existing single-currency checkout.',
    tags: ['pricing', 'currency', 'money', 'variation'],
    nodes: [
      node('n1', 'el-cur-product', 'Product', pos(0, 1), ['getName', 'getPrice'], [{ name: 'price', type: 'double' }]),
      node('n2', 'el-cur-cart', 'Cart', pos(1, 1), ['addItem', 'removeItem', 'getTotal']),
      node('n3', 'el-cur-calc', 'PriceCalculator', pos(1, 2), ['subtotal', 'applyTax']),
      node('n4', 'el-cur-checkout', 'CheckoutService', pos(1, 0), ['checkout']),
      node('n5', 'el-cur-invoice', 'Invoice', pos(2, 1), ['render', 'getTotal']),
    ],
    edges: [
      edge('e1', 'ed-cur-1', 'n4', 'n2'),
      edge('e2', 'ed-cur-2', 'n2', 'n1'),
      edge('e3', 'ed-cur-3', 'n2', 'n3'),
      edge('e4', 'ed-cur-4', 'n4', 'n5'),
    ],
    changeRequest: {
      title: 'Support Multi-Currency Prices',
      body:
        'We are launching in new regions. A product must be able to have a price in USD, EUR, INR and more, and the cart total and invoice must show the right currency. Existing USD-only orders must keep working exactly as before.',
      type: 'variation',
    },
    briefing:
      'What’s going on\nProduct stores a bare double, and Cart / PriceCalculator add those doubles together.\n\n' +
      'The problem (simple terms)\nA number with no currency cannot be safely added, taxed or shown to someone in another country.\n\n' +
      'What you should do\nMake the amount carry its currency, and decide where conversion or currency checks happen. Keep the checkout flow intact for current customers.\n\n' +
      'Where to start\nFollow the price from Product through Cart and PriceCalculator to Invoice.',
    constraints: [
      'Existing USD checkout must still work without caller changes',
      'Never add amounts of different currencies without conversion',
      'Keep CheckoutService orchestration unchanged',
    ],
    forbidModifyElementNames: ['CheckoutService'],
    maxNewClasses: 3,
    expectedTouchHints: ['Product', 'PriceCalculator', 'Invoice'],
    protectedFlows: [
      {
        id: 'single-currency-checkout',
        label: 'Existing checkout',
        steps: ['Add items to cart', 'Compute subtotal', 'Create invoice'],
        mustKeepElementNames: ['CheckoutService', 'Cart', 'PriceCalculator', 'Invoice'],
        mustReach: [
          { from: 'CheckoutService', to: 'Cart' },
          { from: 'Cart', to: 'PriceCalculator' },
          { from: 'CheckoutService', to: 'Invoice' },
        ],
        mustHavePathTopics: ['cart', 'price', 'invoice'],
      },
    ],
    newFlows: [
      {
        id: 'priced-in-currency',
        label: 'Price and total in a chosen currency',
        steps: ['Product exposes price with currency', 'Calculator sums same-currency amounts', 'Invoice shows currency'],
        mustReach: [
          { from: 'Cart', to: 'Product' },
          { from: 'Cart', to: 'PriceCalculator' },
        ],
        mustHavePathTopics: ['currency', 'money', 'convert'],
      },
    ],
  }),

  // ── 447 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-auth-no-firebase',
    title: 'Auth Must Not Depend on Firebase',
    difficulty: 'medium',
    order: 447,
    description:
      'AuthService calls the Firebase client directly. Leadership wants the option to swap providers, so core auth must stop knowing about Firebase.',
    tags: ['auth', 'dependency', 'ports', 'constraint'],
    nodes: [
      node('n1', 'el-auth-ctrl', 'LoginController', pos(1, 0), ['login', 'logout']),
      node('n2', 'el-auth-svc', 'AuthService', pos(1, 1), ['authenticate', 'refresh', 'revoke']),
      node('n3', 'el-auth-fb', 'FirebaseAuthClient', pos(0, 2), ['signInWithPassword', 'verifyIdToken']),
      node('n4', 'el-auth-sess', 'UserSession', pos(2, 1), ['getUserId', 'isExpired']),
      node('n5', 'el-auth-store', 'TokenStore', pos(2, 2), ['save', 'find', 'delete']),
    ],
    edges: [
      edge('e1', 'ed-auth-1', 'n1', 'n2'),
      edge('e2', 'ed-auth-2', 'n2', 'n3'),
      edge('e3', 'ed-auth-3', 'n2', 'n4'),
      edge('e4', 'ed-auth-4', 'n2', 'n5'),
    ],
    changeRequest: {
      title: 'Auth Must Not Depend on Firebase',
      body:
        'The auth module must not reference Firebase. We may switch to another identity provider next quarter. Firebase can still be the provider today, but only as a replaceable detail behind an abstraction.',
      type: 'constraint',
    },
    briefing:
      'What’s going on\nAuthService calls FirebaseAuthClient directly to sign users in and verify tokens.\n\n' +
      'The problem (simple terms)\nAny provider change forces edits to core auth logic, which also gets tangled with Firebase-specific types.\n\n' +
      'What you should do\nPut an abstraction between AuthService and the provider. Firebase stays as one implementation of it. Login must keep working.\n\n' +
      'Where to start\nThe arrow from AuthService to FirebaseAuthClient is the one that breaks the rule.',
    constraints: [
      'AuthService must have no direct dependency on FirebaseAuthClient',
      'Firebase may remain as an implementation behind an abstraction',
      'LoginController behaviour and API must not change',
    ],
    forbidModifyElementNames: ['LoginController', 'UserSession'],
    maxNewClasses: 2,
    expectedTouchHints: ['AuthService', 'FirebaseAuthClient'],
    protectedFlows: [
      {
        id: 'login',
        label: 'User login',
        steps: ['Controller receives credentials', 'AuthService authenticates', 'Session token stored'],
        mustKeepElementNames: ['LoginController', 'AuthService', 'TokenStore'],
        mustReach: [
          { from: 'LoginController', to: 'AuthService' },
          { from: 'AuthService', to: 'TokenStore' },
          { from: 'AuthService', to: 'UserSession' },
        ],
        mustHavePathTopics: ['login', 'authenticate', 'token'],
      },
    ],
    newFlows: [
      {
        id: 'provider-independent-auth',
        label: 'Auth through a provider abstraction',
        steps: ['AuthService calls provider port', 'Firebase adapter implements port'],
        mustKeepElementNames: ['FirebaseAuthClient'],
        mustNotReach: [{ from: 'AuthService', to: 'FirebaseAuthClient' }],
        mustHavePathTopics: ['provider', 'port', 'adapter'],
      },
    ],
  }),

  // ── 448 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-soft-delete-users',
    title: 'Soft-Delete Users Instead of Hard Delete',
    difficulty: 'medium',
    order: 448,
    description:
      'Deleting a user removes the row and orphans their orders. Change deletion to a recoverable soft delete while keeping history and lookups correct.',
    tags: ['users', 'delete', 'data', 'behavior'],
    nodes: [
      node('n1', 'el-sd-svc', 'UserService', pos(1, 0), ['register', 'getUser', 'deleteUser']),
      node('n2', 'el-sd-repo', 'UserRepository', pos(1, 1), ['save', 'findById', 'findByEmail', 'delete']),
      node('n3', 'el-sd-user', 'User', pos(0, 1), ['getId', 'getEmail'], [
        { name: 'email', type: 'String' },
      ]),
      node('n4', 'el-sd-orders', 'OrderRepository', pos(2, 1), ['findByUser', 'save']),
      node('n5', 'el-sd-audit', 'AuditLog', pos(1, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-sd-1', 'n1', 'n2'),
      edge('e2', 'ed-sd-2', 'n1', 'n5'),
      edge('e3', 'ed-sd-3', 'n2', 'n3'),
      edge('e4', 'ed-sd-4', 'n4', 'n3'),
    ],
    changeRequest: {
      title: 'Soft-Delete Users Instead of Hard Delete',
      body:
        'When a user is deleted today, their row is erased and past orders point at nothing. Deleted users should be marked as deleted (with a timestamp), hidden from normal lookups, and still referenced by their order history.',
      type: 'behavior',
    },
    briefing:
      'What’s going on\nUserService.deleteUser calls UserRepository.delete, which removes the row.\n\n' +
      'The problem (simple terms)\nOrder history loses its owner and support cannot restore an account deleted by mistake.\n\n' +
      'What you should do\nMark users as deleted instead of removing them, make normal lookups skip deleted users, and keep the audit trail.\n\n' +
      'Where to start\nStart with what User knows about itself and what deleteUser asks the repository to do.',
    constraints: [
      'Order history must still resolve to the user',
      'Normal lookups must not return deleted users',
      'Keep the audit entry for every deletion',
    ],
    forbidModifyElementNames: ['OrderRepository'],
    maxNewClasses: 1,
    expectedTouchHints: ['User', 'UserRepository', 'UserService'],
    protectedFlows: [
      {
        id: 'get-user',
        label: 'Look up a user',
        steps: ['Service asks repository', 'Repository returns user'],
        mustKeepElementNames: ['UserService', 'UserRepository', 'User'],
        mustReach: [
          { from: 'UserService', to: 'UserRepository' },
          { from: 'UserRepository', to: 'User' },
        ],
        mustHavePathTopics: ['user', 'find'],
      },
      {
        id: 'order-history',
        label: 'Order history of a user',
        steps: ['Load orders for user id'],
        mustReach: [{ from: 'OrderRepository', to: 'User' }],
        mustHavePathTopics: ['order', 'history'],
      },
    ],
    newFlows: [
      {
        id: 'soft-delete',
        label: 'Soft-delete a user',
        steps: ['Mark user deleted with timestamp', 'Persist change', 'Write audit entry'],
        mustReach: [
          { from: 'UserService', to: 'UserRepository' },
          { from: 'UserService', to: 'AuditLog' },
        ],
        mustHavePathTopics: ['soft', 'delete', 'deletedAt'],
      },
    ],
  }),

  // ── 449 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-circuit-breaker-pay',
    title: 'Circuit Breaker Around Payments',
    difficulty: 'medium',
    order: 449,
    description:
      'When the payment provider is down, checkout threads pile up waiting on it. Add a circuit breaker so failures fail fast and the system recovers on its own.',
    tags: ['payments', 'circuit-breaker', 'resilience', 'failure'],
    nodes: [
      node('n1', 'el-cb-checkout', 'CheckoutService', pos(1, 0), ['placeOrder', 'cancelOrder']),
      node('n2', 'el-cb-pay', 'PaymentClient', pos(0, 1), ['charge', 'refund']),
      node('n3', 'el-cb-orders', 'OrderRepository', pos(1, 1), ['save', 'markFailed']),
      node('n4', 'el-cb-receipt', 'ReceiptService', pos(2, 1), ['sendReceipt']),
      node('n5', 'el-cb-order', 'Order', pos(1, 2), ['getTotal', 'getStatus']),
    ],
    edges: [
      edge('e1', 'ed-cb-1', 'n1', 'n2'),
      edge('e2', 'ed-cb-2', 'n1', 'n3'),
      edge('e3', 'ed-cb-3', 'n1', 'n4'),
      edge('e4', 'ed-cb-4', 'n3', 'n5'),
    ],
    changeRequest: {
      title: 'Circuit Breaker Around Payments',
      body:
        'During the last provider outage every checkout waited for a timeout, exhausting our workers. After repeated failures the payment call should be short-circuited (fail fast), then probe occasionally and close again when the provider recovers.',
      type: 'failure',
    },
    briefing:
      'What’s going on\nCheckoutService calls PaymentClient.charge directly for every order.\n\n' +
      'The problem (simple terms)\nWhen the provider is down each request still waits for the full timeout, slowing everything else.\n\n' +
      'What you should do\nWrap the payment call with a circuit breaker with open, half-open and closed behaviour. Failed orders must be marked failed, not lost.\n\n' +
      'Where to start\nCheckoutService → PaymentClient is the risky edge. Keep the happy path unchanged.',
    constraints: [
      'Happy-path checkout behaviour must not change',
      'When the breaker is open, orders are marked failed without calling the provider',
      'Do not put breaker state inside Order',
    ],
    forbidModifyElementNames: ['Order', 'ReceiptService'],
    maxNewClasses: 2,
    expectedTouchHints: ['CheckoutService', 'PaymentClient'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Place order',
        steps: ['Charge payment', 'Save order', 'Send receipt'],
        mustKeepElementNames: ['CheckoutService', 'PaymentClient', 'OrderRepository', 'ReceiptService'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentClient' },
          { from: 'CheckoutService', to: 'OrderRepository' },
          { from: 'CheckoutService', to: 'ReceiptService' },
        ],
        mustHavePathTopics: ['charge', 'order', 'receipt'],
      },
    ],
    newFlows: [
      {
        id: 'fail-fast-on-open',
        label: 'Fail fast when payments are failing',
        steps: ['Breaker counts failures', 'Breaker opens', 'Order marked failed without provider call', 'Probe and close on recovery'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentClient' },
          { from: 'CheckoutService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['circuit', 'breaker', 'open', 'fallback'],
      },
    ],
  }),

  // ── 450 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-rate-limit-api',
    title: 'Add Per-User Rate Limit',
    difficulty: 'medium',
    order: 450,
    description:
      'One heavy user can hammer the search API and slow everyone down. Add a per-user rate limit that runs after authentication.',
    tags: ['api', 'rate-limit', 'scale', 'constraint'],
    nodes: [
      node('n1', 'el-rl-ctrl', 'ApiController', pos(1, 0), ['handle']),
      node('n2', 'el-rl-auth', 'AuthFilter', pos(0, 1), ['authenticate']),
      node('n3', 'el-rl-search', 'SearchService', pos(1, 1), ['search']),
      node('n4', 'el-rl-index', 'SearchIndex', pos(1, 2), ['query']),
      node('n5', 'el-rl-metrics', 'MetricsRecorder', pos(2, 1), ['increment', 'timing']),
    ],
    edges: [
      edge('e1', 'ed-rl-1', 'n1', 'n2'),
      edge('e2', 'ed-rl-2', 'n1', 'n3'),
      edge('e3', 'ed-rl-3', 'n3', 'n4'),
      edge('e4', 'ed-rl-4', 'n1', 'n5'),
    ],
    changeRequest: {
      title: 'Add Per-User Rate Limit',
      body:
        'Limit each authenticated user to a fixed number of API requests per minute. Excess requests should be rejected before they reach SearchService, and the rejection should be counted in metrics. Anonymous traffic is out of scope.',
      type: 'scale',
    },
    briefing:
      'What’s going on\nApiController authenticates a request with AuthFilter, then calls SearchService, which hits the index.\n\n' +
      'The problem (simple terms)\nA single user can send unlimited requests and starve everyone else.\n\n' +
      'What you should do\nAdd a limiter keyed by user. It needs the user identity, so it must run after authentication and before search. Rejections should be measurable.\n\n' +
      'Where to start\nDecide where the check lives so SearchService and SearchIndex stay unaware of limits.',
    constraints: [
      'The limiter must run after AuthFilter and before SearchService',
      'SearchService and SearchIndex must not know about rate limiting',
      'Rejected requests must be recorded in metrics',
    ],
    forbidModifyElementNames: ['SearchService', 'SearchIndex', 'AuthFilter'],
    maxNewClasses: 2,
    expectedTouchHints: ['ApiController'],
    protectedFlows: [
      {
        id: 'search-request',
        label: 'Authenticated search',
        steps: ['Authenticate', 'Search', 'Query index'],
        mustKeepElementNames: ['ApiController', 'AuthFilter', 'SearchService', 'SearchIndex'],
        mustReach: [
          { from: 'ApiController', to: 'AuthFilter' },
          { from: 'ApiController', to: 'SearchService' },
          { from: 'SearchService', to: 'SearchIndex' },
        ],
        mustHavePathTopics: ['authenticate', 'search', 'query'],
      },
    ],
    newFlows: [
      {
        id: 'rate-limit',
        label: 'Reject over-limit requests',
        steps: ['Identify user', 'Check per-user counter', 'Reject if over limit', 'Record rejection metric'],
        mustReach: [
          { from: 'ApiController', to: 'MetricsRecorder' },
        ],
        mustHavePathTopics: ['rate', 'limit', 'user', 'reject'],
      },
    ],
  }),

  // ── 451 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-versioned-api-v2',
    title: 'Add API v2 Without Breaking v1',
    difficulty: 'medium',
    order: 451,
    description:
      'Clients need a richer order response, but existing v1 integrations must not change. Add a v2 API alongside v1.',
    tags: ['api', 'versioning', 'compatibility', 'variation'],
    nodes: [
      node('n1', 'el-v2-v1ctrl', 'V1OrderController', pos(0, 0), ['getOrder', 'listOrders']),
      node('n2', 'el-v2-svc', 'OrderService', pos(1, 1), ['findOrder', 'listForCustomer']),
      node('n3', 'el-v2-dto', 'OrderDto', pos(0, 1), ['fromOrder'], [
        { name: 'id', type: 'String' },
        { name: 'total', type: 'double' },
      ]),
      node('n4', 'el-v2-repo', 'OrderRepository', pos(1, 2), ['findById', 'findByCustomer']),
      node('n5', 'el-v2-order', 'Order', pos(2, 2), ['getId', 'getItems', 'getTotal', 'getStatus']),
    ],
    edges: [
      edge('e1', 'ed-v2-1', 'n1', 'n2'),
      edge('e2', 'ed-v2-2', 'n1', 'n3'),
      edge('e3', 'ed-v2-3', 'n2', 'n4'),
      edge('e4', 'ed-v2-4', 'n4', 'n5'),
    ],
    changeRequest: {
      title: 'Add API v2 Without Breaking v1',
      body:
        'Partners want v2 of the order endpoints, which include line items and status history. Existing v1 clients must keep receiving exactly the current response shape. Do not fork the business logic.',
      type: 'variation',
    },
    briefing:
      'What’s going on\nV1OrderController maps Order to OrderDto and returns it. Partners depend on that exact shape.\n\n' +
      'The problem (simple terms)\nAdding fields to OrderDto or changing the controller would break v1 integrations.\n\n' +
      'What you should do\nAdd a v2 entry point and its own response model, reusing OrderService. v1 stays byte-for-byte the same.\n\n' +
      'Where to start\nDecide what v2 shares with v1 (service, repository) and what it must own (controller, response).',
    constraints: [
      'V1OrderController and OrderDto must not be modified',
      'Reuse OrderService; do not duplicate business logic',
      'v1 and v2 must be able to coexist',
    ],
    forbidModifyElementNames: ['V1OrderController', 'OrderDto'],
    maxNewClasses: 3,
    expectedTouchHints: ['OrderService'],
    protectedFlows: [
      {
        id: 'v1-get-order',
        label: 'v1 get order',
        steps: ['Controller asks service', 'Service loads order', 'Controller maps to OrderDto'],
        mustKeepElementNames: ['V1OrderController', 'OrderDto', 'OrderService', 'OrderRepository'],
        mustReach: [
          { from: 'V1OrderController', to: 'OrderService' },
          { from: 'V1OrderController', to: 'OrderDto' },
          { from: 'OrderService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['order', 'dto'],
      },
    ],
    newFlows: [
      {
        id: 'v2-get-order',
        label: 'v2 get order',
        steps: ['v2 controller calls service', 'Service loads order', 'Map to v2 response with items and history'],
        mustReach: [{ from: 'OrderService', to: 'OrderRepository' }],
        mustHavePathTopics: ['v2', 'response', 'order'],
      },
    ],
  }),

  // ── 452 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-async-email-after-order',
    title: 'Email After Order Must Be Async',
    difficulty: 'medium',
    order: 452,
    description:
      'Order placement waits for the confirmation email to be sent. Slow SMTP makes checkout slow. Move the email off the request path.',
    tags: ['email', 'async', 'queue', 'scale'],
    nodes: [
      node('n1', 'el-ae-order-svc', 'OrderService', pos(1, 0), ['placeOrder']),
      node('n2', 'el-ae-pay', 'PaymentService', pos(0, 1), ['charge']),
      node('n3', 'el-ae-repo', 'OrderRepository', pos(1, 1), ['save']),
      node('n4', 'el-ae-email', 'EmailSender', pos(2, 1), ['sendConfirmation'], [
        { name: 'smtpHost', type: 'String' },
      ]),
      node('n5', 'el-ae-order', 'Order', pos(1, 2), ['getCustomerEmail', 'getTotal']),
    ],
    edges: [
      edge('e1', 'ed-ae-1', 'n1', 'n2'),
      edge('e2', 'ed-ae-2', 'n1', 'n3'),
      edge('e3', 'ed-ae-3', 'n1', 'n4'),
      edge('e4', 'ed-ae-4', 'n3', 'n5'),
    ],
    changeRequest: {
      title: 'Email After Order Must Be Async',
      body:
        'During sales, SMTP latency makes order placement slow and sometimes fail entirely. The confirmation email must be sent asynchronously: placeOrder returns as soon as the order is saved, and a failed email must never fail the order.',
      type: 'behavior',
    },
    briefing:
      'What’s going on\nOrderService charges, saves, then calls EmailSender and waits for it.\n\n' +
      'The problem (simple terms)\nA slow or broken mail server delays or even breaks a purchase that already succeeded.\n\n' +
      'What you should do\nDecouple the email from the request, for example through a queue or event, so the email is sent later by a worker. Keep charging and saving as they are.\n\n' +
      'Where to start\nThe OrderService → EmailSender edge is synchronous. Put something between them.',
    constraints: [
      'placeOrder must not wait for the email to be sent',
      'An email failure must not fail or roll back the order',
      'Charging and saving order must keep working unchanged',
    ],
    forbidModifyElementNames: ['PaymentService', 'Order'],
    maxNewClasses: 2,
    expectedTouchHints: ['OrderService', 'EmailSender'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Place order',
        steps: ['Charge payment', 'Save order'],
        mustKeepElementNames: ['OrderService', 'PaymentService', 'OrderRepository'],
        mustReach: [
          { from: 'OrderService', to: 'PaymentService' },
          { from: 'OrderService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['charge', 'save', 'order'],
      },
    ],
    newFlows: [
      {
        id: 'async-confirmation-email',
        label: 'Send confirmation email asynchronously',
        steps: ['Order saved', 'Email job enqueued', 'Worker sends email later'],
        mustKeepElementNames: ['EmailSender'],
        mustHavePathTopics: ['async', 'queue', 'email', 'worker'],
      },
    ],
  }),

  // ── 453 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-inventory-port-on-cart',
    title: 'Cart Must Use Inventory Port',
    difficulty: 'medium',
    order: 453,
    description:
      'Cart talks straight to the SQL inventory class. Make Cart depend on an inventory abstraction instead so storage can be swapped and Cart can be tested.',
    tags: ['cart', 'inventory', 'ports', 'constraint'],
    nodes: [
      node('n1', 'el-ip-cart', 'Cart', pos(1, 0), ['addItem', 'removeItem', 'checkAvailability']),
      node('n2', 'el-ip-sql', 'SqlInventory', pos(1, 1), ['getStock', 'reserve', 'release']),
      node('n3', 'el-ip-product', 'Product', pos(0, 1), ['getSku', 'getName']),
      node('n4', 'el-ip-checkout', 'CheckoutService', pos(0, 0), ['checkout']),
      node('n5', 'el-ip-order', 'Order', pos(2, 0), ['getItems', 'getTotal']),
    ],
    edges: [
      edge('e1', 'ed-ip-1', 'n4', 'n1'),
      edge('e2', 'ed-ip-2', 'n1', 'n2'),
      edge('e3', 'ed-ip-3', 'n1', 'n3'),
      edge('e4', 'ed-ip-4', 'n4', 'n5'),
    ],
    changeRequest: {
      title: 'Cart Must Use Inventory Port',
      body:
        'Cart must not depend on SqlInventory directly. Introduce an inventory abstraction (port) that Cart uses, and let SqlInventory be one implementation of it. Cart should work with an in-memory fake in tests.',
      type: 'constraint',
    },
    briefing:
      'What’s going on\nCart checks availability and reserves stock by calling SqlInventory directly.\n\n' +
      'The problem (simple terms)\nCart is welded to one storage technology, so it cannot be unit-tested or moved to another store without edits.\n\n' +
      'What you should do\nAdd an inventory port that Cart depends on. SqlInventory implements it. Checkout and cart behaviour stay the same.\n\n' +
      'Where to start\nThe arrow from Cart to SqlInventory is the one to replace.',
    constraints: [
      'Cart must not reach SqlInventory directly',
      'SqlInventory may only appear as an implementation of the new abstraction',
      'CheckoutService and Product must not change',
    ],
    forbidModifyElementNames: ['CheckoutService', 'Product'],
    maxNewClasses: 1,
    expectedTouchHints: ['Cart', 'SqlInventory'],
    protectedFlows: [
      {
        id: 'add-to-cart',
        label: 'Add item and check stock',
        steps: ['Cart receives product', 'Cart checks availability', 'Item added'],
        mustKeepElementNames: ['Cart', 'Product', 'SqlInventory'],
        mustReach: [
          { from: 'CheckoutService', to: 'Cart' },
          { from: 'Cart', to: 'Product' },
        ],
        mustHavePathTopics: ['cart', 'availability', 'stock'],
      },
    ],
    newFlows: [
      {
        id: 'cart-via-port',
        label: 'Cart reaches inventory only via a port',
        steps: ['Cart calls inventory port', 'SqlInventory implements the port'],
        mustKeepElementNames: ['SqlInventory'],
        mustNotReach: [{ from: 'Cart', to: 'SqlInventory' }],
        mustHavePathTopics: ['inventory', 'port', 'interface'],
      },
    ],
  }),

  // ── 454 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-waitlist',
    title: 'Add Waitlist When Sold Out',
    difficulty: 'medium',
    order: 454,
    description:
      'When an event is sold out the customer just gets an error. Add a waitlist that offers freed seats to waiting customers in order.',
    tags: ['booking', 'waitlist', 'notification', 'capability'],
    nodes: [
      node('n1', 'el-wl-svc', 'BookingService', pos(1, 0), ['book', 'cancel']),
      node('n2', 'el-wl-inv', 'SeatInventory', pos(1, 1), ['seatsLeft', 'reserve', 'release']),
      node('n3', 'el-wl-booking', 'Booking', pos(0, 1), ['getCustomer', 'getStatus']),
      node('n4', 'el-wl-cust', 'Customer', pos(0, 2), ['getId', 'getEmail']),
      node('n5', 'el-wl-notify', 'Notifier', pos(2, 1), ['send']),
    ],
    edges: [
      edge('e1', 'ed-wl-1', 'n1', 'n2'),
      edge('e2', 'ed-wl-2', 'n1', 'n3'),
      edge('e3', 'ed-wl-3', 'n3', 'n4'),
      edge('e4', 'ed-wl-4', 'n1', 'n5'),
    ],
    changeRequest: {
      title: 'Add Waitlist When Sold Out',
      body:
        'If no seats are left, let the customer join a waitlist instead of failing. When a booking is cancelled and a seat is released, offer it to the first customer on the waitlist (first come, first served) and notify them.',
      type: 'capability',
    },
    briefing:
      'What’s going on\nBookingService reserves seats in SeatInventory and throws when there are none left. Cancelling releases a seat.\n\n' +
      'The problem (simple terms)\nSold-out customers are lost, and freed seats go unnoticed.\n\n' +
      'What you should do\nAdd a waitlist that remembers who is waiting in order, and hook it into the release path so the next customer is offered the seat and notified.\n\n' +
      'Where to start\nSee where a booking fails on no seats, and where a seat is released on cancel.',
    constraints: [
      'Normal booking and cancellation must behave as before when seats are available',
      'Waitlist order must be first come, first served',
      'Reuse Notifier for messages to waiting customers',
    ],
    forbidModifyElementNames: ['Customer', 'Notifier'],
    maxNewClasses: 2,
    expectedTouchHints: ['BookingService', 'SeatInventory'],
    protectedFlows: [
      {
        id: 'book-seat',
        label: 'Book a seat',
        steps: ['Check seats', 'Reserve seat', 'Create booking'],
        mustKeepElementNames: ['BookingService', 'SeatInventory', 'Booking'],
        mustReach: [
          { from: 'BookingService', to: 'SeatInventory' },
          { from: 'BookingService', to: 'Booking' },
        ],
        mustHavePathTopics: ['seat', 'reserve', 'booking'],
      },
      {
        id: 'cancel-booking',
        label: 'Cancel a booking',
        steps: ['Mark cancelled', 'Release seat'],
        mustReach: [{ from: 'BookingService', to: 'SeatInventory' }],
        mustHavePathTopics: ['cancel', 'release'],
      },
    ],
    newFlows: [
      {
        id: 'join-waitlist',
        label: 'Join waitlist when sold out',
        steps: ['No seats left', 'Add customer to waitlist in order'],
        mustReach: [{ from: 'BookingService', to: 'Customer' }],
        mustHavePathTopics: ['waitlist', 'sold', 'queue'],
      },
      {
        id: 'offer-freed-seat',
        label: 'Offer freed seat to next in line',
        steps: ['Seat released', 'Pick first waiting customer', 'Notify customer'],
        mustReach: [{ from: 'BookingService', to: 'Notifier' }],
        mustHavePathTopics: ['waitlist', 'offer', 'notify'],
      },
    ],
  }),

  // ── 455 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-double-booking-guard',
    title: 'Prevent Double Booking Race',
    difficulty: 'medium',
    order: 455,
    description:
      'Two customers can book the same slot at the same time because availability is checked and then written separately. Make reservation atomic.',
    tags: ['booking', 'concurrency', 'race-condition', 'failure'],
    nodes: [
      node('n1', 'el-db-svc', 'BookingService', pos(1, 0), ['reserveSlot', 'cancel']),
      node('n2', 'el-db-repo', 'SlotRepository', pos(1, 1), ['findById', 'save']),
      node('n3', 'el-db-slot', 'Slot', pos(2, 1), ['isFree', 'markBooked'], [
        { name: 'booked', type: 'boolean' },
      ]),
      node('n4', 'el-db-booking', 'Booking', pos(0, 1), ['getCustomer', 'getSlot']),
      node('n5', 'el-db-cust', 'Customer', pos(0, 2), ['getId', 'getName']),
    ],
    edges: [
      edge('e1', 'ed-db-1', 'n1', 'n2'),
      edge('e2', 'ed-db-2', 'n1', 'n4'),
      edge('e3', 'ed-db-3', 'n2', 'n3'),
      edge('e4', 'ed-db-4', 'n4', 'n5'),
    ],
    changeRequest: {
      title: 'Prevent Double Booking Race',
      body:
        'reserveSlot loads the slot, checks isFree, then saves it as booked. Under load two requests both see it free and both succeed. Only one booking per slot may ever win; the loser must get a clear "slot taken" outcome.',
      type: 'failure',
    },
    briefing:
      'What’s going on\nBookingService reads a Slot from SlotRepository, checks isFree and then writes markBooked in a separate step.\n\n' +
      'The problem (simple terms)\nBetween the check and the write, another request can slip in, so the same slot is sold twice.\n\n' +
      'What you should do\nMake check-and-book a single atomic step (for example a conditional update, version check or lock) and report a conflict to the loser. Successful bookings must work as before.\n\n' +
      'Where to start\nLook at who owns the decision "is this slot still free", and make that decision and the write inseparable.',
    constraints: [
      'Check-and-reserve must be atomic',
      'The losing request must receive an explicit conflict result, not a silent success',
      'Do not create a second Booking for an already-booked slot',
    ],
    forbidModifyElementNames: ['Customer'],
    maxNewClasses: 1,
    expectedTouchHints: ['SlotRepository', 'Slot', 'BookingService'],
    protectedFlows: [
      {
        id: 'reserve-free-slot',
        label: 'Reserve a free slot',
        steps: ['Load slot', 'Mark booked', 'Create booking for customer'],
        mustKeepElementNames: ['BookingService', 'SlotRepository', 'Slot', 'Booking'],
        mustReach: [
          { from: 'BookingService', to: 'SlotRepository' },
          { from: 'SlotRepository', to: 'Slot' },
          { from: 'BookingService', to: 'Booking' },
        ],
        mustHavePathTopics: ['slot', 'reserve', 'booking'],
      },
    ],
    newFlows: [
      {
        id: 'atomic-reserve',
        label: 'Atomic reserve with conflict result',
        steps: ['Attempt conditional reserve', 'First request wins', 'Others receive conflict'],
        mustReach: [
          { from: 'BookingService', to: 'SlotRepository' },
        ],
        mustHavePathTopics: ['atomic', 'conflict', 'lock', 'version'],
      },
    ],
  }),
]
