'use client'

import { ScanSearch } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function PatternDetectivePage() {
  return (
    <FeatureOverview
      sectionLabel="Learn"
      title="Pattern Detective"
      tagline="Identify design patterns hidden in real LLD implementations"
      description="Each challenge shows you a real-world scenario — a code snippet, a UML fragment, or a system description. Your job is to identify which design pattern is being used, explain why it fits, and understand the alternatives. This trains the pattern-recognition instinct that experienced engineers develop through years of code review."
      icon={ScanSearch}
      accentBg="bg-sky-50"
      accentText="text-sky-600"
      howItWorks={[
        { step: 1, title: 'Study the scenario', description: 'Read the scenario or inspect the code/diagram — what structural pattern do you see?' },
        { step: 2, title: 'Identify the pattern', description: 'Select the design pattern you recognise and explain your reasoning.' },
        { step: 3, title: 'Understand alternatives', description: 'Review which patterns were close alternatives and why this one was chosen.' },
      ]}
      skills={[
        { label: 'Pattern recognition', description: 'Identify GoF and architectural patterns on sight.' },
        { label: 'Pattern justification', description: 'Explain why a pattern fits a specific scenario.' },
        { label: 'Alternative pattern reasoning', description: 'Compare patterns and articulate trade-offs between similar choices.' },
        { label: 'Pattern vocabulary', description: 'Communicate clearly using standard pattern terminology.' },
      ]}
      interviewRelevance="'What pattern would you use here?' and 'Why not use Observer instead of Strategy?' are questions that reveal genuine pattern understanding versus memorisation. Pattern Detective trains recognition in real scenarios rather than isolated definitions."
      exampleScenarios={[
        'Identify the pattern in a notification dispatch system',
        'Spot Strategy vs Template Method in a payment processor',
        'Recognise Facade in a complex API gateway',
        'Detect Decorator vs inheritance in a file processing pipeline',
      ]}
      problemsHref="/learn/detective/problems"
    />
  )
}
