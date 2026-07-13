import type { UMLNodeData, UMLEdgeData } from '@/types'

export interface PatternNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: UMLNodeData
}

export interface PatternEdge {
  id: string
  source: string
  target: string
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
