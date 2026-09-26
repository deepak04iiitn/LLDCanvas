'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Flame, Loader2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { PackList } from '@/components/studio/challenges/PackList'
import {
  packIdOf,
  studioApi,
  type StudioPackSummary,
} from '@/lib/studio-api'
import { useSession } from '@/lib/auth'
import { useAuthModal } from '@/lib/auth-modal-store'

/** Seeded by day-of-year so it stays stable all day but rotates daily */
function getDailyPack(packs: StudioPackSummary[]): StudioPackSummary | null {
  if (packs.length === 0) return null
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return packs[dayOfYear % packs.length]
}

export function DebuggerListWithDaily() {
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
        const res = await studioApi.packs.list('debugger')
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
  }, [])

  const onStart = useCallback(
    async (pack: StudioPackSummary) => {
      if (!session) {
        openAuthModal(pathname, 'signin')
        return
      }
      const slug = pack.slug || packIdOf(pack)
      setStartingId(packIdOf(pack))
      try {
        router.push(`/design-studio/debugger/${encodeURIComponent(slug)}`)
      } catch (err) {
        toast.error((err as Error).message ?? 'Failed to open challenge')
        setStartingId(null)
      }
    },
    [openAuthModal, pathname, router, session],
  )

  const dailyPack = getDailyPack(packs)

  return (
    <CategoryShell
      title="Design Debugger"
      subtitle="Find flaws in authored broken designs"
      backHref="/design-studio"
      backLabel="Design Studio"
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* ── Daily Debug ── */}
        {!loading && dailyPack && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-amber-500" />
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Today's Challenge
              </h2>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-paper p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-paper">
              {/* Decorative flame */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-4 text-5xl opacity-10 select-none"
              >
                🔥
              </span>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex-1">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Daily Debug — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <h3 className="mt-1.5 font-serif text-xl font-medium text-ink">
                    {dailyPack.title}
                  </h3>
                  {dailyPack.description && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted max-w-lg">
                      {dailyPack.description}
                    </p>
                  )}
                  {dailyPack.tags && dailyPack.tags.length > 0 && (
                    <p className="mt-2 font-mono text-[10px] text-ink-faint">
                      {dailyPack.tags.join(' · ')}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={startingId === packIdOf(dailyPack)}
                  onClick={() => onStart(dailyPack)}
                  className="mt-4 inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-amber-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:mt-0"
                >
                  {startingId === packIdOf(dailyPack) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" fill="currentColor" />
                  )}
                  Debug Today
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── All Challenges ── */}
        <div>
          {!loading && packs.length > 0 && (
            <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              All Challenges
            </h2>
          )}
          <PackList
            packs={packs}
            loading={loading}
            startingId={startingId}
            onStart={onStart}
            emptyMessage="No debugger packs published yet. Ask an admin to seed or publish packs."
          />
        </div>
      </div>
    </CategoryShell>
  )
}
