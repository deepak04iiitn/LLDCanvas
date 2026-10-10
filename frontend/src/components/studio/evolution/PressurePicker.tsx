'use client'

import { cn } from '@/lib/utils'

export interface PressurePickerProps {
  options: string[]
  selected: Set<string>
  onToggle: (pressure: string) => void
  className?: string
}

export function PressurePicker({ options, selected, onToggle, className }: PressurePickerProps) {
  return (
    <div className={cn('px-4 py-3 sm:px-6', className)}>
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        What architectural pressure does this create?
      </p>
      <p className="mb-3 text-[12px] text-ink-muted">
        Pick the pressures you see — architecture should respond to evidence, not trends.
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const on = selected.has(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                on
                  ? 'border-brand bg-brand-tint/50 text-brand'
                  : 'border-hairline text-ink-muted hover:bg-hairline/40',
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
