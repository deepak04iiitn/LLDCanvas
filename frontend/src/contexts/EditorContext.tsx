'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { CanvasTheme } from '@/types'

interface EditorContextValue {
  theme: CanvasTheme
  setTheme: (t: CanvasTheme) => void
  cycleTheme: () => void
  panelOpen: boolean
  togglePanel: () => void
  zoom: number
  setZoom: (z: number) => void
  nodeCount: number
  setNodeCount: (n: number) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

const THEME_CYCLE: CanvasTheme[] = ['light', 'dark', 'whiteboard']

interface EditorProviderProps {
  children: ReactNode
  initialTheme?: CanvasTheme
}

export function EditorProvider({ children, initialTheme = 'light' }: EditorProviderProps) {
  const [theme, setTheme] = useState<CanvasTheme>(initialTheme)
  const [panelOpen, setPanelOpen] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [nodeCount, setNodeCount] = useState(0)

  const cycleTheme = useCallback(() => {
    setTheme(prev => {
      const idx = THEME_CYCLE.indexOf(prev)
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
    })
  }, [])

  const togglePanel = useCallback(() => {
    setPanelOpen(prev => !prev)
  }, [])

  return (
    <EditorContext.Provider
      value={{ theme, setTheme, cycleTheme, panelOpen, togglePanel, zoom, setZoom, nodeCount, setNodeCount }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider')
  return ctx
}
