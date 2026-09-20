'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { PackList } from '@/components/studio/challenges/PackList'
import {
  packIdOf,
  studioApi,
  type StudioPackSummary,
  type StudioPackType,
} from '@/lib/studio-api'
import { useSession } from '@/lib/auth'
import { useAuthModal } from '@/lib/auth-modal-store'

export interface ChallengeListPageProps {
  title: string
  subtitle: string
  packType: StudioPackType | string
  attemptBasePath: string
  emptyMessage?: string
}

export function ChallengeListPage({
  title,
  subtitle,
  packType,
  attemptBasePath,
  emptyMessage,
}: ChallengeListPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { openAuthModal } = useAuthModal()
  const [packs, setPacks] = useState<StudioPackSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.packs.list(packType)
        if (!cancelled) setPacks(res.packs ?? [])
      } catch (err) {
        if (!cancelled) {
          toast.error((err as Error).message ?? 'Failed to load packs')
          setPacks([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [packType])

  const onStart = useCallback(
    async (pack: StudioPackSummary) => {
      if (!session) {
        openAuthModal(pathname, 'signin')
        return
      }
      const id = packIdOf(pack)
      setStartingId(id)
      try {
        const res = await studioApi.start(packType, id)
        router.push(`${attemptBasePath}/${res.attemptId}`)
      } catch (err) {
        toast.error((err as Error).message ?? 'Failed to start challenge')
        setStartingId(null)
      }
    },
    [attemptBasePath, openAuthModal, packType, pathname, router, session],
  )

  return (
    <CategoryShell
      title={title}
      subtitle={subtitle}
      backHref="/design-studio"
      backLabel="Design Studio"
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <PackList
          packs={packs}
          loading={loading}
          startingId={startingId}
          onStart={onStart}
          emptyMessage={emptyMessage}
        />
      </div>
    </CategoryShell>
  )
}
