/** Helpers for reading challenge diagram snapshots. */

export interface DiagramElementCard {
  elementId: string
  kind: 'node' | 'edge'
  label: string
  subtitle?: string
}

type LooseNode = {
  id?: string
  elementId?: string
  data?: {
    elementId?: string
    name?: string
    nodeType?: string
    [key: string]: unknown
  }
}

type LooseEdge = {
  id?: string
  source?: string
  target?: string
  data?: {
    elementId?: string
    relationshipType?: string
    label?: string
    [key: string]: unknown
  }
}

export function extractElements(
  snapshot: { nodes?: unknown[]; edges?: unknown[] } | null | undefined,
): DiagramElementCard[] {
  const nodes = (snapshot?.nodes ?? []) as LooseNode[]
  const edges = (snapshot?.edges ?? []) as LooseEdge[]
  const byId = new Map(nodes.map(n => [n.id, n]))

  const cards: DiagramElementCard[] = []

  for (const n of nodes) {
    const elementId = String(n.data?.elementId ?? n.elementId ?? n.id ?? '')
    if (!elementId) continue
    cards.push({
      elementId,
      kind: 'node',
      label: String(n.data?.name ?? elementId),
      subtitle: n.data?.nodeType ? String(n.data.nodeType) : 'class',
    })
  }

  for (const e of edges) {
    const elementId = String(e.data?.elementId ?? e.id ?? '')
    if (!elementId) continue
    const src = byId.get(e.source)?.data?.name ?? e.source ?? '?'
    const tgt = byId.get(e.target)?.data?.name ?? e.target ?? '?'
    const rel = e.data?.relationshipType ?? e.data?.label ?? 'edge'
    cards.push({
      elementId,
      kind: 'edge',
      label: `${src} → ${tgt}`,
      subtitle: String(rel),
    })
  }

  return cards
}

export function cloneDiagramData(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object') {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>
  }
  return { version: 1, nodes: [], edges: [], meta: { theme: 'light', zoom: 1, panX: 0, panY: 0 } }
}
