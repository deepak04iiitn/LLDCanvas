'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Code2, Loader2, Search } from 'lucide-react'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { cn } from '@/lib/utils'

interface SolveRecord {
  _id: string
  challengeId: string
  mode: 'code' | 'design'
  timeTakenSeconds: number
  isSolved: boolean
  solvedAt: string
  challengeTitle?: string
  challengeDifficulty?: string
}

interface HistoryData {
  solves: SolveRecord[]
  totalSolved: number
  codeCount: number
  designCount: number
}

export default function DebuggerHistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    fetch(`${base}/learn/debugger/history`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function formatTime(secs: number) {
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  return (
    <CategoryShell
      title="Debug Lab History"
      subtitle="Your solved code and design bugs"
      backHref="/learn/debugger"
      backLabel="Debug Lab"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !data || data.totalSolved === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] text-ink-muted mb-4">No solved challenges yet.</p>
            <Link href="/learn/debugger" className="text-[13px] text-brand hover:underline">
              Start with Code Bugs →
            </Link>
            {' · '}
            <Link href="/learn/debugger/design" className="text-[13px] text-brand hover:underline">
              Try Design Bugs →
            </Link>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Total Solved', value: data.totalSolved, icon: CheckCircle2, color: 'text-emerald-600' },
                { label: 'Code Bugs', value: data.codeCount, icon: Code2, color: 'text-brand' },
                { label: 'Design Bugs', value: data.designCount, icon: Search, color: 'text-violet-600' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-hairline bg-paper-elevated p-4 text-center">
                  <s.icon size={18} className={cn('mx-auto mb-1', s.color)} />
                  <p className="text-2xl font-bold text-ink">{s.value}</p>
                  <p className="text-[11px] text-ink-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Solve list */}
            <ul className="space-y-2">
              {data.solves.map(s => (
                <li key={s._id} className="flex items-center gap-3 rounded-xl border border-hairline bg-paper-elevated px-4 py-3">
                  {s.mode === 'design'
                    ? <Search size={15} className="shrink-0 text-violet-500" />
                    : <Code2 size={15} className="shrink-0 text-brand" />
                  }
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink truncate">
                      {s.challengeTitle ?? 'Challenge'}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {new Date(s.solvedAt).toLocaleDateString()} · {formatTime(s.timeTakenSeconds)}
                    </p>
                  </div>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    s.mode === 'design' ? 'bg-violet-50 text-violet-600' : 'bg-brand-tint text-brand',
                  )}>
                    {s.mode}
                  </span>
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </CategoryShell>
  )
}
