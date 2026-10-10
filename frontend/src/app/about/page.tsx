import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  LayoutTemplate, PenLine, Terminal, Users,
  Timer, ListChecks, BookOpen, Flame, CalendarDays,
  Search, Bug, Wrench, RefreshCw, SlidersHorizontal, TrendingUp, DollarSign, Gamepad2,
  CheckCircle2, Compass, Repeat, Scale, Layers, Target, Lightbulb, Zap,
  GraduationCap, Code2, TrendingUp as TrendingUpIcon,
} from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { Reveal } from '@/components/features/Reveal'

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'About LLDCanvas — Low-Level Design Interview Prep Platform',
  description:
    'Learn what LLDCanvas is, why we built it, and how our interactive Low-Level Design practice platform — with UML canvas, 110+ LLD problems, Interview Mode, design pattern training, and 8 Challenge Labs — helps developers ace LLD and machine coding interviews.',
  keywords: [
    'about LLDCanvas', 'LLDCanvas', 'low level design practice platform',
    'LLD interview preparation', 'LLD learning platform', 'LLD practice',
    'object oriented design practice', 'software design interview prep',
    'software architecture learning', 'interactive LLD practice',
    'LLD design patterns', 'low level design interview preparation',
    'machine coding round preparation', 'OOD interview practice',
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About LLDCanvas — Low-Level Design Interview Prep Platform',
    description:
      'LLDCanvas is a hands-on Low-Level Design practice platform built for developers preparing for LLD and machine coding interview rounds. UML canvas, 110+ problems, 8 applied challenge labs, and a complete preparation ecosystem.',
    type: 'website',
    url: '/about',
    images: [{ url: '/LLDCanvas.png', width: 1774, height: 887, alt: 'LLDCanvas — About Us' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About LLDCanvas — LLD Interview Prep Platform',
    description: 'Interactive Low-Level Design practice: UML canvas, 110+ LLD problems, Interview Mode, design patterns, and 8 applied challenge labs.',
    images: ['/LLDCanvas.png'],
  },
}

// ── Data ──────────────────────────────────────────────────────────────────────

const STUDIO_FEATURES = [
  { label: 'Canvas & Editor',   href: '/features/editor',          Icon: LayoutTemplate, desc: 'Full UML class diagram canvas with 5 node types and 7 relationship types' },
  { label: 'Draft Notation',    href: '/features/draft-notation',  Icon: PenLine,        desc: 'Write plain English — get a real UML diagram instantly' },
  { label: 'Code Execution',    href: '/features/code-execution',  Icon: Terminal,       desc: 'Run generated code in 12 languages, right in the browser' },
  { label: 'Collaboration',     href: '/features/collaboration',   Icon: Users,          desc: 'Live cursors, pinned comments, real-time shared canvas' },
]

const PRACTICE_FEATURES = [
  { label: 'Interview Mode',    href: '/features/interview-mode',      Icon: Timer,        desc: 'Timed sessions with streak tracking — the conditions of the real round' },
  { label: 'LLD Problems',      href: '/features/interview-questions', Icon: ListChecks,   desc: '110+ problems tagged by company, difficulty, and topic' },
  { label: 'Revision Notes',    href: '/features/revision-notes',      Icon: BookOpen,     desc: 'SOLID principles and all 23 GoF design patterns with analogies' },
  { label: 'Daily Quiz',        href: '/features/daily-quiz',          Icon: Flame,        desc: '10 pattern questions every day to keep knowledge sharp' },
  { label: 'Plannr',            href: '/features/plannr',              Icon: CalendarDays, desc: 'A sequenced roadmap from zero to interview-ready' },
]

const LABS_FEATURES = [
  { label: 'Pattern Detective', href: '/features/pattern-detective',  Icon: Search,             desc: 'Read real code and identify the design pattern it uses' },
  { label: 'Debug Lab',         href: '/features/debug-lab',          Icon: Bug,                desc: 'Annotate design violations before the interviewer points them out' },
  { label: 'Debug & Fix',       href: '/features/debug-and-fix',      Icon: Wrench,             desc: 'Restructure broken designs, not just identify what is wrong' },
  { label: 'LLD Roguelike',     href: '/features/roguelike',          Icon: Gamepad2,           desc: 'Procedurally generated, no-undo branching design scenarios' },
  { label: 'Refactor',          href: '/features/refactor',           Icon: RefreshCw,          desc: 'Decompose a working monolith without breaking it' },
  { label: 'Change One Thing',  href: '/features/change-one-thing',   Icon: SlidersHorizontal,  desc: 'Absorb a new requirement mid-design and adapt without full redesign' },
  { label: 'Evolution',         href: '/features/evolution',          Icon: TrendingUp,         desc: 'Grow a design through multiple stages and track trade-offs' },
  { label: 'Budget Pressure',   href: '/features/budget-pressure',    Icon: DollarSign,         desc: 'Make the best design decisions within real-world resource constraints' },
]

const PERSONAS = [
  {
    level: 'Beginner',
    Icon: GraduationCap,
    color: 'border-sky-200 bg-sky-50',
    labelColor: 'text-sky-700 bg-sky-100',
    desc: 'Learning OOP, class diagrams, and design patterns for the first time. The canvas and revision notes offer a visual, hands-on starting point.',
  },
  {
    level: 'Student / Fresher',
    Icon: BookOpen,
    color: 'border-purple-200 bg-purple-50',
    labelColor: 'text-purple-700 bg-purple-100',
    desc: 'Targeting SDE-1 roles and placement interviews. Interview Mode and the problem library give you the structure and volume to build confidence.',
  },
  {
    level: 'SDE preparing for LLD round',
    Icon: Code2,
    color: 'border-brand/30 bg-brand-tint',
    labelColor: 'text-brand bg-brand-tint border border-brand/20',
    desc: 'Actively targeting SDE-2+ roles with a dedicated LLD round. The full platform — from Plannr through Challenge Labs — is built around your preparation loop.',
  },
  {
    level: 'Senior Engineer',
    Icon: TrendingUpIcon,
    color: 'border-amber-200 bg-amber-50',
    labelColor: 'text-amber-700 bg-amber-100',
    desc: 'Leveling up design thinking, exploring trade-offs, and sharpening architectural intuition. Evolution, Budget Pressure, and Refactor go beyond memorized answers.',
  },
]

const PRINCIPLES = [
  {
    Icon: Repeat,
    title: 'Learning by doing',
    body: 'Design skill is not absorbed through passive reading — it is built through repeated practice on real problems under real constraints. Every feature on LLDCanvas is built around active application, not passive consumption.',
  },
  {
    Icon: Scale,
    title: 'Understanding trade-offs',
    body: 'There is no single correct design. The goal is to understand why each choice has costs, and to be able to reason about them out loud. Features like Evolution, Change One Thing, and Budget Pressure make trade-off reasoning the practice.',
  },
  {
    Icon: Compass,
    title: 'Transferable engineering skills',
    body: 'Interview preparation that only produces interview answers is not enough. We want developers to walk away with stronger object-oriented design instincts that improve their actual engineering work — not just their ability to recall patterns under pressure.',
  },
  {
    Icon: Lightbulb,
    title: 'Structured experimentation',
    body: 'Good design judgment develops through experimentation, failure, and reflection — not rote repetition of the same problem. The Challenge Labs are built to put you in novel, constrained situations you cannot solve by memorisation alone.',
  },
]

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-hairline bg-paper px-2.5 py-0.5 font-mono text-[10px] text-ink-muted">
      {label}
    </span>
  )
}

