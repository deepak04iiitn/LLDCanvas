'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ExternalLink, Pencil, Copy, Download, Trash2, Users, MoreHorizontal, ArrowUpRight,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { DiagramSummary } from '@/types'
import { api } from '@/lib/api'
import { cn, formatRelativeTime } from '@/lib/utils'

interface DiagramCardProps {
  diagram: DiagramSummary
  index?: number
  onDeleted: (id: string) => void
  onDuplicated: (d: DiagramSummary) => void
  onRenamed: (id: string, title: string) => void
}

export function DiagramCard({ diagram, index = 0, onDeleted, onDuplicated, onRenamed }: DiagramCardProps) {
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(diagram.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
    setDeleting(true)
    try {
      await api.diagrams.delete(diagram._id)
      onDeleted(diagram._id)
      toast.success('UML Diagram deleted')
      setConfirmOpen(false)
    } catch {
      toast.error('Failed to delete diagram')
    } finally {
      setDeleting(false)
    }
  }

  function handleExport() {
    router.push(`/editor/${diagram._id}?export=png`)
  }

  const actions = (
    <>
      <DropdownMenuItem onClick={openEditor} className="cursor-pointer gap-2.5">
        <ExternalLink size={13} className="text-ink-faint" /> Open
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => router.push(`/editor/${diagram._id}?collab=1`)}
        className="cursor-pointer gap-2.5"
      >
        <Users size={13} className="text-brand" /> Collaborate
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={startRename} className="cursor-pointer gap-2.5">
        <Pencil size={13} className="text-ink-faint" /> Rename
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer gap-2.5">
        <Copy size={13} className="text-ink-faint" /> Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleExport} className="cursor-pointer gap-2.5">
        <Download size={13} className="text-ink-faint" /> Export
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => setConfirmOpen(true)}
        className="cursor-pointer gap-2.5 text-red-700 focus:bg-red-50 focus:text-red-700"
      >
        <Trash2 size={13} className="text-red-500" /> Delete
      </DropdownMenuItem>
    </>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          role="button"
          tabIndex={0}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }}
          onClick={(e) => {
            if (renaming) e.stopPropagation()
            else openEditor()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !renaming) openEditor()
          }}
          className={cn(
            'group flex cursor-pointer items-center gap-3.5 rounded-xl border border-transparent px-3 py-2.5 transition-all',
            'hover:border-hairline hover:bg-paper-elevated',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
          )}
        >
          {/* Thumb */}
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-hairline bg-paper sm:h-16 sm:w-24">
            {diagram.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={diagram.thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  backgroundImage: 'radial-gradient(circle, var(--hairline) 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden className="opacity-50">
                  <rect x="4" y="4" width="24" height="7" rx="2" stroke="var(--brand)" strokeWidth="1.5" />
                  <rect x="4" y="14" width="24" height="14" rx="2" stroke="var(--brand)" strokeWidth="1.5" />
                  <line x1="4" y1="18" x2="28" y2="18" stroke="var(--brand)" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="min-w-0 flex-1">
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
                className="h-8 max-w-md rounded-lg border-brand px-2 text-sm"
                autoFocus
              />
            ) : (
              <p
                className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-brand"
                onDoubleClick={(e) => { e.stopPropagation(); startRename() }}
                title={diagram.title}
              >
                {diagram.title}
              </p>
            )}
            <p className="mt-0.5 text-xs text-ink-faint">
              Updated {formatRelativeTime(diagram.updatedAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 sm:opacity-100 sm:group-hover:opacity-100">
            <span className="mr-1 hidden items-center gap-1 text-xs font-medium text-ink-faint group-hover:text-brand sm:inline-flex">
              Open <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Actions"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
                >
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
                {actions}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 rounded-xl border-hairline shadow-lg">
        <ContextMenuItem onClick={openEditor} className="cursor-pointer gap-2.5">
          <ExternalLink size={13} className="text-ink-faint" /> Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => router.push(`/editor/${diagram._id}?collab=1`)}
          className="cursor-pointer gap-2.5"
        >
          <Users size={13} className="text-brand" /> Collaborate
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
          onClick={() => setConfirmOpen(true)}
          className="cursor-pointer gap-2.5 text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 size={13} className="text-red-500" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="overflow-hidden rounded-2xl border border-hairline bg-paper-elevated p-0 shadow-xl sm:max-w-sm">
          <div className="p-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-semibold text-ink">
                Delete UML diagram?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">&ldquo;{diagram.title}&rdquo;</span> will be
              permanently deleted. This cannot be undone.
            </p>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  )
}
