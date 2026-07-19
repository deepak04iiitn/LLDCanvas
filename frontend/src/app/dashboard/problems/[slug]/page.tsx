'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Play, ExternalLink,
  Lightbulb, Lock, ChevronDown, ChevronUp, RefreshCw,
  Users, CheckCheck, AlertTriangle, MessageSquare, ThumbsUp,
  ChevronRight, HelpCircle, Layers, Code2, Plus, Trash2, Send, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useSession } from '@/lib/auth'
import { AppShell } from '@/components/dashboard/AppShell'
import { api } from '@/lib/api'
import type { ProblemDetail, UserSolution, ProblemPost, PostReply } from '@/types'
import { cn } from '@/lib/utils'
import { usePlan } from '@/hooks/usePlan'
import { UpgradeGate } from '@/components/billing/UpgradeGate'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   dot: 'bg-amber-400'   },
  hard:   { label: 'Hard',   color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200',     dot: 'bg-red-400'     },
}

const POST_TYPES = [
  { value: 'question',   label: 'Question',         Icon: HelpCircle,    color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200'   },
  { value: 'discussion', label: 'Discussion',        Icon: MessageSquare, color: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-200'    },
  { value: 'solution',   label: 'Solution Approach', Icon: Lightbulb,     color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
] as const

type PostType = 'question' | 'discussion' | 'solution'

const LANGUAGES = ['Python','JavaScript','TypeScript','Java','C++','C','C#','Go','Rust','Ruby','PHP','Swift','Kotlin','Other']

function timeAgo(d: string) {
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d }
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const m = DIFF_META[difficulty]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ring-1', m.bg, m.color, m.ring)}>
      <span className={cn('h-2 w-2 rounded-full', m.dot)} />
      {m.label}
    </span>
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

function Avatar({ name, image, size = 8 }: { name: string; image: string | null; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  if (image) return <img src={image} alt={name} className={`h-${size} w-${size} shrink-0 rounded-full object-cover`} />
  return (
    <div className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full bg-brand-tint font-mono text-[11px] font-bold text-brand`}>
      {initials}
    </div>
  )
}

// ─── Hints panel ─────────────────────────────────────────────────────────────

const HINT_STORAGE_KEY = (slug: string) => `lld_hints_${slug}`

function HintsPanel({ slug, hints }: { slug: string; hints: string[] }) {
  const storageKey = HINT_STORAGE_KEY(slug)
  const [revealed, setRevealed] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)

  function revealHint(i: number) {
    const next = [...new Set([...revealed, i])]
    setRevealed(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    setConfirmIndex(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
          Hints — {revealed.length}/3 revealed
        </span>
      </div>
      <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-paper-elevated">
        {hints.map((hint, i) => {
          const isRevealed = revealed.includes(i)
          return (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold',
                  isRevealed ? 'bg-amber-100 text-amber-700' : 'bg-hairline text-ink-faint')}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {isRevealed ? (
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm leading-relaxed text-ink-muted">{hint}</motion.p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink-faint">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs">Hint {i + 1} is locked</span>
                      </div>
                      {confirmIndex === i ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-faint">Reveal? (hints reduce the challenge)</span>
                          <button onClick={() => revealHint(i)}
                            className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white transition-all hover:bg-amber-600">
                            Yes, reveal
                          </button>
                          <button onClick={() => setConfirmIndex(null)}
                            className="rounded-lg border border-hairline px-3 py-1 text-[11px] text-ink-muted transition-all hover:bg-hairline">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmIndex(i)}
                          className="flex items-center gap-1.5 text-xs font-medium text-amber-600 transition-colors hover:text-amber-700">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Reveal hint {i + 1}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Requirements section ─────────────────────────────────────────────────────

function RequirementsSection({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', accent)} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">{title}</span>
          <span className={cn('rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold',
            accent === 'bg-brand' ? 'bg-brand-tint text-brand' : 'bg-hairline text-ink-faint')}>
            {items.length}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-ink-faint" /> : <ChevronDown className="h-4 w-4 text-ink-faint" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden border-t border-hairline px-5 pb-4">
            {items.map((req, i) => (
              <li key={i} className="flex items-start gap-3 pt-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-hairline font-mono text-[9px] font-bold text-ink-faint">{i + 1}</span>
                <span className="text-sm leading-relaxed text-ink-muted">{req}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Compose form ─────────────────────────────────────────────────────────────

function ComposeForm({ slug, onCreated, onCancel }: {
  slug: string; onCreated: (p: ProblemPost) => void; onCancel: () => void
}) {
  const [type,       setType]       = useState<PostType>('discussion')
  const [title,      setTitle]      = useState('')
  const [content,    setContent]    = useState('')
  const [code,       setCode]       = useState('')
  const [codeLang,   setCodeLang]   = useState('Python')
  const [showCode,   setShowCode]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  async function submit() {
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return }
    setSubmitting(true); setError('')
    try {
      const { post } = await api.problems.posts.create(slug, { title, content, type, code: showCode ? code : undefined, codeLanguage: showCode ? codeLang : undefined })
      onCreated(post)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to post') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="rounded-xl border border-brand/20 bg-paper-elevated p-5 shadow-sm">
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint">New Post</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {POST_TYPES.map(t => (
          <button key={t.value} onClick={() => setType(t.value)}
            className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition',
              type === t.value ? `${t.bg} ${t.color} border-transparent ring-1 ${t.ring}` : 'border-hairline text-ink-faint hover:bg-hairline')}>
            <t.Icon className="h-3 w-3" />{t.label}
          </button>
        ))}
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title — e.g. How do I model a Rate Limiter?"
        className="mb-2 w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your question, approach, or discussion…" rows={4}
        className="mb-2 w-full resize-none rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
      <button onClick={() => setShowCode(v => !v)}
        className={cn('mb-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition',
          showCode ? 'border-brand/30 bg-brand-tint text-brand' : 'border-hairline text-ink-faint hover:bg-hairline')}>
        <Code2 className="h-3 w-3" />{showCode ? 'Remove code' : 'Add code snippet'}
      </button>
      <AnimatePresence>
        {showCode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2 overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="rounded-md border border-hairline bg-paper px-2 py-1 text-[11px] outline-none">
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste code here…" rows={5}
              className="w-full resize-y rounded-lg border border-hairline bg-[#FAFAF9] px-3 py-2 font-mono text-xs outline-none focus:border-brand" spellCheck={false} />
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-faint hover:bg-hairline">Cancel</button>
        <button onClick={submit} disabled={submitting || !title.trim() || !content.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-50">
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Post
        </button>
      </div>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, slug, currentUserId, onUpvote, onDelete, onReplyAdded }: {
  post: ProblemPost; slug: string; currentUserId: string
  onUpvote: (id: string) => void
  onDelete: (id: string) => void
  onReplyAdded: (postId: string, r: PostReply) => void
}) {
  const [expanded,      setExpanded]      = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies,       setReplies]       = useState<PostReply[]>(post.replies ?? [])
  const [replyContent,  setReplyContent]  = useState('')
  const [replyCode,     setReplyCode]     = useState('')
  const [replyLang,     setReplyLang]     = useState('Python')
  const [showReplyCode, setShowReplyCode] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [upvoting,      setUpvoting]      = useState(false)

  async function handleUpvote() {
    if (upvoting) return; setUpvoting(true)
    try { await onUpvote(post._id) } finally { setUpvoting(false) }
  }

  async function submitReply() {
    if (!replyContent.trim()) return; setReplySubmitting(true)
    try {
      const { reply } = await api.problems.posts.reply(slug, post._id, { content: replyContent, code: showReplyCode ? replyCode : undefined, codeLanguage: showReplyCode ? replyLang : undefined })
      setReplies(prev => [...prev, reply]); onReplyAdded(post._id, reply)
      setReplyContent(''); setReplyCode(''); setShowReplyForm(false)
    } catch { toast.error('Could not post reply') }
    finally { setReplySubmitting(false) }
  }

  return (
    <div className={cn('rounded-2xl border bg-paper-elevated shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all',
      expanded ? 'border-brand/20' : 'border-hairline hover:border-hairline-strong hover:shadow-md')}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={post.authorName} image={post.authorImage} size={9} />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{post.authorName}</span>
              {post.isOwn && <span className="rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[9px] font-bold text-brand">You</span>}
              <TypeBadge type={post.type} />
              <span className="ml-auto flex items-center gap-1 text-[11px] text-ink-faint">
                <Clock className="h-3 w-3" />{timeAgo(post.createdAt)}
              </span>
            </div>
            <p className="text-base font-semibold text-ink leading-snug">{post.title}</p>
          </div>
        </div>

        <p className={cn('mt-3 text-sm leading-relaxed text-ink-muted', !expanded && 'line-clamp-4')}>
          {post.content}
        </p>

        {post.code && expanded && (
          <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-[#FAFAF9]">
            <div className="flex items-center gap-2 border-b border-hairline bg-hairline/40 px-4 py-2">
              <Code2 className="h-3.5 w-3.5 text-ink-faint" />
              <span className="font-mono text-[10px] text-ink-faint">{post.codeLanguage ?? 'Code'}</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink">{post.code}</pre>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-hairline px-5 py-2.5">
        <button onClick={handleUpvote} disabled={upvoting}
          className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition',
            post.hasUpvoted ? 'bg-brand-tint text-brand' : 'text-ink-faint hover:bg-hairline hover:text-ink')}>
          <ThumbsUp className="h-3.5 w-3.5" />{post.upvoteCount}
        </button>

        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-ink-faint transition hover:bg-hairline hover:text-ink">
          <MessageSquare className="h-3.5 w-3.5" />{replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {!expanded && (post.content.length > 280 || post.code) && (
          <button onClick={() => setExpanded(true)} className="ml-auto text-[11px] font-medium text-brand hover:underline">Read more</button>
        )}

        {post.isOwn && (
          <button onClick={() => onDelete(post._id)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-red-50 hover:text-red-500 transition"
            title="Delete post">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-hairline px-5 pb-5 pt-4 space-y-4">
              {replies.map(r => (
                <div key={r._id} className="flex gap-3">
                  <Avatar name={r.authorName} image={r.authorImage} size={7} />
                  <div className="min-w-0 flex-1 rounded-xl bg-paper p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-ink">{r.authorName}</span>
                      {r.authorId === currentUserId && <span className="rounded-full bg-brand-tint px-1 py-0.5 font-mono text-[8px] font-bold text-brand">You</span>}
                      <span className="text-[10px] text-ink-faint">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-muted">{r.content}</p>
                    {r.code && (
                      <div className="mt-2 overflow-hidden rounded-lg border border-hairline bg-[#FAFAF9]">
                        <div className="border-b border-hairline bg-hairline/40 px-2.5 py-1 font-mono text-[9px] text-ink-faint">{r.codeLanguage ?? 'Code'}</div>
                        <pre className="overflow-x-auto p-2.5 font-mono text-[11px] text-ink">{r.code}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!showReplyForm ? (
                <button onClick={() => setShowReplyForm(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink-faint hover:bg-hairline hover:text-ink transition">
                  <MessageSquare className="h-3.5 w-3.5" /> Reply
                </button>
              ) : (
                <div className="rounded-xl border border-hairline bg-paper p-3 space-y-2">
                  <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Write a reply…" rows={3}
                    className="w-full resize-none rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-xs outline-none focus:border-brand" />
                  <button onClick={() => setShowReplyCode(v => !v)}
                    className={cn('flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium',
                      showReplyCode ? 'border-brand/30 bg-brand-tint text-brand' : 'border-hairline text-ink-faint')}>
                    <Code2 className="h-2.5 w-2.5" />{showReplyCode ? 'Remove code' : '+ Code'}
                  </button>
                  {showReplyCode && (
                    <div>
                      <select value={replyLang} onChange={e => setReplyLang(e.target.value)} className="mb-1 rounded border border-hairline bg-paper px-1.5 py-0.5 text-[10px]">
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                      <textarea value={replyCode} onChange={e => setReplyCode(e.target.value)} placeholder="Code…" rows={4}
                        className="w-full resize-y rounded-lg border border-hairline bg-[#FAFAF9] px-2.5 py-1.5 font-mono text-[11px] outline-none" spellCheck={false} />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowReplyForm(false)} className="rounded-md px-2.5 py-1 text-[11px] text-ink-faint hover:bg-hairline">Cancel</button>
                    <button onClick={submitReply} disabled={replySubmitting || !replyContent.trim()}
                      className="flex items-center gap-1 rounded-md bg-brand px-3 py-1 text-[11px] font-semibold text-brand-foreground disabled:opacity-50">
                      {replySubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'requirements' | 'community'

export default function ProblemDetailPage() {
  const { slug }    = useParams<{ slug: string }>()
  const router      = useRouter()
  const { data: session } = useSession()
  const currentUserId     = session?.user?.id ?? ''
  const { isFree } = usePlan()

  const [problem,         setProblem]         = useState<ProblemDetail | null>(null)
  const [hints,           setHints]           = useState<string[]>([])
  const [mySolution,      setMySolution]      = useState<UserSolution | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [loading,         setLoading]         = useState(true)
  const [tab,             setTab]             = useState<Tab>('requirements')
  const [starting,        setStarting]        = useState(false)
  const [submitting,      setSubmitting]      = useState(false)

  // Community discussions
  const [posts,       setPosts]       = useState<ProblemPost[]>([])
  const [postTotal,   setPostTotal]   = useState(0)
  const [postPage,    setPostPage]    = useState(1)
  const [postPages,   setPostPages]   = useState(1)
  const [postLoading, setPostLoading] = useState(false)
  const [postSort,    setPostSort]    = useState<'newest' | 'oldest'>('newest')
  const [postType,    setPostType]    = useState('')
  const [composing,   setComposing]   = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([api.problems.get(slug), api.problems.hints(slug)])
      .then(([detail, { hints: h }]) => {
        setProblem(detail.problem)
        setMySolution(detail.mySolution)
        setSubmissionCount(detail.submissionCount)
        setHints(h)
      })
      .catch(() => toast.error('Could not load problem'))
      .finally(() => setLoading(false))
  }, [slug])

  const loadPosts = useCallback(async (page = 1) => {
    if (!slug) return
    setPostLoading(true)
    try {
      const data = await api.problems.posts.list(slug, { page, sort: postSort, type: postType || undefined })
      setPosts(data.posts); setPostTotal(data.total); setPostPage(data.page); setPostPages(data.totalPages)
    } catch { toast.error('Could not load discussions') }
    finally { setPostLoading(false) }
  }, [slug, postSort, postType])

  useEffect(() => {
    if (tab === 'community') loadPosts(1)
  }, [tab, postSort, postType]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    if (!slug) return
    setStarting(true)
    try { const { diagramId } = await api.problems.start(slug); router.push(`/editor/${diagramId}?problem=${slug}`) }
    catch { toast.error('Could not start session') }
    finally { setStarting(false) }
  }

  async function handleSubmit() {
    if (!slug) return
    setSubmitting(true)
    try {
      const { solution } = await api.problems.submit(slug)
      setMySolution(solution); setSubmissionCount(c => c + 1)
      toast.success('Solution submitted! It\'s now visible to others.', { icon: '🎉' })
    } catch { toast.error('Could not submit solution') }
    finally { setSubmitting(false) }
  }

  async function handleUpvote(postId: string) {
    try {
      const { upvoteCount, hasUpvoted } = await api.problems.posts.upvote(slug, postId)
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, upvoteCount, hasUpvoted } : p))
    } catch { /* no-op */ }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post permanently?')) return
    try {
      await api.problems.posts.deletePost(slug, postId)
      setPosts(prev => prev.filter(p => p._id !== postId)); setPostTotal(t => t - 1)
    } catch { toast.error('Could not delete post') }
  }

  function handleReplyAdded(postId: string, reply: PostReply) {
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, replyCount: p.replyCount + 1, replies: [...p.replies, reply] } : p))
  }

  function handlePostCreated(post: ProblemPost) {
    setPosts(prev => [post, ...prev]); setPostTotal(t => t + 1); setComposing(false)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-ink-faint" />
        </div>
      </AppShell>
    )
  }

  if (!problem) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-ink-faint">Problem not found.</p>
          <button onClick={() => router.push('/dashboard/problems')}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-brand-foreground">
            Back to Problems
          </button>
        </div>
      </AppShell>
    )
  }

  const isSolved    = mySolution?.status === 'submitted'
  const isInProgress = mySolution?.status === 'in_progress'

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">

          {/* Back */}
          <button onClick={() => router.push('/dashboard/problems')}
            className="mb-6 flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> All Problems
          </button>

          {/* Header card */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span className="rounded-md border border-hairline bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-faint">{problem.category}</span>
                    {isSolved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.5 py-0.5 font-mono text-[10px] font-bold text-brand">
                        <CheckCircle2 className="h-3 w-3" /> Solved
                      </span>
                    )}
                  </div>
                  <h1 className="font-serif text-2xl font-medium text-ink">{problem.title}</h1>
                  <p className="text-sm leading-relaxed text-ink-faint">{problem.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {problem.companies.map(c => (
                      <span key={c} className="rounded-md border border-hairline bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-faint">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {problem.locked ? (
                    <Link href="/pricing"
                      className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:opacity-90">
                      <Lock className="h-4 w-4" /> Upgrade to Practice
                    </Link>
                  ) : !mySolution && (
                    <button onClick={handleStart} disabled={starting}
                      className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:opacity-90 disabled:opacity-50">
                      {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Start Practicing
                    </button>
                  )}
                  {isInProgress && (
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => router.push(`/editor/${mySolution.diagramId}?problem=${slug}`)}
                        className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:opacity-90">
                        <ExternalLink className="h-4 w-4" /> Resume in Editor
                      </button>
                      <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50">
                        {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                        Mark as Complete
                      </button>
                    </div>
                  )}
                  {isSolved && (
                    <button onClick={() => router.push(`/editor/${mySolution.diagramId}?problem=${slug}`)}
                      className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand-tint px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand/10">
                      <ExternalLink className="h-4 w-4" /> View My Solution
                    </button>
                  )}
                  <p className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                    <Users className="h-3.5 w-3.5" />
                    {submissionCount} submitted solution{submissionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-hairline bg-paper p-1">
            {(['requirements', 'community'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium capitalize transition-all',
                  tab === t ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink')}>
                {t === 'requirements' ? 'Requirements & Hints' : (
                  <span className="flex items-center gap-2">
                    Community Discussion
                    <span className={cn('rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold',
                      tab === 'community' ? 'bg-white/20 text-white' : 'bg-hairline text-ink-faint')}>
                      {postTotal}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Requirements tab */}
          {tab === 'requirements' && problem.locked ? (
            <motion.div key="requirements-locked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <UpgradeGate
                feature="This problem's requirements"
                description="Upgrade to unlock the full functional & non-functional requirements, hints, and practice for this problem."
                variant="overlay"
              />
            </motion.div>
          ) : tab === 'requirements' && (
            <motion.div key="requirements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <RequirementsSection title="Functional Requirements" items={problem.functionalRequirements} accent="bg-brand" />
              <RequirementsSection title="Non-Functional Requirements" items={problem.nonFunctionalRequirements} accent="bg-indigo-400" />
              {hints.length > 0 && (
                isFree ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
                    <Lock className="h-6 w-6 text-amber-500" />
                    <div>
                      <p className="font-semibold text-amber-800">Hints require Pro</p>
                      <p className="mt-0.5 text-xs text-amber-700">Upgrade to unlock hints for this problem.</p>
                    </div>
                    <Link href="/pricing" className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
                      Upgrade to Pro <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  <HintsPanel slug={slug} hints={hints} />
                )
              )}
            </motion.div>
          )}

          {/* Community Discussion tab */}
          {tab === 'community' && isFree && (
            <motion.div key="community-locked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 rounded-2xl border border-brand/20 bg-brand/5 px-8 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10">
                <Lock className="h-7 w-7 text-brand" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">Community Discussions</p>
                <p className="mt-1 text-sm text-ink-muted">View and participate in community Q&amp;A and solution discussions. Requires Pro or higher.</p>
              </div>
              <Link href="/pricing" className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-colors">
                Upgrade to Pro <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
          {tab === 'community' && !isFree && (
            <motion.div key="community" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Sort */}
                <div className="flex gap-0.5 rounded-xl border border-hairline bg-paper p-1">
                  {(['newest', 'oldest'] as const).map(s => (
                    <button key={s} onClick={() => setPostSort(s)}
                      className={cn('rounded-lg px-3 py-1.5 font-mono text-[11px] font-medium capitalize transition-all',
                        postSort === s ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink')}>
                      {s}
                    </button>
                  ))}
                </div>

                {/* Type filter */}
                <div className="flex gap-0.5 rounded-xl border border-hairline bg-paper p-1">
                  {['', 'question', 'discussion', 'solution'].map(t => (
                    <button key={t} onClick={() => setPostType(t)}
                      className={cn('rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-medium capitalize transition-all',
                        postType === t ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink')}>
                      {t || 'All'}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-ink-faint">{postTotal} post{postTotal !== 1 ? 's' : ''}</p>

                <button onClick={() => setComposing(v => !v)}
                  className={cn('ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                    composing ? 'bg-hairline text-ink' : 'bg-brand text-brand-foreground hover:opacity-90')}>
                  <Plus className="h-4 w-4" /> Post
                </button>
              </div>

              {/* Compose */}
              <AnimatePresence>
                {composing && (
                  <ComposeForm slug={slug} onCreated={handlePostCreated} onCancel={() => setComposing(false)} />
                )}
              </AnimatePresence>

              {postLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-hairline" />)}
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-paper-elevated py-20 text-center">
                  <MessageSquare className="mb-3 h-10 w-10 text-ink-faint/30" />
                  <p className="text-sm font-semibold text-ink">No discussions yet</p>
                  <p className="mt-1 text-xs text-ink-faint">Be the first to ask a question or share an approach!</p>
                  <button onClick={() => setComposing(true)}
                    className="mt-5 flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
                    <Plus className="h-4 w-4" /> Start a discussion
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostCard key={post._id} post={post} slug={slug} currentUserId={currentUserId}
                      onUpvote={handleUpvote} onDelete={handleDelete} onReplyAdded={handleReplyAdded} />
                  ))}
                  {postPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button onClick={() => loadPosts(postPage - 1)} disabled={postPage <= 1}
                        className="rounded-xl border border-hairline-strong px-4 py-2 text-sm text-ink-muted hover:bg-hairline disabled:opacity-40">
                        Previous
                      </button>
                      <span className="font-mono text-xs text-ink-faint">{postPage} / {postPages}</span>
                      <button onClick={() => loadPosts(postPage + 1)} disabled={postPage >= postPages}
                        className="rounded-xl border border-hairline-strong px-4 py-2 text-sm text-ink-muted hover:bg-hairline disabled:opacity-40">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )} {/* end !isFree community */}

        </div>
      </div>
    </AppShell>
  )
}
