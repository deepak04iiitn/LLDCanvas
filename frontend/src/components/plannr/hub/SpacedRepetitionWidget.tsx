'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { journeyApi, type SpacedRepetitionItem } from '@/lib/plannr-api'

export function SpacedRepetitionWidget() {
  const [items, setItems]     = useState<SpacedRepetitionItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    journeyApi.getSpacedRepetition()
      .then(data => {
        setItems(data.items.slice(0, 3))
      })
      .catch(() => {/* silently ignore if journey not set up */})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function dismiss(id: string) {
    await journeyApi.dismissSpacedRepetitionItem(id).catch(() => {})
    setItems(prev => prev.filter(i => i._id !== id))
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-hairline bg-paper-elevated p-4 animate-pulse space-y-2">
        <div className="h-3 w-28 rounded bg-hairline" />
        <div className="h-3 w-20 rounded bg-hairline" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-4 space-y-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        Due for Review
      </p>

      {items.length === 0 ? (
        <p className="text-[12px] text-ink-faint">All caught up</p>
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item._id} className="flex items-center gap-2">
              <Link
                href={item.itemHref}
                className="flex-1 min-w-0 text-[12px] text-ink hover:text-brand truncate"
              >
                {item.itemTitle}
              </Link>
              <button
                type="button"
                onClick={() => dismiss(item._id)}
                title="Dismiss"
                className="shrink-0 text-ink-faint hover:text-brand transition-colors"
              >
                <CheckCircle2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
