'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ContractFlow {
  id?: string
  label: string
  steps?: string[]
}

export interface RequirementsPanelProps {
  briefing?: string
  requirements?: string[]
  constraints?: string[]
  flows?: ContractFlow[]
  className?: string
}

export function RequirementsPanel({
  briefing,
  requirements = [],
  constraints = [],
  flows = [],
  className,
}: RequirementsPanelProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className={cn('shrink-0 border-b border-hairline bg-paper text-[13px]', className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left sm:px-6"
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Problem brief · what to keep
        </span>
        {open ? (
          <ChevronUp size={14} className="text-ink-faint" />
        ) : (
          <ChevronDown size={14} className="text-ink-faint" />
        )}
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4 sm:px-6">
          {briefing && (
            <div className="rounded-lg border border-hairline bg-paper-elevated px-4 py-3">
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
                Read this first
              </p>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{briefing}</p>
            </div>
          )}

          {requirements.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Must still work after you refactor
              </p>
              <ul className="space-y-1">
                {requirements.map(r => (
                  <li key={r} className="flex gap-2 text-ink">
                    <span className="text-emerald-600">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {constraints.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Rules / limits
              </p>
              <ul className="space-y-1">
                {constraints.map(c => (
                  <li key={c} className="flex gap-2 text-ink-muted">
                    <span className="text-ink-faint">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flows.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Behavior we will check
              </p>
              <ul className="space-y-2">
                {flows.map(f => (
                  <li
                    key={f.id ?? f.label}
                    className="rounded-md border border-hairline bg-paper-elevated px-3 py-2"
                  >
                    <p className="font-medium text-ink">{f.label}</p>
                    {f.steps && f.steps.length > 0 && (
                      <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[12px] text-ink-muted">
                        {f.steps.map(s => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
