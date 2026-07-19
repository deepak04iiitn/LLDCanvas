'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
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
import { AuthModal } from '@/components/auth/AuthModal'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection'
import { Eyebrow } from '@/components/marketing/Eyebrow'
import { DiagramStage, DiagramNode, DiagramBox, type DiagramEdge } from '@/components/marketing/ConnectedDiagram'
import { EASE, fadeUpProps, inViewProps } from '@/lib/motion'
import { cn } from '@/lib/utils'

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

// ─── Platform spine rail — the "not just a UML drawer" section ────────────────
// A feature-grid of icon cards is the obvious move (and a UML box diagram is
// the obvious move for THIS brand specifically). Instead: seven vertical
// "spines" — like books on a shelf, or files in a drawer — collapsed to a
// rotated mono label by default. Click one and it expands to take most of the
// rail's width while the rest compress, revealing its content. Nothing else
// on the page moves this way; it reads as an actual shelf you're browsing,
// not a row of cards you're scanning.
interface PillarSpine {
  index: string
  title: string
  detail: string
  points: string[]
  chips: string[]
  href: string
  cta: string
}

const PILLAR_SPINES: PillarSpine[] = [
  {
    index: '01', title: 'Visual Editor',
    detail: '5 node types, 7 relationship types, 3 canvas themes — keyboard-first, drag-to-connect.',
    points: [
      'Every relationship carries real UML semantics — a filled diamond always means composition, not just a line.',
      'Undo/redo, alignment guides, and PNG, SVG, PlantUML, and Mermaid export, all reachable from the keyboard.',
    ],
    chips: ['Class', 'Interface', 'Enum', 'Abstract Class', 'Note', 'Inheritance', 'Composition', 'Aggregation'],
    href: '/editor/local', cta: 'Open the editor',
  },
  {
    index: '02', title: 'Design Patterns',
    detail: '23 Gang-of-Four patterns and 13 class-role stereotypes, pre-wired and correctly connected.',
    points: [
      'Every pattern ships with the correct handle sides pre-computed — no arrows crossing through boxes.',
      'Insert any of the 23 with a single Ctrl+K search instead of digging through a sidebar.',
    ],
    chips: ['Singleton', 'Factory Method', 'Observer', 'Strategy', 'Decorator', 'Adapter', '+17 more'],
    href: '/editor/local', cta: 'Browse patterns',
  },
  {
    index: '03', title: 'Draft Notation',
    detail: 'Plain-English sentences in, a live UML diagram out — instantly, as you type.',
    points: [
      'Round-trips both ways — export any diagram back to Draft Notation text and re-import it later.',
      'The same parser powers the standalone Playground and the one-shot importer inside the editor.',
    ],
    chips: ['knows', 'can', 'has many', 'owns', 'is a', 'acts as', 'uses'],
    href: '/playground', cta: 'Open the Playground',
  },
  {
    index: '04', title: 'Interview Mode',
    detail: 'Design against a real countdown. Every session becomes a streak, a heatmap, a graph.',
    points: [
      'Pick 30, 45, 60, 90 minutes, or go unlimited — pause and resume without losing the clock.',
      'Every session auto-saves a snapshot, so an unfinished attempt is never actually lost.',
    ],
    chips: ['30 min', '45 min', '60 min', 'No limit', 'Pause & resume', 'Session notes'],
    href: '/editor/local', cta: 'Start a session',
  },
  {
    index: '05', title: 'Problems + Community',
    detail: 'Curated by company and difficulty, with staged hints and real discussion threads.',
    points: [
      'Three hints unlock one at a time, so you\'re never spoiled all at once.',
      'See how other engineers structured the same design before you settle on your own.',
    ],
    chips: ['Amazon', 'Uber', 'Stripe', 'Meta', 'Easy', 'Medium', 'Hard'],
    href: '/dashboard/problems', cta: 'Browse problems',
  },
  {
    index: '06', title: 'Revision Notes',
    detail: 'Bite-sized theory — bookmarked, tracked, ready for a five-minute refresher.',
    points: [
      'Each note tracks its own bookmarked and revised state per user, so your list stays accurate.',
      'Organized by category and difficulty — basic, intermediate, advanced — so revision is never random.',
    ],
    chips: ['SOLID Principles', 'Composition vs. Inheritance', 'CAP Theorem', 'Idempotency', 'Thread-Safety'],
    href: '/dashboard/revision', cta: 'Read notes',
  },
  {
    index: '07', title: 'Code Execution',
    detail: 'Turn the class you just drew into real, runnable code — 11 languages, no separate IDE.',
    points: [
      'The exact same sandbox that powers the standalone Playground\'s Run button.',
      'Rate-limited and abuse-protected server-side, so it stays fast and free for everyone.',
    ],
    chips: ['Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', '+5 more'],
    href: '/playground', cta: 'Run some code',
  },
  {
    index: '08', title: 'Live Collaboration',
    detail: 'Invite teammates into the same diagram in real time, and leave threaded comments right on the canvas.',
    points: [
      'See collaborators\' cursors and edits live — no refresh, no manual merging.',
      'Comments stay pinned to the exact node they\'re about, tagged with @mentions, not lost in a separate doc.',
    ],
    chips: ['Real-time cursors', 'Threaded comments', '@mentions', 'Invite by email'],
    href: '/dashboard/collaborations', cta: 'View collaborations',
  },
]

