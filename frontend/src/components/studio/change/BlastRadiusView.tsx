'use client'

import { cn } from '@/lib/utils'

export interface BlastRadiusViewProps {
  directIds?: string[]
  indirectIds?: string[]
  untouchedIds?: string[]
  directCount?: number
  indirectCount?: number
  untouchedCount?: number
  nameById?: Record<string, string>
  className?: string
}

export function BlastRadiusView({
  directIds = [],
  indirectIds = [],
  untouchedIds = [],
  directCount,
  indirectCount,
  untouchedCount,
  nameById = {},
  className,
}: BlastRadiusViewProps) {
  const label = (id: string) => nameById[id] ?? id

  return (
    <div className={cn('rounded-lg border border-hairline bg-paper-elevated p-4', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Change blast radius
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-serif text-2xl text-rose-700">{directCount ?? directIds.length}</p>
          <p className="text-[11px] text-ink-muted">Direct</p>
        </div>
        <div>
          <p className="font-serif text-2xl text-amber-700">{indirectCount ?? indirectIds.length}</p>
          <p className="text-[11px] text-ink-muted">Indirect</p>
        </div>
        <div>
          <p className="font-serif text-2xl text-emerald-700">{untouchedCount ?? untouchedIds.length}</p>
          <p className="text-[11px] text-ink-muted">Untouched</p>
        </div>
      </div>

      {(directIds.length > 0 || indirectIds.length > 0) && (
        <div className="mt-4 space-y-3 text-[12px]">
          {directIds.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-rose-700/80">
                Directly affected
              </p>
              <p className="text-ink-muted">{directIds.map(label).join(', ')}</p>
            </div>
          )}
          {indirectIds.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-amber-700/80">
                Indirectly affected
              </p>
              <p className="text-ink-muted">{indirectIds.map(label).join(', ')}</p>
            </div>
          )}
          {untouchedIds.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-emerald-700/80">
                Untouched (sample)
              </p>
              <p className="text-ink-muted">
                {untouchedIds.slice(0, 8).map(label).join(', ')}
                {untouchedIds.length > 8 ? ` +${untouchedIds.length - 8} more` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
