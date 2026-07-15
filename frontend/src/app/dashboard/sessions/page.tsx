'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock, CheckCircle2, AlertCircle, Trash2,
  ExternalLink, Timer, StickyNote,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { InterviewSession } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtSecs(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`
  return `${sec}s`
}

// ─── Circular progress ring ───────────────────────────────────────────────────

function ProgressRing({
  elapsed, limit, status,
}: {
  elapsed: number
  limit: number | null
  status: InterviewSession['status']
}) {
  const SIZE   = 44
  const STROKE = 3
  const R      = (SIZE - STROKE) / 2
  const CIRC   = 2 * Math.PI * R
  const pct    = limit ? Math.min(1, elapsed / limit) : (status === 'completed' ? 1 : 0)
  const offset = CIRC * (1 - pct)

  const ringColor =
    status === 'completed' ? '#10B981' :
    status === 'active'    ? '#6366F1' : '#F59E0B'

  const bgColor =
    status === 'completed' ? '#ECFDF5' :
    status === 'active'    ? '#EEF2FF' : '#FFFBEB'

  const icon =
    status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
    status === 'active'    ? <Timer className="h-4 w-4 text-indigo-500" /> :
                             <AlertCircle className="h-4 w-4 text-amber-400" />

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill={bgColor}
          stroke="#E5E7EB" strokeWidth={STROKE}
        />
        {/* Progress */}
        {pct > 0 && (
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon}
      </div>
    </div>
  )
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({
  session, onDelete,
}: {
  session: InterviewSession
  onDelete: (id: string) => void
}) {
  const router = useRouter()

  const statusLabel =
    session.status === 'completed' ? 'Completed' :
    session.status === 'active'    ? 'Active'    : 'Abandoned'

  const statusCls =
    session.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' :
    session.status === 'active'    ? 'bg-indigo-50 text-indigo-700 ring-indigo-100'    :
                                     'bg-amber-50 text-amber-700 ring-amber-100'

  const pctUsed = session.durationLimit
    ? Math.round(Math.min(100, (session.timeElapsed / session.durationLimit) * 100))
    : null

  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border
                    border-gray-100 bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]
                    transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]
                    sm:flex-row sm:items-start">

      {/* Progress ring */}
      <ProgressRing
        elapsed={session.timeElapsed}
        limit={session.durationLimit}
        status={session.status}
      />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Title row */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-bold text-gray-900 leading-tight">
            {session.title}
          </h3>
          <span className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1',
            statusCls,
          )}>
            {statusLabel}
          </span>
        </div>

        {/* Time & date row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono font-semibold text-gray-700">
              {fmtSecs(session.timeElapsed)}
            </span>
            {session.durationLimit && (
              <span className="text-gray-300">/ {fmtSecs(session.durationLimit)}</span>
            )}
          </span>

          <span className="hidden sm:block">
            {format(new Date(session.createdAt), 'MMM d, yyyy · h:mm a')}
          </span>

          <span className="text-gray-300">
            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Progress bar */}
        {pctUsed !== null && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  pctUsed >= 100 ? 'bg-emerald-400' :
                  pctUsed >= 75  ? 'bg-amber-400'   : 'bg-indigo-400',
                )}
                style={{ width: `${pctUsed}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[10px] text-gray-400">{pctUsed}%</span>
          </div>
        )}

        {/* Notes preview */}
        {session.notes && (
          <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-gray-50 px-3 py-2">
            <StickyNote className="mt-px h-3 w-3 shrink-0 text-gray-300" />
            <p className="line-clamp-2 font-mono text-[11px] leading-relaxed text-gray-500">
              {session.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions — revealed on hover */}
      <div className="flex shrink-0 items-center gap-1 self-start
                      sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        {session.diagramId && (
          <button
            onClick={() => router.push(`/editor/${session.diagramId}`)}
            title="Open diagram"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400
                       transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(session._id)}
          title="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300
                     transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white
                    px-5 py-4 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
      <span className={cn('font-mono text-3xl font-black tabular-nums', accent)}>{value}</span>
      <span className="mt-1 text-[11px] text-gray-400">{label}</span>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-8">
        {/* Concentric rings */}
        <div className="absolute inset-0 -m-4 rounded-full border border-indigo-100" />
        <div className="absolute inset-0 -m-8 rounded-full border border-indigo-50" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
          <Timer className="h-9 w-9 text-indigo-400" />
        </div>
      </div>

      <h3 className="mb-2 text-xl font-bold text-gray-800">No sessions yet</h3>
      <p className="max-w-sm text-sm leading-relaxed text-gray-400">
        Open any diagram in the editor and click the{' '}
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5
                         font-mono text-[11px] font-medium text-gray-700">
          <Timer className="h-3 w-3" /> Practice
        </span>{' '}
        button in the top bar to start a timed session.
      </p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100/70" />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.interview.list(1, 100)
      .then(({ sessions: s }) => setSessions(s))
      .catch(() => toast.error('Could not load sessions'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    try {
      await api.interview.delete(id)
      setSessions(s => s.filter(x => x._id !== id))
      toast.success('Session deleted')
    } catch {
      toast.error('Could not delete session')
    }
  }

  // Compute stats
  const completed = sessions.filter(s => s.status === 'completed').length
  const totalSecs = sessions.reduce((acc, s) => acc + s.timeElapsed, 0)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const totalLabel = totalSecs >= 3600 ? `${h}h ${m}m` : `${Math.floor(totalSecs / 60)}m`
  const avgSecs  = completed ? Math.round(totalSecs / completed) : 0
  const avgLabel = avgSecs >= 3600
    ? `${Math.floor(avgSecs / 3600)}h ${Math.floor((avgSecs % 3600) / 60)}m`
    : `${Math.floor(avgSecs / 60)}m`

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">

          {/* ── Page header ────────────────────────────────────────────── */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Practice Sessions</h1>
            <p className="mt-1 text-sm text-gray-400">
              {loading ? 'Loading…' : sessions.length
                ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''} · start from the editor's Practice button`
                : 'Start your first session from the editor'}
            </p>
          </div>

          {loading ? <Skeleton /> : sessions.length === 0 ? <EmptyState /> : (
            <>
              {/* ── Stats strip ───────────────────────────────────────── */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill label="Total"     value={String(sessions.length)} accent="text-gray-800" />
                <StatPill label="Completed" value={String(completed)}       accent="text-emerald-600" />
                <StatPill label="Time spent" value={totalLabel || '—'}      accent="text-indigo-600" />
                <StatPill label="Avg session" value={avgLabel || '—'}       accent="text-amber-600" />
              </div>

              {/* ── Session list ──────────────────────────────────────── */}
              <div className="space-y-3">
                {sessions.map(s => (
                  <SessionCard key={s._id} session={s} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </AppShell>
  )
}
