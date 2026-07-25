'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rss, Plus, Search, RefreshCw, Eye, ThumbsUp, ThumbsDown,
  MessageCircle, Clock, FileEdit, Globe, Trash2,
  Copy, EyeOff, X, Save, ChevronLeft, ChevronRight,
  Star, BookOpen, TrendingUp,
  ExternalLink, Calendar, Tag, Filter, ArrowUp, ArrowDown, GripVertical,
} from 'lucide-react'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { toast } from 'sonner'
import {
  adminApi,
  type AdminBlogSummary,
  type AdminBlogDetail,
  type AdminBlogAnalytics,
} from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import { BlogBlocks } from '@/components/blog/BlogBlocks'
import { type BlogBlock, BLOG_BLOCK_TYPES } from '@/lib/blog-blocks'

// ─── Shared style constants ───────────────────────────────────────────────────

const IB = 'w-full rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10'
const BS = 'rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-hairline transition-colors'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d: string | null) {
  if (!d) return '-'
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d }
}

function fmtDate(d: string | null) {
  if (!d) return '-'
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS = {
  published: { label: 'Published', Icon: Globe,        color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200' },
  draft:     { label: 'Draft',     Icon: FileEdit,     color: 'text-amber-700',   bg: 'bg-amber-50 ring-amber-200'     },
  scheduled: { label: 'Scheduled', Icon: Calendar,     color: 'text-blue-700',    bg: 'bg-blue-50 ring-blue-200'       },
} as const

function StatusBadge({ status }: { status: AdminBlogSummary['status'] }) {
  const m = STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', m.bg, m.color)}>
      <m.Icon className="h-2.5 w-2.5" /> {m.label}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, Icon, accent, bg }: {
  label: string; value: string | number; sub?: string
  Icon: React.ElementType; accent: string; bg: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
          <p className={cn('mt-2 text-3xl font-black tabular-nums', accent)}>{value}</p>
          {sub && <p className="mt-1 text-[11px] text-ink-faint">{sub}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', bg)}>
          <Icon className={cn('h-5 w-5', accent)} />
        </div>
      </div>
    </div>
  )
}

// ─── Block editor (structured content — no Markdown) ─────────────────────────

const BLOCK_LABELS: Record<BlogBlock['type'], string> = {
  heading: 'Heading', paragraph: 'Paragraph', bullets: 'Bulleted list', numbered: 'Numbered list',
  code: 'Code', quote: 'Callout quote', table: 'Table', divider: 'Divider',
}

function newBlock(type: BlogBlock['type']): BlogBlock {
  switch (type) {
    case 'heading':   return { type, level: 2, text: '' }
    case 'paragraph': return { type, text: '' }
    case 'bullets':   return { type, items: [''] }
    case 'numbered':  return { type, items: [''] }
    case 'code':      return { type, lang: 'java', code: '' }
    case 'quote':     return { type, text: '' }
    case 'table':     return { type, headers: ['', ''], rows: [['', '']] }
    case 'divider':   return { type }
  }
}

const TA = 'w-full resize-y rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10'

function BlockFields({ block, onChange }: { block: BlogBlock; onChange: (b: BlogBlock) => void }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="flex gap-2">
          <select
            value={block.level}
            onChange={e => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })}
            className="rounded-lg border border-hairline-strong bg-paper px-2 py-2 text-sm outline-none"
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            value={block.text}
            onChange={e => onChange({ ...block, text: e.target.value })}
            placeholder="Heading text…"
            className={cn(IB, 'flex-1')}
          />
        </div>
      )
    case 'paragraph':
    case 'quote':
      return (
        <textarea
          value={block.text}
          onChange={e => onChange({ ...block, text: e.target.value })}
          placeholder="Text… use **bold**, `code`, *italic*, [link](url)"
          rows={3}
          className={TA}
        />
      )
    case 'bullets':
    case 'numbered':
      return (
        <textarea
          value={block.items.join('\n')}
          onChange={e => onChange({ ...block, items: e.target.value.split('\n') })}
          placeholder={'One item per line…'}
          rows={4}
          className={TA}
        />
      )
    case 'code':
      return (
        <div className="space-y-2">
          <input
            value={block.lang}
            onChange={e => onChange({ ...block, lang: e.target.value })}
            placeholder="Language (e.g. java, text)"
            className={cn(IB, 'w-40 font-mono text-[12px]')}
          />
          <textarea
            value={block.code}
            onChange={e => onChange({ ...block, code: e.target.value })}
            rows={8}
            className={cn(TA, 'font-mono text-[12px] leading-relaxed')}
          />
        </div>
      )
    case 'table':
      return (
        <div className="space-y-2">
          <input
            value={block.headers.join(', ')}
            onChange={e => onChange({ ...block, headers: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="Header 1, Header 2, …"
            className={cn(IB, 'font-mono text-[12px]')}
          />
          <textarea
            value={block.rows.map(r => r.join(', ')).join('\n')}
            onChange={e => onChange({ ...block, rows: e.target.value.split('\n').map(r => r.split(',').map(s => s.trim())) })}
            placeholder="One row per line, comma-separated cells…"
            rows={4}
            className={cn(TA, 'font-mono text-[12px]')}
          />
        </div>
      )
    case 'divider':
      return <p className="text-[11px] italic text-ink-faint">A horizontal rule — no content needed.</p>
  }
}

function BlockEditor({ blocks, onChange }: { blocks: BlogBlock[]; onChange: (b: BlogBlock[]) => void }) {
  function update(i: number, block: BlogBlock) {
    onChange(blocks.map((b, j) => (j === i ? block : b)))
  }
  function remove(i: number) {
    onChange(blocks.filter((_, j) => j !== i))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function add(type: BlogBlock['type']) {
    onChange([...blocks, newBlock(type)])
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="rounded-xl border border-hairline bg-paper-elevated p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              <GripVertical className="h-3 w-3" /> {BLOCK_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-ink-faint hover:bg-hairline disabled:opacity-30">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="rounded p-1 text-ink-faint hover:bg-hairline disabled:opacity-30">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => remove(i)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <BlockFields block={block} onChange={b => update(i, b)} />
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-dashed border-hairline-strong p-3">
        <span className="mr-1 self-center text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Add:</span>
        {BLOG_BLOCK_TYPES.map(t => (
          <button key={t} onClick={() => add(t)} className={BS}>
            <Plus className="mr-1 inline h-3 w-3" />{BLOCK_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Blog Editor / Detail Drawer ─────────────────────────────────────────────

function BlogDrawer({
  blog,
  onClose,
  onSaved,
  onDelete,
}: {
  blog: AdminBlogDetail | null   // null = create new
  onClose: () => void
  onSaved: (b: AdminBlogDetail) => void
  onDelete?: (id: string) => void
}) {
  const isNew = blog === null
  const [form, setForm] = useState<Partial<AdminBlogDetail>>(blog ?? {
    title: '', subtitle: '', slug: '', excerpt: '', content: [],
    category: '', tags: [], status: 'draft', isFeatured: false,
    author: { name: 'LLDCanvas Team', role: 'Engineering', avatar: '' },
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    faq: [], toc: [], relatedSlugs: [],
    coverImage: '', coverImageAlt: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tab, setTab] = useState<'content' | 'preview' | 'seo' | 'meta'>('content')
  const tagsRef = useRef<HTMLInputElement>(null)
  const kwRef   = useRef<HTMLInputElement>(null)

  function set<K extends keyof AdminBlogDetail>(key: K, val: AdminBlogDetail[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setSeo<K extends keyof AdminBlogDetail['seo']>(key: K, val: any) {
    setForm(prev => ({ ...prev, seo: { ...(prev.seo as AdminBlogDetail['seo']), [key]: val } }))
  }

  async function save() {
    if (!form.title?.trim()) { toast.error('Title is required'); return }
    if (!form.slug?.trim())  { toast.error('Slug is required');  return }
    setSaving(true)
    try {
      const saved = isNew
        ? await adminApi.blog.create(form)
        : await adminApi.blog.update(blog!._id, form)
      onSaved(saved)
      toast.success(isNew ? 'Blog created' : 'Blog saved')
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!blog) return
    if (!confirm('Delete this blog post? This cannot be undone.')) return
    setDeleting(true)
    try {
      await adminApi.blog.delete(blog._id)
      onDelete?.(blog._id)
      toast.success('Blog deleted')
      onClose()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  function addTag(ref: React.RefObject<HTMLInputElement | null>, list: string[], key: keyof AdminBlogDetail | 'seo.keywords') {
    const val = ref.current?.value.trim()
    if (!val) return
    if (key === 'seo.keywords') {
      setSeo('keywords', [...((form.seo?.keywords) ?? []), val])
    } else {
      set(key as keyof AdminBlogDetail, [...list, val] as unknown as AdminBlogDetail[keyof AdminBlogDetail])
    }
    if (ref.current) ref.current.value = ''
  }

  const TABS = [
    { id: 'content' as const, label: 'Content' },
    { id: 'preview' as const, label: 'Preview' },
    { id: 'seo'     as const, label: 'SEO' },
    { id: 'meta'    as const, label: 'Meta' },
  ]

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 36 }}
      className="fixed right-0 top-0 z-50 flex h-full w-160 max-w-full flex-col border-l border-hairline bg-paper shadow-2xl"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper-elevated px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
            <Rss className="h-4.5 w-4.5 text-brand" style={{ height: 18, width: 18 }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</p>
            {!isNew && <p className="text-[10px] text-ink-faint">{timeAgo(blog!.createdAt)}</p>}
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-hairline hover:text-ink transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-hairline bg-paper-elevated">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-5 py-3 text-xs font-semibold transition-colors border-b-2',
              tab === t.id
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-faint hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {tab === 'content' && (
          <>
            {/* Basic fields */}
            <div className="space-y-3">
              <Field label="Title">
                <input
                  value={form.title ?? ''}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Blog title…"
                  className={IB}
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={form.subtitle ?? ''}
                  onChange={e => set('subtitle', e.target.value)}
                  placeholder="Short subtitle…"
                  className={IB}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slug">
                  <input
                    value={form.slug ?? ''}
                    onChange={e => set('slug', e.target.value)}
                    placeholder="my-blog-post"
                    className={cn(IB, 'font-mono text-[12px]')}
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={form.category ?? ''}
                    onChange={e => set('category', e.target.value)}
                    placeholder="System Design"
                    className={IB}
                  />
                </Field>
              </div>
              <Field label="Excerpt">
                <textarea
                  value={form.excerpt ?? ''}
                  onChange={e => set('excerpt', e.target.value)}
                  placeholder="Short description shown in listings…"
                  rows={2}
                  className={cn(IB, 'resize-none')}
                />
              </Field>
            </div>

            {/* Tags */}
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.tags ?? []).map(tag => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                    {tag}
                    <button onClick={() => set('tags', (form.tags ?? []).filter(t => t !== tag))} className="text-brand/50 hover:text-brand">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input ref={tagsRef} placeholder="Add tag…" className={cn(IB, 'flex-1')} onKeyDown={e => e.key === 'Enter' && addTag(tagsRef, form.tags ?? [], 'tags')} />
                <button onClick={() => addTag(tagsRef, form.tags ?? [], 'tags')} className={BS}>Add</button>
              </div>
            </Field>

            {/* Content */}
            <Field label="Content">
              <BlockEditor blocks={form.content ?? []} onChange={c => set('content', c)} />
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink-faint">
                Build the article from typed blocks — headings, paragraphs, lists, code, callouts, and tables always
                render correctly since there&rsquo;s no text format to get wrong. Within a paragraph, bullet item, or
                callout, you can still use <code className="rounded bg-hairline px-1">**bold**</code>,{' '}
                <code className="rounded bg-hairline px-1">`code`</code>,{' '}
                <code className="rounded bg-hairline px-1">*italic*</code>, and{' '}
                <code className="rounded bg-hairline px-1">[link](url)</code>. Check the <b>Preview</b> tab before publishing.
              </p>
            </Field>

            {/* Cover image */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cover Image URL">
                <input
                  value={form.coverImage ?? ''}
                  onChange={e => set('coverImage', e.target.value)}
                  placeholder="https://..."
                  className={IB}
                />
              </Field>
              <Field label="Cover Image Alt">
                <input
                  value={form.coverImageAlt ?? ''}
                  onChange={e => set('coverImageAlt', e.target.value)}
                  placeholder="Descriptive alt text…"
                  className={IB}
                />
              </Field>
            </div>
          </>
        )}

        {tab === 'preview' && (
          <div className="rounded-2xl border border-hairline bg-white p-8">
            {form.category && (
              <span className="mb-4 inline-flex rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                {form.category}
              </span>
            )}
            <h1 className="font-serif text-3xl font-black leading-tight text-ink">
              {form.title || 'Untitled post'}
            </h1>
            {form.subtitle && (
              <p className="mt-3 font-serif text-lg italic leading-relaxed text-ink-muted">{form.subtitle}</p>
            )}
            <div className="mt-8 border-t border-hairline pt-8">
              {form.content && form.content.length > 0 ? (
                <BlogBlocks blocks={form.content} />
              ) : (
                <p className="text-sm text-ink-faint">Nothing to preview yet — add some blocks first.</p>
              )}
            </div>
            {form.faq && form.faq.length > 0 && (
              <div className="mt-10 border-t border-hairline pt-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">FAQ ({form.faq.length})</p>
                <div className="space-y-4">
                  {form.faq.map((f, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-ink">{f.q}</p>
                      <p className="mt-1 text-sm text-ink-muted">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'seo' && (
          <>
            <Field label="Meta Title">
              <input
                value={form.seo?.metaTitle ?? ''}
                onChange={e => setSeo('metaTitle', e.target.value)}
                placeholder="SEO title (60 chars recommended)…"
                className={IB}
              />
              <p className="mt-1 text-[10px] text-ink-faint">{(form.seo?.metaTitle ?? '').length} / 60 chars</p>
            </Field>
            <Field label="Meta Description">
              <textarea
                value={form.seo?.metaDescription ?? ''}
                onChange={e => setSeo('metaDescription', e.target.value)}
                placeholder="SEO description (155 chars recommended)…"
                rows={3}
                className={cn(IB, 'resize-none')}
              />
              <p className="mt-1 text-[10px] text-ink-faint">{(form.seo?.metaDescription ?? '').length} / 155 chars</p>
            </Field>
            <Field label="OG Image URL">
              <input
                value={form.seo?.ogImage ?? ''}
                onChange={e => setSeo('ogImage', e.target.value)}
                placeholder="https://..."
                className={IB}
              />
            </Field>
            <Field label="Keywords">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.seo?.keywords ?? []).map(kw => (
                  <span key={kw} className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                    {kw}
                    <button onClick={() => setSeo('keywords', (form.seo?.keywords ?? []).filter(k => k !== kw))} className="text-brand/50 hover:text-brand">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input ref={kwRef} placeholder="Add keyword…" className={cn(IB, 'flex-1')} onKeyDown={e => e.key === 'Enter' && addTag(kwRef, form.seo?.keywords ?? [], 'seo.keywords')} />
                <button onClick={() => addTag(kwRef, form.seo?.keywords ?? [], 'seo.keywords')} className={BS}>Add</button>
              </div>
            </Field>
          </>
        )}

        {tab === 'meta' && (
          <>
            <Field label="Status">
              <div className="grid grid-cols-3 gap-2">
                {(['draft', 'published', 'scheduled'] as const).map(s => {
                  const m = STATUS[s]
                  return (
                    <button
                      key={s}
                      onClick={() => set('status', s)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold ring-1 transition-all',
                        form.status === s ? cn(m.bg, m.color) : 'border-hairline bg-paper text-ink-muted ring-transparent hover:border-brand/20',
                      )}
                    >
                      <m.Icon className="h-3.5 w-3.5" /> {m.label}
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Featured toggle */}
            <div className="flex items-center justify-between rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm font-medium text-ink">Featured post</p>
                  <p className="text-[11px] text-ink-faint">Pinned to the top of the blog listing page</p>
                </div>
              </div>
              <button
                onClick={() => set('isFeatured', !form.isFeatured)}
                className={cn('relative h-6 w-11 rounded-full transition-colors', form.isFeatured ? 'bg-brand' : 'bg-hairline-strong')}
              >
                <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', form.isFeatured ? 'translate-x-5' : 'translate-x-0.5')} />
              </button>
            </div>

            {/* Author */}
            <div className="space-y-3 rounded-xl border border-hairline p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Author</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name">
                  <input
                    value={form.author?.name ?? ''}
                    onChange={e => set('author', { ...(form.author ?? { name: '', role: '' }), name: e.target.value })}
                    className="input-base"
                  />
                </Field>
                <Field label="Role">
                  <input
                    value={form.author?.role ?? ''}
                    onChange={e => set('author', { ...(form.author ?? { name: '', role: '' }), role: e.target.value })}
                    className="input-base"
                  />
                </Field>
              </div>
            </div>

            {/* Related slugs */}
            <Field label="Related Blog Slugs (comma-separated)">
              <input
                value={(form.relatedSlugs ?? []).join(', ')}
                onChange={e => set('relatedSlugs', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="slug-one, slug-two"
                className={cn(IB, 'font-mono text-[12px]')}
              />
            </Field>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-hairline bg-paper-elevated px-6 py-4 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? 'Create Blog' : 'Save Changes'}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            {deleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        )}
        <button onClick={onClose} className="rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-hairline transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</label>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const [blogs,   setBlogs]   = useState<AdminBlogSummary[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AdminBlogAnalytics | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search,       setSearch]       = useState('')
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [editBlog,     setEditBlog]     = useState<AdminBlogDetail | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [res, analyticsRes] = await Promise.all([
        adminApi.blog.list({ status: statusFilter || undefined, q: search || undefined, page: p, limit: 15 }),
        p === 1 ? adminApi.blog.analytics() : Promise.resolve(null),
      ])
      setBlogs(res.blogs)
      setTotal(res.total)
      setPage(res.page)
      setPages(res.pages)
      if (analyticsRes) setAnalytics(analyticsRes)
    } catch {
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { load(1) }, [load])

  async function handlePublish(id: string, currentStatus: string) {
    setActionLoading(id)
    try {
      const updated = currentStatus === 'published'
        ? await adminApi.blog.unpublish(id)
        : await adminApi.blog.publish(id)
      setBlogs(prev => prev.map(b => b._id === id ? { ...b, status: updated.status } : b))
      toast.success(updated.status === 'published' ? 'Published!' : 'Unpublished')
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDuplicate(id: string) {
    setActionLoading(id + '-dup')
    try {
      const duped = await adminApi.blog.duplicate(id)
      setBlogs(prev => [{ ...duped }, ...prev])
      setTotal(t => t + 1)
      toast.success('Duplicated! Edit the new draft.')
    } catch {
      toast.error('Failed to duplicate')
    } finally {
      setActionLoading(null)
    }
  }

  async function openEdit(blog: AdminBlogSummary) {
    try {
      const detail = await adminApi.blog.get(blog._id)
      setEditBlog(detail)
      setDrawerOpen(true)
    } catch {
      toast.error('Failed to load blog')
    }
  }

  function openNew() {
    setEditBlog(null)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setEditBlog(null)
  }

  function handleSaved(saved: AdminBlogDetail) {
    setBlogs(prev => {
      const idx = prev.findIndex(b => b._id === saved._id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    if (!blogs.find(b => b._id === saved._id)) {
      setTotal(t => t + 1)
    }
    load(1)
  }

  function handleDeleted(id: string) {
    setBlogs(prev => prev.filter(b => b._id !== id))
    setTotal(t => t - 1)
  }

  const FILTERS = [
    { value: '',          label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft',     label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-hairline bg-paper-elevated px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">Blog Management</h1>
            <p className="mt-0.5 text-xs text-ink-faint">Create, edit, publish, and analyze blog posts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(1)} className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New Blog
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Analytics cards */}
        {analytics && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            <StatCard label="Total"     value={analytics.totalBlogs}     Icon={BookOpen}   accent="text-brand"       bg="bg-brand-tint"   />
            <StatCard label="Published" value={analytics.publishedBlogs} Icon={Globe}      accent="text-emerald-600" bg="bg-emerald-50"   />
            <StatCard label="Drafts"    value={analytics.draftBlogs}     Icon={FileEdit}   accent="text-amber-600"   bg="bg-amber-50"     />
            <StatCard label="Views"     value={analytics.totalViews.toLocaleString()} Icon={Eye} accent="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Likes"     value={analytics.totalLikes}     Icon={ThumbsUp}   accent="text-rose-600"    bg="bg-rose-50"      />
            <StatCard label="Dislikes"  value={analytics.totalDislikes}  Icon={ThumbsDown} accent="text-slate-600"   bg="bg-slate-50"     />
            <StatCard label="Comments"  value={analytics.totalComments}  Icon={MessageCircle} accent="text-purple-600" bg="bg-purple-50" />
          </div>
        )}

        {/* Top blogs */}
        {analytics?.topBlogs && analytics.topBlogs.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-brand" />
              <p className="text-sm font-semibold text-ink">Top Performing Blogs</p>
            </div>
            <div className="space-y-2">
              {analytics.topBlogs.slice(0, 5).map((b, i) => (
                <div key={b._id} className="flex items-center gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 font-mono text-[10px] font-bold text-brand">
                    {i + 1}
                  </span>
                  <p className="flex-1 truncate text-sm text-ink">{b.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-faint">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {b.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {b.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search blogs…"
              className="w-full rounded-lg border border-hairline bg-paper py-2 pl-8 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>
          <div className="flex gap-1.5">
            <Filter className="h-4 w-4 text-ink-faint self-center" />
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-medium transition-all',
                  statusFilter === f.value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-hairline bg-paper text-ink-muted hover:border-brand/30 hover:text-brand',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-hairline" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Rss className="mb-3 h-10 w-10 text-ink-faint/30" />
            <p className="text-sm font-semibold text-ink">No blog posts found</p>
            <p className="mt-1 text-xs text-ink-faint">Create a new post or adjust the filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map(blog => (
              <motion.div
                key={blog._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center gap-4 rounded-2xl border border-hairline bg-white px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Status indicator */}
                <div className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  blog.status === 'published' ? 'bg-emerald-400' : blog.status === 'scheduled' ? 'bg-blue-400' : 'bg-amber-400',
                )} />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink truncate">{blog.title}</p>
                    {blog.isFeatured && (
                      <span className="flex items-center gap-0.5 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
                        <Star className="h-2 w-2" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <StatusBadge status={blog.status} />
                    {blog.category && (
                      <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
                        <Tag className="h-2.5 w-2.5" /> {blog.category}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
                      <Clock className="h-2.5 w-2.5" /> {blog.readingTime} min
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
                      <Eye className="h-2.5 w-2.5" /> {blog.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-ink-faint">
                      <ThumbsUp className="h-2.5 w-2.5" /> {blog.likes}
                    </span>
                    <span className="text-[10px] text-ink-faint">{blog.publishedAt ? fmtDate(blog.publishedAt) : `Draft - ${timeAgo(blog.createdAt)}`}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint/50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="View live"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => openEdit(blog)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint/50 hover:bg-brand/10 hover:text-brand transition-colors"
                    title="Edit"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handlePublish(blog._id, blog.status)}
                    disabled={actionLoading === blog._id}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      blog.status === 'published'
                        ? 'text-ink-faint/50 hover:bg-amber-50 hover:text-amber-600'
                        : 'text-ink-faint/50 hover:bg-emerald-50 hover:text-emerald-600',
                    )}
                    title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {actionLoading === blog._id
                      ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      : blog.status === 'published'
                        ? <EyeOff className="h-3.5 w-3.5" />
                        : <Globe className="h-3.5 w-3.5" />
                    }
                  </button>
                  <button
                    onClick={() => handleDuplicate(blog._id)}
                    disabled={actionLoading === blog._id + '-dup'}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint/50 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    title="Duplicate"
                  >
                    {actionLoading === blog._id + '-dup'
                      ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      : <Copy className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-ink-faint">{total} total · page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= pages}
                className="flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Blog editor drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
              onClick={closeDrawer}
            />
            <BlogDrawer
              blog={editBlog}
              onClose={closeDrawer}
              onSaved={handleSaved}
              onDelete={handleDeleted}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