function PillarSpineRail() {
  const [active, setActive] = useState(0)

  return (
    <>
      {/* Desktop / tablet — horizontal expanding spines */}
      <div className="hidden h-[440px] gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:flex">
        {PILLAR_SPINES.map((p, i) => {
          const isActive = i === active
          return (
            <div
              key={p.title}
              role="button"
              tabIndex={0}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i) } }}
              style={{ flexBasis: 0 }}
              className={cn(
                'group relative cursor-pointer overflow-hidden transition-[flex-grow] duration-500 ease-out',
                isActive ? 'flex-[7] bg-brand-tint/50' : 'flex-1 bg-paper-elevated hover:bg-hairline/40',
              )}
            >
              {/* Collapsed spine label */}
              <div className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                isActive ? 'pointer-events-none opacity-0' : 'opacity-100',
              )}>
                <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[11px] font-medium tracking-widest text-ink-muted [writing-mode:vertical-rl] rotate-180">
                  <span className="text-gold">{p.index}</span>
                  {p.title}
                </span>
              </div>

              {/* Expanded content */}
              <div className={cn(
                'absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300',
                isActive ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0',
              )}>
                <div>
                  <p className="mb-2 font-mono text-[10px] font-medium tracking-widest text-gold">{p.index}</p>
                  <h3 className="mb-3 font-serif text-xl font-medium whitespace-nowrap text-ink">{p.title}</h3>
                  <p className="mb-4 max-w-sm text-sm leading-relaxed text-ink-muted">{p.detail}</p>
                  <div className="mb-5 max-w-sm space-y-2">
                    {p.points.map(pt => (
                      <div key={pt} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                        <p className="text-[13px] leading-relaxed text-ink-muted">{pt}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex max-w-md flex-wrap gap-1.5">
                    {p.chips.map(c => (
                      <span key={c} className="rounded-full border border-hairline-strong bg-paper px-2.5 py-1 font-mono text-[11px] text-ink-muted">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={p.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  {p.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile — vertical accordion */}
      <div className="space-y-2 sm:hidden">
        {PILLAR_SPINES.map((p, i) => {
          const isActive = i === active
          return (
            <div key={p.title} className="overflow-hidden rounded-md border border-hairline">
              <button
                onClick={() => setActive(isActive ? -1 : i)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gold">{p.index}</span>
                  <span className="font-medium text-ink">{p.title}</span>
                </span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200', isActive && 'rotate-180')} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-ink-muted">{p.detail}</p>
                  <div className="mb-4 space-y-2">
                    {p.points.map(pt => (
                      <div key={pt} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                        <p className="text-[13px] leading-relaxed text-ink-muted">{pt}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {p.chips.map(c => (
                      <span key={c} className="rounded-full border border-hairline-strong bg-paper px-2.5 py-1 font-mono text-[11px] text-ink-muted">
                        {c}
                      </span>
                    ))}
                  </div>
                  <Link href={p.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    {p.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </>
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
  { n: '13', label: 'Class roles' },
  { n: '7',  label: 'Relationship types' },
  { n: '11', label: 'Runnable languages' },
  { n: '5',  label: 'Export formats' },
  { n: '3',  label: 'Canvas themes' },
]
function SpecStrip() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-md border border-hairline p-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-hairline sm:p-0 lg:grid-cols-6">
      {SPECS.map((s, i) => (
        <motion.div key={s.label} {...inViewProps(i * 0.05)} className="sm:px-5 sm:py-6">
          <p className="font-mono text-3xl font-medium text-brand">{s.n}</p>
          <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Who it's for — conference ID badges on a lanyard ─────────────────────────
// Three cards in a row is the single most reused shape on the internet. Since
// this section is literally about identity ("who are you"), it's shown as
// what identity actually looks like at a professional event — a badge on a
// lanyard clip, tilted like it's hanging, straightening up on hover like it's
// being picked up and read. Nothing else on the page uses this motif.
const PERSONAS = [
  {
    n: '01',
    kicker: 'LLD & system design interviews',
    title: 'Interview candidates',
    desc: 'Timed practice with real analytics, a problems library tagged by company, staged hints when you\'re stuck, and community discussion once you\'ve submitted — the same pressure you\'ll feel in the actual room.',
    tilt: '-rotate-3',
  },
  {
    n: '02',
    kicker: 'Design docs & pairing',
    title: 'Engineering teams',
    desc: 'Invite a teammate into the same diagram in real time, leave threaded @mention comments pinned to the exact node, and export straight into your design doc — PNG, SVG, PlantUML, or Mermaid.',
    tilt: 'rotate-2',
  },
  {
    n: '03',
    kicker: 'OOP, patterns & fundamentals',
    title: 'Self-taught engineers',
    desc: 'All 23 design patterns pre-wired, bite-sized revision notes for the fundamentals, Draft Notation to describe a design in plain English, and a sandbox to actually run what you built — no CS degree required.',
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
      {/* Lanyard clip */}
      <div className="h-4 w-5 rounded-t-md border border-b-0 border-hairline-strong bg-paper-elevated" />
      <div className="-mt-px h-3 w-px bg-hairline-strong" />

      {/* The badge itself */}
      <div className="relative w-72 overflow-hidden rounded-lg border border-hairline-strong bg-paper-elevated shadow-md transition-shadow duration-300 group-hover:shadow-xl">
        {/* Punch hole */}
        <div className="absolute top-3 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-hairline-strong bg-paper" />

        <div className="border-b border-dashed border-hairline px-5 pt-8 pb-4 text-center">
          <p className="mb-3 font-mono text-[9px] font-semibold tracking-[0.2em] text-ink-faint uppercase">
            LLDCanvas &middot; Attendee
          </p>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint font-mono text-lg font-bold text-brand">
            {p.n}
          </div>
          <p className="mb-1 font-mono text-[10px] tracking-widest text-gold uppercase">{p.kicker}</p>
          <h3 className="font-serif text-lg font-medium text-ink">{p.title}</h3>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs leading-relaxed text-ink-muted">{p.desc}</p>
        </div>

        {/* Barcode flourish */}
        <div className="flex items-end justify-center gap-[2px] border-t border-hairline bg-paper px-5 py-3">
          {Array.from({ length: 26 }).map((_, bi) => (
            <div
              key={bi}
              className="bg-ink-faint/35"
              style={{ width: bi % 3 === 0 ? 2 : 1, height: 8 + ((bi * 7) % 4) * 3 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function WhoIsItFor() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-10">
      {PERSONAS.map((p, i) => (
        <PersonaBadge key={p.n} p={p} delay={i * 0.08} />
      ))}
    </div>
  )
}

// ─── Draft Notation — code ↔ diagram ──────────────────────────────────────────
const DRAFT_SNIPPET = `User
User knows id, name: String, email: String
User can login(), getProfile(): Profile

Post
Post knows id, content: String

User has many Post`

// A copy-left/visual-right split is the same composition Interview Mode, Code
// Execution, and Collaboration all already use. Draft Notation is fundamentally
// a transformation — text becoming a diagram — and transformations read as a
// SEQUENCE, not a side-by-side comparison. So this is one tall vertical
// artifact, styled like a perforated ticket stub: code typed in at the top,
// torn along a dashed seam, diagram output at the bottom. The copy sits
// centered above it, not boxed into a column beside it.
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
      if (i >= DRAFT_SNIPPET.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 20)
  }

  return (
    <motion.div
      {...inViewProps(0.1)}
      onViewportEnter={start}
      viewport={{ once: true, margin: '-80px' }}
      className="w-full"
    >
      {/* Code half */}
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

      {/* Perforated tear-seam */}
      <div className="relative border-t-2 border-dashed border-hairline-strong">
        <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
        <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
        <span
          className={cn(
            'absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap',
            'rounded-full border border-hairline-strong bg-paper px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-brand',
            'transition-opacity duration-300', done ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Zap className="h-3 w-3" /> renders instantly
        </span>
      </div>

      {/* Diagram half */}
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
  'Round-trips both ways — export any diagram back to Draft Notation text whenever you need words instead of boxes.',
  'The exact same parser powers the standalone Playground and the one-shot Draft importer inside the editor.',
  'Describe a design out loud in an interview the way you\'d actually say it, then watch it become the artifact you submit.',
]

function DraftNotationSection() {
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <motion.p {...inViewProps(0)} className="mb-5 max-w-md text-base leading-relaxed text-ink-muted">
          No angle brackets, no drag-and-drop required. Write a sentence like{' '}
          <code className="rounded bg-hairline px-1 py-0.5 font-mono text-[13px] text-brand">User has many Post</code>{' '}
          and the relationship, the arrow, and the multiplicity all render themselves — instantly, live,
          as you type.
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
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
          >
            Open the Playground <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-5 py-2.5 text-sm font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]"
          >
            Read the syntax guide
          </Link>
        </motion.div>
      </div>

      <TypewriterDraftBlock />
    </div>
  )
}

// ─── Differentiators — a real comparison table, not icon cards ──────────────
const COMPARISON_ROWS = [
  'UML relationship semantics — enforced, not hand-drawn',
  'Real class, interface, and enum node types',
  '23 design pattern skeletons, pre-wired',
  'Plain-English code ↔ diagram (Draft Notation)',
  'Timed practice with streaks & activity analytics',
  'Curated LLD problems, hints & community discussion',
  'Run real code in 11 languages, in the same canvas',
  'Real-time collaboration with live cursors & @mention comments',
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

// ─── Interview Mode ───────────────────────────────────────────────────────────
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

const HEATMAP_LEVELS = Array.from({ length: 98 }, (_, i) => {
  if (i >= 86) return (i % 3 === 0) ? 3 : 4
  const cycle = i % 9
  if (cycle === 0 || cycle === 4) return 0
  return 1 + (i % 3)
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

const DEMO_QUESTIONS = [
  'Design a Parking Lot',
  'Design a Rate Limiter',
  'Design an Elevator System',
  'Design a Notification Service',
]
const DEMO_DURATION = 40

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

// ─── Problems + Community ──────────────────────────────────────────────────────
// The obvious move is a "problem card" next to a "discussion card". Instead:
// a physical deck of problem tickets, fanned like real cards on a desk (the
// library is deep, not a single example), with the community's response
// pinned to the front one like a sticky note — because that's the actual
// ─── Problems Section — Bento Grid Redesign ──────────────────────────────────
// Four distinct panels arranged in an asymmetric 3-column bento grid, each
// telling a different part of the story: problem list, difficulty breakdown,
// staged hints, and community discussion. No stacked cards, no left/right split.

const BENTO_PROBLEMS = [
  { title: 'Design a Rate Limiter',    diff: 'Hard',   companies: ['Stripe', 'Cloudflare'], attempts: 234, active: false },
  { title: 'Design a Parking Lot',     diff: 'Medium', companies: ['Amazon', 'Uber'],        attempts: 189, active: true  },
  { title: 'Design Notification Hub',  diff: 'Easy',   companies: ['Meta'],                  attempts: 312, active: false },
]

const DIFF_BADGE: Record<string, string> = {
  Easy:   'bg-brand-tint text-brand',
  Medium: 'bg-gold-tint text-gold',
  Hard:   'bg-red-50 text-red-600',
}

function ProblemsCommunitySection() {
  return (
    <div className="space-y-3">
      {/* ── Bento grid ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {/* Cell 1 — Problem list (large, col-span-2) */}
        <motion.div
          {...inViewProps(0)}
          className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-hairline bg-paper-elevated p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Problem Library</p>
            <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] text-ink-faint">100+ problems</span>
          </div>
          <div className="space-y-1.5">
            {BENTO_PROBLEMS.map((p, i) => (
              <motion.div
                key={p.title}
                {...inViewProps(0.06 + i * 0.06)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all',
                  p.active
                    ? 'border border-brand/20 bg-brand-tint'
                    : 'border border-transparent hover:bg-hairline/50',
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold', DIFF_BADGE[p.diff])}>
                    {p.diff}
                  </span>
                  <span className={cn('truncate text-sm font-medium', p.active ? 'text-brand' : 'text-ink')}>
                    {p.title}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {p.companies.slice(0, 2).map(c => (
                    <span key={c} className="hidden rounded-md border border-hairline px-1.5 py-0.5 font-mono text-[8px] text-ink-faint sm:inline">
                      {c}
                    </span>
                  ))}
                  <span className="font-mono text-[10px] text-ink-faint">{p.attempts}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active problem detail strip */}
          <motion.div
            {...inViewProps(0.18)}
            className="mt-3 rounded-xl border border-brand/15 bg-paper px-4 py-3"
          >
            <p className="mb-1 font-mono text-[9px] text-brand">Currently solving</p>
            <p className="text-sm font-medium text-ink">Design a Parking Lot</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              Model the lot, levels, spots, and a fee strategy that varies by vehicle type and duration.
            </p>
          </motion.div>
        </motion.div>

        {/* Cell 2 — Difficulty distribution (small, col-span-1) */}
        <motion.div
          {...inViewProps(0.08)}
          className="rounded-2xl border border-hairline bg-paper-elevated p-5"
        >
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">By difficulty</p>
          <div className="space-y-3">
            {([['Easy', 40, 'bg-brand'], ['Medium', 35, 'bg-gold'], ['Hard', 25, 'bg-red-500']] as [string, number, string][]).map(([d, pct, bg]) => (
              <div key={d}>
                <div className="mb-1 flex justify-between">
                  <span className="font-mono text-[10px] text-ink-muted">{d}</span>
                  <span className="font-mono text-[10px] text-ink-faint">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                  <motion.div
                    className={cn('h-full rounded-full', bg)}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-hairline pt-4">
            <p className="mb-2 font-mono text-[10px] text-ink-faint">Asked by</p>
            <div className="flex flex-wrap gap-1">
              {['Google', 'Amazon', 'Meta', 'Stripe', 'Uber'].map(c => (
                <span key={c}
                  className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[8px] text-ink-muted">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cell 3 — Staged hints (small, col-span-1) */}
        <motion.div
          {...inViewProps(0.1)}
          className="rounded-2xl border border-hairline bg-paper-elevated p-5"
        >
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Staged Hints</p>
          <div className="space-y-2">
            {/* Hint 1 — locked */}
            <div className="flex items-center gap-2 rounded-lg bg-hairline/50 px-3 py-2 opacity-50">
              <Lock className="h-3 w-3 shrink-0 text-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">Hint 1 of 3</span>
            </div>
            {/* Hint 2 — revealed */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="rounded-lg border border-brand/20 bg-brand-tint px-3 py-2.5"
            >
              <p className="mb-1 font-mono text-[9px] font-semibold text-brand">Hint 2 of 3 ↓</p>
              <p className="text-[11px] leading-relaxed text-ink">
                Think about counting requests over a sliding window — not fixed intervals.
              </p>
            </motion.div>
            {/* Hint 3 — locked */}
            <div className="flex items-center gap-2 rounded-lg bg-hairline/50 px-3 py-2 opacity-50">
              <Lock className="h-3 w-3 shrink-0 text-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">Hint 3 of 3</span>
            </div>
          </div>
        </motion.div>

        {/* Cell 4 — Community discussion (large, col-span-2) */}
        <motion.div
          {...inViewProps(0.12)}
          className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-hairline bg-paper-elevated p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Community Discussion</p>
            <span className="font-mono text-[10px] text-ink-faint">127 posts</span>
          </div>
          <div className="space-y-2.5">
            {/* Post 1 */}
            <div className="rounded-xl border border-hairline bg-paper p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500 font-mono text-[8px] font-bold text-white">P</div>
                <span className="text-xs font-semibold text-ink">Priya M.</span>
                <span className="text-[10px] text-ink-faint">· 2h ago</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-ink-faint">
                  <ThumbsUp className="h-2.5 w-2.5" /> 24
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-muted">
                Used token bucket over leaky bucket — way simpler to handle burst allowance.
                Shared my full canvas diagram in the thread ↗
              </p>
            </div>
            {/* Post 2 */}
            <div className="rounded-xl border border-hairline bg-paper p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 font-mono text-[8px] font-bold text-white">A</div>
                <span className="text-xs font-semibold text-ink">Alex R.</span>
                <span className="text-[10px] text-ink-faint">· 5h ago</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-ink-faint">
                  <ThumbsUp className="h-2.5 w-2.5" /> 18
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-muted">
                <span className="font-medium text-brand">@Priya</span>{' '}
                How did you handle distributed counting across nodes? Redis sorted sets?
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div {...inViewProps(0.2)} className="pt-2">
        <Link
          href="/dashboard/problems"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
        >
          Browse the library <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  )
}

// ─── Revision Notes ────────────────────────────────────────────────────────────
// Revision notes ARE flashcards, conceptually — so show them as real ones.
// A grid of "difficulty + title" cards says nothing you couldn't already
// guess; a card that physically flips to reveal the actual insight on the
// back demonstrates the bite-sized-theory pitch instead of describing it.
const DIFF_CARD_STYLE: Record<string, { badge: string; border: string; bg: string; icon: string; backBg: string; backBorder: string }> = {
  Basic:        { badge: 'bg-brand-tint text-brand', border: 'border-brand/20', bg: 'bg-brand-tint/40', icon: 'text-brand/10', backBg: 'bg-brand-tint', backBorder: 'border-brand/25' },
  Intermediate: { badge: 'bg-gold-tint text-gold',   border: 'border-gold/25',  bg: 'bg-gold-tint/40',  icon: 'text-gold/10',  backBg: 'bg-gold-tint',  backBorder: 'border-gold/30'  },
  Advanced:     { badge: 'bg-red-50 text-red-500',   border: 'border-red-200',  bg: 'bg-red-50/50',     icon: 'text-red-400/10', backBg: 'bg-red-50',   backBorder: 'border-red-200'  },
}

const REVISION_TOPICS: { title: string; difficulty: string; revised: boolean; insight: string; Icon: LucideIcon }[] = [
  { title: 'SOLID Principles',        difficulty: 'Basic',        revised: true,  Icon: Layers,          insight: 'Five rules for classes that survive contact with new requirements — start with Single Responsibility, the other four follow from it.' },
  { title: 'Composition vs. Inheritance', difficulty: 'Basic',   revised: true,  Icon: GitBranch,       insight: 'Favor "has-a" over "is-a" when behavior needs to change at runtime — inheritance locks in a shape at compile time.' },
  { title: 'Singleton Thread-Safety', difficulty: 'Intermediate', revised: false, Icon: Lock,            insight: 'Double-checked locking exists because synchronizing the whole getInstance() call is correct but needlessly slow after the first call.' },
  { title: 'REST vs. RPC',            difficulty: 'Intermediate', revised: false, Icon: ArrowLeftRight,  insight: 'REST models resources and state transitions; RPC models actions. Pick RPC when the operation isn\'t naturally a noun.' },
  { title: 'CAP Theorem',             difficulty: 'Advanced',     revised: false, Icon: BarChart2,       insight: 'Under a network partition you choose Consistency or Availability — you never get to skip that choice, only which side you land on.' },
  { title: 'Idempotency in APIs',     difficulty: 'Advanced',     revised: false, Icon: Key,             insight: 'An idempotency key lets a client safely retry a POST after a timeout without risking a duplicate charge or write.' },
]

function FlipCard({ topic, delay }: { topic: typeof REVISION_TOPICS[number]; delay: number }) {
  const s = DIFF_CARD_STYLE[topic.difficulty]
  return (
    <motion.div {...inViewProps(delay)} className="group h-48 [perspective:1200px]">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className={cn(
          'absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border p-4 [backface-visibility:hidden]',
          s.bg, s.border,
        )}>
          {/* Decorative large icon — fills the blank space */}
          <topic.Icon className={cn('absolute right-4 top-1/2 -translate-y-1/2 h-20 w-20', s.icon)} aria-hidden />

          <div className="flex items-start justify-between">
            <span className={cn('rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold', s.badge)}>
              {topic.difficulty}
            </span>
            {topic.revised ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
            ) : (
              <Bookmark className="h-4 w-4 shrink-0 text-ink-faint" />
            )}
          </div>

          <div className="relative z-10">
            <p className="mb-1 text-sm font-semibold text-ink">{topic.title}</p>
            <p className="font-mono text-[10px] text-ink-faint">hover to revise →</p>
          </div>
        </div>

        {/* Back */}
        <div className={cn(
          'absolute inset-0 flex flex-col justify-between rounded-xl border p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]',
          s.backBg, s.backBorder,
        )}>
          <p className={cn('font-mono text-[9px] font-semibold uppercase tracking-widest', s.badge.split(' ')[1])}>
            {topic.difficulty}
          </p>
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
        {REVISION_TOPICS.map((t, i) => (
          <FlipCard key={t.title} topic={t} delay={i * 0.04} />
        ))}
      </div>
    </div>
  )
}

// ─── Code Execution — Studio Window Redesign ────────────────────────────────
// One cohesive dark "studio" window showing the full pipeline:
//   UML class diagram (design pane) → generated code (editor pane) → run output (terminal bar)
// All in one surface, nothing described that isn't shown.

const LANG_SAMPLES = [
  {
    lang: 'Python', ext: 'py', prompt: '>>>',
    code: `class FeeStrategy:
    def calculate(self, ticket):
        hours = ticket.duration_hours()
        return max(hours, 1) * 2.5

    def get_rate(self) -> float:
        return self._rate`,
    output: '7.5',
  },
  {
    lang: 'TypeScript', ext: 'ts', prompt: '$',
    code: `class FeeStrategy {
  calculate(ticket: Ticket): number {
    const hours = ticket.durationHours()
    return Math.max(hours, 1) * 2.5
  }

  getRate(): number { return this.rate }
}`,
    output: '7.5',
  },
  {
    lang: 'Java', ext: 'java', prompt: '$',
    code: `class FeeStrategy {
  double calculate(Ticket t) {
    int hours = t.durationHours();
    return Math.max(hours, 1) * 2.5;
  }

  double getRate() { return this.rate; }
}`,
    output: '7.5',
  },
  {
    lang: 'Go', ext: 'go', prompt: '$',
    code: `func (f *FeeStrategy) Calculate(
    t Ticket,
) float64 {
    h := t.DurationHours()
    return math.Max(float64(h), 1) * 2.5
}

func (f *FeeStrategy) GetRate() float64 {
    return f.rate
}`,
    output: '7.5',
  },
  {
    lang: 'Rust', ext: 'rs', prompt: '$',
    code: `impl FeeStrategy {
    pub fn calculate(&self, t: &Ticket) -> f64 {
        let hours = t.duration_hours();
        hours.max(1.0) * 2.5
    }

    pub fn get_rate(&self) -> f64 { self.rate }
}`,
    output: '7.5',
  },
  {
    lang: 'C#', ext: 'cs', prompt: '$',
    code: `class FeeStrategy {
  public double Calculate(Ticket t) {
    int hours = t.DurationHours();
    return Math.Max(hours, 1) * 2.5;
  }

  public double GetRate() => this.Rate;
}`,
    output: '7.5',
  },
]
const EXTRA_LANGS = ['Ruby', 'PHP', 'Haskell', 'C++', 'Swift', 'Kotlin', 'F#', 'Scala']

function CodeExecutionSection() {
  const [active, setActive] = useState(0)
  const [ran, setRan] = useState(false)
  const sample = LANG_SAMPLES[active]

  function pickLang(i: number) {
    setActive(i)
    setRan(false)
  }

  return (
    <motion.div {...inViewProps(0)} className="overflow-hidden rounded-2xl border border-hairline shadow-xl">

      {/* ── Window chrome / top bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/6 bg-[#0e0d0a] px-4 py-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className="font-mono text-[10px] text-white/25 select-none">FeeStrategy — LLDCanvas Studio</span>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {LANG_SAMPLES.map((s, i) => (
            <button
              key={s.lang}
              onClick={() => pickLang(i)}
              className={cn(
                'rounded-md px-2.5 py-1 font-mono text-[10px] transition-all',
                i === active ? 'bg-white/12 text-white/85' : 'text-white/30 hover:text-white/60',
              )}
            >
              {s.lang}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split: design pane + code pane ───────────────────────────────── */}
      <div className="flex min-h-[220px] divide-x divide-white/6 bg-[#0e0d0a]">

        {/* Design pane — hidden on mobile, shown lg+ */}
        <div className="hidden w-44 shrink-0 flex-col items-center justify-center gap-3 bg-[#0a0908]/60 p-5 lg:flex">
          <p className="self-start font-mono text-[9px] uppercase tracking-widest text-white/20">Design</p>
          {/* UML class box */}
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
          {/* Animated arrow pointing right */}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1 self-end font-mono text-[8px] text-white/20"
          >
            generates <ArrowRight className="h-2.5 w-2.5" />
          </motion.div>
        </div>

        {/* Code pane */}
        <div className="flex-1 overflow-hidden bg-[#14130f]">
          <AnimatePresence mode="wait">
            <motion.pre
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.75] text-white/75"
            >
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

      {/* ── Terminal bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-t border-white/6 bg-[#0a0908] px-5 py-3">
        <span className="font-mono text-[10px] text-white/20 select-none">
          {sample.prompt} run FeeStrategy.{sample.ext}
        </span>
        <AnimatePresence>
          {ran && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[11px] text-emerald-400"
            >
              → {sample.output}
            </motion.span>
          )}
        </AnimatePresence>
        <div className="flex-1" />
        <button
          onClick={() => setRan(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] font-semibold text-white transition-all duration-200',
            ran ? 'bg-emerald-700/60 cursor-default' : 'bg-emerald-600/80 hover:bg-emerald-600 active:scale-95',
          )}
        >
          <PlayCircle className="h-3 w-3" />
          {ran ? 'Ran ✓' : 'Run'}
        </button>
      </div>

      {/* ── Extra languages footer ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/6 bg-[#0e0d0a] px-5 py-2.5">
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/18 mr-1">Also</span>
        {EXTRA_LANGS.map(l => (
          <span key={l} className="rounded-md border border-white/8 px-2 py-0.5 font-mono text-[9px] text-white/28">
            {l}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Live Collaboration — Redesigned ─────────────────────────────────────────
// Concept: instead of a left/right split, the section is centred around a
// full-width "canvas window" mockup — a realistic rendering of the actual editor
// with live cursors and a pinned comment — so the feature speaks for itself.
// Feature chips sit below the window; no separate "right-side" graphic needed.

function LiveCursorTag({
  name, color, bgColor, borderColor, left, top, delay,
}: {
  name: string; color: string; bgColor: string; borderColor: string
  left: string; top: string; delay: number
}) {
  return (
    <motion.div
      className="pointer-events-none absolute z-20 select-none"
      style={{ left, top }}
      animate={{ x: [0, 7, -4, 3, 0], y: [0, -5, 3, -2, 0] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Mouse cursor shape */}
      <svg width="13" height="15" viewBox="0 0 13 15" aria-hidden className="drop-shadow-sm">
        <path d="M1 1L1 11L4 8L6.5 14L8 13.3L5.5 7.5L10.5 7.5L1 1Z" fill={color} />
      </svg>
      <div
        className="mt-[2px] whitespace-nowrap rounded-full px-1.5 py-[1px] font-mono text-[9px] font-semibold leading-none shadow-sm"
        style={{ backgroundColor: bgColor, color, border: `1px solid ${borderColor}` }}
      >
        {name}
      </div>
    </motion.div>
  )
}

// UML diagram rendered inside the canvas window.
// Row 1 bottom = y:107, Row 2 top = y:220 → 113 px gap for the comment.
// Comment is positioned as a foreignObject inside the SVG so it always
// aligns with the SVG coordinate space regardless of container width.
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
    // Height fixed to match SVG viewBox aspect — comment sits safely in the
    // 113 px gap between rows (y:107 → y:220) so it never touches a node.
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

        {/* Edges */}
        {edges.map((e, i) => (
          <motion.line key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#D1D5DB" strokeWidth={1.5} markerEnd="url(#arr)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <motion.g key={n.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.35 }}
          >
            {n.glow && (
              <rect x={n.x - 5} y={n.y - 5} width={n.w + 10} height={n.h + 10}
                rx={12} fill={n.glow} opacity={0.09} />
            )}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8}
              fill="white" stroke={n.glow ?? '#E5E7EB'} strokeWidth={n.glow ? 1.5 : 1} />
            <text x={n.x + n.w / 2} y={n.y + 21} textAnchor="middle"
              fontFamily="system-ui, sans-serif" fontSize={11} fontWeight={600} fill="#1C1917">
              {n.label}
            </text>
            <text x={n.x + n.w / 2} y={n.y + 36} textAnchor="middle"
              fontFamily="ui-monospace, monospace" fontSize={8.5} fill="#A8A29E">
              {n.sub}
            </text>
          </motion.g>
        ))}

        {/* Pinned comment — inside SVG coordinate space so it NEVER
            overlaps nodes regardless of container width.
            x:362 = right half gap  |  y:113 = just below row-1 (y:107)
            width:190  height:85    |  bottom = y:198 < row-2 top y:220  */}
        <motion.g
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.35 }}
        >
          <foreignObject x="362" y="113" width="190" height="90">
            <div
              // @ts-expect-error xmlns required for SVG foreignObject
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                background: 'white',
                border: '1px solid #ddd6fe',
                borderRadius: '12px',
                padding: '10px',
                boxShadow: '0 4px 20px rgba(124,58,237,0.13)',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 8, fontWeight: 700, fontFamily: 'monospace' }}>A</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#1c1917' }}>Alex</span>
                <span style={{ fontSize: 9, color: '#a8a29e', marginLeft: 'auto' }}>just now</span>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: '#78716c', margin: 0, marginBottom: 6 }}>
                Add a Redis cache layer here? ⚡
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#7c3aed', cursor: 'pointer' }}>Reply</span>
                <span style={{ fontSize: 9, color: '#d6d3d1' }}>·</span>
                <span style={{ fontSize: 9, color: '#a8a29e', cursor: 'pointer' }}>Resolve</span>
              </div>
            </div>
          </foreignObject>
        </motion.g>
      </svg>

      {/* Cursors — free-floating overlays, approximate node positions are fine */}
      {/* Priya: editing API Gateway (top-left node) */}
      <LiveCursorTag name="Priya" color="#0284c7" bgColor="#e0f2fe" borderColor="#7dd3fc"
        left="8%" top="17%" delay={0} />
      {/* Alex: near AuthService (top-right) — left the comment on Database below */}
      <LiveCursorTag name="Alex" color="#7c3aed" bgColor="#ede9fe" borderColor="#c4b5fd"
        left="62%" top="13%" delay={1.3} />
    </div>
  )
}

const COLLAB_FEATURES = [
  {
    Icon: MousePointer2,
    title: 'Live cursors & presence',
    desc: 'See every teammate\'s cursor in real time — no refresh, no manual sync.',
  },
  {
    Icon: MessageCircle,
    title: 'Pinned @mention comments',
    desc: 'Threads stay anchored to the exact node they\'re about, not buried in chat.',
  },
  {
    Icon: UserPlus,
    title: 'Invite by email or link',
    desc: 'Collaborators get viewer or editor roles the moment they accept.',
  },
]

function CollaborationSection() {
  return (
    <div className="space-y-8">
      {/* Feature list — inline text rows above the canvas */}
      <ul className="space-y-3">
        {COLLAB_FEATURES.map(({ Icon, title, desc }, i) => (
          <motion.li
            key={title}
            {...inViewProps(i * 0.07)}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-tint">
              <Icon className="h-3 w-3 text-brand" />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">{title} — </span>
              {desc}
            </p>
          </motion.li>
        ))}
      </ul>

      {/* CTA */}
      <motion.div {...inViewProps(0.15)} className="flex">
        <Link
          href="/dashboard/collaborations"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]"
        >
          Start collaborating <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Full-width canvas window mockup */}
      <motion.div
        {...inViewProps(0.05)}
        className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_8px_48px_rgba(0,0,0,0.07)]"
      >
        {/* Window chrome bar */}
        <div className="flex items-center gap-3 border-b border-hairline bg-paper px-4 py-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="mx-auto font-mono text-[11px] text-ink-faint">
            PaymentSystem.lld
          </span>
          {/* Presence stack + live badge */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex -space-x-1.5">
              {([['P','#0284c7'],['A','#7c3aed'],['D','#3D6A52']] as [string,string][]).map(([init, c]) => (
                <div key={init}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-white font-mono text-[8px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: c }}>
                  {init}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-mono text-[9px] font-semibold text-emerald-700">3 live</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <CollabDiagram />
      </motion.div>
    </div>
  )
}

// ─── (placeholder to satisfy the StrReplace boundary) ────────────────────────
// ─── FAQ (accordion) ─────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What is LLDCanvas?',
    a: 'LLDCanvas is an all-in-one Low-Level Design (LLD) interview-prep platform: a UML class diagram editor, a curated problems library with community discussion, timed Interview Mode with analytics, bite-sized revision notes, a plain-English code↔diagram language (Draft Notation), and a code execution sandbox — all in one place, not scattered across separate tools.',
  },
  {
    q: 'How is LLDCanvas different from draw.io or Lucidchart?',
    a: 'draw.io and Lucidchart work with generic shapes. LLDCanvas works with classes. Every node is a real UML class node — with a header, attributes section, and methods section. Relationships have semantic meaning (a filled diamond is composition, a hollow triangle is inheritance). You also get all 23 classic design pattern skeletons pre-wired, plus practice problems, timed interview drills, and runnable code — none of which exist in generic diagramming tools.',
  },
  {
    q: 'What is Draft Notation?',
    a: 'A plain-English way to write class diagrams — describe classes and relationships in sentences like "User has many Post", and the diagram renders itself live as you type. Try it in the standalone Playground, or read the full syntax guide in the Docs.',
  },
  {
    q: 'What is Interview Mode?',
    a: 'A timed practice mode: set a duration, design against a real countdown, and every session is logged automatically into a daily streak, an activity heatmap, and progress analytics — so the first time you design under real pressure isn\'t the day it counts.',
  },
  {
    q: 'Is there a problems library?',
    a: 'Yes — a curated set of LLD problems tagged by difficulty and by the companies that ask them, each with staged hints and a community discussion thread where you can compare your approach against others\' submitted solutions.',
  },
  {
    q: 'Can I run code, not just draw diagrams?',
    a: 'Yes — the editor and Playground both include a code execution panel supporting 11 languages (Python, Java, C++, Go, Rust, TypeScript, C#, Ruby, PHP, Haskell, F#), so you can turn a class into real, runnable logic without leaving the canvas.',
  },
  {
    q: 'Can I collaborate with others in real time?',
    a: 'Yes — invite teammates into the same diagram and see their cursors and edits live, no refresh or manual merging required. You can also leave threaded comments pinned to a specific node, with @mentions to bring someone into the conversation.',
  },
  {
    q: 'Do I need an account to use it?',
    a: 'No — open the local editor and start drawing immediately. No login, no install. Sign in only when you want cloud sync, Interview Mode history, the problems library, or revision notes tracking.',
  },
  {
    q: 'What happens to my local work if I sign in later?',
    a: 'It migrates automatically — your local diagram is copied to your cloud account the moment you sign in, and you are redirected to it.',
  },
  {
    q: 'Can I export my diagrams?',
    a: 'Yes. Export as PNG (for resumes, slide decks), SVG (scalable, for design docs), PlantUML text, Mermaid text (for GitHub READMEs, Notion, Confluence), or Draft Notation (plain-text, re-importable). All exports are available from the toolbar or the Ctrl+K command palette.',
  },
  {
    q: 'Is it free?',
    a: 'Yes — the entire platform is free right now: the editor, all 23 design pattern skeletons, Draft Notation, Interview Mode, the problems library, revision notes, and code execution. Signing in (free, just Google or email) only adds cloud sync and progress tracking across devices.',
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

// ─── Auto-open sign-in modal when redirected from a share link (?auth=1) ───────
function AuthRedirectListener({ onAuthRedirect }: { onAuthRedirect: () => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('auth') === '1') onAuthRedirect()
  }, [searchParams, onAuthRedirect])

  return null
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function LandingPageClient() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  function openSignin() { setAuthMode('signin'); setAuthOpen(true) }
  function openSignup() { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <div className="min-h-screen text-ink">
      <Suspense fallback={null}>
        <AuthRedirectListener onAuthRedirect={openSignin} />
      </Suspense>

      <CanvasBackdrop />

      <SiteNavbar />

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="px-5 pt-2 pb-24 sm:px-8 lg:pt-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div {...fadeUpProps(0)}>
              <Eyebrow index="01">the all-in-one lld platform</Eyebrow>
            </motion.div>

            <motion.h1
              className="mb-6 font-serif text-[2.75rem] leading-[1.08] font-medium tracking-tight text-ink sm:text-6xl"
              {...fadeUpProps(0.08)}
            >
              Everything for your
              <br />
              next LLD interview.
            </motion.h1>

            <motion.p className="mb-9 max-w-md text-lg leading-relaxed text-ink-muted" {...fadeUpProps(0.16)}>
              A UML editor that understands OOP, 23 pre-wired design patterns, timed practice
              with real analytics, curated problems with community discussion, revision notes,
              and runnable code — all in one canvas, not seven different tools.
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

      {/* ─── Platform pillars ───────────────────────────────────────────────── */}
      <section id="platform" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="02">the full picture</Eyebrow>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Eight tools. One platform. Zero context switching.
          </h2>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-ink-muted">
            Most candidates cobble together a diagramming tool, a problems site, a timer app, and
            a notes doc — solo. Here's the platform that replaces all of them, teammates included —
            eight surfaces on one shelf. Pick one to open it.
          </p>
          <PillarSpineRail />
        </div>
      </section>

      {/* ─── Feature chain ──────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="03">the editor</Eyebrow>
          <h2 className="mb-8 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Five interfaces. One canvas.
          </h2>
          <FeatureChain />
        </div>
      </section>

      {/* ─── Draft Notation ─────────────────────────────────────────────────── */}
      <section id="draft-notation" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="04">code ↔ diagram</Eyebrow>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Say it in English. See it as UML.
          </h2>
          <DraftNotationSection />
        </div>
      </section>

      {/* ─── Differentiators ────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="05">what only we have</Eyebrow>
          <h2 className="mb-10 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            See the difference, not just hear about it.
          </h2>
          <ComparisonTable />
        </div>
      </section>

      {/* ─── Interview Mode ─────────────────────────────────────────────────── */}
      <section id="interview-mode" className="scroll-mt-20 px-5 py-16 sm:px-8">
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
                <span className="text-gold">¶07</span> — practice like the real thing
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

      {/* ─── Problems + Community ───────────────────────────────────────────── */}
      <section id="problems" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="06">practice with real problems</Eyebrow>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Problems asked by real companies. Solved by a real community.
          </h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-ink-muted">
            Every problem is tagged by difficulty and the companies known to ask it.
            Staged hints reveal one at a time — never all at once.
            Compare your approach against the community thread when you're done.
          </p>
          <ProblemsCommunitySection />
        </div>
      </section>

      {/* ─── Revision Notes ─────────────────────────────────────────────────── */}
      <section id="revision" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="07">theory, in five minutes</Eyebrow>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Revision notes for exactly what you keep forgetting.
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-ink-muted">
            Bite-sized theory on SOLID, composition vs. inheritance, thread-safety, and more —
            bookmark what to revisit, and track what's actually sunk in.
          </p>
          <RevisionNotesSection />
        </div>
      </section>

      {/* ─── Code Execution ─────────────────────────────────────────────────── */}
      <section id="code-execution" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="08">from diagram to running code</Eyebrow>
          <h2 className="mb-3 max-w-lg font-serif text-2xl font-medium text-ink sm:text-3xl">
            Don't just design it. Run it.
          </h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-ink-muted">
            Sketch the class in the canvas, then execute it in 11 languages without leaving the tab.
            No copy-paste into a separate IDE — design and code live side by side.
          </p>
          <CodeExecutionSection />
        </div>
      </section>

      {/* ─── Live Collaboration ─────────────────────────────────────────────── */}
      <section id="collaboration" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Eyebrow index="09">work with others</Eyebrow>
          <h2 className="mb-2 max-w-xl font-serif text-2xl font-medium text-ink sm:text-3xl">
            You don't design in isolation. Why practice like it?
          </h2>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-ink-muted">
            Invite a teammate into your diagram and work side by side — live cursors, pinned
            comments, and real-time edits, no refresh needed.
          </p>
          <CollaborationSection />
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ─── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Eyebrow index="10">questions</Eyebrow>
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

      <SiteFooter />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </div>
  )
}
