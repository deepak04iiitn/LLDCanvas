'use client'

import { Eye } from 'lucide-react'
import { useCollab } from '@/contexts/CollabContext'

export function ViewerBanner() {
  const { myRole } = useCollab()

  if (myRole !== 'viewer') return null

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-amber-200 bg-amber-50 px-4 text-xs text-amber-800 sm:px-6">
      <div className="flex items-center gap-2">
        <Eye size={13} className="shrink-0" />
        <span>You&apos;re viewing this diagram in read-only mode.</span>
      </div>
      <span className="text-amber-600">Contact the owner to request edit access.</span>
    </div>
  )
}
