import type { UMLNodeData, UMLEdgeData } from '@/types'

export interface PatternNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: UMLNodeData
}

// Must match the real handle ids declared on UMLClassNode.
// The four basic sides ('top'|'right'|'bottom'|'left') address the centre
// handle on each edge.  When two edges share the same side of a node and
// their markers would otherwise overlap, use a percentage handle such as
// 'bottom@25' or 'bottom@75'  — UMLClassNode generates handles at every 5 %
// increment (5, 10, … 95) with ids in the form "<side>@<pct>", so any of
// those strings are valid here.
export type HandleSide = string

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
