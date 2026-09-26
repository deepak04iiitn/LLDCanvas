import 'dotenv/config'
import { connectDB } from '../config/db'

const challenges = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Library System — SRP + God Class (Easy)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'library-god-class',
    title: 'Bloated Library Manager',
    description: 'A Library system where one class does everything. Find the SRP violations.',
    difficulty: 'easy',
    order: 1,
    status: 'published',
    diagramData: {
      nodes: [
        { id: 'LibraryManager', data: { label: 'LibraryManager' }, position: { x: 320, y: 80 } },
        { id: 'Book',           data: { label: 'Book' },           position: { x: 80,  y: 280 } },
        { id: 'Member',         data: { label: 'Member' },         position: { x: 320, y: 280 } },
        { id: 'FineCalculator', data: { label: 'FineCalculator' }, position: { x: 560, y: 280 } },
      ],
      edges: [
        { id: 'e1', source: 'LibraryManager', target: 'Book',           label: 'manages' },
        { id: 'e2', source: 'LibraryManager', target: 'Member',         label: 'manages' },
        { id: 'e3', source: 'LibraryManager', target: 'FineCalculator', label: 'uses' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'LibraryManager',
        description: 'LibraryManager handles book cataloguing, member management, borrowing logic, and fine calculation — all in one class.',
        interviewContext: 'A God Class is the #1 red flag interviewers look for. Always split by responsibility: one class = one reason to change.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'LibraryManager',
        description: 'Fine calculation should live in FineCalculator and be truly isolated — LibraryManager should not embed its logic.',
        interviewContext: 'When you spot a class that "uses" a calculator but also owns the core rules, it is violating SRP.',
      },
    ],
    explanation: 'LibraryManager is a God Class — it owns too many responsibilities. The correct design separates BookCatalogue, MemberRegistry, BorrowingService, and FineCalculator into independent classes, each with a single reason to change.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. E-Commerce Order — Wrong Relationship (Easy)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'order-wrong-relationship',
    title: 'Order & Customer Relationship',
    description: 'An e-commerce Order class has an inheritance relationship with Customer. Is that correct?',
    difficulty: 'easy',
    order: 2,
    status: 'published',
    diagramData: {
      nodes: [
        { id: 'Customer',   data: { label: 'Customer' },   position: { x: 220, y: 60 } },
        { id: 'Order',      data: { label: 'Order' },      position: { x: 220, y: 240 } },
        { id: 'OrderItem',  data: { label: 'OrderItem' },  position: { x: 440, y: 240 } },
        { id: 'Product',    data: { label: 'Product' },    position: { x: 440, y: 60 } },
      ],
      edges: [
        { id: 'e1', source: 'Order',     target: 'Customer',  label: 'extends ❌',  type: 'default' },
        { id: 'e2', source: 'Order',     target: 'OrderItem', label: 'contains',   type: 'default' },
        { id: 'e3', source: 'OrderItem', target: 'Product',   label: 'references', type: 'default' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'wrong_relationship',
        targetClass: 'Order',
        description: 'Order extends Customer — this is wrong. An Order is NOT a Customer. Order should have a customerId or a reference to Customer (association/composition), not inheritance.',
        interviewContext: 'The "is-a vs has-a" test: Order IS NOT a Customer. Order HAS a Customer. Use composition, not inheritance. This mistake is extremely common in interviews.',
      },
    ],
    explanation: 'Order should contain a reference to Customer (association), not extend it. "is-a" inheritance means every Order would be a Customer, which is semantically wrong. Fix: add a `customer: Customer` field to Order.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Parking Lot — Missing Abstraction (Medium)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'parking-missing-abstraction',
    title: 'Parking Lot — No Vehicle Abstraction',
    description: 'A Parking Lot system with Car, Bike, and Truck classes. Find the missing abstraction.',
    difficulty: 'medium',
    order: 3,
    status: 'published',
    diagramData: {
      nodes: [
        { id: 'ParkingLot',    data: { label: 'ParkingLot' },    position: { x: 280, y: 40 } },
        { id: 'ParkingSpot',   data: { label: 'ParkingSpot' },   position: { x: 280, y: 200 } },
        { id: 'Car',           data: { label: 'Car' },           position: { x: 60,  y: 360 } },
        { id: 'Bike',          data: { label: 'Bike' },          position: { x: 220, y: 360 } },
        { id: 'Truck',         data: { label: 'Truck' },         position: { x: 380, y: 360 } },
        { id: 'ParkingTicket', data: { label: 'ParkingTicket' }, position: { x: 540, y: 200 } },
      ],
      edges: [
        { id: 'e1', source: 'ParkingLot',  target: 'ParkingSpot',   label: 'has many' },
        { id: 'e2', source: 'ParkingSpot', target: 'Car',           label: 'parkedVehicle: Car' },
        { id: 'e3', source: 'ParkingSpot', target: 'Bike',          label: 'parkedVehicle: Bike' },
        { id: 'e4', source: 'ParkingSpot', target: 'Truck',         label: 'parkedVehicle: Truck' },
        { id: 'e5', source: 'ParkingLot',  target: 'ParkingTicket', label: 'issues' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'missing_abstraction',
        targetClass: 'ParkingSpot',
        description: 'ParkingSpot has three separate fields for Car, Bike, and Truck. The missing abstraction is a Vehicle interface/abstract class. ParkingSpot should hold a Vehicle reference, not concrete types.',
        interviewContext: 'Interviewers check whether you instinctively reach for abstraction when you see parallel concrete references. "parkedVehicle: Car, parkedVehicle: Bike" screams for an interface.',
      },
      {
        id: 'issue-2',
        type: 'coupling_issue',
        targetClass: 'ParkingSpot',
        description: 'ParkingSpot is tightly coupled to every vehicle type. Adding a new vehicle (e.g. ElectricScooter) requires changing ParkingSpot.',
        interviewContext: 'Open/Closed Principle: classes should be open for extension (add Vehicle subtypes) but closed for modification (no changes to ParkingSpot).',
      },
    ],
    explanation: 'Introduce a Vehicle abstract class or interface. Car, Bike, and Truck all implement Vehicle. ParkingSpot holds a `parkedVehicle: Vehicle` reference. This makes the design extensible — adding new vehicle types requires zero changes to ParkingSpot or ParkingLot.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Notification System — SRP + Coupling (Medium)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'notification-tight-coupling',
    title: 'Notification Service Coupling',
    description: 'A Notification service that directly calls Email, SMS, and Push channels. Spot the design violations.',
    difficulty: 'medium',
    order: 4,
    status: 'published',
    diagramData: {
      nodes: [
        { id: 'OrderService',        data: { label: 'OrderService' },        position: { x: 280, y: 40 } },
        { id: 'NotificationService', data: { label: 'NotificationService' }, position: { x: 280, y: 200 } },
        { id: 'EmailSender',         data: { label: 'EmailSender' },         position: { x: 60,  y: 380 } },
        { id: 'SMSSender',           data: { label: 'SMSSender' },           position: { x: 220, y: 380 } },
        { id: 'PushNotifier',        data: { label: 'PushNotifier' },        position: { x: 380, y: 380 } },
        { id: 'User',                data: { label: 'User' },                position: { x: 540, y: 200 } },
      ],
      edges: [
        { id: 'e1', source: 'OrderService',        target: 'NotificationService', label: 'calls' },
        { id: 'e2', source: 'NotificationService', target: 'EmailSender',         label: 'new EmailSender()' },
        { id: 'e3', source: 'NotificationService', target: 'SMSSender',           label: 'new SMSSender()' },
        { id: 'e4', source: 'NotificationService', target: 'PushNotifier',        label: 'new PushNotifier()' },
        { id: 'e5', source: 'NotificationService', target: 'User',                label: 'reads preference' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'coupling_issue',
        targetClass: 'NotificationService',
        description: 'NotificationService directly instantiates EmailSender, SMSSender, and PushNotifier using `new`. This is hard coupling — adding WhatsApp requires modifying NotificationService.',
        interviewContext: 'Interviewers love: "I would introduce a NotificationChannel interface and inject implementations." Dependency injection over direct instantiation is a key senior-level signal.',
      },
      {
        id: 'issue-2',
        type: 'srp_violation',
        targetClass: 'NotificationService',
        description: 'NotificationService both decides which channel to use AND sends notifications. The routing logic should be separate from the sending logic.',
        interviewContext: 'SRP means one reason to change. Channel routing logic changes separately from channel implementation — they should not live in the same class.',
      },
    ],
    explanation: 'Introduce a NotificationChannel interface with a send() method. Each sender (EmailSender, SMSSender, PushNotifier) implements it. NotificationService receives a list of channels via constructor injection. A separate NotificationRouter reads user preferences and selects channels.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. ATM System — God Class + Missing Abstraction (Hard)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'atm-god-class',
    title: 'ATM Machine — God Class',
    description: 'An ATM class that handles everything from card reading to cash dispensing. Identify all violations.',
    difficulty: 'hard',
    order: 5,
    status: 'published',
    diagramData: {
      nodes: [
        { id: 'ATM',         data: { label: 'ATM' },         position: { x: 300, y: 40 } },
        { id: 'BankServer',  data: { label: 'BankServer' },  position: { x: 100, y: 240 } },
        { id: 'CashBin',     data: { label: 'CashBin' },     position: { x: 300, y: 240 } },
        { id: 'CardReader',  data: { label: 'CardReader' },  position: { x: 500, y: 240 } },
        { id: 'Receipt',     data: { label: 'Receipt' },     position: { x: 100, y: 420 } },
        { id: 'Transaction', data: { label: 'Transaction' }, position: { x: 500, y: 420 } },
      ],
      edges: [
        { id: 'e1', source: 'ATM',        target: 'BankServer',  label: 'authenticate + transfer' },
        { id: 'e2', source: 'ATM',        target: 'CashBin',     label: 'dispense' },
        { id: 'e3', source: 'ATM',        target: 'CardReader',  label: 'readCard' },
        { id: 'e4', source: 'ATM',        target: 'Receipt',     label: 'printReceipt' },
        { id: 'e5', source: 'ATM',        target: 'Transaction', label: 'logTransaction' },
        { id: 'e6', source: 'CashBin',    target: 'Transaction', label: 'recordDispense' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'god_class',
        targetClass: 'ATM',
        description: 'ATM directly orchestrates card reading, authentication, cash dispensing, receipt printing, and transaction logging. It should be a thin orchestrator, not an implementor.',
        interviewContext: 'In an interview, say: "ATM is an orchestrator. Its job is to coordinate, not to implement. Each hardware/software responsibility should live in its own class."',
      },
      {
        id: 'issue-2',
        type: 'missing_abstraction',
        targetClass: 'ATM',
        description: 'There is no ATMState abstraction. An ATM has states: Idle, CardInserted, PinEntered, SelectingTransaction, DispensingCash. Without a State pattern, ATM logic becomes a giant if-else chain.',
        interviewContext: 'Senior interviewers specifically ask: "How would you model ATM states?" The State pattern is the expected answer — one class per state with a common interface.',
      },
      {
        id: 'issue-3',
        type: 'coupling_issue',
        targetClass: 'ATM',
        description: 'ATM directly calls BankServer for both authentication and fund transfer. These are separate concerns and should be behind interfaces (AuthService, TransferService).',
        interviewContext: 'Coupling to a concrete BankServer prevents testing ATM logic in isolation. Always code to interfaces when integrating with external systems.',
      },
    ],
    explanation: 'The correct ATM design uses: (1) a State pattern for ATM states, (2) separate services behind interfaces (CardAuthService, CashDispenseService, TransactionLogger, ReceiptPrinter), and (3) ATM as a thin state machine that delegates to these services.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Chess Game — Cohesion + Wrong Relationship (Hard)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'chess-cohesion',
    title: 'Chess Game — Cohesion & Inheritance Misuse',
    description: 'A Chess game design with pieces and movement logic mixed into the board. Find cohesion and inheritance violations.',
    difficulty: 'hard',
    order: 6,
    status: 'published',
    diagramData: {
      nodes: [
        { id: 'Board',   data: { label: 'Board' },   position: { x: 280, y: 40 } },
        { id: 'Piece',   data: { label: 'Piece' },   position: { x: 80,  y: 220 } },
        { id: 'Player',  data: { label: 'Player' },  position: { x: 480, y: 220 } },
        { id: 'King',    data: { label: 'King' },    position: { x: 60,  y: 400 } },
        { id: 'Queen',   data: { label: 'Queen' },   position: { x: 180, y: 400 } },
        { id: 'Pawn',    data: { label: 'Pawn' },    position: { x: 300, y: 400 } },
        { id: 'GameLog', data: { label: 'GameLog' }, position: { x: 460, y: 400 } },
      ],
      edges: [
        { id: 'e1', source: 'Board',  target: 'Piece',   label: 'has 64 squares with' },
        { id: 'e2', source: 'Board',  target: 'Player',  label: 'manages turns' },
        { id: 'e3', source: 'Board',  target: 'GameLog', label: 'writes log' },
        { id: 'e4', source: 'King',   target: 'Piece',   label: 'extends' },
        { id: 'e5', source: 'Queen',  target: 'Piece',   label: 'extends' },
        { id: 'e6', source: 'Pawn',   target: 'Piece',   label: 'extends' },
        { id: 'e7', source: 'Player', target: 'GameLog', label: 'extends ❌' },
      ],
    },
    expectedIssues: [
      {
        id: 'issue-1',
        type: 'cohesion_issue',
        targetClass: 'Board',
        description: 'Board manages square layout, player turn rotation, AND writes game logs. These are three separate responsibilities — Board has low cohesion.',
        interviewContext: 'Low cohesion means the class has unrelated reasons to change. A rule change to logging should not force a change to Board. Extract a Game class for turn management and keep GameLog separate.',
      },
      {
        id: 'issue-2',
        type: 'wrong_relationship',
        targetClass: 'Player',
        description: 'Player extends GameLog — a Player is not a GameLog. Player should have a reference to GameLog (association) or GameLog should be injected into the Game, not Player.',
        interviewContext: '"Is-a" test: A Player IS NOT a GameLog. This is one of the most common inheritance misuses. Always ask: does the subclass pass the is-a test?',
      },
    ],
    explanation: 'The correct design: Board handles only board state (square layout and piece positions). A separate Game class manages turns and game state. GameLog is a standalone service injected where needed. Player has no inheritance relationship with any other class — it holds player info and references to their pieces.',
  },
]

async function run() {
  await connectDB()

  // Use the raw collection to avoid any stale compiled-model schema mismatch
  const mongoose = (await import('mongoose')).default
  const col = mongoose.connection.collection('designbugs')

  let created = 0
  let skipped = 0

  for (const c of challenges) {
    const exists = await col.findOne({ slug: c.slug })
    if (exists) {
      console.log(`  skip  ${c.slug}`)
      skipped++
      continue
    }
    await col.insertOne({ ...c, createdAt: new Date(), updatedAt: new Date() })
    console.log(`  ✓     ${c.slug}`)
    created++
  }

  console.log(`\nDone — ${created} created, ${skipped} already existed.`)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
