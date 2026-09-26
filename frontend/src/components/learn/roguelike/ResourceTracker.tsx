'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RunResources, RunCheckpoint } from '@/lib/learn-api'

interface Props {
  resources: RunResources
  scenarioTitle: string
  mode: string
  stagesCompleted: number
  stagesTotal: number
  checkpoints: RunCheckpoint[]
  currentOrder: number
  onRestoreCheckpoint: (order: number) => void
}

const MODE_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  interview: 'bg-blue-100 text-blue-700',
  survival: 'bg-amber-100 text-amber-700',
  hardcore: 'bg-red-100 text-red-700',
  endless: 'bg-purple-100 text-purple-700',
}

export function ResourceTracker({
  resources,
  scenarioTitle,
  mode,
  stagesCompleted,
  stagesTotal,
  checkpoints,
  currentOrder,
  onRestoreCheckpoint,
}: Props) {
  const [checkpointOpen, setCheckpointOpen] = useState(false)

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-hairline bg-paper-elevated px-4 py-2 text-[12px]">
      {/* Left: scenario + mode */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <span className="font-medium text-ink truncate max-w-[140px]">{scenarioTitle}</span>
        <span className={cn('rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase font-medium', MODE_COLORS[mode] ?? 'bg-hairline text-ink-muted')}>
          {mode}
        </span>
      </div>

      <div className="mx-1 h-4 w-px bg-hairline shrink-0" />

      {/* Resources */}
      <div className="flex items-center gap-2 flex-wrap">
        <ResourcePill
          icon="⏰"
          label={`${resources.engineeringHoursRemaining}h`}
          warn={resources.engineeringHoursRemaining < 8}
          danger={resources.engineeringHoursRemaining < 4}
          title="Engineering hours remaining"
        />
        <ResourcePill
          icon="🧰"
          label={`Cmplx ${resources.complexityBudgetRemaining}`}
          warn={resources.complexityBudgetRemaining < 3}
          danger={resources.complexityBudgetRemaining < 2}
          title="Complexity budget remaining"
        />
        <ResourcePill
          icon="👥"
          label={`Team ${resources.teamSize}`}
          title="Team size"
        />
        <ResourcePill
          icon="🏗️"
          label={`Infra ${resources.infraBudgetRemaining}`}
          title="Infrastructure budget remaining"
        />
        <ResourcePill
          icon="🔄"
          label={`${resources.changesRemaining} chg`}
          warn={resources.changesRemaining < 3}
          danger={resources.changesRemaining < 1}
          title="Structural changes remaining"
        />
      </div>

      <div className="flex-1" />

      {/* Stage progress */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-ink-muted">Stage</span>
        <span className="font-mono font-medium text-ink tabular-nums">{currentOrder}/{stagesTotal}</span>
        <div className="flex items-center gap-0.5 ml-1">
          {Array.from({ length: Math.min(stagesTotal, 12) }, (_, i) => {
            const order = i + 1
            const isCompleted = order < currentOrder
            const isCurrent = order === currentOrder
            return (
              <div
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all',
                  isCurrent ? 'bg-brand animate-pulse scale-125' :
                  isCompleted ? 'bg-emerald-500' :
                  'bg-hairline',
                )}
              />
            )
          })}
          {stagesTotal > 12 && <span className="text-ink-faint ml-0.5">+{stagesTotal - 12}</span>}
        </div>
      </div>

      {/* Checkpoint restore */}
      {checkpoints.length > 0 && (
        <div className="relative shrink-0">
          <button
            onClick={() => setCheckpointOpen(v => !v)}
            className="flex items-center gap-1 rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] text-ink-muted hover:text-ink transition-colors"
          >
            💾 Restore
            <ChevronDown size={12} className={cn('transition-transform', checkpointOpen && 'rotate-180')} />
          </button>
          {checkpointOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border border-hairline bg-paper-elevated shadow-lg py-1 min-w-[180px]">
              {checkpoints.map(cp => (
                <button
                  key={cp.stageOrder}
                  onClick={() => {
                    onRestoreCheckpoint(cp.stageOrder)
                    setCheckpointOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] text-ink-muted hover:bg-hairline/40 hover:text-ink transition-colors"
                >
                  Restore from Stage {cp.stageOrder}
                  <span className="block text-[10px] text-ink-faint">
                    Debt: {cp.health.debt}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResourcePill({
  icon,
  label,
  warn,
  danger,
  title,
}: {
  icon: string
  label: string
  warn?: boolean
  danger?: boolean
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] border border-hairline',
        danger ? 'border-red-300 bg-red-50 text-red-700' :
        warn ? 'border-amber-300 bg-amber-50 text-amber-700' :
        'bg-paper text-ink-muted',
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
}
