'use client'

import { useCallback, useMemo, useState } from 'react'

/** Row selection for admin tables. Pass the visible page ids so “select all” is page-scoped. */
export function useRowSelection(pageIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const selectedIds = useMemo(() => [...selected], [selected])
  const count = selected.size

  const pageSelectedCount = useMemo(
    () => pageIds.filter(id => selected.has(id)).length,
    [pageIds, selected],
  )
  const allPageSelected = pageIds.length > 0 && pageSelectedCount === pageIds.length
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const togglePage = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev)
      const allOn = pageIds.length > 0 && pageIds.every(id => next.has(id))
      if (allOn) pageIds.forEach(id => next.delete(id))
      else pageIds.forEach(id => next.add(id))
      return next
    })
  }, [pageIds])

  const clear = useCallback(() => setSelected(new Set()), [])

  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  return {
    selected,
    selectedIds,
    count,
    allPageSelected,
    somePageSelected,
    toggle,
    togglePage,
    clear,
    isSelected,
  }
}
