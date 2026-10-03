'use client'

import React, { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, Timer,
  LogOut, Menu, ShieldCheck, X,
  BookOpen, Layers, MessageSquareText, Terminal,
  CreditCard, BarChart3, Bug, Quote, Rss,
  Map, Brain, Search, Gamepad2, Wrench, RefreshCcw,
  Pencil, TrendingUp, Coins, Activity,
  Stethoscope,
} from 'lucide-react'
import { Wordmark } from '@/components/Brand'
import { useSignOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

// ─── Nav type ──────────────────────────────────────────────────────────────────

type NavLink = {
  type?: 'link'
  label: string
  href: string
  Icon: React.ElementType
  isActive: (p: string) => boolean
  divider?: boolean
  indent?: boolean
}
type NavSection = { type: 'section'; label: string; divider?: boolean }
type NavItem = NavLink | NavSection

// ─── Nav definition ────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { label: 'Overview',      href: '/admin',                Icon: LayoutDashboard,  isActive: p => p === '/admin' },
  { label: 'Users',         href: '/admin/users',          Icon: Users,            isActive: p => p.startsWith('/admin/users') },
  { label: 'Diagrams',      href: '/admin/diagrams',       Icon: FileText,         isActive: p => p.startsWith('/admin/diagrams') },
  { label: 'Sessions',      href: '/admin/sessions',       Icon: Timer,            isActive: p => p.startsWith('/admin/sessions') },
  { label: 'Problems',      href: '/admin/problems',       Icon: BookOpen,         isActive: p => p.startsWith('/admin/problems'), divider: true },
  { label: 'Revision',      href: '/admin/revision',       Icon: Layers,           isActive: p => p.startsWith('/admin/revision') },
  { label: 'Collab',        href: '/admin/collab',         Icon: MessageSquareText,isActive: p => p.startsWith('/admin/collab') },
  { label: 'Code Exec',     href: '/admin/code',           Icon: Terminal,         isActive: p => p.startsWith('/admin/code'),    divider: true },

  // ── Billing ───────────────────────────────────────────────────────────────
  { label: 'Subscriptions', href: '/admin/subscriptions',  Icon: CreditCard,       isActive: p => p.startsWith('/admin/subscriptions') },
  { label: 'Revenue',       href: '/admin/revenue',        Icon: BarChart3,        isActive: p => p.startsWith('/admin/revenue') },

  // ── Content ───────────────────────────────────────────────────────────────
  { label: 'Feedback',      href: '/admin/feedback',       Icon: Bug,              isActive: p => p.startsWith('/admin/feedback'),    divider: true },
  { label: 'Testimonials',  href: '/admin/testimonials',   Icon: Quote,            isActive: p => p.startsWith('/admin/testimonials') },
  { label: 'Blog',          href: '/admin/blog',           Icon: Rss,              isActive: p => p.startsWith('/admin/blog') },

  // ── Features ──────────────────────────────────────────────────────────────
  { type: 'section', label: 'Features', divider: true },
  { label: 'Plannr',            href: '/admin/features/plannr',     Icon: Map,        isActive: p => p === '/admin/features/plannr',     indent: true },
  { label: 'Daily Quiz',        href: '/admin/features/daily-quiz', Icon: Brain,      isActive: p => p === '/admin/features/daily-quiz', indent: true },
  { label: 'Pattern Detective', href: '/admin/features/detective',  Icon: Search,     isActive: p => p === '/admin/features/detective',  indent: true },
  { label: 'Debug Lab',         href: '/admin/features/debug-lab',  Icon: Stethoscope,isActive: p => p === '/admin/features/debug-lab',  indent: true },
  { label: 'LLD Roguelike',     href: '/admin/features/roguelike',  Icon: Gamepad2,   isActive: p => p === '/admin/features/roguelike',  indent: true },
  { label: 'Debug & Fix',       href: '/admin/features/debug-fix',  Icon: Wrench,     isActive: p => p === '/admin/features/debug-fix',  indent: true },
  { label: 'Refactor',          href: '/admin/features/refactor',   Icon: RefreshCcw, isActive: p => p === '/admin/features/refactor',   indent: true },
  { label: 'Change One Thing',  href: '/admin/features/change-one', Icon: Pencil,     isActive: p => p === '/admin/features/change-one', indent: true },
  { label: 'Evolution',         href: '/admin/features/evolution',  Icon: TrendingUp, isActive: p => p === '/admin/features/evolution',  indent: true },
  { label: 'Budget Pressure',   href: '/admin/features/budget',     Icon: Coins,      isActive: p => p === '/admin/features/budget',     indent: true },

  // ── Analytics ─────────────────────────────────────────────────────────────
  { type: 'section', label: 'Analytics', divider: true },
  { label: 'User Activity',  href: '/admin/activity', Icon: Activity, isActive: p => p.startsWith('/admin/activity'), indent: true },
]

// ─── Nav renderer ──────────────────────────────────────────────────────────────

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'none' }}>
      {NAV.map((item, idx) => {
        if (item.type === 'section') {
          return (
            <div key={idx}>
              {item.divider && <div className="my-2 border-t border-hairline" />}
              <p className="px-3 pb-1 pt-3 font-mono text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
                {item.label}
              </p>
            </div>
          )
        }

        const link = item as NavLink
        const active = link.isActive(pathname)
        return (
          <div key={link.href}>
            {link.divider && <div className="my-2 border-t border-hairline" />}
            <Link
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 rounded-md py-2 text-sm font-medium transition-all duration-150',
                link.indent ? 'px-2 pl-5' : 'px-3',
                active
                  ? 'bg-brand-tint text-brand'
                  : 'text-ink-muted hover:bg-hairline/60 hover:text-ink',
              )}
            >
              <link.Icon className="h-4 w-4 shrink-0" />
              <span className={cn('truncate', link.indent && 'text-[13px]')}>{link.label}</span>
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

// ─── Sidebar content ───────────────────────────────────────────────────────────

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const doSignOut = useSignOut()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-4">
        <Link href="/"><Wordmark height={40} /></Link>
        <span className="ml-1 rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-brand-foreground">
          Admin
        </span>
      </div>

      {/* Identity badge */}
      <div className="border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          </div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand">
            Admin Console
          </p>
        </div>
      </div>

      <NavLinks pathname={pathname} onNavigate={onNavigate} />

      {/* Footer links */}
      <div className="border-t border-hairline p-3">
        <Link
          href="/dashboard?view=user"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-muted transition-all hover:bg-hairline/60 hover:text-ink"
        >
          <LayoutDashboard className="h-4 w-4" />
          User Dashboard
        </Link>
        <button
          onClick={doSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-muted transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

// ─── Shell ─────────────────────────────────────────────────────────────────────

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname    = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-hairline bg-paper-elevated lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[min(16rem,85vw)] flex-col bg-paper-elevated shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-ink-faint hover:bg-hairline"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-hairline bg-paper-elevated px-3 sm:px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="shrink-0 rounded-md p-1.5 text-ink-muted hover:bg-hairline"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/" className="min-w-0 shrink"><Wordmark height={28} /></Link>
          <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-brand-foreground">
            Admin
          </span>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
