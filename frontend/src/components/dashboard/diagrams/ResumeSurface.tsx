'use client'

import {
  ArrowUpRight,
  LayoutTemplate,
} from 'lucide-react'
import type { DiagramSummary } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { DiagramRowActions } from './DiagramRowActions'

type Props = {
  diagram: DiagramSummary
  onOpen: () => void
  onRename: () => void
  onDuplicate: () => void
  onExport: () => void
  onDelete: () => void
}

export function ResumeSurface({
  diagram,
  onOpen,
  onRename,
  onDuplicate,
  onExport,
  onDelete,
}: Props) {
  return (
    <section className="relative shrink-0 overflow-hidden border-b border-hairline">
      {/* Atmospheric thumbnail */}
      <div className="pointer-events-none absolute inset-0">
        {diagram.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={diagram.thumbnail}
            alt=""
            className="h-full w-full object-cover opacity-[0.14] saturate-50"
          />
        ) : (
          <div
            className="h-full w-full opacity-60"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--hairline) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-paper via-paper/92 to-paper/70" />
      </div>

      <div className="relative flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-hairline bg-paper-elevated shadow-sm sm:block">
            {diagram.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={diagram.thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <LayoutTemplate className="h-5 w-5 text-ink-faint/50" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Continue
            </p>
            <h2 className="mt-1 truncate font-serif text-xl font-medium tracking-tight text-ink sm:text-2xl">
              {diagram.title}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Updated {formatRelativeTime(diagram.updatedAt)}
              <span className="mx-1.5 text-hairline-strong">·</span>
              Created {formatRelativeTime(diagram.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <DiagramRowActions
            onRename={onRename}
            onDuplicate={onDuplicate}
            onExport={onExport}
            onDelete={onDelete}
          />
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover"
          >
            Open editor
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
