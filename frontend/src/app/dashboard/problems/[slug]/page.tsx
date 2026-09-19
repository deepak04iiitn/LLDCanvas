'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  ExternalLink,
  Lightbulb,
  Lock,
  RefreshCw,
  Users,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  HelpCircle,
  Code2,
  Plus,
  Trash2,
  Send,
  Loader2,
  NotebookPen,
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
import { ProblemNotesSection } from '@/components/problems/ProblemNotesSection'

const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-700' },
  medium: { label: 'Medium', color: 'text-amber-700' },
  hard:   { label: 'Hard',   color: 'text-red-700' },
} as const

const POST_TYPES = [
  { value: 'question',   label: 'Question',   Icon: HelpCircle,    cls: 'text-amber-700' },
  { value: 'discussion', label: 'Discussion', Icon: MessageSquare, cls: 'text-ink-muted' },
  { value: 'solution',   label: 'Approach',   Icon: Lightbulb,     cls: 'text-brand' },
] as const

type PostType = 'question' | 'discussion' | 'solution'
type Section = 'brief' | 'hints' | 'notes' | 'discussion'

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Other',
]

function timeAgo(d: string) {
  try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d }
}

function Avatar({ name, image, size = 'sm' }: { name: string; image: string | null; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const dim = size === 'md' ? 'h-9 w-9 text-[11px]' : 'h-7 w-7 text-[10px]'
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={cn('shrink-0 rounded-full object-cover', dim)} />
  }
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-hairline font-mono font-bold text-ink-muted', dim)}>
      {initials}
    </div>
  )
}

const hintKey = (slug: string) => `lld_hints_${slug}`

