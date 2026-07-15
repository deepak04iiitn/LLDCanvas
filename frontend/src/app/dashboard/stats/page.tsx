'use client'

import { useEffect, useState } from 'react'
import {
  Timer, CheckCircle2, Flame, LayoutDashboard,
} from 'lucide-react'
import { AppShell } from '@/components/dashboard/AppShell'
import { ActivityCalendar } from '@/components/stats/ActivityCalendar'
import { TimeChart } from '@/components/stats/TimeChart'
import { StreakPanel } from '@/components/stats/StreakPanel'
import { api } from '@/lib/api'
import type { PracticeStats } from '@/types'
import { cn } from '@/lib/utils'

function fmtTotalTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  Icon: typeof Timer
  accent: string
  iconBg: string
}

function StatCard({ label, value, sub, Icon, accent, iconBg }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white
                    p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className={cn('mt-2 text-3xl font-black tabular-nums', accent)}>{value}</p>
          {sub && <p className="mt-1 text-[11px] text-gray-400">{sub}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', iconBg)}>
          <Icon className={cn('h-5 w-5', accent)} />
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
}

export default function StatsPage() {
  const [stats,   setStats]   = useState<PracticeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats.get()
      .then(setStats)
      .catch(() => {/* silent */})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
            <p className="mt-1 text-sm text-gray-400">
              Track your LLD practice over time
            </p>
          </div>

          {/* ── Stat cards ──────────────────────────────────────────────────── */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : stats ? (
              <>
                <StatCard
                  label="Total practice time"
                  value={fmtTotalTime(stats.totalTimeSeconds)}
                  Icon={Timer}
                  accent="text-indigo-600"
                  iconBg="bg-indigo-50"
                />
                <StatCard
                  label="Sessions completed"
                  value={String(stats.totalSessions)}
                  Icon={CheckCircle2}
                  accent="text-emerald-600"
                  iconBg="bg-emerald-50"
                />
                <StatCard
                  label="Current streak"
                  value={`${stats.currentStreakDays} 🔥`}
                  sub={stats.longestStreakDays ? `Best: ${stats.longestStreakDays} days` : undefined}
                  Icon={Flame}
                  accent="text-amber-500"
                  iconBg="bg-amber-50"
                />
                <StatCard
                  label="Diagrams created"
                  value={"—"}
                  sub="See My Diagrams"
                  Icon={LayoutDashboard}
                  accent="text-sky-600"
                  iconBg="bg-sky-50"
                />
              </>
            ) : null}
          </div>

          {/* ── Streak panel ─────────────────────────────────────────────────── */}
          {stats && (
            <div className="mb-8">
              <StreakPanel stats={stats} />
            </div>
          )}

          {/* ── Time chart ───────────────────────────────────────────────────── */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-gray-800">Daily practice time</h2>
            <p className="mb-5 text-[11px] text-gray-400">Minutes practiced per day</p>
            {loading ? (
              <div className="h-44 animate-pulse rounded-xl bg-gray-100" />
            ) : stats ? (
              <TimeChart activity={stats.dailyActivity} />
            ) : null}
          </div>

          {/* ── Activity calendar ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-gray-800">Activity calendar</h2>
            <p className="mb-5 text-[11px] text-gray-400">One year of practice history</p>
            {loading ? (
              <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
            ) : stats ? (
              <ActivityCalendar activity={stats.dailyActivity} />
            ) : null}
          </div>

        </div>
      </div>
    </AppShell>
  )
}
