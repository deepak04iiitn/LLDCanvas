'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  analyzeDiagram,
  type DiagramLike,
  type AnalyzeEdge,
} from '@/lib/graph/analyzeDiagram'
import { scoreEngine } from '@/lib/graph/scoreEngine'
import { MicroscopeSession } from '@/components/studio/microscope/MicroscopeSession'
import type { MicroscopeHighlightState } from '@/components/studio/microscope/MicroscopeSession'
import type { MicroscopeOverlay } from '@/lib/graph/microscope'
import { DependencyWebSession } from '@/components/studio/dependency-web/DependencyWebSession'
import { ScoreOverview } from '@/components/learn/score/ScoreOverview'

type AnalyzeView = 'microscope' | 'depweb' | 'score'

export interface AnalyzePanelProps {
  selectedNode?: { id: string; name?: string; elementId?: string } | null
  selectedEdge?: AnalyzeEdge | null
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  compareDiagram?: { nodes: unknown[]; edges: unknown[] } | null
  overlay?: MicroscopeOverlay
  onFocusElement?: (elementId: string) => void
  onHighlightChange?: (state: MicroscopeHighlightState) => void
  className?: string
}

/**
 * Hosts Analyze tools — Microscope, Dependency Web, Score.
 */
export function AnalyzePanel({
  selectedNode = null,
  selectedEdge = null,
  diagram = null,
  compareDiagram = null,
  overlay,
  onFocusElement,
  onHighlightChange,
  className,
}: AnalyzePanelProps) {
  const [view, setView] = useState<AnalyzeView>('microscope')

  const diagramLike = useMemo<DiagramLike>(
    () => ({
      nodes: (diagram?.nodes ?? []) as DiagramLike['nodes'],
      edges: (diagram?.edges ?? []) as DiagramLike['edges'],
    }),
    [diagram],
  )

  const compareLike = useMemo<DiagramLike | null>(() => {
    if (!compareDiagram) return null
    return {
      nodes: (compareDiagram.nodes ?? []) as DiagramLike['nodes'],
      edges: (compareDiagram.edges ?? []) as DiagramLike['edges'],
    }
  }, [compareDiagram])

  const analysis = useMemo(
    () => (diagram ? analyzeDiagram(diagramLike) : null),
    [diagram, diagramLike],
  )

  const score = useMemo(
    () => (diagram ? scoreEngine(diagramLike) : null),
    [diagram, diagramLike],
  )

  const views: { id: AnalyzeView; label: string }[] = [
    { id: 'microscope', label: 'Microscope' },
    { id: 'depweb', label: 'Dependency Web' },
    { id: 'score', label: 'Score' },
  ]

  const initialFocus = selectedNode?.elementId ?? selectedNode?.id ?? null

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-paper', className)}>
      <div className="flex shrink-0 gap-1 border-b border-hairline px-3 py-2">
        {views.map(v => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              'rounded-md px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide transition-colors',
              view === v.id
                ? 'bg-brand-tint text-brand'
                : 'text-ink-faint hover:bg-hairline/50 hover:text-ink-muted',
            )}
          >
            {v.label}
          </button>
        ))}
        {analysis && (
          <span className="ml-auto self-center font-mono text-[10px] text-ink-faint">
            {analysis.nodeCount}n · {analysis.edgeCount}e
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {view === 'microscope' && (
          <MicroscopeSession
            diagram={diagramLike}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            overlay={overlay}
            onFocusElement={onFocusElement}
            onHighlightChange={onHighlightChange}
            embedded
          />
        )}
        {view === 'depweb' && diagram && (
          <DependencyWebSession
            diagram={diagramLike}
            compareDiagram={compareLike}
            overlay={
              overlay
                ? {
                    layers: overlay.layers,
                    flows: overlay.flows?.map(f => ({
                      id: f.id,
                      label: f.label,
                      steps: f.steps,
                    })),
                  }
                : undefined
            }
            initialFocusId={initialFocus}
            guided
            guideText="Zoom out: see connections. Select a node → Trace deps/dependents → Blast / Simulate. Open Microscope to zoom in."
            onOpenMicroscope={id => {
              onFocusElement?.(id)
              setView('microscope')
            }}
            onFocusElement={onFocusElement}
          />
        )}
        {view === 'score' && <ScoreOverview score={score} />}
      </div>
    </div>
  )
}
