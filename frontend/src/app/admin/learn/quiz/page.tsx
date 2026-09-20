'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  GraduationCap, Search, Plus, Pencil, Trash2, X, Save, RefreshCw,
  AlertTriangle, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { adminApi, type AdminQuizQuestion } from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { BulkActionBar, SelectCheckbox } from '@/components/admin/BulkActionBar'
import { useRowSelection } from '@/components/admin/useRowSelection'

const DIFFICULTY_COLORS = {
  easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  hard:   'bg-red-50    text-red-700    border-red-200',
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)
}

function qId(q: AdminQuizQuestion) {
  return String(q._id)
}

type FormState = {
  slug: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  choices: string
  correctIndex: string
  explanation: string
  status: 'draft' | 'published' | 'archived'
}

function emptyForm(): FormState {
  return {
    slug: '',
    topic: 'SOLID',
    difficulty: 'medium',
    prompt: '',
    choices: '',
    correctIndex: '0',
    explanation: '',
    status: 'draft',
  }
}

function questionToForm(q: AdminQuizQuestion): FormState {
  return {
    slug: q.slug,
    topic: q.topic,
    difficulty: q.difficulty,
    prompt: q.prompt,
    choices: (q.choices ?? []).join('\n'),
    correctIndex: String(q.correctIndex ?? 0),
    explanation: q.explanation ?? '',
    status: q.status,
  }
}

