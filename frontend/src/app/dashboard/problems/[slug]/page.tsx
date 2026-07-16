'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, Clock, Play, ExternalLink,
  Lightbulb, Lock, ChevronDown, ChevronUp, RefreshCw,
  Users, CheckCheck, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { ProblemDetail, UserSolution, CommunitySolution } from '@/types'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   dot: 'bg-amber-400'   },
  hard:   { label: 'Hard',   color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200',     dot: 'bg-red-400'     },
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const m = DIFF_META[difficulty]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ring-1',
      m.bg, m.color, m.ring,
    )}>
      <span className={cn('h-2 w-2 rounded-full', m.dot)} />
      {m.label}
    </span>
  )
}

// ─── Hints panel ─────────────────────────────────────────────────────────────

const HINT_STORAGE_KEY = (slug: string) => `lld_hints_${slug}`

function HintsPanel({ slug, hints }: { slug: string; hints: string[] }) {
  const storageKey = HINT_STORAGE_KEY(slug)
  const [revealed, setRevealed] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)

  function revealHint(i: number) {
    const next = [...new Set([...revealed, i])]
    setRevealed(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    setConfirmIndex(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
          Hints — {revealed.length}/3 revealed
        </span>
      </div>

      <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
        {hints.map((hint, i) => {
          const isRevealed = revealed.includes(i)
          return (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3">
                {/* Hint number */}
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold',
                  isRevealed ? 'bg-amber-100 text-amber-700' : 'bg-hairline text-ink-faint',
                )}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {isRevealed ? (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm leading-relaxed text-ink-muted"
                    >
                      {hint}
                    </motion.p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink-faint">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs">Hint {i + 1} is locked</span>
                      </div>
                      {confirmIndex === i ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-faint">Reveal? (hints reduce the challenge)</span>
                          <button
                            onClick={() => revealHint(i)}
                            className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white
                                       transition-all hover:bg-amber-600"
                          >
                            Yes, reveal
                          </button>
                          <button
                            onClick={() => setConfirmIndex(null)}
                            className="rounded-lg border border-hairline px-3 py-1 text-[11px] text-ink-muted
                                       transition-all hover:bg-hairline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmIndex(i)}
                          className="flex items-center gap-1.5 text-xs font-medium text-amber-600
                                     transition-colors hover:text-amber-700"
                        >
                          <Lightbulb className="h-3.5 w-3.5" />
                          Reveal hint {i + 1}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Requirements section ─────────────────────────────────────────────────────

function RequirementsSection({ title, items, accent }: {
  title: string; items: string[]; accent: string
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated
                    shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', accent)} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            {title}
          </span>
          <span className={cn('rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold', accent === 'bg-brand' ? 'bg-brand-tint text-brand' : 'bg-hairline text-ink-faint')}>
            {items.length}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-ink-faint" /> : <ChevronDown className="h-4 w-4 text-ink-faint" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-hairline px-5 pb-4"
          >
            {items.map((req, i) => (
              <li key={i} className="flex items-start gap-3 pt-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                                 bg-hairline font-mono text-[9px] font-bold text-ink-faint">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-ink-muted">{req}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Community solution card ──────────────────────────────────────────────────

function SolutionCard({ solution }: { solution: CommunitySolution }) {
  const router = useRouter()
  const initials = solution.userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={cn(
      'flex items-center gap-4 rounded-2xl border bg-paper-elevated px-4 py-3.5 transition-all',
      'hover:border-hairline-strong hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
      solution.isOwn ? 'border-brand/20' : 'border-hairline',
    )}>
      {/* Avatar */}
      {solution.userImage ? (
        <img src={solution.userImage} alt={solution.userName}
             className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                        bg-brand-tint font-mono text-sm font-bold text-brand">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">{solution.userName}</p>
          {solution.isOwn && (
            <span className="rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[9px] font-bold text-brand">
              You
            </span>
          )}
        </div>
        <p className="font-mono text-[11px] text-ink-faint">
          {solution.nodeCount} nodes · {solution.edgeCount} edges ·{' '}
          {formatDistanceToNow(parseISO(solution.submittedAt), { addSuffix: true })}
        </p>
      </div>

      {/* CTA */}
      {solution.diagramId && (
        <button
          onClick={() => router.push(`/editor/${solution.diagramId}`)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-hairline-strong
                     px-3 py-1.5 text-xs font-medium text-ink-muted transition-all
                     hover:border-brand/40 hover:text-brand"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'requirements' | 'community'

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router   = useRouter()

  const [problem,         setProblem]         = useState<ProblemDetail | null>(null)
  const [hints,           setHints]           = useState<string[]>([])
  const [mySolution,      setMySolution]      = useState<UserSolution | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [loading,         setLoading]         = useState(true)
  const [tab,             setTab]             = useState<Tab>('requirements')
  const [starting,        setStarting]        = useState(false)
  const [submitting,      setSubmitting]      = useState(false)

  // Community solutions
  const [solutions,    setSolutions]    = useState<CommunitySolution[]>([])
  const [solPage,      setSolPage]      = useState(1)
  const [solTotal,     setSolTotal]     = useState(0)
  const [solPages,     setSolPages]     = useState(1)
  const [solLoading,   setSolLoading]   = useState(false)
  const [solSort,      setSolSort]      = useState<'newest' | 'oldest'>('newest')

  // Load problem + hints
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      api.problems.get(slug),
      api.problems.hints(slug),
    ])
      .then(([detail, { hints: h }]) => {
        setProblem(detail.problem)
        setMySolution(detail.mySolution)
        setSubmissionCount(detail.submissionCount)
        setHints(h)
      })
      .catch(() => toast.error('Could not load problem'))
      .finally(() => setLoading(false))
  }, [slug])

  // Load community solutions
  const loadSolutions = useCallback(async (page = 1, sort = solSort) => {
    if (!slug) return
    setSolLoading(true)
    try {
      const data = await api.problems.solutions(slug, page, sort)
      setSolutions(data.solutions)
      setSolTotal(data.total)
      setSolPages(data.totalPages)
      setSolPage(page)
    } catch { toast.error('Could not load solutions') }
    finally { setSolLoading(false) }
  }, [slug, solSort])

  useEffect(() => {
    if (tab === 'community') loadSolutions(1, solSort)
  }, [tab, solSort]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    if (!slug) return
    setStarting(true)
    try {
      const { diagramId } = await api.problems.start(slug)
      router.push(`/editor/${diagramId}?problem=${slug}`)
    } catch { toast.error('Could not start session') }
    finally { setStarting(false) }
  }

  async function handleSubmit() {
    if (!slug) return
    setSubmitting(true)
    try {
      const { solution } = await api.problems.submit(slug)
      setMySolution(solution)
      setSubmissionCount(c => c + 1)
      toast.success('Solution submitted! It\'s now visible to others.', { icon: '🎉' })
    } catch { toast.error('Could not submit solution') }
    finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-ink-faint" />
        </div>
      </AppShell>
    )
  }

  if (!problem) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-ink-faint">Problem not found.</p>
          <button onClick={() => router.push('/dashboard/problems')}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-brand-foreground">
            Back to Problems
          </button>
        </div>
      </AppShell>
    )
  }

  const isSolved    = mySolution?.status === 'submitted'
  const isInProgress = mySolution?.status === 'in_progress'

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">

          {/* Back */}
          <button
            onClick={() => router.push('/dashboard/problems')}
            className="mb-6 flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> All Problems
          </button>

          {/* Header card */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-hairline bg-paper-elevated
                          shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span className="rounded-md border border-hairline bg-paper px-2 py-0.5
                                     font-mono text-[10px] text-ink-faint">
                      {problem.category}
                    </span>
                    {isSolved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-0.5
                                       font-mono text-[10px] font-bold text-brand">
                        <CheckCircle2 className="h-3 w-3" /> Solved
                      </span>
                    )}
                  </div>
                  <h1 className="font-serif text-2xl font-medium text-ink">{problem.title}</h1>
                  <p className="text-sm leading-relaxed text-ink-faint">{problem.description}</p>

                  {/* Companies */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {problem.companies.map(c => (
                      <span key={c} className="rounded-md border border-hairline bg-paper px-2 py-0.5
                                               font-mono text-[10px] text-ink-faint">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!mySolution && (
                    <button
                      onClick={handleStart} disabled={starting}
                      className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm
                                 font-semibold text-brand-foreground transition-all hover:opacity-90
                                 disabled:opacity-50"
                    >
                      {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Start Practicing
                    </button>
                  )}
                  {isInProgress && (
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => router.push(`/editor/${mySolution.diagramId}?problem=${slug}`)}
                        className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm
                                   font-semibold text-brand-foreground transition-all hover:opacity-90"
                      >
                        <ExternalLink className="h-4 w-4" /> Resume in Editor
                      </button>
                      <button
                        onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50
                                   px-4 py-2 text-sm font-medium text-emerald-700 transition-all
                                   hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                        Mark as Complete
                      </button>
                    </div>
                  )}
                  {isSolved && (
                    <button
                      onClick={() => router.push(`/editor/${mySolution.diagramId}?problem=${slug}`)}
                      className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand-tint
                                 px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand/10"
                    >
                      <ExternalLink className="h-4 w-4" /> View My Solution
                    </button>
                  )}

                  {/* Stats */}
                  <p className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                    <Users className="h-3.5 w-3.5" />
                    {submissionCount} submitted solution{submissionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-hairline bg-paper p-1">
            {(['requirements', 'community'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium capitalize transition-all',
                  tab === t ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink',
                )}
              >
                {t === 'requirements' ? 'Requirements & Hints' : `Community Solutions`}
                {t === 'community' && (
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold',
                    tab === 'community' ? 'bg-white/20 text-white' : 'bg-hairline text-ink-faint',
                  )}>
                    {submissionCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Requirements tab */}
          {tab === 'requirements' && (
            <motion.div
              key="requirements"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <RequirementsSection
                title="Functional Requirements"
                items={problem.functionalRequirements}
                accent="bg-brand"
              />
              <RequirementsSection
                title="Non-Functional Requirements"
                items={problem.nonFunctionalRequirements}
                accent="bg-indigo-400"
              />
              {hints.length > 0 && (
                <HintsPanel slug={slug} hints={hints} />
              )}
            </motion.div>
          )}

          {/* Community tab */}
          {tab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Sort + count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-faint">
                  {solTotal} submitted solution{solTotal !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-1 rounded-xl border border-hairline bg-paper p-1">
                  {(['newest', 'oldest'] as const).map(s => (
                    <button key={s} onClick={() => setSolSort(s)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 font-mono text-[11px] font-medium capitalize transition-all',
                        solSort === s ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {solLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-hairline" />
                  ))}
                </div>
              ) : solutions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border
                                border-hairline bg-paper-elevated py-16 text-center">
                  <Users className="mb-3 h-8 w-8 text-ink-faint/40" />
                  <p className="text-sm font-medium text-ink">No solutions yet</p>
                  <p className="mt-1 text-xs text-ink-faint">Be the first to submit!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {solutions.map(s => <SolutionCard key={s._id} solution={s} />)}
                  </div>

                  {/* Pagination */}
                  {solPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => loadSolutions(solPage - 1, solSort)}
                        disabled={solPage <= 1}
                        className="rounded-lg border border-hairline-strong px-3 py-1.5 text-xs
                                   text-ink-muted transition-all hover:bg-hairline disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="font-mono text-xs text-ink-faint">{solPage} / {solPages}</span>
                      <button
                        onClick={() => loadSolutions(solPage + 1, solSort)}
                        disabled={solPage >= solPages}
                        className="rounded-lg border border-hairline-strong px-3 py-1.5 text-xs
                                   text-ink-muted transition-all hover:bg-hairline disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
