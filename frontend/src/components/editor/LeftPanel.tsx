'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Box,
  Shapes,
  List,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  'px-3 mb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-ink-faint'

const itemBase =
  'group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 ' +
  'text-sm font-medium transition-all duration-150 ' +
  'text-ink-muted hover:bg-brand-tint hover:text-brand'

const itemCollapsed = 'justify-center px-2'

function InsertButton({ item, collapsed }: { item: NodeInsertItem; collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger onClick={item.action} className={cn(itemBase, itemCollapsed)}>
          <span className="shrink-0 text-ink-faint transition-colors group-hover:text-brand">
            {item.icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
          <span className="ml-1.5 text-ink-faint">{item.shortcut}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button onClick={item.action} className={itemBase}>
      <span className="shrink-0 text-ink-faint transition-colors group-hover:text-brand">
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      <kbd
        className="ml-auto rounded bg-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
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
                 text-[11px] text-ink-muted transition-colors
                 hover:bg-brand-tint hover:text-brand"
    >
      <Tag className="h-3 w-3 shrink-0 text-ink-faint" />
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
                 text-[11px] text-ink-muted transition-colors
                 hover:bg-brand-tint hover:text-brand"
    >
      <Layers className="h-3 w-3 shrink-0 text-ink-faint" />
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
  const [patternsOpen,     setPatternsOpen]     = useState(false)
  const [stereotypesOpen,  setStereotypesOpen]  = useState(false)

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
            className="flex h-full flex-col overflow-hidden border-r border-hairline bg-paper-elevated"
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

              <div className="mx-3 h-px bg-hairline" />

              {/* ── Patterns ─────────────────────────────────────────── */}
              <section className="my-1">
                <button
                  onClick={() => setPatternsOpen(o => !o)}
                  className="flex w-full items-center justify-between px-3 py-2
                             transition-colors hover:bg-hairline/50"
                >
                  <span className={sectionTitle + ' mb-0'}>Design Patterns</span>
                  {patternsOpen
                    ? <ChevronUp className="h-3 w-3 text-ink-faint" />
                    : <ChevronDown className="h-3 w-3 text-ink-faint" />}
                </button>
                <AnimatePresence initial={false}>
                  {patternsOpen && (
                    <motion.div
                      key="patterns-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <p className="mb-2 px-3 text-[10px] text-ink-faint">
                        Inserts a pre-wired, connected pattern skeleton
                      </p>
                      <div className="space-y-3 px-2 pb-2">
                        {PATTERN_CATEGORIES.map(category => {
                          const items = ALL_PATTERNS.filter(p => p.category === category)
                          if (!items.length) return null
                          return (
                            <div key={category}>
                              <p className="mb-0.5 px-2.5 font-mono text-[9px] font-medium tracking-wide text-ink-faint uppercase">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <div className="mx-3 h-px bg-hairline" />

              {/* ── Stereotypes ─────────────────────────────────────── */}
              <section className="my-1">
                <button
                  onClick={() => setStereotypesOpen(o => !o)}
                  className="flex w-full items-center justify-between px-3 py-2
                             transition-colors hover:bg-hairline/50"
                >
                  <span className={sectionTitle + ' mb-0'}>Class Roles</span>
                  {stereotypesOpen
                    ? <ChevronUp className="h-3 w-3 text-ink-faint" />
                    : <ChevronDown className="h-3 w-3 text-ink-faint" />}
                </button>
                <AnimatePresence initial={false}>
                  {stereotypesOpen && (
                    <motion.div
                      key="stereotypes-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <p className="mb-2 px-3 text-[10px] text-ink-faint">
                        Inserts a Class pre-tagged with its role
                      </p>
                      <div className="px-2 space-y-0.5 pb-2">
                        {STEREOTYPES.map(s => (
                          <StereotypeChip
                            key={s}
                            label={s}
                            onClick={() => onAddStereotype(s)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            <button
              onClick={togglePanel}
              className="flex h-8 items-center justify-end gap-1 border-t border-hairline
                         px-3 text-[11px] text-ink-faint transition-colors
                         hover:bg-hairline/50 hover:text-ink"
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
            className="flex h-full flex-col items-center overflow-hidden border-r border-hairline
                       bg-paper-elevated py-3"
            style={{ width: 48, minWidth: 48 }}
          >
            <div className="flex flex-col gap-0.5">
              {insertItems.map(item => (
                <InsertButton key={item.label} item={item} collapsed />
              ))}
            </div>
            <div className="my-2 h-px w-8 bg-hairline" />

            {/* Patterns list needs room to browse — collapsed rail just expands the panel */}
            <Tooltip>
              <TooltipTrigger onClick={togglePanel} className={cn(itemBase, itemCollapsed)}>
                <span className="shrink-0 text-ink-faint transition-colors group-hover:text-brand">
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
                             text-ink-faint transition-colors hover:bg-hairline hover:text-ink"
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
