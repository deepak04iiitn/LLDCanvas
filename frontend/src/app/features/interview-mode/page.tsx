import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { InterviewModePageClient } from '@/components/features/InterviewModePageClient'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Interview Mode - Timed LLD Practice Sessions | LLDCanvas',
  description:
    'Practice Low-Level Design under real interview pressure with LLDCanvas Interview Mode. Timed sessions with a countdown clock, daily streaks, a 365-day activity calendar, and post-session analytics. Build the habit that gets you hired.',
  keywords: [
    'LLD interview practice',
    'timed design interview',
    'low level design timer',
    'interview preparation habit',
    'system design practice sessions',
    'LLD practice streak',
    'software interview prep',
    'design interview simulation',
    'timed LLD practice',
    'interview mode',
    'LLD countdown timer',
    'daily streak practice',
    'low level design challenge',
  ],
  alternates: { canonical: '/features/interview-mode' },
  openGraph: {
    title: 'Interview Mode - Timed LLD Practice | LLDCanvas',
    description:
      'Timed practice sessions with daily streaks and analytics. Build the LLD habit that gets you hired.',
    type: 'website',
    url: '/features/interview-mode',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Mode | LLDCanvas',
    description:
      'Practice LLD under real interview pressure. Countdown clock, daily streaks, activity calendar, and full analytics.',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewModeFeaturePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Interview Mode - Timed LLD Practice',
        url: 'https://lldcanvas.com/features/interview-mode',
        description:
          'Timed practice sessions with streaks, activity calendar, and analytics for LLD interview preparation.',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Features', item: 'https://lldcanvas.com/features' },
          { '@type': 'ListItem', position: 2, name: 'Interview Mode', item: 'https://lldcanvas.com/features/interview-mode' },
        ],
      }} />

      <InterviewModePageClient />
    </>
  )
}
