/** Change One Thing — grade minimal change, blast radius, predict accuracy. */

import type { GraphEdge, GraphNode } from '../graph/analyze'
import { structuralDiff, type DiffEntry } from '../graph/structuralDiff'
import {
  parseChangePayload,
  verifyChangeBehavior,
  type BehaviorCheck,
  type ChangePayload,
} from './changeVerify'

export interface ChangePrediction {
  elementIds?: string[]
  elementNames?: string[]
  relationshipKeys?: string[]
}

export interface BlastRadius {
  directIds: string[]
  indirectIds: string[]
  untouchedIds: string[]
  directCount: number
  indirectCount: number
  untouchedCount: number
}

export interface ChangeDimension {
  key: string
  label: string
  ok: boolean
  detail?: string
  score?: number
}

export interface ChangeGradeResult {
  accepted: boolean
  narrative: string
  diff: DiffEntry[]
  behaviorReport: {
    protectedChecks: BehaviorCheck[]
    newChecks: BehaviorCheck[]
    checks: BehaviorCheck[]
    protectedPct: number
    newPct: number
  }
  constraintReport: {
    checks: { id: string; ok: boolean; severity: string; label: string }[]
    hardFails: number
  }
  efficiency: {
    requiredChanges: number
    yourChanges: number
    unnecessaryChanges: number
    unnecessaryNames: string[]
  }
  blastRadius: BlastRadius
  predictReport: {
    predictedCount: number
    actualCount: number
    hitCount: number
    missPredicted: string[]
    missedActual: string[]
    accuracyPct: number
  }
  dimensions: ChangeDimension[]
  changeRequest?: ChangePayload['changeRequest']
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

function eidOf(n: GraphNode): string {
  return String(n.data?.elementId ?? n.id)
}

function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function buildOutbound(nodes: GraphNode[], edges: GraphEdge[]): Map<string, string[]> {
  const byId = new Map(nodes.map(n => [String(n.id), eidOf(n)]))
  const adj = new Map<string, string[]>()
  for (const n of nodes) adj.set(eidOf(n), [])
  for (const e of edges) {
    const s = byId.get(String(e.source)) ?? String(e.source)
    const t = byId.get(String(e.target)) ?? String(e.target)
    if (!adj.has(s)) adj.set(s, [])
    adj.get(s)!.push(t)
  }
  return adj
}

function blastRadiusOf(
  after: Record<string, unknown>,
  diff: DiffEntry[],
): BlastRadius {
  const nodes = asNodes(after)
  const edges = asEdges(after)
  const adj = buildOutbound(nodes, edges)
  const allIds = nodes.map(eidOf)
  const direct = new Set(
    diff.filter(d => d.entity === 'node').map(d => d.id),
  )
  // Also treat endpoints of changed edges as direct
  for (const d of diff.filter(x => x.entity === 'edge')) {
    const edge =
      (after.edges as { id?: string; data?: { elementId?: string }; source?: string; target?: string }[] | undefined)?.find(
        e => String(e.data?.elementId ?? e.id) === d.id,
      ) ??
      (after.edges as { id?: string; source?: string; target?: string }[] | undefined)?.find(
        e => String(e.id) === d.id,
      )
    if (edge) {
      const src = nodes.find(n => String(n.id) === String(edge.source))
      const tgt = nodes.find(n => String(n.id) === String(edge.target))
      if (src) direct.add(eidOf(src))
      if (tgt) direct.add(eidOf(tgt))
    }
  }

  const indirect = new Set<string>()
  for (const id of direct) {
    const q = [...(adj.get(id) ?? [])]
    const seen = new Set<string>([id])
    while (q.length) {
      const u = q.shift()!
      if (seen.has(u)) continue
      seen.add(u)
      if (!direct.has(u)) indirect.add(u)
      for (const v of adj.get(u) ?? []) {
        if (!seen.has(v)) q.push(v)
      }
    }
  }

  const untouched = allIds.filter(id => !direct.has(id) && !indirect.has(id))
  return {
    directIds: [...direct],
    indirectIds: [...indirect],
    untouchedIds: untouched,
    directCount: direct.size,
    indirectCount: indirect.size,
    untouchedCount: untouched.size,
  }
}

function touchedNames(diff: DiffEntry[], before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const names: string[] = []
  const beforeNodes = asNodes(before)
  const afterNodes = asNodes(after)
  for (const d of diff) {
    if (d.entity !== 'node') continue
    if (d.name) {
      names.push(d.name)
      continue
    }
    const n =
      afterNodes.find(x => eidOf(x) === d.id) ??
      beforeNodes.find(x => eidOf(x) === d.id)
    if (n) names.push(nameOf(n))
  }
  return names
}

function softConstraints(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  payload: ChangePayload,
  diff: DiffEntry[],
): { id: string; ok: boolean; severity: string; label: string }[] {
  const beforeNodes = asNodes(before)
  const afterNodes = asNodes(after)
  const checks: { id: string; ok: boolean; severity: string; label: string }[] = []

  for (const name of payload.forbidModifyElementNames ?? []) {
    const beforeNode = beforeNodes.find(
      n => normalizeName(nameOf(n)) === normalizeName(name),
    )
    if (!beforeNode) continue
    const eid = eidOf(beforeNode)
    const touched = diff.some(d => d.entity === 'node' && d.id === eid)
    checks.push({
      id: `forbid-modify-${name}`,
      ok: !touched,
      severity: touched ? 'error' : 'info',
      label: touched
        ? `Constraint broken: modified ${name}`
        : `Respected don’t-touch: ${name}`,
    })
  }

  const beforeCount = beforeNodes.length
  const afterCount = afterNodes.length
  const added = Math.max(0, afterCount - beforeCount)
  const maxNew = payload.maxNewClasses
  if (typeof maxNew === 'number') {
    const ok = added <= maxNew
    checks.push({
      id: 'max-new-classes',
      ok,
      severity: ok ? 'info' : 'error',
      label: ok
        ? `New classes within budget (${added}/${maxNew})`
        : `Too many new classes (${added}/${maxNew})`,
    })
  }

  for (const c of payload.constraints ?? []) {
    checks.push({
      id: `note-${c.slice(0, 20)}`,
      ok: true,
      severity: 'info',
      label: `Constraint: ${c}`,
    })
  }

  checks.push({
    id: 'did-change',
    ok: diff.length > 0,
    severity: diff.length ? 'info' : 'warn',
    label: diff.length ? 'Architecture was modified' : 'No structural change detected',
  })

  return checks
}

export function gradeChange(
  beforeDiagram: Record<string, unknown>,
  afterDiagram: Record<string, unknown>,
  rawPayload: unknown,
  prediction?: ChangePrediction | null,
): ChangeGradeResult {
  const payload = parseChangePayload(rawPayload)
  const diff = structuralDiff(beforeDiagram, afterDiagram)
  const behaviorReport = verifyChangeBehavior(afterDiagram, payload)
  const constraintChecks = softConstraints(beforeDiagram, afterDiagram, payload, diff)
  const hardFails = constraintChecks.filter(c => !c.ok && c.severity === 'error')

  const hintSet = new Set(
    (payload.expectedTouchHints ?? []).map(normalizeName),
  )
  const actualNames = touchedNames(diff, beforeDiagram, afterDiagram)
  const unnecessaryNames = hintSet.size
    ? actualNames.filter(n => !hintSet.has(normalizeName(n)))
    : []
  const requiredEstimate = hintSet.size || Math.max(1, Math.min(diff.filter(d => d.entity === 'node').length, 4))
  const yourChanges = diff.length
  const unnecessaryChanges = unnecessaryNames.length

  const blastRadius = blastRadiusOf(afterDiagram, diff)

  const predictedNames = new Set(
    [
      ...(prediction?.elementNames ?? []),
      ...(prediction?.elementIds ?? []),
    ].map(normalizeName),
  )
  const actualNorm = new Set(actualNames.map(normalizeName))
  const hit = [...predictedNames].filter(p => actualNorm.has(p) || [...actualNorm].some(a => a.includes(p) || p.includes(a)))
  const missPredicted = [...predictedNames].filter(p => !hit.includes(p))
  const missedActual = [...actualNorm].filter(
    a => !hit.some(h => h === a || a.includes(h) || h.includes(a)),
  )
  const predTotal = Math.max(predictedNames.size, actualNorm.size, 1)
  const accuracyPct = predictedNames.size === 0
    ? 0
    : Math.round((hit.length / predTotal) * 100)

  const newOk = behaviorReport.newPct >= 70
  const protectedOk = behaviorReport.protectedPct >= 70
  const constraintsOk = hardFails.length === 0
  const accepted = newOk && protectedOk && constraintsOk && diff.length > 0

  const dimensions: ChangeDimension[] = [
    {
      key: 'new_requirement',
      label: 'New requirement satisfied',
      ok: newOk,
      score: behaviorReport.newPct,
      detail: `${behaviorReport.newChecks.filter(c => c.ok).length}/${behaviorReport.newChecks.length || 0} checks`,
    },
    {
      key: 'existing_behavior',
      label: 'Existing behavior preserved',
      ok: protectedOk,
      score: behaviorReport.protectedPct,
      detail: `${behaviorReport.protectedChecks.filter(c => c.ok).length}/${behaviorReport.protectedChecks.length || 0} checks`,
    },
    {
      key: 'constraints',
      label: 'Constraint compliance',
      ok: constraintsOk,
      detail: constraintsOk ? 'All hard constraints respected' : hardFails.map(c => c.label).join('; '),
    },
    {
      key: 'minimal_change',
      label: 'Minimal change',
      ok: unnecessaryChanges <= 1,
      score: Math.max(0, 100 - unnecessaryChanges * 15),
      detail:
        unnecessaryChanges === 0
          ? 'No unnecessary touches detected'
          : `Possibly unnecessary: ${unnecessaryNames.join(', ')}`,
    },
    {
      key: 'predict',
      label: 'Impact prediction',
      ok: accuracyPct >= 50 || predictedNames.size === 0,
      score: predictedNames.size === 0 ? undefined : accuracyPct,
      detail:
        predictedNames.size === 0
          ? 'No prediction submitted'
          : `${hit.length} hit · predicted ${predictedNames.size} · actual ${actualNorm.size}`,
    },
  ]

  let narrative: string
  if (!diff.length) {
    narrative = 'No structural changes. Apply the smallest architectural change that satisfies the request.'
  } else if (!newOk) {
    narrative = `New requirement incomplete (${behaviorReport.newPct}%). Extend the design until the new flows hold.`
  } else if (!protectedOk) {
    narrative = `Existing behavior regressed (${behaviorReport.protectedPct}%). Restore protected flows.`
  } else if (hardFails.length) {
    narrative = `Constraints broken: ${hardFails.map(c => c.label).join('; ')}`
  } else if (unnecessaryChanges > 0) {
    narrative = `Requirement met, but you touched ${unnecessaryChanges} component(s) that may not have been needed (${unnecessaryNames.join(', ')}). Prefer limiting blast radius.`
  } else {
    narrative = `Clean change: new requirement satisfied with existing behavior preserved (${yourChanges} structural edit(s)).`
  }

  return {
    accepted,
    narrative,
    diff,
    behaviorReport,
    constraintReport: { checks: constraintChecks, hardFails: hardFails.length },
    efficiency: {
      requiredChanges: requiredEstimate,
      yourChanges,
      unnecessaryChanges,
      unnecessaryNames,
    },
    blastRadius,
    predictReport: {
      predictedCount: predictedNames.size,
      actualCount: actualNorm.size,
      hitCount: hit.length,
      missPredicted,
      missedActual: [...missedActual],
      accuracyPct,
    },
    dimensions,
    changeRequest: payload.changeRequest,
  }
}

export { parseChangePayload }
