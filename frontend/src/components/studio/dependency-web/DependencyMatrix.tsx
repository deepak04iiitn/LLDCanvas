'use client'

import { cn } from '@/lib/utils'
import type { toMatrix } from '@/lib/graph/dependencyWeb'

export function DependencyMatrix({
  matrix,
  onSelect,
  className,
}: {
  matrix: ReturnType<typeof toMatrix>
  onSelect?: (id: string) => void
  className?: string
}) {
  const { labels, ids, matrix: m } = matrix
  if (ids.length > 24) {
    return (
      <p className={cn('p-3 text-[13px] text-ink-muted', className)}>
        Matrix capped for readability — filter the graph below 24 nodes to use this view.
      </p>
    )
  }
  return (
    <div className={cn('overflow-auto p-2', className)}>
      <table className="border-collapse font-mono text-[10px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-paper p-1" />
            {labels.map((lab, j) => (
              <th
                key={ids[j]}
                className="max-w-[48px] truncate p-1 text-ink-faint"
                title={lab}
              >
                {lab.slice(0, 6)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((lab, i) => (
            <tr key={ids[i]}>
              <th
                className="sticky left-0 max-w-[80px] truncate bg-paper p-1 text-left text-ink"
                title={lab}
              >
                <button type="button" onClick={() => onSelect?.(ids[i])}>
                  {lab.slice(0, 12)}
                </button>
              </th>
              {m[i].map((cell, j) => (
                <td
                  key={`${i}-${j}`}
                  className={cn(
                    'h-5 w-5 border border-hairline text-center',
                    cell ? 'bg-brand/40' : 'bg-paper',
                  )}
                >
                  {cell ? '✓' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CompareStrip({
  totalBefore,
  totalAfter,
  focus,
  className,
}: {
  totalBefore: number
  totalAfter: number
  focus?: {
    label: string
    beforeOut: number
    afterOut: number
  } | null
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[12px]',
        className,
      )}
    >
      <span className="font-mono text-[10px] uppercase text-ink-faint">Compare</span>
      <span>
        Edges {totalBefore} → {totalAfter}
      </span>
      {focus && (
        <span>
          {focus.label} out: {focus.beforeOut} → {focus.afterOut}
        </span>
      )}
    </div>
  )
}
