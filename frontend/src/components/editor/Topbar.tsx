'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Undo2, Redo2, Sun, Moon, Clipboard,
  ChevronDown, Share2, PenLine,
  Image, FileCode2, Check, Loader2, AlertCircle,
  Hand, MousePointer2, Mic, Eye,
  Pause, Play, StickyNote, StopCircle,
  Maximize2, Minimize2, FileInput, Code2,
  MessageSquareText, ArrowUpDown, Download, Upload, UserPlus,
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
import { useInterview } from '@/contexts/InterviewContext'
import { useInterviewTimer } from '@/hooks/useInterviewTimer'
import { cn } from '@/lib/utils'
import { Wordmark } from '@/components/Brand'
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
  onExportDraft: () => void
  onOpenImportDraft: () => void
  saveStatus: SaveStatus
  onRetrySave: () => void
  selectedCount: number
  onClearSelection: () => void
  canvasMode: 'pan' | 'select'
  onCanvasModeChange: (m: 'pan' | 'select') => void
  onStartInterview: () => void
  onEndInterview: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  diagramId: string | null
  readOnly?: boolean
  onOpenShare?: () => void
  onOpenCollab?: () => void
  onOpenDiscussion?: () => void
  unreadMentions?: number
  onOpenCode?: () => void
  codePanelOpen?: boolean
  problemSlug?: string
  onOpenProblemDiscussion?: () => void
  problemDiscussionOpen?: boolean
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
function EditableTitle({ value, onChange, readOnly }: { value: string; onChange: (v: string) => void; readOnly?: boolean }) {
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

  if (readOnly) {
    return (
      <span className="max-w-[240px] truncate px-2 py-0.5 text-sm font-medium text-gray-800 dark:text-gray-200">
        {value}
      </span>
    )
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

// ─── Inline timer helpers ────────────────────────────────────────────────────

function fmtElapsed(s: number) {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function timerAccentColor(elapsed: number, limit: number | null) {
  if (!limit) return { bar: 'bg-emerald-500', text: 'text-emerald-600' }
  const pct = elapsed / limit
  if (pct < 0.5)  return { bar: 'bg-emerald-500', text: 'text-emerald-600' }
  if (pct < 0.75) return { bar: 'bg-amber-500',   text: 'text-amber-600'   }
  return               { bar: 'bg-red-500',        text: 'text-red-600'     }
}

// ─── Inline timer strip (shown inside topbar when a session is active) ───────

interface InlineTimerProps {
  onEndSession: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

function InlineTimer({ onEndSession, isFullscreen, onToggleFullscreen }: InlineTimerProps) {
  const {
    activeSession, elapsed, isPaused,
    pauseTimer, resumeTimer, setNotesOpen,
  } = useInterview()

  // Mount the 1-second tick + background sync here (moved from HUD)
  useInterviewTimer()

  const [confirmEnd, setConfirmEnd] = useState(false)

  if (!activeSession) return null

  const { bar, text } = timerAccentColor(elapsed, activeSession.durationLimit)
  const isOvertime = activeSession.durationLimit && elapsed > activeSession.durationLimit

  return (
    <>
      {/* Divider */}
      <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />

      {/* Timer strip — inline, same height as topbar */}
      <div className="relative flex items-center gap-1.5">

        {/* Colored accent bar */}
        <div className={cn('h-4 w-0.5 rounded-full transition-colors duration-500', bar)} />

        {/* Digits */}
        <span className={cn(
          'font-mono text-sm font-bold tabular-nums transition-colors duration-300 select-none',
          text,
          isPaused && 'opacity-50',
        )}>
          {fmtElapsed(elapsed)}
        </span>

        {isOvertime && (
          <span className="rounded bg-red-100 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-red-600">
            over
          </span>
        )}
        {isPaused && (
          <span className="rounded bg-amber-100 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-amber-600">
            paused
          </span>
        )}

        {/* Controls */}
        <button
          onClick={isPaused ? resumeTimer : pauseTimer}
          title={isPaused ? 'Resume (P)' : 'Pause (P)'}
          className={cn(iconBtnBase, 'h-7 w-7')}
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={() => setNotesOpen(true)}
          title="Session notes (N)"
          className={cn(iconBtnBase, 'h-7 w-7')}
        >
          <StickyNote className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onToggleFullscreen}
          title="Fullscreen (F)"
          className={cn(iconBtnBase, 'h-7 w-7')}
        >
          {isFullscreen
            ? <Minimize2 className="h-3.5 w-3.5" />
            : <Maximize2 className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={() => setConfirmEnd(true)}
          title="End session"
          className="flex h-7 w-7 items-center justify-center rounded-md text-red-400
                     transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <StopCircle className="h-3.5 w-3.5" />
        </button>

        {/* Inline confirm popover */}
        {confirmEnd && (
          <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-gray-200
                          bg-white p-3 shadow-xl dark:border-[#3C3C3E] dark:bg-[#1C1C1E]">
            <p className="mb-2.5 text-[12px] text-gray-600 dark:text-gray-300">
              End after <span className="font-semibold">{fmtElapsed(elapsed)}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmEnd(false); onEndSession() }}
                className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-[11px] font-semibold
                           text-white hover:bg-indigo-700"
              >
                Save & Exit
              </button>
              <button
                onClick={() => setConfirmEnd(false)}
                className="flex-1 rounded-lg border border-gray-200 py-1.5 text-[11px]
                           text-gray-500 hover:bg-gray-50 dark:border-[#3C3C3E] dark:text-gray-400"
              >
                Keep going
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

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
  onExportDraft,
  onOpenImportDraft,
  saveStatus,
  onRetrySave,
  selectedCount,
  onClearSelection,
  canvasMode,
  onCanvasModeChange,
  onStartInterview,
  onEndInterview,
  isFullscreen,
  onToggleFullscreen,
  diagramId,
  readOnly,
  onOpenShare,
  onOpenCollab,
  onOpenDiscussion,
  unreadMentions = 0,
  onOpenCode,
  codePanelOpen = false,
  problemSlug,
  onOpenProblemDiscussion,
  problemDiscussionOpen = false,
}: TopbarProps) {
  const { theme, cycleTheme } = useEditor()
  const { activeSession } = useInterview()

  return (
    <header
      className="relative z-20 grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b
                 border-gray-200 bg-white px-3 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
    >
      {/* LEFT — Logo + title */}
      <div className="flex min-w-0 items-center">
        <div className="flex shrink-0 items-center select-none">
          <Wordmark height={22} priority />
        </div>
        <div className="mx-2 h-5 w-px shrink-0 bg-gray-200 dark:bg-[#3C3C3E]" />
        <EditableTitle value={title} onChange={onRename} readOnly={readOnly} />
        <div className="ml-2 shrink-0">
          <SaveIndicator status={saveStatus} onRetry={onRetrySave} />
        </div>
      </div>

      {/* CENTER — Interview Mode (takes only as much space as needed) */}
      <div className="flex items-center justify-center px-4">
        {!activeSession && !readOnly && (
          <Tooltip>
            <TooltipTrigger
              onClick={onStartInterview}
              className="group flex h-8 items-center gap-2 rounded-full border border-indigo-200
                         bg-indigo-50 py-1 pr-3.5 pl-1 transition-all duration-150
                         hover:border-indigo-300 hover:bg-indigo-100
                         dark:border-indigo-500/25 dark:bg-indigo-500/10
                         dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/15"
              aria-label="Turn on Interview Mode"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white
                               shadow-sm ring-1 ring-indigo-200
                               dark:bg-[#1C1C1E] dark:ring-indigo-500/30">
                <Mic className="h-3.5 w-3.5 text-indigo-500" />
              </span>
              <span className="hidden text-xs font-medium text-indigo-700 sm:block dark:text-indigo-300">
                Interview Mode
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Start a timed practice session</TooltipContent>
          </Tooltip>
        )}

        {activeSession && (
          <InlineTimer
            onEndSession={onEndInterview}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
          />
        )}
      </div>

      {/* RIGHT — Action buttons */}
      <div className="flex items-center justify-end gap-1.5">


        {/* Divider before mode toggle */}
        {!readOnly && (
          <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />
        )}

        {/* Pan / Select mode toggle */}
        <div className="mr-1 flex items-center gap-0.5 rounded-lg border border-gray-200
                        bg-gray-50 p-0.5 dark:border-[#3C3C3E] dark:bg-[#2C2C2E]">
          <Tooltip>
            <TooltipTrigger
              onClick={() => onCanvasModeChange('pan')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-all duration-100',
                canvasMode === 'pan'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-[#3C3C3E] dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              )}
            >
              <Hand className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Pan — drag to move canvas</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => onCanvasModeChange('select')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-all duration-100',
                canvasMode === 'select'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-[#3C3C3E] dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              )}
            >
              <MousePointer2 className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Select — drag to box-select nodes</TooltipContent>
          </Tooltip>
        </div>

        {!readOnly && (
          <>
            <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-[#3C3C3E]" />

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
          </>
        )}

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
            aria-label="Import / Export"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:block">Transfer</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Export
            </div>
            <DropdownMenuItem onClick={onExportPNG} className="gap-2">
              <Image className="h-4 w-4 text-indigo-500" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportSVG} className="gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-500" />
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportDraft} className="gap-2">
              <Code2 className="h-4 w-4 text-cyan-500" />
              Export as .draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPlantUML} className="gap-2">
              <Download className="h-4 w-4 text-amber-500" />
              Copy PlantUML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportMermaid} className="gap-2">
              <Download className="h-4 w-4 text-violet-500" />
              Copy Mermaid
            </DropdownMenuItem>
            {!readOnly && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Import
                </div>
                <DropdownMenuItem onClick={onOpenImportDraft} className="gap-2">
                  <Upload className="h-4 w-4 text-sky-500" />
                  Import .draft file
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Code execution panel */}
        {onOpenCode && (
          <Tooltip>
            <TooltipTrigger
              onClick={onOpenCode}
              className={cn(
                iconBtnBase,
                'w-auto gap-1.5 px-2.5 text-xs font-medium',
                codePanelOpen && 'bg-brand-tint text-brand',
              )}
              aria-label="Open code editor"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Code</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Write &amp; run code (Ctrl+Enter)</TooltipContent>
          </Tooltip>
        )}

        {/* Problem Discussions button — only shown when a problem is open */}
        {problemSlug && onOpenProblemDiscussion && (
          <Tooltip>
            <TooltipTrigger
              onClick={onOpenProblemDiscussion}
              className={cn(
                iconBtnBase,
                'w-auto gap-1.5 px-2.5 text-xs font-medium',
                problemDiscussionOpen && 'bg-brand-tint text-brand',
              )}
              aria-label="Problem discussions"
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Discussion</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Community discussions for this problem</TooltipContent>
          </Tooltip>
        )}

        {/* Comments button — only shown in collab sessions */}
        {diagramId && onOpenDiscussion && (
          <Tooltip>
            <TooltipTrigger
              onClick={onOpenDiscussion}
              className={cn(
                iconBtnBase,
                'relative w-auto gap-1.5 px-2.5 text-xs font-medium',
              )}
              aria-label="Open comments"
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Comments</span>
              {unreadMentions > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                  {unreadMentions > 9 ? '9+' : unreadMentions}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent side="bottom">Team comments &amp; mentions</TooltipContent>
          </Tooltip>
        )}

        {/* Invite collaborators */}
        {diagramId && !readOnly && onOpenCollab && (
          <Tooltip>
            <TooltipTrigger
              onClick={onOpenCollab}
              className={cn(iconBtnBase, 'w-auto gap-1.5 px-2.5 text-xs font-medium')}
              aria-label="Invite collaborators"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Invite collaborators</TooltipContent>
          </Tooltip>
        )}

        {readOnly ? (
          <div className="flex h-8 items-center gap-1.5 rounded-full border border-amber-200
                          bg-amber-50 px-3 text-xs font-medium text-amber-700">
            <Eye className="h-3.5 w-3.5" />
            View only
          </div>
        ) : diagramId && (
          <Tooltip>
            <TooltipTrigger
              onClick={onOpenShare}
              className={cn(iconBtnBase, 'w-auto gap-1.5 px-3 text-xs font-medium')}
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:block">Share</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Share this diagram</TooltipContent>
          </Tooltip>
        )}

      </div>
    </header>
  )
}
