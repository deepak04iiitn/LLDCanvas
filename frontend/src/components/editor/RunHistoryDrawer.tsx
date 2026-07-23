'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, History, Clock, MemoryStick, CheckCircle2,
  AlertCircle, RotateCcw, ChevronLeft, ChevronRight,
  ScrollText, RefreshCw, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RunEntry {
  _id: string
  language: string
  status: 'success' | 'error'
  exitCode: number
  executionMs: number
  memoryKb: number
  codeLength: number
  code?: string
  problemSlug?: string
  createdAt: string
}

interface RunHistoryDrawerProps {
  open: boolean
  onClose: () => void
  problemSlug?: string
  /** Called when user clicks "Restore" on a run entry */
  onRestoreCode: (code: string, language: string) => void
  /** Increment this counter externally after each run to auto-refresh the list */
  runCount?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  'python-3.14':     'Python',
  'gcc-15':          'C',
  'g++-15':          'C++',
  'openjdk-25':      'Java',
  'dotnet-csharp-9': 'C#',
  'dotnet-fsharp-9': 'F#',
  'php-8.5':         'PHP',
  'ruby-4.0':        'Ruby',
  'haskell-9.12':    'Haskell',
  'go-1.26':         'Go',
  'rust-1.93':       'Rust',
  'typescript-deno': 'TypeScript',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60)  return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Run Card ─────────────────────────────────────────────────────────────────

function RunCard({
  run,
  index,
  total,
  page,
  limit,
  onRestore,
}: {
  run: RunEntry
  index: number
  total: number
  page: number
  limit: number
  onRestore: (code: string, language: string) => void
}) {
  const runNumber = total - (page - 1) * limit - index
  const isSuccess = run.status === 'success'
  const previewLines = run.code?.split('\n').slice(0, 4) ?? []
  const hasMore = (run.code?.split('\n').length ?? 0) > 4

  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-1.5 top-4 bottom-0 w-px bg-hairline last:hidden" />

      {/* Status dot */}
      <div className={cn(
        'relative z-10 mt-3.5 h-3.5 w-3.5 shrink-0 rounded-full border-2',
        isSuccess
          ? 'border-emerald-400 bg-emerald-50'
          : 'border-red-400 bg-red-50',
      )} />

      {/* Card */}
      <div className="flex-1 rounded-lg border border-hairline bg-paper shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
          <span className="text-xs font-semibold text-ink">Run #{runNumber}</span>
          <span className="text-[10px] text-ink-faint" title={formatDate(run.createdAt)}>
            {timeAgo(run.createdAt)}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {/* Status badge */}
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
              isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
            )}>
              {isSuccess
                ? <CheckCircle2 className="h-2.5 w-2.5" />
                : <AlertCircle  className="h-2.5 w-2.5" />
              }
              {isSuccess ? 'Pass' : `Exit ${run.exitCode}`}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 border-b border-hairline px-3 py-2">
          <span className="rounded bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand">
            {LANG_LABELS[run.language] ?? run.language}
          </span>
          {run.executionMs > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-ink-faint">
              <Clock className="h-2.5 w-2.5" />
              {run.executionMs}ms
            </span>
          )}
          {run.memoryKb > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-ink-faint">
              <MemoryStick className="h-2.5 w-2.5" />
              {run.memoryKb < 1024
                ? `${run.memoryKb} KB`
                : `${(run.memoryKb / 1024).toFixed(1)} MB`}
            </span>
          )}
          <span className="text-[10px] text-ink-faint ml-auto">
            {run.codeLength} chars
          </span>
        </div>

        {/* Code snippet */}
        {run.code && (
          <div className="border-b border-hairline bg-[#FAFAF9] px-3 py-2.5">
            <pre className="font-mono text-[10px] leading-relaxed text-ink-muted overflow-hidden">
              {previewLines.join('\n')}
              {hasMore && (
                <span className="text-ink-faint">{'\n'}…</span>
              )}
            </pre>
          </div>
        )}

        {/* Restore button */}
        {run.code && (
          <div className="px-3 py-2.5">
            <button
              onClick={() => onRestore(run.code!, run.language)}
              className="flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-tint/50 px-3 py-1.5 text-[11px] font-semibold text-brand transition hover:bg-brand-tint hover:border-brand/50 active:scale-95"
            >
              <RotateCcw className="h-3 w-3" />
              Move to editor
            </button>
          </div>
        )}
        {!run.code && (
          <div className="px-3 py-2.5">
            <p className="text-[10px] italic text-ink-faint">
              Code not stored (run before history feature was enabled)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export function RunHistoryDrawer({
  open,
  onClose,
  problemSlug,
  onRestoreCode,
  runCount = 0,
}: RunHistoryDrawerProps) {
  const [runs,     setRuns]     = useState<RunEntry[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const LIMIT = 10

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.code.history({ problemSlug, page: p, limit: LIMIT })
      setRuns(data.runs)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
    } catch {
      setError('Failed to load history. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [problemSlug])

  // Fetch when drawer opens or after a new run
  useEffect(() => {
    if (open) {
      setPage(1)
      fetchHistory(1)
    }
  }, [open, runCount, fetchHistory])

  function handlePage(next: number) {
    setPage(next)
    fetchHistory(next)
  }

  function handleRestore(code: string, language: string) {
    onRestoreCode(code, language)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="absolute inset-0 z-20 flex flex-col bg-paper-elevated"
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
            <History className="h-4 w-4 shrink-0 text-brand" />
            <span className="font-semibold text-sm text-ink">Run History</span>
            {problemSlug && (
              <span className="rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
                {problemSlug}
              </span>
            )}

            <div className="ml-auto flex items-center gap-1">
              {/* Refresh */}
              <button
                onClick={() => fetchHistory(page)}
                disabled={loading}
                title="Refresh"
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-hairline hover:text-ink transition disabled:opacity-40"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-hairline hover:text-ink transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Summary bar ─────────────────────────────────────────────────── */}
          {total > 0 && !loading && (
            <div className="shrink-0 border-b border-hairline bg-paper px-4 py-2">
              <p className="text-[11px] text-ink-faint">
                <span className="font-semibold text-ink">{total}</span> run{total !== 1 ? 's' : ''} total
                {problemSlug && ' on this problem'}
              </p>
            </div>
          )}

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
            {/* Loading skeleton */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-faint">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                <p className="text-xs">Loading runs…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-xs text-red-600">{error}</p>
                <button
                  onClick={() => fetchHistory(page)}
                  className="mt-2 text-xs font-semibold text-red-700 underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && runs.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-paper">
                  <ScrollText className="h-6 w-6 text-ink-faint" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">No runs yet</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {problemSlug
                      ? 'Run some code on this problem and your history will appear here.'
                      : 'Your code execution history will appear here.'}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline list */}
            {!loading && !error && runs.length > 0 && (
              <div>
                {runs.map((run, i) => (
                  <RunCard
                    key={run._id}
                    run={run}
                    index={i}
                    total={total}
                    page={page}
                    limit={LIMIT}
                    onRestore={handleRestore}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Pagination ──────────────────────────────────────────────────── */}
          {!loading && pages > 1 && (
            <div className="shrink-0 flex items-center justify-between border-t border-hairline px-4 py-3">
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-hairline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="text-[11px] text-ink-faint">
                Page {page} / {pages}
              </span>
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page >= pages}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-hairline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
