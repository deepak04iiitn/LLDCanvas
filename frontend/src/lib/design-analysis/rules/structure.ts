import type { DesignRule } from '../types'
import { finding, naFinding, nodeEl, passFinding } from '../ruleHelpers'

export const structureRules: DesignRule[] = [
  {
    id: 'structure.isolated-types',
    title: 'Types are connected',
    description: 'When multiple types exist, avoid completely isolated ones (except enums/notes).',
    category: 'structure',
    severity: 'minor',
    kind: 'recommended',
    weight: 3,
    whyItMatters: 'Floating types often mean missing relationships.',
    howToFix: 'Add associations/dependencies that show how the type is used.',
    evaluate: facts => {
      if (facts.typeNodes.length < 2) {
        return [naFinding('structure.isolated-types', 'structure', 'Connected types', 'Need 2+ types.')]
      }
      const isolated = facts.typeNodes.filter(n => {
        if (n.nodeType === 'enum') return false
        return (facts.inDegree[n.id] ?? 0) + (facts.outDegree[n.id] ?? 0) === 0
      })
      // Zero edges between types = unfinished collaboration, not a soft smell
      if (facts.edges.length === 0 && isolated.length >= 2) {
        return [
          finding({
            ruleId: 'structure.isolated-types',
            status: 'fail',
            severity: 'major',
            category: 'structure',
            title: 'No relationships',
            message: `${facts.typeNodes.length} types with zero edges — nothing collaborates.`,
            why: 'A design without relationships is a list of names, not a model.',
            howToFix: 'Add association, dependency, inheritance, or realization edges.',
            affectedElements: isolated.slice(0, 6).map(nodeEl),
            groupKey: 'iso-none',
            weight: 14,
          }),
        ]
      }
      if (!isolated.length) {
        return [
          passFinding(
            'structure.isolated-types',
            'structure',
            'Types connected',
            'No stranded classifiers.',
            'Relationships stitch the design together.',
          ),
        ]
      }
      return isolated.slice(0, 6).map(n =>
        finding({
          ruleId: 'structure.isolated-types',
          status: 'warn',
          severity: 'minor',
          category: 'structure',
          title: 'Isolated type',
          message: `${n.name} has no relationships.`,
          why: 'Interviewers ask how this type collaborates.',
          howToFix: 'Wire it with association, dependency, or realization.',
          affectedElements: [nodeEl(n)],
          groupKey: `iso-${n.id}`,
          weight: 3,
        }),
      )
    },
  },
  {
    id: 'structure.hollow-types',
    title: 'Types declare members',
    description: 'Classes/interfaces with no attributes or methods are unfinished shells.',
    category: 'structure',
    severity: 'major',
    kind: 'mandatory',
    weight: 12,
    whyItMatters: 'Empty boxes do not communicate responsibilities.',
    howToFix: 'Add attributes and/or methods that express the type’s role.',
    evaluate: facts => {
      const hollow = facts.typeNodes.filter(n => n.isEmpty && n.nodeType !== 'enum')
      if (!facts.typeNodes.length) {
        return [naFinding('structure.hollow-types', 'structure', 'Members', 'No types.')]
      }
      if (!hollow.length) {
        return [
          passFinding(
            'structure.hollow-types',
            'structure',
            'Types have members',
            'Classifiers declare attributes or methods.',
            'Responsibilities are visible on the canvas.',
          ),
        ]
      }
      return hollow.map(n =>
        finding({
          ruleId: 'structure.hollow-types',
          status: 'fail',
          severity: 'major',
          category: 'structure',
          title: 'Empty type',
          message: `${n.name} has no attributes or methods.`,
          why: 'Shell types score poorly in LLD interviews.',
          howToFix: 'Add the key fields and operations for this type.',
          affectedElements: [nodeEl(n)],
          groupKey: `hollow-${n.id}`,
          weight: 12,
        }),
      )
    },
  },
  {
    id: 'structure.god-class',
    title: 'No god classes',
    description: 'A type with a huge API surface likely mixes responsibilities.',
    category: 'structure',
    severity: 'major',
    kind: 'recommended',
    weight: 10,
    whyItMatters: 'God classes are hard to test and change.',
    howToFix: 'Split by responsibility into collaborating types.',
    evaluate: facts => {
      // Empty shells are not "healthy APIs" — judged by hollow-types instead
      const evaluable = facts.typeNodes.filter(
        n => n.nodeType !== 'interface' && (n.methodCount > 0 || n.attributeCount > 0),
      )
      if (!evaluable.length) {
        return [naFinding('structure.god-class', 'structure', 'No god classes', 'No populated types to size-check.')]
      }
      const gods = evaluable.filter(n => n.methodCount >= 8 || n.attributeCount >= 10)
      if (!gods.length) {
        return [
          passFinding(
            'structure.god-class',
            'structure',
            'No god classes',
            'Type surfaces stay manageable.',
            'Keeps change radius small.',
          ),
        ]
      }
      return gods.map(n =>
        finding({
          ruleId: 'structure.god-class',
          status: n.methodCount >= 12 || n.attributeCount >= 14 ? 'fail' : 'warn',
          severity: n.methodCount >= 12 || n.attributeCount >= 14 ? 'major' : 'minor',
          category: 'structure',
          title: 'Oversized type',
          message: `${n.name} has ${n.methodCount} methods and ${n.attributeCount} attributes.`,
          why: 'Likely SRP pressure and high regression risk.',
          howToFix: 'Extract collaborators (policies, repositories, value objects).',
          affectedElements: [nodeEl(n)],
          groupKey: `god-${n.id}`,
          weight: 10,
        }),
      )
    },
  },
  {
    id: 'structure.anemic',
    title: 'Avoid anemic domain blobs',
    description: 'Classes with many attributes and no methods are often incomplete.',
    category: 'structure',
    severity: 'minor',
    kind: 'recommended',
    weight: 4,
    whyItMatters: 'Behavior belongs with data when modeling domain entities.',
    howToFix: 'Add meaningful methods or mark as a DTO/stereotype if intentional.',
    evaluate: facts => {
      const peersHaveBehavior = facts.concretes.some(n => n.methodCount > 0)
      if (!peersHaveBehavior || facts.concretes.length < 2) {
        return [naFinding('structure.anemic', 'structure', 'Anemic check', 'Not enough behavioral context.')]
      }
      const anemic = facts.concretes.filter(
        n => n.attributeCount >= 3 && n.methodCount === 0 && n.nodeType === 'class',
      )
      if (!anemic.length) {
        return [
          passFinding(
            'structure.anemic',
            'structure',
            'Behavior present',
            'Classes are not pure data bags.',
            'Domain logic has a place.',
          ),
        ]
      }
      return anemic.map(n =>
        finding({
          ruleId: 'structure.anemic',
          status: 'warn',
          severity: 'minor',
          category: 'structure',
          title: 'Anemic class',
          message: `${n.name} has data but no methods.`,
          why: 'May be a DTO — or missing domain behavior.',
          howToFix: 'Add operations, or stereotype as DTO if intentional.',
          affectedElements: [nodeEl(n)],
          groupKey: `anemic-${n.id}`,
          weight: 4,
        }),
      )
    },
  },
  {
    id: 'structure.hub',
    title: 'Limit hub classes',
    description: 'Very high fan-in/out indicates a bottleneck.',
    category: 'structure',
    severity: 'major',
    kind: 'recommended',
    weight: 8,
    whyItMatters: 'Hubs concentrate change risk.',
    howToFix: 'Introduce facades, mediators, or split the hub.',
    evaluate: facts => {
      if (facts.typeNodes.length < 4) {
        return [naFinding('structure.hub', 'structure', 'Hub check', 'Need a larger graph.')]
      }
      const hubs = facts.typeNodes.filter(n => {
        const deg = (facts.inDegree[n.id] ?? 0) + (facts.outDegree[n.id] ?? 0)
        return deg >= 7
      })
      if (!hubs.length) {
        return [
          passFinding(
            'structure.hub',
            'structure',
            'No extreme hubs',
            'Degrees stay reasonable.',
            'Change impact is distributed.',
          ),
        ]
      }
      return hubs.map(n =>
        finding({
          ruleId: 'structure.hub',
          status: 'warn',
          severity: 'major',
          category: 'structure',
          title: 'High-degree hub',
          message: `${n.name} has degree ${(facts.inDegree[n.id] ?? 0) + (facts.outDegree[n.id] ?? 0)}.`,
          why: 'Many dependents/dependencies → brittle center.',
          howToFix: 'Break apart or hide behind a narrower API.',
          affectedElements: [nodeEl(n)],
          groupKey: `hub-${n.id}`,
          weight: 8,
        }),
      )
    },
  },
  {
    id: 'structure.cycles',
    title: 'Acyclic collaboration',
    description: 'Directed dependency cycles make modules hard to reason about.',
    category: 'structure',
    severity: 'critical',
    kind: 'mandatory',
    weight: 15,
    whyItMatters: 'Cycles couple release and testing order.',
    howToFix: 'Invert a dependency or extract an interface/shared type.',
    evaluate: facts => {
      if (facts.typeNodes.length < 2 || facts.edges.length === 0) {
        return [
          naFinding(
            'structure.cycles',
            'structure',
            'Acyclic',
            facts.edges.length === 0 ? 'No edges to form a cycle.' : 'Too small for cycles.',
          ),
        ]
      }
      if (!facts.cycles.length) {
        return [
          passFinding(
            'structure.cycles',
            'structure',
            'No directed cycles',
            'Collaboration graph is acyclic.',
            'Dependencies can be layered.',
          ),
        ]
      }
      return facts.cycles.slice(0, 3).map((cycle, i) =>
        finding({
          ruleId: 'structure.cycles',
          status: 'fail',
          severity: 'critical',
          category: 'structure',
          title: 'Directed cycle',
          message: `Cycle: ${cycle.map(id => facts.byId[id]?.name ?? id).join(' → ')} → …`,
          why: 'Mutual dependency locks types together.',
          howToFix: 'Break the cycle with an interface or event/callback.',
          affectedElements: cycle.map(id => nodeEl(facts.byId[id])).filter(Boolean),
          groupKey: `cycle-${i}-${cycle.slice().sort().join('-')}`,
          weight: 15,
        }),
      )
    },
  },
  {
    id: 'structure.empty-interface',
    title: 'Interfaces declare members',
    description: 'Empty interfaces rarely justify themselves in LLD interviews.',
    category: 'structure',
    severity: 'minor',
    kind: 'recommended',
    weight: 3,
    whyItMatters: 'Marker interfaces need a story; otherwise they look unfinished.',
    howToFix: 'Add methods or remove the interface until needed.',
    evaluate: facts => {
      if (!facts.interfaces.length) {
        return [naFinding('structure.empty-interface', 'structure', 'Interfaces', 'No interfaces.')]
      }
      const empty = facts.interfaces.filter(n => n.methodCount === 0)
      if (!empty.length) {
        return [
          passFinding(
            'structure.empty-interface',
            'structure',
            'Interfaces have contracts',
            'Interfaces declare methods.',
            'Contracts are explicit.',
          ),
        ]
      }
      return empty.map(n =>
        finding({
          ruleId: 'structure.empty-interface',
          status: 'warn',
          severity: 'minor',
          category: 'structure',
          title: 'Empty interface',
          message: `${n.name} has no methods.`,
          why: 'May be a marker — say so, or flesh out the contract.',
          howToFix: 'Add operations the implementors must provide.',
          affectedElements: [nodeEl(n)],
          groupKey: `empty-iface-${n.id}`,
          weight: 3,
        }),
      )
    },
  },
]
