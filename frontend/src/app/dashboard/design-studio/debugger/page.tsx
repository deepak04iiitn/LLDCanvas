'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { studioApi } from '@/lib/studio-api'

// ── Static data ───────────────────────────────────────────────────────────────

const VIOLATION_TAGS = [
  { label: 'God Class',         cls: 'text-red-600    bg-red-50    border-red-200'    },
  { label: 'SRP Violation',     cls: 'text-amber-700  bg-amber-50  border-amber-200'  },
  { label: 'Tight Coupling',    cls: 'text-violet-700 bg-violet-50 border-violet-200' },
  { label: 'Wrong Inheritance', cls: 'text-rose-700   bg-rose-50   border-rose-200'   },
]

const STEPS = [
  {
    n: '01',
    verb: 'Detect',
    body: 'Study the broken diagram. Spot which nodes carry too much responsibility, use wrong relationships, or break encapsulation.',
  },
  {
    n: '02',
    verb: 'Diagnose',
    body: 'Name the violated principle. SRP? LSP? God Class? Write a precise, principled explanation for each flaw you found.',
  },
  {
    n: '03',
    verb: 'Repair',
    body: 'Restructure the design. Then verify — the violations should be gone and the diagram should stand up to scrutiny.',
  },
]

const SKILLS = [
  ['SRP & SOLID',          'Catch single-responsibility violations in real authored designs'],
  ['God Class recognition','Spot bloated classes that own too many responsibilities'],
  ['Coupling & cohesion',  'Read tight coupling directly from class diagram relationships'],
  ['Design repair',        'Restructure broken systems into clean, principled architecture'],
]

const SAMPLES = [
  { id: '001', title: 'Library Management System', type: 'God Class'         },
  { id: '002', title: 'E-commerce: Order ← Customer', type: 'Wrong Inheritance' },
  { id: '003', title: 'Notification service',        type: 'Tight Coupling'   },
  { id: '004', title: 'ATM — handles everything',    type: 'SRP Violation'    },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DebuggerOverviewPage() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    studioApi.packs
      .list('debugger')
      .then(res => setTotal(res.packs?.length ?? null))
      .catch(() => {})
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Sticky breadcrumb ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-hairline bg-paper/90 backdrop-blur-sm px-6 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Design Studio &nbsp;/&nbsp; Debugger
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="pt-8 pb-14 border-b border-hairline">

          {/* Kicker */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] text-ink-faint select-none">001</span>
            <span className="h-px w-8 bg-hairline-strong" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Design Debugger</span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl">
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink">
              Find the flaw.
            </h1>
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink-faint mt-0.5">
              Before the interviewer does.
            </h1>
          </div>

          {/* Tagline */}
          <p className="mt-7 text-[15px] text-ink-muted leading-relaxed max-w-xl">
            Load an authored broken design, mark every structural violation,
            explain the root cause, and restructure it — exactly the way
            an interviewer expects you to.
          </p>

          {/* Meta row */}
          <div className="mt-9 flex flex-wrap items-center gap-4">

            {/* Problem count */}
            {total !== null && (
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="font-mono text-[26px] font-bold leading-none text-ink tabular-nums">{total}</span>
                <span className="font-mono text-[11px] text-ink-faint">problems</span>
              </div>
            )}

            {/* Violation type tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {VIOLATION_TAGS.map(v => (
                <span
                  key={v.label}
                  className={`rounded border px-2 py-0.5 font-mono text-[10px] font-medium leading-none ${v.cls}`}
                >
                  {v.label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/design-studio/debugger/problems"
              className="ml-auto flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper hover:bg-ink/80 active:scale-[0.98] transition-all shrink-0"
            >
              Explore Problems
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── PROCESS ─────────────────────────────────────────────────────── */}
        <section className="py-14 border-b border-hairline">

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-12">How it works</p>

          <div className="grid grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`flex flex-col gap-5 pr-10 ${i > 0 ? 'pl-10 border-l border-hairline' : ''}`}
              >
                {/* Step label row */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-ink-faint">{step.n}</span>
                  <span className="h-px flex-1 bg-hairline" />
                </div>

                {/* Verb */}
                <h3 className="font-serif text-[22px] font-medium leading-tight text-ink">
                  {step.verb}
                </h3>

                {/* Body */}
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SKILLS + INTERVIEW RELEVANCE ────────────────────────────────── */}
        <section className="py-14 border-b border-hairline grid grid-cols-[1fr_1px_1fr] gap-0">

          {/* Skills table */}
          <div className="pr-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-8">
              Skills you'll build
            </p>
            <div>
              {SKILLS.map(([label, desc], i) => (
                <div
                  key={label}
                  className={`flex gap-5 py-4 ${i < SKILLS.length - 1 ? 'border-b border-hairline' : ''}`}
                >
                  <span className="font-mono text-[11px] font-semibold text-ink w-36 shrink-0 leading-tight pt-0.5">
                    {label}
                  </span>
                  <span className="text-[12px] text-ink-muted leading-relaxed">
                    {desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="bg-hairline" />

          {/* Interview relevance */}
          <div className="pl-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-8">
              Interview relevance
            </p>

            <blockquote className="font-serif text-[20px] font-medium italic leading-[1.55] text-ink border-l-[3px] border-ink/70 pl-5 mb-6">
              "What would you change about this design?"
            </blockquote>

            <p className="text-[13px] text-ink-muted leading-relaxed">
              This is one of the most common LLD interview prompts. Candidates
              who can articulate <em>why</em> something is wrong — not just
              that it is — stand out immediately. This tool trains exactly that:
              systematic detection, principled diagnosis, and confident repair.
            </p>
          </div>
        </section>

        {/* ── SAMPLE PROBLEMS ─────────────────────────────────────────────── */}
        <section className="py-14 pb-20">

          <div className="flex items-end justify-between mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              What you'll practice
            </p>
            <Link
              href="/dashboard/design-studio/debugger/problems"
              className="flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-ink transition-colors"
            >
              View all {total !== null ? `${total} problems` : 'problems'}
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-hairline border border-hairline rounded-2xl overflow-hidden">
            {SAMPLES.map((s, i) => (
              <div
                key={s.id}
                className="bg-paper-elevated px-6 py-5 flex items-start gap-4 hover:bg-paper transition-colors group"
              >
                <span className="font-mono text-[10px] text-ink-faint mt-0.5 select-none shrink-0 w-6">
                  {s.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink leading-snug mb-2">
                    {s.title}
                  </p>
                  <span className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-1.5 py-0.5">
                    {s.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-hairline">
            <p className="text-[13px] text-ink-muted max-w-sm">
              {total !== null ? `${total}` : 'Dozens of'} problems spanning god classes,
              SRP violations, coupling failures, and inheritance misuse.
            </p>
            <Link
              href="/dashboard/design-studio/debugger/problems"
              className="flex items-center gap-2 rounded-xl border border-ink/20 px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper transition-all active:scale-[0.98] shrink-0"
            >
              Start Debugging
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
