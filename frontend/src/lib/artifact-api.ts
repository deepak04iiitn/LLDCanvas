import { getAuthToken } from './auth-token'
import type { DiagramData } from '@/types'

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

export interface ArtifactDiagram {
  _id?: string
  id?: string
  title: string
  diagramData?: DiagramData
  replayEnabled?: boolean
  publishedSlug?: string | null
  forkParentId?: string | null
  updatedAt?: string
}

export interface ArtifactVersion {
  _id: string
  id?: string
  label?: string
  createdAt: string
  nodeCount?: number
  edgeCount?: number
  diagramData?: DiagramData
}

export interface DiffEntry {
  kind: 'added' | 'removed' | 'modified' | 'changed'
  entity: 'node' | 'edge'
  id?: string
  elementId?: string
  name?: string
  detail?: string
  summary?: string
}

export interface DesignDecisionDoc {
  _id: string
  id?: string
  elementId?: string
  decision?: string
  why: string
  alternatives?: string
  tradeoffs?: string
  createdAt?: string
}

export interface ReplayEventDoc {
  _id?: string
  t: number
  type: string
  payload?: Record<string, unknown>
}

/** Design artifact API — matches backend `/artifacts/:id/...`. */
export const artifactApi = {
  get: (id: string) => request<ArtifactDiagram>(`/artifacts/${id}`),

  patch: (
    id: string,
    payload: Partial<{
      title: string
      diagramData: DiagramData
      replayEnabled: boolean
      publishedSlug: string | null
    }>,
  ) =>
    request<ArtifactDiagram>(`/artifacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  postVersion: (id: string, payload?: { label?: string }) =>
    request<ArtifactVersion>(`/artifacts/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    }),

  getVersions: (id: string) =>
    request<{ versions: ArtifactVersion[] }>(`/artifacts/${id}/versions`),

  getDiff: (id: string, from: string, to: string) => {
    const qs = new URLSearchParams({ from, to })
    return request<{ entries: DiffEntry[] }>(`/artifacts/${id}/diff?${qs}`)
  },

  postReplayEvents: (
    id: string,
    events: { t: number; type: string; payload?: Record<string, unknown> }[],
  ) =>
    request<{ inserted: number }>(`/artifacts/${id}/replay/events`, {
      method: 'POST',
      body: JSON.stringify({ events }),
    }),

  getReplay: (id: string) =>
    request<{ events: ReplayEventDoc[] }>(`/artifacts/${id}/replay`),

  listDecisions: (id: string) =>
    request<{ decisions: DesignDecisionDoc[] }>(`/artifacts/${id}/decisions`),

  createDecision: (
    id: string,
    payload: {
      elementId?: string
      decision?: string
      why?: string
      alternatives?: string
      tradeoffs?: string
    },
  ) =>
    request<DesignDecisionDoc>(`/artifacts/${id}/decisions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateDecision: (
    id: string,
    decisionId: string,
    payload: Partial<{
      elementId: string
      decision: string
      why: string
      alternatives: string
      tradeoffs: string
    }>,
  ) =>
    request<DesignDecisionDoc>(`/artifacts/${id}/decisions/${decisionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteDecision: (id: string, decisionId: string) =>
    request<{ ok: boolean }>(`/artifacts/${id}/decisions/${decisionId}`, {
      method: 'DELETE',
    }),

  analysis: (id: string) => request<unknown>(`/artifacts/${id}/analysis`),

  analyzeNode: (id: string, elementId: string) =>
    request<unknown>(
      `/artifacts/${id}/analysis/node/${encodeURIComponent(elementId)}`,
    ),

  score: (id: string) =>
    request<unknown>(`/artifacts/${id}/score`, { method: 'POST' }),

  story: (id: string) =>
    request<unknown>(`/artifacts/${id}/story`, { method: 'POST' }),
}
