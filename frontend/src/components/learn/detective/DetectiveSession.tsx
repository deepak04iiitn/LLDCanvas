'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { learnApi } from '@/lib/learn-api'
import { cn } from '@/lib/utils'
import type { BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'

// ── Language registry ───────────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'cpp',    label: 'C++' },
  { id: 'ts',     label: 'TypeScript' },
  { id: 'java',   label: 'Java' },
  { id: 'py',     label: 'Python' },
  { id: 'go',     label: 'Go' },
  { id: 'rust',   label: 'Rust' },
  { id: 'cs',     label: 'C#' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'swift',  label: 'Swift' },
  { id: 'js',     label: 'JavaScript' },
  { id: 'rb',     label: 'Ruby' },
  { id: 'php',    label: 'PHP' },
]

const COMMON_PATTERNS = [
  'Observer', 'Strategy', 'Factory', 'Singleton', 'Decorator',
  'Command', 'Adapter', 'Facade', 'Template', 'Builder',
  'Iterator', 'Composite', 'Bridge', 'State', 'Proxy',
]

const CHOICE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

const DIFFICULTY_DOT: Record<string, string> = {
  easy:   'bg-brand',
  medium: 'bg-amber-400',
  hard:   'bg-red-400',
}

const MODE_CHIP: Record<string, string> = {
  identify: 'bg-brand/10 text-brand',
  detect:   'bg-brand/10 text-brand',
  suggest:  'bg-violet-50 text-violet-600',
  compare:  'bg-amber-50 text-amber-700',
  explain:  'bg-sky-50 text-sky-700',
}

