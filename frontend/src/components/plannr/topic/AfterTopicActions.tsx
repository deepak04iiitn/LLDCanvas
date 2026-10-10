'use client'

import Link from 'next/link'
import { ArrowRight, Layers, FlaskConical, Map } from 'lucide-react'

interface AfterTopicActionsProps {
  linkedStudioPack?: string
  linkedLearnExercise?: string
  studioMode?: string
  topicTitle: string
}

/** Optional post-module CTAs only — never required to continue Plannr. */
export function AfterTopicActions({
  linkedStudioPack,
  linkedLearnExercise,
  studioMode = 'debugger',
  topicTitle,
}: AfterTopicActionsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Want more?</p>
        <h2 className="font-serif text-xl font-medium text-ink">Optional practice</h2>
        <p className="text-[13px] text-ink-muted mt-1">
          You finished <span className="font-medium text-ink">{topicTitle}</span> in Plannr.
          Studio and Learn are volume extras — skip them and stay on your roadmap.
        </p>
      </div>

      <div className="space-y-3">
        {linkedStudioPack && (
          <div className="rounded-2xl border border-dashed border-hairline bg-paper-elevated/60 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
                <Layers size={16} className="text-brand" />
              </div>
              <div>
                <p className="font-medium text-[15px] text-ink">Design Studio (optional)</p>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  Extra volume if you want another reps cycle.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/design-studio/${studioMode}/${linkedStudioPack}`}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl border border-hairline text-ink text-[13px] font-semibold hover:border-brand/40 transition-colors"
            >
              Open challenge <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {linkedLearnExercise && (
          <div className="rounded-2xl border border-dashed border-hairline bg-paper-elevated/60 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
                <FlaskConical size={16} className="text-brand" />
              </div>
              <div>
                <p className="font-medium text-[15px] text-ink">Learn (optional)</p>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  Drill related quizzes outside the module player.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/learn`}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl border border-hairline text-ink text-[13px] font-semibold hover:border-brand/40 transition-colors"
            >
              Browse Learn <ArrowRight size={13} />
            </Link>
          </div>
        )}

        <Link
          href="/dashboard/plannr/roadmap"
          className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          <Map size={13} /> Continue roadmap
        </Link>
      </div>
    </div>
  )
}
