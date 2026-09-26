'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { DependencyWebSession } from '@/components/studio/dependency-web/DependencyWebSession'
import { InvestigationProtocol, type ProtocolKey } from '@/components/studio/analysis/InvestigationProtocol'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import type { DepWebOverlay } from '@/lib/graph/dependencyWeb'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

function lensToProtocol(lens: string): ProtocolKey {
  if (lens === 'responsibilities') return 'responsibility'
  if (lens === 'layers') return 'layer'
  if (lens === 'cycles' || lens === 'cycle') return 'cycle'
  return 'coupling'
}

export function DepWebChallengeSession({ attemptId }: { attemptId: string }) {
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [focusIds, setFocusIds] = useState<string[]>([])
  const [pathIds, setPathIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [grade, setGrade] = useState<Record<string, unknown> | null>(null)
  const [guideOpen, setGuideOpen] = useState(true)

  const payload = (pack?.payload ?? {}) as Record<string, unknown>
  const protocolKey = lensToProtocol(String(payload.suggestedLens ?? 'dependencies'))

  const diagram = useMemo<DiagramLike>(() => {
    const snap = (pack?.diagramSnapshot ?? { nodes: [], edges: [] }) as {
      nodes?: unknown[]
      edges?: unknown[]
    }
    return {
      nodes: (snap.nodes ?? []) as DiagramLike['nodes'],
      edges: (snap.edges ?? []) as DiagramLike['edges'],
    }
  }, [pack])

  const overlay = useMemo<DepWebOverlay>(
    () => ({
      layers: (payload.layers as DepWebOverlay['layers']) ?? {},
      externalIds: Array.isArray(payload.externalIds)
        ? (payload.externalIds as string[])
        : [],
      flows: Array.isArray(payload.flows) ? (payload.flows as DepWebOverlay['flows']) : [],
    }),
    [payload],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled || !res.pack) return
        setPack(res.pack)
        const pl = res.pack.payload as Record<string, unknown>
        if (typeof pl.starterFocusId === 'string') setFocusIds([pl.starterFocusId])
        const progress = (res.attempt as { progress?: Record<string, unknown> })?.progress
        if (typeof progress?.notes === 'string') setNotes(progress.notes)
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

  const submit = useCallback(async () => {
    setBusy(true)
    try {
      const res = await studioApi.submitDepWeb(attemptId, {
        focusElementIds: focusIds,
        pathIds,
        freeText: notes,
        notes,
        lensUsed: [String(payload.suggestedLens ?? 'overview')],
      })
      setGrade(res.grade)
      toast.success(String(res.grade.narrative ?? 'Submitted'))
    } catch (e) {
      toast.error((e as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [attemptId, focusIds, pathIds, notes, payload.suggestedLens])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }
  if (!pack) {
    return <div className="px-6 py-16 text-center text-ink-muted">Pack missing.</div>
  }

  const pathQuery = payload.pathQuery as { from?: string; to?: string } | undefined

  return (
    <CategoryShell
      title={pack.title}
      subtitle={String(payload.prompt ?? pack.description)}
      backHref="/design-studio/depweb"
      backLabel="Challenges"
      className="h-[100dvh]"
      contentClassName="min-h-0 flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex min-h-0 flex-1">
        {/* Collapsible Investigation Guide panel */}
        {guideOpen ? (
          <aside className="w-60 shrink-0 overflow-y-auto border-r border-hairline bg-paper">
            <div className="flex items-center justify-between border-b border-hairline px-3 py-2.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Investigation Guide
              </p>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="rounded p-0.5 text-ink-faint hover:text-ink"
                title="Close guide"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="p-3">
              <InvestigationProtocol
                protocol={protocolKey}
                packType="depweb"
              />
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="shrink-0 border-r border-hairline bg-paper-elevated px-1.5 hover:bg-hairline/40"
            title="Show Investigation Guide"
          >
            <ChevronRight size={14} className="text-ink-faint" />
          </button>
        )}

        {/* Dependency web graph fills remaining space */}
        <div className="min-h-0 flex-1">
          <DependencyWebSession
            diagram={diagram}
            overlay={overlay}
            initialFocusId={
              typeof payload.starterFocusId === 'string' ? payload.starterFocusId : null
            }
            guided
            guideText={
              pathQuery
                ? `${String(payload.briefing ?? '')} Path challenge: ${pathQuery.from} → ${pathQuery.to}.`
                : String(payload.briefing ?? '')
            }
            evolutionCounts={[
              { label: 'V1', edges: 8 },
              { label: 'V4', edges: diagram.edges?.length ?? 0 },
            ]}
            onFocusElement={id => {
              setFocusIds(prev => (prev.includes(id) ? prev : [...prev, id]))
              setPathIds(prev => (prev.includes(id) ? prev : [...prev, id]))
            }}
          />
        </div>
      </div>

      {/* Always-visible bottom bar */}
      <div className="shrink-0 border-t border-hairline bg-paper-elevated px-3 py-3">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="What did the web reveal?"
          rows={2}
          className="mb-2 w-full rounded-md border border-hairline bg-paper px-2 py-1.5 text-[13px] outline-none focus:border-brand/40"
        />
        <div className="flex items-center justify-between gap-3">
          {grade && (
            <p className="flex-1 text-[13px] text-ink-muted">{String(grade.narrative)}</p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className={cn(
              'ml-auto inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white',
              busy && 'opacity-50',
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit investigation
          </button>
        </div>
      </div>
    </CategoryShell>
  )
}
