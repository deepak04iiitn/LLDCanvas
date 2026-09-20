import { analyzeDiagram, type DiagramLike } from './analyzeDiagram'

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

/**
 * Transform a UML diagram into a dependency-web graph for visualization.
 */
export function toDependencyGraph(diagram: DiagramLike): DependencyGraph {
  const a = analyzeDiagram(diagram)
  const cycleSet = new Set(a.cycles.flat())
  const hubSet = new Set(a.hubs.slice(0, 5).map(h => h.elementId))

  const nodes: DependencyNode[] = Object.values(a.byElementId)
    .filter(n => n.nodeType !== 'note')
    .map(n => ({
      id: n.elementId,
      label: n.name,
      nodeType: n.nodeType,
      inDegree: n.inDegree,
      outDegree: n.outDegree,
      isHub: hubSet.has(n.elementId),
      inCycle: cycleSet.has(n.elementId),
    }))

  const links: DependencyLink[] = (diagram.edges ?? []).map(e => {
    const src = diagram.nodes.find(n => n.id === e.source)
    const tgt = diagram.nodes.find(n => n.id === e.target)
    return {
      id: e.elementId ?? e.id,
      source: src?.elementId ?? e.source,
      target: tgt?.elementId ?? e.target,
      relationshipType: e.data?.relationshipType ?? 'association',
    }
  }).filter(l => nodes.some(n => n.id === l.source) && nodes.some(n => n.id === l.target))

  return { nodes, links, cycles: a.cycles }
}
