'use client'

import { cn } from '@/lib/utils'

export interface BudgetInvestment {
  id: string
  label: string
  category: string
  cost: number
  summary?: string
  tags?: string[]
  benefits?: string[]
  complexities?: string[]
  risks?: string[]
  whyOptions?: string[]
  appliesToHints?: string[]
  cheapHackOf?: string
  costMin?: number
  costMax?: number
}

export interface InvestmentCatalogProps {
  investments: BudgetInvestment[]
  selectedIds: Set<string>
  disabledIds?: Set<string>
  remaining: number
  revealTradeoffs: boolean
  onToggle: (id: string) => void
  className?: string
}

export function InvestmentCatalog({
  investments,
  selectedIds,
  disabledIds,
  remaining,
  revealTradeoffs,
  onToggle,
  className,
}: InvestmentCatalogProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Architecture marketplace
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {investments.map(inv => {
          const selected = selectedIds.has(inv.id)
          const tooExpensive = !selected && inv.cost > remaining
          const disabled = disabledIds?.has(inv.id) || tooExpensive
          return (
            <li key={inv.id}>
              <button
                type="button"
                disabled={disabled && !selected}
                onClick={() => onToggle(inv.id)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                  selected
                    ? 'border-brand bg-brand-tint/30'
                    : disabled
                      ? 'cursor-not-allowed border-hairline/60 opacity-50'
                      : 'border-hairline hover:border-brand/40 hover:bg-hairline/20',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-ink">{inv.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase text-ink-faint">
                      {inv.category}
                      {inv.cheapHackOf ? ' · cheap path' : ''}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-paper px-2 py-0.5 font-mono text-[12px] font-semibold text-brand">
                    {inv.cost}
                  </span>
                </div>
                {inv.summary && (
                  <p className="mt-1.5 text-[12px] leading-snug text-ink-muted">{inv.summary}</p>
                )}
                {revealTradeoffs && (
                  <div className="mt-2 space-y-1 border-t border-hairline/60 pt-2 font-mono text-[10px] text-ink-faint">
                    {inv.benefits?.[0] && <p>Benefit: {inv.benefits[0]}</p>}
                    {inv.complexities?.[0] && <p>Complexity: {inv.complexities[0]}</p>}
                    {inv.risks?.[0] && <p>Risk: {inv.risks[0]}</p>}
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
