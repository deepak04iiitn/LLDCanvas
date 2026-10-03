'use client'

import Link from 'next/link'
import { ArrowRight, Layers, FlaskConical, Map } from 'lucide-react'

interface AfterTopicActionsProps {
  linkedStudioPack?: string
  linkedLearnExercise?: string
  studioMode?: string
  topicTitle: string
}

export function AfterTopicActions({
  linkedStudioPack,
  linkedLearnExercise,
  studioMode = 'debugger',
  topicTitle,
}: AfterTopicActionsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Topic Complete</p>
        <h2 className="font-serif text-xl font-medium text-ink">What to do next</h2>
        <p className="text-[13px] text-ink-muted mt-1">
          You&apos;ve finished <span className="font-medium text-ink">{topicTitle}</span>. Keep the momentum going.
        </p>
      </div>

      <div className="space-y-3">
        {/* Studio challenge card */}
        {linkedStudioPack && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
                <Layers size={16} className="text-brand" />
              </div>
              <div>
                <p className="font-medium text-[15px] text-ink">Practice in Design Studio</p>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  Apply what you just learned with a real-world design challenge.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/design-studio/${studioMode}/${linkedStudioPack}`}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Open Challenge <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Learn exercise card */}
        {linkedLearnExercise && (
          <div className="rounded-2xl border border-hairline bg-paper-elevated p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
                <FlaskConical size={16} className="text-brand" />
              </div>
              <div>
                <p className="font-medium text-[15px] text-ink">Test Yourself</p>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  Verify your understanding with a quick exercise.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/learn/detective/${linkedLearnExercise}`}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Try Exercise <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Back to roadmap — always shown */}
        <div className="rounded-2xl border border-hairline bg-paper p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-paper-elevated">
              <Map size={14} className="text-ink-muted" />
            </div>
            <div>
              <p className="font-medium text-[13px] text-ink">Continue Roadmap</p>
              <p className="text-[11px] text-ink-faint">Pick your next topic</p>
            </div>
          </div>
          <Link
            href="/dashboard/plannr/roadmap"
            className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl border border-hairline bg-paper-elevated text-ink text-[12px] font-medium hover:bg-paper transition-colors"
          >
            Back to Roadmap <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
