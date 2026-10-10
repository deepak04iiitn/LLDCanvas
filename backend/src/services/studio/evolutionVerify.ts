/** Architecture Evolution — stage payload + behavior verification. */

import {
  verifyChangeBehavior,
  type BehaviorCheck,
  type ChangeFlow,
} from './changeVerify'

export type EvolutionStageCategory =
  | 'product'
  | 'scale'
  | 'reliability'
  | 'incident'
  | 'team'
  | 'legacy'
  | string

export interface EvolutionDebtOpportunity {
  id: string
  prompt: string
  costIfDeferred: string
  laterStageId?: string
}

export interface EvolutionIntroduceCatalog {
  namePattern: string
  benefits: string[]
  costs: string[]
}

export interface EvolutionStage {
  id: string
  dayLabel: string
  title: string
  category?: EvolutionStageCategory
  narrative: string
  metrics?: {
    users?: number
    ordersPerDay?: number
    latencyMs?: number
    availability?: string
  }
  pressureOptions: string[]
  expectedPressures?: string[]
  mustChange: boolean
  doNothingHint?: string
  protectedFlows?: ChangeFlow[]
  newFlows?: ChangeFlow[]
  forbidModifyElementNames?: string[]
  expectedTouchHints?: string[]
  debtOpportunity?: EvolutionDebtOpportunity
  introduceCatalog?: EvolutionIntroduceCatalog[]
  complexityBudget?: number
  approachHints?: string[]
}

export interface EvolutionPayload {
  briefing?: string
  dimensions?: string[]
  stages?: EvolutionStage[]
  /** legacy alias */
  checkpoints?: EvolutionStage[]
  versions?: EvolutionStage[]
}

export function parseEvolutionPayload(raw: unknown): EvolutionPayload {
  if (!raw || typeof raw !== 'object') return { stages: [] }
  const p = raw as EvolutionPayload
  const stages = p.stages ?? p.checkpoints ?? p.versions ?? []
  return { ...p, stages }
}

export function getEvolutionStages(raw: unknown): EvolutionStage[] {
  return parseEvolutionPayload(raw).stages ?? []
}

export function verifyEvolutionStage(
  diagram: Record<string, unknown>,
  stage: EvolutionStage,
): {
  protectedChecks: BehaviorCheck[]
  newChecks: BehaviorCheck[]
  checks: BehaviorCheck[]
  protectedPct: number
  newPct: number
} {
  return verifyChangeBehavior(diagram, {
    protectedFlows: stage.protectedFlows ?? [],
    newFlows: stage.newFlows ?? [],
  })
}
