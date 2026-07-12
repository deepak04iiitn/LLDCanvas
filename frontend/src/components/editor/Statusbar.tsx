'use client'

import { Sun, Moon, Clipboard, SquareDashedBottom } from 'lucide-react'
import { useEditor } from '@/contexts/EditorContext'

const THEME_LABELS: Record<string, string> = {
  light: 'Light',
  dark: 'Dark',
  whiteboard: 'Whiteboard',
}

function ThemeDot({ theme }: { theme: string }) {
  if (theme === 'dark')
    return <Moon className="h-3 w-3 text-indigo-400" />
  if (theme === 'whiteboard')
    return <Clipboard className="h-3 w-3 text-amber-500" />
  return <Sun className="h-3 w-3 text-yellow-500" />
}

export function Statusbar() {
  const { zoom, nodeCount, theme } = useEditor()

  const zoomPct = Math.round(zoom * 100)

  const item =
    'flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500'
  const divider = 'h-3 w-px bg-gray-200 dark:bg-[#3C3C3E]'

  return (
    <footer
      className="relative z-20 flex h-6 flex-shrink-0 items-center gap-3 border-t
                 border-gray-200 bg-white px-4 dark:border-[#2C2C2E] dark:bg-[#1C1C1E]"
    >
      {/* Zoom */}
      <span className={item}>
        <SquareDashedBottom className="h-3 w-3" />
        {zoomPct}%
      </span>

      <div className={divider} />

      {/* Node count */}
      <span className={item}>
        {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
      </span>

      <div className="flex-1" />

      {/* Theme */}
      <span className={item}>
        <ThemeDot theme={theme} />
        {THEME_LABELS[theme]}
      </span>

      {/* Keyboard shortcut hint */}
      <span className="text-[10px] text-gray-300 dark:text-gray-600 hidden sm:block">
        Press <kbd className="rounded bg-gray-100 px-1 font-mono dark:bg-[#2C2C2E]">?</kbd> for shortcuts
      </span>
    </footer>
  )
}
