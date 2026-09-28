'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, History } from 'lucide-react'
import { toast } from 'sonner'
import { learnApi, type DetectiveScenario } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Difficulty meta ────────────────────────────────────────────────────────────
const DIFF_META: Record<string, { dot: string; label: string; text: string }> = {
  easy:   { dot: 'bg-brand',      label: 'Easy',   text: 'text-brand'      },
  medium: { dot: 'bg-amber-400',  label: 'Medium', text: 'text-amber-600'  },
  hard:   { dot: 'bg-red-400',    label: 'Hard',   text: 'text-red-500'    },
}

const MODE_LABELS: Record<string, string> = {
  identify: 'Identify',
  detect:   'Detect',
  explain:  'Explain',
  suggest:  'Suggest',
  compare:  'Compare',
}

type Diff = 'all' | 'easy' | 'medium' | 'hard'

// ── Row ────────────────────────────────────────────────────────────────────────
function ScenarioRow({ scenario, index }: { scenario: DetectiveScenario; index: number }) {
  const id   = scenario.slug || scenario._id || scenario.id || ''
  const diff = (scenario.difficulty ?? 'medium').toLowerCase()
  const meta = DIFF_META[diff] ?? DIFF_META.medium
  const mode = MODE_LABELS[scenario.mode] ?? scenario.mode

  return (
    <Link
      href={`/learn/detective/${id}`}
      className="group flex items-center gap-5 border-b border-hairline px-6 py-4 transition-all hover:bg-brand-tint/10 last:border-b-0"
    >
      {/* Row number */}
      <span className="font-mono text-[11px] text-ink-faint w-6 shrink-0 select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Difficulty dot */}
      <span className={cn('h-2 w-2 rounded-full shrink-0', meta.dot)} title={meta.label} />

      {/* Title + stem */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink leading-tight group-hover:text-brand transition-colors truncate">
          {scenario.title}
        </p>
        {scenario.stem && (
          <p className="text-[12px] text-ink-faint mt-0.5 line-clamp-1 leading-snug">
            {scenario.stem}
          </p>
        )}
      </div>

      {/* Mode badge */}
      <span className="hidden sm:inline-flex font-mono text-[9px] uppercase tracking-widest text-ink-faint border border-hairline rounded-full px-2 py-0.5 shrink-0">
        {mode}
      </span>

      {/* Difficulty label */}
      <span className={cn('hidden sm:inline font-mono text-[10px] shrink-0 w-12 text-right', meta.text)}>
        {meta.label}
      </span>

      {/* Arrow */}
      <ArrowRight size={14} className="text-ink-faint group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function DetectiveList() {
  const [scenarios, setScenarios] = useState<DetectiveScenario[]>([])
  const [loading,   setLoading]   = useState(true)
  const [diff,      setDiff]      = useState<Diff>('all')

  useEffect(() => {
    let cancelled = false
    learnApi.detective.list()
      .then(d => { if (!cancelled) setScenarios(d.scenarios ?? []) })
      .catch(e => toast.error(e instanceof Error ? e.message : 'Failed to load scenarios'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const counts = useMemo(() => ({
    all:    scenarios.length,
    easy:   scenarios.filter(s => s.difficulty?.toLowerCase() === 'easy').length,
    medium: scenarios.filter(s => s.difficulty?.toLowerCase() === 'medium').length,
    hard:   scenarios.filter(s => s.difficulty?.toLowerCase() === 'hard').length,
  }), [scenarios])

  const filtered = diff === 'all'
    ? scenarios
    : scenarios.filter(s => s.difficulty?.toLowerCase() === diff)

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper relative">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-hairline bg-paper/90 backdrop-blur-sm px-6 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <Link
            href="/learn/detective"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors"
          >
            <ArrowLeft size={13} /> Pattern Detective
          </Link>
          <Link
            href="/learn/detective/history"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors"
          >
            <History size={13} /> My History
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-8">

        {/* ── Page title + stats ─────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-2">Problems</p>
          <h1 className="font-serif text-[30px] font-medium text-ink leading-tight tracking-tight">
            Pattern Library
          </h1>
          {!loading && (
            <div className="flex items-center gap-5 mt-3">
              <span className="text-[13px] text-ink-muted">{counts.all} scenarios</span>
              <div className="flex items-center gap-4">
                {(['easy', 'medium', 'hard'] as const).map(d => {
                  const m = DIFF_META[d]
                  return (
                    <span key={d} className="flex items-center gap-1.5 text-[12px]">
                      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
                      <span className={cn('font-mono', m.text)}>{counts[d]} {m.label}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Difficulty filter ──────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-1 border-b border-hairline -mx-6 px-6 pb-0">
          {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => {
            const label = d === 'all' ? `All (${counts.all})` :
                          d === 'easy' ? `Easy (${counts.easy})` :
                          d === 'medium' ? `Medium (${counts.medium})` :
                          `Hard (${counts.hard})`
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={cn(
                  'pb-3 px-1 mr-4 text-[13px] font-medium border-b-2 -mb-px transition-colors',
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

        {/* ── List ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-5 border-b border-hairline px-6 py-4">
                <div className="w-6 h-3 rounded bg-hairline animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-hairline animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 rounded bg-hairline animate-pulse" />
                  <div className="h-2.5 w-72 rounded bg-hairline animate-pulse" />
                </div>
                <div className="h-3 w-14 rounded bg-hairline animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-ink-muted">
              {scenarios.length === 0 ? 'No scenarios yet.' : 'No scenarios match this filter.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden mx-0">
            {filtered.map((s, i) => (
              <ScenarioRow key={s.slug || s._id || s.id} scenario={s} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
