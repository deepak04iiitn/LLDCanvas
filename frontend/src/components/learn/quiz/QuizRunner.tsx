'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  learnApi,
  type QuizQuestion,
  type QuizSubmitDetail,
  type QuizStreak,
  type QuizSubmitResult,
} from '@/lib/learn-api'
import { cn } from '@/lib/utils'
import { StreakCalendar } from './StreakCalendar'

// Map skill keys to human-readable labels
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

export function QuizRunner() {
  const [tab, setTab] = useState<Tab>('quiz')

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [setId, setSetId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizSubmitResult | null>(null)

  // ── Streak state ────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState<QuizStreak | null>(null)

  // ── Revisit bank state ──────────────────────────────────────────────────────
  const [revisitQuestions, setRevisitQuestions] = useState<QuizQuestion[]>([])
  const [revisitLoading, setRevisitLoading] = useState(false)

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

  // ── Load revisit bank when switching to that tab ────────────────────────────
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

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submit = useCallback(async () => {
    if (questions.some(q => answers[q._id] === undefined)) {
      toast.error('Answer every question before submitting')
      return
    }
    setSubmitting(true)
    try {
      const payload = questions.map(q => ({
        questionId: q._id,
        choiceIndex: answers[q._id],
      }))
      const res = await learnApi.quiz.submit(payload, setId)
      setResult(res)
      // Refresh streak after submission
      learnApi.quiz.streak().then(setStreak).catch(() => null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }, [answers, questions, setId])

  // ── Derive weakest trained skill from result ────────────────────────────────
  const weakestSkillTrained = result?.skillDeltas
    ? Object.entries(result.skillDeltas).sort(([, a], [, b]) => b - a)[0]?.[0]
    : undefined

  return (
    <CategoryShell
      title="Daily LLD Quiz"
      subtitle="Five questions — patterns, SOLID, and judgment"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">

        {/* Streak calendar */}
        {streak && (
          <StreakCalendar
            last30Days={streak.last30Days}
            currentStreak={streak.currentStreak}
          />
        )}

        {/* Tab bar */}
        <div className="flex gap-2">
          {([ ['quiz', "Today's Quiz"], ['revisit', 'Revisit Bank'] ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                tab === t
                  ? 'bg-brand text-white'
                  : 'bg-paper-elevated text-ink-muted border border-hairline hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Quiz tab ────────────────────────────────────────────────────────── */}
        {tab === 'quiz' && (
          <>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-center text-[14px] text-ink-muted">
                No published questions yet. Run the quiz seed script.
              </p>
            ) : result ? (
              <div className="space-y-6">
                {/* Score card */}
                <div className="rounded-xl border border-hairline bg-paper-elevated p-6 text-center">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                    Result
                  </p>
                  <p className="mt-2 font-serif text-3xl font-medium text-ink">
                    {result.correct}
                    <span className="text-ink-faint"> / {result.total}</span>
                  </p>
                  {result.interviewReadiness !== undefined && (
                    <p className="mt-1 text-[12px] text-ink-muted">
                      Interview readiness: <strong>{result.interviewReadiness}</strong>/100
                    </p>
                  )}
                </div>

                {/* Post-quiz action block */}
                {weakestSkillTrained && (
                  <div className="rounded-xl border border-brand/25 bg-brand-tint p-4 flex items-center justify-between gap-4">
                    <p className="text-[13px] text-ink">
                      Your weakest area:{' '}
                      <strong>{SKILL_LABELS[weakestSkillTrained] ?? weakestSkillTrained}</strong>.
                      Keep sharpening it!
                    </p>
                    <a
                      href="/learn"
                      className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      Try a challenge →
                    </a>
                  </div>
                )}

                {/* Answer details */}
                <ul className="space-y-4">
                  {questions.map((q, i) => {
                    const detail = result.details.find(d => d.questionId === q._id)
                    return (
                      <li
                        key={q._id}
                        className="rounded-xl border border-hairline bg-paper-elevated p-5"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                          Q{i + 1} · {q.topic}
                        </p>
                        <p className="mt-1 text-[14px] font-medium text-ink">{q.prompt}</p>
                        <p
                          className={cn(
                            'mt-2 text-[13px] font-medium',
                            detail?.correct ? 'text-emerald-700' : 'text-red-700',
                          )}
                        >
                          {detail?.correct ? 'Correct' : 'Incorrect'}
                          {!detail?.correct && detail
                            ? ` — answer was: ${q.choices[detail.correctIndex]}`
                            : ''}
                        </p>
                        {detail?.explanation && (
                          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                            {detail.explanation}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((q, i) => (
                  <div
                    key={q._id}
                    className="rounded-xl border border-hairline bg-paper-elevated p-5"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                      Q{i + 1} · {q.difficulty} · {q.topic}
                    </p>
                    <p className="mt-2 text-[15px] font-medium leading-snug text-ink">
                      {q.prompt}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {q.choices.map((choice, idx) => {
                        const selected = answers[q._id] === idx
                        return (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() =>
                                setAnswers(prev => ({ ...prev, [q._id]: idx }))
                              }
                              className={cn(
                                'w-full rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors',
                                selected
                                  ? 'border-brand/40 bg-brand-tint text-ink'
                                  : 'border-hairline bg-paper text-ink-muted hover:border-brand/25',
                              )}
                            >
                              {choice}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit answers
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Revisit Bank tab ────────────────────────────────────────────────── */}
        {tab === 'revisit' && (
          <>
            {revisitLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
              </div>
            ) : revisitQuestions.length === 0 ? (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-8 text-center">
                <p className="text-[14px] text-ink-muted">
                  Your revisit bank is empty — keep answering questions correctly! 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[12px] text-ink-faint">
                  {revisitQuestions.length} question{revisitQuestions.length !== 1 ? 's' : ''} to revisit
                </p>
                {revisitQuestions.map((q, i) => (
                  <div
                    key={q._id}
                    className="rounded-xl border border-red-200 bg-paper-elevated p-5"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                      #{i + 1} · {q.topic} · {q.difficulty}
                    </p>
                    <p className="mt-2 text-[14px] font-medium leading-snug text-ink">
                      {q.prompt}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {q.choices.map((choice, idx) => (
                        <li
                          key={idx}
                          className="rounded-lg border border-hairline px-3 py-2 text-[13px] text-ink-muted"
                        >
                          {choice}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </CategoryShell>
  )
}
