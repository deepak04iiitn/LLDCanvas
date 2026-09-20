'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BlastRadiusView } from '@/components/studio/change/BlastRadiusView'

export interface ChangeCompleteProps {
  result: Record<string, unknown>
  elapsedSec?: number
  nameById?: Record<string, string>
  className?: string
}

function fmtTime(sec?: number) {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function ChangeComplete({ result, elapsedSec, nameById, className }: ChangeCompleteProps) {
  const accepted = Boolean(result.accepted)
  const dimensions = Array.isArray(result.dimensions)
    ? (result.dimensions as { key: string; label: string; ok: boolean; detail?: string; score?: number }[])
    : []
  const efficiency = (result.efficiency ?? {}) as {
    requiredChanges?: number
    yourChanges?: number
    unnecessaryChanges?: number
    unnecessaryNames?: string[]
  }
  const predict = (result.predictReport ?? {}) as {
    predictedCount?: number
    actualCount?: number
    accuracyPct?: number
  }
  const blast = (result.blastRadius ?? {}) as {
    directIds?: string[]
    indirectIds?: string[]
    untouchedIds?: string[]
    directCount?: number
    indirectCount?: number
    untouchedCount?: number
  }

  return (
    <div className={cn('mx-auto max-w-lg px-6 py-10', className)}>
      <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Change {accepted ? 'accepted' : 'reviewed'}
      </p>
      <h2 className="mt-1 text-center font-serif text-2xl text-ink">
        {accepted ? 'Requirement met' : 'Needs another pass'}
      </h2>
      <p className="mt-2 text-center text-[13px] text-ink-muted">{String(result.narrative ?? '')}</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-hairline">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-paper border-b border-hairline">
            <tr>
              <th className="px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Dimension
              </th>
              <th className="px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map(d => (
              <tr key={d.key} className="border-b border-hairline last:border-0">
                <td className="px-3 py-2 text-ink">{d.label}</td>
                <td className={cn('px-3 py-2', d.ok ? 'text-emerald-700' : 'text-rose-700')}>
                  {d.ok ? '✓' : '✗'}
                  {d.score != null ? ` ${d.score}%` : ''}
                  {d.detail ? (
                    <span className="mt-0.5 block text-[11px] text-ink-muted">{d.detail}</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-hairline p-3 text-center">
        <div>
          <p className="font-serif text-xl text-ink">{efficiency.requiredChanges ?? '—'}</p>
          <p className="text-[11px] text-ink-muted">Hinted touches</p>
        </div>
        <div>
          <p className="font-serif text-xl text-ink">{efficiency.yourChanges ?? '—'}</p>
          <p className="text-[11px] text-ink-muted">Your edits</p>
        </div>
        <div>
          <p className="font-serif text-xl text-ink">{efficiency.unnecessaryChanges ?? 0}</p>
          <p className="text-[11px] text-ink-muted">Unnecessary</p>
        </div>
      </div>

      {(efficiency.unnecessaryNames?.length ?? 0) > 0 && (
        <p className="mt-2 text-center text-[12px] text-amber-800">
          Possibly unnecessary: {efficiency.unnecessaryNames!.join(', ')}
        </p>
      )}

      <div className="mt-4">
        <BlastRadiusView {...blast} nameById={nameById} />
      </div>

      <p className="mt-4 text-center font-mono text-[11px] text-ink-faint">
        Predicted {predict.predictedCount ?? 0} · Actual {predict.actualCount ?? 0}
        {predict.accuracyPct != null ? ` · Accuracy ${predict.accuracyPct}%` : ''} · Time{' '}
        {fmtTime(elapsedSec)}
      </p>

      <div className="mt-8 flex justify-center">
        <Link
          href="/design-studio/change"
          className="rounded-lg bg-brand px-4 py-2.5 text-center text-[13px] font-medium text-white"
        >
          Next change request
        </Link>
      </div>
    </div>
  )
}
