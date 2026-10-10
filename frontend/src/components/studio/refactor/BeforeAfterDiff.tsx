'use client'

import { cn } from '@/lib/utils'

export interface DiffEntryLike {
  kind?: string
  entity?: string
  id?: string
  name?: string
  detail?: string
}

export interface BeforeAfterDiffProps {
  diff?: DiffEntryLike[]
  behaviorChecks?: { id: string; ok: boolean; label: string; detail?: string }[]
  constraintChecks?: { id: string; ok: boolean; label: string; severity?: string }[]
  className?: string
}

export function BeforeAfterDiff({
  diff = [],
  behaviorChecks = [],
  constraintChecks = [],
  className,
}: BeforeAfterDiffProps) {
  const added = diff.filter(d => d.kind === 'added')
  const removed = diff.filter(d => d.kind === 'removed')
  const modified = diff.filter(d => d.kind === 'modified')

  return (
    <div className={cn('space-y-4 text-[13px]', className)}>
      {behaviorChecks.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Behavior check
          </p>
          <ul className="space-y-1">
            {behaviorChecks.map(c => (
              <li key={c.id} className={cn(c.ok ? 'text-emerald-700' : 'text-rose-700')}>
                {c.ok ? '✓' : '✗'} {c.label}
                {c.detail && !c.ok && (
                  <span className="mt-0.5 block pl-4 text-[12px] text-ink-muted">{c.detail}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-700/80">
            Removed / changed
          </p>
          <ul className="space-y-1 text-ink-muted">
            {removed.length === 0 && modified.length === 0 && (
              <li className="text-ink-faint">Nothing removed</li>
            )}
            {removed.map(d => (
              <li key={`r-${d.id}`}>
                ❌ {d.entity} {d.name ?? d.id}
              </li>
            ))}
            {modified.map(d => (
              <li key={`m-${d.id}`}>
                ~ {d.name ?? d.id} {d.detail ? `(${d.detail})` : ''}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80">
            Added
          </p>
          <ul className="space-y-1 text-ink-muted">
            {added.length === 0 && <li className="text-ink-faint">Nothing added</li>}
            {added.map(d => (
              <li key={`a-${d.id}`}>
                ✅ {d.entity} {d.name ?? d.detail ?? d.id}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {constraintChecks.filter(c => c.severity !== 'info' || !c.ok).length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Constraints
          </p>
          <ul className="space-y-1">
            {constraintChecks.map(c => (
              <li
                key={c.id}
                className={cn(
                  !c.ok && c.severity === 'error' && 'text-rose-700',
                  !c.ok && c.severity === 'warn' && 'text-amber-700',
                  c.ok && 'text-ink-muted',
                )}
              >
                {c.ok ? '·' : '!'} {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
