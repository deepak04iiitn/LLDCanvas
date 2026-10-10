'use client'

import { cn } from '@/lib/utils'

export interface TradeoffCatalogItem {
  namePattern: string
  benefits: string[]
  costs: string[]
}

export interface TradeoffAckProps {
  items: TradeoffCatalogItem[]
  acknowledged: Set<string>
  onToggle: (label: string) => void
  className?: string
}

export function TradeoffAck({ items, acknowledged, onToggle, className }: TradeoffAckProps) {
  if (items.length === 0) return null
  return (
    <div className={cn('border-t border-hairline px-4 py-4 sm:px-6', className)}>
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Acknowledge tradeoffs
      </p>
      <p className="mb-3 text-[12px] text-ink-muted">
        Every major introduce gains something and costs something. Check what you accept.
      </p>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.namePattern} className="rounded-lg border border-hairline bg-paper-elevated p-3">
            <p className="text-[12px] font-medium text-ink">If you introduce: /{item.namePattern}/</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase text-emerald-700">Benefits</p>
                <ul className="mt-1 space-y-1">
                  {item.benefits.map(b => (
                    <li key={b}>
                      <label className="flex cursor-pointer gap-2 text-[12px] text-ink">
                        <input
                          type="checkbox"
                          checked={acknowledged.has(`+${b}`)}
                          onChange={() => onToggle(`+${b}`)}
                        />
                        {b}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-amber-700">Costs</p>
                <ul className="mt-1 space-y-1">
                  {item.costs.map(c => (
                    <li key={c}>
                      <label className="flex cursor-pointer gap-2 text-[12px] text-ink">
                        <input
                          type="checkbox"
                          checked={acknowledged.has(`-${c}`)}
                          onChange={() => onToggle(`-${c}`)}
                        />
                        {c}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
