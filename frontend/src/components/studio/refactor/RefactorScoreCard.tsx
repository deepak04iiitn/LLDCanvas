'use client'

import { cn } from '@/lib/utils'

export interface RefactorScoreCardProps {
  architectureImprovement?: number
  behaviorPreservation?: number
  couplingReduction?: number
  cohesionImprovement?: number
  extensibility?: number
  complexity?: number
  metrics?: {
    before?: { classes?: number; edges?: number; godClasses?: number; cycles?: number }
    after?: { classes?: number; edges?: number; godClasses?: number; cycles?: number }
  }
  scores?: {
    before?: { overall?: number }
    after?: { overall?: number }
  }
  className?: string
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-hairline bg-paper-elevated px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-0.5 font-serif text-xl text-ink">{value}</p>
    </div>
  )
}

export function RefactorScoreCard({
  architectureImprovement = 0,
  behaviorPreservation = 0,
  couplingReduction = 0,
  cohesionImprovement = 0,
  extensibility = 0,
  complexity = 0,
  metrics,
  scores,
  className,
}: RefactorScoreCardProps) {
  const b = metrics?.before
  const a = metrics?.after
  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Architecture" value={`${architectureImprovement}%`} />
        <Stat label="Behavior" value={`${behaviorPreservation}%`} />
        <Stat label="Coupling ↓" value={couplingReduction} />
        <Stat label="Cohesion ↑" value={cohesionImprovement} />
        <Stat label="Extensibility" value={extensibility} />
        <Stat label="Complexity" value={complexity} />
      </div>
      {(b || a) && (
        <div className="overflow-hidden rounded-md border border-hairline">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-hairline/30 font-mono text-[10px] uppercase text-ink-faint">
              <tr>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">Before</th>
                <th className="px-3 py-2">After</th>
              </tr>
            </thead>
            <tbody className="text-ink-muted">
              <tr className="border-t border-hairline">
                <td className="px-3 py-1.5">Design score</td>
                <td className="px-3 py-1.5">{scores?.before?.overall ?? '—'}</td>
                <td className="px-3 py-1.5 text-ink">{scores?.after?.overall ?? '—'}</td>
              </tr>
              <tr className="border-t border-hairline">
                <td className="px-3 py-1.5">Classes</td>
                <td className="px-3 py-1.5">{b?.classes ?? '—'}</td>
                <td className="px-3 py-1.5 text-ink">{a?.classes ?? '—'}</td>
              </tr>
              <tr className="border-t border-hairline">
                <td className="px-3 py-1.5">Dependencies</td>
                <td className="px-3 py-1.5">{b?.edges ?? '—'}</td>
                <td className="px-3 py-1.5 text-ink">{a?.edges ?? '—'}</td>
              </tr>
              <tr className="border-t border-hairline">
                <td className="px-3 py-1.5">Large classes</td>
                <td className="px-3 py-1.5">{b?.godClasses ?? '—'}</td>
                <td className="px-3 py-1.5 text-ink">{a?.godClasses ?? '—'}</td>
              </tr>
              <tr className="border-t border-hairline">
                <td className="px-3 py-1.5">Cycles</td>
                <td className="px-3 py-1.5">{b?.cycles ?? '—'}</td>
                <td className="px-3 py-1.5 text-ink">{a?.cycles ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
