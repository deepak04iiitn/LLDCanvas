'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, ChevronDown, Check, X,
  Clock, StickyNote, Flame, BarChart2, CalendarDays, Mic,
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { DiagramStage, DiagramNode, DiagramBox, type DiagramEdge } from '@/components/marketing/ConnectedDiagram'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const EASE = 'easeOut' as const

// ─── Nav quick links ──────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { label: 'Features',       href: '#features' },
  { label: 'Interview Mode', href: '#interview-mode' },
  { label: 'Patterns',       href: '#patterns' },
  { label: 'FAQ',            href: '#faq' },
]

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  }
}

function inViewProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4, ease: EASE, delay },
  }
}

// ─── Full-page canvas backdrop ────────────────────────────────────────────────
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

// Tracks whether the page has scrolled past a small threshold — drives the
// nav's transition from "sitting on the canvas" (transparent, at rest) to a
// solid, bordered bar once you actually start scrolling.
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > threshold) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
      <span className="text-gold">¶{index}</span> — {children}
    </p>
  )
}

// ─── Hero diagram ─────────────────────────────────────────────────────────────
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
          <DiagramBox name="ParkingLot" fields={['- levels: List<Level>']} methods={['+ getAvailableSpot(): Spot']} />
        </DiagramNode>
        <DiagramNode id="fee" className="w-52" style={{ right: '0%', top: '0%' }}>
          <DiagramBox stereotype="interface" dashed name="FeeStrategy" methods={['+ calculate(t: Ticket): float']} />
        </DiagramNode>
        <DiagramNode id="lvl" className="w-44" style={{ left: '38%', top: '40%' }}>
          <DiagramBox name="Level" fields={['- spots: List<Spot>']} methods={['+ getFreeSpot(): Spot']} />
        </DiagramNode>
        <DiagramNode id="veh" className="w-48" style={{ left: '0%', bottom: '2%' }}>
          <DiagramBox name="Vehicle" fields={['- licensePlate: String', '- type: VehicleType']} />
        </DiagramNode>
      </DiagramStage>
    </div>
  )
}

// ─── Feature chain ────────────────────────────────────────────────────────────
interface FeatureNode { id: string; stereotype: string; name: string; method: string }
const FEATURES: FeatureNode[] = [
  { id: 'f1', stereotype: 'keystroke', name: 'QuickInsert',    method: '+ addClass(): Instantly' },
  { id: 'f2', stereotype: 'drag',      name: 'SmartConnect',   method: '+ connect(a, b): Relationship' },
  { id: 'f3', stereotype: 'Ctrl+K',    name: 'PatternLibrary', method: '+ insert(pattern): Skeleton' },
  { id: 'f5', stereotype: 'toolbar',   name: 'Export',         method: '+ export(): PNG | SVG | PlantUML | Mermaid' },
  { id: 'f6', stereotype: 'click',     name: 'Canvas',         method: '+ theme(mode): Light | Dark | Whiteboard' },
]
const FEATURE_EDGES: DiagramEdge[] = FEATURES.slice(0, -1).map((f, i) => ({
  id: `fe-${i}`, from: { node: f.id, side: 'right' }, to: { node: FEATURES[i + 1].id, side: 'left' }, variant: 'dashed', marker: 'arrow',
}))

function FeatureChain() {
  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5 py-4 sm:mx-0 sm:px-0">
      <DiagramStage edges={FEATURE_EDGES} className="inline-flex items-center gap-14 py-6 pr-6">
        {FEATURES.map((f, i) => (
          <DiagramNode
            key={f.id}
            id={f.id}
            mode="flow"
            // A gentle vertical wave instead of a flat row — safe to stagger
            // because the connector lines are measured from real box
            // positions, not assumed to be level.
            className={cn('shrink-0', i % 2 === 1 ? 'translate-y-5' : '-translate-y-5')}
          >
            <motion.div {...inViewProps(i * 0.05)}>
              <DiagramBox stereotype={f.stereotype} dashed name={f.name} methods={[f.method]} className="w-56" />
            </motion.div>
          </DiagramNode>
        ))}
      </DiagramStage>
    </div>
  )
}

