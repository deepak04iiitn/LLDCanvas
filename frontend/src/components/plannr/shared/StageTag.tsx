import { cn } from '@/lib/utils'

const STAGE_COLORS: Record<number, string> = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-violet-50 text-violet-700 border-violet-200',
  3: 'bg-amber-50 text-amber-700 border-amber-200',
  4: 'bg-green-50 text-green-700 border-green-200',
  5: 'bg-red-50 text-red-700 border-red-200',
}

const STAGE_LABELS: Record<number, string> = {
  1: 'Speak OOP',
  2: 'Responsibilities',
  3: 'Design for Change',
  4: 'Interview Thinking',
  5: 'Pressure Test',
}

interface StageTagProps {
  stage: number
  className?: string
  short?: boolean
}

export function StageTag({ stage, className, short = false }: StageTagProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
      STAGE_COLORS[stage] ?? 'bg-paper text-ink-muted border-hairline',
      className,
    )}>
      {short ? `S${stage}` : `Stage ${stage} · ${STAGE_LABELS[stage] ?? ''}`}
    </span>
  )
}
