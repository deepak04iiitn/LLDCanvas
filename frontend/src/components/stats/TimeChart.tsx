'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RechartsTooltipProps = any
import { subDays, format, eachDayOfInterval } from 'date-fns'
import type { DailyActivity } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  activity: DailyActivity[]
}

type Range = 14 | 30 | 'all'

const RANGES: { label: string; value: Range }[] = [
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: 'All time', value: 'all' },
]

function CustomTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null
  const mins = (payload[0]?.value as number | undefined) ?? 0
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="mb-0.5 text-[11px] font-semibold text-gray-500">{label}</p>
      <p className="font-mono text-sm font-bold text-indigo-600">
        {mins < 1 ? `${Math.round(mins * 60)}s` : `${Math.round(mins)} min`}
      </p>
    </div>
  )
}

export function TimeChart({ activity }: Props) {
  const [range, setRange] = useState<Range>(14)

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    activity.forEach(d => m.set(d.date, d.timeSeconds))
    return m
  }, [activity])

  const data = useMemo(() => {
    const today = new Date()
    let days: Date[]

    if (range === 'all') {
      if (!activity.length) return []
      const oldest = activity.reduce((a, b) => (a.date < b.date ? a : b))
      days = eachDayOfInterval({ start: new Date(oldest.date), end: today })
    } else {
      days = eachDayOfInterval({ start: subDays(today, range - 1), end: today })
    }

    return days.map(d => {
      const key = format(d, 'yyyy-MM-dd')
      const secs = activityMap.get(key) ?? 0
      return {
        date:  format(d, range === 14 ? 'MMM d' : 'MMM d'),
        mins:  Math.round(secs / 60 * 10) / 10,
      }
    })
  }, [activity, activityMap, range])

  return (
    <div>
      {/* Range toggle */}
      <div className="mb-5 flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        {RANGES.map(r => (
          <button
            key={String(r.value)}
            onClick={() => setRange(r.value)}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-all duration-150',
              range === r.value
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="indigo-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6366F1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F3F4F6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            interval={data.length > 20 ? Math.floor(data.length / 10) : 'preserveStartEnd'}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}m`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E0E7FF', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="mins"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#indigo-grad)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
