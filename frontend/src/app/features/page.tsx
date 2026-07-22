import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { publicApi } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { JsonLd } from '@/components/seo/JsonLd'
import { DiagramStage, DiagramNode, DiagramBox, type DiagramEdge } from '@/components/marketing/ConnectedDiagram'
import { FeaturesLedger, type LedgerRow } from '@/components/features/FeaturesLedger'
import { Reveal } from '@/components/features/Reveal'

export const metadata: Metadata = {
  title: 'LLD Interview Preparation Platform — Features | LLDCanvas',
  description:
    'Everything you need to prepare for Low-Level Design (LLD) and machine coding interviews: a real UML class diagram editor, Draft Notation plain-English diagramming, timed Interview Mode, 100+ LLD interview questions from real companies, design pattern revision notes, multi-language code execution, and real-time collaboration.',
  keywords: [
    'low level design interview', 'low level design interview questions', 'LLD interview preparation',
    'LLD interview questions and answers', 'machine coding round', 'object oriented design interview',
    'UML diagram editor online', 'UML class diagram tool', 'design patterns interview questions',
    'SOLID principles interview', 'system design interview practice', 'software architecture interview',
    'LLD mock interview', 'HLD vs LLD', 'object oriented design practice',
  ],
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'LLDCanvas — Low-Level Design Interview Preparation Platform',
    description: 'UML editor, Draft Notation, Interview Mode, 100+ LLD interview questions, design pattern revision notes, code execution, and real-time collaboration.',
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
    a: 'Strategy, Factory, Singleton, Observer, Decorator, and Builder appear constantly, usually because a stated requirement — "support multiple payment methods," "notify users on status change" — maps directly onto one of them. LLDCanvas’s revision notes cover all 23 classic design patterns, each with a concrete analogy.',
  },
  {
    q: 'How should I prepare for a machine coding round?',
    a: 'Practice under a timer, out loud, the way the real round runs: read the requirements, identify the entities, choose relationships and patterns deliberately, then generate working code. LLDCanvas’s Interview Mode and 100+ practice problems are built specifically around that loop.',
  },
  {
    q: 'Which companies ask Low-Level Design interview questions?',
    a: 'Amazon, Uber, Flipkart, Swiggy, Ola, Walmart, and most Series B+ product companies run a dedicated LLD or machine coding round, often as the deciding round for SDE-2 and senior roles. Every problem in LLDCanvas’s library is tagged by the companies known to ask it.',
  },
  {
    q: 'Is LLDCanvas free to use?',
    a: 'Yes — the UML editor, Draft Notation, a subset of practice problems, and revision notes are free. Interview Mode, the full 100+ problem library, and multi-language code execution are part of the paid plan; see Pricing for details.',
  },
]

// Seven nodes hand-placed around a center hub, angle-stepped by 360/7° at a
// fixed radius (computed once, not guessed) — DiagramStage measures the real
// rendered boxes and draws the connectors, so these coordinates only need to
// be "roughly a ring," never pixel-perfect.
const ORBIT_POSITIONS = [
  { left: '50%',   top: '10%'   },
  { left: '81.3%', top: '25.1%' },
  { left: '89.0%', top: '58.9%' },
  { left: '67.4%', top: '86.0%' },
  { left: '32.6%', top: '86.0%' },
  { left: '11.0%', top: '58.9%' },
  { left: '18.7%', top: '25.1%' },
]

const ORBIT_SIDES: Array<{ hub: 'top' | 'right' | 'bottom' | 'left'; node: 'top' | 'right' | 'bottom' | 'left' }> = [
  { hub: 'top',    node: 'bottom' },
  { hub: 'right',  node: 'left'   },
  { hub: 'right',  node: 'left'   },
  { hub: 'bottom', node: 'top'    },
  { hub: 'bottom', node: 'top'    },
  { hub: 'left',   node: 'right'  },
  { hub: 'left',   node: 'right'  },
]

