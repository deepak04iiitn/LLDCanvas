import { Suspense } from 'react'
import { OnboardingWizard } from '@/components/plannr/setup/OnboardingWizard'

export default function JourneySetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-paper">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  )
}
