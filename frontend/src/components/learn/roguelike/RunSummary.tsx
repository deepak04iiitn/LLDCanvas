'use client'

import { cn } from '@/lib/utils'
import { ArchitectureHealthPanel } from './ArchitectureHealth'
import { ArchitectureJourney } from './ArchitectureJourney'
import type { FullRun, RoguelikeScenario } from '@/lib/learn-api'

interface Props {
  run: FullRun
  scenario: RoguelikeScenario
  onPlayAgain: () => void
  onBrowse: () => void
}

const ENDING_CONFIG: Record<string, { icon: string; label: string; color: string; description: string }> = {
  survived: {
    icon: '🏆', label: 'SURVIVED', color: 'text-emerald-600',
    description: 'Your architecture successfully handled every challenge thrown at it. Clean design, thoughtful decisions.',
  },
  survived_with_debt: {
    icon: '🧠', label: 'SURVIVED WITH DEBT', color: 'text-amber-600',
    description: 'Your architecture made it through, but accumulated technical debt along the way. Consider refactoring before the next run.',
  },
  refactor_required: {
    icon: '🔧', label: 'REFACTOR REQUIRED', color: 'text-orange-600',
    description: 'The architecture survived but is under significant strain. A major refactoring effort is needed.',
  },
  collapse: {
    icon: '💥', label: 'ARCHITECTURE COLLAPSE', color: 'text-red-600',
    description: 'The accumulated architectural debt made the final challenge impossible to handle cleanly. The system needs to be rebuilt.',
  },
  strategic_exit: {
    icon: '🏁', label: 'STRATEGIC EXIT', color: 'text-purple-600',
    description: 'You made the deliberate choice not to support a requirement. Sometimes that is the right architectural decision.',
  },
}

const EVENT_ICONS: Record<string, string> = {
  requirement: '🆕', scale: '📈', failure: '🔥', business: '🏢',
  team: '👥', time: '⏱️', constraint: '🔒', boss: '🐉',
}

