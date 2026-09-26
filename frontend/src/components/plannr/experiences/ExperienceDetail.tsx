'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, Clock, Send, Star } from 'lucide-react'
import { journeyApi, type JourneyExperience } from '@/lib/plannr-api'
import { JourneySidebar } from '@/components/plannr/shared/JourneySidebar'
import { DesignSketchpad } from '@/components/plannr/experiences/DesignSketchpad'
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

interface ScoreResult {
  score: number
  skillsImproved: string[]
}

function PracticeSimulation({ exp }: { exp: JourneyExperience }) {
  const [classesDrawn, setClassesDrawn] = useState(0)
  const [probeAnswers, setProbeAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDesignChange = useCallback((count: number) => setClassesDrawn(count), [])

  const probes = exp.interviewerProbes ?? []

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const answers = probes.map((probe, i) => ({
        probe,
        answer: probeAnswers[i] ?? '',
      }))
      const res = await journeyApi.submitExperienceAttempt(exp.slug, {
        probeAnswers: answers,
        classesDrawn,
      })
      setResult({ score: res.score, skillsImproved: res.skillsImproved })
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-4xl">🎉</p>
          <h3 className="font-serif text-xl font-medium text-ink">Session Complete!</h3>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
            <Star size={14} className="text-green-600" />
            <span className="text-[15px] font-semibold text-green-800">{result.score} / 100</span>
          </div>
        </div>

        {result.skillsImproved.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Skills Improved</p>
            <div className="flex flex-wrap gap-2">
              {result.skillsImproved.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-[11px] font-medium text-green-800 capitalize">
                  {s.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Interviewer&apos;s Checklist</p>
          {exp.interviewerChecklist.map((item, i) => (
            <ChecklistItem key={i} label={item} />
          ))}
        </div>

        <button
          onClick={() => { setResult(null); setProbeAnswers({}); setClassesDrawn(0) }}
          className="text-[12px] text-brand underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Practice Simulation</p>
        <h3 className="font-medium text-[16px] text-ink">Design it yourself</h3>
      </div>

      {/* Problem */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
        <p className="text-[12px] font-semibold text-indigo-600 uppercase tracking-widest mb-1">Problem</p>
        <p className="text-[15px] text-ink font-medium">{exp.problem}</p>
        <p className="text-[13px] text-ink-muted mt-2">{exp.problemDescription}</p>
      </div>

      {/* Step 1: Design sketchpad */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold">1</span>
          <p className="text-[13px] font-semibold text-ink">Sketch your design</p>
        </div>
        <DesignSketchpad onDesignChange={handleDesignChange} />
        <p className="text-[11px] text-ink-faint">
          {classesDrawn === 0
            ? 'Add at least 1 class to contribute to your design score'
            : `${classesDrawn} class${classesDrawn !== 1 ? 'es' : ''} · 5 classes = full design score`}
        </p>
      </div>

      {/* Step 2: Probe answers */}
      {probes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold">2</span>
            <p className="text-[13px] font-semibold text-ink">Answer the interviewer</p>
          </div>
          <div className="space-y-4">
            {probes.map((probe, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-[13px] text-ink leading-relaxed">
                  <span className="text-amber-600 font-medium">Q:</span> {probe}
                </p>
                <textarea
                  value={probeAnswers[i] ?? ''}
                  onChange={e => setProbeAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Your answer… (at least 30 characters for full score)"
                  rows={3}
                  className="w-full rounded-xl border border-hairline bg-paper p-3 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                />
                <p className={cn(
                  'text-[10px]',
                  (probeAnswers[i]?.length ?? 0) >= 30 ? 'text-green-600' : 'text-ink-faint',
                )}>
                  {probeAnswers[i]?.length ?? 0} / 30 chars minimum
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || classesDrawn === 0}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {submitting
          ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          : <Send size={14} />}
        {submitting ? 'Submitting…' : 'Submit Design'}
      </button>
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
