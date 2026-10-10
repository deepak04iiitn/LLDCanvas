/**
 * Design Studio "Change One Thing" packs — medium C (orders 456–467).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

function brief(going: string, problem: string, todo: string, start: string): string {
  return (
    'What’s going on\n' + going + '\n\n' +
    'The change (simple terms)\n' + problem + '\n\n' +
    'What you should do\n' + todo + '\n\n' +
    'Where to start\n' + start
  )
}

export const MEDIUM_C: ChangePackSeed[] = [
  // ── 456 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-loyalty-points',
    title: 'Award Loyalty Points on Purchase',
    difficulty: 'medium',
    order: 456,
    description:
      'Customers should earn loyalty points after a successful purchase. Checkout already works — add points without risking it.',
    tags: ['checkout', 'loyalty', 'capability'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-loy-checkout', 'CheckoutService', pos(1, 0), [
        'placeOrder', 'calculateTotal', 'chargePayment', 'sendReceipt',
      ]),
      node('n2', 'co-loy-cart', 'Cart', pos(0, 1), ['getItems', 'getTotal']),
      node('n3', 'co-loy-pay', 'PaymentGateway', pos(1, 1), ['charge', 'refund']),
      node('n4', 'co-loy-orders', 'OrderRepository', pos(2, 1), ['save', 'findById']),
      node('n5', 'co-loy-cust', 'Customer', pos(0, 2), ['getId', 'getEmail']),
      node('n6', 'co-loy-mail', 'ReceiptMailer', pos(2, 2), ['sendReceipt']),
    ],
    edges: [
      edge('e1', 'ed-co-loy-1', 'n1', 'n2'),
      edge('e2', 'ed-co-loy-2', 'n1', 'n3'),
      edge('e3', 'ed-co-loy-3', 'n1', 'n4'),
      edge('e4', 'ed-co-loy-4', 'n1', 'n5'),
      edge('e5', 'ed-co-loy-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Award Loyalty Points on Purchase',
      body:
        'Marketing wants customers to earn 1 loyalty point per dollar spent, credited once payment succeeds. Points can later be redeemed, so the balance must be tracked per customer. A loyalty outage must never stop someone from checking out.',
      type: 'capability',
    },
    briefing: brief(
      'CheckoutService takes a cart, charges the payment gateway, saves the order and emails a receipt. It is the most important flow in the shop.',
      'After a successful payment the customer should earn loyalty points. The points live somewhere new, and checkout must keep working even if that new piece fails.',
      'Add a small home for loyalty points and call it from checkout after payment succeeds. Leave the existing payment, order saving and receipt behaviour as they are.',
      'Look at CheckoutService.placeOrder — points belong right after chargePayment succeeds, not inside PaymentGateway.',
    ),
    constraints: [
      'Award points only after payment succeeds',
      'A loyalty failure must not fail checkout',
      'Do not change PaymentGateway or OrderRepository',
    ],
    forbidModifyElementNames: ['PaymentGateway', 'OrderRepository', 'Cart'],
    expectedTouchHints: ['CheckoutService', 'LoyaltyLedger'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Place Order',
        steps: ['Calculate total', 'Charge payment', 'Save order'],
        mustKeepElementNames: ['CheckoutService', 'PaymentGateway'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentGateway' },
          { from: 'CheckoutService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['placeorder', 'charge'],
      },
      {
        id: 'send-receipt',
        label: 'Send Receipt',
        steps: ['Email receipt to customer'],
        mustReach: [{ from: 'CheckoutService', to: 'ReceiptMailer' }],
        mustHavePathTopics: ['receipt'],
      },
    ],
    newFlows: [
      {
        id: 'award-points',
        label: 'Award Loyalty Points',
        steps: ['Payment succeeds', 'Credit points to customer balance'],
        mustReach: [{ from: 'CheckoutService', to: 'LoyaltyLedger' }],
        mustHavePathTopics: ['loyalty', 'points'],
      },
    ],
  }),

  // ── 457 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-gdpr-forget-user',
    title: 'Support GDPR Forget-Me',
    difficulty: 'medium',
    order: 457,
    description:
      'Users can request erasure of their personal data. Personal data is spread across several stores, and order history must survive for accounting.',
    tags: ['gdpr', 'privacy', 'constraint'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-gdpr-usersvc', 'UserService', pos(1, 0), [
        'register', 'getProfile', 'getOrderHistory', 'deleteAccount',
      ]),
      node('n2', 'co-gdpr-userrepo', 'UserRepository', pos(0, 1), ['save', 'findById', 'delete']),
      node('n3', 'co-gdpr-orderrepo', 'OrderRepository', pos(1, 1), ['findByUser', 'save']),
      node('n4', 'co-gdpr-audit', 'AuditLog', pos(2, 1), ['record']),
      node('n5', 'co-gdpr-analytics', 'AnalyticsClient', pos(0, 2), ['trackSignup', 'trackEvent']),
      node('n6', 'co-gdpr-news', 'NewsletterService', pos(2, 2), ['subscribe', 'unsubscribe']),
    ],
    edges: [
      edge('e1', 'ed-co-gdpr-1', 'n1', 'n2'),
      edge('e2', 'ed-co-gdpr-2', 'n1', 'n3'),
      edge('e3', 'ed-co-gdpr-3', 'n1', 'n4'),
      edge('e4', 'ed-co-gdpr-4', 'n1', 'n5'),
      edge('e5', 'ed-co-gdpr-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Support GDPR Forget-Me',
      body:
        'Legal requires that a user can ask to be forgotten. All personal data (profile, analytics identity, newsletter subscription) must be erased, but past orders must be kept in anonymised form for tax records. Every erasure must be auditable.',
      type: 'constraint',
    },
    briefing: brief(
      'UserService owns sign-up, profile and order history. Personal data is also sitting in the order store, analytics and the newsletter system.',
      'Right now deleteAccount only removes the user row. Legal needs a complete, coordinated erasure that anonymises orders instead of deleting them, and leaves a trail.',
      'Introduce one place that coordinates erasure across the stores that hold personal data, and record it in the audit log. Keep registration, profile and order history working for everyone else.',
      'UserService.deleteAccount is the entry point. Do not scatter erasure logic into every repository — give it a single owner.',
    ),
    constraints: [
      'Orders are anonymised, never deleted',
      'Every erasure is written to the audit log',
      'Do not remove existing registration or profile behaviour',
    ],
    forbidModifyElementNames: ['NewsletterService'],
    expectedTouchHints: ['UserService', 'OrderRepository', 'ErasureService'],
    protectedFlows: [
      {
        id: 'register',
        label: 'Register User',
        steps: ['Save user', 'Track signup'],
        mustKeepElementNames: ['UserService', 'UserRepository'],
        mustReach: [
          { from: 'UserService', to: 'UserRepository' },
          { from: 'UserService', to: 'AnalyticsClient' },
        ],
        mustHavePathTopics: ['register', 'signup'],
      },
      {
        id: 'view-history',
        label: 'View Profile and Orders',
        steps: ['Load profile', 'Load order history'],
        mustReach: [{ from: 'UserService', to: 'OrderRepository' }],
        mustHavePathTopics: ['profile', 'history'],
      },
    ],
    newFlows: [
      {
        id: 'forget-user',
        label: 'Forget User',
        steps: ['Request erasure', 'Erase personal data in each store', 'Anonymise orders', 'Audit the erasure'],
        mustReach: [
          { from: 'UserService', to: 'ErasureService' },
          { from: 'ErasureService', to: 'UserRepository' },
          { from: 'ErasureService', to: 'OrderRepository' },
          { from: 'ErasureService', to: 'AuditLog' },
        ],
        mustHavePathTopics: ['eras', 'anonym'],
      },
    ],
  }),

  // ── 458 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-payment-fallback-provider',
    title: 'Fallback Provider if Stripe Down',
    difficulty: 'medium',
    order: 458,
    description:
      'Checkout is hard-wired to one payment provider. When Stripe is down, sales stop. Add a fallback without touching the checkout contract.',
    tags: ['payments', 'failure', 'resilience'],
    maxNewClasses: 3,
    nodes: [
      node('n1', 'co-fb-checkout', 'CheckoutService', pos(1, 0), ['payOrder', 'markPaid']),
      node('n2', 'co-fb-proc', 'PaymentProcessor', pos(1, 1), ['charge', 'refund'], [], 'interface'),
      node('n3', 'co-fb-stripe', 'StripeProcessor', pos(1, 2), ['charge', 'refund']),
      node('n4', 'co-fb-orders', 'OrderRepository', pos(2, 1), ['save', 'findById']),
      node('n5', 'co-fb-log', 'PaymentAttemptLog', pos(0, 1), ['record']),
    ],
    edges: [
      edge('e1', 'ed-co-fb-1', 'n1', 'n2'),
      edge('e2', 'ed-co-fb-2', 'n1', 'n4'),
      edge('e3', 'ed-co-fb-3', 'n1', 'n5'),
      edge('e4', 'ed-co-fb-4', 'n3', 'n2', 'inheritance', 'top', 'bottom'),
    ],
    changeRequest: {
      title: 'Fallback Provider if Stripe Down',
      body:
        'Stripe had two outages last quarter and every checkout failed. If Stripe errors or times out, the payment must be retried once through a backup provider (PayPal). Customers should never be charged twice, and every attempt must still be logged.',
      type: 'failure',
    },
    briefing: brief(
      'CheckoutService talks to a PaymentProcessor interface, and StripeProcessor is the only implementation.',
      'When Stripe fails, the order fails. The business wants a second provider tried automatically, without changing how checkout asks for a payment.',
      'Add a second provider behind the same interface and decide where the “try the next one” decision lives. Keep the attempt log recording each try.',
      'The PaymentProcessor interface already isolates CheckoutService from Stripe — extend behind it rather than editing CheckoutService.',
    ),
    constraints: [
      'CheckoutService keeps using the PaymentProcessor interface',
      'Never charge the customer twice',
      'Every attempt, including failures, is recorded',
    ],
    forbidModifyElementNames: ['OrderRepository'],
    expectedTouchHints: ['PaymentProcessor', 'StripeProcessor', 'PaypalProcessor', 'PaymentAttemptLog'],
    protectedFlows: [
      {
        id: 'pay-order',
        label: 'Pay Order',
        steps: ['Charge via processor', 'Mark order paid', 'Save order'],
        mustKeepElementNames: ['PaymentProcessor', 'StripeProcessor'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentProcessor' },
          { from: 'StripeProcessor', to: 'PaymentProcessor' },
          { from: 'CheckoutService', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['charge', 'markpaid'],
      },
      {
        id: 'log-attempt',
        label: 'Log Attempt',
        steps: ['Record each payment attempt'],
        mustReach: [{ from: 'CheckoutService', to: 'PaymentAttemptLog' }],
        mustHavePathTopics: ['record'],
      },
    ],
    newFlows: [
      {
        id: 'fallback-provider',
        label: 'Fallback Provider',
        steps: ['Primary provider fails', 'Retry through backup provider', 'Log both attempts'],
        mustReach: [{ from: 'PaypalProcessor', to: 'PaymentProcessor' }],
        mustHavePathTopics: ['fallback'],
      },
    ],
  }),

  // ── 459 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-tenant-scoped-queries',
    title: 'All Queries Must Be Tenant-Scoped',
    difficulty: 'medium',
    order: 459,
    description:
      'A multi-tenant SaaS leaks data when any repository forgets a tenant filter. Make scoping the rule, not a habit.',
    tags: ['multi-tenant', 'security', 'ownership'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-ten-api', 'ApiController', pos(1, 0), ['listOrders', 'generateReport']),
      node('n2', 'co-ten-ordersvc', 'OrderService', pos(0, 1), ['listOrders', 'getOrder', 'cancelOrder']),
      node('n3', 'co-ten-reportsvc', 'ReportService', pos(2, 1), ['generateReport']),
      node('n4', 'co-ten-orderrepo', 'OrderRepository', pos(0, 2), ['findAll', 'findById', 'save']),
      node('n5', 'co-ten-invrepo', 'InvoiceRepository', pos(1, 2), ['findAll', 'findById']),
      node('n6', 'co-ten-custrepo', 'CustomerRepository', pos(2, 2), ['findAll', 'findById']),
    ],
    edges: [
      edge('e1', 'ed-co-ten-1', 'n1', 'n2'),
      edge('e2', 'ed-co-ten-2', 'n1', 'n3'),
      edge('e3', 'ed-co-ten-3', 'n2', 'n4'),
      edge('e4', 'ed-co-ten-4', 'n3', 'n5'),
      edge('e5', 'ed-co-ten-5', 'n3', 'n6'),
    ],
    changeRequest: {
      title: 'All Queries Must Be Tenant-Scoped',
      body:
        'Last week a report showed another company’s invoices. Every repository query must be limited to the calling tenant, and the tenant must be known once per request, not passed around by hand and forgotten.',
      type: 'constraint',
    },
    briefing: brief(
      'The API controller handles a request and calls services, which call three repositories. Each repository query returns everything it finds.',
      'Nothing forces a repository to filter by tenant, so a single missed filter leaks another customer’s data.',
      'Give the request one trustworthy source of “who is the current tenant” and make every repository use it. Services should not have to remember to pass a tenant id.',
      'Start at ApiController — that is where the tenant is first known. Then look at what all three repositories have in common.',
    ),
    constraints: [
      'Every repository must be scoped, not just OrderRepository',
      'Services must not pass tenant ids manually',
      'Do not rewrite OrderService or ReportService business logic',
    ],
    forbidModifyElementNames: ['OrderService', 'ReportService'],
    expectedTouchHints: ['ApiController', 'OrderRepository', 'InvoiceRepository', 'CustomerRepository', 'TenantContext'],
    protectedFlows: [
      {
        id: 'list-orders',
        label: 'List Orders',
        steps: ['Controller asks service', 'Service reads orders'],
        mustKeepElementNames: ['OrderService', 'OrderRepository'],
        mustReach: [{ from: 'ApiController', to: 'OrderRepository' }],
        mustHavePathTopics: ['listorders'],
      },
      {
        id: 'run-report',
        label: 'Generate Report',
        steps: ['Load invoices', 'Load customers'],
        mustReach: [
          { from: 'ApiController', to: 'InvoiceRepository' },
          { from: 'ApiController', to: 'CustomerRepository' },
        ],
        mustHavePathTopics: ['report'],
      },
    ],
    newFlows: [
      {
        id: 'tenant-scope',
        label: 'Tenant Scoping',
        steps: ['Controller sets tenant for the request', 'Every repository reads it'],
        mustReach: [
          { from: 'ApiController', to: 'TenantContext' },
          { from: 'OrderRepository', to: 'TenantContext' },
          { from: 'InvoiceRepository', to: 'TenantContext' },
          { from: 'CustomerRepository', to: 'TenantContext' },
        ],
        mustHavePathTopics: ['tenant'],
      },
    ],
  }),

  // ── 460 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-draft-orders',
    title: 'Support Draft Then Confirm Orders',
    difficulty: 'medium',
    order: 460,
    description:
      'Sales reps want to save an order as a draft and confirm it later. Drafts must not reserve stock or charge anyone.',
    tags: ['orders', 'lifecycle', 'behavior'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-dr-svc', 'OrderService', pos(1, 0), [
        'createOrder', 'addItem', 'placeOrder', 'cancelOrder',
      ]),
      node('n2', 'co-dr-order', 'Order', pos(0, 1), ['getStatus', 'getItems', 'getTotal']),
      node('n3', 'co-dr-repo', 'OrderRepository', pos(1, 1), ['save', 'findById']),
      node('n4', 'co-dr-inv', 'InventoryService', pos(2, 1), ['reserve', 'release']),
      node('n5', 'co-dr-pay', 'PaymentGateway', pos(0, 2), ['charge']),
      node('n6', 'co-dr-notify', 'NotificationService', pos(2, 2), ['sendReceipt']),
    ],
    edges: [
      edge('e1', 'ed-co-dr-1', 'n1', 'n2'),
      edge('e2', 'ed-co-dr-2', 'n1', 'n3'),
      edge('e3', 'ed-co-dr-3', 'n1', 'n4'),
      edge('e4', 'ed-co-dr-4', 'n1', 'n5'),
      edge('e5', 'ed-co-dr-5', 'n1', 'n6'),
    ],
    changeRequest: {
      title: 'Support Draft Then Confirm Orders',
      body:
        'An order should be able to start life as a draft: items can be added and changed, nothing is reserved and nobody is charged. Confirming the draft then reserves stock, charges payment and sends the receipt — exactly what placing an order does today.',
      type: 'behavior',
    },
    briefing: brief(
      'OrderService.placeOrder creates the order, reserves inventory, charges the customer and notifies them, all in one go.',
      'Orders need an earlier, safe stage — a draft — and a separate moment of confirmation. Until then, no stock is held and no money moves.',
      'Make the order aware of that stage and add a way to confirm it. Direct ordering should still work as before.',
      'Look at Order.getStatus — the order needs to know whether it is a draft or confirmed. Then split what placeOrder does from what creating the order does.',
    ),
    constraints: [
      'Drafts never reserve stock or charge payment',
      'Confirming a draft runs the same reserve / charge / receipt steps',
      'Direct placeOrder keeps working',
    ],
    forbidModifyElementNames: ['PaymentGateway', 'NotificationService'],
    expectedTouchHints: ['OrderService', 'Order'],
    protectedFlows: [
      {
        id: 'place-order',
        label: 'Place Order Directly',
        steps: ['Create order', 'Reserve stock', 'Charge payment', 'Send receipt'],
        mustKeepElementNames: ['OrderService', 'InventoryService', 'PaymentGateway'],
        mustReach: [
          { from: 'OrderService', to: 'InventoryService' },
          { from: 'OrderService', to: 'PaymentGateway' },
          { from: 'OrderService', to: 'NotificationService' },
        ],
        mustHavePathTopics: ['placeorder', 'reserve'],
      },
    ],
    newFlows: [
      {
        id: 'draft-confirm',
        label: 'Draft Then Confirm',
        steps: ['Create draft order', 'Edit items freely', 'Confirm the draft'],
        mustHavePathTopics: ['draft', 'confirm'],
      },
    ],
  }),

  // ── 461 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-cache-aside-catalog',
    title: 'Add Cache-Aside for Catalog',
    difficulty: 'medium',
    order: 461,
    description:
      'Product pages hammer the database. Add a cache-aside layer for catalog reads while keeping updates correct.',
    tags: ['caching', 'catalog', 'scale'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-cache-ctrl', 'CatalogController', pos(1, 0), ['getProduct', 'listProducts']),
      node('n2', 'co-cache-svc', 'CatalogService', pos(1, 1), [
        'getProduct', 'listByCategory', 'updateProduct',
      ]),
      node('n3', 'co-cache-repo', 'ProductRepository', pos(0, 2), ['findById', 'findByCategory', 'save']),
      node('n4', 'co-cache-price', 'PricingService', pos(2, 2), ['priceFor']),
      node('n5', 'co-cache-search', 'SearchIndex', pos(2, 1), ['indexProduct']),
    ],
    edges: [
      edge('e1', 'ed-co-cache-1', 'n1', 'n2'),
      edge('e2', 'ed-co-cache-2', 'n2', 'n3'),
      edge('e3', 'ed-co-cache-3', 'n2', 'n4'),
      edge('e4', 'ed-co-cache-4', 'n2', 'n5'),
    ],
    changeRequest: {
      title: 'Add Cache-Aside for Catalog',
      body:
        'Black Friday traffic is 50× normal and product reads dominate. Serve product reads from a cache first, fall back to the database on a miss and fill the cache. When a product is updated, stale cached copies must not be served.',
      type: 'scale',
    },
    briefing: brief(
      'CatalogController asks CatalogService, which reads ProductRepository on every request, adds a price and keeps the search index fresh on updates.',
      'The database cannot absorb the read traffic. Most reads repeat the same hot products.',
      'Put a cache in front of the product reads, checked before the repository. Make sure updates remove or refresh the cached copy.',
      'CatalogService is the natural place — it already decides where product data comes from. Leave the controller and repository alone.',
    ),
    constraints: [
      'Cache-aside: read cache, then database, then fill cache',
      'Updating a product invalidates its cached entry',
      'Do not change CatalogController or ProductRepository',
    ],
    forbidModifyElementNames: ['CatalogController', 'ProductRepository'],
    expectedTouchHints: ['CatalogService', 'ProductCache'],
    protectedFlows: [
      {
        id: 'read-product',
        label: 'Read Product',
        steps: ['Controller asks service', 'Service loads product', 'Price is added'],
        mustKeepElementNames: ['CatalogService', 'ProductRepository'],
        mustReach: [
          { from: 'CatalogController', to: 'ProductRepository' },
          { from: 'CatalogService', to: 'PricingService' },
        ],
        mustHavePathTopics: ['getproduct', 'pricefor'],
      },
      {
        id: 'update-product',
        label: 'Update Product',
        steps: ['Save product', 'Refresh search index'],
        mustReach: [
          { from: 'CatalogService', to: 'ProductRepository' },
          { from: 'CatalogService', to: 'SearchIndex' },
        ],
        mustHavePathTopics: ['updateproduct'],
      },
    ],
    newFlows: [
      {
        id: 'cached-read',
        label: 'Cached Read',
        steps: ['Check cache', 'On miss read repository', 'Fill cache'],
        mustReach: [{ from: 'CatalogService', to: 'ProductCache' }],
        mustHavePathTopics: ['cache'],
      },
      {
        id: 'cache-invalidate',
        label: 'Invalidate on Update',
        steps: ['Product updated', 'Cached copy is invalidated'],
        mustHavePathTopics: ['invalidate'],
      },
    ],
  }),

  // ── 462 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-webhook-signature-verify',
    title: 'Verify Webhook Signatures',
    difficulty: 'medium',
    order: 462,
    description:
      'Anyone who finds the webhook URL can mark orders as paid. Verify the provider’s signature before trusting a request.',
    tags: ['webhooks', 'security', 'failure'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-wh-ctrl', 'WebhookController', pos(1, 0), ['handleWebhook']),
      node('n2', 'co-wh-parser', 'RequestParser', pos(0, 1), ['parseBody', 'getHeader']),
      node('n3', 'co-wh-handler', 'PaymentEventHandler', pos(1, 1), ['onPaymentSucceeded', 'onPaymentFailed']),
      node('n4', 'co-wh-log', 'EventLog', pos(2, 1), ['record']),
      node('n5', 'co-wh-order', 'OrderService', pos(1, 2), ['markPaid', 'markFailed']),
    ],
    edges: [
      edge('e1', 'ed-co-wh-1', 'n1', 'n2'),
      edge('e2', 'ed-co-wh-2', 'n1', 'n3'),
      edge('e3', 'ed-co-wh-3', 'n1', 'n4'),
      edge('e4', 'ed-co-wh-4', 'n3', 'n5'),
    ],
    changeRequest: {
      title: 'Verify Webhook Signatures',
      body:
        'The payment provider signs every webhook with a shared secret. Requests with a missing or invalid signature must be rejected before any order is touched, and the rejection should be logged for security review.',
      type: 'constraint',
    },
    briefing: brief(
      'WebhookController parses the incoming request, hands payment events to PaymentEventHandler and logs them. The handler updates orders.',
      'Nothing proves the request really came from the payment provider. A forged request could mark any order as paid.',
      'Add a check that validates the signature on the raw request and is consulted before the handler runs. Failed checks should be rejected and logged.',
      'The controller already holds the parsed request and the headers — the check belongs at the door, not deep inside OrderService.',
    ),
    constraints: [
      'Verify before any handler or order logic runs',
      'Invalid signatures are rejected and logged',
      'Do not change PaymentEventHandler or OrderService',
    ],
    forbidModifyElementNames: ['OrderService', 'PaymentEventHandler'],
    expectedTouchHints: ['WebhookController', 'SignatureVerifier'],
    protectedFlows: [
      {
        id: 'payment-succeeded',
        label: 'Payment Succeeded Webhook',
        steps: ['Parse request', 'Handle event', 'Mark order paid'],
        mustKeepElementNames: ['WebhookController', 'PaymentEventHandler'],
        mustReach: [
          { from: 'WebhookController', to: 'RequestParser' },
          { from: 'WebhookController', to: 'OrderService' },
        ],
        mustHavePathTopics: ['markpaid', 'onpaymentsucceeded'],
      },
      {
        id: 'log-event',
        label: 'Log Event',
        steps: ['Record every incoming event'],
        mustReach: [{ from: 'WebhookController', to: 'EventLog' }],
        mustHavePathTopics: ['record'],
      },
    ],
    newFlows: [
      {
        id: 'verify-signature',
        label: 'Verify Signature',
        steps: ['Read signature header', 'Verify against shared secret', 'Reject and log if invalid'],
        mustReach: [{ from: 'WebhookController', to: 'SignatureVerifier' }],
        mustHavePathTopics: ['signature', 'verify'],
      },
    ],
  }),

  // ── 463 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-split-billing-ownership',
    title: 'Billing Owns Invoices Not Order',
    difficulty: 'medium',
    order: 463,
    description:
      'Order builds its own invoice and calculates tax. Move that responsibility to billing so Order stays about orders.',
    tags: ['billing', 'ownership', 'responsibility'],
    maxNewClasses: 2,
    nodes: [
      node('n1', 'co-bill-svc', 'OrderService', pos(1, 0), ['placeOrder', 'payOrder']),
      node('n2', 'co-bill-order', 'Order', pos(0, 1), [
        'getTotal', 'markPaid', 'generateInvoice', 'applyTax',
      ]),
      node('n3', 'co-bill-pay', 'PaymentGateway', pos(1, 1), ['charge']),
      node('n4', 'co-bill-invrepo', 'InvoiceRepository', pos(2, 1), ['save', 'findByOrder']),
      node('n5', 'co-bill-invoice', 'Invoice', pos(0, 2), ['getNumber', 'getAmount']),
      node('n6', 'co-bill-tax', 'TaxCalculator', pos(1, 2), ['taxFor']),
    ],
    edges: [
      edge('e1', 'ed-co-bill-1', 'n1', 'n2'),
      edge('e2', 'ed-co-bill-2', 'n1', 'n3'),
      edge('e3', 'ed-co-bill-3', 'n1', 'n4'),
      edge('e4', 'ed-co-bill-4', 'n2', 'n5'),
      edge('e5', 'ed-co-bill-5', 'n2', 'n6'),
    ],
    changeRequest: {
      title: 'Billing Owns Invoices Not Order',
      body:
        'Finance wants invoice creation and tax rules owned by billing. Order should only know its items, total and paid state. When an order is paid an invoice must still be generated and saved exactly as today.',
      type: 'ownership',
    },
    briefing: brief(
      'Order currently knows how to generate an Invoice and apply tax through TaxCalculator. OrderService pays the order and saves the invoice.',
      'Invoice and tax rules change with regulations, but they live inside Order, so every finance change edits the order model.',
      'Introduce a billing owner for invoices and tax. Remove Order’s knowledge of Invoice and TaxCalculator. Paying an order must still produce a saved invoice.',
      'Follow the arrows leaving Order — each one points at something Order should not own.',
    ),
    constraints: [
      'Order must not depend on Invoice or TaxCalculator afterwards',
      'Paying an order still generates and saves an invoice',
      'Do not change PaymentGateway',
    ],
    forbidModifyElementNames: ['PaymentGateway'],
    expectedTouchHints: ['OrderService', 'Order', 'BillingService'],
    protectedFlows: [
      {
        id: 'pay-order',
        label: 'Pay Order',
        steps: ['Charge payment', 'Mark order paid'],
        mustKeepElementNames: ['OrderService', 'PaymentGateway'],
        mustReach: [
          { from: 'OrderService', to: 'PaymentGateway' },
          { from: 'OrderService', to: 'Order' },
        ],
        mustHavePathTopics: ['payorder', 'markpaid'],
      },
      {
        id: 'invoice-on-pay',
        label: 'Invoice Still Generated',
        steps: ['Build invoice', 'Save invoice'],
        mustReach: [
          { from: 'OrderService', to: 'Invoice' },
          { from: 'OrderService', to: 'InvoiceRepository' },
        ],
        mustHavePathTopics: ['invoice'],
      },
    ],
    newFlows: [
      {
        id: 'billing-owns',
        label: 'Billing Owns Invoicing',
        steps: ['OrderService asks billing to invoice', 'Billing builds invoice and applies tax'],
        mustReach: [
          { from: 'OrderService', to: 'BillingService' },
          { from: 'BillingService', to: 'Invoice' },
        ],
        mustNotReach: [
          { from: 'Order', to: 'Invoice' },
          { from: 'Order', to: 'TaxCalculator' },
        ],
      },
    ],
  }),

  // ── 464 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-scheduled-reports',
    title: 'Schedule Reports Without Blocking',
    difficulty: 'medium',
    order: 464,
    description:
      'Reports are generated while the user waits. Add nightly scheduling that runs in the background without slowing the app.',
    tags: ['reports', 'background-jobs', 'scale'],
    maxNewClasses: 3,
    nodes: [
      node('n1', 'co-rep-ctrl', 'ReportController', pos(1, 0), ['requestReport']),
      node('n2', 'co-rep-svc', 'ReportService', pos(1, 1), ['generateReport', 'exportCsv']),
      node('n3', 'co-rep-orders', 'OrderRepository', pos(0, 2), ['findBetween']),
      node('n4', 'co-rep-csv', 'CsvExporter', pos(1, 2), ['export']),
      node('n5', 'co-rep-mail', 'EmailSender', pos(2, 2), ['send']),
    ],
    edges: [
      edge('e1', 'ed-co-rep-1', 'n1', 'n2'),
      edge('e2', 'ed-co-rep-2', 'n2', 'n3'),
      edge('e3', 'ed-co-rep-3', 'n2', 'n4'),
      edge('e4', 'ed-co-rep-4', 'n2', 'n5'),
    ],
    changeRequest: {
      title: 'Schedule Reports Without Blocking',
      body:
        'Managers want their sales report emailed every night at 2 AM. Generation takes minutes, so it must not run on web request threads or delay other users. Reports requested on demand must keep working.',
      type: 'capability',
    },
    briefing: brief(
      'ReportService builds a report from orders, exports it as CSV and can email it. A manager clicks a button and waits.',
      'The same report needs to run on a schedule, in the background, and several can run at once without hurting the live app.',
      'Add a scheduler that does not do the work itself — it only hands work to a queue — and a worker that picks it up and uses ReportService.',
      'Keep ReportService unaware of time and queues. Its job is to generate; deciding when and where to run it is someone else’s.',
    ),
    constraints: [
      'Scheduling must not generate reports on request threads',
      'On-demand reports keep working unchanged',
      'ReportService stays unaware of the scheduler',
    ],
    forbidModifyElementNames: ['ReportController', 'CsvExporter'],
    expectedTouchHints: ['ReportService', 'ReportScheduler', 'JobQueue', 'ReportWorker'],
    protectedFlows: [
      {
        id: 'on-demand-report',
        label: 'On-Demand Report',
        steps: ['Manager requests report', 'Load orders', 'Export CSV'],
        mustKeepElementNames: ['ReportController', 'ReportService'],
        mustReach: [
          { from: 'ReportController', to: 'OrderRepository' },
          { from: 'ReportController', to: 'CsvExporter' },
        ],
        mustHavePathTopics: ['requestreport', 'export'],
      },
      {
        id: 'email-report',
        label: 'Email Report',
        steps: ['Send exported report by email'],
        mustReach: [{ from: 'ReportService', to: 'EmailSender' }],
        mustHavePathTopics: ['send'],
      },
    ],
    newFlows: [
      {
        id: 'scheduled-report',
        label: 'Scheduled Report',
        steps: ['Scheduler enqueues job at 2 AM', 'Worker dequeues', 'Worker runs ReportService'],
        mustReach: [
          { from: 'ReportScheduler', to: 'JobQueue' },
          { from: 'ReportWorker', to: 'ReportService' },
        ],
        mustHavePathTopics: ['schedule', 'queue'],
      },
    ],
  }),

  // ── 465 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-optimistic-lock-bids',
    title: 'Optimistic Lock on Auction Bids',
    difficulty: 'medium',
    order: 465,
    description:
      'Two bidders can read the same highest bid and both win. Detect concurrent updates so a stale bid is rejected instead of silently overwriting.',
    tags: ['auction', 'concurrency', 'failure'],
    maxNewClasses: 1,
    nodes: [
      node('n1', 'co-bid-svc', 'AuctionService', pos(1, 0), ['placeBid', 'closeAuction']),
      node('n2', 'co-bid-auction', 'Auction', pos(0, 1), ['getHighestBid', 'setHighestBid', 'isOpen']),
      node('n3', 'co-bid-auctionrepo', 'AuctionRepository', pos(1, 1), ['findById', 'save']),
      node('n4', 'co-bid-bidrepo', 'BidRepository', pos(2, 1), ['save', 'findByAuction']),
      node('n5', 'co-bid-notify', 'NotificationService', pos(1, 2), ['notifyOutbid']),
    ],
    edges: [
      edge('e1', 'ed-co-bid-1', 'n1', 'n2'),
      edge('e2', 'ed-co-bid-2', 'n1', 'n3'),
      edge('e3', 'ed-co-bid-3', 'n1', 'n4'),
      edge('e4', 'ed-co-bid-4', 'n1', 'n5'),
    ],
    changeRequest: {
      title: 'Optimistic Lock on Auction Bids',
      body:
        'In the last minute of an auction, two near-simultaneous bids both read the same highest bid and the later save overwrites the earlier one. A bid must only succeed if the auction has not changed since it was read; otherwise the bidder should be told and may retry.',
      type: 'behavior',
    },
    briefing: brief(
      'AuctionService.placeBid loads the auction, checks it is open, records the bid, saves the new highest bid and notifies the previous leader.',
      'Between loading and saving, another bid can slip in. The second save quietly wins and the first bid is lost.',
      'Give the auction a way to detect that it changed since it was read, and make saving fail clearly when it did. Let the service decide whether to retry or report back.',
      'The conflict is detected where the auction is saved. Look at Auction and AuctionRepository, not at the notification or bid history.',
    ),
    constraints: [
      'A stale bid is rejected, never silently overwritten',
      'Do not lock the whole auction for every bid',
      'Do not change BidRepository or NotificationService',
    ],
    forbidModifyElementNames: ['BidRepository', 'NotificationService'],
    expectedTouchHints: ['Auction', 'AuctionRepository', 'AuctionService'],
    protectedFlows: [
      {
        id: 'place-bid',
        label: 'Place Bid',
        steps: ['Load auction', 'Record bid', 'Save highest bid'],
        mustKeepElementNames: ['AuctionService', 'AuctionRepository'],
        mustReach: [
          { from: 'AuctionService', to: 'AuctionRepository' },
          { from: 'AuctionService', to: 'BidRepository' },
        ],
        mustHavePathTopics: ['placebid'],
      },
      {
        id: 'notify-outbid',
        label: 'Notify Outbid',
        steps: ['Tell previous leader'],
        mustReach: [{ from: 'AuctionService', to: 'NotificationService' }],
        mustHavePathTopics: ['outbid'],
      },
    ],
    newFlows: [
      {
        id: 'optimistic-lock',
        label: 'Optimistic Locking',
        steps: ['Read auction with its version', 'Save only if version unchanged', 'Report conflict to bidder'],
        mustHavePathTopics: ['version', 'conflict'],
      },
    ],
  }),

  // ── 466 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-feature-flagged-checkout',
    title: 'New Checkout Behind Feature Flag',
    difficulty: 'medium',
    order: 466,
    description:
      'A redesigned checkout must be rolled out gradually. Keep the old one untouched and switch between them with a feature flag.',
    tags: ['feature-flags', 'checkout', 'variation'],
    maxNewClasses: 3,
    nodes: [
      node('n1', 'co-ff-ctrl', 'CheckoutController', pos(1, 0), ['checkout']),
      node('n2', 'co-ff-svc', 'CheckoutService', pos(1, 1), ['placeOrder']),
      node('n3', 'co-ff-pay', 'PaymentGateway', pos(0, 2), ['charge']),
      node('n4', 'co-ff-repo', 'OrderRepository', pos(1, 2), ['save']),
      node('n5', 'co-ff-inv', 'InventoryService', pos(2, 2), ['reserve']),
    ],
    edges: [
      edge('e1', 'ed-co-ff-1', 'n1', 'n2'),
      edge('e2', 'ed-co-ff-2', 'n2', 'n3'),
      edge('e3', 'ed-co-ff-3', 'n2', 'n4'),
      edge('e4', 'ed-co-ff-4', 'n2', 'n5'),
    ],
    changeRequest: {
      title: 'New Checkout Behind Feature Flag',
      body:
        'The team is building a new checkout flow (one-page, saved cards). Production must keep using the current flow by default. Turning on a flag should send selected users to the new flow, and turning it off must instantly bring everyone back.',
      type: 'variation',
    },
    briefing: brief(
      'CheckoutController hands every checkout to CheckoutService, which reserves stock, charges payment and saves the order.',
      'A second checkout flow is coming, but it cannot replace the current one yet. Both must live side by side, and a switch decides which one runs.',
      'Add a feature flag check at the entry point and a separate home for the new flow. The current CheckoutService must stay exactly as it is.',
      'Decide at CheckoutController which flow to use. Do not sprinkle if-flag checks inside CheckoutService.',
    ),
    constraints: [
      'Flag off means exactly the current behaviour',
      'Do not edit CheckoutService or PaymentGateway',
      'The flag is checked in one place',
    ],
    forbidModifyElementNames: ['CheckoutService', 'PaymentGateway'],
    expectedTouchHints: ['CheckoutController', 'FeatureFlags', 'NewCheckoutFlow'],
    protectedFlows: [
      {
        id: 'legacy-checkout',
        label: 'Legacy Checkout',
        steps: ['Reserve stock', 'Charge payment', 'Save order'],
        mustKeepElementNames: ['CheckoutService', 'PaymentGateway'],
        mustReach: [
          { from: 'CheckoutController', to: 'CheckoutService' },
          { from: 'CheckoutService', to: 'PaymentGateway' },
          { from: 'CheckoutService', to: 'OrderRepository' },
          { from: 'CheckoutService', to: 'InventoryService' },
        ],
        mustHavePathTopics: ['checkout', 'placeorder'],
      },
    ],
    newFlows: [
      {
        id: 'flagged-checkout',
        label: 'Flagged New Checkout',
        steps: ['Controller checks flag', 'Flag on runs new flow', 'Flag off runs legacy flow'],
        mustReach: [{ from: 'CheckoutController', to: 'FeatureFlags' }],
        mustHavePathTopics: ['flag'],
      },
    ],
  }),

  // ── 467 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'co-dead-letter-queue',
    title: 'Add Dead-Letter Queue for Jobs',
    difficulty: 'medium',
    order: 467,
    description:
      'A poisoned job can fail forever or vanish. Retry a few times, then park it in a dead-letter queue and alert someone.',
    tags: ['queue', 'jobs', 'failure'],
    maxNewClasses: 3,
    nodes: [
      node('n1', 'co-dlq-worker', 'JobWorker', pos(1, 0), ['run', 'processNext']),
      node('n2', 'co-dlq-queue', 'JobQueue', pos(0, 1), ['enqueue', 'dequeue', 'ack']),
      node('n3', 'co-dlq-handler', 'JobHandler', pos(1, 1), ['handle'], [], 'interface'),
      node('n4', 'co-dlq-email', 'EmailJobHandler', pos(1, 2), ['handle']),
      node('n5', 'co-dlq-alert', 'AlertService', pos(2, 1), ['notifyOps']),
    ],
    edges: [
      edge('e1', 'ed-co-dlq-1', 'n1', 'n2'),
      edge('e2', 'ed-co-dlq-2', 'n1', 'n3'),
      edge('e3', 'ed-co-dlq-3', 'n1', 'n5'),
      edge('e4', 'ed-co-dlq-4', 'n4', 'n3', 'inheritance', 'top', 'bottom'),
    ],
    changeRequest: {
      title: 'Add Dead-Letter Queue for Jobs',
      body:
        'Today, when a job handler throws, the job is retried forever or dropped. Jobs should be retried a limited number of times; after the last failure the job is moved to a dead-letter queue for inspection and operations is alerted.',
      type: 'failure',
    },
    briefing: brief(
      'JobWorker takes jobs from JobQueue, runs the matching JobHandler and acknowledges success. AlertService can notify operations.',
      'A job that always fails blocks the queue or is lost. There is nowhere to look at failed jobs and nobody is told.',
      'Add a limited-retry rule and a dead-letter queue. After the final failed attempt the job moves there and operations is alerted.',
      'The decision “retry or give up” belongs next to the worker — JobHandler implementations should not know about it.',
    ),
    constraints: [
      'Retries are limited, never infinite',
      'A job is never silently dropped',
      'Do not change JobHandler or EmailJobHandler',
    ],
    forbidModifyElementNames: ['JobHandler', 'EmailJobHandler'],
    expectedTouchHints: ['JobWorker', 'JobQueue', 'DeadLetterQueue', 'RetryPolicy', 'AlertService'],
    protectedFlows: [
      {
        id: 'process-job',
        label: 'Process Job',
        steps: ['Dequeue job', 'Run handler', 'Acknowledge'],
        mustKeepElementNames: ['JobWorker', 'JobQueue', 'JobHandler'],
        mustReach: [
          { from: 'JobWorker', to: 'JobQueue' },
          { from: 'JobWorker', to: 'JobHandler' },
          { from: 'EmailJobHandler', to: 'JobHandler' },
        ],
        mustHavePathTopics: ['dequeue', 'ack'],
      },
      {
        id: 'alert-ops',
        label: 'Alert Operations',
        steps: ['Notify operations'],
        mustReach: [{ from: 'JobWorker', to: 'AlertService' }],
        mustHavePathTopics: ['notifyops'],
      },
    ],
    newFlows: [
      {
        id: 'dead-letter',
        label: 'Dead-Letter Failed Jobs',
        steps: ['Handler fails', 'Retry up to the limit', 'Move to dead-letter queue', 'Alert operations'],
        mustReach: [{ from: 'JobWorker', to: 'DeadLetterQueue' }],
        mustHavePathTopics: ['retry', 'dead'],
      },
    ],
  }),
]
