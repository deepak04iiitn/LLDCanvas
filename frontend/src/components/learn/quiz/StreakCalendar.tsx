'use client'

import { useState, useMemo } from 'react'
import { eachDayOfInterval, subDays, format, startOfWeek, isSameDay } from 'date-fns'

interface StreakCalendarProps {
  last30Days:   string[]   // kept for backward compat
  last365Days?: string[]   // YYYY-MM-DD keys where quiz was completed
  currentStreak: number
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['', 'Mon', '', 'Wed', '', 'Fri', '']

// Brand-green scale: empty → light tint → full brand
const COLORS = {
  empty:   '#EBF0EC',   // paper-ish grey-green
  done:    '#234E3F',   // brand
}

const CELL = 13   // px — slightly larger than ActivityCalendar for breathing room
const GAP  = 4    // px
const STEP = CELL + GAP
const LEFT = 28   // left margin for day labels

export function StreakCalendar({ last30Days, last365Days, currentStreak }: StreakCalendarProps) {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; date: string; done: boolean
  } | null>(null)

  const doneSet = useMemo(
    () => new Set(last365Days ?? last30Days),
    [last365Days, last30Days],
  )

  // 52-week grid (364 days back from today + today)
  const today = new Date()
  const start = startOfWeek(subDays(today, 363), { weekStartsOn: 0 })
  const days  = eachDayOfInterval({ start, end: today })

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

  // Month label positions (first column of each new month)
  const monthLabels: { label: string; col: number }[] = []
  weeks.forEach((w, col) => {
    const first = w.find(d => d.getDate() <= 7)
    if (first) {
      const label = MONTHS[first.getMonth()]
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
        monthLabels.push({ label, col })
      }
    }
  })

  const svgWidth  = LEFT + weeks.length * STEP
  const svgHeight = 30 + 7 * STEP

  return (
    <div className="relative select-none overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      <svg width={svgWidth} height={svgHeight} className="text-[10px]">

        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text key={`${label}-${col}`} x={LEFT + col * STEP} y={12} fill="#9CA3AF" fontSize={10}>
            {label}
          </text>
        ))}

        {/* Day labels */}
        {DAYS.map((label, row) =>
          label ? (
            <text key={row} x={0} y={26 + row * STEP + CELL / 1.5} fill="#9CA3AF" fontSize={9}>
              {label}
            </text>
          ) : null,
        )}

        {/* Cells */}
        {weeks.map((w, col) =>
          w.map((day, row) => {
            const key    = format(day, 'yyyy-MM-dd')
            const done   = doneSet.has(key)
            const isToday = isSameDay(day, today)
            return (
              <rect
                key={key}
                x={LEFT + col * STEP}
                y={22 + row * STEP}
                width={CELL}
                height={CELL}
                rx={3}
                fill={done ? COLORS.done : COLORS.empty}
                stroke={isToday ? '#234E3F' : 'none'}
                strokeWidth={isToday ? 1.5 : 0}
                className="cursor-pointer transition-opacity hover:opacity-75"
                onMouseEnter={e => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect()
                  setTooltip({
                    x:    rect.left + window.scrollX,
                    y:    rect.top  + window.scrollY,
                    date: format(day, 'EEE, MMM d yyyy'),
                    done,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            )
          }),
        )}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-faint">
        <span>Less</span>
        {[COLORS.empty, '#93B5A8', '#5E9080', '#3B7060', COLORS.done].map((c, i) => (
          <div key={i} className="h-3 w-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-hairline bg-paper px-3 py-2 shadow-xl"
          style={{ top: tooltip.y - 60, left: tooltip.x - 48 }}
        >
          <p className="text-[12px] font-semibold text-ink">{tooltip.date}</p>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            {tooltip.done ? '✓ Quiz completed' : 'No quiz'}
          </p>
        </div>
      )}
    </div>
  )
}
