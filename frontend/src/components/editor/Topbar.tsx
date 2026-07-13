'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Undo2,
  Redo2,
  Sun,
  Moon,
  Clipboard,
  Download,
  ChevronDown,
  Share2,
  PenLine,
  Image,
  FileCode2,
  Check,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '@/contexts/EditorContext'
import { cn } from '@/lib/utils'
import type { SaveStatus } from '@/hooks/useAutosave'

interface TopbarProps {
  title: string
  onRename: (title: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onExportPNG: () => void
  onExportSVG: () => void
  onExportPlantUML: () => void
  onExportMermaid: () => void
  saveStatus: SaveStatus
  onRetrySave: () => void
  selectedCount: number
  onClearSelection: () => void
}

// ─── Save status indicator ────────────────────────────────────────────────────
function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry?: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'idle') { setVisible(false); return }
    setVisible(true)
    if (status === 'saved') {
      const t = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(t)
    }
  }, [status])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-1 overflow-hidden"
        >
          {status === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
              <span className="whitespace-nowrap text-[11px] text-amber-600 dark:text-amber-400">
                Saving…
              </span>
            </>
          )}
          {status === 'saved' && (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="whitespace-nowrap text-[11px] text-emerald-600 dark:text-emerald-400">
                Saved
              </span>
            </>
          )}
          {status === 'error' && onRetry && (
            <>
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="whitespace-nowrap text-[11px] text-red-600 dark:text-red-400">
                Save failed
              </span>
              <button
                onClick={onRetry}
                className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-red-600
                           underline underline-offset-2 hover:text-red-800
                           dark:text-red-400 dark:hover:text-red-200"
              >
                Retry
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Editable diagram title ───────────────────────────────────────────────────
function EditableTitle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  function startEdit() {
    setEditing(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
  }

  function commit() {
    const trimmed = draft.trim() || value
    setDraft(trimmed)
    onChange(trimmed)
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setDraft(value); setEditing(false) }
    e.stopPropagation()
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        autoFocus
        className="max-w-[240px] rounded-md border border-indigo-400 bg-transparent px-2 py-0.5
                   text-sm font-medium text-gray-900 outline-none ring-2 ring-indigo-200
                   dark:border-indigo-500 dark:text-gray-100 dark:ring-indigo-900"
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      title="Click to rename"
      className="group flex max-w-[240px] items-center gap-1.5 rounded-md px-2 py-0.5
                 text-sm font-medium text-gray-800 transition-colors
                 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10"
    >
      <span className="truncate">{draft}</span>
      <PenLine className="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'dark') return <Moon className="h-4 w-4" />
  if (theme === 'whiteboard') return <Clipboard className="h-4 w-4" />
  return <Sun className="h-4 w-4" />
}

const iconBtnBase =
  'flex h-8 items-center justify-center rounded-md transition-colors ' +
  'text-gray-500 hover:bg-gray-100 hover:text-gray-900 ' +
  'disabled:cursor-not-allowed disabled:opacity-30 ' +
  'dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100'

// ─── Topbar ───────────────────────────────────────────────────────────────────
export function Topbar({
  title,
  onRename,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPNG,
  onExportSVG,
  onExportPlantUML,
  onExportMermaid,
  saveStatus,
  onRetrySave,
  selectedCount,
  onClearSelection,
}: TopbarProps) {
  const { theme, cycleTheme } = useEditor()

  return (
    <header
      className="relative z-20 flex h-12 shrink-0 items-center gap-1 border-b
                 border-gray-200 bg-white px-3 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        <motion.div
          whileHover={{ rotate: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600"
        >
          <span className="text-xs font-bold tracking-tight text-white">LC</span>
        </motion.div>
        <span className="hidden text-sm font-semibold text-gray-900 dark:text-gray-100 sm:block">
          LLDCanvas
        </span>
      </div>

      {/* Divider */}
      <div className="mx-2 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />

      {/* Editable title */}
      <EditableTitle value={title} onChange={onRename} />

      {/* Save status */}
      <div className="ml-2">
        <SaveIndicator status={saveStatus} onRetry={onRetrySave} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Multi-select badge */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="mr-1 flex items-center gap-1.5 rounded-full border border-indigo-200
                       bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700
                       dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            <span>{selectedCount} selected</span>
            <button
              onClick={onClearSelection}
              className="rounded-full text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnBase, 'w-8')}
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnBase, 'w-8')}
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />

        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnBase, 'w-8')}
            onClick={cycleTheme}
            aria-label={`Theme: ${theme}`}
          >
            <ThemeIcon theme={theme} />
          </TooltipTrigger>
          <TooltipContent side="bottom">Theme: {theme} (click to cycle)</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(iconBtnBase, 'w-auto gap-1.5 px-3 text-xs font-medium')}
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:block">Export</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onExportPNG} className="gap-2">
              <Image className="h-4 w-4 text-indigo-500" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportSVG} className="gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-500" />
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportPlantUML} className="gap-2">
              <FileCode2 className="h-4 w-4 text-amber-500" />
              Copy PlantUML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportMermaid} className="gap-2">
              <FileCode2 className="h-4 w-4 text-violet-500" />
              Copy Mermaid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger className={cn(iconBtnBase, 'w-8')} aria-label="Share">
            <Share2 className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Share (coming soon)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
