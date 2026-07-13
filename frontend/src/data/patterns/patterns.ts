import type { PatternData } from './types'
import type { UMLAttribute, UMLMethod, Visibility } from '@/types'

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

// ─── Singleton ────────────────────────────────────────────────────────────────
const singleton: PatternData = {
  key: 'singleton',
  name: 'Singleton',
  category: 'Creational',
  description: 'Ensures only one instance of a class exists and provides a global access point.',
  nodes: [
    {
      id: 'singleton-class',
      type: 'class',
      position: { x: 200, y: 150 },
      data: {
        nodeType: 'class',
        name: 'Singleton',
        stereotype: 'Singleton',
        attributes: [a('-', 'instance', 'Singleton', true)],
        methods: [
          m('-', 'Singleton', '', 'void', false, false, true),
          m('+', 'getInstance', '', 'Singleton', true),
          m('+', 'businessLogic', '', 'void'),
        ],
      },
    },
  ],
  edges: [],
}

// ─── Factory Method ───────────────────────────────────────────────────────────
const factoryMethod: PatternData = {
  key: 'factory',
  name: 'Factory Method',
  category: 'Creational',
  description: 'Defines an interface for creating objects, letting subclasses decide which class to instantiate.',
  nodes: [
    {
      id: 'creator',
      type: 'abstract-class',
      position: { x: 80, y: 50 },
      data: {
        nodeType: 'abstract-class',
        name: 'Creator',
        attributes: [],
        methods: [
          m('+', 'createProduct', '', 'Product', false, true),
          m('+', 'doSomething', '', 'void'),
        ],
      },
    },
    {
      id: 'concrete-creator',
      type: 'class',
      position: { x: 80, y: 300 },
      data: {
        nodeType: 'class',
        name: 'ConcreteCreator',
        attributes: [],
        methods: [m('+', 'createProduct', '', 'Product')],
      },
    },
    {
      id: 'product-iface',
      type: 'interface',
      position: { x: 480, y: 50 },
      data: {
        nodeType: 'interface',
        name: 'Product',
        attributes: [],
        methods: [m('+', 'operation', '', 'string')],
      },
    },
    {
      id: 'concrete-product',
      type: 'class',
      position: { x: 480, y: 300 },
      data: {
        nodeType: 'class',
        name: 'ConcreteProduct',
        attributes: [],
        methods: [m('+', 'operation', '', 'string')],
      },
    },
  ],
  edges: [
    { id: 'e-creator-dep', source: 'creator', target: 'product-iface', type: 'dependency', data: { relationshipType: 'dependency' } },
    { id: 'e-cc-inherit', source: 'concrete-creator', target: 'creator', type: 'inheritance', data: { relationshipType: 'inheritance' } },
    { id: 'e-cp-realize', source: 'concrete-product', target: 'product-iface', type: 'realization', data: { relationshipType: 'realization' } },
  ],
}

// ─── Abstract Factory ─────────────────────────────────────────────────────────
const abstractFactory: PatternData = {
  key: 'abstract-factory',
  name: 'Abstract Factory',
  category: 'Creational',
  description: 'Provides an interface for creating families of related objects without specifying concrete classes.',
  nodes: [
    {
      id: 'abs-factory',
      type: 'interface',
      position: { x: 300, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'AbstractFactory',
        attributes: [],
        methods: [
          m('+', 'createProductA', '', 'AbstractProductA'),
          m('+', 'createProductB', '', 'AbstractProductB'),
        ],
      },
    },
    {
      id: 'factory1',
      type: 'class',
      position: { x: 80, y: 260 },
      data: {
        nodeType: 'class',
        name: 'ConcreteFactory1',
        attributes: [],
        methods: [
          m('+', 'createProductA', '', 'AbstractProductA'),
          m('+', 'createProductB', '', 'AbstractProductB'),
        ],
      },
    },
    {
      id: 'factory2',
      type: 'class',
      position: { x: 420, y: 260 },
      data: {
        nodeType: 'class',
        name: 'ConcreteFactory2',
        attributes: [],
        methods: [
          m('+', 'createProductA', '', 'AbstractProductA'),
          m('+', 'createProductB', '', 'AbstractProductB'),
        ],
      },
    },
    {
      id: 'abs-product-a',
      type: 'interface',
      position: { x: 750, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'AbstractProductA',
        attributes: [],
        methods: [m('+', 'operationA', '', 'string')],
      },
    },
    {
      id: 'abs-product-b',
      type: 'interface',
      position: { x: 750, y: 200 },
      data: {
        nodeType: 'interface',
        name: 'AbstractProductB',
        attributes: [],
        methods: [m('+', 'operationB', '', 'string')],
      },
    },
  ],
  edges: [
    { id: 'e-f1', source: 'factory1', target: 'abs-factory', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-f2', source: 'factory2', target: 'abs-factory', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-dep-a', source: 'abs-factory', target: 'abs-product-a', type: 'dependency', data: { relationshipType: 'dependency' } },
    { id: 'e-dep-b', source: 'abs-factory', target: 'abs-product-b', type: 'dependency', data: { relationshipType: 'dependency' } },
  ],
}

