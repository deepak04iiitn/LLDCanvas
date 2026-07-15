'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { subDays, format } from 'date-fns'
import type { PracticeStats } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  stats: PracticeStats
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function StreakPanel({ stats }: Props) {
  const { currentStreakDays, longestStreakDays, lastPracticeDate, dailyActivity } = stats

  const activitySet = useMemo(() => {
    const s = new Set<string>()
    dailyActivity.forEach(d => { if (d.sessionCount > 0) s.add(d.date) })
    return s
  }, [dailyActivity])

  // Last 7 days (today is index 6)
  const last7 = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d    = subDays(today, 6 - i)
      const key  = format(d, 'yyyy-MM-dd')
      const dow  = d.getDay()  // 0=Sun … 6=Sat
      return { key, letter: DAY_LETTERS[dow], active: activitySet.has(key) }
    })
  }, [activitySet])

  const noStreak = currentStreakDays === 0

  return (
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">

        {/* Flame + current streak */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl',
            noStreak ? 'bg-gray-100' : 'bg-amber-100',
          )}>
            <Flame className={cn(
              'h-9 w-9 transition-colors',
              noStreak ? 'text-gray-300' : 'text-amber-500',
            )} />
          </div>
          <div>
            <p className={cn(
              'text-5xl font-black leading-none tabular-nums',
              noStreak ? 'text-gray-300' : 'text-amber-500',
            )}>
              {currentStreakDays}
            </p>
            <p className="mt-1 text-xs font-medium text-amber-700/60 uppercase tracking-wider">
              day streak
            </p>
          </div>
        </div>

        {/* Secondary stats */}
        <div className="flex gap-6 sm:flex-col sm:gap-1">
          <div>
            <p className="text-base font-bold text-gray-700">{longestStreakDays} days</p>
            <p className="text-[11px] text-gray-400">Longest streak</p>
          </div>
          {lastPracticeDate && (
            <div>
              <p className="text-base font-bold text-gray-700">
                {format(new Date(lastPracticeDate), 'MMM d')}
              </p>
              <p className="text-[11px] text-gray-400">Last practiced</p>
            </div>
          )}
        </div>

        {/* 7-day pill row */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {last7.map(({ key, letter, active }) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                active
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white/80 text-gray-300',
              )}>
                {letter}
              </div>
            </div>
          ))}
        </div>
      </div>

      {noStreak && (
        <p className="mt-4 text-sm text-gray-400">
          Start practicing today to build your streak!
        </p>
      )}
    </div>
  )
}
