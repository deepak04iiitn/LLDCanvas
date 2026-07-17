'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  Users, FileText, Timer, Clock, TrendingUp, Shield,
  Activity, CheckCircle, Radio, RefreshCw, ArrowUpRight,
  RotateCcw, Eye, BookOpen, Layers, MessageSquareText,
  Share2, GitBranch, UserCheck, Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { adminApi, type OverviewStats, type OverviewCharts } from '@/lib/admin-api'

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND   = '#3D6A52'
const GOLD    = '#B5874B'
const MUTED   = '#9CA3AF'
const PIE_COLOURS = ['#3D6A52', '#B5874B', '#E5E7EB']

function fmtSeconds(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function fmtDate(iso: string) {
  try { return format(parseISO(iso), 'MMM d') } catch { return iso }
}

function fmtHour(iso: string) {
  try { return format(parseISO(iso), 'HH:mm') } catch { return iso }
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, Icon, accent = false, live = false,
}: {
  label: string; value: string | number; sub?: string
  Icon: typeof Users; accent?: boolean; live?: boolean
}) {
  return (
    <div className={`relative flex items-start gap-4 rounded-xl border bg-paper-elevated p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] ${live ? 'border-brand/30 ring-1 ring-brand/10' : 'border-hairline'}`}>
      {live && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-brand">
          <Radio className="h-2.5 w-2.5 animate-pulse" /> Live
        </span>
      )}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-brand text-brand-foreground' : 'bg-brand-tint text-brand'}`}>
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

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-hairline bg-paper-elevated p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] ${className}`}>
      <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">{title}</h3>
      {children}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type LiveMetrics    = Awaited<ReturnType<typeof adminApi.analytics>>
type FeatureStats   = Awaited<ReturnType<typeof adminApi.featureStats>>

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [stats,        setStats]        = useState<OverviewStats | null>(null)
  const [charts,       setCharts]       = useState<OverviewCharts | null>(null)
  const [live,         setLive]         = useState<LiveMetrics | null>(null)
  const [featureStats, setFeatureStats] = useState<FeatureStats | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [liveLoading,  setLiveLoading]  = useState(true)

  const loadOverview = useCallback(async () => {
    try {
      const [data, fs] = await Promise.all([
        adminApi.overview(),
        adminApi.featureStats(),
      ])
      setStats(data.stats)
      setCharts(data.charts)
      setFeatureStats(fs)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLive = useCallback(async () => {
    setLiveLoading(true)
    try {
      const data = await adminApi.analytics()
      setLive(data)
    } finally {
      setLiveLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOverview()
    loadLive()
    const timer = setInterval(loadLive, 30_000)
    return () => clearInterval(timer)
  }, [loadOverview, loadLive])

  if (loading || !stats || !charts) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    )
  }

  const userGrowthData  = charts.userGrowth.map(d => ({ date: fmtDate(d._id), users: d.count }))
  const diagramData     = charts.diagramActivity.map(d => ({ date: fmtDate(d._id), diagrams: d.count }))
  const sessionData     = charts.sessionActivity.map(d => ({ date: fmtDate(d._id), sessions: d.count }))
  const hourlyData      = live?.hourlyActiveUsers.map(h => ({ hour: fmtHour(h.hour), users: h.users })) ?? []
  const returningData   = live ? [
    { name: 'New',       value: live.newSessions },
    { name: 'Returning', value: live.returningSessions },
  ] : []

  return (
    <div className="space-y-8 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Platform Overview</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Real-time and 30-day metrics across all users.</p>
        </div>
        <button
          onClick={() => { loadOverview(); loadLive() }}
          className="flex items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-muted transition-all hover:bg-hairline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── Live / Behavioural section ────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Radio className="h-4 w-4 animate-pulse text-brand" />
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Live &amp; Engagement Metrics
          </h2>
          {!liveLoading && (
            <span className="ml-auto font-mono text-[10px] text-ink-faint">
              auto-refreshes every 30 s
            </span>
          )}
        </div>

        {liveLoading && !live ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : live ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Live users"         value={live.live}                               Icon={Radio}        live sub="online right now" />
              <StatCard label="DAU"                value={live.dau.toLocaleString()}               Icon={Activity}     sub="unique visitors today" />
              <StatCard label="WAU"                value={live.wau.toLocaleString()}               Icon={TrendingUp}   sub="unique visitors this week" />
              <StatCard label="MAU"                value={live.mau.toLocaleString()}               Icon={Users}        sub="unique visitors this month" />
              <StatCard label="Avg session"        value={fmtSeconds(live.avgSessionSeconds)}      Icon={Clock}        sub="time on site per visit" />
              <StatCard label="Total time"         value={fmtSeconds(live.totalTimeSeconds)}       Icon={Clock}        accent sub="all users, last 30 days" />
              <StatCard label="Return rate"        value={`${live.returningRate}%`}                Icon={RotateCcw}    sub={`${live.returningSessions} returning sessions`} />
              <StatCard label="New sessions"       value={live.newSessions.toLocaleString()}       Icon={ArrowUpRight} sub="first-time visitors" />
            </div>

            {/* Live charts */}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <ChartCard title="Active users — last 24 h" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={BRAND} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    <Area type="monotone" dataKey="users" stroke={BRAND} strokeWidth={2} fill="url(#hg)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="New vs Returning (30 days)">
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={returningData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {returningData.map((_, i) => (
                          <Cell key={i} fill={[BRAND, GOLD][i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex gap-4">
                    {returningData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: [BRAND, GOLD][i] }} />
                        <span className="text-xs text-ink-faint">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Top pages */}
            {live.topPages.length > 0 && (
              <div className="mt-4">
                <ChartCard title="Top pages — last 30 days">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {live.topPages.map((p, i) => (
                      <div key={p.page} className="flex items-center gap-3 rounded-lg border border-hairline bg-paper px-3 py-2">
                        <span className="font-mono text-[11px] font-bold text-ink-faint w-5 shrink-0">#{i + 1}</span>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <Eye className="h-3 w-3 shrink-0 text-ink-faint" />
                          <span className="truncate font-mono text-xs text-ink">{p.page || '/'}</span>
                        </div>
                        <span className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
                          {p.views}
                        </span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ── Platform stats ───────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Platform Stats
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total users"    value={stats.totalUsers.toLocaleString()}          Icon={Users}         sub={`${stats.newToday} joined today`} />
          <StatCard label="Active today"   value={stats.activeToday.toLocaleString()}         Icon={Activity}      sub={`${stats.newThisWeek} new this week`} />
          <StatCard label="Total UML diagrams" value={stats.totalDiagrams.toLocaleString()}       Icon={FileText}      sub={`${stats.newDiagramsToday} created today`} />
          <StatCard label="Practice time"  value={fmtSeconds(stats.totalPracticeSeconds)}     Icon={Clock}         sub="all users" accent />
          <StatCard label="Total sessions" value={stats.totalSessions.toLocaleString()}       Icon={Timer}         sub={`${stats.completedSessions} completed`} />
          <StatCard label="Completed"      value={stats.completedSessions.toLocaleString()}   Icon={CheckCircle} />
          <StatCard label="Blocked users"  value={stats.blockedCount.toLocaleString()}        Icon={Shield} />
          <StatCard label="User growth"    value={`+${stats.newThisWeek}`}                    Icon={TrendingUp}    sub="this week" />
        </div>
      </div>

      {/* ── 30-day trend charts ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="User registrations — 30 days">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BRAND} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Area type="monotone" dataKey="users" stroke={BRAND} strokeWidth={2} fill="url(#ug)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="UML Diagrams created — 30 days">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={diagramData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="diagrams" fill={BRAND} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Session activity — 30 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="sa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GOLD} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Area type="monotone" dataKey="sessions" stroke={GOLD} strokeWidth={2} fill="url(#sa)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid gap-4">
          <ChartCard title="Session status">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={charts.sessionStatus} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" paddingAngle={3}>
                    {charts.sessionStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {charts.sessionStatus.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLOURS[i] }} />
                    <span className="text-[10px] text-ink-faint">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Top users by UML diagrams">
            <div className="space-y-2">
              {charts.topUsers.slice(0, 4).map((u, i) => (
                <div key={u.id} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 font-mono text-[10px] font-bold text-ink-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{u.name}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand">
                    {u.diagrams}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── Feature Modules ─────────────────────────────────────────────────── */}
      {featureStats && (
        <>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                Feature Modules
              </h2>
            </div>

            {/* Problems & Solutions */}
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Practice Problems"  value={featureStats.problems.active}               Icon={BookOpen}          sub={`${featureStats.problems.inactive} inactive`} />
              <StatCard label="Total Solutions"    value={featureStats.solutions.total.toLocaleString()} Icon={Trophy}          sub={`${featureStats.solutions.submitted} submitted`} />
              <StatCard label="Revision Notes"     value={featureStats.revision.activeNotes}          Icon={Layers}            sub={`${featureStats.revision.totalRevisions} revisions done`} />
              <StatCard label="Bookmarked Notes"   value={featureStats.revision.totalBookmarks}       Icon={Layers}            sub="by all users" accent />
            </div>

            {/* Collaboration & Sharing */}
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Active Collabs"     value={featureStats.collab.accepted}               Icon={UserCheck}         sub={`${featureStats.collab.pending} pending invites`} />
              <StatCard label="Discussions"        value={featureStats.collab.totalComments}          Icon={MessageSquareText} sub={`${featureStats.collab.resolvedComments} resolved`} />
              <StatCard label="Shared Diagrams"    value={featureStats.sharing.totalShared}           Icon={Share2}            sub={`${featureStats.sharing.public} public`} />
              <StatCard label="Version Snapshots"  value={featureStats.versions.total.toLocaleString()} Icon={GitBranch}       sub="diagram saves tracked" accent />
            </div>

            {/* Charts row */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Problems by difficulty */}
              <ChartCard title="Problems by difficulty">
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={featureStats.problems.problemsByDifficulty.map(d => ({ name: d._id, value: d.count }))}
                        cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}
                      >
                        {featureStats.problems.problemsByDifficulty.map((d, i) => (
                          <Cell key={i} fill={d._id === 'easy' ? '#22c55e' : d._id === 'medium' ? GOLD : '#ef4444'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-3">
                    {featureStats.problems.problemsByDifficulty.map(d => (
                      <div key={d._id} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: d._id === 'easy' ? '#22c55e' : d._id === 'medium' ? GOLD : '#ef4444' }} />
                        <span className="text-[10px] capitalize text-ink-faint">{d._id} ({d.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>

              {/* Revision by category */}
              <ChartCard title="Revision notes by category">
                <div className="space-y-1.5">
                  {featureStats.revision.revisionByCategory.slice(0, 6).map((c, i) => (
                    <div key={c._id} className="flex items-center gap-2">
                      <span className="w-4 shrink-0 font-mono text-[10px] font-bold text-ink-faint">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-ink capitalize">{c._id}</p>
                        <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-hairline">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${Math.round((c.total / (featureStats.revision.totalNotes || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand">{c.total}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              {/* Top attempted problems */}
              <ChartCard title="Most attempted problems">
                <div className="space-y-2">
                  {featureStats.problems.topProblems.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 shrink-0 font-mono text-[10px] font-bold text-ink-faint">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-ink">{p.title}</p>
                        <p className="text-[10px] text-ink-faint capitalize">{p.difficulty} · {p.submitted} submitted</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand">{p.attempts}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Quick-nav cards to management pages */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { href: '/admin/problems',  Icon: BookOpen,          label: 'Manage Problems',        sub: `${featureStats.problems.total} total`,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { href: '/admin/revision',  Icon: Layers,            label: 'Manage Revision Notes',  sub: `${featureStats.revision.totalNotes} notes`, color: 'text-violet-600', bg: 'bg-violet-50' },
                { href: '/admin/collab',    Icon: MessageSquareText, label: 'Collaboration Hub',      sub: `${featureStats.collab.totalComments} discussions`, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(nav => (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className="flex items-center gap-3 rounded-xl border border-hairline bg-paper-elevated p-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition hover:shadow-md hover:border-brand/20"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${nav.bg}`}>
                    <nav.Icon className={`h-4 w-4 ${nav.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">{nav.label}</p>
                    <p className="text-[10px] text-ink-faint">{nav.sub}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-ink-faint" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
