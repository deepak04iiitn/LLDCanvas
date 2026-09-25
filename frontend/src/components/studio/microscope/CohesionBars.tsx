'use client'

import { cn } from '@/lib/utils'

export function CohesionBars({
  cohesion,
  className,
}: {
  cohesion: { domain: string; count: number; ratio: number }[]
  className?: string
}) {
  if (!cohesion.length) {
    return (
      <p className={cn('text-[12px] text-ink-muted', className)}>
        No methods to chart cohesion.
      </p>
    )
  }
  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="font-mono text-[10px] uppercase text-ink-faint">Responsibility cohesion</p>
      {cohesion.map(c => (
        <div key={c.domain} className="flex items-center gap-2 text-[12px]">
          <span className="w-24 shrink-0 capitalize text-ink-muted">{c.domain}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-sm bg-hairline/60">
            <div
              className="h-full rounded-sm bg-brand/70"
              style={{ width: `${Math.max(8, Math.round(c.ratio * 100))}%` }}
            />
          </div>
          <span className="w-6 font-mono text-[10px] text-ink-faint">{c.count}</span>
        </div>
      ))}
    </div>
  )
}
