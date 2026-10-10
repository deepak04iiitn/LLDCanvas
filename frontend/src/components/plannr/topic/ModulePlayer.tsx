'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Bookmark, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleHelp, Lightbulb, Lock, Target, AlertTriangle,
} from 'lucide-react'
import {
  journeyApi,
  type JourneyTopic,
  type ModuleBlock,
  type ModuleTopicProgress,
  type PracticeItem,
  type PracticeSubmitResult,
  type CheckSubmitResult,
} from '@/lib/plannr-api'
import { StageTag } from '@/components/plannr/shared/StageTag'
import { cn } from '@/lib/utils'

type Lane = 'learn' | 'practice' | 'complete'

/** Render lightweight markdown: **bold**, *italic*, `code`, ~~strike~~ */
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Longer delimiters first so ** wins over *
  const inlineRe = /`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('`')) {
      parts.push(
        <code key={key++} className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[13px] text-ink">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('**')) {
      parts.push(<strong key={key++} className="font-semibold text-ink">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('~~')) {
      parts.push(<s key={key++} className="text-ink-muted">{token.slice(2, -2)}</s>)
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>)
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : [text]
}

function parseBody(raw?: string) {
  if (!raw) return null
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        // Bullet: • / → / -  (but not markdown **bold** starters alone)
        const bulletMatch = line.match(/^[•→\-]\s+(.+)$/) || line.match(/^\*\s+(.+)$/)
        if (bulletMatch) {
          return (
            <p key={i} className="flex gap-2 text-[15px] leading-relaxed text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{formatInline(bulletMatch[1])}</span>
            </p>
          )
        }
        return (
          <p key={i} className="text-[15px] leading-relaxed text-ink">{formatInline(line)}</p>
        )
      })}
    </div>
  )
}

function MasteryRing({ score }: { score: number }) {
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, score) / 100) * c
  return (
    <div className="relative h-16 w-16">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--hairline)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke="var(--brand)" strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[12px] font-semibold text-ink">
        {Math.round(score)}
      </span>
    </div>
  )
}

