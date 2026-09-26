'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import type { ScenarioSummary, RoguelikeScenario, RunState } from '@/lib/learn-api'

type Mode = 'beginner' | 'interview' | 'survival' | 'hardcore' | 'endless'

const MODES: { id: Mode; label: string; description: string; color: string }[] = [
  { id: 'beginner', label: 'Beginner', color: 'border-emerald-400 bg-emerald-50 text-emerald-700', description: 'Predictable requirements. Focus on classes, responsibilities, relationships.' },
  { id: 'interview', label: 'Interview', color: 'border-blue-400 bg-blue-50 text-blue-700', description: 'Timed. Focus on requirement interpretation, extensibility, tradeoffs.' },
  { id: 'survival', label: 'Survival', color: 'border-amber-400 bg-amber-50 text-amber-700', description: 'Unexpected events. Focus on adaptation, coupling, change impact.' },
  { id: 'hardcore', label: 'Hardcore', color: 'border-red-400 bg-red-50 text-red-700', description: 'Limited checkpoints. Limited resources. No easy recovery.' },
  { id: 'endless', label: 'Endless', color: 'border-purple-400 bg-purple-50 text-purple-700', description: 'The system evolves indefinitely. How long can your architecture survive?' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
  hardcore: 'bg-purple-100 text-purple-700',
}

const EVENT_ICONS: Record<string, string> = {
  requirement: '🆕', scale: '📈', failure: '🔥', business: '🏢',
  team: '👥', time: '⏱️', constraint: '🔒', boss: '🐉',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-brand',
  completed: 'text-emerald-600',
  failed: 'text-red-500',
  abandoned: 'text-ink-faint',
}

export function RoguelikeLobby() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([])
  const [recentRuns, setRecentRuns] = useState<RunState[]>([])
  const [loadingScenarios, setLoadingScenarios] = useState(true)
  const [selectedMode, setSelectedMode] = useState<Mode>('beginner')
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSummary | null>(null)
  const [fullScenario, setFullScenario] = useState<RoguelikeScenario | null>(null)
  const [loadingScenario, setLoadingScenario] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startingQuick, setStartingQuick] = useState(false)
  const [featuredScenario, setFeaturedScenario] = useState<ScenarioSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [scenariosRes, runsRes, featuredRes] = await Promise.allSettled([
          learnApi.roguelikeV2.listScenarios(),
          learnApi.roguelikeV2.listRuns(),
          learnApi.roguelikeV2.getFeaturedScenario(),
        ])
        if (cancelled) return
        if (scenariosRes.status === 'fulfilled') {
          setScenarios(scenariosRes.value.scenarios.sort((a, b) => a.order - b.order))
        }
        if (runsRes.status === 'fulfilled') {
          setRecentRuns(runsRes.value.runs.slice(0, 5))
        }
        if (featuredRes.status === 'fulfilled' && featuredRes.value.scenario) {
          setFeaturedScenario(featuredRes.value.scenario)
        }
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load scenarios')
      } finally {
        if (!cancelled) setLoadingScenarios(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleScenarioClick(sc: ScenarioSummary) {
    setSelectedScenario(sc)
    setFullScenario(null)
    setLoadingScenario(true)
    try {
      const { scenario } = await learnApi.roguelikeV2.getScenario(sc.slug)
      setFullScenario(scenario)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load scenario')
    } finally {
      setLoadingScenario(false)
    }
  }

  async function handleStart() {
    if (!selectedScenario) return
    setStarting(true)
    try {
      const { runId } = await learnApi.roguelikeV2.startRun(selectedScenario.slug, selectedMode)
      router.push(`/learn/roguelike/${runId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start run')
      setStarting(false)
    }
  }

  async function handleQuickRun() {
    setStartingQuick(true)
    try {
      const { runId } = await learnApi.roguelikeV2.startQuickRun()
      router.push(`/learn/roguelike/${runId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start Quick Run')
      setStartingQuick(false)
    }
  }

  return (
    <CategoryShell
      title="LLD Roguelike"
      subtitle="Your architecture is tested by reality"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="overflow-y-auto flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

          {/* Quick Run card */}
          <div className="mb-8 rounded-2xl border-2 border-brand/30 bg-gradient-to-r from-brand/5 to-purple-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚡</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand font-semibold">Daily Quick Run</span>
              </div>
              <h2 className="font-serif text-[17px] font-semibold text-ink">3 stages · ~10 minutes</h2>
              <p className="text-[12px] text-ink-muted mt-0.5">Jump straight in. Auto-selected scenario, beginner mode, no setup required.</p>
            </div>
            <button
              onClick={handleQuickRun}
              disabled={startingQuick}
              className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {startingQuick && <Loader2 className="h-4 w-4 animate-spin" />}
              Start Quick Run
            </button>
          </div>

          {/* Daily Featured Scenario */}
          {featuredScenario && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-3">Today's Featured</p>
              <button
                onClick={() => handleScenarioClick(featuredScenario)}
                className="w-full rounded-2xl border border-amber-300 bg-amber-50/60 p-5 text-left hover:border-amber-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none shrink-0">{featuredScenario.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-white">🌟 Today's Featured</span>
                      <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase font-medium', DIFFICULTY_COLORS[featuredScenario.difficulty])}>
                        {featuredScenario.difficulty}
                      </span>
                      <span className="text-[11px] text-ink-faint">~{featuredScenario.estimatedMinutes}m</span>
                    </div>
                    <h3 className="mt-1 font-serif text-base font-medium text-ink group-hover:text-brand transition-colors">
                      {featuredScenario.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-ink-muted leading-snug">{featuredScenario.description}</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Mode selector */}
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-3">Select Mode</p>
            <div className="flex flex-wrap gap-2">
              {MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-left transition-all',
                    selectedMode === mode.id
                      ? mode.color
                      : 'border-hairline bg-paper text-ink-muted hover:bg-paper-elevated',
                  )}
                >
                  <p className="font-medium text-[13px]">{mode.label}</p>
                  <p className="text-[11px] opacity-80 mt-0.5 max-w-[200px]">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario grid */}
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-3">Scenarios</p>
            {loadingScenarios ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              </div>
            ) : scenarios.length === 0 ? (
              <p className="text-center text-[14px] text-ink-muted py-8">No scenarios available yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {scenarios.map(sc => (
                  <button
                    key={sc.slug}
                    onClick={() => handleScenarioClick(sc)}
                    className="rounded-2xl border border-hairline bg-paper-elevated p-5 text-left hover:border-brand/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none shrink-0">{sc.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase font-medium', DIFFICULTY_COLORS[sc.difficulty])}>
                            {sc.difficulty}
                          </span>
                          <span className="text-[11px] text-ink-faint">~{sc.estimatedMinutes}m</span>
                        </div>
                        <h3 className="mt-1 font-serif text-base font-medium text-ink group-hover:text-brand transition-colors">
                          {sc.title}
                        </h3>
                        <p className="mt-1 text-[12px] text-ink-muted leading-snug">{sc.description}</p>
                      </div>
                    </div>

                    {/* Constraints */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-ink-faint">
                        👥 {sc.initialConstraints.teamSize} engineers
                      </span>
                      <span className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-ink-faint">
                        👤 {sc.initialConstraints.expectedUsers}
                      </span>
                      <span className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-ink-faint">
                        ⏰ {sc.initialConstraints.engineeringHours}h
                      </span>
                    </div>

                    {/* Tags */}
                    {sc.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {sc.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="rounded-md bg-hairline/50 px-2 py-0.5 text-[10px] text-ink-faint">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent runs */}
          {recentRuns.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-3">Recent Runs</p>
              <div className="space-y-2">
                {recentRuns.map(run => (
                  <a
                    key={run.id}
                    href={`/learn/roguelike/${run.id}`}
                    className="flex items-center gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-3 hover:border-brand/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[12px] font-medium', STATUS_COLORS[run.status])}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                        <span className="text-ink-faint text-[11px]">—</span>
                        <span className="text-[12px] text-ink">{run.scenarioTitle}</span>
                        <span className="rounded-md bg-hairline/50 px-1.5 py-0.5 text-[10px] text-ink-faint font-mono uppercase">
                          {run.mode}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-faint mt-0.5">
                        Stage {run.currentStageOrder} / {run.stagesTotal} · Debt: {run.health.debt}
                      </p>
                    </div>
                    <span className="text-ink-faint text-[12px]">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scenario detail modal */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Close */}
            <button
              onClick={() => { setSelectedScenario(null); setFullScenario(null) }}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full hover:bg-hairline/50 text-ink-muted transition-colors"
            >
              <X size={16} />
            </button>

            <div className="overflow-y-auto flex-1 p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl shrink-0">{selectedScenario.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase font-medium', DIFFICULTY_COLORS[selectedScenario.difficulty])}>
                      {selectedScenario.difficulty}
                    </span>
                    <span className="text-[11px] text-ink-faint">~{selectedScenario.estimatedMinutes} min</span>
                  </div>
                  <h2 className="font-serif text-xl font-medium text-ink">{selectedScenario.title}</h2>
                  <p className="mt-1 text-[13px] text-ink-muted">{selectedScenario.description}</p>
                </div>
              </div>

              {loadingScenario ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
                </div>
              ) : fullScenario ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-hairline bg-paper-elevated px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-1">System Context</p>
                    <p className="text-[13px] text-ink-muted leading-relaxed">{fullScenario.systemContext}</p>
                  </div>
                  <div className="rounded-lg border border-hairline bg-paper-elevated px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-1">Initial Requirement</p>
                    <p className="text-[13px] text-ink leading-relaxed">{fullScenario.initialRequirement}</p>
                  </div>

                  {/* Constraints */}
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-2">Constraints</p>
                    <div className="grid grid-cols-3 gap-2">
                      <ConstraintPill icon="👥" label="Team" value={String(fullScenario.initialConstraints.teamSize)} />
                      <ConstraintPill icon="⏰" label="Hours" value={`${fullScenario.initialConstraints.engineeringHours}h`} />
                      <ConstraintPill icon="👤" label="Users" value={fullScenario.initialConstraints.expectedUsers} />
                      <ConstraintPill icon="🧰" label="Cmplx Budget" value={String(fullScenario.initialConstraints.complexityBudget)} />
                      <ConstraintPill icon="🔄" label="Max Changes" value={String(fullScenario.initialConstraints.maxStructuralChanges)} />
                    </div>
                  </div>

                  {/* Stage preview */}
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-2">
                      {fullScenario.stages.length} Stages
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {fullScenario.stages.map(s => (
                        <span
                          key={s.id}
                          title={s.title}
                          className={cn(
                            'rounded-md border px-2 py-0.5 text-[10px]',
                            s.isBoss ? 'border-red-300 bg-red-50 text-red-700' :
                            s.isCheckpoint ? 'border-emerald-300 bg-emerald-50 text-emerald-700' :
                            'border-hairline bg-paper text-ink-faint',
                          )}
                        >
                          {EVENT_ICONS[s.event.type] ?? '❓'} {s.isCheckpoint ? '💾' : ''}{s.isBoss ? '🐉' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Mode selector in modal */}
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-2">Mode</p>
                <div className="flex flex-wrap gap-2">
                  {MODES.filter(m => !selectedScenario.modes.length || selectedScenario.modes.includes(m.id)).map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-[12px] transition-all',
                        selectedMode === mode.id ? mode.color : 'border-hairline text-ink-muted hover:bg-paper-elevated',
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-hairline px-6 py-4 bg-paper-elevated shrink-0">
              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full rounded-xl bg-brand py-2.5 text-[14px] font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {starting && <Loader2 className="h-4 w-4 animate-spin" />}
                Start Run — {MODES.find(m => m.id === selectedMode)?.label} Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </CategoryShell>
  )
}

function ConstraintPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-paper px-3 py-2 text-center">
      <p className="text-[10px] text-ink-faint font-mono">{icon} {label}</p>
      <p className="text-[13px] font-medium text-ink mt-0.5">{value}</p>
    </div>
  )
}
