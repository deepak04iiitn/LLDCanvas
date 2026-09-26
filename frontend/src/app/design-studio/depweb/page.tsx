'use client'

import { Network } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function DepWebOverviewPage() {
  return (
    <FeatureOverview
      title="Dependency Web"
      tagline="Map coupling hotspots and reason about change propagation in real systems"
      description="Every large system has hidden dependency webs — chains of coupling that make changes expensive and risky. Dependency Web makes these visible: you'll map the dependency graph, identify hotspots, find circular dependencies, and reason about which changes will cascade through the system."
      icon={Network}
      accentBg="bg-indigo-50"
      accentText="text-indigo-600"
      howItWorks={[
        { step: 1, title: 'Visualise the dependency graph', description: 'See all dependencies between components mapped as an interactive graph.' },
        { step: 2, title: 'Identify coupling hotspots', description: 'Find components with high fan-in or fan-out that indicate dangerous coupling.' },
        { step: 3, title: 'Reason about change paths', description: 'Trace how a change in one component propagates through the dependency graph.' },
      ]}
      skills={[
        { label: 'Dependency mapping', description: 'Build accurate mental models of component dependency structures.' },
        { label: 'Coupling hotspot detection', description: 'Identify components that are coupling bottlenecks in a system.' },
        { label: 'Change propagation reasoning', description: 'Predict which components are affected when a specific class changes.' },
        { label: 'Dependency inversion', description: 'Identify where dependency inversion would break problematic cycles.' },
      ]}
      interviewRelevance="'If we change this component, what breaks?' is a question that reveals whether you understand dependency relationships deeply. Dependency Web builds precisely this skill — you'll develop the ability to reason confidently about change propagation across any architecture."
      exampleScenarios={[
        'Map dependencies in a microservices e-commerce platform',
        'Find circular dependencies in a payment processing system',
        'Identify coupling hotspots in a ride-sharing backend',
        'Trace change propagation through a content management system',
      ]}
      problemsHref="/design-studio/depweb/problems"
      packType="depweb"
    />
  )
}
