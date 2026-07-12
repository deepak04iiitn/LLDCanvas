'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Link2, Puzzle, LayoutTemplate, Upload, Palette } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { useSession } from '@/lib/auth-client'

const EASE = 'easeOut' as const

function fadeUpProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE, delay },
  }
}

// ─── Features data ─────────────────────────────────────────────────────────────

const features = [
  {
    Icon: Zap,
    title: 'One-click UML',
    desc: 'Press C for a class, I for an interface, E for an enum. No shape-picking, no resizing, no formatting.',
  },
  {
    Icon: Link2,
    title: 'Smart Connectors',
    desc: 'Drag between two classes and pick the relationship type. Inheritance, composition, aggregation — correct arrowheads rendered instantly.',
  },
  {
    Icon: Puzzle,
    title: 'Pattern Skeletons',
    desc: 'Insert a pre-wired Strategy, Observer, or Factory pattern in one keystroke. Start from the right structure, not from a blank box.',
  },
  {
    Icon: LayoutTemplate,
    title: 'LLD Templates',
    desc: 'Start from a Parking Lot, Elevator, ATM, or 10 other well-known interview problems. The boilerplate is done. You design.',
  },
  {
    Icon: Upload,
    title: 'Export anywhere',
    desc: 'Export to PNG, SVG, or PlantUML. Paste into your notes, share in your resume, drop into any LLD resource.',
  },
  {
    Icon: Palette,
    title: 'Three themes',
    desc: 'Light, dark, and whiteboard themes. Looks sharp on any background — your diagrams, your style.',
  },
]

// ─── Animated canvas preview ───────────────────────────────────────────────────

function CanvasPreview() {
  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1A1A2E]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#13131F] border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-white/30 font-mono">LLDCanvas — Parking Lot</span>
      </div>

      {/* Canvas area */}
      <div className="relative h-72 bg-[#1A1A2E] overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Animated class boxes */}
        <motion.div
          className="absolute top-10 left-16"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        >
          <ClassBox
            name="ParkingLot"
            attrs={['- levels: List<Level>']}
            methods={['+ getAvailableSpot(): Spot']}
          />
        </motion.div>

        <motion.div
          className="absolute top-8 left-[260px]"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.4, ease: 'easeOut' }}
        >
          <ClassBox
            name="Level"
            attrs={['- spots: List<Spot>']}
            methods={['+ getFreeSpot(): Spot']}
          />
        </motion.div>

        <motion.div
          className="absolute top-8 right-14"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
        >
          <InterfaceBox name="FeeStrategy" methods={['+ calculate(t: Ticket): float']} />
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-[200px]"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.05, duration: 0.4, ease: 'easeOut' }}
        >
          <ClassBox
            name="Vehicle"
            attrs={['- licensePlate: String', '- type: VehicleType']}
            methods={[]}
          />
        </motion.div>

        {/* Animated connector lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <motion.line
            x1="196" y1="60" x2="260" y2="60"
            stroke="#6366F1" strokeWidth="1.5"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
          />
          <motion.line
            x1="380" y1="60" x2="430" y2="60"
            stroke="#6366F1" strokeWidth="1.5"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
          />
        </svg>

        {/* Keyboard shortcut hints */}
        <motion.div
          className="absolute bottom-4 right-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <kbd className="px-2 py-1 text-[10px] font-mono bg-white/10 text-white/60 rounded border border-white/10">C</kbd>
          <span className="text-[10px] text-white/40">Add class</span>
          <kbd className="px-2 py-1 text-[10px] font-mono bg-white/10 text-white/60 rounded border border-white/10">I</kbd>
          <span className="text-[10px] text-white/40">Interface</span>
        </motion.div>
      </div>
    </div>
  )
}

