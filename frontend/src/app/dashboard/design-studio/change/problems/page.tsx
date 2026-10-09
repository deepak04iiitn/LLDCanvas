'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Flame, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { packIdOf, studioApi, type StudioPackSummary } from '@/lib/studio-api'
import { useSession } from '@/lib/auth'
import { useAuthModal } from '@/lib/auth-modal-store'
import { cn } from '@/lib/utils'
import {
  FeatureInstructionsPanel,
  ProblemsInstructionsTabs,
} from '@/components/shared/FeatureInstructionsPanel'

// ── Constants ─────────────────────────────────────────────────────────────────

type Diff = 'all' | 'easy' | 'medium' | 'hard'

const DIFF_DOT: Record<string, string> = {
  easy:   'bg-emerald-400',
  medium: 'bg-amber-400',
  hard:   'bg-rose-500',
}

const DIFF_TEXT: Record<string, string> = {
  easy:   'text-emerald-600',
  medium: 'text-amber-600',
  hard:   'text-rose-600',
}

// Stable within a day, rotates daily
function getDailyPack(packs: StudioPackSummary[]): StudioPackSummary | null {
  if (!packs.length) return null
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  )
  return packs[dayOfYear % packs.length]
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChangeProblemsPage() {
  const router   = useRouter()
  const pathname = usePathname()
  const { data: session }  = useSession()
  const { openAuthModal }  = useAuthModal()

  const [packs,      setPacks]      = useState<StudioPackSummary[]>([])
  const [loading,    setLoading]    = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [diff,       setDiff]       = useState<Diff>('all')
  const [view,       setView]       = useState<'problems' | 'instructions'>('problems')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.packs.list('change_one')
        if (!cancelled) setPacks(res.packs ?? [])
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load problems')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const onStart = useCallback(async (pack: StudioPackSummary) => {
    if (!session) { openAuthModal(pathname, 'signin'); return }
    const slug = pack.slug || packIdOf(pack)
    setStartingId(packIdOf(pack))
    try {
      router.push(`/dashboard/design-studio/change/${encodeURIComponent(slug)}`)
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to open challenge')
      setStartingId(null)
    }
  }, [openAuthModal, pathname, router, session])

  // Counts
  const counts = { all: packs.length, easy: 0, medium: 0, hard: 0 }
  packs.forEach(p => {
    const d = (p.difficulty ?? 'easy').toLowerCase()
    if (d in counts) counts[d as keyof typeof counts]++
  })

  const daily   = getDailyPack(packs)
  const dailyId = daily ? packIdOf(daily) : null

  const visible = (diff === 'all' ? packs : packs.filter(
    p => (p.difficulty ?? 'easy').toLowerCase() === diff,
  )).filter(p => packIdOf(p) !== dailyId)

  const showDaily = !!daily && (diff === 'all' || (daily.difficulty ?? 'easy').toLowerCase() === diff)

  return (
    <div className="h-full flex flex-col overflow-hidden bg-paper">

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="shrink-0 sticky top-0 z-20 border-b border-hairline bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 pt-3.5 pb-0">

          {/* Top row: breadcrumb + stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <Link href="/dashboard/design-studio/change" className="hover:text-ink transition-colors">
                Change One Thing
              </Link>
              <span>/</span>
              <span className="text-ink-muted">Problems</span>
            </div>

            {!loading && packs.length > 0 && (
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-ink-faint">{counts.all} total</span>
                {counts.easy   > 0 && <span className="text-emerald-600">{counts.easy} easy</span>}
                {counts.medium > 0 && <span className="text-amber-600">{counts.medium} medium</span>}
                {counts.hard   > 0 && <span className="text-rose-600">{counts.hard} hard</span>}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <ProblemsInstructionsTabs view={view} onChange={setView} />
            {view === 'problems' && !loading && packs.length > 0 && (
              <div className="flex items-center gap-0">
                {(['all', 'easy', 'medium', 'hard'] as Diff[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDiff(d)}
                    className={cn(
                      'px-4 py-2.5 text-[12px] font-medium capitalize border-b-2 transition-all',
                      diff === d
                        ? 'border-ink text-ink'
                        : 'border-transparent text-ink-faint hover:text-ink-muted',
                    )}
                  >
                    {d}
                    {d !== 'all' && counts[d] > 0 && (
                      <span className="ml-1 font-mono text-[10px] font-normal opacity-50">
                        ({counts[d]})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">

          {view === 'instructions' && (
            <FeatureInstructionsPanel featureKey="studio-change" />
          )}


          {view === 'problems' && loading && (
            <div className="flex items-center justify-center py-32 gap-2.5 text-ink-faint">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[13px]">Loading problems…</span>
            </div>
          )}

          {view === 'problems' && !loading && packs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-2">
              <p className="text-[15px] font-medium text-ink">No problems yet</p>
              <p className="text-[13px] text-ink-muted">Problems will appear here once published.</p>
            </div>
          )}

          {view === 'problems' && !loading && packs.length > 0 && !showDaily && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <p className="text-[14px] font-medium text-ink">No {diff} problems</p>
              <button
                onClick={() => setDiff('all')}
                className="text-[13px] text-ink-faint hover:text-ink transition-colors underline-offset-2 hover:underline"
              >
                Show all problems
              </button>
            </div>
          )}

          {view === 'problems' && !loading && packs.length > 0 && (showDaily || visible.length > 0) && (
            <>
              {/* Today's pick */}
              {showDaily && daily && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame size={11} className="text-amber-500 shrink-0" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                      Today&apos;s pick
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-ink-faint">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStart(daily)}
                    disabled={!!startingId}
                    className="group w-full text-left rounded-2xl border border-hairline bg-paper-elevated px-6 py-5 hover:border-ink/20 hover:bg-paper transition-all disabled:opacity-60"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={cn('h-2 w-2 rounded-full shrink-0', DIFF_DOT[(daily.difficulty ?? 'easy').toLowerCase()] ?? 'bg-ink/20')} />
                          <span className={cn('font-mono text-[10px] font-semibold uppercase tracking-[0.1em]', DIFF_TEXT[(daily.difficulty ?? 'easy').toLowerCase()] ?? 'text-ink-faint')}>
                            {daily.difficulty ?? 'Easy'}
                          </span>
                        </div>
                        <h3 className="font-serif text-[20px] font-medium text-ink leading-snug mb-2 group-hover:text-brand transition-colors">
                          {daily.title}
                        </h3>
                        {daily.description && (
                          <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 max-w-2xl">
                            {daily.description}
                          </p>
                        )}
                        {daily.tags && daily.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3.5">
                            {daily.tags.slice(0, 5).map(tag => (
                              <span key={tag} className="font-mono text-[10px] text-ink-faint border border-hairline rounded px-1.5 py-0.5 uppercase tracking-wide">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-ink text-paper group-hover:bg-ink/80 transition-colors mt-0.5">
                        {startingId === dailyId
                          ? <Loader2 size={14} className="animate-spin" />
                          : <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />}
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Problem rows */}
              {visible.length > 0 && (
                <>
                  {showDaily && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-3">
                      All problems
                    </p>
                  )}
                  <div className="rounded-2xl border border-hairline overflow-hidden">
                    {visible.map((pack, i) => {
                      const id   = packIdOf(pack)
                      const d    = (pack.difficulty ?? 'easy').toLowerCase()
                      const last = i === visible.length - 1
                      return (
                        <button
                          key={id}
                          type="button"
                          disabled={!!startingId}
                          onClick={() => onStart(pack)}
                          className={cn(
                            'group w-full text-left flex items-center gap-5 px-6 py-4 transition-colors hover:bg-paper-elevated',
                            !last && 'border-b border-hairline',
                            startingId === id && 'opacity-60 pointer-events-none',
                          )}
                        >
                          <span className="font-mono text-[11px] text-ink-faint shrink-0 w-5 text-right select-none">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', DIFF_DOT[d] ?? 'bg-ink/20')} />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-[14px] font-medium text-ink leading-snug truncate group-hover:text-brand transition-colors">
                              {pack.title}
                            </p>
                            {pack.tags && pack.tags.length > 0 && (
                              <p className="mt-0.5 font-mono text-[10px] text-ink-faint truncate">
                                {pack.tags.slice(0, 4).map(t => t.toUpperCase()).join(' · ')}
                              </p>
                            )}
                          </div>
                          <span className={cn('font-mono text-[11px] capitalize shrink-0 hidden sm:block', DIFF_TEXT[d] ?? 'text-ink-faint')}>
                            {pack.difficulty ?? 'easy'}
                          </span>
                          {startingId === id
                            ? <Loader2 size={13} className="animate-spin text-ink-faint shrink-0" />
                            : <ArrowRight size={14} className="text-ink-faint shrink-0 group-hover:translate-x-0.5 group-hover:text-ink transition-all" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
