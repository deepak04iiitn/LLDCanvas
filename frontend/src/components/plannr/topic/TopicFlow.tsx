'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, CheckCircle2, BookOpen, Lightbulb,
  Briefcase, Eye, Wrench, HelpCircle, Repeat, ArrowRight,
  Clock, Layers, AlertCircle, Sparkles,
} from 'lucide-react'
import { journeyApi, type JourneyTopic } from '@/lib/plannr-api'
import { StageTag } from '@/components/plannr/shared/StageTag'
import { MiniExerciseGate } from '@/components/plannr/topic/MiniExerciseGate'
import { AfterTopicActions } from '@/components/plannr/topic/AfterTopicActions'
import { cn } from '@/lib/utils'

type StepId = 'learn' | 'whyItMatters' | 'interviewContext' | 'spotIt' | 'fixIt' | 'checkUnderstanding' | 'followUp'

const STEPS: { id: StepId; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'learn',              shortLabel: 'Learn',       icon: BookOpen },
  { id: 'whyItMatters',       shortLabel: 'Why',         icon: Lightbulb },
  { id: 'interviewContext',   shortLabel: 'Interview',   icon: Briefcase },
  { id: 'spotIt',             shortLabel: 'Spot It',     icon: Eye },
  { id: 'fixIt',              shortLabel: 'Fix It',      icon: Wrench },
  { id: 'checkUnderstanding', shortLabel: 'Check',       icon: HelpCircle },
  { id: 'followUp',           shortLabel: 'Follow-up',   icon: Repeat },
]

// --- Smart content renderer ---------------------------------------------------
// Converts plain text with •, ?, 1. 2. 3., \n into rich formatted markup.

/** Returns true if the text looks like source code (class/func defs, braces, semicolons). */
function looksLikeCode(text: string): boolean {
  return /[{}]|class\s+\w|function\s+\w|def\s+\w|\bpublic\b|\bprivate\b|=>\s*{|;\s*$/.test(text)
}

/**
 * Insert a newline before every " N. " occurrence so that inline numbered lists
 * like "Problems: 1. foo 2. bar 3. baz" become separate lines the parser can handle.
 */
function expandInlineNumberedList(line: string): string[] {
  // Need at least two " N. " markers to bother splitting
  const markerCount = (line.match(/\s\d+\.\s/g) ?? []).length
  if (markerCount < 2) return [line]
  // Insert \n before each " N. " so the list items become individual lines
  const normalized = line.replace(/\s+(\d+\.\s)/g, '\n$1')
  return normalized.split('\n').map(s => s.trim()).filter(Boolean)
}

function parseContentBlock(raw: string): React.ReactNode[] {
  // Expand each newline-split line for possible inline numbered lists
  const rawLines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const lines: string[] = rawLines.flatMap(expandInlineNumberedList)

  const output: React.ReactNode[] = []
  let bulletGroup:  string[] = []
  let numberedGroup: { n: number; text: string }[] = []
  let arrowGroup:   string[] = []

  function flushBullets() {
    if (!bulletGroup.length) return
    output.push(
      <ul key={`ul-${output.length}`} className="space-y-2 my-3">
        {bulletGroup.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.75 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span className="text-[15px] leading-relaxed text-ink">{b}</span>
          </li>
        ))}
      </ul>,
    )
    bulletGroup = []
  }

  function flushNumbered() {
    if (!numberedGroup.length) return
    output.push(
      <ol key={`ol-${output.length}`} className="space-y-2.5 my-3">
        {numberedGroup.map(({ n, text }, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand mt-0.5">
              {n}
            </span>
            <span className="text-[15px] leading-relaxed text-ink">{text}</span>
          </li>
        ))}
      </ol>,
    )
    numberedGroup = []
  }

  function flushArrows() {
    if (!arrowGroup.length) return
    output.push(
      <div key={`ar-${output.length}`} className="flex flex-col gap-2 my-3">
        {arrowGroup.map((a, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <ArrowRight size={14} className="mt-0.75 shrink-0 text-brand" />
            <span className="text-[15px] leading-relaxed text-ink">{a}</span>
          </div>
        ))}
      </div>,
    )
    arrowGroup = []
  }

  for (const line of lines) {
    // Numbered list item: starts with "1. " / "12. " etc.
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
    if (numberedMatch) {
      flushBullets()
      flushArrows()
      numberedGroup.push({ n: parseInt(numberedMatch[1], 10), text: numberedMatch[2] })
      continue
    }

    // Bullet: starts with •, ·, or -
    if (/^[•·\-]\s*/.test(line)) {
      flushNumbered()
      flushArrows()
      bulletGroup.push(line.replace(/^[•·\-]\s*/, ''))
      continue
    }

    // Arrow: starts with ? or ->
    if (/^[-?>]+\s/.test(line)) {
      flushBullets()
      flushNumbered()
      arrowGroup.push(line.replace(/^[-?>]+\s*/, ''))
      continue
    }

    // Plain paragraph
    flushBullets()
    flushNumbered()
    flushArrows()
    output.push(
      <p key={`p-${output.length}`} className="text-[15px] leading-[1.75] text-ink">
        {line}
      </p>,
    )
  }

  flushBullets()
  flushNumbered()
  flushArrows()
  return output
}

