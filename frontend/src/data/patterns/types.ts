import type { UMLNodeData, UMLEdgeData } from '@/types'

export interface PatternNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: UMLNodeData
}

// Must match the real handle ids declared on UMLClassNode (top/right/bottom/left).
// Without these, React Flow can't tell which of a node's four handles an edge
// is meant to leave from / arrive at, and silently falls back to the first
// one it finds (top) for every edge — which is exactly how a pattern with
// nodes arranged left-right-and-down ends up with every arrow bunched at the
// top of each box, crossing over everything else.
export type HandleSide = 'top' | 'right' | 'bottom' | 'left'

export interface PatternEdge {
  id: string
  source: string
  target: string
  sourceHandle?: HandleSide
  targetHandle?: HandleSide
  type: string
  data: UMLEdgeData
}

export interface PatternData {
  key: string                // machine key, e.g. "strategy"
  name: string               // display name
  category: string           // "Creational" | "Structural" | "Behavioral"
  description: string
  nodes: PatternNode[]
  edges: PatternEdge[]
}
