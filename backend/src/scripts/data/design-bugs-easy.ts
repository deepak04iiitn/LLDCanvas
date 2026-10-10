interface DesignBugSeed {
  slug: string
  title: string
  description: string
  difficulty: 'easy'
  order: number
  diagramData: {
    nodes: Array<{ id: string; data: { label: string }; position: { x: number; y: number } }>
    edges: Array<{ id: string; source: string; target: string; label: string; type?: string }>
  }
  expectedIssues: Array<{
    id: string
    type: 'srp_violation' | 'wrong_relationship' | 'missing_abstraction' | 'coupling_issue' | 'cohesion_issue' | 'god_class' | 'other'
    targetClass: string
    description: string
    interviewContext: string
  }>
  explanation: string
}

export const EASY_BUGS: DesignBugSeed[] = [
  // ─── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: 'shopping-cart-inherits-user',
    title: 'Shopping Cart Inherits User',
    difficulty: 'easy',
    order: 7,
    description:
      'A ShoppingCart class extends User to gain access to address and payment preferences. The diagram shows ShoppingCart connected to CartItem and Product correctly, but the inheritance arrow from ShoppingCart to User is a design mistake. Identify the structural flaw.',
    diagramData: {
      nodes: [
        { id: 'User', data: { label: 'User' }, position: { x: 80, y: 80 } },
        { id: 'ShoppingCart', data: { label: 'ShoppingCart' }, position: { x: 310, y: 80 } },
        { id: 'CartItem', data: { label: 'CartItem' }, position: { x: 540, y: 80 } },
        { id: 'Product', data: { label: 'Product' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'ShoppingCart', target: 'User', label: 'extends', type: 'smoothstep' },
        { id: 'e2', source: 'ShoppingCart', target: 'CartItem', label: 'contains', type: 'smoothstep' },
        { id: 'e3', source: 'CartItem', target: 'Product', label: 'references', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'shopping-cart-wrong-inheritance',
        type: 'wrong_relationship',
        targetClass: 'ShoppingCart',
        description:
          'ShoppingCart extends User, which violates the "is-a" rule of inheritance. A shopping cart is not a user — it belongs to a user. This tight coupling exposes all User internals to ShoppingCart and breaks Liskov Substitution: a ShoppingCart cannot be substituted wherever a User is expected without violating caller assumptions.',
        interviewContext:
          'This tests whether the candidate understands the LSP and the "is-a vs has-a" distinction. A strong candidate immediately flags that ShoppingCart should hold a userId field (composition) rather than inheriting User, and explains that no subclass should exist solely to steal parent fields.',
      },
    ],
    explanation:
      'ShoppingCart should use composition: store a userId field and resolve the User via a UserRepository when needed. Inheritance is appropriate only for true "is-a" relationships. Inheriting User just to access address or payment fields creates fragile coupling and a semantically wrong type hierarchy. The correct fix is a has-a relationship: ShoppingCart has a userId, and the cart is retrieved through a CartRepository keyed by that userId.',
  },

  // ─── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: 'book-author-bidirectional',
    title: 'Book & Author Circular Reference',
    difficulty: 'easy',
    order: 8,
    description:
      'Book holds a direct reference to its Author, and Author holds a List<Book> pointing back. While this feels natural, it introduces a bidirectional dependency that tightly couples both classes. Identify the coupling problem.',
    diagramData: {
      nodes: [
        { id: 'Book', data: { label: 'Book' }, position: { x: 80, y: 80 } },
        { id: 'Author', data: { label: 'Author' }, position: { x: 310, y: 80 } },
        { id: 'Publisher', data: { label: 'Publisher' }, position: { x: 540, y: 80 } },
        { id: 'Genre', data: { label: 'Genre' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Book', target: 'Author', label: 'has Author', type: 'smoothstep' },
        { id: 'e2', source: 'Author', target: 'Book', label: 'has List<Book>', type: 'smoothstep' },
        { id: 'e3', source: 'Book', target: 'Publisher', label: 'published by', type: 'smoothstep' },
        { id: 'e4', source: 'Book', target: 'Genre', label: 'categorized as', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'book-author-circular',
        type: 'coupling_issue',
        targetClass: 'Author',
        description:
          'Author holds a List<Book> while Book holds an Author reference, forming a bidirectional cycle. Neither class can be instantiated, serialised, or tested in isolation without bringing the other along. This also causes infinite recursion during JSON serialisation and makes object graphs unnecessarily complex.',
        interviewContext:
          'Interviewers use this to test whether candidates understand the costs of bidirectional associations. A senior candidate recognises that one direction is the authority — Book references Author — and any "books by this author" query should go through a BookRepository, not through a back-pointer on Author.',
      },
    ],
    explanation:
      'Prefer unidirectional navigation: Book holds a reference to Author; if you need all books by an author, query a BookRepository with the authorId. Bidirectional associations create cyclic dependencies that complicate serialisation, unit testing, and memory management. The reference direction should follow the domain\'s natural read direction — an Author entity does not carry their entire bibliography embedded inside them.',
  },

  // ─── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: 'employee-payroll-god-class',
    title: 'Employee Payroll God Class',
    difficulty: 'easy',
    order: 9,
    description:
      'The Employee class directly handles payroll calculation, leave management, and performance reviews alongside core employee data. Each of these is a distinct business capability that should live in its own service. Identify the design violation.',
    diagramData: {
      nodes: [
        { id: 'Employee', data: { label: 'Employee' }, position: { x: 80, y: 80 } },
        { id: 'Department', data: { label: 'Department' }, position: { x: 310, y: 80 } },
        { id: 'PayrollCalculator', data: { label: 'PayrollCalculator' }, position: { x: 540, y: 80 } },
        { id: 'LeaveManager', data: { label: 'LeaveManager' }, position: { x: 80, y: 250 } },
        { id: 'PerformanceReview', data: { label: 'PerformanceReview' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Employee', target: 'Department', label: 'belongs to', type: 'smoothstep' },
        { id: 'e2', source: 'Employee', target: 'PayrollCalculator', label: 'calculates [MIXED]', type: 'smoothstep' },
        { id: 'e3', source: 'Employee', target: 'LeaveManager', label: 'manages [MIXED]', type: 'smoothstep' },
        { id: 'e4', source: 'Employee', target: 'PerformanceReview', label: 'reviews [MIXED]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'employee-god-class',
        type: 'god_class',
        targetClass: 'Employee',
        description:
          'Employee absorbs payroll calculation, leave management, and performance review logic in addition to its own domain data. Each of these is a distinct business capability with its own rules, external dependencies, and rate of change. A tax-rule change in payroll should never require touching the Employee class.',
        interviewContext:
          'This is a classic SRP test disguised as an HR domain model. The interviewer wants to see the candidate decompose Employee into a pure data entity and delegate each behaviour to PayrollService, LeaveService, and PerformanceReviewService. Candidates who only spot one responsibility miss the deeper god-class pattern.',
      },
    ],
    explanation:
      'Employee should be a pure domain entity holding identity data: employeeId, name, role, department, startDate. Payroll calculation belongs in a PayrollService, leave management in a LeaveService, and performance reviews in a PerformanceReviewService — each accepting an employeeId or Employee reference as input. This separation means each service can evolve, be tested, and be deployed independently. Changes in payroll tax rules or performance review criteria never touch Employee.',
  },

  // ─── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: 'hotel-no-room-abstraction',
    title: 'Hotel Booking — No Room Abstraction',
    difficulty: 'easy',
    order: 10,
    description:
      'HotelBooking directly couples to SingleRoom, DoubleRoom, and Suite concrete types. There is no shared Room interface, so the booking system handles each room type with separate conditional branches. Identify the missing design element.',
    diagramData: {
      nodes: [
        { id: 'HotelBooking', data: { label: 'HotelBooking' }, position: { x: 80, y: 80 } },
        { id: 'SingleRoom', data: { label: 'SingleRoom' }, position: { x: 310, y: 80 } },
        { id: 'DoubleRoom', data: { label: 'DoubleRoom' }, position: { x: 540, y: 80 } },
        { id: 'Suite', data: { label: 'Suite' }, position: { x: 770, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'HotelBooking', target: 'SingleRoom', label: 'books directly', type: 'smoothstep' },
        { id: 'e2', source: 'HotelBooking', target: 'DoubleRoom', label: 'books directly', type: 'smoothstep' },
        { id: 'e3', source: 'HotelBooking', target: 'Suite', label: 'books directly', type: 'smoothstep' },
        { id: 'e4', source: 'HotelBooking', target: 'Customer', label: 'for customer', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'hotel-missing-room-interface',
        type: 'missing_abstraction',
        targetClass: 'HotelBooking',
        description:
          'HotelBooking couples directly to every concrete room type instead of depending on a Room interface. Adding a new room type like PentHouse requires modifying HotelBooking, violating the Open/Closed Principle. The absence of abstraction also prevents polymorphic pricing, availability checks, and capacity queries.',
        interviewContext:
          'This tests Dependency Inversion and OCP knowledge. A strong candidate immediately introduces a Room interface with getRoomType(), getPricePerNight(), and getCapacity(), then rewrites HotelBooking to depend on Room. They should note that adding a PentHouse requires zero changes to HotelBooking.',
      },
    ],
    explanation:
      'Introduce a Room interface with getRoomType(), getPricePerNight(), getCapacity(), and isAvailable(). SingleRoom, DoubleRoom, and Suite all implement Room. HotelBooking depends only on Room, making the booking logic uniform and extensible. Adding PentHouse requires only a new class implementing Room — HotelBooking remains untouched, which is the essence of the Open/Closed Principle.',
  },

  // ─── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: 'product-inventory-mixed',
    title: 'Product Mixes Inventory Concerns',
    difficulty: 'easy',
    order: 11,
    description:
      'The Product class contains trackStock(), updateWarehouseLocation(), and manageSupplier() methods alongside its core attributes. Inventory tracking, warehouse logistics, and supplier management are distinct concerns that do not belong inside a product entity. Identify the violation.',
    diagramData: {
      nodes: [
        { id: 'Product', data: { label: 'Product' }, position: { x: 80, y: 80 } },
        { id: 'Warehouse', data: { label: 'Warehouse' }, position: { x: 310, y: 80 } },
        { id: 'Supplier', data: { label: 'Supplier' }, position: { x: 540, y: 80 } },
        { id: 'Category', data: { label: 'Category' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Product', target: 'Warehouse', label: 'trackStock() [MIXED]', type: 'smoothstep' },
        { id: 'e2', source: 'Product', target: 'Supplier', label: 'manageSupplier() [MIXED]', type: 'smoothstep' },
        { id: 'e3', source: 'Product', target: 'Category', label: 'belongs to', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'product-srp-inventory',
        type: 'srp_violation',
        targetClass: 'Product',
        description:
          'Product handles inventory tracking, warehouse location updates, and supplier management — three distinct business concerns unrelated to a product\'s core identity. A change in warehouse system, stock-tracking logic, or supplier contract model all force modifications to the Product class, increasing risk and reducing cohesion.',
        interviewContext:
          'Interviewers present this to see whether candidates identify multiple "axes of change". The expected answer separates Product as a pure domain entity and creates InventoryService, WarehouseService, and SupplierService as independent collaborators. Candidates should articulate what each class\' single responsibility is.',
      },
    ],
    explanation:
      'Product should only represent its core identity: productId, name, description, price, and category. Create an InventoryService that tracks stock levels by productId, a WarehouseService that manages storage locations, and a SupplierService for supplier relationships. Each service holds its own dependencies and evolves independently. This ensures no single change in the logistics or supply chain domain touches the product catalogue.',
  },

  // ─── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: 'bank-account-god-class',
    title: 'BankAccount God Class',
    difficulty: 'easy',
    order: 12,
    description:
      'BankAccount manages deposits and withdrawals but also performs interest calculation, generates statements, and runs fraud detection — all in one class. The diagram shows it connected to Customer and Transaction correctly, but several critical responsibilities are wrongly embedded. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'BankAccount', data: { label: 'BankAccount' }, position: { x: 80, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 80 } },
        { id: 'Transaction', data: { label: 'Transaction' }, position: { x: 540, y: 80 } },
        { id: 'FraudDetector', data: { label: 'FraudDetector' }, position: { x: 80, y: 250 } },
        { id: 'Statement', data: { label: 'Statement' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'BankAccount', target: 'Customer', label: 'owned by', type: 'smoothstep' },
        { id: 'e2', source: 'BankAccount', target: 'Transaction', label: 'records', type: 'smoothstep' },
        { id: 'e3', source: 'BankAccount', target: 'FraudDetector', label: 'detects [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'BankAccount', target: 'Statement', label: 'generates [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'bank-account-god-class',
        type: 'god_class',
        targetClass: 'BankAccount',
        description:
          'BankAccount conflates core account operations (debit, credit, balance) with peripheral concerns like fraud detection and statement generation. Fraud detection logic changes independently of interest calculation, and statement formatting is an entirely separate concern from fund management. This class will accumulate changes from multiple business teams simultaneously.',
        interviewContext:
          'This is a popular fintech design question. The interviewer tests whether the candidate can recognise domain boundaries. BankAccount should be a clean domain aggregate; FraudDetectionService and StatementService should be independent services consuming account and transaction data as inputs.',
      },
    ],
    explanation:
      'BankAccount should own its core invariants: accountId, balance, accountNumber, and basic debit/credit operations with appropriate guards. Move interest calculation into an InterestService, statement generation into a StatementService, and fraud detection into a FraudDetectionService. These services consume BankAccount and Transaction data but live and evolve independently. This follows both SRP and the Domain-Driven Design aggregate pattern.',
  },

  // ─── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: 'user-wrong-extends-admin',
    title: 'User Extends Admin',
    difficulty: 'easy',
    order: 13,
    description:
      'In this system User extends Admin, inheriting administrative permissions and capabilities. The inheritance hierarchy is reversed — Admin should be a specialised User, not the other way around. Identify the structural flaw.',
    diagramData: {
      nodes: [
        { id: 'Admin', data: { label: 'Admin' }, position: { x: 80, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 310, y: 80 } },
        { id: 'Permission', data: { label: 'Permission' }, position: { x: 540, y: 80 } },
        { id: 'Role', data: { label: 'Role' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'User', target: 'Admin', label: 'extends [WRONG]', type: 'smoothstep' },
        { id: 'e2', source: 'Admin', target: 'Permission', label: 'has', type: 'smoothstep' },
        { id: 'e3', source: 'Admin', target: 'Role', label: 'has role', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'user-extends-admin-wrong',
        type: 'wrong_relationship',
        targetClass: 'User',
        description:
          'User extends Admin, which grants every regular user administrative capabilities by default. The correct hierarchy is Admin extends User — Admin is a specialised User with elevated permissions, not the other way around. The inverted hierarchy violates LSP and violates the principle of least privilege.',
        interviewContext:
          'Tests inheritance direction and the principle of least privilege. A strong candidate reverses the arrow — Admin extends User — and adds adminLevel and permissions to Admin. They may also suggest a Role-Permission model for more flexible, granular access control in a real system.',
      },
    ],
    explanation:
      'Admin is a specialisation of User and should extend it: Admin extends User. User holds common attributes (userId, email, name, createdAt) and Admin adds adminLevel and a set of Permission objects. If finer-grained access control is needed, introduce a Role-Permission many-to-many model. Never let the base class inherit from its specialisation — it is a fundamental inversion of the "is-a" principle.',
  },

  // ─── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: 'vehicle-no-interface',
    title: 'Vehicle Rental — No Vehicle Interface',
    difficulty: 'easy',
    order: 14,
    description:
      'RentalService directly references Car, Bike, and Truck concrete classes to handle rentals. There is no shared Vehicle abstraction, so each vehicle type requires separate handling logic inside RentalService. Identify what is missing.',
    diagramData: {
      nodes: [
        { id: 'RentalService', data: { label: 'RentalService' }, position: { x: 80, y: 80 } },
        { id: 'Car', data: { label: 'Car' }, position: { x: 310, y: 80 } },
        { id: 'Bike', data: { label: 'Bike' }, position: { x: 540, y: 80 } },
        { id: 'Truck', data: { label: 'Truck' }, position: { x: 770, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'RentalService', target: 'Car', label: 'rents directly', type: 'smoothstep' },
        { id: 'e2', source: 'RentalService', target: 'Bike', label: 'rents directly', type: 'smoothstep' },
        { id: 'e3', source: 'RentalService', target: 'Truck', label: 'rents directly', type: 'smoothstep' },
        { id: 'e4', source: 'RentalService', target: 'Customer', label: 'serves', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'rental-missing-vehicle-interface',
        type: 'missing_abstraction',
        targetClass: 'RentalService',
        description:
          'RentalService holds direct references to Car, Bike, and Truck, requiring separate code paths for each vehicle type. Adding a new vehicle like Scooter means modifying RentalService, violating the Open/Closed Principle. Without a Vehicle interface, polymorphic dispatch is impossible and rental logic is duplicated across type-specific branches.',
        interviewContext:
          'This is a classic polymorphism question. Interviewers expect candidates to define a Vehicle interface with getRentalRate(), isAvailable(), and getVehicleType(). RentalService then works with Vehicle — adding new vehicle types requires no changes to RentalService whatsoever.',
      },
    ],
    explanation:
      'Define a Vehicle interface with getRentalRate(), isAvailable(), getVehicleDetails(), and getVehicleType(). Car, Bike, and Truck implement this interface. RentalService depends on Vehicle and holds a List<Vehicle> for its fleet. When Scooter or ElectricCar is added, only a new implementing class is needed — RentalService remains closed for modification but open for extension.',
  },

  // ─── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: 'order-item-holds-order',
    title: 'OrderItem Holds Reference to Order',
    difficulty: 'easy',
    order: 15,
    description:
      'OrderItem holds a full reference back to its parent Order object, while Order already holds a List<OrderItem>. This creates a circular dependency between two tightly related domain objects. Identify the coupling flaw.',
    diagramData: {
      nodes: [
        { id: 'Order', data: { label: 'Order' }, position: { x: 80, y: 80 } },
        { id: 'OrderItem', data: { label: 'OrderItem' }, position: { x: 310, y: 80 } },
        { id: 'Product', data: { label: 'Product' }, position: { x: 540, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Order', target: 'OrderItem', label: 'contains', type: 'smoothstep' },
        { id: 'e2', source: 'OrderItem', target: 'Order', label: 'holds ref [WRONG]', type: 'smoothstep' },
        { id: 'e3', source: 'OrderItem', target: 'Product', label: 'references', type: 'smoothstep' },
        { id: 'e4', source: 'Order', target: 'Customer', label: 'placed by', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'order-item-circular-ref',
        type: 'coupling_issue',
        targetClass: 'OrderItem',
        description:
          'OrderItem holds a full Order reference while Order already holds a List<OrderItem>, forming a circular dependency. Neither object can be serialised, cloned, or garbage-collected without dragging the other along. Unit testing OrderItem in isolation is also impossible without constructing a fully-populated Order.',
        interviewContext:
          'Tests DDD aggregate boundary design and awareness of circular dependency costs. A senior candidate replaces the full Order reference with an orderId field (a primitive identifier) and explains that navigation from item to order should go through an OrderRepository — not through a back-pointer embedded in the item.',
      },
    ],
    explanation:
      'OrderItem should reference its parent order via an orderId field (a simple Long or String), not a full Order object. Order is the aggregate root and owns the collection of OrderItems. Navigation from an OrderItem back to its Order should be achieved through an OrderRepository.findById(orderId) call. This breaks the cycle, enables independent serialisation, and follows proper DDD aggregate boundary design.',
  },

  // ─── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: 'todo-list-god-class',
    title: 'TodoList God Class',
    difficulty: 'easy',
    order: 16,
    description:
      'TodoList manages tasks but also sends email reminders, exports data to CSV, and synchronises with external calendar services, all within a single class. Each of these is a distinct concern with independent dependencies. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'TodoList', data: { label: 'TodoList' }, position: { x: 80, y: 80 } },
        { id: 'Task', data: { label: 'Task' }, position: { x: 310, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 540, y: 80 } },
        { id: 'CalendarService', data: { label: 'CalendarService' }, position: { x: 80, y: 250 } },
        { id: 'ReminderService', data: { label: 'ReminderService' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'TodoList', target: 'Task', label: 'manages', type: 'smoothstep' },
        { id: 'e2', source: 'TodoList', target: 'User', label: 'owned by', type: 'smoothstep' },
        { id: 'e3', source: 'TodoList', target: 'CalendarService', label: 'syncs [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'TodoList', target: 'ReminderService', label: 'sends [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'todolist-god-class',
        type: 'god_class',
        targetClass: 'TodoList',
        description:
          'TodoList mixes core task management (add, remove, reorder) with notification (sendReminders), export (exportCSV), and external integration (syncCalendar) concerns. Each of these has different dependencies, failure modes, and rates of change. A calendar API outage should never crash the core task management flow or force a deploy of the task model.',
        interviewContext:
          'Interviewers use this to evaluate how candidates decompose a seemingly simple class. The expected answer separates TodoList into a pure task container and delegates reminders to a ReminderService, CSV export to a TodoExportService, and calendar sync to a CalendarSyncService — each independently injectable and testable.',
      },
    ],
    explanation:
      'TodoList should manage only its core concern: holding and organising tasks (add, remove, reorder, filter by status). Reminder delivery belongs in a ReminderService, data export in a TodoExportService, and calendar synchronisation in a CalendarSyncService. Each service takes a TodoList or List<Task> as input and operates independently. This makes each concern separately testable, deployable, and replaceable without touching the others.',
  },

  // ─── 11 ──────────────────────────────────────────────────────────────────
  {
    slug: 'flight-no-abstract-seat',
    title: 'Flight Booking — No Seat Abstraction',
    difficulty: 'easy',
    order: 17,
    description:
      'FlightBooking directly couples to EconomySeat, BusinessSeat, and FirstClassSeat concrete types without a shared Seat interface. Each cabin class requires separate conditional branches inside the booking system. Identify the missing abstraction.',
    diagramData: {
      nodes: [
        { id: 'FlightBooking', data: { label: 'FlightBooking' }, position: { x: 80, y: 80 } },
        { id: 'EconomySeat', data: { label: 'EconomySeat' }, position: { x: 310, y: 80 } },
        { id: 'BusinessSeat', data: { label: 'BusinessSeat' }, position: { x: 540, y: 80 } },
        { id: 'FirstClassSeat', data: { label: 'FirstClassSeat' }, position: { x: 770, y: 80 } },
        { id: 'Flight', data: { label: 'Flight' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'FlightBooking', target: 'EconomySeat', label: 'books directly', type: 'smoothstep' },
        { id: 'e2', source: 'FlightBooking', target: 'BusinessSeat', label: 'books directly', type: 'smoothstep' },
        { id: 'e3', source: 'FlightBooking', target: 'FirstClassSeat', label: 'books directly', type: 'smoothstep' },
        { id: 'e4', source: 'FlightBooking', target: 'Flight', label: 'on flight', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'flight-missing-seat-interface',
        type: 'missing_abstraction',
        targetClass: 'FlightBooking',
        description:
          'FlightBooking references three concrete seat types without a common Seat interface, forcing type-specific conditional logic for pricing, availability, and upgrade handling. Any new cabin class (e.g. PremiumEconomy) requires changes to FlightBooking, violating OCP. Uniform pricing and availability queries are impossible without shared polymorphic methods.',
        interviewContext:
          'Classic OCP and DIP test in a travel domain. A senior candidate introduces a Seat interface with getPrice(), isAvailable(), and getCabinClass(), then makes all seat types implement it. FlightBooking becomes fully agnostic of seat type details, and PremiumEconomy is added with zero changes to FlightBooking.',
      },
    ],
    explanation:
      'Introduce a Seat interface with getPrice(), isAvailable(), getCabinClass(), and getSeatNumber(). EconomySeat, BusinessSeat, and FirstClassSeat each implement this interface. FlightBooking depends only on Seat, making the booking flow uniform regardless of cabin class. Adding PremiumEconomy requires only a new implementing class — no modifications to FlightBooking, which exemplifies the Open/Closed Principle.',
  },

  // ─── 12 ──────────────────────────────────────────────────────────────────
  {
    slug: 'message-sender-singletons',
    title: 'Message Sender Abusing Singleton',
    difficulty: 'easy',
    order: 18,
    description:
      'EmailSender and SMSSender are implemented as Singletons that hold mutable state such as SMTP connection pools and SMS gateway sessions. NotificationService calls them statically. The Singleton pattern is misused for stateful infrastructure resources. Identify the design problem.',
    diagramData: {
      nodes: [
        { id: 'NotificationService', data: { label: 'NotificationService' }, position: { x: 80, y: 80 } },
        { id: 'EmailSender', data: { label: 'EmailSender\n(Singleton)' }, position: { x: 310, y: 80 } },
        { id: 'SMSSender', data: { label: 'SMSSender\n(Singleton)' }, position: { x: 540, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 80, y: 250 } },
        { id: 'Message', data: { label: 'Message' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'NotificationService', target: 'EmailSender', label: 'uses singleton', type: 'smoothstep' },
        { id: 'e2', source: 'NotificationService', target: 'SMSSender', label: 'uses singleton', type: 'smoothstep' },
        { id: 'e3', source: 'EmailSender', target: 'Message', label: 'sends', type: 'smoothstep' },
        { id: 'e4', source: 'SMSSender', target: 'Message', label: 'sends', type: 'smoothstep' },
        { id: 'e5', source: 'NotificationService', target: 'User', label: 'notifies', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'email-sender-singleton-abuse',
        type: 'other',
        targetClass: 'EmailSender',
        description:
          'EmailSender is a Singleton that holds mutable SMTP connection state and configuration. Singletons are appropriate only for stateless utilities, but stateful resources like connection pools and session handles must be managed by a DI container. Global mutable state makes concurrent access unsafe and testing impossible without static mocking hacks.',
        interviewContext:
          'Tests awareness of Singleton pitfalls and dependency injection principles. An interviewer expects the candidate to argue that EmailSender and SMSSender should implement IEmailSender and ISMSSender interfaces and be injected via constructor injection, with lifecycle managed by the DI container — not self-managed through static state.',
      },
    ],
    explanation:
      'EmailSender and SMSSender should be regular classes implementing IEmailSender and ISMSSender interfaces and injected wherever needed via constructor injection. Their instances should be managed by a dependency injection container scoped appropriately. This enables proper mocking in unit tests, thread-safe instantiation, connection pool lifecycle management, and easy swapping of email or SMS providers.',
  },

  // ─── 13 ──────────────────────────────────────────────────────────────────
  {
    slug: 'comment-inherits-post',
    title: 'Comment Inherits Post',
    difficulty: 'easy',
    order: 19,
    description:
      'Comment extends Post to inherit author and timestamp fields. A Comment is not a Post — it is a reply associated with a Post. Using inheritance here to share fields is a structural mistake. Identify the wrong relationship.',
    diagramData: {
      nodes: [
        { id: 'Post', data: { label: 'Post' }, position: { x: 80, y: 80 } },
        { id: 'Comment', data: { label: 'Comment' }, position: { x: 310, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 540, y: 80 } },
        { id: 'Tag', data: { label: 'Tag' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Comment', target: 'Post', label: 'extends [WRONG]', type: 'smoothstep' },
        { id: 'e2', source: 'Post', target: 'User', label: 'authored by', type: 'smoothstep' },
        { id: 'e3', source: 'Post', target: 'Tag', label: 'has tags', type: 'smoothstep' },
        { id: 'e4', source: 'Comment', target: 'User', label: 'authored by', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'comment-wrong-extends-post',
        type: 'wrong_relationship',
        targetClass: 'Comment',
        description:
          'Comment extends Post despite not being a type of Post — violating LSP. A Comment cannot be substituted wherever a Post is expected without breaking caller semantics. The intent is to reuse shared fields (authorId, createdAt), but inheritance is the wrong mechanism; a common AuthoredContent interface is appropriate if sharing is needed.',
        interviewContext:
          'Tests "is-a vs has-a" and LSP comprehension in a social/blog domain. A strong candidate breaks the inheritance, gives Comment a postId reference field, and optionally introduces an AuthoredContent interface for shared behaviour. They should also note Comment and Post have different validation, moderation, and display rules.',
      },
    ],
    explanation:
      'Comment should have a postId field referencing its parent Post, not inherit from it. If Comment and Post share common fields (authorId, createdAt, content), introduce an AuthoredContent interface or abstract base class. Comment adds commentId and postId; Post adds tags and visibility. The "is-a" rule must hold strictly — every Comment must be safely usable as a Post for inheritance to be valid, and it clearly cannot.',
  },

  // ─── 14 ──────────────────────────────────────────────────────────────────
  {
    slug: 'payment-method-in-order',
    title: 'Payment Logic Inside Order',
    difficulty: 'easy',
    order: 20,
    description:
      'The Order class contains chargeCard(), processPayPal(), and handleRefund() methods directly within the domain object. Payment processing is an infrastructure concern that must not be embedded inside an order entity. Identify the SRP violation.',
    diagramData: {
      nodes: [
        { id: 'Order', data: { label: 'Order' }, position: { x: 80, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 80 } },
        { id: 'Product', data: { label: 'Product' }, position: { x: 540, y: 80 } },
        { id: 'PaymentProcessor', data: { label: 'PaymentProcessor' }, position: { x: 80, y: 250 } },
        { id: 'OrderItem', data: { label: 'OrderItem' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Order', target: 'Customer', label: 'placed by', type: 'smoothstep' },
        { id: 'e2', source: 'Order', target: 'OrderItem', label: 'contains', type: 'smoothstep' },
        { id: 'e3', source: 'OrderItem', target: 'Product', label: 'references', type: 'smoothstep' },
        { id: 'e4', source: 'Order', target: 'PaymentProcessor', label: 'chargeCard() [MIXED]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'order-payment-srp',
        type: 'srp_violation',
        targetClass: 'Order',
        description:
          'Order violates SRP by mixing domain responsibility (tracking ordered items and state) with payment processing (card charging, PayPal integration, refunds). Payment processors change independently of order logic — a new PSP integration or refund policy change should not require modifying the Order domain object.',
        interviewContext:
          'This is a DDD-meets-clean-architecture question. Interviewers look for candidates who identify Order as a domain aggregate that tracks state (PENDING, CONFIRMED, SHIPPED) and delegates all payment to a PaymentService accepting an Order and a PaymentMethod — keeping domain and infrastructure strictly separated.',
      },
    ],
    explanation:
      'Order should be a domain aggregate holding state, line items, and customer reference with no payment dependencies. Extract a PaymentService with charge(Order, PaymentMethod) and refund(Order, RefundRequest) methods. PaymentMethod can be an interface implemented by CreditCard, PayPal, BankTransfer, etc. This separation means payment provider changes are fully isolated from the Order domain.',
  },

  // ─── 15 ──────────────────────────────────────────────────────────────────
  {
    slug: 'restaurant-no-menu-abstraction',
    title: 'Restaurant — No Menu Item Abstraction',
    difficulty: 'easy',
    order: 21,
    description:
      'RestaurantOrder directly references Burger, Pizza, and Drink concrete classes when building and pricing an order. There is no shared MenuItem interface, so each item type requires separate handling logic. Identify the missing abstraction.',
    diagramData: {
      nodes: [
        { id: 'RestaurantOrder', data: { label: 'RestaurantOrder' }, position: { x: 80, y: 80 } },
        { id: 'Burger', data: { label: 'Burger' }, position: { x: 310, y: 80 } },
        { id: 'Pizza', data: { label: 'Pizza' }, position: { x: 540, y: 80 } },
        { id: 'Drink', data: { label: 'Drink' }, position: { x: 770, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'RestaurantOrder', target: 'Burger', label: 'directly refs', type: 'smoothstep' },
        { id: 'e2', source: 'RestaurantOrder', target: 'Pizza', label: 'directly refs', type: 'smoothstep' },
        { id: 'e3', source: 'RestaurantOrder', target: 'Drink', label: 'directly refs', type: 'smoothstep' },
        { id: 'e4', source: 'RestaurantOrder', target: 'Customer', label: 'placed by', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'restaurant-missing-menu-interface',
        type: 'missing_abstraction',
        targetClass: 'RestaurantOrder',
        description:
          'RestaurantOrder couples to Burger, Pizza, and Drink without a shared MenuItem interface, forcing separate conditional logic for pricing, availability, and customisation per item type. Every new menu item (Salad, Dessert) requires modifying RestaurantOrder, violating OCP. Uniform operations like order total calculation cannot be expressed polymorphically.',
        interviewContext:
          'Classic polymorphism test in a food ordering domain. A strong candidate introduces a MenuItem interface with getPrice(), getName(), getCategory(), and isAvailable(). RestaurantOrder then holds a List<MenuItem> and iterates it for totals and availability — completely agnostic of concrete item types.',
      },
    ],
    explanation:
      'Define a MenuItem interface with getPrice(), getName(), getCategory(), and isAvailable(). Burger, Pizza, Drink, and future additions like Salad all implement MenuItem. RestaurantOrder holds a List<MenuItem> and delegates all item-level operations to the interface. Order total becomes a single polymorphic loop, and adding a new menu item type requires zero changes to RestaurantOrder.',
  },

  // ─── 16 ──────────────────────────────────────────────────────────────────
  {
    slug: 'invoice-sends-email',
    title: 'Invoice Sends Its Own Email',
    difficulty: 'easy',
    order: 22,
    description:
      'The Invoice class has a sendToCustomer() method that composes an email and dispatches it via SMTP. Invoice is a financial domain entity — sending emails is an infrastructure concern that must not live inside it. Identify the SRP violation.',
    diagramData: {
      nodes: [
        { id: 'Invoice', data: { label: 'Invoice' }, position: { x: 80, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 80 } },
        { id: 'EmailService', data: { label: 'EmailService' }, position: { x: 540, y: 80 } },
        { id: 'InvoiceItem', data: { label: 'InvoiceItem' }, position: { x: 80, y: 250 } },
        { id: 'Order', data: { label: 'Order' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Invoice', target: 'Customer', label: 'billed to', type: 'smoothstep' },
        { id: 'e2', source: 'Invoice', target: 'InvoiceItem', label: 'contains', type: 'smoothstep' },
        { id: 'e3', source: 'Invoice', target: 'Order', label: 'for order', type: 'smoothstep' },
        { id: 'e4', source: 'Invoice', target: 'EmailService', label: 'sendToCustomer() [MIXED]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'invoice-srp-email',
        type: 'srp_violation',
        targetClass: 'Invoice',
        description:
          'Invoice mixes financial domain concerns (line items, totals, tax) with email-sending infrastructure (SMTP, templates, recipient addresses). A change in email template, SMTP provider, or notification preferences forces a change to the Invoice domain class — which should only change when invoicing business rules change.',
        interviewContext:
          'This is a domain purity question. Interviewers expect candidates to separate Invoice as a domain entity and introduce an InvoiceNotificationService that receives an Invoice and handles dispatch. The Invoice should never be aware of how or whether it is communicated to the customer.',
      },
    ],
    explanation:
      'Invoice should be a pure domain entity: invoiceId, items, subtotal, tax, total, dueDate, customer. Create an InvoiceNotificationService with sendInvoice(Invoice, NotificationChannel) that handles email composition and dispatch. This makes Invoice independently testable without email infrastructure, and notification behaviour can be changed (e.g. SMS, push) without touching the domain class.',
  },

  // ─── 17 ──────────────────────────────────────────────────────────────────
  {
    slug: 'blog-post-god-class',
    title: 'Blog Post God Class',
    difficulty: 'easy',
    order: 23,
    description:
      'The Post class handles content storage, SEO meta tag generation, comment moderation, social media sharing, and analytics tracking all in one class. Each of these is a distinct subsystem, yet they are merged into a single domain object. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'Post', data: { label: 'Post' }, position: { x: 80, y: 80 } },
        { id: 'Author', data: { label: 'Author' }, position: { x: 310, y: 80 } },
        { id: 'Category', data: { label: 'Category' }, position: { x: 540, y: 80 } },
        { id: 'AnalyticsTracker', data: { label: 'AnalyticsTracker' }, position: { x: 80, y: 250 } },
        { id: 'SocialSharer', data: { label: 'SocialSharer' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Post', target: 'Author', label: 'written by', type: 'smoothstep' },
        { id: 'e2', source: 'Post', target: 'Category', label: 'categorized', type: 'smoothstep' },
        { id: 'e3', source: 'Post', target: 'AnalyticsTracker', label: 'tracks [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'Post', target: 'SocialSharer', label: 'shares [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'post-god-class',
        type: 'god_class',
        targetClass: 'Post',
        description:
          'Post absorbs rendering, SEO generation, comment moderation, social sharing, and analytics tracking — each with completely independent change triggers. A new social media platform, updated analytics SDK, or revised SEO rules should each require zero modifications to Post. Having all these concerns in one class creates fragility across multiple axes simultaneously.',
        interviewContext:
          'Interviewers use a god class like this to assess decomposition instincts. The strongest candidates split SEOService, CommentModerationService, SocialShareService, and AnalyticsService out as independent services. They may also mention domain events (PostPublishedEvent) so analytics and sharing are triggered reactively without Post knowing about them.',
      },
    ],
    explanation:
      'Post should be a domain entity: postId, title, content, author, tags, and status. SEO generation belongs in an SEOService, comment moderation in a ModerationService, social sharing in a SocialShareService, and analytics in an AnalyticsService. Post lifecycle events (PostPublishedEvent) can be emitted as domain events that these services subscribe to, achieving loose coupling via the Observer pattern with zero direct coupling to Post.',
  },

  // ─── 18 ──────────────────────────────────────────────────────────────────
  {
    slug: 'car-engine-no-abstraction',
    title: 'Car Has Concrete Engine',
    difficulty: 'easy',
    order: 24,
    description:
      'Car holds a direct dependency on DieselEngine as a concrete class. Swapping to a PetrolEngine or ElectricEngine requires modifying Car itself, because no Engine abstraction exists. Identify the missing interface.',
    diagramData: {
      nodes: [
        { id: 'Car', data: { label: 'Car' }, position: { x: 80, y: 80 } },
        { id: 'DieselEngine', data: { label: 'DieselEngine' }, position: { x: 310, y: 80 } },
        { id: 'FuelTank', data: { label: 'FuelTank' }, position: { x: 540, y: 80 } },
        { id: 'Transmission', data: { label: 'Transmission' }, position: { x: 80, y: 250 } },
        { id: 'Wheels', data: { label: 'Wheels' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Car', target: 'DieselEngine', label: 'has (concrete)', type: 'smoothstep' },
        { id: 'e2', source: 'Car', target: 'FuelTank', label: 'has', type: 'smoothstep' },
        { id: 'e3', source: 'Car', target: 'Transmission', label: 'has', type: 'smoothstep' },
        { id: 'e4', source: 'Car', target: 'Wheels', label: 'has', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'car-concrete-engine',
        type: 'missing_abstraction',
        targetClass: 'Car',
        description:
          'Car holds a direct reference to DieselEngine instead of an Engine interface. Swapping to an ElectricEngine or HybridEngine requires modifying the Car class, violating both OCP and DIP. The lack of an Engine abstraction also prevents runtime engine substitution, dependency injection, and testing with a mock engine.',
        interviewContext:
          'Tests DIP understanding in a concrete domain. Interviewers expect candidates to define an Engine interface with start(), stop(), getFuelType(), and getHorsePower(). Car is then constructed with an injected Engine instance, making it independent of engine implementation and fully testable in isolation.',
      },
    ],
    explanation:
      'Define an Engine interface with start(), stop(), getFuelType(), and getHorsePower(). DieselEngine, PetrolEngine, and ElectricEngine all implement Engine. Car is constructed with an Engine dependency injected via constructor. This makes Car open for extension (new engine types) without modification, and engine behaviour is fully mockable in unit tests — a direct application of the Dependency Inversion Principle.',
  },

  // ─── 19 ──────────────────────────────────────────────────────────────────
  {
    slug: 'doctor-wrong-extends-patient',
    title: 'Doctor Extends Patient',
    difficulty: 'easy',
    order: 25,
    description:
      'Doctor extends Patient to inherit common personal attributes like name, dateOfBirth, and contactInfo. While both share personal data, a Doctor is not a Patient. Both are types of Person and should extend a common Person base. Identify the wrong hierarchy.',
    diagramData: {
      nodes: [
        { id: 'Patient', data: { label: 'Patient' }, position: { x: 80, y: 80 } },
        { id: 'Doctor', data: { label: 'Doctor' }, position: { x: 310, y: 80 } },
        { id: 'Person', data: { label: 'Person' }, position: { x: 540, y: 80 } },
        { id: 'Appointment', data: { label: 'Appointment' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Doctor', target: 'Patient', label: 'extends [WRONG]', type: 'smoothstep' },
        { id: 'e2', source: 'Patient', target: 'Person', label: 'extends', type: 'smoothstep' },
        { id: 'e3', source: 'Appointment', target: 'Doctor', label: 'assigned to', type: 'smoothstep' },
        { id: 'e4', source: 'Appointment', target: 'Patient', label: 'for patient', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'doctor-extends-patient-wrong',
        type: 'wrong_relationship',
        targetClass: 'Doctor',
        description:
          'Doctor extends Patient, implying every Doctor is-a Patient — semantically false and dangerous in any system that manages patient records. If a Doctor is also a patient in the same system, that must be modelled through separate Person instances or a dual-role association, not through single inheritance. This grants Doctor unintended access to medical record and patient-specific behaviour.',
        interviewContext:
          'Tests hierarchy design with a classic dual-role problem. Interviewers expect candidates to introduce a Person base class and have both Doctor and Patient extend it. A senior candidate may further explore how to handle the real-world case where a doctor is also a patient in the same hospital system.',
      },
    ],
    explanation:
      'Introduce a Person class with shared attributes: personId, name, dateOfBirth, contactInfo. Doctor extends Person and adds medicalLicenseId, specialisation, and schedule. Patient extends Person and adds medicalRecordId, diagnosis, and admissionDate. Appointments link a Doctor to a Patient by reference. If a person can be both doctor and patient, use a role-association pattern rather than collapsing both identities into a single inheritance path.',
  },

  // ─── 20 ──────────────────────────────────────────────────────────────────
  {
    slug: 'event-ticket-god-class',
    title: 'Event Ticket God Class',
    difficulty: 'easy',
    order: 26,
    description:
      'EventTicket handles seat assignment, payment processing, PDF ticket generation, and email delivery all within a single class. Beyond its core identity as a ticket, it reaches into payment, document generation, and notification infrastructure. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'EventTicket', data: { label: 'EventTicket' }, position: { x: 80, y: 80 } },
        { id: 'Event', data: { label: 'Event' }, position: { x: 310, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 540, y: 80 } },
        { id: 'PDFGenerator', data: { label: 'PDFGenerator' }, position: { x: 80, y: 250 } },
        { id: 'PaymentProcessor', data: { label: 'PaymentProcessor' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'EventTicket', target: 'Event', label: 'for event', type: 'smoothstep' },
        { id: 'e2', source: 'EventTicket', target: 'Customer', label: 'owned by', type: 'smoothstep' },
        { id: 'e3', source: 'EventTicket', target: 'PDFGenerator', label: 'generates [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'EventTicket', target: 'PaymentProcessor', label: 'processes [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'event-ticket-god-class',
        type: 'god_class',
        targetClass: 'EventTicket',
        description:
          'EventTicket mixes domain identity (ticketNumber, seat, event, owner) with payment processing, PDF generation, and email delivery. These infrastructure concerns have their own dependencies (payment gateway, PDF library, SMTP) and completely independent reasons to change. A change in PDF template or billing provider forces a change to a domain class.',
        interviewContext:
          'Tests SRP and infrastructure separation in an event management context. The interviewer expects the candidate to keep EventTicket as a lightweight domain entity and introduce TicketPaymentService, TicketPDFService, and TicketNotificationService as separate collaborators that accept a ticket as input.',
      },
    ],
    explanation:
      'EventTicket should hold only its domain state: ticketId, event, seat, owner, status (RESERVED, PAID, CANCELLED). Introduce a TicketPaymentService for payment processing, a TicketPDFService for document generation, and a TicketNotificationService for email delivery. These services are wired together in a TicketPurchaseUseCase at the application layer that orchestrates the complete workflow.',
  },

  // ─── 21 ──────────────────────────────────────────────────────────────────
  {
    slug: 'task-manager-no-priority',
    title: 'Task Manager — No Priority Abstraction',
    difficulty: 'easy',
    order: 27,
    description:
      'TaskQueue maintains three separate typed lists: List<UrgentTask>, List<NormalTask>, and List<LowTask>. There is no shared Task abstraction, so every priority-related operation requires separate code per list. Identify what is missing.',
    diagramData: {
      nodes: [
        { id: 'TaskQueue', data: { label: 'TaskQueue' }, position: { x: 80, y: 80 } },
        { id: 'UrgentTask', data: { label: 'UrgentTask' }, position: { x: 310, y: 80 } },
        { id: 'NormalTask', data: { label: 'NormalTask' }, position: { x: 540, y: 80 } },
        { id: 'LowTask', data: { label: 'LowTask' }, position: { x: 770, y: 80 } },
        { id: 'Worker', data: { label: 'Worker' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'TaskQueue', target: 'UrgentTask', label: 'holds list', type: 'smoothstep' },
        { id: 'e2', source: 'TaskQueue', target: 'NormalTask', label: 'holds list', type: 'smoothstep' },
        { id: 'e3', source: 'TaskQueue', target: 'LowTask', label: 'holds list', type: 'smoothstep' },
        { id: 'e4', source: 'TaskQueue', target: 'Worker', label: 'dispatches to', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'taskqueue-missing-abstraction',
        type: 'missing_abstraction',
        targetClass: 'TaskQueue',
        description:
          'TaskQueue holds three separate typed collections instead of a single List<Task>. Adding a new priority level (e.g. Critical) requires modifying TaskQueue\'s data structure and all dispatch logic. All task-type-specific differences should be encapsulated within the task objects themselves, not scattered across multiple lists in the queue.',
        interviewContext:
          'Tests abstraction and Strategy-pattern instincts in a queuing context. Interviewers expect candidates to define a Task interface with execute(), getPriority(), and getDescription(), then make TaskQueue hold a single PriorityQueue<Task>. Sorting is driven by a Comparator<Task> and no changes to TaskQueue are needed for new priority levels.',
      },
    ],
    explanation:
      'Define a Task interface with execute(), getPriority(), and getDescription(). UrgentTask, NormalTask, and LowTask all implement Task. TaskQueue holds a single PriorityQueue<Task> sorted by getPriority(). Adding a CriticalTask priority requires only a new implementing class. The Strategy pattern can further make the prioritisation algorithm injectable into TaskQueue for maximum flexibility.',
  },

  // ─── 22 ──────────────────────────────────────────────────────────────────
  {
    slug: 'user-profile-srp',
    title: 'UserProfile SRP Violation',
    difficulty: 'easy',
    order: 28,
    description:
      'UserProfile contains methods for updating the avatar, changing the password, sending verification emails, and deactivating the account. These span storage, authentication, notification, and account lifecycle — four distinct concerns in a single class. Identify the SRP violation.',
    diagramData: {
      nodes: [
        { id: 'UserProfile', data: { label: 'UserProfile' }, position: { x: 80, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 310, y: 80 } },
        { id: 'AvatarService', data: { label: 'AvatarService' }, position: { x: 540, y: 80 } },
        { id: 'AuthService', data: { label: 'AuthService' }, position: { x: 80, y: 250 } },
        { id: 'EmailNotifier', data: { label: 'EmailNotifier' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'UserProfile', target: 'User', label: 'belongs to', type: 'smoothstep' },
        { id: 'e2', source: 'UserProfile', target: 'AvatarService', label: 'updateAvatar() [MIXED]', type: 'smoothstep' },
        { id: 'e3', source: 'UserProfile', target: 'AuthService', label: 'changePassword() [MIXED]', type: 'smoothstep' },
        { id: 'e4', source: 'UserProfile', target: 'EmailNotifier', label: 'sendVerification() [MIXED]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'user-profile-srp',
        type: 'srp_violation',
        targetClass: 'UserProfile',
        description:
          'UserProfile owns avatar management (file storage dependency), password changes (auth dependency), email verification (SMTP dependency), and account deactivation (lifecycle logic) all at once. Each of these has a different dependency tree, failure mode, and business owner. Mixing them into a single class creates a fragile, heavily-coupled object with many reasons to change.',
        interviewContext:
          'Interviewers present this to see whether candidates can identify multiple "axes of change". The expected response is to extract AvatarService, AuthService, AccountNotificationService, and AccountLifecycleService, reducing UserProfile to a data-holding entity with displayName, bio, and avatarUrl only.',
      },
    ],
    explanation:
      'UserProfile should be a domain entity holding presentation data: displayName, bio, avatarUrl, preferredLanguage. Avatar uploads belong in an AvatarService, password changes in an AuthService with proper credential validation, verification emails in a NotificationService, and deactivation in an AccountLifecycleService. Each extracted service is independently injectable, mockable, and evolvable without touching the others.',
  },

  // ─── 23 ──────────────────────────────────────────────────────────────────
  {
    slug: 'playlist-song-circular',
    title: 'Playlist-Song Circular Reference',
    difficulty: 'easy',
    order: 29,
    description:
      'Playlist holds a List<Song>, and Song holds a back-reference to its Playlist. This bidirectional design creates a circular dependency and prevents a Song from belonging to multiple playlists. Identify the coupling issue.',
    diagramData: {
      nodes: [
        { id: 'Playlist', data: { label: 'Playlist' }, position: { x: 80, y: 80 } },
        { id: 'Song', data: { label: 'Song' }, position: { x: 310, y: 80 } },
        { id: 'Artist', data: { label: 'Artist' }, position: { x: 540, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Playlist', target: 'Song', label: 'has List<Song>', type: 'smoothstep' },
        { id: 'e2', source: 'Song', target: 'Playlist', label: 'has Playlist [WRONG]', type: 'smoothstep' },
        { id: 'e3', source: 'Song', target: 'Artist', label: 'performed by', type: 'smoothstep' },
        { id: 'e4', source: 'Playlist', target: 'User', label: 'owned by', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'song-circular-playlist',
        type: 'coupling_issue',
        targetClass: 'Song',
        description:
          'Song holds a direct Playlist reference, forming a bidirectional cycle: Playlist → Song → Playlist. Song cannot be serialised or shared across multiple playlists without duplication or broken references. Songs are independent entities that exist outside any playlist and should have no knowledge of the playlists that contain them.',
        interviewContext:
          'Tests bidirectional association costs and domain modelling instincts. A strong candidate removes the Playlist reference from Song entirely. If you need the playlists containing a song, you query through a PlaylistRepository. They may also introduce a PlaylistEntry join entity for richer association metadata like position or added-date.',
      },
    ],
    explanation:
      'Song should be an independent entity with no knowledge of Playlist. Playlist holds a List<Song> (or List<PlaylistEntry> if ordering and add-date metadata are important). Navigation from a song to the playlists it appears in goes through a PlaylistRepository query. This allows a song to exist in multiple playlists, be shared across users, and be independently created without any coupling to a Playlist.',
  },

  // ─── 24 ──────────────────────────────────────────────────────────────────
  {
    slug: 'loan-god-class',
    title: 'Loan Application God Class',
    difficulty: 'easy',
    order: 30,
    description:
      'The Loan class handles eligibility checking, interest calculation, document uploads, approval workflow, and disbursement all in one class. Loan is attempting to orchestrate an entire business process rather than representing a domain entity. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'Loan', data: { label: 'Loan' }, position: { x: 80, y: 80 } },
        { id: 'Applicant', data: { label: 'Applicant' }, position: { x: 310, y: 80 } },
        { id: 'LoanEligibility', data: { label: 'LoanEligibility' }, position: { x: 540, y: 80 } },
        { id: 'DocumentService', data: { label: 'DocumentService' }, position: { x: 80, y: 250 } },
        { id: 'DisbursementService', data: { label: 'DisbursementService' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Loan', target: 'Applicant', label: 'for applicant', type: 'smoothstep' },
        { id: 'e2', source: 'Loan', target: 'LoanEligibility', label: 'checks [IN-CLASS]', type: 'smoothstep' },
        { id: 'e3', source: 'Loan', target: 'DocumentService', label: 'uploads [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'Loan', target: 'DisbursementService', label: 'disburses [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'loan-god-class',
        type: 'god_class',
        targetClass: 'Loan',
        description:
          'Loan takes on five distinct responsibilities — eligibility, interest calculation, document handling, approval, and disbursement — each requiring different external dependencies (credit bureau APIs, document storage, notification systems, bank APIs). Any change in approval rules, interest rate model, or document requirements forces Loan to change, creating a severe maintenance bottleneck.',
        interviewContext:
          'This lending domain question tests application-layer vs domain-layer separation. The interviewer expects the candidate to keep Loan as a domain entity (loanId, principal, term, status) and introduce an application-layer LoanApplicationService that orchestrates EligibilityService, InterestCalculator, DocumentService, ApprovalWorkflow, and DisbursementService.',
      },
    ],
    explanation:
      'Loan should be a domain entity: loanId, principal, interestRate, term, borrower, status (APPLIED, APPROVED, DISBURSED). Extract EligibilityService, InterestCalculatorService, DocumentStorageService, LoanApprovalService, and DisbursementService as separate classes. Wire them together in a LoanApplicationUseCase at the application layer. Each service is independently testable and can be changed without touching the core Loan entity.',
  },

  // ─── 25 ──────────────────────────────────────────────────────────────────
  {
    slug: 'product-review-in-product',
    title: 'Product Contains Review Logic',
    difficulty: 'easy',
    order: 31,
    description:
      'The Product class contains addReview(), moderateReview(), and calculateRating() methods in addition to its core product attributes. Review management is a distinct business concern with its own entity lifecycle. Identify the SRP violation.',
    diagramData: {
      nodes: [
        { id: 'Product', data: { label: 'Product' }, position: { x: 80, y: 80 } },
        { id: 'Review', data: { label: 'Review' }, position: { x: 310, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 540, y: 80 } },
        { id: 'Category', data: { label: 'Category' }, position: { x: 80, y: 250 } },
        { id: 'Inventory', data: { label: 'Inventory' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Product', target: 'Review', label: 'addReview() [MIXED]', type: 'smoothstep' },
        { id: 'e2', source: 'Product', target: 'Customer', label: 'purchased by', type: 'smoothstep' },
        { id: 'e3', source: 'Product', target: 'Category', label: 'belongs to', type: 'smoothstep' },
        { id: 'e4', source: 'Product', target: 'Inventory', label: 'tracked in', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'product-review-srp',
        type: 'srp_violation',
        targetClass: 'Product',
        description:
          'Product violates SRP by mixing product identity (name, price, category) with review management (adding, moderating, rating aggregation). Review moderation has entirely different business rules, dependencies (moderation APIs, ML classifiers), and access control requirements than product management. Mixing them makes both harder to evolve and test.',
        interviewContext:
          'Tests domain entity purity. Interviewers want to see the candidate split Product (pure entity) from a ReviewService that takes productId as input. They should also note that Review is an entity in its own right (reviewer, rating, content, moderationStatus) and deserves its own repository and lifecycle.',
      },
    ],
    explanation:
      'Product should hold only its core attributes: productId, name, description, price, category. Create a ReviewService with addReview(productId, Review), moderateReview(reviewId), and getAverageRating(productId). Review becomes a standalone domain entity with its own lifecycle. ProductRepository and ReviewRepository operate independently, and a read model can aggregate product data with review summaries for display.',
  },

  // ─── 26 ──────────────────────────────────────────────────────────────────
  {
    slug: 'delivery-tracker-srp',
    title: 'Delivery Tracker SRP Violation',
    difficulty: 'easy',
    order: 32,
    description:
      'DeliveryTracker polls GPS APIs for location, sends SMS notifications, persists tracking events to a database, and calls third-party logistics partner APIs — all in a single class. Each of these has independent dependencies and failure modes. Identify the SRP violation.',
    diagramData: {
      nodes: [
        { id: 'DeliveryTracker', data: { label: 'DeliveryTracker' }, position: { x: 80, y: 80 } },
        { id: 'Delivery', data: { label: 'Delivery' }, position: { x: 310, y: 80 } },
        { id: 'SMSNotifier', data: { label: 'SMSNotifier' }, position: { x: 540, y: 80 } },
        { id: 'Database', data: { label: 'Database' }, position: { x: 80, y: 250 } },
        { id: 'PartnerAPI', data: { label: 'PartnerAPI' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'DeliveryTracker', target: 'Delivery', label: 'tracks', type: 'smoothstep' },
        { id: 'e2', source: 'DeliveryTracker', target: 'SMSNotifier', label: 'notifies [MIXED]', type: 'smoothstep' },
        { id: 'e3', source: 'DeliveryTracker', target: 'Database', label: 'persists [MIXED]', type: 'smoothstep' },
        { id: 'e4', source: 'DeliveryTracker', target: 'PartnerAPI', label: 'polls [MIXED]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'delivery-tracker-srp',
        type: 'srp_violation',
        targetClass: 'DeliveryTracker',
        description:
          'DeliveryTracker has four distinct responsibilities, each with its own dependencies and failure modes: GPS polling (network/GPS API), SMS notification (messaging gateway), database persistence (DB), and logistics partner integration (external HTTP). A GPS provider change, SMS gateway swap, database migration, or partner API version change should each be fully isolated from the others.',
        interviewContext:
          'Interviewers use this to probe multi-axis SRP violations. A senior candidate separates GPSPollingService, DeliveryNotificationService, TrackingEventRepository, and PartnerAPIClient, making DeliveryTracker an orchestrator. They may also mention the Observer pattern to decouple SMS notification from tracking state updates.',
      },
    ],
    explanation:
      'DeliveryTracker should focus solely on the tracking state machine: transitioning a delivery through PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, and DELIVERED. Extract GPSPollingService for location updates, TrackingEventRepository for persistence, DeliveryNotificationService for customer SMS, and LogisticsPartnerClient for API calls. DeliveryTracker orchestrates these via events or direct calls, with each component independently testable and deployable.',
  },

  // ─── 27 ──────────────────────────────────────────────────────────────────
  {
    slug: 'quiz-inherits-question',
    title: 'Quiz Extends Question',
    difficulty: 'easy',
    order: 33,
    description:
      'Quiz extends Question to reuse text and metadata fields. A Quiz is not a Question — it is a container of questions. This is a structural reuse mistake using inheritance where composition is correct. Identify the wrong relationship.',
    diagramData: {
      nodes: [
        { id: 'Question', data: { label: 'Question' }, position: { x: 80, y: 80 } },
        { id: 'Quiz', data: { label: 'Quiz' }, position: { x: 310, y: 80 } },
        { id: 'Student', data: { label: 'Student' }, position: { x: 540, y: 80 } },
        { id: 'Answer', data: { label: 'Answer' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Quiz', target: 'Question', label: 'extends [WRONG]', type: 'smoothstep' },
        { id: 'e2', source: 'Quiz', target: 'Student', label: 'assigned to', type: 'smoothstep' },
        { id: 'e3', source: 'Question', target: 'Answer', label: 'has answers', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'quiz-wrong-extends-question',
        type: 'wrong_relationship',
        targetClass: 'Quiz',
        description:
          'Quiz extends Question, implying every Quiz is-a Question — which violates LSP. A Quiz cannot be substituted wherever a Question is expected. The motive is field reuse (title, description), but that should be achieved through a ContentItem interface or base class, not through a specialisation relationship that is semantically false.',
        interviewContext:
          'Tests "is-a vs has-a" in a content management context. A strong candidate breaks the inheritance, adds a List<Question> field to Quiz, and introduces a ContentItem interface if common fields need sharing. They should articulate that Quiz\'s reason to change (scoring rules, time limits) is completely different from Question\'s reason to change (content, options, answer key).',
      },
    ],
    explanation:
      'Quiz should have a List<Question> (composition), not extend Question. If Quiz and Question share common attributes like title, description, and createdAt, introduce a ContentItem base class or interface and have both implement it. Quiz adds scoringStrategy, timeLimit, and a questions collection. Question adds options, correctAnswer, and difficulty. Each class has a single, clear responsibility.',
  },

  // ─── 28 ──────────────────────────────────────────────────────────────────
  {
    slug: 'auction-god-class',
    title: 'Auction God Class',
    difficulty: 'easy',
    order: 34,
    description:
      'Auction manages bid collection, enforces the auction timer, collects payments from the winner, sends winner notifications, and manages item listings — all within a single class. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'Auction', data: { label: 'Auction' }, position: { x: 80, y: 80 } },
        { id: 'Bid', data: { label: 'Bid' }, position: { x: 310, y: 80 } },
        { id: 'Seller', data: { label: 'Seller' }, position: { x: 540, y: 80 } },
        { id: 'WinnerNotifier', data: { label: 'WinnerNotifier' }, position: { x: 80, y: 250 } },
        { id: 'PaymentCollector', data: { label: 'PaymentCollector' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Auction', target: 'Bid', label: 'manages', type: 'smoothstep' },
        { id: 'e2', source: 'Auction', target: 'Seller', label: 'listed by', type: 'smoothstep' },
        { id: 'e3', source: 'Auction', target: 'WinnerNotifier', label: 'notifies [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'Auction', target: 'PaymentCollector', label: 'collects [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'auction-god-class',
        type: 'god_class',
        targetClass: 'Auction',
        description:
          'Auction absorbs bid management, timer logic, payment collection, winner notification, and listing management. Each of these has independent dependencies and change triggers — timer logic may use a scheduler, payment uses a PSP, notifications use a messaging service, and listing management has its own rules. None of these should be coupled together inside the domain Auction class.',
        interviewContext:
          'Common design interview question for marketplace or bidding systems. Interviewers want to see Auction as a domain aggregate managing bid state and auction status, while BidService, AuctionTimerService, PaymentService, and WinnerNotificationService are separate collaborators. A senior candidate may mention an application-layer AuctionWorkflowService.',
      },
    ],
    explanation:
      'Auction should be a domain aggregate: auctionId, item, startTime, endTime, currentHighBid, status (OPEN, CLOSED, CANCELLED). Extract BidService for bid placement and validation, AuctionTimerService for scheduling closure, PaymentService for winner payment collection, and AuctionNotificationService for winner/loser notifications. An AuctionWorkflowService at the application layer orchestrates the flow when an auction closes.',
  },

  // ─── 29 ──────────────────────────────────────────────────────────────────
  {
    slug: 'chat-message-no-abstraction',
    title: 'Chat — No Message Abstraction',
    difficulty: 'easy',
    order: 35,
    description:
      'Chat has separate methods — sendText(), sendImage(), sendVideo(), sendFile() — each implemented independently with type-specific logic. There is no shared Message interface, so adding sendAudio() requires modifying Chat itself. Identify the missing abstraction.',
    diagramData: {
      nodes: [
        { id: 'Chat', data: { label: 'Chat' }, position: { x: 80, y: 80 } },
        { id: 'TextMessage', data: { label: 'TextMessage' }, position: { x: 310, y: 80 } },
        { id: 'ImageMessage', data: { label: 'ImageMessage' }, position: { x: 540, y: 80 } },
        { id: 'VideoMessage', data: { label: 'VideoMessage' }, position: { x: 770, y: 80 } },
        { id: 'User', data: { label: 'User' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Chat', target: 'TextMessage', label: 'sendText() direct', type: 'smoothstep' },
        { id: 'e2', source: 'Chat', target: 'ImageMessage', label: 'sendImage() direct', type: 'smoothstep' },
        { id: 'e3', source: 'Chat', target: 'VideoMessage', label: 'sendVideo() direct', type: 'smoothstep' },
        { id: 'e4', source: 'Chat', target: 'User', label: 'between users', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'chat-missing-message-interface',
        type: 'missing_abstraction',
        targetClass: 'Chat',
        description:
          'Chat couples directly to each message type through type-specific methods rather than a Message interface. As message types grow (reactions, polls, stickers, audio clips), Chat accumulates new methods and conditional logic. Without a Message abstraction, uniform processing — rendering, persistence, moderation, search indexing — cannot be expressed polymorphically.',
        interviewContext:
          'Tests OCP and abstraction instincts in a messaging domain. A strong candidate defines a Message interface with send(), render(), getMessageType(), and getContent(). Chat then has a single send(Message) method. TextMessage, ImageMessage, VideoMessage, and future AudioMessage can all be added without any changes to Chat.',
      },
    ],
    explanation:
      'Define a Message interface with getMessageType(), getContent(), getMetadata(), and render(). TextMessage, ImageMessage, VideoMessage, and FileMessage all implement Message. Chat holds a single send(Message) method and a conversation history as List<Message>. Adding AudioMessage is purely additive — no changes to Chat, no new Chat methods, and all uniform processing (persistence, display, moderation) applies polymorphically to all types.',
  },

  // ─── 30 ──────────────────────────────────────────────────────────────────
  {
    slug: 'subscription-plan-god',
    title: 'SubscriptionPlan God Class',
    difficulty: 'easy',
    order: 36,
    description:
      'SubscriptionPlan handles billing execution, feature flag toggling, dunning logic for failed payments, plan upgrade/downgrade operations, and trial period management all in a single class. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'SubscriptionPlan', data: { label: 'SubscriptionPlan' }, position: { x: 80, y: 80 } },
        { id: 'Customer', data: { label: 'Customer' }, position: { x: 310, y: 80 } },
        { id: 'BillingEngine', data: { label: 'BillingEngine' }, position: { x: 540, y: 80 } },
        { id: 'FeatureToggle', data: { label: 'FeatureToggle' }, position: { x: 80, y: 250 } },
        { id: 'DunningManager', data: { label: 'DunningManager' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'SubscriptionPlan', target: 'Customer', label: 'for customer', type: 'smoothstep' },
        { id: 'e2', source: 'SubscriptionPlan', target: 'BillingEngine', label: 'bills [IN-CLASS]', type: 'smoothstep' },
        { id: 'e3', source: 'SubscriptionPlan', target: 'FeatureToggle', label: 'toggles [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'SubscriptionPlan', target: 'DunningManager', label: 'dunning [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'subscription-plan-god-class',
        type: 'god_class',
        targetClass: 'SubscriptionPlan',
        description:
          'SubscriptionPlan has five unrelated responsibilities, each with its own external dependencies: billing (payment gateway), feature toggling (feature flag service), dunning (retry scheduler), plan changes (upgrade/downgrade logic), and trial management. This class receives changes from product, billing, infrastructure, and growth teams simultaneously, creating a perpetual merge conflict.',
        interviewContext:
          'SaaS subscription systems are a popular design interview topic. Interviewers want to see SubscriptionPlan as a domain entity (planId, tier, price, status, trialEndDate) and separate BillingService, FeatureToggleService, DunningService, and SubscriptionLifecycleService as independent services with clean interfaces.',
      },
    ],
    explanation:
      'SubscriptionPlan is a domain entity: planId, tier, price, billingCycle, status, trialEndDate. BillingService handles payment collection, DunningService handles retries on failed payments, FeatureToggleService resolves which features a plan tier grants, and SubscriptionLifecycleService manages upgrades, downgrades, and cancellations. Each service operates on the plan entity independently, enabling separate testing, deployment, and scaling.',
  },

  // ─── 31 ──────────────────────────────────────────────────────────────────
  {
    slug: 'report-wrong-extends-user',
    title: 'Report Extends User',
    difficulty: 'easy',
    order: 37,
    description:
      'Report extends User so it can directly access user attributes like name, email, and department when generating report headers. This is a structural shortcut using inheritance to access data. Identify the wrong relationship.',
    diagramData: {
      nodes: [
        { id: 'User', data: { label: 'User' }, position: { x: 80, y: 80 } },
        { id: 'Report', data: { label: 'Report' }, position: { x: 310, y: 80 } },
        { id: 'ReportData', data: { label: 'ReportData' }, position: { x: 540, y: 80 } },
        { id: 'Department', data: { label: 'Department' }, position: { x: 80, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Report', target: 'User', label: 'extends [WRONG]', type: 'smoothstep' },
        { id: 'e2', source: 'Report', target: 'ReportData', label: 'contains', type: 'smoothstep' },
        { id: 'e3', source: 'Report', target: 'Department', label: 'for department', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'report-wrong-extends-user',
        type: 'wrong_relationship',
        targetClass: 'Report',
        description:
          'Report extends User purely for field access convenience, violating the "is-a" principle. A Report is not a User — it is a document created by or about a user. Every Report instance becomes a full User instance in the type system, which is semantically wrong and grants Report access to all User state and behaviour that it has no business interacting with.',
        interviewContext:
          'Tests the "is-a vs has-a" distinction in a non-obvious context. A strong candidate replaces the inheritance with a creatorId field on Report. User information needed for display can be resolved through a UserRepository at report-generation time, or Report stores a snapshot of display data (creatorName, creatorEmail) as plain fields.',
      },
    ],
    explanation:
      'Report should have a creatorId (userId) field and resolve User details through a UserRepository when needed. If the report needs to embed user display info for a historical snapshot, store them as simple string fields (creatorName, creatorEmail) directly on Report. Inheritance is for "is-a" relationships — using it purely to access fields is a misuse that creates unintended coupling and a misleading type hierarchy.',
  },

  // ─── 32 ──────────────────────────────────────────────────────────────────
  {
    slug: 'warehouse-no-location',
    title: 'Warehouse — No Location Abstraction',
    difficulty: 'easy',
    order: 38,
    description:
      'Warehouse assigns inventory items to Shelf, Bin, or Pallet storage locations without a shared StorageLocation abstraction. Each location type requires separate assignment logic inside Warehouse, and adding a new type like Rack forces code changes. Identify what is missing.',
    diagramData: {
      nodes: [
        { id: 'Warehouse', data: { label: 'Warehouse' }, position: { x: 80, y: 80 } },
        { id: 'Shelf', data: { label: 'Shelf' }, position: { x: 310, y: 80 } },
        { id: 'Bin', data: { label: 'Bin' }, position: { x: 540, y: 80 } },
        { id: 'Pallet', data: { label: 'Pallet' }, position: { x: 770, y: 80 } },
        { id: 'InventoryItem', data: { label: 'InventoryItem' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Warehouse', target: 'Shelf', label: 'assigns to', type: 'smoothstep' },
        { id: 'e2', source: 'Warehouse', target: 'Bin', label: 'assigns to', type: 'smoothstep' },
        { id: 'e3', source: 'Warehouse', target: 'Pallet', label: 'assigns to', type: 'smoothstep' },
        { id: 'e4', source: 'Warehouse', target: 'InventoryItem', label: 'stores', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'warehouse-missing-location-interface',
        type: 'missing_abstraction',
        targetClass: 'Warehouse',
        description:
          'Warehouse directly references Shelf, Bin, and Pallet as distinct types with separate assignment logic. There is no shared StorageLocation interface, making uniform item placement, retrieval, and capacity-check logic impossible without type-specific conditionals. Adding a new location type like Rack or ConveyorBelt requires modifying Warehouse.',
        interviewContext:
          'Tests OCP awareness in a logistics domain. Interviewers expect the candidate to introduce a StorageLocation interface with assignItem(Item), removeItem(itemId), getCapacity(), and getOccupancy(). Warehouse then manages a List<StorageLocation> and operates polymorphically, requiring no changes when new location types are added.',
      },
    ],
    explanation:
      'Define a StorageLocation interface with assignItem(Item), removeItem(itemId), getCapacity(), getOccupancy(), and getLocationType(). Shelf, Bin, and Pallet implement this interface. Warehouse holds a List<StorageLocation> and delegates item placement and retrieval to the interface uniformly. Adding a Rack or ConveyorBelt location type requires only a new implementing class — Warehouse remains completely unchanged.',
  },

  // ─── 33 ──────────────────────────────────────────────────────────────────
  {
    slug: 'article-god-class',
    title: 'Article Publishing God Class',
    difficulty: 'easy',
    order: 39,
    description:
      'Article handles draft storage, publishing workflow management, SEO metadata generation, thumbnail image resizing, and social media posting all within a single class. Article is a content entity, not an application workflow orchestrator. Identify the god-class violation.',
    diagramData: {
      nodes: [
        { id: 'Article', data: { label: 'Article' }, position: { x: 80, y: 80 } },
        { id: 'Author', data: { label: 'Author' }, position: { x: 310, y: 80 } },
        { id: 'PublishWorkflow', data: { label: 'PublishWorkflow' }, position: { x: 540, y: 80 } },
        { id: 'SEOMetaService', data: { label: 'SEOMetaService' }, position: { x: 80, y: 250 } },
        { id: 'SocialMediaPoster', data: { label: 'SocialMediaPoster' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'Article', target: 'Author', label: 'written by', type: 'smoothstep' },
        { id: 'e2', source: 'Article', target: 'PublishWorkflow', label: 'publishes [IN-CLASS]', type: 'smoothstep' },
        { id: 'e3', source: 'Article', target: 'SEOMetaService', label: 'generates [IN-CLASS]', type: 'smoothstep' },
        { id: 'e4', source: 'Article', target: 'SocialMediaPoster', label: 'posts [IN-CLASS]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'article-god-class',
        type: 'god_class',
        targetClass: 'Article',
        description:
          'Article absorbs publishing workflow, SEO generation, thumbnail processing, and social media posting alongside its core content data. These infrastructure concerns have different dependencies (CMS workflow engine, SEO library, image processing service, social APIs) and entirely independent reasons to change. A social media API change should never require touching the Article domain class.',
        interviewContext:
          'Tests domain purity in a CMS context. Interviewers want to see Article as a domain entity (articleId, title, content, author, status, tags) and separate PublishingWorkflowService, SEOService, ImageProcessingService, and SocialMediaService as independent services triggered by Article lifecycle events.',
      },
    ],
    explanation:
      'Article should be a domain entity: articleId, title, content, author, status (DRAFT, REVIEW, PUBLISHED), tags. Introduce PublishingWorkflowService for approval and state transitions, SEOService for meta tag generation, ImageProcessingService for thumbnail operations, and SocialMediaService for distribution. These services ideally listen to an ArticlePublishedEvent via an event bus, fully decoupling infrastructure concerns from the domain object.',
  },

  // ─── 34 ──────────────────────────────────────────────────────────────────
  {
    slug: 'grade-book-srp',
    title: 'GradeBook SRP Violation',
    difficulty: 'easy',
    order: 40,
    description:
      'GradeBook handles score entry, grade calculation, transcript generation, parent notifications, and report card printing — all within a single class. The grading data model is absorbing notification, reporting, and document-generation responsibilities. Identify the SRP violation.',
    diagramData: {
      nodes: [
        { id: 'GradeBook', data: { label: 'GradeBook' }, position: { x: 80, y: 80 } },
        { id: 'Student', data: { label: 'Student' }, position: { x: 310, y: 80 } },
        { id: 'Score', data: { label: 'Score' }, position: { x: 540, y: 80 } },
        { id: 'TranscriptGenerator', data: { label: 'TranscriptGenerator' }, position: { x: 80, y: 250 } },
        { id: 'ParentNotifier', data: { label: 'ParentNotifier' }, position: { x: 310, y: 250 } },
      ],
      edges: [
        { id: 'e1', source: 'GradeBook', target: 'Student', label: 'tracks grades for', type: 'smoothstep' },
        { id: 'e2', source: 'GradeBook', target: 'Score', label: 'records', type: 'smoothstep' },
        { id: 'e3', source: 'GradeBook', target: 'TranscriptGenerator', label: 'generates [MIXED]', type: 'smoothstep' },
        { id: 'e4', source: 'GradeBook', target: 'ParentNotifier', label: 'notifies [MIXED]', type: 'smoothstep' },
      ],
    },
    expectedIssues: [
      {
        id: 'grade-book-srp',
        type: 'srp_violation',
        targetClass: 'GradeBook',
        description:
          'GradeBook violates SRP with five distinct responsibilities: data entry (score recording), computation (grade calculation), document generation (transcripts), notification (parent alerts), and printing (report cards). Changes in print format, notification channels, transcript layout, or grading algorithm all force changes to GradeBook, creating high coupling and fragility across the class.',
        interviewContext:
          'Interviewers use this in an education system design to see how candidates handle SRP across both domain and infrastructure concerns. The expected answer is to keep GradeBook as a data structure (student → subject → score mapping) and extract GradeCalculator, TranscriptService, ParentNotificationService, and ReportCardPrintService as independent collaborators.',
      },
    ],
    explanation:
      'GradeBook should be a domain entity: a mapping of studentId to subject grades and raw scores. GradeCalculator computes letter grades and GPA from those scores. TranscriptService generates formatted transcripts from GradeBook data. ParentNotificationService sends grade reports via email or SMS. ReportCardPrintService produces printable documents. Each component is independently testable, swappable, and evolves on its own schedule without touching GradeBook.',
  },
]
