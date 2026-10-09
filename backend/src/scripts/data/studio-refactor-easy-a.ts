/**
 * Design Studio Refactor — easy batch A (orders 200–210).
 */
import { pack, node, edge, pos, type RefactorPackSeed } from '../seed-studio-refactor-lib'

export const EASY_A: RefactorPackSeed[] = [
  // ── 200 ── Invoice Email Duty ───────────────────────────────────────────────
  pack({
    slug: 'ref-extract-invoice-email',
    title: 'Invoice Email Duty',
    difficulty: 'easy',
    description:
      'Invoice knows how to total itself and also how to talk SMTP. Pull the emailing duty out into its own collaborator.',
    order: 200,
    tags: ['extract', 'srp', 'notification', 'invoice'],
    nodes: [
      node('n1', 'el-inv-ctrl', 'InvoiceController', pos(0, 0), ['issueInvoice', 'resendInvoice']),
      node(
        'n2',
        'el-inv',
        'Invoice',
        pos(1, 0),
        [
          { name: 'calculateTotal', returnType: 'number' },
          'markPaid',
          'sendEmail',
          { name: 'buildEmailBody', returnType: 'string', visibility: 'private' },
        ],
        [
          { name: 'id', type: 'string' },
          { name: 'amount', type: 'number' },
        ],
      ),
      node('n3', 'el-inv-customer', 'Customer', pos(2, 0), ['getEmail'], [
        { name: 'email', type: 'string' },
      ]),
      node('n4', 'el-inv-repo', 'InvoiceRepository', pos(0, 1), ['save', 'findById']),
      node('n5', 'el-inv-smtp', 'SmtpClient', pos(1, 1), ['connect', 'send'], [
        { name: 'host', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'el-e-inv-1', 'n1', 'n2'),
      edge('e2', 'el-e-inv-2', 'n1', 'n4'),
      edge('e3', 'el-e-inv-3', 'n2', 'n3', 'association'),
      edge('e4', 'el-e-inv-4', 'n2', 'n5'),
    ],
    briefing: `Invoice started life as a simple value object, but over time somebody added sendEmail() and a private helper that builds the message body. Now an Invoice needs to know about SMTP, about message formatting and about the customer's address, on top of its real job of calculating a total and tracking whether it has been paid.

The problem is that two unrelated reasons to change live in one class. If marketing changes the email wording, or we switch transport, you have to open and retest Invoice. Unit-testing the total calculation also drags SmtpClient along.

Your job is to pull the emailing duty out into a dedicated collaborator, something like a Notifier. Invoice should stop knowing about SmtpClient. Whoever issues or resends an invoice should still end up sending the same email through the same SmtpClient.

Start with Invoice and SmtpClient. Move the email-related methods out, wire the new class between the controller and the SMTP client, and make sure nothing that used to work is lost.`,
    requirements: [
      'Issuing an invoice still results in an email being sent to the customer',
      'Resending an invoice still works',
      'Invoice still calculates its total and can be marked paid',
      'Invoice no longer depends directly on SmtpClient',
    ],
    flows: [
      {
        id: 'issue-invoice',
        label: 'Issue invoice and email it',
        steps: ['Controller issues invoice', 'Invoice is saved', 'Customer is emailed via SMTP'],
        mustKeepElementNames: ['InvoiceController', 'Invoice', 'SmtpClient'],
        mustReach: [
          { from: 'InvoiceController', to: 'SmtpClient' },
          { from: 'InvoiceController', to: 'InvoiceRepository' },
        ],
        mustHavePathTopics: ['email', 'send', 'invoice'],
      },
    ],
    forbidDeleteElementNames: ['InvoiceController', 'Invoice', 'SmtpClient', 'InvoiceRepository'],
    scenario: 'extract',
    modelHints: ['Introduce a Notifier / InvoiceNotifier that owns sendEmail and body building'],
  }),

  // ── 201 ── Checkout Stripe Binding ──────────────────────────────────────────
  pack({
    slug: 'ref-decouple-stripe-checkout',
    title: 'Checkout Stripe Binding',
    difficulty: 'easy',
    description:
      'Checkout calls StripeClient directly. Introduce a payment port so the provider can change without touching checkout.',
    order: 201,
    tags: ['decouple', 'dip', 'port', 'payment'],
    nodes: [
      node('n1', 'el-co-ctrl', 'CartController', pos(0, 0), ['checkout']),
      node(
        'n2',
        'el-co',
        'Checkout',
        pos(1, 0),
        ['placeOrder', { name: 'chargeCard', returnType: 'boolean' }, 'buildStripeParams'],
        [{ name: 'cartId', type: 'string' }],
      ),
      node('n3', 'el-co-stripe', 'StripeClient', pos(2, 0), ['createCharge', 'refundCharge'], [
        { name: 'apiKey', type: 'string' },
      ]),
      node('n4', 'el-co-order', 'Order', pos(0, 1), ['confirm'], [{ name: 'status', type: 'string' }]),
      node('n5', 'el-co-orderrepo', 'OrderRepository', pos(1, 1), ['save']),
    ],
    edges: [
      edge('e1', 'el-e-co-1', 'n1', 'n2'),
      edge('e2', 'el-e-co-2', 'n2', 'n3'),
      edge('e3', 'el-e-co-3', 'n2', 'n4'),
      edge('e4', 'el-e-co-4', 'n2', 'n5'),
    ],
    briefing: `Checkout is the heart of the purchase flow, and right now it is welded to Stripe. It builds Stripe-specific parameters, calls StripeClient.createCharge directly, and even knows how to interpret Stripe's response. Business rules and vendor details are tangled together.

That hurts in three ways. You can't test Checkout without a Stripe stub, you can't add a second provider without editing Checkout, and any Stripe SDK change ripples into code that should only care about "take payment for this cart".

Introduce a small payment port, for example PaymentPort with a charge-style method, and make Checkout depend on that. StripeClient should sit behind it as one implementation. The rest of the flow, order confirmation and persistence, must still happen exactly as before.

Start by looking at chargeCard and buildStripeParams. Decide what belongs to the port and what stays Stripe-specific.`,
    requirements: [
      'Placing an order still charges the customer through Stripe',
      'The order is still confirmed and saved after a successful payment',
      'Checkout depends on an abstraction, not on StripeClient directly',
    ],
    flows: [
      {
        id: 'pay-checkout',
        label: 'Pay at checkout',
        steps: ['Controller starts checkout', 'Payment is charged', 'Order is confirmed and saved'],
        mustKeepElementNames: ['Checkout', 'StripeClient', 'Order'],
        mustReach: [
          { from: 'CartController', to: 'StripeClient' },
          { from: 'Checkout', to: 'OrderRepository' },
        ],
        mustHavePathTopics: ['charge', 'payment', 'order'],
      },
    ],
    forbidDeleteElementNames: ['CartController', 'Checkout', 'StripeClient', 'Order', 'OrderRepository'],
    scenario: 'decouple',
    modelHints: ['PaymentPort interface implemented by StripeClient (or a thin StripeAdapter)'],
  }),

  // ── 202 ── Cart Pricing Logic ───────────────────────────────────────────────
  pack({
    slug: 'ref-extract-pricing-from-cart',
    title: 'Cart Pricing Logic',
    difficulty: 'easy',
    description:
      'Cart owns the item list and also tax and discount math. Extract a PricingService for the money rules.',
    order: 202,
    tags: ['extract', 'srp', 'pricing', 'cart'],
    nodes: [
      node('n1', 'el-cart-ctrl', 'CartController', pos(0, 0), ['viewCart', 'getTotal']),
      node(
        'n2',
        'el-cart',
        'Cart',
        pos(1, 0),
        [
          'addItem',
          'removeItem',
          { name: 'calculateTax', returnType: 'number' },
          { name: 'applyDiscount', returnType: 'number' },
          { name: 'getTotal', returnType: 'number' },
        ],
        [{ name: 'items', type: 'CartItem[]' }],
      ),
      node('n3', 'el-cart-item', 'CartItem', pos(2, 0), ['getSubtotal'], [
        { name: 'sku', type: 'string' },
        { name: 'price', type: 'number' },
      ]),
      node('n4', 'el-cart-tax', 'TaxTable', pos(0, 1), ['rateFor'], [
        { name: 'rates', type: 'Map<string, number>' },
      ]),
      node('n5', 'el-cart-disc', 'DiscountRules', pos(1, 1), ['findCoupon', 'percentFor']),
    ],
    edges: [
      edge('e1', 'el-e-cart-1', 'n1', 'n2'),
      edge('e2', 'el-e-cart-2', 'n2', 'n3', 'composition'),
      edge('e3', 'el-e-cart-3', 'n2', 'n4'),
      edge('e4', 'el-e-cart-4', 'n2', 'n5'),
    ],
    briefing: `Cart is supposed to hold items. Today it also holds the tax policy and the discount policy: calculateTax reaches into TaxTable, applyDiscount reaches into DiscountRules, and getTotal stitches the lot together.

That makes Cart the place where every pricing change lands. A new tax region, a stacked coupon or a rounding fix all mean editing a class whose job was just to add and remove items. Testing a price rule also means building a full cart first.

Extract a PricingService that owns the tax and discount math and the collaborators it needs. Cart should keep its items and ask for a total through that service, or let the controller coordinate. The user should still see the same total on the cart page.

Start with calculateTax and applyDiscount. Follow where TaxTable and DiscountRules are used, and re-route those edges so they no longer hang off Cart.`,
    requirements: [
      'The cart total still includes tax and discounts',
      'Items can still be added to and removed from the cart',
      'Cart no longer talks directly to TaxTable or DiscountRules',
    ],
    flows: [
      {
        id: 'view-total',
        label: 'View cart total',
        steps: ['Controller asks for total', 'Items are summed', 'Tax and discount are applied'],
        mustKeepElementNames: ['Cart', 'CartItem', 'TaxTable', 'DiscountRules'],
        mustReach: [
          { from: 'CartController', to: 'TaxTable' },
          { from: 'CartController', to: 'DiscountRules' },
        ],
        mustHavePathTopics: ['tax', 'discount', 'total'],
      },
    ],
    forbidDeleteElementNames: ['CartController', 'Cart', 'CartItem', 'TaxTable', 'DiscountRules'],
    scenario: 'extract',
    modelHints: ['PricingService owns calculateTax / applyDiscount and depends on TaxTable + DiscountRules'],
  }),

  // ── 203 ── User Profile Blob ────────────────────────────────────────────────
  pack({
    slug: 'ref-split-user-profile',
    title: 'User Profile Blob',
    difficulty: 'easy',
    description:
      'UserProfile mixes display data, password handling, avatars and email verification. Extract the auth concerns.',
    order: 203,
    tags: ['extract', 'srp', 'god-class', 'auth'],
    nodes: [
      node('n1', 'el-up-ctrl', 'UserController', pos(0, 0), ['updateProfile', 'changePassword', 'verify']),
      node(
        'n2',
        'el-up',
        'UserProfile',
        pos(1, 0),
        [
          'rename',
          'setBio',
          'setPassword',
          { name: 'checkPassword', returnType: 'boolean' },
          'uploadAvatar',
          'verifyEmail',
        ],
        [
          { name: 'displayName', type: 'string' },
          { name: 'passwordHash', type: 'string' },
          { name: 'avatarUrl', type: 'string' },
          { name: 'emailVerified', type: 'boolean' },
        ],
      ),
      node('n3', 'el-up-repo', 'UserRepository', pos(2, 0), ['save', 'findById']),
      node('n4', 'el-up-mail', 'MailGateway', pos(0, 1), ['sendVerification']),
      node('n5', 'el-up-avatar', 'AvatarStore', pos(1, 1), ['put', 'get']),
      node('n6', 'el-up-hasher', 'PasswordHasher', pos(2, 1), ['hash', 'matches']),
    ],
    edges: [
      edge('e1', 'el-e-up-1', 'n1', 'n2'),
      edge('e2', 'el-e-up-2', 'n2', 'n3'),
      edge('e3', 'el-e-up-3', 'n2', 'n4'),
      edge('e4', 'el-e-up-4', 'n2', 'n5'),
      edge('e5', 'el-e-up-5', 'n2', 'n6'),
    ],
    briefing: `UserProfile started as a name and a bio. It now also stores a password hash, hashes and checks passwords, uploads avatars and runs email verification. Four different reasons to change, and it talks to four different collaborators.

Anyone touching the profile page risks breaking login. Anyone hardening password rules has to read through avatar upload code. A reviewer cannot tell which fields are display data and which are credentials.

Extract an AuthConcerns class (or similar) that owns password setting, password checking and email verification, along with the PasswordHasher and MailGateway edges. UserProfile should go back to being profile data, with the avatar handling kept simple. Controller behavior must remain the same.

A good start is to move setPassword, checkPassword and verifyEmail first, then see which dependencies follow them.`,
    requirements: [
      'Users can still update their display name and bio',
      'Password changes still hash the new password and persist the user',
      'Email verification still sends a verification message',
      'Avatar upload still stores the image',
      'UserProfile no longer owns password or verification logic',
    ],
    flows: [
      {
        id: 'change-password',
        label: 'Change password',
        steps: ['Controller receives request', 'Password is hashed', 'User is saved'],
        mustKeepElementNames: ['UserController', 'PasswordHasher', 'UserRepository'],
        mustReach: [
          { from: 'UserController', to: 'PasswordHasher' },
          { from: 'UserController', to: 'UserRepository' },
        ],
        mustHavePathTopics: ['password', 'hash', 'save'],
      },
      {
        id: 'verify-email',
        label: 'Verify email',
        steps: ['Controller triggers verification', 'Mail is sent'],
        mustKeepElementNames: ['MailGateway'],
        mustReach: [{ from: 'UserController', to: 'MailGateway' }],
        mustHavePathTopics: ['verif', 'mail'],
      },
    ],
    forbidDeleteElementNames: [
      'UserController',
      'UserProfile',
      'UserRepository',
      'MailGateway',
      'AvatarStore',
      'PasswordHasher',
    ],
    scenario: 'extract',
    modelHints: ['AuthConcerns / CredentialService owns password + verification; UserProfile keeps profile data'],
  }),

  // ── 204 ── File Uploader Storage ────────────────────────────────────────────
  pack({
    slug: 'ref-decouple-s3-uploader',
    title: 'File Uploader Storage',
    difficulty: 'easy',
    description:
      'FileUploader writes straight to S3Client. Put a StoragePort in between so storage can be swapped or faked.',
    order: 204,
    tags: ['decouple', 'dip', 'port', 'storage'],
    nodes: [
      node('n1', 'el-fu-ctrl', 'UploadController', pos(0, 0), ['upload']),
      node(
        'n2',
        'el-fu',
        'FileUploader',
        pos(1, 0),
        ['uploadFile', 'validateSize', { name: 'buildBucketKey', returnType: 'string' }],
        [{ name: 'bucketName', type: 'string' }],
      ),
      node('n3', 'el-fu-s3', 'S3Client', pos(2, 0), ['putObject', 'getObject', 'deleteObject'], [
        { name: 'region', type: 'string' },
      ]),
      node('n4', 'el-fu-rec', 'UploadRecord', pos(0, 1), ['markComplete'], [
        { name: 'key', type: 'string' },
      ]),
      node('n5', 'el-fu-meta', 'MetadataRepository', pos(1, 1), ['save']),
    ],
    edges: [
      edge('e1', 'el-e-fu-1', 'n1', 'n2'),
      edge('e2', 'el-e-fu-2', 'n2', 'n3'),
      edge('e3', 'el-e-fu-3', 'n2', 'n4'),
      edge('e4', 'el-e-fu-4', 'n2', 'n5'),
    ],
    briefing: `FileUploader validates the file, builds the bucket key, calls S3Client.putObject and records metadata. It is the only thing that should care about "a file arrives, we store it", yet it is hard-wired to S3: bucket names, regions and the S3 call shape leak into its logic.

Local development needs real credentials or a heavy mock, and the product team has already asked about supporting another object store for one region. Today that means editing FileUploader and every test that touches it.

Introduce a StoragePort with the operations the uploader really needs (put, maybe get and delete). Have S3Client sit behind it as one implementation. FileUploader should depend on the port, not the SDK-shaped class.

Look at buildBucketKey and uploadFile first. Decide what is a storage detail and what is upload policy.`,
    requirements: [
      'Uploading a file still stores it in S3',
      'Metadata is still saved for every upload',
      'FileUploader depends on an abstraction instead of S3Client',
    ],
    flows: [
      {
        id: 'upload-file',
        label: 'Upload file',
        steps: ['Controller receives file', 'Size is validated', 'Object is stored', 'Metadata is saved'],
        mustKeepElementNames: ['UploadController', 'FileUploader', 'S3Client'],
        mustReach: [
          { from: 'UploadController', to: 'S3Client' },
          { from: 'FileUploader', to: 'MetadataRepository' },
        ],
        mustHavePathTopics: ['upload', 'put', 'storage'],
      },
    ],
    forbidDeleteElementNames: ['UploadController', 'FileUploader', 'S3Client', 'MetadataRepository'],
    scenario: 'decouple',
    modelHints: ['StoragePort interface with put/get/delete; S3Client implements it'],
  }),

  // ── 205 ── Report CSV Export ────────────────────────────────────────────────
  pack({
    slug: 'ref-extract-report-csv',
    title: 'Report CSV Export',
    difficulty: 'easy',
    description:
      'Report builds rows and also renders CSV and PDF itself. Extract an Exporter so formats stop leaking into the model.',
    order: 205,
    tags: ['extract', 'srp', 'export', 'report'],
    nodes: [
      node('n1', 'el-rp-ctrl', 'ReportController', pos(0, 0), ['download']),
      node(
        'n2',
        'el-rp',
        'Report',
        pos(1, 0),
        [
          'addRow',
          { name: 'toCsv', returnType: 'string' },
          { name: 'toPdf', returnType: 'byte[]' },
          { name: 'escapeCell', returnType: 'string', visibility: 'private' },
        ],
        [
          { name: 'title', type: 'string' },
          { name: 'rows', type: 'ReportRow[]' },
        ],
      ),
      node('n3', 'el-rp-row', 'ReportRow', pos(2, 0), ['getCells'], [{ name: 'cells', type: 'string[]' }]),
      node('n4', 'el-rp-pdf', 'PdfLibrary', pos(0, 1), ['render']),
      node('n5', 'el-rp-store', 'FileStore', pos(1, 1), ['write']),
    ],
    edges: [
      edge('e1', 'el-e-rp-1', 'n1', 'n2'),
      edge('e2', 'el-e-rp-2', 'n2', 'n3', 'composition'),
      edge('e3', 'el-e-rp-3', 'n2', 'n4'),
      edge('e4', 'el-e-rp-4', 'n1', 'n5'),
    ],
    briefing: `Report holds rows, which is good. It also knows how to turn itself into CSV, including cell escaping, and how to turn itself into a PDF by calling PdfLibrary. Every new output format means editing Report.

This is a textbook case of a model class absorbing presentation concerns. Adding an Excel export tomorrow would add a third toX method, a third private helper, and probably another library edge on the same class.

Extract an Exporter (a single class is fine at this size) that takes a Report and produces CSV or PDF output. Report should stay a data holder. The controller should still be able to download a report in either format and write it to the FileStore.

Begin by moving toCsv and escapeCell, then handle toPdf and the PdfLibrary dependency.`,
    requirements: [
      'Downloading a report as CSV still works',
      'Downloading a report as PDF still works',
      'Generated files are still written to the FileStore',
      'Report no longer contains format-specific rendering code',
    ],
    flows: [
      {
        id: 'export-csv',
        label: 'Export CSV',
        steps: ['Controller requests CSV', 'Report rows are rendered', 'File is written'],
        mustKeepElementNames: ['ReportController', 'Report', 'FileStore'],
        mustReach: [
          { from: 'ReportController', to: 'FileStore' },
          { from: 'ReportController', to: 'ReportRow' },
        ],
        mustHavePathTopics: ['csv', 'export', 'report'],
      },
      {
        id: 'export-pdf',
        label: 'Export PDF',
        steps: ['Controller requests PDF', 'PDF library renders', 'File is written'],
        mustKeepElementNames: ['PdfLibrary'],
        mustReach: [{ from: 'ReportController', to: 'PdfLibrary' }],
        mustHavePathTopics: ['pdf', 'render'],
      },
    ],
    forbidDeleteElementNames: ['ReportController', 'Report', 'ReportRow', 'PdfLibrary', 'FileStore'],
    scenario: 'extract',
    modelHints: ['Exporter (or ReportExporter) with toCsv/toPdf; Report keeps rows only'],
  }),

  // ── 206 ── Service Logging Noise ────────────────────────────────────────────
  pack({
    slug: 'ref-cleanup-logger-calls',
    title: 'Service Logging Noise',
    difficulty: 'easy',
    description:
      'OrderService formats and writes its own logs between business steps. Extract a Logger collaborator and clean it up.',
    order: 206,
    tags: ['cleanup', 'logging', 'srp', 'order'],
    nodes: [
      node('n1', 'el-ls-ctrl', 'OrderController', pos(0, 0), ['place', 'cancel']),
      node(
        'n2',
        'el-ls-svc',
        'OrderService',
        pos(1, 0),
        [
          'placeOrder',
          'cancelOrder',
          { name: 'logInfo', visibility: 'private' },
          { name: 'logError', visibility: 'private' },
          { name: 'formatLogLine', returnType: 'string', visibility: 'private' },
        ],
        [{ name: 'logPath', type: 'string' }],
      ),
      node('n3', 'el-ls-repo', 'OrderRepository', pos(2, 0), ['save', 'findById']),
      node('n4', 'el-ls-pay', 'PaymentGateway', pos(0, 1), ['charge', 'refund']),
      node('n5', 'el-ls-file', 'LogFile', pos(1, 1), ['append']),
    ],
    edges: [
      edge('e1', 'el-e-ls-1', 'n1', 'n2'),
      edge('e2', 'el-e-ls-2', 'n2', 'n3'),
      edge('e3', 'el-e-ls-3', 'n2', 'n4'),
      edge('e4', 'el-e-ls-4', 'n2', 'n5'),
    ],
    briefing: `OrderService has real work to do: place an order, charge the payment, save the result, and handle cancellation. But read the code and half of it is logging. It formats a line, appends to a log file, then does a step, formats another line, appends again. The business flow is buried in noise.

Because the logging helpers are private and the log path is an attribute, you cannot change log format, redirect to a different sink, or silence logs in tests without touching the service. And the service has an edge to LogFile that has nothing to do with orders.

Extract a Logger collaborator that owns formatting and writing. OrderService should call it with simple messages, and nothing else in the order flow may change: payments still charge, refunds still happen, orders are still saved.

Remove logInfo, logError and formatLogLine from OrderService once the Logger exists, and re-point the LogFile edge.`,
    requirements: [
      'Placing an order still charges payment and saves the order',
      'Cancelling an order still refunds payment',
      'Important events are still logged',
      'OrderService no longer formats or writes log lines itself',
    ],
    flows: [
      {
        id: 'place-order',
        label: 'Place order',
        steps: ['Controller places order', 'Payment is charged', 'Order is saved', 'Event is logged'],
        mustKeepElementNames: ['OrderController', 'OrderService', 'PaymentGateway', 'OrderRepository'],
        mustReach: [
          { from: 'OrderController', to: 'PaymentGateway' },
          { from: 'OrderController', to: 'OrderRepository' },
          { from: 'OrderController', to: 'LogFile' },
        ],
        mustHavePathTopics: ['place', 'charge', 'log'],
      },
    ],
    forbidDeleteElementNames: [
      'OrderController',
      'OrderService',
      'OrderRepository',
      'PaymentGateway',
      'LogFile',
    ],
    scenario: 'cleanup',
    maxNewAbstractions: 1,
    modelHints: ['A single Logger class (or interface) that wraps LogFile and formatting'],
  }),

  // ── 207 ── Mailer SendGrid Binding ──────────────────────────────────────────
  pack({
    slug: 'ref-decouple-sendgrid',
    title: 'Mailer SendGrid Binding',
    difficulty: 'easy',
    description:
      'Mailer is hard-wired to SendGridClient. Introduce an EmailPort so the vendor is a detail.',
    order: 207,
    tags: ['decouple', 'dip', 'port', 'email'],
    nodes: [
      node('n1', 'el-ml-signup', 'SignupService', pos(0, 0), ['register']),
      node(
        'n2',
        'el-ml',
        'Mailer',
        pos(1, 0),
        ['sendWelcome', 'sendReceipt', { name: 'toSendGridPayload', returnType: 'object', visibility: 'private' }],
        [{ name: 'fromAddress', type: 'string' }],
      ),
      node('n3', 'el-ml-sg', 'SendGridClient', pos(2, 0), ['postMail'], [
        { name: 'apiKey', type: 'string' },
      ]),
      node('n4', 'el-ml-tpl', 'TemplateRenderer', pos(1, 1), ['render']),
    ],
    edges: [
      edge('e1', 'el-e-ml-1', 'n1', 'n2'),
      edge('e2', 'el-e-ml-2', 'n2', 'n3'),
      edge('e3', 'el-e-ml-3', 'n2', 'n4'),
    ],
    briefing: `Mailer is the single place the app sends email, which is a good instinct. The trouble is how it does it: it builds a SendGrid-shaped payload and calls SendGridClient directly. So the class that decides which email to send is also the class that knows SendGrid's wire format.

If we ever move to SES or Postmark, Mailer changes. If we want a no-op sender for local runs, Mailer needs a flag. Tests have to stub a vendor client with a vendor-shaped payload.

Introduce an EmailPort that expresses what the app needs ("send this message to this address") in our own terms. Mailer should depend on it, and SendGridClient should be the implementation behind it, including the payload translation.

Keep the welcome and receipt emails working end to end. Start by moving toSendGridPayload next to the vendor client.`,
    requirements: [
      'Signing up still sends a welcome email',
      'Templates are still rendered before sending',
      'Mailer no longer references SendGridClient directly',
    ],
    flows: [
      {
        id: 'welcome-email',
        label: 'Send welcome email',
        steps: ['Signup registers user', 'Template is rendered', 'Email is posted to SendGrid'],
        mustKeepElementNames: ['SignupService', 'Mailer', 'SendGridClient', 'TemplateRenderer'],
        mustReach: [
          { from: 'SignupService', to: 'SendGridClient' },
          { from: 'Mailer', to: 'TemplateRenderer' },
        ],
        mustHavePathTopics: ['email', 'send', 'welcome'],
      },
    ],
    forbidDeleteElementNames: ['SignupService', 'Mailer', 'SendGridClient', 'TemplateRenderer'],
    scenario: 'decouple',
    modelHints: ['EmailPort interface; SendGridClient (or adapter) implements it'],
  }),

  // ── 208 ── Form Validation Mix ──────────────────────────────────────────────
  pack({
    slug: 'ref-extract-validation',
    title: 'Form Validation Mix',
    difficulty: 'easy',
    description:
      'FormSubmitter validates input and persists it in the same methods. Extract a Validator.',
    order: 208,
    tags: ['extract', 'srp', 'validation', 'forms'],
    nodes: [
      node('n1', 'el-fv-ctrl', 'FormController', pos(0, 0), ['handlePost']),
      node(
        'n2',
        'el-fv-sub',
        'FormSubmitter',
        pos(1, 0),
        [
          'submit',
          { name: 'validateRequired', returnType: 'boolean', visibility: 'private' },
          { name: 'validateEmail', returnType: 'boolean', visibility: 'private' },
          { name: 'validateLength', returnType: 'boolean', visibility: 'private' },
          'persist',
        ],
        [{ name: 'errors', type: 'ValidationError[]' }],
      ),
      node('n3', 'el-fv-repo', 'FormRepository', pos(2, 0), ['insert']),
      node('n4', 'el-fv-subm', 'Submission', pos(0, 1), ['toMap'], [
        { name: 'fields', type: 'Map<string, string>' },
      ]),
      node('n5', 'el-fv-err', 'ValidationError', pos(1, 1), ['getMessage'], [
        { name: 'field', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'el-e-fv-1', 'n1', 'n2'),
      edge('e2', 'el-e-fv-2', 'n2', 'n3'),
      edge('e3', 'el-e-fv-3', 'n2', 'n4'),
      edge('e4', 'el-e-fv-4', 'n2', 'n5'),
    ],
    briefing: `FormSubmitter.submit checks required fields, checks the email format, checks lengths, collects errors, and then, if everything passed, persists the submission. Validation rules and storage live in the same class, and the private validate methods are not reusable anywhere else.

Two things go wrong. Another form that needs the same email check has to copy the code. And when you test persistence you have to craft valid input, while when you test a rule you drag the repository along.

Extract a Validator that owns the rule checks and produces ValidationError objects. FormSubmitter should ask it whether a Submission is valid and only persist when it is. Behavior must match: invalid forms are rejected with the same errors, valid ones are saved.

Start with the three validate methods and the errors attribute. Then decide how submit reads once it delegates.`,
    requirements: [
      'Invalid submissions are still rejected with validation errors',
      'Valid submissions are still persisted through the repository',
      'FormSubmitter no longer contains individual validation rules',
    ],
    flows: [
      {
        id: 'submit-form',
        label: 'Submit form',
        steps: ['Controller receives post', 'Input is validated', 'Submission is saved'],
        mustKeepElementNames: ['FormController', 'FormSubmitter', 'FormRepository', 'ValidationError'],
        mustReach: [
          { from: 'FormController', to: 'FormRepository' },
          { from: 'FormController', to: 'ValidationError' },
        ],
        mustHavePathTopics: ['validate', 'submit', 'persist'],
      },
    ],
    forbidDeleteElementNames: [
      'FormController',
      'FormSubmitter',
      'FormRepository',
      'Submission',
      'ValidationError',
    ],
    scenario: 'extract',
    modelHints: ['Validator owns validateRequired / validateEmail / validateLength and returns ValidationError[]'],
  }),

  // ── 209 ── Todo Reminder Duty ───────────────────────────────────────────────
  pack({
    slug: 'ref-split-todo-reminders',
    title: 'Todo Reminder Duty',
    difficulty: 'easy',
    description:
      'TodoList handles add/complete/delete and also scans for due items to email reminders. Extract a ReminderService.',
    order: 209,
    tags: ['extract', 'srp', 'reminders', 'todo'],
    nodes: [
      node('n1', 'el-td-ctrl', 'TodoController', pos(0, 0), ['add', 'complete', 'remove']),
      node(
        'n2',
        'el-td-list',
        'TodoList',
        pos(1, 0),
        [
          'addTodo',
          'completeTodo',
          'deleteTodo',
          { name: 'findDue', returnType: 'Todo[]', visibility: 'private' },
          'sendReminders',
        ],
        [{ name: 'todos', type: 'Todo[]' }],
      ),
      node('n3', 'el-td-todo', 'Todo', pos(2, 0), ['isDue'], [
        { name: 'title', type: 'string' },
        { name: 'dueAt', type: 'Date' },
      ]),
      node('n4', 'el-td-repo', 'TodoRepository', pos(0, 1), ['save', 'loadAll']),
      node('n5', 'el-td-mail', 'EmailSender', pos(1, 1), ['send']),
    ],
    edges: [
      edge('e1', 'el-e-td-1', 'n1', 'n2'),
      edge('e2', 'el-e-td-2', 'n2', 'n3', 'composition'),
      edge('e3', 'el-e-td-3', 'n2', 'n4'),
      edge('e4', 'el-e-td-4', 'n2', 'n5'),
    ],
    briefing: `TodoList does basic CRUD on todos, which is fine. It also has sendReminders, which scans for items that are due and fires emails through EmailSender. Now the same class is responsible for the list and for a scheduled notification feature.

You can see the cost in the edges: the class that should only know about Todo and TodoRepository also depends on EmailSender. Changing the reminder cadence, the wording or the channel means touching the list. And CRUD tests need an email stub they don't care about.

Extract a ReminderService that owns finding due todos and sending reminders. TodoList stays the place for add, complete and delete. A reminder run should still email the user for every due todo, and the controller-driven flows must keep working.

Start with sendReminders and findDue, then re-wire who talks to EmailSender.`,
    requirements: [
      'Adding, completing and deleting todos still works and persists',
      'Due todos still trigger an email reminder',
      'TodoList no longer depends on EmailSender',
    ],
    flows: [
      {
        id: 'todo-crud',
        label: 'Add and complete a todo',
        steps: ['Controller adds todo', 'Todo is persisted', 'Todo is completed'],
        mustKeepElementNames: ['TodoController', 'TodoList', 'TodoRepository'],
        mustReach: [{ from: 'TodoController', to: 'TodoRepository' }],
        mustHavePathTopics: ['add', 'complete', 'save'],
      },
      {
        id: 'send-reminders',
        label: 'Send reminders',
        steps: ['Due todos are found', 'Reminder email is sent'],
        mustKeepElementNames: ['Todo', 'EmailSender'],
        mustReach: [{ from: 'TodoController', to: 'EmailSender' }],
        mustHavePathTopics: ['reminder', 'due', 'email'],
      },
    ],
    forbidDeleteElementNames: ['TodoController', 'TodoList', 'Todo', 'TodoRepository', 'EmailSender'],
    scenario: 'extract',
    modelHints: ['ReminderService depends on TodoRepository and EmailSender; TodoList keeps CRUD only'],
  }),

  // ── 210 ── Api Cache Redis Binding ──────────────────────────────────────────
  pack({
    slug: 'ref-decouple-redis-cache',
    title: 'Api Cache Redis Binding',
    difficulty: 'easy',
    description:
      'ApiService uses RedisClient directly for caching. Introduce a CachePort so the cache technology is swappable.',
    order: 210,
    tags: ['decouple', 'dip', 'port', 'cache'],
    nodes: [
      node('n1', 'el-ac-ctrl', 'ApiController', pos(0, 0), ['getResource']),
      node(
        'n2',
        'el-ac-svc',
        'ApiService',
        pos(1, 0),
        [
          { name: 'fetchResource', returnType: 'Resource' },
          { name: 'cacheKeyFor', returnType: 'string', visibility: 'private' },
          { name: 'readRedis', returnType: 'string', visibility: 'private' },
          { name: 'writeRedis', visibility: 'private' },
        ],
        [{ name: 'ttlSeconds', type: 'number' }],
      ),
      node('n3', 'el-ac-redis', 'RedisClient', pos(2, 0), ['get', 'setex', 'del'], [
        { name: 'host', type: 'string' },
      ]),
      node('n4', 'el-ac-up', 'UpstreamClient', pos(1, 1), ['fetch']),
    ],
    edges: [
      edge('e1', 'el-e-ac-1', 'n1', 'n2'),
      edge('e2', 'el-e-ac-2', 'n2', 'n3'),
      edge('e3', 'el-e-ac-3', 'n2', 'n4'),
    ],
    briefing: `ApiService fetches a resource from an upstream API and caches the result. It does that by calling RedisClient.get and setex directly, through private helpers named after Redis. The caching decision, "check cache, else fetch, then store", is mixed with Redis command details like setex and TTL units.

That makes the service hard to test without a Redis fake, and it means moving to Memcached or an in-process cache is a rewrite of the service rather than a swap of an adapter.

Introduce a CachePort with the operations the service genuinely needs (get and set with a TTL, maybe delete). Make ApiService depend on it, and let RedisClient, or a thin adapter around it, implement it.

Don't change the request flow: a cache hit returns quickly, a miss goes to the upstream client and stores the result. Start with readRedis and writeRedis, they show you what the port should look like.`,
    requirements: [
      'A cache hit still returns the cached resource without calling upstream',
      'A cache miss still fetches from upstream and stores the result',
      'ApiService no longer references RedisClient directly',
    ],
    flows: [
      {
        id: 'get-resource',
        label: 'Get resource with cache',
        steps: ['Controller requests resource', 'Cache is checked', 'Upstream is called on a miss', 'Result is cached'],
        mustKeepElementNames: ['ApiController', 'ApiService', 'RedisClient', 'UpstreamClient'],
        mustReach: [
          { from: 'ApiController', to: 'RedisClient' },
          { from: 'ApiController', to: 'UpstreamClient' },
        ],
        mustHavePathTopics: ['cache', 'get', 'set'],
      },
    ],
    forbidDeleteElementNames: ['ApiController', 'ApiService', 'RedisClient', 'UpstreamClient'],
    scenario: 'decouple',
    modelHints: ['CachePort interface (get/set with ttl); RedisClient or RedisCacheAdapter implements it'],
  }),
]
