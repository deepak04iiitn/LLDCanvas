'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { journeyApi, type PracticeHubItem } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

export default function PlannrPracticePage() {
  const [items, setItems] = useState<PracticeHubItem[]>([])
  const [defaultDiff, setDefaultDiff] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    journeyApi.listPracticeHub()
      .then(res => {
        setItems(res.items)
        setDefaultDiff(res.defaultDifficulty)
        setFilter(res.defaultDifficulty)
      })
      .catch(e => setError(e?.message ?? 'Failed to load practice'))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter(i => i.difficulty === filter)),
    [items, filter],
  )

  return (
    <div className="w-full px-6 py-10 lg:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-2">Plannr · Practice</p>
      <h1 className="font-serif text-[32px] font-medium text-ink tracking-tight">Practice hub</h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        Native problems from your path. Suggested difficulty: {defaultDiff}.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-3 py-1 text-[12px] font-medium capitalize',
              filter === f ? 'border-brand bg-brand/10 text-brand' : 'border-hairline text-ink-muted',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        </div>
      ) : error ? (
        <p className="mt-12 text-center text-[13px] text-ink-muted">{error}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {visible.map(item => (
            <li key={`${item.topicSlug}-${item.id}`}>
              <Link
                href={`/dashboard/plannr/topic/${item.topicSlug}`}
                className="block rounded-xl border border-hairline bg-paper-elevated px-4 py-3 hover:border-brand/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                      Stage {item.stage} · {item.topicTitle}
                    </p>
                    <p className="text-[14px] text-ink mt-0.5 line-clamp-2">{item.prompt}</p>
                  </div>
                  <span className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                    item.solved && 'border-emerald-500/40 text-emerald-700',
                  )}>
                    {item.solved ? 'solved' : item.difficulty}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {visible.length === 0 && (
            <p className="text-[13px] text-ink-muted py-8 text-center">No practice items yet — open a topic module to unlock practice.</p>
          )}
        </ul>
      )}
    </div>
  )
}
