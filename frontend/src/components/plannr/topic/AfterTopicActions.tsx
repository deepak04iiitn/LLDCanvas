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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Topic Complete</p>
        <h2 className="font-serif text-2xl font-medium text-ink">What to do next</h2>
        <p className="text-[13px] text-ink-muted mt-1">
          You&apos;ve finished <span className="font-medium text-ink">{topicTitle}</span>. Keep the momentum going.
        </p>
      </div>

      <div className="space-y-3">
        {/* Studio challenge card */}
        {linkedStudioPack && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                <Layers size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-[14px] text-ink">Practice in Design Studio</p>
                <p className="text-[12px] text-ink-muted mt-0.5">Apply what you just learned in a real challenge</p>
              </div>
            </div>
            <Link
              href={`/design-studio/${studioMode}/${linkedStudioPack}`}
              className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              Start Challenge <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Learn exercise card */}
        {linkedLearnExercise && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <FlaskConical size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-[14px] text-ink">Test yourself</p>
                <p className="text-[12px] text-ink-muted mt-0.5">Verify your understanding with a quick exercise</p>
              </div>
            </div>
            <Link
              href={`/learn/detective/${linkedLearnExercise}`}
              className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-600 text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              Try Exercise <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {/* Back to roadmap — always shown */}
        <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-paper">
              <Map size={16} className="text-ink-muted" />
            </div>
            <div>
              <p className="font-medium text-[14px] text-ink">Continue Roadmap</p>
              <p className="text-[12px] text-ink-muted mt-0.5">Head back to pick your next topic</p>
            </div>
          </div>
          <Link
            href="/plannr/roadmap"
            className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl border border-hairline bg-paper text-ink text-[12px] font-medium hover:bg-paper-elevated transition-colors"
          >
            Back to Roadmap <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
