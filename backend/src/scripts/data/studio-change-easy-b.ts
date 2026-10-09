/**
 * Design Studio "Change One Thing" — Easy B (orders 411–421).
 */
import { pack, node, edge, pos, type ChangePackSeed } from '../seed-studio-change-lib'

export const EASY_B: ChangePackSeed[] = [
  // 411 — variation: webhook channel beside email
  pack({
    slug: 'co-add-webhook-outbox',
    title: 'Add Webhook Delivery Channel',
    difficulty: 'easy',
    order: 411,
    description: 'Domain events only reach email today. Add webhook delivery without breaking email.',
    tags: ['variation', 'events', 'webhook', 'open-closed'],
    nodes: [
      node('n1', 'el-os', 'OrderService', pos(0, 0), ['placeOrder']),
      node('n2', 'el-ep', 'EventPublisher', pos(1, 0), ['publish']),
      node('n3', 'el-em', 'EmailSender', pos(2, 0), ['sendEmail']),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n2', 'n3', 'dependency', 'right', 'left'),
    ],
    changeRequest: {
      title: 'Add webhook delivery',
      body: 'Partners want order events pushed to their HTTPS endpoints. Today EventPublisher talks only to EmailSender. Add a webhook channel without removing email.',
      type: 'variation',
    },
    briefing: 'EventPublisher is hard-wired to EmailSender. Introduce a small abstraction so a new webhook sender can sit beside email.',
    expectedTouchHints: ['EventPublisher', 'new sender abstraction', 'WebhookSender'],
    protectedFlows: [
      {
        id: 'email',
        label: 'Email delivery',
        mustKeepElementNames: ['OrderService', 'EventPublisher', 'EmailSender'],
        mustReach: [
          { from: 'OrderService', to: 'EventPublisher' },
          { from: 'EventPublisher', to: 'EmailSender' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'webhook',
        label: 'Webhook delivery',
        mustHavePathTopics: ['webhook'],
        mustReach: [{ from: 'EventPublisher', to: 'WebhookSender' }],
      },
    ],
  }),

  // 412 — variation: CSV import beside JSON
  pack({
    slug: 'co-add-csv-import',
    title: 'Add CSV Import Beside JSON',
    difficulty: 'easy',
    order: 412,
    description: 'Importer is tied to JsonParser. Support CSV files too.',
    tags: ['variation', 'import', 'strategy', 'open-closed'],
    nodes: [
      node('n1', 'el-ic', 'ImportController', pos(0, 0), ['upload']),
      node('n2', 'el-im', 'Importer', pos(1, 0), ['importFile']),
      node('n3', 'el-jp', 'JsonParser', pos(2, 0), [{ name: 'parse', returnType: 'List<Record>' }]),
      node('n4', 'el-rc', 'Record', pos(2, 1), [], [{ name: 'fields', type: 'Map' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'el-e3', 'n3', 'n4', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Support CSV files',
      body: 'Customers export spreadsheets as CSV. Importer calls JsonParser directly. Add CSV import while JSON keeps working.',
      type: 'variation',
    },
    briefing: 'A new file format should not force edits to Importer each time. Make the parser a swappable role.',
    expectedTouchHints: ['Importer', 'Parser interface', 'CsvParser'],
    protectedFlows: [
      {
        id: 'json',
        label: 'JSON import',
        mustKeepElementNames: ['Importer', 'JsonParser', 'Record'],
        mustReach: [{ from: 'ImportController', to: 'Importer' }, { from: 'JsonParser', to: 'Record' }],
      },
    ],
    newFlows: [
      {
        id: 'csv',
        label: 'CSV import',
        mustHavePathTopics: ['csv', 'parser'],
        mustReach: [{ from: 'Importer', to: 'CsvParser' }],
      },
    ],
  }),

  // 413 — constraint: Order must not know Stripe
  pack({
    slug: 'co-forbid-order-knows-stripe',
    title: 'Order Must Not Know Stripe',
    difficulty: 'easy',
    order: 413,
    description: 'Order calls the Stripe client directly. Insert a port so the domain stops depending on a vendor.',
    tags: ['constraint', 'dependency-inversion', 'ports'],
    nodes: [
      node('n1', 'el-or', 'Order', pos(0, 0), ['checkout'], [{ name: 'total', type: 'Money' }]),
      node('n2', 'el-st', 'StripeClient', pos(1, 0), ['charge']),
      node('n3', 'el-rp', 'OrderRepository', pos(0, 1), ['save']),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Order must not reference Stripe',
      body: 'Compliance wants the Order domain free of vendor SDK types. Order must not depend on StripeClient, but payments must still work.',
      type: 'constraint',
    },
    briefing: 'Insert a payment port owned by the domain and let StripeClient implement or sit behind it.',
    constraints: ['Order may not have a direct edge to StripeClient', 'Payments must still reach Stripe', 'Do not break order persistence'],
    expectedTouchHints: ['PaymentPort', 'Order', 'StripeClient'],
    protectedFlows: [
      {
        id: 'persist',
        label: 'Order persistence',
        mustReach: [{ from: 'Order', to: 'OrderRepository' }],
      },
      {
        id: 'stripe',
        label: 'Stripe still used',
        mustKeepElementNames: ['StripeClient'],
      },
    ],
    newFlows: [
      {
        id: 'no-direct',
        label: 'No Order → StripeClient',
        mustNotReach: [{ from: 'Order', to: 'StripeClient' }],
        mustHavePathTopics: ['payment', 'port'],
      },
    ],
  }),

  // 414 — capability: guest checkout
  pack({
    slug: 'co-add-guest-checkout',
    title: 'Support Guest Checkout',
    difficulty: 'easy',
    order: 414,
    description: 'Checkout requires a registered User today. Let visitors buy without an account.',
    tags: ['capability', 'checkout', 'identity'],
    nodes: [
      node('n1', 'el-ck', 'Checkout', pos(0, 0), ['placeOrder']),
      node('n2', 'el-us', 'User', pos(1, 0), ['getId'], [{ name: 'email', type: 'String' }]),
      node('n3', 'el-pm', 'PaymentService', pos(0, 1), ['charge']),
      node('n4', 'el-ct', 'Cart', pos(1, 1), ['items']),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
      edge('e3', 'el-e3', 'n1', 'n4', 'dependency', 'right', 'bottom'),
    ],
    changeRequest: {
      title: 'Guests can check out',
      body: 'Conversion drops at the login wall. Allow guest checkout with just an email, while registered users keep their current flow.',
      type: 'capability',
    },
    briefing: 'Checkout is tied to User. Introduce a buyer abstraction so a guest can stand in without faking an account.',
    expectedTouchHints: ['Checkout', 'Buyer / Customer abstraction', 'GuestUser'],
    protectedFlows: [
      {
        id: 'registered',
        label: 'Registered user checkout',
        mustKeepElementNames: ['Checkout', 'User', 'PaymentService'],
        mustReach: [{ from: 'Checkout', to: 'PaymentService' }],
      },
    ],
    newFlows: [
      {
        id: 'guest',
        label: 'Guest checkout',
        mustHavePathTopics: ['guest'],
        mustReach: [{ from: 'Checkout', to: 'GuestUser' }],
      },
    ],
  }),

  // 415 — removal: retire SMS OTP, keep email
  pack({
    slug: 'co-remove-sms-otp',
    title: 'Retire SMS OTP Path',
    difficulty: 'easy',
    order: 415,
    description: 'SMS one-time codes are being sunset. Remove them cleanly and keep EmailOtp working.',
    tags: ['removal', 'auth', 'cleanup'],
    nodes: [
      node('n1', 'el-lc', 'LoginController', pos(0, 0), ['login']),
      node('n2', 'el-os', 'OtpService', pos(1, 0), ['sendOtp', 'verify']),
      node('n3', 'el-eo', 'EmailOtp', pos(2, 0), ['send']),
      node('n4', 'el-so', 'SmsOtp', pos(2, 1), ['send']),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n2', 'n3', 'dependency', 'right', 'left'),
      edge('e3', 'el-e3', 'n2', 'n4', 'dependency', 'bottom', 'left'),
    ],
    changeRequest: {
      title: 'Retire SMS OTP',
      body: 'SMS OTP costs too much and is phishable. Remove the SMS path entirely. Email OTP remains the only second factor.',
      type: 'removal',
    },
    briefing: 'Delete the SMS branch without leaving dangling references, and make sure the email flow is untouched.',
    expectedTouchHints: ['SmsOtp', 'OtpService'],
    protectedFlows: [
      {
        id: 'email-otp',
        label: 'Email OTP login',
        mustKeepElementNames: ['LoginController', 'OtpService', 'EmailOtp'],
        mustReach: [
          { from: 'LoginController', to: 'OtpService' },
          { from: 'OtpService', to: 'EmailOtp' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'no-sms',
        label: 'SMS path gone',
        mustNotReach: [{ from: 'OtpService', to: 'SmsOtp' }],
      },
    ],
  }),

  // 416 — variation: Apple Pay
  pack({
    slug: 'co-add-apple-pay',
    title: 'Add Apple Pay Option',
    difficulty: 'easy',
    order: 416,
    description: 'Checkout only supports card payments. Offer Apple Pay as another option.',
    tags: ['variation', 'payments', 'strategy'],
    nodes: [
      node('n1', 'el-ck', 'Checkout', pos(0, 0), ['pay']),
      node('n2', 'el-cp', 'CardPayment', pos(1, 0), ['authorize']),
      node('n3', 'el-rc', 'Receipt', pos(0, 1), ['render']),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Add Apple Pay',
      body: 'Mobile users want one-tap Apple Pay. Add it as another payment option; card payments must continue to work as-is.',
      type: 'variation',
    },
    briefing: 'Checkout is coupled to CardPayment. Extract a payment method role so Apple Pay can plug in beside the card.',
    expectedTouchHints: ['Checkout', 'PaymentMethod interface', 'ApplePayPayment'],
    protectedFlows: [
      {
        id: 'card',
        label: 'Card payment',
        mustKeepElementNames: ['Checkout', 'CardPayment', 'Receipt'],
        mustReach: [
          { from: 'Checkout', to: 'CardPayment' },
          { from: 'Checkout', to: 'Receipt' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'apple',
        label: 'Apple Pay',
        mustHavePathTopics: ['apple'],
        mustReach: [{ from: 'Checkout', to: 'ApplePayPayment' }],
      },
    ],
  }),

  // 417 — variation: dark theme report skin
  pack({
    slug: 'co-add-dark-theme-export',
    title: 'Add Dark Theme Report Skin',
    difficulty: 'easy',
    order: 417,
    description: 'ReportRenderer is hard-wired to LightTheme. Add a dark skin.',
    tags: ['variation', 'theming', 'strategy'],
    nodes: [
      node('n1', 'el-rr', 'ReportRenderer', pos(0, 0), ['render']),
      node('n2', 'el-lt', 'LightTheme', pos(1, 0), ['colors', 'fonts']),
      node('n3', 'el-rd', 'ReportData', pos(0, 1), ['rows']),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Dark theme for exports',
      body: 'Users want PDF reports in a dark skin for night review. Keep the light theme as default.',
      type: 'variation',
    },
    briefing: 'ReportRenderer references LightTheme directly. Make the theme replaceable without editing the renderer per skin.',
    expectedTouchHints: ['ReportRenderer', 'Theme interface', 'DarkTheme'],
    protectedFlows: [
      {
        id: 'light',
        label: 'Light report rendering',
        mustKeepElementNames: ['ReportRenderer', 'LightTheme', 'ReportData'],
        mustReach: [
          { from: 'ReportRenderer', to: 'LightTheme' },
          { from: 'ReportRenderer', to: 'ReportData' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'dark',
        label: 'Dark report rendering',
        mustHavePathTopics: ['dark', 'theme'],
        mustReach: [{ from: 'ReportRenderer', to: 'DarkTheme' }],
      },
    ],
  }),

  // 418 — capability: audit log on payment
  pack({
    slug: 'co-add-audit-log',
    title: 'Add Audit Log on Payment',
    difficulty: 'easy',
    order: 418,
    description: 'PaymentService leaves no trail. Record an audit entry for every payment.',
    tags: ['capability', 'audit', 'payments'],
    nodes: [
      node('n1', 'el-ps', 'PaymentService', pos(0, 0), ['charge', 'refund']),
      node('n2', 'el-sg', 'StripeGateway', pos(1, 0), ['createCharge']),
      node('n3', 'el-pa', 'Payment', pos(0, 1), [], [{ name: 'amount', type: 'Money' }, { name: 'status', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Audit every payment',
      body: 'Finance needs an immutable record of each charge and refund: who, when, how much. PaymentService has no audit today.',
      type: 'capability',
    },
    briefing: 'Add a dedicated audit collaborator for PaymentService. Keep the gateway call path unchanged.',
    expectedTouchHints: ['PaymentService', 'AuditLog', 'AuditEntry'],
    protectedFlows: [
      {
        id: 'charge',
        label: 'Charge via gateway',
        mustKeepElementNames: ['PaymentService', 'StripeGateway', 'Payment'],
        mustReach: [
          { from: 'PaymentService', to: 'StripeGateway' },
          { from: 'PaymentService', to: 'Payment' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'audit',
        label: 'Audit trail',
        mustHavePathTopics: ['audit'],
        mustReach: [{ from: 'PaymentService', to: 'AuditLog' }],
      },
    ],
  }),

  // 419 — removal: retire FTP, keep S3
  pack({
    slug: 'co-remove-ftp-upload',
    title: 'Retire FTP Upload Path',
    difficulty: 'easy',
    order: 419,
    description: 'FTP uploads are being decommissioned. Remove them but keep S3Uploader intact.',
    tags: ['removal', 'storage', 'cleanup'],
    nodes: [
      node('n1', 'el-us', 'UploadService', pos(0, 0), ['upload']),
      node('n2', 'el-s3', 'S3Uploader', pos(1, 0), ['putObject']),
      node('n3', 'el-ft', 'FtpUploader', pos(1, 1), ['putFile']),
      node('n4', 'el-fm', 'FileMeta', pos(0, 1), [], [{ name: 'path', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'left'),
      edge('e3', 'el-e3', 'n1', 'n4', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Retire FTP uploads',
      body: 'The FTP server is going away. Remove the FTP upload path entirely; S3 stays as the sole destination.',
      type: 'removal',
    },
    briefing: 'Remove FtpUploader and anything that still points at it, without breaking the S3 flow.',
    expectedTouchHints: ['FtpUploader', 'UploadService'],
    protectedFlows: [
      {
        id: 's3',
        label: 'S3 upload',
        mustKeepElementNames: ['UploadService', 'S3Uploader', 'FileMeta'],
        mustReach: [
          { from: 'UploadService', to: 'S3Uploader' },
          { from: 'UploadService', to: 'FileMeta' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'no-ftp',
        label: 'FTP path gone',
        mustNotReach: [{ from: 'UploadService', to: 'FtpUploader' }],
      },
    ],
  }),

  // 420 — capability/behavior: idempotency on charge
  pack({
    slug: 'co-add-idempotency-key',
    title: 'Add Idempotency on Charge',
    difficulty: 'easy',
    order: 420,
    description: 'Retries can double-charge customers. Make charging idempotent.',
    tags: ['capability', 'behavior', 'idempotency', 'payments'],
    nodes: [
      node('n1', 'el-cs', 'ChargeService', pos(0, 0), [{ name: 'charge', returnType: 'ChargeResult' }]),
      node('n2', 'el-pg', 'PaymentGateway', pos(1, 0), ['submit']),
      node('n3', 'el-cr', 'ChargeRecord', pos(0, 1), [], [{ name: 'orderId', type: 'String' }, { name: 'status', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Idempotent charges',
      body: 'A client retry after a timeout charged a customer twice. The same request key must never produce a second charge.',
      type: 'capability',
    },
    briefing: 'Give charges an idempotency key and a place to remember processed keys, checked before the gateway is called.',
    expectedTouchHints: ['ChargeService', 'IdempotencyStore', 'IdempotencyKey'],
    protectedFlows: [
      {
        id: 'charge',
        label: 'Charge still reaches gateway',
        mustKeepElementNames: ['ChargeService', 'PaymentGateway', 'ChargeRecord'],
        mustReach: [
          { from: 'ChargeService', to: 'PaymentGateway' },
          { from: 'ChargeService', to: 'ChargeRecord' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'idempotent',
        label: 'Duplicate request guard',
        mustHavePathTopics: ['idempotency', 'key'],
        mustReach: [{ from: 'ChargeService', to: 'IdempotencyStore' }],
      },
    ],
  }),

  // 421 — variation: Discord beside Slack
  pack({
    slug: 'co-add-discord-bot',
    title: 'Add Discord Beside Slack Alerts',
    difficulty: 'easy',
    order: 421,
    description: 'Alerts go to Slack only. Add Discord without disturbing Slack.',
    tags: ['variation', 'alerts', 'strategy', 'open-closed'],
    nodes: [
      node('n1', 'el-as', 'AlertService', pos(0, 0), ['raise']),
      node('n2', 'el-sl', 'SlackNotifier', pos(1, 0), ['post']),
      node('n3', 'el-in', 'Incident', pos(0, 1), [], [{ name: 'severity', type: 'String' }, { name: 'message', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'el-e1', 'n1', 'n2', 'dependency', 'right', 'left'),
      edge('e2', 'el-e2', 'n1', 'n3', 'dependency', 'bottom', 'top'),
    ],
    changeRequest: {
      title: 'Alert Discord too',
      body: 'The community team lives in Discord. Send incident alerts there as well as Slack; Slack must keep working.',
      type: 'variation',
    },
    briefing: 'AlertService calls SlackNotifier directly. Extract a notifier role so Discord can be added alongside Slack.',
    expectedTouchHints: ['AlertService', 'Notifier interface', 'DiscordNotifier'],
    protectedFlows: [
      {
        id: 'slack',
        label: 'Slack alerts',
        mustKeepElementNames: ['AlertService', 'SlackNotifier', 'Incident'],
        mustReach: [
          { from: 'AlertService', to: 'SlackNotifier' },
          { from: 'AlertService', to: 'Incident' },
        ],
      },
    ],
    newFlows: [
      {
        id: 'discord',
        label: 'Discord alerts',
        mustHavePathTopics: ['discord'],
        mustReach: [{ from: 'AlertService', to: 'DiscordNotifier' }],
      },
    ],
  }),
]
