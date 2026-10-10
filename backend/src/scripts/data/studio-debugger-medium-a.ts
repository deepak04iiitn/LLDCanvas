import { pack, node, edge, pos, type DebuggerPackSeed } from '../seed-studio-debugger-lib'

export const MEDIUM_A: DebuggerPackSeed[] = [
  // ── 134 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-bookmyshow-seat-lock',
    title: 'Show Seat Booking Path',
    difficulty: 'medium',
    order: 134,
    description:
      'A ticketing backend lets Booking flip seat state directly. Find the concurrency and responsibility smells before opening night.',
    tags: ['booking', 'concurrency', 'srp', 'coupling'],
    briefing:
      'You are reviewing the seat booking flow of a movie ticketing platform. Thousands of users hit popular shows at the same moment. Review the diagram as a senior interviewer would: look at who owns seat state and how many jobs Booking is doing.',
    requirement:
      'Identify the architectural issues, then repair the design: introduce a SeatLock abstraction that owns temporary seat holds so Booking no longer mutates Seat directly, and split non-booking concerns out of Booking.',
    nodes: [
      node('n-show', 'el-show', 'Show', pos(0, 0), ['getSeats', 'getStartTime'], [
        { name: 'showId', type: 'String' },
        { name: 'movie', type: 'String' },
      ]),
      node('n-booking', 'el-booking', 'Booking', pos(1, 0), [
        'bookSeats',
        'chargeCard',
        'sendConfirmationSms',
        'cancel',
      ], [
        { name: 'bookingId', type: 'String' },
        { name: 'seats', type: 'List<Seat>' },
      ]),
      node('n-seat', 'el-seat', 'Seat', pos(2, 0), ['getLabel'], [
        { name: 'label', type: 'String' },
        { name: 'booked', type: 'boolean', visibility: 'public' },
      ]),
      node('n-user', 'el-user', 'User', pos(0, 1), ['getEmail'], [
        { name: 'userId', type: 'String' },
        { name: 'phone', type: 'String' },
      ]),
      node('n-payment', 'el-payment', 'PaymentService', pos(1, 1), ['charge', 'refund']),
      node('n-sms', 'el-sms', 'SmsClient', pos(2, 1), ['send']),
    ],
    edges: [
      edge('e-show-seat', 'ed-show-seat', 'n-show', 'n-seat', 'composition'),
      edge('e-booking-show', 'ed-booking-show', 'n-booking', 'n-show', 'association'),
      edge('e-booking-seat', 'ed-booking-seat', 'n-booking', 'n-seat', 'dependency'),
      edge('e-booking-user', 'ed-booking-user', 'n-booking', 'n-user', 'association'),
      edge('e-booking-payment', 'ed-booking-payment', 'n-booking', 'n-payment', 'dependency'),
      edge('e-booking-sms', 'ed-booking-sms', 'n-booking', 'n-sms', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-bms-coupling',
        elementIds: ['ed-booking-seat', 'el-seat'],
        category: 'Tight Coupling',
        aliases: ['Poor Encapsulation', 'Race Condition'],
        explanationKeywords: ['seat', 'booked', 'directly', 'lock', 'concurrent', 'race', 'double booking'],
        modelAnswer:
          'Booking writes seat.booked directly with no reservation step, so two users can book the same seat concurrently. Introduce a SeatLock (hold with expiry) that Booking requests, and hide Seat state behind it.',
        hints: [
          'Look at how Booking changes Seat and who else could change it at the same time.',
          'There is no step between "user selected a seat" and "seat is booked".',
          'Introduce a SeatLock that holds seats temporarily before confirmation.',
        ],
      },
      {
        id: 'iss-bms-srp',
        elementIds: ['el-booking'],
        category: 'SRP Violation',
        aliases: ['God Object'],
        explanationKeywords: ['booking', 'payment', 'sms', 'notification', 'multiple', 'responsibilities'],
        modelAnswer:
          'Booking handles seat reservation, card charging and SMS confirmation. Payment and notification are separate reasons to change and should be delegated to collaborators or orchestrated by a service.',
        hints: [
          'Read the method list of Booking top to bottom.',
          'chargeCard and sendConfirmationSms are not booking logic.',
          'Move payment and notification out; keep Booking about the reservation itself.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['SeatLock'] },
  }),

  // ── 135 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-uber-no-user-base',
    title: 'Ride Participant Model',
    difficulty: 'medium',
    order: 135,
    description:
      'Drivers and riders share most of their fields, yet the model treats them as unrelated and RideService branches on type.',
    tags: ['ride-sharing', 'duplication', 'ocp', 'inheritance'],
    briefing:
      'A ride-hailing service models its participants. Product keeps adding new participant kinds (fleet manager, guest rider). Review how participants are modelled and how services consume them.',
    requirement:
      'Identify the issues, then repair the model: introduce a User base type for shared identity data, and remove type-branching from RideService so new participant kinds need no edits there.',
    nodes: [
      node('n-driver', 'el-driver', 'Driver', pos(0, 0), ['acceptRide', 'getLicense'], [
        { name: 'id', type: 'String' },
        { name: 'name', type: 'String' },
        { name: 'phone', type: 'String' },
        { name: 'licenseNo', type: 'String' },
      ]),
      node('n-service', 'el-ride-service', 'RideService', pos(1, 0), [
        'requestRide',
        'notifyParticipant',
        'getDisplayName',
      ]),
      node('n-rider', 'el-rider', 'Rider', pos(2, 0), ['requestRide', 'getPaymentMethod'], [
        { name: 'id', type: 'String' },
        { name: 'name', type: 'String' },
        { name: 'phone', type: 'String' },
        { name: 'paymentMethod', type: 'String' },
      ]),
      node('n-vehicle', 'el-vehicle', 'Vehicle', pos(0, 1), ['getPlate'], [
        { name: 'plate', type: 'String' },
      ]),
      node('n-ride', 'el-ride', 'Ride', pos(1, 1), ['start', 'complete'], [
        { name: 'status', type: 'String' },
      ]),
      node('n-fare', 'el-fare', 'FareCalculator', pos(2, 1), ['estimate']),
    ],
    edges: [
      edge('e-driver-vehicle', 'ed-driver-vehicle', 'n-driver', 'n-vehicle', 'association'),
      edge('e-service-driver', 'ed-service-driver', 'n-service', 'n-driver', 'dependency'),
      edge('e-service-rider', 'ed-service-rider', 'n-service', 'n-rider', 'dependency'),
      edge('e-service-ride', 'ed-service-ride', 'n-service', 'n-ride', 'dependency'),
      edge('e-ride-fare', 'ed-ride-fare', 'n-ride', 'n-fare', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-uber-dup',
        elementIds: ['el-driver', 'el-rider'],
        category: 'Other',
        aliases: ['Unnecessary Abstraction', 'Duplication', 'Missing Abstraction', 'Code Duplication'],
        explanationKeywords: ['duplicate', 'id', 'name', 'phone', 'user', 'base', 'shared', 'common'],
        modelAnswer:
          'Driver and Rider repeat id, name and phone with no shared parent. A User base class (or interface) should hold common identity data and each role adds only its own fields.',
        hints: [
          'Compare the attribute lists of Driver and Rider.',
          'Three of the four fields on each are identical.',
          'Extract a User abstraction that both roles extend.',
        ],
      },
      {
        id: 'iss-uber-ocp',
        elementIds: ['el-ride-service', 'ed-service-driver', 'ed-service-rider'],
        category: 'OCP Violation',
        aliases: ['Tight Coupling', 'DIP Violation'],
        explanationKeywords: ['switch', 'instanceof', 'type', 'driver', 'rider', 'new', 'extend', 'polymorphism'],
        modelAnswer:
          'RideService depends on both concrete participants and branches on which one it received in notifyParticipant and getDisplayName. Adding a new participant kind forces edits here. Depend on User and use polymorphism.',
        hints: [
          'Why does RideService have edges to both Driver and Rider?',
          'What happens when a FleetManager is added?',
          'Make RideService depend on a single User abstraction.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['User'] },
  }),

  // ── 136 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-lru-hardcoded',
    title: 'Cache Eviction Path',
    difficulty: 'medium',
    order: 136,
    description:
      'A cache that only knows LRU. Product wants LFU and TTL next quarter. Review how eviction is wired in.',
    tags: ['cache', 'strategy', 'ocp'],
    briefing:
      'An in-memory cache library is used by several services. Teams are now asking for LFU and time-based eviction. Review how the Cache decides what to remove.',
    requirement:
      'Identify the issues, then repair the design: introduce an EvictionStrategy abstraction so Cache can switch policies without modification.',
    nodes: [
      node('n-client', 'el-client', 'CacheClient', pos(0, 0), ['main']),
      node('n-cache', 'el-cache', 'Cache', pos(1, 0), [
        'get',
        'put',
        'evictLeastRecentlyUsed',
        'touch',
      ], [
        { name: 'capacity', type: 'int' },
        { name: 'entries', type: 'Map<String, CacheEntry>' },
      ]),
      node('n-entry', 'el-entry', 'CacheEntry', pos(2, 0), ['getValue'], [
        { name: 'key', type: 'String' },
        { name: 'value', type: 'Object' },
        { name: 'lastAccess', type: 'long' },
      ]),
      node('n-order', 'el-order', 'AccessOrderList', pos(1, 1), ['moveToFront', 'removeTail'], [
        { name: 'head', type: 'Node' },
        { name: 'tail', type: 'Node' },
      ]),
      node('n-stats', 'el-stats', 'CacheStats', pos(0, 1), ['recordHit', 'recordMiss']),
    ],
    edges: [
      edge('e-client-cache', 'ed-client-cache', 'n-client', 'n-cache', 'dependency'),
      edge('e-cache-entry', 'ed-cache-entry', 'n-cache', 'n-entry', 'composition'),
      edge('e-cache-order', 'ed-cache-order', 'n-cache', 'n-order', 'composition'),
      edge('e-cache-stats', 'ed-cache-stats', 'n-cache', 'n-stats', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-lru-ocp',
        elementIds: ['el-cache'],
        category: 'OCP Violation',
        aliases: ['Pattern Misuse'],
        explanationKeywords: ['lru', 'evict', 'hardcoded', 'policy', 'lfu', 'modify', 'strategy'],
        modelAnswer:
          'Cache bakes in evictLeastRecentlyUsed, so adding LFU or TTL means editing Cache. Eviction should be a pluggable policy behind an EvictionStrategy interface.',
        hints: [
          'Look at the name of the eviction method on Cache.',
          'What would you edit to support LFU?',
          'Extract an EvictionStrategy that Cache delegates to.',
        ],
      },
      {
        id: 'iss-lru-pattern',
        elementIds: ['ed-cache-order', 'el-order'],
        category: 'Pattern Misuse',
        aliases: ['Tight Coupling', 'OCP Violation'],
        explanationKeywords: ['composition', 'access order', 'list', 'concrete', 'strategy', 'policy', 'owned'],
        modelAnswer:
          'The recency list is owned by Cache through composition, welding one policy data structure into the cache. It should belong to an LRU strategy implementation that Cache only sees through the interface.',
        hints: [
          'Why does Cache own an AccessOrderList?',
          'Only one eviction policy needs an ordering list.',
          'Move the list inside an LruEviction implementation of EvictionStrategy.',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['EvictionStrategy'],
      forbidDirectEdges: [{ from: 'Cache', to: 'AccessOrderList' }],
    },
  }),

  // ── 137 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-splitwise-expense-god',
    title: 'Expense Split Engine',
    difficulty: 'medium',
    order: 137,
    description:
      'Expense does everything from splitting to FX conversion and reminders. Group quietly does the same for balances.',
    tags: ['splitwise', 'god-object', 'srp'],
    briefing:
      'A bill-splitting app lets groups share costs across currencies. Every new feature request lands in Expense. Review where responsibilities live.',
    requirement:
      'Identify the issues, then repair the design: pull settlement logic into a SettlementService and keep Expense focused on describing a shared cost.',
    nodes: [
      node('n-user', 'el-user', 'User', pos(0, 0), ['getName'], [
        { name: 'userId', type: 'String' },
        { name: 'email', type: 'String' },
      ]),
      node('n-expense', 'el-expense', 'Expense', pos(1, 0), [
        'splitEqually',
        'splitByPercent',
        'convertCurrency',
        'settleUp',
        'notifyParticipants',
      ], [
        { name: 'amount', type: 'double' },
        { name: 'currency', type: 'String' },
        { name: 'paidBy', type: 'User' },
      ]),
      node('n-split', 'el-split', 'Split', pos(2, 0), ['getShare'], [
        { name: 'user', type: 'User' },
        { name: 'share', type: 'double' },
      ]),
      node('n-group', 'el-group', 'Group', pos(0, 1), [
        'addExpense',
        'simplifyDebts',
        'sendReminders',
      ], [
        { name: 'members', type: 'List<User>' },
        { name: 'expenses', type: 'List<Expense>' },
      ]),
      node('n-fx', 'el-fx', 'FxRateProvider', pos(1, 1), ['getRate']),
      node('n-email', 'el-email', 'EmailSender', pos(2, 1), ['send']),
    ],
    edges: [
      edge('e-expense-user', 'ed-expense-user', 'n-expense', 'n-user', 'association'),
      edge('e-expense-split', 'ed-expense-split', 'n-expense', 'n-split', 'composition'),
      edge('e-group-user', 'ed-group-user', 'n-group', 'n-user', 'aggregation'),
      edge('e-group-expense', 'ed-group-expense', 'n-group', 'n-expense', 'aggregation'),
      edge('e-expense-fx', 'ed-expense-fx', 'n-expense', 'n-fx', 'dependency'),
      edge('e-expense-email', 'ed-expense-email', 'n-expense', 'n-email', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-split-god',
        elementIds: ['el-expense'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['expense', 'split', 'settle', 'currency', 'notify', 'too many', 'responsibilities'],
        modelAnswer:
          'Expense computes splits, converts currency, settles debts and sends notifications. It is a God Object; extract split strategies, an FX converter, a SettlementService and a notifier.',
        hints: [
          'Count the unrelated verbs in the Expense method list.',
          'Which of them need an FX provider or an email sender?',
          'A cost record should not know how to settle or notify.',
        ],
      },
      {
        id: 'iss-split-srp',
        elementIds: ['el-group'],
        category: 'SRP Violation',
        aliases: ['God Object'],
        explanationKeywords: ['group', 'simplify', 'debts', 'reminders', 'membership', 'balance'],
        modelAnswer:
          'Group manages membership and expense collection but also simplifies debts and sends reminders. Debt simplification belongs in a SettlementService and reminders in a notifier.',
        hints: [
          'Group should be about membership and its expenses.',
          'simplifyDebts is an algorithm, sendReminders is delivery.',
          'Delegate both to dedicated services.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['SettlementService'] },
  }),

  // ── 138 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-chess-board-validates',
    title: 'Chess Move Validation',
    difficulty: 'medium',
    order: 138,
    description:
      'Board switches on piece type to validate every move. Adding a variant piece means editing the board.',
    tags: ['chess', 'polymorphism', 'ocp'],
    briefing:
      'A chess engine is being extended for fairy-chess variants with custom pieces. Review how move rules are organised.',
    requirement:
      'Identify the issues, then repair the design: introduce per-piece types such as Pawn so each piece validates its own moves, and stop Board from switching on piece type.',
    nodes: [
      node('n-game', 'el-game', 'Game', pos(0, 0), ['makeMove', 'isCheckmate'], [
        { name: 'turn', type: 'Color' },
      ]),
      node('n-board', 'el-board', 'Board', pos(1, 0), [
        'isValidMove',
        'validatePawn',
        'validateKnight',
        'validateRook',
        'movePiece',
      ], [
        { name: 'squares', type: 'Square[][]' },
      ]),
      node('n-piece', 'el-piece', 'Piece', pos(2, 0), ['getType', 'getColor'], [
        { name: 'type', type: 'PieceType' },
        { name: 'color', type: 'Color' },
      ]),
      node('n-type', 'el-piece-type', 'PieceType', pos(2, 1), [], [
        { name: 'PAWN', type: 'int', visibility: 'public' },
        { name: 'KNIGHT', type: 'int', visibility: 'public' },
        { name: 'ROOK', type: 'int', visibility: 'public' },
      ]),
      node('n-square', 'el-square', 'Square', pos(1, 1), ['isEmpty'], [
        { name: 'row', type: 'int' },
        { name: 'col', type: 'int' },
      ]),
      node('n-move', 'el-move', 'Move', pos(0, 1), ['getFrom', 'getTo'], [
        { name: 'from', type: 'Square' },
        { name: 'to', type: 'Square' },
      ]),
    ],
    edges: [
      edge('e-game-board', 'ed-game-board', 'n-game', 'n-board', 'composition'),
      edge('e-board-square', 'ed-board-square', 'n-board', 'n-square', 'composition'),
      edge('e-square-piece', 'ed-square-piece', 'n-square', 'n-piece', 'association'),
      edge('e-piece-type', 'ed-piece-type', 'n-piece', 'n-type', 'dependency'),
      edge('e-board-type', 'ed-board-type', 'n-board', 'n-type', 'dependency'),
      edge('e-game-move', 'ed-game-move', 'n-game', 'n-move', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-chess-ocp',
        elementIds: ['el-board', 'ed-board-type'],
        category: 'OCP Violation',
        aliases: ['Pattern Misuse', 'Tight Coupling'],
        explanationKeywords: ['board', 'switch', 'type', 'validate', 'piece', 'new piece', 'modify'],
        modelAnswer:
          'Board.isValidMove switches on PieceType and carries validatePawn/Knight/Rook helpers. Every new piece forces a Board edit. Move validation belongs on each piece via polymorphism.',
        hints: [
          'Why does Board have validate methods named after specific pieces?',
          'What must change to add an Archbishop?',
          'Let each piece answer "is this move legal?" itself.',
        ],
      },
      {
        id: 'iss-chess-pattern',
        elementIds: ['el-piece', 'el-piece-type'],
        category: 'Pattern Misuse',
        aliases: ['OCP Violation', 'Other'],
        explanationKeywords: ['type code', 'enum', 'flag', 'inheritance', 'subclass', 'polymorphism', 'piece'],
        modelAnswer:
          'Piece is a single class tagged with a PieceType code instead of a polymorphic hierarchy. Type codes push behaviour into switch statements elsewhere; use an abstract Piece with Pawn, Knight, Rook subclasses.',
        hints: [
          'What is Piece distinguishing itself with?',
          'Type codes tend to cause switch statements in other classes.',
          'Replace the type code with subclasses that override move rules.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['Pawn'] },
  }),

  // ── 139 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-twitter-tweet-god',
    title: 'Tweet Pipeline',
    difficulty: 'medium',
    order: 139,
    description:
      'A Tweet that uploads media, parses hashtags, fans out to followers and counts likes.',
    tags: ['twitter', 'god-object', 'fanout'],
    briefing:
      'A microblogging backend publishes tweets to millions of followers. Review how the Tweet class participates in publishing.',
    requirement:
      'Identify the issues, then repair the design: introduce a FanoutService that distributes tweets to timelines, and slim Tweet down to content and identity.',
    nodes: [
      node('n-user', 'el-user', 'User', pos(0, 0), ['follow', 'getFollowers'], [
        { name: 'userId', type: 'String' },
        { name: 'handle', type: 'String' },
      ]),
      node('n-tweet', 'el-tweet', 'Tweet', pos(1, 0), [
        'uploadMedia',
        'extractHashtags',
        'fanoutToFollowers',
        'addLike',
        'countLikes',
      ], [
        { name: 'text', type: 'String' },
        { name: 'mediaUrls', type: 'List<String>' },
        { name: 'likes', type: 'Set<String>' },
      ]),
      node('n-media', 'el-media', 'MediaStore', pos(2, 0), ['upload']),
      node('n-hashtag', 'el-hashtag', 'HashtagIndex', pos(2, 1), ['index', 'search']),
      node('n-timeline', 'el-timeline', 'Timeline', pos(0, 1), ['push', 'getPage'], [
        { name: 'items', type: 'List<Tweet>' },
      ]),
      node('n-follow', 'el-follow', 'FollowGraph', pos(1, 1), ['followersOf']),
    ],
    edges: [
      edge('e-tweet-user', 'ed-tweet-user', 'n-tweet', 'n-user', 'association'),
      edge('e-tweet-media', 'ed-tweet-media', 'n-tweet', 'n-media', 'dependency'),
      edge('e-tweet-hashtag', 'ed-tweet-hashtag', 'n-tweet', 'n-hashtag', 'dependency'),
      edge('e-tweet-timeline', 'ed-tweet-timeline', 'n-tweet', 'n-timeline', 'dependency'),
      edge('e-tweet-follow', 'ed-tweet-follow', 'n-tweet', 'n-follow', 'dependency'),
      edge('e-timeline-user', 'ed-timeline-user', 'n-timeline', 'n-user', 'association'),
    ],
    expectedIssues: [
      {
        id: 'iss-tw-god',
        elementIds: ['el-tweet'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['tweet', 'media', 'hashtag', 'fanout', 'likes', 'responsibilities', 'too many'],
        modelAnswer:
          'Tweet uploads media, parses hashtags, fans out to followers and tracks likes. A tweet is a content record; media, indexing, fanout and likes each deserve their own collaborator.',
        hints: [
          'List what Tweet knows about besides its own text.',
          'It has dependencies on four different subsystems.',
          'Move fanout, media handling and like tracking to dedicated components.',
        ],
      },
      {
        id: 'iss-tw-coupling',
        elementIds: ['ed-tweet-timeline', 'ed-tweet-follow'],
        category: 'Tight Coupling',
        aliases: ['SRP Violation', 'God Object'],
        explanationKeywords: ['fanout', 'timeline', 'follow', 'graph', 'coupled', 'publish', 'push'],
        modelAnswer:
          'Tweet reaches into FollowGraph and writes into each Timeline itself, coupling a domain entity to delivery infrastructure. A FanoutService should orchestrate that, possibly asynchronously.',
        hints: [
          'Why does a Tweet need to know about FollowGraph and Timeline?',
          'Changing the fanout strategy should not touch Tweet.',
          'Introduce a FanoutService between publishing and timelines.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['FanoutService'] },
  }),

  // ── 140 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-elevator-no-request',
    title: 'Elevator Request Handling',
    difficulty: 'medium',
    order: 140,
    description:
      'Controller keeps up[] and down[] lists and a hardcoded scan loop. No request object, no pluggable scheduling.',
    tags: ['elevator', 'strategy', 'scheduling'],
    briefing:
      'A building management system controls several elevators. The team wants to try different dispatch algorithms for peak hours. Review how requests are modelled and dispatched.',
    requirement:
      'Identify the issues, then repair the design: introduce an ElevatorRequest type and a scheduling strategy so dispatch policies can be swapped without editing the controller.',
    nodes: [
      node('n-panel', 'el-panel', 'FloorPanel', pos(0, 0), ['pressUp', 'pressDown']),
      node('n-controller', 'el-controller', 'ElevatorController', pos(1, 0), [
        'addUpRequest',
        'addDownRequest',
        'runScanLoop',
        'pickElevator',
      ], [
        { name: 'upStops', type: 'int[]' },
        { name: 'downStops', type: 'int[]' },
      ]),
      node('n-elevator', 'el-elevator', 'Elevator', pos(2, 0), ['moveTo', 'openDoor', 'closeDoor'], [
        { name: 'currentFloor', type: 'int' },
        { name: 'direction', type: 'String' },
      ]),
      node('n-door', 'el-door', 'Door', pos(2, 1), ['open', 'close']),
      node('n-display', 'el-display', 'FloorDisplay', pos(1, 1), ['show']),
      node('n-building', 'el-building', 'Building', pos(0, 1), ['getFloors'], [
        { name: 'floors', type: 'int' },
      ]),
    ],
    edges: [
      edge('e-panel-controller', 'ed-panel-controller', 'n-panel', 'n-controller', 'dependency'),
      edge('e-panel-elevator', 'ed-panel-elevator', 'n-panel', 'n-elevator', 'dependency'),
      edge('e-controller-elevator', 'ed-controller-elevator', 'n-controller', 'n-elevator', 'aggregation'),
      edge('e-elevator-door', 'ed-elevator-door', 'n-elevator', 'n-door', 'composition'),
      edge('e-controller-display', 'ed-controller-display', 'n-controller', 'n-display', 'dependency'),
      edge('e-building-controller', 'ed-building-controller', 'n-building', 'n-controller', 'association'),
    ],
    expectedIssues: [
      {
        id: 'iss-elev-pattern',
        elementIds: ['el-controller'],
        category: 'Pattern Misuse',
        aliases: ['OCP Violation', 'Missing Abstraction', 'Other'],
        explanationKeywords: ['up', 'down', 'array', 'request', 'strategy', 'scheduling', 'scan', 'hardcoded'],
        modelAnswer:
          'ElevatorController tracks raw up/down int arrays and hardcodes a scan loop. Requests are not first-class (no ElevatorRequest) and dispatch is not a Strategy, so new algorithms require rewriting the controller.',
        hints: [
          'What type represents "someone pressed a button at floor 7 going up"?',
          'Where would you plug in a different dispatch algorithm?',
          'Introduce ElevatorRequest and a SchedulingStrategy.',
        ],
      },
      {
        id: 'iss-elev-coupling',
        elementIds: ['ed-panel-elevator'],
        category: 'Tight Coupling',
        aliases: ['Pattern Misuse', 'DIP Violation'],
        explanationKeywords: ['panel', 'elevator', 'bypass', 'directly', 'controller', 'dispatch'],
        modelAnswer:
          'FloorPanel talks to a concrete Elevator as well as the controller, bypassing dispatch. Panels should only submit requests; the controller or strategy decides which elevator responds.',
        hints: [
          'FloorPanel has two outgoing edges. Is one of them suspicious?',
          'A button press should not pick a specific car.',
          'Remove the direct edge and send an ElevatorRequest to the controller.',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['ElevatorRequest'],
      forbidDirectEdges: [{ from: 'FloorPanel', to: 'Elevator' }],
    },
  }),

  // ── 141 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-restaurant-pos-god',
    title: 'Restaurant Order Desk',
    difficulty: 'medium',
    order: 141,
    description:
      'Order tracks the table, computes tax and discounts, talks to the kitchen and prints receipts.',
    tags: ['restaurant', 'pos', 'god-object'],
    briefing:
      'A restaurant point-of-sale handles dine-in orders. Regional tax rules and promotions change often. Review where those changes would land.',
    requirement:
      'Identify the issues, then repair the design: extract a PricingService for tax and discount computation and keep Order about items and status.',
    nodes: [
      node('n-table', 'el-table', 'Table', pos(0, 0), ['getNumber'], [
        { name: 'number', type: 'int' },
        { name: 'seats', type: 'int' },
      ]),
      node('n-order', 'el-order', 'Order', pos(1, 0), [
        'assignTable',
        'addItem',
        'calculateTax',
        'applyDiscount',
        'sendToKitchen',
        'printReceipt',
      ], [
        { name: 'items', type: 'List<MenuItem>' },
        { name: 'table', type: 'Table' },
        { name: 'taxRate', type: 'double' },
      ]),
      node('n-item', 'el-item', 'MenuItem', pos(2, 0), ['getPrice'], [
        { name: 'name', type: 'String' },
        { name: 'price', type: 'double' },
      ]),
      node('n-kitchen', 'el-kitchen', 'KitchenDisplay', pos(0, 1), ['enqueueTicket']),
      node('n-printer', 'el-printer', 'ThermalPrinter', pos(1, 1), ['print']),
      node('n-waiter', 'el-waiter', 'Waiter', pos(2, 1), ['takeOrder']),
    ],
    edges: [
      edge('e-order-table', 'ed-order-table', 'n-order', 'n-table', 'association'),
      edge('e-order-item', 'ed-order-item', 'n-order', 'n-item', 'aggregation'),
      edge('e-order-kitchen', 'ed-order-kitchen', 'n-order', 'n-kitchen', 'dependency'),
      edge('e-order-printer', 'ed-order-printer', 'n-order', 'n-printer', 'dependency'),
      edge('e-waiter-order', 'ed-waiter-order', 'n-waiter', 'n-order', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-pos-god',
        elementIds: ['el-order'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['order', 'tax', 'discount', 'kitchen', 'receipt', 'table', 'responsibilities'],
        modelAnswer:
          'Order manages table assignment, items, tax, discounts, kitchen dispatch and receipt printing. Pricing rules, kitchen routing and receipt rendering change independently and belong in separate classes.',
        hints: [
          'Group the Order methods by reason to change.',
          'Tax and discount rules change with regulation and marketing.',
          'Extract pricing, kitchen dispatch and receipts.',
        ],
      },
      {
        id: 'iss-pos-coupling',
        elementIds: ['ed-order-kitchen', 'ed-order-printer'],
        category: 'Tight Coupling',
        aliases: ['DIP Violation', 'SRP Violation'],
        explanationKeywords: ['kitchen', 'printer', 'concrete', 'hardware', 'interface', 'depends'],
        modelAnswer:
          'Order depends directly on concrete KitchenDisplay and ThermalPrinter devices, so domain logic is welded to hardware. Hide them behind interfaces and let a service orchestrate.',
        hints: [
          'Domain classes should not know about printer hardware.',
          'Could you test Order without a ThermalPrinter?',
          'Introduce interfaces and move orchestration out of Order.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['PricingService'] },
  }),

  // ── 142 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-airline-route-extends-flight',
    title: 'Flight Route Model',
    difficulty: 'medium',
    order: 142,
    description:
      'FlightRoute extends Flight although a route is not a kind of flight. Flight itself blends route and schedule data.',
    tags: ['airline', 'inheritance', 'composition'],
    briefing:
      'An airline planning tool models routes (Delhi to London) and the individual flights that operate them each day. Review the class hierarchy.',
    requirement:
      'Identify the issues, then repair the design: replace the inheritance with composition so that a Flight refers to a FlightRoute rather than FlightRoute extending Flight.',
    nodes: [
      node('n-flight', 'el-flight', 'Flight', pos(0, 0), [
        'getDepartureTime',
        'availableSeats',
        'getDistanceKm',
        'getOrigin',
      ], [
        { name: 'flightNo', type: 'String' },
        { name: 'origin', type: 'Airport' },
        { name: 'destination', type: 'Airport' },
        { name: 'distanceKm', type: 'int' },
        { name: 'departureTime', type: 'DateTime' },
        { name: 'seatsLeft', type: 'int' },
      ]),
      node('n-route', 'el-flight-route', 'FlightRoute', pos(0, 1), ['getStops', 'addStop'], [
        { name: 'stops', type: 'List<Airport>' },
      ]),
      node('n-airport', 'el-airport', 'Airport', pos(1, 0), ['getCode'], [
        { name: 'code', type: 'String' },
      ]),
      node('n-aircraft', 'el-aircraft', 'Aircraft', pos(2, 0), ['getCapacity']),
      node('n-schedule', 'el-schedule', 'Schedule', pos(1, 1), ['addFlight', 'getFlightsOn']),
      node('n-passenger', 'el-passenger', 'Passenger', pos(2, 1), ['getName']),
    ],
    edges: [
      edge('e-route-flight', 'ed-route-flight', 'n-route', 'n-flight', 'inheritance'),
      edge('e-flight-airport', 'ed-flight-airport', 'n-flight', 'n-airport', 'association'),
      edge('e-flight-aircraft', 'ed-flight-aircraft', 'n-flight', 'n-aircraft', 'association'),
      edge('e-schedule-flight', 'ed-schedule-flight', 'n-schedule', 'n-flight', 'aggregation'),
      edge('e-flight-passenger', 'ed-flight-passenger', 'n-flight', 'n-passenger', 'association'),
    ],
    expectedIssues: [
      {
        id: 'iss-air-inherit',
        elementIds: ['ed-route-flight', 'el-flight-route'],
        category: 'Incorrect Inheritance',
        aliases: ['Inheritance Misuse', 'Composition over Inheritance'],
        explanationKeywords: ['route', 'flight', 'is-a', 'extends', 'inheritance', 'composition', 'liskov'],
        modelAnswer:
          'FlightRoute extends Flight, but a route is not a flight: it has no departure time or seats yet inherits them. Model it as a standalone FlightRoute that a Flight references (has-a).',
        hints: [
          'Does "a FlightRoute is a Flight" hold in the real world?',
          'What inherited members make no sense on a route?',
          'Replace the inheritance edge with composition or association.',
        ],
      },
      {
        id: 'iss-air-srp',
        elementIds: ['el-flight'],
        category: 'SRP Violation',
        aliases: ['God Object', 'Other'],
        explanationKeywords: ['flight', 'route', 'origin', 'destination', 'distance', 'schedule', 'mixes'],
        modelAnswer:
          'Flight mixes static route data (origin, destination, distance) with per-day operational data (departure time, seats left). Route facts should live on FlightRoute and be shared by many Flights.',
        hints: [
          'Which Flight attributes are the same for every daily operation?',
          'Origin, destination and distance describe the route.',
          'Move route data into FlightRoute and reference it from Flight.',
        ],
      },
    ],
    verification: { forbidDirectEdges: [{ from: 'FlightRoute', to: 'Flight' }] },
  }),

  // ── 143 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-ecommerce-product-inventory',
    title: 'Product Inventory Blend',
    difficulty: 'medium',
    order: 143,
    description:
      'Product owns stock counts and warehouse placement. Catalog changes and stock changes collide.',
    tags: ['ecommerce', 'inventory', 'srp', 'coupling'],
    briefing:
      'An e-commerce platform keeps its catalog and stock in one place. The catalog team and the logistics team both ship changes to Product every sprint. Review the model.',
    requirement:
      'Identify the issues, then repair the design: introduce an Inventory abstraction that owns stock per warehouse, and keep Product as catalog data.',
    nodes: [
      node('n-category', 'el-category', 'Category', pos(0, 0), ['getName']),
      node('n-product', 'el-product', 'Product', pos(1, 0), [
        'getPrice',
        'updateDescription',
        'reserveStock',
        'restock',
        'moveToWarehouse',
      ], [
        { name: 'sku', type: 'String' },
        { name: 'price', type: 'double' },
        { name: 'stockCount', type: 'int' },
        { name: 'warehouseId', type: 'String' },
      ]),
      node('n-warehouse', 'el-warehouse', 'Warehouse', pos(2, 0), ['getLocation', 'getCapacity'], [
        { name: 'products', type: 'List<Product>' },
      ]),
      node('n-cart', 'el-cart', 'CartItem', pos(0, 1), ['getQuantity']),
      node('n-order', 'el-order', 'OrderService', pos(1, 1), ['placeOrder']),
      node('n-supplier', 'el-supplier', 'Supplier', pos(2, 1), ['deliver']),
    ],
    edges: [
      edge('e-product-category', 'ed-product-category', 'n-product', 'n-category', 'association'),
      edge('e-product-warehouse', 'ed-product-warehouse', 'n-product', 'n-warehouse', 'association'),
      edge('e-warehouse-product', 'ed-warehouse-product', 'n-warehouse', 'n-product', 'aggregation'),
      edge('e-cart-product', 'ed-cart-product', 'n-cart', 'n-product', 'association'),
      edge('e-order-product', 'ed-order-product', 'n-order', 'n-product', 'dependency'),
      edge('e-supplier-warehouse', 'ed-supplier-warehouse', 'n-supplier', 'n-warehouse', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-ecom-srp',
        elementIds: ['el-product'],
        category: 'SRP Violation',
        aliases: ['God Object', 'Tight Coupling'],
        explanationKeywords: ['product', 'stock', 'warehouse', 'catalog', 'inventory', 'reserve', 'responsibilities'],
        modelAnswer:
          'Product holds both catalog data (price, description) and inventory state (stockCount, warehouseId, reserve/restock). These change for different reasons; extract an Inventory component that tracks stock per warehouse.',
        hints: [
          'Which Product members belong to the catalog team and which to logistics?',
          'stockCount and warehouseId are inventory facts.',
          'Introduce Inventory and have it reference Product.',
        ],
      },
      {
        id: 'iss-ecom-coupling',
        elementIds: ['ed-product-warehouse', 'ed-warehouse-product'],
        category: 'Tight Coupling',
        aliases: ['Circular Dependency', 'SRP Violation'],
        explanationKeywords: ['product', 'warehouse', 'bidirectional', 'circular', 'mutual', 'coupled'],
        modelAnswer:
          'Product and Warehouse reference each other, so the catalog cannot be used without logistics and vice versa. A dedicated Inventory linking Product and Warehouse breaks the mutual dependency.',
        hints: [
          'Follow the arrows between Product and Warehouse.',
          'Why should a catalog item know where it is stored?',
          'Let an Inventory entity link a product to a warehouse and quantity.',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Inventory'],
      forbidDirectEdges: [{ from: 'Product', to: 'Warehouse' }],
    },
  }),

  // ── 144 ─────────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-hospital-patient-god',
    title: 'Patient Record Hub',
    difficulty: 'medium',
    order: 144,
    description:
      'Patient schedules appointments, prescribes drugs, bills, assigns rooms and orders lab tests.',
    tags: ['hospital', 'god-object', 'healthcare'],
    briefing:
      'A hospital management system keeps everything about a patient in one place. Compliance, billing and clinical teams all need to change different parts of it. Review the Patient class.',
    requirement:
      'Identify the issues, then repair the design: extract an AppointmentService and a BillingService so Patient only holds identity and medical record data.',
    nodes: [
      node('n-doctor', 'el-doctor', 'Doctor', pos(0, 0), ['getSpecialty'], [
        { name: 'doctorId', type: 'String' },
      ]),
      node('n-patient', 'el-patient', 'Patient', pos(1, 0), [
        'scheduleAppointment',
        'prescribeMedicine',
        'generateBill',
        'assignRoom',
        'orderLabTest',
      ], [
        { name: 'patientId', type: 'String' },
        { name: 'history', type: 'List<String>' },
        { name: 'balanceDue', type: 'double' },
      ]),
      node('n-room', 'el-room', 'Room', pos(2, 0), ['isAvailable', 'occupy'], [
        { name: 'number', type: 'int' },
      ]),
      node('n-lab', 'el-lab', 'LabReport', pos(0, 1), ['getResult']),
      node('n-medicine', 'el-medicine', 'Medicine', pos(1, 1), ['getDosage']),
      node('n-insurance', 'el-insurance', 'InsuranceProvider', pos(2, 1), ['claim']),
    ],
    edges: [
      edge('e-patient-doctor', 'ed-patient-doctor', 'n-patient', 'n-doctor', 'association'),
      edge('e-patient-room', 'ed-patient-room', 'n-patient', 'n-room', 'dependency'),
      edge('e-patient-lab', 'ed-patient-lab', 'n-patient', 'n-lab', 'dependency'),
      edge('e-patient-medicine', 'ed-patient-medicine', 'n-patient', 'n-medicine', 'dependency'),
      edge('e-patient-insurance', 'ed-patient-insurance', 'n-patient', 'n-insurance', 'dependency'),
    ],
    expectedIssues: [
      {
        id: 'iss-hosp-god',
        elementIds: ['el-patient'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['patient', 'schedule', 'prescribe', 'bill', 'room', 'lab', 'responsibilities'],
        modelAnswer:
          'Patient schedules appointments, prescribes medicine, generates bills, assigns rooms and orders lab tests. A patient is a record; scheduling, billing, admissions and diagnostics should be separate services.',
        hints: [
          'Which hospital departments would each edit Patient?',
          'Patient has outgoing dependencies to four unrelated subsystems.',
          'Extract AppointmentService, BillingService and similar collaborators.',
        ],
      },
      {
        id: 'iss-hosp-coupling',
        elementIds: ['ed-patient-room', 'ed-patient-insurance'],
        category: 'Tight Coupling',
        aliases: ['SRP Violation', 'DIP Violation'],
        explanationKeywords: ['room', 'insurance', 'patient', 'coupled', 'billing', 'admission', 'depends'],
        modelAnswer:
          'Patient is wired directly to Room and InsuranceProvider, so admissions and billing rules cannot change without touching the patient record. Route those interactions through admission and billing services.',
        hints: [
          'Why would a patient record know about insurers?',
          'Room allocation and claims are workflows, not patient data.',
          'Let services orchestrate Patient, Room and InsuranceProvider.',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['AppointmentService', 'BillingService'] },
  }),
]
