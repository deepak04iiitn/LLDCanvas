// Dedicated fetch helpers for the public, unauthenticated /public/* backend
// endpoints — used only by server components under app/features/**. Kept
// separate from lib/api.ts (which is the authenticated client-side API used
// by the dashboard) since these calls carry no token and are safe to run at
// build/request time on the server, with Next's fetch cache.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export interface PublicProblemSummary {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  companies: string[]
  tags: string[]
}

export interface PublicProblemDetail {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  companies: string[]
  tags: string[]
  functionalCount: number
  nonFunctionalCount: number
  firstFunctionalRequirement: string | null
  realWorldApplications: string[]
  learningObjectives: string[]
  whyAsked: string
}

export interface PublicRelatedProblem {
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface PublicRevisionNoteSummary {
  slug: string
  title: string
  category: string
  categorySlug: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  summary: string
  tags: string[]
}

export interface PublicRevisionNoteDetail {
  slug: string
  title: string
  category: string
  categorySlug: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  summary: string
  analogy: string
  tags: string[]
  keyPointsCount: number
  firstKeyPoint: string | null
}

export interface PublicRelatedRevisionNote {
  slug: string
  title: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  categorySlug: string
}

export const publicApi = {
  problems: {
    list: () => publicFetch<{ problems: PublicProblemSummary[] }>('/public/problems'),
    get: (slug: string) =>
      publicFetch<{ problem: PublicProblemDetail; related: PublicRelatedProblem[] }>(`/public/problems/${slug}`),
  },
  revisionNotes: {
    list: () => publicFetch<{ notes: PublicRevisionNoteSummary[] }>('/public/revision-notes'),
    get: (slug: string) =>
      publicFetch<{ note: PublicRevisionNoteDetail; related: PublicRelatedRevisionNote[] }>(`/public/revision-notes/${slug}`),
  },
}

export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const DIFF_META = {
  easy:   { label: 'Easy',   color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   dot: 'bg-amber-400'   },
  hard:   { label: 'Hard',   color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200',     dot: 'bg-red-400'     },
} as const

export const NOTE_DIFF_META = {
  basic:        { label: 'Basic',        color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  intermediate: { label: 'Intermediate', color: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-200'   },
  advanced:     { label: 'Advanced',     color: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-200'     },
} as const
