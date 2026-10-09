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
    const err = new Error(body?.error ?? `API error ${res.status}`) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JourneySkills {
  oop: number
  solid: number
  patterns: number
  designThinking: number
  requirementAnalysis: number
  entityIdentification: number
  responsibilities: number
  relationships: number
  extensibility: number
  coupling: number
  cohesion: number
  communication: number
  tradeoffReasoning: number
  followupHandling: number
  designSpeed: number
}

export interface ModuleTopicProgress {
  completedBlockIds: string[]
  practiceSolvedIds: string[]
  checkScores: Record<string, number>
  masteryScore: number
  lastVisitedAt?: string
  completedAt?: string
}

export interface DiagnosticResult {
  score: number
  suggestedLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  suggestedStage: number
  answers: { id: string; correct: boolean }[]
  completedAt?: string
}

export interface JourneyProfile {
  _id: string
  userId: string
  planName?: string
  onboardingComplete: boolean
  targetRole: 'sde1' | 'sde2' | 'backend' | 'fullstack' | 'general'
  preparationDays: 7 | 14 | 30 | 60
  currentLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  focusAreas?: string[]
  interviewDate?: string
  dailyMinutes?: number
  weakSkillsOverride?: string[]
  moduleProgress?: Record<string, ModuleTopicProgress>
  diagnostic?: DiagnosticResult
  skills: JourneySkills
  topicsCompleted: string[]
  topicsInProgress: string[]
  revisionBookmarks?: string[]
  currentFocusSlug: string
  currentStage: number
  startDate: string
  lastActiveDate: string
}

export type TopicUserStatus = 'completed' | 'in_progress' | 'recommended' | 'available' | 'locked'

export interface TopicContent {
  learn: string
  whyItMatters: string
  interviewTip: string
  realExperience?: string
  spotItPrompt?: string
  spotItDesign?: string
  spotItAnswer?: string
  fixItPrompt?: string
  fixItAnswer?: string
  interviewQuestion?: string
  interviewAnswer?: string
  followUp?: string
  followUpAnswer?: string
}

export interface DiagramSnapshot {
  version?: number
  meta?: { theme?: string; zoom?: number; panX?: number; panY?: number }
  nodes: unknown[]
  edges: unknown[]
}

export interface KnowledgeOption {
  id: string
  label: string
  correct?: boolean
}

export interface KnowledgeCheck {
  id: string
  prompt: string
  type: 'mcq' | 'multi' | 'short'
  options?: KnowledgeOption[]
  explanation?: string
  modelAnswer?: string
}

export type ModuleBlockKind =
  | 'concept'
  | 'example'
  | 'real_world'
  | 'diagram'
  | 'knowledge_check'
  | 'tips'
  | 'mistakes'
  | 'summary'
  | 'explain'

export interface ModuleBlock {
  id: string
  kind: ModuleBlockKind
  title: string
  durationMin?: number
  body?: string
  bullets?: string[]
  steps?: { title: string; body: string }[]
  diagramSnapshot?: DiagramSnapshot
  diagramCaption?: string
  checks?: KnowledgeCheck[]
}

export interface PracticeSolution {
  explanation: string
  diagramSnapshot?: DiagramSnapshot
  codeSnippet?: string
  codeLanguage?: string
}

export interface PracticeCheck {
  type: 'mcq' | 'multi' | 'short' | 'diagram_mark'
  options?: KnowledgeOption[]
  expectedElementIds?: string[]
  modelAnswer?: string
  explanation?: string
}

export interface PracticeItem {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  prompt: string
  hints: string[]
  solution: PracticeSolution
  commonMistakes: string[]
  checks?: PracticeCheck
  buildsSkills?: string[]
}

export interface CheatSheetCard {
  title: string
  bullets: string[]
  diagramSnapshot?: DiagramSnapshot
}

export interface InterviewQA {
  question: string
  answer: string
  tags?: string[]
}

export interface ExternalPractice {
  blurb?: string
  studioPacks?: string[]
  learnSlugs?: string[]
}

