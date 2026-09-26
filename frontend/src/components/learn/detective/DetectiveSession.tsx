'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle, TrendingUp, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Common pattern names shown as suggestion chips ─────────────────────────────
const COMMON_PATTERNS = [
  'Observer', 'Strategy', 'Factory', 'Singleton', 'Decorator',
  'Command', 'Adapter', 'Facade', 'Template', 'Builder',
  'Iterator', 'Composite', 'Bridge', 'State', 'Proxy',
]

type ScenarioPayload = {
  id?: string
  slug: string
  title: string
  mode: string
  difficulty: string
  stem: string
  choices: string[]
  diagramSnapshot?: string
  // suggest mode
  problemContext?: string
  // compare mode
  patternA?: string
  patternB?: string
  comparisonContext?: string
}

type SubmitResult = {
  correct: boolean
  partialCredit?: boolean
  correctAnswer: string
  explanation: string
  skillDeltas: Record<string, number>
  interviewReadiness?: number
  // compare mode
  matchedKeywords?: string[]
  keyTradeoffs?: string[]
}

export function DetectiveSession() {
  const params = useParams()
  const id = String(params.id ?? '')

  const [scenario, setScenario] = useState<ScenarioPayload | null>(null)
  const [attemptId, setAttemptId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [choice, setChoice] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  // Timer
  const startTimeRef = useRef<number>(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.detective.start(id)
        if (!cancelled) {
          setScenario(data.scenario)
          setAttemptId(data.attemptId)
          startTimeRef.current = Date.now()
          timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
          }, 1000)
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to start scenario')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [id])

  async function handleSubmit() {
    if (!choice.trim() || !scenario) return
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
    setSubmitting(true)
    try {
      const res = await learnApi.detective.submit(id, {
        answer: choice.trim(),
        scenarioId: scenario.id ?? id,
        timeTakenSeconds,
      })
      setResult(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // ── Derived helpers ──────────────────────────────────────────────────────────
  const mode = scenario?.mode ?? ''
  const isChoiceMode = mode === 'identify' || mode === 'detect' || mode === 'explain'
  const isSuggestMode = mode === 'suggest'
  const isCompareMode = mode === 'compare'

  // Result badge label
  function resultLabel() {
    if (!result) return ''
    if (result.correct) return 'Correct!'
    if (result.partialCredit) return 'Partial credit — you caught one tradeoff!'
    return isChoiceMode
      ? `Not quite — the answer is "${result.correctAnswer}"`
      : 'Not quite — see the explanation below.'
  }

  return (
    <CategoryShell
      title={scenario?.title ?? 'Pattern Detective'}
      subtitle={
        scenario
          ? `${scenario.mode} · ${scenario.difficulty}`
          : 'Loading scenario…'
      }
      backHref="/learn/detective"
      backLabel="Scenarios"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !scenario ? (
          <p className="text-center text-[14px] text-ink-muted">
            Scenario not found.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Timer */}
            {!result && (
              <div className="flex justify-end">
                <span className="font-mono text-[12px] text-ink-faint tabular-nums">
                  {formatTime(elapsed)}
                </span>
              </div>
            )}

            {/* Diagram snapshot */}
            {scenario.diagramSnapshot && (
              <div className="mb-4 rounded-xl border border-hairline overflow-hidden">
                <img
                  src={scenario.diagramSnapshot}
                  alt="UML Diagram"
                  className="w-full"
                />
              </div>
            )}

            {/* Stem */}
            <p className="text-[15px] leading-relaxed text-ink">{scenario.stem}</p>

            {/* ── Mode 1: identify / detect / explain — choice buttons ────── */}
            {isChoiceMode && (
              <>
                <ul className="space-y-2">
                  {scenario.choices.map(c => (
                    <li key={c}>
                      <button
                        type="button"
                        disabled={!!result || submitting}
                        onClick={() => setChoice(c)}
                        className={cn(
                          'w-full rounded-lg border px-3 py-2.5 text-left text-[13px] capitalize transition-colors',
                          choice === c
                            ? 'border-brand/40 bg-brand-tint text-ink'
                            : 'border-hairline bg-paper-elevated text-ink-muted hover:border-brand/25',
                          result && c === result.correctAnswer
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                            : result && c === choice && !result.correct
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : '',
                        )}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>

                {!result && (
                  <button
                    type="button"
                    disabled={!choice || submitting}
                    onClick={handleSubmit}
                    className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Check answer
                  </button>
                )}
              </>
            )}

            {/* ── Mode 2: suggest — pattern suggestion with chips ─────────── */}
            {isSuggestMode && (
              <>
                {/* Problem context prose */}
                {scenario.problemContext && (
                  <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                      Problem
                    </p>
                    <p className="text-[14px] leading-relaxed text-ink">
                      {scenario.problemContext}
                    </p>
                  </div>
                )}

                {/* Pattern suggestion chips */}
                {!result && (
                  <div>
                    <p className="mb-2 text-[12px] text-ink-faint">
                      Click a pattern to fill it in, or type your own:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {COMMON_PATTERNS.map(p => (
                        <button
                          key={p}
                          type="button"
                          disabled={submitting}
                          onClick={() => setChoice(p)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                            choice.toLowerCase() === p.toLowerCase()
                              ? 'border-brand/50 bg-brand-tint text-brand'
                              : 'border-hairline bg-paper text-ink-muted hover:border-brand/30 hover:text-ink',
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text input */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-muted">
                    Which design pattern would you apply here?
                  </label>
                  <input
                    type="text"
                    disabled={!!result || submitting}
                    value={choice}
                    onChange={e => setChoice(e.target.value)}
                    placeholder="e.g. Observer"
                    className="w-full rounded-lg border border-hairline bg-paper-elevated px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none disabled:opacity-60"
                  />
                </div>

                {!result && (
                  <button
                    type="button"
                    disabled={!choice.trim() || submitting}
                    onClick={handleSubmit}
                    className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit pattern
                  </button>
                )}
              </>
            )}

            {/* ── Mode 3: compare — free-text tradeoff explanation ────────── */}
            {isCompareMode && (
              <>
                {/* Comparison prompt */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 space-y-2">
                  <p className="text-[14px] font-medium text-amber-900">
                    This design uses{' '}
                    <span className="font-semibold">{scenario.patternA}</span>. What is
                    another pattern (
                    <span className="font-semibold">{scenario.patternB}</span>) that could
                    work here, and what&apos;s the tradeoff between them?
                  </p>
                  {scenario.comparisonContext && (
                    <p className="text-[13px] leading-relaxed text-amber-800">
                      {scenario.comparisonContext}
                    </p>
                  )}
                </div>

                {/* Hint */}
                {!result && (
                  <div className="flex gap-2 rounded-lg border border-hairline bg-paper-elevated px-3 py-2.5">
                    <Lightbulb className="h-4 w-4 shrink-0 text-ink-faint mt-0.5" />
                    <p className="text-[12px] text-ink-muted leading-relaxed">
                      Think about: when would you choose{' '}
                      <span className="font-medium text-ink">{scenario.patternA}</span> over{' '}
                      <span className="font-medium text-ink">{scenario.patternB}</span> and
                      vice versa?
                    </p>
                  </div>
                )}

                {/* Textarea */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-muted">
                    Your explanation
                  </label>
                  <textarea
                    disabled={!!result || submitting}
                    value={choice}
                    onChange={e => setChoice(e.target.value)}
                    rows={5}
                    placeholder={`Explain the tradeoff between ${scenario.patternA} and ${scenario.patternB}…`}
                    className="w-full rounded-lg border border-hairline bg-paper-elevated px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none resize-y disabled:opacity-60"
                  />
                </div>

                {!result && (
                  <button
                    type="button"
                    disabled={!choice.trim() || submitting}
                    onClick={handleSubmit}
                    className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit explanation
                  </button>
                )}
              </>
            )}

            {/* ── Result panel ─────────────────────────────────────────────── */}
            {result && (
              <div className="rounded-xl border border-hairline bg-paper-elevated p-5 space-y-4">
                {/* Correct / incorrect / partial badge */}
                <div className="flex items-center gap-2">
                  {result.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : result.partialCredit ? (
                    <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                  <p
                    className={cn(
                      'text-[14px] font-semibold',
                      result.correct
                        ? 'text-emerald-700'
                        : result.partialCredit
                          ? 'text-amber-700'
                          : 'text-red-700',
                    )}
                  >
                    {resultLabel()}
                  </p>
                </div>

                {/* Explanation */}
                {result.explanation && (
                  <p className="text-[13px] leading-relaxed text-ink-muted">
                    {result.explanation}
                  </p>
                )}

                {/* Compare mode — keyword feedback */}
                {isCompareMode && result.keyTradeoffs && result.keyTradeoffs.length > 0 && (
                  <div className="rounded-lg border border-hairline bg-paper px-4 py-3 space-y-2">
                    <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide">
                      Tradeoff keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keyTradeoffs.map(kw => {
                        const hit = result.matchedKeywords?.some(
                          m => m.toLowerCase() === kw.toLowerCase(),
                        )
                        return (
                          <span
                            key={kw}
                            className={cn(
                              'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                              hit
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-red-200 bg-red-50 text-red-600',
                            )}
                          >
                            {hit ? '✓' : '✗'} {kw}
                          </span>
                        )
                      })}
                    </div>
                    {!result.correct && !result.partialCredit && (
                      <p className="text-[12px] text-ink-faint">
                        Try to include at least 2 of these concepts in your answer.
                      </p>
                    )}
                  </div>
                )}

                {/* Skill gains */}
                {Object.keys(result.skillDeltas).length > 0 && (
                  <div className="rounded-lg border border-hairline bg-paper px-4 py-3 flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-brand shrink-0" />
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(result.skillDeltas).map(([k, v]) => (
                        <span key={k} className="text-[12px] text-ink-muted">
                          <span className="font-medium capitalize text-ink">{k}</span>
                          {' '}
                          <span className="text-emerald-600 font-medium">+{v}</span>
                        </span>
                      ))}
                      {result.interviewReadiness != null && (
                        <span className="text-[12px] text-ink-muted">
                          Interview readiness:{' '}
                          <span className="font-medium text-ink">
                            {result.interviewReadiness}%
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* History link */}
                <Link
                  href="/learn/detective/history"
                  className="inline-block text-[13px] text-brand hover:underline"
                >
                  See your pattern history →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </CategoryShell>
  )
}