// ─── Builder ──────────────────────────────────────────────────────────────────
const builder: PatternData = {
  key: 'builder',
  name: 'Builder',
  category: 'Creational',
  description: 'Separates the construction of a complex object from its representation.',
  nodes: [
    {
      id: 'builder-iface',
      type: 'interface',
      position: { x: 80, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'Builder',
        attributes: [],
        methods: [
          m('+', 'buildPartA', '', 'void'),
          m('+', 'buildPartB', '', 'void'),
          m('+', 'getResult', '', 'Product'),
        ],
      },
    },
    {
      id: 'concrete-builder',
      type: 'class',
      position: { x: 80, y: 300 },
      data: {
        nodeType: 'class',
        name: 'ConcreteBuilder',
        attributes: [a('-', 'product', 'Product')],
        methods: [
          m('+', 'buildPartA', '', 'void'),
          m('+', 'buildPartB', '', 'void'),
          m('+', 'getResult', '', 'Product'),
        ],
      },
    },
    {
      id: 'director',
      type: 'class',
      position: { x: 500, y: 150 },
      data: {
        nodeType: 'class',
        name: 'Director',
        attributes: [a('-', 'builder', 'Builder')],
        methods: [
          m('+', 'setBuilder', 'b: Builder', 'void'),
          m('+', 'construct', '', 'void'),
        ],
      },
    },
    {
      id: 'product',
      type: 'class',
      position: { x: 500, y: 380 },
      data: {
        nodeType: 'class',
        name: 'Product',
        attributes: [a('-', 'partA', 'String'), a('-', 'partB', 'String')],
        methods: [m('+', 'toString', '', 'String')],
      },
    },
  ],
  edges: [
    { id: 'e-cb', source: 'concrete-builder', target: 'builder-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-dir', source: 'director', target: 'builder-iface', type: 'association', data: { relationshipType: 'association' } },
    { id: 'e-prod', source: 'concrete-builder', target: 'product', type: 'dependency', data: { relationshipType: 'dependency' } },
  ],
}

// ─── Adapter ──────────────────────────────────────────────────────────────────
const adapter: PatternData = {
  key: 'adapter',
  name: 'Adapter',
  category: 'Structural',
  description: 'Converts the interface of a class into another interface that clients expect.',
  nodes: [
    {
      id: 'target-iface',
      type: 'interface',
      position: { x: 80, y: 100 },
      data: {
        nodeType: 'interface',
        name: 'Target',
        attributes: [],
        methods: [m('+', 'request', '', 'string')],
      },
    },
    {
      id: 'adapter-class',
      type: 'class',
      position: { x: 80, y: 320 },
      data: {
        nodeType: 'class',
        name: 'Adapter',
        attributes: [a('-', 'adaptee', 'Adaptee')],
        methods: [m('+', 'request', '', 'string')],
      },
    },
    {
      id: 'adaptee',
      type: 'class',
      position: { x: 450, y: 100 },
      data: {
        nodeType: 'class',
        name: 'Adaptee',
        attributes: [],
        methods: [m('+', 'specificRequest', '', 'string')],
      },
    },
  ],
  edges: [
    { id: 'e-adapt', source: 'adapter-class', target: 'target-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-dep', source: 'adapter-class', target: 'adaptee', type: 'association', data: { relationshipType: 'association' } },
  ],
}

