'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { SplitCanvas } from '@/components/studio/refactor/SplitCanvas'
import { RequirementsPanel } from '@/components/studio/refactor/RequirementsPanel'
import { RefactorToolbar } from '@/components/studio/refactor/RefactorToolbar'
import { ExtractClassPanel } from '@/components/studio/refactor/ExtractClassPanel'
import { BeforeAfterDiff, type DiffEntryLike } from '@/components/studio/refactor/BeforeAfterDiff'
import { RefactorComplete } from '@/components/studio/refactor/RefactorComplete'
import { GuidedStartPanel } from '@/components/studio/refactor/GuidedStartPanel'
import { InterviewerAssessmentPanel } from '@/components/studio/refactor/InterviewerAssessmentPanel'
import { PostChallengeDebrief } from '@/components/shared/PostChallengeDebrief'
import type { DebuggerDiagram } from '@/components/studio/debugger/DebuggerCanvas'
import { studioApi, type StudioPackDetail } from '@/lib/studio-api'

export interface RefactorSessionProps {
  attemptId: string
}

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

export function RefactorSession({ attemptId }: RefactorSessionProps) {
  const [pack, setPack] = useState<StudioPackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [original, setOriginal] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [working, setWorking] = useState<DebuggerDiagram>({ nodes: [], edges: [] })
  const [undoStack, setUndoStack] = useState<DebuggerDiagram[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [extractMode, setExtractMode] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [skillDeltas, setSkillDeltas] = useState<Record<string, number>>({})
  const [interviewReadiness, setInterviewReadiness] = useState<number | undefined>()
  const [showDebrief, setShowDebrief] = useState(true)
  const [startedAt, setStartedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [submitted, setSubmitted] = useState(false)

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
    const nodes = (working.nodes ?? []) as {
      id?: string
      data?: { elementId?: string }
    }[]
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
      if (removedNodeIds.has(String(e.source)) || removedNodeIds.has(String(e.target))) {
        return false
      }
      return true
    })

    if (nextNodes.length === nodes.length && nextEdges.length === edges.length) return
    onWorkingChange({ nodes: nextNodes, edges: nextEdges })
    setSelectedId(null)
  }, [selectedId, working, onWorkingChange])

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))
  const timerLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  const onSubmit = useCallback(async () => {
    setBusy(true)
    try {
      await studioApi.saveRefactor(attemptId, working).catch(() => undefined)
      const rawRes = await studioApi.submitRefactor(attemptId, working)
      const res = rawRes as typeof rawRes & {
        skillDeltas?: Record<string, number>
        interviewReadiness?: number
      }
      setResult(res.result)
      setSkillDeltas(res.skillDeltas ?? {})
      setInterviewReadiness(res.interviewReadiness)
      setShowDebrief(true)
      setSubmitted(true)
      toast.success(res.result?.accepted ? 'Refactor accepted' : 'Refactor reviewed')
    } catch (err) {
      toast.error((err as Error).message ?? 'Submit failed')
    } finally {
      setBusy(false)
    }
  }, [attemptId, working])

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

  // IDs of behavior flows that passed – used by BehaviorFlowChecklist in result screen
  const satisfiedFlowIds = useMemo(
    () => behaviorChecks.filter(c => c.ok).map(c => c.id),
    [behaviorChecks],
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    )
  }

  if (!pack) {
    return (
      <CategoryShell title="Not found" backHref="/design-studio/refactor" backLabel="Refactor">
        <p className="p-8 text-center text-[13px] text-ink-muted">Attempt or pack missing.</p>
      </CategoryShell>
    )
  }

  if (submitted && result) {
    const accepted = Boolean(result.accepted)
    return (
      <CategoryShell
        title={pack.title}
        subtitle="Refactoring results"
        backHref="/design-studio/refactor"
        backLabel="Challenges"
      >
        <RefactorComplete result={result} elapsedSec={elapsed} />

        {/* Interviewer assessment */}
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

        {/* Post-challenge skill debrief */}
        {showDebrief && Object.keys(skillDeltas).length > 0 && (
          <div className="mx-auto max-w-lg px-6 pb-4 flex justify-center">
            <PostChallengeDebrief
              source="studio_refactor"
              skillDeltas={skillDeltas}
              interviewReadiness={interviewReadiness}
              passed={accepted}
              nextAction={{
                label: 'Next refactoring',
                href: '/design-studio/refactor',
                description: 'Pick another broken design to fix',
              }}
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
      </CategoryShell>
    )
  }

  return (
    <CategoryShell
      title={pack.title}
      subtitle={
        payload.scenario
          ? `${pack.description ?? 'Improve structure without breaking behavior'} · ${payload.scenario}`
          : (pack.description ?? 'Improve structure without breaking behavior')
      }
      backHref="/design-studio/refactor"
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
          Submit Refactoring
        </button>
      }
    >
      {/* Guided start hints – visible while working */}
      {payload.briefing && (
        <GuidedStartPanel
          briefing={payload.briefing}
          requirements={payload.requirements ?? []}
          constraints={payload.constraints}
          submitted={submitted}
        />
      )}
      <RequirementsPanel
        briefing={payload.briefing}
        requirements={payload.requirements}
        constraints={payload.constraints}
        flows={payload.behaviorContract?.flows}
        satisfiedFlowIds={submitted ? satisfiedFlowIds : undefined}
      />
      <RefactorToolbar
        extractMode={extractMode}
        onToggleExtract={() => setExtractMode(v => !v)}
        onUndo={onUndo}
        canUndo={undoStack.length > 0}
        onAddClass={() => addNode('class')}
        onAddInterface={() => addNode('interface')}
        onDeleteSelected={deleteSelected}
        canDelete={Boolean(selectedId)}
        disabled={busy}
      />
      <div className="flex min-w-0">
        <div className="min-w-0 flex-1">
          <SplitCanvas
            original={original}
            working={working}
            selectedId={selectedId}
            onSelect={id => setSelectedId(id)}
            onWorkingChange={onWorkingChange}
          />
        </div>
        {extractMode && (
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
        )}
      </div>
    </CategoryShell>
  )
}
