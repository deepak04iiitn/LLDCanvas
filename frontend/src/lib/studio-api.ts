import { getAuthToken } from './auth-token'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body?.error ?? `API error ${res.status}`) as Error & {
      banned?: boolean
      status?: number
    }
    err.status = res.status
    err.banned = body?.banned === true
    throw err
  }

  return res.json() as Promise<T>
}

/** Backend challenge pack types (change UI uses `change_one`). */
export type StudioPackType =
  | 'debugger'
  | 'refactor'
  | 'change_one'
  | 'evolution'
  | 'budget'
  | 'microscope'
  | 'depweb'

export interface StudioPackSummary {
  _id?: string
  id?: string
  type: StudioPackType | string
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | string
  description: string
  tags?: string[]
  planMin?: string
  order?: number
  locked?: boolean
  requiredPlan?: 'free' | 'pro' | 'ultimate'
}

export interface StudioPackDetail extends StudioPackSummary {
  payload?: Record<string, unknown>
  diagramSnapshot?: {
    nodes?: unknown[]
    edges?: unknown[]
    version?: number
    meta?: unknown
    [key: string]: unknown
  }
}

export type DebuggerStage = 'detect' | 'diagnose' | 'repair' | 'verify' | 'complete'

export interface DebuggerMark {
  elementId: string
  category: string
  why?: string
  issueIdMatched?: string
  verdict?: 'exact' | 'partial' | 'miss'
  feedback?: string
}

export interface DebuggerConsoleEntry {
  t: number
  level: 'info' | 'warn' | 'ok' | string
  message: string
}

export interface DebuggerVerifyCheck {
  id: string
  ok: boolean
  label: string
}

export interface StudioAttempt {
  _id?: string
  id?: string
  packId: string
  type: string
  status: 'in_progress' | 'submitted' | 'revealed' | string
  stage?: DebuggerStage | string
  marks?: DebuggerMark[]
  diagramData?: Record<string, unknown>
  result?: Record<string, unknown>
  progress?: Record<string, unknown>
  hintsUsed?: number
  consoleLog?: DebuggerConsoleEntry[]
  startedAt?: string
  createdAt?: string
}

export function packIdOf(pack: StudioPackSummary): string {
  return String(pack.id ?? pack._id ?? pack.slug)
}

