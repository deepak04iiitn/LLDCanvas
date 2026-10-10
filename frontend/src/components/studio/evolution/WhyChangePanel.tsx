'use client'

import { cn } from '@/lib/utils'

const WHY_OPTIONS = [
  'Reduce synchronous coupling',
  'Improve scalability',
  'Improve reliability',
  'Enable asynchronous processing',
  'Support a new capability / provider',
  'Clarify ownership boundaries',
  'Reduce blast radius of failures',
  'Other',
]

export interface WhyChangePanelProps {
  selected: Set<string>
  onToggle: (why: string) => void
  note: string
  onNote: (v: string) => void
  className?: string
}

export function WhyChangePanel({
  selected,
  onToggle,
  note,
  onNote,
  className,
}: WhyChangePanelProps) {
  return (
    <div className={cn('border-t border-hairline px-4 py-4 sm:px-6', className)}>
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Why are you changing the architecture?
      </p>
      <div className="flex flex-wrap gap-2">
        {WHY_OPTIONS.map(opt => {
          const on = selected.has(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-[12px]',
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
      <textarea
        value={note}
        onChange={e => onNote(e.target.value)}
        placeholder="Optional: explain your reasoning (feeds the decision log)"
        rows={2}
        className="mt-3 w-full rounded-md border border-hairline bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
      />
    </div>
  )
}
