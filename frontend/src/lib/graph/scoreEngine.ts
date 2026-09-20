import { analyzeDiagram, type DiagramLike } from './analyzeDiagram'

export interface ScoreDimension {
  id: string
  label: string
  score: number
  max: number
  explanation: string
  highlightElementIds: string[]
}

export interface DesignScoreResult {
  overall: number
  max: number
  dimensions: ScoreDimension[]
  disclaimer: string
}

export interface ScoreWeights {
  cohesion: number
  coupling: number
  naming: number
  size: number
  cycles: number
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  cohesion: 20,
  coupling: 25,
  naming: 15,
  size: 20,
  cycles: 20,
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Heuristic design score — feedback, not absolute quality.
 */
export function scoreEngine(
  diagram: DiagramLike,
  weights: Partial<ScoreWeights> = {},
): DesignScoreResult {
  const w = { ...DEFAULT_WEIGHTS, ...weights }
  const a = analyzeDiagram(diagram)
  const nodes = diagram.nodes ?? []

  // Coupling: penalize average degree
  const degrees = Object.values(a.byElementId).map(n => n.inDegree + n.outDegree)
  const avgDeg = degrees.length ? degrees.reduce((s, d) => s + d, 0) / degrees.length : 0
  const couplingScore = clamp(w.coupling - avgDeg * 2.5, 0, w.coupling)

  // Cycles: full points if none
  const cyclePenalty = Math.min(a.cycles.length * 5, w.cycles)
  const cyclesScore = w.cycles - cyclePenalty

  // Size: prefer 3–25 classes
  const nc = a.nodeCount
  let sizeScore = w.size
  if (nc === 0) sizeScore = 0
  else if (nc < 2) sizeScore = w.size * 0.4
  else if (nc > 40) sizeScore = w.size * 0.5
  else if (nc > 25) sizeScore = w.size * 0.75

  // Naming: share of nodes with non-empty PascalCase-ish names
  const named = nodes.filter(n => {
    const name = n.data?.name ?? ''
    return /^[A-Z][A-Za-z0-9]*$/.test(name)
  }).length
  const namingScore = nodes.length
    ? Math.round((named / nodes.length) * w.naming)
    : 0

  // Cohesion: fewer anemic / empty concerns
  const concernHits = Object.values(a.byElementId).filter(n => n.concerns.length > 0).length
  const cohesionScore = nodes.length
    ? clamp(w.cohesion - (concernHits / nodes.length) * w.cohesion, 0, w.cohesion)
    : 0

  const hubIds = a.hubs.slice(0, 3).map(h => h.elementId)
  const cycleIds = [...new Set(a.cycles.flat())]

  const dimensions: ScoreDimension[] = [
    {
      id: 'coupling',
      label: 'Coupling',
      score: Math.round(couplingScore),
      max: w.coupling,
      explanation:
        avgDeg <= 2
          ? 'Dependencies look sparse — good separation.'
          : `Average degree is ${avgDeg.toFixed(1)}. Consider reducing fan-out on hubs.`,
      highlightElementIds: hubIds,
    },
    {
      id: 'cycles',
      label: 'Acyclic structure',
      score: Math.round(cyclesScore),
      max: w.cycles,
      explanation:
        a.cycles.length === 0
          ? 'No directed cycles detected.'
          : `Found ${a.cycles.length} cycle(s). Break circular deps with interfaces or events.`,
      highlightElementIds: cycleIds,
    },
    {
      id: 'size',
      label: 'Diagram size',
      score: Math.round(sizeScore),
      max: w.size,
      explanation: `${nc} type(s) on the canvas.`,
      highlightElementIds: [],
    },
    {
      id: 'naming',
      label: 'Naming',
      score: namingScore,
      max: w.naming,
      explanation: `${named}/${nodes.length || 0} types use PascalCase names.`,
      highlightElementIds: nodes
        .filter(n => !/^[A-Z][A-Za-z0-9]*$/.test(n.data?.name ?? ''))
        .map(n => n.elementId ?? n.id),
    },
    {
      id: 'cohesion',
      label: 'Cohesion signals',
      score: Math.round(cohesionScore),
      max: w.cohesion,
      explanation:
        concernHits === 0
          ? 'No strong anti-pattern signals from heuristics.'
          : `${concernHits} type(s) flagged — open Microscope for details.`,
      highlightElementIds: Object.values(a.byElementId)
        .filter(n => n.concerns.length > 0)
        .map(n => n.elementId),
    },
  ]

  const overall = dimensions.reduce((s, d) => s + d.score, 0)
  const max = dimensions.reduce((s, d) => s + d.max, 0)

  return {
    overall,
    max,
    dimensions,
    disclaimer: 'Feedback, not absolute truth — heuristics to guide discussion.',
  }
}
