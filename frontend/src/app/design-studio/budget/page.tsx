'use client'

import { DollarSign } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function BudgetOverviewPage() {
  return (
    <FeatureOverview
      title="Architecture Budget"
      tagline="Prioritise design investments under real financial and time constraints"
      description="You have a limited budget and a list of architectural investments — caching, sharding, rate limiting, circuit breakers, event sourcing, and more. You must choose wisely: which investments give you the highest architectural return? This builds the trade-off thinking that separates senior engineers from mid-levels."
      icon={DollarSign}
      accentBg="bg-amber-50"
      accentText="text-amber-600"
      howItWorks={[
        { step: 1, title: 'Receive your budget', description: 'You start with a fixed engineering budget and a system under a specific pressure.' },
        { step: 2, title: 'Evaluate investments', description: 'Browse available architectural improvements and understand their costs and benefits.' },
        { step: 3, title: 'Justify your choices', description: 'Submit your portfolio and explain why you prioritised these investments over others.' },
      ]}
      skills={[
        { label: 'Architectural trade-off reasoning', description: 'Weigh the cost vs. benefit of architectural improvements.' },
        { label: 'Pressure-specific thinking', description: 'Match architectural solutions to the actual problem context.' },
        { label: 'Technical investment articulation', description: 'Explain why an investment is worth its engineering cost.' },
        { label: 'Prioritisation under constraints', description: 'Choose the highest-value improvements when budget is limited.' },
      ]}
      interviewRelevance="'If you could only make three improvements to this design, what would they be and why?' This is an extremely common senior-level question. Architecture Budget directly trains your ability to prioritise, justify, and explain architectural trade-offs in a constrained context."
      exampleScenarios={[
        'Scale a monolith with $50k of engineering budget',
        'Improve a payment system under tight time constraints',
        'Harden a messaging system against failure modes',
        'Optimise a search service with limited infrastructure budget',
      ]}
      problemsHref="/design-studio/budget/problems"
      packType="budget"
    />
  )
}
