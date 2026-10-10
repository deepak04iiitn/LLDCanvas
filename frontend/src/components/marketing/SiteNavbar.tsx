'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronRight, Menu, X, ArrowRight,
  LayoutTemplate, PenLine, Terminal, Users,
  Timer, ListChecks, BookOpen, Flame, CalendarDays,
  Search, Bug, Wrench, Gamepad2, RefreshCw,
  SlidersHorizontal, TrendingUp, DollarSign,
  type LucideIcon,
} from 'lucide-react'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'

// ─── Feature data ─────────────────────────────────────────────────────────────

type FeatItem = { label: string; href: string; Icon: LucideIcon; desc: string }

const STUDIO: FeatItem[] = [
  { label: 'Canvas & Editor', href: '/features/editor',          Icon: LayoutTemplate, desc: 'Full UML class diagram canvas' },
  { label: 'Draft Notation',  href: '/features/draft-notation',  Icon: PenLine,        desc: 'Plain English → UML instantly' },
  { label: 'Code Execution',  href: '/features/code-execution',  Icon: Terminal,       desc: 'Run in 12 languages, in-browser' },
  { label: 'Collaboration',   href: '/features/collaboration',   Icon: Users,          desc: 'Live cursors & pinned comments' },
]

const PRACTICE: FeatItem[] = [
  { label: 'Interview Mode', href: '/features/interview-mode',      Icon: Timer,        desc: 'Timed sessions + streak analytics' },
  { label: 'LLD Problems',   href: '/features/interview-questions', Icon: ListChecks,   desc: '110+ problems tagged by company' },
  { label: 'Revision Notes', href: '/features/revision-notes',      Icon: BookOpen,     desc: 'SOLID + 23 patterns, hover to flip' },
  { label: 'Daily Quiz',     href: '/features/daily-quiz',          Icon: Flame,        desc: '10 pattern questions every day' },
  { label: 'Plannr',         href: '/features/plannr',              Icon: CalendarDays, desc: 'Structured interview roadmap' },
]

const LABS: FeatItem[] = [
  { label: 'Pattern Detective', href: '/features/pattern-detective', Icon: Search,            desc: 'Name the pattern in real code' },
  { label: 'Debug Lab',         href: '/features/debug-lab',         Icon: Bug,               desc: 'Annotate design violations' },
  { label: 'Debug & Fix',       href: '/features/debug-and-fix',     Icon: Wrench,            desc: 'Restructure broken designs' },
  { label: 'LLD Roguelike',     href: '/features/roguelike',         Icon: Gamepad2,          desc: 'No-undo branching scenarios' },
  { label: 'Refactor',          href: '/features/refactor',          Icon: RefreshCw,         desc: 'Clean a working monolith' },
  { label: 'Change One Thing',  href: '/features/change-one-thing',  Icon: SlidersHorizontal, desc: 'OCP under real pressure' },
  { label: 'Evolution',         href: '/features/evolution',         Icon: TrendingUp,        desc: 'Multi-stage trade-off tracking' },
  { label: 'Budget Pressure',   href: '/features/budget-pressure',   Icon: DollarSign,        desc: 'Design within real constraints' },
]

const NAV_OTHERS = [
  { label: 'Blogs',      href: '/blog' },
  { label: 'Playground', href: '/playground' },
  { label: 'Pricing',    href: '/pricing' },
  { label: 'Docs',       href: '/docs' },
  { label: 'About',      href: '/about' },
]

// ─── Shared feature row ───────────────────────────────────────────────────────

function FeatRow({ f, onClose }: { f: FeatItem; onClose: () => void }) {
  return (
    <Link
      href={f.href}
      onClick={onClose}
      className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-hairline/60"
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-hairline bg-paper transition-colors group-hover:border-brand/20 group-hover:bg-brand-tint">
        <f.Icon className="h-3 w-3 text-ink-faint transition-colors group-hover:text-brand" />
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium leading-none text-ink transition-colors group-hover:text-brand">
          {f.label}
        </p>
        <p className="mt-0.5 text-[10.5px] leading-tight text-ink-faint">{f.desc}</p>
      </div>
    </Link>
  )
}

// ─── Mega menu panel ──────────────────────────────────────────────────────────

