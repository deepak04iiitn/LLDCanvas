import type { PatternData, HandleSide } from './types'
import type { UMLAttribute, UMLMethod, Visibility, RelationshipType } from '@/types'

// ─── Compact builders (fill required id / isStatic / isAbstract) ─────────────
let _seq = 0
const _id = () => `p${++_seq}`

function a(v: Visibility, name: string, type: string, isStatic = false): UMLAttribute {
  return { id: _id(), visibility: v, name, type, isStatic }
}

function m(
  v: Visibility,
  name: string,
  params: string,
  ret: string,
  isStatic = false,
  isAbstract = false,
  isConstructor?: boolean,
): UMLMethod {
  return { id: _id(), visibility: v, name, params, returnType: ret, isStatic, isAbstract, isConstructor }
}

function cls(id: string, name: string, x: number, y: number, attrs: UMLAttribute[], methods: UMLMethod[]) {
  return {
    id, type: 'class', position: { x, y },
    data: { nodeType: 'class' as const, name, attributes: attrs, methods },
  }
}

function abstractCls(id: string, name: string, x: number, y: number, attrs: UMLAttribute[], methods: UMLMethod[]) {
  return {
    id, type: 'abstract-class', position: { x, y },
    data: { nodeType: 'abstract-class' as const, name, attributes: attrs, methods },
  }
}

function iface(id: string, name: string, x: number, y: number, methods: UMLMethod[]) {
  return {
    id, type: 'interface', position: { x, y },
    data: { nodeType: 'interface' as const, name, attributes: [], methods },
  }
}

// `sourceHandle`/`targetHandle` are required, not optional — see the note on
// HandleSide in ./types. Every pair below was chosen by looking at each
// node's actual position relative to the other, not left for React Flow to
// guess (which always guessed "top" for both ends, regardless of layout).
function edge(
  id: string,
  source: string,
  target: string,
  type: RelationshipType,
  sourceHandle: HandleSide,
  targetHandle: HandleSide,
) {
  return { id, source, target, type, sourceHandle, targetHandle, data: { relationshipType: type } }
}

// ════════════════════════════════════════════════════════════════════════════
// CREATIONAL
// ════════════════════════════════════════════════════════════════════════════

// ─── Singleton ────────────────────────────────────────────────────────────────
const singleton: PatternData = {
  key: 'singleton',
  name: 'Singleton',
  category: 'Creational',
  description: 'Ensures only one instance of a class exists and provides a global access point.',
  nodes: [
    cls('singleton-class', 'Singleton', 200, 150,
      [a('-', 'instance', 'Singleton', true)],
      [
        m('-', 'Singleton', '', 'void', false, false, true),
        m('+', 'getInstance', '', 'Singleton', true),
        m('+', 'businessLogic', '', 'void'),
      ]),
  ],
  edges: [],
}

// ─── Factory Method ───────────────────────────────────────────────────────────
const factoryMethod: PatternData = {
  key: 'factory-method',
  name: 'Factory Method',
  category: 'Creational',
  description: 'Defines an interface for creating objects, letting subclasses decide which class to instantiate.',
  nodes: [
    abstractCls('creator', 'Creator', 80, 50, [],
      [m('+', 'createProduct', '', 'Product', false, true), m('+', 'doSomething', '', 'void')]),
    cls('concrete-creator', 'ConcreteCreator', 80, 300, [],
      [m('+', 'createProduct', '', 'Product')]),
    iface('product-iface', 'Product', 480, 50,
      [m('+', 'operation', '', 'string')]),
    cls('concrete-product', 'ConcreteProduct', 480, 300, [],
      [m('+', 'operation', '', 'string')]),
  ],
  edges: [
    edge('e-creator-dep', 'creator', 'product-iface', 'dependency', 'right', 'left'),
    edge('e-cc-inherit', 'concrete-creator', 'creator', 'inheritance', 'top', 'bottom'),
    edge('e-cp-realize', 'concrete-product', 'product-iface', 'realization', 'top', 'bottom'),
  ],
}

