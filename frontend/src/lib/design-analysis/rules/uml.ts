import type { DesignRule } from '../types'
import { edgeEl, finding, naFinding, nodeEl, passFinding } from '../ruleHelpers'

const OWNERSHIP = new Set(['association', 'aggregation', 'composition', 'bidirectional'])

export const umlRules: DesignRule[] = [
  {
    id: 'uml.empty-diagram',
    title: 'Diagram has types',
    description: 'At least one class, interface, or enum should exist.',
    category: 'uml',
    severity: 'critical',
    kind: 'mandatory',
    weight: 18,
    whyItMatters: 'An empty canvas cannot express a design.',
    howToFix: 'Add the core types for your problem (entities, services, interfaces).',
    evaluate: facts => {
      if (facts.typeNodes.length === 0) {
        return [
          finding({
            ruleId: 'uml.empty-diagram',
            status: 'fail',
            severity: 'critical',
            category: 'uml',
            title: 'Empty design',
            message: 'No UML types on the canvas.',
            why: 'Without types there is nothing to review.',
            howToFix: 'Add classes or interfaces that model the problem.',
            weight: 18,
            groupKey: 'empty-diagram',
          }),
        ]
      }
      return [
        passFinding(
          'uml.empty-diagram',
          'uml',
          'Diagram has types',
          `${facts.typeNodes.length} type(s) present.`,
          'A design needs at least one type to evaluate.',
        ),
      ]
    },
  },
  {
    id: 'uml.self-inheritance',
    title: 'No self-inheritance',
    description: 'A type must not inherit from itself.',
    category: 'uml',
    severity: 'critical',
    kind: 'mandatory',
    weight: 15,
    whyItMatters: 'Self-inheritance is invalid UML and meaningless in code.',
    howToFix: 'Remove the inheritance edge or point it at a real parent type.',
    evaluate: facts => {
      const bad = facts.edges.filter(
        e => e.relationshipType === 'inheritance' && e.source === e.target,
      )
      if (!bad.length) {
        return facts.edges.some(e => e.relationshipType === 'inheritance')
          ? [
              passFinding(
                'uml.self-inheritance',
                'uml',
                'No self-inheritance',
                'Inheritance edges are well-formed.',
                'Types should not extend themselves.',
              ),
            ]
          : [naFinding('uml.self-inheritance', 'uml', 'No self-inheritance', 'No inheritance edges.')]
      }
      return bad.map(e =>
        finding({
          ruleId: 'uml.self-inheritance',
          status: 'fail',
          severity: 'critical',
          category: 'uml',
          title: 'Self-inheritance',
          message: `${facts.byId[e.source]?.name ?? e.source} inherits from itself.`,
          why: 'Invalid model — creates a cycle of one.',
          howToFix: 'Delete this edge or retarget a parent class.',
          affectedElements: [edgeEl(e.id, 'inheritance'), nodeEl(facts.byId[e.source])],
          groupKey: `self-inh-${e.source}`,
          weight: 15,
        }),
      )
    },
  },
  {
    id: 'uml.enum-inheritance',
    title: 'Enums do not participate in inheritance',
    description: 'Enum types should not extend or be extended via inheritance.',
    category: 'uml',
    severity: 'major',
    kind: 'mandatory',
    weight: 10,
    whyItMatters: 'Most languages forbid class↔enum inheritance.',
    howToFix: 'Use association or remove the inheritance edge.',
    evaluate: facts => {
      const hits = facts.edges.filter(e => {
        if (e.relationshipType !== 'inheritance') return false
        const s = facts.byId[e.source]
        const t = facts.byId[e.target]
        return s?.nodeType === 'enum' || t?.nodeType === 'enum'
      })
      if (!hits.length) {
        return facts.typeNodes.some(n => n.nodeType === 'enum')
          ? [
              passFinding(
                'uml.enum-inheritance',
                'uml',
                'Enums without inheritance',
                'Enums are not in inheritance hierarchies.',
                'Keeps the model language-legal.',
              ),
            ]
          : [naFinding('uml.enum-inheritance', 'uml', 'Enums without inheritance', 'No enums.')]
      }
      return hits.map(e =>
        finding({
          ruleId: 'uml.enum-inheritance',
          status: 'fail',
          severity: 'major',
          category: 'uml',
          title: 'Invalid enum inheritance',
          message: 'Inheritance involves an enum.',
          why: 'Enums are value sets, not extensible class hierarchies.',
          howToFix: 'Replace with association or drop the edge.',
          affectedElements: [edgeEl(e.id, 'inheritance')],
          groupKey: `enum-inh-${e.id}`,
          weight: 10,
        }),
      )
    },
  },
  {
    id: 'uml.realization-target',
    title: 'Realization targets interfaces',
    description: 'Realization should go from a classifier to an interface.',
    category: 'uml',
    severity: 'critical',
    kind: 'mandatory',
    weight: 12,
    whyItMatters: 'Realization means “implements contract”.',
    howToFix: 'Point realization at an «interface» or change the edge type.',
    evaluate: facts => {
      const bad = facts.edges.filter(e => {
        if (e.relationshipType !== 'realization') return false
        const t = facts.byId[e.target]
        return t?.nodeType !== 'interface'
      })
      if (!bad.length) {
        return facts.edges.some(e => e.relationshipType === 'realization')
          ? [
              passFinding(
                'uml.realization-target',
                'uml',
                'Realization → interface',
                'Realization edges target interfaces.',
                'Implements relationship is correctly modeled.',
              ),
            ]
          : [naFinding('uml.realization-target', 'uml', 'Realization → interface', 'No realization edges.')]
      }
      return bad.map(e =>
        finding({
          ruleId: 'uml.realization-target',
          status: 'fail',
          severity: 'critical',
          category: 'uml',
          title: 'Realization not to interface',
          message: `${facts.byId[e.source]?.name} realizes ${facts.byId[e.target]?.name} which is not an interface.`,
          why: 'Realization is reserved for interface contracts.',
          howToFix: 'Make the target an interface or use inheritance/association.',
          affectedElements: [edgeEl(e.id, 'realization'), nodeEl(facts.byId[e.target])],
          groupKey: `real-${e.id}`,
          weight: 12,
        }),
      )
    },
  },
  {
    id: 'uml.interface-inheritance',
    title: 'Interfaces do not extend classes',
    description: 'An interface should not inherit from a concrete/abstract class.',
    category: 'uml',
    severity: 'major',
    kind: 'mandatory',
    weight: 10,
    whyItMatters: 'Interfaces extend interfaces (or stand alone), not classes.',
    howToFix: 'Change parent to an interface or invert the relationship.',
    evaluate: facts => {
      const bad = facts.edges.filter(e => {
        if (e.relationshipType !== 'inheritance') return false
        const s = facts.byId[e.source]
        const t = facts.byId[e.target]
        return s?.nodeType === 'interface' && (t?.nodeType === 'class' || t?.nodeType === 'abstract-class')
      })
      if (!bad.length) {
        return [naFinding('uml.interface-inheritance', 'uml', 'Interface inheritance', 'No interface→class inheritance.')]
      }
      return bad.map(e =>
        finding({
          ruleId: 'uml.interface-inheritance',
          status: 'fail',
          severity: 'major',
          category: 'uml',
          title: 'Interface extends class',
          message: `${facts.byId[e.source]?.name} (interface) inherits from a class.`,
          why: 'Breaks typical language rules and UML intent.',
          howToFix: 'Use interface–interface inheritance or realization the other way.',
          affectedElements: [edgeEl(e.id, 'inheritance')],
          groupKey: `iface-inh-${e.id}`,
          weight: 10,
        }),
      )
    },
  },
  {
    id: 'uml.ownership-multiplicity',
    title: 'Ownership edges declare multiplicity',
    description: 'Association / aggregation / composition should show multiplicities.',
    category: 'uml',
    severity: 'minor',
    kind: 'recommended',
    weight: 3,
    whyItMatters: 'Multiplicity clarifies cardinality for interviewers and implementers.',
    howToFix: 'Set source and target multiplicity (e.g. 1 and 0..*).',
    evaluate: facts => {
      const owned = facts.edges.filter(e => OWNERSHIP.has(e.relationshipType))
      if (!owned.length) {
        return [naFinding('uml.ownership-multiplicity', 'uml', 'Multiplicity', 'No association-style edges.')]
      }
      const missing = owned.filter(e => !e.sourceMultiplicity || !e.targetMultiplicity)
      if (!missing.length) {
        return [
          passFinding(
            'uml.ownership-multiplicity',
            'uml',
            'Multiplicities set',
            'Ownership relationships declare both ends.',
            'Cardinality is explicit.',
          ),
        ]
      }
      return missing.slice(0, 8).map(e =>
        finding({
          ruleId: 'uml.ownership-multiplicity',
          status: 'warn',
          severity: 'minor',
          category: 'uml',
          title: 'Missing multiplicity',
          message: `${facts.byId[e.source]?.name} → ${facts.byId[e.target]?.name} lacks multiplicity.`,
          why: 'Interviewers expect to see 1 / 0..1 / 0..* / 1..*.',
          howToFix: 'Edit the edge and set both multiplicities.',
          affectedElements: [edgeEl(e.id, e.relationshipType)],
          groupKey: `mult-${e.id}`,
          weight: 3,
        }),
      )
    },
  },
  {
    id: 'uml.conflicting-edges',
    title: 'No conflicting relationship pair',
    description: 'Avoid inheritance and composition between the same pair.',
    category: 'uml',
    severity: 'major',
    kind: 'recommended',
    weight: 8,
    whyItMatters: 'Conflicting edges confuse the model.',
    howToFix: 'Keep one relationship that matches the real design intent.',
    evaluate: facts => {
      const byPair = new Map<string, Set<string>>()
      for (const e of facts.edges) {
        const key = [e.source, e.target].sort().join('|')
        const set = byPair.get(key) ?? new Set()
        set.add(e.relationshipType)
        byPair.set(key, set)
      }
      const findings = []
      for (const [key, types] of byPair) {
        if (types.has('inheritance') && (types.has('composition') || types.has('aggregation'))) {
          const [a, b] = key.split('|')
          findings.push(
            finding({
              ruleId: 'uml.conflicting-edges',
              status: 'fail',
              severity: 'major',
              category: 'uml',
              title: 'Conflicting relationships',
              message: `${facts.byId[a]?.name} ↔ ${facts.byId[b]?.name} mixes inheritance with ownership.`,
              why: 'Is-a and has-a together usually means the model is undecided.',
              howToFix: 'Choose inheritance or composition/aggregation, not both.',
              affectedElements: [nodeEl(facts.byId[a]), nodeEl(facts.byId[b])].filter(Boolean),
              groupKey: `conflict-${key}`,
              weight: 8,
            }),
          )
        }
      }
      if (!findings.length) {
        return facts.edges.length
          ? [
              passFinding(
                'uml.conflicting-edges',
                'uml',
                'Relationships consistent',
                'No inheritance+ownership conflicts.',
                'Pairs use a coherent relationship style.',
              ),
            ]
          : [naFinding('uml.conflicting-edges', 'uml', 'Relationships consistent', 'No edges.')]
      }
      return findings
    },
  },
]
