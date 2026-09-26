'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, X, ChevronDown, ChevronUp,
  Zap, Play, Search, Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import type { ScenarioSummary, RoguelikeScenario, RunState } from '@/lib/learn-api'

type Mode = 'beginner' | 'interview' | 'survival' | 'hardcore' | 'endless'

const MODES: { id: Mode; label: string; description: string }[] = [
  { id: 'beginner',  label: 'Beginner',  description: 'Predictable requirements. Focus on classes, responsibilities, relationships.' },
  { id: 'interview', label: 'Interview', description: 'Timed. Focus on requirement interpretation, extensibility, tradeoffs.' },
  { id: 'survival',  label: 'Survival',  description: 'Unexpected events. Focus on adaptation, coupling, change impact.' },
  { id: 'hardcore',  label: 'Hardcore',  description: 'Limited checkpoints. Limited resources. No easy recovery.' },
  { id: 'endless',   label: 'Endless',   description: 'The system evolves indefinitely. How long can your architecture survive?' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     'bg-emerald-50 text-emerald-700',
  medium:   'bg-amber-50   text-amber-700',
  hard:     'bg-red-50     text-red-700',
  hardcore: 'bg-red-100    text-red-800',
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-brand',
  completed: 'text-emerald-600',
  failed:    'text-red-500',
  abandoned: 'text-ink-faint',
}

export function RoguelikeLobby() {
  const router = useRouter()
  const scenariosRef = useRef<HTMLDivElement>(null)

  const [scenarios,         setScenarios]         = useState<ScenarioSummary[]>([])
  const [recentRuns,        setRecentRuns]         = useState<RunState[]>([])
  const [loadingScenarios,  setLoadingScenarios]   = useState(true)
  const [searchQuery,       setSearchQuery]        = useState('')
  const [diffFilter,        setDiffFilter]         = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [runsExpanded,      setRunsExpanded]       = useState(false)
  const [selectedScenario,  setSelectedScenario]   = useState<ScenarioSummary | null>(null)
  const [fullScenario,      setFullScenario]       = useState<RoguelikeScenario | null>(null)
  const [loadingScenario,   setLoadingScenario]    = useState(false)
  const [selectedMode,      setSelectedMode]       = useState<Mode>('beginner')
  const [starting,          setStarting]           = useState(false)
  const [startingQuick,     setStartingQuick]      = useState(false)
  const [featuredScenario,  setFeaturedScenario]   = useState<ScenarioSummary | null>(null)

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
          setRecentRuns(runsRes.value.runs.slice(0, 8))
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

  // Filter scenarios
  const filteredScenarios = scenarios.filter(sc => {
    const matchesDiff   = diffFilter === 'all' || sc.difficulty === diffFilter
    const matchesSearch = !searchQuery || sc.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDiff && matchesSearch
  })

  return (
    <CategoryShell
      title="LLD Roguelike"
      subtitle="Survive architectural stages under pressure"
      backHref="/learn"
      breadcrumb={[{ label: 'Learn', href: '/learn' }, { label: 'LLD Roguelike', href: '/learn/roguelike' }]}
      backLabel="Learn"
    >
      <div className="overflow-y-auto flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-10">

          {/* ── Section 1: Header ──────────────────────────────────────── */}
          <section className="text-center">
            <h1 className="font-serif text-3xl font-bold text-ink">LLD Roguelike</h1>
            <p className="mt-2 text-[14px] text-ink-muted max-w-lg mx-auto">
              Survive 5 architectural stages under pressure. Every decision shapes your design.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={handleQuickRun}
                disabled={startingQuick}
                className="flex items-center gap-2 rounded-xl border border-hairline bg-paper-elevated px-5 py-2.5 text-[13px] font-semibold text-ink-muted transition hover:border-brand/40 hover:text-brand disabled:opacity-50"
              >
                {startingQuick
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Zap size={14} />}
                Quick Run — 10 min
              </button>
              <button
                onClick={() => scenariosRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brand/90"
              >
                <Play size={14} />
                Start Full Run
              </button>
            </div>
          </section>

          {/* ── Section 2: Choose a Scenario ──────────────────────────── */}
          <section ref={scenariosRef}>
            <h2 className="font-serif text-xl font-medium text-ink mb-4">Choose a Scenario</h2>

            {/* Search + filter */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search scenarios…"
                  className="w-full rounded-lg border border-hairline bg-paper pl-9 pr-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="flex gap-1.5">
                {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiffFilter(d)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-[12px] font-medium capitalize transition',
                      diffFilter === d
                        ? 'bg-brand text-white border-brand'
                        : 'border-hairline text-ink-muted hover:border-brand/40 hover:text-brand',
                    )}
                  >
                    {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario grid */}
            {loadingScenarios ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              </div>
            ) : filteredScenarios.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Shield size={28} className="text-ink-faint" />
                <p className="text-[14px] text-ink-muted">No scenarios match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredScenarios.map(sc => {
                  const isFeatured = featuredScenario?.slug === sc.slug
                  return (
                    <button
                      key={sc.slug}
                      onClick={() => handleScenarioClick(sc)}
                      className="rounded-2xl border border-hairline bg-paper-elevated p-5 text-left transition-all hover:border-brand/40 hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-mono uppercase font-semibold',
                          DIFFICULTY_COLORS[sc.difficulty],
                        )}>
                          {sc.difficulty}
                        </span>
                        {isFeatured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-[15px] font-medium text-ink group-hover:text-brand transition-colors">
                        {sc.title}
                      </h3>
                      <p className="mt-1 text-[12px] text-ink-muted leading-snug line-clamp-2">
                        {sc.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-faint">
                        <span>{(sc as any).stages?.length ?? 5} stages</span>
                        <span>~{sc.estimatedMinutes}m</span>
                        {sc.tags?.[0] && (
                          <span className="rounded bg-hairline/60 px-1.5 py-0.5 text-[10px]">
                            {sc.tags[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Section 3: Recent Runs (collapsible) ──────────────────── */}
          {recentRuns.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setRunsExpanded(v => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-4 py-3 transition hover:border-brand/30"
              >
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                  {recentRuns.length} previous run{recentRuns.length !== 1 ? 's' : ''}
                </span>
                {runsExpanded
                  ? <ChevronUp size={15} className="text-ink-faint" />
                  : <ChevronDown size={15} className="text-ink-faint" />}
              </button>

              {runsExpanded && (
                <div className="mt-2 space-y-1.5">
                  {recentRuns.map(run => (
                    <a
                      key={run.id}
                      href={`/learn/roguelike/${run.id}`}
                      className="flex items-center gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-2.5 transition hover:border-brand/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[12px] font-medium', STATUS_COLORS[run.status])}>
                            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                          </span>
                          <span className="text-ink-faint text-[11px]">—</span>
                          <span className="text-[12px] text-ink truncate">{run.scenarioTitle}</span>
                          <span className="rounded bg-hairline/50 px-1.5 py-0.5 text-[10px] text-ink-faint font-mono uppercase shrink-0">
                            {run.mode}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-faint">
                          Stage {run.currentStageOrder} / {run.stagesTotal}
                        </p>
                      </div>
                      <span className="text-ink-faint text-[12px] shrink-0">→</span>
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ── Scenario detail modal ──────────────────────────────────────── */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Close */}
            <button
              onClick={() => { setSelectedScenario(null); setFullScenario(null) }}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full hover:bg-hairline/50 text-ink-muted transition-colors"
            >
              <X size={16} />
            </button>

            <div className="overflow-y-auto flex-1 p-6">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-mono uppercase font-semibold',
                    DIFFICULTY_COLORS[selectedScenario.difficulty],
                  )}>
                    {selectedScenario.difficulty}
                  </span>
                  <span className="text-[11px] text-ink-faint">~{selectedScenario.estimatedMinutes} min</span>
                </div>
                <h2 className="font-serif text-xl font-medium text-ink">{selectedScenario.title}</h2>
                <p className="mt-1 text-[13px] text-ink-muted">{selectedScenario.description}</p>
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
                  <div className="rounded-lg border border-hairline bg-paper-elevated px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-1">
                      {fullScenario.stages.length} Stages
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {fullScenario.stages.map(s => (
                        <span
                          key={s.id}
                          title={s.title}
                          className={cn(
                            'rounded-md border px-2 py-0.5 text-[10px] font-mono',
                            s.isBoss
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : s.isCheckpoint
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-hairline bg-paper text-ink-faint',
                          )}
                        >
                          {s.event.type}
                          {s.isCheckpoint ? ' ·ckpt' : ''}
                          {s.isBoss ? ' ·boss' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Mode selection — lives inside modal */}
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-2">Mode</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {MODES
                    .filter(m => !selectedScenario.modes?.length || selectedScenario.modes.includes(m.id))
                    .map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                          selectedMode === mode.id
                            ? 'border-brand bg-brand-tint'
                            : 'border-hairline hover:bg-paper-elevated',
                        )}
                      >
                        <div className={cn(
                          'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2',
                          selectedMode === mode.id
                            ? 'border-brand bg-brand'
                            : 'border-hairline bg-paper',
                        )} />
                        <div>
                          <p className={cn(
                            'text-[13px] font-semibold',
                            selectedMode === mode.id ? 'text-brand' : 'text-ink',
                          )}>
                            {mode.label}
                          </p>
                          <p className="text-[11px] text-ink-muted">{mode.description}</p>
                        </div>
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
                className="w-full rounded-xl bg-brand py-2.5 text-[14px] font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {starting && <Loader2 className="h-4 w-4 animate-spin" />}
                Start Run — {MODES.find(m => m.id === selectedMode)?.label ?? 'Beginner'} Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </CategoryShell>
  )
}