// ─── Abstract Factory ─────────────────────────────────────────────────────────
const abstractFactory: PatternData = {
  key: 'abstract-factory',
  name: 'Abstract Factory',
  category: 'Creational',
  description: 'Provides an interface for creating families of related objects without specifying concrete classes.',
  nodes: [
    iface('abs-factory', 'AbstractFactory', 300, 40,
      [m('+', 'createProductA', '', 'AbstractProductA'), m('+', 'createProductB', '', 'AbstractProductB')]),
    cls('factory1', 'ConcreteFactory1', 80, 300, [],
      [m('+', 'createProductA', '', 'AbstractProductA'), m('+', 'createProductB', '', 'AbstractProductB')]),
    cls('factory2', 'ConcreteFactory2', 520, 300, [],
      [m('+', 'createProductA', '', 'AbstractProductA'), m('+', 'createProductB', '', 'AbstractProductB')]),
    iface('abs-product-a', 'AbstractProductA', 750, 40, [m('+', 'operationA', '', 'string')]),
    iface('abs-product-b', 'AbstractProductB', 750, 260, [m('+', 'operationB', '', 'string')]),
  ],
  edges: [
    edge('e-f1', 'factory1', 'abs-factory', 'realization', 'top', 'bottom'),
    edge('e-f2', 'factory2', 'abs-factory', 'realization', 'top', 'bottom'),
    edge('e-dep-a', 'abs-factory', 'abs-product-a', 'dependency', 'right', 'left'),
    edge('e-dep-b', 'abs-factory', 'abs-product-b', 'dependency', 'right', 'left'),
  ],
}

// ─── Builder ──────────────────────────────────────────────────────────────────
const builder: PatternData = {
  key: 'builder',
  name: 'Builder',
  category: 'Creational',
  description: 'Separates the construction of a complex object from its representation.',
  nodes: [
    iface('builder-iface', 'Builder', 80, 40,
      [m('+', 'buildPartA', '', 'void'), m('+', 'buildPartB', '', 'void'), m('+', 'getResult', '', 'Product')]),
    cls('concrete-builder', 'ConcreteBuilder', 80, 300, [a('-', 'product', 'Product')],
      [m('+', 'buildPartA', '', 'void'), m('+', 'buildPartB', '', 'void'), m('+', 'getResult', '', 'Product')]),
    cls('director', 'Director', 500, 150, [a('-', 'builder', 'Builder')],
      [m('+', 'setBuilder', 'b: Builder', 'void'), m('+', 'construct', '', 'void')]),
    cls('product', 'Product', 500, 400, [a('-', 'partA', 'String'), a('-', 'partB', 'String')],
      [m('+', 'toString', '', 'String')]),
  ],
  edges: [
    edge('e-cb', 'concrete-builder', 'builder-iface', 'realization', 'top', 'bottom'),
    edge('e-dir', 'director', 'builder-iface', 'association', 'left', 'right'),
    edge('e-prod', 'concrete-builder', 'product', 'dependency', 'right', 'left'),
  ],
}

