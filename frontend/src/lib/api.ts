import { DiagramSummary, DiagramFull, DiagramData, InterviewSession, PracticeStats, ShareSettings } from '@/types'

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
    sync: (timeElapsed: number) =>
      request<{ ok: boolean; stats: PracticeStats }>('/stats/sync', {
        method: 'POST',
        body: JSON.stringify({ timeElapsed }),
      }),
  },
}
