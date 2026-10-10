'use client'

import { cn } from '@/lib/utils'

export interface BudgetReplayProps {
  entries: Record<string, unknown>[]
  className?: string
}

/** Step through pick timeline (section 19). */
export function BudgetReplay({ entries, className }: BudgetReplayProps) {
  if (!entries.length) {
    return (
      <p className={cn('text-[13px] text-ink-muted', className)}>No decisions to replay yet.</p>
    )
  }

  return (
    <ol className={cn('relative space-y-0 border-l border-hairline pl-4', className)}>
      {entries.map((raw, i) => {
        const e = raw as Record<string, unknown>
        const picks = Array.isArray(e.picks) ? e.picks : []
        return (
          <li key={i} className="relative pb-6">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand" />
            <p className="font-mono text-[10px] uppercase text-ink-faint">
              {String(e.stageId ?? `step-${i}`)}
            </p>
            <p className="mt-0.5 text-[13px] text-ink">
              Spent {String(e.spent ?? 0)} · Reserved {String(e.reserved ?? 0)}
            </p>
            {picks.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-[12px] text-ink-muted">
                {picks.map((p, j) => {
                  const pick = p as Record<string, unknown>
                  return (
                    <li key={j}>
                      → {String(pick.investmentId)}
                      {Array.isArray(pick.why) && pick.why.length
                        ? ` (${(pick.why as string[]).join(', ')})`
                        : ''}
                    </li>
                  )
                })}
              </ul>
            )}
            {typeof e.narrative === 'string' && (
              <p className="mt-1 text-[12px] text-ink-faint">{e.narrative}</p>
            )}
          </li>
        )
      })}
      <li className="relative">
        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-ink-faint" />
        <p className="text-[13px] font-medium text-ink">Future event / complete</p>
      </li>
    </ol>
  )
}