export default async function FeaturesHubPage() {
  const [problemsRes, notesRes] = await Promise.all([
    publicApi.problems.list(),
    publicApi.revisionNotes.list(),
  ])
  const problemCount = problemsRes?.problems.length ?? 0
  const noteCount    = notesRes?.notes.length ?? 0

  const orbitNodes = [
    { id: 'editor',    name: 'The Editor',       field: '5 node types · 23 patterns',        href: '/features/editor' },
    { id: 'draft',     name: 'Draft Notation',   field: 'Plain English → UML',                href: '/features/draft-notation' },
    { id: 'code',      name: 'Code Execution',   field: '12 languages, live',                 href: '/features/code-execution' },
    { id: 'interview', name: 'Interview Mode',   field: 'Timed sessions + streaks',            href: '/features/interview-mode' },
    { id: 'collab',    name: 'Collaboration',    field: 'Live cursors + comments',             href: '/features/collaboration' },
    { id: 'notes',     name: 'Revision Notes',   field: `${noteCount} concept notes`,          href: '/features/revision-notes' },
    { id: 'problems',  name: 'Practice Problems', field: `${problemCount}+ curated questions`, href: '/features/interview-questions' },
  ]

  const edges: DiagramEdge[] = orbitNodes.map((n, i) => ({
    id: `hub-${n.id}`,
    from: { node: 'hub', side: ORBIT_SIDES[i].hub },
    to: { node: n.id, side: ORBIT_SIDES[i].node },
    marker: 'diamond-filled',
    markerSide: 'start',
  }))

  const ledgerRows: LedgerRow[] = [
    {
      n: '01', title: 'The Editor',
      teaser: 'A real UML class-diagram canvas — not a generic flowchart tool.',
      body: 'Model classes with typed attributes, methods, and visibility modifiers, then connect them with all seven real relationship types — association, aggregation, composition, inheritance, realization, dependency, and bidirectional — each rendered with the correct UML notation. Built for the exact vocabulary interviewers grade you on.',
      chips: ['5 node types', '7 relationship types', '23 design patterns'],
      href: '/features/editor',
    },
    {
      n: '02', title: 'Draft Notation',
      teaser: 'Type a sentence, get a diagram — a shorthand only LLDCanvas has.',
      body: 'Write "Order has many OrderItem" or "PaymentStrategy implements Strategy" in plain English and watch it resolve into real classes and relationships instantly. It is how you think out loud in an interview — translated directly into notation, without breaking your train of thought to hand-place boxes.',
      chips: ['has / owns', 'implements / extends', 'uses / includes'],
      href: '/features/draft-notation',
    },
    {
      n: '03', title: 'Interview Mode',
      teaser: 'A ticking clock and a blank canvas — the actual conditions you\'ll face.',
      body: 'Every real LLD round has a timer you cannot see and pressure you cannot rehearse away except by rehearsing it. Interview Mode reproduces both: a visible countdown, a structured problem brief, and a streak tracker that keeps you practicing on the days you would rather not.',
      chips: ['Live countdown', 'Daily streaks', 'Structured briefs'],
      href: '/features/interview-mode',
    },
    {
      n: '04', title: 'Practice Problems',
      teaser: `${problemCount}+ real interview questions, sourced from real companies.`,
      body: 'Parking lots, elevators, rate limiters, ride-hailing systems, distributed caches — the actual questions asked at the companies that ask them, each with functional and non-functional requirements written the way an interviewer would state them, not a textbook.',
      chips: [`${problemCount}+ problems`, 'Company-tagged', 'Difficulty-ranked'],
      href: '/features/interview-questions',
    },
    {
      n: '05', title: 'Revision Notes',
      teaser: `${noteCount} concept notes for the theory behind every design decision.`,
      body: 'SOLID principles, the 23 classic design patterns, core OOP concepts, and system-design fundamentals — each note built around a concrete analogy so the concept sticks, not just a definition to memorize the night before.',
      chips: ['Design patterns', 'SOLID principles', 'OOP fundamentals'],
      href: '/features/revision-notes',
    },
    {
      n: '06', title: 'Code Execution',
      teaser: 'Turn your diagram into compiling code in 12 languages.',
      body: 'Generate real, runnable scaffolding from your class diagram and execute it in-browser against Python, Java, C++, C#, Go, Rust, TypeScript, and more — so the diagram you drew is provably a design that actually compiles, not just a picture.',
      chips: ['12 languages', 'Live execution', 'Diagram → code'],
      href: '/features/code-execution',
    },
    {
      n: '07', title: 'Collaboration',
      teaser: 'Two interviewers, one canvas, zero screen-share lag.',
      body: 'Share a room and design together in real time — live cursors, named presence, and inline comments on any node. Built for mock interviews with a friend or a live pairing session, exactly the way the real thing happens over a video call.',
      chips: ['Live cursors', 'Inline comments', 'Real-time sync'],
      href: '/features/collaboration',
    },
  ]

  return (
    <div className="overflow-x-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'LLDCanvas Features',
        description: 'A UML class diagram editor, Draft Notation, timed Interview Mode, LLD interview questions, revision notes, multi-language code execution, and real-time collaboration for Low-Level Design interview preparation.',
        url: 'https://lldcanvas.com/features',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: orbitNodes.map((n, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: n.name,
            url: `https://lldcanvas.com${n.href}`,
          })),
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lldcanvas.com/' },
          { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://lldcanvas.com/features' },
        ],
      }} />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — headline + the platform's own feature set drawn as a UML     */}
      {/* diagram of itself: one hub, seven connected nodes.                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(35,78,63,0.1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />

        <Reveal className="relative mx-auto max-w-4xl px-6 pt-10 pb-8 text-center sm:px-10 sm:pt-14" y={16}>
          <p className="mb-6 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶00</span> &nbsp;·&nbsp; LLDCanvas Platform
          </p>
          <h1 className="mx-auto font-serif text-[clamp(2.3rem,5vw,4rem)] font-medium leading-[1.05] tracking-tight text-ink">
            Master LLD interviews
            <span className="block text-brand">with real, hands-on LLD practice.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-ink-muted">
            Seven features. We didn&rsquo;t write another icon grid to describe them —
            we diagrammed them, the same way you&rsquo;ll diagram your next LLD interview.
          </p>
        </Reveal>

        {/* ── The orbit diagram: real DiagramStage, real DOM, real links ──── */}
        {/* md+ only — seven fixed-size boxes need real room to breathe, and a
            phone-width square can't give them that without shrinking boxes
            past legibility. Below md, the plain grid further down takes over. */}
        {/* Padding lives on the outer wrapper only — the aspect-square stage
            itself must have zero padding, or asymmetric px/py turns its
            content box into a non-square rectangle and the "circle" of
            nodes renders as a lopsided ellipse. */}
        <div className="relative mx-auto hidden w-full max-w-190 px-6 py-16 md:block">
          <div className="relative aspect-square w-full">
            <DiagramStage edges={edges} className="h-full w-full">
              <DiagramNode
                id="hub"
                className="left-1/2 top-1/2 z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-brand bg-brand text-center shadow-lg"
              >
                <Reveal y={0} className="flex h-full w-full flex-col items-center justify-center" delay={0.15}>
                  <span className="font-serif text-[15px] font-semibold leading-tight text-brand-foreground">LLD<br />Canvas</span>
                </Reveal>
              </DiagramNode>

              {orbitNodes.map((n, i) => (
                <DiagramNode
                  key={n.id}
                  id={n.id}
                  className="z-20 w-43 -translate-x-1/2 -translate-y-1/2"
                  style={ORBIT_POSITIONS[i]}
                >
                  {/* y stays 0 here — DiagramStage measures this box's real
                      rect once on mount, and any transform-based motion
                      (translate/scale) shifts what getBoundingClientRect
                      reports, throwing the connector line off after it
                      settles. Opacity alone animates without moving the box. */}
                  <Reveal y={0} delay={0.25 + i * 0.08}>
                    <Link href={n.href} className="block transition-transform hover:-translate-y-0.5">
                      <DiagramBox name={n.name} fields={[n.field]} />
                    </Link>
                  </Reveal>
                </DiagramNode>
              ))}
            </DiagramStage>
          </div>
        </div>

        {/* ── Mobile/tablet fallback: same seven links, plain card grid ───── */}
        <div className="relative mx-auto grid max-w-lg grid-cols-1 gap-3 px-6 pb-4 sm:grid-cols-2 md:hidden">
          {orbitNodes.map((n, i) => (
            <Reveal key={n.id} delay={i * 0.06} y={14}>
              <Link
                href={n.href}
                className="block rounded-md border border-hairline-strong bg-paper-elevated p-4 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <p className="font-mono text-[12.5px] font-semibold text-ink">{n.name}</p>
                <p className="mt-1.5 font-mono text-[10.5px] leading-5 text-ink-muted">{n.field}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.5} className="relative mx-auto -mt-2 max-w-xl px-6 pb-16 pt-8 text-center md:pt-0">
          <p className="font-mono text-[11px] text-ink-faint">
            Every one links straight to its feature — click through.
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* WHAT IS LLD — informational content carrying the keyword weight so */}
      {/* the hero copy above can stay purely editorial, not keyword-stuffed. */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated py-20 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-6 sm:px-10">
          <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶01</span> &nbsp;·&nbsp; What Is Low-Level Design?
          </p>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            The round that grades your design, not your syntax.
          </h2>
          <p className="mt-6 text-[15.5px] leading-relaxed text-ink-muted">
            Low-Level Design (LLD) — sometimes called the machine coding round or
            object-oriented design round — asks you to turn a real system, like a
            parking lot, a ride-hailing app, or a rate limiter, into classes,
            interfaces, and relationships that actually compile. Where a
            High-Level Design (HLD) interview stays at the level of services and
            databases, an LLD interview wants to see your UML: inheritance,
            composition, the design pattern you reached for, and why.
          </p>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
            Amazon, Uber, Flipkart, Swiggy, and most product-based companies run
            LLD rounds specifically to see this — SOLID principles applied under
            time pressure, not recited from memory. LLDCanvas is built around
            exactly that loop: draw the diagram, defend the pattern, generate the
            code, and revise the concept you got wrong — all timed, all practiced
            against real interview questions.
          </p>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LEDGER — one continuous expanding index, replacing repeated strips  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <Reveal>
            <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶02</span> &nbsp;·&nbsp; The Full Manifest
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Seven entries. Read any one.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              Click a row to expand it in place. Every entry links through to its
              own dedicated page for the full detail.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <FeaturesLedger rows={ledgerRows} />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CLOSING — light, brand-tinted (no dark section)                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-brand-tint py-24 sm:py-28">
        <Reveal className="mx-auto max-w-2xl px-6 text-center sm:px-10">
          <p className="mb-6 font-mono text-[10px] font-bold tracking-[0.25em] text-brand uppercase">
            <span className="text-gold">¶03</span> &nbsp;·&nbsp; Why We Built This
          </p>
          <blockquote className="font-serif text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl">
            &ldquo;Most LLD prep is a PDF of questions and a blank whiteboard.
            We built the tool we wished we&rsquo;d had — the diagram, the drill,
            and the review, in one place.&rdquo;
          </blockquote>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/?auth=1"
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