// ─── Spec strip ───────────────────────────────────────────────────────────────
const SPECS = [
  { n: '23', label: 'Design patterns' },
  { n: '7',  label: 'Relationship types' },
  { n: '4',  label: 'Export formats' },
  { n: '3',  label: 'Canvas themes' },
]
function SpecStrip() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-md border border-hairline p-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-hairline sm:p-0">
      {SPECS.map((s, i) => (
        <motion.div key={s.label} {...inViewProps(i * 0.05)} className="sm:px-6 sm:py-6">
          <p className="font-mono text-3xl font-medium text-brand">{s.n}</p>
          <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Who it's for — hover-lift cards ──────────────────────────────────────────
const PERSONAS = [
  {
    n: '01',
    mono: 'LLD interview prep',
    title: 'Interview candidates',
    desc: 'Open a blank canvas and start designing immediately. Spend the time on the design, not on drawing rectangles.',
  },
  {
    n: '02',
    mono: 'Design communication',
    title: 'Engineering teams',
    desc: 'Whiteboard theme + one-click PNG/SVG. Drop a clean class diagram into any design doc in under a minute.',
  },
  {
    n: '03',
    mono: 'OOP & patterns',
    title: 'CS students',
    desc: 'All 23 design patterns are pre-wired and one keystroke away. See exactly how the classes connect.',
  },
]

function WhoIsItFor() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {PERSONAS.map((p, i) => (
        <motion.div
          key={p.n}
          {...inViewProps(i * 0.08)}
          className="rounded-md border border-hairline bg-paper-elevated p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-md"
        >
          <p className="mb-5 font-mono text-2xl font-medium text-brand">{p.n}</p>
          <p className="mb-1 font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">{p.mono}</p>
          <h3 className="mb-2 font-medium text-ink">{p.title}</h3>
          <p className="text-sm leading-relaxed text-ink-muted">{p.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Differentiators — a real comparison table, not icon cards ──────────────
const COMPARISON_ROWS = [
  'UML relationship semantics — enforced, not hand-drawn',
  'Real class, interface, and enum node types',
  'Design pattern skeletons, pre-wired',
  'A keyboard shortcut for every insert action',
  'Visual editor with PlantUML / Mermaid export',
  'Interview Mode — timed practice with streaks & activity analytics',
]

function ComparisonTable() {
  return (
    <div className="no-scrollbar overflow-x-auto rounded-md border border-hairline">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="px-5 py-4 text-left align-bottom">
              <p className="font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">Capability</p>
            </th>
            <th className="px-5 py-4 text-left align-bottom">
              <p className="font-mono text-[10px] font-medium tracking-widest text-ink-faint uppercase">Generic tools</p>
              <p className="mt-1 text-xs font-normal text-ink-faint">draw.io, Lucidchart, Excalidraw…</p>
            </th>
            <th className="bg-brand-tint px-5 py-4 text-left align-bottom">
              <p className="font-mono text-[10px] font-medium tracking-widest text-brand uppercase">LLDCanvas</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((feature, i) => (
            <motion.tr
              key={feature}
              {...inViewProps(i * 0.04)}
              className="border-b border-hairline transition-colors last:border-0 hover:bg-paper/60"
            >
              <td className="px-5 py-4 text-ink">{feature}</td>
              <td className="px-5 py-4">
                <X size={16} className="text-ink-faint/70" />
              </td>
              <td className="bg-brand-tint/50 px-5 py-4">
                <Check size={16} className="text-brand" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Library section ──────────────────────────────────────────────────────────
const PATTERNS_SHOWCASE = [
  'Singleton', 'Factory Method', 'Abstract Factory', 'Builder', 'Prototype',
  'Adapter', 'Bridge', 'Composite', 'Decorator', 'Facade', 'Flyweight', 'Proxy',
  'Chain of Responsibility', 'Command', 'Interpreter', 'Iterator', 'Mediator',
  'Memento', 'Observer', 'State', 'Strategy', 'Template Method', 'Visitor',
]

function LibrarySection() {
  return (
    <div>
      <p className="mb-4 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
        Design pattern skeletons
      </p>
      <div className="flex flex-wrap gap-2">
        {PATTERNS_SHOWCASE.map((p) => (
          <span key={p} className="rounded-full border border-hairline-strong px-3 py-1.5 font-mono text-xs text-ink-muted">
            {p}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Pre-wired and correctly connected — insert any of them with{' '}
        <kbd className="rounded border border-hairline-strong bg-paper px-1 py-0.5 font-mono text-[10px]">Ctrl+K</kbd>{' '}
        or the left panel.
      </p>
    </div>
  )
}

// ─── Interview Mode ───────────────────────────────────────────────────────────
// The pitch here isn't the timer — it's what the timer builds over time.
// The centerpiece is a real analytics-style mockup (heatmap, streak, weekly
// graph) built from the page's own paper/ink/brand/gold tokens, because
// showing the habit loop is more persuasive than describing a countdown.

const PRACTICE_CHIPS = [
  { icon: Flame,      label: 'Daily streaks' },
  { icon: CalendarDays, label: 'Activity heatmap' },
  { icon: BarChart2,  label: 'Progress analytics' },
  { icon: Clock,      label: 'Flexible timers' },
  { icon: StickyNote, label: 'Session notes' },
]

const WHY_IT_WORKS = [
  'Most candidates only ever practice untimed — the clock is the one part nobody rehearses.',
  'A visible streak turns "I should probably practice" into something you actually do, daily.',
  'Every canvas and note is saved automatically the moment you stop — nothing to set up first.',
]

// 14 weeks of deterministic "activity" — no randomness, so server and client
// render identically. Deliberately builds to a solid run in the final ~12
// days so the mockup visually matches the "12-day streak" badge next to it.
const HEATMAP_LEVELS = Array.from({ length: 98 }, (_, i) => {
  if (i >= 86) return (i % 3 === 0) ? 3 : 4 // the current streak
  const cycle = i % 9
  if (cycle === 0 || cycle === 4) return 0  // rest days
  return 1 + (i % 3)                        // scattered early activity
})
const HEATMAP_LEVEL_CLASSES = [
  'bg-hairline',
  'bg-brand/20',
  'bg-brand/45',
  'bg-brand/70',
  'bg-brand',
]

function StreakHeatmap() {
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
        {HEATMAP_LEVELS.map((level, i) => (
          <div key={i} className={cn('h-2.5 w-2.5 rounded-[2px]', HEATMAP_LEVEL_CLASSES[level])} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5">
        <span className="font-mono text-[9px] text-ink-faint">Less</span>
        {HEATMAP_LEVEL_CLASSES.map((c, i) => (
          <div key={i} className={cn('h-2 w-2 rounded-[2px]', c)} />
        ))}
        <span className="font-mono text-[9px] text-ink-faint">More</span>
      </div>
    </div>
  )
}

// Weekly practice minutes, last 8 weeks — a deliberate upward trend, the
// same "line goes up" shape that makes habit-tracker dashboards satisfying.
const WEEKLY_MINUTES = [20, 35, 15, 50, 40, 65, 55, 85]

function StreakGraph() {
  const max = Math.max(...WEEKLY_MINUTES)
  return (
    <div className="flex h-20 items-end gap-2">
      {WEEKLY_MINUTES.map((m, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm bg-brand/70 first:bg-brand/40 last:bg-brand"
          initial={{ height: 0 }}
          whileInView={{ height: `${(m / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
        />
      ))}
    </div>
  )
}

const DASHBOARD_STATS = [
  { n: '42',      label: 'Sessions logged' },
  { n: '18h 20m', label: 'Time practiced' },
  { n: '12 days', label: 'Current streak' },
]

// ── Live countdown card ──────────────────────────────────────────────────────
// A real, ticking clock — decrements every second via setInterval, no
// randomness in its math so the SSR/CSR first paint matches. Compressed to a
// short loop (labelled honestly) so a visitor actually sees it run down and
// the color shift from calm to urgent, without waiting through a real session.
const DEMO_QUESTIONS = [
  'Design a Parking Lot',
  'Design a Rate Limiter',
  'Design an Elevator System',
  'Design a Notification Service',
]
const DEMO_DURATION = 40

// Rendered as one row inside the dashboard card (not its own outer card) —
// a compact "right now" strip sitting above the historical stats below it.
function LiveSessionRow() {
  const [secondsLeft, setSecondsLeft] = useState(DEMO_DURATION)
  const [qIndex, setQIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setQIndex(q => (q + 1) % DEMO_QUESTIONS.length)
          return DEMO_DURATION
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const pct = 1 - secondsLeft / DEMO_DURATION
  const color = pct < 0.5 ? 'text-brand' : pct < 0.8 ? 'text-gold' : 'text-red-600'
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const s = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline bg-brand-tint/40 px-6 py-5">
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper-elevated px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-[9px] font-semibold tracking-widest text-ink-faint uppercase">Live preview</span>
        </div>
        <p className="font-mono text-xs text-ink-muted">{DEMO_QUESTIONS[qIndex]}</p>
        <p className="mt-0.5 font-mono text-[10px] text-ink-faint italic">sped up — real sessions run the full 45</p>
      </div>
      <div className={cn('shrink-0 font-mono text-4xl font-bold tabular-nums transition-colors duration-700 sm:text-5xl', color)}>
        {m}:{s}
      </div>
    </div>
  )
}

// The visual centerpiece — one cohesive card, not two stacked panels. Leads
// with the "right now" live timer strip, then the "after": concrete, visible
// proof of the habit that timed practice builds over time.
function PracticeDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper-elevated shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <p className="font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
          Your practice activity
        </p>
        <div className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-tint px-2.5 py-1">
          <Flame className="h-3 w-3 text-gold" />
          <span className="font-mono text-[11px] font-semibold text-gold">12-day streak</span>
        </div>
      </div>

      <LiveSessionRow />

      <div className="px-6 py-5">
        <p className="mb-2.5 font-mono text-[10px] tracking-widest text-ink-faint uppercase">Last 14 weeks</p>
        <StreakHeatmap />
      </div>

      <div className="border-t border-hairline px-6 py-5">
        <p className="mb-2.5 font-mono text-[10px] tracking-widest text-ink-faint uppercase">Minutes per week</p>
        <StreakGraph />
      </div>

      <div className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline">
        {DASHBOARD_STATS.map(s => (
          <div key={s.label} className="px-4 py-4 text-center">
            <p className="font-mono text-lg font-semibold text-brand">{s.n}</p>
            <p className="mt-0.5 text-[11px] text-ink-faint">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Process ──────────────────────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Open a blank canvas', desc: 'Hit "Start for free" — no install, no account needed. Your canvas is ready in seconds.' },
  { n: '02', title: 'Draw with keystrokes', desc: 'C, I, E, A for class types — drag between handles to connect, pick the relationship type from the picker.' },
  { n: '03', title: 'Export, move on',    desc: 'PNG for a resume, PlantUML for your notes, SVG for a design doc. Done.' },
]

function ProcessPath() {
  return (
    <>
      <div className="flex flex-col sm:hidden">
        {STEPS.map((s, i) => (
          <motion.div key={s.n} {...inViewProps(i * 0.08)} className="flex gap-4">
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

      <div className="relative hidden sm:flex sm:gap-8">
        <div className="absolute top-4 right-0 left-0 h-px bg-hairline-strong" />
        {STEPS.map((s, i) => (
          <motion.div key={s.n} {...inViewProps(i * 0.08)} className="relative flex-1">
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

// ─── FAQ (accordion) ─────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What is LLDCanvas?',
    a: 'LLDCanvas is a UML class diagram editor built specifically for software engineers preparing for Low-Level Design (LLD) interviews. Unlike generic diagramming tools, it understands OOP concepts — classes, interfaces, abstract classes, enums — and all seven UML relationship types (inheritance, composition, aggregation, association, dependency, realization, and self-reference).',
  },
  {
    q: 'How is LLDCanvas different from draw.io or Lucidchart?',
    a: 'draw.io and Lucidchart work with generic shapes. LLDCanvas works with classes. Every node is a real UML class node — with a header, attributes section, and methods section. Relationships have semantic meaning (a filled diamond is composition, a hollow triangle is inheritance). You also get all 23 classic design pattern skeletons pre-wired with the correct structure — none of which exist in generic tools.',
  },
  {
    q: 'How is it different from Excalidraw?',
    a: 'Excalidraw is a freeform whiteboard — it has no concept of UML. You draw rectangles and label them yourself. LLDCanvas is UML-aware, keyboard-first, and interview-focused. If you need to draw a Parking Lot design in 5 minutes, LLDCanvas gets you there; Excalidraw requires you to manually format every box from scratch.',
  },
  {
    q: 'Why not just write PlantUML or Mermaid directly?',
    a: 'Text-based diagram formats are excellent output formats. LLDCanvas exports to both PlantUML and Mermaid. But designing in text is slow — you cannot see the layout as you type, and refactoring (moving a class, changing a relationship) means editing text. LLDCanvas lets you design visually and export to text, giving you the best of both.',
  },
  {
    q: 'Do I need an account to use it?',
    a: 'No — open the local editor and start drawing immediately. No login, no install. Sign in only when you want cloud sync so your diagrams are accessible across devices.',
  },
  {
    q: 'What happens to my local work if I sign in later?',
    a: 'It migrates automatically — your local diagram is copied to your cloud account the moment you sign in, and you are redirected to it.',
  },
  {
    q: 'Can I export my diagrams?',
    a: 'Yes. Export as PNG (for resumes, slide decks), SVG (scalable, for design docs), PlantUML text (for rendering in other tools), or Mermaid text (for GitHub READMEs, Notion, Confluence). All exports are available from the toolbar or the Ctrl+K command palette.',
  },
  {
    q: 'Are all design patterns included?',
    a: 'Yes — all 23 classic design patterns (Creational, Structural, and Behavioral) are pre-built with the correct UML structure and relationship wiring. Insert any of them with Ctrl+K → "Patterns", or from the left panel.',
  },
  {
    q: 'Is it free?',
    a: 'Yes — the entire editor is free right now: every node type, every relationship, all 23 design pattern skeletons, and every export format. Signing in (free, just Google or email) only adds cloud sync across devices.',
  },
]

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div {...inViewProps(index * 0.03)} className="border-b border-hairline last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="font-medium text-ink">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-relaxed text-ink-muted">{a}</p>
      </motion.div>
    </motion.div>
  )
}

function Faq() {
  return (
    <div className="border-t border-hairline">
      {FAQS.map((f, i) => (
        <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { data: session } = useSession()
  const scrolled = useScrolled()

  function openSignin() { setAuthMode('signin'); setAuthOpen(true) }
  function openSignup() { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <div className="min-h-screen text-ink">
      <CanvasBackdrop />

      {/* ─── Nav — sits on the canvas at rest, becomes a warm-tinted glass bar
           once you scroll (not a flat white rectangle) so it still reads as
           part of the same page, not something dropped on top of it ── */}
      <nav
        className={cn(
          'sticky top-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-300 sm:px-8',
          scrolled
            ? 'border-b border-brand/15 bg-paper/75 shadow-[0_1px_0_rgba(35,78,63,0.06),0_12px_28px_-20px_rgba(32,31,28,0.35)] backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className={cn('origin-left transition-transform duration-300', scrolled && 'scale-[0.85]')}>
          <Wordmark height={58} priority />
        </div>

        <div className="hidden items-center gap-7 lg:flex">
          {QUICK_LINKS.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
              Dashboard
            </Link>
          ) : (
            <>
              <button onClick={openSignin} className="hidden px-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink sm:inline-block">
                Sign in
              </button>
              <button onClick={openSignup} className="rounded-md border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]">
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="px-5 pt-2 pb-24 sm:px-8 lg:pt-4">
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

            <motion.p className="mb-9 max-w-md text-lg leading-relaxed text-ink-muted" {...fadeUpProps(0.16)}>
              LLDCanvas is a UML class diagram editor built specifically for Low-Level Design
              interviews and OOP design sessions. It understands classes, interfaces,
              relationships, and design patterns — not just shapes.
            </motion.p>

            <motion.div className="flex flex-wrap items-center gap-3" {...fadeUpProps(0.24)}>
              <Link href="/editor/local" className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
                Start for free
              </Link>
              <button onClick={openSignin} className="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-6 py-3 font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]">
                Sign in
              </button>
            </motion.div>

            <motion.p className="mt-4 font-mono text-xs text-ink-faint" {...fadeUpProps(0.3)}>
              no account needed to try it
            </motion.p>
          </div>

          <motion.div className="hidden lg:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <HeroDiagram />
          </motion.div>

          <motion.div className="flex justify-center lg:hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <DiagramBox name="ParkingLot" fields={['- levels: List<Level>']} methods={['+ getAvailableSpot(): Spot']} className="w-56" />
          </motion.div>
        </div>
      </section>

      {/* ─── Spec strip ─────────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SpecStrip />
        </div>
      </section>

      {/* ─── Who it's for ───────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="02">who it&apos;s for</Eyebrow>
          <h2 className="mb-2 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Built for one job. Excellent at it.
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-ink-muted">
            Generic diagramming tools are built for everything — org charts, flowcharts, mind maps,
            network diagrams. LLDCanvas does one thing: UML class diagrams for software design.
            That focus makes every feature sharper.
          </p>
          <WhoIsItFor />
        </div>
      </section>

      {/* ─── Feature chain ──────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="03">what it actually does</Eyebrow>
          <h2 className="mb-8 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Five interfaces. One canvas.
          </h2>
          <FeatureChain />
        </div>
      </section>

      {/* ─── Differentiators ────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Eyebrow index="04">what only we have</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            See the difference, not just hear about it.
          </h2>
          <ComparisonTable />
        </div>
      </section>

      {/* ─── Interview Mode ─────────────────────────────────────────────────── */}
      {/* A soft brand-tinted band, built entirely from the page's own tokens.
          The pitch is the habit loop — streak, heatmap, weekly progress —
          shown as a real dashboard mockup, not described in a bullet list. */}
      <section id="interview-mode" className="scroll-mt-20 bg-brand-tint/60 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <motion.div {...inViewProps()} className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-tint px-3 py-1">
                  <Mic className="h-3 w-3 text-brand" />
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-brand uppercase">
                    Interview Mode
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-tint px-3 py-1">
                  <Flame className="h-3 w-3 text-gold" />
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-gold uppercase">
                    Our most-loved feature
                  </span>
                </span>
              </motion.div>

              <motion.p {...inViewProps(0.04)} className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
                <span className="text-gold">¶05</span> — practice like the real thing
              </motion.p>

              <motion.h2 {...inViewProps(0.08)} className="mb-5 max-w-md font-serif text-3xl leading-[1.15] font-medium text-ink sm:text-4xl">
                Practice under real pressure. Watch it add up.
              </motion.h2>

              <motion.p {...inViewProps(0.12)} className="mb-6 max-w-md text-base leading-relaxed text-ink-muted">
                Set a timer and design against a real countdown — the exact pressure you&apos;ll
                feel in the actual interview, so the first time you work under a clock isn&apos;t
                the day it counts. Every session is then logged automatically: watch a daily
                streak build, an activity heatmap fill in week by week, and a practice-time
                graph trend upward.
              </motion.p>

              <motion.div {...inViewProps(0.14)} className="mb-8 max-w-md space-y-3">
                {WHY_IT_WORKS.map(reason => (
                  <div key={reason} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <p className="text-sm leading-relaxed text-ink-muted">{reason}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div {...inViewProps(0.16)} className="mb-8 flex flex-wrap gap-2">
                {PRACTICE_CHIPS.map(f => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper-elevated px-3.5 py-1.5 text-xs text-ink-muted shadow-sm transition-all duration-150 hover:border-brand/30 hover:text-ink"
                  >
                    <f.icon className="h-3 w-3 text-brand" />
                    {f.label}
                  </span>
                ))}
              </motion.div>

              <motion.div {...inViewProps(0.2)}>
                <Link
                  href="/editor/local"
                  className="group inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition-all duration-150 hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/25 active:scale-[0.97]"
                >
                  Start your streak
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            <PracticeDashboardPreview />
          </div>
        </div>
      </section>

      {/* ─── Library ────────────────────────────────────────────────────────── */}
      <section id="patterns" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="06">what&apos;s already inside</Eyebrow>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            A library, not a blank page.
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-ink-muted">
            All 23 classic design pattern skeletons are pre-built with the correct UML structure
            and relationship wiring. Start from a working skeleton and adapt it — instead of
            recreating the same boilerplate diagram for the tenth time.
          </p>
          <LibrarySection />
        </div>
      </section>

      {/* ─── Process ────────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Eyebrow index="07">how it works</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Three steps, not thirty.
          </h2>
          <ProcessPath />
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Eyebrow index="08">questions</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Everything worth knowing before you start.
          </h2>
          <Faq />
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-24 sm:px-8">
        <motion.div className="mx-auto max-w-md" {...inViewProps()}>
          <div className="overflow-hidden rounded-md border border-hairline-strong bg-paper-elevated shadow-sm">
            <div className="border-b border-hairline px-5 py-3">
              <p className="font-mono text-sm font-semibold text-ink">YourNextInterview</p>
            </div>
            <div className="space-y-1 px-2 py-3">
              <Link href="/editor/local" className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-brand-tint">
                <span className="font-mono text-[13px]">
                  <span className="text-brand">+ practice()</span>
                  <span className="text-ink-faint">: </span>
                  <span className="text-ink">OpenCanvas</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <button onClick={openSignup} className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-hairline/40">
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

      {/* ─── Footer — a distinct band, not the same canvas backdrop as the rest
           of the page, so the page has a clear close instead of trailing off ── */}
      <footer className="border-t-2 border-brand/25 bg-brand-tint/60 px-5 pt-14 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Wordmark height={34} />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                The fastest UML class diagram editor for Low-Level Design interviews and OOP design sessions.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="mb-3 font-mono text-[10px] font-medium tracking-widest text-brand uppercase">Product</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/editor/local" className="text-ink-muted transition-colors hover:text-ink">Open editor</Link></li>
                  {session && (
                    <li><Link href="/dashboard" className="text-ink-muted transition-colors hover:text-ink">Dashboard</Link></li>
                  )}
                </ul>
              </div>

              {!session && (
                <div>
                  <p className="mb-3 font-mono text-[10px] font-medium tracking-widest text-brand uppercase">Account</p>
                  <ul className="space-y-2 text-sm">
                    <li><button onClick={openSignin} className="text-ink-muted transition-colors hover:text-ink">Sign in</button></li>
                    <li><button onClick={openSignup} className="text-ink-muted transition-colors hover:text-ink">Create account</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-brand/20 pt-6 font-mono text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} LLDCanvas — built for engineers, by engineers.</p>
            <p>¶ v1.0</p>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </div>
  )
}
