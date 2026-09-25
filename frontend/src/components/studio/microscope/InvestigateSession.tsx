'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Send, MousePointer2, Hand, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import { MicroscopeSession } from '@/components/studio/microscope/MicroscopeSession'
import type { MicroscopeLens, MicroscopeOverlay } from '@/lib/graph/microscope'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

export interface InvestigateSessionProps {
  attemptId: string
}

function normalizeDiagram(raw: unknown): DebuggerDiagram {
  const snap = (raw ?? { nodes: [], edges: [] }) as {
    nodes?: unknown[]
    edges?: unknown[]
  }
  const nodes = (snap.nodes ?? []).map(n => {
    const node = n as { id?: string; data?: Record<string, unknown>; elementId?: string }
    const elementId = String(node.elementId ?? node.data?.elementId ?? node.id)
    return { ...node, data: { ...node.data, elementId } }
  })
  const edges = (snap.edges ?? []).map(e => {
    const edge = e as { id?: string; data?: Record<string, unknown>; elementId?: string }
    const elementId = String(edge.elementId ?? edge.data?.elementId ?? edge.id)
    return { ...edge, data: { ...edge.data, elementId } }
  })
  return { nodes, edges }
}

function componentChips(diagram: DebuggerDiagram) {
  return (diagram.nodes ?? []).map(raw => {
    const n = raw as { id?: string; data?: { elementId?: string; name?: string } }
    return {
      rfId: String(n.id),
      elementId: String(n.data?.elementId ?? n.id),
      name: String(n.data?.name ?? n.id),
    }
  })
}

