'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { NotebookPen, CheckCircle2, Loader2, List, ListOrdered, Minus } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProblemNotesPanelProps {
  open: boolean
  onClose: () => void
  slug: string
}

type SaveState = 'idle' | 'saving' | 'saved'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Insert text at the current cursor position in a textarea */
function insertAtCursor(
  el: HTMLTextAreaElement,
  prefix: string,
  value: string,
  onChange: (v: string) => void,
) {
  const start  = el.selectionStart
  const end    = el.selectionEnd
  const before = value.slice(0, start)
  const after  = value.slice(end)

  // If cursor is at beginning of a line, prepend prefix; else newline + prefix
  const needsNewline = start > 0 && value[start - 1] !== '\n'
  const insert = (needsNewline ? '\n' : '') + prefix

  const next = before + insert + after
  onChange(next)

  // Restore cursor after React re-renders
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + insert.length
    el.focus()
  })
}

/** Prefix each selected line with the given prefix */
function prefixLines(
  el: HTMLTextAreaElement,
  getPrefixForLine: (i: number) => string,
  value: string,
  onChange: (v: string) => void,
) {
  const start  = el.selectionStart
  const end    = el.selectionEnd
  const before = value.slice(0, start)
  const sel    = value.slice(start, end) || ''
  const after  = value.slice(end)

  // Find the start of the first selected line
  const lineStart = before.lastIndexOf('\n') + 1
  const fullSel   = value.slice(lineStart, end)
  const lines     = fullSel.split('\n')
  const prefixed  = lines.map((l, i) => getPrefixForLine(i) + l).join('\n')
  const next      = value.slice(0, lineStart) + prefixed + after

  const addedChars = prefixed.length - fullSel.length
  onChange(next)

  requestAnimationFrame(() => {
    el.selectionStart = start + (sel ? 0 : addedChars)
    el.selectionEnd   = end + addedChars
    el.focus()
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProblemNotesPanel({ open, onClose, slug }: ProblemNotesPanelProps) {
  const [notes,     setNotes]     = useState('')
  const [loaded,    setLoaded]    = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load notes when panel opens (or slug changes)
  useEffect(() => {
    if (!open || !slug) return
    setLoaded(false)
    api.problems.getNotes(slug)
      .then(r => { setNotes(r.notes); setLoaded(true) })
      .catch(() => { setNotes(''); setLoaded(true) })
  }, [open, slug])

  // Debounced auto-save — 800 ms after last keystroke
  const handleChange = useCallback((val: string) => {
    setNotes(val)
    setSaveState('saving')
    if (saveTimer.current)  clearTimeout(saveTimer.current)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    saveTimer.current = setTimeout(() => {
      api.problems.updateNotes(slug, val)
        .then(() => {
          setSaveState('saved')
          savedTimer.current = setTimeout(() => setSaveState('idle'), 2000)
        })
        .catch(() => setSaveState('idle'))
    }, 800)
  }, [slug])

  // ── Formatting actions ────────────────────────────────────────────────────

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
    insertAtCursor(el, '\n' + '─'.repeat(48) + '\n', notes, handleChange)
  }

  // Auto-continue bullet/numbered list on Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return
    const el = e.currentTarget
    const pos = el.selectionStart
    const lineStart = notes.lastIndexOf('\n', pos - 1) + 1
    const currentLine = notes.slice(lineStart, pos)

    const bulletMatch    = currentLine.match(/^(• )/)
    const numberedMatch  = currentLine.match(/^(\d+)\. /)

    if (bulletMatch) {
      // Empty bullet → stop list
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

  const toolBtn = 'flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-hairline hover:text-ink'

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        // hide the built-in close button so we don't get two X icons
        className="flex w-80 flex-col gap-0 border-l border-hairline-strong bg-paper p-0 [&>button]:hidden"
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-hairline px-4 py-3">
          <NotebookPen className="h-4 w-4 shrink-0 text-brand" />
          <SheetTitle className="flex-1 text-sm font-semibold text-ink">
            My Notes
          </SheetTitle>

          {/* Save indicator */}
          <span className="flex items-center gap-1 font-mono text-[10px] text-ink-faint">
            {saveState === 'saving' && (
              <><Loader2 className="h-3 w-3 animate-spin" /> saving…</>
            )}
            {saveState === 'saved' && (
              <><CheckCircle2 className="h-3 w-3 text-brand" /> saved</>
            )}
          </span>
        </div>

        {/* ── Description ────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-hairline bg-paper-elevated px-4 py-2.5">
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Private notes visible only to you — jot down your approach, trade-offs, or anything to remember.
          </p>
        </div>

        {/* ── Formatting toolbar ─────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-1 border-b border-hairline px-3 py-1.5">
          <button
            type="button"
            title="Bullet list"
            onClick={insertBullet}
            className={toolBtn}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Numbered list"
            onClick={insertNumbered}
            className={toolBtn}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-hairline-strong" />
          <button
            type="button"
            title="Insert divider"
            onClick={insertDivider}
            className={toolBtn}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="ml-auto font-mono text-[9px] text-ink-faint/60">
            Enter continues list
          </span>
        </div>

        {/* ── Textarea ───────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          {!loaded ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-ink-faint/50" />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                'Write your approach here…\n\n' +
                '• Key classes / responsibilities\n' +
                '• Design decisions & trade-offs\n' +
                '• Edge cases to handle\n' +
                '• Things to revisit'
              }
              className="h-full w-full resize-none bg-transparent px-4 py-4 font-mono
                         text-[12px] leading-relaxed text-ink outline-none
                         placeholder:text-ink-faint/40"
            />
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-hairline px-4 py-2.5">
          <p className="font-mono text-[10px] text-ink-faint">
            {notes.length} chars · auto-saved · private
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
