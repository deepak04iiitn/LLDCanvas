import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { JourneyProfile, ISkills, IModuleTopicProgress } from '../../models/journey/journey-profile.model'
import { JourneyTopic, type IJourneyTopic } from '../../models/journey/journey-topic.model'
import { JourneyExperience } from '../../models/journey/journey-experience.model'
import { JourneyActivity } from '../../models/journey/journey-activity.model'
import { JourneyTip } from '../../models/journey/journey-tip.model'
import { PlannrPreviewVisit, type PreviewSource } from '../../models/journey/plannr-preview-visit.model'
import { QuizAttempt } from '../../models/learn/quiz-attempt.model'
import { ExperienceAttempt } from '../../models/journey/experience-attempt.model'
import { SpacedRepetitionQueue } from '../../models/spaced-repetition-queue.model'
import {
  STAGE_META,
  SKILL_LABELS,
  computeRecommendation,
  computeMasteryScore,
  defaultPracticeDifficulty,
  packDayPlan,
  pickVariantBody,
  startStageForLevel,
} from '../../services/plannr/plannrPersonalize'
import {
  applyEvidenceToProfile,
  buildSkillsView,
  checkEvidenceEvents,
  emptySkills,
  masteryEvidenceEvents,
  mockEvidenceEvents,
  pickPrioritySkill,
  practiceEvidenceEvents,
} from '../../services/plannr/skillEvidence'
import { getEffectiveWeights } from '../../services/plannr/trackConfig'

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
    const {
      targetRole,
      preparationDays,
      currentLevel,
      planName,
      focusAreas,
      dailyMinutes,
      interviewDate,
      diagnostic,
    } = req.body

    const level = currentLevel ?? diagnostic?.suggestedLevel ?? 'scratch'
    // Level places you on the roadmap only — skills always start at 0
    const stage = diagnostic?.suggestedStage ?? startStageForLevel(level)

    const firstTopic = await JourneyTopic.findOne({
      status: 'published',
      stage: { $gte: stage },
    }).sort({ stage: 1, order: 1 })

    await JourneyProfile.updateMany({ userId, isActive: true }, { $set: { isActive: false } })

    const safePlanName = (planName ?? 'My Plannr').trim() || 'My Plannr'
    const profile = await JourneyProfile.findOneAndUpdate(
      { userId, planName: safePlanName },
      {
        $set: {
          isActive: true,
          targetRole: targetRole ?? 'general',
          preparationDays: preparationDays ?? 30,
          currentLevel: level,
          focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
          dailyMinutes: typeof dailyMinutes === 'number' ? dailyMinutes : 45,
          interviewDate: interviewDate ? new Date(interviewDate) : undefined,
          diagnostic: diagnostic ?? undefined,
          skills: emptySkills(),
          skillEvidence: [],
          onboardingComplete: true,
          startDate: new Date(),
          lastActiveDate: new Date(),
          currentStage: stage,
          currentFocusSlug: firstTopic?.slug ?? '',
          topicsCompleted: [],
          topicsInProgress: [],
          revisionBookmarks: [],
          moduleProgress: {},
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

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

/**
 * PATCH /plannr/profile — update track / focus / pace without wiping skills or history.
 * Readiness recomputes from the new track's skill set.
 */
export async function updateActiveProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const {
      targetRole,
      focusAreas,
      preparationDays,
      dailyMinutes,
      interviewDate,
      planName,
      currentLevel,
    } = req.body

    const profile = await JourneyProfile.findOne({ userId, isActive: true })
    if (!profile) {
      res.status(404).json({ error: 'No active plan' })
      return
    }

    const $set: Record<string, unknown> = { lastActiveDate: new Date() }
    if (typeof targetRole === 'string') $set.targetRole = targetRole
    if (Array.isArray(focusAreas)) $set.focusAreas = focusAreas
    if (typeof preparationDays === 'number') $set.preparationDays = preparationDays
    if (typeof dailyMinutes === 'number') $set.dailyMinutes = dailyMinutes
    if (interviewDate !== undefined) {
      $set.interviewDate = interviewDate ? new Date(interviewDate) : undefined
    }
    if (typeof planName === 'string' && planName.trim()) $set.planName = planName.trim()
    // Level only adjusts placement stage if user hasn't progressed past it
    if (typeof currentLevel === 'string') {
      $set.currentLevel = currentLevel
      const placed = startStageForLevel(currentLevel)
      if ((profile.currentStage ?? 1) < placed) $set.currentStage = placed
    }

    const updated = await JourneyProfile.findOneAndUpdate(
      { _id: profile._id },
      { $set },
      { new: true },
    )

    res.json({ profile: updated })
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

    const completedSet = new Set(profile?.topicsCompleted ?? [])
    const inProgressSet = new Set(profile?.topicsInProgress ?? [])
    const focusSlug = profile?.currentFocusSlug ?? ''
    const userStage = profile?.currentStage ?? 1
    const progressMap = (profile?.moduleProgress as unknown as Map<string, IModuleTopicProgress>) ?? new Map()

    const role = profile?.targetRole ?? 'general'
    const focusAreas = profile?.focusAreas ?? []
    const { skillKeys: trackSkills } = getEffectiveWeights(role, focusAreas)
    const trackSet = new Set(trackSkills)

    const stageMap: Record<number, object[]> = {}
    for (const topic of topics) {
      const s = topic.stage as number
      if (!stageMap[s]) stageMap[s] = []
      let userStatus = 'locked'
      if (completedSet.has(topic.slug)) userStatus = 'completed'
      else if (inProgressSet.has(topic.slug)) userStatus = 'in_progress'
      else if (topic.slug === focusSlug) userStatus = 'recommended'
      else if (s <= userStage) userStatus = 'available'

      const mp =
        progressMap instanceof Map
          ? progressMap.get(topic.slug)
          : (progressMap as Record<string, IModuleTopicProgress>)?.[topic.slug]

      const builds = topic.buildsSkills ?? []
      const onTrack = builds.length === 0 || builds.some(k => trackSet.has(k))
      const roles = topic.recommendedRoles ?? []
      const roleFit = !roles.length || roles.includes(role) || roles.includes('general')

      stageMap[s].push({
        ...topic.toObject(),
        userStatus,
        masteryScore: mp?.masteryScore ?? (completedSet.has(topic.slug) ? 100 : 0),
        trackPriority: onTrack && roleFit ? 'primary' : 'optional',
      })
    }

    // Within each stage: primary track topics first
    for (const s of Object.keys(stageMap)) {
      stageMap[Number(s)].sort((a: any, b: any) => {
        const pa = a.trackPriority === 'primary' ? 0 : 1
        const pb = b.trackPriority === 'primary' ? 0 : 1
        if (pa !== pb) return pa - pb
        return (a.order ?? 0) - (b.order ?? 0)
      })
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

    const role = profile?.targetRole ?? 'general'
    const raw = topic.toObject()
    const modules = (raw.modules ?? []).map((b: { variants?: { role: string; body: string }[]; body?: string }) => ({
      ...b,
      body: pickVariantBody(b.variants, b.body, role) || b.body,
    }))

    const mpRaw = profile?.moduleProgress
    const mp =
      mpRaw instanceof Map
        ? mpRaw.get(topic.slug)
        : (mpRaw as Record<string, IModuleTopicProgress> | undefined)?.[topic.slug]

    // Mark in progress
    if (profile && !profile.topicsCompleted.includes(topic.slug) && !profile.topicsInProgress.includes(topic.slug)) {
      await JourneyProfile.updateOne(
        { _id: profile._id },
        {
          $addToSet: { topicsInProgress: topic.slug },
          $set: { lastActiveDate: new Date(), currentFocusSlug: topic.slug },
        },
      )
    }

    res.json({
      topic: {
        ...raw,
        modules,
        userStatus,
        linkedStudioPack: topic.linkedStudioPack,
        linkedLearnExercise: topic.linkedLearnExercise,
        externalPractice: topic.externalPractice ?? {
          blurb: 'Want more volume practice?',
          studioPacks: topic.linkedStudioPack ? [topic.linkedStudioPack] : [],
          learnSlugs: topic.linkedLearnExercise ? [topic.linkedLearnExercise] : [],
        },
      },
      progress: mp ?? {
        completedBlockIds: [],
        practiceSolvedIds: [],
        checkScores: {},
        masteryScore: 0,
      },
      practiceDifficultyDefault: profile ? defaultPracticeDifficulty(profile) : 'easy',
      bookmarked: profile?.revisionBookmarks?.includes(topic.slug) ?? false,
    })
  } catch (err) {
    next(err)
  }
}

/** POST /plannr/topics/:slug/bookmark — toggle mark-for-revision */
export async function toggleRevisionBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug)
    const userId = req.user!.id

    const topic = await JourneyTopic.findOne({ slug, status: 'published' })
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' })
      return
    }

    const profile = await JourneyProfile.findOne({ userId, isActive: true })
    if (!profile) {
      res.status(400).json({ error: 'Journey not set up yet' })
      return
    }

    const bookmarks = new Set(profile.revisionBookmarks ?? [])
    const wasBookmarked = bookmarks.has(slug)
    if (wasBookmarked) bookmarks.delete(slug)
    else bookmarks.add(slug)

    await JourneyProfile.updateOne(
      { _id: profile._id },
      {
        $set: {
          revisionBookmarks: Array.from(bookmarks),
          lastActiveDate: new Date(),
        },
      },
    )

    res.json({ bookmarked: !wasBookmarked, slug })
  } catch (err) {
    next(err)
  }
}

