import type { DiagramLike } from './analyzeDiagram'

export interface BudgetCostTable {
  interface: number
  abstractClass: number
  class: number
  enum: number
  note: number
  association: number
  aggregation: number
  composition: number
  inheritance: number
  realization: number
  dependency: number
  bidirectional: number
  patternStereotype: number
}

export const DEFAULT_BUDGET_COSTS: BudgetCostTable = {
  interface: 3,
  abstractClass: 2,
  class: 1,
  enum: 1,
  note: 0,
  association: 1,
  aggregation: 1,
  composition: 2,
  inheritance: 2,
  realization: 2,
  dependency: 1,
  bidirectional: 2,
  patternStereotype: 2,
}

export interface BudgetLine {
  label: string
  count: number
  unitCost: number
  total: number
}

export interface BudgetResult {
  total: number
  lines: BudgetLine[]
  remaining: number | null
  limit: number | null
}

/**
 * Architecture budget — sum cost of nodes/edges/stereotypes against an optional limit.
 */
export function budgetCalc(
  diagram: DiagramLike,
  costs: Partial<BudgetCostTable> = {},
  limit: number | null = null,
): BudgetResult {
  const c = { ...DEFAULT_BUDGET_COSTS, ...costs }
  const tallies = new Map<string, { count: number; unit: number }>()

  const bump = (key: string, unit: number) => {
    const cur = tallies.get(key) ?? { count: 0, unit }
    cur.count += 1
    tallies.set(key, cur)
  }

  for (const n of diagram.nodes ?? []) {
    const t = n.data?.nodeType ?? 'class'
    if (t === 'interface') bump('Interfaces', c.interface)
    else if (t === 'abstract-class') bump('Abstract classes', c.abstractClass)
    else if (t === 'enum') bump('Enums', c.enum)
    else if (t === 'note') bump('Notes', c.note)
    else bump('Classes', c.class)

    if (n.data?.stereotype) bump('Pattern stereotypes', c.patternStereotype)
  }

  for (const e of diagram.edges ?? []) {
    const r = e.data?.relationshipType ?? 'association'
    const label = r.charAt(0).toUpperCase() + r.slice(1)
    const unit =
      (c as Record<string, number>)[r] ?? c.association
    bump(label, unit)
  }

  const lines: BudgetLine[] = [...tallies.entries()].map(([label, { count, unit }]) => ({
    label,
    count,
    unitCost: unit,
    total: count * unit,
  }))
  lines.sort((a, b) => b.total - a.total)

  const total = lines.reduce((s, l) => s + l.total, 0)
  return {
    total,
    lines,
    limit,
    remaining: limit == null ? null : limit - total,
  }
}
