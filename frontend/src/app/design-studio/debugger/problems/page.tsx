'use client'

import { ProblemLibrary } from '@/components/studio/shell/ProblemLibrary'

export default function DebuggerProblemsPage() {
  return (
    <ProblemLibrary
      featureTitle="Design Debugger"
      featureSubtitle="Find and fix structural violations in UML designs"
      packType="debugger"
      attemptBasePath="/design-studio/debugger"
      overviewHref="/design-studio/debugger"
      overviewLabel="Design Debugger"
    />
  )
}
