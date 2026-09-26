'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { journeyApi, type JourneyTip } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

type Moment = 'starting' | 'designing' | 'patterns' | 'followups' | 'explaining'

const MOMENT_CONFIG: Record<Moment, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  starting:  { label: 'Starting the Interview', emoji: '🚀', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  designing: { label: 'During Design',          emoji: '🏗️', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  patterns:  { label: 'Applying Patterns',      emoji: '🧩', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  followups: { label: 'Follow-up Questions',    emoji: '🔁', color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  explaining:{ label: 'Explaining Decisions',   emoji: '💬', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}

function TipCard({ tip, cfg }: { tip: JourneyTip; cfg: typeof MOMENT_CONFIG[Moment] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <button
      onClick={() => setExpanded(v => !v)}
      className={cn(
        'w-full text-left rounded-2xl border p-4 transition-all',
        cfg.border, expanded ? cfg.bg : 'bg-paper hover:bg-paper-elevated',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-base shrink-0">{cfg.emoji}</span>
          <p className={cn('font-medium text-[14px]', expanded ? cfg.color : 'text-ink')}>{tip.title}</p>
        </div>
        {expanded ? <ChevronUp size={14} className={cn('shrink-0 mt-0.5', cfg.color)} /> : <ChevronDown size={14} className="shrink-0 mt-0.5 text-ink-faint" />}
      </div>
      {expanded && (
        <p className="mt-3 text-[13px] text-ink leading-relaxed pl-6">{tip.body}</p>
      )}
    </button>
  )
}

function MomentSection({ moment, tips }: { moment: Moment; tips: JourneyTip[] }) {
  const cfg = MOMENT_CONFIG[moment]
  return (
    <section className="space-y-3">
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold', cfg.bg, cfg.border, cfg.color)}>
        <span>{cfg.emoji}</span> {cfg.label}
      </div>
      <div className="space-y-2">
        {tips.map(t => <TipCard key={t._id} tip={t} cfg={cfg} />)}
      </div>
    </section>
  )
}

export function TipsLibrary() {
  const [tips, setTips] = useState<Record<string, JourneyTip[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    journeyApi.getTips()
      .then(d => setTips(d.tips))
      .finally(() => setLoading(false))
  }, [])

  const moments: Moment[] = ['starting', 'designing', 'patterns', 'followups', 'explaining']

  return (
    <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-10">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
              Plannr
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Tips & Tricks</h1>
            <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
              25 battle-tested tips organised by the interview moment. Click any tip to read the full advice.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : (
            moments.map(m => tips[m]?.length ? (
              <MomentSection key={m} moment={m} tips={tips[m]} />
            ) : null)
          )}
        </div>
    </div>
  )
}
