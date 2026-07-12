import { DiagramSummary, DiagramFull, DiagramData } from '@/types'

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
  diagrams: {
    list: (q?: string) => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : ''
      return request<{ diagrams: DiagramSummary[] }>(`/diagrams${qs}`)
    },

    get: (id: string) =>
      request<{ diagram: DiagramFull }>(`/diagrams/${id}`),

    create: (payload?: { title?: string; fromTemplateId?: string }) =>
      request<{ diagram: DiagramFull }>('/diagrams', {
        method: 'POST',
        body: JSON.stringify(payload ?? {}),
      }),

    duplicate: (id: string) =>
      request<{ diagram: DiagramFull }>(`/diagrams/${id}/duplicate`, { method: 'POST' }),

    save: (id: string, diagramData: DiagramData, thumbnail?: string) =>
      request<{ ok: boolean }>(`/diagrams/${id}`, {
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

    templates: () =>
      request<{ templates: DiagramSummary[] }>('/diagrams/templates'),
  },
}
