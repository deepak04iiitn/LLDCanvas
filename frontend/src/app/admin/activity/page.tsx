'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { format, parseISO }   from 'date-fns'
import {
  Activity, Users, Zap, TrendingUp, Award,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, RefreshCw, Download, Filter,
  Clock, CheckCircle2, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminApi, type UserActivityRow, type UserActivitySummary } from '@/lib/admin-api'

// ─── Constants ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { slug: 'all',        label: 'All Features',        color: 'bg-gray-100 text-gray-700' },
  { slug: 'plannr',     label: 'Plannr',               color: 'bg-violet-100 text-violet-700' },
  { slug: 'daily-quiz', label: 'Daily Quiz',           color: 'bg-blue-100 text-blue-700' },
  { slug: 'detective',  label: 'Pattern Detective',    color: 'bg-teal-100 text-teal-700' },
  { slug: 'debug-lab',  label: 'Debug Lab',            color: 'bg-red-100 text-red-700' },
  { slug: 'roguelike',  label: 'LLD Roguelike',        color: 'bg-purple-100 text-purple-700' },
  { slug: 'debug-fix',  label: 'Debug & Fix',          color: 'bg-orange-100 text-orange-700' },
  { slug: 'refactor',   label: 'Refactor',             color: 'bg-cyan-100 text-cyan-700' },
  { slug: 'change-one', label: 'Change One Thing',     color: 'bg-pink-100 text-pink-700' },
  { slug: 'evolution',  label: 'Evolution',            color: 'bg-emerald-100 text-emerald-700' },
  { slug: 'budget',     label: 'Budget Pressure',      color: 'bg-yellow-100 text-yellow-700' },
]

const FEATURE_COLOR: Record<string, string> = Object.fromEntries(FEATURES.map(f => [f.slug, f.color]))

