'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  analyzeDiagram,
  type DiagramLike,
  type AnalyzeEdge,
} from '@/lib/graph/analyzeDiagram'
import { scoreEngine } from '@/lib/graph/scoreEngine'
import { ScoreOverview } from '@/components/learn/score/ScoreOverview'

export interface AnalyzePanelProps {
  selectedNode?: { id: string; name?: string; elementId?: string } | null
  selectedEdge?: AnalyzeEdge | null
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  compareDiagram?: { nodes: unknown[]; edges: unknown[] } | null
  onFocusElement?: (elementId: string) => void
  className?: string
}

/**
 * Hosts Analyze tools — Score.
 */
export function AnalyzePanel({
  diagram = null,
  className,
}: AnalyzePanelProps) {
  const diagramLike = useMemo<DiagramLike>(
    () => ({
      nodes: (diagram?.nodes ?? []) as DiagramLike['nodes'],
      edges: (diagram?.edges ?? []) as DiagramLike['edges'],
    }),
    [diagram],
  )

  const analysis = useMemo(
    () => (diagram ? analyzeDiagram(diagramLike) : null),
    [diagram, diagramLike],
  )

  const score = useMemo(
    () => (diagram ? scoreEngine(diagramLike) : null),
    [diagram, diagramLike],
  )

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-paper', className)}>
      <div className="flex shrink-0 items-center border-b border-hairline px-3 py-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-brand">Score</span>
        {analysis && (
          <span className="ml-auto font-mono text-[10px] text-ink-faint">
            {analysis.nodeCount}n · {analysis.edgeCount}e
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ScoreOverview score={score} />
      </div>
    </div>
  )
}
