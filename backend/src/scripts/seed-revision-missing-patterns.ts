/**
 * npx ts-node -r dotenv/config src/scripts/seed-revision-missing-patterns.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { RevisionNote } from '../models/revision-note.model'

const MISSING: object[] = [
  // ── Creational ──────────────────────────────────────────────────────────────
  {
    slug: 'abstract-factory-pattern',
    title: 'Abstract Factory Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 3,
    summary: 'Provides an interface for creating families of related objects — like UI components for different operating systems — without specifying their concrete classes.',
    keyPoints: [
      'Abstract Factory goes one step further than the Factory Method. While Factory Method creates one type of object, Abstract Factory creates an entire family of related objects. Think of it as a "super-factory" that produces multiple related products that are designed to work together.',
      'The key problem it solves: suppose your UI toolkit needs to support multiple themes — Light, Dark, and HighContrast. Each theme needs its own Button, Checkbox, Scrollbar, and TextField. Without Abstract Factory, you\'d have to manually ensure that a LightButton always comes with a LightCheckbox, never a DarkCheckbox. Abstract Factory enforces that consistency automatically.',
      'The Abstract Factory is an interface with one creation method per product type: createButton(), createCheckbox(), createTextField(). Concrete factory classes (LightThemeFactory, DarkThemeFactory) implement this interface and return the correctly themed version of each product.',
      'Client code only interacts with the AbstractFactory interface and AbstractProduct interfaces — it never knows which concrete factory it received. You can swap the entire family of products by switching one factory. This makes theming, platform switching, or testing trivially easy.',
      'The key trade-off: adding a new product type (like a new Tooltip component) requires updating the AbstractFactory interface AND all concrete factory classes. This can be disruptive if you have many factories. Adding a new factory (a new theme), on the other hand, is easy — just create a new class implementing the existing interface.',
    ],
    analogy: 'Think of furniture showrooms for different styles: Modern, Victorian, and Art Deco. Each showroom (factory) sells a complete matching set — sofa, chair, table, lamp — all in the same style. If you buy from the Modern showroom, every piece matches because they came from the same factory. You can\'t accidentally mix a Victorian table with a Modern sofa.',
    codeHint: `interface Button    { render(): void; }
interface Checkbox  { check(): void; }

// Abstract Factory — creates families of related products
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

// Concrete factories produce matching families
class LightThemeFactory implements UIFactory {
  createButton()   { return new LightButton(); }
  createCheckbox() { return new LightCheckbox(); }
}
class DarkThemeFactory implements UIFactory {
  createButton()   { return new DarkButton(); }
  createCheckbox() { return new DarkCheckbox(); }
}

// Client only knows the abstract interface
class App {
  constructor(private factory: UIFactory) {}
  build() {
    const btn = this.factory.createButton();   // always matching
    const chk = this.factory.createCheckbox(); // always matching
    btn.render(); chk.check();
  }
}`,
    tags: ['creational', 'abstract factory', 'family', 'gof'],
  },

  // ── Structural ───────────────────────────────────────────────────────────────
  {
    slug: 'bridge-pattern',
    title: 'Bridge Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 11,
    summary: 'Decouples an abstraction from its implementation so that the two can vary independently — preventing a class explosion when you have multiple dimensions of variation.',
    keyPoints: [
      'The problem Bridge solves: suppose you have a Shape class with Circle and Square subclasses, and you also need Dark and Light color variants. With inheritance alone, you need DarkCircle, LightCircle, DarkSquare, LightSquare — 4 classes for 2 shapes × 2 colors. Add a new shape or color and the count explodes multiplicatively.',
      'Bridge splits the two dimensions into separate hierarchies connected by a bridge (a reference). You have an Abstraction hierarchy (Shape) and an Implementation hierarchy (Renderer/Color). The Shape holds a reference to a Renderer and delegates rendering to it. New shapes and new renderers are added independently.',
      'The "bridge" is simply the abstraction object holding a reference to an implementation object. The abstraction delegates work to the implementation. This is composition, not inheritance — which is exactly why it avoids the class explosion.',
      'Unlike Adapter (which reconciles incompatible existing interfaces), Bridge is designed upfront. You intentionally design your system with two separate hierarchies from the start because you know they\'ll vary independently. Adapter is a retrofitting solution; Bridge is a forward-looking design.',
      'Real-world uses: device drivers (the OS provides an abstraction; drivers are implementations that vary independently of the OS), cross-platform UI (Window is the abstraction; WindowsWindowImpl and MacWindowImpl are independent implementations), logging (Logger abstraction; FileLogger, ConsoleLogger, RemoteLogger are implementations).',
    ],
    analogy: 'Think of a TV remote control (abstraction) and the TV (implementation). You can use the same remote design with different TV brands. And different remote designs can control the same TV. The remote and TV vary independently because they\'re connected through a standardized IR signal interface — the bridge.',
    codeHint: `// Implementation hierarchy (varies independently)
interface Renderer { renderCircle(radius: number): void; }
class VectorRenderer implements Renderer {
  renderCircle(r: number) { console.log(\`SVG circle r=\${r}\`); }
}
class RasterRenderer implements Renderer {
  renderCircle(r: number) { console.log(\`Pixels circle r=\${r}\`); }
}

// Abstraction hierarchy holds a bridge to implementation
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void;
}
class Circle extends Shape {
  constructor(renderer: Renderer, private radius: number) { super(renderer); }
  draw() { this.renderer.renderCircle(this.radius); }
}

// Can combine independently: new Circle(new VectorRenderer(), 5).draw()`,
    tags: ['structural', 'bridge', 'decoupling', 'composition', 'gof'],
  },
  {
    slug: 'flyweight-pattern',
    title: 'Flyweight Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 17,
    summary: 'Shares common, immutable state across many fine-grained objects to dramatically reduce memory usage when dealing with huge numbers of similar objects.',
    keyPoints: [
      'The problem: you\'re building a forest renderer that places 1 million tree objects on screen. Each tree stores its type name, color, texture, X position, and Y position. If all those million trees share the same type/color/texture data (because it\'s a pine forest), you\'re storing those large textures in memory 1 million times — an obvious waste.',
      'Flyweight splits object state into intrinsic (shared, immutable) and extrinsic (unique to each instance) state. Intrinsic state — the tree type, color, and texture — is extracted into a separate Flyweight object. There is only ONE TreeType object for pine trees, shared by all million pine tree instances. Extrinsic state — the X and Y position — stays in a small, lightweight wrapper.',
      'The FlyweightFactory maintains a pool of Flyweight objects, keyed by their intrinsic state. When you need a TreeType for "pine", it checks if one already exists in the pool and returns it. Only if it doesn\'t exist does it create a new one. This ensures at most one flyweight per unique combination of intrinsic state.',
      'The memory saving can be dramatic. Instead of storing a 1MB texture 1 million times (1TB total), you store it once (1MB) and have 1 million lightweight wrapper objects that each just hold an X, Y coordinate and a pointer to the shared flyweight. Total memory goes from ~1TB to a few megabytes.',
      'The trade-off: code complexity increases because you must explicitly separate intrinsic and extrinsic state. Operations on flyweight objects require passing the extrinsic state as a parameter each time (since the flyweight doesn\'t store it). This can feel awkward. Only use Flyweight when the memory savings justify the added complexity — typically when you need millions of similar objects.',
    ],
    analogy: 'Like characters in a word processor. The character "A" appears thousands of times in a document, but the font, size, and glyph data for "A" is only stored once — that\'s the flyweight (intrinsic state). Each occurrence of "A" just stores its position on the page — that\'s the extrinsic state. The glyph is shared; the position is unique.',
    codeHint: `// Flyweight: shared intrinsic state (heavy data)
class TreeType {
  constructor(
    public name: string,
    public color: string,
    public texture: string // imagine this is a large texture object
  ) {}
  draw(x: number, y: number) {
    console.log(\`Drawing \${this.name} at (\${x},\${y}) with \${this.color}\`);
  }
}

// FlyweightFactory: pool of shared flyweights
class TreeTypeFactory {
  private pool = new Map<string, TreeType>();
  get(name: string, color: string, texture: string): TreeType {
    const key = \`\${name}_\${color}\`;
    if (!this.pool.has(key)) this.pool.set(key, new TreeType(name, color, texture));
    return this.pool.get(key)!;
  }
}

// Lightweight wrapper: stores only extrinsic state
class Tree {
  constructor(private x: number, private y: number, private type: TreeType) {}
  draw() { this.type.draw(this.x, this.y); }
}`,
    tags: ['structural', 'flyweight', 'memory', 'sharing', 'pool', 'gof'],
  },

  // ── Behavioral ───────────────────────────────────────────────────────────────
  {
    slug: 'interpreter-pattern',
    title: 'Interpreter Pattern',
    category: 'Design Patterns',
    difficulty: 'advanced',
    order: 21,
    summary: 'Defines a grammar for a simple language and provides an interpreter to evaluate sentences in that language by representing each grammar rule as a class.',
    keyPoints: [
      'The Interpreter pattern is used when you have a simple language or expression that you need to evaluate repeatedly. You define grammar rules, and each rule becomes a class. To evaluate an expression, you build a tree of these rule objects (an Abstract Syntax Tree, or AST) and call interpret() on the root.',
      'Every expression in the language implements a common Expression interface with an interpret(context) method. Terminal expressions (like a variable or a number literal) directly return a value. Non-terminal expressions (like Add or Multiply) contain other expressions and evaluate them recursively before combining their results.',
      'Example: a simple math expression like "(5 + 3) * 2" is parsed into a tree: MultiplyExpression (left: AddExpression(NumberExpression(5), NumberExpression(3)), right: NumberExpression(2)). Calling interpret() on the root evaluates the whole tree recursively. The tree structure mirrors the grammar.',
      'The Context object holds global information that any expression in the tree might need — like a symbol table mapping variable names to their current values. All expressions receive the same context and can read from it or modify it.',
      'When to use it: Interpreter is most suitable when the grammar is simple (complex grammars become unwieldy — use parser generators like ANTLR instead), and when you need to interpret many different sentences of the language at runtime. Real uses: SQL query parsing, regex engines, expression evaluators in spreadsheets, scripting languages, configuration DSLs.',
    ],
    analogy: 'Like a music sheet and a musician. The music notation is the language (grammar). Each symbol — a note, a rest, a chord — is an expression. The musician (interpreter) reads each symbol recursively and produces sound. The same sheet produces consistent output no matter which musician plays it, because they all follow the same interpretation rules.',
    codeHint: `interface Expression { interpret(ctx: Map<string, number>): number; }

// Terminal expression — no sub-expressions
class NumberExpr implements Expression {
  constructor(private val: number) {}
  interpret(_: Map<string, number>) { return this.val; }
}
class VariableExpr implements Expression {
  constructor(private name: string) {}
  interpret(ctx: Map<string, number>) { return ctx.get(this.name) ?? 0; }
}

// Non-terminal expressions — contain sub-expressions
class AddExpr implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Map<string, number>) {
    return this.left.interpret(ctx) + this.right.interpret(ctx);
  }
}
class MultiplyExpr implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Map<string, number>) {
    return this.left.interpret(ctx) * this.right.interpret(ctx);
  }
}

// (5 + x) * 2  where x = 3  →  result = 16
const ctx = new Map([['x', 3]]);
const expr = new MultiplyExpr(
  new AddExpr(new NumberExpr(5), new VariableExpr('x')),
  new NumberExpr(2)
);
console.log(expr.interpret(ctx)); // 16`,
    tags: ['behavioral', 'interpreter', 'grammar', 'ast', 'dsl', 'gof'],
  },
  {
    slug: 'mediator-pattern',
    title: 'Mediator Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 23,
    summary: 'Reduces chaotic dependencies between many objects by routing all communication through a central mediator object — objects talk to the mediator, not to each other.',
    keyPoints: [
      'The problem Mediator solves: in a complex UI form with 10 fields, when you check a checkbox, it might disable 3 fields, change the options in a dropdown, and show a hidden section. Without Mediator, each component holds references to all the others it needs to update — the components become tightly coupled in a web of dependencies that\'s very hard to change.',
      'The Mediator pattern extracts all the coordination logic into a single mediator object. Components no longer talk to each other directly — they only talk to the mediator. When a checkbox changes, it tells the mediator "I changed". The mediator then decides which other components to notify and how.',
      'This is the difference between a star topology (everything connects through the mediator) and a mesh topology (everything connects to everything else). A mesh of N components has up to N² connections. A star topology has exactly N connections. The mediator takes on the complexity that was previously scattered across all components.',
      'Each component holds a reference to the mediator. When a component does something significant, it calls mediator.notify(this, "event"). The mediator\'s notify() method contains all the coordination logic: "if sender is checkbox X and event is checked, then disable field Y and show section Z".',
      'Mediator vs Observer: in Observer, the subject broadcasts to whoever subscribed, without knowing what they\'ll do. In Mediator, the mediator has explicit knowledge of all participants and directs specific actions to specific components. Observer is more decoupled; Mediator is more controlled and better for complex coordination logic.',
    ],
    analogy: 'Like air traffic control (ATC). Planes (components) don\'t talk to each other directly about landing order, runway availability, and timing — that would be chaos. Instead, every plane talks only to ATC (the mediator), and ATC coordinates everything. The planes are decoupled from each other; only ATC knows the big picture.',
    codeHint: `interface Mediator { notify(sender: Component, event: string): void; }

abstract class Component {
  constructor(protected mediator: Mediator) {}
  notify(event: string) { this.mediator.notify(this, event); }
}

class Checkbox extends Component {
  private checked = false;
  toggle() { this.checked = !this.checked; this.notify('toggle'); }
  isChecked() { return this.checked; }
}
class TextField extends Component {
  private disabled = false;
  setDisabled(d: boolean) { this.disabled = d; }
}

// All coordination logic lives in ONE place
class FormMediator implements Mediator {
  constructor(private checkbox: Checkbox, private field: TextField) {}
  notify(sender: Component, event: string) {
    if (sender === this.checkbox && event === 'toggle') {
      this.field.setDisabled(this.checkbox.isChecked()); // checkbox controls field
    }
  }
}`,
    tags: ['behavioral', 'mediator', 'coordination', 'decoupling', 'gof'],
  },
  {
    slug: 'memento-pattern',
    title: 'Memento Pattern',
    category: 'Design Patterns',
    difficulty: 'intermediate',
    order: 24,
    summary: 'Captures and externally stores an object\'s internal state so it can be restored later — enabling undo/redo without exposing private implementation details.',
    keyPoints: [
      'The problem: you want to implement undo for a text editor. The naive approach is to save a copy of the entire editor state somewhere. But if you just expose the editor\'s internal fields (cursor position, text content, formatting) to the outside class that manages history, you\'ve broken encapsulation — external code now knows about and depends on internal details.',
      'Memento solves this with three roles. The Originator is the object whose state you want to save (the text editor). It creates Memento objects that capture its internal state. Crucially, only the Originator knows what\'s inside a Memento — the internal fields are private. The Caretaker manages a history of Mementos (a stack) but treats each Memento as a black box — it can store and return them but never reads or modifies their contents.',
      'To save state: the Originator creates a new Memento containing its current state. The Caretaker pushes it onto the history stack. To undo: the Caretaker pops the last Memento off the stack and passes it back to the Originator, which reads the saved state (using its privileged access) and restores itself.',
      'The encapsulation is preserved because the Caretaker never accesses the Memento\'s contents. It just treats Mementos as opaque tokens. Only the Originator (which created the Memento and knows its structure) can extract useful information from it.',
      'Real-world uses: undo/redo in editors (text editors, drawing tools, IDEs), game save states, database transaction snapshots, configuration snapshots for rollback, browser history. The pattern pairs naturally with Command — each Command saves a Memento before executing so it can undo by restoring the Memento.',
    ],
    analogy: 'Like a time capsule. A person (Originator) writes a letter about their current life and seals it in a capsule (Memento). A librarian (Caretaker) stores the sealed capsule and can retrieve it later — but never opens or reads it. When the person wants to remember their past self, they open their own capsule. Nobody else can read it, preserving privacy (encapsulation).',
    codeHint: `// Memento: opaque state container — internals only accessible to Originator
class EditorMemento {
  constructor(
    private readonly content: string,
    private readonly cursorPos: number
  ) {}
  // Only Originator calls these — no public getters for Caretaker!
  getContent()   { return this.content; }
  getCursorPos() { return this.cursorPos; }
}

// Originator: creates and restores Mementos
class TextEditor {
  private content = ''; private cursorPos = 0;
  type(text: string) { this.content += text; this.cursorPos += text.length; }
  save(): EditorMemento { return new EditorMemento(this.content, this.cursorPos); }
  restore(m: EditorMemento) {
    this.content = m.getContent();
    this.cursorPos = m.getCursorPos();
  }
}

// Caretaker: manages history, treats Mementos as black boxes
class History {
  private stack: EditorMemento[] = [];
  push(m: EditorMemento) { this.stack.push(m); }
  pop()                  { return this.stack.pop(); }
}`,
    tags: ['behavioral', 'memento', 'undo', 'snapshot', 'encapsulation', 'gof'],
  },
  {
    slug: 'visitor-pattern',
    title: 'Visitor Pattern',
    category: 'Design Patterns',
    difficulty: 'advanced',
    order: 29,
    summary: 'Lets you add new operations to a class hierarchy without modifying any of the existing classes — by moving the operation logic into a separate "visitor" object.',
    keyPoints: [
      'The core problem Visitor solves: you have a stable class hierarchy (like Shape → Circle, Square, Triangle) and you want to perform many different operations on it (calculate area, export to SVG, export to PDF, generate a bounding box, etc.). Without Visitor, every time you add a new operation, you have to open and modify every class in the hierarchy — violating the Open-Closed Principle.',
      'Visitor flips the approach. Each class in the hierarchy gets a single accept(visitor) method. When called, it does one thing: visitor.visit(this). The actual operation logic for all the different things you can do to that class lives in the Visitor classes, not in the element classes themselves.',
      'This technique is called "double dispatch". Normally in OOP, the method called depends on the type of one object (the receiver). With Visitor, it depends on two: the type of the element (Circle? Square?) AND the type of the visitor (AreaCalculator? SVGExporter?). The right combination is selected at runtime.',
      'Adding a new operation is easy: create a new Visitor class with a visit() method for each element type, and implement the new logic there. Zero changes to the element classes. However, adding a new element type to the hierarchy is painful: you must add a new visit() method to EVERY existing visitor class. This is the classic trade-off.',
      'When to use it: Visitor is ideal when the class hierarchy is stable (elements rarely added) but operations are volatile (new operations added frequently). Real uses: compilers (AST transformations, code generation, type checking — each pass is a visitor), document export (HTML visitor, PDF visitor, Markdown visitor), linters running multiple rules over the same AST.',
    ],
    analogy: 'Like a tax assessor visiting different property types. The assessor (visitor) visits a house, an apartment, and a commercial building (elements). The assessment logic is completely different for each type. The properties don\'t know how they\'re assessed — they just let the assessor in (accept). To add a "property insurance calculator", you create a new assessor type without touching the house or apartment classes at all.',
    codeHint: `// Visitor interface: one visit() overload per element type
interface Visitor {
  visitCircle(c: Circle): void;
  visitSquare(s: Square): void;
}

// Elements: accept any visitor
interface Shape { accept(v: Visitor): void; }
class Circle implements Shape {
  constructor(public radius: number) {}
  accept(v: Visitor) { v.visitCircle(this); } // double dispatch
}
class Square implements Shape {
  constructor(public side: number) {}
  accept(v: Visitor) { v.visitSquare(this); } // double dispatch
}

// Adding a new operation = new Visitor class, zero changes to elements
class AreaCalculator implements Visitor {
  visitCircle(c: Circle) { console.log(Math.PI * c.radius ** 2); }
  visitSquare(s: Square) { console.log(s.side ** 2); }
}
class SVGExporter implements Visitor {
  visitCircle(c: Circle) { console.log(\`<circle r="\${c.radius}"/>\`); }
  visitSquare(s: Square) { console.log(\`<rect width="\${s.side}"/>\`); }
}`,
    tags: ['behavioral', 'visitor', 'double dispatch', 'open closed', 'gof'],
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI env var not set')
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  for (const n of MISSING) {
    const doc = n as { slug: string; title: string }
    await RevisionNote.findOneAndUpdate(
      { slug: doc.slug },
      { $set: { ...doc, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    console.log(`  ✓ ${doc.title}`)
  }

  const total = await RevisionNote.countDocuments({ isActive: true })
  console.log(`\nDone. Total active revision notes: ${total}`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
