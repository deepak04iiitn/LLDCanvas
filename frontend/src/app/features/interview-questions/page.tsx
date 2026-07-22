import type { Metadata } from 'next'
import { publicApi } from '@/lib/public-api'
import { InterviewQuestionsIndexClient } from '@/components/features/InterviewQuestionsIndexClient'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'LLD Interview Questions',
  description:
    'Browse 100+ curated Low-Level Design interview questions — from Parking Lot and ATM Machine to Uber and distributed rate limiters — with difficulty, real-world context, and companies known to ask them.',
  alternates: { canonical: '/features/interview-questions' },
  openGraph: { title: 'LLD Interview Questions — LLDCanvas', type: 'website', url: '/features/interview-questions' },
}

export default async function InterviewQuestionsIndexPage() {
  const res = await publicApi.problems.list()
  const problems = res?.problems ?? []

  return (
    <div className="overflow-hidden">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'LLD Interview Questions',
        url: 'https://lldcanvas.com/features/interview-questions',
        numberOfItems: problems.length,
      }} />

      <section className="border-b border-hairline px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-ink-faint uppercase">
            <span className="text-gold">¶04</span> — Interview Questions
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {problems.length}+ Low-Level Design questions, worked out.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            Every question that comes up in real LLD interviews — Parking Lot to Uber, ATM to
            distributed rate limiters — with difficulty, real-world context, and the companies
            known to ask it.
          </p>
        </div>
      </section>

      <div className="pt-8">
        <InterviewQuestionsIndexClient problems={problems} />
      </div>

      <FeatureCrossLinks exclude="/features/interview-questions" />
    </div>
  )
}
