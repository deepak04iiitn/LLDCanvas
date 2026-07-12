import { UMLEdge } from './UMLEdge'

// Single edge component handles all 7 relationship types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const edgeTypes: Record<string, any> = {
  association: UMLEdge,
  bidirectional: UMLEdge,
  aggregation: UMLEdge,
  composition: UMLEdge,
  inheritance: UMLEdge,
  realization: UMLEdge,
  dependency: UMLEdge,
}

export const DEFAULT_EDGE_TYPE = 'association'
