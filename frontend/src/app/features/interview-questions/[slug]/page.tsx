import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, Lock, Sparkles, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicApi, DIFF_META } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export async function generateStaticParams() {
  const res = await publicApi.problems.list()
  return (res?.problems ?? []).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const res = await publicApi.problems.get(slug)
  if (!res) return { title: 'Question not found' }
  const { problem } = res
  const title = `Design ${problem.title} — LLD Interview Question`
  return {
    title,
    description: `${problem.description} A ${problem.difficulty} Low-Level Design question asked by ${problem.companies.slice(0, 3).join(', ') || 'top tech companies'}.`,
    alternates: { canonical: `/features/interview-questions/${slug}` },
    openGraph: { title, type: 'article', url: `/features/interview-questions/${slug}` },
  }
}

export default async function InterviewQuestionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await publicApi.problems.get(slug)
  if (!res) notFound()
  const { problem, related } = res
  const m = DIFF_META[problem.difficulty]

  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `Design ${problem.title}`,
        description: problem.description,
        articleSection: problem.category,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Interview Questions', item: 'https://lldcanvas.com/features/interview-questions' },
          { '@type': 'ListItem', position: 2, name: problem.title, item: `https://lldcanvas.com/features/interview-questions/${slug}` },
        ],
      }} />

      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
        {/* Breadcrumb */}
        <p className="mb-6 font-mono text-[11px] text-ink-faint">
          <Link href="/features/interview-questions" className="hover:text-brand">Interview Questions</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-muted">{problem.title}</span>
        </p>

        {/* Header */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ring-1',
            m.bg, m.color, m.ring,
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
            {problem.difficulty}
          </span>
          <span className="rounded-md border border-hairline bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-faint">
            {problem.category}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl">
          Design {problem.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">{problem.description}</p>

        {/* Why asked */}
        {problem.whyAsked && (
          <div className="mt-8 rounded-xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              <Sparkles className="h-3 w-3 text-gold" /> Why this is commonly asked
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">{problem.whyAsked}</p>
          </div>
        )}

        {/* Real-world + learning objectives */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {problem.realWorldApplications.length > 0 && (
            <div>
              <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                Real-World Applications
              </h2>
              <ul className="space-y-2">
                {problem.realWorldApplications.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {problem.learningObjectives.length > 0 && (
            <div>
              <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                Learning Objectives
              </h2>
              <ul className="space-y-2">
                {problem.learningObjectives.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Concepts + companies */}
        {problem.tags.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Concepts Covered</h2>
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map(t => (
                <span key={t} className="rounded-full border border-hairline bg-paper px-2.5 py-1 font-mono text-[11px] text-ink-muted">#{t}</span>
              ))}
            </div>
          </div>
        )}
        {problem.companies.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              <Building2 className="h-3 w-3" /> Asked By
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {problem.companies.map(c => (
                <span key={c} className="rounded-md border border-hairline bg-paper px-2 py-1 font-mono text-[11px] text-ink-muted">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements teaser — locked */}
        <div className="mt-10 rounded-xl border border-hairline bg-paper-elevated p-6">
          <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            What You&apos;ll Design
          </h2>
          {problem.firstFunctionalRequirement && (
            <p className="mb-3 flex items-start gap-2 text-sm text-ink-muted">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
              {problem.firstFunctionalRequirement}
            </p>
          )}
          <div className="relative overflow-hidden rounded-lg border border-hairline bg-paper px-4 py-5">
            <div aria-hidden className="space-y-2 blur-[3px] select-none">
              <div className="h-2.5 w-[85%] rounded bg-hairline-strong" />
              <div className="h-2.5 w-[70%] rounded bg-hairline-strong" />
              <div className="h-2.5 w-[90%] rounded bg-hairline-strong" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper/70 backdrop-blur-[1px]">
              <Lock className="h-4 w-4 text-ink-muted" />
              <p className="text-center text-xs font-medium text-ink-muted">
                {problem.functionalCount} functional + {problem.nonFunctionalCount} non-functional requirements
                <br />unlocked when you start solving
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-brand/20 bg-brand-tint px-8 py-10 text-center">
          <p className="text-lg font-semibold text-ink">Ready to design it yourself?</p>
          <p className="max-w-sm text-sm text-ink-muted">
            Sign in to see the full requirements, get staged hints, and design it on the same
            canvas used across the platform.
          </p>
          <Link
            href={`/dashboard/problems/${slug}`}
            className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-hover active:scale-95"
          >
            Start Solving <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              Related Questions in {problem.category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map(r => {
                const rm = DIFF_META[r.difficulty]
                return (
                  <Link
                    key={r.slug}
                    href={`/features/interview-questions/${r.slug}`}
                    className="rounded-lg border border-hairline bg-paper-elevated p-4 transition-colors hover:border-brand/30"
                  >
                    <span className={cn('mb-1.5 inline-block rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase', rm.bg, rm.color)}>
                      {r.difficulty}
                    </span>
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <FeatureCrossLinks />
    </div>
  )
}
