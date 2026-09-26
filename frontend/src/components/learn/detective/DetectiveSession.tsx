'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  ImageOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell, type BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'
import { cn } from '@/lib/utils'

// ── Common pattern suggestion chips ────────────────────────────────────────────
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
  problemContext?: string
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
  matchedKeywords?: string[]
  keyTradeoffs?: string[]
}

export interface DetectiveSessionProps {
  breadcrumb?: BreadcrumbSegment[]
}

export function DetectiveSession({ breadcrumb }: DetectiveSessionProps) {
  const params = useParams()
  const id = String(params.id ?? '')

  const [scenario, setScenario] = useState<ScenarioPayload | null>(null)
  const [attemptId, setAttemptId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [choice, setChoice] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [stemExpanded, setStemExpanded] = useState(false)

  // ── Timer (corner pill only) ───────────────────────────────────────────────
  const startTimeRef = useRef<number>(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Load scenario ──────────────────────────────────────────────────────────
  async function loadScenario(cancelled: { value: boolean }) {
    try {
      const data = await learnApi.detective.start(id)
      if (!cancelled.value) {
        setScenario(data.scenario)
        setAttemptId(data.attemptId)
        startTimeRef.current = Date.now()
        setElapsed(0)
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start scenario')
    } finally {
      if (!cancelled.value) setLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const cancelled = { value: false }
    loadScenario(cancelled)
    return () => {
      cancelled.value = true
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── Submit answer ──────────────────────────────────────────────────────────
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
      setResult(res as SubmitResult)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Try again: reset and reload ────────────────────────────────────────────
  async function handleTryAgain() {
    setResult(null)
    setChoice('')
    setStemExpanded(false)
    setLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)
    const cancelled = { value: false }
    await loadScenario(cancelled)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const mode = scenario?.mode ?? ''
  const isChoiceMode = mode === 'identify' || mode === 'detect' || mode === 'explain'
  const isSuggestMode = mode === 'suggest'
  const isCompareMode = mode === 'compare'

  function resultLabel() {
    if (!result) return ''
    if (result.correct) return 'Correct!'
    if (result.partialCredit) return 'Partial credit — you caught one tradeoff!'
    return isChoiceMode
      ? `Not quite — the answer is "${result.correctAnswer}"`
      : 'Not quite — see the explanation below.'
  }

  // Timer pill passed to CategoryShell
  const timerPill = !result ? (
    <span className="rounded-full border border-hairline bg-paper px-2 py-0.5 font-mono text-[11px] tabular-nums text-ink-faint">
      {formatTime(elapsed)}
    </span>
  ) : undefined

  return (
    <CategoryShell
      title={scenario?.title ?? 'Pattern Detective'}
      subtitle={
        scenario
          ? `${scenario.mode} · ${scenario.difficulty}`
          : 'Loading scenario…'
      }
      backHref="/learn/detective/problems"
      backLabel="Problems"
      breadcrumb={breadcrumb}
      timer={timerPill}
    >
      <div className="mx-auto max-w-2xl overflow-y-auto px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !scenario ? (
          <p className="text-center text-[14px] text-ink-muted">Scenario not found.</p>
        ) : (
          <div className="space-y-6">

            {/* ── Diagram area ────────────────────────────────────────────── */}
            {scenario.diagramSnapshot ? (
              <div className="overflow-hidden rounded-xl border border-hairline">
                <img
                  src={scenario.diagramSnapshot}
                  alt="UML Diagram"
                  className="max-h-[45vh] w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center gap-2 rounded-xl border border-hairline bg-paper-elevated text-ink-faint">
                <ImageOff size={16} strokeWidth={1.5} />
                <span className="text-[13px]">No diagram for this scenario</span>
              </div>
            )}

            {/* ── Stem text (truncated with read-more) ────────────────────── */}
            <div>
              <p
                className={cn(
                  'text-[15px] leading-relaxed text-ink',
                  !stemExpanded && 'line-clamp-3',
                )}
              >
                {scenario.stem}
              </p>
              <button
                type="button"
                onClick={() => setStemExpanded(e => !e)}
                className="mt-1 text-[12px] text-brand hover:underline"
              >
                {stemExpanded ? 'Read less' : 'Read more'}
              </button>
            </div>

            {/* ── Mode 1: identify / detect / explain — choice cards ─────── */}
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
                          'w-full rounded-xl border px-4 py-3 text-left text-[14px] capitalize transition-colors',
                          choice === c && !result
                            ? 'border-brand/50 bg-brand-tint text-ink'
                            : result && c === result.correctAnswer
                            ? 'border-brand/50 bg-brand-tint font-medium text-brand'
                            : result && c === choice && !result.correct
                            ? 'border-ink/20 bg-paper text-ink-muted line-through'
                            : 'border-hairline bg-paper text-ink-muted hover:border-brand/25 hover:text-ink',
                          !!result && 'cursor-default',
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
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Check Answer
                  </button>
                )}
              </>
            )}

            {/* ── Mode 2: suggest — pattern chips + text input ─────────────── */}
            {isSuggestMode && (
              <>
                {scenario.problemContext && (
                  <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4">
                    <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                      Problem
                    </p>
                    <p className="text-[14px] leading-relaxed text-ink">
                      {scenario.problemContext}
                    </p>
                  </div>
                )}

                {!result && (
                  <div>
                    <p className="mb-2 text-[12px] text-ink-faint">
                      Click a pattern to fill it in, or type your own:
                    </p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
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
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit Pattern
                  </button>
                )}
              </>
            )}

            {/* ── Mode 3: compare — free-text tradeoff explanation ──────────── */}
            {isCompareMode && (
              <>
                <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4 space-y-2">
                  <p className="text-[14px] font-medium text-ink">
                    This design uses{' '}
                    <span className="font-semibold">{scenario.patternA}</span>. Compare it with{' '}
                    <span className="font-semibold">{scenario.patternB}</span> — what is the
                    tradeoff?
                  </p>
                  {scenario.comparisonContext && (
                    <p className="text-[13px] leading-relaxed text-ink-muted">
                      {scenario.comparisonContext}
                    </p>
                  )}
                </div>

                {!result && (
                  <div className="flex gap-2 rounded-lg border border-hairline bg-paper px-3 py-2.5">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                    <p className="text-[12px] leading-relaxed text-ink-muted">
                      Think about: when would you choose{' '}
                      <span className="font-medium text-ink">{scenario.patternA}</span> over{' '}
                      <span className="font-medium text-ink">{scenario.patternB}</span> and vice versa?
                    </p>
                  </div>
                )}

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
                    className="w-full resize-y rounded-lg border border-hairline bg-paper-elevated px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none disabled:opacity-60"
                  />
                </div>

                {!result && (
                  <button
                    type="button"
                    disabled={!choice.trim() || submitting}
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit Explanation
                  </button>
                )}
              </>
            )}

            {/* ── Result panel ─────────────────────────────────────────────── */}
            {result && (
              <div className="space-y-4 rounded-xl border border-hairline bg-paper-elevated p-5">
                {/* Pass / fail banner */}
                <div className="flex items-center gap-2">
                  {result.correct ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
                  ) : result.partialCredit ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-ink-muted" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-ink-muted" />
                  )}
                  <p
                    className={cn(
                      'text-[14px] font-semibold',
                      result.correct
                        ? 'text-brand'
                        : result.partialCredit
                        ? 'text-ink-muted'
                        : 'text-ink',
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
                  <div className="space-y-2 rounded-lg border border-hairline bg-paper px-4 py-3">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
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
                              'rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium',
                              hit
                                ? 'border-brand/30 bg-brand-tint text-brand'
                                : 'border-hairline bg-paper text-ink-muted',
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
                  <div className="flex items-center gap-3 rounded-lg border border-hairline bg-paper px-4 py-3">
                    <TrendingUp className="h-4 w-4 shrink-0 text-brand" />
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(result.skillDeltas).map(([k, v]) => (
                        <span key={k} className="text-[12px] text-ink-muted">
                          <span className="font-medium capitalize text-ink">{k}</span>{' '}
                          <span className="font-medium text-brand">+{v}</span>
                        </span>
                      ))}
                      {result.interviewReadiness != null && (
                        <span className="text-[12px] text-ink-muted">
                          Readiness:{' '}
                          <span className="font-medium text-ink">
                            {result.interviewReadiness}%
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTAs: Next Challenge (primary) + Try Again (secondary) */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    href="/learn/detective"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Next Challenge
                    <ChevronRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper-elevated"
                  >
                    <RotateCcw size={13} />
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CategoryShell>
  )
}
