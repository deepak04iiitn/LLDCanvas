'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { learnApi, type RunState } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

const RUN_STATUS: Record<string, { label: string; dot: string; text: string }> = {
  active:    { label: 'Active',    dot: 'bg-brand animate-pulse', text: 'text-brand'        },
  completed: { label: 'Completed', dot: 'bg-emerald-400',         text: 'text-emerald-600'  },
  failed:    { label: 'Failed',    dot: 'bg-rose-400',            text: 'text-rose-500'     },
  abandoned: { label: 'Abandoned', dot: 'bg-ink/20',              text: 'text-ink-faint'    },
}

export default function RoguelikeHistoryPage() {
  const [runs,         setRuns]         = useState<RunState[]>([])
  const [loading,      setLoading]      = useState(true)
  const [abandoningId, setAbandoningId] = useState<string | null>(null)
  const [confirmId,    setConfirmId]    = useState<string | null>(null)

  useEffect(() => {
    learnApi.roguelikeV2.listRuns()
      .then(res => setRuns(res.runs ?? []))
      .catch(e => toast.error(e instanceof Error ? e.message : 'Failed to load runs'))
      .finally(() => setLoading(false))
  }, [])

  // Dismiss confirm on outside click
  useEffect(() => {
    if (!confirmId) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('[data-abandon-btn]')) setConfirmId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [confirmId])

  const handleAbandon = useCallback(async (runId: string) => {
    if (confirmId !== runId) { setConfirmId(runId); return }
    setAbandoningId(runId)
    setConfirmId(null)
    try {
      await learnApi.roguelikeV2.endRun(runId)
      setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'abandoned' } : r))
      toast.success('Run abandoned')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to abandon run')
    } finally {
      setAbandoningId(null)
    }
  }, [confirmId])

  const activeRuns = runs.filter(r => r.status === 'active')
  const pastRuns   = runs.filter(r => r.status !== 'active')

  return (
    <div className="h-full flex flex-col overflow-hidden bg-paper">

      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <div className="shrink-0 sticky top-0 z-20 border-b border-hairline bg-paper/95 backdrop-blur-sm px-6 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            <Link href="/dashboard/learn/roguelike/problems" className="hover:text-ink transition-colors">
              LLD Roguelike
            </Link>
            <span>/</span>
            <span className="text-ink-muted">My Runs</span>
          </div>
          {!loading && (
            <span className="font-mono text-[11px] text-ink-faint">{runs.length} total</span>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">

          {loading && (
            <div className="flex items-center justify-center py-32 gap-2 text-ink-faint">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[13px]">Loading runs…</span>
            </div>
          )}

          {!loading && runs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
              <p className="text-[15px] font-medium text-ink">No runs yet</p>
              <p className="text-[13px] text-ink-muted">Start a scenario to see your run history here.</p>
              <Link
                href="/dashboard/learn/roguelike/problems"
                className="mt-2 text-[13px] font-medium text-ink hover:underline underline-offset-2 transition-colors"
              >
                Browse scenarios →
              </Link>
            </div>
          )}

          {/* Active runs */}
          {!loading && activeRuns.length > 0 && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-3">
                In progress
              </p>
              <div className="rounded-2xl border border-hairline overflow-hidden">
                {activeRuns.map((run, i) => (
                  <RunRow
                    key={run.id}
                    run={run}
                    isLast={i === activeRuns.length - 1}
                    abandoningId={abandoningId}
                    confirmId={confirmId}
                    onAbandon={handleAbandon}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past runs */}
          {!loading && pastRuns.length > 0 && (
            <div>
              {activeRuns.length > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-3">
                  Past runs
                </p>
              )}
              <div className="rounded-2xl border border-hairline overflow-hidden">
                {pastRuns.map((run, i) => (
                  <RunRow
                    key={run.id}
                    run={run}
                    isLast={i === pastRuns.length - 1}
                    abandoningId={abandoningId}
                    confirmId={confirmId}
                    onAbandon={handleAbandon}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Run row ───────────────────────────────────────────────────────────────────

function RunRow({
  run,
  isLast,
  abandoningId,
  confirmId,
  onAbandon,
}: {
  run: RunState
  isLast: boolean
  abandoningId: string | null
  confirmId: string | null
  onAbandon: (id: string) => void
}) {
  const st = RUN_STATUS[run.status] ?? RUN_STATUS.abandoned

  return (
    <div className={cn(
      'group flex items-center gap-4 px-6 py-4',
      !isLast && 'border-b border-hairline',
    )}>
      {/* Status dot */}
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', st.dot)} />

      {/* Main link */}
      <a
        href={`/dashboard/learn/roguelike/${run.id}`}
        className="flex flex-1 min-w-0 items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[14px] font-medium text-ink leading-snug truncate">
            {run.scenarioTitle}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
            Stage {run.currentStageOrder}/{run.stagesTotal}
            {' · '}
            <span className="uppercase tracking-wide">{run.mode}</span>
          </p>
        </div>
        <span className={cn('font-mono text-[11px] shrink-0 hidden sm:block', st.text)}>
          {st.label}
        </span>
        <ArrowRight size={14} className="text-ink-faint shrink-0 group-hover:translate-x-0.5 group-hover:text-ink transition-all" />
      </a>

      {/* Abandon (active runs only) */}
      {run.status === 'active' && (
        <button
          type="button"
          data-abandon-btn
          onClick={() => onAbandon(run.id)}
          disabled={abandoningId === run.id}
          title={confirmId === run.id ? 'Click again to confirm' : 'Abandon run'}
          className={cn(
            'shrink-0 flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[10px] transition-all',
            confirmId === run.id
              ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-transparent text-ink-faint opacity-0 group-hover:opacity-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500',
            abandoningId === run.id && 'opacity-40 pointer-events-none',
          )}
        >
          {abandoningId === run.id
            ? <Loader2 size={11} className="animate-spin" />
            : <Trash2 size={11} />}
          {confirmId === run.id ? 'Confirm?' : ''}
        </button>
      )}
    </div>
  )
}
