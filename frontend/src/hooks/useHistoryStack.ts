import { useCallback, useRef, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'

interface HistoryEntry {
  nodes: Node[]
  edges: Edge[]
}

const MAX_HISTORY = 50

export function useHistoryStack() {
  const past = useRef<HistoryEntry[]>([])
  const future = useRef<HistoryEntry[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateFlags = useCallback(() => {
    setCanUndo(past.current.length > 0)
    setCanRedo(future.current.length > 0)
  }, [])

  const push = useCallback(
    (entry: HistoryEntry) => {
      past.current = [...past.current.slice(-MAX_HISTORY + 1), entry]
      future.current = []
      updateFlags()
    },
    [updateFlags]
  )

  const undo = useCallback(
    (current: HistoryEntry): HistoryEntry | null => {
      if (past.current.length === 0) return null
      const prev = past.current[past.current.length - 1]
      past.current = past.current.slice(0, -1)
      future.current = [current, ...future.current]
      updateFlags()
      return prev
    },
    [updateFlags]
  )

  const redo = useCallback(
    (current: HistoryEntry): HistoryEntry | null => {
      if (future.current.length === 0) return null
      const next = future.current[0]
      future.current = future.current.slice(1)
      past.current = [...past.current, current]
      updateFlags()
      return next
    },
    [updateFlags]
  )

  return { push, undo, redo, canUndo, canRedo }
}
