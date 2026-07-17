'use client'

import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrendPoint } from '@/types'

function fmtMins(m: number) {
  if (m <= 0) return '—'
  const h = Math.floor(m / 60)
  const rem = Math.round(m % 60)
  if (h > 0) return `${h}h ${rem}m`
  return `${m}m`
}

function CustomTooltip({ active, payload, label }: AnyProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-hairline bg-white px-3 py-2.5 shadow-lg">
      <p className="mb-0.5 text-[11px] font-semibold text-ink-faint">{label}</p>
      <p className="font-mono text-sm font-bold text-brand">
        {payload[0]?.value > 0 ? `${payload[0].value}m avg` : 'No sessions'}
      </p>
    </div>
  )
}

interface Props {
  trendData: TrendPoint[]
}

export function ImprovementTrend({ trendData }: Props) {
  const [mode, setMode] = useState<'raw' | 'rolling'>('rolling')

  const withRolling = useMemo(() => {
    return trendData.map((d, i) => {
      const window = trendData.slice(Math.max(0, i - 2), i + 1).filter(x => x.avgMinutes > 0)
      const rolling = window.length
        ? Math.round(window.reduce((s, x) => s + x.avgMinutes, 0) / window.length * 10) / 10
        : 0
      return { ...d, rolling }
    })
  }, [trendData])

  const activeData = withRolling.map(d => ({
    weekLabel:  d.weekLabel,
    value:      mode === 'raw' ? d.avgMinutes : d.rolling,
  }))

  const nonZero   = activeData.filter(d => d.value > 0)
  const overallAvg = nonZero.length
    ? Math.round(nonZero.reduce((s, d) => s + d.value, 0) / nonZero.length * 10) / 10
    : 0

  const last4 = nonZero.slice(-4)
  const prev4 = nonZero.slice(-8, -4)
  const last4Avg = last4.length ? last4.reduce((s, d) => s + d.value, 0) / last4.length : 0
  const prev4Avg = prev4.length ? prev4.reduce((s, d) => s + d.value, 0) / prev4.length : 0
  const isImproving = last4Avg > 0 && prev4Avg > 0 && last4Avg < prev4Avg

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Time Improvement Trend</h2>
          <p className="mt-0.5 text-[11px] text-ink-faint">Weekly avg session duration — lower is faster</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-hairline p-0.5">
            {(['raw', 'rolling'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors',
                  mode === m ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink',
                )}
              >
                {m === 'raw' ? 'Raw' : '3-wk avg'}
              </button>
            ))}
          </div>
          {/* Headline insight */}
          {last4Avg > 0 && prev4Avg > 0 && (
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
              isImproving ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
            )}>
              {isImproving
                ? <><TrendingDown size={11} /> Getting faster</>
                : <><TrendingUp   size={11} /> Taking more time</>}
            </div>
          )}
        </div>
      </div>

      {nonZero.length < 2 ? (
        <div className="flex h-44 items-center justify-center text-sm text-ink-faint">
          Complete more sessions across multiple weeks to see your trend
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={activeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2d6a4f" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#2d6a4f" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(activeData.length / 5)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v > 0 ? `${v}m` : ''}
            />
            {overallAvg > 0 && (
              <ReferenceLine
                y={overallAvg}
                stroke="#9CA3AF"
                strokeDasharray="4 4"
                label={{ value: `avg ${overallAvg}m`, position: 'right', fontSize: 9, fill: '#9CA3AF' }}
              />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2d6a4f"
              strokeWidth={2}
              fill="url(#trend-grad)"
              dot={false}
              activeDot={{ r: 4, fill: '#2d6a4f', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
