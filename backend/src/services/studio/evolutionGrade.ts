/** Architecture Evolution — grade a single stage (change or do-nothing). */

import type { GraphNode } from '../graph/analyze'
import { structuralDiff, type DiffEntry } from '../graph/structuralDiff'
import {
  getEvolutionStages,
  parseEvolutionPayload,
  verifyEvolutionStage,
  type EvolutionStage,
} from './evolutionVerify'
import type { BehaviorCheck } from './changeVerify'

export type EvolutionDecision = 'change' | 'noop'

export interface EvolutionClassify {
  keep?: string[]
  change?: string[]
  introduce?: string[]
  remove?: string[]
}

export interface EvolutionDebtAction {
  id: string
  action: 'fix' | 'defer'
}

export interface EvolutionStageSubmission {
  decision: EvolutionDecision
  pressures?: string[]
  classify?: EvolutionClassify
  diagram?: Record<string, unknown>
  why?: string[]
  whyNote?: string
  tradeoffsAck?: string[]
  debtActions?: EvolutionDebtAction[]
}

export interface EvolutionDimension {
  key: string
  label: string
  ok: boolean
  detail?: string
  score?: number
}

export interface EvolutionStageGrade {
  accepted: boolean
  narrative: string
  decision: EvolutionDecision
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
  pressureReport: {
    selected: string[]
    expected: string[]
    hitCount: number
    accuracyPct: number
  }
  complexityReport: {
    beforeNodes: number
    afterNodes: number
    added: number
    budget?: number
    overBudget: boolean
  }
  debtDelta: number
  dimensions: EvolutionDimension[]
  stageId: string
  dayLabel: string
}

