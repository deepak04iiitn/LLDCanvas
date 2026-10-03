'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Flame, CheckCircle2, Circle } from 'lucide-react'
import { learnApi, type QuizStreak } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Sample question shown in the right-column mockup ─────────────────────────
const SAMPLE_Q = {
  text: 'A class fetches data, transforms it, and sends an email — all in one method. Which principle does this violate?',
  options: [
    { id: 'A', label: 'Open/Closed Principle'         },
    { id: 'B', label: 'Single Responsibility Principle', correct: true },
    { id: 'C', label: 'Liskov Substitution Principle'  },
    { id: 'D', label: 'Interface Segregation Principle' },
  ],
}

const SKILLS = [
  { label: 'SOLID Principles',      desc: 'Recognize and apply all five' },
  { label: 'Design Patterns',       desc: 'Factory, Strategy, Observer…' },
  { label: 'OOP Concepts',          desc: 'Polymorphism, encapsulation' },
  { label: 'Coupling & Cohesion',   desc: 'Spot tight coupling instantly' },
  { label: 'Design Judgment',       desc: 'Trade-off thinking under time' },
  { label: 'Requirement Analysis',  desc: 'Extract entities & constraints' },
]

const STEPS = [
  {
    n: '01',
    title: '10 questions, every morning',
    body:  'Each day serves 10 fresh questions covering patterns, SOLID, OOP, and design judgment. No repeats for 30 days.',
  },
  {
    n: '02',
    title: 'Instant, explained feedback',
    body:  'Not just right or wrong — every option gets a crisp rationale so the concept sticks.',
  },
  {
    n: '03',
    title: 'Consistency beats cramming',
    body:  'A 5-question daily habit compounds. Reviewers can tell who practised daily versus who crammed.',
  },
]

