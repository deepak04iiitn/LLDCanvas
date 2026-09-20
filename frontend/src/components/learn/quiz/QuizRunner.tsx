'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import {
  learnApi,
  type QuizQuestion,
  type QuizSubmitDetail,
} from '@/lib/learn-api'
import { cn } from '@/lib/utils'

export function QuizRunner() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    correct: number
    total: number
    details: QuizSubmitDetail[]
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.quiz.today()
        if (!cancelled) setQuestions(data.questions ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load quiz')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
      const res = await learnApi.quiz.submit(payload)
      setResult(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }, [answers, questions])

  return (
    <CategoryShell
      title="Daily LLD Quiz"
      subtitle="Five questions — patterns, SOLID, and judgment"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
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
            <div className="rounded-xl border border-hairline bg-paper-elevated p-6 text-center">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Result
              </p>
              <p className="mt-2 font-serif text-3xl font-medium text-ink">
                {result.correct}
                <span className="text-ink-faint"> / {result.total}</span>
              </p>
            </div>
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
      </div>
    </CategoryShell>
  )
}
