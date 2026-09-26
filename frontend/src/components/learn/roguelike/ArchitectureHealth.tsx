'use client'

import { cn } from '@/lib/utils'
import type { ArchitectureHealth } from '@/lib/learn-api'

interface Props {
  health: ArchitectureHealth
  previousHealth?: ArchitectureHealth
  className?: string
}

interface MetricConfig {
  key: keyof ArchitectureHealth
  label: string
  lowerIsBetter: boolean
  tooltip: string
}

const METRICS: MetricConfig[] = [
  { key: 'coupling', label: 'Coupling', lowerIsBetter: true, tooltip: 'How tightly components depend on each other. Lower is better.' },
  { key: 'cohesion', label: 'Cohesion', lowerIsBetter: false, tooltip: 'How focused each component is on a single responsibility. Higher is better.' },
  { key: 'extensibility', label: 'Extensibility', lowerIsBetter: false, tooltip: 'How easily the system can be extended with new behavior. Higher is better.' },
  { key: 'complexity', label: 'Complexity', lowerIsBetter: true, tooltip: 'Overall structural complexity. Lower is better.' },
  { key: 'reliability', label: 'Reliability', lowerIsBetter: false, tooltip: 'How resilient the system is to failures. Higher is better.' },
]

function getBarColor(value: number, lowerIsBetter: boolean): string {
  const badness = lowerIsBetter ? value : 100 - value
  if (badness < 35) return 'bg-emerald-500'
  if (badness < 65) return 'bg-amber-500'
  return 'bg-red-500'
}

function getOverallScore(h: ArchitectureHealth): number {
  return Math.round(
    ((100 - h.coupling) + h.cohesion + h.extensibility + (100 - h.complexity) + h.reliability) / 5,
  )
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500'
  if (score >= 45) return 'text-amber-500'
  return 'text-red-500'
}

export function ArchitectureHealthPanel({ health, previousHealth, className }: Props) {
  const overall = getOverallScore(health)
  const scoreColor = getScoreColor(overall)

  return (
    <div className={cn('flex flex-col gap-3 bg-paper-elevated border-l border-hairline p-4 w-64', className)}>
      {/* Header + score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Architecture</p>
          <p className="text-[11px] text-ink-muted">Health metrics</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-hairline">
          <span className={cn('font-mono text-[13px] font-bold tabular-nums', scoreColor)}>{overall}</span>
        </div>
      </div>

      {/* Metric bars */}
      <div className="space-y-2.5">
        {METRICS.map(m => {
          const value = health[m.key] as number
          const prev = previousHealth ? (previousHealth[m.key] as number) : undefined
          const delta = prev !== undefined ? value - prev : undefined
          const isGood = delta !== undefined
            ? (m.lowerIsBetter ? delta <= 0 : delta >= 0)
            : true

          return (
            <div key={m.key} title={m.tooltip}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-ink-muted">{m.label}</span>
                <div className="flex items-center gap-1">
                  {delta !== undefined && delta !== 0 && (
                    <span className={cn('font-mono text-[10px]', isGood ? 'text-emerald-500' : 'text-red-500')}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-ink tabular-nums">{value}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-hairline/50 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getBarColor(value, m.lowerIsBetter))}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Debt */}
      <div className="rounded-lg border border-hairline bg-paper px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-muted" title="Accumulated technical debt. Grows with skips and shortcuts.">
            Tech Debt
          </span>
          <span className={cn(
            'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums',
            health.debt < 20 ? 'bg-emerald-100 text-emerald-700' :
            health.debt < 50 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700',
          )}>
            {health.debt}
          </span>
        </div>
        {previousHealth && health.debt !== previousHealth.debt && (
          <p className={cn('mt-0.5 font-mono text-[10px]', health.debt > previousHealth.debt ? 'text-red-500' : 'text-emerald-500')}>
            {health.debt > previousHealth.debt ? '+' : ''}{health.debt - previousHealth.debt} this stage
          </p>
        )}
      </div>

      <p className="text-[10px] text-ink-faint leading-relaxed">
        Score = avg of inverted coupling &amp; complexity + cohesion, extensibility, reliability
      </p>
    </div>
  )
}
