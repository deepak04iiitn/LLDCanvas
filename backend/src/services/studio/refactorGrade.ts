/** Refactoring Mode — score deltas, metrics, soft constraint checks. */

import { analyzeDiagram, type GraphEdge, type GraphNode } from '../graph/analyze'
import { scoreDiagram, type ScoreResult } from '../graph/scoreEngine'
import { structuralDiff, type DiffEntry } from '../graph/structuralDiff'
import {
  parseRefactorPayload,
  verifyRefactorBehavior,
  type BehaviorCheck,
  type RefactorPayload,
} from './refactorVerify'

export interface DiagramMetrics {
  classes: number
  edges: number
  maxOutDegree: number
  cycles: number
  godClasses: number
  interfaces: number
}

export interface ConstraintCheck {
  id: string
  ok: boolean
  severity: 'error' | 'warn' | 'info'
  label: string
}

export interface RefactorGradeResult {
  behaviorReport: {
    checks: BehaviorCheck[]
    passed: number
    total: number
    preservationPct: number
  }
  constraintReport: { checks: ConstraintCheck[]; passed: number; total: number }
  scores: { before: ScoreResult; after: ScoreResult }
  metrics: { before: DiagramMetrics; after: DiagramMetrics }
  diff: DiffEntry[]
  improvementPct: number
  architectureImprovement: number
  behaviorPreservation: number
  couplingReduction: number
  cohesionImprovement: number
  extensibility: number
  complexity: number
  narrative: string
  accepted: boolean
}

function asNodes(diagram: Record<string, unknown> | undefined): GraphNode[] {
  return (Array.isArray(diagram?.nodes) ? diagram!.nodes : []) as GraphNode[]
}

function asEdges(diagram: Record<string, unknown> | undefined): GraphEdge[] {
  return (Array.isArray(diagram?.edges) ? diagram!.edges : []) as GraphEdge[]
}

function nameOf(n: GraphNode): string {
  return String(n.data?.name ?? n.id)
}

function metricsOf(nodes: GraphNode[], edges: GraphEdge[]): DiagramMetrics {
  const a = analyzeDiagram(nodes, edges)
  const vals = Object.values(a.nodes)
  const maxOut = vals.reduce((m, x) => Math.max(m, x.outDegree), 0)
  const godClasses = vals.filter(x => x.methodCount + x.attributeCount >= 12).length
  const interfaces = vals.filter(x => x.nodeType === 'interface' || x.nodeType === 'abstract-class').length
  return {
    classes: a.nodeCount,
    edges: a.edgeCount,
    maxOutDegree: maxOut,
    cycles: a.cycles.length,
    godClasses,
    interfaces,
  }
}

function isAbstraction(n: GraphNode): boolean {
  const t = String(n.data?.nodeType ?? '')
  const name = nameOf(n).toLowerCase()
  return (
    t === 'interface' ||
    t === 'abstract-class' ||
    /gateway|strategy|port|channel|policy|exporter|factory|handler|service$/.test(name)
  )
}

function softConstraints(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  payload: RefactorPayload,
): ConstraintCheck[] {
  const beforeNodes = asNodes(before)
  const afterNodes = asNodes(after)
  const checks: ConstraintCheck[] = []

  for (const name of payload.forbidDeleteElementNames ?? []) {
    const ok = afterNodes.some(n => nameOf(n).toLowerCase() === name.toLowerCase())
    checks.push({
      id: `forbid-delete-${name}`,
      ok,
      severity: ok ? 'info' : 'error',
      label: ok
        ? `Kept required core: ${name}`
        : `Removed required core: ${name}`,
    })
  }

  const beforeAbs = beforeNodes.filter(isAbstraction).length
  const afterAbs = afterNodes.filter(isAbstraction).length
  const newAbs = Math.max(0, afterAbs - beforeAbs)
  const maxAbs = payload.maxNewAbstractions ?? 5
  const absOk = newAbs <= maxAbs
  checks.push({
    id: 'max-abstractions',
    ok: absOk,
    severity: absOk ? 'info' : 'warn',
    label: absOk
      ? `New abstractions within budget (${newAbs}/${maxAbs})`
      : `Too many new abstractions (${newAbs}/${maxAbs}) — prefer fewer focused ones`,
  })

  const changed = JSON.stringify(before) !== JSON.stringify(after)
  checks.push({
    id: 'did-change',
    ok: changed,
    severity: changed ? 'info' : 'warn',
    label: changed ? 'Architecture was modified' : 'No structural change detected',
  })

  for (const c of payload.constraints ?? []) {
    checks.push({
      id: `constraint-note-${c.slice(0, 24)}`,
      ok: true,
      severity: 'info',
      label: `Constraint to keep in mind: ${c}`,
    })
  }

  return checks
}

