'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderOpen, Settings, Menu, Timer, BarChart2, Mic, BookOpen, Layers, Users, Rocket, Crown, Zap, Lock, Star, PenLine } from 'lucide-react'
import { Wordmark } from '@/components/Brand'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'
import type { PlanName } from '@/hooks/usePlan'

interface NavItem {
  label: string
  href: string
  Icon: typeof FolderOpen
  isActive: (pathname: string) => boolean
  dividerBefore?: boolean
  /** minimum plan to access without a lock icon */
  minPlan?: 'pro' | 'ultimate'
}

const NAV: NavItem[] = [
  { label: 'My UML Diagrams', href: '/dashboard', Icon: FolderOpen, isActive: p => p === '/dashboard' },
  { label: 'Interview Mode', href: '/dashboard/interview-mode', Icon: Mic, isActive: p => p.startsWith('/dashboard/interview-mode'), dividerBefore: true, minPlan: 'pro' },
  { label: 'Practice Sessions', href: '/dashboard/sessions', Icon: Timer, isActive: p => p.startsWith('/dashboard/sessions') },
  { label: 'Stats', href: '/dashboard/stats', Icon: BarChart2, isActive: p => p.startsWith('/dashboard/stats') },
  { label: 'Collaborations', href: '/dashboard/collaborations', Icon: Users, isActive: p => p.startsWith('/dashboard/collaborations'), dividerBefore: true, minPlan: 'pro' },
  { label: 'Practice Problems', href: '/dashboard/problems', Icon: BookOpen, isActive: p => p.startsWith('/dashboard/problems'), dividerBefore: true },
  { label: 'Quick Revision', href: '/dashboard/revision', Icon: Layers, isActive: p => p.startsWith('/dashboard/revision') },
  { label: 'Settings', href: '/settings', Icon: Settings, isActive: p => p.startsWith('/settings'), dividerBefore: true },
]

function planRank(plan: PlanName): number {
  return plan === 'ultimate' ? 2 : plan === 'pro' ? 1 : 0
}

function NavLinks({ pathname, onNavigate, plan }: { pathname: string; onNavigate?: () => void; plan: PlanName }) {
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto space-y-0.5 p-3" style={{ scrollbarWidth: 'none' }}>
      {NAV.map(item => {
        const active = item.isActive(pathname)
        const locked = item.minPlan ? planRank(plan) < planRank(item.minPlan) : false
        const badgeLabel = item.minPlan === 'ultimate' ? 'Ult.' : 'Pro'
        return (
          <div key={item.href}>
            {item.dividerBefore && (
              <div className="mx-3 my-1.5 h-px bg-hairline" />
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                active
                  ? 'bg-brand-tint font-medium text-brand'
                  : locked
                    ? 'text-ink-faint/70 hover:bg-amber-50 hover:text-amber-700'
                    : 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
              )}
            >
              <item.Icon size={15} className={active ? 'text-brand' : locked ? 'text-ink-faint/50' : 'text-ink-faint'} />
              <span className="flex-1">{item.label}</span>
              {locked && (
                <span className="flex items-center gap-0.5">
                  <Lock size={10} className="text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-500 uppercase">{badgeLabel}</span>
                </span>
              )}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

const PLAN_ICON = { free: Zap, pro: Rocket, ultimate: Crown } as const
const PLAN_BADGE = {
  free:     'bg-paper-elevated border border-hairline text-ink-muted',
  pro:      'bg-brand/10 border border-brand/20 text-brand',
  ultimate: 'bg-amber-500/10 border border-amber-500/20 text-amber-600',
} as const

function UserFooter() {
  const { data: session } = useSession()
  const { plan, isFree } = usePlan()

  if (!session) return null

  const PlanIcon = PLAN_ICON[plan] ?? Zap

  return (
    <div className="shrink-0 border-t border-hairline p-3">
      {/* Testimonial nudge */}
      <Link
        href="/#testimonials"
        className="group mb-2 flex items-center gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2 transition-all hover:border-amber-300 hover:bg-amber-50"
      >
        <div className="flex shrink-0 flex-col gap-0.5">
          {[0, 1].map(row => (
            <div key={row} className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <Star
                  key={i}
                  className="h-2 w-2 fill-amber-400 text-amber-400"
                  style={{ opacity: 0.6 + (row * 3 + i) * 0.06 }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-amber-800">Loving LLDCanvas?</p>
          <p className="text-[10px] text-amber-600/80">Share your experience</p>
        </div>
        <PenLine className="h-3 w-3 shrink-0 text-amber-500 transition-transform group-hover:scale-110" />
      </Link>

      {/* Plan badge */}
      <Link
        href="/pricing"
        className={cn('mb-2 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80', PLAN_BADGE[plan])}
      >
        <span className="flex items-center gap-1.5">
          <PlanIcon className="h-3 w-3" />
          <span className="capitalize">{plan} Plan</span>
        </span>
        {isFree && <span className="text-brand text-[10px] font-semibold">Upgrade</span>}
      </Link>

    </div>
  )
}

interface AppShellProps {
  children: React.ReactNode
  /** Extra content rendered directly under the mobile top bar (e.g. a banner). */
  mobileBanner?: React.ReactNode
}

export function AppShell({ children, mobileBanner }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { plan } = usePlan()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      {/* ─── Mobile top bar ─────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-4 py-3 md:hidden">
        <Link href="/">
          <Wordmark />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
      </header>
      {mobileBanner}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="border-b border-hairline px-5 py-5">
            <Link href="/">
              <Wordmark />
            </Link>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} plan={plan} />
          <UserFooter />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Desktop sidebar ────────────────────────────────────────────── */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-paper-elevated md:flex">
          <div className="border-b border-hairline px-5 py-5">
            <Link href="/">
              <Wordmark />
            </Link>
          </div>
          <NavLinks pathname={pathname} plan={plan} />
          <UserFooter />
        </aside>

        {/* ─── Page content ───────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
