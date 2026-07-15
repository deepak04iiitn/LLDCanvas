'use client'

import { useState, useMemo } from 'react'
import { eachDayOfInterval, subDays, format, getDay, startOfWeek, isSameDay } from 'date-fns'
import type { DailyActivity } from '@/types'

interface Props {
  activity: DailyActivity[]
}

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS    = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getColor(seconds: number): string {
  if (!seconds)         return '#F3F4F6'
  if (seconds <  900)   return '#C7D2FE'  // indigo-200  < 15 min
  if (seconds < 1800)   return '#818CF8'  // indigo-400  < 30 min
  if (seconds < 3600)   return '#6366F1'  // indigo-500  < 60 min
  return '#4338CA'                        // indigo-700  60+ min
}

export function ActivityCalendar({ activity }: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number
    date: string; sessions: number; seconds: number
  } | null>(null)

  const activityMap = useMemo(() => {
    const m = new Map<string, DailyActivity>()
    activity.forEach(d => m.set(d.date, d))
    return m
  }, [activity])

  // Build 52-week grid (364 days back from today + today = 365)
  const today  = new Date()
  const start  = startOfWeek(subDays(today, 363), { weekStartsOn: 0 }) // Sunday
  const days   = eachDayOfInterval({ start, end: today })

  // Group into columns of 7 (Sun → Sat)
  const weeks: Date[][] = []
  let week: Date[] = []
  days.forEach((d, i) => {
    week.push(d)
    if (week.length === 7 || i === days.length - 1) {
      weeks.push(week)
      week = []
    }
  })

  // Month label positions
  const monthLabels: { label: string; col: number }[] = []
  weeks.forEach((w, col) => {
    const monthDay = w.find(d => d.getDate() <= 7)
    if (monthDay) {
      const label = MONTHS[monthDay.getMonth()]
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
        monthLabels.push({ label, col })
      }
    }
  })

  const CELL = 12    // cell size px
  const GAP  = 3     // gap px
  const STEP = CELL + GAP
  const LEFT = 28    // left margin for day labels

  return (
    <div className="relative select-none overflow-x-auto">
      <svg
        width={LEFT + weeks.length * STEP}
        height={30 + 7 * STEP}
        className="text-[10px]"
      >
        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={`${label}-${col}`}
            x={LEFT + col * STEP}
            y={12}
            fill="#9CA3AF"
            fontSize={10}
          >
            {label}
          </text>
        ))}

        {/* Day labels */}
        {DAYS.map((label, row) =>
          label ? (
            <text
              key={row}
              x={0}
              y={26 + row * STEP + CELL / 1.5}
              fill="#9CA3AF"
              fontSize={9}
            >
              {label}
            </text>
          ) : null,
        )}

        {/* Cells */}
        {weeks.map((w, col) =>
          w.map((day, row) => {
            const key  = format(day, 'yyyy-MM-dd')
            const data = activityMap.get(key)
            const isToday = isSameDay(day, today)
            return (
              <rect
                key={key}
                x={LEFT + col * STEP}
                y={22 + row * STEP}
                width={CELL}
                height={CELL}
                rx={2.5}
                fill={getColor(data?.timeSeconds ?? 0)}
                stroke={isToday ? '#6366F1' : 'none'}
                strokeWidth={isToday ? 1.5 : 0}
                className="cursor-pointer transition-opacity hover:opacity-75"
                onMouseEnter={e => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect()
                  setTooltip({
                    x: rect.left + window.scrollX,
                    y: rect.top  + window.scrollY,
                    date:     format(day, 'EEE, MMM d yyyy'),
                    sessions: data?.sessionCount ?? 0,
                    seconds:  data?.timeSeconds  ?? 0,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          }),
        )}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400">
        <span>Less</span>
        {['#F3F4F6','#C7D2FE','#818CF8','#6366F1','#4338CA'].map(c => (
          <div key={c} className="h-3 w-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-gray-200 bg-white
                     px-3 py-2 shadow-xl text-xs"
          style={{ top: tooltip.y - 64, left: tooltip.x - 40 }}
        >
          <p className="font-semibold text-gray-800">{tooltip.date}</p>
          <p className="mt-0.5 text-gray-400">
            {tooltip.sessions} session{tooltip.sessions !== 1 ? 's' : ''} ·{' '}
            {tooltip.seconds < 60
              ? `${tooltip.seconds}s`
              : `${Math.round(tooltip.seconds / 60)} min`}
          </p>
        </div>
      )}
    </div>
  )
}
