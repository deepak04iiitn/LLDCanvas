'use client'

import { cn } from '@/lib/utils'
import type { MicroscopeLens } from '@/lib/graph/microscope'

const LENSES: { id: MicroscopeLens; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'blast', label: 'Blast Radius' },
  { id: 'responsibilities', label: 'Responsibilities' },
  { id: 'flows', label: 'Flows' },
  { id: 'abstractions', label: 'Abstractions' },
  { id: 'consumers', label: 'Consumers' },
  { id: 'cycles', label: 'Cycles' },
  { id: 'layers', label: 'Layers' },
  { id: 'encapsulation', label: 'Encapsulation' },
  { id: 'creation', label: 'Creation' },
  { id: 'xray', label: 'X-Ray' },
]

export function LensSwitcher({
  lens,
  onChange,
  className,
}: {
  lens: MicroscopeLens
  onChange: (l: MicroscopeLens) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {LENSES.map(l => (
        <button
          key={l.id}
          type="button"
          onClick={() => onChange(l.id)}
          className={cn(
            'rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wide transition-colors',
            lens === l.id
              ? 'bg-brand-tint text-brand'
              : 'text-ink-faint hover:bg-hairline/50 hover:text-ink-muted',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
