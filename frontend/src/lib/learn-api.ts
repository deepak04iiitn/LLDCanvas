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

// ─── Roguelike V2 Types ───────────────────────────────────────────────────────

export interface ArchitectureHealth {
  coupling: number       // 0-100, LOWER is better
  cohesion: number       // 0-100, HIGHER is better
  extensibility: number  // 0-100, HIGHER is better
  complexity: number     // 0-100, LOWER is better
  reliability: number    // 0-100, HIGHER is better
  debt: number           // accumulated, no upper bound
}

export interface RunResources {
  engineeringHoursRemaining: number
  complexityBudgetRemaining: number
  teamSize: number
  infraBudgetRemaining: number
  changesRemaining: number
}

export interface DecisionOption {
  id: 'A' | 'B' | 'C' | 'D'
  label: string
  description: string
  healthDelta: Partial<Record<keyof ArchitectureHealth, number>>
  tags: string[]
  consequence: string
}

export interface StageEvent {
  type: 'requirement' | 'scale' | 'failure' | 'business' | 'team' | 'time' | 'constraint' | 'boss'
  title: string
  description: string
  icon: string
  decisions?: DecisionOption[]
  requiresDesign: boolean
  hint?: string
  successCriteria?: string
}

export interface Stage {
  id: string
  order: number
  title: string
  event: StageEvent
  isBoss: boolean
  isCheckpoint: boolean
  failureExplanation?: string
}

export interface InitialConstraints {
  complexityBudget: number
  engineeringHours: number
  teamSize: number
  infraBudget: number
  maxStructuralChanges: number
  expectedUsers: string
}

export interface ScenarioSummary {
  slug: string
  title: string
  icon: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'hardcore'
  modes: string[]
  tags: string[]
  order: number
  estimatedMinutes: number
  initialConstraints: InitialConstraints
}

export interface RoguelikeScenario extends ScenarioSummary {
  systemContext: string
  initialRequirement: string
  stages: Stage[]
}

export interface StageResult {
  stageId: string
  stageOrder: number
  stageTitle: string
  eventType: string
  decisionMade?: string
  decisionLabel?: string
  architectureNotes?: string
  healthBefore: ArchitectureHealth
  healthAfter: ArchitectureHealth
  resourcesAfter: RunResources
  passed: boolean
  completedAt: string
}

export interface RunCheckpoint {
  stageOrder: number
  health: ArchitectureHealth
  resources: RunResources
  savedAt: string
}

export interface RunState {
  id: string
  scenarioSlug: string
  scenarioTitle: string
  mode: 'beginner' | 'interview' | 'survival' | 'hardcore' | 'endless'
  status: 'active' | 'completed' | 'failed' | 'abandoned'
  currentStageOrder: number
  health: ArchitectureHealth
  resources: RunResources
  stagesTotal: number
  totalDecisions: number
  totalRefactors: number
  majorFailures: number
  ending?: 'survived' | 'survived_with_debt' | 'refactor_required' | 'collapse' | 'strategic_exit'
  endingReason?: string
  startedAt?: string
  endedAt?: string
}

export interface FullRun extends RunState {
  stages: StageResult[]
  checkpoints: RunCheckpoint[]
  maxStages?: number
  skillDeltas?: Record<string, number>
  interviewReadiness?: number
}

export interface QuizQuestion {
  _id: string
  slug: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  choices: string[]
  // Available on revisit bank questions (populated from QuizQuestion model)
  correctIndex?: number
  explanation?: string
  // The wrong answer the user previously chose (revisit bank only)
  userChoiceIndex?: number | null
}

export interface QuizSubmitDetail {
  questionId: string
  correct: boolean
  explanation: string
  correctIndex: number
  skillTag?: string
}

export interface QuizSubmitResult {
  attemptId: string
  correct: number
  total: number
  details: QuizSubmitDetail[]
  skillDeltas?: Record<string, number>
  interviewReadiness?: number
}

