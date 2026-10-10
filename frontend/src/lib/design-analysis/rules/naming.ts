import type { DesignRule } from '../types'
import { finding, isPascalCase, naFinding, nodeEl, passFinding } from '../ruleHelpers'

export const namingRules: DesignRule[] = [
  {
    id: 'naming.non-empty',
    title: 'Types are named',
    description: 'Every classifier needs a non-empty name.',
    category: 'naming',
    severity: 'critical',
    kind: 'mandatory',
    weight: 12,
    whyItMatters: 'Unnamed types cannot be discussed or implemented.',
    howToFix: 'Double-click the node and give it a PascalCase name.',
    evaluate: facts => {
      if (!facts.typeNodes.length) {
        return [naFinding('naming.non-empty', 'naming', 'Types named', 'No types.')]
      }
      // Default editor labels + generic stubs — not domain names
      const PLACEHOLDER =
        /^(ClassName|InterfaceName|EnumName|AbstractClass|AbstractClassName|NewClass|NewInterface|NewEnum|Untitled|class)$/i
      const hits = facts.typeNodes.filter(n => {
        const name = n.name.trim()
        return !name || name === n.id || PLACEHOLDER.test(name) || /^new\s/i.test(name)
      })
      if (!hits.length) {
        return [
          passFinding(
            'naming.non-empty',
            'naming',
            'Types named',
            'All types have domain names.',
            'Names are the vocabulary of the design.',
          ),
        ]
      }
      return hits.map(n =>
        finding({
          ruleId: 'naming.non-empty',
          status: 'fail',
          severity: 'critical',
          category: 'naming',
          title: 'Missing / placeholder name',
          message: `Type "${n.name || n.id}" needs a real name.`,
          why: 'Placeholders hide intent.',
          howToFix: 'Rename to a domain term (PascalCase).',
          affectedElements: [nodeEl(n)],
          groupKey: `name-${n.id}`,
          weight: 12,
        }),
      )
    },
  },
  {
    id: 'naming.pascal-case',
    title: 'PascalCase type names',
    description: 'Classifier names should be PascalCase identifiers.',
    category: 'naming',
    severity: 'minor',
    kind: 'recommended',
    weight: 3,
    whyItMatters: 'Matches common OOP language conventions.',
    howToFix: 'Rename to PascalCase without spaces.',
    evaluate: facts => {
      if (!facts.typeNodes.length) {
        return [naFinding('naming.pascal-case', 'naming', 'PascalCase', 'No types.')]
      }
      const bad = facts.typeNodes.filter(n => n.name.trim() && !isPascalCase(n.name.trim()))
      if (!bad.length) {
        return [
          passFinding(
            'naming.pascal-case',
            'naming',
            'PascalCase names',
            'Type names look conventional.',
            'Readable in code generation / interviews.',
          ),
        ]
      }
      return bad.map(n =>
        finding({
          ruleId: 'naming.pascal-case',
          status: 'warn',
          severity: 'minor',
          category: 'naming',
          title: 'Non-PascalCase name',
          message: `"${n.name}" should be PascalCase.`,
          why: 'Interviewers expect ClassName style.',
          howToFix: 'e.g. payment_service → PaymentService.',
          affectedElements: [nodeEl(n)],
          groupKey: `pascal-${n.id}`,
          weight: 3,
        }),
      )
    },
  },
  {
    id: 'naming.notes-only',
    title: 'Design is more than notes',
    description: 'A diagram made only of notes is not a structural design.',
    category: 'naming',
    severity: 'major',
    kind: 'mandatory',
    weight: 10,
    whyItMatters: 'Notes annotate structure; they do not replace it.',
    howToFix: 'Add classes/interfaces for the core model.',
    evaluate: facts => {
      if (facts.typeNodes.length > 0) {
        return [
          passFinding(
            'naming.notes-only',
            'naming',
            'Structural types present',
            'Design includes classifiers, not only notes.',
            'Notes can annotate freely.',
          ),
        ]
      }
      if (facts.noteNodes.length === 0) {
        return [naFinding('naming.notes-only', 'naming', 'Notes-only', 'Empty canvas handled elsewhere.')]
      }
      return [
        finding({
          ruleId: 'naming.notes-only',
          status: 'fail',
          severity: 'major',
          category: 'naming',
          title: 'Notes without structure',
          message: 'Only sticky notes — no classes/interfaces.',
          why: 'Cannot evaluate OO design from notes alone.',
          howToFix: 'Model types and relationships; keep notes as commentary.',
          affectedElements: facts.noteNodes.slice(0, 3).map(nodeEl),
          groupKey: 'notes-only',
          weight: 10,
        }),
      ]
    },
  },
  {
    id: 'naming.duplicate-names',
    title: 'Unique type names',
    description: 'Two types with the same name confuse the model.',
    category: 'naming',
    severity: 'major',
    kind: 'mandatory',
    weight: 8,
    whyItMatters: 'Ambiguous vocabulary.',
    howToFix: 'Rename one type or merge duplicates.',
    evaluate: facts => {
      const map = new Map<string, typeof facts.typeNodes>()
      for (const n of facts.typeNodes) {
        const key = n.name.trim().toLowerCase()
        if (!key) continue
        map.set(key, [...(map.get(key) ?? []), n])
      }
      const dups = [...map.values()].filter(g => g.length > 1)
      if (!dups.length) {
        return facts.typeNodes.length
          ? [
              passFinding(
                'naming.duplicate-names',
                'naming',
                'Unique names',
                'No duplicate type names.',
                'Vocabulary is clear.',
              ),
            ]
          : [naFinding('naming.duplicate-names', 'naming', 'Unique names', 'No types.')]
      }
      return dups.map(g =>
        finding({
          ruleId: 'naming.duplicate-names',
          status: 'fail',
          severity: 'major',
          category: 'naming',
          title: 'Duplicate name',
          message: `"${g[0].name}" used ${g.length} times.`,
          why: 'Readers cannot tell which type you mean.',
          howToFix: 'Differentiate names by role/package.',
          affectedElements: g.map(nodeEl),
          groupKey: `dup-${g[0].name.toLowerCase()}`,
          weight: 8,
        }),
      )
    },
  },
]