export interface JourneyTopic {
  _id: string
  slug: string
  title: string
  subtitle: string
  stage: 1 | 2 | 3 | 4 | 5
  order: number
  type: 'concept' | 'practice' | 'interview'
  description: string
  estimatedMinutes: number
  icon: string
  content?: TopicContent
  modules?: ModuleBlock[]
  practiceSet?: PracticeItem[]
  cheatSheet?: CheatSheetCard[]
  interviewBank?: InterviewQA[]
  takeaways?: string[]
  externalPractice?: ExternalPractice
  recommendedRoles?: string[]
  minLevel?: string
  gatePracticeUntilChecksPass?: boolean
  masteryThreshold?: number
  difficultyDimensions: {
    oop: 'easy' | 'medium' | 'hard'
    solid: 'easy' | 'medium' | 'hard'
    patterns: 'easy' | 'medium' | 'hard'
    extensibility: 'easy' | 'medium' | 'hard'
    requirementAmbiguity: 'easy' | 'medium' | 'hard'
  }
  buildsSkills: string[]
  prerequisites: string[]
  interviewerProbes: string[]
  commonMistakes: string[]
  patternMapSteps: { label: string; description: string }[]
  tags: string[]
  exerciseType?: 'detective_scenario' | 'design_bug' | 'quiz_set' | 'none'
  exerciseId?: string
  linkedStudioPack?: string
  linkedLearnExercise?: string
  userStatus?: TopicUserStatus
  masteryScore?: number
  /** primary = on your track; optional = deprioritized for current role */
  trackPriority?: 'primary' | 'optional'
}

export interface StageData {
  stage: number
  label: string
  description: string
  topics: JourneyTopic[]
}

export interface SkillBar {
  skill: string
  weight: number
}

export interface JourneyExperience {
  _id: string
  slug: string
  title: string
  company?: string
  round: string
  durationMinutes: number
  problem: string
  problemDescription: string
  followUps: string[]
  conceptsTested: string[]
  skillBars: SkillBar[]
  difficultyDimensions: Record<string, string>
  interviewerProbes: string[]
  prerequisiteTopics: string[]
  interviewerChecklist: string[]
  tags: string[]
  order: number
  userReadiness?: number
}

export interface JourneyRecommendation {
  topicSlug: string
  topicTitle: string
  estimatedMinutes: number
  reason: string
}

export interface JourneyActivity {
  _id: string
  userId: string
  topicSlug?: string
  activityType: string
  performance?: string
  skillsImproved: string[]
  duration?: number
  completedAt: string
}

export interface JourneyTip {
  _id: string
  moment: 'starting' | 'designing' | 'patterns' | 'followups' | 'explaining'
  title: string
  body: string
  order: number
}

export interface SkillGroupEntry {
  key: string
  label: string
  score: number
  assessed?: boolean
  weight?: number
  recentReasons?: string[]
}

export interface SkillGroup {
  label: string
  skills: SkillGroupEntry[]
}

export interface SkillsResponse {
  skills: JourneySkills
  skillLabels: Record<string, string>
  track?: { role: string; label: string }
  skillItems?: SkillGroupEntry[]
  grouped: Record<string, SkillGroup>
  overallScore: number | null
  weakestSkill: { key: string; label: string; score: number; assessed?: boolean }
  strongestSkill: { key: string; label: string; score: number; assessed?: boolean }
  readinessLevel: 'not-started' | 'beginner' | 'intermediate' | 'advanced' | 'interview-ready'
  howToImprove?: string | null
}

export interface DayPlanEntry {
  day: number
  date: string
  status: 'done' | 'today' | 'upcoming'
  focus: string
  topics: { slug: string; title: string; estimatedMinutes: number; type: string; icon: string }[]
  totalMinutes: number
}

export interface PlannrSummary {
  _id: string
  planName: string
  isActive: boolean
  targetRole: string
  currentLevel: string
  preparationDays: number
  completedCount: number
  totalTopics: number
  progressPercent: number
  currentStage: number
  startDate: string
  createdAt: string
}

export interface DailyPractice {
  date: string
  quiz: { done: boolean; streak: number }
  studioChallenge: { mode: string; slug: string; title: string; reason: string; difficulty: string } | null
  quickRun: { label: string; description: string; href: string }
  plannrTopic: { slug: string; title: string; reason: string } | null
  estimatedMinutes: number
}

export interface SpacedRepetitionItem {
  _id: string
  userId: string
  itemType: 'topic' | 'studio_challenge' | 'quiz_question'
  itemId: string
  itemTitle: string
  itemHref: string
  dueDate: string
  lastReviewedAt?: string
  reviewCount: number
  isActive: boolean
}