// ── Types ───────────────────────────────────────────────────────────────────
type ScenarioPayload = {
  id?: string
  slug: string
  title: string
  mode: string
  difficulty: string
  stem: string
  choices: string[]
  diagramSnapshot?: string
  codeSnippet?: string
  codeSnippets?: Record<string, string>
  description?: string
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

// ── Component ────────────────────────────────────────────────────────────────
export function DetectiveSession({ breadcrumb: _breadcrumb }: DetectiveSessionProps) {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id ?? '')

  const [scenario, setScenario] = useState<ScenarioPayload | null>(null)
  const [loading, setLoading]   = useState(true)
  const [choice, setChoice]     = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]     = useState<SubmitResult | null>(null)
  const [lang, setLang]         = useState<string>('cpp')

  const startTimeRef = useRef<number>(Date.now())
  const [elapsed, setElapsed]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Load scenario ──────────────────────────────────────────────────────────
  async function loadScenario(cancelled: { value: boolean }) {
    try {
      const data = await learnApi.detective.start(id)
      if (!cancelled.value) {
        setScenario(data.scenario)
        setLang('cpp')
        startTimeRef.current = Date.now()
        setElapsed(0)
        timerRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)
      }
    } catch (e) {
      const err = e as Error & { code?: string; requiredPlan?: string }
      if (err.code === 'PLAN_GATE' || /requires/i.test(err.message)) {
        router.push(`/pricing?from=detective_${err.requiredPlan === 'ultimate' ? 'hard' : 'medium'}`)
        return
      }
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!choice.trim() || !scenario) return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
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

  // ── Try again ──────────────────────────────────────────────────────────────
  async function handleTryAgain() {
    setResult(null)
    setChoice('')
    setLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)
    const cancelled = { value: false }
    await loadScenario(cancelled)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const mode        = scenario?.mode ?? ''
  const isChoice    = mode === 'identify' || mode === 'detect' || mode === 'explain'
  const isSuggest   = mode === 'suggest'
  const isCompare   = mode === 'compare'

  // ── Code block ────────────────────────────────────────────────────────────
  function renderCode() {
    const snippets   = scenario?.codeSnippets ?? {}
    const fallbackId = Object.keys(snippets)[0] ?? 'cpp'
    const hasSnippet = !!snippets[lang]
    const snippet    = snippets[lang] || snippets[fallbackId] || scenario?.codeSnippet
    const displayLang = LANGUAGES.find(l => l.id === (hasSnippet ? lang : fallbackId))?.label ?? ''
    if (!snippet) return null
    const lines = snippet.split('\n')

    return (
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141922] shadow-lg shadow-black/10">
        {/* Language dropdown */}
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">lang</span>
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="ml-auto rounded-md border border-white/10 bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white/80 focus:outline-none cursor-pointer hover:bg-white/15 transition-colors"
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id} className="bg-[#141922] text-white">
                {l.label}{snippets[l.id] ? '' : ' *'}
              </option>
            ))}
          </select>
        </div>

        {/* Code with line numbers */}
        <div className="flex overflow-x-auto">
          <div
            aria-hidden
            className="select-none border-r border-white/5 bg-white/2 min-w-10 px-3 py-5"
          >
            {lines.map((_, i) => (
              <div key={i} className="font-mono text-[11px] leading-[1.65] tabular-nums text-white/18 text-right">
                {i + 1}
              </div>
            ))}
          </div>
          <pre className="min-w-0 flex-1 overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.65] text-emerald-100/80">
            <code>{snippet}</code>
          </pre>
        </div>

        {!hasSnippet && (
          <div className="border-t border-white/5 px-5 py-2">
            <p className="font-mono text-[10px] text-white/20">
              Showing {displayLang} — snippet not yet seeded for the selected language
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">

      {/* ─── Sticky minimal header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-hairline bg-paper/90 px-4 py-3 backdrop-blur-sm sm:px-6">
        <Link
          href="/dashboard/learn/detective/problems"
          className="flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Problems
        </Link>

        {scenario && (
          <div className="ml-auto flex items-center gap-3">
            <span className={cn(
              'rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider font-medium',
              MODE_CHIP[mode] ?? 'bg-paper-elevated text-ink-faint border border-hairline',
            )}>
              {mode}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
              <span className={cn('h-1.5 w-1.5 rounded-full', DIFFICULTY_DOT[scenario.difficulty] ?? 'bg-ink-faint')} />
              {scenario.difficulty}
            </span>
            {!result && (
              <span className="font-mono text-[12px] tabular-nums text-ink-faint">
                {formatTime(elapsed)}
              </span>
            )}
          </div>
        )}
      </header>

      {/* ─── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
            </div>
          ) : !scenario ? (
            <p className="text-center text-[14px] text-ink-muted">Scenario not found.</p>
          ) : (
            <div className="space-y-8">

              {/* ── Title ──────────────────────────────────────────────────── */}
              <h1 className="font-serif text-[28px] font-medium leading-snug tracking-tight text-ink sm:text-[32px]">
                {scenario.title}
              </h1>

              {/* ── Evidence ──────────────────────────────────────────────── */}
              {scenario.diagramSnapshot ? (
                <div className="overflow-hidden rounded-2xl border border-hairline">
                  <img
                    src={scenario.diagramSnapshot}
                    alt="UML Diagram"
                    className="max-h-[45vh] w-full object-contain"
                  />
                </div>
              ) : renderCode()}

              {/* ── Case brief ─────────────────────────────────────────────── */}
              {(scenario.description || scenario.stem) && (
                <div className="flex gap-4">
                  <div className="mt-1 w-px shrink-0 self-stretch rounded-full bg-brand/35" />
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                      Case Brief
                    </p>
                    <p className="text-[15px] leading-[1.8] text-ink">
                      {scenario.description ?? scenario.stem}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Answer section ─────────────────────────────────────────── */}
              {!result ? (
                <div className="space-y-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                    Your Diagnosis
                  </p>

                  {/* Choice mode (identify / detect / explain) */}
                  {isChoice && (
                    <>
                      <div className="overflow-hidden rounded-2xl border border-hairline">
                        {scenario.choices.map((c, i) => (
                          <button
                            key={c}
                            type="button"
                            disabled={submitting}
                            onClick={() => setChoice(c)}
                            className={cn(
                              'group flex w-full items-center gap-4 border-b border-hairline px-5 py-4 text-left transition-colors last:border-b-0',
                              choice === c
                                ? 'bg-brand-tint'
                                : 'hover:bg-paper-elevated',
                            )}
                          >
                            <span className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold transition-all',
                              choice === c
                                ? 'bg-brand text-white'
                                : 'bg-paper-elevated text-ink-faint group-hover:bg-hairline group-hover:text-ink-muted',
                            )}>
                              {CHOICE_KEYS[i]}
                            </span>
                            <span className={cn(
                              'text-[14px] capitalize leading-snug transition-colors',
                              choice === c ? 'font-medium text-ink' : 'text-ink-muted',
                            )}>
                              {c}
                            </span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={!choice || submitting}
                        onClick={handleSubmit}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                      >
                        {submitting
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</>
                          : 'Submit Answer'
                        }
                      </button>
                    </>
                  )}

                  {/* Suggest mode */}
                  {isSuggest && (
                    <>
                      {scenario.problemContext && (
                        <div className="flex gap-4">
                          <div className="mt-1 w-px shrink-0 self-stretch rounded-full bg-ink-faint/25" />
                          <div>
                            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">Problem</p>
                            <p className="text-[14px] leading-relaxed text-ink">{scenario.problemContext}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_PATTERNS.map(p => (
                          <button
                            key={p}
                            type="button"
                            disabled={submitting}
                            onClick={() => setChoice(p)}
                            className={cn(
                              'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
                              choice.toLowerCase() === p.toLowerCase()
                                ? 'border-brand/40 bg-brand-tint text-brand'
                                : 'border-hairline text-ink-muted hover:border-brand/30 hover:text-ink',
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        disabled={submitting}
                        value={choice}
                        onChange={e => setChoice(e.target.value)}
                        placeholder="e.g. Observer"
                        className="w-full rounded-2xl border border-hairline bg-paper-elevated px-5 py-3.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!choice.trim() || submitting}
                        onClick={handleSubmit}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                      >
                        {submitting
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                          : 'Submit Pattern'
                        }
                      </button>
                    </>
                  )}

                  {/* Compare mode */}
                  {isCompare && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Pattern A', value: scenario.patternA },
                          { label: 'Pattern B', value: scenario.patternB },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-2xl border border-hairline bg-paper-elevated px-5 py-4">
                            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{label}</p>
                            <p className="mt-1.5 text-[16px] font-medium text-ink">{value}</p>
                          </div>
                        ))}
                      </div>
                      {scenario.comparisonContext && (
                        <p className="text-[13px] leading-relaxed text-ink-muted">{scenario.comparisonContext}</p>
                      )}
                      <textarea
                        disabled={submitting}
                        value={choice}
                        onChange={e => setChoice(e.target.value)}
                        rows={5}
                        placeholder={`Explain the tradeoff between ${scenario.patternA} and ${scenario.patternB}…`}
                        className="w-full resize-y rounded-2xl border border-hairline bg-paper-elevated px-5 py-4 text-[14px] text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!choice.trim() || submitting}
                        onClick={handleSubmit}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                      >
                        {submitting
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                          : 'Submit Explanation'
                        }
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* ── Result reveal ──────────────────────────────────────────── */
                <div className="space-y-6">

                  {/* Verdict card */}
                  <div className={cn(
                    'flex items-start gap-4 rounded-2xl border px-6 py-5',
                    result.correct
                      ? 'border-brand/20 bg-brand-tint'
                      : result.partialCredit
                      ? 'border-amber-200/60 bg-amber-50/60'
                      : 'border-hairline bg-paper-elevated',
                  )}>
                    {result.correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    ) : result.partialCredit ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
                    )}
                    <div className="min-w-0">
                      <p className={cn(
                        'font-serif text-[22px] font-medium leading-tight',
                        result.correct
                          ? 'text-brand'
                          : result.partialCredit
                          ? 'text-amber-700'
                          : 'text-ink',
                      )}>
                        {result.correct ? 'Correct.' : result.partialCredit ? 'Partial credit.' : 'Not quite.'}
                      </p>
                      {!result.correct && !result.partialCredit && result.correctAnswer && (
                        <p className="mt-1 text-[13px] text-ink-muted">
                          The answer was{' '}
                          <span className="font-medium capitalize text-ink">{result.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="flex gap-4">
                      <div className="mt-1 w-px shrink-0 self-stretch rounded-full bg-ink-faint/20" />
                      <p className="text-[14px] leading-[1.85] text-ink-muted">{result.explanation}</p>
                    </div>
                  )}

                  {/* Tradeoff keyword chips (compare mode) */}
                  {isCompare && result.keyTradeoffs && result.keyTradeoffs.length > 0 && (
                    <div>
                      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                        Tradeoff Keywords
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
                                  : 'border-hairline text-ink-muted',
                              )}
                            >
                              {hit ? '✓' : '✗'} {kw}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Skill gains */}
                  {Object.keys(result.skillDeltas).length > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper px-5 py-3.5">
                      <TrendingUp className="h-4 w-4 shrink-0 text-brand" />
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(result.skillDeltas).map(([k, v]) => (
                          <span key={k} className="text-[12px] text-ink-muted">
                            <span className="font-medium capitalize text-ink">{k}</span>{' '}
                            <span className="font-medium text-brand">+{v}</span>
                          </span>
                        ))}
                        {result.interviewReadiness != null && (
                          <span className="text-[12px] text-ink-muted">
                            Readiness{' '}
                            <span className="font-medium text-ink">{result.interviewReadiness}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-3 pt-1">
                    <Link
                      href="/dashboard/learn/detective"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-brand py-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Next Challenge
                      <ChevronRight size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-hairline px-6 py-4 text-[14px] font-medium text-ink transition-colors hover:bg-paper-elevated"
                    >
                      <RotateCcw size={13} />
                      Retry
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
