'use client'

import { cn } from '@/lib/utils'

export interface BudgetMeterProps {
  total: number
  remaining: number
  reserved: number
  unitLabel: string
  className?: string
}

export function BudgetMeter({
  total,
  remaining,
  reserved,
  unitLabel,
  className,
}: BudgetMeterProps) {
  const spent = Math.max(0, total - remaining - reserved)
  const pct = total > 0 ? Math.min(100, ((spent + reserved) / total) * 100) : 0
  const reservedPct = total > 0 ? (reserved / total) * 100 : 0

  return (
    <div
      className={cn(
        'rounded-lg border border-hairline bg-paper-elevated px-4 py-3',
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Architecture budget
        </p>
        <p className="font-mono text-[12px] text-ink">
          <span className="font-semibold text-brand">{remaining}</span>
          <span className="text-ink-faint"> / {total}</span>
          <span className="ml-1 text-ink-faint">{unitLabel}</span>
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-hairline/60">
        <div className="flex h-full">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${Math.max(0, pct - reservedPct)}%` }}
          />
          <div
            className="h-full bg-amber-400/80 transition-all"
            style={{ width: `${reservedPct}%` }}
          />
        </div>
      </div>
      <div className="mt-1.5 flex gap-3 font-mono text-[10px] text-ink-faint">
        <span>Spent {spent}</span>
        {reserved > 0 && <span className="text-amber-700">Reserved {reserved}</span>}
        <span>Left {remaining}</span>
      </div>
    </div>
  )
}
