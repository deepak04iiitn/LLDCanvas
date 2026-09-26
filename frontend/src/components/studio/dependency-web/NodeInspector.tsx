'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { getNodeStats } from '@/lib/graph/dependencyWeb'

type Stats = NonNullable<ReturnType<typeof getNodeStats>>

export function NodeInspector({
  stats,
  onTraceDeps,
  onTraceDependents,
  onBlast,
  onSimulateRemoval,
  onSimulateChange,
  onOpenMicroscope,
  onFindPaths,
  budgetNote,
  className,
}: {
  stats: Stats
  onTraceDeps: () => void
  onTraceDependents: () => void
  onBlast: () => void
  onSimulateRemoval: () => void
  onSimulateChange: () => void
  onOpenMicroscope?: () => void
  onFindPaths?: () => void
  budgetNote?: string
  className?: string
}) {
  const n = stats.node
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="font-mono text-[10px] uppercase text-ink-faint">{n.nodeType}</p>
        <h3 className="font-serif text-xl text-ink">{n.label}</h3>
        {n.layer && (
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">Layer: {n.layer}</p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Incoming</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{stats.incoming}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Outgoing</dt>
          <dd className="font-mono text-lg font-semibold text-brand">{stats.outgoing}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Indirect</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{stats.indirectOut}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Depth</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{stats.dependencyDepth}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Cycles</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{stats.cycles}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Flows</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{stats.affectedFlows}</dd>
        </div>
      </dl>

      {n.isHub && (
        <p className="rounded-md border border-brand/30 bg-brand-tint/40 px-2 py-1.5 text-[12px] text-ink">
          Dependency concentration detected — investigate why this node is central.
        </p>
      )}

      {budgetNote && (
        <p className="rounded-md border border-hairline px-2 py-1.5 text-[12px] text-ink-muted">
          {budgetNote}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {[
          { label: 'Trace Dependencies', onClick: onTraceDeps },
          { label: 'Trace Dependents', onClick: onTraceDependents },
          { label: 'Blast Radius', onClick: onBlast },
          { label: 'Simulate Removal', onClick: onSimulateRemoval },
          { label: 'Simulate Change', onClick: onSimulateChange },
          { label: 'Find Paths', onClick: onFindPaths },
        ].map(a =>
          a.onClick ? (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="rounded-md border border-hairline px-2 py-1.5 text-left text-[12px] text-ink hover:border-brand/40"
            >
              {a.label}
            </button>
          ) : null,
        )}
        {onOpenMicroscope && (
          <button
            type="button"
            onClick={onOpenMicroscope}
            className="rounded-md bg-brand px-2 py-1.5 text-left text-[12px] font-semibold text-brand-foreground"
          >
            Open in Microscope
          </button>
        )}
        <Link
          href="/design-studio/change"
          className="rounded-md border border-hairline px-2 py-1.5 text-[12px] text-brand hover:bg-brand-tint/30"
        >
          Practice in Change One Thing →
        </Link>
      </div>
    </div>
  )
}
