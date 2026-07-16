'use client'

import {
  Box,
  Shapes,
  List,
  LayoutList,
  StickyNote,
  Maximize2,
  PanelLeftClose,
  FileCode2,
  Image,
  Tag,
  Sparkles,
} from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { ALL_PATTERNS } from '@/data/patterns'

// ─── All 13 LLD stereotypes from PRD §6.5 ────────────────────────────────────
export const STEREOTYPES = [
  'Repository', 'Service', 'Controller', 'DTO', 'Entity',
  'Value Object', 'Factory', 'Builder', 'Singleton',
  'Manager', 'Adapter', 'Proxy', 'Facade',
]

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CommandPaletteActions {
  addClass: () => void
  addInterface: () => void
  addEnum: () => void
  addAbstract: () => void
  addNote: () => void
  addStereotype: (s: string) => void
  insertPattern: (key: string) => void
  fitView: () => void
  togglePanel: () => void
  exportPNG: () => void
  exportSVG: () => void
  exportPlantUML: () => void
  exportMermaid: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  actions: CommandPaletteActions
}

function run(fn: () => void, onClose: () => void) {
  fn()
  onClose()
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CommandPalette({ open, onClose, actions }: CommandPaletteProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={v => !v && onClose()}
      title="Command Palette"
      description="Search for a command to run"
    >
      <Command>
        <CommandInput placeholder="Search commands…" autoFocus />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>

          {/* Insert ──────────────────────────────────────────────────────── */}
          <CommandGroup heading="Insert">
            <CommandItem value="add class" onSelect={() => run(actions.addClass, onClose)} className="gap-2">
              <Box className="h-4 w-4 text-indigo-500" />
              Add Class
              <CommandShortcut>C</CommandShortcut>
            </CommandItem>
            <CommandItem value="add interface" onSelect={() => run(actions.addInterface, onClose)} className="gap-2">
              <Shapes className="h-4 w-4 text-sky-500" />
              Add Interface
              <CommandShortcut>I</CommandShortcut>
            </CommandItem>
            <CommandItem value="add enum" onSelect={() => run(actions.addEnum, onClose)} className="gap-2">
              <List className="h-4 w-4 text-emerald-500" />
              Add Enum
              <CommandShortcut>E</CommandShortcut>
            </CommandItem>
            <CommandItem value="add abstract class" onSelect={() => run(actions.addAbstract, onClose)} className="gap-2">
              <LayoutList className="h-4 w-4 text-violet-500" />
              Add Abstract Class
              <CommandShortcut>A</CommandShortcut>
            </CommandItem>
            <CommandItem value="add note" onSelect={() => run(actions.addNote, onClose)} className="gap-2">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Add Note
            </CommandItem>
          </CommandGroup>

          {/* Class roles ─────────────────────────────────────────────────── */}
          <CommandSeparator />
          <CommandGroup heading="Insert with Class Role">
            {STEREOTYPES.map(s => (
              <CommandItem
                key={s}
                value={`stereotype ${s.toLowerCase()}`}
                onSelect={() => run(() => actions.addStereotype(s), onClose)}
                className="gap-2"
              >
                <Tag className="h-4 w-4 text-gray-400" />
                <span>
                  <span className="italic text-gray-500">&laquo;{s}&raquo;</span>
                  {' '}Class
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Design Patterns ─────────────────────────────────────────────── */}
          <CommandSeparator />
          <CommandGroup heading="Design Patterns">
            {ALL_PATTERNS.map(p => (
              <CommandItem
                key={p.key}
                value={`pattern ${p.key} ${p.name.toLowerCase()} ${p.category.toLowerCase()}`}
                onSelect={() => run(() => actions.insertPattern(p.key), onClose)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="flex-1">
                  {p.name}
                  <span className="ml-1.5 text-[10px] text-gray-400">{p.category}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Canvas ──────────────────────────────────────────────────────── */}
          <CommandSeparator />
          <CommandGroup heading="Canvas">
            <CommandItem value="fit view zoom fit" onSelect={() => run(actions.fitView, onClose)} className="gap-2">
              <Maximize2 className="h-4 w-4 text-gray-500" />
              Fit View
              <CommandShortcut>F</CommandShortcut>
            </CommandItem>
            <CommandItem value="toggle left panel sidebar" onSelect={() => run(actions.togglePanel, onClose)} className="gap-2">
              <PanelLeftClose className="h-4 w-4 text-gray-500" />
              Toggle Left Panel
              <CommandShortcut>[</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          {/* Export ──────────────────────────────────────────────────────── */}
          <CommandSeparator />
          <CommandGroup heading="Export">
            <CommandItem value="export png image" onSelect={() => run(actions.exportPNG, onClose)} className="gap-2">
              <Image className="h-4 w-4 text-indigo-500" />
              Export as PNG
            </CommandItem>
            <CommandItem value="export svg vector" onSelect={() => run(actions.exportSVG, onClose)} className="gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-500" />
              Export as SVG
            </CommandItem>
            <CommandItem value="export plantuml text" onSelect={() => run(actions.exportPlantUML, onClose)} className="gap-2">
              <FileCode2 className="h-4 w-4 text-amber-500" />
              Copy PlantUML Text
            </CommandItem>
            <CommandItem value="export mermaid diagram" onSelect={() => run(actions.exportMermaid, onClose)} className="gap-2">
              <FileCode2 className="h-4 w-4 text-violet-500" />
              Copy Mermaid Text
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
