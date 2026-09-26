import { Request, Response, NextFunction } from 'express'
import { JourneyProfile, ISkills } from '../models/journey/journey-profile.model'
import { SKILL_KEYS, computeInterviewReadiness, applySkillDeltas } from '../utils/skill-updater'

// POST /skills/update
// Body: { source: string, skillDeltas: Record<string, number>, metadata?: any }
export async function updateSkills(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const { source, skillDeltas, metadata } = req.body as {
      source: string
      skillDeltas: Record<string, number>
      metadata?: unknown
    }

    const profile = await JourneyProfile.findOne({ userId, isActive: true })

    if (!profile) {
      res.json({ ok: true, noProfile: true })
      return
    }

    const skillsRaw = profile.skills as unknown as Record<string, number>

    for (const [key, delta] of Object.entries(skillDeltas ?? {})) {
      if (delta === undefined) continue
      if ((SKILL_KEYS as ReadonlyArray<string>).includes(key)) {
        const current = skillsRaw[key] ?? 0
        skillsRaw[key] = Math.min(100, Math.max(0, current + delta))
      }
    }

    profile.markModified('skills')
    profile.lastActiveDate = new Date()
    await profile.save()

    const updatedSkills = profile.skills as unknown as ISkills
    const interviewReadiness = computeInterviewReadiness(
      profile.skills as unknown as Record<string, number>,
    )

    res.json({ ok: true, updatedSkills, interviewReadiness, source })
  } catch (err) {
    next(err)
  }
}

// GET /skills/readiness
export async function getReadinessScore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id
    const profile = await JourneyProfile.findOne({ userId, isActive: true })

    if (!profile) {
      res.json({ interviewReadiness: 0, skills: null })
      return
    }

    const skills = profile.skills as unknown as ISkills
    const interviewReadiness = computeInterviewReadiness(
      profile.skills as unknown as Record<string, number>,
    )

    res.json({
      interviewReadiness,
      skills,
      breakdown: { skillAverage: interviewReadiness },
    })
  } catch (err) {
    next(err)
  }
}

// Re-export the helper so other controllers can call it directly
export { applySkillDeltas }
