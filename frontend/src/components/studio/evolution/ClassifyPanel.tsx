'use client'

import { cn } from '@/lib/utils'

export type ClassifyBucket = 'keep' | 'change' | 'introduce' | 'remove'

export interface ClassifyPanelProps {
  componentNames: string[]
  buckets: Record<string, ClassifyBucket>
  onSet: (name: string, bucket: ClassifyBucket) => void
  introduceText: string
  onIntroduceText: (v: string) => void
  className?: string
}

const BUCKETS: { id: ClassifyBucket; label: string; hint: string }[] = [
  { id: 'keep', label: 'Keep', hint: 'Leave as-is' },
  { id: 'change', label: 'Change', hint: 'Modify' },
  { id: 'remove', label: 'Remove', hint: 'Drop / replace' },
]

export function ClassifyPanel({
  componentNames,
  buckets,
  onSet,
  introduceText,
  onIntroduceText,
  className,
}: ClassifyPanelProps) {
  return (
    <div className={cn('space-y-3 px-4 py-3 sm:px-6', className)}>
      <div>
        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Keep · Change · Remove
        </p>
        <p className="mb-3 text-[12px] text-ink-muted">
          Classify current components before you edit. This forces deliberate reasoning.
        </p>
        <ul className="space-y-2">
          {componentNames.map(name => (
            <li
              key={name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-hairline bg-paper-elevated px-3 py-2"
            >
              <span className="text-[13px] font-medium text-ink">{name}</span>
              <div className="flex gap-1">
                {BUCKETS.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    title={b.hint}
                    onClick={() => onSet(name, b.id)}
                    className={cn(
                      'rounded px-2 py-0.5 text-[11px] font-medium',
                      buckets[name] === b.id
                        ? 'bg-brand text-white'
                        : 'bg-hairline/50 text-ink-muted hover:bg-hairline',
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Introduce (optional)
        </p>
        <input
          type="text"
          value={introduceText}
          onChange={e => onIntroduceText(e.target.value)}
          placeholder="e.g. PaymentGateway, MessageQueue"
          className="w-full rounded-md border border-hairline bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
        />
      </div>
    </div>
  )
}
