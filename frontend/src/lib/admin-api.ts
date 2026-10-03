import { getAuthToken } from './auth-token'
import type { BlogBlock } from './blog-blocks'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${BASE}/admin${path}`, {
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
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number; skipped?: number }>('/users/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
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
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/diagrams/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
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

  featuresOverview: () =>
    req<{
      plannr:    { profiles: number; active: number; topics: number; activities30d: number }
      dailyQuiz: { questions: number; attempts30d: number; activeUsers30d: number }
      detective: { scenarios: number; attempts30d: number; accuracy: number }
      debugLab:  { challenges: number; solves30d: number; successRate: number }
      roguelike: { scenarios: number; runs30d: number; completionRate: number }
      studio: {
        debugFix:  { packs: number; attempts30d: number }
        refactor:  { packs: number; attempts30d: number }
        changeOne: { packs: number; attempts30d: number }
        evolution: { packs: number; attempts30d: number }
        budget:    { packs: number; attempts30d: number }
      }
    }>('/features-overview'),

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
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/sessions/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
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
    create: (body: Partial<AdminProblem>) =>
      req<{ ok: boolean; problem: AdminProblem }>('/problems', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<AdminProblem>) =>
      req<{ ok: boolean; problem: AdminProblem }>(`/problems/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    toggle: (id: string) => req<{ ok: boolean; isActive: boolean }>(`/problems/${id}/toggle`, { method: 'PATCH' }),
    delete: (id: string) => req<{ ok: boolean }>(`/problems/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/problems/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
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
    create: (body: Partial<AdminRevisionNote>) =>
      req<{ ok: boolean; note: AdminRevisionNote }>('/revision-notes', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<AdminRevisionNote>) =>
      req<{ ok: boolean; note: AdminRevisionNote }>(`/revision-notes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    toggle: (id: string) => req<{ ok: boolean; isActive: boolean }>(`/revision-notes/${id}/toggle`, { method: 'PATCH' }),
    delete: (id: string) => req<{ ok: boolean }>(`/revision-notes/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/revision-notes/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
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

    bulkDeleteExecutions: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/code/executions/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),

    bulkDeleteBans: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/code/bans/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
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
    bulkDeleteInvites: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/collab-invites/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
    listComments: (params: { page?: number; limit?: number; q?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)  qs.set('page',  String(params.page))
      if (params.limit) qs.set('limit', String(params.limit))
      if (params.q)     qs.set('q',     params.q)
      return req<{ comments: AdminComment[]; total: number; page: number; limit: number; totalPages: number }>(`/comments?${qs}`)
    },
    deleteComment: (id: string) => req<{ ok: boolean }>(`/comments/${id}`, { method: 'DELETE' }),
    bulkDeleteComments: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/comments/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },

  billing: {
    overview: () =>
      req<{
        totalSubscriptions: number
        activeSubscriptions: number
        mrr: number
        arr: number
        planDistribution: Record<string, number>
        recentSubscriptions: AdminSubscription[]
      }>('/billing/overview'),

    subscriptions: (params: { page?: number; limit?: number; status?: string; plan?: string }) => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.status) qs.set('status', params.status)
      if (params.plan)   qs.set('plan',   params.plan)
      return req<{ subscriptions: AdminSubscription[]; total: number; page: number; totalPages: number }>(`/billing/subscriptions?${qs}`)
    },

    // Pass either a relative range (7d/30d/90d/1y) or an explicit month
    // (YYYY-MM) to pull up any specific calendar month's revenue.
    revenue: (params: { range?: string; month?: string } = {}) => {
      const qs = new URLSearchParams()
      if (params.month) qs.set('month', params.month)
      else if (params.range) qs.set('range', params.range)
      return req<{
        daily: { _id: string; revenue: number; count: number }[]
        byPlan: { _id: string; revenue: number; count: number }[]
        periodTotal: number
        periodCount: number
        allTimeTotal: number
        allTimeCount: number
        mrr: number
        arr: number
        range: string
        isMonth: boolean
      }>(`/billing/revenue?${qs}`)
    },

    overridePlan: (id: string, plan: string) =>
      req<{ ok: boolean }>(`/billing/subscriptions/${id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan }),
      }),

    cancelSubscription: (id: string) =>
      req<{ ok: boolean }>(`/billing/subscriptions/${id}/cancel`, { method: 'POST' }),

    bulkDeleteSubscriptions: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/billing/subscriptions/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),

    createManualSubscription: (payload: {
      userId: string
      plan: 'pro' | 'ultimate'
      months: number
      currency: 'INR' | 'USD'
      amountPaid: number
      note?: string
    }) =>
      req<{ ok: boolean; subscriptionId: string; userId: string; plan: string }>(
        '/billing/subscriptions/manual',
        { method: 'POST', body: JSON.stringify(payload) },
      ),
  },

  feedback: {
    stats: () =>
      req<{
        total: number
        byStatus:   Record<string, number>
        byType:     Record<string, number>
        byPriority: Record<string, number>
        recentItems: AdminFeedback[]
      }>('/feedback/stats'),

    list: (params?: { status?: string; type?: string; priority?: string; q?: string; page?: number; limit?: number; sort?: string; order?: string }) => {
      const qs = new URLSearchParams()
      if (params) Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
      return req<{ items: AdminFeedback[]; total: number; page: number; pages: number }>(
        `/feedback${qs.toString() ? '?' + qs : ''}`,
      )
    },

    get: (id: string) => req<AdminFeedback>(`/feedback/${id}`),

    update: (id: string, payload: { status?: string; priority?: string; adminNote?: string; tags?: string[] }) =>
      req<AdminFeedback>(`/feedback/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

    delete: (id: string) =>
      req<{ ok: boolean }>(`/feedback/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/feedback/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },

  testimonials: {
    stats: () =>
      req<{ total: number; byStatus: Record<string, number>; avgRating: number }>('/testimonials/stats'),

    list: (params?: { status?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params) Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
      return req<{ items: AdminTestimonial[]; total: number; page: number; pages: number }>(
        `/testimonials${qs.toString() ? '?' + qs : ''}`,
      )
    },

    update: (id: string, payload: { status?: string; featured?: boolean; adminNote?: string }) =>
      req<AdminTestimonial>(`/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

    delete: (id: string) =>
      req<{ ok: boolean }>(`/testimonials/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/testimonials/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },

  blog: {
    analytics: () =>
      req<AdminBlogAnalytics>('/blog/analytics'),

    list: (params?: { status?: string; q?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params) Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
      return req<{ blogs: AdminBlogSummary[]; total: number; page: number; pages: number }>(
        `/blog${qs.toString() ? '?' + qs : ''}`,
      )
    },

    get: (id: string) =>
      req<AdminBlogDetail>(`/blog/${id}`),

    create: (payload: Partial<AdminBlogDetail>) =>
      req<AdminBlogDetail>('/blog', { method: 'POST', body: JSON.stringify(payload) }),

    update: (id: string, payload: Partial<AdminBlogDetail>) =>
      req<AdminBlogDetail>(`/blog/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

    publish: (id: string) =>
      req<AdminBlogDetail>(`/blog/${id}/publish`, { method: 'PATCH' }),

    unpublish: (id: string) =>
      req<AdminBlogDetail>(`/blog/${id}/unpublish`, { method: 'PATCH' }),

    duplicate: (id: string) =>
      req<AdminBlogDetail>(`/blog/${id}/duplicate`, { method: 'POST' }),

    delete: (id: string) =>
      req<{ ok: boolean }>(`/blog/${id}`, { method: 'DELETE' }),

    bulkDelete: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/blog/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),

    listComments: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params) Object.entries(params).forEach(([k, v]) => v != null && qs.set(k, String(v)))
      return req<{ comments: AdminBlogComment[]; total: number; page: number; pages: number }>(
        `/blog/comments${qs.toString() ? '?' + qs : ''}`,
      )
    },

    deleteComment: (id: string) =>
      req<{ ok: boolean }>(`/blog/comments/${id}`, { method: 'DELETE' }),
  },

  // ─── Per-feature user activity (all features) ────────────────────────────────
  featureActivity: (slug: string, days?: number) =>
    req<AdminFeatureActivity>(`/plannr/feature-activity/${slug}${days ? `?days=${days}` : ''}`),

  // ─── Cross-feature User Activity table ───────────────────────────────────────
  userActivity: (params: { days?: number; feature?: string; search?: string; page?: number; limit?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }) => {
    const qs = new URLSearchParams()
    if (params.days)    qs.set('days',    String(params.days))
    if (params.feature && params.feature !== 'all') qs.set('feature', params.feature)
    if (params.search)  qs.set('search',  params.search)
    if (params.page)    qs.set('page',    String(params.page))
    if (params.limit)   qs.set('limit',   String(params.limit))
    if (params.sortBy)  qs.set('sortBy',  params.sortBy)
    if (params.sortDir) qs.set('sortDir', params.sortDir)
    return req<UserActivityResponse>(`/user-activity${qs.toString() ? '?' + qs : ''}`)
  },

  // ─── Plannr admin ─────────────────────────────────────────────────────────────
  plannr: {
    stats: (days?: number) =>
      req<AdminPlannrStats>(`/plannr/stats${days ? `?days=${days}` : ''}`),

    listProfiles: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.page)  qs.set('page',  String(params.page))
      if (params?.limit) qs.set('limit', String(params.limit))
      return req<{ profiles: AdminJourneyProfile[]; total: number; page: number; limit: number; totalPages: number }>(
        `/plannr/profiles${qs.toString() ? '?' + qs : ''}`,
      )
    },

    // Topics
    listTopics: (params?: { q?: string; status?: string; stage?: number }) => {
      const qs = new URLSearchParams()
      if (params?.q)      qs.set('q',      params.q)
      if (params?.status) qs.set('status', params.status)
      if (params?.stage)  qs.set('stage',  String(params.stage))
      return req<{ topics: AdminJourneyTopic[] }>(`/plannr/topics${qs.toString() ? '?' + qs : ''}`)
    },
    createTopic: (body: Partial<AdminJourneyTopic>) =>
      req<AdminJourneyTopic>('/plannr/topics', { method: 'POST', body: JSON.stringify(body) }),
    updateTopic: (id: string, body: Partial<AdminJourneyTopic>) =>
      req<AdminJourneyTopic>(`/plannr/topics/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    publishTopic: (id: string) =>
      req<{ ok: boolean; status: string }>(`/plannr/topics/${id}/publish`, { method: 'POST' }),
    deleteTopic: (id: string) =>
      req<{ ok: boolean }>(`/plannr/topics/${id}`, { method: 'DELETE' }),
    bulkDeleteTopics: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/plannr/topics/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

    // Experiences
    listExperiences: (params?: { q?: string; status?: string }) => {
      const qs = new URLSearchParams()
      if (params?.q)      qs.set('q',      params.q)
      if (params?.status) qs.set('status', params.status)
      return req<{ experiences: AdminJourneyExperience[] }>(`/plannr/experiences${qs.toString() ? '?' + qs : ''}`)
    },
    createExperience: (body: Partial<AdminJourneyExperience>) =>
      req<AdminJourneyExperience>('/plannr/experiences', { method: 'POST', body: JSON.stringify(body) }),
    updateExperience: (id: string, body: Partial<AdminJourneyExperience>) =>
      req<AdminJourneyExperience>(`/plannr/experiences/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    publishExperience: (id: string) =>
      req<{ ok: boolean; status: string }>(`/plannr/experiences/${id}/publish`, { method: 'POST' }),
    deleteExperience: (id: string) =>
      req<{ ok: boolean }>(`/plannr/experiences/${id}`, { method: 'DELETE' }),
    bulkDeleteExperiences: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/plannr/experiences/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

    // Tips
    listTips: (params?: { status?: string }) => {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      return req<{ tips: AdminJourneyTip[] }>(`/plannr/tips${qs.toString() ? '?' + qs : ''}`)
    },
    createTip: (body: Partial<AdminJourneyTip>) =>
      req<AdminJourneyTip>('/plannr/tips', { method: 'POST', body: JSON.stringify(body) }),
    updateTip: (id: string, body: Partial<AdminJourneyTip>) =>
      req<AdminJourneyTip>(`/plannr/tips/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    publishTip: (id: string) =>
      req<{ ok: boolean; status: string }>(`/plannr/tips/${id}/publish`, { method: 'POST' }),
    deleteTip: (id: string) =>
      req<{ ok: boolean }>(`/plannr/tips/${id}`, { method: 'DELETE' }),
    bulkDeleteTips: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/plannr/tips/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
  },

  studio: {
    listPacks: (type?: ChallengePackType) => {
      const qs = new URLSearchParams()
      if (type) qs.set('type', type)
      const q = qs.toString()
      return req<{ packs: AdminChallengePack[] }>(`/studio/packs${q ? `?${q}` : ''}`)
    },
    createPack: (body: Partial<AdminChallengePack> & { type: ChallengePackType; slug: string; title: string }) =>
      req<AdminChallengePack>('/studio/packs', { method: 'POST', body: JSON.stringify(body) }),
    updatePack: (id: string, body: Partial<AdminChallengePack>) =>
      req<AdminChallengePack>(`/studio/packs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deletePack: (id: string) =>
      req<{ ok: boolean }>(`/studio/packs/${id}`, { method: 'DELETE' }),
    publishPack: (id: string) =>
      req<AdminChallengePack>(`/studio/packs/${id}/publish`, { method: 'POST' }),
    bulkDeletePacks: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/studio/packs/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },

  learn: {
    // ── Daily Quiz ────────────────────────────────────────────────────────────
    listQuiz: () =>
      req<{ questions: AdminQuizQuestion[] }>('/learn/quiz'),
    createQuiz: (body: Partial<AdminQuizQuestion> & { slug: string; prompt: string; choices: string[]; correctIndex: number }) =>
      req<AdminQuizQuestion>('/learn/quiz', { method: 'POST', body: JSON.stringify(body) }),
    updateQuiz: (id: string, body: Partial<AdminQuizQuestion>) =>
      req<AdminQuizQuestion>(`/learn/quiz/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteQuiz: (id: string) =>
      req<{ ok: boolean }>(`/learn/quiz/${id}`, { method: 'DELETE' }),

    // ── Pattern Detective ─────────────────────────────────────────────────────
    detectiveStats: (days?: number) =>
      req<AdminDetectiveStats>(`/learn/detective/stats${days ? `?days=${days}` : ''}`),
    listDetective: (params?: { q?: string; status?: string; difficulty?: string }) => {
      const qs = new URLSearchParams()
      if (params?.q)          qs.set('q', params.q)
      if (params?.status)     qs.set('status', params.status)
      if (params?.difficulty) qs.set('difficulty', params.difficulty)
      return req<{ scenarios: AdminDetectiveScenario[] }>(`/learn/detective${qs.toString() ? '?' + qs : ''}`)
    },
    createDetective: (body: Partial<AdminDetectiveScenario>) =>
      req<AdminDetectiveScenario>('/learn/detective', { method: 'POST', body: JSON.stringify(body) }),
    updateDetective: (id: string, body: Partial<AdminDetectiveScenario>) =>
      req<AdminDetectiveScenario>(`/learn/detective/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    publishDetective: (id: string) =>
      req<{ ok: boolean; status: string }>(`/learn/detective/${id}/publish`, { method: 'POST' }),
    deleteDetective: (id: string) =>
      req<{ ok: boolean }>(`/learn/detective/${id}`, { method: 'DELETE' }),
    bulkDeleteDetective: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/learn/detective/bulk-delete', {
        method: 'POST', body: JSON.stringify({ ids }),
      }),

    // ── Debug Lab ─────────────────────────────────────────────────────────────
    debuggerStats: (days?: number) =>
      req<AdminDebuggerStats>(`/learn/debugger/stats${days ? `?days=${days}` : ''}`),
    listDebugger: (params?: { q?: string; status?: string; difficulty?: string; bugType?: string }) => {
      const qs = new URLSearchParams()
      if (params?.q)          qs.set('q', params.q)
      if (params?.status)     qs.set('status', params.status)
      if (params?.difficulty) qs.set('difficulty', params.difficulty)
      if (params?.bugType)    qs.set('bugType', params.bugType)
      return req<{ challenges: AdminDebuggerChallenge[] }>(`/learn/debugger${qs.toString() ? '?' + qs : ''}`)
    },
    createDebugger: (body: Partial<AdminDebuggerChallenge>) =>
      req<AdminDebuggerChallenge>('/learn/debugger', { method: 'POST', body: JSON.stringify(body) }),
    updateDebugger: (id: string, body: Partial<AdminDebuggerChallenge>) =>
      req<AdminDebuggerChallenge>(`/learn/debugger/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    publishDebugger: (id: string) =>
      req<{ ok: boolean; status: string }>(`/learn/debugger/${id}/publish`, { method: 'POST' }),
    deleteDebugger: (id: string) =>
      req<{ ok: boolean }>(`/learn/debugger/${id}`, { method: 'DELETE' }),
    bulkDeleteDebugger: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/learn/debugger/bulk-delete', {
        method: 'POST', body: JSON.stringify({ ids }),
      }),

    // ── LLD Roguelike ─────────────────────────────────────────────────────────
    roguelikeStats: (days?: number) =>
      req<AdminRoguelikeStats>(`/learn/roguelike/stats${days ? `?days=${days}` : ''}`),
    listRoguelikeScenarios: (params?: { q?: string; status?: string; difficulty?: string }) => {
      const qs = new URLSearchParams()
      if (params?.q)          qs.set('q', params.q)
      if (params?.status)     qs.set('status', params.status)
      if (params?.difficulty) qs.set('difficulty', params.difficulty)
      return req<{ scenarios: AdminRoguelikeScenario[] }>(`/learn/roguelike/scenarios${qs.toString() ? '?' + qs : ''}`)
    },
    createRoguelikeScenario: (body: Partial<AdminRoguelikeScenario>) =>
      req<AdminRoguelikeScenario>('/learn/roguelike/scenarios', { method: 'POST', body: JSON.stringify(body) }),
    updateRoguelikeScenario: (id: string, body: Partial<AdminRoguelikeScenario>) =>
      req<AdminRoguelikeScenario>(`/learn/roguelike/scenarios/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    publishRoguelikeScenario: (id: string) =>
      req<{ ok: boolean; status: string }>(`/learn/roguelike/scenarios/${id}/publish`, { method: 'POST' }),
    deleteRoguelikeScenario: (id: string) =>
      req<{ ok: boolean }>(`/learn/roguelike/scenarios/${id}`, { method: 'DELETE' }),
    bulkDeleteRoguelikeScenarios: (ids: string[]) =>
      req<{ ok: boolean; deleted: number }>('/learn/roguelike/scenarios/bulk-delete', {
        method: 'POST', body: JSON.stringify({ ids }),
      }),
    listRoguelikeRuns: (params?: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams()
      if (params?.page)   qs.set('page',   String(params.page))
      if (params?.limit)  qs.set('limit',  String(params.limit))
      if (params?.status) qs.set('status', params.status)
      return req<{ runs: AdminRoguelikeRun[]; total: number; page: number; limit: number; totalPages: number }>(
        `/learn/roguelike/runs${qs.toString() ? '?' + qs : ''}`,
      )
    },
  },

}

// ─── Interactive LLD admin types ──────────────────────────────────────────────

export type ChallengePackType = 'debugger' | 'refactor' | 'change_one' | 'evolution' | 'budget'
export type ChallengePackStatus = 'draft' | 'published' | 'archived'

export interface AdminChallengePack {
  _id: string
  type: ChallengePackType
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  diagramSnapshot: Record<string, unknown>
  payload: Record<string, unknown>
  status: ChallengePackStatus
  planMin: 'free' | 'pro' | 'ultimate'
  problemId?: string
  tags: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface AdminQuizQuestion {
  _id: string
  slug: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

// ─── Admin testimonial type ───────────────────────────────────────────────────

export interface AdminTestimonial {
  _id:       string
  userId:    string
  name:      string
  email:     string
  role:      string
  content:   string
  rating:    number
  avatar:    string
  status:    'pending' | 'approved' | 'rejected'
  featured:  boolean
  adminNote: string
  createdAt: string
}

// ─── New entity types ─────────────────────────────────────────────────────────

export interface AdminProblem {
  id: string
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  isActive: boolean
  order: number
  companies: string[]
  tags: string[]
  functionalRequirements: string[]
  nonFunctionalRequirements: string[]
  hints: string[]
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
  summary: string
  keyPoints: string[]
  analogy: string
  codeHint: string
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

export interface AdminSubscription {
  _id: string
  userId: string
  userName: string
  userEmail: string
  plan: string
  razorpaySubId: string
  status: string
  billingInterval: 'monthly' | 'yearly'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  cancelledAt: string | null
  paymentSource: 'razorpay' | 'manual' | 'dodo'
  currency: string
  paidMonths: number | null
  onboardingNote: string
  createdAt: string
}

// ─── Feedback types ───────────────────────────────────────────────────────────

export type FeedbackType     = 'bug' | 'feature' | 'improvement' | 'other'
export type FeedbackStatus   = 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'

// ─── Blog admin types ─────────────────────────────────────────────────────────

export interface AdminBlogSummary {
  _id:         string
  slug:        string
  title:       string
  excerpt:     string
  category:    string
  tags:        string[]
  status:      'draft' | 'published' | 'scheduled'
  isFeatured:  boolean
  readingTime: number
  views:       number
  likes:       number
  dislikes:    number
  publishedAt: string | null
  createdAt:   string
  updatedAt:   string
}

export interface AdminBlogDetail extends AdminBlogSummary {
  subtitle:   string
  content:    BlogBlock[]
  coverImage?: string
  coverImageAlt?: string
  author: { name: string; role: string; avatar?: string }
  scheduledAt?: string
  seo: {
    metaTitle:       string
    metaDescription: string
    keywords:        string[]
    ogImage?:        string
  }
  faq:  { q: string; a: string }[]
  toc:  { id: string; text: string; level: number }[]
  relatedSlugs: string[]
}

export interface AdminBlogComment {
  _id:         string
  blogId:      string
  blogTitle?:  string
  parentId:    string | null
  authorId:    string
  authorName:  string
  authorImage?: string
  content:     string
  likes:       number
  isDeleted:   boolean
  isReported:  boolean
  createdAt:   string
}

// ─── Feature activity types ───────────────────────────────────────────────────

export interface AdminFeatureActivity {
  activeToday:       number
  activeThisWeek:    number
  activeThisPeriod:  number
  totalActions:      number
  dailyActivity:     { date: string; count: number }[]
  recentActivity:    { userId: string; userName: string; userEmail: string; action: string; timestamp: string }[]
  topUsers:          { userId: string; userName: string; userEmail: string; count: number }[]
}

// ─── Plannr types ─────────────────────────────────────────────────────────────

export interface AdminPlannrStats {
  profiles:    { total: number; active: number }
  topics:      { total: number; published: number }
  experiences: { total: number; published: number }
  tips:        { total: number }
  activity: {
    total: number; recent: number; today: number
    activeUsersToday: number; activeUsersThisPeriod: number
  }
  dailyActivity:   { _id: string; count: number }[]
  activityByType:  { _id: string; count: number }[]
  popularTopics:   { _id: string; count: number }[]
  stageDistribution: { _id: number; count: number }[]
}

export interface AdminJourneyProfile {
  _id:               string
  userId:            string
  planName:          string
  isActive:          boolean
  targetRole:        string
  preparationDays:   number
  currentLevel:      string
  currentStage:      number
  topicsCompleted:   string[]
  lastActiveDate:    string
  createdAt:         string
}

export interface AdminJourneyTopic {
  _id:              string
  slug:             string
  title:            string
  subtitle:         string
  stage:            number
  order:            number
  type:             string
  description:      string
  estimatedMinutes: number
  icon:             string
  tags:             string[]
  status:           'draft' | 'published'
  createdAt:        string
  updatedAt:        string
}

export interface AdminJourneyExperience {
  _id:             string
  slug:            string
  title:           string
  company?:        string
  round:           string
  durationMinutes: number
  problem:         string
  tags:            string[]
  order:           number
  status:          'draft' | 'published'
  createdAt:       string
  updatedAt:       string
}

export interface AdminJourneyTip {
  _id:    string
  moment: string
  title:  string
  body:   string
  order:  number
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

// ─── Detective types ──────────────────────────────────────────────────────────

export interface AdminDetectiveScenario {
  _id:            string
  slug:           string
  title:          string
  mode:           string
  difficulty:     'easy' | 'medium' | 'hard'
  stem:           string
  answer:         string
  choices:        string[]
  explanation:    string
  description?:   string
  codeSnippet?:   string
  problemContext?: string
  keyPatterns?:   string[]
  status:         'draft' | 'published' | 'archived'
  order:          number
  createdAt:      string
  updatedAt:      string
}

export interface AdminDetectiveStats {
  scenarios:     { total: number; published: number; drafts: number }
  attempts:      { total: number; correct: number; accuracy: number; recent: number }
  dailyActivity: { _id: string; count: number }[]
  topScenarios:  { title: string; slug: string; difficulty: string; attempts: number; correct: number }[]
  diffBreakdown: { _id: string; count: number }[]
}

// ─── Debugger challenge types ─────────────────────────────────────────────────

export interface AdminDebuggerChallenge {
  _id:            string
  slug:           string
  title:          string
  description:    string
  difficulty:     'easy' | 'medium' | 'hard'
  bugType:        string
  tags:           string[]
  status:         'draft' | 'published'
  order:          number
  createdAt:      string
  updatedAt:      string
}

export interface AdminDebuggerStats {
  challenges:    { total: number; published: number; drafts: number }
  solves:        { total: number; success: number; rate: number; recent: number }
  dailyActivity: { _id: string; count: number }[]
  topChallenges: { title: string; slug: string; difficulty: string; bugType: string; solves: number; success: number }[]
  diffBreakdown: { _id: string; count: number }[]
  bugTypeBreakdown: { _id: string; count: number }[]
}

// ─── Roguelike types ──────────────────────────────────────────────────────────

export interface AdminRoguelikeScenario {
  _id:              string
  slug:             string
  title:            string
  icon:             string
  description:      string
  systemContext?:   string
  difficulty:       'easy' | 'medium' | 'hard' | 'hardcore'
  modes:            string[]
  tags:             string[]
  status:           'draft' | 'published'
  order:            number
  estimatedMinutes: number
  createdAt:        string
  updatedAt:        string
}

export interface AdminRoguelikeRun {
  _id:         string
  userId:      { _id: string; name: string; email: string } | string
  scenarioId:  { _id: string; title: string; slug: string } | string
  status:      'active' | 'completed' | 'failed' | 'abandoned'
  mode:        string
  startedAt:   string
  completedAt: string | null
  createdAt:   string
}

export interface AdminRoguelikeStats {
  scenarios:     { total: number; published: number; drafts: number }
  runs:          { total: number; completed: number; completionRate: number; recent: number }
  dailyActivity: { _id: string; count: number }[]
  topScenarios:  { title: string; slug: string; difficulty: string; runs: number; completed: number }[]
  runsByMode:    { _id: string; count: number }[]
}

// ─── Blog analytics ───────────────────────────────────────────────────────────

// ─── User Activity (cross-feature) ────────────────────────────────────────────

export interface UserActivityRow {
  date:            string
  userId:          string
  userName:        string
  userEmail:       string
  feature:         string
  featureLabel:    string
  actions:         number
  completions:     number
  durationMinutes: number | null
  lastSeen:        string
}

export interface UserActivitySummary {
  totalActiveUsers:  number
  totalActions:      number
  topFeatureSlug:    string
  topFeatureLabel:   string
  avgActionsPerUser: number
}

export interface UserActivityResponse {
  rows:    UserActivityRow[]
  total:   number
  page:    number
  pages:   number
  summary: UserActivitySummary
}

export interface AdminBlogAnalytics {
  totalBlogs:     number
  publishedBlogs: number
  draftBlogs:     number
  totalViews:     number
  totalLikes:     number
  totalDislikes:  number
  totalComments:  number
  topBlogs:       { _id: string; title: string; views: number; likes: number }[]
  dailyViews?:    { _id: string; views: number }[]
}

export interface AdminFeedback {
  _id:         string
  type:        FeedbackType
  title:       string
  description: string
  status:      FeedbackStatus
  priority:    FeedbackPriority
  userId:      string | null
  name:        string
  email:       string
  adminNote:   string
  tags:        string[]
  upvotes:     number
  pageUrl:     string
  createdAt:   string
  updatedAt:   string
}
