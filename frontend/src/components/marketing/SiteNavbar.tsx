'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'
import { ChevronRight, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features',   href: '/features' },
  { label: 'Playground', href: '/playground' },
  { label: 'Pricing',    href: '/pricing' },
  { label: 'Docs',       href: '/docs' },
  { label: 'FAQ',        href: '/#faq' },
]


// ─── Mobile drawer ───────────────────────────────────────────────────────────
function MobileMenu({
  open, onClose, onSignin, onSignup, session,
}: {
  open: boolean
  onClose: () => void
  onSignin: () => void
  onSignup: () => void
  session: boolean
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-paper shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <Link href="/" onClick={onClose}>
                <Wordmark height={36} priority />
              </Link>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map(l => (
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
            <div className="border-t border-hairline p-4 space-y-2">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-md bg-brand py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => { onClose(); onSignin() }}
                    className="flex w-full items-center justify-center rounded-md border border-hairline-strong py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hairline/40"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => { onClose(); onSignup() }}
                    className="flex w-full items-center justify-center rounded-md bg-brand py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
                  >
                    Get started free
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Site-wide nav ────────────────────────────────────────────────────────────
export function SiteNavbar({ alwaysSolid = false }: { alwaysSolid?: boolean }) {
  const [authOpen, setAuthOpen]   = useState(false)
  const [authMode, setAuthMode]   = useState<'signin' | 'signup'>('signin')
  const [mobileOpen, setMobileOpen] = useState(false)
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

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <Link href="/dashboard" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-all duration-150 hover:bg-brand-hover active:scale-[0.97]">
              Dashboard
            </Link>
          ) : (
            <>
              <button onClick={openSignin} className="px-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink">
                Sign in
              </button>
              <button onClick={openSignup} className="rounded-md border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-all duration-150 hover:bg-hairline/40 active:scale-[0.97]">
                Get started
              </button>
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
            <button onClick={openSignup} className="rounded-md border border-hairline-strong px-3 py-1.5 text-sm font-medium text-ink">
              Get started
            </button>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSignin={openSignin}
        onSignup={openSignup}
        session={!!session}
      />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </>
  )
}
