'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export function OverviewCard({
  name,
  nodeType,
  responsibilities,
  dependencies,
  dependents,
  indirectDependencies,
  outgoingRelationships,
  onExpandDeps,
  className,
}: {
  name: string
  nodeType: string
  responsibilities: string[]
  dependencies: number
  dependents: number
  indirectDependencies: number
  outgoingRelationships: number
  onExpandDeps?: () => void
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-hairline bg-paper-elevated p-3', className)}>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">{nodeType}</p>
      <h3 className="font-serif text-xl text-ink">{name}</h3>

      <section className="mt-3">
        <p className="font-mono text-[10px] font-semibold uppercase text-ink-faint">
          Responsibilities
        </p>
        {responsibilities.length === 0 ? (
          <p className="mt-1 text-[12px] text-ink-muted">No methods yet.</p>
        ) : (
          <ul className="mt-1 max-h-28 space-y-0.5 overflow-y-auto">
            {responsibilities.slice(0, 8).map(r => (
              <li key={r} className="font-mono text-[11px] text-ink-muted">
                · {r}
              </li>
            ))}
          </ul>
        )}
      </section>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <button type="button" onClick={onExpandDeps} className="rounded border border-hairline px-2 py-1.5 text-left hover:border-brand/40">
          <dt className="font-mono text-[10px] text-ink-faint">Dependencies</dt>
          <dd className="font-mono text-lg font-semibold text-brand">{dependencies}</dd>
        </button>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Dependents</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{dependents}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Indirect deps</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{indirectDependencies}</dd>
        </div>
        <div className="rounded border border-hairline px-2 py-1.5">
          <dt className="font-mono text-[10px] text-ink-faint">Outgoing rels</dt>
          <dd className="font-mono text-lg font-semibold text-ink">{outgoingRelationships}</dd>
        </div>
      </dl>
    </div>
  )
}

export function WhatIfPanel({
  focusName,
  directCount,
  indirectCount,
  affectedFlows,
  affectedComponents,
  className,
}: {
  focusName: string
  directCount: number
  indirectCount: number
  affectedFlows: string[]
  affectedComponents: number
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-amber-200 bg-amber-50/40 p-3', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase text-amber-800">
        What if {focusName} changes?
      </p>
      <ul className="mt-2 space-y-1 text-[12px] text-amber-950">
        <li>Direct dependents: {directCount}</li>
        <li>Indirect dependents: {indirectCount}</li>
        <li>Affected components: {affectedComponents}</li>
        <li>Affected flows: {affectedFlows.length || '—'}</li>
      </ul>
      {affectedFlows.length > 0 && (
        <p className="mt-1 font-mono text-[11px] text-amber-800/80">
          {affectedFlows.join(', ')}
        </p>
      )}
      <Link
        href="/design-studio/change"
        className="mt-3 inline-block text-[12px] font-medium text-brand hover:underline"
      >
        Practice in Change One Thing →
      </Link>
    </div>
  )
}
