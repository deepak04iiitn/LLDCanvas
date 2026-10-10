'use client'

import { cn } from '@/lib/utils'

export function TradeoffReveal({
  benefits,
  complexities,
  risks,
  cost,
  mode,
  className,
}: {
  benefits?: string[]
  complexities?: string[]
  risks?: string[]
  cost: number
  mode: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  className?: string
}) {
  const showAll = mode === 'beginner'
  const showPartial = mode === 'intermediate'
  // advanced/expert: hide until after submit (caller passes empty)

  if (mode === 'advanced' || mode === 'expert') {
    return (
      <p className={cn('text-[12px] text-ink-muted', className)}>
        Tradeoffs are hidden — predict benefits and complexity yourself before submitting.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-hairline bg-paper-elevated px-3 py-2 font-mono text-[11px] text-ink-muted',
        className,
      )}
    >
      <p className="text-ink">Cost: {cost}</p>
      {(showAll || showPartial) && benefits?.[0] && <p>Benefit: {benefits[0]}</p>}
      {showAll && complexities?.[0] && <p>New complexity: {complexities[0]}</p>}
      {showAll && risks?.[0] && <p>Risk: {risks[0]}</p>}
    </div>
  )
}
