'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, Flame, History, Loader2, X, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  FeatureInstructionsPanel,
  ProblemsInstructionsTabs,
} from '@/components/shared/FeatureInstructionsPanel'
import { learnApi } from '@/lib/learn-api'
import type { ScenarioSummary, RoguelikeScenario, RunState } from '@/lib/learn-api'
import { LockedChallengeOverlay, challengeLockFrom } from '@/components/billing/ChallengeLockCue'
import { annotateChallengeAccess } from '@/lib/challenge-access'
import { usePlan } from '@/hooks/usePlan'

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


type Diff = 'all' | 'easy' | 'medium' | 'hard'

function getDailyScenario(scenarios: ScenarioSummary[]): ScenarioSummary | null {
  if (!scenarios.length) return null
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  )
  return scenarios[dayOfYear % scenarios.length]
}

// ── Scenario row ───────────────────────────────────────────────────────────────
function ScenarioRow({
  scenario,
  index,
  featured,
  isLast,
  onClick,
}: {
  scenario: ScenarioSummary
  index: number
  featured: boolean
  isLast: boolean
  onClick: () => void
}) {
  const diff = (scenario.difficulty ?? 'medium').toLowerCase()
  const meta = DIFF_META[diff] ?? DIFF_META.medium

  const rowInner = (
    <>
      <span className="w-5 shrink-0 select-none font-mono text-[11px] text-ink-faint text-right">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dot)} title={meta.label} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-serif text-[14px] font-medium leading-snug text-ink transition-colors group-hover:text-brand">
            {scenario.title}
          </p>
          {featured && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-700">
              Featured
            </span>
          )}
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-ink-faint truncate">
          {(scenario as any).stages?.length ?? 5} STAGES
          {scenario.estimatedMinutes ? ` · ~${scenario.estimatedMinutes}m` : ''}
          {scenario.tags?.[0] ? ` · ${scenario.tags[0].toUpperCase()}` : ''}
        </p>
      </div>
      <span className={cn('hidden shrink-0 font-mono text-[11px] capitalize sm:block w-12 text-right', meta.text)}>
        {meta.label}
      </span>
    </>
  )

  if (scenario.locked) {
    return (
      <LockedChallengeOverlay
        from={challengeLockFrom('roguelike', scenario.requiredPlan)}
        className={cn(!isLast && 'border-b border-hairline')}
      >
        <div className="flex items-center gap-5 px-6 py-4">{rowInner}</div>
      </LockedChallengeOverlay>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-5 px-6 py-4 text-left transition-colors hover:bg-paper-elevated',
        !isLast && 'border-b border-hairline',
      )}
    >
      {rowInner}
      <ArrowRight
        size={14}
        className="shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-ink"
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
  const { plan } = usePlan()

  const [scenarios,        setScenarios]        = useState<ScenarioSummary[]>([])
  const [recentRuns,       setRecentRuns]        = useState<RunState[]>([])
  const [loadingScenarios, setLoadingScenarios]  = useState(true)
  const [diff,             setDiff]              = useState<Diff>('all')
  const [view,             setView]              = useState<'problems' | 'instructions'>('problems')
  const [selectedScenario, setSelectedScenario]  = useState<ScenarioSummary | null>(null)
  const [fullScenario,     setFullScenario]      = useState<RoguelikeScenario | null>(null)
  const [loadingScenario,  setLoadingScenario]   = useState(false)
  const [selectedMode,     setSelectedMode]      = useState<Mode>('beginner')
  const [starting,         setStarting]          = useState(false)
  const [startingQuick,    setStartingQuick]     = useState(false)
  const [featuredSlug,     setFeaturedSlug]      = useState<string | null>(null)

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
          const sorted = scenariosRes.value.scenarios.sort((a, b) => a.order - b.order)
          setScenarios(annotateChallengeAccess('roguelike', plan ?? 'free', sorted))
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
  }, [plan])

  async function handleScenarioClick(sc: ScenarioSummary) {
    if (sc.locked) {
      router.push(`/pricing?from=roguelike_${sc.requiredPlan === 'ultimate' ? 'hard' : 'medium'}`)
      return
    }
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
    if (selectedScenario.locked) {
      router.push(`/pricing?from=roguelike_${selectedScenario.requiredPlan === 'ultimate' ? 'hard' : 'medium'}`)
      return
    }
    setStarting(true)
    try {
      const { runId } = await learnApi.roguelikeV2.startRun(selectedScenario.slug, selectedMode)
      router.push(`/dashboard/learn/roguelike/${runId}`)
    } catch (e) {
      const err = e as Error & { requiredPlan?: string; code?: string }
      if (err.code === 'PLAN_GATE' || /requires/i.test(err.message)) {
        router.push(`/pricing?from=roguelike_gate`)
        return
      }
      toast.error(e instanceof Error ? e.message : 'Failed to start run')
      setStarting(false)
    }
  }

  async function handleQuickRun() {
    setStartingQuick(true)
    try {
      const { runId } = await learnApi.roguelikeV2.startQuickRun()
      router.push(`/dashboard/learn/roguelike/${runId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start Quick Run')
      setStartingQuick(false)
    }
  }


  // Derived counts
  const counts = {
    all:    scenarios.length,
    easy:   scenarios.filter(s => s.difficulty === 'easy').length,
    medium: scenarios.filter(s => s.difficulty === 'medium').length,
    hard:   scenarios.filter(s => ['hard', 'hardcore'].includes(s.difficulty)).length,
  }

  const daily   = getDailyScenario(scenarios)
  const dailySlug = daily?.slug ?? null

  const filtered = scenarios.filter(s => {
    if (s.slug === dailySlug) return false // excluded from main list
    if (diff === 'all')    return true
    if (diff === 'hard')   return s.difficulty === 'hard' || s.difficulty === 'hardcore'
    return s.difficulty === diff
  })

  const showDaily = !!daily && (
    diff === 'all' || daily.difficulty === diff ||
    (diff === 'hard' && ['hard', 'hardcore'].includes(daily.difficulty))
  )

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-hairline bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 pt-3.5 pb-0">

          {/* Breadcrumb + actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <Link href="/dashboard/learn/roguelike" className="hover:text-ink transition-colors">
                LLD Roguelike
              </Link>
              <span>/</span>
              <span className="text-ink-muted">Scenarios</span>
            </div>

            <div className="flex items-center gap-2">
              {!loadingScenarios && scenarios.length > 0 && (
                <div className="flex items-center gap-3 font-mono text-[11px] mr-1">
                  <span className="text-ink-faint">{counts.all} total</span>
                  {counts.easy   > 0 && <span className={DIFF_META.easy.text}>{counts.easy} easy</span>}
                  {counts.medium > 0 && <span className={DIFF_META.medium.text}>{counts.medium} medium</span>}
                  {counts.hard   > 0 && <span className={DIFF_META.hard.text}>{counts.hard} hard</span>}
                </div>
              )}
              <Link
                href="/dashboard/learn/roguelike/history"
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                <History size={11} />
                My Runs
              </Link>
              <button
                type="button"
                onClick={handleQuickRun}
                disabled={startingQuick}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-40"
              >
                {startingQuick ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                Quick Run
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <ProblemsInstructionsTabs view={view} onChange={setView} />
            {view === 'problems' && !loadingScenarios && scenarios.length > 0 && (
              <div className="flex items-center gap-0">
                {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiff(d)}
                    className={cn(
                      'px-4 py-2.5 text-[12px] font-medium capitalize border-b-2 transition-all',
                      diff === d
                        ? 'border-ink text-ink'
                        : 'border-transparent text-ink-faint hover:text-ink-muted',
                    )}
                  >
                    {d}
                    {d !== 'all' && counts[d] > 0 && (
                      <span className="ml-1 font-mono text-[10px] font-normal opacity-50">
                        ({counts[d]})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8">

        {view === 'instructions' && (
          <FeatureInstructionsPanel featureKey="learn-roguelike" />
        )}

        {view === 'problems' && (
        <>
        {/* ── Today's pick ──────────────────────────────────────────────── */}
        {showDaily && daily && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={11} className="text-amber-500 shrink-0" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                Today's pick
              </span>
              <span className="ml-auto font-mono text-[10px] text-ink-faint">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            {daily.locked ? (
              <LockedChallengeOverlay
                from={challengeLockFrom('roguelike', daily.requiredPlan)}
                className="rounded-2xl border border-hairline bg-paper-elevated"
              >
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', DIFF_META[daily.difficulty]?.dot ?? 'bg-ink/20')} />
                    <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.1em]', DIFF_META[daily.difficulty]?.text ?? 'text-ink-faint')}>
                      {daily.difficulty}
                    </span>
                  </div>
                  <h3 className="font-serif text-[20px] font-medium text-ink leading-snug mb-2">{daily.title}</h3>
                  {daily.description && (
                    <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 max-w-2xl">{daily.description}</p>
                  )}
                </div>
              </LockedChallengeOverlay>
            ) : (
              <button
                type="button"
                onClick={() => handleScenarioClick(daily)}
                className="group w-full text-left rounded-2xl border border-hairline bg-paper-elevated px-6 py-5 hover:border-ink/20 hover:bg-paper transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={cn('h-2 w-2 rounded-full shrink-0', DIFF_META[daily.difficulty]?.dot ?? 'bg-ink/20')} />
                      <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.1em]', DIFF_META[daily.difficulty]?.text ?? 'text-ink-faint')}>
                        {daily.difficulty}
                      </span>
                      {(daily as any).stages?.length && (
                        <span className="font-mono text-[10px] text-ink-faint">
                          {(daily as any).stages.length} stages
                        </span>
                      )}
                      {daily.estimatedMinutes && (
                        <span className="font-mono text-[10px] text-ink-faint">· ~{daily.estimatedMinutes}m</span>
                      )}
                    </div>
                    <h3 className="font-serif text-[20px] font-medium text-ink leading-snug mb-2 group-hover:text-brand transition-colors">
                      {daily.title}
                    </h3>
                    {daily.description && (
                      <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 max-w-2xl">
                        {daily.description}
                      </p>
                    )}
                    {daily.tags && daily.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {daily.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-1.5 py-0.5 uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-ink text-paper group-hover:bg-ink/80 transition-colors mt-0.5">
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* ── Scenario list ──────────────────────────────────────────────── */}
        {loadingScenarios ? (
          <div className="rounded-2xl border border-hairline overflow-hidden">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-ink-muted">No scenarios match this filter.</p>
            <button
              type="button"
              onClick={() => setDiff('all')}
              className="mt-2 text-[13px] text-ink-faint hover:text-ink hover:underline underline-offset-2 transition-colors"
            >
              Show all
            </button>
          </div>
        ) : (
          <>
            {showDaily && filtered.length > 0 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-3">
                All scenarios
              </p>
            )}
            <div className="rounded-2xl border border-hairline overflow-hidden">
              {filtered.map((sc, i) => (
                <ScenarioRow
                  key={sc.slug}
                  scenario={sc}
                  index={i}
                  featured={sc.slug === featuredSlug}
                  isLast={i === filtered.length - 1}
                  onClick={() => handleScenarioClick(sc)}
                />
              ))}
            </div>
          </>
        )}
        </>
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
