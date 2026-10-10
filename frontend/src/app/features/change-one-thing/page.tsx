import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, Shield, TrendingUp, Timer, Zap, GitCompare, ArrowRight, Plus, Lock, Unlock } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Change One Thing — OCP Practice Under Interview Pressure | LLDCanvas',
  description:
    'A new requirement arrives mid-design. Apply it with minimal blast radius, validate OCP compliance, and compare your change against the ideal minimal-impact fix. Tests the Open-Closed Principle under real pressure.',
  keywords: [
    'LLD requirements change', 'open closed principle practice', 'design for change',
    'blast radius design', 'OCP interview question', 'extensible design practice',
    'mid-design requirement change', 'LLD change management',
  ],
  alternates: { canonical: '/features/change-one-thing' },
  openGraph: {
    title: 'Change One Thing — OCP Practice Under Interview Pressure | LLDCanvas',
    description: 'A new requirement arrives mid-design. Apply it with minimal blast radius and validate against the OCP-compliant ideal.',
    type: 'website',
    url: '/features/change-one-thing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Change One Thing — OCP Practice Under Interview Pressure | LLDCanvas',
    description: 'A new requirement arrives mid-design. Apply it with minimal blast radius and validate against the OCP-compliant ideal.',
  },
}

const FAQ = [
  {
    q: 'What is the Open-Closed Principle?',
    a: 'The Open-Closed Principle (OCP) states that a software entity should be open for extension but closed for modification. In practice, this means that when a new requirement arrives, you should be able to accommodate it by adding new classes or interfaces — not by modifying the ones that already exist and already work. Designs that require widespread modification for every new requirement are fragile; OCP-compliant designs are stable.',
  },
  {
    q: 'What is blast radius in design?',
    a: 'Blast radius is the number of existing classes, interfaces, or files that must be modified to accommodate a new requirement. A blast radius of zero means the new requirement was absorbed entirely by adding new code. A blast radius of five means five existing classes had to change — which introduces five regression risks and five merge conflicts. Minimising blast radius is the practical goal of OCP.',
  },
  {
    q: 'How is scoring done in Change One Thing?',
    a: 'Your solution is scored on three dimensions: blast radius (how many existing classes you modified), OCP compliance (whether your extension used abstraction correctly), and extensibility (whether your design is ready for the next change without another round of modifications). Each dimension is shown as a number with a comparison to the ideal solution.',
  },
  {
    q: 'Can I change more than one thing?',
    a: 'You can make as many changes as you need to accommodate the new requirement — the constraint is on modifying existing classes, not on the total number of changes. You are always free to add new classes, new interfaces, and new relationships. The blast radius score reflects only modifications to existing entities.',
  },
  {
    q: 'What types of change requirements appear?',
    a: 'Requirements that map naturally to extension points: adding a new payment method to a payment system, adding a new notification channel to a notification pipeline, adding a new discount type to a pricing engine, adding a new file format to an export system. These are the exact change categories interviewers use to test whether your initial design was extensible.',
  },
]

