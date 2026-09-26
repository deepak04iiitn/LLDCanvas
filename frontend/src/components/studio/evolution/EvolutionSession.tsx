'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { SplitCanvas } from '@/components/studio/refactor/SplitCanvas'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import { EvolutionTimeline } from '@/components/studio/evolution/EvolutionTimeline'
import { StagePressureCard } from '@/components/studio/evolution/StagePressureCard'
import { PressurePicker } from '@/components/studio/evolution/PressurePicker'
import {
  ClassifyPanel,
  type ClassifyBucket,
} from '@/components/studio/evolution/ClassifyPanel'
import { EvolveOrHold } from '@/components/studio/evolution/EvolveOrHold'
import { DebtPrompt } from '@/components/studio/evolution/DebtPrompt'
import { WhyChangePanel } from '@/components/studio/evolution/WhyChangePanel'
import { TradeoffAck } from '@/components/studio/evolution/TradeoffAck'
import { EvolutionToolbar } from '@/components/studio/evolution/EvolutionToolbar'
import { EvolutionComplete } from '@/components/studio/evolution/EvolutionComplete'
import { GuidedModeOverlay } from '@/components/studio/evolution/GuidedModeOverlay'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'

export interface EvolutionSessionProps {
  attemptId: string
}

type Gate =
  | 'brief'
  | 'pressure'
  | 'classify'
  | 'decide'
  | 'debt'
  | 'why'
  | 'tradeoffs'
  | 'edit'
  | 'stageResult'
  | 'plannr'

