'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'
import {
  ChevronDown, PenLine, Code2, Clock, BookOpen,
  Bookmark, Terminal, Users,
} from 'lucide-react'

// ─── Features mega-menu items ────────────────────────────────────────────────
const FEATURE_ITEMS = [
  {
    icon: PenLine,
    label: 'The Editor',
    desc: 'UML class diagrams with smart node types',
    href: '/#features',
    iconCls: 'bg-brand-tint text-brand',
  },
  {
    icon: Code2,
    label: 'Draft Notation',
    desc: 'Write diagrams in plain text — renders instantly',
    href: '/#draft-notation',
    iconCls: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Clock,
    label: 'Interview Mode',
    desc: 'Timed mock sessions with post-session analytics',
    href: '/#interview-mode',
    iconCls: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BookOpen,
    label: 'Practice Problems',
    desc: 'Company-tagged LLD challenges with staged hints',
    href: '/#problems',
    iconCls: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Bookmark,
    label: 'Revision Notes',
    desc: 'Theory cards that flip to reveal the key insight',
    href: '/#revision',
    iconCls: 'bg-rose-50 text-rose-500',
  },
  {
    icon: Terminal,
    label: 'Code Execution',
    desc: 'Run your design in 11 languages without leaving',
    href: '/#code-execution',
    iconCls: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Users,
    label: 'Collaboration',
    desc: 'Live cursors, @mentions, and real-time canvas edits',
    href: '/#collaboration',
    iconCls: 'bg-indigo-50 text-indigo-600',
  },
] as const

function FeaturesDropdown() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function enter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function leave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1 text-sm transition-colors duration-150',
          open ? 'text-ink' : 'text-ink-muted hover:text-ink',
        )}
      >
        Features
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute left-1/2 top-full z-50 mt-2.5 w-[360px] -translate-x-1/2"
          >
            {/* Caret */}
            <div className="flex justify-center">
              <div className="h-2 w-3.5 overflow-hidden">
                <div className="mx-auto h-2.5 w-2.5 rotate-45 border border-hairline bg-paper shadow-sm" />
              </div>
            </div>

            {/* Panel */}
            <div className="overflow-hidden rounded-xl border border-hairline bg-paper shadow-[0_8px_40px_rgba(0,0,0,0.09)]">
              {/* Header */}
              <div className="border-b border-hairline px-4 py-2.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                  Platform features
                </p>
              </div>

              {/* Items */}
              <div className="p-2">
                {FEATURE_ITEMS.map(item => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150 hover:bg-hairline/60"
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      item.iconCls,
                    )}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{item.label}</p>
                      <p className="truncate text-[11px] text-ink-muted">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const OTHER_LINKS = [
  { label: 'Playground', href: '/playground' },
  { label: 'Pricing',    href: '/pricing' },
  { label: 'Docs',       href: '/docs' },
  { label: 'FAQ',        href: '/#faq' },
]

// ─── Site-wide nav ──────────────────────────────────────────────────────────────
export function SiteNavbar({ alwaysSolid = false }: { alwaysSolid?: boolean }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { data: session } = useSession()
  const scrolledPast = useScrolled()
  const scrolled = alwaysSolid || scrolledPast

  function openSignin() { setAuthMode('signin'); setAuthOpen(true) }
  function openSignup() { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-300 sm:px-8',
          scrolled
            ? 'border-b border-brand/15 bg-paper/75 shadow-[0_1px_0_rgba(35,78,63,0.06),0_12px_28px_-20px_rgba(32,31,28,0.35)] backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <Link href="/" className={cn('origin-left transition-transform duration-300', scrolled && 'scale-[0.85]')}>
          <Wordmark height={58} priority />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <FeaturesDropdown />
          {OTHER_LINKS.map(l => (
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

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </>
  )
}
