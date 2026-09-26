'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, eyebrow, backHref, backLabel = 'Back', actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {backHref && (
        <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={12} strokeWidth={1.75} />
          {backLabel}
        </Link>
      )}
      {eyebrow && (
        <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{eyebrow}</p>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink-muted max-w-xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
