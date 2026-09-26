'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { learnApi } from '@/lib/learn-api'
import type {
  FullRun, RoguelikeScenario, Stage, DecisionOption,
  ArchitectureHealth, RunResources,
} from '@/lib/learn-api'
import { RunMap } from './RunMap'
import { EventCard } from './EventCard'
import { DecisionCard } from './DecisionCard'
import { ArchitectureHealthPanel } from './ArchitectureHealth'
import { ResourceTracker } from './ResourceTracker'
import { RunSummary } from './RunSummary'
import { RoguelikeCanvas } from './RoguelikeCanvas'
import type { SimpleNode, SimpleEdge } from './RoguelikeCanvas'

type Phase = 'loading' | 'event' | 'decision' | 'canvas' | 'result' | 'complete' | 'failed'

interface StageResultOverlay {
  passed: boolean
  stageTitle: string
  healthBefore: ArchitectureHealth
  healthAfter: ArchitectureHealth
  resourcesAfter: RunResources
}

interface Props {
  runId: string
}

export function RunPlayer({ runId }: Props) {
  const router = useRouter()
  const [run, setRun] = useState<FullRun | null>(null)
  const [scenario, setScenario] = useState<RoguelikeScenario | null>(null)
  const [currentStage, setCurrentStage] = useState<Stage | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [stageResult, setStageResult] = useState<StageResultOverlay | null>(null)
  const [selectedDecision, setSelectedDecision] = useState<DecisionOption | null>(null)
  const [architectureNotes, setArchitectureNotes] = useState('')
  const [diagramNodes, setDiagramNodes] = useState<SimpleNode[]>([])
  const [diagramEdges, setDiagramEdges] = useState<SimpleEdge[]>([])
  const [submitting, setSubmitting] = useState(false)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load run + scenario
  useEffect(() => {
    if (!runId) return
    let cancelled = false
    ;(async () => {
      try {
        const { run: fullRun } = await learnApi.roguelikeV2.getRun(runId)
        if (cancelled) return
        setRun(fullRun)

        if (fullRun.status === 'completed' || fullRun.status === 'failed') {
          const { scenario: sc } = await learnApi.roguelikeV2.getScenario(fullRun.scenarioSlug)
          if (!cancelled) {
            setScenario(sc)
            setPhase(fullRun.status === 'completed' ? 'complete' : 'failed')
          }
          return
        }

        const [{ scenario: sc }] = await Promise.all([
          learnApi.roguelikeV2.getScenario(fullRun.scenarioSlug),
        ])
        if (cancelled) return
        setScenario(sc)

        // Find current stage
        const stage = sc.stages.find(s => s.order === fullRun.currentStageOrder) ?? sc.stages[0]
        setCurrentStage(stage ?? null)
        setPhase('event')
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Failed to load run')
        }
      }
    })()
    return () => { cancelled = true }
  }, [runId])

  const submitStage = useCallback(async (opts: {
    decisionMade?: string
    decisionLabel?: string
    isSkip?: boolean
    isRefactor?: boolean
    withDiagram?: boolean
  }) => {
    if (!run || !currentStage || submitting) return
    setSubmitting(true)
    try {
      const res = await learnApi.roguelikeV2.submitStage(runId, {
        stageId: currentStage.id,
        decisionMade: opts.decisionMade,
        decisionLabel: opts.decisionLabel,
        architectureNotes: architectureNotes || undefined,
        diagramSnapshot: opts.withDiagram ? { nodes: diagramNodes, edges: diagramEdges } : undefined,
        isSkip: opts.isSkip,
        isRefactor: opts.isRefactor,
      })

      setRun(res.run as FullRun)
      setStageResult(res.stageResult)
      setPhase('result')

      // Auto-advance after 3 seconds
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
      resultTimerRef.current = setTimeout(() => {
        advanceFromResult(res.run as FullRun, res.nextStage, res.currentStage)
      }, 3000)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit stage')
    } finally {
      setSubmitting(false)
    }
  }, [run, currentStage, submitting, runId, architectureNotes, diagramNodes, diagramEdges])

  function advanceFromResult(updatedRun: FullRun, nextStage: Stage | null, _currentStage: Stage) {
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)

    if (updatedRun.status === 'completed') {
      setPhase('complete')
      return
    }
    if (updatedRun.status === 'failed') {
      setPhase('failed')
      return
    }

    if (nextStage) {
      setCurrentStage(nextStage)
      setSelectedDecision(null)
      setArchitectureNotes('')
      setDiagramNodes([])
      setDiagramEdges([])
      setStageResult(null)
      setPhase('event')
    } else {
      setPhase('complete')
    }
  }

  async function handleRestoreCheckpoint(order: number) {
    try {
      const { run: updatedRun } = await learnApi.roguelikeV2.restoreCheckpoint(runId, order)
      setRun(updatedRun as FullRun)
      const stage = scenario?.stages.find(s => s.order === updatedRun.currentStageOrder) ?? null
      setCurrentStage(stage)
      setPhase('event')
      setStageResult(null)
      toast.success(`Restored to Stage ${order}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to restore checkpoint')
    }
  }

  // Derived
  const mapStages = scenario?.stages ?? []
  const completedStages = run?.stages ?? []
  const checkpoints = run?.checkpoints ?? []

  // Loading
  if (phase === 'loading' || !run || !scenario) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    )
  }

  // Complete / failed → full RunSummary
  if ((phase === 'complete' || phase === 'failed') && run.stages) {
    return (
      <RunSummary
        run={run}
        scenario={scenario}
        onPlayAgain={() => router.push('/learn/roguelike')}
        onBrowse={() => router.push('/learn/roguelike')}
      />
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      {/* Resource bar */}
      <ResourceTracker
        resources={run.resources}
        scenarioTitle={scenario.title}
        mode={run.mode}
        stagesCompleted={completedStages.length}
        stagesTotal={run.stagesTotal}
        checkpoints={checkpoints}
        currentOrder={run.currentStageOrder}
        onRestoreCheckpoint={handleRestoreCheckpoint}
      />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Run Map */}
        <RunMap
          stages={mapStages}
          currentOrder={run.currentStageOrder}
          completedStages={completedStages}
          checkpoints={checkpoints}
        />

        {/* Center: Main content */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          {phase === 'canvas' && currentStage ? (
            /* Canvas phase */
            <div className="flex flex-col h-full">
              <div className="shrink-0 border-b border-hairline bg-paper-elevated px-5 py-3">
                <h2 className="font-serif text-lg font-medium text-ink">{currentStage.title}</h2>
                <p className="text-[13px] text-ink-muted mt-0.5">{currentStage.event.description}</p>
              </div>
              <div className="flex-1 min-h-0">
                <RoguelikeCanvas
                  nodes={diagramNodes}
                  edges={diagramEdges}
                  onChange={(n, e) => { setDiagramNodes(n); setDiagramEdges(e) }}
                />
              </div>
              <div className="shrink-0 border-t border-hairline bg-paper-elevated px-5 py-3 space-y-2">
                <textarea
                  value={architectureNotes}
                  onChange={e => setArchitectureNotes(e.target.value)}
                  placeholder="Architecture notes (explain your design decisions)…"
                  className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand resize-none h-16"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPhase('decision')}
                    className="text-[12px] text-ink-muted hover:text-ink transition-colors"
                  >
                    ← Back to choices
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => submitStage({
                      decisionMade: selectedDecision?.id,
                      decisionLabel: selectedDecision?.label,
                      withDiagram: true,
                    })}
                    className="rounded-lg bg-brand px-5 py-2 text-[13px] font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Design →'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Default: show stage summary */
            <div className="flex flex-1 items-center justify-center p-8">
              {currentStage ? (
                <div className="max-w-lg text-center">
                  <div className="text-5xl mb-4">{currentStage.event.icon || '❓'}</div>
                  <h2 className="font-serif text-2xl font-medium text-ink mb-2">{currentStage.title}</h2>
                  <p className="text-[14px] leading-relaxed text-ink-muted">{currentStage.event.description}</p>
                  <p className="mt-6 text-[12px] text-ink-faint">Waiting for your decision…</p>
                </div>
              ) : (
                <div className="text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-ink-faint mx-auto" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Architecture Health */}
        <ArchitectureHealthPanel
          health={run.health}
          previousHealth={completedStages.length > 0 ? completedStages[completedStages.length - 1]?.healthBefore : undefined}
        />
      </div>

      {/* Modals */}
      {phase === 'event' && currentStage && (
        <EventCard
          stage={currentStage}
          debtAmount={run.health.debt}
          onContinue={() => {
            if (currentStage.event.decisions && currentStage.event.decisions.length > 0) {
              setPhase('decision')
            } else if (currentStage.event.requiresDesign) {
              setPhase('canvas')
            } else {
              submitStage({})
            }
          }}
          onSkip={() => submitStage({ isSkip: true })}
          onRefactor={() => submitStage({ isRefactor: true })}
        />
      )}

      {phase === 'decision' && currentStage && (
        <DecisionCard
          stage={currentStage}
          onDecide={(opt) => {
            setSelectedDecision(opt)
            if (currentStage.event.requiresDesign) {
              setPhase('canvas')
            } else {
              submitStage({ decisionMade: opt.id, decisionLabel: opt.label })
            }
          }}
          onCanvasInstead={currentStage.event.requiresDesign ? () => setPhase('canvas') : null}
          onSkip={() => submitStage({ isSkip: true })}
        />
      )}

      {phase === 'result' && stageResult && (
        <StageResultOverlay
          result={stageResult}
          onNext={() => {
            if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
            // We need to refetch to get next stage info — use current run state
            if (run.status === 'completed') { setPhase('complete'); return }
            if (run.status === 'failed') { setPhase('failed'); return }
            const nextOrder = run.currentStageOrder
            const nextStage = scenario.stages.find(s => s.order === nextOrder) ?? null
            setCurrentStage(nextStage)
            setSelectedDecision(null)
            setArchitectureNotes('')
            setDiagramNodes([])
            setDiagramEdges([])
            setStageResult(null)
            setPhase(nextStage ? 'event' : 'complete')
          }}
        />
      )}
    </div>
  )
}

function StageResultOverlay({
  result,
  onNext,
}: {
  result: StageResultOverlay
  onNext: () => void
}) {
  const healthKeys: (keyof ArchitectureHealth)[] = ['coupling', 'cohesion', 'extensibility', 'complexity', 'reliability']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden">
        {/* Result banner */}
        <div className={cn('px-5 py-4 text-center', result.passed ? 'bg-emerald-50' : 'bg-red-50')}>
          <div className="text-4xl mb-2">{result.passed ? '✓' : '✗'}</div>
          <h2 className={cn('font-serif text-xl font-semibold', result.passed ? 'text-emerald-700' : 'text-red-700')}>
            {result.passed ? 'Stage Passed' : 'Stage Failed'}
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">{result.stageTitle}</p>
        </div>

        {/* Health deltas */}
        <div className="px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-3">Health Changes</p>
          <div className="space-y-1.5">
            {healthKeys.map(k => {
              const before = result.healthBefore[k] as number
              const after = result.healthAfter[k] as number
              const delta = after - before
              const isLower = k === 'coupling' || k === 'complexity'
              const isGood = delta === 0 ? true : (isLower ? delta < 0 : delta > 0)
              return (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[12px] text-ink-muted capitalize">{k}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink-faint tabular-nums">{before}</span>
                    <span className="text-ink-faint">→</span>
                    <span className="font-mono text-[11px] text-ink tabular-nums">{after}</span>
                    {delta !== 0 && (
                      <span className={cn('font-mono text-[11px] font-medium', isGood ? 'text-emerald-600' : 'text-red-500')}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {/* Debt */}
            <div className="flex items-center justify-between border-t border-hairline pt-1.5 mt-1.5">
              <span className="text-[12px] text-ink-muted">Tech Debt</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-faint tabular-nums">{result.healthBefore.debt}</span>
                <span className="text-ink-faint">→</span>
                <span className="font-mono text-[11px] text-ink tabular-nums">{result.healthAfter.debt}</span>
                {result.healthAfter.debt !== result.healthBefore.debt && (
                  <span className={cn('font-mono text-[11px] font-medium', result.healthAfter.debt > result.healthBefore.debt ? 'text-red-500' : 'text-emerald-600')}>
                    {result.healthAfter.debt > result.healthBefore.debt ? '+' : ''}{result.healthAfter.debt - result.healthBefore.debt}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-hairline px-5 py-3 flex justify-between items-center bg-paper-elevated">
          <p className="text-[11px] text-ink-faint">Auto-advancing in 3s…</p>
          <button
            onClick={onNext}
            className="rounded-lg bg-brand px-4 py-1.5 text-[13px] font-medium text-white hover:bg-brand/90 transition-colors"
          >
            Next Stage →
          </button>
        </div>
      </div>
    </div>
  )
}
