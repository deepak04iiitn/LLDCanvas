/**
 * npx ts-node -r dotenv/config src/scripts/seed-revision-notes.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { RevisionNote } from '../models/revision-note.model'

const NOTES = [
  // ══════════════════════════════════════════════════════
  // CATEGORY: Design Patterns — Creational
  // ══════════════════════════════════════════════════════
  {
    slug: 'singleton-pattern',
    title: 'Singleton Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 1,
    summary: 'Ensures a class has only one instance throughout the entire application and provides a global point of access to it.',
    keyPoints: [
      'The whole idea of Singleton is that you want exactly one object of a class to exist — no more, no less. For example, your app should have one database connection pool, one logger, or one configuration manager. Creating multiple would waste resources or cause inconsistency.',
      'To enforce this, you make the constructor private so nobody outside the class can call "new MyClass()". Instead, you provide a static method like getInstance() that either creates the one instance on the first call or just returns the already-created one on every call after that.',
      'Lazy initialization means you only create the instance when it is first asked for, not when the program starts. This is good because you avoid allocating heavy resources until they are actually needed.',
      'In multi-threaded environments, two threads might both check "is the instance null?" at the same time, both see null, and both try to create the object — ending up with two instances. To prevent this, you use double-checked locking or make the initialization synchronized.',
      'Singleton is heavily used in: logging frameworks (one global logger), config managers (one source of truth for settings), thread pools, and caches. The downside is it can make unit testing hard since it carries global state between tests.',
    ],
    analogy: 'Think of the President of a country. There is always exactly one President at a time. Everyone who wants to talk to the President goes through the same office — they don\'t create a new President each time.',
    codeHint: `class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private constructor() { /* expensive setup */ }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}`,
    tags: ['creational', 'singleton', 'instance'],
  },
  {
    slug: 'factory-pattern',
    title: 'Factory Method Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 2,
    summary: 'Defines an interface for creating objects but lets subclasses or implementations decide which class to instantiate.',
    keyPoints: [
      'The problem Factory solves: imagine you have code that needs to create different types of objects (like Circle, Square, Triangle) based on some condition. Without Factory, you end up with huge if-else or switch-case blocks spread everywhere in your code. Every time you add a new shape, you have to find and update all those places.',
      'Factory centralizes all object creation in one place. You call ShapeFactory.create("circle") and the factory figures out which class to instantiate. Your calling code doesn\'t need to know anything about Circle, Square, or how they are constructed.',
      'This follows the Open-Closed Principle: when you need to add a new shape like Pentagon, you just add a new class and register it with the factory. The rest of your code doesn\'t change at all — it is open for extension but closed for modification.',
      'Simple Factory is not a GoF pattern but is widely used — it is just a class with a static method that returns different objects. Factory Method (proper GoF pattern) goes further: it defines an abstract "createProduct()" method that each subclass overrides to return its own product type.',
      'Abstract Factory is a step above — it creates families of related objects. For example, a MacOSFactory creates MacOS buttons, checkboxes, and scrollbars, while WindowsFactory creates Windows-styled versions of all three. The client code works with the abstract factory interface and doesn\'t know which OS it is running on.',
    ],
    analogy: 'Think of a restaurant kitchen. You (the client) say "I want a pizza" and the kitchen (factory) decides which chef to call and how to make it. You don\'t go into the kitchen and mix dough yourself — you just order and the factory produces the result.',
    codeHint: `interface Shape { draw(): void; }
class Circle implements Shape { draw() { console.log('Drawing circle'); } }
class Square implements Shape { draw() { console.log('Drawing square'); } }

class ShapeFactory {
  static create(type: string): Shape {
    if (type === 'circle') return new Circle();
    if (type === 'square') return new Square();
    throw new Error('Unknown shape');
  }
}`,
    tags: ['creational', 'factory', 'object creation'],
  },
  {
    slug: 'builder-pattern',
    title: 'Builder Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 3,
    summary: 'Separates the construction of a complex object from its representation, letting you build objects step by step.',
    keyPoints: [
      'The problem: some objects are complex and need many configuration options — like a Pizza with crust type, size, sauce, toppings, extra cheese, etc. If you put all this in a constructor you end up with a method that takes 10 parameters. Half of them are optional and callers have to pass null or undefined for everything they don\'t want, which is very error-prone.',
      'Builder solves this with a fluent chain of method calls. You create a Builder object and call methods like .setCrust("thin").addTopping("mushrooms").setSize("large").build(). Each method sets one property and returns the same builder so you can keep chaining. The final build() call actually constructs the object.',
      'The Builder pattern makes it impossible to create an invalid object. The build() method can validate that all required fields are set before constructing — if something mandatory is missing, it throws a clear error rather than creating a half-initialized object.',
      'Director class (optional): you can create a Director that knows how to build common configurations. For example, VeggieDirector.build(builder) calls all the right methods in the right order to build a veggie pizza. This lets you reuse complex construction sequences without duplicating the steps.',
      'In Java, Lombok\'s @Builder annotation auto-generates this pattern. In JavaScript, it\'s common in test data factories, query builders (like Knex or TypeORM QueryBuilder), and HTTP request builders.',
    ],
    analogy: 'Building a custom PC: you go to a configurator and select your CPU, RAM, storage, and GPU one by one. Each selection is like a builder method call. Finally you click "Build" and get your configured machine. You don\'t have to fill in everything at once in a confusing form.',
    codeHint: `class Pizza {
  constructor(public crust: string, public size: string, public toppings: string[]) {}
}
class PizzaBuilder {
  private crust = 'thin'; private size = 'M'; private toppings: string[] = [];
  setCrust(c: string) { this.crust = c; return this; }
  setSize(s: string)  { this.size = s;  return this; }
  addTopping(t: string){ this.toppings.push(t); return this; }
  build() { return new Pizza(this.crust, this.size, this.toppings); }
}
const pizza = new PizzaBuilder().setCrust('thick').setSize('L').addTopping('cheese').build();`,
    tags: ['creational', 'builder', 'fluent'],
  },
  {
    slug: 'prototype-pattern',
    title: 'Prototype Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 4,
    summary: 'Creates new objects by copying (cloning) an existing object, avoiding the overhead of creating from scratch.',
    keyPoints: [
      'When object creation is expensive — maybe it hits a database, calls an API, or does heavy computation — you don\'t want to repeat that cost every time you need a similar object. The Prototype pattern says: create the object once, then clone it whenever you need another one.',
      'Every prototype object implements a clone() method that returns a copy of itself. The clone skips all the expensive initialization and just duplicates the current state of the object. This is much faster than constructing from scratch.',
      'There is an important difference between shallow copy and deep copy. Shallow copy duplicates the object but shares references to nested objects — if the clone modifies a nested list, the original is affected too. Deep copy duplicates everything recursively. Always think about which one you need.',
      'JavaScript uses prototypal inheritance natively — every object has a prototype chain. Object.create(proto) literally creates a new object that inherits from an existing one, which is the Prototype pattern at the language level.',
      'Real-world uses: spawning game enemies (clone a template enemy instead of re-loading all assets), duplicating complex document templates (clone the base template then customize it), or creating test fixtures (clone a base user object then tweak specific fields).',
    ],
    analogy: 'Like a photocopier: instead of rewriting an entire 50-page document from scratch, you put the original on the copier and get as many copies as you need instantly. Each copy is independent — writing on one doesn\'t affect the others.',
    codeHint: `interface Cloneable { clone(): this; }
class Enemy implements Cloneable {
  constructor(public type: string, public hp: number, public skills: string[]) {}
  clone(): this {
    const copy = Object.create(Object.getPrototypeOf(this));
    copy.type = this.type; copy.hp = this.hp;
    copy.skills = [...this.skills]; // deep copy the array
    return copy;
  }
}`,
    tags: ['creational', 'clone', 'copy'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: Design Patterns — Structural
  // ══════════════════════════════════════════════════════
  {
    slug: 'adapter-pattern',
    title: 'Adapter Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 5,
    summary: 'Converts the interface of one class into the interface another class expects, making incompatible interfaces work together.',
    keyPoints: [
      'The problem: you have code that uses an interface (e.g., it calls .read() and .write()) but the library or service you want to use has a completely different interface (e.g., .fetch() and .push()). You can\'t change either side — maybe it\'s a third-party library or legacy code.',
      'The Adapter sits in the middle. It implements the interface your code expects, but internally it calls the methods of the incompatible class. Your code talks to the Adapter using its familiar interface, and the Adapter translates every call to what the real class understands.',
      'Class Adapter uses inheritance to adapt: it extends the existing class and implements the target interface. Object Adapter uses composition: it holds an instance of the existing class and delegates to it. Object Adapter is generally preferred because it doesn\'t lock you into the class hierarchy.',
      'The Adapter pattern is extremely common in the real world whenever you integrate with external APIs, legacy systems, or third-party libraries. Instead of rewriting your whole codebase to match the external interface, you write one small adapter and everything else stays the same.',
      'Think of it as a translation layer. Adapters appear everywhere: in database drivers (your code uses a generic interface, the driver adapts it to the specific database\'s protocol), in payment gateways (your code uses a unified PaymentProcessor interface, adapters exist for Stripe, PayPal, Razorpay).',
    ],
    analogy: 'Like a travel power adapter. Your laptop has a US two-pin plug, but the hotel wall socket in Europe is different. The adapter is a small piece that goes between them — your laptop is unchanged, the wall is unchanged, and the adapter makes them compatible.',
    codeHint: `// Old class with incompatible interface
class LegacyLogger { log(msg: string) { console.log('[LEGACY]', msg); } }

// Target interface your code uses
interface ILogger { info(msg: string): void; }

// Adapter bridges the gap
class LoggerAdapter implements ILogger {
  constructor(private legacy: LegacyLogger) {}
  info(msg: string) { this.legacy.log(msg); } // translate info() → log()
}`,
    tags: ['structural', 'adapter', 'compatibility'],
  },
  {
    slug: 'decorator-pattern',
    title: 'Decorator Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 6,
    summary: 'Wraps an object to add new behaviors dynamically at runtime without modifying the original class or creating a huge number of subclasses.',
    keyPoints: [
      'The problem: you want to add optional features to an object. With inheritance you\'d create subclasses for every combination: PlainCoffee, CoffeeWithMilk, CoffeeWithSugar, CoffeeWithMilkAndSugar, CoffeeWithVanilla... this explodes combinatorially. The Decorator pattern avoids this entirely.',
      'A Decorator wraps the original object. It implements the same interface so it can stand in anywhere the original is used. When a method is called on the decorator, it runs some extra logic and then delegates to the wrapped object. You can stack multiple decorators on top of each other.',
      'The order of decorators matters. If you wrap a Coffee with MilkDecorator then SugarDecorator, the result is "coffee with milk with sugar". Each layer adds its piece and then calls the inner layer\'s method.',
      'Decorators vs Inheritance: inheritance is static (decided at compile time), while decoration is dynamic (decided at runtime). You can add or remove decorators based on configuration or user input, which is impossible with pure inheritance.',
      'Real uses: Java I/O streams (BufferedInputStream wraps FileInputStream to add buffering, GZIPInputStream wraps that to add compression — all stacked decorators), middleware in Express.js (each middleware wraps the request/response with extra behavior), Python\'s @decorator syntax.',
    ],
    analogy: 'Think of dressing up for different weather. You start with your base outfit (the original object). Cold outside? Wrap a jacket on top (Decorator 1). Raining? Add a raincoat on top of that (Decorator 2). You\'re still you underneath — just with extra layers added dynamically.',
    codeHint: `interface Coffee { cost(): number; description(): string; }
