'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, StickyNote } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useInterview } from '@/contexts/InterviewContext'
import { api } from '@/lib/api'

export function InterviewNotesDrawer() {
  const { activeSession, isNotesOpen, setNotesOpen } = useInterview()
  const [notes, setNotes] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync notes from session when it changes
  useEffect(() => {
    if (activeSession) setNotes(activeSession.notes ?? '')
  }, [activeSession?._id])  // only re-sync on session change, not on every render

  // Debounced save — fires 800 ms after the last keystroke
  const handleChange = useCallback((val: string) => {
    setNotes(val)
    if (!activeSession) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      api.interview.update(activeSession._id, { notes: val }).catch(() => {/* silent */})
    }, 800)
  }, [activeSession])

  if (!activeSession) return null

  return (
    <Sheet open={isNotesOpen} onOpenChange={setNotesOpen}>
      <SheetContent
        side="right"
        className="flex w-72 flex-col gap-0 border-l border-slate-800 bg-slate-900 p-0 text-white"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 px-4 py-3">
          <StickyNote className="h-4 w-4 text-indigo-400" />
          <SheetTitle className="flex-1 text-sm font-semibold text-slate-100">
            Session Notes
          </SheetTitle>
          <button
            onClick={() => setNotesOpen(false)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500
                       transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notes textarea */}
        <div className="relative flex-1 overflow-hidden">
          <textarea
            value={notes}
            onChange={e => handleChange(e.target.value)}
            placeholder={"Jot down your thought process,\ndesign decisions, trade-offs…"}
            className="h-full w-full resize-none bg-transparent px-4 py-4 font-mono
                       text-[12px] leading-relaxed text-slate-300 outline-none
                       placeholder:text-slate-600"
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 px-4 py-2">
          <p className="text-[10px] text-slate-600">
            {notes.length} chars · auto-saved
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
