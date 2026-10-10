'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Map, Brain, Search, Bug, Gamepad2, Wrench, RefreshCcw, Pencil,
  TrendingUp, DollarSign, ArrowLeft, Plus, Search as SearchIcon,
  Trash2, Save, X, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight,
  BarChart3, CheckCircle2, FileText, Clock, Users, BookOpen,
  ExternalLink, PackageOpen, Activity,
  ChevronsUpDown, ChevronUp, ChevronDown,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  adminApi,
  type AdminChallengePack,
  type ChallengePackType,
  type ChallengePackStatus,
  type AdminQuizQuestion,
  type AdminDetectiveScenario,
  type AdminDebuggerChallenge,
  type AdminRoguelikeScenario,
  type AdminDetectiveStats,
  type AdminDebuggerStats,
  type AdminRoguelikeStats,
  type AdminFeatureActivity,
  type AdminJourneyTopic,
  type AdminJourneyExperience,
  type AdminJourneyTip,
  type AdminPlannrStats,
  type UserActivityRow,
} from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { ConfirmModal }                from '@/components/admin/ConfirmModal'
import { BulkActionBar, SelectCheckbox } from '@/components/admin/BulkActionBar'
import { useRowSelection }             from '@/components/admin/useRowSelection'
import { FEATURES, getFeature, type FeatureConfig } from '../_lib/configs'

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  plannr: Map, 'daily-quiz': Brain, detective: Search, 'debug-lab': Bug,
  roguelike: Gamepad2, 'debug-fix': Wrench, refactor: RefreshCcw,
  'change-one': Pencil, evolution: TrendingUp, budget: DollarSign,
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Sk({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />
}

const DIFF_COLORS = {
  easy:   { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', hex: '#10B981' },
  medium: { pill: 'bg-amber-50   text-amber-700   border-amber-200',   hex: '#F59E0B' },
  hard:   { pill: 'bg-red-50     text-red-700     border-red-200',     hex: '#EF4444' },
}
const STATUS_COLORS = { published: '#10B981', draft: '#94A3B8', archived: '#6B7280' }

function DiffPill({ d }: { d: 'easy' | 'medium' | 'hard' }) {
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize', DIFF_COLORS[d].pill)}>
      {d}
    </span>
  )
}

function StatCard({ label, value, sub, Icon, accent }: {
  label: string; value: string | number; sub?: string; Icon: React.ElementType; accent?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border bg-paper-elevated p-4 ${accent ? 'border-brand/30' : 'border-hairline'}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-brand text-brand-foreground' : 'bg-brand-tint text-brand'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
      </div>
    </div>
  )
}

const inp = 'w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10'
const ta  = `${inp} resize-none`

// ─── Pack slide-over panel (studio features) ──────────────────────────────────

type PackForm = {
  title: string; slug: string; difficulty: 'easy' | 'medium' | 'hard'
  description: string; status: ChallengePackStatus; planMin: 'free' | 'pro' | 'ultimate'
  tags: string; order: string; payloadJson: string
}

function toSlugStr(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)
}

function emptyPackForm(): PackForm {
  return { title: '', slug: '', difficulty: 'medium', description: '', status: 'draft', planMin: 'free', tags: '', order: '0', payloadJson: '{}' }
}
function packToForm(p: AdminChallengePack): PackForm {
  return {
    title: p.title, slug: p.slug, difficulty: p.difficulty, description: p.description ?? '',
    status: p.status, planMin: p.planMin,
    tags: (p.tags ?? []).join('\n'), order: String(p.order ?? 0),
    payloadJson: JSON.stringify(p.payload ?? {}, null, 2),
  }
}

function PackPanel({ target, packType, onClose, onSaved }: {
  target?: AdminChallengePack; packType: ChallengePackType; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!target
  const [form, setForm] = useState<PackForm>(target ? packToForm(target) : emptyPackForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const set = <K extends keyof PackForm>(k: K, v: PackForm[K]) => setForm(p => ({ ...p, [k]: v }))

  function onTitle(v: string) {
    setForm(p => ({ ...p, title: v, slug: isEdit ? p.slug : (p.slug || toSlugStr(v)) }))
  }

  async function save() {
    if (!form.title.trim()) { setErr('Title is required.'); return }
    let payload: Record<string, unknown> = {}
    try { payload = JSON.parse(form.payloadJson || '{}') as Record<string, unknown> }
    catch { setErr('Payload must be valid JSON.'); return }
    setSaving(true); setErr(null)
    try {
      const body = {
        type: packType, title: form.title.trim(),
        slug: form.slug.trim() || toSlugStr(form.title),
        difficulty: form.difficulty, description: form.description,
        status: form.status, planMin: form.planMin,
        tags: form.tags.split('\n').map(t => t.trim()).filter(Boolean),
        order: Number(form.order) || 0, payload,
      }
      if (isEdit && target) { await adminApi.studio.updatePack(String(target._id), body); toast.success('Pack updated') }
      else                  { await adminApi.studio.createPack(body); toast.success('Pack created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong') }
    finally     { setSaving(false) }
  }

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>
      {children}
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{isEdit ? 'Edit Problem' : 'New Problem'}</p>
            <p className="text-xs text-ink-faint">{isEdit ? `Editing "${target?.title}"` : 'Add a challenge to this feature'}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{err}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <F label="Title *"><input className={inp} value={form.title} onChange={e => onTitle(e.target.value)} placeholder="e.g. God Class Trap" /></F>
            <F label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" /></F>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value as PackForm['difficulty'])}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </F>
            <F label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value as ChallengePackStatus)}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
            </F>
            <F label="Plan">
              <select className={inp} value={form.planMin} onChange={e => set('planMin', e.target.value as PackForm['planMin'])}>
                <option value="free">Free</option><option value="pro">Pro</option><option value="ultimate">Ultimate</option>
              </select>
            </F>
          </div>
          <F label="Description">
            <textarea className={ta} rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Challenge brief…" />
          </F>
          <F label="Tags (one per line)">
            <textarea className={`${inp} resize-none font-mono text-xs`} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="solid&#10;coupling" />
          </F>
          <F label="Payload JSON">
            <textarea className={`${inp} resize-none font-mono text-xs`} rows={6} value={form.payloadJson} onChange={e => set('payloadJson', e.target.value)} />
          </F>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isEdit ? 'Save Changes' : 'Create Problem'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Quiz slide-over panel ────────────────────────────────────────────────────

type QuizForm = {
  slug: string; topic: string; difficulty: 'easy' | 'medium' | 'hard'
  prompt: string; choices: string; correctIndex: string; explanation: string
  status: 'draft' | 'published' | 'archived'
}

function emptyQuizForm(): QuizForm {
  return { slug: '', topic: 'SOLID', difficulty: 'medium', prompt: '', choices: '', correctIndex: '0', explanation: '', status: 'draft' }
}
function quizToForm(q: AdminQuizQuestion): QuizForm {
  return {
    slug: q.slug, topic: q.topic, difficulty: q.difficulty, prompt: q.prompt,
    choices: (q.choices ?? []).join('\n'), correctIndex: String(q.correctIndex ?? 0),
    explanation: q.explanation ?? '', status: q.status,
  }
}

function QuizPanel({ target, onClose, onSaved }: {
  target?: AdminQuizQuestion; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!target
  const [form, setForm] = useState<QuizForm>(target ? quizToForm(target) : emptyQuizForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const set = <K extends keyof QuizForm>(k: K, v: QuizForm[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    const choices = form.choices.split('\n').map(c => c.trim()).filter(Boolean)
    if (!form.prompt.trim()) { setErr('Prompt is required.'); return }
    if (choices.length < 2)  { setErr('Provide at least 2 choices (one per line).'); return }
    const correctIndex = Number(form.correctIndex)
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= choices.length) {
      setErr(`Correct index must be 0–${choices.length - 1}.`); return
    }
    setSaving(true); setErr(null)
    try {
      const body = {
        slug: form.slug.trim() || toSlugStr(form.prompt),
        topic: form.topic.trim() || 'SOLID',
        difficulty: form.difficulty, prompt: form.prompt.trim(),
        choices, correctIndex, explanation: form.explanation, status: form.status,
      }
      if (isEdit && target) { await adminApi.learn.updateQuiz(String(target._id), body); toast.success('Question updated') }
      else                  { await adminApi.learn.createQuiz(body); toast.success('Question created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong') }
    finally     { setSaving(false) }
  }

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>
      {children}
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div>
            <p className="font-semibold text-ink">{isEdit ? 'Edit Question' : 'New Quiz Question'}</p>
            <p className="text-xs text-ink-faint">{isEdit ? 'Update this question' : 'Add a question to the Daily Quiz bank'}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{err}
            </div>
          )}
          <F label="Prompt *">
            <textarea className={ta} rows={4} value={form.prompt} onChange={e => set('prompt', e.target.value)} placeholder="Which principle is violated when…" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto from prompt" /></F>
            <F label="Topic"><input className={inp} value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="SOLID" /></F>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value as QuizForm['difficulty'])}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </F>
            <F label="Correct idx">
              <input className={inp} type="number" min={0} value={form.correctIndex} onChange={e => set('correctIndex', e.target.value)} />
            </F>
            <F label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value as QuizForm['status'])}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
            </F>
          </div>
          <F label="Choices (one per line) *">
            <textarea className={ta} rows={5} value={form.choices} onChange={e => set('choices', e.target.value)} placeholder={"Option A\nOption B\nOption C\nOption D"} />
          </F>
          <F label="Explanation">
            <textarea className={ta} rows={3} value={form.explanation} onChange={e => set('explanation', e.target.value)} placeholder="Why the correct answer is right…" />
          </F>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isEdit ? 'Save Changes' : 'Create Question'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Pack CRUD table (studio features) ────────────────────────────────────────

