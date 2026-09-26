'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ISSUE_TYPE_INFO } from '@/components/studio/debugger/IssueTypeTooltip'
import type { DebuggerMark } from '@/lib/studio-api'

export interface DebugCompleteProps {
  found?: number
  total?: number
  investigationPct?: number
  diagnosisPct?: number
  refactoringPct?: number
  elapsedSec?: number
  hintsUsed?: number
  /** All graded marks from the session — used to suggest what to study next */
  gradedMarks?: DebuggerMark[]
  className?: string
}

function fmtTime(sec?: number) {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

/** Deduplicate and collect Plannr topics for marks that need more study */
function getPracticeLinks(
  gradedMarks: DebuggerMark[],
  found: number,
  total: number,
): { label: string; plannrTopic: string }[] {
  const topics = new Map<string, string>() // topic → representative label

  // Marks the user made that were wrong (false positives)
  for (const m of gradedMarks) {
    if (m.verdict === 'miss' || m.verdict === 'partial') {
      const info = ISSUE_TYPE_INFO[m.category]
      if (info && !topics.has(info.plannrTopic)) {
        topics.set(info.plannrTopic, m.category)
      }
    }
  }

  // If they missed some issues entirely, surface the generic SOLID topics
  if (found < total && topics.size < 2) {
    const fallbacks: [string, string][] = [
      ['Design for Change', 'DIP / OCP'],
      ['Think in Responsibilities', 'SRP / God Objects'],
      ['Speak OOP', 'Abstractions & Interfaces'],
    ]
    for (const [topic, label] of fallbacks) {
      if (!topics.has(topic)) {
        topics.set(topic, label)
        if (topics.size >= 3) break
      }
    }
  }

  return Array.from(topics.entries())
    .slice(0, 3)
    .map(([plannrTopic, label]) => ({ label, plannrTopic }))
}

export function DebugComplete({
  found = 0,
  total = 0,
  investigationPct = 0,
  diagnosisPct = 0,
  refactoringPct = 0,
  elapsedSec,
  hintsUsed = 0,
  gradedMarks = [],
  className,
}: DebugCompleteProps) {
  const practiceLinks = getPracticeLinks(gradedMarks, found, total)

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

      {/* ── What to Practice Next ── */}
      {practiceLinks.length > 0 && (
        <div className="mt-8 w-full text-left">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            What to Practice Next
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Based on your session, these Plannr topics will help reinforce the concepts.
          </p>
          <ul className="mt-3 space-y-2">
            {practiceLinks.map(({ label, plannrTopic }) => (
              <li key={plannrTopic}>
                <Link
                  href="/plannr/roadmap"
                  className="flex items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-4 py-3 text-[13px] transition-colors hover:border-brand/40 hover:bg-brand-tint/30"
                >
                  <span>
                    <span className="text-[11px] text-ink-faint">{label} · </span>
                    <span className="font-medium text-ink">
                      Read &ldquo;{plannrTopic}&rdquo; in your Plannr
                    </span>
                  </span>
                  <span className="ml-2 shrink-0 text-brand" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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
