/** Soft grade for Dependency Web investigate submissions. */

import { parseDepWebPayload } from './depwebVerify'

export interface DepWebSubmission {
  focusElementIds?: string[]
  pathIds?: string[]
  freeText?: string
  lensUsed?: string[]
  notes?: string
}

export interface DepWebDimension {
  key: string
  label: string
  ok: boolean
  detail?: string
}

export interface DepWebGrade {
  accepted: boolean
  narrative: string
  dimensions: DepWebDimension[]
  matchedHints: string[]
  missedHints: string[]
}

export function gradeDepWeb(payloadRaw: unknown, submission: DepWebSubmission): DepWebGrade {
  const payload = parseDepWebPayload(payloadRaw)
  const hints = payload.expectedHints ?? []
  const picked = new Set(
    [
      ...(submission.focusElementIds ?? []),
      ...(submission.pathIds ?? []),
    ].map(s => s.toLowerCase()),
  )
  const text = `${submission.freeText ?? ''} ${submission.notes ?? ''}`.toLowerCase()

  const matched: string[] = []
  const missed: string[] = []
  for (const h of hints) {
    const key = h.toLowerCase()
    if (picked.has(key) || text.includes(key)) matched.push(h)
    else missed.push(h)
  }

  const explored =
    (submission.focusElementIds?.length ?? 0) > 0 ||
    (submission.pathIds?.length ?? 0) > 0 ||
    !!submission.freeText?.trim()

  const dimensions: DepWebDimension[] = [
    {
      key: 'explored',
      label: 'Exploration',
      ok: explored,
      detail: explored ? 'Recorded focus or path' : 'No investigation yet',
    },
  ]
  if (hints.length) {
    dimensions.push({
      key: 'hints',
      label: 'Signal coverage',
      ok: matched.length >= Math.ceil(hints.length * 0.4),
      detail: `Matched ${matched.length}/${hints.length}`,
    })
  }
  if (submission.lensUsed?.length) {
    dimensions.push({
      key: 'lenses',
      label: 'Lenses used',
      ok: true,
      detail: submission.lensUsed.join(', '),
    })
  }

  let narrative: string
  if (!explored) {
    narrative = 'Keep exploring — select nodes, trace paths, and capture what you find.'
  } else if (matched.length && missed.length) {
    narrative = `Good trail on ${matched.join(', ')}. Still check: ${missed.join(', ')}.`
  } else if (matched.length) {
    narrative = `You found the key dependency signals (${matched.join(', ')}).`
  } else {
    narrative = 'Investigation logged. Compare your path with the expected coupling signals.'
  }

  return {
    accepted: explored,
    narrative,
    dimensions,
    matchedHints: matched,
    missedHints: missed,
  }
}
