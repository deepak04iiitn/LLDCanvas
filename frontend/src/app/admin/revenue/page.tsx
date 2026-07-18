'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, IndianRupee, Calendar,
  Users, Sparkles, Crown, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { adminApi } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

const RANGE_OPTIONS = [
  { label: '7 days',  value: '7d'  },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '1 year',  value: '1y'  },
]

const PLAN_COLORS: Record<string, string> = {
  pro:      '#5B5BD6',
  ultimate: '#F59E0B',
  free:     '#94A3B8',
}

const PLAN_ICON = { free: Zap, pro: Sparkles, ultimate: Crown } as const

interface RevenueData {
  daily:        { _id: string; revenue: number; count: number }[]
  byPlan:       { _id: string; revenue: number; count: number }[]
  periodTotal:  number
  periodCount:  number
  allTimeTotal: number
  allTimeCount: number
  range:        string
}

function StatCard({ label, value, sub, icon: Icon, cls }: { label: string; value: string | number; sub?: string; icon: React.ElementType; cls?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-hairline bg-paper p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', cls ?? 'border-brand/20 bg-brand/10')}>
          <Icon className="h-4 w-4 text-brand" />
        </div>
        <p className="text-xs font-medium text-ink-muted">{label}</p>
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </motion.div>
  )
}

export default function AdminRevenuePage() {
  const [range,   setRange]   = useState('30d')
  const [data,    setData]    = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await adminApi.billing.revenue(range)
      setData(r)
    } catch { /* ignore */ }
    setLoading(false)
  }, [range])

  useEffect(() => { load() }, [load])

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-paper-elevated">
            <BarChart3 className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Revenue</h1>
            <p className="text-xs text-ink-muted">Subscription billing and MRR</p>
          </div>
        </div>

        {/* Range picker */}
        <div className="flex rounded-xl border border-hairline bg-paper-elevated p-1 gap-1">
          {RANGE_OPTIONS.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                range === r.value ? 'bg-paper shadow-sm text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex h-48 items-center justify-center text-sm text-ink-muted">Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={IndianRupee}
              label="Period Revenue"
              value={fmt(data.periodTotal)}
              sub={`${data.periodCount} payments`}
            />
            <StatCard
              icon={TrendingUp}
              label="All-Time Revenue"
              value={fmt(data.allTimeTotal)}
              sub={`${data.allTimeCount} total payments`}
              cls="border-emerald-200 bg-emerald-50"
            />
            <StatCard
              icon={Calendar}
              label="Avg per Payment"
              value={data.periodCount > 0 ? fmt(Math.round(data.periodTotal / data.periodCount)) : '₹0'}
              sub="This period"
              cls="border-violet-200 bg-violet-50"
            />
            <StatCard
              icon={Users}
              label="Revenue by Plans"
              value={data.byPlan.length}
              sub="Active billing plans"
              cls="border-amber-200 bg-amber-50"
            />
          </div>

          {/* Daily revenue chart */}
          <div className="rounded-xl border border-hairline bg-paper p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Daily Revenue (INR)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.daily} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5B5BD6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5B5BD6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(l: unknown) => String(l)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#5B5BD6" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row: by plan bar + pie */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Revenue by plan bar */}
            <div className="rounded-xl border border-hairline bg-paper p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Revenue by Plan</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.byPlan} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    formatter={(v: unknown) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(l: unknown) => String(l)}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {data.byPlan.map((entry) => (
                      <Cell key={entry._id} fill={PLAN_COLORS[entry._id] ?? '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Plan breakdown pie */}
            <div className="rounded-xl border border-hairline bg-paper p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Revenue Share</h2>
              {data.byPlan.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-ink-muted">No revenue data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.byPlan}
                      dataKey="revenue"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {data.byPlan.map(entry => (
                        <Cell key={entry._id} fill={PLAN_COLORS[entry._id] ?? '#94A3B8'} />
                      ))}
                    </Pie>
                    <Legend formatter={(v: string) => {
                      const PIcon = PLAN_ICON[v as keyof typeof PLAN_ICON]
                      return (
                        <span className="flex items-center gap-1 text-xs text-ink">
                          {PIcon && <PIcon className="h-3 w-3 inline" />}
                          {v}
                        </span>
                      )
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
