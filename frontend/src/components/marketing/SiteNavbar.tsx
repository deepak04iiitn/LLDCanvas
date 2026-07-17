'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth-client'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'

const QUICK_LINKS = [
  { label: 'Features',       href: '/#features' },
  { label: 'Interview Mode', href: '/#interview-mode' },
  { label: 'Patterns',       href: '/#patterns' },
  { label: 'Docs',           href: '/docs' },
  { label: 'FAQ',            href: '/#faq' },
]

// ─── Site-wide nav ──────────────────────────────────────────────────────────────
// Shared across the landing page and any standalone page (docs, etc.) so the
// whole marketing surface reads as one product, not a patchwork of pages.
// Self-contained: owns its own auth-modal state, so it drops in with no wiring.
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

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </>
  )
}
