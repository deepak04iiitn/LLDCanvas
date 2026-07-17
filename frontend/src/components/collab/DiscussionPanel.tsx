'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquareText, Send, Trash2, X, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useCollab } from '@/contexts/CollabContext'
import { cn } from '@/lib/utils'
import type { CollabComment } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

function renderContent(text: string) {
  // @mentions are stored with underscores for multi-word names (e.g. @Kumar_Yadav)
  return text.split(/(@\w+)/g).map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="font-semibold text-brand">{part.replace(/_/g, ' ')}</span>
      : <span key={i}>{part}</span>,
  )
}

// ─── Mention input ────────────────────────────────────────────────────────────

function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  collaborators,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder: string
  collaborators: { name: string; color: string }[]
}) {
  const [suggestions, setSuggestions] = useState<{ name: string; color: string }[]>([])
  const [mentionStart, setMentionStart] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)

    const cursor = e.target.selectionStart ?? val.length
    const before = val.slice(0, cursor)
    const match  = before.match(/@(\w*)$/)
    if (match) {
      setMentionStart(cursor - match[0].length)
      const q = match[1].toLowerCase()
      setSuggestions(
        q
          ? collaborators.filter(c => c.name.toLowerCase().includes(q))
          : collaborators,
      )
    } else {
      setSuggestions([])
      setMentionStart(-1)
    }
  }

  function pickSuggestion(name: string) {
    const before = value.slice(0, mentionStart)
    const after  = value.slice(inputRef.current?.selectionStart ?? value.length)
    onChange(`${before}@${name.replace(/ /g, '_')} ${after}`)
    setSuggestions([])
    setMentionStart(-1)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length === 0) onSubmit()
    }
    if (e.key === 'Escape') setSuggestions([])
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-hairline bg-paper shadow-lg"
          >
            {suggestions.map(s => (
              <button
                key={s.name}
                onMouseDown={e => { e.preventDefault(); pickSuggestion(s.name) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-hairline"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.name[0].toUpperCase()}
                </span>
                <span className="font-medium text-ink">{s.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-hairline bg-paper-elevated pl-3 pr-10 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10"
      />
    </div>
  )
}

// ─── Single message bubble ────────────────────────────────────────────────────

function MessageBubble({
  comment,
  diagramId,
  isOwn,
}: {
  comment: CollabComment
  diagramId: string
  isOwn: boolean
}) {
  const { deleteComment, resolveComment, myRole, myUserId } = useCollab()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const { replyComment, collaborators } = useCollab()

  const canDelete  = myRole === 'owner' || comment.authorId === myUserId
  const canResolve = !comment.resolved && (myRole === 'owner' || myRole === 'editor' || comment.authorId === myUserId)

  function sendReply() {
    if (!replyText.trim()) return
    const mentions = [...replyText.matchAll(/@(\w+)/g)].map(m => m[1].replace(/_/g, ' '))
    replyComment(diagramId, comment._id, replyText.trim(), mentions)
    setReplyText('')
    setReplyOpen(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
    >
      {/* Avatar */}
      {!isOwn && (
        <div
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: collaborators.find(c => c.userId === comment.authorId)?.color ?? '#999' }}
        >
          {comment.authorName[0].toUpperCase()}
        </div>
      )}

      <div className={cn('flex max-w-[78%] flex-col gap-1', isOwn && 'items-end')}>
        {/* Author + time */}
        {!isOwn && (
          <span className="text-[10px] font-medium text-ink-faint">{comment.authorName}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isOwn
              ? 'rounded-tr-sm bg-brand/10 text-ink ring-1 ring-brand/20'
              : 'rounded-tl-sm bg-paper-elevated text-ink',
            comment.resolved && 'opacity-50',
          )}
        >
          {renderContent(comment.content)}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className={cn('mt-0.5 space-y-1.5 pl-2', isOwn && 'text-right')}>
            {comment.replies.map((r, i) => (
              <div key={i} className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: collaborators.find(c => c.userId === r.authorId)?.color ?? '#999' }}
                >
                  {r.authorName[0].toUpperCase()}
                </div>
                <div className={cn(
                  'max-w-[90%] rounded-xl px-3 py-1.5 text-xs leading-relaxed',
                  r.authorId === myUserId
                    ? 'bg-brand/10 text-ink ring-1 ring-brand/20'
                    : 'bg-hairline text-ink',
                )}>
                  {renderContent(r.content)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply input */}
        <AnimatePresence>
          {replyOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <MentionTextarea
                value={replyText}
                onChange={setReplyText}
                onSubmit={sendReply}
                placeholder="Reply…"
                collaborators={collaborators.map(c => ({ name: c.name, color: c.color }))}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
          <span className="text-[10px] text-ink-faint">{timeAgo(comment.createdAt as string)}</span>
          {!comment.resolved && (
            <button
              onClick={() => setReplyOpen(v => !v)}
              className="text-[10px] font-medium text-ink-faint transition-colors hover:text-brand"
            >
              {replyOpen ? 'cancel' : 'reply'}
            </button>
          )}
          {canResolve && (
            <button
              onClick={() => resolveComment(diagramId, comment._id)}
              className="text-[10px] font-medium text-ink-faint transition-colors hover:text-emerald-600"
              title="Mark resolved"
            >
              <CheckCheck size={11} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => deleteComment(diagramId, comment._id)}
              className="text-[10px] font-medium text-ink-faint transition-colors hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          )}
          {comment.resolved && (
            <span className="text-[10px] text-emerald-500">resolved</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface DiscussionPanelProps {
  open:      boolean
  onClose:   () => void
  diagramId: string
}

export function DiscussionPanel({ open, onClose, diagramId }: DiscussionPanelProps) {
  const {
    comments, collaborators, myUserId, clearUnreadMentions, addComment,
  } = useCollab()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Clear unread badge + mark panel open/closed
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (useCollab as any)
    if (open) {
      clearUnreadMentions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments, open])

  function send() {
    if (!text.trim()) return
    const mentions = [...text.matchAll(/@(\w+)/g)].map(m => m[1].replace(/_/g, ' '))
    addComment(diagramId, {
      content:  text.trim(),
      position: { x: 0, y: 0 },
      mentions,
    })
    setText('')
  }

  const visible = comments

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="discussion-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-40 bg-black/10"
            onClick={onClose}
          />

          <motion.aside
            key="discussion-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="absolute right-0 top-0 z-50 flex h-full w-[360px] max-w-[92vw] flex-col border-l border-hairline bg-paper shadow-2xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-3.5">
              <div className="flex items-center gap-2">
                <MessageSquareText size={15} className="text-brand" />
                <h2 className="text-sm font-semibold text-ink">Discussion</h2>
                {comments.filter(c => !c.resolved).length > 0 && (
                  <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-brand-foreground">
                    {comments.filter(c => !c.resolved).length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {visible.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hairline">
                    <MessageSquareText size={20} className="text-ink-faint opacity-60" />
                  </div>
                  <p className="text-sm font-medium text-ink-muted">No discussions yet</p>
                  <p className="text-xs text-ink-faint">
                    Start a conversation — use @ to mention collaborators
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {visible.map(c => (
                      <MessageBubble
                        key={c._id}
                        comment={c}
                        diagramId={diagramId}
                        isOwn={c.authorId === myUserId}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-hairline p-3">
              <div className="relative">
                <MentionInput
                  value={text}
                  onChange={setText}
                  onSubmit={send}
                  placeholder="Message… use @ to mention"
                  collaborators={collaborators.map(c => ({ name: c.name, color: c.color }))}
                />
                <button
                  onClick={send}
                  disabled={!text.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground transition-all hover:bg-brand-hover disabled:opacity-40"
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-ink-faint">Press Enter to send · @ to mention</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