/** Design Studio challenge / session API. */
export const studioApi = {
  packs: {
    list: (type?: StudioPackType | string) => {
      const q = type ? `?type=${encodeURIComponent(type)}` : ''
      return request<{ packs: StudioPackSummary[] }>(`/studio/packs${q}`)
    },
  },

  start: (type: StudioPackType | string, packIdOrSlug: string) =>
    request<{ attemptId: string; pack: StudioPackDetail; resumed?: boolean }>(
      '/studio/start',
      {
        method: 'POST',
        body: JSON.stringify({ type, packId: packIdOrSlug, slug: packIdOrSlug }),
      },
    ),

  /** Open challenge by pack slug — resumes in-progress or starts fresh. */
  open: (type: StudioPackType | string, slug: string) =>
    request<{ attemptId: string; pack: StudioPackDetail; resumed?: boolean }>(
      '/studio/open',
      {
        method: 'POST',
        body: JSON.stringify({ type, slug, packId: slug }),
      },
    ),

  getAttempt: (attemptId: string) =>
    request<{ attempt: StudioAttempt; pack: StudioPackDetail | null }>(
      `/studio/attempts/${attemptId}`,
    ),

  submitDebugger: (
    attemptId: string,
    marks: { elementId: string; category: string; why?: string }[],
  ) =>
    request<{
      stage: string
      result: Record<string, unknown>
      marks: DebuggerMark[]
      consoleLog?: DebuggerConsoleEntry[]
    }>(`/studio/debugger/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ marks }),
    }),

  debuggerSession: {
    mark: (
      attemptId: string,
      body: { elementId: string; category: string; why: string },
    ) =>
      request<{
        marks: DebuggerMark[]
        stage: DebuggerStage | string
        consoleLog?: DebuggerConsoleEntry[]
      }>(`/studio/debugger/${attemptId}/mark`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    diagnose: (attemptId: string) =>
      request<{
        stage: DebuggerStage | string
        result: Record<string, unknown>
        marks: DebuggerMark[]
        consoleLog?: DebuggerConsoleEntry[]
      }>(`/studio/debugger/${attemptId}/diagnose`, { method: 'POST' }),

    hint: (attemptId: string, body?: { elementId?: string }) =>
      request<{
        hint: string
        hintIndex: number
        issueId: string
        hintsUsed: number
        consoleLog?: DebuggerConsoleEntry[]
      }>(`/studio/debugger/${attemptId}/hint`, {
        method: 'POST',
        body: JSON.stringify(body ?? {}),
      }),

    repair: (attemptId: string, body: { diagramData: unknown }) =>
      request<{
        stage: DebuggerStage | string
        result: Record<string, unknown>
        consoleLog?: DebuggerConsoleEntry[]
      }>(`/studio/debugger/${attemptId}/repair`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  submitRefactor: (attemptId: string, diagramData: unknown) =>
    request<{ result: Record<string, unknown>; consoleLog?: DebuggerConsoleEntry[] }>(
      `/studio/refactor/${attemptId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ diagramData }),
      },
    ),

  saveRefactor: (attemptId: string, diagramData: unknown) =>
    request<{ ok: boolean; diagramData?: unknown }>(`/studio/refactor/${attemptId}/save`, {
      method: 'POST',
      body: JSON.stringify({ diagramData }),
    }),

  submitChange: (
    attemptId: string,
    diagramData: unknown,
    prediction?: { elementIds?: string[]; elementNames?: string[]; relationshipKeys?: string[] } | null,
  ) =>
    request<{ result: Record<string, unknown>; consoleLog?: DebuggerConsoleEntry[] }>(
      `/studio/change/${attemptId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ diagramData, prediction }),
      },
    ),

  saveChange: (
    attemptId: string,
    diagramData: unknown,
    prediction?: { elementIds?: string[]; elementNames?: string[]; relationshipKeys?: string[] } | null,
  ) =>
    request<{ ok: boolean; diagramData?: unknown }>(`/studio/change/${attemptId}/save`, {
      method: 'POST',
      body: JSON.stringify({ diagramData, prediction }),
    }),

  saveEvolution: (
    attemptId: string,
    diagramData: unknown,
    draft?: Record<string, unknown> | null,
  ) =>
    request<{ ok: boolean; diagramData?: unknown; progress?: Record<string, unknown> }>(
      `/studio/evolution/${attemptId}/save`,
      {
        method: 'POST',
        body: JSON.stringify({ diagramData, draft }),
      },
    ),

  submitEvolutionStage: (
    attemptId: string,
    body: {
      decision: 'change' | 'noop'
      pressures?: string[]
      classify?: {
        keep?: string[]
        change?: string[]
        introduce?: string[]
        remove?: string[]
      }
      diagramData?: unknown
      why?: string[]
      whyNote?: string
      tradeoffsAck?: string[]
      debtActions?: { id: string; action: 'fix' | 'defer' }[]
    },
  ) =>
    request<{
      grade: Record<string, unknown>
      progress: Record<string, unknown>
      complete: boolean
      nextStageIndex: number
      consoleLog?: DebuggerConsoleEntry[]
    }>(`/studio/evolution/${attemptId}/submit-stage`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getEvolutionJourney: (attemptId: string) =>
    request<{
      pack: StudioPackDetail | null
      progress: Record<string, unknown>
      stages: {
        id: string
        dayLabel: string
        title: string
        category?: string
        mustChange: boolean
      }[]
      complete: boolean
    }>(`/studio/evolution/${attemptId}/journey`),

  saveBudget: (
    attemptId: string,
    diagramData: unknown,
    draft?: Record<string, unknown> | null,
  ) =>
    request<{ ok: boolean; diagramData?: unknown; progress?: Record<string, unknown> }>(
      `/studio/budget/${attemptId}/save`,
      {
        method: 'POST',
        body: JSON.stringify({ diagramData, draft }),
      },
    ),

  submitBudgetStage: (
    attemptId: string,
    body: {
      picks: {
        investmentId: string
        why?: string[]
        whyNote?: string
        targetElementIds?: string[]
        targetNames?: string[]
        estimatedCost?: number
      }[]
      reserved?: number
      deferredPressureIds?: string[]
      customInvestments?: {
        label: string
        cost: number
        why?: string[]
        tags?: string[]
      }[]
      diagramData?: unknown
    },
  ) =>
    request<{
      grade: Record<string, unknown>
      progress: Record<string, unknown>
      complete: boolean
      nextStageIndex: number
      consoleLog?: DebuggerConsoleEntry[]
    }>(`/studio/budget/${attemptId}/submit-stage`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getBudgetReport: (attemptId: string) =>
    request<{
      pack: StudioPackDetail | null
      progress: Record<string, unknown>
      stages: {
        id: string
        dayLabel: string
        title: string
        narrative: string
        budgetDelta?: number
      }[]
      report: Record<string, unknown>
      complete: boolean
    }>(`/studio/budget/${attemptId}/report`),

  saveMicroscope: (attemptId: string, draft: Record<string, unknown>) =>
    request<{ ok: boolean; progress?: Record<string, unknown> }>(
      `/studio/microscope/${attemptId}/save`,
      { method: 'POST', body: JSON.stringify(draft) },
    ),

  submitMicroscope: (
    attemptId: string,
    body: {
      focusElementIds?: string[]
      selectedEdgeId?: string
      freeText?: string
      lensUsed?: string[]
      notes?: string
    },
  ) =>
    request<{
      grade: Record<string, unknown>
      progress: Record<string, unknown>
      complete: boolean
    }>(`/studio/microscope/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  saveDepWeb: (attemptId: string, draft: Record<string, unknown>) =>
    request<{ ok: boolean; progress?: Record<string, unknown> }>(
      `/studio/depweb/${attemptId}/save`,
      { method: 'POST', body: JSON.stringify(draft) },
    ),

  submitDepWeb: (
    attemptId: string,
    body: {
      focusElementIds?: string[]
      pathIds?: string[]
      freeText?: string
      lensUsed?: string[]
      notes?: string
    },
  ) =>
    request<{
      grade: Record<string, unknown>
      progress: Record<string, unknown>
      complete: boolean
    }>(`/studio/depweb/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Score an owned artifact (also usable as a diagram-inflation proxy). */
  budget: {
    scoreArtifact: (artifactId: string) =>
      request<Record<string, unknown>>(`/artifacts/${artifactId}/score`, {
        method: 'POST',
      }),
  },

}
