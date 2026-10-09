/**
 * Per-track skill sets and readiness weights.
 * Roles are tracks; focus areas boost matching skill weights.
 */

import { SKILL_KEYS, SKILL_LABELS } from './skillsMeta'

export type TrackRole = 'sde1' | 'sde2' | 'backend' | 'fullstack' | 'general'

export interface TrackSkillGroup {
  id: string
  label: string
  skills: string[]
}

export interface TrackConfig {
  role: TrackRole
  label: string
  skillKeys: string[]
  /** Relative weights for readiness (normalized at compute time) */
  weights: Record<string, number>
  groups: TrackSkillGroup[]
}

const ALL_GROUPS: TrackSkillGroup[] = [
  {
    id: 'oop_skills',
    label: 'OOP & Structure',
    skills: ['oop', 'relationships', 'entityIdentification', 'responsibilities'],
  },
  {
    id: 'solid_skills',
    label: 'SOLID & Design Quality',
    skills: ['solid', 'coupling', 'cohesion', 'extensibility'],
  },
  {
    id: 'pattern_skills',
    label: 'Design Patterns',
    skills: ['patterns', 'designThinking'],
  },
  {
    id: 'interview_skills',
    label: 'Interview Skills',
    skills: [
      'requirementAnalysis',
      'communication',
      'tradeoffReasoning',
      'followupHandling',
      'designSpeed',
    ],
  },
]

function pickGroups(keys: string[]): TrackSkillGroup[] {
  const set = new Set(keys)
  return ALL_GROUPS.map(g => ({
    ...g,
    skills: g.skills.filter(k => set.has(k)),
  })).filter(g => g.skills.length > 0)
}

function weightsFromKeys(keys: string[], boosts: Record<string, number> = {}): Record<string, number> {
  const w: Record<string, number> = {}
  for (const k of keys) w[k] = boosts[k] ?? 1
  return w
}

const TRACKS: Record<TrackRole, TrackConfig> = {
  sde1: (() => {
    const skillKeys = [
      'oop',
      'relationships',
      'entityIdentification',
      'responsibilities',
      'solid',
      'requirementAnalysis',
      'communication',
      'designThinking',
    ]
    return {
      role: 'sde1' as const,
      label: 'SDE-1 LLD',
      skillKeys,
      weights: weightsFromKeys(skillKeys, {
        oop: 1.4,
        relationships: 1.3,
        entityIdentification: 1.2,
        responsibilities: 1.2,
        requirementAnalysis: 1.1,
      }),
      groups: pickGroups(skillKeys),
    }
  })(),
  sde2: (() => {
    const skillKeys = [
      'oop',
      'relationships',
      'responsibilities',
      'solid',
      'coupling',
      'cohesion',
      'extensibility',
      'patterns',
      'designThinking',
      'requirementAnalysis',
      'tradeoffReasoning',
      'followupHandling',
      'communication',
      'designSpeed',
    ]
    return {
      role: 'sde2' as const,
      label: 'SDE-2 LLD',
      skillKeys,
      weights: weightsFromKeys(skillKeys, {
        patterns: 1.3,
        tradeoffReasoning: 1.4,
        followupHandling: 1.2,
        solid: 1.2,
        extensibility: 1.2,
      }),
      groups: pickGroups(skillKeys),
    }
  })(),
  backend: (() => {
    const skillKeys = [
      'oop',
      'responsibilities',
      'solid',
      'coupling',
      'cohesion',
      'extensibility',
      'patterns',
      'entityIdentification',
      'tradeoffReasoning',
      'requirementAnalysis',
      'designThinking',
    ]
    return {
      role: 'backend' as const,
      label: 'Backend LLD',
      skillKeys,
      weights: weightsFromKeys(skillKeys, {
        coupling: 1.4,
        extensibility: 1.4,
        cohesion: 1.3,
        solid: 1.2,
        patterns: 1.2,
      }),
      groups: pickGroups(skillKeys),
    }
  })(),
  fullstack: (() => {
    const skillKeys = [
      'oop',
      'relationships',
      'entityIdentification',
      'responsibilities',
      'solid',
      'patterns',
      'designThinking',
      'requirementAnalysis',
      'communication',
      'tradeoffReasoning',
      'designSpeed',
    ]
    return {
      role: 'fullstack' as const,
      label: 'Full Stack LLD',
      skillKeys,
      weights: weightsFromKeys(skillKeys, {
        designThinking: 1.3,
        requirementAnalysis: 1.3,
        communication: 1.2,
        patterns: 1.1,
      }),
      groups: pickGroups(skillKeys),
    }
  })(),
  general: (() => {
    const skillKeys = [...SKILL_KEYS] as string[]
    return {
      role: 'general' as const,
      label: 'General LLD',
      skillKeys,
      weights: weightsFromKeys(skillKeys),
      groups: pickGroups(skillKeys),
    }
  })(),
}

/** Focus chips boost matching skill keys (and close aliases). */
const FOCUS_TO_SKILLS: Record<string, string[]> = {
  patterns: ['patterns', 'designThinking'],
  solid: ['solid', 'coupling', 'cohesion', 'extensibility'],
  systems: ['responsibilities', 'entityIdentification', 'relationships', 'extensibility'],
  interview: ['requirementAnalysis', 'communication', 'tradeoffReasoning', 'followupHandling', 'designSpeed'],
  oop: ['oop', 'relationships', 'entityIdentification', 'responsibilities'],
}

export function getTrackConfig(role: string): TrackConfig {
  const key = (role in TRACKS ? role : 'general') as TrackRole
  return TRACKS[key]
}

export function getTrackLabel(role: string): string {
  return getTrackConfig(role).label
}

/**
 * Effective weights for a profile: track base × focus boosts (1.35x on matching skills).
 */
export function getEffectiveWeights(
  role: string,
  focusAreas: string[] = [],
): { skillKeys: string[]; weights: Record<string, number>; groups: TrackSkillGroup[]; label: string } {
  const track = getTrackConfig(role)
  const weights = { ...track.weights }

  for (const focus of focusAreas) {
    const mapped = FOCUS_TO_SKILLS[focus] ?? []
    for (const sk of mapped) {
      if (weights[sk] !== undefined) weights[sk] *= 1.35
    }
  }

  return {
    skillKeys: track.skillKeys,
    weights,
    groups: track.groups,
    label: track.label,
  }
}

export function skillLabel(key: string): string {
  return SKILL_LABELS[key] ?? key
}

export type ReadinessLevel =
  | 'not-started'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'interview-ready'

export function readinessFromScore(avg: number | null): ReadinessLevel {
  if (avg === null) return 'not-started'
  if (avg >= 80) return 'interview-ready'
  if (avg >= 60) return 'advanced'
  if (avg >= 35) return 'intermediate'
  return 'beginner'
}
