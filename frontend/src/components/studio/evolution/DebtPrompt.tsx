'use client'

import { cn } from '@/lib/utils'

export interface DebtPromptProps {
  id: string
  prompt: string
  costIfDeferred: string
  action: 'fix' | 'defer' | null
  onChoose: (action: 'fix' | 'defer') => void
  className?: string
}

export function DebtPrompt({
  id,
  prompt,
  costIfDeferred,
  action,
  onChoose,
  className,
}: DebtPromptProps) {
  return (
    <div className={cn('border-t border-hairline px-4 py-4 sm:px-6', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        Architecture debt · {id}
      </p>
      <p className="mt-2 text-[14px] text-ink">{prompt}</p>
      <p className="mt-1 text-[12px] text-ink-muted">If deferred: {costIfDeferred}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChoose('fix')}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-[12px] font-medium',
            action === 'fix'
              ? 'border-brand bg-brand text-white'
              : 'border-hairline text-ink hover:bg-hairline/40',
          )}
        >
          Fix now
        </button>
        <button
          type="button"
          onClick={() => onChoose('defer')}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-[12px] font-medium',
            action === 'defer'
              ? 'border-amber-500 bg-amber-50 text-amber-900'
              : 'border-hairline text-ink hover:bg-hairline/40',
          )}
        >
          Defer (+1 debt)
        </button>
      </div>
    </div>
  )
}
