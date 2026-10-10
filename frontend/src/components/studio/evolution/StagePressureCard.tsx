'use client'

import { cn } from '@/lib/utils'

export interface StagePressureCardProps {
  dayLabel: string
  title: string
  category?: string
  narrative: string
  metrics?: {
    users?: number
    ordersPerDay?: number
    latencyMs?: number
    availability?: string
  }
  debtDueNote?: string
  className?: string
}

export function StagePressureCard({
  dayLabel,
  title,
  category,
  narrative,
  metrics,
  debtDueNote,
  className,
}: StagePressureCardProps) {
  return (
    <div className={cn('border-b border-hairline bg-paper px-4 py-4 sm:px-6', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
        {dayLabel}
        {category ? ` · ${category}` : ''}
      </p>
      <h2 className="mt-1 font-serif text-xl text-ink">{title}</h2>
      <div className="mt-3 rounded-lg border border-hairline bg-paper-elevated px-4 py-3">
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          What changed in the world
        </p>
        <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{narrative}</p>
      </div>
      {metrics && (
        <dl className="mt-3 flex flex-wrap gap-3 text-[12px] text-ink-muted">
          {metrics.users != null && (
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-faint">Users</dt>
              <dd className="tabular-nums text-ink">{metrics.users.toLocaleString()}</dd>
            </div>
          )}
          {metrics.ordersPerDay != null && (
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-faint">Orders / day</dt>
              <dd className="tabular-nums text-ink">{metrics.ordersPerDay.toLocaleString()}</dd>
            </div>
          )}
          {metrics.latencyMs != null && (
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-faint">p95 latency</dt>
              <dd className="tabular-nums text-ink">{metrics.latencyMs} ms</dd>
            </div>
          )}
          {metrics.availability && (
            <div>
              <dt className="font-mono text-[10px] uppercase text-ink-faint">Availability</dt>
              <dd className="text-ink">{metrics.availability}</dd>
            </div>
          )}
        </dl>
      )}
      {debtDueNote && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          Deferred debt is due: {debtDueNote}
        </p>
      )}
    </div>
  )
}