class SimpleCoffee implements Coffee {
  cost() { return 30; } description() { return 'Coffee'; }
}
class MilkDecorator implements Coffee {
  constructor(private c: Coffee) {}
  cost() { return this.c.cost() + 10; }
  description() { return this.c.description() + ' + Milk'; }
}
// Usage: new MilkDecorator(new SugarDecorator(new SimpleCoffee()))`,
    tags: ['structural', 'decorator', 'wrapper'],
  },
  {
    slug: 'facade-pattern',
    title: 'Facade Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 7,
    summary: 'Provides a simplified interface to a complex subsystem, hiding all the internal complexity behind a single easy-to-use class.',
    keyPoints: [
      'Some systems are internally complex — they have many classes that need to be used in the right order with the right parameters. Every time you want to use such a system, you need to understand all that internal complexity. The Facade hides all of it behind one simple interface.',
      'The Facade class knows about all the internal components and how to coordinate them. The client code only talks to the Facade. If the internal system changes or is refactored, only the Facade needs to be updated — the client code is completely shielded from those changes.',
      'Facade is about simplification, not restriction. The internal subsystem classes are still available if advanced users need them. The Facade is just a convenient shortcut for the most common use cases.',
      'This is one of the most widely used patterns in large codebases. Any time you create a "service" class that coordinates several repositories, validators, and external calls behind a single method — that is a Facade.',
      'Difference from Adapter: Adapter makes two incompatible interfaces work together (it\'s about compatibility). Facade simplifies a complex interface (it\'s about usability). Both wrap other objects, but their goals are different.',
    ],
    analogy: 'The front desk at a hotel is a Facade. To check in, the front desk internally coordinates housekeeping (is the room clean?), the room allocation system (which room is free?), the billing system (set up your payment), and the key card system (program your key). You just say "I\'d like to check in" and the front desk handles all the complexity.',
    codeHint: `// Complex subsystem
class CPU { startup() { console.log('CPU starting'); } }
class Memory { load() { console.log('Loading memory'); } }
class HardDrive { read() { console.log('Reading disk'); } }

// Facade — simple interface
class ComputerFacade {
  private cpu = new CPU(); private mem = new Memory(); private hd = new HardDrive();
  start() { this.cpu.startup(); this.mem.load(); this.hd.read(); }
}
new ComputerFacade().start(); // Client needs to know nothing about internals`,
    tags: ['structural', 'facade', 'simplification'],
  },
  {
    slug: 'proxy-pattern',
    title: 'Proxy Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 8,
    summary: 'Provides a substitute or placeholder for another object to control access to it, add caching, or add logging without changing the real object.',
    keyPoints: [
      'A Proxy sits in front of a real object and intercepts all calls to it. From the outside, the proxy looks identical to the real object (it implements the same interface). But before or after delegating to the real object, it can do extra things.',
      'Virtual Proxy (Lazy Loading): the real object is expensive to create (e.g., loading a huge image from disk). The proxy creates a lightweight placeholder that only loads the real object when it is actually needed. Until then, it shows a spinner or placeholder.',
      'Protection Proxy: controls who can access the real object. Before delegating a call, it checks permissions. If the user doesn\'t have the right role, it throws an exception or returns a permission denied response without even touching the real object.',
      'Caching Proxy: stores results of expensive calls. First time a method is called, the proxy lets the call through to the real object and caches the result. Next time, it returns the cached result immediately without hitting the real object at all.',
      'Remote Proxy: the real object lives on a different server. The proxy represents it locally and handles all the network communication — serializing parameters, sending the request, receiving the response, and returning the result as if it were a local call.',
    ],
    analogy: 'Like a celebrity\'s manager. When someone wants to book the celebrity, they go through the manager (proxy). The manager checks if the client can afford it, checks the schedule, and handles all communication. The celebrity (real object) only deals with the actual performance.',
    codeHint: `interface DataService { fetchData(id: string): string; }
class RealDataService implements DataService {
  fetchData(id: string) { return \`Data for \${id}\`; } // expensive DB call
}
class CachingProxy implements DataService {
  private cache = new Map<string, string>();
  constructor(private real: RealDataService) {}
  fetchData(id: string) {
    if (!this.cache.has(id)) this.cache.set(id, this.real.fetchData(id));
    return this.cache.get(id)!;
  }
}`,
    tags: ['structural', 'proxy', 'caching', 'access control'],
  },
  {
    slug: 'composite-pattern',
    title: 'Composite Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 9,
    summary: 'Composes objects into tree structures and lets you treat individual objects and groups of objects uniformly through the same interface.',
    keyPoints: [
      'The pattern models a part-whole hierarchy. Some things are individual (a file), and some are containers that can hold both individual items and other containers (a folder). The Composite pattern lets you treat files and folders the same way — you can call size() on both, and the folder recursively sums up all its children.',
      'The key is a common Component interface. Both Leaf (individual item) and Composite (container) implement this interface. Client code works with the interface and doesn\'t need to know if it\'s dealing with a single item or a nested group of items.',
      'When you call an operation on a Composite, it typically iterates over all its children and calls the same operation on each one. Each child might be another Composite, so this naturally becomes recursive — the tree evaluates itself depth-first.',
      'This is how file systems, UI component trees (React\'s component tree is literally a composite), org charts, menus (a menu item can be a leaf or a sub-menu containing more items), and XML/HTML DOM work.',
      'The benefit is simplicity for the client. Your rendering code calls render() on the root component, and whether it\'s a single button or a complex form with 50 nested components, it works the same way. You don\'t need special handling for containers vs leaves.',
    ],
    analogy: 'A company org chart: you can ask any node "how many people are under you?" A leaf node (individual employee) returns 1. A manager returns 1 + the count of everyone under their reports. A division head returns 1 + every manager\'s count. Same question, same interface, but handled recursively by the composite structure.',
    codeHint: `interface FileSystemItem { size(): number; print(indent?: string): void; }
class File implements FileSystemItem {
  constructor(private name: string, private bytes: number) {}
  size() { return this.bytes; }
  print(i = '') { console.log(i + this.name); }
}
class Folder implements FileSystemItem {
  private children: FileSystemItem[] = [];
  add(item: FileSystemItem) { this.children.push(item); }
  size() { return this.children.reduce((s, c) => s + c.size(), 0); }
  print(i = '') { this.children.forEach(c => c.print(i + '  ')); }
}`,
    tags: ['structural', 'composite', 'tree', 'recursive'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: Design Patterns — Behavioral
  // ══════════════════════════════════════════════════════
  {
    slug: 'strategy-pattern',
    title: 'Strategy Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 10,
    summary: 'Defines a family of interchangeable algorithms and lets you swap them at runtime without changing the code that uses them.',
    keyPoints: [
      'The problem this solves: you have a class that does something in multiple ways depending on a condition. For example, a payment processor that handles Stripe, PayPal, and UPI differently. Without Strategy, you get a giant if/else or switch block inside the class. Every time you add a new payment method, you modify the class — violating the Open-Closed Principle.',
      'Strategy extracts each variation into its own class. All strategy classes implement the same interface (like PaymentStrategy with a pay(amount) method). The context class (PaymentProcessor) holds a reference to a strategy object and delegates to it. You can swap strategies at any time — just set a different one.',
      'The context class doesn\'t know anything about the specific strategy — it only knows the interface. This means it\'s completely decoupled from the implementation details of each payment method, sorting algorithm, or compression format.',
      'Runtime switching is the superpower: you can change the strategy based on user input, configuration, or environment without touching the context class. A/B testing different recommendation algorithms? Swap strategies. Switching from bubble sort to quicksort based on data size? Swap strategies.',
      'Common real-world uses: fee calculators (different rules per vehicle type in parking lots), sorting (different algorithms for different data sizes), routing (fastest vs shortest in maps), authentication (JWT vs session vs OAuth), and compression (gzip vs brotli).',
    ],
    analogy: 'Think of navigation apps. You pick a strategy: "Fastest Route", "Avoid Tolls", or "Walking". The navigation engine (context) uses whichever strategy you selected. You can switch strategies mid-journey and the engine adapts without being rewritten.',
    codeHint: `interface SortStrategy { sort(data: number[]): number[]; }
class BubbleSort implements SortStrategy {
  sort(data: number[]) { /* bubble sort */ return data; }
}
class QuickSort implements SortStrategy {
  sort(data: number[]) { /* quicksort */ return data; }
}
class Sorter {
  constructor(private strategy: SortStrategy) {}
  setStrategy(s: SortStrategy) { this.strategy = s; }
  sort(data: number[]) { return this.strategy.sort(data); }
}`,
    tags: ['behavioral', 'strategy', 'algorithm'],
  },
  {
    slug: 'observer-pattern',
    title: 'Observer Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 11,
    summary: 'Defines a one-to-many dependency so when one object (subject) changes state, all its dependents (observers) are notified automatically.',
    keyPoints: [
      'The problem: one object changes and several other objects need to react. Without Observer, the subject would need to know about every dependent and call them directly — tight coupling that gets messy fast. Adding a new dependent means modifying the subject.',
      'Observer decouples this: the subject maintains a list of observers. Observers register themselves (subscribe) when interested and deregister (unsubscribe) when done. The subject never knows the specific types of its observers — it just calls notify() and each observer handles its own reaction.',
      'The Subject (also called Publisher or Observable) has three key responsibilities: register an observer (subscribe), remove an observer (unsubscribe), and notify all registered observers when state changes.',
      'Each Observer implements an update(data) method. When the subject calls notify(), it loops through all registered observers and calls update() on each one. The observer then reads the new state and reacts — updating the UI, triggering an action, etc.',
      'This is one of the most widely used patterns: it\'s the foundation of event systems, UI frameworks (React state → re-render), MVC (model notifies views), message queues, and WebSocket event handling. JavaScript\'s EventEmitter and addEventListener are Observer pattern implementations.',
    ],
    analogy: 'Like subscribing to a YouTube channel. You (observer) click Subscribe on a channel (subject). When the channel uploads a video (state change), YouTube notifies all subscribers automatically. You can Unsubscribe any time. The creator doesn\'t personally know or contact each subscriber — it all goes through the platform\'s notification system.',
    codeHint: `interface Observer { update(data: unknown): void; }
class EventBus {
  private observers: Observer[] = [];
  subscribe(o: Observer)   { this.observers.push(o); }
  unsubscribe(o: Observer) { this.observers = this.observers.filter(x => x !== o); }
  notify(data: unknown)    { this.observers.forEach(o => o.update(data)); }
}
class EmailAlert implements Observer {
  update(data: unknown) { console.log('Sending email:', data); }
}`,
    tags: ['behavioral', 'observer', 'event', 'pub-sub'],
  },
  {
    slug: 'command-pattern',
    title: 'Command Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 12,
    summary: 'Encapsulates a request as an object, letting you parameterize operations, queue them, log them, or support undo/redo.',
    keyPoints: [
      'The Command pattern turns a request or action into a standalone object. Instead of calling myLight.turnOn() directly, you create a TurnOnCommand object and execute it. This might sound like extra work, but the payoff is huge flexibility.',
      'Because commands are objects, you can queue them (execute later), log them (replay what happened), serialize them (send over network), and most powerfully — undo them. Each command has both execute() and undo() methods.',
      'Undo/Redo is the killer use case. Text editors (Ctrl+Z), graphics tools, game action histories, and database transaction logs all use Command. When you execute a command, you push it onto a history stack. When the user presses Undo, you pop the last command and call undo() on it.',
      'The pattern separates who issues the command (invoker), what the command does (command object), and what object it operates on (receiver). The button in your UI is the invoker; the copy-paste logic is the command; the document is the receiver. None of them need to know about each other.',
      'Macro commands (Composite Commands): you can create a command that is actually a list of other commands. Execute the macro command and all sub-commands run in sequence. Undo the macro and they all reverse in reverse order.',
    ],
    analogy: 'Like a TV remote. Each button on the remote (invoker) sends a specific command — TurnOn, VolumeUp, ChangeChannel. The remote doesn\'t know how the TV works internally; it just sends commands. You could even record a sequence of button presses (macro) and replay it. If there were an undo button, it would undo the last command.',
    codeHint: `interface Command { execute(): void; undo(): void; }
class Light { turnOn() { console.log('ON'); } turnOff() { console.log('OFF'); } }

class TurnOnCommand implements Command {
  constructor(private light: Light) {}
  execute() { this.light.turnOn(); }
  undo()    { this.light.turnOff(); }
}
class RemoteControl {
  private history: Command[] = [];
  press(cmd: Command) { cmd.execute(); this.history.push(cmd); }
  undoLast() { this.history.pop()?.undo(); }
}`,
    tags: ['behavioral', 'command', 'undo', 'queue'],
  },
  {
    slug: 'chain-of-responsibility',
    title: 'Chain of Responsibility',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 13,
    summary: 'Passes a request along a chain of handlers; each handler either processes it or passes it to the next one in the chain.',
    keyPoints: [
      'The problem: a request might need to go through multiple checks or steps, but you don\'t want the sender to know about all of them. For example, an HTTP request might need authentication, then rate limiting, then input validation, then permission checks — all before reaching the actual handler.',
      'Each handler in the chain knows only about the next handler, not the whole chain. Each one decides: can I handle this? If yes, I process it (and optionally pass it on). If no, I pass it to the next handler unchanged.',
      'Handlers can stop the chain early. A rate-limiter handler that detects too many requests returns a 429 immediately and never calls the next handler. An auth handler that finds an invalid token returns 401 and stops. This short-circuit behavior is key.',
      'The chain is very flexible — handlers can be added, removed, or reordered at runtime without changing any other handler. This makes it great for middleware pipelines where you want to plug in new behaviors easily.',
      'Real-world uses: Express.js middleware chain (each middleware calls next()), Java Servlet filters, ATM cash dispensing (try $100 bills → if not enough, try $50 → try $20 → try $10), log level filtering (DEBUG handler → INFO handler → ERROR handler), and event bubbling in the DOM.',
    ],
    analogy: 'Customer support escalation. You call a helpline. The first agent (Level 1 support) handles simple questions. If they can\'t solve it, they pass you to Level 2 support. Level 2 passes to Level 3 specialist if needed. Each handler processes what it can and escalates the rest.',
    codeHint: `abstract class Handler {
  protected next: Handler | null = null;
  setNext(h: Handler) { this.next = h; return h; }
  abstract handle(request: number): string | null;
}
class LowLevelSupport extends Handler {
  handle(req: number) {
    if (req < 100) return 'Resolved by Level 1';
    return this.next?.handle(req) ?? 'Unresolved';
  }
}`,
    tags: ['behavioral', 'chain', 'middleware', 'pipeline'],
  },
  {
    slug: 'state-pattern',
    title: 'State Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 14,
    summary: 'Allows an object to change its behavior when its internal state changes — the object appears to change its class.',
    keyPoints: [
      'Some objects behave very differently depending on their current state. A vending machine in the Idle state does nothing when you press a product button. But in the HasMoney state, the same button dispenses the product. Without State pattern, you end up with lots of if (currentState == "idle") else if (currentState == "hasMoney") blocks everywhere.',
      'State pattern extracts each state into its own class. Each state class knows how to handle all the inputs that are valid in that state. The context object delegates every action to its current state object. Transitioning to a new state is just swapping the state object.',
      'The context object holds a reference to the current state. When a method is called on the context (like insertCoin()), the context calls insertCoin() on the current state object. The state decides what happens: update context data and possibly transition to a new state.',
      'This completely eliminates large conditional blocks. Adding a new state means adding a new class and updating the transitions — existing states don\'t change. It makes state machines easy to read, understand, and extend.',
      'Where it\'s used: vending machines, ATMs, traffic lights, order management (Placed → Shipped → Delivered → Returned), document workflows (Draft → Review → Published), and game character states (Idle → Running → Jumping → Attacking).',
    ],
    analogy: 'A traffic light. It can be Red, Yellow, or Green. The behavior when a car arrives is completely different for each color. Instead of one TrafficLight class with big if/else blocks, each color is a State that knows how to behave and when to transition to the next.',
    codeHint: `interface State { handle(context: TrafficLight): void; }
class GreenState implements State {
  handle(ctx: TrafficLight) { console.log('Green - go!'); ctx.setState(new YellowState()); }
}
class YellowState implements State {
  handle(ctx: TrafficLight) { console.log('Yellow - slow!'); ctx.setState(new RedState()); }
}
class TrafficLight {
  private state: State = new GreenState();
  setState(s: State) { this.state = s; }
  change() { this.state.handle(this); }
}`,
    tags: ['behavioral', 'state', 'state machine'],
  },
  {
    slug: 'template-method-pattern',
    title: 'Template Method Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 15,
    summary: 'Defines the skeleton of an algorithm in a base class but lets subclasses override specific steps without changing the overall structure.',
    keyPoints: [
      'Some algorithms have a fixed overall structure but vary in some steps. For example, making tea and making coffee both involve: boil water, brew the drink, pour in cup, add condiments. The steps are the same but how you brew and what condiments you add are different.',
      'Template Method puts the fixed skeleton in an abstract base class as a final method. The steps that vary are declared as abstract (or overridable) methods. Subclasses fill in just those variable steps without touching the overall flow.',
      'The Hollywood Principle is at play here: "Don\'t call us, we\'ll call you." The base class controls the flow and calls the subclass methods at the right time. The subclass doesn\'t decide when its methods run — the template method decides that.',
      'Hooks are an optional variation: some steps in the template can have a default (empty) implementation in the base class. Subclasses can override them if they need to, but don\'t have to. This gives more flexibility than fully abstract methods.',
      'Common uses: data processing pipelines (parse → validate → transform → save), game AI (turn taking with different strategies per AI), web frameworks (request → middleware → route handler → response), and report generation (fetch data → format → export).',
    ],
    analogy: 'Like a recipe. The recipe gives you the steps in order: preheat oven → prepare batter → pour in pan → bake → frost. The overall template is fixed. But the specific cake you make is determined by which batter and frosting recipe you use — the subclass fills in those details.',
    codeHint: `abstract class DataMigration {
  // Template method — fixed skeleton
  run() { this.extract(); this.transform(); this.load(); this.notify(); }
  abstract extract(): void;
  abstract transform(): void;
  abstract load(): void;
  notify() { console.log('Migration complete'); } // hook with default
}
class UserMigration extends DataMigration {
  extract()   { console.log('Fetching users from old DB'); }
  transform() { console.log('Converting user format'); }
  load()      { console.log('Inserting into new DB'); }
}`,
    tags: ['behavioral', 'template', 'inheritance', 'algorithm'],
  },
  {
    slug: 'iterator-pattern',
    title: 'Iterator Pattern',
    category: 'Design Patterns',
    difficulty: 'basic',
    order: 16,
    summary: 'Provides a standard way to traverse elements of a collection without exposing its internal structure.',
    keyPoints: [
      'The problem: different collections store data differently — arrays use indices, linked lists use pointers, trees use nodes, graphs use adjacency lists. If traversal logic is inside each collection, every consumer needs to know the internals. If traversal is in the consumer, you have to rewrite it for every collection type.',
      'Iterator standardizes traversal. Each collection provides an Iterator object with just two methods: hasNext() (is there another element?) and next() (give me the next element). Consumers only use these two methods — they don\'t care if the collection is an array, a tree, or a database cursor.',
      'The collection itself implements an Iterable interface with a getIterator() method that returns a fresh iterator. This means you can have multiple iterators running on the same collection simultaneously, each tracking its own position independently.',
      'In modern languages, iterators are built in. JavaScript\'s for...of loop works with any object that implements Symbol.iterator. Python\'s for loops work with any object that has __iter__ and __next__. Java\'s for-each loop works with anything implementing Iterable.',
      'Custom iterators are powerful: you can create iterators that traverse a tree in-order, pre-order, or level-order without changing the tree class. You can create a FilterIterator that skips elements not matching a predicate. You can create a ReverseIterator for any collection.',
    ],
    analogy: 'Like a music playlist player. No matter if you\'re playing a Spotify playlist, a local folder, or a radio station, you use the same controls: Next track, Previous track. The player doesn\'t care how the underlying collection stores songs — it just uses the iterator.',
    codeHint: `class NumberRange {
  private nums: number[];
  constructor(start: number, end: number) {
    this.nums = Array.from({length: end - start + 1}, (_, i) => start + i);
  }
  [Symbol.iterator]() {
    let index = 0; const nums = this.nums;
    return { next() { return index < nums.length
      ? { value: nums[index++], done: false }
      : { value: undefined, done: true as const }; }};
  }
}
for (const n of new NumberRange(1, 5)) console.log(n); // 1 2 3 4 5`,
    tags: ['behavioral', 'iterator', 'traversal'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: OOP Principles
  // ══════════════════════════════════════════════════════
  {
    slug: 'encapsulation',
    title: 'Encapsulation',
    category: 'OOP Principles',
    difficulty: 'basic',
    order: 1,
    summary: 'Bundling data and the methods that operate on it within one class, and hiding internal details from the outside world.',
    keyPoints: [
      'Encapsulation means the object controls its own data. Instead of anyone being able to reach in and change a field directly, you access it through methods the object provides. This lets the object validate changes, enforce rules, and maintain consistency.',
      'Private fields are the mechanism. When you mark a field private, only methods within the same class can access it. The outside world must use public methods (getters and setters) to interact with it. This is called "information hiding".',
      'The benefit is that the internal representation can change without breaking external code. If you start with an age field stored as a number, but later want to store birth date and calculate age, you can do that internally. All callers just call getAge() and never notice the change.',
      'Encapsulation also means putting behavior close to the data it operates on. Instead of having external code that accesses an account\'s balance and deducts an amount (which could go negative), you put a withdraw() method inside the Account class that enforces the rule: cannot go below zero.',
      'Without encapsulation, objects are just dumb data bags and business logic ends up scattered everywhere. With it, each class is a self-contained unit that knows the rules about its own data — this is the foundation of OOP.',
    ],
    analogy: 'Like a capsule pill. The medicine (data) is inside the capsule (class). You don\'t directly touch the medicine — you take the whole capsule. The capsule controls how the medicine is released. The internal contents can change (different formulas) without you doing anything differently.',
    codeHint: `class BankAccount {
  private balance: number = 0; // hidden internal state

  deposit(amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');
    this.balance += amount;
  }
  withdraw(amount: number) {
    if (amount > this.balance) throw new Error('Insufficient funds');
    this.balance -= amount;
  }
  getBalance() { return this.balance; } // controlled read access
}`,
    tags: ['oop', 'encapsulation', 'access control', 'information hiding'],
  },
  {
    slug: 'inheritance',
    title: 'Inheritance',
    category: 'OOP Principles',
    difficulty: 'basic',
    order: 2,
    summary: 'A mechanism where a child class acquires the properties and behaviors of a parent class, enabling code reuse and specialization.',
    keyPoints: [
      'Inheritance models an "is-a" relationship. A Dog IS-A Animal. A Car IS-A Vehicle. A Manager IS-A Employee. The child class (subclass) automatically gets all the non-private fields and methods of the parent class (superclass), plus it can add its own.',
      'Code reuse is the primary benefit. If Animal has breathe(), eat(), and sleep() methods, and you have 20 different animal types, you don\'t duplicate those 3 methods 20 times. Each animal type inherits them for free and only needs to define what makes it unique.',
      'Method overriding lets the child replace a parent\'s behavior with something more specific. Dog inherits makeSound() from Animal but overrides it to return "Woof" instead of a generic sound. The override keyword (in typed languages) makes this explicit and catches mistakes.',
      'The "is-a" test is crucial for deciding when to use inheritance. If you can\'t honestly say "a B is a type of A", don\'t use inheritance. A common mistake is inheriting just for code reuse when there\'s no real relationship (e.g., Stack should NOT extend ArrayList — a Stack is not an ArrayList).',
      'Deep inheritance chains are a code smell. More than 2-3 levels of inheritance gets very hard to understand and change. Composition over Inheritance is often preferred for complex cases — rather than inheriting, you hold an instance of the other class and delegate to it.',
    ],
    analogy: 'Like a family. Children inherit traits from parents — eye color, height, certain behaviors. But each child is also their own person with unique traits. The child doesn\'t have to re-learn how to walk (inherited) but might have a unique skill like painting (added behavior).',
    codeHint: `class Animal {
  constructor(public name: string) {}
  eat()       { console.log(\`\${this.name} is eating\`); }
  makeSound() { console.log('...'); }
}
class Dog extends Animal {
  override makeSound() { console.log('Woof!'); } // override parent
  fetch() { console.log(\`\${this.name} fetches the ball\`); } // added behavior
}
const dog = new Dog('Rex');
dog.eat();       // inherited from Animal
dog.makeSound(); // overridden: Woof!`,
    tags: ['oop', 'inheritance', 'reuse', 'subclass'],
  },
  {
    slug: 'polymorphism',
    title: 'Polymorphism',
    category: 'OOP Principles',
    difficulty: 'basic',
    order: 3,
    summary: 'The ability for different classes to be treated as instances of the same parent class, each responding to the same method call in their own way.',
    keyPoints: [
      'Polymorphism means "many forms". The same method call on different objects produces different results because each object implements the method in its own way. You call shape.draw() and a Circle draws a circle, a Square draws a square, a Triangle draws a triangle — all through the same method call.',
      'Compile-time polymorphism (Method Overloading): multiple methods with the same name but different parameter lists. The compiler picks the right one based on what arguments you pass. add(int, int) vs add(double, double) vs add(String, String).',
      'Runtime polymorphism (Method Overriding): when you hold a reference of the parent type but the actual object is a subclass. When you call a method on it, Java/TypeScript calls the subclass version at runtime, not the parent version. This is called dynamic dispatch.',
      'Programming to an interface (not implementation) unlocks polymorphism\'s full power. If your code accepts a PaymentMethod interface, you can pass it a CreditCard, a UPIPayment, or a CryptoPay and it will work with all of them without knowing which one it got.',
      'Without polymorphism, you\'d need separate methods for each subtype: drawCircle(), drawSquare(), drawTriangle(). With polymorphism, one draw() method handles all of them. Adding a new shape type requires zero changes to the code that calls draw().',
    ],
    analogy: 'Like a universal remote\'s "Power" button. Press it with a Samsung TV in front of you and the Samsung turns on. Press it with an LG TV and the LG turns on. Same button, same action — different results based on what\'s actually there. The remote doesn\'t need to know the brand.',
    codeHint: `interface Shape { area(): number; }
class Circle  implements Shape { constructor(private r: number){} area(){ return Math.PI*this.r*this.r; } }
class Square  implements Shape { constructor(private s: number){} area(){ return this.s * this.s; } }
class Triangle implements Shape { constructor(private b: number, private h: number){} area(){ return 0.5*this.b*this.h; } }

// Polymorphism: same call, different behavior
const shapes: Shape[] = [new Circle(5), new Square(4), new Triangle(3, 6)];
shapes.forEach(s => console.log(s.area())); // 78.5, 16, 9`,
    tags: ['oop', 'polymorphism', 'overriding', 'interface'],
  },
  {
    slug: 'abstraction',
    title: 'Abstraction',
    category: 'OOP Principles',
    difficulty: 'basic',
    order: 4,
    summary: 'Hiding complex implementation details and showing only the essential features of an object — focusing on WHAT it does, not HOW it does it.',
    keyPoints: [
      'Abstraction means you work with a simplified model. When you call list.sort(), you don\'t need to know which sorting algorithm it uses or how memory is managed. You just know what it does: sorts the list. The how is hidden — that\'s abstraction.',
      'Abstract classes and interfaces are the tools of abstraction in OOP. An interface says "here\'s what this thing can do" without any implementation. Classes that implement the interface provide the actual how. Users of the interface never need to see the implementation.',
      'Abstraction reduces cognitive load. Without it, to use a database, you\'d need to understand TCP sockets, query parsing, index structures, and buffer management. With abstraction, you just call db.findUser(id) and trust it works. You operate at a higher level of understanding.',
      'Good abstraction hides the parts that are likely to change and exposes only the stable contract. The interface is the stable part; the implementation behind it can change (switch databases, change algorithms) without affecting anyone using the interface.',
      'Leaky abstractions are when the hidden details "leak" through — when to use a method correctly, you need to understand the underlying implementation. This is a design flaw. Good abstractions are watertight: you can use them correctly using only the public contract.',
    ],
    analogy: 'Driving a car. You use the steering wheel, gas pedal, and brake — that\'s the abstract interface. You don\'t need to understand combustion engines, differential gears, or ABS algorithms. The car\'s complex internals are abstracted away behind a simple interface that anyone can learn.',
    codeHint: `// Abstract class defines WHAT, not HOW
abstract class DatabaseConnection {
  abstract connect(url: string): void;
  abstract query(sql: string): unknown[];
  abstract disconnect(): void;

  // Template method using the abstract operations
  runQuery(sql: string) {
    this.connect('db-url');
    const result = this.query(sql);
    this.disconnect();
    return result;
  }
}
// PostgreSQL provides HOW
class PostgreSQL extends DatabaseConnection {
  connect(url: string) { console.log('Connecting to PostgreSQL:', url); }
  query(sql: string)   { return []; /* actual query */ }
  disconnect()         { console.log('Disconnecting'); }
}`,
    tags: ['oop', 'abstraction', 'interface', 'hiding'],
  },
  {
    slug: 'composition-over-inheritance',
    title: 'Composition over Inheritance',
    category: 'OOP Principles',
    difficulty: 'intermediate',
    order: 5,
    summary: 'Prefer building complex behavior by combining simpler objects (has-a) rather than by creating deep inheritance hierarchies (is-a).',
    keyPoints: [
      'Inheritance is great for true "is-a" relationships, but it\'s often misused just to share code. Deep inheritance hierarchies become fragile: changing a base class can break all its subclasses in unexpected ways. The "Fragile Base Class" problem is real.',
      'Composition means a class contains (has-a) other objects and delegates behavior to them. A Logger doesn\'t inherit from FileWriter — it has a FileWriter as a field and calls methods on it. This is much more flexible because you can swap the FileWriter for a NetworkWriter easily.',
      'With inheritance, you\'re locked into the parent\'s structure at compile time. With composition, you can change behavior at runtime by swapping out the composed objects. This is the Strategy pattern in action — and Decorator, and many others.',
      'The Liskov Substitution Principle (LSP) helps you decide: if a subclass cannot be safely used everywhere the parent is expected, you\'re misusing inheritance. The classic example: Stack extends ArrayList — but a Stack shouldn\'t expose ArrayList\'s add(index, element) method, violating LSP.',
      'A good rule of thumb: when in doubt, prefer composition. Use inheritance only when there\'s a clear, genuine "is-a" relationship AND you need the polymorphism it provides. For mere code reuse, extract the shared code into a helper class and compose with it.',
    ],
    analogy: 'Think about building a robot. Inheritance approach: create a base Robot class, then extend to FlyingRobot, SwimmingRobot, ShootingRobot, FlyingShootingRobot, SwimmingShootingRobot... this explodes. Composition approach: create Fly ability, Swim ability, Shoot ability as separate components. Build any robot by choosing which abilities to include.',
    codeHint: `// Bad: Inheritance leads to explosion of classes
class Animal {} class FlyingAnimal extends Animal {} class SwimmingFlyingAnimal extends FlyingAnimal {}

// Good: Composition — mix abilities flexibly
interface Flyable  { fly(): void; }
interface Swimmable { swim(): void; }
class Duck {
  constructor(private fly: Flyable, private swim: Swimmable) {}
  doFly()  { this.fly.fly(); }
  doSwim() { this.swim.swim(); }
}`,
    tags: ['oop', 'composition', 'inheritance', 'flexibility'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: SOLID Principles
  // ══════════════════════════════════════════════════════
  {
    slug: 'solid-srp',
    title: 'Single Responsibility Principle (SRP)',
    category: 'SOLID Principles',
    difficulty: 'basic',
    order: 1,
    summary: 'A class should have only one reason to change — it should do one thing and do it well.',
    keyPoints: [
      'SRP doesn\'t literally mean a class can only have one method. It means a class should be responsible for one cohesive concern. If you can describe what a class does without using the word "and", you\'re likely following SRP.',
      'The "reason to change" framing is key. If your class changes when the database schema changes AND when the email template changes AND when the fee calculation changes — that\'s three reasons to change and three responsibilities in one class. These should be split.',
      'A common violation: a User class that handles user data, sends emails, generates reports, and validates inputs. These are four separate concerns. Each one changes for different reasons — email templates change when marketing updates copy; validation changes when business rules change; reports change when stakeholders want different formats.',
      'SRP classes are easier to test. A class with one responsibility has focused, limited behavior — you can write small, clear unit tests. A class with 5 responsibilities needs tests for all the combinations and interactions between them.',
      'The practical way to apply SRP: when a class gets large or hard to describe, look for internal coherence. Methods that touch different sets of data probably belong in different classes. Extract them into separate classes that each handle one concern.',
    ],
    analogy: 'Like job roles in a restaurant. The chef cooks, the waiter serves, the cashier handles money, the cleaner tidies up. Imagine one person doing all four jobs — they\'d be constantly switching context, overloaded, and a single person quitting would break everything. Separate responsibilities keep things manageable.',
    codeHint: `// Violation: User does too many things
class BadUser { saveToDb() {} sendEmail() {} generateReport() {} validate() {} }

// Better: each class has one job
class User       { validate()       {} }
class UserRepo   { saveToDb()       {} }
class UserMailer { sendWelcome()    {} }
class UserReport { generatePDF()   {} }`,
    tags: ['solid', 'srp', 'single responsibility', 'separation of concerns'],
  },
  {
    slug: 'solid-ocp',
    title: 'Open-Closed Principle (OCP)',
    category: 'SOLID Principles',
    difficulty: 'intermediate',
    order: 2,
    summary: 'Software entities should be open for extension but closed for modification — add new behavior without changing existing code.',
    keyPoints: [
      'The idea: once a class is written and tested, you should be able to add new features to the system without going back and modifying that class. Modifying tested code is risky — you might introduce bugs in functionality that was working fine before.',
      'The way you achieve this is through abstraction. Instead of hardcoding specific behavior, you define interfaces or abstract classes. New behavior is added by creating new implementations of those interfaces, not by editing existing ones.',
      'A classic violation: a Discount calculator with if-else chains — "if premium user, give 20% off; if student, give 15% off; if senior, give 25% off...". Every new user type requires modifying this class and re-testing everything. OCP says: extract each discount type into its own class implementing a DiscountStrategy interface.',
      'The key insight is identifying the axis of change — what is most likely to vary? Build abstractions around that point. For discounts, different user types are the axis of change. For serialization, different formats (JSON, XML, CSV) are the axis. Abstract that axis.',
      'OCP works together with the Strategy, Template Method, and Visitor patterns — all of which let you extend behavior by adding new classes rather than modifying existing ones.',
    ],
    analogy: 'Like a power strip with sockets. The power strip (existing code) is closed for modification — you don\'t open it up and rewire it to support a new device. But it\'s open for extension — you just plug in a new device (new class) into the existing socket (interface). The strip works with any plug that fits the socket.',
    codeHint: `// Violation: add new shape = modify existing class
class AreaCalc { calc(shape: any) { if (shape.type==='circle') {} else if (shape.type==='sq') {} } }

// OCP: add new shape = add new class, existing code unchanged
interface Shape { area(): number; }
class Circle  implements Shape { area() { return Math.PI * 5 * 5; } }
class Square  implements Shape { area() { return 4 * 4; } }
// To add Triangle: just create new class — no changes elsewhere
class AreaCalcFixed { calc(shape: Shape) { return shape.area(); } }`,
    tags: ['solid', 'ocp', 'open closed', 'extension'],
  },
  {
    slug: 'solid-lsp',
    title: 'Liskov Substitution Principle (LSP)',
    category: 'SOLID Principles',
    difficulty: 'intermediate',
    order: 3,
    summary: 'Objects of a subclass should be replaceable for objects of the parent class without breaking the application.',
    keyPoints: [
      'LSP says: wherever you use an Animal, you should be able to put a Dog or a Cat in its place and everything still works correctly. If a subclass breaks this expectation, you\'ve violated LSP and your inheritance hierarchy is wrong.',
      'The classic violation example: Rectangle class with setWidth() and setHeight(). Square extends Rectangle but forces width == height. Now code that does rect.setWidth(5); rect.setHeight(10); assert(rect.area() == 50) will fail for a Square — the area is 100. A Square is not truly substitutable for a Rectangle.',
      'Violations show up as type checks in client code: if (animal instanceof Dog) doSomethingDogSpecific(). If you find yourself checking subtypes to decide how to call a method, the subclass isn\'t truly substitutable — you\'re working around a broken abstraction.',
      'LSP also means subclasses should not strengthen preconditions (require more than the parent) or weaken postconditions (promise less than the parent). If the parent\'s method accepts any positive number, the child can\'t restrict it to only even numbers.',
      'The practical fix when LSP is violated: maybe the relationship isn\'t truly "is-a". Consider using composition instead, or restructure the hierarchy. Square and Rectangle might both implement a Shape interface without one inheriting from the other.',
    ],
    analogy: 'Like a work contract. If someone is hired as a "Software Engineer", the company expects certain behaviors: shows up to meetings, writes code, does code reviews. If a subtype of employee — say a "Senior Engineer" — refuses to do code reviews, they\'re not substitutable. The job title promises certain behaviors that must be fulfilled.',
    codeHint: `// LSP violation: Square breaks Rectangle's contract
class Rectangle { setWidth(w: number) {} setHeight(h: number) {} area() { return 0; } }
class Square extends Rectangle {
  setWidth(w: number) { /* also sets height */ } // breaks expectations!
}

// Fix: use a common interface instead
interface Shape2D { area(): number; }
class Rect implements Shape2D { constructor(private w: number, private h: number){} area(){return this.w*this.h;} }
class Sq   implements Shape2D { constructor(private s: number){}                   area(){return this.s*this.s;} }`,
    tags: ['solid', 'lsp', 'substitution', 'inheritance'],
  },
  {
    slug: 'solid-isp',
    title: 'Interface Segregation Principle (ISP)',
    category: 'SOLID Principles',
    difficulty: 'basic',
    order: 4,
    summary: 'No class should be forced to implement methods it doesn\'t use — prefer many small, specific interfaces over one large general one.',
    keyPoints: [
      'A "fat interface" is one that has too many methods. If you force classes to implement it, some classes will have methods they don\'t need and will either leave them empty or throw UnsupportedOperationException. This is a design smell.',
      'The fix is to break the fat interface into smaller, more focused interfaces. Each interface covers one specific capability. Classes implement only the interfaces relevant to them — no empty or throw implementations.',
      'A concrete example: a Printer interface with print(), scan(), fax(), photocopy(). A basic home printer can print and scan but can\'t fax or photocopy. Forcing it to implement the full interface means writing fax() { throw new Error("Not supported") }. ISP says: split into Printable, Scannable, Faxable, Photocopiable. Home printer implements only Printable and Scannable.',
      'ISP also improves cohesion of the consuming code. If your method only needs to call print(), its parameter type should be Printable — not the full Printer. This makes dependencies explicit and minimal.',
      'In REST API design, ISP translates to: don\'t return a giant object with 50 fields when the consumer only needs 3. Return focused response shapes. In microservices, it means services should expose only the contracts they\'re responsible for.',
    ],
    analogy: 'Like job contracts. A full-time employee contract covers salary, benefits, vacation, health insurance, retirement plan. A part-time contractor just needs: hourly rate and scope of work. Forcing a contractor to sign the full employee contract and acknowledge all the employee benefits is wasteful and confusing — give them only the relevant interface.',
    codeHint: `// Violation: fat interface
interface Machine { print(): void; scan(): void; fax(): void; photocopy(): void; }
class BasicPrinter implements Machine {
  print() { /* ok */ }
  scan()  { /* ok */ }
  fax()   { throw new Error('Not supported'); }       // forced!
  photocopy() { throw new Error('Not supported'); }    // forced!
}

// ISP: split into focused interfaces
interface Printable   { print(): void; }
interface Scannable   { scan(): void; }
class BasicPrinterISP implements Printable, Scannable {
  print() {} scan() {}  // only what we actually support
}`,
    tags: ['solid', 'isp', 'interface segregation', 'fat interface'],
  },
  {
    slug: 'solid-dip',
    title: 'Dependency Inversion Principle (DIP)',
    category: 'SOLID Principles',
    difficulty: 'intermediate',
    order: 5,
    summary: 'High-level modules should not depend on low-level modules — both should depend on abstractions (interfaces).',
    keyPoints: [
      'Without DIP, high-level business logic directly uses low-level details: OrderService creates a new MySQLDatabase() and calls methods on it. Now OrderService is tightly coupled to MySQL. If you want to switch to PostgreSQL, or use an in-memory database for testing, you have to change OrderService.',
      'DIP says: OrderService should depend on a Database interface, not on MySQLDatabase. Both OrderService and MySQLDatabase depend on the Database abstraction. High-level code is stable; low-level implementations can change freely.',
      '"Inversion" refers to who controls the dependency. Normally the high-level class creates the low-level class (top-down). With DIP inverted: the high-level class defines what it needs (the interface), and the low-level class conforms to that contract.',
      'Dependency Injection (DI) is the most common way to apply DIP. Instead of creating dependencies inside a class (new MySQLDatabase()), you pass them in through the constructor or a setter. The caller decides which implementation to inject — making it easy to swap in a mock for testing or a different implementation in production.',
      'IoC (Inversion of Control) containers like Spring in Java or NestJS in Node.js automate dependency injection. You declare what interfaces your class needs, and the container wires everything up at startup. This is DIP at the framework level.',
    ],
    analogy: 'Like wall power sockets. Your laptop (high-level module) plugs into a power socket (abstraction/interface). It doesn\'t care if the power comes from a coal plant, solar panels, or a generator (low-level implementations). Both the laptop and the power source depend on the socket standard — neither depends on each other directly.',
    codeHint: `// Violation: high-level depends on low-level
class OrderService { private db = new MySQLDatabase(); } // tightly coupled!

// DIP: both depend on abstraction
interface IDatabase { save(data: unknown): void; find(id: string): unknown; }
class MySQLDatabase implements IDatabase { save(d: unknown){} find(id: string){ return {}; } }
class MongoDatabase implements IDatabase { save(d: unknown){} find(id: string){ return {}; } }

class OrderServiceDIP {
  constructor(private db: IDatabase) {} // inject the abstraction
  createOrder(data: unknown) { this.db.save(data); }
}`,
    tags: ['solid', 'dip', 'dependency inversion', 'di', 'ioc'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: System Design Concepts
  // ══════════════════════════════════════════════════════
  {
    slug: 'cap-theorem',
    title: 'CAP Theorem',
    category: 'System Design Concepts',
    difficulty: 'intermediate',
    order: 1,
    summary: 'In a distributed system, you can only guarantee two out of three: Consistency, Availability, and Partition Tolerance.',
    keyPoints: [
      'Consistency (C) means every read gets the most recent write or an error. If you write a value on Node A, anyone reading from Node B immediately sees that new value. There is a single, consistent view of the data across all nodes at all times.',
      'Availability (A) means every request gets a response — not necessarily the most up-to-date data, but a response. The system never refuses a request with an error. Even if some nodes are down, the system keeps serving requests using whatever data it has.',
      'Partition Tolerance (P) means the system continues operating even when network partitions occur (messages between nodes are lost or delayed). In any real distributed system, partitions happen — network cables fail, data centers lose connectivity. So P is basically mandatory.',
      'Since P is required for any distributed system, the real trade-off is between C and A during a partition. CP systems (like HBase, Zookeeper, MongoDB in strong consistency mode): when a partition occurs, they reject some requests to stay consistent — they favor consistency over availability. AP systems (like Cassandra, CouchDB, DynamoDB): when a partition occurs, they keep serving requests with possibly stale data — they favor availability over consistency.',
      'CAP is often misunderstood as a permanent choice. In reality, most systems are configurable — Cassandra lets you set consistency levels per query. Strong consistency reads are CP; eventual consistency reads are AP. You tune the trade-off based on the use case.',
    ],
    analogy: 'Imagine a Google Doc being edited by two people with an unstable internet connection. Consistency: the doc shows the same content to both users at all times — but if the internet drops, one user might be blocked from editing until connection restores. Availability: both users can keep editing even offline — but when they reconnect, there might be conflicts to resolve.',
    codeHint: `// CP System (MongoDB strong): returns error during partition
// db.findOne({id: 1}, {readConcern: {level: 'majority'}})
// → may timeout if majority nodes unreachable

// AP System (Cassandra): returns stale data during partition
// SELECT * FROM users WHERE id = 1; (ONE consistency level)
// → always returns, even if data is slightly stale

// Key questions to ask:
// - Can we serve stale data? → AP (Cassandra, DynamoDB, Couchbase)
// - Must data always be correct? → CP (HBase, Zookeeper, etcd)`,
    tags: ['distributed systems', 'cap', 'consistency', 'availability', 'partition'],
  },
  {
    slug: 'consistent-hashing',
    title: 'Consistent Hashing',
    category: 'System Design Concepts',
    difficulty: 'intermediate',
    order: 2,
    summary: 'A technique for distributing data across servers so that adding or removing a server minimizes the number of keys that need to be remapped.',
    keyPoints: [
      'The problem with simple modulo hashing: you have N servers and route requests by key % N. Works great until you add or remove a server. Now N changes and almost every key maps to a different server. This causes a massive cache invalidation — all cached data is suddenly in the wrong place.',
      'Consistent hashing places both servers and keys on a virtual ring (0 to 2^32). Each key is assigned to the first server it encounters going clockwise on the ring. The key insight: when you add or remove a server, only the keys in that server\'s ring segment need to be remapped — everything else stays put.',
      'Virtual nodes (vnodes) solve the uneven distribution problem. If you have 3 servers and each gets one spot on the ring, they might cluster together leaving most of the ring unbalanced. Instead, each physical server gets 100-200 virtual nodes placed randomly around the ring. This spreads the load much more evenly.',
      'When a server is added: only the keys between the new server and its predecessor on the ring need to move — roughly (1/N)% of all keys. When a server is removed: only its keys move to the next server on the ring. Contrast with modulo hashing where all keys might need to move.',
      'Used by: Amazon DynamoDB, Apache Cassandra (for data partitioning), Memcached and Redis clustering (for routing), and CDN load balancers (for routing requests to the nearest/best cache node).',
    ],
    analogy: 'Imagine a circular clock face. Servers are placed at various positions on the clock (12, 4, 8 o\'clock). Requests are hashed to positions on the clock. Each request goes to the nearest server clockwise. If you add a server at 2 o\'clock, only requests between 12 and 2 need to be rerouted to the new server. Everything else is undisturbed.',
    codeHint: `// Simplified Consistent Hash Ring
class ConsistentHash {
  private ring = new Map<number, string>(); // hash → serverName
  private sortedKeys: number[] = [];

  addServer(server: string, vnodes = 100) {
    for (let i = 0; i < vnodes; i++) {
      const hash = this.hash(\`\${server}#\${i}\`);
      this.ring.set(hash, server);
      this.sortedKeys = [...this.ring.keys()].sort((a,b)=>a-b);
    }
  }
  getServer(key: string): string {
    const hash = this.hash(key);
    const pos = this.sortedKeys.find(k => k >= hash) ?? this.sortedKeys[0];
    return this.ring.get(pos)!;
  }
  private hash(key: string): number { /* MurmurHash */ return key.length * 12345; }
}`,
    tags: ['distributed systems', 'consistent hashing', 'load balancing', 'cache'],
  },
  {
    slug: 'caching-strategies',
    title: 'Caching Strategies',
    category: 'System Design Concepts',
    difficulty: 'intermediate',
    order: 3,
    summary: 'Techniques for storing frequently accessed data in fast storage to reduce latency and database load.',
    keyPoints: [
      'Cache-Aside (Lazy Loading): the application checks the cache first. On a cache miss, it reads from the database, writes the result to the cache, and returns it. Subsequent reads hit the cache. Simple to implement and the cache only contains data that\'s actually requested — no wasted space on unused data.',
      'Write-Through: every write goes to the cache AND the database synchronously. The cache is always up-to-date. The downside is write latency increases (two writes instead of one), and the cache fills with data that may never be read again.',
      'Write-Behind (Write-Back): writes go to the cache immediately, and the cache asynchronously writes to the database later. Very fast writes, but there\'s a window where data is in the cache but not yet in the database — if the cache crashes in that window, you lose data.',
      'Read-Through: the cache sits in front of the database. On a cache miss, the cache itself fetches from the database (not the application). The application always talks to the cache. Useful when you want to centralize the cache-miss logic away from application code.',
      'Cache eviction policies decide what to remove when the cache is full. LRU (Least Recently Used) evicts what wasn\'t accessed longest — good for temporal locality. LFU (Least Frequently Used) evicts what was accessed fewest times overall. TTL-based eviction removes items after a time period regardless of usage — useful for data that becomes stale.',
    ],
    analogy: 'Cache-Aside is like your brain\'s short-term memory. You don\'t memorize everything in the world upfront — that would be impossible. But when you need something repeatedly (a phone number you keep dialing), you naturally start remembering it. The first time is slow (lookup), subsequent times are instant (cached in memory).',
    codeHint: `// Cache-Aside pattern
async function getUser(id: string): Promise<User> {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached); // cache hit

  const user = await db.users.findById(id); // cache miss → DB
  await redis.setEx(\`user:\${id}\`, 3600, JSON.stringify(user)); // populate cache (TTL 1hr)
  return user;
}

// Write-Through: always update cache and DB together
async function updateUser(id: string, data: Partial<User>) {
  await db.users.update(id, data);          // write to DB
  await redis.set(\`user:\${id}\`, JSON.stringify(data)); // update cache
}`,
    tags: ['caching', 'redis', 'read-through', 'write-through', 'ttl'],
  },
  {
    slug: 'load-balancing',
    title: 'Load Balancing',
    category: 'System Design Concepts',
    difficulty: 'basic',
    order: 4,
    summary: 'Distributing incoming traffic across multiple servers to prevent any single server from being overwhelmed.',
    keyPoints: [
      'A load balancer sits between clients and your server fleet. Clients send all requests to the load balancer\'s single IP/domain. The load balancer forwards each request to one of the backend servers and returns the response to the client. The client never knows which server handled it.',
      'Round Robin: requests go to servers in sequence — first to Server 1, next to Server 2, then Server 3, then back to Server 1. Simple and fair when all servers are identical. The problem: a complex request and a simple request are treated equally, so a server might get all the heavy ones.',
      'Least Connections: each new request goes to whichever server currently has the fewest active connections. This is smarter than round robin for workloads with varying request durations — slower requests don\'t pile up on one server.',
      'IP Hash: the client\'s IP address is hashed to always route them to the same server. This is useful for session persistence (sticky sessions) when the application stores session state on the server. The downside: if that server goes down, the session is lost.',
      'Layer 4 vs Layer 7 load balancing: L4 (transport layer) routes based on IP and TCP port only — fast but dumb. L7 (application layer) can inspect the full HTTP request — route /api/videos to video servers and /api/users to user servers. More powerful but more computational overhead.',
    ],
    analogy: 'Like multiple checkout lanes in a supermarket. The store manager (load balancer) directs customers (requests) to the available cashier (server). If one lane has a long queue, the manager sends new customers to the shorter one. No single cashier gets overwhelmed, and customers get served faster overall.',
    codeHint: `// Round Robin load balancer
class RoundRobinBalancer {
  private servers = ['server1:8080', 'server2:8080', 'server3:8080'];
  private current = 0;

  getNext(): string {
    const server = this.servers[this.current];
    this.current = (this.current + 1) % this.servers.length;
    return server;
  }
}

// Least Connections
class LeastConnBalancer {
  private connections = new Map<string, number>([['s1', 0], ['s2', 0], ['s3', 0]]);
  getNext(): string {
    return [...this.connections.entries()].reduce((a, b) => a[1] < b[1] ? a : b)[0];
  }
}`,
    tags: ['load balancing', 'round robin', 'scalability', 'distributed systems'],
  },
  {
    slug: 'database-sharding',
    title: 'Database Sharding',
    category: 'System Design Concepts',
    difficulty: 'intermediate',
    order: 5,
    summary: 'Horizontally partitioning a database into smaller pieces (shards) each stored on a different server to handle large scale.',
    keyPoints: [
      'Sharding splits your database table across multiple database instances. Instead of one database with 1 billion user rows, you have 10 databases each with 100 million users. Each database is called a shard. Together they form the complete dataset.',
      'Shard key selection is the most critical decision. A good shard key distributes data evenly and minimizes cross-shard queries. User ID is a common choice for user data — easy to hash and distribute. A bad shard key causes hotspots: if you shard social media posts by city, a major event in one city floods that shard while others sit idle.',
      'Range-based sharding: users with IDs 1-10M on Shard 1, 10M-20M on Shard 2. Easy to understand but creates hotspots at the range boundaries (new users all go to the latest shard, old shards are cold). Hash-based sharding: hash(userId) % N determines the shard. More even distribution but range queries (give me users 1 to 1000) require hitting all shards.',
      'Cross-shard queries are the biggest pain of sharding. A query like "find all users in London" can\'t be answered by a single shard — it must be sent to all shards in parallel, results collected, merged, and returned. This is called scatter-gather and is expensive.',
      'Resharding is painful: when shards fill up and you need to add more shards, many existing keys need to migrate to new shards. Consistent hashing minimizes this. But it\'s still a complex operational task that requires careful planning and often a maintenance window.',
    ],
    analogy: 'Like dividing an encyclopedia into volumes. Volume A-D, Volume E-H, Volume I-L, etc. Each volume is independently readable (a shard). Looking up "Apple" goes straight to Volume A. Looking up everything about a person across topics (cross-shard query) means checking multiple volumes — more work.',
    codeHint: `// Simple hash-based sharding router
class ShardRouter {
  constructor(private shards: Database[], private numShards: number) {}

  getShard(userId: string): Database {
    const shardIndex = this.hash(userId) % this.numShards;
    return this.shards[shardIndex];
  }
  private hash(key: string): number {
    return key.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), 0) >>> 0;
  }
  async getUser(userId: string) {
    return this.getShard(userId).query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}`,
    tags: ['sharding', 'database', 'scalability', 'partitioning'],
  },
  {
    slug: 'acid-vs-base',
    title: 'ACID vs BASE',
    category: 'System Design Concepts',
    difficulty: 'intermediate',
    order: 6,
    summary: 'ACID guarantees strong consistency for traditional databases; BASE allows relaxed consistency for highly available distributed systems.',
    keyPoints: [
      'ACID stands for Atomicity (all steps of a transaction succeed or all fail — no partial updates), Consistency (the database moves from one valid state to another — no rule violations), Isolation (concurrent transactions don\'t interfere — each sees a consistent snapshot), and Durability (committed data is persisted even after crashes).',
      'ACID is the standard for relational databases like PostgreSQL, MySQL, and SQL Server. When you transfer money from Account A to Account B, ACID ensures: the debit and credit happen together (Atomicity), no constraint is violated (Consistency), other transactions don\'t see the half-done transfer (Isolation), and once committed it\'s permanent (Durability).',
      'BASE stands for Basically Available (the system stays available even during failures), Soft state (state may change over time as updates propagate), and Eventual consistency (all nodes will eventually agree on the same value, but not immediately).',
      'BASE is the model used by highly distributed NoSQL systems like Cassandra, DynamoDB, and CouchDB. When you update a user\'s profile on Cassandra, one node gets the update immediately. Other nodes might still return the old value for a few milliseconds until the update propagates — that\'s eventual consistency.',
      'Choosing between them depends on your requirements: financial transactions (bank transfers, payments) demand ACID. Social media likes, view counts, and feed updates can tolerate BASE — seeing a 1-second-old like count is perfectly fine. Most real systems use a mix: ACID for critical data, BASE for scale-tolerant data.',
    ],
    analogy: 'ACID is like a bank wire transfer — every detail is strictly correct, verified, and locked. If anything goes wrong, it completely rolls back. BASE is like updating your Instagram follower count — it doesn\'t matter if your count shows 1,000 for a half-second before it shows 1,001. Eventually it will be correct, and strict real-time accuracy isn\'t worth the performance cost.',
    codeHint: `// ACID example: bank transfer (PostgreSQL)
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 500 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 500 WHERE id = 'bob';
  -- If either fails, ROLLBACK — atomicity guaranteed
COMMIT;

// BASE example: view count (Cassandra — eventual consistency)
UPDATE videos SET views = views + 1 WHERE id = '123';
-- May temporarily show different counts on different nodes
-- Eventually all nodes converge to the correct value`,
    tags: ['acid', 'base', 'consistency', 'transactions', 'nosql'],
  },
  {
    slug: 'cdn',
    title: 'Content Delivery Network (CDN)',
    category: 'System Design Concepts',
    difficulty: 'basic',
    order: 7,
    summary: 'A globally distributed network of servers that caches and delivers static content to users from the nearest geographic location.',
    keyPoints: [
      'Without a CDN, all users — whether they\'re in Mumbai or New York — send requests to your single origin server. A user in Mumbai requesting content from a New York server experiences high latency because the data travels across the planet (typically 100-200ms just for the network round trip).',
      'A CDN places Edge Servers (also called Points of Presence or PoPs) in dozens of cities around the world. When a user in Mumbai requests a file, it comes from the CDN edge server in Mumbai (maybe 5ms away) instead of New York. This dramatically reduces latency.',
      'CDNs work for static assets: images, videos, CSS files, JavaScript bundles, fonts, and even static HTML. These files don\'t change per user or per request, so they can be cached safely. For dynamic, personalized content (your specific user feed), CDNs are less useful.',
      'Cache invalidation is the tricky part. CDNs cache files with a TTL (time-to-live). If you deploy a new version of your JavaScript bundle, old versions might still be served from edge nodes until their TTL expires. The solution: cache busting — include a content hash in the filename (app.a3f9c12.js) so the new file has a new URL and is fetched fresh.',
      'CDNs also provide DDoS protection (distributing attack traffic across all edge nodes rather than overwhelming one origin), SSL termination (handling TLS encryption at the edge), and compression (Gzip/Brotli compression at the edge before sending to users).',
    ],
    analogy: 'Like a franchise fast food chain. The "main kitchen" (origin server) is in one city. But instead of every customer driving to that one kitchen, there are hundreds of local restaurants (edge nodes) in every city. Local customers get their food from the local branch — fast. The main kitchen only handles new recipes (dynamic content) and keeps the branches supplied.',
    codeHint: `// CDN usage in practice — cache-control headers
// Origin server sets: how long CDN can cache this response
app.get('/images/:id', (req, res) => {
  const image = getImage(req.params.id);
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // cache 1 year
    'CDN-Cache-Control': 'max-age=86400',                  // CDN caches 1 day
    'Vary': 'Accept-Encoding'                              // cache per encoding
  });
  res.send(image);
});`,
    tags: ['cdn', 'latency', 'caching', 'static content', 'edge'],
  },
  {
    slug: 'message-queues',
    title: 'Message Queues & Async Processing',
    category: 'System Design Concepts',
    difficulty: 'intermediate',
    order: 8,
    summary: 'Decouple producers and consumers using a queue so heavy tasks are processed asynchronously without blocking the user.',
    keyPoints: [
      'The problem with synchronous processing: a user clicks "Send Email to 10,000 subscribers" and your server starts sending emails right then, taking 5 minutes. The user\'s request hangs for 5 minutes, or the connection times out. This is a terrible user experience.',
      'With a message queue: the user\'s request creates a "send emails" job and pushes it to the queue, then immediately returns "Your campaign is scheduled." A background worker (consumer) picks up the job from the queue and processes it asynchronously. The user\'s request takes milliseconds.',
      'Queues also provide natural buffering during traffic spikes. If 10,000 users all upload images simultaneously, without a queue, your image processing service gets crushed. With a queue, all 10,000 jobs are queued and processed at whatever rate the workers can handle — no service overwhelm.',
      'Durability: good message queues (Kafka, RabbitMQ, SQS) persist messages to disk. If your consumer crashes mid-processing, the message is not lost. When the consumer restarts, it picks up from where it left off. This is crucial for important jobs like payment processing.',
      'Dead Letter Queues (DLQ): if a message fails to process after N retries (maybe due to a bug or bad data), it\'s moved to a Dead Letter Queue. Operations teams can inspect DLQ messages, fix the underlying issue, and replay them. Without DLQ, failed messages are silently dropped or cause infinite retry loops.',
    ],
    analogy: 'Like a restaurant with a kitchen ticket system. Waiters (producers) take orders and put tickets (messages) on the wheel (queue). Chefs (consumers) pick up tickets and cook in order. The waiter doesn\'t wait at the counter for the food — they go serve other tables. If a chef is busy, tickets pile up on the wheel and are processed as capacity frees up.',
    codeHint: `// Producer: push job to queue (e.g., Bull/BullMQ with Redis)
await emailQueue.add('send-campaign', {
  campaignId: '123', recipientCount: 10000
});
res.json({ message: 'Campaign scheduled' }); // returns immediately

// Consumer: worker processes jobs from the queue
emailQueue.process('send-campaign', async (job) => {
  const { campaignId } = job.data;
  const recipients = await db.getRecipients(campaignId);
  for (const r of recipients) {
    await sendEmail(r); // slow work done in background
    await job.progress(/* % */ );
  }
});`,
    tags: ['message queue', 'async', 'kafka', 'rabbitmq', 'decoupling'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: Database Concepts
  // ══════════════════════════════════════════════════════
  {
    slug: 'database-indexing',
    title: 'Database Indexing',
    category: 'Database Concepts',
    difficulty: 'basic',
    order: 1,
    summary: 'An index is a data structure that speeds up data retrieval by allowing the database to find rows without scanning the entire table.',
    keyPoints: [
      'Without an index, a SELECT WHERE email = "user@example.com" does a full table scan — it reads every single row until it finds matching ones. On a table with 100 million rows, this could take tens of seconds. With an index on the email column, the database navigates a B-tree structure to find the row in milliseconds.',
      'A B-tree index is the most common type. It\'s a balanced tree where each node contains sorted key values and pointers. To find a value, you traverse from root to leaf — O(log n) comparisons instead of O(n) full scan. The tree stays balanced on inserts and deletes.',
      'Indexes come with a cost: they take up disk space (often significant), and every INSERT, UPDATE, or DELETE on the indexed column must also update the index. Write-heavy tables may be slower with many indexes. Don\'t index every column — index what you actually query.',
      'Composite indexes cover multiple columns: INDEX(last_name, first_name) can efficiently answer queries on last_name alone or (last_name, first_name) together. But it won\'t help a query filtering only on first_name — the leftmost prefix rule applies.',
      'Covering index: when all the columns a query needs are in the index itself, the database can answer the query entirely from the index without touching the main table rows. This is called an index-only scan and is the fastest type of query.',
    ],
    analogy: 'Like the index at the back of a textbook. To find all pages about "polymorphism", you don\'t read every page from cover to cover — you look it up in the alphabetical index and jump directly to pages 45, 89, 210. The index is sorted, so finding the word is fast even if the book has 1000 pages.',
    codeHint: `-- Without index: full table scan (slow for large tables)
SELECT * FROM users WHERE email = 'john@example.com'; -- O(n)

-- Create index on frequently queried column
CREATE INDEX idx_users_email ON users(email);
-- Now the same query uses index: O(log n)

-- Composite index for common multi-column queries
CREATE INDEX idx_users_name ON users(last_name, first_name);
SELECT * FROM users WHERE last_name = 'Smith';            -- uses index ✓
SELECT * FROM users WHERE last_name = 'S' AND first_name = 'J'; -- uses index ✓
SELECT * FROM users WHERE first_name = 'John';            -- does NOT use index ✗`,
    tags: ['database', 'index', 'b-tree', 'performance', 'query'],
  },
  {
    slug: 'sql-vs-nosql',
    title: 'SQL vs NoSQL Databases',
    category: 'Database Concepts',
    difficulty: 'basic',
    order: 2,
    summary: 'SQL databases offer structured data and strong consistency; NoSQL databases offer flexible schemas and horizontal scalability.',
    keyPoints: [
      'SQL databases (PostgreSQL, MySQL, SQLite) store data in tables with rows and columns. The schema is defined upfront — every row must conform to the same structure. They excel at complex queries involving joins across multiple tables and provide ACID transactions out of the box.',
      'NoSQL databases come in several types. Document stores (MongoDB, Firestore) store JSON-like documents — each document can have a different structure. Key-value stores (Redis, DynamoDB) offer blazing-fast lookups by key. Column-family stores (Cassandra, HBase) are optimized for huge write throughput. Graph databases (Neo4j) efficiently traverse relationships.',
      'When to use SQL: your data has clear relationships and a stable schema; you need complex ad-hoc queries; data integrity and transactions are critical (financial systems, e-commerce orders). SQL enforces foreign key constraints and prevents orphaned records.',
      'When to use NoSQL: you\'re handling truly large scale (billions of rows) and need horizontal scaling; your schema evolves frequently (you\'re in early startup mode); you need specialized access patterns (fast time-series, social graph traversal, caching); you can tolerate eventual consistency.',
      'The myth that "NoSQL is always faster" is wrong. For appropriate use cases, SQL with proper indexing is extremely fast. The real difference is about scalability model (SQL scales vertically — bigger server; NoSQL scales horizontally — more servers) and flexibility vs. structure.',
    ],
    analogy: 'SQL is like a spreadsheet with strict column headers. Every row must have the same columns. NoSQL is like a folder of Word documents — each document can have a completely different structure. The spreadsheet is great for tabular data analysis; the folder is great when each item has its own unique set of information.',
    codeHint: `// SQL: strict schema, great for joins
SELECT u.name, o.total, p.name as product
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE u.country = 'India';

// MongoDB: flexible document, great for embedded data
db.orders.find({
  'customer.country': 'India',
  status: 'delivered'
}, { total: 1, 'items.name': 1 });
// items are embedded in the order document — no joins needed`,
    tags: ['sql', 'nosql', 'mongodb', 'postgresql', 'database'],
  },
  {
    slug: 'database-replication',
    title: 'Database Replication',
    category: 'Database Concepts',
    difficulty: 'intermediate',
    order: 3,
    summary: 'Keeping synchronized copies of data across multiple database servers for high availability and read scalability.',
    keyPoints: [
      'The primary motivation for replication is high availability: if your single database server goes down, your entire application goes down. With replication, you have standby replicas that can take over immediately if the primary fails.',
      'Primary-Replica (Master-Slave) replication: all writes go to one primary server. The primary sends changes to one or more replica servers, which apply the changes and stay in sync. Reads can be distributed across replicas for scalability. Most reads in typical apps can tolerate slightly stale data.',
      'Replication lag is the delay between a write hitting the primary and appearing on the replica. Under normal conditions, this is milliseconds. Under heavy load, it can grow to seconds. Applications must be designed to handle this: after a user updates their profile, redirect them to the primary for their next read, not a potentially stale replica.',
      'Synchronous vs Asynchronous replication: synchronous replication waits for the replica to confirm before acknowledging the write to the client — no data loss on failover but higher write latency. Asynchronous replication acknowledges immediately — lower latency but if the primary crashes before the replica catches up, you lose recent writes.',
      'Multi-primary (Multi-master) replication lets multiple servers accept writes simultaneously. This removes the write bottleneck but introduces conflict resolution challenges: what happens if two servers update the same row at the same time? This is the hardest problem in distributed databases.',
    ],
    analogy: 'Like a legal contract with carbon copies. The original (primary) is the authoritative version. Carbon copies (replicas) are identical and immediately available for reference. If the original is destroyed, you still have the copies. Many people can read copies simultaneously without bothering the person who holds the original.',
    codeHint: `// Application code handling replication lag
class UserRepository {
  constructor(private primary: DB, private replica: DB) {}

  async updateProfile(userId: string, data: Partial<User>) {
    await this.primary.update('users', { id: userId }, data);
    // Don't read from replica immediately after write — lag risk!
    return this.primary.findById('users', userId); // read from primary after write
  }

  async getUser(userId: string, requireFresh = false) {
    const db = requireFresh ? this.primary : this.replica;
    return db.findById('users', userId); // normally read from replica
  }
}`,
    tags: ['replication', 'primary replica', 'high availability', 'read scaling'],
  },
  {
    slug: 'normalization',
    title: 'Database Normalization',
    category: 'Database Concepts',
    difficulty: 'basic',
    order: 4,
    summary: 'Organizing database tables to reduce data redundancy and improve data integrity by following a set of normal forms.',
    keyPoints: [
      'The problem normalization solves: imagine storing a customer\'s city in every order row. If the customer moves, you need to update their city in hundreds of order rows, and if you miss one, your data is inconsistent. Normalization centralizes that data to avoid this.',
      'First Normal Form (1NF): every cell contains a single, atomic value — no lists or sets in a cell. Instead of storing "guitar, piano, drums" in one music_interests column, each interest gets its own row in a separate table.',
      'Second Normal Form (2NF): every non-key column must depend on the entire primary key, not just part of it. In an order_items table with (order_id, product_id) as the key, the product_name depends only on product_id — not the full key. Move product_name to the products table.',
      'Third Normal Form (3NF): no transitive dependencies — non-key columns shouldn\'t depend on other non-key columns. If an employees table has employee_id, department_id, and department_name, the department_name depends on department_id (not the employee). Split departments into their own table.',
      'Denormalization is intentionally breaking normalization rules for performance. Sometimes joining 5 tables for every query is too slow. You duplicate some data (e.g., store the customer name in the order row) to avoid the join. This is a deliberate trade-off: faster reads at the cost of update complexity and storage.',
    ],
    analogy: 'Like organizing your contacts. Without normalization: every event invitation lists the full address of each invitee. When someone moves, you update it in 50 different places. Normalized: each person has one record in your address book with their address. Events just reference the person\'s ID. Move once, every event reflects it.',
    codeHint: `-- Unnormalized (bad): customer city stored in every order
-- orders: id, customer_name, customer_city, product, amount
-- If customer moves, update 1000 order rows!

-- Normalized (good): separated concerns
CREATE TABLE customers (id INT, name TEXT, city TEXT);
CREATE TABLE orders    (id INT, customer_id INT REFERENCES customers(id), amount DECIMAL);

-- Now if customer moves, update ONE row in customers
UPDATE customers SET city = 'Mumbai' WHERE id = 42;
-- All orders automatically reflect the change via JOIN`,
    tags: ['normalization', 'database design', '1nf', '2nf', '3nf', 'relational'],
  },

  // ══════════════════════════════════════════════════════
  // CATEGORY: Interview Tips
  // ══════════════════════════════════════════════════════
  {
    slug: 'how-to-approach-lld',
    title: 'How to Approach an LLD Interview',
    category: 'Interview Tips',
    difficulty: 'basic',
    order: 1,
    summary: 'A structured 6-step framework for tackling any Low-Level Design problem in an interview confidently.',
    keyPoints: [
      'Step 1 — Clarify requirements (5 min): Don\'t start coding immediately. Ask clarifying questions: "Are we designing for a specific scale?", "Is this a single machine or distributed?", "What are the primary use cases?", "What can I deprioritize?". Interviewers want to see structured thinking, not rushing.',
      'Step 2 — Define the core entities (3-5 min): Identify the main objects in the system. For a parking lot: ParkingLot, Floor, Slot, Vehicle, Ticket. For LinkedIn: User, Connection, Post, Feed. These entities become your classes. Discuss them with the interviewer before drawing.',
      'Step 3 — Identify relationships (3 min): How do the entities relate? A ParkingLot HAS-MANY Floors. A Floor HAS-MANY Slots. A Slot IS-OCCUPIED-BY a Vehicle. Note cardinalities: one-to-one, one-to-many, many-to-many. These become your class associations.',
      'Step 4 — Define key methods and responsibilities (10 min): For each entity, what are its responsibilities? What methods does it expose? A Slot should know its own availability. A ParkingLot should find the nearest available slot. A Ticket should know the entry time and calculate the fee.',
      'Step 5 — Apply design patterns (5 min): Identify where patterns help. Singleton for the ParkingLot. Strategy for fee calculation. Factory for creating different Ticket types. State machine for Slot status. Knowing and naming the right pattern impresses interviewers.',
      'Step 6 — Handle edge cases (3 min): What if the lot is full? What if the vehicle type doesn\'t fit any slot? What about concurrent access (two cars trying to take the last spot)? Discussing these proactively shows maturity.',
    ],
    analogy: 'Like a doctor diagnosing a patient. They don\'t immediately prescribe medicine — they ask symptoms (clarify requirements), examine the patient (identify entities), understand what\'s connected (relationships), determine what to treat (methods), pick the right treatment protocol (design patterns), and consider complications (edge cases).',
    codeHint: `// LLD Interview Skeleton Template
// 1. Core entities
class ParkingLot { /* Singleton */ }
class Floor { slots: ParkingSlot[] = []; }
class ParkingSlot { status: SlotStatus; vehicle?: Vehicle; }

// 2. Key enums
enum SlotStatus { AVAILABLE, OCCUPIED, UNDER_MAINTENANCE }
enum VehicleType { MOTORCYCLE, CAR, BUS }

// 3. Core operations
class ParkingLot {
  park(vehicle: Vehicle): Ticket { /* find slot, create ticket */ }
  exit(ticket: Ticket): number   { /* calculate fee, free slot */ }
  findNearestSlot(type: VehicleType): ParkingSlot | null { /* search */ }
}`,
    tags: ['interview tips', 'lld', 'approach', 'framework', 'strategy'],
  },
  {
    slug: 'how-to-approach-hld',
    title: 'How to Approach a System Design (HLD) Interview',
    category: 'Interview Tips',
    difficulty: 'basic',
    order: 2,
    summary: 'A 7-step framework for high-level system design interviews — from requirements to deep-dive on the most challenging components.',
    keyPoints: [
      'Step 1 — Gather functional requirements (3 min): What does the system do? For Twitter: users can post tweets, follow others, see a timeline. List the 3-5 most important features. Explicitly say "I\'ll focus on these and deprioritize X" — this shows scoping ability.',
      'Step 2 — Define non-functional requirements (3 min): This is where you define the scale. How many users? What are the read/write ratios? What latency is acceptable? "We have 100M DAU, 500M tweets/day, reads are 100x more than writes, timeline should load in under 200ms." These numbers drive all design decisions.',
      'Step 3 — Back-of-the-envelope estimation (5 min): Estimate storage, bandwidth, QPS. "500M tweets/day = ~6,000 tweets/sec. Each tweet 300 bytes → 150MB/s of write bandwidth. 100x reads = 15GB/s of read bandwidth. We definitely need caching and a CDN." This shows you understand scale.',
      'Step 4 — High-level architecture (10 min): Draw the major components: clients, load balancer, app servers, databases, cache, CDN, message queues. Show how data flows for the primary use cases. Keep it at a high level — don\'t get lost in details yet.',
      'Step 5 — Data model (5 min): What tables or collections? What are the key fields? What are the access patterns? "Users table: id, username, email. Tweets table: id, user_id, content, timestamp. What indexes do we need?" SQL vs NoSQL decision belongs here.',
      'Step 6 — Deep dive into challenging components (15 min): Pick the hardest part of the system — for Twitter it\'s the timeline generation. Go deep: fan-out on write vs read, caching strategy, how you handle celebrity accounts. This is where you show senior-level thinking.',
      'Step 7 — Address bottlenecks and trade-offs (5 min): Where can the system fail? What are you trading off? "We chose eventual consistency for the timeline because users can tolerate a 2-second delay. Financial data uses strong consistency because money must be accurate." Always explain your trade-offs.',
    ],
    analogy: 'Like designing a city. You first agree on what the city needs (requirements). Then the scale — a town of 10,000 vs a metropolis of 10M (non-functional). You estimate land, infrastructure needs (estimation). Sketch the major zones — residential, commercial, transport (high-level architecture). Plan the road and utility network (data model). Design the subway system in detail (deep dive). Identify where traffic jams will occur and how to prevent them (bottlenecks).',
    codeHint: `/* HLD Interview Estimation Template */

// QPS (Queries Per Second)
const dau = 100_000_000;        // 100M daily active users
const tweetsPerDay = 500_000_000;
const writesPerSec = tweetsPerDay / 86_400; // ~5,800/s

// Storage
const tweetSize = 300;          // bytes
const storagePerDay = tweetsPerDay * tweetSize; // 150 GB/day
const storage5Years = storagePerDay * 365 * 5; // ~274 TB

// Cache sizing (cache top 20% of hot tweets)
const hotContentRatio = 0.2;
const cacheNeeded = storagePerDay * hotContentRatio; // 30 GB cache`,
    tags: ['interview tips', 'system design', 'hld', 'estimation', 'framework'],
  },
  {
    slug: 'identifying-design-patterns',
    title: 'How to Identify the Right Design Pattern',
    category: 'Interview Tips',
    difficulty: 'intermediate',
    order: 3,
    summary: 'A practical guide to recognizing which design pattern to apply in a given problem scenario.',
    keyPoints: [
      'When you hear "we need to create different types of objects based on some condition" → Factory or Abstract Factory. Example: creating different payment method objects based on which payment type the user chooses (credit card, UPI, crypto).',
      'When you hear "only one instance should exist" → Singleton. Example: a configuration manager, a connection pool, a logger. Watch out: if the interviewer says "thread-safe" or "concurrent", add double-checked locking to your Singleton.',
      'When you hear "we need to build a complex object step by step with many optional parameters" → Builder. When you need to copy an existing object cheaply → Prototype.',
      'When you hear "we need to add features dynamically at runtime without changing the original class" → Decorator. When you hear "we need a simpler interface to a complex system" → Facade. When you need to make two incompatible interfaces work together → Adapter.',
      'When you hear "when one thing changes, multiple others need to react" → Observer. When behavior changes based on current state → State. When you need interchangeable algorithms → Strategy. When a request needs to pass through a chain of processors → Chain of Responsibility. When you need undo/redo → Command.',
    ],
    analogy: 'Like a doctor\'s symptom-to-diagnosis mapping. You learn that "fever + cough" likely means flu, "chest pain radiating to the arm" means cardiac event. Design patterns are the same: you learn the "symptoms" (problem characteristics) that point to each "diagnosis" (pattern). With practice, pattern recognition becomes instinctive.',
    codeHint: `// Pattern recognition cheat sheet:
// "Create objects" family:
//   - Many types, one place to create them → Factory
//   - Only one ever → Singleton
//   - Many optional params → Builder
//   - Copy existing cheaply → Prototype

// "Structure" family:
//   - Add behavior at runtime → Decorator
//   - Simplify complex system → Facade
//   - Make interfaces compatible → Adapter
//   - Placeholder / cache / access control → Proxy

// "Behavior" family:
//   - One changes → many react → Observer
//   - Behavior changes with state → State
//   - Swap algorithms → Strategy
//   - Series of handlers → Chain of Responsibility
//   - Encapsulate request, support undo → Command`,
    tags: ['interview tips', 'design patterns', 'recognition', 'quick reference'],
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI env var not set')

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  let inserted = 0

  for (const n of NOTES) {
    await RevisionNote.findOneAndUpdate(
      { slug: n.slug },
      { $set: n },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    console.log(`  ✓ [${n.category}] ${n.title}`)
    inserted++
  }

  const total = await RevisionNote.countDocuments({ isActive: true })
  console.log(`\nDone — ${inserted} upserted. Total active notes: ${total}`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
