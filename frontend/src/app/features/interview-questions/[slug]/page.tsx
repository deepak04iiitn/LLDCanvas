import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft, Lock, CheckCircle2, Globe, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicApi, DIFF_META } from '@/lib/public-api'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'
import { Reveal } from '@/components/features/Reveal'

// ─── Difficulty colour tokens ─────────────────────────────────────────────────

const DIFF_CONFIG = {
  easy:   { dot: 'bg-emerald-400', text: 'text-emerald-600', label: 'Foundational', num: '①' },
  medium: { dot: 'bg-amber-400',   text: 'text-amber-600',   label: 'Intermediate', num: '②' },
  hard:   { dot: 'bg-red-400',     text: 'text-red-600',     label: 'Advanced',     num: '③' },
}

const INDUSTRY_ICONS: Record<string, string> = {
  Transportation: '🚗', 'E-commerce': '🛒', Banking: '🏦', Fintech: '💳',
  'Social Media': '💬', Healthcare: '🏥', Streaming: '🎬', Infrastructure: '⚙️',
  Logistics: '📦', Productivity: '📋', Gaming: '🎮', Messaging: '💌',
  'Food-Tech': '🍕', Travel: '✈️', Education: '📚', 'Developer Tools': '🛠️',
  Retail: '🏪', Entertainment: '🎭', 'Ad-Tech': '📣', Hospitality: '🏨',
  Fitness: '💪', Storage: '🗄️', Marketplace: '🏬',
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const res = await publicApi.problems.list()
  return (res?.problems ?? []).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const res = await publicApi.problems.get(slug)
  if (!res) return { title: 'Question not found' }
  const { problem } = res
  const title = `Design ${problem.title} — LLD Interview Question | LLDCanvas`
  return {
    title,
    description: `${problem.description} A ${problem.difficulty} Low-Level Design question asked by ${problem.companies.slice(0, 3).join(', ') || 'top tech companies'}. Includes real-world applications, learning objectives, and a live UML canvas.`,
    keywords: [`design ${problem.title.toLowerCase()}`, 'LLD interview question', 'low level design', problem.category, ...problem.tags, ...problem.companies.slice(0, 4)],
    alternates: { canonical: `/features/interview-questions/${slug}` },
    openGraph: { title, type: 'article', url: `/features/interview-questions/${slug}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InterviewQuestionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await publicApi.problems.get(slug)
  if (!res) notFound()
  const { problem, related } = res

  const dc  = DIFF_CONFIG[problem.difficulty]
  const icon = INDUSTRY_ICONS[problem.category] ?? '⚡'

  return (
    <div className="overflow-hidden">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: `Design ${problem.title}`, description: problem.description, articleSection: problem.category }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Interview Questions', item: 'https://lldcanvas.com/features/interview-questions' },
          { '@type': 'ListItem', position: 2, name: problem.title, item: `https://lldcanvas.com/features/interview-questions/${slug}` },
        ],
      }} />

      {/* ══════════════════════════════ LAYER 0 — HERO ══════════════════════════ */}
      <section className="relative border-b border-hairline">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden
        />

        <Reveal className="relative mx-auto max-w-4xl px-6 pb-20 pt-10 text-center sm:px-8 sm:pt-14">
          {/* Back link */}
          <Link
            href="/features/interview-questions"
            className="mb-10 inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-faint transition-colors hover:text-brand"
          >
            <ArrowLeft size={12} /> All problems
          </Link>

          {/* Metadata strip */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className={cn('flex items-center gap-1.5 font-mono text-[11px] font-bold', dc.text)}>
              <span className={cn('h-2 w-2 rounded-full', dc.dot)} />
              {dc.label}
            </span>
            <span className="text-ink-faint/30">·</span>
            <span className="font-mono text-[11px] text-ink-faint">{icon} {problem.category}</span>
            {problem.companies.length > 0 && (
              <>
                <span className="text-ink-faint/30">·</span>
                <span className="font-mono text-[11px] text-ink-faint">
                  {problem.companies.slice(0, 3).join(' · ')}
                  {problem.companies.length > 3 && ` +${problem.companies.length - 3}`}
                </span>
              </>
            )}
          </div>

          {/* Huge title */}
          <h1 className="font-serif text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1.05] tracking-tight text-ink">
            Design<br />
            <span className={cn('italic', dc.text)}>{problem.title}</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-2xl text-[16px] leading-[1.8] text-ink-muted">
            {problem.description}
          </p>

          {/* Tags strip */}
          {problem.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {problem.tags.map(t => (
                <span key={t} className="rounded-full border border-hairline bg-paper-elevated px-3 py-1 font-mono text-[10px] text-ink-faint">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Quick CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/dashboard/problems/${slug}`}
              className="flex items-center gap-2 rounded-xl bg-brand px-7 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover active:scale-[0.98]"
            >
              Start Solving <ArrowRight size={14} />
            </Link>
            <span className="font-mono text-[11px] text-ink-faint">
              {problem.functionalCount}F + {problem.nonFunctionalCount}NF requirements inside
            </span>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════ LAYER 1 — WHY ASKED ═════════════════════ */}
      {problem.whyAsked && (
        <section className="border-b border-hairline py-20">
          <Reveal className="mx-auto max-w-4xl px-6 sm:px-8">
            <p className="mb-8 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
              <span className="text-gold">01</span> &nbsp;—&nbsp; Why interviewers ask this
            </p>
            <blockquote className="relative mx-auto max-w-2xl text-center">
              <span className="pointer-events-none absolute left-1/2 top-[-1.2rem] -translate-x-1/2 select-none font-serif text-[7rem] leading-none text-brand/10" aria-hidden>
                &ldquo;
              </span>
              <p className="relative font-serif text-[1.25rem] leading-[1.85] text-ink sm:text-[1.4rem]">
                {problem.whyAsked}
              </p>
            </blockquote>
          </Reveal>
        </section>
      )}

      {/* ══════════════════════════════ LAYER 2 — REAL-WORLD ════════════════════ */}
      {problem.realWorldApplications.length > 0 && (
        <section className="border-b border-hairline bg-paper-elevated/40 py-20">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <Reveal>
              <p className="mb-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
                <span className="text-gold">02</span> &nbsp;—&nbsp; Where this system exists in the real world
              </p>
              <p className="mb-12 text-center font-serif text-xl font-medium text-ink">
                You interact with this design every day.
              </p>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problem.realWorldApplications.map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand/20">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-lg">
                      <Globe size={16} className="text-brand" />
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink-muted">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════ LAYER 3 — OBJECTIVES ════════════════════ */}
      {problem.learningObjectives.length > 0 && (
        <section className="border-b border-hairline py-20">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <Reveal>
              <p className="mb-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
                <span className="text-gold">03</span> &nbsp;—&nbsp; What you'll master
              </p>
              <p className="mb-12 text-center font-serif text-xl font-medium text-ink">
                Solve this once. Know it forever.
              </p>
            </Reveal>
            <div className="mx-auto max-w-2xl space-y-4">
              {problem.learningObjectives.map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div className="flex items-start gap-5 rounded-2xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/20">
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[13px] font-black',
                      i === 0 ? 'border-brand text-brand bg-brand/5' : 'border-hairline-strong text-ink-faint',
                    )}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="pt-1.5">
                      <p className="text-[14px] leading-relaxed text-ink">{item}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════ LAYER 4 — REQUIREMENTS ═════════════════ */}
      <section className="border-b border-hairline bg-paper-elevated/40 py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
          <p className="mb-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
            <span className="text-gold">04</span> &nbsp;—&nbsp; What you'll design
          </p>
          <p className="mb-12 text-center font-serif text-xl font-medium text-ink">
            {problem.functionalCount} functional · {problem.nonFunctionalCount} non-functional requirements.
          </p>
          </Reveal>

          <Reveal delay={0.08}>
          <div className="mx-auto max-w-2xl space-y-3">
            {/* First visible requirement */}
            {problem.firstFunctionalRequirement && (
              <div className="flex items-start gap-4 rounded-2xl border border-brand/20 bg-white p-5 shadow-sm">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" />
                <p className="text-[14px] leading-relaxed text-ink">{problem.firstFunctionalRequirement}</p>
              </div>
            )}

            {/* Locked requirements */}
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white">
              {/* Blurred rows */}
              <div className="divide-y divide-hairline select-none" aria-hidden>
                {[88, 73, 95, 65, 80].map((w, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 blur-sm">
                    <div className="h-4.5 w-4.5 shrink-0 rounded-full bg-hairline-strong" />
                    <div className="h-3 rounded-full bg-hairline-strong" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>

              {/* Frosted glass overlay with curved top */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{
                  background: 'linear-gradient(to bottom, rgba(250,249,247,0) 0%, rgba(250,249,247,0.7) 20%, rgba(250,249,247,0.92) 100%)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-hairline bg-white shadow-md">
                    <Lock size={18} className="text-ink-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">
                      {problem.functionalCount - 1} more requirements inside
                    </p>
                    <p className="mt-1 text-[12px] text-ink-muted">
                      Sign in to unlock the full brief and start designing
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/problems/${slug}`}
                    className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-[13px] font-semibold text-brand-foreground transition-all hover:bg-brand-hover"
                  >
                    Unlock Requirements <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════ LAYER 5 — COMPANIES ═════════════════════ */}
      {problem.companies.length > 0 && (
        <section className="border-b border-hairline py-20">
          <Reveal className="mx-auto max-w-4xl px-6 text-center sm:px-8">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
              <span className="text-gold">05</span> &nbsp;—&nbsp; Companies that ask this
            </p>
            <p className="mb-10 font-serif text-xl font-medium text-ink">
              You may face this exact question in your next interview.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {problem.companies.map(c => (
                <div
                  key={c}
                  className="flex items-center gap-2.5 rounded-2xl border border-hairline bg-paper-elevated px-5 py-3 shadow-sm transition-all hover:border-brand/25 hover:shadow-md"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-hairline bg-white font-mono text-[11px] font-black text-ink">
                    {c[0]}
                  </div>
                  <span className="font-mono text-[13px] font-medium text-ink">{c}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ══════════════════════════════ LAYER 6 — CTA ═══════════════════════════ */}
      <section className="py-20">
        <Reveal className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ink-faint/60">
            Ready?
          </p>
          <h2 className="mb-4 font-serif text-[clamp(1.8rem,4vw,3rem)] font-medium text-ink">
            Open the canvas.<br />Design it yourself.
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            See all requirements, use staged hints, run your code,
            and compare with community discussions — all on the same canvas.
          </p>
          <Link
            href={`/dashboard/problems/${slug}`}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-brand px-10 py-4 text-base font-semibold text-brand-foreground shadow-xl shadow-brand/25 transition-all hover:bg-brand-hover hover:shadow-brand/30 active:scale-[0.98]"
          >
            Start Solving <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>

      {/* ══════════════════════════════ RELATED ═════════════════════════════════ */}
      {related.length > 0 && (
        <section className="border-t border-hairline bg-paper-elevated/40 py-16">
          <Reveal className="mx-auto max-w-4xl px-6 sm:px-8">
            <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink-faint">
              More in {problem.category}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map(r => {
                const rc = DIFF_CONFIG[r.difficulty]
                return (
                  <Link
                    key={r.slug}
                    href={`/features/interview-questions/${r.slug}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-hairline bg-white p-5 transition-all hover:border-brand/25 hover:shadow-md"
                  >
                    <span className={cn('flex items-center gap-1.5 font-mono text-[10px] font-bold', rc.text)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', rc.dot)} /> {rc.label}
                    </span>
                    <p className="flex-1 text-[13px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
                      {r.title}
                    </p>
                    <ChevronRight size={14} className="text-brand opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                )
              })}
            </div>
          </Reveal>
        </section>
      )}

      <FeatureCrossLinks />
    </div>
  )
}
