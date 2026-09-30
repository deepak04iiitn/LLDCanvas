'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Combine,
  Eraser,
  Hand,
  Loader2,
  ListChecks,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  Redo2,
  RotateCcw,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { DebuggerCanvas } from '@/components/studio/debugger/DebuggerCanvas'
import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import { ExtractClassPanel } from '@/components/studio/refactor/ExtractClassPanel'
import { BehaviorFlowChecklist } from '@/components/studio/refactor/BehaviorFlowChecklist'
import { BeforeAfterDiff, type DiffEntryLike } from '@/components/studio/refactor/BeforeAfterDiff'
import { RefactorComplete } from '@/components/studio/refactor/RefactorComplete'
import { InterviewerAssessmentPanel } from '@/components/studio/refactor/InterviewerAssessmentPanel'
import { PostChallengeDebrief } from '@/components/shared/PostChallengeDebrief'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'
import { cn } from '@/lib/utils'
import type { BreadcrumbSegment } from '@/components/studio/shell/CategoryShell'

export interface RefactorSessionProps {
  attemptId: string
  breadcrumb?: BreadcrumbSegment[]
}

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

export function RefactorSession({ attemptId }: RefactorSessionProps) {
  const [pack,              setPack]            = useState<StudioPackDetail | null>(null)
  const [loading,           setLoading]         = useState(true)
  const [original,          setOriginal]        = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working,           setWorking]         = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack,         setUndoStack]       = useState<DebuggerDiagram[]>([])
  const [selectedId,        setSelectedId]      = useState<string | null>(null)
  const [extractMode,       setExtractMode]     = useState(false)
  const [busy,              setBusy]            = useState(false)
  const [result,            setResult]          = useState<Record<string, unknown> | null>(null)
  const [skillDeltas,       setSkillDeltas]     = useState<Record<string, number>>({})
  const [interviewReadiness,setInterviewReadiness] = useState<number | undefined>()
  const [showDebrief,       setShowDebrief]     = useState(true)
  const [submitted,         setSubmitted]       = useState(false)
  const [startedAt,         setStartedAt]       = useState(Date.now())
  const [now,               setNow]             = useState(Date.now())

  // Canvas interaction mode
  const [canvasMode,        setCanvasMode]      = useState<'pan' | 'select' | 'eraser'>('select')

  // Redo stack (parallel to undoStack)
  const [redoStack,         setRedoStack]       = useState<DebuggerDiagram[]>([])

  // Panel states
  const [briefOpen,         setBriefOpen]       = useState(true) // auto-open on load
  const [reqPanelOpen,      setReqPanelOpen]    = useState(false)
  const [originalCollapsed, setOriginalCollapsed] = useState(false)
  const [hintDismissed,     setHintDismissed]   = useState(false)

  const payload = (pack?.payload ?? {}) as {
    briefing?: string
    requirements?: string[]
    constraints?: string[]
    behaviorContract?: { flows?: { id?: string; label: string; steps?: string[] }[] }
    scenario?: string
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
          setSubmitted(true)
          setBriefOpen(false)
        }
      } catch (err) {
        if (!cancelled) toast.error((err as Error).message ?? 'Failed to load session')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [attemptId])

  const pushUndo = useCallback((prev: DebuggerDiagram) => {
    setUndoStack(stack => [...stack.slice(-19), cloneDiagram(prev)])
    setRedoStack([]) // new change clears redo
  }, [])

  const onWorkingChange = useCallback((next: DebuggerDiagram) => {
    setWorking(prev => { pushUndo(prev); return next })
  }, [pushUndo])

  const onUndo = useCallback(() => {
    setUndoStack(stack => {
      if (!stack.length) return stack
      const prev = stack[stack.length - 1]
      setWorking(cur => {
        setRedoStack(r => [...r.slice(-19), cloneDiagram(cur)])
        return prev
      })
      return stack.slice(0, -1)
    })
  }, [])

  const onRedo = useCallback(() => {
    setRedoStack(stack => {
      if (!stack.length) return stack
      const next = stack[stack.length - 1]
      setWorking(cur => {
        setUndoStack(u => [...u.slice(-19), cloneDiagram(cur)])
        return next
      })
      return stack.slice(0, -1)
    })
  }, [])

  const addNode = useCallback((nodeType: 'class' | 'interface') => {
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

  // Eraser handlers (called from DebuggerCanvas when eraser mode is active)
  const onEraseNode = useCallback((rfNodeId: string) => {
    const nodes = (working.nodes ?? []) as { id?: string; data?: { elementId?: string } }[]
    const edges = (working.edges ?? []) as { id?: string; source?: string; target?: string }[]
    const nextNodes = nodes.filter(n => String(n.id) !== rfNodeId)
    const nextEdges = edges.filter(e => e.source !== rfNodeId && e.target !== rfNodeId)
    onWorkingChange({ nodes: nextNodes, edges: nextEdges })
  }, [working, onWorkingChange])

  const onEraseEdge = useCallback((rfEdgeId: string) => {
    const edges = (working.edges ?? []) as { id?: string }[]
    onWorkingChange({ nodes: working.nodes, edges: edges.filter(e => String(e.id) !== rfEdgeId) })
  }, [working, onWorkingChange])

  const elapsed    = Math.max(0, Math.floor((now - startedAt) / 1000))
  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const onSubmit = useCallback(async () => {
    setBusy(true)
    try {
      await studioApi.saveRefactor(attemptId, working).catch(() => undefined)
      const rawRes = await studioApi.submitRefactor(attemptId, working)
      const res = rawRes as typeof rawRes & { skillDeltas?: Record<string, number>; interviewReadiness?: number }
      setResult(res.result)
      setSkillDeltas(res.skillDeltas ?? {})
      setInterviewReadiness(res.interviewReadiness)
      setShowDebrief(true)
      setSubmitted(true)
      toast.success(res.result?.accepted ? 'Refactor accepted ✓' : 'Refactor reviewed')
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [attemptId, working])

  const behaviorChecks = useMemo(() => {
    const br = result?.behaviorReport as { checks?: { id: string; ok: boolean; label: string; detail?: string }[] }
    return br?.checks ?? []
  }, [result])

  const constraintChecks = useMemo(() => {
    const cr = result?.constraintReport as { checks?: { id: string; ok: boolean; label: string; severity?: string }[] }
    return cr?.checks ?? []
  }, [result])

  const satisfiedFlowIds = useMemo(() => behaviorChecks.filter(c => c.ok).map(c => c.id), [behaviorChecks])
  const flows = payload.behaviorContract?.flows ?? []
  const requirements = payload.requirements ?? []
  const constraints  = payload.constraints  ?? []

  // ── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading session…</span>
      </div>
    )
  }

  // ── Complete / submitted ─────────────────────────────────────────────────

  if (submitted && result) {
    const accepted = Boolean(result.accepted)
    return (
      <div className="h-full overflow-y-auto bg-paper">
        <div className="sticky top-0 z-10 border-b border-hairline bg-paper/95 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/design-studio/refactor/problems"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-faint hover:text-ink transition-colors"
            >
              <ArrowLeft size={13} /> Challenges
            </Link>
            <span className="h-4 w-px bg-hairline-strong" />
            <p className="font-serif text-[15px] font-medium text-ink">{pack?.title}</p>
            <span className={cn(
              'ml-2 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
              accepted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            )}>
              {accepted ? 'Accepted' : 'Reviewed'}
            </span>
          </div>
        </div>
        <RefactorComplete result={result} elapsedSec={elapsed} packSlug={pack?.slug ?? ''} />
        <div className="mx-auto max-w-lg px-6 pb-4">
          <InterviewerAssessmentPanel
            result={result}
            scoreDeltas={{
              coupling: Number(result.couplingReduction ?? 0),
              cohesion: Number(result.cohesionImprovement ?? 0),
              extensibility: Number(result.extensibility ?? 0),
            }}
          />
        </div>
        {showDebrief && Object.keys(skillDeltas).length > 0 && (
          <div className="mx-auto max-w-lg px-6 pb-4 flex justify-center">
            <PostChallengeDebrief
              source="studio_refactor"
              skillDeltas={skillDeltas}
              interviewReadiness={interviewReadiness}
              passed={accepted}
              nextAction={{ label: 'Next refactoring', href: '/design-studio/refactor', description: 'Pick another broken design to fix' }}
              onDismiss={() => setShowDebrief(false)}
            />
          </div>
        )}
        <div className="mx-auto max-w-lg px-6 pb-12">
          <BeforeAfterDiff
            diff={(result.diff as DiffEntryLike[]) ?? []}
            behaviorChecks={behaviorChecks}
            constraintChecks={constraintChecks}
          />
        </div>
      </div>
    )
  }

  // ── Active session (full-screen) ─────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-paper overflow-hidden">

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center h-12 border-b border-hairline bg-paper px-4 gap-0">

        {/* Left — back + title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/design-studio/refactor/problems"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink transition-colors shrink-0"
          >
            <ArrowLeft size={13} /> Challenges
          </Link>
          <span className="h-4 w-px bg-hairline-strong shrink-0" />
          <p className="font-serif text-[14px] font-medium text-ink leading-tight truncate min-w-0">
            {pack?.title ?? 'Refactoring Mode'}
          </p>
        </div>

        {/* Center — golden rule chip */}
        <div className="shrink-0 mx-4 hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-paper-elevated">
          <span className="font-mono text-[10px] text-ink-faint">Keep all behavior intact</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] text-ink-faint">Improve the structure</span>
        </div>

        {/* Right — timer */}
        <div className="flex items-center gap-4 shrink-0 flex-1 justify-end">
          <span className="font-mono text-[13px] tabular-nums text-ink-muted">{timerLabel}</span>
        </div>
      </header>

      {/* ── TOOLBAR ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-0.5 h-10 border-b border-hairline bg-paper-elevated px-3">

        {/* Mode group — Pan / Select / Eraser */}
        <div className="flex items-center gap-0.5 rounded-lg border border-hairline bg-paper p-0.5 mr-2">
          {([
            { id: 'pan',    icon: Hand,          label: 'Pan'    },
            { id: 'select', icon: MousePointer2, label: 'Select' },
            { id: 'eraser', icon: Eraser,        label: 'Eraser' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => { setCanvasMode(id); if (id !== 'select') setExtractMode(false) }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-all',
                canvasMode === id
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
              )}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        {/* Add nodes */}
        <button
          type="button"
          onClick={() => addNode('class')}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors"
        >
          <CirclePlus size={12} /> Class
        </button>
        <button
          type="button"
          onClick={() => addNode('interface')}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors"
        >
          <CirclePlus size={12} /> Interface
        </button>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        {/* Extract Class */}
        <button
          type="button"
          onClick={() => { setExtractMode(v => !v); setCanvasMode('select') }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors',
            extractMode ? 'bg-ink text-paper' : 'text-ink-muted hover:bg-paper hover:text-ink',
          )}
        >
          <Combine size={12} /> Extract
        </button>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors disabled:opacity-30"
        >
          <RotateCcw size={12} /> Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Y)"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-ink transition-colors disabled:opacity-30"
        >
          <Redo2 size={12} /> Redo
        </button>

        <span className="h-4 w-px bg-hairline-strong mx-1" />

        {/* Delete selected */}
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!selectedId || canvasMode === 'eraser'}
          title="Delete selected"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:bg-paper hover:text-red-600 transition-colors disabled:opacity-30"
        >
          <Trash2 size={12} /> Delete
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode hint */}
        <p className="hidden xl:block font-mono text-[10px] text-ink-faint pr-2">
          {canvasMode === 'pan'    && 'Drag to pan the canvas freely'}
          {canvasMode === 'select' && 'Click to select · drag nodes · draw connections'}
          {canvasMode === 'eraser' && 'Click any node or edge to erase it'}
        </p>
      </div>

      {/* ── SPLIT CANVAS AREA ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 flex">

        {/* ── LEFT: Original (read-only) — collapsible ───────────────────── */}
        {!originalCollapsed && (
          <div className="relative flex-1 min-w-0 border-r border-hairline transition-all">
            {/* Panel label */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                Original · Read only
              </span>
            </div>

            {/* Collapse button — far right, hugging the divider */}
            <button
              type="button"
              title="Hide original"
              onClick={() => setOriginalCollapsed(true)}
              className="absolute top-1/2 -translate-y-1/2 right-0 z-10 flex items-center justify-center h-10 w-6 rounded-l-lg border border-r-0 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors shadow-md group"
            >
              <PanelLeftClose size={14} className="text-amber-500 group-hover:text-amber-700 transition-colors" />
            </button>
            <DebuggerCanvas
              diagram={original}
              readOnly
              selectedId={null}
              onSelect={() => {}}
              className="h-full"
              hideEditChrome
            />
          </div>
        )}

        {/* Collapsed tab — click to expand original back */}
        {originalCollapsed && (
          <button
            type="button"
            title="Show original"
            onClick={() => setOriginalCollapsed(false)}
            className="shrink-0 flex flex-col items-center justify-center gap-2 w-8 border-r border-hairline bg-amber-50 hover:bg-amber-100 transition-colors group"
          >
            <PanelLeftOpen size={13} className="text-amber-500 group-hover:text-amber-700" />
            <span
              className="font-mono text-[9px] uppercase tracking-[0.15em] text-amber-500 group-hover:text-amber-700"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Original
            </span>
          </button>
        )}

        {/* ── RIGHT: Working (editable) ──────────────────────────────────── */}
        <div className="relative flex-1 min-w-0">
          {/* Panel label */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
              Your Design · Edit freely
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

          {/* Canvas hint when nothing selected */}
          {!selectedId && !extractMode && !hintDismissed && (
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full border border-hairline bg-paper/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <p className="font-mono text-[11px] text-ink-muted whitespace-nowrap">
                  Click nodes to select · drag to reposition · use toolbar to add or extract
                </p>
                <button
                  type="button"
                  onClick={() => setHintDismissed(true)}
                  className="ml-1 shrink-0 text-ink-faint hover:text-ink transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Extract Class panel */}
          {extractMode && (
            <div className="absolute top-0 right-0 bottom-0 z-20 w-80 border-l border-hairline bg-paper shadow-xl flex flex-col">
              <div className="flex items-center justify-between shrink-0 border-b border-hairline px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Extract Class
                </p>
                <button
                  type="button"
                  onClick={() => setExtractMode(false)}
                  className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ExtractClassPanel
                  diagram={working}
                  selectedElementId={selectedId}
                  onApply={next => {
                    onWorkingChange(next)
                    setExtractMode(false)
                    toast.success('Class extracted')
                  }}
                  onCancel={() => setExtractMode(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Requirements panel (slides from right, over both canvases) ──── */}
        {reqPanelOpen && (
          <div className="absolute top-0 right-0 bottom-0 z-30 w-96 border-l border-hairline bg-paper shadow-xl flex flex-col">
            <div className="flex items-center justify-between shrink-0 border-b border-hairline px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                Requirements
              </p>
              <button
                type="button"
                onClick={() => setReqPanelOpen(false)}
                className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* What still needs to work */}
              {requirements.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-3">
                    Must still work after refactoring
                  </p>
                  <ul className="space-y-2">
                    {requirements.map(r => (
                      <li key={r} className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                        <span className="text-[13px] text-ink leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Constraints */}
              {constraints.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-3">
                    Rules &amp; limits
                  </p>
                  <ul className="space-y-2">
                    {constraints.map(c => (
                      <li key={c} className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 text-amber-500">•</span>
                        <span className="text-[13px] text-ink-muted leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavior flows */}
              {flows.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint mb-3">
                    Behavior we will verify
                  </p>
                  <BehaviorFlowChecklist
                    flows={flows}
                    satisfiedFlowIds={submitted ? satisfiedFlowIds : undefined}
                  />
                </div>
              )}

              {/* Empty state */}
              {requirements.length === 0 && constraints.length === 0 && flows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <p className="text-[13px] font-medium text-ink">No explicit requirements</p>
                  <p className="text-[12px] text-ink-muted">
                    Use your judgment — improve structure without breaking any observable behavior.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Brief overlay (auto-opens on load) ────────────────────────── */}
        {briefOpen && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/20 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-2xl border border-hairline bg-paper shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                    Refactoring Mode
                  </span>
                  <span className="h-px w-6 bg-hairline-strong" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                    Problem Brief
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBriefOpen(false)}
                  className="rounded-lg p-1 text-ink-faint hover:bg-hairline hover:text-ink transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-5">

                {/* Title */}
                <div>
                  <h2 className="font-serif text-[22px] font-medium text-ink leading-snug">
                    {pack?.title}
                  </h2>
                  {payload.scenario && (
                    <p className="mt-1 text-[13px] text-ink-muted">{payload.scenario}</p>
                  )}
                </div>

                {/* Briefing */}
                {payload.briefing && (
                  <div className="rounded-xl bg-paper-elevated border border-hairline px-5 py-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2">
                      What&apos;s going on
                    </p>
                    <p className="text-[13px] text-ink leading-relaxed whitespace-pre-line">
                      {payload.briefing}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {requirements.length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint mb-2.5">
                      Must still work after you refactor
                    </p>
                    <ul className="space-y-1.5">
                      {requirements.map(r => (
                        <li key={r} className="flex items-start gap-2.5">
                          <span className="mt-0.5 shrink-0 text-emerald-500 font-semibold">✓</span>
                          <span className="text-[13px] text-ink leading-snug">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* How-to strip */}
                <div className="rounded-xl border border-hairline overflow-hidden">
                  {[
                    { n: '1', title: 'Study the original', body: 'Read the left canvas carefully — spot what\'s overloaded, tightly coupled, or hard to extend.' },
                    { n: '2', title: 'Edit the right canvas', body: 'Extract classes, introduce interfaces, rewire dependencies. Keep all the requirements above intact.' },
                    { n: '3', title: 'Submit your design', body: 'Hit Submit — your refactored design will be scored for coupling, cohesion, and extensibility.' },
                  ].map((s, i) => (
                    <div
                      key={s.n}
                      className={cn('flex items-start gap-4 px-5 py-3.5', i > 0 && 'border-t border-hairline')}
                    >
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

              {/* Footer CTA */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-hairline bg-paper-elevated">
                <p className="font-mono text-[10px] text-ink-faint">
                  You can re-read this brief any time via the Brief button below.
                </p>
                <button
                  type="button"
                  onClick={() => setBriefOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 transition-all active:scale-[0.98]"
                >
                  Start Refactoring
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM ACTION BAR ─────────────────────────────────────────────── */}
      <div className="shrink-0 h-12 flex items-center border-t border-hairline bg-paper px-4 gap-2">

        {/* Left — Brief + Requirements */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setBriefOpen(v => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
              briefOpen
                ? 'bg-ink text-paper'
                : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
            )}
          >
            <AlignLeft size={13} /> Brief
          </button>

          <button
            type="button"
            onClick={() => setReqPanelOpen(v => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
              reqPanelOpen
                ? 'bg-ink text-paper'
                : requirements.length > 0
                  ? 'text-ink ring-1 ring-ink/20 bg-ink/5'
                  : 'text-ink-muted hover:bg-paper-elevated hover:text-ink',
            )}
          >
            <ListChecks size={13} /> Requirements
            {requirements.length > 0 && (
              <span className="ml-0.5 font-mono text-[10px] opacity-60">({requirements.length})</span>
            )}
          </button>
        </div>

        {/* Center — reminder */}
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-[11px] text-ink-faint hidden sm:block">
            Left = original &nbsp;·&nbsp; Right = your refactor
          </p>
        </div>

        {/* Right — Submit */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={onSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-paper hover:bg-ink/80 disabled:opacity-40 transition-colors"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Submit Refactoring
          </button>
        </div>
      </div>

    </div>
  )
}
