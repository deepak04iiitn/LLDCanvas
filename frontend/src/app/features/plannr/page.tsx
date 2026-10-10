import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, BookOpen, Target, TrendingUp, Calendar, Search, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'

export const metadata: Metadata = {
  title: 'Plannr — Structured LLD Interview Roadmap | LLDCanvas',
  description: 'Plannr gives you a sequenced, curated roadmap to go from zero to LLD interview-ready. Follow a structured learning path through design patterns, SOLID principles, and real interview problems — with milestone tracking built in.',
  keywords: ['LLD interview roadmap', 'LLD learning path', 'how to prepare for LLD interviews', 'LLD preparation plan', 'LLD interview preparation for beginners', 'LLD interview preparation for freshers', 'LLD interview roadmap for SDE1 SDE2', 'best resources for LLD interview preparation'],
  alternates: { canonical: '/features/plannr' },
  openGraph: {
    title: 'Plannr — Structured LLD Interview Roadmap | LLDCanvas',
    description: 'A curated, sequenced roadmap from zero to LLD interview-ready. Topic sequences, problem sets, and milestone tracking.',
    type: 'website',
    url: '/features/plannr',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plannr — Structured LLD Interview Roadmap | LLDCanvas',
    description: 'A curated, sequenced roadmap from zero to LLD interview-ready. Topic sequences, problem sets, and milestone tracking.',
  },
}

const FAQ = [
  { q: 'What is an LLD roadmap?', a: 'An LLD roadmap is a sequenced guide through the topics, concepts, and problems you need to cover before you are interview-ready for Low-Level Design rounds. Rather than a list of resources, it is an ordered path — OOP foundations first, then design patterns, then SOLID principles, then full interview-scale problems — so each concept builds on the last.' },
  { q: 'How long does it take to prepare for LLD?', a: 'For most engineers with basic OOP familiarity, a thorough LLD preparation takes 6–10 weeks at roughly 1 hour per day. Plannr estimates your timeline based on your target depth and daily time commitment, so you can align your prep to your interview schedule rather than guessing.' },
  { q: 'What topics should I cover for LLD interviews?', a: 'The core curriculum is: OOP fundamentals (classes, interfaces, inheritance, polymorphism), SOLID principles, all 23 Gang-of-Four design patterns, UML class diagram notation, and practice on real interview problems like Parking Lot, Elevator System, and Ride-Hailing. Plannr covers all of these in sequence.' },
  { q: 'How is Plannr different from YouTube or LeetCode?', a: 'YouTube gives you unordered individual videos with no guaranteed coverage or progression. LeetCode focuses on DSA problems, not LLD design. Plannr is specifically structured for LLD — it tells you what to learn, in what order, with what problems, and tracks whether you have actually done it.' },
  { q: 'Which companies ask LLD interview questions?', a: "Amazon, Uber, Flipkart, Swiggy, Ola, Walmart, ShareChat, Dream11, and most product-based tech companies include a dedicated LLD or machine coding round — typically at the SDE-2 or above level, but increasingly at SDE-1 too. Plannr's roadmap is built around the patterns and problems these companies are known to ask." },
  { q: 'Can I use Plannr if I already know some LLD?', a: "Yes. Mark topics you have already covered and Plannr performs gap analysis — it shows you exactly what remains and skips what you have already done. You can start at any point in the roadmap rather than from the beginning." },
]

const FOR_WHO = [
  'Engineers starting LLD prep from scratch with no structured plan to follow.',
  'SDE-1s targeting product companies like Amazon, Flipkart, or Uber where LLD is a deciding round.',
  'Engineers who have watched YouTube videos and read blog posts but still feel unready — because they never had a sequence.',
  'Anyone who wants a roadmap with an end-state, not an endless list of "resources."',
]

const FEATURES = [
  { Icon: MapPin,     label: 'Structured topic sequence',      desc: 'Topics ordered the way they should be learned — OOP foundations before patterns, patterns before full problem sets.' },
  { Icon: BookOpen,   label: 'Curated problem sets',           desc: 'Each topic section includes hand-picked problems from real LLD interview banks. No random sourcing.' },
  { Icon: Target,     label: 'Milestone tracking',             desc: 'Named milestones mark progress checkpoints — finishing SOLID, completing pattern sections, clearing your first mock.' },
  { Icon: TrendingUp, label: 'Difficulty progression',         desc: 'Problems are sequenced from foundational to senior-level. The curve is deliberate — you never jump too far ahead.' },
  { Icon: Calendar,   label: 'Preparation timeline',           desc: 'Plannr estimates how many weeks your target depth will take at a given daily time commitment.' },
  { Icon: Search,     label: 'Gap analysis',                   desc: 'Already know some LLD? Mark topics as done and Plannr surfaces only what you have not yet covered.' },
]

