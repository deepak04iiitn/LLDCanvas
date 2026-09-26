'use client'

import { cn } from '@/lib/utils'
import type { Stage, StageResult, RunCheckpoint } from '@/lib/learn-api'

interface Props {
  stages: Stage[]
  currentOrder: number
  completedStages: StageResult[]
  checkpoints: RunCheckpoint[]
}

const EVENT_ICONS: Record<string, string> = {
  requirement: '🆕',
  scale: '📈',
  failure: '🔥',
  business: '🏢',
  team: '👥',
  time: '⏱️',
  constraint: '🔒',
  boss: '🐉',
}

export function RunMap({ stages, currentOrder, completedStages, checkpoints }: Props) {
  const completedMap = new Map<number, StageResult>()
  for (const sr of completedStages) {
    completedMap.set(sr.stageOrder, sr)
  }
  const checkpointOrders = new Set(checkpoints.map(c => c.stageOrder))

  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-hairline bg-paper-elevated overflow-y-auto">
      <div className="px-3 py-2 border-b border-hairline">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Run Map</p>
      </div>
      <div className="flex flex-col py-2 relative">
        {/* Vertical connector line */}
        <div className="absolute left-[1.625rem] top-6 bottom-6 w-px bg-hairline z-0" />

        {stages.map((stage, idx) => {
          const result = completedMap.get(stage.order)
          const isCompleted = !!result
          const isCurrent = stage.order === currentOrder
          const isUpcoming = stage.order > currentOrder
          const isBoss = stage.isBoss
          const isCheckpoint = stage.isCheckpoint || checkpointOrders.has(stage.order)
          const icon = EVENT_ICONS[stage.event.type] ?? '❓'

          return (
            <div key={stage.id} className="relative flex items-start gap-2 px-3 py-1.5">
              {/* Node */}
              <div className="relative z-10 mt-0.5 flex-shrink-0">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[13px] transition-all',
                  isCurrent && 'border-brand bg-brand/10 animate-pulse ring-2 ring-brand/30',
                  isCompleted && result?.passed && 'border-emerald-500 bg-emerald-50',
                  isCompleted && !result?.passed && 'border-red-500 bg-red-50',
                  isUpcoming && !isBoss && 'border-hairline bg-paper text-ink-faint',
                  isBoss && !isCompleted && !isCurrent && 'border-red-400 bg-red-50',
                  isBoss && isCurrent && 'border-red-500 bg-red-100 animate-pulse',
                )}>
                  {isCompleted ? (result?.passed ? '✓' : '✗') : icon}
                </div>
                {isCheckpoint && (
                  <span className="absolute -right-1 -top-1 text-[9px]">💾</span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={cn(
                  'truncate text-[11px] leading-tight',
                  isCurrent && 'font-semibold text-ink',
                  isCompleted && 'text-ink-muted',
                  isUpcoming && 'text-ink-faint',
                  isBoss && 'text-red-600 font-medium',
                )}>
                  {isBoss && <span className="mr-0.5">🐉</span>}
                  {stage.title}
                </p>
                <p className="text-[10px] text-ink-faint capitalize">{stage.event.type}</p>
                {isCompleted && (
                  <p className={cn('text-[10px] font-mono', result?.passed ? 'text-emerald-600' : 'text-red-500')}>
                    {result?.passed ? 'Passed' : 'Failed'}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
