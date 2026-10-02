'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { studioApi } from '@/lib/studio-api'

// ── Static data ───────────────────────────────────────────────────────────────

const CHANGE_TAGS = [
  { label: 'OCP',            cls: 'text-orange-700 bg-orange-50  border-orange-200' },
  { label: 'Blast Radius',   cls: 'text-rose-700   bg-rose-50    border-rose-200'   },
  { label: 'Extensible',     cls: 'text-amber-700  bg-amber-50   border-amber-200'  },
  { label: 'Mid-Design',     cls: 'text-red-700    bg-red-50     border-red-200'    },
]

const STEPS = [
  {
    n: '01',
    verb: 'Read',
    body: 'A single change request arrives — a new constraint, feature, or business rule that your current design did not anticipate.',
  },
  {
    n: '02',
    verb: 'Predict',
    body: 'Map the blast radius: which classes need to change, which would break, and what stays untouched if the design is solid.',
  },
  {
    n: '03',
    verb: 'Adapt',
    body: 'Modify the architecture to absorb the change cleanly — minimal edits, no ripple damage, extensible for the next requirement.',
  },
]

const SKILLS = [
  ['Open/Closed Principle', 'Design systems that extend without modification'],
  ['Blast radius analysis',  'Predict which components change when requirements change'],
  ['Extensibility planning', 'Build designs that anticipate future requirements'],
  ['Change articulation',    'Explain trade-offs of different adaptation strategies'],
]

const SAMPLES = [
  { id: '001', title: 'Multi-currency payment support',        type: 'OCP Violation'   },
  { id: '002', title: 'Multiple notification channels',        type: 'Tight Coupling'  },
  { id: '003', title: 'Audit logging for order management',    type: 'Blast Radius'    },
  { id: '004', title: 'Multiple authentication providers',     type: 'Extensibility'   },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChangeOverviewPage() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    studioApi.packs
      .list('change_one')
      .then(res => setTotal(res.packs?.length ?? null))
      .catch(() => {})
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* ── Sticky breadcrumb ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-hairline bg-paper/90 backdrop-blur-sm px-6 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Design Studio &nbsp;/&nbsp; Change One Thing
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="pt-8 pb-14 border-b border-hairline">

          {/* Kicker */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] text-ink-faint select-none">003</span>
            <span className="h-px w-8 bg-hairline-strong" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Change One Thing</span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl">
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink">
              Requirements change.
            </h1>
            <h1 className="font-serif text-[54px] font-medium leading-[1.04] tracking-tight text-ink-faint mt-0.5">
              Your design shouldn&apos;t break.
            </h1>
          </div>

          {/* Tagline */}
          <p className="mt-7 text-[15px] text-ink-muted leading-relaxed max-w-xl">
            A new requirement arrives mid-design. You must adapt your
            architecture to absorb the change while minimising disruption —
            the most revealing interview skill of all.
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
              {CHANGE_TAGS.map(v => (
                <span key={v.label} className={`rounded border px-2 py-0.5 font-mono text-[10px] font-medium leading-none ${v.cls}`}>
                  {v.label}
                </span>
              ))}
            </div>
            <Link
              href="/design-studio/change/problems"
              className="ml-auto flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper hover:bg-ink/80 active:scale-[0.98] transition-all shrink-0"
            >
              Explore Problems <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── THE BLAST RADIUS ────────────────────────────────────────────── */}
        <section className="py-12 border-b border-hairline">
          <div className="flex items-start gap-10">

            {/* Label */}
            <div className="shrink-0 w-32">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint leading-relaxed">
                The key<br />concept
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0 border-l border-hairline pl-10">
              <p className="font-serif text-[22px] font-medium text-ink leading-snug mb-3">
                One change. How far does it spread?
              </p>
              <p className="text-[13px] text-ink-muted leading-relaxed max-w-lg">
                The &ldquo;blast radius&rdquo; is the number of classes you must touch
                to accommodate a single requirement change. A good design keeps it
                at one or two. A fragile one cascades across the entire system.
                Learning to predict and minimise this is the core skill here.
              </p>
            </div>

            {/* Visual — fragile vs. contained */}
            <div className="shrink-0 flex flex-col gap-2 pt-1">
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-rose-500 mb-1.5">Fragile</p>
                <div className="space-y-1">
                  {['Order', 'Payment', 'Invoice', 'Notification', 'Report'].map(c => (
                    <div key={c} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span className="font-mono text-[10px] text-rose-700 line-through">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-600 mb-1.5">Extensible</p>
                <div className="space-y-1">
                  {[['PaymentProvider', true], ['Order', false], ['Invoice', false]].map(([c, changed]) => (
                    <div key={String(c)} className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${changed ? 'bg-emerald-500' : 'bg-hairline-strong'}`} />
                      <span className={`font-mono text-[10px] ${changed ? 'text-emerald-700 font-semibold' : 'text-ink-faint'}`}>{String(c)}</span>
                    </div>
                  ))}
                </div>
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
              &ldquo;What if we also need to support X?&rdquo;
            </blockquote>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              This is the single most common follow-up question in LLD interviews.
              Interviewers aren&apos;t just testing whether your design works —
              they&apos;re testing whether it <em>survives</em> the next requirement.
              Change One Thing trains you to answer this confidently and show
              that your design is genuinely extensible, not just a snapshot.
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
              href="/design-studio/change/problems"
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
              {total !== null ? `${total}` : 'A growing set of'} scenarios where one requirement change
              reveals the true quality of a design.
            </p>
            <Link
              href="/design-studio/change/problems"
              className="flex items-center gap-2 rounded-xl border border-ink/20 px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper transition-all active:scale-[0.98] shrink-0"
            >
              Start Adapting <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
