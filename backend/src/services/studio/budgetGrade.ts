/** Architecture Budget — soft grade for a stage submission. */

import {
  findBudgetInvestment,
  parseBudgetPayload,
  type BudgetInvestment,
  type BudgetPayload,
  type BudgetPressure,
  type BudgetPriority,
  type BudgetStage,
  type PriorityWeight,
  type PressureSeverity,
} from './budgetVerify'

export interface BudgetPick {
  investmentId: string
  why?: string[]
  whyNote?: string
  targetElementIds?: string[]
  targetNames?: string[]
  /** Expert: self-estimated cost */
  estimatedCost?: number
}

export interface BudgetStageSubmission {
  picks: BudgetPick[]
  /** Points held back for later stages */
  reserved?: number
  /** Pressures the user chose to defer as debt */
  deferredPressureIds?: string[]
  /** Free-form expert proposals */
  customInvestments?: {
    label: string
    cost: number
    why?: string[]
    tags?: string[]
  }[]
  /** Optional diagram after applying investment stubs */
  diagram?: Record<string, unknown>
}

export interface BudgetDimension {
  key: string
  label: string
  ok: boolean
  detail?: string
  score?: number
}

export interface BudgetCoverageRow {
  priorityId: string
  label: string
  weight: PriorityWeight
  covered: boolean | 'partial'
  byInvestments: string[]
}

export interface BudgetStageGrade {
  accepted: boolean
  narrative: string
  spent: number
  remaining: number
  reserved: number
  overspend: boolean
  coverage: BudgetCoverageRow[]
  opportunityCost: string[]
  deferredDebt: { pressureId: string; label: string; severity: string }[]
  inflation?: {
    beforeNodes: number
    afterNodes: number
    delta: number
    note: string
  }
  cheapHackNotes: string[]
  dimensions: BudgetDimension[]
  stageId: string
  dayLabel: string
  picks: BudgetPick[]
}

const WEIGHT_SCORE: Record<PriorityWeight, number> = {
  critical: 40,
  high: 25,
  medium: 15,
  low: 8,
}

const SEVERITY_RANK: Record<PressureSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function tagsOf(inv: BudgetInvestment): string[] {
  return (inv.tags ?? []).map(t => t.toLowerCase())
}

function pickCoversPriority(inv: BudgetInvestment, pri: BudgetPriority): boolean {
  const tags = tagsOf(inv)
  const needed = (pri.coveredByTags ?? []).map(t => t.toLowerCase())
  if (!needed.length) {
    // Fallback: match priority id as tag
    return tags.includes(pri.id.toLowerCase()) || tags.some(t => pri.label.toLowerCase().includes(t))
  }
  return needed.some(n => tags.includes(n))
}

function pickAddressesPressure(inv: BudgetInvestment, pressure: BudgetPressure): boolean {
  if (pressure.addressedByInvestmentIds?.includes(inv.id)) return true
  const tags = tagsOf(inv)
  const needed = (pressure.addressedByTags ?? []).map(t => t.toLowerCase())
  if (!needed.length) return tags.includes(pressure.id.toLowerCase())
  return needed.some(n => tags.includes(n))
}

function nodeCount(diagram: Record<string, unknown> | undefined): number {
  return Array.isArray(diagram?.nodes) ? diagram!.nodes.length : 0
}

