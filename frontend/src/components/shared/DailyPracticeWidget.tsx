'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sun, CheckCircle2, Circle, Flame, ArrowRight, Clock, Sword, Zap, BookOpen,
} from 'lucide-react'
import { journeyApi, type DailyPractice } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const MODE_LABELS: Record<string, string> = {
  debugger: 'Debugger', refactor: 'Refactor', change_one: 'Change One',
  evolution: 'Evolution', budget: 'Budget',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

// ── Row wrapper ───────────────────────────────────────────────────────────────

function PracticeRow({
  icon, label, done, children,
}: { icon: React.ReactNode; label: string; done?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 border-b border-hairline/60 last:border-0">
      <div className={cn(
        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        done ? 'bg-green-100 text-green-600' : 'bg-paper text-ink-muted border border-hairline',
      )}>
        {done ? <CheckCircle2 size={14} /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

// ── Main widget ───────────────────────────────────────────────────────────────

export function DailyPracticeWidget() {
  const [practice, setPractice] = useState<DailyPractice | null>(null)
  const [loading, setLoading] = useState(true)
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    journeyApi.getDailyPractice()
      .then(setPractice)
      .catch((err) => {
        if (err?.status === 404 || err?.status === 401) setNoProfile(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 animate-pulse">
        <div className="h-4 w-32 rounded bg-hairline mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-12 rounded-lg bg-hairline" />)}
        </div>
      </div>
    )
  }

  // ── No profile CTA ─────────────────────────────────────────────────────────
  if (noProfile || !practice) {
    return (
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sun size={16} className="text-amber-500" />
          <h2 className="font-serif text-base font-medium text-ink">Today's Prep</h2>
        </div>
        <p className="text-[13px] text-ink-muted mb-4">
          Set up your Plannr to unlock a personalised daily practice routine.
        </p>
        <Link
          href="/dashboard/plannr/setup"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Set up Plannr <ArrowRight size={12} />
        </Link>
      </div>
    )
  }

  const { date, quiz, studioChallenge, quickRun, plannrTopic, estimatedMinutes } = practice

  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun size={16} className="text-amber-500" />
          <h2 className="font-serif text-base font-medium text-ink">Today's Prep</h2>
          <span className="text-[11px] text-ink-faint">{formatDate(date)}</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
          <Clock size={10} />
          ~{estimatedMinutes} min
        </span>
      </div>

      <div className="divide-y divide-hairline/60">
        {/* 1. Daily Quiz */}
        <PracticeRow icon={<Circle size={13} />} label="Daily Quiz" done={quiz.done}>
          {quiz.done ? (
            <p className="text-[13px] font-medium text-green-700">Quiz completed ✓</p>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[13px] text-ink">5 Quick Questions</p>
                {quiz.streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                    <Flame size={11} /> {quiz.streak} day streak
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/learn/quiz"
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Start <ArrowRight size={10} />
              </Link>
            </div>
          )}
        </PracticeRow>

        {/* 2. Design Studio Challenge */}
        <PracticeRow icon={<Sword size={13} />} label="Design Studio">
          {studioChallenge ? (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] text-ink truncate">{studioChallenge.title}</p>
                <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold bg-ink/8 text-ink-muted">
                    {MODE_LABELS[studioChallenge.mode] ?? studioChallenge.mode}
                  </span>
                  <span className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold', DIFFICULTY_COLORS[studioChallenge.difficulty] ?? 'bg-hairline text-ink-muted')}>
                    {studioChallenge.difficulty}
                  </span>
                  <span className="text-[11px] text-ink-faint truncate">{studioChallenge.reason}</span>
                </div>
              </div>
              <Link
                href={`/dashboard/design-studio/${studioChallenge.mode}/${studioChallenge.slug}`}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Start <ArrowRight size={10} />
              </Link>
            </div>
          ) : (
            <p className="text-[13px] text-ink-muted">No challenge available right now.</p>
          )}
        </PracticeRow>

        {/* 3. Quick Roguelike Run */}
        <PracticeRow icon={<Zap size={13} />} label="Quick Run">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] text-ink">{quickRun.description}</p>
            <Link
              href={quickRun.href}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {quickRun.label} <ArrowRight size={10} />
            </Link>
          </div>
        </PracticeRow>

        {/* 4. Plannr Topic */}
        <PracticeRow icon={<BookOpen size={13} />} label="Plannr Topic">
          {plannrTopic ? (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] text-ink truncate">{plannrTopic.title}</p>
                <p className="text-[11px] text-ink-faint mt-0.5 line-clamp-1">{plannrTopic.reason}</p>
              </div>
              <Link
                href={`/dashboard/plannr/topic/${plannrTopic.slug}`}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-brand px-3 py-1.5 text-[11px] font-semibold text-brand hover:bg-brand/5 transition-colors"
              >
                Continue <ArrowRight size={10} />
              </Link>
            </div>
          ) : (
            <p className="text-[13px] text-green-700 font-medium">All topics complete 🎉</p>
          )}
        </PracticeRow>
      </div>
    </div>
  )
}
