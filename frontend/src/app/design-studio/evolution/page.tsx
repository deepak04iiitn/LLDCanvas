'use client'

import { TrendingUp } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function EvolutionOverviewPage() {
  return (
    <FeatureOverview
      title="Architecture Evolution"
      tagline="Design systems that survive multi-stage growth under real pressures"
      description="Every real software system evolves through multiple generations. This feature simulates that journey: you start with a v1 design and must adapt it through successive waves of scale, new requirements, and organisational pressure — while managing technical debt and design quality at every stage."
      icon={TrendingUp}
      accentBg="bg-teal-50"
      accentText="text-teal-600"
      howItWorks={[
        { step: 1, title: 'Start with v1', description: 'Begin with a working initial design appropriate for the starting context.' },
        { step: 2, title: 'Face a new pressure', description: 'A new business or technical pressure arrives — scale, new feature, team change.' },
        { step: 3, title: 'Evolve the design', description: 'Adapt the architecture, record your trade-offs, and manage any technical debt introduced.' },
      ]}
      skills={[
        { label: 'Evolutionary design thinking', description: 'Design for today while building foundations for tomorrow.' },
        { label: 'Technical debt management', description: 'Consciously accept, defer, or eliminate debt at each stage.' },
        { label: 'Trade-off articulation', description: 'Justify every structural decision with explicit reasoning.' },
        { label: 'Scale-aware architecture', description: 'Recognise which design decisions break under scale and why.' },
      ]}
      interviewRelevance="Senior LLD interviews often include: 'How would this design need to change at 10x scale?' or 'How would you handle adding this feature 6 months later?' Architecture Evolution is specifically designed for this question pattern — it builds your instinct for anticipating future change."
      exampleScenarios={[
        'Ride-sharing system evolving from city to global',
        'Payment processor evolving through compliance stages',
        'Content platform growing from startup to enterprise',
        'Messaging system evolving from 1:1 to group to broadcast',
      ]}
      problemsHref="/design-studio/evolution/problems"
      packType="evolution"
    />
  )
}
