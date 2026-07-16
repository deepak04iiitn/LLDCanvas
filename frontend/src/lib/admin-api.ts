const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/admin${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Admin API error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  email: string
  image: string | null
  isAdmin: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  diagramCount: number
  sessionCount: number
}

export interface AdminDiagram {
  id: string
  title: string
  userId: string
  owner: { name: string; email: string }
  nodeCount: number
  edgeCount: number
  thumbnail: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminSession {
  id: string
  title: string
  userId: string
  user: { name: string; email: string }
  status: 'active' | 'completed' | 'abandoned'
  durationLimit: number | null
  timeElapsed: number
  startedAt: string
  completedAt: string | null
  createdAt: string
}

export interface OverviewStats {
  totalUsers: number
  newToday: number
  newThisWeek: number
  blockedCount: number
  activeToday: number
  totalDiagrams: number
  newDiagramsToday: number
  totalSessions: number
  completedSessions: number
  activeSessions: number
  abandonedSessions: number
  totalPracticeSeconds: number
}

export interface OverviewCharts {
  userGrowth: { _id: string; count: number }[]
  diagramActivity: { _id: string; count: number }[]
  sessionActivity: { _id: string; count: number }[]
  sessionStatus: { name: string; value: number }[]
  topUsers: { id: string; name: string; email: string; diagrams: number }[]
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  limit: number
  totalPages: number
  data: T[]
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  overview: () =>
    req<{ stats: OverviewStats; charts: OverviewCharts }>('/overview'),

  users: {
    list: (params: { page?: number; limit?: number; q?: string; filter?: string; from?: string; to?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.q)      qs.set('q',      params.q)
      if (params.filter) qs.set('filter', params.filter)
      if (params.from)   qs.set('from',   params.from)
      if (params.to)     qs.set('to',     params.to)
      return req<{ users: AdminUser[]; total: number; page: number; limit: number; totalPages: number }>(
        `/users?${qs}`
      )
    },
    get: (id: string) =>
      req<{ user: AdminUser; diagrams: AdminDiagram[]; sessions: AdminSession[] }>(`/users/${id}`),
    toggleBlock: (id: string) =>
      req<{ ok: boolean; blocked: boolean }>(`/users/${id}/block`, { method: 'PATCH' }),
    delete: (id: string) =>
      req<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  },

  diagrams: {
    list: (params: { page?: number; limit?: number; q?: string; userId?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.q)      qs.set('q',      params.q)
      if (params.userId) qs.set('userId', params.userId)
      return req<{ diagrams: AdminDiagram[]; total: number; page: number; limit: number; totalPages: number }>(
        `/diagrams?${qs}`
      )
    },
    delete: (id: string) =>
      req<{ ok: boolean }>(`/diagrams/${id}`, { method: 'DELETE' }),
  },

  analytics: () =>
    req<{
      live: number
      dau: number
      wau: number
      mau: number
      avgSessionSeconds: number
      totalTimeSeconds: number
      returningRate: number
      newSessions: number
      returningSessions: number
      topPages: { page: string; views: number }[]
      hourlyActiveUsers: { hour: string; users: number }[]
    }>('/analytics'),

  sessions: {
    list: (params: { page?: number; limit?: number; q?: string; status?: string; userId?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.q)      qs.set('q',      params.q)
      if (params.status) qs.set('status', params.status)
      if (params.userId) qs.set('userId', params.userId)
      return req<{ sessions: AdminSession[]; total: number; page: number; limit: number; totalPages: number }>(
        `/sessions?${qs}`
      )
    },
    delete: (id: string) =>
      req<{ ok: boolean }>(`/sessions/${id}`, { method: 'DELETE' }),
  },
}
