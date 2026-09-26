'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { studioApi, type StudioPackSummary } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

export interface CompletionNextProps {
  /** Pack type to fetch for "next problem" recommendation */
  packType: string
  /** Slug of the just-completed problem (to skip it) */
  currentSlug: string
  /** Href back to the problem library */
  libraryHref: string
  /** Optional override for fetching packs */
  packsLoader?: () => Promise<StudioPackSummary[]>
  className?: string
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-rose-50 text-rose-700',
}

export function CompletionNext({
  packType,
  currentSlug,
  libraryHref,
  packsLoader,
  className,
}: CompletionNextProps) {
  const [next,    setNext]    = useState<StudioPackSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        let packs: StudioPackSummary[]
        if (packsLoader) {
          packs = await packsLoader()
        } else {
          const res = await studioApi.packs.list(packType)
          packs = res.packs ?? []
        }
        // Find the next pack after the current one (by order, then index)
        const sorted = [...packs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const idx    = sorted.findIndex(p => p.slug === currentSlug)
        const found  = idx >= 0 && idx < sorted.length - 1
          ? sorted[idx + 1]
          : sorted.find(p => p.slug !== currentSlug) ?? null
        setNext(found)
      } catch { setNext(null) }
      finally  { setLoading(false) }
    })()
  }, [packType, currentSlug, packsLoader])

  return (
    <div className={cn('space-y-4', className)}>
      {/* What's next heading */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-brand" />
        <h3 className="font-serif text-base font-medium text-ink">Keep the momentum</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-ink-faint">
          <Loader2 size={13} className="animate-spin" /> Finding next problem…
        </div>
      ) : next ? (
        <div className="rounded-2xl border border-hairline bg-paper-elevated p-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-faint mb-1">
              Recommended next
            </p>
            <p className="font-serif text-[14px] font-medium text-ink leading-snug">{next.title}</p>
            {next.description && (
              <p className="text-[12px] text-ink-muted mt-1 line-clamp-1">{next.description}</p>
            )}
            <span className={cn(
              'inline-block mt-2 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide',
              DIFFICULTY_BADGE[(next.difficulty ?? 'easy').toLowerCase()] ?? 'text-ink-faint',
            )}>
              {next.difficulty}
            </span>
          </div>
          <Link
            href={`${libraryHref.replace('/problems', '')}/${encodeURIComponent(next.slug)}`}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Try it <ArrowRight size={12} />
          </Link>
        </div>
      ) : null}

      {/* Return to library */}
      <div className="flex items-center gap-3">
        <Link
          href={libraryHref}
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <BookOpen size={13} />
          All Problems
        </Link>
        <span className="text-ink-faint">·</span>
        <Link
          href={libraryHref.replace('/problems', '')}
          className="flex items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronRight size={13} />
          Feature Overview
        </Link>
      </div>
    </div>
  )
}
