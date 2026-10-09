import { Request, Response, NextFunction } from 'express'
import { QuizAttempt }      from '../../../models/learn/quiz-attempt.model'
import { DetectiveAttempt } from '../../../models/learn/detective-attempt.model'
import { DebuggerSolve }    from '../../../models/learn/debugger-solve.model'
import { RoguelikeRun }     from '../../../models/learn/roguelike-run.model'
import { JourneyActivity }  from '../../../models/journey/journey-activity.model'
import { ChallengeAttempt } from '../../../models/studio/challenge-attempt.model'
import { User }             from '../../../models/user.model'

// ─── Constants ─────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  'plannr':      'Plannr',
  'daily-quiz':  'Daily Quiz',
  'detective':   'Pattern Detective',
  'debug-lab':   'Debug Lab',
  'roguelike':   'LLD Roguelike',
  'debug-fix':   'Debug & Fix',
  'refactor':    'Refactor',
  'change-one':  'Change One Thing',
  'evolution':   'Evolution',
  'budget':      'Budget Pressure',
}

const PACK_TYPE_TO_FEATURE: Record<string, string> = {
  debugger:   'debug-fix',
  refactor:   'refactor',
  change_one: 'change-one',
  evolution:  'evolution',
  budget:     'budget',
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface RawRow {
  userId:          string
  date:            string
  feature:         string
  actions:         number
  completions:     number
  durationSeconds: number
  lastSeen:        Date
  /** Per-attempt quiz score (only for daily-quiz attempt rows) */
  scoreCorrect?:   number
  scoreTotal?:     number
}

// ─── Main handler ───────────────────────────────────────────────────────────────

export async function adminGetUserActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const days    = Math.min(Number(req.query.days)  || 30, 90)
    const feature = (req.query.feature as string)    || 'all'
    const search  = (req.query.search  as string)    || ''
    const page    = Math.max(1, Number(req.query.page)  || 1)
    const limit   = Math.min(100, Math.max(10, Number(req.query.limit) || 50))
    const sortBy  = (req.query.sortBy  as string)    || 'date'
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1

    const since = new Date()
    since.setDate(since.getDate() - days)

    const allRows: RawRow[] = []
    const str = (v: unknown) => String(v)

    // ── Daily Quiz ────────────────────────────────────────────────────────────
    // Feature-scoped view: one row per attempt with score. Cross-feature "all": day aggregates.
    if (feature === 'daily-quiz') {
      const attempts = await QuizAttempt.find({ createdAt: { $gte: since } })
        .select('userId correctCount total createdAt dateKey')
        .sort({ createdAt: -1 })
        .lean()
      for (const a of attempts) {
        const createdAt = (a as { createdAt?: Date }).createdAt ?? new Date()
        allRows.push({
          userId:          String(a.userId),
          date:            a.dateKey || createdAt.toISOString().slice(0, 10),
          feature:         'daily-quiz',
          actions:         1,
          completions:     a.correctCount ?? 0,
          durationSeconds: 0,
          lastSeen:        createdAt,
          scoreCorrect:    a.correctCount ?? 0,
          scoreTotal:      a.total ?? 0,
        })
      }
    } else if (feature === 'all') {
      const data = await QuizAttempt.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
          _id: { userId: { $toString: '$userId' }, date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          actions:     { $sum: 1 },
          completions: { $sum: '$correctCount' },
          lastSeen:    { $max: '$createdAt' },
        }},
      ])
      for (const d of data) {
        allRows.push({ userId: d._id.userId, date: d._id.date, feature: 'daily-quiz', actions: d.actions, completions: d.completions, durationSeconds: 0, lastSeen: d.lastSeen })
      }
    }

    // ── Pattern Detective ─────────────────────────────────────────────────────
    if (feature === 'all' || feature === 'detective') {
      const data = await DetectiveAttempt.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: {
          _id: { userId: '$userId', date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
          actions:         { $sum: 1 },
          completions:     { $sum: { $cond: ['$isCorrect', 1, 0] } },
          durationSeconds: { $sum: '$timeTakenSeconds' },
          lastSeen:        { $max: '$timestamp' },
        }},
      ])
      for (const d of data) {
        allRows.push({ userId: str(d._id.userId), date: d._id.date, feature: 'detective', actions: d.actions, completions: d.completions, durationSeconds: d.durationSeconds, lastSeen: d.lastSeen })
      }
    }

    // ── Debug Lab ─────────────────────────────────────────────────────────────
    if (feature === 'all' || feature === 'debug-lab') {
      const data = await DebuggerSolve.aggregate([
        { $match: { solvedAt: { $gte: since } } },
        { $group: {
          _id: { userId: '$userId', date: { $dateToString: { format: '%Y-%m-%d', date: '$solvedAt' } } },
          actions:         { $sum: 1 },
          completions:     { $sum: { $cond: ['$isSolved', 1, 0] } },
          durationSeconds: { $sum: '$timeTakenSeconds' },
          lastSeen:        { $max: '$solvedAt' },
        }},
      ])
      for (const d of data) {
        allRows.push({ userId: str(d._id.userId), date: d._id.date, feature: 'debug-lab', actions: d.actions, completions: d.completions, durationSeconds: d.durationSeconds, lastSeen: d.lastSeen })
      }
    }

    // ── LLD Roguelike ─────────────────────────────────────────────────────────
    if (feature === 'all' || feature === 'roguelike') {
      const data = await RoguelikeRun.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: {
          _id: { userId: { $toString: '$userId' }, date: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } } },
          actions:         { $sum: 1 },
          completions:     { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          durationSeconds: { $sum: {
            $cond: [
              { $and: [{ $ifNull: ['$endedAt', false] }, { $ifNull: ['$startedAt', false] }] },
              { $divide: [{ $subtract: ['$endedAt', '$startedAt'] }, 1000] },
              0,
            ],
          }},
          lastSeen: { $max: '$startedAt' },
        }},
      ])
      for (const d of data) {
        allRows.push({ userId: str(d._id.userId), date: d._id.date, feature: 'roguelike', actions: d.actions, completions: d.completions, durationSeconds: Math.round(d.durationSeconds), lastSeen: d.lastSeen })
      }
    }

    // ── Plannr ────────────────────────────────────────────────────────────────
    if (feature === 'all' || feature === 'plannr') {
      const data = await JourneyActivity.aggregate([
        { $match: { completedAt: { $gte: since } } },
        { $group: {
          _id: { userId: '$userId', date: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } } },
          actions:         { $sum: 1 },
          completions:     { $sum: 1 },
          durationSeconds: { $sum: { $ifNull: ['$duration', 0] } },
          lastSeen:        { $max: '$completedAt' },
        }},
      ])
      for (const d of data) {
        allRows.push({ userId: str(d._id.userId), date: d._id.date, feature: 'plannr', actions: d.actions, completions: d.completions, durationSeconds: d.durationSeconds, lastSeen: d.lastSeen })
      }
    }

    // ── Studio features (debug-fix, refactor, change-one, evolution, budget) ──
    const studioSlugs = ['debug-fix', 'refactor', 'change-one', 'evolution', 'budget']
    if (feature === 'all' || studioSlugs.includes(feature)) {
      const packTypeFilter = feature === 'all'
        ? Object.keys(PACK_TYPE_TO_FEATURE)
        : Object.entries(PACK_TYPE_TO_FEATURE).filter(([, f]) => f === feature).map(([pt]) => pt)

      const data = await ChallengeAttempt.aggregate([
        { $match: { createdAt: { $gte: since }, type: { $in: packTypeFilter } } },
        { $group: {
          _id: { userId: { $toString: '$userId' }, date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' },
          actions:     { $sum: 1 },
          completions: { $sum: { $cond: [{ $in: ['$status', ['submitted', 'revealed']] }, 1, 0] } },
          lastSeen:    { $max: '$createdAt' },
        }},
      ])
      for (const d of data) {
        const featureSlug = PACK_TYPE_TO_FEATURE[d._id.type]
        if (!featureSlug) continue
        allRows.push({ userId: str(d._id.userId), date: d._id.date, feature: featureSlug, actions: d.actions, completions: d.completions, durationSeconds: 0, lastSeen: d.lastSeen })
      }
    }

    // ── Enrich with User data ─────────────────────────────────────────────────
    const uniqueUserIds = [...new Set(allRows.map(r => r.userId))]
    const users = await User.find({ _id: { $in: uniqueUserIds } }).select('name email').lean()
    const userMap = new Map(users.map(u => [u._id.toString(), { name: (u.name as string) || 'Unknown', email: (u.email as string) || '' }]))

    // ── Summary (from all rows, before search filter) ─────────────────────────
    const totalActions     = allRows.reduce((s, r) => s + r.actions, 0)
    const uniqueActiveUsers = new Set(allRows.map(r => r.userId)).size
    const featureActionCounts: Record<string, number> = {}
    for (const r of allRows) featureActionCounts[r.feature] = (featureActionCounts[r.feature] || 0) + r.actions
    const topFeatureSlug = Object.entries(featureActionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || ''

    // ── Search filter ─────────────────────────────────────────────────────────
    let filtered = allRows
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = allRows.filter(r => {
        const u = userMap.get(r.userId)
        return (
          u?.name.toLowerCase().includes(q) ||
          u?.email.toLowerCase().includes(q) ||
          FEATURE_LABELS[r.feature]?.toLowerCase().includes(q) ||
          r.feature.includes(q)
        )
      })
    }

    // ── Sort ──────────────────────────────────────────────────────────────────
    filtered.sort((a, b) => {
      let va: string | number, vb: string | number
      switch (sortBy) {
        case 'userName':     va = userMap.get(a.userId)?.name ?? ''; vb = userMap.get(b.userId)?.name ?? ''; break
        case 'feature':      va = a.feature;         vb = b.feature;         break
        case 'actions':      va = a.actions;         vb = b.actions;         break
        case 'completions':  va = a.completions;     vb = b.completions;     break
        case 'score': {
          const pctA = (a.scoreTotal ?? 0) > 0 ? (a.scoreCorrect ?? 0) / (a.scoreTotal as number) : -1
          const pctB = (b.scoreTotal ?? 0) > 0 ? (b.scoreCorrect ?? 0) / (b.scoreTotal as number) : -1
          va = pctA; vb = pctB
          break
        }
        case 'duration':     va = a.durationSeconds; vb = b.durationSeconds; break
        case 'lastSeen':     va = a.lastSeen.toISOString(); vb = b.lastSeen.toISOString(); break
        default:             va = a.date;            vb = b.date;            break
      }
      if (typeof va === 'string') return sortDir === 1 ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
      return sortDir === 1 ? (va - (vb as number)) : ((vb as number) - va)
    })

    // ── Paginate ──────────────────────────────────────────────────────────────
    const total = filtered.length
    const pages = Math.ceil(total / limit)
    const slice = filtered.slice((page - 1) * limit, page * limit)

    const rows = slice.map(r => {
      const u = userMap.get(r.userId)
      const scoreCorrect = r.scoreCorrect
      const scoreTotal   = r.scoreTotal
      const scorePercent = scoreCorrect != null && scoreTotal != null && scoreTotal > 0
        ? Math.round((scoreCorrect / scoreTotal) * 100)
        : null
      return {
        date:           r.date,
        userId:         r.userId,
        userName:       u?.name  || 'Unknown',
        userEmail:      u?.email || '',
        feature:        r.feature,
        featureLabel:   FEATURE_LABELS[r.feature] || r.feature,
        actions:        r.actions,
        completions:    r.completions,
        durationMinutes: r.durationSeconds > 0 ? Math.round(r.durationSeconds / 60) : null,
        lastSeen:       r.lastSeen,
        ...(scoreCorrect != null && scoreTotal != null ? {
          scoreCorrect,
          scoreTotal,
          scorePercent,
          scoreLabel: `${scoreCorrect}/${scoreTotal}`,
        } : {}),
      }
    })

    res.json({
      rows,
      total,
      page,
      pages,
      summary: {
        totalActiveUsers:  uniqueActiveUsers,
        totalActions,
        topFeatureSlug,
        topFeatureLabel:   FEATURE_LABELS[topFeatureSlug] || topFeatureSlug,
        avgActionsPerUser: uniqueActiveUsers > 0 ? Math.round(totalActions / uniqueActiveUsers) : 0,
      },
    })
  } catch (e) { next(e) }
}
