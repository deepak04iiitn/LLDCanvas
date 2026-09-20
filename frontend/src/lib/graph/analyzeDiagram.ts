/** Lightweight node/edge shapes accepted by client graph analysis. */

export interface AnalyzeNode {
  id: string
  elementId?: string
  data?: {
    name?: string
    nodeType?: string
    stereotype?: string
    attributes?: { name: string; type?: string }[]
    methods?: { name: string; returnType?: string }[]
    noteText?: string
    [key: string]: unknown
  }
}

export interface AnalyzeEdge {
  id: string
  elementId?: string
  source: string
  target: string
  data?: {
    relationshipType?: string
    label?: string
    [key: string]: unknown
  }
}

export interface DiagramLike {
  nodes: AnalyzeNode[]
  edges: AnalyzeEdge[]
}

export interface NodeAnalysis {
  elementId: string
  name: string
  nodeType: string
  inDegree: number
  outDegree: number
  inbound: { fromId: string; fromName: string; type: string }[]
  outbound: { toId: string; toName: string; type: string }[]
  responsibilities: string[]
  concerns: string[]
}

export interface DiagramAnalysis {
  nodeCount: number
  edgeCount: number
  hubs: { elementId: string; name: string; degree: number }[]
  cycles: string[][]
  byElementId: Record<string, NodeAnalysis>
}

function eid(n: AnalyzeNode): string {
  return n.elementId ?? n.id
}

function nameOf(n: AnalyzeNode | undefined): string {
  return n?.data?.name ?? n?.id ?? '?'
}

/** Detect simple directed cycles via DFS. */
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

function heuristicConcerns(node: AnalyzeNode, inDeg: number, outDeg: number): string[] {
  const concerns: string[] = []
  const methods = node.data?.methods ?? []
  const attrs = node.data?.attributes ?? []
  const type = node.data?.nodeType ?? 'class'

  if (methods.length >= 8) concerns.push('Large method surface — consider splitting responsibilities')
  if (attrs.length >= 10) concerns.push('Many attributes — possible god class / data blob')
  if (inDeg >= 5) concerns.push('High fan-in — change impact radius is wide')
  if (outDeg >= 6) concerns.push('High fan-out — tightly coupled to many peers')
  if (type === 'class' && methods.length === 0 && attrs.length > 0) {
    concerns.push('Anemic class — data without behavior')
  }
  if (type === 'interface' && methods.length === 0) {
    concerns.push('Empty interface')
  }
  return concerns
}

export function analyzeDiagram(diagram: DiagramLike): DiagramAnalysis {
  const nodes = diagram.nodes ?? []
  const edges = diagram.edges ?? []
  const byId = new Map(nodes.map(n => [n.id, n]))

  const adj = new Map<string, string[]>()
  const inMap = new Map<string, { fromId: string; fromName: string; type: string }[]>()
  const outMap = new Map<string, { toId: string; toName: string; type: string }[]>()

  for (const n of nodes) {
    const id = eid(n)
    adj.set(id, [])
    inMap.set(id, [])
    outMap.set(id, [])
  }

  for (const e of edges) {
    const srcNode = byId.get(e.source)
    const tgtNode = byId.get(e.target)
    if (!srcNode || !tgtNode) continue
    const s = eid(srcNode)
    const t = eid(tgtNode)
    const rel = e.data?.relationshipType ?? 'association'
    adj.get(s)?.push(t)
    outMap.get(s)?.push({ toId: t, toName: nameOf(tgtNode), type: rel })
    inMap.get(t)?.push({ fromId: s, fromName: nameOf(srcNode), type: rel })
  }

  const byElementId: Record<string, NodeAnalysis> = {}
  const hubs: DiagramAnalysis['hubs'] = []

  for (const n of nodes) {
    const id = eid(n)
    const inbound = inMap.get(id) ?? []
    const outbound = outMap.get(id) ?? []
    const responsibilities = [
      ...(n.data?.methods ?? []).map(m => `${m.name}(): ${m.returnType ?? 'void'}`),
      ...(n.data?.noteText ? [n.data.noteText] : []),
    ]
    const analysis: NodeAnalysis = {
      elementId: id,
      name: nameOf(n),
      nodeType: n.data?.nodeType ?? 'class',
      inDegree: inbound.length,
      outDegree: outbound.length,
      inbound,
      outbound,
      responsibilities,
      concerns: heuristicConcerns(n, inbound.length, outbound.length),
    }
    byElementId[id] = analysis
    hubs.push({ elementId: id, name: analysis.name, degree: inbound.length + outbound.length })
  }

  hubs.sort((a, b) => b.degree - a.degree)

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    hubs: hubs.slice(0, 10),
    cycles: findCycles(adj),
    byElementId,
  }
}

export function getNodeAnalysis(
  diagram: DiagramLike,
  selectedNodeId: string | null | undefined,
): NodeAnalysis | null {
  if (!selectedNodeId) return null
  const analysis = analyzeDiagram(diagram)
  const node = diagram.nodes.find(n => n.id === selectedNodeId || eid(n) === selectedNodeId)
  if (!node) return null
  return analysis.byElementId[eid(node)] ?? null
}
