/**
 * Change One Thing — easy pack set C (orders 422–433).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

export const EASY_C: ChangePackSeed[] = [
  // 422 — variation
  pack({
    slug: 'co-add-xml-exporter',
    title: 'Add XML Beside JSON Export',
    difficulty: 'easy',
    order: 422,
    description:
      'Partners now ask for XML reports. Make the smallest change so a second export format fits beside JSON without touching the controller.',
    tags: ['variation', 'export'],
    nodes: [
      node('n1', 'el-report-ctrl', 'ReportController', pos(1, 0), ['download']),
      node('n2', 'el-export-svc', 'ExportService', pos(1, 1), ['export']),
      node('n3', 'el-json-exp', 'JsonExporter', pos(1, 2), ['serialize']),
    ],
    edges: [
      edge('e1', 'ed-ctrl-svc', 'n1', 'n2'),
      edge('e2', 'ed-svc-json', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Add XML export',
      body:
        'Partners need reports as XML. JSON export must keep working for existing integrations.\n\n' +
        'ReportController should not grow format-specific branches.',
      type: 'variation',
    },
    briefing:
      'What’s going on\n' +
      'ReportController calls ExportService, which is wired straight to JsonExporter.\n\n' +
      'The problem (simple terms)\n' +
      'A second format means ExportService either grows if/else branches or gets copied. Each new format would edit the same code again.\n\n' +
      'What you should do\n' +
      'Introduce the smallest shared idea between JSON and XML so ExportService can pick either.\n\n' +
      'Where to start\n' +
      'Look at ExportService → JsonExporter. What would an XML exporter have in common with it?',
    constraints: [
      'Do not add format-specific logic to ReportController',
      'JSON export must continue to work',
    ],
    forbidModifyElementNames: ['ReportController'],
    maxNewClasses: 3,
    expectedTouchHints: ['ExportService', 'JsonExporter', 'Exporter', 'XmlExporter'],
    protectedFlows: [
      {
        id: 'json',
        label: 'JSON export',
        mustKeepElementNames: ['ReportController', 'ExportService', 'JsonExporter'],
        mustReach: [
          { from: 'ReportController', to: 'ExportService' },
          { from: 'ExportService', to: 'JsonExporter' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'xml',
        label: 'XML export',
        mustKeepElementNames: ['XmlExporter'],
        mustHavePathTopics: ['xml'],
        mustReach: [{ from: 'ExportService', to: 'XmlExporter' }],
      },
    ],
  }),

  // 423 — variation, CacheService -> Redis
  pack({
    slug: 'co-add-memcached',
    title: 'Add Memcached Beside Redis',
    difficulty: 'easy',
    order: 423,
    description:
      'Infra wants Memcached available next to Redis. Make the smallest change so CacheService is not tied to one backend.',
    tags: ['variation', 'cache'],
    nodes: [
      node('n1', 'el-product-svc', 'ProductService', pos(1, 0), ['getProduct']),
      node('n2', 'el-cache-svc', 'CacheService', pos(1, 1), ['get', 'put']),
      node('n3', 'el-redis', 'RedisCache', pos(1, 2), ['read', 'write']),
    ],
    edges: [
      edge('e1', 'ed-prod-cache', 'n1', 'n2'),
      edge('e2', 'ed-cache-redis', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Support Memcached',
      body:
        'Some environments only provision Memcached. Redis must keep working where it is already deployed.\n\n' +
        'ProductService should not know which cache backend is in use.',
      type: 'variation',
    },
    briefing:
      'What’s going on\n' +
      'ProductService uses CacheService, and CacheService talks directly to RedisCache.\n\n' +
      'The problem (simple terms)\n' +
      'With Redis hard-wired, supporting a second cache means editing CacheService every time.\n\n' +
      'What you should do\n' +
      'Give both backends a shared contract so CacheService depends on the idea of a cache, not on Redis.\n\n' +
      'Where to start\n' +
      'Look at the CacheService → RedisCache arrow.',
    constraints: [
      'Do not put Memcached-specific calls inside ProductService',
      'Redis caching must continue to work',
    ],
    forbidModifyElementNames: ['ProductService'],
    maxNewClasses: 3,
    expectedTouchHints: ['CacheService', 'RedisCache', 'CacheBackend', 'MemcachedCache'],
    protectedFlows: [
      {
        id: 'redis',
        label: 'Redis caching',
        mustKeepElementNames: ['ProductService', 'CacheService', 'RedisCache'],
        mustReach: [
          { from: 'ProductService', to: 'CacheService' },
          { from: 'CacheService', to: 'RedisCache' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'memcached',
        label: 'Memcached caching',
        mustKeepElementNames: ['MemcachedCache'],
        mustHavePathTopics: ['memcached'],
        mustReach: [{ from: 'CacheService', to: 'MemcachedCache' }],
      },
    ],
  }),

  // 424 — capability, Auth email-only
  pack({
    slug: 'co-add-phone-login',
    title: 'Add Phone Number Login',
    difficulty: 'easy',
    order: 424,
    description:
      'Login only works with email and password today. Add phone number login without breaking the email path.',
    tags: ['capability', 'auth'],
    nodes: [
      node('n1', 'el-login-ctrl', 'LoginController', pos(1, 0), ['login']),
      node('n2', 'el-auth-svc', 'AuthService', pos(1, 1), ['authenticate']),
      node('n3', 'el-email-auth', 'EmailPasswordAuth', pos(1, 2), ['verifyEmailPassword']),
    ],
    edges: [
      edge('e1', 'ed-ctrl-auth', 'n1', 'n2'),
      edge('e2', 'ed-auth-email', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Allow login with phone number',
      body:
        'Growth wants users to sign in with a phone number and one-time code.\n\n' +
        'Email + password login must keep working unchanged.',
      type: 'capability',
    },
    briefing:
      'What’s going on\n' +
      'AuthService only knows how to verify email and password through EmailPasswordAuth.\n\n' +
      'The problem (simple terms)\n' +
      'There is no place in the design for a second way to prove identity. Bolting it onto EmailPasswordAuth would mix two different concerns.\n\n' +
      'What you should do\n' +
      'Add phone login as a separate path AuthService can use, with minimal new classes.\n\n' +
      'Where to start\n' +
      'Look at AuthService → EmailPasswordAuth. What is the shared “verify credentials” idea?',
    constraints: [
      'Do not add phone logic to EmailPasswordAuth',
      'Email login must continue to work',
    ],
    forbidModifyElementNames: ['EmailPasswordAuth'],
    maxNewClasses: 3,
    expectedTouchHints: ['AuthService', 'EmailPasswordAuth', 'AuthMethod', 'PhoneOtpAuth'],
    protectedFlows: [
      {
        id: 'email-login',
        label: 'Email login',
        mustKeepElementNames: ['LoginController', 'AuthService', 'EmailPasswordAuth'],
        mustReach: [
          { from: 'LoginController', to: 'AuthService' },
          { from: 'AuthService', to: 'EmailPasswordAuth' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'phone-login',
        label: 'Phone login',
        mustKeepElementNames: ['PhoneOtpAuth'],
        mustHavePathTopics: ['phone'],
        mustReach: [{ from: 'AuthService', to: 'PhoneOtpAuth' }],
      },
    ],
  }),

  // 425 — removal, keep Slack
  pack({
    slug: 'co-remove-pagerduty',
    title: 'Retire PagerDuty Alerts',
    difficulty: 'easy',
    order: 425,
    description:
      'PagerDuty contract ended. Remove that alert path cleanly while Slack alerts keep working.',
    tags: ['removal', 'alerts'],
    nodes: [
      node('n1', 'el-alert-mgr', 'AlertManager', pos(1, 0), ['raise']),
      node('n2', 'el-slack', 'SlackNotifier', pos(0, 1), ['postMessage']),
      node('n3', 'el-pagerduty', 'PagerDutyClient', pos(2, 1), ['triggerIncident']),
    ],
    edges: [
      edge('e1', 'ed-am-slack', 'n1', 'n2'),
      edge('e2', 'ed-am-pd', 'n1', 'n3'),
    ],
    changeRequest: {
      title: 'Retire PagerDuty',
      body:
        'The PagerDuty contract is over and the account is closed. Slack stays as the only alert channel.\n\n' +
        'Remove the PagerDuty path without breaking AlertManager → SlackNotifier.',
      type: 'removal',
    },
    briefing:
      'What’s going on\n' +
      'AlertManager fans out each alert to SlackNotifier and PagerDutyClient.\n\n' +
      'The problem (simple terms)\n' +
      'Leaving a dead PagerDuty class and arrow suggests pages still go out, which is false and misleading on-call.\n\n' +
      'What you should do\n' +
      'Remove PagerDuty from the design. Keep Slack alerts intact.\n\n' +
      'Where to start\n' +
      'Follow every arrow that touches PagerDutyClient.',
    constraints: [
      'Slack alerting must continue to work',
      'No leftover arrows to PagerDuty',
    ],
    maxNewClasses: 1,
    expectedTouchHints: ['AlertManager', 'PagerDutyClient'],
    protectedFlows: [
      {
        id: 'slack',
        label: 'Slack alerts',
        mustKeepElementNames: ['AlertManager', 'SlackNotifier'],
        mustReach: [{ from: 'AlertManager', to: 'SlackNotifier' }],
      },
    ],
    newFlows: [
      {
        id: 'pd-gone',
        label: 'PagerDuty removed',
        mustNotReach: [{ from: 'AlertManager', to: 'PagerDutyClient' }],
      },
    ],
  }),

  // 426 — variation
  pack({
    slug: 'co-add-gift-card-pay',
    title: 'Add Gift Card Payment',
    difficulty: 'easy',
    order: 426,
    description:
      'Customers want to pay with gift cards. Make the smallest change so a second payment method fits beside cards.',
    tags: ['variation', 'payments'],
    nodes: [
      node('n1', 'el-checkout-svc', 'CheckoutService', pos(1, 0), ['placeOrder']),
      node('n2', 'el-pay-proc', 'PaymentProcessor', pos(1, 1), ['pay']),
      node('n3', 'el-card-pay', 'CardPayment', pos(1, 2), ['chargeCard']),
    ],
    edges: [
      edge('e1', 'ed-co-pp', 'n1', 'n2'),
      edge('e2', 'ed-pp-card', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Accept gift cards',
      body:
        'Marketing is launching gift cards. Card payments must keep working.\n\n' +
        'CheckoutService should not branch on payment type.',
      type: 'variation',
    },
    briefing:
      'What’s going on\n' +
      'CheckoutService calls PaymentProcessor, which is wired only to CardPayment.\n\n' +
      'The problem (simple terms)\n' +
      'A second payment method would force PaymentProcessor to hard-code another branch, and every new method repeats that.\n\n' +
      'What you should do\n' +
      'Make PaymentProcessor depend on a shared payment-method idea, then add gift cards as another option.\n\n' +
      'Where to start\n' +
      'Look at PaymentProcessor → CardPayment.',
    constraints: [
      'Do not add gift-card logic to CheckoutService',
      'Card payments must continue to work',
    ],
    forbidModifyElementNames: ['CheckoutService'],
    maxNewClasses: 3,
    expectedTouchHints: ['PaymentProcessor', 'CardPayment', 'PaymentMethod', 'GiftCardPayment'],
    protectedFlows: [
      {
        id: 'card',
        label: 'Card payment',
        mustKeepElementNames: ['CheckoutService', 'PaymentProcessor', 'CardPayment'],
        mustReach: [
          { from: 'CheckoutService', to: 'PaymentProcessor' },
          { from: 'PaymentProcessor', to: 'CardPayment' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'gift-card',
        label: 'Gift card payment',
        mustKeepElementNames: ['GiftCardPayment'],
        mustHavePathTopics: ['giftcard'],
        mustReach: [{ from: 'PaymentProcessor', to: 'GiftCardPayment' }],
      },
    ],
  }),

  // 427 — constraint, Controller -> Database
  pack({
    slug: 'co-forbid-controller-sql',
    title: 'Controller Must Not Talk to DB',
    difficulty: 'easy',
    order: 427,
    description:
      'Architecture review: UserController must not reach the Database directly. Put persistence behind a boundary.',
    tags: ['constraint', 'layering'],
    nodes: [
      node('n1', 'el-user-ctrl', 'UserController', pos(1, 0), ['getUser', 'updateUser']),
      node('n2', 'el-user-svc', 'UserService', pos(0, 1), ['validate']),
      node('n3', 'el-db', 'Database', pos(2, 1), ['query', 'execute']),
    ],
    edges: [
      edge('e1', 'ed-ctrl-svc', 'n1', 'n2'),
      edge('e2', 'ed-ctrl-db', 'n1', 'n3'),
    ],
    changeRequest: {
      title: 'Forbid controller → database',
      body:
        'Review found UserController running queries against Database directly.\n\n' +
        'Controllers must not depend on the Database. Users must still be loadable and updatable.',
      type: 'constraint',
    },
    briefing:
      'What’s going on\n' +
      'UserController talks to UserService for validation and also straight to Database for data.\n\n' +
      'The problem (simple terms)\n' +
      'Controllers that run SQL mix web concerns with storage, making both hard to test and change.\n\n' +
      'What you should do\n' +
      'Remove the direct Controller → Database dependency and route persistence through a layer that owns it.\n\n' +
      'Where to start\n' +
      'Find the UserController → Database arrow. Who should own data access instead?',
    constraints: [
      'UserController must have no path directly to Database',
      'Reading and updating users must still reach the Database',
    ],
    maxNewClasses: 2,
    expectedTouchHints: ['UserController', 'UserService', 'UserRepository', 'Database'],
    protectedFlows: [
      {
        id: 'validation',
        label: 'User validation',
        mustKeepElementNames: ['UserController', 'UserService'],
        mustReach: [{ from: 'UserController', to: 'UserService' }],
      },
      {
        id: 'persistence',
        label: 'User data still persisted',
        mustKeepElementNames: ['UserController', 'Database'],
        mustHavePathTopics: ['repository'],
      },
    ],
    newFlows: [
      {
        id: 'no-direct-db',
        label: 'No Controller → Database',
        mustNotReach: [{ from: 'UserController', to: 'Database' }],
      },
    ],
  }),

  // 428 — variation
  pack({
    slug: 'co-add-webp-images',
    title: 'Add WebP Beside JPEG Pipeline',
    difficulty: 'easy',
    order: 428,
    description:
      'Frontend wants smaller WebP images. Make the smallest change so a second encoder fits beside JPEG.',
    tags: ['variation', 'media'],
    nodes: [
      node('n1', 'el-upload-ctrl', 'UploadController', pos(1, 0), ['upload']),
      node('n2', 'el-image-svc', 'ImageService', pos(1, 1), ['process']),
      node('n3', 'el-jpeg-enc', 'JpegEncoder', pos(1, 2), ['encode']),
    ],
    edges: [
      edge('e1', 'ed-up-img', 'n1', 'n2'),
      edge('e2', 'ed-img-jpeg', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Produce WebP images',
      body:
        'Page weight is too high. Browsers that support it should receive WebP.\n\n' +
        'JPEG output must remain for older clients.',
      type: 'variation',
    },
    briefing:
      'What’s going on\n' +
      'Uploads go through ImageService, which always encodes with JpegEncoder.\n\n' +
      'The problem (simple terms)\n' +
      'Hard-wired to one encoder, ImageService would need conditionals for every new format.\n\n' +
      'What you should do\n' +
      'Introduce a shared encoder idea and add WebP as another implementation.\n\n' +
      'Where to start\n' +
      'Look at ImageService → JpegEncoder.',
    constraints: [
      'Do not add WebP logic to UploadController',
      'JPEG encoding must continue to work',
    ],
    forbidModifyElementNames: ['UploadController'],
    maxNewClasses: 3,
    expectedTouchHints: ['ImageService', 'JpegEncoder', 'ImageEncoder', 'WebpEncoder'],
    protectedFlows: [
      {
        id: 'jpeg',
        label: 'JPEG pipeline',
        mustKeepElementNames: ['UploadController', 'ImageService', 'JpegEncoder'],
        mustReach: [
          { from: 'UploadController', to: 'ImageService' },
          { from: 'ImageService', to: 'JpegEncoder' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'webp',
        label: 'WebP pipeline',
        mustKeepElementNames: ['WebpEncoder'],
        mustHavePathTopics: ['webp'],
        mustReach: [{ from: 'ImageService', to: 'WebpEncoder' }],
      },
    ],
  }),

  // 429 — failure/capability, Mailer sync only
  pack({
    slug: 'co-add-retry-queue',
    title: 'Add Retry Queue for Email',
    difficulty: 'easy',
    order: 429,
    description:
      'Emails are lost when SMTP hiccups. Add a retry path so failed sends are not dropped.',
    tags: ['failure', 'capability', 'email'],
    nodes: [
      node('n1', 'el-signup-svc', 'SignupService', pos(1, 0), ['register']),
      node('n2', 'el-mailer', 'Mailer', pos(1, 1), ['send']),
      node('n3', 'el-smtp', 'SmtpClient', pos(1, 2), ['deliver']),
    ],
    edges: [
      edge('e1', 'ed-su-mailer', 'n1', 'n2'),
      edge('e2', 'ed-mailer-smtp', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Retry failed emails',
      body:
        'Mailer sends synchronously. When SmtpClient fails, the email is simply lost.\n\n' +
        'Failed sends must be retried later without blocking SignupService.',
      type: 'failure',
    },
    briefing:
      'What’s going on\n' +
      'SignupService → Mailer → SmtpClient is fully synchronous. One failure means a lost message.\n\n' +
      'The problem (simple terms)\n' +
      'There is nowhere for a failed email to wait and be tried again.\n\n' +
      'What you should do\n' +
      'Add a place for failed sends to be held and retried, with the smallest new surface.\n\n' +
      'Where to start\n' +
      'Look at Mailer → SmtpClient. What should happen when delivery fails?',
    constraints: [
      'Do not make SignupService aware of retries',
      'Normal successful sends must still reach SmtpClient',
    ],
    forbidModifyElementNames: ['SignupService'],
    maxNewClasses: 2,
    expectedTouchHints: ['Mailer', 'SmtpClient', 'RetryQueue'],
    protectedFlows: [
      {
        id: 'send',
        label: 'Normal email send',
        mustKeepElementNames: ['SignupService', 'Mailer', 'SmtpClient'],
        mustReach: [
          { from: 'SignupService', to: 'Mailer' },
          { from: 'Mailer', to: 'SmtpClient' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'retry',
        label: 'Failed email retried',
        mustKeepElementNames: ['RetryQueue'],
        mustHavePathTopics: ['retry'],
        mustReach: [{ from: 'Mailer', to: 'RetryQueue' }],
      },
    ],
  }),

  // 430 — removal, keep RestClient
  pack({
    slug: 'co-remove-soap-client',
    title: 'Retire SOAP Partner Client',
    difficulty: 'easy',
    order: 430,
    description:
      'The partner finished migrating to REST. Remove the SOAP client while RestClient keeps working.',
    tags: ['removal', 'integration'],
    nodes: [
      node('n1', 'el-partner-gw', 'PartnerGateway', pos(1, 0), ['fetchInventory']),
      node('n2', 'el-rest', 'RestClient', pos(0, 1), ['get']),
      node('n3', 'el-soap', 'SoapClient', pos(2, 1), ['call']),
    ],
    edges: [
      edge('e1', 'ed-gw-rest', 'n1', 'n2'),
      edge('e2', 'ed-gw-soap', 'n1', 'n3'),
    ],
    changeRequest: {
      title: 'Retire SOAP client',
      body:
        'The partner’s SOAP endpoint is switched off. All traffic is already on REST.\n\n' +
        'Remove the SOAP path without affecting PartnerGateway → RestClient.',
      type: 'removal',
    },
    briefing:
      'What’s going on\n' +
      'PartnerGateway can call either RestClient or SoapClient.\n\n' +
      'The problem (simple terms)\n' +
      'SoapClient is dead code that still looks supported, and new developers may try to use it.\n\n' +
      'What you should do\n' +
      'Remove SOAP from the design and keep the REST integration intact.\n\n' +
      'Where to start\n' +
      'Follow every arrow touching SoapClient.',
    constraints: [
      'REST integration must continue to work',
      'No leftover arrows to SoapClient',
    ],
    maxNewClasses: 1,
    expectedTouchHints: ['PartnerGateway', 'SoapClient'],
    protectedFlows: [
      {
        id: 'rest',
        label: 'REST partner calls',
        mustKeepElementNames: ['PartnerGateway', 'RestClient'],
        mustReach: [{ from: 'PartnerGateway', to: 'RestClient' }],
      },
    ],
    newFlows: [
      {
        id: 'soap-gone',
        label: 'SOAP removed',
        mustNotReach: [{ from: 'PartnerGateway', to: 'SoapClient' }],
      },
    ],
  }),

  // 431 — capability
  pack({
    slug: 'co-add-feature-flag-check',
    title: 'Gate Checkout Behind Flag',
    difficulty: 'easy',
    order: 431,
    description:
      'The new checkout flow must ship dark. Add a feature flag check without rewriting the controller.',
    tags: ['capability', 'feature-flags'],
    nodes: [
      node('n1', 'el-checkout-ctrl', 'CheckoutController', pos(1, 0), ['checkout']),
      node('n2', 'el-checkout-svc2', 'CheckoutService', pos(1, 1), ['process']),
      node('n3', 'el-pay-gw', 'PaymentGateway', pos(1, 2), ['charge']),
    ],
    edges: [
      edge('e1', 'ed-ctrl-svc2', 'n1', 'n2'),
      edge('e2', 'ed-svc-gw', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Put checkout behind a feature flag',
      body:
        'Release management wants to enable the new checkout for a percentage of users and switch it off instantly if needed.\n\n' +
        'The existing payment path must keep working when the flag is on.',
      type: 'capability',
    },
    briefing:
      'What’s going on\n' +
      'CheckoutController → CheckoutService → PaymentGateway always runs. There is no way to turn it on or off per user.\n\n' +
      'The problem (simple terms)\n' +
      'Without a flag check there is no safe rollout or kill switch.\n\n' +
      'What you should do\n' +
      'Introduce a flag lookup that checkout consults before proceeding.\n\n' +
      'Where to start\n' +
      'Decide which class should ask “is checkout enabled?”',
    constraints: [
      'Do not scatter flag lookups across controller and gateway',
      'Payment must still work when the flag is enabled',
    ],
    forbidModifyElementNames: ['PaymentGateway'],
    maxNewClasses: 2,
    expectedTouchHints: ['CheckoutService', 'FeatureFlagService'],
    protectedFlows: [
      {
        id: 'payment',
        label: 'Checkout payment',
        mustKeepElementNames: ['CheckoutController', 'CheckoutService', 'PaymentGateway'],
        mustReach: [
          { from: 'CheckoutController', to: 'CheckoutService' },
          { from: 'CheckoutService', to: 'PaymentGateway' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'flag',
        label: 'Flag check',
        mustKeepElementNames: ['FeatureFlagService'],
        mustHavePathTopics: ['flag'],
        mustReach: [{ from: 'CheckoutService', to: 'FeatureFlagService' }],
      },
    ],
  }),

  // 432 — capability
  pack({
    slug: 'co-add-metrics-hook',
    title: 'Add Metrics on Order Place',
    difficulty: 'easy',
    order: 432,
    description:
      'Product needs an orders-placed metric. Add a metrics hook without touching storage code.',
    tags: ['capability', 'observability'],
    nodes: [
      node('n1', 'el-order-svc', 'OrderService', pos(1, 0), ['placeOrder']),
      node('n2', 'el-order-repo', 'OrderRepository', pos(1, 1), ['save']),
      node('n3', 'el-order-db', 'OrderDatabase', pos(1, 2), ['insert']),
    ],
    edges: [
      edge('e1', 'ed-os-repo', 'n1', 'n2'),
      edge('e2', 'ed-repo-db', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Emit metrics when an order is placed',
      body:
        'Dashboards need a counter every time an order is placed.\n\n' +
        'Saving orders must behave exactly as before, and storage classes should not know about metrics.',
      type: 'capability',
    },
    briefing:
      'What’s going on\n' +
      'OrderService saves through OrderRepository into OrderDatabase. No class reports anything.\n\n' +
      'The problem (simple terms)\n' +
      'Adding counters inside the repository would mix measuring with storing.\n\n' +
      'What you should do\n' +
      'Add a metrics collaborator that OrderService calls when an order is placed.\n\n' +
      'Where to start\n' +
      'Decide where “order placed” is known — and put the hook there.',
    constraints: [
      'Do not modify OrderRepository or OrderDatabase',
      'Order saving must continue to work',
    ],
    forbidModifyElementNames: ['OrderRepository', 'OrderDatabase'],
    maxNewClasses: 2,
    expectedTouchHints: ['OrderService', 'MetricsCollector'],
    protectedFlows: [
      {
        id: 'save',
        label: 'Order persistence',
        mustKeepElementNames: ['OrderService', 'OrderRepository', 'OrderDatabase'],
        mustReach: [
          { from: 'OrderService', to: 'OrderRepository' },
          { from: 'OrderRepository', to: 'OrderDatabase' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'metrics',
        label: 'Order metrics',
        mustKeepElementNames: ['MetricsCollector'],
        mustHavePathTopics: ['metrics'],
        mustReach: [{ from: 'OrderService', to: 'MetricsCollector' }],
      },
    ],
  }),

  // 433 — variation/failure
  pack({
    slug: 'co-add-backup-smtp',
    title: 'Add Backup SMTP Provider',
    difficulty: 'easy',
    order: 433,
    description:
      'The only SMTP provider had an outage. Add a backup provider so mail can fail over.',
    tags: ['variation', 'failure', 'email'],
    nodes: [
      node('n1', 'el-notif-svc', 'NotificationService', pos(1, 0), ['notify']),
      node('n2', 'el-mailer2', 'Mailer', pos(1, 1), ['send']),
      node('n3', 'el-primary-smtp', 'PrimarySmtp', pos(1, 2), ['deliver']),
    ],
    edges: [
      edge('e1', 'ed-ns-mailer', 'n1', 'n2'),
      edge('e2', 'ed-mailer-primary', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Add a backup SMTP provider',
      body:
        'During the last outage no email went out. Ops wants a second provider that Mailer can use when the primary fails.\n\n' +
        'The primary path must stay the default.',
      type: 'variation',
    },
    briefing:
      'What’s going on\n' +
      'Mailer is wired to a single provider, PrimarySmtp.\n\n' +
      'The problem (simple terms)\n' +
      'If PrimarySmtp is down, Mailer has no alternative, and adding one means editing Mailer around a specific vendor.\n\n' +
      'What you should do\n' +
      'Give providers a shared contract and add a backup that Mailer can fall back to.\n\n' +
      'Where to start\n' +
      'Look at Mailer → PrimarySmtp.',
    constraints: [
      'Do not modify NotificationService',
      'PrimarySmtp must remain the default path',
    ],
    forbidModifyElementNames: ['NotificationService'],
    maxNewClasses: 3,
    expectedTouchHints: ['Mailer', 'PrimarySmtp', 'SmtpProvider', 'BackupSmtp'],
    protectedFlows: [
      {
        id: 'primary',
        label: 'Primary SMTP',
        mustKeepElementNames: ['NotificationService', 'Mailer', 'PrimarySmtp'],
        mustReach: [
          { from: 'NotificationService', to: 'Mailer' },
          { from: 'Mailer', to: 'PrimarySmtp' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'backup',
        label: 'Backup SMTP',
        mustKeepElementNames: ['BackupSmtp'],
        mustHavePathTopics: ['backup'],
        mustReach: [{ from: 'Mailer', to: 'BackupSmtp' }],
      },
    ],
  }),
]