/** POST /journey/topics/:slug/complete */
export async function completeTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug)
    const { performance = 'good', exerciseScore, exerciseType: submittedExerciseType } = req.body
    const userId = req.user!.id

    const topic = await JourneyTopic.findOne({ slug, status: 'published' })
    if (!topic) { res.status(404).json({ error: 'Topic not found' }); return }

    const profile = await JourneyProfile.findOne({ userId, isActive: true })
    if (!profile) { res.status(400).json({ error: 'Journey not set up yet' }); return }

    // Evidence-gated completion: require meaningful mastery before skill gains
    const mp = getModuleProgress(profile, slug)
    const hasPractice = (topic.practiceSet ?? []).length > 0
    const practicedEnough = !hasPractice || (mp.practiceSolvedIds?.length ?? 0) > 0
    const masteryScore =
      typeof exerciseScore === 'number' ? exerciseScore : (mp.masteryScore ?? 0)
    const gate = Math.max(60, topic.masteryThreshold ?? 60)

    if (masteryScore < gate || !practicedEnough) {
      res.status(400).json({
        error: `Complete practice and reach at least ${gate}% mastery before finishing this topic.`,
        masteryScore,
        practicedEnough,
        gate,
      })
      return
    }

    const evidenceEvents = masteryEvidenceEvents(
      topic.buildsSkills ?? [],
      masteryScore,
      topic.title,
      slug,
    )
    const { skills, evidence } = applyEvidenceToProfile(profile, evidenceEvents)

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
      { _id: profile._id },
      {
        $set: {
          topicsCompleted:  newCompleted,
          topicsInProgress: newInProgress,
          currentFocusSlug: nextFocus?.slug ?? '',
          currentStage:     nextStage,
          lastActiveDate:   new Date(),
          skills,
          skillEvidence: evidence,
          [`moduleProgress.${slug}.completedAt`]: new Date(),
          [`moduleProgress.${slug}.masteryScore`]: masteryScore,
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

    const view = buildSkillsView(profile)
    const skills = profile.toObject().skills as ISkills

    res.json({
      skills,
      skillLabels:    SKILL_LABELS,
      track:          view.track,
      skillItems:     view.skills,
      grouped:        view.grouped,
      overallScore:   view.overallScore,
      weakestSkill:   view.weakestSkill ?? { key: 'oop', label: 'OOP', score: 0, assessed: false },
      strongestSkill: view.strongestSkill ?? { key: 'oop', label: 'OOP', score: 0, assessed: false },
      readinessLevel: view.readinessLevel,
      howToImprove:   view.howToImprove,
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

    const topics = await JourneyTopic.find({ status: 'published' }).sort({ stage: 1, order: 1 })
    const plan = packDayPlan(topics as unknown as IJourneyTopic[], profile)
    const start = profile.startDate ?? new Date()

    res.json({ plan, preparationDays: profile.preparationDays, startDate: start })
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

/**
 * POST /plannr/preview-visit
 * Record that a Free/Pro user is viewing Plannr preview / try access.
 * Ultimate users are ignored (they have full access, not preview).
 */
export async function trackPreviewVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const plan = req.user!.plan
    if (plan !== 'free' && plan !== 'pro') {
      res.json({ tracked: false, reason: 'full_access' })
      return
    }

    const rawSource = String(req.body?.source ?? 'hub')
    const source: PreviewSource =
      rawSource === 'setup' || rawSource === 'generate' || rawSource === 'hub'
        ? rawSource
        : 'hub'
    const now = new Date()

    const existing = await PlannrPreviewVisit.findOne({ userId })
    if (!existing) {
      await PlannrPreviewVisit.create({
        userId,
        userPlan: plan,
        firstViewedAt: now,
        lastViewedAt: now,
        visitCount: 1,
        sources: [source],
      })
      res.status(201).json({ tracked: true, isNew: true })
      return
    }

    // Dedupe bursts: only bump visitCount if last view was > 30 minutes ago
    const THIRTY_MIN = 30 * 60 * 1000
    const bumpCount = now.getTime() - existing.lastViewedAt.getTime() > THIRTY_MIN
    const sources = existing.sources.includes(source)
      ? existing.sources
      : [...existing.sources, source]

    existing.userPlan = plan
    existing.lastViewedAt = now
    existing.sources = sources
    if (bumpCount) existing.visitCount += 1
    await existing.save()

    res.json({ tracked: true, isNew: false })
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

    const level = currentLevel ?? 'scratch'
    const stage = startStageForLevel(level)
    const firstTopic = await JourneyTopic.findOne({
      status: 'published',
      stage: { $gte: stage },
    }).sort({ stage: 1, order: 1 })

    // Deactivate existing active plan
    await JourneyProfile.updateMany({ userId, isActive: true }, { $set: { isActive: false } })

    // Upsert by userId+planName so duplicate submissions are idempotent
    const safePlanName = (planName || 'New Plannr').trim() || 'New Plannr'
    const profile = await JourneyProfile.findOneAndUpdate(
      { userId, planName: safePlanName },
      {
        $set: {
          isActive:           true,
          targetRole:         targetRole ?? 'general',
          preparationDays:    preparationDays ?? 30,
          currentLevel:       level,
          skills:             emptySkills(),
          skillEvidence:      [],
          onboardingComplete: true,
          startDate:          new Date(),
          lastActiveDate:     new Date(),
          currentStage:       stage,
          currentFocusSlug:   firstTopic?.slug ?? '',
          topicsCompleted:    [],
          topicsInProgress:   [],
          revisionBookmarks:  [],
          moduleProgress:     {},
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

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

/** POST /plannr/experiences/:slug/attempt */
export async function submitExperienceAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug)
    const { probeAnswers, classesDrawn } = req.body
    const userId = req.user!.id

    // Score: classesDrawn → 40% (max 5 classes = full 40pts), probeAnswers → 60%
    const designScore = Math.min(40, ((classesDrawn ?? 0) / 5) * 40)
    const probeScore = Array.isArray(probeAnswers) && probeAnswers.length > 0
      ? (probeAnswers.filter((a: { probe: string; answer: string }) => a.answer && a.answer.length > 20).length / probeAnswers.length) * 60
      : 30
    const score = Math.round(designScore + probeScore)

    const attempt = await ExperienceAttempt.create({
      userId,
      experienceSlug: slug,
      probeAnswers:   probeAnswers ?? [],
      classesDrawn:   classesDrawn ?? 0,
      score,
    })

    // Evidence-based skill gains from mock score
    const experience = await JourneyExperience.findOne({ slug })
    const skillsToUpdate =
      experience?.skillBars?.map((s: { skill: string; weight: number }) => s.skill) ??
      ['communication', 'designThinking']
    const profile = await JourneyProfile.findOne({ userId, isActive: true })
    if (profile && score > 0) {
      const events = mockEvidenceEvents(
        skillsToUpdate,
        score,
        experience?.title ?? slug,
      )
      const { skills, evidence } = applyEvidenceToProfile(profile, events)
      await JourneyProfile.updateOne(
        { _id: profile._id },
        { $set: { skills, skillEvidence: evidence, lastActiveDate: new Date() } },
      )
    }

    res.json({ score, attempt: attempt.id, skillsImproved: skillsToUpdate })
  } catch (err) {
    next(err)
  }
}

// ── Readiness label helper ────────────────────────────────────────────────────
function readinessLabel(avg: number): string {
  if (avg >= 80) return 'Expert'
  if (avg >= 65) return 'Interview Ready'
  if (avg >= 50) return 'Competent'
  if (avg >= 30) return 'Developing'
  return 'Beginner'
}

/** GET /journey/skills/page — unified skills page data */
export async function getSkillsPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (!profile) { res.json({ skills: null }); return }

    const view = buildSkillsView(profile)
    const skills = profile.toObject().skills as ISkills
    const assessed = view.skills.filter(s => s.assessed)
    const sorted = [...assessed].sort((a, b) => b.score - a.score)
    const topSkills = sorted.slice(0, 3).map(e => ({ key: e.key, label: e.label, score: e.score }))
    const weakSkills = [...sorted].reverse().slice(0, 3).map(e => ({ key: e.key, label: e.label, score: e.score }))
    const avg = view.overallScore ?? 0

    res.json({
      skills,
      track: view.track,
      interviewReadiness: avg,
      readinessLabel: view.readinessLevel === 'not-started' ? 'Not started' : readinessLabel(avg),
      topSkills,
      weakSkills,
      howToImprove: view.howToImprove,
      breakdown: {
        skillAverage: avg,
        totalTopicsCompleted: profile.topicsCompleted.length,
        stageReached: profile.currentStage,
        assessedCount: assessed.length,
        trackSkillCount: view.skills.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

/** GET /journey/spaced-repetition — items due for review */
export async function getSpacedRepetition(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const items  = await SpacedRepetitionQueue
      .find({ userId, isActive: true, dueDate: { $lte: new Date() } })
      .sort({ dueDate: 1 })
      .limit(10)
    res.json({ items, count: items.length })
  } catch (err) {
    next(err)
  }
}

/** PATCH /journey/spaced-repetition/:id/dismiss — mark item reviewed */
export async function dismissSpacedRepetitionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await SpacedRepetitionQueue.findByIdAndUpdate(req.params.id, {
      isActive:       false,
      lastReviewedAt: new Date(),
      $inc:           { reviewCount: 1 },
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

/** GET /plannr/daily-practice */
export async function getDailyPractice(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const profile = await JourneyProfile.findOne({ userId, isActive: true })
    const dateKey = new Date().toISOString().slice(0, 10)

    // 1. Quiz status: check if user completed today's quiz
    const quizAttempt = await QuizAttempt.findOne({ userId, dateKey })
    const quizDone = !!quizAttempt

    // 2. Studio challenge recommendation: pick a challenge targeting priority track skill
    let studioChallenge = null
    if (profile) {
      const priority = pickPrioritySkill(profile)
      const skillToMode: Record<string, string> = {
        coupling: 'debugger', cohesion: 'refactor', solid: 'debugger',
        patterns: 'refactor', extensibility: 'change_one', designThinking: 'change_one',
        tradeoffReasoning: 'evolution', requirementAnalysis: 'evolution',
        responsibilities: 'refactor', relationships: 'refactor',
      }
      const mode = skillToMode[priority.key] ?? 'debugger'
      const ChallengePack = mongoose.model('ChallengePack')
      const pack = await ChallengePack.findOne({ type: mode, status: 'published' }).sort({ order: 1 }).lean()
      if (pack) {
        const why = priority.assessed
          ? `targets ${priority.key} (currently ${priority.value})`
          : `builds ${priority.key} — not assessed yet`
        studioChallenge = {
          mode,
          slug: (pack as any).slug,
          title: (pack as any).title,
          reason: why,
          difficulty: (pack as any).difficulty,
        }
      }
    }

    // 3. Roguelike quick run CTA
    const quickRunCTA = { label: 'Quick Run', description: '3 stages · ~10 minutes', href: '/learn/roguelike?mode=quick' }

    // 4. Plannr topic recommendation (from existing recommendation logic)
    let plannrTopic = null
    if (profile) {
      const rec = await computeRecommendation(profile)
      if (rec) plannrTopic = { slug: rec.topicSlug, title: rec.topicTitle, reason: rec.reason }
    }

    // Estimate time: 5min quiz + 20min studio + 10min roguelike + 15min plannr
    const estimatedMinutes = (quizDone ? 0 : 5) + (studioChallenge ? 20 : 0) + 10 + (plannrTopic ? 15 : 0)

    res.json({
      date: dateKey,
      quiz: { done: quizDone, streak: 0 }, // streak is computed elsewhere
      studioChallenge,
      quickRun: quickRunCTA,
      plannrTopic,
      estimatedMinutes,
    })
  } catch(e) { next(e) }
}

function normalizeCheckScores(raw: unknown): Record<string, number> {
  if (!raw) return {}
  if (raw instanceof Map) return Object.fromEntries(raw.entries()) as Record<string, number>
  return { ...(raw as Record<string, number>) }
}

function getModuleProgress(
  profile: InstanceType<typeof JourneyProfile>,
  slug: string,
): IModuleTopicProgress {
  const empty: IModuleTopicProgress = {
    completedBlockIds: [],
    practiceSolvedIds: [],
    checkScores: {},
    masteryScore: 0,
  }
  const mp = profile.moduleProgress as unknown
  const rec =
    mp instanceof Map
      ? mp.get(slug)
      : (mp as Record<string, IModuleTopicProgress> | undefined)?.[slug]
  if (!rec) return empty
  return {
    ...rec,
    completedBlockIds: rec.completedBlockIds ?? [],
    practiceSolvedIds: rec.practiceSolvedIds ?? [],
    checkScores: normalizeCheckScores(rec.checkScores),
    masteryScore: rec.masteryScore ?? 0,
  }
}

/** POST /plannr/topics/:slug/progress — save block / practice progress */
export async function saveTopicProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug)
    const { completedBlockIds, practiceSolvedIds, checkScores } = req.body as {
      completedBlockIds?: string[]
      practiceSolvedIds?: string[]
      checkScores?: Record<string, number>
    }

    const topic = await JourneyTopic.findOne({ slug, status: 'published' })
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' })
      return
    }

    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (!profile) {
      res.status(400).json({ error: 'Journey not set up yet' })
      return
    }

    const prev = getModuleProgress(profile, slug)
    const nextBlocks = Array.from(new Set([...(prev.completedBlockIds ?? []), ...(completedBlockIds ?? [])]))
    const nextPractice = Array.from(new Set([...(prev.practiceSolvedIds ?? []), ...(practiceSolvedIds ?? [])]))
    const nextChecks: Record<string, number> = { ...(prev.checkScores ?? {}), ...(checkScores ?? {}) }
    const checkVals = Object.values(nextChecks) as number[]
    const avgCheck = checkVals.length ? checkVals.reduce((a, b) => a + b, 0) / checkVals.length : 0

    const masteryScore = computeMasteryScore({
      completedBlocks: nextBlocks.length,
      totalBlocks: (topic.modules ?? []).length || 1,
      solvedPractice: nextPractice.length,
      totalPractice: (topic.practiceSet ?? []).length || 1,
      avgCheckScore: avgCheck,
    })

    const progress: IModuleTopicProgress = {
      completedBlockIds: nextBlocks,
      practiceSolvedIds: nextPractice,
      checkScores: nextChecks,
      masteryScore,
      lastVisitedAt: new Date(),
      completedAt: prev.completedAt,
    }

    await JourneyProfile.updateOne(
      { _id: profile._id },
      {
        $set: {
          [`moduleProgress.${slug}`]: progress,
          lastActiveDate: new Date(),
          currentFocusSlug: slug,
        },
        $addToSet: { topicsInProgress: slug },
      },
    )

    res.json({ progress })
  } catch (err) {
    next(err)
  }
}

/** POST /plannr/topics/:slug/practice/:itemId/submit — grade native practice */
export async function submitPracticeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug)
    const itemId = String(req.params.itemId)
    const { selectedOptionIds, selectedElementIds, selfScore } = req.body as {
      selectedOptionIds?: string[]
      selectedElementIds?: string[]
      selfScore?: number
    }

    const topic = await JourneyTopic.findOne({ slug, status: 'published' })
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' })
      return
    }

    const item = (topic.practiceSet ?? []).find(p => p.id === itemId)
    if (!item) {
      res.status(404).json({ error: 'Practice item not found' })
      return
    }

    const check = item.checks
    let correct = false
    let score = 0
    let feedback = item.solution.explanation

    if (!check || check.type === 'short') {
      score = typeof selfScore === 'number' ? Math.max(0, Math.min(100, selfScore)) : 70
      correct = score >= 60
      feedback = check?.modelAnswer
        ? `${feedback}\n\nModel answer:\n${check.modelAnswer}`
        : feedback
    } else if (check.type === 'mcq' || check.type === 'multi') {
      const correctIds = new Set((check.options ?? []).filter(o => o.correct).map(o => o.id))
      const picked = new Set(selectedOptionIds ?? [])
      correct =
        correctIds.size === picked.size && [...correctIds].every(id => picked.has(id))
      score = correct ? 100 : 0
      feedback = check.explanation ?? feedback
    } else if (check.type === 'diagram_mark') {
      const expected = new Set(check.expectedElementIds ?? [])
      const picked = new Set(selectedElementIds ?? [])
      const hit = [...expected].filter(id => picked.has(id)).length
      score = expected.size ? Math.round((hit / expected.size) * 100) : 0
      correct = score >= 70
      feedback = check.explanation ?? feedback
    }

    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (profile && correct) {
      const prev = getModuleProgress(profile, slug)
      const alreadySolved = (prev.practiceSolvedIds ?? []).includes(itemId)
      const practiceSolvedIds = Array.from(new Set([...(prev.practiceSolvedIds ?? []), itemId]))
      const checkScores: Record<string, number> = { ...(prev.checkScores ?? {}), [itemId]: score }
      const scoreVals = Object.values(checkScores) as number[]
      const masteryScore = computeMasteryScore({
        completedBlocks: prev.completedBlockIds?.length ?? 0,
        totalBlocks: (topic.modules ?? []).length || 1,
        solvedPractice: practiceSolvedIds.length,
        totalPractice: (topic.practiceSet ?? []).length || 1,
        avgCheckScore:
          scoreVals.reduce((a, b) => a + b, 0) / Math.max(1, scoreVals.length),
      })

      // Cap practice evidence: max ~6 pts per topic from practice (3 items × 2)
      const builds = (item.buildsSkills?.length ? item.buildsSkills : topic.buildsSkills) ?? []
      const practiceEvidenceCount = (profile.skillEvidence ?? []).filter(
        e => e.source === 'practice' && e.topicSlug === slug,
      ).length
      let skills = profile.skills
      let evidence = profile.skillEvidence ?? []
      if (!alreadySolved && practiceEvidenceCount < 3 && builds.length) {
        const quality = score >= 90 ? 'strong' : score >= 70 ? 'good' : 'ok'
        const events = practiceEvidenceEvents(builds, topic.title, slug, quality)
        const applied = applyEvidenceToProfile(profile, events)
        skills = applied.skills
        evidence = applied.evidence
      }

      await JourneyProfile.updateOne(
        { _id: profile._id },
        {
          $set: {
            [`moduleProgress.${slug}`]: {
              ...prev,
              practiceSolvedIds,
              checkScores,
              masteryScore,
              lastVisitedAt: new Date(),
            },
            skills,
            skillEvidence: evidence,
            lastActiveDate: new Date(),
          },
        },
      )
      await JourneyActivity.create({
        userId: req.user!.id,
        topicSlug: slug,
        activityType: 'practice',
        performance: correct ? 'good' : 'fair',
        skillsImproved: builds,
        completedAt: new Date(),
        metadata: { itemId, score },
      })
    }

    res.json({
      correct,
      score,
      feedback,
      solution: item.solution,
      commonMistakes: item.commonMistakes,
      hints: item.hints,
    })
  } catch (err) {
    next(err)
  }
}