export default function ChangeOneThingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Change One Thing — OCP Practice Under Interview Pressure', url: 'https://www.lldcanvas.in/features/change-one-thing', description: 'A new requirement arrives mid-design. Apply it with minimal blast radius, validate OCP compliance, and compare against the ideal minimal-impact fix.' }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Features', item: 'https://www.lldcanvas.in/features' }, { '@type': 'ListItem', position: 2, name: 'Change One Thing', item: 'https://www.lldcanvas.in/features/change-one-thing' }] }} />

      {/* ─── SECTION 1: HERO ──────────────────────────────────────────── */}
      <section className="px-6 pt-8 pb-12 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

            {/* ── LEFT: TEXT ── */}
            <div className="flex-1 lg:pt-4">
              <p className="mb-4 font-mono text-[11px] font-bold tracking-[0.25em] text-gold uppercase">
                15 &middot; CHANGE ONE THING
              </p>
              <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
                A new requirement arrives mid&#8209;design. Absorb&nbsp;it.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
                The moment every interviewer loves: &ldquo;now what if we also need to support X?&rdquo; Change One Thing gives you that moment &mdash; with blast&#8209;radius scoring and OCP validation.
              </p>

              {/* Score badge row */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded bg-red-100 px-3 py-1 font-mono text-sm font-semibold text-red-700">
                  Blast radius: 4 classes
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-faint" />
                <span className="rounded bg-green-100 px-3 py-1 font-mono text-sm font-semibold text-green-700">
                  Blast radius: 0 classes
                </span>
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard/design-studio/change"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Try it now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* ── RIGHT: BLAST RADIUS NETWORK VISUAL ── */}
            <div className="w-full overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-sm lg:w-[420px] lg:flex-shrink-0">

              {/* Top bar */}
              <div className="border-b border-hairline bg-paper px-4 py-2.5">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
                  Blast Radius Comparison
                </span>
              </div>

              {/* ── HIGH BLAST RADIUS (BAD) ── */}
              <div className="px-5 pt-5 pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-red-600 uppercase">
                    High blast radius — OCP violation
                  </span>
                  <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
                    Blast radius: 4
                  </span>
                </div>

                {/* Network graph — bad approach */}
                <div className="relative rounded-xl border border-red-200 bg-red-50 px-4 py-5">
                  {/* New requirement node at top */}
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-red-400 bg-red-200">
                      <Plus className="h-5 w-5 text-red-600" />
                    </div>
                  </div>

                  {/* Connector line from new req down */}
                  <div className="mx-auto mb-2 h-4 w-px bg-red-300" />

                  {/* Row 1 — affected nodes */}
                  <div className="mb-2 flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-red-400 bg-red-100 p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-red-700 text-center">Payment<br />Svc</span>
                    </div>
                    {/* horizontal connector */}
                    <div className="h-px w-5 bg-red-300" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-red-400 bg-red-100 p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-red-700 text-center">Order<br />Svc</span>
                    </div>
                    <div className="h-px w-5 bg-red-300" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-red-400 bg-red-100 p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-red-700 text-center">User<br />Svc</span>
                    </div>
                  </div>

                  {/* Connector line down */}
                  <div className="mb-2 flex justify-center gap-[84px]">
                    <div className="h-4 w-px bg-red-300" />
                    <div className="h-4 w-px bg-red-300" />
                  </div>

                  {/* Row 2 — one more affected + one clean */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">DB<br />Layer</span>
                    </div>
                    <div className="h-px w-5 bg-hairline" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 border-red-400 bg-red-100 p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-red-700 text-center">Ctrl&shy;ler</span>
                    </div>
                    <div className="h-px w-5 bg-hairline" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">Logger</span>
                    </div>
                  </div>

                  {/* Annotation */}
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2">
                    <p className="font-mono text-[10px] font-bold text-red-700">
                      4 existing classes modified — 4 regression risks
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-3 px-5 py-2">
                <div className="h-px flex-1 bg-hairline" />
                <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-ink-faint uppercase whitespace-nowrap">
                  vs. OCP-compliant approach
                </span>
                <div className="h-px flex-1 bg-hairline" />
              </div>

              {/* ── LOW BLAST RADIUS (GOOD) ── */}
              <div className="px-5 pt-3 pb-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">
                    Zero blast radius — OCP compliant
                  </span>
                  <span className="rounded bg-green-100 px-2 py-0.5 font-mono text-xs font-bold text-green-700">
                    Blast radius: 0
                  </span>
                </div>

                {/* Network graph — good approach */}
                <div className="relative rounded-xl border border-green-200 bg-green-50 px-4 py-5">
                  {/* New node at top — the only green one */}
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-auto min-w-[80px] flex-col items-center justify-center rounded-full border-2 border-green-400 bg-green-100 px-3 py-1">
                      <span className="font-mono text-[9px] font-bold text-green-700 text-center leading-tight">Crypto<br />Payment</span>
                      <span className="mt-0.5 rounded bg-green-300 px-1 font-mono text-[8px] font-bold text-green-900">+NEW</span>
                    </div>
                  </div>

                  {/* Connector line */}
                  <div className="mx-auto mb-2 h-4 w-px bg-green-300" />

                  {/* Row 1 — untouched nodes */}
                  <div className="mb-2 flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">Payment<br />Svc</span>
                    </div>
                    <div className="h-px w-5 bg-hairline" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">Order<br />Svc</span>
                    </div>
                    <div className="h-px w-5 bg-hairline" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">User<br />Svc</span>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-center gap-[84px]">
                    <div className="h-4 w-px bg-hairline" />
                    <div className="h-4 w-px bg-hairline" />
                  </div>

                  {/* Row 2 — all untouched */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">DB<br />Layer</span>
                    </div>
                    <div className="h-px w-5 bg-hairline" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">Ctrl&shy;ler</span>
                    </div>
                    <div className="h-px w-5 bg-hairline" />
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-hairline bg-paper-elevated p-1">
                      <span className="font-mono text-[9px] font-bold leading-tight text-ink-faint text-center">Logger</span>
                    </div>
                  </div>

                  {/* Annotation */}
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-100 px-3 py-2">
                    <p className="font-mono text-[10px] font-bold text-green-700">
                      0 existing classes modified — 0 regression risks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: OCP EXPLAINER ─────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <h2 className="mb-2 font-serif text-3xl font-medium text-ink">
            The Open-Closed Principle, made visual.
          </h2>
          <p className="mb-10 text-base text-ink-muted">
            Open for extension, closed for modification — the principle that separates extensible designs from fragile ones.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* LEFT — Open for Extension (good) */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-300 bg-green-100">
                  <Unlock className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-green-600 uppercase">Open for</p>
                  <p className="font-serif text-lg font-medium text-green-900">Extension</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-green-700">✓</span>
                  </div>
                  <p className="text-sm leading-relaxed text-green-800">Add new payment method &rarr; new class</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-green-700">✓</span>
                  </div>
                  <p className="text-sm leading-relaxed text-green-800">Existing classes unchanged</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-green-700">✓</span>
                  </div>
                  <p className="text-sm leading-relaxed text-green-800">Blast radius: 0</p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-green-200 bg-green-100 px-3 py-2.5">
                <p className="font-mono text-[11px] font-semibold text-green-800">
                  New requirement → new <em>class</em>
                </p>
              </div>
            </div>

            {/* RIGHT — Closed for Modification (bad / violation) */}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-300 bg-red-100">
                  <Lock className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-red-600 uppercase">Closed for</p>
                  <p className="font-serif text-lg font-medium text-red-900">Modification</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-200 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-red-700">✗</span>
                  </div>
                  <p className="text-sm leading-relaxed text-red-800">Adding new payment method &rarr; modify PaymentService</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-200 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-red-700">✗</span>
                  </div>
                  <p className="text-sm leading-relaxed text-red-800">Modify OrderService, UserService, Controller</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-200 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-red-700">✗</span>
                  </div>
                  <p className="text-sm leading-relaxed text-red-800">Blast radius: 4</p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-red-200 bg-red-100 px-3 py-2.5">
                <p className="font-mono text-[11px] font-semibold text-red-800">
                  New requirement → <em>edit existing</em> classes
                </p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="mt-8 rounded-xl border border-hairline bg-paper px-6 py-4">
            <p className="font-serif text-base italic text-ink-muted leading-relaxed">
              &ldquo;Open for extension, closed for modification &mdash; the principle that separates extensible designs from fragile ones.&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* ─── SECTION 3: SCENARIO EXAMPLES ────────────────────────────── */}
      <section className="bg-brand-tint py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <h2 className="mb-2 font-serif text-3xl font-medium text-ink">
            Requirement change types you&rsquo;ll practice.
          </h2>
          <p className="mb-10 text-base text-ink-muted">
            Each scenario starts with a clean design and introduces a realistic extension challenge.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Card 1 */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
                    Payment System
                  </p>
                  <p className="mt-1 font-serif text-lg font-medium text-ink">Add a payment method</p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <span className="font-mono text-xs font-bold text-brand">01</span>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">PayPal</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">also Crypto</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                The payment pipeline already handles card and PayPal. A new cryptocurrency method arrives. Can your design absorb it without touching the existing payment processors?
              </p>
              <div className="mt-4 inline-block rounded bg-green-100 px-2.5 py-1 font-mono text-xs font-semibold text-green-700">
                Ideal blast radius: 0
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
                    Notification Pipeline
                  </p>
                  <p className="mt-1 font-serif text-lg font-medium text-ink">Add a notification channel</p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <span className="font-mono text-xs font-bold text-brand">02</span>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">Email</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">also SMS</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                Notifications go out via email. The product team now wants SMS. Does adding a channel mean touching the notification dispatcher, or just adding a new sender implementation?
              </p>
              <div className="mt-4 inline-block rounded bg-green-100 px-2.5 py-1 font-mono text-xs font-semibold text-green-700">
                Ideal blast radius: 0
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
                    Export System
                  </p>
                  <p className="mt-1 font-serif text-lg font-medium text-ink">Add an export format</p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <span className="font-mono text-xs font-bold text-brand">03</span>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">PDF</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">also CSV</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                Reports can be exported as PDF. A request comes in for CSV export. Can the export engine accommodate a new format by addition only — or does it need surgery?
              </p>
              <div className="mt-4 inline-block rounded bg-green-100 px-2.5 py-1 font-mono text-xs font-semibold text-green-700">
                Ideal blast radius: 0
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
                    Pricing Engine
                  </p>
                  <p className="mt-1 font-serif text-lg font-medium text-ink">Add a discount type</p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <span className="font-mono text-xs font-bold text-brand">04</span>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">Percentage</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                <span className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs">also Fixed</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                The pricing engine applies a percentage discount. A new fixed-amount discount is required. The question: did the original design anticipate this, or does it need a rewrite?
              </p>
              <div className="mt-4 inline-block rounded bg-green-100 px-2.5 py-1 font-mono text-xs font-semibold text-green-700">
                Ideal blast radius: 0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: SCORING BREAKDOWN ─────────────────────────────── */}
      <section className="bg-paper py-14" id="how-it-works">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <h2 className="mb-2 font-serif text-3xl font-medium text-ink">
            How it works.
          </h2>
          <p className="mb-10 text-base text-ink-muted">
            Four steps from existing design to blast-radius score.
          </p>

          {/* 4-step process */}
          <div className="mb-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', verb: 'Read the design', body: 'A complete, clean design for a known system. Understand the class structure and responsibilities before the change arrives.' },
              { n: '02', verb: 'Receive the change', body: 'A new requirement: &ldquo;support a new payment method,&rdquo; &ldquo;add a notification channel.&rdquo; Absorb it with minimal disruption.' },
              { n: '03', verb: 'Apply minimal change', body: 'Modify the design. New classes are always free &mdash; modifications to existing ones accumulate blast radius.' },
              { n: '04', verb: 'See the comparison', body: 'Your design vs. the ideal OCP-compliant solution. Blast radius, which classes you touched, and how the ideal differs.' },
            ].map(step => (
              <div key={step.n} className="flex flex-col gap-3 bg-paper-elevated p-5">
                <span className="font-mono text-[11px] font-bold text-ink-faint">{step.n}</span>
                <p className="font-serif text-[17px] font-medium text-ink">{step.verb}</p>
                <p className="text-sm leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: step.body }} />
              </div>
            ))}
          </div>

          {/* Feature highlight cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: Activity,
                label: 'Blast radius measurement',
                desc: 'Your score includes a blast radius count — how many existing classes you modified. Lower is better. The ideal solution\'s blast radius is shown for comparison.',
              },
              {
                Icon: Shield,
                label: 'OCP validation',
                desc: 'The validator checks whether your change is Open-Closed Principle compliant: open for extension (you added new classes), closed for modification (you did not change existing ones).',
              },
              {
                Icon: TrendingUp,
                label: 'Extensibility scoring',
                desc: 'Beyond OCP, your solution is scored on extensibility: would adding a third variant require another round of modifications, or is your design already prepared for it?',
              },
              {
                Icon: Timer,
                label: 'Real interview format',
                desc: 'This is the exact format of the "what if requirements change" follow-up that interviewers use to probe whether your initial design was truly extensible or just locally tidy.',
              },
              {
                Icon: Zap,
                label: 'Mid-design surprise',
                desc: 'The requirement arrives after you have studied the starting design — simulating the moment in an interview when the interviewer introduces a constraint you did not anticipate.',
              },
              {
                Icon: GitCompare,
                label: 'Comparison to ideal fix',
                desc: 'The ideal solution is shown alongside yours after you submit. Every difference is explained — you learn not just that you could have done better, but exactly how.',
              },
            ].map(({ Icon, label, desc }) => (
              <div key={label} className="rounded-xl border border-hairline bg-paper-elevated p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-tint">
                  <Icon className="h-4.5 w-4.5 text-brand" />
                </div>
                <p className="font-serif text-[15px] font-medium text-ink">{label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHO IT'S FOR ──────────────────────────────────── */}
      <section className="border-t border-hairline bg-paper-elevated py-14">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <h2 className="mb-2 font-serif text-3xl font-medium text-ink">
            Who it&rsquo;s for.
          </h2>
          <p className="mb-8 text-base text-ink-muted">
            If you know OCP exists but struggle to apply it under pressure, this is your practice ground.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              'Engineers who understand the Open-Closed Principle in theory but cannot apply it quickly under interview pressure.',
              'Candidates who get follow-up questions like &ldquo;what if we also need to support X?&rdquo; and do not know where to start.',
              'Anyone whose initial designs tend to require large-scale rework when requirements change — the hallmark of an OCP-unaware design.',
              'Senior engineers who want to demonstrate design foresight and extensibility reasoning in principal/staff-level interviews.',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-hairline bg-paper p-4">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <span className="font-mono text-[10px] font-bold text-brand">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FAQ + CROSS-LINKS ────────────────────────────── */}
      <section className="border-t border-hairline bg-paper">
        <FeatureFaq items={FAQ} />
      </section>

      <FeatureCrossLinks exclude="/features/change-one-thing" />
    </main>
  )
}
