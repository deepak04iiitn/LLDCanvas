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

/** Infer a brief role hint from the class name heuristic */
function classHint(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('controller') || lower.includes('handler')) return 'Coordinates requests between layers'
  if (lower.includes('service')) return 'Contains core business logic'
  if (lower.includes('repository') || lower.includes('repo') || lower.includes('dao')) return 'Manages data access'
  if (lower.includes('factory')) return 'Creates instances of other classes'
  if (lower.includes('interface') || lower.startsWith('i') && name[1] === name[1].toUpperCase()) return 'Defines a contract / abstraction'
  if (lower.includes('model') || lower.includes('entity')) return 'Represents a domain object'
  if (lower.includes('util') || lower.includes('helper')) return 'Shared utility logic'
  if (lower.includes('config')) return 'Configuration and settings'
  if (lower.includes('event')) return 'Carries event data between components'
  if (lower.includes('observer') || lower.includes('listener')) return 'Reacts to state changes'
  return 'Part of the design'
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
  const totalSelected = selectedClasses.size + selectedRels.size

  return (
    <div className={cn('mx-auto max-w-2xl px-4 py-8 sm:px-6', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        Before you edit
      </p>
      <h2 className="mt-1 font-serif text-2xl text-ink">Predict the impact</h2>
      <p className="mt-2 text-[13px] text-ink-muted">
        Which parts of the architecture do you expect to change? Select them below, then make the
        smallest edit that satisfies the requirement.
      </p>

      {/* Running selection count */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-3 py-1 font-mono text-[12px] font-semibold transition-colors',
            totalSelected > 0
              ? 'bg-brand/10 text-brand'
              : 'bg-hairline/40 text-ink-faint',
          )}
        >
          {totalSelected} {totalSelected === 1 ? 'element' : 'elements'} selected
        </span>
        {totalSelected > 0 && (
          <span className="text-[12px] text-ink-muted">
            ({selectedClasses.size} {selectedClasses.size === 1 ? 'class' : 'classes'}
            {selectedRels.size > 0 ? `, ${selectedRels.size} ${selectedRels.size === 1 ? 'relationship' : 'relationships'}` : ''})
          </span>
        )}
      </div>

      {/* Class cards */}
      {classNames.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Classes &amp; Interfaces
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {classNames.map(name => {
              const checked = selectedClasses.has(name)
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => onToggleClass(name)}
                    className={cn(
                      'group w-full rounded-xl border px-4 py-3 text-left transition-all',
                      checked
                        ? 'border-brand bg-brand-tint/40 shadow-sm'
                        : 'border-hairline bg-paper-elevated hover:border-brand/40 hover:bg-hairline/20',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[13px] font-semibold text-ink">
                          {name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-muted">{classHint(name)}</p>
                      </div>
                      <div
                        className={cn(
                          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          checked
                            ? 'border-brand bg-brand text-white'
                            : 'border-hairline bg-paper group-hover:border-brand/40',
                        )}
                        aria-hidden
                      >
                        {checked && (
                          <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                            <path
                              d="M1 4l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Relationship cards */}
      {relationshipLabels.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Relationships
          </p>
          <ul className="space-y-2">
            {relationshipLabels.map(label => {
              const checked = selectedRels.has(label)
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => onToggleRel(label)}
                    className={cn(
                      'group w-full rounded-xl border px-4 py-3 text-left transition-all',
                      checked
                        ? 'border-brand bg-brand-tint/40 shadow-sm'
                        : 'border-hairline bg-paper-elevated hover:border-brand/40 hover:bg-hairline/20',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] text-ink">{label}</span>
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          checked
                            ? 'border-brand bg-brand text-white'
                            : 'border-hairline bg-paper group-hover:border-brand/40',
                        )}
                        aria-hidden
                      >
                        {checked && (
                          <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                            <path
                              d="M1 4l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled={disabled || selectedClasses.size === 0}
        onClick={onConfirm}
        className="mt-8 w-full rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 sm:w-auto"
      >
        Lock prediction &amp; edit design
      </button>
    </div>
  )
}
