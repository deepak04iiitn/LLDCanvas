'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquarePlus, Send, X } from 'lucide-react'
import { useCollab } from '@/contexts/CollabContext'
import { MentionInput } from './MentionInput'
import { CommentThread } from './CommentThread'
import type { CollabComment } from '@/types'

// ─── Inline new-comment input bubble ─────────────────────────────────────────

interface NewCommentBubbleProps {
  screenX:  number
  screenY:  number
  onSubmit: (content: string) => void
  onCancel: () => void
}

function NewCommentBubble({ screenX, screenY, onSubmit, onCancel }: NewCommentBubbleProps) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel()
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 80)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [onCancel])

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  function handleSubmit() {
    if (!text.trim()) return
    onSubmit(text.trim())
    setText('')
  }

  // Smart positioning — flip if near screen edges
  const flipLeft = screenX > window.innerWidth - 320
  const flipUp   = screenY > window.innerHeight - 200

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: flipUp ? 6 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="absolute w-72"
      style={{
        left: flipLeft ? screenX - 288 : screenX + 14,
        top:  flipUp   ? screenY - 164 : screenY + 14,
        zIndex: 300,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Connector line to drop marker */}
      <div
        className="absolute h-px w-3 bg-brand/40"
        style={{
          left:  flipLeft ? 'auto' : -14,
          right: flipLeft ? -14 : 'auto',
          top: 20,
        }}
      />

      <div className="overflow-hidden rounded-xl border border-hairline bg-paper shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10">
              <MessageSquarePlus size={11} className="text-brand" />
            </div>
            <span className="text-xs font-medium text-ink">New comment</span>
          </div>
          <button
            onClick={onCancel}
            className="flex h-5 w-5 items-center justify-center rounded text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
          >
            <X size={11} />
          </button>
        </div>

        {/* Input area */}
        <div className="p-3.5">
          <MentionInput
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            placeholder="Write a comment… (Enter to post)"
          />
          <div className="mt-2.5 flex items-center justify-between">
            <p className="text-[10px] text-ink-faint">Shift+Enter for new line · @mention teammates</p>
            <div className="flex gap-1.5">
              <button
                onClick={onCancel}
                className="rounded-md px-2.5 py-1 text-xs text-ink-muted transition-colors hover:bg-hairline"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="flex items-center gap-1 rounded-md bg-brand px-3 py-1 text-xs font-medium text-brand-foreground transition-all hover:bg-brand-hover disabled:opacity-40"
              >
                <Send size={10} /> Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Comment mode crosshair overlay ──────────────────────────────────────────

function CommentModeOverlay({ onExit }: { onExit: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* Top banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className="pointer-events-auto absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-3 rounded-full border border-brand/25 bg-brand px-5 py-2.5 shadow-lg"
      >
        <MessageSquarePlus size={14} className="text-brand-foreground" />
        <span className="text-sm font-medium text-brand-foreground">
          Click anywhere to place a comment
        </span>
        <button
          onClick={onExit}
          className="ml-1 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-brand-foreground transition-colors hover:bg-white/25"
        >
          <X size={11} /> Esc
        </button>
      </motion.div>
    </div>
  )
}

// ─── Existing comment pin ─────────────────────────────────────────────────────

interface CommentPinProps {
  comment:   CollabComment
  screenX:   number
  screenY:   number
  diagramId: string
  isOpen:    boolean
  onOpen:    () => void
  onClose:   () => void
}

function CommentPin({ comment, screenX, screenY, diagramId, isOpen, onOpen, onClose }: CommentPinProps) {
  const { collaborators } = useCollab()
  const userColor  = collaborators.find(u => u.userId === comment.authorId)?.color ?? '#234E3F'
  const initial    = comment.authorName[0].toUpperCase()
  const replyCount = comment.replies.length
  const flipRight  = screenX > window.innerWidth - 320

  return (
    <div
      className="absolute"
      style={{ left: screenX, top: screenY, transform: 'translate(-14px, -14px)', zIndex: isOpen ? 200 : 100 }}
    >
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        onClick={e => { e.stopPropagation(); onOpen() }}
        className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-md transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: comment.resolved ? '#A69F8C' : userColor }}
        title={`${comment.authorName}: ${comment.content.slice(0, 60)}`}
      >
        {initial}
        {replyCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-amber-500 text-[8px] font-bold text-white">
            {replyCount > 9 ? '9+' : replyCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className={`absolute top-0 ${flipRight ? 'right-8' : 'left-8'}`}>
            <CommentThread comment={comment} diagramId={diagramId} onClose={onClose} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main layer ───────────────────────────────────────────────────────────────

interface CommentsLayerProps {
  diagramId:          string
  onAddComment:       (flowPos: { x: number; y: number }, content: string) => void
  canComment:         boolean
  commentMode:        boolean
  onExitCommentMode:  () => void
}

export function CommentsLayer({ diagramId, onAddComment, canComment, commentMode, onExitCommentMode }: CommentsLayerProps) {
  const { comments } = useCollab()
  const [openId,    setOpenId]    = useState<string | null>(null)
  const [newBubble, setNewBubble] = useState<{ screenX: number; screenY: number; flowX: number; flowY: number } | null>(null)

  const transform = useStore(s => s.transform)
  const [tx, ty, zoom] = transform

  // Expose click handler for EditorShell to call when in comment mode
  const handleClick = useCallback((e: React.MouseEvent, flowPos: { x: number; y: number }) => {
    e.stopPropagation()
    setNewBubble({ screenX: e.clientX, screenY: e.clientY, flowX: flowPos.x, flowY: flowPos.y })
    setOpenId(null)
  }, [])
  ;(CommentsLayer as any)._handleClick = handleClick

  // Reset bubble when comment mode is turned off
  useEffect(() => {
    if (!commentMode) setNewBubble(null)
  }, [commentMode])

  function submitComment(content: string) {
    if (!newBubble) return
    onAddComment({ x: newBubble.flowX, y: newBubble.flowY }, content)
    setNewBubble(null)
  }

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 50 }}>
      {/* Comment mode: top pill banner + crosshair cursor hint */}
      <AnimatePresence>
        {commentMode && canComment && (
          <CommentModeOverlay onExit={onExitCommentMode} />
        )}
      </AnimatePresence>

      {/* Existing pins */}
      {comments.map(comment => {
        const screenX = comment.position.x * zoom + tx
        const screenY = comment.position.y * zoom + ty
        if (screenX < -50 || screenY < -50) return null

        return (
          <div key={comment._id} className="pointer-events-auto">
            <CommentPin
              comment={comment}
              screenX={screenX}
              screenY={screenY}
              diagramId={diagramId}
              isOpen={openId === comment._id}
              onOpen={() => { setOpenId(comment._id); setNewBubble(null) }}
              onClose={() => setOpenId(null)}
            />
          </div>
        )
      })}

      {/* New comment drop marker + bubble */}
      <AnimatePresence>
        {newBubble && (
          <div className="pointer-events-auto">
            {/* Pulsing drop marker */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="absolute"
              style={{ left: newBubble.screenX - 14, top: newBubble.screenY - 14, zIndex: 250 }}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand shadow-md">
                <MessageSquarePlus size={13} className="text-brand-foreground" />
              </div>
            </motion.div>

            {/* Input bubble */}
            <NewCommentBubble
              screenX={newBubble.screenX}
              screenY={newBubble.screenY}
              onSubmit={submitComment}
              onCancel={() => setNewBubble(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
