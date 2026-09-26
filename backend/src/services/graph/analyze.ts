/** Shared diagram graph analysis — used by Microscope, Dep Web, Score, Budget. */

export type GraphNode = { id: string; data?: { name?: string; nodeType?: string; methods?: unknown[]; attributes?: unknown[]; noteText?: string; elementId?: string }; [k: string]: unknown }
export type GraphEdge = { id: string; source: string; target: string; data?: { relationshipType?: string; elementId?: string }; [k: string]: unknown }

export interface NodeAnalysis {
  id: string
  name: string
  nodeType: string
  outDegree: number
  inDegree: number
  dependsOn: string[]
  usedBy: string[]
  methodCount: number
  attributeCount: number
  concerns: string[]
}

export interface DiagramAnalysis {
  nodes: Record<string, NodeAnalysis>
  cycles: string[][]
  hubs: string[]
  edgeCount: number
  nodeCount: number
}

function nodeId(n: GraphNode): string {
  return String(n.id)
}

export function analyzeDiagram(nodes: GraphNode[], edges: GraphEdge[]): DiagramAnalysis {
  const byId: Record<string, NodeAnalysis> = {}
  for (const n of nodes) {
    const id = nodeId(n)
    const data = n.data ?? {}
    byId[id] = {
      id,
      name: String(data.name ?? id),
      nodeType: String(data.nodeType ?? 'class'),
      outDegree: 0,
      inDegree: 0,
      dependsOn: [],
      usedBy: [],
      methodCount: Array.isArray(data.methods) ? data.methods.length : 0,
      attributeCount: Array.isArray(data.attributes) ? data.attributes.length : 0,
      concerns: [],
    }
  }

  for (const e of edges) {
    const s = String(e.source)
    const t = String(e.target)
    if (!byId[s] || !byId[t]) continue
    byId[s].outDegree++
    byId[t].inDegree++
    byId[s].dependsOn.push(t)
    byId[t].usedBy.push(s)
  }

  for (const n of Object.values(byId)) {
    if (n.methodCount + n.attributeCount >= 12) n.concerns.push('High number of responsibilities')
    if (n.outDegree >= 6) n.concerns.push('High outgoing coupling')
    if (n.inDegree >= 6) n.concerns.push('Hub / highly depended-on')
    if (n.nodeType === 'class' && n.outDegree === 0 && n.inDegree === 0 && nodes.length > 1) {
      n.concerns.push('Isolated from the rest of the design')
    }
  }

  const cycles = findCycles(byId)
  const hubs = Object.values(byId)
    .filter(n => n.inDegree + n.outDegree >= 5)
    .sort((a, b) => b.inDegree + b.outDegree - (a.inDegree + a.outDegree))
    .map(n => n.id)

  return {
    nodes: byId,
    cycles,
    hubs,
    edgeCount: edges.length,
    nodeCount: nodes.length,
  }
}

function findCycles(byId: Record<string, NodeAnalysis>): string[][] {
  const cycles: string[][] = []
  const visited = new Set<string>()
  const stack = new Set<string>()
  const path: string[] = []

  function dfs(id: string) {
    if (stack.has(id)) {
      const i = path.indexOf(id)
      if (i >= 0) cycles.push(path.slice(i).concat(id))
      return
    }
    if (visited.has(id)) return
    visited.add(id)
    stack.add(id)
    path.push(id)
    for (const next of byId[id]?.dependsOn ?? []) dfs(next)
    path.pop()
    stack.delete(id)
  }

  for (const id of Object.keys(byId)) dfs(id)
  return cycles.slice(0, 20)
}
