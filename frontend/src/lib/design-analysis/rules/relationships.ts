import type { DesignRule } from '../types'
import { edgeEl, finding, inheritanceDepth, naFinding, nodeEl, passFinding } from '../ruleHelpers'

export const relationshipRules: DesignRule[] = [
  {
    id: 'rel.concrete-inheritance',
    title: 'Prefer abstraction for inheritance',
    description: 'Concrete→concrete inheritance is often brittle.',
    category: 'relationships',
    severity: 'minor',
    kind: 'recommended',
    weight: 4,
    whyItMatters: 'Fragile base class problem.',
    howToFix: 'Extract an abstract class/interface or use composition.',
    evaluate: facts => {
      const hits = facts.edges.filter(e => {
        if (e.relationshipType !== 'inheritance') return false
        const s = facts.byId[e.source]
        const t = facts.byId[e.target]
        return s?.nodeType === 'class' && t?.nodeType === 'class'
      })
      if (!hits.length) {
        return facts.edges.some(e => e.relationshipType === 'inheritance')
          ? [
              passFinding(
                'rel.concrete-inheritance',
                'relationships',
                'Inheritance targets abstractions',
                'No concrete→concrete inheritance.',
                'Hierarchies stay flexible.',
              ),
            ]
          : [naFinding('rel.concrete-inheritance', 'relationships', 'Inheritance', 'No inheritance.')]
      }
      return hits.map(e =>
        finding({
          ruleId: 'rel.concrete-inheritance',
          status: 'warn',
          severity: 'minor',
          category: 'relationships',
          title: 'Concrete inherits concrete',
          message: `${facts.byId[e.source]?.name} extends ${facts.byId[e.target]?.name}.`,
          why: 'Often better as composition or abstract parent.',
          howToFix: 'Introduce abstract type or compose instead.',
          affectedElements: [edgeEl(e.id, 'inheritance')],
          groupKey: `conc-inh-${e.id}`,
          weight: 4,
        }),
      )
    },
  },
  {
    id: 'rel.deep-inheritance',
    title: 'Shallow inheritance trees',
    description: 'Depth beyond 3 is a smell for most LLD designs.',
    category: 'relationships',
    severity: 'major',
    kind: 'recommended',
    weight: 8,
    whyItMatters: 'Deep trees are hard to reason about under interview pressure.',
    howToFix: 'Flatten hierarchy; prefer composition.',
    evaluate: facts => {
      const deep = facts.typeNodes
        .map(n => ({ n, d: inheritanceDepth(facts, n.id) }))
        .filter(x => x.d >= 3)
      if (!deep.length) {
        return facts.edges.some(e => e.relationshipType === 'inheritance')
          ? [
              passFinding(
                'rel.deep-inheritance',
                'relationships',
                'Shallow hierarchies',
                'Inheritance depth stays ≤ 2.',
                'Easier to explain in interviews.',
              ),
            ]
          : [naFinding('rel.deep-inheritance', 'relationships', 'Inheritance depth', 'No inheritance.')]
      }
      return deep.map(({ n, d }) =>
        finding({
          ruleId: 'rel.deep-inheritance',
          status: 'warn',
          severity: 'major',
          category: 'relationships',
          title: 'Deep inheritance',
          message: `${n.name} sits at depth ${d}.`,
          why: 'Long chains amplify coupling.',
          howToFix: 'Collapse levels or switch to composition.',
          affectedElements: [nodeEl(n)],
          groupKey: `depth-${n.id}`,
          weight: 8,
        }),
      )
    },
  },
  {
    id: 'rel.dep-to-abstraction',
    title: 'Depend on abstractions when available',
    description: 'If interfaces exist and many clients hit a concrete, prefer the interface.',
    category: 'relationships',
    severity: 'major',
    kind: 'recommended',
    weight: 8,
    whyItMatters: 'Supports DIP and testability.',
    howToFix: 'Route clients through the interface (realization + dependency).',
    evaluate: facts => {
      if (facts.interfaces.length === 0 || facts.concretes.length < 2) {
        return [
          naFinding(
            'rel.dep-to-abstraction',
            'relationships',
            'Depend on abstractions',
            'No interface+clients context — not forced.',
          ),
        ]
      }
      const findings = []
      for (const concrete of facts.concretes) {
        const realized = facts.realizations.some(r => r.classId === concrete.id)
        if (!realized) continue
        const clients = (facts.inbound[concrete.id] ?? []).filter(e =>
          ['dependency', 'association', 'aggregation', 'composition'].includes(e.relationshipType),
        )
        if (clients.length < 2) continue
        findings.push(
          finding({
            ruleId: 'rel.dep-to-abstraction',
            status: 'warn',
            severity: 'major',
            category: 'relationships',
            title: 'Clients depend on concrete',
            message: `${clients.length} clients depend on ${concrete.name} which already implements an interface.`,
            why: 'Depending on the concrete bypasses the abstraction you introduced.',
            howToFix: 'Point dependencies at the interface instead.',
            affectedElements: [nodeEl(concrete), ...clients.slice(0, 3).map(e => edgeEl(e.id, e.relationshipType))],
            groupKey: `dip-conc-${concrete.id}`,
            weight: 8,
          }),
        )
      }
      if (!findings.length) {
        return [
          passFinding(
            'rel.dep-to-abstraction',
            'relationships',
            'Abstractions respected',
            'No clear concrete-bypass pattern.',
            'Interfaces are used where introduced.',
          ),
        ]
      }
      return findings
    },
  },
  {
    id: 'rel.ownership-vs-dependency',
    title: 'Ownership vs dependency clarity',
    description: 'Heavy use of bare dependency where composition is likely.',
    category: 'relationships',
    severity: 'info',
    kind: 'optional',
    weight: 2,
    whyItMatters: 'Interviewers care whether lifetime/ownership is clear.',
    howToFix: 'Upgrade to aggregation/composition when one type owns another.',
    evaluate: facts => {
      const deps = facts.edges.filter(e => e.relationshipType === 'dependency')
      const owned = facts.edges.filter(e =>
        ['composition', 'aggregation'].includes(e.relationshipType),
      )
      if (deps.length < 3) {
        return [naFinding('rel.ownership-vs-dependency', 'relationships', 'Ownership clarity', 'Few dependencies.')]
      }
      if (owned.length > 0 || deps.length < 5) {
        return [
          passFinding(
            'rel.ownership-vs-dependency',
            'relationships',
            'Relationship mix OK',
            'Dependencies are not dominating ownership edges.',
            'Ownership can still be refined as needed.',
          ),
        ]
      }
      return [
        finding({
          ruleId: 'rel.ownership-vs-dependency',
          status: 'warn',
          severity: 'info',
          category: 'relationships',
          title: 'Mostly dashed dependencies',
          message: `${deps.length} dependency edges and no aggregation/composition.`,
          why: 'Some of these may really be ownership.',
          howToFix: 'Promote true has-a links to aggregation/composition.',
          affectedElements: deps.slice(0, 4).map(e => edgeEl(e.id, 'dependency')),
          groupKey: 'dep-heavy',
          weight: 2,
        }),
      ]
    },
  },
]
