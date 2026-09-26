import { JourneyProfile, ISkills } from '../models/journey/journey-profile.model'

export const SKILL_KEYS: ReadonlyArray<keyof ISkills> = [
  'oop',
  'solid',
  'patterns',
  'designThinking',
  'requirementAnalysis',
  'entityIdentification',
  'responsibilities',
  'relationships',
  'extensibility',
  'coupling',
  'cohesion',
  'communication',
  'tradeoffReasoning',
  'followupHandling',
  'designSpeed',
]

export function computeInterviewReadiness(skills: Record<string, number>): number {
  const total = SKILL_KEYS.reduce((sum, key) => sum + (skills[key] ?? 0), 0)
  return Math.round(total / SKILL_KEYS.length)
}

export async function applySkillDeltas(
  userId: string,
  source: string,
  skillDeltas: Partial<Record<string, number>>,
): Promise<{ ok: boolean; interviewReadiness?: number }> {
  const profile = await JourneyProfile.findOne({ userId, isActive: true })

  if (!profile) {
    return { ok: true }
  }

  const skillsRaw = profile.skills as unknown as Record<string, number>

  for (const [key, delta] of Object.entries(skillDeltas)) {
    if (delta === undefined) continue
    if ((SKILL_KEYS as ReadonlyArray<string>).includes(key)) {
      const current = skillsRaw[key] ?? 0
      skillsRaw[key] = Math.min(100, Math.max(0, current + delta))
    }
  }

  profile.markModified('skills')
  profile.lastActiveDate = new Date()
  await profile.save()

  const interviewReadiness = computeInterviewReadiness(
    profile.skills as unknown as Record<string, number>,
  )

  return { ok: true, interviewReadiness }
}
