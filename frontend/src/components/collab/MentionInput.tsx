'use client'

import { useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCollab } from '@/contexts/CollabContext'

interface MentionInputProps {
  value:       string
  onChange:    (v: string) => void
  onSubmit:    () => void
  placeholder?: string
  disabled?:   boolean
}

export function MentionInput({ value, onChange, onSubmit, placeholder = 'Add a comment…', disabled }: MentionInputProps) {
  const { collaborators } = useCollab()
  const [mentionQuery, setMentionQuery]   = useState<string | null>(null)
  const [mentionIndex, setMentionIndex]   = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filtered = mentionQuery !== null
    ? collaborators.filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5)
    : []

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    onChange(v)

    // Detect @mention trigger
    const cursor = e.target.selectionStart ?? v.length
    const textBefore = v.slice(0, cursor)
    const match = textBefore.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1])
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
  }, [onChange])

  const insertMention = useCallback((name: string) => {
    const cursor = textareaRef.current?.selectionStart ?? value.length
    const before = value.slice(0, cursor)
    const after  = value.slice(cursor)
    const replaced = before.replace(/@\w*$/, `@${name} `)
    onChange(replaced + after)
    setMentionQuery(null)
    textareaRef.current?.focus()
  }, [value, onChange])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && filtered.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % filtered.length) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => (i - 1 + filtered.length) % filtered.length) }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filtered[mentionIndex].name)
        return
      }
      if (e.key === 'Escape') { setMentionQuery(null); return }
    }
    if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative">
      {/* Mention dropdown */}
      <AnimatePresence>
        {mentionQuery !== null && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-full left-0 z-50 mb-1 w-52 overflow-hidden rounded-lg border border-hairline bg-paper-elevated shadow-lg"
          >
            {filtered.map((user, i) => (
              <button
                key={user.userId}
                onMouseDown={e => { e.preventDefault(); insertMention(user.name) }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${i === mentionIndex ? 'bg-brand/8 text-brand' : 'text-ink hover:bg-hairline'}`}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0]}
                </span>
                {user.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
        className="w-full resize-none rounded-lg border border-hairline bg-paper-elevated px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-50"
      />
    </div>
  )
}
