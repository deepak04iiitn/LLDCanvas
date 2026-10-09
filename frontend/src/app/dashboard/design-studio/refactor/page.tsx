'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { studioApi } from '@/lib/studio-api'

// ── Static data ───────────────────────────────────────────────────────────────

const SMELL_TAGS = [
  { label: 'Monolithic',    cls: 'text-blue-700   bg-blue-50   border-blue-200'   },
  { label: 'Rigid',         cls: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { label: 'Bloated',       cls: 'text-sky-700    bg-sky-50    border-sky-200'    },
  { label: 'Fragile',       cls: 'text-cyan-700   bg-cyan-50   border-cyan-200'   },
]

const STEPS = [
  {
    n: '01',
    verb: 'Study',
    body: 'Read the existing design carefully. Understand which classes carry too much responsibility and where coupling prevents extension.',
  },
  {
    n: '02',
    verb: 'Refactor',
    body: 'Extract classes, introduce abstractions, and rewire dependencies — all without changing observable behavior.',
  },
  {
    n: '03',
    verb: 'Verify',
    body: 'Confirm the refactored design is cleaner, more extensible, and preserves every behavior contract from the original.',
  },
]

const SKILLS = [
  ['Extract class',          'Break large classes into focused, single-purpose components'],
  ['Interface extraction',   'Replace concrete dependencies with well-named abstractions'],
  ['Behavior preservation',  'Refactor safely — keep every existing contract intact'],
  ['Design articulation',    'Explain every structural decision with clarity and principle'],
]

const SAMPLES = [
  { id: '001', title: 'UserService with 15 methods', type: 'God Object'         },
  { id: '002', title: 'Checkout controlling everything', type: 'SRP Violation'  },
  { id: '003', title: 'Concrete deps block unit tests', type: 'DIP Violation'   },
  { id: '004', title: 'Mixed persistence + logic', type: 'Tight Coupling'       },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RefactorOverviewPage() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    studioApi.packs
      .list('refactor')
      .then(res => setTotal(res.packs?.length ?? null))
      .catch(() => {})
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-paper">

      <div className="mx-auto max-w-5xl px-6">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="pt-14 pb-14 border-b border-hairline">

          {/* Headline — contrasting two-liner */}
          <div className="max-w-3xl">
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink">
              Same behavior.
            </h1>
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink-faint mt-0.5">
              Better design.
            </h1>
          </div>

          {/* Tagline */}
          <p className="mt-7 text-[15px] text-ink-muted leading-relaxed max-w-xl">
            You receive a working but poorly-structured design. Your job is to
            extract classes, reduce coupling, and improve cohesion — without
            breaking a single existing behavior contract.
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

            {/* Code smell tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SMELL_TAGS.map(v => (
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
              href="/dashboard/design-studio/refactor/problems"
              className="ml-auto flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper hover:bg-ink/80 active:scale-[0.98] transition-all shrink-0"
            >
              Explore Problems
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── THE CONSTRAINT ──────────────────────────────────────────────── */}
        <section className="py-12 border-b border-hairline">
          <div className="flex items-start gap-10">

            {/* Label */}
            <div className="shrink-0 w-32">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint leading-relaxed">
                The golden<br />rule
              </p>
            </div>

            {/* Rule text */}
            <div className="flex-1 min-w-0 border-l border-hairline pl-10">
              <p className="font-serif text-[22px] font-medium text-ink leading-snug mb-3">
                Don&apos;t break what already works.
              </p>
              <p className="text-[13px] text-ink-muted leading-relaxed max-w-lg">
                Every refactoring must preserve the observable behavior of the system.
                If a method returned a list before, it must still return one.
                If a class sent emails, something still must. This constraint is what
                separates disciplined refactoring from careless rewriting.
              </p>
            </div>

            {/* Visual signal */}
            <div className="shrink-0 flex flex-col items-center gap-1.5 pt-1">
              <div className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2">
                <p className="font-mono text-[10px] text-ink-faint line-through">break behavior</p>
              </div>
              <span className="font-mono text-[10px] text-ink-faint">vs</span>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <p className="font-mono text-[10px] text-blue-700">improve structure ✓</p>
              </div>
            </div>

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
              Skills you&apos;ll build
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
              &ldquo;How would you improve this design?&rdquo;
            </blockquote>

            <p className="text-[13px] text-ink-muted leading-relaxed">
              Refactoring questions are common in senior LLD interviews. Interviewers
              aren&apos;t just checking whether you can spot problems — they want to hear
              you restructure confidently, justify each extraction, and explain why the
              new design is more maintainable. This mode trains that exact habit.
            </p>
          </div>
        </section>

        {/* ── SAMPLE PROBLEMS ─────────────────────────────────────────────── */}
        <section className="py-14 pb-20">

          <div className="flex items-end justify-between mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              What you&apos;ll practice
            </p>
            <Link
              href="/dashboard/design-studio/refactor/problems"
              className="flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-ink transition-colors"
            >
              View all {total !== null ? `${total} problems` : 'problems'}
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-hairline border border-hairline rounded-2xl overflow-hidden">
            {SAMPLES.map(s => (
              <div
                key={s.id}
                className="bg-paper-elevated px-6 py-5 flex items-start gap-4 hover:bg-paper transition-colors"
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
              {total !== null ? `${total}` : 'A growing set of'} problems spanning god objects,
              tangled dependencies, SRP violations, and untestable designs.
            </p>
            <Link
              href="/dashboard/design-studio/refactor/problems"
              className="flex items-center gap-2 rounded-xl border border-ink/20 px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper transition-all active:scale-[0.98] shrink-0"
            >
              Start Refactoring
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
