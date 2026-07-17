// ─── Draft Notation syntax reference — shared between /docs and the in-app
//     Playground syntax-guide panel, so the two never drift apart. ────────────

export const STEPS = [
  {
    n: '01',
    mono: 'Nothing to configure',
    title: 'Name a class',
    desc: 'Any word on its own line becomes a class. No keyword, no boilerplate.',
  },
  {
    n: '02',
    mono: 'knows / can',
    title: 'Give it fields & methods',
    desc: `Write "ClassName knows ..." for fields and "ClassName can ..." for methods.`,
  },
  {
    n: '03',
    mono: 'Plain-English verbs',
    title: 'Connect classes',
    desc: `Write a sentence like "User has many Post" — the verb decides the arrow.`,
  },
  {
    n: '04',
    mono: 'Instant',
    title: 'Watch it render',
    desc: 'Paste it into the Playground and the canvas builds itself.',
  },
]

export const EXAMPLES = [
  {
    title: 'E-Commerce System',
    code: `User
User knows id, name: String, email: String
User can login(), getOrders(): Order[]

Order
Order knows id, total: number, status: OrderStatus
Order can place(), cancel()

OrderItem
OrderItem knows productId, quantity: int, price: number

Product
Product knows id, name: String, price: number
Product can isAvailable(): boolean

enum OrderStatus
  PENDING, CONFIRMED, SHIPPED, DELIVERED

User has many Order
Order owns OrderItem
Order has many Product
`,
  },
  {
    title: 'Observer Pattern',
    code: `interface Observer
Observer can update(event: Event)

interface Subject
Subject can subscribe(o: Observer), unsubscribe(o: Observer), notify()

EventBus
EventBus knows - listeners: List
EventBus can subscribe(o: Observer), unsubscribe(o: Observer), notify()

ClickListener
EmailNotifier

EventBus acts as Subject
ClickListener acts as Observer
EmailNotifier acts as Observer
EventBus has many Observer
`,
  },
  {
    title: 'Banking App',
    code: `abstract Account
Account knows accountNumber: String, balance: number
Account can deposit(amount: number), abstract withdraw(amount: number), getBalance(): number

SavingsAccount
CheckingAccount
LoanAccount

SavingsAccount is a Account
CheckingAccount is a Account
LoanAccount is a Account

Customer
Customer knows id, name: String, age: int
Customer can openAccount(): Account, closeAccount()

Bank
Bank owns Customer
Bank has many Account

interface Auditable
Auditable can getAuditLog(): Log[]

Account acts as Auditable
`,
  },
]

export const KEYWORDS = [
  { kw: 'class',     desc: 'Declare a class — the default, rarely written explicitly' },
  { kw: 'interface', desc: 'Declare an interface (renders with the «interface» stereotype)' },
  { kw: 'abstract',  desc: 'Declare an abstract class' },
  { kw: 'enum',      desc: 'Declare an enum type' },
  { kw: 'note',      desc: 'Add a free-text sticky note to the canvas' },
]

export const VISIBILITY = [
  { symbol: '(none)', name: 'Public',    plain: 'Anyone can see or call it — the default.' },
  { symbol: '-',       name: 'Private',   plain: 'Only this class can see it.' },
  { symbol: '#',       name: 'Protected', plain: 'This class and anything that extends it.' },
  { symbol: '~',       name: 'Package',   plain: 'Only classes in the same module/area.' },
]

export const RELATIONS = [
  {
    verb: 'is a', uml: 'Inheritance',
    plain: 'A stronger, more specific version of the parent. A Dog is a kind of Animal — it gets everything Animal has, plus its own stuff.',
    example: 'Dog is a Animal',
  },
  {
    verb: 'acts as', uml: 'Realization',
    plain: 'Promises to follow a contract. A Dog acts as Trainable — it must implement whatever Trainable requires, without inheriting behaviour from it.',
    example: 'Dog acts as Pet, Trainable',
  },
  {
    verb: 'owns', uml: 'Composition',
    plain: 'Strong, exclusive ownership — the part can\'t exist without the whole. Delete the Order and its OrderItems go with it.',
    example: 'Order owns OrderItem',
  },
  {
    verb: 'has many', uml: 'Aggregation (1 → *)',
    plain: 'A loose "contains" relationship — the parts can outlive the whole. A User has many Post, but deleting the user needn\'t delete the posts.',
    example: 'User has many Post',
  },
  {
    verb: 'has one', uml: 'Aggregation (1 → 1)',
    plain: 'Same idea as "has many", just capped at one — a single optional attachment.',
    example: 'User has one Profile',
  },
  {
    verb: 'has', uml: 'Aggregation (generic)',
    plain: 'A generic "contains" relationship when you don\'t need to specify the count.',
    example: 'Company has Employee',
  },
  {
    verb: 'uses', uml: 'Dependency',
    plain: 'A light, temporary reliance — one class calls another but doesn\'t hold a lasting reference to it.',
    example: 'Service uses Logger',
  },
  {
    verb: 'talks to', uml: 'Bidirectional association',
    plain: 'Two classes both know about and call each other.',
    example: 'Client talks to Server',
  },
  {
    verb: 'knows about', uml: 'Directed association',
    plain: 'A one-way reference — A knows about B, but B has no idea A exists.',
    example: 'Teacher knows about Student',
  },
]

export const TIPS = [
  { title: 'Comments', body: 'Start a line with # to write a comment. Great for sections or notes.', code: '# Payment domain\nPaymentGateway' },
  { title: 'Multiple targets', body: 'Comma-separate targets after any verb — applies to all of them.', code: 'Service uses Logger, Database, Cache' },
  { title: 'Inline enum values', body: 'List enum values after the name, or on the next line.', code: 'enum Color RED, GREEN, BLUE' },
  { title: 'Static & abstract', body: 'Prefix with $ for static, or write abstract inside can …', code: 'Account can $ getInstance(): Account, abstract withdraw()' },
]
