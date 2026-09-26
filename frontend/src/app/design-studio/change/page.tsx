'use client'

import { Diff } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function ChangeOverviewPage() {
  return (
    <FeatureOverview
      title="Change One Thing"
      tagline="Handle requirement changes without breaking your architecture"
      description="A new requirement arrives mid-design. You must adapt your architecture to accommodate the change while minimising disruption. This trains the most important interview skill: designing for extensibility, not just functionality."
      icon={Diff}
      accentBg="bg-orange-50"
      accentText="text-orange-600"
      howItWorks={[
        { step: 1, title: 'Read the new requirement', description: 'A single change request arrives — a new constraint, feature, or business rule.' },
        { step: 2, title: 'Predict the blast radius', description: 'Before making changes, identify which parts of the design are affected.' },
        { step: 3, title: 'Adapt the design', description: 'Modify the architecture to accommodate the change cleanly and minimally.' },
      ]}
      skills={[
        { label: 'Open/Closed Principle', description: 'Design systems that extend without modification.' },
        { label: 'Blast radius analysis', description: 'Predict which components change when requirements change.' },
        { label: 'Extensibility planning', description: 'Build designs that anticipate future requirements.' },
        { label: 'Change impact articulation', description: 'Explain the trade-offs of different adaptation strategies.' },
      ]}
      interviewRelevance="'What if we also need to support X?' is the single most common follow-up question in LLD interviews. Change One Thing prepares you to anticipate this question, answer it confidently, and demonstrate that your design is genuinely extensible rather than just a snapshot."
      exampleScenarios={[
        'Add multi-currency support to payment system',
        'Support multiple notification channels',
        'Add audit logging to order management',
        'Support multiple authentication providers',
      ]}
      problemsHref="/design-studio/change/problems"
      packType="change_one"
    />
  )
}
