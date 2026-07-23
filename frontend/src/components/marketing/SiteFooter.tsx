'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, BookOpen, LayoutDashboard, LogIn, Pencil, UserPlus,
  LayoutTemplate, PenLine, ListChecks, Timer, Users, Terminal,
  CreditCard, Layers, Mail, Share2, MessageCircle, ExternalLink,
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { Wordmark } from '@/components/Brand'
import { useSession } from '@/lib/auth'

// ─── Feature links ────────────────────────────────────────────────────────────

const FEATURE_LINKS = [
  { label: 'UML Editor',          href: '/features/editor',              Icon: LayoutTemplate },
  { label: 'Draft Notation',      href: '/features/draft-notation',      Icon: PenLine        },
  { label: 'Interview Questions', href: '/features/interview-questions',  Icon: ListChecks     },
  { label: 'Interview Mode',      href: '/features/interview-mode',       Icon: Timer          },
  { label: 'Collaboration',       href: '/features/collaboration',        Icon: Users          },
  { label: 'Code Execution',      href: '/features/code-execution',       Icon: Terminal       },
  { label: 'Revision Notes',      href: '/features/revision-notes',       Icon: BookOpen       },
]

// ─── Nav link helper ──────────────────────────────────────────────────────────

function NavLink({ href, Icon, children }: { href: string; Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        <Icon size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
        {children}
      </Link>
    </li>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SiteFooter() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [mounted,  setMounted]  = useState(false)
  const { data: session } = useSession()

  useEffect(() => { setMounted(true) }, [])

  function openSignin() { setAuthMode('signin'); setAuthOpen(true) }
  function openSignup() { setAuthMode('signup'); setAuthOpen(true) }

  return (
    <>
      <footer className="relative overflow-hidden border-t border-hairline-strong bg-paper px-5 pb-0 pt-20 sm:px-8">

        {/* ── Grain texture ─────────────────────────────────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* ── Radial brand glow ─────────────────────────────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-20"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, #234E3F33, transparent)' }}
        />

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="relative mx-auto max-w-6xl">

          {/* Main row — brand left, nav columns fill the rest */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start">

            {/* ── Brand block ─────────────────────────────────────────────── */}
            <div className="lg:w-64 lg:flex-none lg:pr-8">
              <Link href="/" className="inline-block">
                <Wordmark height={36} />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                The complete platform for Low-Level Design — practice interview questions, design systems visually, run code, and collaborate in real time.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                ¶ v1.0
              </span>
            </div>

            {/* ── Nav columns — always fill remaining space evenly ────────── */}
            <div className="flex flex-1 flex-col gap-10 sm:flex-row sm:justify-between">

              {/* Features */}
              <div>
                <p className="mb-4 font-mono text-[9px] font-semibold tracking-[0.18em] text-brand/60 uppercase">
                  Features
                </p>
                <ul className="space-y-3">
                  {FEATURE_LINKS.map(({ label, href, Icon }) => (
                    <NavLink key={label} href={href} Icon={Icon}>{label}</NavLink>
                  ))}
                </ul>
              </div>

              {/* Platform */}
              <div>
                <p className="mb-4 font-mono text-[9px] font-semibold tracking-[0.18em] text-brand/60 uppercase">
                  Platform
                </p>
                <ul className="space-y-3">
                  <NavLink href="/editor/local" Icon={Pencil}>Open Editor</NavLink>
                  <NavLink href="/playground"   Icon={ArrowUpRight}>Playground</NavLink>
                  <NavLink href="/features"     Icon={Layers}>All Features</NavLink>
                  <NavLink href="/pricing"      Icon={CreditCard}>Pricing</NavLink>
                  {mounted && session && (
                    <NavLink href="/dashboard" Icon={LayoutDashboard}>Dashboard</NavLink>
                  )}
                </ul>
              </div>

              {/* Connect */}
              <div>
                <p className="mb-4 font-mono text-[9px] font-semibold tracking-[0.18em] text-brand/60 uppercase">
                  Connect
                </p>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="mailto:support.lldcanvas@gmail.com"
                      className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      <Mail size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                      support.lldcanvas@gmail.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/lldcanvas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      <ExternalLink size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://twitter.com/lldcanvas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      <Share2 size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                      Twitter / X
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://discord.gg/lldcanvas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      <MessageCircle size={12} className="shrink-0 text-ink-faint transition-colors group-hover:text-brand" />
                      Discord
                    </a>
                  </li>
                </ul>
              </div>

              {/* Account (signed-out only) */}
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

          {/* ── Gradient divider ─────────────────────────────────────────────── */}
          <div className="mt-16 h-px bg-linear-to-r from-transparent via-hairline-strong to-transparent" />

          {/* ── Bottom bar ───────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 py-5 pr-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] text-ink-faint">
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> LLDCanvas — built for engineers, by engineers.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="font-mono text-[11px] text-ink-faint transition-colors hover:text-ink">
                Pricing
              </Link>
              <span className="text-ink-faint/30">·</span>
              <Link href="/features" className="font-mono text-[11px] text-ink-faint transition-colors hover:text-ink">
                Features
              </Link>
              <span className="text-ink-faint/30">·</span>
              <p className="font-mono text-[11px] text-ink-faint">India</p>
            </div>
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
            className="w-full text-center font-serif font-black leading-none tracking-tighter text-brand/18"
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
