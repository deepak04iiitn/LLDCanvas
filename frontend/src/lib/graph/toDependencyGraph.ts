/**
 * Legacy transform — thin wrapper over dependencyWeb model for older callers.
 */
import { buildDepWebModel, type DepWebModel } from './dependencyWeb'
import type { DiagramLike } from './analyzeDiagram'

export interface DependencyNode {
  id: string
  label: string
  nodeType: string
  inDegree: number
  outDegree: number
  isHub: boolean
  inCycle: boolean
}

export interface DependencyLink {
  id: string
  source: string
  target: string
  relationshipType: string
}

export interface DependencyGraph {
  nodes: DependencyNode[]
  links: DependencyLink[]
  cycles: string[][]
}

export function toDependencyGraph(diagram: DiagramLike): DependencyGraph {
  const m: DepWebModel = buildDepWebModel(diagram)
  return {
    nodes: m.nodes.map(n => ({
      id: n.id,
      label: n.label,
      nodeType: n.nodeType,
      inDegree: n.inDegree,
      outDegree: n.outDegree,
      isHub: n.isHub,
      inCycle: n.inCycle,
    })),
    links: m.links,
    cycles: m.cycles,
  }
}
