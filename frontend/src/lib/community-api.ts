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

export interface PublishedDesign {
  _id: string
  slug: string
  title: string
  summary: string
  visibility: string
  featured?: boolean
  thumbnail?: string
  problemId?: string
  diagramId?: string
  replayEnabled?: boolean
  createdAt?: string
}

export interface CommunityDiagram {
  _id?: string
  title?: string
  diagramData?: unknown
}

/** Community gallery / forks / watch API — matches backend /community routes. */
export const communityApi = {
  gallery: {
    list: (params?: { q?: string; page?: number }) => {
      const qs = new URLSearchParams()
      if (params?.q) qs.set('q', params.q)
      if (params?.page) qs.set('page', String(params.page))
      const q = qs.toString()
      return request<{ designs: PublishedDesign[] }>(
        `/community/gallery${q ? `?${q}` : ''}`,
      )
    },
    get: (slug: string) =>
      request<{ design: PublishedDesign; diagram: CommunityDiagram | null }>(
        `/community/d/${slug}`,
      ),
  },

  watch: {
    get: (slug: string) =>
      request<{ events: { t: number; type: string; payload?: unknown }[] }>(
        `/community/d/${slug}/watch`,
      ),
  },

  forks: {
    list: (slug: string) =>
      request<{
        forks: {
          diagramId: string
          title: string
          userId: string
          createdAt: string
        }[]
      }>(`/community/d/${slug}/forks`),
    create: (slug: string) =>
      request<{ diagramId: string; title: string }>(
        `/community/d/${slug}/fork`,
        { method: 'POST' },
      ),
  },

  alternatives: {
    list: (problem: string) =>
      request<{
        groups: { problemId: string; designs: PublishedDesign[] }[]
      }>(`/community/alternatives?problem=${encodeURIComponent(problem)}`),
  },

  publish: (payload: {
    diagramId: string
    title: string
    summary?: string
    visibility?: string
    problemId?: string
    replayEnabled?: boolean
  }) =>
    request<PublishedDesign>('/community/publish', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  report: {
    create: (payload: { slug: string; reason: string }) =>
      request<{ ok: boolean }>('/community/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
}
