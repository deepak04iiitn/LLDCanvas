'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlignLeft,
  ArrowLeft,
  Bug,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Loader2,
  Send,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { DebuggerCanvas, traceOutbound } from '@/components/studio/debugger/DebuggerCanvas'
import { MarkIssueForm } from '@/components/studio/debugger/MarkIssueForm'
import { type ConsoleLogEntry } from '@/components/studio/debugger/DebugConsole'
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

// ── Stage config ──────────────────────────────────────────────────────────────

const STEPS: { id: DebuggerStage; label: string }[] = [
  { id: 'detect',   label: 'Detect'   },
  { id: 'diagnose', label: 'Diagnose' },
  { id: 'repair',   label: 'Repair'   },
  { id: 'verify',   label: 'Verify'   },
]
const STAGE_ORDER: DebuggerStage[] = ['detect', 'diagnose', 'repair', 'verify', 'complete']

function stageIndex(stage: string) {
  const i = STAGE_ORDER.indexOf(stage as DebuggerStage)
  return i >= 0 ? i : 0
}

function labelFor(diagram: { nodes: unknown[]; edges: unknown[] }, elementId: string | null) {
  if (!elementId) return undefined
  for (const n of diagram.nodes as { id?: string; data?: { elementId?: string; name?: string } }[]) {
    const eid = String(n.data?.elementId ?? n.id)
    if (eid === elementId || String(n.id) === elementId) return String(n.data?.name ?? eid)
  }
  return elementId
}

