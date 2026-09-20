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

export interface QuizQuestion {
  _id: string
  slug: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  choices: string[]
}

export interface QuizSubmitDetail {
  questionId: string
  correct: boolean
  explanation: string
  correctIndex: number
}

export interface DetectiveScenario {
  _id?: string
  id?: string
  slug: string
  title: string
  mode: string
  difficulty: string
  stem: string
  choices: string[]
  order?: number
}

export interface MashupRecipe {
  _id?: string
  id?: string
  slug: string
  title: string
  difficulty: string
  summary: string
  constraints: string[]
  problemLabels: string[]
}

export interface RoguelikeRun {
  id: string
  level: number
  modifiers: string[]
  status: string
  score: number
  currentPrompt: string
  createdAt?: string
}

export interface ScoreResultPayload {
  overall: number
  dimensions: {
    key: string
    label: string
    score: number
    explanation: string
    highlightIds: string[]
  }[]
  disclaimer: string
}

/** Learn & Practice API — matches backend /learn routes. */
export const learnApi = {
  score: {
    run: (artifactId: string) =>
      request<{ score: ScoreResultPayload }>(`/learn/score/${artifactId}`, {
        method: 'POST',
      }),
  },

  quiz: {
    today: () => request<{ questions: QuizQuestion[] }>('/learn/quiz/today'),
    submit: (answers: { questionId: string; choiceIndex: number }[]) =>
      request<{ correct: number; total: number; details: QuizSubmitDetail[] }>(
        '/learn/quiz/submit',
        {
          method: 'POST',
          body: JSON.stringify({ answers }),
        },
      ),
  },

  detective: {
    list: () => request<{ scenarios: DetectiveScenario[] }>('/learn/detective'),
    start: (id: string) =>
      request<{
        attemptId: string
        scenario: DetectiveScenario & {
          explanation?: string
          answer?: string
          diagramSnapshot?: unknown
        }
      }>(`/learn/detective/${id}/start`, { method: 'POST' }),
  },

  mashup: {
    list: () => request<{ recipes: MashupRecipe[] }>('/learn/mashup'),
    start: (id: string) =>
      request<{ sessionId: string; recipe: MashupRecipe }>(
        `/learn/mashup/${id}/start`,
        { method: 'POST' },
      ),
  },

  roguelike: {
    start: () =>
      request<{ runId: string; run: RoguelikeRun }>('/learn/roguelike/start', {
        method: 'POST',
      }),
    get: (runId: string) =>
      request<{ run: RoguelikeRun }>(`/learn/roguelike/${runId}`),
  },

  umlCode: {
    generate: (payload: {
      artifactId?: string
      diagramData?: unknown
      language: string
    }) =>
      request<{ code: string; language: string; nodeCount: number }>(
        '/learn/uml-code/generate',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      ),
  },
}
