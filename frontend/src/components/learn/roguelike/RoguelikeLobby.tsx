'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Loader2, Trash2, X, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { learnApi } from '@/lib/learn-api'
import type { ScenarioSummary, RoguelikeScenario, RunState } from '@/lib/learn-api'

// ── Constants ──────────────────────────────────────────────────────────────────

type Mode = 'beginner' | 'interview' | 'survival' | 'hardcore' | 'endless'

const MODES: { id: Mode; label: string; description: string }[] = [
  { id: 'beginner',  label: 'Beginner',  description: 'Predictable requirements. Focus on classes, responsibilities, relationships.' },
  { id: 'interview', label: 'Interview', description: 'Timed. Focus on requirement interpretation, extensibility, tradeoffs.' },
  { id: 'survival',  label: 'Survival',  description: 'Unexpected events. Focus on adaptation, coupling, change impact.' },
  { id: 'hardcore',  label: 'Hardcore',  description: 'Limited checkpoints. Limited resources. No easy recovery.' },
  { id: 'endless',   label: 'Endless',   description: 'The system evolves indefinitely. How long can your architecture survive?' },
]

const DIFF_META: Record<string, { dot: string; text: string; label: string; badge: string }> = {
  easy:     { dot: 'bg-brand',     text: 'text-brand',     label: 'Easy',     badge: 'bg-brand/10 text-brand' },
  medium:   { dot: 'bg-amber-400', text: 'text-amber-600', label: 'Medium',   badge: 'bg-amber-50 text-amber-700' },
  hard:     { dot: 'bg-red-400',   text: 'text-red-500',   label: 'Hard',     badge: 'bg-red-50 text-red-600' },
  hardcore: { dot: 'bg-red-600',   text: 'text-red-700',   label: 'Hardcore', badge: 'bg-red-100 text-red-800' },
}

const RUN_STATUS: Record<string, { label: string; cls: string }> = {
  active:    { label: 'Active',    cls: 'text-brand' },
  completed: { label: 'Completed', cls: 'text-emerald-600' },
  failed:    { label: 'Failed',    cls: 'text-red-500' },
  abandoned: { label: 'Abandoned', cls: 'text-ink-faint' },
}

type Diff = 'all' | 'easy' | 'medium' | 'hard'

// ── Scenario row ───────────────────────────────────────────────────────────────
function ScenarioRow({
  scenario,
  index,
  featured,
  onClick,
}: {
  scenario: ScenarioSummary
  index: number
  featured: boolean
  onClick: () => void
}) {
  const diff = scenario.difficulty ?? 'medium'
  const meta = DIFF_META[diff] ?? DIFF_META.medium

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-5 border-b border-hairline px-6 py-4 text-left transition-colors hover:bg-brand-tint/10 last:border-b-0"
    >
      {/* Ordinal */}
      <span className="w-6 shrink-0 select-none font-mono text-[11px] text-ink-faint">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Difficulty dot */}
      <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dot)} title={meta.label} />

      {/* Title + description */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-semibold leading-tight text-ink transition-colors group-hover:text-brand">
            {scenario.title}
          </p>
          {featured && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-700">
              Featured
            </span>
          )}
        </div>
        {scenario.description && (
          <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-ink-faint">
            {scenario.description}
          </p>
        )}
      </div>

      {/* Meta chips */}
      <div className="hidden shrink-0 items-center gap-3 text-[11px] text-ink-faint sm:flex">
        <span className="font-mono">{(scenario as any).stages?.length ?? 5} stages</span>
        <span className="font-mono">~{scenario.estimatedMinutes}m</span>
        {scenario.tags?.[0] && (
          <span className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            {scenario.tags[0]}
          </span>
        )}
      </div>

      {/* Difficulty label */}
      <span className={cn('hidden w-14 shrink-0 text-right font-mono text-[10px] sm:block', meta.text)}>
        {meta.label}
      </span>

      {/* Arrow */}
      <ArrowRight
        size={14}
        className="shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-brand"
      />
    </button>
  )
}

