'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AnalyzePanel } from './AnalyzePanel'
import { EvolvePanel } from './EvolvePanel'
import { HistoryPanel } from './HistoryPanel'
import { SharePanel } from './SharePanel'

export type WorkspaceTabId = 'canvas' | 'analyze' | 'evolve' | 'history' | 'share'

const TABS: { id: WorkspaceTabId; label: string }[] = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'evolve', label: 'Evolve' },
  { id: 'history', label: 'History' },
  { id: 'share', label: 'Share' },
]

export interface WorkspaceTabsProps {
  /** Rendered when Canvas tab is active (usually the existing editor canvas). */
  canvas?: React.ReactNode
  /** Optional selected node for Analyze tools. */
  selectedNode?: { id: string; name?: string } | null
  /** Diagram data for client-side analysis. */
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  /** Persisted diagram id (Mongo). Local drafts skip History/Share APIs. */
  diagramId?: string | null
  /** Default title for Share publish form. */
  diagramTitle?: string
  className?: string
  defaultTab?: WorkspaceTabId
}

/**
 * Design Workspace tab strip — Canvas | Analyze | Evolve | History | Share.
 * Canvas column host: non-canvas tabs replace the center column content.
 */
export function WorkspaceTabs({
  canvas,
  selectedNode = null,
  diagram = null,
  diagramId = null,
  diagramTitle = '',
  className,
  defaultTab = 'canvas',
}: WorkspaceTabsProps) {
  const [tab, setTab] = useState<WorkspaceTabId>(defaultTab)

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div
        role="tablist"
        className="flex shrink-0 items-center gap-0.5 border-b border-hairline bg-paper-elevated px-2"
      >
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative px-3 py-2.5 text-[13px] transition-colors',
              tab === t.id
                ? 'font-medium text-brand'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" />
            )}
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Keep canvas mounted so React Flow state/viewport survive tab switches */}
        <div
          className={cn(
            'absolute inset-0',
            tab === 'canvas' ? 'z-10' : 'pointer-events-none z-0 opacity-0',
          )}
          aria-hidden={tab !== 'canvas'}
        >
          {canvas ?? (
            <div className="flex h-full items-center justify-center text-[13px] text-ink-faint">
              Canvas host
            </div>
          )}
        </div>

        {tab === 'analyze' && (
          <div className="absolute inset-0 z-20">
            <AnalyzePanel selectedNode={selectedNode} diagram={diagram} />
          </div>
        )}
        {tab === 'evolve' && (
          <div className="absolute inset-0 z-20">
            <EvolvePanel diagram={diagram} />
          </div>
        )}
        {tab === 'history' && (
          <div className="absolute inset-0 z-20">
            <HistoryPanel
              diagramId={diagramId}
              selectedElementId={selectedNode?.id ?? null}
            />
          </div>
        )}
        {tab === 'share' && (
          <div className="absolute inset-0 z-20">
            <SharePanel diagramId={diagramId} defaultTitle={diagramTitle} />
          </div>
        )}
      </div>
    </div>
  )
}
