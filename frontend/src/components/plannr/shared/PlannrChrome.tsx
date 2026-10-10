'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass, Map, Target, Briefcase, BarChart2,
  CalendarDays, Lightbulb, ClipboardList, Crown, ArrowRight,
} from 'lucide-react'
import { journeyApi } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'
import { PlannrSwitcher } from '@/components/plannr/shared/PlannrSwitcher'
import { usePlan } from '@/hooks/usePlan'

const NAV_ITEMS = [
  { href: '/dashboard/plannr',             icon: Compass,       label: 'Home' },
  { href: '/dashboard/plannr/roadmap',     icon: Map,           label: 'Roadmap' },
  { href: '/dashboard/plannr/practice',    icon: Target,        label: 'Practice' },
  { href: '/dashboard/plannr/revise',      icon: ClipboardList, label: 'Revise' },
  { href: '/dashboard/plannr/experiences', icon: Briefcase,     label: 'Mocks' },
  { href: '/dashboard/plannr/skills',      icon: BarChart2,     label: 'Skills' },
  { href: '/dashboard/plannr/plan',        icon: CalendarDays,  label: 'Plan' },
  { href: '/dashboard/plannr/tips',        icon: Lightbulb,     label: 'Tips' },
]

function PlannrTopNav() {
  const path = usePathname()

  return (
    <header className="relative z-40 shrink-0 border-b border-hairline/80 bg-paper/90 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 lg:gap-5 lg:px-8">
        {/* Always visible — never clipped by nav scroll */}
        <PlannrSwitcher variant="header" />

        <div className="hidden sm:block h-7 w-px shrink-0 bg-hairline" aria-hidden />

        <nav className="min-w-0 flex-1 overflow-x-auto scrollbar-none">
          <div className="flex w-full items-center gap-0.5 rounded-2xl border border-hairline/80 bg-paper-elevated/80 p-1">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active =
                path === href || (href !== '/dashboard/plannr' && path.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12.5px] font-medium whitespace-nowrap transition-all duration-200 sm:px-3',
                    active
                      ? 'bg-brand text-white shadow-sm shadow-brand/25'
                      : 'text-ink-muted hover:bg-paper hover:text-ink',
                  )}
                >
                  <Icon
                    className={cn('h-3.5 w-3.5 shrink-0', active ? 'opacity-95' : 'opacity-70')}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}

function isSetupPath(path: string) {
  return path === '/dashboard/plannr/setup' || path.startsWith('/dashboard/plannr/setup/')
}

function isHubPath(path: string) {
  return path === '/dashboard/plannr'
}

/** Preview banner + top nav on subpages; hub/setup are chrome-free. */
function PreviewBanner() {
  return (
    <div className="shrink-0 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2.5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm text-ink">
          <Crown className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            You’re <span className="font-semibold">previewing Plannr</span>. Upgrade to Ultimate to use this feature completely.
          </span>
        </p>
        <Link
          href="/pricing?from=plannr_preview"
          className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
        >
          Upgrade to Ultimate <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

export function PlannrChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const onSetup = isSetupPath(path)
  const onHub = isHubPath(path)
  const { isUltimate, loading: planLoading } = usePlan()
  const showPreview = !planLoading && !isUltimate

  // Track Free/Pro users viewing Plannr preview / try access
  useEffect(() => {
    if (!showPreview) return
    const source = onSetup ? 'setup' : 'hub'
    journeyApi.trackPreviewVisit(source).catch(() => {})
  }, [onSetup, showPreview])

  // Hub + setup: no Plannr nav — content only (preview banner still shown when needed)
  if (onSetup || onHub) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {showPreview && <PreviewBanner />}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {showPreview && <PreviewBanner />}
      <PlannrTopNav />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
