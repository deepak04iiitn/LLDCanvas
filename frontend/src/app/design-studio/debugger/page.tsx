'use client'

import { Wrench } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function DebuggerOverviewPage() {
  return (
    <FeatureOverview
      title="Design Debugger"
      tagline="Find and fix structural violations in broken UML designs"
      description="Each challenge gives you a broken class diagram with real LLD violations — God Classes, SRP violations, tight coupling, wrong inheritance. Your job is to detect what's broken, diagnose why, repair the design, and verify your fix. This mirrors exactly what interviewers ask when they say: 'What would you change about this design?'"
      icon={Wrench}
      accentBg="bg-violet-100"
      accentText="text-violet-600"
      howItWorks={[
        { step: 1, title: 'Detect violations', description: 'Study the broken diagram and mark nodes with structural issues.' },
        { step: 2, title: 'Diagnose the root cause', description: 'For each issue, explain which principle is violated and why.' },
        { step: 3, title: 'Repair and verify', description: 'Apply fixes to the design and confirm the violations are resolved.' },
      ]}
      skills={[
        { label: 'SRP & SOLID principles', description: 'Identify single-responsibility violations in real designs.' },
        { label: 'God Class recognition', description: 'Spot bloated classes that own too many responsibilities.' },
        { label: 'Coupling & cohesion', description: 'Understand tight coupling and how to decouple components.' },
        { label: 'Design repair', description: 'Practise restructuring broken designs into clean ones.' },
      ]}
      interviewRelevance="Interviewers frequently give you a design and ask 'What's wrong with this?' or 'How would you improve it?' This feature trains exactly that pattern — systematic detection, root-cause diagnosis, and confident repair. Candidates who can articulate why something is wrong and how to fix it stand out immediately."
      exampleScenarios={[
        'Library Management System with a God Class',
        'E-commerce Order that inherits Customer',
        'Notification service with tight coupling',
        'ATM class handling every responsibility itself',
      ]}
      problemsHref="/design-studio/debugger/problems"
      packType="debugger"
    />
  )
}
