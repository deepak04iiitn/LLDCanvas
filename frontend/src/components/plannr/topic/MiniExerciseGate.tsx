'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Loader2, PenLine, Search, Bug, ClipboardList } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MiniExerciseGateProps {
  exerciseType: 'detective_scenario' | 'design_bug' | 'quiz_set' | 'none'
  exerciseId: string
  topicSlug: string
  /** Called with a 0-100 score when the exercise is completed */
  onComplete: (score: number) => void
  buildsSkills?: string[]
}

// ─── Reflection prompt (exerciseType === 'none') ──────────────────────────────

function SelfAssessmentGate({ onComplete }: { onComplete: (score: number) => void }) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!text.trim()) return
    setSubmitted(true)
    setTimeout(() => onComplete(75), 600)
  }

  return (
    <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 space-y-4">
      <div className="flex items-start gap-2">
        <PenLine size={15} className="shrink-0 mt-0.5 text-brand" />
        <p className="text-[14px] text-ink leading-relaxed">
          Describe how you would apply this in an LLD interview.
        </p>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted}
        rows={4}
        placeholder="Write your reflection here…"
        className="w-full rounded-xl border border-hairline bg-paper p-3 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none disabled:opacity-60"
      />
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="w-full py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Submit Reflection
        </button>
      ) : (
        <div className="flex items-center gap-2 text-[13px] text-brand">
          <CheckCircle2 size={16} /> Reflection submitted — moving on.
        </div>
      )}
    </div>
  )
}

// ─── Detective Scenario ───────────────────────────────────────────────────────

interface DetectiveScenario {
  _id: string
  stem: string
  choices?: { id: string; text: string }[]
  inputType?: 'choice' | 'text'
}

