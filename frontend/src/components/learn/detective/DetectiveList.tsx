'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type DetectiveScenario } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Mode display ───────────────────────────────────────────────────────────────
const MODE_LABELS: Record<string, string> = {
  identify: 'Identify',
  detect:   'Detect',
  explain:  'Explain',
  suggest:  'Suggest',
  compare:  'Compare',
}

// Using brand/ink tokens only for mode badge colors
const MODE_BADGE: Record<string, string> = {
  identify: 'bg-brand-tint text-brand',
  detect:   'bg-brand-tint text-brand',
  explain:  'bg-paper text-ink-muted',
  suggest:  'bg-paper text-ink-muted',
  compare:  'bg-paper text-ink-muted',
}

// ── Difficulty filter ──────────────────────────────────────────────────────────
type Difficulty = 'all' | 'easy' | 'medium' | 'hard'

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function DetectiveList() {
  const [scenarios, setScenarios] = useState<DetectiveScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [diffFilter, setDiffFilter] = useState<Difficulty>('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.detective.list()
        if (!cancelled) setScenarios(data.scenarios ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load scenarios')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered =
    diffFilter === 'all'
      ? scenarios
      : scenarios.filter(s => s.difficulty?.toLowerCase() === diffFilter)

  return (
    <CategoryShell
      title="Pattern Detective"
      subtitle="Identify, detect, and explain patterns in scenarios"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Header row: difficulty pills + history link */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Difficulty filter pills */}
          <div className="flex items-center gap-1.5">
            {DIFFICULTIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDiffFilter(value)}
                className={cn(
                  'rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-colors',
                  diffFilter === value
                    ? 'border-brand/40 bg-brand-tint text-brand'
                    : 'border-hairline bg-paper text-ink-muted hover:border-brand/25 hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* History link */}
          <Link
            href="/learn/detective/history"
            className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-brand/30 hover:text-brand"
          >
            <History size={13} />
            My History
          </Link>
        </div>

        {/* Scenario list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[14px] text-ink-muted">
            {scenarios.length === 0
              ? 'No scenarios yet. Seed with seed-learn-modes.ts.'
              : 'No scenarios match this filter.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map(s => {
              const id = s.slug || s._id || s.id || ''
              const modeBadge = MODE_BADGE[s.mode] ?? 'bg-paper text-ink-muted'
              return (
                <li key={id}>
                  <Link
                    href={`/learn/detective/${id}`}
                    className="group flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/30"
                  >
                    <div className="min-w-0 flex-1">
                      {/* Badges row */}
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium',
                            modeBadge,
                            'border-transparent',
                          )}
                        >
                          {MODE_LABELS[s.mode] ?? s.mode}
                        </span>
                        <span className="font-mono text-[10px] capitalize text-ink-faint">
                          {s.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-serif text-lg font-medium text-ink transition-colors group-hover:text-brand">
                        {s.title}
                      </h2>

                      {/* Stem preview */}
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
                        {s.stem}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </CategoryShell>
  )
}
