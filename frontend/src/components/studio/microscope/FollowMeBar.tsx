'use client'

import { cn } from '@/lib/utils'

export function FollowMeBar({
  anchorName,
  pathLabels,
  active,
  onToggle,
  onClear,
  className,
}: {
  anchorName?: string
  pathLabels?: string[]
  active: boolean
  onToggle: () => void
  onClear?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-md border border-hairline bg-paper-elevated px-2 py-1.5',
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase',
          active ? 'bg-brand text-brand-foreground' : 'bg-hairline/60 text-ink-muted',
        )}
      >
        Follow Me
      </button>
      {active && anchorName && (
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink-muted">
          Anchor: <span className="text-ink">{anchorName}</span>
          {pathLabels && pathLabels.length > 1 && (
            <> · Path: {pathLabels.join(' → ')}</>
          )}
        </p>
      )}
      {active && onClear && (
        <button type="button" onClick={onClear} className="font-mono text-[10px] text-ink-faint">
          Clear
        </button>
      )}
    </div>
  )
}