function HintsList({ slug, hints }: { slug: string; hints: string[] }) {
  const key = hintKey(slug)
  const [revealed, setRevealed] = useState<number[]>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })
  const [confirm, setConfirm] = useState<number | null>(null)

  function reveal(i: number) {
    const next = [...new Set([...revealed, i])]
    setRevealed(next)
    localStorage.setItem(key, JSON.stringify(next))
    setConfirm(null)
  }

  return (
    <div className="space-y-1">
      <p className="mb-4 text-sm text-ink-faint">
        Unlock only when stuck · {revealed.length} of {hints.length} revealed
      </p>
      {hints.map((hint, i) => {
        const open = revealed.includes(i)
        return (
          <div
            key={i}
            className={cn(
              'border-b border-hairline py-4 last:border-0',
              !open && 'opacity-80',
            )}
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 w-6 shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                {open ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[15px] leading-relaxed text-ink"
                  >
                    {hint}
                  </motion.p>
                ) : confirm === i ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-ink-muted">Reveal hint {i + 1}?</p>
                    <button
                      type="button"
                      onClick={() => reveal(i)}
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      Reveal
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm(null)}
                      className="text-sm text-ink-faint hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirm(i)}
                    className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-brand"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Locked hint — unlock
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ComposeForm({
  slug,
  onCreated,
  onCancel,
}: {
  slug: string
  onCreated: (p: ProblemPost) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<PostType>('discussion')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [code, setCode] = useState('')
  const [codeLang, setCodeLang] = useState('Python')
  const [showCode, setShowCode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { post } = await api.problems.posts.create(slug, {
        title, content, type,
        code: showCode ? code : undefined,
        codeLanguage: showCode ? codeLang : undefined,
      })
      onCreated(post)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-hairline bg-paper-elevated px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap gap-3">
        {POST_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
              type === t.value ? t.cls : 'text-ink-faint hover:text-ink-muted',
            )}
          >
            <t.Icon className="h-3 w-3" /> {t.label}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="mb-2 w-full border-0 border-b border-hairline bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-ink-faint focus:border-brand"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your question or approach…"
        rows={3}
        className="mb-2 w-full resize-none border-0 bg-transparent text-sm leading-relaxed outline-none placeholder:text-ink-faint"
      />
      <button
        type="button"
        onClick={() => setShowCode(v => !v)}
        className="mb-2 inline-flex items-center gap-1 text-xs text-ink-faint hover:text-brand"
      >
        <Code2 className="h-3 w-3" /> {showCode ? 'Remove code' : 'Add code'}
      </button>
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 overflow-hidden"
          >
            <select
              value={codeLang}
              onChange={e => setCodeLang(e.target.value)}
              className="mb-1.5 border border-hairline bg-paper px-2 py-1 text-xs"
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Paste code…"
              rows={4}
              className="w-full border border-hairline bg-paper px-3 py-2 font-mono text-xs outline-none focus:border-brand"
              spellCheck={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="text-xs text-ink-faint hover:text-ink">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="inline-flex items-center gap-1.5 bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Post
        </button>
      </div>
    </div>
  )
}

function PostRow({
  post,
  slug,
  onUpvote,
  onDelete,
  onReplyAdded,
}: {
  post: ProblemPost
  slug: string
  onUpvote: (id: string) => void
  onDelete: (id: string) => void
  onReplyAdded: (postId: string, r: PostReply) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replies, setReplies] = useState<PostReply[]>(post.replies ?? [])
  const [replyContent, setReplyContent] = useState('')
  const [replyCode, setReplyCode] = useState('')
  const [replyLang, setReplyLang] = useState('Python')
  const [showReplyCode, setShowReplyCode] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [upvoting, setUpvoting] = useState(false)
  const typeMeta = POST_TYPES.find(t => t.value === post.type) ?? POST_TYPES[1]

  async function handleUpvote() {
    if (upvoting) return
    setUpvoting(true)
    try { await onUpvote(post._id) } finally { setUpvoting(false) }
  }

  async function submitReply() {
    if (!replyContent.trim()) return
    setReplySubmitting(true)
    try {
      const { reply } = await api.problems.posts.reply(slug, post._id, {
        content: replyContent,
        code: showReplyCode ? replyCode : undefined,
        codeLanguage: showReplyCode ? replyLang : undefined,
      })
      setReplies(prev => [...prev, reply])
      onReplyAdded(post._id, reply)
      setReplyContent('')
      setReplyCode('')
      setShowReply(false)
    } catch {
      toast.error('Could not post reply')
    } finally {
      setReplySubmitting(false)
    }
  }

  return (
    <article className="border-b border-hairline py-5 last:border-0">
      <div className="flex gap-3">
        <Avatar name={post.authorName} image={post.authorImage} size="md" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-ink">{post.authorName}</span>
            {post.isOwn && (
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">You</span>
            )}
            <span className={cn('inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider', typeMeta.cls)}>
              <typeMeta.Icon className="h-2.5 w-2.5" /> {typeMeta.label}
            </span>
            <span className="text-[11px] text-ink-faint">{timeAgo(post.createdAt)}</span>
          </div>
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{post.title}</h3>
          <p className={cn('mt-1.5 text-sm leading-relaxed text-ink-muted', !expanded && 'line-clamp-3')}>
            {post.content}
          </p>
          {post.code && expanded && (
            <pre className="mt-3 overflow-x-auto border border-hairline bg-paper p-3 font-mono text-xs text-ink">
              {post.code}
            </pre>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 pl-12">
        <button
          type="button"
          onClick={handleUpvote}
          disabled={upvoting}
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-colors',
            post.hasUpvoted ? 'text-brand' : 'text-ink-faint hover:text-ink',
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" /> {post.upvoteCount}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-ink-faint hover:text-ink"
        >
          <MessageSquare className="h-3.5 w-3.5" /> {replies.length}
        </button>
        {!expanded && (post.content.length > 220 || post.code) && (
          <button type="button" onClick={() => setExpanded(true)} className="ml-auto text-xs font-medium text-brand">
            Read more
          </button>
        )}
        {post.isOwn && (
          <button
            type="button"
            onClick={() => onDelete(post._id)}
            className="ml-auto p-1.5 text-ink-faint hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-hairline pl-12 pt-4">
              {replies.map(r => (
                <div key={r._id} className="flex gap-2.5">
                  <Avatar name={r.authorName} image={r.authorImage} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink">{r.authorName}</span>
                      <span className="text-[10px] text-ink-faint">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-muted">{r.content}</p>
                    {r.code && (
                      <pre className="mt-2 overflow-x-auto border border-hairline bg-paper p-2 font-mono text-[11px]">
                        {r.code}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              {!showReply ? (
                <button
                  type="button"
                  onClick={() => setShowReply(true)}
                  className="text-xs font-medium text-ink-muted hover:text-brand"
                >
                  Reply…
                </button>
              ) : (
                <div className="space-y-2 border border-hairline bg-paper p-3">
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full resize-none border-0 bg-transparent text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowReplyCode(v => !v)}
                    className="text-[11px] text-ink-faint hover:text-brand"
                  >
                    {showReplyCode ? 'Remove code' : '+ Code'}
                  </button>
                  {showReplyCode && (
                    <>
                      <select
                        value={replyLang}
                        onChange={e => setReplyLang(e.target.value)}
                        className="border border-hairline bg-paper px-1.5 py-0.5 text-[10px]"
                      >
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                      <textarea
                        value={replyCode}
                        onChange={e => setReplyCode(e.target.value)}
                        rows={3}
                        className="w-full border border-hairline bg-paper px-2 py-1.5 font-mono text-[11px] outline-none"
                        spellCheck={false}
                      />
                    </>
                  )}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowReply(false)} className="text-[11px] text-ink-faint">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitReply}
                      disabled={replySubmitting || !replyContent.trim()}
                      className="inline-flex items-center gap-1 bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground disabled:opacity-50"
                    >
                      {replySubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id ?? ''
  const { isFree } = usePlan()

  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [hints, setHints] = useState<string[]>([])
  const [mySolution, setMySolution] = useState<UserSolution | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('brief')
  const [starting, setStarting] = useState(false)

  const [posts, setPosts] = useState<ProblemPost[]>([])
  const [postTotal, setPostTotal] = useState(0)
  const [postPage, setPostPage] = useState(1)
  const [postPages, setPostPages] = useState(1)
  const [postLoading, setPostLoading] = useState(false)
  const [postSort, setPostSort] = useState<'newest' | 'oldest'>('newest')
  const [postType, setPostType] = useState('')
  const [composing, setComposing] = useState(false)
  const [hasNotes, setHasNotes] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      api.problems.get(slug),
      api.problems.hints(slug),
      api.problems.getNotes(slug).catch(() => ({ notes: '' })),
    ])
      .then(([detail, { hints: h }, { notes: n }]) => {
        setProblem(detail.problem)
        setMySolution(detail.mySolution)
        setSubmissionCount(detail.submissionCount)
        setHints(h)
        setHasNotes(n.trim().length > 0)
      })
      .catch(() => toast.error('Could not load problem'))
      .finally(() => setLoading(false))
  }, [slug])

  const loadPosts = useCallback(async (page = 1) => {
    if (!slug) return
    setPostLoading(true)
    try {
      const data = await api.problems.posts.list(slug, { page, sort: postSort, type: postType || undefined })
      setPosts(data.posts)
      setPostTotal(data.total)
      setPostPage(data.page)
      setPostPages(data.totalPages)
    } catch {
      toast.error('Could not load discussions')
    } finally {
      setPostLoading(false)
    }
  }, [slug, postSort, postType])

  useEffect(() => {
    if (section === 'discussion') loadPosts(1)
  }, [section, postSort, postType]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    if (!slug) return
    setStarting(true)
    try {
      const { diagramId } = await api.problems.start(slug)
      router.push(`/editor/${diagramId}?problem=${slug}`)
    } catch {
      toast.error('Could not start session')
    } finally {
      setStarting(false)
    }
  }

  async function handleUpvote(postId: string) {
    try {
      const { upvoteCount, hasUpvoted } = await api.problems.posts.upvote(slug, postId)
      setPosts(prev => prev.map(p => (p._id === postId ? { ...p, upvoteCount, hasUpvoted } : p)))
    } catch { /* no-op */ }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post permanently?')) return
    try {
      await api.problems.posts.deletePost(slug, postId)
      setPosts(prev => prev.filter(p => p._id !== postId))
      setPostTotal(t => t - 1)
    } catch {
      toast.error('Could not delete post')
    }
  }

  function handleReplyAdded(postId: string, reply: PostReply) {
    setPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? { ...p, replyCount: p.replyCount + 1, replies: [...p.replies, reply] }
          : p,
      ),
    )
  }

  function handlePostCreated(post: ProblemPost) {
    setPosts(prev => [post, ...prev])
    setPostTotal(t => t + 1)
    setComposing(false)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        </div>
      </AppShell>
    )
  }

  if (!problem) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-8 w-8 text-ink-faint" />
          <p className="text-sm text-ink-faint">Problem not found.</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/problems')}
            className="bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
          >
            Back to Problems
          </button>
        </div>
      </AppShell>
    )
  }

  const isSolved = mySolution?.status === 'submitted'
  const isInProgress = mySolution?.status === 'in_progress'
  const dm = DIFF_META[problem.difficulty]

  const sections: { id: Section; label: string; count?: number; dot?: boolean }[] = [
    { id: 'brief', label: 'Brief' },
    { id: 'hints', label: 'Hints', count: hints.length || undefined },
    { id: 'notes', label: 'Notes', dot: hasNotes },
    { id: 'discussion', label: 'Discussion', count: postTotal || undefined },
  ]

  function PrimaryCta() {
    if (problem!.locked) {
      return (
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
        >
          <Lock className="h-4 w-4" /> Upgrade to practice
        </Link>
      )
    }
    if (isInProgress) {
      return (
        <button
          type="button"
          onClick={() => router.push(`/editor/${mySolution!.diagramId}?problem=${slug}`)}
          className="inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" /> Resume
        </button>
      )
    }
    if (isSolved) {
      return (
        <button
          type="button"
          onClick={() => router.push(`/editor/${mySolution!.diagramId}?problem=${slug}`)}
          className="inline-flex items-center gap-2 border border-brand/30 bg-brand-tint px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
        >
          <ExternalLink className="h-4 w-4" /> View solution
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={handleStart}
        disabled={starting}
        className="inline-flex items-center gap-2 bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        Start practicing
      </button>
    )
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden bg-paper">

        {/* Top bar */}
        <header className="shrink-0 border-b border-hairline bg-paper-elevated">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-3 sm:px-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard/problems')}
              className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Problems
            </button>
            <div className="ml-auto">
              <PrimaryCta />
            </div>
          </div>
        </header>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">

            {/* Masthead */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className={cn('font-mono text-[11px] font-semibold uppercase tracking-[0.14em]', dm.color)}>
                  {dm.label}
                </span>
                <span className="text-ink-faint/40">·</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  {problem.category}
                </span>
                {isSolved && (
                  <>
                    <span className="text-ink-faint/40">·</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
                      <CheckCircle2 className="h-3 w-3" /> Solved
                    </span>
                  </>
                )}
                {isInProgress && (
                  <>
                    <span className="text-ink-faint/40">·</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                      <Clock className="h-3 w-3" /> In progress
                    </span>
                  </>
                )}
              </div>

              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {problem.title}
              </h1>

              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                {problem.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {submissionCount} solution{submissionCount !== 1 ? 's' : ''}
                </span>
                {problem.companies.length > 0 && (
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    Asked at{' '}
                    <span className="font-medium text-ink-muted">
                      {problem.companies.join(', ')}
                    </span>
                  </span>
                )}
              </div>
            </motion.div>

            {/* Section tabs — underline */}
            <nav className="mt-10 flex gap-6 border-b border-hairline">
              {sections.map(s => {
                const active = section === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      'relative pb-3 text-sm font-medium transition-colors',
                      active ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {s.id === 'notes' && <NotebookPen className="h-3.5 w-3.5" />}
                      {s.label}
                      {s.dot && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-label="Has notes" />
                      )}
                      {s.count != null && s.count > 0 && (
                        <span className="font-mono text-[10px] text-ink-faint">{s.count}</span>
                      )}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="problemSectionLine"
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-brand"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Section body */}
            <div className="pt-8">
              <AnimatePresence mode="wait">
                {section === 'brief' && (
                  <motion.div
                    key="brief"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {problem.locked ? (
                      <UpgradeGate
                        feature="This problem's requirements"
                        description="Upgrade to unlock requirements, hints, and practice for this problem."
                        variant="overlay"
                      />
                    ) : (
                      <div className="grid gap-12 lg:grid-cols-2">
                        <div>
                          <h2 className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                            Functional · {problem.functionalRequirements.length}
                          </h2>
                          <ol className="space-y-4">
                            {problem.functionalRequirements.map((item, i) => (
                              <li key={i} className="flex gap-4">
                                <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-brand">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="text-[15px] leading-relaxed text-ink-muted">{item}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h2 className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                            Non-functional · {problem.nonFunctionalRequirements.length}
                          </h2>
                          <ol className="space-y-4">
                            {problem.nonFunctionalRequirements.map((item, i) => (
                              <li key={i} className="flex gap-4">
                                <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="text-[15px] leading-relaxed text-ink-muted">{item}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {section === 'hints' && (
                  <motion.div
                    key="hints"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {problem.locked || hints.length === 0 ? (
                      <p className="py-12 text-center text-sm text-ink-faint">No hints available.</p>
                    ) : isFree ? (
                      <div className="flex flex-col items-start gap-3 py-8">
                        <Lock className="h-4 w-4 text-ink-faint" />
                        <p className="text-sm font-medium text-ink">Hints are on Pro</p>
                        <p className="max-w-sm text-sm text-ink-faint">Upgrade to unlock progressive hints.</p>
                        <Link
                          href="/pricing"
                          className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                        >
                          Upgrade <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <HintsList slug={slug} hints={hints} />
                    )}
                  </motion.div>
                )}

                {section === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {problem.locked ? (
                      <UpgradeGate
                        feature="Private notes"
                        description="Upgrade to unlock this problem and keep private practice notes."
                        variant="overlay"
                      />
                    ) : (
                      <ProblemNotesSection slug={slug} onHasNotesChange={setHasNotes} />
                    )}
                  </motion.div>
                )}

                {section === 'discussion' && (
                  <motion.div
                    key="disc"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    {isFree ? (
                      <div className="flex flex-col items-start gap-3 py-8">
                        <Lock className="h-4 w-4 text-ink-faint" />
                        <p className="text-sm font-medium text-ink">Discussion is on Pro</p>
                        <p className="max-w-sm text-sm text-ink-faint">Join community Q&amp;A with Pro or higher.</p>
                        <Link
                          href="/pricing"
                          className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                        >
                          Upgrade <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex gap-3">
                            {(['newest', 'oldest'] as const).map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setPostSort(s)}
                                className={cn(
                                  'text-sm font-medium capitalize',
                                  postSort === s ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <span className="text-ink-faint/30">|</span>
                          <div className="flex gap-3">
                            {['', 'question', 'discussion', 'solution'].map(t => (
                              <button
                                key={t || 'all'}
                                type="button"
                                onClick={() => setPostType(t)}
                                className={cn(
                                  'text-sm font-medium capitalize',
                                  postType === t ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
                                )}
                              >
                                {t || 'All'}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setComposing(v => !v)}
                            className={cn(
                              'ml-auto inline-flex items-center gap-1.5 text-sm font-medium',
                              composing ? 'text-ink-muted' : 'text-brand hover:underline',
                            )}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {composing ? 'Close' : 'New post'}
                          </button>
                        </div>

                        <AnimatePresence>
                          {composing && (
                            <ComposeForm slug={slug} onCreated={handlePostCreated} onCancel={() => setComposing(false)} />
                          )}
                        </AnimatePresence>

                        {postLoading ? (
                          <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="h-20 animate-pulse border-b border-hairline bg-hairline/40" />
                            ))}
                          </div>
                        ) : posts.length === 0 ? (
                          <div className="py-14 text-center font-sans">
                            <p className="text-sm font-medium text-ink">No discussions yet</p>
                            <p className="mt-1 text-sm text-ink-faint">Be the first to ask or share an approach.</p>
                            <button
                              type="button"
                              onClick={() => setComposing(true)}
                              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                            >
                              <Plus className="h-3.5 w-3.5" /> Start a discussion
                            </button>
                          </div>
                        ) : (
                          <div>
                            {posts.map(post => (
                              <PostRow
                                key={post._id}
                                post={post}
                                slug={slug}
                                onUpvote={handleUpvote}
                                onDelete={handleDelete}
                                onReplyAdded={handleReplyAdded}
                              />
                            ))}
                            {postPages > 1 && (
                              <div className="flex items-center justify-center gap-4 pt-6">
                                <button
                                  type="button"
                                  onClick={() => loadPosts(postPage - 1)}
                                  disabled={postPage <= 1}
                                  className="text-xs text-ink-muted disabled:opacity-40"
                                >
                                  Previous
                                </button>
                                <span className="font-mono text-[11px] text-ink-faint">
                                  {postPage} / {postPages}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => loadPosts(postPage + 1)}
                                  disabled={postPage >= postPages}
                                  className="text-xs text-ink-muted disabled:opacity-40"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
