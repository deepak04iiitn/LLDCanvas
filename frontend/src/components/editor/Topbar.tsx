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
} from 'lucide-react'
import { motion } from 'framer-motion'
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
}

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'dark') return <Moon className="h-4 w-4" />
  if (theme === 'whiteboard') return <Clipboard className="h-4 w-4" />
  return <Sun className="h-4 w-4" />
}

function EditableTitle({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  function startEdit() {
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
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
      <PenLine
        className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 opacity-0 transition-opacity
                   group-hover:opacity-100"
      />
    </button>
  )
}

const iconBtnBase =
  'flex h-8 items-center justify-center rounded-md transition-colors ' +
  'text-gray-500 hover:bg-gray-100 hover:text-gray-900 ' +
  'disabled:cursor-not-allowed disabled:opacity-30 ' +
  'dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100'

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
}: TopbarProps) {
  const { theme, cycleTheme } = useEditor()

  return (
    <header
      className="relative z-20 flex h-12 flex-shrink-0 items-center border-b
                 border-gray-200 bg-white px-3 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-2 select-none">
        <motion.div
          whileHover={{ rotate: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center"
        >
          <span className="text-xs font-bold text-white tracking-tight">LC</span>
        </motion.div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">
          LLDCanvas
        </span>
      </div>

      {/* Divider */}
      <div className="mx-3 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />

      {/* Center — editable diagram title */}
      <EditableTitle value={title} onChange={onRename} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right — action buttons */}
      <div className="flex items-center gap-1">
        {/* Undo */}
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

        {/* Redo */}
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

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />

        {/* Theme cycle */}
        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnBase, 'w-8')}
            onClick={cycleTheme}
            aria-label={`Theme: ${theme}`}
          >
            <ThemeIcon theme={theme} />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Theme: {theme} (click to cycle)
          </TooltipContent>
        </Tooltip>

        {/* Export dropdown */}
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
              PlantUML text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnBase, 'w-8')}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Share (coming soon)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
