'use client'

import { cn } from '@/lib/utils'

export interface PredictImpactPanelProps {
  classNames: string[]
  relationshipLabels: string[]
  selectedClasses: Set<string>
  selectedRels: Set<string>
  onToggleClass: (name: string) => void
  onToggleRel: (key: string) => void
  onConfirm: () => void
  disabled?: boolean
  className?: string
}

export function PredictImpactPanel({
  classNames,
  relationshipLabels,
  selectedClasses,
  selectedRels,
  onToggleClass,
  onToggleRel,
  onConfirm,
  disabled,
  className,
}: PredictImpactPanelProps) {
  return (
    <div className={cn('mx-auto max-w-xl px-4 py-8 sm:px-6', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Before you edit
      </p>
      <h2 className="mt-1 font-serif text-2xl text-ink">Predict the impact</h2>
      <p className="mt-2 text-[13px] text-ink-muted">
        Which parts of the architecture do you expect to change? Then make the smallest edit that
        satisfies the request.
      </p>

      <div className="mt-6">
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Components
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {classNames.map(name => (
            <li key={name}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-hairline px-3 py-2 text-[13px] hover:bg-hairline/30">
                <input
                  type="checkbox"
                  checked={selectedClasses.has(name)}
                  onChange={() => onToggleClass(name)}
                  className="accent-brand"
                />
                <span className="font-mono text-[12px]">{name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {relationshipLabels.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Relationships
          </p>
          <ul className="space-y-1.5">
            {relationshipLabels.map(label => (
              <li key={label}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-hairline px-3 py-2 text-[13px] hover:bg-hairline/30">
                  <input
                    type="checkbox"
                    checked={selectedRels.has(label)}
                    onChange={() => onToggleRel(label)}
                    className="accent-brand"
                  />
                  <span className="font-mono text-[12px]">{label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled={disabled || selectedClasses.size === 0}
        onClick={onConfirm}
        className="mt-8 w-full rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 sm:w-auto"
      >
        Lock prediction & edit design
      </button>
    </div>
  )
}
