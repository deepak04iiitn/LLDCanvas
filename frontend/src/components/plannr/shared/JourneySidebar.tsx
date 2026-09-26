'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass, Map, BookOpen, Briefcase, BarChart2,
  CalendarDays, Lightbulb, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlannrSwitcher } from '@/components/plannr/shared/PlannrSwitcher'

const NAV_ITEMS = [
  { href: '/plannr',            icon: Compass,       label: 'Hub' },
  { href: '/plannr/roadmap',    icon: Map,           label: 'Roadmap' },
  { href: '/plannr/experiences',icon: Briefcase,     label: 'Experiences' },
  { href: '/plannr/skills',     icon: BarChart2,     label: 'My Skills' },
  { href: '/plannr/plan',       icon: CalendarDays,  label: 'My Plan' },
  { href: '/plannr/tips',       icon: Lightbulb,     label: 'Tips' },
  { href: '/plannr/cheatsheet', icon: ClipboardList, label: 'Cheat Sheet' },
]

export function JourneySidebar() {
  const path = usePathname()

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-hairline bg-paper-elevated h-[calc(100vh-56px)] sticky top-14">
      <div className="p-4 border-b border-hairline">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Plannr
        </p>
      </div>

      {/* Plan switcher */}
      <PlannrSwitcher />

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === '/plannr' ? path === '/plannr' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors',
                active
                  ? 'text-brand bg-brand-tint/60'
                  : 'text-ink-muted hover:text-ink hover:bg-paper',
              )}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
