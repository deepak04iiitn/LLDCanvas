'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { studioApi } from '@/lib/studio-api'

// ── Static data ───────────────────────────────────────────────────────────────

const EVOLUTION_TAGS = [
  { label: 'Scale',       cls: 'text-teal-700   bg-teal-50   border-teal-200'   },
  { label: 'Tech Debt',   cls: 'text-cyan-700   bg-cyan-50   border-cyan-200'   },
  { label: 'Trade-offs',  cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { label: 'Multi-stage', cls: 'text-green-700  bg-green-50  border-green-200'  },
]

const STEPS = [
  {
    n: '01',
    verb: 'Start',
    body: 'Begin with a working v1 design appropriate for the initial context — small scale, simple requirements.',
  },
  {
    n: '02',
    verb: 'Pressure',
    body: 'A new wave arrives — scale, a feature request, a team change, or a compliance requirement. The design must respond.',
  },
  {
    n: '03',
    verb: 'Evolve',
    body: 'Adapt the architecture, record your trade-offs consciously, and manage any technical debt the change introduces.',
  },
]

const SKILLS = [
  ['Evolutionary thinking',   'Design for today while building foundations for tomorrow'],
  ['Tech debt management',    'Consciously accept, defer, or eliminate debt at each stage'],
  ['Trade-off articulation',  'Justify every structural decision with explicit reasoning'],
  ['Scale-aware architecture','Recognise which decisions break under scale and why'],
]

const SAMPLES = [
  { id: '001', title: 'Ride-sharing: city → global',              type: 'Scale'       },
  { id: '002', title: 'Payment processor: compliance stages',     type: 'Constraints' },
  { id: '003', title: 'Content platform: startup → enterprise',   type: 'Growth'      },
  { id: '004', title: 'Messaging: 1:1 → group → broadcast',       type: 'Features'    },
]

// ── Generations timeline data ─────────────────────────────────────────────────

const GENERATIONS = [
  { version: 'v1', label: 'Initial',  desc: 'Simple, fast to ship',      cls: 'border-teal-200 bg-teal-50  text-teal-700'   },
  { version: '↓',  label: 'Pressure', desc: '10x scale + new feature',   cls: 'border-amber-200 bg-amber-50 text-amber-700', isArrow: true },
  { version: 'v2', label: 'Adapted',  desc: 'Caching, queues added',      cls: 'border-cyan-200  bg-cyan-50  text-cyan-700'   },
  { version: '↓',  label: 'Pressure', desc: 'Compliance & team growth',   cls: 'border-rose-200  bg-rose-50  text-rose-700',  isArrow: true },
  { version: 'v3', label: 'Evolved',  desc: 'Services split, debt paid',  cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvolutionOverviewPage() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    studioApi.packs
      .list('evolution')
      .then(res => setTotal(res.packs?.length ?? null))
      .catch(() => {})
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Sticky breadcrumb ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-hairline bg-paper/90 backdrop-blur-sm px-6 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Design Studio &nbsp;/&nbsp; Architecture Evolution
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="pt-8 pb-14 border-b border-hairline">

          {/* Kicker */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] text-ink-faint select-none">004</span>
            <span className="h-px w-8 bg-hairline-strong" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Architecture Evolution</span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl">
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink">
              v1 ships.
            </h1>
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink-faint mt-0.5">
              The hard part comes next.
            </h1>
          </div>

          {/* Tagline */}
          <p className="mt-7 text-[15px] text-ink-muted leading-relaxed max-w-xl">
            Every real system evolves through multiple generations. Start with
            a v1 design, then survive successive waves of scale, new requirements,
            and organisational pressure — while managing technical debt at every stage.
          </p>

          {/* Meta row */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {total !== null && (
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="font-mono text-[26px] font-bold leading-none text-ink tabular-nums">{total}</span>
                <span className="font-mono text-[11px] text-ink-faint">problems</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              {EVOLUTION_TAGS.map(v => (
                <span key={v.label} className={`rounded border px-2 py-0.5 font-mono text-[10px] font-medium leading-none ${v.cls}`}>
                  {v.label}
                </span>
              ))}
            </div>
            <Link
              href="/design-studio/evolution/problems"
              className="ml-auto flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper hover:bg-ink/80 active:scale-[0.98] transition-all shrink-0"
            >
              Explore Problems <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── GENERATIONS TIMELINE ────────────────────────────────────────── */}
        <section className="py-12 border-b border-hairline">
          <div className="flex items-start gap-10">

            {/* Label */}
            <div className="shrink-0 w-32">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint leading-relaxed">
                The journey<br />you simulate
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0 border-l border-hairline pl-10">
              <p className="font-serif text-[22px] font-medium text-ink leading-snug mb-3">
                Design doesn&apos;t stand still.
              </p>
              <p className="text-[13px] text-ink-muted leading-relaxed max-w-lg mb-8">
                Every architecture decision you make at v1 has consequences at v2 and v3.
                This mode teaches you to think multiple generations ahead — and to make
                explicit trade-offs you can defend under interview pressure.
              </p>

              {/* Generations timeline */}
              <div className="flex items-stretch gap-0">
                {GENERATIONS.map((gen, i) => (
                  gen.isArrow ? (
                    <div key={i} className="flex flex-col items-center justify-center px-3 gap-1">
                      <div className={`rounded-lg border px-3 py-1.5 ${gen.cls}`}>
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] font-semibold">{gen.label}</p>
                        <p className="font-mono text-[10px] mt-0.5 opacity-80">{gen.desc}</p>
                      </div>
                      <span className="font-mono text-[12px] text-ink-faint">↓</span>
                    </div>
                  ) : (
                    <div key={i} className={`flex-1 rounded-xl border px-4 py-4 ${gen.cls}`}>
                      <p className="font-mono text-[18px] font-bold leading-none mb-1">{gen.version}</p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] font-semibold mb-1.5">{gen.label}</p>
                      <p className="text-[11px] leading-snug opacity-80">{gen.desc}</p>
                    </div>
                  )
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── PROCESS ─────────────────────────────────────────────────────── */}
        <section className="py-14 border-b border-hairline">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-12">How it works</p>
          <div className="grid grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`flex flex-col gap-5 pr-10 ${i > 0 ? 'pl-10 border-l border-hairline' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-ink-faint">{step.n}</span>
                  <span className="h-px flex-1 bg-hairline" />
                </div>
                <h3 className="font-serif text-[22px] font-medium leading-tight text-ink">{step.verb}</h3>
                <p className="text-[13px] text-ink-muted leading-relaxed">{step.body}</p>
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
                <div key={label} className={`flex gap-5 py-4 ${i < SKILLS.length - 1 ? 'border-b border-hairline' : ''}`}>
                  <span className="font-mono text-[11px] font-semibold text-ink w-36 shrink-0 leading-tight pt-0.5">
                    {label}
                  </span>
                  <span className="text-[12px] text-ink-muted leading-relaxed">{desc}</span>
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
              &ldquo;How would this scale to 10x users?&rdquo;
            </blockquote>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              Senior LLD interviews almost always include a scale or future-evolution
              follow-up. Candidates who answer this instinctively — who have already
              thought about what breaks at v2 — stand out immediately. Architecture
              Evolution builds exactly that muscle: designing with the next generation
              already in mind.
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
              href="/design-studio/evolution/problems"
              className="flex items-center gap-1 text-[12px] font-medium text-ink-faint hover:text-ink transition-colors"
            >
              View all {total !== null ? `${total} problems` : 'problems'}
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-hairline border border-hairline rounded-2xl overflow-hidden">
            {SAMPLES.map(s => (
              <div key={s.id} className="bg-paper-elevated px-6 py-5 flex items-start gap-4 hover:bg-paper transition-colors">
                <span className="font-mono text-[10px] text-ink-faint mt-0.5 select-none shrink-0 w-6">{s.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink leading-snug mb-2">{s.title}</p>
                  <span className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-1.5 py-0.5">{s.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-hairline">
            <p className="text-[13px] text-ink-muted max-w-sm">
              {total !== null ? `${total}` : 'A growing set of'} multi-stage scenarios
              where good v1 decisions separate strong candidates from weak ones.
            </p>
            <Link
              href="/design-studio/evolution/problems"
              className="flex items-center gap-2 rounded-xl border border-ink/20 px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper transition-all active:scale-[0.98] shrink-0"
            >
              Start Evolving <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