interface EvoStage {
  id: string
  dayLabel: string
  title: string
  category?: string
  narrative: string
  metrics?: {
    users?: number
    ordersPerDay?: number
    latencyMs?: number
    availability?: string
  }
  pressureOptions: string[]
  expectedPressures?: string[]
  mustChange: boolean
  doNothingHint?: string
  debtOpportunity?: {
    id: string
    prompt: string
    costIfDeferred: string
    laterStageId?: string
  }
  introduceCatalog?: { namePattern: string; benefits: string[]; costs: string[] }[]
  complexityBudget?: number
  approachHints?: string[]
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

function cloneDiagram(d: DebuggerDiagram): DebuggerDiagram {
  return JSON.parse(JSON.stringify(d)) as DebuggerDiagram
}

function nodeName(n: unknown): string {
  const node = n as { data?: { name?: string }; id?: string }
  return String(node.data?.name ?? node.id ?? 'Class')
}

export function EvolutionSession({ attemptId }: EvolutionSessionProps) {
  const router = useRouter()
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [gate, setGate] = useState<Gate>('brief')
  const [stageIndex, setStageIndex] = useState(0)
  const [baseline, setBaseline] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working, setWorking] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack, setUndoStack] = useState<DebuggerDiagram[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pressures, setPressures] = useState<Set<string>>(new Set())
  const [buckets, setBuckets] = useState<Record<string, ClassifyBucket>>({})
  const [introduceText, setIntroduceText] = useState('')
  const [decision, setDecision] = useState<'change' | 'noop' | null>(null)
  const [debtAction, setDebtAction] = useState<'fix' | 'defer' | null>(null)
  const [why, setWhy] = useState<Set<string>>(new Set())
  const [whyNote, setWhyNote] = useState('')
  const [tradeoffs, setTradeoffs] = useState<Set<string>>(new Set())
  const [lastGrade, setLastGrade] = useState<Record<string, unknown> | null>(null)
  const [versions, setVersions] = useState<Record<string, unknown>[]>([])
  const [decisionLog, setDecisionLog] = useState<Record<string, unknown>[]>([])
  const [debt, setDebt] = useState<{ open: string[]; resolved: string[]; score: number }>({
    open: [],
    resolved: [],
    score: 0,
  })
  const [journeyIndex, setJourneyIndex] = useState(0)
  const [viewVersionIndex, setViewVersionIndex] = useState<number | null>(null)
  const [startedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [showGuidedOverlay, setShowGuidedOverlay] = useState(false)

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

  // Guided mode: enabled when pack says so OR user hasn't done a first run yet
  const isGuidedMode = useMemo(() => {
    if (payload.guidedMode === true) return true
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('evolution_first_run')
  }, [payload.guidedMode])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const resetStageForm = useCallback(() => {
    setPressures(new Set())
    setBuckets({})
    setIntroduceText('')
    setDecision(null)
    setDebtAction(null)
    setWhy(new Set())
    setWhyNote('')
    setTradeoffs(new Set())
    setLastGrade(null)
    setUndoStack([])
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
        const vers = Array.isArray(progress?.versions)
          ? (progress!.versions as Record<string, unknown>[])
          : []
        const idx = typeof progress?.stageIndex === 'number' ? progress.stageIndex : 0
        const lastDiagram =
          vers.length > 0
            ? normalizeDiagram(vers[vers.length - 1]?.diagram ?? snap)
            : snap
        setBaseline(lastDiagram)
        setWorking(cloneDiagram(lastDiagram))
        setStageIndex(idx)
        setVersions(vers)
        setDecisionLog(
          Array.isArray(progress?.decisionLog)
            ? (progress!.decisionLog as Record<string, unknown>[])
            : [],
        )
        const d = progress?.debt as { open?: string[]; resolved?: string[]; score?: number } | undefined
        setDebt({
          open: d?.open ?? [],
          resolved: d?.resolved ?? [],
          score: d?.score ?? 0,
        })
        if ((res.attempt as { status?: string })?.status === 'submitted') {
          setGate('plannr')
          setJourneyIndex(Math.max(0, vers.length - 1))
        } else if (idx === 0 && vers.length <= 1) {
          setGate('brief')
        } else {
          setGate('pressure')
        }
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const componentNames = useMemo(
    () => (working.nodes ?? []).map(nodeName),
    [working.nodes],
  )

  const debtDueNote = useMemo(() => {
    if (!stage) return undefined
    const due = debt.open.filter(id => {
      const owner = stages.find(s => s.debtOpportunity?.id === id)
      return owner?.debtOpportunity?.laterStageId === stage.id
    })
    if (!due.length) return undefined
    return due
      .map(id => stages.find(s => s.debtOpportunity?.id === id)?.debtOpportunity?.costIfDeferred ?? id)
      .join('; ')
  }, [debt.open, stage, stages])

  const onWorkingChange = useCallback(
    (next: DebuggerDiagram) => {
      setUndoStack(s => [...s.slice(-19), cloneDiagram(working)])
      setWorking(next)
    },
    [working],
  )

  const onUndo = useCallback(() => {
    setUndoStack(s => {
      if (!s.length) return s
      const prev = s[s.length - 1]
      setWorking(prev)
      return s.slice(0, -1)
    })
  }, [])

  const addNode = useCallback(
    (nodeType: 'class' | 'interface') => {
      const id = `n-${nanoid(6)}`
      const elementId = `el-${nanoid(6)}`
      onWorkingChange({
        nodes: [
          ...(working.nodes ?? []),
          {
            id,
            position: { x: 120 + Math.random() * 200, y: 80 + Math.random() * 160 },
            data: {
              elementId,
              nodeType,
              name: nodeType === 'interface' ? 'NewInterface' : 'NewClass',
              methods: [],
              attributes: [],
            },
          },
        ],
        edges: working.edges ?? [],
      })
    },
    [working, onWorkingChange],
  )

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

  const buildClassifyPayload = () => {
    const keep: string[] = []
    const change: string[] = []
    const remove: string[] = []
    for (const [name, b] of Object.entries(buckets)) {
      if (b === 'keep') keep.push(name)
      else if (b === 'change') change.push(name)
      else if (b === 'remove') remove.push(name)
    }
    const introduce = introduceText
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean)
    return { keep, change, introduce, remove }
  }

  const submitStage = async (forced?: 'change' | 'noop') => {
    const d = forced ?? decision
    if (!d) {
      toast.error('Choose Hold or Evolve first')
      return
    }
    if (pressures.size === 0) {
      toast.error('Select at least one architectural pressure')
      return
    }
    setBusy(true)
    try {
      await studioApi.saveEvolution(attemptId, working).catch(() => undefined)
      const debtActions =
        stage?.debtOpportunity && debtAction
          ? [{ id: stage.debtOpportunity.id, action: debtAction }]
          : []
      const res = await studioApi.submitEvolutionStage(attemptId, {
        decision: d,
        pressures: [...pressures],
        classify: buildClassifyPayload(),
        diagramData: d === 'change' ? working : undefined,
        why: [...why],
        whyNote: whyNote || undefined,
        tradeoffsAck: [...tradeoffs],
        debtActions,
      })
      setLastGrade(res.grade)
      const prog = res.progress as {
        versions?: Record<string, unknown>[]
        decisionLog?: Record<string, unknown>[]
        debt?: { open: string[]; resolved: string[]; score: number }
        stageIndex?: number
      }
      setVersions(prog.versions ?? [])
      setDecisionLog(prog.decisionLog ?? [])
      if (prog.debt) setDebt(prog.debt)
      setStageIndex(res.nextStageIndex)
      if (res.complete) {
        toast.success('Track complete')
        setGate('plannr')
        setJourneyIndex(Math.max(0, (prog.versions?.length ?? 1) - 1))
        // Mark first guided run as done, show overlay
        if (isGuidedMode && typeof window !== 'undefined' && !localStorage.getItem('evolution_first_run')) {
          localStorage.setItem('evolution_first_run', 'done')
          setShowGuidedOverlay(true)
        }
      } else if (res.grade?.accepted) {
        toast.success('Stage accepted')
        const nextDiag = normalizeDiagram(
          (prog.versions?.[prog.versions.length - 1] as { diagram?: unknown })?.diagram ?? working,
        )
        setBaseline(nextDiag)
        setWorking(cloneDiagram(nextDiag))
        setGate('stageResult')
      } else {
        toast.message(String(res.grade?.narrative ?? 'Not accepted yet'))
        setGate('stageResult')
      }
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  const continueAfterStage = () => {
    if (!lastGrade?.accepted) {
      // retry same stage
      resetStageForm()
      setGate('pressure')
      return
    }
    if (stageIndex >= stages.length) {
      setGate('plannr')
      return
    }
    resetStageForm()
    setGate('pressure')
  }

  const elapsed = Math.floor((now - startedAt) / 1000)
  const timerLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    )
  }

  if (!pack) {
    return (
      <CategoryShell title="Not found" backHref="/design-studio/evolution" backLabel="Evolution">
        <p className="p-8 text-center text-[13px] text-ink-muted">Attempt or pack missing.</p>
      </CategoryShell>
    )
  }

  if (gate === 'plannr') {
    return (
      <CategoryShell
        title={pack.title}
        subtitle="Architecture journey"
        backHref="/design-studio/evolution"
        backLabel="Tracks"
      >
        {showGuidedOverlay && (
          <GuidedModeOverlay
            onDismiss={() => {
              setShowGuidedOverlay(false)
              router.push('/design-studio/evolution')
            }}
            onTryFullMode={() => {
              setShowGuidedOverlay(false)
              router.push('/design-studio/evolution')
            }}
          />
        )}
        <EvolutionComplete
          versions={versions as never[]}
          decisionLog={decisionLog as never[]}
          debt={debt}
          selectedIndex={journeyIndex}
          onSelectVersion={setJourneyIndex}
        />
      </CategoryShell>
    )
  }

  const viewingPast =
    viewVersionIndex != null && versions[viewVersionIndex]
      ? normalizeDiagram((versions[viewVersionIndex] as { diagram?: unknown }).diagram)
      : null

  return (
    <CategoryShell
      title={pack.title}
      subtitle={stage?.title ?? pack.description}
      backHref="/design-studio/evolution"
      backLabel="Tracks"
      timer={<span className="tabular-nums">{timerLabel}</span>}
      actions={
        gate === 'edit' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => submitStage('change')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={14} />}
            Submit stage
          </button>
        ) : null
      }
    >
      <EvolutionTimeline
        stages={stages}
        stageIndex={stageIndex}
        completedCount={Math.max(0, versions.length - 1)}
        onSelectCompleted={i => {
          // versions[0] is baseline; stage i completed lives at versions[i+1]
          const vi = i + 1
          if (versions[vi]) setViewVersionIndex(vi)
        }}
      />

      {viewingPast && (
        <div className="border-b border-hairline bg-paper">
          <div className="flex items-center justify-between px-4 py-2 sm:px-6">
            <p className="font-mono text-[10px] uppercase text-ink-faint">Viewing past version</p>
            <button
              type="button"
              className="text-[12px] text-brand"
              onClick={() => setViewVersionIndex(null)}
            >
              Back to current stage
            </button>
          </div>
          <div className="relative h-[40vh] min-h-[280px]">
            <DebuggerCanvas
              diagram={viewingPast}
              readOnly
              selectedId={null}
              onSelect={() => {}}
              className="absolute inset-0"
              hideEditChrome
            />
          </div>
        </div>
      )}

      {gate === 'brief' && (
        <>
          <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
                Track brief
              </p>
              {isGuidedMode && (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-brand">
                  Guided Mode
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">
              {payload.briefing ?? pack.description}
            </p>
            {isGuidedMode && (
              <p className="mt-2 text-[12px] text-ink-muted">
                🧭 Guided Mode simplifies the flow — classification, debt, and tradeoff steps are
                unlocked after your first run.
              </p>
            )}
            <button
              type="button"
              onClick={() => setGate('pressure')}
              className="mt-4 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white"
            >
              Start Day 0 / first pressure
            </button>
          </div>
          <div className="relative h-[50vh] min-h-[360px] border-t border-hairline">
            <DebuggerCanvas
              diagram={baseline}
              readOnly
              selectedId={null}
              onSelect={() => {}}
              className="absolute inset-0"
              hideEditChrome
            />
          </div>
        </>
      )}

      {gate === 'pressure' && stage && (
        <>
          <StagePressureCard
            dayLabel={stage.dayLabel}
            title={stage.title}
            category={stage.category}
            narrative={stage.narrative}
            metrics={stage.metrics}
            debtDueNote={isGuidedMode ? undefined : debtDueNote}
          />
          <PressurePicker
            options={stage.pressureOptions}
            selected={pressures}
            onToggle={p => {
              setPressures(prev => {
                const next = new Set(prev)
                if (next.has(p)) next.delete(p)
                else next.add(p)
                return next
              })
            }}
          />
          {!isGuidedMode && stage.approachHints && stage.approachHints.length > 0 && (
            <p className="px-4 pb-2 text-[12px] text-ink-faint sm:px-6">
              Soft hints (many paths can work): {stage.approachHints.join(' · ')}
            </p>
          )}
          <div className="px-4 pb-4 sm:px-6">
            <button
              type="button"
              disabled={pressures.size === 0}
              onClick={() => {
                if (isGuidedMode) {
                  // Guided mode: skip classify, go straight to decide
                  setGate('decide')
                } else {
                  // Full mode: seed classify defaults to keep
                  const init: Record<string, ClassifyBucket> = {}
                  for (const n of componentNames) init[n] = 'keep'
                  setBuckets(init)
                  setGate('classify')
                }
              }}
              className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
            >
              {isGuidedMode ? 'Continue to decide' : 'Continue to classify'}
            </button>
          </div>
        </>
      )}

      {gate === 'classify' && stage && (
        <>
          <ClassifyPanel
            componentNames={componentNames}
            buckets={buckets}
            onSet={(name, b) => setBuckets(prev => ({ ...prev, [name]: b }))}
            introduceText={introduceText}
            onIntroduceText={setIntroduceText}
          />
          <div className="px-4 pb-4 sm:px-6">
            <button
              type="button"
              onClick={() => setGate('decide')}
              className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {gate === 'decide' && stage && (
        <>
          {isGuidedMode && (
            <div className="mx-auto max-w-3xl px-4 pt-3 sm:px-6">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-brand">
                Guided Mode · Stage {stageIndex + 1}
              </span>
            </div>
          )}
          <EvolveOrHold
            mustChange={stage.mustChange}
            doNothingHint={stage.doNothingHint}
            decision={decision}
            onDecide={d => {
              setDecision(d)
              if (d === 'noop') {
                // go straight to submit path after confirm
              } else if (isGuidedMode) {
                // Guided mode: skip debt, why, tradeoffs — go straight to edit
                setGate('edit')
              } else if (stage.debtOpportunity) {
                setGate('debt')
              } else {
                setGate('why')
              }
            }}
          />
          {decision === 'noop' && (
            <div className="px-4 pb-4 sm:px-6">
              <button
                type="button"
                disabled={busy}
                onClick={() => submitStage('noop')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Confirm hold &amp; submit
              </button>
            </div>
          )}
        </>
      )}

      {gate === 'debt' && stage?.debtOpportunity && (
        <>
          <DebtPrompt
            id={stage.debtOpportunity.id}
            prompt={stage.debtOpportunity.prompt}
            costIfDeferred={stage.debtOpportunity.costIfDeferred}
            action={debtAction}
            onChoose={a => {
              setDebtAction(a)
              setGate('why')
            }}
          />
        </>
      )}

      {gate === 'why' && stage && (
        <>
          <WhyChangePanel
            selected={why}
            onToggle={w => {
              setWhy(prev => {
                const next = new Set(prev)
                if (next.has(w)) next.delete(w)
                else next.add(w)
                return next
              })
            }}
            note={whyNote}
            onNote={setWhyNote}
          />
          <div className="px-4 pb-4 sm:px-6">
            <button
              type="button"
              disabled={why.size === 0}
              onClick={() => {
                if ((stage.introduceCatalog?.length ?? 0) > 0) setGate('tradeoffs')
                else setGate('edit')
              }}
              className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
            >
              {(stage.introduceCatalog?.length ?? 0) > 0
                ? 'Continue to tradeoffs'
                : 'Unlock canvas'}
            </button>
          </div>
        </>
      )}

      {gate === 'tradeoffs' && stage && (
        <>
          <TradeoffAck
            items={stage.introduceCatalog ?? []}
            acknowledged={tradeoffs}
            onToggle={label => {
              setTradeoffs(prev => {
                const next = new Set(prev)
                if (next.has(label)) next.delete(label)
                else next.add(label)
                return next
              })
            }}
          />
          <div className="px-4 pb-4 sm:px-6">
            <button
              type="button"
              onClick={() => setGate('edit')}
              className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white"
            >
              Unlock canvas
            </button>
          </div>
        </>
      )}

      {gate === 'edit' && stage && (
        <>
          <StagePressureCard
            dayLabel={stage.dayLabel}
            title={stage.title}
            category={stage.category}
            narrative={stage.narrative}
            metrics={stage.metrics}
          />
          <EvolutionToolbar
            onUndo={onUndo}
            canUndo={undoStack.length > 0}
            onAddClass={() => addNode('class')}
            onAddInterface={() => addNode('interface')}
            onDeleteSelected={deleteSelected}
            canDelete={Boolean(selectedId)}
            disabled={busy}
          />
          <SplitCanvas
            original={baseline}
            working={working}
            selectedId={selectedId}
            onSelect={id => setSelectedId(id)}
            onWorkingChange={onWorkingChange}
            originalLabel="Previous version"
            workingLabel="Your evolved design"
          />
        </>
      )}

      {gate === 'stageResult' && lastGrade && (
        <div className="mx-auto max-w-lg space-y-4 px-4 py-8 sm:px-6">
          <p
            className={
              lastGrade.accepted
                ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900'
                : 'rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900'
            }
          >
            {String(lastGrade.narrative)}
          </p>
          <ul className="space-y-2">
            {((lastGrade.dimensions as { key: string; label: string; ok: boolean; detail?: string }[]) ?? []).map(
              d => (
                <li key={d.key} className="flex justify-between gap-2 text-[13px]">
                  <span>
                    {d.label}
                    {d.detail ? (
                      <span className="block text-[11px] text-ink-muted">{d.detail}</span>
                    ) : null}
                  </span>
                  <span>{d.ok ? '✓' : '!'}</span>
                </li>
              ),
            )}
          </ul>
          <button
            type="button"
            onClick={continueAfterStage}
            className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white"
          >
            {lastGrade.accepted
              ? stageIndex >= stages.length
                ? 'View journey'
                : 'Next stage'
              : 'Retry stage'}
          </button>
        </div>
      )}
    </CategoryShell>
  )
}
