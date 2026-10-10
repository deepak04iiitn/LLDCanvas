'use client'

import { cn } from '@/lib/utils'
import type { BudgetInvestment } from './InvestmentCatalog'

export interface InvestmentWhyPanelProps {
  investment: BudgetInvestment
  why: Set<string>
  targets: Set<string>
  estimatedCost?: number
  expertMode?: boolean
  onToggleWhy: (opt: string) => void
  onToggleTarget: (name: string) => void
  onEstimatedCost?: (n: number) => void
  className?: string
}

export function InvestmentWhyPanel({
  investment,
  why,
  targets,
  estimatedCost,
  expertMode,
  onToggleWhy,
  onToggleTarget,
  onEstimatedCost,
  className,
}: InvestmentWhyPanelProps) {
  const options = investment.whyOptions?.length
    ? investment.whyOptions
    : ['Improve reliability', 'Reduce load', 'Future flexibility', 'Other']
  const hints = investment.appliesToHints ?? []

  return (
    <div className={cn('rounded-lg border border-hairline bg-paper px-3 py-3', className)}>
      <p className="text-[13px] font-medium text-ink">Why add {investment.label}?</p>
      <p className="mt-0.5 text-[12px] text-ink-muted">Pick at least one reason — shopping is not enough.</p>
      <ul className="mt-2 space-y-1">
        {options.map(opt => (
          <li key={opt}>
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink">
              <input
                type="checkbox"
                checked={why.has(opt)}
                onChange={() => onToggleWhy(opt)}
                className="rounded border-hairline"
              />
              {opt}
            </label>
          </li>
        ))}
      </ul>

      {hints.length > 0 && (
        <>
          <p className="mt-3 text-[13px] font-medium text-ink">Which part benefits?</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {hints.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => onToggleTarget(h)}
                className={cn(
                  'rounded-md border px-2 py-1 font-mono text-[11px]',
                  targets.has(h)
                    ? 'border-brand bg-brand-tint/40 text-brand'
                    : 'border-hairline text-ink-muted hover:border-brand/40',
                )}
              >
                {h}
              </button>
            ))}
          </div>
        </>
      )}

      {expertMode && onEstimatedCost && (
        <label className="mt-3 flex items-center gap-2 text-[12px] text-ink">
          Estimated cost
          <input
            type="number"
            min={investment.costMin ?? 1}
            max={investment.costMax ?? investment.cost * 3}
            value={estimatedCost ?? investment.cost}
            onChange={e => onEstimatedCost(Number(e.target.value))}
            className="w-20 rounded border border-hairline bg-paper px-2 py-1 font-mono text-[12px]"
          />
        </label>
      )}
    </div>
  )
}