function QuizPanel({
  editTarget,
  onClose,
  onSaved,
}: {
  editTarget: AdminQuizQuestion | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!editTarget
  const [form, setForm] = useState<FormState>(editTarget ? questionToForm(editTarget) : emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  async function handleSave() {
    const choices = form.choices.split('\n').map(c => c.trim()).filter(Boolean)
    if (!form.prompt.trim()) {
      setError('Prompt is required.')
      return
    }
    if (choices.length < 2) {
      setError('Provide at least 2 choices (one per line).')
      return
    }
    const correctIndex = Number(form.correctIndex)
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= choices.length) {
      setError(`Correct index must be 0–${choices.length - 1}.`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        slug: form.slug.trim() || toSlug(form.prompt),
        topic: form.topic.trim() || 'SOLID',
        difficulty: form.difficulty,
        prompt: form.prompt.trim(),
        choices,
        correctIndex,
        explanation: form.explanation,
        status: form.status,
      }
      if (isEdit && editTarget) {
        await adminApi.learn.updateQuiz(qId(editTarget), body)
        toast.success('Question updated')
      } else {
        await adminApi.learn.createQuiz(body)
        toast.success('Question created')
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>
      {children}
    </div>
  )
  const inp = 'w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10'
  const ta = `${inp} resize-none`

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{isEdit ? 'Edit Question' : 'New Quiz Question'}</p>
            <p className="text-xs text-ink-faint">{isEdit ? 'Update daily LLD quiz item' : 'Add a question to the quiz bank'}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}

          <Field label="Prompt *">
            <textarea className={ta} rows={4} value={form.prompt} onChange={e => set('prompt', e.target.value)} placeholder="Which principle is violated when…" />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Slug">
              <input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto from prompt" />
            </Field>
            <Field label="Topic">
              <input className={inp} value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="SOLID" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value as FormState['difficulty'])}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Correct index">
              <input className={inp} type="number" min={0} value={form.correctIndex} onChange={e => set('correctIndex', e.target.value)} />
            </Field>
            <Field label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value as FormState['status'])}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <Field label="Choices (one per line) *">
            <textarea className={ta} rows={5} value={form.choices} onChange={e => set('choices', e.target.value)} placeholder="Option A&#10;Option B&#10;Option C&#10;Option D" />
          </Field>

          <Field label="Explanation">
            <textarea className={ta} rows={3} value={form.explanation} onChange={e => set('explanation', e.target.value)} placeholder="Why the correct answer is right…" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isEdit ? 'Save Changes' : 'Create Question'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function AdminLearnQuizPage() {
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [draftQ, setDraftQ] = useState('')
  const [q, setQ] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminQuizQuestion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminQuizQuestion | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return questions
    return questions.filter(item =>
      item.prompt.toLowerCase().includes(needle) ||
      item.slug.toLowerCase().includes(needle) ||
      item.topic.toLowerCase().includes(needle),
    )
  }, [questions, q])

  const pageIds = useMemo(() => filtered.map(qId), [filtered])
  const selection = useRowSelection(pageIds)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.learn.listQuiz()
      setQuestions(data.questions ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handlePublishToggle(item: AdminQuizQuestion) {
    const id = qId(item)
    setToggling(id)
    try {
      const nextStatus = item.status === 'published' ? 'draft' : 'published'
      const updated = await adminApi.learn.updateQuiz(id, { status: nextStatus })
      setQuestions(prev => prev.map(x => qId(x) === id ? { ...x, ...updated } : x))
      toast.success(nextStatus === 'published' ? 'Published' : 'Unpublished')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.learn.deleteQuiz(qId(deleteTarget))
      toast.success('Question deleted')
      setDeleteTarget(null)
      selection.clear()
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setDeleting(false)
    }
  }

  async function handleBulkDelete() {
    if (selection.count === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(selection.selectedIds.map(id => adminApi.learn.deleteQuiz(id)))
      toast.success(`Deleted ${selection.count} question${selection.count === 1 ? '' : 's'}`)
      setBulkConfirm(false)
      selection.clear()
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const published = questions.filter(item => item.status === 'published').length

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Daily LLD Quiz</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Create and publish quiz questions for Learn</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
              <p className="text-lg font-bold text-brand">{questions.length}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Total</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-emerald-600">{published}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">Published</p>
            </div>
          </div>
          <button
            onClick={() => { setEditTarget(null); setPanelOpen(true) }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 sm:w-auto"
          >
            <Plus className="h-4 w-4" /> New Question
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search questions…"
            value={draftQ}
            onChange={e => setDraftQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQ(draftQ)}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <button
          onClick={() => setQ(draftQ)}
          className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90 sm:w-auto"
        >
          Search
        </button>
      </div>

      <div className="space-y-3">
        <BulkActionBar
          count={selection.count}
          onClear={selection.clear}
          onDelete={() => setBulkConfirm(true)}
          loading={bulkLoading}
          label={selection.count === 1 ? 'question selected' : 'questions selected'}
        />

        <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-hairline bg-hairline/40">
                  <th className="w-10 px-4 py-3">
                    <SelectCheckbox
                      checked={selection.allPageSelected}
                      indeterminate={selection.somePageSelected}
                      onChange={selection.togglePage}
                      disabled={loading || filtered.length === 0}
                    />
                  </th>
                  {['Prompt', 'Topic', 'Difficulty', 'Updated', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-hairline">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map(item => {
                  const id = qId(item)
                  return (
                    <tr
                      key={id}
                      className={cn(
                        'border-b border-hairline transition hover:bg-hairline/30',
                        item.status !== 'published' && 'opacity-70',
                        selection.isSelected(id) && 'bg-brand-tint/40',
                      )}
                    >
                      <td className="px-4 py-3">
                        <SelectCheckbox checked={selection.isSelected(id)} onChange={() => selection.toggle(id)} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-2 font-medium text-ink">{item.prompt}</p>
                        <p className="font-mono text-[10px] text-ink-faint">{item.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">{item.topic}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', DIFFICULTY_COLORS[item.difficulty])}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-faint">
                        {item.updatedAt ? format(parseISO(item.updatedAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handlePublishToggle(item)}
                          disabled={toggling === id}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50"
                        >
                          {item.status === 'published'
                            ? <><ToggleRight size={14} className="text-emerald-500" /> Published</>
                            : <><ToggleLeft size={14} className="text-ink-faint" /> {item.status}</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditTarget(item); setPanelOpen(true) }}
                            className="rounded-md border border-hairline p-1.5 text-ink-muted transition hover:border-brand/30 hover:bg-brand-tint hover:text-brand"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-md border border-hairline p-1.5 text-ink-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16">
              <GraduationCap className="h-8 w-8 text-ink-faint opacity-40" />
              <p className="text-sm text-ink-faint">No quiz questions found</p>
              <button
                onClick={() => { setEditTarget(null); setPanelOpen(true) }}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Create first question
              </button>
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <QuizPanel
          editTarget={editTarget}
          onClose={() => { setPanelOpen(false); setEditTarget(null) }}
          onSaved={() => { setPanelOpen(false); setEditTarget(null); load() }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete question?"
        description={
          <>
            Delete <span className="font-semibold text-ink">&ldquo;{deleteTarget?.slug}&rdquo;</span>? This cannot be undone.
          </>
        }
        confirmLabel="Delete question"
        loading={deleting}
        icon={Trash2}
      />

      <ConfirmModal
        open={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selection.count} question${selection.count === 1 ? '' : 's'}?`}
        description="Permanently delete the selected quiz questions. This cannot be undone."
        confirmLabel={`Delete ${selection.count}`}
        loading={bulkLoading}
        icon={Trash2}
      />
    </div>
  )
}
