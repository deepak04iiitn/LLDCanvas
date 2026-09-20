'use client'

import { ChallengeListPage } from '@/components/studio/challenges/ChallengeListPage'

export default function DebuggerListPage() {
  return (
    <ChallengeListPage
      title="Design Debugger"
      subtitle="Find flaws in authored broken designs"
      packType="debugger"
      attemptBasePath="/design-studio/debugger"
      emptyMessage="No debugger packs published yet. Ask an admin to seed or publish packs."
    />
  )
}
