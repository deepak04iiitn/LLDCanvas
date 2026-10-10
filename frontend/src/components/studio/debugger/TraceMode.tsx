'use client'

import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import { analyzeDiagram } from '@/lib/graph/analyzeDiagram'

/**
 * Outbound BFS: all elementIds reachable from `rootElementId` (including root).
 */
export function computeOutboundTrace(
  diagram: DiagramLike,
  rootElementId: string,
): string[] {
  const analysis = analyzeDiagram(diagram)
  if (!analysis.byElementId[rootElementId]) return [rootElementId]

  const visited = new Set<string>()
  const queue = [rootElementId]
  visited.add(rootElementId)

  while (queue.length > 0) {
    const cur = queue.shift()!
    const outbound = analysis.byElementId[cur]?.outbound ?? []
    for (const edge of outbound) {
      if (!visited.has(edge.toId)) {
        visited.add(edge.toId)
        queue.push(edge.toId)
      }
    }
  }

  return [...visited]
}

export interface TraceModeProps {
  active: boolean
  pathIds: string[]
  className?: string
}

/** Lightweight status strip when Trace tool is active. */
export function TraceMode({ active, pathIds, className }: TraceModeProps) {
  if (!active) return null
  return (
    <p className={className ?? 'px-3 py-1.5 font-mono text-[11px] text-ink-muted'}>
      Trace mode — select a node to highlight outbound dependencies
      {pathIds.length > 0 ? ` (${pathIds.length} reachable)` : ''}.
    </p>
  )
}
