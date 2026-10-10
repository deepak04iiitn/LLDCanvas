/**
 * Evidence-based skill scoring — scores only move with logged reasons.
 */

import type { IJourneyProfile, ISkillEvidence, ISkills } from '../../models/journey/journey-profile.model'
import { SKILL_KEYS } from './skillsMeta'
import { getEffectiveWeights, readinessFromScore, skillLabel, type ReadinessLevel } from './trackConfig'

export type EvidenceSource =
  | 'practice'
  | 'check'
  | 'mastery'
  | 'mock'
  | 'diagnostic'
  | 'migration'

export interface EvidenceInput {
  skillKey: string
  delta: number
  reason: string
  source: EvidenceSource
  topicSlug?: string
}

const ZERO_SKILLS = (): ISkills => ({
  oop: 0,
  solid: 0,
  patterns: 0,
  designThinking: 0,
  requirementAnalysis: 0,
  entityIdentification: 0,
  responsibilities: 0,
  relationships: 0,
  extensibility: 0,
  coupling: 0,
  cohesion: 0,
  communication: 0,
  tradeoffReasoning: 0,
  followupHandling: 0,
  designSpeed: 0,
})

export function emptySkills(): ISkills {
  return ZERO_SKILLS()
}

export function assessedSkillKeys(evidence: ISkillEvidence[] | undefined): Set<string> {
  const set = new Set<string>()
  for (const e of evidence ?? []) {
    if (e.skillKey) set.add(e.skillKey)
  }
  return set
}

export function isSkillAssessed(
  skillKey: string,
  evidence: ISkillEvidence[] | undefined,
): boolean {
  return assessedSkillKeys(evidence).has(skillKey)
}

/**
 * Apply evidence deltas onto a profile document (in memory).
 * Caller must save / $set.
 */
export function applyEvidenceToProfile(
  profile: IJourneyProfile,
  events: EvidenceInput[],
): { skills: ISkills; evidence: ISkillEvidence[]; applied: ISkillEvidence[] } {
  const skills = {
    ...(profile.skills ? (profile.toObject?.().skills ?? profile.skills) : emptySkills()),
  } as unknown as Record<string, number>
  // Ensure all keys exist as numbers
  for (const k of SKILL_KEYS) {
    if (typeof skills[k] !== 'number') skills[k] = 0
  }

  const evidence: ISkillEvidence[] = [...(profile.skillEvidence ?? [])]
  const applied: ISkillEvidence[] = []
  const now = new Date()

  for (const ev of events) {
    if (!(SKILL_KEYS as readonly string[]).includes(ev.skillKey)) continue
    if (!ev.delta || ev.delta === 0) continue

    const current = skills[ev.skillKey] ?? 0
    const next = Math.min(100, Math.max(0, current + ev.delta))
    const actualDelta = next - current
    if (actualDelta === 0) continue

    skills[ev.skillKey] = next
    const entry: ISkillEvidence = {
      skillKey: ev.skillKey,
      delta: actualDelta,
      reason: ev.reason,
      source: ev.source,
      topicSlug: ev.topicSlug,
      at: now,
    }
    evidence.push(entry)
    applied.push(entry)
  }

  // Cap evidence log size
  const trimmed = evidence.length > 200 ? evidence.slice(-200) : evidence

  return {
    skills: skills as unknown as ISkills,
    evidence: trimmed,
    applied,
  }
}

/** Mastery-based deltas across topic.buildsSkills (spread, not flat). */
export function masteryEvidenceEvents(
  buildsSkills: string[],
  masteryScore: number,
  topicTitle: string,
  topicSlug: string,
): EvidenceInput[] {
  if (masteryScore < 60 || !buildsSkills.length) return []
  // 60→+2, 80→+4, 100→+6 per skill (capped)
  const perSkill = Math.min(6, Math.max(2, Math.round((masteryScore - 40) / 10)))
  return buildsSkills.map(skillKey => ({
    skillKey,
    delta: perSkill,
    reason: `Mastered “${topicTitle}” (${masteryScore}% mastery)`,
    source: 'mastery' as const,
    topicSlug,
  }))
}

/** Practice item solved — small bump, capped by caller per topic. */
export function practiceEvidenceEvents(
  buildsSkills: string[],
  topicTitle: string,
  topicSlug: string,
  quality: 'ok' | 'good' | 'strong' = 'good',
): EvidenceInput[] {
  if (!buildsSkills.length) return []
  const delta = quality === 'strong' ? 3 : quality === 'good' ? 2 : 1
  // Only bump primary skill (first) to avoid exploding scores on multi-skill topics
  const primary = buildsSkills[0]
  return [
    {
      skillKey: primary,
      delta,
      reason: `Practice on “${topicTitle}”`,
      source: 'practice',
      topicSlug,
    },
  ]
}

