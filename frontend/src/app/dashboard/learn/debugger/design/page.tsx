'use client'

import { Shield } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function DesignBugHuntPage() {
  return (
    <FeatureOverview
      sectionLabel="Learn"
      title="Design Bug Hunt"
      tagline="Spot structural violations in UML designs — the way interviewers test you"
      description="Each challenge shows you a broken UML class diagram. Your job is to identify which classes have structural violations: SRP violations, God Classes, wrong inheritance relationships, tight coupling, or missing abstractions. These are exactly what interviewers check when they ask 'What would you improve in this design?'"
      icon={Shield}
      accentBg="bg-violet-50"
      accentText="text-violet-600"
      howItWorks={[
        { step: 1, title: 'Study the UML diagram', description: 'Inspect the class diagram — look at relationships, responsibilities, and structure.' },
        { step: 2, title: 'Click to mark violations', description: 'Click any class node that has a structural violation and tag it with the issue type.' },
        { step: 3, title: 'Submit and review', description: 'Get scored on how many violations you correctly identified and missed.' },
      ]}
      skills={[
        { label: 'Diagram reading', description: 'Read and interpret UML class diagrams accurately and quickly.' },
        { label: 'Violation identification', description: 'Spot SRP, God Class, coupling, and relationship violations on sight.' },
        { label: 'Structural reasoning', description: 'Explain why a design choice is wrong and what the correct alternative is.' },
        { label: 'Pattern vocabulary', description: 'Build the vocabulary to discuss design quality in interview language.' },
      ]}
      interviewRelevance="'What's wrong with this design?' and 'How would you improve this?' are two of the most frequently asked LLD interview questions. Design Bug Hunt directly trains your eye to spot violations instantly and articulate them clearly — exactly the skill that separates good LLD candidates from great ones."
      exampleScenarios={[
        'Library system with a bloated manager class',
        'E-commerce Order class that inherits Customer',
        'Parking lot missing the Vehicle abstraction',
        'ATM class handling every responsibility itself',
      ]}
      problemsHref="/dashboard/learn/debugger/design/problems"
    />
  )
}