// --- Step card wrapper --------------------------------------------------------

interface CardProps {
  icon: React.ElementType
  eyebrow: string
  accent?: string          // tailwind bg class for the icon circle
  children: React.ReactNode
}

function StepCard({ icon: Icon, eyebrow, accent = 'bg-brand-tint', children }: CardProps) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
      {/* Card top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-hairline/60 bg-paper">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', accent)}>
          <Icon size={15} className="text-brand" />
        </div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
          {eyebrow}
        </span>
      </div>
      <div className="px-6 py-5 space-y-1">{children}</div>
    </div>
  )
}

// --- Step: Learn -------------------------------------------------------------

function LearnStep({ content }: { content: string }) {
  return (
    <StepCard icon={BookOpen} eyebrow="Core Concept">
      <div className="space-y-3">{parseContentBlock(content)}</div>
    </StepCard>
  )
}

// --- Step: Why It Matters -----------------------------------------------------

function WhyMattersStep({ content }: { content: string }) {
  return (
    <StepCard icon={Lightbulb} eyebrow="Why It Matters" accent="bg-amber-50">
      <div className="space-y-3">{parseContentBlock(content)}</div>
    </StepCard>
  )
}

// --- Step: Interview Context --------------------------------------------------

function InterviewContextStep({ content }: { content: string }) {
  return (
    <StepCard icon={Briefcase} eyebrow="Interview Context" accent="bg-sky-50">
      <div className="space-y-3">{parseContentBlock(content)}</div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[13px] leading-relaxed text-amber-900">
          Memorise the <em>pattern</em>, not the answer. Interviewers will change the scenario.
        </p>
      </div>
    </StepCard>
  )
}

// --- Step: Spot It ------------------------------------------------------------

function SpotItStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <StepCard icon={Eye} eyebrow="Spot It — Find the Problem" accent="bg-violet-50">
      {topic.content.spotItPrompt && (
        <p className="text-[15px] font-medium leading-relaxed text-ink mb-4">
          {topic.content.spotItPrompt}
        </p>
      )}

      {topic.content.spotItDesign && (
        <div className="rounded-xl border border-hairline bg-[#1E1E2E] text-[#CDD6F4] px-5 py-4 my-4">
          <p className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
            {topic.content.spotItDesign}
          </p>
        </div>
      )}

      {topic.content.spotItAnswer && (
        !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-brand/30 text-[13px] font-medium text-brand hover:bg-brand-tint/20 transition-colors"
          >
            Reveal Answer
          </button>
        ) : (
          <div className="mt-2 rounded-xl border border-brand/20 bg-brand-tint/20 px-5 py-4">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand mb-3">Answer</p>
            {looksLikeCode(topic.content.spotItAnswer) ? (
              <div className="rounded-xl border border-hairline bg-[#1E1E2E] text-[#CDD6F4] px-5 py-4">
                <p className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">{topic.content.spotItAnswer}</p>
              </div>
            ) : (
              <div className="space-y-2">{parseContentBlock(topic.content.spotItAnswer)}</div>
            )}
          </div>
        )
      )}
    </StepCard>
  )
}

// --- Step: Fix It -------------------------------------------------------------

function FixItStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <StepCard icon={Wrench} eyebrow="Fix It — Apply the Solution" accent="bg-orange-50">
      {topic.content.fixItPrompt && (
        <p className="text-[15px] font-medium leading-relaxed text-ink mb-4">
          {topic.content.fixItPrompt}
        </p>
      )}

      {topic.content.fixItAnswer && (
        !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-brand/30 text-[13px] font-medium text-brand hover:bg-brand-tint/20 transition-colors"
          >
            See Solution
          </button>
        ) : (
          <div className="mt-2 rounded-xl border border-brand/20 bg-brand-tint/20 px-5 py-4">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand mb-3">Fix</p>
            {looksLikeCode(topic.content.fixItAnswer) ? (
              <div className="rounded-xl border border-hairline bg-[#1E1E2E] text-[#CDD6F4] px-5 py-4">
                <p className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">{topic.content.fixItAnswer}</p>
              </div>
            ) : (
              <div className="space-y-2">{parseContentBlock(topic.content.fixItAnswer)}</div>
            )}
          </div>
        )
      )}
    </StepCard>
  )
}

// --- Step: Follow-up ----------------------------------------------------------

function FollowUpStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <StepCard icon={Repeat} eyebrow="Follow-up Question" accent="bg-teal-50">
      {topic.content.followUp && (
        <div className="rounded-xl border border-hairline bg-paper px-5 py-4 mb-4">
          <p className="text-[16px] font-medium leading-relaxed text-ink">
            {topic.content.followUp}
          </p>
        </div>
      )}

      {topic.content.followUpAnswer && (
        !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-brand/30 text-[13px] font-medium text-brand hover:bg-brand-tint/20 transition-colors"
          >
            Reveal Follow-up Answer
          </button>
        ) : (
          <div className="mt-2 rounded-xl border border-brand/20 bg-brand-tint/20 px-5 py-4">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand mb-3">Answer</p>
            {looksLikeCode(topic.content.followUpAnswer) ? (
              <div className="rounded-xl border border-hairline bg-[#1E1E2E] text-[#CDD6F4] px-5 py-4">
                <p className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">{topic.content.followUpAnswer}</p>
              </div>
            ) : (
              <div className="space-y-2">{parseContentBlock(topic.content.followUpAnswer)}</div>
            )}
          </div>
        )
      )}

      {(topic.commonMistakes ?? []).length > 0 && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-600">
              Common Mistakes to Avoid
            </p>
          </div>
          <ul className="space-y-2">
            {topic.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-red-900">
                <span className="mt-1.75 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </StepCard>
  )
}

// --- Completed Banner ---------------------------------------------------------

function CompletedBanner() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand/20 bg-brand-tint/30 px-6 py-5 mb-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
        <CheckCircle2 size={22} className="text-brand" />
      </div>
      <div>
        <p className="font-semibold text-[15px] text-ink">Topic complete!</p>
        <p className="text-[13px] text-ink-muted mt-0.5">Your skills have been updated. Keep the momentum.</p>
      </div>
    </div>
  )
}

// --- Step progress bar --------------------------------------------------------

function StepBar({ steps, current, pastSet, onClickPast }: {
  steps: typeof STEPS
  current: number
  pastSet: Set<number>
  onClickPast: (i: number) => void
}) {
  return (
    <div className="w-full">
      <div className="flex items-start w-full">
        {steps.map((s, i) => {
          const isPast    = pastSet.has(i)
          const isCurrent = i === current
          const isNext    = !isPast && !isCurrent
          const isLast    = i === steps.length - 1
          const Icon      = s.icon

          return (
            <div key={s.id} className={cn('flex items-start', isLast ? 'shrink-0' : 'flex-1')}>

              {/* Step node + label */}
              <button
                onClick={() => isPast && onClickPast(i)}
                disabled={isNext}
                className={cn(
                  'flex flex-col items-center gap-2 group transition-all duration-200 w-full',
                  isPast && 'cursor-pointer',
                  isNext && 'cursor-default',
                )}
              >
                {/* Circle */}
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200',
                  isCurrent && 'border-brand bg-brand shadow-md shadow-brand/20 scale-110',
                  isPast    && 'border-brand bg-brand/10 group-hover:bg-brand/20',
                  isNext    && 'border-hairline bg-paper',
                )}>
                  {isPast ? (
                    <CheckCircle2 size={15} className="text-brand" />
                  ) : (
                    <Icon
                      size={14}
                      className={isCurrent ? 'text-white' : 'text-ink-faint'}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn(
                    'text-[9px] font-mono font-bold uppercase tracking-widest leading-none',
                    isCurrent ? 'text-brand' : isPast ? 'text-brand/60' : 'text-ink-faint/40',
                  )}>
                    {i + 1}
                  </span>
                  <span className={cn(
                    'text-[10px] font-semibold leading-tight text-center whitespace-nowrap',
                    isCurrent ? 'text-ink' : isPast ? 'text-ink-muted' : 'text-ink-faint/50',
                  )}>
                    {s.shortLabel}
                  </span>
                </div>
              </button>

              {/* Connector line — flex-1 stretch between nodes */}
              {!isLast && (
                <div className="flex-1 flex items-start pt-4 min-w-3">
                  <div className={cn(
                    'h-0.5 w-full rounded-full transition-all duration-300',
                    isPast ? 'bg-brand/40' : 'bg-hairline',
                  )} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Main TopicFlow -----------------------------------------------------------

export function TopicFlow({ slug }: { slug: string }) {
  const [topic, setTopic] = useState<JourneyTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [stepIdx, setStepIdx] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [exerciseScore, setExerciseScore] = useState<number | null>(null)

  useEffect(() => {
    journeyApi.getTopic(slug)
      .then(d => setTopic(d.topic))
      .finally(() => setLoading(false))
  }, [slug])

  const currentStep = STEPS[stepIdx]
  const isLast      = stepIdx === STEPS.length - 1
  const pastSet     = new Set(Array.from({ length: stepIdx }, (_, i) => i))

  function handleExerciseComplete(score: number) {
    setExerciseScore(score)
    const followUpIdx = STEPS.findIndex(s => s.id === 'followUp')
    setStepIdx(followUpIdx)
  }

  async function completeTopic() {
    if (!topic) return
    try {
      await journeyApi.completeTopic(topic.slug, {
        exerciseScore: exerciseScore ?? 50,
        exerciseType:  topic.exerciseType,
      })
    } catch { /* best-effort */ }
    setIsCompleted(true)
  }

  // -- Loading -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-[13px] text-ink-faint">Loading topic…</p>
      </div>
    )
  }

  if (!topic) {
    return <div className="text-center py-20 text-ink-muted">Topic not found.</div>
  }

  // -- Render step content ------------------------------------------------------
  function renderStep() {
    if (!topic) return null
    switch (currentStep.id) {
      case 'learn':            return <LearnStep content={topic.content.learn} />
      case 'whyItMatters':     return <WhyMattersStep content={topic.content.whyItMatters} />
      case 'interviewContext': return <InterviewContextStep content={topic.content.interviewTip} />
      case 'spotIt':           return <SpotItStep topic={topic} />
      case 'fixIt':            return <FixItStep topic={topic} />
      case 'checkUnderstanding':
        return (
          <MiniExerciseGate
            exerciseType={topic.exerciseType ?? 'none'}
            exerciseId={topic.exerciseId ?? ''}
            topicSlug={topic.slug}
            buildsSkills={topic.buildsSkills}
            onComplete={handleExerciseComplete}
          />
        )
      case 'followUp':         return <FollowUpStep topic={topic} />
    }
  }

  // -- Layout ------------------------------------------------------------------
  return (
    <div className="h-full overflow-y-auto bg-paper">

      {/* -- Hero header --------------------------------------------------- */}
      <div className="bg-linear-to-b from-brand-tint/40 to-paper px-6 pt-8 pb-6 border-b border-hairline/60">
        <div className="mx-auto max-w-3xl">
          {/* Back nav */}
          <div className="flex items-center gap-4 mb-5">
            <Link href="/dashboard/plannr" className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Dashboard
            </Link>
            <span className="h-3 w-px bg-hairline" />
            <Link href="/dashboard/plannr/roadmap" className="text-[12px] text-ink-faint hover:text-ink transition-colors">
              Roadmap
            </Link>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2.5 mb-3">
            <StageTag stage={topic.stage} short />
            <span className="h-3.5 w-px bg-hairline" />
            <div className="flex items-center gap-1.5 text-[12px] text-ink-faint">
              <Clock size={11} />
              <span>{topic.estimatedMinutes} min read</span>
            </div>
            <span className="h-3.5 w-px bg-hairline" />
            <div className="flex items-center gap-1.5 text-[12px] text-ink-faint">
              <Layers size={11} />
              <span>7 steps</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl font-medium text-ink leading-tight mb-1.5">
            {topic.title}
          </h1>
          {topic.subtitle && (
            <p className="text-[14px] text-ink-muted leading-relaxed max-w-xl">
              {topic.subtitle}
            </p>
          )}

          {/* Progress strip */}
          {!isCompleted && (
            <div className="mt-4 flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    i < stepIdx   ? 'bg-brand'
                    : i === stepIdx ? 'bg-brand/40'
                    : 'bg-hairline',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -- Body ---------------------------------------------------------- */}
      <div className="mx-auto max-w-3xl px-6 py-6 pb-32">

        {isCompleted ? (
          <>
            <CompletedBanner />
            <AfterTopicActions
              topicTitle={topic.title}
              linkedStudioPack={topic.linkedStudioPack}
              linkedLearnExercise={topic.linkedLearnExercise}
              studioMode={
                topic.linkedStudioPack?.includes('refactor') ? 'refactor'
                  : topic.linkedStudioPack?.includes('evolution') ? 'evolution'
                  : topic.linkedStudioPack?.includes('change') ? 'change-one'
                  : 'debugger'
              }
            />
          </>
        ) : (
          <>
            {/* Step navigator */}
            <div className="mb-6 rounded-2xl border border-hairline bg-paper-elevated px-5 py-4">
              <StepBar
                steps={STEPS}
                current={stepIdx}
                pastSet={pastSet}
                onClickPast={setStepIdx}
              />
            </div>

            {/* Step content with slide-in feel */}
            <div key={currentStep.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              {renderStep()}
            </div>
          </>
        )}
      </div>

      {/* -- Sticky bottom nav --------------------------------------------- */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-hairline bg-paper/90 backdrop-blur-sm px-6 py-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3">

            {/* Back */}
            {stepIdx > 0 ? (
              <button
                onClick={() => setStepIdx(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-hairline text-[13px] font-medium text-ink-muted hover:bg-paper-elevated hover:text-ink transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}

            {/* Centre: step fraction */}
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-mono text-ink-faint">
                Step {stepIdx + 1} of {STEPS.length}
              </span>
              <span className="text-[11px] font-semibold text-ink-muted">
                {currentStep.shortLabel}
              </span>
            </div>

            {/* Continue / Complete — hidden on Check step (exercise drives nav) */}
            {currentStep.id !== 'checkUnderstanding' && (
              isLast ? (
                <button
                  onClick={completeTopic}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <CheckCircle2 size={14} /> Complete Topic
                </button>
              ) : (
                <button
                  onClick={() => setStepIdx(s => s + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  Continue <ChevronRight size={14} />
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
