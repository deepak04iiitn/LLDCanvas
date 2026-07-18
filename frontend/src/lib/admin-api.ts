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

  featureStats: () =>
    req<{
      problems:  { total: number; active: number; inactive: number; problemsByDifficulty: { _id: string; count: number }[]; topProblems: { title: string; difficulty: string; attempts: number; submitted: number }[] }
      solutions: { total: number; submitted: number; inProgress: number; recentMonth: number }
      revision:  { totalNotes: number; activeNotes: number; totalRevisions: number; totalBookmarks: number; revisionByCategory: { _id: string; total: number }[] }
      collab:    { totalInvites: number; accepted: number; pending: number; totalComments: number; resolvedComments: number; recentMonth: number; recentComments: number }
      sharing:   { totalShared: number; public: number; private: number }
      versions:  { total: number }
    }>('/feature-stats'),

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

  problems: {
    list: (params: { page?: number; limit?: number; q?: string; difficulty?: string; category?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)       qs.set('page',       String(params.page))
      if (params.limit)      qs.set('limit',      String(params.limit))
      if (params.q)          qs.set('q',          params.q)
      if (params.difficulty) qs.set('difficulty', params.difficulty)
      if (params.category)   qs.set('category',   params.category)
      return req<{ problems: AdminProblem[]; total: number; page: number; limit: number; totalPages: number }>(`/problems?${qs}`)
    },
    toggle: (id: string) => req<{ ok: boolean; isActive: boolean }>(`/problems/${id}/toggle`, { method: 'PATCH' }),
  },

  revision: {
    list: (params: { page?: number; limit?: number; q?: string; category?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)     qs.set('page',     String(params.page))
      if (params.limit)    qs.set('limit',    String(params.limit))
      if (params.q)        qs.set('q',        params.q)
      if (params.category) qs.set('category', params.category)
      return req<{ notes: AdminRevisionNote[]; total: number; page: number; limit: number; totalPages: number }>(`/revision-notes?${qs}`)
    },
    toggle: (id: string) => req<{ ok: boolean; isActive: boolean }>(`/revision-notes/${id}/toggle`, { method: 'PATCH' }),
  },

  code: {
    stats: () =>
      req<CodeStats>('/code/stats'),

    executions: (params: { page?: number; limit?: number; userId?: string; language?: string; status?: string; from?: string; to?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)     qs.set('page',     String(params.page))
      if (params.limit)    qs.set('limit',    String(params.limit))
      if (params.userId)   qs.set('userId',   params.userId)
      if (params.language) qs.set('language', params.language)
      if (params.status)   qs.set('status',   params.status)
      if (params.from)     qs.set('from',     params.from)
      if (params.to)       qs.set('to',       params.to)
      return req<{ executions: AdminCodeExecution[]; total: number; page: number; limit: number; totalPages: number }>(
        `/code/executions?${qs}`,
      )
    },

    userDaily: (userId: string, days?: number) =>
      req<UserCodeDaily>(`/code/executions/${userId}/daily${days ? `?days=${days}` : ''}`),

    bans: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.page)  qs.set('page',  String(params.page))
      if (params?.limit) qs.set('limit', String(params.limit))
      return req<{ bans: AdminCodeBan[]; total: number; page: number; limit: number; totalPages: number }>(
        `/code/bans?${qs}`,
      )
    },

    toggleBan: (userId: string, reason?: string) =>
      req<{ ok: boolean; banned: boolean; userId: string }>(`/code/bans/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
  },

  collab: {
    listInvites: (params: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.status) qs.set('status', params.status)
      return req<{ invites: AdminCollabInvite[]; total: number; page: number; limit: number; totalPages: number }>(`/collab-invites?${qs}`)
    },
    revokeInvite: (id: string) => req<{ ok: boolean }>(`/collab-invites/${id}/revoke`, { method: 'PATCH' }),
    listComments: (params: { page?: number; limit?: number; q?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)  qs.set('page',  String(params.page))
      if (params.limit) qs.set('limit', String(params.limit))
      if (params.q)     qs.set('q',     params.q)
      return req<{ comments: AdminComment[]; total: number; page: number; limit: number; totalPages: number }>(`/comments?${qs}`)
    },
    deleteComment: (id: string) => req<{ ok: boolean }>(`/comments/${id}`, { method: 'DELETE' }),
  },
}

// ─── New entity types ─────────────────────────────────────────────────────────

export interface AdminProblem {
  id: string
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  isActive: boolean
  order: number
  companies: string[]
  tags: string[]
  createdAt: string
  solutions: number
  submitted: number
}

export interface AdminRevisionNote {
  id: string
  slug: string
  title: string
  category: string
  difficulty: string
  isActive: boolean
  order: number
  tags: string[]
  createdAt: string
  revised: number
  bookmarked: number
}

export interface AdminCollabInvite {
  _id: string
  diagramId: { _id: string; title: string } | string
  email: string
  role: 'editor' | 'viewer'
  status: 'pending' | 'accepted' | 'revoked'
  invitedBy: string
  createdAt: string
}

export interface AdminComment {
  _id: string
  diagramId: { _id: string; title: string } | string
  authorId: string
  authorName: string
  content: string
  resolved: boolean
  mentions: string[]
  replies: { authorName: string; content: string }[]
  createdAt: string
}

export interface AdminCodeExecution {
  _id: string
  userId: string
  userName: string
  userEmail: string
  language: string
  status: 'success' | 'error'
  exitCode: number
  executionMs: number
  memoryKb: number
  codeLength: number
  createdAt: string
}

export interface AdminCodeBan {
  _id: string
  userId: string
  userName: string
  userEmail: string
  reason: string | null
  bannedBy: string
  createdAt: string
}

export interface CodeStats {
  totalRuns: number
  successRuns: number
  errorRuns: number
  successRate: number
  todayRuns: number
  todaySuccess: number
  bannedCount: number
  byLanguage: { _id: string; total: number; success: number }[]
  dailyTrend: { _id: string; total: number; success: number; error: number }[]
  topUsers: { _id: string; name: string; email: string; total: number; success: number; lastRun: string }[]
}

export interface UserCodeDaily {
  userId: string
  userName: string
  userEmail: string
  daily: { _id: string; total: number; success: number; error: number }[]
  totalRuns: number
  totalSuccess: number
  totalError: number
}