// ─── Prototype ────────────────────────────────────────────────────────────────
const prototype: PatternData = {
  key: 'prototype',
  name: 'Prototype',
  category: 'Creational',
  description: 'Creates new objects by copying an existing instance, rather than building from scratch.',
  nodes: [
    iface('prototype-iface', 'Prototype', 300, 40, [m('+', 'clone', '', 'Prototype')]),
    cls('concrete-1', 'ConcretePrototype1', 80, 300, [a('-', 'field', 'String')], [m('+', 'clone', '', 'Prototype')]),
    cls('concrete-2', 'ConcretePrototype2', 520, 300, [a('-', 'field', 'int')], [m('+', 'clone', '', 'Prototype')]),
    cls('client', 'Client', 300, 520, [a('-', 'prototype', 'Prototype')], [m('+', 'operation', '', 'void')]),
  ],
  edges: [
    edge('e-c1', 'concrete-1', 'prototype-iface', 'realization', 'top', 'bottom'),
    edge('e-c2', 'concrete-2', 'prototype-iface', 'realization', 'top', 'bottom'),
    edge('e-client', 'client', 'prototype-iface', 'dependency', 'top', 'bottom'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// STRUCTURAL
// ════════════════════════════════════════════════════════════════════════════

// ─── Adapter ──────────────────────────────────────────────────────────────────
const adapter: PatternData = {
  key: 'adapter',
  name: 'Adapter',
  category: 'Structural',
  description: 'Converts the interface of a class into another interface that clients expect.',
  nodes: [
    iface('target-iface', 'Target', 80, 100, [m('+', 'request', '', 'string')]),
    cls('adapter-class', 'Adapter', 80, 340, [a('-', 'adaptee', 'Adaptee')], [m('+', 'request', '', 'string')]),
    cls('adaptee', 'Adaptee', 480, 100, [], [m('+', 'specificRequest', '', 'string')]),
  ],
  edges: [
    edge('e-adapt', 'adapter-class', 'target-iface', 'realization', 'top', 'bottom'),
    edge('e-dep', 'adapter-class', 'adaptee', 'association', 'right', 'left'),
  ],
}

// ─── Bridge ───────────────────────────────────────────────────────────────────
const bridge: PatternData = {
  key: 'bridge',
  name: 'Bridge',
  category: 'Structural',
  description: 'Decouples an abstraction from its implementation so the two can vary independently.',
  nodes: [
    abstractCls('abstraction', 'Abstraction', 80, 40, [a('-', 'impl', 'Implementor')], [m('+', 'operation', '', 'void')]),
    cls('refined-abstraction', 'RefinedAbstraction', 80, 300, [], [m('+', 'operation', '', 'void')]),
    iface('implementor-iface', 'Implementor', 520, 40, [m('+', 'operationImpl', '', 'void')]),
    cls('concrete-impl-a', 'ConcreteImplementorA', 420, 300, [], [m('+', 'operationImpl', '', 'void')]),
    cls('concrete-impl-b', 'ConcreteImplementorB', 700, 300, [], [m('+', 'operationImpl', '', 'void')]),
  ],
  edges: [
    edge('e-bridge', 'abstraction', 'implementor-iface', 'aggregation', 'right', 'left'),
    edge('e-refined', 'refined-abstraction', 'abstraction', 'inheritance', 'top', 'bottom'),
    edge('e-impl-a', 'concrete-impl-a', 'implementor-iface', 'realization', 'top', 'bottom'),
    edge('e-impl-b', 'concrete-impl-b', 'implementor-iface', 'realization', 'top', 'bottom'),
  ],
}

// ─── Composite ────────────────────────────────────────────────────────────────
const composite: PatternData = {
  key: 'composite',
  name: 'Composite',
  category: 'Structural',
  description: 'Composes objects into tree structures and lets clients treat individual objects and groups uniformly.',
  nodes: [
    iface('component-iface', 'Component', 300, 40, [m('+', 'operation', '', 'void')]),
    cls('leaf', 'Leaf', 80, 300, [], [m('+', 'operation', '', 'void')]),
    cls('composite-class', 'Composite', 520, 300, [a('-', 'children', 'List<Component>')],
      [m('+', 'operation', '', 'void'), m('+', 'add', 'c: Component', 'void'), m('+', 'remove', 'c: Component', 'void')]),
  ],
  edges: [
    edge('e-leaf', 'leaf', 'component-iface', 'realization', 'top', 'bottom'),
    edge('e-comp-realize', 'composite-class', 'component-iface', 'realization', 'top', 'bottom'),
    edge('e-comp-tree', 'composite-class', 'component-iface', 'aggregation', 'left', 'right'),
  ],
}

// ─── Decorator ────────────────────────────────────────────────────────────────
const decorator: PatternData = {
  key: 'decorator',
  name: 'Decorator',
  category: 'Structural',
  description: 'Attaches additional responsibilities to an object dynamically without changing its interface.',
  nodes: [
    iface('component-iface2', 'Component', 300, 40, [m('+', 'operation', '', 'string')]),
    cls('concrete-component', 'ConcreteComponent', 80, 300, [], [m('+', 'operation', '', 'string')]),
    abstractCls('decorator-abs', 'Decorator', 520, 300, [a('#', 'component', 'Component')], [m('+', 'operation', '', 'string')]),
    cls('concrete-decorator', 'ConcreteDecorator', 520, 540, [], [m('+', 'operation', '', 'string'), m('+', 'addedBehavior', '', 'void')]),
  ],
  edges: [
    edge('e-cc', 'concrete-component', 'component-iface2', 'realization', 'top', 'bottom'),
    edge('e-da', 'decorator-abs', 'component-iface2', 'realization', 'top', 'bottom'),
    edge('e-dec-wraps', 'decorator-abs', 'component-iface2', 'aggregation', 'left', 'right'),
    edge('e-cd', 'concrete-decorator', 'decorator-abs', 'inheritance', 'top', 'bottom'),
  ],
}

// ─── Facade ───────────────────────────────────────────────────────────────────
const facade: PatternData = {
  key: 'facade',
  name: 'Facade',
  category: 'Structural',
  description: 'Provides a simplified interface to a complex subsystem.',
  nodes: [
    cls('facade-class', 'Facade', 280, 40,
      [a('-', 'subsystemA', 'SubsystemA'), a('-', 'subsystemB', 'SubsystemB'), a('-', 'subsystemC', 'SubsystemC')],
      [m('+', 'operation', '', 'void')]),
    cls('subsystem-a', 'SubsystemA', 40, 300, [], [m('+', 'operationA', '', 'string')]),
    cls('subsystem-b', 'SubsystemB', 280, 300, [], [m('+', 'operationB', '', 'string')]),
    cls('subsystem-c', 'SubsystemC', 520, 300, [], [m('+', 'operationC', '', 'string')]),
  ],
  edges: [
    edge('e-fa', 'facade-class', 'subsystem-a', 'dependency', 'bottom', 'top'),
    edge('e-fb', 'facade-class', 'subsystem-b', 'dependency', 'bottom', 'top'),
    edge('e-fc', 'facade-class', 'subsystem-c', 'dependency', 'bottom', 'top'),
  ],
}

// ─── Flyweight ────────────────────────────────────────────────────────────────
const flyweight: PatternData = {
  key: 'flyweight',
  name: 'Flyweight',
  category: 'Structural',
  description: 'Shares common, immutable state across many objects to reduce memory footprint.',
  nodes: [
    iface('flyweight-iface', 'Flyweight', 300, 40, [m('+', 'operation', 'extrinsic: State', 'void')]),
    cls('concrete-flyweight', 'ConcreteFlyweight', 80, 300, [a('-', 'intrinsicState', 'String')],
      [m('+', 'operation', 'extrinsic: State', 'void')]),
    cls('flyweight-factory', 'FlyweightFactory', 520, 300, [a('-', 'pool', 'Map<String, Flyweight>')],
      [m('+', 'getFlyweight', 'key: String', 'Flyweight')]),
    cls('client', 'Client', 520, 540, [], [m('+', 'operation', '', 'void')]),
  ],
  edges: [
    edge('e-cf', 'concrete-flyweight', 'flyweight-iface', 'realization', 'top', 'bottom'),
    edge('e-ff-dep', 'flyweight-factory', 'flyweight-iface', 'dependency', 'top', 'bottom'),
    edge('e-ff-cache', 'flyweight-factory', 'concrete-flyweight', 'aggregation', 'left', 'right'),
    edge('e-client', 'client', 'flyweight-factory', 'association', 'top', 'bottom'),
  ],
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
const proxy: PatternData = {
  key: 'proxy',
  name: 'Proxy',
  category: 'Structural',
  description: 'Provides a surrogate or placeholder for another object to control access to it.',
  nodes: [
    iface('subject-iface', 'Subject', 280, 40, [m('+', 'request', '', 'void')]),
    cls('real-subject', 'RealSubject', 80, 300, [], [m('+', 'request', '', 'void')]),
    cls('proxy-class', 'Proxy', 480, 300,
      [a('-', 'realSubject', 'RealSubject'), a('-', 'accessLog', 'List<String>')],
      [m('+', 'request', '', 'void'), m('-', 'checkAccess', '', 'boolean')]),
  ],
  edges: [
    edge('e-rs', 'real-subject', 'subject-iface', 'realization', 'top', 'bottom'),
    edge('e-px', 'proxy-class', 'subject-iface', 'realization', 'top', 'bottom'),
    edge('e-ref', 'proxy-class', 'real-subject', 'association', 'left', 'right'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL
// ════════════════════════════════════════════════════════════════════════════

// ─── Chain of Responsibility ──────────────────────────────────────────────────
const chainOfResponsibility: PatternData = {
  key: 'chain-of-responsibility',
  name: 'Chain of Responsibility',
  category: 'Behavioral',
  description: 'Passes a request along a chain of handlers until one of them handles it.',
  nodes: [
    abstractCls('handler-abs', 'Handler', 300, 40, [a('-', 'successor', 'Handler')],
      [m('+', 'setNext', 'h: Handler', 'void'), m('+', 'handle', 'req: Request', 'void', false, true)]),
    cls('handler-a', 'ConcreteHandlerA', 80, 300, [], [m('+', 'handle', 'req: Request', 'void')]),
    cls('handler-b', 'ConcreteHandlerB', 300, 300, [], [m('+', 'handle', 'req: Request', 'void')]),
    cls('handler-c', 'ConcreteHandlerC', 520, 300, [], [m('+', 'handle', 'req: Request', 'void')]),
    cls('request', 'Request', 750, 40, [a('-', 'level', 'int')], []),
  ],
  edges: [
    edge('e-ha', 'handler-a', 'handler-abs', 'inheritance', 'top', 'bottom'),
    edge('e-hb', 'handler-b', 'handler-abs', 'inheritance', 'top', 'bottom'),
    edge('e-hc', 'handler-c', 'handler-abs', 'inheritance', 'top', 'bottom'),
    edge('e-chain', 'handler-abs', 'handler-abs', 'aggregation', 'right', 'bottom'),
    edge('e-req', 'handler-abs', 'request', 'dependency', 'right', 'left'),
  ],
}

// ─── Command ──────────────────────────────────────────────────────────────────
const command: PatternData = {
  key: 'command',
  name: 'Command',
  category: 'Behavioral',
  description: 'Turns a request into a stand-alone object, so it can be queued, undone, or parameterized.',
  nodes: [
    iface('command-iface', 'Command', 300, 40, [m('+', 'execute', '', 'void')]),
    cls('concrete-command', 'ConcreteCommand', 80, 300, [a('-', 'receiver', 'Receiver')], [m('+', 'execute', '', 'void')]),
    cls('receiver', 'Receiver', 80, 540, [], [m('+', 'action', '', 'void')]),
    cls('invoker', 'Invoker', 520, 300, [a('-', 'command', 'Command')],
      [m('+', 'setCommand', 'c: Command', 'void'), m('+', 'executeCommand', '', 'void')]),
  ],
  edges: [
    edge('e-cc', 'concrete-command', 'command-iface', 'realization', 'top', 'bottom'),
    edge('e-recv', 'concrete-command', 'receiver', 'association', 'bottom', 'top'),
    edge('e-inv', 'invoker', 'command-iface', 'association', 'top', 'bottom'),
  ],
}

// ─── Interpreter ──────────────────────────────────────────────────────────────
const interpreter: PatternData = {
  key: 'interpreter',
  name: 'Interpreter',
  category: 'Behavioral',
  description: 'Defines a grammar for a language and an interpreter that evaluates sentences in it.',
  nodes: [
    iface('expression-iface', 'Expression', 300, 40, [m('+', 'interpret', 'ctx: Context', 'int')]),
    cls('terminal-expr', 'TerminalExpression', 80, 300, [a('-', 'value', 'int')], [m('+', 'interpret', 'ctx: Context', 'int')]),
    cls('nonterminal-expr', 'NonterminalExpression', 520, 300,
      [a('-', 'left', 'Expression'), a('-', 'right', 'Expression')], [m('+', 'interpret', 'ctx: Context', 'int')]),
    cls('context', 'Context', 300, 540, [a('-', 'variables', 'Map<String, int>')], []),
  ],
  edges: [
    edge('e-term', 'terminal-expr', 'expression-iface', 'realization', 'top', 'bottom'),
    edge('e-nonterm', 'nonterminal-expr', 'expression-iface', 'realization', 'top', 'bottom'),
    edge('e-tree', 'nonterminal-expr', 'expression-iface', 'aggregation', 'left', 'right'),
    edge('e-ctx', 'terminal-expr', 'context', 'dependency', 'bottom', 'top'),
  ],
}

// ─── Iterator ─────────────────────────────────────────────────────────────────
const iterator: PatternData = {
  key: 'iterator',
  name: 'Iterator',
  category: 'Behavioral',
  description: 'Provides a way to access elements of a collection sequentially without exposing its internals.',
  nodes: [
    iface('aggregate-iface', 'Aggregate', 80, 40, [m('+', 'createIterator', '', 'Iterator')]),
    cls('concrete-aggregate', 'ConcreteAggregate', 80, 300, [], [m('+', 'createIterator', '', 'Iterator')]),
    iface('iterator-iface', 'Iterator', 520, 40, [m('+', 'hasNext', '', 'boolean'), m('+', 'next', '', 'Object')]),
    cls('concrete-iterator', 'ConcreteIterator', 520, 300,
      [a('-', 'collection', 'ConcreteAggregate'), a('-', 'index', 'int')], []),
  ],
  edges: [
    edge('e-agg', 'concrete-aggregate', 'aggregate-iface', 'realization', 'top', 'bottom'),
    edge('e-it', 'concrete-iterator', 'iterator-iface', 'realization', 'top', 'bottom'),
    edge('e-creates', 'concrete-aggregate', 'concrete-iterator', 'dependency', 'right', 'left'),
    edge('e-returns', 'aggregate-iface', 'iterator-iface', 'dependency', 'right', 'left'),
  ],
}

// ─── Mediator ─────────────────────────────────────────────────────────────────
const mediator: PatternData = {
  key: 'mediator',
  name: 'Mediator',
  category: 'Behavioral',
  description: 'Encapsulates how a set of objects interact, keeping them from referring to each other directly.',
  nodes: [
    iface('mediator-iface', 'Mediator', 280, 40, [m('+', 'notify', 'sender: Component, event: String', 'void')]),
    cls('concrete-mediator', 'ConcreteMediator', 280, 300, [], [m('+', 'notify', 'sender: Component, event: String', 'void')]),
    abstractCls('component-abs', 'Component', 620, 40, [a('-', 'mediator', 'Mediator')], []),
    cls('concrete-component', 'ConcreteComponent', 620, 300, [], [m('+', 'changed', '', 'void')]),
  ],
  edges: [
    edge('e-cm', 'concrete-mediator', 'mediator-iface', 'realization', 'top', 'bottom'),
    edge('e-comp', 'concrete-component', 'component-abs', 'inheritance', 'top', 'bottom'),
    edge('e-knows', 'component-abs', 'mediator-iface', 'association', 'left', 'right'),
    edge('e-coord', 'concrete-mediator', 'component-abs', 'association', 'right', 'left'),
  ],
}

// ─── Memento ──────────────────────────────────────────────────────────────────
const memento: PatternData = {
  key: 'memento',
  name: 'Memento',
  category: 'Behavioral',
  description: "Captures and restores an object's internal state without violating encapsulation.",
  nodes: [
    cls('originator', 'Originator', 80, 40, [a('-', 'state', 'String')],
      [m('+', 'save', '', 'Memento'), m('+', 'restore', 'm: Memento', 'void')]),
    cls('memento', 'Memento', 500, 40, [a('-', 'state', 'String')], [m('+', 'getState', '', 'String')]),
    cls('caretaker', 'Caretaker', 280, 300, [a('-', 'history', 'List<Memento>')],
      [m('+', 'addMemento', 'm: Memento', 'void'), m('+', 'getMemento', 'i: int', 'Memento')]),
  ],
  edges: [
    edge('e-creates', 'originator', 'memento', 'dependency', 'right', 'left'),
    edge('e-stores', 'caretaker', 'memento', 'aggregation', 'top', 'bottom'),
    edge('e-requests', 'caretaker', 'originator', 'association', 'top', 'bottom'),
  ],
}

// ─── Observer ─────────────────────────────────────────────────────────────────
const observer: PatternData = {
  key: 'observer',
  name: 'Observer',
  category: 'Behavioral',
  description: 'Defines a one-to-many dependency; when one object changes state, all dependents are notified.',
  nodes: [
    iface('subject-iface2', 'Subject', 80, 40,
      [m('+', 'subscribe', 'o: Observer', 'void'), m('+', 'unsubscribe', 'o: Observer', 'void'), m('+', 'notifyObservers', '', 'void')]),
    iface('observer-iface', 'Observer', 500, 40, [m('+', 'update', 'subject: Subject', 'void')]),
    cls('concrete-subject', 'ConcreteSubject', 80, 300,
      [a('-', 'observers', 'List<Observer>'), a('-', 'state', 'String')],
      [m('+', 'getState', '', 'String'), m('+', 'setState', 'state: String', 'void')]),
    cls('concrete-observer', 'ConcreteObserver', 500, 300, [a('-', 'name', 'String')],
      [m('+', 'update', 'subject: Subject', 'void')]),
  ],
  edges: [
    edge('e-cs', 'concrete-subject', 'subject-iface2', 'realization', 'top', 'bottom'),
    edge('e-co', 'concrete-observer', 'observer-iface', 'realization', 'top', 'bottom'),
    edge('e-dep', 'subject-iface2', 'observer-iface', 'association', 'right', 'left'),
  ],
}

// ─── State ────────────────────────────────────────────────────────────────────
const state: PatternData = {
  key: 'state',
  name: 'State',
  category: 'Behavioral',
  description: "Lets an object alter its behavior when its internal state changes, appearing to change class.",
  nodes: [
    cls('context', 'Context', 300, 40, [a('-', 'state', 'State')],
      [m('+', 'setState', 's: State', 'void'), m('+', 'request', '', 'void')]),
    iface('state-iface', 'State', 300, 300, [m('+', 'handle', 'ctx: Context', 'void')]),
    cls('concrete-state-a', 'ConcreteStateA', 80, 540, [], [m('+', 'handle', 'ctx: Context', 'void')]),
    cls('concrete-state-b', 'ConcreteStateB', 520, 540, [], [m('+', 'handle', 'ctx: Context', 'void')]),
  ],
  edges: [
    edge('e-ctx', 'context', 'state-iface', 'association', 'bottom', 'top'),
    edge('e-sa', 'concrete-state-a', 'state-iface', 'realization', 'top', 'bottom'),
    edge('e-sb', 'concrete-state-b', 'state-iface', 'realization', 'top', 'bottom'),
  ],
}

// ─── Strategy ─────────────────────────────────────────────────────────────────
const strategy: PatternData = {
  key: 'strategy',
  name: 'Strategy',
  category: 'Behavioral',
  description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
  nodes: [
    iface('strategy-iface', 'Strategy', 280, 40, [m('+', 'execute', 'context: Context', 'void')]),
    cls('concrete-a', 'ConcreteStrategyA', 80, 300, [], [m('+', 'execute', 'context: Context', 'void')]),
    cls('concrete-b', 'ConcreteStrategyB', 430, 300, [], [m('+', 'execute', 'context: Context', 'void')]),
    cls('context', 'Context', 680, 180, [a('-', 'strategy', 'Strategy')],
      [m('+', 'setStrategy', 's: Strategy', 'void'), m('+', 'executeStrategy', '', 'void')]),
  ],
  edges: [
    edge('e-ca', 'concrete-a', 'strategy-iface', 'realization', 'top', 'bottom'),
    edge('e-cb', 'concrete-b', 'strategy-iface', 'realization', 'top', 'bottom'),
    edge('e-ctx', 'context', 'strategy-iface', 'association', 'left', 'right'),
  ],
}

// ─── Template Method ─────────────────────────────────────────────────────────
const templateMethod: PatternData = {
  key: 'template-method',
  name: 'Template Method',
  category: 'Behavioral',
  description: 'Defines the skeleton of an algorithm in a base class, letting subclasses override specific steps.',
  nodes: [
    abstractCls('abstract-class', 'AbstractClass', 300, 40, [],
      [m('+', 'templateMethod', '', 'void'), m('+', 'primitiveOp1', '', 'void', false, true), m('+', 'primitiveOp2', '', 'void', false, true)]),
    cls('concrete-a', 'ConcreteClassA', 80, 320, [], [m('+', 'primitiveOp1', '', 'void'), m('+', 'primitiveOp2', '', 'void')]),
    cls('concrete-b', 'ConcreteClassB', 520, 320, [], [m('+', 'primitiveOp1', '', 'void'), m('+', 'primitiveOp2', '', 'void')]),
  ],
  edges: [
    edge('e-ca', 'concrete-a', 'abstract-class', 'inheritance', 'top', 'bottom'),
    edge('e-cb', 'concrete-b', 'abstract-class', 'inheritance', 'top', 'bottom'),
  ],
}

// ─── Visitor ──────────────────────────────────────────────────────────────────
const visitor: PatternData = {
  key: 'visitor',
  name: 'Visitor',
  category: 'Behavioral',
  description: 'Separates an algorithm from the objects it operates on by moving it into a visitor object.',
  nodes: [
    iface('visitor-iface', 'Visitor', 80, 40, [m('+', 'visitElementA', 'e: ElementA', 'void'), m('+', 'visitElementB', 'e: ElementB', 'void')]),
    cls('concrete-visitor', 'ConcreteVisitor', 80, 300, [], [m('+', 'visitElementA', 'e: ElementA', 'void'), m('+', 'visitElementB', 'e: ElementB', 'void')]),
    iface('element-iface', 'Element', 520, 40, [m('+', 'accept', 'v: Visitor', 'void')]),
    cls('concrete-element-a', 'ConcreteElementA', 420, 300, [], [m('+', 'accept', 'v: Visitor', 'void')]),
    cls('concrete-element-b', 'ConcreteElementB', 680, 300, [], [m('+', 'accept', 'v: Visitor', 'void')]),
  ],
  edges: [
    edge('e-cv', 'concrete-visitor', 'visitor-iface', 'realization', 'top', 'bottom'),
    edge('e-ea', 'concrete-element-a', 'element-iface', 'realization', 'top', 'bottom'),
    edge('e-eb', 'concrete-element-b', 'element-iface', 'realization', 'top', 'bottom'),
    edge('e-visits', 'visitor-iface', 'element-iface', 'dependency', 'right', 'left'),
  ],
}

// ─── All 23 classic Gang-of-Four patterns, grouped by category ───────────────
export const ALL_PATTERNS: PatternData[] = [
  singleton, factoryMethod, abstractFactory, builder, prototype,
  adapter, bridge, composite, decorator, facade, flyweight, proxy,
  chainOfResponsibility, command, interpreter, iterator, mediator,
  memento, observer, state, strategy, templateMethod, visitor,
]

export const PATTERN_BY_KEY = new Map<string, PatternData>(
  ALL_PATTERNS.map(p => [p.key, p]),
)