function PackTable({ feature }: { feature: FeatureConfig }) {
  const packType = feature.packType!

  const [packs, setPacks]       = useState<AdminChallengePack[]>([])
  const [loading, setLoading]   = useState(true)
  const [draftQ, setDraftQ]     = useState('')
  const [q, setQ]               = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminChallengePack | undefined>()
  const [delTarget, setDelTarget]   = useState<AdminChallengePack | undefined>()
  const [deleting, setDeleting]     = useState(false)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling]     = useState<string | null>(null)

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return n ? packs.filter(p => p.title.toLowerCase().includes(n) || p.slug.toLowerCase().includes(n)) : packs
  }, [packs, q])

  const pageIds  = useMemo(() => filtered.map(p => String(p._id)), [filtered])
  const sel      = useRowSelection(pageIds)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.studio.listPacks(packType)
      setPacks(data.packs ?? [])
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setLoading(false) }
  }, [packType])

  useEffect(() => { load() }, [load])

  async function togglePublish(p: AdminChallengePack) {
    const id = String(p._id); setToggling(id)
    try {
      if (p.status === 'published') {
        const updated = await adminApi.studio.updatePack(id, { status: 'draft' })
        setPacks(prev => prev.map(x => String(x._id) === id ? { ...x, ...updated } : x))
        toast.success('Unpublished')
      } else {
        const updated = await adminApi.studio.publishPack(id)
        setPacks(prev => prev.map(x => String(x._id) === id ? { ...x, ...updated } : x))
        toast.success('Published')
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setToggling(null) }
  }

  async function handleDelete() {
    if (!delTarget) return
    setDeleting(true)
    try {
      await adminApi.studio.deletePack(String(delTarget._id))
      toast.success('Deleted'); setDelTarget(undefined); sel.clear(); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setDeleting(false) }
  }

  async function handleBulkDelete() {
    setBulkLoading(true)
    try {
      const res = await adminApi.studio.bulkDeletePacks(sel.selectedIds)
      toast.success(`Deleted ${res.deleted}`); setBulkOpen(false); sel.clear(); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setBulkLoading(false) }
  }

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input placeholder="Search problems…" value={draftQ} onChange={e => setDraftQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQ(draftQ)}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
        </div>
        <button onClick={() => setQ(draftQ)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
          Search
        </button>
        <button onClick={() => { setEditTarget(undefined); setPanelOpen(true) }}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New Problem
        </button>
      </div>

      <BulkActionBar count={sel.count} onClear={sel.clear} onDelete={() => setBulkOpen(true)} loading={bulkLoading}
        label={sel.count === 1 ? 'problem selected' : 'problems selected'} />

      {/* table */}
      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/40">
                <th className="w-10 px-4 py-3">
                  <SelectCheckbox checked={sel.allPageSelected} indeterminate={sel.somePageSelected}
                    onChange={sel.togglePage} disabled={loading || filtered.length === 0} />
                </th>
                {['Title', 'Difficulty', 'Plan', 'Updated', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-hairline">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Sk className="h-4" /></td>
                      ))}
                    </tr>
                  ))
                : filtered.map(p => {
                    const id = String(p._id)
                    return (
                      <tr key={id} className={cn('border-b border-hairline transition hover:bg-hairline/30',
                        p.status !== 'published' && 'opacity-70', sel.isSelected(id) && 'bg-brand-tint/40')}>
                        <td className="px-4 py-3"><SelectCheckbox checked={sel.isSelected(id)} onChange={() => sel.toggle(id)} /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink">{p.title}</p>
                          <p className="font-mono text-[10px] text-ink-faint">{p.slug}</p>
                        </td>
                        <td className="px-4 py-3"><DiffPill d={p.difficulty} /></td>
                        <td className="px-4 py-3 text-xs capitalize text-ink-muted">{p.planMin}</td>
                        <td className="px-4 py-3 text-xs text-ink-faint">
                          {p.updatedAt ? format(parseISO(p.updatedAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => togglePublish(p)} disabled={toggling === id}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50">
                            {p.status === 'published'
                              ? <><ToggleRight size={14} className="text-emerald-500" /> Published</>
                              : <><ToggleLeft  size={14} className="text-ink-faint"   /> {p.status}</>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditTarget(p); setPanelOpen(true) }}
                              className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-brand/30 hover:bg-brand-tint hover:text-brand">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDelTarget(p)}
                              className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600">
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
            <PackageOpen className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No problems yet</p>
            <button onClick={() => { setEditTarget(undefined); setPanelOpen(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add first problem
            </button>
          </div>
        )}
      </div>

      {panelOpen && (
        <PackPanel target={editTarget} packType={packType} onClose={() => { setPanelOpen(false); setEditTarget(undefined) }}
          onSaved={() => { setPanelOpen(false); setEditTarget(undefined); load() }} />
      )}
      <ConfirmModal open={!!delTarget} onClose={() => { if (!deleting) setDelTarget(undefined) }} onConfirm={handleDelete}
        title="Delete problem?" loading={deleting} icon={Trash2}
        description={<>Delete <span className="font-semibold text-ink">&ldquo;{delTarget?.title}&rdquo;</span>? Cannot be undone.</>}
        confirmLabel="Delete" />
      <ConfirmModal open={bulkOpen} onClose={() => setBulkOpen(false)} onConfirm={handleBulkDelete}
        title={`Delete ${sel.count} problem${sel.count === 1 ? '' : 's'}?`}
        description="Permanently delete selected problems. Cannot be undone."
        confirmLabel={`Delete ${sel.count}`} loading={bulkLoading} icon={Trash2} />
    </div>
  )
}

// ─── Quiz CRUD table ──────────────────────────────────────────────────────────

function QuizTable() {
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>([])
  const [loading, setLoading]     = useState(true)
  const [draftQ, setDraftQ]       = useState('')
  const [q, setQ]                 = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminQuizQuestion | undefined>()
  const [delTarget, setDelTarget]   = useState<AdminQuizQuestion | undefined>()
  const [deleting, setDeleting]     = useState(false)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling]     = useState<string | null>(null)

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return n ? questions.filter(x => x.prompt.toLowerCase().includes(n) || x.topic.toLowerCase().includes(n)) : questions
  }, [questions, q])

  const pageIds = useMemo(() => filtered.map(x => String(x._id)), [filtered])
  const sel     = useRowSelection(pageIds)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.learn.listQuiz()
      setQuestions(data.questions ?? [])
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function togglePublish(item: AdminQuizQuestion) {
    const id = String(item._id); setToggling(id)
    try {
      const nextStatus = item.status === 'published' ? 'draft' : 'published'
      const updated = await adminApi.learn.updateQuiz(id, { status: nextStatus })
      setQuestions(prev => prev.map(x => String(x._id) === id ? { ...x, ...updated } : x))
      toast.success(nextStatus === 'published' ? 'Published' : 'Unpublished')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setToggling(null) }
  }

  async function handleDelete() {
    if (!delTarget) return
    setDeleting(true)
    try {
      await adminApi.learn.deleteQuiz(String(delTarget._id))
      toast.success('Deleted'); setDelTarget(undefined); sel.clear(); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setDeleting(false) }
  }

  async function handleBulkDelete() {
    setBulkLoading(true)
    try {
      await Promise.all(sel.selectedIds.map(id => adminApi.learn.deleteQuiz(id)))
      toast.success(`Deleted ${sel.count}`); setBulkOpen(false); sel.clear(); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally     { setBulkLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input placeholder="Search questions…" value={draftQ} onChange={e => setDraftQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQ(draftQ)}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
        </div>
        <button onClick={() => setQ(draftQ)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">Search</button>
        <button onClick={() => { setEditTarget(undefined); setPanelOpen(true) }}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New Question
        </button>
      </div>

      <BulkActionBar count={sel.count} onClear={sel.clear} onDelete={() => setBulkOpen(true)} loading={bulkLoading}
        label={sel.count === 1 ? 'question selected' : 'questions selected'} />

      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/40">
                <th className="w-10 px-4 py-3">
                  <SelectCheckbox checked={sel.allPageSelected} indeterminate={sel.somePageSelected}
                    onChange={sel.togglePage} disabled={loading || filtered.length === 0} />
                </th>
                {['Prompt', 'Topic', 'Difficulty', 'Updated', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-hairline">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Sk className="h-4" /></td>)}
                    </tr>
                  ))
                : filtered.map(item => {
                    const id = String(item._id)
                    return (
                      <tr key={id} className={cn('border-b border-hairline transition hover:bg-hairline/30',
                        item.status !== 'published' && 'opacity-70', sel.isSelected(id) && 'bg-brand-tint/40')}>
                        <td className="px-4 py-3"><SelectCheckbox checked={sel.isSelected(id)} onChange={() => sel.toggle(id)} /></td>
                        <td className="px-4 py-3">
                          <p className="line-clamp-2 font-medium text-ink">{item.prompt}</p>
                          <p className="font-mono text-[10px] text-ink-faint">{item.slug}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted">{item.topic}</td>
                        <td className="px-4 py-3"><DiffPill d={item.difficulty} /></td>
                        <td className="px-4 py-3 text-xs text-ink-faint">
                          {item.updatedAt ? format(parseISO(item.updatedAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => togglePublish(item)} disabled={toggling === id}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50">
                            {item.status === 'published'
                              ? <><ToggleRight size={14} className="text-emerald-500" /> Published</>
                              : <><ToggleLeft  size={14} className="text-ink-faint"   /> {item.status}</>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditTarget(item); setPanelOpen(true) }}
                              className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-brand/30 hover:bg-brand-tint hover:text-brand">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDelTarget(item)}
                              className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600">
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
            <BookOpen className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No questions yet</p>
            <button onClick={() => { setEditTarget(undefined); setPanelOpen(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add first question
            </button>
          </div>
        )}
      </div>

      {panelOpen && (
        <QuizPanel target={editTarget} onClose={() => { setPanelOpen(false); setEditTarget(undefined) }}
          onSaved={() => { setPanelOpen(false); setEditTarget(undefined); load() }} />
      )}
      <ConfirmModal open={!!delTarget} onClose={() => { if (!deleting) setDelTarget(undefined) }} onConfirm={handleDelete}
        title="Delete question?" loading={deleting} icon={Trash2}
        description={<>Delete this question? Cannot be undone.</>} confirmLabel="Delete" />
      <ConfirmModal open={bulkOpen} onClose={() => setBulkOpen(false)} onConfirm={handleBulkDelete}
        title={`Delete ${sel.count} question${sel.count === 1 ? '' : 's'}?`}
        description="Permanently delete selected questions." confirmLabel={`Delete ${sel.count}`} loading={bulkLoading} icon={Trash2} />
    </div>
  )
}

// ─── Generic simple CRUD table (detective / debugger / roguelike) ─────────────

type SimpleItem = { _id: string; slug: string; title: string; difficulty: string; status: string; updatedAt?: string }

function SimpleTable<T extends SimpleItem>({
  load, items, loading,
  panelOpen, setPanelOpen, editTarget, setEditTarget,
  delTarget, setDelTarget, deleting, bulkOpen, setBulkOpen, bulkLoading,
  sel, filtered, onTogglePublish, toggling,
  onDelete, onBulkDelete,
  colLabel, emptyIcon: EmptyIcon,
  renderPanel,
}: {
  load: () => void
  items: T[]; loading: boolean; filtered: T[]
  panelOpen: boolean; setPanelOpen: (v: boolean) => void
  editTarget: T | undefined; setEditTarget: (v: T | undefined) => void
  delTarget: T | undefined; setDelTarget: (v: T | undefined) => void
  deleting: boolean; bulkOpen: boolean; setBulkOpen: (v: boolean) => void; bulkLoading: boolean
  sel: ReturnType<typeof useRowSelection>
  onTogglePublish: (item: T) => void; toggling: string | null
  onDelete: () => void; onBulkDelete: () => void
  colLabel: string; emptyIcon: React.ElementType
  renderPanel: () => React.ReactNode
}) {
  const [draftQ, setDraftQ] = useState('')
  const [q, setQ]           = useState('')

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase()
    return n ? filtered.filter(i => i.title.toLowerCase().includes(n) || i.slug.toLowerCase().includes(n)) : filtered
  }, [filtered, q])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input placeholder={`Search ${colLabel}…`} value={draftQ} onChange={e => setDraftQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQ(draftQ)}
            className="w-full rounded-lg border border-hairline bg-paper-elevated py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
        </div>
        <button onClick={() => setQ(draftQ)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">Search</button>
        <button onClick={() => { setEditTarget(undefined); setPanelOpen(true) }}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New {colLabel.replace(/s$/, '')}
        </button>
      </div>

      <BulkActionBar count={sel.count} onClear={sel.clear} onDelete={() => setBulkOpen(true)} loading={bulkLoading}
        label={sel.count === 1 ? `${colLabel.replace(/s$/, '')} selected` : `${colLabel} selected`} />

      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/40">
                <th className="w-10 px-4 py-3">
                  <SelectCheckbox checked={sel.allPageSelected} indeterminate={sel.somePageSelected}
                    onChange={sel.togglePage} disabled={loading || shown.length === 0} />
                </th>
                {['Title', 'Difficulty', 'Updated', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-hairline">
                      {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Sk className="h-4" /></td>)}
                    </tr>
                  ))
                : shown.map(item => {
                    const id = String(item._id)
                    return (
                      <tr key={id} className={cn('border-b border-hairline transition hover:bg-hairline/30',
                        item.status !== 'published' && 'opacity-70', sel.isSelected(id) && 'bg-brand-tint/40')}>
                        <td className="px-4 py-3"><SelectCheckbox checked={sel.isSelected(id)} onChange={() => sel.toggle(id)} /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink">{item.title}</p>
                          <p className="font-mono text-[10px] text-ink-faint">{item.slug}</p>
                        </td>
                        <td className="px-4 py-3">{item.difficulty ? <DiffPill d={item.difficulty as 'easy' | 'medium' | 'hard'} /> : <span className="text-xs text-ink-faint">—</span>}</td>
                        <td className="px-4 py-3 text-xs text-ink-faint">
                          {item.updatedAt ? format(parseISO(item.updatedAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => onTogglePublish(item)} disabled={toggling === id}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50">
                            {item.status === 'published'
                              ? <><ToggleRight size={14} className="text-emerald-500" /> Published</>
                              : <><ToggleLeft  size={14} className="text-ink-faint"   /> {item.status}</>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditTarget(item); setPanelOpen(true) }}
                              className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-brand/30 hover:bg-brand-tint hover:text-brand">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDelTarget(item)}
                              className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600">
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
        {!loading && shown.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <EmptyIcon className="h-8 w-8 text-ink-faint opacity-40" />
            <p className="text-sm text-ink-faint">No {colLabel} yet</p>
            <button onClick={() => { setEditTarget(undefined); setPanelOpen(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add first
            </button>
          </div>
        )}
      </div>

      {panelOpen && renderPanel()}
      <ConfirmModal open={!!delTarget} onClose={() => { if (!deleting) setDelTarget(undefined) }} onConfirm={onDelete}
        title="Delete?" loading={deleting} icon={Trash2}
        description={<>Delete <span className="font-semibold">&ldquo;{delTarget?.title}&rdquo;</span>? Cannot be undone.</>}
        confirmLabel="Delete" />
      <ConfirmModal open={bulkOpen} onClose={() => setBulkOpen(false)} onConfirm={onBulkDelete}
        title={`Delete ${sel.count}?`} description="Permanently delete selected items."
        confirmLabel={`Delete ${sel.count}`} loading={bulkLoading} icon={Trash2} />
    </div>
  )
}

// ─── Detective CRUD table ─────────────────────────────────────────────────────

function DetectivePanel({ target, onClose, onSaved }: {
  target?: AdminDetectiveScenario; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!target
  type F = { slug: string; title: string; mode: string; difficulty: 'easy'|'medium'|'hard'; stem: string; answer: string; choices: string; explanation: string; status: string; order: string }
  const [form, setForm] = useState<F>({
    slug: target?.slug ?? '', title: target?.title ?? '', mode: target?.mode ?? 'identify',
    difficulty: target?.difficulty ?? 'medium', stem: target?.stem ?? '', answer: target?.answer ?? '',
    choices: (target?.choices ?? []).join('\n'), explanation: target?.explanation ?? '',
    status: target?.status ?? 'draft', order: String(target?.order ?? 0),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState<string | null>(null)
  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) { setErr('Title required.'); return }
    setSaving(true); setErr(null)
    try {
      const body = { ...form, choices: form.choices.split('\n').map(s => s.trim()).filter(Boolean), order: Number(form.order) || 0, slug: form.slug || toSlugStr(form.title) } as import('@/lib/admin-api').AdminDetectiveScenario
      if (isEdit && target) { await adminApi.learn.updateDetective(String(target._id), body); toast.success('Updated') }
      else                  { await adminApi.learn.createDetective(body); toast.success('Created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally     { setSaving(false) }
  }
  const F_ = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>{children}</div>
  )
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="font-semibold text-ink">{isEdit ? 'Edit Scenario' : 'New Detective Scenario'}</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Title *"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></F_>
            <F_ label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto" /></F_>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F_ label="Mode">
              <select className={inp} value={form.mode} onChange={e => set('mode', e.target.value)}>
                <option value="identify">Identify</option><option value="detect">Detect</option>
                <option value="explain">Explain</option><option value="suggest">Suggest</option><option value="compare">Compare</option>
              </select>
            </F_>
            <F_ label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value as F['difficulty'])}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </F_>
            <F_ label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
            </F_>
          </div>
          <F_ label="Stem (problem description) *"><textarea className={ta} rows={5} value={form.stem} onChange={e => set('stem', e.target.value)} placeholder="Describe the system or code snippet…" /></F_>
          <F_ label="Answer (pattern key)"><input className={inp} value={form.answer} onChange={e => set('answer', e.target.value)} placeholder="e.g. singleton, observer" /></F_>
          <F_ label="Choices (one per line)"><textarea className={ta} rows={4} value={form.choices} onChange={e => set('choices', e.target.value)} placeholder={"Option A\nOption B\nOption C"} /></F_>
          <F_ label="Explanation"><textarea className={ta} rows={3} value={form.explanation} onChange={e => set('explanation', e.target.value)} /></F_>
        </div>
        <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </>
  )
}

function DetectiveTable() {
  const [items, setItems]         = useState<AdminDetectiveScenario[]>([])
  const [loading, setLoading]     = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminDetectiveScenario | undefined>()
  const [delTarget, setDelTarget]   = useState<AdminDetectiveScenario | undefined>()
  const [deleting, setDeleting]     = useState(false)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling]     = useState<string | null>(null)
  const ids = useMemo(() => items.map(i => String(i._id)), [items])
  const sel = useRowSelection(ids)

  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await adminApi.learn.listDetective(); setItems(d.scenarios ?? []) }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function onTogglePublish(item: AdminDetectiveScenario) {
    setToggling(String(item._id))
    try {
      const r = await adminApi.learn.publishDetective(String(item._id))
      setItems(prev => prev.map(x => String(x._id) === String(item._id) ? { ...x, status: r.status as 'draft' | 'published' | 'archived' } : x))
      toast.success(r.status === 'published' ? 'Published' : 'Unpublished')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setToggling(null) }
  }

  async function onDelete() {
    if (!delTarget) return; setDeleting(true)
    try { await adminApi.learn.deleteDetective(String(delTarget._id)); toast.success('Deleted'); setDelTarget(undefined); sel.clear(); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setDeleting(false) }
  }

  async function onBulkDelete() {
    setBulkLoading(true)
    try { await adminApi.learn.bulkDeleteDetective(sel.selectedIds); toast.success(`Deleted ${sel.count}`); setBulkOpen(false); sel.clear(); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setBulkLoading(false) }
  }

  return <SimpleTable load={load} items={items} loading={loading} filtered={items} panelOpen={panelOpen} setPanelOpen={setPanelOpen} editTarget={editTarget} setEditTarget={setEditTarget} delTarget={delTarget} setDelTarget={setDelTarget} deleting={deleting} bulkOpen={bulkOpen} setBulkOpen={setBulkOpen} bulkLoading={bulkLoading} sel={sel} onTogglePublish={onTogglePublish} toggling={toggling} onDelete={onDelete} onBulkDelete={onBulkDelete} colLabel="scenarios" emptyIcon={Search}
    renderPanel={() => <DetectivePanel target={editTarget} onClose={() => { setPanelOpen(false); setEditTarget(undefined) }} onSaved={() => { setPanelOpen(false); setEditTarget(undefined); load() }} />} />
}

// ─── Debugger CRUD table ──────────────────────────────────────────────────────

function DebuggerPanel({ target, onClose, onSaved }: {
  target?: AdminDebuggerChallenge; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!target
  type F = { slug: string; title: string; description: string; difficulty: 'easy'|'medium'|'hard'; bugType: string; tags: string; status: string; order: string }
  const [form, setForm] = useState<F>({
    slug: target?.slug ?? '', title: target?.title ?? '', description: target?.description ?? '',
    difficulty: target?.difficulty ?? 'medium', bugType: target?.bugType ?? 'logic',
    tags: (target?.tags ?? []).join('\n'), status: target?.status ?? 'draft', order: String(target?.order ?? 0),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState<string | null>(null)
  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) { setErr('Title required.'); return }
    setSaving(true); setErr(null)
    try {
      const body = { ...form, tags: form.tags.split('\n').map(s => s.trim()).filter(Boolean), order: Number(form.order) || 0, slug: form.slug || toSlugStr(form.title) } as import('@/lib/admin-api').AdminDebuggerChallenge
      if (isEdit && target) { await adminApi.learn.updateDebugger(String(target._id), body); toast.success('Updated') }
      else                  { await adminApi.learn.createDebugger(body); toast.success('Created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally     { setSaving(false) }
  }
  const F_ = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>{children}</div>
  )
  const BUG_TYPES = ['logic','off-by-one','null-check','wrong-algorithm','edge-case','type-error','infinite-loop','boundary','operator','missing-return']
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="font-semibold text-ink">{isEdit ? 'Edit Challenge' : 'New Debug Challenge'}</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Title *"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></F_>
            <F_ label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto" /></F_>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F_ label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value as F['difficulty'])}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </F_>
            <F_ label="Bug type">
              <select className={inp} value={form.bugType} onChange={e => set('bugType', e.target.value)}>
                {BUG_TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
              </select>
            </F_>
            <F_ label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </F_>
          </div>
          <F_ label="Description"><textarea className={ta} rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the bug and context…" /></F_>
          <F_ label="Tags (one per line)"><textarea className={`${inp} resize-none font-mono text-xs`} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder={"java\nnull-check"} /></F_>
        </div>
        <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </>
  )
}

function DebuggerTable() {
  const [items, setItems]         = useState<AdminDebuggerChallenge[]>([])
  const [loading, setLoading]     = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminDebuggerChallenge | undefined>()
  const [delTarget, setDelTarget]   = useState<AdminDebuggerChallenge | undefined>()
  const [deleting, setDeleting]     = useState(false)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling]     = useState<string | null>(null)
  const ids = useMemo(() => items.map(i => String(i._id)), [items])
  const sel = useRowSelection(ids)

  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await adminApi.learn.listDebugger(); setItems(d.challenges ?? []) }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function onTogglePublish(item: AdminDebuggerChallenge) {
    setToggling(String(item._id))
    try {
      const r = await adminApi.learn.publishDebugger(String(item._id))
      setItems(prev => prev.map(x => String(x._id) === String(item._id) ? { ...x, status: r.status as 'draft' | 'published' } : x))
      toast.success(r.status === 'published' ? 'Published' : 'Unpublished')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setToggling(null) }
  }

  async function onDelete() {
    if (!delTarget) return; setDeleting(true)
    try { await adminApi.learn.deleteDebugger(String(delTarget._id)); toast.success('Deleted'); setDelTarget(undefined); sel.clear(); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setDeleting(false) }
  }

  async function onBulkDelete() {
    setBulkLoading(true)
    try { await adminApi.learn.bulkDeleteDebugger(sel.selectedIds); toast.success(`Deleted ${sel.count}`); setBulkOpen(false); sel.clear(); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setBulkLoading(false) }
  }

  return <SimpleTable load={load} items={items} loading={loading} filtered={items} panelOpen={panelOpen} setPanelOpen={setPanelOpen} editTarget={editTarget} setEditTarget={setEditTarget} delTarget={delTarget} setDelTarget={setDelTarget} deleting={deleting} bulkOpen={bulkOpen} setBulkOpen={setBulkOpen} bulkLoading={bulkLoading} sel={sel} onTogglePublish={onTogglePublish} toggling={toggling} onDelete={onDelete} onBulkDelete={onBulkDelete} colLabel="challenges" emptyIcon={Bug}
    renderPanel={() => <DebuggerPanel target={editTarget} onClose={() => { setPanelOpen(false); setEditTarget(undefined) }} onSaved={() => { setPanelOpen(false); setEditTarget(undefined); load() }} />} />
}

// ─── Roguelike CRUD table ─────────────────────────────────────────────────────

function RoguelikePanel({ target, onClose, onSaved }: {
  target?: AdminRoguelikeScenario; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!target
  type F = { slug: string; title: string; icon: string; description: string; systemContext: string; difficulty: string; tags: string; estimatedMinutes: string; status: string; order: string }
  const [form, setForm] = useState<F>({
    slug: target?.slug ?? '', title: target?.title ?? '', icon: target?.icon ?? '🏗️',
    description: target?.description ?? '', systemContext: '', difficulty: target?.difficulty ?? 'medium',
    tags: (target?.tags ?? []).join('\n'), estimatedMinutes: String(target?.estimatedMinutes ?? 30),
    status: target?.status ?? 'draft', order: String(target?.order ?? 0),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState<string | null>(null)
  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) { setErr('Title required.'); return }
    setSaving(true); setErr(null)
    try {
      const body = { ...form, tags: form.tags.split('\n').map(s => s.trim()).filter(Boolean), order: Number(form.order) || 0, estimatedMinutes: Number(form.estimatedMinutes) || 30, slug: form.slug || toSlugStr(form.title) } as import('@/lib/admin-api').AdminRoguelikeScenario
      if (isEdit && target) { await adminApi.learn.updateRoguelikeScenario(String(target._id), body); toast.success('Updated') }
      else                  { await adminApi.learn.createRoguelikeScenario(body); toast.success('Created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally     { setSaving(false) }
  }
  const F_ = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>{children}</div>
  )
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="font-semibold text-ink">{isEdit ? 'Edit Scenario' : 'New Roguelike Scenario'}</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Title *"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></F_>
            <F_ label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto" /></F_>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F_ label="Icon (emoji)"><input className={inp} value={form.icon} onChange={e => set('icon', e.target.value)} /></F_>
            <F_ label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="hardcore">Hardcore</option>
              </select>
            </F_>
            <F_ label="Est. minutes"><input className={inp} type="number" value={form.estimatedMinutes} onChange={e => set('estimatedMinutes', e.target.value)} /></F_>
          </div>
          <F_ label="Status">
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </F_>
          <F_ label="Description"><textarea className={ta} rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this scenario about?" /></F_>
          <F_ label="System context (initial setup)"><textarea className={ta} rows={3} value={form.systemContext} onChange={e => set('systemContext', e.target.value)} placeholder="The team is building a…" /></F_>
          <F_ label="Tags (one per line)"><textarea className={`${inp} resize-none font-mono text-xs`} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} /></F_>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            💡 Stage definitions (events, decisions, health deltas) are managed via the backend CMS or seeding scripts. Use this form to create the scenario shell and metadata.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </>
  )
}

function RoguelikeTable() {
  const [items, setItems]         = useState<AdminRoguelikeScenario[]>([])
  const [loading, setLoading]     = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminRoguelikeScenario | undefined>()
  const [delTarget, setDelTarget]   = useState<AdminRoguelikeScenario | undefined>()
  const [deleting, setDeleting]     = useState(false)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toggling, setToggling]     = useState<string | null>(null)
  const ids = useMemo(() => items.map(i => String(i._id)), [items])
  const sel = useRowSelection(ids)

  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await adminApi.learn.listRoguelikeScenarios(); setItems(d.scenarios ?? []) }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function onTogglePublish(item: AdminRoguelikeScenario) {
    setToggling(String(item._id))
    try {
      const r = await adminApi.learn.publishRoguelikeScenario(String(item._id))
      setItems(prev => prev.map(x => String(x._id) === String(item._id) ? { ...x, status: r.status as 'draft' | 'published' } : x))
      toast.success(r.status === 'published' ? 'Published' : 'Unpublished')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setToggling(null) }
  }

  async function onDelete() {
    if (!delTarget) return; setDeleting(true)
    try { await adminApi.learn.deleteRoguelikeScenario(String(delTarget._id)); toast.success('Deleted'); setDelTarget(undefined); sel.clear(); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setDeleting(false) }
  }

  async function onBulkDelete() {
    setBulkLoading(true)
    try { await adminApi.learn.bulkDeleteRoguelikeScenarios(sel.selectedIds); toast.success(`Deleted ${sel.count}`); setBulkOpen(false); sel.clear(); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setBulkLoading(false) }
  }

  return <SimpleTable load={load} items={items} loading={loading} filtered={items} panelOpen={panelOpen} setPanelOpen={setPanelOpen} editTarget={editTarget} setEditTarget={setEditTarget} delTarget={delTarget} setDelTarget={setDelTarget} deleting={deleting} bulkOpen={bulkOpen} setBulkOpen={setBulkOpen} bulkLoading={bulkLoading} sel={sel} onTogglePublish={onTogglePublish} toggling={toggling} onDelete={onDelete} onBulkDelete={onBulkDelete} colLabel="scenarios" emptyIcon={Gamepad2}
    renderPanel={() => <RoguelikePanel target={editTarget} onClose={() => { setPanelOpen(false); setEditTarget(undefined) }} onSaved={() => { setPanelOpen(false); setEditTarget(undefined); load() }} />} />
}

// ─── User activity section ────────────────────────────────────────────────────

function UserActivitySection({ data, loading, accentHex }: { data: AdminFeatureActivity | null; loading: boolean; accentHex: string }) {
  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Sk key={i} className="h-20 rounded-xl" />)}
        </div>
        <Sk className="h-48 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Sk className="h-56 rounded-2xl" />
          <Sk className="h-56 rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Error / unavailable ───────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-hairline-strong bg-hairline/20 px-6 py-10 text-center">
        <Users className="mx-auto mb-3 h-7 w-7 text-ink-faint opacity-30" />
        <p className="text-sm font-medium text-ink-faint">User activity data unavailable</p>
        <p className="mt-1 text-xs text-ink-faint opacity-60">Could not load activity from the backend</p>
      </div>
    )
  }

  const chartData = data.dailyActivity.map(d => ({ date: d.date.slice(5), count: d.count }))

  return (
    <div className="space-y-4">
      {/* ── Summary stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([ ['Active today', data.activeToday], ['Active this week', data.activeThisWeek], ['Active (30d)', data.activeThisPeriod], ['Total actions', data.totalActions] ] as [string, number][]).map(([label, val]) => (
          <div key={label} className="rounded-xl border border-hairline bg-paper-elevated p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{val}</p>
          </div>
        ))}
      </div>

      {/* ── Daily activity chart — always shown ────────────────────────────── */}
      <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">User actions — last 30 days</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="count" fill={accentHex} radius={[3, 3, 0, 0]} name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-ink-faint">No activity in the last 30 days</div>
        )}
      </div>

      {/* ── Tables — always shown ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Most active users */}
        <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
          <div className="border-b border-hairline bg-hairline/30 px-5 py-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Most active users</p>
            {data.topUsers.length > 0 && <span className="font-mono text-[10px] text-ink-faint">{data.topUsers.length} users</span>}
          </div>
          {data.topUsers.length > 0 ? (
            <div className="divide-y divide-hairline">
              {data.topUsers.slice(0, 8).map((u, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{u.userName}</p>
                    <p className="truncate text-xs text-ink-faint">{u.userEmail}</p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-hairline px-2 py-0.5 font-mono text-xs font-bold text-ink">{u.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
              <Users className="mb-2 h-5 w-5 text-ink-faint opacity-30" />
              <p className="text-sm text-ink-faint">No users yet</p>
              <p className="mt-0.5 text-xs text-ink-faint opacity-60">Activity will appear here once users interact with this feature</p>
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
          <div className="border-b border-hairline bg-hairline/30 px-5 py-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Recent activity</p>
            {data.recentActivity.length > 0 && <span className="font-mono text-[10px] text-ink-faint">Latest {Math.min(data.recentActivity.length, 20)}</span>}
          </div>
          {data.recentActivity.length > 0 ? (
            <div className="divide-y divide-hairline max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {data.recentActivity.slice(0, 20).map((a, i) => (
                <div key={i} className="flex items-start justify-between px-5 py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{a.userName}</p>
                    <p className="text-xs text-ink-faint capitalize">{a.action}</p>
                  </div>
                  <p className="shrink-0 font-mono text-[10px] text-ink-faint whitespace-nowrap">
                    {format(parseISO(a.timestamp), 'MMM d, HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
              <Activity className="mb-2 h-5 w-5 text-ink-faint opacity-30" />
              <p className="text-sm text-ink-faint">No recent activity</p>
              <p className="mt-0.5 text-xs text-ink-faint opacity-60">Actions will stream in as users use this feature</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Analytics section ────────────────────────────────────────────────────────

interface PackLike { difficulty: 'easy' | 'medium' | 'hard'; status: string; updatedAt?: string; title?: string; prompt?: string; slug?: string }

function AnalyticsSection({ feature }: { feature: FeatureConfig }) {
  const [items, setItems]   = useState<PackLike[]>([])
  const [learnStats, setLearnStats]     = useState<AdminDetectiveStats | AdminDebuggerStats | AdminRoguelikeStats | null>(null)
  const [plannrStats, setPlannrStats]   = useState<AdminPlannrStats | null>(null)
  const [activityData, setActivityData] = useState<AdminFeatureActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (feature.type === 'studio' && feature.packType) {
          const data = await adminApi.studio.listPacks(feature.packType)
          setItems(data.packs ?? [])
        } else if (feature.type === 'quiz') {
          const data = await adminApi.learn.listQuiz()
          setItems(data.questions ?? [])
        } else if (feature.type === 'detective') {
          const stats = await adminApi.learn.detectiveStats(30)
          setLearnStats(stats)
        } else if (feature.type === 'debug-lab') {
          const stats = await adminApi.learn.debuggerStats(30)
          setLearnStats(stats)
        } else if (feature.type === 'roguelike') {
          const stats = await adminApi.learn.roguelikeStats(30)
          setLearnStats(stats)
        } else if (feature.type === 'plannr') {
          const stats = await adminApi.plannr.stats(30)
          setPlannrStats(stats)
        } else {
          setItems([])
        }
      } catch { setItems([]); setLearnStats(null); setPlannrStats(null) }
      finally   { setLoading(false) }
    }
    async function loadActivity() {
      setActivityLoading(true)
      try {
        const data = await adminApi.featureActivity(feature.slug, 30)
        setActivityData(data)
      } catch { setActivityData(null) }
      finally   { setActivityLoading(false) }
    }
    load()
    loadActivity()
  }, [feature])

  // ── Derived values for item-based features (studio / quiz) ──────────────────
  const total     = items.length
  const published = items.filter(i => i.status === 'published').length
  const drafts    = items.filter(i => i.status === 'draft').length
  const hard      = items.filter(i => i.difficulty === 'hard').length
  const diffData  = [
    { name: 'Easy',   count: items.filter(i => i.difficulty === 'easy').length,   fill: DIFF_COLORS.easy.hex },
    { name: 'Medium', count: items.filter(i => i.difficulty === 'medium').length, fill: DIFF_COLORS.medium.hex },
    { name: 'Hard',   count: items.filter(i => i.difficulty === 'hard').length,   fill: DIFF_COLORS.hard.hex },
  ]
  const statusData = [
    { name: 'Published', value: published, fill: STATUS_COLORS.published },
    { name: 'Draft',     value: drafts,    fill: STATUS_COLORS.draft },
    { name: 'Archived',  value: items.filter(i => i.status === 'archived').length, fill: STATUS_COLORS.archived },
  ].filter(d => d.value > 0)
  const recent = [...items].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')).slice(0, 8)
  const noData = !loading && items.length === 0

  // ── Plannr analytics ──────────────────────────────────────────────────────────
  if (!loading && feature.type === 'plannr') {
    const s = plannrStats
    const dailyData = (s?.dailyActivity ?? []).map(d => ({ date: d._id.slice(5), count: d.count }))
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total learners"   value={s?.profiles.total ?? 0}       Icon={Users}        accent />
          <StatCard label="Active learners"  value={s?.profiles.active ?? 0}      Icon={CheckCircle2} sub="with active plan" />
          <StatCard label="Topics"           value={s?.topics.published ?? 0}     Icon={BookOpen}     sub={`${s?.topics.total ?? 0} total`} />
          <StatCard label="Experiences"      value={s?.experiences.published ?? 0} Icon={BarChart3}   sub={`${s?.experiences.total ?? 0} total`} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-hairline bg-paper-elevated p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Active today</p><p className="mt-1 text-xl font-bold text-ink">{s?.activity.activeUsersToday ?? 0}</p></div>
          <div className="rounded-xl border border-hairline bg-paper-elevated p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Active (30d)</p><p className="mt-1 text-xl font-bold text-ink">{s?.activity.activeUsersThisPeriod ?? 0}</p></div>
          <div className="rounded-xl border border-hairline bg-paper-elevated p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Tips published</p><p className="mt-1 text-xl font-bold text-ink">{s?.tips.total ?? 0}</p></div>
          <div className="rounded-xl border border-hairline bg-paper-elevated p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Activities (30d)</p><p className="mt-1 text-xl font-bold text-ink">{s?.activity.total ?? 0}</p></div>
        </div>

        {/* Preview / try access (Free + Pro) */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-violet-700">Preview access</p>
            <p className="mt-1 text-sm text-ink-muted">Free &amp; Pro users viewing Plannr try / preview mode</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-violet-200/80 bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Preview users (all time)</p>
              <p className="mt-1 text-xl font-bold text-violet-800">{s?.preview?.uniqueUsersAllTime ?? 0}</p>
            </div>
            <div className="rounded-xl border border-violet-200/80 bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Active preview (30d)</p>
              <p className="mt-1 text-xl font-bold text-violet-800">{s?.preview?.uniqueUsersThisPeriod ?? 0}</p>
            </div>
            <div className="rounded-xl border border-violet-200/80 bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Preview today</p>
              <p className="mt-1 text-xl font-bold text-violet-800">{s?.preview?.uniqueUsersToday ?? 0}</p>
            </div>
            <div className="rounded-xl border border-violet-200/80 bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Visits (30d)</p>
              <p className="mt-1 text-xl font-bold text-violet-800">{s?.preview?.visitsThisPeriod ?? 0}</p>
            </div>
          </div>
          {(s?.preview?.recentViewers?.length ?? 0) > 0 && (
            <div className="overflow-hidden rounded-xl border border-violet-200/80 bg-white/70">
              <div className="border-b border-violet-100 px-4 py-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Recent preview viewers</p>
              </div>
              <div className="divide-y divide-violet-100">
                {s!.preview!.recentViewers.slice(0, 10).map(v => (
                  <div key={v.userId} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{v.userName}</p>
                      <p className="truncate text-xs text-ink-faint">{v.userEmail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-700">
                        {v.userPlan}
                      </span>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
                        {v.lastViewedAt ? format(parseISO(v.lastViewedAt), 'MMM d, HH:mm') : '—'}
                        {' · '}{v.visitCount} visit{v.visitCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {dailyData.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Daily activities — last 30 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" fill={feature.accentHex} radius={[3, 3, 0, 0]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {s && s.activityByType.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Activity by type</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={s.activityByType.map(d => ({ name: d._id, count: d.count }))} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" fill={feature.accentHex} radius={[4, 4, 0, 0]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <UserActivitySection data={activityData} loading={activityLoading} accentHex={feature.accentHex} />
      </div>
    )
  }

  // ── Learn-stats features (detective / debug-lab / roguelike) ─────────────────
  if (!loading && learnStats) {
    const isDetective  = feature.type === 'detective'
    const isDebugLab   = feature.type === 'debug-lab'
    const isRoguelike  = feature.type === 'roguelike'

    const s = learnStats as AdminDetectiveStats & AdminDebuggerStats & AdminRoguelikeStats
    const scenObj  = s.scenarios ?? s.challenges ?? { total: 0, published: 0, drafts: 0 }
    const actObj   = s.attempts  ?? s.solves     ?? s.runs ?? { total: 0, recent: 0 }
    const actLabel = isDetective ? 'Attempts' : isDebugLab ? 'Solves' : 'Runs'
    const rateLabel = isDetective ? 'Accuracy' : isDebugLab ? 'Success rate' : 'Completion rate'
    const rateVal   = isDetective ? (s.attempts?.accuracy ?? 0) : isDebugLab ? (s.solves?.rate ?? 0) : (s.runs?.completionRate ?? 0)
    const daily     = s.dailyActivity ?? []
    const topItems  = s.topScenarios  ?? s.topChallenges ?? []

    return (
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total problems"   value={scenObj.total}     Icon={BookOpen}     accent />
          <StatCard label="Published / live" value={scenObj.published} Icon={CheckCircle2} sub={`${scenObj.drafts} drafts`} />
          <StatCard label={`Total ${actLabel.toLowerCase()}`} value={actObj.total} Icon={BarChart3} sub={`${actObj.recent ?? 0} in last 30d`} />
          <StatCard label={rateLabel} value={`${rateVal}%`} Icon={TrendingUp} />
        </div>

        {/* Daily activity chart */}
        <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Daily activity — last 30 days</p>
          {daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={daily.map(d => ({ date: d._id.slice(5), count: d.count }))} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" fill={feature.accentHex} radius={[3, 3, 0, 0]} name={actLabel} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-44 items-center justify-center text-sm text-ink-faint">No activity yet</div>
          )}
        </div>

        {/* Top items */}
        {topItems.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
            <div className="border-b border-hairline bg-hairline/30 px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Top {isRoguelike ? 'scenarios by runs' : 'problems by attempts'}
              </p>
            </div>
            <div className="divide-y divide-hairline">
              {topItems.slice(0, 8).map((item: { title?: string; slug?: string; difficulty?: string; attempts?: number; correct?: number; solves?: number; success?: number; runs?: number; completed?: number }, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{item.title ?? item.slug ?? '—'}</p>
                    {item.difficulty && <DiffPill d={item.difficulty as 'easy' | 'medium' | 'hard'} />}
                  </div>
                  <div className="ml-4 shrink-0 font-mono text-xs text-ink-muted">
                    {isDetective && <>{item.attempts} attempts · {item.correct} correct</>}
                    {isDebugLab  && <>{item.solves} solves · {item.success} solved</>}
                    {isRoguelike && <>{item.runs} runs · {item.completed} completed</>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Runs by mode (roguelike only) */}
        {isRoguelike && s.runsByMode && s.runsByMode.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Runs by mode</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={s.runsByMode.map(m => ({ name: m._id, count: m.count }))} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="count" fill={feature.accentHex} radius={[4, 4, 0, 0]} name="Runs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <UserActivitySection data={activityData} loading={activityLoading} accentHex={feature.accentHex} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => <Sk key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total problems"   value={total}     Icon={BookOpen}    accent />
            <StatCard label="Published / live" value={published} Icon={CheckCircle2} sub={total ? `${Math.round((published / total) * 100)}% published` : undefined} />
            <StatCard label="Drafts"           value={drafts}    Icon={FileText} />
            <StatCard label="Hard problems"    value={hard}      Icon={BarChart3}   sub={total ? `${Math.round((hard / total) * 100)}% of total` : undefined} />
          </>
        )}
      </div>

      {/* Charts */}
      {noData ? (
        <div className="rounded-2xl border border-hairline bg-paper-elevated px-6 py-12 text-center">
          <PackageOpen className="mx-auto mb-3 h-8 w-8 text-ink-faint opacity-40" />
          <p className="text-sm font-medium text-ink">No problems added yet</p>
          <p className="mt-1 text-xs text-ink-faint">Add problems in the &ldquo;Problems&rdquo; tab to see analytics here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Difficulty breakdown */}
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Difficulty breakdown</p>
            {loading ? <Sk className="h-40" /> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={diffData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {diffData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status donut */}
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Publication status</p>
            {loading ? <Sk className="h-40" /> : statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: 11, color: '#6B7280' }}>{v}</span>} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-ink-faint">No data</div>
            )}
          </div>
        </div>
      )}

      {/* Recent additions */}
      {!loading && recent.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-paper-elevated overflow-hidden">
          <div className="border-b border-hairline bg-hairline/30 px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Recently updated problems</p>
          </div>
          <div className="divide-y divide-hairline">
            {recent.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{item.title ?? item.prompt ?? item.slug ?? '—'}</p>
                  <p className="text-xs text-ink-faint">{item.updatedAt ? format(parseISO(item.updatedAt), 'MMM d, yyyy') : '—'}</p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <DiffPill d={item.difficulty} />
                  <span className={cn('rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold capitalize',
                    item.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-hairline text-ink-faint')}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User activity */}
      <UserActivitySection data={activityData} loading={activityLoading} accentHex={feature.accentHex} />
    </div>
  )
}

// ─── Plannr content management ────────────────────────────────────────────────

type PlannrTab = 'topics' | 'experiences' | 'tips'

function PlannrTopicPanel({ target, onClose, onSaved }: { target?: AdminJourneyTopic; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!target
  type F = { slug: string; title: string; subtitle: string; stage: string; order: string; type: string; description: string; estimatedMinutes: string; icon: string; tags: string; status: string }
  const [form, setForm] = useState<F>({
    slug: target?.slug ?? '', title: target?.title ?? '', subtitle: target?.subtitle ?? '',
    stage: String(target?.stage ?? 1), order: String(target?.order ?? 0),
    type: target?.type ?? 'concept', description: target?.description ?? '',
    estimatedMinutes: String(target?.estimatedMinutes ?? 15), icon: target?.icon ?? '📚',
    tags: (target?.tags ?? []).join('\n'), status: target?.status ?? 'draft',
  })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) { setErr('Title required.'); return }
    setSaving(true); setErr(null)
    try {
      const body = { ...form, stage: Number(form.stage) || 1, order: Number(form.order) || 0, estimatedMinutes: Number(form.estimatedMinutes) || 15, tags: form.tags.split('\n').map(s => s.trim()).filter(Boolean), slug: form.slug || toSlugStr(form.title) } as Partial<AdminJourneyTopic>
      if (isEdit && target) { await adminApi.plannr.updateTopic(String(target._id), body); toast.success('Updated') }
      else                  { await adminApi.plannr.createTopic(body); toast.success('Created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally     { setSaving(false) }
  }
  const F_ = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>{children}</div>
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="font-semibold text-ink">{isEdit ? 'Edit Topic' : 'New Journey Topic'}</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Title *"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></F_>
            <F_ label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto" /></F_>
          </div>
          <F_ label="Subtitle"><input className={inp} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></F_>
          <div className="grid grid-cols-4 gap-3">
            <F_ label="Stage (1-5)"><input className={inp} type="number" min={1} max={5} value={form.stage} onChange={e => set('stage', e.target.value)} /></F_>
            <F_ label="Order"><input className={inp} type="number" value={form.order} onChange={e => set('order', e.target.value)} /></F_>
            <F_ label="Est. mins"><input className={inp} type="number" value={form.estimatedMinutes} onChange={e => set('estimatedMinutes', e.target.value)} /></F_>
            <F_ label="Icon"><input className={inp} value={form.icon} onChange={e => set('icon', e.target.value)} /></F_>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Type">
              <select className={inp} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="concept">Concept</option><option value="practice">Practice</option><option value="interview">Interview</option>
              </select>
            </F_>
            <F_ label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </F_>
          </div>
          <F_ label="Description"><textarea className={ta} rows={4} value={form.description} onChange={e => set('description', e.target.value)} /></F_>
          <F_ label="Tags (one per line)"><textarea className={`${inp} resize-none font-mono text-xs`} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} /></F_>
        </div>
        <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </>
  )
}

function PlannrExperiencePanel({ target, onClose, onSaved }: { target?: AdminJourneyExperience; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!target
  type F = { slug: string; title: string; company: string; round: string; durationMinutes: string; problem: string; tags: string; order: string; status: string }
  const [form, setForm] = useState<F>({
    slug: target?.slug ?? '', title: target?.title ?? '', company: target?.company ?? '', round: target?.round ?? 'Technical',
    durationMinutes: String(target?.durationMinutes ?? 45), problem: target?.problem ?? '',
    tags: (target?.tags ?? []).join('\n'), order: String(target?.order ?? 0), status: target?.status ?? 'draft',
  })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) { setErr('Title required.'); return }
    setSaving(true); setErr(null)
    try {
      const body = { ...form, durationMinutes: Number(form.durationMinutes) || 45, order: Number(form.order) || 0, tags: form.tags.split('\n').map(s => s.trim()).filter(Boolean), slug: form.slug || toSlugStr(form.title) } as Partial<AdminJourneyExperience>
      if (isEdit && target) { await adminApi.plannr.updateExperience(String(target._id), body); toast.success('Updated') }
      else                  { await adminApi.plannr.createExperience(body); toast.success('Created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally     { setSaving(false) }
  }
  const F_ = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>{children}</div>
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="font-semibold text-ink">{isEdit ? 'Edit Experience' : 'New Experience'}</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Title *"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></F_>
            <F_ label="Slug"><input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto" /></F_>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F_ label="Company"><input className={inp} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Google, Stripe…" /></F_>
            <F_ label="Round"><input className={inp} value={form.round} onChange={e => set('round', e.target.value)} placeholder="Technical" /></F_>
            <F_ label="Duration (min)"><input className={inp} type="number" value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} /></F_>
          </div>
          <F_ label="Status">
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </F_>
          <F_ label="Problem (LLD question)"><textarea className={ta} rows={3} value={form.problem} onChange={e => set('problem', e.target.value)} placeholder="Design a URL shortener…" /></F_>
          <F_ label="Tags (one per line)"><textarea className={`${inp} resize-none font-mono text-xs`} rows={3} value={form.tags} onChange={e => set('tags', e.target.value)} /></F_>
        </div>
        <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </>
  )
}

function PlannrTipPanel({ target, onClose, onSaved }: { target?: AdminJourneyTip; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!target
  type F = { moment: string; title: string; body: string; order: string; status: string }
  const [form, setForm] = useState<F>({ moment: target?.moment ?? 'starting', title: target?.title ?? '', body: target?.body ?? '', order: String(target?.order ?? 0), status: target?.status ?? 'published' })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.title.trim()) { setErr('Title required.'); return }
    setSaving(true); setErr(null)
    try {
      const body = { ...form, order: Number(form.order) || 0 } as Partial<AdminJourneyTip>
      if (isEdit && target) { await adminApi.plannr.updateTip(String(target._id), body); toast.success('Updated') }
      else                  { await adminApi.plannr.createTip(body); toast.success('Created') }
      onSaved()
    } catch (e) { setErr(e instanceof Error ? e.message : 'Error') }
    finally     { setSaving(false) }
  }
  const F_ = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">{label}</label>{children}</div>
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-hairline bg-paper-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="font-semibold text-ink">{isEdit ? 'Edit Tip' : 'New Journey Tip'}</p>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-faint hover:bg-hairline"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ scrollbarWidth: 'none' }}>
          {err && <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Title *"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></F_>
            <F_ label="Moment">
              <select className={inp} value={form.moment} onChange={e => set('moment', e.target.value)}>
                {['starting','designing','patterns','followups','explaining'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </F_>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F_ label="Status">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="published">Published</option><option value="draft">Draft</option>
              </select>
            </F_>
            <F_ label="Order"><input className={inp} type="number" value={form.order} onChange={e => set('order', e.target.value)} /></F_>
          </div>
          <F_ label="Body *"><textarea className={ta} rows={6} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Tip content…" /></F_>
        </div>
        <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-hairline">Cancel</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </>
  )
}

function PlannrContentSection() {
  const [activeTab, setActiveTab] = useState<PlannrTab>('topics')

  // ── Topics state ──────────────────────────────────────────────────────────
  const [topics, setTopics] = useState<AdminJourneyTopic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)
  const [topicPanel, setTopicPanel] = useState(false)
  const [topicEdit, setTopicEdit]   = useState<AdminJourneyTopic | undefined>()
  const [topicDel, setTopicDel]     = useState<AdminJourneyTopic | undefined>()
  const [topicDeleting, setTopicDeleting] = useState(false)
  const [topicToggling, setTopicToggling] = useState<string | null>(null)
  const topicIds = useMemo(() => topics.map(t => String(t._id)), [topics])
  const topicSel = useRowSelection(topicIds)

  const loadTopics = useCallback(async () => {
    setTopicsLoading(true)
    try { const d = await adminApi.plannr.listTopics(); setTopics(d.topics ?? []) }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setTopicsLoading(false) }
  }, [])
  useEffect(() => { if (activeTab === 'topics') loadTopics() }, [activeTab, loadTopics])

  async function toggleTopic(t: AdminJourneyTopic) {
    setTopicToggling(String(t._id))
    try {
      const r = await adminApi.plannr.publishTopic(String(t._id))
      setTopics(prev => prev.map(x => String(x._id) === String(t._id) ? { ...x, status: r.status as 'draft' | 'published' } : x))
      toast.success(r.status === 'published' ? 'Published' : 'Unpublished')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setTopicToggling(null) }
  }
  async function deleteTopic() {
    if (!topicDel) return; setTopicDeleting(true)
    try { await adminApi.plannr.deleteTopic(String(topicDel._id)); toast.success('Deleted'); setTopicDel(undefined); topicSel.clear(); loadTopics() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setTopicDeleting(false) }
  }

  // ── Experiences state ──────────────────────────────────────────────────────
  const [exps, setExps] = useState<AdminJourneyExperience[]>([])
  const [expsLoading, setExpsLoading] = useState(true)
  const [expPanel, setExpPanel] = useState(false)
  const [expEdit, setExpEdit]   = useState<AdminJourneyExperience | undefined>()
  const [expDel, setExpDel]     = useState<AdminJourneyExperience | undefined>()
  const [expDeleting, setExpDeleting] = useState(false)
  const [expToggling, setExpToggling] = useState<string | null>(null)
  const expIds = useMemo(() => exps.map(e => String(e._id)), [exps])
  const expSel = useRowSelection(expIds)

  const loadExps = useCallback(async () => {
    setExpsLoading(true)
    try { const d = await adminApi.plannr.listExperiences(); setExps(d.experiences ?? []) }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setExpsLoading(false) }
  }, [])
  useEffect(() => { if (activeTab === 'experiences') loadExps() }, [activeTab, loadExps])

  async function toggleExp(e: AdminJourneyExperience) {
    setExpToggling(String(e._id))
    try {
      const r = await adminApi.plannr.publishExperience(String(e._id))
      setExps(prev => prev.map(x => String(x._id) === String(e._id) ? { ...x, status: r.status as 'draft' | 'published' } : x))
      toast.success(r.status === 'published' ? 'Published' : 'Unpublished')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally   { setExpToggling(null) }
  }
  async function deleteExp() {
    if (!expDel) return; setExpDeleting(true)
    try { await adminApi.plannr.deleteExperience(String(expDel._id)); toast.success('Deleted'); setExpDel(undefined); expSel.clear(); loadExps() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setExpDeleting(false) }
  }

  // ── Tips state ─────────────────────────────────────────────────────────────
  const [tips, setTips] = useState<AdminJourneyTip[]>([])
  const [tipsLoading, setTipsLoading] = useState(true)
  const [tipPanel, setTipPanel] = useState(false)
  const [tipEdit, setTipEdit]   = useState<AdminJourneyTip | undefined>()
  const [tipDel, setTipDel]     = useState<AdminJourneyTip | undefined>()
  const [tipDeleting, setTipDeleting] = useState(false)
  const [tipToggling, setTipToggling] = useState<string | null>(null)
  const tipIds = useMemo(() => tips.map(t => String(t._id)), [tips])
  const tipSel = useRowSelection(tipIds)

  const loadTips = useCallback(async () => {
    setTipsLoading(true)
    try { const d = await adminApi.plannr.listTips(); setTips(d.tips ?? []) }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setTipsLoading(false) }
  }, [])
  useEffect(() => { if (activeTab === 'tips') loadTips() }, [activeTab, loadTips])

  async function toggleTip(t: AdminJourneyTip) {
    setTipToggling(String(t._id))
    try {
      const r = await adminApi.plannr.publishTip(String(t._id))
      setTips(prev => prev.map(x => String(x._id) === String(t._id) ? { ...x, status: r.status as 'draft' | 'published' } : x))
      toast.success(r.status === 'published' ? 'Published' : 'Unpublished')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setTipToggling(null) }
  }
  async function deleteTip() {
    if (!tipDel) return; setTipDeleting(true)
    try { await adminApi.plannr.deleteTip(String(tipDel._id)); toast.success('Deleted'); setTipDel(undefined); tipSel.clear(); loadTips() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally   { setTipDeleting(false) }
  }

  // ── Shared small table renderer ─────────────────────────────────────────────
  function renderTable<T extends { _id: string; title?: string; slug?: string; status: string; updatedAt?: string }>(
    { items, loading, onEdit, onToggle, toggling, onDel, sel }: {
      items: T[]; loading: boolean; sel: ReturnType<typeof useRowSelection>
      onEdit: (item: T) => void; onToggle: (item: T) => void; toggling: string | null
      onDel: (item: T) => void
    },
  ) {
    return (
      <div className="overflow-hidden rounded-xl border border-hairline bg-paper-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/40">
                <th className="w-10 px-4 py-3"><SelectCheckbox checked={sel.allPageSelected} indeterminate={sel.somePageSelected} onChange={sel.togglePage} disabled={loading || items.length === 0} /></th>
                {['Title / Slug', 'Updated', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-hairline">{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Sk className="h-4" /></td>)}</tr>)
                : items.map(item => {
                    const id = String(item._id)
                    return (
                      <tr key={id} className={cn('border-b border-hairline transition hover:bg-hairline/30', item.status !== 'published' && 'opacity-70', sel.isSelected(id) && 'bg-brand-tint/40')}>
                        <td className="px-4 py-3"><SelectCheckbox checked={sel.isSelected(id)} onChange={() => sel.toggle(id)} /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink">{item.title ?? '—'}</p>
                          {item.slug && <p className="font-mono text-[10px] text-ink-faint">{item.slug}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-faint">{item.updatedAt ? format(parseISO(item.updatedAt), 'MMM d, yyyy') : '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => onToggle(item)} disabled={toggling === id}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition hover:bg-hairline disabled:opacity-50">
                            {item.status === 'published' ? <><ToggleRight size={14} className="text-emerald-500" /> Published</> : <><ToggleLeft size={14} className="text-ink-faint" /> {item.status}</>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => onEdit(item)} className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-brand/30 hover:bg-brand-tint hover:text-brand"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => onDel(item)} className="rounded-md border border-hairline p-1.5 text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-sm text-ink-faint">
            <BookOpen className="h-7 w-7 opacity-40" /><p>None yet</p>
          </div>
        )}
      </div>
    )
  }

  const TABS: { key: PlannrTab; label: string; count: number }[] = [
    { key: 'topics',      label: 'Topics',      count: topics.length },
    { key: 'experiences', label: 'Experiences',  count: exps.length   },
    { key: 'tips',        label: 'Tips',         count: tips.length   },
  ]

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-xl border border-hairline bg-paper-elevated p-1.5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
              activeTab === t.key ? 'bg-brand text-brand-foreground' : 'text-ink-muted hover:bg-hairline/60 hover:text-ink')}>
            {t.label}
            <span className={cn('rounded-full px-1.5 py-0.5 font-mono text-[10px]', activeTab === t.key ? 'bg-white/20' : 'bg-hairline')}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Topics tab */}
      {activeTab === 'topics' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setTopicEdit(undefined); setTopicPanel(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> New Topic
            </button>
          </div>
          {renderTable({ items: topics, loading: topicsLoading, sel: topicSel, toggling: topicToggling,
            onEdit: t => { setTopicEdit(t); setTopicPanel(true) }, onToggle: toggleTopic, onDel: setTopicDel })}
          {topicPanel && <PlannrTopicPanel target={topicEdit} onClose={() => { setTopicPanel(false); setTopicEdit(undefined) }} onSaved={() => { setTopicPanel(false); setTopicEdit(undefined); loadTopics() }} />}
          <ConfirmModal open={!!topicDel} onClose={() => { if (!topicDeleting) setTopicDel(undefined) }} onConfirm={deleteTopic}
            title="Delete topic?" loading={topicDeleting} icon={Trash2}
            description={<>Delete <span className="font-semibold">&ldquo;{topicDel?.title}&rdquo;</span>? Cannot be undone.</>} confirmLabel="Delete" />
        </div>
      )}

      {/* Experiences tab */}
      {activeTab === 'experiences' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setExpEdit(undefined); setExpPanel(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> New Experience
            </button>
          </div>
          {renderTable({ items: exps, loading: expsLoading, sel: expSel, toggling: expToggling,
            onEdit: e => { setExpEdit(e); setExpPanel(true) }, onToggle: toggleExp, onDel: setExpDel })}
          {expPanel && <PlannrExperiencePanel target={expEdit} onClose={() => { setExpPanel(false); setExpEdit(undefined) }} onSaved={() => { setExpPanel(false); setExpEdit(undefined); loadExps() }} />}
          <ConfirmModal open={!!expDel} onClose={() => { if (!expDeleting) setExpDel(undefined) }} onConfirm={deleteExp}
            title="Delete experience?" loading={expDeleting} icon={Trash2}
            description={<>Delete <span className="font-semibold">&ldquo;{expDel?.title}&rdquo;</span>?</>} confirmLabel="Delete" />
        </div>
      )}

      {/* Tips tab */}
      {activeTab === 'tips' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => { setTipEdit(undefined); setTipPanel(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> New Tip
            </button>
          </div>
          {renderTable({ items: tips, loading: tipsLoading, sel: tipSel, toggling: tipToggling,
            onEdit: t => { setTipEdit(t); setTipPanel(true) }, onToggle: toggleTip, onDel: setTipDel })}
          {tipPanel && <PlannrTipPanel target={tipEdit} onClose={() => { setTipPanel(false); setTipEdit(undefined) }} onSaved={() => { setTipPanel(false); setTipEdit(undefined); loadTips() }} />}
          <ConfirmModal open={!!tipDel} onClose={() => { if (!tipDeleting) setTipDel(undefined) }} onConfirm={deleteTip}
            title="Delete tip?" loading={tipDeleting} icon={Trash2}
            description={<>Delete <span className="font-semibold">&ldquo;{tipDel?.title}&rdquo;</span>?</>} confirmLabel="Delete" />
        </div>
      )}
    </div>
  )
}

// ─── Problems section dispatcher ──────────────────────────────────────────────

function ProblemsSection({ feature }: { feature: FeatureConfig }) {
  if (feature.type === 'studio')    return <PackTable feature={feature} />
  if (feature.type === 'quiz')      return <QuizTable />
  if (feature.type === 'detective') return <DetectiveTable />
  if (feature.type === 'debug-lab') return <DebuggerTable />
  if (feature.type === 'roguelike') return <RoguelikeTable />
  if (feature.type === 'plannr')    return <PlannrContentSection />
  return null
}

// ─── Feature Activity Tab ─────────────────────────────────────────────────────

const DAY_OPTIONS = [{ label: '7d', value: 7 }, { label: '14d', value: 14 }, { label: '30d', value: 30 }, { label: '90d', value: 90 }]
type SortKey = 'date' | 'userName' | 'actions' | 'completions' | 'score' | 'duration' | 'lastSeen'
type SortDir = 'asc' | 'desc'

function FeatureActivityTab({ feature }: { feature: FeatureConfig }) {
  const isQuiz = feature.type === 'quiz'
  const [rows,   setRows]   = useState<UserActivityRow[]>([])
  const [total,  setTotal]  = useState(0)
  const [pages,  setPages]  = useState(1)
  const [page,   setPage]   = useState(1)
  const [days,   setDays]   = useState(30)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>(isQuiz ? 'lastSeen' : 'date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [loading, setLoading] = useState(true)
  const [activeCnt,   setActiveCnt]   = useState(0)
  const [totalActions, setTotalActions] = useState(0)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const avgScorePct = useMemo(() => {
    if (!isQuiz || rows.length === 0) return null
    const scored = rows.filter(r => r.scoreTotal != null && r.scoreTotal > 0 && r.scorePercent != null)
    if (scored.length === 0) return null
    return Math.round(scored.reduce((s, r) => s + (r.scorePercent ?? 0), 0) / scored.length)
  }, [isQuiz, rows])

  const load = useCallback(async (opts?: { resetPage?: boolean }) => {
    setLoading(true)
    const p = opts?.resetPage ? 1 : page
    if (opts?.resetPage) setPage(1)
    try {
      const data = await adminApi.userActivity({
        days, feature: feature.slug, search, page: p, limit: 50,
        sortBy: sortKey, sortDir,
      })
      setRows(data.rows); setTotal(data.total); setPages(data.pages)
      setActiveCnt(data.summary.totalActiveUsers)
      setTotalActions(data.summary.totalActions)
    } catch { setRows([]); setTotal(0) }
    finally  { setLoading(false) }
  }, [days, feature.slug, search, page, sortKey, sortDir])

  useEffect(() => { load() }, [load])

  const handleSearch = (v: string) => {
    setSearchInput(v)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setSearch(v); setPage(1) }, 400)
  }

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    col !== sortKey
      ? <ChevronsUpDown className="ml-1 h-3 w-3 text-ink-faint opacity-40 inline" />
      : sortDir === 'asc'
        ? <ChevronUp   className="ml-1 h-3 w-3 text-brand inline" />
        : <ChevronDown className="ml-1 h-3 w-3 text-brand inline" />

  const inp = 'rounded-lg border border-hairline bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30'

  const columns: [SortKey, string][] = isQuiz
    ? [
        ['date',     'Quiz day'],
        ['userName', 'User'],
        ['score',    'Score'],
        ['lastSeen', 'Attempted at'],
      ]
    : [
        ['date',        'Date'],
        ['userName',    'User'],
        ['actions',     'Actions'],
        ['completions', 'Completions'],
        ['duration',    'Duration'],
        ['lastSeen',    'Last Active'],
      ]

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Active users</p>
          <p className="mt-1 text-2xl font-bold text-ink">{loading ? '…' : activeCnt}</p>
          <p className="mt-0.5 text-xs text-ink-faint">last {days} days</p>
        </div>
        <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            {isQuiz ? 'Quiz attempts' : 'Total actions'}
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">{loading ? '…' : totalActions}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{isQuiz ? 'individual submissions' : 'across all users'}</p>
        </div>
        <div className="rounded-xl border border-hairline bg-paper-elevated p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            {isQuiz ? 'Avg score (page)' : 'Avg / user'}
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {loading ? '…' : isQuiz
              ? (avgScorePct != null ? `${avgScorePct}%` : '—')
              : (activeCnt > 0 ? Math.round(totalActions / activeCnt) : 0)}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {isQuiz ? 'from rows on this page' : 'actions per active user'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search user name or email…"
            className={`${inp} w-full pl-9`}
          />
        </div>
        {/* Days */}
        <div className="flex items-center gap-1 rounded-lg border border-hairline bg-paper p-1">
          {DAY_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { setDays(o.value); setPage(1) }}
              className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                days === o.value ? 'bg-brand text-brand-foreground' : 'text-ink-muted hover:bg-hairline')}>
              {o.label}
            </button>
          ))}
        </div>
        <button onClick={() => load({ resetPage: true })} disabled={loading}
          className="rounded-lg border border-hairline p-2 text-ink-muted hover:bg-hairline disabled:opacity-40">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
        <div className="border-b border-hairline bg-hairline/30 px-5 py-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint flex items-center gap-1.5">
            <Users className="h-3 w-3" /> {isQuiz ? 'Quiz attempts' : 'User activity log'}
          </p>
          {!loading && <span className="font-mono text-[10px] text-ink-faint">{total.toLocaleString()} rows</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-hairline/20">
                {columns.map(([key, label]) => (
                  <th key={key} onClick={() => handleSort(key)}
                    className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint hover:text-ink transition-colors">
                    {label}<SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(columns.length)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-hairline" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Users className="mx-auto mb-3 h-7 w-7 text-ink-faint opacity-20" />
                  <p className="text-sm font-medium text-ink-faint">No activity found</p>
                  <p className="mt-1 text-xs text-ink-faint opacity-60">Try a wider date range or clear the search</p>
                </td></tr>
              ) : rows.map((row, i) => (
                <tr key={i} className="hover:bg-hairline/30 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-faint">{row.date}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{row.userName}</p>
                    <p className="text-xs text-ink-faint">{row.userEmail}</p>
                  </td>
                  {isQuiz ? (
                    <td className="px-4 py-3">
                      {row.scoreLabel ? (
                        <span className={cn(
                          'inline-flex items-center gap-1.5 font-mono text-sm font-semibold',
                          (row.scorePercent ?? 0) >= 70 ? 'text-emerald-600'
                            : (row.scorePercent ?? 0) >= 40 ? 'text-amber-600'
                              : 'text-rose-600',
                        )}>
                          <CheckCircle2 className="h-3 w-3" />
                          {row.scoreLabel}
                          <span className="text-xs font-normal text-ink-faint">({row.scorePercent}%)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-ink">{row.actions}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />{row.completions}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.durationMinutes != null
                          ? <span className="inline-flex items-center gap-1 font-mono text-sm text-ink"><Clock className="h-3 w-3 text-ink-faint" />{row.durationMinutes}m</span>
                          : <span className="text-xs text-ink-faint">—</span>}
                      </td>
                    </>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-faint">
                    {row.lastSeen ? format(parseISO(row.lastSeen as unknown as string), 'MMM d, HH:mm') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
            <span className="text-xs text-ink-faint">Page {page} of {pages} · {total.toLocaleString()} rows</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}
                className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">← Prev</button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, pages - 4))
                const p = start + i
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn('rounded-md px-3 py-1.5 text-xs font-medium',
                      p === page ? 'bg-brand text-brand-foreground' : 'border border-hairline text-ink-muted hover:bg-hairline')}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages || loading}
                className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'analytics' | 'problems' | 'activity'

export default function FeatureAdminPage() {
  const params = useParams()
  const slug   = typeof params.slug === 'string' ? params.slug : ''
  const feature = getFeature(slug)
  const [tab, setTab] = useState<Tab>('analytics')

  if (!feature) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <p className="text-lg font-medium text-ink">Feature not found</p>
        <p className="text-sm text-ink-faint">No feature with slug &ldquo;{slug}&rdquo; exists.</p>
        <Link href="/admin/features" className="flex items-center gap-1.5 text-sm text-brand hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all features
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
          {FEATURES.map(f => (
            <Link key={f.slug} href={`/admin/features/${f.slug}`}
              className="rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-sm text-ink hover:bg-hairline transition-colors">
              {f.label}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const Icon = ICON_MAP[feature.slug] ?? BookOpen

  return (
    <div className="flex min-h-full flex-col">

      {/* Page header */}
      <div className={`border-b px-5 py-5 ${feature.bgClass} ${feature.borderClass}`}>
        <div className="mb-3">
          <Link href="/admin/features"
            className={`inline-flex items-center gap-1.5 text-xs font-medium hover:underline ${feature.textClass} opacity-70`}>
            <ArrowLeft className="h-3 w-3" /> All features
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 ${feature.textClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className={`font-serif text-xl font-semibold ${feature.textClass}`}>{feature.label}</h1>
            <p className="text-sm text-ink-faint">{feature.description}</p>
          </div>
          <a href={feature.href} target="_blank" rel="noreferrer"
            className={`ml-auto flex items-center gap-1 text-xs hover:underline ${feature.textClass} opacity-60`}>
            Open feature <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline bg-paper-elevated px-5">
        {(['analytics', 'problems', 'activity'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors',
              tab === t
                ? `border-current ${feature.textClass}`
                : 'border-transparent text-ink-muted hover:text-ink',
            )}>
            {t === 'analytics' ? '📊 Analytics'
              : t === 'activity' ? '👥 User Activity'
              : feature.type === 'plannr' ? '📝 Content' : '📦 Problems'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-4 sm:p-6">
        {tab === 'analytics' ? <AnalyticsSection   feature={feature} />
          : tab === 'activity' ? <FeatureActivityTab feature={feature} />
          : <ProblemsSection feature={feature} />}
      </div>

    </div>
  )
}
