'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import { BudgetMeter } from '@/components/studio/budget/BudgetMeter'
import {
  InvestmentCatalog,
  type BudgetInvestment,
} from '@/components/studio/budget/InvestmentCatalog'
import { InvestmentWhyPanel } from '@/components/studio/budget/InvestmentWhyPanel'
import { PriorityBoard } from '@/components/studio/budget/PriorityBoard'
import { TradeoffReveal } from '@/components/studio/budget/TradeoffReveal'
import { BudgetComplete } from '@/components/studio/budget/BudgetComplete'
import { BudgetReplay } from '@/components/studio/budget/BudgetReplay'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

export interface BudgetSessionProps {
  attemptId: string
}

type Gate = 'brief' | 'allocate' | 'why' | 'stageResult' | 'complete' | 'replay'

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

function parsePayload(raw: unknown): BudgetPayloadView {
  const p = (raw ?? {}) as Record<string, unknown>
  const budget = (p.budget ?? { kind: 'points', total: 8 }) as BudgetPayloadView['budget']
  const stages = Array.isArray(p.stages) && p.stages.length
    ? (p.stages as BudgetPayloadView['stages'])
    : [
        {
          id: 's0',
          dayLabel: 'Now',
          title: 'Allocate',
          narrative: String(p.scenario ?? p.briefing ?? ''),
        },
      ]
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
    priorities: Array.isArray(p.priorities)
      ? (p.priorities as BudgetPayloadView['priorities'])
      : [],
    pressures: Array.isArray(p.pressures)
      ? (p.pressures as BudgetPayloadView['pressures'])
      : [],
    investments: Array.isArray(p.investments)
      ? (p.investments as BudgetInvestment[])
      : [],
    constraints: p.constraints as BudgetPayloadView['constraints'],
    evolutionHooks: p.evolutionHooks as BudgetPayloadView['evolutionHooks'],
    stages,
  }
}

