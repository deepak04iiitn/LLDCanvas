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

  submitChange: (attemptId: string, diagramData: unknown) =>
    request<{ result: Record<string, unknown> }>(
      `/studio/change/${attemptId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ diagramData }),
      },
    ),

  /** Score an owned artifact (also usable as a budget proxy). */
  budget: {
    scoreArtifact: (artifactId: string) =>
      request<Record<string, unknown>>(`/artifacts/${artifactId}/score`, {
        method: 'POST',
      }),
  },

  story: {
    generate: (artifactId: string) =>
      request<{ steps?: { elementIds: string[]; text: string }[]; [key: string]: unknown }>(
        `/artifacts/${artifactId}/story`,
        { method: 'POST' },
      ),
  },
}
