/**
 * Design Studio "Refactor" packs — medium B (orders 245–255).
 */
import { pack, node, edge, pos, type RefactorPackSeed } from '../seed-studio-refactor-lib'

function brief(going: string, problem: string, todo: string, start: string): string {
  return (
    'What’s going on\n' + going + '\n\n' +
    'The problem (simple terms)\n' + problem + '\n\n' +
    'What you should do\n' + todo + '\n\n' +
    'Where to start\n' + start
  )
}

export const MEDIUM_B: RefactorPackSeed[] = [
  // ── 245 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-extract-ballot-counting',
    title: 'Election Counting Mix',
    difficulty: 'medium',
    order: 245,
    description:
      'ElectionService registers candidates, validates ballots and counts votes in one class. Pull ballot handling and counting into focused collaborators.',
    tags: ['election', 'extract', 'voting'],
    scenario: 'extract',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-elec-svc', 'ElectionService', pos(1, 0), [
        'addCandidate', 'castVote', 'validateBallot', 'tallyVotes', 'countByCandidate', 'declareWinner', 'printResults',
      ]),
      node('n2', 'el-elec-cand', 'Candidate', pos(0, 1), ['getName', 'getParty']),
      node('n3', 'el-elec-voter', 'Voter', pos(1, 1), ['getId', 'hasVoted', 'markVoted']),
      node('n4', 'el-elec-repo', 'VoteRepository', pos(2, 1), ['saveVote', 'findAll']),
      node('n5', 'el-elec-print', 'ResultPrinter', pos(0, 2), ['printLine']),
      node('n6', 'el-elec-audit', 'AuditLog', pos(2, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-elec-1', 'n1', 'n2'),
      edge('e2', 'ed-elec-2', 'n1', 'n3'),
      edge('e3', 'ed-elec-3', 'n1', 'n4'),
      edge('e4', 'ed-elec-4', 'n1', 'n5'),
      edge('e5', 'ed-elec-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'A regional election app keeps everything in ElectionService: candidate registration, ballot validation, vote casting, tallying, winner selection and printing.',
      'Counting rules and ballot rules change for different elections, but every change edits the same class — and a printing tweak can break tallying.',
      'Split ballot handling and vote counting into separate collaborators. Keep voting, counting, winner declaration and audit trail working.',
      'Look at validateBallot, tallyVotes and countByCandidate on ElectionService — they are separate jobs. Extend the diagram instead of redrawing it.',
    ),
    requirements: ['Cast a vote', 'Validate ballots', 'Count votes per candidate', 'Declare winner', 'Audit every vote'],
    flows: [
      {
        id: 'cast-vote',
        label: 'Cast Vote',
        steps: ['Validate ballot', 'Mark voter as voted', 'Persist vote', 'Write audit entry'],
        mustKeepElementNames: ['ElectionService', 'VoteRepository'],
        mustReach: [
          { from: 'ElectionService', to: 'Voter' },
          { from: 'ElectionService', to: 'VoteRepository' },
        ],
        mustHavePathTopics: ['ballot', 'vote', 'audit'],
      },
      {
        id: 'count-votes',
        label: 'Count Votes',
        steps: ['Load all votes', 'Tally per candidate'],
        mustReach: [{ from: 'ElectionService', to: 'VoteRepository' }],
        mustHavePathTopics: ['count', 'tally', 'vote'],
      },
      {
        id: 'declare-winner',
        label: 'Declare Winner',
        steps: ['Pick top candidate', 'Print results'],
        mustReach: [
          { from: 'ElectionService', to: 'Candidate' },
          { from: 'ElectionService', to: 'ResultPrinter' },
        ],
        mustHavePathTopics: ['winner', 'result'],
      },
    ],
    forbidDeleteElementNames: ['ElectionService', 'Candidate', 'VoteRepository'],
    modelHints: ['Ballot', 'VoteCounter', 'BallotValidator'],
  }),

  // ── 246 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-split-parking-ticket',
    title: 'Parking Ticket Lifecycle',
    difficulty: 'medium',
    order: 246,
    description:
      'ParkingTicket handles entry, fee calculation, payment and receipts. Extract fee and payment responsibilities.',
    tags: ['parking', 'extract', 'payment'],
    scenario: 'extract',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-park-ticket', 'ParkingTicket', pos(1, 0), [
        'enter', 'calculateFee', 'applyDiscount', 'pay', 'printReceipt', 'exit',
      ], [{ name: 'entryTime', type: 'Date' }]),
      node('n2', 'el-park-veh', 'Vehicle', pos(0, 1), ['getPlate', 'getType']),
      node('n3', 'el-park-spot', 'ParkingSpot', pos(1, 1), ['occupy', 'release']),
      node('n4', 'el-park-gw', 'CardGateway', pos(2, 1), ['charge']),
      node('n5', 'el-park-print', 'ReceiptPrinter', pos(0, 2), ['print']),
      node('n6', 'el-park-clock', 'Clock', pos(2, 2), ['now']),
    ],
    edges: [
      edge('e1', 'ed-park-1', 'n1', 'n2'),
      edge('e2', 'ed-park-2', 'n1', 'n3'),
      edge('e3', 'ed-park-3', 'n1', 'n4'),
      edge('e4', 'ed-park-4', 'n1', 'n5'),
      edge('e5', 'ed-park-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'A parking lot issues a ParkingTicket on entry. The same class computes the fee, applies discounts, takes card payment and prints the receipt.',
      'Pricing rules and payment methods change independently, yet both live inside the ticket — so every pricing tweak risks payment bugs.',
      'Move fee calculation and payment out of ParkingTicket. Keep entry, exit, receipt and spot handling intact.',
      'Read ParkingTicket methods calculateFee, applyDiscount and pay. Those are the seams to cut along.',
    ),
    requirements: ['Vehicle entry', 'Fee calculation', 'Card payment', 'Receipt printing', 'Spot release on exit'],
    flows: [
      {
        id: 'enter-lot',
        label: 'Enter Lot',
        steps: ['Create ticket', 'Occupy spot', 'Record entry time'],
        mustKeepElementNames: ['ParkingTicket', 'ParkingSpot'],
        mustReach: [
          { from: 'ParkingTicket', to: 'ParkingSpot' },
          { from: 'ParkingTicket', to: 'Vehicle' },
        ],
        mustHavePathTopics: ['spot', 'ticket'],
      },
      {
        id: 'pay-and-exit',
        label: 'Pay and Exit',
        steps: ['Calculate fee', 'Charge card', 'Print receipt', 'Release spot'],
        mustReach: [
          { from: 'ParkingTicket', to: 'CardGateway' },
          { from: 'ParkingTicket', to: 'ReceiptPrinter' },
        ],
        mustHavePathTopics: ['fee', 'payment', 'receipt', 'spot'],
      },
    ],
    forbidDeleteElementNames: ['ParkingTicket', 'ParkingSpot', 'CardGateway'],
    modelHints: ['FeeCalculator', 'PaymentProcessor'],
  }),

  // ── 247 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-decouple-chat-channels',
    title: 'Messaging Channel Dup',
    difficulty: 'medium',
    order: 247,
    description:
      'ChatService duplicates the same send/validate/store/deliver logic for direct and group messages. Introduce a Channel abstraction.',
    tags: ['chat', 'decouple', 'duplication'],
    scenario: 'decouple',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-chat-svc', 'ChatService', pos(1, 0), [
        'sendDirectMessage', 'validateDirect', 'saveDirect', 'deliverToUser',
        'sendGroupMessage', 'validateGroup', 'saveGroup', 'deliverToGroup',
      ]),
      node('n2', 'el-chat-user', 'User', pos(0, 1), ['getId', 'getName']),
      node('n3', 'el-chat-group', 'Group', pos(1, 1), ['getMembers', 'isMember']),
      node('n4', 'el-chat-store', 'MessageStore', pos(2, 1), ['append', 'history']),
      node('n5', 'el-chat-push', 'PushGateway', pos(1, 2), ['push']),
    ],
    edges: [
      edge('e1', 'ed-chat-1', 'n1', 'n2'),
      edge('e2', 'ed-chat-2', 'n1', 'n3'),
      edge('e3', 'ed-chat-3', 'n1', 'n4'),
      edge('e4', 'ed-chat-4', 'n1', 'n5'),
    ],
    briefing: brief(
      'ChatService has two near-identical pipelines: one for direct messages and one for group messages. Each validates, saves and delivers.',
      'Adding a new channel kind (broadcast, thread) means copying yet another pipeline, and fixes must be applied twice.',
      'Introduce a Channel abstraction so ChatService sends through it without caring whether the target is a user or group. Keep both flows working.',
      'Compare sendDirectMessage and sendGroupMessage side by side — what differs is only who the recipients are.',
    ),
    requirements: ['Send direct message', 'Send group message', 'Validate sender', 'Persist history', 'Push to recipients'],
    flows: [
      {
        id: 'direct-message',
        label: 'Direct Message',
        steps: ['Validate', 'Save', 'Deliver to user'],
        mustKeepElementNames: ['ChatService', 'User'],
        mustReach: [
          { from: 'ChatService', to: 'User' },
          { from: 'ChatService', to: 'MessageStore' },
          { from: 'ChatService', to: 'PushGateway' },
        ],
        mustHavePathTopics: ['direct', 'message', 'deliver'],
      },
      {
        id: 'group-message',
        label: 'Group Message',
        steps: ['Validate membership', 'Save', 'Deliver to all members'],
        mustKeepElementNames: ['Group'],
        mustReach: [
          { from: 'ChatService', to: 'Group' },
          { from: 'ChatService', to: 'MessageStore' },
        ],
        mustHavePathTopics: ['group', 'member', 'deliver'],
      },
    ],
    forbidDeleteElementNames: ['ChatService', 'User', 'Group', 'MessageStore'],
    modelHints: ['Channel', 'DirectChannel', 'GroupChannel'],
  }),

  // ── 248 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-redesign-stock-observer',
    title: 'Market Price Observer Flip',
    difficulty: 'medium',
    order: 248,
    description:
      'Observer direction is backwards: Stock pulls from and calls Investor directly. Redesign with proper Subject/Observer roles.',
    tags: ['observer', 'redesign', 'finance'],
    scenario: 'redesign',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-mkt-feed', 'PriceFeed', pos(1, 0), ['publishQuote']),
      node('n2', 'el-mkt-stock', 'Stock', pos(1, 1), [
        'setPrice', 'getPrice', 'pollInvestors', 'askInvestorToAlert',
      ], [{ name: 'symbol', type: 'string' }]),
      node('n3', 'el-mkt-inv', 'Investor', pos(0, 2), [
        'watch', 'checkPrices', 'onThresholdHit',
      ], [{ name: 'watchlist', type: 'Stock[]' }]),
      node('n4', 'el-mkt-port', 'Portfolio', pos(1, 2), ['revalue']),
      node('n5', 'el-mkt-alert', 'AlertSender', pos(2, 2), ['sendAlert']),
      node('n6', 'el-mkt-disp', 'MarketDisplay', pos(2, 1), ['render']),
    ],
    edges: [
      edge('e1', 'ed-mkt-1', 'n1', 'n2'),
      edge('e2', 'ed-mkt-2', 'n2', 'n3'),
      edge('e3', 'ed-mkt-3', 'n3', 'n2', 'association'),
      edge('e4', 'ed-mkt-4', 'n3', 'n4'),
      edge('e5', 'ed-mkt-5', 'n3', 'n5'),
      edge('e6', 'ed-mkt-6', 'n2', 'n6'),
    ],
    briefing: brief(
      'Investors need to know when a stock price changes. Today Investor polls Stock in a loop, and Stock reaches back into Investor to ask it to alert — a circular, flipped Observer.',
      'Stock knows concrete Investors, Investors poll constantly, and adding another listener (display, portfolio) means editing Stock.',
      'Redesign so Stock acts as a Subject that notifies registered Observers on price change. Keep quotes, alerts and portfolio revaluation working.',
      'Spot the two-way link between Stock and Investor, then decide who should own the subscriber list.',
    ),
    requirements: ['Receive price quotes', 'Notify interested parties on change', 'Revalue portfolio', 'Send threshold alerts', 'Update market display'],
    flows: [
      {
        id: 'price-update',
        label: 'Price Update',
        steps: ['Feed publishes quote', 'Stock updates price', 'Observers notified'],
        mustKeepElementNames: ['PriceFeed', 'Stock'],
        mustReach: [{ from: 'PriceFeed', to: 'Stock' }],
        mustHavePathTopics: ['price', 'notify', 'observer'],
      },
      {
        id: 'investor-alert',
        label: 'Investor Alert',
        steps: ['Investor receives update', 'Check threshold', 'Send alert'],
        mustReach: [{ from: 'Investor', to: 'AlertSender' }],
        mustHavePathTopics: ['alert', 'threshold'],
      },
      {
        id: 'portfolio-revalue',
        label: 'Portfolio Revalue',
        steps: ['Investor receives update', 'Portfolio revalued'],
        mustReach: [{ from: 'Investor', to: 'Portfolio' }],
        mustHavePathTopics: ['portfolio', 'revalue'],
      },
    ],
    forbidDeleteElementNames: ['Stock', 'Investor', 'PriceFeed'],
    modelHints: ['Subject', 'Observer', 'PriceObserver'],
  }),

  // ── 249 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-decouple-hotel-rooms',
    title: 'Hotel Booking Room Types',
    difficulty: 'medium',
    order: 249,
    description:
      'BookingService depends directly on every concrete room class. Introduce a RoomType port so new rooms do not touch booking.',
    tags: ['hotel', 'decouple', 'booking'],
    scenario: 'decouple',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-hotel-book', 'BookingService', pos(1, 0), [
        'bookStandard', 'bookDeluxe', 'bookSuite', 'cancelBooking', 'priceFor',
      ]),
      node('n2', 'el-hotel-std', 'StandardRoom', pos(0, 1), ['isAvailable', 'getRate']),
      node('n3', 'el-hotel-dlx', 'DeluxeRoom', pos(1, 1), ['isAvailable', 'getRate', 'addMinibar']),
      node('n4', 'el-hotel-suite', 'SuiteRoom', pos(2, 1), ['isAvailable', 'getRate', 'addButler']),
      node('n5', 'el-hotel-guest', 'Guest', pos(0, 2), ['getName', 'getEmail']),
      node('n6', 'el-hotel-pay', 'PaymentGateway', pos(2, 2), ['charge', 'refund']),
    ],
    edges: [
      edge('e1', 'ed-hotel-1', 'n1', 'n2'),
      edge('e2', 'ed-hotel-2', 'n1', 'n3'),
      edge('e3', 'ed-hotel-3', 'n1', 'n4'),
      edge('e4', 'ed-hotel-4', 'n1', 'n5'),
      edge('e5', 'ed-hotel-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'BookingService has a separate bookX method per room class and talks to StandardRoom, DeluxeRoom and SuiteRoom directly.',
      'Adding a Penthouse means editing BookingService again, and the service cannot be tested without all concrete rooms.',
      'Make BookingService depend on a RoomType abstraction instead of concrete rooms. Keep booking, cancellation, pricing and payment working.',
      'Notice the three near-identical bookX methods and the three arrows fanning out to concrete rooms.',
    ),
    requirements: ['Book any room type', 'Check availability', 'Price a stay', 'Charge and refund payment', 'Cancel booking'],
    flows: [
      {
        id: 'book-room',
        label: 'Book Room',
        steps: ['Pick room', 'Check availability', 'Price stay', 'Charge guest'],
        mustKeepElementNames: ['BookingService', 'Guest', 'PaymentGateway'],
        mustReach: [
          { from: 'BookingService', to: 'Guest' },
          { from: 'BookingService', to: 'PaymentGateway' },
        ],
        mustHavePathTopics: ['room', 'availability', 'payment'],
      },
      {
        id: 'cancel-booking',
        label: 'Cancel Booking',
        steps: ['Release room', 'Refund payment'],
        mustReach: [{ from: 'BookingService', to: 'PaymentGateway' }],
        mustHavePathTopics: ['cancel', 'refund'],
      },
    ],
    forbidDeleteElementNames: ['BookingService', 'StandardRoom', 'DeluxeRoom', 'SuiteRoom'],
    modelHints: ['RoomType', 'Room'],
  }),

  // ── 250 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-extract-bank-transfer',
    title: 'Bank Transfer Inline',
    difficulty: 'medium',
    order: 250,
    description:
      'TransferService inlines validation, debit, credit, logging and rollback. Model the operation as a Transaction/Command.',
    tags: ['banking', 'extract', 'command'],
    scenario: 'extract',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-bank-svc', 'TransferService', pos(1, 0), [
        'transfer', 'validate', 'debit', 'credit', 'rollback', 'logTransfer',
      ]),
      node('n2', 'el-bank-acct', 'Account', pos(0, 1), ['getBalance', 'withdraw', 'deposit']),
      node('n3', 'el-bank-ledger', 'LedgerRepository', pos(1, 1), ['save', 'findByAccount']),
      node('n4', 'el-bank-fraud', 'FraudChecker', pos(2, 1), ['isSuspicious']),
      node('n5', 'el-bank-sms', 'SmsNotifier', pos(0, 2), ['send']),
      node('n6', 'el-bank-audit', 'AuditLog', pos(2, 2), ['record']),
    ],
    edges: [
      edge('e1', 'ed-bank-1', 'n1', 'n2'),
      edge('e2', 'ed-bank-2', 'n1', 'n3'),
      edge('e3', 'ed-bank-3', 'n1', 'n4'),
      edge('e4', 'ed-bank-4', 'n1', 'n5'),
      edge('e5', 'ed-bank-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'TransferService.transfer does everything inline: fraud check, debit, credit, rollback on failure, ledger entry, SMS and audit.',
      'The steps and their undo logic are tangled, so supporting new operations (scheduled transfer, reversal) means copy-pasting the whole method.',
      'Represent a transfer as a Transaction/Command with execute and undo, and let TransferService orchestrate it. Keep fraud check, rollback, logging and notification.',
      'Follow transfer(): each step has an obvious undo — that is a command waiting to be extracted.',
    ),
    requirements: ['Validate and fraud-check', 'Debit and credit atomically', 'Rollback on failure', 'Record ledger entry', 'Notify customer'],
    flows: [
      {
        id: 'successful-transfer',
        label: 'Successful Transfer',
        steps: ['Fraud check', 'Debit source', 'Credit target', 'Save ledger', 'Notify'],
        mustKeepElementNames: ['TransferService', 'Account'],
        mustReach: [
          { from: 'TransferService', to: 'FraudChecker' },
          { from: 'TransferService', to: 'Account' },
          { from: 'TransferService', to: 'LedgerRepository' },
        ],
        mustHavePathTopics: ['debit', 'credit', 'ledger', 'notify'],
      },
      {
        id: 'failed-transfer',
        label: 'Failed Transfer Rollback',
        steps: ['Credit fails', 'Undo debit', 'Write audit'],
        mustReach: [
          { from: 'TransferService', to: 'Account' },
          { from: 'TransferService', to: 'AuditLog' },
        ],
        mustHavePathTopics: ['rollback', 'undo', 'audit'],
      },
    ],
    forbidDeleteElementNames: ['TransferService', 'Account', 'LedgerRepository'],
    modelHints: ['Transaction', 'TransferCommand'],
  }),

  // ── 251 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-split-crm-contact',
    title: 'CRM Contact God Hub',
    difficulty: 'medium',
    order: 251,
    description:
      'Contact owns campaigns, call logging and deals. Extract dedicated services and keep Contact as a data holder.',
    tags: ['crm', 'extract', 'god-class'],
    scenario: 'extract',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-crm-contact', 'Contact', pos(1, 0), [
        'addToCampaign', 'sendCampaignEmail', 'scheduleCall', 'logCall',
        'createDeal', 'closeDeal', 'calculateDealValue',
      ], [{ name: 'email', type: 'string' }]),
      node('n2', 'el-crm-camp', 'Campaign', pos(0, 1), ['getTemplate', 'getAudience']),
      node('n3', 'el-crm-call', 'CallLog', pos(1, 1), ['append', 'recent']),
      node('n4', 'el-crm-deal', 'Deal', pos(2, 1), ['getStage', 'setStage', 'getAmount']),
      node('n5', 'el-crm-mail', 'EmailClient', pos(0, 2), ['send']),
      node('n6', 'el-crm-repo', 'CrmRepository', pos(2, 2), ['save', 'load']),
    ],
    edges: [
      edge('e1', 'ed-crm-1', 'n1', 'n2'),
      edge('e2', 'ed-crm-2', 'n1', 'n3'),
      edge('e3', 'ed-crm-3', 'n1', 'n4'),
      edge('e4', 'ed-crm-4', 'n1', 'n5'),
      edge('e5', 'ed-crm-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'In the CRM, Contact is the hub for everything: marketing campaigns, phone calls and sales deals all hang off one class.',
      'Marketing, support and sales teams all edit Contact, causing merge conflicts and unrelated regressions.',
      'Extract services for campaigns, calls and deals so Contact mostly holds contact data. Keep every existing capability.',
      'Group Contact’s methods by theme: campaign, call and deal. Each cluster is a candidate service.',
    ),
    requirements: ['Enroll in campaigns and email', 'Schedule and log calls', 'Create and close deals', 'Compute deal value', 'Persist changes'],
    flows: [
      {
        id: 'campaign-email',
        label: 'Campaign Email',
        steps: ['Add to campaign', 'Render template', 'Send email'],
        mustKeepElementNames: ['Contact', 'Campaign', 'EmailClient'],
        mustReach: [
          { from: 'Contact', to: 'Campaign' },
          { from: 'Contact', to: 'EmailClient' },
        ],
        mustHavePathTopics: ['campaign', 'email'],
      },
      {
        id: 'log-call',
        label: 'Log Call',
        steps: ['Schedule call', 'Log outcome', 'Persist'],
        mustReach: [
          { from: 'Contact', to: 'CallLog' },
          { from: 'Contact', to: 'CrmRepository' },
        ],
        mustHavePathTopics: ['call', 'log'],
      },
      {
        id: 'close-deal',
        label: 'Close Deal',
        steps: ['Create deal', 'Calculate value', 'Close deal', 'Persist'],
        mustReach: [
          { from: 'Contact', to: 'Deal' },
          { from: 'Contact', to: 'CrmRepository' },
        ],
        mustHavePathTopics: ['deal', 'value'],
      },
    ],
    forbidDeleteElementNames: ['Contact', 'Campaign', 'CallLog', 'Deal'],
    modelHints: ['CampaignService', 'CallService', 'DealService'],
  }),

  // ── 252 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-extract-player-score',
    title: 'Player Score Duties',
    difficulty: 'medium',
    order: 252,
    description:
      'Player computes its own score, updates the leaderboard, saves and renders. Extract a ScoreService.',
    tags: ['game', 'extract', 'score'],
    scenario: 'extract',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-score-player', 'Player', pos(1, 0), [
        'move', 'collectItem', 'computeScore', 'updateLeaderboard', 'saveScore', 'renderScore',
      ], [{ name: 'items', type: 'Item[]' }]),
      node('n2', 'el-score-board', 'Leaderboard', pos(0, 1), ['submit', 'topN']),
      node('n3', 'el-score-repo', 'ScoreRepository', pos(1, 1), ['save', 'load']),
      node('n4', 'el-score-match', 'Match', pos(2, 1), ['getDuration', 'getDifficulty']),
      node('n5', 'el-score-badge', 'Achievement', pos(0, 2), ['unlock']),
      node('n6', 'el-score-ui', 'ConsoleRenderer', pos(2, 2), ['draw']),
    ],
    edges: [
      edge('e1', 'ed-score-1', 'n1', 'n2'),
      edge('e2', 'ed-score-2', 'n1', 'n3'),
      edge('e3', 'ed-score-3', 'n1', 'n4'),
      edge('e4', 'ed-score-4', 'n1', 'n5'),
      edge('e5', 'ed-score-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'Player is a gameplay object but it also computes final score, pushes it to the leaderboard, persists it, unlocks achievements and draws it.',
      'Scoring rules change per game mode and force edits to Player, which also owns movement and inventory.',
      'Extract a ScoreService that owns computation, leaderboard submission and persistence. Keep gameplay and rendering working.',
      'computeScore, updateLeaderboard and saveScore are one cohesive responsibility; renderScore is another.',
    ),
    requirements: ['Compute final score', 'Submit to leaderboard', 'Persist score', 'Unlock achievements', 'Render score'],
    flows: [
      {
        id: 'finish-match',
        label: 'Finish Match',
        steps: ['Compute score', 'Update leaderboard', 'Save score'],
        mustKeepElementNames: ['Player', 'Leaderboard', 'ScoreRepository'],
        mustReach: [
          { from: 'Player', to: 'Match' },
          { from: 'Player', to: 'Leaderboard' },
          { from: 'Player', to: 'ScoreRepository' },
        ],
        mustHavePathTopics: ['score', 'leaderboard'],
      },
      {
        id: 'show-score',
        label: 'Show Score',
        steps: ['Render score', 'Unlock achievements'],
        mustReach: [
          { from: 'Player', to: 'ConsoleRenderer' },
          { from: 'Player', to: 'Achievement' },
        ],
        mustHavePathTopics: ['render', 'achievement'],
      },
    ],
    forbidDeleteElementNames: ['Player', 'Leaderboard', 'ScoreRepository'],
    modelHints: ['ScoreService', 'ScoreCalculator'],
  }),

  // ── 253 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-decouple-payment-providers',
    title: 'Checkout Provider Switch',
    difficulty: 'medium',
    order: 253,
    description:
      'PaymentService switches on provider name with if-stripe/else-paypal. Introduce a PaymentProvider abstraction.',
    tags: ['payment', 'decouple', 'strategy'],
    scenario: 'decouple',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-chk-ctrl', 'CheckoutController', pos(1, 0), ['checkout', 'refund']),
      node('n2', 'el-chk-svc', 'PaymentService', pos(1, 1), [
        'pay', 'payWithStripe', 'payWithPayPal', 'refundStripe', 'refundPayPal',
      ], [{ name: 'providerName', type: 'string' }]),
      node('n3', 'el-chk-stripe', 'StripeClient', pos(0, 2), ['createCharge', 'refundCharge']),
      node('n4', 'el-chk-paypal', 'PayPalClient', pos(1, 2), ['createPayment', 'refundPayment']),
      node('n5', 'el-chk-order', 'Order', pos(2, 1), ['getTotal', 'markPaid']),
      node('n6', 'el-chk-mail', 'ReceiptMailer', pos(2, 2), ['sendReceipt']),
    ],
    edges: [
      edge('e1', 'ed-chk-1', 'n1', 'n2'),
      edge('e2', 'ed-chk-2', 'n2', 'n3'),
      edge('e3', 'ed-chk-3', 'n2', 'n4'),
      edge('e4', 'ed-chk-4', 'n1', 'n5'),
      edge('e5', 'ed-chk-5', 'n2', 'n6'),
    ],
    briefing: brief(
      'PaymentService checks a provider string and branches: if "stripe" call StripeClient, else if "paypal" call PayPalClient — for both pay and refund.',
      'Every new provider adds more branches in PaymentService, and the service is hard-wired to vendor SDKs.',
      'Introduce a PaymentProvider abstraction implemented by each vendor, and let PaymentService delegate. Keep payment, refund and receipts working.',
      'Look at pay and refund: both repeat the same provider branching. That is the seam.',
    ),
    requirements: ['Pay with Stripe', 'Pay with PayPal', 'Refund through original provider', 'Mark order paid', 'Send receipt'],
    flows: [
      {
        id: 'pay-order',
        label: 'Pay Order',
        steps: ['Read order total', 'Charge via provider', 'Mark order paid', 'Send receipt'],
        mustKeepElementNames: ['PaymentService', 'Order', 'ReceiptMailer'],
        mustReach: [
          { from: 'CheckoutController', to: 'PaymentService' },
          { from: 'PaymentService', to: 'ReceiptMailer' },
        ],
        mustHavePathTopics: ['payment', 'provider', 'receipt'],
      },
      {
        id: 'refund-order',
        label: 'Refund Order',
        steps: ['Pick original provider', 'Refund charge'],
        mustReach: [{ from: 'CheckoutController', to: 'PaymentService' }],
        mustHavePathTopics: ['refund', 'provider'],
      },
    ],
    forbidDeleteElementNames: ['PaymentService', 'StripeClient', 'PayPalClient', 'Order'],
    modelHints: ['PaymentProvider', 'StripeProvider', 'PayPalProvider'],
  }),

  // ── 254 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-redesign-calendar-hierarchy',
    title: 'Calendar Event Inheritance',
    difficulty: 'medium',
    order: 254,
    description:
      'Event extends Calendar just to reuse a few helpers. Redesign using composition so the hierarchy models real relationships.',
    tags: ['calendar', 'redesign', 'inheritance'],
    scenario: 'redesign',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-cal-cal', 'Calendar', pos(1, 0), [
        'addEvent', 'removeEvent', 'listEvents', 'formatDate', 'findConflicts',
      ], [{ name: 'events', type: 'Event[]' }]),
      node('n2', 'el-cal-event', 'Event', pos(1, 1), [
        'reschedule', 'addAttendee', 'setReminder', 'addEvent',
      ], [{ name: 'title', type: 'string' }]),
      node('n3', 'el-cal-att', 'Attendee', pos(0, 2), ['getEmail', 'respond']),
      node('n4', 'el-cal-rem', 'Reminder', pos(1, 2), ['trigger']),
      node('n5', 'el-cal-rule', 'RecurrenceRule', pos(2, 2), ['nextOccurrence']),
      node('n6', 'el-cal-notif', 'NotificationService', pos(2, 1), ['notify']),
    ],
    edges: [
      edge('e1', 'ed-cal-1', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-cal-2', 'n2', 'n3'),
      edge('e3', 'ed-cal-3', 'n2', 'n4'),
      edge('e4', 'ed-cal-4', 'n2', 'n5'),
      edge('e5', 'ed-cal-5', 'n4', 'n6'),
      edge('e6', 'ed-cal-6', 'n1', 'n2', 'association'),
    ],
    briefing: brief(
      'Event inherits from Calendar to borrow formatDate and conflict checks, even though an Event is not a kind of Calendar. It even inherits addEvent and removeEvent.',
      'The wrong "is-a" relationship leaks irrelevant methods, creates a circular link with Calendar, and makes changes to Calendar ripple into events.',
      'Redesign using composition: Calendar contains Events, and shared helpers move to a separate collaborator. Keep scheduling, attendees, reminders and recurrence.',
      'Start with the inheritance arrow from Event to Calendar and ask what Event really needs from it.',
    ),
    requirements: ['Add and remove events on a calendar', 'Detect conflicts', 'Manage attendees', 'Send reminders', 'Support recurring events'],
    flows: [
      {
        id: 'schedule-event',
        label: 'Schedule Event',
        steps: ['Add event to calendar', 'Check conflicts', 'Add attendees'],
        mustKeepElementNames: ['Calendar', 'Event', 'Attendee'],
        mustReach: [
          { from: 'Calendar', to: 'Event' },
          { from: 'Event', to: 'Attendee' },
        ],
        mustHavePathTopics: ['event', 'conflict', 'attendee'],
      },
      {
        id: 'remind-attendees',
        label: 'Remind Attendees',
        steps: ['Reminder triggers', 'Notification sent'],
        mustReach: [
          { from: 'Event', to: 'Reminder' },
          { from: 'Reminder', to: 'NotificationService' },
        ],
        mustHavePathTopics: ['reminder', 'notify'],
      },
      {
        id: 'recurring-event',
        label: 'Recurring Event',
        steps: ['Compute next occurrence', 'Reschedule'],
        mustReach: [{ from: 'Event', to: 'RecurrenceRule' }],
        mustHavePathTopics: ['recurrence', 'occurrence'],
      },
    ],
    forbidDeleteElementNames: ['Calendar', 'Event', 'Reminder'],
    modelHints: ['DateFormatter', 'ConflictChecker'],
  }),

  // ── 255 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'ref-decouple-feed-ranking',
    title: 'News Feed Rank Modes',
    difficulty: 'medium',
    order: 255,
    description:
      'FeedService inlines recency, popularity and relevance ranking behind a mode switch. Introduce a RankingStrategy.',
    tags: ['feed', 'decouple', 'strategy'],
    scenario: 'decouple',
    maxNewAbstractions: 3,
    nodes: [
      node('n1', 'el-feed-svc', 'FeedService', pos(1, 0), [
        'getFeed', 'rankByRecency', 'rankByPopularity', 'rankByRelevance', 'setMode',
      ], [{ name: 'mode', type: 'string' }]),
      node('n2', 'el-feed-post', 'Post', pos(0, 1), ['getCreatedAt', 'getAuthor']),
      node('n3', 'el-feed-user', 'User', pos(1, 1), ['getInterests', 'getFollowing']),
      node('n4', 'el-feed-stats', 'EngagementStats', pos(2, 1), ['likes', 'shares']),
      node('n5', 'el-feed-repo', 'PostRepository', pos(0, 2), ['findCandidates']),
      node('n6', 'el-feed-cache', 'FeedCache', pos(2, 2), ['get', 'put']),
    ],
    edges: [
      edge('e1', 'ed-feed-1', 'n1', 'n2'),
      edge('e2', 'ed-feed-2', 'n1', 'n3'),
      edge('e3', 'ed-feed-3', 'n1', 'n4'),
      edge('e4', 'ed-feed-4', 'n1', 'n5'),
      edge('e5', 'ed-feed-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'FeedService builds a user feed and ranks posts by recency, popularity or relevance, selecting the algorithm with a mode string.',
      'Every new ranking experiment adds another method and another branch to FeedService, and algorithms cannot be tested or swapped independently.',
      'Introduce a RankingStrategy abstraction with one implementation per algorithm and let FeedService delegate. Keep caching and fetching.',
      'getFeed switches on mode and calls three rankBy methods — those are strategies in disguise.',
    ),
    requirements: ['Fetch candidate posts', 'Rank by recency', 'Rank by popularity', 'Rank by relevance', 'Cache results'],
    flows: [
      {
        id: 'build-feed',
        label: 'Build Feed',
        steps: ['Check cache', 'Fetch candidates', 'Rank posts', 'Store in cache'],
        mustKeepElementNames: ['FeedService', 'PostRepository', 'FeedCache'],
        mustReach: [
          { from: 'FeedService', to: 'FeedCache' },
          { from: 'FeedService', to: 'PostRepository' },
        ],
        mustHavePathTopics: ['feed', 'rank', 'cache'],
      },
      {
        id: 'rank-popular',
        label: 'Rank by Popularity',
        steps: ['Read engagement', 'Sort posts'],
        mustReach: [{ from: 'FeedService', to: 'EngagementStats' }],
        mustHavePathTopics: ['popularity', 'engagement'],
      },
      {
        id: 'rank-relevant',
        label: 'Rank by Relevance',
        steps: ['Read user interests', 'Score posts'],
        mustReach: [
          { from: 'FeedService', to: 'User' },
          { from: 'FeedService', to: 'Post' },
        ],
        mustHavePathTopics: ['relevance', 'interest'],
      },
    ],
    forbidDeleteElementNames: ['FeedService', 'Post', 'User', 'FeedCache'],
    modelHints: ['RankingStrategy', 'RecencyRanking', 'PopularityRanking'],
  }),
]
