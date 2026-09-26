'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Flame, HelpCircle, Target, Zap } from 'lucide-react'
import { learnApi, type QuizStreak } from '@/lib/learn-api'

const HOW_IT_WORKS = [
  {
    step: 1,
    title: '5 questions, every day',
    description: 'Each day brings a fresh set of questions covering patterns, SOLID principles, OOP, and system design judgment.',
  },
  {
    step: 2,
    title: 'Immediate feedback',
    description: 'After each answer you get an explanation — not just right or wrong, but why the correct choice is correct.',
  },
  {
    step: 3,
    title: 'Build a streak',
    description: 'Consistency compounds. A daily habit of 5 questions builds deep, lasting knowledge faster than cramming.',
  },
]

const SKILLS = ['SOLID Principles', 'Design Patterns', 'OOP Concepts', 'Coupling & Cohesion', 'System Design Judgment', 'Requirement Analysis']

export default function LearnQuizPage() {
  const [streak, setStreak] = useState<QuizStreak | null>(null)

  useEffect(() => {
    learnApi.quiz.streak().then(setStreak).catch(() => {})
  }, [])

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-hairline/60 bg-linear-to-b from-brand-tint/35 to-paper px-6 pb-10 pt-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint">
              <HelpCircle size={26} className="text-brand" strokeWidth={1.75} />
            </div>

            {/* Copy */}
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                Learn
              </p>
              <h1 className="mb-1.5 font-serif text-3xl font-medium leading-tight text-ink">
                Daily Quiz
              </h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                5 fresh LLD questions every day — patterns, SOLID, OOP, and design judgment
              </p>
            </div>

            {/* Streak chip */}
            {streak && streak.currentStreak > 0 && (
              <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border border-hairline bg-paper-elevated px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-500" />
                  <span className="font-mono text-2xl font-bold text-ink">
                    {streak.currentStreak}
                  </span>
                </div>
                <span className="text-center text-[10px] leading-tight text-ink-faint">day streak</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Zap,      label: 'Questions / day', value: '5' },
              { icon: Target,   label: 'Topics covered',  value: '6+' },
              { icon: BookOpen, label: 'Best streak',      value: streak ? String(streak.longestStreak) : '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon size={13} className="text-brand" />
                  <p className="font-mono text-lg font-bold text-ink">{value}</p>
                </div>
                <p className="text-[11px] text-ink-faint">{label}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-8">
            <h2 className="mb-4 font-serif text-xl font-medium text-ink">How it works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {HOW_IT_WORKS.map(step => (
                <div key={step.step} className="rounded-2xl border border-hairline bg-paper-elevated p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[12px] font-bold text-white">
                      {step.step}
                    </div>
                    <h3 className="text-[14px] font-semibold leading-tight text-ink">{step.title}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6">
            <h2 className="mb-3 font-serif text-xl font-medium text-ink">Skills you'll train</h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <span key={s} className="rounded-full border border-brand/20 bg-brand-tint/30 px-3 py-1 text-[12px] font-medium text-brand">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Interview relevance */}
          <div className="mt-6 rounded-2xl border border-brand/20 bg-brand-tint/20 p-6">
            <h2 className="mb-2 font-serif text-base font-medium text-ink">Interview relevance</h2>
            <p className="text-[13px] leading-[1.75] text-ink">
              Interviews test recall under pressure. The Daily Quiz trains your brain to retrieve
              design principles instantly — so when an interviewer asks &quot;what's the difference
              between composition and inheritance?&quot; you answer without hesitation.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/learn/quiz/session"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity group"
            >
              Start Today&apos;s Quiz
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
