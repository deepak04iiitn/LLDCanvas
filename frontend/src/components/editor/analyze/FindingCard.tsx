'use client'

import { cn } from '@/lib/utils'
import type { RuleFinding } from '@/lib/design-analysis'

const SEV = {
  critical: 'bg-red-500/15 text-red-700 border-red-200',
  major: 'bg-amber-500/15 text-amber-800 border-amber-200',
  minor: 'bg-sky-500/10 text-sky-800 border-sky-200',
  info: 'bg-paper-elevated text-ink-muted border-hairline',
}

const STATUS = {
  fail: 'Fail',
  warn: 'Warn',
  pass: 'Pass',
  na: 'N/A',
}

export function FindingCard({
  finding,
  onFocus,
}: {
  finding: RuleFinding
  onFocus?: (elementId: string) => void
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider', SEV[finding.severity])}>
          {finding.severity}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {STATUS[finding.status]}
          {finding.scoreImpact > 0 ? ` · −${finding.scoreImpact}` : ''}
        </span>
      </div>
      <p className="text-[14px] font-medium text-ink">{finding.title}</p>
      <p className="text-[13px] text-ink-muted">{finding.message}</p>
      <p className="text-[12px] text-ink-faint">
        <span className="font-medium text-ink-muted">Why: </span>
        {finding.why}
      </p>
      {finding.howToFix && (
        <p className="text-[12px] text-ink">
          <span className="font-medium">Fix: </span>
          {finding.howToFix}
        </p>
      )}
      {finding.affectedElements.length > 0 && onFocus && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {finding.affectedElements.map(el => (
            <button
              key={`${el.kind}-${el.id}`}
              type="button"
              onClick={() => onFocus(el.id)}
              className="rounded-lg border border-hairline bg-paper px-2 py-1 text-[11px] font-medium text-brand hover:border-brand/40"
            >
              View {el.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
