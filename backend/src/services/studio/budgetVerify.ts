/** Architecture Budget — pack payload types + helpers. */

export type BudgetKind =
  | 'points'
  | 'engineer_days'
  | 'infra_usd'
  | 'time_days'
  | 'complexity'

export type PriorityWeight = 'critical' | 'high' | 'medium' | 'low'

export type BudgetDifficultyMode = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type PressureSeverity = 'critical' | 'high' | 'medium' | 'low'

export type InvestmentCategory =
  | 'reliability'
  | 'scalability'
  | 'maintainability'
  | 'extensibility'
  | 'observability'
  | 'other'
  | string

export interface BudgetConfig {
  kind: BudgetKind
  total: number
  reserveAllowed?: boolean
  /** Label for UI meter (e.g. "Architecture Points", "Engineer-Days") */
  unitLabel?: string
}

export interface BudgetPriority {
  id: string
  label: string
  weight: PriorityWeight
  /** Investment tags that cover this priority */
  coveredByTags?: string[]
}

export interface BudgetPressure {
  id: string
  label: string
  severity: PressureSeverity
  /** Tags / investment ids that address this pressure */
  addressedByTags?: string[]
  addressedByInvestmentIds?: string[]
}

export interface BudgetInvestment {
  id: string
  label: string
  category: InvestmentCategory
  cost: number
  /** Short blurb shown on catalog card */
  summary?: string
  tags?: string[]
  benefits?: string[]
  complexities?: string[]
  risks?: string[]
  /** Why options shown when picking this investment */
  whyOptions?: string[]
  /** Component name hints the user can target */
  appliesToHints?: string[]
  /** If set, this is a cheap-hack alternative to the proper investment id */
  cheapHackOf?: string
  /** Proper alternative id (paired with cheapHackOf) */
  properAlternativeOf?: string
  /** Expert mode: allow free-form cost override range */
  costMin?: number
  costMax?: number
}

export interface BudgetConstraints {
  maxNewClasses?: number
  maxExternalSystems?: number
  teamSize?: number
  deadlineDays?: number
  /** Class-slot budget: max new abstractions (interfaces/classes) */
  maxNewAbstractions?: number
}

export interface BudgetDebtEscalation {
  pressureId: string
  fromSeverity: PressureSeverity
  toSeverity: PressureSeverity
}

export interface BudgetStage {
  id: string
  dayLabel: string
  title: string
  narrative: string
  /** Extra budget granted at this stage (can be 0) */
  budgetDelta?: number
  newPriorities?: BudgetPriority[]
  newPressures?: BudgetPressure[]
  revealMetrics?: Record<string, string | number>
  debtEscalations?: BudgetDebtEscalation[]
  /** Investments unlocked only at this stage */
  unlockInvestmentIds?: string[]
}

export interface BudgetGrading {
  /** Soft: expected tag coverage for critical priorities */
  minCriticalCoverage?: number
  /** Soft penalty narrative when high/critical pressures left open */
  opportunityCostEnabled?: boolean
  /** Soft: flag if spend >> needed for scenario */
  inflationSensitivity?: number
}

export interface BudgetEvolutionHooks {
  /** Evolution pack slug to continue deferred debt into */
  linkedEvolutionSlug?: string
  /** Map budget pressure ids → evolution pack debt / stage hint ids */
  debtPressureMap?: Record<string, string>
  /** Copy shown when offering the Evolution handoff */
  handoffBlurb?: string
}

export interface BudgetPayload {
  briefing?: string
  scenario?: string
  difficultyMode?: BudgetDifficultyMode
  /** Auction framing copy (Phase 5) */
  auctionMode?: boolean
  auctionBlurb?: string
  /** Combined Evolution + Budget journey framing */
  comboMode?: boolean
  comboBlurb?: string
  budget: BudgetConfig
  priorities?: BudgetPriority[]
  pressures?: BudgetPressure[]
  investments?: BudgetInvestment[]
  constraints?: BudgetConstraints
  /** Stage 0 is the initial scenario; later stages = future events */
  stages?: BudgetStage[]
  grading?: BudgetGrading
  /** Suggested reserve amount hint (UI only) */
  suggestedReserve?: number
  /** Connect deferred debt into Architecture Evolution packs */
  evolutionHooks?: BudgetEvolutionHooks
}

export function parseBudgetPayload(raw: unknown): BudgetPayload {
  if (!raw || typeof raw !== 'object') {
    return {
      budget: { kind: 'points', total: 8, reserveAllowed: true, unitLabel: 'Points' },
      investments: [],
      priorities: [],
      pressures: [],
      stages: [],
    }
  }
  const p = raw as BudgetPayload
  const budget = p.budget ?? {
    kind: 'points' as BudgetKind,
    total: 8,
    reserveAllowed: true,
    unitLabel: 'Points',
  }
  const stages =
    Array.isArray(p.stages) && p.stages.length > 0
      ? p.stages
      : [
          {
            id: 's0',
            dayLabel: 'Now',
            title: 'Initial allocation',
            narrative: p.scenario ?? p.briefing ?? 'Allocate your architecture budget.',
          },
        ]
  return {
    ...p,
    budget,
    priorities: p.priorities ?? [],
    pressures: p.pressures ?? [],
    investments: p.investments ?? [],
    stages,
    grading: p.grading ?? { opportunityCostEnabled: true },
    difficultyMode: p.difficultyMode ?? 'intermediate',
  }
}

export function getBudgetStages(raw: unknown): BudgetStage[] {
  return parseBudgetPayload(raw).stages ?? []
}

export function findBudgetInvestment(
  payload: BudgetPayload,
  id: string,
): BudgetInvestment | undefined {
  return (payload.investments ?? []).find(i => i.id === id)
}

export function unitLabelFor(kind: BudgetKind, override?: string): string {
  if (override) return override
  switch (kind) {
    case 'engineer_days':
      return 'Engineer-Days'
    case 'infra_usd':
      return '$/mo'
    case 'time_days':
      return 'Days'
    case 'complexity':
      return 'Complexity'
    default:
      return 'Points'
  }
}
