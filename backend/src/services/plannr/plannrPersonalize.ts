/**
 * Plannr personalization — role, level, focus areas, and mastery drive
 * recommendations and day plans. All curriculum data comes from JourneyTopic.
 */

import { JourneyTopic, type IJourneyTopic } from '../../models/journey/journey-topic.model'
import type { IJourneyProfile, ISkills } from '../../models/journey/journey-profile.model'
import { getEffectiveWeights } from './trackConfig'
import { emptySkills, pickPrioritySkill } from './skillEvidence'
import { SKILL_KEYS, SKILL_LABELS } from './skillsMeta'

export { SKILL_KEYS, SKILL_LABELS }

export const STAGE_META: Record<number, { label: string; description: string }> = {
  1: {
    label: 'Speak OOP',
    description: 'Build the vocabulary and mental models of object-oriented design',
  },
  2: {
    label: 'Think in Responsibilities',
    description: 'Assign responsibilities and reason about coupling and cohesion',
  },
  3: {
    label: 'Design for Change',
    description: 'Patterns and abstractions that absorb new requirements',
  },
  4: {
    label: 'Interview Thinking',
    description: 'Clarify, design, explain trade-offs under interview pressure',
  },
  5: {
    label: 'Pressure Test',
    description: 'Simulate rounds and debrief like a senior interviewer',
  },
}

const LEVEL_RANK: Record<string, number> = {
  scratch: 0,
  oop: 1,
  'basic-lld': 2,
  solving: 3,
}

const LEVEL_START_STAGE: Record<string, number> = {
  scratch: 1,
  oop: 1,
  'basic-lld': 2,
  solving: 3,
}

/** @deprecated Skills always start at 0 — level only affects roadmap placement. */
export function getInitialSkills(_level?: string): ISkills {
  return emptySkills()
}

export function startStageForLevel(level: string): number {
  return LEVEL_START_STAGE[level] ?? 1
}

export function getWeakestSkill(
  skills: ISkills,
  overrideKeys?: string[],
): { key: string; value: number } {
  const keys =
    overrideKeys && overrideKeys.length > 0
      ? (overrideKeys.filter(k => SKILL_KEYS.includes(k as keyof ISkills)) as (keyof ISkills)[])
      : SKILL_KEYS
  let min = Infinity
  let key: string = keys[0] ?? 'requirementAnalysis'
  for (const k of keys) {
    const v = (skills as unknown as Record<string, number>)[k] ?? 0
    if (v < min) {
      min = v
      key = k
    }
  }
  return { key, value: min === Infinity ? 0 : min }
}

function roleWeight(topic: IJourneyTopic, role: string): number {
  const map = topic.emphasisWeightByRole
  if (!map) return 1
  if (map instanceof Map) return Number(map.get(role) ?? 1)
  return Number((map as Record<string, number>)[role] ?? 1)
}

function topicFitsLevel(topic: IJourneyTopic, level: string): boolean {
  const need = LEVEL_RANK[topic.minLevel ?? 'scratch'] ?? 0
  const have = LEVEL_RANK[level] ?? 0
  // Allow topics at or below user level, plus one stage ahead for stretch
  return need <= have + 1
}

function topicFitsRole(topic: IJourneyTopic, role: string): boolean {
  const roles = topic.recommendedRoles ?? []
  if (!roles.length) return true
  return roles.includes(role) || roles.includes('general')
}

/** Score higher = better recommendation candidate. */
export function scoreTopicForProfile(topic: IJourneyTopic, profile: IJourneyProfile): number {
  let score = 0
  const role = profile.targetRole ?? 'general'
  const { skillKeys } = getEffectiveWeights(role, profile.focusAreas ?? [])
  const trackSet = new Set(skillKeys)
  const priority = pickPrioritySkill(profile)

  if ((topic.buildsSkills ?? []).includes(priority.key)) score += 40
  // Prefer topics that build track-relevant skills
  const trackHits = (topic.buildsSkills ?? []).filter(s => trackSet.has(s)).length
  score += trackHits * 8
  if (profile.focusAreas?.length) {
    const hit = profile.focusAreas.some(
      a =>
        (topic.buildsSkills ?? []).includes(a) ||
        (topic.tags ?? []).map(t => t.toLowerCase()).includes(a.toLowerCase()),
    )
    if (hit) score += 25
  }
  if (topicFitsRole(topic, role)) score += 15
  else score -= 8
  score += roleWeight(topic, role) * 5
  if (topicFitsLevel(topic, profile.currentLevel)) score += 10
  else score -= 20

  // Prefer current / next stage
  const stage = profile.currentStage ?? 1
  if (topic.stage === stage) score += 12
  else if (topic.stage === stage + 1) score += 4
  else if (topic.stage < stage) score += 2

  score -= topic.order * 0.01
  return score
}

