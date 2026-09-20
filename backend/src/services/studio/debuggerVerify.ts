/** Design Debugger architecture verification after repair. */

import { scoreDiagram, type ScoreResult } from '../graph/scoreEngine'
import type { GraphEdge, GraphNode } from '../graph/analyze'
import type { DebuggerPayload } from './debuggerGrade'

function asNodes(diagram: Record<string, unknown> | undefined): GraphNode[] {
  return (Array.isArray(diagram?.nodes) ? diagram!.nodes : []) as GraphNode[]
}

function asEdges(diagram: Record<string, unknown> | undefined): GraphEdge[] {
  return (Array.isArray(diagram?.edges) ? diagram!.edges : []) as GraphEdge[]
}

function nameOf(n: GraphNode): string {
  return String(n.data?.name ?? n.id)
}

function elementIdOf(n: GraphNode | GraphEdge): string {
  if ('data' in n && n.data && typeof n.data === 'object' && 'elementId' in n.data) {
    return String((n.data as { elementId?: string }).elementId ?? ('id' in n ? n.id : ''))
  }
  return String('id' in n ? n.id : '')
}

export interface VerifyCheck {
  id: string
  ok: boolean
  label: string
}

export interface VerifyResult {
  checks: VerifyCheck[]
  passed: number
  total: number
  refactoringPct: number
  scores: { before: ScoreResult; after: ScoreResult }
}

export function verifyDebuggerRepair(
  beforeDiagram: Record<string, unknown>,
  afterDiagram: Record<string, unknown>,
  payload: DebuggerPayload,
): VerifyResult {
  const beforeNodes = asNodes(beforeDiagram)
  const afterNodes = asNodes(afterDiagram)
  const afterEdges = asEdges(afterDiagram)
  const v = payload.verification ?? {}

  const checks: VerifyCheck[] = []

  const afterNames = new Set(afterNodes.map(n => nameOf(n).toLowerCase()))
  for (const name of v.mustIntroduceElementNames ?? []) {
    const ok = [...afterNames].some(n => n.includes(name.toLowerCase()))
    checks.push({
      id: `intro-${name}`,
      ok,
      label: ok
        ? `Introduced abstraction: ${name}`
        : `Missing expected abstraction: ${name}`,
    })
  }

  const nameByNodeId = new Map(afterNodes.map(n => [String(n.id), nameOf(n)]))
  for (const edge of v.forbidDirectEdges ?? []) {
    const bad = afterEdges.some(e => {
      const from = nameByNodeId.get(String(e.source)) ?? ''
      const to = nameByNodeId.get(String(e.target)) ?? ''
      return (
        from.toLowerCase() === edge.from.toLowerCase() &&
        to.toLowerCase() === edge.to.toLowerCase()
      )
    })
    checks.push({
      id: `forbid-${edge.from}-${edge.to}`,
      ok: !bad,
      label: bad
        ? `Still has concrete edge ${edge.from} → ${edge.to}`
        : `No direct ${edge.from} → ${edge.to} dependency`,
    })
  }

  for (const name of v.requireNoEditTo ?? []) {
    const before = beforeNodes.find(n => nameOf(n).toLowerCase() === name.toLowerCase())
    const after = afterNodes.find(n => nameOf(n).toLowerCase() === name.toLowerCase())
    if (!before) continue
    const beforeMethods = JSON.stringify(before.data?.methods ?? [])
    const afterMethods = JSON.stringify(after?.data?.methods ?? [])
    const ok = Boolean(after) && beforeMethods === afterMethods
    checks.push({
      id: `stable-${name}`,
      ok,
      label: ok
        ? `${name} core structure preserved`
        : `${name} was altered more than expected`,
    })
  }

  // Soft check: prefer at least one interface / abstract in after if verification asks for gateway/strategy
  if ((v.mustIntroduceElementNames ?? []).length > 0) {
    const hasIface = afterNodes.some(n => {
      const t = String(n.data?.nodeType ?? '')
      return t === 'interface' || t === 'abstract-class'
    })
    checks.push({
      id: 'has-abstraction-type',
      ok: hasIface || (v.mustIntroduceElementNames ?? []).some(n => afterNames.has(n.toLowerCase())),
      label: hasIface
        ? 'Design includes an interface/abstract type'
        : 'Consider introducing an interface or abstract type',
    })
  }

  if (checks.length === 0) {
    checks.push({
      id: 'changed',
      ok: JSON.stringify(beforeDiagram) !== JSON.stringify(afterDiagram),
      label: 'Architecture was modified',
    })
  }

  const beforeScore = scoreDiagram(beforeNodes, asEdges(beforeDiagram))
  const afterScore = scoreDiagram(afterNodes, afterEdges)
  const passed = checks.filter(c => c.ok).length
  const total = checks.length
  const refactoringPct = Math.round((passed / Math.max(total, 1)) * 100)

  return {
    checks,
    passed,
    total,
    refactoringPct,
    scores: { before: beforeScore, after: afterScore },
  }
}

export function diagramElementIds(diagram: Record<string, unknown>): string[] {
  const nodes = asNodes(diagram)
  const edges = asEdges(diagram)
  return [
    ...nodes.map(n => elementIdOf(n) || String(n.id)),
    ...edges.map(e => elementIdOf(e) || String(e.id)),
  ]
}
