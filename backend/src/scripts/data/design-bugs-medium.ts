interface DesignBugSeed {
  slug: string
  title: string
  description: string
  difficulty: 'medium'
  order: number
  diagramData: {
    nodes: Array<{ id: string; data: { label: string }; position: { x: number; y: number } }>
    edges: Array<{ id: string; source: string; target: string; label: string; type?: string }>
  }
  expectedIssues: Array<{
    id: string
    type:
      | 'srp_violation'
      | 'wrong_relationship'
      | 'missing_abstraction'
      | 'coupling_issue'
      | 'cohesion_issue'
      | 'god_class'
      | 'other'
    targetClass: string
    description: string
    interviewContext: string
  }>
  explanation: string
}

export const MEDIUM_BUGS: DesignBugSeed[] = [
  // ─── 41 ───────────────────────────────────────────────────────────────────
  {
    slug: 'bookmyshow-no-seat-lock',
    title: 'BookMyShow — No Seat Lock / Concurrency',
    description:
      'Show exposes a raw List<Seat> and Booking directly flips seat.booked=true. There is no temporary reservation or locking service, creating a classic TOCTOU race condition under concurrent requests.',
    difficulty: 'medium',
    order: 41,
    diagramData: {
      nodes: [
        { id: 'show',    data: { label: 'Show' },    position: { x: 80,  y: 80  } },
        { id: 'seat',    data: { label: 'Seat' },    position: { x: 310, y: 80  } },
        { id: 'booking', data: { label: 'Booking' }, position: { x: 540, y: 80  } },
        { id: 'user',    data: { label: 'User' },    position: { x: 80,  y: 250 } },
        { id: 'payment', data: { label: 'Payment' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'show',    target: 'seat',    label: 'has List<Seat>',    type: 'smoothstep' },
        { id: 'e2', source: 'booking', target: 'seat',    label: 'sets booked=true',  type: 'smoothstep' },
        { id: 'e3', source: 'booking', target: 'user',    label: 'belongs to',        type: 'smoothstep' },
        { id: 'e4', source: 'booking', target: 'payment', label: 'processes payment', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'coupling_issue',
        targetClass: 'booking',
        description:
          'Booking directly mutates Seat state without any reservation or lock guard. Under concurrent load two Booking instances can both observe the same seat as available, both proceed past the check, and both mark it booked — a classic TOCTOU race. The lack of a transactional boundary means partial failures leave seats in an inconsistent state with no compensating mechanism.',
        interviewContext:
          'The interviewer is probing whether the candidate understands concurrency hazards in high-demand ticketing. A senior engineer should immediately propose a SeatLockService that holds a TTL-bound reservation (e.g., 10 minutes via optimistic lock or a distributed lock) before the payment flow begins, fully decoupling the temporary hold from the final Booking entity.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'booking',
        description:
          'Booking is simultaneously a domain entity and a payment orchestrator. Seat reservation and payment processing have distinct failure modes: a seat can be held while payment is declined, requiring a rollback that does not belong inside a data object. This conflation makes it impossible to independently test reservation logic from payment logic.',
        interviewContext:
          'Interviewers check whether candidates separate workflow coordination from entity state. The senior answer introduces a BookingService (use-case layer) that orchestrates SeatLockService → PaymentService → Booking creation, with each class holding a single responsibility and compensating transactions on failure.',
      },
    ],
    explanation:
      'The correct design introduces a SeatLockService that creates a time-bound SeatReservation before any payment attempt, using optimistic locking or a distributed lock (Redis SETNX). Booking becomes a pure domain entity created only after payment succeeds, following the Saga pattern for distributed transactions. A BookingService orchestrates the saga steps: lock seat → charge payment → confirm booking → release lock or let it expire. Show exposes query methods rather than raw collections, respecting the Tell-Don\'t-Ask principle. This separation makes retries, timeouts, and compensation handling explicit and independently testable.',
  },

  // ─── 42 ───────────────────────────────────────────────────────────────────
  {
    slug: 'uber-driver-rider-no-interface',
    title: 'Uber — Driver & Rider Have No User Abstraction',
    description:
      'Driver and Rider each duplicate name, email, and phone fields. RideRequest hardcodes references to concrete Driver and Rider types, preventing polymorphic treatment and making new participant roles expensive to add.',
    difficulty: 'medium',
    order: 42,
    diagramData: {
      nodes: [
        { id: 'driver',      data: { label: 'Driver' },      position: { x: 80,  y: 80  } },
        { id: 'rider',       data: { label: 'Rider' },       position: { x: 310, y: 80  } },
        { id: 'rideRequest', data: { label: 'RideRequest' }, position: { x: 540, y: 80  } },
        { id: 'trip',        data: { label: 'Trip' },        position: { x: 80,  y: 250 } },
        { id: 'location',    data: { label: 'Location' },    position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'rideRequest', target: 'driver',   label: 'assigns driver',    type: 'smoothstep' },
        { id: 'e2', source: 'rideRequest', target: 'rider',    label: 'for rider',         type: 'smoothstep' },
        { id: 'e3', source: 'trip',        target: 'driver',   label: 'driven by',         type: 'smoothstep' },
        { id: 'e4', source: 'trip',        target: 'rider',    label: 'serves rider',      type: 'smoothstep' },
        { id: 'e5', source: 'driver',      target: 'location', label: 'has location',      type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'driver',
        description:
          'Driver and Rider each independently declare name, email, phone, and profilePicture fields — raw duplication with no shared base. Any change to the user authentication model or contact fields must be replicated in two classes. This violates DRY and will cause drift between the two models over time as features evolve independently.',
        interviewContext:
          'The interviewer is checking whether the candidate recognises the need for a common User base class or interface. A senior answer introduces a User entity (or abstract base) that holds identity and contact data, with Driver and Rider extending it to add role-specific attributes like vehicleId or paymentMethod respectively.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'rideRequest',
        description:
          'RideRequest holds typed fields for Driver and Rider concrete classes rather than a User abstraction. Adding a new participant role — such as a corporate account or a scheduled-ride requester — requires modifying RideRequest\'s field schema. This tight coupling to concrete types violates the Open/Closed Principle and makes the request model brittle.',
        interviewContext:
          'Interviewers probe OCP awareness. A senior engineer replaces the concrete typed fields with a User reference and uses a Role enum or separate domain objects to capture role-specific behaviour, ensuring RideRequest remains closed for modification when new participant types are introduced.',
      },
    ],
    explanation:
      'The correct design introduces a User base entity holding identity fields (id, name, email, phone) and has Driver and Rider extend it with role-specific state (vehicleDetails, licenceNumber for Driver; preferredPayment for Rider). RideRequest references User by role or by a typed RideParticipant value object, following the Liskov Substitution Principle. This eliminates duplication and makes the domain model open for new participant types (corporate booker, fleet manager) without modifying existing classes. The pattern is essentially a classic inheritance hierarchy with a shared Identity concept, complemented by a Role strategy for behaviour differences.',
  },

  // ─── 43 ───────────────────────────────────────────────────────────────────
  {
    slug: 'lru-cache-no-eviction-strategy',
    title: 'LRU Cache — Eviction Strategy Hardcoded',
    description:
      'Cache bakes LRU eviction logic directly into its body using a DoublyLinkedList + HashMap inline. Switching to LFU or FIFO requires modifying the class. Cache also holds direct references to DataStore, coupling cache and persistence.',
    difficulty: 'medium',
    order: 43,
    diagramData: {
      nodes: [
        { id: 'cache',         data: { label: 'Cache' },         position: { x: 80,  y: 80  } },
        { id: 'cacheEntry',    data: { label: 'CacheEntry' },    position: { x: 310, y: 80  } },
        { id: 'dataStore',     data: { label: 'DataStore' },     position: { x: 540, y: 80  } },
        { id: 'client',        data: { label: 'Client' },        position: { x: 80,  y: 250 } },
        { id: 'evictionLogic', data: { label: 'EvictionLogic' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'cache',  target: 'cacheEntry',    label: 'stores entries',     type: 'smoothstep' },
        { id: 'e2', source: 'cache',  target: 'evictionLogic', label: 'hardcodes LRU inline', type: 'smoothstep' },
        { id: 'e3', source: 'cache',  target: 'dataStore',     label: 'fetches on miss',    type: 'smoothstep' },
        { id: 'e4', source: 'client', target: 'cache',         label: 'get / put',          type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'cache',
        description:
          'LRU eviction logic is embedded directly inside Cache with no EvictionStrategy interface. To switch to LFU or FIFO the class must be modified, violating OCP. The eviction algorithm is a distinct, independently varying concern that should be injected rather than hardcoded, especially since different use cases (session cache, object cache, CDN) need different policies.',
        interviewContext:
          'Interviewers test Strategy pattern awareness. A senior answer extracts an EvictionStrategy interface with evict(), onAccess(), and onInsert() methods, then injects LRUStrategy, LFUStrategy, or FIFOStrategy at construction time. This makes the Cache generic and independently testable against each eviction policy.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'cache',
        description:
          'Cache directly references DataStore to fetch on a miss, coupling cache infrastructure to the persistence layer. This prevents the cache from being reused in front of different backends (remote API, message queue, in-memory DB) without modification. It also makes unit-testing the eviction logic impossible without standing up a data store.',
        interviewContext:
          'The interviewer probes Dependency Inversion. The senior answer has Cache accept a DataLoader functional interface (or Loader<K,V>), so callers supply the retrieval function. Cache only knows how to cache — it is not responsible for knowing where data lives.',
      },
    ],
    explanation:
      'The correct design applies the Strategy pattern: Cache<K,V> accepts an EvictionStrategy<K> interface whose implementations (LRUStrategy, LFUStrategy, FIFOStrategy) encapsulate their respective data structures. Cache also accepts a DataLoader<K,V> functional interface instead of a concrete DataStore, following the Dependency Inversion Principle. CacheEntry remains a simple value holder. This makes the cache a generic infrastructure component reusable across domains. Each eviction strategy is independently unit-testable, and adding a new policy requires only a new EvictionStrategy implementation with no changes to Cache.',
  },

  // ─── 44 ───────────────────────────────────────────────────────────────────
  {
    slug: 'splitwise-debt-god-class',
    title: 'Splitwise — Expense God Class',
    description:
      'Expense performs split calculation, debt settlement, push notification, and currency conversion all in one class. This is a textbook god class with at least three distinct SRP violations crammed into a single entity.',
    difficulty: 'medium',
    order: 44,
    diagramData: {
      nodes: [
        { id: 'expense',      data: { label: 'Expense' },      position: { x: 80,  y: 80  } },
        { id: 'user',         data: { label: 'User' },         position: { x: 310, y: 80  } },
        { id: 'group',        data: { label: 'Group' },        position: { x: 540, y: 80  } },
        { id: 'currency',     data: { label: 'Currency' },     position: { x: 80,  y: 250 } },
        { id: 'notification', data: { label: 'Notification' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'expense',      target: 'user',         label: 'owed by',           type: 'smoothstep' },
        { id: 'e2', source: 'expense',      target: 'group',        label: 'in group',           type: 'smoothstep' },
        { id: 'e3', source: 'expense',      target: 'currency',     label: 'converts inline',    type: 'smoothstep' },
        { id: 'e4', source: 'expense',      target: 'notification', label: 'sends push inline',  type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'expense',
        description:
          'Expense handles split calculation, debt settlement, currency conversion, and push notification dispatch — four unrelated responsibilities. The class will attract every new feature touching money, making it a permanent change magnet. Any bug in the notification code can corrupt split calculation state, and vice versa, since they share the same object lifecycle.',
        interviewContext:
          'The interviewer is checking whether the candidate can decompose a god class by responsibility boundary. A senior answer separates Expense (entity: who owes what), SplitCalculator (domain service: how to divide), DebtSettlementService, CurrencyConverter, and NotificationService — each independently injectable and testable.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'expense',
        description:
          'Expense sends push notifications directly, meaning the domain entity has a dependency on an infrastructure concern (push notification provider). This prevents deploying Expense without a notification backend and makes test doubles mandatory in every unit test. It also couples the domain model to delivery mechanism changes (push → email → in-app).',
        interviewContext:
          'Interviewers probe domain/infrastructure separation. The senior answer uses a domain event: Expense publishes an ExpenseCreated event, and a separate ExpenseNotificationHandler subscribes and dispatches the push. This follows the Ports and Adapters (Hexagonal) pattern, keeping the domain free of infrastructure dependencies.',
      },
    ],
    explanation:
      'The correct design decomposes Expense into: Expense entity (data: payer, amount, participants), SplitCalculator service (domain logic for equal/percentage/exact splits), DebtLedger service (settlement and balance tracking), CurrencyService (conversion via a rates gateway), and NotificationService (infrastructure). Expense publishes domain events (ExpenseCreated, DebtSettled) which downstream handlers consume — a pattern aligned with Domain-Driven Design and the Observer pattern. Each service is testable in isolation, and changing the notification delivery channel requires only a new handler, not a change to Expense.',
  },

  // ─── 45 ───────────────────────────────────────────────────────────────────
  {
    slug: 'chess-move-validator-board',
    title: 'Chess — Board Validates Moves',
    description:
      'Board contains an isValidMove() method with a giant switch/case over piece types. Each piece subclass exists but has no validateMove() method of its own, violating polymorphism and putting piece-specific rules in the wrong class.',
    difficulty: 'medium',
    order: 45,
    diagramData: {
      nodes: [
        { id: 'board',  data: { label: 'Board' },  position: { x: 80,  y: 80  } },
        { id: 'piece',  data: { label: 'Piece' },  position: { x: 310, y: 80  } },
        { id: 'king',   data: { label: 'King' },   position: { x: 540, y: 80  } },
        { id: 'queen',  data: { label: 'Queen' },  position: { x: 80,  y: 250 } },
        { id: 'rook',   data: { label: 'Rook' },   position: { x: 310, y: 250 } },
        { id: 'knight', data: { label: 'Knight' }, position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'king',   target: 'piece', label: 'extends',             type: 'smoothstep' },
        { id: 'e2', source: 'queen',  target: 'piece', label: 'extends',             type: 'smoothstep' },
        { id: 'e3', source: 'rook',   target: 'piece', label: 'extends',             type: 'smoothstep' },
        { id: 'e4', source: 'knight', target: 'piece', label: 'extends',             type: 'smoothstep' },
        { id: 'e5', source: 'board',  target: 'piece', label: 'contains',            type: 'smoothstep' },
        { id: 'e6', source: 'board',  target: 'king',  label: 'isValidMove() switch', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'srp_violation',
        targetClass: 'board',
        description:
          'Board is responsible for spatial arrangement of pieces AND for encoding every piece\'s movement rules inside a switch statement. Adding a new piece type (e.g., Amazon or custom variant) requires modifying Board, not just adding a new Piece subclass. This breaks OCP and makes Board a knowledge repository for piece-specific domain logic that does not belong there.',
        interviewContext:
          'The interviewer tests whether the candidate understands polymorphic dispatch. A senior engineer adds an abstract validateMove(Board board, Position from, Position to) to Piece and implements it in each subclass, making Board\'s role purely spatial — it asks pieces whether a move is legal rather than deciding for them.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'piece',
        description:
          'Piece has no abstract validateMove() method, so the inheritance hierarchy provides type classification but no behavioural contract. Callers cannot treat any Piece polymorphically for validation, forcing the switch/case anti-pattern at Board. The hierarchy conveys is-a relationships without enabling the key polymorphic operation the domain requires.',
        interviewContext:
          'Interviewers probe the difference between a taxonomic hierarchy and a behavioural contract. The senior answer adds validateMove(Board, Position, Position): boolean to the Piece interface or abstract class, enabling Board to call piece.validateMove(this, from, to) without any type inspection, achieving true open/closed extensibility.',
      },
    ],
    explanation:
      'The correct design declares validateMove(Board board, Position from, Position to): boolean as an abstract method on Piece, implemented uniquely by King (one step any direction), Queen (rank, file, diagonal), Rook (rank and file), Knight (L-shape), etc. Board delegates validation entirely to pieces — it becomes responsible only for spatial state and checking whether a destination is occupied by an allied piece. This follows the Template Method and Polymorphism principles. Adding a new piece type requires only a new Piece subclass with its own validation logic, leaving Board, the existing pieces, and all tests untouched.',
  },

  // ─── 46 ───────────────────────────────────────────────────────────────────
  {
    slug: 'twitter-tweet-god-class',
    title: 'Twitter — Tweet God Class',
    description:
      'Tweet handles media upload, hashtag extraction, mention parsing, timeline fan-out, and like/retweet notification all in one class, making it a god object that mixes entity state with multiple infrastructure concerns.',
    difficulty: 'medium',
    order: 46,
    diagramData: {
      nodes: [
        { id: 'tweet',        data: { label: 'Tweet' },        position: { x: 80,  y: 80  } },
        { id: 'user',         data: { label: 'User' },         position: { x: 310, y: 80  } },
        { id: 'media',        data: { label: 'Media' },        position: { x: 540, y: 80  } },
        { id: 'hashtag',      data: { label: 'Hashtag' },      position: { x: 80,  y: 250 } },
        { id: 'timeline',     data: { label: 'Timeline' },     position: { x: 310, y: 250 } },
        { id: 'notification', data: { label: 'Notification' }, position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'tweet', target: 'user',         label: 'authored by',      type: 'smoothstep' },
        { id: 'e2', source: 'tweet', target: 'media',        label: 'uploads inline',   type: 'smoothstep' },
        { id: 'e3', source: 'tweet', target: 'hashtag',      label: 'extracts inline',  type: 'smoothstep' },
        { id: 'e4', source: 'tweet', target: 'timeline',     label: 'fan-out inline',   type: 'smoothstep' },
        { id: 'e5', source: 'tweet', target: 'notification', label: 'like/retweet send', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'tweet',
        description:
          'Tweet conflates entity state (text, authorId, timestamp) with at least four pipeline concerns: media blob upload, hashtag/mention indexing, timeline fan-out to followers, and engagement notification dispatch. Each concern has its own external dependencies (blob store, search index, fan-out queue, push service) and independent failure modes. A failure in timeline fan-out should not prevent a tweet from being persisted, but co-location makes isolation impossible.',
        interviewContext:
          'The interviewer is checking whether the candidate can identify pipeline concerns in a social platform and separate them from the entity. A senior engineer posts a TweetCreated domain event and routes it to MediaUploadHandler, HashtagIndexer, FanOutService, and NotificationService independently — enabling per-stage retries and independent scaling.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'tweet',
        description:
          'Timeline fan-out — distributing a tweet to every follower\'s feed — is a heavy write-amplification operation that belongs in an async pipeline, not in a domain entity. Having Tweet.post() trigger fan-out inline makes every write a synchronous O(followers) operation and couples tweet creation latency to follower count, which is unacceptable at scale.',
        interviewContext:
          'The interviewer is probing scalability awareness and the push vs pull fan-out trade-off. A senior answer uses a hybrid fan-out model: enqueue a FanOutJob on tweet creation, with the FanOutService pushing to active followers\' timelines and celebrity accounts using a pull model. Tweet has no knowledge of this pipeline.',
      },
    ],
    explanation:
      'The correct design treats Tweet as a thin entity (id, text, mediaIds, authorId, createdAt) that publishes a TweetCreated domain event on persistence. A pipeline of independent handlers subscribes: MediaService processes and stores blobs, HashtagService parses and indexes tags, MentionService resolves @mentions, FanOutService populates follower feeds asynchronously, and NotificationService dispatches push alerts. This follows Event-Driven Architecture and the Single Responsibility Principle. Each handler is independently deployable, retryable, and scalable — fan-out can be horizontally sharded while media upload scales on IO-bound workers.',
  },

  // ─── 47 ───────────────────────────────────────────────────────────────────
  {
    slug: 'elevator-no-request-queue',
    title: 'Elevator — No Request Abstraction',
    description:
      'ElevatorController uses raw up[] and down[] integer arrays to track floor requests. There is no ElevatorRequest object and no scheduling strategy abstraction, making it impossible to swap SCAN for FCFS without rewriting the controller.',
    difficulty: 'medium',
    order: 47,
    diagramData: {
      nodes: [
        { id: 'elevatorController', data: { label: 'ElevatorController' }, position: { x: 80,  y: 80  } },
        { id: 'elevator',           data: { label: 'Elevator' },           position: { x: 310, y: 80  } },
        { id: 'floor',              data: { label: 'Floor' },              position: { x: 540, y: 80  } },
        { id: 'passenger',          data: { label: 'Passenger' },          position: { x: 80,  y: 250 } },
        { id: 'door',               data: { label: 'Door' },               position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'elevatorController', target: 'elevator',  label: 'controls',         type: 'smoothstep' },
        { id: 'e2', source: 'elevatorController', target: 'floor',     label: 'up[]/down[] arrays', type: 'smoothstep' },
        { id: 'e3', source: 'passenger',          target: 'floor',     label: 'requests at',      type: 'smoothstep' },
        { id: 'e4', source: 'elevator',           target: 'door',      label: 'opens/closes',     type: 'smoothstep' },
        { id: 'e5', source: 'elevatorController', target: 'passenger', label: 'serves',           type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'elevatorController',
        description:
          'Floor requests are stored as primitive integer arrays (up[], down[]) with no ElevatorRequest object. Without a request entity, there is no place to attach metadata such as request timestamp, priority, originating floor, destination floor, or weight sensor reading. The arrays cannot represent the full lifecycle (pending → assigned → served) needed for any non-trivial scheduling algorithm.',
        interviewContext:
          'The interviewer is checking whether the candidate thinks in terms of domain objects rather than primitives. A senior engineer introduces an ElevatorRequest value object (sourceFloor, destFloor, direction, timestamp) and a RequestQueue that the scheduler operates on, enabling richer scheduling and request cancellation.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'elevatorController',
        description:
          'The scheduling algorithm (SCAN, FCFS, LOOK) is baked directly into ElevatorController with no SchedulingStrategy interface. Switching from SCAN to FCFS requires modifying the controller, violating OCP. In a real building where different elevator banks need different scheduling policies (e.g., express vs local), there is no way to configure this without code duplication.',
        interviewContext:
          'Interviewers probe whether the candidate applies the Strategy pattern to algorithmic variation. The senior answer defines a SchedulingStrategy interface with nextRequest(List<ElevatorRequest>, int currentFloor): ElevatorRequest, implemented by SCANStrategy, FCFSStrategy, and LOOKStrategy, injected into the controller at construction time.',
      },
    ],
    explanation:
      'The correct design introduces an ElevatorRequest value object (sourceFloor, destFloor, direction, requestTime) and a DispatchScheduler interface with implementations for SCAN, FCFS, and LOOK algorithms. ElevatorController holds a RequestQueue of ElevatorRequest objects and delegates scheduling decisions to the injected DispatchScheduler. Elevator becomes a state machine (IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN) receiving move commands from the controller. This cleanly separates hardware control (Elevator), request management (RequestQueue), and scheduling policy (DispatchScheduler), following SRP and the Strategy pattern.',
  },

  // ─── 48 ───────────────────────────────────────────────────────────────────
  {
    slug: 'restaurant-order-god',
    title: 'Restaurant POS — Order God Class',
    description:
      'Order handles table assignment, item pricing, tax calculation, discount application, kitchen routing, and receipt printing all inline. Every POS concern lives in one class, making it a textbook god object.',
    difficulty: 'medium',
    order: 48,
    diagramData: {
      nodes: [
        { id: 'order',         data: { label: 'Order' },         position: { x: 80,  y: 80  } },
        { id: 'table',         data: { label: 'Table' },         position: { x: 310, y: 80  } },
        { id: 'menuItem',      data: { label: 'MenuItem' },      position: { x: 540, y: 80  } },
        { id: 'kitchen',       data: { label: 'Kitchen' },       position: { x: 80,  y: 250 } },
        { id: 'receipt',       data: { label: 'Receipt' },       position: { x: 310, y: 250 } },
        { id: 'taxCalculator', data: { label: 'TaxCalculator' }, position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'order', target: 'table',         label: 'assigned to',     type: 'smoothstep' },
        { id: 'e2', source: 'order', target: 'menuItem',      label: 'contains',        type: 'smoothstep' },
        { id: 'e3', source: 'order', target: 'kitchen',       label: 'routes inline',   type: 'smoothstep' },
        { id: 'e4', source: 'order', target: 'receipt',       label: 'prints inline',   type: 'smoothstep' },
        { id: 'e5', source: 'order', target: 'taxCalculator', label: 'calculates tax',  type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'order',
        description:
          'Order performs table assignment, item pricing, tax calculation, discount application, kitchen routing, and receipt generation — six distinct responsibilities with completely different change axes. Tax rules change for compliance, discount rules change for marketing, kitchen routing changes for operational reasons, and receipt printing changes for branding. Bundling all of these into Order means that a marketing discount campaign triggers a change to the same class as a tax law update.',
        interviewContext:
          'The interviewer is testing whether the candidate can identify responsibility axes in a POS system. A senior answer decomposes into OrderEntity (state), PricingService (item costs + discounts), TaxService (jurisdiction-aware tax), KitchenRouter (operational routing), and ReceiptPrinter (presentation), each injected into an OrderFulfillmentService that coordinates the workflow.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'order',
        description:
          'Order directly sends tickets to Kitchen by invoking routing logic inline, coupling the domain entity to kitchen operational topology. If the restaurant adds a separate bar station or a dessert station, the Order class must be modified. Kitchen routing is an operational concern that should be encapsulated in a KitchenRouter or TicketDispatcher, not embedded in the order entity.',
        interviewContext:
          'Interviewers check whether candidates separate domain entities from operational workflows. The senior answer has Order emit an OrderPlaced event, and KitchenRouter subscribes to map line items to the appropriate station (grill, cold kitchen, bar), keeping Order agnostic to kitchen topology changes.',
      },
    ],
    explanation:
      'The correct design treats Order as a pure entity holding items, table reference, and status. An OrderService coordinates the placement workflow: PricingService computes subtotals, DiscountEngine applies applicable promotions, TaxService calculates jurisdiction-specific tax, then Order is persisted and an OrderPlaced event is published. KitchenRouter subscribes to the event and dispatches station tickets; ReceiptService generates the printable receipt. This follows SRP, the Chain of Responsibility pattern for pricing rules, and Event-Driven Architecture for post-order operations — each component independently testable and replaceable.',
  },

  // ─── 49 ───────────────────────────────────────────────────────────────────
  {
    slug: 'airline-flight-wrong-inherit',
    title: 'Airline — FlightRoute Extends Flight',
    description:
      'FlightRoute inherits from Flight via extends, but a route is not a flight. A FlightRoute describes the path between airports and has many flights scheduled on it; it should contain a List<Flight>, not be a subtype of Flight.',
    difficulty: 'medium',
    order: 49,
    diagramData: {
      nodes: [
        { id: 'flightRoute', data: { label: 'FlightRoute' }, position: { x: 80,  y: 80  } },
        { id: 'flight',      data: { label: 'Flight' },      position: { x: 310, y: 80  } },
        { id: 'airport',     data: { label: 'Airport' },     position: { x: 540, y: 80  } },
        { id: 'airline',     data: { label: 'Airline' },     position: { x: 80,  y: 250 } },
        { id: 'schedule',    data: { label: 'Schedule' },    position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'flightRoute', target: 'flight',   label: 'extends (WRONG)',  type: 'smoothstep' },
        { id: 'e2', source: 'flight',      target: 'airport',  label: 'departs from',     type: 'smoothstep' },
        { id: 'e3', source: 'flightRoute', target: 'airport',  label: 'connects airports', type: 'smoothstep' },
        { id: 'e4', source: 'airline',     target: 'flight',   label: 'operates',         type: 'smoothstep' },
        { id: 'e5', source: 'schedule',    target: 'flight',   label: 'schedules',        type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'flightRoute',
        description:
          'FlightRoute extends Flight, implying a FlightRoute IS-A Flight, which fails the Liskov Substitution Test. A route describes a geographic path (origin → destination airport pair) and can have dozens of flights across different days. Inheriting from Flight causes FlightRoute to absorb irrelevant attributes (departureTime, aircraft, flightNumber) and will break any polymorphic consumer that treats it as a Flight.',
        interviewContext:
          'The interviewer is testing whether the candidate applies the IS-A vs HAS-A test. A senior engineer immediately identifies the inversion: FlightRoute should have a List<Flight> (composition), representing the scheduled flights on a given route. FlightRoute holds origin/destination airports and operational metadata, while Flight holds the specific scheduled instance.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'flightRoute',
        description:
          'FlightRoute lacks a List<Flight> field, meaning there is no model for the many flights scheduled on a single route. Without this composition, queries like "show me all flights on the JFK-LHR route next week" cannot be naturally expressed in the domain model. The has-a relationship is entirely absent, replaced by an incorrect is-a that inverts the conceptual hierarchy.',
        interviewContext:
          'Interviewers check domain modelling fluency. The senior answer gives FlightRoute fields for originAirport, destinationAirport, routeCode, and a scheduledFlights: List<Flight> association, making the relationship explicit and enabling route-level queries and analytics without abusing inheritance.',
      },
    ],
    explanation:
      'The correct design uses composition over inheritance: FlightRoute is a standalone entity with originAirport, destinationAirport, and a scheduledFlights: List<Flight>. Flight is an independent entity linked to its route and holding time/aircraft/crew specifics. Airline owns a portfolio of FlightRoutes. This cleanly models the domain — a route exists independently of any specific scheduled departure — and follows the principle of preferring composition over inheritance whenever the IS-A test fails. Schedule then becomes an aggregator that associates FlightRoute with time-slotted Flights.',
  },

  // ─── 50 ───────────────────────────────────────────────────────────────────
  {
    slug: 'ecommerce-product-catalog-coupled',
    title: 'E-Commerce — Product Coupled to Inventory',
    description:
      'Product holds stockLevel, warehouseId, and reorderThreshold alongside price and description. Catalog concerns and inventory concerns live in one class, violating bounded-context boundaries and making Product a catch-all.',
    difficulty: 'medium',
    order: 50,
    diagramData: {
      nodes: [
        { id: 'product',   data: { label: 'Product' },   position: { x: 80,  y: 80  } },
        { id: 'inventory', data: { label: 'Inventory' }, position: { x: 310, y: 80  } },
        { id: 'warehouse', data: { label: 'Warehouse' }, position: { x: 540, y: 80  } },
        { id: 'category',  data: { label: 'Category' },  position: { x: 80,  y: 250 } },
        { id: 'price',     data: { label: 'Price' },     position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'product',   target: 'inventory', label: 'has stockLevel',     type: 'smoothstep' },
        { id: 'e2', source: 'product',   target: 'warehouse', label: 'warehouseId inline',  type: 'smoothstep' },
        { id: 'e3', source: 'product',   target: 'category',  label: 'belongs to',         type: 'smoothstep' },
        { id: 'e4', source: 'product',   target: 'price',     label: 'has price',          type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'coupling_issue',
        targetClass: 'product',
        description:
          'Product mixes catalog attributes (name, description, images, category, price) with inventory attributes (stockLevel, warehouseId, reorderThreshold). These belong to different bounded contexts with different update frequencies: catalog data changes for marketing reasons, while inventory data changes in real time with every sale and restock. Co-locating them creates spurious coupling between the Catalog and Inventory teams.',
        interviewContext:
          'The interviewer is probing bounded-context awareness (DDD). A senior answer separates ProductCatalogEntry (catalog BC: name, description, images, price, categoryId) from InventoryRecord (inventory BC: productId, stockLevel, warehouseId, reorderThreshold), related only by productId, not by inheritance or direct object reference.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'product',
        description:
          'Product has dual change reasons: marketing teams update descriptions and images, while warehouse systems update stock levels and reorder points. Any deploy for a description change must touch the same class as a stock-level schema migration. This increases the risk of cross-contamination between concerns and makes the class a permanent conflict hotspot for two independent teams.',
        interviewContext:
          'Interviewers check whether candidates articulate SRP in terms of "reason to change." The senior answer explicitly names the two change actors — marketing/catalog and warehouse/fulfillment — and uses that to justify creating two separate entities in separate modules, joined by a shared productId key.',
      },
    ],
    explanation:
      'The correct design separates concerns by bounded context: ProductCatalogItem owns name, description, mediaUrls, category, and PricingDetails, serving the Catalog and Search contexts. InventoryRecord owns productId (FK), warehouseId, stockLevel, reservedQuantity, and reorderThreshold, serving the Inventory and Fulfillment contexts. They communicate via productId references and domain events (StockLevelUpdated) rather than direct field coupling. This follows DDD Bounded Context boundaries, keeps each team\'s schema changes isolated, and allows inventory to scale independently of the catalog service.',
  },

  // ─── 51 ───────────────────────────────────────────────────────────────────
  {
    slug: 'hospital-patient-god',
    title: 'Hospital — Patient God Class',
    description:
      'Patient exposes schedule(), prescribe(), generateBill(), bookRoom(), and runLabTest() — five responsibilities spanning scheduling, clinical, financial, accommodation, and diagnostic domains all in one entity.',
    difficulty: 'medium',
    order: 51,
    diagramData: {
      nodes: [
        { id: 'patient',  data: { label: 'Patient' },  position: { x: 80,  y: 80  } },
        { id: 'doctor',   data: { label: 'Doctor' },   position: { x: 310, y: 80  } },
        { id: 'room',     data: { label: 'Room' },     position: { x: 540, y: 80  } },
        { id: 'lab',      data: { label: 'Lab' },      position: { x: 80,  y: 250 } },
        { id: 'billing',  data: { label: 'Billing' },  position: { x: 310, y: 250 } },
        { id: 'pharmacy', data: { label: 'Pharmacy' }, position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'patient', target: 'doctor',   label: 'schedule()',      type: 'smoothstep' },
        { id: 'e2', source: 'patient', target: 'room',     label: 'bookRoom()',      type: 'smoothstep' },
        { id: 'e3', source: 'patient', target: 'lab',      label: 'runLabTest()',    type: 'smoothstep' },
        { id: 'e4', source: 'patient', target: 'billing',  label: 'generateBill()', type: 'smoothstep' },
        { id: 'e5', source: 'patient', target: 'pharmacy', label: 'prescribe()',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'patient',
        description:
          'Patient acts as the system entry point for five unrelated hospital subsystems. A domain entity should hold identity and medical data, not orchestrate appointments, billing, labs, and pharmacy workflows. Any change in billing regulation, lab ordering protocol, or room allocation logic forces modification of the Patient class, making it a permanent conflict zone for every hospital department\'s developers.',
        interviewContext:
          'The interviewer checks whether the candidate can identify and decompose a god class in a regulated domain. A senior answer separates Patient (entity: demographics, medical record number), AppointmentService, BillingService, LabOrderService, AdmissionService, and PrescriptionService, each receiving a patientId and operating independently within their own bounded contexts.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'patient',
        description:
          'generateBill() on a Patient entity couples a financial concern directly to a clinical entity. Billing has its own regulatory requirements (ICD codes, insurance claim logic, payment plans) that are completely orthogonal to patient identity and medical history. Embedding billing logic in Patient means a billing schema change forces a redeploy of the patient domain model.',
        interviewContext:
          'Interviewers probe whether candidates apply SRP at the bounded-context level. The senior answer explains that Patient belongs to the Clinical context (demographics, allergies, conditions), while BillingAccount belongs to the Financial context, linked by a shared patientId. The two contexts communicate via events (PatientDischarged triggers billing finalization), not direct method calls.',
      },
    ],
    explanation:
      'The correct design restricts Patient to a pure clinical entity (demographics, medical record number, allergies, conditions). Each hospital domain gets its own service: AppointmentService (scheduling with doctors), AdmissionService (room allocation), LabOrderService (test ordering and results), PrescriptionService (medication management), and BillingService (charges, insurance, payments). These services receive patientId as a reference and operate within their own bounded contexts. Domain events (PatientAdmitted, PatientDischarged) propagate state changes across contexts asynchronously, following DDD and Event-Driven Architecture patterns.',
  },

  // ─── 52 ───────────────────────────────────────────────────────────────────
  {
    slug: 'spotify-playlist-no-strategy',
    title: 'Spotify — No Shuffle Strategy',
    description:
      'Playlist.shuffle() uses an if/else chain for Normal, Weighted, and Smart shuffle modes. The Strategy pattern is absent, and Playlist also owns the full Song list directly, coupling data with algorithmic behaviour.',
    difficulty: 'medium',
    order: 52,
    diagramData: {
      nodes: [
        { id: 'playlist',       data: { label: 'Playlist' },       position: { x: 80,  y: 80  } },
        { id: 'song',           data: { label: 'Song' },           position: { x: 310, y: 80  } },
        { id: 'user',           data: { label: 'User' },           position: { x: 540, y: 80  } },
        { id: 'playbackEngine', data: { label: 'PlaybackEngine' }, position: { x: 80,  y: 250 } },
        { id: 'shuffleMode',    data: { label: 'ShuffleMode' },    position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'playlist',       target: 'song',        label: 'contains List<Song>', type: 'smoothstep' },
        { id: 'e2', source: 'playlist',       target: 'user',        label: 'owned by',            type: 'smoothstep' },
        { id: 'e3', source: 'playlist',       target: 'shuffleMode', label: 'shuffle() if/else',   type: 'smoothstep' },
        { id: 'e4', source: 'playbackEngine', target: 'playlist',    label: 'plays',               type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'playlist',
        description:
          'Playlist.shuffle() contains an if/else chain that encodes Normal, Weighted, and Smart shuffle algorithms inline. Adding a new shuffle mode (e.g., Genre-aware) requires modifying Playlist, violating OCP. Each algorithm has different data requirements (play-count weights for Weighted, listening-history embeddings for Smart), so they do not belong in the same method body of a playlist entity.',
        interviewContext:
          'The interviewer tests Strategy pattern knowledge. A senior answer defines a ShuffleStrategy interface with reorder(List<Song>): List<Song>, implemented by NormalShuffleStrategy (Fisher-Yates), WeightedShuffleStrategy (weight by play count), and SmartShuffleStrategy (ML reranking). Playlist accepts a ShuffleStrategy at construction or per-call, cleanly separating algorithmic variation from entity state.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'playlist',
        description:
          'Playlist directly holds a List<Song> (the full data objects) rather than a list of songIds, coupling the playlist entity to the Song domain model. If Song gains new fields or changes schema, Playlist must be updated. For very large playlists this also means loading thousands of Song objects into memory when constructing a Playlist, even for metadata-only operations.',
        interviewContext:
          'Interviewers probe whether candidates model entities with appropriate references rather than embedding. A senior answer has Playlist hold List<String> songIds, with a SongRepository injected into PlaybackEngine for lazy resolution of Song data only when playback actually begins.',
      },
    ],
    explanation:
      'The correct design introduces a ShuffleStrategy interface (reorder(List<String> songIds): List<String>) with NormalShuffleStrategy, WeightedShuffleStrategy (requires PlayCountStore), and SmartShuffleStrategy (requires RecommendationEngine) as implementations. Playlist holds songIds and an injected ShuffleStrategy, cleanly separating data from algorithm. PlaybackEngine resolves Song entities from a SongRepository lazily during playback. New shuffle modes are added as new strategy classes with no changes to Playlist, following the Open/Closed Principle.',
  },

  // ─── 53 ───────────────────────────────────────────────────────────────────
  {
    slug: 'food-delivery-order-state',
    title: 'Food Delivery — Order State Without State Pattern',
    description:
      'Order uses a status string and a giant if/else inside changeStatus() to gate transitions. Delivery agent assignment is also handled inline, mixing state machine logic with operational workflow in one class.',
    difficulty: 'medium',
    order: 53,
    diagramData: {
      nodes: [
        { id: 'order',         data: { label: 'Order' },         position: { x: 80,  y: 80  } },
        { id: 'restaurant',    data: { label: 'Restaurant' },    position: { x: 310, y: 80  } },
        { id: 'customer',      data: { label: 'Customer' },      position: { x: 540, y: 80  } },
        { id: 'deliveryAgent', data: { label: 'DeliveryAgent' }, position: { x: 80,  y: 250 } },
        { id: 'orderState',    data: { label: 'OrderState' },    position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'customer',   target: 'order',         label: 'places',              type: 'smoothstep' },
        { id: 'e2', source: 'order',      target: 'restaurant',    label: 'from',                type: 'smoothstep' },
        { id: 'e3', source: 'order',      target: 'deliveryAgent', label: 'assigns inline',      type: 'smoothstep' },
        { id: 'e4', source: 'order',      target: 'orderState',    label: 'changeStatus() if/else', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'order',
        description:
          'Order\'s changeStatus() uses a string-based if/else to guard transitions (e.g., PLACED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED), with all transition logic, validation, and side effects crammed into one method. Adding a new state (PARTIALLY_FULFILLED) requires modifying this method, risking regression across all existing transitions. The State pattern is the canonical solution for this class of problem.',
        interviewContext:
          'Interviewers test awareness of the State pattern. A senior answer introduces an OrderState interface with handle(Order, Event) and the allowed next states, implemented by PlacedState, ConfirmedState, PreparingState, OutForDeliveryState, and DeliveredState. Order delegates transition logic to its current state object, making each state\'s rules self-contained and independently testable.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'order',
        description:
          'Order assigns a DeliveryAgent inline within the same class that manages restaurant communication and customer-facing state. Delivery agent assignment is an operational matching problem (proximity, availability, rating) that should be handled by a DispatchService. Embedding it in Order tightly couples the domain entity to fleet management logic, which changes independently and frequently.',
        interviewContext:
          'The interviewer checks whether the candidate separates domain entities from operational workflow services. The senior answer has Order emit an OrderReadyForPickup event when it transitions to PREPARED state, and a DispatchService subscribes, selects an agent, and calls order.assignAgent(agentId), keeping Order free of agent-selection logic.',
      },
    ],
    explanation:
      'The correct design applies the State pattern: OrderState is an interface with method handle(Order ctx, OrderEvent event), implemented by PlacedState, ConfirmedState, PreparingState, OutForDeliveryState, and DeliveredState. Order holds currentState and delegates changeStatus() to it. Agent assignment is handled by a DispatchService that subscribes to OrderReadyForPickup events and applies a matching algorithm (nearest available agent). This separates the domain entity from operational workflow, follows SRP, and makes each state\'s valid transitions and side effects self-documenting and independently testable.',
  },

  // ─── 54 ───────────────────────────────────────────────────────────────────
  {
    slug: 'voting-system-no-ballot',
    title: 'Voting System — No Ballot Abstraction',
    description:
      'Election directly holds a Candidate[] array and embeds vote-counting logic alongside election management. There is no Ballot entity, so individual votes are not first-class objects and cannot be audited, validated, or recounted independently.',
    difficulty: 'medium',
    order: 54,
    diagramData: {
      nodes: [
        { id: 'election',      data: { label: 'Election' },      position: { x: 80,  y: 80  } },
        { id: 'candidate',     data: { label: 'Candidate' },     position: { x: 310, y: 80  } },
        { id: 'voter',         data: { label: 'Voter' },         position: { x: 540, y: 80  } },
        { id: 'voteRecord',    data: { label: 'VoteRecord' },    position: { x: 80,  y: 250 } },
        { id: 'countingLogic', data: { label: 'CountingLogic' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'election',   target: 'candidate',     label: 'holds Candidate[]',  type: 'smoothstep' },
        { id: 'e2', source: 'voter',      target: 'election',      label: 'votes in',           type: 'smoothstep' },
        { id: 'e3', source: 'election',   target: 'countingLogic', label: 'counts votes inline', type: 'smoothstep' },
        { id: 'e4', source: 'voter',      target: 'voteRecord',    label: 'creates',            type: 'smoothstep' },
        { id: 'e5', source: 'election',   target: 'voteRecord',    label: 'aggregates',         type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'election',
        description:
          'There is no Ballot entity representing a single voter\'s act of choosing a candidate. Without Ballot, individual votes cannot be validated (was this voter eligible?), audited (who voted for whom, anonymised?), or recounted in disputed elections. Counting logic directly mutates candidate.voteCount, making it impossible to replay or verify the tally from source records.',
        interviewContext:
          'The interviewer tests whether the candidate recognises vote integrity as a first-class domain concern. A senior engineer introduces a Ballot entity (ballotId, voterId-hash, candidateId, electionId, timestamp, signature) which is immutable once cast. A separate TallyService aggregates Ballots, enabling independent audit and recount without touching Election or Candidate.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'election',
        description:
          'Election manages candidate registration, voter eligibility, ballot acceptance, vote counting, and result publication — five distinct responsibilities. Election management (who runs, when it opens) and vote tallying (counting ballots) are separate concerns with different security and audit requirements. Their co-location in one class makes it impossible to have different access controls on administrative vs counting operations.',
        interviewContext:
          'Interviewers probe whether the candidate can articulate security and auditability as drivers for SRP in sensitive domains. The senior answer separates ElectionManagementService (configure, open, close), BallotService (accept and store Ballots), and TallyService (aggregate results), each with independent access controls and audit logging.',
      },
    ],
    explanation:
      'The correct design introduces Ballot as an immutable entity (ballotId, anonymousVoterId, candidateId, electionId, castAt, cryptographic signature). ElectionManagementService handles lifecycle (create, open, close). VoterAuthorizationService checks eligibility and issues a single-use BallotToken per voter. BallotService accepts and persists a signed Ballot against the token. TallyService aggregates Ballot records to compute results, supporting recount and audit. Separating Ballot from Election enables cryptographic verification, recounts, and role-based access control — critical properties for any voting system.',
  },

  // ─── 55 ───────────────────────────────────────────────────────────────────
  {
    slug: 'parking-lot-ticket-god',
    title: 'Parking Lot — Ticket God Class',
    description:
      'ParkingTicket handles entry/exit timestamps, fee calculation, payment processing, receipt printing, and spot release all in one class. A ticket entity is doing the work of at least four separate services.',
    difficulty: 'medium',
    order: 55,
    diagramData: {
      nodes: [
        { id: 'parkingTicket',     data: { label: 'ParkingTicket' },     position: { x: 80,  y: 80  } },
        { id: 'parkingSpot',       data: { label: 'ParkingSpot' },       position: { x: 310, y: 80  } },
        { id: 'vehicle',           data: { label: 'Vehicle' },           position: { x: 540, y: 80  } },
        { id: 'paymentProcessor',  data: { label: 'PaymentProcessor' },  position: { x: 80,  y: 250 } },
        { id: 'feeCalculator',     data: { label: 'FeeCalculator' },     position: { x: 310, y: 250 } },
        { id: 'receipt',           data: { label: 'Receipt' },           position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'parkingTicket', target: 'parkingSpot',      label: 'reserves/releases', type: 'smoothstep' },
        { id: 'e2', source: 'parkingTicket', target: 'vehicle',          label: 'for vehicle',       type: 'smoothstep' },
        { id: 'e3', source: 'parkingTicket', target: 'paymentProcessor', label: 'processes payment', type: 'smoothstep' },
        { id: 'e4', source: 'parkingTicket', target: 'feeCalculator',    label: 'calculates fee',    type: 'smoothstep' },
        { id: 'e5', source: 'parkingTicket', target: 'receipt',          label: 'prints receipt',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'parkingTicket',
        description:
          'ParkingTicket embeds fee calculation, payment processing, spot release, and receipt printing alongside its core identity data (entry time, spot reference, vehicle plate). These are four distinct concerns with different dependencies: fee calculation depends on rate tables, payment depends on a payment gateway, spot release depends on SpotRepository, and receipt printing depends on a printer or PDF service. Any change to tax rates, payment provider, or receipt format touches the same class.',
        interviewContext:
          'The interviewer tests whether the candidate can identify a god class in a simple domain and decompose it cleanly. A senior answer defines ParkingTicket as a pure entity (entryTime, spotId, vehicleId), and delegates to FeeCalculator, PaymentService, SpotManager, and ReceiptService, all coordinated by a ParkingExitWorkflow service.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'parkingTicket',
        description:
          'ParkingTicket directly invokes payment processing, making a domain entity dependent on a payment gateway — a heavy external infrastructure concern. This prevents using ParkingTicket in read models, audits, or reporting pipelines without requiring a live payment gateway. It also means unit tests for parking duration calculation must mock out the payment subsystem.',
        interviewContext:
          'Interviewers probe domain/infrastructure separation. The senior answer has ParkingTicket hold only entry/exit times and spotId. On exit, a ParkingExitService computes the fee via FeeCalculator, charges via PaymentService, calls SpotManager to release the spot, and prints the receipt via ReceiptService — keeping the entity free of infrastructure dependencies.',
      },
    ],
    explanation:
      'The correct design treats ParkingTicket as a pure entity (ticketId, vehicleId, spotId, entryTime, exitTime, status). FeeCalculator is a domain service that applies rate tables (hourly, daily, weekend) to compute the charge. PaymentService handles gateway interaction. SpotManager releases the spot on confirmed payment. ReceiptService generates the printable/email receipt. A ParkingExitWorkflow service orchestrates these steps in sequence, following the Facade pattern. Each service is independently testable, and changing the payment provider or fee structure requires no changes to ParkingTicket.',
  },

  // ─── 56 ───────────────────────────────────────────────────────────────────
  {
    slug: 'messaging-app-no-channel',
    title: 'Messaging — No Channel Abstraction',
    description:
      'Chat sends both DMs and group messages with duplicated delivery logic and no Channel interface. ReadReceipt tracking is mixed directly into Chat, adding a third responsibility to an already bloated class.',
    difficulty: 'medium',
    order: 56,
    diagramData: {
      nodes: [
        { id: 'chat',          data: { label: 'Chat' },          position: { x: 80,  y: 80  } },
        { id: 'directMessage', data: { label: 'DirectMessage' }, position: { x: 310, y: 80  } },
        { id: 'groupMessage',  data: { label: 'GroupMessage' },  position: { x: 540, y: 80  } },
        { id: 'user',          data: { label: 'User' },          position: { x: 80,  y: 250 } },
        { id: 'readReceipt',   data: { label: 'ReadReceipt' },   position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'chat', target: 'directMessage', label: 'sends DM',        type: 'smoothstep' },
        { id: 'e2', source: 'chat', target: 'groupMessage',  label: 'sends group msg', type: 'smoothstep' },
        { id: 'e3', source: 'chat', target: 'readReceipt',   label: 'tracks reads',    type: 'smoothstep' },
        { id: 'e4', source: 'user', target: 'chat',          label: 'uses',            type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'chat',
        description:
          'Chat duplicates message delivery logic for DM and GroupMessage with no shared Channel abstraction. Adding a new channel type (broadcast channel, thread, voice channel) requires modifying Chat and duplicating delivery code again. Without a Channel interface, features like message search, pinning, and moderation cannot be applied uniformly across channel types.',
        interviewContext:
          'The interviewer tests whether the candidate introduces a Channel abstraction. A senior answer defines a Channel interface with send(Message), getHistory(), and addParticipant() methods, implemented by DirectChannel and GroupChannel. Chat becomes a thin coordinator that routes to the appropriate Channel implementation, with new channel types added without touching Chat.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'chat',
        description:
          'ReadReceipt tracking is embedded directly in Chat alongside message delivery. ReadReceipt has its own lifecycle (marked when read, synced across devices, expired after certain periods) and storage requirements (typically a separate table indexed by userId + messageId). Coupling it to Chat makes it impossible to independently scale or replace the read-tracking subsystem.',
        interviewContext:
          'Interviewers probe whether candidates recognise independent lifecycle as a separation criterion. A senior engineer moves ReadReceipt into a dedicated ReadReceiptService that listens for MessageDelivered events and maintains its own store, decoupled from the Channel message delivery pipeline.',
      },
    ],
    explanation:
      'The correct design defines a Channel interface with send(Message), getMessages(pagination), and markRead(userId, messageId) operations. DirectChannel and GroupChannel implement it with type-appropriate participant management and delivery logic. A separate ReadReceiptService maintains read state by subscribing to MessageSeen events, with its own indexed store. Chat becomes a thin application service that looks up the appropriate Channel and delegates, following the Strategy and Repository patterns. New channel types (broadcast, thread) are added as new Channel implementations with zero changes to the application layer.',
  },

  // ─── 57 ───────────────────────────────────────────────────────────────────
  {
    slug: 'stock-market-wrong-observer',
    title: 'Stock Market — Wrong Observer Direction',
    description:
      'StockPrice extends MarketSubscriber, inverting the Observer pattern. Price should be the Subject (observable), and Portfolio and AlertService should be the observers — not the other way around.',
    difficulty: 'medium',
    order: 57,
    diagramData: {
      nodes: [
        { id: 'stockPrice',       data: { label: 'StockPrice' },       position: { x: 80,  y: 80  } },
        { id: 'marketSubscriber', data: { label: 'MarketSubscriber' }, position: { x: 310, y: 80  } },
        { id: 'portfolio',        data: { label: 'Portfolio' },        position: { x: 540, y: 80  } },
        { id: 'alertService',     data: { label: 'AlertService' },     position: { x: 80,  y: 250 } },
        { id: 'exchange',         data: { label: 'Exchange' },         position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'stockPrice',   target: 'marketSubscriber', label: 'extends (WRONG)',  type: 'smoothstep' },
        { id: 'e2', source: 'portfolio',    target: 'marketSubscriber', label: 'extends',          type: 'smoothstep' },
        { id: 'e3', source: 'alertService', target: 'marketSubscriber', label: 'extends',          type: 'smoothstep' },
        { id: 'e4', source: 'exchange',     target: 'stockPrice',       label: 'updates price',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'stockPrice',
        description:
          'StockPrice extends MarketSubscriber, making price an observer of the market rather than the thing being observed. This inverts the semantic intent: price updates originate at StockPrice (the subject), not at MarketSubscriber. As a result, consumers like Portfolio and AlertService cannot register to be notified of price changes — they share the wrong base class and cannot receive events from StockPrice.',
        interviewContext:
          'The interviewer is directly testing Observer pattern comprehension. A senior engineer identifies that StockPrice should implement an Observable (Subject) interface with subscribe(PriceObserver), unsubscribe(PriceObserver), and notifyObservers(PriceChange). Portfolio and AlertService implement PriceObserver with an onPriceChange(PriceChange) callback.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'stockPrice',
        description:
          'StockPrice has no Subject/Observable interface, so there is no contract for registering observers, and any class that wants price updates must poll or be hardcoded as a dependency of StockPrice. Without an Observable contract, adding a new consumer (e.g., RiskEngine) requires modifying StockPrice directly, violating OCP.',
        interviewContext:
          'Interviewers check whether the candidate can correct the pattern direction and articulate the full Subject-Observer contract. A senior answer defines PriceSubject interface (subscribe, unsubscribe, notify) and PriceObserver interface (onPriceChange), has StockPrice implement PriceSubject, and has Portfolio and AlertService implement PriceObserver — textbook Gang of Four Observer.',
      },
    ],
    explanation:
      'The correct design follows the Gang of Four Observer pattern. StockPrice implements PriceSubject (subscribe(PriceObserver), unsubscribe(PriceObserver), notifyAll(PriceChangeEvent)) and maintains a list of registered observers. Portfolio and AlertService implement PriceObserver with onPriceChange(PriceChangeEvent). Exchange calls stockPrice.setPrice(newPrice), which triggers notifyAll(). This allows any number of new consumers (RiskEngine, OptionsCalculator) to subscribe without modifying StockPrice, following OCP. The relationship is corrected from wrong inheritance to correct event delegation.',
  },

  // ─── 58 ───────────────────────────────────────────────────────────────────
  {
    slug: 'hotel-booking-no-room-type',
    title: 'Hotel — Booking References Concrete Rooms',
    description:
      'Booking holds separate typed fields for SingleRoom, DoubleRoom, and Suite. There is no RoomType abstraction, availability checking is duplicated per type, and adding a new room category requires modifying Booking.',
    difficulty: 'medium',
    order: 58,
    diagramData: {
      nodes: [
        { id: 'booking',    data: { label: 'Booking' },    position: { x: 80,  y: 80  } },
        { id: 'singleRoom', data: { label: 'SingleRoom' }, position: { x: 310, y: 80  } },
        { id: 'doubleRoom', data: { label: 'DoubleRoom' }, position: { x: 540, y: 80  } },
        { id: 'suite',      data: { label: 'Suite' },      position: { x: 770, y: 80  } },
        { id: 'guest',      data: { label: 'Guest' },      position: { x: 80,  y: 250 } },
        { id: 'roomType',   data: { label: 'RoomType' },   position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'booking', target: 'singleRoom', label: 'has SingleRoom field', type: 'smoothstep' },
        { id: 'e2', source: 'booking', target: 'doubleRoom', label: 'has DoubleRoom field', type: 'smoothstep' },
        { id: 'e3', source: 'booking', target: 'suite',      label: 'has Suite field',      type: 'smoothstep' },
        { id: 'e4', source: 'booking', target: 'guest',      label: 'for guest',            type: 'smoothstep' },
        { id: 'e5', source: 'booking', target: 'roomType',   label: 'missing abstraction',  type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'booking',
        description:
          'Booking holds separate typed fields (singleRoom: SingleRoom, doubleRoom: DoubleRoom, suite: Suite) rather than a polymorphic Room reference. Only one of these fields will be non-null at any time, which is a classic "optional fields" smell indicating a missing base type. Adding a Presidential Suite or a Family Room requires adding another nullable field and modifying Booking\'s availability check logic.',
        interviewContext:
          'The interviewer is testing whether the candidate recognises the parallel-fields smell as a missing abstraction signal. A senior answer introduces a Room entity with a RoomType enum or polymorphic hierarchy (SingleRoom, DoubleRoom, Suite all extend Room), so Booking holds a single room: Room reference and works uniformly with any room category.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'booking',
        description:
          'Availability checking is duplicated per room type inside Booking, with separate conditional branches for each concrete class. Without a RoomType abstraction, there is no uniform isAvailable(checkIn, checkOut): boolean contract that all room types honour. Any change to availability logic (e.g., minimum stay rules) must be replicated across all per-type branches.',
        interviewContext:
          'Interviewers probe OCP and polymorphism. A senior answer has Room (or a RoomAvailabilityService) expose a uniform availability contract, with each Room type adding its own constraints (Suite requires 2-night minimum, Family Room requires occupancy specification) via overriding, rather than external conditional branching in Booking.',
      },
    ],
    explanation:
      'The correct design introduces Room as an abstract entity with roomId, floor, capacity, pricePerNight, and an abstract checkAvailability(checkIn, checkOut): boolean method. SingleRoom, DoubleRoom, and Suite extend Room and override availability rules. Booking holds a room: Room reference, determined at search time by a RoomSearchService that applies filters (type, capacity, price range) and returns available rooms. Adding a new room category requires only a new Room subclass — Booking and the search service remain unchanged, following OCP.',
  },

  // ─── 59 ───────────────────────────────────────────────────────────────────
  {
    slug: 'bank-transfer-no-saga',
    title: 'Bank Transfer — No Transaction Abstraction',
    description:
      'TransferService directly calls debit on the source account and credit on the destination account inline, with no Transaction object. There is no rollback strategy if the credit step fails after debit succeeds.',
    difficulty: 'medium',
    order: 59,
    diagramData: {
      nodes: [
        { id: 'transferService',      data: { label: 'TransferService' },      position: { x: 80,  y: 80  } },
        { id: 'account',              data: { label: 'Account' },              position: { x: 310, y: 80  } },
        { id: 'auditLog',             data: { label: 'AuditLog' },             position: { x: 540, y: 80  } },
        { id: 'notificationService',  data: { label: 'NotificationService' },  position: { x: 80,  y: 250 } },
        { id: 'transaction',          data: { label: 'Transaction' },          position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'transferService', target: 'account',             label: 'debits/credits inline', type: 'smoothstep' },
        { id: 'e2', source: 'transferService', target: 'auditLog',            label: 'logs',                  type: 'smoothstep' },
        { id: 'e3', source: 'transferService', target: 'notificationService', label: 'notifies',              type: 'smoothstep' },
        { id: 'e4', source: 'transferService', target: 'transaction',         label: 'no Transaction obj',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'transferService',
        description:
          'There is no Transaction or TransferCommand object that encapsulates a transfer\'s state (pending, completed, failed, rolled-back) and its compensating action. If the credit step throws after debit succeeds, the system is left in an inconsistent state with no record of the failed compensation. A Transaction object is necessary to make the operation idempotent, retryable, and auditable.',
        interviewContext:
          'The interviewer is probing knowledge of the Command pattern and distributed transaction safety. A senior engineer introduces a Transaction entity (id, sourceAccountId, destAccountId, amount, status, createdAt) persisted before any balance mutation. The Saga or two-phase commit pattern is mentioned: debit is applied tentatively, committed only after credit succeeds, with a compensating reversal on failure.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'transferService',
        description:
          'TransferService performs balance mutation, audit logging, and push notification dispatch within the same method. These are three independent concerns: mutation is a domain operation, audit logging is a compliance concern, and notification is an infrastructure concern. A failure in notification should not affect whether a transfer is considered complete, but inlining all three makes the outcome ambiguous.',
        interviewContext:
          'Interviewers check domain/infrastructure separation. The senior answer has TransferService publish a TransferCompleted domain event after persisting the Transaction, with AuditService and NotificationService subscribing independently. This decouples success semantics from notification delivery and makes each concern retryable in isolation.',
      },
    ],
    explanation:
      'The correct design introduces a Transaction entity (id, source, destination, amount, status) created atomically before any balance change. TransferService applies a two-step Saga: debit source (PENDING), persist Transaction, credit destination, mark Transaction COMPLETED. On failure of the credit step, a compensating debit reversal is issued and Transaction is marked FAILED. An AuditService and NotificationService subscribe to TransactionCompleted and TransactionFailed events asynchronously. This follows the Saga pattern, Command pattern (Transaction as a command record), and domain event semantics for infrastructure concerns.',
  },

  // ─── 60 ───────────────────────────────────────────────────────────────────
  {
    slug: 'crm-contact-god',
    title: 'CRM — Contact God Class',
    description:
      'Contact manages email campaigns, call logs, deal pipeline, task creation, document attachment, and duplicate merging all in one class — six unrelated CRM subsystems fused into a single entity.',
    difficulty: 'medium',
    order: 60,
    diagramData: {
      nodes: [
        { id: 'contact',       data: { label: 'Contact' },       position: { x: 80,  y: 80  } },
        { id: 'emailCampaign', data: { label: 'EmailCampaign' }, position: { x: 310, y: 80  } },
        { id: 'callLog',       data: { label: 'CallLog' },       position: { x: 540, y: 80  } },
        { id: 'dealPipeline',  data: { label: 'DealPipeline' },  position: { x: 80,  y: 250 } },
        { id: 'task',          data: { label: 'Task' },          position: { x: 310, y: 250 } },
        { id: 'document',      data: { label: 'Document' },      position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'contact', target: 'emailCampaign', label: 'manages campaigns', type: 'smoothstep' },
        { id: 'e2', source: 'contact', target: 'callLog',       label: 'logs calls',        type: 'smoothstep' },
        { id: 'e3', source: 'contact', target: 'dealPipeline',  label: 'manages deals',     type: 'smoothstep' },
        { id: 'e4', source: 'contact', target: 'task',          label: 'creates tasks',     type: 'smoothstep' },
        { id: 'e5', source: 'contact', target: 'document',      label: 'attaches docs',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'contact',
        description:
          'Contact acts as the hub for six completely independent CRM subsystems: marketing (email campaigns), sales (deal pipeline), communications (call logs), task management, document management, and data quality (duplicate merging). Each subsystem has its own team, change cadence, and external integrations. Merging all into Contact creates a class that changes for six different reasons, making it untestable and unmaintainable.',
        interviewContext:
          'The interviewer checks whether the candidate can decompose a CRM god class by bounded context. A senior answer retains Contact as a thin identity entity (name, email, phone, companyId) and creates separate services: CampaignService, CallLogService, DealService, TaskService, DocumentService — each referencing Contact by contactId. This mirrors how real CRMs (Salesforce, HubSpot) partition their object model.',
      },
      {
        id: 'issue-2',
        type: 'cohesion_issue',
        targetClass: 'contact',
        description:
          'The Contact class has extremely low cohesion: its methods operate on entirely unrelated data structures (campaign templates, call transcripts, deal stages, document blobs) that share only a contactId linkage. Low cohesion means the class cannot be meaningfully described in one sentence, and any refactoring to extract a service will require touching Contact regardless of which concern is being extracted.',
        interviewContext:
          'Interviewers probe whether candidates can articulate cohesion as a design metric. A senior engineer explains that a highly cohesive class has methods that all operate on the same data. Contact\'s data (name, email, company) is only relevant to two of its six concerns — the rest should live in domain-specific aggregates linked by contactId.',
      },
    ],
    explanation:
      'The correct design keeps Contact as a lean identity aggregate (contactId, name, email, phone, companyId, tags). Each CRM subsystem becomes its own domain aggregate: EmailCampaignEnrollment (links contact to campaigns), CallRecord (captures call outcomes), Deal (pipeline stage, value, owner), Task (due date, owner, status), Document (type, blob reference, owner). Each references contactId but lives in its own bounded context with its own repository. ContactService provides read/search capabilities. This follows DDD aggregate design, SRP, and high-cohesion principles throughout.',
  },

  // ─── 61 ───────────────────────────────────────────────────────────────────
  {
    slug: 'game-score-in-player',
    title: 'Game — Score Logic in Player',
    description:
      'Player hosts computeScore(), updateLeaderboard(), and broadcastHighScore() directly on the entity. Player should hold only state (health, position, level); all score-related orchestration belongs in a ScoreService.',
    difficulty: 'medium',
    order: 61,
    diagramData: {
      nodes: [
        { id: 'player',       data: { label: 'Player' },       position: { x: 80,  y: 80  } },
        { id: 'gameSession',  data: { label: 'GameSession' },  position: { x: 310, y: 80  } },
        { id: 'leaderboard',  data: { label: 'Leaderboard' },  position: { x: 540, y: 80  } },
        { id: 'notification', data: { label: 'Notification' }, position: { x: 80,  y: 250 } },
        { id: 'scoreService', data: { label: 'ScoreService' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'player',      target: 'leaderboard',  label: 'updateLeaderboard()',  type: 'smoothstep' },
        { id: 'e2', source: 'player',      target: 'notification', label: 'broadcastHighScore()', type: 'smoothstep' },
        { id: 'e3', source: 'gameSession', target: 'player',       label: 'contains',             type: 'smoothstep' },
        { id: 'e4', source: 'player',      target: 'scoreService', label: 'computeScore()',       type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'srp_violation',
        targetClass: 'player',
        description:
          'Player simultaneously holds game-state (health, position, inventory) and performs score computation, leaderboard writes, and broadcast notifications. Score computation is domain logic that may depend on combo multipliers, difficulty modifiers, and time bonuses — it belongs in a ScoreService. Leaderboard writes are a persistence concern. Notification dispatch is an infrastructure concern. All three are incorrect responsibilities for an entity.',
        interviewContext:
          'The interviewer tests whether the candidate places domain logic and infrastructure in the correct layer. A senior engineer extracts ScoreService.computeScore(Player, GameEvent): int, LeaderboardService.recordScore(playerId, score), and publishes a HighScoreAchieved event for NotificationService to consume, leaving Player as a pure state holder.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'scoreService',
        description:
          'ScoreService is represented as a node but does not exist in the implementation — all its logic lives on Player. The absence of ScoreService means score calculation rules (base points, multipliers, bonuses) are scattered into Player and duplicated wherever scoring is needed (solo mode, team mode, tournament mode). A missing ScoreService also means there is no single place to apply scoring rule changes.',
        interviewContext:
          'Interviewers check whether the candidate can name the missing service and justify its existence. A senior answer gives ScoreService a ScoreCalculationStrategy dependency, enabling different scoring rules per game mode (NormalScoringStrategy, TournamentScoringStrategy) to be injected, applying both SRP and Strategy patterns.',
      },
    ],
    explanation:
      'The correct design restricts Player to game-state fields (health, position, level, inventory) with no outgoing calls to external services. ScoreService hosts computeScore(Player, List<GameEvent>): ScoreResult using an injected ScoringStrategy for mode-specific rules. On score finalization, ScoreService persists via LeaderboardRepository and publishes a ScoreRecorded event. A HighScoreNotificationHandler subscribes and dispatches push alerts. This follows SRP (each class has one reason to change), the Strategy pattern (pluggable scoring rules), and event-driven architecture for notifications.',
  },

  // ─── 62 ───────────────────────────────────────────────────────────────────
  {
    slug: 'cdn-no-cache-abstraction',
    title: 'CDN — No Cache Strategy Abstraction',
    description:
      'ContentDelivery bakes in-memory cache logic inline — managing TTL, eviction, and cache keys directly alongside routing logic. No CacheStrategy interface exists, making it impossible to swap the cache tier without rewriting the delivery class.',
    difficulty: 'medium',
    order: 62,
    diagramData: {
      nodes: [
        { id: 'contentDelivery', data: { label: 'ContentDelivery' }, position: { x: 80,  y: 80  } },
        { id: 'cacheEntry',      data: { label: 'CacheEntry' },      position: { x: 310, y: 80  } },
        { id: 'originServer',    data: { label: 'OriginServer' },    position: { x: 540, y: 80  } },
        { id: 'edgeNode',        data: { label: 'EdgeNode' },        position: { x: 80,  y: 250 } },
        { id: 'cacheStrategy',   data: { label: 'CacheStrategy' },   position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'contentDelivery', target: 'cacheEntry',    label: 'stores inline',     type: 'smoothstep' },
        { id: 'e2', source: 'contentDelivery', target: 'originServer',  label: 'fetches on miss',   type: 'smoothstep' },
        { id: 'e3', source: 'contentDelivery', target: 'edgeNode',      label: 'routes to',         type: 'smoothstep' },
        { id: 'e4', source: 'contentDelivery', target: 'cacheStrategy', label: 'no strategy iface', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'contentDelivery',
        description:
          'ContentDelivery hardcodes in-memory LRU cache management (HashMap + TTL timers) inline, with no CacheStrategy interface. Different content types need different caching strategies (static assets: long TTL, personalised responses: no-cache, API responses: short TTL with stale-while-revalidate). Without a CacheStrategy interface, these policies cannot be varied per content type without modifying ContentDelivery.',
        interviewContext:
          'The interviewer tests whether the candidate applies the Strategy pattern to infrastructure components. A senior answer introduces CacheStrategy<K,V> interface with get(K), put(K,V,TTL), and invalidate(K), implemented by InMemoryCacheStrategy, RedisCacheStrategy, and NoCacheStrategy, injected per content type into ContentDelivery.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'contentDelivery',
        description:
          'ContentDelivery mixes two distinct concerns: routing (selecting the nearest EdgeNode for a request) and caching (storing and evicting content). Routing logic changes when edge topology changes; caching logic changes when eviction policies or storage tiers change. Their co-location means that adding a new edge region requires touching the same class as tuning cache TTLs.',
        interviewContext:
          'Interviewers probe whether candidates can articulate routing vs caching as orthogonal concerns. A senior engineer splits ContentDelivery into EdgeRouter (selects EdgeNode by latency/geography) and CacheLayer (manages content storage with a pluggable strategy), composed together in a DeliveryPipeline, each independently configurable and testable.',
      },
    ],
    explanation:
      'The correct design introduces CacheStrategy<K,V> interface (get, put, invalidate, evict) with implementations: InMemoryLRUCacheStrategy, RedisCacheStrategy, and StaleWhileRevalidateStrategy. ContentDelivery accepts an injected CacheStrategy and a separate EdgeRouter interface. On a request, EdgeRouter selects the optimal edge node, CacheStrategy handles cache lookup and miss-fill from OriginServer. Content-type-specific strategies are configured at startup (e.g., static assets → LRU with 24h TTL, personalised → NoCache). This cleanly applies the Strategy, Dependency Injection, and Separation of Concerns principles.',
  },

  // ─── 63 ───────────────────────────────────────────────────────────────────
  {
    slug: 'form-builder-god-class',
    title: 'Form Builder God Class',
    description:
      'Form handles field validation, conditional field visibility, form submission, analytics event firing, and PDF export all in one class — five entirely separate concerns with independent change drivers fused into a single entity.',
    difficulty: 'medium',
    order: 63,
    diagramData: {
      nodes: [
        { id: 'form',              data: { label: 'Form' },              position: { x: 80,  y: 80  } },
        { id: 'field',             data: { label: 'Field' },             position: { x: 310, y: 80  } },
        { id: 'validationEngine',  data: { label: 'ValidationEngine' },  position: { x: 540, y: 80  } },
        { id: 'submissionHandler', data: { label: 'SubmissionHandler' }, position: { x: 80,  y: 250 } },
        { id: 'analyticsTracker',  data: { label: 'AnalyticsTracker' },  position: { x: 310, y: 250 } },
        { id: 'pdfExporter',       data: { label: 'PDFExporter' },       position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'form', target: 'field',             label: 'contains fields',  type: 'smoothstep' },
        { id: 'e2', source: 'form', target: 'validationEngine',  label: 'validates inline', type: 'smoothstep' },
        { id: 'e3', source: 'form', target: 'submissionHandler', label: 'submits inline',   type: 'smoothstep' },
        { id: 'e4', source: 'form', target: 'analyticsTracker',  label: 'fires events',     type: 'smoothstep' },
        { id: 'e5', source: 'form', target: 'pdfExporter',       label: 'exports PDF',      type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'form',
        description:
          'Form is responsible for rendering field structure, executing validation rules, submitting data, firing analytics events, and exporting PDFs — five concerns controlled by five different teams (product, QA, backend API, data analytics, document generation). Any change in any of these domains triggers a modification to Form, making it a permanent conflict zone. The class cannot be unit-tested without mocking all five external dependencies.',
        interviewContext:
          'The interviewer checks whether the candidate can enumerate the distinct responsibilities and name the decomposition. A senior answer retains Form as a data model (schema of fields and their values), creates ValidationService, SubmissionService, AnalyticsService, and PDFExportService as independent collaborators, and uses a FormLifecycleManager to coordinate them at submit time via a pipeline or event bus.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'form',
        description:
          'PDF export is a heavyweight document-generation concern (layout engine, font rendering, signature embedding) embedded directly in a form entity. Importing a PDF library into the form domain creates an infrastructure dependency with a large footprint. PDF requirements change on brand refresh cycles, completely unrelated to form validation or submission logic.',
        interviewContext:
          'Interviewers test whether candidates can identify infrastructure concerns masquerading as domain logic. The senior answer extracts PDFExportService as a port (interface) in the domain, with a concrete adapter implementation using the PDF library. Form domain code depends only on the PDFExportService interface, following Hexagonal Architecture.',
      },
    ],
    explanation:
      'The correct design makes Form a pure schema-and-data aggregate: fields, their types, validation rules, and current values. ValidationService takes a Form and returns ValidationResult. SubmissionService serialises and posts to an API endpoint. A FormSubmitted domain event triggers AnalyticsEventService (publishes to the event pipeline) and PDFExportService (generates the document) as independent subscribers. PDFExportService is defined as a port/interface in the domain layer, with a concrete adapter in the infrastructure layer. This follows SRP, Hexagonal Architecture, and Event-Driven design — each concern is independently deployable and testable.',
  },

  // ─── 64 ───────────────────────────────────────────────────────────────────
  {
    slug: 'payment-gateway-no-provider',
    title: 'Payment Gateway — No Provider Abstraction',
    description:
      'PaymentService uses an if-elif chain to instantiate Stripe, PayPal, or Razorpay directly with new. There is no PaymentProvider interface, so every new payment processor requires modifying the service and re-testing all existing provider paths.',
    difficulty: 'medium',
    order: 64,
    diagramData: {
      nodes: [
        { id: 'paymentService',  data: { label: 'PaymentService' },          position: { x: 80,  y: 80  } },
        { id: 'stripeClient',    data: { label: 'StripeClient' },            position: { x: 310, y: 80  } },
        { id: 'paypalClient',    data: { label: 'PayPalClient' },            position: { x: 540, y: 80  } },
        { id: 'razorpayClient',  data: { label: 'RazorpayClient' },         position: { x: 770, y: 80  } },
        { id: 'order',           data: { label: 'Order' },                  position: { x: 80,  y: 250 } },
        { id: 'paymentProvider', data: { label: '«missing» PaymentProv.' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'paymentService',  target: 'stripeClient',    label: 'if stripe: new()',    type: 'smoothstep' },
        { id: 'e2', source: 'paymentService',  target: 'paypalClient',    label: 'elif paypal: new()',  type: 'smoothstep' },
        { id: 'e3', source: 'paymentService',  target: 'razorpayClient',  label: 'elif razorpay: new()', type: 'smoothstep' },
        { id: 'e4', source: 'order',           target: 'paymentService',  label: 'initiates payment',  type: 'smoothstep' },
        { id: 'e5', source: 'paymentService',  target: 'paymentProvider', label: 'missing interface',  type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'paymentService',
        description:
          'PaymentService contains a hardcoded if-elif chain that selects and instantiates the payment provider inline. There is no PaymentProvider interface defining a charge(amount, currency, metadata): PaymentResult contract. Adding a fourth provider (e.g., Apple Pay) requires opening PaymentService and adding an elif branch — a direct OCP violation that re-exposes all existing provider paths to regression risk.',
        interviewContext:
          'The interviewer tests whether the candidate applies the Strategy/Adapter pattern to third-party integrations. A senior answer defines PaymentProvider interface with charge(), refund(), and getStatus(), plus a PaymentProviderFactory (or DI configuration) that returns the correct implementation by provider key. PaymentService is closed for modification when new providers are added.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'paymentService',
        description:
          'PaymentService calls new StripeClient() / new PayPalClient() directly, creating concrete instances rather than relying on injected abstractions. This makes PaymentService impossible to unit-test without real gateway connections, forces provider SDK dependencies into PaymentService\'s compile scope, and prevents replacing a provider for A/B testing or gradual rollout without code changes.',
        interviewContext:
          'Interviewers probe Dependency Inversion. A senior engineer has each provider adapter implement PaymentProvider and be registered in a DI container or a ProviderRegistry keyed by provider name. PaymentService receives a PaymentProvider interface via constructor injection, with no knowledge of concrete implementations.',
      },
    ],
    explanation:
      'The correct design defines a PaymentProvider interface (charge(ChargeRequest): ChargeResult, refund(RefundRequest): RefundResult). StripeAdapter, PayPalAdapter, and RazorpayAdapter each implement PaymentProvider, encapsulating provider-specific SDK calls. A PaymentProviderFactory (or DI configuration) maps provider keys to adapters. PaymentService accepts a PaymentProvider via constructor injection, determined at runtime by the user\'s selection. Adding Apple Pay requires only a new ApplePayAdapter — PaymentService is never modified, following OCP and the Adapter pattern.',
  },

  // ─── 65 ───────────────────────────────────────────────────────────────────
  {
    slug: 'calendar-event-wrong-inherit',
    title: 'Calendar — RecurringEvent Wrong Inheritance',
    description:
      'Event extends Calendar, making Calendar an event supertype — a semantic inversion. Calendar is a container for events, not a base class for them. RecurringEvent correctly extends Event, but the Event→Calendar inheritance breaks the entire hierarchy.',
    difficulty: 'medium',
    order: 65,
    diagramData: {
      nodes: [
        { id: 'calendar',      data: { label: 'Calendar' },      position: { x: 80,  y: 80  } },
        { id: 'event',         data: { label: 'Event' },         position: { x: 310, y: 80  } },
        { id: 'recurringEvent',data: { label: 'RecurringEvent' },position: { x: 540, y: 80  } },
        { id: 'user',          data: { label: 'User' },          position: { x: 80,  y: 250 } },
        { id: 'reminder',      data: { label: 'Reminder' },      position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'event',          target: 'calendar', label: 'extends (WRONG)',  type: 'smoothstep' },
        { id: 'e2', source: 'recurringEvent', target: 'event',    label: 'extends',          type: 'smoothstep' },
        { id: 'e3', source: 'calendar',       target: 'user',     label: 'belongs to',       type: 'smoothstep' },
        { id: 'e4', source: 'event',          target: 'reminder', label: 'has',              type: 'smoothstep' },
        { id: 'e5', source: 'user',           target: 'calendar', label: 'owns',             type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'event',
        description:
          'Event extends Calendar, implying every Event IS-A Calendar. This fails the Liskov Substitution Test: an Event cannot stand in for a Calendar without breaking the semantics of methods like addEvent() or getEventsInRange(). Calendar is a container (aggregate) that holds events — the relationship is compositional (Calendar HAS-A List<Event>), not an IS-A inheritance.',
        interviewContext:
          'The interviewer is testing the IS-A vs HAS-A distinction. A senior engineer removes the inheritance, makes Calendar a standalone aggregate with a List<Event> field, and confirms that RecurringEvent → Event is the only valid inheritance chain. The Liskov Substitution Principle is cited as the diagnostic tool.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'calendar',
        description:
          'Because Event extends Calendar, Calendar cannot define a clean aggregate interface (addEvent, removeEvent, getEventsInRange) without those methods being inherited by Event, polluting Event with container semantics it does not need. The absence of a proper HAS-A composition means Calendar cannot enforce invariants like preventing overlapping events or enforcing ownership checks on its events.',
        interviewContext:
          'Interviewers check whether the candidate can articulate aggregate-root design. A senior answer makes Calendar the aggregate root with a private events: List<Event> field, exposes domain methods (addEvent, reschedule, deleteEvent) that enforce business rules, and removes any inheritance relationship between Calendar and Event.',
      },
    ],
    explanation:
      'The correct design inverts the relationship: Calendar is a standalone aggregate root holding events: List<Event> with methods addEvent(Event), removeEvent(eventId), and getEventsInRange(start, end). Event is an independent entity with title, startTime, endTime, location, and a List<Reminder>. RecurringEvent extends Event and adds recurrenceRule (RRULE). Calendar references Event by composition, not inheritance. This follows the Aggregate pattern from DDD, correctly models containment vs taxonomy, and allows Calendar to enforce event-overlap invariants.',
  },

  // ─── 66 ───────────────────────────────────────────────────────────────────
  {
    slug: 'news-feed-algorithm-coupled',
    title: 'News Feed — Algorithm Coupled to Feed',
    description:
      'Feed has rankChronological(), rankByEngagement(), and rankByML() methods inline with no Strategy abstraction. Feed also persists posts directly, mixing ranking and persistence in one class.',
    difficulty: 'medium',
    order: 66,
    diagramData: {
      nodes: [
        { id: 'feed',             data: { label: 'Feed' },             position: { x: 80,  y: 80  } },
        { id: 'post',             data: { label: 'Post' },             position: { x: 310, y: 80  } },
        { id: 'user',             data: { label: 'User' },             position: { x: 540, y: 80  } },
        { id: 'storage',          data: { label: 'Storage' },          position: { x: 80,  y: 250 } },
        { id: 'rankingAlgorithm', data: { label: 'RankingAlgorithm' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'feed',    target: 'post',             label: 'contains',        type: 'smoothstep' },
        { id: 'e2', source: 'feed',    target: 'user',             label: 'for user',        type: 'smoothstep' },
        { id: 'e3', source: 'feed',    target: 'storage',          label: 'persists inline', type: 'smoothstep' },
        { id: 'e4', source: 'feed',    target: 'rankingAlgorithm', label: 'ranks inline',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'feed',
        description:
          'Feed encodes three ranking algorithms as separate methods (chronological, engagement, ML) with no RankingStrategy interface. Selecting an algorithm requires an if/else on a mode flag, and adding a new algorithm (e.g., diversity-boosted ranking) requires modifying Feed. Since ranking is the most frequently iterated concern in a social product, this pattern makes Feed a permanent change target for every A/B test.',
        interviewContext:
          'The interviewer tests Strategy pattern knowledge applied to recommendation systems. A senior answer defines FeedRankingStrategy interface with rank(List<Post>, UserContext): List<Post>, implemented by ChronologicalStrategy, EngagementRankingStrategy, and MLRankingStrategy. Feed accepts an injected strategy, making it open for new algorithms without modification.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'feed',
        description:
          'Feed directly writes posts to Storage, conflating the view-model concern (what posts does a user see and in what order) with the persistence concern (how posts are stored and retrieved). Feed should consume an already-persisted feed slice from a FeedRepository and rank it, not perform persistence itself. The write path and read path have completely different performance profiles and scaling strategies.',
        interviewContext:
          'Interviewers probe CQRS awareness. A senior engineer separates the write model (PostRepository persists posts, FanOutService pre-computes feed slices) from the read model (FeedService reads a pre-computed feed slice from FeedRepository and applies a RankingStrategy for personalisation), following CQRS and Repository patterns.',
      },
    ],
    explanation:
      'The correct design introduces FeedRankingStrategy interface (rank(List<FeedItem>, UserContext): List<FeedItem>) with ChronologicalStrategy, EngagementRankingStrategy, and MLRankingStrategy implementations. Feed becomes a read model: FeedService fetches a pre-computed feed slice from FeedRepository, applies the user\'s selected RankingStrategy, and returns a ranked view. A separate write pipeline (FanOutService) pushes new posts into feed slices asynchronously. This follows the Strategy pattern for algorithmic variation, CQRS for read/write separation, and SRP throughout.',
  },

  // ─── 67 ───────────────────────────────────────────────────────────────────
  {
    slug: 'microwave-god-class',
    title: 'Microwave — Controller God Class',
    description:
      'MicrowaveController handles timer countdown, power level management, door sensor polling, preset program execution, child lock enforcement, and display rendering all inline — six hardware and UI concerns fused into one controller.',
    difficulty: 'medium',
    order: 67,
    diagramData: {
      nodes: [
        { id: 'microwaveController', data: { label: 'MicrowaveController' }, position: { x: 80,  y: 80  } },
        { id: 'timer',               data: { label: 'Timer' },               position: { x: 310, y: 80  } },
        { id: 'powerLevel',          data: { label: 'PowerLevel' },          position: { x: 540, y: 80  } },
        { id: 'doorSensor',          data: { label: 'DoorSensor' },          position: { x: 80,  y: 250 } },
        { id: 'display',             data: { label: 'Display' },             position: { x: 310, y: 250 } },
        { id: 'childLock',           data: { label: 'ChildLock' },           position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'microwaveController', target: 'timer',      label: 'manages inline',  type: 'smoothstep' },
        { id: 'e2', source: 'microwaveController', target: 'powerLevel', label: 'manages inline',  type: 'smoothstep' },
        { id: 'e3', source: 'microwaveController', target: 'doorSensor', label: 'reads inline',    type: 'smoothstep' },
        { id: 'e4', source: 'microwaveController', target: 'display',    label: 'renders inline',  type: 'smoothstep' },
        { id: 'e5', source: 'microwaveController', target: 'childLock',  label: 'handles inline',  type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'microwaveController',
        description:
          'MicrowaveController directly manages six independent subsystems: countdown timer, magnetron power levels, door sensor interrupt handling, preset program sequencing, child lock state, and LED/LCD display rendering. Each subsystem has its own hardware interface and independent failure modes. The controller class is a single point of failure for the entire appliance firmware and cannot be tested or updated modularly.',
        interviewContext:
          'The interviewer checks whether the candidate can decompose an embedded systems controller into subsystem handlers. A senior answer introduces subsystem classes (TimerModule, PowerController, DoorSensorHandler, DisplayRenderer, ChildLockModule) each responsible for one hardware concern, with MicrowaveController reduced to a thin state machine that coordinates events from each module.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'microwaveController',
        description:
          'Display rendering logic is embedded inside MicrowaveController, coupling appliance control logic to the presentation layer. Display output formats change independently of cooking logic (e.g., adding an OLED display with new UI states), and rendering bugs can mask cooking logic bugs in the same class. Hardware control and UI rendering are fundamentally different concerns that should be separated even in embedded systems.',
        interviewContext:
          'Interviewers test whether candidates apply SRP even in non-web domains. A senior engineer separates DisplayRenderer as an interface with update(MicrowaveState) method, with a concrete LEDDisplayRenderer or OLEDDisplayRenderer. MicrowaveController emits state change events; DisplayRenderer subscribes and renders, following the Observer pattern.',
      },
    ],
    explanation:
      'The correct design introduces a MicrowaveState machine as the controller\'s core, transitioning between states (IDLE, COOKING, DOOR_OPEN, CHILD_LOCKED, PRESET_RUNNING). Independent subsystem handlers (TimerModule, PowerController, DoorSensorHandler, ChildLockModule) operate autonomously and publish events to the controller. DisplayRenderer subscribes to state changes and updates the UI. Preset programs become a ProgramLibrary of Command objects executed sequentially. This applies the State pattern, Observer pattern, Command pattern, and SRP — each module can be independently tested with mock hardware interfaces.',
  },

  // ─── 68 ───────────────────────────────────────────────────────────────────
  {
    slug: 'shipment-tracker-coupled',
    title: 'Shipment Tracker — Tightly Coupled to Carriers',
    description:
      'ShipmentTracker instantiates FedEx, DHL, and UPS client objects directly with new inside its tracking method. There is no Carrier interface and no factory, making it impossible to add a carrier or mock one for testing.',
    difficulty: 'medium',
    order: 68,
    diagramData: {
      nodes: [
        { id: 'shipmentTracker',  data: { label: 'ShipmentTracker' },  position: { x: 80,  y: 80  } },
        { id: 'fedExClient',      data: { label: 'FedExClient' },      position: { x: 310, y: 80  } },
        { id: 'dhlClient',        data: { label: 'DHLClient' },        position: { x: 540, y: 80  } },
        { id: 'upsClient',        data: { label: 'UPSClient' },        position: { x: 770, y: 80  } },
        { id: 'shipment',         data: { label: 'Shipment' },         position: { x: 80,  y: 250 } },
        { id: 'carrierInterface', data: { label: '«missing» Carrier' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'shipmentTracker',  target: 'fedExClient',      label: 'new FedEx() directly', type: 'smoothstep' },
        { id: 'e2', source: 'shipmentTracker',  target: 'dhlClient',        label: 'new DHL() directly',   type: 'smoothstep' },
        { id: 'e3', source: 'shipmentTracker',  target: 'upsClient',        label: 'new UPS() directly',   type: 'smoothstep' },
        { id: 'e4', source: 'shipment',         target: 'shipmentTracker',  label: 'tracked by',           type: 'smoothstep' },
        { id: 'e5', source: 'shipmentTracker',  target: 'carrierInterface', label: 'missing interface',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'coupling_issue',
        targetClass: 'shipmentTracker',
        description:
          'ShipmentTracker constructs FedExClient, DHLClient, and UPSClient directly using new, creating tight compile-time coupling to three carrier SDKs. Any change to a carrier\'s SDK signature forces modification of ShipmentTracker. Adding a fourth carrier (USPS) requires modifying the tracker class and adding another new call. Unit tests cannot substitute mock carriers without refactoring the constructor calls.',
        interviewContext:
          'The interviewer tests Dependency Inversion and DI awareness. A senior engineer replaces the new calls with a CarrierClientFactory or DI injection, so ShipmentTracker receives a Carrier interface at construction time and has no knowledge of concrete SDK classes.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'shipmentTracker',
        description:
          'Without a Carrier interface defining a uniform getTrackingStatus(trackingNumber): TrackingEvent contract, ShipmentTracker must know the specific API surface of each carrier SDK (FedEx\'s trackShipment vs DHL\'s getStatus vs UPS\'s track). Each carrier returns a different response structure that must be mapped inline, scattering carrier-specific parsing logic across the tracker class rather than isolating it in adapters.',
        interviewContext:
          'Interviewers test the Adapter pattern. A senior answer defines Carrier interface with getTrackingEvents(trackingId): List<TrackingEvent>, and implements FedExCarrierAdapter, DHLCarrierAdapter, UPSCarrierAdapter — each translating the carrier-specific response into a canonical TrackingEvent model. ShipmentTracker works only with the Carrier interface.',
      },
    ],
    explanation:
      'The correct design defines a Carrier interface with getTrackingEvents(trackingId): List<TrackingEvent>. FedExCarrierAdapter, DHLCarrierAdapter, and UPSCarrierAdapter each implement Carrier, translating their SDK\'s response format into canonical TrackingEvent objects. A CarrierRegistry (or DI container) maps carrier codes to adapter instances. ShipmentTracker receives a CarrierRegistry, looks up the appropriate Carrier by the shipment\'s carrier code, and calls getTrackingEvents. Adding USPS requires only a new USPSCarrierAdapter — the tracker is never modified, following OCP and the Adapter pattern.',
  },

  // ─── 69 ───────────────────────────────────────────────────────────────────
  {
    slug: 'multiplayer-game-no-role',
    title: 'Multiplayer Game — No Player Role Abstraction',
    description:
      'Game has a single Player class that handles admin commands, spectator viewing, and active participant gameplay with if/else checks on a role string. There is no Role abstraction, making it impossible to add a new role without modifying Player.',
    difficulty: 'medium',
    order: 69,
    diagramData: {
      nodes: [
        { id: 'game',        data: { label: 'Game' },        position: { x: 80,  y: 80  } },
        { id: 'player',      data: { label: 'Player' },      position: { x: 310, y: 80  } },
        { id: 'gameSession', data: { label: 'GameSession' }, position: { x: 540, y: 80  } },
        { id: 'leaderboard', data: { label: 'Leaderboard' }, position: { x: 80,  y: 250 } },
        { id: 'role',        data: { label: 'Role' },        position: { x: 310, y: 250 } },
        { id: 'chatRoom',    data: { label: 'ChatRoom' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'game',        target: 'player',      label: 'has players',       type: 'smoothstep' },
        { id: 'e2', source: 'player',      target: 'gameSession', label: 'joins',             type: 'smoothstep' },
        { id: 'e3', source: 'game',        target: 'leaderboard', label: 'updates',           type: 'smoothstep' },
        { id: 'e4', source: 'game',        target: 'chatRoom',    label: 'has',               type: 'smoothstep' },
        { id: 'e5', source: 'player',      target: 'role',        label: 'no Role abstraction', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'player',
        description:
          'Player encodes three role-specific behaviour sets (admin: kick/ban/configure, spectator: view-only/no-input, participant: full gameplay) behind if/else checks on a role string. Adding a "coach" or "referee" role requires adding new conditional branches throughout Player. The role-specific behaviour is not encapsulated, making it impossible to add new roles following OCP.',
        interviewContext:
          'The interviewer tests whether the candidate applies the Strategy or Role Object pattern to behavioural variation. A senior engineer introduces a PlayerRole interface with canMove(), canChat(), canAdminister() capability methods, implemented by AdminRole, SpectatorRole, and ParticipantRole. Player delegates capability checks to its injected role object, enabling new roles without modifying Player.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'player',
        description:
          'Player hosts game-state (health, position, inventory) alongside admin-specific operations (kickPlayer, mutePlayer, configureLobby). Admin operations touch game session configuration and other players — they are system management concerns, not player-state concerns. A regular participant should have no access to these methods, but they are exposed on the shared Player class with only a role-string guard.',
        interviewContext:
          'Interviewers probe access control and capability modelling. A senior answer separates PlayerState (in-game attributes) from a PlayerSession that holds the role. Admin capabilities are exposed only through an AdminSession or by checking game.getAdminPanel(sessionToken), not through methods on every Player instance.',
      },
    ],
    explanation:
      'The correct design introduces a PlayerRole interface with capability predicates (canSubmitMove, canChat, canKickPlayers, canViewOnly) and action methods specific to each role. AdminRole, ParticipantRole, and SpectatorRole implement PlayerRole with role-appropriate behaviour. Player holds a PlayerRole dependency injected at session join time, delegating all capability checks to it. Adding a Referee role requires only a new RefereeRole class — Player is not modified. This follows the Role Object pattern, OCP, and SRP: Player retains game-state, roles retain permission logic.',
  },

  // ─── 70 ───────────────────────────────────────────────────────────────────
  {
    slug: 'analytics-event-mixed',
    title: 'Analytics — Event & Storage Mixed',
    description:
      'AnalyticsService fires events, persists them to a database, and aggregates metrics all in one class. Three entirely separate concerns — event production, storage, and aggregation — share a single class with three incompatible change axes.',
    difficulty: 'medium',
    order: 70,
    diagramData: {
      nodes: [
        { id: 'analyticsService', data: { label: 'AnalyticsService' }, position: { x: 80,  y: 80  } },
        { id: 'event',            data: { label: 'Event' },            position: { x: 310, y: 80  } },
        { id: 'eventStore',       data: { label: 'EventStore' },       position: { x: 540, y: 80  } },
        { id: 'aggregator',       data: { label: 'Aggregator' },       position: { x: 80,  y: 250 } },
        { id: 'dashboard',        data: { label: 'Dashboard' },        position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'analyticsService', target: 'event',      label: 'fires events',     type: 'smoothstep' },
        { id: 'e2', source: 'analyticsService', target: 'eventStore', label: 'persists inline',  type: 'smoothstep' },
        { id: 'e3', source: 'analyticsService', target: 'aggregator', label: 'aggregates inline', type: 'smoothstep' },
        { id: 'e4', source: 'dashboard',        target: 'analyticsService', label: 'queries',    type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'srp_violation',
        targetClass: 'analyticsService',
        description:
          'AnalyticsService combines event production (building and emitting events), event persistence (writing to a time-series DB or data lake), and metric aggregation (computing counts, funnels, retention) in one class. Event schema changes, storage backend migrations, and aggregation algorithm changes all require modifying the same class. This violates SRP and creates a class that cannot be independently tested or scaled for any single concern.',
        interviewContext:
          'The interviewer tests whether the candidate can enumerate the separate concerns and name the correct decomposition. A senior answer separates EventTracker (validates and publishes events), EventRepository (persists to storage), and MetricsAggregator (computes aggregate metrics), each independently injectable and testable, connected via a message queue or event bus.',
      },
      {
        id: 'issue-2',
        type: 'cohesion_issue',
        targetClass: 'analyticsService',
        description:
          'The three responsibilities in AnalyticsService operate on different data structures with different consistency requirements: event production needs low-latency writes, persistence needs durability guarantees, and aggregation can tolerate eventual consistency. Co-locating them in one class means applying the strictest requirements of all three everywhere, or inconsistently applying them through ad-hoc flags.',
        interviewContext:
          'Interviewers probe whether candidates understand data consistency and latency requirements as drivers for separation. A senior engineer explains that event firing should be fire-and-forget (async), persistence should be durable but async via a queue, and aggregation should run on scheduled or stream-processed batches — three different execution contexts impossible to honour in one class.',
      },
    ],
    explanation:
      'The correct design separates concerns: EventTracker validates and publishes domain events (AnalyticsEvent) to a message bus (Kafka, Pub/Sub). EventConsumer subscribes and persists events to an EventStore (time-series DB, BigQuery). MetricsAggregator runs scheduled or streaming jobs over EventStore to compute metrics. Dashboard reads pre-aggregated MetricsStore. This pipeline follows Event-Driven Architecture, CQRS (write pipeline separate from read pipeline), and SRP — each component is independently scalable, testable, and deployable.',
  },

  // ─── 71 ───────────────────────────────────────────────────────────────────
  {
    slug: 'document-editor-no-command',
    title: 'Document Editor — Undo/Redo Without Command',
    description:
      'Editor directly mutates Document state and implements undo() with a reverse-switch over operation type strings. No Command objects exist, making the undo stack an opaque list of strings rather than executable reversal logic.',
    difficulty: 'medium',
    order: 71,
    diagramData: {
      nodes: [
        { id: 'editor',        data: { label: 'Editor' },        position: { x: 80,  y: 80  } },
        { id: 'document',      data: { label: 'Document' },      position: { x: 310, y: 80  } },
        { id: 'undoStack',     data: { label: 'UndoStack' },     position: { x: 540, y: 80  } },
        { id: 'textOperation', data: { label: 'TextOperation' }, position: { x: 80,  y: 250 } },
        { id: 'command',       data: { label: 'Command' },       position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'editor',    target: 'document',      label: 'mutates directly',   type: 'smoothstep' },
        { id: 'e2', source: 'editor',    target: 'undoStack',     label: 'undo() switch',      type: 'smoothstep' },
        { id: 'e3', source: 'editor',    target: 'textOperation', label: 'applies',            type: 'smoothstep' },
        { id: 'e4', source: 'editor',    target: 'command',       label: 'missing Command obj', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'editor',
        description:
          'Editor implements undo() with a giant reverse-switch over operation type strings (case "INSERT": remove last insertion, case "DELETE": re-insert deleted text). This approach requires Editor to know the reversal logic for every operation type and breaks when new operations are added without updating the switch. The Command pattern exists precisely to encapsulate each operation with its own execute() and undo() logic.',
        interviewContext:
          'The interviewer tests Command pattern knowledge. A senior engineer introduces a Command interface with execute(Document): void and undo(Document): void, implemented by InsertTextCommand, DeleteTextCommand, FormatCommand, etc. Editor maintains a commandHistory: Deque<Command>; undo() pops the last command and calls undo(); redo() replays it. Adding a new operation requires only a new Command subclass.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'editor',
        description:
          'Editor directly mutates Document state inline rather than delegating to Command objects, meaning Editor must know the internal state structure of Document to apply and reverse each operation. This creates bidirectional coupling: Editor depends on Document internals, and Document cannot evolve its state model without risking Editor\'s mutation code. Command objects would encapsulate the mutation and keep Editor agnostic to Document internals.',
        interviewContext:
          'Interviewers check whether candidates understand encapsulation as the core benefit of Command pattern. A senior answer has each Command receive a Document reference in execute()/undo() and apply the mutation through Document\'s public interface (insert, delete, format), keeping Editor purely as a command dispatcher without knowledge of Document internals.',
      },
    ],
    explanation:
      'The correct design applies the Command pattern: Command interface declares execute(Document): void and undo(Document): void. InsertTextCommand, DeleteTextCommand, BoldCommand, etc. each capture their parameters at construction and implement both methods using Document\'s public API. Editor maintains commandHistory: Deque<Command> and redoStack: Deque<Command>. On user action, Editor constructs the appropriate Command, calls execute(), and pushes to history. undo() pops from history and calls command.undo(). This makes undo/redo extensible, testable per command type, and completely decoupled from Editor state management.',
  },

  // ─── 72 ───────────────────────────────────────────────────────────────────
  {
    slug: 'social-post-comment-srp',
    title: 'Social Network — Post Handles Comments',
    description:
      'Post contains addComment(), deleteComment(), moderateComment(), and flagForReview() directly on the post entity, mixing comment lifecycle management and content moderation into what should be a simple content entity.',
    difficulty: 'medium',
    order: 72,
    diagramData: {
      nodes: [
        { id: 'post',              data: { label: 'Post' },              position: { x: 80,  y: 80  } },
        { id: 'comment',           data: { label: 'Comment' },           position: { x: 310, y: 80  } },
        { id: 'user',              data: { label: 'User' },              position: { x: 540, y: 80  } },
        { id: 'feed',              data: { label: 'Feed' },              position: { x: 80,  y: 250 } },
        { id: 'moderationService', data: { label: 'ModerationService' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'post',    target: 'comment',           label: 'addComment() inline',  type: 'smoothstep' },
        { id: 'e2', source: 'post',    target: 'user',              label: 'authored by',          type: 'smoothstep' },
        { id: 'e3', source: 'post',    target: 'feed',              label: 'appears in',           type: 'smoothstep' },
        { id: 'e4', source: 'post',    target: 'moderationService', label: 'moderates inline',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'srp_violation',
        targetClass: 'post',
        description:
          'Post conflates its role as a content entity (text, media, authorId, timestamp) with comment lifecycle management (add, delete, paginate) and content moderation (flag, review, suppress). Comment management is a separate concern with its own pagination, threading, and sorting logic. Moderation has regulatory requirements (GDPR, CSAM) that should be isolated behind a dedicated service with audit logging.',
        interviewContext:
          'The interviewer tests whether the candidate can identify comment management and moderation as separate bounded concerns. A senior answer moves comment operations to CommentService (addComment, deleteComment, getComments(postId, pagination)) and moderation actions to ModerationService (flagContent, reviewFlag, suppressContent), both referencing Post by postId. Post becomes a pure content entity.',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'moderationService',
        description:
          'ModerationService is shown as a node but its logic lives inside Post, meaning there is no isolated moderation component with its own access controls, audit trail, or ML integration point. Embedding moderateComment() in Post means moderation decisions are made in the same transaction as content creation, preventing async ML-based moderation pipelines and making it impossible to re-run moderation on existing content.',
        interviewContext:
          'Interviewers probe whether candidates understand async moderation pipeline design. A senior engineer has Post emit a CommentPosted event, and ModerationService subscribes asynchronously — running heuristic and ML classifiers, storing a ModerationDecision record, and issuing a suppress action if needed. Post is never aware of moderation.',
      },
    ],
    explanation:
      'The correct design restricts Post to content fields (postId, authorId, text, mediaUrls, createdAt, status). CommentService manages the Comment aggregate (threadedComments, pagination, reactions) referenced by postId. ModerationService operates asynchronously: when a CommentPosted or PostCreated event fires, ModerationService runs policy checks, persists a ModerationDecision, and optionally calls PostService.suppress(contentId). This follows SRP, Event-Driven Architecture, and the principle of async moderation pipelines used in production social platforms.',
  },

  // ─── 73 ───────────────────────────────────────────────────────────────────
  {
    slug: 'interview-scheduler-god',
    title: 'Interview Scheduler God Class',
    description:
      'InterviewScheduler manages candidate availability, interviewer calendar sync, room booking, video link generation, and reminder email dispatch all in one class — five unrelated infrastructure and domain concerns with independent change drivers.',
    difficulty: 'medium',
    order: 73,
    diagramData: {
      nodes: [
        { id: 'interviewScheduler', data: { label: 'InterviewScheduler' }, position: { x: 80,  y: 80  } },
        { id: 'candidate',          data: { label: 'Candidate' },          position: { x: 310, y: 80  } },
        { id: 'interviewer',        data: { label: 'Interviewer' },        position: { x: 540, y: 80  } },
        { id: 'room',               data: { label: 'Room' },               position: { x: 80,  y: 250 } },
        { id: 'videoLink',          data: { label: 'VideoLink' },          position: { x: 310, y: 250 } },
        { id: 'reminderService',    data: { label: 'ReminderService' },    position: { x: 540, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'interviewScheduler', target: 'candidate',       label: 'checks availability', type: 'smoothstep' },
        { id: 'e2', source: 'interviewScheduler', target: 'interviewer',     label: 'manages calendar',    type: 'smoothstep' },
        { id: 'e3', source: 'interviewScheduler', target: 'room',            label: 'books room',          type: 'smoothstep' },
        { id: 'e4', source: 'interviewScheduler', target: 'videoLink',       label: 'generates link',      type: 'smoothstep' },
        { id: 'e5', source: 'interviewScheduler', target: 'reminderService', label: 'sends reminders',     type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'interviewScheduler',
        description:
          'InterviewScheduler is responsible for availability negotiation (domain), calendar integration (Google/Outlook API), room booking (facilities system), video conference link creation (Zoom/Meet API), and email reminder scheduling (notification infrastructure) — five concerns each backed by different external systems. A change in any API contract forces a change in InterviewScheduler, making it the most fragile component in the hiring system.',
        interviewContext:
          'The interviewer checks whether the candidate can identify external system integrations as separate adapters. A senior answer retains InterviewScheduler as a workflow coordinator (scheduleInterview use-case) and extracts AvailabilityService, CalendarAdapter, RoomBookingAdapter, VideoConferenceAdapter, and NotificationService — each implementing a domain interface with a concrete external-system adapter, following Hexagonal Architecture.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'interviewScheduler',
        description:
          'Video link generation (a Zoom/Meet API call) and reminder email scheduling (an SMTP/SendGrid call) are infrastructure concerns embedded directly in the domain scheduler. If the company switches from Zoom to Teams or from SendGrid to SES, InterviewScheduler must be modified despite no change in scheduling logic. These infrastructure dependencies should be hidden behind interfaces.',
        interviewContext:
          'Interviewers test port/adapter awareness. The senior answer defines VideoConferencePort interface with createMeeting(scheduleDetails): MeetingLink, implemented by ZoomAdapter and TeamsAdapter, and NotificationPort interface with sendReminder(recipient, schedule), implemented by EmailAdapter and SlackAdapter. InterviewScheduler depends only on the ports.',
      },
    ],
    explanation:
      'The correct design makes InterviewScheduler a use-case class (application layer) that orchestrates: AvailabilityService (finds common free slots), CalendarAdapter (creates calendar invites), RoomBookingAdapter (reserves a physical room if needed), VideoConferenceAdapter (generates meeting link), and NotificationAdapter (schedules reminders). Each adapter implements a domain port interface, following Hexagonal Architecture. An InterviewSlot domain entity captures the confirmed details. Changing from Zoom to Teams requires only a new VideoConferenceAdapter — no scheduling logic is touched.',
  },

  // ─── 74 ───────────────────────────────────────────────────────────────────
  {
    slug: 'smart-home-device-no-abstraction',
    title: 'Smart Home — No Device Abstraction',
    description:
      'SmartHub directly calls ThermostatDevice, LightDevice, and LockDevice methods without any SmartDevice interface. Adding a SpeakerDevice requires modifying SmartHub, and every new device type continues to break it.',
    difficulty: 'medium',
    order: 74,
    diagramData: {
      nodes: [
        { id: 'smartHub',         data: { label: 'SmartHub' },                    position: { x: 80,  y: 80  } },
        { id: 'thermostatDevice', data: { label: 'ThermostatDevice' },            position: { x: 310, y: 80  } },
        { id: 'lightDevice',      data: { label: 'LightDevice' },                 position: { x: 540, y: 80  } },
        { id: 'lockDevice',       data: { label: 'LockDevice' },                  position: { x: 770, y: 80  } },
        { id: 'smartDevice',      data: { label: '«missing» SmartDevice' },       position: { x: 80,  y: 250 } },
        { id: 'speakerDevice',    data: { label: 'SpeakerDevice' },               position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'smartHub',      target: 'thermostatDevice', label: 'calls directly',   type: 'smoothstep' },
        { id: 'e2', source: 'smartHub',      target: 'lightDevice',      label: 'calls directly',   type: 'smoothstep' },
        { id: 'e3', source: 'smartHub',      target: 'lockDevice',       label: 'calls directly',   type: 'smoothstep' },
        { id: 'e4', source: 'smartHub',      target: 'speakerDevice',    label: 'breaks hub',       type: 'smoothstep' },
        { id: 'e5', source: 'smartHub',      target: 'smartDevice',      label: 'missing interface', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'smartHub',
        description:
          'SmartHub calls ThermostatDevice.setTemperature(), LightDevice.setBrightness(), and LockDevice.lock() directly, with no SmartDevice interface unifying them. Every new device type (SpeakerDevice, SecurityCamera, GarageOpener) requires adding new device-specific method calls to SmartHub. The hub becomes a growing list of device-specific method dispatches rather than a uniform command router.',
        interviewContext:
          'The interviewer tests whether the candidate introduces a device abstraction using an interface or abstract class. A senior answer defines SmartDevice interface with execute(DeviceCommand): DeviceResult, implemented by each device type. SmartHub holds a Map<deviceId, SmartDevice> and calls device.execute(command) uniformly for all device types, supporting plugin-style extensibility.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'smartHub',
        description:
          'SmartHub depends directly on concrete device implementations, meaning it must import and compile against every device SDK. This prevents SmartHub from being deployed independently of any specific device vendor library. It also means device manufacturer SDK updates require recompiling and redeploying the hub firmware — a major operational problem in an IoT ecosystem.',
        interviewContext:
          'Interviewers probe whether candidates understand plugin architectures and compile-time coupling in IoT systems. A senior engineer implements a DeviceRegistry where device drivers self-register against the SmartDevice interface, enabling SmartHub to discover and invoke devices without compile-time knowledge of concrete device classes, following the Plugin or Service Locator pattern.',
      },
    ],
    explanation:
      'The correct design defines SmartDevice interface with discover(): DeviceInfo, execute(DeviceCommand): DeviceResult, and getStatus(): DeviceStatus. ThermostatDevice, LightDevice, LockDevice, and SpeakerDevice each implement SmartDevice, encapsulating their vendor-specific SDKs. SmartHub holds a DeviceRegistry (Map<deviceId, SmartDevice>) populated at startup via a discovery protocol (mDNS, Z-Wave, Zigbee). Commands are routed through registry.get(deviceId).execute(command) with no knowledge of concrete types. New device types self-register as plugins, following OCP and the Plugin/Registry pattern — SmartHub is never modified when new devices join the ecosystem.',
  },
]
