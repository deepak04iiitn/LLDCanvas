'use client'

import type { DesignScoreResult } from '@/lib/graph/scoreEngine'
import { cn } from '@/lib/utils'

export interface ScoreOverviewProps {
  score: DesignScoreResult | null
  onDimensionClick?: (dimensionId: string, highlightElementIds: string[]) => void
  className?: string
}

export function ScoreOverview({
  score,
  onDimensionClick,
  className,
}: ScoreOverviewProps) {
  if (!score) {
    return (
      <div className={cn('flex h-full items-center justify-center p-6 text-center', className)}>
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Design Score
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">
            Run score on a diagram to see heuristic feedback.
          </p>
        </div>
      </div>
    )
  }

  const pct = score.max > 0 ? Math.round((score.overall / score.max) * 100) : 0

  return (
    <div className={cn('flex h-full flex-col overflow-y-auto p-4', className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
        Design Score
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-black tabular-nums text-brand">
          {score.overall}
        </span>
        <span className="font-mono text-sm text-ink-faint">/ {score.max}</span>
        <span className="ml-auto font-mono text-[11px] text-ink-muted">{pct}%</span>
      </div>
      <p className="mt-2 text-[12px] italic text-ink-muted">{score.disclaimer}</p>

      <ul className="mt-5 space-y-2">
        {score.dimensions.map(d => {
          const dPct = d.max > 0 ? Math.round((d.score / d.max) * 100) : 0
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => onDimensionClick?.(d.id, d.highlightElementIds)}
                className="w-full rounded-lg border border-hairline bg-paper-elevated px-3 py-2.5 text-left transition-colors hover:border-brand/25"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink">{d.label}</span>
                  <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                    {d.score}/{d.max}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full bg-brand/80"
                    style={{ width: `${dPct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-ink-muted">
                  {d.explanation}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
