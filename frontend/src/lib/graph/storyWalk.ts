import { analyzeDiagram, type DiagramLike } from './analyzeDiagram'

export interface StoryStep {
  elementIds: string[]
  text: string
}

export interface StoryResult {
  title: string
  steps: StoryStep[]
}

/**
 * Deterministic graph-walk story: start at low in-degree hubs (entry points),
 * BFS outward, narrating types and relationships.
 */
export function storyWalk(diagram: DiagramLike): StoryResult {
  const a = analyzeDiagram(diagram)
  const nodes = diagram.nodes ?? []
  if (nodes.length === 0) {
    return { title: 'Empty design', steps: [] }
  }

  const byEid = a.byElementId
  const entries = Object.values(byEid)
    .filter(n => n.nodeType !== 'note')
    .sort((x, y) => x.inDegree - y.inDegree || y.outDegree - x.outDegree)

  const start = entries[0]
  if (!start) {
    return { title: 'Empty design', steps: [] }
  }

  const steps: StoryStep[] = []
  const visited = new Set<string>()
  const queue: string[] = [start.elementId]

  steps.push({
    elementIds: [start.elementId],
    text: `We begin at ${start.name} (${start.nodeType}) — a natural entry with in-degree ${start.inDegree}.`,
  })
  visited.add(start.elementId)

  while (queue.length && steps.length < 12) {
    const cur = queue.shift()!
    const na = byEid[cur]
    if (!na) continue

    for (const out of na.outbound) {
      if (visited.has(out.toId)) continue
      visited.add(out.toId)
      queue.push(out.toId)
      const target = byEid[out.toId]
      steps.push({
        elementIds: [cur, out.toId],
        text: `${na.name} ${out.type}s ${target?.name ?? out.toId}${
          target?.responsibilities[0] ? ` — which handles “${target.responsibilities[0]}”.` : '.'
        }`,
      })
      if (steps.length >= 12) break
    }
  }

  for (const hub of a.hubs) {
    if (visited.has(hub.elementId) || steps.length >= 14) continue
    steps.push({
      elementIds: [hub.elementId],
      text: `${hub.name} is a structural hub (degree ${hub.degree}) not on the primary walk — worth a closer look.`,
    })
    visited.add(hub.elementId)
  }

  if (a.cycles.length > 0) {
    const cyc = a.cycles[0]
    steps.push({
      elementIds: cyc,
      text: `Watch out: a dependency cycle involves ${cyc.length} types — breaks can ripple around the loop.`,
    })
  }

  return {
    title: `How ${start.name} connects the design`,
    steps,
  }
}