function pctDelta(before: number, after: number, higherIsBetter: boolean): number {
  if (higherIsBetter) {
    return Math.round(Math.max(-100, Math.min(100, after - before)))
  }
  // lower is better (e.g. coupling raw) — invert
  return Math.round(Math.max(-100, Math.min(100, before - after)))
}

export function gradeRefactor(
  beforeDiagram: Record<string, unknown>,
  afterDiagram: Record<string, unknown>,
  rawPayload: unknown,
): RefactorGradeResult {
  const payload = parseRefactorPayload(rawPayload)
  const beforeNodes = asNodes(beforeDiagram)
  const afterNodes = asNodes(afterDiagram)
  const beforeEdges = asEdges(beforeDiagram)
  const afterEdges = asEdges(afterDiagram)

  const beforeScore = scoreDiagram(beforeNodes, beforeEdges)
  const afterScore = scoreDiagram(afterNodes, afterEdges)
  const beforeMetrics = metricsOf(beforeNodes, beforeEdges)
  const afterMetrics = metricsOf(afterNodes, afterEdges)
  const diff = structuralDiff(beforeDiagram, afterDiagram)
  const behaviorReport = verifyRefactorBehavior(afterDiagram, payload)
  const constraintChecks = softConstraints(beforeDiagram, afterDiagram, payload)
  const constraintPassed = constraintChecks.filter(c => c.ok || c.severity === 'info').length
  // count only non-info failures
  const hardFails = constraintChecks.filter(c => !c.ok && c.severity === 'error')

  const dim = (key: string, which: 'before' | 'after') =>
    (which === 'before' ? beforeScore : afterScore).dimensions.find(d => d.key === key)?.score ?? 50

  const couplingReduction = Math.max(
    0,
    Math.min(100, 50 + pctDelta(dim('coupling', 'before'), dim('coupling', 'after'), true)),
  )
  const cohesionImprovement = Math.max(
    0,
    Math.min(100, 50 + pctDelta(dim('cohesion', 'before'), dim('cohesion', 'after'), true)),
  )
  const extensibility = afterScore.dimensions.find(d => d.key === 'extensibility')?.score ?? 50
  const complexity = afterScore.dimensions.find(d => d.key === 'complexity')?.score ?? 50

  const architectureImprovement = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((afterScore.overall - beforeScore.overall + 100) / 2) * 0.5 +
          couplingReduction * 0.2 +
          cohesionImprovement * 0.15 +
          extensibility * 0.15,
      ),
    ),
  )

  const behaviorPreservation = behaviorReport.preservationPct
  const improvementPct = Math.round(
    architectureImprovement * 0.55 + behaviorPreservation * 0.45,
  )

  const accepted =
    behaviorPreservation >= 70 &&
    hardFails.length === 0 &&
    diff.length > 0

  let narrative: string
  if (!diff.length) {
    narrative = 'No structural changes detected. Refactor by extracting responsibilities or rewiring dependencies.'
  } else if (behaviorPreservation < 70) {
    narrative = `Behavior contract incomplete (${behaviorReport.passed}/${behaviorReport.total}). Restore missing paths before treating this as done.`
  } else if (hardFails.length) {
    narrative = `Constraints broken: ${hardFails.map(c => c.label).join('; ')}`
  } else if (afterScore.overall >= beforeScore.overall) {
    narrative = `Solid refactor: +${afterScore.overall - beforeScore.overall} design score with behavior preserved.`
  } else {
    narrative =
      'Behavior preserved, but overall design score dipped. Check whether new abstractions are earning their keep.'
  }

  return {
    behaviorReport,
    constraintReport: {
      checks: constraintChecks,
      passed: constraintPassed,
      total: constraintChecks.length,
    },
    scores: { before: beforeScore, after: afterScore },
    metrics: { before: beforeMetrics, after: afterMetrics },
    diff,
    improvementPct,
    architectureImprovement,
    behaviorPreservation,
    couplingReduction,
    cohesionImprovement,
    extensibility,
    complexity,
    narrative,
    accepted,
  }
}

export { parseRefactorPayload }
