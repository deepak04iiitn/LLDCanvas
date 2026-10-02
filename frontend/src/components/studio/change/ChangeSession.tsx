'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Eraser,
  Hand,
  Loader2,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  Redo2,
  RotateCcw,
  Send,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { DebuggerCanvas, type DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import { BeforeAfterDiff, type DiffEntryLike } from '@/components/studio/refactor/BeforeAfterDiff'
import { PredictImpactPanel } from '@/components/studio/change/PredictImpactPanel'
import { ChangeComplete } from '@/components/studio/change/ChangeComplete'
import { InterviewerPerspectivePanel } from '@/components/studio/change/InterviewerPerspectivePanel'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'
import type { BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'

export interface ChangeSessionProps {
  attemptId: string
  breadcrumb?: BreadcrumbSegment[]
}

type Stage = 'brief' | 'predict' | 'edit' | 'results'

const STAGE_ORDER: Stage[] = ['brief', 'predict', 'edit', 'results']
const STAGE_LABELS: Record<Stage, string> = {
  brief:   'Brief',
  predict: 'Predict',
  edit:    'Edit',
  results: 'Results',
}

function stageIndex(s: Stage) { return STAGE_ORDER.indexOf(s) }

function normalizeDiagram(raw: unknown): DebuggerDiagram {
  const snap = (raw ?? { nodes: [], edges: [] }) as { nodes?: unknown[]; edges?: unknown[] }
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
  const [pack,            setPack]            = useState<StudioPackDetail | null>(null)
  const [loading,         setLoading]         = useState(true)
  const [stage,           setStage]           = useState<Stage>('brief')
  const [original,        setOriginal]        = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working,         setWorking]         = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack,       setUndoStack]       = useState<DebuggerDiagram[]>([])
  const [redoStack,       setRedoStack]       = useState<DebuggerDiagram[]>([])
  const [selectedId,      setSelectedId]      = useState<string | null>(null)
  const [busy,            setBusy]            = useState(false)
  const [result,          setResult]          = useState<Record<string, unknown> | null>(null)
  const [startedAt,       setStartedAt]       = useState(Date.now())
  const [now,             setNow]             = useState(Date.now())
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [selectedRels,    setSelectedRels]    = useState<Set<string>>(new Set())

  // Canvas mode + UI panels
  const [canvasMode,       setCanvasMode]       = useState<'pan' | 'select' | 'eraser'>('select')
  const [originalCollapsed,setOriginalCollapsed] = useState(false)
  const [briefPanelOpen,   setBriefPanelOpen]   = useState(false)
  const [predPanelOpen,    setPredPanelOpen]     = useState(false)
  const [hintDismissed,    setHintDismissed]     = useState(false)

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
        setStartedAt(res.attempt?.startedAt ? new Date(res.attempt.startedAt).getTime() : Date.now())
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
    return () => { cancelled = true }
  }, [attemptId])

  const classNames = useMemo(
    () => [...new Set((original.nodes ?? []).map(nodeName))].sort((a, b) => a.localeCompare(b)),
    [original],
  )
  const relationshipLabels = useMemo(() => {
    const nodes = (original.nodes ?? []) as { id?: string; data?: { name?: string } }[]
    const byId = new Map(nodes.map(n => [String(n.id), String(n.data?.name ?? n.id)]))
    return ((original.edges ?? []) as { source?: string; target?: string }[])
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
    setRedoStack([])
  }, [])

  const onWorkingChange = useCallback((next: DebuggerDiagram) => {
    setWorking(prev => { pushUndo(prev); return next })
  }, [pushUndo])

  const onUndo = useCallback(() => {
    setUndoStack(stack => {
      if (!stack.length) return stack
      const prev = stack[stack.length - 1]
      setWorking(cur => { setRedoStack(r => [...r.slice(-19), cloneDiagram(cur)]); return prev })
      return stack.slice(0, -1)
    })
  }, [])

  const onRedo = useCallback(() => {
    setRedoStack(stack => {
      if (!stack.length) return stack
      const next = stack[stack.length - 1]
      setWorking(cur => { setUndoStack(u => [...u.slice(-19), cloneDiagram(cur)]); return next })
      return stack.slice(0, -1)
    })
  }, [])

  const addNode = useCallback((nodeType: 'class' | 'interface') => {
    const id = `n-${nanoid(6)}`
    const elementId = `el-${nanoid(6)}`
    const name = nodeType === 'interface' ? 'NewInterface' : 'NewClass'
    onWorkingChange({
      nodes: [...(working.nodes as unknown[]),
        { id, position: { x: 80 + Math.random() * 160, y: 80 + Math.random() * 100 },
          data: { elementId, name, nodeType, methods: [], attributes: [] } }],
      edges: working.edges,
    })
    setSelectedId(elementId)
  }, [working, onWorkingChange])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    const nodes = (working.nodes ?? []) as { id?: string; data?: { elementId?: string } }[]
    const edges = (working.edges ?? []) as { id?: string; source?: string; target?: string; data?: { elementId?: string } }[]
    const matches = (eid: string | undefined, id: string | undefined) =>
      selectedId === String(eid ?? '') || selectedId === String(id ?? '')
    const removedNodeIds = new Set(nodes.filter(n => matches(n.data?.elementId, n.id)).map(n => String(n.id)))
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

  const onEraseNode = useCallback((rfNodeId: string) => {
    const nodes = (working.nodes ?? []) as { id?: string }[]
    const edges = (working.edges ?? []) as { id?: string; source?: string; target?: string }[]
    onWorkingChange({ nodes: nodes.filter(n => String(n.id) !== rfNodeId), edges: edges.filter(e => e.source !== rfNodeId && e.target !== rfNodeId) })
  }, [working, onWorkingChange])

  const onEraseEdge = useCallback((rfEdgeId: string) => {
    const edges = (working.edges ?? []) as { id?: string }[]
    onWorkingChange({ nodes: working.nodes, edges: edges.filter(e => String(e.id) !== rfEdgeId) })
  }, [working, onWorkingChange])

  const prediction = useMemo(() => ({
    elementNames: [...selectedClasses],
    relationshipKeys: [...selectedRels],
  }), [selectedClasses, selectedRels])

  const elapsed    = Math.max(0, Math.floor((now - startedAt) / 1000))
  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const onSubmit = useCallback(async () => {
    setBusy(true)
    try {
      await studioApi.saveChange(attemptId, working, prediction).catch(() => undefined)
      const res = await studioApi.submitChange(attemptId, working, prediction)
      setResult(res.result)
      setStage('results')
      toast.success(res.result?.accepted ? 'Change accepted ✓' : 'Change reviewed')
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [attemptId, working, prediction])

  const behaviorChecks = useMemo(() => {
    const br = result?.behaviorReport as { checks?: { id: string; ok: boolean; label: string; detail?: string }[] }
    return br?.checks ?? []
  }, [result])
  const constraintChecks = useMemo(() => {
    const cr = result?.constraintReport as { checks?: { id: string; ok: boolean; label: string; severity?: string }[] }
    return cr?.checks ?? []
  }, [result])

  const cr          = payload.changeRequest
  const requestBody = cr?.body ?? payload.allowedChange ?? pack?.description

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading session…</span>
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────

  if (stage === 'results' && result) {
    return (
      <div className="h-full overflow-y-auto bg-paper">
        <div className="sticky top-0 z-10 border-b border-hairline bg-paper/95 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/design-studio/change/problems" className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-faint hover:text-ink transition-colors">
              <ArrowLeft size={13} /> Challenges
            </Link>
            <span className="h-4 w-px bg-hairline-strong" />
            <p className="font-serif text-[15px] font-medium text-ink">{pack?.title}</p>
            <span className={cn(
              'ml-2 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
              result.accepted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            )}>
              {result.accepted ? 'Accepted' : 'Reviewed'}
            </span>
          </div>
        </div>
        <ChangeComplete result={result} elapsedSec={elapsed} nameById={nameById} packSlug={pack?.slug ?? ''} />
        <div className="mx-auto max-w-lg px-6 pb-6">
          <BeforeAfterDiff diff={(result.diff as DiffEntryLike[]) ?? []} behaviorChecks={behaviorChecks} constraintChecks={constraintChecks} />
        </div>
        <div className="mx-auto max-w-lg px-6 pb-12">
          <InterviewerPerspectivePanel result={result} />
        </div>
      </div>
    )
  }

  // ── Shared header ────────────────────────────────────────────────────────

  const currentIdx = stageIndex(stage)

  const Header = (
    <header className="shrink-0 flex items-center h-12 border-b border-hairline bg-paper px-4 gap-0">
      {/* Left — back + title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href="/design-studio/change/problems"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors shrink-0"
        >
          <ArrowLeft size={13} /> Challenges
        </Link>
        <span className="h-4 w-px bg-hairline-strong shrink-0" />
        <p className="font-serif text-[14px] font-medium text-ink leading-tight truncate min-w-0">
          {pack?.title ?? 'Change One Thing'}
        </p>
      </div>

      {/* Center — stage pills */}
      <div className="flex items-center gap-0 shrink-0 mx-4">
        {(['brief', 'predict', 'edit'] as Stage[]).map((s, i) => {
          const active = s === stage
          const done   = i < currentIdx
          return (
            <div key={s} className="flex items-center">
              {i > 0 && <span className="text-hairline-strong text-[10px] mx-1.5">→</span>}
              <span className={cn(
                'px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wide transition-all',
                active && 'bg-ink text-paper',
                done && !active && 'text-ink/40',
                !done && !active && 'text-ink-faint',
              )}>
                {STAGE_LABELS[s]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Right — timer (edit stage only) */}
      <div className="flex items-center gap-4 shrink-0 flex-1 justify-end">
        {stage === 'edit' && (
          <span className="font-mono text-[13px] tabular-nums text-ink-muted">{timerLabel}</span>
        )}
      </div>
    </header>
  )

  // ── BRIEF stage ──────────────────────────────────────────────────────────

  if (stage === 'brief') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}

        <div className="flex-1 min-h-0 flex">

          {/* Left: Original canvas */}
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                Current design · read only
              </span>
            </div>
            <DebuggerCanvas diagram={original} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
          </div>

          {/* Right: Brief panel */}
          <div className="w-96 shrink-0 flex flex-col border-l border-hairline bg-paper">
            <div className="shrink-0 px-5 py-4 border-b border-hairline">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-1">
                Change Request{cr?.type ? ` · ${cr.type}` : ''}
              </p>
              <h2 className="font-serif text-[18px] font-medium text-ink leading-snug">
                {cr?.title ?? pack?.title}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {payload.briefing && (
                <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">
                    Situation · read this first
                  </p>
                  <p className="text-[13px] text-ink leading-relaxed whitespace-pre-line">{payload.briefing}</p>
                </div>
              )}

              {requestBody && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">
                    What product wants
                  </p>
                  <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">{requestBody}</p>
                </div>
              )}

              {payload.constraints && payload.constraints.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">
                    Hard rules
                  </p>
                  <ul className="space-y-1.5">
                    {payload.constraints.map(c => (
                      <li key={c} className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 text-rose-500 font-semibold">✕</span>
                        <span className="text-[13px] text-ink leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to do */}
              <div className="rounded-xl border border-hairline overflow-hidden">
                {[
                  { n: '1', title: 'Study this design', body: 'Look at the left canvas — understand which classes and relationships exist right now.' },
                  { n: '2', title: 'Predict the blast radius', body: 'On the next screen, select which classes you think will need to change.' },
                  { n: '3', title: 'Make the minimal edit', body: 'Apply the smallest structural change that satisfies the request without breaking anything.' },
                ].map((s, i) => (
                  <div key={s.n} className={cn('flex items-start gap-4 px-4 py-3.5', i > 0 && 'border-t border-hairline')}>
                    <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full border border-hairline flex items-center justify-center">
                      <span className="font-mono text-[10px] text-ink-faint">{s.n}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{s.title}</p>
                      <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 px-5 py-4 border-t border-hairline bg-paper-elevated">
              <button
                type="button"
                onClick={() => setStage('predict')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-all active:scale-[0.98]"
              >
                Predict impact <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PREDICT stage ────────────────────────────────────────────────────────

  if (stage === 'predict') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
        {Header}

        <div className="flex-1 min-h-0 flex">

          {/* Left: Original canvas */}
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                Current design · for reference
              </span>
            </div>
            <DebuggerCanvas diagram={original} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
          </div>

          {/* Right: Predict panel */}
          <div className="w-[420px] shrink-0 flex flex-col border-l border-hairline bg-paper">
            <div className="shrink-0 px-5 py-4 border-b border-hairline">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-1">
                Step 2 of 3
              </p>
              <h2 className="font-serif text-[18px] font-medium text-ink">Predict the impact</h2>
              <p className="mt-1 text-[12px] text-ink-muted leading-relaxed">
                Which classes and relationships will need to change? Select them before editing.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <PredictImpactPanel
                classNames={classNames}
                relationshipLabels={relationshipLabels}
                selectedClasses={selectedClasses}
                selectedRels={selectedRels}
                onToggleClass={name => setSelectedClasses(prev => {
                  const next = new Set(prev)
                  if (next.has(name)) next.delete(name); else next.add(name)
                  return next
                })}
                onToggleRel={key => setSelectedRels(prev => {
                  const next = new Set(prev)
                  if (next.has(key)) next.delete(key); else next.add(key)
                  return next
                })}
                onConfirm={() => {
                  toast.message('Prediction locked — make the minimal change')
                  setStage('edit')
                }}
              />
            </div>

            <div className="shrink-0 px-5 py-3 border-t border-hairline bg-paper-elevated flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStage('brief')}
                className="text-[12px] text-ink-faint hover:text-ink transition-colors"
              >
                ← Back to brief
              </button>
              <button
                type="button"
                disabled={selectedClasses.size === 0}
                onClick={() => { toast.message('Prediction locked — make the minimal change'); setStage('edit') }}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-all"
              >
                Lock &amp; Edit <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── EDIT stage ───────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">
      {Header}

      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-0.5 h-10 border-b border-hairline bg-paper-elevated px-3">

        {/* Mode group */}
        <div className="flex items-center gap-0.5 rounded-lg border border-hairline bg-paper p-0.5 mr-2">
          {([
            { id: 'pan',    icon: Hand,          label: 'Pan'    },
            { id: 'select', icon: MousePointer2, label: 'Select' },
            { id: 'eraser', icon: Eraser,        label: 'Eraser' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button key={id} type="button" title={label}
              onClick={() => setCanvasMode(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-all',
                canvasMode === id ? 'bg-ink text-paper shadow-sm' : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
              )}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        <button type="button" onClick={() => addNode('class')}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors">
          <CirclePlus size={12} /> Class
        </button>
        <button type="button" onClick={() => addNode('interface')}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors">
          <CirclePlus size={12} /> Interface
        </button>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        <button type="button" onClick={onUndo} disabled={undoStack.length === 0} title="Undo"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors disabled:opacity-30">
          <RotateCcw size={12} /> Undo
        </button>
        <button type="button" onClick={onRedo} disabled={redoStack.length === 0} title="Redo"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors disabled:opacity-30">
          <Redo2 size={12} /> Redo
        </button>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        <button type="button" onClick={deleteSelected} disabled={!selectedId || canvasMode === 'eraser'}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-red-600 transition-colors disabled:opacity-30">
          <Trash2 size={12} /> Delete
        </button>

        <div className="flex-1" />
        <p className="hidden xl:block font-mono text-[10px] text-ink-faint pr-2">
          {canvasMode === 'pan' && 'Drag to pan freely'}
          {canvasMode === 'select' && 'Make the minimal structural change'}
          {canvasMode === 'eraser' && 'Click any node or edge to erase it'}
        </p>
      </div>

      {/* Split canvas */}
      <div className="relative flex-1 min-h-0 flex">

        {/* LEFT: Original */}
        {!originalCollapsed && (
          <div className="relative flex-1 min-w-0 border-r border-hairline">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                Original · Read only
              </span>
            </div>
            <button type="button" title="Hide original" onClick={() => setOriginalCollapsed(true)}
              className="absolute top-1/2 -translate-y-1/2 right-0 z-10 flex items-center justify-center h-10 w-6 rounded-l-lg border border-r-0 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors shadow-md group">
              <PanelLeftClose size={14} className="text-amber-500 group-hover:text-amber-700 transition-colors" />
            </button>
            <DebuggerCanvas diagram={original} readOnly selectedId={null} onSelect={() => {}} className="h-full" hideEditChrome />
          </div>
        )}

        {/* Collapsed tab */}
        {originalCollapsed && (
          <button type="button" title="Show original" onClick={() => setOriginalCollapsed(false)}
            className="shrink-0 flex flex-col items-center justify-center gap-2 w-8 border-r border-hairline bg-amber-50 hover:bg-amber-100 transition-colors group">
            <PanelLeftOpen size={13} className="text-amber-500 group-hover:text-amber-700" />
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-amber-500 group-hover:text-amber-700"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Original
            </span>
          </button>
        )}

        {/* RIGHT: Working */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-700">
              Your Change · minimal edits only
            </span>
          </div>

          <DebuggerCanvas
            diagram={working}
            readOnly={false}
            selectedId={selectedId}
            onSelect={id => setSelectedId(id)}
            onDiagramChange={onWorkingChange}
            onEraseNode={onEraseNode}
            onEraseEdge={onEraseEdge}
            canvasMode={canvasMode}
            className="h-full"
            hideEditChrome
          />

          {/* Canvas hint */}
          {!selectedId && !hintDismissed && (
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full border border-hairline bg-paper/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
                <p className="font-mono text-[11px] text-ink-muted whitespace-nowrap">
                  Make the smallest change that satisfies the request
                </p>
                <button type="button" onClick={() => setHintDismissed(true)} className="ml-1 shrink-0 text-ink-faint hover:text-ink transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Brief / Prediction overlays */}
          {briefPanelOpen && (
            <div className="absolute top-0 right-0 bottom-0 z-30 w-96 border-l border-hairline bg-paper shadow-xl flex flex-col">
              <div className="flex items-center justify-between shrink-0 border-b border-hairline px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Change Request</p>
                <button type="button" onClick={() => setBriefPanelOpen(false)} className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {cr?.title && <h3 className="font-serif text-[16px] font-medium text-ink">{cr.title}</h3>}
                {payload.briefing && (
                  <div className="rounded-xl bg-paper-elevated border border-hairline px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint mb-2">Situation</p>
                    <p className="text-[13px] text-ink leading-relaxed whitespace-pre-line">{payload.briefing}</p>
                  </div>
                )}
                {requestBody && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint mb-1.5">What product wants</p>
                    <p className="text-[13px] text-ink-muted leading-relaxed whitespace-pre-line">{requestBody}</p>
                  </div>
                )}
                {payload.constraints && payload.constraints.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint mb-1.5">Hard rules</p>
                    <ul className="space-y-1.5">
                      {payload.constraints.map(c => (
                        <li key={c} className="flex items-start gap-2"><span className="text-rose-500 shrink-0 mt-0.5">✕</span><span className="text-[13px] text-ink leading-snug">{c}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {predPanelOpen && (
            <div className="absolute top-0 right-0 bottom-0 z-30 w-80 border-l border-hairline bg-paper shadow-xl flex flex-col">
              <div className="flex items-center justify-between shrink-0 border-b border-hairline px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Your Prediction</p>
                <button type="button" onClick={() => setPredPanelOpen(false)} className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {selectedClasses.size === 0 && selectedRels.size === 0 ? (
                  <p className="text-[13px] text-ink-muted">No prediction was made.</p>
                ) : (
                  <>
                    {selectedClasses.size > 0 && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint mb-2">Classes predicted to change</p>
                        <ul className="space-y-1">
                          {[...selectedClasses].map(c => (
                            <li key={c} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" /><span className="font-mono text-[12px] text-ink">{c}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedRels.size > 0 && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint mb-2">Relationships predicted to change</p>
                        <ul className="space-y-1">
                          {[...selectedRels].map(r => (
                            <li key={r} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" /><span className="font-mono text-[11px] text-ink-muted">{r}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 h-12 flex items-center border-t border-hairline bg-paper px-4 gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setBriefPanelOpen(v => !v); setPredPanelOpen(false) }}
            className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
              briefPanelOpen ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-paper-elevated hover:text-ink')}>
            <AlignLeft size={13} /> Brief
          </button>
          <button type="button" onClick={() => { setPredPanelOpen(v => !v); setBriefPanelOpen(false) }}
            className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
              predPanelOpen ? 'bg-ink text-paper' : selectedClasses.size > 0 ? 'text-ink ring-1 ring-ink/20 bg-ink/5' : 'text-ink-muted hover:bg-paper-elevated hover:text-ink')}>
            <Target size={13} /> Prediction
            {selectedClasses.size > 0 && <span className="ml-0.5 font-mono text-[10px] opacity-60">({selectedClasses.size + selectedRels.size})</span>}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-[11px] text-ink-faint hidden sm:block">
            Original = left &nbsp;·&nbsp; Your change = right &nbsp;·&nbsp; Keep it minimal
          </p>
        </div>

        <button type="button" disabled={busy} onClick={onSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Submit Change
        </button>
      </div>
    </div>
  )
}
