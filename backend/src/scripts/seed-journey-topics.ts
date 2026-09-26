import 'dotenv/config'
import { connectDB } from '../config/db'
import { JourneyTopic } from '../models/journey/journey-topic.model'

const topics = [

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 1 — SPEAK OOP
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'classes-objects',
    title: 'Classes & Objects',
    subtitle: 'The building blocks of every LLD interview',
    stage: 1, order: 1, type: 'concept',
    description: 'Learn to think in terms of classes and objects — the foundation every LLD interview is built on.',
    estimatedMinutes: 12, icon: '🧱',
    content: {
      learn: `A class is like a blueprint. It describes what something looks like (its data) and what it can do (its behavior). An object is the actual thing you create from that blueprint.

Think of it this way:
→ Class = Recipe for a cake
→ Object = The actual cake you baked

Two cakes from the same recipe are separate objects. They share the same structure but are independent of each other.

In a Library system:
• Book is a class — it describes title, author, isbn
• "The Alchemist" is an object — a specific book with specific data
• "Clean Code" is another object — a different book, same class

This is the mental model every interviewer expects you to have from minute one.`,
      whyItMatters: `In every LLD interview, your first job is to identify the classes in the system.

The interviewer is watching:
• Do you think in objects, or do you just write functions?
• Can you identify the right entities from the requirements?
• Does each class own clear data and behavior?

A candidate who immediately moves to classes signals they understand object-oriented design.`,
      interviewTip: `Before writing anything, circle every noun in the requirements. Nouns are usually your classes.

"A user books a movie ticket at a theater" →
• User (class)
• Ticket (class)
• Movie (class)
• Theater (class)
• Booking (class — the act of booking)

Start with nouns. Then figure out what each one knows and does.`,
      realExperience: `A candidate at Amazon was asked to design a Library Management System. They started writing functions: getBook(), returnBook(), searchCatalog().

The interviewer stopped them after 5 minutes: "What are the main objects in this system?"

The interview started over. This is a common and entirely avoidable mistake.`,
      spotItPrompt: "What's wrong with this approach to designing a Library system?",
      spotItDesign: `// Library Management System — no classes, just functions

function addBook(title, author, isbn) { /* ... */ }
function removeBook(isbn) { /* ... */ }
function searchByAuthor(author) { /* ... */ }
function borrowBook(userId, isbn) { /* ... */ }
function returnBook(userId, isbn) { /* ... */ }
function getUserHistory(userId) { /* ... */ }
function checkAvailability(isbn) { /* ... */ }`,
      spotItAnswer: `This is procedural code, not object-oriented design.

Problems:
1. No ownership — nothing owns the book data or member data
2. All behavior is scattered in loose functions
3. There's no concept of what a Book IS or what a Member IS
4. Adding features means adding more disconnected functions

In an interview, starting like this tells the interviewer you're not thinking in OOP.`,
      fixItPrompt: 'Identify the classes. What would you create instead?',
      fixItAnswer: `class Book {
  title: string
  author: string
  isbn: string
  isAvailable: boolean
}

class Member {
  memberId: string
  name: string
  borrow(book: Book): void { ... }
  return(book: Book): void { ... }
}

class Library {
  books: Book[]
  members: Member[]
  addBook(book: Book): void { ... }
  searchByAuthor(author: string): Book[] { ... }
}

Now every entity owns its data and behavior. The system is readable and extensible.`,
      interviewQuestion: 'Why did you create a separate Booking class instead of just adding a borrow() method to Library?',
      interviewAnswer: `A Booking represents a relationship between a Member and a Book at a specific point in time. It has its own data: borrowDate, dueDate, returnDate, and potentially a fine.

If I embedded all of this in Library, the Library class would become responsible for members, books, AND the full history of every transaction.

A separate Booking class keeps each class focused. Library manages the catalog. Booking manages the lending lifecycle.`,
      followUp: 'What if we need to support both physical books and e-books? How does your class structure change?',
      followUpAnswer: `I would introduce a base interface or abstract class called BookItem with shared properties: title, author, isbn.

Then:
• PhysicalBook implements BookItem — adds shelfLocation, condition
• EBook implements BookItem — adds fileFormat, downloadUrl, maxConcurrentReaders

Member.borrow() accepts a BookItem, so it works for both without any changes. The Library manages a collection of BookItem, not just Books.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'easy', extensibility: 'easy', requirementAmbiguity: 'easy' },
    buildsSkills: ['oop', 'entityIdentification', 'responsibilities'],
    prerequisites: [],
    interviewerProbes: ['What classes did you identify first?', 'Who owns this data?', 'Why did you group these methods together?', 'What is the difference between a class and a struct?'],
    commonMistakes: ['Starting with functions instead of classes', 'Putting all behavior in one God class', 'Confusing classes with database tables', 'Missing key entities like Booking or Transaction'],
    patternMapSteps: [
      { label: 'Requirements', description: '"A user books a movie ticket at a theater"' },
      { label: 'Find Nouns → Classes', description: 'User, Ticket, Movie, Theater, Booking' },
      { label: 'Find Verbs → Methods', description: 'book(), cancel(), search(), refund()' },
      { label: 'Create Objects', description: 'Instances with actual data: user=Alice, movie="Inception"' },
    ],
    tags: ['oop', 'fundamentals', 'classes'], status: 'published',
  },

  {
    slug: 'encapsulation',
    title: 'Encapsulation',
    subtitle: 'Hide the internals, expose only what matters',
    stage: 1, order: 2, type: 'concept',
    description: 'Learn how to hide complexity inside classes and expose only clean, controlled interfaces.',
    estimatedMinutes: 10, icon: '🔒',
    content: {
      learn: `Encapsulation means keeping a class's internal details private, and only letting the outside world interact through a clean, controlled interface.

Think of an ATM machine:
→ You press buttons on the screen (the interface)
→ You have no idea what code runs behind it (the hidden internals)
→ The ATM decides what you can and can't do with your account

If the ATM exposed all its internals, someone could just set their balance to $1,000,000 directly. Encapsulation prevents that.

In code:
• Private fields hold the actual data
• Public methods control how that data can be read or changed
• The class enforces its own rules

A BankAccount with a private balance field that only changes through deposit() and withdraw() methods — that's encapsulation.`,
      whyItMatters: `Interviewers test encapsulation by asking: "What if a value gets set incorrectly?" or "How do you ensure this field is always valid?"

If your fields are public, anyone can corrupt your data. If they're private with controlled access, your class owns its invariants.

This is also about maintainability. When internals change (e.g., you start storing balance in cents instead of dollars), the public interface stays the same.`,
      interviewTip: `When you see a class with public fields, ask yourself: "Can this data be set to an invalid state?" If yes, make it private.

If balance is public, someone could write: user.balance = -500. That should never be allowed.

Private fields + controlled methods = the class enforces its own rules.`,
      realExperience: `In a Microsoft interview, a candidate designed a Ticket class with a public price field. The interviewer asked: "What if I do ticket.price = -100?"

The candidate had no answer. The interviewer then asked: "So how do you ensure price is always positive?"

That single question led to a full discussion about encapsulation and validation logic.`,
      spotItPrompt: 'What is wrong with this BankAccount class?',
      spotItDesign: `class BankAccount {
  balance: number = 0        // public!
  transactionHistory: any[]  // public!
  pin: string                // public!
  
  constructor(initialBalance: number) {
    this.balance = initialBalance
  }
}

// Somewhere in the code:
account.balance = -500       // completely valid, no check!
account.pin = "0000"         // anyone can change the pin!`,
      spotItAnswer: `Three serious problems:
1. balance is public — anyone can set it to any value, including negative
2. transactionHistory is public — anyone can modify the history directly
3. pin is public — security nightmare

A BankAccount should own its own rules. "Balance can never go negative" is the account's responsibility, not the caller's.`,
      fixItPrompt: 'Rewrite with proper encapsulation. What should be private, and what methods should you expose?',
      fixItAnswer: `class BankAccount {
  private balance: number
  private transactionHistory: Transaction[]
  private pin: string

  constructor(initialBalance: number, pin: string) {
    if (initialBalance < 0) throw new Error('Initial balance cannot be negative')
    this.balance = initialBalance
    this.pin = pin
    this.transactionHistory = []
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Deposit must be positive')
    this.balance += amount
    this.transactionHistory.push({ type: 'deposit', amount })
  }

  withdraw(amount: number, pin: string): void {
    if (pin !== this.pin) throw new Error('Invalid PIN')
    if (amount > this.balance) throw new Error('Insufficient funds')
    this.balance -= amount
    this.transactionHistory.push({ type: 'withdrawal', amount })
  }

  getBalance(pin: string): number {
    if (pin !== this.pin) throw new Error('Invalid PIN')
    return this.balance
  }
}`,
      interviewQuestion: 'Why did you make balance private instead of just using a getter?',
      interviewAnswer: `Making balance private ensures the BankAccount class is the only one that can change it. A getter lets you read it; but making it private also means no one can write to it directly.

The class becomes the single source of truth for its own state. Business rules — like "balance can't go negative" — live inside the class, not scattered across callers.`,
      followUp: 'What if multiple threads try to withdraw from the same account simultaneously?',
      followUpAnswer: `That's a concurrency issue. Private fields help, but they don't solve thread safety by themselves.

To handle concurrent withdrawals safely, I'd need to synchronize access — either with a mutex/lock around the withdraw() method, or use an atomic transaction pattern where each withdrawal is a DB transaction with a version check.

The key insight: encapsulation gives you a single controlled point of entry. Once you have that, adding concurrency control is straightforward because there's only one place to add it.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'easy', extensibility: 'easy', requirementAmbiguity: 'easy' },
    buildsSkills: ['oop', 'responsibilities', 'cohesion'],
    prerequisites: ['classes-objects'],
    interviewerProbes: ['Why did you make this field private?', 'What happens if balance goes negative?', 'How do you validate inputs?', 'What is the difference between encapsulation and abstraction?'],
    commonMistakes: ['Making all fields public for convenience', 'Not validating inputs in setters', 'Exposing internal collections directly', 'Confusing encapsulation with just adding getters/setters mechanically'],
    patternMapSteps: [
      { label: 'Data that can be invalid', description: 'balance, pin, transactionHistory' },
      { label: 'Make private', description: 'Hide fields from direct access' },
      { label: 'Expose controlled methods', description: 'deposit(), withdraw(), getBalance()' },
      { label: 'Enforce invariants', description: 'Class guarantees balance >= 0 always' },
    ],
    tags: ['oop', 'encapsulation', 'access-control'], status: 'published',
  },

  {
    slug: 'inheritance',
    title: 'Inheritance',
    subtitle: 'The is-a relationship — and when to avoid it',
    stage: 1, order: 3, type: 'concept',
    description: 'Understand inheritance, when it helps, and the common traps that lead to fragile designs.',
    estimatedMinutes: 14, icon: '🌳',
    content: {
      learn: `Inheritance lets one class (the child) get everything from another class (the parent), plus add its own stuff.

Think of animals:
→ Animal has: eat(), sleep(), breathe()
→ Dog extends Animal — it inherits eat/sleep/breathe and adds bark(), fetch()
→ GoldenRetriever extends Dog — inherits everything and adds its own personality

This is the "is-a" relationship:
• A Dog IS AN Animal
• A GoldenRetriever IS A Dog
• Therefore, a GoldenRetriever IS AN Animal

In LLD, you'd use inheritance when multiple classes truly share the same base behavior. For example, ParkingSpot could be a base class for SmallSpot, MediumSpot, LargeSpot.

But inheritance can become a trap. Deep hierarchies like Vehicle → Car → ElectricCar → TeslaElectricCar → TeslaModel3 become impossible to maintain.`,
      whyItMatters: `Inheritance is one of the most controversial topics in LLD interviews. Using it correctly signals design maturity.

Interviewers often ask: "Why inheritance here instead of composition?" or "What happens if the requirements change?"

Knowing when NOT to use inheritance is just as important as knowing how to use it.`,
      interviewTip: `Use inheritance only when there is a true "is-a" relationship AND the parent class behavior is shared without significant modification.

When in doubt, prefer composition (we'll cover this next). Composition is more flexible.

Quick test: if you find yourself overriding most parent methods, you probably don't have a real is-a relationship.`,
      realExperience: `In a Flipkart interview, a candidate modeled an e-commerce system with: User → PremiumUser → PremiumUserWithLoyaltyPoints → PremiumUserWithLoyaltyPointsAndReferral.

The interviewer asked: "What if a user can have loyalty points but not premium status?"

The inheritance chain collapsed. The candidate had to completely redesign the model. Composition would have been much cleaner.`,
      spotItPrompt: 'What is the problem with this inheritance hierarchy for a vehicle management system?',
      spotItDesign: `class Vehicle {
  brand: string
  speed(): number { ... }
  refuel(): void { ... }    // ← problem starts here
}

class Car extends Vehicle {
  doors: number
}

class ElectricCar extends Car {
  batteryLevel: number
  refuel(): void {
    // ElectricCars don't refuel! They recharge.
    // Forced to override with wrong behavior
    throw new Error("Electric cars don't use fuel!")
  }
}

class HybridCar extends Car {
  // Needs BOTH refuel() and recharge()
  // The base class only supports one
}`,
      spotItAnswer: `The base Vehicle class assumed all vehicles use fuel. ElectricCar is forced to inherit a refuel() method it doesn't need (and has to "break" by throwing an error).

This violates the Liskov Substitution Principle: an ElectricCar doesn't behave like a Vehicle when used as one.

Deep inheritance hierarchies with override exceptions are a design smell.`,
      fixItPrompt: 'How would you fix this? Hint: think about what behaviors can be separated.',
      fixItAnswer: `interface IRefuelable {
  refuel(): void
}

interface IRechargeable {
  recharge(): void
}

abstract class Vehicle {
  brand: string
  abstract speed(): number
}

class GasCar extends Vehicle implements IRefuelable {
  refuel(): void { ... }
  speed(): number { ... }
}

class ElectricCar extends Vehicle implements IRechargeable {
  recharge(): void { ... }
  speed(): number { ... }
}

class HybridCar extends Vehicle implements IRefuelable, IRechargeable {
  refuel(): void { ... }
  recharge(): void { ... }
  speed(): number { ... }
}`,
      interviewQuestion: 'Is a Square a Rectangle? Should Square extend Rectangle?',
      interviewAnswer: `Mathematically, a square IS a rectangle. But in OOP, Square should NOT extend Rectangle.

A Rectangle can have its width and height set independently. A Square must always have equal sides.

If you set rect.width = 5 on a Square, it should also change the height. But a Rectangle doesn't do that. So Square breaks the Rectangle contract.

This is why the Liskov Substitution Principle exists: a subclass must behave exactly as its parent promises.`,
      followUp: 'When would you recommend using inheritance versus composition in an interview?',
      followUpAnswer: `Use inheritance when:
• There is a genuine is-a relationship
• The parent class has real shared behavior, not just shared data
• The hierarchy is shallow (1-2 levels max)
• You control both classes

Use composition when:
• You need behavior from multiple sources
• The relationship might change (a PremiumUser might stop being premium)
• You want to reuse behavior without coupling to a hierarchy

In most LLD interviews, composition is the safer choice.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['oop', 'relationships', 'extensibility'],
    prerequisites: ['classes-objects', 'encapsulation'],
    interviewerProbes: ['Is this truly an is-a relationship?', 'What happens if requirements change?', 'Why not use composition here?', 'What is the Liskov Substitution Principle?'],
    commonMistakes: ['Using inheritance for code reuse when there is no is-a relationship', 'Deep inheritance hierarchies', 'Overriding parent methods with exceptions', 'Inheriting behavior that does not apply to the child'],
    patternMapSteps: [
      { label: 'Is-A test', description: 'Does child truly IS-A parent in all contexts?' },
      { label: 'Behavior match', description: 'Does child need all parent behavior unchanged?' },
      { label: 'Hierarchy depth', description: 'Keep to 1-2 levels maximum' },
      { label: 'Change test', description: 'What happens when requirements change?' },
    ],
    tags: ['oop', 'inheritance', 'lsp'], status: 'published',
  },

  {
    slug: 'polymorphism',
    title: 'Polymorphism',
    subtitle: 'One interface, many implementations',
    stage: 1, order: 4, type: 'concept',
    description: 'Understand how polymorphism lets you write flexible, extensible code that avoids giant if/else chains.',
    estimatedMinutes: 12, icon: '🎭',
    content: {
      learn: `Polymorphism means "one name, many forms." The same method name produces different behavior depending on which object you call it on.

Imagine a Shape class with a draw() method:
→ Circle.draw() draws a circle
→ Square.draw() draws a square
→ Triangle.draw() draws a triangle

All three have draw(), but each draws differently. You can call shape.draw() without caring which specific shape it is.

This is incredibly powerful in LLD. Instead of writing:

if (shape == "circle") drawCircle()
else if (shape == "square") drawSquare()
else if (shape == "triangle") drawTriangle()

You just write: shape.draw()

And when you add a Pentagon, you just add a new class. Zero changes to existing code.`,
      whyItMatters: `Polymorphism is the mechanism that makes the Open/Closed Principle possible. It is how you write code that can be extended without being modified.

Interviewers often test this by saying: "What if we need to add 5 more payment methods?" A design that uses polymorphism handles that gracefully. A design with an if/else chain does not.`,
      interviewTip: `When you see a long if/else or switch statement that checks a type, that is usually a sign you should use polymorphism.

Replace:
if (payment.type == "stripe") processStripe(payment)
else if (payment.type == "paypal") processPaypal(payment)

With: payment.process() — where each payment type implements process() differently.`,
      realExperience: `A candidate at Google was asked to design a notification system. They wrote a NotificationService with a 60-line switch statement checking the notification type.

The interviewer asked: "How do you add WhatsApp notifications?" The candidate said: "Add another case to the switch."

The interviewer then asked: "What if different teams own each notification type?" The candidate realized the switch statement was the wrong approach.`,
      spotItPrompt: 'What is the problem with this design?',
      spotItDesign: `class ReportGenerator {
  generateReport(type: string, data: any): string {
    if (type === "pdf") {
      return this.generatePDF(data)
    } else if (type === "excel") {
      return this.generateExcel(data)
    } else if (type === "csv") {
      return this.generateCSV(data)
    } else if (type === "html") {
      return this.generateHTML(data)
    }
    throw new Error("Unknown report type")
  }
  // ... 4 separate private methods
}`,
      spotItAnswer: `Every time you add a new report type, you must modify ReportGenerator. This violates the Open/Closed Principle.

Also, ReportGenerator is responsible for knowing about all report formats. That's too much responsibility.

The string type check is a classic sign that polymorphism is missing.`,
      fixItPrompt: 'Refactor this to use polymorphism. What interface would you create?',
      fixItAnswer: `interface ReportGenerator {
  generate(data: any): string
}

class PDFReportGenerator implements ReportGenerator {
  generate(data: any): string { /* pdf logic */ }
}

class ExcelReportGenerator implements ReportGenerator {
  generate(data: any): string { /* excel logic */ }
}

class CSVReportGenerator implements ReportGenerator {
  generate(data: any): string { /* csv logic */ }
}

// Caller:
class ReportService {
  constructor(private generator: ReportGenerator) {}
  
  createReport(data: any): string {
    return this.generator.generate(data)
  }
}

// Adding HTML: just create HTMLReportGenerator — no changes elsewhere.`,
      interviewQuestion: 'What is the difference between compile-time and runtime polymorphism?',
      interviewAnswer: `Compile-time polymorphism is method overloading — same method name, different parameters. The compiler decides which method to call at compile time.

Runtime polymorphism is method overriding — a subclass provides its own implementation of a parent method. The JVM or runtime decides which version to call at runtime based on the actual object type.

In LLD interviews, when people say "polymorphism," they almost always mean runtime polymorphism — using interfaces and overriding to make the same call produce different results.`,
      followUp: 'What if each report type needs different configuration parameters?',
      followUpAnswer: `Each concrete generator class can have its own constructor parameters. The interface just defines the contract — generate(data) returns string.

For complex configuration, I could use the Builder pattern to construct each generator with its settings. The ReportService still only sees the ReportGenerator interface and doesn't need to know about configuration details.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['oop', 'extensibility', 'patterns'],
    prerequisites: ['classes-objects', 'inheritance'],
    interviewerProbes: ['Why did you use an interface here?', 'What happens when you add a new type?', 'Why not use a switch statement?', 'Can you explain how the JVM determines which method to call at runtime?'],
    commonMistakes: ['Using type-checking if/else instead of polymorphism', 'Creating unnecessary abstract base classes', 'Confusing interface (contract) with implementation'],
    patternMapSteps: [
      { label: 'Type switch smell', description: 'if/else checking "type" field → needs polymorphism' },
      { label: 'Define interface', description: 'ReportGenerator with generate() method' },
      { label: 'Implement per type', description: 'PDFGenerator, ExcelGenerator each implement it' },
      { label: 'Call uniformly', description: 'generator.generate(data) — no type checks' },
    ],
    tags: ['oop', 'polymorphism', 'interfaces'], status: 'published',
  },

  {
    slug: 'composition-vs-inheritance',
    title: 'Composition vs Inheritance',
    subtitle: 'Why has-a is usually better than is-a',
    stage: 1, order: 5, type: 'concept',
    description: 'Master one of the most important principles in OOP design: when to compose and when to inherit.',
    estimatedMinutes: 15, icon: '🔧',
    content: {
      learn: `"Prefer composition over inheritance" is one of the most quoted principles in software design. Here is why.

Inheritance (is-a): "A Car IS A Vehicle, so Car extends Vehicle"
Composition (has-a): "A Car HAS AN Engine, HAS A Transmission, HAS Wheels"

The problem with inheritance:
→ Tightly couples the child to the parent
→ Changes to the parent can break all children
→ A class can only inherit from one parent (in most languages)
→ Behavior is fixed at compile time

With composition:
→ A class holds references to other objects
→ Behavior can be mixed and matched
→ You can change behavior at runtime
→ No tight coupling

Classic example: instead of Employee extends Person extends Entity (deep, fragile hierarchy), write Employee with a PersonalInfo object and a JobDetails object.`,
      whyItMatters: `This is one of the most frequently tested concepts in senior LLD interviews. Every time you reach for inheritance, ask: "Could composition work here?"

If a candidate uses composition thoughtfully, it shows design maturity. If they use deep inheritance chains, it's a red flag.

The test is: "Can this relationship change?" If a User can stop being Premium, composition (user.plan = new PremiumPlan()) beats inheritance (PremiumUser extends User).`,
      interviewTip: `Here's a quick mental check when deciding between inheritance and composition:

1. Is the relationship truly permanent? (A Dog is always an Animal — use inheritance)
2. Can the behavior change at runtime? (A user's subscription can change — use composition)
3. Do you need behavior from multiple sources? (Use composition + interfaces)
4. Could requirements change this relationship? (Probably yes — use composition)

When in doubt: compose.`,
      realExperience: `In a Zomato interview, a candidate designed: User → RegisteredUser → PremiumUser → PremiumUserWithCashback → PremiumUserWithCashbackAndFreeDel.

The interviewer asked: "What if a user has cashback but not the free delivery feature?"

The hierarchy couldn't represent that. The candidate spent 10 minutes redesigning.

With composition: User has a Plan object. Plan can be Free, Premium, PremiumWithCashback, etc. Mix and match.`,
      spotItPrompt: 'What is wrong with this notification system design?',
      spotItDesign: `class Notification {
  send(): void { /* base */ }
}

class EmailNotification extends Notification {
  send(): void { /* email logic */ }
}

class SMSNotification extends Notification {
  send(): void { /* sms logic */ }
}

class EmailAndSMSNotification extends EmailNotification {
  // extends Email but also needs SMS behavior
  // inherits only email, has to duplicate SMS logic
  send(): void {
    super.send()        // email
    new SMSNotification().send()  // hacky!
  }
}

class EmailSMSAndPushNotification extends EmailAndSMSNotification {
  // Getting ridiculous...
}`,
      spotItAnswer: `The inheritance chain is exploding. Every combination requires a new class.

EmailAndSMSNotification is a hack — it extends Email but secretly creates an SMS object inside.

When requirements add WhatsApp or Slack, you'd need even more combination classes. This is called the "subclass explosion" problem.`,
      fixItPrompt: 'Redesign using composition. How would you support any combination of channels?',
      fixItAnswer: `interface NotificationChannel {
  send(message: string): void
}

class EmailChannel implements NotificationChannel {
  send(message: string): void { /* email */ }
}

class SMSChannel implements NotificationChannel {
  send(message: string): void { /* sms */ }
}

class PushChannel implements NotificationChannel {
  send(message: string): void { /* push */ }
}

class NotificationService {
  constructor(private channels: NotificationChannel[]) {}

  notify(message: string): void {
    for (const channel of this.channels) {
      channel.send(message)
    }
  }
}

// Usage: mix any channels you want
const service = new NotificationService([
  new EmailChannel(),
  new SMSChannel(),
  new PushChannel(),
])`,
      interviewQuestion: 'Your notification system uses composition. What if we need to add WhatsApp?',
      interviewAnswer: `Just add a WhatsAppChannel class that implements NotificationChannel. That is the entire change.

No existing classes change. NotificationService works with any channel that implements the interface. Adding a new channel is purely additive.

This is exactly what the Open/Closed Principle says: open for extension, closed for modification.`,
      followUp: 'What if some channels should retry on failure and others should not?',
      followUpAnswer: `I could decorate the channels that need retrying with a RetryChannel wrapper:

class RetryChannel implements NotificationChannel {
  constructor(private inner: NotificationChannel, private retries: number) {}
  
  send(message: string): void {
    for (let i = 0; i < this.retries; i++) {
      try { return this.inner.send(message) } catch { /* retry */ }
    }
  }
}

// Usage:
new NotificationService([
  new RetryChannel(new SMSChannel(), 3),
  new EmailChannel(),  // no retry needed
])

This is the Decorator pattern — composition at work again.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'medium', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['oop', 'extensibility', 'coupling', 'patterns'],
    prerequisites: ['classes-objects', 'inheritance'],
    interviewerProbes: ['Why composition over inheritance here?', 'Can you add a new channel without changing existing code?', 'What is subclass explosion?', 'When would you use inheritance instead?'],
    commonMistakes: ['Building deep hierarchies for code reuse', 'Duplicating behavior across sibling classes', 'Forgetting that inheritance is a compile-time constraint'],
    patternMapSteps: [
      { label: 'Behavior combination needed', description: 'Email + SMS + Push notification' },
      { label: 'Inheritance fails', description: 'Would create N×M class combinations' },
      { label: 'Define interface', description: 'NotificationChannel with send()' },
      { label: 'Compose freely', description: 'Service holds a list of channels — mix any way' },
    ],
    tags: ['oop', 'composition', 'inheritance', 'design-principles'], status: 'published',
  },

  {
    slug: 'oop-relationships',
    title: 'Class Relationships',
    subtitle: 'Association, aggregation, and composition',
    stage: 1, order: 6, type: 'concept',
    description: 'Understand the three types of class relationships and when to use each in your LLD designs.',
    estimatedMinutes: 11, icon: '🔗',
    content: {
      learn: `Classes don't exist in isolation. They relate to each other. There are three main types of relationships:

**Association** — classes know about each other
→ A Teacher teaches Students. Neither owns the other.
→ Both can exist independently.

**Aggregation** — one class contains another, but the contained object can exist independently
→ A Department has Employees. If the Department is dissolved, the Employees still exist.
→ "Has-a" with independent lifecycle.

**Composition** — one class contains another, and the contained object cannot exist without the container
→ An Order has OrderItems. If the Order is deleted, the OrderItems are deleted too.
→ "Has-a" with dependent lifecycle.

Understanding these distinctions shows design maturity in interviews.`,
      whyItMatters: `When you draw class diagrams in interviews, interviewers notice the relationship types. Using the right one shows that you understand data ownership and lifecycle.

"If I delete a University, do its Departments still exist?" — that is an aggregation vs composition question.

Getting this right also affects your database schema, your cascade delete rules, and your serialization logic.`,
      interviewTip: `The key question is: "If the parent is deleted, does the child still make sense?"

Yes → Aggregation (Department-Employee)
No → Composition (Order-OrderItem, House-Room)

If neither object "owns" the other → Association (Customer-Product)`,
      realExperience: `In a system design interview at Atlassian, a candidate was asked: "If a team is deleted, what happens to the tickets?" 

This is a composition question. Tickets belong to a team — they can't exist without a team context. The candidate needed to decide: cascade delete tickets, or reassign them first?

Understanding the composition relationship helped them give a concrete, well-reasoned answer.`,
      spotItPrompt: 'Which relationship types are used here, and are they correct?',
      spotItDesign: `class Library {
  books: Book[]           // Library "owns" books
  librarians: Librarian[] // Librarians work here
}

// A book is bought by the library, catalogued here,
// and is destroyed when the library closes.

// A librarian works at the library but
// is an independent person who can work elsewhere.`,
      spotItAnswer: `Library → Books: This is COMPOSITION. Books are purchased for this library and managed by it. If the library closes, those specific catalog entries cease to exist as library assets.

Library → Librarians: This is AGGREGATION. Librarians are independent people who work at the library. If the library closes, the librarians still exist and can work elsewhere.

Both relationships are "has-a" but with different lifecycle dependencies.`,
      fixItPrompt: 'How would you model these relationships in code to reflect the lifecycle difference?',
      fixItAnswer: `// Composition: Library creates and owns BookCatalogEntry
class Library {
  // Library directly creates catalog entries — owns their lifecycle
  private catalog: BookCatalogEntry[] = []
  
  addBook(title: string, isbn: string): void {
    this.catalog.push(new BookCatalogEntry(title, isbn))
  }
  
  // When library is destroyed, catalog entries go with it
}

// Aggregation: Library holds references to Librarians, doesn't create them
class Library {
  private staff: Librarian[] = []
  
  hireLibrarian(librarian: Librarian): void {
    this.staff.push(librarian)  // accepts existing Librarian object
  }
  
  terminateLibrarian(librarian: Librarian): void {
    this.staff = this.staff.filter(l => l !== librarian)
    // librarian object still exists, just no longer in this library
  }
}`,
      interviewQuestion: 'Is the relationship between an Invoice and its InvoiceLineItems aggregation or composition?',
      interviewAnswer: `Composition. An InvoiceLineItem describes a specific product purchase on a specific invoice. It has no meaning outside that invoice.

If you delete an Invoice, the line items should be deleted too — they are not independent entities.

This affects implementation: LineItems should be created by the Invoice and their lifecycle should be managed by it.`,
      followUp: 'How would a change from composition to aggregation affect your design?',
      followUpAnswer: `It would change ownership. If InvoiceLineItems became shared across invoices (like a "saved cart item" that appears on multiple invoices), that becomes aggregation.

This would change:
1. LineItems need their own identity (separate ID)
2. Deleting an invoice no longer deletes line items
3. Need a join table or reference list instead of embedded objects
4. Cascade delete rules in the database change

The relationship type directly drives the data model.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'easy', patterns: 'easy', extensibility: 'easy', requirementAmbiguity: 'medium' },
    buildsSkills: ['oop', 'relationships', 'entityIdentification'],
    prerequisites: ['classes-objects', 'composition-vs-inheritance'],
    interviewerProbes: ['What happens to this object if the parent is deleted?', 'Who owns the lifecycle of this object?', 'Is this aggregation or composition and why?'],
    commonMistakes: ['Using composition when aggregation is appropriate', 'Not thinking about lifecycle when choosing relationships', 'Ignoring relationships entirely and just listing fields'],
    patternMapSteps: [
      { label: 'Identify relationship', description: 'How do these two classes know each other?' },
      { label: 'Lifecycle test', description: 'Does child exist independently of parent?' },
      { label: 'Choose relationship type', description: 'Association / Aggregation / Composition' },
      { label: 'Design ownership', description: 'Who creates, owns, and destroys the objects?' },
    ],
    tags: ['oop', 'relationships', 'uml'], status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 2 — THINK IN RESPONSIBILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'srp',
    title: 'Single Responsibility Principle',
    subtitle: 'One class, one job',
    stage: 2, order: 1, type: 'concept',
    description: 'Learn the most fundamental SOLID principle and how it makes your designs readable, testable, and extensible.',
    estimatedMinutes: 13, icon: '🎯',
    content: {
      learn: `The Single Responsibility Principle says: a class should have only one reason to change.

In simple terms: each class should do one job.

Imagine a restaurant employee who is also the chef, the cashier, the cleaner, and the delivery driver. When there's a problem with the food, delivery, or payment — you have to change the same person's behavior.

In code, a class that does everything is a "God class." When requirements change — even small ones — you have to touch this one massive class.

The SRP says: split responsibilities. One class for cooking, one for cashier, one for delivery.

A class violates SRP when you need to use "and" to describe what it does:
• "UserService handles user auth AND sends emails AND logs activity"
→ That's three responsibilities. Split it.`,
      whyItMatters: `SRP is the foundation of maintainable design. When a class has one responsibility, it has one reason to change.

This means:
→ Easy to understand (small, focused classes)
→ Easy to test (mock one thing, not five)
→ Easy to extend (change one class without touching others)

Interviewers look for SRP violations in every design you show them.`,
      interviewTip: `If you find yourself using the word "and" when describing a class, it probably violates SRP.

"UserService manages user profiles AND handles authentication AND sends welcome emails"

That's three services: UserService, AuthService, EmailService.

Every class should fit in a one-sentence description with no "and."`,
      realExperience: `In an interview at Paytm, a candidate presented a PaymentService that: validated payment details, processed the charge, sent a confirmation email, logged the transaction, and updated user points.

The interviewer asked: "What if we change our email provider? What classes change?"

The answer was: PaymentService. Because email logic was inside it.

"What if we add a new loyalty program?" Also PaymentService.

Every unrelated requirement change touched the same class.`,
      spotItPrompt: 'How many responsibilities does this class have?',
      spotItDesign: `class UserService {
  // Responsibility 1: User management
  createUser(name: string, email: string): User { ... }
  updateProfile(userId: string, data: any): void { ... }
  
  // Responsibility 2: Authentication
  login(email: string, password: string): string { ... }
  logout(userId: string): void { ... }
  hashPassword(password: string): string { ... }
  
  // Responsibility 3: Email
  sendWelcomeEmail(user: User): void { ... }
  sendPasswordResetEmail(email: string): void { ... }
  
  // Responsibility 4: Analytics
  trackUserEvent(userId: string, event: string): void { ... }
  generateUserReport(userId: string): Report { ... }
}`,
      spotItAnswer: `This class has 4 distinct responsibilities:
1. User profile management (create, update)
2. Authentication (login, logout, password hashing)
3. Email communication (welcome, reset)
4. Analytics (tracking, reporting)

Each one changes for different reasons:
- Profile: when user data model changes
- Auth: when password policy changes
- Email: when email provider changes
- Analytics: when tracking requirements change`,
      fixItPrompt: 'Split this into properly scoped services.',
      fixItAnswer: `class UserService {
  createUser(name: string, email: string): User { ... }
  updateProfile(userId: string, data: any): void { ... }
  getUserById(userId: string): User { ... }
}

class AuthService {
  login(email: string, password: string): string { ... }
  logout(userId: string): void { ... }
  private hashPassword(password: string): string { ... }
}

class UserEmailService {
  sendWelcomeEmail(user: User): void { ... }
  sendPasswordResetEmail(email: string): void { ... }
}

class UserAnalyticsService {
  trackEvent(userId: string, event: string): void { ... }
  generateReport(userId: string): Report { ... }
}`,
      interviewQuestion: 'Splitting into many small classes feels like over-engineering. How do you decide how much to split?',
      interviewAnswer: `The rule is: split along "reasons to change." If two pieces of behavior change for different reasons, they belong in different classes.

Over-splitting (too granular) is also a problem. UserFirstName and UserLastName should not be separate classes.

The right signal: if a requirement change affects one responsibility, only one class should change. If changing the email provider also changes UserService, that's a sign the split isn't right.

In interviews, I split based on clear bounded responsibilities, not just for the sake of small files.`,
      followUp: 'How does SRP affect testability?',
      followUpAnswer: `SRP makes testing dramatically easier. When a class has one responsibility, you can test it in isolation with minimal mocking.

Testing AuthService only needs a password hasher and a user repository mock — not an email service, analytics service, or profile service.

When you have a God class with 10 responsibilities, testing one behavior requires setting up mocks for all 10. Tests become complex and fragile.

Small, focused classes = fast, reliable, readable tests.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'medium', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['solid', 'responsibilities', 'cohesion'],
    prerequisites: ['classes-objects'],
    interviewerProbes: ['What is one reason this class would change?', 'Is there more than one reason to change?', 'What "and" statements describe this class?', 'How does this affect testability?'],
    commonMistakes: ['Creating God classes that do everything', 'Mixing business logic and infrastructure (database, email) in the same class', 'Not recognizing that "but related" does not mean "same responsibility"'],
    patternMapSteps: [
      { label: 'Describe the class', description: 'Can you describe it without using "and"?' },
      { label: 'Find reasons to change', description: 'What external changes would affect this class?' },
      { label: 'Identify split points', description: 'Each distinct "reason" is a different class' },
      { label: 'Validate', description: 'One reason to change → one class' },
    ],
    tags: ['solid', 'srp', 'design-principles'], status: 'published',
  },

  {
    slug: 'cohesion-coupling',
    title: 'Cohesion & Coupling',
    subtitle: 'Tightly together, loosely connected',
    stage: 2, order: 2, type: 'concept',
    description: 'Understand the two most important quality dimensions of any design — and how to measure them.',
    estimatedMinutes: 12, icon: '⚖️',
    content: {
      learn: `Two of the most important design quality metrics are cohesion and coupling.

**Cohesion** = how related the things inside a class are to each other.
High cohesion: good. Everything in a class serves the same purpose.
Low cohesion: bad. A class that manages users, processes payments, AND generates PDFs.

**Coupling** = how much one class depends on another.
Low coupling: good. Classes can change independently.
High coupling: bad. Changing one class breaks many others.

Think of a smartphone:
→ The Camera app is highly cohesive (everything about taking photos) ✓
→ The Camera app doesn't need to know how the Contacts app works (low coupling) ✓

If changing how contacts are stored broke the camera, that's high coupling — a design problem.`,
      whyItMatters: `"High cohesion and low coupling" is the verbal shorthand for good design. Every interviewer knows this phrase.

When you review your design, ask:
→ Does this class do one thing well? (Cohesion)
→ Can I change this class without touching others? (Coupling)

A system with high coupling is fragile — a change ripples everywhere. A system with low cohesion is confusing — nothing has a clear purpose.`,
      interviewTip: `When asked "how would you improve this design?" check cohesion and coupling first.

Signs of low cohesion: large classes, hard-to-name methods, multiple unrelated imports
Signs of high coupling: a change in one class requires changes in many others, deep import chains, constructors with 10 parameters`,
      realExperience: `At a Myntra interview, a candidate designed an OrderService that imported: UserService, InventoryService, PaymentService, EmailService, SMSService, AnalyticsService, LoggingService, and CacheService.

The interviewer asked: "If the logging format changes, what else might break?"

The answer: potentially OrderService — because it was tightly coupled to the logging mechanism.

OrderService should not know HOW logging works. It should only call a logger interface.`,
      spotItPrompt: 'Identify the coupling and cohesion issues in this design.',
      spotItDesign: `class OrderProcessor {
  private db: MySQLDatabase           // concrete DB
  private emailClient: SendgridClient // concrete email
  private paymentGw: StripeClient     // concrete Stripe
  private logger: WinstonLogger        // concrete logger
  
  process(order: Order): void {
    this.db.query("INSERT INTO orders...")
    this.paymentGw.charge(order.amount, order.cardToken)
    this.emailClient.send(order.email, "Order confirmed")
    this.logger.info(\`Order processed: \${order.id}\`)
  }
}`,
      spotItAnswer: `High coupling problems:
1. Directly depends on MySQLDatabase — switching to PostgreSQL requires rewriting OrderProcessor
2. Directly depends on SendgridClient — changing email providers requires rewriting OrderProcessor
3. Directly depends on StripeClient — adding another payment provider requires changes here

Low cohesion: OrderProcessor is mixing order logic, database access, email delivery, payment processing, and logging all in one place.

If any one of these providers changes or needs to be swapped, this class changes.`,
      fixItPrompt: 'How would you reduce coupling in this design?',
      fixItAnswer: `interface OrderRepository { save(order: Order): void }
interface PaymentProcessor { charge(amount: number, token: string): void }
interface Emailer { send(to: string, body: string): void }
interface Logger { info(msg: string): void }

class OrderProcessor {
  constructor(
    private repo: OrderRepository,
    private payment: PaymentProcessor,
    private emailer: Emailer,
    private logger: Logger,
  ) {}

  process(order: Order): void {
    this.repo.save(order)
    this.payment.charge(order.amount, order.cardToken)
    this.emailer.send(order.email, "Order confirmed")
    this.logger.info(\`Order processed: \${order.id}\`)
  }
}

// Now switching MySQL → Postgres = just change the injected repository.
// Switching Stripe → PayPal = just change the injected payment processor.
// OrderProcessor never changes.`,
      interviewQuestion: 'How do you measure coupling in a design?',
      interviewAnswer: `The simplest measure: count the number of concrete types a class depends on. If OrderProcessor imports MySQLDatabase, SendgridClient, StripeClient, and WinstonLogger — that's 4 concrete dependencies.

Better metric: does changing one class require changing this class? If yes, they're coupled.

In practice, look at the import/dependency list. If all imports are interfaces or abstractions, coupling is low. If they are concrete implementations, coupling is high.`,
      followUp: 'Can you have a class that is both highly cohesive AND highly coupled?',
      followUpAnswer: `Yes. A PaymentService that only processes payments (high cohesion) but directly instantiates Stripe, connects to a database, and calls a logging framework (high coupling).

The class is focused on its purpose, but it is still tightly wired to specific implementations.

The solution: keep the high cohesion, but replace concrete dependencies with interfaces (dependency injection). That way you get both high cohesion and low coupling — the ideal combination.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['coupling', 'cohesion', 'solid', 'designThinking'],
    prerequisites: ['srp'],
    interviewerProbes: ['What is the coupling score of this class?', 'Can you change this without touching the caller?', 'What would change if we switch email providers?', 'What does high cohesion look like here?'],
    commonMistakes: ['Confusing cohesion with coupling', 'Using concrete types instead of interfaces in constructors', 'Not recognizing that a long import list is a coupling signal'],
    patternMapSteps: [
      { label: 'Count concrete dependencies', description: 'How many specific implementations does this class know about?' },
      { label: 'Introduce interfaces', description: 'Replace concrete types with abstractions' },
      { label: 'Check cohesion', description: 'Does this class do one thing?' },
      { label: 'Validate change isolation', description: 'Can I change each dependency independently?' },
    ],
    tags: ['solid', 'cohesion', 'coupling', 'design-quality'], status: 'published',
  },

  {
    slug: 'open-closed',
    title: 'Open/Closed Principle',
    subtitle: 'Add new behavior without touching existing code',
    stage: 2, order: 3, type: 'concept',
    description: 'Learn how to design systems that grow by addition, not modification.',
    estimatedMinutes: 13, icon: '🚪',
    content: {
      learn: `The Open/Closed Principle says: a class should be open for extension but closed for modification.

In plain terms: when you need new behavior, add new code — don't change existing code.

Think of a power socket. When new devices are invented (laptops, phones, EVs), you don't redesign the socket. You build a new plug that fits the existing socket.

The socket is "closed for modification" but "open for extension" (any device with the right plug can use it).

In software: if adding a new payment method means editing an existing PaymentService, the design is not closed for modification. But if adding PayPal just means writing a new PayPalProcessor class — that's OCP.`,
      whyItMatters: `OCP is tested constantly in LLD interviews. The interviewer will add a new requirement — a new payment type, a new notification channel, a new discount rule — and see how you handle it.

If your design requires editing 5 existing files: it violates OCP.
If your design only needs one new class: it follows OCP.

This is what makes systems maintainable at scale. Teams can add features without breaking existing behavior.`,
      interviewTip: `When the interviewer says "now add X" — watch your instinct. If you immediately want to edit an existing class, ask yourself: "Could I create a new class instead?"

If yes, redesign around an interface and implement the new behavior as a new class.`,
      realExperience: `In a PhonePe interview, a candidate designed a discount system using an if/else chain:

if (type == "flat") applyFlat()
else if (type == "percentage") applyPercentage()
else if (type == "bogo") applyBOGO()

The interviewer asked: "Add a seasonal discount."

The candidate added another else if. The interviewer asked: "Add a loyalty discount. And a referral discount. And a bundle discount."

After 5 additions, the method was 50 lines of if/else. The interviewer said: "Every time we add a discount, we touch this class. What could go wrong?"`,
      spotItPrompt: 'How does this design violate the Open/Closed Principle?',
      spotItDesign: `class DiscountCalculator {
  calculate(price: number, discountType: string, value: number): number {
    if (discountType === "flat") {
      return price - value
    } else if (discountType === "percentage") {
      return price - (price * value / 100)
    } else if (discountType === "bogo") {
      return price / 2
    } else if (discountType === "loyalty") {
      return price - (price * 0.1)  // added later
    } else if (discountType === "seasonal") {
      return price - (price * value / 100) - 50  // added even later
    }
    return price
  }
}`,
      spotItAnswer: `Every time a new discount type is needed, DiscountCalculator must be modified. This means:
1. Touching existing, tested code (risk of regression)
2. Growing method complexity indefinitely
3. The class never stabilizes — it's always being changed
4. Team members constantly conflict on changes to this file

This violates OCP: the class is not closed for modification.`,
      fixItPrompt: 'Redesign to follow OCP. New discount types should not require changing existing code.',
      fixItAnswer: `interface DiscountStrategy {
  calculate(price: number): number
}

class FlatDiscount implements DiscountStrategy {
  constructor(private amount: number) {}
  calculate(price: number): number { return price - this.amount }
}

class PercentageDiscount implements DiscountStrategy {
  constructor(private percent: number) {}
  calculate(price: number): number { return price - (price * this.percent / 100) }
}

class BOGODiscount implements DiscountStrategy {
  calculate(price: number): number { return price / 2 }
}

class LoyaltyDiscount implements DiscountStrategy {
  calculate(price: number): number { return price * 0.9 }
}

class PricingService {
  apply(price: number, discount: DiscountStrategy): number {
    return discount.calculate(price)
  }
}

// Adding a new discount: just add a new class. Nothing else changes.`,
      interviewQuestion: 'OCP says "closed for modification" — but sometimes we need to fix bugs in existing classes. Is that okay?',
      interviewAnswer: `Yes, OCP refers to feature extensions, not bug fixes.

The principle is about adding new behavior (new features, new types) without touching existing code. Bug fixes are corrections to existing behavior, not extensions.

The practical interpretation: when you need to add a new variant of behavior — a new payment method, a new discount type, a new report format — you should be able to do so by adding a new class, not modifying an existing one.

If adding a new payment method requires editing PaymentService, that service is not closed for modification with respect to payment methods.`,
      followUp: 'How do you decide what to "close" a class against? You cannot anticipate every future change.',
      followUpAnswer: `You're right — you can't anticipate everything. The principle says "make educated guesses."

Think about what is most likely to change in this system:
→ Payment methods will be added (close PaymentService against new methods)
→ Discount types will evolve (close PricingService against new discounts)
→ Report formats will grow (close ReportService against new formats)

Things you don't need to anticipate: first design normally. When a second variation appears and you need to modify an existing class, that's the signal to refactor toward OCP.

Martin Fowler calls this: "make the mistake once, then fix it."`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'medium', extensibility: 'hard', requirementAmbiguity: 'medium' },
    buildsSkills: ['solid', 'extensibility', 'patterns'],
    prerequisites: ['srp', 'polymorphism'],
    interviewerProbes: ['What happens when we add a new type?', 'Which class changes when requirements change?', 'Is this closed for modification?', 'How would you add X without changing existing code?'],
    commonMistakes: ['Using if/else or switch for type-based behavior', 'Not introducing interfaces early enough', 'Over-applying OCP to every class regardless of whether it actually changes'],
    patternMapSteps: [
      { label: 'Identify variation point', description: 'What behavior varies across types? (discount, payment, report)' },
      { label: 'Extract interface', description: 'DiscountStrategy, PaymentProcessor, etc.' },
      { label: 'Implement per variant', description: 'Each type is its own class' },
      { label: 'Caller uses interface', description: 'New variants = new class, no existing changes' },
    ],
    tags: ['solid', 'ocp', 'design-principles'], status: 'published',
  },

  {
    slug: 'dependency-management',
    title: 'Dependency Injection',
    subtitle: 'Give me what I need, don\'t make me find it',
    stage: 2, order: 4, type: 'concept',
    description: 'Learn how dependency injection makes your code flexible, testable, and easy to change.',
    estimatedMinutes: 12, icon: '🔌',
    content: {
      learn: `Dependency Injection (DI) means: instead of a class creating the objects it needs, someone gives them to it.

Think of a lamp:
→ Hardwired lamp: the lamp is connected directly to the wall. To change the power source, you must rewire the lamp.
→ Plug-in lamp: the lamp uses a plug. You can connect it to any power source that fits the plug.

In code:
→ Without DI: EmailService creates an SMTPClient inside itself (hardwired)
→ With DI: EmailService receives an EmailClient through its constructor (plug-in)

With DI, you can swap the email client without changing EmailService. You can inject a mock email client in tests. You are in control.`,
      whyItMatters: `DI is how the Dependency Inversion Principle works in practice. Instead of depending on concrete classes, your classes depend on interfaces passed in from outside.

This makes code:
→ Testable (inject a mock instead of a real service)
→ Flexible (change behavior by changing what you inject)
→ Readable (you can see all dependencies at a glance from the constructor)`,
      interviewTip: `When you write: new ConcreteService() inside a class, ask yourself: "Will I ever want to change or mock this?"

If yes: inject it instead.

Constructor injection is the clearest form: all dependencies visible in the constructor signature. This is called the "constructor injection" pattern.`,
      realExperience: `At a backend interview, a candidate's PaymentService had: this.logger = new WinstonLogger() and this.stripe = new StripeClient() hardcoded inside.

The interviewer asked: "How do you test PaymentService without making real Stripe API calls?"

The candidate had no answer. DI would have solved this: inject a mock IPaymentGateway that simulates Stripe responses without actually charging cards.`,
      spotItPrompt: 'What problem will this class cause during testing and when requirements change?',
      spotItDesign: `class OrderService {
  private emailService: EmailService
  private paymentService: PaymentService
  private logger: Logger

  constructor() {
    this.emailService = new SendgridEmailService()    // hardwired!
    this.paymentService = new StripePaymentService()  // hardwired!
    this.logger = new WinstonLogger()                 // hardwired!
  }

  placeOrder(order: Order): void {
    this.paymentService.charge(order.total, order.card)
    this.emailService.sendConfirmation(order)
    this.logger.log(\`Order \${order.id} placed\`)
  }
}`,
      spotItAnswer: `Problems:
1. Testing: you can't test OrderService without making real Stripe calls and sending real emails
2. Swapping: to use PayPal instead of Stripe, you must edit OrderService
3. Reuse: you can't use OrderService in different environments (dev/test/prod) without changing the class
4. Hidden dependencies: you don't know what OrderService needs until you read its constructor body

Every new/changed dependency is a modification to this class.`,
      fixItPrompt: 'Rewrite using dependency injection.',
      fixItAnswer: `interface IEmailService { sendConfirmation(order: Order): void }
interface IPaymentService { charge(amount: number, card: string): void }
interface ILogger { log(message: string): void }

class OrderService {
  constructor(
    private emailService: IEmailService,
    private paymentService: IPaymentService,
    private logger: ILogger,
  ) {}

  placeOrder(order: Order): void {
    this.paymentService.charge(order.total, order.card)
    this.emailService.sendConfirmation(order)
    this.logger.log(\`Order \${order.id} placed\`)
  }
}

// In tests:
const service = new OrderService(
  new MockEmailService(),
  new MockPaymentService(),
  new MockLogger(),
)

// In production:
const service = new OrderService(
  new SendgridEmailService(),
  new StripePaymentService(),
  new WinstonLogger(),
)`,
      interviewQuestion: 'What is the difference between dependency injection and the Service Locator pattern?',
      interviewAnswer: `Both solve the dependency problem, but differently.

Dependency Injection: dependencies are given to the class from outside (pushed in).
Service Locator: the class asks a central registry for its dependencies (pulls them).

DI is generally preferred because:
→ Dependencies are explicit and visible in the constructor
→ Easier to test (just pass mocks in constructor)
→ No hidden global state

Service Locator hides dependencies. You can't tell what a class needs just by looking at its constructor.`,
      followUp: 'How does DI interact with the Dependency Inversion Principle?',
      followUpAnswer: `DI is the mechanism. DIP is the principle.

DIP says: high-level modules should not depend on low-level modules. Both should depend on abstractions.

DI is how you achieve that: instead of creating concrete implementations inside your class, you accept interfaces (abstractions) via the constructor.

Together: you define interfaces (DIP), then inject concrete implementations from outside (DI). OrderService depends on IPaymentService (DIP) and receives StripePaymentService via its constructor (DI).`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'medium', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['solid', 'coupling', 'designThinking'],
    prerequisites: ['srp', 'cohesion-coupling'],
    interviewerProbes: ['How do you test this without making real API calls?', 'What happens when you switch email providers?', 'Can you see all dependencies from the constructor?', 'What is the difference between DI and service locator?'],
    commonMistakes: ['Hardcoding new ConcreteClass() inside constructors', 'Testing against real external services', 'Injecting too many dependencies (signals a class has too many responsibilities)'],
    patternMapSteps: [
      { label: 'Identify concrete dependencies', description: 'What does this class create internally with new?' },
      { label: 'Define interfaces', description: 'IEmailService, IPaymentProcessor, ILogger' },
      { label: 'Inject via constructor', description: 'Accept interfaces, not concrete classes' },
      { label: 'Wire externally', description: 'Callers decide which concrete implementation to use' },
    ],
    tags: ['solid', 'dependency-injection', 'testability'], status: 'published',
  },

  {
    slug: 'isp-lsp',
    title: 'ISP & LSP',
    subtitle: 'Focused interfaces and substitutable subtypes',
    stage: 2, order: 5, type: 'concept',
    description: 'Learn the last two SOLID principles that round out a complete understanding of good interface design.',
    estimatedMinutes: 14, icon: '🔍',
    content: {
      learn: `**Interface Segregation Principle (ISP):** Don't force a class to implement methods it doesn't need.

Imagine a Printer interface with: print(), scan(), fax(), staple(). A basic printer that can only print is forced to implement scan() and fax() — methods that don't apply to it.

Solution: smaller, focused interfaces. IPrintable has print(). IScannable has scan(). IFaxable has fax().

**Liskov Substitution Principle (LSP):** A subclass must be able to replace its parent without breaking behavior.

If you have a function that accepts a Rectangle, and someone passes a Square, should that work? Only if Square behaves exactly as a Rectangle would. (It doesn't — see the inheritance topic.)

LSP says: if your subclass throws unexpected exceptions, ignores methods, or breaks the parent's contract — that is a design violation.`,
      whyItMatters: `ISP shows up whenever you design interfaces. "Fat" interfaces (with too many methods) force implementors to lie about their capabilities.

LSP shows up whenever someone asks: "Can I use a child class wherever a parent class is expected?"

Both principles help keep your designs honest and substitutable.`,
      interviewTip: `For ISP: if you find yourself implementing a method as throw new Error("Not supported"), that's an ISP violation. The interface is too fat.

For LSP: the test is "can I replace parent with child in all contexts?" If no — the inheritance hierarchy is wrong.`,
      realExperience: `In an interview at Microsoft, a candidate created an IWorker interface with work(), eat(), sleep(), getPaid(). They then created a RobotWorker that implemented all methods, but eat() and sleep() threw NotImplementedException.

The interviewer asked: "What if code calls worker.eat() and gets an exception from a robot?"

This is an ISP violation. Robots should not implement IHuman. The interface should be split.`,
      spotItPrompt: 'What is wrong with this interface design?',
      spotItDesign: `interface IWorker {
  work(): void
  eat(): void
  sleep(): void
  getPaid(): number
  signContract(): void
  applyForLeave(): void
}

class HumanEmployee implements IWorker {
  work(): void { ... }
  eat(): void { ... }
  sleep(): void { ... }
  getPaid(): number { ... }
  signContract(): void { ... }
  applyForLeave(): void { ... }
}

class Robot implements IWorker {
  work(): void { ... }
  eat(): void { throw new Error("Robots don't eat") }
  sleep(): void { throw new Error("Robots don't sleep") }
  getPaid(): number { throw new Error("Robots don't get paid") }
  signContract(): void { throw new Error("No contract") }
  applyForLeave(): void { throw new Error("No leave") }
}`,
      spotItAnswer: `Robot is forced to implement 5 methods that don't apply to it. This is an ISP violation: the interface is too fat.

Also, if code does: worker.eat(), it might get a runtime exception if the worker is a Robot. This violates LSP — you can't safely substitute Robot where IWorker is expected.`,
      fixItPrompt: 'Split the interface to follow ISP. Robot should only implement what it actually does.',
      fixItAnswer: `interface IWorkable { work(): void }
interface IPayable { getPaid(): number }
interface IHuman { eat(): void; sleep(): void }
interface IContractual { signContract(): void; applyForLeave(): void }

class HumanEmployee implements IWorkable, IPayable, IHuman, IContractual {
  work(): void { ... }
  eat(): void { ... }
  sleep(): void { ... }
  getPaid(): number { ... }
  signContract(): void { ... }
  applyForLeave(): void { ... }
}

class Robot implements IWorkable {
  work(): void { ... }
  // Only implements what it actually does
}

// Code that needs a worker only depends on IWorkable — works for both humans and robots.`,
      interviewQuestion: 'How do ISP and DIP work together?',
      interviewAnswer: `They complement each other. DIP says depend on abstractions. ISP says those abstractions should be focused.

If you follow DIP but create fat interfaces, you end up depending on an abstraction that forces implementors to fake methods.

Combining both: create small, focused interfaces (ISP), and depend on those interfaces rather than concrete classes (DIP). OrderService depends on IPaymentProcessor (small interface), not on StripePaymentService (concrete class).`,
      followUp: 'When does LSP matter in a real codebase?',
      followUpAnswer: `LSP matters whenever you use polymorphism. If you have a Collection of INotificationChannel and you call channel.send() on each — you need every channel to actually send, not throw exceptions.

It also matters for inheritance hierarchies. If you override a method in a subclass with completely different behavior (especially throwing exceptions or silently ignoring calls), you likely have an LSP violation.

Practically: review every override. Does the subclass honor the parent's contract? Does it behave as callers would expect?`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'hard', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['solid', 'relationships', 'extensibility'],
    prerequisites: ['open-closed', 'dependency-management', 'inheritance'],
    interviewerProbes: ['What methods does this interface force implementors to fake?', 'Can I substitute child for parent without breaking behavior?', 'Why did you split this interface?'],
    commonMistakes: ['Creating monolithic interfaces with all possible methods', 'Throwing exceptions in overridden methods', 'Not recognizing that NotImplementedException is an ISP signal'],
    patternMapSteps: [
      { label: 'Fat interface detected', description: 'Some implementors throw "Not supported"' },
      { label: 'Find natural groups', description: 'What behaviors actually go together?' },
      { label: 'Split interfaces', description: 'IWorkable, IPayable, IHuman — each focused' },
      { label: 'Implement selectively', description: 'Each class only implements relevant interfaces' },
    ],
    tags: ['solid', 'isp', 'lsp'], status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 3 — DESIGN FOR CHANGE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'dip',
    title: 'Dependency Inversion Principle',
    subtitle: 'Depend on abstractions, not implementations',
    stage: 3, order: 1, type: 'concept',
    description: 'Master the principle that makes high-level modules independent of low-level details.',
    estimatedMinutes: 13, icon: '↕️',
    content: {
      learn: `The Dependency Inversion Principle has two parts:
1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.

In simple terms: your important business logic (high-level) should not be tied to specific tools (low-level).

Example: an OrderService (high-level) should not know that you are using Stripe (low-level). It should only know about an IPaymentProcessor interface.

Your laptop charger has a standard plug — that is the abstraction. Across the world, wall sockets (low-level details) conform to that abstraction. Your laptop does not need to know which country's grid it is on.`,
      whyItMatters: `DIP is probably the most commonly tested SOLID principle in interviews. Interviewers often test it indirectly by asking: "Now support multiple payment providers" or "What if we switch databases?"

If your high-level code depends on a specific database or specific API, that change is painful. If it depends on an interface, you just swap the implementation.`,
      interviewTip: `DIP is violated when you see import StripePaymentService inside OrderService, or when OrderService's constructor accepts a StripePaymentService directly.

Fix: define IPaymentProcessor. OrderService depends on that. StripePaymentService implements IPaymentProcessor.

Direction: OrderService → IPaymentProcessor ← StripePaymentService
Not: OrderService → StripePaymentService`,
      realExperience: `At a Razorpay interview, a candidate designed an OrderService that directly created a StripePaymentService instance.

The interviewer asked: "We also support Razorpay. How would you add it?"

The candidate said they'd add an if/else checking the payment provider. The interviewer then asked: "And when we add PayPal, Paytm, and UPI?"

The if/else would grow to 5 cases — and OrderService would change every time. That's a DIP violation.`,
      spotItPrompt: 'Which direction are the dependencies flowing? What is wrong?',
      spotItDesign: `// High-level (business logic)
class OrderService {
  private payment: StripePaymentService  // depends on LOW-level!
  private repo: MySQLOrderRepository     // depends on LOW-level!
  
  constructor() {
    this.payment = new StripePaymentService(process.env.STRIPE_KEY)
    this.repo = new MySQLOrderRepository(process.env.DB_URL)
  }
  
  placeOrder(order: Order): void {
    this.payment.chargeCard(order.amount, order.cardToken)
    this.repo.insertOrder(order)
  }
}

// Low-level details
class StripePaymentService { ... }
class MySQLOrderRepository { ... }`,
      spotItAnswer: `Dependencies flow from high-level (OrderService) DOWN to low-level (StripePaymentService, MySQLOrderRepository).

Problems:
1. OrderService changes when you switch from Stripe to PayPal
2. OrderService changes when you switch from MySQL to PostgreSQL
3. OrderService is untestable without real Stripe and MySQL connections
4. Business logic is mixed with infrastructure decisions`,
      fixItPrompt: 'Invert the dependencies. Make OrderService depend on abstractions, not concrete implementations.',
      fixItAnswer: `// Abstractions (the interfaces)
interface IPaymentProcessor {
  charge(amount: number, token: string): void
}

interface IOrderRepository {
  save(order: Order): void
  findById(id: string): Order | null
}

// High-level module depends only on abstractions
class OrderService {
  constructor(
    private payment: IPaymentProcessor,   // abstraction!
    private repo: IOrderRepository,        // abstraction!
  ) {}

  placeOrder(order: Order): void {
    this.payment.charge(order.amount, order.cardToken)
    this.repo.save(order)
  }
}

// Low-level details depend on abstractions (implement the interfaces)
class StripePaymentService implements IPaymentProcessor { ... }
class RazorpayPaymentService implements IPaymentProcessor { ... }
class MySQLOrderRepository implements IOrderRepository { ... }
class PostgresOrderRepository implements IOrderRepository { ... }`,
      interviewQuestion: 'Would you still introduce IPaymentProcessor if Stripe was the only payment provider?',
      interviewAnswer: `It depends on context. The YAGNI ("You Aren't Gonna Need It") principle says don't over-engineer.

If Stripe will genuinely be the only provider forever, a direct dependency might be acceptable. But if:
→ There's any chance of adding more providers
→ You want to write unit tests without real Stripe calls
→ The team plans to support multiple regions with different gateways

...then yes, the interface is worth it. The cost is small (one interface file), and the benefit is significant.

In an interview, I'd say: "I'd introduce the interface because it enables testing and makes future provider additions trivial."`,
      followUp: 'How is DIP different from dependency injection?',
      followUpAnswer: `DIP is the principle: depend on abstractions, not concretions.
DI is a technique to achieve it: pass dependencies through the constructor or method parameters.

DIP tells you WHAT to depend on (interfaces, not concrete classes).
DI tells you HOW to get those dependencies (receive them from outside, don't create them inside).

You can violate DIP even while using a DI container — for example, injecting a concrete StripeService instead of an IPaymentProcessor interface.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'hard', patterns: 'medium', extensibility: 'hard', requirementAmbiguity: 'medium' },
    buildsSkills: ['solid', 'coupling', 'extensibility', 'patterns'],
    prerequisites: ['dependency-management', 'open-closed'],
    interviewerProbes: ['What does OrderService know about payment providers?', 'How do you add a new payment provider?', 'Which direction do the dependencies flow?', 'Would you still add this interface with only one implementation?'],
    commonMistakes: ['Depending on concrete classes even when using dependency injection', 'Not creating interfaces because "there is only one implementation"', 'Confusing DIP with DI'],
    patternMapSteps: [
      { label: 'Identify high/low level', description: 'OrderService (high) vs StripeService (low)' },
      { label: 'Create abstraction', description: 'IPaymentProcessor interface' },
      { label: 'High-level depends on abstraction', description: 'OrderService → IPaymentProcessor' },
      { label: 'Low-level implements abstraction', description: 'StripeService implements IPaymentProcessor' },
    ],
    tags: ['solid', 'dip', 'abstractions'], status: 'published',
  },

  {
    slug: 'strategy-pattern',
    title: 'Strategy Pattern',
    subtitle: 'Swap algorithms without changing the caller',
    stage: 3, order: 2, type: 'concept',
    description: 'Master the most commonly used pattern in LLD interviews — and learn exactly when and why to use it.',
    estimatedMinutes: 15, icon: '♟️',
    content: {
      learn: `The Strategy pattern lets you define a family of algorithms, put each one in its own class, and make them interchangeable.

Think of a navigation app:
→ "Fastest route" algorithm
→ "Shortest route" algorithm
→ "Avoid highways" algorithm
→ "Scenic route" algorithm

The navigation app doesn't care which algorithm you pick. It just calls route.calculate(). Each routing strategy is a separate object.

This is Strategy:
1. Define an interface: IRouteStrategy with calculate()
2. Implement each algorithm: FastestRoute, ShortestRoute, AvoidHighwaysRoute
3. The navigator uses whichever strategy it receives

You can change the algorithm at runtime without changing the navigator.`,
      whyItMatters: `Strategy is the most commonly asked pattern in LLD interviews. Interviewers often introduce it by saying: "What if different users use different pricing strategies?" or "How would you support multiple payment methods?"

The answer is almost always Strategy.

It directly implements OCP (new strategies = new classes) and DIP (depend on IStrategy, not on concrete strategies).`,
      interviewTip: `Whenever you see: "different behavior based on a type or user preference" — think Strategy.

The tell-tale sign: an if/else block that selects behavior. Replace it with a strategy interface.

Name the interface after the behavior family: IPricingStrategy, IPaymentStrategy, IRouteStrategy, ISortStrategy.`,
      realExperience: `In a Flipkart interview: "Design the pricing engine. Products can be regular, premium, or sale-priced. Premium users get an extra discount."

A candidate answered: "I'll have a if/else based on product type and user type."

The interviewer asked: "We're adding 3 more pricing models next quarter. And we're also adding a negotiated pricing model for enterprise clients."

The candidate realized the if/else would become unmanageable. The correct answer: a PricingStrategy interface with a calculate(product, user) method, and each model as its own class.`,
      spotItPrompt: 'What is the design problem here?',
      spotItDesign: `class PaymentService {
  process(order: Order, method: string): void {
    if (method === "stripe") {
      const stripe = new StripeClient()
      stripe.charge(order.amount, order.cardToken)
    } else if (method === "paypal") {
      const paypal = new PayPalClient()
      paypal.createPayment(order.amount, order.paypalEmail)
    } else if (method === "upi") {
      const upi = new UPIGateway()
      upi.collectPayment(order.amount, order.upiId)
    } else if (method === "wallet") {
      const wallet = new WalletService()
      wallet.debit(order.userId, order.amount)
    }
  }
}`,
      spotItAnswer: `Every new payment method requires modifying PaymentService. This violates OCP.

Also, PaymentService now knows the internal APIs of 4 different payment providers — high coupling.

And there is no way to test one payment method without having all of them compiled and present.`,
      fixItPrompt: 'Refactor using the Strategy pattern.',
      fixItAnswer: `interface PaymentStrategy {
  process(order: Order): void
}

class StripeStrategy implements PaymentStrategy {
  process(order: Order): void {
    const stripe = new StripeClient()
    stripe.charge(order.amount, order.cardToken)
  }
}

class PayPalStrategy implements PaymentStrategy {
  process(order: Order): void {
    const paypal = new PayPalClient()
    paypal.createPayment(order.amount, order.paypalEmail)
  }
}

class UPIStrategy implements PaymentStrategy {
  process(order: Order): void {
    const upi = new UPIGateway()
    upi.collectPayment(order.amount, order.upiId)
  }
}

class PaymentService {
  process(order: Order, strategy: PaymentStrategy): void {
    strategy.process(order)
  }
}

// Adding Razorpay: just add RazorpayStrategy. PaymentService never changes.`,
      interviewQuestion: 'Why did you create a PaymentStrategy interface instead of just using inheritance?',
      interviewAnswer: `The problem being solved is variation in behavior — different payment methods have entirely different implementations with different external APIs.

Inheritance would mean: a base PaymentProcessor class with an overridable process() method. That works too, but strategy composition is more flexible:

1. You can switch strategies at runtime (user changes payment method mid-checkout)
2. Strategies can be reused across different contexts
3. There is no shared state to worry about inheriting

Strategy is the right choice when the behavior varies and needs to be swappable. Inheritance is better when the structure is genuinely the same and only specific steps differ.`,
      followUp: 'What if different strategies need different input parameters?',
      followUpAnswer: `The strategy interface defines the contract. If strategies need different inputs, there are two approaches:

1. Put all possible parameters into the Order object (or a context object) — the strategy uses what it needs
2. Use a generic context parameter: process(order: Order, context: Record<string, unknown>)

The cleaner approach in most cases is option 1: enrich the context/order object so each strategy can access its required data. Each strategy ignores fields it doesn't need.

If the inputs are radically different, you might be mixing unrelated behaviors and Strategy might not be the right pattern.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'hard', patterns: 'hard', extensibility: 'hard', requirementAmbiguity: 'medium' },
    buildsSkills: ['patterns', 'extensibility', 'solid', 'designThinking'],
    prerequisites: ['dip', 'open-closed', 'polymorphism'],
    interviewerProbes: ['How do you add a new payment method?', 'What if the strategy needs to be changed at runtime?', 'Why Strategy and not inheritance?', 'Can you name a problem where Strategy would not be the right choice?'],
    commonMistakes: ['Using if/else instead of Strategy', 'Creating a strategy for every tiny variation', 'Not knowing when NOT to use Strategy', 'Confusing Strategy with State pattern'],
    patternMapSteps: [
      { label: 'Variation in behavior detected', description: 'Different payment methods with different logic' },
      { label: 'Extract interface', description: 'PaymentStrategy with process(order)' },
      { label: 'Implement each variant', description: 'StripeStrategy, PayPalStrategy, UPIStrategy' },
      { label: 'Inject or pass strategy', description: 'Caller decides which strategy to use' },
    ],
    tags: ['patterns', 'strategy', 'gof'], status: 'published',
  },

  {
    slug: 'factory-pattern',
    title: 'Factory Pattern',
    subtitle: 'Delegate object creation to a specialist',
    stage: 3, order: 3, type: 'concept',
    description: 'Learn how factories keep object creation clean, centralized, and decoupled from business logic.',
    estimatedMinutes: 12, icon: '🏭',
    content: {
      learn: `A factory is a class whose job is to create objects. Instead of calling new ConcreteClass() scattered everywhere, you ask the factory to create the object.

Think of a car factory: you don't know exactly how a Honda is assembled. You call the factory and say "give me a Honda Civic." The factory handles all the complexity.

Why does this matter?

Without a factory:
→ new StripePaymentProcessor(), new PayPalProcessor(), new UPIProcessor() spread across the codebase
→ If the constructor parameters change, you update every call site

With a factory:
→ PaymentProcessorFactory.create("stripe")
→ One place to update if constructor changes
→ Easy to add new types without changing callers`,
      whyItMatters: `Factories show up whenever you have object creation that is complex, conditional, or varies by type.

In interviews, factories often appear with Strategy: "How do you decide which Strategy to use?" — The factory decides, based on the order type or user preference.

This keeps business logic clean: OrderService asks the factory for a payment strategy — it doesn't know how the factory decides.`,
      interviewTip: `Use a factory when:
1. Object creation is complex (many constructor parameters, initialization steps)
2. The type to create depends on a condition (payment method, vehicle type)
3. You want to centralize and control object creation

Factory Method is for subclasses to override which object is created.
Abstract Factory is for families of related objects.
Simple Factory is just a static method — great for most interview cases.`,
      realExperience: `In a PayU interview, a candidate designed a PaymentService that had: if paymentType == "stripe" → new StripeProcessor() inside the service method.

The interviewer asked: "What if creating a StripeProcessor requires 5 configuration parameters? Where does the configuration come from?"

The candidate realized the service was becoming responsible for knowing configuration for every payment provider. A factory centralizes that.`,
      spotItPrompt: 'What problem does this code have?',
      spotItDesign: `class NotificationService {
  send(type: string, message: string, recipient: string): void {
    let notifier
    if (type === "email") {
      notifier = new EmailNotifier(
        process.env.SMTP_HOST,
        process.env.SMTP_PORT,
        process.env.SMTP_USER,
        process.env.SMTP_PASS
      )
    } else if (type === "sms") {
      notifier = new SMSNotifier(
        process.env.TWILIO_SID,
        process.env.TWILIO_TOKEN,
        process.env.TWILIO_FROM
      )
    } else if (type === "push") {
      notifier = new PushNotifier(process.env.FCM_KEY)
    }
    notifier.send(message, recipient)
  }
}`,
      spotItAnswer: `NotificationService is responsible for knowing:
1. Which class to instantiate for each type
2. All configuration parameters for each provider
3. How to create each notifier

This is not the service's job. The service's job is to send notifications, not to construct notification providers.

Also: every time a new provider is added or constructor parameters change, this method must change.`,
      fixItPrompt: 'Extract the creation logic into a factory.',
      fixItAnswer: `interface INotifier {
  send(message: string, recipient: string): void
}

class NotifierFactory {
  static create(type: string): INotifier {
    switch (type) {
      case "email": return new EmailNotifier(
        process.env.SMTP_HOST, process.env.SMTP_PORT,
        process.env.SMTP_USER, process.env.SMTP_PASS
      )
      case "sms": return new SMSNotifier(
        process.env.TWILIO_SID, process.env.TWILIO_TOKEN, process.env.TWILIO_FROM
      )
      case "push": return new PushNotifier(process.env.FCM_KEY)
      default: throw new Error(\`Unknown notifier type: \${type}\`)
    }
  }
}

class NotificationService {
  send(type: string, message: string, recipient: string): void {
    const notifier = NotifierFactory.create(type)
    notifier.send(message, recipient)
  }
}

// NotificationService has zero knowledge of how notifiers are constructed.`,
      interviewQuestion: 'What is the difference between Factory Method and Abstract Factory?',
      interviewAnswer: `Factory Method: defines an interface for creating an object, but lets subclasses decide which class to instantiate. The "factory" is a method that subclasses override.

Abstract Factory: provides an interface for creating families of related objects. For example, a UIFactory that creates Button, Checkbox, and TextField — with a WindowsUIFactory and a MacUIFactory as implementations.

For most LLD interviews, a simple static factory is sufficient. Factory Method is useful when the creation decision belongs to a subclass. Abstract Factory is useful when you need to ensure objects from the same family are used together.`,
      followUp: 'When would you choose Factory over simply using the Strategy pattern directly?',
      followUpAnswer: `Strategy handles behavior variation. Factory handles creation complexity.

You often use them together:
1. PaymentProcessorFactory creates the right PaymentStrategy based on the payment type
2. OrderService calls factory.create(order.paymentType) to get a strategy
3. OrderService then uses strategy.process(order)

Factory answers "how do I get the right strategy?" Strategy answers "how do I execute the payment?"

If creation is simple (just new SomeStrategy()), a factory might be overkill. Use it when creation involves configuration, complex initialization, or type-based selection.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'hard', extensibility: 'medium', requirementAmbiguity: 'medium' },
    buildsSkills: ['patterns', 'coupling', 'designThinking'],
    prerequisites: ['strategy-pattern', 'dip'],
    interviewerProbes: ['Who decides which concrete type to create?', 'Where is your creation logic centralized?', 'What if constructor parameters change?', 'Factory Method vs Abstract Factory?'],
    commonMistakes: ['Scattering new ConcreteClass() throughout business logic', 'Factory that also contains business logic', 'Over-engineering with Abstract Factory when simple factory suffices'],
    patternMapSteps: [
      { label: 'Complex/conditional creation', description: 'new Concrete() scattered, or type-based selection' },
      { label: 'Centralize in factory', description: 'NotifierFactory.create(type)' },
      { label: 'Business logic stays clean', description: 'Service only uses interface, never creates' },
      { label: 'Extension point', description: 'Adding a new type = one change in factory' },
    ],
    tags: ['patterns', 'factory', 'creation-patterns'], status: 'published',
  },

  {
    slug: 'observer-pattern',
    title: 'Observer Pattern',
    subtitle: 'Subscribe once, get notified automatically',
    stage: 3, order: 4, type: 'concept',
    description: 'Learn how to build loosely coupled event-driven systems that scale without modification.',
    estimatedMinutes: 12, icon: '👁️',
    content: {
      learn: `The Observer pattern lets objects subscribe to events from another object and get notified automatically when something happens.

Think of YouTube:
→ A channel is the Subject (it publishes videos)
→ You are an Observer (you subscribed)
→ When a video is posted, you get notified
→ The channel doesn't know who specifically will watch — it just notifies all subscribers

In code:
→ Subject keeps a list of observers
→ When state changes, Subject calls notify() on all observers
→ Each observer handles the event its own way

The key benefit: the Subject doesn't know or care who the observers are. You can add or remove observers without touching the Subject.`,
      whyItMatters: `Observer comes up whenever you have an event that multiple things need to react to.

"After an order is placed, send a confirmation email, update inventory, track analytics, notify the delivery service, and give loyalty points."

Instead of OrderService calling all five systems directly — which creates tight coupling — OrderService just fires an OrderPlaced event. Each system subscribes independently.`,
      interviewTip: `Use Observer when:
1. Multiple parts of the system need to react to the same event
2. You want to add new reactions without changing the event source
3. The event source should not know about the listeners

Common names in interviews: event listener, subscriber, handler, callback.`,
      realExperience: `At a Swiggy interview, a candidate designed an OrderService that called: EmailService.sendConfirmation(), InventoryService.decrement(), AnalyticsService.track(), LoyaltyService.addPoints(), DeliveryService.schedule() — all in sequence, all tightly coupled.

The interviewer asked: "What if we add a ChatService that sends an in-app message? How many classes change?"

OrderService would change. With Observer: zero changes to OrderService. Just add ChatService as a new subscriber.`,
      spotItPrompt: 'How many responsibilities does this method have?',
      spotItDesign: `class OrderService {
  placeOrder(order: Order): void {
    // Core order logic
    this.orderRepo.save(order)
    
    // Notification coupling
    this.emailService.sendConfirmation(order.userId, order.id)
    this.smsService.sendOrderUpdate(order.phone, "Order placed!")
    
    // Inventory coupling
    this.inventoryService.decrementStock(order.items)
    
    // Analytics coupling  
    this.analyticsService.track("order_placed", { orderId: order.id })
    
    // Loyalty coupling
    this.loyaltyService.addPoints(order.userId, order.total)
    
    // Delivery coupling
    this.deliveryService.schedulePickup(order.id, order.deliveryAddress)
  }
}`,
      spotItAnswer: `This one method has 6 responsibilities after saving the order. OrderService is tightly coupled to 6 different services.

Problems:
1. Every time a new reaction is needed, OrderService changes
2. If any service fails, the entire order flow might fail
3. OrderService must be deployed whenever email, analytics, or loyalty logic changes
4. This is impossible to test in isolation

This is called a "God method" — it orchestrates everything.`,
      fixItPrompt: 'Refactor using the Observer pattern.',
      fixItAnswer: `interface OrderEventListener {
  onOrderPlaced(order: Order): void
}

class OrderEventBus {
  private listeners: OrderEventListener[] = []
  
  subscribe(listener: OrderEventListener): void {
    this.listeners.push(listener)
  }
  
  publish(order: Order): void {
    this.listeners.forEach(l => l.onOrderPlaced(order))
  }
}

class OrderConfirmationEmailListener implements OrderEventListener {
  onOrderPlaced(order: Order): void {
    this.emailService.sendConfirmation(order.userId, order.id)
  }
}

class InventoryUpdateListener implements OrderEventListener {
  onOrderPlaced(order: Order): void {
    this.inventoryService.decrementStock(order.items)
  }
}

// Clean OrderService:
class OrderService {
  constructor(private eventBus: OrderEventBus) {}
  
  placeOrder(order: Order): void {
    this.orderRepo.save(order)
    this.eventBus.publish(order)  // one line, zero coupling
  }
}

// Adding ChatService: create new listener, subscribe it. OrderService never changes.`,
      interviewQuestion: 'What if one observer fails? Does it affect the others?',
      interviewAnswer: `In a synchronous observer implementation, a failure in one listener can propagate and potentially abort the others.

To handle this gracefully:
1. Wrap each listener call in try/catch in the event bus
2. Log the failure but continue notifying other listeners
3. For critical operations (like inventory), separate them from non-critical ones (like analytics)

For production-grade systems: use an async event queue (Kafka, RabbitMQ) where each listener processes events independently. A failure in analytics doesn't affect email delivery.

In an interview, I'd mention both: synchronous with error isolation for simple cases, async queues for reliability at scale.`,
      followUp: 'What is the difference between Observer and event-driven architecture?',
      followUpAnswer: `Observer is a pattern: objects subscribe to another object directly, synchronous or asynchronous.

Event-driven architecture (EDA) is a broader architectural style: components communicate exclusively through events, often over a message broker. Components don't know each other at all.

Observer: OrderService has a reference to the EventBus. Listeners register with the EventBus.
EDA: OrderService publishes to Kafka. Email service consumes from Kafka. OrderService has no reference to any listener.

Observer is a pattern that EDA often uses at scale. In an interview, explaining the evolution from in-process Observer to distributed event queues is a strong answer.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'hard', patterns: 'hard', extensibility: 'hard', requirementAmbiguity: 'medium' },
    buildsSkills: ['patterns', 'coupling', 'extensibility', 'designThinking'],
    prerequisites: ['strategy-pattern', 'open-closed'],
    interviewerProbes: ['What if we add a new system that needs to react to orders?', 'How does OrderService know about all these services?', 'What if a listener fails?', 'How is this different from direct method calls?'],
    commonMistakes: ['Direct coupling in the event source', 'Not handling listener failures gracefully', 'Confusing Observer with Pub/Sub (slight architectural difference)', 'Creating circular observer relationships'],
    patternMapSteps: [
      { label: 'Event source', description: 'OrderService places an order (event)' },
      { label: 'Define interface', description: 'OrderEventListener with onOrderPlaced()' },
      { label: 'Register listeners', description: 'Email, Inventory, Analytics all subscribe' },
      { label: 'Publish and decouple', description: 'OrderService fires event, listeners react independently' },
    ],
    tags: ['patterns', 'observer', 'event-driven'], status: 'published',
  },

  {
    slug: 'state-pattern',
    title: 'State Pattern',
    subtitle: 'Different behavior in different states',
    stage: 3, order: 5, type: 'concept',
    description: 'Model entities with complex lifecycle states cleanly, without massive if/else chains.',
    estimatedMinutes: 13, icon: '🚦',
    content: {
      learn: `The State pattern lets an object change its behavior when its internal state changes. The object appears to change its class.

Think of a traffic light:
→ It's the same physical object (the light)
→ But it behaves differently in different states:
  - Red: cars stop, pedestrians go
  - Yellow: cars slow down
  - Green: cars go, pedestrians wait
→ The behavior is determined by the current state

In code, instead of if/else chains everywhere checking the state:

if (order.status == "pending") {
  if (action == "confirm") { ... }
  else if (action == "cancel") { ... }
}

You encapsulate each state as a separate class with its own behavior.`,
      whyItMatters: `State pattern is critical for any entity with a lifecycle: orders, tickets, bookings, loans, tasks. These entities have valid and invalid transitions between states.

Interviewers often test this by asking: "An order can be placed, confirmed, shipped, delivered, or cancelled. How do you model state transitions?"

Without State: a massive switch/if-else mess that grows with every new state.
With State: each state is a class, transitions are explicit, invalid transitions are caught early.`,
      interviewTip: `When you see: an entity that has a status field and behavior that depends on that status — think State pattern.

Common entities that need State: Order, Ticket, BookingReservation, PaymentTransaction, WorkflowTask, Document, LoanApplication.

Each state object knows which transitions are valid from it.`,
      realExperience: `In a BookMyShow interview: "Design a ticket booking system. Tickets go from Available → Reserved → Booked → Cancelled."

A candidate used a string status field and put all transition logic in a TicketService with: if (status == "available") { ... } else if (status == "reserved") { ... }

The interviewer asked: "What prevents reserving a ticket that's already booked?" The answer was: another if check inside the reservation logic.

With State pattern: the BookedState simply doesn't implement a reserve() method, or throws InvalidStateTransition.`,
      spotItPrompt: 'What is the problem with this state management?',
      spotItDesign: `class Order {
  status: string = "pending"
  
  confirm(): void {
    if (this.status !== "pending") throw new Error("Can only confirm pending orders")
    this.status = "confirmed"
    // confirmation logic
  }
  
  ship(): void {
    if (this.status !== "confirmed") throw new Error("Can only ship confirmed orders")
    this.status = "shipped"
    // shipping logic
  }
  
  deliver(): void {
    if (this.status !== "shipped") throw new Error("Can only deliver shipped orders")
    this.status = "delivered"
  }
  
  cancel(): void {
    if (this.status === "delivered") throw new Error("Cannot cancel delivered orders")
    if (this.status === "shipped") {
      // partial refund logic
    } else {
      // full refund logic
    }
    this.status = "cancelled"
  }
}`,
      spotItAnswer: `This works for simple cases, but breaks down quickly:
1. All state logic is in one class — it violates SRP
2. Adding a new state (Refunded, PartialRefund) requires modifying this class
3. The cancel() logic has embedded branching on current status
4. Business rules for each state are mixed together

As the lifecycle grows (returns, partial refunds, disputes), this class becomes unmaintainable.`,
      fixItPrompt: 'Refactor using the State pattern.',
      fixItAnswer: `interface OrderState {
  confirm(order: Order): void
  ship(order: Order): void
  deliver(order: Order): void
  cancel(order: Order): void
}

class PendingState implements OrderState {
  confirm(order: Order): void {
    console.log("Order confirmed")
    order.setState(new ConfirmedState())
  }
  ship(order: Order): void { throw new Error("Cannot ship a pending order") }
  deliver(order: Order): void { throw new Error("Cannot deliver a pending order") }
  cancel(order: Order): void {
    console.log("Order cancelled — full refund")
    order.setState(new CancelledState())
  }
}

class ConfirmedState implements OrderState {
  confirm(order: Order): void { throw new Error("Already confirmed") }
  ship(order: Order): void {
    console.log("Order shipped")
    order.setState(new ShippedState())
  }
  deliver(order: Order): void { throw new Error("Cannot deliver without shipping") }
  cancel(order: Order): void {
    console.log("Order cancelled before shipping")
    order.setState(new CancelledState())
  }
}

class Order {
  private state: OrderState = new PendingState()
  setState(state: OrderState): void { this.state = state }
  confirm(): void { this.state.confirm(this) }
  ship(): void { this.state.ship(this) }
  deliver(): void { this.state.deliver(this) }
  cancel(): void { this.state.cancel(this) }
}`,
      interviewQuestion: 'What is the difference between State and Strategy patterns?',
      interviewAnswer: `They look similar (both use a family of objects with a common interface) but solve different problems.

Strategy: the client chooses which strategy to use. Strategies are interchangeable algorithms. The object doesn't "know" its strategy — the caller passes it.

State: the object manages its own state. The state changes based on events. The object transitions itself from state to state based on its lifecycle.

In Strategy, the caller controls the behavior. In State, the object controls its own lifecycle.

Both use composition and polymorphism, but for different purposes.`,
      followUp: 'How would you add a RefundedState without changing existing states?',
      followUpAnswer: `Following OCP:
1. Create a new RefundedState class that implements OrderState
2. Add a refund() method to the OrderState interface (if not already present)
3. States where refund is valid (Delivered, Shipped) implement refund() and transition to RefundedState
4. States where refund is invalid throw an exception or do nothing

The key: existing state classes (PendingState, ConfirmedState) don't change. Only the states that can transition to RefundedState need to be updated.`,
    },
    difficultyDimensions: { oop: 'hard', solid: 'hard', patterns: 'hard', extensibility: 'hard', requirementAmbiguity: 'medium' },
    buildsSkills: ['patterns', 'designThinking', 'extensibility'],
    prerequisites: ['strategy-pattern', 'open-closed'],
    interviewerProbes: ['What prevents invalid state transitions?', 'How do you add a new state?', 'What is the difference between State and Strategy?', 'Who is responsible for managing state transitions?'],
    commonMistakes: ['Using string status fields with scattered if/else', 'Putting all state logic in the entity class', 'Not defining which transitions are valid from each state'],
    patternMapSteps: [
      { label: 'Entity with lifecycle', description: 'Order: pending → confirmed → shipped → delivered' },
      { label: 'Define State interface', description: 'OrderState with all possible actions' },
      { label: 'Implement each state', description: 'PendingState, ConfirmedState, ShippedState' },
      { label: 'States manage transitions', description: 'Each state knows where it can go next' },
    ],
    tags: ['patterns', 'state', 'lifecycle'], status: 'published',
  },

  {
    slug: 'template-method-pattern',
    title: 'Template Method Pattern',
    subtitle: 'Define the skeleton, let subclasses fill the blanks',
    stage: 3, order: 6, type: 'concept',
    description: 'Eliminate duplicate code across similar processes by defining the algorithm skeleton once.',
    estimatedMinutes: 11, icon: '📋',
    content: {
      learn: `The Template Method pattern defines the skeleton of an algorithm in a base class, and lets subclasses fill in specific steps.

Think of making a hot drink:
→ Boil water ← same for every drink
→ Steep/brew  ← different: tea steeps, coffee brews
→ Pour in cup ← same for every drink
→ Add extras  ← different: tea gets lemon, coffee gets cream

The "template" is: boil → steep → pour → add extras.
Subclasses only implement the steps that differ.

In code, an abstract base class defines the overall process (the template method) and marks certain steps as abstract. Each subclass implements those specific steps.`,
      whyItMatters: `Template Method is great for: report generation, data export, order processing pipelines, ETL workflows, testing frameworks.

Any time you have "the same steps in the same order, but some steps differ by type" — Template Method.

It avoids code duplication while still allowing customization.`,
      interviewTip: `Template Method is different from Strategy. With Strategy, the entire algorithm is swappable. With Template Method, the structure is fixed — only specific steps are customizable.

Use Template Method when:
→ The overall process is stable
→ Only specific steps vary
→ You want to enforce the ordering of steps`,
      realExperience: `In an interview, a candidate designed three separate report generators — PDFReport, ExcelReport, HTMLReport — each with duplicated logic for: loading data, applying filters, formatting headers, generating content, and saving the file.

The interviewer asked: "If the filter logic changes, how many classes change?"

Answer: three. That's the problem Template Method solves — share the common algorithm, vary only the specific steps.`,
      spotItPrompt: 'What code duplication problem do you see here?',
      spotItDesign: `class PDFReportGenerator {
  generate(data: any[]): void {
    const filtered = this.applyFilters(data)        // same in all
    const sorted = this.sortByDate(filtered)          // same in all
    const header = this.buildHeader()                 // same in all
    const content = this.buildPDFContent(sorted)      // different!
    const footer = this.buildFooter()                 // same in all
    this.savePDF(header + content + footer)           // different!
  }
}

class ExcelReportGenerator {
  generate(data: any[]): void {
    const filtered = this.applyFilters(data)        // DUPLICATED
    const sorted = this.sortByDate(filtered)          // DUPLICATED
    const header = this.buildHeader()                 // DUPLICATED
    const content = this.buildExcelContent(sorted)    // different
    const footer = this.buildFooter()                 // DUPLICATED
    this.saveExcel(header + content + footer)         // different
  }
}`,
      spotItAnswer: `applyFilters, sortByDate, buildHeader, and buildFooter are duplicated across both generators. Any change to the common logic requires updating multiple files.

If there are 5 report types, there are 5 copies of the same logic.

Template Method extracts the shared skeleton into a base class.`,
      fixItPrompt: 'Refactor using Template Method.',
      fixItAnswer: `abstract class ReportGenerator {
  // Template method — the skeleton (final, not overridable)
  generate(data: any[]): void {
    const filtered = this.applyFilters(data)    // shared
    const sorted = this.sortByDate(filtered)     // shared
    const header = this.buildHeader()            // shared
    const content = this.buildContent(sorted)   // abstract — varies
    const footer = this.buildFooter()            // shared
    this.save(header + content + footer)        // abstract — varies
  }

  // Shared steps
  private applyFilters(data: any[]): any[] { /* common logic */ }
  private sortByDate(data: any[]): any[] { /* common logic */ }
  private buildHeader(): string { return "Company Report" }
  private buildFooter(): string { return "Page 1 of N" }

  // Abstract steps — subclasses must implement
  protected abstract buildContent(data: any[]): string
  protected abstract save(content: string): void
}

class PDFReportGenerator extends ReportGenerator {
  protected buildContent(data: any[]): string { /* pdf content */ }
  protected save(content: string): void { /* save as PDF */ }
}

class ExcelReportGenerator extends ReportGenerator {
  protected buildContent(data: any[]): string { /* excel content */ }
  protected save(content: string): void { /* save as Excel */ }
}`,
      interviewQuestion: 'When would you choose Template Method over Strategy?',
      interviewAnswer: `Template Method: the overall algorithm structure is fixed. Only specific steps within it vary. The base class controls the flow.

Strategy: the entire algorithm is replaceable. The client controls which algorithm to use. No fixed skeleton.

Use Template Method when you want to enforce a consistent process and only allow variation in specific hooks.
Use Strategy when the algorithm itself is the variation point and callers should be able to choose different algorithms entirely.

Sometimes they work together: Template Method for the overall report generation skeleton, Strategy for the specific content-building step within it.`,
      followUp: 'How does Template Method relate to the Hollywood Principle ("don\'t call us, we\'ll call you")?',
      followUpAnswer: `Template Method is the classic example of the Hollywood Principle.

The base class's template method calls the subclass's hook methods — not the other way around. The subclass doesn't decide when its methods are called; the base class does.

"Don't call us, we'll call you" means: don't write code in the subclass that calls the base class. Let the base class call you through its template.

This enforces the algorithm structure. The subclass can only customize specific steps, not change the overall flow.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'hard', extensibility: 'medium', requirementAmbiguity: 'easy' },
    buildsSkills: ['patterns', 'responsibilities', 'cohesion'],
    prerequisites: ['inheritance', 'open-closed'],
    interviewerProbes: ['Where is the algorithm skeleton defined?', 'What steps can subclasses customize?', 'Template Method vs Strategy — when to use each?', 'What is the Hollywood Principle?'],
    commonMistakes: ['Duplicating common logic across subclasses', 'Making every step abstract (too much flexibility)', 'Confusing with Strategy pattern'],
    patternMapSteps: [
      { label: 'Shared algorithm structure', description: 'filter → sort → header → content → save' },
      { label: 'Common steps in base class', description: 'filter, sort, buildHeader — implemented once' },
      { label: 'Variable steps as abstract', description: 'buildContent(), save() — each subclass implements' },
      { label: 'Base class controls flow', description: 'Subclasses cannot change the algorithm order' },
    ],
    tags: ['patterns', 'template-method', 'inheritance-patterns'], status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 4 — INTERVIEW THINKING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'requirement-clarification',
    title: 'Requirement Clarification',
    subtitle: 'Always ask before you design',
    stage: 4, order: 1, type: 'interview',
    description: 'Master the most important first step in any LLD interview — asking the right questions before touching the whiteboard.',
    estimatedMinutes: 12, icon: '❓',
    content: {
      learn: `The single biggest mistake candidates make in LLD interviews is immediately starting to design without asking questions.

Think of a doctor: they never prescribe before asking symptoms.
Think of an architect: they never design a building without understanding who will use it.

A good interviewer gives you an intentionally vague problem. They want to see:
→ Can you identify what is unclear?
→ Do you ask the right questions?
→ Can you define scope before diving in?

The first 2-3 minutes should be questions, not design. This signals professional maturity.`,
      whyItMatters: `Requirements clarification is one of the top signals interviewers use to evaluate LLD candidates.

A candidate who asks no questions and immediately starts designing is showing:
→ They don't think about edge cases
→ They are not used to working with stakeholders
→ They may design the wrong system

A candidate who asks 3-5 focused questions is showing:
→ They understand that requirements are always incomplete
→ They can identify ambiguity
→ They think before they act`,
      interviewTip: `Have 4 standard categories of questions ready for any problem:

1. **Scope**: What is in scope? What is explicitly NOT in scope?
2. **Scale**: How many users? What's the expected load?
3. **Actors**: Who uses this system? What are their roles?
4. **Key behaviors**: What are the 3-4 most important user flows?

You don't need to ask everything — pick the most impactful ones. And always state assumptions when you make them.`,
      realExperience: `At a Google interview, a candidate was asked: "Design a parking lot."

Without asking a single question, they immediately designed for a single-floor, single-entry, cash-only parking lot.

After 20 minutes, the interviewer asked: "What about multi-floor? What about multiple entry gates? What about monthly passes?"

The design had to be rebuilt. 20 minutes wasted.

The correct first step: "Before I start, can I ask a few questions about scope?"`,
      spotItPrompt: 'What is wrong with how this candidate starts designing?',
      spotItDesign: `Interviewer: "Design a ride-sharing system like Uber."

Candidate (immediately): "Okay, I'll have a User class, a Driver class, 
and a Ride class. User can request a ride. Driver can accept or reject.
The Ride has a status: REQUESTED, ACCEPTED, IN_PROGRESS, COMPLETED.

For matching, I'll use a simple proximity algorithm..."

[Proceeds to design for 15 minutes without asking anything]`,
      spotItAnswer: `The candidate made many hidden assumptions:
1. Is this for one city or global?
2. Do we need surge pricing? Multiple vehicle types? Scheduling rides?
3. Real-time tracking? Driver ratings? Cancellations?
4. Is the scope the matching system, or also payments?
5. Are we doing the driver app and rider app, or just the backend?

Designing without asking means designing the wrong system. The interviewer will reveal these gaps later — and it costs time to redesign.`,
      fixItPrompt: 'What 4-5 questions should be asked before designing this system?',
      fixItAnswer: `1. "What scale are we designing for? Single city or multiple cities/countries?"

2. "What are the core use cases? Request ride, accept ride, complete ride — is that the MVP? Or do we also need scheduling and pricing?"

3. "What vehicle types do we support? Just cars, or also bikes, autos, luxury?"

4. "Are we designing the full stack — rider app, driver app, backend? Or just the backend logic?"

5. "Are payments in scope, or just the ride matching and tracking?"

After these 5 questions, you have a clear scope. You can state: "I'll design the core ride matching and tracking system for a single city, supporting basic car rides. Payments are out of scope."`,
      interviewQuestion: 'The interviewer says "just assume whatever you want." How do you handle that?',
      interviewAnswer: `This is a test too. The interviewer wants to see if you can make reasonable, explicit assumptions.

The right response: "Okay, I'll make a few assumptions and state them clearly."

Then say aloud: "I'm assuming this is for a single city with up to 100,000 concurrent users. I'm assuming we support only standard cars. Payments are out of scope. Let me know if any of these are wrong."

This shows:
→ You can make decisions under ambiguity
→ You are transparent about assumptions
→ You invite feedback

Then proceed to design.`,
      followUp: 'How much time should you spend on requirement clarification in a 45-minute interview?',
      followUpAnswer: `3-5 minutes is usually right. Enough to clarify the most important unknowns, not so long that you run out of design time.

Rough timeline for a 45-minute LLD interview:
→ 3-5 min: Requirements clarification + scope definition
→ 5-8 min: Entity identification + high-level design
→ 20-25 min: Detailed class design + relationships
→ 5-8 min: Pattern identification + extensibility discussion
→ Remaining: Follow-up questions

If you spend 15 minutes asking questions, you won't have time to design. Keep it focused.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'easy', extensibility: 'easy', requirementAmbiguity: 'hard' },
    buildsSkills: ['requirementAnalysis', 'communication', 'designThinking'],
    prerequisites: [],
    interviewerProbes: ['What would you ask before starting?', 'What assumptions are you making?', 'Is this in scope or out of scope?', 'How do you handle "assume whatever you want"?'],
    commonMistakes: ['Starting to design immediately', 'Asking too many questions (becomes a questionnaire)', 'Not stating assumptions explicitly when making them', 'Forgetting to define scope boundaries'],
    patternMapSteps: [
      { label: 'Receive vague problem', description: '"Design an Uber-like system"' },
      { label: 'Ask scope questions', description: 'Scale, actors, key behaviors, boundaries' },
      { label: 'State assumptions', description: '"I\'m assuming single city, up to 100K users"' },
      { label: 'Define MVP scope', description: 'Core matching system — payments out of scope' },
    ],
    tags: ['interview-skills', 'requirements', 'communication'], status: 'published',
  },

  {
    slug: 'entity-identification',
    title: 'Entity Identification',
    subtitle: 'Finding the right objects from requirements',
    stage: 4, order: 2, type: 'interview',
    description: 'Learn a systematic technique to identify all the key entities in a system before writing a single class.',
    estimatedMinutes: 11, icon: '🔎',
    content: {
      learn: `Before writing classes, you need to identify the right entities. Missing a key entity early leads to redesigning later.

The technique: walk through the user journey step by step and find every noun.

Example: "A user searches for available rooms, selects one, books it, makes a payment, and receives a confirmation."

Nouns: User, Room, Search, Booking, Payment, Confirmation

But not all nouns become classes. Filter by: does it have its own data and behavior? Does it need to persist?

→ User: yes (profile, bookings, payment methods)
→ Room: yes (type, price, availability, amenities)
→ Booking: yes (dates, user, room, status)
→ Payment: yes (amount, method, status, reference)
→ Search: maybe (search parameters, results — might just be a query method)
→ Confirmation: maybe (could be just a notification trigger)`,
      whyItMatters: `Interviewers observe: "Did the candidate find all the important entities before starting to design?"

Missing Hotel and RoomType from a hotel booking system, or missing Driver and Vehicle from a ride-sharing system — these are red flags.

Entity identification is the bridge between requirements and design.`,
      interviewTip: `Two passes when identifying entities:

Pass 1 — obvious entities: the main actors and nouns from the requirements
Pass 2 — relationship entities: anything that represents a relationship between two entities (Booking = User + Room, Enrollment = Student + Course)

Relationship entities are the most commonly missed. They usually have additional data (date, status, price) that neither parent owns.`,
      realExperience: `In an Amazon interview for a "Design a Movie Booking System," a candidate created User, Movie, and Seat classes but forgot Booking and Payment.

The interviewer asked: "When a user books a seat, where does the booking information go?"

The candidate said: "In the User class."

"So User stores all booking history? And all payment history? And all refund history?"

The candidate realized they needed separate Booking and Payment entities — and had to add them mid-design.`,
      spotItPrompt: 'What key entities are missing from this initial class list?',
      spotItDesign: `// "Design a Library Management System where 
// members can borrow and return books"

// Initial entities identified:
class Book {
  title: string
  author: string
  isbn: string
  isAvailable: boolean
}

class Member {
  memberId: string
  name: string
  email: string
}

class Library {
  books: Book[]
  members: Member[]
}

// Classes missing? What relationship entities are needed?`,
      spotItAnswer: `Missing entities:
1. BookLoan (or Borrowing) — represents the act of borrowing: which member, which book, borrowDate, dueDate, returnDate, fine. Neither Book nor Member should own all this.

2. Catalog (or LibraryCatalog) — manages searching, filtering, tracking copies of books

3. Fine — if fines are a feature, they need their own entity (amount, reason, paid/unpaid status)

4. BookCopy — a Library has multiple physical copies of the same Book title. Book represents the title/metadata; BookCopy represents a physical item on the shelf.

Without these, the design cannot properly handle "borrow history" or "overdue fines."`,
      fixItPrompt: 'Add the missing entity and show what data it contains.',
      fixItAnswer: `class BookLoan {
  loanId: string
  member: Member          // who borrowed
  book: Book              // what was borrowed
  borrowDate: Date        // when
  dueDate: Date           // when it's due
  returnDate?: Date       // when returned (null if not yet)
  fineAmount: number      // 0 if returned on time
  status: 'active' | 'returned' | 'overdue'
}

class Library {
  books: Book[]
  members: Member[]
  activeLoans: BookLoan[]  // all current loans
  
  borrowBook(memberId: string, isbn: string): BookLoan { ... }
  returnBook(loanId: string): void { ... }
  checkOverdueLoans(): BookLoan[] { ... }
}`,
      interviewQuestion: 'How do you decide if something should be its own class or just a property?',
      interviewAnswer: `Ask three questions:
1. Does it have multiple properties of its own? (A fine has: amount, reason, date, status — yes)
2. Does it have its own behavior? (A BookLoan can calculate its fine, check if overdue — yes)
3. Do other parts of the system need to reference it independently? (Need to find all active loans, overdue loans, loans by member — yes)

If yes to these: it's a class.
If it's just a simple value (like a color string or a price number), it might just be a property.

"Date" is a property. "BookLoan" is a class.`,
      followUp: 'After identifying entities, what do you do next?',
      followUpAnswer: `After entities, I identify:

1. Relationships between entities (who owns what, what are the cardinalities)
2. Core behaviors (what does each entity do? what methods does it have?)
3. Key responsibilities (which entity is responsible for each business rule?)

The order matters: entities → relationships → behaviors. Don't jump to method signatures before you understand the object graph.

In an interview, I'd draw a quick entity diagram with relationships before writing any class definitions.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'easy', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'medium' },
    buildsSkills: ['entityIdentification', 'designThinking', 'requirementAnalysis'],
    prerequisites: ['requirement-clarification', 'oop-relationships'],
    interviewerProbes: ['What entities did you identify first?', 'What relationship entities are you missing?', 'Where does booking history live?', 'How did you decide what needs to be its own class?'],
    commonMistakes: ['Missing relationship entities (Booking, Enrollment, Order)', 'Identifying too many trivial entities', 'Jumping to methods before establishing entities', 'Not thinking about "what data does this entity own?"'],
    patternMapSteps: [
      { label: 'Walk the user journey', description: '"User searches, books, pays, receives confirmation"' },
      { label: 'Extract all nouns', description: 'User, Room, Hotel, Booking, Payment, Invoice' },
      { label: 'Filter by data+behavior', description: 'Does it have its own data and behavior?' },
      { label: 'Find relationship entities', description: 'Booking = User + Room + dates + status' },
    ],
    tags: ['interview-skills', 'entity-identification', 'design-process'], status: 'published',
  },

  {
    slug: 'defining-boundaries',
    title: 'Defining System Boundaries',
    subtitle: 'What\'s in scope and what\'s not',
    stage: 4, order: 3, type: 'interview',
    description: 'Learn how to define clear scope boundaries that keep your design focused and prevent over-engineering.',
    estimatedMinutes: 10, icon: '🗺️',
    content: {
      learn: `Defining boundaries means deciding what your system is responsible for — and what it is not.

A restaurant menu defines boundaries: "We make Italian food. We don't do sushi." That clarity helps the kitchen function efficiently.

In LLD, boundaries prevent over-engineering. If asked to "design a chess game," the boundaries are:
→ In scope: game rules, piece movement, win conditions, board state
→ Out of scope: user accounts, multiplayer networking, tournament management, AI opponent

A beginner might try to design all of it. An experienced candidate defines scope first and designs only what's needed.`,
      whyItMatters: `Interviewers look for judgment. Can you determine what matters for a 45-minute session versus what can be deferred?

Over-engineering in an interview (adding user authentication, analytics, and notifications to a chess game) wastes design time and signals poor judgment.

"I'll design the core chess logic first. Multiplayer and user accounts are out of scope for this session, but I can describe how I'd extend it."

That sentence alone earns respect.`,
      interviewTip: `After requirements clarification, explicitly state the scope boundary: "For this session, I'll design [core responsibility]. I'll leave out [adjacent features] but can discuss how to add them if we have time."

This shows:
→ You can prioritize
→ You understand the difference between core and peripheral
→ You manage time efficiently in the interview`,
      realExperience: `A candidate was asked to "design a chess game." They spent 10 minutes designing UserAccount, Authentication, TournamentBracket, EloRatingSystem, and Spectator mode before writing a single chess piece class.

The interviewer stopped them: "Can we see the chess game rules?"

The candidate had no Chess, Board, Piece, or Move classes yet. The boundary was wrong from the start.`,
      spotItPrompt: 'Which parts of this design are likely out of scope for a 45-minute interview?',
      spotItDesign: `// "Design a chess game"
// Candidate's class list:

User, AuthService, JWTToken, PasswordHasher,
ChessGame, Board, Piece, King, Queen, Rook, Bishop, Knight, Pawn,
Move, MoveValidator, GameHistory, GameState,
Tournament, TournamentBracket, EloRatingSystem,
SpectatorMode, LiveStream, Commentary,
PuzzleEngine, AIOpponent, DifficultyLevel,
PaymentService, PremiumPlan, SubscriptionManager`,
      spotItAnswer: `In scope for a chess game design:
ChessGame, Board, Piece (and all types), Move, MoveValidator, GameState — these form the core system.

Likely out of scope:
→ Auth, JWTToken, PasswordHasher — this is user management, not chess
→ Tournament, EloRating — interesting extension, but not the core game
→ SpectatorMode, LiveStream — infrastructure concern
→ AIOpponent — entire separate problem
→ PaymentService — completely out of scope

A good answer: "I'll design the core chess engine: Board, Pieces, Moves, and game state. I'll mention where Tournament and AI would plug in but won't design them in detail."`,
      fixItPrompt: 'Define the right scope boundary for this problem. What should and should not be in scope?',
      fixItAnswer: `Core scope (design in detail):
• Board — 8x8 grid, squares
• Piece — abstract base with position and color
• King, Queen, Rook, Bishop, Knight, Pawn — each with move rules
• Move — from/to positions, captured piece
• MoveValidator — checks if a move is legal
• ChessGame — manages turn, check/checkmate detection, game state
• GameState — current board snapshot, captured pieces, turn count

Out of scope (mention briefly if time allows):
• User accounts and authentication
• Persistence (saving/loading games)
• Online multiplayer networking
• AI opponent
• Tournament management

Stating this boundary early: "I'll focus on the core game engine. User accounts and multiplayer are out of scope for today."`,
      interviewQuestion: 'How do you decide what is "core" versus "peripheral"?',
      interviewAnswer: `Core = what the system cannot function without.

For chess: you cannot play chess without Board, Piece, and Move validation. You CAN play chess without user accounts and ratings.

I ask: "If I remove this, can the primary user flow still work?"

Primary flow for chess: two players move pieces on a board until someone wins.
→ Board: required
→ MoveValidator: required
→ User accounts: not required for the core game
→ EloRating: definitely not required for the core game`,
      followUp: 'When should you include out-of-scope items in your design?',
      followUpAnswer: `Include out-of-scope items as extension points — places where the out-of-scope feature would plug in, without designing it fully.

For example: "My ChessGame has an event system. When a game ends, it fires a GameCompleted event. A tournament system would listen to that event — but I haven't designed the tournament system itself."

This shows:
→ You have thought about extensibility
→ You have left clean extension points
→ You can articulate how future features would integrate

This is much better than either: ignoring extensions entirely, OR trying to design everything.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'easy', extensibility: 'medium', requirementAmbiguity: 'hard' },
    buildsSkills: ['requirementAnalysis', 'designThinking', 'communication'],
    prerequisites: ['requirement-clarification', 'entity-identification'],
    interviewerProbes: ['What is out of scope here?', 'Can you prioritize to the core use case?', 'Where would authentication plug in?', 'What can wait for a future sprint?'],
    commonMistakes: ['Trying to design the entire platform in 45 minutes', 'Not stating scope boundaries explicitly', 'Treating all features as equally important', 'Not leaving extension points for out-of-scope features'],
    patternMapSteps: [
      { label: 'Receive broad problem', description: '"Design an e-commerce platform"' },
      { label: 'Identify core user flow', description: 'Browse → Cart → Checkout → Order confirmed' },
      { label: 'Define what\'s in scope', description: 'Products, Cart, Order, Payment processing' },
      { label: 'State what\'s out of scope', description: 'Reviews, recommendations, admin portal — deferred' },
    ],
    tags: ['interview-skills', 'scope', 'design-process'], status: 'published',
  },

  {
    slug: 'handling-ambiguity',
    title: 'Handling Ambiguity',
    subtitle: 'Decide confidently when requirements are unclear',
    stage: 4, order: 4, type: 'interview',
    description: 'Learn how to make good assumptions and stay confident when interviewers deliberately leave requirements vague.',
    estimatedMinutes: 10, icon: '🧭',
    content: {
      learn: `Interviewers intentionally leave requirements vague. This is not an accident — they want to see how you handle uncertainty.

Ambiguity is everywhere in real engineering. Requirements are never complete. Stakeholders don't always know what they want. Good engineers make informed decisions.

The wrong response to ambiguity: freeze, ask 20 questions, or wait for the interviewer to define everything.

The right response: make a reasonable assumption, state it explicitly, and proceed.

"I'll assume parking spots are first-come-first-served. If we need priority lanes for disabled spots, I'll add that as an extension."

One sentence. Assumption stated. Design continues.`,
      whyItMatters: `Handling ambiguity is a proxy for how you'd behave on the job. Will you get blocked waiting for perfect requirements? Or will you make sensible decisions and move forward?

Interviewers are measuring:
→ Can you identify what is ambiguous?
→ Can you make reasonable assumptions?
→ Are your assumptions explicitly stated?
→ Do you build in flexibility for when assumptions are wrong?`,
      interviewTip: `The formula for handling ambiguity:
1. Identify the ambiguous aspect
2. State your assumption explicitly (out loud)
3. Proceed with the design
4. Note where the design would change if the assumption is wrong

Never silently assume. Always say it.`,
      realExperience: `Two candidates were asked the same question: "Design a notification system."

Candidate A: "Does notification mean email? SMS? Push? What's the frequency? Can users customize? Is there a queue? Can notifications fail? What about retries?"

The interviewer said: "Just make assumptions."

Candidate A was still asking questions 10 minutes later.

Candidate B: "I'll assume notifications are asynchronous, support email and push for now, and we'll add retry on failure. If we need SMS or in-app, the architecture supports it via Strategy pattern. Let me start designing."

Candidate B got an offer. Candidate A did not.`,
      spotItPrompt: 'What is wrong with how this candidate handles the ambiguous requirement?',
      spotItDesign: `Interviewer: "Design a parking lot system."

Candidate: "Before I start, I need to know: 
- How many floors? 
- How many spots per floor?
- What vehicle types?
- Is pricing flat or dynamic?
- Are there reserved spots?
- Monthly passes or per-hour?
- How many entry gates?
- Is there a barrier or ticketing system?
- What payment methods?
- Do we need license plate recognition?
- Should spots be booked in advance?
- What about accessibility spots for disabled?"

[12 questions asked, 8 minutes gone, no design started]`,
      spotItAnswer: `Too many questions — and many of them can be answered with a reasonable assumption.

The interviewer is losing patience. They want to see design, not requirements gathering for a production system.

Some of these questions ARE good: floor count, vehicle types, pricing model. But 12 questions in a row signals an inability to operate under ambiguity.

Better: ask the 2-3 most impactful questions, then assume the rest and state them.`,
      fixItPrompt: 'Rewrite the opening 2 minutes of this interview with better ambiguity handling.',
      fixItAnswer: `"Let me ask two quick questions before starting:

1. Are we designing just the parking management logic, or also the payment system?
2. Do we need to support multiple vehicle types like bikes and trucks?

[Interviewer answers]

Great. I'll make a few assumptions for the other details:
- Multi-floor parking, but the number of floors and spots per floor are configurable
- First-come-first-served spot assignment for now
- Pricing is per-hour (flat rate) — we can extend to dynamic pricing later
- One entry gate and one exit gate for the MVP

Does that sound reasonable? If so, let me start with the core entities."

5 questions reduced to 2. Assumptions stated clearly. Design starts in 2 minutes.`,
      interviewQuestion: 'What if your assumption turns out to be wrong mid-design?',
      interviewAnswer: `That's okay — and expected. Good assumptions are "wrong but reasonable."

The key is to have designed for extensibility from the start. If you assumed flat pricing and the interviewer later says "actually we need dynamic pricing," a design using PricingStrategy is easy to extend.

If you hardcoded flat pricing everywhere, you have to redesign.

Making assumptions explicit also lets the interviewer correct you early: "Actually, we do need monthly passes." Better to know at minute 3 than at minute 30.`,
      followUp: 'How is handling ambiguity in interviews different from handling it on the job?',
      followUpAnswer: `On the job, you have more time, more stakeholders to consult, and the ability to iterate. Ambiguity can be resolved through product discussions, user research, and prototyping.

In an interview, you have 45 minutes. The core skill being tested is: "Can you make a decision and move forward?" — not "Can you gather perfect requirements?"

Both require the same underlying ability: identify what is unknown, make informed decisions, and remain open to revision. The interview just compresses the timeline.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'easy', extensibility: 'easy', requirementAmbiguity: 'hard' },
    buildsSkills: ['requirementAnalysis', 'communication', 'designThinking', 'tradeoffReasoning'],
    prerequisites: ['requirement-clarification'],
    interviewerProbes: ['What assumption are you making here?', 'What would change if this assumption is wrong?', 'How do you move forward without complete information?'],
    commonMistakes: ['Asking too many questions before starting', 'Making silent assumptions', 'Freezing when requirements are unclear', 'Building designs that cannot accommodate the revealed requirements'],
    patternMapSteps: [
      { label: 'Spot the ambiguity', description: '"How many vehicle types? Which pricing model?"' },
      { label: 'Ask 1-2 critical questions', description: 'Only ask what will significantly change the design' },
      { label: 'State assumptions aloud', description: '"I\'ll assume flat hourly pricing for now"' },
      { label: 'Design with extension points', description: 'PricingStrategy leaves room for dynamic pricing later' },
    ],
    tags: ['interview-skills', 'ambiguity', 'communication'], status: 'published',
  },

  {
    slug: 'explaining-tradeoffs',
    title: 'Explaining Trade-offs',
    subtitle: 'The Problem → Decision → Trade-off → Benefit framework',
    stage: 4, order: 5, type: 'interview',
    description: 'Learn how to verbalize your design decisions in a structured way that impresses every interviewer.',
    estimatedMinutes: 13, icon: '🗣️',
    content: {
      learn: `The ability to explain your design decisions is what separates a good candidate from a great one.

Most candidates say: "I used Strategy pattern here."

Great candidates say: "Payment methods vary frequently and we need to add new ones without changing existing code. I introduced a PaymentStrategy interface so each method is its own class. The trade-off is more classes and slightly more indirection, but the benefit is that adding PayPal is just a new class — no changes anywhere else."

The framework: **Problem → Decision → Trade-off → Benefit**

→ Problem: what design pressure are you responding to?
→ Decision: what did you do?
→ Trade-off: what are you giving up?
→ Benefit: what do you gain?`,
      whyItMatters: `In senior roles, you don't just write code — you make decisions and communicate them. Interviewers are testing your ability to reason about design out loud.

"I used Strategy" tells the interviewer you know the pattern name.
"I used Strategy because..." tells them you understand WHEN and WHY to use it.

The second answer is what gets offers.`,
      interviewTip: `Practice the PDTB framework for every major design decision:
P: Problem — "The challenge is that..."
D: Decision — "So I decided to..."
T: Trade-off — "The downside is..."
B: Benefit — "The benefit is..."

Use this structure even for small decisions. "Why is this field private? The problem is that balance could be set to invalid values. I made it private so the class controls its own invariants. The downside is more code (getters/setters), but the benefit is that balance can never be negative."`,
      realExperience: `In a LinkedIn interview, a candidate was asked: "Why did you use an Observer pattern here instead of direct method calls?"

The candidate said: "Because Observer is the right pattern for this."

The interviewer asked: "Why is it right?"

The candidate said: "Because it decouples the components."

The interviewer asked: "What would be different about direct method calls?"

The candidate couldn't answer. They knew the pattern name but not the reasoning.

With PDTB: "The problem was that OrderService was calling 6 different services directly — any new service meant changing OrderService. I introduced an event system. The trade-off is that it's harder to trace the flow. But the benefit is that adding a new service means zero changes to OrderService."`,
      spotItPrompt: 'Which explanation is better and why?',
      spotItDesign: `// Explanation A:
"I used composition here instead of inheritance
because composition is generally better."

// Explanation B:
"The problem was that vehicles have different refueling 
behaviors — gas, electric, hybrid. If I used inheritance,
I'd need new subclasses for every combination (ElectricCar,
HybridGasCar, etc.). Instead, I composed Vehicle with a 
FuelSystem interface. The trade-off is more objects. The 
benefit is I can mix and match — a vehicle can be electric
today and hybrid tomorrow without touching Vehicle at all."`,
      spotItAnswer: `Explanation B is dramatically better.

Explanation A:
→ Cites a general principle without applying it to THIS problem
→ Interviewer still doesn't know WHY composition fits here
→ Sounds like pattern-matching, not reasoning

Explanation B:
→ States the specific problem (vehicle fuel variation + combinatorial explosion)
→ Explains the specific decision (FuelSystem interface + composition)
→ Acknowledges the trade-off (more objects)
→ States the concrete benefit (can mix behaviors freely)

Explanation B shows you understand the design, not just the vocabulary.`,
      fixItPrompt: 'Rewrite these weak explanations using the PDTB framework:\n1. "I used Factory here because it\'s a creational pattern."\n2. "I made this interface because it\'s good practice."',
      fixItAnswer: `1. "I used Factory here because creating a PaymentProcessor involves environment-specific configuration (API keys, endpoints). If OrderService creates it directly, OrderService needs to know all that config. The trade-off is another class to maintain, but the benefit is OrderService is clean — it just asks the factory for a processor and doesn't care how it's configured."

2. "I introduced IPaymentProcessor because I wanted OrderService to work with Stripe, PayPal, and future providers without changing. The trade-off is that you need to look at the interface AND the implementation to understand what it does. The benefit is you can swap any payment provider with zero changes to OrderService, and you can inject a mock in tests."`,
      interviewQuestion: 'When should you acknowledge trade-offs proactively versus waiting to be asked?',
      interviewAnswer: `Proactively — always. Acknowledging trade-offs shows confidence and design maturity.

After presenting a design decision, say: "I chose this approach. The trade-off is X. I think that's acceptable because Y."

This shows:
→ You know your design has limitations
→ You have thought about alternatives
→ You are intellectually honest

Waiting to be asked looks like you either don't know the trade-offs or were hoping the interviewer wouldn't notice.

Strong candidates say: "Before we move on, I want to note that this Observer implementation is synchronous. If a listener fails, it could block the entire flow. For production, we'd want async processing with a queue."`,
      followUp: 'How do you explain a design decision when you\'re not sure it was the right choice?',
      followUpAnswer: `Be honest about the uncertainty. Say: "I chose this because X seemed like the right trade-off to me, but I can see an argument for Y."

Interviewers respect intellectual honesty more than false confidence. A candidate who says "I'm not sure if Factory Method or Abstract Factory is better here — here's how I thought about it" is showing real reasoning ability.

Also: "I'd want to understand the expected frequency of new payment providers before committing to this level of abstraction. If it's rare, a simpler approach might suffice."

That's the kind of nuanced thinking senior engineers have.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'medium', extensibility: 'easy', requirementAmbiguity: 'medium' },
    buildsSkills: ['communication', 'tradeoffReasoning', 'designThinking'],
    prerequisites: ['handling-ambiguity'],
    interviewerProbes: ['Why did you make that decision?', 'What are the trade-offs?', 'What would you do differently with more time?', 'What does this design not handle well?'],
    commonMistakes: ['Just naming a pattern without explaining the design pressure', 'Not acknowledging trade-offs', 'Giving generic explanations ("it\'s best practice") instead of problem-specific ones'],
    patternMapSteps: [
      { label: 'State the Problem', description: '"Payment methods vary frequently..."' },
      { label: 'State the Decision', description: '"I introduced PaymentStrategy interface..."' },
      { label: 'Acknowledge Trade-off', description: '"The downside is more classes and indirection..."' },
      { label: 'State the Benefit', description: '"Adding PayPal is just one new class, nothing else changes"' },
    ],
    tags: ['interview-skills', 'communication', 'tradeoffs'], status: 'published',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 5 — PRESSURE TEST
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: 'followup-handling',
    title: 'Handling Follow-Up Questions',
    subtitle: 'Survive "now let\'s change one thing"',
    stage: 5, order: 1, type: 'interview',
    description: 'Learn the systematic approach to handling design changes mid-interview without rebuilding everything.',
    estimatedMinutes: 14, icon: '⚡',
    content: {
      learn: `Follow-up questions are where most candidates lose marks. You have designed a parking lot. The interviewer says:

"Good. Now, how would you support monthly passes?"

Many candidates start from scratch. This is wrong.

The right approach is surgical: understand the change, identify the blast radius, modify only what's necessary.

The 4 steps:
1. Understand the change — what exactly is being asked?
2. Find the blast radius — which classes are affected?
3. Modify only what's necessary — leave everything else alone
4. Re-verify — does the change break anything existing?

Good designs absorb follow-up changes with minimal modification. Fragile designs require a rewrite.`,
      whyItMatters: `Interviewers use follow-up questions to test your design's flexibility. They're asking: "Is this design extensible, or did you design for exactly one scenario?"

The candidate who confidently says: "To add monthly passes, I just need to add a MonthlyPassStrategy class and update the pricing factory — nothing else changes" is demonstrating exactly what senior engineers do: make targeted changes that don't cascade.`,
      interviewTip: `When a follow-up requirement lands:
1. Don't panic or rebuild
2. Say: "Let me trace which classes this change affects"
3. Identify 1-3 specific classes that change
4. Show the minimal change needed
5. Confirm that other classes don't change

If your design requires changing 5+ classes for a follow-up, mention it: "This change has a wider blast radius than I'd like — here's why, and here's how I'd refactor to reduce it."`,
      realExperience: `At a Uber interview, a candidate designed a ride-sharing system. The interviewer asked: "Now add surge pricing."

The candidate paused, then added a surgeMultiplier field to every Ride object and updated 6 different methods across 4 classes.

An experienced candidate said: "My PricingStrategy interface already handles this. I just add a SurgePricingStrategy that checks time and demand. The rest of the system doesn't change."

Same change. One candidate changed 6 methods. One changed 0 existing files.`,
      spotItPrompt: 'This design works for basic parking. If we add "reserved VIP spots," which classes would change and why?',
      spotItDesign: `class ParkingLot {
  private spots: ParkingSpot[]
  
  findAvailableSpot(vehicle: Vehicle): ParkingSpot | null {
    return this.spots.find(s => 
      s.isAvailable && s.size >= vehicle.size
    ) ?? null
  }
}

class ParkingSpot {
  spotId: string
  size: 'small' | 'medium' | 'large'
  isAvailable: boolean
}

class PricingService {
  calculate(duration: number, spotSize: string): number {
    const rates = { small: 10, medium: 20, large: 30 }
    return rates[spotSize] * duration
  }
}`,
      spotItAnswer: `Blast radius for "VIP reserved spots":

1. ParkingSpot — needs a new isVIP or spotType field
2. ParkingLot.findAvailableSpot — needs to filter out VIP spots for regular vehicles (VIP spots are reserved, not first-come)
3. PricingService — VIP spots likely have premium pricing
4. Maybe a new ReservationService — if VIP spots need advance booking

If the design used a SpotAllocationStrategy, findAvailableSpot could absorb the change without ParkingLot changing. That's the key insight: good design minimizes the blast radius.`,
      fixItPrompt: 'How would you redesign ParkingLot to absorb this change with fewer modifications?',
      fixItAnswer: `// Introduce a SpotAllocationStrategy to absorb variation
interface SpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null
}

class StandardAllocation implements SpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null {
    return spots.find(s => 
      s.isAvailable && s.size >= vehicle.size && s.type === 'standard'
    ) ?? null
  }
}

class VIPAllocation implements SpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null {
    return spots.find(s => 
      s.isAvailable && s.type === 'vip'
    ) ?? null
  }
}

class ParkingLot {
  constructor(private allocationStrategy: SpotAllocationStrategy) {}
  
  findAvailableSpot(vehicle: Vehicle): ParkingSpot | null {
    return this.allocationStrategy.findSpot(this.spots, vehicle)
  }
}

// Adding VIP: new strategy class. ParkingLot unchanged. ✓`,
      interviewQuestion: 'How do you identify the blast radius of a change?',
      interviewAnswer: `The blast radius = all classes that must change when a requirement changes.

To identify it:
1. Find the class that directly handles the new behavior
2. Look at what that class depends on and what depends on it
3. Trace the chain up and down

If the changed class implements an interface, and all callers use that interface — the blast radius stops at the implementation. Nothing else changes.

If the changed class is used by reference everywhere — the blast radius is unlimited.

The pattern: interfaces act as firewalls that contain blast radius. Classes without interface boundaries propagate changes.`,
      followUp: 'What if a follow-up completely changes the core requirement?',
      followUpAnswer: `Sometimes a follow-up is a fundamental pivot — not an extension, but a change to the core model. That's okay too, and good candidates handle it with grace.

Say: "This change fundamentally affects [X entity/relationship]. My current design assumed [old assumption]. For this change, I'd need to [specific change]."

Be honest about the redesign cost: "This would require changing 3-4 core classes because [reason]. In a real scenario, I'd ask: is this a hard requirement, or can we phase it in?"

Don't defend a design that is genuinely wrong for the new requirement. Good engineers change their minds when the requirements change.`,
    },
    difficultyDimensions: { oop: 'hard', solid: 'hard', patterns: 'hard', extensibility: 'hard', requirementAmbiguity: 'hard' },
    buildsSkills: ['followupHandling', 'extensibility', 'tradeoffReasoning'],
    prerequisites: ['explaining-tradeoffs', 'strategy-pattern', 'open-closed'],
    interviewerProbes: ['What changes if we add feature X?', 'Which classes are affected?', 'How many files would you need to change?', 'Can you make this change without touching existing classes?'],
    commonMistakes: ['Rebuilding the entire design for a small follow-up', 'Not identifying the blast radius first', 'Defending a fragile design instead of acknowledging its limits'],
    patternMapSteps: [
      { label: 'Receive follow-up', description: '"Now add surge pricing"' },
      { label: 'Understand the change', description: 'Pricing is contextual — time/demand dependent' },
      { label: 'Find blast radius', description: 'PricingStrategy already abstracts this — only add new class' },
      { label: 'Surgical modification', description: 'SurgePricingStrategy added. Nothing else changes.' },
    ],
    tags: ['interview-skills', 'followup', 'extensibility'], status: 'published',
  },

  {
    slug: 'verbal-reasoning',
    title: 'Verbal Reasoning',
    subtitle: 'What would you say?',
    stage: 5, order: 2, type: 'interview',
    description: 'Learn to explain your design decisions clearly and confidently when an interviewer asks "why?"',
    estimatedMinutes: 12, icon: '💬',
    content: {
      learn: `Technical design is only half the interview. The other half is explaining your reasoning out loud.

Interviewers ask questions like:
→ "Why did you choose composition here?"
→ "What made you introduce this interface?"
→ "Walk me through how an order gets placed."
→ "What would you do differently?"

These questions are not traps. They're invitations to show your thinking.

The PDTB framework helps:
**P**roblem → **D**ecision → **T**rade-off → **B**enefit

But verbal reasoning is also about confidence, clarity, and connection to the actual design.

The goal: every explanation should tie back to a specific requirement or design pressure in the problem you're solving.`,
      whyItMatters: `At senior levels, communication IS part of the technical skill. The best technical solution that can't be explained is worthless in a collaborative environment.

Interviewers are also checking: "Would I want this person presenting their design in a team meeting?"

Strong verbal reasoning = higher likelihood of offer, especially for SDE-2 and above.`,
      interviewTip: `Practice saying your design decisions out loud as you make them. Don't just draw classes silently.

As you add an interface: "I'm introducing IPricingStrategy here because pricing logic is likely to vary. This way, OrderService stays stable when we add new pricing models."

Running commentary helps:
→ Interviewer understands your thought process
→ You catch mistakes earlier (explaining often reveals errors)
→ It feels more like a conversation than a test`,
      realExperience: `Two candidates were given identical designs. One was silent while drawing, only speaking when asked. The other narrated continuously: "I'm creating a Booking class here because the relationship between User and Room has its own data — dates, status, pricing. Neither User nor Room should own all that..."

The second candidate wasn't just explaining — they were demonstrating reasoning. The interviewer gave the second candidate full marks for design communication.`,
      spotItPrompt: 'Which answer to the interviewer\'s question is better?',
      spotItDesign: `Interviewer: "Why did you introduce an Observer pattern here?"

Answer A: "Because the Order event needs to notify multiple services."

Answer B: "The problem was that OrderService was directly calling 
EmailService, InventoryService, and AnalyticsService. Every time 
a new system needed to react to an order, we'd change OrderService.

I introduced an OrderEventBus so OrderService just publishes events. 
Each system subscribes independently.

The trade-off is that it's harder to trace the exact flow — you have 
to check which listeners are registered. But the benefit is that adding 
a new service (like a chatbot notification) requires zero changes 
to OrderService."`,
      spotItAnswer: `Answer B is significantly stronger.

Answer A:
→ Describes what Observer does, not WHY it was needed here
→ Doesn't connect to the specific design pressure
→ No trade-off acknowledged
→ Interviewer has to ask follow-up questions

Answer B:
→ States the specific problem (direct coupling to multiple services)
→ Explains the specific decision (event bus + subscribe)
→ Acknowledges the trade-off (harder to trace)
→ States the concrete benefit (adding new service = zero OrderService changes)

Answer B takes 30 more seconds but earns significantly more credit.`,
      fixItPrompt: 'Rewrite these weak answers using the PDTB framework:\n1. "I used a Factory because it creates objects."\n2. "I made this method private for encapsulation."',
      fixItAnswer: `1. PDTB: "Payment processors require different configurations — Stripe needs an API key, PayPal needs a client ID and secret. If OrderService created them directly, it would need to know all this configuration. I introduced a PaymentProcessorFactory to centralize that. The trade-off is another abstraction layer. But the benefit is OrderService doesn't know how processors are configured — it just asks the factory."

2. PDTB: "The balance field represents the account's core invariant — it must never go negative. If I left it public, callers could set balance to any value, bypassing our validation logic. I made it private so the only way to change it is through deposit() and withdraw(), which enforce the rules. The trade-off is slightly more code. The benefit is the class always guarantees its own consistency."`,
      interviewQuestion: 'How do you stay calm when you don\'t know the answer to a follow-up question?',
      interviewAnswer: `Honesty and structured thinking.

If you don't know: "I haven't worked through this specific scenario, but let me think through it..."

Then reason out loud:
1. "The change affects [class X]."
2. "I'd need to consider [constraint Y]."
3. "My first instinct would be to [approach Z], but the risk is [problem]."

This shows:
→ Reasoning ability even under pressure
→ Intellectual honesty
→ Structured thinking

Never fake an answer. Interviewers can tell. Saying "I'm not sure, but here's how I'd think about it" is far stronger than a confident wrong answer.`,
      followUp: 'How do you handle it when the interviewer disagrees with your design decision?',
      followUpAnswer: `First: understand their concern. Ask: "What do you see as the problem with this approach?"

Then: engage genuinely. Either:
(a) "I see your point — with that constraint, I'd change to [alternative]"
(b) "I understand the trade-off you're highlighting. I chose this because [reason], but if [condition], I agree your approach is better."

Don't defend your answer just to defend it. Design discussions are collaborative, not adversarial.

One phrase that always works: "That's a good point I hadn't considered. How would you approach it?" — inviting the interviewer into a collaborative conversation always leaves a positive impression.`,
    },
    difficultyDimensions: { oop: 'easy', solid: 'easy', patterns: 'easy', extensibility: 'easy', requirementAmbiguity: 'medium' },
    buildsSkills: ['communication', 'tradeoffReasoning'],
    prerequisites: ['explaining-tradeoffs'],
    interviewerProbes: ['Can you walk me through your design?', 'Why did you make that decision?', 'What if I disagree?', 'What would you do differently?'],
    commonMistakes: ['Designing in silence', 'Explaining what the pattern does instead of why you chose it', 'Not connecting explanations to the specific problem', 'Defending wrong answers to save face'],
    patternMapSteps: [
      { label: 'Narrate while designing', description: '"I\'m adding IPricingStrategy here because..."' },
      { label: 'Use PDTB for each decision', description: 'Problem → Decision → Trade-off → Benefit' },
      { label: 'Connect to requirements', description: 'Every decision should trace back to a requirement' },
      { label: 'Invite discussion', description: '"Does this approach make sense, or do you see a different way?"' },
    ],
    tags: ['interview-skills', 'communication', 'verbal-reasoning'], status: 'published',
  },

  {
    slug: 'interview-simulation',
    title: 'Practice Interview',
    subtitle: 'Apply everything in a 45-minute simulation',
    stage: 5, order: 3, type: 'interview',
    description: 'Walk through a complete 45-minute interview simulation from requirements to debrief.',
    estimatedMinutes: 45, icon: '🎤',
    content: {
      learn: `This is where everything comes together. A full interview simulation for a parking lot system.

You've learned:
→ Classes & Objects (Stage 1)
→ SOLID Principles (Stage 2)
→ Design Patterns (Stage 3)
→ Interview Skills (Stage 4)

Now use them all together.

**The simulation format:**
1. Receive the problem
2. Clarify requirements (2-3 min)
3. Identify entities (3-5 min)
4. Design classes and relationships (15-20 min)
5. Apply patterns where needed (5-10 min)
6. Handle follow-up questions (10-15 min)
7. Explain and defend decisions throughout`,
      whyItMatters: `Individual skills don't matter in isolation. What matters is how you combine them under time pressure.

Timing discipline, smooth transitions between phases, verbal communication while designing — these only come from practice.

This simulation gives you a complete run-through with the exact structure an interviewer expects.`,
      interviewTip: `In a real 45-minute LLD interview, time allocation matters:
→ 3-5 min: requirements + scope
→ 5-8 min: entity identification + quick overview
→ 20-25 min: detailed class design
→ 5-10 min: patterns + extensibility
→ Remaining: follow-ups and discussion

Don't spend 15 minutes on requirements. Don't spend 35 minutes on class design and leave no time for extensibility.`,
      realExperience: `The most common interview feedback is: "The candidate had good ideas but ran out of time before covering extensibility and patterns."

The second most common: "The candidate spent too long on basics and didn't handle the follow-up questions."

Practice full-length simulations with a timer to develop the right pacing instinct.`,
      spotItPrompt: 'In this interview transcript, where does the candidate waste time?',
      spotItDesign: `[8 minutes] Candidate asks 12 detailed questions about parking lot specifications

[20 minutes] Candidate lists ALL possible fields for every class:
ParkingLot: id, name, address, city, country, zipCode, 
phone, email, website, description, ...

[5 minutes] Quickly sketches relationships

[2 minutes] Mentions "could use Strategy for pricing" but doesn't implement

[Out of time — no follow-up questions handled]`,
      spotItAnswer: `Time wasted:
1. 8 minutes on requirements — should be 3 minutes max
2. Listing every possible field — interviews care about KEY fields, not exhaustive schemas
3. No follow-up questions handled

Result: interviewer never saw the candidate's ability to handle extensions, apply patterns, or respond under pressure.

Always ask yourself during the interview: "Am I on track to reach the extensibility discussion?"`,
      fixItPrompt: 'What does an ideal time allocation look like for this parking lot interview?',
      fixItAnswer: `Minute 0-3: Requirements
"A few quick questions: what vehicle types? Multi-floor? Is pricing in scope?
Assumptions: one entry/exit, multi-floor, per-hour pricing, standard cars and bikes."

Minute 3-8: Entity identification
"Core entities: ParkingLot, ParkingFloor, ParkingSpot, Vehicle, Ticket.
Relationship entities: ParkingTicket (spot + vehicle + entry time + exit time)."

Minute 8-28: Design
"ParkingSpot has spotType (small/medium/large), isAvailable, floor reference.
ParkingLot delegates spot finding to a SpotAllocationStrategy..."

Minute 28-38: Patterns
"I'm using Strategy for pricing. This way adding monthly passes is just PricingStrategy implementation..."

Minute 38-45: Follow-ups
"How do we add EV charging? I'd add an amenity field to ParkingSpot and a filter in the allocation strategy..."`,
      interviewQuestion: 'How do you know when you\'ve designed "enough" in an interview?',
      interviewAnswer: `You have covered "enough" when:
1. The core entities are defined with key fields and relationships
2. The primary user flows can be traced through the design
3. At least one extension point has been demonstrated (a pattern, an interface)
4. You can explain the major design decisions

You don't need:
→ Every possible field and method
→ Error handling code
→ Database schema details
→ API layer

Aim for: "A senior engineer reading this design would understand the system and could extend it."`,
      followUp: 'What do you do if you realize mid-interview that your design has a fundamental flaw?',
      followUpAnswer: `Acknowledge it confidently and redesign.

"Actually, I realize there's a problem with how I've modeled the pricing. Let me revise this piece."

Then fix it.

Interviewers respect candidates who catch their own mistakes. It shows:
→ Ongoing self-review
→ Intellectual honesty
→ Adaptability

What interviewers don't respect: doubling down on a wrong design, or silently hoping they won't notice.

Also: the interviewer might have been about to point it out anyway. You catching it first is always better.`,
    },
    difficultyDimensions: { oop: 'hard', solid: 'hard', patterns: 'hard', extensibility: 'hard', requirementAmbiguity: 'hard' },
    buildsSkills: ['designSpeed', 'communication', 'followupHandling', 'tradeoffReasoning'],
    prerequisites: ['followup-handling', 'verbal-reasoning', 'requirement-clarification'],
    interviewerProbes: ['Are you on track with time?', 'What patterns did you apply?', 'How would you handle this follow-up?'],
    commonMistakes: ['Poor time allocation', 'Over-indexing on field listing', 'Not reaching extensibility discussion', 'Silent designing with no verbal explanation'],
    patternMapSteps: [
      { label: '3 min', description: 'Requirements + scope definition' },
      { label: '5 min', description: 'Entity identification' },
      { label: '20 min', description: 'Core class design' },
      { label: '10 min', description: 'Patterns + follow-ups' },
    ],
    tags: ['interview-skills', 'simulation', 'full-interview'], status: 'published',
  },

  {
    slug: 'mock-debrief',
    title: 'Self-Review & Debrief',
    subtitle: 'How to improve after every practice session',
    stage: 5, order: 4, type: 'interview',
    description: 'Learn the self-review checklist to systematically identify and fix weaknesses in your designs.',
    estimatedMinutes: 10, icon: '📊',
    content: {
      learn: `The fastest way to improve is to review your own work critically.

After every practice session, go through four dimensions:

**Correctness**: Does the design solve the stated problem? Can the core user flows be executed with these classes?

**Clarity**: Would a new team member understand this design in 5 minutes? Are responsibilities clear? Are names descriptive?

**Extensibility**: Can the design accommodate the follow-up questions? Are there brittle if/else chains? Are extension points built in?

**Communication**: Did you explain decisions? Did you use PDTB? Did you acknowledge trade-offs?

Rate yourself 1-5 on each. Focus your next session on the lowest score.`,
      whyItMatters: `Practice without reflection is just repetition. You need to know what went wrong to improve.

After a session where you couldn't handle the "add EV charging" follow-up, the debrief question is: "Was my ParkingSpot design too rigid? Did I miss an extensibility point? Would a SpotAllocationStrategy have helped?"

That reflection leads to targeted improvement in the next session.`,
      interviewTip: `After each practice problem, spend 5 minutes answering:
1. What did I design well?
2. What follow-up change broke my design?
3. Which class would I redesign?
4. What pattern would have helped?
5. What would I say differently next time?

This is more valuable than just doing more problems.`,
      realExperience: `The candidates who improve fastest are not the ones who do the most problems — they're the ones who do fewer problems but debrief deeply.

One candidate did only 5 practice problems in a month but reviewed each one for 30 minutes, identified specific weaknesses, and targeted them in the next problem. They improved from "poor" to "strong" in follow-up handling.

Another candidate did 20 problems but never debriefed. They kept making the same mistakes.`,
      spotItPrompt: 'Looking at this parking lot design after a practice session, what would you identify as weaknesses?',
      spotItDesign: `class ParkingLot {
  floors: ParkingFloor[]
  
  allocateSpot(vehicle: Vehicle): ParkingSpot {
    for (const floor of this.floors) {
      for (const spot of floor.spots) {
        if (spot.isAvailable && spot.size >= vehicle.size) {
          spot.isAvailable = false
          return spot
        }
      }
    }
    throw new Error("No spot available")
  }
  
  calculateFee(spot: ParkingSpot, hours: number): number {
    if (spot.size === 'small') return hours * 10
    if (spot.size === 'medium') return hours * 20
    return hours * 30
  }
}`,
      spotItAnswer: `Self-review findings:

**Extensibility (3/5):**
→ allocateSpot has no extension point — adding VIP spots, disabled spots, or EV spots requires modifying this method
→ calculateFee has hardcoded rates — adding dynamic pricing, monthly passes, or discount codes requires modifying this method

**Correctness (4/5):**
→ Core allocation works
→ Missing: how to record who parked where (no Ticket/Session object)

**Clarity (4/5):**
→ Structure is clear but could be improved

**Missing patterns:**
→ SpotAllocationStrategy would absorb allocation variation
→ PricingStrategy would absorb fee calculation variation`,
      fixItPrompt: 'List 3 specific improvements you would make in the next iteration.',
      fixItAnswer: `Improvement 1: Extract PricingStrategy
interface PricingStrategy { calculate(spot, duration): number }
This absorbs: flat pricing, dynamic pricing, monthly passes, discounts.

Improvement 2: Extract SpotAllocationStrategy  
interface SpotAllocationStrategy { findSpot(floors, vehicle): ParkingSpot }
This absorbs: standard allocation, VIP priority, disabled spots, EV-only.

Improvement 3: Add ParkingSession (relationship entity)
class ParkingSession {
  sessionId: string
  vehicle: Vehicle
  spot: ParkingSpot
  entryTime: Date
  exitTime?: Date
  fee?: number
}

Without ParkingSession, there's no way to know which vehicle is in which spot, or calculate accurate fees based on actual duration.`,
      interviewQuestion: 'How do you know which aspect of your LLD skills to improve next?',
      interviewAnswer: `Look at which follow-up questions break your design.

If adding a new type always requires modifying an existing class → extensibility and OCP need work.
If you can't explain why you made a decision → verbal reasoning and PDTB need practice.
If you can't identify all entities → entity identification needs practice.
If you run out of time → design speed and time management.

The debrief should tell you specifically: "This design broke when the interviewer added surge pricing. Why? Because PricingService had hardcoded rates. Next practice: design something with variable pricing from the start."

Targeted practice beats random practice every time.`,
      followUp: 'What is the most common single weakness in LLD candidates?',
      followUpAnswer: `Extensibility. Specifically: designing for exactly one scenario and not building in room for change.

Candidates often design a parking lot that works perfectly for flat-rate, single-vehicle-type, single-entry-gate scenarios. Then the first follow-up breaks it.

The fix: always ask yourself after the initial design: "What are the 3 most likely changes to this system? Have I left room for them?"

For a parking lot: pricing variation, vehicle type variation, spot type variation. Build Strategy/Interface extension points for each of these before the follow-up arrives.

Anticipate extension. Don't wait for the follow-up to realize you need it.`,
    },
    difficultyDimensions: { oop: 'medium', solid: 'medium', patterns: 'medium', extensibility: 'medium', requirementAmbiguity: 'medium' },
    buildsSkills: ['designThinking', 'tradeoffReasoning', 'designSpeed'],
    prerequisites: ['interview-simulation'],
    interviewerProbes: ['What would you change about this design?', 'What was your weakest area today?', 'What patterns did you miss?'],
    commonMistakes: ['Not reviewing practice sessions', 'Continuing to make the same mistakes', 'Only identifying strengths during debrief'],
    patternMapSteps: [
      { label: 'Correctness check', description: 'Can all user flows be executed?' },
      { label: 'Extensibility check', description: 'Where would follow-ups break this design?' },
      { label: 'Clarity check', description: 'Is every class responsibility clear?' },
      { label: 'Communication check', description: 'Did I explain decisions with PDTB?' },
    ],
    tags: ['interview-skills', 'self-review', 'improvement'], status: 'published',
  },
]

async function main() {
  await connectDB()
  await JourneyTopic.deleteMany({})
  await JourneyTopic.insertMany(topics)
  console.log(`Seeded ${topics.length} journey topics`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
