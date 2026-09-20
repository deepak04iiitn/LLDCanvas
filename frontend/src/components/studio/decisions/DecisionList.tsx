'use client'

import { cn } from '@/lib/utils'

export interface DesignDecision {
  id: string
  elementId?: string
  elementName?: string
  why: string
  alternatives?: string
  tradeoffs?: string
  createdAt?: string
}

export interface DecisionListProps {
  decisions: DesignDecision[]
  onSelect?: (decision: DesignDecision) => void
  className?: string
}

export function DecisionList({ decisions, onSelect, className }: DecisionListProps) {
  if (decisions.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center p-6 text-center', className)}>
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Decision Log
          </p>
          <p className="mt-2 font-serif text-lg text-ink">No decisions yet</p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
            Annotate elements with why, alternatives, and trade-offs as you design.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col overflow-y-auto', className)}>
      <div className="border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Decision Log
        </p>
        <p className="font-mono text-[11px] text-ink-muted">{decisions.length} entries</p>
      </div>
      <ul className="divide-y divide-hairline">
        {decisions.map(d => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onSelect?.(d)}
              className="w-full px-4 py-3 text-left transition-colors hover:bg-hairline/40"
            >
              <p className="font-mono text-[10px] text-brand">
                {d.elementName ?? d.elementId ?? 'Design-wide'}
              </p>
              <p className="mt-1 text-[13px] text-ink">{d.why}</p>
              {d.alternatives && (
                <p className="mt-1 text-[12px] text-ink-muted">
                  Alt: {d.alternatives}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