function asNodes(diagram: Record<string, unknown> | undefined): GraphNode[] {
  return (Array.isArray(diagram?.nodes) ? diagram!.nodes : []) as GraphNode[]
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

function normalizePressure(s: string) {
  return s.toLowerCase().trim()
}

function forbidChecks(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  stage: EvolutionStage,
  diff: DiffEntry[],
): { id: string; ok: boolean; severity: string; label: string }[] {
  const beforeNodes = asNodes(before)
  const checks: { id: string; ok: boolean; severity: string; label: string }[] = []

  for (const name of stage.forbidModifyElementNames ?? []) {
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

  return checks
}

function debtDeltaFromActions(
  stage: EvolutionStage,
  actions: EvolutionDebtAction[] | undefined,
): number {
  if (!stage.debtOpportunity) return 0
  const act = actions?.find(a => a.id === stage.debtOpportunity!.id)
  if (!act) return 0
  return act.action === 'defer' ? 1 : 0
}

export function gradeEvolutionStage(
  beforeDiagram: Record<string, unknown>,
  afterDiagram: Record<string, unknown>,
  stage: EvolutionStage,
  submission: EvolutionStageSubmission,
  openDebtCount = 0,
): EvolutionStageGrade {
  const decision = submission.decision === 'noop' ? 'noop' : 'change'
  const diagramForBehavior = decision === 'noop' ? beforeDiagram : afterDiagram
  const diff =
    decision === 'noop'
      ? []
      : structuralDiff(beforeDiagram, afterDiagram)

  const behaviorReport = verifyEvolutionStage(diagramForBehavior, stage)
  const constraintChecks = forbidChecks(beforeDiagram, afterDiagram, stage, diff)
  const hardFails = constraintChecks.filter(c => !c.ok && c.severity === 'error')

  const expected = (stage.expectedPressures ?? []).map(normalizePressure)
  const selected = (submission.pressures ?? []).map(normalizePressure)
  const hit = expected.filter(e =>
    selected.some(s => s === e || s.includes(e) || e.includes(s)),
  )
  const pressureAccuracy =
    expected.length === 0
      ? selected.length > 0
        ? 100
        : 50
      : Math.round((hit.length / expected.length) * 100)

  const beforeNodes = asNodes(beforeDiagram).length
  const afterNodes = asNodes(afterDiagram).length
  const added = Math.max(0, afterNodes - beforeNodes)
  const budget = stage.complexityBudget
  const overBudget = typeof budget === 'number' ? added > budget : false

  if (overBudget) {
    constraintChecks.push({
      id: 'complexity-budget',
      ok: false,
      severity: 'warn',
      label: `Complexity grew by ${added} classes (budget ${budget})`,
    })
  } else if (typeof budget === 'number') {
    constraintChecks.push({
      id: 'complexity-budget',
      ok: true,
      severity: 'info',
      label: `Complexity within budget (${added}/${budget} new classes)`,
    })
  }

  const debtDelta = debtDeltaFromActions(stage, submission.debtActions)

  // Tradeoffs soft check when catalog matches introduced names
  let tradeoffsOk = true
  if (decision === 'change' && (stage.introduceCatalog?.length ?? 0) > 0) {
    const afterNames = asNodes(afterDiagram).map(n => nameOf(n))
    const matched = (stage.introduceCatalog ?? []).filter(cat => {
      const re = new RegExp(cat.namePattern, 'i')
      return afterNames.some(n => re.test(n))
    })
    if (matched.length > 0) {
      tradeoffsOk = (submission.tradeoffsAck?.length ?? 0) > 0
      constraintChecks.push({
        id: 'tradeoffs',
        ok: tradeoffsOk,
        severity: tradeoffsOk ? 'info' : 'warn',
        label: tradeoffsOk
          ? 'Tradeoffs acknowledged'
          : 'Major introduce detected — tradeoffs not acknowledged',
      })
    }
  }

  const protectedOk = behaviorReport.protectedPct >= 70
  const newOk =
    decision === 'noop'
      ? true
      : (stage.newFlows?.length ?? 0) === 0
        ? true
        : behaviorReport.newPct >= 70
  const constraintsOk = hardFails.length === 0

  let necessityOk = true
  let necessityDetail = ''
  if (decision === 'noop') {
    necessityOk = !stage.mustChange
    necessityDetail = stage.mustChange
      ? 'Do-nothing chosen but this stage requires structural change'
      : stage.doNothingHint ?? 'Holding was appropriate for this pressure'
  } else {
    if (!stage.mustChange && diff.length > 0 && added >= 3) {
      necessityOk = false
      necessityDetail =
        'You changed architecture when holding was valid — risk of overengineering'
    } else if (diff.length === 0) {
      necessityOk = false
      necessityDetail = 'You chose Change but made no structural edits'
    } else {
      necessityDetail = 'Change applied under architectural pressure'
    }
  }

  const accepted =
    protectedOk &&
    constraintsOk &&
    (decision === 'noop' ? !stage.mustChange : newOk && diff.length > 0)

  const dimensions: EvolutionDimension[] = [
    {
      key: 'existing_behavior',
      label: 'Existing behavior preserved',
      ok: protectedOk,
      score: behaviorReport.protectedPct,
    },
    {
      key: 'stage_requirement',
      label: decision === 'noop' ? 'Hold decision' : 'Stage requirement',
      ok: decision === 'noop' ? !stage.mustChange : newOk,
      score: decision === 'noop' ? (stage.mustChange ? 0 : 100) : behaviorReport.newPct,
      detail: necessityDetail,
    },
    {
      key: 'change_necessity',
      label: 'Change necessity',
      ok: necessityOk,
      detail: necessityDetail,
      score: necessityOk ? 100 : 40,
    },
    {
      key: 'pressures',
      label: 'Pressure identification',
      ok: pressureAccuracy >= 50,
      score: pressureAccuracy,
      detail: `${hit.length}/${expected.length || selected.length} pressures matched`,
    },
    {
      key: 'complexity',
      label: 'Proportional complexity',
      ok: !overBudget,
      score: overBudget ? Math.max(0, 100 - added * 10) : 100,
      detail: `+${added} classes (before ${beforeNodes} → after ${afterNodes})`,
    },
    {
      key: 'tradeoffs',
      label: 'Tradeoffs documented',
      ok: tradeoffsOk,
      detail: tradeoffsOk ? 'Acknowledged or not required' : 'Missing tradeoff ack',
    },
    {
      key: 'debt',
      label: 'Architecture debt',
      ok: openDebtCount + debtDelta <= 2,
      score: Math.max(0, 100 - (openDebtCount + debtDelta) * 20),
      detail:
        debtDelta > 0
          ? `Deferred (+${debtDelta}); open debt now ${openDebtCount + debtDelta}`
          : `Open debt: ${openDebtCount}`,
    },
    {
      key: 'constraints',
      label: 'Constraint compliance',
      ok: constraintsOk,
      detail: constraintsOk
        ? 'Hard constraints respected'
        : hardFails.map(c => c.label).join('; '),
    },
  ]

  let narrative: string
  if (decision === 'noop') {
    if (stage.mustChange) {
      narrative =
        'Holding was not enough here — the pressure requires a structural response. Evolve the design, then resubmit.'
    } else {
      narrative =
        stage.doNothingHint ??
        'Current architecture can absorb this pressure. No structural change required — good judgment.'
    }
  } else if (!diff.length) {
    narrative = 'You chose to evolve but the diagram is unchanged. Apply a focused structural change.'
  } else if (!newOk) {
    narrative = `Stage requirement incomplete (${behaviorReport.newPct}%). Adjust until new flows hold.`
  } else if (!protectedOk) {
    narrative = `Existing behavior regressed (${behaviorReport.protectedPct}%). Restore protected flows.`
  } else if (hardFails.length) {
    narrative = `Constraints broken: ${hardFails.map(c => c.label).join('; ')}`
  } else if (overBudget) {
    narrative = `Requirement met, but complexity jumped by ${added} classes — prefer a more proportional change.`
  } else {
    narrative = `Stage advanced: architecture evolved under pressure with behavior preserved (${diff.length} edit(s)).`
  }

  return {
    accepted,
    narrative,
    decision,
    diff,
    behaviorReport,
    constraintReport: { checks: constraintChecks, hardFails: hardFails.length },
    pressureReport: {
      selected: submission.pressures ?? [],
      expected: stage.expectedPressures ?? [],
      hitCount: hit.length,
      accuracyPct: pressureAccuracy,
    },
    complexityReport: {
      beforeNodes,
      afterNodes,
      added,
      budget,
      overBudget,
    },
    debtDelta,
    dimensions,
    stageId: stage.id,
    dayLabel: stage.dayLabel,
  }
}

export function findStage(rawPayload: unknown, stageIndex: number): EvolutionStage | null {
  const stages = getEvolutionStages(rawPayload)
  return stages[stageIndex] ?? null
}

export { parseEvolutionPayload, getEvolutionStages }
