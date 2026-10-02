'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Eraser,
  Hand,
  Loader2,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  Redo2,
  RotateCcw,
  Send,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { DebuggerCanvas, type DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import { StagePressureCard } from '@/components/studio/evolution/StagePressureCard'
import { PressurePicker } from '@/components/studio/evolution/PressurePicker'
import { EvolveOrHold } from '@/components/studio/evolution/EvolveOrHold'
import { EvolutionComplete } from '@/components/studio/evolution/EvolutionComplete'
import { GuidedModeOverlay } from '@/components/studio/evolution/GuidedModeOverlay'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'
import type { BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'

export interface EvolutionSessionProps {
  attemptId: string
  breadcrumb?: BreadcrumbSegment[]
}

type Gate = 'context' | 'decide' | 'edit' | 'result' | 'complete'

interface EvoStage {
  id: string
  dayLabel: string
  title: string
  category?: string
  narrative: string
  metrics?: { users?: number; ordersPerDay?: number; latencyMs?: number; availability?: string }
  pressureOptions: string[]
  expectedPressures?: string[]
  mustChange: boolean
  doNothingHint?: string
  debtOpportunity?: { id: string; prompt: string; costIfDeferred: string; laterStageId?: string }
  introduceCatalog?: { namePattern: string; benefits: string[]; costs: string[] }[]
  complexityBudget?: number
  approachHints?: string[]
}

function normalizeDiagram(raw: unknown): DebuggerDiagram {
  const snap = (raw ?? { nodes: [], edges: [] }) as { nodes?: unknown[]; edges?: unknown[] }
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

function cloneDiagram(d: DebuggerDiagram): DebuggerDiagram {
  return JSON.parse(JSON.stringify(d)) as DebuggerDiagram
}

function nodeName(n: unknown): string {
  const node = n as { data?: { name?: string }; id?: string }
  return String(node.data?.name ?? node.id ?? 'Class')
}

export function EvolutionSession({ attemptId }: EvolutionSessionProps) {
  const router = useRouter()

  const [pack,             setPack]             = useState<StudioPackDetail | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [gate,             setGate]             = useState<Gate>('context')
  const [stageIndex,       setStageIndex]       = useState(0)
  const [baseline,         setBaseline]         = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working,          setWorking]          = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack,        setUndoStack]        = useState<DebuggerDiagram[]>([])
  const [redoStack,        setRedoStack]        = useState<DebuggerDiagram[]>([])
  const [selectedId,       setSelectedId]       = useState<string | null>(null)
  const [busy,             setBusy]             = useState(false)
  const [pressures,        setPressures]        = useState<string[]>([])
  const [decision,         setDecision]         = useState<'change' | 'noop' | null>(null)
  const [lastGrade,        setLastGrade]        = useState<Record<string, unknown> | null>(null)
  const [versions,         setVersions]         = useState<Record<string, unknown>[]>([])
  const [decisionLog,      setDecisionLog]      = useState<Record<string, unknown>[]>([])
  const [debt,             setDebt]             = useState<{ open: string[]; resolved: string[]; score: number }>({ open: [], resolved: [], score: 0 })
  const [journeyIndex,     setJourneyIndex]     = useState(0)
  const [startedAt]                             = useState(Date.now())
  const [now,              setNow]              = useState(Date.now())
  const [showGuidedOverlay,setShowGuidedOverlay]= useState(false)

  // Canvas + UI state
  const [canvasMode,        setCanvasMode]       = useState<'pan' | 'select' | 'eraser'>('select')
  const [baselineCollapsed, setBaselineCollapsed]= useState(false)
  const [briefPanelOpen,    setBriefPanelOpen]   = useState(false)
  const [hintDismissed,     setHintDismissed]    = useState(false)

  const payload = (pack?.payload ?? {}) as {
    briefing?: string
    stages?: EvoStage[]
    checkpoints?: EvoStage[]
    guidedMode?: boolean
  }
  const stages: EvoStage[] = useMemo(
    () => payload.stages ?? payload.checkpoints ?? [],
    [payload.stages, payload.checkpoints],
  )
  const stage = stages[stageIndex]

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const resetStageForm = useCallback(() => {
    setPressures([])
    setDecision(null)
    setLastGrade(null)
    setUndoStack([])
    setRedoStack([])
    setSelectedId(null)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled) return
        if (!res.pack) return
        setPack(res.pack)
        const snap = normalizeDiagram(res.pack.diagramSnapshot)
        const progress = (res.attempt as { progress?: Record<string, unknown> })?.progress
        const vers = Array.isArray(progress?.versions) ? (progress!.versions as Record<string, unknown>[]) : []
        const idx  = typeof progress?.stageIndex === 'number' ? progress.stageIndex : 0
        const lastDiagram = vers.length > 0 ? normalizeDiagram(vers[vers.length - 1]?.diagram ?? snap) : snap
        setBaseline(lastDiagram)
        setWorking(cloneDiagram(lastDiagram))
        setStageIndex(idx)
        setVersions(vers)
        setDecisionLog(Array.isArray(progress?.decisionLog) ? (progress!.decisionLog as Record<string, unknown>[]) : [])
        const d = progress?.debt as { open?: string[]; resolved?: string[]; score?: number } | undefined
        setDebt({ open: d?.open ?? [], resolved: d?.resolved ?? [], score: d?.score ?? 0 })
        if ((res.attempt as { status?: string })?.status === 'submitted') {
          setGate('complete')
          setJourneyIndex(Math.max(0, vers.length - 1))
        } else if (idx === 0 && vers.length <= 1) {
          setGate('context')
        } else {
          setGate('decide')
        }
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [attemptId])

  const componentNames = useMemo(() => (working.nodes ?? []).map(nodeName), [working.nodes])

  const pushUndo = useCallback((prev: DebuggerDiagram) => {
    setUndoStack(s => [...s.slice(-19), cloneDiagram(prev)])
    setRedoStack([])
  }, [])

  const onWorkingChange = useCallback((next: DebuggerDiagram) => {
    setWorking(prev => { pushUndo(prev); return next })
  }, [pushUndo])

  const onUndo = useCallback(() => {
    setUndoStack(s => {
      if (!s.length) return s
      const prev = s[s.length - 1]
      setWorking(cur => { setRedoStack(r => [...r.slice(-19), cloneDiagram(cur)]); return prev })
      return s.slice(0, -1)
    })
  }, [])

  const onRedo = useCallback(() => {
    setRedoStack(s => {
      if (!s.length) return s
      const next = s[s.length - 1]
      setWorking(cur => { setUndoStack(u => [...u.slice(-19), cloneDiagram(cur)]); return next })
      return s.slice(0, -1)
    })
  }, [])

  const addNode = useCallback((nodeType: 'class' | 'interface') => {
    const id = `n-${nanoid(6)}`
    const elementId = `el-${nanoid(6)}`
    onWorkingChange({
      nodes: [...(working.nodes ?? []),
        { id, position: { x: 120 + Math.random() * 200, y: 80 + Math.random() * 160 },
          data: { elementId, nodeType, name: nodeType === 'interface' ? 'NewInterface' : 'NewClass', methods: [], attributes: [] } }],
      edges: working.edges ?? [],
    })
  }, [working, onWorkingChange])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    const nextNodes = (working.nodes ?? []).filter(n => {
      const node = n as { id?: string; data?: { elementId?: string } }
      return node.id !== selectedId && node.data?.elementId !== selectedId
    })
    const ids = new Set(nextNodes.map(n => String((n as { id?: string }).id)))
    const nextEdges = (working.edges ?? []).filter(e => {
      const edge = e as { id?: string; source?: string; target?: string; data?: { elementId?: string } }
      if (edge.id === selectedId || edge.data?.elementId === selectedId) return false
      return ids.has(String(edge.source)) && ids.has(String(edge.target))
    })
    onWorkingChange({ nodes: nextNodes, edges: nextEdges })
    setSelectedId(null)
  }, [selectedId, working, onWorkingChange])

  const onEraseNode = useCallback((rfNodeId: string) => {
    const nodes = (working.nodes ?? []) as { id?: string }[]
    const edges = (working.edges ?? []) as { id?: string; source?: string; target?: string }[]
    onWorkingChange({ nodes: nodes.filter(n => String(n.id) !== rfNodeId), edges: edges.filter(e => e.source !== rfNodeId && e.target !== rfNodeId) })
  }, [working, onWorkingChange])

  const onEraseEdge = useCallback((rfEdgeId: string) => {
    const edges = (working.edges ?? []) as { id?: string }[]
    onWorkingChange({ nodes: working.nodes, edges: edges.filter(e => String(e.id) !== rfEdgeId) })
  }, [working, onWorkingChange])

  const submitStage = async (forced?: 'change' | 'noop') => {
    const d = forced ?? decision
    if (!d) { toast.error('Choose Hold or Evolve first'); return }
    if (pressures.length === 0) { toast.error('Select at least one architectural pressure'); return }
    setBusy(true)
    try {
      await studioApi.saveEvolution(attemptId, working).catch(() => undefined)
      const res = await studioApi.submitEvolutionStage(attemptId, {
        decision: d,
        pressures: [...pressures],
        classify: { keep: componentNames, change: [], introduce: [], remove: [] },
        diagramData: d === 'change' ? working : undefined,
        why: [],
        whyNote: undefined,
        tradeoffsAck: (stage?.introduceCatalog ?? []).map(i => i.namePattern),
        debtActions: stage?.debtOpportunity ? [{ id: stage.debtOpportunity.id, action: 'fix' as const }] : [],
      })
      setLastGrade(res.grade)
      const prog = res.progress as { versions?: Record<string, unknown>[]; decisionLog?: Record<string, unknown>[]; debt?: { open: string[]; resolved: string[]; score: number }; stageIndex?: number }
      setVersions(prog.versions ?? [])
      setDecisionLog(prog.decisionLog ?? [])
      if (prog.debt) setDebt(prog.debt)
      setStageIndex(res.nextStageIndex)
      if (res.complete) {
        toast.success('Track complete')
        setGate('complete')
        setJourneyIndex(Math.max(0, (prog.versions?.length ?? 1) - 1))
        if (typeof window !== 'undefined' && !localStorage.getItem('evolution_first_run')) {
          localStorage.setItem('evolution_first_run', 'done')
          setShowGuidedOverlay(true)
        }
      } else {
        setGate('result')
      }
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  const continueAfterStage = () => {
    if (!lastGrade?.accepted) { resetStageForm(); setGate('decide'); return }
    if (stageIndex >= stages.length) { setGate('complete'); return }
    resetStageForm()
    const nextDiag = normalizeDiagram((versions[versions.length - 1] as { diagram?: unknown })?.diagram ?? working)
    setBaseline(nextDiag)
    setWorking(cloneDiagram(nextDiag))
    setGate('context')
  }

  const elapsed    = Math.floor((now - startedAt) / 1000)
  const timerLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading session…</span>
      </div>
    )
  }

  // ── Complete ─────────────────────────────────────────────────────────────

  if (gate === 'complete') {
    return (
      <div className="h-full overflow-y-auto bg-paper">
        {showGuidedOverlay && (
          <GuidedModeOverlay
            onDismiss={() => { setShowGuidedOverlay(false); router.push('/design-studio/evolution') }}
            onTryFullMode={() => { setShowGuidedOverlay(false); router.push('/design-studio/evolution') }}
          />
        )}
        <div className="sticky top-0 z-10 border-b border-hairline bg-paper/95 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/design-studio/evolution/problems" className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-faint hover:text-ink transition-colors">
              <ArrowLeft size={13} /> Tracks
            </Link>
            <span className="h-4 w-px bg-hairline-strong" />
            <p className="font-serif text-[15px] font-medium text-ink">{pack?.title}</p>
            <span className="ml-2 rounded-full bg-teal-100 text-teal-700 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide">
              Complete
            </span>
          </div>
        </div>
        <EvolutionComplete
          versions={versions as never[]}
          decisionLog={decisionLog as never[]}
          debt={debt}
          selectedIndex={journeyIndex}
          onSelectVersion={setJourneyIndex}
          packSlug={pack?.slug ?? ''}
        />
      </div>
    )
  }

  // ── Shared header ────────────────────────────────────────────────────────

  const Header = (
    <header className="shrink-0 flex items-center h-12 border-b border-hairline bg-paper px-4 gap-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link href="/design-studio/evolution/problems"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors shrink-0">
          <ArrowLeft size={13} /> Tracks
        </Link>
        <span className="h-4 w-px bg-hairline-strong shrink-0" />
        <p className="font-serif text-[14px] font-medium text-ink leading-tight truncate min-w-0">
          {pack?.title ?? 'Architecture Evolution'}
        </p>
      </div>

      {/* Stage pills */}
      <div className="flex items-center gap-0 shrink-0 mx-4 overflow-x-auto max-w-md">
        {stages.map((s, i) => {
          const isDone    = i < versions.length - 1
          const isCurrent = i === stageIndex
          return (
            <div key={s.id} className="flex items-center shrink-0">
              {i > 0 && <span className="text-hairline-strong text-[10px] mx-1">→</span>}
              <span className={cn(
                'px-2 py-1 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wide transition-all whitespace-nowrap',
                isCurrent && 'bg-ink text-paper',
                isDone && !isCurrent && 'text-ink/40',
                !isDone && !isCurrent && 'text-ink-faint',
              )}>
                {s.dayLabel}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 shrink-0 flex-1 justify-end">
        {(gate === 'edit' || gate === 'decide') && (
          <span className="font-mono text-[13px] tabular-nums text-ink-muted">{timerLabel}</span>
        )}
      </div>
    </header>
  )

  // ── CONTEXT gate ─────────────────────────────────────────────────────────

  if (gate === 'context' && stage) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}
        <div className="flex-1 min-h-0 flex">

          {/* Left: Baseline canvas */}
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">
                {stageIndex === 0 ? 'Starting design · v1' : `Version ${stageIndex} · current state`}
              </span>
            </div>
            <DebuggerCanvas diagram={baseline} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
          </div>

          {/* Right: Context panel */}
          <div className="w-96 shrink-0 flex flex-col border-l border-hairline bg-paper">
            <div className="shrink-0 px-5 py-4 border-b border-hairline">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-1">{stage.dayLabel}{stage.category ? ` · ${stage.category}` : ''}</p>
              <h2 className="font-serif text-[18px] font-medium text-ink leading-snug">{stage.title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Track brief — only stage 0 */}
              {stageIndex === 0 && payload.briefing && (
                <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-teal-600 mb-2">Track brief</p>
                  <p className="text-[13px] text-ink leading-relaxed whitespace-pre-line">{payload.briefing}</p>
                </div>
              )}

              {/* Narrative */}
              <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">What changed in the world</p>
                <p className="text-[13px] text-ink leading-relaxed whitespace-pre-line">{stage.narrative}</p>
              </div>

              {/* Metrics */}
              {stage.metrics && (
                <div className="grid grid-cols-2 gap-px bg-hairline border border-hairline rounded-xl overflow-hidden">
                  {stage.metrics.users != null && (
                    <div className="bg-paper-elevated px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Users</p>
                      <p className="font-mono text-[15px] font-semibold text-ink tabular-nums mt-0.5">{stage.metrics.users.toLocaleString()}</p>
                    </div>
                  )}
                  {stage.metrics.ordersPerDay != null && (
                    <div className="bg-paper-elevated px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Orders / day</p>
                      <p className="font-mono text-[15px] font-semibold text-ink tabular-nums mt-0.5">{stage.metrics.ordersPerDay.toLocaleString()}</p>
                    </div>
                  )}
                  {stage.metrics.latencyMs != null && (
                    <div className="bg-paper-elevated px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">p95 latency</p>
                      <p className="font-mono text-[15px] font-semibold text-ink tabular-nums mt-0.5">{stage.metrics.latencyMs} ms</p>
                    </div>
                  )}
                  {stage.metrics.availability && (
                    <div className="bg-paper-elevated px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Availability</p>
                      <p className="font-mono text-[15px] font-semibold text-ink mt-0.5">{stage.metrics.availability}</p>
                    </div>
                  )}
                </div>
              )}

              {/* What to do */}
              <div className="rounded-xl border border-hairline overflow-hidden">
                {[
                  { n: '1', title: 'Study the canvas', body: 'Understand the current state of the architecture on the left.' },
                  { n: '2', title: 'Identify pressures', body: 'On the next screen, pick which architectural pressures this situation creates.' },
                  { n: '3', title: 'Decide: evolve or hold', body: 'Choose whether the architecture needs to change, or can survive as-is.' },
                ].map((s, i) => (
                  <div key={s.n} className={cn('flex items-start gap-4 px-4 py-3.5', i > 0 && 'border-t border-hairline')}>
                    <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full border border-hairline flex items-center justify-center">
                      <span className="font-mono text-[10px] text-ink-faint">{s.n}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{s.title}</p>
                      <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-hairline bg-paper-elevated">
              <button type="button" onClick={() => setGate('decide')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-all active:scale-[0.98]">
                Begin {stage.dayLabel} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── DECIDE gate ──────────────────────────────────────────────────────────

  if (gate === 'decide' && stage) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}
        <div className="flex-1 min-h-0 flex">

          {/* Left: Baseline canvas */}
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">
                Current state · for reference
              </span>
            </div>
            <DebuggerCanvas diagram={baseline} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
          </div>

          {/* Right: Decide panel */}
          <div className="w-[440px] shrink-0 flex flex-col border-l border-hairline bg-paper">
            <div className="shrink-0 px-5 py-4 border-b border-hairline">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-1">{stage.dayLabel} · Pressure analysis</p>
              <h2 className="font-serif text-[18px] font-medium text-ink leading-snug">{stage.title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              <PressurePicker
                options={stage.pressureOptions}
                selected={new Set(pressures)}
                  onToggle={p => setPressures(prev =>
                    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                  )}
              />
              <div className="border-t border-hairline">
                <EvolveOrHold
                  mustChange={stage.mustChange}
                  doNothingHint={stage.doNothingHint}
                  decision={decision}
                  onDecide={d => { setDecision(d); if (d === 'change') setGate('edit') }}
                />
              </div>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-hairline bg-paper-elevated flex items-center gap-3">
              <button type="button" onClick={() => setGate('context')} className="text-[12px] text-ink-faint hover:text-ink transition-colors">
                ← Back
              </button>
              {decision === 'noop' && (
                <button type="button" disabled={busy || pressures.length === 0} onClick={() => void submitStage('noop')}
                  className="ml-auto inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-all">
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Confirm hold
                </button>
              )}
              {decision === 'change' && (
                <button type="button" disabled={pressures.length === 0} onClick={() => setGate('edit')}
                  className="ml-auto inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-all">
                  Edit design <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── EDIT gate ────────────────────────────────────────────────────────────

  if (gate === 'edit' && stage) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}

        {/* Toolbar */}
        <div className="shrink-0 flex items-center gap-0.5 h-10 border-b border-hairline bg-paper-elevated px-3">
          <div className="flex items-center gap-0.5 rounded-lg border border-hairline bg-paper p-0.5 mr-2">
            {([
              { id: 'pan',    icon: Hand,          label: 'Pan'    },
              { id: 'select', icon: MousePointer2, label: 'Select' },
              { id: 'eraser', icon: Eraser,        label: 'Eraser' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button key={id} type="button" title={label} onClick={() => setCanvasMode(id)}
                className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-all',
                  canvasMode === id ? 'bg-ink text-paper shadow-sm' : 'text-ink-muted hover:bg-paper-elevated hover:text-ink')}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <span className="h-4 w-px bg-hairline-strong mx-1" />
          <button type="button" onClick={() => addNode('class')} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors"><CirclePlus size={12} /> Class</button>
          <button type="button" onClick={() => addNode('interface')} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors"><CirclePlus size={12} /> Interface</button>
          <span className="h-4 w-px bg-hairline-strong mx-1" />
          <button type="button" onClick={onUndo} disabled={undoStack.length === 0} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors disabled:opacity-30"><RotateCcw size={12} /> Undo</button>
          <button type="button" onClick={onRedo} disabled={redoStack.length === 0} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors disabled:opacity-30"><Redo2 size={12} /> Redo</button>
          <span className="h-4 w-px bg-hairline-strong mx-1" />
          <button type="button" onClick={deleteSelected} disabled={!selectedId || canvasMode === 'eraser'} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-red-600 transition-colors disabled:opacity-30"><Trash2 size={12} /> Delete</button>
          <div className="flex-1" />
          <p className="hidden xl:block font-mono text-[10px] text-ink-faint pr-2">Minimal sufficient change · don&apos;t over-engineer</p>
        </div>

        {/* Split canvas */}
        <div className="relative flex-1 min-h-0 flex">

          {/* LEFT: Baseline */}
          {!baselineCollapsed && (
            <div className="relative flex-1 min-w-0 border-r border-hairline">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 pointer-events-none">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">
                  {stageIndex === 0 ? 'v1 · original' : `v${stageIndex} · previous`}
                </span>
              </div>
              <button type="button" title="Hide baseline" onClick={() => setBaselineCollapsed(true)}
                className="absolute top-1/2 -translate-y-1/2 right-0 z-10 flex items-center justify-center h-10 w-6 rounded-l-lg border border-r-0 border-teal-300 bg-teal-50 hover:bg-teal-100 transition-colors shadow-md group">
                <PanelLeftClose size={14} className="text-teal-500 group-hover:text-teal-700 transition-colors" />
              </button>
              <DebuggerCanvas diagram={baseline} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
            </div>
          )}
          {baselineCollapsed && (
            <button type="button" title="Show baseline" onClick={() => setBaselineCollapsed(false)}
              className="shrink-0 flex flex-col items-center justify-center gap-2 w-8 border-r border-hairline bg-teal-50 hover:bg-teal-100 transition-colors group">
              <PanelLeftOpen size={13} className="text-teal-500 group-hover:text-teal-700" />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-teal-500 group-hover:text-teal-700" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                v{stageIndex}
              </span>
            </button>
          )}

          {/* RIGHT: Working */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                v{stageIndex + 1} · your evolved design
              </span>
            </div>
            <DebuggerCanvas
              diagram={working}
              readOnly={false}
              selectedId={selectedId}
              onSelect={id => setSelectedId(id)}
              onDiagramChange={onWorkingChange}
              onEraseNode={onEraseNode}
              onEraseEdge={onEraseEdge}
              canvasMode={canvasMode}
              className="h-full"
              hideEditChrome
            />
            {!selectedId && !hintDismissed && (
              <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full border border-hairline bg-paper/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <p className="font-mono text-[11px] text-ink-muted whitespace-nowrap">Make the minimal sufficient change to survive this pressure</p>
                  <button type="button" onClick={() => setHintDismissed(true)} className="ml-1 shrink-0 text-ink-faint hover:text-ink transition-colors"><X size={12} /></button>
                </div>
              </div>
            )}

            {/* Brief panel overlay */}
            {briefPanelOpen && (
              <div className="absolute top-0 right-0 bottom-0 z-30 w-96 border-l border-hairline bg-paper shadow-xl flex flex-col">
                {/* Panel header */}
                <div className="shrink-0 flex items-center justify-between border-b border-hairline px-5 py-3 bg-paper-elevated">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">{stage.dayLabel}{stage.category ? ` · ${stage.category}` : ''}</p>
                    <p className="font-serif text-[15px] font-medium text-ink leading-snug mt-0.5">{stage.title}</p>
                  </div>
                  <button type="button" onClick={() => setBriefPanelOpen(false)} className="shrink-0 rounded-lg p-1.5 text-ink-faint hover:bg-hairline hover:text-ink transition-colors ml-3"><X size={14} /></button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">

                  {/* Track brief — stage 0 only */}
                  {stageIndex === 0 && payload.briefing && (
                    <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-teal-600 mb-2">Track brief</p>
                      <p className="text-[12px] text-ink leading-relaxed whitespace-pre-line">{payload.briefing}</p>
                    </div>
                  )}

                  {/* Narrative */}
                  <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">What changed in the world</p>
                    <p className="text-[13px] text-ink leading-relaxed whitespace-pre-line">{stage.narrative}</p>
                  </div>

                  {/* Metrics */}
                  {stage.metrics && (
                    <div className="grid grid-cols-2 gap-px bg-hairline border border-hairline rounded-xl overflow-hidden">
                      {stage.metrics.users != null && (
                        <div className="bg-paper-elevated px-4 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Users</p>
                          <p className="font-mono text-[14px] font-semibold text-ink tabular-nums mt-0.5">{stage.metrics.users.toLocaleString()}</p>
                        </div>
                      )}
                      {stage.metrics.ordersPerDay != null && (
                        <div className="bg-paper-elevated px-4 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Orders / day</p>
                          <p className="font-mono text-[14px] font-semibold text-ink tabular-nums mt-0.5">{stage.metrics.ordersPerDay.toLocaleString()}</p>
                        </div>
                      )}
                      {stage.metrics.latencyMs != null && (
                        <div className="bg-paper-elevated px-4 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">p95 latency</p>
                          <p className="font-mono text-[14px] font-semibold text-ink tabular-nums mt-0.5">{stage.metrics.latencyMs} ms</p>
                        </div>
                      )}
                      {stage.metrics.availability && (
                        <div className="bg-paper-elevated px-4 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Availability</p>
                          <p className="font-mono text-[14px] font-semibold text-ink mt-0.5">{stage.metrics.availability}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pressures identified */}
                  <div className="rounded-xl border border-hairline overflow-hidden">
                    <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Pressures you identified</p>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-1.5">
                      {pressures.length === 0
                        ? <p className="text-[12px] text-ink-faint italic">None selected yet</p>
                        : pressures.map(p => (
                          <span key={p} className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 font-mono text-[10px] text-teal-700">{p}</span>
                        ))
                      }
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="rounded-xl border border-hairline overflow-hidden">
                    <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Your decision</p>
                    </div>
                    <div className="px-4 py-3">
                      {decision === 'change'
                        ? <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[10px] text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Evolve the architecture</span>
                        : decision === 'noop'
                        ? <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-[10px] text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Hold — survive as-is</span>
                        : <p className="text-[12px] text-ink-faint italic">Not decided yet</p>
                      }
                    </div>
                  </div>

                  {/* Approach hints */}
                  {(stage.approachHints ?? []).length > 0 && (
                    <div className="rounded-xl border border-hairline overflow-hidden">
                      <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Design hints</p>
                      </div>
                      <ul className="px-4 py-3 space-y-1.5">
                        {stage.approachHints!.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-ink-muted">
                            <span className="mt-1 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 h-12 flex items-center border-t border-hairline bg-paper px-4 gap-2">
          <button type="button" onClick={() => setBriefPanelOpen(v => !v)}
            className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
              briefPanelOpen ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-paper-elevated hover:text-ink')}>
            <AlignLeft size={13} /> Stage Brief
          </button>
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-[11px] text-ink-faint hidden sm:block">
              {stageIndex === 0 ? 'v1 = left' : `v${stageIndex} = left`} &nbsp;·&nbsp; v{stageIndex + 1} = right &nbsp;·&nbsp; prefer smallest sufficient change
            </p>
          </div>
          <button type="button" disabled={busy} onClick={() => void submitStage('change')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Submit Stage {stageIndex + 1}
          </button>
        </div>
      </div>
    )
  }

  // ── RESULT gate ──────────────────────────────────────────────────────────

  if (gate === 'result' && lastGrade) {
    const accepted = Boolean(lastGrade.accepted)
    const dims = (lastGrade.dimensions as { key: string; label: string; ok: boolean; detail?: string }[]) ?? []
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-ink/10 backdrop-blur-sm p-6">
          <div className="w-full max-w-lg rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden">
            <div className={cn('px-6 py-5 border-b border-hairline', accepted ? 'bg-emerald-50' : 'bg-amber-50')}>
              <div className="flex items-center gap-3">
                {accepted
                  ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  : <XCircle size={20} className="text-amber-600 shrink-0" />}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">Stage {stageIndex} result</p>
                  <p className={cn('font-serif text-[16px] font-medium mt-0.5', accepted ? 'text-emerald-800' : 'text-amber-800')}>
                    {accepted ? 'Stage passed' : 'Needs improvement'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {Boolean(lastGrade.narrative) && (
                <p className="text-[13px] text-ink leading-relaxed">{String(lastGrade.narrative)}</p>
              )}
              {dims.length > 0 && (
                <div className="rounded-xl border border-hairline overflow-hidden">
                  {dims.map((d, i) => (
                    <div key={d.key} className={cn('flex items-start gap-3 px-4 py-3', i > 0 && 'border-t border-hairline')}>
                      {d.ok
                        ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        : <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-ink">{d.label}</p>
                        {d.detail && <p className="text-[11px] text-ink-muted mt-0.5">{d.detail}</p>}
                      </div>
                      <span className={cn('font-mono text-[11px] shrink-0', d.ok ? 'text-emerald-600' : 'text-rose-500')}>
                        {d.ok ? 'Pass' : 'Miss'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-hairline bg-paper-elevated flex justify-end">
              <button type="button" onClick={continueAfterStage}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-all">
                {accepted
                  ? stageIndex >= stages.length ? 'View journey' : `Next stage →`
                  : 'Retry stage →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  )
}
