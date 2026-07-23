'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, ChevronDown, ChevronUp, Lightbulb, Lock,
  ExternalLink, BookOpen, ListChecks, ShieldCheck,
  Building2, Rocket, ArrowRight, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ProblemDetail } from '@/types'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'
import Link from 'next/link'

// ─── Hints helper ─────────────────────────────────────────────────────────────


function HintsSection({ slug, hints }: { slug: string; hints: string[] }) {
  const [revealed, setRevealed] = useState<number[]>([])
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null)

  function revealHint(i: number) {
    setRevealed(prev => [...new Set([...prev, i])])
    setConfirmIdx(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          <Lightbulb className="h-3 w-3 text-brand" /> Hints
        </p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className={cn(
              'h-1 w-4 rounded-full transition-colors',
              revealed.includes(i) ? 'bg-brand' : 'bg-hairline',
            )} />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {hints.map((hint, i) => {
          const isRevealed = revealed.includes(i)
          return (
            <div key={i} className={cn(
              'rounded-lg border px-3 py-2.5 transition-colors',
              isRevealed ? 'border-brand/20 bg-brand-tint' : 'border-hairline bg-paper',
            )}>
              <div className="flex items-start gap-2.5">
                <span className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold',
                  isRevealed ? 'bg-brand text-brand-foreground' : 'bg-hairline text-ink-faint',
                )}>
                  {isRevealed ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  {isRevealed ? (
                    <p className="text-[12px] leading-relaxed text-ink">{hint}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {confirmIdx === i ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => revealHint(i)}
                            className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground hover:bg-brand-hover">
                            Reveal
                          </button>
                          <button onClick={() => setConfirmIdx(null)}
                            className="rounded-md border border-hairline px-2 py-0.5 text-[10px] text-ink-muted hover:bg-hairline">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmIdx(i)}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted hover:text-brand">
                          <Lock className="h-2.5 w-2.5" /> Reveal hint {i + 1}
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

function ReqSection({
  title, items, accent, icon: Icon,
}: { title: string; items: string[]; accent: string; icon: React.ElementType }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-paper">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-hairline/40">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-5 w-5 items-center justify-center rounded-md', accent)}>
            <Icon className="h-3 w-3" />
          </div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            {title} <span className="text-ink-faint/70">({items.length})</span>
          </span>
        </div>
        {open
          ? <ChevronUp className="h-3 w-3 text-ink-faint" />
          : <ChevronDown className="h-3 w-3 text-ink-faint" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-2 border-t border-hairline px-3 py-2.5"
          >
            {items.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                <span className="text-[12px] leading-relaxed text-ink-muted">{req}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface ProblemPanelProps {
  slug: string
  collapsed: boolean
  onCollapse: () => void
  onExpand: () => void
  diagramId: string | null
}

const DIFF_META = {
  easy:   { color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-400' },
  medium: { color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   dot: 'bg-amber-400'   },
  hard:   { color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200',     dot: 'bg-red-400'     },
}

export function ProblemPanel({ slug, collapsed, onCollapse, onExpand, diagramId }: ProblemPanelProps) {
  const router = useRouter()
  const { isFree } = usePlan()
  const [problem,    setProblem]    = useState<ProblemDetail | null>(null)
  const [hints,      setHints]      = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.problems.get(slug),
      api.problems.hints(slug),
    ])
      .then(([detail, { hints: h }]) => {
        setProblem(detail.problem)
        setHints(h)
      })
      .catch(() => toast.error('Could not load problem'))
      .finally(() => setLoading(false))
  }, [slug])

  const diffMeta = problem ? DIFF_META[problem.difficulty] : null

  // ── Collapsed strip ────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <motion.button
        key="problem-panel-collapsed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onExpand}
        title="Open problem panel"
        className="relative flex h-full w-9 shrink-0 flex-col items-center justify-center gap-2.5
                   rounded-l-2xl border-l border-y border-hairline bg-paper-elevated shadow-sm transition-colors
                   hover:bg-hairline/50"
      >
        {diffMeta && <span className={cn('absolute top-3 h-1.5 w-1.5 rounded-full', diffMeta.dot)} />}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-tint">
            <BookOpen className="h-3.5 w-3.5 text-brand" />
          </div>
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            Problem
          </span>
        </div>
      </motion.button>
    )
  }

  return (
    <motion.div
      key="problem-panel"
      initial={{ width: 36 }}
      animate={{ width: 400 }}
      exit={{ width: 36 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="relative flex h-full flex-col overflow-hidden rounded-l-2xl border-l border-y border-hairline bg-paper-elevated shadow-xl"
      style={{ minWidth: 320 }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-tint">
            <BookOpen className="h-3.5 w-3.5 text-brand" />
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Problem Brief
          </span>
        </div>
        <button onClick={onCollapse}
          className="rounded-lg p-1.5 transition-colors hover:bg-hairline"
          title="Collapse panel">
          <X className="h-3.5 w-3.5 text-ink-faint" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-hairline" />
            ))}
          </div>
        ) : !problem ? (
          <p className="text-xs text-ink-faint">Problem not found.</p>
        ) : (
          <>
            {/* Title + difficulty */}
            <div className="space-y-2">
              {diffMeta && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ring-1',
                  diffMeta.bg, diffMeta.color, diffMeta.ring,
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', diffMeta.dot)} />
                  {problem.difficulty}
                </span>
              )}
              <h2 className="font-serif text-[15px] font-medium leading-snug text-ink">
                {problem.title}
              </h2>
              <p className="text-xs leading-relaxed text-ink-faint">{problem.description}</p>
            </div>

            {/* Requirements */}
            {problem.functionalRequirements.length > 0 && (
              <ReqSection
                title="Functional"
                items={problem.functionalRequirements}
                accent="bg-brand/10 text-brand"
                icon={ListChecks}
              />
            )}
            {problem.nonFunctionalRequirements.length > 0 && (
              <ReqSection
                title="Non-Functional"
                items={problem.nonFunctionalRequirements}
                accent="bg-indigo-400/10 text-indigo-500"
                icon={ShieldCheck}
              />
            )}

            {/* Hints */}
            {hints.length > 0 && (
              isFree ? (
                <div className="flex flex-col items-center gap-2.5 rounded-xl border border-brand/20 bg-brand-tint px-4 py-5 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                    <Rocket className="h-4 w-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">Hints require Pro</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">Upgrade to unlock all hints.</p>
                  </div>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground hover:bg-brand-hover transition-colors"
                  >
                    Upgrade <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <HintsSection slug={slug} hints={hints} />
              )
            )}

            {/* Companies */}
            {problem.companies.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                  Asked by
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.companies.map(c => (
                    <span key={c}
                      className="flex items-center gap-1 rounded-md border border-hairline bg-paper px-1.5 py-0.5
                                 font-mono text-[10px] text-ink-muted">
                      <Building2 className="h-2.5 w-2.5 text-ink-faint" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View on problems page */}
            <button
              onClick={() => router.push(`/dashboard/problems/${slug}`)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand
                         py-2 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Full Problem + Community
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
