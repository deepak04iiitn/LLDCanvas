/** Refactoring Mode — behavior contract verification (graph-based). */

import type { GraphEdge, GraphNode } from '../graph/analyze'

export interface RefactorFlow {
  id: string
  label: string
  steps?: string[]
  mustReach?: { from: string; to: string }[]
  mustKeepElementNames?: string[]
  mustHavePathTopics?: string[]
}

export interface RefactorPayload {
  briefing?: string
  requirements?: string[]
  constraints?: string[]
  behaviorContract?: { flows?: RefactorFlow[] }
  maxNewAbstractions?: number
  forbidDeleteElementNames?: string[]
  scenario?: 'cleanup' | 'extract' | 'decouple' | 'redesign' | string
  modelHints?: string[]
}

export interface BehaviorCheck {
  id: string
  ok: boolean
  label: string
  detail?: string
}

function asNodes(diagram: Record<string, unknown> | undefined): GraphNode[] {
  return (Array.isArray(diagram?.nodes) ? diagram!.nodes : []) as GraphNode[]
}

function asEdges(diagram: Record<string, unknown> | undefined): GraphEdge[] {
  return (Array.isArray(diagram?.edges) ? diagram!.edges : []) as GraphEdge[]
}

function nameOf(n: GraphNode): string {
  return String(n.data?.name ?? n.id)
}

function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function findNodeByName(nodes: GraphNode[], name: string): GraphNode | undefined {
  const target = normalizeName(name)
  return nodes.find(n => normalizeName(nameOf(n)) === target)
    ?? nodes.find(n => normalizeName(nameOf(n)).includes(target) || target.includes(normalizeName(nameOf(n))))
}

function buildAdj(nodes: GraphNode[], edges: GraphEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  for (const n of nodes) adj.set(String(n.id), [])
  for (const e of edges) {
    const s = String(e.source)
    const t = String(e.target)
    if (!adj.has(s)) adj.set(s, [])
    adj.get(s)!.push(t)
  }
  return adj
}

function canReach(adj: Map<string, string[]>, fromId: string, toId: string): boolean {
  if (fromId === toId) return true
  const seen = new Set<string>()
  const q = [fromId]
  while (q.length) {
    const u = q.shift()!
    if (u === toId) return true
    if (seen.has(u)) continue
    seen.add(u)
    for (const v of adj.get(u) ?? []) {
      if (!seen.has(v)) q.push(v)
    }
  }
  return false
}

function collectCorpus(nodes: GraphNode[]): string {
  const parts: string[] = []
  for (const n of nodes) {
    parts.push(nameOf(n))
    const methods = n.data?.methods
    if (Array.isArray(methods)) {
      for (const m of methods) {
        if (typeof m === 'string') parts.push(m)
        else if (m && typeof m === 'object' && 'name' in m) parts.push(String((m as { name: string }).name))
      }
    }
  }
  return parts.join(' ').toLowerCase()
}

export function parseRefactorPayload(raw: unknown): RefactorPayload {
  if (!raw || typeof raw !== 'object') return {}
  return raw as RefactorPayload
}

export function verifyRefactorBehavior(
  afterDiagram: Record<string, unknown>,
  payload: RefactorPayload,
): { checks: BehaviorCheck[]; passed: number; total: number; preservationPct: number } {
  const nodes = asNodes(afterDiagram)
  const edges = asEdges(afterDiagram)
  const adj = buildAdj(nodes, edges)
  const flows = payload.behaviorContract?.flows ?? []
  const checks: BehaviorCheck[] = []

  if (flows.length === 0) {
    checks.push({
      id: 'no-contract',
      ok: true,
      label: 'No explicit behavior contract — structural improvement only',
    })
  }

  for (const flow of flows) {
    for (const name of flow.mustKeepElementNames ?? []) {
      const found = findNodeByName(nodes, name)
      checks.push({
        id: `${flow.id}-keep-${name}`,
        ok: Boolean(found),
        label: found
          ? `${flow.label}: kept ${name}`
          : `${flow.label}: missing required element ${name}`,
        detail: found ? undefined : `Expected a class/interface named like “${name}”`,
      })
    }

    for (const reach of flow.mustReach ?? []) {
      const from = findNodeByName(nodes, reach.from)
      const to = findNodeByName(nodes, reach.to)
      const ok = Boolean(from && to && canReach(adj, String(from.id), String(to.id)))
      checks.push({
        id: `${flow.id}-reach-${reach.from}-${reach.to}`,
        ok,
        label: ok
          ? `${flow.label}: path ${reach.from} → ${reach.to}`
          : `${flow.label}: no path ${reach.from} → ${reach.to}`,
        detail: ok
          ? undefined
          : `Behavior expects a dependency path from ${reach.from} to ${reach.to}`,
      })
    }

    for (const topic of flow.mustHavePathTopics ?? []) {
      const corpus = collectCorpus(nodes)
      const ok = corpus.includes(topic.toLowerCase())
      checks.push({
        id: `${flow.id}-topic-${topic}`,
        ok,
        label: ok
          ? `${flow.label}: covers “${topic}”`
          : `${flow.label}: missing topic “${topic}” in names/methods`,
      })
    }

    if (
      !(flow.mustReach?.length) &&
      !(flow.mustKeepElementNames?.length) &&
      !(flow.mustHavePathTopics?.length)
    ) {
      checks.push({
        id: `${flow.id}-stated`,
        ok: true,
        label: `${flow.label}: stated (manual review of steps)`,
        detail: (flow.steps ?? []).join(' → '),
      })
    }
  }

  const passed = checks.filter(c => c.ok).length
  const total = checks.length
  const preservationPct = Math.round((passed / Math.max(total, 1)) * 100)
  return { checks, passed, total, preservationPct }
}
