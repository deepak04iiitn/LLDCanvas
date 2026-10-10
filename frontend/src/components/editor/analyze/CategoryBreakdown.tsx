'use client'

import { cn } from '@/lib/utils'
import type { CategoryScore } from '@/lib/design-analysis'

export function CategoryBreakdown({ categories }: { categories: CategoryScore[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map(c => {
        if (c.applicable === 0) {
          return (
            <div key={c.category} className="rounded-2xl border border-hairline/70 bg-paper px-4 py-3 opacity-70">
              <p className="text-[13px] font-medium text-ink">{c.label}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-faint">Not applicable</p>
            </div>
          )
        }
        return (
          <div key={c.category} className="rounded-2xl border border-hairline bg-paper-elevated px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-medium text-ink">{c.label}</p>
              <p
                className={cn(
                  'font-mono text-[14px] font-semibold tabular-nums',
                  c.score >= 80 ? 'text-green-600' : c.score >= 55 ? 'text-amber-600' : 'text-red-600',
                )}
              >
                {c.score}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full rounded-full bg-brand/80 transition-all duration-700"
                style={{ width: `${c.score}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-ink-faint">
              {c.passed} pass · {c.warned} warn · {c.failed} fail
            </p>
          </div>
        )
      })}
    </div>
  )
}
