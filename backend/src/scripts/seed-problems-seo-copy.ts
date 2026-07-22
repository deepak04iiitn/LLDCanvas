/**
 * Adds SEO/public-preview copy (whyAsked, realWorldApplications,
 * learningObjectives) to all existing problems, keyed by slug. Uses $set
 * only on these three fields — never recreates a problem, never touches
 * existing content (title, requirements, hints, etc).
 *
 * Run with:  npx ts-node -r dotenv/config src/scripts/seed-problems-seo-copy.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Problem } from '../models/problem.model'

interface SeoCopy {
  slug: string
  whyAsked: string
  realWorldApplications: string[]
  learningObjectives: string[]
}

const SEO_COPY: SeoCopy[] = [
  // ─── EASY ─────────────────────────────────────────────────────────────────
  {
    slug: 'parking-lot',
    whyAsked: 'It\'s the canonical "warm-up" LLD question — small enough to finish in 30-45 minutes, but rich enough to test whether you reach for interfaces and the Strategy pattern instead of hardcoding vehicle types.',
    realWorldApplications: [
      'Airport and mall multi-level parking management systems',
      'Automated valet parking used by dealerships and hotels',
      'Smart city curbside parking meters with dynamic pricing',
    ],
    learningObjectives: [
      'Model a shared, contended resource (slots) safely',
      'Use Strategy for pluggable fee-calculation rules',
      'Practice entity design before jumping to code',
    ],
  },
  {
    slug: 'library-management',
    whyAsked: 'Everyone has intuition for how a library works, so interviewers use it to see how you turn a familiar process into clean entities and state transitions without any hand-holding.',
    realWorldApplications: [
      'University and public library catalog systems',
      'Corporate equipment/asset lending systems',
      'Video rental and tool-library membership apps',
    ],
    learningObjectives: [
      'Design many-to-many relationships (books, copies, members)',
      'Model due dates, fines, and reservation queues',
      'Separate catalog data from per-copy lending state',
    ],
  },
  {
    slug: 'atm-machine',
    whyAsked: 'ATMs force you to reason about a strict state machine and money correctness under concurrency — two things interviewers love probing even in an "easy" question.',
    realWorldApplications: [
      'Physical bank ATMs and cash recycling machines',
      'Self-service kiosks for bill payment and deposits',
      'Point-of-sale terminals with card + PIN auth flows',
    ],
    learningObjectives: [
      'Model a card/PIN authentication state machine',
      'Handle cash dispensing with denomination constraints',
      'Keep transaction and account balance updates atomic',
    ],
  },
  {
    slug: 'elevator-system',
    whyAsked: 'A single elevator is the entry point to one of the most-referenced scheduling problems in CS — interviewers use it to gauge your instinct for state machines before escalating to the multi-elevator version.',
    realWorldApplications: [
      'Building elevator controllers (single-car dispatch logic)',
      'Warehouse vertical lift and pallet-conveyor systems',
      'Amusement park ride queuing and dispatch',
    ],
    learningObjectives: [
      'Model direction, door, and request states cleanly',
      'Queue and serve requests in a sensible order',
      'Separate the state machine from the dispatch policy',
    ],
  },
  {
    slug: 'vending-machine',
    whyAsked: 'It\'s the textbook example for the State pattern — interviewers use it to check that you model states as objects instead of littering the code with if/else flags.',
    realWorldApplications: [
      'Snack, drink, and ticket vending machines',
      'Self-checkout kiosks with cash/card acceptance',
      'Automated parcel lockers with item dispensing',
    ],
    learningObjectives: [
      'Apply the State pattern to a physical workflow',
      'Model coin/note insertion, change, and refunds',
      'Handle out-of-stock and insufficient-payment edge cases',
    ],
  },
  {
    slug: 'snake-and-ladder',
    whyAsked: 'It\'s a compact way to test whether you can model board state, turn order, and randomness (dice) as clean objects instead of one big procedural loop.',
    realWorldApplications: [
      'Digital board game implementations (mobile/web)',
      'Turn-based game engines with simple movement rules',
      'Educational simulations of probability and randomness',
    ],
    learningObjectives: [
      'Model a board as a graph of jumps (snakes/ladders)',
      'Manage turn order across N players',
      'Keep game rules decoupled from board representation',
    ],
  },
  {
    slug: 'tic-tac-toe',
    whyAsked: 'It\'s often the very first LLD question asked, specifically to see whether you can identify a win-condition check as its own concern rather than a wall of nested loops.',
    realWorldApplications: [
      'Simple two-player board games (mobile/web)',
      'Game engine tutorials for win-condition checking',
      'AI/minimax algorithm teaching examples',
    ],
    learningObjectives: [
      'Model a grid and player turns cleanly',
      'Isolate win-condition checking as its own logic',
      'Practice extending a design (e.g. to N x N boards)',
    ],
  },
  {
    slug: 'chess-game',
    whyAsked: 'Chess is a favorite because piece movement rules are genuinely varied — it rewards candidates who reach for polymorphism (each piece type implements its own move validation) over one giant switch statement.',
    realWorldApplications: [
      'Online chess platforms (move validation engines)',
      'Chess puzzle and training apps',
      'Board-game engines with piece-specific movement rules',
    ],
    learningObjectives: [
      'Use polymorphism for per-piece movement rules',
      'Detect check, checkmate, and stalemate conditions',
      'Model a board and move history cleanly',
    ],
  },
  {
    slug: 'deck-of-cards',
    whyAsked: 'It tests whether you can build a reusable, generic Deck/Card abstraction that multiple card games (Blackjack, Poker, etc.) can sit on top of — a good proxy for how you think about reusability.',
    realWorldApplications: [
      'Digital card games (Blackjack, Poker, Solitaire)',
      'Casino simulation and RNG-fairness systems',
      'Card-based tabletop game engines',
    ],
    learningObjectives: [
      'Model a generic, reusable Deck/Card abstraction',
      'Implement shuffling and dealing correctly',
      'Layer game-specific rules (Blackjack) on generic primitives',
    ],
  },
  {
    slug: 'traffic-light-system',
    whyAsked: 'It\'s a clean, small state-machine problem interviewers use to check your instinct for timed transitions and for coordinating multiple related state machines (multiple lights at one junction) safely.',
    realWorldApplications: [
      'Smart city intersection traffic controllers',
      'Simulation software for traffic engineering',
      'IoT-connected traffic signal networks',
    ],
    learningObjectives: [
      'Model timed state transitions (Red → Green → Yellow)',
      'Coordinate multiple related state machines at once',
      'Keep timing logic decoupled from signal display',
    ],
  },
  {
    slug: 'logging-framework',
    whyAsked: 'Nearly every engineer has used a logging library, making this a great test of whether you can design a genuinely extensible system (pluggable levels, sinks, and formats) rather than a one-off script.',
    realWorldApplications: [
      'Application logging libraries (Log4j, Winston, SLF4J)',
      'Centralized log aggregation pipelines',
      'Audit trail systems for compliance',
    ],
    learningObjectives: [
      'Design pluggable log levels and output destinations',
      'Apply Singleton and Strategy patterns together',
      'Keep the logging API simple while staying extensible',
    ],
  },
  {
    slug: 'rate-limiter',
    whyAsked: 'It bridges LLD and systems knowledge — interviewers use it to see if you know concrete algorithms (token bucket, sliding window) rather than just saying "we\'ll rate-limit it" vaguely.',
    realWorldApplications: [
      'API gateway request throttling',
      'Login attempt / brute-force protection',
      'Third-party API client libraries respecting quotas',
    ],
    learningObjectives: [
      'Implement token bucket or sliding window algorithms',
      'Reason about per-client vs. global limits',
      'Understand the single-node version before distributing it',
    ],
  },
  {
    slug: 'pub-sub-system',
    whyAsked: 'Publish-subscribe is the Observer pattern in disguise at a system level — this question checks whether you can decouple producers from consumers cleanly before you ever touch a real message broker.',
    realWorldApplications: [
      'In-app event buses (UI state updates)',
      'Microservice event notification systems',
      'Chat/notification fan-out to multiple subscribers',
    ],
    learningObjectives: [
      'Apply the Observer pattern at a systems level',
      'Decouple publishers from subscribers completely',
      'Handle subscriber registration/removal safely',
    ],
  },
  {
    slug: 'restaurant-table-reservation',
    whyAsked: 'It\'s a fresh, low-baggage scheduling problem — interviewers use it to see how you handle interval/overlap logic without candidates having memorized a "standard" solution.',
    realWorldApplications: [
      'OpenTable / Resy-style restaurant booking platforms',
      'Walk-in queue management systems',
      'Co-working space desk/room booking',
    ],
    learningObjectives: [
      'Detect and prevent time-slot double-booking',
      'Implement best-fit table assignment by party size',
      'Model a waitlist with notification triggers',
    ],
  },
  {
    slug: 'basic-calculator',
    whyAsked: 'It\'s a compact way to test the Command pattern specifically — interviewers want to see undo/redo implemented with real Command objects, not a hacky history array of raw values.',
    realWorldApplications: [
      'Spreadsheet and calculator app undo/redo',
      'Text/graphics editors with command history',
      'Financial calculators with audit trails',
    ],
    learningObjectives: [
      'Implement the Command pattern for reversible actions',
      'Manage undo/redo stacks correctly',
      'Handle invalid operations (e.g. divide by zero) safely',
    ],
  },
  {
    slug: 'in-memory-file-system',
    whyAsked: 'It\'s the standard vehicle for testing the Composite pattern — files and directories must be treated uniformly, and interviewers watch for whether you special-case directories everywhere instead.',
    realWorldApplications: [
      'Virtual file systems in IDEs and cloud drives',
      'Sandboxed/containerized filesystem emulation',
      'File explorer UI backends',
    ],
    learningObjectives: [
      'Apply the Composite pattern to a tree structure',
      'Implement efficient path resolution',
      'Compute aggregate properties (size) recursively',
    ],
  },
  {
    slug: 'cron-job-scheduler',
    whyAsked: 'It tests whether you reach for the right data structure (a priority queue/min-heap) for "always run the soonest thing next" instead of repeatedly scanning a list.',
    realWorldApplications: [
      'Cron/task schedulers (cron, Windows Task Scheduler)',
      'Background job runners in web frameworks',
      'CI/CD pipeline scheduled triggers',
    ],
    learningObjectives: [
      'Use a min-heap for efficient "next due" lookups',
      'Model one-time vs. recurring schedules',
      'Implement retry with exponential backoff',
    ],
  },
  {
    slug: 'quiz-trivia-engine',
    whyAsked: 'It\'s a good state-machine-plus-scoring problem — interviewers check whether your round/question flow is modeled explicitly rather than being driven by scattered boolean flags.',
    realWorldApplications: [
      'Kahoot/Quizizz-style live trivia platforms',
      'E-learning assessment and quiz modules',
      'Game show / trivia mobile apps',
    ],
    learningObjectives: [
      'Model a multi-stage game flow as a state machine',
      'Implement time-based bonus scoring',
      'Support both single-player and multiplayer modes',
    ],
  },
  {
    slug: 'digital-wallet',
    whyAsked: 'Money-handling problems are popular specifically to test rigor — interviewers want to see an immutable transaction ledger and real concurrency safety, not a single mutable balance field.',
    realWorldApplications: [
      'Digital wallets (Paytm, Google Pay, PayPal balance)',
      'In-app currency / credits systems',
      'Prepaid card balance management',
    ],
    learningObjectives: [
      'Model money as an append-only transaction ledger',
      'Prevent overdraft under concurrent access',
      'Keep balance derivation auditable and consistent',
    ],
  },
  {
    slug: 'meeting-room-booking',
    whyAsked: 'It\'s a clean interval-scheduling problem at a manageable scale — interviewers use it to see whether you reach for an efficient overlap-check instead of comparing every booking to every other booking.',
    realWorldApplications: [
      'Outlook/Google Calendar room booking',
      'Co-working and office space management platforms',
      'Hospital operating room scheduling',
    ],
    learningObjectives: [
      'Implement efficient interval overlap detection',
      'Support recurring bookings cleanly',
      'Model multi-building, multi-room hierarchies',
    ],
  },
  {
    slug: 'contact-management',
    whyAsked: 'It looks simple but rewards candidates who think about real-world messiness — duplicate detection, fast partial search — instead of treating it as a plain CRUD list.',
    realWorldApplications: [
      'Phone/email address book apps',
      'CRM contact databases',
      'Corporate directory and org-chart tools',
    ],
    learningObjectives: [
      'Design fast partial-match search (trie/index)',
      'Implement duplicate detection and merging',
      'Model many-to-many contact-to-group relationships',
    ],
  },
  {
    slug: 'ludo-board-game',
    whyAsked: 'Multiplayer board games test whether you can cleanly separate turn management, movement rules, and capture logic instead of tangling them into one big function.',
    realWorldApplications: [
      'Ludo King and similar mobile board games',
      'Turn-based multiplayer game engines',
      'Board game simulation/AI training environments',
    ],
    learningObjectives: [
      'Manage turn order and extra-turn rules',
      'Implement token capture and safe-cell logic',
      'Model a shared board state across players',
    ],
  },
  {
    slug: 'memory-matching-game',
    whyAsked: 'It\'s a compact way to test explicit state-machine thinking for user interaction flows (flip → check → resolve) rather than ad-hoc flags scattered through the UI logic.',
    realWorldApplications: [
      'Mobile memory/concentration card games',
      'Educational matching games for kids',
      'Multiplayer party game platforms',
    ],
    learningObjectives: [
      'Model a flip-check-resolve interaction as states',
      'Implement fair shuffling algorithms',
      'Support turn-based multiplayer scoring',
    ],
  },
  {
    slug: 'cafeteria-checkout-billing',
    whyAsked: 'Billing/discount problems are popular because the Strategy pattern makes such a visible difference — interviewers want to see discounts and payment methods as swappable strategies, not nested if/else.',
    realWorldApplications: [
      'Retail and cafeteria POS systems',
      'Self-checkout kiosks',
      'E-commerce cart pricing engines',
    ],
    learningObjectives: [
      'Apply Strategy pattern to discounts and payments',
      'Compose multiple discounts in a defined order',
      'Generate accurate itemized bills with tax',
    ],
  },
  {
    slug: 'stopwatch-lap-timer',
    whyAsked: 'It looks trivial but catches candidates who accumulate time via ticking counters — interviewers use it to see if you compute elapsed time from timestamps instead, which is the actually-correct approach.',
    realWorldApplications: [
      'Fitness and workout timer apps',
      'Sports lap-timing systems',
      'Productivity/Pomodoro timer tools',
    ],
    learningObjectives: [
      'Compute elapsed time from timestamps, not tick counters',
      'Model pause/resume without time drift',
      'Track and rank lap splits',
    ],
  },
  {
    slug: 'simple-lru-cache',
    whyAsked: 'It\'s one of the most common data-structure-design questions in the industry — interviewers specifically check for the HashMap + doubly-linked-list combo that gives true O(1) get/put.',
    realWorldApplications: [
      'Database and CDN caching layers',
      'Browser and OS page-replacement caches',
      'In-memory caches inside web frameworks',
    ],
    learningObjectives: [
      'Combine a HashMap and doubly linked list for O(1) ops',
      'Implement eviction policy correctly under capacity',
      'Reason about time complexity rigorously',
    ],
  },
  {
    slug: 'weather-station-observer',
    whyAsked: 'It\'s the textbook Observer pattern demonstration — interviewers use it to confirm you understand Subject/Observer decoupling before it shows up disguised inside a bigger system design.',
    realWorldApplications: [
      'IoT sensor dashboards and monitoring tools',
      'Stock ticker / live data display systems',
      'Weather app widgets with multiple display formats',
    ],
    learningObjectives: [
      'Implement the Observer pattern from scratch',
      'Decouple a data source from its displays',
      'Maintain incremental running statistics',
    ],
  },
  {
    slug: 'text-editor-undo-redo',
    whyAsked: 'It pairs the Command pattern with a real data-structure decision (how to represent large mutable text) — a good test of whether you think about scale even in a "simple" feature.',
    realWorldApplications: [
      'Text editors and IDEs (undo/redo stacks)',
      'Word processors with edit history',
      'Collaborative document editors',
    ],
    learningObjectives: [
      'Apply Command pattern to insert/delete operations',
      'Manage undo/redo stack branching correctly',
      'Consider efficient text storage for large documents',
    ],
  },
  {
    slug: 'battleship-game',
    whyAsked: 'It tests whether you can design clean turn-based state and efficient occupancy checks (Set-based lookups) instead of scanning the whole grid on every shot.',
    realWorldApplications: [
      'Digital Battleship and grid-based strategy games',
      'Turn-based multiplayer game engines',
      'Grid-occupancy algorithms in game development',
    ],
    learningObjectives: [
      'Validate ship placement efficiently',
      'Model hit/miss/sunk detection per ship',
      'Manage strict two-player turn alternation',
    ],
  },

  // ─── MEDIUM ───────────────────────────────────────────────────────────────
  {
    slug: 'hotel-booking',
    whyAsked: 'It extends single-resource scheduling (like parking) to a multi-room-type inventory problem — interviewers want to see if you handle room-type availability and date-range overlap correctly at once.',
    realWorldApplications: [
      'Booking.com / Expedia-style hotel reservation systems',
      'Hostel and vacation rental booking platforms',
      'Corporate travel booking tools',
    ],
    learningObjectives: [
      'Manage inventory across room types and date ranges',
      'Detect overlapping bookings efficiently',
      'Model cancellation and refund policies',
    ],
  },
  {
    slug: 'movie-ticket-booking',
    whyAsked: 'Seat-map problems are popular because they force you to handle temporary holds correctly under concurrency — a subtle but very real production concern interviewers love probing.',
    realWorldApplications: [
      'BookMyShow / Fandango-style ticketing platforms',
      'Theater and event seat-selection systems',
      'Airline/train seat-map booking flows',
    ],
    learningObjectives: [
      'Implement temporary seat holds with expiry',
      'Prevent double-booking under concurrent requests',
      'Model showtimes, screens, and pricing tiers',
    ],
  },
  {
    slug: 'food-delivery',
    whyAsked: 'It\'s a multi-actor marketplace problem (customer, restaurant, courier) — interviewers use it to see if you can model three-sided state and matching logic without conflating the actors\' responsibilities.',
    realWorldApplications: [
      'DoorDash / Swiggy / Zomato delivery platforms',
      'Grocery and pharmacy delivery apps',
      'Restaurant order-management integrations',
    ],
    learningObjectives: [
      'Model a three-sided marketplace (customer/restaurant/courier)',
      'Design order status state transitions',
      'Implement delivery partner assignment logic',
    ],
  },
  {
    slug: 'amazon-locker',
    whyAsked: 'It\'s a focused resource-allocation problem — interviewers use it to see how you size/assign lockers by package dimensions and handle pickup-code security cleanly.',
    realWorldApplications: [
      'Amazon Locker / parcel pickup point networks',
      'Package room management in apartment buildings',
      'Click-and-collect retail pickup systems',
    ],
    learningObjectives: [
      'Assign resources (lockers) by size constraints',
      'Generate and validate secure pickup codes',
      'Handle locker expiry and reassignment',
    ],
  },
  {
    slug: 'splitwise',
    whyAsked: 'It\'s one of the most-asked LLD questions in industry interviews specifically for the "debt simplification" algorithm — it reveals whether you can go beyond CRUD into a genuine graph/greedy algorithm.',
    realWorldApplications: [
      'Splitwise / group expense-sharing apps',
      'Roommate and trip expense trackers',
      'Corporate expense reimbursement splitting',
    ],
    learningObjectives: [
      'Model group expenses and individual balances',
      'Implement a debt-simplification algorithm',
      'Support multiple split strategies (equal, %, exact)',
    ],
  },
  {
    slug: 'cab-booking',
    whyAsked: 'It\'s a lighter-weight entry point into the ride-sharing problem family — interviewers use it to check driver-matching and trip-lifecycle modeling before escalating to the full Uber-scale version.',
    realWorldApplications: [
      'Uber / Lyft / Ola ride-hailing platforms',
      'Corporate cab/shuttle booking systems',
      'On-demand delivery driver dispatch',
    ],
    learningObjectives: [
      'Match riders to nearby available drivers',
      'Model a trip\'s full lifecycle and states',
      'Design fare calculation with surge/distance factors',
    ],
  },
  {
    slug: 'shopping-cart',
    whyAsked: 'It\'s a deceptively rich e-commerce problem — interviewers watch for whether pricing/promotion rules are cleanly pluggable (Strategy/Decorator) rather than hardcoded into the cart itself.',
    realWorldApplications: [
      'Amazon / Shopify-style e-commerce carts',
      'Grocery delivery app checkout flows',
      'B2B ordering platforms with tiered pricing',
    ],
    learningObjectives: [
      'Model cart line items, quantities, and pricing',
      'Apply Strategy/Decorator for promotions',
      'Handle inventory checks at checkout time',
    ],
  },
  {
    slug: 'online-stock-brokerage',
    whyAsked: 'It touches order-matching and portfolio math, both classic fintech LLD themes — interviewers use it to see if you separate order types cleanly and keep balance updates atomic.',
    realWorldApplications: [
      'Robinhood / Zerodha-style trading platforms',
      'Portfolio tracking and management tools',
      'Exchange order-matching engines (simplified)',
    ],
    learningObjectives: [
      'Model different order types (market, limit, stop)',
      'Keep buy/sell balance updates atomic',
      'Compute portfolio value and P&L correctly',
    ],
  },
  {
    slug: 'car-rental',
    whyAsked: 'It\'s a solid inventory-plus-scheduling problem across multiple locations — interviewers use it to see if you generalize resource booking beyond a single-location assumption.',
    realWorldApplications: [
      'Hertz / Zipcar / Turo rental platforms',
      'Corporate fleet management systems',
      'Equipment and machinery rental businesses',
    ],
    learningObjectives: [
      'Manage vehicle inventory across locations',
      'Handle reservation date-range conflicts',
      'Model pricing by vehicle category and duration',
    ],
  },
  {
    slug: 'flight-reservation',
    whyAsked: 'Multi-leg trips and fare classes make this meaningfully harder than a single hotel/room booking — interviewers use it to see if your seat/inventory model scales to connecting flights.',
    realWorldApplications: [
      'Airline booking systems (fare classes, multi-leg trips)',
      'Travel aggregator platforms (Expedia, Skyscanner)',
      'Corporate travel management tools',
    ],
    learningObjectives: [
      'Model multi-leg itineraries and connections',
      'Handle fare classes and dynamic pricing',
      'Manage seat inventory across a flight network',
    ],
  },
  {
    slug: 'stack-overflow',
    whyAsked: 'Reputation and voting systems are a great test of denormalized-but-consistent counters — interviewers check if you keep vote counts correct without recomputing from scratch on every read.',
    realWorldApplications: [
      'Stack Overflow / Quora-style Q&A platforms',
      'Community forums with reputation systems',
      'Product review and rating platforms',
    ],
    learningObjectives: [
      'Model questions, answers, comments, and votes',
      'Implement a reputation/scoring system',
      'Design tagging and search for content discovery',
    ],
  },
  {
    slug: 'linkedin',
    whyAsked: 'Social graph problems test whether you model relationships (connections, follows) as first-class entities with the right cardinality, not just arrays bolted onto a User object.',
    realWorldApplications: [
      'LinkedIn / professional networking platforms',
      'Social graph and connection-recommendation systems',
      'Alumni and professional community platforms',
    ],
    learningObjectives: [
      'Model a social graph with typed connections',
      'Design a basic connection-recommendation approach',
      'Handle privacy/visibility rules on profile data',
    ],
  },
  {
    slug: 'spotify',
    whyAsked: 'Playlists, queues, and recommendations give you three different data-structure decisions in one problem — interviewers watch which structures you pick and why.',
    realWorldApplications: [
      'Spotify / Apple Music streaming platforms',
      'Playlist and queue management in media apps',
      'Music recommendation engines (simplified)',
    ],
    learningObjectives: [
      'Model playlists, queues, and playback state',
      'Design a basic recommendation approach',
      'Handle offline/cached playback scenarios',
    ],
  },
  {
    slug: 'online-code-judge',
    whyAsked: 'It combines sandboxed execution concerns with a submission-grading state machine — interviewers use it to probe whether you think about untrusted-code safety, not just the happy path.',
    realWorldApplications: [
      'LeetCode / HackerRank-style judge platforms',
      'Automated grading systems for coding bootcamps',
      'CI pipelines that run untrusted test code',
    ],
    learningObjectives: [
      'Model a submission lifecycle and verdict states',
      'Reason about sandboxed, resource-limited execution',
      'Design test-case comparison and scoring',
    ],
  },
  {
    slug: 'notification-service',
    whyAsked: 'Multi-channel delivery (push/SMS/email) is a great test of the Strategy/Adapter pattern — interviewers want new channels to be addable without touching existing dispatch logic.',
    realWorldApplications: [
      'Push/SMS/email notification services (Twilio, SNS)',
      'App engagement and re-engagement systems',
      'Transactional alert systems (banking, delivery)',
    ],
    learningObjectives: [
      'Apply Strategy/Adapter for multiple channels',
      'Model user notification preferences',
      'Handle delivery retries and failures',
    ],
  },
  {
    slug: 'coupon-system',
    whyAsked: 'Discount rules multiply fast in the real world — this question checks whether your design lets new coupon types be added without rewriting the checkout logic each time.',
    realWorldApplications: [
      'E-commerce coupon and promo-code systems',
      'Loyalty program discount engines',
      'Subscription billing discount management',
    ],
    learningObjectives: [
      'Model multiple discount types uniformly',
      'Validate eligibility and stacking rules',
      'Track usage limits per coupon/user',
    ],
  },
  {
    slug: 'inventory-management',
    whyAsked: 'It\'s a foundational e-commerce backend problem — interviewers check if you reserve/release stock atomically instead of letting concurrent orders oversell the same item.',
    realWorldApplications: [
      'E-commerce warehouse inventory systems',
      'Retail point-of-sale stock tracking',
      'Multi-warehouse supply chain systems',
    ],
    learningObjectives: [
      'Reserve and release stock atomically',
      'Track inventory across multiple warehouses',
      'Trigger reorder alerts at threshold levels',
    ],
  },
  {
    slug: 'zoom',
    whyAsked: 'Real-time communication systems test your instinct for the Observer/media-session model — interviewers use it to gauge comfort with concurrent, stateful sessions rather than plain request/response.',
    realWorldApplications: [
      'Zoom / Google Meet video conferencing platforms',
      'Webinar and virtual event platforms',
      'Team collaboration tools with screen sharing',
    ],
    learningObjectives: [
      'Model a meeting session and participant roles',
      'Design mute/host-control permission logic',
      'Reason about scaling a real-time session',
    ],
  },
  {
    slug: 'design-pastebin',
    whyAsked: 'Short-URL-style generation and expiry logic come up constantly in interviews — this version tests it in a friendlier, content-storage context before you meet the "real" URL shortener.',
    realWorldApplications: [
      'Pastebin / GitHub Gist-style snippet sharing',
      'Temporary file/link sharing services',
      'Code-snippet sharing inside developer tools',
    ],
    learningObjectives: [
      'Generate unique, collision-resistant short IDs',
      'Model expiry and visibility settings',
      'Separate metadata storage from content storage',
    ],
  },
  {
    slug: 'cricket-scoreboard',
    whyAsked: 'It\'s a rich state-machine-plus-derived-statistics problem — interviewers check whether you compute stats from an immutable ball-by-ball log instead of mutating running totals directly (which drifts and is hard to audit).',
    realWorldApplications: [
      'Cricbuzz / ESPN live scoring platforms',
      'Sports broadcasting graphics systems',
      'Fantasy sports statistics engines',
    ],
    learningObjectives: [
      'Model an immutable, append-only event log',
      'Derive statistics from raw events, not mutation',
      'Use Observer to broadcast live score updates',
    ],
  },
  {
    slug: 'airline-boarding-seat-assignment',
    whyAsked: 'Seat maps plus boarding groups test whether you can layer a priority/ordering system (boarding groups) on top of a concurrency-safe resource (seats) at the same time.',
    realWorldApplications: [
      'Airline check-in and boarding systems',
      'Stadium/venue seating and entry management',
      'Train and bus seat assignment systems',
    ],
    learningObjectives: [
      'Prevent concurrent seat double-assignment',
      'Model boarding priority/group ordering',
      'Handle standby and waitlist promotion',
    ],
  },
  {
    slug: 'p2p-digital-wallet',
    whyAsked: 'Peer-to-peer transfers are the fintech LLD staple for testing atomicity — interviewers specifically probe whether both sides of a transfer succeed or fail together, with no partial state.',
    realWorldApplications: [
      'Venmo / Cash App / PayPal P2P transfers',
      'In-app peer payment features (ride-share tips, etc.)',
      'Digital remittance platforms',
    ],
    learningObjectives: [
      'Implement double-entry bookkeeping for transfers',
      'Guarantee atomicity across two wallet updates',
      'Design idempotent retries for payment requests',
    ],
  },
  {
    slug: 'restaurant-pos-kitchen-display',
    whyAsked: 'Routing order items to different kitchen stations is a clean, real-world use of Observer — interviewers check that each station only sees what\'s relevant to it.',
    realWorldApplications: [
      'Toast / Square restaurant POS systems',
      'Kitchen display systems (KDS) in quick-service chains',
      'Multi-station food-prep coordination software',
    ],
    learningObjectives: [
      'Route order items to the correct station',
      'Model per-item status through a state machine',
      'Apply Observer to keep displays in sync',
    ],
  },
  {
    slug: 'ebook-lending-platform',
    whyAsked: 'Limited-license lending forces you to design a fair waitlist and expiry system — interviewers check that returns/expiries release capacity correctly rather than leaking "phantom" holds.',
    realWorldApplications: [
      'Kindle Lending Library / Libby / OverDrive',
      'Corporate digital training material licensing',
      'Academic e-textbook lending platforms',
    ],
    learningObjectives: [
      'Model limited concurrent licenses per title',
      'Implement a fair FIFO waitlist with claim windows',
      'Enforce loan expiry without relying on the client',
    ],
  },
  {
    slug: 'online-auction-system',
    whyAsked: 'Live bidding under concurrency is a great test of atomic compare-and-set logic — interviewers watch for race conditions where two simultaneous bids could both "win".',
    realWorldApplications: [
      'eBay-style online auction platforms',
      'Live charity and estate auction systems',
      'B2B procurement reverse-auction platforms',
    ],
    learningObjectives: [
      'Serialize concurrent bids safely',
      'Implement proxy/automatic bidding logic',
      'Design anti-sniping auction extension rules',
    ],
  },
  {
    slug: 'hospital-appointment-scheduling',
    whyAsked: 'Healthcare scheduling adds real-world constraints (specialties, recurring visits) on top of basic interval scheduling — interviewers check if your design generalizes past a single doctor\'s calendar.',
    realWorldApplications: [
      'Practo / Zocdoc-style appointment platforms',
      'Hospital and clinic scheduling systems',
      'Telemedicine consultation booking',
    ],
    learningObjectives: [
      'Search availability by specialty and location',
      'Prevent double-booking with strong consistency',
      'Model recurring appointment schedules',
    ],
  },
  {
    slug: 'gym-membership-class-booking',
    whyAsked: 'Capacity-limited class bookings are a compact, realistic test of atomic reserve-or-waitlist logic — a pattern that recurs across many booking-style interview questions.',
    realWorldApplications: [
      'ClassPass / Mindbody fitness booking platforms',
      'Gym and studio class scheduling systems',
      'Corporate wellness program booking tools',
    ],
    learningObjectives: [
      'Enforce class capacity atomically',
      'Implement waitlist promotion on cancellation',
      'Model membership tiers and check-in flows',
    ],
  },
  {
    slug: 'online-survey-form-builder',
    whyAsked: 'Conditional branching logic is the crux here — interviewers check whether your design evaluates rules cleanly instead of hardcoding "if question 3 then show question 5" logic.',
    realWorldApplications: [
      'Google Forms / Typeform-style form builders',
      'Customer feedback and NPS survey tools',
      'HR/onboarding intake form systems',
    ],
    learningObjectives: [
      'Model multiple question types via Strategy',
      'Implement conditional/branching logic between questions',
      'Design incremental analytics aggregation',
    ],
  },
  {
    slug: 'event-ticketing-platform',
    whyAsked: 'It stress-tests seat-holds and high-demand fairness at once — interviewers use it to see if you\'d survive a real on-sale traffic spike, not just handle the calm-day case.',
    realWorldApplications: [
      'Ticketmaster / StubHub event ticketing',
      'Concert and sports event box-office systems',
      'Conference and meetup ticketing platforms',
    ],
    learningObjectives: [
      'Implement time-boxed seat holds during checkout',
      'Design a fair queue for high-demand on-sales',
      'Prevent double-selling under massive concurrency',
    ],
  },
  {
    slug: 'podcast-platform',
    whyAsked: 'Cross-device playback sync is the interesting part — interviewers check whether you resolve conflicting positions from multiple devices with a simple, defensible strategy.',
    realWorldApplications: [
      'Spotify / Apple Podcasts platforms',
      'Audiobook apps with cross-device sync',
      'Corporate training audio/video platforms',
    ],
    learningObjectives: [
      'Sync playback position across devices',
      'Model subscriptions and auto-download rules',
      'Design fan-out for new-episode notifications',
    ],
  },
  {
    slug: 'cloud-file-sync-client',
    whyAsked: 'Sync conflict resolution is one of the hardest "small" problems in software — interviewers use it to see if you even recognize that two offline edits to the same file is a real conflict, not an edge case to ignore.',
    realWorldApplications: [
      'Dropbox / Google Drive / OneDrive sync clients',
      'Enterprise file-sync and backup software',
      'Offline-first collaborative apps',
    ],
    learningObjectives: [
      'Detect and resolve sync conflicts',
      'Design chunked upload for efficient re-sync',
      'Persist a durable local change journal',
    ],
  },
  {
    slug: 'recipe-meal-planning',
    whyAsked: 'It\'s a good test of unit-aware aggregation — interviewers check whether your shopping-list generator correctly merges "2 tsp" and "1 tbsp" of the same ingredient instead of listing them separately.',
    realWorldApplications: [
      'Meal planning apps (Mealime, Yummly)',
      'Grocery delivery shopping-list generators',
      'Diet and nutrition tracking platforms',
    ],
    learningObjectives: [
      'Normalize units when aggregating ingredients',
      'Scale recipes by serving size correctly',
      'Merge multiple recipes into one shopping list',
    ],
  },
  {
    slug: 'fitness-tracker-app',
    whyAsked: 'It tests write-time vs. read-time aggregation trade-offs — interviewers check whether you pre-aggregate trends instead of summing raw sensor events on every dashboard load.',
    realWorldApplications: [
      'Fitbit / Apple Health / Strava tracking apps',
      'Corporate wellness challenge platforms',
      'Physical therapy progress tracking tools',
    ],
    learningObjectives: [
      'Aggregate high-frequency sensor data efficiently',
      'Design a rule engine for achievements/badges',
      'Balance write-time vs. read-time computation',
    ],
  },
  {
    slug: 'multiplayer-tictactoe-matchmaking',
    whyAsked: 'Adding real-time matchmaking and server authority to a "toy" game tests whether you understand why clients should never be trusted to self-report game outcomes.',
    realWorldApplications: [
      'Real-time multiplayer casual game platforms',
      'Matchmaking systems for skill-based games',
      'Game server architectures with authoritative state',
    ],
    learningObjectives: [
      'Implement a FIFO matchmaking queue',
      'Keep the server authoritative over game state',
      'Handle player disconnects mid-session gracefully',
    ],
  },
  {
    slug: 'elevator-group-control-system',
    whyAsked: 'It\'s the "harder sequel" to the single-elevator question — interviewers use it to see if you can design a dispatch heuristic across multiple cars, a real unsolved-in-general optimization problem.',
    realWorldApplications: [
      'Otis / Schindler multi-elevator dispatch systems',
      'Skyscraper vertical transportation systems',
      'Smart building traffic optimization',
    ],
    learningObjectives: [
      'Design a multi-elevator dispatch heuristic',
      'Model each elevator as an independent state machine',
      'Optimize for average wait time, not just correctness',
    ],
  },
  {
    slug: 'online-polling-voting-platform',
    whyAsked: 'High-volume voting is a great low-stakes way to discuss write-scaling — interviewers check if you avoid a single hot counter row becoming a bottleneck under load.',
    realWorldApplications: [
      'Twitter/X polls and live audience polling (Slido)',
      'Election and survey voting platforms',
      'Reddit/community upvote-style systems',
    ],
    learningObjectives: [
      'Prevent duplicate votes with strong constraints',
      'Design for high write-throughput voting',
      'Balance live accuracy vs. eventual consistency',
    ],
  },
  {
    slug: 'warehouse-order-fulfillment',
    whyAsked: 'It combines inventory correctness with a real optimization angle (pick-path ordering) — interviewers use it to see if you go beyond "reserve stock" into genuinely efficient fulfillment.',
    realWorldApplications: [
      'Amazon fulfillment center systems',
      'Third-party logistics (3PL) warehouse software',
      'Retail omnichannel order-routing systems',
    ],
    learningObjectives: [
      'Allocate inventory across multiple bins atomically',
      'Design an efficient pick-path ordering',
      'Handle partial fulfillment and backorders',
    ],
  },
  {
    slug: 'customer-support-ticketing',
    whyAsked: 'SLA-driven workflows are a clean test of state machines with time-based escalation — interviewers check whether deadlines are computed once and monitored, not recalculated ad hoc.',
    realWorldApplications: [
      'Zendesk / Freshdesk / Intercom support platforms',
      'IT helpdesk ticketing systems',
      'B2B customer success case management',
    ],
    learningObjectives: [
      'Model ticket status as a strict state machine',
      'Compute and monitor SLA deadlines',
      'Design fair agent assignment/routing',
    ],
  },
  {
    slug: 'loyalty-points-rewards-program',
    whyAsked: 'It\'s a rules-engine problem in disguise — interviewers check whether new earning promotions become new rules, not new code paths sprinkled through checkout.',
    realWorldApplications: [
      'Starbucks / Sephora / airline loyalty programs',
      'Credit card rewards and cashback systems',
      'E-commerce loyalty and referral programs',
    ],
    learningObjectives: [
      'Model points as an auditable ledger',
      'Apply Strategy for configurable earning rules',
      'Design tier evaluation without excess recomputation',
    ],
  },
  {
    slug: 'social-event-planning-app',
    whyAsked: 'It combines geospatial discovery with the same reserve-or-waitlist capacity pattern seen elsewhere — interviewers check if you reuse a known-good pattern instead of reinventing it.',
    realWorldApplications: [
      'Meetup / Eventbrite event platforms',
      'Community and interest-group organizing apps',
      'Corporate/team social event planning tools',
    ],
    learningObjectives: [
      'Design geospatial "events near me" queries',
      'Reuse capacity/waitlist patterns for RSVPs',
      'Model groups, interests, and recommendations',
    ],
  },

  // ─── HARD ─────────────────────────────────────────────────────────────────
  {
    slug: 'twitter',
    whyAsked: 'It\'s a benchmark large-system LLD/HLD hybrid — interviewers use it to see whether you know fan-out strategies for the "celebrity problem" (millions of followers) rather than one-size-fits-all logic.',
    realWorldApplications: [
      'Twitter/X-style microblogging platforms',
      'Public figure/brand social broadcasting systems',
      'Real-time news and trend aggregation platforms',
    ],
    learningObjectives: [
      'Design fan-out-on-write vs. fan-out-on-read',
      'Handle extreme skew (celebrity accounts)',
      'Model timelines, likes, retweets, and mentions',
    ],
  },
  {
    slug: 'whatsapp',
    whyAsked: 'Messaging apps test delivery guarantees under real network unreliability — interviewers specifically probe how you achieve at-least-once delivery with correct read-receipt semantics.',
    realWorldApplications: [
      'WhatsApp / Telegram / Signal messaging platforms',
      'Enterprise team chat tools (Slack, Teams)',
      'Customer support live-chat systems',
    ],
    learningObjectives: [
      'Guarantee message delivery under flaky connections',
      'Model sent/delivered/read receipt states',
      'Design group chat fan-out efficiently',
    ],
  },
  {
    slug: 'netflix',
    whyAsked: 'Video-on-demand tests adaptive bitrate delivery at scale — interviewers use it to see if you understand CDN-backed segment delivery instead of imagining one giant video file transfer.',
    realWorldApplications: [
      'Netflix / Disney+ / Prime Video streaming platforms',
      'Corporate video-on-demand training platforms',
      'Video-based e-learning platforms',
    ],
    learningObjectives: [
      'Design adaptive bitrate streaming (segments)',
      'Leverage CDN edge caching for scale',
      'Model watch history and recommendations',
    ],
  },
  {
    slug: 'google-drive',
    whyAsked: 'Cloud storage tests chunked upload/download plus permission modeling at scale — interviewers check that your design handles large files and sharing without naive whole-file transfers.',
    realWorldApplications: [
      'Google Drive / Dropbox / OneDrive cloud storage',
      'Enterprise document management systems',
      'Media asset management platforms',
    ],
    learningObjectives: [
      'Design chunked upload/download for large files',
      'Model file/folder sharing permissions',
      'Reason about storage deduplication and versioning',
    ],
  },
  {
    slug: 'instagram',
    whyAsked: 'It combines media storage at scale with a ranked feed — interviewers use it to see if candidates distinguish "store the photo" from "decide what shows up in whose feed and why".',
    realWorldApplications: [
      'Instagram / Pinterest-style media-sharing platforms',
      'Photo/video CDN delivery systems',
      'Influencer marketing and content platforms',
    ],
    learningObjectives: [
      'Design media upload, storage, and CDN delivery',
      'Rank and paginate a personalized feed',
      'Model follows, likes, and comments at scale',
    ],
  },
  {
    slug: 'uber-full',
    whyAsked: 'It\'s the flagship "full system" LLD/HLD interview question — companies use it because it touches geospatial matching, real-time tracking, and dynamic pricing all at once.',
    realWorldApplications: [
      'Uber / Lyft / Ola ride-hailing at full scale',
      'On-demand logistics and delivery dispatch',
      'Fleet management and dynamic pricing systems',
    ],
    learningObjectives: [
      'Design geospatial rider-driver matching',
      'Model real-time location tracking at scale',
      'Implement dynamic/surge pricing logic',
    ],
  },
  {
    slug: 'youtube',
    whyAsked: 'It\'s Netflix\'s harder sibling — user-generated uploads add transcoding-pipeline design on top of adaptive streaming, testing whether you think about the ingest side, not just playback.',
    realWorldApplications: [
      'YouTube / Vimeo video-sharing platforms',
      'Corporate video hosting and training platforms',
      'Live-streaming and VOD hybrid platforms',
    ],
    learningObjectives: [
      'Design a video transcoding/ingest pipeline',
      'Serve adaptive streams via CDN',
      'Model view counts, comments, and recommendations',
    ],
  },
  {
    slug: 'url-shortener',
    whyAsked: 'It\'s the most popular "system design 101" question for a reason — interviewers use it to check ID-generation, redirect-latency, and read/write-scaling thinking, all in a small surface area.',
    realWorldApplications: [
      'bit.ly / TinyURL-style link shorteners',
      'Marketing campaign link-tracking tools',
      'QR code destination management',
    ],
    learningObjectives: [
      'Generate unique short codes at scale',
      'Optimize redirect read-path latency',
      'Design click analytics without slowing redirects',
    ],
  },
  {
    slug: 'distributed-cache',
    whyAsked: 'It requires you to reason about consistent hashing and node failure — a step up from a single-node LRU cache into genuine distributed-systems territory.',
    realWorldApplications: [
      'Redis Cluster / Memcached-style distributed caches',
      'CDN edge caching layers',
      'Database query-result caching layers',
    ],
    learningObjectives: [
      'Apply consistent hashing for data distribution',
      'Handle node failure and rebalancing',
      'Choose eviction and replication strategies',
    ],
  },
  {
    slug: 'payment-gateway',
    whyAsked: 'Payment correctness under failure is the whole point — interviewers specifically test idempotency (never double-charge on a retried request) and rigorous state tracking.',
    realWorldApplications: [
      'Stripe / Razorpay / PayPal payment gateways',
      'E-commerce checkout payment processing',
      'Subscription billing payment infrastructure',
    ],
    learningObjectives: [
      'Guarantee idempotent payment processing',
      'Model a payment state machine with retries',
      'Design secure, PCI-conscious data handling',
    ],
  },
  {
    slug: 'search-autocomplete',
    whyAsked: 'It\'s a focused trie/prefix-search problem at scale — interviewers check whether you know how to serve low-latency suggestions from precomputed structures instead of live full-text scans.',
    realWorldApplications: [
      'Google/Google Maps search-box suggestions',
      'E-commerce product search autocomplete',
      'IDE code-completion suggestion engines',
    ],
    learningObjectives: [
      'Use a trie for efficient prefix search',
      'Rank suggestions by frequency/recency',
      'Keep suggestion latency low at scale',
    ],
  },
  {
    slug: 'real-time-leaderboard',
    whyAsked: 'Real-time ranking at scale is a classic sorted-set/skip-list data-structure question — interviewers check that you avoid re-sorting the entire leaderboard on every score update.',
    realWorldApplications: [
      'Mobile game leaderboards',
      'Esports and competitive gaming rankings',
      'Fitness app activity leaderboards',
    ],
    learningObjectives: [
      'Use a sorted-set structure for O(log n) rank updates',
      'Support real-time score update broadcasts',
      'Design for very high-frequency writes',
    ],
  },
  {
    slug: 'distributed-message-queue',
    whyAsked: 'It\'s a from-scratch mini-Kafka — interviewers use it to see if you understand partitioning, consumer groups, and delivery guarantees at a conceptual level.',
    realWorldApplications: [
      'Kafka / RabbitMQ-style messaging infrastructure',
      'Event-driven microservice communication',
      'Log aggregation and stream processing pipelines',
    ],
    learningObjectives: [
      'Design topic partitioning for parallelism',
      'Model consumer groups and offsets',
      'Reason about at-least-once vs. exactly-once delivery',
    ],
  },
  {
    slug: 'api-gateway',
    whyAsked: 'It tests whether you know what belongs at the edge of a microservice architecture (auth, rate limiting, routing) versus inside individual services.',
    realWorldApplications: [
      'Kong / AWS API Gateway / Nginx-based gateways',
      'Microservice architecture entry points',
      'Third-party API monetization platforms',
    ],
    learningObjectives: [
      'Centralize auth, rate limiting, and routing',
      'Design request/response transformation logic',
      'Reason about gateway high availability',
    ],
  },
  {
    slug: 'ride-sharing-backend',
    whyAsked: 'It isolates the hardest backend piece of the Uber problem — real-time location ingestion and matching — for candidates who\'ve already covered the LLD basics elsewhere.',
    realWorldApplications: [
      'Uber/Lyft backend location and matching services',
      'Fleet-tracking logistics backends',
      'Real-time IoT location-ingestion pipelines',
    ],
    learningObjectives: [
      'Ingest high-frequency location updates at scale',
      'Design efficient geospatial proximity search',
      'Separate matching logic from location storage',
    ],
  },
  {
    slug: 'web-crawler',
    whyAsked: 'It tests distributed BFS/DFS traversal plus politeness constraints — interviewers check if you\'d avoid hammering one domain while still crawling billions of pages efficiently.',
    realWorldApplications: [
      'Search engine web crawlers (Googlebot)',
      'SEO auditing and site-monitoring tools',
      'Price-comparison and data-aggregation crawlers',
    ],
    learningObjectives: [
      'Design distributed URL frontier management',
      'Respect politeness/rate limits per domain',
      'Deduplicate URLs and detect crawl traps',
    ],
  },
  {
    slug: 'typeahead-search',
    whyAsked: 'It\'s the search-engine-scale version of autocomplete — interviewers check if your design survives when the trie itself is too large for one machine.',
    realWorldApplications: [
      'Search engine query suggestion systems',
      'E-commerce marketplace search-as-you-type',
      'Large-scale product catalog search UIs',
    ],
    learningObjectives: [
      'Shard a trie/index across multiple nodes',
      'Aggregate ranked results from multiple shards',
      'Keep suggestion data freshness reasonable',
    ],
  },
  {
    slug: 'facebook',
    whyAsked: 'It\'s the deepest social-graph problem in the catalog — interviewers use it to see if you distinguish storage, ranking, and privacy as three separate concerns at massive scale.',
    realWorldApplications: [
      'Facebook / large-scale social network platforms',
      'Enterprise social/community platforms',
      'Social graph analytics and ad-targeting systems',
    ],
    learningObjectives: [
      'Model a massive-scale social graph efficiently',
      'Design privacy-aware content visibility rules',
      'Rank a personalized News Feed at scale',
    ],
  },
  {
    slug: 'yelp-local-search',
    whyAsked: 'Location-based discovery plus review aggregation is a strong geospatial-indexing test — interviewers check if you use a real geo-index instead of scanning all businesses and computing distance in application code.',
    realWorldApplications: [
      'Yelp / Google Maps / TripAdvisor local search',
      'Restaurant and business discovery apps',
      'Local services marketplace platforms',
    ],
    learningObjectives: [
      'Use a geospatial index for radius search',
      'Aggregate ratings atomically and consistently',
      'Design collaborative-filtering-style recommendations',
    ],
  },
  {
    slug: 'collaborative-text-editor',
    whyAsked: 'It\'s the definitive "design Google Docs" question — interviewers use it specifically to see whether you know OT or CRDTs, since naive locking or last-write-wins simply doesn\'t work for true concurrent editing.',
    realWorldApplications: [
      'Google Docs / Notion real-time collaborative editing',
      'Collaborative whiteboard and design tools',
      'Pair-programming and live-coding platforms',
    ],
    learningObjectives: [
      'Understand Operational Transformation vs. CRDTs',
      'Design conflict-free concurrent edit merging',
      'Reason about offline edits and reconnection',
    ],
  },
  {
    slug: 'distributed-rate-limiter',
    whyAsked: 'It\'s the distributed-systems escalation of the single-node rate limiter — interviewers check if you know a shared store (Redis) is required once you have more than one server.',
    realWorldApplications: [
      'API gateway rate limiting at scale (Cloudflare, Stripe)',
      'Multi-region SaaS platform throttling',
      'Anti-abuse systems across many app servers',
    ],
    learningObjectives: [
      'Coordinate limits across many stateless servers',
      'Implement atomic counters in a shared store',
      'Design graceful degradation if the store is down',
    ],
  },
  {
    slug: 'distributed-job-scheduler',
    whyAsked: 'It\'s a from-scratch mini-Airflow — interviewers check whether you understand leader election and exactly-once task claiming, not just "a cron job on a bigger machine".',
    realWorldApplications: [
      'Airflow / Temporal-style workflow orchestrators',
      'Distributed ETL and data pipeline schedulers',
      'Enterprise batch-job orchestration systems',
    ],
    learningObjectives: [
      'Design DAG-based task dependency execution',
      'Use leader election for scheduler fault tolerance',
      'Implement claim-with-lease for exactly-once execution',
    ],
  },
  {
    slug: 'news-feed-ranking-system',
    whyAsked: 'It isolates the hardest part of Instagram/Facebook — ranking at scale — and specifically tests whether you know the fan-out-on-write vs. fan-out-on-read trade-off for celebrity accounts.',
    realWorldApplications: [
      'Facebook/Instagram/LinkedIn feed ranking',
      'News aggregator personalized feeds',
      'E-commerce personalized product feeds',
    ],
    learningObjectives: [
      'Choose fan-out strategy based on follower count',
      'Design a candidate-retrieval-then-rank pipeline',
      'Paginate a dynamically-ranked feed correctly',
    ],
  },
  {
    slug: 'distributed-notification-fanout',
    whyAsked: 'It tests queue-based fan-out design under massive scale — interviewers check for deduplication and priority handling, not just "loop over all users and send".',
    realWorldApplications: [
      'AWS SNS / Firebase Cloud Messaging infrastructure',
      'Mass marketing/broadcast notification systems',
      'Critical alerting systems (incident/security)',
    ],
    learningObjectives: [
      'Design a queue-based fan-out pipeline',
      'Deduplicate notifications reliably',
      'Prioritize critical vs. bulk notification traffic',
    ],
  },
  {
    slug: 'content-delivery-network',
    whyAsked: 'It tests edge-caching and invalidation strategy — interviewers specifically probe how you avoid a "thundering herd" hitting origin servers on a cache miss.',
    realWorldApplications: [
      'Cloudflare / Akamai / CloudFront CDN infrastructure',
      'Video/image asset delivery at global scale',
      'Static site and API response caching',
    ],
    learningObjectives: [
      'Design edge caching with regional tiers',
      'Solve cache invalidation without a global broadcast',
      'Protect origin servers from traffic spikes',
    ],
  },
  {
    slug: 'distributed-lock-manager',
    whyAsked: 'It\'s a from-scratch mini-Zookeeper — interviewers check if you understand consensus (Raft/Paxos) and session-based lease expiry, core distributed-systems fundamentals.',
    realWorldApplications: [
      'ZooKeeper / etcd distributed coordination services',
      'Leader election in distributed databases',
      'Distributed cron job "only one runner" locks',
    ],
    learningObjectives: [
      'Understand consensus protocols conceptually',
      'Design session-based lease expiry for locks',
      'Avoid split-brain with quorum-based decisions',
    ],
  },
  {
    slug: 'ad-click-tracking-billing',
    whyAsked: 'Ad-tech billing tests exactly-once event processing under fraud pressure — interviewers check if you separate a fast real-time layer from a rigorous, fraud-filtered billing layer.',
    realWorldApplications: [
      'Google Ads / Meta Ads click-tracking infrastructure',
      'Affiliate marketing attribution systems',
      'Programmatic ad exchange billing pipelines',
    ],
    learningObjectives: [
      'Design a durable, high-throughput event ingestion path',
      'Separate real-time metrics from authoritative billing',
      'Apply fraud-detection heuristics before billing',
    ],
  },
  {
    slug: 'live-video-streaming-platform',
    whyAsked: 'Live (not on-demand) streaming adds a hard latency constraint — interviewers check if you understand why HLS/DASH segment size is a latency-vs-scale trade-off, not a free choice.',
    realWorldApplications: [
      'Twitch / YouTube Live streaming platforms',
      'Live sports and event broadcasting',
      'Livestream shopping/commerce platforms',
    ],
    learningObjectives: [
      'Design a low-latency ingest-to-CDN pipeline',
      'Understand adaptive bitrate for live streams',
      'Reason about the latency vs. scale trade-off',
    ],
  },
  {
    slug: 'distributed-task-queue',
    whyAsked: 'It\'s a from-scratch mini-Celery/Sidekiq — interviewers check if you know the visibility-timeout pattern that gives at-least-once delivery without losing tasks on worker crash.',
    realWorldApplications: [
      'Celery / Sidekiq / AWS SQS-based job processing',
      'Background email/notification sending systems',
      'Async image/video processing pipelines',
    ],
    learningObjectives: [
      'Implement the visibility-timeout delivery pattern',
      'Design retry with exponential backoff and dead-letter',
      'Support delayed/scheduled task execution',
    ],
  },
  {
    slug: 'distributed-unique-id-generator',
    whyAsked: 'It\'s the canonical "design Twitter Snowflake" question — interviewers check whether you understand how timestamp+machine-id+sequence bit-packing avoids any central coordination.',
    realWorldApplications: [
      'Twitter Snowflake-style distributed ID generation',
      'Distributed database primary key generation',
      'Order/transaction ID generation at scale',
    ],
    learningObjectives: [
      'Bit-pack timestamp, machine ID, and sequence',
      'Avoid central coordination for ID generation',
      'Handle clock-drift edge cases correctly',
    ],
  },
  {
    slug: 'search-engine-indexing-system',
    whyAsked: 'It\'s the from-scratch "build Elasticsearch" question — interviewers check if you know the inverted-index data structure that makes full-text search fast at all.',
    realWorldApplications: [
      'Elasticsearch / Solr-style search infrastructure',
      'Site search for large content platforms',
      'Log search and observability platforms',
    ],
    learningObjectives: [
      'Build and query an inverted index',
      'Shard an index for parallel indexing/search',
      'Rank results with TF-IDF/BM25-style scoring',
    ],
  },
  {
    slug: 'distributed-session-store',
    whyAsked: 'It tests global low-latency reads versus strict security-event consistency — interviewers check if you treat "normal read" and "logout everywhere" as genuinely different consistency problems.',
    realWorldApplications: [
      'Multi-region web application session management',
      'SSO and identity provider session infrastructure',
      'Global CDN-edge authenticated request validation',
    ],
    learningObjectives: [
      'Replicate session data across regions',
      'Design synchronous invalidation for security events',
      'Survive a regional outage without mass logout',
    ],
  },
  {
    slug: 'realtime-collaborative-code-editor',
    whyAsked: 'It combines the Google-Docs collaborative-editing problem with sandboxed code execution — interviewers check if you isolate untrusted execution as rigorously as you handle concurrent edits.',
    realWorldApplications: [
      'Replit / CodeSandbox collaborative coding platforms',
      'Technical interview live-coding platforms',
      'Pair-programming and classroom coding tools',
    ],
    learningObjectives: [
      'Apply CRDT/OT concepts to a code editor',
      'Sandbox untrusted code execution safely',
      'Stream execution output to multiple viewers live',
    ],
  },
  {
    slug: 'fraud-detection-system',
    whyAsked: 'It tests a layered real-time-vs-batch architecture — interviewers check if you separate fast, cheap rule checks (sub-50ms) from slower, deeper analysis instead of trying to do everything synchronously.',
    realWorldApplications: [
      'Stripe / Visa / PayPal fraud-detection pipelines',
      'E-commerce checkout fraud screening',
      'Banking real-time transaction monitoring',
    ],
    learningObjectives: [
      'Separate a fast synchronous path from deep analysis',
      'Use precomputed features for low-latency scoring',
      'Design a feedback loop from confirmed fraud outcomes',
    ],
  },
  {
    slug: 'distributed-metrics-monitoring',
    whyAsked: 'It\'s the from-scratch "design Prometheus" question — interviewers check if you understand why time-series data needs specialized compression and downsampling, unlike generic row storage.',
    realWorldApplications: [
      'Prometheus / Datadog / Grafana monitoring stacks',
      'Infrastructure observability platforms',
      'Application performance monitoring (APM) tools',
    ],
    learningObjectives: [
      'Understand time-series-specific compression',
      'Design retention via downsampling tiers',
      'Choose pull vs. push metric collection models',
    ],
  },
  {
    slug: 'multiplayer-game-matchmaking',
    whyAsked: 'It tests a genuine optimization trade-off (wait time vs. match quality) rather than a pure correctness problem — interviewers check if you can reason about tuning a system, not just building one.',
    realWorldApplications: [
      'Riot Games / Activision competitive matchmaking',
      'Mobile multiplayer game matchmaking services',
      'Esports ranked-ladder systems',
    ],
    learningObjectives: [
      'Bucket players by skill rating for fast matching',
      'Widen search criteria over time to bound wait',
      'Treat pre-formed parties as a single matching unit',
    ],
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI env var not set')
  await mongoose.connect(uri)

  let updated = 0
  let missing = 0
  for (const c of SEO_COPY) {
    const res = await Problem.findOneAndUpdate(
      { slug: c.slug },
      { $set: {
        whyAsked: c.whyAsked,
        realWorldApplications: c.realWorldApplications,
        learningObjectives: c.learningObjectives,
      } },
      { new: true },
    )
    if (res) { updated++; console.log(`  ✓ ${c.slug}`) }
    else { missing++; console.warn(`  ✗ NOT FOUND: ${c.slug}`) }
  }

  console.log(`\nUpdated: ${updated}, missing: ${missing}, total in this file: ${SEO_COPY.length}`)

  const totalProblems = await Problem.countDocuments({ isActive: true })
  const withCopy = await Problem.countDocuments({ isActive: true, whyAsked: { $ne: '' } })
  console.log(`Active problems: ${totalProblems}, with SEO copy: ${withCopy}`)

  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