function ClassBox({ name, attrs, methods }: { name: string; attrs: string[]; methods: string[] }) {
  return (
    <div className="min-w-[160px] rounded-lg border border-indigo-400/40 bg-[#13131F] shadow-lg text-left overflow-hidden">
      <div className="px-3 py-2 border-b border-indigo-400/20">
        <p className="text-[11px] font-semibold text-white/90 font-mono">{name}</p>
      </div>
      {attrs.length > 0 && (
        <div className="px-3 py-1.5 border-b border-white/5">
          {attrs.map((a, i) => (
            <p key={i} className="text-[10px] text-indigo-300/80 font-mono leading-5">{a}</p>
          ))}
        </div>
      )}
      {methods.length > 0 && (
        <div className="px-3 py-1.5">
          {methods.map((m, i) => (
            <p key={i} className="text-[10px] text-emerald-300/80 font-mono leading-5">{m}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function InterfaceBox({ name, methods }: { name: string; methods: string[] }) {
  return (
    <div className="min-w-[180px] rounded-lg border border-amber-400/40 bg-[#13131F] shadow-lg text-left overflow-hidden">
      <div className="px-3 py-2 border-b border-amber-400/20">
        <p className="text-[9px] text-amber-400/70 font-mono italic">«interface»</p>
        <p className="text-[11px] font-semibold text-white/90 font-mono">{name}</p>
      </div>
      <div className="px-3 py-1.5">
        {methods.map((m, i) => (
          <p key={i} className="text-[10px] text-emerald-300/80 font-mono leading-5">{m}</p>
        ))}
      </div>
    </div>
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
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">

      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">L</span>
          </div>
          <span className="font-semibold text-white tracking-tight">LLDCanvas</span>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150 rounded-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={openSignin}
                className="text-sm text-white/70 hover:text-white transition-colors duration-150 px-3 py-2"
              >
                Sign in
              </button>
              <button
                onClick={openSignup}
                className="text-sm font-medium px-4 py-2 bg-white/10 hover:bg-white/15 active:scale-[0.97] transition-all duration-150 rounded-lg border border-white/10"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 text-center">
        <div
          className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />

        <motion.div {...fadeUpProps(0)}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Built for LLD interview prep
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          {...fadeUpProps(0.1)}
        >
          The fastest way to draw
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a78bfa 100%)',
            }}
          >
            UML for LLD interviews
          </span>
        </motion.h1>

        <motion.p
          className="text-lg text-white/55 max-w-xl mx-auto mb-10 leading-relaxed"
          {...fadeUpProps(0.2)}
        >
          Stop fighting your diagramming tool. LLDCanvas understands classes,
          interfaces, relationships, and design patterns — so you can focus on
          the actual design.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-4 flex-wrap"
          {...fadeUpProps(0.3)}
        >
          <Link
            href="/editor/local"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/25"
          >
            Start for free
            <span className="text-indigo-200 text-sm">— no account needed</span>
          </Link>
          <button
            onClick={openSignin}
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:bg-white/5 active:scale-[0.97] transition-all duration-150 rounded-xl font-medium text-white/80"
          >
            Sign in
          </button>
        </motion.div>

        {/* Preview */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.65, ease: 'easeOut' }}
        >
          <CanvasPreview />
          <p className="mt-3 text-xs text-white/25">
            Live preview — real React Flow canvas
          </p>
        </motion.div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            Designed specifically for software engineers preparing for LLD rounds —
            not a generic diagram tool with a UML skin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="p-6 rounded-2xl border border-white/6 bg-white/[0.03] hover:bg-white/[0.055] hover:border-white/10 transition-all duration-200 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <f.Icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA banner ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <motion.div
          className="max-w-2xl mx-auto p-12 rounded-3xl border border-indigo-500/20 bg-indigo-500/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Your next LLD interview starts here
          </h2>
          <p className="text-white/50 mb-8">
            Create your first diagram in under 30 seconds. No signup required to try.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/editor/local"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all duration-150 rounded-xl font-semibold shadow-lg shadow-indigo-500/20"
            >
              Open canvas
            </Link>
            <button
              onClick={openSignup}
              className="px-6 py-3 border border-white/10 hover:bg-white/5 active:scale-[0.97] transition-all duration-150 rounded-xl font-medium text-white/70"
            >
              Create free account
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-white/25">
        <p>LLDCanvas · Built for engineers, by engineers</p>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </div>
  )
}
