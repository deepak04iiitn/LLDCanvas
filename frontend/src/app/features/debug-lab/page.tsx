import type { Metadata } from 'next'
import Link from 'next/link'
import { Bug, AlertTriangle, Link2Off, ShieldAlert, GitCompare, BookOpen, ArrowRight, XCircle, AlertOctagon } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Debug Lab — Annotate Design Violations in UML Diagrams | LLDCanvas',
  description: 'Annotate real design violations — God Class, SRP breach, tight coupling, wrong inheritance — directly on UML class diagrams, then compare your annotations against the authoritative breakdown.',
  keywords: ['LLD debugging', 'design flaw detection', 'find design problems', 'spot design violations', 'SRP violation practice', 'design pattern debugging', 'LLD critique practice', 'OOP design review'],
  alternates: { canonical: '/features/debug-lab' },
  openGraph: {
    title: 'Debug Lab — Annotate Design Violations in UML Diagrams | LLDCanvas',
    description: 'Real authored diagrams with real violations. Annotate what you see, then reveal the expected breakdown.',
    type: 'website',
    url: '/features/debug-lab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debug Lab — Annotate Design Violations in UML Diagrams | LLDCanvas',
    description: 'Real authored diagrams with real violations. Annotate what you see, then reveal the expected breakdown.',
  },
}

const FAQ = [
  { q: 'What kinds of violations appear in Debug Lab?', a: 'God Class (a class with too many responsibilities), SRP violation (a class responsible for multiple unrelated concerns), tight coupling (classes that depend directly on concrete implementations), wrong inheritance (using inheritance for code reuse instead of an IS-A relationship), and wrong aggregation (using aggregation when composition is the correct relationship). More violation types are added regularly.' },
  { q: 'Do I have to find all violations to pass?', a: 'Debug Lab does not grade you on a pass/fail basis — it shows you what you found versus what the expected breakdown identified. The goal is to develop your critical eye, not to score you. If you miss a violation, the explanation tells you exactly what you missed and why it matters.' },
  { q: 'How many challenges are there?', a: 'The library is actively growing. At launch it includes a set of foundational challenges covering each major violation type. New challenges are added regularly, and you can filter by violation type, difficulty, or domain (e.g., e-commerce, transport, fintech).' },
  { q: 'Are the systems in Debug Lab real?', a: 'They are based on real system archetypes — booking systems, payment flows, notification pipelines — but simplified and authored specifically for the exercise. The violations are intentional, not incidental, so the challenge is controlled and the explanation is authoritative.' },
  { q: 'Does Debug Lab teach you what correct looks like?', a: 'Yes. Every violation explanation includes a description of the correct alternative design. You are not just told that something is wrong — you are shown what the fixed structure would be. For a more hands-on fix experience, Debug & Fix picks up where Debug Lab leaves off.' },
]

