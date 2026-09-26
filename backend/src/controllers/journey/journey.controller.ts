import { Request, Response, NextFunction } from 'express'
import { JourneyProfile, ISkills } from '../../models/journey/journey-profile.model'
import { JourneyTopic } from '../../models/journey/journey-topic.model'
import { JourneyExperience } from '../../models/journey/journey-experience.model'
import { JourneyActivity } from '../../models/journey/journey-activity.model'
import { JourneyTip } from '../../models/journey/journey-tip.model'

// ── Stage labels ──────────────────────────────────────────────────────────────
const STAGE_META: Record<number, { label: string; description: string }> = {
  1: { label: 'Speak OOP', description: 'Build the vocabulary and mental models of object-oriented design' },
  2: { label: 'Think in Responsibilities', description: 'Learn to assign responsibilities and reason about coupling' },
  3: { label: 'Design for Change', description: 'Design systems that can adapt to changing requirements' },
  4: { label: 'Interview Thinking', description: 'Master the interview thought process from start to finish' },
  5: { label: 'Pressure Test', description: 'Test your skills under real interview pressure' },
}

// ── Initial skill values by level ─────────────────────────────────────────────
function getInitialSkills(level: string): ISkills {
  if (level === 'oop') {
    return { oop: 50, solid: 15, patterns: 10, designThinking: 15, requirementAnalysis: 10, entityIdentification: 15, responsibilities: 20, relationships: 40, extensibility: 10, coupling: 15, cohesion: 15, communication: 10, tradeoffReasoning: 10, followupHandling: 10, designSpeed: 15 }
  }
  if (level === 'basic-lld') {
    return { oop: 65, solid: 40, patterns: 30, designThinking: 30, requirementAnalysis: 20, entityIdentification: 35, responsibilities: 35, relationships: 55, extensibility: 25, coupling: 30, cohesion: 30, communication: 20, tradeoffReasoning: 20, followupHandling: 20, designSpeed: 30 }
  }
  if (level === 'solving') {
    return { oop: 75, solid: 60, patterns: 55, designThinking: 50, requirementAnalysis: 40, entityIdentification: 55, responsibilities: 55, relationships: 65, extensibility: 45, coupling: 45, cohesion: 45, communication: 35, tradeoffReasoning: 35, followupHandling: 30, designSpeed: 50 }
  }
  // scratch
  return { oop: 10, solid: 10, patterns: 10, designThinking: 10, requirementAnalysis: 10, entityIdentification: 10, responsibilities: 10, relationships: 10, extensibility: 10, coupling: 10, cohesion: 10, communication: 10, tradeoffReasoning: 10, followupHandling: 10, designSpeed: 10 }
}

// ── Find weakest skill ─────────────────────────────────────────────────────────
const SKILL_KEYS: (keyof ISkills)[] = [
  'oop','solid','patterns','designThinking','requirementAnalysis',
  'entityIdentification','responsibilities','relationships','extensibility',
  'coupling','cohesion','communication','tradeoffReasoning','followupHandling','designSpeed',
]

function getWeakestSkill(skills: ISkills): { key: string; value: number } {
  let min = Infinity
  let key = 'requirementAnalysis'
  for (const k of SKILL_KEYS) {
    const v = (skills as unknown as Record<string, number>)[k] ?? 10
    if (v < min) { min = v; key = k }
  }
  return { key, value: min }
}

const SKILL_LABELS: Record<string, string> = {
  oop: 'OOP', solid: 'SOLID Principles', patterns: 'Design Patterns',
  designThinking: 'Design Thinking', requirementAnalysis: 'Requirement Analysis',
  entityIdentification: 'Entity Identification', responsibilities: 'Responsibility Assignment',
  relationships: 'Class Relationships', extensibility: 'Extensibility',
  coupling: 'Coupling', cohesion: 'Cohesion', communication: 'Communication',
  tradeoffReasoning: 'Trade-off Reasoning', followupHandling: 'Follow-up Handling',
  designSpeed: 'Design Speed',
}

