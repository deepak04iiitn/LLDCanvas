import type {
  AnalysisReport,
  CategoryScore,
  GraphFacts,
  RuleCategory,
  RuleFinding,
} from './types'
import { CATEGORY_LABELS } from './types'
import type { DesignRule } from './types'

const CATEGORY_ORDER: RuleCategory[] = [
  'uml',
  'structure',
  'relationships',
  'solid',
  'naming',
  'extensibility',
]

/**
 * Cap how high a skeletal diagram can score even when few rules fire.
 * Absence of smells ≠ a strong design — empty shells used to land ~90.
 */
function designMaturityCap(facts: GraphFacts): number {
  const types = facts.typeNodes.length
  if (types === 0) return 12

  const populated = facts.typeNodes.filter(
    n => n.nodeType === 'enum' || !n.isEmpty,
  ).length
  const edges = facts.edges.length

  if (populated === 0) {
    // Only empty shells (e.g. two ClassName boxes)
    return Math.min(28, 10 + types * 6)
  }
  if (edges === 0 && types >= 2) {
    return Math.min(55, 25 + populated * 12)
  }
  if (edges === 0) {
    return Math.min(70, 35 + populated * 15)
  }
  return 100
}

/**
 * Start at 100; subtract capped penalties per groupKey for fail/warn only.
 * N/A excluded. Passes become strengths. Maturity cap prevents overscoring skeletons.
 */
export function buildReport(
  facts: GraphFacts,
  rules: DesignRule[],
  findings: RuleFinding[],
  rulesetVersion: string,
): AnalysisReport {
  const applicable = findings.filter(f => f.status !== 'na')
  const passed = findings.filter(f => f.status === 'pass')
  const failed = findings.filter(f => f.status === 'fail')
  const warned = findings.filter(f => f.status === 'warn')
  const na = findings.filter(f => f.status === 'na')

  // Dedupe penalties by groupKey — keep max impact in group
  const penaltyFindings = [...failed, ...warned]
  const byGroup = new Map<string, RuleFinding>()
  for (const f of penaltyFindings) {
    const key = f.groupKey ?? `${f.ruleId}:${f.affectedElements.map(a => a.id).join(',')}`
    const prev = byGroup.get(key)
    if (!prev || f.scoreImpact > prev.scoreImpact) byGroup.set(key, f)
  }

  let deducted = 0
  for (const f of byGroup.values()) {
    deducted += f.scoreImpact
  }
  const raw = Math.max(0, Math.min(100, Math.round(100 - deducted)))
  const overallScore = Math.min(raw, designMaturityCap(facts))

  const categories: CategoryScore[] = CATEGORY_ORDER.map(category => {
    const catFindings = findings.filter(f => f.category === category)
    const catApp = catFindings.filter(f => f.status !== 'na')
    const catFail = catFindings.filter(f => f.status === 'fail')
    const catWarn = catFindings.filter(f => f.status === 'warn')
    const catPass = catFindings.filter(f => f.status === 'pass')

    const groupPen = new Map<string, number>()
    for (const f of [...catFail, ...catWarn]) {
      const key = f.groupKey ?? f.ruleId
      groupPen.set(key, Math.max(groupPen.get(key) ?? 0, f.scoreImpact))
    }
    let pen = 0
    for (const v of groupPen.values()) pen += v
    // Category score: 100 within category if applicable, else N/A as 100 display with 0 max
    const max = catApp.length ? 100 : 0
    const score = catApp.length ? Math.max(0, Math.min(100, Math.round(100 - pen))) : 100

    return {
      category,
      label: CATEGORY_LABELS[category],
      score,
      max,
      applicable: catApp.length,
      failed: catFail.length,
      warned: catWarn.length,
      passed: catPass.length,
    }
  }).filter(c => rules.some(r => r.category === c.category))

  const weaknesses = [...failed, ...warned].sort((a, b) => {
    const sev = { critical: 0, major: 1, minor: 2, info: 3 }
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity]
    return b.scoreImpact - a.scoreImpact
  })

  const strengths = passed.filter(f => f.message).slice(0, 12)
  const recommendations = weaknesses.slice(0, 10)

  return {
    rulesetVersion,
    revisionId: facts.revisionId,
    overallScore,
    findings,
    strengths,
    weaknesses,
    recommendations,
    categories,
    summary: {
      nodeCount: facts.nodes.length,
      edgeCount: facts.edges.length,
      typeCount: facts.typeNodes.length,
      applicableRules: applicable.length,
      failed: failed.length,
      warned: warned.length,
      passed: passed.length,
      na: na.length,
    },
  }
}