// ── Animated sample question ──────────────────────────────────────────────────
function SampleCard() {
  const [chosen, setChosen] = useState<string | null>(null)
  const revealed = chosen !== null

  return (
    <div className="rounded-2xl border border-hairline bg-paper shadow-sm overflow-hidden">
      {/* Card header bar */}
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3 bg-paper-elevated">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Daily Quiz · Q 3 of 10</span>
        <div className="flex gap-1">
          {[0,1,2,3,4,5,6,7,8,9].map(i => (
            <div key={i} className={cn('h-1.5 w-3 rounded-full', i < 3 ? 'bg-brand' : 'bg-hairline')} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-5 py-5">
        <p className="text-[14px] font-medium leading-relaxed text-ink mb-5">{SAMPLE_Q.text}</p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {SAMPLE_Q.options.map(opt => {
            const isChosen  = chosen === opt.id
            const isCorrect = opt.correct
            const showResult = revealed

            return (
              <button
                key={opt.id}
                onClick={() => !revealed && setChosen(opt.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[13px] transition-all duration-200',
                  !revealed && 'hover:border-brand/40 hover:bg-brand-tint/20 cursor-pointer border-hairline',
                  showResult && isCorrect
                    ? 'border-brand/30 bg-brand-tint/30 text-ink'
                    : showResult && isChosen && !isCorrect
                    ? 'border-red-200 bg-red-50/60 text-ink'
                    : showResult
                    ? 'border-hairline opacity-50 text-ink-faint'
                    : 'border-hairline text-ink',
                )}
              >
                <span className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all',
                  showResult && isCorrect ? 'border-brand bg-brand text-white' :
                  showResult && isChosen && !isCorrect ? 'border-red-400 bg-red-400 text-white' :
                  'border-hairline text-ink-faint',
                )}>
                  {opt.id}
                </span>
                <span className="flex-1 leading-snug">{opt.label}</span>
                {showResult && isCorrect && <CheckCircle2 size={14} className="shrink-0 text-brand" />}
              </button>
            )
          })}
        </div>

        {/* Reveal hint */}
        {!revealed && (
          <p className="mt-4 text-center text-[11px] text-ink-faint">← tap an option to try it</p>
        )}
        {revealed && (
          <div className="mt-4 rounded-xl border border-brand/20 bg-brand-tint/20 px-4 py-3">
            <p className="text-[12px] text-ink leading-relaxed">
              <span className="font-semibold text-brand">SRP explained:</span> One class should have only one reason to change. Combining data fetching, transformation, and email delivery creates three separate axes of change.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LearnQuizPage() {
  const [streak, setStreak] = useState<QuizStreak | null>(null)

  useEffect(() => {
    learnApi.quiz.streak().then(setStreak).catch(() => {})
  }, [])

  const currentStreak = streak?.currentStreak ?? 0
  const bestStreak    = streak?.longestStreak ?? 0

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper relative">

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.3]"
        style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative z-10">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* Left: editorial copy */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand mb-6">Daily Quiz</p>

              <h1 className="font-serif font-medium tracking-tight leading-[0.9] mb-8">
                <span className="block text-[42px] sm:text-[54px] text-ink">Ten questions.</span>
                <span className="block text-[42px] sm:text-[54px] text-brand">Every morning.</span>
              </h1>

              <p className="text-[15px] text-ink-muted leading-relaxed max-w-sm mb-10">
                Design principles don't stick from reading. They stick from being tested on them,
                daily, until retrieval becomes reflex.
              </p>

              {/* Stats — vertical editorial stack */}
              <div className="flex flex-col gap-0 mb-10 border-l-2 border-brand/20 pl-5">
                <div className="py-3 border-b border-hairline">
                  <p className="font-mono text-[28px] font-bold text-ink leading-none">10</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">questions per day, no repeats for 30 days</p>
                </div>
                <div className="py-3 border-b border-hairline">
                  <p className="font-mono text-[28px] font-bold text-ink leading-none">6+</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">LLD skill areas covered</p>
                </div>
                {currentStreak > 0 ? (
                  <div className="py-3">
                    <div className="flex items-baseline gap-2">
                      <p className="font-mono text-[28px] font-bold text-amber-500 leading-none">{currentStreak}</p>
                      <Flame size={16} className="text-amber-400 mb-0.5" />
                    </div>
                    <p className="text-[11px] text-ink-faint mt-0.5">day streak — keep it going</p>
                  </div>
                ) : (
                  <div className="py-3">
                    <p className="font-mono text-[28px] font-bold text-ink leading-none">{bestStreak > 0 ? bestStreak : '—'}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">{bestStreak > 0 ? 'best streak — beat it today' : 'start your streak today'}</p>
                  </div>
                )}
              </div>

              <Link
                href="/dashboard/learn/quiz/session"
                className="inline-flex items-center gap-2.5 rounded-xl bg-brand px-6 py-3.5 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity group"
              >
                Start Today&apos;s Quiz
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Right: interactive sample question */}
            <div className="w-full lg:w-105 shrink-0">
              <div className="mb-3 flex items-center gap-2">
                <Circle size={7} className="fill-brand text-brand" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Live preview — try it</span>
              </div>
              <SampleCard />
            </div>
          </div>
        </section>

        {/* ── Thin divider ───────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── Skills strip ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-8">

            {/* Sidebar label */}
            <div className="sm:w-40 shrink-0 pt-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint leading-tight">
                Skills<br />you'll train
              </p>
            </div>

            {/* Skill grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5">
              {SKILLS.map(({ label, desc }) => (
                <div key={label}>
                  <p className="text-[13px] font-semibold text-ink leading-tight">{label}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Thin divider ───────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── Methodology ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-8">

            {/* Sidebar label */}
            <div className="sm:w-40 shrink-0 pt-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint leading-tight">
                How<br />it works
              </p>
            </div>

            {/* Steps */}
            <div className="flex-1 flex flex-col divide-y divide-hairline">
              {STEPS.map(step => (
                <div key={step.n} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                  <p className="font-serif text-[32px] font-medium text-brand/15 leading-none pt-0.5 w-10 shrink-0 select-none">
                    {step.n}
                  </p>
                  <div>
                    <p className="text-[14px] font-semibold text-ink mb-1">{step.title}</p>
                    <p className="text-[13px] text-ink-muted leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Thin divider ───────────────────────────────────────────────── */}
        <div className="border-t border-hairline mx-6" />

        {/* ── Interview relevance pull-quote ─────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="sm:w-40 shrink-0" />
            <blockquote className="flex-1">
              <p className="font-serif text-[22px] sm:text-[26px] font-medium text-ink leading-snug max-w-2xl">
                &ldquo;Interviewers can tell who practised daily versus who crammed the night before.&rdquo;
              </p>
              <p className="mt-4 text-[12px] text-ink-faint font-mono uppercase tracking-widest">
                — LLDCanvas methodology
              </p>
              <Link
                href="/dashboard/learn/quiz/session"
                className="mt-8 inline-flex items-center gap-2 text-brand text-[14px] font-semibold group"
              >
                Start Today&apos;s Quiz
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </blockquote>
          </div>
        </section>

      </div>
    </div>
  )
}
