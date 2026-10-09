/**
 * Design Studio "Refactor" packs — medium tier, set A (orders 234–244).
 */
import { pack, node, edge, pos, type RefactorPackSeed, type MethodSpec } from '../seed-studio-refactor-lib'

/** Typed method shorthand: m('charge', 'PaymentResult', ['bookingId', 'string'], ['amount', 'number']) */
function m(name: string, returnType = 'void', ...params: [string, string][]): MethodSpec {
  return { name, returnType, params: params.map(([n, t]) => ({ name: n, type: t })) }
}

/** Four-section briefing in the same voice as the rest of the refactor library. */
function brief(what: string, problem: string, todo: string, start: string): string {
  return (
    `What’s going on\n${what}\n\n` +
    `The problem (simple terms)\n${problem}\n\n` +
    `What you should do\n${todo}\n\n` +
    `Where to start\n${start}`
  )
}

export const MEDIUM_A: RefactorPackSeed[] = [
  // ───────────────────────────── 234 ─────────────────────────────
  pack({
    slug: 'ref-split-bookmyshow-booking',
    title: 'Show Booking Fat Controller',
    difficulty: 'medium',
    order: 234,
    scenario: 'extract',
    maxNewAbstractions: 3,
    tags: ['booking', 'extract', 'movie-ticketing', 'srp'],
    description:
      'A movie-ticketing BookingService locks seats, charges cards, prints tickets and sends SMS in one class. Extract seat locking, payment and ticketing into focused collaborators.',
    nodes: [
      node('n1', 'el-bms-svc', 'BookingService', pos(1, 0), [
        m('createBooking', 'Booking', ['userId', 'string'], ['showId', 'string'], ['seatIds', 'string[]']),
        m('lockSeat', 'boolean', ['showId', 'string'], ['seatId', 'string']),
        m('releaseExpiredLocks'),
        m('chargeCard', 'boolean', ['bookingId', 'string'], ['amount', 'number']),
        m('refundCard', 'void', ['bookingId', 'string']),
        m('issueTicket', 'string', ['bookingId', 'string']),
        m('sendConfirmationSms', 'void', ['bookingId', 'string']),
        m('cancelBooking', 'void', ['bookingId', 'string']),
      ]),
      node('n2', 'el-bms-booking', 'Booking', pos(2, 0), ['markPaid', 'markCancelled'], [
        { name: 'bookingId', type: 'string' },
        { name: 'status', type: 'BookingStatus' },
        { name: 'seatIds', type: 'string[]' },
      ]),
      node('n3', 'el-bms-seatinv', 'SeatInventory', pos(0, 1), ['holdSeat', 'freeSeat', 'confirmSeat']),
      node('n4', 'el-bms-gw', 'PaymentGateway', pos(1, 1), ['authorize', 'refund']),
      node('n5', 'el-bms-sms', 'SmsGateway', pos(2, 1), ['send']),
      node('n6', 'el-bms-show', 'Show', pos(0, 2), ['isSeatFree'], [
        { name: 'showId', type: 'string' },
        { name: 'seatMap', type: 'Map<string, SeatState>' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-bms-1', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'ed-bms-2', 'n1', 'n3'),
      edge('e3', 'ed-bms-3', 'n1', 'n4'),
      edge('e4', 'ed-bms-4', 'n1', 'n5'),
      edge('e5', 'ed-bms-5', 'n3', 'n6'),
    ],
    briefing: brief(
      'You joined a movie-ticketing team. Checkout runs through BookingService — and that one class holds seat locks, card charging, refunds, ticket generation and SMS. It is the only thing that really “does” anything.',
      'Seat holds have a timer, payments have retries, tickets have QR rules, SMS has templates. All of these now change inside the same class, so a tweak to ticket format risks the seat-lock logic.',
      'Pull seat locking, payment handling and ticket issuing out of BookingService into small, focused collaborators. BookingService can stay as the thin coordinator for the booking use case. Keep every existing capability.',
      'Read the method list on BookingService and group by reason-to-change. Notice the arrows to SeatInventory, PaymentGateway and SmsGateway — these should end up behind the new collaborators, not hanging off one god class.',
    ),
    requirements: [
      'Seat locking with expiry',
      'Card payment and refund',
      'Ticket issuance',
      'SMS confirmation',
      'Booking cancellation',
    ],
    flows: [
      {
        id: 'book-seats',
        label: 'Book Seats',
        steps: ['Lock seats', 'Charge card', 'Issue ticket', 'Send SMS confirmation'],
        mustKeepElementNames: ['BookingService', 'Booking'],
        mustReach: [
          { from: 'BookingService', to: 'SeatInventory' },
          { from: 'BookingService', to: 'PaymentGateway' },
          { from: 'BookingService', to: 'SmsGateway' },
        ],
        mustHavePathTopics: ['seat', 'lock', 'payment', 'ticket', 'sms'],
      },
      {
        id: 'cancel-booking',
        label: 'Cancel Booking',
        steps: ['Refund payment', 'Free seats', 'Notify user'],
        mustReach: [
          { from: 'BookingService', to: 'PaymentGateway' },
          { from: 'BookingService', to: 'SeatInventory' },
        ],
        mustHavePathTopics: ['refund', 'seat', 'sms'],
      },
      {
        id: 'expire-locks',
        label: 'Release Expired Locks',
        steps: ['Find stale holds', 'Free seats in inventory'],
        mustReach: [{ from: 'BookingService', to: 'SeatInventory' }],
        mustHavePathTopics: ['lock', 'expire', 'seat'],
      },
    ],
    forbidDeleteElementNames: ['BookingService', 'Booking', 'PaymentGateway'],
    modelHints: ['SeatLockService', 'PaymentProcessor', 'TicketIssuer'],
  }),

  // ───────────────────────────── 235 ─────────────────────────────
  pack({
    slug: 'ref-decouple-ride-pricing',
    title: 'Ride Pricing Concrete Rules',
    difficulty: 'medium',
    order: 235,
    scenario: 'decouple',
    maxNewAbstractions: 3,
    tags: ['pricing', 'strategy', 'decouple', 'ride-hailing'],
    description:
      'RideService hardcodes surge, airport and promo rules in an if/else ladder. Introduce a pricing abstraction so new rules do not require editing the service.',
    nodes: [
      node('n1', 'el-rp-svc', 'RideService', pos(1, 0), [
        m('requestRide', 'Ride', ['riderId', 'string'], ['pickup', 'GeoPoint'], ['drop', 'GeoPoint']),
        m('estimateFare', 'number', ['pickup', 'GeoPoint'], ['drop', 'GeoPoint'], ['rideType', 'string']),
        m('applyPeakSurge', 'number', ['base', 'number']),
        m('applyAirportSurcharge', 'number', ['base', 'number']),
        m('applyRainSurge', 'number', ['base', 'number']),
        m('applyPromo', 'number', ['fare', 'number'], ['code', 'string']),
        m('completeRide', 'void', ['rideId', 'string']),
      ]),
      node('n2', 'el-rp-ride', 'Ride', pos(2, 0), ['start', 'finish'], [
        { name: 'rideId', type: 'string' },
        { name: 'fare', type: 'number' },
        { name: 'rideType', type: 'string' },
      ]),
      node('n3', 'el-rp-demand', 'DemandMonitor', pos(0, 1), ['getDemandRatio']),
      node('n4', 'el-rp-maps', 'MapsClient', pos(1, 1), ['getDistanceKm', 'getEtaMinutes']),
      node('n5', 'el-rp-pay', 'PaymentGateway', pos(2, 1), ['charge']),
      node('n6', 'el-rp-weather', 'WeatherApi', pos(0, 2), ['isRaining']),
    ],
    edges: [
      edge('e1', 'ed-rp-1', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'ed-rp-2', 'n1', 'n3'),
      edge('e3', 'ed-rp-3', 'n1', 'n4'),
      edge('e4', 'ed-rp-4', 'n1', 'n5'),
      edge('e5', 'ed-rp-5', 'n3', 'n6'),
    ],
    briefing: brief(
      'A ride-hailing backend prices trips inside RideService. estimateFare walks an if/else ladder: peak hours, airport pickups, rain, promo codes — each rule is a private method on the same class.',
      'Every time Ops invents a pricing rule (festival surge, women-safety discount, corporate rates) engineers reopen RideService. Rules cannot be tested, reused or toggled independently.',
      'Introduce an abstraction for fare calculation so rules plug in from outside. RideService should depend on that abstraction rather than on concrete surge logic. Existing fares must still be computed the same way.',
      'Look at estimateFare and the applyXxx methods. Each applyXxx is a candidate concrete rule. Note RideService reaches DemandMonitor and MapsClient directly — decide who should own those inputs after your change.',
    ),
    requirements: [
      'Distance-based base fare',
      'Peak-hour and demand surge',
      'Airport surcharge',
      'Rain surge',
      'Promo code discount',
      'Charge on ride completion',
    ],
    flows: [
      {
        id: 'estimate-fare',
        label: 'Estimate Fare',
        steps: ['Get distance', 'Apply pricing rules', 'Return estimate'],
        mustKeepElementNames: ['RideService'],
        mustReach: [
          { from: 'RideService', to: 'MapsClient' },
          { from: 'RideService', to: 'DemandMonitor' },
        ],
        mustHavePathTopics: ['distance', 'surge', 'pricing'],
      },
      {
        id: 'rain-surge',
        label: 'Rain Surge Applied',
        steps: ['Check weather', 'Multiply fare'],
        mustReach: [{ from: 'RideService', to: 'WeatherApi' }],
        mustHavePathTopics: ['rain', 'weather', 'surge'],
      },
      {
        id: 'complete-ride',
        label: 'Complete Ride',
        steps: ['Finalize fare', 'Charge rider'],
        mustReach: [{ from: 'RideService', to: 'PaymentGateway' }],
        mustHavePathTopics: ['fare', 'charge'],
      },
    ],
    forbidDeleteElementNames: ['RideService', 'Ride', 'PaymentGateway'],
    modelHints: ['PricingStrategy', 'SurgePricing', 'PromoPricing'],
  }),

  // ───────────────────────────── 236 ─────────────────────────────
  pack({
    slug: 'ref-extract-expense-settle',
    title: 'Splitwise Expense God',
    difficulty: 'medium',
    order: 236,
    scenario: 'extract',
    maxNewAbstractions: 3,
    tags: ['expense', 'extract', 'settlement', 'fintech'],
    description:
      'ExpenseService splits bills, converts currencies, computes balances, settles debts and notifies the group. Extract settlement and split concerns into their own units.',
    nodes: [
      node('n1', 'el-ex-svc', 'ExpenseService', pos(1, 0), [
        m('addExpense', 'Expense', ['groupId', 'string'], ['paidBy', 'string'], ['amount', 'number'], ['currency', 'string']),
        m('splitEqual', 'Map<string, number>', ['expense', 'Expense']),
        m('splitByPercent', 'Map<string, number>', ['expense', 'Expense']),
        m('convertToBase', 'number', ['amount', 'number'], ['currency', 'string']),
        m('computeBalances', 'Map<string, number>', ['groupId', 'string']),
        m('simplifyDebts', 'Transfer[]', ['groupId', 'string']),
        m('settleUp', 'void', ['from', 'string'], ['to', 'string'], ['amount', 'number']),
        m('notifyGroup', 'void', ['groupId', 'string'], ['message', 'string']),
      ]),
      node('n2', 'el-ex-exp', 'Expense', pos(0, 0), ['getShares'], [
        { name: 'expenseId', type: 'string' },
        { name: 'paidBy', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
      ]),
      node('n3', 'el-ex-fx', 'FxRateClient', pos(0, 1), ['getRate']),
      node('n4', 'el-ex-ledger', 'LedgerRepository', pos(1, 1), ['saveExpense', 'loadGroupExpenses', 'saveTransfer']),
      node('n5', 'el-ex-push', 'PushNotifier', pos(2, 1), ['push']),
      node('n6', 'el-ex-db', 'SplitwiseDb', pos(1, 2), ['write', 'query']),
    ],
    edges: [
      edge('e1', 'ed-ex-1', 'n1', 'n2', 'association', 'left', 'right'),
      edge('e2', 'ed-ex-2', 'n1', 'n3'),
      edge('e3', 'ed-ex-3', 'n1', 'n4'),
      edge('e4', 'ed-ex-4', 'n1', 'n5'),
      edge('e5', 'ed-ex-5', 'n4', 'n6'),
    ],
    briefing: brief(
      'A group-expense app routes everything through ExpenseService: recording bills, equal and percent splits, FX conversion, balance math, debt simplification, settling up, and group notifications.',
      'Settlement rules (who pays whom, minimum transfers) evolve independently from how bills are split. In one class, a change to rounding in splits can quietly alter settlement amounts.',
      'Extract settlement into its own responsibility and keep split calculation separate from persistence and notification. ExpenseService may remain as the entry point but should delegate. Do not drop multi-currency support.',
      'Start with computeBalances, simplifyDebts and settleUp — they form a natural cluster. Then check which of FxRateClient, LedgerRepository and PushNotifier each cluster really needs.',
    ),
    requirements: [
      'Equal and percentage splits',
      'Currency conversion to group base currency',
      'Balance computation',
      'Debt simplification',
      'Settle-up transfers',
      'Group notification',
    ],
    flows: [
      {
        id: 'add-expense',
        label: 'Add Expense',
        steps: ['Convert currency', 'Split among members', 'Persist expense', 'Notify group'],
        mustKeepElementNames: ['ExpenseService', 'Expense'],
        mustReach: [
          { from: 'ExpenseService', to: 'FxRateClient' },
          { from: 'ExpenseService', to: 'LedgerRepository' },
          { from: 'ExpenseService', to: 'PushNotifier' },
        ],
        mustHavePathTopics: ['fx', 'split', 'ledger', 'notify'],
      },
      {
        id: 'settle-up',
        label: 'Settle Up',
        steps: ['Load balances', 'Simplify debts', 'Record transfer', 'Notify group'],
        mustReach: [
          { from: 'ExpenseService', to: 'LedgerRepository' },
          { from: 'ExpenseService', to: 'PushNotifier' },
        ],
        mustHavePathTopics: ['balance', 'settle', 'transfer'],
      },
      {
        id: 'view-balances',
        label: 'View Balances',
        steps: ['Load group expenses', 'Compute net balances'],
        mustReach: [{ from: 'ExpenseService', to: 'SplitwiseDb' }],
        mustHavePathTopics: ['balance', 'ledger'],
      },
    ],
    forbidDeleteElementNames: ['ExpenseService', 'Expense', 'LedgerRepository'],
    modelHints: ['SettlementService', 'SplitCalculator', 'DebtSimplifier'],
  }),

  // ───────────────────────────── 237 ─────────────────────────────
  pack({
    slug: 'ref-redesign-chess-moves',
    title: 'Chess Board Move Switch',
    difficulty: 'medium',
    order: 237,
    scenario: 'redesign',
    maxNewAbstractions: 4,
    tags: ['chess', 'polymorphism', 'redesign', 'game'],
    description:
      'Board validates every piece with one switch on piece type. Push movement rules into a Piece hierarchy so adding a piece never touches Board.',
    nodes: [
      node('n1', 'el-ch-game', 'Game', pos(0, 0), ['makeMove', 'isGameOver', 'currentPlayer'], [
        { name: 'turn', type: 'Color' },
      ]),
      node('n2', 'el-ch-board', 'Board', pos(1, 0), [
        m('validateMove', 'boolean', ['from', 'Position'], ['to', 'Position']),
        m('validatePawn', 'boolean', ['from', 'Position'], ['to', 'Position']),
        m('validateKnight', 'boolean', ['from', 'Position'], ['to', 'Position']),
        m('validateSliding', 'boolean', ['from', 'Position'], ['to', 'Position']),
        m('validateKing', 'boolean', ['from', 'Position'], ['to', 'Position']),
        m('isPathClear', 'boolean', ['from', 'Position'], ['to', 'Position']),
        m('isInCheck', 'boolean', ['color', 'Color']),
        m('applyMove', 'void', ['move', 'Move']),
      ]),
      node('n3', 'el-ch-hist', 'MoveHistory', pos(2, 0), ['push', 'undo']),
      node('n4', 'el-ch-pos', 'Position', pos(0, 1), [], [
        { name: 'file', type: 'number' },
        { name: 'rank', type: 'number' },
      ]),
      node('n5', 'el-ch-piece', 'Piece', pos(1, 1), ['getType', 'getColor'], [
        { name: 'type', type: 'PieceType' },
        { name: 'color', type: 'Color' },
        { name: 'hasMoved', type: 'boolean' },
      ]),
      node('n6', 'el-ch-move', 'Move', pos(2, 1), [], [
        { name: 'from', type: 'Position' },
        { name: 'to', type: 'Position' },
        { name: 'captured', type: 'Piece' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-ch-1', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'ed-ch-2', 'n2', 'n3', 'association', 'right', 'left'),
      edge('e3', 'ed-ch-3', 'n2', 'n5'),
      edge('e4', 'ed-ch-4', 'n2', 'n6'),
      edge('e5', 'ed-ch-5', 'n5', 'n4', 'association', 'left', 'right'),
    ],
    briefing: brief(
      'A chess engine keeps all rules in Board. validateMove switches on piece type and calls validatePawn, validateKnight, validateSliding and validateKing. Piece is just a bag of data (type, color, hasMoved).',
      'Adding a variant piece, or fixing castling and en passant, means editing the giant Board switch. Board knows geometry of every piece and also owns check detection and history — it is a type-switch magnet.',
      'Redesign so each kind of piece knows how it moves. Board should ask a piece whether a move is legal rather than switching on its type. Keep check detection, move application and undo working.',
      'Piece is the natural base for polymorphism. Look at how Board reaches Piece, Move and MoveHistory today, and decide what stays on Board (global state like check, occupancy) versus what moves to pieces (movement geometry).',
    ),
    requirements: [
      'Per-piece movement rules (pawn, knight, sliders, king)',
      'Path blocking',
      'Check detection',
      'Apply move and capture',
      'Move history with undo',
    ],
    flows: [
      {
        id: 'validate-move',
        label: 'Validate Move',
        steps: ['Find piece on square', 'Piece checks its own movement rule', 'Check path is clear'],
        mustKeepElementNames: ['Board', 'Piece'],
        mustReach: [{ from: 'Board', to: 'Piece' }],
        mustHavePathTopics: ['piece', 'validate', 'path'],
      },
      {
        id: 'make-move',
        label: 'Make Move',
        steps: ['Game requests move', 'Board validates', 'Apply move and record history'],
        mustReach: [
          { from: 'Game', to: 'Board' },
          { from: 'Board', to: 'MoveHistory' },
        ],
        mustHavePathTopics: ['move', 'history'],
      },
      {
        id: 'detect-check',
        label: 'Detect Check',
        steps: ['Locate king', 'Ask enemy pieces if they attack king square'],
        mustReach: [{ from: 'Board', to: 'Piece' }],
        mustHavePathTopics: ['check', 'king'],
      },
    ],
    forbidDeleteElementNames: ['Board', 'Piece', 'Move', 'MoveHistory'],
    modelHints: ['Pawn', 'Knight', 'SlidingPiece', 'King'],
  }),

  // ───────────────────────────── 238 ─────────────────────────────
  pack({
    slug: 'ref-split-tweet-pipeline',
    title: 'Tweet Publish Pipeline',
    difficulty: 'medium',
    order: 238,
    scenario: 'extract',
    maxNewAbstractions: 3,
    tags: ['feed', 'pipeline', 'extract', 'social'],
    description:
      'TweetService uploads media, parses hashtags, indexes search and fans out to timelines in one publish method. Extract pipeline stages.',
    nodes: [
      node('n1', 'el-tw-svc', 'TweetService', pos(1, 0), [
        m('publish', 'Tweet', ['authorId', 'string'], ['text', 'string'], ['media', 'File[]']),
        m('uploadMedia', 'string[]', ['files', 'File[]']),
        m('extractHashtags', 'string[]', ['text', 'string']),
        m('extractMentions', 'string[]', ['text', 'string']),
        m('indexForSearch', 'void', ['tweet', 'Tweet']),
        m('fanOutToFollowers', 'void', ['tweet', 'Tweet']),
        m('notifyMentions', 'void', ['tweet', 'Tweet']),
        m('deleteTweet', 'void', ['tweetId', 'string']),
      ]),
      node('n2', 'el-tw-tweet', 'Tweet', pos(0, 0), [], [
        { name: 'tweetId', type: 'string' },
        { name: 'authorId', type: 'string' },
        { name: 'text', type: 'string' },
        { name: 'mediaUrls', type: 'string[]' },
      ]),
      node('n3', 'el-tw-graph', 'FollowGraph', pos(2, 0), ['getFollowers']),
      node('n4', 'el-tw-media', 'MediaStore', pos(0, 1), ['upload', 'delete']),
      node('n5', 'el-tw-search', 'SearchIndex', pos(1, 1), ['indexTerms', 'removeDoc']),
      node('n6', 'el-tw-cache', 'TimelineCache', pos(2, 1), ['pushToTimeline', 'removeFromTimelines']),
    ],
    edges: [
      edge('e1', 'ed-tw-1', 'n1', 'n2', 'association', 'left', 'right'),
      edge('e2', 'ed-tw-2', 'n1', 'n3', 'association', 'right', 'left'),
      edge('e3', 'ed-tw-3', 'n1', 'n4'),
      edge('e4', 'ed-tw-4', 'n1', 'n5'),
      edge('e5', 'ed-tw-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'Publishing a tweet is one long method on TweetService: upload media, parse hashtags and mentions, index for search, fan out to follower timelines, notify mentioned users.',
      'Each step has different scaling and failure behavior (media is slow, fan-out is huge for celebrity accounts, search can lag). Today they are welded together, so you cannot reorder, retry or run stages asynchronously.',
      'Model publishing as a pipeline of independent stages orchestrated by a small coordinator. TweetService should stop knowing the details of each step. Keep deletion and mention notifications working.',
      'Count the verbs inside publish. Each one is a candidate stage. Then see which infrastructure box (MediaStore, SearchIndex, TimelineCache, FollowGraph) each stage owns.',
    ),
    requirements: [
      'Media upload',
      'Hashtag and mention parsing',
      'Search indexing',
      'Follower timeline fan-out',
      'Mention notifications',
      'Tweet deletion cleanup',
    ],
    flows: [
      {
        id: 'publish-tweet',
        label: 'Publish Tweet',
        steps: ['Upload media', 'Parse hashtags', 'Index for search', 'Fan out to followers'],
        mustKeepElementNames: ['TweetService', 'Tweet'],
        mustReach: [
          { from: 'TweetService', to: 'MediaStore' },
          { from: 'TweetService', to: 'SearchIndex' },
          { from: 'TweetService', to: 'TimelineCache' },
        ],
        mustHavePathTopics: ['media', 'hashtag', 'index', 'fanout'],
      },
      {
        id: 'fanout',
        label: 'Fan-out To Followers',
        steps: ['Load followers', 'Push tweet into each timeline'],
        mustReach: [
          { from: 'TweetService', to: 'FollowGraph' },
          { from: 'TweetService', to: 'TimelineCache' },
        ],
        mustHavePathTopics: ['follower', 'timeline'],
      },
      {
        id: 'delete-tweet',
        label: 'Delete Tweet',
        steps: ['Remove from search', 'Remove from timelines', 'Delete media'],
        mustReach: [
          { from: 'TweetService', to: 'SearchIndex' },
          { from: 'TweetService', to: 'TimelineCache' },
          { from: 'TweetService', to: 'MediaStore' },
        ],
        mustHavePathTopics: ['delete', 'timeline', 'search'],
      },
    ],
    forbidDeleteElementNames: ['TweetService', 'Tweet', 'TimelineCache'],
    modelHints: ['PublishPipeline', 'PublishStage', 'FanoutStage'],
  }),

  // ───────────────────────────── 239 ─────────────────────────────
  pack({
    slug: 'ref-decouple-elevator-schedule',
    title: 'Elevator Schedule Hardcode',
    difficulty: 'medium',
    order: 239,
    scenario: 'decouple',
    maxNewAbstractions: 3,
    tags: ['elevator', 'strategy', 'decouple', 'scheduling'],
    description:
      'ElevatorController inlines the SCAN algorithm. Pull stop selection behind a SchedulingStrategy so other policies can be swapped in.',
    nodes: [
      node('n1', 'el-el-ctrl', 'ElevatorController', pos(1, 0), [
        m('requestFloor', 'void', ['floor', 'number'], ['direction', 'Direction']),
        m('selectCar', 'Elevator', ['request', 'Request']),
        m('pickNextStop', 'number', ['car', 'Elevator']),
        m('step'),
        m('moveUp', 'void', ['car', 'Elevator']),
        m('moveDown', 'void', ['car', 'Elevator']),
        m('arrive', 'void', ['car', 'Elevator']),
      ]),
      node('n2', 'el-el-req', 'Request', pos(2, 0), [], [
        { name: 'floor', type: 'number' },
        { name: 'direction', type: 'Direction' },
      ]),
      node('n3', 'el-el-car', 'Elevator', pos(0, 1), ['addStop', 'hasStops', 'advance'], [
        { name: 'currentFloor', type: 'number' },
        { name: 'direction', type: 'Direction' },
        { name: 'stops', type: 'SortedSet<number>' },
      ]),
      node('n4', 'el-el-door', 'DoorController', pos(1, 1), ['open', 'close']),
      node('n5', 'el-el-disp', 'FloorDisplay', pos(2, 1), ['show']),
      node('n6', 'el-el-motor', 'MotorDriver', pos(0, 2), ['driveUp', 'driveDown', 'halt']),
    ],
    edges: [
      edge('e1', 'ed-el-1', 'n1', 'n2', 'association', 'right', 'left'),
      edge('e2', 'ed-el-2', 'n1', 'n3'),
      edge('e3', 'ed-el-3', 'n1', 'n4'),
      edge('e4', 'ed-el-4', 'n1', 'n5'),
      edge('e5', 'ed-el-5', 'n3', 'n6'),
    ],
    briefing: brief(
      'A building elevator system decides where each car goes next inside ElevatorController. pickNextStop contains the SCAN (elevator) algorithm directly: keep going in the current direction, then reverse.',
      'Facilities want a different policy at night (nearest-car first) and a priority mode for emergencies. Because SCAN is baked into the controller, any new policy means rewriting the loop that also drives doors and displays.',
      'Isolate stop selection (and car assignment if it helps) behind a scheduling abstraction. The controller should simply ask the strategy what to do. SCAN must continue to work as the default policy.',
      'Focus on pickNextStop and selectCar. Everything else on the controller is mechanical (moving, doors, display) and should remain. Notice the Elevator holds the stop set the strategy will read.',
    ),
    requirements: [
      'Hall call requests',
      'SCAN stop ordering',
      'Door open and close on arrival',
      'Floor display updates',
      'Motor control',
    ],
    flows: [
      {
        id: 'hall-call',
        label: 'Handle Hall Call',
        steps: ['Receive request', 'Select car', 'Queue stop on car'],
        mustKeepElementNames: ['ElevatorController', 'Elevator'],
        mustReach: [{ from: 'ElevatorController', to: 'Elevator' }],
        mustHavePathTopics: ['request', 'car', 'stop'],
      },
      {
        id: 'step-car',
        label: 'Step Car',
        steps: ['Pick next stop', 'Drive motor', 'Update display'],
        mustReach: [
          { from: 'ElevatorController', to: 'MotorDriver' },
          { from: 'ElevatorController', to: 'FloorDisplay' },
        ],
        mustHavePathTopics: ['stop', 'motor', 'display'],
      },
      {
        id: 'arrive',
        label: 'Arrive At Floor',
        steps: ['Halt motor', 'Open doors', 'Close doors', 'Resume'],
        mustReach: [
          { from: 'ElevatorController', to: 'DoorController' },
          { from: 'ElevatorController', to: 'MotorDriver' },
        ],
        mustHavePathTopics: ['door', 'halt'],
      },
    ],
    forbidDeleteElementNames: ['ElevatorController', 'Elevator', 'DoorController'],
    modelHints: ['SchedulingStrategy', 'ScanStrategy', 'NearestCarStrategy'],
  }),

  // ───────────────────────────── 240 ─────────────────────────────
  pack({
    slug: 'ref-extract-pos-pricing',
    title: 'Restaurant POS Order Desk',
    difficulty: 'medium',
    order: 240,
    scenario: 'extract',
    maxNewAbstractions: 3,
    tags: ['pos', 'pricing', 'extract', 'restaurant'],
    description:
      'Order computes tax and discounts, routes tickets to kitchen stations and prints receipts. Extract pricing and kitchen routing.',
    nodes: [
      node('n1', 'el-pos-order', 'Order', pos(1, 0), [
        m('addItem', 'void', ['item', 'MenuItem'], ['qty', 'number']),
        m('removeItem', 'void', ['itemId', 'string']),
        m('computeSubtotal', 'number'),
        m('applyDiscount', 'number', ['code', 'string']),
        m('applyTax', 'number', ['amount', 'number']),
        m('routeToKitchen', 'void'),
        m('printReceipt', 'void'),
        m('close', 'void', ['payment', 'PaymentInfo']),
      ]),
      node('n2', 'el-pos-item', 'MenuItem', pos(0, 0), ['getPrice'], [
        { name: 'itemId', type: 'string' },
        { name: 'station', type: 'Station' },
        { name: 'taxCategory', type: 'string' },
      ]),
      node('n3', 'el-pos-tax', 'TaxRateTable', pos(2, 0), ['rateFor']),
      node('n4', 'el-pos-kp', 'KitchenPrinter', pos(0, 1), ['printTicket']),
      node('n5', 'el-pos-rp', 'ReceiptPrinter', pos(1, 1), ['print']),
      node('n6', 'el-pos-term', 'PaymentTerminal', pos(2, 1), ['charge']),
    ],
    edges: [
      edge('e1', 'ed-pos-1', 'n1', 'n2', 'association', 'left', 'right'),
      edge('e2', 'ed-pos-2', 'n1', 'n3', 'association', 'right', 'left'),
      edge('e3', 'ed-pos-3', 'n1', 'n4'),
      edge('e4', 'ed-pos-4', 'n1', 'n5'),
      edge('e5', 'ed-pos-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'A restaurant point-of-sale models a table’s Order as an active object: it holds items, but also calculates discounts, applies regional tax, decides which kitchen station gets which item, and prints receipts.',
      'Tax law, happy-hour pricing, and kitchen layout change on different schedules. Order is a hotspot: a new station (bar, dessert counter) or a new tax rule both land in the same class.',
      'Extract pricing (discount + tax) and kitchen routing out of Order. Order should primarily own its line items and lifecycle. Receipt printing and payment must still happen when the order closes.',
      'Read Order’s method list and mark which methods only use item data vs which touch TaxRateTable, KitchenPrinter or printers. Those touching outside systems are the best extraction targets.',
    ),
    requirements: [
      'Add and remove line items',
      'Discount codes',
      'Tax by category',
      'Station-based kitchen routing',
      'Receipt printing',
      'Payment on close',
    ],
    flows: [
      {
        id: 'price-order',
        label: 'Price Order',
        steps: ['Sum line items', 'Apply discount', 'Apply tax by category'],
        mustKeepElementNames: ['Order', 'MenuItem'],
        mustReach: [{ from: 'Order', to: 'TaxRateTable' }],
        mustHavePathTopics: ['subtotal', 'discount', 'tax'],
      },
      {
        id: 'fire-to-kitchen',
        label: 'Fire To Kitchen',
        steps: ['Group items by station', 'Print kitchen ticket per station'],
        mustReach: [{ from: 'Order', to: 'KitchenPrinter' }],
        mustHavePathTopics: ['station', 'kitchen', 'ticket'],
      },
      {
        id: 'close-order',
        label: 'Close Order',
        steps: ['Compute final total', 'Charge payment', 'Print receipt'],
        mustReach: [
          { from: 'Order', to: 'PaymentTerminal' },
          { from: 'Order', to: 'ReceiptPrinter' },
        ],
        mustHavePathTopics: ['total', 'payment', 'receipt'],
      },
    ],
    forbidDeleteElementNames: ['Order', 'MenuItem', 'PaymentTerminal'],
    modelHints: ['PricingCalculator', 'KitchenRouter', 'ReceiptRenderer'],
  }),

  // ───────────────────────────── 241 ─────────────────────────────
  pack({
    slug: 'ref-break-product-inventory',
    title: 'Product Inventory Blend',
    difficulty: 'medium',
    order: 241,
    scenario: 'extract',
    maxNewAbstractions: 3,
    tags: ['inventory', 'entity', 'extract', 'e-commerce'],
    description:
      'Product mixes catalog data with stock counters, reservations and warehouse ids. Extract an Inventory concept so catalog and stock evolve independently.',
    nodes: [
      node('n1', 'el-inv-cart', 'CartService', pos(0, 0), [
        m('addToCart', 'void', ['cartId', 'string'], ['sku', 'string'], ['qty', 'number']),
        m('getCartTotal', 'number', ['cartId', 'string']),
      ]),
      node('n2', 'el-inv-co', 'CheckoutService', pos(1, 0), [
        m('checkout', 'Order', ['cartId', 'string']),
        m('rollbackReservation', 'void', ['cartId', 'string']),
      ]),
      node('n3', 'el-inv-job', 'ReplenishmentJob', pos(2, 0), ['runNightly']),
      node('n4', 'el-inv-prod', 'Product', pos(1, 1), [
        m('getPrice', 'number'),
        m('isInStock', 'boolean', ['qty', 'number']),
        m('reserve', 'boolean', ['qty', 'number']),
        m('release', 'void', ['qty', 'number']),
        m('restock', 'void', ['qty', 'number']),
        m('needsReorder', 'boolean'),
      ], [
        { name: 'sku', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'stockOnHand', type: 'number' },
        { name: 'reservedQty', type: 'number' },
        { name: 'warehouseId', type: 'string' },
        { name: 'reorderLevel', type: 'number' },
      ]),
      node('n5', 'el-inv-wh', 'Warehouse', pos(1, 2), ['locate', 'ship']),
      node('n6', 'el-inv-sup', 'SupplierClient', pos(2, 2), ['placePurchaseOrder']),
    ],
    edges: [
      edge('e1', 'ed-inv-1', 'n1', 'n4'),
      edge('e2', 'ed-inv-2', 'n2', 'n4'),
      edge('e3', 'ed-inv-3', 'n3', 'n4'),
      edge('e4', 'ed-inv-4', 'n4', 'n5'),
      edge('e5', 'ed-inv-5', 'n3', 'n6'),
    ],
    briefing: brief(
      'In this storefront Product is both a catalog entry (name, price) and a stock ledger (stockOnHand, reservedQty, warehouseId, reorderLevel). Cart, Checkout and a nightly replenishment job all reach into it.',
      'Marketing edits product copy while the warehouse system adjusts stock — two very different update rates and consistency needs share one object. Reservation rules can’t be tested without a full catalog item.',
      'Separate the inventory concern from Product. Introduce an Inventory entity and/or service that owns stock counts, reservations and reorder logic, and let callers talk to it. Keep price lookup and checkout reservation behavior intact.',
      'List which Product attributes and methods are about stock. Then trace which of CartService, CheckoutService and ReplenishmentJob really need catalog data versus stock data.',
    ),
    requirements: [
      'Catalog price lookup',
      'In-stock check at add-to-cart',
      'Reserve stock on checkout, rollback on failure',
      'Nightly reorder from supplier',
      'Warehouse location of stock',
    ],
    flows: [
      {
        id: 'add-to-cart',
        label: 'Add To Cart',
        steps: ['Look up product price', 'Check stock availability'],
        mustKeepElementNames: ['Product', 'CartService'],
        mustReach: [{ from: 'CartService', to: 'Product' }],
        mustHavePathTopics: ['price', 'stock'],
      },
      {
        id: 'checkout-reserve',
        label: 'Checkout Reserve',
        steps: ['Reserve each line', 'On failure release reservations'],
        mustReach: [{ from: 'CheckoutService', to: 'Warehouse' }],
        mustHavePathTopics: ['reserve', 'release', 'inventory'],
      },
      {
        id: 'replenish',
        label: 'Nightly Replenishment',
        steps: ['Find items below reorder level', 'Place supplier purchase order'],
        mustReach: [{ from: 'ReplenishmentJob', to: 'SupplierClient' }],
        mustHavePathTopics: ['reorder', 'supplier'],
      },
    ],
    forbidDeleteElementNames: ['Product', 'CheckoutService', 'Warehouse'],
    modelHints: ['Inventory', 'InventoryService', 'StockReservation'],
  }),

  // ───────────────────────────── 242 ─────────────────────────────
  pack({
    slug: 'ref-split-patient-hub',
    title: 'Hospital Patient Hub',
    difficulty: 'medium',
    order: 242,
    scenario: 'extract',
    maxNewAbstractions: 3,
    tags: ['healthcare', 'extract', 'domain-services', 'srp'],
    description:
      'PatientService schedules visits, writes prescriptions and bills insurance. Split it into scheduling, prescribing and billing services.',
    nodes: [
      node('n1', 'el-hp-svc', 'PatientService', pos(1, 0), [
        m('scheduleAppointment', 'Appointment', ['patientId', 'string'], ['doctorId', 'string'], ['slot', 'Date']),
        m('cancelAppointment', 'void', ['appointmentId', 'string']),
        m('writePrescription', 'Prescription', ['patientId', 'string'], ['drugs', 'Drug[]']),
        m('checkDrugInteractions', 'boolean', ['drugs', 'Drug[]']),
        m('generateBill', 'Bill', ['visitId', 'string']),
        m('submitInsuranceClaim', 'void', ['billId', 'string']),
        m('getMedicalRecord', 'MedicalRecord', ['patientId', 'string']),
      ]),
      node('n2', 'el-hp-patient', 'Patient', pos(0, 0), ['getAge'], [
        { name: 'patientId', type: 'string' },
        { name: 'allergies', type: 'string[]' },
        { name: 'insurancePolicyId', type: 'string' },
      ]),
      node('n3', 'el-hp-bill', 'BillingRecord', pos(2, 0), ['markClaimed'], [
        { name: 'billId', type: 'string' },
        { name: 'amount', type: 'number' },
      ]),
      node('n4', 'el-hp-cal', 'DoctorCalendar', pos(0, 1), ['isFree', 'book', 'release']),
      node('n5', 'el-hp-pharm', 'PharmacySystem', pos(1, 1), ['sendOrder']),
      node('n6', 'el-hp-ins', 'InsuranceGateway', pos(2, 1), ['submitClaim']),
      node('n7', 'el-hp-ddb', 'DrugInteractionDb', pos(1, 2), ['lookup']),
    ],
    edges: [
      edge('e1', 'ed-hp-1', 'n1', 'n2', 'association', 'left', 'right'),
      edge('e2', 'ed-hp-2', 'n1', 'n3', 'association', 'right', 'left'),
      edge('e3', 'ed-hp-3', 'n1', 'n4'),
      edge('e4', 'ed-hp-4', 'n1', 'n5'),
      edge('e5', 'ed-hp-5', 'n1', 'n6'),
      edge('e6', 'ed-hp-6', 'n5', 'n7'),
    ],
    briefing: brief(
      'A hospital’s patient portal backend funnels everything through PatientService: appointment booking, prescriptions with drug-interaction checks, billing, insurance claims and record access.',
      'Three different teams (front desk, clinical, finance) all edit this class. Clinical safety logic (interaction checks) sits next to billing code, which makes review and regulation audits painful.',
      'Extract domain services along those boundaries: scheduling, prescribing and billing. PatientService can remain as a thin facade or be reduced to patient record access. Safety checks must still run before any prescription is sent.',
      'Group the PatientService methods by team. Then follow arrows: DoctorCalendar belongs to scheduling, PharmacySystem and DrugInteractionDb to prescribing, InsuranceGateway and BillingRecord to billing.',
    ),
    requirements: [
      'Appointment scheduling and cancellation',
      'Prescription with interaction check',
      'Bill generation',
      'Insurance claim submission',
      'Medical record access',
    ],
    flows: [
      {
        id: 'book-appointment',
        label: 'Book Appointment',
        steps: ['Check doctor availability', 'Book slot', 'Return appointment'],
        mustKeepElementNames: ['PatientService', 'Patient'],
        mustReach: [{ from: 'PatientService', to: 'DoctorCalendar' }],
        mustHavePathTopics: ['availability', 'slot', 'appointment'],
      },
      {
        id: 'prescribe',
        label: 'Prescribe Medication',
        steps: ['Check allergies and interactions', 'Create prescription', 'Send to pharmacy'],
        mustReach: [
          { from: 'PatientService', to: 'DrugInteractionDb' },
          { from: 'PatientService', to: 'PharmacySystem' },
        ],
        mustHavePathTopics: ['interaction', 'prescription', 'pharmacy'],
      },
      {
        id: 'bill-visit',
        label: 'Bill Visit',
        steps: ['Generate bill', 'Submit insurance claim', 'Mark as claimed'],
        mustReach: [
          { from: 'PatientService', to: 'BillingRecord' },
          { from: 'PatientService', to: 'InsuranceGateway' },
        ],
        mustHavePathTopics: ['bill', 'claim', 'insurance'],
      },
    ],
    forbidDeleteElementNames: ['PatientService', 'Patient', 'BillingRecord'],
    modelHints: ['SchedulingService', 'PrescriptionService', 'BillingService'],
  }),

  // ───────────────────────────── 243 ─────────────────────────────
  pack({
    slug: 'ref-decouple-shuffle-strategy',
    title: 'Playlist Shuffle Modes',
    difficulty: 'medium',
    order: 243,
    scenario: 'decouple',
    maxNewAbstractions: 3,
    tags: ['music', 'strategy', 'decouple', 'playlist'],
    description:
      'Playlist picks the next track with an if/else over shuffle modes. Extract a ShuffleStrategy so new modes plug in without editing Playlist.',
    nodes: [
      node('n1', 'el-pl-list', 'Playlist', pos(1, 0), [
        m('addTrack', 'void', ['track', 'Track']),
        m('removeTrack', 'void', ['trackId', 'string']),
        m('setShuffleMode', 'void', ['mode', 'ShuffleMode']),
        m('nextTrack', 'Track'),
        m('previousTrack', 'Track'),
        m('pickRandom', 'Track'),
        m('pickWeightedByPlays', 'Track'),
        m('pickArtistSpread', 'Track'),
      ], [
        { name: 'tracks', type: 'Track[]' },
        { name: 'mode', type: 'ShuffleMode' },
      ]),
      node('n2', 'el-pl-track', 'Track', pos(0, 0), [], [
        { name: 'trackId', type: 'string' },
        { name: 'artistId', type: 'string' },
        { name: 'durationSec', type: 'number' },
      ]),
      node('n3', 'el-pl-player', 'Player', pos(2, 0), ['play', 'skip', 'back']),
      node('n4', 'el-pl-hist', 'PlayHistory', pos(0, 1), ['record', 'recentArtists', 'playCount']),
      node('n5', 'el-pl-prefs', 'UserPreferences', pos(1, 1), ['getShuffleDefault']),
      node('n6', 'el-pl-rng', 'RandomSource', pos(2, 1), ['nextInt']),
    ],
    edges: [
      edge('e1', 'ed-pl-1', 'n1', 'n2', 'association', 'left', 'right'),
      edge('e2', 'ed-pl-2', 'n3', 'n1', 'association', 'left', 'right'),
      edge('e3', 'ed-pl-3', 'n1', 'n4'),
      edge('e4', 'ed-pl-4', 'n1', 'n5'),
      edge('e5', 'ed-pl-5', 'n1', 'n6'),
    ],
    briefing: brief(
      'A music app lets users choose a shuffle mode. Playlist.nextTrack branches: pure random, weighted by play counts, spread by artist. Each branch has its own private helper reading PlayHistory or RandomSource.',
      'Product wants “discover mode”, “mood shuffle”, “no repeats within N songs”. Every new mode adds another branch in Playlist, so the list class grows into a tangle of selection logic that is hard to unit test deterministically.',
      'Pull shuffle selection behind a strategy abstraction and let Playlist delegate to the chosen strategy. Keep the existing three modes working and keep previous-track and history recording behavior.',
      'Look at nextTrack and the pickXxx helpers. Check which collaborator each helper depends on (PlayHistory, RandomSource) — those dependencies should travel with the strategy that needs them.',
    ),
    requirements: [
      'Sequential playback',
      'Random shuffle',
      'Weighted-by-plays shuffle',
      'Artist-spread shuffle',
      'Previous track and history',
      'Default shuffle from user preferences',
    ],
    flows: [
      {
        id: 'next-track',
        label: 'Next Track',
        steps: ['Player asks playlist', 'Pick track by shuffle mode', 'Record in history'],
        mustKeepElementNames: ['Playlist', 'Player', 'Track'],
        mustReach: [
          { from: 'Player', to: 'Playlist' },
          { from: 'Playlist', to: 'PlayHistory' },
        ],
        mustHavePathTopics: ['next', 'shuffle', 'history'],
      },
      {
        id: 'random-shuffle',
        label: 'Random Shuffle',
        steps: ['Draw random index', 'Return track'],
        mustReach: [{ from: 'Playlist', to: 'RandomSource' }],
        mustHavePathTopics: ['random', 'shuffle'],
      },
      {
        id: 'set-mode',
        label: 'Set Shuffle Mode',
        steps: ['Read default from preferences', 'Switch active mode'],
        mustReach: [{ from: 'Playlist', to: 'UserPreferences' }],
        mustHavePathTopics: ['mode', 'preference'],
      },
    ],
    forbidDeleteElementNames: ['Playlist', 'Track', 'Player', 'PlayHistory'],
    modelHints: ['ShuffleStrategy', 'RandomShuffle', 'WeightedShuffle'],
  }),

  // ───────────────────────────── 244 ─────────────────────────────
  pack({
    slug: 'ref-redesign-order-state',
    title: 'Food Order Status Ifs',
    difficulty: 'medium',
    order: 244,
    scenario: 'redesign',
    maxNewAbstractions: 4,
    tags: ['state-pattern', 'order', 'redesign', 'food-delivery'],
    description:
      'Order.changeStatus is a giant if/else over status transitions and side effects. Redesign with state collaborators so each state owns its allowed moves.',
    nodes: [
      node('n1', 'el-os-order', 'Order', pos(1, 0), [
        m('changeStatus', 'void', ['next', 'OrderStatus']),
        m('canTransition', 'boolean', ['next', 'OrderStatus']),
        m('accept'),
        m('startPreparing'),
        m('dispatch'),
        m('deliver'),
        m('cancel', 'void', ['reason', 'string']),
      ], [
        { name: 'orderId', type: 'string' },
        { name: 'status', type: 'OrderStatus' },
        { name: 'items', type: 'OrderItem[]' },
      ]),
      node('n2', 'el-os-item', 'OrderItem', pos(0, 0), [], [
        { name: 'name', type: 'string' },
        { name: 'qty', type: 'number' },
      ]),
      node('n3', 'el-os-status', 'OrderStatus', pos(2, 0), [], [
        { name: 'PLACED', type: 'enum' },
        { name: 'ACCEPTED', type: 'enum' },
        { name: 'PREPARING', type: 'enum' },
        { name: 'OUT_FOR_DELIVERY', type: 'enum' },
        { name: 'DELIVERED', type: 'enum' },
        { name: 'CANCELLED', type: 'enum' },
      ]),
      node('n4', 'el-os-disp', 'DispatchService', pos(0, 1), ['assignDriver', 'releaseDriver']),
      node('n5', 'el-os-pay', 'PaymentService', pos(1, 1), ['capture', 'refund']),
      node('n6', 'el-os-notif', 'NotificationService', pos(2, 1), ['notifyCustomer', 'notifyRestaurant']),
      node('n7', 'el-os-pool', 'DriverPool', pos(0, 2), ['nextAvailable']),
    ],
    edges: [
      edge('e1', 'ed-os-1', 'n1', 'n2', 'association', 'left', 'right'),
      edge('e2', 'ed-os-2', 'n1', 'n3', 'association', 'right', 'left'),
      edge('e3', 'ed-os-3', 'n1', 'n4'),
      edge('e4', 'ed-os-4', 'n1', 'n5'),
      edge('e5', 'ed-os-5', 'n1', 'n6'),
      edge('e6', 'ed-os-6', 'n4', 'n7'),
    ],
    briefing: brief(
      'A food-delivery Order moves through PLACED, ACCEPTED, PREPARING, OUT_FOR_DELIVERY, DELIVERED or CANCELLED. All of this lives in changeStatus: a large if/else chain that both validates the transition and fires side effects (assign driver, capture or refund payment, send notifications).',
      'Illegal transitions are only guarded by conditions scattered through the chain, and each new status (REJECTED, READY_FOR_PICKUP) forces edits to every branch. The side effects are interleaved with validation, which hides bugs.',
      'Redesign with the State pattern: let each state decide which transitions are valid and what happens on entry. Order should hold a current state and delegate. Preserve every existing side effect and legal transition.',
      'Map out the status transitions first on paper, then see which of DispatchService, PaymentService and NotificationService each state touches. Keep those external collaborators intact.',
    ),
    requirements: [
      'Valid status transitions only',
      'Driver assignment when dispatched',
      'Payment capture on accept, refund on cancel',
      'Customer and restaurant notifications',
      'Cancellation rules by state',
    ],
    flows: [
      {
        id: 'accept-and-prepare',
        label: 'Accept And Prepare',
        steps: ['Capture payment', 'Notify restaurant', 'Move to preparing'],
        mustKeepElementNames: ['Order', 'OrderStatus'],
        mustReach: [
          { from: 'Order', to: 'PaymentService' },
          { from: 'Order', to: 'NotificationService' },
        ],
        mustHavePathTopics: ['payment', 'accept', 'notify'],
      },
      {
        id: 'dispatch-and-deliver',
        label: 'Dispatch And Deliver',
        steps: ['Assign driver', 'Mark out for delivery', 'Mark delivered', 'Notify customer'],
        mustReach: [
          { from: 'Order', to: 'DispatchService' },
          { from: 'DispatchService', to: 'DriverPool' },
          { from: 'Order', to: 'NotificationService' },
        ],
        mustHavePathTopics: ['driver', 'dispatch', 'deliver'],
      },
      {
        id: 'cancel-order',
        label: 'Cancel Order',
        steps: ['Check cancellation allowed in current state', 'Refund payment', 'Release driver', 'Notify'],
        mustReach: [
          { from: 'Order', to: 'PaymentService' },
          { from: 'Order', to: 'DispatchService' },
        ],
        mustHavePathTopics: ['cancel', 'refund', 'state'],
      },
    ],
    forbidDeleteElementNames: ['Order', 'OrderItem', 'DispatchService', 'PaymentService', 'NotificationService'],
    modelHints: ['OrderState', 'PlacedState', 'PreparingState', 'CancelledState'],
  }),
]
