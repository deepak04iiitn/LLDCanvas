import type { Metadata } from 'next'
import {
  FeatureSeoPage,
  buildFeatureMetadata,
} from '@/components/features/FeatureSeoShell'

export const metadata: Metadata = buildFeatureMetadata({
  slug: 'daily-lld-quiz',
  title: 'Daily LLD Quiz & Leaderboard | LLDCanvas',
  description:
    'Short daily Low-Level Design questions with a leaderboard — stay sharp between full practice sessions.',
  keywords: [
    'daily LLD quiz',
    'low level design quiz',
    'design patterns quiz',
    'LLD leaderboard',
  ],
})

export default function DailyLldQuizFeaturePage() {
  return (
    <FeatureSeoPage
      slug="daily-lld-quiz"
      title="Daily LLD Quiz - LLDCanvas"
      metaTitle={String(metadata.title)}
      description={String(metadata.description)}
      eyebrow="¶ Learn & Practice"
      headline={
        <>
          Ten questions a day.{' '}
          <span className="text-brand">Stay interview-ready.</span>
        </>
      }
      body="A short daily set covering patterns, SOLID, and LLD judgment calls — with a leaderboard so practice sticks."
      ctaHref="/dashboard/learn/quiz"
      ctaLabel="Take today's quiz"
      keywords={[]}
    />
  )
}
