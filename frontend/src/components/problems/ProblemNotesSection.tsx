'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  NotebookPen,
  Pencil,
  Eye,
  CheckCircle2,
  Loader2,
  List,
  ListOrdered,
  Minus,
  Lock,
  Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

type SaveState = 'idle' | 'saving' | 'saved'

function insertAtCursor(
  el: HTMLTextAreaElement,
  prefix: string,
  value: string,
  onChange: (v: string) => void,
) {
  const start = el.selectionStart
  const end = el.selectionEnd
  const before = value.slice(0, start)
  const after = value.slice(end)
  const needsNewline = start > 0 && value[start - 1] !== '\n'
  const insert = (needsNewline ? '\n' : '') + prefix
  const next = before + insert + after
  onChange(next)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + insert.length
    el.focus()
  })
}

function prefixLines(
  el: HTMLTextAreaElement,
  getPrefixForLine: (i: number) => string,
  value: string,
  onChange: (v: string) => void,
) {
  const start = el.selectionStart
  const end = el.selectionEnd
  const before = value.slice(0, start)
  const sel = value.slice(start, end) || ''
  const lineStart = before.lastIndexOf('\n') + 1
  const fullSel = value.slice(lineStart, end)
  const lines = fullSel.split('\n')
  const prefixed = lines.map((l, i) => getPrefixForLine(i) + l).join('\n')
  const next = value.slice(0, lineStart) + prefixed + value.slice(end)
  const addedChars = prefixed.length - fullSel.length
  onChange(next)
  requestAnimationFrame(() => {
    el.selectionStart = start + (sel ? 0 : addedChars)
    el.selectionEnd = end + addedChars
    el.focus()
  })
}

