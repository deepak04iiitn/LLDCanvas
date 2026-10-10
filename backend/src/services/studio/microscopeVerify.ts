/** Architecture Microscope — investigate pack payload types. */

export type MicroscopeAnswerMode = 'free' | 'pick_element' | 'pick_edge' | 'multi'

export interface MicroscopeFlowStep {
  elementId: string
  note?: string
}

export interface MicroscopeFlow {
  id: string
  label: string
  entryMethod?: string
  steps: MicroscopeFlowStep[]
}

export interface MicroscopePayload {
  briefing?: string
  prompt: string
  answerMode?: MicroscopeAnswerMode
  /** Soft-grade hint ids (element ids or free keywords) */
  expectedHints?: string[]
  flows?: MicroscopeFlow[]
  creationEdges?: { from: string; to: string }[]
  layers?: Record<string, string>
  starterFocusId?: string
  suggestedLens?: string
  grading?: { soft?: boolean }
}

export function parseMicroscopePayload(raw: unknown): MicroscopePayload {
  if (!raw || typeof raw !== 'object') {
    return { prompt: 'Investigate the architecture.', answerMode: 'free', expectedHints: [] }
  }
  const p = raw as MicroscopePayload
  return {
    briefing: p.briefing,
    prompt: p.prompt ?? 'Investigate the architecture.',
    answerMode: p.answerMode ?? 'free',
    expectedHints: p.expectedHints ?? [],
    flows: p.flows ?? [],
    creationEdges: p.creationEdges ?? [],
    layers: p.layers ?? {},
    starterFocusId: p.starterFocusId,
    suggestedLens: p.suggestedLens,
    grading: p.grading ?? { soft: true },
  }
}
