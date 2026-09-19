'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import {
  Terminal, CheckCircle2, XCircle, TrendingUp, Users,
  RefreshCw, Ban, ShieldOff, Shield, Search, ChevronLeft,
  ChevronRight, Calendar, Layers, AlertTriangle, Eye, X, Trash2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  adminApi,
  type CodeStats,
  type AdminCodeExecution,
  type AdminCodeBan,
  type UserCodeDaily,
} from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { BulkActionBar, SelectCheckbox } from '@/components/admin/BulkActionBar'
import { useRowSelection } from '@/components/admin/useRowSelection'

const BRAND  = '#3D6A52'
const ERROR  = '#EF4444'
const GOLD   = '#B5874B'
const MUTED  = '#9CA3AF'
const LANG_COLORS = ['#3D6A52','#B5874B','#6366F1','#EC4899','#14B8A6','#F59E0B','#8B5CF6','#10B981','#F97316','#06B6D4','#EF4444','#84CC16']

function fmtDate(s: string) { try { return format(parseISO(s), 'MMM d') } catch { return s } }

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, Icon, color = 'brand' }: {
  label: string; value: string | number; sub?: string
  Icon: typeof Terminal; color?: 'brand' | 'red' | 'amber' | 'slate'
}) {
  const colorMap = {
    brand: 'bg-brand-tint text-brand',
    red:   'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-hairline text-ink-muted',
  }
  return (
    <div className="flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Ban reason modal ─────────────────────────────────────────────────────────
function BanModal({ userId, userName, onConfirm, onCancel }: {
  userId: string; userName: string
  onConfirm: (reason: string) => void; onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"><Ban className="h-5 w-5 text-red-600" /></div>
          <div>
            <p className="font-semibold text-ink">Revoke Code Execution</p>
            <p className="text-xs text-ink-faint">for {userName}</p>
          </div>
          <button onClick={onCancel} className="ml-auto rounded-md p-1 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <p className="mb-3 text-sm text-ink-muted">The user will see a clear message explaining why they cannot execute code.</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason (optional - shown to the user)…"
          rows={3}
          className="mb-4 w-full resize-none rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Revoke Access
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── User daily drill-down drawer ─────────────────────────────────────────────
function UserDrillDown({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData]       = useState<UserCodeDaily | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays]       = useState(30)

  useEffect(() => {
    setLoading(true)
    adminApi.code.userDaily(userId, days)
      .then(setData)
      .finally(() => setLoading(false))
  }, [userId, days])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink">{data?.userName ?? '…'}</p>
            <p className="text-xs text-ink-faint">{data?.userEmail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[7,14,30,60].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition',
                  days === d ? 'bg-brand text-brand-foreground' : 'border border-hairline text-ink-muted hover:bg-hairline')}>
                {d}d
              </button>
            ))}
            <button onClick={onClose} className="ml-2 rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center"><RefreshCw className="h-5 w-5 animate-spin text-ink-faint" /></div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Total Runs',    value: data?.totalRuns    ?? 0, color: 'text-ink' },
                { label: 'Successful',    value: data?.totalSuccess ?? 0, color: 'text-emerald-600' },
                { label: 'Failed',        value: data?.totalError   ?? 0, color: 'text-red-600' },
              ].map(m => (
                <div key={m.label} className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="font-mono text-[10px] text-ink-faint uppercase tracking-wider">{m.label}</p>
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.daily ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="_id" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: MUTED }} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => fmtDate(String(v))} />
                        <Bar dataKey="success" name="Success" fill={BRAND} radius={[3,3,0,0]} />
                        <Bar dataKey="error"   name="Error"   fill={ERROR} radius={[3,3,0,0]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCodePage() {
  const [stats,      setStats]      = useState<CodeStats | null>(null)
  const [executions, setExecutions] = useState<AdminCodeExecution[]>([])
  const [exTotal,    setExTotal]    = useState(0)
  const [exPage,     setExPage]     = useState(1)
  const [exPages,    setExPages]    = useState(1)
  const [bans,       setBans]       = useState<AdminCodeBan[]>([])
  const [banTotal,   setBanTotal]   = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState<'overview' | 'executions' | 'bans'>('overview')

  // Filters
  const [filterUser,   setFilterUser]   = useState('')
  const [filterLang,   setFilterLang]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFrom,   setFilterFrom]   = useState('')
  const [filterTo,     setFilterTo]     = useState('')

  // UI state
  const [drillUser, setDrillUser]     = useState<string | null>(null)
  const [banTarget, setBanTarget]     = useState<{ id: string; name: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [exBulkConfirm, setExBulkConfirm] = useState(false)
  const [exBulkLoading, setExBulkLoading] = useState(false)
  const [banBulkConfirm, setBanBulkConfirm] = useState(false)
  const [banBulkLoading, setBanBulkLoading] = useState(false)

  const executionIds = useMemo(() => executions.map(ex => String(ex._id)), [executions])
  const exSelection = useRowSelection(executionIds)

  const banIds = useMemo(() => bans.map(b => String(b._id)), [bans])
  const banSelection = useRowSelection(banIds)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try { setStats(await adminApi.code.stats()) } finally { setLoading(false) }
  }, [])

  const loadExecutions = useCallback(async (page = 1) => {
    const data = await adminApi.code.executions({
      page, limit: 20,
      userId: filterUser || undefined,
      language: filterLang || undefined,
      status: filterStatus || undefined,
      from: filterFrom || undefined,
      to: filterTo || undefined,
    })
    setExecutions(data.executions)
    setExTotal(data.total); setExPage(data.page); setExPages(data.totalPages)
  }, [filterUser, filterLang, filterStatus, filterFrom, filterTo])

  const loadBans = useCallback(async () => {
    const data = await adminApi.code.bans({ limit: 50 })
    setBans(data.bans); setBanTotal(data.total)
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { if (tab === 'executions') loadExecutions(1) }, [tab, loadExecutions])
  useEffect(() => { if (tab === 'bans') loadBans() }, [tab, loadBans])

  async function handleToggleBan(userId: string, userName: string, currentlyBanned: boolean) {
    if (!currentlyBanned) { setBanTarget({ id: userId, name: userName }); return }
    setActionLoading(userId)
    try {
      await adminApi.code.toggleBan(userId)
      setBans(prev => prev.filter(b => b.userId !== userId))
      setBanTotal(t => t - 1)
      await loadStats()
    } finally { setActionLoading(null) }
  }

  async function confirmBan(reason: string) {
    if (!banTarget) return
    setActionLoading(banTarget.id)
    setBanTarget(null)
    try {
      await adminApi.code.toggleBan(banTarget.id, reason || undefined)
      await loadBans(); await loadStats()
    } finally { setActionLoading(null) }
  }

  async function handleBulkDeleteExecutions() {
    if (exSelection.count === 0) return
    setExBulkLoading(true)
    try {
      const res = await adminApi.code.bulkDeleteExecutions(exSelection.selectedIds)
      toast.success(`Deleted ${res.deleted} execution${res.deleted === 1 ? '' : 's'}`)
      setExBulkConfirm(false)
      exSelection.clear()
      loadExecutions(exPage)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setExBulkLoading(false) }
  }

  async function handleBulkDeleteBans() {
    if (banSelection.count === 0) return
    setBanBulkLoading(true)
    try {
      const res = await adminApi.code.bulkDeleteBans(banSelection.selectedIds)
      toast.success(`Removed ${res.deleted} ban${res.deleted === 1 ? '' : 's'}`)
      setBanBulkConfirm(false)
      banSelection.clear()
      await loadBans()
      await loadStats()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setBanBulkLoading(false) }
  }

  const TABS = [
    { id: 'overview',   label: 'Overview',   Icon: TrendingUp },
    { id: 'executions', label: 'Executions', Icon: Terminal },
    { id: 'bans',       label: `Bans (${stats?.bannedCount ?? 0})`, Icon: Ban },
  ] as const

  return (
    <>
    <div className="h-full overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Code Execution</h1>
            <p className="text-sm text-ink-faint">Monitor all code runs, track per-user activity, manage access</p>
          </div>
          <button onClick={loadStats} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline sm:w-auto">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex w-full flex-wrap gap-1 rounded-xl border border-hairline bg-paper p-1 sm:w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                tab === t.id ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink')}>
              <t.Icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-hairline" />)}
              </div>
            ) : stats && (
              <>
                {/* Stat cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <StatCard label="Total Runs"    value={stats.totalRuns}    sub="all time"          Icon={Terminal} />
                  <StatCard label="Successful"    value={stats.successRuns}  sub={`${stats.successRate}% success rate`} Icon={CheckCircle2} color="brand" />
                  <StatCard label="Failed"        value={stats.errorRuns}    sub="non-zero exit"     Icon={XCircle}  color="red" />
                  <StatCard label="Today"         value={stats.todayRuns}    sub={`${stats.todaySuccess} successful`} Icon={Calendar} color="amber" />
                  <StatCard label="Banned Users"  value={stats.bannedCount}  sub="access revoked"    Icon={Ban}      color="red" />
                  <StatCard label="Languages"     value={stats.byLanguage.length} sub="in use"       Icon={Layers} />
                  <StatCard label="Top Language"  value={stats.byLanguage[0]?._id ?? '-'} sub={`${stats.byLanguage[0]?.total ?? 0} runs`} Icon={TrendingUp} />
                  <StatCard label="Active Users"  value={stats.topUsers.length}  sub="by total runs" Icon={Users} />
                </div>

                {/* Charts row */}
                <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {/* Daily trend */}
                  <div className="col-span-1 rounded-xl border border-hairline bg-paper-elevated p-5 lg:col-span-2">
                    <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Daily Executions (30d)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={stats.dailyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                        <XAxis dataKey="_id" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: MUTED }} />
                        <YAxis tick={{ fontSize: 10, fill: MUTED }} allowDecimals={false} />
                        <Tooltip labelFormatter={(v) => fmtDate(String(v))} />
                        <Area type="monotone" dataKey="success" name="Success" stackId="1" fill={BRAND} stroke={BRAND} fillOpacity={0.5} />
                        <Area type="monotone" dataKey="error"   name="Error"   stackId="1" fill={ERROR} stroke={ERROR} fillOpacity={0.5} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Language breakdown */}
                  <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
                    <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">By Language</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={stats.byLanguage} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={70}
                          label={({ name, percent }) => `${String(name ?? '').split('-')[0]} ${Math.round((percent ?? 0) * 100)}%`}
                          labelLine={false}>
                          {stats.byLanguage.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top users */}
                <div className="rounded-xl border border-hairline bg-paper-elevated">
                  <div className="border-b border-hairline px-5 py-3">
                    <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Top Users by Executions</h3>
                  </div>
                  <div className="divide-y divide-hairline">
                    {stats.topUsers.map((u, i) => (
                      <div key={u._id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:gap-4">
                        <span className="w-5 shrink-0 font-mono text-[11px] font-bold text-ink-faint">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                          <p className="truncate text-xs text-ink-faint">{u.email}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-ink">{u.total}</span>
                          <span className="text-xs text-emerald-600">{u.success} ✓</span>
                          <span className="text-xs text-red-500">{u.total - u.success} ✗</span>
                          <button onClick={() => setDrillUser(u._id)}
                            className="flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[11px] text-ink-muted hover:bg-hairline hover:text-ink transition">
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button
                            onClick={() => handleToggleBan(u._id, u.name, false)}
                            disabled={actionLoading === u._id}
                            className="flex items-center gap-1 rounded-md border border-red-100 px-2 py-1 text-[11px] text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <Ban className="h-3 w-3" /> Ban
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── EXECUTIONS TAB ───────────────────────────────────────────────── */}
        {tab === 'executions' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <input value={filterUser} onChange={e => setFilterUser(e.target.value)} placeholder="User ID…"
                  className="h-8 w-full rounded-lg border border-hairline bg-paper pl-8 pr-3 text-xs outline-none focus:border-brand sm:w-36" />
              </div>
              <select value={filterLang} onChange={e => setFilterLang(e.target.value)}
                className="h-8 rounded-lg border border-hairline bg-paper px-2 text-xs outline-none focus:border-brand">
                <option value="">All languages</option>
                {stats?.byLanguage.map(l => <option key={l._id} value={l._id}>{l._id}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-8 rounded-lg border border-hairline bg-paper px-2 text-xs outline-none focus:border-brand">
                <option value="">All statuses</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                className="h-8 rounded-lg border border-hairline bg-paper px-2 text-xs outline-none focus:border-brand" />
              <span className="text-xs text-ink-faint">to</span>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                className="h-8 rounded-lg border border-hairline bg-paper px-2 text-xs outline-none focus:border-brand" />
              <button onClick={() => loadExecutions(1)}
                className="h-8 rounded-lg bg-brand px-3 text-xs font-semibold text-brand-foreground hover:opacity-90">
                Search
              </button>
              <button onClick={() => { setFilterUser(''); setFilterLang(''); setFilterStatus(''); setFilterFrom(''); setFilterTo('') }}
                className="h-8 rounded-lg border border-hairline px-3 text-xs text-ink-muted hover:bg-hairline">
                Clear
              </button>
              <span className="font-mono text-xs text-ink-faint sm:ml-auto">{exTotal} results</span>
            </div>

            <div className="space-y-3">
              <BulkActionBar
                count={exSelection.count}
                onClear={exSelection.clear}
                onDelete={() => setExBulkConfirm(true)}
                loading={exBulkLoading}
                label={exSelection.count === 1 ? 'execution selected' : 'executions selected'}
              />
              <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-hairline bg-hairline/40">
                      <th className="w-10 px-4 py-2.5">
                        <SelectCheckbox
                          checked={exSelection.allPageSelected}
                          indeterminate={exSelection.somePageSelected}
                          onChange={exSelection.togglePage}
                          title="Select all on page"
                          disabled={executions.length === 0}
                        />
                      </th>
                      {['User', 'Language', 'Status', 'Exit', 'Time (ms)', 'Memory', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {executions.map(ex => {
                      const id = String(ex._id)
                      return (
                        <tr
                          key={id}
                          className={cn(
                            'hover:bg-hairline/30 transition',
                            exSelection.isSelected(id) && 'bg-brand-tint/40',
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <SelectCheckbox
                              checked={exSelection.isSelected(id)}
                              onChange={() => exSelection.toggle(id)}
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="text-xs font-medium text-ink truncate max-w-[120px]">{ex.userName}</p>
                            <p className="text-[10px] text-ink-faint truncate max-w-[120px]">{ex.userEmail}</p>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{ex.language}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              ex.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                              {ex.status === 'success' ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                              {ex.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{ex.exitCode}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{ex.executionMs}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{Math.round(ex.memoryKb / 1024)} MB</td>
                          <td className="px-4 py-2.5 font-mono text-[10px] text-ink-faint">{fmtDate(ex.createdAt)}</td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => setDrillUser(ex.userId)}
                              className="rounded-md border border-hairline px-2 py-0.5 text-[10px] text-ink-muted hover:bg-hairline">
                              History
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {executions.length === 0 && (
                      <tr><td colSpan={9} className="py-12 text-center text-sm text-ink-faint">No executions found.</td></tr>
                    )}
                  </tbody>
                </table>
                </div>

                {exPages > 1 && (
                  <div className="flex items-center justify-center gap-3 border-t border-hairline px-4 py-3">
                    <button onClick={() => loadExecutions(exPage - 1)} disabled={exPage <= 1}
                      className="flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                      <ChevronLeft className="h-3 w-3" /> Prev
                    </button>
                    <span className="font-mono text-xs text-ink-faint">{exPage} / {exPages}</span>
                    <button onClick={() => loadExecutions(exPage + 1)} disabled={exPage >= exPages}
                      className="flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                      Next <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── BANS TAB ─────────────────────────────────────────────────────── */}
        {tab === 'bans' && (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">
                  <span className="font-semibold">{banTotal}</span> user{banTotal !== 1 ? 's' : ''} have code execution revoked
                </p>
              </div>
              <button onClick={loadBans} className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline sm:ml-auto">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            <div className="space-y-3">
              <BulkActionBar
                count={banSelection.count}
                onClear={banSelection.clear}
                onDelete={() => setBanBulkConfirm(true)}
                loading={banBulkLoading}
                label={banSelection.count === 1 ? 'ban selected' : 'bans selected'}
              />
              <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-hairline bg-hairline/40">
                      <th className="w-10 px-4 py-2.5">
                        <SelectCheckbox
                          checked={banSelection.allPageSelected}
                          indeterminate={banSelection.somePageSelected}
                          onChange={banSelection.togglePage}
                          title="Select all on page"
                          disabled={bans.length === 0}
                        />
                      </th>
                      {['User', 'Reason', 'Banned', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {bans.map(ban => {
                      const id = String(ban._id)
                      return (
                        <tr
                          key={id}
                          className={cn(
                            'hover:bg-hairline/30 transition',
                            banSelection.isSelected(id) && 'bg-brand-tint/40',
                          )}
                        >
                          <td className="px-4 py-3">
                            <SelectCheckbox
                              checked={banSelection.isSelected(id)}
                              onChange={() => banSelection.toggle(id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-ink">{ban.userName}</p>
                            <p className="text-xs text-ink-faint">{ban.userEmail}</p>
                            <p className="font-mono text-[9px] text-ink-faint/60">{ban.userId}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-ink-muted max-w-[260px]">
                            {ban.reason ?? <span className="italic text-ink-faint/50">No reason given</span>}
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-ink-faint">{fmtDate(ban.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setDrillUser(ban.userId)}
                                className="flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[11px] text-ink-muted hover:bg-hairline transition">
                                <Eye className="h-3 w-3" /> History
                              </button>
                              <button
                                onClick={() => handleToggleBan(ban.userId, ban.userName, true)}
                                disabled={actionLoading === ban.userId}
                                className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                              >
                                {actionLoading === ban.userId
                                  ? <RefreshCw className="h-3 w-3 animate-spin" />
                                  : <ShieldOff className="h-3 w-3" />}
                                Restore
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {bans.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center">
                        <Shield className="mx-auto mb-2 h-8 w-8 text-ink-faint/30" />
                        <p className="text-sm text-ink-faint">No users are currently banned from code execution.</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User daily drill-down */}
      {drillUser && <UserDrillDown userId={drillUser} onClose={() => setDrillUser(null)} />}

      {/* Ban confirmation modal */}
      {banTarget && (
        <BanModal
          userId={banTarget.id}
          userName={banTarget.name}
          onConfirm={confirmBan}
          onCancel={() => setBanTarget(null)}
        />
      )}

      <ConfirmModal
        open={exBulkConfirm}
        onClose={() => setExBulkConfirm(false)}
        onConfirm={handleBulkDeleteExecutions}
        title={`Delete ${exSelection.count} execution${exSelection.count === 1 ? '' : 's'}?`}
        description="Permanently delete the selected execution records. This cannot be undone."
        confirmLabel={`Delete ${exSelection.count}`}
        loading={exBulkLoading}
        icon={Trash2}
      />

      <ConfirmModal
        open={banBulkConfirm}
        onClose={() => setBanBulkConfirm(false)}
        onConfirm={handleBulkDeleteBans}
        title={`Remove ${banSelection.count} ban${banSelection.count === 1 ? '' : 's'}?`}
        description="Delete the selected ban records and restore code execution access for those users."
        confirmLabel={`Remove ${banSelection.count}`}
        loading={banBulkLoading}
        icon={Trash2}
      />
    </>
  )
}
