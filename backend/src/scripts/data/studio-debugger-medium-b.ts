import { pack, node, edge, pos, type DebuggerPackSeed } from '../seed-studio-debugger-lib'

function brief(classes: string[], start: string, methods: string[]): string {
  return (
    `This challenge is a broken UML sketch around: ${classes.join(', ')}.\n\n` +
    `Your job is to investigate — click classes and relationships, notice what feels overloaded, oddly connected, or hard to extend — then mark issues with a category and a short “why.”\n\n` +
    `Start by opening ${start} and reading its methods (${methods.join(', ')}).\n\n` +
    `Do not assume the answer from the title alone; use the diagram.`
  )
}

function req(n: number): string {
  return (
    `There are exactly ${n} design problems to find. Inspect the diagram, mark each with a category and a short “why,” ` +
    `then repair so the design is easier to extend without rewriting the same classes for every new case.`
  )
}

export const MEDIUM_B: DebuggerPackSeed[] = [
  // ─── 145 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-spotify-shuffle-ifelse',
    title: 'Playlist Shuffle Modes',
    difficulty: 'medium',
    order: 145,
    description: 'Find why adding a new shuffle mode forces edits to the Playlist class.',
    tags: ['music', 'Strategy', 'OCP'],
    nodes: [
      node('n1', 'el-playback-controller', 'PlaybackController', pos(0, 0), ['play', 'next', 'setShuffleMode']),
      node('n2', 'el-playlist', 'Playlist', pos(1, 0), ['shuffle', 'addTrack', 'getNext'], [
        { name: 'tracks', type: 'List<Track>' },
        { name: 'shuffleMode', type: 'string', visibility: 'public' },
      ]),
      node('n3', 'el-track', 'Track', pos(2, 0), ['getDuration'], [
        { name: 'title', type: 'string' },
        { name: 'artist', type: 'string' },
      ]),
      node('n4', 'el-audio-player', 'AudioPlayer', pos(0, 1), ['load', 'start', 'stop']),
      node('n5', 'el-user-library', 'UserLibrary', pos(1, 1), ['getPlaylists', 'createPlaylist']),
      node('n6', 'el-listening-history', 'ListeningHistory', pos(2, 1), ['getPlayCount', 'recordPlay']),
    ],
    edges: [
      edge('e1', 'ed-pc-playlist', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-pc-player', 'n1', 'n4', 'dependency'),
      edge('e3', 'ed-playlist-track', 'n2', 'n3', 'aggregation'),
      edge('e4', 'ed-library-playlist', 'n5', 'n2', 'aggregation'),
      edge('e5', 'ed-playlist-history', 'n2', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['PlaybackController', 'Playlist', 'Track', 'AudioPlayer', 'UserLibrary', 'ListeningHistory'],
      'Playlist',
      ['shuffle', 'addTrack', 'getNext'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-spotify-shuffle-ifelse-1',
        elementIds: ['el-playlist'],
        category: 'OCP Violation',
        aliases: ['Pattern Misuse'],
        explanationKeywords: ['shuffle', 'if', 'else', 'mode', 'strategy', 'new', 'modify'],
        modelAnswer:
          'Playlist.shuffle() branches with if/else on a mode string, so every new shuffle mode means editing Playlist — extract a ShuffleStrategy interface with one implementation per mode.',
        hints: [
          'Look at how Playlist decides which order to play tracks in.',
          'What must change in Playlist if you add “smart shuffle” or “by artist”?',
        ],
      },
      {
        id: 'iss-dbg-spotify-shuffle-ifelse-2',
        elementIds: ['ed-pc-playlist'],
        category: 'Tight Coupling',
        aliases: ['OCP Violation'],
        explanationKeywords: ['controller', 'mode', 'string', 'playlist', 'knows', 'strategy'],
        modelAnswer:
          'PlaybackController sets Playlist.shuffleMode with magic strings, coupling it to Playlist internals — it should inject a ShuffleStrategy object instead.',
        hints: [
          'What does PlaybackController pass into Playlist when the user taps shuffle?',
          'Is a string a good contract between these two classes?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['ShuffleStrategy'] },
  }),

  // ─── 146 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-food-delivery-status-if',
    title: 'Order Status Transitions',
    difficulty: 'medium',
    order: 146,
    description: 'Spot why order status handling is a giant conditional and what pattern is missing.',
    tags: ['food-delivery', 'State', 'Pattern Misuse'],
    nodes: [
      node('n1', 'el-order', 'Order', pos(0, 0), ['updateStatus', 'cancel', 'getStatus'], [
        { name: 'status', type: 'string', visibility: 'public' },
        { name: 'items', type: 'List<OrderItem>' },
      ]),
      node('n2', 'el-customer', 'Customer', pos(1, 0), ['placeOrder', 'trackOrder']),
      node('n3', 'el-restaurant', 'Restaurant', pos(2, 0), ['acceptOrder', 'prepare']),
      node('n4', 'el-driver', 'DeliveryDriver', pos(0, 1), ['assign', 'pickUp', 'deliver']),
      node('n5', 'el-notification', 'NotificationService', pos(1, 1), ['notify']),
      node('n6', 'el-refund', 'RefundService', pos(2, 1), ['refund']),
    ],
    edges: [
      edge('e1', 'ed-customer-order', 'n2', 'n1', 'association'),
      edge('e2', 'ed-order-restaurant', 'n1', 'n3', 'association'),
      edge('e3', 'ed-order-driver', 'n1', 'n4', 'dependency'),
      edge('e4', 'ed-order-notification', 'n1', 'n5', 'dependency'),
      edge('e5', 'ed-order-refund', 'n1', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['Order', 'Customer', 'Restaurant', 'DeliveryDriver', 'NotificationService', 'RefundService'],
      'Order',
      ['updateStatus', 'cancel', 'getStatus'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-food-delivery-status-if-1',
        elementIds: ['el-order'],
        category: 'Pattern Misuse',
        aliases: ['OCP Violation'],
        explanationKeywords: ['status', 'string', 'if', 'state', 'transition', 'orderstate'],
        modelAnswer:
          'Order stores status as a string and updateStatus() is a giant if-chain over transitions — the State pattern (OrderState with Placed/Preparing/OutForDelivery/Delivered) is missing.',
        hints: [
          'How does Order know which transitions are legal?',
          'What happens to updateStatus() when “Ready for pickup” is added?',
        ],
      },
      {
        id: 'iss-dbg-food-delivery-status-if-2',
        elementIds: ['ed-order-refund', 'ed-order-notification'],
        category: 'Tight Coupling',
        aliases: ['SRP Violation'],
        explanationKeywords: ['order', 'refund', 'notification', 'side', 'effects', 'transition'],
        modelAnswer:
          'Order directly triggers refunds and notifications from inside its transition branches; those side effects belong to state objects or event listeners, not to Order.',
        hints: [
          'Which services does Order call when moving between statuses?',
          'Should a data-holding Order know how refunds are processed?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['OrderState'] },
  }),

  // ─── 147 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-voting-no-ballot',
    title: 'Election Counting Path',
    difficulty: 'medium',
    order: 147,
    description: 'Discover why Election does too much and what concept is missing in the voting flow.',
    tags: ['voting', 'SRP', 'Ballot'],
    nodes: [
      node('n1', 'el-election', 'Election', pos(0, 0), ['castVote', 'tally', 'declareWinner', 'addCandidate'], [
        { name: 'candidates', type: 'List<Candidate>', visibility: 'public' },
        { name: 'counts', type: 'Map<string, int>', visibility: 'public' },
      ]),
      node('n2', 'el-candidate', 'Candidate', pos(1, 0), ['getName'], [{ name: 'name', type: 'string' }]),
      node('n3', 'el-voter-registry', 'VoterRegistry', pos(2, 0), ['isEligible', 'markVoted']),
      node('n4', 'el-voter', 'Voter', pos(0, 1), ['vote'], [{ name: 'voterId', type: 'string' }]),
      node('n5', 'el-results-publisher', 'ResultsPublisher', pos(1, 1), ['publish']),
      node('n6', 'el-audit-log', 'AuditLog', pos(2, 1), ['record']),
    ],
    edges: [
      edge('e1', 'ed-election-candidate', 'n1', 'n2', 'aggregation'),
      edge('e2', 'ed-election-registry', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-voter-election', 'n4', 'n1', 'dependency'),
      edge('e4', 'ed-publisher-election', 'n5', 'n1', 'dependency'),
      edge('e5', 'ed-election-audit', 'n1', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['Election', 'Candidate', 'VoterRegistry', 'Voter', 'ResultsPublisher', 'AuditLog'],
      'Election',
      ['castVote', 'tally', 'declareWinner', 'addCandidate'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-voting-no-ballot-1',
        elementIds: ['el-election'],
        category: 'SRP Violation',
        aliases: ['God Object'],
        explanationKeywords: ['election', 'candidates', 'counts', 'tally', 'responsibilities', 'ballot'],
        modelAnswer:
          'Election manages candidates, accepts votes, stores raw counts, tallies and declares the winner. Introduce a Ballot (and separate counting) so Election only coordinates the contest.',
        hints: [
          'List everything Election owns and every verb it performs.',
          'Is there an object that represents a single cast vote?',
        ],
      },
      {
        id: 'iss-dbg-voting-no-ballot-2',
        elementIds: ['ed-voter-election'],
        category: 'Tight Coupling',
        aliases: ['Poor Encapsulation'],
        explanationKeywords: ['voter', 'election', 'castvote', 'counts', 'ballot', 'directly'],
        modelAnswer:
          'Voter calls Election.castVote with a candidate id and Election mutates a public counts map — there is no Ballot object to carry and validate the vote, so counting is entangled with voting.',
        hints: [
          'What exactly does Voter hand to Election?',
          'Who can modify the vote counts after a vote is cast?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['Ballot'] },
  }),

  // ─── 148 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-parking-ticket-god',
    title: 'Parking Ticket Lifecycle',
    difficulty: 'medium',
    order: 148,
    description: 'Find the class that handles the whole parking lifecycle by itself.',
    tags: ['parking', 'God Object', 'SRP'],
    nodes: [
      node('n1', 'el-ticket', 'ParkingTicket', pos(0, 0), [
        'calculateFee',
        'payByCash',
        'payByCard',
        'printReceipt',
        'releaseSlot',
        'validateExit',
      ], [
        { name: 'plateNumber', type: 'string' },
        { name: 'entryTime', type: 'DateTime' },
        { name: 'feeAmount', type: 'decimal' },
        { name: 'paid', type: 'boolean' },
      ]),
      node('n2', 'el-slot', 'ParkingSlot', pos(1, 0), ['occupy', 'free']),
      node('n3', 'el-vehicle', 'Vehicle', pos(2, 0), ['getPlate'], [{ name: 'plate', type: 'string' }]),
      node('n4', 'el-lot', 'ParkingLot', pos(0, 1), ['issueTicket', 'findFreeSlot']),
      node('n5', 'el-exit-gate', 'ExitGate', pos(1, 1), ['open', 'scanTicket']),
      node('n6', 'el-printer', 'ReceiptPrinter', pos(2, 1), ['print']),
    ],
    edges: [
      edge('e1', 'ed-lot-ticket', 'n4', 'n1', 'dependency'),
      edge('e2', 'ed-ticket-slot', 'n1', 'n2', 'dependency'),
      edge('e3', 'ed-ticket-vehicle', 'n1', 'n3', 'association'),
      edge('e4', 'ed-gate-ticket', 'n5', 'n1', 'dependency'),
      edge('e5', 'ed-ticket-printer', 'n1', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['ParkingTicket', 'ParkingSlot', 'Vehicle', 'ParkingLot', 'ExitGate', 'ReceiptPrinter'],
      'ParkingTicket',
      ['calculateFee', 'payByCash', 'payByCard', 'printReceipt', 'releaseSlot', 'validateExit'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-parking-ticket-god-1',
        elementIds: ['el-ticket'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['ticket', 'fee', 'pay', 'receipt', 'release', 'responsibilities', 'entry'],
        modelAnswer:
          'ParkingTicket records entry, calculates fees, takes payment, prints receipts and releases slots. Split fee calculation, payment and receipt into their own collaborators and leave the ticket as a data record.',
        hints: [
          'Count the different reasons ParkingTicket would need to change.',
          'Which of its methods have nothing to do with “a ticket”?',
        ],
      },
      {
        id: 'iss-dbg-parking-ticket-god-2',
        elementIds: ['ed-ticket-slot'],
        category: 'Tight Coupling',
        aliases: ['SRP Violation'],
        explanationKeywords: ['ticket', 'slot', 'release', 'free', 'owner', 'lot'],
        modelAnswer:
          'The ticket frees its ParkingSlot itself, so a passive record controls infrastructure state. ParkingLot (or an exit service) should release the slot when payment is verified.',
        hints: [
          'Who should decide when a slot becomes free again?',
          'Why would a ticket hold a reference to a ParkingSlot at all?',
        ],
      },
    ],
  }),

  // ─── 149 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-messaging-no-channel',
    title: 'Chat Channel Model',
    difficulty: 'medium',
    order: 149,
    description: 'Find duplicated chat logic and the missing abstraction behind DMs and group chats.',
    tags: ['messaging', 'OCP', 'abstraction'],
    nodes: [
      node('n1', 'el-dm-chat', 'DirectMessageChat', pos(0, 0), ['send', 'addMessage', 'getHistory', 'mute'], [
        { name: 'userA', type: 'User' },
        { name: 'userB', type: 'User' },
        { name: 'messages', type: 'List<Message>' },
      ]),
      node('n2', 'el-group-chat', 'GroupChat', pos(1, 0), ['send', 'addMessage', 'getHistory', 'mute', 'addMember'], [
        { name: 'members', type: 'List<User>' },
        { name: 'messages', type: 'List<Message>' },
      ]),
      node('n3', 'el-message', 'Message', pos(2, 0), ['getText'], [
        { name: 'text', type: 'string' },
        { name: 'sentAt', type: 'DateTime' },
      ]),
      node('n4', 'el-user', 'User', pos(0, 1), ['getName']),
      node('n5', 'el-chat-service', 'ChatService', pos(1, 1), ['sendMessage', 'loadHistory']),
      node('n6', 'el-history-store', 'HistoryStore', pos(2, 1), ['save', 'load']),
    ],
    edges: [
      edge('e1', 'ed-dm-message', 'n1', 'n3', 'aggregation'),
      edge('e2', 'ed-group-message', 'n2', 'n3', 'aggregation'),
      edge('e3', 'ed-dm-user', 'n1', 'n4', 'association'),
      edge('e4', 'ed-service-dm', 'n5', 'n1', 'dependency'),
      edge('e5', 'ed-service-group', 'n5', 'n2', 'dependency'),
      edge('e6', 'ed-service-store', 'n5', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['DirectMessageChat', 'GroupChat', 'Message', 'User', 'ChatService', 'HistoryStore'],
      'ChatService',
      ['sendMessage', 'loadHistory'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-messaging-no-channel-1',
        elementIds: ['el-dm-chat', 'el-group-chat'],
        category: 'OCP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['duplicate', 'send', 'history', 'mute', 'channel', 'abstraction', 'new'],
        modelAnswer:
          'DirectMessageChat and GroupChat copy the same send/history/mute logic with no shared Channel abstraction, so every new conversation type (broadcast, community) means another copy.',
        hints: [
          'Compare the methods of the two chat classes side by side.',
          'What shared concept could both of them implement?',
        ],
      },
      {
        id: 'iss-dbg-messaging-no-channel-2',
        elementIds: ['ed-service-dm', 'ed-service-group'],
        category: 'DIP Violation',
        aliases: ['OCP Violation', 'Tight Coupling'],
        explanationKeywords: ['chatservice', 'concrete', 'branches', 'type', 'channel', 'depends'],
        modelAnswer:
          'ChatService depends on both concrete chat classes and branches by chat type. It should depend on a Channel interface so new channel types plug in without editing the service.',
        hints: [
          'How does ChatService choose between a DM and a group?',
          'What would it need to change to support a new channel type?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['Channel'] },
  }),

  // ─── 150 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-stock-observer-reversed',
    title: 'Market Price Wiring',
    difficulty: 'medium',
    order: 150,
    description: 'The Observer wiring looks right at a glance — find what is pointing the wrong way.',
    tags: ['finance', 'Observer', 'inheritance'],
    nodes: [
      node('n1', 'el-subscriber', 'Subscriber', pos(0, 0), [
        { name: 'update', params: [{ name: 'price', type: 'decimal' }], isAbstract: true },
      ], [], 'interface'),
      node('n2', 'el-stockprice', 'StockPrice', pos(1, 0), ['setPrice', 'getPrice', 'notifyAll'], [
        { name: 'symbol', type: 'string' },
        { name: 'price', type: 'decimal' },
      ]),
      node('n3', 'el-market-feed', 'MarketFeed', pos(2, 0), ['pushQuote']),
      node('n4', 'el-trader-app', 'TraderApp', pos(0, 1), ['refresh', 'showPrice']),
      node('n5', 'el-alert-service', 'AlertService', pos(1, 1), ['checkThreshold', 'sendAlert']),
      node('n6', 'el-price-chart', 'PriceChart', pos(2, 1), ['redraw']),
    ],
    edges: [
      edge('e1', 'ed-stock-extends-sub', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-feed-stock', 'n3', 'n2', 'dependency'),
      edge('e3', 'ed-trader-stock', 'n4', 'n2', 'dependency'),
      edge('e4', 'ed-alert-stock', 'n5', 'n2', 'dependency'),
      edge('e5', 'ed-chart-stock', 'n6', 'n2', 'dependency'),
    ],
    briefing: brief(
      ['Subscriber', 'StockPrice', 'MarketFeed', 'TraderApp', 'AlertService', 'PriceChart'],
      'StockPrice',
      ['setPrice', 'getPrice', 'notifyAll'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-stock-observer-reversed-1',
        elementIds: ['ed-stock-extends-sub'],
        category: 'Incorrect Inheritance',
        aliases: ['Pattern Misuse'],
        explanationKeywords: ['stockprice', 'subscriber', 'extends', 'subject', 'observer', 'reversed', 'is-a'],
        modelAnswer:
          'StockPrice extends Subscriber, but a price is the subject being observed, not a subscriber. The relationship is reversed — StockPrice should hold a list of Subscribers and notify them.',
        hints: [
          'Is a StockPrice a kind of Subscriber?',
          'Which side of the Observer pattern owns the list of listeners?',
        ],
      },
      {
        id: 'iss-dbg-stock-observer-reversed-2',
        elementIds: ['ed-trader-stock', 'ed-alert-stock', 'ed-chart-stock'],
        category: 'Pattern Misuse',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['poll', 'getprice', 'implement', 'subscriber', 'observers', 'register', 'update'],
        modelAnswer:
          'TraderApp, AlertService and PriceChart depend on StockPrice and poll getPrice() instead of implementing Subscriber and registering for updates, so the Observer pattern is not actually realized.',
        hints: [
          'Who implements Subscriber.update() in this diagram?',
          'How do the UI and alert classes learn that the price changed?',
        ],
      },
    ],
  }),

  // ─── 151 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-hotel-booking-concrete-rooms',
    title: 'Hotel Booking Room Bindings',
    difficulty: 'medium',
    order: 151,
    description: 'Find why Booking breaks whenever the hotel adds a new room type.',
    tags: ['hotel', 'DIP', 'OCP'],
    nodes: [
      node('n1', 'el-guest', 'Guest', pos(0, 0), ['book', 'cancel']),
      node('n2', 'el-booking', 'Booking', pos(1, 0), ['reserve', 'getPrice', 'checkIn'], [
        { name: 'singleRoom', type: 'SingleRoom' },
        { name: 'doubleRoom', type: 'DoubleRoom' },
        { name: 'suite', type: 'Suite' },
        { name: 'roomType', type: 'string' },
      ]),
      node('n3', 'el-billing', 'BillingService', pos(2, 0), ['invoice', 'charge']),
      node('n4', 'el-single-room', 'SingleRoom', pos(0, 1), ['getRate', 'isAvailable']),
      node('n5', 'el-double-room', 'DoubleRoom', pos(1, 1), ['getRate', 'isAvailable']),
      node('n6', 'el-suite', 'Suite', pos(2, 1), ['getRate', 'isAvailable', 'getAmenities']),
    ],
    edges: [
      edge('e1', 'ed-guest-booking', 'n1', 'n2', 'association'),
      edge('e2', 'ed-booking-billing', 'n2', 'n3', 'dependency'),
      edge('e3', 'ed-booking-single', 'n2', 'n4', 'association'),
      edge('e4', 'ed-booking-double', 'n2', 'n5', 'association'),
      edge('e5', 'ed-booking-suite', 'n2', 'n6', 'association'),
    ],
    briefing: brief(
      ['Guest', 'Booking', 'BillingService', 'SingleRoom', 'DoubleRoom', 'Suite'],
      'Booking',
      ['reserve', 'getPrice', 'checkIn'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-hotel-booking-concrete-rooms-1',
        elementIds: ['ed-booking-single', 'ed-booking-double', 'ed-booking-suite'],
        category: 'DIP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['booking', 'concrete', 'room', 'single', 'double', 'suite', 'interface'],
        modelAnswer:
          'Booking holds fields for each concrete room type. It should depend on a single Room abstraction that SingleRoom, DoubleRoom and Suite implement.',
        hints: [
          'Count the room-typed fields inside Booking.',
          'What type would Booking ideally reference instead?',
        ],
      },
      {
        id: 'iss-dbg-hotel-booking-concrete-rooms-2',
        elementIds: ['el-booking'],
        category: 'OCP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['booking', 'roomtype', 'new', 'field', 'branch', 'penthouse', 'modify'],
        modelAnswer:
          'Adding a Penthouse means adding another field and more roomType branches in Booking; with a Room interface the new type plugs in with no Booking changes.',
        hints: [
          'What would you have to edit in Booking to add a new room category?',
          'Why does Booking need a roomType string at all?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['Room'] },
  }),

  // ─── 152 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-bank-transfer-inline',
    title: 'Bank Transfer Flow',
    difficulty: 'medium',
    order: 152,
    description: 'Inspect how money moves between accounts and what safeguards are missing.',
    tags: ['banking', 'Command', 'Pattern Misuse'],
    nodes: [
      node('n1', 'el-transfer-service', 'TransferService', pos(0, 0), ['transfer', 'validate'], []),
      node('n2', 'el-account', 'Account', pos(1, 0), ['debit', 'credit', 'getBalance'], [
        { name: 'balance', type: 'decimal', visibility: 'public' },
      ]),
      node('n3', 'el-audit-log', 'AuditLog', pos(2, 0), ['write']),
      node('n4', 'el-notifier', 'SmsNotifier', pos(0, 1), ['sendSms']),
      node('n5', 'el-fraud-checker', 'FraudChecker', pos(1, 1), ['isSuspicious']),
      node('n6', 'el-transfer-controller', 'TransferController', pos(2, 1), ['handleRequest']),
    ],
    edges: [
      edge('e1', 'ed-controller-service', 'n6', 'n1', 'dependency'),
      edge('e2', 'ed-service-account', 'n1', 'n2', 'dependency'),
      edge('e3', 'ed-service-audit', 'n1', 'n3', 'dependency'),
      edge('e4', 'ed-service-notifier', 'n1', 'n4', 'dependency'),
      edge('e5', 'ed-service-fraud', 'n1', 'n5', 'dependency'),
    ],
    briefing: brief(
      ['TransferService', 'Account', 'AuditLog', 'SmsNotifier', 'FraudChecker', 'TransferController'],
      'TransferService',
      ['transfer', 'validate'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-bank-transfer-inline-1',
        elementIds: ['el-transfer-service', 'ed-service-account'],
        category: 'Pattern Misuse',
        aliases: ['SRP Violation'],
        explanationKeywords: ['debit', 'credit', 'inline', 'transaction', 'command', 'rollback', 'atomic'],
        modelAnswer:
          'TransferService debits one Account and credits another inline with no Transaction or TransferCommand, so there is no atomic unit, undo or rollback if the credit fails.',
        hints: [
          'What happens if the credit fails after the debit succeeded?',
          'Is there an object that represents the transfer itself?',
        ],
      },
      {
        id: 'iss-dbg-bank-transfer-inline-2',
        elementIds: ['ed-service-audit', 'ed-service-notifier', 'ed-service-fraud'],
        category: 'Tight Coupling',
        aliases: ['SRP Violation', 'DIP Violation'],
        explanationKeywords: ['audit', 'sms', 'fraud', 'directly', 'inline', 'concrete', 'transferservice'],
        modelAnswer:
          'TransferService directly calls the audit log, SMS notifier and fraud checker, hard-wiring cross-cutting concerns into the transfer path instead of using a pipeline or event listeners.',
        hints: [
          'How many collaborators does TransferService call for a single transfer?',
          'Which of them are about money movement and which are side concerns?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['Transaction'] },
  }),

  // ─── 153 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-crm-contact-god',
    title: 'CRM Contact Hub',
    difficulty: 'medium',
    order: 153,
    description: 'Find the contact class that has become the center of the whole CRM.',
    tags: ['crm', 'God Object', 'SRP'],
    nodes: [
      node('n1', 'el-contact', 'Contact', pos(0, 0), [
        'addCampaign',
        'logCall',
        'createDeal',
        'assignTask',
        'sendEmail',
        'getTimeline',
      ], [
        { name: 'campaigns', type: 'List<Campaign>', visibility: 'public' },
        { name: 'calls', type: 'List<CallLog>', visibility: 'public' },
        { name: 'deals', type: 'List<Deal>', visibility: 'public' },
        { name: 'tasks', type: 'List<Task>', visibility: 'public' },
      ]),
      node('n2', 'el-campaign', 'Campaign', pos(1, 0), ['enroll', 'getStats']),
      node('n3', 'el-calllog', 'CallLog', pos(2, 0), ['getDuration', 'getNotes']),
      node('n4', 'el-deal', 'Deal', pos(0, 1), ['advanceStage', 'getValue']),
      node('n5', 'el-task', 'Task', pos(1, 1), ['complete', 'getDueDate']),
      node('n6', 'el-email-service', 'EmailService', pos(2, 1), ['send']),
    ],
    edges: [
      edge('e1', 'ed-contact-campaign', 'n1', 'n2', 'aggregation'),
      edge('e2', 'ed-contact-calllog', 'n1', 'n3', 'aggregation'),
      edge('e3', 'ed-contact-deal', 'n1', 'n4', 'aggregation'),
      edge('e4', 'ed-contact-task', 'n1', 'n5', 'aggregation'),
      edge('e5', 'ed-contact-email', 'n1', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['Contact', 'Campaign', 'CallLog', 'Deal', 'Task', 'EmailService'],
      'Contact',
      ['addCampaign', 'logCall', 'createDeal', 'assignTask', 'sendEmail', 'getTimeline'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-crm-contact-god-1',
        elementIds: ['el-contact'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['contact', 'campaigns', 'calls', 'deals', 'tasks', 'everything', 'split'],
        modelAnswer:
          'Contact owns and manages campaigns, calls, deals and tasks as well as being a person record. Split these into dedicated managers or services that reference a Contact by id.',
        hints: [
          'List the collections Contact holds and the verbs it exposes.',
          'Which of them describe the person, and which describe sales activity?',
        ],
      },
      {
        id: 'iss-dbg-crm-contact-god-2',
        elementIds: ['el-contact', 'ed-contact-email'],
        category: 'Poor Encapsulation',
        aliases: ['Tight Coupling', 'SRP Violation'],
        explanationKeywords: ['public', 'lists', 'email', 'expose', 'contact', 'send', 'encapsulation'],
        modelAnswer:
          'Contact exposes its internal activity lists publicly and sends email itself through EmailService, so any caller can mutate its state and the person record is coupled to a delivery mechanism.',
        hints: [
          'Check the visibility of Contact’s attributes.',
          'Should a person record know how emails are delivered?',
        ],
      },
    ],
  }),

  // ─── 154 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-game-score-in-player',
    title: 'Player Score Duties',
    difficulty: 'medium',
    order: 154,
    description: 'Find the responsibilities that do not belong in a game Player.',
    tags: ['gaming', 'SRP', 'leaderboard'],
    nodes: [
      node('n1', 'el-player', 'Player', pos(0, 0), [
        'move',
        'attack',
        'computeScore',
        'updateLeaderboard',
        'broadcastScore',
      ], [
        { name: 'name', type: 'string' },
        { name: 'kills', type: 'int' },
        { name: 'timeAlive', type: 'int' },
      ]),
      node('n2', 'el-leaderboard', 'Leaderboard', pos(1, 0), ['submit', 'getTop']),
      node('n3', 'el-broadcaster', 'NetworkBroadcaster', pos(2, 0), ['sendToAll']),
      node('n4', 'el-match', 'Match', pos(0, 1), ['start', 'end', 'addPlayer']),
      node('n5', 'el-inventory', 'Inventory', pos(1, 1), ['addItem', 'removeItem']),
      node('n6', 'el-session', 'GameSession', pos(2, 1), ['join', 'leave']),
    ],
    edges: [
      edge('e1', 'ed-player-leaderboard', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-player-broadcaster', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-match-player', 'n4', 'n1', 'aggregation'),
      edge('e4', 'ed-player-inventory', 'n1', 'n5', 'composition'),
      edge('e5', 'ed-session-match', 'n6', 'n4', 'association'),
    ],
    briefing: brief(
      ['Player', 'Leaderboard', 'NetworkBroadcaster', 'Match', 'Inventory', 'GameSession'],
      'Player',
      ['move', 'attack', 'computeScore', 'updateLeaderboard', 'broadcastScore'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-game-score-in-player-1',
        elementIds: ['el-player'],
        category: 'SRP Violation',
        aliases: ['God Object'],
        explanationKeywords: ['player', 'score', 'compute', 'leaderboard', 'broadcast', 'responsibilities'],
        modelAnswer:
          'Player moves and attacks, computes its own score, updates the leaderboard and broadcasts over the network. Scoring and publishing belong to a ScoreCalculator and a score-publishing service.',
        hints: [
          'Which Player methods are about gameplay, and which are about scoring or networking?',
          'What would force you to edit Player if the scoring formula changed?',
        ],
      },
      {
        id: 'iss-dbg-game-score-in-player-2',
        elementIds: ['ed-player-leaderboard', 'ed-player-broadcaster'],
        category: 'Tight Coupling',
        aliases: ['SRP Violation', 'DIP Violation'],
        explanationKeywords: ['player', 'leaderboard', 'broadcaster', 'directly', 'concrete', 'network'],
        modelAnswer:
          'Player depends directly on Leaderboard and NetworkBroadcaster, so a domain entity is tied to ranking and networking infrastructure. Move that coordination to Match or a score service.',
        hints: [
          'Why does a Player need to know the network exists?',
          'Who else in the diagram could own leaderboard updates?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['ScoreCalculator'] },
  }),

  // ─── 155 ─────────────────────────────────────────────────────────────
  pack({
    slug: 'dbg-payment-gateway-ifelse',
    title: 'Checkout Provider Switch',
    difficulty: 'medium',
    order: 155,
    description: 'Find why every new payment provider means editing the payment service.',
    tags: ['payments', 'OCP', 'DIP'],
    nodes: [
      node('n1', 'el-checkout', 'Checkout', pos(0, 0), ['placeOrder', 'applyCoupon']),
      node('n2', 'el-payment-service', 'PaymentService', pos(1, 0), ['pay', 'refund'], [
        { name: 'provider', type: 'string', visibility: 'public' },
      ]),
      node('n3', 'el-stripe-client', 'StripeClient', pos(2, 0), ['createCharge']),
      node('n4', 'el-order', 'Order', pos(0, 1), ['getTotal', 'markPaid']),
      node('n5', 'el-paypal-client', 'PayPalClient', pos(1, 1), ['executePayment']),
      node('n6', 'el-receipt', 'Receipt', pos(2, 1), ['generate']),
    ],
    edges: [
      edge('e1', 'ed-checkout-payment', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-checkout-order', 'n1', 'n4', 'association'),
      edge('e3', 'ed-payment-stripe', 'n2', 'n3', 'dependency'),
      edge('e4', 'ed-payment-paypal', 'n2', 'n5', 'dependency'),
      edge('e5', 'ed-payment-receipt', 'n2', 'n6', 'dependency'),
    ],
    briefing: brief(
      ['Checkout', 'PaymentService', 'StripeClient', 'Order', 'PayPalClient', 'Receipt'],
      'PaymentService',
      ['pay', 'refund'],
    ),
    requirement: req(2),
    expectedIssues: [
      {
        id: 'iss-dbg-payment-gateway-ifelse-1',
        elementIds: ['el-payment-service'],
        category: 'OCP Violation',
        aliases: ['Pattern Misuse'],
        explanationKeywords: ['paymentservice', 'if', 'stripe', 'paypal', 'provider', 'new', 'branch'],
        modelAnswer:
          'PaymentService uses if (stripe) / else if (paypal) in pay() and refund(), so each new provider requires editing it. Extract a PaymentProvider interface and let each provider implement it.',
        hints: [
          'How does PaymentService decide which provider to call?',
          'What must change when Apple Pay is added?',
        ],
      },
      {
        id: 'iss-dbg-payment-gateway-ifelse-2',
        elementIds: ['ed-payment-stripe', 'ed-payment-paypal'],
        category: 'DIP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['concrete', 'stripeclient', 'paypalclient', 'depends', 'abstraction', 'paymentprovider'],
        modelAnswer:
          'The high-level PaymentService depends directly on the concrete StripeClient and PayPalClient. It should depend on a PaymentProvider abstraction that the clients implement and that is injected.',
        hints: [
          'Which direction do the arrows between PaymentService and the clients point?',
          'What abstraction could sit between them?',
        ],
      },
    ],
    verification: { mustIntroduceElementNames: ['PaymentProvider'] },
  }),
]
