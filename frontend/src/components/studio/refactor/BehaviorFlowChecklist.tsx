'use client'

import { CheckCircle, Circle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BehaviorFlowItem {
  id?: string
  label: string
  steps?: string[]
}

export interface BehaviorFlowChecklistProps {
  flows: BehaviorFlowItem[]
  /**
   * IDs (or labels) of flows that passed.
   * • undefined  → not yet submitted; show all as "pending"
   * • string[]   → after submit; matched items show ✓, unmatched show ✗
   */
  satisfiedFlowIds?: string[]
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BehaviorFlowChecklist({
  flows,
  satisfiedFlowIds,
  className,
}: BehaviorFlowChecklistProps) {
  if (flows.length === 0) return null

  const pending = satisfiedFlowIds == null

  return (
    <ul className={cn('space-y-2', className)}>
      {flows.map(f => {
        const key = f.id ?? f.label
        const satisfied = !pending && satisfiedFlowIds.includes(key)
        const failed = !pending && !satisfiedFlowIds.includes(key)

        return (
          <li
            key={key}
            className={cn(
              'rounded-md border px-3 py-2 transition-colors duration-300',
              pending && 'border-hairline bg-paper-elevated',
              satisfied && 'border-emerald-300/80 bg-emerald-50/60',
              failed && 'border-red-200/60 bg-red-50/30',
            )}
          >
            <div className="flex items-start gap-2.5">
              {/* State icon */}
              {pending && (
                <Circle size={15} className="mt-0.5 shrink-0 text-ink-faint" />
              )}
              {satisfied && (
                <CheckCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-500 animate-in zoom-in-50 duration-300"
                />
              )}
              {failed && (
                <XCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
              )}

              <div className="min-w-0">
                {/* Flow label */}
                <p
                  className={cn(
                    'font-medium leading-snug',
                    pending && 'text-ink',
                    satisfied && 'text-emerald-700',
                    failed && 'text-red-700',
                  )}
                >
                  {f.label}
                </p>

                {/* Optional step-by-step breakdown */}
                {f.steps && f.steps.length > 0 && (
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[12px] text-ink-muted">
                    {f.steps.map(s => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
