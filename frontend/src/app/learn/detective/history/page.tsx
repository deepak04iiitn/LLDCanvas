'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, ChevronLeft, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// NOTE: The current /learn/detective/history API returns attempt groups (per scenario)
// and per-pattern mastery, but does not include per-attempt date or mode.
// To add date/mode columns, the backend would need to expose a flat attempt log.

type AttemptGroup = {
  scenarioId: string
  title: string
  slug: string
  correctCount: number
  totalCount: number
}

type PatternMastery = Record<string, { correct: number; total: number }>

export default function DetectiveHistoryPage() {
  const [attempts, setAttempts] = useState<AttemptGroup[]>([])
  const [patternMastery, setPatternMastery] = useState<PatternMastery>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await learnApi.detective.history()
        setAttempts(data.attempts)
        setPatternMastery(data.patternMastery)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load progress')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <CategoryShell
      title="Pattern Progress"
      subtitle="Your learning journey through design patterns"
      backHref="/learn/detective"
      backLabel="Scenarios"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-[15px] text-ink-muted">No attempts yet.</p>
            <Link
              href="/learn/detective"
              className="inline-flex items-center gap-1 text-[13px] text-brand hover:underline"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Try a scenario
            </Link>
          </div>
        ) : (
          <>
            {/* ── PRIMARY: Attempt log table ────────────────────────────────── */}
            <section>
              <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Attempt Log
              </p>
              <div className="overflow-hidden rounded-xl border border-hairline">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-hairline bg-paper text-ink-muted">
                      <th className="px-4 py-3 text-left font-medium">Scenario</th>
                      <th className="px-4 py-3 text-center font-medium">Correct</th>
                      <th className="px-4 py-3 text-center font-medium">Attempts</th>
                      <th className="px-4 py-3 text-center font-medium">Rate</th>
                      <th className="px-4 py-3 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((group, i) => {
                      const rate =
                        group.totalCount > 0
                          ? Math.round((group.correctCount / group.totalCount) * 100)
                          : 0
                      return (
                        <tr
                          key={group.scenarioId}
                          className={i % 2 === 0 ? 'bg-paper' : 'bg-paper-elevated'}
                        >
                          <td className="px-4 py-3 font-medium text-ink">
                            {group.title}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 font-medium text-brand">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {group.correctCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-ink-muted">
                            {group.totalCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                'font-semibold',
                                rate >= 70
                                  ? 'text-brand'
                                  : rate >= 40
                                  ? 'text-ink-muted'
                                  : 'text-ink-faint',
                              )}
                            >
                              {rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link
                              href={`/learn/detective/${group.slug}`}
                              className="inline-flex items-center gap-1 text-[12px] text-brand hover:underline"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Try again
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── SECONDARY: Mastery bars per pattern (compact) ─────────────── */}
            {Object.keys(patternMastery).length > 0 && (
              <section>
                <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Pattern Mastery
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(patternMastery).map(([slug, stats]) => {
                    const pct =
                      stats.total > 0
                        ? Math.round((stats.correct / stats.total) * 100)
                        : 0
                    return (
                      <div
                        key={slug}
                        className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[13px] font-medium capitalize text-ink">
                            {slug.replace(/-/g, ' ')}
                          </span>
                          <span
                            className={cn(
                              'text-[12px] font-semibold',
                              pct >= 70 ? 'text-brand' : 'text-ink-muted',
                            )}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-hairline)/0.6)]">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-ink-faint">
                          {stats.correct}/{stats.total} correct
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </CategoryShell>
  )
}