export function BudgetSession({ attemptId }: BudgetSessionProps) {
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [gate, setGate] = useState<Gate>('brief')
  const [stageIndex, setStageIndex] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [reserved, setReserved] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [whyById, setWhyById] = useState<Record<string, Set<string>>>({})
  const [targetsById, setTargetsById] = useState<Record<string, Set<string>>>({})
  const [estCostById, setEstCostById] = useState<Record<string, number>>({})
  const [deferred, setDeferred] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [lastGrade, setLastGrade] = useState<Record<string, unknown> | null>(null)
  const [report, setReport] = useState<Record<string, unknown> | null>(null)
  const [decisionLog, setDecisionLog] = useState<Record<string, unknown>[]>([])
  const [diagram, setDiagram] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [customLabel, setCustomLabel] = useState('')
  const [customCost, setCustomCost] = useState(2)
  const [customWhy, setCustomWhy] = useState('')
  const [pendingCustoms, setPendingCustoms] = useState<
    { label: string; cost: number; why?: string[]; tags?: string[] }[]
  >([])
  const [whyFocusId, setWhyFocusId] = useState<string | null>(null)

  const payload = useMemo(() => parsePayload(pack?.payload), [pack])
  const stage = payload.stages[stageIndex]
  const unitLabel = payload.budget.unitLabel ?? 'Points'
  const mode = payload.difficultyMode ?? 'intermediate'
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
        setRemaining(
          typeof progress?.remaining === 'number' ? progress.remaining : pl.budget.total,
        )
        setReserved(typeof progress?.reserved === 'number' ? progress.reserved : 0)
        setDecisionLog(
          Array.isArray(progress?.decisionLog)
            ? (progress!.decisionLog as Record<string, unknown>[])
            : [],
        )
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
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const toggleSelect = useCallback(
    (id: string) => {
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
        }
        return next
      })
    },
    [payload.investments, estCostById, remaining, reserved, spentSelected, whyFocusId],
  )

  const submitStage = useCallback(async () => {
    // Validate why for each pick
    for (const id of selected) {
      const why = whyById[id]
      if (!why || why.size === 0) {
        toast.error('Add a why for each selected investment')
        setWhyFocusId(id)
        setGate('why')
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
      setDecisionLog(
        Array.isArray(progress.decisionLog)
          ? (progress.decisionLog as Record<string, unknown>[])
          : [],
      )
      setSelected(new Set())
      setWhyById({})
      setTargetsById({})
      setPendingCustoms([])
      setDeferred(new Set())

      if (res.complete) {
        const rep = await studioApi.getBudgetReport(attemptId)
        setReport(rep.report)
        setGate('complete')
        toast.success('Budget track complete')
      } else if (res.grade?.accepted) {
        setStageIndex(
          typeof res.nextStageIndex === 'number' ? res.nextStageIndex : stageIndex + 1,
        )
        setGate('stageResult')
        toast.success('Stage accepted')
      } else {
        setGate('stageResult')
        toast.message(String(res.grade?.narrative ?? 'Revise allocation'))
      }
    } catch (e) {
      toast.error((e as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [
    selected,
    whyById,
    targetsById,
    estCostById,
    reserved,
    deferred,
    pendingCustoms,
    diagram,
    attemptId,
    remaining,
    stageIndex,
  ])

  const applyInvestmentStub = useCallback(
    (inv: BudgetInvestment) => {
      // Optional canvas apply: tag touched nodes with stereotype note
      const hints = new Set((inv.appliesToHints ?? []).map(h => h.toLowerCase()))
      if (!hints.size) return
      setDiagram(prev => ({
        ...prev,
        nodes: prev.nodes.map(raw => {
          const n = raw as Record<string, unknown>
          const data = (n.data as Record<string, unknown> | undefined) ?? {}
          const name = String(data.name ?? '').toLowerCase()
          if (![...hints].some(h => name.includes(h.toLowerCase()) || h.includes(name))) {
            return raw
          }
          return {
            ...n,
            data: {
              ...data,
              stereotype: inv.id,
            },
          }
        }),
      }))
    },
    [],
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    )
  }

  if (!pack || !stage) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center text-ink-muted">
        Challenge pack missing or complete.
      </div>
    )
  }

  const focusInv = whyFocusId
    ? payload.investments.find(i => i.id === whyFocusId)
    : payload.investments.find(i => selected.has(i.id))

  return (
    <CategoryShell
      title={pack.title}
      subtitle={
        payload.comboMode
          ? payload.comboBlurb ?? 'Budget + Evolution combined journey'
          : payload.auctionMode
            ? payload.auctionBlurb ?? 'Auction mode — highest value under scarcity'
            : stage.title
      }
      backHref="/design-studio/budget"
      backLabel="Tracks"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          {gate === 'brief' && (
            <section className="space-y-4">
              <article className="prose prose-sm max-w-none whitespace-pre-wrap text-ink">
                {payload.briefing ?? payload.scenario}
              </article>
              {payload.constraints && (
                <ul className="flex flex-wrap gap-2 font-mono text-[11px] text-ink-faint">
                  {payload.constraints.maxNewClasses != null && (
                    <li className="rounded border border-hairline px-2 py-1">
                      Max new classes: {payload.constraints.maxNewClasses}
                    </li>
                  )}
                  {payload.constraints.maxNewAbstractions != null && (
                    <li className="rounded border border-hairline px-2 py-1">
                      Max abstractions: {payload.constraints.maxNewAbstractions}
                    </li>
                  )}
                  {payload.constraints.maxExternalSystems != null && (
                    <li className="rounded border border-hairline px-2 py-1">
                      Max external systems: {payload.constraints.maxExternalSystems}
                    </li>
                  )}
                  {payload.constraints.teamSize != null && (
                    <li className="rounded border border-hairline px-2 py-1">
                      Team: {payload.constraints.teamSize}
                    </li>
                  )}
                  {payload.constraints.deadlineDays != null && (
                    <li className="rounded border border-hairline px-2 py-1">
                      Deadline: {payload.constraints.deadlineDays}d
                    </li>
                  )}
                </ul>
              )}
              <div className="h-[280px] overflow-hidden rounded-lg border border-hairline">
                <DebuggerCanvas
                  diagram={diagram}
                  readOnly
                  selectedId={null}
                  onSelect={() => {}}
                  hideEditChrome
                />
              </div>
              <button
                type="button"
                onClick={() => setGate('allocate')}
                className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-brand-foreground"
              >
                Open marketplace
              </button>
            </section>
          )}

          {(gate === 'allocate' || gate === 'why') && (
            <section className="space-y-4">
              <div className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2">
                <p className="font-mono text-[10px] uppercase text-ink-faint">
                  {stage.dayLabel} · {stage.title}
                </p>
                <p className="mt-1 text-[13px] text-ink">{stage.narrative}</p>
                {stage.revealMetrics && (
                  <p className="mt-1 font-mono text-[11px] text-ink-faint">
                    {Object.entries(stage.revealMetrics)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                )}
                {typeof stage.budgetDelta === 'number' && stage.budgetDelta !== 0 && (
                  <p className="mt-1 text-[12px] text-brand">
                    +{stage.budgetDelta} {unitLabel} this stage
                  </p>
                )}
              </div>

              <PriorityBoard
                priorities={priorities}
                pressures={pressures}
                deferredIds={deferred}
                onToggleDefer={id =>
                  setDeferred(prev => {
                    const n = new Set(prev)
                    if (n.has(id)) n.delete(id)
                    else n.add(id)
                    return n
                  })
                }
              />

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

              {payload.budget.reserveAllowed !== false && (
                <label className="flex items-center gap-2 text-[13px] text-ink">
                  Reserve for later
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, remaining - spentSelected)}
                    value={reserved}
                    onChange={e => setReserved(Math.max(0, Number(e.target.value) || 0))}
                    className="w-20 rounded border border-hairline bg-paper px-2 py-1 font-mono text-[12px]"
                  />
                  {payload.suggestedReserve != null && (
                    <button
                      type="button"
                      className="font-mono text-[11px] text-brand"
                      onClick={() => setReserved(payload.suggestedReserve!)}
                    >
                      Suggest {payload.suggestedReserve}
                    </button>
                  )}
                </label>
              )}

              {(mode === 'expert' || payload.auctionMode) && (
                <div className="rounded-lg border border-dashed border-hairline p-3">
                  <p className="text-[12px] font-medium text-ink">Propose custom investment</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      value={customLabel}
                      onChange={e => setCustomLabel(e.target.value)}
                      placeholder="Label"
                      className="rounded border border-hairline px-2 py-1 text-[12px]"
                    />
                    <input
                      type="number"
                      value={customCost}
                      onChange={e => setCustomCost(Number(e.target.value))}
                      className="w-20 rounded border border-hairline px-2 py-1 font-mono text-[12px]"
                    />
                    <input
                      value={customWhy}
                      onChange={e => setCustomWhy(e.target.value)}
                      placeholder="Why"
                      className="min-w-[140px] flex-1 rounded border border-hairline px-2 py-1 text-[12px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customLabel.trim()) return
                        if (customCost > remainingAfterDraft) {
                          toast.info('Not enough budget')
                          return
                        }
                        setPendingCustoms(c => [
                          ...c,
                          {
                            label: customLabel.trim(),
                            cost: customCost,
                            why: customWhy ? [customWhy] : ['Custom proposal'],
                            tags: ['custom'],
                          },
                        ])
                        setCustomLabel('')
                        setCustomWhy('')
                      }}
                      className="rounded bg-hairline px-2 py-1 text-[12px]"
                    >
                      Add
                    </button>
                  </div>
                  {pendingCustoms.length > 0 && (
                    <ul className="mt-2 text-[12px] text-ink-muted">
                      {pendingCustoms.map((c, i) => (
                        <li key={i}>
                          {c.label} ({c.cost})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {focusInv && (
                <div className="space-y-2">
                  <InvestmentWhyPanel
                    investment={focusInv}
                    why={whyById[focusInv.id] ?? new Set()}
                    targets={targetsById[focusInv.id] ?? new Set()}
                    estimatedCost={estCostById[focusInv.id]}
                    expertMode={mode === 'expert'}
                    onToggleWhy={opt =>
                      setWhyById(prev => {
                        const cur = new Set(prev[focusInv.id] ?? [])
                        if (cur.has(opt)) cur.delete(opt)
                        else cur.add(opt)
                        return { ...prev, [focusInv.id]: cur }
                      })
                    }
                    onToggleTarget={name =>
                      setTargetsById(prev => {
                        const cur = new Set(prev[focusInv.id] ?? [])
                        if (cur.has(name)) cur.delete(name)
                        else cur.add(name)
                        return { ...prev, [focusInv.id]: cur }
                      })
                    }
                    onEstimatedCost={n =>
                      setEstCostById(prev => ({ ...prev, [focusInv.id]: n }))
                    }
                  />
                  <TradeoffReveal
                    cost={estCostById[focusInv.id] ?? focusInv.cost}
                    benefits={focusInv.benefits}
                    complexities={focusInv.complexities}
                    risks={focusInv.risks}
                    mode={mode}
                  />
                </div>
              )}

              <div className="h-[220px] overflow-hidden rounded-lg border border-hairline">
                <DebuggerCanvas
                  diagram={diagram}
                  readOnly={false}
                  selectedId={null}
                  onSelect={() => {}}
                  onDiagramChange={setDiagram}
                  hideEditChrome
                />
              </div>

              <button
                type="button"
                disabled={busy || remainingAfterDraft < 0}
                onClick={() => void submitStage()}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-brand-foreground',
                  (busy || remainingAfterDraft < 0) && 'opacity-50',
                )}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit allocation
              </button>
            </section>
          )}

          {gate === 'stageResult' && lastGrade && (
            <section className="space-y-4">
              <h2 className="font-serif text-xl text-ink">Stage result</h2>
              <p className="text-[14px] text-ink-muted">{String(lastGrade.narrative)}</p>
              {Array.isArray(lastGrade.opportunityCost) &&
                (lastGrade.opportunityCost as string[]).map((t, i) => (
                  <p key={i} className="text-[13px] text-amber-800">
                    {t}
                  </p>
                ))}
              <button
                type="button"
                onClick={() => {
                  if (stageIndex >= payload.stages.length) {
                    void studioApi.getBudgetReport(attemptId).then(r => {
                      setReport(r.report)
                      setGate('complete')
                    })
                  } else {
                    setGate('allocate')
                    setLastGrade(null)
                  }
                }}
                className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-brand-foreground"
              >
                {stageIndex >= payload.stages.length ? 'View report' : 'Continue'}
              </button>
            </section>
          )}

          {gate === 'complete' && report && (
            <BudgetComplete
              report={report}
              unitLabel={unitLabel}
              diagram={diagram}
              onReplay={() => setGate('replay')}
            />
          )}

          {gate === 'replay' && (
            <section className="space-y-4">
              <h2 className="font-serif text-xl text-ink">Decision replay</h2>
              <BudgetReplay entries={decisionLog} />
              <button
                type="button"
                onClick={() => setGate('complete')}
                className="rounded-lg border border-hairline px-4 py-2 text-[13px]"
              >
                Back to report
              </button>
            </section>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <BudgetMeter
            total={payload.budget.total}
            remaining={Math.max(0, remainingAfterDraft)}
            reserved={reserved}
            unitLabel={unitLabel}
          />
          <div className="rounded-lg border border-hairline px-3 py-2 font-mono text-[11px] text-ink-faint">
            <p>
              Stage {stageIndex + 1}/{payload.stages.length}
            </p>
            <p className="mt-1">Mode: {mode}</p>
            {payload.auctionMode && <p className="mt-1 text-brand">Auction framing on</p>}
            <p className="mt-1">
              Draft spend {spentSelected}
              {pendingCustoms.length ? ` +${pendingCustoms.length} custom` : ''}
            </p>
          </div>
        </aside>
      </div>
    </CategoryShell>
  )
}