function MegaMenuPanel({
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute inset-x-0 top-full z-50 px-5 pt-1.5 pb-3 sm:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-hairline bg-paper shadow-[0_24px_64px_-12px_rgba(32,31,28,0.22)]">

        {/* ── Row 1: Design Studio + Practice Engine ─────────────────────── */}
        <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-x sm:divide-y-0">

          {/* Design Studio */}
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-brand uppercase">
                Design Studio
              </span>
              <span className="font-mono text-[9px] text-ink-faint">Draw · run · collaborate</span>
            </div>
            <div className="space-y-0">
              {STUDIO.map(f => <FeatRow key={f.href} f={f} onClose={onClose} />)}
            </div>
          </div>

          {/* Practice Engine */}
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-gold-tint px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-gold uppercase">
                Practice Engine
              </span>
              <span className="font-mono text-[9px] text-ink-faint">Drill · track · revise</span>
            </div>
            <div className="space-y-0">
              {PRACTICE.map(f => <FeatRow key={f.href} f={f} onClose={onClose} />)}
            </div>
          </div>
        </div>

        {/* ── Row 2: Challenge Labs — full width 4-col grid ──────────────── */}
        <div className="border-t border-hairline bg-paper-elevated/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-red-50 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-red-500 uppercase">
              Challenge Labs
            </span>
            <span className="font-mono text-[9px] text-ink-faint">
              8 applied modes · identify · fix · pressure-test
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-1 sm:grid-cols-4">
            {LABS.map(f => <FeatRow key={f.href} f={f} onClose={onClose} />)}
          </div>
        </div>

        {/* ── Footer bar ─────────────────────────────────────────────────── */}
        <div className="border-t border-hairline bg-paper px-5 py-2.5">
          <Link
            href="/features"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand/80"
          >
            <ArrowRight className="h-3.5 w-3.5" /> See all features
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

function MobileMenu({
  open, onClose, session,
}: {
  open: boolean
  onClose: () => void
  session: boolean
}) {
  const [featOpen, setFeatOpen] = useState(false)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col bg-paper shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <Link href="/" onClick={onClose}><Wordmark height={36} priority /></Link>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-2">

              {/* Features accordion */}
              <button
                onClick={() => setFeatOpen(v => !v)}
                className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Features
                <ChevronDown className={cn('h-4 w-4 text-ink-faint transition-transform duration-200', featOpen && 'rotate-180')} />
              </button>

              <AnimatePresence initial={false}>
                {featOpen && (
                  <motion.div
                    key="feat-mobile"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    {/* Design Studio */}
                    <div className="px-5 pb-2 pt-1">
                      <p className="mb-1.5 font-mono text-[9px] font-bold tracking-widest text-brand uppercase">
                        Design Studio
                      </p>
                      {STUDIO.map(f => (
                        <Link key={f.href} href={f.href} onClick={onClose}
                          className="flex items-center gap-2.5 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink">
                          <f.Icon size={12} className="shrink-0 text-ink-faint" /> {f.label}
                        </Link>
                      ))}
                    </div>

                    {/* Practice Engine */}
                    <div className="border-t border-hairline/50 px-5 pb-2 pt-3">
                      <p className="mb-1.5 font-mono text-[9px] font-bold tracking-widest text-gold uppercase">
                        Practice Engine
                      </p>
                      {PRACTICE.map(f => (
                        <Link key={f.href} href={f.href} onClick={onClose}
                          className="flex items-center gap-2.5 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink">
                          <f.Icon size={12} className="shrink-0 text-ink-faint" /> {f.label}
                        </Link>
                      ))}
                    </div>

                    {/* Challenge Labs */}
                    <div className="border-t border-hairline/50 px-5 pb-2 pt-3">
                      <p className="mb-1.5 font-mono text-[9px] font-bold tracking-widest text-red-500 uppercase">
                        Challenge Labs
                      </p>
                      {LABS.map(f => (
                        <Link key={f.href} href={f.href} onClick={onClose}
                          className="flex items-center gap-2.5 py-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink">
                          <f.Icon size={12} className="shrink-0 text-ink-faint" /> {f.label}
                        </Link>
                      ))}
                    </div>

                    {/* See all */}
                    <div className="border-t border-hairline/50 px-5 pb-3 pt-3">
                      <Link href="/features" onClick={onClose}
                        className="flex items-center gap-1.5 text-sm font-semibold text-brand">
                        See all 17 features <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other links */}
              {NAV_OTHERS.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  {l.label}
                  <ChevronRight size={14} className="text-ink-faint/50" />
                </a>
              ))}
            </div>

            {/* CTA footer */}
            <div className="space-y-2 border-t border-hairline p-4">
              {session ? (
                <Link href="/dashboard" onClick={onClose}
                  className="flex w-full items-center justify-center rounded-md bg-brand py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover">
                  Dashboard
                </Link>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Link href="/sign-in" onClick={onClose}
                      className="flex w-full items-center justify-center rounded-md border border-hairline-strong py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hairline/40">
                      Sign in
                    </Link>
                    <p className="text-center text-[11px] leading-snug text-ink-muted">
                      Sign in to unlock all features
                    </p>
                  </div>
                  <Link href="/sign-up" onClick={onClose}
                    className="flex w-full items-center justify-center rounded-md bg-brand py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover">
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function SiteNavbar({ alwaysSolid = false }: { alwaysSolid?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen,   setMegaOpen]   = useState(false)
  const { data: session } = useSession()
  const scrolledPast = useScrolled()
  const scrolled = alwaysSolid || scrolledPast
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const openMega   = () => { clearTimeout(closeTimerRef.current); setMegaOpen(true) }
  const delayClose = () => { closeTimerRef.current = setTimeout(() => setMegaOpen(false), 150) }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMegaOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <>
      <nav
        className={cn(
          'relative sticky top-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-300 sm:px-8',
          scrolled
            ? 'border-b border-brand/15 bg-paper/75 shadow-[0_1px_0_rgba(35,78,63,0.06),0_12px_28px_-20px_rgba(32,31,28,0.35)] backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        {/* Logo */}
        <Link href="/" className={cn('origin-left transition-transform duration-300', scrolled && 'scale-[0.85]')}>
          <Wordmark height={58} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-7">

          {/* Features trigger */}
          <div onMouseEnter={openMega} onMouseLeave={delayClose}>
            <button
              onClick={() => setMegaOpen(v => !v)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              className={cn(
                'flex items-center gap-0.5 text-sm transition-colors duration-150',
                megaOpen ? 'text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              <span className="relative">
                Features
                {/* Superscript "New" badge */}
                <span className="badge-shine absolute -left-7 -top-3.5 overflow-hidden rounded-full bg-brand px-1.5 py-[3px] font-mono text-[7.5px] font-extrabold tracking-widest text-brand-foreground uppercase leading-none shadow-[0_0_8px_2px_rgba(35,78,63,0.45)]">
                  NEW
                </span>
              </span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', megaOpen && 'rotate-180')} />
            </button>
          </div>

          {/* Other links */}
          {NAV_OTHERS.map(l => (
            <a key={l.href} href={l.href}
              className="whitespace-nowrap text-sm text-ink-muted transition-colors duration-150 hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <Link href="/dashboard"
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
              Dashboard
            </Link>
          ) : (
            <>
              <div className="group relative">
                <Link href="/sign-in"
                  className="px-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink">
                  Sign in
                </Link>
                <span role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[11px] text-paper opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  Sign in to unlock all features
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink" aria-hidden />
                </span>
              </div>
              <Link href="/sign-up"
                className="rounded-md border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {session ? (
            <Link href="/dashboard" className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground">
              Dashboard
            </Link>
          ) : (
            <Link href="/sign-up" className="rounded-md border border-hairline-strong px-3 py-1.5 text-sm font-medium text-ink">
              Get started
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mega menu anchored to nav bottom */}
        <AnimatePresence>
          {megaOpen && (
            <MegaMenuPanel
              onClose={() => setMegaOpen(false)}
              onMouseEnter={openMega}
              onMouseLeave={delayClose}
            />
          )}
        </AnimatePresence>
      </nav>

      {/* Invisible backdrop — click outside to close mega menu */}
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setMegaOpen(false)}
          />
        )}
      </AnimatePresence>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        session={!!session}
      />
    </>
  )
}
