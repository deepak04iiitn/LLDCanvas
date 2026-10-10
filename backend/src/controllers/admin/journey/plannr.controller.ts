import { Request, Response, NextFunction } from 'express'
import { JourneyProfile }    from '../../../models/journey/journey-profile.model'
import { JourneyActivity }   from '../../../models/journey/journey-activity.model'
import { JourneyTopic }      from '../../../models/journey/journey-topic.model'
import { JourneyExperience } from '../../../models/journey/journey-experience.model'
import { JourneyTip }        from '../../../models/journey/journey-tip.model'
import { PlannrPreviewVisit } from '../../../models/journey/plannr-preview-visit.model'
import { User } from '../../../models/user.model'

// ─── Analytics & stats ────────────────────────────────────────────────────────

export async function adminGetStats(req: Request, res: Response, next: NextFunction) {
  try {
    const days  = Number(req.query.days ?? 30)
    const since = new Date(Date.now() - days * 86_400_000)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [
      totalProfiles,
      activeProfiles,
      totalTopics,
      publishedTopics,
      totalExperiences,
      publishedExperiences,
      totalTips,
      totalActivities,
      recentActivities,
      todayActivities,
      dailyActivity,
      activityByType,
      popularTopics,
      stageDistribution,
      previewUniqueAllTime,
      previewUniquePeriod,
      previewUniqueToday,
      previewVisitsPeriod,
      recentPreviewDocs,
    ] = await Promise.all([
      JourneyProfile.countDocuments(),
      JourneyProfile.countDocuments({ isActive: true }),
      JourneyTopic.countDocuments(),
      JourneyTopic.countDocuments({ status: 'published' }),
      JourneyExperience.countDocuments(),
      JourneyExperience.countDocuments({ status: 'published' }),
      JourneyTip.countDocuments(),
      JourneyActivity.countDocuments({ completedAt: { $gte: since } }),
      JourneyActivity.countDocuments({ completedAt: { $gte: since } }),
      JourneyActivity.countDocuments({ completedAt: { $gte: today } }),
      // Daily activity trend
      JourneyActivity.aggregate([
        { $match: { completedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Activity by type
      JourneyActivity.aggregate([
        { $match: { completedAt: { $gte: since } } },
        { $group: { _id: '$activityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Popular topics by activity
      JourneyActivity.aggregate([
        { $match: { completedAt: { $gte: since }, topicSlug: { $exists: true, $ne: null } } },
        { $group: { _id: '$topicSlug', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Journey stage distribution
      JourneyProfile.aggregate([
        { $group: { _id: '$currentStage', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      PlannrPreviewVisit.countDocuments(),
      PlannrPreviewVisit.countDocuments({ lastViewedAt: { $gte: since } }),
      PlannrPreviewVisit.countDocuments({ lastViewedAt: { $gte: today } }),
      PlannrPreviewVisit.aggregate([
        { $match: { lastViewedAt: { $gte: since } } },
        { $group: { _id: null, visits: { $sum: '$visitCount' } } },
      ]),
      PlannrPreviewVisit.find({ lastViewedAt: { $gte: since } })
        .sort({ lastViewedAt: -1 })
        .limit(20)
        .lean(),
    ])

    // Unique active users
    const activeUserIds = await JourneyActivity.distinct('userId', { completedAt: { $gte: since } })
    const todayUserIds  = await JourneyActivity.distinct('userId', { completedAt: { $gte: today } })

    const previewUserIds = recentPreviewDocs.map(d => d.userId)
    const previewUsers = previewUserIds.length
      ? await User.find({ _id: { $in: previewUserIds } }).select('name email').lean()
      : []
    const previewUserMap = new Map(previewUsers.map(u => [String(u._id), u]))
    const recentPreviewViewers = recentPreviewDocs.map(d => {
      const u = previewUserMap.get(d.userId)
      return {
        userId:       d.userId,
        userName:     u?.name  ?? 'Unknown',
        userEmail:    u?.email ?? '',
        userPlan:     d.userPlan,
        visitCount:   d.visitCount,
        firstViewedAt: d.firstViewedAt,
        lastViewedAt:  d.lastViewedAt,
        sources:      d.sources,
      }
    })

    res.json({
      profiles: { total: totalProfiles, active: activeProfiles },
      topics:      { total: totalTopics,      published: publishedTopics },
      experiences: { total: totalExperiences, published: publishedExperiences },
      tips:        { total: totalTips },
      activity: {
        total: totalActivities,
        recent: recentActivities,
        today: todayActivities,
        activeUsersToday: todayUserIds.length,
        activeUsersThisPeriod: activeUserIds.length,
      },
      preview: {
        uniqueUsersAllTime: previewUniqueAllTime,
        uniqueUsersThisPeriod: previewUniquePeriod,
        uniqueUsersToday: previewUniqueToday,
        visitsThisPeriod: previewVisitsPeriod[0]?.visits ?? 0,
        recentViewers: recentPreviewViewers,
      },
      dailyActivity,
      activityByType,
      popularTopics,
      stageDistribution,
    })
  } catch (e) { next(e) }
}

// ─── User journey profiles (read-only overview) ───────────────────────────────

export async function adminListProfiles(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, Number(req.query.page  ?? 1))
    const limit = Math.min(100, Number(req.query.limit ?? 50))

    const [profiles, total] = await Promise.all([
      JourneyProfile.find()
        .sort({ lastActiveDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      JourneyProfile.countDocuments(),
    ])

    res.json({ profiles, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (e) { next(e) }
}

// ─── Topics CRUD ──────────────────────────────────────────────────────────────

export async function adminListTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const q      = String(req.query.q ?? '').trim()
    const status = req.query.status as string | undefined
    const stage  = req.query.stage  ? Number(req.query.stage) : undefined

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (stage)  filter.stage  = stage
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { slug:  { $regex: q, $options: 'i' } },
    ]

    const topics = await JourneyTopic.find(filter).sort({ stage: 1, order: 1 }).lean()
    res.json({ topics })
  } catch (e) { next(e) }
}

export async function adminCreateTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const topic = await JourneyTopic.create({
      slug:             req.body.slug,
      title:            req.body.title,
      subtitle:         req.body.subtitle          ?? '',
      stage:            req.body.stage             ?? 1,
      order:            req.body.order             ?? 0,
      type:             req.body.type              ?? 'concept',
      description:      req.body.description       ?? '',
      estimatedMinutes: req.body.estimatedMinutes  ?? 15,
      icon:             req.body.icon              ?? '📚',
      tags:             req.body.tags              ?? [],
      status:           req.body.status            ?? 'draft',
      content:          req.body.content           ?? {},
      buildsSkills:     req.body.buildsSkills      ?? [],
      prerequisites:    req.body.prerequisites     ?? [],
    })
    res.status(201).json(topic)
  } catch (e) { next(e) }
}

export async function adminUpdateTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const topic = await JourneyTopic.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!topic) return res.status(404).json({ error: 'Not found' })
    res.json(topic)
  } catch (e) { next(e) }
}

export async function adminPublishTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const topic = await JourneyTopic.findById(req.params.id)
    if (!topic) return res.status(404).json({ error: 'Not found' })
    topic.status = topic.status === 'published' ? 'draft' : 'published'
    await topic.save()
    res.json({ ok: true, status: topic.status })
  } catch (e) { next(e) }
}

export async function adminDeleteTopic(req: Request, res: Response, next: NextFunction) {
  try {
    await JourneyTopic.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
}

export async function adminBulkDeleteTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await JourneyTopic.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}

// ─── Experiences CRUD ─────────────────────────────────────────────────────────

export async function adminListExperiences(req: Request, res: Response, next: NextFunction) {
  try {
    const q      = String(req.query.q ?? '').trim()
    const status = req.query.status as string | undefined

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (q) filter.$or = [
      { title:   { $regex: q, $options: 'i' } },
      { slug:    { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
    ]

    const experiences = await JourneyExperience.find(filter).sort({ order: 1, createdAt: -1 }).lean()
    res.json({ experiences })
  } catch (e) { next(e) }
}

export async function adminCreateExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const exp = await JourneyExperience.create({
      slug:                 req.body.slug,
      title:                req.body.title,
      company:              req.body.company              ?? '',
      round:                req.body.round               ?? 'Technical',
      durationMinutes:      req.body.durationMinutes      ?? 45,
      problem:              req.body.problem             ?? '',
      problemDescription:   req.body.problemDescription  ?? '',
      followUps:            req.body.followUps           ?? [],
      conceptsTested:       req.body.conceptsTested      ?? [],
      tags:                 req.body.tags                ?? [],
      order:                req.body.order               ?? 0,
      status:               req.body.status              ?? 'draft',
      skillBars:            req.body.skillBars           ?? [],
      interviewerProbes:    req.body.interviewerProbes   ?? [],
      prerequisiteTopics:   req.body.prerequisiteTopics  ?? [],
      interviewerChecklist: req.body.interviewerChecklist ?? [],
      difficultyDimensions: req.body.difficultyDimensions ?? {},
    })
    res.status(201).json(exp)
  } catch (e) { next(e) }
}

export async function adminUpdateExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const exp = await JourneyExperience.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!exp) return res.status(404).json({ error: 'Not found' })
    res.json(exp)
  } catch (e) { next(e) }
}

export async function adminPublishExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const exp = await JourneyExperience.findById(req.params.id)
    if (!exp) return res.status(404).json({ error: 'Not found' })
    exp.status = exp.status === 'published' ? 'draft' : 'published'
    await exp.save()
    res.json({ ok: true, status: exp.status })
  } catch (e) { next(e) }
}

export async function adminDeleteExperience(req: Request, res: Response, next: NextFunction) {
  try {
    await JourneyExperience.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
}

export async function adminBulkDeleteExperiences(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await JourneyExperience.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}

// ─── Tips CRUD ────────────────────────────────────────────────────────────────

export async function adminListTips(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined
    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    const tips = await JourneyTip.find(filter).sort({ moment: 1, order: 1 }).lean()
    res.json({ tips })
  } catch (e) { next(e) }
}

export async function adminCreateTip(req: Request, res: Response, next: NextFunction) {
  try {
    const tip = await JourneyTip.create({
      moment: req.body.moment ?? 'starting',
      title:  req.body.title,
      body:   req.body.body  ?? '',
      order:  req.body.order ?? 0,
      status: req.body.status ?? 'published',
    })
    res.status(201).json(tip)
  } catch (e) { next(e) }
}

export async function adminUpdateTip(req: Request, res: Response, next: NextFunction) {
  try {
    const tip = await JourneyTip.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!tip) return res.status(404).json({ error: 'Not found' })
    res.json(tip)
  } catch (e) { next(e) }
}

export async function adminPublishTip(req: Request, res: Response, next: NextFunction) {
  try {
    const tip = await JourneyTip.findById(req.params.id)
    if (!tip) return res.status(404).json({ error: 'Not found' })
    tip.status = tip.status === 'published' ? 'draft' : 'published'
    await tip.save()
    res.json({ ok: true, status: tip.status })
  } catch (e) { next(e) }
}

export async function adminDeleteTip(req: Request, res: Response, next: NextFunction) {
  try {
    await JourneyTip.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
}

export async function adminBulkDeleteTips(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    await JourneyTip.deleteMany({ _id: { $in: ids } })
    res.json({ ok: true, deleted: ids.length })
  } catch (e) { next(e) }
}
