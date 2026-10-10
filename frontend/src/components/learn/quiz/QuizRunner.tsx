'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Flame, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
  learnApi,
  type QuizQuestion,
  type QuizSubmitResult,
  type QuizStreak,
} from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Skill label map ────────────────────────────────────────────────────────────
const SKILL_LABELS: Record<string, string> = {
  oop: 'OOP',
  solid: 'SOLID',
  patterns: 'Design Patterns',
  designThinking: 'Design Thinking',
  requirementAnalysis: 'Requirement Analysis',
  entityIdentification: 'Entity Identification',
  responsibilities: 'Responsibilities',
  relationships: 'Relationships',
  extensibility: 'Extensibility',
  coupling: 'Coupling',
  cohesion: 'Cohesion',
  communication: 'Communication',
  tradeoffReasoning: 'Trade-off Reasoning',
  followupHandling: 'Follow-up Handling',
  designSpeed: 'Design Speed',
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

type Tab       = 'quiz' | 'revisit'
type QuizPhase = 'quiz' | 'summary'

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-2xl bg-hairline" />
      {[0,1,2,3].map(i => (
        <div key={i} className="h-14 rounded-xl bg-hairline" />
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function QuizRunner() {
  const [tab, setTab] = useState<Tab>('quiz')

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [questions, setQuestions]   = useState<QuizQuestion[]>([])
  const [setId, setSetId]           = useState<string | undefined>()
  const [loading, setLoading]       = useState(true)
  const [phase, setPhase]           = useState<QuizPhase>('quiz')
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [doneScore, setDoneScore]   = useState<{ correct: number; total: number } | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers]       = useState<Record<string, number>>({})
  const [locked, setLocked]         = useState<Record<string, number>>({})
  const [checkedCurrent, setCheckedCurrent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState<QuizSubmitResult | null>(null)

  // ── Streak state ────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState<QuizStreak | null>(null)

  // ── Revisit bank ────────────────────────────────────────────────────────────
  const [revisitQuestions, setRevisitQuestions] = useState<QuizQuestion[]>([])
  const [revisitLoading, setRevisitLoading]     = useState(false)

  // ── Load quiz + streak ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [data, streakData] = await Promise.allSettled([
          learnApi.quiz.today(),
          learnApi.quiz.streak(),
        ])
        if (!cancelled) {
          if (data.status === 'fulfilled') {
            const d = data.value
            setQuestions(d.questions ?? [])
            setSetId((d as any).setId)
            if (d.alreadyCompleted) {
              setAlreadyDone(true)
              setDoneScore(d.existingResult ?? null)
              setPhase('summary')
            }
          } else {
            toast.error('Failed to load quiz')
          }
          if (streakData.status === 'fulfilled') setStreak(streakData.value)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Load revisit bank ───────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== 'revisit') return
    let cancelled = false
    setRevisitLoading(true)
    learnApi.quiz.revisitBank()
      .then(d => { if (!cancelled) setRevisitQuestions(d.questions ?? []) })
      .catch(() => toast.error('Failed to load revisit bank'))
      .finally(() => { if (!cancelled) setRevisitLoading(false) })
    return () => { cancelled = true }
  }, [tab])

  const currentQ = questions[currentIdx]
  const total    = questions.length
  const isLastQ  = currentIdx === total - 1
  const pct      = total > 0 ? ((currentIdx + (checkedCurrent ? 1 : 0)) / total) * 100 : 0

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = useCallback(async (finalAnswers: Record<string, number>) => {
    setSubmitting(true)
    try {
      const payload = questions.map(q => ({ questionId: q._id, choiceIndex: finalAnswers[q._id] }))
      const res = await learnApi.quiz.submit(payload, setId)
      setResult(res)
      setPhase('summary')
      learnApi.quiz.streak().then(setStreak).catch(() => null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }, [questions, setId])

  // Selecting an option immediately locks and reveals — no separate "Check Answer" step.
  const handleSelectOption = useCallback((idx: number) => {
    if (!currentQ || checkedCurrent) return
    const newAnswers = { ...answers, [currentQ._id]: idx }
    setAnswers(newAnswers)
    const newLocked  = { ...locked,  [currentQ._id]: idx }
    setLocked(newLocked)
    setCheckedCurrent(true)
    if (isLastQ) submit(newLocked)
  }, [currentQ, checkedCurrent, answers, locked, isLastQ, submit])

  function handleNext() {
    setCurrentIdx(i => i + 1)
    setCheckedCurrent(false)
  }


  return (
    <div className="flex h-full flex-col overflow-y-auto bg-paper relative">

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.25]"
        style={{ backgroundImage: 'radial-gradient(circle, #234E3F 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* ── Top progress bar ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 h-0.5 w-full bg-hairline shrink-0">
        <div
          className="h-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0.5 z-30 shrink-0 border-b border-hairline bg-paper/90 backdrop-blur-sm px-6 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <Link
            href="/dashboard/learn/quiz"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors"
          >
            <ArrowLeft size={13} />
            Daily Quiz
          </Link>

          <div className="flex items-center gap-3">
            {/* Q counter (only in quiz phase) */}
            {tab === 'quiz' && phase === 'quiz' && total > 0 && (
              <span className="font-mono text-[11px] text-ink-faint">
                Q {currentIdx + 1} <span className="text-hairline-strong">/ {total}</span>
              </span>
            )}
            {/* Streak chip */}
            {streak && streak.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
                <Flame size={11} className="text-amber-500" />
                <span className="font-mono text-[11px] font-bold text-amber-700">{streak.currentStreak}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 py-8">

        {/* Tab toggle */}
        <div className="mb-8 inline-flex rounded-2xl border border-hairline bg-paper-elevated p-1 gap-0.5 relative">
          {/* Sliding indicator */}
          <div
            className={cn(
              'absolute top-1 bottom-1 rounded-xl bg-brand transition-all duration-300 ease-in-out',
              tab === 'quiz' ? 'left-1 right-[calc(50%+2px)]' : 'left-[calc(50%+2px)] right-1',
            )}
          />
          {(['quiz', 'revisit'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'relative z-10 px-5 py-2 text-[12px] font-semibold rounded-xl transition-colors duration-200 min-w-28 text-center select-none',
                tab === t ? 'text-white' : 'text-ink-muted hover:text-ink',
              )}
            >
              {t === 'quiz' ? "Today's Quiz" : 'Revisit Bank'}
            </button>
          ))}
        </div>

        {/* ── Quiz Tab ────────────────────────────────────────────────────── */}
        {tab === 'quiz' && (
          <>
            {loading ? <Skeleton /> :
             questions.length === 0 ? (
              <p className="text-center text-[14px] text-ink-muted py-20">
                No questions published yet.
              </p>
            ) : phase === 'summary' && (result || alreadyDone) ? (
              // ── Summary ──────────────────────────────────────────────────
              <div className="space-y-8">

                {/* Already done banner */}
                {alreadyDone && (
                  <div className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-tint/20 px-5 py-4">
                    <CheckCircle2 size={18} className="text-brand shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-ink">You've already completed today's quiz</p>
                      <p className="text-[12px] text-ink-muted mt-0.5">Come back tomorrow for a fresh set of 10 questions.</p>
                    </div>
                  </div>
                )}

                {/* Score hero */}
                {(() => {
                  const correct = result?.correct ?? doneScore?.correct ?? 0
                  const total   = result?.total   ?? doneScore?.total   ?? 0
                  return (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-2">Your result</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-[64px] font-medium leading-none text-ink">{correct}</span>
                      <span className="font-serif text-[32px] text-ink-faint leading-none">/{total}</span>
                    </div>
                    <p className="text-[12px] text-ink-muted mt-2">questions correct</p>
                    {result?.interviewReadiness !== undefined && (
                      <p className="text-[12px] text-ink-muted mt-1">
                        Interview readiness:{' '}
                        <span className="font-semibold text-ink">{result.interviewReadiness}/100</span>
                      </p>
                    )}
                  </div>

                  {/* Skill deltas */}
                  {result?.skillDeltas && Object.keys(result.skillDeltas).length > 0 && (
                    <div className="flex-1 min-w-0 rounded-2xl border border-hairline bg-paper-elevated p-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-4">Skills improved</p>
                      <div className="space-y-3">
                        {Object.entries(result.skillDeltas).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-3">
                            <span className="w-32 shrink-0 text-[12px] text-ink-muted truncate">{SKILL_LABELS[k] ?? k}</span>
                            <div className="flex-1 h-1 rounded-full bg-hairline overflow-hidden">
                              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, v * 10)}%` }} />
                            </div>
                            <span className="w-8 text-right text-[11px] font-mono font-bold text-brand shrink-0">+{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                  )
                })()}

                {/* Divider */}
                <div className="border-t border-hairline" />

                {/* Per-question review */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-4">Question review</p>
                  <div className="space-y-3">
                    {questions.map((q, i) => {
                      // For already-done state the answer is embedded on the question object itself
                      const detail = result?.details?.find(d => d.questionId === q._id) ?? (
                        q.userChoiceIndex !== undefined ? {
                          questionId:   q._id,
                          correct:      (q as any).userCorrect ?? false,
                          correctIndex: q.correctIndex ?? -1,
                          explanation:  q.explanation ?? '',
                        } : undefined
                      )
                      return (
                        <div key={q._id} className={cn(
                          'rounded-2xl border p-5',
                          detail?.correct ? 'border-brand/20 bg-brand-tint/10' : 'border-hairline bg-paper-elevated',
                        )}>
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5',
                              detail?.correct ? 'bg-brand/10' : 'bg-red-50',
                            )}>
                              {detail?.correct
                                ? <CheckCircle2 size={14} className="text-brand" />
                                : <XCircle size={14} className="text-red-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">
                                Q{i + 1} · {q.topic}
                              </p>
                              <p className="text-[13px] font-medium text-ink leading-snug">{q.prompt}</p>
                              {!detail?.correct && detail && (
                                <p className="mt-2 text-[12px] text-ink-muted">
                                  Correct answer:{' '}
                                  <span className="font-medium text-ink">{q.choices[detail.correctIndex]}</span>
                                </p>
                              )}
                              {detail?.explanation && (
                                <p className="mt-2 text-[12px] text-ink-faint leading-relaxed">{detail.explanation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Back to Learn <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/dashboard/stats"
                    className="flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink transition-colors"
                  >
                    <Flame size={13} className="text-amber-400" />
                    {streak && streak.currentStreak > 0 ? `${streak.currentStreak}-day streak` : 'View streak in Stats'}
                  </Link>
                </div>
              </div>

            ) : (
              // ── Single question ──────────────────────────────────────────
              currentQ && (
                <div className="space-y-5">

                  {/* Question meta + text */}
                  <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
                    {/* Meta bar */}
                    <div className="flex items-center justify-between border-b border-hairline/60 px-5 py-3 bg-paper">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'inline-flex h-1.5 w-1.5 rounded-full shrink-0',
                          currentQ.difficulty === 'easy'   ? 'bg-brand' :
                          currentQ.difficulty === 'medium' ? 'bg-amber-400' : 'bg-red-400',
                        )} />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                          {currentQ.difficulty.toUpperCase()}
                        </span>
                        <span className="h-3 w-px bg-hairline" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                          {currentQ.topic}
                        </span>
                      </div>
                      {/* Dot progress pips */}
                      <div className="flex gap-1.5">
                        {questions.map((_, i) => (
                          <div key={i} className={cn(
                            'h-1.5 w-4 rounded-full transition-all duration-300',
                            i < currentIdx ? 'bg-brand' :
                            i === currentIdx ? 'bg-brand w-6' : 'bg-hairline',
                          )} />
                        ))}
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="px-6 py-6">
                      <p className="font-serif text-[19px] font-medium leading-snug text-ink">
                        {currentQ.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Answer options */}
                  <ul className="space-y-2.5">
                    {currentQ.choices.map((choice, idx) => {
                      const letter    = OPTION_LETTERS[idx] ?? String(idx + 1)
                      const selected  = answers[currentQ._id] === idx
                      const isLocked  = checkedCurrent
                      // isLocked = answer committed, no right/wrong revealed yet
                      const isChosen = isLocked && selected   // the one they picked

                      return (
                        <li key={idx}>
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectOption(idx)}
                            className={cn(
                              'group w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150',
                              // Unlocked: hoverable
                              !isLocked && 'cursor-pointer hover:border-brand/30 hover:bg-brand-tint/10 border-hairline bg-paper',
                              // Locked & chosen: neutral solid feel — dark border, paper-elevated bg
                              isLocked && isChosen && 'border-ink/25 bg-paper-elevated',
                              // Locked & not chosen: fade out
                              isLocked && !isChosen && 'border-hairline opacity-35',
                            )}
                          >
                            {/* Letter badge */}
                            <span className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all',
                              !isLocked && !selected && 'border-hairline text-ink-faint group-hover:border-brand/40 group-hover:text-brand',
                              !isLocked && selected  && 'border-brand bg-brand text-white',
                              // Locked chosen: filled ink (neutral — no colour bias)
                              isLocked && isChosen   && 'border-ink bg-ink text-paper',
                              isLocked && !isChosen  && 'border-hairline text-ink-faint',
                            )}>
                              {letter}
                            </span>
                            <span className={cn(
                              'flex-1 text-[14px] leading-snug',
                              isLocked && isChosen  ? 'font-medium text-ink' :
                              isLocked              ? 'text-ink-faint' :
                              selected              ? 'text-ink' : 'text-ink-muted',
                            )}>
                              {choice}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>


                  {/* Action row — only visible after an option is selected */}
                  <div className="flex items-center justify-between pt-1 min-h-11">
                    <span className="font-mono text-[11px] text-ink-faint">
                      {currentIdx + 1} / {total}
                    </span>

                    {checkedCurrent && (
                      isLastQ ? (
                        submitting ? (
                          <span className="flex items-center gap-2 text-[13px] text-ink-faint">
                            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                          </span>
                        ) : null
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity group"
                        >
                          Next Question
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )
                    )}
                  </div>

                </div>
              )
            )}
          </>
        )}

        {/* ── Revisit Bank Tab ────────────────────────────────────────────── */}
        {tab === 'revisit' && (
          <>
            {revisitLoading ? <Skeleton /> :
             revisitQuestions.length === 0 ? (
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-12 text-center">
                <RotateCcw size={22} className="mx-auto text-ink-faint mb-3" />
                <p className="text-[14px] text-ink-muted">Revisit bank is empty.</p>
                <p className="text-[12px] text-ink-faint mt-1">Keep answering questions to fill it up.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {revisitQuestions.length} question{revisitQuestions.length !== 1 ? 's' : ''} to revisit
                </p>

                {revisitQuestions.map((q, i) => {
                  // correctIndex and userChoiceIndex come from the backend directly on the question object
                  const correctIdx  = q.correctIndex ?? -1
                  const wrongIdx    = q.userChoiceIndex ?? null   // what the user picked last time

                  return (
                    <div key={q._id} className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
                      {/* Header bar */}
                      <div className="border-b border-hairline/60 px-5 py-3 bg-paper flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                          #{i + 1} · {q.topic}
                        </span>
                        <span className={cn(
                          'inline-flex items-center gap-1 font-mono text-[10px]',
                          q.difficulty === 'easy' ? 'text-brand' :
                          q.difficulty === 'medium' ? 'text-amber-500' : 'text-red-400',
                        )}>
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            q.difficulty === 'easy' ? 'bg-brand' :
                            q.difficulty === 'medium' ? 'bg-amber-400' : 'bg-red-400',
                          )} />
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="px-5 py-5 space-y-4">
                        {/* Question */}
                        <p className="font-serif text-[16px] font-medium leading-snug text-ink">{q.prompt}</p>

                        {/* Choices — auto-revealed, no interaction */}
                        <ul className="space-y-2">
                          {q.choices.map((choice, idx) => {
                            const letter    = OPTION_LETTERS[idx] ?? String(idx + 1)
                            const isCorrect = correctIdx !== -1 && idx === correctIdx
                            const isWrong   = wrongIdx !== null && idx === wrongIdx && !isCorrect

                            return (
                              <li key={idx}>
                                <div className={cn(
                                  'flex items-center gap-3 rounded-xl border px-4 py-3 text-[13px]',
                                  isCorrect && 'border-brand/30 bg-brand-tint/20',
                                  isWrong   && 'border-red-200 bg-red-50/50',
                                  !isCorrect && !isWrong && 'border-hairline opacity-40',
                                )}>
                                  <span className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold',
                                    isCorrect && 'border-brand bg-brand text-white',
                                    isWrong   && 'border-red-300 bg-red-100 text-red-600',
                                    !isCorrect && !isWrong && 'border-hairline text-ink-faint',
                                  )}>
                                    {isCorrect ? <CheckCircle2 size={11} /> :
                                     isWrong   ? <XCircle size={11} /> : letter}
                                  </span>
                                  <span className={cn(
                                    'leading-snug flex-1',
                                    isCorrect ? 'font-medium text-ink' :
                                    isWrong   ? 'text-ink-muted line-through' : 'text-ink-faint',
                                  )}>
                                    {choice}
                                  </span>
                                  {isCorrect && (
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-brand shrink-0">correct</span>
                                  )}
                                  {isWrong && (
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 shrink-0">your answer</span>
                                  )}
                                </div>
                              </li>
                            )
                          })}
                        </ul>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand-tint/10 px-4 py-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                            <p className="text-[12px] text-ink-muted leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
