/**
 * Design Studio "Change One Thing" — Easy A (orders 400–410).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

export const EASY_A: ChangePackSeed[] = [
  // ─── 400 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-paypal-beside-stripe',
    title: 'Add PayPal Beside Stripe',
    difficulty: 'easy',
    description:
      'Finance wants PayPal next to Stripe. Make the smallest change so a second provider fits without rewriting Checkout.',
    order: 400,
    tags: ['variation', 'payments', 'ports'],
    nodes: [
      node('n1', 'el-checkout', 'Checkout', pos(1, 0), ['placeOrder']),
      node('n2', 'el-paysvc', 'PaymentService', pos(1, 1), ['charge', 'refund']),
      node('n3', 'el-stripe', 'StripeClient', pos(1, 2), ['createCharge']),
    ],
    edges: [
      edge('e1', 'ed-co-ps', 'n1', 'n2'),
      edge('e2', 'ed-ps-st', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Offer PayPal at checkout',
      body:
        'Growth wants PayPal available alongside cards. Stripe customers must see no change.\n\n' +
        'We will probably add another wallet next year, so please do not hard-wire a second provider into PaymentService with an if/else.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'Checkout calls PaymentService, which talks straight to StripeClient. One provider, one concrete path.\n\n' +
      'The problem (simple terms)\n' +
      'PaymentService depends on a concrete Stripe class. Adding PayPal next to it would mean branching inside PaymentService — and again for the next provider.\n\n' +
      'What you should do\n' +
      'Introduce a small port (interface) that PaymentService depends on, make Stripe implement it, and add PayPal as a second implementation.\n\n' +
      'Where to start\n' +
      'Look at the PaymentService → StripeClient arrow. What is the minimum contract both providers share?',
    constraints: [
      'Do not add PayPal-specific logic to Checkout',
      'The Stripe payment path must keep working',
    ],
    forbidModifyElementNames: ['Checkout'],
    maxNewClasses: 3,
    expectedTouchHints: ['PaymentService', 'StripeClient', 'PaymentGateway', 'PayPalClient'],
    protectedFlows: [
      {
        id: 'stripe-pay',
        label: 'Stripe payment still works',
        mustKeepElementNames: ['Checkout', 'PaymentService', 'StripeClient'],
        mustReach: [
          { from: 'Checkout', to: 'PaymentService' },
          { from: 'PaymentService', to: 'StripeClient' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'paypal-pay',
        label: 'PayPal payment',
        mustKeepElementNames: ['PayPal'],
        mustHavePathTopics: ['paypal'],
        mustReach: [{ from: 'PaymentService', to: 'PayPal' }],
      },
    ],
  }),

  // ─── 401 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-push-notify',
    title: 'Add Push Beside Email',
    difficulty: 'easy',
    description:
      'Mobile users want push notifications as well as email. Add a second channel without breaking email.',
    order: 401,
    tags: ['variation', 'notifications', 'ports'],
    nodes: [
      node('n1', 'el-order', 'OrderService', pos(1, 0), ['complete']),
      node('n2', 'el-notifier', 'Notifier', pos(1, 1), ['notify']),
      node('n3', 'el-email', 'EmailSender', pos(1, 2), ['sendEmail']),
    ],
    edges: [
      edge('e1', 'ed-o-n', 'n1', 'n2'),
      edge('e2', 'ed-n-e', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Send push notifications',
      body:
        'The mobile team wants order updates delivered as push notifications in addition to email.\n\n' +
        'Email must keep working exactly as it does today. OrderService should not learn about channels.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'OrderService tells Notifier something happened; Notifier calls EmailSender. Email is the only channel.\n\n' +
      'The problem (simple terms)\n' +
      'Notifier is bound to the concrete EmailSender. A second channel invites if/else on channel type inside Notifier.\n\n' +
      'What you should do\n' +
      'Give Notifier a channel abstraction, have EmailSender fulfil it, and add a push implementation beside it.\n\n' +
      'Where to start\n' +
      'Focus on Notifier → EmailSender. What should Notifier know about a channel — and what should it not?',
    constraints: [
      'OrderService must not mention push or email',
      'Email notifications must continue to work',
    ],
    forbidModifyElementNames: ['OrderService'],
    maxNewClasses: 3,
    expectedTouchHints: ['Notifier', 'EmailSender', 'NotificationChannel', 'PushSender'],
    protectedFlows: [
      {
        id: 'email-notify',
        label: 'Email notification',
        mustKeepElementNames: ['OrderService', 'Notifier', 'EmailSender'],
        mustReach: [
          { from: 'OrderService', to: 'Notifier' },
          { from: 'Notifier', to: 'EmailSender' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'push-notify',
        label: 'Push notification',
        mustKeepElementNames: ['Push'],
        mustHavePathTopics: ['push'],
        mustReach: [{ from: 'Notifier', to: 'Push' }],
      },
    ],
  }),

  // ─── 402 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-pdf-export',
    title: 'Add PDF Beside CSV',
    difficulty: 'easy',
    description:
      'Finance wants reports as PDF too. Add a second export format without disturbing the CSV path.',
    order: 402,
    tags: ['variation', 'reporting', 'strategy'],
    nodes: [
      node('n1', 'el-report', 'Report', pos(1, 0), ['export']),
      node('n2', 'el-csv', 'CsvExporter', pos(1, 1), ['exportCsv']),
      node('n3', 'el-data', 'ReportData', pos(2, 1), ['rows']),
    ],
    edges: [
      edge('e1', 'ed-r-c', 'n1', 'n2'),
      edge('e2', 'ed-c-d', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Export reports as PDF',
      body:
        'Finance needs the monthly report as a PDF for auditors. CSV stays for analysts.\n\n' +
        'Report currently picks the exporter itself — adding a format should not mean editing Report each time.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'Report calls CsvExporter directly, and CsvExporter reads rows from ReportData.\n\n' +
      'The problem (simple terms)\n' +
      'Report is wired to one concrete exporter. A PDF exporter would need a format switch inside Report, and every new format would reopen it.\n\n' +
      'What you should do\n' +
      'Introduce a shared exporter contract, let CsvExporter implement it, and add PdfExporter as another implementation.\n\n' +
      'Where to start\n' +
      'Look at Report → CsvExporter. What single idea do CSV and PDF exports share?',
    constraints: [
      'CSV export output must stay unchanged',
      'Do not add format switches inside ReportData',
    ],
    forbidModifyElementNames: ['ReportData'],
    maxNewClasses: 3,
    expectedTouchHints: ['Report', 'CsvExporter', 'Exporter', 'PdfExporter'],
    protectedFlows: [
      {
        id: 'csv-export',
        label: 'CSV export',
        mustKeepElementNames: ['Report', 'CsvExporter', 'ReportData'],
        mustReach: [
          { from: 'Report', to: 'CsvExporter' },
          { from: 'CsvExporter', to: 'ReportData' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'pdf-export',
        label: 'PDF export',
        mustKeepElementNames: ['PdfExporter'],
        mustHavePathTopics: ['pdf'],
        mustReach: [{ from: 'Report', to: 'PdfExporter' }],
      },
    ],
  }),

  // ─── 403 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-sms-channel',
    title: 'Add SMS Notification Channel',
    difficulty: 'easy',
    description:
      'Support wants SMS alerts for shipment updates. Add the channel without touching the email path.',
    order: 403,
    tags: ['variation', 'notifications', 'ports'],
    nodes: [
      node('n1', 'el-ship', 'ShipmentService', pos(1, 0), ['markShipped']),
      node('n2', 'el-nsvc', 'NotificationService', pos(1, 1), ['send']),
      node('n3', 'el-chan', 'NotificationChannel', pos(1, 2), ['deliver'], [], 'interface'),
      node('n4', 'el-email', 'EmailChannel', pos(1, 3), ['deliver']),
    ],
    edges: [
      edge('e1', 'ed-s-n', 'n1', 'n2'),
      edge('e2', 'ed-n-c', 'n2', 'n3'),
      edge('e3', 'ed-e-c', 'n4', 'n3', 'inheritance', 'top', 'bottom'),
    ],
    changeRequest: {
      title: 'Add an SMS channel',
      body:
        'Customers in regions with poor data coverage want shipment updates by SMS.\n\n' +
        'Email delivery must stay as is. The team already has a NotificationChannel abstraction — use it, do not bypass it.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'ShipmentService asks NotificationService to send. NotificationService depends on the NotificationChannel interface, implemented today only by EmailChannel.\n\n' +
      'The problem (simple terms)\n' +
      'There is no SMS delivery path. The seam already exists, so the temptation is to hack SMS into EmailChannel or ShipmentService.\n\n' +
      'What you should do\n' +
      'Add SMS as another implementation of the existing channel interface. Leave callers alone.\n\n' +
      'Where to start\n' +
      'Look at what already implements NotificationChannel and ask what is missing next to it.',
    constraints: [
      'Do not modify ShipmentService',
      'Do not add SMS behaviour inside EmailChannel',
    ],
    forbidModifyElementNames: ['ShipmentService', 'EmailChannel'],
    maxNewClasses: 2,
    expectedTouchHints: ['NotificationChannel', 'EmailChannel', 'SmsChannel'],
    protectedFlows: [
      {
        id: 'email-ship',
        label: 'Email shipment update',
        mustKeepElementNames: ['ShipmentService', 'NotificationService', 'NotificationChannel', 'EmailChannel'],
        mustReach: [
          { from: 'ShipmentService', to: 'NotificationService' },
          { from: 'NotificationService', to: 'NotificationChannel' },
          { from: 'EmailChannel', to: 'NotificationChannel' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'sms-ship',
        label: 'SMS shipment update',
        mustKeepElementNames: ['Sms'],
        mustHavePathTopics: ['sms'],
        mustReach: [{ from: 'Sms', to: 'NotificationChannel' }],
      },
    ],
  }),

  // ─── 404 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-remove-fax-channel',
    title: 'Retire Fax Notifications',
    difficulty: 'easy',
    description:
      'Fax is being sunset. Remove it cleanly while email keeps working.',
    order: 404,
    tags: ['removal', 'notifications', 'cleanup'],
    nodes: [
      node('n1', 'el-claim', 'ClaimService', pos(1, 0), ['approve']),
      node('n2', 'el-nsvc', 'NotificationService', pos(1, 1), ['notify']),
      node('n3', 'el-email', 'EmailChannel', pos(0, 2), ['sendEmail']),
      node('n4', 'el-fax', 'FaxChannel', pos(2, 2), ['sendFax']),
    ],
    edges: [
      edge('e1', 'ed-c-n', 'n1', 'n2'),
      edge('e2', 'ed-n-e', 'n2', 'n3'),
      edge('e3', 'ed-n-f', 'n2', 'n4'),
    ],
    changeRequest: {
      title: 'Retire fax notifications',
      body:
        'The last fax vendor contract ends this quarter. No customer is on fax any more.\n\n' +
        'Remove fax from the design. Email must keep working and ClaimService should not need any changes.',
      type: 'removal',
    },
    briefing:
      "What's going on\n" +
      'NotificationService fans out to two concrete channels: EmailChannel and FaxChannel.\n\n' +
      'The problem (simple terms)\n' +
      'Fax is dead weight — code, vendor config and an arrow nobody should depend on. Left in, it keeps getting called or maintained.\n\n' +
      'What you should do\n' +
      'Remove the fax path entirely, and make sure nothing still reaches it. Do not damage the email flow.\n\n' +
      'Where to start\n' +
      'Follow the arrows into FaxChannel. Who depends on it, and what must be left standing afterwards?',
    constraints: [
      'Email notifications must continue to work',
      'Do not leave a dangling reference to fax',
    ],
    forbidModifyElementNames: ['ClaimService'],
    maxNewClasses: 0,
    expectedTouchHints: ['NotificationService', 'FaxChannel'],
    protectedFlows: [
      {
        id: 'email-claim',
        label: 'Email notification on claim approval',
        mustKeepElementNames: ['ClaimService', 'NotificationService', 'EmailChannel'],
        mustReach: [
          { from: 'ClaimService', to: 'NotificationService' },
          { from: 'NotificationService', to: 'EmailChannel' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'fax-gone',
        label: 'Fax path removed',
        mustNotReach: [{ from: 'NotificationService', to: 'FaxChannel' }],
      },
    ],
  }),

  // ─── 405 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-upi-payments',
    title: 'Add UPI Payment Option',
    difficulty: 'easy',
    description:
      'India launch needs UPI. Add it next to card payments without reworking the cart.',
    order: 405,
    tags: ['variation', 'payments', 'ports'],
    nodes: [
      node('n1', 'el-cart', 'CartService', pos(1, 0), ['checkout']),
      node('n2', 'el-pay', 'PaymentProcessor', pos(1, 1), ['pay']),
      node('n3', 'el-card', 'CardGateway', pos(1, 2), ['chargeCard']),
    ],
    edges: [
      edge('e1', 'ed-c-p', 'n1', 'n2'),
      edge('e2', 'ed-p-g', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Support UPI payments',
      body:
        'We are launching in India, where UPI is the dominant payment method.\n\n' +
        'Card payments must keep working. CartService should not know which method the shopper picked.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'CartService hands off to PaymentProcessor, which calls CardGateway. Cards are the only way to pay.\n\n' +
      'The problem (simple terms)\n' +
      'PaymentProcessor is tied to the concrete card gateway, so UPI would mean branching on payment method inside it.\n\n' +
      'What you should do\n' +
      'Extract a payment method abstraction that PaymentProcessor uses, make cards fit it, and add UPI as a sibling.\n\n' +
      'Where to start\n' +
      'Look at PaymentProcessor → CardGateway and decide what contract both card and UPI could satisfy.',
    constraints: [
      'CartService must not change',
      'Card payments must keep working',
    ],
    forbidModifyElementNames: ['CartService'],
    maxNewClasses: 3,
    expectedTouchHints: ['PaymentProcessor', 'CardGateway', 'PaymentMethod', 'UpiGateway'],
    protectedFlows: [
      {
        id: 'card-pay',
        label: 'Card payment',
        mustKeepElementNames: ['CartService', 'PaymentProcessor', 'CardGateway'],
        mustReach: [
          { from: 'CartService', to: 'PaymentProcessor' },
          { from: 'PaymentProcessor', to: 'CardGateway' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'upi-pay',
        label: 'UPI payment',
        mustKeepElementNames: ['Upi'],
        mustHavePathTopics: ['upi'],
        mustReach: [{ from: 'PaymentProcessor', to: 'Upi' }],
      },
    ],
  }),

  // ─── 406 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-s3-storage',
    title: 'Add S3 Beside Local Disk',
    difficulty: 'easy',
    description:
      'Uploads must move to cloud storage soon. Add S3 beside local disk without rewriting callers.',
    order: 406,
    tags: ['variation', 'storage', 'ports'],
    nodes: [
      node('n1', 'el-upload', 'UploadController', pos(1, 0), ['upload']),
      node('n2', 'el-store', 'FileStore', pos(1, 1), ['save', 'load']),
      node('n3', 'el-disk', 'LocalDisk', pos(1, 2), ['writeFile', 'readFile']),
    ],
    edges: [
      edge('e1', 'ed-u-f', 'n1', 'n2'),
      edge('e2', 'ed-f-d', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Store files in S3',
      body:
        'Ops wants new uploads stored in S3 as local disks fill up. Existing local files must stay readable.\n\n' +
        'UploadController should not change, and a third backend later (GCS) should be cheap to add.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'UploadController calls FileStore, which writes and reads through LocalDisk.\n\n' +
      'The problem (simple terms)\n' +
      'FileStore is welded to the concrete LocalDisk. Adding S3 means conditionals on where bytes live, inside FileStore.\n\n' +
      'What you should do\n' +
      'Define a storage backend abstraction, make LocalDisk implement it, and add an S3 backend beside it.\n\n' +
      'Where to start\n' +
      'Look at FileStore → LocalDisk. What is the smallest read/write contract both backends can honour?',
    constraints: [
      'UploadController must not change',
      'Local disk reads and writes must keep working',
    ],
    forbidModifyElementNames: ['UploadController'],
    maxNewClasses: 3,
    expectedTouchHints: ['FileStore', 'LocalDisk', 'StorageBackend', 'S3Storage'],
    protectedFlows: [
      {
        id: 'local-save',
        label: 'Save to local disk',
        mustKeepElementNames: ['UploadController', 'FileStore', 'LocalDisk'],
        mustReach: [
          { from: 'UploadController', to: 'FileStore' },
          { from: 'FileStore', to: 'LocalDisk' },
        ],
      },
    ],
    newFlows: [
      {
        id: 's3-save',
        label: 'Save to S3',
        mustKeepElementNames: ['S3'],
        mustHavePathTopics: ['s3'],
        mustReach: [{ from: 'FileStore', to: 'S3' }],
      },
    ],
  }),

  // ─── 407 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-redis-cache',
    title: 'Add Redis Beside Memory Cache',
    difficulty: 'easy',
    description:
      'Multiple app servers need a shared cache. Add Redis beside the in-memory cache without touching callers.',
    order: 407,
    tags: ['variation', 'caching', 'ports'],
    nodes: [
      node('n1', 'el-catalog', 'CatalogService', pos(1, 0), ['getProduct']),
      node('n2', 'el-cache', 'CacheManager', pos(1, 1), ['get', 'put']),
      node('n3', 'el-mem', 'MemoryCache', pos(1, 2), ['get', 'put']),
    ],
    edges: [
      edge('e1', 'ed-c-m', 'n1', 'n2'),
      edge('e2', 'ed-m-mem', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Add a Redis cache backend',
      body:
        'We are scaling to several app servers and the per-process memory cache gives inconsistent results.\n\n' +
        'Add Redis as a cache option. MemoryCache must remain for local dev and tests. CatalogService must not change.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'CatalogService reads through CacheManager, which delegates to a concrete MemoryCache.\n\n' +
      'The problem (simple terms)\n' +
      'CacheManager knows exactly one cache type. Supporting Redis would mean switching on cache kind inside it.\n\n' +
      'What you should do\n' +
      'Introduce a cache contract that CacheManager depends on, with MemoryCache and a new Redis cache as implementations.\n\n' +
      'Where to start\n' +
      'Look at CacheManager → MemoryCache and decide the smallest get/put contract worth abstracting.',
    constraints: [
      'CatalogService must not change',
      'MemoryCache behaviour must stay the same',
    ],
    forbidModifyElementNames: ['CatalogService'],
    maxNewClasses: 3,
    expectedTouchHints: ['CacheManager', 'MemoryCache', 'Cache', 'RedisCache'],
    protectedFlows: [
      {
        id: 'memory-cache',
        label: 'Memory cache read',
        mustKeepElementNames: ['CatalogService', 'CacheManager', 'MemoryCache'],
        mustReach: [
          { from: 'CatalogService', to: 'CacheManager' },
          { from: 'CacheManager', to: 'MemoryCache' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'redis-cache',
        label: 'Redis cache read',
        mustKeepElementNames: ['Redis'],
        mustHavePathTopics: ['redis'],
        mustReach: [{ from: 'CacheManager', to: 'Redis' }],
      },
    ],
  }),

  // ─── 408 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-slack-alerts',
    title: 'Add Slack Beside Email Alerts',
    difficulty: 'easy',
    description:
      'On-call wants alerts in Slack as well as email. Add the second target without disturbing email.',
    order: 408,
    tags: ['variation', 'alerting', 'ports'],
    nodes: [
      node('n1', 'el-monitor', 'HealthMonitor', pos(1, 0), ['onFailure']),
      node('n2', 'el-alert', 'AlertService', pos(1, 1), ['raise']),
      node('n3', 'el-email', 'EmailAlert', pos(1, 2), ['sendEmail']),
    ],
    edges: [
      edge('e1', 'ed-h-a', 'n1', 'n2'),
      edge('e2', 'ed-a-e', 'n2', 'n3'),
    ],
    changeRequest: {
      title: 'Send alerts to Slack',
      body:
        'On-call engineers miss email at night. They want critical alerts posted to a Slack channel as well.\n\n' +
        'Email alerts must keep firing. HealthMonitor should not learn which destinations exist.',
      type: 'variation',
    },
    briefing:
      "What's going on\n" +
      'HealthMonitor raises failures through AlertService, which sends them via EmailAlert.\n\n' +
      'The problem (simple terms)\n' +
      'AlertService is hard-wired to email. Slack would be a second concrete dependency, then PagerDuty a third.\n\n' +
      'What you should do\n' +
      'Introduce an alert destination abstraction, adapt email to it, and add Slack beside it.\n\n' +
      'Where to start\n' +
      'Look at AlertService → EmailAlert. What should AlertService depend on instead of a specific destination?',
    constraints: [
      'HealthMonitor must not change',
      'Email alerts must keep working',
    ],
    forbidModifyElementNames: ['HealthMonitor'],
    maxNewClasses: 3,
    expectedTouchHints: ['AlertService', 'EmailAlert', 'AlertSink', 'SlackAlert'],
    protectedFlows: [
      {
        id: 'email-alert',
        label: 'Email alert',
        mustKeepElementNames: ['HealthMonitor', 'AlertService', 'EmailAlert'],
        mustReach: [
          { from: 'HealthMonitor', to: 'AlertService' },
          { from: 'AlertService', to: 'EmailAlert' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'slack-alert',
        label: 'Slack alert',
        mustKeepElementNames: ['Slack'],
        mustHavePathTopics: ['slack'],
        mustReach: [{ from: 'AlertService', to: 'Slack' }],
      },
    ],
  }),

  // ─── 409 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-remove-legacy-printer',
    title: 'Remove Legacy Printer Path',
    difficulty: 'easy',
    description:
      'The old direct-to-printer path is obsolete. Remove it and keep PDF rendering intact.',
    order: 409,
    tags: ['removal', 'cleanup', 'documents'],
    nodes: [
      node('n1', 'el-invoice', 'InvoiceService', pos(1, 0), ['generate']),
      node('n2', 'el-docs', 'DocumentService', pos(1, 1), ['render', 'print']),
      node('n3', 'el-pdf', 'PdfRenderer', pos(0, 2), ['renderPdf']),
      node('n4', 'el-printer', 'LegacyPrinter', pos(2, 2), ['printRaw']),
    ],
    edges: [
      edge('e1', 'ed-i-d', 'n1', 'n2'),
      edge('e2', 'ed-d-p', 'n2', 'n3'),
      edge('e3', 'ed-d-l', 'n2', 'n4'),
    ],
    changeRequest: {
      title: 'Remove the legacy printer path',
      body:
        'Branch offices no longer own dot-matrix printers; everyone gets PDFs. The LegacyPrinter integration is a maintenance burden.\n\n' +
        'Remove that path. PDF rendering must keep working, and InvoiceService should not need edits.',
      type: 'removal',
    },
    briefing:
      "What's going on\n" +
      'DocumentService has two outputs: PdfRenderer for PDFs and LegacyPrinter for raw printing.\n\n' +
      'The problem (simple terms)\n' +
      'Nobody should print raw any more, but the path still exists and can be called by mistake.\n\n' +
      'What you should do\n' +
      'Delete the legacy printer path and ensure nothing reaches it. Leave PdfRenderer untouched.\n\n' +
      'Where to start\n' +
      'Trace which classes depend on LegacyPrinter and remove only that branch.',
    constraints: [
      'PdfRenderer must keep working',
      'Do not leave a dangling reference to LegacyPrinter',
    ],
    forbidModifyElementNames: ['InvoiceService', 'PdfRenderer'],
    maxNewClasses: 0,
    expectedTouchHints: ['DocumentService', 'LegacyPrinter'],
    protectedFlows: [
      {
        id: 'pdf-render',
        label: 'PDF invoice rendering',
        mustKeepElementNames: ['InvoiceService', 'DocumentService', 'PdfRenderer'],
        mustReach: [
          { from: 'InvoiceService', to: 'DocumentService' },
          { from: 'DocumentService', to: 'PdfRenderer' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'printer-gone',
        label: 'Legacy printer path removed',
        mustNotReach: [{ from: 'DocumentService', to: 'LegacyPrinter' }],
      },
    ],
  }),

  // ─── 410 ───────────────────────────────────────────────────────────────
  pack({
    slug: 'co-add-oauth-google',
    title: 'Add Google OAuth Login',
    difficulty: 'easy',
    description:
      'Users want "Sign in with Google". Add it beside password login without breaking existing accounts.',
    order: 410,
    tags: ['capability', 'auth', 'ports'],
    nodes: [
      node('n1', 'el-login', 'LoginController', pos(1, 0), ['login']),
      node('n2', 'el-auth', 'AuthService', pos(1, 1), ['authenticate']),
      node('n3', 'el-pwd', 'PasswordVerifier', pos(0, 2), ['verifyPassword']),
      node('n4', 'el-users', 'UserRepository', pos(2, 2), ['findByEmail']),
    ],
    edges: [
      edge('e1', 'ed-l-a', 'n1', 'n2'),
      edge('e2', 'ed-a-p', 'n2', 'n3'),
      edge('e3', 'ed-a-u', 'n2', 'n4'),
    ],
    changeRequest: {
      title: 'Let users sign in with Google',
      body:
        'Sign-up drop-off is high because users must create a password. Product wants "Sign in with Google".\n\n' +
        'Existing password logins must continue unchanged. Other providers (Apple, GitHub) may follow, so avoid special-casing Google inside AuthService.',
      type: 'capability',
    },
    briefing:
      "What's going on\n" +
      'LoginController calls AuthService, which checks passwords with PasswordVerifier and loads users from UserRepository. Password login is the only way in.\n\n' +
      'The problem (simple terms)\n' +
      'AuthService assumes a password credential. A Google token is a different kind of proof, and bolting it on makes AuthService a pile of branches.\n\n' +
      'What you should do\n' +
      'Introduce a credential verification abstraction that AuthService relies on, keep passwords as one implementation, and add Google OAuth as another.\n\n' +
      'Where to start\n' +
      'Look at AuthService → PasswordVerifier. What contract can "prove who you are" share across password and OAuth?',
    constraints: [
      'Password login must keep working',
      'Do not put Google-specific logic in LoginController',
    ],
    forbidModifyElementNames: ['LoginController', 'UserRepository'],
    maxNewClasses: 3,
    expectedTouchHints: ['AuthService', 'PasswordVerifier', 'CredentialVerifier', 'GoogleOAuthVerifier'],
    protectedFlows: [
      {
        id: 'password-login',
        label: 'Password login',
        mustKeepElementNames: ['LoginController', 'AuthService', 'PasswordVerifier', 'UserRepository'],
        mustReach: [
          { from: 'LoginController', to: 'AuthService' },
          { from: 'AuthService', to: 'PasswordVerifier' },
          { from: 'AuthService', to: 'UserRepository' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'google-login',
        label: 'Google OAuth login',
        mustKeepElementNames: ['Google'],
        mustHavePathTopics: ['google', 'oauth'],
        mustReach: [{ from: 'AuthService', to: 'Google' }],
      },
    ],
  }),
]
