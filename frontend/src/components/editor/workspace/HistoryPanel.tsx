'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  artifactApi,
  type ArtifactVersion,
  type DiffEntry,
  type DesignDecisionDoc,
  type ReplayEventDoc,
} from '@/lib/artifact-api'
import {
  DecisionList,
  type DesignDecision,
} from '@/components/studio/decisions/DecisionList'

type HistoryView = 'diff' | 'decisions' | 'replay'

export interface HistoryPanelProps {
  diagramId?: string | null
  selectedElementId?: string | null
  className?: string
}

function versionId(v: ArtifactVersion): string {
  return String(v.id ?? v._id)
}

function toDecisionListItem(d: DesignDecisionDoc): DesignDecision {
  return {
    id: String(d.id ?? d._id),
    elementId: d.elementId,
    why: d.why || d.decision || '',
    alternatives: d.alternatives,
    tradeoffs: d.tradeoffs,
    createdAt: d.createdAt,
  }
}

/**
 * History tab — Diff | Decisions | Replay for a persisted artifact.
 */
export function HistoryPanel({
  diagramId = null,
  selectedElementId = null,
  className,
}: HistoryPanelProps) {
  const [view, setView] = useState<HistoryView>('diff')
  const persistable = Boolean(diagramId && diagramId !== 'local')

  const views: { id: HistoryView; label: string }[] = [
    { id: 'diff', label: 'Diff' },
    { id: 'decisions', label: 'Decisions' },
    { id: 'replay', label: 'Replay' },
  ]

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-paper', className)}>
      <div className="flex shrink-0 gap-1 border-b border-hairline px-3 py-2">
        {views.map(v => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              'rounded-md px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide transition-colors',
              view === v.id
                ? 'bg-brand-tint text-brand'
                : 'text-ink-faint hover:bg-hairline/50 hover:text-ink-muted',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {!persistable ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="max-w-xs text-[13px] text-ink-muted">
            Save this diagram to unlock versions, decision log, and replay history.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden">
          {view === 'diff' && <DiffTab diagramId={diagramId!} />}
          {view === 'decisions' && (
            <DecisionsTab diagramId={diagramId!} selectedElementId={selectedElementId} />
          )}
          {view === 'replay' && <ReplayTab diagramId={diagramId!} />}
        </div>
      )}
    </div>
  )
}

