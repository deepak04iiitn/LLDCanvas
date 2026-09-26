'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Swords,
  Bug,
  BarChart2,
  Play,
  Lock,
} from 'lucide-react'
import {
  getFeaturesByCategory,
  type FeatureDefinition,
} from '@/lib/features/feature-registry'
import { isFeatureEnabled } from '@/lib/features/flags'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { cn } from '@/lib/utils'

// ── Icons per mode ─────────────────────────────────────────────────────────────
const MODE_ICONS: Record<string, React.ElementType> = {
  quiz: BookOpen,
  detective: Search,
  roguelike: Swords,
  'code-debugger': Bug,
  score: BarChart2,
}

// ── Static placeholder stats ───────────────────────────────────────────────────
// TODO: wire up real stats by calling:
//   learnApi.quiz.streak()            → currentStreak for quiz
//   learnApi.detective.history()      → patternMastery totals for detective
//   learnApi.debugger.list()          → solved count for code-debugger
//   learnApi.roguelikeV2.listRuns()   → completed runs for roguelike
//   learnApi.score.history()          → avg overall for score
const MODE_STATS: Record<string, string | null> = {
  quiz: null,           // e.g. '7-day streak'
  detective: null,      // e.g. '12/25 mastered'
  roguelike: null,      // e.g. '3 runs completed'
  'code-debugger': null, // e.g. '5 solved'
  score: null,          // e.g. 'Avg 72/100'
}

const LAST_ACTIVE_KEY = 'lld_last_active_mode'

// ── Mode card ──────────────────────────────────────────────────────────────────
function ModeCard({
  feature,
  onVisit,
}: {
  feature: FeatureDefinition
  onVisit: (id: string) => void
}) {
  const enabled = isFeatureEnabled(feature.flagKey)
  const locked = !enabled
  const Icon = MODE_ICONS[feature.id] ?? BookOpen
  const stat = MODE_STATS[feature.id] ?? null

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border border-hairline bg-paper-elevated p-5 transition-all',
        locked
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-brand/30 hover:shadow-sm',
      )}
    >
      {/* Icon + plan badge */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <Icon size={17} strokeWidth={1.75} />
        </div>
        {feature.minPlan && feature.minPlan !== 'free' && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-ink-faint">
            <Lock size={9} />
            {feature.minPlan === 'ultimate' ? 'Ult.' : 'Pro'}
          </span>
        )}
      </div>

      {/* Title + description */}
      <h3 className="font-serif text-lg font-medium text-ink group-hover:text-brand">
        {feature.label}
      </h3>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
        {feature.description}
      </p>

      {/* Stat */}
      {stat && (
        <p className="mt-2 font-mono text-[11px] text-ink-faint">{stat}</p>
      )}

      {/* CTA */}
      <div className="mt-4">
        {locked ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-faint">
            <Lock size={11} />
            Coming soon
          </span>
        ) : (
          <Link
            href={feature.href}
            onClick={() => onVisit(feature.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Play size={11} strokeWidth={2} />
            Start
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Hub ────────────────────────────────────────────────────────────────────────
export function LearnHub() {
  const features = getFeaturesByCategory('learn')
  const [lastActive, setLastActive] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_ACTIVE_KEY)
      if (stored) setLastActive(stored)
    } catch {
      // SSR / private browsing — ignore
    }
  }, [])

  function handleVisit(id: string) {
    try {
      localStorage.setItem(LAST_ACTIVE_KEY, id)
      setLastActive(id)
    } catch {
      // ignore
    }
  }

  const lastFeature = lastActive ? features.find(f => f.id === lastActive) : null
  const LastIcon = lastFeature ? (MODE_ICONS[lastFeature.id] ?? BookOpen) : BookOpen
  const lastEnabled = lastFeature ? isFeatureEnabled(lastFeature.flagKey) : false

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <SectionHeader
          eyebrow="Learn &amp; Practice"
          title="Your Learning Hub"
          subtitle="Quiz, detective scenarios, roguelike runs, and Debug Lab — deliberate practice for LLD interviews."
        />

        {/* ── CONTINUE section ─────────────────────────────────────────────── */}
        {lastFeature && lastEnabled && (
          <section className="mb-10">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Continue
            </p>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-brand/25 bg-brand-tint px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <LastIcon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-brand">
                    Last active
                  </p>
                  <p className="font-serif text-base font-medium text-ink">
                    {lastFeature.label}
                  </p>
                </div>
              </div>
              <Link
                href={lastFeature.href}
                onClick={() => handleVisit(lastFeature.id)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                <Play size={12} strokeWidth={2} />
                Continue
              </Link>
            </div>
          </section>
        )}

        {/* ── ALL MODES section ─────────────────────────────────────────────── */}
        <section>
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            All Modes
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <ModeCard key={f.id} feature={f} onVisit={handleVisit} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
