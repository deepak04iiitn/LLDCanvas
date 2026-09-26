'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { journeyApi, type JourneyExperience } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { cn } from '@/lib/utils'

function PrereqBadge({ slug, title, icon, completed }: { slug: string; title: string; icon: string; completed: boolean }) {
  return (
    <Link href={`/plannr/topic/${slug}`}>
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] transition-colors',
        completed ? 'border-green-200 bg-green-50 text-green-700' : 'border-hairline bg-paper text-ink-muted hover:border-brand/30',
      )}>
        <span>{icon}</span>
        <span className="font-medium">{title}</span>
        {completed ? <CheckCircle2 size={12} className="ml-auto text-green-600" /> : <Circle size={12} className="ml-auto text-ink-faint" />}
      </div>
    </Link>
  )
}

function SkillBarRow({ skill, weight }: { skill: string; weight: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="capitalize text-ink-muted">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span className="font-medium text-ink">{weight}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', weight >= 70 ? 'bg-green-500' : weight >= 40 ? 'bg-amber-500' : 'bg-red-400')}
          style={{ width: `${weight}%` }}
        />
      </div>
    </div>
  )
}

// ─── Practice Simulation ──────────────────────────────────────────────────────

const PRACTICE_STEPS = [
  { id: 'clarify',   label: '1. Clarify Requirements', icon: '🔍', tip: 'Ask about scale, users, core features. Never skip this.' },
  { id: 'entities',  label: '2. Identify Entities',    icon: '📦', tip: 'Write out all the nouns from the problem. Those become your classes.' },
  { id: 'design',    label: '3. Design Classes',       icon: '🏗️', tip: 'For each entity: what data does it hold? What can it do?' },
  { id: 'relations', label: '4. Define Relationships', icon: '🔗', tip: 'Decide: is it inheritance, composition, or aggregation?' },
  { id: 'patterns',  label: '5. Apply Patterns',       icon: '🧩', tip: 'Do you need a Factory? Observer? Strategy? Justify your choice.' },
  { id: 'tradeoffs', label: '6. Discuss Trade-offs',   icon: '⚖️', tip: 'What did you sacrifice for simplicity? What would change at scale?' },
]

function PracticeSimulation({ exp }: { exp: JourneyExperience }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const current = PRACTICE_STEPS[step]

  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-brand" />
        <h3 className="font-medium text-[15px] text-ink">Practice Simulation</h3>
      </div>

      {/* Problem */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
        <p className="text-[12px] font-semibold text-indigo-600 uppercase tracking-widest mb-1">Problem</p>
        <p className="text-[15px] text-ink font-medium">{exp.problem}</p>
        <p className="text-[13px] text-ink-muted mt-2">{exp.problemDescription}</p>
      </div>

      {/* Steps tracker */}
      {!done ? (
        <>
          <div className="flex gap-1.5 flex-wrap">
            {PRACTICE_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={cn(
                  'text-[10px] font-medium px-2 py-1 rounded-full transition-colors',
                  i === step ? 'bg-brand text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-paper border border-hairline text-ink-faint',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-hairline p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{current.icon}</span>
              <h4 className="font-medium text-ink text-[15px]">{current.label}</h4>
            </div>
            <div className="bg-amber-50 rounded-lg border border-amber-100 p-3">
              <p className="text-[13px] text-amber-800">💡 {current.tip}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-xl border border-hairline text-[13px] text-ink-muted hover:bg-paper-elevated">
                Back
              </button>
            )}
            <div className="flex-1" />
            {step < PRACTICE_STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-5 py-2.5 rounded-xl bg-brand text-white text-[13px] font-medium hover:opacity-90">
                Next Step
              </button>
            ) : (
              <button onClick={() => setDone(true)} className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-[13px] font-medium hover:opacity-90">
                ✅ Practice Complete
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-medium text-green-800">Great practice session!</p>
            <p className="text-[13px] text-green-700">Now check your thinking against the interviewer's checklist below.</p>
          </div>

          {/* Interviewer checklist */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Interviewer's Checklist</p>
            {exp.interviewerChecklist.map((item, i) => (
              <ChecklistItem key={i} label={item} />
            ))}
          </div>

          {/* Follow-ups */}
          <button
            onClick={() => setShowFollowUps(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-hairline text-[13px] text-ink-muted hover:bg-paper-elevated"
          >
            <span>Common Follow-up Questions ({exp.followUps.length})</span>
            {showFollowUps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showFollowUps && (
            <ul className="space-y-2 pl-2">
              {exp.followUps.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-ink-muted">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  {q}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => { setStep(0); setDone(false) }}
            className="text-[12px] text-brand underline"
          >
            Restart Practice
          </button>
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <button
      onClick={() => setChecked(v => !v)}
      className={cn(
        'w-full flex items-start gap-2 rounded-xl border p-3 text-left text-[13px] transition-all',
        checked ? 'border-green-200 bg-green-50 text-green-700' : 'border-hairline bg-paper text-ink-muted',
      )}
    >
      {checked ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-green-600" /> : <Circle size={14} className="shrink-0 mt-0.5" />}
      {label}
    </button>
  )
}

// ─── Main Detail ──────────────────────────────────────────────────────────────

export function ExperienceDetail({ slug }: { slug: string }) {
  const [exp, setExp] = useState<JourneyExperience | null>(null)
  const [prereqs, setPrereqs] = useState<{ slug: string; title: string; icon: string; completed: boolean }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getExperience(slug)
      .then(d => {
        setExp(d.experience)
        setPrereqs(d.prereqDetails)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] bg-paper">
        <JourneySidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </main>
      </div>
    )
  }

  if (!exp) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] bg-paper">
        <JourneySidebar />
        <main className="flex-1 flex items-center justify-center text-ink-muted">Experience not found.</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-paper">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
          {/* Back */}
          <Link href="/plannr/experiences" className="inline-flex items-center gap-1 text-[12px] text-ink-faint hover:text-ink">
            <ArrowLeft size={12} /> All Experiences
          </Link>

          {/* Header */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-1">{exp.round}</p>
            <h1 className="font-serif text-3xl font-medium text-ink">{exp.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-[12px] text-ink-faint">
                <Clock size={11} /> {exp.durationMinutes} minutes
              </span>
              <div className="flex gap-1 flex-wrap">
                {exp.conceptsTested.map(c => (
                  <span key={c} className="text-[10px] bg-paper-elevated border border-hairline rounded-full px-2 py-0.5 text-ink-muted">{c}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-3">Prerequisites</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {prereqs.map(p => <PrereqBadge key={p.slug} {...p} />)}
              </div>
            </div>
          )}

          {/* Skill requirements */}
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-4">Skills Tested</p>
            <div className="space-y-3">
              {exp.skillBars.map(s => <SkillBarRow key={s.skill} skill={s.skill} weight={s.weight} />)}
            </div>
          </div>

          {/* Interviewer probes */}
          {exp.interviewerProbes.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 mb-3">Interviewer Probes</p>
              <ul className="space-y-2">
                {exp.interviewerProbes.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-amber-800">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice simulation */}
          <PracticeSimulation exp={exp} />
        </div>
      </main>
    </div>
  )
}
