import { useEffect } from 'react'

interface ShortcutHandlers {
  onAddClass: () => void
  onAddInterface: () => void
  onAddEnum: () => void
  onAddAbstract: () => void
  onDelete: () => void
  onDuplicate: () => void
  onUndo: () => void
  onRedo: () => void
  onOpenCommandPalette: () => void
  onFitView: () => void
  onTogglePanel: () => void
  onCopy: () => void
  onPaste: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl combos always fire regardless of editing state
      if (ctrl) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handlers.onUndo(); return }
        if (e.key === 'z' && e.shiftKey)  { e.preventDefault(); handlers.onRedo(); return }
        if (e.key === 'y')                 { e.preventDefault(); handlers.onRedo(); return }
        if (e.key === 'd')                 { e.preventDefault(); handlers.onDuplicate(); return }
        if (e.key === 'k')                 { e.preventDefault(); handlers.onOpenCommandPalette(); return }
        if (e.key === 'c')                 { handlers.onCopy(); return }
        if (e.key === 'v')                 { handlers.onPaste(); return }
      }

      // Single-key shortcuts — skip if user is typing
      if (isEditing) return

      switch (e.key) {
        case 'c': case 'C': handlers.onAddClass(); break
        case 'i': case 'I': handlers.onAddInterface(); break
        case 'e': case 'E': handlers.onAddEnum(); break
        case 'a': case 'A': handlers.onAddAbstract(); break
        case 'f': case 'F': handlers.onFitView(); break
        case '[':            handlers.onTogglePanel(); break
        case 'Delete':
        case 'Backspace':   handlers.onDelete(); break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}
