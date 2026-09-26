'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Loader2, PencilRuler } from 'lucide-react'
import { learnApi, type DiagramScoreRecord } from '@/lib/learn-api'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Dimension = 'coupling' | 'cohesion' | 'complexity' | 'extensibility' | 'solid'

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: 'coupling',      label: 'Coupling' },
  { key: 'cohesion',      label: 'Cohesion' },
  { key: 'complexity',    label: 'Complexity' },
  { key: 'extensibility', label: 'Extensibility' },
  { key: 'solid',         label: 'SOLID' },
]

const IMPROVEMENT_ACTIONS: {
  dimension: Dimension
  label: string
  action: string
  href: string
}[] = [
  { dimension: 'coupling',      label: 'Coupling',      action: 'Try Refactoring Mode challenges',          href: '/design-studio/refactor' },
  { dimension: 'cohesion',      label: 'Cohesion',      action: 'Study Responsibility Assignment in Plannr', href: '/plannr' },
  { dimension: 'complexity',    label: 'Complexity',    action: 'Try Architecture Budget challenges',        href: '/design-studio/budget' },
  { dimension: 'extensibility', label: 'Extensibility', action: 'Study Design Patterns in Plannr',          href: '/plannr' },
  { dimension: 'solid',         label: 'SOLID',         action: 'Try Design Debugger challenges',           href: '/design-studio/debugger' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string
  value: string | number
  sub?: string
  positive?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-hairline bg-paper-elevated p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <p className={cn('text-3xl font-bold', positive ? 'text-brand' : 'text-ink')}>
        {value}
      </p>
      {sub && <p className="text-[13px] text-ink-muted">{sub}</p>}
    </div>
  )
}

function MiniBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="w-20 shrink-0 text-[10px] text-ink-faint truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--color-hairline)/0.6)] overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] text-ink-muted">{score}</span>
    </div>
  )
}

function HistoryItem({ record }: { record: DiagramScoreRecord }) {
  const overall = record.scores.overall
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-3 transition-shadow hover:shadow-sm sm:flex-row sm:items-start">
      {/* Left: title + date */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">
          {record.diagramTitle || 'Untitled'}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-faint">{formatDate(record.timestamp)}</p>
      </div>

      {/* Overall badge */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[12px] font-semibold',
            overall >= 70
              ? 'border-brand/30 bg-brand-tint text-brand'
              : 'border-hairline bg-paper text-ink-muted',
          )}
        >
          {overall}
        </span>
      </div>

      {/* Mini bars */}
      <div className="flex flex-col gap-1 mt-1 sm:mt-0 sm:w-52">
        {DIMENSIONS.map(d => (
          <MiniBar key={d.key} score={record.scores[d.key]} label={d.label} />
        ))}
      </div>
    </div>
  )
}

function ImprovementActions({
  weakest,
  open,
  onToggle,
}: {
  weakest: Dimension | null
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3.5"
      >
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Improvement Actions
        </span>
        {open ? (
          <ChevronUp size={14} className="text-ink-faint" />
        ) : (
          <ChevronDown size={14} className="text-ink-faint" />
        )}
      </button>
      {open && (
        <ul className="divide-y divide-hairline border-t border-hairline px-5 pb-3">
          {IMPROVEMENT_ACTIONS.map(item => (
            <li key={item.dimension} className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  'w-24 shrink-0 text-[12px] font-medium',
                  weakest === item.dimension ? 'text-brand' : 'text-ink-muted',
                )}
              >
                {item.label}
                {weakest === item.dimension && (
                  <span className="ml-1 font-mono text-[9px] text-brand">↓</span>
                )}
              </span>
              <Link
                href={item.href}
                className="text-[13px] text-brand hover:underline"
              >
                {item.action}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ScoreHistoryPage() {
  const [records, setRecords] = useState<DiagramScoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionsOpen, setActionsOpen] = useState(false)

  useEffect(() => {
    learnApi.score
      .history()
      .then(res => setRecords(res.records))
      .catch(err => setError(err.message ?? 'Failed to load score history'))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived stats ────────────────────────────────────────────────────────────

  const last7Days = records.filter(r => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return new Date(r.timestamp) >= cutoff
  })

  const avgOverall = avg(last7Days.map(r => r.scores.overall))

  const last30 = records.slice(0, 30)
  const half = Math.floor(last30.length / 2)
  const older = last30.slice(half)
  const newer = last30.slice(0, half)

  let mostImproved: Dimension | null = null
  let mostImprovedGain = -Infinity
  let weakest: Dimension | null = null
  let weakestAvg = Infinity

  if (records.length > 0) {
    for (const d of DIMENSIONS) {
      const olderAvg = avg(older.map(r => r.scores[d.key]))
      const newerAvg = avg(newer.map(r => r.scores[d.key]))
      const gain = newerAvg - olderAvg
      if (gain > mostImprovedGain) {
        mostImprovedGain = gain
        mostImproved = d.key
      }
      const overallAvg = avg(records.map(r => r.scores[d.key]))
      if (overallAvg < weakestAvg) {
        weakestAvg = overallAvg
        weakest = d.key
      }
    }
  }

  const mostImprovedLabel =
    mostImproved && mostImprovedGain > 0
      ? `${DIMENSIONS.find(d => d.key === mostImproved)!.label} (+${mostImprovedGain})`
      : '—'

  const weakestLabel = weakest
    ? `${DIMENSIONS.find(d => d.key === weakest)!.label} (avg ${weakestAvg})`
    : '—'

  return (
    <CategoryShell
      title="Design Score"
      subtitle="Track how your diagram quality improves over time"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="h-full overflow-y-auto bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Avg Overall (7 days)"
              value={last7Days.length > 0 ? avgOverall : '—'}
              sub={
                last7Days.length > 0
                  ? `${last7Days.length} diagram${last7Days.length !== 1 ? 's' : ''}`
                  : 'No scores yet'
              }
              positive={last7Days.length > 0 && avgOverall >= 70}
            />
            <SummaryCard
              label="Most Improved"
              value={mostImprovedLabel}
              sub="Last 30 scores compared"
            />
            <SummaryCard
              label="Weakest Dimension"
              value={weakestLabel}
              sub="Lowest average, all time"
            />
          </div>

          {/* Improvement actions (collapsible) */}
          <div className="mb-6">
            <ImprovementActions
              weakest={weakest}
              open={actionsOpen}
              onToggle={() => setActionsOpen(o => !o)}
            />
          </div>

          {/* Score history */}
          <div>
            <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Score History
            </p>

            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3 text-[13px] text-ink-muted">
                {error}
              </div>
            )}

            {!loading && !error && records.length === 0 && (
              <div className="rounded-xl border border-hairline bg-paper-elevated px-6 py-12 text-center">
                <div className="mb-3 flex justify-center">
                  <PencilRuler size={28} className="text-ink-faint" strokeWidth={1.25} />
                </div>
                <p className="font-serif text-lg font-medium text-ink">No scores yet</p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Open any diagram and run Analyze to get your first score.
                </p>
                <Link
                  href="/design-studio"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Go to Design Studio
                </Link>
              </div>
            )}

            {!loading && records.length > 0 && (
              <div className="flex flex-col gap-3">
                {records.map(r => (
                  <HistoryItem key={r._id} record={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CategoryShell>
  )
}
