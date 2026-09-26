'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'

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
        toast.error(e instanceof Error ? e.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Overall mastery percentage
  const totalCorrect = Object.values(patternMastery).reduce((s, v) => s + v.correct, 0)
  const totalAttempts = Object.values(patternMastery).reduce((s, v) => s + v.total, 0)
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  return (
    <CategoryShell
      title="Pattern History"
      subtitle="Your Pattern Detective attempt log"
      backHref="/learn/detective"
      backLabel="Scenarios"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
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
            {/* Overall mastery card */}
            <div className="rounded-xl border border-hairline bg-paper-elevated p-6 flex items-center justify-between">
              <div>
                <p className="text-[13px] text-ink-muted uppercase tracking-wider font-medium">
                  Overall Pattern Mastery
                </p>
                <p className="mt-1 text-[32px] font-bold text-ink tabular-nums">
                  {overallPct}%
                </p>
                <p className="text-[12px] text-ink-faint">
                  {totalCorrect} correct out of {totalAttempts} attempts
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-brand flex items-center justify-center">
                <span className="text-[15px] font-bold text-brand">{overallPct}%</span>
              </div>
            </div>

            {/* Per-scenario table */}
            <div>
              <h2 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
                Scenarios
              </h2>
              <div className="rounded-xl border border-hairline overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-hairline bg-paper text-ink-muted">
                      <th className="px-4 py-3 text-left font-medium">Pattern / Scenario</th>
                      <th className="px-4 py-3 text-center font-medium">Correct</th>
                      <th className="px-4 py-3 text-center font-medium">Attempts</th>
                      <th className="px-4 py-3 text-center font-medium">Rate</th>
                      <th className="px-4 py-3 text-center font-medium">Retry</th>
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
                          className={
                            i % 2 === 0
                              ? 'bg-paper'
                              : 'bg-paper-elevated'
                          }
                        >
                          <td className="px-4 py-3 text-ink font-medium">{group.title}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {group.correctCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-ink-muted">
                            {group.totalCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={
                                rate >= 70
                                  ? 'text-emerald-600 font-semibold'
                                  : rate >= 40
                                    ? 'text-amber-600 font-semibold'
                                    : 'text-red-600 font-semibold'
                              }
                            >
                              {rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link
                              href={`/learn/detective/${group.slug}`}
                              className="text-brand hover:underline"
                            >
                              Try again
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pattern mastery breakdown */}
            {Object.keys(patternMastery).length > 0 && (
              <div>
                <h2 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  Pattern Mastery Breakdown
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(patternMastery).map(([slug, stats]) => {
                    const pct =
                      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
                    return (
                      <div
                        key={slug}
                        className="rounded-xl border border-hairline bg-paper-elevated p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] font-medium text-ink capitalize">
                            {slug.replace(/-/g, ' ')}
                          </span>
                          <span
                            className={
                              pct >= 70
                                ? 'text-[12px] font-semibold text-emerald-600'
                                : pct >= 40
                                  ? 'text-[12px] font-semibold text-amber-600'
                                  : 'text-[12px] font-semibold text-red-600'
                            }
                          >
                            {pct}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full bg-paper overflow-hidden">
                          <div
                            className={
                              pct >= 70
                                ? 'h-full rounded-full bg-emerald-500'
                                : pct >= 40
                                  ? 'h-full rounded-full bg-amber-400'
                                  : 'h-full rounded-full bg-red-400'
                            }
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-ink-faint">
                          {stats.correct}/{stats.total} correct
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CategoryShell>
  )
}
