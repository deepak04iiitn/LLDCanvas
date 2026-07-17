'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, MoreHorizontal, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useCollab } from '@/contexts/CollabContext'
import { MentionInput } from './MentionInput'
import { useSession } from '@/lib/auth-client'
import type { CollabComment } from '@/types'

interface CommentThreadProps {
  comment:   CollabComment
  diagramId: string
  onClose:   () => void
}

function Avatar({ name, image, color, size = 'sm' }: { name: string; image?: string; color?: string; size?: 'sm' | 'xs' }) {
  const dim = size === 'xs' ? 'h-5 w-5 text-[8px]' : 'h-7 w-7 text-[10px]'
  const bg  = color ?? '#234E3F'
  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`} style={{ backgroundColor: bg }}>
      {image
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
        : name[0].toUpperCase()}
    </div>
  )
}

function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function CommentThread({ comment, diagramId, onClose }: CommentThreadProps) {
  const { replyComment, resolveComment, deleteComment, collaborators, myRole } = useCollab()
  const { data: session } = useSession()
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comment.replies.length])

  const myId = session?.user?.id

  function getUserColor(authorId: string) {
    return collaborators.find(u => u.userId === authorId)?.color ?? '#A69F8C'
  }

  async function handleSend() {
    if (!reply.trim() || sending) return
    setSending(true)
    const mentions = [...reply.matchAll(/@(\w+)/g)].map(m => m[1])
    replyComment(diagramId, comment._id, reply.trim(), mentions)
    setReply('')
    setSending(false)
  }

  const canDelete  = myRole === 'owner' || comment.authorId === myId
  const canResolve = myRole === 'owner' || myRole === 'editor' || comment.authorId === myId

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ duration: 0.15 }}
      className="w-72 overflow-hidden rounded-xl border border-hairline bg-paper shadow-xl"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
        <div className="flex items-center gap-2">
          <Avatar name={comment.authorName} image={comment.authorImage} color={getUserColor(comment.authorId)} />
          <div>
            <p className="text-xs font-medium text-ink">{comment.authorName}</p>
            <p className="text-[10px] text-ink-faint">{timeAgo(comment.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canResolve && !comment.resolved && (
            <button
              onClick={() => resolveComment(diagramId, comment._id)}
              className="flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors hover:bg-emerald-50 hover:text-emerald-600"
              title="Resolve"
            >
              <Check size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => deleteComment(diagramId, comment._id)}
              className="flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors hover:bg-hairline"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Original comment */}
      <div className="px-3 py-3">
        {comment.resolved && (
          <div className="mb-2 flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">
            <Check size={10} /> Resolved
          </div>
        )}
        <p className="text-sm leading-relaxed text-ink">{comment.content}</p>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="max-h-44 space-y-2 overflow-y-auto border-t border-hairline px-3 py-2">
          {comment.replies.map(r => (
            <div key={r._id} className="flex gap-2">
              <Avatar name={r.authorName} image={r.authorImage} color={getUserColor(r.authorId)} size="xs" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-[11px] font-medium text-ink">{r.authorName}</p>
                  <p className="text-[10px] text-ink-faint">{timeAgo(r.createdAt)}</p>
                </div>
                <p className="text-xs leading-relaxed text-ink-muted">{r.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply input */}
      {!comment.resolved && (
        <div className="border-t border-hairline px-3 py-3">
          <MentionInput
            value={reply}
            onChange={setReply}
            onSubmit={handleSend}
            placeholder="Reply… (Enter to send)"
            disabled={sending}
          />
        </div>
      )}
    </motion.div>
  )
}
