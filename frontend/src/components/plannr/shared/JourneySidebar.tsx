'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass, Map, Target, Briefcase, BarChart2,
  CalendarDays, Lightbulb, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlannrSwitcher } from '@/components/plannr/shared/PlannrSwitcher'

const NAV_ITEMS = [
  { href: '/dashboard/plannr',             icon: Compass,       label: 'Home' },
  { href: '/dashboard/plannr/roadmap',     icon: Map,           label: 'Roadmap' },
  { href: '/dashboard/plannr/practice',    icon: Target,        label: 'Practice' },
  { href: '/dashboard/plannr/revise',      icon: ClipboardList, label: 'Revise' },
  { href: '/dashboard/plannr/experiences', icon: Briefcase,     label: 'Mocks' },
  { href: '/dashboard/plannr/skills',      icon: BarChart2,     label: 'My Skills' },
  { href: '/dashboard/plannr/plan',        icon: CalendarDays,  label: 'My Plan' },
  { href: '/dashboard/plannr/tips',        icon: Lightbulb,     label: 'Tips' },
]

export function JourneySidebar() {
  const path = usePathname()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-hairline bg-paper p-3">
      <PlannrSwitcher />
      <nav className="mt-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/dashboard/plannr' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
