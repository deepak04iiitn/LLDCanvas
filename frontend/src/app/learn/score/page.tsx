'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { learnApi, DiagramScoreRecord } from '@/lib/learn-api'

// ─── Types ────────────────────────────────────────────────────────────────────

type Dimension = 'coupling' | 'cohesion' | 'complexity' | 'extensibility' | 'solid'

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: 'coupling', label: 'Coupling' },
  { key: 'cohesion', label: 'Cohesion' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'extensibility', label: 'Extensibility' },
  { key: 'solid', label: 'SOLID' },
]

const IMPROVEMENT_ACTIONS: {
  dimension: Dimension
  label: string
  action: string
  href: string
}[] = [
  {
    dimension: 'coupling',
    label: 'Coupling',
    action: 'Try Refactoring Mode challenges',
    href: '/design-studio/refactor',
  },
  {
    dimension: 'cohesion',
    label: 'Cohesion',
    action: 'Study Responsibility Assignment in Plannr',
    href: '/plannr',
  },
  {
    dimension: 'complexity',
    label: 'Complexity',
    action: 'Try Architecture Budget challenges',
    href: '/design-studio/budget',
  },
  {
    dimension: 'extensibility',
    label: 'Extensibility',
    action: 'Study Design Patterns in Plannr',
    href: '/plannr',
  },
  {
    dimension: 'solid',
    label: 'SOLID',
    action: 'Try Design Debugger challenges',
    href: '/design-studio/debugger',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreBadgeClass(score: number): string {
  if (score >= 70) return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  if (score >= 50) return 'bg-orange-100 text-orange-700 border border-orange-200'
  return 'bg-red-100 text-red-700 border border-red-200'
}

function miniBarColor(score: number): string {
  if (score >= 70) return 'bg-emerald-400'
  if (score >= 50) return 'bg-orange-400'
  return 'bg-red-400'
}

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col gap-1 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? 'text-zinc-800'}`}>{value}</p>
      {sub && <p className="text-sm text-zinc-500">{sub}</p>}
    </div>
  )
}

function MiniBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="w-16 shrink-0 text-[10px] text-zinc-400 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${miniBarColor(score)}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] text-zinc-500">{score}</span>
    </div>
  )
}

function HistoryItem({ record }: { record: DiagramScoreRecord }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Left: title + date */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-800 truncate">
          {record.diagramTitle || 'Untitled'}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{formatDate(record.timestamp)}</p>
      </div>

      {/* Overall badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadgeClass(record.scores.overall)}`}
        >
          {record.scores.overall}
        </span>
      </div>

      {/* Mini bars */}
      <div className="sm:w-52 flex flex-col gap-1 mt-1 sm:mt-0">
        {DIMENSIONS.map(d => (
          <MiniBar key={d.key} score={record.scores[d.key]} label={d.label} />
        ))}
      </div>
    </div>
  )
}

function ImprovementActions({
  weakest,
}: {
  weakest: Dimension | null
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-700 mb-3">💡 Improvement Actions</h2>
      <ul className="divide-y divide-zinc-100">
        {IMPROVEMENT_ACTIONS.map(item => (
          <li
            key={item.dimension}
            className={`flex items-center gap-3 py-2.5 ${
              weakest === item.dimension ? 'text-rose-700' : 'text-zinc-700'
            }`}
          >
            <span className="w-24 shrink-0 text-xs font-semibold">
              {item.label}
              {weakest === item.dimension && (
                <span className="ml-1 text-rose-500 text-[10px]">↓ weakest</span>
              )}
            </span>
            <Link
              href={item.href}
              className="text-sm text-indigo-600 hover:underline hover:text-indigo-800 transition-colors"
            >
              {item.action} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScoreHistoryPage() {
  const [records, setRecords] = useState<DiagramScoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    learnApi.score
      .history()
      .then(res => setRecords(res.records))
      .catch(err => setError(err.message ?? 'Failed to load score history'))
      .finally(() => setLoading(false))
  }, [])

  // ── Derived stats ──────────────────────────────────────────────────────────

  const last7Days = records.filter(r => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return new Date(r.timestamp) >= cutoff
  })

  const avgOverall = avg(last7Days.map(r => r.scores.overall))

  // Most improved: highest gain comparing first half vs second half of last 30 records
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-w-0 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Design Score History</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Track how your diagram quality improves over time
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Avg Overall (last 7 days)"
          value={last7Days.length > 0 ? avgOverall : '—'}
          sub={last7Days.length > 0 ? `${last7Days.length} diagram${last7Days.length !== 1 ? 's' : ''}` : 'No scores yet'}
          accent={
            last7Days.length === 0
              ? 'text-zinc-400'
              : avgOverall >= 70
              ? 'text-emerald-600'
              : avgOverall >= 50
              ? 'text-orange-500'
              : 'text-rose-600'
          }
        />
        <SummaryCard
          label="Most Improved Dimension"
          value={mostImprovedLabel}
          sub="Last 30 scores compared"
          accent="text-indigo-600"
        />
        <SummaryCard
          label="Weakest Dimension"
          value={weakestLabel}
          sub="Lowest average across all time"
          accent="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score history list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-wide">
            Score History
          </h2>

          {loading && (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl border border-zinc-100 bg-zinc-50 animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-6 py-8 text-center">
              <p className="text-zinc-500 text-sm">No score records yet.</p>
              <p className="text-zinc-400 text-xs mt-1">
                Open any diagram and run <strong>Analyze → Score</strong> to get started.
              </p>
            </div>
          )}

          {!loading &&
            records.map(r => <HistoryItem key={r._id} record={r} />)}
        </div>

        {/* Improvement actions */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-wide mb-3">
            Next Steps
          </h2>
          <ImprovementActions weakest={weakest} />
        </div>
      </div>
    </div>
  )
}
