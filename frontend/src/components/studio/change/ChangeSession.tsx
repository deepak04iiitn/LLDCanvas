'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { SplitCanvas } from '@/components/studio/refactor/SplitCanvas'
import { BeforeAfterDiff, type DiffEntryLike } from '@/components/studio/refactor/BeforeAfterDiff'
import { ChangeRequestCard } from '@/components/studio/change/ChangeRequestCard'
import { PredictImpactPanel } from '@/components/studio/change/PredictImpactPanel'
import { ChangeToolbar } from '@/components/studio/change/ChangeToolbar'
import { ChangeComplete } from '@/components/studio/change/ChangeComplete'
import {
  DebuggerCanvas,
  type DebuggerDiagram,
} from '@/components/studio/debugger/DebuggerCanvas'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'

export interface ChangeSessionProps {
  attemptId: string
}

type Stage = 'brief' | 'predict' | 'edit' | 'results'

function normalizeDiagram(raw: unknown): DebuggerDiagram {
  const snap = (raw ?? { nodes: [], edges: [] }) as {
    nodes?: unknown[]
    edges?: unknown[]
  }
  const nodes = (snap.nodes ?? []).map(n => {
    const node = n as { id?: string; data?: Record<string, unknown>; elementId?: string }
    const elementId = String(node.elementId ?? node.data?.elementId ?? node.id)
    return { ...node, data: { ...node.data, elementId } }
  })
  const edges = (snap.edges ?? []).map(e => {
    const edge = e as { id?: string; data?: Record<string, unknown>; elementId?: string }
    const elementId = String(edge.elementId ?? edge.data?.elementId ?? edge.id)
    return { ...edge, data: { ...edge.data, elementId } }
  })
  return { nodes, edges }
}

function cloneDiagram(d: DebuggerDiagram): DebuggerDiagram {
  return JSON.parse(JSON.stringify(d)) as DebuggerDiagram
}

function nodeName(n: unknown): string {
  const node = n as { data?: { name?: string }; id?: string }
  return String(node.data?.name ?? node.id ?? 'Class')
}