function DetectiveGate({
  exerciseId,
  onComplete,
}: {
  exerciseId: string
  onComplete: (score: number) => void
}) {
  const [scenario, setScenario] = useState<DetectiveScenario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ isCorrect: boolean; feedback?: string } | null>(null)

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    fetch(`${BASE}/learn/detective/${exerciseId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setScenario(d.scenario ?? d))
      .catch(() => setError('Could not load detective scenario.'))
      .finally(() => setLoading(false))
  }, [exerciseId])

  async function handleSubmit() {
    if (!scenario) return
    setSubmitting(true)
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
      const answer = scenario.inputType === 'text' ? textAnswer : selected
      const res = await fetch(`${BASE}/learn/detective/${exerciseId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })
      const data = await res.json()
      setResult({ isCorrect: data.isCorrect, feedback: data.feedback })
      setTimeout(() => onComplete(data.isCorrect ? 90 : 30), 1500)
    } catch {
      setError('Failed to submit answer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-paper-elevated border border-hairline p-8 flex items-center justify-center gap-2 text-brand">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Loading scenario…</span>
      </div>
    )
  }

  if (error || !scenario) {
    return (
      <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 text-center">
        <p className="text-[14px] text-ink-muted">{error ?? 'Scenario not available.'}</p>
        <button
          onClick={() => onComplete(30)}
          className="mt-3 text-[12px] text-ink-muted underline"
        >
          Skip and continue
        </button>
      </div>
    )
  }

  const isChoice = !scenario.inputType || scenario.inputType === 'choice'

  return (
    <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Search size={14} className="text-brand" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">Detective Scenario</span>
      </div>

      <div className="bg-paper rounded-xl border border-hairline p-4">
        <p className="text-[15px] text-ink leading-relaxed">{scenario.stem}</p>
      </div>

      {result ? (
        <div
          className={cn(
            'rounded-xl p-4 flex items-center gap-3',
            result.isCorrect ? 'bg-brand-tint/30 border border-brand/20' : 'bg-paper-elevated border border-hairline',
          )}
        >
          {result.isCorrect ? (
            <CheckCircle2 size={20} className="text-brand shrink-0" />
          ) : (
            <XCircle size={20} className="text-ink-muted shrink-0" />
          )}
          <p className="text-[14px] text-ink">
            {result.isCorrect ? 'Correct! Well done.' : 'Not quite — keep that in mind.'}
            {result.feedback && ` ${result.feedback}`}
          </p>
        </div>
      ) : isChoice && scenario.choices ? (
        <div className="space-y-2">
          {scenario.choices.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                'w-full text-left rounded-xl border-2 p-3 transition-all text-[13px]',
                selected === c.id
                  ? 'border-brand bg-brand-tint/30 text-ink'
                  : 'border-hairline hover:bg-paper-elevated text-ink',
              )}
            >
              {c.text}
            </button>
          ))}
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 mt-1"
          >
            {submitting ? 'Submitting…' : 'Submit Answer'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
            rows={3}
            placeholder="Type your answer…"
            className="w-full rounded-xl border border-hairline p-3 text-[13px] text-ink resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            onClick={handleSubmit}
            disabled={!textAnswer.trim() || submitting}
            className="w-full py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Design Bug ───────────────────────────────────────────────────────────────

const ISSUE_TYPE_OPTIONS = [
  'Missing abstraction',
  'Wrong responsibility',
  'Tight coupling',
  'Violation of SRP',
  'Violation of OCP',
  'Violation of LSP',
  'Violation of ISP',
  'Violation of DIP',
  'Poor naming',
  'Missing interface',
  'Inappropriate inheritance',
  'God class',
]

interface DesignBug {
  _id: string
  description: string
  classNames?: string[]
}

function DesignBugGate({
  exerciseId,
  onComplete,
}: {
  exerciseId: string
  onComplete: (score: number) => void
}) {
  const [bug, setBug] = useState<DesignBug | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; feedback?: string } | null>(null)

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    fetch(`${BASE}/learn/debuglab/design/${exerciseId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setBug(d.bug ?? d))
      .catch(() => setError('Could not load design bug.'))
      .finally(() => setLoading(false))
  }, [exerciseId])

  function toggleIssue(issue: string) {
    setSelectedIssues(prev =>
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue],
    )
  }

  async function handleSubmit() {
    if (!bug) return
    setSubmitting(true)
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
      const res = await fetch(`${BASE}/learn/debuglab/design/${exerciseId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueTypes: selectedIssues }),
      })
      const data = await res.json()
      setResult({ score: data.score ?? 50, feedback: data.feedback })
      setTimeout(() => onComplete(data.score ?? 50), 1500)
    } catch {
      setError('Failed to submit.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-paper-elevated border border-hairline p-8 flex items-center justify-center gap-2 text-brand">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Loading design bug…</span>
      </div>
    )
  }

  if (error || !bug) {
    return (
      <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 text-center">
        <p className="text-[14px] text-ink-muted">{error ?? 'Exercise not available.'}</p>
        <button
          onClick={() => onComplete(30)}
          className="mt-3 text-[12px] text-ink-muted underline"
        >
          Skip and continue
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Bug size={14} className="text-brand" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">Design Bug</span>
      </div>

      <div className="bg-paper rounded-xl border border-hairline p-4 space-y-2">
        <p className="text-[15px] text-ink leading-relaxed">{bug.description}</p>
        {bug.classNames && bug.classNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {bug.classNames.map(c => (
              <code
                key={c}
                className="px-2 py-0.5 rounded-md bg-paper-elevated border border-hairline text-[12px] font-mono text-ink-muted"
              >
                {c}
              </code>
            ))}
          </div>
        )}
      </div>

      {result ? (
        <div className="rounded-xl p-4 bg-brand-tint/20 border border-brand/20">
          <p className="text-[14px] text-ink font-medium">Score: {result.score}/100</p>
          {result.feedback && <p className="text-[13px] text-ink-muted mt-1">{result.feedback}</p>}
        </div>
      ) : (
        <>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
            Pick the issue types present in this design:
          </p>
          <div className="flex flex-wrap gap-2">
            {ISSUE_TYPE_OPTIONS.map(issue => (
              <button
                key={issue}
                onClick={() => toggleIssue(issue)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all',
                  selectedIssues.includes(issue)
                    ? 'bg-brand border-brand text-white'
                    : 'border-hairline text-ink-muted hover:bg-paper-elevated',
                )}
              >
                {issue}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={selectedIssues.length === 0 || submitting}
            className="w-full py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Submit Issues'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Quiz Set ─────────────────────────────────────────────────────────────────

interface QuizQuestion {
  _id: string
  question: string
  choices: { id: string; text: string }[]
  skillTag?: string
}

function QuizSetGate({
  buildsSkills,
  onComplete,
}: {
  buildsSkills: string[]
  onComplete: (score: number) => void
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    fetch(`${BASE}/learn/quiz/today`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const allQ: QuizQuestion[] = d.questions ?? []
        const filtered = allQ.filter(q => q.skillTag && buildsSkills.includes(q.skillTag))
        setQuestions((filtered.length >= 3 ? filtered : allQ).slice(0, 3))
      })
      .catch(() => setError('Could not load quiz questions.'))
      .finally(() => setLoading(false))
  }, [buildsSkills])

  function selectAnswer(qId: string, choiceId: string) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qId]: choiceId }))
  }

  async function handleSubmit() {
    if (questions.some(q => !answers[q._id])) return
    setSubmitted(true)
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    let correct = 0
    const newResults: Record<string, boolean> = {}
    await Promise.all(
      questions.map(async q => {
        try {
          const res = await fetch(`${BASE}/learn/quiz/${q._id}/answer`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choiceId: answers[q._id] }),
          })
          const data = await res.json()
          newResults[q._id] = !!data.isCorrect
          if (data.isCorrect) correct++
        } catch {
          newResults[q._id] = false
        }
      }),
    )
    setResults(newResults)
    setTimeout(() => onComplete(Math.round((correct / questions.length) * 100)), 1500)
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-paper-elevated border border-hairline p-8 flex items-center justify-center gap-2 text-brand">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Loading quiz…</span>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 text-center">
        <p className="text-[14px] text-ink-muted">{error ?? 'No quiz questions available for this topic.'}</p>
        <button
          onClick={() => onComplete(50)}
          className="mt-3 text-[12px] text-ink-muted underline"
        >
          Skip and continue
        </button>
      </div>
    )
  }

  const allAnswered = questions.every(q => answers[q._id])

  return (
    <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={14} className="text-brand" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">
          Quick Quiz &middot; {questions.length} questions
        </span>
      </div>

      {questions.map((q, i) => (
        <div key={q._id} className="bg-paper rounded-xl border border-hairline p-4 space-y-3">
          <p className="text-[14px] font-medium text-ink">
            <span className="text-brand mr-1">Q{i + 1}.</span> {q.question}
          </p>
          <div className="space-y-1.5">
            {q.choices.map(c => (
              <button
                key={c.id}
                onClick={() => selectAnswer(q._id, c.id)}
                disabled={submitted}
                className={cn(
                  'w-full text-left rounded-lg border px-3 py-2 text-[13px] transition-all',
                  submitted
                    ? answers[q._id] === c.id
                      ? results[q._id]
                        ? 'border-brand bg-brand-tint/30 text-ink'
                        : 'border-ink-faint bg-paper-elevated text-ink-muted'
                      : 'border-hairline text-ink-muted opacity-60'
                    : answers[q._id] === c.id
                    ? 'border-brand bg-brand-tint/30 text-ink'
                    : 'border-hairline hover:bg-paper-elevated text-ink',
                )}
              >
                {c.text}
              </button>
            ))}
          </div>
          {submitted && (
            <p className={cn('text-[12px] font-medium flex items-center gap-1', results[q._id] ? 'text-brand' : 'text-ink-muted')}>
              {results[q._id]
                ? <><CheckCircle2 size={12} /> Correct</>
                : <><XCircle size={12} /> Incorrect</>
              }
            </p>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Submit Answers
        </button>
      )}
    </div>
  )
}

// ─── Main Gate ────────────────────────────────────────────────────────────────

export function MiniExerciseGate({
  exerciseType,
  exerciseId,
  topicSlug: _topicSlug,
  onComplete,
  buildsSkills = [],
}: MiniExerciseGateProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-1">Practice</p>
        <h3 className="font-serif text-lg font-medium text-ink">Check Your Understanding</h3>
      </div>
      {(() => {
        switch (exerciseType) {
          case 'detective_scenario':
            return <DetectiveGate exerciseId={exerciseId} onComplete={onComplete} />
          case 'design_bug':
            return <DesignBugGate exerciseId={exerciseId} onComplete={onComplete} />
          case 'quiz_set':
            return <QuizSetGate buildsSkills={buildsSkills} onComplete={onComplete} />
          case 'none':
          default:
            return <SelfAssessmentGate onComplete={onComplete} />
        }
      })()}
    </div>
  )
}
