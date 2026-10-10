'use client'

import { useCallback, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { cloneDiagramData } from '@/components/studio/challenges/diagramElements'
import type { StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'

type LooseNode = {
  id?: string
  data?: { name?: string; nodeType?: string; elementId?: string; [key: string]: unknown }
}

export interface DiagramSubmitResult {
  diff?: unknown
  score?: unknown
  narrative?: string
  [key: string]: unknown
}

export interface DiagramChallengeAttemptProps {
  title: string
  listHref: string
  listLabel: string
  pack: StudioPackDetail
  initialDiagram: unknown
  onSubmit: (diagramData: unknown) => Promise<{ result: DiagramSubmitResult }>
}

export function DiagramChallengeAttempt({
  title,
  listHref,
  listLabel,
  pack,
  initialDiagram,
  onSubmit,
}: DiagramChallengeAttemptProps) {
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(cloneDiagramData(initialDiagram), null, 2),
  )
  const [mode, setMode] = useState<'nodes' | 'json'>('nodes')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DiagramSubmitResult | null>(null)

  const constraints = useMemo(() => {
    const c = pack.payload?.constraints
    return Array.isArray(c) ? (c as string[]) : []
  }, [pack.payload])

  const requirement = useMemo(() => {
    const r = pack.payload?.requirement ?? pack.payload?.prompt
    return typeof r === 'string' ? r : null
  }, [pack.payload])

  const parsed = useMemo(() => {
    try {
      return JSON.parse(jsonText) as { nodes?: LooseNode[]; edges?: unknown[] }
    } catch {
      return null
    }
  }, [jsonText])

  const nodes = (parsed?.nodes ?? []) as LooseNode[]

  const updateNodeName = (index: number, name: string) => {
    if (!parsed) return
    const next = cloneDiagramData(parsed)
    const list = [...((next.nodes as LooseNode[]) ?? [])]
    const n = { ...list[index], data: { ...(list[index]?.data ?? {}), name } }
    list[index] = n
    next.nodes = list
    setJsonText(JSON.stringify(next, null, 2))
  }

  const handleSubmit = useCallback(async () => {
    let diagramData: unknown
    try {
      diagramData = JSON.parse(jsonText)
    } catch {
      toast.error('Diagram JSON is invalid')
      return
    }
    setSubmitting(true)
    try {
      const res = await onSubmit(diagramData)
      setResult(res.result ?? null)
      toast.success('Submitted')
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }, [jsonText, onSubmit])

  const diffEntries = Array.isArray(result?.diff)
    ? (result!.diff as {
        summary?: string
        kind?: string
        elementId?: string
        id?: string
        name?: string
        detail?: string
        entity?: string
      }[])
    : []
  const score = result?.score as
    | { overall?: number; max?: number; disclaimer?: string }
    | undefined

  return (
    <CategoryShell
      title={pack.title || title}
      subtitle={pack.description}
      backHref={listHref}
      backLabel={listLabel}
      actions={
        <button
          type="button"
          disabled={submitting || !!result}
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {result ? 'Submitted' : 'Submit'}
        </button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {(constraints.length > 0 || requirement) && (
          <section className="rounded-xl border border-hairline bg-paper-elevated p-4">
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Constraints
            </p>
            {requirement && (
              <p className="mb-2 text-[13px] leading-relaxed text-ink">{requirement}</p>
            )}
            {constraints.length > 0 && (
              <ul className="list-inside list-disc space-y-1 text-[13px] text-ink-muted">
                {constraints.map(c => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="flex gap-2 border-b border-hairline pb-2">
          {(['nodes', 'json'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] font-medium',
                mode === m
                  ? 'bg-brand-tint text-brand'
                  : 'text-ink-muted hover:bg-hairline/40',
              )}
            >
              {m === 'nodes' ? 'Node list' : 'JSON'}
            </button>
          ))}
        </div>

        {mode === 'nodes' ? (
          <ul className="space-y-2">
            {nodes.length === 0 && (
              <li className="text-[13px] text-ink-muted">
                No nodes — switch to JSON to paste a diagram.
              </li>
            )}
            {nodes.map((n, i) => (
              <li
                key={n.id ?? i}
                className="flex items-center gap-3 rounded-lg border border-hairline bg-paper-elevated px-3 py-2"
              >
                <span className="w-20 shrink-0 font-mono text-[10px] uppercase text-ink-faint">
                  {String(n.data?.nodeType ?? 'class')}
                </span>
                <input
                  value={String(n.data?.name ?? '')}
                  onChange={e => updateNodeName(i, e.target.value)}
                  disabled={!!result}
                  className="min-w-0 flex-1 rounded-md border border-hairline bg-paper px-2 py-1.5 text-[13px] text-ink outline-none focus:border-brand/40"
                />
              </li>
            ))}
          </ul>
        ) : (
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            disabled={!!result}
            spellCheck={false}
            rows={18}
            className="w-full rounded-xl border border-hairline bg-paper-elevated p-3 font-mono text-[11px] leading-relaxed text-ink outline-none focus:border-brand/40"
          />
        )}

        {result && (
          <section className="space-y-3 rounded-xl border border-brand/20 bg-brand-tint/40 p-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brand">
              Result
            </p>
            {result.narrative && (
              <p className="text-[13px] leading-relaxed text-ink">{String(result.narrative)}</p>
            )}
            {score && (
              <p className="font-mono text-sm text-ink">
                Score{' '}
                <span className="font-semibold text-brand">
                  {score.overall ?? '?'}
                  {score.max != null ? ` / ${score.max}` : ''}
                </span>
              </p>
            )}
            {diffEntries.length > 0 && (
              <ul className="space-y-1.5">
                {diffEntries.map((d, i) => (
                  <li
                    key={`${d.elementId ?? d.id ?? i}-${i}`}
                    className="rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[12px] text-ink-muted"
                  >
                    <span className="font-mono text-[10px] uppercase text-ink-faint">
                      {d.kind ?? 'change'}
                      {d.entity ? ` · ${d.entity}` : ''}
                    </span>{' '}
                    {d.summary ?? d.name ?? d.detail ?? d.elementId ?? d.id ?? 'Change'}
                  </li>
                ))}
              </ul>
            )}
            {diffEntries.length === 0 && !result.narrative && (
              <pre className="overflow-x-auto rounded-md bg-paper p-2 font-mono text-[10px] text-ink-muted">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </section>
        )}
      </div>
    </CategoryShell>
  )
}
