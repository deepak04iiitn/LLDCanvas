'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { StageResult, ArchitectureHealth } from '@/lib/learn-api'

interface Props {
  stages: StageResult[]
  initialHealth: ArchitectureHealth
}

const EVENT_ICONS: Record<string, string> = {
  requirement: '🆕', scale: '📈', failure: '🔥', business: '🏢',
  team: '👥', time: '⏱️', constraint: '🔒', boss: '🐉',
}

const HEALTH_KEYS: (keyof ArchitectureHealth)[] = ['coupling', 'cohesion', 'extensibility', 'complexity', 'reliability']
const HEALTH_LABELS: Record<keyof ArchitectureHealth, string> = {
  coupling: 'Cpl', cohesion: 'Coh', extensibility: 'Ext', complexity: 'Cmx', reliability: 'Rel', debt: 'Dbt',
}

function MiniBar({ value, lowerIsBetter }: { value: number; lowerIsBetter: boolean }) {
  const badness = lowerIsBetter ? value : 100 - value
  const color = badness < 35 ? 'bg-emerald-500' : badness < 65 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="h-1 w-full rounded-full bg-hairline/50">
      <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
    </div>
  )
}

export function ArchitectureJourney({ stages, initialHealth }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  const healthHistory: ArchitectureHealth[] = [initialHealth, ...stages.map(s => s.healthAfter)]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">Architecture Journey</h3>
        <p className="text-[11px] text-ink-muted">Click any stage to expand</p>
      </div>

      {/* Sparkline legend */}
      <div className="flex items-center gap-3">
        {HEALTH_KEYS.map(k => (
          <span key={k} className="text-[10px] text-ink-faint font-mono">{HEALTH_LABELS[k]}</span>
        ))}
      </div>

      {/* Horizontal scrollable timeline */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {/* Initial state */}
          <div className="w-28 shrink-0 rounded-xl border border-hairline bg-paper-elevated p-2">
            <p className="font-mono text-[10px] uppercase text-ink-faint">Initial</p>
            <div className="mt-2 space-y-1">
              {HEALTH_KEYS.map(k => (
                <div key={k}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-ink-faint font-mono">{HEALTH_LABELS[k]}</span>
                    <span className="text-[9px] text-ink-faint font-mono">{initialHealth[k]}</span>
                  </div>
                  <MiniBar value={initialHealth[k] as number} lowerIsBetter={k === 'coupling' || k === 'complexity'} />
                </div>
              ))}
            </div>
          </div>

          {/* Stage columns */}
          {stages.map((stage, idx) => {
            const prev = healthHistory[idx]
            const curr = stage.healthAfter
            const isSelected = selected === idx
            const icon = EVENT_ICONS[stage.eventType] ?? '❓'

            return (
              <button
                key={stage.stageId}
                onClick={() => setSelected(isSelected ? null : idx)}
                className={cn(
                  'w-36 shrink-0 rounded-xl border text-left p-2 transition-all hover:shadow-md',
                  stage.passed
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-red-200 bg-red-50/50',
                  isSelected && 'ring-2 ring-brand shadow-md',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-ink-faint">#{stage.stageOrder}</span>
                  <span className="text-[12px]">{icon}</span>
                  <span className={cn('text-[10px] font-mono', stage.passed ? 'text-emerald-600' : 'text-red-500')}>
                    {stage.passed ? '✓' : '✗'}
                  </span>
                </div>

                <p className="text-[11px] text-ink font-medium leading-tight truncate mb-2">{stage.stageTitle}</p>

                {/* Mini health bars */}
                <div className="space-y-1">
                  {HEALTH_KEYS.map(k => {
                    const delta = (curr[k] as number) - (prev[k] as number)
                    const isLower = k === 'coupling' || k === 'complexity'
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[9px] text-ink-faint font-mono">{HEALTH_LABELS[k]}</span>
                          <span className={cn(
                            'text-[9px] font-mono',
                            delta === 0 ? 'text-ink-faint' :
                            (isLower ? delta < 0 : delta > 0) ? 'text-emerald-600' : 'text-red-500',
                          )}>
                            {delta > 0 ? '+' : ''}{delta !== 0 ? delta : curr[k]}
                          </span>
                        </div>
                        <MiniBar value={curr[k] as number} lowerIsBetter={isLower} />
                      </div>
                    )
                  })}
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <div className="mt-2 border-t border-hairline pt-2 space-y-1">
                    {stage.decisionLabel && (
                      <p className="text-[10px] text-ink-muted">
                        <span className="font-mono text-ink-faint">Decision: </span>
                        {stage.decisionLabel}
                      </p>
                    )}
                    {stage.architectureNotes && (
                      <p className="text-[10px] text-ink-muted">
                        <span className="font-mono text-ink-faint">Notes: </span>
                        {stage.architectureNotes}
                      </p>
                    )}
                    <p className="text-[10px] text-ink-faint">
                      Debt: {curr.debt}
                    </p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