export function ChangeSession({ attemptId }: ChangeSessionProps) {
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState<Stage>('brief')
  const [original, setOriginal] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working, setWorking] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack, setUndoStack] = useState<DebuggerDiagram[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [startedAt, setStartedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [selectedRels, setSelectedRels] = useState<Set<string>>(new Set())

  const payload = (pack?.payload ?? {}) as {
    changeRequest?: { title?: string; body?: string; type?: string }
    briefing?: string
    constraints?: string[]
    allowedChange?: string
  }

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await studioApi.getAttempt(attemptId)
        if (cancelled) return
        setPack(res.pack)
        const snap = normalizeDiagram(res.pack?.diagramSnapshot ?? { nodes: [], edges: [] })
        const work = normalizeDiagram(
          res.attempt?.diagramData ?? res.pack?.diagramSnapshot ?? { nodes: [], edges: [] },
        )
        setOriginal(snap)
        setWorking(work)
        setStartedAt(
          res.attempt?.startedAt ? new Date(res.attempt.startedAt).getTime() : Date.now(),
        )
        if (res.attempt?.status === 'submitted' && res.attempt.result) {
          setResult(res.attempt.result as Record<string, unknown>)
          setStage('results')
        }
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load session')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const classNames = useMemo(
    () =>
      [...new Set((original.nodes ?? []).map(nodeName))].sort((a, b) => a.localeCompare(b)),
    [original],
  )

  const relationshipLabels = useMemo(() => {
    const nodes = (original.nodes ?? []) as { id?: string; data?: { name?: string } }[]
    const byId = new Map(nodes.map(n => [String(n.id), String(n.data?.name ?? n.id)]))
    const edges = (original.edges ?? []) as { source?: string; target?: string }[]
    return edges
      .map(e => `${byId.get(String(e.source)) ?? e.source} → ${byId.get(String(e.target)) ?? e.target}`)
      .filter(Boolean)
  }, [original])

  const nameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const n of (working.nodes ?? []) as { data?: { elementId?: string; name?: string }; id?: string }[]) {
      const eid = String(n.data?.elementId ?? n.id)
      map[eid] = String(n.data?.name ?? n.id)
    }
    return map
  }, [working])

  const pushUndo = useCallback((prev: DebuggerDiagram) => {
    setUndoStack(stack => [...stack.slice(-19), cloneDiagram(prev)])
  }, [])

  const onWorkingChange = useCallback(
    (next: DebuggerDiagram) => {
      setWorking(prev => {
        pushUndo(prev)
        return next
      })
    },
    [pushUndo],
  )

  const onUndo = useCallback(() => {
    setUndoStack(stack => {
      if (!stack.length) return stack
      const prev = stack[stack.length - 1]
      setWorking(prev)
      return stack.slice(0, -1)
    })
  }, [])

  const addNode = useCallback(
    (nodeType: 'class' | 'interface') => {
      const id = `n-${nanoid(6)}`
      const elementId = `el-${nanoid(6)}`
      const name = nodeType === 'interface' ? 'NewInterface' : 'NewClass'
      onWorkingChange({
        nodes: [
          ...(working.nodes as unknown[]),
          {
            id,
            position: { x: 80 + Math.random() * 160, y: 80 + Math.random() * 100 },
            data: { elementId, name, nodeType, methods: [], attributes: [] },
          },
        ],
        edges: working.edges,
      })
      setSelectedId(elementId)
    },
    [working, onWorkingChange],
  )

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    const nodes = (working.nodes ?? []) as { id?: string; data?: { elementId?: string } }[]
    const edges = (working.edges ?? []) as {
      id?: string
      source?: string
      target?: string
      data?: { elementId?: string }
    }[]
    const matches = (eid: string | undefined, id: string | undefined) =>
      selectedId === String(eid ?? '') || selectedId === String(id ?? '')
    const removedNodeIds = new Set(
      nodes.filter(n => matches(n.data?.elementId, n.id)).map(n => String(n.id)),
    )
    const nextNodes = nodes.filter(n => !matches(n.data?.elementId, n.id))
    const nextEdges = edges.filter(e => {
      if (matches(e.data?.elementId, e.id)) return false
      if (removedNodeIds.has(String(e.source)) || removedNodeIds.has(String(e.target))) return false
      return true
    })
    if (nextNodes.length === nodes.length && nextEdges.length === edges.length) return
    onWorkingChange({ nodes: nextNodes, edges: nextEdges })
    setSelectedId(null)
  }, [selectedId, working, onWorkingChange])

  const prediction = useMemo(
    () => ({
      elementNames: [...selectedClasses],
      relationshipKeys: [...selectedRels],
    }),
    [selectedClasses, selectedRels],
  )

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))
  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const onSubmit = useCallback(async () => {
    setBusy(true)
    try {
      await studioApi.saveChange(attemptId, working, prediction).catch(() => undefined)
      const res = await studioApi.submitChange(attemptId, working, prediction)
      setResult(res.result)
      setStage('results')
      toast.success(res.result?.accepted ? 'Change accepted' : 'Change reviewed')
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [attemptId, working, prediction])

  const behaviorChecks = useMemo(() => {
    const br = result?.behaviorReport as {
      checks?: { id: string; ok: boolean; label: string; detail?: string }[]
    }
    return br?.checks ?? []
  }, [result])

  const constraintChecks = useMemo(() => {
    const cr = result?.constraintReport as {
      checks?: { id: string; ok: boolean; label: string; severity?: string }[]
    }
    return cr?.checks ?? []
  }, [result])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    )
  }

  if (!pack) {
    return (
      <CategoryShell title="Not found" backHref="/design-studio/change" backLabel="Change One">
        <p className="p-8 text-center text-[13px] text-ink-muted">Attempt or pack missing.</p>
      </CategoryShell>
    )
  }

  const cr = payload.changeRequest
  const requestBody = cr?.body ?? payload.allowedChange ?? pack.description

  if (stage === 'results' && result) {
    return (
      <CategoryShell
        title={pack.title}
        subtitle="Change results"
        backHref="/design-studio/change"
        backLabel="Challenges"
      >
        <ChangeComplete result={result} elapsedSec={elapsed} nameById={nameById} />
        <div className="mx-auto max-w-lg px-6 pb-12">
          <BeforeAfterDiff
            diff={(result.diff as DiffEntryLike[]) ?? []}
            behaviorChecks={behaviorChecks}
            constraintChecks={constraintChecks}
          />
        </div>
      </CategoryShell>
    )
  }

  if (stage === 'brief') {
    return (
      <CategoryShell
        title={pack.title}
        subtitle="Understand the current design"
        backHref="/design-studio/change"
        backLabel="Challenges"
        actions={
          <button
            type="button"
            onClick={() => setStage('predict')}
            className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white"
          >
            Continue
          </button>
        }
      >
        <ChangeRequestCard
          title={cr?.title}
          body={requestBody}
          type={cr?.type}
          constraints={payload.constraints}
          briefing={payload.briefing}
        />
        <div className="flex min-h-0 flex-col">
          <div className="shrink-0 border-b border-hairline bg-paper px-4 py-1.5 sm:px-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Existing design · read-only
            </p>
          </div>
          <div className="relative h-[70vh] min-h-[480px]">
            <DebuggerCanvas
              diagram={original}
              readOnly
              selectedId={null}
              onSelect={() => {}}
              className="absolute inset-0"
              hideEditChrome
            />
          </div>
        </div>
      </CategoryShell>
    )
  }

  if (stage === 'predict') {
    return (
      <CategoryShell
        title={pack.title}
        subtitle="Predict impact"
        backHref="/design-studio/change"
        backLabel="Challenges"
      >
        <ChangeRequestCard
          title={cr?.title}
          body={requestBody}
          type={cr?.type}
          constraints={payload.constraints}
          briefing={payload.briefing}
        />
        <PredictImpactPanel
          classNames={classNames}
          relationshipLabels={relationshipLabels}
          selectedClasses={selectedClasses}
          selectedRels={selectedRels}
          onToggleClass={name => {
            setSelectedClasses(prev => {
              const next = new Set(prev)
              if (next.has(name)) next.delete(name)
              else next.add(name)
              return next
            })
          }}
          onToggleRel={key => {
            setSelectedRels(prev => {
              const next = new Set(prev)
              if (next.has(key)) next.delete(key)
              else next.add(key)
              return next
            })
          }}
          onConfirm={() => {
            toast.message('Prediction locked — make the minimal change')
            setStage('edit')
          }}
        />
      </CategoryShell>
    )
  }

  return (
    <CategoryShell
      title={pack.title}
      subtitle={cr?.title ?? 'Apply the minimal architectural change'}
      backHref="/design-studio/change"
      backLabel="Challenges"
      timer={<span className="tabular-nums">{timerLabel}</span>}
      actions={
        <button
          type="button"
          disabled={busy}
          onClick={onSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send size={14} />}
          Submit Change
        </button>
      }
    >
      <ChangeRequestCard
        title={cr?.title}
        body={requestBody}
        type={cr?.type}
        constraints={payload.constraints}
        briefing={payload.briefing}
      />
      <ChangeToolbar
        onUndo={onUndo}
        canUndo={undoStack.length > 0}
        onAddClass={() => addNode('class')}
        onAddInterface={() => addNode('interface')}
        onDeleteSelected={deleteSelected}
        canDelete={Boolean(selectedId)}
        disabled={busy}
      />
      <SplitCanvas
        original={original}
        working={working}
        selectedId={selectedId}
        onSelect={id => setSelectedId(id)}
        onWorkingChange={onWorkingChange}
      />
    </CategoryShell>
  )
}
