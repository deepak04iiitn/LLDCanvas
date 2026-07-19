'use client'

import { useState } from 'react'
import { Check, MessageSquare, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useCollab } from '@/contexts/CollabContext'
import { MentionInput } from './MentionInput'
import { useSession } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { CollabComment } from '@/types'

function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

function Avatar({ name, color }: { name: string; color?: string }) {
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: color ?? '#234E3F' }}
    >
      {name[0].toUpperCase()}
    </div>
  )
}

interface CommentRowProps {
  comment:   CollabComment
  diagramId: string
  userColor: string
}

function CommentRow({ comment, diagramId, userColor }: CommentRowProps) {
  const { replyComment, resolveComment, deleteComment, myRole } = useCollab()
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState('')
  const myId = session?.user?.id

  const canDelete  = myRole === 'owner' || comment.authorId === myId
  const canResolve = (myRole === 'owner' || myRole === 'editor' || comment.authorId === myId) && !comment.resolved

  function sendReply() {
    if (!reply.trim()) return
    const mentions = [...reply.matchAll(/@(\w+)/g)].map(m => m[1])
    replyComment(diagramId, comment._id, reply.trim(), mentions)
    setReply('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'rounded-xl border border-hairline bg-paper-elevated p-3 space-y-2',
        comment.resolved && 'opacity-60',
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-2">
        <Avatar name={comment.authorName} color={userColor} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-xs font-medium text-ink">{comment.authorName}</p>
            <p className="text-[10px] text-ink-faint">{timeAgo(comment.createdAt)}</p>
            {comment.resolved && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                <Check size={9} /> Resolved
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-ink">{comment.content}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canResolve && (
            <button
              onClick={() => resolveComment(diagramId, comment._id)}
              className="flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors hover:bg-emerald-50 hover:text-emerald-600"
              title="Resolve"
            >
              <Check size={12} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => deleteComment(diagramId, comment._id)}
              className="flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-8 space-y-1.5">
          {comment.replies.map(r => (
            <div key={r._id} className="flex gap-2">
              <Avatar name={r.authorName} color="#A69F8C" />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[11px] font-medium text-ink">{r.authorName}</p>
                  <p className="text-[10px] text-ink-faint">{timeAgo(r.createdAt)}</p>
                </div>
                <p className="text-xs leading-relaxed text-ink-muted">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply toggle */}
      {!comment.resolved && (
        <div className="ml-8">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="text-[11px] font-medium text-brand transition-colors hover:text-brand-hover"
            >
              Reply
            </button>
          ) : (
            <div className="space-y-2">
              <MentionInput
                value={reply}
                onChange={setReply}
                onSubmit={sendReply}
                placeholder="Reply… (Enter to send)"
              />
              <div className="flex gap-2">
                <button
                  onClick={sendReply}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  Send
                </button>
                <button
                  onClick={() => { setExpanded(false); setReply('') }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-hairline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

type Filter = 'all' | 'open' | 'resolved'

interface CommentsPanelProps {
  open:      boolean
  onClose:   () => void
  diagramId: string
}

export function CommentsPanel({ open, onClose, diagramId }: CommentsPanelProps) {
  const { comments, collaborators } = useCollab()
  const [filter, setFilter] = useState<Filter>('open')

  const filtered = comments.filter(c => {
    if (filter === 'open')     return !c.resolved
    if (filter === 'resolved') return c.resolved
    return true
  })

  function getColor(authorId: string) {
    return collaborators.find(u => u.userId === authorId)?.color ?? '#A69F8C'
  }

  const openCount = comments.filter(c => !c.resolved).length

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/5"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="absolute right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-hairline bg-paper shadow-xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-brand" />
                <h2 className="font-serif text-sm font-medium text-ink">Comments</h2>
                {openCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-brand-foreground">
                    {openCount > 9 ? '9+' : openCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
              >
                <X size={14} />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex shrink-0 gap-1 border-b border-hairline px-4 py-2">
              {(['all', 'open', 'resolved'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                    filter === f
                      ? 'bg-brand/10 text-brand'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <MessageSquare size={28} className="text-ink-faint opacity-40" />
                  <p className="text-sm text-ink-faint">
                    {filter === 'resolved' ? 'No resolved comments.' : 'No comments yet.'}
                  </p>
                  {filter === 'open' && (
                    <p className="text-xs text-ink-faint">Right-click the canvas to add one.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filtered.map(c => (
                      <CommentRow
                        key={c._id}
                        comment={c}
                        diagramId={diagramId}
                        userColor={getColor(c.authorId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
