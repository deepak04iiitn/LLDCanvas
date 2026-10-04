import Link from 'next/link'
import { ArrowRight, Check, type LucideIcon } from 'lucide-react'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export interface Step { n: string; verb: string; body: string }
export interface Highlight { Icon: LucideIcon; label: string; desc: string }

export interface FeaturePageShellProps {
  eyebrow: string
  h1: string
  subtitle: string
  ctaHref: string
  ctaLabel: string
  accentColor: string
  accentBg: string
  steps: Step[]
  highlights: Highlight[]
  forWho: string[]
  faq: { q: string; a: string }[]
  exclude: string
  slug: string
  pageName: string
  pageDescription: string
}

export function FeaturePageShell({
  eyebrow,
  h1,
  subtitle,
  ctaHref,
  ctaLabel,
  accentColor,
  accentBg,
  steps,
  highlights,
  forWho,
  faq,
  exclude,
  slug,
  pageName,
  pageDescription,
}: FeaturePageShellProps) {
  const canonicalUrl = `https://www.lldcanvas.in/features/${slug}`

  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageName,
        url: canonicalUrl,
        description: pageDescription,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Features', item: 'https://www.lldcanvas.in/features' },
          { '@type': 'ListItem', position: 2, name: pageName, item: canonicalUrl },
        ],
      }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(166,159,140,0.28) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-28">
          <p className={`mb-4 font-mono text-[11px] font-medium tracking-[0.2em] uppercase ${accentColor}`}>
            <span className="text-gold">{eyebrow.split('·')[0].trim()}</span>
            {eyebrow.includes('·') ? <> · {eyebrow.split('·').slice(1).join('·').trim()}</> : null}
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl max-w-3xl">
            {h1}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            {subtitle}
          </p>
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

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-b border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§1</span> — How it works
          </p>
          <h2 className="mb-10 font-serif text-2xl font-medium text-ink">
            Three steps from open to done.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="relative flex flex-col gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline font-mono text-sm font-bold ${accentBg} ${accentColor}`}>
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-ink">{step.verb}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlights grid ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§2</span> — What you get
          </p>
          <h2 className="mb-10 font-serif text-2xl font-medium text-ink">
            Every detail that matters in practice.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="flex items-start gap-3 rounded-xl border border-hairline bg-paper-elevated p-5"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentBg}`}>
                  <h.Icon size={15} className={accentColor} />
                </span>
                <div>
                  <p className="font-mono text-sm font-bold text-ink">{h.label}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────────────────────── */}
      <section className="border-y border-hairline bg-paper-elevated/40 py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-gold">§3</span> — Who this is for
          </p>
          <h2 className="mb-8 font-serif text-2xl font-medium text-ink">
            Built for engineers who are serious about getting it right.
          </h2>
          <ul className="space-y-3">
            {forWho.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${accentBg}`}>
                  <Check size={11} className={accentColor} />
                </span>
                <span className="text-[14.5px] leading-relaxed text-ink-muted">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              href={ctaHref}
              className={`inline-flex items-center gap-2 rounded-lg border border-hairline-strong px-5 py-2.5 text-sm font-semibold transition-all hover:border-brand/40 ${accentColor}`}
            >
              {ctaLabel} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <FeatureFaq items={faq} />
      <FeatureCrossLinks exclude={exclude} />
    </div>
  )
}
