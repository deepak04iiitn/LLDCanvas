'use client'

import { cn } from '@/lib/utils'
import type { MicroscopeZoomLevel } from '@/lib/graph/microscope'

const LEVELS: { id: MicroscopeZoomLevel; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'component', label: 'Component' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'flow', label: 'Flow' },
  { id: 'responsibility', label: 'Responsibility' },
]

export function ZoomBreadcrumb({
  level,
  onChange,
  focusLabel,
  className,
}: {
  level: MicroscopeZoomLevel
  onChange: (l: MicroscopeZoomLevel) => void
  focusLabel?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {LEVELS.map((l, i) => (
        <span key={l.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-ink-faint">/</span>}
          <button
            type="button"
            onClick={() => onChange(l.id)}
            className={cn(
              'font-mono text-[10px] uppercase tracking-wide',
              level === l.id ? 'font-semibold text-brand' : 'text-ink-faint hover:text-ink-muted',
            )}
          >
            {l.label}
          </button>
        </span>
      ))}
      {focusLabel && (
        <span className="ml-2 truncate font-mono text-[11px] text-ink-muted">{focusLabel}</span>
      )}
    </div>
  )
}
