'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any
import { cn } from '@/lib/utils'
import type { MonthlyReport as MR } from '@/types'

function fmtTime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return m > 0 ? `${m}m` : (s > 0 ? `${s}s` : '—')
}

function pct(a: number, b: number) {
  if (b === 0) return null
  const p = Math.round(((a - b) / b) * 100)
  return p
}

function CustomTooltip({ active, payload, label }: AnyProps) {
  if (!active || !payload?.length) return null
  const hours = payload.find((p: AnyProps) => p.dataKey === 'hours')?.value ?? 0
  const sessions = payload.find((p: AnyProps) => p.dataKey === 'sessions')?.value ?? 0
  return (
    <div className="rounded-xl border border-hairline bg-white px-3.5 py-3 shadow-xl text-xs">
      <p className="mb-1.5 font-semibold text-ink">{label}</p>
      <p className="text-brand">
        <span className="inline-block w-20 text-ink-faint">Total time:</span>
        <span className="font-bold">{hours > 0 ? `${hours}h` : '< 1h'}</span>
      </p>
      <p className="text-violet-600">
        <span className="inline-block w-20 text-ink-faint">Sessions:</span>
        <span className="font-bold">{sessions}</span>
      </p>
    </div>
  )
}

interface Props {
  reports: MR[]
}

type Range = 6 | 12

export function MonthlyReport({ reports }: Props) {
  const [range, setRange] = useState<Range>(12)
  const [view,  setView]  = useState<'time' | 'sessions'>('time')

  const data = useMemo(() => {
    return reports.slice(-range).map(r => ({
      label:    r.month.split(' ')[0],  // "Jan", "Feb", …
      hours:    Math.round(r.timeSeconds / 3600 * 10) / 10,
      sessions: r.sessions,
      problems: r.problemsSolved,
    }))
  }, [reports, range])

  // MoM comparison
  const last  = reports[reports.length - 1]
  const prev  = reports[reports.length - 2]
  const sessionDelta  = last && prev ? pct(last.sessions, prev.sessions) : null
  const timeDelta     = last && prev ? pct(last.timeSeconds, prev.timeSeconds) : null
  const problemsDelta = last && prev ? pct(last.problemsSolved, prev.problemsSolved) : null

  function DeltaBadge({ val }: { val: number | null }) {
    if (val === null) return <span className="text-ink-faint">—</span>
    const pos = val >= 0
    return (
      <span className={cn(
        'text-xs font-semibold',
        pos ? 'text-emerald-600' : 'text-red-500',
      )}>
        {pos ? '↑' : '↓'} {Math.abs(val)}%
      </span>
    )
  }

  const gradId  = view === 'time' ? 'monthly-time-grad' : 'monthly-sess-grad'
  const color   = view === 'time' ? '#2d6a4f' : '#7c3aed'
  const dataKey = view === 'time' ? 'hours' : 'sessions'

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Monthly Progress</h2>
          <p className="mt-0.5 text-[11px] text-ink-faint">Your practice across the year</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg bg-hairline p-0.5 mr-2">
            {(['time', 'sessions'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors capitalize',
                  view === v ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink',
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-hairline p-0.5">
            {([6, 12] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors',
                  range === r ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink',
                )}
              >
                {r}mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {data.some(d => d.sessions > 0) ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              </defs>
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
                tickFormatter={v => view === 'time' ? `${v}h` : String(v)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F3F4F6', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* MoM comparison */}
          {last && prev && (
            <div className="mt-4 grid grid-cols-3 divide-x divide-hairline rounded-xl border border-hairline bg-paper-elevated text-center">
              <div className="px-4 py-3">
                <p className="text-[10px] text-ink-faint uppercase tracking-wider">Sessions</p>
                <p className="mt-0.5 text-lg font-black text-ink">{last.sessions}</p>
                <DeltaBadge val={sessionDelta} />
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-ink-faint uppercase tracking-wider">Time</p>
                <p className="mt-0.5 text-lg font-black text-ink">{fmtTime(last.timeSeconds)}</p>
                <DeltaBadge val={timeDelta} />
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-ink-faint uppercase tracking-wider">Problems</p>
                <p className="mt-0.5 text-lg font-black text-ink">{last.problemsSolved}</p>
                <DeltaBadge val={problemsDelta} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-44 items-center justify-center text-sm text-ink-faint">
          No monthly data yet — start practicing to see your progress
        </div>
      )}
    </div>
  )
}
