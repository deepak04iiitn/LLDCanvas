'use client'

import React, { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, ChevronDown, Check, X,
  Clock, StickyNote, Flame, BarChart2, CalendarDays, Mic,
  Bookmark, ThumbsUp, Building2, PlayCircle, CheckCircle2, MessageCircle,
  MousePointer2, Zap, UserPlus, Lock,
  Layers, GitBranch, ArrowLeftRight, Key, type LucideIcon,
} from 'lucide-react'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection'
import { Eyebrow } from '@/components/marketing/Eyebrow'
import { DiagramStage, DiagramNode, DiagramBox, type DiagramEdge } from '@/components/marketing/ConnectedDiagram'
import { FAQS } from '@/components/marketing/faq-data'
import { EASE, fadeUpProps, inViewProps } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth'

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

// ─── Hero diagram ─────────────────────────────────────────────────────────────
const HERO_EDGES: DiagramEdge[] = [
  { id: 'e1', from: { node: 'pl', side: 'bottom' }, to: { node: 'lvl', side: 'top' }, marker: 'diamond-filled', markerSide: 'start' },
  { id: 'e2', from: { node: 'pl', side: 'right' }, to: { node: 'fee', side: 'left' }, variant: 'dashed', marker: 'arrow' },
  { id: 'e3', from: { node: 'lvl', side: 'right' }, to: { node: 'veh', side: 'left' } },
]

function HeroDiagram() {
  return (
    <div className="relative">
      {/* 2×2 grid: ParkingLot top-left · FeeStrategy top-right · Level bottom-left · Vehicle bottom-right */}
      <DiagramStage edges={HERO_EDGES} className="h-[310px] w-full">
        <DiagramNode id="pl" className="w-44" style={{ left: '2%', top: '3%' }}>
          <DiagramBox name="ParkingLot" fields={['- levels: List<Level>']} methods={['+ getAvailableSpot(): Spot']} />
        </DiagramNode>
        <DiagramNode id="fee" className="w-44" style={{ right: '2%', top: '3%' }}>
          <DiagramBox stereotype="interface" dashed name="FeeStrategy" methods={['+ calculate(t: Ticket): float']} />
        </DiagramNode>
        <DiagramNode id="lvl" className="w-40" style={{ left: '2%', bottom: '3%' }}>
          <DiagramBox name="Level" fields={['- spots: List<Spot>']} methods={['+ getFreeSpot(): Spot']} />
        </DiagramNode>
        <DiagramNode id="veh" className="w-44" style={{ right: '2%', bottom: '3%' }}>
          <DiagramBox name="Vehicle" fields={['- licensePlate: String', '- type: VehicleType']} />
        </DiagramNode>
      </DiagramStage>
    </div>
  )
}

// ─── Who it's for — conference ID badges on a lanyard ─────────────────────────
const PERSONAS = [
  {
    n: '01',
    kicker: 'LLD & system design interviews',
    title: 'Interview candidates',
    desc: 'Timed practice with real analytics, a problems library tagged by company, staged hints when you\'re stuck, and community discussion once you\'ve submitted - the same pressure you\'ll feel in the actual room.',
    tilt: '-rotate-3',
  },
  {
    n: '02',
    kicker: 'Design docs & pairing',
    title: 'Engineering teams',
    desc: 'Invite a teammate into the same diagram in real time, leave threaded @mention comments pinned to the exact node, and export straight into your design doc - PNG, SVG, PlantUML, or Mermaid.',
    tilt: 'rotate-2',
  },
  {
    n: '03',
    kicker: 'OOP, patterns & fundamentals',
    title: 'Self-taught engineers',
    desc: 'All 23 design patterns pre-wired, bite-sized revision notes for the fundamentals, Draft Notation to describe a design in plain English, and a sandbox to actually run what you built - no CS degree required.',
    tilt: '-rotate-1',
  },
]

function PersonaBadge({ p, delay }: { p: typeof PERSONAS[number]; delay: number }) {
  return (
    <motion.div
      {...inViewProps(delay)}
      className={cn(
        'group flex shrink-0 flex-col items-center transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:rotate-0',
        p.tilt,
      )}
    >
      <div className="h-4 w-5 rounded-t-md border border-b-0 border-hairline-strong bg-paper-elevated" />
      <div className="-mt-px h-3 w-px bg-hairline-strong" />
      <div className="relative w-72 overflow-hidden rounded-lg border border-hairline-strong bg-paper-elevated shadow-md transition-shadow duration-300 group-hover:shadow-xl">
        <div className="absolute top-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-hairline-strong bg-paper" />
        <div className="border-b border-dashed border-hairline px-5 pt-8 pb-4 text-center">
          <p className="mb-3 font-mono text-[9px] font-semibold tracking-[0.2em] text-ink-faint uppercase">LLDCanvas &middot; Attendee</p>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint font-mono text-lg font-bold text-brand">{p.n}</div>
          <p className="mb-1 font-mono text-[10px] tracking-widest text-gold uppercase">{p.kicker}</p>
          <h3 className="font-serif text-lg font-medium text-ink">{p.title}</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs leading-relaxed text-ink-muted">{p.desc}</p>
        </div>
        <div className="flex items-end justify-center gap-[2px] border-t border-hairline bg-paper px-5 py-3">
          {Array.from({ length: 26 }).map((_, bi) => (
            <div key={bi} className="bg-ink-faint/35" style={{ width: bi % 3 === 0 ? 2 : 1, height: 8 + ((bi * 7) % 4) * 3 }} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function WhoIsItFor() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-10">
      {PERSONAS.map((p, i) => <PersonaBadge key={p.n} p={p} delay={i * 0.08} />)}
    </div>
  )
}

// ─── Draft Notation ────────────────────────────────────────────────────────────
const DRAFT_SNIPPET = `User
User knows id, name: String, email: String
User can login(), getProfile(): Profile

Post
Post knows id, content: String

User has many Post`

function TypewriterDraftBlock() {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const startedRef = useRef(false)

  function start() {
    if (startedRef.current) return
    startedRef.current = true
    let i = 0
    const id = setInterval(() => {
      i += 2
      setShown(DRAFT_SNIPPET.slice(0, i))
      if (i >= DRAFT_SNIPPET.length) { clearInterval(id); setDone(true) }
    }, 20)
  }

  return (
    <motion.div {...inViewProps(0.1)} onViewportEnter={start} viewport={{ once: true, margin: '-80px' }} className="w-full">
      <div className="overflow-hidden rounded-t-xl border border-b-0 border-hairline shadow-lg">
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#14130f] px-4 py-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-brand/20">
            <span className="font-mono text-[10px] font-black text-emerald-300">{`{}`}</span>
          </div>
          <span className="font-mono text-xs font-semibold text-white/80">Draft Notation</span>
        </div>
        <pre className="h-[190px] overflow-hidden bg-[#14130f] p-5 font-mono text-[13px] leading-6 text-white/80">
          {shown}
          {!done && <span className="animate-pulse text-emerald-400">▍</span>}
        </pre>
      </div>
      <div className="relative border-t-2 border-dashed border-hairline-strong">
        <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
        <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
        <span className={cn('absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap', 'rounded-full border border-hairline-strong bg-paper px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-brand', 'transition-opacity duration-300', done ? 'opacity-100' : 'opacity-0')}>
          <Zap className="h-3 w-3" /> renders instantly
        </span>
      </div>
      <motion.div
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 8 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap justify-center gap-4 rounded-b-xl border border-t-0 border-hairline bg-paper-elevated p-6 shadow-lg"
      >
        <DiagramBox name="User" fields={['+ id:', '+ name: String', '+ email: String']} methods={['+ login()', '+ getProfile(): Profile']} className="w-44" />
        <DiagramBox name="Post" fields={['+ id:', '+ content: String']} className="w-40" />
      </motion.div>
    </motion.div>
  )
}

const DRAFT_POINTS = [
  'Round-trips both ways - export any diagram back to Draft Notation text whenever you need words instead of boxes.',
  'The same parser powers the standalone Playground and the one-shot Draft importer inside the editor.',
  'Describe a design in an interview the way you\'d actually say it, then watch it become the artifact.',
]

function DraftNotationSection() {
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <motion.p {...inViewProps(0)} className="mb-5 max-w-md text-base leading-relaxed text-ink-muted">
          No angle brackets, no drag-and-drop required. Describe a design in a sentence like{' '}
          <code className="rounded bg-hairline px-1 py-0.5 font-mono text-[13px] text-brand">User has many Post</code>{' '}
          and the relationship, the arrow, and the multiplicity all render themselves instantly.
        </motion.p>
        <motion.div {...inViewProps(0.05)} className="mb-6 max-w-md space-y-2.5">
          {DRAFT_POINTS.map(pt => (
            <div key={pt} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p className="text-sm leading-relaxed text-ink-muted">{pt}</p>
            </div>
          ))}
        </motion.div>
        <motion.div {...inViewProps(0.1)} className="flex flex-wrap gap-3">
          <Link href="/playground" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
            Open the Playground <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/docs" className="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-5 py-2.5 text-sm font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]">
            Read the syntax guide
          </Link>
        </motion.div>
      </div>
      <TypewriterDraftBlock />
    </div>
  )
}

// ─── Interview Mode ───────────────────────────────────────────────────────────
const PRACTICE_CHIPS = [
  { icon: Flame,        label: 'Daily streaks' },
  { icon: CalendarDays, label: 'Activity heatmap' },
  { icon: BarChart2,    label: 'Progress analytics' },
  { icon: Clock,        label: 'Flexible timers' },
  { icon: StickyNote,   label: 'Session notes' },
]

const WHY_IT_WORKS = [
  'Most candidates only ever practice untimed - the clock is the one part nobody rehearses.',
  'A visible streak turns "I should probably practice" into something you actually do, daily.',
  'Every canvas and note is saved automatically the moment you stop - nothing to set up first.',
]

const HEATMAP_LEVELS = Array.from({ length: 98 }, (_, i) => {
  if (i >= 86) return (i % 3 === 0) ? 3 : 4
  const cycle = i % 9
  if (cycle === 0 || cycle === 4) return 0
  return 1 + (i % 3)
})
const HEATMAP_LEVEL_CLASSES = ['bg-hairline', 'bg-brand/20', 'bg-brand/45', 'bg-brand/70', 'bg-brand']

function StreakHeatmap() {
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
        {HEATMAP_LEVELS.map((level, i) => <div key={i} className={cn('h-2.5 w-2.5 rounded-[2px]', HEATMAP_LEVEL_CLASSES[level])} />)}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5">
        <span className="font-mono text-[9px] text-ink-faint">Less</span>
        {HEATMAP_LEVEL_CLASSES.map((c, i) => <div key={i} className={cn('h-2 w-2 rounded-[2px]', c)} />)}
        <span className="font-mono text-[9px] text-ink-faint">More</span>
      </div>
    </div>
  )
}

