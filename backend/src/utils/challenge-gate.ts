import type { PlanName } from '../config/plans'
import {
  annotateChallengeAccess,
  type ChallengeFeature,
} from '../config/challenge-access'

/** Annotate catalog rows with locked + requiredPlan for the caller's plan. */
export function withChallengeLocks<T extends { slug: string; difficulty?: string }>(
  feature: ChallengeFeature,
  plan: PlanName | undefined,
  items: T[],
) {
  return annotateChallengeAccess(feature, plan ?? 'free', items)
}
