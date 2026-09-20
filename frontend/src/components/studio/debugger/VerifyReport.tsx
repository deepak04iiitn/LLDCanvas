'use client'

import { cn } from '@/lib/utils'
import type { DebuggerVerifyCheck } from '@/lib/studio-api'

export interface ScoreLike {
  overall?: number
  dimensions?: { key?: string; label?: string; score?: number }[]
}

export interface VerifyReportProps {
  checks: DebuggerVerifyCheck[]
  scores?: { before?: ScoreLike; after?: ScoreLike }
  className?: string
}

export function VerifyReport({ checks, scores, className }: VerifyReportProps) {
  const beforeDims = scores?.before?.dimensions ?? []
  const afterDims = scores?.after?.dimensions ?? []
  const dimKeys = ['coupling', 'cohesion', 'extensibility', 'complexity', 'solid']

  return (
    <div className={cn('space-y-5 p-4', className)}>
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Architecture Verification
        </p>
        <ul className="mt-3 space-y-2">
          {checks.map(c => (
            <li
              key={c.id}
              className={cn(
                'flex items-start gap-2 rounded-md border px-3 py-2 text-[13px]',
                c.ok
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                  : 'border-amber-200 bg-amber-50/60 text-amber-900',
              )}
            >
              <span className="font-mono text-[12px]">{c.ok ? '✓' : '✗'}</span>
              <span>{c.label}</span>
            </li>
          ))}
          {checks.length === 0 && (
            <li className="text-[13px] text-ink-muted">No verification checks configured.</li>
          )}
        </ul>
      </div>

      {(beforeDims.length > 0 || afterDims.length > 0) && (
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Design Score
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ScoreCol title="Before" overall={scores?.before?.overall} dims={beforeDims} keys={dimKeys} />
            <ScoreCol title="After" overall={scores?.after?.overall} dims={afterDims} keys={dimKeys} before={beforeDims} />
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreCol({
  title,
  overall,
  dims,
  keys,
  before,
}: {
  title: string
  overall?: number
  dims: { key?: string; label?: string; score?: number }[]
  keys: string[]
  before?: { key?: string; score?: number }[]
}) {
  return (
    <div className="rounded-md border border-hairline bg-paper-elevated p-3">
      <p className="font-mono text-[10px] uppercase text-ink-faint">{title}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{overall ?? '—'}</p>
      <ul className="mt-2 space-y-1">
        {keys.map(k => {
          const d = dims.find(x => x.key === k)
          const b = before?.find(x => x.key === k)
          const score = d?.score
          const delta =
            score != null && b?.score != null ? score - b.score : null
          return (
            <li key={k} className="flex justify-between text-[11px] text-ink-muted">
              <span>{d?.label ?? k}</span>
              <span className="font-mono tabular-nums">
                {score ?? '—'}
                {delta != null && delta !== 0 && (
                  <span className={delta > 0 ? 'text-emerald-600' : 'text-amber-700'}>
                    {' '}
                    {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
