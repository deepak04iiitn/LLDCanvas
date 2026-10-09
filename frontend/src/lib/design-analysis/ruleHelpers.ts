import type {
  AffectedElement,
  FactNode,
  GraphFacts,
  RuleFinding,
  RuleStatus,
  Severity,
  RuleCategory,
} from './types'
import { SEVERITY_FAIL_WEIGHT } from './types'

export function nodeEl(n: FactNode): AffectedElement {
  return { id: n.id, kind: 'node', label: n.name || n.id }
}

export function edgeEl(id: string, label: string): AffectedElement {
  return { id, kind: 'edge', label }
}

export function finding(opts: {
  ruleId: string
  status: RuleStatus
  severity: Severity
  category: RuleCategory
  title: string
  message: string
  why: string
  howToFix: string
  affectedElements?: AffectedElement[]
  groupKey?: string
  weight: number
}): RuleFinding {
  const impact =
    opts.status === 'fail'
      ? opts.weight || SEVERITY_FAIL_WEIGHT[opts.severity]
      : opts.status === 'warn'
        ? Math.max(1, Math.round((opts.weight || SEVERITY_FAIL_WEIGHT[opts.severity]) * 0.4))
        : 0

  return {
    ruleId: opts.ruleId,
    status: opts.status,
    severity: opts.severity,
    title: opts.title,
    message: opts.message,
    why: opts.why,
    howToFix: opts.howToFix,
    affectedElements: opts.affectedElements ?? [],
    groupKey: opts.groupKey,
    category: opts.category,
    scoreImpact: impact,
  }
}

export function passFinding(
  ruleId: string,
  category: RuleCategory,
  title: string,
  message: string,
  why: string,
): RuleFinding {
  return finding({
    ruleId,
    status: 'pass',
    severity: 'info',
    category,
    title,
    message,
    why,
    howToFix: '',
    weight: 0,
  })
}

export function naFinding(
  ruleId: string,
  category: RuleCategory,
  title: string,
  message: string,
): RuleFinding {
  return finding({
    ruleId,
    status: 'na',
    severity: 'info',
    category,
    title,
    message,
    why: 'Not applicable to this diagram.',
    howToFix: '',
    weight: 0,
  })
}

export function isPascalCase(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name)
}

export function inheritanceDepth(facts: GraphFacts, nodeId: string): number {
  let depth = 0
  let cur = nodeId
  const seen = new Set<string>()
  while (true) {
    const parents = facts.inheritanceParents[cur] ?? []
    if (!parents.length) break
    const p = parents[0]
    if (seen.has(p)) break
    seen.add(p)
    depth++
    cur = p
    if (depth > 20) break
  }
  return depth
}
