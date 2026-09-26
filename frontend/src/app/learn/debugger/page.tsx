'use client'

import { Bug } from 'lucide-react'
import { FeatureOverview } from '@/components/studio/shell/FeatureOverview'

export default function CodeBugLabPage() {
  return (
    <FeatureOverview
      sectionLabel="Learn"
      title="Code Bug Lab"
      tagline="Hunt bugs in real LLD implementations and sharpen your code analysis skills"
      description="Each challenge gives you a broken implementation of a design pattern or LLD concept. The code compiles but has logical errors, wrong abstractions, or misapplied patterns. Find the bug, understand why it's wrong, and fix it. These are exactly the code-review questions interviewers ask."
      icon={Bug}
      accentBg="bg-red-50"
      accentText="text-red-600"
      howItWorks={[
        { step: 1, title: 'Read the broken code', description: 'Study an implementation that compiles but has structural or logical errors.' },
        { step: 2, title: 'Identify the bug', description: 'Find the root cause — wrong pattern, broken abstraction, or misapplied principle.' },
        { step: 3, title: 'Fix and explain', description: 'Submit the corrected code and articulate why the original was wrong.' },
      ]}
      skills={[
        { label: 'Code-level pattern recognition', description: 'Spot broken or misapplied design patterns in real code.' },
        { label: 'Root cause analysis', description: 'Diagnose the structural reason behind a code-level bug.' },
        { label: 'Implementation review', description: 'Evaluate whether code correctly implements its stated design intent.' },
        { label: 'Fix articulation', description: 'Explain your fix clearly — the interviewer is always listening.' },
      ]}
      interviewRelevance="Code review is a standard interview component at many companies. 'Here's an implementation of Observer pattern — what's wrong?' is a question that directly tests whether you understand both the pattern and its correct implementation. Code Bug Lab trains this exact skill."
      exampleScenarios={[
        'Broken Singleton with thread safety issue',
        'Observer pattern with memory leaks',
        'Factory method that violates OCP',
        'Strategy pattern with leaking implementation details',
      ]}
      problemsHref="/learn/debugger/problems"
    />
  )
}