function fmtTime(t: number) {
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DebuggerSessionProps {
  attemptId: string
  breadcrumb?: BreadcrumbSegment[]
}

// ── Main component ────────────────────────────────────────────────────────────

export function DebuggerSession({ attemptId }: DebuggerSessionProps) {
  const [pack,            setPack]            = useState<StudioPackDetail | null>(null)
  const [loading,         setLoading]         = useState(true)
  const [stage,           setStage]           = useState<DebuggerStage | string>('detect')
  const [marks,           setMarks]           = useState<DebuggerMark[]>([])
  const [result,          setResult]          = useState<Record<string, unknown> | null>(null)
  const [consoleLog,      setConsoleLog]      = useState<ConsoleLogEntry[]>([])
  const [diagram,         setDiagram]         = useState<{ nodes: unknown[]; edges: unknown[] }>({ nodes: [], edges: [] })
  const [selectedId,      setSelectedId]      = useState<string | null>(null)
  const [traceIds,        setTraceIds]        = useState<string[]>([])
  const [busy,            setBusy]            = useState(false)
  const [startedAt,       setStartedAt]       = useState<number>(Date.now())
  const [now,             setNow]             = useState(Date.now())
  const [hintsUsed,       setHintsUsed]       = useState(0)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [briefOpen,          setBriefOpen]          = useState(false)
  const [markDrawerOpen,     setMarkDrawerOpen]     = useState(false)
  const [consoleOpen,        setConsoleOpen]        = useState(false)
  const [feedbackDismissed,  setFeedbackDismissed]  = useState(false)
  const consoleEndRef = useRef<HTMLDivElement>(null)

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
    if (!loading && stage === 'detect') setShowWalkthrough(shouldShowWalkthrough())
  }, [loading, stage])

  useEffect(() => {
    if (consoleOpen) consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consoleLog, consoleOpen])

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
        setStartedAt(att.startedAt ? new Date(att.startedAt).getTime() : Date.now())
        const snap = (att.diagramData ?? res.pack?.diagramSnapshot ?? { nodes: [], edges: [] }) as { nodes?: unknown[]; edges?: unknown[] }
        const nodes = (snap.nodes ?? []).map((n) => {
          const node = n as { id?: string; data?: Record<string, unknown>; elementId?: string }
          const elementId = String(node.elementId ?? node.data?.elementId ?? node.id)
          return { ...node, elementId, data: { ...node.data, elementId } }
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
    return () => { cancelled = true }
  }, [attemptId])

  const appendLocal = useCallback((level: ConsoleLogEntry['level'], message: string) => {
    setConsoleLog(prev => [...prev, { t: Date.now(), level, message }].slice(-80))
  }, [])

  const markedIds  = useMemo(() => marks.map(m => m.elementId), [marks])
  const foundCount = marks.filter(m => m.verdict && m.verdict !== 'miss').length
    || (result?.found as number | undefined) || marks.length
  const totalIssues = (result?.total as number | undefined)
    ?? (Array.isArray(payload.expectedIssues) ? payload.expectedIssues.length : 0)
  const revealExact = payload.revealCount !== 'hidden'

  const elapsed   = Math.max(0, Math.floor((now - startedAt) / 1000))
  const limit     = payload.timeLimitSec
  const remaining = limit != null ? Math.max(0, limit - elapsed) : null
  const timerLabel = remaining != null
    ? `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
    : `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const readOnly  = stage === 'detect' || stage === 'diagnose' || stage === 'complete'
  const canMark   = stage === 'detect' || stage === 'diagnose'
  const hasBrief  = Boolean(payload.briefing || payload.requirement)
  const bugLabel  = revealExact ? `${foundCount}/${totalIssues || '?'}` : `${marks.length} marked`
  const lastLog   = consoleLog[consoleLog.length - 1]

  const onSelect = useCallback((elementId: string, kind: 'node' | 'edge') => {
    setSelectedId(elementId)
    setTraceIds(traceOutbound(diagram, elementId))
    appendLocal('info', `Selected ${kind} ${elementId}`)
    // Auto-open mark drawer so the user can immediately classify the element
    if (canMark) setMarkDrawerOpen(true)
  }, [diagram, appendLocal, canMark])

  const handleSaveMark = async (body: { elementId: string; category: string; why: string }) => {
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
    if (marks.length === 0) { toast.error('Mark at least one issue before submitting'); return }
    setBusy(true)
    try {
      const res = await studioApi.debuggerSession.diagnose(attemptId)
      setStage(res.stage)
      setMarks(res.marks)
      setResult(res.result)
      if (res.consoleLog) setConsoleLog(res.consoleLog as ConsoleLogEntry[])
      toast.message('Diagnosis submitted', { description: String(res.result?.feedbackSummary ?? '') })
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

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
      </div>
    )
  }

  // ── Complete state ────────────────────────────────────────────────────────

  if (stage === 'complete' && result) {
    return (
      <div className="h-full overflow-y-auto bg-paper">
        <div className="sticky top-0 z-10 border-b border-hairline bg-paper/95 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/design-studio/debugger/problems"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-faint hover:text-ink transition-colors"
            >
              <ArrowLeft size={13} /> Challenges
            </Link>
            <span className="text-hairline-strong">|</span>
            <p className="font-serif text-[15px] font-medium text-ink">{pack?.title}</p>
          </div>
        </div>
        <DebugComplete
          found={Number(result.found ?? foundCount)}
          total={Number(result.total ?? totalIssues)}
          investigationPct={Number(result.investigationPct ?? 0)}
          diagnosisPct={Number(result.diagnosisPct ?? 0)}
          refactoringPct={Number(result.refactoringPct ?? 0)}
          elapsedSec={Number(result.elapsedSec ?? elapsed)}
          hintsUsed={Number(result.hintsUsed ?? hintsUsed)}
          gradedMarks={((result.gradedMarks as DebuggerMark[] | undefined) ?? marks)}
          packSlug={pack?.slug ?? ''}
        />
        <VerifyReport
          checks={((result.verificationReport as { checks?: { id: string; ok: boolean; label: string }[] })?.checks ?? [])}
          scores={result.scores as Parameters<typeof VerifyReport>[0]['scores']}
          className="mx-auto max-w-2xl pb-12"
        />
      </div>
    )
  }

  const currentStep = stageIndex(stage)

  // ── Session UI ────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center h-12 border-b border-hairline bg-paper px-4 gap-0">

        {/* Left — back + title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard/design-studio/debugger/problems"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            Challenges
          </Link>
          <span className="h-4 w-px bg-hairline-strong shrink-0" />
          <div className="min-w-0">
            <p className="font-serif text-[14px] font-medium text-ink leading-tight truncate">
              {pack?.title ?? 'Design Debugger'}
            </p>
          </div>
        </div>

        {/* Center — stage progress */}
        <div className="flex items-center gap-0 shrink-0 mx-4">
          {STEPS.map((step, i) => {
            const active = i === currentStep || (stage === 'complete' && step.id === 'verify')
            const done   = i < currentStep || stage === 'complete'
            return (
              <div key={step.id} className="flex items-center">
                {i > 0 && (
                  <span className="text-hairline-strong text-[10px] mx-1.5">→</span>
                )}
                <span className={cn(
                  'px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wide transition-all',
                  active && 'bg-ink text-paper',
                  done && !active && 'text-ink/40',
                  !done && !active && 'text-ink-faint',
                )}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Right — timer + bug count */}
        <div className="flex items-center gap-4 shrink-0 flex-1 justify-end">
          <span className="font-mono text-[13px] tabular-nums text-ink-muted">{timerLabel}</span>
          <div className="flex items-center gap-1.5 font-mono text-[12px] text-ink-muted">
            <Bug size={13} />
            <span>{bugLabel}</span>
          </div>
        </div>
      </header>

      {/* ── DIAGNOSIS FEEDBACK (repair stage) ─────────────────────────────── */}
      {result?.feedbackSummary != null && stage === 'repair' && !feedbackDismissed && (
        <div className="shrink-0 border-b border-hairline bg-amber-50/60 px-6 py-3 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-ink leading-relaxed">{String(result.feedbackSummary)}</p>
            <p className="mt-1.5 text-[12px] font-medium text-brand">
              Repair unlocked — introduce the right abstraction and rewire dependencies.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackDismissed(true)}
            className="shrink-0 mt-0.5 rounded-md p-1 text-ink-faint hover:bg-amber-100 hover:text-ink transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── CANVAS (main area) ────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
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

        {/* ── Canvas hint (when nothing selected) ───────────────────────── */}
        {canMark && !markDrawerOpen && !selectedId && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-hairline bg-paper/90 px-4 py-2 shadow-sm backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-brand animate-pulse" />
              <p className="font-mono text-[11px] text-ink-muted whitespace-nowrap">
                Click any class or relationship to mark an issue
              </p>
            </div>
          </div>
        )}

        {/* ── Brief sheet (slides from top) ─────────────────────────────── */}
        {briefOpen && hasBrief && (
          <div className="absolute inset-x-0 top-0 z-20">
            <div className="mx-auto max-w-xl mt-3 rounded-2xl border border-hairline bg-paper shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Problem Brief
                </p>
                <button
                  type="button"
                  onClick={() => setBriefOpen(false)}
                  className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="px-5 py-4 max-h-[70vh] overflow-y-auto space-y-3">
                {payload.briefing && (
                  <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">
                    {payload.briefing}
                  </p>
                )}
                {payload.requirement && (
                  <div className="pt-3 border-t border-hairline">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-1">Your goal</p>
                    <p className="text-[13px] font-medium text-ink leading-relaxed">
                      {payload.requirement}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Mark Issue panel (slides from right) ──────────────────────── */}
        {markDrawerOpen && (
          <div className="absolute top-0 right-0 bottom-0 z-20 w-96 border-l border-hairline bg-paper shadow-xl flex flex-col">
            <div className="flex items-center justify-between shrink-0 border-b border-hairline px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                Mark Issue
              </p>
              <button
                type="button"
                onClick={() => setMarkDrawerOpen(false)}
                className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
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

        {/* ── Console strip (expands from bottom of canvas) ─────────────── */}
        {consoleOpen && (
          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-hairline bg-paper-elevated flex flex-col max-h-44">
            <div className="shrink-0 flex items-center justify-between px-4 py-1.5 border-b border-hairline">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Debug Console</p>
              <button onClick={() => setConsoleOpen(false)} className="text-ink-faint hover:text-ink transition-colors">
                <ChevronDown size={13} />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5 font-mono text-[11px]">
              {consoleLog.length === 0 && (
                <li className="text-ink-faint">No events yet.</li>
              )}
              {consoleLog.map((e, i) => (
                <li key={`${e.t}-${i}`} className="flex gap-2 leading-relaxed">
                  <span className="shrink-0 text-ink-faint">{fmtTime(e.t)}</span>
                  <span className={cn(
                    'uppercase shrink-0',
                    e.level === 'ok' && 'text-emerald-600',
                    e.level === 'warn' && 'text-amber-600',
                    e.level === 'info' && 'text-ink-muted',
                  )}>{e.level}</span>
                  <span className="text-ink">{e.message}</span>
                </li>
              ))}
              <div ref={consoleEndRef} />
            </ul>
          </div>
        )}
      </div>

      {/* ── BOTTOM ACTION BAR ─────────────────────────────────────────────── */}
      <div className="shrink-0 h-12 flex items-center border-t border-hairline bg-paper px-4 gap-2">

        {/* Left — Brief + Hint */}
        <div className="flex items-center gap-1">
          {hasBrief && (
            <button
              type="button"
              onClick={() => setBriefOpen(v => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                briefOpen
                  ? 'bg-ink text-paper'
                  : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
              )}
            >
              <AlignLeft size={13} />
              Brief
            </button>
          )}
          <HintButton
            attemptId={attemptId}
            elementId={selectedId}
            disabled={stage === 'complete'}
            onHint={(hint, used) => {
              setHintsUsed(used)
              appendLocal('warn', `Hint: ${hint}`)
            }}
          />
        </div>

        {/* Center — console last message (click to expand) */}
        <button
          type="button"
          onClick={() => setConsoleOpen(v => !v)}
          className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-paper-elevated transition-colors group"
        >
          {lastLog ? (
            <>
              <span className={cn(
                'font-mono text-[10px] uppercase shrink-0',
                lastLog.level === 'ok' && 'text-emerald-600',
                lastLog.level === 'warn' && 'text-amber-600',
                lastLog.level === 'info' && 'text-ink-faint',
              )}>
                {lastLog.level}
              </span>
              <span className="font-mono text-[11px] text-ink-muted truncate">{lastLog.message}</span>
            </>
          ) : (
            <span className="font-mono text-[11px] text-ink-faint">Console</span>
          )}
          {consoleOpen
            ? <ChevronDown size={12} className="shrink-0 text-ink-faint ml-auto" />
            : <ChevronUp   size={12} className="shrink-0 text-ink-faint ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>

        {/* Right — Mark Issue + Submit */}
        <div className="flex items-center gap-2 shrink-0">
          {canMark && (
            <button
              type="button"
              onClick={() => setMarkDrawerOpen(v => !v)}
              className={cn(
                'relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                markDrawerOpen
                  ? 'bg-ink text-paper'
                  : selectedId
                    ? 'bg-ink/10 text-ink ring-1 ring-ink/20'
                    : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
              )}
            >
              <Crosshair size={13} />
              Mark Issue
              {/* Pulsing dot when element is selected but drawer is closed */}
              {selectedId && !markDrawerOpen && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-paper">
                  <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-75" />
                </span>
              )}
            </button>
          )}

          {(stage === 'detect' || stage === 'diagnose') && (
            <button
              type="button"
              disabled={busy || marks.length === 0}
              onClick={handleDiagnose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Submit · {marks.length}
            </button>
          )}
          {stage === 'repair' && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRepair}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Submit Repair
            </button>
          )}
        </div>
      </div>

      {showWalkthrough && (
        <DebuggerWalkthrough onDismiss={() => setShowWalkthrough(false)} />
      )}
    </div>
  )
}
