'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, ExternalLink, Timer, Flame,
  Search, ChevronDown, BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { InterviewSession } from '@/types'
import { cn } from '@/lib/utils'
import {
  format, parseISO, startOfDay,
  isToday, isYesterday, isThisWeek,
} from 'date-fns'

// ─── Formatters ───────────────────────────────────────────────────────────────

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
  if (s >= 60)   return `${Math.floor(s / 60)}m`
  return `${s}s`
}

// ─── Derived stats ────────────────────────────────────────────────────────────

function computeStats(sessions: InterviewSession[]) {
  const total     = sessions.length
  const completed = sessions.filter(s => s.status === 'completed').length
  const totalSecs = sessions.reduce((a, s) => a + s.timeElapsed, 0)
  const rate      = total ? Math.round((completed / total) * 100) : 0

  const completedDates = sessions
    .filter(s => s.status === 'completed')
    .map(s => startOfDay(parseISO(s.createdAt)).getTime())
  const uniqueDays = [...new Set(completedDates)].sort((a, b) => b - a)

  // current streak — consecutive days ending today
  let streak = 0
  let cursor = startOfDay(new Date()).getTime()
  for (const day of uniqueDays) {
    if (day === cursor) { streak++; cursor -= 86400000 }
    else if (cursor - day > 86400000) break
  }

  // longest single session
  const longest = sessions.reduce<InterviewSession | null>(
    (best, s) => (s.timeElapsed > 0 && (!best || s.timeElapsed > best.timeElapsed)) ? s : best,
    null,
  )

  // most-practiced diagram, by session title
  const titleCounts = new Map<string, number>()
  sessions.forEach(s => titleCounts.set(s.title, (titleCounts.get(s.title) ?? 0) + 1))
  let mostPracticed: { title: string; count: number } | null = null
  for (const [title, count] of titleCounts) {
    if (count > 1 && (!mostPracticed || count > mostPracticed.count)) mostPracticed = { title, count }
  }

  return { total, completed, totalSecs, rate, streak, longest, mostPracticed }
}

// ─── Bucketing for the timeline ───────────────────────────────────────────────

function bucketSessions(list: InterviewSession[], chronological: boolean) {
  if (!chronological) return [{ label: null as string | null, items: list }]

  const buckets = new Map<string, InterviewSession[]>()
  for (const s of list) {
    const d = parseISO(s.createdAt)
    const key = isToday(d) ? 'Today'
      : isYesterday(d) ? 'Yesterday'
      : isThisWeek(d, { weekStartsOn: 1 }) ? 'This week'
      : 'Earlier'
    const arr = buckets.get(key) ?? []
    arr.push(s)
    buckets.set(key, arr)
  }
  return ['Today', 'Yesterday', 'This week', 'Earlier']
    .filter(k => buckets.has(k))
    .map(k => ({ label: k, items: buckets.get(k)! }))
}

// ─── Timeline entry ───────────────────────────────────────────────────────────

const STATUS_META = {
  completed: { label: 'Completed', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  active:    { label: 'Active',    color: 'text-indigo-600',  dot: 'bg-indigo-500'  },
  abandoned: { label: 'Abandoned', color: 'text-amber-600',   dot: 'bg-amber-500'   },
}

const DIFFICULTY_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { label: 'Medium', color: 'text-amber-600',   bg: 'bg-amber-50'   },
  hard:   { label: 'Hard',   color: 'text-red-600',     bg: 'bg-red-50'     },
}

