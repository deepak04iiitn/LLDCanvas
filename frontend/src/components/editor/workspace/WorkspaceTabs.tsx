'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AnalyzePanel } from './AnalyzePanel'
import { EvolvePanel } from './EvolvePanel'
import { HistoryPanel } from './HistoryPanel'
import { SharePanel } from './SharePanel'
import type { AnalyzeEdge } from '@/lib/graph/analyzeDiagram'
import type { MicroscopeHighlightState } from '@/components/studio/microscope/MicroscopeSession'
import type { MicroscopeOverlay } from '@/lib/graph/microscope'

export type WorkspaceTabId = 'canvas' | 'analyze' | 'evolve' | 'history' | 'share'

const TABS: { id: WorkspaceTabId; label: string }[] = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'evolve', label: 'Evolve' },
  { id: 'history', label: 'History' },
  { id: 'share', label: 'Share' },
]

export interface WorkspaceTabsProps {
  canvas?: React.ReactNode
  selectedNode?: { id: string; name?: string; elementId?: string } | null
  selectedEdge?: AnalyzeEdge | null
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  diagramId?: string | null
  diagramTitle?: string
  microscopeOverlay?: MicroscopeOverlay
  onFocusElement?: (elementId: string) => void
  onHighlightChange?: (state: MicroscopeHighlightState) => void
  className?: string
  defaultTab?: WorkspaceTabId
}

/**
 * Design Workspace — Analyze uses split Microscope Mode (canvas + instrument).
 */
export function WorkspaceTabs({
  canvas,
  selectedNode = null,
  selectedEdge = null,
  diagram = null,
  diagramId = null,
  diagramTitle = '',
  microscopeOverlay,
  onFocusElement,
  onHighlightChange,
  className,
  defaultTab = 'canvas',
}: WorkspaceTabsProps) {
  const [tab, setTab] = useState<WorkspaceTabId>(defaultTab)

  const showCanvas =
    tab === 'canvas' || tab === 'analyze'

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
              tab === t.id ? 'font-medium text-brand' : 'text-ink-muted hover:text-ink',
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
        <div
          className={cn(
            'absolute inset-0',
            showCanvas ? 'z-10' : 'pointer-events-none z-0 opacity-0',
            tab === 'analyze' && 'right-[min(420px,42%)]',
          )}
          aria-hidden={!showCanvas}
        >
          {canvas ?? (
            <div className="flex h-full items-center justify-center text-[13px] text-ink-faint">
              Canvas host
            </div>
          )}
        </div>

        {tab === 'analyze' && (
          <div className="absolute bottom-0 right-0 top-0 z-20 w-[min(420px,42%)] border-l border-hairline bg-paper shadow-sm">
            <AnalyzePanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              diagram={diagram}
              overlay={microscopeOverlay}
              onFocusElement={onFocusElement}
              onHighlightChange={onHighlightChange}
            />
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