const DAY_OPTIONS = [
  { label: '7d',  value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
]

type SortKey = 'date' | 'userName' | 'feature' | 'actions' | 'completions' | 'score' | 'duration' | 'lastSeen'
type SortDir = 'asc' | 'desc'

function getColumns(feature: string): { key: SortKey; label: string; align?: 'right' }[] {
  if (feature === 'daily-quiz') {
    return [
      { key: 'date',     label: 'Quiz day' },
      { key: 'userName', label: 'User' },
      { key: 'feature',  label: 'Feature' },
      { key: 'score',    label: 'Score', align: 'right' },
      { key: 'lastSeen', label: 'Attempted at' },
    ]
  }
  return [
    { key: 'date',        label: 'Date' },
    { key: 'userName',    label: 'User' },
    { key: 'feature',     label: 'Feature' },
    { key: 'actions',     label: 'Actions',     align: 'right' },
    { key: 'completions', label: 'Completions', align: 'right' },
    { key: 'duration',    label: 'Duration',    align: 'right' },
    { key: 'lastSeen',    label: 'Last Active' },
  ]
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, sub }: { label: string; value: string | number; Icon: React.ElementType; sub?: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
        <div className="rounded-lg bg-hairline p-1.5"><Icon className="h-3.5 w-3.5 text-ink-faint" /></div>
      </div>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="ml-1 h-3 w-3 text-ink-faint opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp   className="ml-1 h-3 w-3 text-brand" />
    : <ChevronDown className="ml-1 h-3 w-3 text-brand" />
}

function FeatureBadge({ slug, label }: { slug: string; label: string }) {
  const color = FEATURE_COLOR[slug] || 'bg-gray-100 text-gray-700'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>
      {label}
    </span>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-hairline', className)} />
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function downloadCsv(rows: UserActivityRow[], feature: string) {
  const isQuiz = feature === 'daily-quiz'
  const headers = isQuiz
    ? ['Quiz day', 'User Name', 'User Email', 'Score', 'Percent', 'Attempted at']
    : ['Date', 'User Name', 'User Email', 'Feature', 'Actions', 'Completions', 'Duration (min)', 'Last Active']
  const lines = [
    headers.join(','),
    ...rows.map(r => (isQuiz
      ? [r.date, `"${r.userName}"`, r.userEmail, r.scoreLabel ?? '', r.scorePercent ?? '', r.lastSeen]
      : [r.date, `"${r.userName}"`, r.userEmail, `"${r.featureLabel}"`, r.actions, r.completions, r.durationMinutes ?? '', r.lastSeen]
    ).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `user-activity-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminActivityPage() {
  const [days,       setDays]       = useState(30)
  const [feature,    setFeature]    = useState('all')
  const [search,     setSearch]     = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page,       setPage]       = useState(1)
  const [sortKey,    setSortKey]    = useState<SortKey>('date')
  const [sortDir,    setSortDir]    = useState<SortDir>('desc')

  const [rows,       setRows]       = useState<UserActivityRow[]>([])
  const [summary,    setSummary]    = useState<UserActivitySummary | null>(null)
  const [total,      setTotal]      = useState(0)
  const [pages,      setPages]      = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [exporting,  setExporting]  = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const columns = getColumns(feature)
  const isQuiz = feature === 'daily-quiz'

  const load = useCallback(async (opts?: { resetPage?: boolean }) => {
    setLoading(true)
    const p = opts?.resetPage ? 1 : page
    if (opts?.resetPage) setPage(1)
    try {
      const data = await adminApi.userActivity({
        days, feature, search, page: p, limit: 50,
        sortBy: sortKey, sortDir,
      })
      setRows(data.rows)
      setSummary(data.summary)
      setTotal(data.total)
      setPages(data.pages)
    } catch { setRows([]); setSummary(null) }
    finally  { setLoading(false) }
  }, [days, feature, search, page, sortKey, sortDir])

  useEffect(() => { load() }, [load])

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1) }, 400)
  }

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // fetch all rows (up to 5000) for export
      const data = await adminApi.userActivity({ days, feature, search, page: 1, limit: 100, sortBy: sortKey, sortDir })
      downloadCsv(data.rows, feature)
    } catch { /* ignore */ }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-6 px-6 py-8 sm:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">User Activity</h1>
          <p className="mt-1 text-sm text-ink-faint">Date-wise breakdown of feature usage across all 10 features</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || loading}
          className="flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-sm text-ink-muted hover:bg-hairline disabled:opacity-50"
        >
          {exporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export CSV
        </button>
      </div>

      {/* Summary stat cards */}
      {loading && !summary ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Active users"      value={summary.totalActiveUsers}  Icon={Users}        sub={`last ${days} days`} />
          <StatCard label="Total actions"     value={summary.totalActions}      Icon={Zap}          />
          <StatCard label="Avg actions / user" value={summary.avgActionsPerUser} Icon={BarChart3}   />
          <StatCard label="Top feature"       value={summary.topFeatureLabel || '—'} Icon={Award}  sub="by action count" />
        </div>
      ) : null}

      {/* Filter bar */}
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search user name or email…"
              className="w-full rounded-lg border border-hairline bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-paper p-1">
            {DAY_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => { setDays(o.value); setPage(1) }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  days === o.value ? 'bg-brand text-brand-foreground' : 'text-ink-muted hover:text-ink hover:bg-hairline',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Feature filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-ink-faint" />
            <select
              value={feature}
              onChange={e => {
                const next = e.target.value
                setFeature(next)
                setPage(1)
                if (next === 'daily-quiz') setSortKey('lastSeen')
                else if (sortKey === 'score') setSortKey('date')
              }}
              className="rounded-lg border border-hairline bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {FEATURES.map(f => (
                <option key={f.slug} value={f.slug}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={() => load({ resetPage: true })}
            disabled={loading}
            className="rounded-lg border border-hairline p-2 text-ink-muted hover:bg-hairline disabled:opacity-40"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
        {/* Table header */}
        <div className="border-b border-hairline bg-hairline/30 px-5 py-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Feature Activity Log
          </p>
          {!loading && (
            <span className="font-mono text-[10px] text-ink-faint">{total.toLocaleString()} rows</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/20">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      'cursor-pointer select-none whitespace-nowrap px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint hover:text-ink transition-colors',
                      col.align === 'right' && 'text-right',
                    )}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <Activity className="mx-auto mb-3 h-8 w-8 text-ink-faint opacity-20" />
                    <p className="text-sm font-medium text-ink-faint">No activity found</p>
                    <p className="mt-1 text-xs text-ink-faint opacity-60">
                      Try adjusting the date range or feature filter
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="hover:bg-hairline/30 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-faint">
                      {row.date}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.userName}</p>
                      <p className="text-xs text-ink-faint">{row.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <FeatureBadge slug={row.feature} label={row.featureLabel} />
                    </td>
                    {isQuiz ? (
                      <td className="px-4 py-3 text-right">
                        {row.scoreLabel ? (
                          <span className={cn(
                            'inline-flex items-center gap-1 font-mono text-sm font-semibold',
                            (row.scorePercent ?? 0) >= 70 ? 'text-emerald-600'
                              : (row.scorePercent ?? 0) >= 40 ? 'text-amber-600'
                                : 'text-rose-600',
                          )}>
                            <CheckCircle2 className="h-3 w-3" />
                            {row.scoreLabel}
                            <span className="text-xs font-normal text-ink-faint">({row.scorePercent}%)</span>
                          </span>
                        ) : (
                          <span className="text-xs text-ink-faint">—</span>
                        )}
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-bold text-ink">{row.actions}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {row.completions}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {row.durationMinutes != null ? (
                            <span className="inline-flex items-center gap-1 font-mono text-sm text-ink">
                              <Clock className="h-3 w-3 text-ink-faint" />
                              {row.durationMinutes}m
                            </span>
                          ) : (
                            <span className="text-xs text-ink-faint">—</span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-faint">
                      {row.lastSeen ? format(parseISO(row.lastSeen as unknown as string), 'MMM d, HH:mm') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
            <span className="text-xs text-ink-faint">
              Page {page} of {pages} · {total.toLocaleString()} total rows
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, pages - 4))
                const p = start + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium',
                      p === page ? 'bg-brand text-brand-foreground' : 'border border-hairline text-ink-muted hover:bg-hairline',
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages || loading}
                className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
