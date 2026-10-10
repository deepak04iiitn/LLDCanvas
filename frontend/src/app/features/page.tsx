import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { publicApi } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { JsonLd } from '@/components/seo/JsonLd'
import { Reveal } from '@/components/features/Reveal'

export const metadata: Metadata = {
  title: 'LLD Interview Preparation Platform — Features | LLDCanvas',
  description:
    'Everything you need to prepare for Low-Level Design (LLD) and machine coding interviews: a real UML class diagram editor, Draft Notation plain-English diagramming, timed Interview Mode, 110+ LLD interview questions from real companies, design pattern revision notes, multi-language code execution, and real-time collaboration.',
  keywords: [
    'low level design interview', 'low level design interview questions', 'LLD interview preparation',
    'LLD interview questions and answers', 'machine coding round', 'object oriented design interview',
    'UML diagram editor online', 'UML class diagram tool', 'design patterns interview questions',
    'SOLID principles interview', 'system design interview practice', 'software architecture interview',
    'LLD mock interview', 'HLD vs LLD', 'object oriented design practice',
    'LLD Practice Platform', 'LLD Design Patterns', 'Interactive LLD Practice',
  ],
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'LLDCanvas — Low-Level Design Interview Preparation Platform',
    description: 'UML editor, Draft Notation, Interview Mode, 110+ LLD interview questions, design pattern revision notes, code execution, and real-time collaboration.',
    type: 'website', url: '/features',
  },
}

const FAQ_ITEMS = [
  {
    q: 'What is a Low-Level Design (LLD) interview?',
    a: 'An LLD interview — also called a machine coding round or object-oriented design round — asks you to design the internal classes, interfaces, and relationships of a system, like a parking lot or a ride-hailing app, using UML and object-oriented principles. It is a standard round at most product-based tech companies, usually graded on the design patterns and SOLID principles you apply, not just whether the code runs.',
  },
  {
    q: 'What is the difference between HLD and LLD interviews?',
    a: 'High-Level Design (HLD) covers system architecture — services, databases, load balancers, caching, and how they scale. Low-Level Design (LLD) goes one level deeper: the actual classes, interfaces, design patterns, and relationships inside a single service or module. Most interview loops test both, in separate rounds.',
  },
  {
    q: 'Which design patterns come up most often in LLD interviews?',
    a: 'Strategy, Factory, Singleton, Observer, Decorator, and Builder appear constantly, usually because a stated requirement — "support multiple payment methods," "notify users on status change" — maps directly onto one of them. LLDCanvas\'s revision notes cover all 23 classic design patterns, each with a concrete analogy.',
  },
  {
    q: 'How should I prepare for a machine coding round?',
    a: 'Practice under a timer, out loud, the way the real round runs: read the requirements, identify the entities, choose relationships and patterns deliberately, then generate working code. LLDCanvas\'s Interview Mode and 110+ practice problems are built specifically around that loop.',
  },
  {
    q: 'Which companies ask Low-Level Design interview questions?',
    a: 'Amazon, Uber, Flipkart, Swiggy, Ola, Walmart, and most Series B+ product companies run a dedicated LLD or machine coding round, often as the deciding round for SDE-2 and senior roles. Every problem in LLDCanvas\'s library is tagged by the companies known to ask it.',
  },
  {
    q: 'Is LLDCanvas free to use?',
    a: 'Yes — the UML editor, Draft Notation, a subset of practice problems, and revision notes are free. Interview Mode, the full 110+ problem library, and multi-language code execution are part of the paid plan; see Pricing for details.',
  },
]

