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
      toast.success('Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate diagram')
    }
  }

  async function handleDelete() {
    try {
      await api.diagrams.delete(diagram._id)
      onDeleted(diagram._id)
      toast.success('Diagram deleted')
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
          className="group relative rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden"
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
          <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
            {diagram.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={diagram.thumbnail}
                alt={diagram.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <EmptyThumbnail />
            )}

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-indigo-600/80 backdrop-blur-[2px] flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ExternalLink size={14} className="text-white" />
              <span className="text-white text-sm font-semibold tracking-wide">Open</span>
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
                className="h-7 text-sm px-2 py-0 border-indigo-300 focus:border-indigo-500"
                autoFocus
              />
            ) : (
              <p
                className="text-sm font-medium text-gray-800 truncate leading-5"
                onDoubleClick={(e) => { e.stopPropagation(); startRename() }}
              >
                {diagram.title}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {formatRelativeTime(diagram.updatedAt)}
            </p>
          </div>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 rounded-xl shadow-lg border-gray-100">
        <ContextMenuItem onClick={openEditor} className="gap-2.5 cursor-pointer">
          <ExternalLink size={13} className="text-gray-400" /> Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={startRename} className="gap-2.5 cursor-pointer">
          <Pencil size={13} className="text-gray-400" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate} className="gap-2.5 cursor-pointer">
          <Copy size={13} className="text-gray-400" /> Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={handleExport} className="gap-2.5 cursor-pointer">
          <Download size={13} className="text-gray-400" /> Export
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={handleDelete}
          className="gap-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 size={13} className="text-red-400" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function EmptyThumbnail() {
  return (
    <div className="flex flex-col items-center gap-2 opacity-25">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="7" rx="2" stroke="#6366F1" strokeWidth="1.5" />
        <rect x="4" y="14" width="24" height="14" rx="2" stroke="#6366F1" strokeWidth="1.5" />
        <line x1="4" y1="18" x2="28" y2="18" stroke="#6366F1" strokeWidth="1.5" />
      </svg>
      <span className="text-[10px] font-mono text-gray-500">Empty diagram</span>
    </div>
  )
}
