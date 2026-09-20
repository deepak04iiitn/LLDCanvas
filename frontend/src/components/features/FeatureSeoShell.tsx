import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

type FeatureSeoProps = {
  slug: string
  title: string
  metaTitle: string
  description: string
  eyebrow: string
  headline: React.ReactNode
  body: string
  ctaHref: string
  ctaLabel: string
  keywords: string[]
}

function FeatureSeoPage({
  slug,
  title,
  metaTitle,
  description,
  eyebrow,
  headline,
  body,
  ctaHref,
  ctaLabel,
  keywords,
}: FeatureSeoProps) {
  return (
    <div className="overflow-hidden">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          url: `https://www.lldcanvas.in/features/${slug}`,
          description,
        }}
      />

      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:px-8 sm:py-28">
          <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">{eyebrow}</span>
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">{body}</p>
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
            >
              {ctaLabel} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <FeatureCrossLinks exclude={`/features/${slug}`} />
    </div>
  )
}

export function buildFeatureMetadata(opts: {
  title: string
  description: string
  slug: string
  keywords: string[]
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: `/features/${opts.slug}` },
    openGraph: {
      title: opts.title,
      description: opts.description,
      type: 'website',
      url: `/features/${opts.slug}`,
    },
  }
}

export { FeatureSeoPage }
