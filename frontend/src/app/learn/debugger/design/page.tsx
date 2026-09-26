'use client'

import { useEffect, useState } from 'react'
import { DesignBugSession } from '@/components/learn/debugger/DesignBugSession'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { ArrowRight, Loader2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DesignBug {
  _id: string
  slug: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50   text-amber-700',
  hard:   'bg-red-50     text-red-600',
}

async function fetchDesignBugs(): Promise<DesignBug[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const r = await fetch(`${base}/learn/debuglab/design`, { credentials: 'include' })
  if (!r.ok) return []
  const data = await r.json()
  return data.challenges ?? data ?? []
}

async function fetchDesignBug(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const r = await fetch(`${base}/learn/debuglab/design/${id}`, { credentials: 'include' })
  if (!r.ok) return null
  return r.json()
}

export default function DesignBugPage() {
  const [bugs, setBugs] = useState<DesignBug[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [loadingBug, setLoadingBug] = useState(false)

  useEffect(() => {
    fetchDesignBugs().then(d => { setBugs(d); setLoading(false) })
  }, [])

  async function openBug(id: string) {
    setLoadingBug(true)
    const bug = await fetchDesignBug(id)
    setLoadingBug(false)
    if (bug) setSelected(bug)
  }

  if (selected) {
    return (
      <CategoryShell
        title="Design Bug Hunt"
        subtitle="Identify structural violations in UML designs"
        backHref="/learn/debugger"
        backLabel="Debug Lab"
      >
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <button
            onClick={() => setSelected(null)}
            className="mb-6 text-[13px] text-ink-muted hover:text-ink flex items-center gap-1"
          >
            ← Back to list
          </button>
          <DesignBugSession bug={selected} />
        </div>
      </CategoryShell>
    )
  }

  return (
    <CategoryShell
      title="Design Bug Hunt"
      subtitle="Find structural violations — SRP, wrong relationships, missing abstractions"
      backHref="/learn/debugger"
      backLabel="Debug Lab"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* What to expect */}
        <div className="mb-7 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
          <p className="text-[12px] font-semibold text-violet-700 mb-1 uppercase tracking-wide">
            What is Design Bug Hunt?
          </p>
          <p className="text-[13px] text-ink leading-relaxed">
            Each challenge gives you a broken UML design. Your job: identify which classes have
            structural violations — SRP, God Class, tight coupling, wrong relationships, or missing
            abstractions. These are exactly what interviewers check when they ask <em>"What would
            you improve in this design?"</em>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : bugs.length === 0 ? (
          <div className="text-center py-16">
            <Shield size={32} className="mx-auto text-ink-faint mb-3" />
            <p className="text-[14px] text-ink-muted">
              No design bug challenges yet. Seed with{' '}
              <code className="font-mono text-[12px]">seed-design-bugs.ts</code>.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {bugs.map(b => (
              <li key={b._id}>
                <button
                  onClick={() => openBug(b._id)}
                  disabled={loadingBug}
                  className="group w-full text-left flex items-start justify-between gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/30 hover:shadow-sm disabled:opacity-60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🔍</span>
                      <span className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                        DIFFICULTY_COLORS[b.difficulty],
                      )}>
                        {b.difficulty}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-violet-500">
                        Design Analysis
                      </span>
                    </div>
                    <h2 className="font-serif text-lg font-medium text-ink group-hover:text-brand transition-colors">
                      {b.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13px] text-ink-muted">{b.description}</p>
                  </div>
                  <ArrowRight size={16} className="mt-2 shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CategoryShell>
  )
}
