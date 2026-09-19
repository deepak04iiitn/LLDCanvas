'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderOpen,
  Settings,
  Menu,
  Timer,
  BarChart2,
  Mic,
  BookOpen,
  Layers,
  Users,
  Rocket,
  Crown,
  Zap,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  ArrowUpRight,
  Plus,
} from 'lucide-react'
import { Wordmark } from '@/components/Brand'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TestimonialModal } from '@/components/testimonials/TestimonialWidget'
import { useSession } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'
import type { PlanName } from '@/hooks/usePlan'

const COLLAPSE_KEY = 'lldcanvas-sidebar-collapsed'

interface NavItem {
  label: string
  href: string
  Icon: typeof FolderOpen
  isActive: (pathname: string) => boolean
  minPlan?: 'pro' | 'ultimate'
  /** Optional quick-create link shown as a + on the right (expanded only). */
  createHref?: string
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      {
        label: 'My UML Diagrams',
        href: '/dashboard',
        Icon: FolderOpen,
        // Dashboard home only (not /dashboard/problems, sessions, etc.)
        isActive: p => p.replace(/\/$/, '') === '/dashboard',
        createHref: '/dashboard?new=1',
      },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    items: [
      {
        label: 'Interview Mode',
        href: '/dashboard/interview-mode',
        Icon: Mic,
        isActive: p => p.startsWith('/dashboard/interview-mode'),
        minPlan: 'pro',
      },
      {
        label: 'Practice Sessions',
        href: '/dashboard/sessions',
        Icon: Timer,
        isActive: p => p.startsWith('/dashboard/sessions'),
      },
      {
        label: 'Stats',
        href: '/dashboard/stats',
        Icon: BarChart2,
        isActive: p => p.startsWith('/dashboard/stats'),
      },
      {
        label: 'Collaborations',
        href: '/dashboard/collaborations',
        Icon: Users,
        isActive: p => p.startsWith('/dashboard/collaborations'),
        minPlan: 'pro',
      },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    items: [
      {
        label: 'Practice Problems',
        href: '/dashboard/problems',
        Icon: BookOpen,
        isActive: p => p.startsWith('/dashboard/problems'),
      },
      {
        label: 'Quick Revision',
        href: '/dashboard/revision',
        Icon: Layers,
        isActive: p => p.startsWith('/dashboard/revision'),
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        label: 'Settings',
        href: '/settings',
        Icon: Settings,
        isActive: p => p.startsWith('/settings'),
      },
    ],
  },
]

function planRank(plan: PlanName): number {
  return plan === 'ultimate' ? 2 : plan === 'pro' ? 1 : 0
}

const PLAN_ICON = { free: Zap, pro: Rocket, ultimate: Crown } as const
const PLAN_TONE = {
  free: 'text-ink-muted',
  pro: 'text-brand',
  ultimate: 'text-amber-700',
} as const

function NavLink({
  item,
  pathname,
  plan,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  plan: PlanName
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const active = item.isActive(pathname)
  const locked = item.minPlan ? planRank(plan) < planRank(item.minPlan) : false
  const badgeLabel = item.minPlan === 'ultimate' ? 'Ult.' : 'Pro'

  const className = cn(
    'group relative flex items-center rounded-md text-[13px] transition-colors duration-150',
    collapsed ? 'h-9 w-9 justify-center' : 'gap-2.5 px-2.5 py-2',
    active && 'bg-brand-tint font-medium text-brand',
    !active && locked && 'text-ink-faint/70 hover:bg-amber-50/80 hover:text-amber-800',
    !active && !locked && 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
  )

  const icon = (
    <item.Icon
      size={16}
      strokeWidth={active ? 2 : 1.75}
      className={cn(
        'shrink-0',
        active ? 'text-brand' : locked ? 'text-ink-faint/50' : 'text-ink-faint group-hover:text-ink-muted',
      )}
    />
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link href={item.href} onClick={onNavigate} className={className} />
          }
        >
          {icon}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
          {locked ? ` · ${badgeLabel}` : ''}
        </TooltipContent>
      </Tooltip>
    )
  }

  // Expanded row with optional create affordance
  if (item.createHref) {
    return (
      <div
        className={cn(
          'group relative flex items-center rounded-md text-[13px] transition-colors duration-150',
          active
            ? 'bg-brand-tint font-medium text-brand'
            : 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
        )}
      >
        {active && (
          <span className="absolute inset-y-1.5 left-0 z-10 w-0.5 rounded-full bg-brand" />
        )}
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-2.5 pr-8"
        >
          {icon}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
        </Link>
        <Link
          href={item.createHref}
          onClick={e => {
            e.stopPropagation()
            onNavigate?.()
          }}
          title="New UML diagram"
          aria-label="New UML diagram"
          className={cn(
            'absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors',
            active
              ? 'text-brand/70 hover:bg-brand/10 hover:text-brand'
              : 'text-ink-faint opacity-70 hover:bg-paper hover:text-ink group-hover:opacity-100',
          )}
        >
          <Plus size={14} strokeWidth={2} />
        </Link>
      </div>
    )
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={className}>
      {active && (
        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" />
      )}
      {icon}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {locked && (
        <span className="flex items-center gap-0.5">
          <Lock size={10} className="text-amber-400" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wide text-amber-500">
            {badgeLabel}
          </span>
        </span>
      )}
    </Link>
  )
}

