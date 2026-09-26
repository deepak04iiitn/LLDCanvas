'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { RefactorScoreCard, type RefactorScoreCardProps } from '@/components/studio/refactor/RefactorScoreCard'
import { CompletionNext } from '@/components/studio/shell/CompletionNext'

export interface RefactorCompleteProps {
  result: Record<string, unknown>
  elapsedSec?: number
  /** Slug of the completed pack — used for next-problem recommendation */
  packSlug?: string
  className?: string
}

function fmtTime(sec?: number) {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function RefactorComplete({ result, elapsedSec, packSlug = '', className }: RefactorCompleteProps) {
  const accepted = Boolean(result.accepted)
  const diff = Array.isArray(result.diff) ? result.diff : []

  return (
    <div className={cn('mx-auto max-w-lg px-6 py-10', className)}>
      <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Refactoring {accepted ? 'complete' : 'reviewed'}
      </p>
      <h2 className="mt-1 text-center font-serif text-2xl text-ink">
        {accepted ? 'Behavior preserved' : 'Needs another pass'}
      </h2>
      <p className="mt-2 text-center text-[13px] text-ink-muted">
        {String(result.narrative ?? '')}
      </p>

      <div className="mt-6">
        <RefactorScoreCard
          architectureImprovement={Number(result.architectureImprovement ?? 0)}
          behaviorPreservation={Number(result.behaviorPreservation ?? 0)}
          couplingReduction={Number(result.couplingReduction ?? 0)}
          cohesionImprovement={Number(result.cohesionImprovement ?? 0)}
          extensibility={Number(result.extensibility ?? 0)}
          complexity={Number(result.complexity ?? 0)}
          metrics={result.metrics as RefactorScoreCardProps['metrics']}
          scores={result.scores as RefactorScoreCardProps['scores']}
        />
      </div>

      <p className="mt-4 text-center font-mono text-[11px] text-ink-faint">
        Changes: {diff.length} · Time: {fmtTime(elapsedSec)}
      </p>

      <div className="mt-8 border-t border-hairline pt-6">
        <CompletionNext
          packType="refactor"
          currentSlug={packSlug}
          libraryHref="/design-studio/refactor/problems"
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/design-studio/refactor"
          className="rounded-lg bg-brand px-4 py-2.5 text-center text-[13px] font-medium text-white"
        >
          Next refactoring
        </Link>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="cursor-not-allowed rounded-lg border border-hairline px-4 py-2.5 text-[13px] text-ink-faint"
        >
          Explore alternative (soon)
        </button>
      </div>
    </div>
  )
}