/** POST /plannr/topics/:slug/checks/:checkId/submit — grade knowledge check */
export async function submitKnowledgeCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params.slug)
    const checkId = String(req.params.checkId)
    const { selectedOptionIds, selfScore } = req.body as {
      selectedOptionIds?: string[]
      selfScore?: number
    }

    const topic = await JourneyTopic.findOne({ slug, status: 'published' })
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' })
      return
    }

    let found: { type: string; options?: { id: string; correct?: boolean }[]; explanation?: string; modelAnswer?: string } | null =
      null
    for (const block of topic.modules ?? []) {
      const c = (block.checks ?? []).find(x => x.id === checkId)
      if (c) {
        found = c
        break
      }
    }
    if (!found) {
      res.status(404).json({ error: 'Check not found' })
      return
    }

    let correct = false
    let score = 0
    if (found.type === 'short') {
      score = typeof selfScore === 'number' ? Math.max(0, Math.min(100, selfScore)) : 70
      correct = score >= 60
    } else {
      const correctIds = new Set((found.options ?? []).filter(o => o.correct).map(o => o.id))
      const picked = new Set(selectedOptionIds ?? [])
      correct = correctIds.size === picked.size && [...correctIds].every(id => picked.has(id))
      score = correct ? 100 : 0
    }

    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    if (profile) {
      const prev = getModuleProgress(profile, slug)
      const alreadyChecked = typeof prev.checkScores?.[checkId] === 'number'
      const checkScores = { ...(prev.checkScores ?? {}), [checkId]: score }

      let skills = profile.skills
      let evidence = profile.skillEvidence ?? []
      if (!alreadyChecked && score >= 50) {
        const events = checkEvidenceEvents(
          topic.buildsSkills ?? [],
          score,
          topic.title,
          slug,
        )
        if (events.length) {
          const applied = applyEvidenceToProfile(profile, events)
          skills = applied.skills
          evidence = applied.evidence
        }
      }

      await JourneyProfile.updateOne(
        { _id: profile._id },
        {
          $set: {
            [`moduleProgress.${slug}.checkScores`]: checkScores,
            [`moduleProgress.${slug}.lastVisitedAt`]: new Date(),
            skills,
            skillEvidence: evidence,
            lastActiveDate: new Date(),
          },
        },
      )
    }

    res.json({
      correct,
      score,
      explanation: found.explanation,
      modelAnswer: found.modelAnswer,
    })
  } catch (err) {
    next(err)
  }
}

