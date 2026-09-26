'use client'

import { ZoomIn } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function MicroscopeOverviewPage() {
  return (
    <FeatureOverview
      title="Architecture Microscope"
      tagline="Zoom into any design and analyse it at every level of abstraction"
      description="Architecture Microscope gives you structured lenses to inspect a design from multiple angles — system level, service level, class level, and interaction level. Each lens reveals different structural properties: coupling, cohesion, responsibility distribution, and dependency flow."
      icon={ZoomIn}
      accentBg="bg-purple-50"
      accentText="text-purple-600"
      howItWorks={[
        { step: 1, title: 'Choose an investigation lens', description: 'Select from system overview, coupling analysis, cohesion map, or responsibility view.' },
        { step: 2, title: 'Inspect the design', description: 'Navigate through the design guided by structured investigation protocols.' },
        { step: 3, title: 'Document findings', description: 'Record observations, flag issues, and build a structured analysis report.' },
      ]}
      skills={[
        { label: 'Structural analysis', description: 'Break down any design into its structural properties systematically.' },
        { label: 'Coupling measurement', description: 'Identify and quantify coupling hotspots in real designs.' },
        { label: 'Cohesion reasoning', description: 'Assess whether each component has a clear, focused responsibility.' },
        { label: 'Investigation methodology', description: 'Apply a consistent analytical framework to any new design.' },
      ]}
      interviewRelevance="When shown a design in an interview, top candidates don't just react — they systematically analyse. Microscope builds this habit: you'll learn to approach any design with a structured investigation protocol rather than gut-feel observations."
      exampleScenarios={[
        'Analyse a ride-sharing system for coupling hotspots',
        'Inspect a payment service for responsibility violations',
        'Map cohesion across a messaging platform',
        'Identify abstraction layers in an e-commerce platform',
      ]}
      problemsHref="/design-studio/microscope/problems"
      packType="microscope"
    />
  )
}
