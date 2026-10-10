import { analyzeDiagram, type GraphNode, type GraphEdge } from './analyze'

export interface CostTable {
  nodeTypeCosts?: Record<string, number>
  relationshipCosts?: Record<string, number>
  defaultNodeCost?: number
  defaultEdgeCost?: number
}

export interface BudgetBreakdownItem {
  id: string
  kind: 'node' | 'edge'
  label: string
  cost: number
}

export interface BudgetResult {
  total: number
  breakdown: BudgetBreakdownItem[]
}

const DEFAULT_TABLE: Required<CostTable> = {
  nodeTypeCosts: {
    class: 10,
    interface: 8,
    'abstract-class': 12,
    enum: 5,
    note: 1,
    package: 3,
  },
  relationshipCosts: {
    association: 2,
    aggregation: 3,
    composition: 4,
    inheritance: 5,
    realization: 4,
    dependency: 2,
    bidirectional: 3,
  },
  defaultNodeCost: 10,
  defaultEdgeCost: 2,
}

/** Estimate architecture budget cost from a cost table + graph. */
export function calcBudget(
  nodes: GraphNode[],
  edges: GraphEdge[],
  table: CostTable = {},
): BudgetResult {
  const t = {
    nodeTypeCosts: { ...DEFAULT_TABLE.nodeTypeCosts, ...table.nodeTypeCosts },
    relationshipCosts: { ...DEFAULT_TABLE.relationshipCosts, ...table.relationshipCosts },
    defaultNodeCost: table.defaultNodeCost ?? DEFAULT_TABLE.defaultNodeCost,
    defaultEdgeCost: table.defaultEdgeCost ?? DEFAULT_TABLE.defaultEdgeCost,
  }

  const breakdown: BudgetBreakdownItem[] = []

  for (const n of nodes) {
    const nodeType = String(n.data?.nodeType ?? 'class')
    const cost = t.nodeTypeCosts[nodeType] ?? t.defaultNodeCost
    breakdown.push({
      id: String(n.id),
      kind: 'node',
      label: String(n.data?.name ?? n.id),
      cost,
    })
  }

  for (const e of edges) {
    const rel = String(e.data?.relationshipType ?? 'dependency')
    const cost = t.relationshipCosts[rel] ?? t.defaultEdgeCost
    breakdown.push({
      id: String(e.id),
      kind: 'edge',
      label: `${e.source} → ${e.target} (${rel})`,
      cost,
    })
  }

  // Soft coupling surcharge from hubs / cycles
  const analysis = analyzeDiagram(nodes, edges)
  const surcharge = analysis.hubs.length * 3 + analysis.cycles.length * 8
  if (surcharge > 0) {
    breakdown.push({
      id: '_surcharge',
      kind: 'edge',
      label: 'Coupling / cycle surcharge',
      cost: surcharge,
    })
  }

  const total = breakdown.reduce((s, b) => s + b.cost, 0)
  return { total, breakdown }
}
