'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Bug, CheckCircle2, XCircle, X, Loader2, ChevronDown, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawNode {
  id: string
  type?: 'class' | 'interface' | string
  data: { label: string }
  position?: { x: number; y: number }
}

interface ExpectedIssue {
  id: string
  type: string
  targetClass: string
  description?: string
  interviewContext?: string
}

interface DesignBug {
  _id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  diagramData?: { nodes: RawNode[]; edges: any[] } | null
}

interface SubmitResult {
  score: number
  correctIssues: ExpectedIssue[]
  missedIssues:  ExpectedIssue[]
  skillDeltas:   Record<string, number>
  interviewReadiness?: number
}

interface SelectedIssue {
  nodeId: string
  className: string
  type: string
}

interface Popover {
  nodeId: string
  className: string
  x: number
  y: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ISSUE_TYPES: Array<{ value: string; label: string }> = [
  { value: 'srp_violation',       label: 'SRP Violation' },
  { value: 'wrong_relationship',  label: 'Wrong Relationship' },
  { value: 'missing_abstraction', label: 'Missing Abstraction' },
  { value: 'coupling_issue',      label: 'Coupling Issue' },
  { value: 'cohesion_issue',      label: 'Cohesion Issue' },
  { value: 'god_class',           label: 'God Class' },
  { value: 'other',               label: 'Other' },
]

const DIFFICULTY_COLOURS: Record<string, string> = {
  easy:   'text-emerald-700 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-700   bg-amber-50   border-amber-200',
  hard:   'text-red-700     bg-red-50     border-red-200',
}

// ── Auto-layout helper ────────────────────────────────────────────────────────

function layoutNodes(rawNodes: RawNode[]): Node[] {
  const COLS    = 3
  const GAP_X   = 220
  const GAP_Y   = 160
  const START_X = 60
  const START_Y = 60

  return rawNodes.map((n, i) => ({
    id:   n.id,
    type: 'default',
    position: n.position ?? {
      x: START_X + (i % COLS) * GAP_X,
      y: START_Y + Math.floor(i / COLS) * GAP_Y,
    },
    data:       { label: n.data.label },
    selectable: true,
  }))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultBadge({ issue, correct }: { issue: ExpectedIssue; correct: boolean }) {
  const issueLabel = ISSUE_TYPES.find(t => t.value === issue.type)?.label ?? issue.type
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border p-3 text-sm',
        correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50',
      )}
    >
      {correct
        ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
        : <XCircle      size={15} className="mt-0.5 shrink-0 text-red-500" />}
      <div>
        <p className="font-medium text-ink">
          <span className="font-semibold">{issue.targetClass}</span>
          {' — '}
          {issueLabel}
        </p>
        {issue.description && (
          <p className="mt-0.5 text-xs text-ink-muted">{issue.description}</p>
        )}
        {issue.interviewContext && (
          <p className="mt-1 flex items-start gap-1 rounded bg-paper/70 px-2 py-1 text-[11px] text-ink-faint italic">
            <MessageSquare size={10} className="mt-0.5 shrink-0" />
            {issue.interviewContext}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  bug: DesignBug
}

export function DesignBugSession({ bug }: Props) {
  const [nodes,          setNodes]          = useState<Node[]>([])
  const [edges,          setEdges]          = useState<Edge[]>([])
  const [popover,        setPopover]        = useState<Popover | null>(null)
  const [selectedIssues, setSelectedIssues] = useState<SelectedIssue[]>([])
  const [submitting,     setSubmitting]     = useState(false)
  const [result,         setResult]         = useState<SubmitResult | null>(null)
  const [error,          setError]          = useState<string | null>(null)
  const [fallbackNotes,  setFallbackNotes]  = useState('')

  const diagramContainerRef = useRef<HTMLDivElement>(null)

  const hasDiagram = !!(bug.diagramData?.nodes?.length)

  // Setup nodes from diagramData
  useEffect(() => {
    if (!hasDiagram) return
    const rawNodes: RawNode[] = bug.diagramData!.nodes
    const rawEdges: Edge[] = (bug.diagramData!.edges ?? []).map((e: any) => ({
      id:     e.id ?? `e-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label:  e.label,
      type:   e.type ?? 'default',
    }))
    setNodes(layoutNodes(rawNodes))
    setEdges(rawEdges)
  }, [bug, hasDiagram])

  // Close popover on outside click
  useEffect(() => {
    if (!popover) return
    function close(e: MouseEvent) {
      const popoverEl = document.getElementById('design-bug-popover')
      if (popoverEl && e.target instanceof Node && !popoverEl.contains(e.target)) {
        setPopover(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [popover])

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const label = (node.data as any).label as string
    setPopover({
      nodeId:    node.id,
      className: label,
      x:         event.clientX,
      y:         event.clientY,
    })
  }, [])

  function addIssue(issueType: string) {
    if (!popover) return
    setSelectedIssues(prev => {
      const exists = prev.find(i => i.nodeId === popover.nodeId && i.type === issueType)
      if (exists) return prev
      return [...prev, { nodeId: popover.nodeId, className: popover.className, type: issueType }]
    })
    setPopover(null)
  }

  function removeIssue(idx: number) {
    setSelectedIssues(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    const foundIssues = hasDiagram
      ? selectedIssues.map(i => ({ type: i.type, targetClass: i.className }))
      : [{ type: 'other', targetClass: fallbackNotes.slice(0, 100) }]

    if (!foundIssues.length || (!hasDiagram && !fallbackNotes.trim())) {
      setError('Identify at least one issue before submitting.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/learn/debuglab/design/${bug._id}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ foundIssues }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as any).message ?? 'Submission failed')
      }
      const data: SubmitResult = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const difficultyClass = DIFFICULTY_COLOURS[bug.difficulty] ?? DIFFICULTY_COLOURS.easy
  const issueCount = selectedIssues.length

  // ── Result view ────────────────────────────────────────────────────────────
  if (result) {
    const passed = result.score >= 70
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
          {/* Score */}
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-paper-elevated py-8">
            {passed
              ? <CheckCircle2 size={48} className="text-emerald-600" />
              : <XCircle      size={48} className="text-red-500" />}
            <p className="font-mono text-5xl font-bold text-brand">{result.score}%</p>
            <p className="text-[14px] text-ink-muted">
              {result.correctIssues.length} of{' '}
              {result.correctIssues.length + result.missedIssues.length} issues found
            </p>
            {result.interviewReadiness !== undefined && (
              <p className="text-[12px] text-ink-faint">
                Interview readiness:{' '}
                <span className="font-semibold text-ink">{result.interviewReadiness}%</span>
              </p>
            )}
          </div>

          {/* Skill gains */}
          {Object.keys(result.skillDeltas).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.skillDeltas)
                .filter(([, d]) => d > 0)
                .map(([skill, delta]) => (
                  <span
                    key={skill}
                    className="rounded-full border border-brand/20 bg-brand-tint px-3 py-1 text-[11px] font-medium text-brand"
                  >
                    +{delta} {skill}
                  </span>
                ))}
            </div>
          )}

          {/* Correct issues */}
          {result.correctIssues.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-600">
                Correctly identified
              </p>
              {result.correctIssues.map(issue => (
                <ResultBadge key={issue.id} issue={issue} correct />
              ))}
            </div>
          )}

          {/* Missed issues */}
          {result.missedIssues.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-red-500">
                Missed
              </p>
              {result.missedIssues.map(issue => (
                <ResultBadge key={issue.id} issue={issue} correct={false} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setResult(null)
                setSelectedIssues([])
                setFallbackNotes('')
              }}
              className="flex-1 rounded-xl border border-hairline py-2.5 text-[13px] font-medium text-ink-muted transition hover:border-brand/30 hover:text-brand"
            >
              Try Again
            </button>
            <Link
              href="/dashboard/learn/debugger"
              className="flex-1 rounded-xl bg-brand py-2.5 text-center text-[13px] font-semibold text-white transition hover:bg-brand/90"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-hairline bg-paper-elevated px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <Bug size={16} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-base font-medium text-ink truncate">{bug.title}</h2>
            <span className={cn(
              'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
              difficultyClass,
            )}>
              {bug.difficulty}
            </span>
          </div>
          <p className="text-[12px] text-ink-muted truncate">{bug.description}</p>
        </div>
      </div>

      {/* Diagram area — 55% viewport height */}
      <div className="relative shrink-0 border-b border-hairline" style={{ height: '55vh' }}>
        {hasDiagram ? (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              onNodeClick={handleNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-hairline, #E7E2D6)" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <Bug size={32} className="text-ink-faint" />
            <p className="text-[14px] font-medium text-ink-muted">
              Diagram not available for this challenge.
            </p>
            <p className="text-[13px] text-ink-faint max-w-sm">
              Please describe the issues you see based on the description below.
            </p>
            <textarea
              value={fallbackNotes}
              onChange={e => setFallbackNotes(e.target.value)}
              placeholder="Describe the structural issues you identified (SRP violations, wrong relationships, missing abstractions…)"
              className="mt-2 w-full max-w-lg rounded-xl border border-hairline bg-paper px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              rows={5}
            />
          </div>
        )}

        {/* Click instruction overlay */}
        {hasDiagram && selectedIssues.length === 0 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-hairline bg-paper/90 px-4 py-1.5 text-[11px] text-ink-muted backdrop-blur-sm">
            Click a node to mark an issue
          </div>
        )}
      </div>

      {/* Issues panel */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {issueCount} issue{issueCount !== 1 ? 's' : ''} identified
          </span>
          {issueCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIssues([])}
              className="text-[11px] text-ink-faint hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {issueCount === 0 && hasDiagram ? (
          <p className="text-[13px] text-ink-faint text-center py-4">
            Click nodes in the diagram above to identify design issues.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedIssues.map((issue, i) => {
              const issueLabel = ISSUE_TYPES.find(t => t.value === issue.type)?.label ?? issue.type
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-hairline bg-paper-elevated px-3 py-2"
                >
                  <span className="font-mono text-[11px] font-semibold text-ink">{issue.className}</span>
                  <span className="text-ink-faint text-[11px]">—</span>
                  <span className="text-[11px] text-ink-muted">{issueLabel}</span>
                  <button
                    type="button"
                    onClick={() => removeIssue(i)}
                    className="ml-auto shrink-0 rounded p-0.5 text-ink-faint hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Submit bar */}
      <div className="shrink-0 border-t border-hairline bg-paper-elevated px-4 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (hasDiagram ? issueCount === 0 : !fallbackNotes.trim())}
          className={cn(
            'w-full rounded-xl py-2.5 text-[13px] font-semibold transition flex items-center justify-center gap-2',
            submitting || (hasDiagram ? issueCount === 0 : !fallbackNotes.trim())
              ? 'bg-brand/30 text-white cursor-not-allowed'
              : 'bg-brand text-white hover:bg-brand/90',
          )}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting
            ? 'Checking…'
            : hasDiagram
              ? `Submit (${issueCount} issue${issueCount !== 1 ? 's' : ''})`
              : 'Submit findings'}
        </button>
      </div>

      {/* Node click popover — fixed position */}
      {popover && (
        <div
          id="design-bug-popover"
          className="fixed z-50 w-56 rounded-xl border border-hairline bg-paper shadow-xl overflow-hidden"
          style={{
            left: Math.min(popover.x, window.innerWidth - 240),
            top:  Math.min(popover.y + 8, window.innerHeight - 300),
          }}
        >
          <div className="flex items-center justify-between border-b border-hairline bg-paper-elevated px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint truncate">
              {popover.className}
            </p>
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="text-ink-faint hover:text-ink transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <div className="py-1">
            {ISSUE_TYPES.map(it => (
              <button
                key={it.value}
                type="button"
                onClick={() => addIssue(it.value)}
                className="w-full px-3 py-2 text-left text-[12px] text-ink transition hover:bg-brand-tint hover:text-brand"
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