// ── Compute recommendation ─────────────────────────────────────────────────────
async function computeRecommendation(profile: InstanceType<typeof JourneyProfile>) {
  const { key: weakSkill, value: weakValue } = getWeakestSkill(profile.skills as ISkills)
  const completed = new Set(profile.topicsCompleted)

  // Find first incomplete topic that builds this skill
  const topic = await JourneyTopic.findOne({
    buildsSkills: weakSkill,
    slug: { $nin: Array.from(completed) },
    status: 'published',
  }).sort({ stage: 1, order: 1 })

  if (!topic) {
    // Fall back: just find any incomplete topic
    const fallback = await JourneyTopic.findOne({
      slug: { $nin: Array.from(completed) },
      status: 'published',
    }).sort({ stage: 1, order: 1 })
    if (!fallback) return null
    return {
      topicSlug: fallback.slug,
      topicTitle: fallback.title,
      estimatedMinutes: fallback.estimatedMinutes,
      reason: `Continue your journey with this topic to build your skills.`,
    }
  }

  return {
    topicSlug: topic.slug,
    topicTitle: topic.title,
    estimatedMinutes: topic.estimatedMinutes,
    reason: `Your ${SKILL_LABELS[weakSkill] ?? weakSkill} score is ${weakValue}% — the lowest right now. This topic directly builds that skill.`,
  }
}

// ── Compute overall progress ───────────────────────────────────────────────────
async function computeProgress(profile: InstanceType<typeof JourneyProfile>) {
  const total = await JourneyTopic.countDocuments({ status: 'published' })
  const done  = profile.topicsCompleted.length
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────

/** POST /plannr/setup */
export async function setup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const { targetRole, preparationDays, currentLevel, planName } = req.body

    const initialSkills = getInitialSkills(currentLevel ?? 'scratch')

    // Find first topic for focus
    const firstTopic = await JourneyTopic.findOne({ status: 'published' }).sort({ stage: 1, order: 1 })

    // Deactivate any existing active plan
    await JourneyProfile.updateMany({ userId, isActive: true }, { $set: { isActive: false } })

    // Create a fresh active plan
    const profile = await JourneyProfile.create({
      userId,
      planName:           planName ?? 'My Plannr',
      isActive:           true,
      targetRole:         targetRole ?? 'general',
      preparationDays:    preparationDays ?? 30,
      currentLevel:       currentLevel ?? 'scratch',
      skills:             initialSkills,
      onboardingComplete: true,
      startDate:          new Date(),
      lastActiveDate:     new Date(),
      currentStage:       1,
      currentFocusSlug:   firstTopic?.slug ?? '',
      topicsCompleted:    [],
      topicsInProgress:   [],
    })

    res.status(201).json({ profile })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/profile */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    res.json({ profile: profile ?? null })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/dashboard */
export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (!profile) {
      res.json({ profile: null, onboarded: false })
      return
    }

    const [recommendation, progress, recentActivity] = await Promise.all([
      computeRecommendation(profile),
      computeProgress(profile),
      JourneyActivity.find({ userId: req.user!.id }).sort({ completedAt: -1 }).limit(5),
    ])

    res.json({
      profile,
      recommendation,
      recentActivity,
      completedCount:  progress.done,
      totalTopics:     progress.total,
      progressPercent: progress.percent,
      onboarded:       true,
    })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/roadmap */
export async function getRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    const topics  = await JourneyTopic.find({ status: 'published' }).sort({ stage: 1, order: 1 })

    const completedSet   = new Set(profile?.topicsCompleted ?? [])
    const inProgressSet  = new Set(profile?.topicsInProgress ?? [])
    const focusSlug      = profile?.currentFocusSlug ?? ''

    const stageMap: Record<number, object[]> = {}
    for (const topic of topics) {
      const s = topic.stage as number
      if (!stageMap[s]) stageMap[s] = []
      let userStatus = 'locked'
      if (completedSet.has(topic.slug))   userStatus = 'completed'
      else if (inProgressSet.has(topic.slug)) userStatus = 'in_progress'
      else if (topic.slug === focusSlug)  userStatus = 'recommended'

      stageMap[s].push({ ...topic.toObject(), userStatus })
    }

    const stages = Object.entries(stageMap).map(([s, topicList]) => {
      const n = Number(s)
      return {
        stage:       n,
        label:       STAGE_META[n]?.label ?? `Stage ${n}`,
        description: STAGE_META[n]?.description ?? '',
        topics:      topicList,
      }
    })

    res.json({ stages })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/topics/:slug */
export async function getTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topic = await JourneyTopic.findOne({ slug: req.params.slug })
    if (!topic) { res.status(404).json({ error: 'Topic not found' }); return }
    if (topic.status !== 'published') { res.status(403).json({ error: 'Topic not available' }); return }

    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    let userStatus = 'locked'
    if (profile?.topicsCompleted.includes(topic.slug))   userStatus = 'completed'
    else if (profile?.topicsInProgress.includes(topic.slug)) userStatus = 'in_progress'
    else if (profile?.currentFocusSlug === topic.slug)   userStatus = 'recommended'

    res.json({ topic: { ...topic.toObject(), userStatus } })
  } catch (err) {
    next(err)
  }
}