export function gradeBudgetStage(
  payload: BudgetPayload,
  stage: BudgetStage,
  submission: BudgetStageSubmission,
  opts: {
    budgetRemainingBefore: number
    reservedBefore: number
    baselineDiagram?: Record<string, unknown>
    openDebt?: { pressureId: string; severity: string }[]
  },
): BudgetStageGrade {
  const investments = payload.investments ?? []
  const priorities = [
    ...(payload.priorities ?? []),
    ...(stage.newPriorities ?? []),
  ]
  const pressures = mergePressures(
    payload.pressures ?? [],
    stage.newPressures ?? [],
    opts.openDebt ?? [],
    stage.debtEscalations ?? [],
  )

  const resolvedPicks: { pick: BudgetPick; inv: BudgetInvestment; cost: number }[] = []
  for (const pick of submission.picks ?? []) {
    const inv = findBudgetInvestment(payload, pick.investmentId)
    if (!inv) continue
    const cost =
      typeof pick.estimatedCost === 'number' && payload.difficultyMode === 'expert'
        ? Math.max(inv.costMin ?? 1, Math.min(inv.costMax ?? inv.cost * 2, pick.estimatedCost))
        : inv.cost
    resolvedPicks.push({ pick, inv, cost })
  }

  for (const custom of submission.customInvestments ?? []) {
    if (payload.difficultyMode !== 'expert' && !payload.auctionMode) continue
    const synthetic: BudgetInvestment = {
      id: `custom-${custom.label}`,
      label: custom.label,
      category: 'other',
      cost: Math.max(1, custom.cost),
      tags: custom.tags ?? [],
      whyOptions: custom.why,
    }
    resolvedPicks.push({
      pick: {
        investmentId: synthetic.id,
        why: custom.why,
      },
      inv: synthetic,
      cost: synthetic.cost,
    })
  }

  const spent = resolvedPicks.reduce((s, r) => s + r.cost, 0)
  const reserved = Math.max(0, Math.floor(submission.reserved ?? 0))
  const reserveAllowed = payload.budget.reserveAllowed !== false
  const effectiveReserved = reserveAllowed ? reserved : 0
  const overspend = spent + effectiveReserved > opts.budgetRemainingBefore
  const remaining = opts.budgetRemainingBefore - spent - effectiveReserved

  // Coverage
  const coverage: BudgetCoverageRow[] = priorities.map(pri => {
    const hit = resolvedPicks.filter(r => pickCoversPriority(r.inv, pri))
    const covered: boolean | 'partial' =
      hit.length >= 2 ? true : hit.length === 1 ? (pri.weight === 'critical' ? 'partial' : true) : false
    return {
      priorityId: pri.id,
      label: pri.label,
      weight: pri.weight,
      covered,
      byInvestments: hit.map(h => h.inv.label),
    }
  })

  // Opportunity cost: high/critical pressures not addressed while budget spent
  const opportunityCost: string[] = []
  if (payload.grading?.opportunityCostEnabled !== false && spent > 0) {
    for (const pr of pressures) {
      if (SEVERITY_RANK[pr.severity] < SEVERITY_RANK.high) continue
      const addressed = resolvedPicks.some(r => pickAddressesPressure(r.inv, pr))
      if (!addressed) {
        opportunityCost.push(
          `Left ${pr.severity} pressure “${pr.label}” unaddressed while spending ${spent} of budget.`,
        )
      }
    }
  }

  // Deferred debt
  const deferredDebt = (submission.deferredPressureIds ?? [])
    .map(id => pressures.find(p => p.id === id))
    .filter(Boolean)
    .map(p => ({
      pressureId: p!.id,
      label: p!.label,
      severity: p!.severity,
    }))

  // Cheap-hack notes
  const cheapHackNotes: string[] = []
  for (const r of resolvedPicks) {
    if (!r.inv.cheapHackOf) continue
    const proper = investments.find(i => i.id === r.inv.cheapHackOf)
    cheapHackNotes.push(
      `Chose cheap path “${r.inv.label}” instead of “${proper?.label ?? r.inv.cheapHackOf}” — fine for a short horizon, risky if requirements expand.`,
    )
  }
  // Also: chose proper when horizon is short
  for (const r of resolvedPicks) {
    const hack = investments.find(i => i.cheapHackOf === r.inv.id)
    if (!hack) continue
    // If scenario suggests short horizon via tags on pack
    const shortHorizon = (payload.scenario ?? '').toLowerCase().includes('12 months') ||
      (payload.scenario ?? '').toLowerCase().includes('mvp')
    if (shortHorizon && r.cost > hack.cost) {
      cheapHackNotes.push(
        `Invested in full “${r.inv.label}” (${r.cost}) while cheaper “${hack.label}” (${hack.cost}) may have fit an MVP horizon.`,
      )
    }
  }

  // Inflation
  const beforeNodes = nodeCount(opts.baselineDiagram)
  const afterNodes = nodeCount(submission.diagram) || beforeNodes
  const delta = afterNodes - beforeNodes
  const inflationSensitivity = payload.grading?.inflationSensitivity ?? 0.5
  const inflationNote =
    delta > 3 * inflationSensitivity + 2
      ? `Architecture grew by ${delta} components — check whether current requirements justified the expansion.`
      : delta > 0
        ? `Architecture grew by ${delta} component(s).`
        : 'No structural expansion recorded.'

  // Missing why
  const missingWhy = resolvedPicks.filter(
    r => !(r.pick.why?.length) && !(r.pick.whyNote?.trim()),
  )

  // Soft constraint checks (max new classes / abstractions from diagram delta)
  const constraints = payload.constraints
  if (constraints?.maxNewClasses != null && delta > constraints.maxNewClasses) {
    opportunityCost.push(
      `Added ${delta} classes vs maxNewClasses ${constraints.maxNewClasses} — soft over-class budget.`,
    )
  }
  if (constraints?.maxNewAbstractions != null && delta > constraints.maxNewAbstractions) {
    opportunityCost.push(
      `Structural growth (${delta}) exceeds maxNewAbstractions ${constraints.maxNewAbstractions}.`,
    )
  }

  // Dimensions
  const dimensions: BudgetDimension[] = []

  const criticalCov = coverage.filter(c => c.weight === 'critical')
  const criticalOk =
    criticalCov.length === 0 ||
    criticalCov.every(c => c.covered === true || c.covered === 'partial')
  dimensions.push({
    key: 'critical_coverage',
    label: 'Critical priorities',
    ok: criticalOk,
    detail: criticalCov.map(c => `${c.label}: ${c.covered === false ? '—' : '✓'}`).join('; ') || 'n/a',
    score: criticalOk ? 90 : 45,
  })

  dimensions.push({
    key: 'budget_discipline',
    label: 'Budget discipline',
    ok: !overspend && remaining >= 0,
    detail: overspend
      ? `Overspent by ${Math.abs(remaining)}`
      : `Spent ${spent}, reserved ${effectiveReserved}, remaining ${Math.max(0, remaining)}`,
    score: overspend ? 20 : remaining > 0 && reserveAllowed ? 95 : 85,
  })

  dimensions.push({
    key: 'opportunity_cost',
    label: 'Opportunity cost',
    ok: opportunityCost.length === 0,
    detail: opportunityCost[0] ?? 'No high-severity pressures left stranded.',
    score: opportunityCost.length === 0 ? 90 : Math.max(30, 80 - opportunityCost.length * 20),
  })

  dimensions.push({
    key: 'reasoning',
    label: 'Investment reasoning',
    ok: missingWhy.length === 0 && resolvedPicks.length > 0,
    detail:
      resolvedPicks.length === 0
        ? 'No investments selected (valid if reserving for later).'
        : missingWhy.length
          ? `${missingWhy.length} pick(s) missing a why.`
          : 'Each pick has a stated reason.',
    score:
      resolvedPicks.length === 0
        ? effectiveReserved > 0
          ? 80
          : 40
        : missingWhy.length
          ? 50
          : 92,
  })

  if (deferredDebt.length) {
    dimensions.push({
      key: 'debt',
      label: 'Deferred debt',
      ok: true,
      detail: `Deferred: ${deferredDebt.map(d => d.label).join(', ')}`,
      score: 70,
    })
  }

  const dimScore =
    dimensions.reduce((s, d) => s + (d.score ?? (d.ok ? 80 : 40)), 0) /
    Math.max(1, dimensions.length)
  const accepted = !overspend && dimScore >= 45

  const narrativeParts: string[] = []
  if (overspend) {
    narrativeParts.push('Allocation exceeds remaining budget — trim picks or reserved amount.')
  } else if (resolvedPicks.length === 0 && effectiveReserved > 0) {
    narrativeParts.push(
      `Reserved ${effectiveReserved} for future uncertainty — disciplined, if the open pressures can wait.`,
    )
  } else if (resolvedPicks.length === 0) {
    narrativeParts.push('No spend this stage. Doing nothing is sometimes correct — confirm pressures allow it.')
  } else {
    narrativeParts.push(
      `Allocated ${spent} across ${resolvedPicks.length} investment(s)` +
        (effectiveReserved ? `, reserved ${effectiveReserved}` : '') +
        '.',
    )
  }
  if (opportunityCost.length) {
    narrativeParts.push(opportunityCost[0])
  }
  if (criticalOk) {
    narrativeParts.push('Critical priorities have some coverage.')
  } else {
    narrativeParts.push('One or more critical priorities remain uncovered.')
  }

  return {
    accepted,
    narrative: narrativeParts.join(' '),
    spent,
    remaining: Math.max(0, remaining),
    reserved: effectiveReserved,
    overspend,
    coverage,
    opportunityCost,
    deferredDebt,
    inflation: {
      beforeNodes,
      afterNodes,
      delta,
      note: inflationNote,
    },
    cheapHackNotes,
    dimensions,
    stageId: stage.id,
    dayLabel: stage.dayLabel,
    picks: resolvedPicks.map(r => r.pick),
  }
}