export function checkEvidenceEvents(
  buildsSkills: string[],
  checkScore: number,
  topicTitle: string,
  topicSlug: string,
): EvidenceInput[] {
  if (checkScore < 50 || !buildsSkills.length) return []
  const delta = checkScore >= 90 ? 4 : checkScore >= 70 ? 3 : 2
  return [
    {
      skillKey: buildsSkills[0],
      delta,
      reason: `Concept check on “${topicTitle}” (${Math.round(checkScore)}%)`,
      source: 'check',
      topicSlug,
    },
  ]
}

export function mockEvidenceEvents(
  skillKeys: string[],
  score: number,
  experienceTitle: string,
): EvidenceInput[] {
  const delta = Math.ceil(score / 20) // 0–5
  if (delta <= 0 || !skillKeys.length) return []
  return skillKeys.map(skillKey => ({
    skillKey,
    delta,
    reason: `Mock “${experienceTitle}” scored ${score}`,
    source: 'mock' as const,
  }))
}

export interface SkillViewItem {
  key: string
  label: string
  score: number
  assessed: boolean
  weight: number
  recentReasons: string[]
}

export function buildSkillsView(profile: IJourneyProfile): {
  track: { role: string; label: string }
  skills: SkillViewItem[]
  grouped: Record<string, { label: string; skills: SkillViewItem[] }>
  overallScore: number | null
  readinessLevel: ReadinessLevel
  weakestSkill: { key: string; label: string; score: number; assessed: boolean } | null
  strongestSkill: { key: string; label: string; score: number; assessed: boolean } | null
  howToImprove: string | null
} {
  const role = profile.targetRole ?? 'general'
  const { skillKeys, weights, groups, label } = getEffectiveWeights(role, profile.focusAreas ?? [])
  const skillsMap = (profile.toObject?.().skills ?? profile.skills ?? emptySkills()) as unknown as Record<
    string,
    number
  >
  const evidence = profile.skillEvidence ?? []
  const assessed = assessedSkillKeys(evidence)

  const recentFor = (key: string): string[] =>
    evidence
      .filter(e => e.skillKey === key)
      .slice(-3)
      .reverse()
      .map(e => e.reason)

  const items: SkillViewItem[] = skillKeys.map(key => ({
    key,
    label: skillLabel(key),
    score: typeof skillsMap[key] === 'number' ? skillsMap[key] : 0,
    assessed: assessed.has(key),
    weight: weights[key] ?? 1,
    recentReasons: recentFor(key),
  }))

  const assessedItems = items.filter(i => i.assessed)
  let overallScore: number | null = null
  if (assessedItems.length > 0) {
    let wSum = 0
    let sSum = 0
    for (const i of assessedItems) {
      wSum += i.weight
      sSum += i.score * i.weight
    }
    overallScore = wSum > 0 ? Math.round(sSum / wSum) : null
  }

  const grouped: Record<string, { label: string; skills: SkillViewItem[] }> = {}
  for (const g of groups) {
    const gs = items.filter(i => g.skills.includes(i.key))
    if (!gs.length) continue
    grouped[g.id] = { label: g.label, skills: gs }
  }

  const sortedAsc = [...assessedItems].sort((a, b) => a.score - b.score)
  const sortedDesc = [...assessedItems].sort((a, b) => b.score - a.score)

  const unassessed = items.find(i => !i.assessed)
  const howToImprove = unassessed
    ? `Start building ${unassessed.label} — not assessed yet.`
    : sortedAsc[0]
      ? `Improve ${sortedAsc[0].label} (currently ${sortedAsc[0].score}).`
      : null

  return {
    track: { role, label },
    skills: items,
    grouped,
    overallScore,
    readinessLevel: readinessFromScore(overallScore),
    weakestSkill: sortedAsc[0]
      ? { key: sortedAsc[0].key, label: sortedAsc[0].label, score: sortedAsc[0].score, assessed: true }
      : unassessed
        ? { key: unassessed.key, label: unassessed.label, score: 0, assessed: false }
        : null,
    strongestSkill: sortedDesc[0]
      ? {
          key: sortedDesc[0].key,
          label: sortedDesc[0].label,
          score: sortedDesc[0].score,
          assessed: true,
        }
      : null,
    howToImprove,
  }
}

/** Track keys for recommendation; prefer unassessed, then lowest assessed. */
export function pickPrioritySkill(
  profile: IJourneyProfile,
): { key: string; value: number; assessed: boolean } {
  const { skillKeys } = getEffectiveWeights(profile.targetRole ?? 'general', profile.focusAreas ?? [])
  const override = profile.weakSkillsOverride?.filter(k => skillKeys.includes(k))
  const keys = override?.length ? override : skillKeys
  const skillsMap = (profile.toObject?.().skills ?? profile.skills ?? emptySkills()) as unknown as Record<
    string,
    number
  >
  const assessed = assessedSkillKeys(profile.skillEvidence)

  for (const k of keys) {
    if (!assessed.has(k)) return { key: k, value: 0, assessed: false }
  }

  let min = Infinity
  let key = keys[0] ?? 'oop'
  for (const k of keys) {
    const v = skillsMap[k] ?? 0
    if (v < min) {
      min = v
      key = k
    }
  }
  return { key, value: min === Infinity ? 0 : min, assessed: assessed.has(key) }
}
