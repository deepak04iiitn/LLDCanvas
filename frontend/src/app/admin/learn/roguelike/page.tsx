'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Gamepad2, Users, CheckCircle2, Clock, TrendingUp,
  RefreshCw, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { adminApi } from '@/lib/admin-api'
import { toast } from 'sonner'

const BRAND = '#3D6A52'
const MUTED = '#9CA3AF'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

function StatCard({ label, value, sub, Icon, accent }: {
  label: string; value: string | number; sub?: string; Icon: React.ElementType; accent?: boolean
}) {
  return (
    <div className={`flex items-start gap-4 rounded-xl border bg-paper-elevated p-5 ${accent ? 'border-brand/30' : 'border-hairline'}`}>
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

export default function AdminLearnRoguelikePage() {
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof adminApi.sessions.list>> | null>(null)
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.sessions.list({ limit: 50 })
      setSessions(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const roguelikeSessions = sessions?.sessions ?? []
  const total     = sessions?.total ?? 0
  const completed = roguelikeSessions.filter(s => s.status === 'completed').length
  const active    = roguelikeSessions.filter(s => s.status === 'active').length

  // Daily bar data from recent sessions
  const dayMap: Record<string, number> = {}
  for (const s of roguelikeSessions) {
    const day = s.createdAt?.slice(0, 10) ?? ''
    if (day) dayMap[day] = (dayMap[day] ?? 0) + 1
  }
  const barData = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, runs]) => ({ date: date.slice(5), runs }))

  return (
    <div className="space-y-8 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
            <Gamepad2 size={18} className="text-rose-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-medium text-ink">LLD Roguelike</h1>
            <p className="mt-0.5 text-sm text-ink-faint">Run analytics and player activity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-muted hover:bg-hairline transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <Link href="/admin/features"
            className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-sm text-ink-muted hover:bg-hairline transition-colors">
            All Features <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total runs"   value={total}     sub="all time"                     Icon={Gamepad2}     accent />
          <StatCard label="Completed"    value={completed} sub={`${Math.round((completed / Math.max(roguelikeSessions.length, 1)) * 100)}% of recent`} Icon={CheckCircle2} />
          <StatCard label="Active now"   value={active}    sub="in-progress runs"             Icon={TrendingUp} />
          <StatCard label="Players"      value={total}     sub="unique run attempts"           Icon={Users} />
        </div>
      )}

      {/* Activity chart */}
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-4">Daily runs — last 14 days</p>
        {loading ? (
          <Skeleton className="h-48" />
        ) : barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="runs" fill={BRAND} radius={[3, 3, 0, 0]} name="Runs" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-ink-faint">No run data yet</p>
          </div>
        )}
      </div>

      {/* Recent runs table */}
      <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
        <div className="border-b border-hairline px-5 py-3 bg-hairline/30">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Recent runs</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : roguelikeSessions.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-faint">No runs recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-hairline">
                  {['Player', 'Status', 'Duration', 'Started'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roguelikeSessions.slice(0, 20).map(s => (
                  <tr key={s.id} className="border-b border-hairline hover:bg-hairline/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{s.user?.name ?? '—'}</p>
                      <p className="text-[11px] text-ink-faint">{s.user?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold capitalize
                        ${s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          s.status === 'active'    ? 'bg-brand-tint text-brand' :
                                                     'bg-hairline text-ink-faint'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {s.timeElapsed ? `${Math.floor(s.timeElapsed / 60)}m` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note about scenario authoring */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
        <Gamepad2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Scenario authoring</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Roguelike scenario configs are managed through the backend CMS. A dedicated authoring UI is planned for a future release.
          </p>
        </div>
      </div>

    </div>
  )
}
