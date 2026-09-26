'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2, Microscope, Network, Play } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  packIdOf,
  studioApi,
  type StudioPackSummary,
} from '@/lib/studio-api'
import { useSession } from '@/lib/auth'
import { useAuthModal } from '@/lib/auth-modal-store'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'microscope' | 'depweb'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'microscope', label: 'Microscope' },
  { id: 'depweb', label: 'Dependency Web' },
]

const PACK_TYPE_BADGE: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  microscope: {
    label: 'Microscope',
    icon: <Microscope size={10} />,
    className: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  depweb: {
    label: 'Dep. Web',
    icon: <Network size={10} />,
    className: 'bg-sky-100 text-sky-700 border-sky-200',
  },
}

const DIFFICULTY_TONE: Record<string, string> = {
  easy: 'text-emerald-700',
  medium: 'text-amber-700',
  hard: 'text-rose-700',
}

const ATTEMPT_BASE: Record<string, string> = {
  microscope: '/design-studio/microscope',
  depweb: '/design-studio/depweb',
}

function PackCard({
  pack,
  busy,
  onStart,
}: {
  pack: StudioPackSummary
  busy: boolean
  onStart: (pack: StudioPackSummary) => void
}) {
  const badge = PACK_TYPE_BADGE[pack.type] ?? null

  return (
    <li className="flex flex-col rounded-xl border border-hairline bg-paper-elevated p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-serif text-base font-medium text-ink">{pack.title}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {badge && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide',
                badge.className,
              )}
            >
              {badge.icon}
              {badge.label}
            </span>
          )}
          <span
            className={cn(
              'font-mono text-[9px] font-semibold uppercase tracking-wide',
              DIFFICULTY_TONE[pack.difficulty] ?? 'text-ink-faint',
            )}
          >
            {pack.difficulty}
          </span>
        </div>
      </div>
      {pack.description && (
        <p className="mb-3 flex-1 text-[13px] leading-relaxed text-ink-muted">
          {pack.description}
        </p>
      )}
      {pack.tags && pack.tags.length > 0 && (
        <p className="mb-4 font-mono text-[10px] text-ink-faint">{pack.tags.join(' · ')}</p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => onStart(pack)}
        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5" fill="currentColor" />
        )}
        {busy ? 'Starting…' : 'Start'}
      </button>
    </li>
  )
}

export default function ArchitectureAnalysisPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { openAuthModal } = useAuthModal()

  const [microscopePacks, setMicroscopePacks] = useState<StudioPackSummary[]>([])
  const [depwebPacks, setDepwebPacks] = useState<StudioPackSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [mRes, dRes] = await Promise.all([
          studioApi.packs.list('microscope'),
          studioApi.packs.list('depweb'),
        ])
        if (!cancelled) {
          setMicroscopePacks(mRes.packs ?? [])
          setDepwebPacks(dRes.packs ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          toast.error((err as Error).message ?? 'Failed to load packs')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const visiblePacks: StudioPackSummary[] =
    activeTab === 'all'
      ? [...microscopePacks, ...depwebPacks]
      : activeTab === 'microscope'
        ? microscopePacks
        : depwebPacks

  const onStart = useCallback(
    async (pack: StudioPackSummary) => {
      if (!session) {
        openAuthModal(pathname, 'signin')
        return
      }
      const slug = pack.slug || packIdOf(pack)
      const base = ATTEMPT_BASE[pack.type] ?? '/design-studio/microscope'
      setStartingId(packIdOf(pack))
      try {
        router.push(`${base}/${encodeURIComponent(slug)}`)
      } catch (err) {
        toast.error((err as Error).message ?? 'Failed to open challenge')
        setStartingId(null)
      }
    },
    [openAuthModal, pathname, router, session],
  )

  return (
    <CategoryShell
      title="Architecture Analysis"
      subtitle="Guided investigation — coupling, dependency cycles, and responsibility analysis"
      backHref="/design-studio"
      backLabel="Design Studio"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Tab strip */}
        <div className="mb-6 flex gap-1 rounded-lg border border-hairline bg-paper-elevated p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pack list */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-[13px]">Loading packs…</span>
          </div>
        ) : visiblePacks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-ink-muted">No challenges published yet.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visiblePacks.map(pack => (
              <PackCard
                key={`${pack.type}-${packIdOf(pack)}`}
                pack={pack}
                busy={startingId === packIdOf(pack)}
                onStart={onStart}
              />
            ))}
          </ul>
        )}
      </div>
    </CategoryShell>
  )
}