export default function PlannrPage() {
  return (
    <main className="bg-paper text-ink">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Plannr — Structured LLD Interview Roadmap', url: 'https://www.lldcanvas.in/features/plannr', description: 'A curated, sequenced roadmap from zero to LLD interview-ready.' }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Features', item: 'https://www.lldcanvas.in/features' }, { '@type': 'ListItem', position: 2, name: 'Plannr', item: 'https://www.lldcanvas.in/features/plannr' }] }} />

      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">

          {/* Left: Text */}
          <div className="flex flex-col justify-center lg:w-[55%] lg:pt-4">
            <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-gold uppercase mb-5">
              08 · PLANNR
            </p>
            <h1 className="font-serif text-4xl font-medium leading-[1.12] text-ink sm:text-5xl mb-6">
              A structured roadmap from zero to LLD interview-ready.
            </h1>
            <p className="text-base leading-relaxed text-ink-muted mb-8 max-w-xl">
              Plannr sequences every topic, problem set, and milestone you need — so your prep has direction, not just volume.
            </p>
            <div>
              <Link
                href="/dashboard/plannr"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-medium text-brand-foreground text-sm transition-opacity hover:opacity-90"
              >
                Start your roadmap
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Roadmap Visual */}
          <div className="lg:w-[45%]">
            <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-sm">

              {/* Milestone nodes */}
              <div className="relative">
                {/* Vertical dashed connector line */}
                <div className="absolute left-[19px] top-5 bottom-5 w-px border-l-2 border-dashed border-hairline-strong" />

                <div className="space-y-6">

                  {/* Node 1 — DONE */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand shadow-sm">
                      <Check className="h-4 w-4 text-brand-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="pt-1.5 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm text-ink leading-snug">OOP Foundations</p>
                        <span className="font-mono text-[10px] text-brand bg-brand-tint px-1.5 py-0.5 rounded font-semibold">DONE</span>
                      </div>
                      <p className="text-xs text-ink-muted">Classes, Interfaces, Polymorphism</p>
                    </div>
                  </div>

                  {/* Node 2 — DONE */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand shadow-sm">
                      <Check className="h-4 w-4 text-brand-foreground" strokeWidth={2.5} />
                    </div>
                    <div className="pt-1.5 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm text-ink leading-snug">Design Patterns</p>
                        <span className="font-mono text-[10px] text-brand bg-brand-tint px-1.5 py-0.5 rounded font-semibold">DONE</span>
                      </div>
                      <p className="text-xs text-ink-muted">All 23 GoF patterns</p>
                    </div>
                  </div>

                  {/* Node 3 — CURRENT */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand bg-brand-tint shadow-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-brand opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
                      </span>
                    </div>
                    <div className="pt-1.5 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm text-ink leading-snug">SOLID Principles</p>
                        <span className="font-mono text-[10px] text-gold bg-gold-tint px-1.5 py-0.5 rounded font-semibold">IN PROGRESS</span>
                      </div>
                      <p className="text-xs text-ink-muted">SRP, OCP, LSP, ISP, DIP</p>
                    </div>
                  </div>

                  {/* Node 4 — UPCOMING */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-hairline-strong bg-paper shadow-sm">
                      <ChevronRight className="h-4 w-4 text-ink-faint" />
                    </div>
                    <div className="pt-1.5 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm text-ink-muted leading-snug">Full Problem Sets</p>
                        <span className="font-mono text-[10px] text-ink-faint bg-paper px-1.5 py-0.5 rounded font-semibold border border-hairline">UPCOMING</span>
                      </div>
                      <p className="text-xs text-ink-faint">Parking Lot, Ride-Hailing…</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Timeline estimate badge */}
              <div className="mt-7 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-4 py-1.5 font-mono text-[12px] font-semibold text-gold">
                  <ArrowRight className="h-3.5 w-3.5" />
                  ~8 weeks at 1h/day
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: STATS BAR ─────────────────────────────────────────────── */}
      <section className="bg-brand">
        <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { number: '23', label: 'Patterns covered' },
              { number: '5',  label: 'SOLID principles' },
              { number: '110+', label: 'Curated problems' },
              { number: '∞',  label: 'Milestone tracking' },
            ].map(({ number, label }) => (
              <div key={label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="font-serif text-4xl font-medium text-brand-foreground sm:text-5xl">{number}</span>
                <span className="mt-1.5 font-mono text-[11px] tracking-wide text-brand-foreground/60 uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: TIMELINE — How it works ───────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-20 sm:px-8">
        <h2 className="font-serif text-2xl font-medium text-ink mb-2 sm:text-3xl">
          Three steps from open to interview-ready.
        </h2>
        <p className="text-ink-muted text-sm mb-12">No guesswork. No wasted sessions. Just a clear path forward.</p>

        <div className="relative">
          {/* Left border line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-hairline-strong sm:left-5" />

          <div className="space-y-12">
            {[
              {
                n: '01',
                verb: 'Set your goal',
                body: 'Tell Plannr your target role — SDE-1, SDE-2, or Senior — to configure roadmap depth and timeline. Your interview date anchors the whole plan.',
              },
              {
                n: '02',
                verb: 'Follow your roadmap',
                body: 'Work through topics and curated problem sets in recommended sequence. Each section builds on the previous — nothing is skipped, nothing is repeated unnecessarily.',
              },
              {
                n: '03',
                verb: 'Track your milestones',
                body: 'A progress dashboard shows which topics you have covered, which problem sets are complete, and which milestones remain. You always know exactly where you stand.',
              },
            ].map(({ n, verb, body }) => (
              <div key={n} className="relative flex gap-8 pl-12 sm:pl-14">
                {/* Step node */}
                <div className="absolute left-0 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand bg-paper sm:h-10 sm:w-10">
                  <span className="font-mono text-[11px] font-bold text-brand sm:text-[12px]">{n}</span>
                </div>
                {/* Content */}
                <div>
                  <p className="font-serif text-lg font-medium text-ink mb-1.5 sm:text-xl">{verb}</p>
                  <p className="text-sm leading-relaxed text-ink-muted max-w-lg">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TARGET ROLE CARDS ─────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated/60 px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-2xl font-medium text-ink mb-2 sm:text-3xl">
            Calibrated for your target.
          </h2>
          <p className="text-ink-muted text-sm mb-10">Pick your level. Plannr sets the depth, the timeline, and the problem load.</p>

          <div className="grid gap-4 sm:grid-cols-3">

            {/* SDE-1 */}
            <div className="rounded-xl border border-hairline bg-paper-elevated p-6">
              <span className="inline-block rounded-md bg-brand-tint px-2.5 py-1 font-mono text-[11px] font-bold text-brand mb-4">SDE-1</span>
              <p className="font-serif text-xl font-medium text-ink mb-1">Foundations first.</p>
              <p className="text-sm text-ink-muted mb-5 leading-relaxed">Patterns & SOLID emphasis. Lighter problem load focused on core interview scenarios.</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Duration</span>
                  <span className="font-medium text-ink">~6 weeks</span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Problem load</span>
                  <span className="font-medium text-ink">Standard</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-ink-faint">
                    <span>Depth</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
                    <div className="h-full w-[55%] rounded-full bg-brand/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* SDE-2 — highlighted */}
            <div className="rounded-xl bg-brand p-6 shadow-md relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block rounded-md bg-white/20 px-2.5 py-1 font-mono text-[11px] font-bold text-brand-foreground">SDE-2</span>
                  <span className="font-mono text-[10px] text-brand-foreground/60 uppercase tracking-wide">Most popular</span>
                </div>
                <p className="font-serif text-xl font-medium text-brand-foreground mb-1">The full curriculum.</p>
                <p className="text-sm text-brand-foreground/70 mb-5 leading-relaxed">Complete roadmap, full problem bank, and milestone tracking across every module.</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-brand-foreground/60">
                    <span>Duration</span>
                    <span className="font-medium text-brand-foreground">8–10 weeks</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-foreground/60">
                    <span>Problem load</span>
                    <span className="font-medium text-brand-foreground">Complete bank</span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-brand-foreground/40">
                      <span>Depth</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-[80%] rounded-full bg-white/70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Senior+ */}
            <div className="rounded-xl border border-hairline bg-paper-elevated p-6">
              <span className="inline-block rounded-md bg-gold-tint px-2.5 py-1 font-mono text-[11px] font-bold text-gold mb-4">Senior+</span>
              <p className="font-serif text-xl font-medium text-ink mb-1">Advanced trade-offs.</p>
              <p className="text-sm text-ink-muted mb-5 leading-relaxed">Extended problem sets with Evolution mode. Architectural depth, constraint reasoning, and open-ended design.</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Duration</span>
                  <span className="font-medium text-ink">10–12 weeks</span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Problem load</span>
                  <span className="font-medium text-ink">Extended + Evolution</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-ink-faint">
                    <span>Depth</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
                    <div className="h-full w-full rounded-full bg-gold/50" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 5: FEATURE DETAILS — 2-column editorial grid ─────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
        <h2 className="font-serif text-2xl font-medium text-ink mb-2 sm:text-3xl">
          Everything built into the path.
        </h2>
        <p className="text-ink-muted text-sm mb-12">Six capabilities that make Plannr more than a checklist.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="group flex gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-colors hover:border-hairline-strong"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint">
                <Icon className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="font-medium text-sm text-ink mb-1 leading-snug">{label}</p>
                <p className="text-[13px] leading-relaxed text-ink-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: WHO IT'S FOR ───────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-brand-tint/40 px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl font-medium text-ink mb-2 sm:text-3xl">
            Built for engineers who need a plan, not just resources.
          </h2>
          <p className="text-ink-muted text-sm mb-10">If any of these sound like you, Plannr is the answer.</p>
          <ul className="space-y-4">
            {FOR_WHO.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand">
                  <Check className="h-3 w-3 text-brand-foreground" strokeWidth={2.5} />
                </div>
                <p className="text-sm leading-relaxed text-ink">{item}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              href="/dashboard/plannr"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-medium text-brand-foreground text-sm transition-opacity hover:opacity-90"
            >
              Start your roadmap
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FAQ + CROSS LINKS ─────────────────────────────────────── */}
      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks exclude="/features/plannr" />
    </main>
  )
}
