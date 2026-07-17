'use client'

import { Flame, CalendarDays, BarChart2, Timer, Zap, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { PersonalBests as PB } from '@/types'

function fmtTime(s: number) {
  if (s <= 0) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec > 0 ? `${sec}s` : ''}`
  return `${sec}s`
}

interface CardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accentClass: string
  bgClass: string
  delay?: number
  empty?: boolean
}

function BestCard({ icon, label, value, sub, accentClass, bgClass, delay = 0, empty }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        empty ? 'border-dashed border-hairline bg-paper-elevated' : 'border-hairline bg-white',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
          <p className={cn(
            'mt-2 text-2xl font-black tabular-nums leading-none',
            empty ? 'text-ink-faint' : accentClass,
          )}>
            {value}
          </p>
          {sub && (
            <p className="mt-1.5 truncate text-[11px] text-ink-faint max-w-[160px]">{sub}</p>
          )}
        </div>
        <div className={cn('ml-3 shrink-0 rounded-xl p-2.5', empty ? 'bg-hairline' : bgClass)}>
          <div className={empty ? 'text-ink-faint opacity-40' : accentClass}>{icon}</div>
        </div>
      </div>

    </motion.div>
  )
}

interface Props {
  bests: PB
}

export function PersonalBests({ bests }: Props) {
  const cards: CardProps[] = [
    {
      icon:        <Flame size={18} />,
      label:       'Longest Streak',
      value:       bests.longestStreakDays > 0 ? `${bests.longestStreakDays} days` : '—',
      sub:         bests.longestStreakDays > 0 ? 'consecutive practice days' : undefined,
      accentClass: 'text-amber-500',
      bgClass:     'bg-amber-50',
      empty:       bests.longestStreakDays === 0,
    },
    {
      icon:        <Timer size={18} />,
      label:       'Longest Session',
      value:       bests.longestSession ? fmtTime(bests.longestSession.timeSeconds) : '—',
      sub:         bests.longestSession
                     ? `${bests.longestSession.title} · ${bests.longestSession.date}`
                     : undefined,
      accentClass: 'text-indigo-600',
      bgClass:     'bg-indigo-50',
      empty:       !bests.longestSession,
    },
    {
      icon:        <Zap size={18} />,
      label:       'Fastest Session',
      value:       bests.fastestSession ? fmtTime(bests.fastestSession.timeSeconds) : '—',
      sub:         bests.fastestSession
                     ? `${bests.fastestSession.title} · ${bests.fastestSession.date}`
                     : undefined,
      accentClass: 'text-emerald-600',
      bgClass:     'bg-emerald-50',
      empty:       !bests.fastestSession,
    },
    {
      icon:        <CalendarDays size={18} />,
      label:       'Best Single Day',
      value:       bests.bestDay ? `${bests.bestDay.sessions} sessions` : '—',
      sub:         bests.bestDay
                     ? `${bests.bestDay.date} · ${fmtTime(bests.bestDay.timeSeconds)}`
                     : undefined,
      accentClass: 'text-sky-600',
      bgClass:     'bg-sky-50',
      empty:       !bests.bestDay,
    },
    {
      icon:        <BarChart2 size={18} />,
      label:       'Best Week',
      value:       bests.bestWeek ? `${bests.bestWeek.sessions} sessions` : '—',
      sub:         bests.bestWeek
                     ? `${bests.bestWeek.weekLabel} · ${fmtTime(bests.bestWeek.timeSeconds)}`
                     : undefined,
      accentClass: 'text-violet-600',
      bgClass:     'bg-violet-50',
      empty:       !bests.bestWeek,
    },
    {
      icon:        <BookOpen size={18} />,
      label:       'Problems Attempted',
      value:       String(bests.totalProblems),
      sub:         bests.totalProblems > 0 ? 'total LLD problems started' : undefined,
      accentClass: 'text-brand',
      bgClass:     'bg-brand/8',
      empty:       bests.totalProblems === 0,
    },
  ]

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-ink">Personal Best Records</h2>
        <p className="mt-0.5 text-[11px] text-ink-faint">Your all-time peak performance milestones</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <BestCard key={i} {...card} delay={i * 0.06} />
        ))}
      </div>
    </div>
  )
}
