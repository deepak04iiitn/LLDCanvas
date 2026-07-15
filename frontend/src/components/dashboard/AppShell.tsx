'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FolderOpen, Settings, LogOut, Menu, Timer, BarChart2, Mic } from 'lucide-react'
import { Wordmark } from '@/components/Brand'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useSession, signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  Icon: typeof FolderOpen
  isActive: (pathname: string) => boolean
  dividerBefore?: boolean
}

const NAV: NavItem[] = [
  { label: 'My Diagrams', href: '/dashboard', Icon: FolderOpen, isActive: p => p === '/dashboard' },
  { label: 'Interview Mode', href: '/dashboard/interview-mode', Icon: Mic, isActive: p => p.startsWith('/dashboard/interview-mode'), dividerBefore: true },
  { label: 'Practice Sessions', href: '/dashboard/sessions', Icon: Timer, isActive: p => p.startsWith('/dashboard/sessions') },
  { label: 'Stats', href: '/dashboard/stats', Icon: BarChart2, isActive: p => p.startsWith('/dashboard/stats') },
  { label: 'Settings', href: '/settings', Icon: Settings, isActive: p => p.startsWith('/settings'), dividerBefore: true },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {NAV.map(item => {
        const active = item.isActive(pathname)
        return (
          <div key={item.href}>
            {item.dividerBefore && (
              <div className="mx-3 my-1.5 h-px bg-hairline" />
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                active
                  ? 'bg-brand-tint font-medium text-brand'
                  : 'text-ink-muted hover:bg-hairline/50 hover:text-ink',
              )}
            >
              <item.Icon size={15} className={active ? 'text-brand' : 'text-ink-faint'} />
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}

function UserFooter() {
  const { data: session } = useSession()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (!session) return null

  return (
    <div className="border-t border-hairline p-3">
      <div className="flex items-center gap-3 rounded-md px-3 py-2">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint">
            <span className="text-xs font-semibold text-brand">
              {session.user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink">{session.user.name}</p>
          <p className="truncate text-[10px] text-ink-faint">{session.user.email}</p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="mt-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs text-ink-faint transition-colors duration-150 hover:bg-hairline/50 hover:text-ink"
      >
        <LogOut size={13} />
        Sign out
      </button>
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      {/* ─── Mobile top bar ─────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-4 py-3 md:hidden">
        <Wordmark />
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
            <Wordmark />
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <UserFooter />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Desktop sidebar ────────────────────────────────────────────── */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-paper-elevated md:flex">
          <div className="border-b border-hairline px-5 py-5">
            <Wordmark />
          </div>
          <NavLinks pathname={pathname} />
          <UserFooter />
        </aside>

        {/* ─── Page content ───────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
