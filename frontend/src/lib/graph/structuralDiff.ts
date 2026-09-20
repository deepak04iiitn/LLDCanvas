import type { AnalyzeEdge, AnalyzeNode, DiagramLike } from './analyzeDiagram'

export type DiffKind = 'added' | 'removed' | 'changed'

export interface StructuralChange {
  kind: DiffKind
  elementId: string
  entity: 'node' | 'edge'
  summary: string
  before?: unknown
  after?: unknown
}

export interface StructuralDiffResult {
  changes: StructuralChange[]
  added: number
  removed: number
  changed: number
}

function eid(n: { id: string; elementId?: string }): string {
  return n.elementId ?? n.id
}

function nodeSignature(n: AnalyzeNode): string {
  const d = n.data ?? {}
  return JSON.stringify({
    name: d.name,
    nodeType: d.nodeType,
    stereotype: d.stereotype,
    attributes: d.attributes,
    methods: d.methods,
    noteText: d.noteText,
  })
}

function edgeSignature(e: AnalyzeEdge, nodes: AnalyzeNode[]): string {
  const byId = new Map(nodes.map(n => [n.id, n]))
  const src = byId.get(e.source)
  const tgt = byId.get(e.target)
  return JSON.stringify({
    source: src ? eid(src) : e.source,
    target: tgt ? eid(tgt) : e.target,
    relationshipType: e.data?.relationshipType,
    label: e.data?.label,
  })
}

/**
 * Structural UML diff by elementId.
 * Ignores layout (x/y/zoom) — only semantic node/edge fields.
 */
export function structuralDiff(before: DiagramLike, after: DiagramLike): StructuralDiffResult {
  const beforeNodes = new Map((before.nodes ?? []).map(n => [eid(n), n]))
  const afterNodes = new Map((after.nodes ?? []).map(n => [eid(n), n]))
  const beforeEdges = new Map((before.edges ?? []).map(e => [eid(e), e]))
  const afterEdges = new Map((after.edges ?? []).map(e => [eid(e), e]))

  const changes: StructuralChange[] = []

  for (const [id, n] of afterNodes) {
    const prev = beforeNodes.get(id)
    if (!prev) {
      changes.push({
        kind: 'added',
        elementId: id,
        entity: 'node',
        summary: `Added ${n.data?.nodeType ?? 'node'} “${n.data?.name ?? id}”`,
        after: n.data,
      })
    } else if (nodeSignature(prev) !== nodeSignature(n)) {
      changes.push({
        kind: 'changed',
        elementId: id,
        entity: 'node',
        summary: `Changed “${n.data?.name ?? id}”`,
        before: prev.data,
        after: n.data,
      })
    }
  }
  for (const [id, n] of beforeNodes) {
    if (!afterNodes.has(id)) {
      changes.push({
        kind: 'removed',
        elementId: id,
        entity: 'node',
        summary: `Removed “${n.data?.name ?? id}”`,
        before: n.data,
      })
    }
  }

  for (const [id, e] of afterEdges) {
    const prev = beforeEdges.get(id)
    if (!prev) {
      changes.push({
        kind: 'added',
        elementId: id,
        entity: 'edge',
        summary: `Added ${e.data?.relationshipType ?? 'relationship'}`,
        after: e.data,
      })
    } else if (
      edgeSignature(prev, before.nodes) !== edgeSignature(e, after.nodes)
    ) {
      changes.push({
        kind: 'changed',
        elementId: id,
        entity: 'edge',
        summary: `Changed ${e.data?.relationshipType ?? 'relationship'}`,
        before: prev.data,
        after: e.data,
      })
    }
  }
  for (const [id, e] of beforeEdges) {
    if (!afterEdges.has(id)) {
      changes.push({
        kind: 'removed',
        elementId: id,
        entity: 'edge',
        summary: `Removed ${e.data?.relationshipType ?? 'relationship'}`,
        before: e.data,
      })
    }
  }

  return {
    changes,
    added: changes.filter(c => c.kind === 'added').length,
    removed: changes.filter(c => c.kind === 'removed').length,
    changed: changes.filter(c => c.kind === 'changed').length,
  }
}