export interface SkillsPageResponse {
  skills: JourneySkills | null
  interviewReadiness: number
  readinessLabel: string
  topSkills: Array<{ key: string; label: string; score: number }>
  weakSkills: Array<{ key: string; label: string; score: number }>
  breakdown: {
    skillAverage: number
    totalTopicsCompleted: number
    stageReached: number
  }
}

export interface TopicDetailResponse {
  topic: JourneyTopic
  progress: ModuleTopicProgress
  practiceDifficultyDefault: 'easy' | 'medium' | 'hard'
  bookmarked?: boolean
}

export interface PracticeSubmitResult {
  correct: boolean
  score: number
  feedback: string
  solution: PracticeSolution
  commonMistakes: string[]
  hints: string[]
}

export interface CheckSubmitResult {
  correct: boolean
  score: number
  explanation?: string
  modelAnswer?: string
}

export interface RevisePackResponse {
  sheets: {
    slug: string
    title: string
    stage: number
    cheatSheet: CheatSheetCard[]
    takeaways: string[]
    interviewBank: InterviewQA[]
    completed: boolean
    buildsSkills?: string[]
    trackPriority?: 'primary' | 'optional'
  }[]
  track?: { role: string; label: string }
  howToImprove?: string | null
  focusSkills?: Array<{
    key: string
    label: string
    score: number
    assessed: boolean
    recentReasons?: string[]
  }>
  bookmarkedTopics?: Array<{
    slug: string
    title: string
    stage: number
    estimatedMinutes: number
    completed: boolean
    hasCheatSheet: boolean
  }>
  weakSkill: {
    key: string
    label: string
    value: number
    assessed?: boolean
  } | null
  weakTopics: {
    slug: string
    title: string
    stage: number
    estimatedMinutes: number
    kind?: 'learn' | 'revise'
  }[]
  stageMeta: Record<number, { label: string; description: string }>
}

export interface PracticeHubItem extends PracticeItem {
  topicSlug: string
  topicTitle: string
  stage: number
  topicCompleted: boolean
  solved?: boolean
}