// ── Skeleton row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-5 border-b border-hairline px-6 py-4 last:border-b-0">
      <div className="h-3 w-6 animate-pulse rounded bg-hairline" />
      <div className="h-2 w-2 animate-pulse rounded-full bg-hairline" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-48 animate-pulse rounded bg-hairline" />
        <div className="h-2.5 w-72 animate-pulse rounded bg-hairline" />
      </div>
      <div className="hidden h-3 w-20 animate-pulse rounded bg-hairline sm:block" />
      <div className="h-3 w-10 animate-pulse rounded bg-hairline" />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function RoguelikeLobby() {
  const router = useRouter()

  const [scenarios,        setScenarios]        = useState<ScenarioSummary[]>([])
  const [recentRuns,       setRecentRuns]        = useState<RunState[]>([])
  const [loadingScenarios, setLoadingScenarios]  = useState(true)
  const [diff,             setDiff]              = useState<Diff>('all')
  const [selectedScenario, setSelectedScenario]  = useState<ScenarioSummary | null>(null)
  const [fullScenario,     setFullScenario]      = useState<RoguelikeScenario | null>(null)
  const [loadingScenario,  setLoadingScenario]   = useState(false)
  const [selectedMode,     setSelectedMode]      = useState<Mode>('beginner')
  const [starting,         setStarting]          = useState(false)
  const [startingQuick,    setStartingQuick]     = useState(false)
  const [featuredSlug,     setFeaturedSlug]      = useState<string | null>(null)
  const [runsCollapsed,    setRunsCollapsed]     = useState(false)
  const [abandoningId,     setAbandoningId]      = useState<string | null>(null)
  const [confirmAbandonId, setConfirmAbandonId]  = useState<string | null>(null)

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
          setFeaturedSlug(featuredRes.value.scenario.slug)
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

  function closeModal() {
    setSelectedScenario(null)
    setFullScenario(null)
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

  // Dismiss "Confirm?" state if user clicks elsewhere
  useEffect(() => {
    if (!confirmAbandonId) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('[data-abandon-btn]')) {
        setConfirmAbandonId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [confirmAbandonId])

  async function handleAbandon(runId: string) {
    if (confirmAbandonId !== runId) {
      setConfirmAbandonId(runId)
      return
    }
    setAbandoningId(runId)
    setConfirmAbandonId(null)
    try {
      await learnApi.roguelikeV2.endRun(runId)
      setRecentRuns(prev => prev.filter(r => r.id !== runId))
      toast.success('Run abandoned')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to abandon run')
    } finally {
      setAbandoningId(null)
    }
  }

  // Derived counts
  const counts = {
    all:    scenarios.length,
    easy:   scenarios.filter(s => s.difficulty === 'easy').length,
    medium: scenarios.filter(s => s.difficulty === 'medium').length,
    hard:   scenarios.filter(s => ['hard', 'hardcore'].includes(s.difficulty)).length,
  }

  const filtered = scenarios.filter(s => {
    if (diff === 'all')    return true
    if (diff === 'hard')   return s.difficulty === 'hard' || s.difficulty === 'hardcore'
    return s.difficulty === diff
  })

  const activeRuns = recentRuns.filter(r => r.status === 'active')

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-hairline bg-paper/90 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/learn/roguelike"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} />
            LLD Roguelike
          </Link>
          <button
            type="button"
            onClick={handleQuickRun}
            disabled={startingQuick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-40"
          >
            {startingQuick
              ? <Loader2 size={12} className="animate-spin" />
              : <Zap size={12} />}
            Quick Run
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8">

        {/* ── Page title ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Scenarios
          </p>
          <h1 className="font-serif text-[30px] font-medium leading-tight tracking-tight text-ink">
            Scenario Library
          </h1>
          {!loadingScenarios && (
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <span className="text-[13px] text-ink-muted">{counts.all} scenarios</span>
              <div className="flex items-center gap-4">
                {(['easy', 'medium', 'hard'] as const).filter(d => counts[d] > 0).map(d => (
                  <span key={d} className="flex items-center gap-1.5 text-[12px]">
                    <span className={cn('h-1.5 w-1.5 rounded-full', DIFF_META[d].dot)} />
                    <span className={cn('font-mono', DIFF_META[d].text)}>
                      {counts[d]} {DIFF_META[d].label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Active runs strip ─────────────────────────────────────────── */}
        {activeRuns.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-brand/20 bg-brand-tint/30">
            {/* Header row — collapse toggle */}
            <button
              type="button"
              onClick={() => setRunsCollapsed(v => !v)}
              className="flex w-full items-center gap-2 border-b border-brand/10 px-5 py-2.5 text-left transition-colors hover:bg-brand/5"
            >
              {runsCollapsed
                ? <ChevronRight size={12} className="shrink-0 text-brand" />
                : <ChevronDown  size={12} className="shrink-0 text-brand" />}
              <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.15em] text-brand">
                Runs in progress
              </span>
              <span className="font-mono text-[10px] text-brand/60">{activeRuns.length}</span>
            </button>

            {/* Run rows */}
            {!runsCollapsed && activeRuns.map(run => (
              <div
                key={run.id}
                className="group flex items-center gap-3 border-b border-brand/10 px-5 py-3 last:border-b-0"
              >
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-brand" />

                {/* Clickable area */}
                <a
                  href={`/learn/roguelike/${run.id}`}
                  className="flex flex-1 min-w-0 items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <span className="flex-1 truncate text-[13px] font-medium text-ink">{run.scenarioTitle}</span>
                  <span className="font-mono text-[11px] text-ink-faint shrink-0">
                    Stage {run.currentStageOrder}/{run.stagesTotal}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint shrink-0">{run.mode}</span>
                  <ArrowRight size={13} className="shrink-0 text-brand" />
                </a>

                {/* Abandon button */}
                <button
                  type="button"
                  data-abandon-btn
                  onClick={() => handleAbandon(run.id)}
                  disabled={abandoningId === run.id}
                  title={confirmAbandonId === run.id ? 'Click again to confirm' : 'Abandon run'}
                  className={cn(
                    'ml-1 shrink-0 flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[10px] transition-all',
                    confirmAbandonId === run.id
                      ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-transparent text-ink-faint opacity-0 group-hover:opacity-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500',
                    abandoningId === run.id && 'opacity-40 pointer-events-none',
                  )}
                >
                  {abandoningId === run.id
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Trash2 size={11} />}
                  {confirmAbandonId === run.id ? 'Confirm?' : ''}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter tabs ────────────────────────────────────────────────── */}
        <div className="-mx-6 mb-6 flex items-center gap-1 border-b border-hairline px-6 pb-0">
          {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => {
            const label =
              d === 'all'    ? `All (${counts.all})`       :
              d === 'easy'   ? `Easy (${counts.easy})`     :
              d === 'medium' ? `Medium (${counts.medium})` :
                               `Hard (${counts.hard})`
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={cn(
                  '-mb-px mr-4 border-b-2 pb-3 px-1 text-[13px] font-medium transition-colors',
                  diff === d
                    ? 'border-brand text-brand'
                    : 'border-transparent text-ink-faint hover:text-ink',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Scenario list ──────────────────────────────────────────────── */}
        {loadingScenarios ? (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-ink-muted">No scenarios match this filter.</p>
            <button
              type="button"
              onClick={() => setDiff('all')}
              className="mt-2 text-[13px] text-brand hover:underline"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
            {filtered.map((sc, i) => (
              <ScenarioRow
                key={sc.slug}
                scenario={sc}
                index={i}
                featured={sc.slug === featuredSlug}
                onClick={() => handleScenarioClick(sc)}
              />
            ))}
          </div>
        )}

        {/* ── Previous runs (non-active) ────────────────────────────────── */}
        {recentRuns.filter(r => r.status !== 'active').length > 0 && (
          <div className="mt-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              Previous runs
            </p>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
              {recentRuns.filter(r => r.status !== 'active').map(run => {
                const st = RUN_STATUS[run.status] ?? { label: run.status, cls: 'text-ink-faint' }
                return (
                  <a
                    key={run.id}
                    href={`/learn/roguelike/${run.id}`}
                    className="group flex items-center gap-4 border-b border-hairline px-6 py-3.5 transition-colors hover:bg-paper-elevated last:border-b-0"
                  >
                    <span className={cn('shrink-0 font-mono text-[11px] font-medium w-16', st.cls)}>
                      {st.label}
                    </span>
                    <span className="flex-1 text-[13px] text-ink">{run.scenarioTitle}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">{run.mode}</span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {run.currentStageOrder}/{run.stagesTotal} stages
                    </span>
                    <ArrowRight size={13} className="shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Scenario detail modal ──────────────────────────────────────────── */}
      {selectedScenario && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-hairline bg-paper shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-hairline"
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div className="shrink-0 border-b border-hairline px-6 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
                  DIFF_META[selectedScenario.difficulty]?.badge ?? 'bg-paper-elevated text-ink-faint',
                )}>
                  {selectedScenario.difficulty}
                </span>
                <span className="font-mono text-[11px] text-ink-faint">
                  ~{selectedScenario.estimatedMinutes} min
                </span>
              </div>
              <h2 className="font-serif text-[22px] font-medium leading-tight text-ink">
                {selectedScenario.title}
              </h2>
              {selectedScenario.description && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {selectedScenario.description}
                </p>
              )}
            </div>

            {/* Scrollable body */}
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {loadingScenario ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
                </div>
              ) : fullScenario ? (
                <>
                  {/* System context */}
                  <div className="flex gap-4">
                    <div className="w-px shrink-0 self-stretch rounded-full bg-ink-faint/20" />
                    <div>
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                        System Context
                      </p>
                      <p className="text-[13px] leading-relaxed text-ink-muted">
                        {fullScenario.systemContext}
                      </p>
                    </div>
                  </div>

                  {/* Initial requirement */}
                  <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      Initial Requirement
                    </p>
                    <p className="text-[13px] leading-relaxed text-ink">
                      {fullScenario.initialRequirement}
                    </p>
                  </div>

                  {/* Stages */}
                  {fullScenario.stages.length > 0 && (
                    <div>
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                        {fullScenario.stages.length} Stages
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {fullScenario.stages.map((s, i) => (
                          <div key={s.id} className="flex items-center gap-1.5">
                            <span
                              title={s.title}
                              className={cn(
                                'rounded-lg border px-2 py-0.5 font-mono text-[10px]',
                                s.isBoss
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : s.isCheckpoint
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-hairline bg-paper text-ink-faint',
                              )}
                            >
                              {s.event.type}
                              {s.isCheckpoint ? ' ckpt' : ''}
                              {s.isBoss ? ' boss' : ''}
                            </span>
                            {i < fullScenario.stages.length - 1 && (
                              <span className="text-[10px] text-hairline-strong">—</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              {/* Mode selection */}
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  Mode
                </p>
                <div className="space-y-1.5">
                  {MODES
                    .filter(m => !selectedScenario.modes?.length || selectedScenario.modes.includes(m.id))
                    .map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSelectedMode(mode.id)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                          selectedMode === mode.id
                            ? 'border-brand/30 bg-brand-tint'
                            : 'border-hairline hover:bg-paper-elevated',
                        )}
                      >
                        <span className={cn(
                          'mt-1 h-3 w-3 shrink-0 rounded-full border-2 transition-colors',
                          selectedMode === mode.id
                            ? 'border-brand bg-brand'
                            : 'border-hairline bg-paper',
                        )} />
                        <div>
                          <p className={cn(
                            'text-[13px] font-semibold leading-tight',
                            selectedMode === mode.id ? 'text-brand' : 'text-ink',
                          )}>
                            {mode.label}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                            {mode.description}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 border-t border-hairline bg-paper-elevated px-6 py-4">
              <button
                type="button"
                onClick={handleStart}
                disabled={starting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {starting && <Loader2 className="h-4 w-4 animate-spin" />}
                Start Run — {MODES.find(m => m.id === selectedMode)?.label ?? 'Beginner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