const WEEKLY_MINUTES = [20, 35, 15, 50, 40, 65, 55, 85]
function StreakGraph() {
  const max = Math.max(...WEEKLY_MINUTES)
  return (
    <div className="flex h-20 items-end gap-2">
      {WEEKLY_MINUTES.map((m, i) => (
        <motion.div key={i} className="flex-1 rounded-t-sm bg-brand/70 first:bg-brand/40 last:bg-brand"
          initial={{ height: 0 }} whileInView={{ height: `${(m / max) * 100}%` }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }} />
      ))}
    </div>
  )
}

const DASHBOARD_STATS = [
  { n: '42',      label: 'Sessions logged' },
  { n: '18h 20m', label: 'Time practiced' },
  { n: '12 days', label: 'Current streak' },
]
const DEMO_QUESTIONS = ['Design a Parking Lot', 'Design a Rate Limiter', 'Design an Elevator System', 'Design a Notification Service']
const DEMO_DURATION = 40

function LiveSessionRow() {
  const [secondsLeft, setSecondsLeft] = useState(DEMO_DURATION)
  const [qIndex, setQIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { setQIndex(q => (q + 1) % DEMO_QUESTIONS.length); return DEMO_DURATION }
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
        <p className="mt-0.5 font-mono text-[10px] text-ink-faint italic">sped up - real sessions run the full 45</p>
      </div>
      <div className={cn('shrink-0 font-mono text-4xl font-bold tabular-nums transition-colors duration-700 sm:text-5xl', color)}>
        {m}:{s}
      </div>
    </div>
  )
}

function PracticeDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper-elevated shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <p className="font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">Your practice activity</p>
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

// ─── Problems + Community ──────────────────────────────────────────────────────
const BENTO_PROBLEMS = [
  { title: 'Design a Rate Limiter',    diff: 'Hard',   companies: ['Stripe', 'Cloudflare'], attempts: 234, active: false },
  { title: 'Design a Parking Lot',     diff: 'Medium', companies: ['Amazon', 'Uber'],        attempts: 189, active: true  },
  { title: 'Design Notification Hub',  diff: 'Easy',   companies: ['Meta'],                  attempts: 312, active: false },
]
const DIFF_BADGE: Record<string, string> = {
  Easy: 'bg-brand-tint text-brand', Medium: 'bg-gold-tint text-gold', Hard: 'bg-red-50 text-red-600',
}

