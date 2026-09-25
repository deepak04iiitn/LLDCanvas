'use client'

import Link from 'next/link'
import { EvolutionJourneyMap } from '@/components/studio/evolution/EvolutionJourneyMap'
import { BeforeAfterDiff, type DiffEntryLike } from '@/components/studio/refactor/BeforeAfterDiff'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import { cn } from '@/lib/utils'

interface Dimension {
  key: string
  label: string
  ok: boolean
  detail?: string
  score?: number
}

interface VersionEntry {
  stageId: string
  dayLabel: string
  title?: string
  decision?: string
  accepted?: boolean
  diagram?: DebuggerDiagram
  score?: {
    narrative?: string
    dimensions?: Dimension[]
    diff?: DiffEntryLike[]
  }
  why?: string[]
  whyNote?: string
}

export interface EvolutionCompleteProps {
  versions: VersionEntry[]
  decisionLog: { stageId: string; why?: string[]; whyNote?: string; decision?: string }[]
  debt: { open: string[]; resolved: string[]; score: number }
  selectedIndex: number
  onSelectVersion: (i: number) => void
  className?: string
}

export function EvolutionComplete({
  versions,
  decisionLog,
  debt,
  selectedIndex,
  onSelectVersion,
  className,
}: EvolutionCompleteProps) {
  const selected = versions[selectedIndex]
  const prev = selectedIndex > 0 ? versions[selectedIndex - 1] : null
  const dims = selected?.score?.dimensions ?? []
  const diff = (selected?.score?.diff as DiffEntryLike[]) ?? []

  return (
    <div className={cn('pb-16', className)}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h2 className="font-serif text-2xl text-ink">Architecture journey complete</h2>
        <p className="mt-2 text-[13px] text-ink-muted">
          You evolved the design through {Math.max(0, versions.length - 1)} pressure stage(s). Click a
          version to inspect the UML and what changed.
        </p>
        <dl className="mt-4 flex flex-wrap gap-4 text-[13px]">
          <div>
            <dt className="font-mono text-[10px] uppercase text-ink-faint">Open debt</dt>
            <dd className="tabular-nums text-ink">{debt.open.length}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase text-ink-faint">Resolved debt</dt>
            <dd className="tabular-nums text-ink">{debt.resolved.length}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase text-ink-faint">Debt score</dt>
            <dd className="tabular-nums text-ink">{debt.score}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase text-ink-faint">Decisions logged</dt>
            <dd className="tabular-nums text-ink">{decisionLog.length}</dd>
          </div>
        </dl>
      </div>

      <EvolutionJourneyMap
        versions={versions}
        selectedIndex={selectedIndex}
        onSelect={onSelectVersion}
      />

      {selected && (
        <div className="mx-auto max-w-3xl space-y-4 px-4 sm:px-6">
          {selected.score?.narrative && (
            <p className="rounded-lg border border-hairline bg-paper-elevated px-4 py-3 text-[13px] text-ink">
              {selected.score.narrative}
            </p>
          )}
          {dims.length > 0 && (
            <ul className="space-y-2">
              {dims.map(d => (
                <li
                  key={d.key}
                  className="flex items-start justify-between gap-3 rounded-md border border-hairline px-3 py-2 text-[13px]"
                >
                  <div>
                    <p className="font-medium text-ink">{d.label}</p>
                    {d.detail && <p className="text-[12px] text-ink-muted">{d.detail}</p>}
                  </div>
                  <span className={d.ok ? 'text-emerald-600' : 'text-amber-700'}>
                    {d.ok ? '✓' : '!'}
                    {typeof d.score === 'number' ? ` ${d.score}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {diff.length > 0 && prev && (
            <BeforeAfterDiff diff={diff} behaviorChecks={[]} constraintChecks={[]} />
          )}
        </div>
      )}

      {selected?.diagram && (
        <div className="mt-6">
          <p className="mb-2 px-4 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint sm:px-6">
            V{selectedIndex} diagram
          </p>
          <div className="relative h-[50vh] min-h-[360px] border-y border-hairline">
            <DebuggerCanvas
              diagram={selected.diagram}
              readOnly
              selectedId={null}
              onSelect={() => {}}
              className="absolute inset-0"
              hideEditChrome
            />
          </div>
        </div>
      )}

      {decisionLog.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Design decision log
          </p>
          <ul className="space-y-2">
            {decisionLog.map((d, i) => (
              <li key={i} className="rounded-md border border-hairline px-3 py-2 text-[13px]">
                <p className="font-medium text-ink">{d.stageId}</p>
                <p className="text-ink-muted">
                  {(d.why ?? []).join(' · ') || '—'}
                  {d.whyNote ? ` — ${d.whyNote}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <Link
          href="/design-studio/evolution"
          className="inline-flex rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white"
        >
          Back to tracks
        </Link>
      </div>
    </div>
  )
}
