'use client'

import { useState } from 'react'
import { Bug, CheckCircle2, XCircle, Plus, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DiagramNode {
  id: string
  type: 'class' | 'interface' | string
  data: { label: string }
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
  diagramData: { nodes: DiagramNode[]; edges: any[] }
}

interface SubmitResult {
  score: number
  correctIssues: ExpectedIssue[]
  missedIssues:  ExpectedIssue[]
  skillDeltas:   Record<string, number>
  interviewReadiness?: number
}

interface FoundIssue {
  type: string
  targetClass: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ISSUE_TYPES: Array<{ value: string; label: string }> = [
  { value: 'srp_violation',       label: 'SRP Violation (Single Responsibility)' },
  { value: 'wrong_relationship',  label: 'Wrong Relationship Type' },
  { value: 'missing_abstraction', label: 'Missing Abstraction' },
  { value: 'god_class',           label: 'God Class' },
  { value: 'tight_coupling',      label: 'Tight Coupling' },
  { value: 'missing_interface',   label: 'Missing Interface' },
]

const DIFFICULTY_COLOURS: Record<string, string> = {
  easy:   'text-green-600  bg-green-50  border-green-200',
  medium: 'text-amber-600  bg-amber-50  border-amber-200',
  hard:   'text-red-600    bg-red-50    border-red-200',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IssueRow({
  issue,
  classNames,
  onUpdate,
  onRemove,
}: {
  issue: FoundIssue
  classNames: string[]
  onUpdate: (updated: FoundIssue) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Class selector */}
      <div className="relative flex-1">
        <select
          value={issue.targetClass}
          onChange={e => onUpdate({ ...issue, targetClass: e.target.value })}
          className="w-full appearance-none rounded-lg border border-hairline bg-paper px-3 py-2 pr-8 text-sm text-ink focus:border-brand focus:outline-none"
        >
          <option value="">— Select class —</option>
          {classNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
      </div>

      {/* Issue type selector */}
      <div className="relative flex-[1.4]">
        <select
          value={issue.type}
          onChange={e => onUpdate({ ...issue, type: e.target.value })}
          className="w-full appearance-none rounded-lg border border-hairline bg-paper px-3 py-2 pr-8 text-sm text-ink focus:border-brand focus:outline-none"
        >
          <option value="">— Select issue type —</option>
          {ISSUE_TYPES.map(it => (
            <option key={it.value} value={it.value}>{it.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg p-1.5 text-ink-faint transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function ResultBadge({ issue, correct }: { issue: ExpectedIssue; correct: boolean }) {
  const issueLabel = ISSUE_TYPES.find(t => t.value === issue.type)?.label ?? issue.type
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border p-3 text-sm',
        correct
          ? 'border-green-200 bg-green-50'
          : 'border-red-200   bg-red-50',
      )}
    >
      {correct
        ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
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
          <p className="mt-1 rounded bg-white/70 px-2 py-1 text-[11px] text-ink-faint italic">
            💬 {issue.interviewContext}
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
  const [foundIssues, setFoundIssues] = useState<FoundIssue[]>([{ type: '', targetClass: '' }])
  const [submitting, setSubmitting]   = useState(false)
  const [result, setResult]           = useState<SubmitResult | null>(null)
  const [error, setError]             = useState<string | null>(null)

  // Extract unique class names from diagram nodes
  const classNames: string[] = Array.from(
    new Set(
      (bug.diagramData?.nodes ?? [])
        .filter(n => n?.data?.label)
        .map(n => n.data.label as string),
    ),
  ).sort()

  function addIssue() {
    setFoundIssues(prev => [...prev, { type: '', targetClass: '' }])
  }

  function updateIssue(idx: number, updated: FoundIssue) {
    setFoundIssues(prev => prev.map((item, i) => (i === idx ? updated : item)))
  }

  function removeIssue(idx: number) {
    setFoundIssues(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    const valid = foundIssues.filter(i => i.type && i.targetClass)
    if (!valid.length) {
      setError('Add at least one issue before submitting.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/learn/debuglab/design/${bug._id}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ foundIssues: valid }),
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

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Bug size={20} strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-medium text-ink">{bug.title}</h2>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
                difficultyClass,
              )}
            >
              {bug.difficulty}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{bug.description}</p>
        </div>
      </div>

      {/* Class grid */}
      {classNames.length > 0 && (
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Classes in this design
          </p>
          <div className="flex flex-wrap gap-2">
            {classNames.map(name => (
              <span
                key={name}
                className="rounded-lg border border-hairline bg-paper px-3 py-1.5 font-mono text-xs text-ink"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Issue builder — hidden once result is shown */}
      {!result && (
        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            Issues you found
          </p>

          {foundIssues.map((issue, idx) => (
            <IssueRow
              key={idx}
              issue={issue}
              classNames={classNames}
              onUpdate={updated => updateIssue(idx, updated)}
              onRemove={() => removeIssue(idx)}
            />
          ))}

          <button
            type="button"
            onClick={addIssue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-hairline px-3 py-2 text-sm text-ink-muted transition hover:border-brand/40 hover:text-brand"
          >
            <Plus size={14} />
            Add another issue
          </button>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? 'Checking…' : 'Submit findings'}
          </button>
        </section>
      )}

      {/* Results */}
      {result && (
        <section className="space-y-4">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-hairline bg-paper-elevated py-6">
            <p className="font-mono text-5xl font-bold text-brand">{result.score}%</p>
            <p className="text-sm text-ink-muted">
              {result.correctIssues.length} of {result.correctIssues.length + result.missedIssues.length} issues found
            </p>
            {result.interviewReadiness !== undefined && (
              <p className="mt-1 text-[12px] text-ink-faint">
                Interview readiness: <span className="font-semibold text-ink">{result.interviewReadiness}%</span>
              </p>
            )}
          </div>

          {/* Skill gains */}
          {Object.keys(result.skillDeltas).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.skillDeltas).map(([skill, delta]) => (
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
              <p className="text-[11px] font-semibold uppercase tracking-widest text-green-600">
                ✓ Correctly identified
              </p>
              {result.correctIssues.map(issue => (
                <ResultBadge key={issue.id} issue={issue} correct />
              ))}
            </div>
          )}

          {/* Missed issues */}
          {result.missedIssues.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-red-500">
                ✗ Missed
              </p>
              {result.missedIssues.map(issue => (
                <ResultBadge key={issue.id} issue={issue} correct={false} />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setResult(null)
              setFoundIssues([{ type: '', targetClass: '' }])
            }}
            className="w-full rounded-xl border border-hairline py-2.5 text-sm text-ink-muted transition hover:border-brand/30 hover:text-brand"
          >
            Try again
          </button>
        </section>
      )}
    </div>
  )
}
