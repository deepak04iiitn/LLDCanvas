import type { Metadata } from 'next'
import { publicApi } from '@/lib/public-api'
import { InterviewQuestionsRosterClient } from '@/components/features/InterviewQuestionsRosterClient'
import { FeatureCrossLinks } from '@/components/features/FeatureCrossLinks'
import { FeatureFaq } from '@/components/features/FeatureFaq'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'LLD Interview Questions - 100+ Low-Level Design Practice Problems | LLDCanvas',
  description:
    'Browse 100+ curated Low-Level Design interview questions - from Parking Lot and ATM Machine to Uber and distributed rate limiters - with difficulty levels, real-world context, company tags, and community discussions. Free to browse, no sign-in required.',
  keywords: [
    'LLD interview questions', 'low level design problems', 'system design practice',
    'parking lot design', 'uber system design', 'design patterns interview',
    'object oriented design problems', 'LLD practice problems', 'class diagram interview',
    'software design interview prep',
  ],
  alternates: { canonical: '/features/interview-questions' },
  openGraph: {
    title: 'LLD Interview Questions - LLDCanvas',
    description: '100+ curated Low-Level Design problems with difficulty, companies, and community discussions.',
    type: 'website', url: '/features/interview-questions',
  },
}

const FAQ = [
  {
    q: 'Are these real interview questions?',
    a: 'Yes - every problem in the list has been reported by engineers who interviewed at the companies tagged on each problem. They reflect the actual vocabulary, scope, and constraints that interviewers use when asking LLD questions.',
  },
  {
    q: 'What is the difference between Easy, Medium, and Hard?',
    a: 'Easy problems involve a single well-defined system (Parking Lot, Vending Machine) where the class structure is mostly obvious. Medium problems involve multiple interacting subsystems or a non-trivial design decision. Hard problems require distributed thinking, concurrency handling, or a deep understanding of multiple design patterns working together.',
  },
  {
    q: 'Can I solve these problems in the LLDCanvas editor?',
    a: 'Yes - each problem page links directly to the editor so you can start drawing your UML class diagram immediately. Your diagram autosaves and you can share it with collaborators for a mock interview session.',
  },
  {
    q: 'Do I need an account to view the problems?',
    a: 'No - all problems are publicly visible. An account is needed to save your diagram solutions, access hints, join community discussions, and run code.',
  },
  {
    q: 'How are community discussions different from community solutions?',
    a: 'Discussions are freeform - you can ask questions, share partial ideas, paste code, or critique an approach. They are not scored or ranked. The goal is learning through dialogue, not upvotes.',
  },
]

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
        description: '100+ curated Low-Level Design interview problems with difficulty, companies, and community discussions.',
        numberOfItems: problems.length,
      }} />

      <InterviewQuestionsRosterClient problems={problems} />

      <FeatureFaq items={FAQ} />
      <FeatureCrossLinks exclude="/features/interview-questions" />
    </div>
  )
}
