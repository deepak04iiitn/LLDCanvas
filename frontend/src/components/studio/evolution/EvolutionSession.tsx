'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { CategoryShell, type BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'
import { SplitCanvas } from '@/components/studio/refactor/SplitCanvas'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import { StagePressureCard } from '@/components/studio/evolution/StagePressureCard'
import { PressurePicker } from '@/components/studio/evolution/PressurePicker'
import { EvolveOrHold } from '@/components/studio/evolution/EvolveOrHold'
import { EvolutionToolbar } from '@/components/studio/evolution/EvolutionToolbar'
import { EvolutionComplete } from '@/components/studio/evolution/EvolutionComplete'
import { GuidedModeOverlay } from '@/components/studio/evolution/GuidedModeOverlay'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

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

export function EvolutionSession({ attemptId, breadcrumb }: EvolutionSessionProps) {
  const router = useRouter()
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [gate, setGate] = useState<Gate>('context')
  const [stageIndex, setStageIndex] = useState(0)
  const [baseline, setBaseline] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working, setWorking] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack, setUndoStack] = useState<DebuggerDiagram[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pressures, setPressures] = useState<Set<string>>(new Set())
  const [decision, setDecision] = useState<'change' | 'noop' | null>(null)
  const [lastGrade, setLastGrade] = useState<Record<string, unknown> | null>(null)
  const [versions, setVersions] = useState<Record<string, unknown>[]>([])
  const [decisionLog, setDecisionLog] = useState<Record<string, unknown>[]>([])
  const [debt, setDebt] = useState<{ open: string[]; resolved: string[]; score: number }>({
    open: [],
    resolved: [],
    score: 0,
  })
  const [journeyIndex, setJourneyIndex] = useState(0)
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

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const resetStageForm = useCallback(() => {
    setPressures(new Set())
    setDecision(null)
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
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const componentNames = useMemo(
    () => (working.nodes ?? []).map(nodeName),
    [working.nodes],
  )

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
    if (!lastGrade?.accepted) {
      resetStageForm()
      setGate('decide')
      return
    }
    if (stageIndex >= stages.length) {
      setGate('complete')
      return
    }
    resetStageForm()
    const nextDiag = normalizeDiagram(
      (versions[versions.length - 1] as { diagram?: unknown })?.diagram ?? working,
    )
    setBaseline(nextDiag)
    setWorking(cloneDiagram(nextDiag))
    setGate('context')
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
      <CategoryShell title="Not found" backHref="/design-studio/evolution" backLabel="Evolution" breadcrumb={breadcrumb}>
        <p className="p-8 text-center text-[13px] text-ink-muted">Attempt or pack missing.</p>
      </CategoryShell>
    )
  }

  if (gate === 'complete') {
    return (
      <CategoryShell
        title={pack.title}
        subtitle="Architecture journey"
        backHref="/design-studio/evolution"
        backLabel="Tracks"
        breadcrumb={breadcrumb}
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
          packSlug={pack?.slug ?? ''}
        />
      </CategoryShell>
    )
  }

  // Horizontal stage pill strip component (rendered in edit gate)
  const StagePills = () => (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-hairline bg-paper px-4 py-2 shrink-0">
      {stages.map((s, i) => {
        const isDone = i < versions.length - 1
        const isCurrent = i === stageIndex
        return (
          <button
            key={s.id}
            type="button"
            disabled={!isDone}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-semibold transition-colors',
              isCurrent
                ? 'bg-brand text-white'
                : isDone
                  ? 'bg-brand-tint text-brand hover:opacity-80'
                  : 'bg-paper-elevated text-ink-faint cursor-default',
            )}
          >
            {s.dayLabel}
          </button>
        )
      })}
    </div>
  )

  return (
    <CategoryShell
      title={pack.title}
      subtitle={stage?.title ?? pack.description}
      backHref="/design-studio/evolution"
      backLabel="Tracks"
      breadcrumb={breadcrumb}
      timer={<span className="tabular-nums">{timerLabel}</span>}
      actions={
        gate === 'edit' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitStage('change')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={14} />}
            Submit Stage {stageIndex + 1}
          </button>
        ) : null
      }
      contentClassName={gate === 'edit' ? 'min-h-0 flex-1 flex flex-col overflow-hidden' : undefined}
    >
      {/* ── context gate ──────────────────────────────────────────────── */}
      {gate === 'context' && stage && (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {stageIndex === 0 && payload.briefing && (
            <div className="mb-6 rounded-xl border border-hairline bg-paper-elevated p-5">
              <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
                Track brief
              </p>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">
                {payload.briefing ?? pack.description}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              {stage.dayLabel}
            </p>
            <h2 className="font-serif text-xl font-medium text-ink">{stage.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{stage.narrative}</p>

            {stage.metrics && (
              <div className="mt-3 flex flex-wrap gap-3">
                {stage.metrics.users != null && (
                  <span className="rounded-md border border-hairline bg-paper px-2 py-1 font-mono text-[11px] text-ink-muted">
                    {stage.metrics.users.toLocaleString()} users
                  </span>
                )}
                {stage.metrics.latencyMs != null && (
                  <span className="rounded-md border border-hairline bg-paper px-2 py-1 font-mono text-[11px] text-ink-muted">
                    {stage.metrics.latencyMs}ms latency
                  </span>
                )}
                {stage.metrics.availability && (
                  <span className="rounded-md border border-hairline bg-paper px-2 py-1 font-mono text-[11px] text-ink-muted">
                    {stage.metrics.availability} uptime
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setGate('decide')}
              className="mt-5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              Begin {stage.dayLabel}
            </button>
          </div>

          <div className="relative mt-5 h-[40vh] min-h-[280px] rounded-xl overflow-hidden border border-hairline">
            <DebuggerCanvas
              diagram={baseline}
              readOnly
              selectedId={null}
              onSelect={() => {}}
              className="absolute inset-0"
              hideEditChrome
            />
          </div>
        </div>
      )}

      {/* ── decide gate ───────────────────────────────────────────────── */}
      {gate === 'decide' && stage && (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-4">
          <StagePressureCard
            dayLabel={stage.dayLabel}
            title={stage.title}
            category={stage.category}
            narrative={stage.narrative}
            metrics={stage.metrics}
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

          <EvolveOrHold
            mustChange={stage.mustChange}
            doNothingHint={stage.doNothingHint}
            decision={decision}
            onDecide={d => {
              setDecision(d)
              if (d === 'change') {
                setGate('edit')
              }
            }}
          />

          {decision === 'noop' && (
            <div className="flex">
              <button
                type="button"
                disabled={busy || pressures.size === 0}
                onClick={() => void submitStage('noop')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Confirm hold &amp; submit
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── edit gate ────────────────────────────────────────────────── */}
      {gate === 'edit' && stage && (
        <>
          <StagePills />
          <EvolutionToolbar
            onUndo={onUndo}
            canUndo={undoStack.length > 0}
            onAddClass={() => addNode('class')}
            onAddInterface={() => addNode('interface')}
            onDeleteSelected={deleteSelected}
            canDelete={Boolean(selectedId)}
            disabled={busy}
          />
          <div className="min-h-0 flex-1">
            <SplitCanvas
              original={baseline}
              working={working}
              selectedId={selectedId}
              onSelect={id => setSelectedId(id)}
              onWorkingChange={onWorkingChange}
              originalLabel="Previous version"
              workingLabel="Your evolved design"
            />
          </div>
        </>
      )}

      {/* ── result gate ──────────────────────────────────────────────── */}
      {gate === 'result' && lastGrade && (
        <div className="mx-auto max-w-lg space-y-4 px-4 py-8 sm:px-6">
          <div
            className={cn(
              'rounded-xl border px-5 py-4 text-[13px]',
              lastGrade.accepted
                ? 'border-hairline bg-brand-tint text-ink'
                : 'border-hairline bg-paper-elevated text-ink',
            )}
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint mb-2">
              Stage result
            </p>
            <p>{String(lastGrade.narrative)}</p>
          </div>

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
                  <span className={d.ok ? 'text-brand' : 'text-ink-muted'}>
                    {d.ok ? 'Pass' : 'Miss'}
                  </span>
                </li>
              ),
            )}
          </ul>

          <button
            type="button"
            onClick={continueAfterStage}
            className="rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white"
          >
            {lastGrade.accepted
              ? stageIndex >= stages.length
                ? 'View journey'
                : 'Continue'
              : 'Retry stage'}
          </button>
        </div>
      )}
    </CategoryShell>
  )
}