// ── Feature pill ─────────────────────────────────────────────────────────────

function FeaturePill({
  label, href, Icon,
}: { label: string; href: string; Icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-lg border border-hairline bg-paper px-3 py-2 text-sm text-ink-muted transition-colors hover:border-brand/30 hover:bg-brand-tint hover:text-brand"
    >
      <Icon size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
      {label}
      <ArrowRight size={10} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Structured data ──────────────────────────────────────────── */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'About LLDCanvas',
        description: 'About LLDCanvas — an interactive Low-Level Design interview preparation platform with UML canvas, 110+ LLD problems, Interview Mode, design pattern training, and 8 applied Challenge Labs.',
        url: 'https://www.lldcanvas.in/about',
        isPartOf: { '@type': 'WebSite', name: 'LLDCanvas', url: 'https://www.lldcanvas.in' },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://www.lldcanvas.in/' },
            { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.lldcanvas.in/about' },
          ],
        },
      }} />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶00 HERO                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

        {/* Brand radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(35,78,63,0.07), transparent)' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-8 sm:px-8 sm:pt-14">

          {/* Eyebrow */}
          <Reveal>
            <p className="mb-5 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶00</span>&nbsp;&nbsp;·&nbsp;&nbsp;About LLDCanvas
            </p>
          </Reveal>

          {/* Full-width headline */}
          <Reveal>
            <h1 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.06] tracking-tight text-ink">
              The LLD practice platform<br />
              <span className="text-brand">built for the real round.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-ink-muted">
              Low-Level Design — the machine coding round — is the interview that grades
              your <em>thinking</em>, not your syntax. LLDCanvas exists to make that
              thinking trainable: a full UML canvas, curated problems, timed practice,
              design pattern training, and eight applied challenge labs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Start practising free
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper-elevated px-7 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                See all features <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {/* Platform pillars strip */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {[
                { label: 'Design Studio',    color: 'border-brand/25 bg-brand-tint text-brand' },
                { label: 'Practice Engine',  color: 'border-gold/30 bg-gold-tint text-gold' },
                { label: 'Challenge Labs',   color: 'border-red-200 bg-red-50 text-red-500' },
              ].map(p => (
                <span key={p.label} className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${p.color}`}>
                  {p.label}
                </span>
              ))}
              <span className="font-mono text-[10px] text-ink-faint">· 17 features · 110+ problems · 8 challenge labs</span>
            </div>
          </Reveal>

          {/* Stat strip */}
          <Reveal delay={0.15} className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { n: '17',   label: 'Features' },
              { n: '110+', label: 'LLD Problems' },
              { n: '8',    label: 'Challenge Labs' },
              { n: '12',   label: 'Code Languages' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-hairline bg-paper-elevated px-5 py-4">
                <p className="font-serif text-3xl font-medium text-ink">{stat.n}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶01 THE PROBLEM WE SET OUT TO SOLVE                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

            <Reveal>
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
                <span className="text-gold">¶01</span>&nbsp;&nbsp;·&nbsp;&nbsp;The Problem
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
                Passive preparation does not build active design skills.
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-ink-muted">
                Low-Level Design is one of the most commonly failed interview rounds — not
                because developers don&apos;t know design patterns, but because they&apos;ve
                never had to <em>apply</em> them under pressure on a blank canvas.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
                Reading a list of patterns is not preparation. Watching an explanation is
                not preparation. The real round gives you a problem statement, a ticking
                clock, and an empty whiteboard — and grades your thinking out loud.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
                LLDCanvas was built to close that gap: to give developers a complete,
                hands-on practice environment that mirrors the conditions of the actual
                interview rather than abstracting them away.
              </p>
            </Reveal>

            {/* Before / After comparison */}
            <Reveal delay={0.1}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Before */}
                <div className="rounded-xl border border-hairline bg-paper p-5">
                  <p className="mb-4 font-mono text-[9px] font-bold tracking-widest text-ink-faint/80 uppercase">
                    Traditional prep
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Memorising pattern names',
                      'Passive reading / watching',
                      'Isolated concept notes',
                      'No timer, no pressure',
                      'No design feedback loop',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* After */}
                <div className="rounded-xl border border-brand/25 bg-brand-tint p-5">
                  <p className="mb-4 font-mono text-[9px] font-bold tracking-widest text-brand/70 uppercase">
                    LLDCanvas approach
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Applying patterns on a real canvas',
                      'Timed Interview Mode sessions',
                      'Challenge Labs under real constraints',
                      'Daily quiz for knowledge retention',
                      'Immediate visual design feedback',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* LLD definition callout */}
              <div className="mt-4 rounded-xl border border-hairline bg-paper px-5 py-4">
                <p className="font-mono text-[9px] font-bold tracking-wider text-brand uppercase">
                  What is a Low-Level Design interview?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Also called the machine coding round or OOD round — you design the internal
                  classes, interfaces, and relationships of a real system (parking lot,
                  ride-hailing, rate limiter) using UML notation, SOLID principles, and design
                  patterns. It is a standard round at Amazon, Uber, Flipkart, Swiggy, and most
                  product-based companies.
                </p>
                <Link
                  href="/features/interview-questions"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-brand hover:underline"
                >
                  Browse 110+ LLD problems <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶02 OUR MISSION                                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          <Reveal className="mb-12 text-center">
            <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶02</span>&nbsp;&nbsp;·&nbsp;&nbsp;Our Mission
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Make Low-Level Design practice<br />
              <span className="text-brand">interactive, structured, and accessible.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ink-muted">
              We believe every developer preparing for a technical interview should have
              access to a genuine practice environment — not just a list of questions — regardless
              of their background, experience level, or preparation timeline.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                Icon: Target,
                title: 'Build real design skills',
                body: 'Help developers develop genuine Low-Level Design and object-oriented design skills — not just memorised answers — that improve their everyday engineering work alongside their interview performance.',
                accent: false,
              },
              {
                Icon: Zap,
                title: 'Practice in real conditions',
                body: 'Simulate the actual LLD interview environment — timed sessions, blank canvas, structured problem statements — so that the real round feels familiar, not foreign.',
                accent: true,
              },
              {
                Icon: Layers,
                title: 'A complete ecosystem',
                body: 'Provide every tool in one place: the canvas to draw, the problems to solve, the notes to review, the labs to experiment in, and the roadmap to keep it structured.',
                accent: false,
              },
            ].map(({ Icon, title, body, accent }) => (
              <Reveal key={title} delay={0.06}>
                <div
                  className={`flex h-full flex-col rounded-2xl border p-6 ${
                    accent
                      ? 'border-brand/25 bg-brand-tint'
                      : 'border-hairline bg-paper-elevated'
                  }`}
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${accent ? 'border-brand/20 bg-brand/10' : 'border-hairline bg-paper'}`}>
                    <Icon className={`h-5 w-5 ${accent ? 'text-brand' : 'text-ink-muted'}`} />
                  </div>
                  <h3 className="mb-2 font-serif text-lg font-semibold text-ink">{title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-ink-muted">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶03 THE PLATFORM — three pillars                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          <Reveal className="mb-12">
            <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶03</span>&nbsp;&nbsp;·&nbsp;&nbsp;How We Approach Learning
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
              One platform. Three interlocking ways to practice.
            </h2>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-muted">
              LLDCanvas brings together a complete learning ecosystem — not as isolated features,
              but as three complementary practice modes that build on each other. Draw, drill,
              and pressure-test your design thinking until it becomes instinct.
            </p>
          </Reveal>

          <div className="space-y-5">

            {/* Pillar 1 — Design Studio */}
            <Reveal>
              <div className="overflow-hidden rounded-2xl border border-hairline bg-paper">
                <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
                  <span className="rounded-full bg-brand-tint px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-brand uppercase">
                    Design Studio
                  </span>
                  <span className="text-sm text-ink-muted">The canvas where design thinking begins</span>
                </div>
                <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4">
                  {STUDIO_FEATURES.map(({ label, href, Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex flex-col gap-2 bg-paper p-5 transition-colors hover:bg-brand-tint/60"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper-elevated transition-colors group-hover:border-brand/20 group-hover:bg-brand-tint">
                        <Icon className="h-4 w-4 text-ink-faint transition-colors group-hover:text-brand" />
                      </div>
                      <p className="font-serif text-sm font-semibold text-ink">{label}</p>
                      <p className="text-xs leading-relaxed text-ink-muted">{desc}</p>
                      <span className="mt-auto inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                        Explore <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Pillar 2 — Practice Engine */}
            <Reveal delay={0.05}>
              <div className="overflow-hidden rounded-2xl border border-hairline bg-paper">
                <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
                  <span className="rounded-full bg-gold-tint px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-gold uppercase">
                    Practice Engine
                  </span>
                  <span className="text-sm text-ink-muted">Structured preparation — problem-by-problem, day-by-day</span>
                </div>
                <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-5">
                  {PRACTICE_FEATURES.map(({ label, href, Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex flex-col gap-2 bg-paper p-5 transition-colors hover:bg-gold-tint/40"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper-elevated transition-colors group-hover:border-gold/30 group-hover:bg-gold-tint">
                        <Icon className="h-4 w-4 text-ink-faint transition-colors group-hover:text-gold" />
                      </div>
                      <p className="font-serif text-sm font-semibold text-ink">{label}</p>
                      <p className="text-xs leading-relaxed text-ink-muted">{desc}</p>
                      <span className="mt-auto inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-gold opacity-0 transition-opacity group-hover:opacity-100">
                        Explore <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Pillar 3 — Challenge Labs */}
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-hairline bg-paper">
                <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
                  <span className="rounded-full bg-red-50 px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-red-500 uppercase">
                    Challenge Labs
                  </span>
                  <span className="text-sm text-ink-muted">8 applied modes — go beyond knowing, into doing</span>
                </div>
                <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4">
                  {LABS_FEATURES.map(({ label, href, Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex flex-col gap-2 bg-paper p-5 transition-colors hover:bg-red-50/70"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-paper-elevated transition-colors group-hover:border-red-200 group-hover:bg-red-50">
                        <Icon className="h-4 w-4 text-ink-faint transition-colors group-hover:text-red-500" />
                      </div>
                      <p className="font-serif text-sm font-semibold text-ink">{label}</p>
                      <p className="text-xs leading-relaxed text-ink-muted">{desc}</p>
                      <span className="mt-auto inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-red-500 opacity-0 transition-opacity group-hover:opacity-100">
                        Explore <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>

          <Reveal delay={0.12} className="mt-8 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              See every feature in detail <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶04 WHO WE BUILD FOR                                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          <Reveal className="mb-12">
            <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶04</span>&nbsp;&nbsp;·&nbsp;&nbsp;Who We Build For
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
              From your first UML class diagram<br />to your most advanced LLD round.
            </h2>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-muted">
              LLDCanvas is designed around a spectrum — from developers drawing their first
              class diagram to senior engineers refining their design intuition under constraint.
            </p>
          </Reveal>

          {/* Persona cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERSONAS.map(({ level, Icon, color, labelColor, desc }, i) => (
              <Reveal key={level} delay={i * 0.06}>
                <div className={`flex h-full flex-col rounded-2xl border p-5 ${color}`}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline bg-paper shadow-sm">
                      <Icon className="h-4.5 w-4.5 text-ink-muted" style={{ height: '1.125rem', width: '1.125rem' }} />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wide ${labelColor}`}>
                      {level}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Progression arc indicator */}
          <Reveal delay={0.18} className="mt-6 flex items-center gap-2 justify-center">
            <span className="h-px flex-1 max-w-20 bg-linear-to-r from-transparent to-hairline-strong" />
            <p className="font-mono text-[10px] text-ink-faint/70">
              Wherever you are in your journey, there&apos;s a practice mode built for it.
            </p>
            <span className="h-px flex-1 max-w-20 bg-linear-to-l from-transparent to-hairline-strong" />
          </Reveal>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶05 OUR PHILOSOPHY                                            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          <Reveal className="mb-12">
            <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">¶05</span>&nbsp;&nbsp;·&nbsp;&nbsp;Our Philosophy
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
              The principles that shape every feature we build.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRINCIPLES.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="flex gap-5 rounded-2xl border border-hairline bg-paper p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline bg-paper-elevated">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-serif text-base font-semibold text-ink">{title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Philosophy quote */}
          <Reveal delay={0.2} className="mt-10">
            <blockquote className="rounded-2xl border border-brand/20 bg-brand-tint px-8 py-8 text-center">
              <p className="font-serif text-xl font-medium leading-snug text-ink sm:text-2xl">
                &ldquo;The best preparation for an LLD interview is not reading about
                design patterns — it is applying them under pressure, making mistakes,
                and understanding why.&rdquo;
              </p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <div className="h-px w-10 bg-brand/30" />
                <span className="font-mono text-[10px] tracking-wider text-brand/70 uppercase">LLDCanvas Platform Philosophy</span>
                <div className="h-px w-10 bg-brand/30" />
              </div>
            </blockquote>
          </Reveal>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ¶06 VISION — LOOKING AHEAD                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

            <Reveal>
              <p className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
                <span className="text-gold">¶06</span>&nbsp;&nbsp;·&nbsp;&nbsp;Looking Ahead
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
                We&apos;re still building — and the direction is clear.
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-ink-muted">
                LLD preparation is not a solved problem. The gap between knowing a design
                pattern and applying it fluently under interview conditions is wide, and closing
                it requires more than a problem library.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
                Our focus is on making the practice more contextual, more adaptive, and
                closer to the real conditions of technical interviews at product-based companies.
                More challenge modes, more problem types, more ways to build and measure
                genuine design skill — not just interview familiarity.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
                Every new feature starts with the same question: does this make a developer
                measurably better at Low-Level Design, or does it just make the platform feel
                bigger?
              </p>
            </Reveal>

            {/* Quick links to get started */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-6">
                <p className="mb-5 font-mono text-[9px] font-bold tracking-widest text-ink-faint uppercase">
                  Start here
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Try the UML Canvas',            href: '/features/editor',              Icon: LayoutTemplate },
                    { label: 'Browse LLD Problems',           href: '/features/interview-questions',  Icon: ListChecks     },
                    { label: 'Read Design Pattern Notes',     href: '/features/revision-notes',       Icon: BookOpen       },
                    { label: 'Take a Daily Quiz',             href: '/features/daily-quiz',           Icon: Flame          },
                    { label: 'Try Interview Mode',            href: '/features/interview-mode',       Icon: Timer          },
                    { label: 'Explore Challenge Labs',        href: '/features/pattern-detective',    Icon: Search         },
                    { label: 'See the full platform',         href: '/features',                      Icon: Layers         },
                    { label: 'Read our Docs',                 href: '/docs',                          Icon: BookOpen       },
                  ].map(({ label, href, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                    >
                      <Icon size={14} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                      {label}
                      <ArrowRight size={12} className="ml-auto text-ink-faint/40 transition-colors group-hover:text-brand" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CTA                                                            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-tint py-24 sm:py-28">
        <Reveal className="mx-auto max-w-2xl px-6 text-center sm:px-10">
          <p className="mb-5 font-mono text-[10px] font-bold tracking-[0.25em] text-brand uppercase">
            <span className="text-gold">¶07</span>&nbsp;&nbsp;·&nbsp;&nbsp;Ready to practice?
          </p>
          <h2 className="font-serif text-3xl font-medium leading-snug tracking-tight text-ink sm:text-4xl">
            The best time to start<br />preparing is right now.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-muted">
            LLDCanvas is free to start. Open the canvas, work through a problem,
            run your design through Interview Mode — and see exactly where your preparation
            stands.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Start for free — no card needed
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Explore all 17 features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5">
            {[
              { label: 'UML Canvas', href: '/features/editor' },
              { label: 'LLD Problems', href: '/features/interview-questions' },
              { label: 'Design Patterns', href: '/features/revision-notes' },
              { label: 'Interview Mode', href: '/features/interview-mode' },
              { label: 'Pricing', href: '/pricing' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-[11px] text-ink-muted underline underline-offset-2 transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

    </div>
  )
}
