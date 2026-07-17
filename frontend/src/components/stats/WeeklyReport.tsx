'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any
import { cn } from '@/lib/utils'
import type { WeeklyReport as WR } from '@/types'

function fmtTime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return s > 0 ? `${s}s` : '—'
}

function CustomTooltip({ active, payload, label }: AnyProps) {
  if (!active || !payload?.length) return null
  const sessions = payload.find((p: AnyProps) => p.dataKey === 'sessions')?.value ?? 0
  const mins     = payload.find((p: AnyProps) => p.dataKey === 'avgMins')?.value ?? 0
  return (
    <div className="rounded-xl border border-hairline bg-white px-3.5 py-3 shadow-xl text-xs">
      <p className="mb-1.5 font-semibold text-ink">{label}</p>
      <p className="text-brand">
        <span className="inline-block w-20 text-ink-faint">Sessions:</span>
        <span className="font-bold">{sessions}</span>
      </p>
      <p className="text-violet-600">
        <span className="inline-block w-20 text-ink-faint">Avg time:</span>
        <span className="font-bold">{mins > 0 ? `${mins}m` : '—'}</span>
      </p>
    </div>
  )
}

interface Props {
  reports: WR[]
}

type Range = 4 | 12

export function WeeklyReport({ reports }: Props) {
  const [range, setRange] = useState<Range>(12)

  const data = useMemo(() => {
    const slice = reports.slice(-range)
    return slice.map(r => ({
      label:    r.weekLabel.split('–')[0].trim(),
      sessions: r.sessions,
      avgMins:  r.avgTimeSeconds > 0 ? Math.round(r.avgTimeSeconds / 60) : 0,
      problems: r.problemsSolved,
    }))
  }, [reports, range])

  const bestWeek = reports.reduce<WR | null>((b, r) => !b || r.timeSeconds > b.timeSeconds ? r : b, null)
  const totalSessions = reports.slice(-range).reduce((s, r) => s + r.sessions, 0)
  const totalProblems = reports.slice(-range).reduce((s, r) => s + r.problemsSolved, 0)

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Weekly Progress</h2>
          <p className="mt-0.5 text-[11px] text-ink-faint">Sessions &amp; avg time per week</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-hairline p-0.5">
          {([4, 12] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors',
                range === r ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink',
              )}
            >
              {r === 4 ? '4 weeks' : '12 weeks'}
            </button>
          ))}
        </div>
      </div>

      {data.some(d => d.sessions > 0) ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="sessions" name="Sessions" fill="#2d6a4f" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="avgMins"  name="Avg (min)" fill="#d4b896" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>

          {/* Summary row */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-hairline rounded-xl border border-hairline bg-paper-elevated">
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] text-ink-faint uppercase tracking-wider">Sessions</p>
              <p className="mt-1 text-xl font-black tabular-nums text-ink">{totalSessions}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] text-ink-faint uppercase tracking-wider">Problems</p>
              <p className="mt-1 text-xl font-black tabular-nums text-ink">{totalProblems}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] text-ink-faint uppercase tracking-wider">Best Week</p>
              <p className="mt-1 text-[11px] font-semibold text-brand leading-snug">
                {bestWeek ? bestWeek.weekLabel : '—'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-44 items-center justify-center text-sm text-ink-faint">
          No session data yet — complete your first practice session
        </div>
      )}
    </div>
  )
}