/** POST /journey/topics/:slug/complete */
export async function completeTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params
    const { performance = 'good' } = req.body
    const userId = req.user!.id

    const topic = await JourneyTopic.findOne({ slug, status: 'published' })
    if (!topic) { res.status(404).json({ error: 'Topic not found' }); return }

    const profile = await JourneyProfile.findOne({ userId, isActive: true })
    if (!profile) { res.status(400).json({ error: 'Journey not set up yet' }); return }

    // Skill gain by performance
    const gain = performance === 'excellent' ? 15 : performance === 'good' ? 10 : performance === 'fair' ? 5 : 3

    const skillUpdates: Partial<Record<keyof ISkills, number>> = {}
    for (const skillKey of (topic.buildsSkills ?? [])) {
      const current = (profile.skills as unknown as Record<string, number>)[skillKey] ?? 10
      skillUpdates[skillKey as keyof ISkills] = Math.min(100, current + gain)
    }

    // Move to completed
    const newCompleted   = Array.from(new Set([...profile.topicsCompleted, slug]))
    const newInProgress  = profile.topicsInProgress.filter(s => s !== slug)

    // Update stage
    const stageTopics    = await JourneyTopic.find({ stage: profile.currentStage, status: 'published' })
    const allDone        = stageTopics.every(t => newCompleted.includes(t.slug))
    const nextStage      = allDone ? Math.min(5, profile.currentStage + 1) : profile.currentStage

    // Find next focus
    const nextFocus = await JourneyTopic.findOne({
      slug: { $nin: newCompleted },
      status: 'published',
    }).sort({ stage: 1, order: 1 })

    const updatedProfile = await JourneyProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          topicsCompleted:  newCompleted,
          topicsInProgress: newInProgress,
          currentFocusSlug: nextFocus?.slug ?? '',
          currentStage:     nextStage,
          lastActiveDate:   new Date(),
          ...Object.fromEntries(
            Object.entries(skillUpdates).map(([k, v]) => [`skills.${k}`, v]),
          ),
        },
      },
      { new: true },
    )

    // Log activity
    await JourneyActivity.create({
      userId,
      topicSlug:      slug,
      activityType:   'read',
      performance,
      skillsImproved: topic.buildsSkills,
      completedAt:    new Date(),
    })

    const nextRec = updatedProfile ? await computeRecommendation(updatedProfile) : null

    res.json({ profile: updatedProfile, nextRecommendation: nextRec })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/recommendation */
export async function getRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (!profile) { res.json({ recommendation: null }); return }
    const rec = await computeRecommendation(profile)
    res.json({ recommendation: rec })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/experiences */
export async function listExperiences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const experiences = await JourneyExperience.find({ status: 'published' }).sort({ order: 1 })
    const profile     = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    const completed   = new Set(profile?.topicsCompleted ?? [])

    const enriched = experiences.map(exp => {
      const prereqs       = exp.prerequisiteTopics ?? []
      const donePrereqs   = prereqs.filter(s => completed.has(s)).length
      const userReadiness = prereqs.length > 0 ? Math.round((donePrereqs / prereqs.length) * 100) : 100
      return { ...exp.toObject(), userReadiness }
    })

    res.json({ experiences: enriched })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/experiences/:slug */
