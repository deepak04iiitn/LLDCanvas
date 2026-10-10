'use client'

import { cn } from '@/lib/utils'

export interface PriorityRow {
  id: string
  label: string
  weight: string
}

export interface PressureRow {
  id: string
  label: string
  severity: string
}

export function PriorityBoard({
  priorities,
  pressures,
  deferredIds,
  onToggleDefer,
  className,
}: {
  priorities: PriorityRow[]
  pressures: PressureRow[]
  deferredIds: Set<string>
  onToggleDefer?: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Business priorities
        </p>
        <ul className="mt-1.5 space-y-1">
          {priorities.map(p => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md border border-hairline px-2.5 py-1.5 text-[12px]"
            >
              <span className="text-ink">{p.label}</span>
              <span
                className={cn(
                  'font-mono text-[10px] uppercase',
                  p.weight === 'critical'
                    ? 'text-red-600'
                    : p.weight === 'high'
                      ? 'text-amber-700'
                      : 'text-ink-faint',
                )}
              >
                {p.weight}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Pressures
        </p>
        <ul className="mt-1.5 space-y-1">
          {pressures.map(p => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border border-hairline px-2.5 py-1.5 text-[12px]"
            >
              <span className="text-ink">{p.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-ink-faint">{p.severity}</span>
                {onToggleDefer && (
                  <button
                    type="button"
                    onClick={() => onToggleDefer(p.id)}
                    className={cn(
                      'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase',
                      deferredIds.has(p.id)
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-hairline/40 text-ink-faint hover:bg-hairline',
                    )}
                  >
                    {deferredIds.has(p.id) ? 'Debt' : 'Defer'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
