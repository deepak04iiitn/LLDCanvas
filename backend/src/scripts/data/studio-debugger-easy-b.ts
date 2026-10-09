import { pack, node, edge, pos, type DebuggerPackSeed } from '../seed-studio-debugger-lib'

/**
 * Easy "Debug and Fix" packs, batch B (orders 111-121).
 * Convention: node id `nX`, elementId `cls-*`; edge id `eX`, elementId `rel-*`.
 */
export const EASY_B: DebuggerPackSeed[] = [
  // 111 — Library Manager God Object
  pack({
    slug: 'dbg-library-manager-god',
    title: 'Library Manager Scope',
    difficulty: 'easy',
    order: 111,
    description: 'A single manager class runs the whole library. Find the class that knows too much.',
    tags: ['library', 'god-object', 'srp'],
    briefing:
      'A city library system is being rewritten. The team lead says every new feature request lands in the same class and nobody wants to touch it before a release.',
    requirement:
      'Members borrow and return books; overdue loans accrue fines; members get notified about due dates. Each concern should be able to change independently.',
    nodes: [
      node(
        'n1',
        'cls-library-manager',
        'LibraryManager',
        pos(1, 0),
        [
          'addBook',
          'searchCatalog',
          'borrowBook',
          'returnBook',
          'calculateFine',
          'collectFine',
          'sendDueReminder',
          'sendOverdueNotice',
        ],
        [
          { name: 'books', type: 'List<Book>' },
          { name: 'loans', type: 'List<Loan>' },
          { name: 'finePerDay', type: 'double' },
        ],
      ),
      node('n2', 'cls-book', 'Book', pos(0, 1), ['isAvailable'], [{ name: 'isbn', type: 'String' }, { name: 'title', type: 'String' }]),
      node('n3', 'cls-member', 'Member', pos(1, 1), ['getEmail'], [{ name: 'memberId', type: 'String' }, { name: 'email', type: 'String' }]),
      node('n4', 'cls-loan', 'Loan', pos(2, 1), ['isOverdue'], [{ name: 'dueDate', type: 'Date' }]),
      node('n5', 'cls-smtp-client', 'SmtpClient', pos(2, 0), ['send'], [{ name: 'host', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'rel-manager-book', 'n1', 'n2', 'association'),
      edge('e2', 'rel-manager-member', 'n1', 'n3', 'association'),
      edge('e3', 'rel-manager-loan', 'n1', 'n4', 'association'),
      edge('e4', 'rel-manager-smtp', 'n1', 'n5', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-library-god',
        elementIds: ['cls-library-manager'],
        category: 'God Object',
        aliases: ['SRP Violation', 'Too many responsibilities'],
        explanationKeywords: ['catalog', 'borrow', 'fine', 'notification', 'responsibilities', 'god', 'change independently'],
        modelAnswer:
          'LibraryManager owns catalog management, lending, fine calculation and notifications. Four unrelated reasons to change live in one class, so it becomes a merge-conflict magnet and is hard to test. Split into Catalog, LendingService, FinePolicy and a Notifier abstraction, and let LibraryManager (if kept) only coordinate.',
        hints: [
          'Count how many different stakeholders could ask for a change to LibraryManager.',
          'Group its methods by noun: catalog, loan, fine, notice. Each group is a candidate class.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['LendingService'] },
  }),

  // 112 — ATM Monolith
  pack({
    slug: 'dbg-atm-monolith',
    title: 'ATM Control Panel',
    difficulty: 'easy',
    order: 112,
    description: 'The ATM class handles everything from PIN checks to receipt printing.',
    tags: ['atm', 'god-object', 'srp'],
    briefing:
      'The bank is porting its ATM firmware. Hardware vendors keep changing printer and cash-dispenser models, and every change forces a full ATM regression.',
    requirement:
      'Authenticate a card and PIN, dispense cash against an account, print a receipt and record an audit log. Hardware or logging changes must not touch authentication logic.',
    nodes: [
      node(
        'n1',
        'cls-atm',
        'ATM',
        pos(1, 0),
        [
          'verifyPin',
          'lockCard',
          'dispenseCash',
          'countNotes',
          'printReceipt',
          'writeAuditLog',
          'withdraw',
        ],
        [
          { name: 'cashInventory', type: 'Map<int,int>' },
          { name: 'logFile', type: 'File' },
          { name: 'printerPort', type: 'String' },
        ],
      ),
      node('n2', 'cls-card', 'Card', pos(0, 1), ['getPinHash'], [{ name: 'number', type: 'String' }]),
      node('n3', 'cls-account', 'Account', pos(1, 1), ['debit', 'getBalance'], [{ name: 'balance', type: 'double' }]),
      node('n4', 'cls-transaction', 'Transaction', pos(2, 1), ['getAmount'], [{ name: 'amount', type: 'double' }, { name: 'timestamp', type: 'Date' }]),
    ],
    edges: [
      edge('e1', 'rel-atm-card', 'n1', 'n2', 'association'),
      edge('e2', 'rel-atm-account', 'n1', 'n3', 'association'),
      edge('e3', 'rel-atm-transaction', 'n1', 'n4', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-atm-god',
        elementIds: ['cls-atm'],
        category: 'God Object',
        aliases: ['SRP Violation', 'Monolithic class'],
        explanationKeywords: ['authentication', 'dispense', 'print', 'log', 'hardware', 'responsibilities', 'split'],
        modelAnswer:
          'ATM authenticates users, controls cash hardware, prints receipts and writes audit logs. Each of these changes for a different reason (security policy, hardware vendor, receipt format, compliance). Extract Authenticator, CashDispenser, ReceiptPrinter and AuditLogger, and let ATM orchestrate the withdraw flow through them.',
        hints: [
          'Which methods would change if the printer vendor changed? Do they belong next to verifyPin?',
          'Think of the ATM as a coordinator that delegates to focused collaborators.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['CashDispenser'] },
  }),

  // 113 — Vending machine payment mix
  pack({
    slug: 'dbg-vending-payment-mix',
    title: 'Vending Payment Mix',
    difficulty: 'easy',
    order: 113,
    description: 'Coin handling and card processing are tangled inside the machine itself.',
    tags: ['vending-machine', 'srp', 'payment'],
    briefing:
      'Product wants to add mobile wallets to the vending machine. The engineer estimates two weeks because payment code is spread through the machine class.',
    requirement:
      'The machine selects a product and dispenses it once payment succeeds. Payment can be coins, card, or future methods without editing dispensing logic.',
    nodes: [
      node(
        'n1',
        'cls-vending-machine',
        'VendingMachine',
        pos(1, 0),
        [
          'selectProduct',
          'insertCoin',
          'calculateCoinChange',
          'swipeCard',
          'validateCardNumber',
          'chargeCard',
          'dispense',
        ],
        [
          { name: 'coinBalance', type: 'int' },
          { name: 'cardToken', type: 'String' },
          { name: 'selected', type: 'Product' },
        ],
      ),
      node('n2', 'cls-product', 'Product', pos(0, 1), ['getPrice'], [{ name: 'name', type: 'String' }, { name: 'price', type: 'int' }]),
      node('n3', 'cls-slot', 'Slot', pos(1, 1), ['release'], [{ name: 'code', type: 'String' }, { name: 'quantity', type: 'int' }]),
      node('n4', 'cls-transaction', 'Transaction', pos(2, 1), ['isComplete'], [{ name: 'amountPaid', type: 'int' }]),
    ],
    edges: [
      edge('e1', 'rel-vm-product', 'n1', 'n2', 'association'),
      edge('e2', 'rel-vm-slot', 'n1', 'n3', 'composition'),
      edge('e3', 'rel-vm-transaction', 'n1', 'n4', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-vending-payment-srp',
        elementIds: ['cls-vending-machine'],
        category: 'SRP Violation',
        aliases: ['Mixed responsibilities', 'OCP Violation'],
        explanationKeywords: ['payment', 'coin', 'card', 'strategy', 'interface', 'separate', 'dispense'],
        modelAnswer:
          'VendingMachine mixes product dispensing with the details of coin and card payment. Adding a wallet means editing the machine again. Introduce a PaymentMethod interface (CoinPayment, CardPayment) and have the machine ask it to charge; the machine only cares whether payment succeeded.',
        hints: [
          'List the methods that deal with money rather than products.',
          'What would you need to edit to add a mobile-wallet option today?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['PaymentMethod'] },
  }),

  // 114 — Hotel room concrete dependencies
  pack({
    slug: 'dbg-hotel-room-concrete',
    title: 'Hotel Room Types',
    difficulty: 'easy',
    order: 114,
    description: 'Booking is wired directly to each concrete room class.',
    tags: ['hotel', 'ocp', 'dip', 'abstraction'],
    briefing:
      'A hotel chain is adding suites and family rooms next quarter. Each new room type currently means editing the booking flow.',
    requirement:
      'A booking reserves a room for a guest and computes the price. Introducing a new room type should not require changing Booking.',
    nodes: [
      node(
        'n1',
        'cls-booking',
        'Booking',
        pos(1, 0),
        [
          { name: 'reserveSingle', params: [{ name: 'room', type: 'SingleRoom' }] },
          { name: 'reserveDouble', params: [{ name: 'room', type: 'DoubleRoom' }] },
          { name: 'calculatePrice', returnType: 'double' },
        ],
        [
          { name: 'roomType', type: 'String' },
          { name: 'nights', type: 'int' },
        ],
      ),
      node('n2', 'cls-guest', 'Guest', pos(0, 0), ['getName'], [{ name: 'name', type: 'String' }]),
      node('n3', 'cls-single-room', 'SingleRoom', pos(0, 1), ['getRate'], [{ name: 'number', type: 'int' }]),
      node('n4', 'cls-double-room', 'DoubleRoom', pos(2, 1), ['getRate'], [{ name: 'number', type: 'int' }]),
      node('n5', 'cls-invoice', 'Invoice', pos(2, 0), ['total'], [{ name: 'amount', type: 'double' }]),
    ],
    edges: [
      edge('e1', 'rel-booking-guest', 'n1', 'n2', 'association'),
      edge('e2', 'rel-booking-single', 'n1', 'n3', 'dependency'),
      edge('e3', 'rel-booking-double', 'n1', 'n4', 'dependency'),
      edge('e4', 'rel-booking-invoice', 'n1', 'n5', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-hotel-dip',
        elementIds: ['rel-booking-single', 'rel-booking-double'],
        category: 'DIP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['abstraction', 'Room', 'interface', 'concrete', 'depend', 'high-level'],
        modelAnswer:
          'Booking (high-level policy) depends directly on SingleRoom and DoubleRoom. Introduce a Room abstraction that both implement and make Booking depend only on it.',
        hints: [
          'What type does Booking need to know about to price a stay?',
          'Look at the arrows leaving Booking toward the room classes.',
        ],
      },
      {
        id: 'issue-hotel-ocp',
        elementIds: ['cls-booking'],
        category: 'OCP Violation',
        aliases: ['Type switch', 'Not extensible'],
        explanationKeywords: ['new room type', 'reserveSingle', 'reserveDouble', 'modify', 'polymorphism', 'extend'],
        modelAnswer:
          'Booking has one reserve method per room type and a roomType string, so every new type (suite, family) forces edits in Booking. With a Room interface exposing getRate(), Booking has a single reserve(Room) and new types plug in without modification.',
        hints: [
          'How many methods must change when a Suite is introduced?',
          'A single polymorphic call can replace the per-type methods.',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Room'],
      forbidDirectEdges: [
        { from: 'Booking', to: 'SingleRoom' },
        { from: 'Booking', to: 'DoubleRoom' },
      ],
    },
  }),

  // 115 — Quiz extends Question
  pack({
    slug: 'dbg-quiz-extends-question',
    title: 'Quiz Structure',
    difficulty: 'easy',
    order: 115,
    description: 'A quiz is modelled as a kind of question. Does the hierarchy hold up?',
    tags: ['quiz', 'inheritance', 'is-a', 'composition'],
    briefing:
      'An ed-tech startup models its assessment engine. QA reports that quizzes render with an "answer options" panel that makes no sense.',
    requirement:
      'A quiz contains multiple questions; each question may be multiple choice and is scored against a student answer.',
    nodes: [
      node(
        'n1',
        'cls-question',
        'Question',
        pos(1, 0),
        ['getPrompt', 'isCorrect', 'getPoints'],
        [{ name: 'prompt', type: 'String' }, { name: 'points', type: 'int' }],
        'abstract',
      ),
      node('n2', 'cls-mcq', 'MultipleChoiceQuestion', pos(0, 1), ['getOptions'], [{ name: 'options', type: 'List<String>' }]),
      node(
        'n3',
        'cls-quiz',
        'Quiz',
        pos(2, 1),
        ['addQuestion', 'start', 'submit', 'getTotalScore'],
        [{ name: 'questions', type: 'List<Question>' }, { name: 'timeLimit', type: 'int' }],
      ),
      node('n4', 'cls-answer', 'Answer', pos(1, 2), ['getValue'], [{ name: 'value', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'rel-mcq-question', 'n2', 'n1', 'inheritance'),
      edge('e2', 'rel-quiz-question-inherit', 'n3', 'n1', 'inheritance'),
      edge('e3', 'rel-question-answer', 'n1', 'n4', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-quiz-inheritance',
        elementIds: ['rel-quiz-question-inherit', 'cls-quiz'],
        category: 'Incorrect Inheritance',
        aliases: ['Inheritance misuse', 'Composition over inheritance'],
        explanationKeywords: ['is-a', 'has-a', 'composition', 'contains', 'Liskov', 'collection', 'questions'],
        modelAnswer:
          'A Quiz is not a Question; it contains many of them. Inheriting forces Quiz to carry getPrompt/isCorrect/getPoints that make no sense for it and breaks Liskov substitution. Remove the inheritance and model Quiz as an aggregation/composition of Question objects.',
        hints: [
          'Say it aloud: "a Quiz is a Question". Does it hold?',
          'Quiz already holds a List<Question>, so what is the inheritance buying?',
        ],
      },
    ],
    verification: { requireNoEditTo: ['cls-mcq'] },
  }),

  // 116 — Product review logic
  pack({
    slug: 'dbg-product-review-logic',
    title: 'Product Review Concerns',
    difficulty: 'easy',
    order: 116,
    description: 'Product owns review handling and moderation on top of catalog data.',
    tags: ['e-commerce', 'srp', 'reviews'],
    briefing:
      'The storefront team keeps editing Product whenever the trust-and-safety team changes review rules, which causes unrelated catalog bugs.',
    requirement:
      'Products have a name, price and category. Customers leave reviews, which are moderated before appearing and used to compute ratings.',
    nodes: [
      node(
        'n1',
        'cls-product',
        'Product',
        pos(1, 0),
        [
          'getPrice',
          'applyDiscount',
          'addReview',
          'moderateReview',
          'flagProfanity',
          'getAverageRating',
        ],
        [
          { name: 'sku', type: 'String' },
          { name: 'price', type: 'double' },
          { name: 'reviews', type: 'List<Review>' },
          { name: 'bannedWords', type: 'List<String>' },
        ],
      ),
      node('n2', 'cls-review', 'Review', pos(0, 1), ['getRating'], [{ name: 'text', type: 'String' }, { name: 'rating', type: 'int' }]),
      node('n3', 'cls-customer', 'Customer', pos(1, 1), ['getName'], [{ name: 'name', type: 'String' }]),
      node('n4', 'cls-category', 'Category', pos(2, 1), ['getName'], [{ name: 'name', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'rel-product-review', 'n1', 'n2', 'composition'),
      edge('e2', 'rel-product-category', 'n1', 'n4', 'association'),
      edge('e3', 'rel-review-customer', 'n2', 'n3', 'association'),
    ],
    expectedIssues: [
      {
        id: 'issue-product-review-srp',
        elementIds: ['cls-product'],
        category: 'SRP Violation',
        aliases: ['Mixed responsibilities'],
        explanationKeywords: ['review', 'moderation', 'catalog', 'ReviewService', 'responsibility', 'profanity'],
        modelAnswer:
          'Product mixes catalog/pricing concerns with review submission and moderation. Moderation rules (banned words, flagging) change independently of product data. Move review handling into a ReviewService / ReviewModerator and keep Product focused on product facts.',
        hints: [
          'Which Product methods would the trust-and-safety team want to change?',
          'Does a bannedWords list belong with a SKU and a price?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['ReviewModerator'] },
  }),

  // 117 — Delivery tracker
  pack({
    slug: 'dbg-delivery-tracker-srp',
    title: 'Delivery Tracker Duties',
    difficulty: 'easy',
    order: 117,
    description: 'One tracker reads GPS, texts customers, persists data, and calls partner APIs.',
    tags: ['delivery', 'srp', 'dip', 'notifications'],
    briefing:
      'The logistics team swapped their SMS provider last month and broke location updates. The post-mortem points at one class.',
    requirement:
      'Track a driver position for each delivery, notify customers on milestones, store location history, and sync status to partner systems.',
    nodes: [
      node(
        'n1',
        'cls-delivery-tracker',
        'DeliveryTracker',
        pos(1, 0),
        [
          'readGpsFix',
          'updateLocation',
          'sendSms',
          'saveToDatabase',
          'pushToPartnerApi',
          'markDelivered',
        ],
        [
          { name: 'dbConnection', type: 'Connection' },
          { name: 'apiKey', type: 'String' },
          { name: 'smsClient', type: 'TwilioClient' },
        ],
      ),
      node('n2', 'cls-delivery', 'Delivery', pos(0, 1), ['getStatus'], [{ name: 'orderId', type: 'String' }, { name: 'status', type: 'String' }]),
      node('n3', 'cls-driver', 'Driver', pos(1, 1), ['getLocation'], [{ name: 'driverId', type: 'String' }]),
      node('n4', 'cls-twilio-client', 'TwilioClient', pos(2, 0), ['sendMessage'], [{ name: 'accountSid', type: 'String' }]),
      node('n5', 'cls-location-record', 'LocationRecord', pos(2, 1), ['getCoordinates'], [{ name: 'lat', type: 'double' }, { name: 'lng', type: 'double' }]),
    ],
    edges: [
      edge('e1', 'rel-tracker-delivery', 'n1', 'n2', 'association'),
      edge('e2', 'rel-tracker-driver', 'n1', 'n3', 'association'),
      edge('e3', 'rel-tracker-twilio', 'n1', 'n4', 'dependency'),
      edge('e4', 'rel-tracker-location', 'n1', 'n5', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-tracker-srp',
        elementIds: ['cls-delivery-tracker'],
        category: 'SRP Violation',
        aliases: ['God Object', 'Too many responsibilities'],
        explanationKeywords: ['GPS', 'SMS', 'database', 'API', 'responsibilities', 'extract', 'separate'],
        modelAnswer:
          'DeliveryTracker reads GPS, sends SMS, persists to a database and pushes to partner APIs. Four reasons to change in one class. Split into LocationService, CustomerNotifier, LocationRepository and PartnerSyncClient; the tracker only coordinates them.',
        hints: [
          'Highlight each method and label it: location, notification, storage, integration.',
          'Which of those would change if the cloud DB were replaced?',
        ],
      },
      {
        id: 'issue-tracker-dip',
        elementIds: ['rel-tracker-twilio'],
        category: 'DIP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['TwilioClient', 'concrete', 'Notifier', 'interface', 'vendor', 'abstraction'],
        modelAnswer:
          'The tracker depends on the concrete TwilioClient, which is exactly what made the SMS provider swap break location updates. Depend on a Notifier / SmsGateway interface and inject the Twilio implementation.',
        hints: [
          'What happens to the tracker if the SMS vendor changes?',
          'Is TwilioClient a policy or a detail?',
        ],
      },
    ],
    verification: { forbidDirectEdges: [{ from: 'DeliveryTracker', to: 'TwilioClient' }] },
  }),

  // 118 — Chat without Message type
  pack({
    slug: 'dbg-chat-no-message-type',
    title: 'Chat Message Kinds',
    difficulty: 'easy',
    order: 118,
    description: 'Chat grows a new send method for every kind of content.',
    tags: ['chat', 'ocp', 'polymorphism'],
    briefing:
      'The messaging team shipped voice notes and stickers last sprint. Each launch touched Chat and caused regressions in text delivery.',
    requirement:
      'Users send messages of different kinds (text, image, video, and more later) in a conversation. Adding a kind must not modify Chat.',
    nodes: [
      node(
        'n1',
        'cls-chat',
        'Chat',
        pos(1, 0),
        [
          { name: 'sendText', params: [{ name: 'text', type: 'String' }] },
          { name: 'sendImage', params: [{ name: 'file', type: 'ImageFile' }] },
          { name: 'sendVideo', params: [{ name: 'file', type: 'VideoFile' }] },
          'getHistory',
        ],
        [{ name: 'participants', type: 'List<User>' }],
      ),
      node('n2', 'cls-user', 'User', pos(0, 1), ['getName'], [{ name: 'name', type: 'String' }]),
      node('n3', 'cls-image-file', 'ImageFile', pos(1, 1), ['getWidth'], [{ name: 'path', type: 'String' }]),
      node('n4', 'cls-video-file', 'VideoFile', pos(2, 1), ['getDuration'], [{ name: 'path', type: 'String' }]),
      node('n5', 'cls-transport', 'Transport', pos(2, 0), ['deliver'], [{ name: 'endpoint', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'rel-chat-user', 'n1', 'n2', 'aggregation'),
      edge('e2', 'rel-chat-image', 'n1', 'n3', 'dependency'),
      edge('e3', 'rel-chat-video', 'n1', 'n4', 'dependency'),
      edge('e4', 'rel-chat-transport', 'n1', 'n5', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-chat-ocp',
        elementIds: ['cls-chat'],
        category: 'OCP Violation',
        aliases: ['Missing abstraction', 'Pattern Misuse'],
        explanationKeywords: ['Message', 'abstraction', 'polymorphism', 'sendText', 'sendImage', 'sendVideo', 'new type', 'modify'],
        modelAnswer:
          'There is no Message abstraction, so Chat exposes one send method per content type and must be modified for each new kind. Introduce a Message interface/abstract class with TextMessage, ImageMessage, VideoMessage subclasses (each knowing how to serialise itself) and give Chat a single send(Message).',
        hints: [
          'What would you edit in Chat to support voice notes?',
          'What concept is shared by text, images and videos in a conversation?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['Message'] },
  }),

  // 119 — Subscription plan god
  pack({
    slug: 'dbg-subscription-god-plan',
    title: 'Subscription Plan Scope',
    difficulty: 'easy',
    order: 119,
    description: 'The plan entity does pricing, payment retries, and feature gating.',
    tags: ['saas', 'god-object', 'billing'],
    briefing:
      'A SaaS company\'s billing rewrite stalled: finance, support and product all need changes in SubscriptionPlan and block each other.',
    requirement:
      'A plan defines a price and the features it includes. Billing charges customers on a cycle, failed payments trigger dunning, and feature access depends on the active plan.',
    nodes: [
      node(
        'n1',
        'cls-subscription-plan',
        'SubscriptionPlan',
        pos(1, 0),
        [
          'getPrice',
          'generateInvoice',
          'chargeCustomer',
          'retryFailedPayment',
          'sendDunningEmail',
          'suspendAccount',
          'hasFeature',
          'enableFeature',
        ],
        [
          { name: 'name', type: 'String' },
          { name: 'monthlyPrice', type: 'double' },
          { name: 'retryCount', type: 'int' },
          { name: 'features', type: 'Set<String>' },
        ],
      ),
      node('n2', 'cls-customer', 'Customer', pos(0, 1), ['getEmail'], [{ name: 'email', type: 'String' }]),
      node('n3', 'cls-invoice', 'Invoice', pos(1, 1), ['markPaid'], [{ name: 'amount', type: 'double' }]),
      node('n4', 'cls-feature', 'Feature', pos(2, 1), ['getKey'], [{ name: 'key', type: 'String' }]),
      node('n5', 'cls-payment-gateway', 'PaymentGateway', pos(2, 0), ['charge'], [{ name: 'merchantId', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'rel-plan-customer', 'n1', 'n2', 'association'),
      edge('e2', 'rel-plan-invoice', 'n1', 'n3', 'dependency'),
      edge('e3', 'rel-plan-feature', 'n1', 'n4', 'aggregation'),
      edge('e4', 'rel-plan-gateway', 'n1', 'n5', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-plan-god',
        elementIds: ['cls-subscription-plan'],
        category: 'God Object',
        aliases: ['SRP Violation', 'Too many responsibilities'],
        explanationKeywords: ['billing', 'dunning', 'feature', 'entitlement', 'plan', 'data', 'split', 'responsibilities'],
        modelAnswer:
          'SubscriptionPlan should describe a plan (name, price, included features) but also bills customers, runs dunning and gates feature access. Split into BillingService, DunningService and FeatureEntitlement; keep the plan as simple data.',
        hints: [
          'Which methods describe the plan, and which perform work on a customer?',
          'Would finance and support teams expect to edit the same file?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['BillingService'] },
  }),

  // 120 — Warehouse storage
  pack({
    slug: 'dbg-warehouse-no-location',
    title: 'Warehouse Storage Slots',
    difficulty: 'easy',
    order: 120,
    description: 'Warehouse tracks each storage type separately with no shared abstraction.',
    tags: ['warehouse', 'ocp', 'abstraction'],
    briefing:
      'Operations wants to add cold-storage racks and floor zones. The developer notes that every location type means rewriting placement logic.',
    requirement:
      'The warehouse stores items in locations of different kinds and finds a free one for incoming items. New location kinds should plug in without changing placement code.',
    nodes: [
      node(
        'n1',
        'cls-warehouse',
        'Warehouse',
        pos(1, 0),
        [
          'addShelf',
          'addBin',
          'addPallet',
          'findFreeShelf',
          'findFreeBin',
          'findFreePallet',
          'storeItem',
        ],
        [
          { name: 'shelves', type: 'List<Shelf>' },
          { name: 'bins', type: 'List<Bin>' },
          { name: 'pallets', type: 'List<Pallet>' },
        ],
      ),
      node('n2', 'cls-shelf', 'Shelf', pos(0, 1), ['hasSpace'], [{ name: 'level', type: 'int' }]),
      node('n3', 'cls-bin', 'Bin', pos(1, 1), ['hasSpace'], [{ name: 'label', type: 'String' }]),
      node('n4', 'cls-pallet', 'Pallet', pos(2, 1), ['hasSpace'], [{ name: 'maxWeight', type: 'double' }]),
      node('n5', 'cls-item', 'Item', pos(2, 0), ['getWeight'], [{ name: 'sku', type: 'String' }]),
    ],
    edges: [
      edge('e1', 'rel-wh-shelf', 'n1', 'n2', 'composition'),
      edge('e2', 'rel-wh-bin', 'n1', 'n3', 'composition'),
      edge('e3', 'rel-wh-pallet', 'n1', 'n4', 'composition'),
      edge('e4', 'rel-wh-item', 'n1', 'n5', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'issue-warehouse-ocp',
        elementIds: ['cls-warehouse', 'rel-wh-shelf', 'rel-wh-bin', 'rel-wh-pallet'],
        category: 'OCP Violation',
        aliases: ['Missing abstraction', 'DIP Violation'],
        explanationKeywords: ['StorageLocation', 'abstraction', 'interface', 'hasSpace', 'Shelf', 'Bin', 'Pallet', 'polymorphism', 'duplicate'],
        modelAnswer:
          'Shelf, Bin and Pallet all expose hasSpace() but share no StorageLocation abstraction, so Warehouse keeps three lists and three find/add methods. Each new location type forces more edits. Introduce StorageLocation, make the three types implement it, and let Warehouse hold List<StorageLocation> with one findFreeLocation().',
        hints: [
          'Notice the repeated add/find methods that differ only by type.',
          'What do Shelf, Bin and Pallet have in common that Warehouse cares about?',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['StorageLocation'],
      forbidDirectEdges: [
        { from: 'Warehouse', to: 'Shelf' },
        { from: 'Warehouse', to: 'Bin' },
        { from: 'Warehouse', to: 'Pallet' },
      ],
    },
  }),

  // 121 — GradeBook SRP
  pack({
    slug: 'dbg-gradebook-srp',
    title: 'GradeBook Responsibilities',
    difficulty: 'easy',
    order: 121,
    description: 'GradeBook stores scores, builds transcripts, emails parents and prints reports.',
    tags: ['education', 'srp', 'reporting'],
    briefing:
      'The registrar wants PDF transcripts and the communications team wants SMS alerts. Both asks require edits inside GradeBook, risking grade calculations.',
    requirement:
      'Teachers record scores per course; the system computes averages, generates transcripts, and delivers reports to parents. Report format and delivery channel change independently of scoring.',
    nodes: [
      node(
        'n1',
        'cls-gradebook',
        'GradeBook',
        pos(1, 0),
        [
          'recordScore',
          'calculateAverage',
          'buildTranscript',
          'formatTranscriptAsText',
          'emailReportToParent',
          'printReport',
        ],
        [
          { name: 'scores', type: 'Map<Student,List<Score>>' },
          { name: 'smtpHost', type: 'String' },
          { name: 'printerName', type: 'String' },
        ],
      ),
      node('n2', 'cls-student', 'Student', pos(0, 1), ['getParentEmail'], [{ name: 'studentId', type: 'String' }]),
      node('n3', 'cls-course', 'Course', pos(1, 1), ['getCredits'], [{ name: 'code', type: 'String' }]),
      node('n4', 'cls-score', 'Score', pos(2, 1), ['getValue'], [{ name: 'value', type: 'double' }]),
    ],
    edges: [
      edge('e1', 'rel-gb-student', 'n1', 'n2', 'association'),
      edge('e2', 'rel-gb-course', 'n1', 'n3', 'association'),
      edge('e3', 'rel-gb-score', 'n1', 'n4', 'composition'),
    ],
    expectedIssues: [
      {
        id: 'issue-gradebook-srp',
        elementIds: ['cls-gradebook'],
        category: 'SRP Violation',
        aliases: ['God Object', 'Mixed responsibilities'],
        explanationKeywords: ['scores', 'transcript', 'email', 'print', 'report', 'delivery', 'format', 'separate'],
        modelAnswer:
          'GradeBook should manage scores and averages. Transcript formatting, email delivery and printing are separate reasons to change. Extract TranscriptGenerator and a ReportDelivery abstraction (EmailDelivery, PrintDelivery) so new formats or channels do not touch grade calculation.',
        hints: [
          'Which methods depend on SMTP or a printer rather than scores?',
          'Would changing the transcript format ever justify touching calculateAverage?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['TranscriptGenerator'] },
  }),
]
