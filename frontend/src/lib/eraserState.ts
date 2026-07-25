'use client'

import { useEffect, useState } from 'react'

/**
 * Module-level singleton that tracks eraser tool state.
 *
 * Using a pub/sub pattern instead of React context avoids re-rendering every
 * node and edge component when the hovered element changes. Only the two
 * components whose IDs become hovered/unhovered get a re-render.
 */

let _active = false
let _hoveredId: string | null = null
const _listeners = new Set<() => void>()

function notify() {
  _listeners.forEach(fn => fn())
}

export const EraserState = {
  get active(): boolean { return _active },
  get hoveredId(): string | null { return _hoveredId },

  setActive(active: boolean): void {
    if (_active === active) return
    _active = active
    if (!active) _hoveredId = null
    notify()
  },

  setHoveredId(id: string | null): void {
    if (_hoveredId === id) return
    _hoveredId = id
    notify()
  },

  subscribe(fn: () => void): () => void {
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  },
}

/**
 * Hook for node / edge components. Returns `true` when this element is
 * currently being targeted by the eraser (hover highlight).
 */
export function useEraserHighlight(elementId: string): boolean {
  const [highlighted, setHighlighted] = useState(
    () => EraserState.active && EraserState.hoveredId === elementId,
  )

  useEffect(() => {
    return EraserState.subscribe(() => {
      setHighlighted(EraserState.active && EraserState.hoveredId === elementId)
    })
  }, [elementId])

  return highlighted
}
