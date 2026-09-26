'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen, Lightbulb, Briefcase, Eye, Wrench, MessageSquare, Repeat } from 'lucide-react'
import { journeyApi, type JourneyTopic } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { StageTag } from '@/components/plannr/shared/StageTag'
import { cn } from '@/lib/utils'

type Step = 'learn' | 'whyItMatters' | 'interviewTip' | 'realExperience' | 'spotIt' | 'fixIt' | 'interviewQuestion' | 'followUp'

const STEPS: { id: Step; label: string; icon: React.FC<{ size: number; className?: string }> }[] = [
  { id: 'learn',           label: 'Learn',          icon: BookOpen },
  { id: 'whyItMatters',    label: 'Why It Matters',  icon: Lightbulb },
  { id: 'interviewTip',    label: 'Interview Tip',   icon: Briefcase },
  { id: 'realExperience',  label: 'Real Experience', icon: Eye },
  { id: 'spotIt',          label: 'Spot It',         icon: Eye },
  { id: 'fixIt',           label: 'Fix It',          icon: Wrench },
  { id: 'interviewQuestion', label: 'Practice Q',   icon: MessageSquare },
  { id: 'followUp',        label: 'Follow-up',       icon: Repeat },
]

// ─── Step Cards ───────────────────────────────────────────────────────────────

function LearnStep({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none">
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-blue-600" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">Core Concept</span>
        </div>
        <p className="text-[15px] text-ink leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

function WhyMattersStep({ content }: { content: string }) {
  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-amber-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">Why It Matters</span>
      </div>
      <p className="text-[15px] text-ink leading-relaxed">{content}</p>
    </div>
  )
}

function InterviewTipStep({ content }: { content: string }) {
  return (
    <div className="rounded-2xl bg-violet-50 border border-violet-100 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase size={16} className="text-violet-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600">Interview Tip</span>
      </div>
      <div className="bg-white rounded-xl border border-violet-100 p-4">
        <p className="text-[15px] text-ink leading-relaxed">{content}</p>
      </div>
      <div className="mt-4 flex items-start gap-2 text-[13px] text-violet-700">
        <span className="shrink-0 mt-0.5">💡</span>
        <span>Memorise the pattern, not the answer. Interviewers will change the scenario.</span>
      </div>
    </div>
  )
}

function RealExperienceStep({ content }: { content?: string }) {
  if (!content) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-100 p-6 text-center">
        <p className="text-ink-muted text-[14px]">No real-world experience entry for this topic yet.</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl bg-green-50 border border-green-100 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={16} className="text-green-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-green-600">Real Experience</span>
      </div>
      <p className="text-[15px] text-ink leading-relaxed">{content}</p>
    </div>
  )
}

function SpotItStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Eye size={16} className="text-orange-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-orange-600">Spot It</span>
      </div>
      {topic.content.spotItPrompt && (
        <p className="text-[15px] text-ink leading-relaxed font-medium">{topic.content.spotItPrompt}</p>
      )}
      {topic.content.spotItDesign && (
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="font-mono text-[12px] text-ink-muted whitespace-pre-wrap">{topic.content.spotItDesign}</p>
        </div>
      )}
      {topic.content.spotItAnswer && (
        <>
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-orange-300 text-[13px] text-orange-600 hover:bg-orange-100 transition-colors"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="bg-orange-100 rounded-xl p-4">
              <p className="text-[13px] font-semibold text-orange-800 mb-1">Answer:</p>
              <p className="text-[14px] text-ink">{topic.content.spotItAnswer}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FixItStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={16} className="text-red-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-red-600">Fix It</span>
      </div>
      {topic.content.fixItPrompt && (
        <p className="text-[15px] text-ink leading-relaxed font-medium">{topic.content.fixItPrompt}</p>
      )}
      {topic.content.fixItAnswer && (
        !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-red-300 text-[13px] text-red-600 hover:bg-red-100 transition-colors"
          >
            See Solution
          </button>
        ) : (
          <div className="bg-red-100 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-red-800 mb-1">Fix:</p>
            <p className="text-[14px] text-ink">{topic.content.fixItAnswer}</p>
          </div>
        )
      )}
    </div>
  )
}

function InterviewQuestionStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)
  const probes = topic.interviewerProbes ?? []
  return (
    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare size={16} className="text-indigo-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600">Practice Question</span>
      </div>
      {topic.content.interviewQuestion && (
        <div className="bg-white rounded-xl border border-indigo-100 p-4">
          <p className="text-[16px] font-medium text-ink">{topic.content.interviewQuestion}</p>
        </div>
      )}
      {probes.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest">Interviewer might probe:</p>
          <ul className="space-y-1">
            {probes.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink-muted">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      {topic.content.interviewAnswer && (
        !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-300 text-[13px] text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            See Sample Answer
          </button>
        ) : (
          <div className="bg-indigo-100 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-indigo-800 mb-1">Sample Answer:</p>
            <p className="text-[14px] text-ink leading-relaxed">{topic.content.interviewAnswer}</p>
          </div>
        )
      )}
    </div>
  )
}

