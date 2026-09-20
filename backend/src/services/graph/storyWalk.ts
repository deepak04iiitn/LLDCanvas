import { analyzeDiagram, type GraphNode, type GraphEdge } from './analyze'

export interface StoryStep {
  index: number
  elementIds: string[]
  text: string
}

export interface StoryResult {
  steps: StoryStep[]
}

/** Naive walk: start from roots (inDegree 0) and BFS narrate. */
export function buildStory(nodes: GraphNode[], edges: GraphEdge[]): StoryResult {
  const a = analyzeDiagram(nodes, edges)
  const ids = Object.keys(a.nodes)
  if (ids.length === 0) return { steps: [] }

  const roots = ids.filter(id => a.nodes[id].inDegree === 0)
  const start = roots[0] ?? ids[0]
  const visited = new Set<string>()
  const queue = [start]
  const order: string[] = []
  while (queue.length && order.length < 12) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    order.push(id)
    for (const next of a.nodes[id].dependsOn) {
      if (!visited.has(next)) queue.push(next)
    }
  }

  const steps: StoryStep[] = order.map((id, index) => {
    const n = a.nodes[id]
    return {
      index,
      elementIds: [id],
      text: index === 0
        ? `Start at ${n.name} (${n.nodeType}).`
        : `${n.name} participates next — depends on ${n.dependsOn.length} component(s), used by ${n.usedBy.length}.`,
    }
  })

  return { steps }
}
