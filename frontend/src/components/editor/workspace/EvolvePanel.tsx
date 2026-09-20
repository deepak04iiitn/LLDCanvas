'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { budgetCalc } from '@/lib/graph/budgetCalc'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'

export interface EvolvePanelProps {
  diagram?: { nodes: unknown[]; edges: unknown[] } | null
  className?: string
}

/**
 * Evolve tab — Architecture Budget summary + links into Change One / Evolution studio.
 */
export function EvolvePanel({ diagram = null, className }: EvolvePanelProps) {
  const budget = useMemo(() => {
    if (!diagram) return null
    const like: DiagramLike = {
      nodes: diagram.nodes as DiagramLike['nodes'],
      edges: diagram.edges as DiagramLike['edges'],
    }
    return budgetCalc(like, {}, 40)
  }, [diagram])

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-y-auto bg-paper', className)}>
      <div className="border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Evolve
        </p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Track design cost, then practice constrained change in Design Studio.
        </p>
      </div>

      <section className="border-b border-hairline px-4 py-4">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Architecture Budget
        </p>
        {!budget || budget.lines.length === 0 ? (
          <p className="mt-2 text-[13px] text-ink-muted">
            Add classes and relationships to see a live cost breakdown.
          </p>
        ) : (
          <>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tabular-nums text-brand">
                {budget.total}
              </span>
              {budget.limit != null && (
                <span className="font-mono text-[12px] text-ink-faint">
                  / {budget.limit}
                  {budget.remaining != null && (
                    <> · {budget.remaining >= 0 ? `${budget.remaining} left` : `${Math.abs(budget.remaining)} over`}</>
                  )}
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1.5">
              {budget.lines.map(line => (
                <li
                  key={line.label}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-ink-muted">
                    {line.label}
                    <span className="ml-1 font-mono text-[10px] text-ink-faint">
                      ×{line.count}
                    </span>
                  </span>
                  <span className="font-mono tabular-nums text-ink">{line.total}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="px-4 py-4">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Studio challenges
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/design-studio/change"
            className="rounded-md border border-hairline px-3 py-2.5 text-[13px] text-ink transition-colors hover:border-brand/40 hover:bg-brand-tint/40"
          >
            <span className="font-medium text-brand">Change One Thing</span>
            <span className="mt-0.5 block text-[12px] text-ink-muted">
              Improve a design with a single structural change.
            </span>
          </Link>
          <Link
            href="/design-studio/evolution"
            className="rounded-md border border-hairline px-3 py-2.5 text-[13px] text-ink transition-colors hover:border-brand/40 hover:bg-brand-tint/40"
          >
            <span className="font-medium text-brand">Evolution</span>
            <span className="mt-0.5 block text-[12px] text-ink-muted">
              Grow a design through staged requirement shifts.
            </span>
          </Link>
          <Link
            href="/design-studio/budget"
            className="rounded-md border border-hairline px-3 py-2.5 text-[13px] text-ink transition-colors hover:border-brand/40 hover:bg-brand-tint/40"
          >
            <span className="font-medium text-brand">Budget Mode</span>
            <span className="mt-0.5 block text-[12px] text-ink-muted">
              Design under a hard cost ceiling.
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