function mergePressures(
  base: BudgetPressure[],
  extra: BudgetPressure[],
  openDebt: { pressureId: string; severity: string }[],
  escalations: { pressureId: string; fromSeverity: PressureSeverity; toSeverity: PressureSeverity }[],
): BudgetPressure[] {
  const map = new Map<string, BudgetPressure>()
  for (const p of [...base, ...extra]) map.set(p.id, { ...p })
  for (const d of openDebt) {
    const cur = map.get(d.pressureId)
    if (cur) {
      cur.severity = (d.severity as PressureSeverity) || cur.severity
    }
  }
  for (const e of escalations) {
    const cur = map.get(e.pressureId)
    if (cur && cur.severity === e.fromSeverity) {
      cur.severity = e.toSeverity
    }
  }
  return [...map.values()]
}

export function buildBudgetReport(
  payload: BudgetPayload,
  progress: {
    stageIndex: number
    remaining: number
    reserved: number
    picks: (BudgetPick & { stageId: string; cost?: number })[]
    deferredDebt: { pressureId: string; severity: string; deferredAtStage: string }[]
    stageGrades: BudgetStageGrade[]
    decisionLog: Record<string, unknown>[]
  },
) {
  const last = progress.stageGrades[progress.stageGrades.length - 1]
  const hooks = payload.evolutionHooks
  const deferredMapped = progress.deferredDebt.map(d => ({
    ...d,
    evolutionDebtId: hooks?.debtPressureMap?.[d.pressureId],
  }))
  return {
    budget: {
      kind: payload.budget.kind,
      total: payload.budget.total,
      remaining: progress.remaining,
      reserved: progress.reserved,
      allocated: payload.budget.total - progress.remaining - progress.reserved,
    },
    investments: progress.picks,
    coverage: last?.coverage ?? [],
    opportunityCost: last?.opportunityCost ?? [],
    deferred: deferredMapped,
    inflation: last?.inflation,
    cheapHackNotes: progress.stageGrades.flatMap(g => g.cheapHackNotes),
    dimensions: last?.dimensions ?? [],
    decisionLog: progress.decisionLog,
    stageGrades: progress.stageGrades,
    complete: progress.stageIndex >= (payload.stages?.length ?? 1),
    constraints: payload.constraints ?? null,
    evolutionHandoff: hooks?.linkedEvolutionSlug
      ? {
          slug: hooks.linkedEvolutionSlug,
          blurb: hooks.handoffBlurb ?? 'Continue these deferred debts in Architecture Evolution.',
          debtIds: deferredMapped
            .map(d => d.evolutionDebtId)
            .filter((x): x is string => Boolean(x)),
        }
      : null,
    comboMode: Boolean(payload.comboMode),
    comboBlurb: payload.comboBlurb ?? null,
  }
}

export type { BudgetPayload, BudgetStage, BudgetInvestment }
