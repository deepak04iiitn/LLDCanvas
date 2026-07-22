'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DIFF_META, type PublicProblemSummary } from '@/lib/public-api'

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'] as const
type Diff = (typeof DIFFICULTIES)[number]

export function InterviewQuestionsIndexClient({ problems }: { problems: PublicProblemSummary[] }) {
  const [q, setQ] = useState('')
  const [diff, setDiff] = useState<Diff>('all')
  const [category, setCategory] = useState('')

  const categories = useMemo(
    () => [...new Set(problems.map(p => p.category))].sort(),
    [problems],
  )

  const filtered = useMemo(() => {
    return problems.filter(p => {
      if (diff !== 'all' && p.difficulty !== diff) return false
      if (category && p.category !== category) return false
      if (q.trim() && !p.title.toLowerCase().includes(q.trim().toLowerCase())) return false
      return true
    })
  }, [problems, diff, category, q])

  return (
    <>
      {/* Filters */}
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search questions…"
              className="h-9 w-full rounded-lg border border-hairline-strong bg-paper pl-9 pr-3
                         text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-hairline bg-paper p-1">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={cn(
                  'rounded-md px-3 py-1.5 font-mono text-[11px] font-medium capitalize transition-all',
                  diff === d ? 'bg-brand text-brand-foreground shadow-sm' : 'text-ink-muted hover:text-ink',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={cn(
              'rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all',
              !category ? 'border-brand bg-brand text-brand-foreground' : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/40',
            )}
          >
            All categories
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? '' : c)}
              className={cn(
                'rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all',
                category === c ? 'border-brand bg-brand text-brand-foreground' : 'border-hairline-strong bg-paper text-ink-muted hover:border-brand/40',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-faint">No questions match your filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => {
              const m = DIFF_META[p.difficulty]
              return (
                <Link
                  key={p.slug}
                  href={`/features/interview-questions/${p.slug}`}
                  className="group flex flex-col gap-2.5 rounded-xl border border-hairline bg-paper-elevated p-5
                             transition-all hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-md"
                >
                  <span className={cn(
                    'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ring-1',
                    m.bg, m.color, m.ring,
                  )}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
                    {m.label}
                  </span>
                  <h3 className="text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
                    {p.title}
                  </h3>
                  <p className="font-mono text-[11px] text-ink-faint">{p.category}</p>
                  {p.companies.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.companies.slice(0, 3).map(c => (
                        <span key={c} className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