export interface QuizStreak {
  currentStreak: number
  longestStreak: number
  totalDays: number
  last30Days: string[]
  last365Days: string[]
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  totalCorrect: number
  totalAttempts: number
  accuracy: number
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

// ─── Debugger Types ───────────────────────────────────────────────────────────

export interface DebuggerChallenge {
  _id?: string
  id?: string
  slug: string
  title: string
  description: string
  variants: { language: string; buggyCode: string }[]
  expectedOutput: string
  testInput: string
  hint: string
  difficulty: 'easy' | 'medium' | 'hard'
  bugType: string
  tags: string[]
  order?: number
  // explanation is NOT included in list/get — only returned after solve
}

/** Learn & Practice API — matches backend /learn routes. */
export interface DiagramScoreRecord {
  _id: string
  userId: string
  diagramId: string
  diagramTitle: string
  scores: {
    coupling: number
    cohesion: number
    complexity: number
    extensibility: number
    solid: number
    overall: number
  }
  timestamp: string
}

export interface ScoreTrendEntry {
  date: string
  coupling: number
  cohesion: number
  complexity: number
  extensibility: number
  solid: number
  overall: number
}

export const learnApi = {
  score: {
    run: (artifactId: string) =>
      request<{ score: ScoreResultPayload }>(`/learn/score/${artifactId}`, {
        method: 'POST',
      }),
    history: () =>
      request<{ records: DiagramScoreRecord[] }>('/learn/score/history'),
    trends: () =>
      request<{ trends: ScoreTrendEntry[] }>('/learn/score/trends'),
  },

  quiz: {
    today: () => request<{
      questions: QuizQuestion[]
      alreadyCompleted?: boolean
      existingResult?: { correct: number; total: number }
    }>('/learn/quiz/today'),
    submit: (answers: { questionId: string; choiceIndex: number }[], setId?: string) =>
      request<QuizSubmitResult>(
        '/learn/quiz/submit',
        {
          method: 'POST',
          body: JSON.stringify({ answers, setId }),
        },
      ),
    streak: () => request<QuizStreak>('/learn/quiz/streak'),
    leaderboard: () =>
      request<{ leaderboard: LeaderboardEntry[]; currentUser: LeaderboardEntry | null }>(
        '/learn/quiz/leaderboard',
      ),
    revisitBank: () =>
      request<{ questions: QuizQuestion[]; count: number }>('/learn/quiz/revisit'),
  },

  detective: {
    list: () => request<{ scenarios: DetectiveScenario[] }>('/learn/detective'),
    start: (id: string) =>
      request<{
        attemptId: string
        scenario: DetectiveScenario & {
          diagramSnapshot?: string
          codeSnippet?: string
          codeSnippets?: Record<string, string>
          description?: string
        }
      }>(`/learn/detective/${id}/start`, { method: 'POST' }),
    submit: (
      id: string,
      body: { answer: string; scenarioId: string; timeTakenSeconds: number },
    ) =>
      request<{
        correct: boolean
        correctAnswer: string
        explanation: string
        skillDeltas: Record<string, number>
        interviewReadiness?: number
      }>(`/learn/detective/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    history: () =>
      request<{
        attempts: {
          scenarioId: string
          title: string
          slug: string
          correctCount: number
          totalCount: number
        }[]
        patternMastery: Record<string, { correct: number; total: number }>
      }>('/learn/detective/history'),
  },

  roguelike: {
    start: () =>
      request<{ runId: string; run: RoguelikeRun }>('/learn/roguelike/start', {
        method: 'POST',
      }),
    get: (runId: string) =>
      request<{ run: RoguelikeRun }>(`/learn/roguelike/${runId}`),
  },

  roguelikeV2: {
    listScenarios: () =>
      request<{ scenarios: ScenarioSummary[] }>('/learn/roguelike/scenarios'),
    getScenario: (slug: string) =>
      request<{ scenario: RoguelikeScenario }>(`/learn/roguelike/scenarios/${slug}`),
    startRun: (scenarioSlug: string, mode: string) =>
      request<{ runId: string; run: RunState }>('/learn/roguelike/runs', {
        method: 'POST',
        body: JSON.stringify({ scenarioSlug, mode }),
      }),
    listRuns: () =>
      request<{ runs: RunState[] }>('/learn/roguelike/runs'),
    getRun: (runId: string) =>
      request<{ run: FullRun }>(`/learn/roguelike/runs/${runId}`),
    submitStage: (
      runId: string,
      body: {
        stageId?: string
        decisionMade?: string
        decisionLabel?: string
        diagramSnapshot?: { nodes: unknown[]; edges: unknown[] }
        architectureNotes?: string
        isSkip?: boolean
        isRefactor?: boolean
      },
    ) =>
      request<{
        // Normal stage advance
        run: RunState
        stageResult?: {
          passed: boolean
          stageTitle: string
          healthBefore: ArchitectureHealth
          healthAfter: ArchitectureHealth
          resourcesAfter: RunResources
          designEval: {
            score: number
            criteria: {
              id: string; label: string; passed: boolean
              points: number; maxPoints: number; hint: string
            }[]
          } | null
        }
        currentStage?: Stage
        nextStage?: Stage | null
        // Design rejected — stage NOT advanced
        designRejected?: boolean
        designEval?: {
          score: number
          criteria: {
            id: string; label: string; passed: boolean
            points: number; maxPoints: number; hint: string
          }[]
        }
        minScore?: number
      }>(`/learn/roguelike/runs/${runId}/stage`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    restoreCheckpoint: (runId: string, checkpointStageOrder: number) =>
      request<{ run: RunState; restoredFrom: number }>(
        `/learn/roguelike/runs/${runId}/checkpoint`,
        {
          method: 'POST',
          body: JSON.stringify({ checkpointStageOrder }),
        },
      ),
    endRun: (runId: string, ending?: string) =>
      request<{ run: RunState & { skillDeltas?: Record<string, number>; interviewReadiness?: number } }>(
        `/learn/roguelike/runs/${runId}/end`,
        {
          method: 'POST',
          body: JSON.stringify({ ending }),
        },
      ),
    startQuickRun: () =>
      request<{ runId: string; run: RunState }>('/learn/roguelike/runs', {
        method: 'POST',
        body: JSON.stringify({ mode: 'quick' }),
      }),
    getFeaturedScenario: () =>
      request<{ scenario: ScenarioSummary | null; date: string }>('/learn/roguelike/featured'),
  },

  debugger: {
    list: () => request<{ challenges: DebuggerChallenge[] }>('/learn/debugger'),
    get: (id: string) => request<{ challenge: DebuggerChallenge }>(`/learn/debugger/${id}`),
    recordSolve: (id: string, timeTakenSeconds?: number) =>
      request<{ explanation: string; bugType: string; message: string }>(
        `/learn/debugger/${id}/solve`,
        { method: 'POST', body: JSON.stringify({ timeTakenSeconds }) },
      ),
  },

}
