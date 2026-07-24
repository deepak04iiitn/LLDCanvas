/**
 * Run with:
 *   npx ts-node -r dotenv/config src/scripts/seed-problems-missing.ts
 *
 * Adds 5 problems that appeared in a reference problem list but were absent from the DB:
 *   Easy   — Coffee Vending Machine, Task Management System
 *   Medium — Airline Management System, Restaurant Management System
 *   Hard   — Course Registration System
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Problem } from '../models/problem.model'

const MISSING_PROBLEMS = [
  // ─── EASY ───────────────────────────────────────────────────────────────────
  {
    slug: 'coffee-vending-machine',
    title: 'Coffee Vending Machine',
    difficulty: 'easy',
    category: 'Infrastructure',
    description:
      'Design a coffee vending machine that accepts coin denominations, lets customers select a beverage, deducts ingredients, dispenses the drink, and returns change. Admins can restock ingredients and collect cash.',
    companies: ['Google', 'Microsoft', 'Infosys', 'TCS'],
    tags: ['OOP', 'State Machine', 'Design Patterns'],
    order: 200,
    functionalRequirements: [
      'Accept multiple coin denominations (₹1, ₹2, ₹5, ₹10)',
      'Display available beverages with their prices',
      'Allow customers to select a beverage after inserting coins',
      'Check ingredient availability (coffee, milk, sugar, water) before dispensing',
      'Dispense the selected beverage and deduct ingredients atomically',
      'Return exact change if inserted amount exceeds the price',
      'Refund inserted coins on cancellation at any point before dispensing',
      'Admin mode: restock ingredients and collect accumulated cash',
    ],
    nonFunctionalRequirements: [
      'State transitions are atomic — no partial dispensing',
      'Dispense operation completes within 5 seconds',
      'Ingredient check and deduction are thread-safe',
    ],
    hints: [
      "Core entities: CoffeeMachine, Beverage, Ingredient, CoinSlot, Display, Dispenser. The machine cycles through states: IDLE → COIN_INSERTED → BEVERAGE_SELECTED → DISPENSING → CHANGE_RETURN → IDLE. An admin can switch to MAINTENANCE state to restock.",
      "Apply the State pattern: each state is a class (IdleState, CoinInsertedState, DispensingState, etc.) implementing a MachineState interface. The machine delegates input handling to the current state object, which guards against invalid transitions (e.g. selecting a beverage before inserting coins throws an error).",
      "Before dispensing, verify all required ingredients are available in one pass, then deduct them atomically. Model the admin operations (restock, collect money) as commands that only execute in IDLE or MAINTENANCE states to prevent concurrent conflicts.",
    ],
    realWorldApplications: [
      'Embedded systems in office pantries, airports, and hospitals',
      'Foundation for understanding State Machine design in hardware controllers',
      'Blueprint for POS (point-of-sale) systems with inventory management',
      'Demonstrates concurrent resource management in physical device software',
    ],
    learningObjectives: [
      'Design a finite state machine with valid transitions and guards',
      'Apply the State pattern to eliminate complex conditional logic',
      'Handle inventory deduction atomically to prevent partial dispense',
      'Separate admin operations from customer-facing flows using modes',
    ],
    whyAsked:
      'Coffee/Vending Machine is a classic OOP interview question that tests your ability to model real-world state transitions, enforce business rules (insufficient funds, out-of-stock), and apply design patterns like State and Command in a hardware-software boundary context.',
  },
  {
    slug: 'task-management',
    title: 'Task Management System',
    difficulty: 'easy',
    category: 'Productivity',
    description:
      'Design a task management system (like Trello or JIRA) where users create projects, add tasks with priorities and due dates, assign them to team members, track status, and receive notifications on updates.',
    companies: ['Atlassian', 'Microsoft', 'Google', 'Notion'],
    tags: ['OOP', 'Observer Pattern', 'Collaboration'],
    order: 201,
    functionalRequirements: [
      'Create and manage projects with members and roles',
      'Create tasks with title, description, due date, and priority (LOW, MEDIUM, HIGH, URGENT)',
      'Assign tasks to one or more users within the project',
      'Update task status: TODO → IN_PROGRESS → IN_REVIEW → DONE or BLOCKED',
      'Add comments to tasks with timestamps',
      'Attach labels/tags for categorisation',
      'Filter and search tasks by status, assignee, priority, and due date',
      'Notify assignees and watchers when a task is created, updated, or commented on',
    ],
    nonFunctionalRequirements: [
      'Support up to 10,000 tasks per project',
      'Notification delivery within 1 second of the triggering event',
      'Filter operations complete in O(n) where n = tasks in project',
    ],
    hints: [
      "Core entities: User, Project, Task, Comment, Label, Notification. Task holds status (enum), priority (enum), dueDate, a list of assignees, a list of labels, and a list of Comment objects. Project aggregates Tasks and has a member roster with roles (ADMIN, MEMBER, VIEWER).",
      "Use the Observer pattern for notifications: Task is the Subject; User (as Watcher) implements Observer. When a Task's status changes or a comment is added, it calls notifyObservers() which dispatches a Notification to each watcher's inbox. Distinguish between in-app and email notification channels using Strategy.",
      "For filtering, implement composable filter objects: each implements TaskFilter with a matches(Task) → boolean method. Chain multiple filters using an AND composite. A TaskQuery builder collects filters and applies them in sequence, keeping filtering logic out of the Task or Project classes.",
    ],
    realWorldApplications: [
      'Powers project management tools like Jira, Trello, Asana, and Linear',
      'Underlies agile sprint boards and kanban workflow systems',
      'Foundation for issue trackers in open-source projects (GitHub Issues)',
      'Core of enterprise work management platforms used by millions of teams',
    ],
    learningObjectives: [
      'Model status as an enum and enforce valid transitions',
      'Apply the Observer pattern to decouple notification logic from business logic',
      'Design composable, chainable filter predicates for query flexibility',
      'Handle role-based access control within a collaborative domain model',
    ],
    whyAsked:
      'Task Management tests breadth of OOP: you must model a domain with multiple interacting entities, enforce business rules like valid status transitions, handle many-to-many relationships (tasks ↔ assignees), and apply patterns like Observer for real-time updates — all in a system interviewers can relate to.',
  },

  // ─── MEDIUM ─────────────────────────────────────────────────────────────────
  {
    slug: 'airline-management',
    title: 'Airline Management System',
    difficulty: 'medium',
    category: 'Travel',
    description:
      'Design an airline management system that handles aircraft fleet management, flight scheduling, passenger seat reservation with conflict-free booking, crew assignment, check-in, and boarding pass generation.',
    companies: ['Amadeus', 'Sabre', 'MakeMyTrip', 'Google', 'Amazon'],
    tags: ['OOP', 'Booking System', 'State Machine', 'Concurrency'],
    order: 202,
    functionalRequirements: [
      'Manage a fleet of aircraft with different seat configurations (Economy, Business, First Class)',
      'Schedule flights with route, departure/arrival times, and aircraft assignment',
      'Search available flights by origin, destination, and date',
      'Book seats for passengers with seat selection; prevent double-booking',
      'Handle booking cancellation and seat release with refund policy',
      'Check-in passengers within the check-in window and generate boarding passes',
      'Assign crew members (pilots, cabin crew) to flights respecting duty-hour limits',
      'Track flight status: SCHEDULED → CHECK_IN_OPEN → BOARDING → DEPARTED → LANDED → COMPLETED (or CANCELLED/DELAYED)',
    ],
    nonFunctionalRequirements: [
      'Seat booking is atomic — concurrent requests for the last seat must not double-book',
      'Flight search returns results in under 2 seconds for up to 500 flights/day',
      'Crew assignment respects regulatory duty-hour limits without manual checks',
    ],
    hints: [
      "Core entities: Airline, Aircraft, SeatMap, Seat, Route, Flight, Passenger, Booking, BoardingPass, CrewMember, FlightCrew. Aircraft owns a SeatMap (rows × columns with class zones). Flight references Aircraft + Route + scheduled times. Booking links Passenger to a specific Seat on a Flight.",
      "Prevent double-booking with an optimistic hold-then-confirm flow: when a passenger selects a seat, mark it HELD (with an expiry timestamp, e.g. 10 minutes). On payment confirmation, transition it to BOOKED. A background job or check at booking time releases expired holds. This avoids heavy DB locks while preventing race conditions.",
      "Model flight status as a State Machine with valid transitions guarded by rules: CHECK_IN_OPEN can only be entered within 24h of departure; BOARDING requires check-in to be closed; DEPARTED requires all doors closed. Crew assignment validates that each assigned CrewMember's last-duty-end + mandatory-rest ≤ new flight departure.",
    ],
    realWorldApplications: [
      'Powers global distribution systems (GDS) like Amadeus and Sabre used by all major airlines',
      'Foundation for airline CRS (Computer Reservation Systems) handling millions of bookings daily',
      'Seat map and booking logic is reused in train and bus reservation platforms',
      'Crew scheduling algorithms are used in transport, hospitality, and healthcare workforce management',
    ],
    learningObjectives: [
      'Model a multi-entity booking domain with relationship constraints',
      'Implement optimistic locking for concurrent seat reservation',
      'Design a State Machine with real-world business rules guarding transitions',
      'Handle crew assignment with constraint validation (duty hours, certifications)',
    ],
    whyAsked:
      'Airline Management combines several challenging patterns in one problem: concurrent booking with race-condition prevention, multi-step state machines, complex entity relationships (flight → aircraft → seat map → booking → passenger), and constraint-based crew scheduling — making it a reliable signal of mid-to-senior OOP design skills.',
  },
  {
    slug: 'restaurant-management',
    title: 'Restaurant Management System',
    difficulty: 'medium',
    category: 'Food & Beverage',
    description:
      'Design a comprehensive restaurant management system that covers menu and inventory management, table assignments, order processing with kitchen workflow, billing with tax and discount support, and table reservations.',
    companies: ['Zomato', 'Swiggy', 'Square', 'Toast', 'Olo'],
    tags: ['OOP', 'State Machine', 'Observer Pattern', 'Decorator Pattern'],
    order: 203,
    functionalRequirements: [
      'Manage menu with categories, items, prices, and real-time availability toggles',
      'Assign tables to walk-in or reserved customers based on capacity',
      'Take orders for dine-in, takeaway, and delivery channels',
      'Route order tickets to kitchen display system (KDS) upon placement',
      'Track order status: PLACED → PREPARING → READY → SERVED',
      'Generate itemised bills with tax, service charge, and promotional discounts',
      'Manage ingredient inventory and flag low-stock items automatically',
      'Accept table reservations with date, time-slot, and party-size validation',
    ],
    nonFunctionalRequirements: [
      'Order placement to kitchen notification in under 1 second',
      'Support 50+ concurrent occupied tables without performance degradation',
      'Bill generation (with all decorators applied) completes within 500ms',
    ],
    hints: [
      "Core entities: Restaurant, Menu, MenuItem, Category, Table, Reservation, Order, OrderItem, KitchenTicket, Bill, Staff (Waiter, Chef, Cashier). Order aggregates OrderItems and is linked to a Table (or Delivery address). KitchenTicket is created when an Order is placed and assigned to a Chef.",
      "Use the Observer pattern for the kitchen workflow: Order is the Subject. On placement, it creates a KitchenTicket and notifies registered observers (KitchenDisplay, Chef). When Chef marks the ticket READY, the system notifies the Waiter for the table. Status enum: PLACED → PREPARING → READY → SERVED.",
      "Apply the Decorator pattern for billing: BaseBill wraps the OrderItem totals; TaxDecorator adds GST/VAT; ServiceChargeDecorator adds gratuity; DiscountDecorator applies promo-code reductions. Each decorator extends the bill total without modifying core order data. For inventory, subtract ingredient quantities when an OrderItem is confirmed and trigger a LOW_STOCK alert if stock falls below threshold.",
    ],
    realWorldApplications: [
      'Core engine behind restaurant POS systems like Toast, Square for Restaurants, and Olo',
      'Zomato and Swiggy restaurant-side dashboards use similar order lifecycle management',
      'Kitchen Display Systems (KDS) in fast-food chains (McDonald\'s, Domino\'s) follow this order-routing model',
      'Hotel F&B management in property management systems (PMS) like Oracle OPERA',
    ],
    learningObjectives: [
      'Orchestrate a multi-actor workflow (customer → waiter → kitchen → billing)',
      'Apply the Observer pattern to propagate order status changes across departments',
      'Use the Decorator pattern to compose billing rules without modifying core models',
      'Handle concurrent table and inventory operations safely',
    ],
    whyAsked:
      'Restaurant Management is a favourite because it naturally exercises multiple design patterns together (Observer for kitchen events, Decorator for billing, State Machine for order lifecycle) while requiring careful entity modelling across a multi-role domain — staff, kitchen, inventory, and customer-facing flows all in one system.',
  },

  // ─── HARD ───────────────────────────────────────────────────────────────────
  {
    slug: 'course-registration',
    title: 'Course Registration System',
    difficulty: 'hard',
    category: 'Education',
    description:
      'Design a university course registration system where students enrol in course sections, prerequisite chains are validated via a dependency graph, schedule conflicts are detected, waitlists auto-enrol students on drop, and faculty manage their sections — all under high-concurrency during registration windows.',
    companies: ['Coursera', 'Udemy', 'Chegg', 'Google', 'Microsoft'],
    tags: ['OOP', 'Graph Algorithms', 'Concurrency', 'Scheduling'],
    order: 204,
    functionalRequirements: [
      'Define courses with prerequisites (supports chains: A → B → C), credit hours, and department',
      'Faculty create section instances of a course with capacity, meeting times, and room assignment',
      'Students search available sections filtered by department, time, and remaining seats',
      'Validate all prerequisite courses are completed before permitting enrolment',
      'Detect and reject schedule conflicts across a student\'s enrolled sections',
      'Waitlist management: auto-enrol the first waitlisted student when a seat opens due to a drop',
      'Generate a personalized weekly class schedule for each student',
      'Enforce add/drop deadlines and withdrawal policies with grade consequences',
    ],
    nonFunctionalRequirements: [
      'Enrolment is atomic — concurrent requests for the last seat must not over-enrol',
      'Schedule conflict detection runs in O(s) where s = sections already enrolled',
      'System supports 10,000+ simultaneous students during peak registration windows',
    ],
    hints: [
      "Core entities: University, Department, Course, Section, Student, Faculty, Enrollment, Waitlist, Schedule, TimeSlot, Room. A Section is a scheduled instance of a Course (e.g., CS101-A meets MWF 10-11am in Room 204). Enrollment links a Student to a Section with a status (ENROLLED, WAITLISTED, DROPPED, WITHDRAWN).",
      "For prerequisite validation, model prerequisites as a directed acyclic graph (DAG) where an edge A → B means 'A must be completed before B'. Before enrolment, walk the prerequisite DAG for the target Course using BFS/DFS and verify every ancestor course appears in the student's CompletedCourses set. Detect cycles in the prerequisite graph at data entry time using DFS + colour marking.",
      "Schedule conflict detection: represent each Section's meetings as a list of TimeSlot(dayOfWeek, startMin, endMin). For a new enrolment, iterate the student's current section list and check each existing TimeSlot against the new section's TimeSlots for overlap: conflict if sameDay && newStart < existingEnd && existingStart < newEnd. For the last-seat race condition, use optimistic locking: read current enrollment count, attempt to increment only if count < capacity (compare-and-swap), else add to Waitlist. When a student drops, decrement count and auto-dequeue the Waitlist head atomically.",
    ],
    realWorldApplications: [
      'Direct model for university ERP systems like Banner, PeopleSoft, and Workday Student',
      'Prerequisite graph validation is used in e-learning platforms (Coursera learning paths, LinkedIn Learning)',
      'Waitlist and capacity management logic is reused in event booking, healthcare appointment, and class scheduling systems',
      'Conflict detection generalises to employee shift scheduling, sports fixture planning, and conference room booking',
    ],
    learningObjectives: [
      'Model and traverse a prerequisite dependency graph using BFS/DFS',
      'Implement interval-overlap detection for schedule conflict prevention',
      'Handle last-seat race conditions with optimistic locking or compare-and-swap',
      'Design a Waitlist with automatic promotion on vacancy using a FIFO queue',
    ],
    whyAsked:
      'Course Registration combines graph algorithms (prerequisite DAG), interval scheduling (conflict detection), concurrency control (last-seat race), and queue-based automation (waitlist promotion) — making it a strong signal for senior engineers who can bridge algorithmic thinking with clean OOP class design under real-world constraints.',
  },
]

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  let added = 0
  let skipped = 0

  for (const p of MISSING_PROBLEMS) {
    const existing = await Problem.findOne({ slug: p.slug })
    if (existing) {
      console.log(`  SKIP  ${p.slug} (already exists)`)
      skipped++
      continue
    }
    await Problem.create(p)
    console.log(`  ADD   ${p.slug} [${p.difficulty}]`)
    added++
  }

  console.log(`\nDone — added ${added}, skipped ${skipped}`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
