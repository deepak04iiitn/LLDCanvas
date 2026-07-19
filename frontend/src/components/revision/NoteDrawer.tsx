'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Bookmark, BookmarkCheck, CheckCircle2, ChevronRight, Lightbulb, Code2, BookOpen, Maximize2, Lock } from 'lucide-react'
import { RevisionNoteDetail } from '@/types'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FlashcardMode } from './FlashcardMode'

interface Props {
  slug: string | null
  onClose: () => void
  onRevised?: (slug: string) => void
  onBookmarkToggle?: (slug: string, bookmarked: boolean) => void
  canBookmark?: boolean
}

const DIFF_META = {
  basic:        { label: 'Basic',        dot: 'bg-emerald-400', color: 'text-emerald-600', bg: 'bg-emerald-50',  ring: 'ring-emerald-200' },
  intermediate: { label: 'Intermediate', dot: 'bg-amber-400',   color: 'text-amber-600',   bg: 'bg-amber-50',    ring: 'ring-amber-200'   },
  advanced:     { label: 'Advanced',     dot: 'bg-red-400',     color: 'text-red-600',     bg: 'bg-red-50',      ring: 'ring-red-200'     },
}

export function NoteDrawer({ slug, onClose, onRevised, onBookmarkToggle, canBookmark = true }: Props) {
  const [note, setNote]               = useState<RevisionNoteDetail | null>(null)
  const [bookmarked, setBookmarked]   = useState(false)
  const [isRevised, setIsRevised]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [flashcard, setFlashcard]     = useState(false)
  const [revising, setRevising]       = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  const load = useCallback(async (s: string) => {
    setLoading(true)
    setNote(null)
    try {
      const { note: n, myRevision } = await api.revision.get(s)
      setNote(n)
      setBookmarked(myRevision?.bookmarked ?? false)
      setIsRevised(myRevision?.status === 'revised')
    } catch {
      toast.error('Failed to load note')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (slug) load(slug)
  }, [slug, load])

  async function handleMarkRevised() {
    if (!note || isRevised) return
    setRevising(true)
    try {
      await api.revision.markRevised(note.slug)
      setIsRevised(true)
      onRevised?.(note.slug)
      toast.success('Marked as revised!')
    } catch {
      toast.error('Failed to mark as revised')
    } finally {
      setRevising(false)
    }
  }

  async function handleBookmark() {
    if (!note) return
    setBookmarking(true)
    try {
      const { bookmarked: next } = await api.revision.toggleBookmark(note.slug)
      setBookmarked(next)
      onBookmarkToggle?.(note.slug, next)
      toast.success(next ? 'Bookmarked!' : 'Bookmark removed')
    } catch {
      toast.error('Failed to update bookmark')
    } finally {
      setBookmarking(false)
    }
  }

  const visible = !!slug

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-lg bg-paper-elevated border-l border-hairline shadow-[−20px_0_60px_rgba(0,0,0,0.08)] flex flex-col transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-hairline shrink-0">
          <div className="flex-1 min-w-0">
            {loading || !note ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-hairline rounded w-20" />
                <div className="h-5 bg-hairline rounded w-48" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  {(() => {
                    const m = DIFF_META[note.difficulty]
                    return (
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full font-mono font-bold uppercase tracking-wider ring-1 px-2 py-0.5 text-[9px]',
                        m.bg, m.color, m.ring,
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
                        {m.label}
                      </span>
                    )
                  })()}
                  <span className="font-mono text-[10px] text-ink-faint">{note.category}</span>
                </div>
                <h2 className="font-serif text-2xl leading-tight text-ink">{note.title}</h2>
              </>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
            {note && (
              <>
                <button
                  onClick={() => setFlashcard(true)}
                  className="p-2 rounded-lg text-ink-faint hover:text-brand hover:bg-brand-tint transition-colors"
                  title="Flashcard mode"
                >
                  <Maximize2 size={15} />
                </button>
                {canBookmark ? (
                  <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      bookmarked
                        ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                        : 'text-ink-faint hover:text-amber-500 hover:bg-amber-50',
                    )}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  </button>
                ) : (
                  <a
                    href="/pricing"
                    title="Upgrade to Pro to bookmark notes"
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-amber-500 transition-colors hover:bg-amber-50"
                  >
                    <Lock size={13} />
                    <span className="text-[10px] font-semibold">Pro</span>
                  </a>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-hairline transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading && (
            <div className="p-6 space-y-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-hairline rounded w-24" />
                  <div className="h-4 bg-paper rounded w-full" />
                  <div className="h-4 bg-paper rounded w-5/6" />
                  <div className="h-4 bg-paper rounded w-4/6" />
                </div>
              ))}
            </div>
          )}

          {note && !loading && (
            <div className="px-6 py-6 space-y-7">
              {/* Summary */}
              <div className="rounded-xl border border-hairline bg-paper p-4">
                <p className="text-sm text-ink-muted leading-relaxed">{note.summary}</p>
              </div>

              {/* Key Points */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={13} className="text-brand" />
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink-faint">Key Concepts</h3>
                </div>
                <div className="space-y-4">
                  {note.keyPoints.map((point, i) => (
                    <div key={i} className="flex gap-3.5">
                      <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-tint flex items-center justify-center">
                        <span className="font-mono text-[10px] font-black text-brand">{i + 1}</span>
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Analogy */}
              {note.analogy && (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={13} className="text-amber-600" />
                    <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">Real-World Analogy</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed italic">{note.analogy}</p>
                </section>
              )}

              {/* Code Hint */}
              {note.codeHint && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 size={13} className="text-ink-faint" />
                    <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink-faint">Code Snippet</h3>
                  </div>
                  <pre className="rounded-xl border border-hairline bg-[#1a1a2e] text-emerald-300 p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                    {note.codeHint}
                  </pre>
                </section>
              )}

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {note.tags.map(t => (
                    <span key={t} className="rounded-md border border-hairline bg-paper px-2 py-0.5 font-mono text-[10px] text-ink-faint">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {note && !loading && (
          <div className="px-6 py-4 border-t border-hairline flex items-center gap-3 shrink-0">
            <button
              onClick={handleMarkRevised}
              disabled={isRevised || revising}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                isRevised
                  ? 'bg-paper border border-hairline text-ink-faint cursor-default'
                  : 'bg-brand text-white hover:opacity-90 active:scale-[0.98]',
              )}
            >
              <CheckCircle2 size={15} />
              {isRevised ? 'Already Revised' : revising ? 'Saving…' : 'Mark as Revised'}
            </button>
            <button
              onClick={() => setFlashcard(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-hairline text-sm font-medium text-ink-muted hover:bg-paper hover:text-ink transition-colors"
            >
              Flashcard
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Flashcard overlay */}
      {flashcard && note && (
        <FlashcardMode
          note={note}
          isRevised={isRevised}
          bookmarked={bookmarked}
          onClose={() => setFlashcard(false)}
          onMarkRevised={handleMarkRevised}
          onBookmark={handleBookmark}
        />
      )}
    </>
  )
}
