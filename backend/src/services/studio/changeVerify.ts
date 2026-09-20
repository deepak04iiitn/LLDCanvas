/** Change One Thing — behavior verification for protected + new flows. */

import type { GraphEdge, GraphNode } from '../graph/analyze'

export type ChangeRequestType =
  | 'capability'
  | 'variation'
  | 'behavior'
  | 'constraint'
  | 'removal'
  | 'scale'
  | 'failure'
  | 'ownership'
  | string

export interface ChangeFlow {
  id: string
  label: string
  steps?: string[]
  mustReach?: { from: string; to: string }[]
  mustKeepElementNames?: string[]
  mustHavePathTopics?: string[]
  mustNotReach?: { from: string; to: string }[]
}

export interface ChangePayload {
  changeRequest?: {
    title?: string
    body?: string
    type?: ChangeRequestType
  }
  briefing?: string
  constraints?: string[]
  forbidModifyElementNames?: string[]
  maxNewClasses?: number
  protectedFlows?: ChangeFlow[]
  newFlows?: ChangeFlow[]
  expectedTouchHints?: string[]
  /** @deprecated seed alias */
  allowedChange?: string
}

export interface BehaviorCheck {
  id: string
  ok: boolean
  label: string
  detail?: string
  group?: 'protected' | 'new'
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
  return (
    nodes.find(n => normalizeName(nameOf(n)) === target) ??
    nodes.find(
      n =>
        normalizeName(nameOf(n)).includes(target) ||
        target.includes(normalizeName(nameOf(n))),
    )
  )
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
        else if (m && typeof m === 'object' && 'name' in m) {
          parts.push(String((m as { name: string }).name))
        }
      }
    }
  }
  return parts.join(' ').toLowerCase()
}

export function parseChangePayload(raw: unknown): ChangePayload {
  if (!raw || typeof raw !== 'object') return {}
  return raw as ChangePayload
}

function verifyFlows(
  diagram: Record<string, unknown>,
  flows: ChangeFlow[],
  group: 'protected' | 'new',
): BehaviorCheck[] {
  const nodes = asNodes(diagram)
  const edges = asEdges(diagram)
  const adj = buildAdj(nodes, edges)
  const checks: BehaviorCheck[] = []

  for (const flow of flows) {
    for (const name of flow.mustKeepElementNames ?? []) {
      const found = findNodeByName(nodes, name)
      checks.push({
        id: `${group}-${flow.id}-keep-${name}`,
        ok: Boolean(found),
        group,
        label: found
          ? `${flow.label}: kept ${name}`
          : `${flow.label}: missing ${name}`,
        detail: found ? undefined : `Expected element named like “${name}”`,
      })
    }

    for (const reach of flow.mustReach ?? []) {
      const from = findNodeByName(nodes, reach.from)
      const to = findNodeByName(nodes, reach.to)
      const ok = Boolean(from && to && canReach(adj, String(from.id), String(to.id)))
      checks.push({
        id: `${group}-${flow.id}-reach-${reach.from}-${reach.to}`,
        ok,
        group,
        label: ok
          ? `${flow.label}: path ${reach.from} → ${reach.to}`
          : `${flow.label}: no path ${reach.from} → ${reach.to}`,
      })
    }

    for (const reach of flow.mustNotReach ?? []) {
      const from = findNodeByName(nodes, reach.from)
      const to = findNodeByName(nodes, reach.to)
      const reaches =
        from && to ? canReach(adj, String(from.id), String(to.id)) : false
      const ok = !reaches
      checks.push({
        id: `${group}-${flow.id}-noreach-${reach.from}-${reach.to}`,
        ok,
        group,
        label: ok
          ? `${flow.label}: no direct dependency ${reach.from} → ${reach.to}`
          : `${flow.label}: unexpected path ${reach.from} → ${reach.to}`,
      })
    }

    for (const topic of flow.mustHavePathTopics ?? []) {
      const ok = collectCorpus(nodes).includes(topic.toLowerCase())
      checks.push({
        id: `${group}-${flow.id}-topic-${topic}`,
        ok,
        group,
        label: ok
          ? `${flow.label}: covers “${topic}”`
          : `${flow.label}: missing “${topic}”`,
      })
    }

    if (
      !(flow.mustReach?.length) &&
      !(flow.mustKeepElementNames?.length) &&
      !(flow.mustHavePathTopics?.length) &&
      !(flow.mustNotReach?.length)
    ) {
      checks.push({
        id: `${group}-${flow.id}-stated`,
        ok: true,
        group,
        label: `${flow.label}: stated`,
        detail: (flow.steps ?? []).join(' → '),
      })
    }
  }

  return checks
}

export function verifyChangeBehavior(
  afterDiagram: Record<string, unknown>,
  payload: ChangePayload,
): {
  protectedChecks: BehaviorCheck[]
  newChecks: BehaviorCheck[]
  checks: BehaviorCheck[]
  protectedPct: number
  newPct: number
} {
  const protectedChecks = verifyFlows(afterDiagram, payload.protectedFlows ?? [], 'protected')
  const newChecks = verifyFlows(afterDiagram, payload.newFlows ?? [], 'new')
  const checks = [...protectedChecks, ...newChecks]

  const pct = (list: BehaviorCheck[]) =>
    list.length === 0
      ? 100
      : Math.round((list.filter(c => c.ok).length / list.length) * 100)

  return {
    protectedChecks,
    newChecks,
    checks,
    protectedPct: pct(protectedChecks),
    newPct: pct(newChecks),
  }
}
