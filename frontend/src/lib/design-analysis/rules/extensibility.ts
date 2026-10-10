import type { DesignRule } from '../types'
import { finding, naFinding, nodeEl, passFinding } from '../ruleHelpers'

export const extensibilityRules: DesignRule[] = [
  {
    id: 'ext.has-abstraction',
    title: 'Extension points when variants appear',
    description: 'Multiple similar concretes benefit from a shared abstraction.',
    category: 'extensibility',
    severity: 'minor',
    kind: 'recommended',
    weight: 4,
    whyItMatters: 'Makes adding a new variant cheaper.',
    howToFix: 'Extract interface/abstract class shared by variants.',
    evaluate: facts => {
      // Name-prefix clusters: PaymentCard, PaymentWallet, PaymentUpi
      const concretes = facts.concretes.filter(n => n.nodeType === 'class')
      if (concretes.length < 3) {
        return [
          naFinding(
            'ext.has-abstraction',
            'extensibility',
            'Extension points',
            'Need several concretes before judging variants.',
          ),
        ]
      }
      const prefixes = new Map<string, typeof concretes>()
      for (const n of concretes) {
        const m = n.name.match(/^([A-Z][a-z]+)[A-Z]/)
        const prefix = m?.[1]
        if (!prefix || prefix.length < 3) continue
        prefixes.set(prefix, [...(prefixes.get(prefix) ?? []), n])
      }
      const clusters = [...prefixes.entries()].filter(([, g]) => g.length >= 3)
      if (!clusters.length) {
        return [
          passFinding(
            'ext.has-abstraction',
            'extensibility',
            'No obvious variant cluster',
            'No naming cluster suggesting missing abstraction.',
            'Heuristic only.',
          ),
        ]
      }
      return clusters.slice(0, 2).map(([prefix, g]) => {
        const hasAbs = g.some(n =>
          (facts.inheritanceParents[n.id] ?? []).some(pid => {
            const p = facts.byId[pid]
            return p && (p.nodeType === 'interface' || p.nodeType === 'abstract-class')
          }) ||
          facts.realizations.some(r => r.classId === n.id),
        )
        if (hasAbs) {
          return passFinding(
            'ext.has-abstraction',
            'extensibility',
            `${prefix}* variants abstracted`,
            `Cluster ${prefix}* already shares an abstraction.`,
            'Good extensibility posture.',
          )
        }
        return finding({
          ruleId: 'ext.has-abstraction',
          status: 'warn',
          severity: 'minor',
          category: 'extensibility',
          title: 'Variant cluster without abstraction',
          message: `${g.length} types look like ${prefix}* variants without a shared interface/abstract.`,
          why: 'Next variant may require copy-paste.',
          howToFix: `Introduce ${prefix} (interface/abstract) and realize/extend it.`,
          affectedElements: g.slice(0, 4).map(nodeEl),
          groupKey: `ext-${prefix}`,
          weight: 4,
        })
      })
    },
  },
  {
    id: 'ext.realization-used',
    title: 'Interfaces are realized',
    description: 'An interface with no implementors is unfinished.',
    category: 'extensibility',
    severity: 'minor',
    kind: 'recommended',
    weight: 3,
    whyItMatters: 'Contracts need at least one realization to prove usefulness.',
    howToFix: 'Add a class that realizes the interface, or remove it for now.',
    evaluate: facts => {
      if (!facts.interfaces.length) {
        return [naFinding('ext.realization-used', 'extensibility', 'Realizations', 'No interfaces.')]
      }
      const unused = facts.interfaces.filter(
        iface => !facts.realizations.some(r => r.interfaceId === iface.id),
      )
      if (!unused.length) {
        return [
          passFinding(
            'ext.realization-used',
            'extensibility',
            'Interfaces realized',
            'Every interface has an implementor.',
            'Contracts are grounded.',
          ),
        ]
      }
      return unused.map(n =>
        finding({
          ruleId: 'ext.realization-used',
          status: 'warn',
          severity: 'minor',
          category: 'extensibility',
          title: 'Unused interface',
          message: `${n.name} has no realization.`,
          why: 'May be speculative abstraction.',
          howToFix: 'Realize it from a class, or defer the interface.',
          affectedElements: [nodeEl(n)],
          groupKey: `unreal-${n.id}`,
          weight: 3,
        }),
      )
    },
  },
]
