import { buildGraphFacts } from './graphFacts'
import { getRules, RULESET_VERSION } from './ruleRegistry'
import { buildReport } from './scoreModel'
import type { AnalysisReport, DiagramInput, RuleFinding } from './types'

export function analyzeDiagramDesign(
  diagram: DiagramInput,
  opts?: { revisionId?: string },
): AnalysisReport {
  const revisionId = opts?.revisionId ?? `rev-${Date.now()}`
  const facts = buildGraphFacts(diagram, revisionId)
  const rules = getRules()
  const findings: RuleFinding[] = []

  for (const rule of rules) {
    try {
      const result = rule.evaluate(facts)
      if (!result.length) {
        findings.push({
          ruleId: rule.id,
          status: 'na',
          severity: 'info',
          title: rule.title,
          message: 'No result',
          why: rule.whyItMatters,
          howToFix: rule.howToFix,
          affectedElements: [],
          category: rule.category,
          scoreImpact: 0,
        })
        continue
      }
      for (const f of result) {
        findings.push({
          ...f,
          why: f.why || rule.whyItMatters,
          howToFix: f.howToFix || rule.howToFix,
          title: f.title || rule.title,
        })
      }
    } catch {
      // Skip broken rule evaluation — never crash analysis
    }
  }

  return buildReport(facts, rules, findings, RULESET_VERSION)
}

/** Category batches for the running animation UI */
export function analysisCategoryBatches(): { id: string; label: string }[] {
  return [
    { id: 'uml', label: 'UML correctness' },
    { id: 'structure', label: 'Structure & smells' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'solid', label: 'SOLID heuristics' },
    { id: 'naming', label: 'Naming & modeling' },
    { id: 'extensibility', label: 'Extensibility' },
  ]
}
