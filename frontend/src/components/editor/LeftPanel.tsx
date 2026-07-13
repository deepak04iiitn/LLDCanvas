'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Shapes,
  List,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  Layers,
  Tag,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '@/contexts/EditorContext'
import { STEREOTYPES } from '@/components/editor/CommandPalette'
import { ALL_PATTERNS, type PatternData } from '@/data/patterns'
import { cn } from '@/lib/utils'

interface NodeInsertItem {
  icon: React.ReactNode
  label: string
  shortcut: string
  action: () => void
}

interface LeftPanelProps {
  onAddClass: () => void
  onAddInterface: () => void
  onAddEnum: () => void
  onAddAbstract: () => void
  onAddNote: () => void
  onAddStereotype: (stereotype: string) => void
  onInsertPattern: (key: string) => void
}

const PANEL_WIDTH = 220

// Fixed display order — matches the Gang-of-Four grouping used in the
// command palette, so the two entry points read the same way.
const PATTERN_CATEGORIES = ['Creational', 'Structural', 'Behavioral'] as const

const sectionTitle =
  'px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400'

const itemBase =
  'group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 ' +
  'text-sm font-medium transition-all duration-150 ' +
  'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 ' +
  'dark:text-gray-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300'

const itemCollapsed = 'justify-center px-2'

function InsertButton({ item, collapsed }: { item: NodeInsertItem; collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger onClick={item.action} className={cn(itemBase, itemCollapsed)}>
          <span className="shrink-0 text-gray-500 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {item.icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
          <span className="ml-1.5 text-gray-400">{item.shortcut}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button onClick={item.action} className={itemBase}>
      <span className="shrink-0 text-gray-500 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      <kbd
        className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono
                   text-gray-400 dark:bg-[#2C2C2E] dark:text-gray-500"
      >
        {item.shortcut}
      </kbd>
    </button>
  )
}

function StereotypeChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left
                 text-[11px] text-gray-600 transition-colors
                 hover:bg-indigo-50 hover:text-indigo-700
                 dark:text-gray-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
    >
      <Tag className="h-3 w-3 shrink-0 text-gray-400" />
      <span className="truncate italic">&laquo;{label}&raquo;</span>
    </button>
  )
}

function PatternChip({ pattern, onClick }: { pattern: PatternData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={pattern.description}
      className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left
                 text-[11px] text-gray-600 transition-colors
                 hover:bg-indigo-50 hover:text-indigo-700
                 dark:text-gray-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
    >
      <Layers className="h-3 w-3 shrink-0 text-gray-400" />
      <span className="truncate">{pattern.name}</span>
    </button>
  )
}

export function LeftPanel({
  onAddClass,
  onAddInterface,
  onAddEnum,
  onAddAbstract,
  onAddNote,
  onAddStereotype,
  onInsertPattern,
}: LeftPanelProps) {
  const { panelOpen, togglePanel } = useEditor()

  const insertItems: NodeInsertItem[] = [
    { icon: <Box className="h-4 w-4" />,       label: 'Class',          shortcut: 'C', action: onAddClass },
    { icon: <Shapes className="h-4 w-4" />,    label: 'Interface',      shortcut: 'I', action: onAddInterface },
    { icon: <List className="h-4 w-4" />,      label: 'Enum',           shortcut: 'E', action: onAddEnum },
    { icon: <LayoutList className="h-4 w-4" />,label: 'Abstract Class', shortcut: 'A', action: onAddAbstract },
    { icon: <StickyNote className="h-4 w-4" />,label: 'Note',           shortcut: 'N', action: onAddNote },
  ]

  return (
    <div className="relative z-10 shrink-0">
      <AnimatePresence initial={false}>
        {panelOpen ? (
          <motion.aside
            key="panel-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: PANEL_WIDTH, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="flex h-full flex-col overflow-hidden border-r border-gray-200
                       bg-white dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
            style={{ width: PANEL_WIDTH, minWidth: PANEL_WIDTH }}
          >
            <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
              {/* ── Insert section ──────────────────────────────────── */}
              <section className="mb-4">
                <p className={sectionTitle}>Insert</p>
                <div className="space-y-0.5 px-2">
                  {insertItems.map(item => (
                    <InsertButton key={item.label} item={item} collapsed={false} />
                  ))}
                </div>
              </section>

              <div className="mx-3 h-px bg-gray-100 dark:bg-[#2C2C2E]" />

              {/* ── Stereotypes ─────────────────────────────────────── */}
              <section className="my-4">
                <p className={sectionTitle}>Stereotypes</p>
                <p className="mb-2 px-3 text-[10px] text-gray-400 dark:text-gray-600">
                  Inserts a Class pre-tagged with stereotype
                </p>
                <div className="px-2 space-y-0.5">
                  {STEREOTYPES.map(s => (
                    <StereotypeChip
                      key={s}
                      label={s}
                      onClick={() => onAddStereotype(s)}
                    />
                  ))}
                </div>
              </section>

              <div className="mx-3 h-px bg-gray-100 dark:bg-[#2C2C2E]" />

              {/* ── Patterns ─────────────────────────────────────────── */}
              <section className="mt-4">
                <p className={sectionTitle}>Patterns</p>
                <p className="mb-2 px-3 text-[10px] text-gray-400 dark:text-gray-600">
                  Inserts a pre-wired, connected pattern skeleton
                </p>
                <div className="space-y-3 px-2">
                  {PATTERN_CATEGORIES.map(category => {
                    const items = ALL_PATTERNS.filter(p => p.category === category)
                    if (!items.length) return null
                    return (
                      <div key={category}>
                        <p className="mb-0.5 px-2.5 text-[9px] font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-600">
                          {category}
                        </p>
                        <div className="space-y-0.5">
                          {items.map(p => (
                            <PatternChip
                              key={p.key}
                              pattern={p}
                              onClick={() => onInsertPattern(p.key)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            <button
              onClick={togglePanel}
              className="flex h-8 items-center justify-end gap-1 border-t border-gray-100
                         px-3 text-[11px] text-gray-400 transition-colors
                         hover:bg-gray-50 hover:text-gray-600
                         dark:border-[#2C2C2E] dark:hover:bg-white/5 dark:hover:text-gray-300"
              aria-label="Collapse panel"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </button>
          </motion.aside>
        ) : (
          <motion.aside
            key="panel-collapsed"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="flex h-full flex-col items-center overflow-hidden border-r border-gray-200
                       bg-white py-3 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
            style={{ width: 48, minWidth: 48 }}
          >
            <div className="flex flex-col gap-0.5">
              {insertItems.map(item => (
                <InsertButton key={item.label} item={item} collapsed />
              ))}
            </div>
            <div className="my-2 h-px w-8 bg-gray-200 dark:bg-[#2C2C2E]" />

            {/* Patterns list needs room to browse — collapsed rail just expands the panel */}
            <Tooltip>
              <TooltipTrigger onClick={togglePanel} className={cn(itemBase, itemCollapsed)}>
                <span className="shrink-0 text-gray-500 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <Layers className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Design Patterns — expand to browse</TooltipContent>
            </Tooltip>

            <div className="mt-auto">
              <Tooltip>
                <TooltipTrigger
                  onClick={togglePanel}
                  className="flex h-8 w-8 items-center justify-center rounded-md
                             text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600
                             dark:hover:bg-white/10 dark:hover:text-gray-300"
                  aria-label="Expand panel"
                >
                  <ChevronRight className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent side="right">Expand panel ([)</TooltipContent>
              </Tooltip>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