function DiffTab({ diagramId }: { diagramId: string }) {
  const [versions, setVersions] = useState<ArtifactVersion[]>([])
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [entries, setEntries] = useState<DiffEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  const loadVersions = useCallback(async () => {
    try {
      const res = await artifactApi.getVersions(diagramId)
      const list = res.versions ?? []
      setVersions(list)
      if (list.length >= 2) {
        setFromId(versionId(list[1]))
        setToId(versionId(list[0]))
      } else if (list.length === 1) {
        setFromId(versionId(list[0]))
        setToId(versionId(list[0]))
      }
    } catch {
      toast.error('Could not load versions')
    }
  }, [diagramId])

  useEffect(() => {
    void loadVersions()
  }, [loadVersions])

  const snapshot = async () => {
    try {
      await artifactApi.postVersion(diagramId, { label: `Snapshot ${new Date().toLocaleString()}` })
      toast.success('Version saved')
      await loadVersions()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Snapshot failed')
    }
  }

  const runDiff = async () => {
    if (!fromId || !toId) return
    setLoading(true)
    try {
      const res = await artifactApi.getDiff(diagramId, fromId, toId)
      setEntries(res.entries ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Diff failed')
      setEntries(null)
    } finally {
      setLoading(false)
    }
  }

  const added = entries?.filter(e => e.kind === 'added') ?? []
  const removed = entries?.filter(e => e.kind === 'removed') ?? []
  const changed = entries?.filter(e => e.kind === 'modified' || e.kind === 'changed') ?? []

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="space-y-2 border-b border-hairline px-4 py-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[8rem] flex-1">
            <span className="font-mono text-[10px] uppercase text-ink-faint">From</span>
            <select
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-paper-elevated px-2 py-1.5 text-[12px] text-ink"
            >
              {versions.map((v, i) => (
                <option key={versionId(v)} value={versionId(v)}>
                  v{versions.length - i} · {v.label || new Date(v.createdAt).toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[8rem] flex-1">
            <span className="font-mono text-[10px] uppercase text-ink-faint">To</span>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-paper-elevated px-2 py-1.5 text-[12px] text-ink"
            >
              {versions.map((v, i) => (
                <option key={versionId(v)} value={versionId(v)}>
                  v{versions.length - i} · {v.label || new Date(v.createdAt).toLocaleString()}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void runDiff()}
            disabled={!fromId || !toId || loading}
            className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Diffing…' : 'Compare'}
          </button>
          <button
            type="button"
            onClick={() => void snapshot()}
            className="rounded-md border border-hairline px-3 py-1.5 text-[12px] text-ink hover:bg-hairline/40"
          >
            Snapshot current
          </button>
        </div>
        {versions.length < 2 && (
          <p className="text-[12px] text-ink-muted">
            Save at least two snapshots to compare (or snapshot current, edit, snapshot again).
          </p>
        )}
      </div>

      {entries && (
        <div className="space-y-4 px-4 py-3">
          <DiffGroup title="Added" items={added} tone="added" />
          <DiffGroup title="Removed" items={removed} tone="removed" />
          <DiffGroup title="Changed" items={changed} tone="changed" />
          {entries.length === 0 && (
            <p className="text-[13px] text-ink-muted">No structural differences.</p>
          )}
        </div>
      )}
    </div>
  )
}

function DiffGroup({
  title,
  items,
  tone,
}: {
  title: string
  items: DiffEntry[]
  tone: 'added' | 'removed' | 'changed'
}) {
  if (items.length === 0) return null
  const color =
    tone === 'added' ? 'text-emerald-700' : tone === 'removed' ? 'text-red-700' : 'text-amber-700'
  return (
    <div>
      <p className={cn('font-mono text-[10px] font-medium uppercase tracking-wide', color)}>
        {title} ({items.length})
      </p>
      <ul className="mt-1 space-y-1">
        {items.map((e, i) => (
          <li key={`${e.id ?? e.elementId}-${i}`} className="text-[13px] text-ink">
            <span className="font-mono text-[10px] text-ink-faint">{e.entity}</span>{' '}
            {e.summary ?? e.detail ?? e.name ?? e.id ?? e.elementId}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DecisionsTab({
  diagramId,
  selectedElementId,
}: {
  diagramId: string
  selectedElementId?: string | null
}) {
  const [decisions, setDecisions] = useState<DesignDecision[]>([])
  const [why, setWhy] = useState('')
  const [alternatives, setAlternatives] = useState('')
  const [tradeoffs, setTradeoffs] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await artifactApi.listDecisions(diagramId)
      setDecisions((res.decisions ?? []).map(toDecisionListItem))
    } catch {
      toast.error('Could not load decisions')
    }
  }, [diagramId])

  useEffect(() => {
    void load()
  }, [load])

  const submit = async () => {
    if (!why.trim()) {
      toast.error('Add a why / decision note')
      return
    }
    setSaving(true)
    try {
      await artifactApi.createDecision(diagramId, {
        elementId: selectedElementId ?? '',
        decision: why.trim(),
        why: why.trim(),
        alternatives: alternatives.trim(),
        tradeoffs: tradeoffs.trim(),
      })
      setWhy('')
      setAlternatives('')
      setTradeoffs('')
      toast.success('Decision logged')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save decision')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] text-ink-faint">
          Element:{' '}
          <span className="text-brand">
            {selectedElementId ?? 'design-wide (select a node)'}
          </span>
        </p>
        <textarea
          value={why}
          onChange={e => setWhy(e.target.value)}
          rows={2}
          placeholder="Why this design choice?"
          className="w-full resize-none rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
        />
        <input
          value={alternatives}
          onChange={e => setAlternatives(e.target.value)}
          placeholder="Alternatives considered"
          className="w-full rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
        />
        <input
          value={tradeoffs}
          onChange={e => setTradeoffs(e.target.value)}
          placeholder="Trade-offs"
          className="w-full rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void submit()}
          className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add decision'}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <DecisionList decisions={decisions} />
      </div>
    </div>
  )
}

function ReplayTab({ diagramId }: { diagramId: string }) {
  const [events, setEvents] = useState<ReplayEventDoc[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await artifactApi.getReplay(diagramId)
        if (!cancelled) {
          setEvents(res.events ?? [])
          setIndex(0)
        }
      } catch {
        if (!cancelled) toast.error('Could not load replay')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [diagramId])

  if (events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="max-w-xs text-[13px] text-ink-muted">
          No replay events yet. Structural edits will be recorded while you design.
        </p>
      </div>
    )
  }

  const step = events[Math.min(index, events.length - 1)]
  const highlight = describeEvent(step)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          Step {index + 1} / {events.length}
        </p>
        <p className="mt-2 rounded-md border border-brand/30 bg-brand-tint/50 px-3 py-2 text-[13px] text-ink">
          {highlight}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={index <= 0}
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            className="rounded-md border border-hairline px-3 py-1.5 text-[12px] disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={index >= events.length - 1}
            onClick={() => setIndex(i => Math.min(events.length - 1, i + 1))}
            className="rounded-md border border-hairline px-3 py-1.5 text-[12px] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto divide-y divide-hairline">
        {events.map((ev, i) => (
          <li key={`${ev.t}-${i}`}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'w-full px-4 py-2 text-left text-[12px] transition-colors',
                i === index ? 'bg-brand-tint text-brand' : 'text-ink-muted hover:bg-hairline/40',
              )}
            >
              <span className="font-mono text-[10px]">{ev.type}</span>
              <span className="ml-2 text-ink-faint">t={ev.t}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function describeEvent(ev: ReplayEventDoc): string {
  const p = ev.payload ?? {}
  const name = typeof p.name === 'string' ? p.name : undefined
  const id = typeof p.id === 'string' ? p.id : typeof p.elementId === 'string' ? p.elementId : undefined
  switch (ev.type) {
    case 'add_node':
      return `Added node ${name ?? id ?? ''}`.trim()
    case 'remove_node':
      return `Removed node ${name ?? id ?? ''}`.trim()
    case 'add_edge':
      return `Added edge ${id ?? ''}`.trim()
    case 'remove_edge':
      return `Removed edge ${id ?? ''}`.trim()
    case 'update_element':
      return `Updated ${name ?? id ?? 'element'}`.trim()
    default:
      return `${ev.type}${id ? ` · ${id}` : ''}`
  }
}
