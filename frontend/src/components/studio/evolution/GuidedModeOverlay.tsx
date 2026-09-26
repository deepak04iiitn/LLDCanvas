'use client'

import { X } from 'lucide-react'

export interface GuidedModeOverlayProps {
  onDismiss: () => void
  onTryFullMode: () => void
}

export function GuidedModeOverlay({ onDismiss, onTryFullMode }: GuidedModeOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-paper shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-md p-1 text-ink-muted hover:bg-hairline/40 hover:text-ink"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="px-8 pb-8 pt-8">
          {/* Header */}
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
            Guided Mode Complete
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink">You completed Guided Mode!</h2>
          <p className="mt-2 text-[13px] text-ink-muted">
            You navigated a full architecture evolution — pressure, decision, and design. In full
            mode, you&rsquo;d also tackle:
          </p>

          {/* Hidden features list */}
          <ul className="mt-5 space-y-3">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                1
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">Pressure Classification</p>
                <p className="text-[12px] text-ink-muted">
                  Categorize incoming pressures into types: scale, failure, business, or team.
                  Correct framing earns bonus marks.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                2
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">Tech Debt Tracking</p>
                <p className="text-[12px] text-ink-muted">
                  Track debt you accumulate and opportunities to resolve it before it compounds
                  across future stages.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                3
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">Tradeoff Reasoning</p>
                <p className="text-[12px] text-ink-muted">
                  Explicitly justify each decision with trade-offs — the kind of reasoning that wins
                  senior-level interviews.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                4
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">Multi-stage Complexity</p>
                <p className="text-[12px] text-ink-muted">
                  Handle 4–6 stages with compounding decisions where early choices constrain later
                  options.
                </p>
              </div>
            </li>
          </ul>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-hairline px-4 py-2 text-[13px] font-medium text-ink hover:bg-hairline/40"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={onTryFullMode}
              className="rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-white"
            >
              Try Full Mode →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
