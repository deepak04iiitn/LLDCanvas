'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, GripVertical, MessageSquare, ThumbsUp, ChevronDown,
  ChevronRight, Send, Plus, Trash2, Code2, Loader2,
  HelpCircle, Lightbulb, Layers, Clock,
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useSession } from '@/lib/auth'
import { api } from '@/lib/api'
import type { ProblemPost, PostReply } from '@/types'
import { cn } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const POST_TYPES = [
  { value: 'question',   label: 'Question',          Icon: HelpCircle, color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200'   },
  { value: 'discussion', label: 'Discussion',         Icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50',    ring: 'ring-blue-200'    },
  { value: 'solution',   label: 'Solution Approach',  Icon: Lightbulb,  color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
] as const

type PostType = 'question' | 'discussion' | 'solution'

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Other',
]

function timeAgo(d: string) {
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d }
}

function Avatar({ name, image, size = 8 }: { name: string; image: string | null; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  if (image) return <img src={image} alt={name} className={`h-${size} w-${size} shrink-0 rounded-full object-cover`} />
  return (
    <div className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full bg-brand-tint font-mono text-[11px] font-bold text-brand`}>
      {initials}
    </div>
  )
}

function TypeBadge({ type }: { type: PostType }) {
  const t = POST_TYPES.find(p => p.value === type) ?? POST_TYPES[1]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', t.bg, t.color, t.ring)}>
      <t.Icon className="h-2.5 w-2.5" />
      {t.label}
    </span>
  )
}

// ─── Compose form ─────────────────────────────────────────────────────────────

function ComposeForm({
  slug, onCreated, onCancel,
}: { slug: string; onCreated: (post: ProblemPost) => void; onCancel: () => void }) {
  const [type,         setType]         = useState<PostType>('discussion')
  const [title,        setTitle]        = useState('')
  const [content,      setContent]      = useState('')
  const [code,         setCode]         = useState('')
  const [codeLang,     setCodeLang]     = useState('Python')
  const [showCode,     setShowCode]     = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState('')

  async function submit() {
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return }
    setSubmitting(true); setError('')
    try {
      const { post } = await api.problems.posts.create(slug, {
        title, content, type,
        code: showCode ? code : undefined,
        codeLanguage: showCode ? codeLang : undefined,
      })
      onCreated(post)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post')
    } finally { setSubmitting(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-brand/20 bg-paper-elevated p-4 shadow-sm"
    >
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">New Post</p>

      {/* Type selector */}
      <div className="mb-3 flex gap-1.5">
        {POST_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition',
              type === t.value
                ? `${t.bg} ${t.color} border-transparent ring-1 ${t.ring}`
                : 'border-hairline text-ink-faint hover:bg-hairline',
            )}
          >
            <t.Icon className="h-3 w-3" />{t.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title — e.g. How do I model a Rate Limiter?"
        className="mb-2 w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
      />

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Describe your question, approach, or discussion topic…"
        rows={4}
        className="mb-2 w-full resize-none rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
      />

      {/* Code toggle */}
      <button
        onClick={() => setShowCode(v => !v)}
        className={cn(
          'mb-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition',
          showCode ? 'border-brand/30 bg-brand-tint text-brand' : 'border-hairline text-ink-faint hover:bg-hairline',
        )}
      >
        <Code2 className="h-3 w-3" />
        {showCode ? 'Remove code' : 'Add code snippet'}
      </button>

      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <select
                value={codeLang}
                onChange={e => setCodeLang(e.target.value)}
                className="rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] outline-none"
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <span className="text-[10px] text-ink-faint">Language</span>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Paste your code here…"
              rows={5}
              className="w-full resize-y rounded-lg border border-hairline bg-[#FAFAF9] px-3 py-2 font-mono text-xs outline-none focus:border-brand"
              spellCheck={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-faint hover:bg-hairline"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Post
        </button>
      </div>
    </motion.div>
  )
}

// ─── Reply form ───────────────────────────────────────────────────────────────

function ReplyForm({
  slug, postId, onAdded, onCancel,
}: { slug: string; postId: string; onAdded: (r: PostReply) => void; onCancel: () => void }) {
  const [content,    setContent]    = useState('')
  const [code,       setCode]       = useState('')
  const [codeLang,   setCodeLang]   = useState('Python')
  const [showCode,   setShowCode]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const { reply } = await api.problems.posts.reply(slug, postId, {
        content,
        code: showCode ? code : undefined,
        codeLanguage: showCode ? codeLang : undefined,
      })
      onAdded(reply)
      setContent(''); setCode('')
    } catch { /* no-op */ }
    finally { setSubmitting(false) }
  }

  return (
    <div className="mt-3 rounded-lg border border-hairline bg-paper p-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a reply…"
        rows={3}
        className="mb-2 w-full resize-none rounded-md border border-hairline bg-paper-elevated px-2.5 py-2 text-xs outline-none focus:border-brand"
      />
      <button
        onClick={() => setShowCode(v => !v)}
        className={cn(
          'mb-2 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium transition',
          showCode ? 'border-brand/30 bg-brand-tint text-brand' : 'border-hairline text-ink-faint',
        )}
      >
        <Code2 className="h-2.5 w-2.5" /> {showCode ? 'Remove code' : '+ Code'}
      </button>
      <AnimatePresence>
        {showCode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2 overflow-hidden">
            <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="mb-1 rounded border border-hairline bg-paper px-1.5 py-0.5 text-[10px]">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Code…" rows={4}
              className="w-full resize-y rounded-md border border-hairline bg-[#FAFAF9] px-2 py-1 font-mono text-[11px] outline-none" spellCheck={false} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-md px-2.5 py-1 text-[11px] text-ink-faint hover:bg-hairline">Cancel</button>
        <button onClick={submit} disabled={submitting || !content.trim()}
          className="flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground disabled:opacity-50">
          {submitting ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Send className="h-2.5 w-2.5" />}
          Reply
        </button>
      </div>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post, slug, currentUserId,
  onUpvote, onDelete, onReplyAdded,
}: {
  post: ProblemPost
  slug: string
  currentUserId: string
  onUpvote: (postId: string) => void
  onDelete: (postId: string) => void
  onReplyAdded: (postId: string, reply: PostReply) => void
}) {
  const [expanded,     setExpanded]     = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies,       setReplies]       = useState<PostReply[]>(post.replies ?? [])
  const [upvoting,      setUpvoting]      = useState(false)

  async function handleUpvote() {
    if (upvoting) return
    setUpvoting(true)
    try { await onUpvote(post._id) } finally { setUpvoting(false) }
  }

  return (
    <div className={cn(
      'rounded-xl border bg-paper-elevated shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all',
      expanded ? 'border-brand/20' : 'border-hairline hover:border-hairline-strong hover:shadow-md',
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={post.authorName} image={post.authorImage} size={8} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink">{post.authorName}</span>
              {post.isOwn && (
                <span className="rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[9px] font-bold text-brand">You</span>
              )}
              <TypeBadge type={post.type} />
              <span className="flex items-center gap-0.5 text-[10px] text-ink-faint ml-auto">
                <Clock className="h-2.5 w-2.5" />{timeAgo(post.createdAt)}
              </span>
            </div>
            <p className="text-sm font-semibold text-ink leading-snug">{post.title}</p>
          </div>
        </div>

        {/* Content preview */}
        <p className={cn(
          'mt-2 text-xs leading-relaxed text-ink-muted',
          !expanded && 'line-clamp-3',
        )}>
          {post.content}
        </p>

        {/* Code block */}
        {post.code && expanded && (
          <div className="mt-3 overflow-hidden rounded-lg border border-hairline bg-[#FAFAF9]">
            <div className="flex items-center gap-2 border-b border-hairline bg-hairline/40 px-3 py-1.5">
              <Code2 className="h-3 w-3 text-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">{post.codeLanguage ?? 'Code'}</span>
            </div>
            <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-ink">
              {post.code}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-hairline px-4 py-2">
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition',
            post.hasUpvoted ? 'bg-brand-tint text-brand' : 'text-ink-faint hover:bg-hairline hover:text-ink',
          )}
        >
          <ThumbsUp className="h-3 w-3" />
          {post.upvoteCount}
        </button>

        {/* Replies */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-ink-faint transition hover:bg-hairline hover:text-ink"
        >
          <MessageSquare className="h-3 w-3" />
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {/* Expand / collapse content */}
        {!expanded && (post.content.length > 200 || post.code) && (
          <button
            onClick={() => setExpanded(true)}
            className="ml-auto text-[10px] font-medium text-brand hover:underline"
          >
            Read more
          </button>
        )}

        {/* Delete own post */}
        {post.isOwn && (
          <button
            onClick={() => onDelete(post._id)}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-ink-faint hover:bg-red-50 hover:text-red-500 transition"
            title="Delete post"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Replies section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-hairline px-4 pb-4 pt-3 space-y-3">
              {replies.map(r => (
                <div key={r._id} className="flex gap-2.5">
                  <Avatar name={r.authorName} image={r.authorImage} size={6} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-ink">{r.authorName}</span>
                      {r.authorId === currentUserId && (
                        <span className="rounded-full bg-brand-tint px-1 py-0.5 font-mono text-[8px] font-bold text-brand">You</span>
                      )}
                      <span className="text-[10px] text-ink-faint">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-muted">{r.content}</p>
                    {r.code && (
                      <div className="mt-2 overflow-hidden rounded-md border border-hairline bg-[#FAFAF9]">
                        <div className="border-b border-hairline bg-hairline/40 px-2.5 py-1 font-mono text-[9px] text-ink-faint">
                          {r.codeLanguage ?? 'Code'}
                        </div>
                        <pre className="overflow-x-auto p-2.5 font-mono text-[11px] leading-relaxed text-ink">{r.code}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!showReplyForm && (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[11px] font-medium text-ink-faint transition hover:bg-hairline hover:text-ink"
                >
                  <MessageSquare className="h-3 w-3" /> Reply
                </button>
              )}

              <AnimatePresence>
                {showReplyForm && (
                  <ReplyForm
                    slug={slug}
                    postId={post._id}
                    onAdded={r => { setReplies(prev => [...prev, r]); onReplyAdded(post._id, r); setShowReplyForm(false) }}
                    onCancel={() => setShowReplyForm(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface ProblemDiscussionPanelProps {
  open:     boolean
  onClose:  () => void
  slug:     string
}

export function ProblemDiscussionPanel({ open, onClose, slug }: ProblemDiscussionPanelProps) {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id ?? ''

  const [posts,       setPosts]       = useState<ProblemPost[]>([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(false)
  const [sort,        setSort]        = useState<'newest' | 'oldest'>('newest')
  const [typeFilter,  setTypeFilter]  = useState('')
  const [composing,   setComposing]   = useState(false)
  const [panelWidth,  setPanelWidth]  = useState(480)

  // Drag-resize
  const resizingRef = useRef(false)
  const startXRef   = useRef(0)
  const startWRef   = useRef(480)

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = true
    startXRef.current   = e.clientX
    startWRef.current   = panelWidth
    function onMove(ev: MouseEvent) {
      if (!resizingRef.current) return
      const next = Math.min(800, Math.max(320, startWRef.current + (startXRef.current - ev.clientX)))
      setPanelWidth(next)
    }
    function onUp() {
      resizingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [panelWidth])

  const load = useCallback(async (p = 1) => {
    if (!slug) return
    setLoading(true)
    try {
      const data = await api.problems.posts.list(slug, { page: p, sort, type: typeFilter || undefined })
      setPosts(data.posts)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch { /* no-op */ }
    finally { setLoading(false) }
  }, [slug, sort, typeFilter])

  useEffect(() => {
    if (open) load(1)
  }, [open, load])

  async function handleUpvote(postId: string) {
    try {
      const { upvoteCount, hasUpvoted } = await api.problems.posts.upvote(slug, postId)
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, upvoteCount, hasUpvoted, upvotes: hasUpvoted ? [...p.upvotes, currentUserId] : p.upvotes.filter(u => u !== currentUserId) } : p,
      ))
    } catch { /* no-op */ }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post permanently?')) return
    try {
      await api.problems.posts.deletePost(slug, postId)
      setPosts(prev => prev.filter(p => p._id !== postId))
      setTotal(t => t - 1)
    } catch { /* no-op */ }
  }

  function handleReplyAdded(postId: string, reply: PostReply) {
    setPosts(prev => prev.map(p =>
      p._id === postId ? { ...p, replyCount: p.replyCount + 1, replies: [...p.replies, reply] } : p,
    ))
  }

  function handlePostCreated(post: ProblemPost) {
    setPosts(prev => [post, ...prev])
    setTotal(t => t + 1)
    setComposing(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/10"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{ width: panelWidth }}
            className="absolute right-0 top-0 z-50 flex h-full flex-col border-l border-hairline bg-paper-elevated shadow-2xl"
          >
            {/* Drag handle */}
            <div
              onMouseDown={startResize}
              className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-brand/20 transition-colors z-10 group"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex h-12 w-1.5 items-center justify-center">
                <GripVertical className="h-4 w-4 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 border-b border-hairline px-4 py-3 shrink-0">
              <Layers className="h-4 w-4 text-brand shrink-0" />
              <span className="font-semibold text-sm text-ink">Community Discussion</span>
              <span className="rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand">{total}</span>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setComposing(v => !v)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
                    composing ? 'bg-hairline text-ink' : 'bg-brand text-brand-foreground hover:opacity-90',
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Post
                </button>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-hairline transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 border-b border-hairline px-4 py-2 shrink-0">
              {/* Sort */}
              <div className="flex gap-0.5 rounded-lg bg-hairline p-0.5">
                {(['newest', 'oldest'] as const).map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    className={cn('rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition',
                      sort === s ? 'bg-white text-ink shadow-sm' : 'text-ink-faint hover:text-ink')}
                  >{s}</button>
                ))}
              </div>

              {/* Type filter */}
              <div className="flex gap-0.5">
                {['', 'question', 'discussion', 'solution'].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={cn('rounded-md px-2 py-1 text-[10px] font-medium capitalize transition',
                      typeFilter === t
                        ? 'bg-brand-tint text-brand'
                        : 'text-ink-faint hover:bg-hairline hover:text-ink',
                    )}
                  >{t || 'All'}</button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {/* Compose form */}
              <AnimatePresence>
                {composing && (
                  <ComposeForm
                    slug={slug}
                    onCreated={handlePostCreated}
                    onCancel={() => setComposing(false)}
                  />
                )}
              </AnimatePresence>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
                </div>
              )}

              {!loading && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-hairline bg-paper py-16 text-center">
                  <MessageSquare className="mb-3 h-8 w-8 text-ink-faint/40" />
                  <p className="text-sm font-medium text-ink">No discussions yet</p>
                  <p className="mt-1 text-xs text-ink-faint">Be the first to post a question or approach!</p>
                  <button
                    onClick={() => setComposing(true)}
                    className="mt-4 flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" /> Start a discussion
                  </button>
                </div>
              )}

              {!loading && posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  slug={slug}
                  currentUserId={currentUserId}
                  onUpvote={handleUpvote}
                  onDelete={handleDelete}
                  onReplyAdded={handleReplyAdded}
                />
              ))}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button onClick={() => load(page - 1)} disabled={page <= 1}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                    Previous
                  </button>
                  <span className="font-mono text-xs text-ink-faint">{page} / {totalPages}</span>
                  <button onClick={() => load(page + 1)} disabled={page >= totalPages}
                    className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:bg-hairline disabled:opacity-40">
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
