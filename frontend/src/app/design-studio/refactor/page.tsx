'use client'

import { GitBranch } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function RefactorOverviewPage() {
  return (
    <FeatureOverview
      title="Refactoring Mode"
      tagline="Transform messy designs into clean, extensible architecture"
      description="You receive a working but poorly-structured design. Your job is to refactor it — extract classes, reduce coupling, improve cohesion — without breaking existing behavior. Refactoring is the most common real-world LLD skill and one of the most revealing interview exercises."
      icon={GitBranch}
      accentBg="bg-blue-50"
      accentText="text-blue-600"
      howItWorks={[
        { step: 1, title: 'Study the original design', description: 'Understand the existing structure — what works, what is problematic.' },
        { step: 2, title: 'Refactor with constraints', description: 'Apply improvements while keeping all existing behavior contracts intact.' },
        { step: 3, title: 'Verify your improvements', description: 'Check that the design is cleaner, more extensible, and better structured.' },
      ]}
      skills={[
        { label: 'Extract class refactoring', description: 'Break large classes into focused, single-purpose components.' },
        { label: 'Interface extraction', description: 'Replace concrete dependencies with abstractions.' },
        { label: 'Behavior preservation', description: 'Refactor without breaking existing functionality.' },
        { label: 'Design improvement articulation', description: 'Explain your reasoning for every structural change.' },
      ]}
      interviewRelevance="Many interviews give you a design and ask you to improve it, then justify your changes. Refactoring Mode trains you to think systematically: what's wrong, how to fix it, why it matters, and how to explain it clearly to an interviewer."
      exampleScenarios={[
        'Monolithic UserService with 15 methods',
        'God Object controlling entire checkout flow',
        'Concrete dependencies preventing unit testing',
        'Mixed business logic and data access in one class',
      ]}
      problemsHref="/design-studio/refactor/problems"
      packType="refactor"
    />
  )
}
