'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Eye, ThumbsUp, ThumbsDown, ChevronLeft, Share2,
  Link2, ChevronRight, MessageCircle, Send, Pencil, Trash2,
  Flag, ArrowUp, ArrowRight, ChevronDown,
} from 'lucide-react'
import { api, type BlogDetail, type BlogSummary, type BlogComment } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth'
import { toast } from 'sonner'
import { BlogBlocks } from './BlogBlocks'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const CATEGORY_ACCENT: Record<string, { pill: string; stamp: string }> = {
  'System Design':          { pill: 'bg-blue-50 text-blue-700 border-blue-200',       stamp: 'border-blue-300 bg-blue-50/70 text-blue-700' },
  'Low-Level Design':       { pill: 'bg-brand/10 text-brand border-brand/20',         stamp: 'border-brand/40 bg-brand/10 text-brand' },
  'Design Patterns':        { pill: 'bg-purple-50 text-purple-700 border-purple-200', stamp: 'border-purple-300 bg-purple-50/70 text-purple-700' },
  'Object-Oriented Design': { pill: 'bg-amber-50 text-amber-700 border-amber-200',    stamp: 'border-amber-300 bg-amber-50/70 text-amber-700' },
  'Interview Prep':         { pill: 'bg-rose-50 text-rose-700 border-rose-200',       stamp: 'border-rose-300 bg-rose-50/70 text-rose-700' },
  'Backend Engineering':    { pill: 'bg-slate-100 text-slate-700 border-slate-200',   stamp: 'border-slate-300 bg-slate-100/70 text-slate-700' },
}
function catAccent(cat: string) {
  return CATEGORY_ACCENT[cat] ?? { pill: 'bg-ink/5 text-ink-muted border-ink/10', stamp: 'border-ink/20 bg-ink/5 text-ink-muted' }
}

const AVATAR_PALETTE = [
  'bg-brand/10 text-brand ring-brand/20',
  'bg-blue-50 text-blue-700 ring-blue-200',
  'bg-purple-50 text-purple-700 ring-purple-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-slate-100 text-slate-700 ring-slate-200',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

// Self-contained fractal-noise grain texture — no network request.
const GRAIN_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// ─── Scroll state (progress % + past-hero flag) shared by rail + dock ────────

function useReaderScroll() {
  const [pct, setPct] = useState(0)
  const [pastHero, setPastHero] = useState(false)
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0)
      setPastHero(window.scrollY > 480)
    }
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return { pct, pastHero }
}

