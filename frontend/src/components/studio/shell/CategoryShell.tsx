'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbSegment {
  label: string
  href?: string
}

export interface CategoryShellProps {
  title: string
  subtitle?: string
  backHref: string
  backLabel?: string
  /**
   * Optional breadcrumb trail shown above the title.
   * e.g. [{ label: 'Design Studio', href: '/design-studio' }, { label: 'Debugger', href: '/design-studio/debugger' }, { label: 'Problems', href: '/design-studio/debugger/problems' }]
   */
  breadcrumb?: BreadcrumbSegment[]
  /** Optional timer / HUD slot (e.g. interview-style countdown). */
  timer?: React.ReactNode
  /** Optional plan-gate or action buttons on the right. */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

/**
 * Shared chrome for Design Studio and Learn challenge pages.
 */
export function CategoryShell({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  breadcrumb,
  timer,
  actions,
  children,
  className,
  contentClassName,
}: CategoryShellProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col bg-paper', className)}>
      <header className="flex shrink-0 flex-col gap-0 border-b border-hairline bg-paper-elevated px-4 py-2 sm:px-6">
        {/* Breadcrumb row (optional) */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 pt-1 pb-0.5 flex-wrap">
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} className="text-ink-faint/50" />}
                {seg.href ? (
                  <Link href={seg.href} className="text-[11px] text-ink-faint hover:text-ink transition-colors">
                    {seg.label}
                  </Link>
                ) : (
                  <span className="text-[11px] text-ink-muted font-medium">{seg.label}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Main header row */}
        <div className="flex items-center gap-3 py-1.5">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>

          <div className="mx-1 h-5 w-px bg-hairline" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-lg font-medium leading-tight text-ink sm:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-[12px] text-ink-muted">{subtitle}</p>
            )}
          </div>

          {timer && (
            <div className="shrink-0 font-mono text-sm tabular-nums text-ink-muted">
              {timer}
            </div>
          )}

          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>

      <div className={cn('flex min-h-0 flex-1 flex-col', contentClassName)}>
        {children}
      </div>
    </div>
  )
}
