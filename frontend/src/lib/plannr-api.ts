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

export interface JourneyProfile {
  _id: string
  userId: string
  onboardingComplete: boolean
  targetRole: 'sde1' | 'sde2' | 'backend' | 'fullstack' | 'general'
  preparationDays: 7 | 14 | 30 | 60
  currentLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving'
  skills: JourneySkills
  topicsCompleted: string[]
  topicsInProgress: string[]
  currentFocusSlug: string
  currentStage: number
  startDate: string
  lastActiveDate: string
}

export type TopicUserStatus = 'completed' | 'in_progress' | 'recommended' | 'locked'

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
  content: TopicContent
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
  userStatus?: TopicUserStatus
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
}

export interface SkillGroup {
  label: string
  skills: SkillGroupEntry[]
}

export interface SkillsResponse {
  skills: JourneySkills
  skillLabels: Record<string, string>
  grouped: Record<string, SkillGroup>
  overallScore: number
  weakestSkill: { key: string; label: string; score: number }
  strongestSkill: { key: string; label: string; score: number }
  readinessLevel: 'beginner' | 'intermediate' | 'advanced' | 'interview-ready'
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

// ─── API ──────────────────────────────────────────────────────────────────────

export const journeyApi = {
  setup: (body: {
    targetRole: string
    preparationDays: number
    currentLevel: string
  }) =>
    request<{ profile: JourneyProfile }>('/plannr/setup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getProfile: () =>
    request<{ profile: JourneyProfile | null }>('/plannr/profile'),

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
    request<{ topic: JourneyTopic }>(`/plannr/topics/${slug}`),

  completeTopic: (slug: string, performance: 'excellent' | 'good' | 'fair' | 'poor') =>
    request<{ profile: JourneyProfile; nextRecommendation: JourneyRecommendation | null }>(
      `/plannr/topics/${slug}/complete`,
      { method: 'POST', body: JSON.stringify({ performance }) },
    ),

  getRecommendation: () =>
    request<{ recommendation: JourneyRecommendation | null }>('/plannr/recommendation'),

  listExperiences: () =>
    request<{ experiences: JourneyExperience[] }>('/plannr/experiences'),

  getExperience: (slug: string) =>
    request<{
      experience: JourneyExperience
      prereqDetails: { slug: string; title: string; icon: string; completed: boolean }[]
    }>(`/plannr/experiences/${slug}`),

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

  // ─── Multi-plan ─────────────────────────────────────────────────────────────
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
}
