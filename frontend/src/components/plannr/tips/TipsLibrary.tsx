'use client'

import { useEffect, useState } from 'react'
import {
  ChevronDown, ChevronUp,
  type LucideIcon,
  Rocket, HelpCircle, Tags, Focus, MessageSquare, GitBranch,
  PencilRuler, Layers, Boxes, Shuffle, Link2, Scale,
  Puzzle, Factory, Eye, Workflow, Component,
  RefreshCw, CornerDownRight, AlertTriangle, Zap,
  Mic, ListChecks, Target, Lightbulb, BookOpen,
} from 'lucide-react'
import { journeyApi, type JourneyTip } from '@/lib/plannr-api'
import { cn } from '@/lib/utils'

type Moment = 'starting' | 'designing' | 'patterns' | 'followups' | 'explaining'

const MOMENT_CONFIG: Record<Moment, {
  label: string
  Icon: LucideIcon
  color: string
  iconBg: string
  bg: string
  border: string
}> = {
  starting: {
    label: 'Starting the Interview',
    Icon: Rocket,
    color: 'text-sky-800',
    iconBg: 'bg-sky-100 text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  designing: {
    label: 'During Design',
    Icon: PencilRuler,
    color: 'text-teal-800',
    iconBg: 'bg-teal-100 text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  patterns: {
    label: 'Applying Patterns',
    Icon: Puzzle,
    color: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  followups: {
    label: 'Follow-up Questions',
    Icon: RefreshCw,
    color: 'text-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  explaining: {
    label: 'Explaining Decisions',
    Icon: Mic,
    color: 'text-rose-800',
    iconBg: 'bg-rose-100 text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
}

/** Pick a tip icon from title keywords so each row feels distinct. */
function tipIconFor(title: string, fallback: LucideIcon): LucideIcon {
  const t = title.toLowerCase()
  if (/clarif|question|ask/.test(t)) return HelpCircle
  if (/noun|class|entit/.test(t)) return Tags
  if (/scope|boundar|in.?scope/.test(t)) return Focus
  if (/assum/.test(t)) return MessageSquare
  if (/flow|user flow|journey/.test(t)) return GitBranch
  if (/responsib|srp|own/.test(t)) return Layers
  if (/interface|abstrac|contract/.test(t)) return Component
  if (/compos|has.?a/.test(t)) return Boxes
  if (/inher|extend/.test(t)) return Link2
  if (/trade.?off|decid|choose/.test(t)) return Scale
  if (/strateg/.test(t)) return Shuffle
  if (/factor/.test(t)) return Factory
  if (/observ|event|notif/.test(t)) return Eye
  if (/state|machin/.test(t)) return Workflow
  if (/pattern/.test(t)) return Puzzle
  if (/follow.?up|extend|change/.test(t)) return CornerDownRight
  if (/mistake|avoid|trap|pitfall/.test(t)) return AlertTriangle
  if (/speed|fast|time/.test(t)) return Zap
  if (/check|list|step/.test(t)) return ListChecks
  if (/goal|target|core/.test(t)) return Target
  if (/tip|trick|advice/.test(t)) return Lightbulb
  if (/explain|say|speak|verbal/.test(t)) return Mic
  if (/read|learn|book/.test(t)) return BookOpen
  return fallback
}

function TipCard({ tip, cfg }: { tip: JourneyTip; cfg: typeof MOMENT_CONFIG[Moment] }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = tipIconFor(tip.title, cfg.Icon)

  return (
    <button
      type="button"
      onClick={() => setExpanded(v => !v)}
      className={cn(
        'w-full text-left rounded-2xl border p-4 transition-all',
        cfg.border, expanded ? cfg.bg : 'bg-paper hover:bg-paper-elevated',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
            cfg.iconBg,
          )}>
            <Icon size={15} strokeWidth={2} />
          </span>
          <p className={cn('font-medium text-[14px] pt-1', expanded ? cfg.color : 'text-ink')}>
            {tip.title}
          </p>
        </div>
        {expanded
          ? <ChevronUp size={14} className={cn('shrink-0 mt-2', cfg.color)} />
          : <ChevronDown size={14} className="shrink-0 mt-2 text-ink-faint" />}
      </div>
      {expanded && (
        <p className="mt-3 text-[13px] text-ink leading-relaxed pl-11">{tip.body}</p>
      )}
    </button>
  )
}

function MomentSection({ moment, tips }: { moment: Moment; tips: JourneyTip[] }) {
  const cfg = MOMENT_CONFIG[moment]
  const Icon = cfg.Icon
  return (
    <section className="space-y-3">
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold',
        cfg.bg, cfg.border, cfg.color,
      )}>
        <Icon size={13} strokeWidth={2.25} />
        {cfg.label}
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
      <div className="w-full px-6 py-8 lg:px-8 space-y-10">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
            Plannr
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">Tips & Tricks</h1>
          <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
            Battle-tested tips organised by interview moment. Click any tip to read the full advice.
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
