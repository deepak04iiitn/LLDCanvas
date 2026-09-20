'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  analyzeDiagram,
  getNodeAnalysis,
  type DiagramLike,
} from '@/lib/graph/analyzeDiagram'
import { toDependencyGraph } from '@/lib/graph/toDependencyGraph'
import { storyWalk } from '@/lib/graph/storyWalk'
import { scoreEngine } from '@/lib/graph/scoreEngine'
import { MicroscopePanel } from '@/components/studio/microscope/MicroscopePanel'
import { DependencyWebView } from '@/components/studio/dependency-web/DependencyWebView'
import { StoryPlayer } from '@/components/studio/story/StoryPlayer'
import { ScoreOverview } from '@/components/learn/score/ScoreOverview'

type AnalyzeView = 'microscope' | 'depweb' | 'score' | 'story'

export interface AnalyzePanelProps {
  selectedNode?: { id: string; name?: string } | null
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  className?: string
}

/**
 * Hosts Phase 2 Analyze tools: Microscope, Dependency Web, Score, Story.
 */
export function AnalyzePanel({
  selectedNode = null,
  diagram = null,
  className,
}: AnalyzePanelProps) {
  const [view, setView] = useState<AnalyzeView>('microscope')

  const diagramLike = useMemo<DiagramLike>(() => ({
    nodes: (diagram?.nodes ?? []) as DiagramLike['nodes'],
    edges: (diagram?.edges ?? []) as DiagramLike['edges'],
  }), [diagram])

  const analysis = useMemo(
    () => (diagram ? analyzeDiagram(diagramLike) : null),
    [diagram, diagramLike],
  )

  const nodeAnalysis = useMemo(
    () => getNodeAnalysis(diagramLike, selectedNode?.id),
    [diagramLike, selectedNode?.id],
  )

  const depGraph = useMemo(
    () => (diagram ? toDependencyGraph(diagramLike) : null),
    [diagram, diagramLike],
  )

  const story = useMemo(
    () => (diagram ? storyWalk(diagramLike) : null),
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
    { id: 'story', label: 'Story' },
  ]

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

      <p className="shrink-0 border-b border-hairline bg-paper-elevated/60 px-3 py-1.5 text-[11px] text-ink-muted">
        Log design rationale in the{' '}
        <span className="font-medium text-brand">History → Decisions</span> tab.
      </p>

      <div className="min-h-0 flex-1 overflow-hidden">
        {view === 'microscope' && (
          <MicroscopePanel selectedNode={selectedNode} analysis={nodeAnalysis} />
        )}
        {view === 'depweb' && <DependencyWebView graph={depGraph} />}
        {view === 'score' && <ScoreOverview score={score} />}
        {view === 'story' && <StoryPlayer story={story} />}
      </div>
    </div>
  )
}
