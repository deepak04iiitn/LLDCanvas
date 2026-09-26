'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlignLeft,
  Bug,
  Crosshair,
  Loader2,
  Send,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { DebuggerCanvas, traceOutbound } from '@/components/studio/debugger/DebuggerCanvas'
import { MarkIssueForm } from '@/components/studio/debugger/MarkIssueForm'
import { DebugConsole, type ConsoleLogEntry } from '@/components/studio/debugger/DebugConsole'
import { StageBanner } from '@/components/studio/debugger/StageBanner'
import { HintButton } from '@/components/studio/debugger/HintButton'
import { VerifyReport } from '@/components/studio/debugger/VerifyReport'
import { DebugComplete } from '@/components/studio/debugger/DebugComplete'
import { DebuggerWalkthrough, shouldShowWalkthrough } from '@/components/studio/debugger/DebuggerWalkthrough'
import {
  studioApi,
  type DebuggerMark,
  type DebuggerStage,
  type StudioPackDetail,
} from '@/lib/studio-api'
import { cn } from '@/lib/utils'
import type { BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'

export interface DebuggerSessionProps {
  attemptId: string
  breadcrumb?: BreadcrumbSegment[]
}

function labelFor(diagram: { nodes: unknown[]; edges: unknown[] }, elementId: string | null) {
  if (!elementId) return undefined
  for (const n of diagram.nodes as { id?: string; data?: { elementId?: string; name?: string } }[]) {
    const eid = String(n.data?.elementId ?? n.id)
    if (eid === elementId || String(n.id) === elementId) return String(n.data?.name ?? eid)
  }
  return elementId
}

export function DebuggerSession({ attemptId, breadcrumb }: DebuggerSessionProps) {
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState<DebuggerStage | string>('detect')
  const [marks, setMarks] = useState<DebuggerMark[]>([])
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [consoleLog, setConsoleLog] = useState<ConsoleLogEntry[]>([])
  const [diagram, setDiagram] = useState<{ nodes: unknown[]; edges: unknown[] }>({
    nodes: [],
    edges: [],
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [traceIds, setTraceIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [startedAt, setStartedAt] = useState<number>(Date.now())
  const [now, setNow] = useState(Date.now())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  const [markDrawerOpen, setMarkDrawerOpen] = useState(false)

  const payload = (pack?.payload ?? {}) as {
    briefing?: string
    requirement?: string
    revealCount?: 'exact' | 'hidden'
    timeLimitSec?: number
    expectedIssues?: unknown[]
  }

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!loading && stage === 'detect') {
      setShowWalkthrough(shouldShowWalkthrough())
    }
  }, [loading, stage])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled) return
        setPack(res.pack)
        const att = res.attempt
        setStage(att.stage ?? (att.result as { stage?: string })?.stage ?? 'detect')
        setMarks(att.marks ?? [])
        setResult((att.result as Record<string, unknown>) ?? null)
        setHintsUsed(att.hintsUsed ?? 0)
        setConsoleLog((att.consoleLog as ConsoleLogEntry[]) ?? [])
        setStartedAt(
          att.startedAt ? new Date(att.startedAt).getTime() : Date.now(),
        )
        const snap = (att.diagramData ??
          res.pack?.diagramSnapshot ?? { nodes: [], edges: [] }) as {
          nodes?: unknown[]
          edges?: unknown[]
        }
        const nodes = (snap.nodes ?? []).map((n) => {
          const node = n as { id?: string; data?: Record<string, unknown>; elementId?: string; position?: unknown }
          const elementId = String(node.elementId ?? node.data?.elementId ?? node.id)
          return {
            ...node,
            elementId,
            data: { ...node.data, elementId },
          }
        })
        const edges = (snap.edges ?? []).map((e) => {
          const edge = e as { id?: string; data?: Record<string, unknown>; elementId?: string }
          const elementId = String(edge.elementId ?? edge.data?.elementId ?? edge.id)
          return { ...edge, elementId, data: { ...edge.data, elementId } }
        })
        setDiagram({ nodes, edges })
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load session')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const appendLocal = useCallback((level: ConsoleLogEntry['level'], message: string) => {
    setConsoleLog(prev => [...prev, { t: Date.now(), level, message }].slice(-80))
  }, [])

  const markedIds = useMemo(() => marks.map(m => m.elementId), [marks])
  const foundCount = marks.filter(m => m.verdict && m.verdict !== 'miss').length
    || (result?.found as number | undefined)
    || marks.length
  const totalIssues =
    (result?.total as number | undefined) ??
    (Array.isArray(payload.expectedIssues) ? payload.expectedIssues.length : 0)
  const revealExact = payload.revealCount !== 'hidden'

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))
  const limit = payload.timeLimitSec
  const remaining = limit != null ? Math.max(0, limit - elapsed) : null
  const timerLabel =
    remaining != null
      ? `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
      : `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const readOnly = stage === 'detect' || stage === 'diagnose' || stage === 'complete'
  const canMark = stage === 'detect' || stage === 'diagnose'

  const onSelect = useCallback(
    (elementId: string, kind: 'node' | 'edge') => {
      setSelectedId(elementId)
      const path = traceOutbound(diagram, elementId)
      setTraceIds(path)
      appendLocal('info', `Selected ${kind} ${elementId}`)
    },
    [diagram, appendLocal],
  )

  const handleSaveMark = async (body: {
    elementId: string
    category: string
    why: string
  }) => {
    setBusy(true)
    try {
      const res = await studioApi.debuggerSession.mark(attemptId, body)
      setMarks(res.marks)
      setStage(res.stage)
      if (res.consoleLog) setConsoleLog(res.consoleLog as ConsoleLogEntry[])
      else appendLocal('ok', `Issue marked: ${body.category}`)
      toast.success('Mark saved')
      setMarkDrawerOpen(false)
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to save mark')
    } finally {
      setBusy(false)
    }
  }

  const handleDiagnose = async () => {
    if (marks.length === 0) {
      toast.error('Mark at least one issue before submitting diagnosis')
      return
    }
    setBusy(true)
    try {
      const res = await studioApi.debuggerSession.diagnose(attemptId)
      setStage(res.stage)
      setMarks(res.marks)
      setResult(res.result)
      if (res.consoleLog) setConsoleLog(res.consoleLog as ConsoleLogEntry[])
      toast.message('Diagnosis submitted', {
        description: String(res.result?.feedbackSummary ?? ''),
      })
    } catch (err) {
      toast.error((err as Error).message ?? 'Diagnose failed')
    } finally {
      setBusy(false)
    }
  }

  const handleRepair = async () => {
    setBusy(true)
    try {
      const res = await studioApi.debuggerSession.repair(attemptId, {
        diagramData: { version: 1, ...diagram, meta: { theme: 'light' } },
      })
      setStage(res.stage)
      setResult(res.result)
      if (res.consoleLog) setConsoleLog(res.consoleLog as ConsoleLogEntry[])
      toast.success('Repair submitted — verification complete')
    } catch (err) {
      toast.error((err as Error).message ?? 'Repair failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
      </div>
    )
  }

  if (stage === 'complete' && result) {
    return (
      <CategoryShell
        title={pack?.title ?? 'Design Debugger'}
        subtitle="Session complete"
        backHref="/design-studio/debugger"
        backLabel="Challenges"
        breadcrumb={breadcrumb}
      >
        <DebugComplete
          found={Number(result.found ?? foundCount)}
          total={Number(result.total ?? totalIssues)}
          investigationPct={Number(result.investigationPct ?? 0)}
          diagnosisPct={Number(result.diagnosisPct ?? 0)}
          refactoringPct={Number(result.refactoringPct ?? 0)}
          elapsedSec={Number(result.elapsedSec ?? elapsed)}
          hintsUsed={Number(result.hintsUsed ?? hintsUsed)}
          gradedMarks={
            ((result.gradedMarks as DebuggerMark[] | undefined) ?? marks)
          }
          packSlug={pack?.slug ?? ''}
        />
        <VerifyReport
          checks={
            ((result.verificationReport as { checks?: { id: string; ok: boolean; label: string }[] })
              ?.checks ?? [])
          }
          scores={result.scores as { before?: { overall?: number; dimensions?: { key?: string; label?: string; score?: number }[] }; after?: { overall?: number; dimensions?: { key?: string; label?: string; score?: number }[] } }}
          className="mx-auto max-w-2xl pb-12"
        />
      </CategoryShell>
    )
  }

  const bugLabel = revealExact
    ? `${foundCount}/${totalIssues || '?'}`
    : `${marks.length} marked`

  const hasBrief = Boolean(payload.briefing || payload.requirement)

  return (
    <CategoryShell
      title={pack?.title ?? 'Design Debugger'}
      subtitle={pack?.description ?? 'Inspect the diagram, mark what feels wrong, explain why.'}
      backHref="/design-studio/debugger"
      backLabel="Challenges"
      breadcrumb={breadcrumb}
      timer={
        <span className="inline-flex items-center gap-3">
          <span className="tabular-nums">{timerLabel}</span>
          <span className="inline-flex items-center gap-1 text-ink-muted">
            <Bug size={14} /> {bugLabel}
          </span>
        </span>
      }
      contentClassName="min-h-0 flex-1 flex flex-col overflow-hidden"
    >
      <StageBanner stage={stage} />

      {result?.feedbackSummary != null && stage === 'repair' && (
        <div className="shrink-0 border-b border-hairline bg-paper px-4 py-3 sm:px-6">
          <p className="text-[13px] text-ink">{String(result.feedbackSummary)}</p>
          {Array.isArray(result.gradedMarks) && (
            <ul className="mt-2 space-y-1">
              {(result.gradedMarks as DebuggerMark[]).map(m => (
                <li key={m.elementId} className="text-[12px] text-ink-muted">
                  <span
                    className={cn(
                      'font-mono text-[10px] uppercase',
                      m.verdict === 'exact' && 'text-brand',
                      m.verdict === 'partial' && 'text-ink',
                      m.verdict === 'miss' && 'text-ink-faint',
                    )}
                  >
                    {m.verdict}
                  </span>{' '}
                  {m.feedback}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[12px] font-medium text-brand">
            Repair unlocked — introduce the right abstraction and rewire dependencies.
          </p>
        </div>
      )}

      {/* Main canvas area */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1">
          <DebuggerCanvas
            diagram={diagram}
            readOnly={readOnly}
            selectedId={selectedId}
            highlightedIds={traceIds}
            markedIds={markedIds}
            onSelect={onSelect}
            onDiagramChange={d => setDiagram(d)}
            className="h-full"
          />

          {/* Brief collapsible overlay */}
          {briefOpen && hasBrief && (
            <div className="absolute inset-x-0 top-0 z-10 max-h-[45%] overflow-y-auto border-b border-hairline bg-paper/95 backdrop-blur-sm">
              <div className="px-4 py-4 sm:px-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                    Problem brief
                  </p>
                  <button
                    type="button"
                    onClick={() => setBriefOpen(false)}
                    className="rounded p-1 text-ink-faint hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                </div>
                {payload.briefing && (
                  <div className="space-y-2.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">
                    {payload.briefing}
                  </div>
                )}
                {payload.requirement && (
                  <p className="mt-3 border-t border-hairline/60 pt-3 font-medium leading-relaxed text-ink">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                      Your goal ·{' '}
                    </span>
                    {payload.requirement}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mark Issue slide-in drawer */}
          {markDrawerOpen && (
            <div className="absolute inset-y-0 right-0 z-10 w-80 border-l border-hairline bg-paper shadow-lg">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  Mark Issue
                </p>
                <button
                  type="button"
                  onClick={() => setMarkDrawerOpen(false)}
                  className="rounded p-1 text-ink-faint hover:text-ink"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="h-[calc(100%-41px)] overflow-y-auto">
                <MarkIssueForm
                  elementId={selectedId}
                  elementLabel={labelFor(diagram, selectedId)}
                  disabled={!canMark || busy}
                  initialCategory={marks.find(m => m.elementId === selectedId)?.category}
                  initialWhy={marks.find(m => m.elementId === selectedId)?.why}
                  onSave={handleSaveMark}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom action bar */}
        <div className="shrink-0 border-t border-hairline bg-paper-elevated px-3 py-2.5">
          <div className="flex items-center gap-2">
            {/* Brief toggle */}
            {hasBrief && (
              <button
                type="button"
                onClick={() => setBriefOpen(v => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                  briefOpen
                    ? 'bg-brand-tint text-brand'
                    : 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
                )}
              >
                <AlignLeft size={13} strokeWidth={1.75} />
                Brief
              </button>
            )}

            {/* Hint */}
            <HintButton
              attemptId={attemptId}
              elementId={selectedId}
              disabled={stage === 'complete'}
              onHint={(hint, used) => {
                setHintsUsed(used)
                appendLocal('warn', `Hint: ${hint}`)
              }}
            />

            {/* Mark Issue */}
            {canMark && (
              <button
                type="button"
                onClick={() => {
                  if (!selectedId) {
                    toast.info('Click a component in the diagram first')
                    return
                  }
                  setMarkDrawerOpen(v => !v)
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                  markDrawerOpen
                    ? 'bg-brand-tint text-brand'
                    : 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
                )}
              >
                <Crosshair size={13} strokeWidth={1.75} />
                Mark Issue
              </button>
            )}

            {/* Submit */}
            <div className="ml-auto flex gap-2">
              {(stage === 'detect' || stage === 'diagnose') && (
                <button
                  type="button"
                  disabled={busy || marks.length === 0}
                  onClick={handleDiagnose}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={12} />}
                  Submit: {marks.length} issue{marks.length !== 1 ? 's' : ''}
                </button>
              )}
              {stage === 'repair' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleRepair}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={12} />}
                  Submit repair
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DebugConsole entries={consoleLog} />

      {showWalkthrough && (
        <DebuggerWalkthrough onDismiss={() => setShowWalkthrough(false)} />
      )}
    </CategoryShell>
  )
}
