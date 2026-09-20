'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface DebugCompleteProps {
  found?: number
  total?: number
  investigationPct?: number
  diagnosisPct?: number
  refactoringPct?: number
  elapsedSec?: number
  hintsUsed?: number
  className?: string
}

function fmtTime(sec?: number) {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function DebugComplete({
  found = 0,
  total = 0,
  investigationPct = 0,
  diagnosisPct = 0,
  refactoringPct = 0,
  elapsedSec,
  hintsUsed = 0,
  className,
}: DebugCompleteProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center',
        className,
      )}
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        Debugging Complete
      </p>
      <h2 className="mt-3 font-serif text-3xl font-medium text-ink">Nice work</h2>
      <p className="mt-2 text-[15px] text-ink-muted">
        {found}/{total || '—'} issues identified · architecture verified
      </p>

      <dl className="mt-8 w-full space-y-2 rounded-xl border border-hairline bg-paper-elevated p-5 text-left">
        <Row label="Investigation" value={`${investigationPct}%`} />
        <Row label="Diagnosis" value={`${diagnosisPct}%`} />
        <Row label="Refactoring" value={`${refactoringPct}%`} />
        <Row label="Time" value={fmtTime(elapsedSec)} />
        <Row label="Hints used" value={String(hintsUsed)} />
      </dl>

      <div className="mt-8 flex w-full flex-col gap-2">
        <Link
          href="/design-studio/debugger"
          className="rounded-md bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-foreground hover:bg-brand-hover"
        >
          Try another challenge
        </Link>
        <button
          type="button"
          disabled
          title="Coming when Refactoring Mode is rebuilt"
          className="cursor-not-allowed rounded-md border border-hairline px-4 py-2.5 text-[13px] text-ink-faint"
        >
          Continue to Refactoring Mode →
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-mono tabular-nums text-ink">{value}</dd>
    </div>
  )
}
