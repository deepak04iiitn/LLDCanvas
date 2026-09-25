'use client'

import { cn } from '@/lib/utils'

export interface JourneyVersion {
  stageId: string
  dayLabel: string
  title?: string
  decision?: string
  accepted?: boolean
}

export interface EvolutionJourneyMapProps {
  versions: JourneyVersion[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  className?: string
}

export function EvolutionJourneyMap({
  versions,
  selectedIndex,
  onSelect,
  className,
}: EvolutionJourneyMapProps) {
  // Skip baseline-only display noise: show all stored versions
  return (
    <div className={cn('px-4 py-4 sm:px-6', className)}>
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Architecture journey
      </p>
      <ol className="flex flex-wrap items-center gap-2">
        {versions.map((v, i) => (
          <li key={`${v.stageId}-${i}`} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left transition-colors',
                selectedIndex === i
                  ? 'border-brand bg-brand-tint/50'
                  : 'border-hairline bg-paper-elevated hover:border-brand/40',
              )}
            >
              <p className="font-mono text-[10px] text-ink-faint">
                V{i} · {v.dayLabel}
              </p>
              <p className="text-[12px] font-medium text-ink">{v.title ?? v.stageId}</p>
              <p className="font-mono text-[9px] uppercase text-ink-faint">
                {v.decision === 'noop' ? 'held' : 'evolved'}
                {v.accepted === false ? ' · retry' : ''}
              </p>
            </button>
            {i < versions.length - 1 && (
              <span className="text-ink-faint" aria-hidden>
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
