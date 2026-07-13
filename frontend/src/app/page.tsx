'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { DiagramStage, DiagramNode, DiagramBox, type DiagramEdge } from '@/components/marketing/ConnectedDiagram'
import { useSession } from '@/lib/auth-client'

const EASE = 'easeOut' as const

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  }
}

// ─── Full-page canvas backdrop — a dot-grid pattern (SVG <pattern>, not a CSS
// gradient) that stays fixed behind the whole scroll, so the page reads as
// one continuous canvas rather than a stack of discrete sections. ────────────

function CanvasBackdrop() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <svg className="h-full w-full">
        <defs>
          <pattern id="page-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="var(--ink-faint)" fillOpacity="0.32" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-grid)" />
      </svg>
    </div>
  )
}

// ─── Section eyebrow — a small blueprint-style annotation tab, used instead
// of centered section headings. ───────────────────────────────────────────

function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
      <span className="text-gold">¶{index}</span> — {children}
    </p>
  )
}

// ─── Hero diagram (desktop) — a real connected diagram, not a screenshot ─────

const HERO_EDGES: DiagramEdge[] = [
  { id: 'e1', from: { node: 'pl', side: 'bottom' }, to: { node: 'lvl', side: 'top' }, marker: 'diamond-filled', markerSide: 'start' },
  { id: 'e2', from: { node: 'pl', side: 'right' }, to: { node: 'fee', side: 'left' }, variant: 'dashed', marker: 'arrow' },
  { id: 'e3', from: { node: 'lvl', side: 'bottom' }, to: { node: 'veh', side: 'top' } },
]

function HeroDiagram() {
  return (
    <div className="relative">
      <DiagramStage edges={HERO_EDGES} className="h-[420px] w-full">
        <DiagramNode id="pl" className="w-48" style={{ left: '0%', top: '4%' }}>
          <DiagramBox
            name="ParkingLot"
            fields={['- levels: List<Level>']}
            methods={['+ getAvailableSpot(): Spot']}
          />
        </DiagramNode>
        <DiagramNode id="fee" className="w-52" style={{ right: '0%', top: '0%' }}>
          <DiagramBox
            stereotype="interface"
            dashed
            name="FeeStrategy"
            methods={['+ calculate(t: Ticket): float']}
          />
        </DiagramNode>
        <DiagramNode id="lvl" className="w-44" style={{ left: '38%', top: '40%' }}>
          <DiagramBox
            name="Level"
            fields={['- spots: List<Spot>']}
            methods={['+ getFreeSpot(): Spot']}
          />
        </DiagramNode>
        <DiagramNode id="veh" className="w-48" style={{ left: '0%', bottom: '2%' }}>
          <DiagramBox
            name="Vehicle"
            fields={['- licensePlate: String', '- type: VehicleType']}
          />
        </DiagramNode>
      </DiagramStage>
    </div>
  )
}

// ─── Feature chain — capabilities as a connected sequence of interface
// signatures, scrollable, instead of an icon+title+paragraph grid. ───────────

interface FeatureNode {
  id: string
  stereotype: string
  name: string
  method: string
}

const FEATURES: FeatureNode[] = [
  { id: 'f1', stereotype: 'keystroke', name: 'QuickInsert', method: '+ addClass(): Instantly' },
  { id: 'f2', stereotype: 'drag', name: 'SmartConnect', method: '+ connect(a, b): Relationship' },
  { id: 'f3', stereotype: 'Ctrl+K', name: 'PatternLibrary', method: '+ insert(pattern): Skeleton' },
  { id: 'f4', stereotype: 'starter', name: 'ProblemTemplates', method: '+ start(problem): Canvas' },
  { id: 'f5', stereotype: '⌘E', name: 'Export', method: '+ export(): PNG | SVG | PlantUML' },
  { id: 'f6', stereotype: 'theme', name: 'Canvas', method: '+ theme(mode): Light | Dark | Whiteboard' },
]

const FEATURE_EDGES: DiagramEdge[] = FEATURES.slice(0, -1).map((f, i) => ({
  id: `fe-${i}`,
  from: { node: f.id, side: 'right' },
  to: { node: FEATURES[i + 1].id, side: 'left' },
  variant: 'dashed',
  marker: 'arrow',
}))

function FeatureChain() {
  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0">
      <DiagramStage
        edges={FEATURE_EDGES}
        className="inline-flex items-center gap-14 py-6 pr-6"
      >
        {FEATURES.map((f, i) => (
          <DiagramNode key={f.id} id={f.id} mode="flow" className="shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <DiagramBox stereotype={f.stereotype} dashed name={f.name} methods={[f.method]} className="w-56" />
            </motion.div>
          </DiagramNode>
        ))}
      </DiagramStage>
    </div>
  )
}

// ─── Spec strip — real counts instead of vague marketing claims ─────────────

const SPECS = [
  { n: '10', label: 'Design patterns' },
  { n: '7', label: 'Relationship types' },
  { n: '4', label: 'Export formats' },
  { n: '3', label: 'Canvas themes' },
]

