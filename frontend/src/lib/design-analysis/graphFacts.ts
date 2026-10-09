import type { DiagramInput, FactEdge, FactNode, GraphFacts } from './types'

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function findCycles(adj: Map<string, string[]>): string[][] {
  const cycles: string[][] = []
  const color = new Map<string, 0 | 1 | 2>()
  const stack: string[] = []

  function dfs(u: string) {
    color.set(u, 1)
    stack.push(u)
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? 0
      if (c === 0) dfs(v)
      else if (c === 1) {
        const idx = stack.indexOf(v)
        if (idx >= 0) cycles.push(stack.slice(idx))
      }
    }
    stack.pop()
    color.set(u, 2)
  }

  for (const u of adj.keys()) {
    if ((color.get(u) ?? 0) === 0) dfs(u)
  }
  return cycles
}

function parseNode(raw: unknown): FactNode | null {
  const n = asRecord(raw)
  const id = str(n.id)
  if (!id) return null
  const data = asRecord(n.data)
  const attrs = arr(data.attributes)
  const methods = arr(data.methods)
  const nodeType = str(data.nodeType, 'class')
  const name = str(data.name, id)
  const publicMethodCount = methods.filter(m => {
    const md = asRecord(m)
    return str(md.visibility, '+') === '+'
  }).length

  return {
    id,
    name,
    nodeType,
    stereotype: str(data.stereotype) || undefined,
    packageName: str(data.packageName) || undefined,
    attributeCount: attrs.length,
    methodCount: methods.length,
    publicMethodCount,
    isEmpty:
      nodeType !== 'note' &&
      attrs.length === 0 &&
      methods.length === 0 &&
      !str(data.noteText),
    noteText: str(data.noteText) || undefined,
  }
}

function parseEdge(raw: unknown): FactEdge | null {
  const e = asRecord(raw)
  const id = str(e.id)
  const source = str(e.source)
  const target = str(e.target)
  if (!id || !source || !target) return null
  const data = asRecord(e.data)
  const typeFromRf = str(e.type)
  return {
    id,
    source,
    target,
    relationshipType: str(data.relationshipType, typeFromRf || 'association'),
    sourceMultiplicity: str(data.sourceMultiplicity) || undefined,
    targetMultiplicity: str(data.targetMultiplicity) || undefined,
    label: str(data.label) || undefined,
  }
}

export function buildGraphFacts(diagram: DiagramInput, revisionId: string): GraphFacts {
  const nodes = (diagram.nodes ?? []).map(parseNode).filter((n): n is FactNode => !!n)
  const edges = (diagram.edges ?? [])
    .map(parseEdge)
    .filter((e): e is FactEdge => !!e)
    .filter(e => nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target))

  const byId: Record<string, FactNode> = {}
  for (const n of nodes) byId[n.id] = n

  const typeNodes = nodes.filter(n => n.nodeType !== 'note')
  const noteNodes = nodes.filter(n => n.nodeType === 'note')
  const interfaces = typeNodes.filter(n => n.nodeType === 'interface')
  const concretes = typeNodes.filter(n => n.nodeType === 'class' || n.nodeType === 'abstract-class')

  const inDegree: Record<string, number> = {}
  const outDegree: Record<string, number> = {}
  const inbound: Record<string, FactEdge[]> = {}
  const outbound: Record<string, FactEdge[]> = {}
  const adj = new Map<string, string[]>()

  for (const n of typeNodes) {
    inDegree[n.id] = 0
    outDegree[n.id] = 0
    inbound[n.id] = []
    outbound[n.id] = []
    adj.set(n.id, [])
  }

  for (const e of edges) {
    if (!byId[e.source] || !byId[e.target]) continue
    if (byId[e.source].nodeType === 'note' || byId[e.target].nodeType === 'note') continue
    outDegree[e.source] = (outDegree[e.source] ?? 0) + 1
    inDegree[e.target] = (inDegree[e.target] ?? 0) + 1
    outbound[e.source] = [...(outbound[e.source] ?? []), e]
    inbound[e.target] = [...(inbound[e.target] ?? []), e]
    adj.get(e.source)?.push(e.target)
  }

  const inheritanceChildren: Record<string, string[]> = {}
  const inheritanceParents: Record<string, string[]> = {}
  const realizations: GraphFacts['realizations'] = []

  for (const e of edges) {
    if (e.relationshipType === 'inheritance') {
      inheritanceChildren[e.target] = [...(inheritanceChildren[e.target] ?? []), e.source]
      inheritanceParents[e.source] = [...(inheritanceParents[e.source] ?? []), e.target]
    }
    if (e.relationshipType === 'realization') {
      realizations.push({ classId: e.source, interfaceId: e.target, edgeId: e.id })
    }
  }

  return {
    revisionId,
    nodes,
    edges,
    typeNodes,
    noteNodes,
    byId,
    inDegree,
    outDegree,
    inbound,
    outbound,
    cycles: findCycles(adj),
    inheritanceChildren,
    inheritanceParents,
    realizations,
    interfaces,
    concretes,
  }
}
