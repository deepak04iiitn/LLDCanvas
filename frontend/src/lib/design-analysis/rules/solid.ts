import type { DesignRule } from '../types'
import { finding, naFinding, nodeEl, passFinding } from '../ruleHelpers'

/** Heuristic SOLID — mostly warn/na; fail only with strong evidence */
export const solidRules: DesignRule[] = [
  {
    id: 'solid.srp',
    title: 'Single Responsibility (heuristic)',
    description: 'Very large public APIs suggest mixed responsibilities.',
    category: 'solid',
    severity: 'major',
    kind: 'recommended',
    weight: 8,
    whyItMatters: 'SRP keeps types focused and testable.',
    howToFix: 'Split the type by reason-to-change.',
    evaluate: facts => {
      const withApi = facts.concretes.filter(n => n.publicMethodCount > 0)
      if (!withApi.length) {
        return [
          naFinding(
            'solid.srp',
            'solid',
            'SRP',
            facts.concretes.length ? 'No methods yet — cannot judge SRP.' : 'No concrete types.',
          ),
        ]
      }
      const suspects = withApi.filter(n => n.publicMethodCount >= 10)
      if (!suspects.length) {
        return [
          passFinding(
            'solid.srp',
            'solid',
            'SRP looks healthy',
            'No extreme public API surfaces.',
            'Heuristic only — not a compiler.',
          ),
        ]
      }
      return suspects.map(n =>
        finding({
          ruleId: 'solid.srp',
          status: n.publicMethodCount >= 14 ? 'fail' : 'warn',
          severity: 'major',
          category: 'solid',
          title: 'Possible SRP violation',
          message: `${n.name} exposes ${n.publicMethodCount} public methods.`,
          why: 'Many public operations often mean multiple reasons to change.',
          howToFix: 'Extract cohesive collaborators.',
          affectedElements: [nodeEl(n)],
          groupKey: `srp-${n.id}`,
          weight: 8,
        }),
      )
    },
  },
  {
    id: 'solid.isp',
    title: 'Interface Segregation (heuristic)',
    description: 'Fat interfaces force unused methods on implementors.',
    category: 'solid',
    severity: 'minor',
    kind: 'recommended',
    weight: 4,
    whyItMatters: 'Clients should not depend on methods they do not use.',
    howToFix: 'Split into role interfaces.',
    evaluate: facts => {
      const fat = facts.interfaces.filter(n => n.methodCount >= 8)
      if (!fat.length) {
        return facts.interfaces.length
          ? [
              passFinding(
                'solid.isp',
                'solid',
                'Interfaces stay lean',
                'No oversized interface contracts.',
                'Heuristic ISP check.',
              ),
            ]
          : [naFinding('solid.isp', 'solid', 'ISP', 'No interfaces.')]
      }
      return fat.map(n =>
        finding({
          ruleId: 'solid.isp',
          status: 'warn',
          severity: 'minor',
          category: 'solid',
          title: 'Fat interface',
          message: `${n.name} declares ${n.methodCount} methods.`,
          why: 'Implementors may be forced into unused members.',
          howToFix: 'Segregate by client role.',
          affectedElements: [nodeEl(n)],
          groupKey: `isp-${n.id}`,
          weight: 4,
        }),
      )
    },
  },
  {
    id: 'solid.dip',
    title: 'Dependency Inversion (heuristic)',
    description: 'When interfaces exist, high-level modules should not cling only to concretes.',
    category: 'solid',
    severity: 'major',
    kind: 'recommended',
    weight: 8,
    whyItMatters: 'DIP enables substitution and testing.',
    howToFix: 'Introduce/use interfaces at boundaries.',
    evaluate: facts => {
      if (facts.interfaces.length === 0) {
        return [
          naFinding(
            'solid.dip',
            'solid',
            'DIP',
            'No interfaces yet — not penalized. Add only if a boundary needs one.',
          ),
        ]
      }
      const concreteDeps = facts.edges.filter(e => {
        if (!['dependency', 'association'].includes(e.relationshipType)) return false
        const t = facts.byId[e.target]
        return t && (t.nodeType === 'class' || t.nodeType === 'abstract-class')
      })
      const ifaceDeps = facts.edges.filter(e => {
        if (!['dependency', 'association'].includes(e.relationshipType)) return false
        return facts.byId[e.target]?.nodeType === 'interface'
      })
      if (concreteDeps.length >= 4 && ifaceDeps.length === 0) {
        return [
          finding({
            ruleId: 'solid.dip',
            status: 'warn',
            severity: 'major',
            category: 'solid',
            title: 'Dependencies skip abstractions',
            message: `${concreteDeps.length} deps to concretes, 0 to interfaces (interfaces exist).`,
            why: 'You introduced abstractions but clients ignore them.',
            howToFix: 'Retarget key dependencies to interfaces.',
            affectedElements: concreteDeps.slice(0, 4).map(e => ({
              id: e.id,
              kind: 'edge' as const,
              label: e.relationshipType,
            })),
            groupKey: 'dip-skip',
            weight: 8,
          }),
        ]
      }
      return [
        passFinding(
          'solid.dip',
          'solid',
          'DIP posture OK',
          'Abstractions dependencies look plausible.',
          'Heuristic — not absolute.',
        ),
      ]
    },
  },
  {
    id: 'solid.ocp',
    title: 'Open/Closed (heuristic)',
    description: 'Many sibling concretes under one parent without strategy/hooks.',
    category: 'solid',
    severity: 'info',
    kind: 'optional',
    weight: 2,
    whyItMatters: 'OCP prefers extension over edit storms.',
    howToFix: 'Introduce a strategy/policy interface for varying behavior.',
    evaluate: facts => {
      const parents = Object.entries(facts.inheritanceChildren).filter(([, kids]) => kids.length >= 3)
      if (!parents.length) {
        return [naFinding('solid.ocp', 'solid', 'OCP', 'No wide inheritance fan-out.')]
      }
      return parents.slice(0, 2).map(([pid, kids]) =>
        finding({
          ruleId: 'solid.ocp',
          status: 'warn',
          severity: 'info',
          category: 'solid',
          title: 'Wide inheritance fan-out',
          message: `${facts.byId[pid]?.name ?? pid} has ${kids.length} subclasses.`,
          why: 'New variants may require editing the hierarchy repeatedly.',
          howToFix: 'Consider strategy/composition for varying behavior.',
          affectedElements: [nodeEl(facts.byId[pid]), ...kids.slice(0, 3).map(id => nodeEl(facts.byId[id]))],
          groupKey: `ocp-${pid}`,
          weight: 2,
        }),
      )
    },
  },
]
