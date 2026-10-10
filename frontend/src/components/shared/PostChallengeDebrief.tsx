'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Trophy, Target, X, ArrowRight, Star } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PostChallengeDeBriefProps {
  source: string // 'studio_debugger' | 'studio_refactor' | 'studio_change' | 'studio_evolution' | 'studio_budget' | 'roguelike' | 'quiz'
  skillDeltas: Record<string, number> // e.g. { coupling: 4, cohesion: 3 }
  interviewReadiness?: number // 0-100
  passed: boolean
  nextAction?: {
    label: string
    href: string
    description: string
  }
  onDismiss?: () => void
}

// ─── Skill label mapping ───────────────────────────────────────────────────────

const SKILL_LABELS: Record<string, string> = {
  oop: 'OOP',
  solid: 'SOLID Principles',
  patterns: 'Design Patterns',
  designThinking: 'Design Thinking',
  requirementAnalysis: 'Requirement Analysis',
  entityIdentification: 'Entity Identification',
  responsibilities: 'Responsibility Assignment',
  relationships: 'Class Relationships',
  extensibility: 'Extensibility',
  coupling: 'Coupling',
  cohesion: 'Cohesion',
  communication: 'Communication',
  tradeoffReasoning: 'Trade-off Reasoning',
  followupHandling: 'Follow-up Handling',
  designSpeed: 'Design Speed',
}

function humanizeSkill(key: string): string {
  if (SKILL_LABELS[key]) return SKILL_LABELS[key]
  // Fallback: camelCase → Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

// ─── Readiness color scale ─────────────────────────────────────────────────────

function readinessColor(score: number): string {
  if (score >= 60) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

function readinessBorderColor(score: number): string {
  if (score >= 60) return 'border-emerald-400/60 bg-emerald-50/60'
  if (score >= 40) return 'border-amber-400/60 bg-amber-50/60'
  return 'border-red-400/60 bg-red-50/60'
}

// ─── Animated skill bar ────────────────────────────────────────────────────────

function SkillBar({ delta, delay }: { delta: number; delay: number }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  // Clamp to 0–100, scale the delta (max delta ~10 → 100%)
  const targetWidth = Math.min(100, Math.max(4, (delta / 10) * 100))

  useEffect(() => {
    const timer = setTimeout(() => setWidth(targetWidth), delay)
    return () => clearTimeout(timer)
  }, [targetWidth, delay])

  return (
    <div ref={ref} className="flex-1 h-1.5 rounded-full bg-hairline overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          delta >= 3 ? 'bg-emerald-500' : delta >= 1 ? 'bg-brand/70' : 'bg-ink-muted/40',
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

// ─── Circular readiness badge ──────────────────────────────────────────────────

function ReadinessBadge({ score }: { score: number }) {
  const colorClass = readinessColor(score)
  const borderClass = readinessBorderColor(score)
  const circumference = 2 * Math.PI * 20 // r=20
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 120)
    return () => clearTimeout(t)
  }, [score])

  const dashOffset = circumference * (1 - progress / 100)

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3.5 py-2.5',
        borderClass,
      )}
    >
      <div className="relative w-12 h-12 shrink-0">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-hairline" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn('transition-all duration-1000 ease-out', colorClass)}
            stroke="currentColor"
          />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold', colorClass)}>
          {score}%
        </span>
      </div>
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-faint">Interview Ready</p>
        <p className={cn('text-[15px] font-semibold', colorClass)}>{score}%</p>
        <p className="text-[11px] text-ink-muted">
          {score >= 60 ? 'Strong signal' : score >= 40 ? 'Getting there' : 'Keep practicing'}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PostChallengeDebrief({
  skillDeltas,
  interviewReadiness,
  passed,
  nextAction,
  onDismiss,
}: PostChallengeDeBriefProps) {
  const skillEntries = Object.entries(skillDeltas).filter(([, delta]) => delta !== 0)

  const borderClass = passed
    ? 'border-emerald-400/70'
    : 'border-amber-400/70'

  const headerBgClass = passed
    ? 'bg-emerald-50/60'
    : 'bg-amber-50/60'

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-paper shadow-md overflow-hidden w-full max-w-sm',
        borderClass,
      )}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 z-10 rounded-md p-1 text-ink-faint hover:bg-hairline/50 hover:text-ink transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className={cn('flex items-center gap-3 px-4 pt-4 pb-3', headerBgClass)}>
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full',
            passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
          )}
        >
          {passed ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-ink leading-tight">
            {passed ? 'Challenge Complete' : 'Good Effort'}
          </h3>
          <p className="text-[12px] text-ink-muted">
            {passed ? 'Skills updated below' : 'You gained some skills — keep going'}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Skill gains */}
        {skillEntries.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint mb-2">
              Skill Gains
            </p>
            <div className="space-y-2">
              {skillEntries.map(([key, delta], i) => (
                <div key={key} className="flex items-center gap-2.5">
                  {/* Skill name */}
                  <span className="text-[12px] text-ink w-36 shrink-0 truncate">
                    {humanizeSkill(key)}
                  </span>

                  {/* Animated bar */}
                  <SkillBar delta={delta} delay={80 + i * 60} />

                  {/* Pill */}
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                      delta >= 3
                        ? 'bg-emerald-100 text-emerald-700'
                        : delta >= 1
                        ? 'bg-brand/10 text-brand'
                        : 'bg-paper-elevated text-ink-muted',
                    )}
                  >
                    +{delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interview Readiness badge */}
        {interviewReadiness !== undefined && (
          <ReadinessBadge score={interviewReadiness} />
        )}

        {/* Next action */}
        {nextAction && (
          <Link
            href={nextAction.href}
            className="group flex items-center justify-between gap-3 rounded-xl border border-hairline bg-paper-elevated px-3.5 py-3 hover:border-brand/40 hover:bg-brand/5 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink truncate">{nextAction.label}</p>
              <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2">{nextAction.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-ink-faint group-hover:text-brand transition-colors" />
          </Link>
        )}
      </div>

      {/* Subtle bottom accent */}
      <div className={cn('h-1', passed ? 'bg-emerald-400/30' : 'bg-amber-400/30')} />
    </div>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function usePostChallengeDebrief() {
  const [debrief, setDebrief] = useState<PostChallengeDeBriefProps | null>(null)
  const show = (props: PostChallengeDeBriefProps) => setDebrief(props)
  const hide = () => setDebrief(null)
  return { debrief, show, hide }
}