export default function DebugLabPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Debug Lab — Annotate Design Violations in UML Diagrams', url: 'https://www.lldcanvas.in/features/debug-lab', description: 'Annotate real design violations on UML class diagrams and compare against the authoritative breakdown.' }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Features', item: 'https://www.lldcanvas.in/features' }, { '@type': 'ListItem', position: 2, name: 'Debug Lab', item: 'https://www.lldcanvas.in/features/debug-lab' }] }} />

      {/* ─── SECTION 1: HERO ──────────────────────────────────────────── */}
      <section className="px-6 pb-0 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-5xl">

          {/* Text block — centered */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-mono text-[11px] font-bold tracking-[0.25em] text-gold uppercase">
              11 · DEBUG LAB
            </p>
            <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
              Annotate what&rsquo;s broken before the interviewer does.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              Authored UML diagrams with real violations. Annotate what you see — God Class, SRP breach, wrong inheritance — then compare your critique to the expected breakdown.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/learn/debugger"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Open Debug Lab
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#violation-types"
                className="inline-flex items-center gap-2 rounded-lg border border-hairline px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-elevated"
              >
                See violation types
              </a>
            </div>
          </div>

          {/* UML Diagram Mockup */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">

            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5">
              <span className="font-mono text-xs font-semibold text-amber-900">
                CHALLENGE #17: BookingEngine.java
              </span>
              <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700">
                3 violations detected
              </span>
            </div>

            {/* Diagram area + annotation panel */}
            <div className="flex flex-col lg:flex-row">

              {/* Diagram canvas */}
              <div className="flex-1 p-6 sm:p-8">
                {/* Stacked on mobile, grid on larger screens */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">

                  {/* Box 1 — BookingService (GOD CLASS) */}
                  <div className="relative">
                    {/* GOD CLASS annotation badge */}
                    <span className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                      GOD CLASS
                    </span>
                    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3">
                      <div className="-mt-3 mx-auto mb-3 w-fit rounded bg-red-300 px-2 py-1 font-mono text-xs font-bold text-red-900">
                        BookingService
                      </div>
                      <div className="mb-2 space-y-0.5 border-b border-red-200 pb-2">
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; db: DatabaseConn</p>
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; emailSvc: EmailService</p>
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; payment: PayPal</p>
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; logger: Logger</p>
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; cache: Redis</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] text-ink-muted">+ book()</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ cancel()</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ notify()</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ pay()</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ log()</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ cache()</p>
                      </div>
                    </div>
                    {/* Tight coupling label arrow hint */}
                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-px flex-1 border-t-2 border-dashed border-red-300" />
                      <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-600 uppercase tracking-wider">
                        tight coupling
                      </span>
                      <div className="h-px flex-1 border-t-2 border-dashed border-red-300" />
                    </div>
                  </div>

                  {/* Box 2 — PaymentService (clean-ish) */}
                  <div className="rounded-lg border border-hairline bg-paper-elevated p-3">
                    <div className="-mt-3 mx-auto mb-3 w-fit rounded bg-[#E7E2D6] px-2 py-1 font-mono text-xs font-bold text-ink">
                      PaymentService
                    </div>
                    <div className="mb-2 space-y-0.5 border-b border-hairline pb-2">
                      <p className="font-mono text-[11px] text-ink-muted">&#8211; gateway: Gateway</p>
                      <p className="font-mono text-[11px] text-ink-muted">&#8211; config: Config</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono text-[11px] text-ink-muted">+ charge(amount)</p>
                      <p className="font-mono text-[11px] text-ink-muted">+ refund(txId)</p>
                    </div>
                  </div>

                  {/* Box 3 — EmailService (SRP VIOLATION) */}
                  <div className="relative">
                    <span className="absolute -right-2 -top-2 z-10 rounded-full bg-orange-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                      SRP BREACH
                    </span>
                    <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-3">
                      <div className="-mt-3 mx-auto mb-3 w-fit rounded bg-orange-300 px-2 py-1 font-mono text-xs font-bold text-orange-900">
                        EmailService
                      </div>
                      <div className="mb-2 space-y-0.5 border-b border-orange-200 pb-2">
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; smtp: SMTPClient</p>
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; templates: Map</p>
                        <p className="font-mono text-[11px] text-ink-muted">&#8211; log: FileLogger</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] text-ink-muted">+ send(to, body)</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ renderTemplate(id)</p>
                        <p className="font-mono text-[11px] text-ink-muted">+ logSent(id)</p>
                      </div>
                    </div>
                  </div>

                  {/* Box 4 — DatabaseConn (tight coupling target) */}
                  <div className="rounded-lg border border-hairline bg-paper-elevated p-3">
                    <div className="-mt-3 mx-auto mb-3 w-fit rounded bg-[#E7E2D6] px-2 py-1 font-mono text-xs font-bold text-ink">
                      DatabaseConn
                    </div>
                    <div className="mb-2 space-y-0.5 border-b border-hairline pb-2">
                      <p className="font-mono text-[11px] text-ink-muted">&#8211; host: String</p>
                      <p className="font-mono text-[11px] text-ink-muted">&#8211; pool: ConnPool</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono text-[11px] text-ink-muted">+ query(sql)</p>
                      <p className="font-mono text-[11px] text-ink-muted">+ execute(sql)</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Annotation panel — hidden on mobile, shown on lg+ */}
              <aside className="hidden border-t border-amber-200 bg-amber-50 p-5 lg:block lg:w-56 lg:border-l lg:border-t-0">
                <p className="mb-3 font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                  Your annotations
                </p>
                <div className="space-y-3">
                  <div className="rounded border-l-4 border-red-400 bg-white pl-3 pr-2 py-2 shadow-sm">
                    <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                      <span className="font-bold text-red-700">BookingService</span> — God Class: handles DB, email, payment, logging, caching
                    </p>
                  </div>
                  <div className="rounded border-l-4 border-orange-400 bg-white pl-3 pr-2 py-2 shadow-sm">
                    <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                      <span className="font-bold text-orange-700">EmailService</span> — SRP Breach: template + send + log
                    </p>
                  </div>
                  <div className="rounded border-l-4 border-red-400 bg-white pl-3 pr-2 py-2 shadow-sm">
                    <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                      <span className="font-bold text-red-700">Direct DB dependency</span> — tight coupling
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded border border-brand/30 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand transition-colors hover:bg-brand-tint"
                >
                  Compare with expected &rarr;
                </button>
              </aside>
            </div>

            {/* Annotation panel — mobile only, stacked below */}
            <div className="border-t border-amber-200 bg-amber-50 p-5 lg:hidden">
              <p className="mb-3 font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                Your annotations
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <div className="flex-1 rounded border-l-4 border-red-400 bg-white pl-3 pr-2 py-2 shadow-sm">
                  <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                    <span className="font-bold text-red-700">BookingService</span> — God Class
                  </p>
                </div>
                <div className="flex-1 rounded border-l-4 border-orange-400 bg-white pl-3 pr-2 py-2 shadow-sm">
                  <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                    <span className="font-bold text-orange-700">EmailService</span> — SRP Breach
                  </p>
                </div>
                <div className="flex-1 rounded border-l-4 border-red-400 bg-white pl-3 pr-2 py-2 shadow-sm">
                  <p className="font-mono text-[10px] leading-relaxed text-ink-muted">
                    <span className="font-bold text-red-700">Direct DB dependency</span> — tight coupling
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 rounded border border-brand/30 bg-white px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-tint"
              >
                Compare with expected &rarr;
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 2: VIOLATION TYPES ───────────────────────────────── */}
      <section id="violation-types" className="border-y border-hairline bg-paper py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">Violation catalogue</p>
          <h2 className="mb-10 font-serif text-3xl font-medium text-ink">
            The violations you&rsquo;ll learn to spot.
          </h2>

          {/* Diagnostic report panel */}
          <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">

            {/* Panel header — mimics a file/tool header */}
            <div className="flex items-center justify-between border-b border-hairline bg-paper px-5 py-3">
              <span className="font-mono text-[11px] font-semibold text-ink-muted">
                VIOLATION REPORT <span className="text-ink-faint">— BookingEngine.java</span>
              </span>
              <span className="font-mono text-[10px] text-ink-faint">4 issues found</span>
            </div>

            {/* Row 1 — GOD CLASS */}
            <div className="flex border-b border-hairline">
              <div className="w-1 flex-shrink-0 bg-red-500" />
              <div className="flex flex-1 flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-shrink-0 items-center gap-2 sm:w-28">
                  <AlertOctagon className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-red-600 uppercase">ERROR</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                    <h3 className="font-mono text-sm font-bold text-ink">GOD CLASS</h3>
                    <span className="font-mono text-[10px] text-ink-faint">BookingService · 247 lines · 9 responsibilities</span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">Single class handling DB access, payment, email, logging, and caching — the most common and most damaging violation.</p>
                </div>
              </div>
            </div>

            {/* Row 2 — SRP BREACH */}
            <div className="flex border-b border-hairline">
              <div className="w-1 flex-shrink-0 bg-orange-500" />
              <div className="flex flex-1 flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-shrink-0 items-center gap-2 sm:w-28">
                  <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase">ERROR</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                    <h3 className="font-mono text-sm font-bold text-ink">SRP BREACH</h3>
                    <span className="font-mono text-[10px] text-ink-faint">EmailService · sends, renders templates, logs</span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">A class responsible for multiple unrelated concerns — the principle most often cited in post-interview feedback.</p>
                </div>
              </div>
            </div>

            {/* Row 3 — WRONG INHERITANCE */}
            <div className="flex border-b border-hairline">
              <div className="w-1 flex-shrink-0 bg-amber-500" />
              <div className="flex flex-1 flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-shrink-0 items-center gap-2 sm:w-28">
                  <Link2Off className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-amber-700 uppercase">WARN</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                    <h3 className="font-mono text-sm font-bold text-ink">WRONG INHERITANCE</h3>
                    <span className="font-mono text-[10px] text-ink-faint">StorageService extends BaseHandler · not an IS-A</span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">Inheritance used for code reuse rather than a true IS-A relationship — syntactically valid but semantically broken.</p>
                </div>
              </div>
            </div>

            {/* Row 4 — TIGHT COUPLING */}
            <div className="flex">
              <div className="w-1 flex-shrink-0 bg-yellow-500" />
              <div className="flex flex-1 flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-shrink-0 items-center gap-2 sm:w-28">
                  <GitCompare className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-yellow-700 uppercase">WARN</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                    <h3 className="font-mono text-sm font-bold text-ink">TIGHT COUPLING</h3>
                    <span className="font-mono text-[10px] text-ink-faint">OrderController → PaymentGatewayImpl · concrete dep</span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">Classes that depend directly on concrete implementations — making every change expensive and testing impossible.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW IT WORKS ──────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">How it works</p>
          <h2 className="mb-12 font-serif text-3xl font-medium text-ink">
            Three steps from broken diagram to sharp diagnosis.
          </h2>

          {/* Steps as a bordered process panel */}
          <div className="overflow-hidden rounded-xl border border-hairline">
            <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">

              {/* Step 1 */}
              <div className="px-6 py-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-bold text-brand-foreground">01</span>
                  <div className="h-px flex-1 bg-hairline" />
                </div>
                <h3 className="mb-3 font-serif text-[17px] font-semibold text-ink leading-snug">Study the broken diagram</h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  An authored UML diagram of a real system — booking engine, auth module, payment flow — deliberately designed with violations. No hints, no labels.
                </p>
              </div>

              {/* Step 2 */}
              <div className="px-6 py-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-bold text-brand-foreground">02</span>
                  <div className="h-px flex-1 bg-hairline" />
                </div>
                <h3 className="mb-3 font-serif text-[17px] font-semibold text-ink leading-snug">Annotate the violations</h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Mark what is wrong and explain your reasoning. No checklist guides you — you decide what to flag, just as a senior reviewer would in a real design critique.
                </p>
              </div>

              {/* Step 3 */}
              <div className="px-6 py-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-bold text-brand-foreground">03</span>
                  <div className="h-px flex-1 bg-hairline" />
                </div>
                <h3 className="mb-3 font-serif text-[17px] font-semibold text-ink leading-snug">Compare with expected</h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Your annotations sit side-by-side with the authoritative breakdown. Every violation explained: what it is, why it matters, what the correct structure looks like.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: COMPARISON PREVIEW ───────────────────────────── */}
      <section className="bg-paper-elevated py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <h2 className="mb-2 font-serif text-3xl font-medium text-ink">
            Your annotation vs. the expected breakdown.
          </h2>
          <p className="mb-10 text-sm text-ink-muted">
            See exactly what you caught, what you missed, and what the authoritative diagnosis says.
          </p>

          <div className="overflow-hidden rounded-xl border border-hairline">
            {/* Table header */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="border-r border-hairline bg-paper px-5 py-3">
                <p className="font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                  Your annotations
                </p>
              </div>
              <div className="bg-brand-tint px-5 py-3">
                <p className="font-mono text-[10px] font-bold tracking-widest text-brand/70 uppercase">
                  Expected breakdown
                </p>
              </div>
            </div>

            {/* Row 1 — Caught: God Class */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="flex items-start gap-3 border-r border-hairline px-5 py-4">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-2.5 w-2.5 text-emerald-600" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M1.5 5.5 L4 8 L8.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">BookingService</span> — handles too many things (God Class)
                </p>
              </div>
              <div className="flex items-start gap-3 bg-brand-tint/30 px-5 py-4">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-2.5 w-2.5 text-emerald-600" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M1.5 5.5 L4 8 L8.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">BookingService</span> — God Class: DB access, payment, email, logging, caching all in one class. Extract into focused services.
                </p>
              </div>
            </div>

            {/* Row 2 — Caught: SRP Breach */}
            <div className="grid grid-cols-2 border-b border-hairline">
              <div className="flex items-start gap-3 border-r border-hairline px-5 py-4">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-2.5 w-2.5 text-emerald-600" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M1.5 5.5 L4 8 L8.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">EmailService</span> — sends emails AND renders templates AND logs. SRP breach.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-brand-tint/30 px-5 py-4">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-2.5 w-2.5 text-emerald-600" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M1.5 5.5 L4 8 L8.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">EmailService</span> — SRP Breach: template rendering is a separate concern. Split into EmailSender + TemplateRenderer.
                </p>
              </div>
            </div>

            {/* Row 3 — Missed: Direct DatabaseConn dependency */}
            <div className="grid grid-cols-2">
              <div className="flex items-start gap-3 border-r border-hairline bg-red-50/40 px-5 py-4">
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <p className="text-sm text-ink-faint italic">
                  Not annotated
                </p>
              </div>
              <div className="flex items-start gap-3 bg-brand-tint/30 px-5 py-4">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
                </span>
                <p className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">Direct DatabaseConn dependency</span> — tight coupling to a concrete class. Should depend on a Repository interface.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHO IT'S FOR ──────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            Who it&rsquo;s for
          </p>
          <h2 className="mb-8 font-serif text-3xl font-medium text-ink">
            Built for engineers who need a sharper critical eye.
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: 'The interview candidate',
                desc: 'Engineers who can design a system from scratch but struggle to critique an existing design when asked in interviews.',
              },
              {
                label: 'The senior aspirant',
                desc: 'SDE-2 and senior candidates facing design review rounds where critiquing a peer\'s design is part of the evaluation.',
              },
              {
                label: 'The SOLID theorist',
                desc: 'Anyone who knows the SOLID principles in theory but has never practised applying them as a lens to critique real designs.',
              },
              {
                label: 'The vocabulary seeker',
                desc: 'Candidates who want to build the language to explain design problems clearly, not just feel like something is wrong.',
              },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-xl border border-hairline bg-paper-elevated p-5"
              >
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand/40" />
                <div>
                  <p className="mb-1 font-mono text-xs font-bold text-ink">{label}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FAQ + CROSS LINKS ─────────────────────────────── */}
      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks exclude="/features/debug-lab" />
    </main>
  )
}
