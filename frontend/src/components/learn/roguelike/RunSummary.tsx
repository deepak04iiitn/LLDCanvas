'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArchitectureJourney } from './ArchitectureJourney'
import type { FullRun, RoguelikeScenario } from '@/lib/learn-api'

interface Props {
  run: FullRun
  scenario: RoguelikeScenario
  onPlayAgain: () => void
  onBrowse: () => void
}

// Pass/fail based on ending
const PASS_ENDINGS = new Set(['survived', 'survived_with_debt', 'refactor_required', 'strategic_exit'])

const ENDING_LABEL: Record<string, string> = {
  survived:             'Survived',
  survived_with_debt:   'Survived with Debt',
  refactor_required:    'Refactor Required',
  collapse:             'Architecture Collapsed',
  strategic_exit:       'Strategic Exit',
}

const ENDING_DESCRIPTION: Record<string, string> = {
  survived:             'Your architecture handled every challenge. Clean design, thoughtful decisions.',
  survived_with_debt:   'Made it through — but accumulated technical debt along the way.',
  refactor_required:    'Architecture survived under strain. Major refactoring needed before the next run.',
  collapse:             'Accumulated debt made the final challenge impossible. The system needs rebuilding.',
  strategic_exit:       'You made a deliberate choice not to support a requirement. Sometimes the right call.',
}

export function RunSummary({ run, scenario, onPlayAgain, onBrowse }: Props) {
  const ending      = run.ending ?? 'collapse'
  const isPassed    = PASS_ENDINGS.has(ending)
  const label       = ENDING_LABEL[ending]       ?? 'Unknown Ending'
  const description = ENDING_DESCRIPTION[ending] ?? ''

  const finalHealth   = run.stages.length > 0 ? run.stages[run.stages.length - 1].healthAfter : run.health
  const initialHealth = run.stages.length > 0 ? run.stages[0].healthBefore : run.health

  const skillDeltas = Object.entries(run.skillDeltas ?? {}).filter(([, d]) => d !== 0)
  const positiveSkills = skillDeltas.filter(([, d]) => d > 0)

  const keyStages = (() => {
    const all = run.stages ?? []
    if (all.length <= 3) return all
    return [all[0], all[Math.floor(all.length / 2)], all[all.length - 1]]
  })()

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-8">

        {/* ── Section 1: Result Hero ──────────────────────────────────── */}
        <section className="flex flex-col items-center gap-4 text-center">
          {isPassed
            ? <CheckCircle2 size={64} className="text-emerald-600" />
            : <XCircle      size={64} className="text-red-500" />}

          <div>
            <h1 className={cn(
              'font-serif text-3xl font-bold',
              isPassed ? 'text-emerald-700' : 'text-red-600',
            )}>
              {label}
            </h1>
            <p className="mt-2 text-[14px] text-ink-muted max-w-sm mx-auto">{description}</p>
            {run.endingReason && (
              <p className="mt-1 text-[13px] text-ink-faint italic">"{run.endingReason}"</p>
            )}
            <p className="mt-2 text-[13px] font-medium text-ink">{scenario.title}</p>
          </div>

          {/* Session stats */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatPill label="Stages" value={`${run.currentStageOrder - 1} / ${run.stagesTotal}`} />
            <StatPill label="Decisions" value={String(run.totalDecisions)} />
            <StatPill label="Refactors" value={String(run.totalRefactors)} />
            {run.majorFailures > 0 && (
              <StatPill label="Failures" value={String(run.majorFailures)} danger />
            )}
          </div>
        </section>

        {/* ── Section 2: Skills Gained ────────────────────────────────── */}
        {positiveSkills.length > 0 && (
          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-4">Skills Gained</h2>
            <div className="space-y-2">
              {positiveSkills.map(([skill, delta]) => (
                <SkillDeltaBar
                  key={skill}
                  skill={skill}
                  delta={delta}
                />
              ))}
            </div>
            {run.interviewReadiness !== undefined && (
              <p className="mt-3 text-[12px] text-ink-muted">
                Interview readiness:{' '}
                <span className="font-mono font-bold text-brand">{run.interviewReadiness}</span>
              </p>
            )}
          </section>
        )}

        {/* ── Section 3: Architecture Journey ─────────────────────────── */}
        <section>
          <h2 className="font-serif text-lg font-medium text-ink mb-4">Architecture Journey</h2>

          {run.stages.length > 0 ? (
            <>
              <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 mb-4">
                <ArchitectureJourney stages={run.stages} initialHealth={initialHealth} />
              </div>

              {/* Key stage thumbnails / decisions */}
              {keyStages.some(s => s.decisionLabel) && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {keyStages.filter(s => s.decisionLabel).map(s => (
                    <div key={s.stageId} className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint mb-1">
                        Stage {s.stageOrder}
                      </p>
                      <p className="text-[12px] font-medium text-ink truncate">{s.stageTitle}</p>
                      <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2">
                        {s.decisionLabel}
                      </p>
                      {(s.healthAfter.debt - s.healthBefore.debt) > 0 && (
                        <p className="mt-1 text-[10px] text-red-500 font-mono">
                          +{s.healthAfter.debt - s.healthBefore.debt} debt
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-hairline bg-paper-elevated px-5 py-8 text-center">
              <p className="text-[13px] text-ink-faint">No stage data available for this run.</p>
            </div>
          )}
        </section>

        {/* ── Bottom actions ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex-1 rounded-xl bg-brand px-6 py-2.5 text-center text-[14px] font-semibold text-white hover:bg-brand/90 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onBrowse}
            className="w-full sm:w-auto flex-1 rounded-xl border border-hairline bg-paper-elevated px-6 py-2.5 text-center text-[14px] font-medium text-ink-muted hover:border-brand/30 hover:text-brand transition-colors"
          >
            Try Different Scenario
          </button>
          <Link
            href="/dashboard/plannr/roadmap"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-paper-elevated px-6 py-2.5 text-[14px] font-medium text-ink-muted hover:border-brand/30 hover:text-brand transition-colors"
          >
            <Map size={14} />
            View Your Plan
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2.5 text-center min-w-[80px]">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className={cn('mt-0.5 font-serif text-xl font-medium', danger ? 'text-red-600' : 'text-ink')}>
        {value}
      </p>
    </div>
  )
}

function SkillDeltaBar({ skill, delta }: { skill: string; delta: number }) {
  const label = skill.replace(/([A-Z])/g, ' $1').trim()
  const pct   = Math.min(100, Math.abs(delta) * 10) // scale: 10 delta = 100%

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-[12px] text-ink capitalize truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-hairline overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            delta > 0 ? 'bg-emerald-500' : 'bg-red-400',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'font-mono text-[11px] font-bold tabular-nums w-8 text-right',
        delta > 0 ? 'text-emerald-600' : 'text-red-500',
      )}>
        {delta > 0 ? '+' : ''}{delta}
      </span>
    </div>
  )
}
