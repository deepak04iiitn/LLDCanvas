import type { DiagramInput } from './types'

/** Empty canvas */
export const FIXTURE_EMPTY: DiagramInput = { nodes: [], edges: [] }

/** Single class — old scoreEngine overscored this */
export const FIXTURE_SINGLE_CLASS: DiagramInput = {
  nodes: [
    {
      id: 'n1',
      data: {
        nodeType: 'class',
        name: 'Order',
        attributes: [{ id: 'a1', visibility: '+', name: 'id', type: 'string', isStatic: false }],
        methods: [],
      },
    },
  ],
  edges: [],
}

/** Inheritance cycle */
export const FIXTURE_CYCLE: DiagramInput = {
  nodes: [
    { id: 'a', data: { nodeType: 'class', name: 'A', attributes: [], methods: [] } },
    { id: 'b', data: { nodeType: 'class', name: 'B', attributes: [], methods: [] } },
  ],
  edges: [
    { id: 'e1', source: 'a', target: 'b', data: { relationshipType: 'dependency' } },
    { id: 'e2', source: 'b', target: 'a', data: { relationshipType: 'dependency' } },
  ],
}

/** Interface + implementor + client */
export const FIXTURE_DIP_OK: DiagramInput = {
  nodes: [
    {
      id: 'iface',
      data: {
        nodeType: 'interface',
        name: 'PaymentGateway',
        attributes: [],
        methods: [{ id: 'm1', visibility: '+', name: 'charge', params: '', returnType: 'void', isStatic: false, isAbstract: true }],
      },
    },
    {
      id: 'impl',
      data: { nodeType: 'class', name: 'StripeGateway', attributes: [], methods: [] },
    },
    {
      id: 'svc',
      data: { nodeType: 'class', name: 'CheckoutService', attributes: [], methods: [] },
    },
  ],
  edges: [
    { id: 'r1', source: 'impl', target: 'iface', data: { relationshipType: 'realization' } },
    { id: 'd1', source: 'svc', target: 'iface', data: { relationshipType: 'dependency' } },
  ],
}
