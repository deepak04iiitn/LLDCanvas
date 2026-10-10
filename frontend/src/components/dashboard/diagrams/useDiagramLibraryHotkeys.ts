'use client'

import { useEffect } from 'react'

type Options = {
  enabled: boolean
  rowIds: string[]
  highlightedId: string | null
  peekOpen: boolean
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onHighlight: (id: string | null) => void
  onOpen: (id: string) => void
  onTogglePeek: (id: string) => void
  onClosePeek: () => void
}

export function useDiagramLibraryHotkeys({
  enabled,
  rowIds,
  highlightedId,
  peekOpen,
  searchInputRef,
  onHighlight,
  onOpen,
  onTogglePeek,
  onClosePeek,
}: Options) {
  useEffect(() => {
    if (!enabled) return

    function isTypingTarget(el: EventTarget | null) {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      )
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !isTypingTarget(e.target)) {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      if (isTypingTarget(e.target)) return

      if (e.key === 'Escape' && peekOpen) {
        e.preventDefault()
        onClosePeek()
        return
      }

      if (!rowIds.length) return

      const idx = highlightedId ? rowIds.indexOf(highlightedId) : -1

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = idx < 0 ? 0 : Math.min(idx + 1, rowIds.length - 1)
        onHighlight(rowIds[next])
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const next = idx < 0 ? rowIds.length - 1 : Math.max(idx - 1, 0)
        onHighlight(rowIds[next])
        return
      }

      if (e.key === 'Enter' && highlightedId) {
        e.preventDefault()
        onOpen(highlightedId)
        return
      }

      if (e.key === ' ' && highlightedId) {
        e.preventDefault()
        onTogglePeek(highlightedId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    enabled,
    rowIds,
    highlightedId,
    peekOpen,
    searchInputRef,
    onHighlight,
    onOpen,
    onTogglePeek,
    onClosePeek,
  ])
}
