/** Semantic UML diff by stable element id — ignores pure layout (x/y) changes. */

export type DiffKind = 'added' | 'removed' | 'modified'

export interface DiffEntry {
  kind: DiffKind
  entity: 'node' | 'edge'
  id: string
  name?: string
  detail?: string
}

function stableId(item: { id?: string; data?: { elementId?: string; name?: string } }): string {
  return String(item.data?.elementId || item.id || '')
}

function nodeSignature(n: { data?: Record<string, unknown> }): string {
  const d = n.data ?? {}
  return JSON.stringify({
    name: d.name,
    nodeType: d.nodeType,
    attributes: d.attributes,
    methods: d.methods,
    stereotype: d.stereotype,
    noteText: d.noteText,
  })
}

function edgeSignature(e: { source?: string; target?: string; data?: Record<string, unknown> }): string {
  const d = e.data ?? {}
  return JSON.stringify({
    source: e.source,
    target: e.target,
    relationshipType: d.relationshipType,
    label: d.label,
    sourceMultiplicity: d.sourceMultiplicity,
    targetMultiplicity: d.targetMultiplicity,
  })
}

export function structuralDiff(
  before: { nodes?: unknown[]; edges?: unknown[] },
  after: { nodes?: unknown[]; edges?: unknown[] },
): DiffEntry[] {
  const entries: DiffEntry[] = []

  const bNodes = new Map<string, { id: string; data?: Record<string, unknown> }>()
  const aNodes = new Map<string, { id: string; data?: Record<string, unknown> }>()
  for (const n of (before.nodes ?? []) as { id: string; data?: Record<string, unknown> }[]) {
    bNodes.set(stableId(n), n)
  }
  for (const n of (after.nodes ?? []) as { id: string; data?: Record<string, unknown> }[]) {
    aNodes.set(stableId(n), n)
  }

  for (const [id, n] of aNodes) {
    if (!bNodes.has(id)) {
      entries.push({ kind: 'added', entity: 'node', id, name: String(n.data?.name ?? id) })
    } else if (nodeSignature(bNodes.get(id)!) !== nodeSignature(n)) {
      entries.push({ kind: 'modified', entity: 'node', id, name: String(n.data?.name ?? id), detail: 'structure changed' })
    }
  }
  for (const [id, n] of bNodes) {
    if (!aNodes.has(id)) {
      entries.push({ kind: 'removed', entity: 'node', id, name: String(n.data?.name ?? id) })
    }
  }

  const bEdges = new Map<string, { id: string; source: string; target: string; data?: Record<string, unknown> }>()
  const aEdges = new Map<string, { id: string; source: string; target: string; data?: Record<string, unknown> }>()
  for (const e of (before.edges ?? []) as { id: string; source: string; target: string; data?: Record<string, unknown> }[]) {
    bEdges.set(stableId(e), e)
  }
  for (const e of (after.edges ?? []) as { id: string; source: string; target: string; data?: Record<string, unknown> }[]) {
    aEdges.set(stableId(e), e)
  }

  for (const [id, e] of aEdges) {
    if (!bEdges.has(id)) {
      entries.push({ kind: 'added', entity: 'edge', id, detail: `${e.source} → ${e.target}` })
    } else if (edgeSignature(bEdges.get(id)!) !== edgeSignature(e)) {
      entries.push({ kind: 'modified', entity: 'edge', id, detail: `${e.source} → ${e.target}` })
    }
  }
  for (const [id, e] of bEdges) {
    if (!aEdges.has(id)) {
      entries.push({ kind: 'removed', entity: 'edge', id, detail: `${e.source} → ${e.target}` })
    }
  }

  return entries
}