/** Pretty-read plain notes: preserve lists / blank lines without looking like a code dump. */
function NotesPreview({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter(b => b.trim().length > 0)

  return (
    <div className="space-y-4">
      {blocks.map((block, bi) => {
        const lines = block.split('\n')
        const allBullets = lines.every(l => /^\s*[•\-\*]\s+/.test(l) || !l.trim())
        const allNumbered = lines.every(l => /^\s*\d+\.\s+/.test(l) || !l.trim())

        if (allBullets) {
          return (
            <ul key={bi} className="space-y-2 pl-1">
              {lines.filter(l => l.trim()).map((l, li) => (
                <li key={li} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
                  <span>{l.replace(/^\s*[•\-\*]\s+/, '')}</span>
                </li>
              ))}
            </ul>
          )
        }

        if (allNumbered) {
          return (
            <ol key={bi} className="space-y-2">
              {lines.filter(l => l.trim()).map((l, li) => {
                const m = l.match(/^\s*(\d+)\.\s+(.*)$/)
                return (
                  <li key={li} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                    <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-brand">
                      {m?.[1] ?? li + 1}
                    </span>
                    <span>{m?.[2] ?? l}</span>
                  </li>
                )
              })}
            </ol>
          )
        }

        // Divider-only block
        if (lines.every(l => /^[─\-_]{3,}$/.test(l.trim()) || !l.trim())) {
          return <hr key={bi} className="border-hairline" />
        }

        return (
          <p key={bi} className="whitespace-pre-wrap text-[15px] leading-[1.7] text-ink">
            {block}
          </p>
        )
      })}
    </div>
  )
}

interface ProblemNotesSectionProps {
  slug: string
  /** Called when notes content presence changes (empty ↔ non-empty) */
  onHasNotesChange?: (has: boolean) => void
}

export function ProblemNotesSection({ slug, onHasNotesChange }: ProblemNotesSectionProps) {
  const [notes, setNotes] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!slug) return
    setLoaded(false)
    api.problems.getNotes(slug)
      .then(r => {
        setNotes(r.notes)
        setLoaded(true)
        onHasNotesChange?.(r.notes.trim().length > 0)
        // Open empty notes in edit mode so writing feels natural
        if (!r.notes.trim()) setEditing(true)
      })
      .catch(() => {
        setNotes('')
        setLoaded(true)
        setEditing(true)
        onHasNotesChange?.(false)
      })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((val: string) => {
    setNotes(val)
    onHasNotesChange?.(val.trim().length > 0)
    setSaveState('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    saveTimer.current = setTimeout(() => {
      api.problems.updateNotes(slug, val)
        .then(() => {
          setSaveState('saved')
          savedTimer.current = setTimeout(() => setSaveState('idle'), 2000)
        })
        .catch(() => setSaveState('idle'))
    }, 800)
  }, [slug, onHasNotesChange])

  function insertBullet() {
    const el = textareaRef.current
    if (!el) return
    prefixLines(el, () => '• ', notes, handleChange)
  }

  function insertNumbered() {
    const el = textareaRef.current
    if (!el) return
    prefixLines(el, i => `${i + 1}. `, notes, handleChange)
  }

  function insertDivider() {
    const el = textareaRef.current
    if (!el) return
    insertAtCursor(el, '\n' + '─'.repeat(40) + '\n', notes, handleChange)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return
    const el = e.currentTarget
    const pos = el.selectionStart
    const lineStart = notes.lastIndexOf('\n', pos - 1) + 1
    const currentLine = notes.slice(lineStart, pos)

    const bulletMatch = currentLine.match(/^(• )/)
    const numberedMatch = currentLine.match(/^(\d+)\. /)

    if (bulletMatch) {
      if (currentLine.trim() === '•') {
        e.preventDefault()
        const next = notes.slice(0, lineStart) + '\n' + notes.slice(pos)
        handleChange(next)
        requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = lineStart + 1; el.focus() })
        return
      }
      e.preventDefault()
      const insert = '\n• '
      const next = notes.slice(0, pos) + insert + notes.slice(pos)
      handleChange(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = pos + insert.length; el.focus() })
    } else if (numberedMatch) {
      const num = parseInt(numberedMatch[1], 10)
      if (currentLine.trim() === `${num}.`) {
        e.preventDefault()
        const next = notes.slice(0, lineStart) + '\n' + notes.slice(pos)
        handleChange(next)
        requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = lineStart + 1; el.focus() })
        return
      }
      e.preventDefault()
      const insert = `\n${num + 1}. `
      const next = notes.slice(0, pos) + insert + notes.slice(pos)
      handleChange(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = pos + insert.length; el.focus() })
    }
  }

  useEffect(() => {
    if (editing && loaded) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [editing, loaded])

  if (!loaded) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-hairline/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-hairline/40" />
      </div>
    )
  }

  const hasContent = notes.trim().length > 0
  const toolBtn =
    'flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-hairline hover:text-ink'

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-tint">
            <NotebookPen className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">My Notes</h2>
            <p className="flex items-center gap-1 text-xs text-ink-faint">
              <Lock className="h-3 w-3" /> Private · only you
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
                          <span className="flex min-w-18 items-center justify-end gap-1 text-xs text-ink-faint">
            {saveState === 'saving' && (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving</>
            )}
            {saveState === 'saved' && (
              <><CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Saved</>
            )}
          </span>

          {hasContent && (
            <div className="inline-flex rounded-xl border border-hairline bg-paper-elevated p-0.5">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  !editing ? 'bg-brand-tint text-brand' : 'text-ink-faint hover:text-ink-muted',
                )}
              >
                <Eye className="h-3.5 w-3.5" /> Read
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  editing ? 'bg-brand-tint text-brand' : 'text-ink-faint hover:text-ink-muted',
                )}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!editing && hasContent ? (
          <motion.div
            key="read"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border border-hairline bg-paper-elevated p-6 sm:p-8"
          >
            <NotesPreview text={notes} />
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit notes
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated shadow-sm"
          >
            {!hasContent && (
              <div className="border-b border-hairline px-5 py-3.5">
                <p className="text-sm text-ink-muted">
                  Jot down your approach, trade-offs, or anything to remember while practicing.
                </p>
              </div>
            )}

            <div className="flex items-center gap-1 border-b border-hairline px-3 py-2">
              <button type="button" title="Bullet list" onClick={insertBullet} className={toolBtn}>
                <List className="h-3.5 w-3.5" />
              </button>
              <button type="button" title="Numbered list" onClick={insertNumbered} className={toolBtn}>
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 h-4 w-px bg-hairline-strong" />
              <button type="button" title="Divider" onClick={insertDivider} className={toolBtn}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              {hasContent && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
                >
                  <Eye className="h-3.5 w-3.5" /> Done
                </button>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={notes}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                'Write your approach…\n\n' +
                '• Key classes / responsibilities\n' +
                '• Design decisions & trade-offs\n' +
                '• Edge cases to handle\n' +
                '• Things to revisit'
              }
              rows={14}
              className="w-full resize-none bg-transparent px-5 py-5 text-[15px] leading-[1.7] text-ink outline-none placeholder:text-ink-faint/45"
            />

            <div className="flex items-center justify-between border-t border-hairline px-5 py-2.5">
              <p className="text-xs text-ink-faint">
                {notes.length > 0 ? `${notes.length.toLocaleString()} characters` : 'Empty'}
                <span className="mx-1.5 text-hairline-strong">·</span>
                Auto-saves
              </p>
              {!hasContent && (
                <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                  <Plus className="h-3 w-3" /> Start typing
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
