import type { UMLAttribute, UMLEdgeData, UMLMethod, Visibility, RelationshipType } from '@/types'
import type { HandleSide } from '@/data/patterns/types'

let _seq = 0
const nid = () => `s${++_seq}`

/**
 * Recommended canvas grid for solution diagrams.
 * Use at least COL wide / ROW tall between node anchors so edges and labels don't collide.
 * Example: cls('a', 'Foo', GRID.x(0), GRID.y(0), ...)
 */
export const GRID = {
  /** Horizontal gap between columns (px). */
  COL: 340,
  /** Vertical gap between rows (px). */
  ROW: 260,
  x: (col: number, offset = 40) => offset + col * 340,
  y: (row: number, offset = 40) => offset + row * 260,
} as const

/** Reset id counter between diagrams so snapshots stay deterministic within a module. */
export function resetUmlIds() {
  _seq = 0
}

export function attr(v: Visibility, name: string, type: string, isStatic = false): UMLAttribute {
  return { id: nid(), visibility: v, name, type, isStatic }
}

export function method(
  v: Visibility,
  name: string,
  params: string,
  ret: string,
  opts?: { isStatic?: boolean; isAbstract?: boolean; isConstructor?: boolean },
): UMLMethod {
  return {
    id: nid(),
    visibility: v,
    name,
    params,
    returnType: ret,
    isStatic: opts?.isStatic ?? false,
    isAbstract: opts?.isAbstract ?? false,
    isConstructor: opts?.isConstructor,
  }
}

export function cls(
  id: string,
  name: string,
  x: number,
  y: number,
  attributes: UMLAttribute[],
  methods: UMLMethod[],
  stereotype?: string,
) {
  return {
    id,
    type: 'class' as const,
    position: { x, y },
    data: {
      nodeType: 'class' as const,
      name,
      stereotype,
      attributes,
      methods,
      alwaysExpanded: true,
    },
  }
}

export function abstractCls(
  id: string,
  name: string,
  x: number,
  y: number,
  attributes: UMLAttribute[],
  methods: UMLMethod[],
) {
  return {
    id,
    type: 'abstract-class' as const,
    position: { x, y },
    data: {
      nodeType: 'abstract-class' as const,
      name,
      attributes,
      methods,
      alwaysExpanded: true,
    },
  }
}

export function iface(id: string, name: string, x: number, y: number, methods: UMLMethod[]) {
  return {
    id,
    type: 'interface' as const,
    position: { x, y },
    data: {
      nodeType: 'interface' as const,
      name,
      attributes: [] as UMLAttribute[],
      methods,
      alwaysExpanded: true,
    },
  }
}

export function enm(
  id: string,
  name: string,
  x: number,
  y: number,
  values: string[],
) {
  return {
    id,
    type: 'enum' as const,
    position: { x, y },
    data: {
      nodeType: 'enum' as const,
      name,
      attributes: values.map(v => attr('+', v, '')),
      methods: [] as UMLMethod[],
      alwaysExpanded: true,
    },
  }
}

export function edge(
  id: string,
  source: string,
  target: string,
  type: RelationshipType,
  sourceHandle: HandleSide,
  targetHandle: HandleSide,
  extras?: Partial<UMLEdgeData>,
) {
  return {
    id,
    source,
    target,
    type,
    sourceHandle,
    targetHandle,
    data: { relationshipType: type, ...extras },
  }
}