function ProgressRail({ pct }: { pct: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-60 h-[3px] bg-hairline/60">
      <div
        className="h-full bg-linear-to-r from-brand via-brand to-gold transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Table of contents ────────────────────────────────────────────────────────

interface TocItem { id: string; text: string; level: number }

function ChaptersRail({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (!items.length) return null
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <nav className="relative pl-5">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-hairline-strong" />
      <div className="space-y-4">
        {items.map(item => {
          const active = activeId === item.id
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => { e.preventDefault(); jump(item.id) }}
              className="group relative block"
            >
              <span className={cn(
                'absolute -left-5 top-1 h-3 w-3 rounded-full border-2 transition-all duration-200',
                active ? 'scale-110 border-gold bg-gold' : 'border-hairline-strong bg-paper group-hover:border-brand/50',
              )} />
              <span className={cn(
                'block truncate text-[12.5px] leading-snug transition-colors',
                item.level === 1 && 'font-bold',
                item.level === 2 ? '' : item.level === 3 ? 'pl-3 text-[11.5px]' : 'pl-6 text-[11px]',
                active ? 'font-semibold text-brand' : 'text-ink-faint group-hover:text-ink',
              )}>
                {item.text}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Reader's dock (floating action capsule) ─────────────────────────────────

function ReaderDock({
  visible, pct, reaction, likes, dislikes, onReact, onShare, onCopy, onJumpComments,
}: {
  visible: boolean; pct: number; reaction: 'like' | 'dislike' | null
  likes: number; dislikes: number
  onReact: (t: 'like' | 'dislike') => void; onShare: () => void; onCopy: () => void; onJumpComments: () => void
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-0.5 rounded-full border border-hairline-strong bg-white/95 p-1.5 shadow-[0_10px_40px_rgba(35,78,63,0.18)] backdrop-blur-md">
            <button
              onClick={() => onReact('like')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all',
                reaction === 'like' ? 'bg-brand text-white' : 'text-ink-muted hover:bg-hairline',
              )}
            >
              <ThumbsUp className={cn('h-3.5 w-3.5', reaction === 'like' && 'fill-white')} /> {likes}
            </button>
            <button
              onClick={() => onReact('dislike')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all',
                reaction === 'dislike' ? 'bg-red-500 text-white' : 'text-ink-muted hover:bg-hairline',
              )}
            >
              <ThumbsDown className={cn('h-3.5 w-3.5', reaction === 'dislike' && 'fill-white')} /> {dislikes}
            </button>
            <span className="mx-0.5 h-5 w-px bg-hairline-strong" />
            <button onClick={onJumpComments} aria-label="Jump to discussion" className="rounded-full p-2.5 text-ink-muted transition-all hover:bg-hairline hover:text-ink">
              <MessageCircle className="h-4 w-4" />
            </button>
            <button onClick={onShare} aria-label="Share" className="rounded-full p-2.5 text-ink-muted transition-all hover:bg-hairline hover:text-ink">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={onCopy} aria-label="Copy link" className="rounded-full p-2.5 text-ink-muted transition-all hover:bg-hairline hover:text-ink">
              <Link2 className="h-4 w-4" />
            </button>
            <span className="mx-0.5 h-5 w-px bg-hairline-strong" />
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="relative flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(var(--brand) ${pct}%, var(--hairline-strong) ${pct}%)` }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <ArrowUp className="h-3.5 w-3.5 text-brand" />
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────

function FaqAccordion({ faq }: { faq: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-serif text-2xl font-bold text-ink">Frequently Asked Questions</h2>
      </div>
      <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-white">
        {faq.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="flex items-start gap-3">
                  <span className="mt-0.5 font-serif text-sm font-black text-gold">Q</span>
                  <span className="font-semibold text-ink">{f.q}</span>
                </span>
                <ChevronDown className={cn('mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-transform', isOpen && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="flex gap-3 px-6 pb-5 text-sm leading-relaxed text-ink-muted">
                      <span className="font-serif text-sm font-black text-brand/50">A</span>
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Related strip ────────────────────────────────────────────────────────────

function RelatedStrip({ items }: { items: BlogSummary[] }) {
  if (!items.length) return null
  return (
    <section className="border-t border-hairline bg-paper-elevated/40 py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">Continue the Chronicle</span>
          <div className="h-px flex-1 bg-hairline-strong" />
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
          {items.slice(0, 6).map((r, i) => {
            const a = catAccent(r.category)
            return (
              <Link
                key={r._id}
                href={`/blog/${r.slug}`}
                className="group flex w-72 shrink-0 flex-col rounded-2xl border border-hairline bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-ink-faint/40">{String(i + 1).padStart(2, '0')}</span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide', a.pill)}>{r.category}</span>
                </div>
                <h3 className="mt-3 font-serif text-base font-bold leading-snug text-ink transition-colors group-hover:text-brand line-clamp-2">
                  {r.title}
                </h3>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-muted line-clamp-2">{r.excerpt}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <Clock className="h-3 w-3" /> {r.readingTime} min
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Comment item (marginalia thread) ────────────────────────────────────────

function CommentItem({ comment, blogSlug, onRefresh, depth = 0 }: {
  comment: BlogComment; blogSlug: string; onRefresh: () => void; depth?: number
}) {
  const { data: session } = useSession()
  const [editing,      setEditing]      = useState(false)
  const [editContent,  setEditContent]  = useState(comment.content)
  const [replying,     setReplying]     = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [loading,      setLoading]      = useState(false)
  const isOwn = session?.user?.id === comment.authorId
  const ring = avatarColor(comment.authorName)

  const save = async () => {
    if (!editContent.trim()) return
    setLoading(true)
    try { await api.blog.updateComment(comment._id, editContent); setEditing(false); onRefresh() }
    catch { toast.error('Failed to update') } finally { setLoading(false) }
  }

  const del = async () => {
    if (!confirm('Delete this comment?')) return
    try { await api.blog.deleteComment(comment._id); onRefresh() }
    catch { toast.error('Failed to delete') }
  }

  const report = async () => {
    try { await api.blog.reportComment(comment._id); toast.success('Reported') }
    catch { toast.error('Failed') }
  }

  const reply = async () => {
    if (!replyContent.trim()) return
    setLoading(true)
    try { await api.blog.addComment(blogSlug, replyContent, comment._id); setReplying(false); setReplyContent(''); onRefresh() }
    catch { toast.error('Sign in to comment') } finally { setLoading(false) }
  }

  if (comment.isDeleted) return (
    <div className={cn('py-3', depth > 0 && 'ml-8 border-l-2 border-dashed border-hairline pl-6')}>
      <p className="text-xs italic text-ink-faint/50">[deleted]</p>
      {comment.replies?.map(r => <CommentItem key={r._id} comment={r} blogSlug={blogSlug} onRefresh={onRefresh} depth={depth + 1} />)}
    </div>
  )

  return (
    <div className={cn('py-4', depth > 0 && 'ml-8 border-l-2 border-dashed border-hairline pl-6')}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-offset-2 ring-offset-paper', ring)}>
          {comment.authorName[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">{comment.authorName}</span>
            <span className="text-[11px] text-ink-faint">{timeAgo(comment.createdAt)}</span>
          </div>
          {editing ? (
            <>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={save} disabled={loading} className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Save</button>
                <button onClick={() => setEditing(false)} className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted">Cancel</button>
              </div>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-ink-muted">{comment.content}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            {depth === 0 && session && (
              <button onClick={() => setReplying(!replying)} className="flex items-center gap-1 text-[11px] text-ink-faint transition-colors hover:text-ink">
                <MessageCircle className="h-3 w-3" /> Reply
              </button>
            )}
            {isOwn && (
              <>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[11px] text-ink-faint transition-colors hover:text-ink">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={del} className="flex items-center gap-1 text-[11px] text-red-400 transition-colors hover:text-red-600">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </>
            )}
            {!isOwn && session && (
              <button onClick={report} className="flex items-center gap-1 text-[11px] text-ink-faint/50 transition-colors hover:text-ink-faint">
                <Flag className="h-3 w-3" /> Report
              </button>
            )}
          </div>
          {replying && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Write a reply…"
                rows={3}
                className="w-full resize-none rounded-lg border border-hairline-strong bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={reply} disabled={loading} className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                  <Send className="h-3 w-3" /> Reply
                </button>
                <button onClick={() => setReplying(false)} className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map(r => <CommentItem key={r._id} comment={r} blogSlug={blogSlug} onRefresh={onRefresh} depth={depth + 1} />)}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BlogDetailClient({ blog, related }: { blog: BlogDetail; related: BlogSummary[] }) {
  const { data: session } = useSession()
  const [reaction,   setReaction]   = useState<'like' | 'dislike' | null>(null)
  const [likes,      setLikes]      = useState(blog.likes)
  const [dislikes,   setDislikes]   = useState(blog.dislikes)
  const [comments,   setComments]   = useState<BlogComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [posting,    setPosting]    = useState(false)
  const [activeId,   setActiveId]   = useState('')
  const toc = blog.toc
  const a = catAccent(blog.category)
  const { pct, pastHero } = useReaderScroll()

  useEffect(() => {
    if (!session) return
    api.blog.myReaction(blog.slug).then(r => setReaction(r.reaction)).catch(() => {})
  }, [session, blog.slug])

  const loadComments = useCallback(async () => {
    api.blog.listComments(blog.slug).then(r => setComments(r.comments)).catch(() => {})
  }, [blog.slug])

  useEffect(() => { loadComments() }, [loadComments])

  // TOC active heading
  useEffect(() => {
    const hs = document.querySelectorAll('h1[id],h2[id],h3[id],h4[id]')
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) if (e.isIntersecting) setActiveId(e.target.id) },
      { rootMargin: '-20% 0% -70% 0%' },
    )
    hs.forEach(h => obs.observe(h))
    return () => obs.disconnect()
  }, [blog.toc])

  async function handleReact(type: 'like' | 'dislike') {
    if (!session) { toast.error('Sign in to react'); return }
    const prev = reaction; const pL = likes; const pD = dislikes
    if (reaction === type) {
      setReaction(null)
      type === 'like' ? setLikes(l => l - 1) : setDislikes(d => d - 1)
    } else {
      if (reaction === 'like') setLikes(l => l - 1)
      if (reaction === 'dislike') setDislikes(d => d - 1)
      setReaction(type)
      type === 'like' ? setLikes(l => l + 1) : setDislikes(d => d + 1)
    }
    try { await api.blog.react(blog.slug, type) }
    catch { setReaction(prev); setLikes(pL); setDislikes(pD) }
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: blog.title, url }) } catch {} }
    else { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  function jumpToComments() {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function submitComment() {
    if (!session) { toast.error('Sign in to comment'); return }
    if (!newComment.trim()) return
    setPosting(true)
    try { await api.blog.addComment(blog.slug, newComment); setNewComment(''); await loadComments() }
    catch { toast.error('Failed to post') } finally { setPosting(false) }
  }

  return (
    <div className="min-h-screen bg-paper">
      <ProgressRail pct={pct} />

      {/* ── Utility strip ─────────────────────────────────────────────────── */}
      <div className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="flex items-center justify-between py-3">
            <Link href="/blog" className="flex items-center gap-1.5 text-[12px] font-medium text-ink-faint transition-colors hover:text-ink">
              <ChevronLeft className="h-3.5 w-3.5" />
              The Chronicle
            </Link>
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint/50">
              <Clock className="h-3 w-3" /> {blog.readingTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-hairline-strong bg-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: GRAIN_BG, backgroundSize: '160px' }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-brand/5 to-transparent" />
        <div className="hidden lg:flex absolute bottom-8 left-8 top-8 items-end">
          <span className="rotate-180 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint/40 [writing-mode:vertical-rl]">
            The LLDCanvas Chronicle
          </span>
        </div>

        <div className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn('mb-6 inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-dashed px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider', a.stamp)}
          >
            {blog.category}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-serif text-3xl font-black leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-5xl"
          >
            {blog.title}
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 h-[3px] rounded-full bg-gold"
          />

          {blog.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 font-serif text-lg italic leading-relaxed text-ink-muted sm:text-xl"
            >
              {blog.subtitle}
            </motion.p>
          )}

          {/* Byline ticket-stub */}
          <div className="relative mt-9 rounded-xl border border-hairline bg-paper-elevated px-6 py-4">
            <div className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper" />
            <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-paper" />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-dashed border-hairline-strong pb-3 text-[12px] text-ink-faint">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                  {blog.author.name[0]}
                </div>
                <span className="font-medium text-ink-muted">{blog.author.name}</span>
                <span className="text-ink-faint/50">·</span>
                <span>{blog.author.role}</span>
              </div>
              <span>{fmtDate(blog.publishedAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-ink-faint">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readingTime} min read</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.views.toLocaleString()} views</span>
              <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {likes} likes</span>
            </div>
          </div>

          {/* Inline actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleReact('like')}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                reaction === 'like' ? 'border-brand/30 bg-brand/10 text-brand' : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/20 hover:text-brand',
              )}
            >
              <ThumbsUp className={cn('h-4 w-4', reaction === 'like' && 'fill-brand')} /> {likes}
            </button>
            <button
              onClick={() => handleReact('dislike')}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                reaction === 'dislike' ? 'border-red-200 bg-red-50 text-red-600' : 'border-hairline-strong bg-paper text-ink-muted hover:border-red-200 hover:text-red-500',
              )}
            >
              <ThumbsDown className={cn('h-4 w-4', reaction === 'dislike' && 'fill-red-500')} /> {dislikes}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper px-4 py-2 text-sm font-semibold text-ink-muted transition-all hover:border-ink/20 hover:text-ink">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-full border border-hairline-strong bg-paper px-4 py-2 text-sm font-semibold text-ink-muted transition-all hover:border-ink/20 hover:text-ink">
              <Link2 className="h-4 w-4" /> Copy link
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: chapters rail + content ────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex justify-center gap-16 py-14">

          {toc.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-24">
                <p className="mb-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand/60">Chapters</p>
                <ChaptersRail items={toc} activeId={activeId} />
              </div>
            </aside>
          )}

          <main className="w-full max-w-[720px] min-w-0">

            {/* Mobile chapters */}
            {toc.length > 0 && (
              <details className="mb-8 rounded-xl border border-hairline bg-white lg:hidden">
                <summary className="cursor-pointer list-none px-5 py-3 text-sm font-semibold text-ink">
                  <span className="mr-2 text-brand">☰</span> Jump to section
                </summary>
                <div className="border-t border-hairline px-5 py-3">
                  <ChaptersRail items={toc} activeId={activeId} />
                </div>
              </details>
            )}

            <BlogBlocks blocks={blog.content} />

            {blog.faq && blog.faq.length > 0 && <FaqAccordion faq={blog.faq} />}

            {/* Author plate */}
            <div className="relative mt-12 overflow-hidden rounded-2xl border border-hairline bg-white p-6">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand/5" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 font-serif text-xl font-black italic text-brand">
                  {blog.author.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-ink">{blog.author.name}</p>
                  <p className="text-[12px] text-ink-faint">{blog.author.role} at LLDCanvas</p>
                </div>
              </div>
            </div>

            {/* CTA — ticket card */}
            <div
              className="relative mt-8 overflow-hidden bg-linear-to-br from-brand to-brand-hover p-8 text-brand-foreground"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: GRAIN_BG, backgroundSize: '160px' }} />
              <p className="relative font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gold-tint/80">Ready to practice?</p>
              <h3 className="relative mt-1 font-serif text-xl font-bold">Turn reading into results</h3>
              <p className="relative mt-1.5 text-sm text-brand-foreground/80">110+ LLD interview questions, a live canvas, and timed Interview Mode.</p>
              <div className="relative mt-5 flex flex-wrap gap-3">
                <Link href="/features/interview-questions" className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-white/90">
                  Practice LLD <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/features" className="flex items-center gap-1.5 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-white/10">
                  Explore Features
                </Link>
              </div>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Tagged:</span>
                {blog.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-hairline bg-paper px-3 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:border-brand/30 hover:text-brand"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Comments / marginalia */}
            <section id="comments" className="mt-14 border-t border-hairline pt-10 scroll-mt-20">
              <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold text-ink">
                <MessageCircle className="h-5 w-5 text-ink-faint" />
                Reader&rsquo;s Notes ({comments.length})
              </h2>

              {session ? (
                <div className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Share your thoughts or ask a question…"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-hairline-strong bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={submitComment}
                      disabled={posting || !newComment.trim()}
                      className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {posting ? 'Posting…' : 'Post comment'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8 rounded-xl border border-hairline bg-white p-6 text-center">
                  <p className="mb-3 text-sm text-ink-muted">Sign in to join the discussion</p>
                  <Link href="/" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">
                    Sign in
                  </Link>
                </div>
              )}

              {comments.length === 0 ? (
                <p className="py-10 text-center text-sm text-ink-faint">No notes yet — be the first to share your thoughts!</p>
              ) : (
                <div className="divide-y divide-hairline">
                  {comments.map(c => <CommentItem key={c._id} comment={c} blogSlug={blog.slug} onRefresh={loadComments} />)}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      <RelatedStrip items={related} />

      <ReaderDock
        visible={pastHero}
        pct={pct}
        reaction={reaction}
        likes={likes}
        dislikes={dislikes}
        onReact={handleReact}
        onShare={handleShare}
        onCopy={handleCopy}
        onJumpComments={jumpToComments}
      />
    </div>
  )
}
