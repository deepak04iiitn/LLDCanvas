import { pack, node, edge, pos, type DebuggerPackSeed } from '../seed-studio-debugger-lib'

export const EASY_A: DebuggerPackSeed[] = [
  // ── 100 ── Cart inherits User ───────────────────────────────────────────────
  pack({
    slug: 'dbg-cart-extends-user',
    title: 'Shopping Cart Ownership',
    difficulty: 'easy',
    order: 100,
    description:
      'An e-commerce checkout model where the cart is wired into the customer hierarchy in a questionable way.',
    tags: ['inheritance', 'e-commerce', 'composition-over-inheritance'],
    nodes: [
      node('n1', 'el-user', 'User', pos(0, 0), ['login', 'logout', 'updateProfile'], [
        { name: 'id', type: 'string' },
        { name: 'email', type: 'string' },
      ]),
      node('n2', 'el-cart', 'Cart', pos(1, 0), ['addItem', 'removeItem', 'getTotal'], [
        { name: 'items', type: 'List<CartItem>' },
      ]),
      node('n3', 'el-cartitem', 'CartItem', pos(2, 0), ['getSubtotal'], [
        { name: 'productId', type: 'string' },
        { name: 'quantity', type: 'int' },
        { name: 'unitPrice', type: 'double' },
      ]),
      node('n4', 'el-order', 'Order', pos(1, 1), ['place', 'cancel'], [
        { name: 'status', type: 'OrderStatus' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-cart-user', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-cart-item', 'n2', 'n3', 'composition'),
      edge('e3', 'ed-order-cart', 'n4', 'n2', 'dependency'),
    ],
    briefing:
      'Walk through the checkout model and ask what each type actually is versus what it merely relates to. Pay attention to how the arrows between the core domain classes are drawn.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-cart-is-user',
        elementIds: ['ed-cart-user', 'el-cart'],
        category: 'Incorrect Inheritance',
        aliases: ['Tight Coupling', 'Other'],
        explanationKeywords: ['is-a', 'not a user', 'has-a', 'belongs to', 'composition', 'association', 'liskov', 'inherits'],
        modelAnswer:
          'Cart extends User, but a cart is not a kind of user — it belongs to a user. Inheritance here makes Cart inherit login(), logout() and profile state that are meaningless for it, and breaks the is-a test and Liskov substitution (a Cart could be passed where a User is expected). Replace the inheritance edge with an association: Cart holds a reference to its owning User (or a userId).',
        hints: [
          'Say the relationship out loud: "A Cart is a User." Does that sentence hold?',
          'Look at which inherited methods Cart would gain and whether they make sense.',
          'Ownership is a has-a / belongs-to relationship, not an is-a one.',
        ],
      },
    ],
  }),

  // ── 101 ── Invoice sends email ──────────────────────────────────────────────
  pack({
    slug: 'dbg-invoice-sends-email',
    title: 'Invoice Notification Path',
    difficulty: 'easy',
    order: 101,
    description:
      'A billing module where an invoice knows a little too much about how customers get notified.',
    tags: ['srp', 'billing', 'notifications'],
    nodes: [
      node(
        'n1',
        'el-invoice',
        'Invoice',
        pos(0, 0),
        ['calculateTotal', 'applyDiscount', 'sendEmail', 'formatEmailBody'],
        [
          { name: 'invoiceId', type: 'string' },
          { name: 'lines', type: 'List<InvoiceLine>' },
          { name: 'customerEmail', type: 'string' },
        ],
      ),
      node('n2', 'el-invoiceline', 'InvoiceLine', pos(1, 0), ['getAmount'], [
        { name: 'description', type: 'string' },
        { name: 'amount', type: 'double' },
      ]),
      node('n3', 'el-smtpclient', 'SmtpClient', pos(0, 1), ['connect', 'send'], [
        { name: 'host', type: 'string' },
        { name: 'port', type: 'int' },
      ]),
      node('n4', 'el-customer', 'Customer', pos(1, 1), ['getBillingAddress'], [
        { name: 'name', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-invoice-line', 'n1', 'n2', 'composition'),
      edge('e2', 'ed-invoice-smtp', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-invoice-customer', 'n1', 'n4', 'association'),
    ],
    briefing:
      'Read the Invoice class as if you were its only maintainer. Count the distinct reasons it might need to change next quarter, and check what its outgoing dependencies tell you about its job.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-invoice-email',
        elementIds: ['el-invoice', 'ed-invoice-smtp'],
        category: 'SRP Violation',
        aliases: ['Tight Coupling', 'God Object'],
        explanationKeywords: ['single responsibility', 'srp', 'email', 'notification', 'reason to change', 'formatting', 'delivery', 'smtp'],
        modelAnswer:
          'Invoice mixes billing logic (calculateTotal, applyDiscount) with email composition and delivery (sendEmail, formatEmailBody) and is coupled to SmtpClient. It now changes for pricing rules, email templates and transport changes. Extract an InvoiceNotifier / EmailService that takes an Invoice and sends it, and remove the SmtpClient dependency from Invoice.',
        hints: [
          'List the different reasons Invoice would have to be edited.',
          'Does a billing document need to know about SMTP?',
          'Who should own "how do we tell the customer about this invoice"?',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Email'],
      forbidDirectEdges: [{ from: 'Invoice', to: 'SmtpClient' }],
    },
  }),

  // ── 102 ── Vehicle types without abstraction ────────────────────────────────
  pack({
    slug: 'dbg-vehicle-no-interface',
    title: 'Rental Vehicle Types',
    difficulty: 'easy',
    order: 102,
    description:
      'A vehicle rental system that supports cars, bikes and trucks — and has to be edited for every new kind of vehicle.',
    tags: ['ocp', 'polymorphism', 'rental'],
    nodes: [
      node('n1', 'el-rentalservice', 'RentalService', pos(1, 0), [
        'rentCar',
        'rentBike',
        'rentTruck',
        'returnCar',
        'returnBike',
        'returnTruck',
      ]),
      node('n2', 'el-car', 'Car', pos(0, 1), ['getDailyRate', 'getSeatCount'], [
        { name: 'plate', type: 'string' },
      ]),
      node('n3', 'el-bike', 'Bike', pos(1, 1), ['getDailyRate', 'hasHelmet'], [
        { name: 'frameId', type: 'string' },
      ]),
      node('n4', 'el-truck', 'Truck', pos(2, 1), ['getDailyRate', 'getLoadCapacity'], [
        { name: 'plate', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-rental-car', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-rental-bike', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-rental-truck', 'n1', 'n4', 'dependency'),
    ],
    briefing:
      'Imagine product asks you to add scooters and vans next month. Trace what would have to change in the diagram, and look at what the three vehicle classes share.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-rental-no-abstraction',
        elementIds: ['el-rentalservice'],
        category: 'OCP Violation',
        aliases: ['Tight Coupling', 'Other', 'DIP Violation'],
        explanationKeywords: ['open closed', 'ocp', 'vehicle', 'interface', 'abstraction', 'polymorphism', 'new vehicle', 'modify', 'common'],
        modelAnswer:
          'Car, Bike and Truck share getDailyRate() but have no common Vehicle abstraction, so RentalService has a separate method pair per concrete type and depends on all of them. Adding a Scooter forces edits to RentalService (open/closed violation). Introduce a Vehicle interface/abstract class, make the three types implement it, and have RentalService expose rent(Vehicle) / returnVehicle(Vehicle).',
        hints: [
          'What do getDailyRate() on all three classes tell you?',
          'Count the methods in RentalService that would multiply with every new vehicle.',
          'RentalService should depend on a role, not on three concrete classes.',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Vehicle'],
    },
  }),

  // ── 103 ── Todo list god object ─────────────────────────────────────────────
  pack({
    slug: 'dbg-todo-god-list',
    title: 'Todo List Responsibilities',
    difficulty: 'easy',
    order: 103,
    description:
      'A task-management app whose central TodoList class has grown to handle far more than lists.',
    tags: ['god-object', 'srp', 'productivity'],
    nodes: [
      node(
        'n1',
        'el-todolist',
        'TodoList',
        pos(1, 0),
        [
          'addTodo',
          'updateTodo',
          'deleteTodo',
          'scheduleReminder',
          'sendReminderPush',
          'exportToCsv',
          'exportToPdf',
          'syncWithCloud',
          'resolveSyncConflicts',
        ],
        [
          { name: 'todos', type: 'List<Todo>' },
          { name: 'reminderTimers', type: 'Map<string, Timer>' },
          { name: 'cloudToken', type: 'string' },
        ],
      ),
      node('n2', 'el-todo', 'Todo', pos(0, 1), ['markDone'], [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'dueAt', type: 'Date' },
      ]),
      node('n3', 'el-user', 'User', pos(2, 1), ['getTimezone'], [
        { name: 'id', type: 'string' },
      ]),
      node('n4', 'el-cloudapi', 'CloudApi', pos(1, 2), ['push', 'pull']),
    ],
    edges: [
      edge('e1', 'ed-list-todo', 'n1', 'n2', 'composition'),
      edge('e2', 'ed-list-user', 'n1', 'n3', 'association'),
      edge('e3', 'ed-list-cloud', 'n1', 'n4', 'dependency'),
    ],
    briefing:
      'Look at the member list of the busiest class in this diagram and group the methods by the job they perform. How many separate jobs do you find, and how many collaborators does one class carry?',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-todolist-god',
        elementIds: ['el-todolist'],
        category: 'God Object',
        aliases: ['SRP Violation'],
        explanationKeywords: ['god object', 'too many responsibilities', 'reminder', 'export', 'sync', 'crud', 'split', 'extract', 'cohesion'],
        modelAnswer:
          'TodoList handles CRUD, reminder scheduling/notification, CSV/PDF export and cloud sync with conflict resolution — four unrelated concerns in one class that also owns timers and cloud credentials. It is a God Object with low cohesion. Keep TodoList focused on managing todos; extract ReminderService, TodoExporter (with CSV/PDF strategies) and SyncService.',
        hints: [
          'Group the nine methods by theme — how many themes are there?',
          'Which attributes only matter to one of those themes?',
          'Which concerns could change independently (e.g. a new export format)?',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Reminder'],
      requireNoEditTo: ['Todo'],
    },
  }),

  // ── 104 ── Payment logic in Order ───────────────────────────────────────────
  pack({
    slug: 'dbg-payment-in-order',
    title: 'Order Payment Logic',
    difficulty: 'easy',
    order: 104,
    description:
      'A checkout flow where the Order entity also knows how to talk to payment providers.',
    tags: ['srp', 'payments', 'e-commerce'],
    nodes: [
      node(
        'n1',
        'el-order',
        'Order',
        pos(0, 0),
        ['addItem', 'getTotal', 'chargeCard', 'processPayPal', 'markPaid'],
        [
          { name: 'orderId', type: 'string' },
          { name: 'items', type: 'List<OrderItem>' },
          { name: 'status', type: 'OrderStatus' },
        ],
      ),
      node('n2', 'el-orderitem', 'OrderItem', pos(1, 0), ['getSubtotal'], [
        { name: 'sku', type: 'string' },
        { name: 'quantity', type: 'int' },
      ]),
      node('n3', 'el-stripeclient', 'StripeClient', pos(0, 1), ['createCharge']),
      node('n4', 'el-paypalclient', 'PayPalClient', pos(1, 1), ['createPayment']),
    ],
    edges: [
      edge('e1', 'ed-order-item', 'n1', 'n2', 'composition'),
      edge('e2', 'ed-order-stripe', 'n1', 'n3', 'dependency'),
      edge('e3', 'ed-order-paypal', 'n1', 'n4', 'dependency'),
    ],
    briefing:
      'Think about what an Order should be responsible for in the business domain versus what belongs to a payment provider integration. Check what the Order depends on besides its own line items.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-order-payment',
        elementIds: ['el-order', 'ed-order-stripe', 'ed-order-paypal'],
        category: 'SRP Violation',
        aliases: ['Tight Coupling', 'DIP Violation'],
        explanationKeywords: ['single responsibility', 'srp', 'payment', 'chargeCard', 'paypal', 'stripe', 'provider', 'reason to change', 'extract'],
        modelAnswer:
          'Order owns line items and totals but also implements chargeCard() and processPayPal(), pulling in StripeClient and PayPalClient. It changes whenever pricing rules or any payment provider change, and every new provider modifies Order. Extract a PaymentService / PaymentProcessor (ideally behind a PaymentGateway interface); Order should only record that it was paid.',
        hints: [
          'Which Order methods talk to external providers?',
          'If PayPal changes its API, which domain class has to be recompiled?',
          'Should an Order know how it gets paid, or just whether it has been paid?',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Payment'],
      forbidDirectEdges: [
        { from: 'Order', to: 'StripeClient' },
        { from: 'Order', to: 'PayPalClient' },
      ],
    },
  }),

  // ── 105 ── Comment extends Post ─────────────────────────────────────────────
  pack({
    slug: 'dbg-comment-extends-post',
    title: 'Comment and Post Link',
    difficulty: 'easy',
    order: 105,
    description:
      'A social feed model where comments and posts are related through a questionable class hierarchy.',
    tags: ['inheritance', 'social-media', 'is-a'],
    nodes: [
      node('n1', 'el-post', 'Post', pos(0, 0), ['publish', 'edit', 'addComment', 'getLikeCount'], [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string' },
        { name: 'comments', type: 'List<Comment>' },
      ]),
      node('n2', 'el-comment', 'Comment', pos(1, 0), ['reply', 'edit'], [
        { name: 'text', type: 'string' },
        { name: 'parentCommentId', type: 'string' },
      ]),
      node('n3', 'el-author', 'Author', pos(0, 1), ['follow', 'unfollow'], [
        { name: 'handle', type: 'string' },
      ]),
      node('n4', 'el-like', 'Like', pos(1, 1), [], [
        { name: 'userId', type: 'string' },
        { name: 'createdAt', type: 'Date' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-comment-post-inherit', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-post-author', 'n1', 'n3', 'association'),
      edge('e3', 'ed-post-like', 'n1', 'n4', 'aggregation'),
    ],
    briefing:
      'A comment lives under a post, but is that the same thing as being a post? Study how these two types are connected and what each would inherit from the other.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-comment-is-post',
        elementIds: ['ed-comment-post-inherit', 'el-comment'],
        category: 'Incorrect Inheritance',
        aliases: ['Tight Coupling', 'Other'],
        explanationKeywords: ['is-a', 'not a post', 'has-a', 'belongs to', 'composition', 'association', 'liskov', 'inherits', 'addComment', 'cyclic'],
        modelAnswer:
          'Comment extends Post, but a comment is not a post — it belongs to one. Inheritance gives Comment publish(), title and its own comments list (a comment-of-a-comment-of-a-post tangle), and lets a Comment be used wherever a Post is expected, violating Liskov. Remove the inheritance and model Comment as a separate class holding a postId / reference to its Post, optionally sharing behaviour through composition or a small common interface (e.g. Likeable).',
        hints: [
          'Does "A Comment is a Post" hold in the domain?',
          'Which Post members would Comment inherit that it should never use (publish, title)?',
          'Comments belong to a post — which UML relationship expresses that?',
        ],
      },
    ],
  }),

  // ── 106 ── Car → DieselEngine concrete ──────────────────────────────────────
  pack({
    slug: 'dbg-engine-concrete',
    title: 'Car Powertrain Binding',
    difficulty: 'easy',
    order: 106,
    description:
      'A vehicle model where the car is hard-wired to one specific type of engine.',
    tags: ['dip', 'abstraction', 'automotive'],
    nodes: [
      node('n1', 'el-car', 'Car', pos(0, 0), ['start', 'stop', 'accelerate'], [
        { name: 'engine', type: 'DieselEngine' },
        { name: 'vin', type: 'string' },
      ]),
      node('n2', 'el-dieselengine', 'DieselEngine', pos(1, 0), ['ignite', 'shutdown', 'getRpm'], [
        { name: 'injectorPressure', type: 'double' },
      ]),
      node('n3', 'el-electricmotor', 'ElectricMotor', pos(2, 0), ['ignite', 'shutdown', 'getRpm'], [
        { name: 'batteryLevel', type: 'double' },
      ]),
      node('n4', 'el-wheel', 'Wheel', pos(0, 1), ['rotate'], [
        { name: 'diameter', type: 'int' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-car-diesel', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-car-wheel', 'n1', 'n4', 'composition'),
    ],
    briefing:
      'The product team wants to ship an electric variant next quarter. Look at how Car reaches its power source and whether the model already hints at an alternative that cannot be plugged in.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-car-diesel',
        elementIds: ['ed-car-diesel', 'el-car'],
        category: 'DIP Violation',
        aliases: ['Tight Coupling', 'OCP Violation'],
        explanationKeywords: ['dependency inversion', 'dip', 'concrete', 'interface', 'abstraction', 'engine', 'electric', 'inject', 'depend on abstraction'],
        modelAnswer:
          'Car (a high-level policy class) depends directly on the concrete DieselEngine, so ElectricMotor — which has the same ignite/shutdown/getRpm shape — cannot be used without editing Car. Introduce an Engine interface, make DieselEngine and ElectricMotor implement it, and have Car depend on Engine, injected through its constructor.',
        hints: [
          'What type is Car\'s engine field declared as?',
          'ElectricMotor has the same methods as DieselEngine — what is missing between them?',
          'Who should decide which engine a Car gets: the Car, or whoever builds it?',
        ],
      },
    ],
    verification: {
      mustIntroduceElementNames: ['Engine'],
      forbidDirectEdges: [{ from: 'Car', to: 'DieselEngine' }],
    },
  }),

  // ── 107 ── Doctor extends Patient ───────────────────────────────────────────
  pack({
    slug: 'dbg-doctor-extends-patient',
    title: 'Clinic Role Hierarchy',
    difficulty: 'easy',
    order: 107,
    description:
      'A clinic management model where staff and patients are related through inheritance.',
    tags: ['inheritance', 'healthcare', 'roles'],
    nodes: [
      node('n1', 'el-patient', 'Patient', pos(0, 0), ['bookAppointment', 'viewMedicalHistory', 'payBill'], [
        { name: 'patientId', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'insuranceNo', type: 'string' },
      ]),
      node('n2', 'el-doctor', 'Doctor', pos(1, 0), ['prescribe', 'diagnose', 'writeNotes'], [
        { name: 'licenseNo', type: 'string' },
        { name: 'specialty', type: 'string' },
      ]),
      node('n3', 'el-appointment', 'Appointment', pos(0, 1), ['reschedule', 'cancel'], [
        { name: 'slot', type: 'DateTime' },
      ]),
      node('n4', 'el-prescription', 'Prescription', pos(1, 1), ['renew'], [
        { name: 'medication', type: 'string' },
        { name: 'dosage', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-doctor-patient', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-appt-patient', 'n3', 'n1', 'association'),
      edge('e3', 'ed-appt-doctor', 'n3', 'n2', 'association'),
      edge('e4', 'ed-doctor-rx', 'n2', 'n4', 'dependency'),
    ],
    briefing:
      'Compare what a doctor and a patient each do in a clinic, then examine what Doctor automatically receives from the type it is connected to. Does the inherited surface area make sense?',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-doctor-is-patient',
        elementIds: ['ed-doctor-patient', 'el-doctor'],
        category: 'Incorrect Inheritance',
        aliases: ['Other'],
        explanationKeywords: ['is-a', 'not a patient', 'liskov', 'bookAppointment', 'medical history', 'shared base', 'person', 'role', 'inherits', 'abstract'],
        modelAnswer:
          'Doctor extends Patient, so a doctor inherits insuranceNo, viewMedicalHistory(), payBill() and bookAppointment() — and could be passed to code that expects a Patient. A doctor is not a kind of patient. If shared identity data is the intent, extract a common Person (or ClinicMember) base class, or model roles via composition, and have both Doctor and Patient relate to it independently.',
        hints: [
          'Does "A Doctor is a Patient" hold? Even if a doctor can be a patient, is it substitutable everywhere?',
          'List the Patient members that Doctor inherits and ask if each makes sense.',
          'What do the two roles genuinely share — and where should that live?',
        ],
      },
    ],
  }),

  // ── 108 ── Playlist ↔ Song cycle ────────────────────────────────────────────
  pack({
    slug: 'dbg-playlist-song-cycle',
    title: 'Playlist Song References',
    difficulty: 'easy',
    order: 108,
    description:
      'A music streaming model where playlists and songs know about each other.',
    tags: ['circular-dependency', 'music', 'coupling'],
    nodes: [
      node('n1', 'el-playlist', 'Playlist', pos(0, 0), ['addSong', 'removeSong', 'shuffle', 'getDuration'], [
        { name: 'name', type: 'string' },
        { name: 'songs', type: 'List<Song>' },
      ]),
      node('n2', 'el-song', 'Song', pos(1, 0), ['play', 'getTitle', 'getPlaylist'], [
        { name: 'title', type: 'string' },
        { name: 'durationSec', type: 'int' },
        { name: 'playlist', type: 'Playlist' },
      ]),
      node('n3', 'el-artist', 'Artist', pos(2, 0), ['getBio'], [
        { name: 'name', type: 'string' },
      ]),
      node('n4', 'el-user', 'User', pos(0, 1), ['createPlaylist'], [
        { name: 'id', type: 'string' },
      ]),
      node('n5', 'el-player', 'AudioPlayer', pos(1, 1), ['load', 'pause', 'resume']),
    ],
    edges: [
      edge('e1', 'ed-playlist-song', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-song-playlist', 'n2', 'n1', 'dependency'),
      edge('e3', 'ed-song-artist', 'n2', 'n3', 'association'),
      edge('e4', 'ed-user-playlist', 'n4', 'n1', 'association'),
      edge('e5', 'ed-song-player', 'n2', 'n5', 'dependency'),
    ],
    briefing:
      'Follow the arrows between Playlist and Song in both directions. Ask which of the two should have to know the other exists to do its job, and what happens when you try to reuse one without the other.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-playlist-song-cycle',
        elementIds: ['ed-playlist-song', 'ed-song-playlist'],
        category: 'Circular Dependency',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['circular', 'cycle', 'bidirectional', 'mutual', 'playlist', 'song', 'one direction', 'remove', 'getPlaylist', 'coupling'],
        modelAnswer:
          'Playlist holds Songs and Song holds a back-reference to a Playlist (getPlaylist), forming a bidirectional dependency cycle. Neither can be compiled, tested or reused alone, and a Song can only belong to one playlist, which is wrong for the domain (songs appear in many playlists). Break the cycle by removing Song → Playlist: Song should be a standalone entity, and Playlist references songs (or song ids) in one direction only.',
        hints: [
          'Do both arrows between Playlist and Song need to exist?',
          'Can a song belong to more than one playlist in this model?',
          'Which side is the "container" and which is the "content"? Only the container should know about the other.',
        ],
      },
    ],
  }),

  // ── 109 ── Report extends User ──────────────────────────────────────────────
  pack({
    slug: 'dbg-report-extends-user',
    title: 'Report Access Pattern',
    difficulty: 'easy',
    order: 109,
    description:
      'A reporting module where the report type is attached to the user model in order to reuse its permissions.',
    tags: ['inheritance', 'reporting', 'coupling'],
    nodes: [
      node('n1', 'el-user', 'User', pos(0, 0), ['login', 'hasPermission', 'changePassword'], [
        { name: 'id', type: 'string' },
        { name: 'passwordHash', type: 'string' },
        { name: 'roles', type: 'List<Role>' },
      ]),
      node('n2', 'el-report', 'Report', pos(1, 0), ['generate', 'exportPdf', 'schedule'], [
        { name: 'title', type: 'string' },
        { name: 'filters', type: 'Map<string, string>' },
      ]),
      node('n3', 'el-datasource', 'DataSource', pos(2, 0), ['query']),
      node('n4', 'el-role', 'Role', pos(0, 1), ['can'], [
        { name: 'name', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-report-user', 'n2', 'n1', 'inheritance'),
      edge('e2', 'ed-report-datasource', 'n2', 'n3', 'dependency'),
      edge('e3', 'ed-user-role', 'n1', 'n4', 'aggregation'),
    ],
    briefing:
      'Reports need to know who is allowed to run them, and someone chose a shortcut to get that. Look at how Report acquires its access logic and what else it brings along.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-report-is-user',
        elementIds: ['ed-report-user', 'el-report'],
        category: 'Incorrect Inheritance',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['is-a', 'not a user', 'inherit', 'reuse', 'hasPermission', 'passwordHash', 'composition', 'association', 'tight coupling', 'owner', 'requested by'],
        modelAnswer:
          'Report extends User just to reuse hasPermission(), but a report is not a user. It inherits login(), changePassword() and the password hash, and becomes tightly coupled to the whole User model so any change to User ripples into every report. Replace inheritance with an association: the report is requested by a User (or receives a permission-checking collaborator) and asks it hasPermission() before generating.',
        hints: [
          'Reuse is not a good enough reason to inherit — does Report pass the is-a test for User?',
          'List the sensitive members Report inherits that it should never expose.',
          'Report only needs to ask a question about the requester — which relationship type does that suggest?',
        ],
      },
    ],
  }),

  // ── 110 ── App depends on FileLogger ────────────────────────────────────────
  pack({
    slug: 'dbg-logger-debug-leaks',
    title: 'Logger Level Handling',
    difficulty: 'easy',
    order: 110,
    description:
      'An application bootstrapped with a hard-wired logger that makes log targets and levels painful to change or test.',
    tags: ['dip', 'logging', 'testability'],
    nodes: [
      node('n1', 'el-app', 'App', pos(0, 0), ['start', 'handleRequest', 'shutdown'], [
        { name: 'logger', type: 'FileLogger' },
      ]),
      node('n2', 'el-filelogger', 'FileLogger', pos(1, 0), ['debug', 'info', 'error', 'rotateFile'], [
        { name: 'path', type: 'string' },
        { name: 'level', type: 'LogLevel' },
      ]),
      node('n3', 'el-consolelogger', 'ConsoleLogger', pos(2, 0), ['debug', 'info', 'error'], [
        { name: 'level', type: 'LogLevel' },
      ]),
      node('n4', 'el-requesthandler', 'RequestHandler', pos(0, 1), ['handle'], [
        { name: 'route', type: 'string' },
      ]),
    ],
    edges: [
      edge('e1', 'ed-app-filelogger', 'n1', 'n2', 'dependency'),
      edge('e2', 'ed-app-handler', 'n1', 'n4', 'composition'),
    ],
    briefing:
      'Tests and local runs should log to the console, production to files, and the level should be easy to tune. Look at how App obtains its logger and whether the other logger in the diagram can be used at all.',
    requirement:
      'There is exactly 1 design problem in this diagram. Mark it, explain why it is a problem, then repair the model.',
    expectedIssues: [
      {
        id: 'iss-app-filelogger',
        elementIds: ['ed-app-filelogger', 'el-app'],
        category: 'DIP Violation',
        aliases: ['Tight Coupling'],
        explanationKeywords: ['dependency inversion', 'dip', 'concrete', 'filelogger', 'logger interface', 'abstraction', 'inject', 'consolelogger', 'testability', 'swap'],
        modelAnswer:
          'App depends directly on the concrete FileLogger, so it cannot log to the console or use a test double without being edited, even though ConsoleLogger has an identical debug/info/error surface. Introduce a Logger interface, have FileLogger and ConsoleLogger implement it, and inject a Logger into App so the log target and level are chosen at composition time.',
        hints: [
          'What is the declared type of App\'s logger field?',
          'ConsoleLogger exists but nothing can use it — what is missing between the two loggers and App?',
          'How would you unit-test App without writing to disk?',
        ],
      },
    ],
    verification: {
      forbidDirectEdges: [{ from: 'App', to: 'FileLogger' }],
    },
  }),
]
