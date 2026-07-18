import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/marketing/LandingPageClient'

// A server component so this route can carry its own rich metadata + JSON-LD —
// the interactive landing page itself is 'use client' (motion, state, hooks)
// and lives in LandingPageClient, which Next.js can't export page metadata from.
export const metadata: Metadata = {
  title: 'LLDCanvas — The All-in-One Low-Level Design Interview Platform',
  description:
    'Prepare for Low-Level Design (LLD) interviews with a UML class diagram editor, 23 pre-wired design patterns, timed Interview Mode with analytics, a curated problems library with community discussion, revision notes, a plain-English code↔diagram language, multi-language code execution, and real-time collaboration — all in one platform.',
  keywords: [
    'LLD interview prep', 'Low-Level Design', 'UML diagram editor', 'class diagram tool',
    'design patterns', 'system design interview', 'OOP interview questions',
    'interview mode timer', 'coding interview practice', 'LLD problems', 'software design interview',
    'real-time collaboration diagram tool',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'LLDCanvas — The All-in-One Low-Level Design Interview Platform',
    description:
      'A UML editor, 23 design patterns, timed practice with analytics, a problems library with community discussion, revision notes, and runnable code — everything for your next LLD interview.',
    type: 'website',
    siteName: 'LLDCanvas',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLDCanvas — The All-in-One Low-Level Design Interview Platform',
    description: 'UML editor, design patterns, timed practice, problems, revision notes, and runnable code — all in one place.',
  },
}

// Structured data (schema.org SoftwareApplication) — helps search engines
// understand this is a free, browser-based dev tool with a specific feature
// set, not just an arbitrary marketing page.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LLDCanvas',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description:
    'An all-in-one Low-Level Design interview platform: a UML class diagram editor, 23 pre-wired design patterns, timed Interview Mode with analytics, a curated problems library with community discussion, revision notes, a plain-English code↔diagram language (Draft Notation), and multi-language code execution.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'UML class diagram editor (class, interface, enum, abstract class, note)',
    '7 UML relationship types',
    '23 pre-wired design pattern skeletons',
    '13 class-role stereotypes',
    'Draft Notation — plain-English code to diagram',
    'Interview Mode — timed practice with streaks and analytics',
    'Curated LLD problems library with community discussion',
    'Revision notes library',
    'Multi-language code execution',
    'PNG, SVG, PlantUML, Mermaid, and Draft export',
    'Real-time collaboration with live cursors and threaded @mention comments',
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
