'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowUpDown,
  LayoutTemplate,
  Pen,
  Plus,
  Search,
  X,
} from 'lucide-react'
import type { DiagramSummary } from '@/types'
import { formatRelativeTime, cn } from '@/lib/utils'
import {
  buildChronologyItems,
  type LibrarySort,
} from './groupDiagramsByRecency'
import { DiagramRowActions } from './DiagramRowActions'
import { useDiagramLibraryHotkeys } from './useDiagramLibraryHotkeys'

type Props = {
  diagrams: DiagramSummary[]
  loading: boolean
  search: string
  onSearchChange: (v: string) => void
  sort: LibrarySort
  onSortChange: (s: LibrarySort) => void
  highlightedId: string | null
  onHighlight: (id: string | null) => void
  peekOpen: boolean
  onOpen: (id: string) => void
  onTogglePeek: (id: string) => void
  onClosePeek: () => void
  onNew: () => void
  onRename: (id: string) => void
  onDuplicate: (id: string) => void
  onExport: (id: string) => void
  onDelete: (id: string) => void
  /** Row click: open editor on mobile, peek on desktop */
  onRowActivate: (id: string) => void
  /** When true, search is active — empty copy differs */
  isSearching: boolean
}

const HEADER_H = 32
const ROW_H = 52

export function DiagramLibrary({
  diagrams,
  loading,
  search,
  onSearchChange,
  sort,
  onSortChange,
  highlightedId,
  onHighlight,
  peekOpen,
  onOpen,
  onTogglePeek,
  onClosePeek,
  onNew,
  onRename,
  onDuplicate,
  onExport,
  onDelete,
  onRowActivate,
  isSearching,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const items = useMemo(
    () => buildChronologyItems(diagrams, sort),
    [diagrams, sort],
  )

  const rowIds = useMemo(
    () => items.filter(i => i.kind === 'row').map(i => i.key),
    [items],
  )

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: i => (items[i]?.kind === 'header' ? HEADER_H : ROW_H),
    overscan: 8,
  })

  useDiagramLibraryHotkeys({
    enabled: !loading && diagrams.length > 0,
    rowIds,
    highlightedId,
    peekOpen,
    searchInputRef,
    onHighlight,
    onOpen,
    onTogglePeek,
    onClosePeek,
  })

  useEffect(() => {
    if (!highlightedId) return
    const index = items.findIndex(
      i => i.kind === 'row' && i.key === highlightedId,
    )
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when highlight changes
  }, [highlightedId])

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-hairline bg-paper-elevated/60 px-4 py-3 sm:px-6">
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            ref={searchInputRef}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search diagrams…  (/)"
            className="h-9 w-full rounded-lg border border-hairline bg-paper pl-8 pr-8 text-xs outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSortChange(sort === 'recent' ? 'name' : 'recent')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-hairline px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-hairline/50 hover:text-ink"
          title="Toggle sort"
        >
          <ArrowUpDown size={13} />
          {sort === 'recent' ? 'Recent' : 'Name'}
        </button>

        {!loading && (
          <span className="hidden rounded-md bg-hairline/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-ink-muted sm:inline">
            {diagrams.length}
          </span>
        )}

        <button
          type="button"
          onClick={onNew}
          className="ml-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* List */}
      <div
        ref={parentRef}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        role="listbox"
        aria-label="Diagrams"
      >
        {loading ? (
          <div className="space-y-1 px-4 py-3 sm:px-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-hairline/50" />
            ))}
          </div>
        ) : diagrams.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint">
              {isSearching ? (
                <Search className="h-5 w-5 text-brand" />
              ) : (
                <Pen className="h-5 w-5 text-brand" />
              )}
            </div>
            <p className="text-sm font-semibold text-ink">
              {isSearching ? 'No matches' : 'No diagrams yet'}
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink-faint">
              {isSearching
                ? 'Try another search term'
                : 'Create your first UML diagram and it will show up here.'}
            </p>
            {!isSearching && (
              <button
                type="button"
                onClick={onNew}
                className="mt-4 text-xs font-semibold text-brand hover:underline"
              >
                + New diagram
              </button>
            )}
          </div>
        ) : (
          <div
            className="relative w-full px-2 sm:px-4"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map(vItem => {
              const item = items[vItem.index]
              if (!item) return null

              if (item.kind === 'header') {
                return (
                  <div
                    key={item.key}
                    className="absolute top-0 left-0 w-full px-2 sm:px-2"
                    style={{
                      height: vItem.size,
                      transform: `translateY(${vItem.start}px)`,
                    }}
                  >
                    <div className="flex h-full items-end px-2 pb-1">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                        {item.label}
                      </span>
                    </div>
                  </div>
                )
              }

              const d = item.diagram
              const active = highlightedId === d._id

              return (
                <div
                  key={item.key}
                  className="absolute top-0 left-0 w-full px-0 sm:px-2"
                  style={{
                    height: vItem.size,
                    transform: `translateY(${vItem.start}px)`,
                  }}
                >
                  <div
                    role="option"
                    aria-selected={active}
                    tabIndex={-1}
                    onClick={() => {
                      onHighlight(d._id)
                      onRowActivate(d._id)
                    }}
                    onDoubleClick={() => onOpen(d._id)}
                    className={cn(
                      'group flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 transition-colors',
                      active
                        ? 'bg-brand-tint ring-1 ring-brand/15'
                        : 'hover:bg-hairline/55',
                    )}
                  >
                    <div className="h-9 w-12 shrink-0 overflow-hidden rounded-lg border border-hairline bg-paper">
                      {d.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.thumbnail}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <LayoutTemplate className="h-3.5 w-3.5 text-ink-faint/45" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-[13px] font-semibold',
                          active ? 'text-brand' : 'text-ink',
                        )}
                      >
                        {d.title}
                      </p>
                      <p className="truncate text-[11px] text-ink-faint sm:hidden">
                        {formatRelativeTime(d.updatedAt)}
                      </p>
                    </div>

                    <p className="hidden shrink-0 text-[11px] tabular-nums text-ink-faint sm:block">
                      {formatRelativeTime(d.updatedAt)}
                    </p>

                    <div className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                      <DiagramRowActions
                        onRename={() => onRename(d._id)}
                        onDuplicate={() => onDuplicate(d._id)}
                        onExport={() => onExport(d._id)}
                        onDelete={() => onDelete(d._id)}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