function FollowUpStep({ topic }: { topic: JourneyTopic }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="rounded-2xl bg-teal-50 border border-teal-100 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Repeat size={16} className="text-teal-600" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">Follow-up</span>
      </div>
      {topic.content.followUp && (
        <div className="bg-white rounded-xl border border-teal-100 p-4">
          <p className="text-[16px] font-medium text-ink">{topic.content.followUp}</p>
        </div>
      )}
      {topic.content.followUpAnswer && (
        !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-300 text-[13px] text-teal-600 hover:bg-teal-100 transition-colors"
          >
            Reveal Follow-up Answer
          </button>
        ) : (
          <div className="bg-teal-100 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-teal-800 mb-1">Answer:</p>
            <p className="text-[14px] text-ink leading-relaxed">{topic.content.followUpAnswer}</p>
          </div>
        )
      )}
      {/* Common mistakes */}
      {(topic.commonMistakes ?? []).length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted mb-2">Common Mistakes to Avoid</p>
          <ul className="space-y-1.5">
            {topic.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Completion Modal ─────────────────────────────────────────────────────────

function CompletionModal({
  onSelect,
  loading,
}: {
  onSelect: (p: 'excellent' | 'good' | 'fair' | 'poor') => void
  loading: boolean
}) {
  const options: { id: 'excellent' | 'good' | 'fair' | 'poor'; label: string; desc: string; color: string }[] = [
    { id: 'excellent', label: '🚀 Excellent', desc: 'I nailed every part', color: 'border-green-400 hover:bg-green-50' },
    { id: 'good',      label: '✅ Good',      desc: 'Understood with minor help', color: 'border-blue-400 hover:bg-blue-50' },
    { id: 'fair',      label: '🤔 Fair',      desc: 'Got the gist, needs review', color: 'border-amber-400 hover:bg-amber-50' },
    { id: 'poor',      label: '😅 Struggled', desc: 'Will revisit this topic', color: 'border-red-400 hover:bg-red-50' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-paper rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="text-center">
          <p className="text-2xl">🎉</p>
          <h2 className="font-serif text-xl font-medium text-ink mt-2">Topic Complete!</h2>
          <p className="text-[13px] text-ink-muted mt-1">How well did you understand this topic?</p>
        </div>
        <div className="space-y-2">
          {options.map(o => (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              disabled={loading}
              className={cn(
                'w-full text-left rounded-xl border-2 p-3 transition-all',
                o.color,
                loading && 'opacity-50 cursor-not-allowed',
              )}
            >
              <p className="font-medium text-[14px] text-ink">{o.label}</p>
              <p className="text-[12px] text-ink-muted">{o.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main TopicFlow ───────────────────────────────────────────────────────────

export function TopicFlow({ slug }: { slug: string }) {
  const router = useRouter()
  const [topic, setTopic] = useState<JourneyTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [stepIdx, setStepIdx] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    journeyApi.getTopic(slug)
      .then(d => setTopic(d.topic))
      .finally(() => setLoading(false))
  }, [slug])

  const currentStep = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  async function handleComplete(performance: 'excellent' | 'good' | 'fair' | 'poor') {
    if (!topic) return
    setCompleting(true)
    try {
      await journeyApi.completeTopic(topic.slug, performance)
      router.push('/plannr/roadmap')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!topic) {
    return <div className="text-center py-20 text-ink-muted">Topic not found.</div>
  }

  function renderStep() {
    if (!topic) return null
    switch (currentStep.id) {
      case 'learn':            return <LearnStep content={topic.content.learn} />
      case 'whyItMatters':     return <WhyMattersStep content={topic.content.whyItMatters} />
      case 'interviewTip':     return <InterviewTipStep content={topic.content.interviewTip} />
      case 'realExperience':   return <RealExperienceStep content={topic.content.realExperience} />
      case 'spotIt':           return <SpotItStep topic={topic} />
      case 'fixIt':            return <FixItStep topic={topic} />
      case 'interviewQuestion':return <InterviewQuestionStep topic={topic} />
      case 'followUp':         return <FollowUpStep topic={topic} />
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <StageTag stage={topic.stage} short />
              <span className="text-[11px] text-ink-faint">·</span>
              <span className="text-[11px] text-ink-faint">{topic.estimatedMinutes}m</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{topic.icon}</span>
              <div>
                <h1 className="font-serif text-2xl font-medium text-ink">{topic.title}</h1>
                {topic.subtitle && <p className="text-[13px] text-ink-muted mt-0.5">{topic.subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => setStepIdx(i)}
                    title={s.label}
                    className={cn(
                      'flex-1 flex justify-center py-1 text-[9px] font-medium transition-colors',
                      i === stepIdx ? 'text-brand' : i < stepIdx ? 'text-green-600' : 'text-ink-faint',
                    )}
                  >
                    <Icon size={14} />
                  </button>
                )
              })}
            </div>
            <div className="h-1 rounded-full bg-hairline overflow-hidden">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-ink-faint">{currentStep.label}</span>
              <span className="text-[10px] text-ink-faint">{stepIdx + 1}/{STEPS.length}</span>
            </div>
          </div>

          {/* Step content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx(s => s - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-hairline text-[13px] text-ink-muted hover:bg-paper-elevated transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <div className="flex-1" />
            {!isLast ? (
              <button
                onClick={() => setStepIdx(s => s + 1)}
                className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-brand text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setShowCompletion(true)}
                className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-green-600 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                <CheckCircle2 size={14} /> Complete Topic
              </button>
            )}
          </div>
        </div>
      </main>

      {showCompletion && (
        <CompletionModal onSelect={handleComplete} loading={completing} />
      )}
    </div>
  )
}