export async function getExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exp = await JourneyExperience.findOne({ slug: req.params.slug, status: 'published' })
    if (!exp) { res.status(404).json({ error: 'Experience not found' }); return }

    const profile   = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    const completed = new Set(profile?.topicsCompleted ?? [])
    const prereqs   = exp.prerequisiteTopics ?? []
    const donePrereqs = prereqs.filter(s => completed.has(s)).length
    const userReadiness = prereqs.length > 0 ? Math.round((donePrereqs / prereqs.length) * 100) : 100

    const prereqDetails = await JourneyTopic.find({ slug: { $in: prereqs } }).select('slug title icon stage')
    const prereqWithStatus = prereqDetails.map(t => ({
      slug: t.slug, title: t.title, icon: t.icon,
      completed: completed.has(t.slug),
    }))

    res.json({ experience: { ...exp.toObject(), userReadiness }, prereqDetails: prereqWithStatus })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/skills */
export async function getSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (!profile) { res.json({ skills: null }); return }

    // Use toObject() to get a plain JS object — Mongoose sub-documents have
    // internal properties ($parent, etc.) that pollute Object.entries() results
    const skills = profile.toObject().skills as ISkills
    const entries = SKILL_KEYS.map(k => [k, (skills as unknown as Record<string, number>)[k] ?? 10] as [keyof ISkills, number])
    const avg = entries.reduce((s, [, v]) => s + v, 0) / entries.length

    const [weakest] = [...entries].sort((a, b) => a[1] - b[1])
    const [strongest] = [...entries].sort((a, b) => b[1] - a[1])

    let readinessLevel = 'beginner'
    if (avg >= 80)      readinessLevel = 'interview-ready'
    else if (avg >= 60) readinessLevel = 'advanced'
    else if (avg >= 35) readinessLevel = 'intermediate'

    const grouped = {
      oop_skills: {
        label: 'OOP & Structure',
        skills: ['oop', 'relationships', 'entityIdentification', 'responsibilities'],
      },
      solid_skills: {
        label: 'SOLID & Design Quality',
        skills: ['solid', 'coupling', 'cohesion', 'extensibility'],
      },
      pattern_skills: {
        label: 'Design Patterns',
        skills: ['patterns', 'designThinking'],
      },
      interview_skills: {
        label: 'Interview Skills',
        skills: ['requirementAnalysis', 'communication', 'tradeoffReasoning', 'followupHandling', 'designSpeed'],
      },
    }

    const groupedWithValues = Object.fromEntries(
      Object.entries(grouped).map(([gKey, { label, skills: ks }]) => [
        gKey,
        {
          label,
          skills: ks.map(k => ({
            key:   k,
            label: SKILL_LABELS[k] ?? k,
            score: (skills as unknown as Record<string, number>)[k] ?? 10,
          })),
        },
      ]),
    )

    res.json({
      skills:         skills,
      skillLabels:    SKILL_LABELS,
      grouped:        groupedWithValues,
      overallScore:   Math.round(avg),
      weakestSkill:   { key: weakest[0], label: SKILL_LABELS[weakest[0]], score: weakest[1] },
      strongestSkill: { key: strongest[0], label: SKILL_LABELS[strongest[0]], score: strongest[1] },
      readinessLevel,
    })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/plan */
export async function getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (!profile) { res.json({ plan: [] }); return }

    const topics    = await JourneyTopic.find({ status: 'published' }).sort({ stage: 1, order: 1 })
    const completed = new Set(profile.topicsCompleted)
    const days      = profile.preparationDays
    const start     = profile.startDate ?? new Date()

    // Build a simple sequential plan: distribute topics across days (2-3 topics/day max)
    const remaining   = topics.filter(t => !completed.has(t.slug))
    const topicsPerDay = Math.max(1, Math.ceil(remaining.length / days))

    const plan = []
    const now  = new Date()

    for (let d = 0; d < days; d++) {
      const date    = new Date(start)
      date.setDate(start.getDate() + d)

      const dayTopics = remaining.slice(d * topicsPerDay, (d + 1) * topicsPerDay)
      const totalMin  = dayTopics.reduce((s, t) => s + t.estimatedMinutes, 0)

      const isToday   = date.toDateString() === now.toDateString()
      const isPast    = date < now && !isToday
      const status    = isPast ? 'done' : isToday ? 'today' : 'upcoming'

      plan.push({
        day:       d + 1,
        date:      date.toISOString().split('T')[0],
        status,
        focus:     dayTopics[0]?.title ?? 'Review & Practice',
        topics:    dayTopics.map(t => ({ slug: t.slug, title: t.title, estimatedMinutes: t.estimatedMinutes, type: t.type, icon: t.icon })),
        totalMinutes: totalMin,
      })
    }

    res.json({ plan, preparationDays: days, startDate: start })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/tips */