function TimelineEntry({ session, onDelete }: { session: InterviewSession; onDelete: (id: string) => void }) {
  const router = useRouter()
  const meta   = STATUS_META[session.status]
  const pct    = session.durationLimit
    ? Math.min(100, Math.round((session.timeElapsed / session.durationLimit) * 100))
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative border-t border-hairline pl-10 pt-6 pb-6 first:border-t-0 first:pt-0"
    >
      <span className={cn('absolute left-[11px] top-[30px] h-2 w-2 rounded-full', meta.dot)} />

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs tabular-nums text-ink-faint">
          {format(parseISO(session.createdAt), 'h:mm a')}
        </span>
        <h3 className="min-w-0 max-w-[320px] truncate font-serif text-lg text-ink">
          {session.title}
        </h3>
        {session.problemDifficulty && (
          <span className={cn(
            'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider',
            DIFFICULTY_META[session.problemDifficulty].bg, DIFFICULTY_META[session.problemDifficulty].color,
          )}>
            {DIFFICULTY_META[session.problemDifficulty].label}
          </span>
        )}
        <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-widest', meta.color)}>
          {meta.label}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
          {session.diagramId && (
            <button
              onClick={() => router.push(
                session.problemSlug
                  ? `/editor/${session.diagramId}?problem=${session.problemSlug}`
                  : `/editor/${session.diagramId}`,
              )}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider
                         text-ink-faint transition-colors hover:text-brand"
            >
              Open <ExternalLink className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(session._id)}
            className="font-mono text-[10px] uppercase tracking-wider text-ink-faint
                       transition-colors hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
        <Clock className="h-3.5 w-3.5 text-ink-faint" />
        <span className="font-mono tabular-nums">{fmtSecs(session.timeElapsed)}</span>
        {session.durationLimit && (
          <span className="font-mono text-ink-faint">/ {fmtSecs(session.durationLimit)}</span>
        )}
        {pct !== null && <span className="font-mono text-ink-faint">· {pct}%</span>}
      </p>

      {session.notes && (
        <blockquote className="mt-3 border-l-2 border-hairline-strong pl-3 font-serif text-[15px] italic
                               leading-relaxed text-ink-muted line-clamp-2">
          {session.notes}
        </blockquote>
      )}
    </motion.div>
  )
}

