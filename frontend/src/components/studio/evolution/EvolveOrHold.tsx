'use client'

import { cn } from '@/lib/utils'

export interface EvolveOrHoldProps {
  mustChange: boolean
  doNothingHint?: string
  decision: 'change' | 'noop' | null
  onDecide: (d: 'change' | 'noop') => void
  className?: string
}

export function EvolveOrHold({
  mustChange,
  doNothingHint,
  decision,
  onDecide,
  className,
}: EvolveOrHoldProps) {
  return (
    <div className={cn('px-4 py-4 sm:px-6', className)}>
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Does the current architecture still work?
      </p>
      <p className="mb-4 text-[13px] text-ink-muted">
        Choosing <strong className="font-medium text-ink">Do nothing</strong> is a valid outcome when
        the pressure does not require a structural change.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onDecide('noop')}
          className={cn(
            'rounded-xl border px-4 py-4 text-left transition-colors',
            decision === 'noop'
              ? 'border-brand bg-brand-tint/40'
              : 'border-hairline bg-paper-elevated hover:border-brand/40',
          )}
        >
          <p className="font-serif text-[16px] text-ink">Hold — do nothing</p>
          <p className="mt-1 text-[12px] text-ink-muted">
            {doNothingHint ??
              (mustChange
                ? 'Only choose this if you believe the pressure is overstated.'
                : 'Keep Vn as-is and advance.')}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onDecide('change')}
          className={cn(
            'rounded-xl border px-4 py-4 text-left transition-colors',
            decision === 'change'
              ? 'border-brand bg-brand-tint/40'
              : 'border-hairline bg-paper-elevated hover:border-brand/40',
          )}
        >
          <p className="font-serif text-[16px] text-ink">Evolve — change the design</p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Modify the existing UML under this pressure. Prefer the smallest sufficient change.
          </p>
        </button>
      </div>
    </div>
  )
}
