'use client'

import Link from 'next/link'

export interface InterviewerPerspectivePanelProps {
  result: Record<string, unknown>
  className?: string
}

function getInterviewerComment(result: Record<string, unknown>): { message: string; tip: string } {
  const dims = result.dimensions as { key: string; score?: number }[] | undefined
  const predDim = dims?.find(d => d.key === 'prediction')
  const blastDim = dims?.find(d => d.key === 'blastRadius' || d.key === 'blast_radius')

  const predictionAccuracy =
    predDim?.score ??
    (result.predictReport as { accuracyPct?: number } | undefined)?.accuracyPct ??
    (result.predictionAccuracy as number | undefined) ??
    50

  const blastRadius =
    blastDim?.score ??
    (result.blastRadius as { score?: number } | undefined)?.score ??
    (result.blastRadiusScore as number | undefined) ??
    50

  if (predictionAccuracy >= 80 && blastRadius >= 80) {
    return {
      message:
        'Excellent design awareness. You knew exactly what would change and minimized the impact.',
      tip: "In interviews, say: 'I kept the blast radius minimal by isolating the change behind an abstraction. Only X class needed to change.'",
    }
  }
  if (predictionAccuracy >= 60) {
    return {
      message: 'Good understanding of the design\'s structure. Minor surprises in the prediction.',
      tip: 'Interviewers look for accurate impact prediction. Study the coupling patterns in this design to improve.',
    }
  }
  return {
    message:
      "The design's dependencies surprised you. This suggests tight coupling that wasn't obvious.",
    tip: 'Use the Dependency Web tool to analyze this design\'s coupling first. Understanding it makes predictions accurate.',
  }
}

export function InterviewerPerspectivePanel({
  result,
  className,
}: InterviewerPerspectivePanelProps) {
  const { message, tip } = getInterviewerComment(result)
  const accepted = Boolean(result.accepted)

  return (
    <div className={className}>
      <div className="rounded-xl border border-violet-200/50 bg-violet-50/40 p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎤</span>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-violet-700">
            Interviewer Perspective
          </p>
        </div>

        {/* Grade badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold mb-3 ${
            accepted
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {accepted ? '✓ Strong signal' : '△ Room to improve'}
        </div>

        {/* Comment */}
        <p className="text-[13px] leading-relaxed text-ink">{message}</p>

        {/* Tip box */}
        <div className="mt-4 rounded-lg border border-violet-200/60 bg-white/60 px-4 py-3">
          <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-violet-600">
            Interview tip
          </p>
          <p className="text-[12px] leading-relaxed text-ink-muted">{tip}</p>
        </div>

        {/* Link to Evolution */}
        <div className="mt-4 border-t border-violet-100 pt-4">
          <p className="text-[12px] text-ink-muted mb-2">
            Changes don&rsquo;t happen in isolation — see how they compound over time.
          </p>
          <Link
            href="/dashboard/design-studio/evolution"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
          >
            See how changes compound in Architecture Evolution →
          </Link>
        </div>
      </div>
    </div>
  )
}