export function RunSummary({ run, scenario, onPlayAgain, onBrowse }: Props) {
  const ending = run.ending ?? 'collapse'
  const config = ENDING_CONFIG[ending] ?? ENDING_CONFIG.collapse
  const finalHealth = run.stages.length > 0
    ? run.stages[run.stages.length - 1].healthAfter
    : run.health
  const initialHealth = run.stages.length > 0
    ? run.stages[0].healthBefore
    : run.health

  const decisionsStages = run.stages.filter(s => s.decisionLabel)
  const debtSources = run.stages.filter(s => {
    const delta = s.healthAfter.debt - s.healthBefore.debt
    return delta > 0
  })

  return (
    <div className="min-h-screen bg-paper overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Ending header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">{config.icon}</div>
          <h1 className={cn('font-serif text-3xl font-bold', config.color)}>{config.label}</h1>
          <p className="mt-2 text-[14px] text-ink-muted max-w-lg mx-auto">{config.description}</p>
          {run.endingReason && (
            <p className="mt-1 text-[13px] text-ink-faint italic">"{run.endingReason}"</p>
          )}
          <p className="mt-3 text-[13px] font-medium text-ink">{scenario.title}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          <StatCard label="Stages Survived" value={`${run.currentStageOrder - 1} / ${run.stagesTotal}`} />
          <StatCard label="Decisions Made" value={String(run.totalDecisions)} />
          <StatCard label="Major Refactors" value={String(run.totalRefactors)} />
          <StatCard label="Failures" value={String(run.majorFailures)} highlight={run.majorFailures > 3} />
        </div>

        {/* Architecture Journey */}
        {run.stages.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-6 mb-6">
            <ArchitectureJourney stages={run.stages} initialHealth={initialHealth} />
          </div>
        )}

        {/* Final health + key decisions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint mb-3">Final Architecture Health</h3>
            <ArchitectureHealthPanel health={finalHealth} previousHealth={initialHealth} className="w-full border-0 p-0 bg-transparent" />
          </div>

          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint mb-3">Key Decisions</h3>
            {decisionsStages.length === 0 ? (
              <p className="text-[13px] text-ink-faint">No architectural decisions were recorded.</p>
            ) : (
              <div className="space-y-2">
                {decisionsStages.map(s => (
                  <div key={s.stageId} className="rounded-lg border border-hairline bg-paper px-3 py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[13px] shrink-0">{EVENT_ICONS[s.eventType] ?? '❓'}</span>
                      <div>
                        <p className="text-[12px] font-medium text-ink">{s.stageTitle}</p>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          <span className="font-mono text-ink-faint">Choice: </span>{s.decisionLabel}
                        </p>
                        {(s.healthAfter.debt - s.healthBefore.debt) > 0 && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            +{s.healthAfter.debt - s.healthBefore.debt} debt
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Debt analysis */}
        <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 mb-8">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint mb-3">Technical Debt Analysis</h3>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <p className="text-[12px] text-ink-muted">Final Debt</p>
              <p className={cn('font-mono text-2xl font-bold tabular-nums',
                finalHealth.debt < 20 ? 'text-emerald-600' : finalHealth.debt < 50 ? 'text-amber-600' : 'text-red-600',
              )}>
                {finalHealth.debt}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-ink-muted">
                {finalHealth.debt < 20 ? 'Excellent. Minimal debt accumulated.' :
                 finalHealth.debt < 50 ? 'Moderate debt. Worth addressing in next iteration.' :
                 'High debt. Architecture requires significant attention.'}
              </p>
            </div>
          </div>
          {debtSources.length > 0 && (
            <div>
              <p className="text-[11px] text-ink-faint mb-2 font-mono uppercase tracking-wider">Debt sources:</p>
              <div className="flex flex-wrap gap-2">
                {debtSources.map(s => (
                  <span key={s.stageId} className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-700">
                    Stage {s.stageOrder}: +{s.healthAfter.debt - s.healthBefore.debt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skill gains */}
        {run.skillDeltas && Object.keys(run.skillDeltas).length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 mb-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-700 mb-3">Skills Gained</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(run.skillDeltas)
                .filter(([, delta]) => delta > 0)
                .map(([skill, delta]) => (
                  <div key={skill} className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5">
                    <span className="text-[12px] font-medium text-ink capitalize">
                      {skill.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-mono text-[12px] font-bold text-emerald-600">+{delta}</span>
                  </div>
                ))}
            </div>
            {run.interviewReadiness !== undefined && (
              <p className="mt-3 text-[12px] text-emerald-700">
                Interview Readiness: <span className="font-mono font-bold">{run.interviewReadiness}</span>
              </p>
            )}
          </div>
        )}

        {/* Plannr Recommendation */}
        {run.skillDeltas && (
          (run.skillDeltas.tradeoffReasoning !== undefined && run.skillDeltas.tradeoffReasoning < 4) ||
          (run.skillDeltas.extensibility !== undefined && run.skillDeltas.extensibility < 3)
        ) && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 mb-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-blue-700 mb-2">Plannr Recommendation</h3>
            <p className="text-[13px] text-ink-muted">
              Your tradeoff reasoning needs practice. Continue with your Plannr roadmap →{' '}
              <a href="/plannr/roadmap" className="text-brand font-medium hover:underline">
                Open Roadmap
              </a>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={onPlayAgain}
            className="rounded-xl bg-brand px-6 py-2.5 text-[14px] font-medium text-white hover:bg-brand/90 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onBrowse}
            className="rounded-xl border border-hairline bg-paper-elevated px-6 py-2.5 text-[14px] font-medium text-ink hover:bg-hairline/40 transition-colors"
          >
            Try Different Scenario
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-3 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className={cn('mt-1 font-serif text-2xl font-medium', highlight ? 'text-red-600' : 'text-ink')}>{value}</p>
    </div>
  )
}