export async function computeRecommendation(profile: IJourneyProfile) {
  const completed = new Set(profile.topicsCompleted ?? [])
  const topics = await JourneyTopic.find({ status: 'published' }).lean()
  const incomplete = topics.filter(
    t => !completed.has(t.slug) && topicFitsLevel(t as unknown as IJourneyTopic, profile.currentLevel),
  )

  if (!incomplete.length) return null

  incomplete.sort(
    (a, b) =>
      scoreTopicForProfile(b as unknown as IJourneyTopic, profile) -
      scoreTopicForProfile(a as unknown as IJourneyTopic, profile),
  )
  const best = incomplete[0]
  const priority = pickPrioritySkill(profile)
  const skillName = SKILL_LABELS[priority.key] ?? priority.key
  const roleFit = topicFitsRole(best as unknown as IJourneyTopic, profile.targetRole)

  let reason: string
  if ((best.buildsSkills ?? []).includes(priority.key)) {
    reason = priority.assessed
      ? `Builds ${skillName} (currently ${priority.value}) for your ${profile.targetRole} track.`
      : `Builds ${skillName} — not assessed yet on your ${profile.targetRole} track.`
  } else if (roleFit) {
    reason = `Next on your ${profile.targetRole} path: ${best.title}.`
  } else {
    reason = `Continue with ${best.title} to keep momentum on your path.`
  }

  return {
    topicSlug: best.slug,
    topicTitle: best.title,
    estimatedMinutes: best.estimatedMinutes,
    reason,
  }
}

export function defaultPracticeDifficulty(
  profile: IJourneyProfile,
): 'easy' | 'medium' | 'hard' {
  const level = profile.currentLevel
  if (level === 'scratch' || level === 'oop') return 'easy'
  if (level === 'basic-lld') return 'medium'
  return 'hard'
}

export function pickVariantBody(
  variants: { role: string; body: string }[] | undefined,
  fallback: string | undefined,
  role: string,
): string {
  if (!variants?.length) return fallback ?? ''
  const exact = variants.find(v => v.role === role)
  if (exact) return exact.body
  const general = variants.find(v => v.role === 'general')
  return general?.body ?? variants[0].body ?? fallback ?? ''
}

export function computeMasteryScore(opts: {
  completedBlocks: number
  totalBlocks: number
  solvedPractice: number
  totalPractice: number
  avgCheckScore: number
}): number {
  const blockPct = opts.totalBlocks > 0 ? opts.completedBlocks / opts.totalBlocks : 0
  const practicePct = opts.totalPractice > 0 ? opts.solvedPractice / opts.totalPractice : 0
  const checkPct = opts.avgCheckScore / 100
  return Math.round(blockPct * 35 + practicePct * 45 + checkPct * 20)
}

/** Pack remaining topics into days using dailyMinutes budget + role/focus scoring. */
export function packDayPlan(
  topics: IJourneyTopic[],
  profile: IJourneyProfile,
): {
  day: number
  date: string
  status: 'done' | 'today' | 'upcoming'
  focus: string
  topics: { slug: string; title: string; estimatedMinutes: number; type: string; icon: string }[]
  totalMinutes: number
}[] {
  const completed = new Set(profile.topicsCompleted ?? [])
  const days = profile.preparationDays ?? 30
  const budget = Math.max(20, profile.dailyMinutes ?? 45)
  const start = profile.startDate ? new Date(profile.startDate) : new Date()
  const now = new Date()

  const remaining = topics
    .filter(t => !completed.has(t.slug))
    .sort((a, b) => scoreTopicForProfile(b, profile) - scoreTopicForProfile(a, profile))

  const plan: {
    day: number
    date: string
    status: 'done' | 'today' | 'upcoming'
    focus: string
    topics: { slug: string; title: string; estimatedMinutes: number; type: string; icon: string }[]
    totalMinutes: number
  }[] = []

  let cursor = 0
  for (let d = 0; d < days; d++) {
    const date = new Date(start)
    date.setDate(start.getDate() + d)
    const dayTopics: typeof remaining = []
    let mins = 0
    while (cursor < remaining.length) {
      const t = remaining[cursor]
      const cost = t.estimatedMinutes || 15
      if (dayTopics.length > 0 && mins + cost > budget) break
      dayTopics.push(t)
      mins += cost
      cursor++
      if (mins >= budget) break
    }
    const isToday = date.toDateString() === now.toDateString()
    const isPast = date < now && !isToday
    plan.push({
      day: d + 1,
      date: date.toISOString().split('T')[0],
      status: isPast ? 'done' : isToday ? 'today' : 'upcoming',
      focus: dayTopics[0]?.title ?? 'Review & spaced practice',
      topics: dayTopics.map(t => ({
        slug: t.slug,
        title: t.title,
        estimatedMinutes: t.estimatedMinutes,
        type: t.type,
        icon: t.icon,
      })),
      totalMinutes: mins,
    })
  }
  return plan
}
