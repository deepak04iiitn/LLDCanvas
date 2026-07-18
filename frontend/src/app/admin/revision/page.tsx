'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Layers, Search, ToggleLeft, ToggleRight, BookmarkCheck,
  RotateCcw, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2, X, Save, RefreshCw, AlertTriangle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { adminApi, type AdminRevisionNote } from '@/lib/admin-api'
import { cn } from '@/lib/utils'

const DIFFICULTY_COLORS: Record<string, string> = {
  basic:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50  text-amber-700  border-amber-200',
  advanced:     'bg-red-50    text-red-700    border-red-200',
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toLines(arr: string[] | undefined) { return (arr ?? []).join('\n') }
function fromLines(s: string): string[] { return s.split('\n').map(l => l.trim()).filter(Boolean) }
function toSlug(s: string) { return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

type FormState = {
  title: string; slug: string; category: string; difficulty: string
  summary: string; keyPoints: string; analogy: string; codeHint: string
  tags: string; order: string; isActive: boolean
}

function emptyForm(): FormState {
  return {
    title: '', slug: '', category: '', difficulty: 'basic',
    summary: '', keyPoints: '', analogy: '', codeHint: '',
    tags: '', order: '0', isActive: true,
  }
}
function noteToForm(n: AdminRevisionNote): FormState {
  return {
    title: n.title, slug: n.slug, category: n.category, difficulty: n.difficulty,
    summary: n.summary ?? '', keyPoints: toLines(n.keyPoints), analogy: n.analogy ?? '',
    codeHint: n.codeHint ?? '', tags: toLines(n.tags),
    order: String(n.order), isActive: n.isActive,
  }
}

// ─── Sliding form panel ───────────────────────────────────────────────────────
function RevisionPanel({
  editTarget, onClose, onSaved,
}: { editTarget: AdminRevisionNote | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editTarget
  const [form, setForm]       = useState<FormState>(editTarget ? noteToForm(editTarget) : emptyForm())
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }))

  function handleTitleChange(v: string) {
    setForm(prev => ({ ...prev, title: v, slug: prev.slug || toSlug(v) }))
  }

  async function handleSave() {
    if (!form.title || !form.category || !form.summary) {
      setError('Title, category, and summary are required.')
      return
    }
    setSaving(true); setError(null)
    try {
      const payload = {
        title:      form.title,
        slug:       form.slug || toSlug(form.title),
        category:   form.category,
        difficulty: form.difficulty,
        summary:    form.summary,
        keyPoints:  fromLines(form.keyPoints),
        analogy:    form.analogy,
        codeHint:   form.codeHint,
        tags:       fromLines(form.tags),
        order:      Number(form.order) || 0,
        isActive:   form.isActive,
      }
      if (isEdit && editTarget) {
        await adminApi.revision.update(editTarget.id, payload)
      } else {
        await adminApi.revision.create(payload)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10'
  const ta  = `${inp} resize-none`

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>
      {children}
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{isEdit ? 'Edit Revision Note' : 'New Revision Note'}</p>
            <p className="text-xs text-ink-faint">{isEdit ? `Editing "${editTarget?.title}"` : 'Add a new quick revision note'}</p>
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
              <input className={inp} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. SOLID Principles" />
            </Field>
            <Field label="Slug">
              <input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Category *">
              <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. OOP Principles" />
            </Field>
            <Field label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Order">
              <input className={inp} type="number" value={form.order} onChange={e => set('order', e.target.value)} />
            </Field>
          </div>

          <Field label="Summary *">
            <textarea className={ta} rows={4} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="A concise summary of the concept…" />
          </Field>

          <Field label="Key Points (one per line)">
            <textarea className={ta} rows={5} value={form.keyPoints} onChange={e => set('keyPoints', e.target.value)} placeholder="Single responsibility principle&#10;Open/closed principle&#10;Liskov substitution…" />
          </Field>

          <Field label="Analogy">
            <textarea className={ta} rows={3} value={form.analogy} onChange={e => set('analogy', e.target.value)} placeholder="Think of it like a restaurant kitchen where…" />
          </Field>

          <Field label="Code Hint">
            <textarea className={ta} rows={4} value={form.codeHint} onChange={e => set('codeHint', e.target.value)} placeholder="// Example showing the concept&#10;interface Shape {&#10;  area(): number&#10;}" />
          </Field>

          <Field label="Tags (one per line)">
            <textarea className={ta} rows={2} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="design-patterns&#10;oop&#10;solid" />
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
            {isEdit ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ note, onConfirm, onCancel }: { note: AdminRevisionNote; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-2xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"><Trash2 className="h-5 w-5 text-red-600" /></div>
          <div>
            <p className="font-semibold text-ink">Delete Revision Note?</p>
            <p className="text-xs text-ink-faint">This cannot be undone.</p>
          </div>
        </div>
        <p className="mb-4 text-sm text-ink-muted">
          Are you sure you want to delete <span className="font-semibold text-ink">"{note.title}"</span>?
          All user revision data for this note will remain but become orphaned.
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
export default function AdminRevisionPage() {
  const [notes,        setNotes]        = useState<AdminRevisionNote[]>([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [toggling,     setToggling]     = useState<string | null>(null)
  const [q,            setQ]            = useState('')
  const [draftQ,       setDraftQ]       = useState('')
  const [category,     setCategory]     = useState('')

  const [panelOpen,    setPanelOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState<AdminRevisionNote | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminRevisionNote | null>(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const data = await adminApi.revision.list({ page: p, limit: 20, q, category })
      setNotes(data.notes)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch { /* no-op */ }
    finally { setLoading(false) }
  }, [q, category])

  useEffect(() => { load(1) }, [load])

  async function handleToggle(id: string) {
    setToggling(id)
    try {
      const res = await adminApi.revision.toggle(id)
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isActive: res.isActive } : n))
    } catch { /* no-op */ }
    finally { setToggling(null) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await adminApi.revision.delete(deleteTarget.id)
      setDeleteTarget(null)
      load(page)
    } catch { /* no-op */ }
  }

  function openCreate() { setEditTarget(null); setPanelOpen(true) }
  function openEdit(n: AdminRevisionNote) { setEditTarget(n); setPanelOpen(true) }
  function closePanel() { setPanelOpen(false); setEditTarget(null) }
  function onSaved() { closePanel(); load(page) }
  function search() { setQ(draftQ) }

  const active   = notes.filter(n => n.isActive).length
  const inactive = notes.filter(n => !n.isActive).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Revision Notes</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Create, edit, and manage quick revision notes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-3">
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
            <Plus className="h-4 w-4" /> New Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input type="text" placeholder="Search notes…" value={draftQ}
            onChange={e => setDraftQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
        </div>
        <input type="text" placeholder="Filter by category" value={category}
          onChange={e => setCategory(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-sm outline-none focus:border-brand w-40" />
        <button onClick={search} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90">Search</button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-hairline/40">
              {['#','Title','Category','Difficulty','Revised by','Bookmarked','Added','Status','Actions'].map(h => (
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
            ) : notes.map((n, i) => (
              <tr key={n.id} className={cn('border-b border-hairline transition hover:bg-hairline/30', !n.isActive && 'opacity-50')}>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{(page - 1) * 20 + i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{n.title}</p>
                  <p className="font-mono text-[10px] text-ink-faint">{n.slug}</p>
                  {n.tags?.length > 0 && (
                    <p className="text-[10px] text-ink-faint mt-0.5">{n.tags.slice(0, 3).join(', ')}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted capitalize">{n.category}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
                    DIFFICULTY_COLORS[n.difficulty] ?? 'bg-hairline text-ink-faint border-hairline')}>
                    {n.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold text-ink">
                    <RotateCcw size={10} className="text-violet-500" /> {n.revised}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-xs font-semibold text-ink">
                    <BookmarkCheck size={10} className="text-amber-500" /> {n.bookmarked}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-faint">
                  {n.createdAt ? format(parseISO(n.createdAt), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(n.id)} disabled={toggling === n.id}
                    className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50">
                    {n.isActive
                      ? <><ToggleRight size={14} className="text-emerald-500" /> Active</>
                      : <><ToggleLeft  size={14} className="text-ink-faint"   /> Inactive</>}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(n)}
                      className="rounded-md border border-hairline p-1.5 text-ink-muted hover:bg-brand-tint hover:text-brand hover:border-brand/30 transition"
                      title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(n)}
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

        {!loading && notes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Layers className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No revision notes found</p>
            <button onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Create first note
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
      {panelOpen && <RevisionPanel editTarget={editTarget} onClose={closePanel} onSaved={onSaved} />}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm note={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
