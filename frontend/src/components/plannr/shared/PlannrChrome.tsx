'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass, Map, Target, Briefcase, BarChart2,
  CalendarDays, Lightbulb, ClipboardList,
} from 'lucide-react'
import { journeyApi } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { PlannrSwitcher } from '@/components/plannr/shared/PlannrSwitcher'

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

/**
 * When the user has any Plannr plans: full-bleed content + thin top nav (no left dashboard sidebar).
 * When no plans yet: keep the journey sidebar for setup/intro browsing.
 */
export function PlannrChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const onSetup = isSetupPath(path)
  const [hasPlans, setHasPlans] = useState<boolean | null>(null)

  useEffect(() => {
    journeyApi
      .listPlans()
      .then(d => setHasPlans((d.plans?.length ?? 0) > 0))
      .catch(() => setHasPlans(false))
  }, [])

  // Immersive full-page onboarding — no chrome
  if (onSetup) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    )
  }

  if (hasPlans === null || hasPlans) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {hasPlans && <PlannrTopNav />}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full">
      <div className="hidden md:block shrink-0">
        <JourneySidebar />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