/* ─────────────────────────────────────────────────────────── */
/* Shared chip component                                        */
/* ─────────────────────────────────────────────────────────── */
function Chip({ label, tinted }: { label: string; tinted?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${
        tinted
          ? 'border-brand/20 bg-paper-elevated text-ink-muted'
          : 'border-hairline bg-paper text-ink-muted'
      }`}
    >
      {label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* Inline "explore" link arrow                                  */
/* ─────────────────────────────────────────────────────────── */
function ExploreLink({ label, size = 'sm' }: { label: string; size?: 'sm' | 'xs' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-brand ${
        size === 'xs' ? 'text-[12px]' : 'text-[13px]'
      }`}
    >
      {label} <ArrowRight className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
    </span>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* Page                                                         */
/* ─────────────────────────────────────────────────────────── */
export default async function FeaturesHubPage() {
  const [problemsRes, notesRes] = await Promise.all([
    publicApi.problems.list(),
    publicApi.revisionNotes.list(),
  ])
  const problemCount = problemsRes?.problems.length ?? 0
  const noteCount    = notesRes?.notes.length ?? 0

  /* All 17 feature slugs for JSON-LD ItemList */
  const allFeatures = [
    { name: 'The Editor',        url: '/features/editor' },
    { name: 'Draft Notation',    url: '/features/draft-notation' },
    { name: 'Interview Mode',    url: '/features/interview-mode' },
    { name: 'Practice Problems', url: '/features/interview-questions' },
    { name: 'Revision Notes',    url: '/features/revision-notes' },
    { name: 'Code Execution',    url: '/features/code-execution' },
    { name: 'Collaboration',     url: '/features/collaboration' },
    { name: 'Plannr',            url: '/features/plannr' },
    { name: 'Daily Quiz',        url: '/features/daily-quiz' },
    { name: 'Pattern Detective', url: '/features/pattern-detective' },
    { name: 'Debug Lab',         url: '/features/debug-lab' },
    { name: 'Roguelike',         url: '/features/roguelike' },
    { name: 'Debug & Fix',       url: '/features/debug-and-fix' },
    { name: 'Refactor',          url: '/features/refactor' },
    { name: 'Change One Thing',  url: '/features/change-one-thing' },
    { name: 'Evolution',         url: '/features/evolution' },
    { name: 'Budget Pressure',   url: '/features/budget-pressure' },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ── Structured data ─────────────────────────────────────── */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'LLDCanvas Features',
        description: 'Seventeen features for Low-Level Design interview preparation: UML editor, Draft Notation, Interview Mode, practice problems, revision notes, code execution, collaboration, and eight applied challenge labs.',
        url: 'https://www.lldcanvas.in/features',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: allFeatures.map((f, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: f.name,
            url: `https://www.lldcanvas.in${f.url}`,
          })),
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://www.lldcanvas.in/' },
          { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://www.lldcanvas.in/features' },
        ],
      }} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO                                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative border-b border-hairline bg-paper">
        {/* Dot-grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(166,159,140,0.28) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-12 sm:px-8 sm:pt-20">
          <Reveal y={14}>
            <p className="mb-4 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶00</span>&nbsp;&nbsp;·&nbsp;&nbsp;LLDCanvas Platform
            </p>
            <h1 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.06] tracking-tight text-ink">
              Every tool you need<br />
              <span className="text-brand">to ace your LLD interview.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-muted">
              Seventeen features organized around the only thing that matters —
              going from blank canvas to a design that compiles, under the conditions
              of the actual interview.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper-elevated px-7 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                See pricing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          {/* Stat strip */}
          <Reveal delay={0.12} className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: '17',              label: 'Features' },
              { n: `${problemCount}+`, label: 'LLD Problems' },
              { n: '10',              label: 'Quiz Questions / Day' },
              { n: '12',              label: 'Languages' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-hairline bg-paper-elevated px-5 py-4">
                <p className="font-serif text-3xl font-medium text-ink">{stat.n}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* WHAT IS LLD                                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

            <Reveal>
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
                <span className="text-gold">¶01</span>&nbsp;&nbsp;·&nbsp;&nbsp;What Is Low-Level Design?
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
                The round that grades your design, not your syntax.
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-ink-muted">
                Low-Level Design (LLD) — sometimes called the machine coding round or
                object-oriented design round — asks you to turn a real system into classes,
                interfaces, and relationships that actually compile. Where a High-Level
                Design interview stays at the level of services and databases, an LLD
                interview wants your UML: inheritance, composition, the design pattern
                you reached for, and why.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
                Amazon, Uber, Flipkart, Swiggy, and most product-based companies run LLD
                rounds specifically to see SOLID principles applied under time pressure.
                LLDCanvas is built around exactly that loop.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-xl border border-hairline bg-paper">
                {[
                  {
                    label: 'Companies that ask LLD',
                    value: 'Amazon, Uber, Flipkart, Swiggy, Ola, Walmart',
                  },
                  {
                    label: 'What you\'re graded on',
                    value: 'SOLID principles, design patterns, UML notation, and reasoning under pressure',
                  },
                  {
                    label: 'When it appears',
                    value: 'SDE-2 and senior rounds — often the deciding interview',
                  },
                ].map((item, i) => (
                  <div key={item.label} className={`px-5 py-5 ${i > 0 ? 'border-t border-hairline' : ''}`}>
                    <p className="font-mono text-[10px] font-bold tracking-wider text-brand uppercase">
                      {item.label}
                    </p>
                    <p className="mt-2 font-serif text-[15px] font-medium leading-snug text-ink">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — DESIGN STUDIO (4 features)                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">

          <Reveal className="mb-10">
            <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶02</span>&nbsp;&nbsp;·&nbsp;&nbsp;Design Studio&nbsp;&nbsp;·&nbsp;&nbsp;4 tools
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Draw it the way interviewers grade it.
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              A proper UML canvas, plain-English notation, multi-language execution,
              and real-time collaboration — the full design stack in one place.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* Featured: The Editor — 2/3 width */}
            <Reveal delay={0.05} className="lg:col-span-2">
              <Link
                href="/features/editor"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-paper-elevated transition-colors hover:border-brand/40"
              >
                {/* CSS UML Mockup */}
                <div className="relative overflow-hidden border-b border-hairline bg-paper px-6 pt-6">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(35,78,63,0.1) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                    aria-hidden
                  />
                  <div className="relative flex flex-col items-center gap-3 pb-2">
                    {/* Interface box */}
                    <div className="w-56 overflow-hidden rounded-md border border-brand/40 shadow-sm">
                      <div className="border-b border-brand/30 bg-brand-tint px-3 py-1 text-center font-mono text-[9px] text-brand">
                        «interface»
                      </div>
                      <div className="border-b border-hairline bg-paper-elevated px-3 py-1.5 text-center font-serif text-[13px] font-semibold text-ink">
                        PaymentStrategy
                      </div>
                      <div className="bg-paper-elevated px-3 py-1.5 font-mono text-[9px] text-ink-muted">
                        + pay(amount: float): bool
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-4 w-px border-l-2 border-dashed border-brand/30" />
                      <span className="font-mono text-[8px] text-brand/40">realizes</span>
                    </div>
                    {/* Implementations */}
                    <div className="flex gap-3">
                      {['CreditCard\nPayment', 'UPI\nPayment', 'DebitCard\nPayment'].map(name => (
                        <div key={name} className="w-32 overflow-hidden rounded-md border border-hairline bg-paper-elevated shadow-sm">
                          <div className="border-b border-hairline bg-paper px-2 py-1.5 text-center font-serif text-[11px] font-semibold leading-tight text-ink" style={{ whiteSpace: 'pre-line' }}>
                            {name}
                          </div>
                          <div className="px-2 py-1.5 font-mono text-[8px] text-ink-muted">+ pay(): bool</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                    01 · The Editor
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-ink">
                    A real UML class-diagram canvas.
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    Model classes with typed attributes, methods, and visibility modifiers,
                    then connect them with all seven UML relationship types. 5 node types,
                    7 relationship types, all 23 GoF patterns — not a flowchart tool.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['5 node types', '7 relationship types', '23 design patterns'].map(c => (
                      <Chip key={c} label={c} />
                    ))}
                  </div>
                  <div className="mt-4">
                    <ExploreLink label="Explore the Editor" />
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* Right column: 3 compact stacked cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  n: '02', title: 'Draft Notation', href: '/features/draft-notation',
                  teaser: 'Type a sentence, get a diagram.',
                  body: 'Write "Order has many OrderItem" and watch it resolve into real classes and relationships instantly — without breaking your train of thought.',
                  chips: ['has / owns', 'implements / extends'],
                },
                {
                  n: '06', title: 'Code Execution', href: '/features/code-execution',
                  teaser: 'Diagram → compiling code in 12 languages.',
                  body: 'Generate real, runnable scaffolding from your class diagram and execute in-browser across Python, Java, Go, Rust, TypeScript, and more.',
                  chips: ['12 languages', 'Live execution'],
                },
                {
                  n: '07', title: 'Collaboration', href: '/features/collaboration',
                  teaser: 'Two interviewers, one canvas, zero lag.',
                  body: 'Share a room and design together in real time — live cursors, named presence, and inline comments on any node.',
                  chips: ['Live cursors', 'Inline comments'],
                },
              ].map((f, i) => (
                <Reveal key={f.n} delay={0.05 + i * 0.07}>
                  <Link
                    href={f.href}
                    className="group flex h-full flex-col rounded-2xl border border-hairline bg-paper-elevated p-5 transition-colors hover:border-brand/40"
                  >
                    <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                      {f.n} · {f.title}
                    </p>
                    <p className="font-serif text-[15px] font-semibold leading-snug text-ink">{f.teaser}</p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{f.body}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {f.chips.map(c => <Chip key={c} label={c} />)}
                    </div>
                    <div className="mt-3">
                      <ExploreLink label="Explore" size="xs" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — PREPARATION ENGINE (5 features)               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">

          <Reveal className="mb-10">
            <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶03</span>&nbsp;&nbsp;·&nbsp;&nbsp;Preparation Engine&nbsp;&nbsp;·&nbsp;&nbsp;5 tools
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Structured practice for the round that matters.
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              Timed sessions, a curated problem library, concept notes, daily drills,
              and a sequenced roadmap — everything to build the habit alongside the skill.
            </p>
          </Reveal>

          {/* Row 1 — two wide featured cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                n: '03', title: 'Interview Mode', href: '/features/interview-mode',
                teaser: 'A ticking clock and a blank canvas.',
                body: 'Every real LLD round has a timer you can\'t see and pressure you can\'t rehearse away except by rehearsing it. Interview Mode reproduces both: a visible countdown, a structured problem brief, and a streak tracker that keeps you practicing on the days you would rather not.',
                chips: ['Live countdown', 'Daily streaks', 'Structured briefs'],
                accent: true,
              },
              {
                n: '04', title: 'Practice Problems', href: '/features/interview-questions',
                teaser: `${problemCount}+ real questions from real companies.`,
                body: 'Parking lots, elevators, rate limiters, ride-hailing systems — the actual questions asked at the companies that ask them, each with functional and non-functional requirements written the way an interviewer would state them.',
                chips: [`${problemCount}+ problems`, 'Company-tagged', 'Difficulty-ranked'],
                accent: false,
              },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 0.06}>
                <Link
                  href={f.href}
                  className={`group flex h-full flex-col rounded-2xl border p-6 transition-colors hover:border-brand/40 ${
                    f.accent
                      ? 'border-brand/25 bg-brand-tint'
                      : 'border-hairline bg-paper'
                  }`}
                >
                  <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                    {f.n} · {f.title}
                  </p>
                  <p className="font-serif text-xl font-semibold leading-snug text-ink">{f.teaser}</p>
                  <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-muted">{f.body}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {f.chips.map(c => <Chip key={c} label={c} tinted={f.accent} />)}
                  </div>
                  <div className="mt-4">
                    <ExploreLink label={`Explore ${f.title}`} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Row 2 — three equal cards */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                n: '05', title: 'Revision Notes', href: '/features/revision-notes',
                teaser: `${noteCount} concept notes.`,
                body: 'SOLID principles, 23 design patterns, core OOP concepts — each built around a concrete analogy so the concept sticks, not just a definition to memorize the night before.',
                chips: ['Design patterns', 'SOLID', 'OOP fundamentals'],
              },
              {
                n: '09', title: 'Daily Quiz', href: '/features/daily-quiz',
                teaser: '10 questions a day keeps the patterns sharp.',
                body: 'A short daily set on design patterns and SOLID principles, refreshed each day with explanations after you answer. Built for the days between full mock sessions.',
                chips: ['Daily refresh', 'Pattern + SOLID', 'Streak tracking'],
              },
              {
                n: '08', title: 'Plannr', href: '/features/plannr',
                teaser: 'A roadmap from zero to interview-ready.',
                body: 'Plannr gives you a sequenced path through LLD topics, problem sets, and milestones — so your prep has direction, not just volume.',
                chips: ['Topic sequence', 'Milestone tracking', 'Gap analysis'],
              },
            ].map((f, i) => (
              <Reveal key={f.n} delay={0.08 + i * 0.06}>
                <Link
                  href={f.href}
                  className="group flex h-full flex-col rounded-2xl border border-hairline bg-paper-elevated p-5 transition-colors hover:border-brand/40"
                >
                  <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">
                    {f.n} · {f.title}
                  </p>
                  <p className="font-serif text-[15px] font-semibold leading-snug text-ink">{f.teaser}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{f.body}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.chips.map(c => <Chip key={c} label={c} />)}
                  </div>
                  <div className="mt-3">
                    <ExploreLink label="Explore" size="xs" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — CHALLENGE LABS (8 modes)                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">

          <Reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
                <span className="text-gold">¶04</span>&nbsp;&nbsp;·&nbsp;&nbsp;Challenge Labs&nbsp;&nbsp;·&nbsp;&nbsp;8 modes
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
                Practice that exposes the gap between knowing and doing.
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                Eight applied challenge modes — each designed around a different kind of
                pressure you will face in a real LLD round. No blank canvas. No hand-holding.
              </p>
            </div>
          </Reveal>

          {/* 4 × 2 compact grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: '10', title: 'Pattern Detective',
                teaser: 'Read code. Name the pattern. Explain why.',
                chips: ['Real code', '23 patterns'],
                href: '/features/pattern-detective',
              },
              {
                n: '11', title: 'Debug Lab',
                teaser: 'Annotate what\'s broken before the interviewer does.',
                chips: ['Real violations', 'Annotation mode'],
                href: '/features/debug-lab',
              },
              {
                n: '13', title: 'Debug & Fix',
                teaser: 'Don\'t just spot the flaw — fix it.',
                chips: ['Active fixing', 'Pattern application'],
                href: '/features/debug-and-fix',
              },
              {
                n: '12', title: 'Roguelike',
                teaser: 'Procedurally generated. No undo. Real pressure.',
                chips: ['No undo', 'Branching outcomes'],
                href: '/features/roguelike',
              },
              {
                n: '14', title: 'Refactor',
                teaser: 'Take a monolith apart without breaking it.',
                chips: ['Monolith → clean', 'SOLID application'],
                href: '/features/refactor',
              },
              {
                n: '15', title: 'Change One Thing',
                teaser: 'A new requirement mid-design. Absorb it.',
                chips: ['OCP practice', 'Blast radius'],
                href: '/features/change-one-thing',
              },
              {
                n: '16', title: 'Evolution',
                teaser: 'Grow a design through multiple stages of scale.',
                chips: ['Multi-stage', 'Trade-off tracking'],
                href: '/features/evolution',
              },
              {
                n: '17', title: 'Budget Pressure',
                teaser: 'The best design you can afford.',
                chips: ['Real constraints', 'Budget tracking'],
                href: '/features/budget-pressure',
              },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 0.04}>
                <Link
                  href={f.href}
                  className="group flex h-full flex-col rounded-xl border border-hairline bg-paper-elevated p-5 transition-colors hover:border-brand/40"
                >
                  {/* Number badge */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-hairline bg-paper font-mono text-[10px] font-bold text-ink-faint">
                      {f.n}
                    </span>
                    <div className="h-px flex-1 bg-hairline" />
                  </div>
                  <p className="font-serif text-[15px] font-semibold leading-snug text-ink">
                    {f.title}
                  </p>
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
                    {f.teaser}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {f.chips.map(c => (
                      <span
                        key={c}
                        className="rounded-full border border-hairline bg-paper px-2 py-0.5 font-mono text-[9px] text-ink-muted"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <ExploreLink label="Explore" size="xs" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CLOSING CTA                                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-brand-tint py-24 sm:py-28">
        <Reveal className="mx-auto max-w-2xl px-6 text-center sm:px-10">
          <p className="mb-6 font-mono text-[10px] font-bold tracking-[0.25em] text-brand uppercase">
            <span className="text-gold">¶05</span>&nbsp;&nbsp;·&nbsp;&nbsp;Why We Built This
          </p>
          <blockquote className="font-serif text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl">
            &ldquo;Most LLD prep is a PDF of questions and a blank whiteboard.
            We built the tool we wished we&rsquo;d had — the diagram, the drill,
            and the review, in one place.&rdquo;
          </blockquote>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Start for free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper-elevated px-7 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              See pricing <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      <Reveal><FeatureFaq items={FAQ_ITEMS} /></Reveal>
      <FeatureCrossLinks />

    </div>
  )
}
