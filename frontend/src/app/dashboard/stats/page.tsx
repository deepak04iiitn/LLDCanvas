'use client'

import { useEffect, useState } from 'react'
import { Timer, CheckCircle2, Flame, LayoutDashboard, Clock, TrendingUp, Trophy, Lock, Sparkles, Crown, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/dashboard/AppShell'
import { ActivityCalendar } from '@/components/stats/ActivityCalendar'
import { TimeChart } from '@/components/stats/TimeChart'
import { StreakPanel } from '@/components/stats/StreakPanel'
import { AvgTimePanel } from '@/components/stats/AvgTimePanel'
import { ImprovementTrend } from '@/components/stats/ImprovementTrend'
import { WeeklyReport } from '@/components/stats/WeeklyReport'
import { MonthlyReport } from '@/components/stats/MonthlyReport'
import { PersonalBests } from '@/components/stats/PersonalBests'
import { api } from '@/lib/api'
import type { PracticeStats, AdvancedStats } from '@/types'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'
import Link from 'next/link'

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTotalTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

// ─── Stat card (Overview tab) ────────────────────────────────────────────────

interface StatCardProps {
  label: string; value: string; sub?: string
  Icon: typeof Timer; accent: string; iconBg: string
}

function StatCard({ label, value, sub, Icon, accent, iconBg }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
          <p className={cn('mt-2 text-3xl font-black tabular-nums', accent)}>{value}</p>
          {sub && <p className="mt-1 text-[11px] text-ink-faint">{sub}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', iconBg)}>
          <Icon className={cn('h-5 w-5', accent)} />
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-hairline" />
}

function SkeletonBlock({ h = 'h-48' }: { h?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-hairline', h)} />
}

// ─── Tab definition ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'avg-time' | 'reports' | 'bests'

const TABS: { id: Tab; label: string; Icon: typeof Clock }[] = [
  { id: 'overview',  label: 'Overview',       Icon: LayoutDashboard },
  { id: 'avg-time',  label: 'Avg Time',        Icon: Clock           },
  { id: 'reports',   label: 'Reports',         Icon: TrendingUp      },
  { id: 'bests',     label: 'Personal Bests',  Icon: Trophy          },
]

// ─── Page ────────────────────────────────────────────────────────────────────

// ─── Plan gate wrapper ────────────────────────────────────────────────────────
function PlanLockedTab({ label, requiredPlan }: { label: string; requiredPlan: 'pro' | 'ultimate' }) {
  const badge = requiredPlan === 'ultimate'
    ? { icon: Crown, cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Ultimate' }
    : { icon: Sparkles, cls: 'bg-brand/10 text-brand border-brand/20', label: 'Pro' }
  const BadgeIcon = badge.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
        <Lock className="h-7 w-7 text-amber-500" />
      </div>
      <span className={cn('mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', badge.cls)}>
        <BadgeIcon className="h-3 w-3" /> {badge.label} Feature
      </span>
      <h3 className="mb-2 text-lg font-semibold text-ink">{label}</h3>
      <p className="mb-6 max-w-xs text-sm text-ink-muted">
        Upgrade your plan to unlock {label.toLowerCase()} and other advanced analytics.
      </p>
      <Link
        href="/pricing"
        className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
      >
        Upgrade to {badge.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}

export default function StatsPage() {
  const [stats,    setStats]    = useState<PracticeStats | null>(null)
  const [advanced, setAdvanced] = useState<AdvancedStats | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [advLoad,  setAdvLoad]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('overview')
  const { plan, isFree, isUltimate } = usePlan()

  useEffect(() => {
    api.stats.get()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))

    if (!isFree) {
      api.stats.getAdvanced()
        .then(setAdvanced)
        .catch(() => {})
        .finally(() => setAdvLoad(false))
    } else {
      setAdvLoad(false)
    }
  }, [isFree])

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-hairline bg-paper-elevated px-6 pt-5 pb-0">
          <h1 className="text-lg font-semibold text-ink">Your Progress</h1>
          <p className="mt-0.5 mb-4 text-xs text-ink-faint">
            Track your LLD practice, time trends &amp; personal records
          </p>

          {/* Tab bar */}
          <div className="flex items-center gap-0.5">
            {TABS.map(t => {
              // Lock advanced tabs based on plan
              const requiresPro = t.id === 'avg-time'
              const requiresUlt = t.id === 'reports' || t.id === 'bests'
              const locked = (requiresPro && isFree) || (requiresUlt && !isUltimate)
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                    tab === t.id
                      ? 'border-brand text-brand bg-brand/5'
                      : 'border-transparent text-ink-faint hover:text-ink hover:bg-hairline/60',
                  )}
                >
                  <t.Icon size={13} />
                  {t.label}
                  {locked && <Lock className="h-3 w-3 text-amber-400" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">

            {/* ── Overview tab ───────────────────────────────────────────── */}
            {tab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 max-w-5xl"
              >
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                        label="Problems attempted"
                        value={advanced ? String(advanced.personalBests.totalProblems) : '—'}
                        sub="across all categories"
                        Icon={LayoutDashboard}
                        accent="text-sky-600"
                        iconBg="bg-sky-50"
                      />
                    </>
                  ) : null}
                </div>

                {/* Streak panel */}
                {loading ? <SkeletonBlock h="h-24" /> : stats && <StreakPanel stats={stats} />}

                {/* Daily time chart */}
                <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-sm font-semibold text-ink">Daily practice time</h2>
                  <p className="mb-5 text-[11px] text-ink-faint">Minutes practiced per day</p>
                  {loading
                    ? <div className="h-44 animate-pulse rounded-xl bg-hairline" />
                    : stats && <TimeChart activity={stats.dailyActivity} />}
                </div>

                {/* Activity calendar */}
                <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
                  <h2 className="mb-1 text-sm font-semibold text-ink">Activity calendar</h2>
                  <p className="mb-5 text-[11px] text-ink-faint">One year of practice history</p>
                  {loading
                    ? <div className="h-28 animate-pulse rounded-xl bg-hairline" />
                    : stats && <ActivityCalendar activity={stats.dailyActivity} />}
                </div>
              </motion.div>
            )}

            {/* ── Avg Time tab ────────────────────────────────────────────── */}
            {tab === 'avg-time' && (
              isFree ? (
                <PlanLockedTab key="avg-time-locked" label="Average Time Analytics" requiredPlan="pro" />
              ) : (
                <motion.div
                  key="avg-time"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 max-w-5xl"
                >
                  {advLoad ? (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <SkeletonBlock /> <SkeletonBlock /> <SkeletonBlock />
                      </div>
                      <SkeletonBlock h="h-56" />
                    </>
                  ) : advanced ? (
                    <>
                      <AvgTimePanel data={advanced} />
                      <ImprovementTrend trendData={advanced.trendData} />
                    </>
                  ) : (
                    <p className="text-sm text-ink-faint">Could not load analytics.</p>
                  )}
                </motion.div>
              )
            )}

            {/* ── Reports tab ─────────────────────────────────────────────── */}
            {tab === 'reports' && (
              !isUltimate ? (
                <PlanLockedTab key="reports-locked" label="Weekly & Monthly Reports" requiredPlan="ultimate" />
              ) : (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 max-w-5xl"
                >
                  {advLoad ? (
                    <><SkeletonBlock h="h-72" /><SkeletonBlock h="h-72" /></>
                  ) : advanced ? (
                    <>
                      <WeeklyReport  reports={advanced.weeklyReports} />
                      <MonthlyReport reports={advanced.monthlyReports} />
                    </>
                  ) : (
                    <p className="text-sm text-ink-faint">Could not load reports.</p>
                  )}
                </motion.div>
              )
            )}

            {/* ── Personal Bests tab ──────────────────────────────────────── */}
            {tab === 'bests' && (
              !isUltimate ? (
                <PlanLockedTab key="bests-locked" label="Personal Best Records" requiredPlan="ultimate" />
              ) : (
                <motion.div
                  key="bests"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-5xl"
                >
                  {advLoad ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[...Array(6)].map((_, i) => <SkeletonBlock key={i} h="h-32" />)}
                    </div>
                  ) : advanced ? (
                    <PersonalBests bests={advanced.personalBests} />
                  ) : (
                    <p className="text-sm text-ink-faint">Could not load records.</p>
                  )}
                </motion.div>
              )
            )}

          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  )
}
