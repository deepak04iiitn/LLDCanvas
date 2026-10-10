'use client'

import { cn } from '@/lib/utils'
import type { DebuggerStage } from '@/lib/studio-api'

const STEPS: { id: DebuggerStage; label: string }[] = [
  { id: 'detect', label: 'Detect' },
  { id: 'diagnose', label: 'Diagnose' },
  { id: 'repair', label: 'Repair' },
  { id: 'verify', label: 'Verify' },
]

const ORDER: DebuggerStage[] = ['detect', 'diagnose', 'repair', 'verify', 'complete']

export interface StageBannerProps {
  stage: DebuggerStage | string
  className?: string
}

function stageIndex(stage: string) {
  const i = ORDER.indexOf(stage as DebuggerStage)
  return i >= 0 ? i : 0
}

export function StageBanner({ stage, className }: StageBannerProps) {
  const current = stageIndex(stage)

  return (
    <nav
      aria-label="Debugger stages"
      className={cn(
        'flex shrink-0 items-center gap-1 border-b border-hairline bg-paper px-4 py-2 sm:px-6',
        className,
      )}
    >
      {STEPS.map((step, i) => {
        const active = i === current || (stage === 'complete' && step.id === 'verify')
        const done = i < current || stage === 'complete'
        return (
          <div key={step.id} className="flex items-center gap-1">
            {i > 0 && <span className="mx-1 text-ink-faint">→</span>}
            <span
              className={cn(
                'rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide',
                active && 'bg-brand-tint text-brand',
                done && !active && 'text-ink-muted',
                !done && !active && 'text-ink-faint',
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
