'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ExternalLink,
  Timer,
  Flame,
  Search,
  ChevronDown,
  Trash2,
  CheckCircle2,
  CircleDashed,
  XCircle,
  ArrowUpRight,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { InterviewSession } from '@/types'
import { cn } from '@/lib/utils'
import {
  format,
  parseISO,
  startOfDay,
  isToday,
  isYesterday,
  isThisWeek,
} from 'date-fns'

function fmtSecs(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`
  return `${sec}s`
}

function fmtCompact(s: number) {
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  if (s >= 60) return `${Math.floor(s / 60)}m`
  return `${s}s`
}

function computeStats(sessions: InterviewSession[]) {
  const total = sessions.length
  const completed = sessions.filter(s => s.status === 'completed').length
  const totalSecs = sessions.reduce((a, s) => a + s.timeElapsed, 0)
  const rate = total ? Math.round((completed / total) * 100) : 0

  const completedDates = sessions
    .filter(s => s.status === 'completed')
    .map(s => startOfDay(parseISO(s.createdAt)).getTime())
  const uniqueDays = [...new Set(completedDates)].sort((a, b) => b - a)

  let streak = 0
  let cursor = startOfDay(new Date()).getTime()
  for (const day of uniqueDays) {
    if (day === cursor) {
      streak++
      cursor -= 86400000
    } else if (cursor - day > 86400000) break
  }

  const longest = sessions.reduce<InterviewSession | null>(
    (best, s) => (s.timeElapsed > 0 && (!best || s.timeElapsed > best.timeElapsed) ? s : best),
    null,
  )

  const titleCounts = new Map<string, number>()
  sessions.forEach(s => titleCounts.set(s.title, (titleCounts.get(s.title) ?? 0) + 1))
  let mostPracticed: { title: string; count: number } | null = null
  for (const [title, count] of titleCounts) {
    if (count > 1 && (!mostPracticed || count > mostPracticed.count)) {
      mostPracticed = { title, count }
    }
  }

  return { total, completed, totalSecs, rate, streak, longest, mostPracticed }
}

function bucketSessions(list: InterviewSession[], chronological: boolean) {
  if (!chronological) return [{ label: null as string | null, items: list }]

  const buckets = new Map<string, InterviewSession[]>()
  for (const s of list) {
    const d = parseISO(s.createdAt)
    const key = isToday(d)
      ? 'Today'
      : isYesterday(d)
        ? 'Yesterday'
        : isThisWeek(d, { weekStartsOn: 1 })
          ? 'This week'
          : 'Earlier'
    const arr = buckets.get(key) ?? []
    arr.push(s)
    buckets.set(key, arr)
  }
  return ['Today', 'Yesterday', 'This week', 'Earlier']
    .filter(k => buckets.has(k))
    .map(k => ({ label: k, items: buckets.get(k)! }))
}

const STATUS_META = {
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    soft: 'bg-emerald-50',
    Icon: CheckCircle2,
  },
  active: {
    label: 'Active',
    color: 'text-brand',
    soft: 'bg-brand-tint',
    Icon: CircleDashed,
  },
  abandoned: {
    label: 'Abandoned',
    color: 'text-amber-700',
    soft: 'bg-amber-50',
    Icon: XCircle,
  },
} as const

const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-700' },
  medium: { label: 'Medium', color: 'text-amber-700' },
  hard:   { label: 'Hard',   color: 'text-red-700' },
} as const

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hairline"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-brand transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-sm font-semibold tabular-nums text-ink">{value}%</span>
      </div>
    </div>
  )
}

function SessionRow({
  session,
  index,
  onDelete,
}: {
  session: InterviewSession
  index: number
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const meta = STATUS_META[session.status]
  const StatusIcon = meta.Icon
  const pct = session.durationLimit
    ? Math.min(100, Math.round((session.timeElapsed / session.durationLimit) * 100))
    : null

  function openEditor() {
    if (!session.diagramId) return
    router.push(
      session.problemSlug
        ? `/editor/${session.diagramId}?problem=${session.problemSlug}`
        : `/editor/${session.diagramId}`,
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.2) }}
      className={cn(
        'group relative flex gap-4 overflow-hidden rounded-xl border border-transparent px-4 py-4 transition-all duration-200 sm:gap-5 sm:px-5',
        'hover:border-hairline hover:bg-paper-elevated',
        session.status === 'completed' && 'bg-brand-tint/20',
        session.status === 'active' && 'bg-brand-tint/40',
        session.status === 'abandoned' && 'bg-amber-50/30',
      )}
    >
      <span className="hidden w-8 shrink-0 pt-1 font-mono text-[11px] tabular-nums text-ink-faint sm:block">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-xs tabular-nums text-ink-faint">
            {format(parseISO(session.createdAt), 'h:mm a')}
          </span>
          <span className="text-ink-faint/35">·</span>
          <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', meta.color)}>
            <StatusIcon className="h-3 w-3" />
            {meta.label}
          </span>
          {session.problemDifficulty && (
            <>
              <span className="text-ink-faint/35">·</span>
              <span className={cn('text-xs font-semibold', DIFF_META[session.problemDifficulty].color)}>
                {DIFF_META[session.problemDifficulty].label}
              </span>
            </>
          )}
        </div>

        <h3 className="truncate text-[1.05rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand sm:text-[1.15rem]">
          {session.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-ink-faint" />
            <span className="tabular-nums">{fmtSecs(session.timeElapsed)}</span>
            {session.durationLimit != null && (
              <span className="text-ink-faint">/ {fmtSecs(session.durationLimit)}</span>
            )}
          </span>
          {pct != null && (
            <span className="inline-flex items-center gap-2">
              <span className="h-1 w-16 overflow-hidden rounded-full bg-hairline">
                <span
                  className="block h-full rounded-full bg-brand transition-all"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="tabular-nums text-xs text-ink-faint">{pct}%</span>
            </span>
          )}
        </div>

        {session.notes && (
          <p className="mt-2.5 line-clamp-2 border-l-2 border-hairline-strong pl-3 text-sm leading-relaxed text-ink-faint">
            {session.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 self-start opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {session.diagramId && (
          <button
            type="button"
            onClick={openEditor}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-faint transition-colors hover:bg-brand-tint hover:text-brand"
          >
            Open <ExternalLink className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(session._id)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-faint transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>
    </motion.div>
  )
}

const TABS = ['all', 'completed', 'active', 'abandoned'] as const
type Tab = (typeof TABS)[number]

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'longest', label: 'Longest first' },
  { value: 'shortest', label: 'Shortest first' },
] as const
type Sort = (typeof SORTS)[number]['value']

export default function SessionsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [sort, setSort] = useState<Sort>('newest')
  const [q, setQ] = useState('')

  useEffect(() => {
    api.interview.list(1, 200)
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

  const stats = useMemo(() => computeStats(sessions), [sessions])

  const filtered = useMemo(() => {
    let list = tab === 'all' ? sessions : sessions.filter(s => s.status === tab)
    if (q.trim()) list = list.filter(s => s.title.toLowerCase().includes(q.toLowerCase()))
    return [...list].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === 'longest') return b.timeElapsed - a.timeElapsed
      if (sort === 'shortest') return a.timeElapsed - b.timeElapsed
      return 0
    })
  }, [sessions, tab, sort, q])

  const groups = useMemo(() => bucketSessions(filtered, sort === 'newest'), [filtered, sort])

  const counts = useMemo(
    () => ({
      all: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      active: sessions.filter(s => s.status === 'active').length,
      abandoned: sessions.filter(s => s.status === 'abandoned').length,
    }),
    [sessions],
  )

  let rowIndex = 0

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* Masthead */}
        <header className="shrink-0 border-b border-hairline px-6 py-5 sm:px-10 sm:py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-ink sm:text-[2rem]">
                  Practice Log
                </h1>
                <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                  Interview
                </span>
              </div>
              {!loading && (
                <p className="mt-2 text-sm text-ink-faint">
                  {sessions.length === 0 ? (
                    'Your timed interview practice history will appear here.'
                  ) : (
                    <>
                      <span className="font-semibold text-ink">{stats.total}</span> session
                      {stats.total !== 1 ? 's' : ''}
                      <span className="mx-1.5 text-hairline-strong">·</span>
                      <span className="font-semibold text-ink">{fmtCompact(stats.totalSecs)}</span> practiced
                      {stats.streak > 0 && (
                        <>
                          <span className="mx-1.5 text-hairline-strong">·</span>
                          <Flame className="mb-0.5 inline h-3.5 w-3.5 text-gold" />{' '}
                          <span className="font-semibold text-gold">{stats.streak}-day streak</span>
                        </>
                      )}
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {!loading && sessions.length > 0 && (
                <div className="hidden items-center gap-3 sm:flex">
                  <ProgressRing value={stats.rate} size={52} />
                </div>
              )}
              <Link
                href="/dashboard/interview-mode"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                <Timer className="h-4 w-4" />
                New session
              </Link>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left stats rail */}
          <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-paper-elevated/50 lg:flex xl:w-72">
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-hairline/50" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      Overview
                    </p>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-hairline bg-paper px-3.5 py-3">
                        <p className="text-xs text-ink-faint">Sessions</p>
                        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                          {stats.total}
                        </p>
                      </div>
                      <div className="rounded-xl border border-hairline bg-paper px-3.5 py-3">
                        <p className="text-xs text-ink-faint">Completed</p>
                        <div className="mt-0.5 flex items-baseline gap-2">
                          <p className="text-2xl font-semibold tabular-nums tracking-tight text-ink">
                            {stats.completed}
                          </p>
                          <span className="text-sm text-ink-faint">{stats.rate}%</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-hairline bg-paper px-3.5 py-3">
                        <p className="text-xs text-ink-faint">Time practiced</p>
                        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                          {fmtCompact(stats.totalSecs)}
                        </p>
                      </div>
                      {stats.streak > 0 && (
                        <div className="rounded-xl border border-gold/20 bg-gold-tint/40 px-3.5 py-3">
                          <p className="text-xs text-gold">Current streak</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                            <Flame className="h-5 w-5 text-gold" />
                            {stats.streak}
                            <span className="text-sm font-normal text-ink-faint">days</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(stats.longest || stats.mostPracticed) && (
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                        Highlights
                      </p>
                      <div className="space-y-3 text-sm">
                        {stats.longest && (
                          <div className="rounded-xl border border-hairline bg-paper px-3.5 py-3">
                            <p className="text-xs text-ink-faint">Longest run</p>
                            <p className="mt-1 font-semibold tabular-nums text-ink">
                              {fmtSecs(stats.longest.timeElapsed)}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-ink-muted">
                              {stats.longest.title}
                            </p>
                          </div>
                        )}
                        {stats.mostPracticed && (
                          <div className="rounded-xl border border-hairline bg-paper px-3.5 py-3">
                            <p className="text-xs text-ink-faint">Most revisited</p>
                            <p className="mt-1 truncate font-semibold text-ink">
                              {stats.mostPracticed.title}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-muted">
                              {stats.mostPracticed.count}× sessions
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      By status
                    </p>
                    <div className="space-y-2">
                      {(['completed', 'active', 'abandoned'] as const).map(key => {
                        const m = STATUS_META[key]
                        const count = counts[key]
                        const pctOf = stats.total ? Math.round((count / stats.total) * 100) : 0
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={cn(
                              'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                              tab === key ? 'bg-brand-tint/60' : 'hover:bg-hairline/50',
                            )}
                          >
                            <m.Icon className={cn('h-3.5 w-3.5', m.color)} />
                            <span className="flex-1 text-sm capitalize text-ink">{key}</span>
                            <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                              {count}
                            </span>
                            <span className="w-8 text-right font-mono text-[10px] tabular-nums text-ink-faint">
                              {pctOf}%
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right feed */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {!loading && sessions.length > 0 && (
              <div className="shrink-0 border-b border-hairline px-5 py-3 sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex flex-wrap rounded-xl border border-hairline bg-paper-elevated p-0.5">
                    {TABS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                          tab === t
                            ? 'bg-brand-tint text-brand'
                            : 'text-ink-faint hover:text-ink-muted',
                        )}
                      >
                        {t}
                        <span className="ml-1.5 tabular-nums text-xs opacity-70">{counts[t]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative ml-auto min-w-0 flex-1 sm:max-w-50">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      value={q}
                      onChange={e => setQ(e.target.value)}
                      placeholder="Search sessions…"
                      className="w-full rounded-xl border border-hairline bg-paper-elevated py-2 pl-9 pr-8 text-sm outline-none transition-shadow placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                    {q && (
                      <button
                        type="button"
                        onClick={() => setQ('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as Sort)}
                      className="appearance-none rounded-xl border border-hairline bg-paper-elevated py-2 pl-3 pr-8 text-sm text-ink-muted outline-none transition-colors hover:border-hairline-strong focus:border-brand"
                    >
                      {SORTS.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                  </div>
                </div>
              </div>
            )}

            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl bg-hairline/40" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center px-4 py-24 text-center"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint">
                    <Timer className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">Your log is empty</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-faint">
                    Start a timed Interview Mode session. Every practice you finish lands here.
                  </p>
                  <Link
                    href="/dashboard/interview-mode"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                  >
                    Start practicing <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="mb-3 h-7 w-7 text-ink-faint/40" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-ink">No matching sessions</p>
                  <p className="mt-1 text-sm text-ink-faint">Try a different filter or search.</p>
                  <button
                    type="button"
                    onClick={() => { setTab('all'); setQ('') }}
                    className="mt-4 text-sm font-medium text-brand hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl space-y-6">
                  <AnimatePresence initial={false}>
                    {groups.map(group => (
                      <div key={group.label ?? 'flat'}>
                        {group.label && (
                          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint sm:px-5">
                            {group.label}
                          </h2>
                        )}
                        <div className="space-y-0.5">
                          {group.items.map(s => {
                            const i = rowIndex++
                            return (
                              <SessionRow
                                key={s._id}
                                session={s}
                                index={i}
                                onDelete={handleDelete}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>

                  <p className="pt-2 text-center text-xs text-ink-faint">
                    Showing {filtered.length} of {sessions.length} sessions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