/** GET /plannr/revise — cheat sheets + track-aware focus skills for revision */
export async function getRevisePack(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    const completed = new Set(profile?.topicsCompleted ?? [])
    const topics = await JourneyTopic.find({ status: 'published' }).sort({ stage: 1, order: 1 })

    const role = profile?.targetRole ?? 'general'
    const focusAreas = profile?.focusAreas ?? []
    const { skillKeys: trackSkills, label: trackLabel } = getEffectiveWeights(role, focusAreas)
    const trackSet = new Set(trackSkills)

    const sheets = topics
      .filter(t => completed.has(t.slug) || (t.cheatSheet ?? []).length > 0)
      .map(t => {
        const builds = t.buildsSkills ?? []
        const onTrack = builds.length === 0 || builds.some(k => trackSet.has(k))
        return {
          slug: t.slug,
          title: t.title,
          stage: t.stage,
          cheatSheet: t.cheatSheet ?? [],
          takeaways: t.takeaways ?? [],
          interviewBank: t.interviewBank ?? [],
          completed: completed.has(t.slug),
          buildsSkills: builds,
          trackPriority: onTrack ? ('primary' as const) : ('optional' as const),
        }
      })
      .sort((a, b) => {
        const pa = a.trackPriority === 'primary' ? 0 : 1
        const pb = b.trackPriority === 'primary' ? 0 : 1
        if (pa !== pb) return pa - pb
        if (a.completed !== b.completed) return a.completed ? -1 : 1
        return a.stage - b.stage
      })

    const view = profile ? buildSkillsView(profile) : null
    const priority = profile ? pickPrioritySkill(profile) : null
    const bookmarkSet = new Set(profile?.revisionBookmarks ?? [])

    const bookmarkedTopics = topics
      .filter(t => bookmarkSet.has(t.slug))
      .map(t => ({
        slug: t.slug,
        title: t.title,
        stage: t.stage,
        estimatedMinutes: t.estimatedMinutes,
        completed: completed.has(t.slug),
        hasCheatSheet: (t.cheatSheet ?? []).length > 0,
      }))

    // Suggest topics to learn (incomplete) + packs to revise (completed) for the focus skill
    const focusKey = priority?.key
    const learnTopics = focusKey
      ? topics
          .filter(t => (t.buildsSkills ?? []).includes(focusKey) && !completed.has(t.slug))
          .slice(0, 5)
          .map(t => ({
            slug: t.slug,
            title: t.title,
            stage: t.stage,
            estimatedMinutes: t.estimatedMinutes,
            kind: 'learn' as const,
          }))
      : []
    const reviseTopics = focusKey
      ? topics
          .filter(t => (t.buildsSkills ?? []).includes(focusKey) && completed.has(t.slug))
          .slice(0, 5)
          .map(t => ({
            slug: t.slug,
            title: t.title,
            stage: t.stage,
            estimatedMinutes: t.estimatedMinutes,
            kind: 'revise' as const,
          }))
      : []

    const focusTopics = [...reviseTopics, ...learnTopics].slice(0, 6)

    // Top focus skills for this track: unassessed first, then lowest assessed
    const focusSkills = view
      ? [...view.skills]
          .sort((a, b) => {
            if (a.assessed !== b.assessed) return a.assessed ? 1 : -1
            return a.score - b.score
          })
          .slice(0, 3)
          .map(s => ({
            key: s.key,
            label: s.label,
            score: s.score,
            assessed: s.assessed,
            recentReasons: s.recentReasons.slice(0, 2),
          }))
      : []

    res.json({
      sheets,
      track: { role, label: trackLabel },
      howToImprove: view?.howToImprove ?? null,
      focusSkills,
      bookmarkedTopics,
      // Back-compat for older clients
      weakSkill: priority
        ? {
            key: priority.key,
            label: SKILL_LABELS[priority.key] ?? priority.key,
            value: priority.value,
            assessed: priority.assessed,
          }
        : null,
      weakTopics: focusTopics,
      stageMeta: STAGE_META,
    })
  } catch (err) {
    next(err)
  }
}