function NavLinks({
  pathname,
  plan,
  collapsed = false,
  onNavigate,
}: {
  pathname: string
  plan: PlanName
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <nav
      className={cn(
        'min-h-0 flex-1 overflow-y-auto',
        collapsed ? 'px-2 py-3' : 'px-3 py-3',
      )}
      style={{ scrollbarWidth: 'none' }}
    >
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.id} className={cn(gi > 0 && (collapsed ? 'mt-2' : 'mt-4'))}>
          {!collapsed && (
            <p className="mb-1 px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              {group.label}
            </p>
          )}
          {collapsed && gi > 0 && (
            <div className="mx-auto mb-2 h-px w-5 bg-hairline" />
          )}
          <div className={cn('space-y-0.5', collapsed && 'flex flex-col items-center')}>
            {group.items.map(item => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                plan={plan}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

function UserFooter({
  collapsed,
  onShare,
}: {
  collapsed?: boolean
  onShare: () => void
}) {
  const { data: session } = useSession()
  const { plan, isFree } = usePlan()

  if (!session) return null

  const PlanIcon = PLAN_ICON[plan] ?? Zap

  if (collapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center gap-1.5 border-t border-hairline px-2 py-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onShare}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-tint text-brand transition-colors hover:bg-brand hover:text-paper"
              />
            }
          >
            <Quote className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Share your experience
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href="/pricing"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-hairline/50',
                  PLAN_TONE[plan],
                )}
              />
            }
          >
            <PlanIcon className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
            {isFree ? ' · Upgrade' : ''}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="shrink-0 border-t border-hairline p-3">
      <button
        type="button"
        onClick={onShare}
        className="group relative mb-2.5 w-full overflow-hidden rounded-lg border border-hairline bg-brand-tint/50 px-3 py-3 text-left transition-colors hover:border-brand/25 hover:bg-brand-tint"
      >
        <Quote
          className="pointer-events-none absolute -right-1 -top-1 h-10 w-10 text-brand/10 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand/15"
          strokeWidth={1.25}
        />
        <p className="font-serif text-[13px] leading-tight text-ink">
          Loving LLDCanvas?
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-brand transition-colors group-hover:text-brand-hover">
          Share your experience
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      </button>

      <Link
        href="/pricing"
        className="flex items-center justify-center gap-1.5 py-1.5 text-xs transition-colors hover:opacity-80"
      >
        <span className={cn('inline-flex items-center gap-1.5 font-medium capitalize', PLAN_TONE[plan])}>
          <PlanIcon className="h-3.5 w-3.5" />
          {plan} plan
        </span>
        {isFree && (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
            · Upgrade
          </span>
        )}
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
  const [collapsed, setCollapsed] = useState(false)
  const [ready, setReady] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const { plan } = usePlan()

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch { /* ignore */ }
      return next
    })
  }

  function openShare() {
    setShareOpen(true)
    setMobileOpen(false)
  }

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-screen flex-col overflow-hidden bg-paper">
        {/* Mobile top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-4 py-3 md:hidden">
          <Link href="/">
            <Wordmark height={28} />
          </Link>
          <button
            type="button"
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
            <div className="flex items-center border-b border-hairline px-5 py-4">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Wordmark height={28} />
              </Link>
            </div>
            <NavLinks
              pathname={pathname}
              plan={plan}
              onNavigate={() => setMobileOpen(false)}
            />
            <UserFooter onShare={openShare} />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <aside
            className={cn(
              'hidden shrink-0 flex-col border-r border-hairline bg-paper-elevated md:flex',
              ready ? 'transition-[width] duration-200 ease-out' : '',
              collapsed ? 'w-17' : 'w-60',
            )}
          >
            <div
              className={cn(
                'flex h-14 shrink-0 items-center border-b border-hairline',
                collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4',
              )}
            >
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href="/"
                        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md"
                      />
                    }
                  >
                    <Image
                      src="/LLDCanvas_Logo_Only.png"
                      alt="LLDCanvas"
                      width={22}
                      height={22}
                      className="select-none"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    LLDCanvas
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Link href="/" className="min-w-0">
                    <Wordmark height={28} />
                  </Link>
                  <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline/50 hover:text-ink"
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose size={15} />
                  </button>
                </>
              )}
            </div>

            <NavLinks pathname={pathname} plan={plan} collapsed={collapsed} />
            <UserFooter collapsed={collapsed} onShare={openShare} />

            {collapsed && (
              <div className="flex justify-center border-t border-hairline py-2">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={toggleCollapsed}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline/50 hover:text-ink"
                        aria-label="Expand sidebar"
                      />
                    }
                  >
                    <PanelLeftOpen size={15} />
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Expand
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
        </div>

        <TestimonialModal open={shareOpen} onClose={() => setShareOpen(false)} />
      </div>
    </TooltipProvider>
  )
}
