'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MiniExerciseGateProps {
  exerciseType: 'detective_scenario' | 'design_bug' | 'quiz_set' | 'none'
  exerciseId: string
  topicSlug: string
  /** Called with a 0-100 score when the exercise is completed */
  onComplete: (score: number) => void
  buildsSkills?: string[]
}

// ─── Performance buttons (exerciseType === 'none') ───────────────────────────

const PERFORMANCE_OPTIONS: {
  id: 'excellent' | 'good' | 'fair' | 'poor'
  label: string
  desc: string
  score: number
  color: string
}[] = [
  {
    id: 'excellent',
    label: '🚀 Excellent',
    desc: 'I fully understood the concept and can explain it clearly',
    score: 100,
    color: 'border-green-400 hover:bg-green-50',
  },
  {
    id: 'good',
    label: '✅ Good',
    desc: 'I understood the main points, some parts need more practice',
    score: 75,
    color: 'border-blue-400 hover:bg-blue-50',
  },
  {
    id: 'fair',
    label: '🤔 Fair',
    desc: 'I partially understood. Will need to revisit',
    score: 50,
    color: 'border-amber-400 hover:bg-amber-50',
  },
  {
    id: 'poor',
    label: '😅 Struggled',
    desc: 'This was mostly new to me. Needs more study',
    score: 25,
    color: 'border-red-400 hover:bg-red-50',
  },
]

function SelfAssessmentGate({ onComplete }: { onComplete: (score: number) => void }) {
  return (
    <div className="rounded-2xl bg-paper-elevated border border-hairline p-6 space-y-4">
      <div className="text-center mb-2">
        <p className="text-2xl">🎯</p>
        <h3 className="font-serif text-lg font-medium text-ink mt-2">How well did you understand this topic?</h3>
        <p className="text-[13px] text-ink-muted mt-1">Be honest — your skill scores are based on your answer.</p>
      </div>
      <div className="space-y-2">
        {PERFORMANCE_OPTIONS.map(o => (
          <button
            key={o.id}
            onClick={() => onComplete(o.score)}
            className={cn(
              'w-full text-left rounded-xl border-2 p-3 transition-all',
              o.color,
            )}
          >
            <p className="font-medium text-[14px] text-ink">{o.label}</p>
            <p className="text-[12px] text-ink-muted">{o.desc}</p>
          </button>
        ))}
      </div>
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
      // Delay slightly to show result before calling onComplete
      setTimeout(() => onComplete(data.isCorrect ? 90 : 30), 1500)
    } catch {
      setError('Failed to submit answer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8 flex items-center justify-center gap-2 text-indigo-600">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Loading scenario…</span>
      </div>
    )
  }

  if (error || !scenario) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-center">
        <p className="text-[14px] text-red-600">{error ?? 'Scenario not available.'}</p>
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
    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">🔍 Detective Scenario</span>
      </div>

      <div className="bg-white rounded-xl border border-indigo-100 p-4">
        <p className="text-[15px] text-ink leading-relaxed">{scenario.stem}</p>
      </div>

      {result ? (
        <div
          className={cn(
            'rounded-xl p-4 flex items-center gap-3',
            result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200',
          )}
        >
          {result.isCorrect ? (
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
          ) : (
            <XCircle size={20} className="text-amber-600 shrink-0" />
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
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-hairline hover:bg-paper-elevated text-ink',
              )}
            >
              {c.text}
            </button>
          ))}
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 mt-1"
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
            className="w-full rounded-xl border border-hairline p-3 text-[13px] text-ink resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSubmit}
            disabled={!textAnswer.trim() || submitting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
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
      <div className="rounded-2xl bg-red-50 border border-red-100 p-8 flex items-center justify-center gap-2 text-red-600">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Loading design bug…</span>
      </div>
    )
  }

  if (error || !bug) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-center">
        <p className="text-[14px] text-red-600">{error ?? 'Exercise not available.'}</p>
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
    <div className="rounded-2xl bg-red-50 border border-red-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-red-600">🐛 Design Bug</span>
      </div>

      <div className="bg-white rounded-xl border border-red-100 p-4 space-y-2">
        <p className="text-[15px] text-ink leading-relaxed">{bug.description}</p>
        {bug.classNames && bug.classNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {bug.classNames.map(c => (
              <code
                key={c}
                className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-[12px] font-mono text-red-700"
              >
                {c}
              </code>
            ))}
          </div>
        )}
      </div>

      {result ? (
        <div className="rounded-xl p-4 bg-green-50 border border-green-200">
          <p className="text-[14px] text-ink font-medium">Score: {result.score}/100</p>
          {result.feedback && <p className="text-[13px] text-ink-muted mt-1">{result.feedback}</p>}
        </div>
      ) : (
        <>
          <p className="text-[12px] font-semibold uppercase tracking-widest text-ink-muted">
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
                    ? 'bg-red-600 border-red-600 text-white'
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
            className="w-full py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
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
        // Filter by skill tags matching buildsSkills, fall back to first 3
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
    // For a local score, we'd need correctAnswers from the server.
    // We'll do a best-effort: submit each question and check isCorrect.
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
      <div className="rounded-2xl bg-violet-50 border border-violet-100 p-8 flex items-center justify-center gap-2 text-violet-600">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Loading quiz…</span>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="rounded-2xl bg-violet-50 border border-violet-100 p-6 text-center">
        <p className="text-[14px] text-violet-600">{error ?? 'No quiz questions available for this topic.'}</p>
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
    <div className="rounded-2xl bg-violet-50 border border-violet-100 p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600">📝 Quick Quiz ({questions.length} questions)</span>
      </div>

      {questions.map((q, i) => (
        <div key={q._id} className="bg-white rounded-xl border border-violet-100 p-4 space-y-3">
          <p className="text-[14px] font-medium text-ink">
            <span className="text-violet-500 mr-1">Q{i + 1}.</span> {q.question}
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
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-400 bg-red-50 text-red-800'
                      : 'border-hairline text-ink-muted opacity-60'
                    : answers[q._id] === c.id
                    ? 'border-violet-500 bg-violet-50 text-violet-800'
                    : 'border-hairline hover:bg-paper-elevated text-ink',
                )}
              >
                {c.text}
              </button>
            ))}
          </div>
          {submitted && (
            <p
              className={cn(
                'text-[12px] font-medium',
                results[q._id] ? 'text-green-600' : 'text-red-500',
              )}
            >
              {results[q._id] ? '✓ Correct' : '✗ Incorrect'}
            </p>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
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
}
