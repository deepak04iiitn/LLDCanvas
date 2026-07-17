'use client'

import { TrendingDown, TrendingUp, Minus, Clock } from 'lucide-react'
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
} from 'recharts'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any
import { cn } from '@/lib/utils'
import type { AdvancedStats } from '@/types'

function fmtSeconds(s: number) {
  if (s <= 0) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec > 0 ? `${sec}s` : ''}`
  return `${sec}s`
}

function SparkTooltip({ active, payload }: AnyProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-hairline bg-white px-2.5 py-1.5 shadow-lg text-[11px]">
      <span className="font-semibold text-ink">{payload[0]?.payload?.weekLabel}</span>
      <p className="text-brand font-bold">{payload[0]?.value}m avg</p>
    </div>
  )
}

interface Props {
  data: AdvancedStats
}

export function AvgTimePanel({ data }: Props) {
  const { avgTimePerSession, avgTimeThisWeek, avgTimeLastWeek, improvementPercent, trendData } = data

  const sparkData = trendData.slice(-8)

  const improving = improvementPercent !== null && improvementPercent > 0
  const same      = improvementPercent === null || improvementPercent === 0
  const regressing = improvementPercent !== null && improvementPercent < 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Overall avg */}
      <div className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              Avg Time / Session
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-brand">
              {fmtSeconds(avgTimePerSession)}
            </p>
            <p className="mt-1 text-[11px] text-ink-faint">all completed sessions</p>
          </div>
          <div className="rounded-xl bg-brand/8 p-2.5">
            <Clock size={18} className="text-brand" />
          </div>
        </div>
      </div>

      {/* This week vs last week */}
      <div className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          This Week vs Last
        </p>
        <div className="mt-2 flex items-end gap-3">
          <p className="text-3xl font-black tabular-nums text-ink">
            {fmtSeconds(avgTimeThisWeek)}
          </p>
          {avgTimeLastWeek > 0 && (
            <p className="mb-1 text-sm text-ink-faint line-through">
              {fmtSeconds(avgTimeLastWeek)}
            </p>
          )}
        </div>
        {improvementPercent !== null && (
          <div className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            improving  ? 'bg-emerald-50 text-emerald-600' :
            regressing ? 'bg-red-50 text-red-500' :
                         'bg-hairline text-ink-faint',
          )}>
            {improving  ? <TrendingDown size={11} /> :
             regressing ? <TrendingUp   size={11} /> :
                          <Minus        size={11} />}
            {improving  ? `${improvementPercent}% faster this week` :
             regressing ? `${Math.abs(improvementPercent)}% slower this week` :
                          'Same pace as last week'}
          </div>
        )}
        {improvementPercent === null && (
          <p className="mt-2 text-[11px] text-ink-faint">Not enough data yet</p>
        )}
      </div>

      {/* Sparkline card */}
      <div className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">
          8-Week Sparkline
        </p>
        {sparkData.some(d => d.avgMinutes > 0) ? (
          <ResponsiveContainer width="100%" height={70}>
            <LineChart data={sparkData}>
              <Tooltip content={<SparkTooltip />} cursor={false} />
              <Line
                type="monotone"
                dataKey="avgMinutes"
                stroke="var(--color-brand, #2d6a4f)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--color-brand, #2d6a4f)', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[70px] items-center justify-center text-xs text-ink-faint">
            Complete more sessions to see trends
          </div>
        )}
        <p className="mt-1.5 text-[10px] text-ink-faint">Avg minutes per session per week</p>
      </div>
    </div>
  )
}
