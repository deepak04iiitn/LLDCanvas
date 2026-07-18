'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BookOpen, Search, ToggleLeft, ToggleRight, Trophy,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
  Save, RefreshCw, AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { adminApi, type AdminProblem } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

const DIFFICULTY_COLORS = {
  easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  hard:   'bg-red-50    text-red-700    border-red-200',
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toLines(arr: string[] | undefined) { return (arr ?? []).join('\n') }
function fromLines(s: string): string[] { return s.split('\n').map(l => l.trim()).filter(Boolean) }
function toSlug(s: string) { return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

// ─── Empty form state ─────────────────────────────────────────────────────────
type FormState = {
  title: string; slug: string; difficulty: string; category: string
  description: string; order: string; isActive: boolean
  companies: string; tags: string
  functionalRequirements: string; nonFunctionalRequirements: string; hints: string
}

function emptyForm(): FormState {
  return {
    title: '', slug: '', difficulty: 'easy', category: '',
    description: '', order: '0', isActive: true,
    companies: '', tags: '',
    functionalRequirements: '', nonFunctionalRequirements: '', hints: '',
  }
}
function problemToForm(p: AdminProblem): FormState {
  return {
    title: p.title, slug: p.slug, difficulty: p.difficulty, category: p.category,
    description: p.description ?? '', order: String(p.order), isActive: p.isActive,
    companies: toLines(p.companies), tags: toLines(p.tags),
    functionalRequirements: toLines(p.functionalRequirements),
    nonFunctionalRequirements: toLines(p.nonFunctionalRequirements),
    hints: toLines(p.hints),
  }
}

// ─── Sliding form panel ───────────────────────────────────────────────────────
function ProblemPanel({
  editTarget, onClose, onSaved,
}: { editTarget: AdminProblem | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editTarget
  const [form, setForm]       = useState<FormState>(editTarget ? problemToForm(editTarget) : emptyForm())
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }))

  function handleTitleChange(v: string) {
    setForm(prev => ({ ...prev, title: v, slug: prev.slug || toSlug(v) }))
  }

  async function handleSave() {
    if (!form.title || !form.difficulty || !form.category || !form.description) {
      setError('Title, difficulty, category, and description are required.')
      return
    }
    setSaving(true); setError(null)
    try {
      const payload = {
        title:       form.title,
        slug:        form.slug || toSlug(form.title),
        difficulty:  form.difficulty as 'easy' | 'medium' | 'hard',
        category:    form.category,
        description: form.description,
        order:       Number(form.order) || 0,
        isActive:    form.isActive,
        companies:              fromLines(form.companies),
        tags:                   fromLines(form.tags),
        functionalRequirements:    fromLines(form.functionalRequirements),
        nonFunctionalRequirements: fromLines(form.nonFunctionalRequirements),
        hints:                  fromLines(form.hints),
      }
      if (isEdit && editTarget) {
        await adminApi.problems.update(editTarget.id, payload)
      } else {
        await adminApi.problems.create(payload)
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
  const ta  = `${inp} resize-none`

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{isEdit ? 'Edit Problem' : 'New Problem'}</p>
            <p className="text-xs text-ink-faint">{isEdit ? `Editing "${editTarget?.title}"` : 'Add a new LLD practice problem'}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Title *">
              <input className={inp} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. Design URL Shortener" />
            </Field>
            <Field label="Slug">
              <input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Difficulty *">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Category *">
              <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. System Design" />
            </Field>
            <Field label="Order">
              <input className={inp} type="number" value={form.order} onChange={e => set('order', e.target.value)} />
            </Field>
          </div>

          <Field label="Description *">
            <textarea className={ta} rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full problem statement…" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Companies (one per line)">
              <textarea className={ta} rows={3} value={form.companies} onChange={e => set('companies', e.target.value)} placeholder="Google&#10;Amazon&#10;Netflix" />
            </Field>
            <Field label="Tags (one per line)">
              <textarea className={ta} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="caching&#10;database&#10;scalability" />
            </Field>
          </div>

          <Field label="Functional Requirements (one per line)">
            <textarea className={ta} rows={4} value={form.functionalRequirements} onChange={e => set('functionalRequirements', e.target.value)} placeholder="Users can shorten URLs&#10;Users can track click counts…" />
          </Field>

          <Field label="Non-Functional Requirements (one per line)">
            <textarea className={ta} rows={4} value={form.nonFunctionalRequirements} onChange={e => set('nonFunctionalRequirements', e.target.value)} placeholder="High availability (99.99%)&#10;Low latency < 100ms…" />
          </Field>

          <Field label="Hints (one per line — up to 3)">
            <textarea className={ta} rows={3} value={form.hints} onChange={e => set('hints', e.target.value)} placeholder="Think about hash functions&#10;Consider caching at CDN level&#10;Use consistent hashing" />
          </Field>

          <Field label="Status">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-hairline accent-brand" />
              <span className="text-sm text-ink">Active (visible to users)</span>
            </label>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isEdit ? 'Save Changes' : 'Create Problem'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ problem, onConfirm, onCancel }: { problem: AdminProblem; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-2xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"><Trash2 className="h-5 w-5 text-red-600" /></div>
          <div>
            <p className="font-semibold text-ink">Delete Problem?</p>
            <p className="text-xs text-ink-faint">This cannot be undone.</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-ink-muted">
          Are you sure you want to delete <span className="font-semibold text-ink">"{problem.title}"</span>?
          All user solutions for this problem will remain but become orphaned.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminProblemsPage() {
  const [problems,    setProblems]    = useState<AdminProblem[]>([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [toggling,    setToggling]    = useState<string | null>(null)
  const [q,           setQ]           = useState('')
  const [difficulty,  setDifficulty]  = useState('')
  const [draftQ,      setDraftQ]      = useState('')

  const [panelOpen,   setPanelOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState<AdminProblem | null>(null)
  const [deleteTarget,setDeleteTarget]= useState<AdminProblem | null>(null)
  const [deleting,    setDeleting]    = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const data = await adminApi.problems.list({ page: p, limit: 20, q, difficulty })
      setProblems(data.problems)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch { /* no-op */ }
    finally { setLoading(false) }
  }, [q, difficulty])

  useEffect(() => { load(1) }, [load])

  async function handleToggle(id: string) {
    setToggling(id)
    try {
      const res = await adminApi.problems.toggle(id)
      setProblems(prev => prev.map(p => p.id === id ? { ...p, isActive: res.isActive } : p))
    } catch { /* no-op */ }
    finally { setToggling(null) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.problems.delete(deleteTarget.id)
      setDeleteTarget(null)
      load(page)
    } catch { /* no-op */ }
    finally { setDeleting(false) }
  }

  function openCreate() { setEditTarget(null); setPanelOpen(true) }
  function openEdit(p: AdminProblem) { setEditTarget(p); setPanelOpen(true) }
  function closePanel() { setPanelOpen(false); setEditTarget(null) }
  function onSaved() { closePanel(); load(page) }
  function search() { setQ(draftQ); setPage(1) }

  const active   = problems.filter(p => p.isActive).length
  const inactive = problems.filter(p => !p.isActive).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Practice Problems</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Create, edit, and manage LLD interview problems</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-right">
            <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
              <p className="text-lg font-bold text-brand">{total}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Total</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-emerald-600">{active}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">Active</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
              <p className="text-lg font-bold text-ink-faint">{inactive}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Inactive</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> New Problem
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text" placeholder="Search problems…" value={draftQ}
            onChange={e => setDraftQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1) }}
          className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-sm outline-none focus:border-brand">
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={search} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90">Search</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-hairline/40">
              {['#','Problem','Difficulty','Category','Solutions','Submitted','Added','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-hairline">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : problems.map((p, i) => (
              <tr key={p.id} className={cn('border-b border-hairline transition hover:bg-hairline/30', !p.isActive && 'opacity-50')}>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{(page - 1) * 20 + i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="font-mono text-[10px] text-ink-faint">{p.slug}</p>
                  {p.companies?.length > 0 && (
                    <p className="text-[10px] text-ink-faint mt-0.5">{p.companies.slice(0, 3).join(', ')}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', DIFFICULTY_COLORS[p.difficulty])}>
                    {p.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted capitalize">{p.category}</td>
                <td className="px-4 py-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold text-ink">
                    <Trophy size={11} className="text-amber-500" /> {p.solutions}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-bold text-brand">{p.submitted}</span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-faint">
                  {p.createdAt ? format(parseISO(p.createdAt), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(p.id)} disabled={toggling === p.id}
                    className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50"
                    title={p.isActive ? 'Deactivate' : 'Activate'}>
                    {p.isActive
                      ? <><ToggleRight size={14} className="text-emerald-500" /> Active</>
                      : <><ToggleLeft  size={14} className="text-ink-faint"   /> Inactive</>}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)}
                      className="rounded-md border border-hairline p-1.5 text-ink-muted hover:bg-brand-tint hover:text-brand hover:border-brand/30 transition"
                      title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(p)}
                      className="rounded-md border border-hairline p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                      title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && problems.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <BookOpen className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No problems found</p>
            <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Create first problem
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-faint">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline transition hover:bg-hairline disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-ink">Page {page} of {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline transition hover:bg-hairline disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sliding panel */}
      {panelOpen && <ProblemPanel editTarget={editTarget} onClose={closePanel} onSaved={onSaved} />}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          problem={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {deleting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <RefreshCw className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}
    </div>
  )
}
