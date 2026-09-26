'use client'

import { X } from 'lucide-react'

export interface ConceptPrimerOverlayProps {
  onDismiss: () => void
}

export function ConceptPrimerOverlay({ onDismiss }: ConceptPrimerOverlayProps) {
  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('change_concept_seen', '1')
    }
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-paper shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-md p-1 text-ink-muted hover:bg-hairline/40 hover:text-ink"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="px-8 pb-8 pt-8">
          {/* Accent bar */}
          <div className="mb-5 h-1 w-12 rounded-full bg-brand" />

          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
            Core Concept
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink">Understanding Blast Radius</h2>

          <p className="mt-4 text-[14px] leading-relaxed text-ink">
            When requirements change, skilled designers know exactly which classes will be affected.
            This is called the <span className="font-semibold text-ink">blast radius</span> of a change.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-rose-200/60 bg-rose-50/50 px-4 py-3">
              <span className="mt-0.5 text-lg">💥</span>
              <div>
                <p className="text-[13px] font-semibold text-rose-900">Large blast radius</p>
                <p className="text-[12px] text-rose-800">Tightly coupled design — one change ripples everywhere.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200/60 bg-emerald-50/50 px-4 py-3">
              <span className="mt-0.5 text-lg">🎯</span>
              <div>
                <p className="text-[13px] font-semibold text-emerald-900">Small blast radius</p>
                <p className="text-[12px] text-emerald-800">Well-designed, loosely coupled system — changes stay local.</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              In this challenge, you&rsquo;ll:
            </p>
            <ol className="space-y-2">
              {[
                'Predict which classes you think will change',
                'Make the minimum necessary change to the design',
                'See how well you understood the design\'s dependencies',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="mt-8 w-full rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-white"
          >
            Got it, start predicting!
          </button>
        </div>
      </div>
    </div>
  )
}
