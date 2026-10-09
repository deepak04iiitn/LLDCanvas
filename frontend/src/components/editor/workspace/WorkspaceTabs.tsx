'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AnalyzeExperience } from '@/components/editor/analyze/AnalyzeExperience'
import type { AnalysisCache } from '@/hooks/useBackgroundAnalysis'
import type { AnalysisReport, DiagramInput } from '@/lib/design-analysis'
import type { AnalyzeEdge } from '@/lib/graph/analyzeDiagram'

export type WorkspaceTabId = 'canvas' | 'analyze'

const TABS: { id: WorkspaceTabId; label: string }[] = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'analyze', label: 'Analyze' },
]

export interface WorkspaceTabsProps {
  canvas?: React.ReactNode
  selectedNode?: { id: string; name?: string; elementId?: string } | null
  selectedEdge?: AnalyzeEdge | null
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  diagramId?: string | null
  diagramTitle?: string
  onFocusElement?: (elementId: string) => void
  className?: string
  defaultTab?: WorkspaceTabId
  /** Controlled tab (optional) */
  tab?: WorkspaceTabId
  onTabChange?: (tab: WorkspaceTabId) => void
  analysisCache?: AnalysisCache | null
  analysisReady?: boolean
  analyzeNow?: (d?: DiagramInput) => AnalysisReport
}

/**
 * Design Workspace — Canvas editor + full-bleed Analyze experience.
 */
export function WorkspaceTabs({
  canvas,
  diagram = null,
  onFocusElement,
  className,
  defaultTab = 'canvas',
  tab: controlledTab,
  onTabChange,
  analysisCache = null,
  analysisReady = false,
  analyzeNow,
}: WorkspaceTabsProps) {
  const [internalTab, setInternalTab] = useState<WorkspaceTabId>(
    defaultTab === 'analyze' ? 'analyze' : 'canvas',
  )
  const tab = controlledTab ?? internalTab

  function setTab(next: WorkspaceTabId) {
    onTabChange?.(next)
    if (controlledTab === undefined) setInternalTab(next)
  }

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
        {/* Keep canvas mounted so RF state/layout is preserved */}
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
          <div className="absolute inset-0 z-20 bg-paper">
            <AnalyzeExperience
              diagram={diagram ?? { nodes: [], edges: [] }}
              cache={analysisCache}
              ready={analysisReady}
              analyzeNow={
                analyzeNow ??
                (() => ({
                  rulesetVersion: 'offline',
                  revisionId: 'none',
                  overallScore: 0,
                  findings: [],
                  strengths: [],
                  weaknesses: [],
                  recommendations: [],
                  categories: [],
                  summary: {
                    nodeCount: 0,
                    edgeCount: 0,
                    typeCount: 0,
                    applicableRules: 0,
                    failed: 0,
                    warned: 0,
                    passed: 0,
                    na: 0,
                  },
                }))
              }
              onFocusElement={onFocusElement}
              onRequestCanvas={() => setTab('canvas')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