export async function getTips(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const all  = await JourneyTip.find({ status: 'published' }).sort({ moment: 1, order: 1 })
    const tips: Record<string, object[]> = { starting: [], designing: [], patterns: [], followups: [], explaining: [] }
    for (const tip of all) { tips[tip.moment]?.push(tip.toObject()) }
    res.json({ tips })
  } catch (err) {
    next(err)
  }
}

/** POST /plannr/activity */
export async function logActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicSlug, activityType, performance, skillsImproved, duration, metadata } = req.body
    const activity = await JourneyActivity.create({
      userId:        req.user!.id,
      topicSlug,
      activityType,
      performance,
      skillsImproved: skillsImproved ?? [],
      duration,
      metadata,
      completedAt:   new Date(),
    })
    res.status(201).json({ activity })
  } catch (err) {
    next(err)
  }
}

/** GET /plannr/plans — list all plans for the current user */
export async function listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const plans = await JourneyProfile.find({ userId }).sort({ createdAt: -1 })
    const total = await JourneyTopic.countDocuments({ status: 'published' })

    const summaries = plans.map(p => ({
      _id:             p._id,
      planName:        p.planName,
      isActive:        p.isActive,
      targetRole:      p.targetRole,
      currentLevel:    p.currentLevel,
      preparationDays: p.preparationDays,
      completedCount:  p.topicsCompleted.length,
      totalTopics:     total,
      progressPercent: total > 0 ? Math.round((p.topicsCompleted.length / total) * 100) : 0,
      currentStage:    p.currentStage,
      startDate:       p.startDate,
      createdAt:       (p as any).createdAt,
    }))

    res.json({ plans: summaries })
  } catch (err) {
    next(err)
  }
}

/** POST /plannr/plans — create a new plan (and switch to it) */
export async function createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const { planName, targetRole, preparationDays, currentLevel } = req.body

    const initialSkills = getInitialSkills(currentLevel ?? 'scratch')
    const firstTopic    = await JourneyTopic.findOne({ status: 'published' }).sort({ stage: 1, order: 1 })

    // Deactivate existing active plan
    await JourneyProfile.updateMany({ userId, isActive: true }, { $set: { isActive: false } })

    const profile = await JourneyProfile.create({
      userId,
      planName:           planName || 'New Plannr',
      isActive:           true,
      targetRole:         targetRole ?? 'general',
      preparationDays:    preparationDays ?? 30,
      currentLevel:       currentLevel ?? 'scratch',
      skills:             initialSkills,
      onboardingComplete: true,
      startDate:          new Date(),
      lastActiveDate:     new Date(),
      currentStage:       1,
      currentFocusSlug:   firstTopic?.slug ?? '',
      topicsCompleted:    [],
      topicsInProgress:   [],
    })

    res.status(201).json({ profile })
  } catch (err) {
    next(err)
  }
}

/** PATCH /plannr/plans/:id/switch — switch the active plan */
export async function switchPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId   = req.user!.id
    const planId   = req.params.id

    const target = await JourneyProfile.findOne({ _id: planId, userId })
    if (!target) { res.status(404).json({ error: 'Plan not found' }); return }

    // Deactivate all, then activate target
    await JourneyProfile.updateMany({ userId }, { $set: { isActive: false } })
    await JourneyProfile.updateOne({ _id: planId }, { $set: { isActive: true, lastActiveDate: new Date() } })

    res.json({ success: true, activePlanId: planId, planName: target.planName })
  } catch (err) {
    next(err)
  }
}

/** DELETE /plannr/plans/:id — delete a plan */
export async function deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const planId = req.params.id

    const plan = await JourneyProfile.findOne({ _id: planId, userId })
    if (!plan) { res.status(404).json({ error: 'Plan not found' }); return }

    await JourneyProfile.deleteOne({ _id: planId, userId })

    // If deleted plan was active, activate the most recent remaining plan
    if (plan.isActive) {
      const next = await JourneyProfile.findOne({ userId }).sort({ createdAt: -1 })
      if (next) await JourneyProfile.updateOne({ _id: next._id }, { $set: { isActive: true } })
    }

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
