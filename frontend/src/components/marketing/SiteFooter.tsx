'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, LayoutDashboard, LogIn, Pencil, UserPlus } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth-client'

export function SiteFooter() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [mounted,  setMounted]  = useState(false)
  const { data: session } = useSession()

  // Only reveal session-dependent links after hydration to avoid SSR mismatch
  useEffect(() => { setMounted(true) }, [])

  function openSignin() { setAuthMode('signin'); setAuthOpen(true) }
  function openSignup() { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <>
      <footer className="relative overflow-hidden border-t border-hairline-strong bg-paper px-5 pb-0 pt-20 sm:px-8">

        {/* ── Grain texture overlay ─────────────────────────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* ── Radial brand glow behind giant text ───────────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-20"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, #234E3F33, transparent)' }}
        />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="relative mx-auto max-w-6xl">

          {/* Top row */}
          <div className="flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">

            {/* Brand block */}
            <div className="max-w-xs">
              <Wordmark height={36} />
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                The fastest UML class diagram editor for Low-Level Design interviews and OOP design sessions.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                ¶ v1.0
              </span>
            </div>

            {/* Nav columns */}
            <div className="flex gap-14 sm:gap-20">
              <div>
                <p className="mb-4 font-mono text-[9px] font-semibold tracking-[0.18em] text-brand/60 uppercase">
                  Product
                </p>
                <ul className="space-y-3">
                  {[
                    { label: 'Open Editor',  href: '/editor/local', Icon: Pencil },
                    { label: 'Playground',   href: '/playground',   Icon: ArrowUpRight },
                    { label: 'Docs',         href: '/docs',         Icon: BookOpen },
                    ...(mounted && session ? [{ label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard }] : []),
                  ].map(({ label, href, Icon }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                      >
                        <Icon size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {mounted && !session && (
                <div>
                  <p className="mb-4 font-mono text-[9px] font-semibold tracking-[0.18em] text-brand/60 uppercase">
                    Account
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <button
                        onClick={openSignin}
                        className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                      >
                        <LogIn size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                        Sign in
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={openSignup}
                        className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                      >
                        <UserPlus size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                        Create account
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Gradient divider */}
          <div className="mt-16 h-px bg-gradient-to-r from-transparent via-hairline-strong to-transparent" />

          {/* Bottom bar */}
          <div className="flex flex-col gap-2 py-5 pr-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] text-ink-faint">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> LLDCanvas — built for engineers, by engineers.
            </p>
            <p className="shrink-0 font-mono text-[11px] text-ink-faint">
              Crafted with precision · India
            </p>
          </div>
        </div>

        {/* ── Giant background wordmark ─────────────────────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,1) 100%)',
          }}
        >
          <p
            className="w-full text-center font-serif font-black leading-none text-brand/[0.18] tracking-tighter"
            style={{ fontSize: 'clamp(5rem, 16vw, 13rem)', letterSpacing: '-0.04em' }}
          >
            LLDCANVAS
          </p>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </>
  )
}