function ProblemsCommunitySection() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div {...inViewProps(0)} className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-hairline bg-paper-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Problem Library</p>
            <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] text-ink-faint">110+ problems</span>
          </div>
          <div className="space-y-1.5">
            {BENTO_PROBLEMS.map((p, i) => (
              <motion.div key={p.title} {...inViewProps(0.06 + i * 0.06)}
                className={cn('flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all', p.active ? 'border border-brand/20 bg-brand-tint' : 'border border-transparent hover:bg-hairline/50')}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold', DIFF_BADGE[p.diff])}>{p.diff}</span>
                  <h3 className={cn('m-0 truncate text-sm font-medium', p.active ? 'text-brand' : 'text-ink')}>{p.title}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {p.companies.slice(0, 2).map(c => (
                    <span key={c} className="hidden rounded-md border border-hairline px-1.5 py-0.5 font-mono text-[8px] text-ink-faint sm:inline">{c}</span>
                  ))}
                  <span className="font-mono text-[10px] text-ink-faint">{p.attempts}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...inViewProps(0.18)} className="mt-3 rounded-xl border border-brand/15 bg-paper px-4 py-3">
            <p className="mb-1 font-mono text-[9px] text-brand">Currently solving</p>
            <p className="text-sm font-medium text-ink">Design a Parking Lot</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">Model the lot, levels, spots, and a fee strategy that varies by vehicle type and duration.</p>
          </motion.div>
        </motion.div>

        <motion.div {...inViewProps(0.08)} className="rounded-2xl border border-hairline bg-paper-elevated p-5">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">By difficulty</p>
          <div className="space-y-3">
            {([['Easy', 40, 'bg-brand'], ['Medium', 35, 'bg-gold'], ['Hard', 25, 'bg-red-500']] as [string, number, string][]).map(([d, pct, bg]) => (
              <div key={d}>
                <div className="mb-1 flex justify-between">
                  <span className="font-mono text-[10px] text-ink-muted">{d}</span>
                  <span className="font-mono text-[10px] text-ink-faint">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                  <motion.div className={cn('h-full rounded-full', bg)} initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="mb-2 font-mono text-[10px] text-ink-faint">Asked by</p>
            <div className="flex flex-wrap gap-1">
              {['Google', 'Amazon', 'Meta', 'Stripe', 'Uber'].map(c => (
                <span key={c} className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[8px] text-ink-muted">{c}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...inViewProps(0.1)} className="rounded-2xl border border-hairline bg-paper-elevated p-5">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Staged Hints</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-hairline/50 px-3 py-2 opacity-50">
              <Lock className="h-3 w-3 shrink-0 text-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">Hint 1 of 3</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 4 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="rounded-lg border border-brand/20 bg-brand-tint px-3 py-2.5">
              <p className="mb-1 font-mono text-[9px] font-semibold text-brand">Hint 2 of 3 ↓</p>
              <p className="text-[11px] leading-relaxed text-ink">Think about counting requests over a sliding window - not fixed intervals.</p>
            </motion.div>
            <div className="flex items-center gap-2 rounded-lg bg-hairline/50 px-3 py-2 opacity-50">
              <Lock className="h-3 w-3 shrink-0 text-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">Hint 3 of 3</span>
            </div>
          </div>
        </motion.div>

        <motion.div {...inViewProps(0.12)} className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-hairline bg-paper-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Community Discussion</p>
            <span className="font-mono text-[10px] text-ink-faint">127 posts</span>
          </div>
          <div className="space-y-2.5">
            <div className="rounded-xl border border-hairline bg-paper p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500 font-mono text-[8px] font-bold text-white">P</div>
                <span className="text-xs font-semibold text-ink">Priya M.</span>
                <span className="text-[10px] text-ink-faint">· 2h ago</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-ink-faint"><ThumbsUp className="h-2.5 w-2.5" /> 24</div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-muted">Used token bucket over leaky bucket - way simpler to handle burst allowance. Shared my full canvas diagram in the thread ↗</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 font-mono text-[8px] font-bold text-white">A</div>
                <span className="text-xs font-semibold text-ink">Alex R.</span>
                <span className="text-[10px] text-ink-faint">· 5h ago</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-ink-faint"><ThumbsUp className="h-2.5 w-2.5" /> 18</div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-muted">
                <span className="font-medium text-brand">@Priya</span>{' '}How did you handle distributed counting across nodes? Redis sorted sets?
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <motion.div {...inViewProps(0.2)} className="pt-2">
        <Link href="/features/interview-questions" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
          Browse the library <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  )
}

// ─── Revision Notes — flip cards ─────────────────────────────────────────────
const DIFF_CARD_STYLE: Record<string, { badge: string; border: string; bg: string; icon: string; backBg: string; backBorder: string }> = {
  Basic:        { badge: 'bg-brand-tint text-brand', border: 'border-brand/20', bg: 'bg-brand-tint/40',  icon: 'text-brand/10',   backBg: 'bg-brand-tint', backBorder: 'border-brand/25' },
  Intermediate: { badge: 'bg-gold-tint text-gold',   border: 'border-gold/25',  bg: 'bg-gold-tint/40',   icon: 'text-gold/10',    backBg: 'bg-gold-tint',  backBorder: 'border-gold/30'  },
  Advanced:     { badge: 'bg-red-50 text-red-500',   border: 'border-red-200',  bg: 'bg-red-50/50',      icon: 'text-red-400/10', backBg: 'bg-red-50',     backBorder: 'border-red-200'  },
}

const REVISION_TOPICS: { title: string; difficulty: string; revised: boolean; insight: string; Icon: LucideIcon }[] = [
  { title: 'SOLID Principles',            difficulty: 'Basic',        revised: true,  Icon: Layers,         insight: 'Five rules for classes that survive contact with new requirements - start with Single Responsibility, the other four follow from it.' },
  { title: 'Composition vs. Inheritance', difficulty: 'Basic',        revised: true,  Icon: GitBranch,      insight: 'Favor "has-a" over "is-a" when behavior needs to change at runtime - inheritance locks in a shape at compile time.' },
  { title: 'Singleton Thread-Safety',     difficulty: 'Intermediate', revised: false, Icon: Lock,           insight: 'Double-checked locking exists because synchronizing the whole getInstance() call is correct but needlessly slow after the first call.' },
  { title: 'REST vs. RPC',                difficulty: 'Intermediate', revised: false, Icon: ArrowLeftRight, insight: 'REST models resources and state transitions; RPC models actions. Pick RPC when the operation isn\'t naturally a noun.' },
  { title: 'CAP Theorem',                 difficulty: 'Advanced',     revised: false, Icon: BarChart2,      insight: 'Under a network partition you choose Consistency or Availability - you never get to skip that choice, only which side you land on.' },
  { title: 'Idempotency in APIs',         difficulty: 'Advanced',     revised: false, Icon: Key,            insight: 'An idempotency key lets a client safely retry a POST after a timeout without risking a duplicate charge or write.' },
]

function FlipCard({ topic, delay }: { topic: typeof REVISION_TOPICS[number]; delay: number }) {
  const s = DIFF_CARD_STYLE[topic.difficulty]
  return (
    <motion.div {...inViewProps(delay)} className="group h-48 [perspective:1200px]">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className={cn('absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border p-4 [backface-visibility:hidden]', s.bg, s.border)}>
          <topic.Icon className={cn('absolute right-4 top-1/2 -translate-y-1/2 h-20 w-20', s.icon)} aria-hidden />
          <div className="flex items-start justify-between">
            <span className={cn('rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold', s.badge)}>{topic.difficulty}</span>
            {topic.revised ? <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" /> : <Bookmark className="h-4 w-4 shrink-0 text-ink-faint" />}
          </div>
          <div className="relative z-10">
            <h3 className="mb-1 text-sm font-semibold text-ink">{topic.title}</h3>
            <p className="font-mono text-[10px] text-ink-faint">hover to revise →</p>
          </div>
        </div>
        <div className={cn('absolute inset-0 flex flex-col justify-between rounded-xl border p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]', s.backBg, s.backBorder)}>
          <p className={cn('font-mono text-[9px] font-semibold uppercase tracking-widest', s.badge.split(' ')[1])}>{topic.difficulty}</p>
          <p className="text-[12px] leading-relaxed text-ink">{topic.insight}</p>
          <p className="font-mono text-[9px] text-ink-faint">{topic.title}</p>
        </div>
      </div>
    </motion.div>
  )
}

function RevisionNotesSection() {
  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REVISION_TOPICS.map((t, i) => <FlipCard key={t.title} topic={t} delay={i * 0.04} />)}
      </div>
    </div>
  )
}

// ─── Code Execution ───────────────────────────────────────────────────────────
const LANG_SAMPLES = [
  { lang: 'Python', ext: 'py', prompt: '>>>', code: `class FeeStrategy:\n    def calculate(self, ticket):\n        hours = ticket.duration_hours()\n        return max(hours, 1) * 2.5\n\n    def get_rate(self) -> float:\n        return self._rate`, output: '7.5' },
  { lang: 'TypeScript', ext: 'ts', prompt: '$', code: `class FeeStrategy {\n  calculate(ticket: Ticket): number {\n    const hours = ticket.durationHours()\n    return Math.max(hours, 1) * 2.5\n  }\n\n  getRate(): number { return this.rate }\n}`, output: '7.5' },
  { lang: 'Java', ext: 'java', prompt: '$', code: `class FeeStrategy {\n  double calculate(Ticket t) {\n    int hours = t.durationHours();\n    return Math.max(hours, 1) * 2.5;\n  }\n\n  double getRate() { return this.rate; }\n}`, output: '7.5' },
  { lang: 'Go', ext: 'go', prompt: '$', code: `func (f *FeeStrategy) Calculate(\n    t Ticket,\n) float64 {\n    h := t.DurationHours()\n    return math.Max(float64(h), 1) * 2.5\n}\n\nfunc (f *FeeStrategy) GetRate() float64 {\n    return f.rate\n}`, output: '7.5' },
  { lang: 'Rust', ext: 'rs', prompt: '$', code: `impl FeeStrategy {\n    pub fn calculate(&self, t: &Ticket) -> f64 {\n        let hours = t.duration_hours();\n        hours.max(1.0) * 2.5\n    }\n\n    pub fn get_rate(&self) -> f64 { self.rate }\n}`, output: '7.5' },
  { lang: 'C#', ext: 'cs', prompt: '$', code: `class FeeStrategy {\n  public double Calculate(Ticket t) {\n    int hours = t.DurationHours();\n    return Math.Max(hours, 1) * 2.5;\n  }\n\n  public double GetRate() => this.Rate;\n}`, output: '7.5' },
]
const EXTRA_LANGS = ['Ruby', 'PHP', 'Haskell', 'C++', 'Swift', 'Kotlin', 'F#', 'Scala']

function CodeExecutionSection() {
  const [active, setActive] = useState(0)
  const [ran, setRan] = useState(false)
  const sample = LANG_SAMPLES[active]
  function pickLang(i: number) { setActive(i); setRan(false) }

  return (
    <motion.div {...inViewProps(0)} className="overflow-hidden rounded-2xl border border-hairline shadow-xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/6 bg-[#0e0d0a] px-4 py-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className="font-mono text-[10px] text-white/25 select-none">FeeStrategy - LLDCanvas Studio</span>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {LANG_SAMPLES.map((s, i) => (
            <button key={s.lang} onClick={() => pickLang(i)}
              className={cn('rounded-md px-2.5 py-1 font-mono text-[10px] transition-all', i === active ? 'bg-white/12 text-white/85' : 'text-white/30 hover:text-white/60')}>
              {s.lang}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-[220px] divide-x divide-white/6 bg-[#0e0d0a]">
        <div className="hidden w-44 shrink-0 flex-col items-center justify-center gap-3 bg-[#0a0908]/60 p-5 lg:flex">
          <p className="self-start font-mono text-[9px] uppercase tracking-widest text-white/20">Design</p>
          <div className="w-full overflow-hidden rounded-lg border border-white/10">
            <div className="border-b border-white/10 bg-white/5 px-3 py-1.5 text-center">
              <span className="font-mono text-[10px] font-semibold text-white/65">FeeStrategy</span>
            </div>
            <div className="border-b border-white/10 bg-white/[0.02] px-3 py-1.5 space-y-0.5">
              <p className="font-mono text-[9px] text-white/30">- rate : float</p>
              <p className="font-mono text-[9px] text-white/30">- maxHours : int</p>
            </div>
            <div className="bg-white/[0.02] px-3 py-1.5 space-y-0.5">
              <p className="font-mono text-[9px] text-emerald-400/55">+ calculate(t)</p>
              <p className="font-mono text-[9px] text-emerald-400/55">+ getRate()</p>
            </div>
          </div>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1 self-end font-mono text-[8px] text-white/20">
            generates <ArrowRight className="h-2.5 w-2.5" />
          </motion.div>
        </div>
        <div className="flex-1 overflow-hidden bg-[#14130f]">
          <AnimatePresence mode="wait">
            <motion.pre key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
              className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.75] text-white/75">
              {sample.code.split('\n').map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-4 shrink-0 select-none text-right text-white/18">{i + 1}</span>
                  <span>{line || ' '}</span>
                </div>
              ))}
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-white/6 bg-[#0a0908] px-5 py-3">
        <span className="font-mono text-[10px] text-white/20 select-none">{sample.prompt} run FeeStrategy.{sample.ext}</span>
        <AnimatePresence>
          {ran && (
            <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="font-mono text-[11px] text-emerald-400">
              → {sample.output}
            </motion.span>
          )}
        </AnimatePresence>
        <div className="flex-1" />
        <button onClick={() => setRan(true)}
          className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] font-semibold text-white transition-all duration-200', ran ? 'bg-emerald-700/60 cursor-default' : 'bg-emerald-600/80 hover:bg-emerald-600 active:scale-95')}>
          <PlayCircle className="h-3 w-3" />{ran ? 'Ran ✓' : 'Run'}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/6 bg-[#0e0d0a] px-5 py-2.5">
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/18 mr-1">Also</span>
        {EXTRA_LANGS.map(l => (
          <span key={l} className="rounded-md border border-white/8 px-2 py-0.5 font-mono text-[9px] text-white/28">{l}</span>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Live Collaboration ───────────────────────────────────────────────────────
function LiveCursorTag({ name, color, bgColor, borderColor, left, top, delay }: {
  name: string; color: string; bgColor: string; borderColor: string; left: string; top: string; delay: number
}) {
  return (
    <motion.div className="pointer-events-none absolute z-20 select-none" style={{ left, top }}
      animate={{ x: [0, 7, -4, 3, 0], y: [0, -5, 3, -2, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay }}>
      <svg width="13" height="15" viewBox="0 0 13 15" aria-hidden className="drop-shadow-sm">
        <path d="M1 1L1 11L4 8L6.5 14L8 13.3L5.5 7.5L10.5 7.5L1 1Z" fill={color} />
      </svg>
      <div className="mt-[2px] whitespace-nowrap rounded-full px-1.5 py-[1px] font-mono text-[9px] font-semibold leading-none shadow-sm"
        style={{ backgroundColor: bgColor, color, border: `1px solid ${borderColor}` }}>
        {name}
      </div>
    </motion.div>
  )
}

function CollabDiagram() {
  const nodes = [
    { label: 'API Gateway',  sub: '«entry»',   x: 40,  y: 55,  w: 148, h: 52, glow: '#0284c7' as string | null },
    { label: 'AuthService',  sub: '«service»', x: 372, y: 55,  w: 148, h: 52, glow: null },
    { label: 'OrderService', sub: '«service»', x: 40,  y: 220, w: 148, h: 52, glow: null },
    { label: 'Database',     sub: '«storage»', x: 372, y: 220, w: 148, h: 52, glow: '#7c3aed' as string | null },
  ]
  const cx = (n: typeof nodes[0]) => n.x + n.w / 2
  const cy = (n: typeof nodes[0]) => n.y + n.h / 2
  const [gw, au, or_, db] = nodes
  const edges = [
    { x1: gw.x + gw.w, y1: cy(gw), x2: au.x,       y2: cy(au) },
    { x1: cx(gw),       y1: gw.y + gw.h, x2: cx(or_), y2: or_.y },
    { x1: cx(au),       y1: au.y + au.h, x2: cx(db),  y2: db.y  },
    { x1: or_.x + or_.w, y1: cy(or_), x2: db.x,     y2: cy(db) },
  ]
  return (
    <div className="relative h-[318px] w-full select-none overflow-hidden">
      <svg viewBox="0 0 560 318" className="h-full w-full">
        <defs>
          <pattern id="cg" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.6" fill="#D6D3D1" />
          </pattern>
          <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#9CA3AF" />
          </marker>
        </defs>
        <rect width="560" height="318" fill="url(#cg)" />
        {edges.map((e, i) => (
          <motion.line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#D1D5DB" strokeWidth={1.5} markerEnd="url(#arr)"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }} />
        ))}
        {nodes.map((n, i) => (
          <motion.g key={n.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.12, duration: 0.35 }}>
            {n.glow && <rect x={n.x - 5} y={n.y - 5} width={n.w + 10} height={n.h + 10} rx={12} fill={n.glow} opacity={0.09} />}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} fill="white" stroke={n.glow ?? '#E5E7EB'} strokeWidth={n.glow ? 1.5 : 1} />
            <text x={n.x + n.w / 2} y={n.y + 21} textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize={11} fontWeight={600} fill="#1C1917">{n.label}</text>
            <text x={n.x + n.w / 2} y={n.y + 36} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8.5} fill="#A8A29E">{n.sub}</text>
          </motion.g>
        ))}
        <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.9, duration: 0.35 }}>
          <foreignObject x="362" y="113" width="190" height="90">
            <div
              // @ts-expect-error xmlns required for SVG foreignObject
              xmlns="http://www.w3.org/1999/xhtml"
              style={{ background: 'white', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 20px rgba(124,58,237,0.13)', fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 8, fontWeight: 700, fontFamily: 'monospace' }}>A</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#1c1917' }}>Alex</span>
                <span style={{ fontSize: 9, color: '#a8a29e', marginLeft: 'auto' }}>just now</span>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: '#78716c', margin: 0, marginBottom: 6 }}>Add a Redis cache layer here? ⚡</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#7c3aed', cursor: 'pointer' }}>Reply</span>
                <span style={{ fontSize: 9, color: '#d6d3d1' }}>·</span>
                <span style={{ fontSize: 9, color: '#a8a29e', cursor: 'pointer' }}>Resolve</span>
              </div>
            </div>
          </foreignObject>
        </motion.g>
      </svg>
      <LiveCursorTag name="Priya" color="#0284c7" bgColor="#e0f2fe" borderColor="#7dd3fc" left="8%" top="17%" delay={0} />
      <LiveCursorTag name="Alex"  color="#7c3aed" bgColor="#ede9fe" borderColor="#c4b5fd" left="62%" top="13%" delay={1.3} />
    </div>
  )
}

const COLLAB_FEATURES = [
  { Icon: MousePointer2, title: 'Live cursors & presence', desc: 'See every teammate\'s cursor in real time - no refresh, no manual sync.' },
  { Icon: MessageCircle, title: 'Pinned @mention comments', desc: 'Threads stay anchored to the exact node they\'re about, not buried in chat.' },
  { Icon: UserPlus,      title: 'Invite by email or link', desc: 'Collaborators get viewer or editor roles the moment they accept.' },
]

function CollaborationSection() {
  return (
    <div className="space-y-8">
      <ul className="space-y-3">
        {COLLAB_FEATURES.map(({ Icon, title, desc }, i) => (
          <motion.li key={title} {...inViewProps(i * 0.07)} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-tint">
              <Icon className="h-3 w-3 text-brand" />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">{title} - </span>{desc}
            </p>
          </motion.li>
        ))}
      </ul>
      <motion.div {...inViewProps(0.15)} className="flex">
        <Link href="/features/collaboration" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
          Start collaborating <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <motion.div {...inViewProps(0.05)} className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_8px_48px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-3 border-b border-hairline bg-paper px-4 py-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="mx-auto font-mono text-[11px] text-ink-faint">PaymentSystem.lld</span>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex -space-x-1.5">
              {([['P','#0284c7'],['A','#7c3aed'],['D','#3D6A52']] as [string,string][]).map(([init, c]) => (
                <div key={init} className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-white font-mono text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: c }}>{init}</div>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-mono text-[9px] font-semibold text-emerald-700">3 live</span>
            </div>
          </div>
        </div>
        <CollabDiagram />
      </motion.div>
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_LINKS: Record<string, [phrase: string, href: string][]> = {
  'What is LLDCanvas?': [['Draft Notation', '/features/draft-notation'], ['code execution sandbox', '/features/code-execution']],
  'What is Low-Level Design (LLD)?': [['SOLID principles', '/features/revision-notes']],
  'What is the difference between Low-Level Design (LLD) and System Design (HLD) interviews?': [['revision notes library', '/features/revision-notes']],
  'How is LLDCanvas different from draw.io or Lucidchart?': [['LLD interview-question library', '/features/interview-questions']],
  'What is Draft Notation?': [['standalone Playground', '/playground'], ['Docs', '/docs']],
  'Does LLDCanvas have a library of LLD and system design interview questions?': [['110+ Low-Level Design problems and interview questions', '/features/interview-questions']],
  'Are SOLID principles covered?': [['revision notes', '/features/revision-notes']],
  'Can I run code, not just draw diagrams?': [['Playground', '/playground']],
  'Is LLDCanvas a free LLD course, or just a diagramming tool?': [['the full problems library', '/features/interview-questions']],
  'Do I need a CS degree or prior experience to learn Low-Level Design here?': [['Basic-tier revision notes', '/features/revision-notes'], ['Easy problems in the library', '/features/interview-questions'], ['Draft Notation', '/features/draft-notation']],
}
const faqLinkClass = 'text-brand underline decoration-hairline-strong underline-offset-2 transition-colors hover:decoration-brand'

function linkifyFaqAnswer(text: string, pairs: [phrase: string, href: string][]): React.ReactNode {
  if (pairs.length === 0) return text
  let earliest: { idx: number; phrase: string; href: string } | null = null
  for (const [phrase, href] of pairs) {
    const idx = text.indexOf(phrase)
    if (idx !== -1 && (!earliest || idx < earliest.idx)) earliest = { idx, phrase, href }
  }
  if (!earliest) return text
  const before = text.slice(0, earliest.idx)
  const after = text.slice(earliest.idx + earliest.phrase.length)
  const remaining = pairs.filter(([phrase]) => phrase !== earliest!.phrase)
  return (<>{before}<Link href={earliest.href} className={faqLinkClass}>{earliest.phrase}</Link>{linkifyFaqAnswer(after, remaining)}</>)
}

function FaqItem({ q, a, index }: { q: string; a: React.ReactNode; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div {...inViewProps(index * 0.03)} className="border-b border-hairline last:border-0">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between gap-6 py-5 text-left">
        <span className="font-medium text-ink">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
        <p className="pb-5 text-sm leading-relaxed text-ink-muted">{a}</p>
      </motion.div>
    </motion.div>
  )
}

function Faq() {
  return (
    <div className="border-t border-hairline">
      {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={linkifyFaqAnswer(f.a, FAQ_LINKS[f.q] ?? [])} index={i} />)}
    </div>
  )
}

// ─── Challenge Labs ───────────────────────────────────────────────────────────
const DAILY_LABS = [
  { n: '09', title: 'Plannr', brief: 'A structured roadmap from zero to interview-ready.', hook: 'Follow it in order or jump straight to the gaps your last mock exposed.', chips: ['Topic sequence', 'Milestone tracking', 'Gap analysis'], href: '/features/plannr' },
  { n: '10', title: 'Daily Quiz', brief: '10 questions a day keeps the patterns sharp.', hook: 'Design patterns and SOLID principles, refreshed every day with full explanations after you answer.', chips: ['10 questions / day', 'Pattern + SOLID', 'Streak tracking'], href: '/features/daily-quiz' },
]

const ACTIVE_LABS = [
  { n: '11', title: 'Pattern Detective', brief: 'Read real production-style code. Name the pattern. Explain why the other three options do not fit.', chips: ['Real code', '23 patterns'], href: '/features/pattern-detective' },
  { n: '12', title: 'Debug Lab',         brief: 'Annotate violations in authored UML diagrams — God Class, SRP breach, tight coupling — before the breakdown reveals.', chips: ['Real violations', 'Annotation mode'], href: '/features/debug-lab' },
  { n: '13', title: 'Debug & Fix',       brief: 'Don\'t just spot the flaw. Restructure the design, apply the pattern, and validate against the clean expected output.', chips: ['Active fixing', 'Pattern application'], href: '/features/debug-and-fix' },
  { n: '14', title: 'Roguelike',         brief: 'Procedurally generated LLD scenarios with permanent decisions and live resource drain. No undo. No two runs the same.', chips: ['No undo', 'Branching outcomes'], href: '/features/roguelike' },
  { n: '15', title: 'Refactor',          brief: 'Take a working but bloated monolith apart. Identify the smells, restructure to clean boundaries, keep it functionally equivalent.', chips: ['Monolith → clean', 'SOLID'], href: '/features/refactor' },
  { n: '16', title: 'Change One Thing',  brief: 'A new requirement arrives mid-design. Absorb it with the minimal blast radius — OCP validation scores your answer.', chips: ['OCP practice', 'Blast radius'], href: '/features/change-one-thing' },
  { n: '17', title: 'Evolution',         brief: 'Grow a design through multiple stages of scale and watch how early trade-offs compound into technical debt.', chips: ['Multi-stage', 'Trade-off tracking'], href: '/features/evolution' },
  { n: '18', title: 'Budget Pressure',   brief: 'Design within a fixed budget, sprint timeline, or headcount limit. Justify every trade-off against the benchmark.', chips: ['Real constraints', 'Budget tracking'], href: '/features/budget-pressure' },
]

function ChallengeLabs() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DAILY_LABS.map((lab, i) => (
          <motion.div key={lab.n} {...inViewProps(i * 0.08)}>
            <Link href={lab.href} className="group flex h-full flex-col rounded-xl border border-brand/25 bg-brand-tint p-6 transition-colors hover:border-brand/50">
              <p className="mb-3 font-mono text-[9px] font-bold tracking-[0.2em] text-brand/60 uppercase">Daily Practice &middot; {lab.n}</p>
              <p className="font-serif text-xl font-semibold text-ink">{lab.title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{lab.brief}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{lab.hook}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lab.chips.map(c => <span key={c} className="rounded-full border border-brand/20 bg-paper-elevated px-2.5 py-0.5 font-mono text-[10px] text-ink-muted">{c}</span>)}
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">Explore {lab.title} <ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIVE_LABS.map((lab, i) => (
          <motion.div key={lab.n} {...inViewProps(0.06 + i * 0.04)}>
            <Link href={lab.href} className="group flex h-full flex-col rounded-xl border border-hairline bg-paper-elevated p-5 transition-colors hover:border-brand/40">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-bold text-brand-foreground">{String(i + 1).padStart(2, '0')}</span>
                <div className="h-px flex-1 bg-hairline" />
              </div>
              <p className="font-serif text-[15px] font-semibold leading-snug text-ink">{lab.title}</p>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{lab.brief}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {lab.chips.map(c => <span key={c} className="rounded-full border border-hairline bg-paper px-2 py-0.5 font-mono text-[9px] text-ink-muted">{c}</span>)}
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand">Explore <ArrowRight className="h-3 w-3" /></span>
            </Link>
          </motion.div>
        ))}
      </div>
      <motion.div {...inViewProps(0.24)} className="flex gap-3 pt-2">
        <Link href="/features" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
          See all 17 features <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  )
}

// ─── Design Studio — tabbed feature showcase ─────────────────────────────────
type StudioTab = 'canvas' | 'draft' | 'code' | 'collab'

const STUDIO_TAB_META: {
  id: StudioTab; n: string; label: string; Icon: LucideIcon
  headline: string; body: string; chips: string[]
  cta: string; ctaHref: string; link: string; linkHref: string
}[] = [
  {
    id: 'canvas', n: '01', label: 'Canvas & Editor', Icon: Layers,
    headline: 'A real UML canvas, built for LLD interviews.',
    body: 'Full UML vocabulary — composition diamonds, inheritance arrows, dashed interfaces, stereotypes — all keyboard-driven. Open and start drawing in under 30 seconds.',
    chips: ['Class diagrams', 'Interface nodes', 'All relationship types', 'PNG · SVG · Mermaid export'],
    cta: 'Open the editor', ctaHref: '/editor/local', link: 'Editor docs', linkHref: '/features/editor',
  },
  {
    id: 'draft', n: '02', label: 'Draft Notation', Icon: Zap,
    headline: 'Say it in English. See it as UML.',
    body: 'Type "User has many Post" and the relationship, arrow, and multiplicity render themselves. Describe the design the way you think — not the way UML expects.',
    chips: ['Natural language → UML', 'Bidirectional sync', 'Standalone Playground'],
    cta: 'Try the Playground', ctaHref: '/playground', link: 'Syntax guide', linkHref: '/docs',
  },
  {
    id: 'code', n: '03', label: 'Code Execution', Icon: PlayCircle,
    headline: "Don't just design it. Run it.",
    body: 'Generate runnable scaffolding from your class diagram and execute in-browser across 12 languages. Design and code in the same window — no context switching.',
    chips: ['12 languages', 'In-browser execution', 'Scaffold from diagram'],
    cta: 'Open the editor', ctaHref: '/editor/local', link: 'Code Execution', linkHref: '/features/code-execution',
  },
  {
    id: 'collab', n: '04', label: 'Collaboration', Icon: UserPlus,
    headline: "You don't design in isolation. Why practice like it?",
    body: 'Live cursors, @mention comments anchored to the exact node, viewer and editor roles. Built for mock interview sessions and real-time pair design.',
    chips: ['Live cursors & presence', 'Pinned @mention threads', 'Viewer / editor roles'],
    cta: 'Start collaborating', ctaHref: '/features/collaboration', link: 'Collaboration', linkHref: '/features/collaboration',
  },
]

function DesignStudioSection() {
  const [activeId, setActiveId] = useState<StudioTab>('canvas')
  const tab = STUDIO_TAB_META.find(t => t.id === activeId)!

  return (
    <div>
      {/* 4-tab picker */}
      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STUDIO_TAB_META.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={cn(
              'group rounded-xl border p-4 text-left transition-all duration-200',
              activeId === t.id
                ? 'border-brand/40 bg-brand-tint shadow-sm'
                : 'border-hairline bg-paper-elevated hover:border-brand/20',
            )}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <t.Icon className={cn('h-3.5 w-3.5 transition-colors', activeId === t.id ? 'text-brand' : 'text-ink-faint')} />
              <span className={cn('font-mono text-[9px] font-bold tracking-wider', activeId === t.id ? 'text-brand' : 'text-ink-faint')}>{t.n}</span>
            </div>
            <p className={cn('font-serif text-sm font-semibold leading-snug', activeId === t.id ? 'text-ink' : 'text-ink-muted')}>{t.label}</p>
          </button>
        ))}
      </div>

      {/* Content: left text / right live demo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[320px_1fr] lg:gap-16 xl:grid-cols-[360px_1fr]"
        >
          {/* Left — text block */}
          <div>
            <h3 className="mb-4 font-serif text-2xl font-medium leading-snug text-ink sm:text-3xl">{tab.headline}</h3>
            <p className="mb-6 text-[15px] leading-relaxed text-ink-muted">{tab.body}</p>
            <div className="mb-7 flex flex-wrap gap-1.5">
              {tab.chips.map(c => (
                <span key={c} className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[10px] text-ink-muted">{c}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={tab.ctaHref}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-[0.97]">
                {tab.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={tab.linkHref} className="text-sm font-medium text-ink-muted transition-colors hover:text-brand">
                {tab.link} →
              </Link>
            </div>
          </div>

          {/* Right — live demo */}
          <div>
            {activeId === 'canvas' && (
              <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper-elevated shadow-xl">
                <div className="flex items-center gap-3 border-b border-hairline bg-paper px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="mx-auto font-mono text-[10px] text-ink-faint">ParkingLot.lld — LLDCanvas Editor</span>
                </div>
                <div className="p-6"><HeroDiagram /></div>
              </div>
            )}
            {activeId === 'draft' && <TypewriterDraftBlock />}
            {activeId === 'code' && <CodeExecutionSection />}
            {activeId === 'collab' && (
              <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper-elevated shadow-xl">
                <div className="flex items-center gap-3 border-b border-hairline bg-paper px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="mx-auto font-mono text-[11px] text-ink-faint">PaymentSystem.lld</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {([['P','#0284c7'],['A','#7c3aed'],['D','#3D6A52']] as [string,string][]).map(([init, c]) => (
                        <div key={init} className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-white font-mono text-[8px] font-bold text-white shadow-sm" style={{ backgroundColor: c }}>{init}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <span className="font-mono text-[9px] font-semibold text-emerald-700">3 live</span>
                    </div>
                  </div>
                </div>
                <CollabDiagram />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Practice Engine — bento dashboard ───────────────────────────────────────
const COMPACT_PROBLEMS = [
  { title: 'Design a Rate Limiter',     diff: 'Hard',   companies: ['Stripe', 'Cloudflare'], attempts: 234 },
  { title: 'Design a Parking Lot',      diff: 'Medium', companies: ['Amazon', 'Uber'],       attempts: 189 },
  { title: 'Design Notification Hub',   diff: 'Easy',   companies: ['Meta'],                 attempts: 312 },
  { title: 'Design an Elevator System', diff: 'Medium', companies: ['Google'],               attempts: 156 },
  { title: 'Design a URL Shortener',    diff: 'Hard',   companies: ['Google', 'Amazon'],     attempts: 278 },
]

function PracticeEngineSection() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

      {/* Interview Mode — spans 2 of 3 columns */}
      <motion.div {...inViewProps(0)} className="lg:col-span-2">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-tint px-2.5 py-0.5">
              <Mic className="h-3 w-3 text-brand" />
              <span className="font-mono text-[10px] font-semibold tracking-widest text-brand uppercase">Interview Mode</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-tint px-2.5 py-0.5">
              <Flame className="h-3 w-3 text-gold" />
              <span className="font-mono text-[10px] font-semibold text-gold">Most-used feature</span>
            </span>
          </div>
          <Link href="/features/interview-mode" className="flex items-center gap-1 text-sm font-semibold text-brand">
            Explore <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <PracticeDashboardPreview />
      </motion.div>

      {/* Revision Notes — 1 column */}
      <motion.div {...inViewProps(0.1)} className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-mono text-[9px] font-bold tracking-wider text-ink-faint uppercase">Revision Notes</p>
            <h3 className="mt-0.5 font-serif text-[17px] font-medium text-ink">Theory behind every decision.</h3>
          </div>
          <Link href="/features/revision-notes"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-faint transition-colors hover:border-brand/30 hover:text-brand">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2.5 p-4">
          {REVISION_TOPICS.slice(0, 3).map((t, i) => <FlipCard key={t.title} topic={t} delay={i * 0.06} />)}
        </div>
        <div className="border-t border-hairline px-5 py-3">
          <p className="font-mono text-[10px] text-ink-faint">
            Hover any card to see the insight ·{' '}
            <Link href="/features/revision-notes" className="text-brand underline-offset-2 hover:underline">All 23 patterns + SOLID →</Link>
          </p>
        </div>
      </motion.div>

      {/* Practice Problems — 2 of 3 columns */}
      <motion.div {...inViewProps(0.06)} className="lg:col-span-2 overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <p className="font-mono text-[9px] font-bold tracking-wider text-ink-faint uppercase">Practice Problems</p>
            <h3 className="mt-0.5 font-serif text-xl font-medium text-ink">Problems from real companies. Solved by a real community.</h3>
          </div>
          <Link href="/features/interview-questions" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand">
            Browse library <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-hairline/60">
          {COMPACT_PROBLEMS.map((p, i) => (
            <motion.div key={p.title} {...inViewProps(0.04 + i * 0.04)}
              className={cn('flex items-center justify-between gap-3 px-6 py-3 transition-colors', i === 1 ? 'bg-brand-tint/60' : 'hover:bg-hairline/40')}>
              <div className="flex min-w-0 items-center gap-3">
                <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-semibold', DIFF_BADGE[p.diff])}>{p.diff}</span>
                <span className={cn('truncate text-sm font-medium', i === 1 ? 'text-brand' : 'text-ink')}>{p.title}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {p.companies.map(c => (
                  <span key={c} className="hidden rounded border border-hairline px-1.5 py-0.5 font-mono text-[8px] text-ink-faint sm:inline">{c}</span>
                ))}
                <span className="font-mono text-[10px] text-ink-faint">{p.attempts}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-6 py-3">
          <p className="text-[12px] text-ink-faint">110+ problems · Easy · Medium · Hard</p>
          <div className="flex flex-wrap gap-1">
            {['Google', 'Amazon', 'Meta', 'Stripe', 'Uber'].map(c => (
              <span key={c} className="rounded border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[8px] text-ink-muted">{c}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Plannr + Daily Quiz — 1 column */}
      <motion.div {...inViewProps(0.12)} className="flex flex-col gap-4">
        {DAILY_LABS.map(lab => (
          <Link key={lab.n} href={lab.href}
            className="group flex flex-1 flex-col rounded-xl border border-brand/25 bg-brand-tint p-5 transition-all hover:border-brand/50 hover:shadow-sm">
            <p className="mb-1.5 font-mono text-[9px] font-bold tracking-[0.2em] text-brand/60 uppercase">Daily Practice · {lab.n}</p>
            <p className="font-serif text-lg font-semibold text-ink">{lab.title}</p>
            <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{lab.brief}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lab.chips.map(c => (
                <span key={c} className="rounded-full border border-brand/20 bg-paper-elevated px-2 py-0.5 font-mono text-[9px] text-ink-muted">{c}</span>
              ))}
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Explore {lab.title} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </motion.div>

    </div>
  )
}

// ─── Comparison Table ─────────────────────────────────────────────────────────
type CompRow = { section?: string; feature: string; lld: string | true; others: string | false }
const COMPARISON_ROWS: CompRow[] = [
  // ── Core canvas
  { section: 'Canvas & Editor',
    feature: 'UML class diagram canvas',                  lld: true,           others: 'Generic / no LLD focus' },
  { feature: 'Draft Notation — plain English → UML',      lld: true,           others: false },
  { feature: 'Code execution from your class diagram',    lld: true,           others: false },
  { feature: 'Real-time collaboration & live cursors',    lld: true,           others: 'Paid plans only' },
  // ── Practice Engine
  { section: 'Practice Engine',
    feature: 'Timed Interview Mode with countdown',       lld: true,           others: false },
  { feature: 'Streak tracking & activity heatmap',        lld: true,           others: false },
  { feature: '110+ curated LLD problem library',          lld: true,           others: false },
  { feature: 'Staged hints (reveal one at a time)',       lld: true,           others: false },
  { feature: 'Community discussion per problem',          lld: true,           others: false },
  { feature: 'Revision Notes — SOLID + 23 patterns',      lld: true,           others: false },
  { feature: 'Daily Quiz — 10 pattern questions / day',   lld: true,           others: false },
  { feature: 'Plannr — structured interview roadmap',     lld: true,           others: false },
  // ── Challenge Labs
  { section: 'Challenge Labs',
    feature: 'Pattern Detective — name the pattern in real code', lld: true,   others: false },
  { feature: 'Debug Lab — annotate design violations',    lld: true,           others: false },
  { feature: 'Debug & Fix — restructure broken designs',  lld: true,           others: false },
  { feature: 'LLD Roguelike — no-undo branching scenarios', lld: true,         others: false },
  { feature: 'Refactor — clean a working monolith',       lld: true,           others: false },
  { feature: 'Change One Thing — OCP under pressure',     lld: true,           others: false },
  { feature: 'Evolution — multi-stage trade-off tracking', lld: true,          others: false },
  { feature: 'Budget Pressure — design under constraints', lld: true,          others: false },
  // ── Pricing
  { section: 'Pricing',
    feature: 'Free to start — no account needed',         lld: true,           others: 'Freemium / paid' },
]

function ComparisonTable() {
  return (
    <div>
      {/* Overflow wrapper for mobile scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0">
          <thead>
            <tr>
              {/* Feature column header */}
              <th className="w-1/2 rounded-tl-xl border border-r-0 border-hairline bg-paper px-5 py-4 text-left">
                <span className="font-mono text-[10px] font-bold tracking-widest text-ink-faint uppercase">Feature</span>
              </th>
              {/* LLDCanvas column — highlighted */}
              <th className="w-[25%] border border-r-0 border-brand/30 bg-brand-tint px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-serif text-[15px] font-semibold text-ink">LLDCanvas</span>
                  <span className="rounded-full bg-brand px-2.5 py-0.5 font-mono text-[9px] font-bold text-brand-foreground">LLD-first</span>
                </div>
              </th>
              {/* Others column */}
              <th className="w-[25%] rounded-tr-xl border border-hairline bg-paper px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-serif text-[15px] font-semibold text-ink-muted">draw.io · Lucidchart</span>
                  <span className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[9px] text-ink-faint">General diagramming</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => {
              const isLast = i === COMPARISON_ROWS.length - 1
              return (
                <React.Fragment key={row.feature}>
                  {/* Section divider row */}
                  {row.section && (
                    <tr>
                      <td colSpan={3} className="border border-r-0 border-t-0 border-hairline bg-paper px-5 py-2">
                        <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-ink-faint uppercase">{row.section}</span>
                      </td>
                      <td className="border border-t-0 border-hairline bg-paper" />
                    </tr>
                  )}
                  {/* Feature row */}
                  <tr>
                    <td className={cn(
                      'border border-r-0 border-t-0 border-hairline bg-paper px-5 py-3 text-sm text-ink',
                      isLast && 'rounded-bl-xl',
                    )}>
                      {row.feature}
                    </td>
                    <td className="border border-r-0 border-t-0 border-brand/30 bg-brand-tint px-5 py-3 text-center">
                      {row.lld === true ? (
                        <span className="inline-flex items-center justify-center">
                          <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-[12px] font-medium text-brand">{row.lld}</span>
                      )}
                    </td>
                    <td className={cn(
                      'border border-t-0 border-hairline bg-paper px-5 py-3 text-center',
                      isLast && 'rounded-br-xl',
                    )}>
                      {row.others === false ? (
                        <span className="inline-flex items-center justify-center">
                          <svg className="h-4 w-4 text-ink-faint/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-faint">{row.others}</span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <motion.p {...inViewProps(0.1)} className="mt-5 text-[12px] leading-relaxed text-ink-faint">
        draw.io and Lucidchart are excellent general-purpose diagramming tools — they&apos;re just not
        built for the specific pressure of an LLD interview round. LLDCanvas is.
      </motion.p>
    </div>
  )
}

// ─── The Problem ──────────────────────────────────────────────────────────────
// An editorial section that names the LLD preparation gap instead of jumping
// straight into feature descriptions. Pull quote on the left, three-row
// diagnostic panel on the right. No cards, no icons.
function TheProblemSection() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
      <div className="flex flex-col justify-center">
        <motion.p {...inViewProps(0)} className="mb-5 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
          <span className="text-gold">¶01</span>&nbsp;&nbsp;·&nbsp;&nbsp;What makes LLD interviews hard
        </motion.p>
        <motion.blockquote {...inViewProps(0.04)} className="font-serif text-[clamp(1.6rem,3.5vw,2.3rem)] font-medium leading-[1.18] tracking-tight text-ink">
          &ldquo;You have 45 minutes, a blank canvas, and a parking lot to design.&rdquo;
        </motion.blockquote>
        <motion.p {...inViewProps(0.08)} className="mt-6 text-[15.5px] leading-relaxed text-ink-muted">
          The LLD interview tests whether you can model a real system under real pressure —
          classes, relationships, design patterns, and SOLID principles — in one timed session,
          in front of someone grading every decision you make.
        </motion.p>
        <motion.p {...inViewProps(0.1)} className="mt-4 text-[15.5px] leading-relaxed text-ink-muted">
          Most engineers prepare extensively for DSA and system design, then walk into this
          round underprepared. LLDCanvas is purpose-built for the round they skip.
        </motion.p>
      </div>
      <motion.div {...inViewProps(0.06)} className="overflow-hidden rounded-xl border border-hairline">
        {[
          { color: 'text-red-500/80', label: 'The gap',                  text: 'Most engineers practice DSA intensively — then walk into the LLD round with no timed design practice at all.' },
          { color: 'text-gold',       label: 'What they miss',            text: 'Design pattern fluency under pressure, the habit of thinking in classes, and UML notation interviewers actually grade on.' },
          { color: 'text-brand',      label: 'What LLDCanvas provides',   text: 'A purpose-built platform — canvas, timed drills, 110+ problems, and applied challenge labs — for exactly this round.' },
        ].map((item, i) => (
          <div key={item.label} className={`px-6 py-5 ${i > 0 ? 'border-t border-hairline' : ''}`}>
            <p className={`font-mono text-[10px] font-bold tracking-wider uppercase ${item.color}`}>{item.label}</p>
            <p className="mt-2 font-serif text-[16px] font-medium leading-snug text-ink">{item.text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Platform Index ───────────────────────────────────────────────────────────
// All 17 features as an editorial three-column index: no cards, no icons.
// Structured like a professional design document's capability list.
const INDEX_CATEGORIES = [
  {
    label: 'Design Studio',
    desc: 'Draw, express, execute',
    features: [
      { n: '01', name: 'The Editor',      href: '/features/editor',          note: 'UML class diagram canvas' },
      { n: '02', name: 'Draft Notation',  href: '/features/draft-notation',  note: 'Plain English → UML' },
      { n: '03', name: 'Code Execution',  href: '/features/code-execution',  note: '12 languages, live' },
      { n: '04', name: 'Collaboration',   href: '/features/collaboration',   note: 'Live cursors + comments' },
    ],
  },
  {
    label: 'Practice Engine',
    desc: 'Drill, track, revise',
    features: [
      { n: '05', name: 'Interview Mode',    href: '/features/interview-mode',      note: 'Timed sessions + streaks' },
      { n: '06', name: 'Practice Problems', href: '/features/interview-questions', note: '110+ curated questions' },
      { n: '07', name: 'Revision Notes',    href: '/features/revision-notes',      note: '23 patterns + SOLID' },
      { n: '08', name: 'Plannr',            href: '/features/plannr',              note: 'Structured roadmap' },
      { n: '09', name: 'Daily Quiz',        href: '/features/daily-quiz',          note: '10 questions / day' },
    ],
  },
  {
    label: 'Challenge Labs',
    desc: 'Identify, fix, pressure-test',
    features: [
      { n: '10', name: 'Pattern Detective', href: '/features/pattern-detective', note: 'Name the pattern in real code' },
      { n: '11', name: 'Debug Lab',         href: '/features/debug-lab',         note: 'Annotate design violations' },
      { n: '12', name: 'Debug & Fix',       href: '/features/debug-and-fix',     note: 'Restructure broken designs' },
      { n: '13', name: 'Roguelike',         href: '/features/roguelike',         note: 'No undo, real pressure' },
      { n: '14', name: 'Refactor',          href: '/features/refactor',          note: 'Clean the monolith' },
      { n: '15', name: 'Change One Thing',  href: '/features/change-one-thing',  note: 'OCP under pressure' },
      { n: '16', name: 'Evolution',         href: '/features/evolution',         note: 'Multi-stage growth' },
      { n: '17', name: 'Budget Pressure',   href: '/features/budget-pressure',   note: 'Design under constraints' },
    ],
  },
]

function PlatformIndex() {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between border-b border-hairline pb-6">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶02</span>&nbsp;&nbsp;·&nbsp;&nbsp;Platform Index
          </p>
          <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">The complete toolkit.</h2>
        </div>
        <span className="hidden font-serif text-[5rem] font-bold leading-none text-ink-faint/15 sm:block" aria-hidden>17</span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {INDEX_CATEGORIES.map((cat, ci) => (
          <motion.div key={cat.label} {...inViewProps(ci * 0.08)} className="py-8 sm:px-8 sm:py-0 first:sm:pl-0 last:sm:pr-0">
            <div className="mb-5 border-b border-hairline pb-4">
              <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-brand uppercase">{cat.label}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-muted">{cat.desc}</p>
            </div>
            <div>
              {cat.features.map(f => (
                <Link key={f.n} href={f.href}
                  className="group flex items-baseline justify-between border-b border-hairline/40 py-2.5 transition-all last:border-0 hover:pl-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[9px] text-ink-faint/50">{f.n}</span>
                    <span className="font-serif text-[14.5px] font-medium text-ink transition-colors group-hover:text-brand">{f.name}</span>
                  </div>
                  <ArrowUpRight className="h-3 w-3 flex-shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div {...inViewProps(0.2)} className="mt-8 flex items-center justify-between border-t border-hairline pt-6">
        <p className="text-sm text-ink-muted">Every feature links to a dedicated page with full context and examples.</p>
        <Link href="/features" className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-brand">
          Feature hub <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function LandingPageClient() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen text-ink">
      <CanvasBackdrop />
      <SiteNavbar />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* HERO — split layout: headline + stat bar + CTAs / product snapshot */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative border-b border-hairline bg-paper">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pt-5 pb-14 sm:px-10 lg:grid-cols-[1fr_420px] lg:pt-8 lg:pb-16 xl:grid-cols-[1fr_460px]">

          {/* Left — headline, stats, CTAs */}
          <div>
            <motion.p {...fadeUpProps(0)} className="mb-6 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
              <span className="text-gold">★</span>&nbsp;&nbsp;LLD Interview Preparation Platform &nbsp;·&nbsp; Free
            </motion.p>
            <motion.h1 {...fadeUpProps(0.06)}
              className="mb-7 font-serif text-[clamp(2.5rem,5.5vw,4.8rem)] font-medium leading-[1.04] tracking-tight text-ink">
              Low-Level Design<br />
              practice that matches<br />
              <span className="text-brand">real interviews.</span>
            </motion.h1>
            <motion.p {...fadeUpProps(0.12)} className="mb-10 max-w-md text-[17px] leading-relaxed text-ink-muted">
              A free Low-Level Design interview prep platform — UML class diagram canvas,
              timed Interview Mode, 110+ curated LLD problems, design pattern training,
              and applied challenge labs built around the exact conditions of the LLD round.
            </motion.p>

            {/* Inline stat bar */}
            <motion.div {...fadeUpProps(0.16)}
              className="mb-10 grid grid-cols-4 divide-x divide-hairline overflow-hidden rounded-lg border border-hairline bg-paper-elevated">
              {[
                { n: '17',   label: 'Features' },
                { n: '110+', label: 'Problems' },
                { n: '23',   label: 'Patterns' },
                { n: '10',   label: 'Quiz / day' },
              ].map(s => (
                <div key={s.label} className="px-4 py-3 text-center">
                  <p className="font-serif text-2xl font-medium text-ink">{s.n}</p>
                  <p className="font-mono text-[9px] text-ink-muted">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div {...fadeUpProps(0.2)} className="flex flex-wrap items-center gap-3">
              <Link href="/editor/local"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-sm transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
                Start for free
              </Link>
              {!session?.user && (
                <Link href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-6 py-3 font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]">
                  Sign in
                </Link>
              )}
              <Link href="/features"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-brand">
                See all 17 features <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
            <motion.p {...fadeUpProps(0.24)} className="mt-4 font-mono text-xs text-ink-faint">
              no account needed to try it
            </motion.p>
          </div>

          {/* Right — product snapshot (desktop only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="hidden lg:block"
          >
            <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-paper-elevated shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-3 border-b border-hairline bg-paper px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <span className="mx-auto font-mono text-[10px] text-ink-faint">LLDCanvas · Interview Mode</span>
              </div>
              {/* Live countdown session */}
              <LiveSessionRow />
              {/* UML diagram */}
              <div className="p-5">
                <HeroDiagram />
              </div>
              {/* Session stats footer */}
              <div className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline">
                {[['42', 'Sessions'], ['12d', 'Streak'], ['18h', 'Practiced']].map(([n, l]) => (
                  <div key={l} className="py-3 text-center">
                    <p className="font-mono text-sm font-semibold text-brand">{n}</p>
                    <p className="font-mono text-[9px] text-ink-faint">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* THE PROBLEM — editorial pull quote + diagnostic panel             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <TheProblemSection />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PLATFORM INDEX — all 17 features as an editorial table            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <PlatformIndex />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* DESIGN STUDIO — tabbed: Canvas · Draft Notation · Code · Collab  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="design-studio" className="scroll-mt-20 border-b border-hairline bg-paper-elevated px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.p {...inViewProps(0)} className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶03</span>&nbsp;&nbsp;·&nbsp;&nbsp;Design Studio&nbsp;&nbsp;·&nbsp;&nbsp;
            <Link href="/features/editor" className="underline underline-offset-2 transition-colors hover:text-brand">Editor</Link>
            {' · '}
            <Link href="/features/draft-notation" className="underline underline-offset-2 transition-colors hover:text-brand">Draft Notation</Link>
            {' · '}
            <Link href="/features/code-execution" className="underline underline-offset-2 transition-colors hover:text-brand">Code Execution</Link>
            {' · '}
            <Link href="/features/collaboration" className="underline underline-offset-2 transition-colors hover:text-brand">Collaboration</Link>
          </motion.p>
          <motion.h2 {...inViewProps(0.04)} className="mb-12 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Draw, describe, run, and collaborate.
          </motion.h2>
          <DesignStudioSection />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PRACTICE ENGINE — bento: Interview Mode · Problems · Notes · More */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="practice-engine" className="scroll-mt-20 border-b border-hairline bg-paper px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.p {...inViewProps(0)} className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶04</span>&nbsp;&nbsp;·&nbsp;&nbsp;Practice Engine&nbsp;&nbsp;·&nbsp;&nbsp;
            <Link href="/features/interview-mode" className="underline underline-offset-2 transition-colors hover:text-brand">Interview Mode</Link>
            {' · '}
            <Link href="/features/interview-questions" className="underline underline-offset-2 transition-colors hover:text-brand">Practice Problems</Link>
            {' · '}
            <Link href="/features/revision-notes" className="underline underline-offset-2 transition-colors hover:text-brand">Revision Notes</Link>
            {' · '}
            <Link href="/features/plannr" className="underline underline-offset-2 transition-colors hover:text-brand">Plannr</Link>
            {' · '}
            <Link href="/features/daily-quiz" className="underline underline-offset-2 transition-colors hover:text-brand">Daily Quiz</Link>
          </motion.p>
          <motion.h2 {...inViewProps(0.04)} className="mb-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            The drills, the problems, the knowledge — in one system.
          </motion.h2>
          <motion.p {...inViewProps(0.06)} className="mb-12 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Five features built around one goal: walk into an LLD interview having practiced every
            dimension of it — under pressure, against real problems, with the patterns committed to memory.
          </motion.p>
          <PracticeEngineSection />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CHALLENGE LABS — 10 applied modes                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="challenge-labs" className="scroll-mt-20 border-b border-hairline bg-paper-elevated px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.p {...inViewProps()} className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶05</span>&nbsp;&nbsp;·&nbsp;&nbsp;Challenge Labs
          </motion.p>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Ten challenge modes. Each one exposing a different gap.
          </h2>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-ink-muted">
            Beyond the canvas and the problem library: ten applied modes built around the kinds
            of pressure you face in real LLD interviews. No blank canvas. No hand-holding.
          </p>
          <ChallengeLabs />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* COMPARISON — LLDCanvas vs. general diagramming tools            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.p {...inViewProps(0)} className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶06</span>&nbsp;&nbsp;·&nbsp;&nbsp;Why LLDCanvas
          </motion.p>
          <motion.h2 {...inViewProps(0.04)} className="mb-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Built for LLD interviews, not generic diagramming.
          </motion.h2>
          <motion.p {...inViewProps(0.06)} className="mb-10 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            draw.io and Lucidchart let you draw boxes and arrows. LLDCanvas is a complete
            preparation platform built around the exact conditions of the LLD round.
          </motion.p>
          <motion.div {...inViewProps(0.08)}>
            <ComparisonTable />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* WHO IS IT FOR — conference lanyard badges                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-hairline bg-paper px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.p {...inViewProps()} className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶07</span>&nbsp;&nbsp;·&nbsp;&nbsp;Who is LLDCanvas for
          </motion.p>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            From first-time learner to senior engineer.
          </h2>
          <p className="mb-12 max-w-xl text-sm leading-relaxed text-ink-muted">
            Every feature is designed around a real need — whether you are preparing for your
            first LLD interview or rehearsing before a senior round.
          </p>
          <WhoIsItFor />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS — must remain exactly as-is                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FAQ                                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="scroll-mt-20 border-b border-hairline bg-paper-elevated px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.p {...inViewProps()} className="mb-3 font-mono text-[10px] font-bold tracking-[0.25em] text-ink-faint uppercase">
            <span className="text-gold">¶08</span>&nbsp;&nbsp;·&nbsp;&nbsp;FAQ
          </motion.p>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Everything worth knowing before you start.
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-ink-muted">
            Common questions about Low-Level Design interviews, design patterns, and how LLDCanvas works.
          </p>
          <Faq />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CTA — full-width brand green, strong contrast                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand px-6 py-24 sm:px-10 sm:py-28">
        <motion.div {...inViewProps()} className="mx-auto max-w-2xl text-center">
          <p className="mb-4 font-mono text-[10px] font-bold tracking-[0.25em] text-brand-foreground/50 uppercase">Begin</p>
          <h2 className="mb-5 font-serif text-4xl font-medium leading-tight text-brand-foreground sm:text-5xl">
            Start practicing LLD today.
          </h2>
          <p className="mb-10 text-[17px] text-brand-foreground/70">
            No account needed. Open the editor and start in under 30 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/editor/local"
              className="rounded-full bg-brand-foreground px-8 py-3.5 font-semibold text-brand shadow-sm transition-transform hover:-translate-y-0.5">
              Open the editor
            </Link>
            <Link href="/sign-up"
              className="rounded-full border border-brand-foreground/25 px-8 py-3.5 font-semibold text-brand-foreground transition-colors hover:bg-brand-foreground/10">
              Create free account
            </Link>
            <Link href="/features"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-foreground/60 transition-colors hover:text-brand-foreground">
              See all 17 features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  )
}
