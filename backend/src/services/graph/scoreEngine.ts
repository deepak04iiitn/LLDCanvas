import { analyzeDiagram, type GraphNode, type GraphEdge } from './analyze'

export interface ScoreDimension {
  key: string
  label: string
  score: number
  explanation: string
  highlightIds: string[]
}

export interface ScoreResult {
  overall: number
  dimensions: ScoreDimension[]
  disclaimer: string
}

export type ScoreWeights = {
  coupling?: number
  cohesion?: number
  complexity?: number
  extensibility?: number
  solid?: number
}

export function scoreDiagram(
  nodes: GraphNode[],
  edges: GraphEdge[],
  weights?: ScoreWeights,
): ScoreResult {
  const a = analyzeDiagram(nodes, edges)
  const n = Math.max(a.nodeCount, 1)
  const e = a.edgeCount
  const avgOut = Object.values(a.nodes).reduce((s, x) => s + x.outDegree, 0) / n
  const godIds = Object.values(a.nodes).filter(x => x.methodCount + x.attributeCount >= 12).map(x => x.id)
  const hubIds = a.hubs.slice(0, 5)
  const isolated = Object.values(a.nodes).filter(x => x.inDegree + x.outDegree === 0).map(x => x.id)

  const coupling = Math.max(20, Math.min(100, Math.round(100 - avgOut * 12 - a.cycles.length * 8)))
  const cohesion = Math.max(20, Math.min(100, Math.round(70 + (e > 0 ? 15 : 0) - isolated.length * 5)))
  const complexity = Math.max(20, Math.min(100, Math.round(100 - Math.max(0, n - 15) * 2 - godIds.length * 10)))
  const extensibility = Math.max(20, Math.min(100, Math.round(55 + (Object.values(a.nodes).some(x => x.nodeType === 'interface') ? 25 : 0))))
  const solid = Math.max(20, Math.min(100, Math.round((coupling + cohesion + extensibility) / 3)))

  const dimensions: ScoreDimension[] = [
    { key: 'coupling', label: 'Coupling', score: coupling, explanation: `Average outgoing deps ${avgOut.toFixed(1)}. ${a.cycles.length} cycle(s) detected.`, highlightIds: hubIds },
    { key: 'cohesion', label: 'Cohesion', score: cohesion, explanation: isolated.length ? `${isolated.length} isolated element(s).` : 'Elements appear connected.', highlightIds: isolated.slice(0, 8) },
    { key: 'complexity', label: 'Complexity', score: complexity, explanation: godIds.length ? `${godIds.length} large class(es).` : 'Size looks manageable.', highlightIds: godIds },
    { key: 'extensibility', label: 'Extensibility', score: extensibility, explanation: 'Interfaces and abstractions improve this score.', highlightIds: Object.values(a.nodes).filter(x => x.nodeType === 'interface').map(x => x.id) },
    { key: 'solid', label: 'SOLID signals', score: solid, explanation: 'Heuristic blend — treat as feedback, not absolute truth.', highlightIds: [...godIds, ...hubIds].slice(0, 8) },
  ]

  const w = {
    coupling: weights?.coupling ?? 1,
    cohesion: weights?.cohesion ?? 1,
    complexity: weights?.complexity ?? 1,
    extensibility: weights?.extensibility ?? 1,
    solid: weights?.solid ?? 1,
  }
  let weightSum = 0
  let weighted = 0
  for (const d of dimensions) {
    const factor = w[d.key as keyof typeof w] ?? 1
    weighted += d.score * factor
    weightSum += factor
  }
  const overall = Math.round(weighted / Math.max(weightSum, 1))
  return {
    overall,
    dimensions,
    disclaimer: 'Design Score is structured feedback, not an absolute measure of design quality.',
  }
}
