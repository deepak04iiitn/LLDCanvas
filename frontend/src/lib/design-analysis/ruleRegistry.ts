import type { DesignRule } from './types'
import { umlRules } from './rules/uml'
import { structureRules } from './rules/structure'
import { relationshipRules } from './rules/relationships'
import { solidRules } from './rules/solid'
import { namingRules } from './rules/naming'
import { extensibilityRules } from './rules/extensibility'

export const RULESET_VERSION = 'design-analysis/v2'

export const ALL_RULES: DesignRule[] = [
  ...umlRules,
  ...structureRules,
  ...relationshipRules,
  ...solidRules,
  ...namingRules,
  ...extensibilityRules,
]

export function getRules(): DesignRule[] {
  return ALL_RULES
}
