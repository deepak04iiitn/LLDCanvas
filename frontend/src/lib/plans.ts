/** Mirror of backend/src/config/plans.ts — keep in sync */

export type PlanName = 'free' | 'pro' | 'ultimate'

/** The 5 design patterns available on the free tier (most uncommon / least used) */
export const FREE_PATTERN_KEYS = new Set([
  'flyweight',
  'visitor',
  'interpreter',
  'mediator',
  'memento',
])

/** Export formats allowed per plan */
export const PLAN_EXPORT_FORMATS: Record<PlanName, string[]> = {
  free:     [],
  pro:      ['draft', 'plantuml', 'mermaid'],
  ultimate: ['png', 'svg', 'draft', 'plantuml', 'mermaid'],
}

/** Returns whether a plan can access a specific export format */
export function canExport(plan: PlanName, format: 'png' | 'svg' | 'plantuml' | 'mermaid' | 'draft'): boolean {
  return PLAN_EXPORT_FORMATS[plan].includes(format)
}

export const PLAN_LABELS: Record<PlanName, string> = {
  free:     'Free',
  pro:      'Pro',
  ultimate: 'Ultimate',
}
