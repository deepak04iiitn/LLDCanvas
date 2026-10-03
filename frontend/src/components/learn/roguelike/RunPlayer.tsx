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
import { CanvasPhaseOverlay } from './CanvasPhaseOverlay'

type Phase = 'loading' | 'event' | 'decision' | 'canvas' | 'result' | 'complete' | 'failed'

export interface DesignCriterion {
  id: string; label: string; passed: boolean
  points: number; maxPoints: number; hint: string
}
export interface DesignEval { score: number; criteria: DesignCriterion[] }

interface StageResultOverlay {
  passed: boolean
  stageTitle: string
  healthBefore: ArchitectureHealth
  healthAfter: ArchitectureHealth
  resourcesAfter: RunResources
  designEval?: DesignEval | null
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
  const [designRejection, setDesignRejection] = useState<{ score: number; minScore: number; eval: DesignEval } | null>(null)
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

      // Design gated — don't advance, show rejection overlay
      if (res.designRejected && res.designEval && res.minScore !== undefined) {
        setDesignRejection({ score: res.designEval.score, minScore: res.minScore, eval: res.designEval })
        return
      }

      setRun(res.run as FullRun)
      setStageResult(res.stageResult!)
      setPhase('result')

      if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
      resultTimerRef.current = setTimeout(() => {
        advanceFromResult(res.run as FullRun, res.nextStage ?? null, res.currentStage ?? null)
      }, 3000)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit stage')
    } finally {
      setSubmitting(false)
    }
  }, [run, currentStage, submitting, runId, architectureNotes, diagramNodes, diagramEdges])

  function advanceFromResult(updatedRun: FullRun, nextStage: Stage | null, _currentStage: Stage | null) {
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)

    if (updatedRun.status === 'completed') { setPhase('complete'); return }
    if (updatedRun.status === 'failed')    { setPhase('failed');   return }

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

  const mapStages       = scenario?.stages ?? []
  const completedStages = run?.stages ?? []
  const checkpoints     = run?.checkpoints ?? []

  // Loading
  if (phase === 'loading' || !run || !scenario) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    )
  }

  // Complete / failed → RunSummary
  if ((phase === 'complete' || phase === 'failed') && run.stages) {
    return (
      <RunSummary
        run={run}
        scenario={scenario}
        onPlayAgain={() => router.push('/dashboard/learn/roguelike')}
        onBrowse={() => router.push('/dashboard/learn/roguelike')}
      />
    )
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col overflow-hidden bg-paper">
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

      {/* RunMap — horizontal bar at top */}
      <RunMap
        stages={mapStages}
        currentOrder={run.currentStageOrder}
        completedStages={completedStages}
        checkpoints={checkpoints}
      />

      {/* Main layout — no left rail */}
      <div className="flex flex-1 min-h-0">
        {/* Center: Main content */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          {phase === 'canvas' && currentStage ? (
            /* Canvas phase — handled by full-screen overlay below */
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
            </div>
          ) : (
            /* Default: stage summary */
            <div className="flex flex-1 items-center justify-center p-8">
              {currentStage ? (
                <div className="max-w-lg text-center">
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

      {/* Canvas phase — full-screen overlay */}
      {phase === 'canvas' && currentStage && (
        <CanvasPhaseOverlay
          stage={currentStage}
          run={run}
          scenario={scenario}
          selectedDecision={selectedDecision}
          diagramNodes={diagramNodes}
          diagramEdges={diagramEdges}
          architectureNotes={architectureNotes}
          submitting={submitting}
          onDiagramChange={(n, e) => { setDiagramNodes(n); setDiagramEdges(e) }}
          onNotesChange={setArchitectureNotes}
          onBack={() => { setDesignRejection(null); setPhase('decision') }}
          onSubmit={() => submitStage({
            decisionMade: selectedDecision?.id,
            decisionLabel: selectedDecision?.label,
            withDiagram: true,
          })}
          completedStages={completedStages}
        />
      )}

      {/* Design Rejection Overlay */}
      {designRejection && phase === 'canvas' && (
        <DesignRejectionOverlay
          score={designRejection.score}
          minScore={designRejection.minScore}
          designEval={designRejection.eval}
          onImprove={() => setDesignRejection(null)}
        />
      )}

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
            // Always go to canvas — user draws their design based on the chosen approach
            setPhase('canvas')
          }}
          onCanvasInstead={null}
          onSkip={() => submitStage({ isSkip: true })}
        />
      )}

      {phase === 'result' && stageResult && (
        <StageResultOverlay
          result={stageResult}
          onNext={() => {
            if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
            if (run.status === 'completed') { setPhase('complete'); return }
            if (run.status === 'failed')    { setPhase('failed');   return }
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
  const de = result.designEval

  function scoreColor(s: number) {
    if (s >= 80) return 'text-emerald-600'
    if (s >= 50) return 'text-amber-500'
    return 'text-red-500'
  }
  function scoreBg(s: number) {
    if (s >= 80) return 'bg-emerald-50 border-emerald-200'
    if (s >= 50) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden">

        {/* ── Result banner ─────────────────────────────────────────────── */}
        <div className={cn('px-5 py-4 text-center', result.passed ? 'bg-emerald-50' : 'bg-red-50')}>
          <div className="flex justify-center mb-2">
            {result.passed
              ? <Check className="h-9 w-9 text-emerald-600" />
              : <X     className="h-9 w-9 text-red-600" />}
          </div>
          <h2 className={cn('font-serif text-xl font-semibold', result.passed ? 'text-emerald-700' : 'text-red-700')}>
            {result.passed ? 'Stage Passed' : 'Stage Failed'}
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">{result.stageTitle}</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-hairline">

          {/* ── Health deltas ──────────────────────────────────────────── */}
          <div className="px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint mb-3">Health Changes</p>
            <div className="space-y-1.5">
              {healthKeys.map(k => {
                const before = result.healthBefore[k] as number
                const after  = result.healthAfter[k] as number
                const delta  = after - before
                const isLower = k === 'coupling' || k === 'complexity'
                const isGood  = delta === 0 ? true : (isLower ? delta < 0 : delta > 0)
                return (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[11px] text-ink-muted capitalize">{k}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-ink-faint tabular-nums">{before}</span>
                      <span className="text-[9px] text-ink-faint">→</span>
                      <span className="font-mono text-[10px] text-ink tabular-nums">{after}</span>
                      {delta !== 0 && (
                        <span className={cn('font-mono text-[10px] font-medium', isGood ? 'text-emerald-600' : 'text-red-500')}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between border-t border-hairline pt-1.5 mt-1">
                <span className="text-[11px] text-ink-muted">Tech Debt</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-ink-faint tabular-nums">{result.healthBefore.debt}</span>
                  <span className="text-[9px] text-ink-faint">→</span>
                  <span className="font-mono text-[10px] text-ink tabular-nums">{result.healthAfter.debt}</span>
                  {result.healthAfter.debt !== result.healthBefore.debt && (
                    <span className={cn('font-mono text-[10px] font-medium', result.healthAfter.debt > result.healthBefore.debt ? 'text-red-500' : 'text-emerald-600')}>
                      {result.healthAfter.debt > result.healthBefore.debt ? '+' : ''}{result.healthAfter.debt - result.healthBefore.debt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Design evaluation ──────────────────────────────────────── */}
          <div className="px-4 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint mb-3">Design Score</p>
            {de ? (
              <>
                {/* Score ring */}
                <div className={cn('mb-3 flex items-center gap-3 rounded-xl border px-3 py-2', scoreBg(de.score))}>
                  <span className={cn('font-mono text-[28px] font-bold tabular-nums leading-none', scoreColor(de.score))}>
                    {de.score}
                  </span>
                  <div>
                    <p className={cn('text-[11px] font-semibold', scoreColor(de.score))}>
                      {de.score >= 80 ? 'Excellent design' : de.score >= 60 ? 'Good design' : de.score >= 40 ? 'Mediocre design' : de.score >= 20 ? 'Poor design' : 'Critical failure'}
                    </p>
                    <p className={cn('font-mono text-[9px] mt-0.5', de.score >= 60 ? 'text-emerald-600' : 'text-red-500')}>
                      {de.score >= 80 ? '+cohesion +reliability −coupling −debt' :
                       de.score >= 60 ? '+cohesion −coupling' :
                       de.score >= 40 ? '+5 debt' :
                       de.score >= 20 ? '+12 debt +complexity −reliability' :
                       '+22 debt +coupling +complexity −reliability'}
                    </p>
                  </div>
                </div>

                {/* Criteria checklist */}
                <div className="space-y-1.5">
                  {de.criteria.map(c => (
                    <div key={c.id} className="flex items-start gap-2" title={c.passed ? '' : c.hint}>
                      <span className={cn('mt-px text-[11px]', c.passed ? 'text-emerald-500' : 'text-red-400')}>
                        {c.passed ? '✓' : '✗'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={cn('text-[11px]', c.passed ? 'text-ink-muted' : 'text-ink-muted line-through opacity-60')}>
                          {c.label}
                        </span>
                        {!c.passed && (
                          <p className="text-[10px] text-ink-faint leading-tight mt-0.5">{c.hint}</p>
                        )}
                      </div>
                      <span className={cn('shrink-0 font-mono text-[10px] tabular-nums', c.passed ? 'text-emerald-500' : 'text-ink-faint')}>
                        {c.points}/{c.maxPoints}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[12px] text-ink-faint text-center">
                  No diagram was submitted for this stage
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
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

// ── Design Rejection Overlay ──────────────────────────────────────────────────
function DesignRejectionOverlay({
  score,
  minScore,
  designEval,
  onImprove,
}: {
  score: number
  minScore: number
  designEval: DesignEval
  onImprove: () => void
}) {
  const missing = minScore - score

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-paper border border-ink/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-ink/8">
          <div className="flex items-start gap-4">
            {/* Score display */}
            <div className="shrink-0 flex flex-col items-center justify-center rounded-xl border border-red-400/30 bg-red-400/8 px-4 py-3 min-w-[80px]">
              <span className="font-mono text-2xl font-bold leading-none text-red-400 tabular-nums">{score}</span>
              <span className="font-mono text-[10px] text-red-400/60 mt-0.5">/ 100</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold">Design Rejected</span>
              </div>
              <p className="text-ink/90 font-medium text-sm leading-snug">
                Your design scored <span className="font-bold">{score}/100</span>. You need at least{' '}
                <span className="font-bold text-amber-500">{minScore}</span> to pass this stage.
              </p>
              <p className="text-ink/50 text-xs mt-1">
                {missing} more {missing === 1 ? 'point' : 'points'} needed — improve and resubmit.
              </p>
            </div>
          </div>
        </div>

        {/* Criteria breakdown */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-ink/40 mb-3">Scoring Breakdown</p>

          {designEval.criteria.map(c => (
            <div key={c.id} className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 text-sm ${c.passed ? 'text-emerald-500' : 'text-red-400'}`}>
                {c.passed ? '✓' : '✗'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ink/80">{c.label}</span>
                  <span className={`text-xs font-mono shrink-0 ${c.passed ? 'text-emerald-500' : 'text-red-400/70'}`}>
                    {c.points}/{c.maxPoints} pts
                  </span>
                </div>
                {!c.passed && c.hint && (
                  <p className="text-xs text-ink/45 mt-0.5 leading-snug">{c.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onImprove}
            className="w-full h-10 rounded-xl bg-ink text-paper text-sm font-semibold hover:bg-ink/85 active:scale-98 transition-all"
          >
            Improve Design →
          </button>
          <p className="text-center text-xs text-ink/35 mt-2">
            Your existing nodes are preserved — keep editing and resubmit.
          </p>
        </div>
      </div>
    </div>
  )
}
