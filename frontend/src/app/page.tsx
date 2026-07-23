import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/marketing/LandingPageClient'
import { FAQS } from '@/components/marketing/faq-data'

const SITE_URL = 'https://lldcanvas.com'

// A server component so this route can carry its own rich metadata + JSON-LD —
// the interactive landing page itself is 'use client' (motion, state, hooks)
// and lives in LandingPageClient, which Next.js can't export page metadata from.
export const metadata: Metadata = {
  // `title.absolute` bypasses the root layout's `%s — LLDCanvas` template —
  // the brand name is already the lead word here, so templating would print
  // "…Platform — LLDCanvas" twice in the actual <title> tag.
  title: { absolute: 'LLDCanvas — Free LLD & System Design Interview Preparation Platform' },
  description:
    'Prepare for Low-Level Design (LLD) and system design interviews for free: a UML class diagram editor, 23 pre-wired design patterns, SOLID principles notes, 100+ curated LLD interview questions with community discussion, timed Interview Mode with analytics, a plain-English code↔diagram language, multi-language code execution, and real-time collaboration — all in one platform.',
  keywords: [
    'LLD interview', 'low level design interview', 'LLD interview preparation', 'LLD interview practice',
    'LLD course', 'free LLD course', 'learn low level design', 'low level design tutorial',
    'low level design examples', 'low level design questions', 'low level design problems', 'low level design practice',
    'system design interview', 'system design preparation', 'system design practice', 'system design course',
    'free system design course', 'system design questions',
    'object-oriented design', 'OOP design interview', 'design patterns', 'SOLID principles',
    'software design interview', 'SDE interview preparation', 'software engineering interview preparation',
    'UML diagram editor', 'class diagram tool', 'interview mode timer', 'real-time collaboration diagram tool',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'LLDCanvas — Free LLD & System Design Interview Preparation Platform',
    description:
      'A UML editor, 23 design patterns, SOLID principles notes, 100+ curated LLD interview questions, timed practice with analytics, revision notes, and runnable code — everything for your next LLD or system design interview.',
    type: 'website',
    siteName: 'LLDCanvas',
    url: '/',
    images: [{ url: '/LLDCanvas.png', width: 1774, height: 887, alt: 'LLDCanvas — Low-Level Design interview preparation platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLDCanvas — Free LLD & System Design Interview Prep',
    description: 'UML editor, design patterns, SOLID principles, LLD interview questions, timed practice, and runnable code — all in one place.',
    images: ['/LLDCanvas.png'],
  },
}

// Structured data as a single @graph so every entity (the org, the site, the
// app, the free curriculum, and the FAQ) links back to a shared @id instead
// of Google having to guess they describe the same page/brand.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'LLDCanvas',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/LLDCanvas.png`,
        width: 1774,
        height: 887,
      },
      description: 'LLDCanvas builds free tools for Low-Level Design and system design interview preparation.',
      sameAs: [
        'https://github.com/lldcanvas',
        'https://twitter.com/lldcanvas',
        'https://discord.gg/lldcanvas',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'LLDCanvas',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'LLDCanvas',
      url: SITE_URL,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'Interview Preparation',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      publisher: { '@id': `${SITE_URL}/#organization` },
      description:
        'A free, all-in-one Low-Level Design (LLD) and system design interview-prep platform: a UML class diagram editor, 23 pre-wired Gang-of-Four design patterns, timed Interview Mode with analytics, a curated library of 100+ LLD interview questions with community discussion, SOLID-principles revision notes, a plain-English code↔diagram language (Draft Notation), and multi-language code execution.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'UML class diagram editor (class, interface, enum, abstract class, note)',
        '7 UML relationship types',
        '23 pre-wired Gang-of-Four design pattern skeletons',
        '13 class-role stereotypes for object-oriented design',
        'Draft Notation — plain-English code to diagram',
        'Interview Mode — timed LLD and system design practice with streaks and analytics',
        '100+ curated LLD interview questions with community discussion',
        'SOLID principles and system design fundamentals revision notes',
        'Multi-language code execution (11 languages)',
        'PNG, SVG, PlantUML, Mermaid, and Draft export',
        'Real-time collaboration with live cursors and threaded @mention comments',
      ],
    },
    // Course — the free, self-paced LLD/system-design curriculum formed by the
    // problems library + revision notes + Interview Mode. Deliberately modest
    // (no fabricated ratings/enrollment counts, no certificate claims) so it
    // stays honest about what's actually offered.
    {
      '@type': 'Course',
      '@id': `${SITE_URL}/#course`,
      name: 'Free Low-Level Design & System Design Interview Preparation',
      description:
        'A free, self-paced curriculum covering Low-Level Design (LLD) and system-design-adjacent interview fundamentals: SOLID principles, the 23 Gang-of-Four design patterns, 100+ curated LLD interview questions from real companies, and timed practice with analytics.',
      provider: { '@id': `${SITE_URL}/#organization` },
      url: SITE_URL,
      isAccessibleForFree: true,
      inLanguage: 'en-US',
      about: ['Low-Level Design', 'System Design', 'Object-Oriented Design', 'Design Patterns', 'SOLID Principles'],
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'Self-paced',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQS.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

export default function Page() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingPageClient />
    </>
  )
}