function KnowledgeCheckUI({
  slug,
  check,
  priorScore,
  onGraded,
}: {
  slug: string
  check: NonNullable<ModuleBlock['checks']>[number]
  priorScore?: number
  onGraded: (score: number) => void
}) {
  const [picked, setPicked] = useState<string[]>([])
  const [shortText, setShortText] = useState('')
  const [result, setResult] = useState<CheckSubmitResult | null>(
    priorScore !== undefined ? { correct: priorScore >= 60, score: priorScore } : null,
  )
  const [busy, setBusy] = useState(false)

  async function submit(selfScore?: number) {
    setBusy(true)
    try {
      const res = await journeyApi.submitKnowledgeCheck(slug, check.id, {
        selectedOptionIds: picked,
        selfScore,
      })
      setResult(res)
      onGraded(res.score)
    } finally {
      setBusy(false)
    }
  }

  if (check.type === 'short') {
    return (
      <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-3">
        <p className="text-[14px] font-medium text-ink">{formatInline(check.prompt)}</p>
        <textarea
          value={shortText}
          onChange={e => setShortText(e.target.value)}
          rows={4}
          placeholder="Explain like an interviewer…"
          className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-[13px] text-ink"
          disabled={!!result}
        />
        {!result ? (
          <div className="flex flex-wrap gap-2">
            {[40, 60, 80, 100].map(s => (
              <button
                key={s}
                disabled={busy || shortText.trim().length < 12}
                onClick={() => submit(s)}
                className="rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/40 disabled:opacity-40"
              >
                Reveal · self-score {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-[13px]">
            <p className="text-ink-muted">Your score: {result.score}</p>
            {result.modelAnswer && (
              <div className="rounded-lg bg-brand/5 border border-brand/15 p-3 text-ink whitespace-pre-wrap">
                {formatInline(result.modelAnswer)}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-3">
      <p className="text-[14px] font-medium text-ink">{formatInline(check.prompt)}</p>
      <div className="space-y-2">
        {(check.options ?? []).map(o => {
          const selected = picked.includes(o.id)
          return (
            <button
              key={o.id}
              disabled={!!result}
              onClick={() => {
                if (check.type === 'multi') {
                  setPicked(prev =>
                    prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id],
                  )
                } else {
                  setPicked([o.id])
                }
              }}
              className={cn(
                'w-full text-left rounded-lg border px-3 py-2.5 text-[13px] transition-colors',
                selected ? 'border-brand bg-brand/5 text-ink' : 'border-hairline text-ink-muted hover:border-brand/30',
                result && o.correct && 'border-emerald-500/50 bg-emerald-500/5',
              )}
            >
              {formatInline(o.label)}
            </button>
          )
        })}
      </div>
      {!result ? (
        <button
          disabled={busy || picked.length === 0}
          onClick={() => submit()}
          className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          Check answer
        </button>
      ) : (
        <div className="space-y-1 text-[13px]">
          <p className={result.correct ? 'text-emerald-600 font-medium' : 'text-amber-700 font-medium'}>
            {result.correct ? 'Correct' : 'Not quite'} · {result.score}
          </p>
          {result.explanation && (
            <p className="text-ink-muted whitespace-pre-wrap">{formatInline(result.explanation)}</p>
          )}
        </div>
      )}
    </div>
  )
}

function PracticeCard({
  slug,
  item,
  solved,
  onSolved,
}: {
  slug: string
  item: PracticeItem
  solved: boolean
  onSolved: () => void
}) {
  const [hintIdx, setHintIdx] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [phase, setPhase] = useState<'attempt' | 'compare' | 'done'>('attempt')
  const [result, setResult] = useState<PracticeSubmitResult | null>(null)
  const [busy, setBusy] = useState(false)
  const check = item.checks
  const isChoice = check?.type === 'mcq' || check?.type === 'multi'
  const draftOk = draft.trim().length >= 20

  async function grade(selfScore?: number) {
    setBusy(true)
    try {
      const res = await journeyApi.submitPractice(slug, item.id, {
        selectedOptionIds: picked,
        selfScore,
      })
      setResult(res)
      setPhase('done')
      if (res.correct) onSolved()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className={cn(
          'font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border',
          item.difficulty === 'easy' && 'border-emerald-500/30 text-emerald-700',
          item.difficulty === 'medium' && 'border-amber-500/30 text-amber-700',
          item.difficulty === 'hard' && 'border-rose-500/30 text-rose-700',
        )}>
          {item.difficulty}
        </span>
        {(solved || phase === 'done') && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 size={12} /> {solved || result?.correct ? 'Solved' : 'Reviewed'}
          </span>
        )}
      </div>

      <p className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap">{formatInline(item.prompt)}</p>

      {/* ── Attempt ───────────────────────────────────────────────────────── */}
      {phase === 'attempt' && isChoice && (
        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">Your answer</p>
          {(check.options ?? []).map(o => (
            <button
              key={o.id}
              type="button"
              onClick={() =>
                check.type === 'multi'
                  ? setPicked(p => (p.includes(o.id) ? p.filter(x => x !== o.id) : [...p, o.id]))
                  : setPicked([o.id])
              }
              className={cn(
                'w-full text-left rounded-xl border px-3.5 py-2.5 text-[13px] transition-colors',
                picked.includes(o.id)
                  ? 'border-brand bg-brand/5 text-ink'
                  : 'border-hairline text-ink-muted hover:border-brand/30',
              )}
            >
              {formatInline(o.label)}
            </button>
          ))}
          <button
            type="button"
            disabled={busy || picked.length === 0}
            onClick={() => grade()}
            className="mt-1 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            Check answer
          </button>
        </div>
      )}

      {phase === 'attempt' && !isChoice && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">Your attempt</p>
            <p className="text-[11px] text-ink-faint">{draft.trim().length}/20+ chars</p>
          </div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={5}
            placeholder="Write your answer out loud as you would in an interview — classes, ownership, tradeoffs…"
            className="w-full rounded-xl border border-hairline bg-paper px-3.5 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand resize-y min-h-[120px]"
          />
          <button
            type="button"
            disabled={!draftOk}
            onClick={() => setPhase('compare')}
            className="rounded-xl bg-brand px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            Compare with model answer
          </button>
        </div>
      )}

      {/* Hints only during attempt */}
      {phase === 'attempt' && hintIdx < item.hints.length && (
        <button
          type="button"
          onClick={() => setHintIdx(h => Math.min(item.hints.length, h + 1))}
          className="inline-flex items-center gap-1.5 text-[12px] text-brand font-medium"
        >
          <Lightbulb size={12} />
          {hintIdx === 0 ? 'Need a hint?' : `Show hint ${hintIdx + 1}`}
        </button>
      )}
      {phase === 'attempt' && hintIdx > 0 && (
        <ul className="space-y-1.5 border-l-2 border-brand/30 pl-3">
          {item.hints.slice(0, hintIdx).map((h, i) => (
            <li key={i} className="text-[12px] text-ink-muted">{formatInline(h)}</li>
          ))}
        </ul>
      )}

      {/* ── Compare + self-score (short answers) ──────────────────────────── */}
      {phase === 'compare' && !isChoice && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-paper p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint mb-2">You wrote</p>
              <p className="text-[13px] text-ink whitespace-pre-wrap leading-relaxed">{draft}</p>
            </div>
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-brand mb-2">Model answer</p>
              <p className="text-[13px] text-ink whitespace-pre-wrap leading-relaxed">
                {formatInline(
                  check?.modelAnswer
                  || item.solution.explanation
                  || 'No model answer seeded for this item.',
                )}
              </p>
              {item.solution.codeSnippet && (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-ink/4 border border-hairline p-2.5 text-[11px] font-mono text-ink">
                  {item.solution.codeSnippet}
                </pre>
              )}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink mb-2">How close was your answer?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { score: 40, label: 'Missed it' },
                { score: 60, label: 'Partly there' },
                { score: 80, label: 'Mostly solid' },
                { score: 100, label: 'Nailed it' },
              ].map(({ score, label }) => (
                <button
                  key={score}
                  type="button"
                  disabled={busy}
                  onClick={() => grade(score)}
                  className="rounded-xl border border-hairline px-3.5 py-2 text-[12px] font-medium text-ink hover:border-brand/40 hover:bg-brand/5 disabled:opacity-40 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Done ──────────────────────────────────────────────────────────── */}
      {phase === 'done' && result && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {!isChoice && draft.trim() && (
            <div className="rounded-xl border border-hairline bg-paper p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint mb-1">Your attempt</p>
              <p className="text-[13px] text-ink-muted whitespace-pre-wrap">{draft}</p>
            </div>
          )}
          <p className={cn('text-[13px] font-medium', result.correct ? 'text-emerald-600' : 'text-amber-700')}>
            {result.correct ? 'Nice work' : 'Keep iterating'} · score {result.score}
          </p>
          <div className="rounded-xl bg-paper border border-hairline p-4 text-[13px] text-ink whitespace-pre-wrap leading-relaxed">
            {formatInline(result.feedback || result.solution.explanation)}
          </div>
          {result.solution.codeSnippet && (
            <pre className="overflow-x-auto rounded-xl bg-ink/4 border border-hairline p-3 text-[12px] font-mono text-ink">
              {result.solution.codeSnippet}
            </pre>
          )}
          {result.commonMistakes?.length > 0 && (
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">Common mistakes</p>
              {result.commonMistakes.map((m, i) => (
                <p key={i} className="flex gap-2 text-[12px] text-ink-muted">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-600" />
                  {formatInline(m)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BlockView({
  slug,
  block,
  progress,
  onBlockDone,
}: {
  slug: string
  block: ModuleBlock
  progress: ModuleTopicProgress
  onBlockDone: (blockId: string, checkScores?: Record<string, number>) => void
}) {
  const done = progress.completedBlockIds.includes(block.id)

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-1">{block.kind.replace('_', ' ')}</p>
        <h2 className="font-serif text-[26px] font-medium text-ink tracking-tight">{block.title}</h2>
      </div>

      {block.body && parseBody(block.body)}

      {block.bullets && block.bullets.length > 0 && (
        <ul className="space-y-2">
          {block.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[15px] text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{formatInline(b)}</span>
            </li>
          ))}
        </ul>
      )}

      {block.steps && block.steps.length > 0 && (
        <ol className="space-y-3">
          {block.steps.map((s, i) => (
            <li key={i} className="rounded-xl border border-hairline bg-paper-elevated p-4">
              <p className="font-medium text-[13px] text-brand mb-1">{i + 1}. {s.title}</p>
              <p className="text-[13px] text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      )}

      {block.diagramSnapshot && (
        <div className="rounded-xl border border-dashed border-hairline bg-paper-elevated p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-2">Diagram</p>
          <p className="text-[13px] text-ink-muted">
            {block.diagramCaption ?? `${block.diagramSnapshot.nodes?.length ?? 0} nodes · ${block.diagramSnapshot.edges?.length ?? 0} edges`}
          </p>
        </div>
      )}

      {block.checks?.map(check => (
        <KnowledgeCheckUI
          key={check.id}
          slug={slug}
          check={check}
          priorScore={progress.checkScores?.[check.id]}
          onGraded={score => onBlockDone(block.id, { [check.id]: score })}
        />
      ))}

      {!done && (!block.checks || block.checks.length === 0) && (
        <button
          onClick={() => onBlockDone(block.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Mark complete <Check size={14} />
        </button>
      )}
      {done && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
          <CheckCircle2 size={14} /> Section complete
        </p>
      )}
    </div>
  )
}

export function ModulePlayer({ slug }: { slug: string }) {
  const [topic, setTopic] = useState<JourneyTopic | null>(null)
  const [progress, setProgress] = useState<ModuleTopicProgress>({
    completedBlockIds: [],
    practiceSolvedIds: [],
    checkScores: {},
    masteryScore: 0,
  })
  const [lane, setLane] = useState<Lane>('learn')
  const [blockIdx, setBlockIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkBusy, setBookmarkBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    journeyApi.getTopic(slug)
      .then(res => {
        if (cancelled) return
        setTopic(res.topic)
        setProgress(res.progress)
        setBookmarked(res.bookmarked === true)
        const modules = res.topic.modules ?? []
        const firstIncomplete = modules.findIndex(m => !res.progress.completedBlockIds.includes(m.id))
        setBlockIdx(firstIncomplete >= 0 ? firstIncomplete : 0)
        if (modules.length && firstIncomplete === -1 && (res.progress.practiceSolvedIds?.length ?? 0) > 0) {
          setLane('practice')
        }
      })
      .catch(e => !cancelled && setError(e.message ?? 'Failed to load'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [slug])

  async function toggleBookmark() {
    if (bookmarkBusy) return
    setBookmarkBusy(true)
    const prev = bookmarked
    setBookmarked(!prev)
    try {
      const res = await journeyApi.toggleRevisionBookmark(slug)
      setBookmarked(res.bookmarked)
    } catch {
      setBookmarked(prev)
    } finally {
      setBookmarkBusy(false)
    }
  }

  const modules = topic?.modules ?? []
  const practiceSet = useMemo(
    () => [...(topic?.practiceSet ?? [])].sort((a, b) => {
      const o = { easy: 0, medium: 1, hard: 2 }
      return o[a.difficulty] - o[b.difficulty]
    }),
    [topic],
  )

  const checksPassed = useMemo(() => {
    const checkIds = modules.flatMap(m => (m.checks ?? []).map(c => c.id))
    if (!checkIds.length) return true
    return checkIds.every(id => (progress.checkScores?.[id] ?? 0) >= 60)
  }, [modules, progress])

  const practiceUnlocked = !topic?.gatePracticeUntilChecksPass || checksPassed
  const mastery = progress.masteryScore ?? 0
  const threshold = topic?.masteryThreshold ?? 70

  const goPrevBlock = useCallback(() => {
    setBlockIdx(i => Math.max(0, i - 1))
  }, [])

  const goNextBlock = useCallback(() => {
    if (blockIdx >= modules.length - 1) {
      if (practiceUnlocked) setLane('practice')
      return
    }
    setBlockIdx(i => i + 1)
  }, [blockIdx, modules.length, practiceUnlocked])

  // ← / → navigate Learn sections (skip when typing in inputs)
  useEffect(() => {
    if (lane !== 'learn' || !modules.length) return
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement | null)?.isContentEditable) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrevBlock()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNextBlock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lane, modules.length, goPrevBlock, goNextBlock])

  const persist = useCallback(async (patch: Partial<ModuleTopicProgress>) => {
    const res = await journeyApi.saveTopicProgress(slug, {
      completedBlockIds: patch.completedBlockIds,
      practiceSolvedIds: patch.practiceSolvedIds,
      checkScores: patch.checkScores,
    })
    setProgress(res.progress)
  }, [slug])

  async function onBlockDone(blockId: string, checkScores?: Record<string, number>) {
    await persist({
      completedBlockIds: [blockId],
      checkScores,
    })
  }

  async function finishTopic() {
    if (!topic || finishing) return
    if (mastery < threshold) return
    const hasPractice = (topic.practiceSet ?? []).length > 0
    if (hasPractice && (progress.practiceSolvedIds?.length ?? 0) === 0) return
    setFinishing(true)
    try {
      await journeyApi.completeTopic(slug, {
        performance: mastery >= 85 ? 'excellent' : 'good',
        exerciseScore: mastery,
        exerciseType: 'plannr_module',
      })
      setLane('complete')
    } catch {
      // Mastery gate / network — stay on practice lane
    } finally {
      setFinishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-ink-muted">{error || 'Topic not found'}</p>
        <Link href="/dashboard/plannr/roadmap" className="mt-4 inline-block text-brand text-[13px] font-medium">
          Back to roadmap
        </Link>
      </div>
    )
  }

  const block = modules[blockIdx]
  const ext = topic.externalPractice

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper">
      <div className="border-b border-hairline bg-paper-elevated/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-3 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard/plannr/roadmap" className="text-ink-faint hover:text-ink">
              <ChevronLeft size={18} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <StageTag stage={topic.stage} />
                <span className="font-mono text-[10px] text-ink-faint">{topic.estimatedMinutes}m</span>
              </div>
              <h1 className="font-serif text-[18px] font-medium text-ink truncate">{topic.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleBookmark}
              disabled={bookmarkBusy}
              title={bookmarked ? 'Remove from Revise' : 'Save for revision'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                bookmarked
                  ? 'border-brand/40 bg-brand/10 text-brand'
                  : 'border-hairline bg-paper text-ink-muted hover:border-brand/30 hover:text-ink',
              )}
            >
              <Bookmark
                size={13}
                className={bookmarked ? 'fill-current' : undefined}
                strokeWidth={bookmarked ? 2.25 : 1.75}
              />
              <span className="hidden sm:inline">
                {bookmarked ? 'Saved for revise' : 'Mark for revise'}
              </span>
            </button>
            <MasteryRing score={mastery} />
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Outline */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="flex gap-1 rounded-xl border border-hairline p-1 bg-paper-elevated">
            {([
              { id: 'learn' as const, label: 'Learn', icon: BookOpen },
              { id: 'practice' as const, label: 'Practice', icon: Target },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === 'practice' && !practiceUnlocked) return
                  setLane(t.id)
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium transition-colors',
                  lane === t.id ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink',
                  t.id === 'practice' && !practiceUnlocked && 'opacity-50',
                )}
              >
                {t.id === 'practice' && !practiceUnlocked ? <Lock size={11} /> : <t.icon size={11} />}
                {t.label}
              </button>
            ))}
          </div>

          {lane === 'learn' && (
            <nav className="space-y-0.5">
              {modules.map((m, i) => {
                const done = progress.completedBlockIds.includes(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => { setLane('learn'); setBlockIdx(i) }}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors',
                      blockIdx === i && lane === 'learn'
                        ? 'bg-brand/10 text-brand font-medium'
                        : 'text-ink-muted hover:bg-muted/60',
                    )}
                  >
                    {done ? <CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> : <CircleHelp size={12} className="shrink-0 opacity-40" />}
                    <span className="truncate">{m.title}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {lane === 'practice' && (
            <p className="text-[11px] text-ink-muted px-1 leading-relaxed">
              Attempt first, then compare. Hints unlock if you get stuck.
            </p>
          )}
        </aside>

        {/* Main */}
        <main className="min-w-0 pb-16">
          {lane === 'learn' && block && (
            <>
              <BlockView
                slug={slug}
                block={block}
                progress={progress}
                onBlockDone={onBlockDone}
              />
              <div className="mt-8 flex items-center justify-between border-t border-hairline pt-4">
                <button
                  type="button"
                  disabled={blockIdx === 0}
                  onClick={goPrevBlock}
                  className="inline-flex items-center gap-1 text-[13px] text-ink-muted disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> Prev
                  <kbd className="ml-1 hidden sm:inline font-mono text-[10px] text-ink-faint">←</kbd>
                </button>
                {blockIdx < modules.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNextBlock}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    <kbd className="hidden sm:inline font-mono text-[10px] text-white/70">→</kbd>
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!practiceUnlocked}
                    onClick={() => setLane('practice')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
                  >
                    {practiceUnlocked ? 'Go to practice' : 'Pass checks to unlock'} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </>
          )}

          {lane === 'practice' && (
            <div className="space-y-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-1">Native practice</p>
                <h2 className="font-serif text-[26px] font-medium text-ink">Apply what you learned</h2>
                <p className="mt-1.5 text-[13px] text-ink-muted max-w-xl">
                  Write or pick an answer before you see the model — Easy → Medium → Hard.
                </p>
              </div>
              {!practiceUnlocked && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-[13px] text-amber-900">
                  Complete the knowledge checks in Learn before practice unlocks for this topic.
                </div>
              )}
              {practiceUnlocked && practiceSet.map(item => (
                <PracticeCard
                  key={item.id}
                  slug={slug}
                  item={item}
                  solved={progress.practiceSolvedIds.includes(item.id)}
                  onSolved={() => persist({ practiceSolvedIds: [item.id] })}
                />
              ))}
              {practiceUnlocked && (
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={finishTopic}
                    disabled={
                      finishing ||
                      mastery < threshold ||
                      ((topic.practiceSet?.length ?? 0) > 0 &&
                        (progress.practiceSolvedIds?.length ?? 0) === 0)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
                  >
                    Complete topic <CheckCircle2 size={15} />
                  </button>
                  <p className="text-[12px] text-ink-faint">
                    Mastery {Math.round(mastery)}% · need {threshold}%
                    {(topic.practiceSet?.length ?? 0) > 0 ? ' + at least one practice' : ''} to earn skill credit
                  </p>
                </div>
              )}
            </div>
          )}

          {lane === 'complete' && (
            <div className="space-y-6 animate-in fade-in duration-400">
              <div className="flex items-center gap-4">
                <MasteryRing score={mastery} />
                <div>
                  <h2 className="font-serif text-[28px] font-medium text-ink">Module complete</h2>
                  <p className="text-[13px] text-ink-muted">Mastery {Math.round(mastery)}%</p>
                </div>
              </div>
              {(topic.takeaways ?? []).length > 0 && (
                <ul className="space-y-2">
                  {topic.takeaways!.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[14px] text-ink">
                      <Check size={14} className="mt-1 text-brand shrink-0" />
                      <span>{formatInline(t)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 space-y-3">
                <p className="font-medium text-[14px] text-ink">Want to practice more?</p>
                <p className="text-[13px] text-ink-muted">
                  {ext?.blurb ?? 'Optional — Studio and Learn for volume. Not required to continue Plannr.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(ext?.studioPacks ?? []).map(p => (
                    <Link
                      key={p}
                      href={`/dashboard/design-studio`}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/40"
                    >
                      Studio
                    </Link>
                  ))}
                  {(ext?.learnSlugs ?? []).map(s => (
                    <Link
                      key={s}
                      href={`/dashboard/learn`}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/40"
                    >
                      Learn
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/plannr/roadmap"
                    className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white"
                  >
                    Continue roadmap
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