function SpecStrip() {
  return (
    <div className="grid grid-cols-2 gap-8 border-y border-hairline py-8 sm:grid-cols-4">
      {SPECS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <p className="font-mono text-3xl font-medium text-brand">{s.n}</p>
          <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Library — real named templates + the full pattern list ────────────────

const TEMPLATE_SHOWCASE = [
  { name: 'Parking Lot', desc: 'Levels, spots, tickets, fee strategy' },
  { name: 'Elevator System', desc: 'Controller dispatching multiple cars' },
  { name: 'ATM Machine', desc: 'Card, account, auth, cash dispenser' },
  { name: 'BookMyShow', desc: 'Theaters, shows, seats, payment' },
  { name: 'LRU Cache', desc: 'Hash map + doubly linked list' },
]

const PATTERNS_SHOWCASE = [
  'Singleton', 'Factory Method', 'Abstract Factory', 'Builder',
  'Adapter', 'Decorator', 'Proxy', 'Facade', 'Strategy', 'Observer',
]

function LibrarySection() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div>
        <p className="mb-4 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
          Problem templates
        </p>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {TEMPLATE_SHOWCASE.map((t) => (
            <li key={t.name} className="flex items-baseline justify-between gap-4 py-3">
              <span className="font-mono text-sm text-ink">{t.name}</span>
              <span className="text-right text-xs text-ink-faint">{t.desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-faint">More LLD problems ship regularly.</p>
      </div>

      <div>
        <p className="mb-4 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
          Pattern skeletons
        </p>
        <div className="flex flex-wrap gap-2">
          {PATTERNS_SHOWCASE.map((p) => (
            <span
              key={p}
              className="rounded-full border border-hairline-strong px-3 py-1.5 font-mono text-xs text-ink-muted"
            >
              {p}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Pre-wired and correctly connected — insert any of them with{' '}
          <kbd className="rounded border border-hairline-strong bg-paper px-1 py-0.5 font-mono text-[10px]">Ctrl+K</kbd>{' '}
          or the editor&apos;s left panel.
        </p>
      </div>
    </div>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Do I need an account to try it?',
    a: 'No — open the local editor and start drawing immediately. Sign in only when you want cloud sync across devices.',
  },
  {
    q: 'Can I export what I draw?',
    a: 'Yes — PNG, SVG, PlantUML, or Mermaid, straight from the toolbar.',
  },
  {
    q: 'Does it generate code from my diagram?',
    a: "No. LLDCanvas draws diagrams — it doesn't scaffold code. That keeps the tool focused and the diagrams honest.",
  },
  {
    q: 'Are design pattern skeletons included?',
    a: 'Yes — all 10 Gang-of-Four patterns are one keystroke away, pre-wired with the correct relationships.',
  },
  {
    q: 'What happens to local work if I sign in later?',
    a: 'It migrates automatically — your local diagram is copied to your account the moment you sign in.',
  },
]

function Faq() {
  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {FAQS.map((f, i) => (
        <motion.div
          key={f.q}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[minmax(0,280px)_1fr] sm:gap-8"
        >
          <p className="font-medium text-ink">{f.q}</p>
          <p className="text-sm leading-relaxed text-ink-muted">{f.a}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Process — three waypoints along one connecting line, not three cards ───

const STEPS = [
  { n: '01', title: 'Pick a start', desc: 'A blank canvas, or one of fourteen LLD problem templates.' },
  { n: '02', title: 'Draw with keystrokes', desc: 'C, I, E, A for classes — drag to connect, pick the relationship.' },
  { n: '03', title: 'Export, move on', desc: 'PNG for a resume, PlantUML for your notes. Back to practicing.' },
]

function ProcessPath() {
  return (
    <>
      {/* Mobile: each row stretches its circle-column to the text's height via
          flex align-stretch, and the connector segment is flex-1 within that
          column — its length is whatever the layout produces, never a guessed
          pixel value, so it can't end up too short or overshooting the last dot. */}
      <div className="flex flex-col sm:hidden">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline-strong bg-paper-elevated font-mono text-xs text-brand">
                {s.n}
              </div>
              {i < STEPS.length - 1 && <div className="my-1 w-px flex-1 bg-hairline-strong" />}
            </div>
            <div className="pb-8">
              <h3 className="mb-1.5 font-medium text-ink">{s.title}</h3>
              <p className="max-w-[26ch] text-sm leading-relaxed text-ink-muted">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: one full-width line behind three equal-height columns — the
          line's endpoints are the row's own edges, so there's nothing to misalign. */}
      <div className="relative hidden sm:flex sm:gap-8">
        <div className="absolute top-4 right-0 left-0 h-px bg-hairline-strong" />
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative flex-1"
          >
            <div className="relative mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-hairline-strong bg-paper-elevated font-mono text-xs text-brand">
              {s.n}
            </div>
            <h3 className="mb-1.5 font-medium text-ink">{s.title}</h3>
            <p className="max-w-[26ch] text-sm leading-relaxed text-ink-muted">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { data: session } = useSession()

  function openSignin() { setAuthMode('signin'); setAuthOpen(true) }
  function openSignup() { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <div className="min-h-screen overflow-x-hidden text-ink">
      <CanvasBackdrop />

      {/* ─── Nav — sits directly on the canvas, no bar, no blur ────────────── */}
      <nav className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Wordmark height={46} priority />
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={openSignin}
                className="hidden px-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink sm:inline-block"
              >
                Sign in
              </button>
              <button
                onClick={openSignup}
                className="rounded-md border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="px-5 pt-8 pb-24 sm:px-8 lg:pt-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div {...fadeUpProps(0)}>
              <Eyebrow index="01">for software engineers</Eyebrow>
            </motion.div>

            <motion.h1
              className="mb-6 font-serif text-[2.75rem] leading-[1.08] font-medium tracking-tight text-ink sm:text-6xl"
              {...fadeUpProps(0.08)}
            >
              Design the classes.
              <br />
              Not the rectangles.
            </motion.h1>

            <motion.p
              className="mb-9 max-w-md text-lg leading-relaxed text-ink-muted"
              {...fadeUpProps(0.16)}
            >
              LLDCanvas understands classes, interfaces, relationships, and design
              patterns — not just shapes. Draw the design that actually matters,
              in the time most tools take to place a rectangle.
            </motion.p>

            <motion.div className="flex flex-wrap items-center gap-3" {...fadeUpProps(0.24)}>
              <Link
                href="/editor/local"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
              >
                Start for free
              </Link>
              <button
                onClick={openSignin}
                className="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-6 py-3 font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]"
              >
                Sign in
              </button>
            </motion.div>

            <motion.p className="mt-4 font-mono text-xs text-ink-faint" {...fadeUpProps(0.3)}>
              no account needed to try it
            </motion.p>
          </div>

          {/* Desktop: real connected diagram. Below lg: one static box. */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <HeroDiagram />
          </motion.div>

          <motion.div
            className="flex justify-center lg:hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <DiagramBox
              name="ParkingLot"
              fields={['- levels: List<Level>']}
              methods={['+ getAvailableSpot(): Spot']}
              className="w-56"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── Spec strip ─────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SpecStrip />
        </div>
      </section>

      {/* ─── Feature chain ──────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="02">what it actually does</Eyebrow>
          <h2 className="mb-8 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Six interfaces. One canvas.
          </h2>
          <FeatureChain />
        </div>
      </section>

      {/* ─── Library ────────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="03">what&apos;s already inside</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            A library, not a blank page.
          </h2>
          <LibrarySection />
        </div>
      </section>

      {/* ─── Process ────────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Eyebrow index="04">how it works</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Three steps, not thirty.
          </h2>
          <ProcessPath />
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Eyebrow index="05">before you ask</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Questions worth answering upfront.
          </h2>
          <Faq />
        </div>
      </section>

      {/* ─── CTA — a class box you can actually call ───────────────────────── */}
      <section className="px-5 py-24 sm:px-8">
        <motion.div
          className="mx-auto max-w-md"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-hidden rounded-md border border-hairline-strong bg-paper-elevated shadow-sm">
            <div className="border-b border-hairline px-5 py-3">
              <p className="font-mono text-sm font-semibold text-ink">YourNextInterview</p>
            </div>
            <div className="space-y-1 px-2 py-3">
              <Link
                href="/editor/local"
                className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-brand-tint"
              >
                <span className="font-mono text-[13px]">
                  <span className="text-brand">+ practice()</span>
                  <span className="text-ink-faint">: </span>
                  <span className="text-ink">OpenCanvas</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <button
                onClick={openSignup}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-hairline/40"
              >
                <span className="font-mono text-[13px]">
                  <span className="text-ink-muted">+ signUp()</span>
                  <span className="text-ink-faint">: </span>
                  <span className="text-ink">SaveToCloud</span>
                </span>
              </button>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-ink-faint">
            Create your first diagram in under 30 seconds.
          </p>
        </motion.div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-hairline px-5 pt-14 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Wordmark height={34} />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                The fastest way to draw UML for Low-Level Design interviews.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="mb-3 font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">
                  Product
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/editor/local" className="text-ink-muted transition-colors hover:text-ink">
                      Open editor
                    </Link>
                  </li>
                  {session && (
                    <li>
                      <Link href="/dashboard" className="text-ink-muted transition-colors hover:text-ink">
                        Dashboard
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {!session && (
                <div>
                  <p className="mb-3 font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">
                    Account
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button onClick={openSignin} className="text-ink-muted transition-colors hover:text-ink">
                        Sign in
                      </button>
                    </li>
                    <li>
                      <button onClick={openSignup} className="text-ink-muted transition-colors hover:text-ink">
                        Create account
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 font-mono text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} LLDCanvas — built for engineers, by engineers.</p>
            <p>¶ v1.0</p>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </div>
  )
}