/** GET /plannr/practice — all practice items for user’s path */
export async function listPracticeHub(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await JourneyProfile.findOne({ userId: req.user!.id, isActive: true })
    const topics = await JourneyTopic.find({ status: 'published' }).sort({ stage: 1, order: 1 })
    const completed = new Set(profile?.topicsCompleted ?? [])
    const defaultDiff = profile ? defaultPracticeDifficulty(profile) : 'easy'

    const items = topics.flatMap(t =>
      (t.practiceSet ?? []).map(p => {
        const plain = typeof (p as unknown as { toObject?: () => object }).toObject === 'function'
          ? (p as unknown as { toObject: () => object }).toObject()
          : p
        return {
          topicSlug: t.slug,
          topicTitle: t.title,
          stage: t.stage,
          ...plain,
          topicCompleted: completed.has(t.slug),
          solved:
            profile != null &&
            getModuleProgress(profile, t.slug).practiceSolvedIds?.includes(p.id),
        }
      }),
    )

    res.json({ items, defaultDifficulty: defaultDiff })
  } catch (err) {
    next(err)
  }
}

/** GET /plannr/diagnostic — onboarding diagnostic questions (DB-free static bank for now) */
export async function getDiagnostic(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json({
      questions: DIAGNOSTIC_QUESTIONS,
    })
  } catch (err) {
    next(err)
  }
}

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'd1',
    prompt: 'A ShoppingCart class extends User so it can “belong” to a shopper. What’s wrong?',
    options: [
      { id: 'a', label: 'Nothing — inheritance models ownership well', correct: false },
      { id: 'b', label: 'Cart is-a User is false; prefer association/composition', correct: true },
      { id: 'c', label: 'User should extend Cart instead', correct: false },
    ],
  },
  {
    id: 'd2',
    prompt: 'Open/Closed Principle mainly says you should…',
    options: [
      { id: 'a', label: 'Never change any file after launch', correct: false },
      { id: 'b', label: 'Extend behavior via new code, not endless edits to existing classes', correct: true },
      { id: 'c', label: 'Keep all methods public', correct: false },
    ],
  },
  {
    id: 'd3',
    prompt: 'Strategy pattern is a good fit when…',
    options: [
      { id: 'a', label: 'You have one algorithm forever', correct: false },
      { id: 'b', label: 'You need to swap interchangeable behaviors at runtime', correct: true },
      { id: 'c', label: 'You only need inheritance', correct: false },
    ],
  },
  {
    id: 'd4',
    prompt: 'High coupling between OrderService and StripeClient usually means…',
    options: [
      { id: 'a', label: 'Faster compiles', correct: false },
      { id: 'b', label: 'Harder to swap payment providers without rewriting OrderService', correct: true },
      { id: 'c', label: 'Better encapsulation', correct: false },
    ],
  },
  {
    id: 'd5',
    prompt: 'In an LLD interview, the first thing you should do is usually…',
    options: [
      { id: 'a', label: 'Draw every class you know', correct: false },
      { id: 'b', label: 'Clarify requirements and constraints out loud', correct: true },
      { id: 'c', label: 'Jump to microservices', correct: false },
    ],
  },
  {
    id: 'd6',
    prompt: 'Composition over inheritance means…',
    options: [
      { id: 'a', label: 'Prefer has-a / delegation when behavior is shared', correct: true },
      { id: 'b', label: 'Never use inheritance', correct: false },
      { id: 'c', label: 'Always use abstract classes', correct: false },
    ],
  },
]

/** POST /plannr/diagnostic/submit */
export async function submitDiagnostic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { answers } = req.body as { answers: { id: string; optionId: string }[] }
    const byId = new Map(DIAGNOSTIC_QUESTIONS.map(q => [q.id, q]))
    let correctCount = 0
    const graded = (answers ?? []).map(a => {
      const q = byId.get(a.id)
      const ok = !!q?.options.find(o => o.id === a.optionId && o.correct)
      if (ok) correctCount++
      return { id: a.id, correct: ok }
    })
    const score = Math.round((correctCount / DIAGNOSTIC_QUESTIONS.length) * 100)
    let suggestedLevel: 'scratch' | 'oop' | 'basic-lld' | 'solving' = 'scratch'
    let suggestedStage = 1
    if (score >= 85) {
      suggestedLevel = 'solving'
      suggestedStage = 3
    } else if (score >= 65) {
      suggestedLevel = 'basic-lld'
      suggestedStage = 2
    } else if (score >= 40) {
      suggestedLevel = 'oop'
      suggestedStage = 1
    }

    res.json({
      score,
      suggestedLevel,
      suggestedStage,
      answers: graded,
    })
  } catch (err) {
    next(err)
  }
}