// ─── Decorator ────────────────────────────────────────────────────────────────
const decorator: PatternData = {
  key: 'decorator',
  name: 'Decorator',
  category: 'Structural',
  description: 'Attaches additional responsibilities to an object dynamically without changing its interface.',
  nodes: [
    {
      id: 'component-iface',
      type: 'interface',
      position: { x: 300, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'Component',
        attributes: [],
        methods: [m('+', 'operation', '', 'string')],
      },
    },
    {
      id: 'concrete-component',
      type: 'class',
      position: { x: 80, y: 260 },
      data: {
        nodeType: 'class',
        name: 'ConcreteComponent',
        attributes: [],
        methods: [m('+', 'operation', '', 'string')],
      },
    },
    {
      id: 'decorator-abs',
      type: 'abstract-class',
      position: { x: 480, y: 260 },
      data: {
        nodeType: 'abstract-class',
        name: 'Decorator',
        attributes: [a('#', 'component', 'Component')],
        methods: [m('+', 'operation', '', 'string')],
      },
    },
    {
      id: 'concrete-decorator',
      type: 'class',
      position: { x: 480, y: 480 },
      data: {
        nodeType: 'class',
        name: 'ConcreteDecorator',
        attributes: [],
        methods: [
          m('+', 'operation', '', 'string'),
          m('+', 'addedBehavior', '', 'void'),
        ],
      },
    },
  ],
  edges: [
    { id: 'e-cc', source: 'concrete-component', target: 'component-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-da', source: 'decorator-abs', target: 'component-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-dec-wraps', source: 'decorator-abs', target: 'component-iface', type: 'aggregation', data: { relationshipType: 'aggregation' } },
    { id: 'e-cd', source: 'concrete-decorator', target: 'decorator-abs', type: 'inheritance', data: { relationshipType: 'inheritance' } },
  ],
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
const proxy: PatternData = {
  key: 'proxy',
  name: 'Proxy',
  category: 'Structural',
  description: 'Provides a surrogate or placeholder for another object to control access to it.',
  nodes: [
    {
      id: 'subject-iface',
      type: 'interface',
      position: { x: 280, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'Subject',
        attributes: [],
        methods: [m('+', 'request', '', 'void')],
      },
    },
    {
      id: 'real-subject',
      type: 'class',
      position: { x: 80, y: 260 },
      data: {
        nodeType: 'class',
        name: 'RealSubject',
        attributes: [],
        methods: [m('+', 'request', '', 'void')],
      },
    },
    {
      id: 'proxy-class',
      type: 'class',
      position: { x: 450, y: 260 },
      data: {
        nodeType: 'class',
        name: 'Proxy',
        attributes: [
          a('-', 'realSubject', 'RealSubject'),
          a('-', 'accessLog', 'List<String>'),
        ],
        methods: [
          m('+', 'request', '', 'void'),
          m('-', 'checkAccess', '', 'boolean'),
        ],
      },
    },
  ],
  edges: [
    { id: 'e-rs', source: 'real-subject', target: 'subject-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-px', source: 'proxy-class', target: 'subject-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-ref', source: 'proxy-class', target: 'real-subject', type: 'association', data: { relationshipType: 'association' } },
  ],
}

// ─── Facade ───────────────────────────────────────────────────────────────────
const facade: PatternData = {
  key: 'facade',
  name: 'Facade',
  category: 'Structural',
  description: 'Provides a simplified interface to a complex subsystem.',
  nodes: [
    {
      id: 'facade-class',
      type: 'class',
      position: { x: 280, y: 40 },
      data: {
        nodeType: 'class',
        stereotype: 'Facade',
        name: 'Facade',
        attributes: [
          a('-', 'subsystemA', 'SubsystemA'),
          a('-', 'subsystemB', 'SubsystemB'),
          a('-', 'subsystemC', 'SubsystemC'),
        ],
        methods: [m('+', 'operation', '', 'void')],
      },
    },
    {
      id: 'subsystem-a',
      type: 'class',
      position: { x: 40, y: 280 },
      data: { nodeType: 'class', name: 'SubsystemA', attributes: [], methods: [m('+', 'operationA', '', 'string')] },
    },
    {
      id: 'subsystem-b',
      type: 'class',
      position: { x: 280, y: 280 },
      data: { nodeType: 'class', name: 'SubsystemB', attributes: [], methods: [m('+', 'operationB', '', 'string')] },
    },
    {
      id: 'subsystem-c',
      type: 'class',
      position: { x: 520, y: 280 },
      data: { nodeType: 'class', name: 'SubsystemC', attributes: [], methods: [m('+', 'operationC', '', 'string')] },
    },
  ],
  edges: [
    { id: 'e-fa', source: 'facade-class', target: 'subsystem-a', type: 'dependency', data: { relationshipType: 'dependency' } },
    { id: 'e-fb', source: 'facade-class', target: 'subsystem-b', type: 'dependency', data: { relationshipType: 'dependency' } },
    { id: 'e-fc', source: 'facade-class', target: 'subsystem-c', type: 'dependency', data: { relationshipType: 'dependency' } },
  ],
}

// ─── Strategy ─────────────────────────────────────────────────────────────────
const strategy: PatternData = {
  key: 'strategy',
  name: 'Strategy',
  category: 'Behavioral',
  description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
  nodes: [
    {
      id: 'strategy-iface',
      type: 'interface',
      position: { x: 280, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'Strategy',
        attributes: [],
        methods: [m('+', 'execute', 'context: Context', 'void')],
      },
    },
    {
      id: 'concrete-a',
      type: 'class',
      position: { x: 80, y: 260 },
      data: {
        nodeType: 'class',
        name: 'ConcreteStrategyA',
        attributes: [],
        methods: [m('+', 'execute', 'context: Context', 'void')],
      },
    },
    {
      id: 'concrete-b',
      type: 'class',
      position: { x: 430, y: 260 },
      data: {
        nodeType: 'class',
        name: 'ConcreteStrategyB',
        attributes: [],
        methods: [m('+', 'execute', 'context: Context', 'void')],
      },
    },
    {
      id: 'context',
      type: 'class',
      position: { x: 680, y: 140 },
      data: {
        nodeType: 'class',
        name: 'Context',
        attributes: [a('-', 'strategy', 'Strategy')],
        methods: [
          m('+', 'setStrategy', 's: Strategy', 'void'),
          m('+', 'executeStrategy', '', 'void'),
        ],
      },
    },
  ],
  edges: [
    { id: 'e-ca', source: 'concrete-a', target: 'strategy-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-cb', source: 'concrete-b', target: 'strategy-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-ctx', source: 'context', target: 'strategy-iface', type: 'association', data: { relationshipType: 'association' } },
  ],
}

// ─── Observer ─────────────────────────────────────────────────────────────────
const observer: PatternData = {
  key: 'observer',
  name: 'Observer',
  category: 'Behavioral',
  description: 'Defines a one-to-many dependency; when one object changes state, all dependents are notified.',
  nodes: [
    {
      id: 'subject-iface',
      type: 'interface',
      position: { x: 80, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'Subject',
        attributes: [],
        methods: [
          m('+', 'subscribe', 'o: Observer', 'void'),
          m('+', 'unsubscribe', 'o: Observer', 'void'),
          m('+', 'notifyObservers', '', 'void'),
        ],
      },
    },
    {
      id: 'observer-iface',
      type: 'interface',
      position: { x: 500, y: 40 },
      data: {
        nodeType: 'interface',
        name: 'Observer',
        attributes: [],
        methods: [m('+', 'update', 'subject: Subject', 'void')],
      },
    },
    {
      id: 'concrete-subject',
      type: 'class',
      position: { x: 80, y: 280 },
      data: {
        nodeType: 'class',
        name: 'ConcreteSubject',
        attributes: [
          a('-', 'observers', 'List<Observer>'),
          a('-', 'state', 'String'),
        ],
        methods: [
          m('+', 'getState', '', 'String'),
          m('+', 'setState', 'state: String', 'void'),
        ],
      },
    },
    {
      id: 'concrete-observer',
      type: 'class',
      position: { x: 500, y: 280 },
      data: {
        nodeType: 'class',
        name: 'ConcreteObserver',
        attributes: [a('-', 'name', 'String')],
        methods: [m('+', 'update', 'subject: Subject', 'void')],
      },
    },
  ],
  edges: [
    { id: 'e-cs', source: 'concrete-subject', target: 'subject-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-co', source: 'concrete-observer', target: 'observer-iface', type: 'realization', data: { relationshipType: 'realization' } },
    { id: 'e-dep', source: 'subject-iface', target: 'observer-iface', type: 'association', data: { relationshipType: 'association' } },
  ],
}

// ─── All patterns (Creational → Structural → Behavioral) ─────────────────────
export const ALL_PATTERNS: PatternData[] = [
  singleton, factoryMethod, abstractFactory, builder,
  adapter, decorator, proxy, facade,
  strategy, observer,
]

export const PATTERN_BY_KEY = new Map<string, PatternData>(
  ALL_PATTERNS.map(p => [p.key, p]),
)
