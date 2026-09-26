'use client'

import { cn } from '@/lib/utils'

interface StreakCalendarProps {
  last30Days: string[]   // dateKeys (YYYY-MM-DD) where quiz was completed
  currentStreak: number
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Renders a 5-row × 6-column contribution grid covering the last 30 days.
 * Newest day = bottom-right cell.
 */
export function StreakCalendar({ last30Days, currentStreak }: StreakCalendarProps) {
  const doneSet = new Set(last30Days)
  const today = todayKey()
  const msPerDay = 86_400_000

  // Build 30 cells from oldest (index 0 = 29 days ago) → newest (index 29 = today)
  const cells: { key: string; done: boolean; isToday: boolean }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(new Date(today).getTime() - i * msPerDay)
    const key = d.toISOString().slice(0, 10)
    cells.push({ key, done: doneSet.has(key), isToday: key === today })
  }

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">
          {currentStreak > 0 ? (
            <>
              <span className="mr-1">🔥</span>
              {currentStreak}-day streak
            </>
          ) : (
            "No streak yet \u2014 complete today's quiz!"
          )}
        </span>
        <span className="font-mono text-[11px] text-ink-faint">Last 30 days</span>
      </div>

      {/* 5 rows × 6 columns grid */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
        aria-label="30-day quiz activity"
      >
        {cells.map(({ key, done, isToday }) => (
          <div
            key={key}
            title={key}
            className={cn(
              'aspect-square rounded-sm transition-colors',
              done
                ? 'bg-emerald-500'
                : 'bg-[hsl(var(--color-hairline)/0.6)]',
              isToday && 'ring-2 ring-brand ring-offset-1 ring-offset-paper-elevated',
            )}
          />
        ))}
      </div>
    </div>
  )
}
