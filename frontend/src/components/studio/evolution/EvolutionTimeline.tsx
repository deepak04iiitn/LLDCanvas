'use client'

import { cn } from '@/lib/utils'

export interface EvolutionTimelineStage {
  id: string
  dayLabel: string
  title: string
  category?: string
}

export interface EvolutionTimelineProps {
  stages: EvolutionTimelineStage[]
  stageIndex: number
  completedCount: number
  onSelectCompleted?: (index: number) => void
  className?: string
}

export function EvolutionTimeline({
  stages,
  stageIndex,
  completedCount,
  onSelectCompleted,
  className,
}: EvolutionTimelineProps) {
  return (
    <div className={cn('shrink-0 overflow-x-auto border-b border-hairline bg-paper px-4 py-3', className)}>
      <ol className="flex min-w-max items-stretch gap-0">
        {stages.map((s, i) => {
          const done = i < completedCount
          const active = i === stageIndex && !done
          const clickable = done && onSelectCompleted
          return (
            <li key={s.id} className="flex items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onSelectCompleted?.(i)}
                className={cn(
                  'rounded-lg px-3 py-2 text-left transition-colors',
                  active && 'bg-brand-tint/60 ring-1 ring-brand/30',
                  done && 'hover:bg-hairline/40',
                  !done && !active && 'opacity-60',
                )}
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  {s.dayLabel}
                </p>
                <p
                  className={cn(
                    'mt-0.5 max-w-[140px] truncate text-[12px] font-medium',
                    active ? 'text-brand' : 'text-ink',
                  )}
                >
                  {s.title}
                </p>
                {s.category && (
                  <p className="mt-0.5 font-mono text-[9px] uppercase text-ink-faint">{s.category}</p>
                )}
              </button>
              {i < stages.length - 1 && (
                <span className="mx-1 h-px w-6 shrink-0 bg-hairline" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
