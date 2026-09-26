'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  learnApi,
  type QuizQuestion,
  type QuizSubmitResult,
  type QuizStreak,
} from '@/lib/learn-api'
import { cn } from '@/lib/utils'
import { StreakCalendar } from './StreakCalendar'

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

type Tab = 'quiz' | 'revisit'
type QuizPhase = 'quiz' | 'summary'

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl border border-hairline bg-paper-elevated"
        />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function QuizRunner() {
  const [tab, setTab] = useState<Tab>('quiz')

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [setId, setSetId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<QuizPhase>('quiz')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})  // currently selected
  const [locked, setLocked] = useState<Record<string, number>>({})    // confirmed per question
  const [checkedCurrent, setCheckedCurrent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizSubmitResult | null>(null)

  // ── Streak state ────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState<QuizStreak | null>(null)
  const [showStreak, setShowStreak] = useState(false)

  // ── Revisit bank state ──────────────────────────────────────────────────────
  const [revisitQuestions, setRevisitQuestions] = useState<QuizQuestion[]>([])
  const [revisitLoading, setRevisitLoading] = useState(false)
  const [revisitAnswers, setRevisitAnswers] = useState<Record<string, number>>({})
  const [revisitResults, setRevisitResults] = useState<Record<string, QuizSubmitResult>>({})
  const [revisitSubmitting, setRevisitSubmitting] = useState<Record<string, boolean>>({})

  // ── Load quiz + streak on mount ─────────────────────────────────────────────
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
            setQuestions(data.value.questions ?? [])
            setSetId((data.value as any).setId)
          } else {
            toast.error('Failed to load quiz')
          }
          if (streakData.status === 'fulfilled') {
            setStreak(streakData.value)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Load revisit bank when tab changes ──────────────────────────────────────
  useEffect(() => {
    if (tab !== 'revisit') return
    let cancelled = false
    setRevisitLoading(true)
    learnApi.quiz.revisitBank()
      .then(data => { if (!cancelled) setRevisitQuestions(data.questions ?? []) })
      .catch(() => toast.error('Failed to load revisit bank'))
      .finally(() => { if (!cancelled) setRevisitLoading(false) })
    return () => { cancelled = true }
  }, [tab])

  const currentQ = questions[currentIdx]
  const total = questions.length
  const isLastQ = currentIdx === total - 1

  // ── Submit all answers ──────────────────────────────────────────────────────
  const submit = useCallback(
    async (finalAnswers: Record<string, number>) => {
      setSubmitting(true)
      try {
        const payload = questions.map(q => ({
          questionId: q._id,
          choiceIndex: finalAnswers[q._id],
        }))
        const res = await learnApi.quiz.submit(payload, setId)
        setResult(res)
        setPhase('summary')
        learnApi.quiz.streak().then(setStreak).catch(() => null)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Submit failed')
      } finally {
        setSubmitting(false)
      }
    },
    [questions, setId],
  )

  // ── Handle Check Answer click ───────────────────────────────────────────────
  const handleCheckAnswer = useCallback(() => {
    if (!currentQ) return
    const selectedIdx = answers[currentQ._id]
    if (selectedIdx === undefined) return

    const newLocked = { ...locked, [currentQ._id]: selectedIdx }
    setLocked(newLocked)
    setCheckedCurrent(true)

    if (isLastQ) {
      submit(newLocked)
    }
  }, [currentQ, answers, locked, isLastQ, submit])

  function handleNextQuestion() {
    setCurrentIdx(i => i + 1)
    setCheckedCurrent(false)
  }

  // ── Revisit bank: check one question ───────────────────────────────────────
  async function handleRevisitCheck(q: QuizQuestion) {
    const choiceIdx = revisitAnswers[q._id]
    if (choiceIdx === undefined) return
    setRevisitSubmitting(prev => ({ ...prev, [q._id]: true }))
    try {
      const res = await learnApi.quiz.submit([{ questionId: q._id, choiceIndex: choiceIdx }])
      setRevisitResults(prev => ({ ...prev, [q._id]: res }))
    } catch {
      toast.error('Failed to check answer')
    } finally {
      setRevisitSubmitting(prev => ({ ...prev, [q._id]: false }))
    }
  }

  return (
    <CategoryShell
      title="Daily LLD Quiz"
      subtitle="Five questions — patterns, SOLID, and judgment"
      backHref="/learn/quiz"
      backLabel="Daily Quiz"
      breadcrumb={[{ label: 'Learn', href: '/learn' }, { label: 'Daily Quiz', href: '/learn/quiz' }]}
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">

        {/* Tab bar */}
        <div className="flex gap-2">
          {(
            [
              ['quiz', "Today's Quiz"],
              ['revisit', 'Revisit Bank'],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                tab === t
                  ? 'bg-brand text-white'
                  : 'border border-hairline bg-paper-elevated text-ink-muted hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ──────────────────────────── Quiz tab ────────────────────────────── */}
        {tab === 'quiz' && (
          <>
            {loading ? (
              <SkeletonCards />
            ) : questions.length === 0 ? (
              <p className="text-center text-[14px] text-ink-muted">
                No published questions yet. Run the quiz seed script.
              </p>
            ) : phase === 'summary' && result ? (
              // ── Summary screen ─────────────────────────────────────────────
              <div className="space-y-6">
                {/* Score card */}
                <div className="rounded-xl border border-hairline bg-paper-elevated p-6 text-center">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Result
                  </p>
                  <p className="mt-2 font-serif text-4xl font-medium text-brand">
                    {result.correct}
                    <span className="text-3xl text-ink-faint"> / {result.total}</span>
                  </p>
                  {result.interviewReadiness !== undefined && (
                    <p className="mt-2 text-[13px] text-ink-muted">
                      Interview readiness:{' '}
                      <strong className="text-ink">{result.interviewReadiness}</strong>/100
                    </p>
                  )}
                </div>

                {/* Skill deltas */}
                {result.skillDeltas && Object.keys(result.skillDeltas).length > 0 && (
                  <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
                    <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                      Skill changes
                    </p>
                    <div className="space-y-2">
                      {Object.entries(result.skillDeltas).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2">
                          <span className="w-36 shrink-0 text-[12px] text-ink-muted">
                            {SKILL_LABELS[k] ?? k}
                          </span>
                          <div className="flex-1 h-1 rounded-full bg-[hsl(var(--color-hairline)/0.6)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand transition-all"
                              style={{ width: `${Math.min(100, v * 10)}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] font-medium text-brand">
                            +{v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-question review */}
                <div className="space-y-3">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Question review
                  </p>
                  {questions.map((q, i) => {
                    const detail = result.details.find(d => d.questionId === q._id)
                    return (
                      <div
                        key={q._id}
                        className="rounded-xl border border-hairline bg-paper-elevated p-4"
                      >
                        <div className="flex items-start gap-2.5">
                          {detail?.correct ? (
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand" />
                          ) : (
                            <XCircle size={15} className="mt-0.5 shrink-0 text-ink-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                              Q{i + 1} · {q.topic}
                            </p>
                            <p className="mt-0.5 text-[13px] font-medium leading-snug text-ink">
                              {q.prompt}
                            </p>
                            {!detail?.correct && detail && (
                              <p className="mt-1 text-[12px] text-ink-muted">
                                Correct:{' '}
                                <span className="font-medium text-ink">
                                  {q.choices[detail.correctIndex]}
                                </span>
                              </p>
                            )}
                            {detail?.explanation && (
                              <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                                {detail.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Back to Learn
                  </Link>
                </div>

                {/* Streak calendar (toggled) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowStreak(s => !s)}
                    className="mb-3 text-[12px] text-brand hover:underline"
                  >
                    {showStreak ? 'Hide my streak' : 'View my streak'}
                  </button>
                  {showStreak && streak && (
                    <StreakCalendar
                      last30Days={streak.last30Days}
                      currentStreak={streak.currentStreak}
                    />
                  )}
                </div>
              </div>
            ) : (
              // ── Single-question view ───────────────────────────────────────
              currentQ && (
                <div className="space-y-5">
                  {/* Progress bar */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-ink-faint">
                        Q {currentIdx + 1} of {total}
                      </span>
                      <span className="font-mono text-[11px] capitalize text-ink-faint">
                        {currentQ.difficulty} · {currentQ.topic}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--color-hairline)/0.6)]">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-300"
                        style={{
                          width: `${((currentIdx + (checkedCurrent ? 1 : 0)) / total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="rounded-xl border border-hairline bg-paper-elevated px-5 py-4">
                    <p className="font-serif text-[17px] font-medium leading-snug text-ink">
                      {currentQ.prompt}
                    </p>
                  </div>

                  {/* Answer choices */}
                  <ul className="space-y-2">
                    {currentQ.choices.map((choice, idx) => {
                      const selected = answers[currentQ._id] === idx
                      const isLocked = checkedCurrent
                      return (
                        <li key={idx}>
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() =>
                              setAnswers(prev => ({ ...prev, [currentQ._id]: idx }))
                            }
                            className={cn(
                              'w-full rounded-xl border px-4 py-3 text-left text-[14px] transition-colors',
                              selected
                                ? 'border-brand/50 bg-brand-tint text-ink'
                                : 'border-hairline bg-paper text-ink-muted hover:border-brand/25 hover:text-ink',
                              isLocked && 'cursor-default opacity-70',
                            )}
                          >
                            {choice}
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  {/* Action row */}
                  {checkedCurrent ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[13px] text-ink-muted">Answer locked in.</p>
                      {isLastQ ? (
                        submitting && (
                          <span className="flex items-center gap-2 text-[13px] text-ink-faint">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Submitting…
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                        >
                          Next Question
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={answers[currentQ._id] === undefined}
                      onClick={handleCheckAnswer}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {isLastQ ? 'Submit Quiz' : 'Check Answer'}
                    </button>
                  )}
                </div>
              )
            )}
          </>
        )}

        {/* ──────────────────────── Revisit Bank tab ────────────────────────── */}
        {tab === 'revisit' && (
          <>
            {revisitLoading ? (
              <SkeletonCards />
            ) : revisitQuestions.length === 0 ? (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-8 text-center">
                <p className="text-[14px] text-ink-muted">
                  Your revisit bank is empty — keep answering questions!
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-[12px] text-ink-faint">
                  {revisitQuestions.length} question
                  {revisitQuestions.length !== 1 ? 's' : ''} to revisit
                </p>
                {revisitQuestions.map((q, i) => {
                  const qResult = revisitResults[q._id]
                  const isChecked = !!qResult
                  const isSubmitting = !!revisitSubmitting[q._id]
                  const selected = revisitAnswers[q._id]
                  const detail = qResult?.details.find(d => d.questionId === q._id)

                  return (
                    <div
                      key={q._id}
                      className="space-y-3 rounded-xl border border-hairline bg-paper-elevated p-5"
                    >
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                          #{i + 1} · {q.topic} · {q.difficulty}
                        </p>
                        <p className="mt-2 text-[14px] font-medium leading-snug text-ink">
                          {q.prompt}
                        </p>
                      </div>

                      {/* Interactive choices */}
                      <ul className="space-y-1.5">
                        {q.choices.map((choice, idx) => {
                          const isSelected = selected === idx
                          const isCorrect = isChecked && detail && idx === detail.correctIndex
                          const isWrong = isChecked && isSelected && !detail?.correct

                          return (
                            <li key={idx}>
                              <button
                                type="button"
                                disabled={isChecked || isSubmitting}
                                onClick={() =>
                                  setRevisitAnswers(prev => ({ ...prev, [q._id]: idx }))
                                }
                                className={cn(
                                  'w-full rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors',
                                  isCorrect
                                    ? 'border-brand/40 bg-brand-tint font-medium text-brand'
                                    : isWrong
                                    ? 'border-ink/20 bg-paper text-ink-faint line-through'
                                    : isSelected
                                    ? 'border-brand/40 bg-brand-tint text-ink'
                                    : 'border-hairline bg-paper text-ink-muted hover:border-brand/25',
                                  isChecked &&
                                    !isCorrect &&
                                    !isWrong &&
                                    'opacity-50',
                                )}
                              >
                                {choice}
                              </button>
                            </li>
                          )
                        })}
                      </ul>

                      {/* Feedback / Check button */}
                      {isChecked && detail ? (
                        <div className="flex items-start gap-2">
                          {detail.correct ? (
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand" />
                          ) : (
                            <XCircle size={14} className="mt-0.5 shrink-0 text-ink-muted" />
                          )}
                          <p className="text-[12px] leading-relaxed text-ink-muted">
                            {detail.correct ? 'Correct! ' : 'Incorrect. '}
                            {detail.explanation}
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={selected === undefined || isSubmitting}
                          onClick={() => handleRevisitCheck(q)}
                          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                          {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                          Check Answer
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </CategoryShell>
  )
}
