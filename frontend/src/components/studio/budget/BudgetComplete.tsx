'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { budgetCalc } from '@/lib/graph/budgetCalc'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import { CompletionNext } from '@/components/studio/shell/CompletionNext'

export interface BudgetCompleteProps {
  report: Record<string, unknown>
  unitLabel: string
  diagram?: DebuggerDiagram | null
  onReplay?: () => void
  /** Slug of the completed pack — used for next-problem recommendation */
  packSlug?: string
  className?: string
}

export function BudgetComplete({
  report,
  unitLabel,
  diagram,
  onReplay,
  packSlug = '',
  className,
}: BudgetCompleteProps) {
  const budget = (report.budget ?? {}) as Record<string, unknown>
  const coverage = Array.isArray(report.coverage) ? report.coverage : []
  const opportunityCost = Array.isArray(report.opportunityCost)
    ? (report.opportunityCost as string[])
    : []
  const deferred = Array.isArray(report.deferred) ? report.deferred : []
  const investments = Array.isArray(report.investments) ? report.investments : []
  const inflation = (report.inflation ?? null) as Record<string, unknown> | null
  const cheapHackNotes = Array.isArray(report.cheapHackNotes)
    ? (report.cheapHackNotes as string[])
    : []
  const decisionLog = Array.isArray(report.decisionLog) ? report.decisionLog : []
  const dimensions = Array.isArray(report.dimensions) ? report.dimensions : []
  const handoff = (report.evolutionHandoff ?? null) as {
    slug?: string
    blurb?: string
    debtIds?: string[]
  } | null
  const comboBlurb =
    typeof report.comboBlurb === 'string' ? report.comboBlurb : null

  const calcInflation = useMemo(() => {
    if (!diagram) return null
    const like: DiagramLike = {
      nodes: diagram.nodes as DiagramLike['nodes'],
      edges: diagram.edges as DiagramLike['edges'],
    }
    return budgetCalc(like, {}, 40)
  }, [diagram])

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="font-serif text-2xl font-medium text-ink">Investment report</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          Architecture has a cost. Here is what your allocation achieved — and what it deferred.
        </p>
      </div>

      <section className="rounded-lg border border-hairline bg-paper-elevated p-4">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Budget
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[13px] sm:grid-cols-4">
          <div>
            <dt className="text-ink-faint">Total</dt>
            <dd className="font-mono font-semibold text-ink">
              {String(budget.total ?? '—')} {unitLabel}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Allocated</dt>
            <dd className="font-mono font-semibold text-ink">{String(budget.allocated ?? '—')}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Reserved</dt>
            <dd className="font-mono font-semibold text-amber-700">
              {String(budget.reserved ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Unused</dt>
            <dd className="font-mono font-semibold text-ink">{String(budget.remaining ?? '—')}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Investments
        </h3>
        <ul className="mt-2 space-y-1">
          {investments.map((raw, i) => {
            const inv = raw as Record<string, unknown>
            return (
              <li
                key={i}
                className="flex justify-between rounded-md border border-hairline px-3 py-2 text-[13px]"
              >
                <span className="text-ink">
                  {String(inv.label ?? inv.investmentId ?? 'Investment')}
                </span>
                <span className="font-mono text-brand">{String(inv.cost ?? '')}</span>
              </li>
            )
          })}
          {!investments.length && (
            <li className="text-[13px] text-ink-muted">No investments — full reserve or hold.</li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Requirement coverage
        </h3>
        <ul className="mt-2 space-y-1">
          {coverage.map((raw, i) => {
            const row = raw as Record<string, unknown>
            const covered = row.covered
            const mark = covered === true ? '✓' : covered === 'partial' ? '~' : '—'
            return (
              <li
                key={i}
                className="flex justify-between rounded-md border border-hairline px-3 py-2 text-[13px]"
              >
                <span>
                  {String(row.label)}{' '}
                  <span className="font-mono text-[10px] text-ink-faint">
                    {String(row.weight)}
                  </span>
                </span>
                <span className="font-mono">{mark}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {opportunityCost.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Opportunity cost
          </h3>
          <ul className="mt-2 space-y-1 text-[13px] text-amber-950">
            {opportunityCost.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {deferred.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Deferred debt
          </h3>
          <ul className="mt-2 space-y-1 text-[13px]">
            {deferred.map((raw, i) => {
              const d = raw as Record<string, unknown>
              return (
                <li key={i} className="rounded-md border border-hairline px-3 py-2">
                  {String(d.label ?? d.pressureId)}{' '}
                  <span className="font-mono text-[10px] text-ink-faint">
                    {String(d.severity)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {(inflation || calcInflation) && (
        <section className="rounded-lg border border-hairline p-4">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Architecture inflation
          </h3>
          {inflation && (
            <>
              <p className="mt-1 text-[13px] text-ink-muted">{String(inflation.note ?? '')}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-faint">
                Components {String(inflation.beforeNodes)} → {String(inflation.afterNodes)} (Δ
                {String(inflation.delta)})
              </p>
            </>
          )}
          {calcInflation && (
            <div className="mt-3">
              <p className="font-mono text-[11px] text-ink-faint">
                Diagram cost model (budgetCalc): {calcInflation.total}
                {calcInflation.limit != null ? ` / ${calcInflation.limit}` : ''}
              </p>
              <ul className="mt-1 space-y-0.5 text-[12px] text-ink-muted">
                {calcInflation.lines.map(line => (
                  <li key={line.label} className="flex justify-between">
                    <span>
                      {line.label} ×{line.count}
                    </span>
                    <span className="font-mono">{line.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {(handoff?.slug || comboBlurb) && (
        <section className="rounded-lg border border-brand/30 bg-brand-tint/30 p-4">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
            {report.comboMode ? 'Evolution + Budget' : 'Continue in Evolution'}
          </h3>
          {comboBlurb && <p className="mt-1 text-[13px] text-ink-muted">{comboBlurb}</p>}
          {handoff?.blurb && (
            <p className="mt-1 text-[13px] text-ink-muted">{handoff.blurb}</p>
          )}
          {handoff?.debtIds && handoff.debtIds.length > 0 && (
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              Debt ids: {handoff.debtIds.join(', ')}
            </p>
          )}
          {handoff?.slug && (
            <Link
              href={`/dashboard/design-studio/evolution/${handoff.slug}`}
              className="mt-3 inline-block rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-brand-foreground"
            >
              Open Evolution track
            </Link>
          )}
        </section>
      )}

      {cheapHackNotes.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Cheap hack vs proper
          </h3>
          <ul className="mt-2 space-y-1 text-[13px] text-ink-muted">
            {cheapHackNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      {dimensions.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Dimensions
          </h3>
          <ul className="mt-2 space-y-1">
            {dimensions.map((raw, i) => {
              const d = raw as Record<string, unknown>
              return (
                <li
                  key={i}
                  className="flex justify-between rounded-md border border-hairline px-3 py-2 text-[13px]"
                >
                  <span>
                    {d.ok ? '✓' : '·'} {String(d.label)}
                  </span>
                  <span className="max-w-[55%] text-right text-[11px] text-ink-muted">
                    {String(d.detail ?? '')}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {decisionLog.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Decision history
          </h3>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-[13px] text-ink-muted">
            {decisionLog.map((raw, i) => {
              const d = raw as Record<string, unknown>
              return (
                <li key={i}>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {String(d.stageId)}
                  </span>
                  {' — '}
                  {String(d.narrative ?? `spent ${d.spent}, reserved ${d.reserved}`)}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <div className="border-t border-hairline pt-6">
        <CompletionNext
          packType="budget"
          currentSlug={packSlug}
          libraryHref="/dashboard/design-studio/budget/problems"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="rounded-lg border border-hairline px-4 py-2 text-[13px] font-medium text-ink hover:bg-hairline/40"
          >
            Replay decisions
          </button>
        )}
        <Link
          href="/dashboard/design-studio/budget"
          className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-brand-foreground hover:opacity-90"
        >
          Back to challenges
        </Link>
      </div>
    </div>
  )
}
