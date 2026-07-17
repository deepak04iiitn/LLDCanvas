'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ExternalLink, Pencil, Copy, Download, Trash2,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Input } from '@/components/ui/input'
import { DiagramSummary } from '@/types'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface DiagramCardProps {
  diagram: DiagramSummary
  onDeleted: (id: string) => void
  onDuplicated: (d: DiagramSummary) => void
  onRenamed: (id: string, title: string) => void
}

export function DiagramCard({ diagram, onDeleted, onDuplicated, onRenamed }: DiagramCardProps) {
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(diagram.title)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function openEditor() {
    router.push(`/editor/${diagram._id}`)
  }

  function startRename() {
    setRenameValue(diagram.title)
    setRenaming(true)
    setTimeout(() => inputRef.current?.select(), 30)
  }

  async function commitRename() {
    const trimmed = renameValue.trim()
    setRenaming(false)
    if (!trimmed || trimmed === diagram.title) return
    try {
      await api.diagrams.rename(diagram._id, trimmed)
      onRenamed(diagram._id, trimmed)
    } catch {
      toast.error('Failed to rename diagram')
    }
  }

  async function handleDuplicate() {
    try {
      const { diagram: copy } = await api.diagrams.duplicate(diagram._id)
      onDuplicated(copy as DiagramSummary)
      toast.success('UML Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate diagram')
    }
  }

  async function handleDelete() {
    try {
      await api.diagrams.delete(diagram._id)
      onDeleted(diagram._id)
      toast.success('UML Diagram deleted')
    } catch {
      toast.error('Failed to delete diagram')
    }
  }

  function handleExport() {
    router.push(`/editor/${diagram._id}?export=png`)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          className="group relative cursor-pointer overflow-hidden rounded-lg border border-hairline bg-paper-elevated shadow-sm transition-all duration-200 hover:border-hairline-strong hover:shadow-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            if (renaming) e.stopPropagation()
            else openEditor()
          }}
        >
          {/* Thumbnail */}
          <div className="relative flex h-36 items-center justify-center overflow-hidden bg-paper">
            {diagram.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={diagram.thumbnail}
                alt={diagram.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <EmptyThumbnail />
            )}

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ExternalLink size={14} className="text-paper-elevated" />
              <span className="text-sm font-semibold tracking-wide text-paper-elevated">Open</span>
            </motion.div>
          </div>

          {/* Card footer */}
          <div className="px-4 py-3">
            {renaming ? (
              <Input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') { setRenaming(false); setRenameValue(diagram.title) }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-7 border-hairline-strong px-2 py-0 text-sm focus:border-brand"
                autoFocus
              />
            ) : (
              <p
                className="truncate text-sm font-medium leading-5 text-ink"
                onDoubleClick={(e) => { e.stopPropagation(); startRename() }}
              >
                {diagram.title}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-faint">
              {formatRelativeTime(diagram.updatedAt)}
            </p>
          </div>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 rounded-lg border-hairline shadow-lg">
        <ContextMenuItem onClick={openEditor} className="cursor-pointer gap-2.5">
          <ExternalLink size={13} className="text-ink-faint" /> Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={startRename} className="cursor-pointer gap-2.5">
          <Pencil size={13} className="text-ink-faint" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate} className="cursor-pointer gap-2.5">
          <Copy size={13} className="text-ink-faint" /> Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={handleExport} className="cursor-pointer gap-2.5">
          <Download size={13} className="text-ink-faint" /> Export
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={handleDelete}
          className="cursor-pointer gap-2.5 text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 size={13} className="text-red-500" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function EmptyThumbnail() {
  return (
    <div className="flex flex-col items-center gap-2 opacity-40">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="7" rx="2" stroke="var(--brand)" strokeWidth="1.5" />
        <rect x="4" y="14" width="24" height="14" rx="2" stroke="var(--brand)" strokeWidth="1.5" />
        <line x1="4" y1="18" x2="28" y2="18" stroke="var(--brand)" strokeWidth="1.5" />
      </svg>
      <span className="font-mono text-[10px] text-ink-faint">Empty diagram</span>
    </div>
  )
}
