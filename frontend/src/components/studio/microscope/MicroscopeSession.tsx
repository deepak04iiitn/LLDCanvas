'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AnalyzeEdge, DiagramLike } from '@/lib/graph/analyzeDiagram'
import {
  buildMicroscopeContext,
  computeFocusSets,
  pathBetween,
  type MicroscopeLens,
  type MicroscopeOverlay,
  type MicroscopeZoomLevel,
} from '@/lib/graph/microscope'
import { LensSwitcher } from './LensSwitcher'
import { ZoomBreadcrumb } from './ZoomBreadcrumb'
import { FollowMeBar } from './FollowMeBar'
import { MicroscopeLensBody } from './MicroscopeLensBody'

export interface MicroscopeHighlightState {
  highlightIds: string[]
  dimIds: string[]
}

export interface MicroscopeSessionProps {
  diagram: DiagramLike
  selectedNode: { id: string; name?: string; elementId?: string } | null
  selectedEdge?: AnalyzeEdge | null
  overlay?: MicroscopeOverlay
  onFocusElement?: (elementId: string) => void
  onHighlightChange?: (state: MicroscopeHighlightState) => void
  className?: string
  /** Compact for studio / split */
  embedded?: boolean
  /** Pack-suggested starting lens */
  initialLens?: MicroscopeLens
  /** Short how-to line under the title */
  guideHint?: string
}

function resolveFocusId(
  diagram: DiagramLike,
  selected: { id: string; elementId?: string } | null,
): string | null {
  if (!selected) return null
  if (selected.elementId) return selected.elementId
  const n = diagram.nodes.find(x => x.id === selected.id)
  return n ? (n.elementId ?? n.id) : selected.id
}

export function MicroscopeSession({
  diagram,
  selectedNode,
  selectedEdge = null,
  overlay,
  onFocusElement,
  onHighlightChange,
  className,
  embedded,
  initialLens = 'overview',
  guideHint,
}: MicroscopeSessionProps) {
  const [lens, setLens] = useState<MicroscopeLens>(initialLens)
  const [zoom, setZoom] = useState<MicroscopeZoomLevel>('component')
  const [flowId, setFlowId] = useState<string | null>(null)
  const [followActive, setFollowActive] = useState(false)
  const [followAnchor, setFollowAnchor] = useState<string | null>(null)
  const [methodFocus, setMethodFocus] = useState<string | null>(null)

  useEffect(() => {
    setLens(initialLens)
  }, [initialLens])

  const focusId = resolveFocusId(diagram, selectedNode)

  const ctx = useMemo(
    () => buildMicroscopeContext(diagram, overlay),
    [diagram, overlay],
  )

  const focusSets = useMemo(
    () =>
      computeFocusSets(ctx, focusId, lens, {
        flowId: flowId ?? undefined,
        edgeHighlight:
          selectedEdge && zoom === 'relationship'
            ? (() => {
                const s = diagram.nodes.find(n => n.id === selectedEdge.source)
                const t = diagram.nodes.find(n => n.id === selectedEdge.target)
                return [s?.elementId ?? s?.id, t?.elementId ?? t?.id].filter(Boolean) as string[]
              })()
            : undefined,
      }),
    [ctx, focusId, lens, flowId, selectedEdge, zoom, diagram.nodes],
  )

  useEffect(() => {
    onHighlightChange?.(focusSets)
  }, [focusSets, onHighlightChange])

  useEffect(() => {
    if (selectedEdge) setZoom('relationship')
  }, [selectedEdge])

  useEffect(() => {
    if (focusId && followActive && !followAnchor) setFollowAnchor(focusId)
  }, [focusId, followActive, followAnchor])

  const pathLabels = useMemo(() => {
    if (!followActive || !followAnchor || !focusId) return undefined
    const path = pathBetween(ctx, followAnchor, focusId)
    if (!path) return [ctx.analysis.byElementId[followAnchor]?.name ?? followAnchor]
    return path.map(id => ctx.analysis.byElementId[id]?.name ?? id)
  }, [followActive, followAnchor, focusId, ctx])

  const focusLabel = focusId
    ? ctx.analysis.byElementId[focusId]?.name ?? selectedNode?.name
    : undefined

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-paper', className)}>
      <div className="shrink-0 space-y-2 border-b border-hairline px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Architecture Microscope
          </p>
          {!embedded && (
            <span className="font-mono text-[10px] text-ink-faint">
              {ctx.analysis.nodeCount}n · {ctx.analysis.edgeCount}e
            </span>
          )}
        </div>
        {guideHint && (
          <p className="rounded-md bg-brand-tint/40 px-2 py-1.5 text-[12px] leading-snug text-ink">
            {guideHint}
          </p>
        )}
        <ZoomBreadcrumb
          level={zoom}
          onChange={l => {
            setZoom(l)
            if (l === 'flow') setLens('flows')
            if (l === 'responsibility') setLens('responsibilities')
            if (l === 'system') setLens('layers')
          }}
          focusLabel={focusLabel}
        />
        <LensSwitcher
          lens={lens}
          onChange={l => {
            setLens(l)
            if (l === 'flows') setZoom('flow')
            else if (l === 'responsibilities') setZoom('component')
            else if (zoom === 'relationship' && l !== 'overview') setZoom('component')
          }}
        />
        <FollowMeBar
          active={followActive}
          anchorName={
            followAnchor
              ? ctx.analysis.byElementId[followAnchor]?.name ?? followAnchor
              : undefined
          }
          pathLabels={pathLabels}
          onToggle={() => {
            setFollowActive(v => {
              const next = !v
              if (next && focusId) setFollowAnchor(focusId)
              if (!next) setFollowAnchor(null)
              return next
            })
          }}
          onClear={() => {
            setFollowActive(false)
            setFollowAnchor(null)
          }}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {methodFocus && zoom === 'responsibility' && (
          <div className="mb-3 rounded-lg border border-hairline p-2">
            <p className="font-mono text-[10px] uppercase text-ink-faint">Responsibility</p>
            <p className="font-medium text-ink">{methodFocus}()</p>
            <p className="mt-1 text-[12px] text-ink-muted">
              Inputs inferred from attribute/param types when present; drill collaborators via
              Dependencies and Flows.
            </p>
            <button
              type="button"
              className="mt-2 font-mono text-[10px] text-brand"
              onClick={() => setMethodFocus(null)}
            >
              Back
            </button>
          </div>
        )}
        <MicroscopeLensBody
          ctx={ctx}
          focusId={focusId}
          lens={lens}
          zoom={zoom}
          selectedEdge={selectedEdge}
          flowId={flowId}
          onPickElement={id => onFocusElement?.(id)}
          onPickFlow={id => {
            setFlowId(id)
            setLens('flows')
            setZoom('flow')
          }}
          onSelectMethod={name => {
            setMethodFocus(name)
            setZoom('responsibility')
            setLens('responsibilities')
          }}
        />
      </div>
    </div>
  )
}
