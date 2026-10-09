/**
 * Design Studio "Debug and Fix" — Easy C (orders 122–133).
 * Single-flaw scenarios on small (4–5 node) diagrams: inheritance direction, circular
 * references, god objects, and misapplied GoF patterns.
 */
import { pack, node, edge, pos, type DebuggerPackSeed, type ExpectedIssueSeed } from '../seed-studio-debugger-lib'

type P = { name: string; type: string }

/** Compact method spec with a return type and optional params. */
function m(name: string, returnType = 'void', params: P[] = []) {
  return { name, returnType, params }
}

/** Static method spec. */
function sm(name: string, returnType: string, params: P[] = []) {
  return { name, returnType, params, isStatic: true }
}

function issue(
  id: string,
  elementIds: string[],
  category: ExpectedIssueSeed['category'],
  aliases: string[],
  explanationKeywords: string[],
  modelAnswer: string,
  hints: [string, string, string],
): ExpectedIssueSeed {
  return { id, elementIds, category, aliases, explanationKeywords, modelAnswer, hints }
}

export const EASY_C: DebuggerPackSeed[] = [
  // ─────────────────────────────────────────────────────────────── 122
  pack({
    slug: 'dbg-user-extends-admin',
    title: 'Admin Role Direction',
    difficulty: 'easy',
    order: 122,
    description: 'A role hierarchy in an internal back-office tool has its inheritance arrow pointing the wrong way.',
    tags: ['inheritance', 'liskov', 'roles', 'easy'],
    briefing:
      'You are reviewing the access-control model of an internal back-office tool. Admin accounts can grant permissions, deactivate accounts, and read the audit log. Regular users can log in and edit their own profile. AuthService authenticates any account and AuditLog records privileged actions.',
    requirement:
      'Review the class diagram and identify what is wrong with how the account roles are related. Explain why it is a problem and how you would correct the model.',
    nodes: [
      node('n-admin', 'el-admin', 'Admin', pos(0, 0), [
        m('grantPermission', 'void', [{ name: 'target', type: 'User' }, { name: 'permission', type: 'String' }]),
        m('deactivateAccount', 'void', [{ name: 'target', type: 'User' }]),
        m('viewAuditLog', 'List<AuditEntry>'),
      ], [{ name: 'adminLevel', type: 'int' }]),
      node('n-user', 'el-user', 'User', pos(1, 0), [
        m('login', 'boolean', [{ name: 'password', type: 'String' }]),
        m('updateProfile', 'void', [{ name: 'displayName', type: 'String' }]),
      ], [
        { name: 'id', type: 'String' },
        { name: 'email', type: 'String' },
      ]),
      node('n-auth', 'el-auth', 'AuthService', pos(2, 0), [
        m('authenticate', 'Session', [{ name: 'user', type: 'User' }, { name: 'password', type: 'String' }]),
      ]),
      node('n-audit', 'el-audit', 'AuditLog', pos(0, 1), [
        m('record', 'void', [{ name: 'actor', type: 'User' }, { name: 'action', type: 'String' }]),
      ], [{ name: 'entries', type: 'List<AuditEntry>' }]),
    ],
    edges: [
      edge('e-user-admin', 'ed-user-admin', 'n-user', 'n-admin', 'inheritance'),
      edge('e-auth-user', 'ed-auth-user', 'n-auth', 'n-user', 'dependency'),
      edge('e-admin-audit', 'ed-admin-audit', 'n-admin', 'n-audit', 'dependency'),
    ],
    expectedIssues: [
      issue(
        'iss-user-extends-admin-1',
        ['ed-user-admin'],
        'Incorrect Inheritance',
        ['Liskov Substitution Violation'],
        ['user', 'admin', 'inherits', 'direction', 'privileges', 'subclass', 'reverse', 'substitute'],
        'User extends Admin, so every ordinary user inherits grantPermission, deactivateAccount, and viewAuditLog. The hierarchy is inverted: Admin should extend User (an Admin is-a User), and AuthService, which accepts a User, would then work for both without handing admin powers to everyone.',
        [
          'Read the inheritance arrow slowly. Which class is the subclass, and which is the superclass?',
          'Ask which class is the more specific one. Would a regular User be allowed to call everything Admin declares?',
          'Inheritance means "is-a". An Admin is a User, but a User is not an Admin, so the arrow needs to be flipped.',
        ],
      ),
    ],
    verification: { mustIntroduceElementNames: [], requireNoEditTo: ['AuthService', 'AuditLog'] },
  }),

  // ─────────────────────────────────────────────────────────────── 123
  pack({
    slug: 'dbg-orderitem-holds-order',
    title: 'OrderItem Back-Reference',
    difficulty: 'easy',
    order: 123,
    description: 'Line items reach back into the order that owns them, creating a tight two-way dependency.',
    tags: ['circular-dependency', 'coupling', 'e-commerce', 'easy'],
    briefing:
      'An e-commerce checkout models an Order that owns many OrderItems. Each OrderItem refers to a Product and a quantity. Pricing a line should depend only on the product price and the quantity. Customers can apply a coupon at order level.',
    requirement:
      'Review the diagram and find the structural problem between Order and OrderItem. Explain the consequences and how you would decouple them.',
    nodes: [
      node('n-order', 'el-order', 'Order', pos(0, 0), [
        m('addItem', 'void', [{ name: 'item', type: 'OrderItem' }]),
        m('total', 'Money'),
        m('applyCoupon', 'void', [{ name: 'code', type: 'String' }]),
      ], [
        { name: 'items', type: 'List<OrderItem>' },
        { name: 'couponCode', type: 'String' },
      ]),
      node('n-item', 'el-item', 'OrderItem', pos(1, 0), [
        m('lineTotal', 'Money'),
        m('discountedTotal', 'Money'),
      ], [
        { name: 'order', type: 'Order' },
        { name: 'quantity', type: 'int' },
      ]),
      node('n-product', 'el-product', 'Product', pos(2, 0), [
        m('getPrice', 'Money'),
      ], [
        { name: 'sku', type: 'String' },
        { name: 'price', type: 'Money' },
      ]),
      node('n-customer', 'el-customer', 'Customer', pos(0, 1), [
        m('placeOrder', 'Order'),
      ], [{ name: 'name', type: 'String' }]),
    ],
    edges: [
      edge('e-order-item', 'ed-order-item', 'n-order', 'n-item', 'composition'),
      edge('e-item-order', 'ed-item-order', 'n-item', 'n-order', 'association'),
      edge('e-item-product', 'ed-item-product', 'n-item', 'n-product', 'association'),
      edge('e-customer-order', 'ed-customer-order', 'n-customer', 'n-order', 'association'),
    ],
    expectedIssues: [
      issue(
        'iss-orderitem-order-cycle-1',
        ['ed-item-order'],
        'Circular Dependency',
        ['Tight Coupling'],
        ['orderitem', 'order', 'circular', 'back-reference', 'cycle', 'bidirectional', 'discount', 'coupling'],
        'Order owns OrderItems while each OrderItem holds a reference back to Order (discountedTotal needs order state). This bidirectional cycle means neither can be built, tested, or reasoned about alone. Remove the back-reference: pass the needed discount or coupon value into the item as a parameter, or let Order apply discounts when it sums the lines.',
        [
          'Follow the arrows between Order and OrderItem. Can you leave one and come back to where you started?',
          'Why would OrderItem need to know about its Order just to price one line? Look at the attributes and discountedTotal.',
          'A parent owning children is fine, but children that call back into the parent form a cycle. Pass the data in rather than holding the parent.',
        ],
      ),
    ],
    verification: { forbidDirectEdges: [{ from: 'OrderItem', to: 'Order' }] },
  }),

  // ─────────────────────────────────────────────────────────────── 124
  pack({
    slug: 'dbg-blog-post-god',
    title: 'Blog Post Surface Area',
    difficulty: 'easy',
    order: 124,
    description: 'A BlogPost entity renders itself, builds SEO tags, moderates comments, shares, and tracks analytics.',
    tags: ['god-object', 'srp', 'cms', 'easy'],
    briefing:
      'A content platform lets authors publish blog posts that readers can comment on. The product team keeps requesting changes to SEO output, comment moderation rules, social sharing, and analytics independently of each other. Engineers complain that every one of those changes lands in the same file.',
    requirement:
      'Review the diagram and identify the class that has accumulated too much responsibility. Explain why it hurts and how you would restructure it.',
    nodes: [
      node('n-post', 'el-post', 'BlogPost', pos(1, 0), [
        m('render', 'String'),
        m('generateSeoTags', 'Map<String,String>'),
        m('moderateComments', 'void'),
        m('shareToSocial', 'void', [{ name: 'network', type: 'String' }]),
        m('trackPageView', 'void', [{ name: 'visitorId', type: 'String' }]),
      ], [
        { name: 'title', type: 'String' },
        { name: 'body', type: 'String' },
        { name: 'viewCount', type: 'long' },
      ]),
      node('n-author', 'el-author', 'Author', pos(0, 0), [
        m('publish', 'void', [{ name: 'post', type: 'BlogPost' }]),
      ], [{ name: 'name', type: 'String' }]),
      node('n-comment', 'el-comment', 'Comment', pos(2, 0), [
        m('approve'),
        m('flag'),
      ], [
        { name: 'text', type: 'String' },
        { name: 'status', type: 'String' },
      ]),
      node('n-tag', 'el-tag', 'Tag', pos(1, 1), [], [{ name: 'label', type: 'String' }]),
    ],
    edges: [
      edge('e-author-post', 'ed-author-post', 'n-author', 'n-post', 'association'),
      edge('e-post-comment', 'ed-post-comment', 'n-post', 'n-comment', 'composition'),
      edge('e-post-tag', 'ed-post-tag', 'n-post', 'n-tag', 'aggregation'),
    ],
    expectedIssues: [
      issue(
        'iss-blog-post-god-1',
        ['el-post'],
        'God Object',
        ['SRP Violation'],
        ['blogpost', 'post', 'responsibilities', 'seo', 'moderation', 'sharing', 'analytics', 'rendering', 'split', 'extract'],
        'BlogPost is both a content entity and the home for rendering, SEO generation, comment moderation, social sharing, and analytics. Each changes for a different reason. Keep BlogPost as the data model and extract PostRenderer, SeoTagBuilder, CommentModerator, SharingService, and AnalyticsTracker.',
        [
          'Count the reasons BlogPost might need to change. Who asks for each change: marketing, editors, community managers, analysts?',
          'Which of the methods describe what a post is, and which describe things done to or with a post?',
          'Leave BlogPost with its data, then give each remaining capability its own small collaborator.',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 125
  pack({
    slug: 'dbg-event-ticket-god',
    title: 'Event Ticket Duties',
    difficulty: 'easy',
    order: 125,
    description: 'EventTicket reserves seats, takes payment, sends email, and produces PDFs on its own.',
    tags: ['god-object', 'srp', 'ticketing', 'easy'],
    briefing:
      'A ticketing system sells seats for live events. Product wants to add a new payment provider, a redesigned confirmation email, and a branded PDF layout this quarter. Each of those teams currently edits the same EventTicket class and keeps colliding in code review.',
    requirement:
      'Identify the design problem in EventTicket. Describe which responsibilities should leave the class and where they should go.',
    nodes: [
      node('n-ticket', 'el-ticket', 'EventTicket', pos(1, 0), [
        m('reserveSeat', 'boolean', [{ name: 'seatId', type: 'String' }]),
        m('processPayment', 'boolean', [{ name: 'card', type: 'CardDetails' }]),
        m('sendConfirmationEmail', 'void'),
        m('generatePdf', 'byte[]'),
      ], [
        { name: 'ticketId', type: 'String' },
        { name: 'price', type: 'Money' },
        { name: 'status', type: 'String' },
      ]),
      node('n-event', 'el-event', 'Event', pos(0, 0), [
        m('getVenue', 'String'),
      ], [
        { name: 'name', type: 'String' },
        { name: 'startsAt', type: 'DateTime' },
      ]),
      node('n-attendee', 'el-attendee', 'Attendee', pos(2, 0), [], [
        { name: 'name', type: 'String' },
        { name: 'email', type: 'String' },
      ]),
      node('n-seat', 'el-seat', 'Seat', pos(1, 1), [
        m('isAvailable', 'boolean'),
      ], [
        { name: 'row', type: 'String' },
        { name: 'number', type: 'int' },
      ]),
    ],
    edges: [
      edge('e-ticket-event', 'ed-ticket-event', 'n-ticket', 'n-event', 'association'),
      edge('e-ticket-attendee', 'ed-ticket-attendee', 'n-ticket', 'n-attendee', 'association'),
      edge('e-ticket-seat', 'ed-ticket-seat', 'n-ticket', 'n-seat', 'association'),
    ],
    expectedIssues: [
      issue(
        'iss-event-ticket-god-1',
        ['el-ticket'],
        'God Object',
        ['SRP Violation'],
        ['eventticket', 'ticket', 'seat', 'payment', 'email', 'pdf', 'responsibilities', 'extract', 'services'],
        'EventTicket owns seat reservation, payment, email delivery, and PDF rendering. Four unrelated reasons to change live in one class. Keep it as the ticket record and move the behaviours into SeatReservationService, PaymentService, TicketMailer, and TicketPdfGenerator, coordinated by a booking use case.',
        [
          'List every different kind of change request mentioned in the briefing. How many files would they touch?',
          'Which of these methods talk to external systems: payment gateway, mail server, a PDF library?',
          'A ticket should know its own data. Who should decide to charge a card or send an email on its behalf?',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 126
  pack({
    slug: 'dbg-loan-god-app',
    title: 'Loan Application Scope',
    difficulty: 'easy',
    order: 126,
    description: 'LoanApplication decides eligibility, computes interest, handles documents, and approves itself.',
    tags: ['god-object', 'srp', 'fintech', 'easy'],
    briefing:
      'A lending platform processes personal loan applications. Credit policy changes quarterly, interest models differ by product, compliance regularly updates the required documents, and approval rules are owned by risk. All of this logic currently lives in LoanApplication.',
    requirement:
      'Find the class carrying too many responsibilities, explain the risk of leaving it, and propose a split.',
    nodes: [
      node('n-loan', 'el-loan', 'LoanApplication', pos(1, 0), [
        m('checkEligibility', 'boolean'),
        m('calculateInterest', 'Money'),
        m('uploadDocument', 'void', [{ name: 'doc', type: 'Document' }]),
        m('approve', 'void'),
        m('reject', 'void', [{ name: 'reason', type: 'String' }]),
      ], [
        { name: 'amount', type: 'Money' },
        { name: 'termMonths', type: 'int' },
        { name: 'status', type: 'String' },
      ]),
      node('n-applicant', 'el-applicant', 'Applicant', pos(0, 0), [], [
        { name: 'name', type: 'String' },
        { name: 'creditScore', type: 'int' },
        { name: 'income', type: 'Money' },
      ]),
      node('n-product', 'el-loan-product', 'LoanProduct', pos(2, 0), [], [
        { name: 'name', type: 'String' },
        { name: 'baseRate', type: 'double' },
      ]),
      node('n-doc', 'el-document', 'Document', pos(1, 1), [], [
        { name: 'type', type: 'String' },
        { name: 'url', type: 'String' },
      ]),
    ],
    edges: [
      edge('e-loan-applicant', 'ed-loan-applicant', 'n-loan', 'n-applicant', 'association'),
      edge('e-loan-product', 'ed-loan-product', 'n-loan', 'n-product', 'association'),
      edge('e-loan-doc', 'ed-loan-doc', 'n-loan', 'n-doc', 'composition'),
    ],
    expectedIssues: [
      issue(
        'iss-loan-application-god-1',
        ['el-loan'],
        'God Object',
        ['SRP Violation'],
        ['loanapplication', 'loan', 'eligibility', 'interest', 'documents', 'approval', 'responsibilities', 'policy', 'extract'],
        'LoanApplication mixes the application record with eligibility rules, interest calculation, document handling, and approval workflow. Credit, pricing, compliance, and risk teams each change it for different reasons. Extract EligibilityPolicy, InterestCalculator, DocumentService, and ApprovalWorkflow; leave LoanApplication as the state holder.',
        [
          'Which teams in the briefing would want to change this class independently?',
          'calculateInterest and checkEligibility rely on rules that change quarterly. Should an application record own those rules?',
          'Look for methods that describe a process or policy rather than data about the application. Those are candidates to extract.',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 127
  pack({
    slug: 'dbg-auction-god',
    title: 'Auction Control Center',
    difficulty: 'easy',
    order: 127,
    description: 'Auction accepts bids, runs its own timer, charges the winner, and notifies participants.',
    tags: ['god-object', 'srp', 'marketplace', 'easy'],
    briefing:
      'An online marketplace runs timed auctions. Bidders place bids until the clock expires, then the winner is charged and everyone is told the outcome. Operations wants to swap in a distributed scheduler, billing wants a new payment provider, and growth wants push notifications.',
    requirement:
      'Diagnose the main design problem in this diagram and describe how you would restructure the classes involved.',
    nodes: [
      node('n-auction', 'el-auction', 'Auction', pos(1, 0), [
        m('placeBid', 'boolean', [{ name: 'bidder', type: 'Bidder' }, { name: 'amount', type: 'Money' }]),
        m('startTimer', 'void', [{ name: 'durationSec', type: 'int' }]),
        m('chargeWinner', 'void'),
        m('notifyBidders', 'void', [{ name: 'message', type: 'String' }]),
      ], [
        { name: 'highestBid', type: 'Bid' },
        { name: 'endsAt', type: 'DateTime' },
      ]),
      node('n-bid', 'el-bid', 'Bid', pos(2, 0), [], [
        { name: 'amount', type: 'Money' },
        { name: 'placedAt', type: 'DateTime' },
      ]),
      node('n-item', 'el-auction-item', 'AuctionItem', pos(0, 0), [], [
        { name: 'title', type: 'String' },
        { name: 'reservePrice', type: 'Money' },
      ]),
      node('n-bidder', 'el-bidder', 'Bidder', pos(1, 1), [], [
        { name: 'name', type: 'String' },
        { name: 'email', type: 'String' },
      ]),
    ],
    edges: [
      edge('e-auction-bid', 'ed-auction-bid', 'n-auction', 'n-bid', 'composition'),
      edge('e-auction-item', 'ed-auction-item', 'n-auction', 'n-item', 'association'),
      edge('e-bid-bidder', 'ed-bid-bidder', 'n-bid', 'n-bidder', 'association'),
    ],
    expectedIssues: [
      issue(
        'iss-auction-god-1',
        ['el-auction'],
        'God Object',
        ['SRP Violation'],
        ['auction', 'bids', 'timer', 'payment', 'notify', 'responsibilities', 'scheduler', 'extract', 'split'],
        'Auction handles bid rules, timing, payment, and notification. Each one depends on different infrastructure (scheduler, payment provider, messaging) and changes at its own pace. Keep bid acceptance in Auction; extract AuctionScheduler, PaymentService, and a notifier (or domain events) that react when the auction closes.',
        [
          'Which of the four duties are about auction rules, and which are infrastructure concerns?',
          'The briefing names three independent upgrade paths. How many of them would require editing Auction?',
          'Should an auction know how a payment is charged or how a push notification is delivered?',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 128
  pack({
    slug: 'dbg-article-publish-god',
    title: 'Article Publishing Path',
    difficulty: 'easy',
    order: 128,
    description: 'Article drafts, optimises SEO, resizes images, and posts to social networks in one class.',
    tags: ['god-object', 'srp', 'publishing', 'easy'],
    briefing:
      'A newsroom CMS lets editors draft articles and publish them. Publishing involves search optimisation, preparing hero images at several sizes, and cross-posting to social channels. The SEO and media teams each ship on their own cadence but both must edit Article to do so.',
    requirement:
      'Look at the Article class and decide whether its responsibilities are well placed. Explain what is wrong and what you would do about it.',
    nodes: [
      node('n-article', 'el-article', 'Article', pos(1, 0), [
        m('saveDraft', 'void', [{ name: 'content', type: 'String' }]),
        m('optimizeSeo', 'void'),
        m('resizeImages', 'void', [{ name: 'widths', type: 'int[]' }]),
        m('postToSocial', 'void', [{ name: 'network', type: 'String' }]),
      ], [
        { name: 'headline', type: 'String' },
        { name: 'content', type: 'String' },
        { name: 'status', type: 'String' },
      ]),
      node('n-writer', 'el-writer', 'Writer', pos(0, 0), [
        m('submit', 'void', [{ name: 'article', type: 'Article' }]),
      ], [{ name: 'byline', type: 'String' }]),
      node('n-image', 'el-image', 'Image', pos(2, 0), [], [
        { name: 'url', type: 'String' },
        { name: 'width', type: 'int' },
      ]),
      node('n-editor', 'el-editor', 'Editor', pos(1, 1), [
        m('review', 'boolean', [{ name: 'article', type: 'Article' }]),
      ]),
    ],
    edges: [
      edge('e-writer-article', 'ed-writer-article', 'n-writer', 'n-article', 'association'),
      edge('e-article-image', 'ed-article-image', 'n-article', 'n-image', 'composition'),
      edge('e-editor-article', 'ed-editor-article', 'n-editor', 'n-article', 'dependency'),
    ],
    expectedIssues: [
      issue(
        'iss-article-publish-god-1',
        ['el-article'],
        'God Object',
        ['SRP Violation'],
        ['article', 'draft', 'seo', 'image', 'resize', 'social', 'responsibilities', 'publisher', 'extract', 'single responsibility'],
        'Article combines draft storage with SEO optimisation, image processing, and social posting. Teams that own those concerns must all modify Article, so unrelated changes collide. Keep Article as the content model and extract SeoOptimizer, ImageProcessor, and SocialPublisher, orchestrated by a PublishingService.',
        [
          'Which methods are about the article as content, and which are steps in publishing it?',
          'The SEO team and the media team ship independently. Where does each have to make changes today?',
          'Try describing Article in one sentence without using the word "and". If you cannot, it is doing too much.',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 129
  pack({
    slug: 'dbg-factory-sms-email',
    title: 'Notification Factory Mix-up',
    difficulty: 'easy',
    order: 129,
    description: 'SmsNotifierFactory is wired to construct an EmailNotifier, leaving SmsNotifier unused.',
    tags: ['factory', 'pattern-misuse', 'notifications', 'easy'],
    briefing:
      'A notification module uses the Factory pattern so that NotificationService can request a Notifier without knowing which concrete class it gets. SmsNotifierFactory is supposed to create SMS senders for OTP delivery. In staging, users configured for SMS keep receiving emails instead.',
    requirement:
      'Study the diagram and find where the factory pattern has been implemented incorrectly. Explain the symptom and the fix.',
    nodes: [
      node('n-service', 'el-notification-service', 'NotificationService', pos(0, 0), [
        m('send', 'void', [{ name: 'userId', type: 'String' }, { name: 'message', type: 'String' }]),
      ]),
      node('n-sms-factory', 'el-sms-factory', 'SmsNotifierFactory', pos(1, 0), [
        m('create', 'Notifier'),
      ]),
      node('n-notifier', 'el-notifier', 'Notifier', pos(2, 0), [
        m('notify', 'void', [{ name: 'to', type: 'String' }, { name: 'message', type: 'String' }]),
      ], [], 'interface'),
      node('n-email', 'el-email-notifier', 'EmailNotifier', pos(1, 1), [
        m('notify', 'void', [{ name: 'to', type: 'String' }, { name: 'message', type: 'String' }]),
      ], [{ name: 'smtpHost', type: 'String' }]),
      node('n-sms', 'el-sms-notifier', 'SmsNotifier', pos(2, 1), [
        m('notify', 'void', [{ name: 'to', type: 'String' }, { name: 'message', type: 'String' }]),
      ], [{ name: 'gatewayUrl', type: 'String' }]),
    ],
    edges: [
      edge('e-service-factory', 'ed-service-factory', 'n-service', 'n-sms-factory', 'dependency'),
      edge('e-smsfactory-email', 'ed-smsfactory-email', 'n-sms-factory', 'n-email', 'dependency'),
      edge('e-email-notifier', 'ed-email-notifier', 'n-email', 'n-notifier', 'inheritance'),
      edge('e-sms-notifier', 'ed-sms-notifier', 'n-sms', 'n-notifier', 'inheritance'),
    ],
    expectedIssues: [
      issue(
        'iss-sms-factory-builds-email-1',
        ['ed-smsfactory-email', 'el-sms-factory'],
        'Pattern Misuse',
        ['Tight Coupling'],
        ['smsnotifierfactory', 'factory', 'emailnotifier', 'smsnotifier', 'creates', 'wrong', 'product', 'instantiates'],
        'SmsNotifierFactory instantiates EmailNotifier, so a factory that promises SMS delivers email while SmsNotifier is never created. A factory must return the product that matches its name. Make SmsNotifierFactory build SmsNotifier (and have EmailNotifierFactory build EmailNotifier), both returning the Notifier abstraction.',
        [
          'Trace the dependency leaving SmsNotifierFactory. Which concrete class does it point at?',
          'Check whether SmsNotifier is reachable from anywhere other than its own inheritance link.',
          'A factory is only useful if its name and its product agree. Which arrow breaks that contract?',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 130
  pack({
    slug: 'dbg-singleton-db-new',
    title: 'Database Access Pattern',
    difficulty: 'easy',
    order: 130,
    description: 'DbConnection exposes getInstance(), but every call hands out a brand-new connection.',
    tags: ['singleton', 'pattern-misuse', 'database', 'easy'],
    briefing:
      'The persistence layer is meant to share one DbConnection across repositories. Production monitoring shows the database running out of connections under modest load, even though every repository obtains its connection with DbConnection.getInstance(). The class was copied from an old Singleton template.',
    requirement:
      'Examine DbConnection and its users in the diagram. Identify what is wrong with the Singleton implementation and describe the fix.',
    nodes: [
      node('n-db', 'el-db', 'DbConnection', pos(1, 0), [
        sm('getInstance', 'DbConnection'),
        m('DbConnection'),
        m('execute', 'ResultSet', [{ name: 'sql', type: 'String' }]),
        m('close'),
      ], [
        { name: 'instance', type: 'DbConnection', visibility: 'private' },
        { name: 'url', type: 'String' },
      ]),
      node('n-user-repo', 'el-user-repo', 'UserRepository', pos(0, 0), [
        m('findById', 'User', [{ name: 'id', type: 'String' }]),
      ]),
      node('n-order-repo', 'el-order-repo', 'OrderRepository', pos(2, 0), [
        m('save', 'void', [{ name: 'order', type: 'Order' }]),
      ]),
      node('n-report', 'el-report-service', 'ReportService', pos(1, 1), [
        m('monthlyRevenue', 'Money'),
      ]),
    ],
    edges: [
      edge('e-user-db', 'ed-user-db', 'n-user-repo', 'n-db', 'dependency'),
      edge('e-order-db', 'ed-order-db', 'n-order-repo', 'n-db', 'dependency'),
      edge('e-report-db', 'ed-report-db', 'n-report', 'n-db', 'dependency'),
    ],
    expectedIssues: [
      issue(
        'iss-singleton-always-new-1',
        ['el-db'],
        'Pattern Misuse',
        ['Poor Encapsulation'],
        ['dbconnection', 'singleton', 'getinstance', 'new', 'instance', 'constructor', 'private', 'cached', 'shared'],
        'DbConnection.getInstance() creates a new object on every call instead of returning the cached private static instance, and its constructor is public so anyone can create more. Each repository therefore opens its own connection. Make the constructor private and have getInstance() lazily create the instance once (thread-safely) and return the same one.',
        [
          'Look at the members of DbConnection: there is a static instance field, a static getInstance, and a constructor. What is the visibility of each?',
          'If getInstance() always returns a new object, what is the stored instance for? How many connections would three repositories open?',
          'A Singleton needs a private constructor and a getInstance that returns the single stored instance, creating it only if absent.',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 131
  pack({
    slug: 'dbg-observer-never-fires',
    title: 'Stock Alert Wiring',
    difficulty: 'easy',
    order: 131,
    description: 'StockSubject keeps a list of observers but nothing ever tells them the price changed.',
    tags: ['observer', 'pattern-misuse', 'events', 'easy'],
    briefing:
      'A trading app uses the Observer pattern so that price changes reach an email-alert component and a live dashboard. Both observers register successfully through attach(), yet neither ever receives an update when the price moves.',
    requirement:
      'Review the diagram and explain why the observers are never informed. Describe the change required for the Observer pattern to work as intended.',
    nodes: [
      node('n-subject', 'el-stock-subject', 'StockSubject', pos(0, 0), [
        m('attach', 'void', [{ name: 'observer', type: 'StockObserver' }]),
        m('detach', 'void', [{ name: 'observer', type: 'StockObserver' }]),
        m('setPrice', 'void', [{ name: 'price', type: 'double' }]),
      ], [
        { name: 'observers', type: 'List<StockObserver>' },
        { name: 'price', type: 'double' },
      ]),
      node('n-observer', 'el-stock-observer', 'StockObserver', pos(1, 0), [
        m('update', 'void', [{ name: 'symbol', type: 'String' }, { name: 'price', type: 'double' }]),
      ], [], 'interface'),
      node('n-email-alert', 'el-email-alert', 'EmailAlertObserver', pos(2, 0), [
        m('update', 'void', [{ name: 'symbol', type: 'String' }, { name: 'price', type: 'double' }]),
      ], [{ name: 'threshold', type: 'double' }]),
      node('n-dashboard', 'el-dashboard', 'DashboardObserver', pos(1, 1), [
        m('update', 'void', [{ name: 'symbol', type: 'String' }, { name: 'price', type: 'double' }]),
      ]),
    ],
    edges: [
      edge('e-subject-observer', 'ed-subject-observer', 'n-subject', 'n-observer', 'aggregation'),
      edge('e-email-observer', 'ed-email-observer', 'n-email-alert', 'n-observer', 'inheritance'),
      edge('e-dash-observer', 'ed-dash-observer', 'n-dashboard', 'n-observer', 'inheritance'),
    ],
    expectedIssues: [
      issue(
        'iss-observer-never-notifies-1',
        ['el-stock-subject'],
        'Pattern Misuse',
        ['Other'],
        ['stocksubject', 'subject', 'notify', 'notifyobservers', 'setprice', 'update', 'observers', 'never', 'missing'],
        'StockSubject stores observers via attach/detach, but it has no notifyObservers() step and setPrice() never calls update() on them. The pattern is only half implemented. Add notifyObservers() that iterates the list and calls update(symbol, price), and invoke it from setPrice() whenever the value changes.',
        [
          'Compare the methods on StockSubject with the Observer pattern: attach, detach, and one more. Which is absent?',
          'When the price changes, which method runs, and is there anything in the diagram that connects it to StockObserver.update?',
          'Registering observers is not enough. The subject must push updates to them whenever its state changes.',
        ],
      ),
    ],
  }),

  // ─────────────────────────────────────────────────────────────── 132
  pack({
    slug: 'dbg-decorator-drops-base',
    title: 'Coffee Decorator Chain',
    difficulty: 'easy',
    order: 132,
    description: 'MilkDecorator implements Beverage but never wraps one, so the base price is lost.',
    tags: ['decorator', 'pattern-misuse', 'composition', 'easy'],
    briefing:
      'A cafe ordering system prices drinks with the Decorator pattern. An Espresso costs 3.00 and milk should add 0.50 on top of whatever beverage it wraps. Customers who order an espresso with milk are being charged 0.50 instead of 3.50.',
    requirement:
      'Find why the milk decorator produces the wrong price. Explain what a correct Decorator needs and how you would change the diagram.',
    nodes: [
      node('n-beverage', 'el-beverage', 'Beverage', pos(1, 0), [
        m('cost', 'double'),
        m('description', 'String'),
      ], [], 'interface'),
      node('n-espresso', 'el-espresso', 'Espresso', pos(0, 0), [
        m('cost', 'double'),
        m('description', 'String'),
      ]),
      node('n-milk', 'el-milk', 'MilkDecorator', pos(2, 0), [
        m('cost', 'double'),
        m('description', 'String'),
      ], [{ name: 'milkPrice', type: 'double' }]),
      node('n-cafe', 'el-cafe', 'CafeOrder', pos(1, 1), [
        m('priceOf', 'double', [{ name: 'drink', type: 'Beverage' }]),
      ]),
    ],
    edges: [
      edge('e-espresso-beverage', 'ed-espresso-beverage', 'n-espresso', 'n-beverage', 'inheritance'),
      edge('e-milk-beverage', 'ed-milk-beverage', 'n-milk', 'n-beverage', 'inheritance'),
      edge('e-cafe-beverage', 'ed-cafe-beverage', 'n-cafe', 'n-beverage', 'dependency'),
    ],
    expectedIssues: [
      issue(
        'iss-decorator-drops-base-1',
        ['el-milk'],
        'Pattern Misuse',
        ['Other'],
        ['milkdecorator', 'decorator', 'wrapped', 'beverage', 'delegate', 'cost', 'base', 'price', 'composition', 'reference'],
        'MilkDecorator implements Beverage but holds no reference to a wrapped Beverage, so cost() returns only milkPrice and the espresso price is dropped. A decorator must both implement and aggregate the interface: add a Beverage field set via the constructor and return wrapped.cost() + milkPrice (and extend description() likewise).',
        [
          'List MilkDecorator\'s attributes. Is there anything that could hold the drink being decorated?',
          'A decorator is-a Beverage and also has-a Beverage. Which of these two relationships exists in the diagram?',
          'Without a wrapped beverage, cost() can only return its own value. Where would 3.00 come from?',
        ],
      ),
    ],
    verification: { requireNoEditTo: ['Espresso', 'CafeOrder'] },
  }),

  // ─────────────────────────────────────────────────────────────── 133
  pack({
    slug: 'dbg-strategy-wrong-rate',
    title: 'Pricing Strategy Selection',
    difficulty: 'easy',
    order: 133,
    description: 'PremiumStrategy reaches into StandardStrategy for its rate, so premium customers get standard pricing.',
    tags: ['strategy', 'pattern-misuse', 'pricing', 'easy'],
    briefing:
      'A subscription checkout selects a PricingStrategy per customer tier. Premium customers are promised a lower rate, yet finance finds they are being billed exactly the same as standard customers. The strategies were supposed to be independent, interchangeable algorithms.',
    requirement:
      'Review the strategy hierarchy and explain why premium pricing is wrong. Describe how the strategies should be organised.',
    nodes: [
      node('n-checkout', 'el-checkout', 'CheckoutService', pos(0, 0), [
        m('quote', 'Money', [{ name: 'basePrice', type: 'Money' }]),
      ], [{ name: 'strategy', type: 'PricingStrategy' }]),
      node('n-strategy', 'el-pricing-strategy', 'PricingStrategy', pos(1, 0), [
        m('price', 'Money', [{ name: 'basePrice', type: 'Money' }]),
      ], [], 'interface'),
      node('n-standard', 'el-standard', 'StandardStrategy', pos(2, 0), [
        m('price', 'Money', [{ name: 'basePrice', type: 'Money' }]),
        m('getRate', 'double'),
      ], [{ name: 'rate', type: 'double' }]),
      node('n-premium', 'el-premium', 'PremiumStrategy', pos(1, 1), [
        m('price', 'Money', [{ name: 'basePrice', type: 'Money' }]),
      ], [{ name: 'premiumRate', type: 'double' }]),
    ],
    edges: [
      edge('e-checkout-strategy', 'ed-checkout-strategy', 'n-checkout', 'n-strategy', 'aggregation'),
      edge('e-standard-strategy', 'ed-standard-strategy', 'n-standard', 'n-strategy', 'inheritance'),
      edge('e-premium-strategy', 'ed-premium-strategy', 'n-premium', 'n-strategy', 'inheritance'),
      edge('e-premium-standard', 'ed-premium-standard', 'n-premium', 'n-standard', 'dependency'),
    ],
    expectedIssues: [
      issue(
        'iss-strategy-premium-uses-standard-rate-1',
        ['ed-premium-standard', 'el-premium'],
        'Pattern Misuse',
        ['Other', 'Tight Coupling'],
        ['premiumstrategy', 'standardstrategy', 'rate', 'premiumrate', 'depends', 'sibling', 'independent', 'interchangeable', 'strategy'],
        'PremiumStrategy depends on its sibling StandardStrategy and uses its getRate(), ignoring its own premiumRate, so premium customers pay the standard rate. Strategies should be independent, interchangeable implementations of PricingStrategy. Remove the dependency and have PremiumStrategy compute the price from premiumRate.',
        [
          'Strategies are meant to be interchangeable siblings. Does anything link two of them directly?',
          'PremiumStrategy declares premiumRate. Is there any reason it would need StandardStrategy at all?',
          'Follow the dependency from PremiumStrategy to StandardStrategy and ask whose rate ends up in the calculation.',
        ],
      ),
    ],
    verification: { forbidDirectEdges: [{ from: 'PremiumStrategy', to: 'StandardStrategy' }] },
  }),
]
