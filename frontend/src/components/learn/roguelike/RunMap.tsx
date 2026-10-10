'use client'

import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stage, StageResult, RunCheckpoint } from '@/lib/learn-api'

interface Props {
  stages: Stage[]
  currentOrder: number
  completedStages: StageResult[]
  checkpoints: RunCheckpoint[]
}

export function RunMap({ stages, currentOrder, completedStages, checkpoints }: Props) {
  const completedMap = new Map<number, StageResult>()
  for (const sr of completedStages) {
    completedMap.set(sr.stageOrder, sr)
  }
  const checkpointOrders = new Set(checkpoints.map(c => c.stageOrder))

  return (
    <div className="flex h-12 shrink-0 items-center border-b border-hairline bg-paper-elevated px-4">
      {/* Slim horizontal progress track */}
      <div className="relative flex flex-1 items-center">
        {/* Background connector line */}
        <div className="absolute left-3.5 right-3.5 top-1/2 h-px -translate-y-1/2 bg-hairline" />

        {stages.map((stage, idx) => {
          const result      = completedMap.get(stage.order)
          const isCompleted = !!result
          const isCurrent   = stage.order === currentOrder
          const isUpcoming  = stage.order > currentOrder
          const isBoss      = stage.isBoss
          const isCheckpoint = stage.isCheckpoint || checkpointOrders.has(stage.order)
          const isPassed    = isCompleted && result?.passed

          return (
            <div
              key={stage.id}
              className="relative flex flex-1 flex-col items-center"
              title={stage.title}
            >
              {/* Stage dot */}
              <div
                className={cn(
                  'relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all text-[11px] font-bold bg-paper',
                  isCurrent && !isBoss && 'border-brand bg-brand/10 ring-2 ring-brand/30 ring-offset-1',
                  isCurrent && isBoss  && 'border-red-500 bg-red-50 ring-2 ring-red-400/30 ring-offset-1',
                  isPassed             && 'border-emerald-500 bg-emerald-50',
                  isCompleted && !isPassed && 'border-red-400 bg-red-50',
                  isUpcoming && !isBoss  && 'border-hairline bg-paper text-ink-faint',
                  isUpcoming && isBoss   && 'border-red-300 bg-red-50/60',
                  !isCurrent && !isCompleted && !isUpcoming && 'border-hairline',
                )}
              >
                {isCompleted ? (
                  isPassed
                    ? <CheckCircle2 size={13} className="text-emerald-600" />
                    : <span className="text-red-500 font-bold leading-none">✗</span>
                ) : (
                  <span className={cn(
                    'font-mono text-[10px]',
                    isCurrent  ? (isBoss ? 'text-red-600 font-bold' : 'text-brand font-bold') : 'text-ink-faint',
                  )}>
                    {stage.order}
                  </span>
                )}

                {/* Checkpoint pip */}
                {isCheckpoint && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-paper" />
                )}
              </div>

              {/* Stage label — only for current */}
              {isCurrent && (
                <span className="absolute top-full mt-0.5 whitespace-nowrap font-mono text-[9px] text-brand truncate max-w-[80px]">
                  {stage.title.length > 10 ? stage.title.slice(0, 10) + '…' : stage.title}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