export interface DiagnosticQuestion {
  id: string
  prompt: string
  options: { id: string; label: string; correct?: boolean }[]
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const journeyApi = {
  setup: (body: {
    planName?: string
    targetRole: string
    preparationDays: number
    currentLevel: string
    focusAreas?: string[]
    dailyMinutes?: number
    interviewDate?: string
    diagnostic?: DiagnosticResult
  }) =>
    request<{ profile: JourneyProfile }>('/plannr/setup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getProfile: () =>
    request<{ profile: JourneyProfile | null }>('/plannr/profile'),

  /** Change track / focus / pace — keeps skill history; readiness recomputes. */
  updateProfile: (body: {
    targetRole?: string
    focusAreas?: string[]
    preparationDays?: number
    dailyMinutes?: number
    interviewDate?: string | null
    planName?: string
    currentLevel?: string
  }) =>
    request<{ profile: JourneyProfile }>('/plannr/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  getDashboard: () =>
    request<{
      profile: JourneyProfile | null
      recommendation: JourneyRecommendation | null
      recentActivity: JourneyActivity[]
      completedCount: number
      totalTopics: number
      progressPercent: number
      onboarded: boolean
    }>('/plannr/dashboard'),

  getRoadmap: () =>
    request<{ stages: StageData[] }>('/plannr/roadmap'),

  getTopic: (slug: string) =>
    request<TopicDetailResponse>(`/plannr/topics/${slug}`),

  toggleRevisionBookmark: (slug: string) =>
    request<{ bookmarked: boolean; slug: string }>(`/plannr/topics/${slug}/bookmark`, {
      method: 'POST',
    }),

  completeTopic: (slug: string, payload: { performance?: 'excellent' | 'good' | 'fair' | 'poor'; exerciseScore?: number; exerciseType?: string }) =>
    request<{ profile: JourneyProfile; nextRecommendation: JourneyRecommendation | null }>(
      `/plannr/topics/${slug}/complete`,
      { method: 'POST', body: JSON.stringify(payload) },
    ),

  saveTopicProgress: (slug: string, body: {
    completedBlockIds?: string[]
    practiceSolvedIds?: string[]
    checkScores?: Record<string, number>
  }) =>
    request<{ progress: ModuleTopicProgress }>(`/plannr/topics/${slug}/progress`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  submitPractice: (slug: string, itemId: string, body: {
    selectedOptionIds?: string[]
    selectedElementIds?: string[]
    selfScore?: number
  }) =>
    request<PracticeSubmitResult>(`/plannr/topics/${slug}/practice/${itemId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  submitKnowledgeCheck: (slug: string, checkId: string, body: {
    selectedOptionIds?: string[]
    selfScore?: number
  }) =>
    request<CheckSubmitResult>(`/plannr/topics/${slug}/checks/${checkId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getRevisePack: () =>
    request<RevisePackResponse>('/plannr/revise'),

  listPracticeHub: () =>
    request<{ items: PracticeHubItem[]; defaultDifficulty: 'easy' | 'medium' | 'hard' }>('/plannr/practice'),

  getDiagnostic: () =>
    request<{ questions: DiagnosticQuestion[] }>('/plannr/diagnostic'),

  submitDiagnostic: (answers: { id: string; optionId: string }[]) =>
    request<{
      score: number
      suggestedLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
      suggestedStage: number
      answers: { id: string; correct: boolean }[]
    }>('/plannr/diagnostic/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getRecommendation: () =>
    request<{ recommendation: JourneyRecommendation | null }>('/plannr/recommendation'),

  listExperiences: () =>
    request<{ experiences: JourneyExperience[] }>('/plannr/experiences'),

  getExperience: (slug: string) =>
    request<{
      experience: JourneyExperience
      prereqDetails: { slug: string; title: string; icon: string; completed: boolean }[]
    }>(`/plannr/experiences/${slug}`),

  submitExperienceAttempt: (slug: string, body: { probeAnswers: { probe: string; answer: string }[]; classesDrawn: number }) =>
    request<{ score: number; attempt: string; skillsImproved: string[] }>(`/plannr/experiences/${slug}/attempt`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getSkills: () =>
    request<SkillsResponse>('/plannr/skills'),

  getPlan: () =>
    request<{ plan: DayPlanEntry[]; preparationDays: number; startDate: string }>('/plannr/plan'),

  getTips: () =>
    request<{ tips: Record<string, JourneyTip[]> }>('/plannr/tips'),

  logActivity: (body: {
    topicSlug?: string
    activityType: string
    performance?: string
    skillsImproved?: string[]
    duration?: number
    metadata?: Record<string, unknown>
  }) =>
    request<{ activity: JourneyActivity }>('/plannr/activity', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** Record Free/Pro preview / try access (no-op for Ultimate). */
  trackPreviewVisit: (source: 'hub' | 'setup' | 'generate' = 'hub') =>
    request<{ tracked: boolean; isNew?: boolean; reason?: string }>('/plannr/preview-visit', {
      method: 'POST',
      body: JSON.stringify({ source }),
    }),

  listPlans: () =>
    request<{ plans: PlannrSummary[] }>('/plannr/plans'),

  createPlan: (body: {
    planName: string
    targetRole: string
    preparationDays: number
    currentLevel: string
  }) =>
    request<{ profile: JourneyProfile }>('/plannr/plans', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  switchPlan: (id: string) =>
    request<{ success: boolean; activePlanId: string; planName: string }>(
      `/plannr/plans/${id}/switch`,
      { method: 'PATCH' },
    ),

  deletePlan: (id: string) =>
    request<{ success: boolean }>(`/plannr/plans/${id}`, { method: 'DELETE' }),

  getSkillReadiness: () =>
    request<{ interviewReadiness: number; skills: Record<string, number> | null }>('/skills/readiness'),

  getDailyPractice: () =>
    request<DailyPractice>('/plannr/daily-practice'),

  getSkillsPage: () =>
    request<SkillsPageResponse>('/plannr/skills/page'),

  getSpacedRepetition: () =>
    request<{ items: SpacedRepetitionItem[]; count: number }>('/plannr/spaced-repetition'),

  dismissSpacedRepetitionItem: (id: string) =>
    request<{ ok: boolean }>(`/plannr/spaced-repetition/${id}/dismiss`, { method: 'PATCH' }),
}
