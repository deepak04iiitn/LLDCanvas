'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Globe2, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
  getFeaturesByCategory,
  type FeatureDefinition,
} from '@/lib/features/feature-registry'
import { isFeatureEnabled } from '@/lib/features/flags'
import {
  communityApi,
  type PublishedDesign,
} from '@/lib/community-api'
import { cn } from '@/lib/utils'

function FeatureCard({ feature }: { feature: FeatureDefinition }) {
  const enabled = isFeatureEnabled(feature.flagKey)
  const locked = !enabled

  return (
    <Link
      href={locked ? '#' : feature.href}
      aria-disabled={locked}
      onClick={e => {
        if (locked) e.preventDefault()
      }}
      className={cn(
        'group flex flex-col rounded-xl border border-hairline bg-paper-elevated p-5 transition-all',
        locked
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-brand/30 hover:shadow-sm',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-serif text-base font-medium text-ink group-hover:text-brand">
          {feature.label}
        </h3>
        {feature.minPlan && feature.minPlan !== 'free' && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-amber-600">
            <Lock size={10} />
            {feature.minPlan === 'ultimate' ? 'Ult.' : 'Pro'}
          </span>
        )}
      </div>
      <p className="flex-1 text-[13px] leading-relaxed text-ink-muted">
        {feature.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-brand">
        {locked ? 'Coming soon' : 'Open'}
        {!locked && (
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        )}
      </span>
    </Link>
  )
}

export function CommunityHub() {
  const features = getFeaturesByCategory('community')
  const galleryOn = isFeatureEnabled('FF_COMMUNITY_GALLERY')
  const [designs, setDesigns] = useState<PublishedDesign[]>([])
  const [loading, setLoading] = useState(galleryOn)

  useEffect(() => {
    if (!galleryOn) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await communityApi.gallery.list()
        if (!cancelled) setDesigns(data.designs ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load gallery')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [galleryOn])

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Globe2 size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Product
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
              Community
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Gallery, forks, watch replays, and alternative solutions from other
              designers.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>

        {galleryOn && (
          <section className="mt-12">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                  Gallery
                </p>
                <h2 className="mt-1 font-serif text-xl font-medium text-ink">
                  Published designs
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              </div>
            ) : designs.length === 0 ? (
              <p className="rounded-xl border border-hairline bg-paper-elevated px-5 py-8 text-center text-[14px] text-ink-muted">
                No public designs yet. Publish from your editor to appear here.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {designs.map(d => (
                  <Link
                    key={d._id || d.slug}
                    href={`/community/d/${d.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-paper-elevated transition-all hover:border-brand/30"
                  >
                    {d.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.thumbnail}
                        alt=""
                        className="h-28 w-full object-cover bg-hairline/40"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-hairline/30 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                        No preview
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-serif text-[15px] font-medium text-ink group-hover:text-brand">
                        {d.title}
                      </h3>
                      {d.summary && (
                        <p className="mt-1 line-clamp-2 text-[12px] text-ink-muted">
                          {d.summary}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand">
                        View
                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
