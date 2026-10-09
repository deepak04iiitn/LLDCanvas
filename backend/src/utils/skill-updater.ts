import { JourneyProfile, ISkills } from '../models/journey/journey-profile.model'
import { applyEvidenceToProfile, type EvidenceInput } from '../services/plannr/skillEvidence'
import { getEffectiveWeights, readinessFromScore } from '../services/plannr/trackConfig'

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

/** Track-weighted readiness over assessed skills when evidence exists; else mean of track keys. */
export function computeInterviewReadiness(
  skills: Record<string, number>,
  opts?: { role?: string; focusAreas?: string[]; assessedKeys?: Set<string> },
): number {
  if (opts?.role) {
    const { skillKeys, weights } = getEffectiveWeights(opts.role, opts.focusAreas ?? [])
    const keys = opts.assessedKeys?.size
      ? skillKeys.filter(k => opts.assessedKeys!.has(k))
      : skillKeys
    if (!keys.length) return 0
    let wSum = 0
    let sSum = 0
    for (const k of keys) {
      const w = weights[k] ?? 1
      wSum += w
      sSum += (skills[k] ?? 0) * w
    }
    return wSum > 0 ? Math.round(sSum / wSum) : 0
  }
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

  const events: EvidenceInput[] = []
  for (const [key, delta] of Object.entries(skillDeltas)) {
    if (delta === undefined || delta === 0) continue
    if ((SKILL_KEYS as ReadonlyArray<string>).includes(key)) {
      events.push({
        skillKey: key,
        delta,
        reason: `Progress from ${source.replace(/_/g, ' ')}`,
        source: source === 'experience' ? 'mock' : 'practice',
      })
    }
  }

  if (events.length) {
    const { skills, evidence } = applyEvidenceToProfile(profile, events)
    profile.skills = skills as ISkills
    profile.skillEvidence = evidence
    profile.markModified('skills')
    profile.markModified('skillEvidence')
  }

  profile.lastActiveDate = new Date()
  await profile.save()

  const assessed = new Set((profile.skillEvidence ?? []).map(e => e.skillKey))
  const interviewReadiness = computeInterviewReadiness(
    profile.skills as unknown as Record<string, number>,
    {
      role: profile.targetRole,
      focusAreas: profile.focusAreas,
      assessedKeys: assessed,
    },
  )

  void readinessFromScore(assessed.size ? interviewReadiness : null)

  return { ok: true, interviewReadiness }
}
