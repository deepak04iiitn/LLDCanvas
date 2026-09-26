'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { RefreshCw, CheckCircle2, BookOpen, HelpCircle, Wrench } from 'lucide-react'
import { journeyApi, type SpacedRepetitionItem } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

const TYPE_META: Record<SpacedRepetitionItem['itemType'], { label: string; Icon: typeof BookOpen; color: string }> = {
  topic:           { label: 'Topic',     Icon: BookOpen,     color: 'bg-blue-100 text-blue-700' },
  quiz_question:   { label: 'Quiz',      Icon: HelpCircle,   color: 'bg-purple-100 text-purple-700' },
  studio_challenge:{ label: 'Challenge', Icon: Wrench,       color: 'bg-amber-100 text-amber-700' },
}

export function SpacedRepetitionWidget() {
  const [items, setItems]     = useState<SpacedRepetitionItem[]>([])
  const [count, setCount]     = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    journeyApi.getSpacedRepetition()
      .then(data => {
        setItems(data.items.slice(0, 5))
        setCount(data.count)
      })
      .catch(() => {/* silently ignore if journey not set up */})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function dismiss(id: string) {
    await journeyApi.dismissSpacedRepetitionItem(id).catch(() => {})
    setItems(prev => prev.filter(i => i._id !== id))
    setCount(prev => Math.max(0, prev - 1))
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-hairline bg-paper-elevated p-5 space-y-3 animate-pulse">
        <div className="h-4 w-32 rounded bg-hairline" />
        <div className="h-3 w-24 rounded bg-hairline" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-brand" strokeWidth={2} />
          <h3 className="font-medium text-[13px] text-ink">Due for Review</h3>
        </div>
        {count > 0 && (
          <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-semibold text-brand">
            {count} today
          </span>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="flex items-center gap-2 text-[12px] text-green-600 font-medium py-1">
          <CheckCircle2 size={14} />
          You&apos;re all caught up! ✓
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const meta = TYPE_META[item.itemType]
            return (
              <li key={item._id} className="flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0', meta.color)}>
                  {meta.label}
                </span>
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
                  className="shrink-0 text-ink-faint hover:text-green-600 transition-colors"
                >
                  <CheckCircle2 size={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {count > 5 && (
        <p className="text-[11px] text-ink-faint">+ {count - 5} more items</p>
      )}
    </div>
  )
}
