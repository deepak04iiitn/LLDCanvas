'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { budgetCalc, type BudgetResult } from '@/lib/graph/budgetCalc'
import type { DiagramLike } from '@/lib/graph/analyzeDiagram'
import { studioApi } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

const SAMPLE_DIAGRAM: DiagramLike = {
  nodes: [
    {
      id: 'n1',
      data: {
        elementId: 'el-order',
        nodeType: 'class',
        name: 'Order',
        stereotype: 'aggregate',
      },
    },
    {
      id: 'n2',
      data: { elementId: 'el-payment', nodeType: 'interface', name: 'PaymentGateway' },
    },
    {
      id: 'n3',
      data: { elementId: 'el-razorpay', nodeType: 'class', name: 'RazorpayAdapter' },
    },
    {
      id: 'n4',
      data: { elementId: 'el-db', nodeType: 'abstract-class', name: 'Repository' },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'n1',
      target: 'n2',
      data: { elementId: 'ed-1', relationshipType: 'dependency' },
    },
    {
      id: 'e2',
      source: 'n3',
      target: 'n2',
      data: { elementId: 'ed-2', relationshipType: 'realization' },
    },
    {
      id: 'e3',
      source: 'n1',
      target: 'n4',
      data: { elementId: 'ed-3', relationshipType: 'association' },
    },
  ],
}

const DEFAULT_LIMIT = 25

function BudgetPageInner() {
  const searchParams = useSearchParams()
  const artifactId = searchParams.get('artifactId')
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [localBudget, setLocalBudget] = useState<BudgetResult | null>(null)
  const [artifactScore, setArtifactScore] = useState<Record<string, unknown> | null>(null)
  const [loadingArtifact, setLoadingArtifact] = useState(false)

  useEffect(() => {
    setLocalBudget(budgetCalc(SAMPLE_DIAGRAM, {}, limit))
  }, [limit])

  const loadArtifact = useCallback(async () => {
    if (!artifactId) return
    setLoadingArtifact(true)
    try {
      const score = await studioApi.budget.scoreArtifact(artifactId)
      setArtifactScore(score)
      toast.success('Loaded artifact score')
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to score artifact')
      setArtifactScore(null)
    } finally {
      setLoadingArtifact(false)
    }
  }, [artifactId])

  useEffect(() => {
    if (artifactId) void loadArtifact()
  }, [artifactId, loadArtifact])

  const overBudget =
    localBudget?.remaining != null && localBudget.remaining < 0

  const scoreOverall = useMemo(() => {
    if (!artifactScore) return null
    const overall = artifactScore.overall
    const max = artifactScore.max
    if (typeof overall === 'number') {
      return { overall, max: typeof max === 'number' ? max : undefined }
    }
    return null
  }, [artifactScore])

  return (
    <CategoryShell
      title="Architecture Budget"
      subtitle="Live cost model for interfaces, patterns, and dependencies"
      backHref="/design-studio"
      backLabel="Design Studio"
    >
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-xl border border-hairline bg-paper-elevated p-4">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Source
          </p>
          {artifactId ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] text-ink">
                Artifact <span className="font-mono text-[12px]">{artifactId}</span>
              </p>
              <button
                type="button"
                disabled={loadingArtifact}
                onClick={() => void loadArtifact()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-medium text-ink hover:border-brand/30"
              >
                {loadingArtifact && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Re-score via API
              </button>
            </div>
          ) : (
            <p className="text-[13px] text-ink-muted">
              No <span className="font-mono text-[11px]">?artifactId=</span> — showing a local
              sample diagram with client-side{' '}
              <span className="font-mono text-[11px]">budgetCalc</span>.
            </p>
          )}
        </section>

        {scoreOverall && (
          <section className="rounded-xl border border-brand/20 bg-brand-tint/40 p-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brand">
              Artifact score
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-ink">
              {scoreOverall.overall}
              {scoreOverall.max != null ? (
                <span className="text-sm font-normal text-ink-faint"> / {scoreOverall.max}</span>
              ) : null}
            </p>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Local budget
              </p>
              <p
                className={cn(
                  'mt-1 font-mono text-3xl font-semibold tabular-nums',
                  overBudget ? 'text-rose-700' : 'text-brand',
                )}
              >
                {localBudget?.total ?? '—'}
                {localBudget?.limit != null && (
                  <span className="text-base font-normal text-ink-faint">
                    {' '}
                    / {localBudget.limit}
                  </span>
                )}
              </p>
              {localBudget?.remaining != null && (
                <p className="mt-1 text-[12px] text-ink-muted">
                  Remaining: {localBudget.remaining}
                </p>
              )}
            </div>
            <label className="flex flex-col gap-1 text-[11px] text-ink-muted">
              Limit
              <input
                type="number"
                min={0}
                value={limit}
                onChange={e => setLimit(Number(e.target.value) || 0)}
                className="w-24 rounded-md border border-hairline bg-paper px-2 py-1.5 font-mono text-[13px] text-ink outline-none focus:border-brand/40"
              />
            </label>
          </div>

          <ul className="space-y-2">
            {(localBudget?.lines ?? []).map(line => (
              <li
                key={line.label}
                className="flex items-center justify-between rounded-lg border border-hairline bg-paper-elevated px-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">{line.label}</p>
                  <p className="font-mono text-[10px] text-ink-faint">
                    {line.count} × {line.unitCost}
                  </p>
                </div>
                <span className="font-mono text-[13px] tabular-nums text-ink">
                  {line.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </CategoryShell>
  )
}

export default function BudgetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[13px]">Loading…</span>
        </div>
      }
    >
      <BudgetPageInner />
    </Suspense>
  )
}
