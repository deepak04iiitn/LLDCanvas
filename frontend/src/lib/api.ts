import { DiagramSummary, DiagramFull, DiagramData, InterviewSession, PracticeStats, AdvancedStats, ShareSettings, ProblemSummary, ProblemDetail, UserSolution, CommunitySolution, RevisionNoteSummary, RevisionNoteDetail, RevisionStats } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  account: {
    updateName: (name: string) =>
      request<{ ok: boolean; name: string }>('/account/name', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),

    deleteAccount: () =>
      request<{ ok: boolean }>('/account', { method: 'DELETE' }),
  },

  diagrams: {
    list: (q?: string) => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : ''
      return request<{ diagrams: DiagramSummary[] }>(`/diagrams${qs}`)
    },

    get: (id: string, shareToken?: string) =>
      request<{ diagram: DiagramFull; sharePermission?: 'view' | 'edit' }>(
        `/diagrams/${id}${shareToken ? `?shareToken=${shareToken}` : ''}`,
      ),

    create: (payload?: { title?: string }) =>
      request<{ diagram: DiagramFull }>('/diagrams', {
        method: 'POST',
        body: JSON.stringify(payload ?? {}),
      }),

    duplicate: (id: string) =>
      request<{ diagram: DiagramFull }>(`/diagrams/${id}/duplicate`, { method: 'POST' }),

    save: (id: string, diagramData: DiagramData, thumbnail?: string, shareToken?: string) =>
      request<{ ok: boolean }>(`/diagrams/${id}${shareToken ? `?shareToken=${shareToken}` : ''}`, {
        method: 'PUT',
        body: JSON.stringify({ diagramData, thumbnail }),
      }),

    rename: (id: string, title: string) =>
      request<{ ok: boolean; title: string }>(`/diagrams/${id}/title`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),

    delete: (id: string) =>
      request<{ ok: boolean }>(`/diagrams/${id}`, { method: 'DELETE' }),
  },

  interview: {
    create: (payload: { title?: string; diagramId?: string | null; durationLimit?: number | null }) =>
      request<{ session: InterviewSession }>('/interview', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    list: (page = 1, limit = 20) =>
      request<{ sessions: InterviewSession[]; total: number; page: number; limit: number }>(
        `/interview?page=${page}&limit=${limit}`,
      ),

    get: (id: string) =>
      request<{ session: InterviewSession }>(`/interview/${id}`),

    update: (id: string, patch: Partial<Pick<InterviewSession, 'timeElapsed' | 'status' | 'notes' | 'title'> & { canvasSnapshot: unknown }>) =>
      request<{ session: InterviewSession }>(`/interview/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),

    delete: (id: string) =>
      request<{ ok: boolean }>(`/interview/${id}`, { method: 'DELETE' }),
  },

  share: {
    // Check if the current user has access via a share token (used on editor load)
    check: (token: string) =>
      request<{
        canAccess: boolean
        isOwner?: boolean
        diagramId?: string
        permission?: 'view' | 'edit'
        visibility?: 'public' | 'private'
        reason?: string
      }>(`/share/${token}`),

    // Owner: get current share settings for a diagram
    get: (diagramId: string) =>
      request<{ share: ShareSettings | null }>(`/diagrams/${diagramId}/share`),

    // Owner: create / update share (visibility + permission)
    upsert: (diagramId: string, payload: { visibility: 'public' | 'private'; permission: 'view' | 'edit' }) =>
      request<{ share: ShareSettings }>(`/diagrams/${diagramId}/share`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    // Owner: turn off sharing entirely
    remove: (diagramId: string) =>
      request<{ ok: boolean }>(`/diagrams/${diagramId}/share`, { method: 'DELETE' }),

    // Owner: invite an email (private share)
    addInvite: (diagramId: string, email: string) =>
      request<{ share: ShareSettings }>(`/diagrams/${diagramId}/share/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    // Owner: remove an invited email
    removeInvite: (diagramId: string, email: string) =>
      request<{ share: ShareSettings }>(`/diagrams/${diagramId}/share/invite`, {
        method: 'DELETE',
        body: JSON.stringify({ email }),
      }),
  },

  stats: {
    get: () => request<PracticeStats>('/stats'),
    getAdvanced: () => request<AdvancedStats>('/stats/advanced'),
    sync: (timeElapsed: number) =>
      request<{ ok: boolean; stats: PracticeStats }>('/stats/sync', {
        method: 'POST',
        body: JSON.stringify({ timeElapsed }),
      }),
  },

  problems: {
    list: (params?: { q?: string; difficulty?: string; category?: string }) => {
      const qs = new URLSearchParams()
      if (params?.q)          qs.set('q',          params.q)
      if (params?.difficulty) qs.set('difficulty', params.difficulty)
      if (params?.category)   qs.set('category',   params.category)
      const q = qs.toString()
      return request<{ problems: ProblemSummary[] }>(`/problems${q ? `?${q}` : ''}`)
    },

    categories: () =>
      request<{ categories: string[] }>('/problems/categories'),

    get: (slug: string) =>
      request<{ problem: ProblemDetail; submissionCount: number; mySolution: UserSolution | null }>(`/problems/${slug}`),

    hints: (slug: string) =>
      request<{ hints: string[] }>(`/problems/${slug}/hints`),

    myStats: () =>
      request<{ attempted: number; submitted: number; byDifficulty: { easy: number; medium: number; hard: number } }>('/problems/stats/me'),

    mySolution: (slug: string) =>
      request<{ solution: UserSolution | null }>(`/problems/${slug}/my-solution`),

    start: (slug: string) =>
      request<{ solution: UserSolution; diagramId: string }>(`/problems/${slug}/solutions`, { method: 'POST' }),

    submit: (slug: string) =>
      request<{ solution: UserSolution }>(`/problems/${slug}/solutions/submit`, { method: 'PATCH' }),

    solutions: (slug: string, page = 1, sort: 'newest' | 'oldest' = 'newest') =>
      request<{ solutions: CommunitySolution[]; total: number; page: number; totalPages: number }>(
        `/problems/${slug}/solutions?page=${page}&sort=${sort}`,
      ),
  },

  collab: {
    myStats: () =>
      request<{
        sharedDiagrams: number
        collaboratingOn: number
        totalCollaborators: number
        pendingInvites: number
        totalComments: number
      }>('/collab/my-stats'),

    myDiagrams: () =>
      request<{
        owned: {
          _id: string; title: string; thumbnail?: string; updatedAt: string
          collaborators: { _id: string; email: string; role: string; status: string }[]
        }[]
        collaborating: {
          _id: string; title: string; thumbnail?: string; updatedAt: string; myRole: string
        }[]
      }>('/collab/my-diagrams'),

    activity: () =>
      request<{
        events: {
          type: 'comment' | 'invite_accepted' | 'save'
          diagramId: string
          diagramTitle: string
          actor: string
          detail: string
          timestamp: string
        }[]
      }>('/collab/activity'),

    versions: (diagramId: string) =>
      request<{
        versions: {
          _id: string; userId: string; userName: string
          nodeCount: number; edgeCount: number; createdAt: string
        }[]
      }>(`/collab/versions/${diagramId}`),
  },

  revision: {
    list: (params?: { q?: string; category?: string; difficulty?: string; bookmarked?: boolean }) => {
      const qs = new URLSearchParams()
      if (params?.q)          qs.set('q',          params.q)
      if (params?.category)   qs.set('category',   params.category)
      if (params?.difficulty) qs.set('difficulty', params.difficulty)
      if (params?.bookmarked) qs.set('bookmarked', 'true')
      const q = qs.toString()
      return request<{ notes: RevisionNoteSummary[] }>(`/revision-notes${q ? `?${q}` : ''}`)
    },

    categories: () =>
      request<{ categories: string[] }>('/revision-notes/categories'),

    myStats: () =>
      request<{ stats: RevisionStats }>('/revision-notes/stats/me'),

    get: (slug: string) =>
      request<{ note: RevisionNoteDetail; myRevision: { status: string; bookmarked: boolean } | null }>(
        `/revision-notes/${slug}`,
      ),

    markRevised: (slug: string) =>
      request<{ ok: boolean }>(`/revision-notes/${slug}/revised`, { method: 'POST' }),

    toggleBookmark: (slug: string) =>
      request<{ bookmarked: boolean }>(`/revision-notes/${slug}/bookmark`, { method: 'POST' }),
  },

  code: {
    run: (payload: { compiler: string; code: string; input?: string }) =>
      request<{
        output: string
        error: string
        status: 'success' | 'error'
        exit_code: number
        signal: number | null
        time: string
        total: string
        memory: string
      }>('/code/run', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
}
