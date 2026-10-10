/** Dependency Web investigate pack payload. */

export type DepWebAnswerMode = 'free' | 'pick_element' | 'pick_path' | 'multi'

export interface DepWebPayload {
  briefing?: string
  prompt: string
  answerMode?: DepWebAnswerMode
  expectedHints?: string[]
  starterFocusId?: string
  suggestedLens?: string
  pathQuery?: { from: string; to: string }
  layers?: Record<string, string>
  externalIds?: string[]
  flows?: { id: string; label: string; steps: { elementId: string }[] }[]
  grading?: { soft?: boolean }
}

export function parseDepWebPayload(raw: unknown): DepWebPayload {
  if (!raw || typeof raw !== 'object') {
    return { prompt: 'Investigate the dependency web.', answerMode: 'free', expectedHints: [] }
  }
  const p = raw as DepWebPayload
  return {
    briefing: p.briefing,
    prompt: p.prompt ?? 'Investigate the dependency web.',
    answerMode: p.answerMode ?? 'free',
    expectedHints: p.expectedHints ?? [],
    starterFocusId: p.starterFocusId,
    suggestedLens: p.suggestedLens,
    pathQuery: p.pathQuery,
    layers: p.layers ?? {},
    externalIds: p.externalIds ?? [],
    flows: p.flows ?? [],
    grading: p.grading ?? { soft: true },
  }
}
