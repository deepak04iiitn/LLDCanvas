'use client'

import React, { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, Timer,
  LogOut, Menu, ShieldCheck, X,
  BookOpen, Layers, MessageSquareText, Terminal,
  CreditCard, BarChart3, Bug, Quote,
} from 'lucide-react'
import { Wordmark } from '@/components/Brand'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

const NAV: { label: string; href: string; Icon: React.ElementType; isActive: (p: string) => boolean; divider?: boolean }[] = [
  { label: 'Overview',     href: '/admin',           Icon: LayoutDashboard,   isActive: (p) => p === '/admin' },
  { label: 'Users',        href: '/admin/users',     Icon: Users,             isActive: (p) => p.startsWith('/admin/users') },
  { label: 'Diagrams',     href: '/admin/diagrams',  Icon: FileText,          isActive: (p) => p.startsWith('/admin/diagrams') },
  { label: 'Sessions',     href: '/admin/sessions',  Icon: Timer,             isActive: (p) => p.startsWith('/admin/sessions') },
  { label: 'Problems',     href: '/admin/problems',  Icon: BookOpen,          isActive: (p) => p.startsWith('/admin/problems'),  divider: true },
  { label: 'Revision',     href: '/admin/revision',  Icon: Layers,            isActive: (p) => p.startsWith('/admin/revision') },
  { label: 'Collab',       href: '/admin/collab',    Icon: MessageSquareText, isActive: (p) => p.startsWith('/admin/collab') },
  { label: 'Code Exec',    href: '/admin/code',          Icon: Terminal,          isActive: (p) => p.startsWith('/admin/code'), divider: true },
  { label: 'Subscriptions', href: '/admin/subscriptions', Icon: CreditCard,        isActive: (p) => p.startsWith('/admin/subscriptions') },
  { label: 'Revenue',      href: '/admin/revenue',       Icon: BarChart3,         isActive: (p) => p.startsWith('/admin/revenue') },
  { label: 'Feedback',      href: '/admin/feedback',      Icon: Bug,               isActive: (p) => p.startsWith('/admin/feedback'), divider: true },
  { label: 'Testimonials',  href: '/admin/testimonials',  Icon: Quote,             isActive: (p) => p.startsWith('/admin/testimonials') },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto p-3 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}>
      {NAV.map(item => {
        const active = item.isActive(pathname)
        return (
          <div key={item.href}>
            {item.divider && <div className="my-2 border-t border-hairline" />}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-tint text-brand'
                  : 'text-ink-muted hover:bg-hairline/60 hover:text-ink',
              )}
            >
              <item.Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo + admin badge */}
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-4">
        <Link href="/">
          <Wordmark height={40} />
        </Link>
        <span className="ml-1 rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-brand-foreground">
          Admin
        </span>
      </div>

      {/* Admin identity */}
      <div className="border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      <NavLinks pathname={pathname} onNavigate={onNavigate} />

      <div className="border-t border-hairline p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-muted transition-all hover:bg-hairline/60 hover:text-ink"
        >
          <LayoutDashboard className="h-4 w-4" />
          User Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-muted transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-hairline bg-paper-elevated lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-paper-elevated shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-ink-faint hover:bg-hairline"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex h-12 items-center gap-3 border-b border-hairline bg-paper-elevated px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-ink-muted hover:bg-hairline"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/">
            <Wordmark height={32} />
          </Link>
          <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-brand-foreground">
            Admin
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
