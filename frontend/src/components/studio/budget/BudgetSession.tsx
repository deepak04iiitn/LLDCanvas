'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Send,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import {
  InvestmentCatalog,
  type BudgetInvestment,
} from '@/components/studio/budget/InvestmentCatalog'
import { InvestmentWhyPanel } from '@/components/studio/budget/InvestmentWhyPanel'
import { PriorityBoard } from '@/components/studio/budget/PriorityBoard'
import { TradeoffReveal } from '@/components/studio/budget/TradeoffReveal'
import { BudgetReplay } from '@/components/studio/budget/BudgetReplay'
import { CompletionNext } from '@/components/studio/shell/CompletionNext'
import { budgetCalc } from '@/lib/graph/budgetCalc'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'
import type { BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'

export interface BudgetSessionProps {
  attemptId: string
  breadcrumb?: BreadcrumbSegment[]
}

type Gate = 'brief' | 'allocate' | 'stageResult' | 'complete' | 'replay'

interface BudgetPayloadView {
  briefing?: string
  scenario?: string
  difficultyMode?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  auctionMode?: boolean
  auctionBlurb?: string
  comboMode?: boolean
  comboBlurb?: string
  budget: {
    kind: string
    total: number
    reserveAllowed?: boolean
    unitLabel?: string
  }
  suggestedReserve?: number
  priorities: { id: string; label: string; weight: string }[]
  pressures: { id: string; label: string; severity: string }[]
  investments: BudgetInvestment[]
  constraints?: {
    maxNewClasses?: number
    maxExternalSystems?: number
    teamSize?: number
    deadlineDays?: number
    maxNewAbstractions?: number
  }
  evolutionHooks?: {
    linkedEvolutionSlug?: string
    debtPressureMap?: Record<string, string>
    handoffBlurb?: string
  }
  stages: {
    id: string
    dayLabel: string
    title: string
    narrative: string
    budgetDelta?: number
    unlockInvestmentIds?: string[]
    newPriorities?: { id: string; label: string; weight: string }[]
    newPressures?: { id: string; label: string; severity: string }[]
    revealMetrics?: Record<string, string | number>
  }[]
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

function parsePayload(raw: unknown): BudgetPayloadView {
  const p = (raw ?? {}) as Record<string, unknown>
  const budget = (p.budget ?? { kind: 'points', total: 8 }) as BudgetPayloadView['budget']
  const stages =
    Array.isArray(p.stages) && p.stages.length
      ? (p.stages as BudgetPayloadView['stages'])
      : [{ id: 's0', dayLabel: 'Now', title: 'Allocate', narrative: String(p.scenario ?? p.briefing ?? '') }]
  return {
    briefing: typeof p.briefing === 'string' ? p.briefing : undefined,
    scenario: typeof p.scenario === 'string' ? p.scenario : undefined,
    difficultyMode: (p.difficultyMode as BudgetPayloadView['difficultyMode']) ?? 'intermediate',
    auctionMode: Boolean(p.auctionMode),
    auctionBlurb: typeof p.auctionBlurb === 'string' ? p.auctionBlurb : undefined,
    comboMode: Boolean(p.comboMode),
    comboBlurb: typeof p.comboBlurb === 'string' ? p.comboBlurb : undefined,
    budget,
    suggestedReserve: typeof p.suggestedReserve === 'number' ? p.suggestedReserve : undefined,
    priorities: Array.isArray(p.priorities) ? (p.priorities as BudgetPayloadView['priorities']) : [],
    pressures: Array.isArray(p.pressures) ? (p.pressures as BudgetPayloadView['pressures']) : [],
    investments: Array.isArray(p.investments) ? (p.investments as BudgetInvestment[]) : [],
    constraints: p.constraints as BudgetPayloadView['constraints'],
    evolutionHooks: p.evolutionHooks as BudgetPayloadView['evolutionHooks'],
    stages,
  }
}

export function BudgetSession({ attemptId }: BudgetSessionProps) {
  const [pack,           setPack]           = useState<StudioPackDetail | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [gate,           setGate]           = useState<Gate>('brief')
  const [stageIndex,     setStageIndex]     = useState(0)
  const [remaining,      setRemaining]      = useState(0)
  const [reserved,       setReserved]       = useState(0)
  const [selected,       setSelected]       = useState<Set<string>>(new Set())
  const [whyById,        setWhyById]        = useState<Record<string, Set<string>>>({})
  const [targetsById,    setTargetsById]    = useState<Record<string, Set<string>>>({})
  const [estCostById,    setEstCostById]    = useState<Record<string, number>>({})
  const [deferred,       setDeferred]       = useState<Set<string>>(new Set())
  const [busy,           setBusy]           = useState(false)
  const [lastGrade,      setLastGrade]      = useState<Record<string, unknown> | null>(null)
  const [report,         setReport]         = useState<Record<string, unknown> | null>(null)
  const [decisionLog,    setDecisionLog]    = useState<Record<string, unknown>[]>([])
  const [diagram,        setDiagram]        = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [customLabel,    setCustomLabel]    = useState('')
  const [customCost,     setCustomCost]     = useState(2)
  const [customWhy,      setCustomWhy]      = useState('')
  const [pendingCustoms, setPendingCustoms] = useState<{ label: string; cost: number; why?: string[]; tags?: string[] }[]>([])
  const [whyFocusId,     setWhyFocusId]     = useState<string | null>(null)
  const [showWhyPanel,   setShowWhyPanel]   = useState(false)
  const [showPriorities, setShowPriorities] = useState(false)
  const [briefPanelOpen, setBriefPanelOpen] = useState(false)

  const payload         = useMemo(() => parsePayload(pack?.payload), [pack])
  const stage           = payload.stages[stageIndex]
  const unitLabel       = payload.budget.unitLabel ?? 'pts'
  const mode            = payload.difficultyMode ?? 'intermediate'
  const revealTradeoffs = mode === 'beginner' || mode === 'intermediate'

  const priorities = useMemo(() => {
    const base = payload.priorities
    const extra = stage?.newPriorities ?? []
    const map = new Map<string, { id: string; label: string; weight: string }>()
    for (const p of [...base, ...extra]) map.set(p.id, p)
    return [...map.values()]
  }, [payload.priorities, stage])

  const pressures = useMemo(() => {
    const base = payload.pressures
    const extra = stage?.newPressures ?? []
    const map = new Map<string, { id: string; label: string; severity: string }>()
    for (const p of [...base, ...extra]) map.set(p.id, p)
    return [...map.values()]
  }, [payload.pressures, stage])

  const catalog = useMemo(() => {
    const unlock = stage?.unlockInvestmentIds
    if (!unlock?.length) return payload.investments
    const set = new Set(unlock)
    return payload.investments.filter(i => set.has(i.id) || selected.has(i.id))
  }, [payload.investments, stage, selected])

  const spentSelected = useMemo(() => {
    let s = 0
    for (const id of selected) {
      const inv = payload.investments.find(i => i.id === id)
      if (!inv) continue
      s += estCostById[id] ?? inv.cost
    }
    for (const c of pendingCustoms) s += c.cost
    return s
  }, [selected, payload.investments, estCostById, pendingCustoms])

  const remainingAfterDraft = remaining - spentSelected - reserved

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled) return
        if (!res.pack) return
        setPack(res.pack)
        const pl = parsePayload(res.pack.payload)
        setDiagram(normalizeDiagram(res.pack.diagramSnapshot))
        const progress = (res.attempt as { progress?: Record<string, unknown> })?.progress
        const idx = typeof progress?.stageIndex === 'number' ? progress.stageIndex : 0
        setStageIndex(idx)
        setRemaining(typeof progress?.remaining === 'number' ? progress.remaining : pl.budget.total)
        setReserved(typeof progress?.reserved === 'number' ? progress.reserved : 0)
        setDecisionLog(Array.isArray(progress?.decisionLog) ? (progress!.decisionLog as Record<string, unknown>[]) : [])
        if (res.attempt.status === 'submitted') {
          const rep = await studioApi.getBudgetReport(attemptId)
          setReport(rep.report)
          setGate('complete')
        } else if (idx > 0) {
          setGate('allocate')
        }
      } catch (e) {
        toast.error((e as Error).message ?? 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [attemptId])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (whyFocusId === id) setWhyFocusId(null)
      } else {
        const inv = payload.investments.find(i => i.id === id)
        const cost = estCostById[id] ?? inv?.cost ?? 0
        if (cost > remaining - reserved - spentSelected + (prev.has(id) ? cost : 0)) {
          toast.info('Not enough budget left')
          return prev
        }
        next.add(id)
        setWhyFocusId(id)
        setShowWhyPanel(true)
      }
      return next
    })
  }, [payload.investments, estCostById, remaining, reserved, spentSelected, whyFocusId])

  const submitStage = useCallback(async () => {
    for (const id of selected) {
      const why = whyById[id]
      if (!why || why.size === 0) {
        toast.error('Add a why for each selected investment')
        setWhyFocusId(id)
        setShowWhyPanel(true)
        return
      }
    }
    setBusy(true)
    try {
      const picks = [...selected].map(id => ({
        investmentId: id,
        why: [...(whyById[id] ?? [])],
        targetNames: [...(targetsById[id] ?? [])],
        estimatedCost: estCostById[id],
      }))
      const res = await studioApi.submitBudgetStage(attemptId, {
        picks,
        reserved,
        deferredPressureIds: [...deferred],
        customInvestments: pendingCustoms,
        diagramData: diagram,
      })
      setLastGrade(res.grade)
      const progress = res.progress
      setRemaining(typeof progress.remaining === 'number' ? progress.remaining : remaining)
      setReserved(typeof progress.reserved === 'number' ? progress.reserved : 0)
      setDecisionLog(Array.isArray(progress.decisionLog) ? (progress.decisionLog as Record<string, unknown>[]) : [])
      setSelected(new Set())
      setWhyById({})
      setTargetsById({})
      setPendingCustoms([])
      setDeferred(new Set())
      setShowWhyPanel(false)
      if (res.complete) {
        const rep = await studioApi.getBudgetReport(attemptId)
        setReport(rep.report)
        setGate('complete')
        toast.success('Budget track complete')
      } else if (res.grade?.accepted) {
        setStageIndex(typeof res.nextStageIndex === 'number' ? res.nextStageIndex : stageIndex + 1)
        setGate('stageResult')
      } else {
        setGate('stageResult')
        toast.message(String(res.grade?.narrative ?? 'Revise allocation'))
      }
    } catch (e) {
      toast.error((e as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [selected, whyById, targetsById, estCostById, reserved, deferred, pendingCustoms, diagram, attemptId, remaining, stageIndex])

  const applyInvestmentStub = useCallback((inv: BudgetInvestment) => {
    const hints = new Set((inv.appliesToHints ?? []).map(h => h.toLowerCase()))
    if (!hints.size) return
    setDiagram(prev => ({
      ...prev,
      nodes: prev.nodes.map(raw => {
        const n = raw as Record<string, unknown>
        const data = (n.data as Record<string, unknown> | undefined) ?? {}
        const name = String(data.name ?? '').toLowerCase()
        if (![...hints].some(h => name.includes(h.toLowerCase()) || h.includes(name))) return raw
        return { ...n, data: { ...data, stereotype: inv.id } }
      }),
    }))
  }, [])

  const focusInv = whyFocusId
    ? payload.investments.find(i => i.id === whyFocusId)
    : payload.investments.find(i => selected.has(i.id))

  // ── Budget colour ──────────────────────────────────────────────────────────
  const budgetColor =
    remainingAfterDraft < 0     ? 'text-rose-600'
    : remainingAfterDraft === 0 ? 'text-ink-muted'
    : remainingAfterDraft < payload.budget.total * 0.2 ? 'text-amber-600'
    : 'text-emerald-600'

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading session…</span>
      </div>
    )
  }

  // ── Complete / Replay ──────────────────────────────────────────────────────
  if ((gate === 'complete' || gate === 'replay') && report) {
    const rpt          = report
    const rptBudget    = (rpt.budget ?? {}) as Record<string, unknown>
    const rptCoverage  = Array.isArray(rpt.coverage)       ? (rpt.coverage  as Record<string,unknown>[]) : []
    const rptOpCost    = Array.isArray(rpt.opportunityCost) ? (rpt.opportunityCost as string[])           : []
    const rptDeferred  = Array.isArray(rpt.deferred)        ? (rpt.deferred  as Record<string,unknown>[]) : []
    const rptInvests   = Array.isArray(rpt.investments)     ? (rpt.investments as Record<string,unknown>[]) : []
    const rptInflation = (rpt.inflation ?? null) as Record<string,unknown> | null
    const rptDims      = Array.isArray(rpt.dimensions)      ? (rpt.dimensions as Record<string,unknown>[]) : []
    const rptHandoff   = (rpt.evolutionHandoff ?? null)  as { slug?: string; blurb?: string; debtIds?: string[] } | null
    const rptComboBlurb = typeof rpt.comboBlurb === 'string' ? rpt.comboBlurb : null
    const rptHacks     = Array.isArray(rpt.cheapHackNotes) ? (rpt.cheapHackNotes as string[]) : []
    const calcInflation = (() => {
      if (!diagram) return null
      const like: DiagramLike = { nodes: diagram.nodes as DiagramLike['nodes'], edges: diagram.edges as DiagramLike['edges'] }
      return budgetCalc(like, {}, 40)
    })()

    const allocated  = Number(rptBudget.allocated  ?? 0)
    const reserved   = Number(rptBudget.reserved   ?? 0)
    const total      = Number(rptBudget.total      ?? payload.budget.total)
    const unused     = Number(rptBudget.remaining  ?? 0)
    const allocPct   = total > 0 ? Math.min(100, (allocated / total) * 100) : 0

    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">

        {/* Header */}
        <header className="shrink-0 flex items-center h-12 border-b border-hairline bg-paper px-4 gap-3">
          <Link href="/dashboard/design-studio/budget/problems"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors">
            <ArrowLeft size={13} /> Tracks
          </Link>
          <span className="h-4 w-px bg-hairline-strong" />
          <p className="font-serif text-[14px] font-medium text-ink truncate">{pack?.title}</p>
          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide shrink-0">
            {gate === 'replay' ? 'Replay' : 'Complete'}
          </span>
          <div className="flex-1" />
          {gate === 'complete' && (
            <button type="button" onClick={() => setGate('replay')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:text-ink hover:bg-paper-elevated transition-colors">
              <RefreshCcw size={12} /> Replay decisions
            </button>
          )}
          {gate === 'replay' && (
            <button type="button" onClick={() => setGate('complete')}
              className="font-mono text-[11px] text-ink-faint hover:text-ink transition-colors">
              ← Back to report
            </button>
          )}
        </header>

        {/* Replay gate */}
        {gate === 'replay' && (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-6 py-8 space-y-5">
              <h2 className="font-serif text-[22px] text-ink">Decision replay</h2>
              <BudgetReplay entries={decisionLog} />
            </div>
          </div>
        )}

        {/* Complete gate — split layout */}
        {gate === 'complete' && (
          <div className="flex-1 min-h-0 flex">

            {/* Left: Final diagram */}
            <div className="relative flex-1 min-w-0 border-r border-hairline">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 pointer-events-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Final architecture</span>
              </div>
              <DebuggerCanvas diagram={diagram} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
            </div>

            {/* Right: Report panel */}
            <div className="w-[460px] shrink-0 flex flex-col border-l border-hairline bg-paper">

              {/* Report hero */}
              <div className="shrink-0 border-b border-hairline px-6 py-5 bg-paper-elevated">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-1">Investment report</p>
                <h2 className="font-serif text-[20px] font-medium text-ink leading-snug">
                  What your budget achieved
                </h2>
                {/* Allocation bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-ink-faint">Allocated</span>
                    <span className="font-mono text-[11px] text-ink tabular-nums">{allocated} / {total} {unitLabel}</span>
                  </div>
                  <div className="h-2 rounded-full bg-hairline overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${allocPct}%` }} />
                  </div>
                </div>
                {/* Budget stats */}
                <div className="mt-3 grid grid-cols-3 gap-px bg-hairline rounded-xl overflow-hidden border border-hairline">
                  {[
                    { label: 'Allocated', val: allocated, color: 'text-ink' },
                    { label: 'Reserved',  val: reserved,  color: reserved > 0 ? 'text-amber-600' : 'text-ink-muted' },
                    { label: 'Unused',    val: unused,    color: unused > 0 ? 'text-ink-muted' : 'text-ink' },
                  ].map(s => (
                    <div key={s.label} className="bg-paper px-3 py-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{s.label}</p>
                      <p className={cn('font-mono text-[15px] font-semibold tabular-nums mt-0.5', s.color)}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable sections */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">

                {/* Investments picked */}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">Investments</p>
                  {rptInvests.length === 0
                    ? <p className="text-[12px] text-ink-faint italic">No investments — full reserve or hold.</p>
                    : (
                      <div className="rounded-xl border border-hairline overflow-hidden">
                        {rptInvests.map((inv, i) => (
                          <div key={i} className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-hairline')}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <p className="flex-1 text-[13px] text-ink">{String(inv.label ?? inv.investmentId ?? 'Investment')}</p>
                            <span className="font-mono text-[12px] font-semibold text-ink tabular-nums">{String(inv.cost ?? '')} {unitLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Requirement coverage */}
                {rptCoverage.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">Requirement coverage</p>
                    <div className="rounded-xl border border-hairline overflow-hidden">
                      {rptCoverage.map((row, i) => {
                        const covered = row.covered
                        const isOk  = covered === true
                        const isPart = covered === 'partial'
                        return (
                          <div key={i} className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-hairline')}>
                            <span className={cn('font-mono text-[13px] shrink-0 w-4',
                              isOk ? 'text-emerald-500' : isPart ? 'text-amber-500' : 'text-rose-400')}>
                              {isOk ? '✓' : isPart ? '~' : '—'}
                            </span>
                            <p className="flex-1 text-[13px] text-ink">{String(row.label)}</p>
                            <span className="font-mono text-[10px] uppercase text-ink-faint">{String(row.weight)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Opportunity cost */}
                {rptOpCost.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-600 mb-3">Opportunity cost</p>
                    <ul className="space-y-2">
                      {rptOpCost.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-amber-900">
                          <span className="mt-1 h-1 w-1 rounded-full bg-amber-400 shrink-0" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deferred debt */}
                {rptDeferred.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">Deferred debt</p>
                    <div className="rounded-xl border border-hairline overflow-hidden">
                      {rptDeferred.map((d, i) => (
                        <div key={i} className={cn('flex items-center gap-3 px-4 py-3', i > 0 && 'border-t border-hairline')}>
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                          <p className="flex-1 text-[13px] text-ink">{String(d.label ?? d.pressureId)}</p>
                          <span className="font-mono text-[10px] uppercase text-ink-faint">{String(d.severity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                {rptDims.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">Dimensions</p>
                    <div className="rounded-xl border border-hairline overflow-hidden">
                      {rptDims.map((d, i) => (
                        <div key={i} className={cn('flex items-start gap-3 px-4 py-3', i > 0 && 'border-t border-hairline')}>
                          <span className={cn('font-mono text-[13px] shrink-0', d.ok ? 'text-emerald-500' : 'text-ink-faint')}>{d.ok ? '✓' : '·'}</span>
                          <p className="flex-1 text-[13px] text-ink">{String(d.label)}</p>
                          {Boolean(d.detail) && <p className="text-[11px] text-ink-muted max-w-[45%] text-right">{String(d.detail)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Architecture inflation */}
                {(rptInflation || calcInflation) && (
                  <div className="rounded-xl border border-hairline overflow-hidden">
                    <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Architecture inflation</p>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {rptInflation && (
                        <>
                          {Boolean(rptInflation.note) && <p className="text-[12px] text-ink-muted">{String(rptInflation.note)}</p>}
                          <p className="font-mono text-[11px] text-ink-faint">
                            Components {String(rptInflation.beforeNodes)} → {String(rptInflation.afterNodes)} (Δ{String(rptInflation.delta)})
                          </p>
                        </>
                      )}
                      {calcInflation && (
                        <div>
                          <p className="font-mono text-[11px] text-ink-faint">Cost model: {calcInflation.total}{calcInflation.limit != null ? ` / ${calcInflation.limit}` : ''}</p>
                          <ul className="mt-1 space-y-0.5">
                            {calcInflation.lines.map(line => (
                              <li key={line.label} className="flex justify-between font-mono text-[11px] text-ink-muted">
                                <span>{line.label} ×{line.count}</span>
                                <span>{line.total}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cheap hacks */}
                {rptHacks.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">Cheap hack vs proper</p>
                    <ul className="space-y-1.5">
                      {rptHacks.map((n, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-ink-muted">
                          <span className="mt-1 h-1 w-1 rounded-full bg-ink-faint shrink-0" />{n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Evolution handoff */}
                {(rptHandoff?.slug || rptComboBlurb) && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-teal-600 mb-2">
                      {rpt.comboMode ? 'Evolution + Budget' : 'Continue in Evolution'}
                    </p>
                    {rptComboBlurb && <p className="text-[12px] text-teal-800 mb-2">{rptComboBlurb}</p>}
                    {rptHandoff?.blurb && <p className="text-[12px] text-teal-800 mb-2">{rptHandoff.blurb}</p>}
                    {rptHandoff?.slug && (
                      <Link href={`/dashboard/design-studio/evolution/${rptHandoff.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white hover:bg-teal-800 transition-colors">
                        Open Evolution track <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                )}

                {/* Next problem */}
                <div className="border-t border-hairline pt-5">
                  <CompletionNext packType="budget" currentSlug={pack?.slug ?? ''} libraryHref="/dashboard/design-studio/budget/problems" />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pb-4">
                  <Link href="/dashboard/design-studio/budget/problems"
                    className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:text-ink hover:bg-hairline transition-colors">
                    <ArrowLeft size={12} /> All problems
                  </Link>
                  <Link href="/dashboard/design-studio/budget"
                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-colors">
                    Back to Budget <ArrowRight size={12} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Shared header ──────────────────────────────────────────────────────────
  const Header = (
    <header className="shrink-0 flex items-center h-12 border-b border-hairline bg-paper px-4 gap-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link href="/dashboard/design-studio/budget/problems"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors shrink-0">
          <ArrowLeft size={13} /> Tracks
        </Link>
        <span className="h-4 w-px bg-hairline-strong shrink-0" />
        <p className="font-serif text-[14px] font-medium text-ink leading-tight truncate min-w-0">
          {pack?.title ?? 'Architecture Budget'}
        </p>
      </div>

      {/* Stage pills */}
      {payload.stages.length > 1 && (
        <div className="flex items-center gap-0 shrink-0 mx-4">
          {payload.stages.map((s, i) => {
            const isDone    = i < stageIndex
            const isCurrent = i === stageIndex
            return (
              <div key={s.id} className="flex items-center shrink-0">
                {i > 0 && <span className="text-ink-faint text-[10px] mx-1">→</span>}
                <span className={cn(
                  'px-2 py-1 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap',
                  isCurrent && 'bg-ink text-paper',
                  isDone && !isCurrent && 'text-ink/40',
                  !isDone && !isCurrent && 'text-ink-faint',
                )}>{s.dayLabel}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Budget meter */}
      {(gate === 'allocate' || gate === 'brief') && (
        <div className="shrink-0 flex items-center gap-2 ml-auto pl-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">Budget</span>
          <span className={cn('font-mono text-[14px] font-semibold tabular-nums', budgetColor)}>
            {Math.max(0, remainingAfterDraft)}
          </span>
          <span className="font-mono text-[11px] text-ink-faint">/ {payload.budget.total} {unitLabel}</span>
        </div>
      )}
    </header>
  )

  // ── BRIEF gate ─────────────────────────────────────────────────────────────
  if (gate === 'brief') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}
        <div className="flex-1 min-h-0 flex">

          {/* Left: System canvas */}
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">Current system · read only</span>
            </div>
            <DebuggerCanvas diagram={diagram} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
          </div>

          {/* Right: Brief panel */}
          <div className="w-96 shrink-0 flex flex-col border-l border-hairline bg-paper">
            <div className="shrink-0 px-5 py-4 border-b border-hairline">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-1">
                {payload.auctionMode ? 'Auction Mode' : payload.comboMode ? 'Combo Mode' : 'Architecture Budget'}
              </p>
              <h2 className="font-serif text-[18px] font-medium text-ink leading-snug">
                {pack?.title ?? 'Choose your investments'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Briefing */}
              {(payload.briefing ?? payload.scenario) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-600 mb-2">Brief</p>
                  <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{payload.briefing ?? payload.scenario}</p>
                </div>
              )}

              {/* Budget */}
              <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-3">Your budget</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-[28px] font-semibold text-ink tabular-nums">{payload.budget.total}</span>
                  <span className="font-mono text-[13px] text-ink-muted mb-1">{unitLabel} to allocate</span>
                </div>
                {payload.suggestedReserve != null && (
                  <p className="mt-2 text-[12px] text-ink-muted">Suggested reserve: {payload.suggestedReserve} {unitLabel}</p>
                )}
              </div>

              {/* Constraints */}
              {payload.constraints && Object.values(payload.constraints).some(v => v != null) && (
                <div className="rounded-xl border border-hairline overflow-hidden">
                  <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Constraints</p>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {payload.constraints.maxNewClasses != null && <span className="rounded-lg border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">Max classes: {payload.constraints.maxNewClasses}</span>}
                    {payload.constraints.maxNewAbstractions != null && <span className="rounded-lg border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">Max abstractions: {payload.constraints.maxNewAbstractions}</span>}
                    {payload.constraints.maxExternalSystems != null && <span className="rounded-lg border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">Max external: {payload.constraints.maxExternalSystems}</span>}
                    {payload.constraints.teamSize != null && <span className="rounded-lg border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">Team: {payload.constraints.teamSize}</span>}
                    {payload.constraints.deadlineDays != null && <span className="rounded-lg border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink">Deadline: {payload.constraints.deadlineDays}d</span>}
                  </div>
                </div>
              )}

              {/* How it works */}
              <div className="rounded-xl border border-hairline overflow-hidden">
                {[
                  { n: '1', title: 'Study the system', body: 'Understand the current architecture on the left.' },
                  { n: '2', title: 'Pick investments', body: 'Browse the catalog and allocate your budget to the highest-value improvements.' },
                  { n: '3', title: 'Justify each choice', body: 'For every investment, explain why it\'s worth the cost. What does it fix?' },
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

              {/* Auction / combo blurb */}
              {payload.auctionBlurb && (
                <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-1">Auction rules</p>
                  <p className="text-[12px] text-ink-muted">{payload.auctionBlurb}</p>
                </div>
              )}
              {payload.comboBlurb && (
                <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-1">Combo mode</p>
                  <p className="text-[12px] text-ink-muted">{payload.comboBlurb}</p>
                </div>
              )}
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-hairline bg-paper-elevated">
              <button type="button" onClick={() => setGate('allocate')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-all active:scale-[0.98]">
                Open marketplace <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ALLOCATE gate ──────────────────────────────────────────────────────────
  if (gate === 'allocate') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}

        <div className="flex-1 min-h-0 flex">

          {/* Left: Canvas */}
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">System design · annotate investments</span>
            </div>
            <DebuggerCanvas
              diagram={diagram}
              readOnly={false}
              selectedId={null}
              onSelect={() => {}}
              onDiagramChange={setDiagram}
              hideEditChrome
              className="h-full"
            />
          </div>

          {/* Right: Catalog + context panel */}
          <div className="relative w-[420px] shrink-0 flex flex-col border-l border-hairline bg-paper">

            {/* Stage context strip */}
            <div className="shrink-0 border-b border-hairline px-5 py-3 bg-paper-elevated">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">{stage.dayLabel} · {stage.title}</p>
                  <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">{stage.narrative}</p>
                  {stage.revealMetrics && (
                    <p className="mt-1 font-mono text-[10px] text-ink-faint">
                      {Object.entries(stage.revealMetrics).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                  {typeof stage.budgetDelta === 'number' && stage.budgetDelta !== 0 && (
                    <p className="mt-1 font-mono text-[10px] text-emerald-600">+{stage.budgetDelta} {unitLabel} this stage</p>
                  )}
                </div>
                <button type="button" onClick={() => setBriefPanelOpen(true)}
                  className="shrink-0 rounded-lg p-1.5 text-ink-faint hover:bg-paper hover:text-ink transition-colors" title="View brief">
                  <AlignLeft size={13} />
                </button>
              </div>
            </div>

            {/* Priorities/pressures collapsible */}
            {(priorities.length > 0 || pressures.length > 0) && (
              <div className="shrink-0 border-b border-hairline">
                <button type="button" onClick={() => setShowPriorities(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-paper-elevated transition-colors">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Priorities & pressures</span>
                  {showPriorities ? <ChevronDown size={13} className="text-ink-faint" /> : <ChevronRight size={13} className="text-ink-faint" />}
                </button>
                {showPriorities && (
                  <div className="px-5 pb-3">
                    <PriorityBoard
                      priorities={priorities}
                      pressures={pressures}
                      deferredIds={deferred}
                      onToggleDefer={id => setDeferred(prev => {
                        const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n
                      })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Investment catalog — scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-2 py-2">
                <InvestmentCatalog
                  investments={catalog}
                  selectedIds={selected}
                  remaining={Math.max(0, remaining - reserved - spentSelected +
                    [...selected].reduce((s, id) => {
                      const inv = payload.investments.find(i => i.id === id)
                      return s + (estCostById[id] ?? inv?.cost ?? 0)
                    }, 0))}
                  revealTradeoffs={revealTradeoffs}
                  onToggle={id => {
                    toggleSelect(id)
                    const inv = payload.investments.find(i => i.id === id)
                    if (inv && !selected.has(id)) applyInvestmentStub(inv)
                  }}
                />
              </div>

              {/* Reserve */}
              {payload.budget.reserveAllowed !== false && (
                <div className="px-5 pb-3 border-t border-hairline pt-3">
                  <div className="flex items-center gap-3">
                    <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Reserve</label>
                    <input type="number" min={0} max={Math.max(0, remaining - spentSelected)} value={reserved}
                      onChange={e => setReserved(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 rounded-lg border border-hairline bg-paper px-2.5 py-1.5 font-mono text-[12px] text-ink" />
                    <span className="font-mono text-[11px] text-ink-faint">{unitLabel}</span>
                    {payload.suggestedReserve != null && (
                      <button type="button" onClick={() => setReserved(payload.suggestedReserve!)}
                        className="font-mono text-[10px] text-ink-muted hover:text-ink underline-offset-2 hover:underline transition-colors">
                        Use {payload.suggestedReserve}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Custom investment — expert / auction */}
              {(mode === 'expert' || payload.auctionMode) && (
                <div className="px-5 pb-4 border-t border-hairline pt-3 space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Custom investment</p>
                  <div className="flex flex-wrap gap-2">
                    <input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                      placeholder="Label" className="flex-1 min-w-0 rounded-lg border border-hairline bg-paper px-2.5 py-1.5 text-[12px] text-ink" />
                    <input type="number" value={customCost} onChange={e => setCustomCost(Number(e.target.value))}
                      className="w-16 rounded-lg border border-hairline bg-paper px-2 py-1.5 font-mono text-[12px] text-ink" />
                    <input value={customWhy} onChange={e => setCustomWhy(e.target.value)}
                      placeholder="Why?" className="flex-1 min-w-[120px] rounded-lg border border-hairline bg-paper px-2.5 py-1.5 text-[12px] text-ink" />
                    <button type="button"
                      onClick={() => {
                        if (!customLabel.trim()) return
                        if (customCost > remainingAfterDraft) { toast.info('Not enough budget'); return }
                        setPendingCustoms(c => [...c, { label: customLabel.trim(), cost: customCost, why: customWhy ? [customWhy] : ['Custom proposal'], tags: ['custom'] }])
                        setCustomLabel(''); setCustomWhy('')
                      }}
                      className="rounded-lg border border-hairline bg-paper-elevated px-3 py-1.5 font-mono text-[11px] text-ink-muted hover:text-ink transition-colors">
                      Add
                    </button>
                  </div>
                  {pendingCustoms.length > 0 && (
                    <ul className="space-y-1 pt-1">
                      {pendingCustoms.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />{c.label} <span className="text-ink-faint">({c.cost} {unitLabel})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="shrink-0 border-t border-hairline bg-paper-elevated px-5 py-3 flex items-center gap-3">
              <button type="button" onClick={() => { if (focusInv) setShowWhyPanel(v => !v) }}
                disabled={selected.size === 0}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                  showWhyPanel ? 'bg-ink text-paper' : 'border border-hairline text-ink-muted hover:text-ink disabled:opacity-30',
                )}>
                <AlignLeft size={13} />
                Why?
                {selected.size > 0 && (
                  <span className={cn('rounded-full px-1.5 py-0.5 font-mono text-[9px]', showWhyPanel ? 'bg-paper/20' : 'bg-paper-elevated')}>
                    {selected.size}
                  </span>
                )}
              </button>
              <div className="flex-1" />
              <button type="button" disabled={busy || remainingAfterDraft < 0} onClick={() => void submitStage()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors">
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Submit {payload.stages.length > 1 ? `Stage ${stageIndex + 1}` : 'Budget'}
              </button>
            </div>

            {/* Why panel — slides up over the catalog from bottom */}
            {showWhyPanel && focusInv && (
              <div className="absolute inset-x-0 bottom-0 z-20 border-t border-hairline bg-paper shadow-2xl flex flex-col max-h-[65%]">
                <div className="shrink-0 flex items-center justify-between border-b border-hairline px-5 py-3 bg-paper-elevated">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Justify your choice</p>
                    <p className="font-serif text-[14px] font-medium text-ink mt-0.5">{focusInv.label}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...selected].filter(id => id !== focusInv.id).length > 0 && (
                      <div className="flex items-center gap-1 mr-2">
                        {[...selected].filter(id => id !== focusInv.id).map(id => {
                          const inv = payload.investments.find(i => i.id === id)
                          return (
                            <button key={id} type="button" onClick={() => setWhyFocusId(id)}
                              className="font-mono text-[10px] px-2 py-0.5 rounded border border-hairline text-ink-faint hover:text-ink transition-colors">
                              {inv?.label.slice(0, 10) ?? id}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <button type="button" onClick={() => setShowWhyPanel(false)}
                      className="rounded-lg p-1.5 text-ink-faint hover:bg-paper hover:text-ink transition-colors">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
                  <InvestmentWhyPanel
                    investment={focusInv}
                    why={whyById[focusInv.id] ?? new Set()}
                    targets={targetsById[focusInv.id] ?? new Set()}
                    estimatedCost={estCostById[focusInv.id]}
                    expertMode={mode === 'expert'}
                    onToggleWhy={opt => setWhyById(prev => {
                      const cur = new Set(prev[focusInv.id] ?? [])
                      if (cur.has(opt)) cur.delete(opt); else cur.add(opt)
                      return { ...prev, [focusInv.id]: cur }
                    })}
                    onToggleTarget={name => setTargetsById(prev => {
                      const cur = new Set(prev[focusInv.id] ?? [])
                      if (cur.has(name)) cur.delete(name); else cur.add(name)
                      return { ...prev, [focusInv.id]: cur }
                    })}
                    onEstimatedCost={n => setEstCostById(prev => ({ ...prev, [focusInv.id]: n }))}
                  />
                  <TradeoffReveal
                    cost={estCostById[focusInv.id] ?? focusInv.cost}
                    benefits={focusInv.benefits}
                    complexities={focusInv.complexities}
                    risks={focusInv.risks}
                    mode={mode}
                  />
                </div>
              </div>
            )}

            {/* Brief overlay panel */}
            {briefPanelOpen && (
              <div className="absolute inset-0 z-30 bg-paper flex flex-col border-l border-hairline">
                <div className="shrink-0 flex items-center justify-between border-b border-hairline px-5 py-3 bg-paper-elevated">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Brief</p>
                  <button type="button" onClick={() => setBriefPanelOpen(false)} className="rounded-lg p-1.5 text-ink-faint hover:bg-paper hover:text-ink transition-colors"><X size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {(payload.briefing ?? payload.scenario) && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber-600 mb-2">Problem brief</p>
                      <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{payload.briefing ?? payload.scenario}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-3">Budget</p>
                    <div className="flex items-end gap-2">
                      <span className="font-mono text-[24px] font-semibold text-ink tabular-nums">{payload.budget.total}</span>
                      <span className="font-mono text-[12px] text-ink-muted mb-1">{unitLabel} total</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn('font-mono text-[13px] font-semibold tabular-nums', budgetColor)}>{Math.max(0, remainingAfterDraft)}</span>
                      <span className="font-mono text-[11px] text-ink-faint">remaining</span>
                    </div>
                  </div>
                  {payload.constraints && Object.values(payload.constraints).some(v => v != null) && (
                    <div className="rounded-xl border border-hairline overflow-hidden">
                      <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Constraints</p>
                      </div>
                      <div className="px-4 py-3 flex flex-wrap gap-2">
                        {payload.constraints.maxNewClasses != null && <span className="rounded-lg border border-hairline px-2.5 py-1 font-mono text-[11px] text-ink">Max classes: {payload.constraints.maxNewClasses}</span>}
                        {payload.constraints.maxNewAbstractions != null && <span className="rounded-lg border border-hairline px-2.5 py-1 font-mono text-[11px] text-ink">Max abstractions: {payload.constraints.maxNewAbstractions}</span>}
                        {payload.constraints.maxExternalSystems != null && <span className="rounded-lg border border-hairline px-2.5 py-1 font-mono text-[11px] text-ink">Max external: {payload.constraints.maxExternalSystems}</span>}
                        {payload.constraints.teamSize != null && <span className="rounded-lg border border-hairline px-2.5 py-1 font-mono text-[11px] text-ink">Team: {payload.constraints.teamSize}</span>}
                        {payload.constraints.deadlineDays != null && <span className="rounded-lg border border-hairline px-2.5 py-1 font-mono text-[11px] text-ink">Deadline: {payload.constraints.deadlineDays}d</span>}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">Selected so far ({selected.size})</p>
                    {selected.size === 0
                      ? <p className="text-[12px] text-ink-faint italic">No investments selected yet</p>
                      : <div className="space-y-1.5">
                        {[...selected].map(id => {
                          const inv = payload.investments.find(i => i.id === id)
                          return (
                            <div key={id} className="flex items-center gap-2.5 rounded-lg border border-hairline bg-paper-elevated px-3 py-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span className="flex-1 text-[12px] text-ink">{inv?.label ?? id}</span>
                              <span className="font-mono text-[11px] text-ink-muted">{estCostById[id] ?? inv?.cost ?? 0} {unitLabel}</span>
                            </div>
                          )
                        })}
                      </div>
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── STAGE RESULT gate ──────────────────────────────────────────────────────
  if (gate === 'stageResult' && lastGrade) {
    const accepted = Boolean(lastGrade.accepted)
    const opCost   = Array.isArray(lastGrade.opportunityCost) ? (lastGrade.opportunityCost as string[]) : []
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
                    {accepted ? 'Stage accepted' : 'Needs revision'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {Boolean(lastGrade.narrative) && (
                <p className="text-[13px] text-ink leading-relaxed">{String(lastGrade.narrative)}</p>
              )}
              {opCost.length > 0 && (
                <div className="rounded-xl border border-hairline overflow-hidden">
                  <div className="px-4 py-3 border-b border-hairline bg-paper-elevated">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Opportunity cost</p>
                  </div>
                  <ul className="px-4 py-3 space-y-2">
                    {opCost.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-ink-muted">
                        <span className="mt-1 h-1 w-1 rounded-full bg-amber-400 shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-hairline bg-paper-elevated flex justify-end">
              <button type="button"
                onClick={() => {
                  if (stageIndex >= payload.stages.length) {
                    void studioApi.getBudgetReport(attemptId).then(r => { setReport(r.report); setGate('complete') })
                  } else {
                    setGate('allocate'); setLastGrade(null)
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-all">
                {stageIndex >= payload.stages.length ? 'View report' : accepted ? `Next stage →` : 'Revise →'}
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
