/** Soft grade for Microscope investigate submissions. */

import { parseMicroscopePayload, type MicroscopePayload } from './microscopeVerify'

export interface MicroscopeSubmission {
  focusElementIds?: string[]
  selectedEdgeId?: string
  freeText?: string
  lensUsed?: string[]
  notes?: string
}

export interface MicroscopeDimension {
  key: string
  label: string
  ok: boolean
  detail?: string
}

export interface MicroscopeGrade {
  accepted: boolean
  narrative: string
  dimensions: MicroscopeDimension[]
  matchedHints: string[]
  missedHints: string[]
}

export function gradeMicroscope(
  payloadRaw: unknown,
  submission: MicroscopeSubmission,
): MicroscopeGrade {
  const payload = parseMicroscopePayload(payloadRaw)
  const hints = payload.expectedHints ?? []
  const picked = new Set(
    (submission.focusElementIds ?? []).map(s => s.toLowerCase()),
  )
  const text = `${submission.freeText ?? ''} ${submission.notes ?? ''}`.toLowerCase()

  const matched: string[] = []
  const missed: string[] = []
  for (const h of hints) {
    const key = h.toLowerCase()
    if (picked.has(key) || text.includes(key)) matched.push(h)
    else missed.push(h)
  }

  const dimensions: MicroscopeDimension[] = []
  if (hints.length) {
    dimensions.push({
      key: 'hints',
      label: 'Investigation coverage',
      ok: matched.length >= Math.ceil(hints.length * 0.5),
      detail: `Matched ${matched.length}/${hints.length} expected signals`,
    })
  }

  const explored = (submission.focusElementIds?.length ?? 0) > 0 || !!submission.freeText?.trim()
  dimensions.push({
    key: 'explored',
    label: 'Exploration',
    ok: explored,
    detail: explored ? 'Recorded focus or notes' : 'No investigation recorded yet',
  })

  if (submission.lensUsed?.length) {
    dimensions.push({
      key: 'lenses',
      label: 'Lenses used',
      ok: true,
      detail: submission.lensUsed.join(', '),
    })
  }

  const okCount = dimensions.filter(d => d.ok).length
  const accepted = explored // soft — never hard-fail
  let narrative: string
  if (!explored) {
    narrative = 'Keep investigating — select components, switch lenses, and capture what you find.'
  } else if (matched.length && missed.length) {
    narrative = `Solid trail on ${matched.join(', ')}. Still worth checking: ${missed.join(', ')}.`
  } else if (matched.length) {
    narrative = `You found the key signals (${matched.join(', ')}). Architecture understanding unlocked.`
  } else {
    narrative =
      'Investigation logged. Compare your path with the expected coupling / flow signals when ready.'
  }

  return {
    accepted,
    narrative,
    dimensions,
    matchedHints: matched,
    missedHints: missed,
  }
}

export type { MicroscopePayload }
