// Full node/edge skeletons for the 7 design patterns locked behind Pro
// (see PRO_ONLY_PATTERN_KEYS in ../config/plans.ts). These never ship in the
// public frontend bundle — frontend/src/data/patterns/patterns.ts only holds
// display metadata (name/category/description) for these keys, with empty
// nodes/edges. The actual content is served here, gated by plan, via
// GET /patterns/:key (controllers/pattern.controller.ts).
export interface ProPatternData {
  key: string
  name: string
  category: string
  description: string
  nodes: unknown[]
  edges: unknown[]
}

export const PRO_PATTERNS: Record<string, ProPatternData> = {
  singleton: {
    key: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    description: 'Ensures only one instance of a class exists and provides a global access point.',
    nodes: [
      {
        id: 'singleton-class', type: 'class', position: { x: 200, y: 150 },
        data: {
          nodeType: 'class', name: 'Singleton',
          attributes: [
            { id: 'p1', visibility: '-', name: 'instance', type: 'Singleton', isStatic: true },
          ],
          methods: [
            { id: 'p2', visibility: '-', name: 'Singleton', params: '', returnType: 'void', isStatic: false, isAbstract: false, isConstructor: true },
            { id: 'p3', visibility: '+', name: 'getInstance', params: '', returnType: 'Singleton', isStatic: true, isAbstract: false },
            { id: 'p4', visibility: '+', name: 'businessLogic', params: '', returnType: 'void', isStatic: false, isAbstract: false },
          ],
        },
      },
    ],
    edges: [],
  },

  'factory-method': {
    key: 'factory-method',
    name: 'Factory Method',
    category: 'Creational',
    description: 'Defines an interface for creating objects, letting subclasses decide which class to instantiate.',
    nodes: [
      {
        id: 'creator', type: 'abstract-class', position: { x: 80, y: 50 },
        data: {
          nodeType: 'abstract-class', name: 'Creator', attributes: [],
          methods: [
            { id: 'p5', visibility: '+', name: 'createProduct', params: '', returnType: 'Product', isStatic: false, isAbstract: true },
            { id: 'p6', visibility: '+', name: 'doSomething', params: '', returnType: 'void', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'concrete-creator', type: 'class', position: { x: 80, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteCreator', attributes: [],
          methods: [
            { id: 'p7', visibility: '+', name: 'createProduct', params: '', returnType: 'Product', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'product-iface', type: 'interface', position: { x: 480, y: 50 },
        data: {
          nodeType: 'interface', name: 'Product', attributes: [],
          methods: [
            { id: 'p8', visibility: '+', name: 'operation', params: '', returnType: 'string', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'concrete-product', type: 'class', position: { x: 480, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteProduct', attributes: [],
          methods: [
            { id: 'p9', visibility: '+', name: 'operation', params: '', returnType: 'string', isStatic: false, isAbstract: false },
          ],
        },
      },
    ],
    edges: [
      { id: 'e-creator-dep', source: 'creator', target: 'product-iface', type: 'dependency', sourceHandle: 'right', targetHandle: 'left', data: { relationshipType: 'dependency' } },
      { id: 'e-cc-inherit', source: 'concrete-creator', target: 'creator', type: 'inheritance', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'inheritance' } },
      { id: 'e-cp-realize', source: 'concrete-product', target: 'product-iface', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
    ],
  },

  'abstract-factory': {
    key: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    description: 'Provides an interface for creating families of related objects without specifying concrete classes.',
    nodes: [
      {
        id: 'abs-factory', type: 'interface', position: { x: 300, y: 40 },
        data: {
          nodeType: 'interface', name: 'AbstractFactory', attributes: [],
          methods: [
            { id: 'p10', visibility: '+', name: 'createProductA', params: '', returnType: 'AbstractProductA', isStatic: false, isAbstract: false },
            { id: 'p11', visibility: '+', name: 'createProductB', params: '', returnType: 'AbstractProductB', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'factory1', type: 'class', position: { x: 80, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteFactory1', attributes: [],
          methods: [
            { id: 'p12', visibility: '+', name: 'createProductA', params: '', returnType: 'AbstractProductA', isStatic: false, isAbstract: false },
            { id: 'p13', visibility: '+', name: 'createProductB', params: '', returnType: 'AbstractProductB', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'factory2', type: 'class', position: { x: 520, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteFactory2', attributes: [],
          methods: [
            { id: 'p14', visibility: '+', name: 'createProductA', params: '', returnType: 'AbstractProductA', isStatic: false, isAbstract: false },
            { id: 'p15', visibility: '+', name: 'createProductB', params: '', returnType: 'AbstractProductB', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'abs-product-a', type: 'interface', position: { x: 750, y: 40 },
        data: {
          nodeType: 'interface', name: 'AbstractProductA', attributes: [],
          methods: [{ id: 'p16', visibility: '+', name: 'operationA', params: '', returnType: 'string', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'abs-product-b', type: 'interface', position: { x: 750, y: 260 },
        data: {
          nodeType: 'interface', name: 'AbstractProductB', attributes: [],
          methods: [{ id: 'p17', visibility: '+', name: 'operationB', params: '', returnType: 'string', isStatic: false, isAbstract: false }],
        },
      },
    ],
    edges: [
      { id: 'e-f1', source: 'factory1', target: 'abs-factory', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-f2', source: 'factory2', target: 'abs-factory', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-dep-a', source: 'abs-factory', target: 'abs-product-a', type: 'dependency', sourceHandle: 'right', targetHandle: 'left', data: { relationshipType: 'dependency' } },
      { id: 'e-dep-b', source: 'abs-factory', target: 'abs-product-b', type: 'dependency', sourceHandle: 'right', targetHandle: 'left', data: { relationshipType: 'dependency' } },
    ],
  },

  observer: {
    key: 'observer',
    name: 'Observer',
    category: 'Behavioral',
    description: 'Defines a one-to-many dependency; when one object changes state, all dependents are notified.',
    nodes: [
      {
        id: 'subject-iface2', type: 'interface', position: { x: 80, y: 40 },
        data: {
          nodeType: 'interface', name: 'Subject', attributes: [],
          methods: [
            { id: 'p118', visibility: '+', name: 'subscribe', params: 'o: Observer', returnType: 'void', isStatic: false, isAbstract: false },
            { id: 'p119', visibility: '+', name: 'unsubscribe', params: 'o: Observer', returnType: 'void', isStatic: false, isAbstract: false },
            { id: 'p120', visibility: '+', name: 'notifyObservers', params: '', returnType: 'void', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'observer-iface', type: 'interface', position: { x: 500, y: 40 },
        data: {
          nodeType: 'interface', name: 'Observer', attributes: [],
          methods: [{ id: 'p121', visibility: '+', name: 'update', params: 'subject: Subject', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'concrete-subject', type: 'class', position: { x: 80, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteSubject',
          attributes: [
            { id: 'p122', visibility: '-', name: 'observers', type: 'List<Observer>', isStatic: false },
            { id: 'p123', visibility: '-', name: 'state', type: 'String', isStatic: false },
          ],
          methods: [
            { id: 'p124', visibility: '+', name: 'getState', params: '', returnType: 'String', isStatic: false, isAbstract: false },
            { id: 'p125', visibility: '+', name: 'setState', params: 'state: String', returnType: 'void', isStatic: false, isAbstract: false },
          ],
        },
      },
      {
        id: 'concrete-observer', type: 'class', position: { x: 500, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteObserver',
          attributes: [{ id: 'p126', visibility: '-', name: 'name', type: 'String', isStatic: false }],
          methods: [{ id: 'p127', visibility: '+', name: 'update', params: 'subject: Subject', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
    ],
    edges: [
      { id: 'e-cs', source: 'concrete-subject', target: 'subject-iface2', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-co', source: 'concrete-observer', target: 'observer-iface', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-dep', source: 'subject-iface2', target: 'observer-iface', type: 'association', sourceHandle: 'right', targetHandle: 'left', data: { relationshipType: 'association' } },
    ],
  },

  strategy: {
    key: 'strategy',
    name: 'Strategy',
    category: 'Behavioral',
    description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
    nodes: [
      {
        id: 'strategy-iface', type: 'interface', position: { x: 280, y: 40 },
        data: {
          nodeType: 'interface', name: 'Strategy', attributes: [],
          methods: [{ id: 'p134', visibility: '+', name: 'execute', params: 'context: Context', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'concrete-a', type: 'class', position: { x: 80, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteStrategyA', attributes: [],
          methods: [{ id: 'p135', visibility: '+', name: 'execute', params: 'context: Context', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'concrete-b', type: 'class', position: { x: 430, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteStrategyB', attributes: [],
          methods: [{ id: 'p136', visibility: '+', name: 'execute', params: 'context: Context', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'context', type: 'class', position: { x: 680, y: 180 },
        data: {
          nodeType: 'class', name: 'Context',
          attributes: [{ id: 'p137', visibility: '-', name: 'strategy', type: 'Strategy', isStatic: false }],
          methods: [
            { id: 'p138', visibility: '+', name: 'setStrategy', params: 's: Strategy', returnType: 'void', isStatic: false, isAbstract: false },
            { id: 'p139', visibility: '+', name: 'executeStrategy', params: '', returnType: 'void', isStatic: false, isAbstract: false },
          ],
        },
      },
    ],
    edges: [
      { id: 'e-ca', source: 'concrete-a', target: 'strategy-iface', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-cb', source: 'concrete-b', target: 'strategy-iface', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-ctx', source: 'context', target: 'strategy-iface', type: 'association', sourceHandle: 'left', targetHandle: 'right', data: { relationshipType: 'association' } },
    ],
  },

  decorator: {
    key: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    description: 'Attaches additional responsibilities to an object dynamically without changing its interface.',
    nodes: [
      {
        id: 'component-iface2', type: 'interface', position: { x: 300, y: 40 },
        data: {
          nodeType: 'interface', name: 'Component', attributes: [],
          methods: [{ id: 'p54', visibility: '+', name: 'operation', params: '', returnType: 'string', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'concrete-component', type: 'class', position: { x: 80, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteComponent', attributes: [],
          methods: [{ id: 'p55', visibility: '+', name: 'operation', params: '', returnType: 'string', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'decorator-abs', type: 'abstract-class', position: { x: 520, y: 300 },
        data: {
          nodeType: 'abstract-class', name: 'Decorator',
          attributes: [{ id: 'p56', visibility: '#', name: 'component', type: 'Component', isStatic: false }],
          methods: [{ id: 'p57', visibility: '+', name: 'operation', params: '', returnType: 'string', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'concrete-decorator', type: 'class', position: { x: 520, y: 540 },
        data: {
          nodeType: 'class', name: 'ConcreteDecorator', attributes: [],
          methods: [
            { id: 'p58', visibility: '+', name: 'operation', params: '', returnType: 'string', isStatic: false, isAbstract: false },
            { id: 'p59', visibility: '+', name: 'addedBehavior', params: '', returnType: 'void', isStatic: false, isAbstract: false },
          ],
        },
      },
    ],
    edges: [
      { id: 'e-cc', source: 'concrete-component', target: 'component-iface2', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-da', source: 'decorator-abs', target: 'component-iface2', type: 'realization', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'realization' } },
      { id: 'e-dec-wraps', source: 'decorator-abs', target: 'component-iface2', type: 'aggregation', sourceHandle: 'left', targetHandle: 'right', data: { relationshipType: 'aggregation' } },
      { id: 'e-cd', source: 'concrete-decorator', target: 'decorator-abs', type: 'inheritance', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'inheritance' } },
    ],
  },

  'chain-of-responsibility': {
    key: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    description: 'Passes a request along a chain of handlers until one of them handles it.',
    nodes: [
      {
        id: 'handler-abs', type: 'abstract-class', position: { x: 300, y: 40 },
        data: {
          nodeType: 'abstract-class', name: 'Handler',
          attributes: [{ id: 'p79', visibility: '-', name: 'successor', type: 'Handler', isStatic: false }],
          methods: [
            { id: 'p80', visibility: '+', name: 'setNext', params: 'h: Handler', returnType: 'void', isStatic: false, isAbstract: false },
            { id: 'p81', visibility: '+', name: 'handle', params: 'req: Request', returnType: 'void', isStatic: false, isAbstract: true },
          ],
        },
      },
      {
        id: 'handler-a', type: 'class', position: { x: 80, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteHandlerA', attributes: [],
          methods: [{ id: 'p82', visibility: '+', name: 'handle', params: 'req: Request', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'handler-b', type: 'class', position: { x: 300, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteHandlerB', attributes: [],
          methods: [{ id: 'p83', visibility: '+', name: 'handle', params: 'req: Request', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'handler-c', type: 'class', position: { x: 520, y: 300 },
        data: {
          nodeType: 'class', name: 'ConcreteHandlerC', attributes: [],
          methods: [{ id: 'p84', visibility: '+', name: 'handle', params: 'req: Request', returnType: 'void', isStatic: false, isAbstract: false }],
        },
      },
      {
        id: 'request', type: 'class', position: { x: 750, y: 40 },
        data: {
          nodeType: 'class', name: 'Request',
          attributes: [{ id: 'p85', visibility: '-', name: 'level', type: 'int', isStatic: false }],
          methods: [],
        },
      },
    ],
    edges: [
      { id: 'e-ha', source: 'handler-a', target: 'handler-abs', type: 'inheritance', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'inheritance' } },
      { id: 'e-hb', source: 'handler-b', target: 'handler-abs', type: 'inheritance', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'inheritance' } },
      { id: 'e-hc', source: 'handler-c', target: 'handler-abs', type: 'inheritance', sourceHandle: 'top', targetHandle: 'bottom', data: { relationshipType: 'inheritance' } },
      { id: 'e-chain', source: 'handler-abs', target: 'handler-abs', type: 'aggregation', sourceHandle: 'right', targetHandle: 'bottom', data: { relationshipType: 'aggregation' } },
      { id: 'e-req', source: 'handler-abs', target: 'request', type: 'dependency', sourceHandle: 'right', targetHandle: 'left', data: { relationshipType: 'dependency' } },
    ],
  },
}