export function InvestigateSession({ attemptId }: InvestigateSessionProps) {
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [diagram, setDiagram] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusElementIds, setFocusElementIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [grade, setGrade] = useState<Record<string, unknown> | null>(null)
  const [highlight, setHighlight] = useState<{ highlightIds: string[]; dimIds: string[] }>({
    highlightIds: [],
    dimIds: [],
  })
  const [lensUsed, setLensUsed] = useState<string[]>([])

  const payload = (pack?.payload ?? {}) as Record<string, unknown>
  const suggestedLens = (typeof payload.suggestedLens === 'string'
    ? payload.suggestedLens
    : 'dependencies') as MicroscopeLens

  const overlay = useMemo<MicroscopeOverlay>(
    () => ({
      flows: Array.isArray(payload.flows) ? (payload.flows as MicroscopeOverlay['flows']) : [],
      creationEdges: Array.isArray(payload.creationEdges)
        ? (payload.creationEdges as MicroscopeOverlay['creationEdges'])
        : [],
      layers: (payload.layers as MicroscopeOverlay['layers']) ?? {},
    }),
    [payload.flows, payload.creationEdges, payload.layers],
  )

  const diagramLike = useMemo<DiagramLike>(
    () => ({
      nodes: diagram.nodes as DiagramLike['nodes'],
      edges: diagram.edges as DiagramLike['edges'],
    }),
    [diagram],
  )

  const chips = useMemo(() => componentChips(diagram), [diagram])

  const selectedNode = useMemo(() => {
    if (!selectedId) return null
    const chip =
      chips.find(c => c.rfId === selectedId || c.elementId === selectedId) ?? null
    if (!chip) return null
    return {
      id: chip.rfId,
      name: chip.name,
      elementId: chip.elementId,
    }
  }, [selectedId, chips])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled || !res.pack) return
        setPack(res.pack)
        const diag = normalizeDiagram(res.pack.diagramSnapshot)
        setDiagram(diag)
        const pl = res.pack.payload as Record<string, unknown>
        const starter = typeof pl.starterFocusId === 'string' ? pl.starterFocusId : null
        if (starter) {
          const match = componentChips(diag).find(
            c => c.elementId === starter || c.rfId === starter,
          )
          setSelectedId(match?.rfId ?? starter)
          setFocusElementIds([starter])
        }
        const progress = (res.attempt as { progress?: Record<string, unknown> })?.progress
        if (typeof progress?.notes === 'string') setNotes(progress.notes)
        if (Array.isArray(progress?.focusElementIds)) {
          setFocusElementIds(progress.focusElementIds as string[])
        }
        if (res.attempt.status === 'submitted' && progress?.lastGrade) {
          setGrade(progress.lastGrade as Record<string, unknown>)
        }
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const focusElement = useCallback((elementIdOrRf: string) => {
    const chip = chips.find(
      c => c.elementId === elementIdOrRf || c.rfId === elementIdOrRf,
    )
    const rfId = chip?.rfId ?? elementIdOrRf
    const eid = chip?.elementId ?? elementIdOrRf
    setSelectedId(rfId)
    setFocusElementIds(prev => (prev.includes(eid) ? prev : [...prev, eid]))
  }, [chips])

  const submit = useCallback(async () => {
    if (!notes.trim() && focusElementIds.length < 2) {
      toast.message('Click at least one related component, then write what you found.')
      return
    }
    setBusy(true)
    try {
      const res = await studioApi.submitMicroscope(attemptId, {
        focusElementIds,
        freeText: notes,
        notes,
        lensUsed: lensUsed.length ? lensUsed : [suggestedLens, 'overview'],
      })
      setGrade(res.grade)
      toast.success(String(res.grade.narrative ?? 'Submitted'))
    } catch (e) {
      toast.error((e as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [attemptId, focusElementIds, notes, lensUsed, suggestedLens])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }

  if (!pack) {
    return (
      <div className="px-6 py-16 text-center text-ink-muted">Challenge pack missing.</div>
    )
  }

  const starterName =
    chips.find(c => c.elementId === payload.starterFocusId)?.name ??
    String(payload.starterFocusId ?? 'a component')

  return (
    <CategoryShell
      title={pack.title}
      subtitle={String(payload.prompt ?? pack.description)}
      backHref="/design-studio/microscope"
      backLabel="Investigates"
      className="h-[100dvh]"
      contentClassName="min-h-0 flex-1 overflow-hidden"
    >
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        {/* Left: how-to + canvas + answer */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-hairline">
          <div className="shrink-0 space-y-2 border-b border-hairline bg-paper-elevated px-4 py-3">
            <p className="text-[13px] leading-snug text-ink">
              {String(payload.briefing ?? '')}
            </p>
            <ol className="grid gap-1.5 text-[12px] text-ink-muted sm:grid-cols-3">
              <li className="flex gap-2 rounded-md border border-hairline bg-paper px-2 py-1.5">
                <MousePointer2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>
                  <strong className="text-ink">1. Select</strong> — click{' '}
                  <button
                    type="button"
                    className="font-semibold text-brand underline-offset-2 hover:underline"
                    onClick={() =>
                      typeof payload.starterFocusId === 'string' &&
                      focusElement(payload.starterFocusId)
                    }
                  >
                    {starterName}
                  </button>{' '}
                  (or any box)
                </span>
              </li>
              <li className="flex gap-2 rounded-md border border-hairline bg-paper px-2 py-1.5">
                <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>
                  <strong className="text-ink">2. Switch lens</strong> — try{' '}
                  <span className="font-mono text-[11px] text-brand">{suggestedLens}</span> on
                  the right, then click highlighted neighbors
                </span>
              </li>
              <li className="flex gap-2 rounded-md border border-hairline bg-paper px-2 py-1.5">
                <Hand className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>
                  <strong className="text-ink">3. Navigate</strong> — drag empty canvas to pan,
                  scroll to zoom, then write your finding below
                </span>
              </li>
            </ol>
            <div className="flex flex-wrap gap-1.5">
              <span className="self-center font-mono text-[10px] uppercase text-ink-faint">
                Jump to
              </span>
              {chips.map(c => (
                <button
                  key={c.rfId}
                  type="button"
                  onClick={() => focusElement(c.elementId)}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[11px] transition-colors',
                    selectedNode?.elementId === c.elementId
                      ? 'border-brand bg-brand-tint text-brand'
                      : 'border-hairline text-ink-muted hover:border-brand/40',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-[#F8F8F8]">
            <DebuggerCanvas
              diagram={diagram}
              readOnly
              selectedId={selectedId}
              highlightedIds={highlight.highlightIds}
              onSelect={(id, kind) => {
                if (kind === 'edge') return
                focusElement(id)
              }}
              hideEditChrome
              className="h-full"
            />
            <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-paper/90 px-2 py-1 font-mono text-[10px] text-ink-faint shadow-sm">
              Drag background to pan · Scroll to zoom · Click a class to inspect
            </p>
          </div>

          <div className="shrink-0 space-y-2 border-t border-hairline bg-paper p-3">
            <p className="font-mono text-[10px] uppercase text-ink-faint">
              Your answer · inspected {focusElementIds.length} component
              {focusElementIds.length === 1 ? '' : 's'}
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={`e.g. PaymentService depends on PaymentGateway but also creates StripeGateway — that's the concrete leak.`}
              rows={2}
              className="w-full rounded-md border border-hairline bg-paper px-2 py-1.5 text-[13px] outline-none focus:border-brand/40"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-brand-foreground',
                busy && 'opacity-50',
              )}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit investigation
            </button>
            {grade && (
              <div className="rounded-md border border-hairline bg-paper-elevated p-2 text-[13px] text-ink-muted">
                {String(grade.narrative)}
              </div>
            )}
          </div>
        </div>

        {/* Right: microscope instrument */}
        <div className="flex h-[42vh] min-h-0 w-full shrink-0 flex-col border-t border-hairline lg:h-auto lg:w-[min(400px,38%)] lg:border-t-0">
          <MicroscopeSession
            diagram={diagramLike}
            selectedNode={selectedNode}
            overlay={overlay}
            initialLens={suggestedLens}
            guideHint={`Start on ${starterName}. Open the ${suggestedLens} lens, then click each related box on the canvas (or in the lists below).`}
            onFocusElement={id => {
              focusElement(id)
              setLensUsed(prev =>
                prev.includes(suggestedLens) ? prev : [...prev, suggestedLens],
              )
            }}
            onHighlightChange={setHighlight}
            embedded
            className="h-full"
          />
        </div>
      </div>
    </CategoryShell>
  )
}