function GroupHeading({ label }: { label: string }) {
  return (
    <div className="relative mb-1 mt-8 pl-10 first:mt-0">
      <span className="absolute left-[9px] top-1 h-3.5 w-3.5 rounded-full border-2 border-brand bg-paper" />
      <h2 className="font-serif text-xl text-ink">{label}</h2>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <BookOpen className="mb-6 h-8 w-8 text-ink-faint/50" strokeWidth={1.5} />
      <h3 className="mb-2 font-serif text-2xl text-ink">Your log is empty</h3>
      <p className="max-w-sm text-[15px] leading-relaxed text-ink-faint">
        Head to{' '}
        <span className="inline-flex items-center gap-1 rounded-md border border-hairline-strong
                         bg-paper px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-muted">
          <Timer className="h-3 w-3" /> Interview Mode
        </span>{' '}
        to start a timed practice session. Every session you finish gets a page in this log.
      </p>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-8">
      <div className="h-5 w-48 animate-pulse rounded bg-hairline/60" />
      <div className="pl-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 border-t border-hairline py-6 first:border-t-0 first:pt-0">
            <div className="h-4 w-2/3 animate-pulse rounded bg-hairline/50" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-hairline/40" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Filter tabs / sort ───────────────────────────────────────────────────────

const TABS = ['all', 'completed', 'active', 'abandoned'] as const
type Tab = (typeof TABS)[number]

const SORTS = [
  { value: 'newest',   label: 'Newest first'  },
  { value: 'oldest',   label: 'Oldest first'  },
  { value: 'longest',  label: 'Longest first' },
  { value: 'shortest', label: 'Shortest first'},
] as const
type Sort = (typeof SORTS)[number]['value']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('all')
  const [sort,     setSort]     = useState<Sort>('newest')
  const [q,        setQ]        = useState('')

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
      if (sort === 'newest')   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'oldest')   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === 'longest')  return b.timeElapsed - a.timeElapsed
      if (sort === 'shortest') return a.timeElapsed - b.timeElapsed
      return 0
    })
  }, [sessions, tab, sort, q])

  const groups = useMemo(() => bucketSessions(filtered, sort === 'newest'), [filtered, sort])

  const counts = useMemo(() => ({
    all:       sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    active:    sessions.filter(s => s.status === 'active').length,
    abandoned: sessions.filter(s => s.status === 'abandoned').length,
  }), [sessions])

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* ── Masthead ──────────────────────────────────────────────────── */}
        <header className="shrink-0 border-b border-hairline px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Interview practice
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-ink sm:text-[2.75rem]">
              Practice Log
            </h1>

            {loading && (
              <p className="mt-4 text-sm text-ink-faint">Loading your log…</p>
            )}

            {!loading && sessions.length === 0 && (
              <p className="mt-4 text-sm text-ink-faint">
                Your timed interview practice history will appear here.
              </p>
            )}

            {!loading && sessions.length > 0 && (
              <p className="mt-4 text-[15px] text-ink-muted">
                <span className="font-mono font-semibold text-ink">{stats.total}</span>{' '}
                session{stats.total !== 1 ? 's' : ''} logged · {' '}
                <span className="font-mono font-semibold text-ink">{stats.rate}%</span> completed · {' '}
                <span className="font-mono font-semibold text-ink">{fmtCompact(stats.totalSecs)}</span> practiced
                {stats.streak > 0 && (
                  <>
                    {' '}· <Flame className="mb-0.5 inline h-3.5 w-3.5 text-gold" />{' '}
                    <span className="font-mono font-semibold text-gold">{stats.streak}-day streak</span>
                  </>
                )}
              </p>
            )}

            {!loading && (stats.longest || stats.mostPracticed) && (
              <p className="mt-2 font-serif text-[15px] italic text-ink-faint">
                {stats.longest && (
                  <>Longest run: <span className="not-italic text-ink-muted">{fmtSecs(stats.longest.timeElapsed)}</span> on &ldquo;{stats.longest.title}&rdquo;</>
                )}
                {stats.longest && stats.mostPracticed && '  ·  '}
                {stats.mostPracticed && (
                  <>Most revisited: <span className="not-italic text-ink-muted">&ldquo;{stats.mostPracticed.title}&rdquo;</span> ({stats.mostPracticed.count}×)</>
                )}
              </p>
            )}
          </div>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-3xl space-y-8">

            {loading ? <Skeleton /> : sessions.length === 0 ? <EmptyState /> : (<>

              {/* ── Filter / sort / search ───────────────────────────────── */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b border-hairline pb-4">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  {TABS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        'relative pb-1 font-serif text-lg capitalize transition-colors',
                        tab === t ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
                      )}
                    >
                      {t}
                      <span className="ml-1.5 font-mono text-[10px] align-super text-ink-faint">{counts[t]}</span>
                      {tab === t && (
                        <motion.div
                          layoutId="sessionsTabIndicator"
                          className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-brand"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      value={q} onChange={e => setQ(e.target.value)}
                      placeholder="Search…"
                      className="w-32 border-b border-transparent bg-transparent py-1 pl-5 text-sm text-ink
                                 outline-none transition-all placeholder:text-ink-faint focus:w-44 focus:border-brand"
                    />
                  </div>
                  <div className="h-4 w-px bg-hairline" />
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as Sort)}
                      className="appearance-none bg-transparent pr-4 font-mono text-xs text-ink-faint
                                 outline-none transition-colors hover:text-ink-muted"
                    >
                      {SORTS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3
                                            -translate-y-1/2 text-ink-faint" />
                  </div>
                </div>
              </div>

              {/* ── Timeline ──────────────────────────────────────────── */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="mb-3 h-7 w-7 text-ink-faint/40" strokeWidth={1.5} />
                  <p className="text-sm text-ink-faint">No entries match your filters.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-2 left-4 top-2 w-px bg-hairline" />
                  <AnimatePresence initial={false}>
                    {groups.map(group => (
                      <div key={group.label ?? 'flat'}>
                        {group.label && <GroupHeading label={group.label} />}
                        <div>
                          {group.items.map(s => (
                            <TimelineEntry key={s._id} session={s} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {filtered.length > 0 && (
                <p className="pt-2 text-center font-mono text-[11px] text-ink-faint">
                  Showing {filtered.length} of {sessions.length} entries
                </p>
              )}

            </>)}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
