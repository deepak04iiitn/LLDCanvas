'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalysisReport, RuleStatus } from '@/lib/design-analysis'
import { CategoryBreakdown } from './CategoryBreakdown'
import { FindingCard } from './FindingCard'

/** Short verdict next to the score — playful at the top, honest at the bottom */
function scoreVerdict(score: number): { label: string; blurb: string; tone: 'great' | 'ok' | 'bad' } {
  if (score >= 90)
    return { label: 'Outstanding', blurb: 'Interview-ready structure — keep polishing edges.', tone: 'great' }
  if (score >= 80)
    return { label: 'Excellent', blurb: 'Strong design bones. A few sharpenings left.', tone: 'great' }
  if (score >= 65)
    return { label: 'Good', blurb: 'Solid direction — tighten the weak spots below.', tone: 'great' }
  if (score >= 50)
    return { label: 'Okay', blurb: 'Readable, but relationships or completeness need work.', tone: 'ok' }
  if (score >= 35)
    return { label: 'Weak', blurb: 'The model is thin — add members and real collaboration.', tone: 'ok' }
  if (score >= 20)
    return { label: 'Bad', blurb: 'Mostly shells so far. Name types and wire them up.', tone: 'bad' }
  return { label: 'Rough', blurb: 'Start with real names, members, and at least one edge.', tone: 'bad' }
}

export function AnalyzeReport({
  report,
  stale,
  onBack,
  onReanalyze,
  onFocusElement,
  onEditCanvas,
}: {
  report: AnalysisReport
  stale?: boolean
  onBack: () => void
  onReanalyze: () => void
  onFocusElement?: (elementId: string) => void
  onEditCanvas?: () => void
}) {
  const [displayScore, setDisplayScore] = useState(0)
  const [filter, setFilter] = useState<RuleStatus | 'all'>('all')

  useEffect(() => {
    setDisplayScore(0)
    const target = report.overallScore
    const start = performance.now()
    const dur = 900
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [report.overallScore, report.revisionId])

  const filtered =
    filter === 'all'
      ? report.findings.filter(f => f.status !== 'na')
      : report.findings.filter(f => f.status === filter)

  const verdict = scoreVerdict(report.overallScore)

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-paper">
      <div className="sticky top-0 z-10 border-b border-hairline bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
          >
            <ArrowLeft size={13} /> Staging
          </button>
          <div className="flex items-center gap-2">
            {onEditCanvas && (
              <button
                type="button"
                onClick={onEditCanvas}
                className="rounded-full border border-hairline px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink"
              >
                Edit on canvas
              </button>
            )}
            <button
              type="button"
              onClick={onReanalyze}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              <RefreshCw size={12} /> Re-analyze
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-5 py-8">
        {stale && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            Diagram changed since this report. Re-analyze for an up-to-date score.
          </div>
        )}

        {/* Score hero */}
        <section className="rounded-3xl border border-hairline bg-paper-elevated p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between sm:gap-10">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                Overall design score
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={cn(
                    'font-mono text-5xl font-black tabular-nums tracking-tight',
                    verdict.tone === 'great' && 'text-green-600',
                    verdict.tone === 'ok' && 'text-amber-600',
                    verdict.tone === 'bad' && 'text-red-600',
                  )}
                >
                  {displayScore}
                </span>
                <span className="font-mono text-lg text-ink-faint">/ 100</span>
              </div>
              <p className="mt-3 max-w-md text-[13px] leading-snug text-ink-muted">
                {verdict.blurb}
              </p>
              <p className="mt-4 max-w-xl text-[12px] italic text-ink-faint">
                Deterministic heuristics for discussion — not absolute truth. Applicable rules only;
                N/A checks never punish you.
              </p>
              <p className="mt-3 font-mono text-[11px] text-ink-faint">
                {report.summary.typeCount} types · {report.summary.edgeCount} edges ·{' '}
                {report.summary.failed} fail · {report.summary.warned} warn ·{' '}
                {report.summary.passed} pass · ruleset {report.rulesetVersion}
              </p>
            </div>

            <div
              className={cn(
                'flex shrink-0 flex-col justify-center border-t border-hairline pt-5 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0',
                'sm:min-w-[9.5rem] sm:items-end sm:text-right',
              )}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink-faint">
                Verdict
              </p>
              <p
                className={cn(
                  'mt-2 font-serif text-[clamp(2.25rem,5vw,3.25rem)] font-medium leading-[0.95] tracking-tight',
                  verdict.tone === 'great' && 'text-green-700',
                  verdict.tone === 'ok' && 'text-amber-800',
                  verdict.tone === 'bad' && 'text-red-700',
                )}
              >
                {verdict.label}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-[22px] text-ink">By category</h2>
          <CategoryBreakdown categories={report.categories} />
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="font-serif text-[22px] text-ink">Strengths</h2>
            {report.strengths.length === 0 ? (
              <p className="text-[13px] text-ink-muted">No strong passes yet — keep modeling.</p>
            ) : (
              <ul className="space-y-2">
                {report.strengths.slice(0, 6).map((s, i) => (
                  <li
                    key={`${s.ruleId}-${i}`}
                    className="rounded-xl border border-green-200/60 bg-green-50/50 px-4 py-3"
                  >
                    <p className="text-[13px] font-medium text-ink">{s.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">{s.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-[22px] text-ink">Priorities to fix</h2>
            {report.recommendations.length === 0 ? (
              <p className="text-[13px] text-ink-muted">No critical issues detected.</p>
            ) : (
              <div className="space-y-3">
                {report.recommendations.slice(0, 5).map((f, i) => (
                  <FindingCard
                    key={`${f.ruleId}-${i}`}
                    finding={f}
                    onFocus={onFocusElement}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-[22px] text-ink">All checks</h2>
            <div className="flex flex-wrap gap-1">
              {(['all', 'fail', 'warn', 'pass'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider',
                    filter === f
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-hairline text-ink-faint hover:text-ink',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filtered.map((f, i) => (
              <FindingCard key={`${f.ruleId}-${f.status}-${i}`} finding={f} onFocus={onFocusElement} />
            ))}
            {filtered.length === 0 && (
              <p className="text-[13px] text-ink-muted">Nothing in this filter.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
