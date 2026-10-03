'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FlaskConical, Search, Plus, Pencil, Trash2, X, Save, RefreshCw,
  AlertTriangle, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  adminApi,
  type AdminChallengePack,
  type ChallengePackType,
  type ChallengePackStatus,
} from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { BulkActionBar, SelectCheckbox } from '@/components/admin/BulkActionBar'
import { useRowSelection } from '@/components/admin/useRowSelection'

const TYPE_TABS: { key: ChallengePackType | ''; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'debugger', label: 'Debugger' },
  { key: 'refactor', label: 'Refactor' },
  { key: 'change_one', label: 'Change One' },
  { key: 'evolution', label: 'Evolution' },
  { key: 'budget', label: 'Budget' },
]

const DIFFICULTY_COLORS = {
  easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  hard:   'bg-red-50    text-red-700    border-red-200',
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function packId(p: AdminChallengePack) {
  return String(p._id)
}

type FormState = {
  type: ChallengePackType
  title: string
  slug: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  status: ChallengePackStatus
  planMin: 'free' | 'pro' | 'ultimate'
  tags: string
  order: string
  payloadJson: string
}

function emptyForm(defaultType: ChallengePackType = 'debugger'): FormState {
  return {
    type: defaultType,
    title: '',
    slug: '',
    difficulty: 'medium',
    description: '',
    status: 'draft',
    planMin: 'free',
    tags: '',
    order: '0',
    payloadJson: '{}',
  }
}

function packToForm(p: AdminChallengePack): FormState {
  return {
    type: p.type,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    description: p.description ?? '',
    status: p.status,
    planMin: p.planMin,
    tags: (p.tags ?? []).join('\n'),
    order: String(p.order ?? 0),
    payloadJson: JSON.stringify(p.payload ?? {}, null, 2),
  }
}

function PackPanel({
  editTarget,
  defaultType,
  onClose,
  onSaved,
}: {
  editTarget: AdminChallengePack | null
  defaultType: ChallengePackType
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!editTarget
  const [form, setForm] = useState<FormState>(editTarget ? packToForm(editTarget) : emptyForm(defaultType))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  function handleTitleChange(v: string) {
    setForm(prev => ({ ...prev, title: v, slug: isEdit ? prev.slug : (prev.slug || toSlug(v)) }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    let payload: Record<string, unknown> = {}
    try {
      payload = JSON.parse(form.payloadJson || '{}') as Record<string, unknown>
    } catch {
      setError('Payload must be valid JSON.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        type: form.type,
        title: form.title.trim(),
        slug: form.slug.trim() || toSlug(form.title),
        difficulty: form.difficulty,
        description: form.description,
        status: form.status,
        planMin: form.planMin,
        tags: form.tags.split('\n').map(t => t.trim()).filter(Boolean),
        order: Number(form.order) || 0,
        payload,
      }
      if (isEdit && editTarget) {
        await adminApi.studio.updatePack(packId(editTarget), body)
        toast.success('Pack updated')
      } else {
        await adminApi.studio.createPack(body)
        toast.success('Pack created')
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
  const ta = `${inp} resize-none font-mono text-xs`

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{isEdit ? 'Edit Pack' : 'New Challenge Pack'}</p>
            <p className="text-xs text-ink-faint">
              {isEdit ? `Editing "${editTarget?.title}"` : 'Create a studio challenge pack'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title *">
              <input className={inp} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. God Class Trap" />
            </Field>
            <Field label="Slug">
              <input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Type *">
              <select className={inp} value={form.type} onChange={e => set('type', e.target.value as ChallengePackType)} disabled={isEdit}>
                <option value="debugger">Debugger</option>
                <option value="refactor">Refactor</option>
                <option value="change_one">Change One</option>
                <option value="evolution">Evolution</option>
                <option value="budget">Budget</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value as FormState['difficulty'])}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Order">
              <input className={inp} type="number" value={form.order} onChange={e => set('order', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value as ChallengePackStatus)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Plan Min">
              <select className={inp} value={form.planMin} onChange={e => set('planMin', e.target.value as FormState['planMin'])}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="ultimate">Ultimate</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea className={`${inp} resize-none`} rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Challenge brief…" />
          </Field>

          <Field label="Tags (one per line)">
            <textarea className={ta} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="solid&#10;coupling" />
          </Field>

          <Field label="Payload (JSON)">
            <textarea className={ta} rows={8} value={form.payloadJson} onChange={e => set('payloadJson', e.target.value)} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isEdit ? 'Save Changes' : 'Create Pack'}
          </button>
        </div>
      </div>
    </>
  )
}

function StudioPacksContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as ChallengePackType | null
  const typeFilter: ChallengePackType | '' =
    typeParam && TYPE_TABS.some(t => t.key === typeParam) ? typeParam : ''

  const [packs, setPacks] = useState<AdminChallengePack[]>([])
  const [loading, setLoading] = useState(true)
  const [draftQ, setDraftQ] = useState('')
  const [q, setQ] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminChallengePack | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminChallengePack | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return packs
    return packs.filter(p =>
      p.title.toLowerCase().includes(needle) ||
      p.slug.toLowerCase().includes(needle) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(needle)),
    )
  }, [packs, q])

  const pageIds = useMemo(() => filtered.map(packId), [filtered])
  const selection = useRowSelection(pageIds)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.studio.listPacks(typeFilter || undefined)
      setPacks(data.packs ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load packs')
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => { load() }, [load])

  function setType(next: ChallengePackType | '') {
    selection.clear()
    const qs = next ? `?type=${next}` : ''
    router.push(`/admin/studio${qs}`)
  }

  async function handlePublishToggle(p: AdminChallengePack) {
    const id = packId(p)
    setToggling(id)
    try {
      if (p.status === 'published') {
        const updated = await adminApi.studio.updatePack(id, { status: 'draft' })
        setPacks(prev => prev.map(x => packId(x) === id ? { ...x, ...updated } : x))
        toast.success('Unpublished')
      } else {
        const updated = await adminApi.studio.publishPack(id)
        setPacks(prev => prev.map(x => packId(x) === id ? { ...x, ...updated } : x))
        toast.success('Published')
      }
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
      await adminApi.studio.deletePack(packId(deleteTarget))
      toast.success('Pack deleted')
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
      const res = await adminApi.studio.bulkDeletePacks(selection.selectedIds)
      toast.success(`Deleted ${res.deleted} pack${res.deleted === 1 ? '' : 's'}`)
      setBulkConfirm(false)
      selection.clear()
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const published = packs.filter(p => p.status === 'published').length
  const drafts = packs.filter(p => p.status === 'draft').length
  const defaultType: ChallengePackType = typeFilter || 'debugger'

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">Studio Challenge Packs</h1>
          <p className="mt-0.5 text-sm text-ink-faint">Manage debugger, refactor, change-one, and evolution packs</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
              <p className="text-lg font-bold text-brand">{packs.length}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Total</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-emerald-600">{published}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">Published</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-center">
              <p className="text-lg font-bold text-ink-faint">{drafts}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Drafts</p>
            </div>
          </div>
          <button
            onClick={() => { setEditTarget(null); setPanelOpen(true) }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 sm:w-auto"
          >
            <Plus className="h-4 w-4" /> New Pack
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-hairline bg-paper-elevated p-1.5">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.key || 'all'}
            type="button"
            onClick={() => setType(tab.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              typeFilter === tab.key
                ? 'bg-brand text-brand-foreground'
                : 'text-ink-muted hover:bg-hairline/60 hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search packs…"
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
          label={selection.count === 1 ? 'pack selected' : 'packs selected'}
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
                      title="Select all"
                    />
                  </th>
                  {['Title', 'Type', 'Difficulty', 'Plan', 'Updated', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-hairline">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map(p => {
                  const id = packId(p)
                  return (
                    <tr
                      key={id}
                      className={cn(
                        'border-b border-hairline transition hover:bg-hairline/30',
                        p.status !== 'published' && 'opacity-70',
                        selection.isSelected(id) && 'bg-brand-tint/40',
                      )}
                    >
                      <td className="px-4 py-3">
                        <SelectCheckbox checked={selection.isSelected(id)} onChange={() => selection.toggle(id)} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{p.title}</p>
                        <p className="font-mono text-[10px] text-ink-faint">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-ink-muted">{p.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', DIFFICULTY_COLORS[p.difficulty])}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-ink-muted">{p.planMin}</td>
                      <td className="px-4 py-3 text-xs text-ink-faint">
                        {p.updatedAt ? format(parseISO(p.updatedAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handlePublishToggle(p)}
                          disabled={toggling === id}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50"
                          title={p.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {p.status === 'published'
                            ? <><ToggleRight size={14} className="text-emerald-500" /> Published</>
                            : <><ToggleLeft size={14} className="text-ink-faint" /> {p.status}</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditTarget(p); setPanelOpen(true) }}
                            className="rounded-md border border-hairline p-1.5 text-ink-muted transition hover:border-brand/30 hover:bg-brand-tint hover:text-brand"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="rounded-md border border-hairline p-1.5 text-ink-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
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
              <FlaskConical className="h-8 w-8 text-ink-faint opacity-40" />
              <p className="text-sm text-ink-faint">No challenge packs found</p>
              <button
                onClick={() => { setEditTarget(null); setPanelOpen(true) }}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Create first pack
              </button>
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <PackPanel
          editTarget={editTarget}
          defaultType={defaultType}
          onClose={() => { setPanelOpen(false); setEditTarget(null) }}
          onSaved={() => { setPanelOpen(false); setEditTarget(null); load() }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete pack?"
        description={
          <>
            Delete <span className="font-semibold text-ink">&ldquo;{deleteTarget?.title}&rdquo;</span>? This cannot be undone.
          </>
        }
        confirmLabel="Delete pack"
        loading={deleting}
        icon={Trash2}
      />

      <ConfirmModal
        open={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selection.count} pack${selection.count === 1 ? '' : 's'}?`}
        description="Permanently delete the selected challenge packs. This cannot be undone."
        confirmLabel={`Delete ${selection.count}`}
        loading={bulkLoading}
        icon={Trash2}
      />
    </div>
  )
}

export default function AdminStudioPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink-faint">Loading…</div>}>
      <StudioPacksContent />
    </Suspense>
  )
}
