'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Layers, Loader2, SlidersHorizontal } from 'lucide-react'
import { packIdOf, studioApi, type StudioPackSummary } from '@/lib/studio-api'
import { useSession } from '@/lib/auth'
import { useAuthModal } from '@/lib/auth-modal-store'
import { ProblemCard, type ProblemStatus } from '@/components/studio/shell/ProblemCard'
import {
  FeatureInstructionsPanel,
  ProblemsInstructionsTabs,
} from '@/components/shared/FeatureInstructionsPanel'
import type { FeatureInstructionKey } from '@/lib/feature-instructions'
import { cn } from '@/lib/utils'

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

const DIFF_TABS: { id: DifficultyFilter; label: string }[] = [
  { id: 'all',    label: 'All' },
  { id: 'easy',   label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard',   label: 'Hard' },
]

const DIFF_COUNT_COLOR: Record<string, string> = {
  easy:   'text-emerald-600',
  medium: 'text-amber-600',
  hard:   'text-rose-600',
}

export interface ProblemLibraryProps {
  /** Feature display name — shown in the header */
  featureTitle: string
  /** Short subtitle */
  featureSubtitle?: string
  /** Studio pack type to fetch */
  packType: string
  /** Base path for session routes, e.g. "/design-studio/debugger" */
  attemptBasePath: string
  /** Link back to the feature overview */
  overviewHref: string
  /** Optional label for the overview breadcrumb */
  overviewLabel?: string
  /** Override the pack fetcher for non-studio features */
  packsLoader?: () => Promise<StudioPackSummary[]>
  /** When set, shows Problems | Instructions tabs with curated how-to copy */
  instructionKey?: FeatureInstructionKey
}

export function ProblemLibrary({
  featureTitle,
  featureSubtitle,
  packType,
  attemptBasePath,
  overviewHref,
  overviewLabel = 'Overview',
  packsLoader,
  instructionKey,
}: ProblemLibraryProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const { data: session }    = useSession()
  const { openAuthModal }    = useAuthModal()

  const [packs,      setPacks]      = useState<StudioPackSummary[]>([])
  const [loading,    setLoading]    = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('all')
  const [view, setView] = useState<'problems' | 'instructions'>('problems')

  // Load packs
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let data: StudioPackSummary[]
        if (packsLoader) {
          data = await packsLoader()
        } else {
          const res = await studioApi.packs.list(packType)
          data = res.packs ?? []
        }
        if (!cancelled) setPacks(data)
      } catch (err) {
        if (!cancelled) {
          toast.error((err as Error).message ?? 'Failed to load problems')
          setPacks([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [packType, packsLoader])

  const onStart = useCallback(async (pack: StudioPackSummary) => {
    if (!session) {
      openAuthModal(pathname, 'signin')
      return
    }
    if (pack.locked) {
      const need = pack.requiredPlan === 'ultimate' ? 'ultimate' : 'pro'
      router.push(`/pricing?from=${encodeURIComponent(String(packType))}_${need}`)
      return
    }
    const slug = pack.slug || packIdOf(pack)
    setStartingId(packIdOf(pack))
    try {
      router.push(`${attemptBasePath}/${encodeURIComponent(slug)}`)
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to open challenge')
      setStartingId(null)
    }
  }, [attemptBasePath, openAuthModal, packType, pathname, router, session])

  // Derived counts per difficulty
  const counts = { easy: 0, medium: 0, hard: 0 }
  packs.forEach(p => {
    const d = (p.difficulty ?? 'easy').toLowerCase()
    if (d in counts) counts[d as keyof typeof counts]++
  })

  // Filtered list
  const visible = diffFilter === 'all'
    ? packs
    : packs.filter(p => (p.difficulty ?? 'easy').toLowerCase() === diffFilter)

  return (
    <div className="h-full overflow-y-auto bg-paper">
      {/* Header */}
      <div className="border-b border-hairline bg-paper-elevated">
        <div className="mx-auto max-w-5xl px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-3 text-[12px] text-ink-faint">
            <Link href={overviewHref} className="hover:text-ink transition-colors">{overviewLabel}</Link>
            <span>/</span>
            <span className="text-ink-muted font-medium">Problems</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-2xl font-medium text-ink">{featureTitle}</h1>
              {featureSubtitle && <p className="text-[13px] text-ink-muted mt-0.5">{featureSubtitle}</p>}
            </div>
            <Link
              href={overviewHref}
              className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
            >
              <ArrowLeft size={13} />
              Back to Overview
            </Link>
          </div>

          {/* Stats strip */}
          {!loading && packs.length > 0 && (
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[12px] text-ink-faint">
                <Layers size={12} />
                <span>{packs.length} problems</span>
              </div>
              {(['easy', 'medium', 'hard'] as const).map(d => counts[d] > 0 && (
                <span key={d} className={cn('text-[12px] font-medium capitalize', DIFF_COUNT_COLOR[d])}>
                  {counts[d]} {d}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-0 flex items-end justify-between gap-4 flex-wrap">
          {instructionKey ? (
            <ProblemsInstructionsTabs view={view} onChange={setView} />
          ) : (
            <span />
          )}
          {view === 'problems' && !loading && packs.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <SlidersHorizontal size={12} className="text-ink-faint shrink-0 mr-1" />
              {DIFF_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDiffFilter(tab.id)}
                  className={cn(
                    'shrink-0 rounded-t-lg px-4 py-2.5 text-[12px] font-semibold transition-all border-b-2',
                    diffFilter === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-ink-muted hover:text-ink',
                  )}
                >
                  {tab.label}
                  {tab.id !== 'all' && counts[tab.id] > 0 && (
                    <span className="ml-1.5 text-[10px] text-ink-faint font-normal">({counts[tab.id]})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {instructionKey && view === 'instructions' ? (
          <FeatureInstructionsPanel featureKey={instructionKey} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={24} className="animate-spin text-ink-faint" />
            <p className="text-[13px] text-ink-faint">Loading problems…</p>
          </div>
        ) : packs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-elevated border border-hairline">
              <Layers size={22} className="text-ink-faint" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-ink">No problems yet</p>
              <p className="text-[13px] text-ink-muted mt-1">Problems for this feature will appear here once available.</p>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-[14px] font-medium text-ink">No {diffFilter} problems</p>
            <button onClick={() => setDiffFilter('all')} className="text-[13px] text-brand hover:underline">
              Show all problems
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(pack => (
              <ProblemCard
                key={packIdOf(pack)}
                pack={pack}
                status={'not_started' as ProblemStatus}
                isStarting={startingId === packIdOf(pack)}
                onStart={onStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
