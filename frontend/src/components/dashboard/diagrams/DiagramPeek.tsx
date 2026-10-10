'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  LayoutTemplate,
  X,
} from 'lucide-react'
import type { DiagramSummary } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DiagramRowActions } from './DiagramRowActions'

type Props = {
  diagram: DiagramSummary | null
  open: boolean
  /** When set, peek opens already in rename mode */
  forceRename?: boolean
  onForceRenameConsumed?: () => void
  onClose: () => void
  onOpen: () => void
  onRename: (title: string) => Promise<void>
  onDuplicate: () => void
  onExport: () => void
  onDelete: () => void
}

export function DiagramPeek({
  diagram,
  open,
  forceRename,
  onForceRenameConsumed,
  onClose,
  onOpen,
  onRename,
  onDuplicate,
  onExport,
  onDelete,
}: Props) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!diagram) return
    setRenaming(false)
    setRenameValue(diagram.title)
  }, [diagram?._id, diagram?.title])

  useEffect(() => {
    if (open && forceRename && diagram) {
      setRenameValue(diagram.title)
      setRenaming(true)
      onForceRenameConsumed?.()
    }
  }, [open, forceRename, diagram, onForceRenameConsumed])

  useEffect(() => {
    if (renaming) renameRef.current?.select()
  }, [renaming])

  async function commitRename() {
    if (!diagram) return
    const trimmed = renameValue.trim()
    setRenaming(false)
    if (!trimmed || trimmed === diagram.title) return
    await onRename(trimmed)
  }

  return (
    <AnimatePresence>
      {open && diagram && (
        <>
          <motion.button
            key="peek-backdrop"
            type="button"
            aria-label="Close preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-ink/10 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none sm:pointer-events-none"
            onClick={onClose}
          />
          <motion.aside
            key="peek-panel"
            role="dialog"
            aria-label="Diagram preview"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-hairline bg-paper-elevated shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-4 py-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Preview
              </p>
              <div className="flex items-center gap-1">
                <DiagramRowActions
                  onRename={() => {
                    setRenameValue(diagram.title)
                    setRenaming(true)
                  }}
                  onDuplicate={onDuplicate}
                  onExport={onExport}
                  onDelete={onDelete}
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-hairline/70 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <button
                type="button"
                onClick={onOpen}
                className="group relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-hairline bg-paper shadow-sm"
              >
                {diagram.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={diagram.thumbnail}
                    alt={diagram.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div
                    className="flex h-full flex-col items-center justify-center gap-2"
                    style={{
                      backgroundImage: 'radial-gradient(circle, var(--hairline) 1px, transparent 1px)',
                      backgroundSize: '14px 14px',
                    }}
                  >
                    <LayoutTemplate className="h-6 w-6 text-ink-faint/50" />
                    <p className="text-xs text-ink-faint">Blank canvas</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/40 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-elevated px-3 py-1.5 text-xs font-semibold text-ink shadow-md">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>

              {renaming ? (
                <Input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setRenaming(false)
                  }}
                  className="mb-2 h-9 text-base font-semibold"
                  autoFocus
                />
              ) : (
                <h3
                  className="mb-1 cursor-text font-serif text-lg font-medium tracking-tight text-ink"
                  onDoubleClick={() => {
                    setRenameValue(diagram.title)
                    setRenaming(true)
                  }}
                  title="Double-click to rename"
                >
                  {diagram.title}
                </h3>
              )}

              <p className="text-xs text-ink-faint">
                Updated {formatRelativeTime(diagram.updatedAt)}
                <span className="mx-1.5 text-hairline-strong">·</span>
                Created {formatRelativeTime(diagram.createdAt)}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onOpen}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  Open editor
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
