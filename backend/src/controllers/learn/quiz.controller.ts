import { Request, Response, NextFunction } from 'express'
import { QuizQuestion } from '../../models/learn/quiz-question.model'
import { DailyQuizSet } from '../../models/learn/daily-quiz-set.model'
import { QuizAttempt } from '../../models/learn/quiz-attempt.model'
import { QuizRevisit } from '../../models/learn/quiz-revisit.model'
import { JourneyProfile } from '../../models/journey/journey-profile.model'
import { User } from '../../models/user.model'
import { applySkillDeltas } from '../../utils/skill-updater'
import { createError } from '../../middleware/error'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns an array of the 2 skill keys with the lowest score, given a skills map. */
function getWeakestSkills(skills: Record<string, number>): string[] {
  return Object.entries(skills)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([k]) => k)
}

// ─── getTodayQuiz ────────────────────────────────────────────────────────────

const QUIZ_SIZE = 10

export async function getTodayQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const dateKey = todayKey()
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
    const pick    = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n)

    // Ensure a global daily set exists (used as the canonical setId for tracking)
    let set = await DailyQuizSet.findOne({ dateKey, status: 'published' })
    if (!set) {
      const all = await QuizQuestion.find({ status: 'published' }).select('_id').lean()
      if (all.length === 0) { res.json({ dateKey, questions: [] }); return }
      set = await DailyQuizSet.findOneAndUpdate(
        { dateKey },
        { dateKey, questionIds: all.map(q => q._id), status: 'published' },
        { upsert: true, new: true },
      )
    }

    // Full published pool
    let pool = await QuizQuestion.find({ status: 'published' })
      .select('slug topic difficulty prompt choices skillTag')
      .lean()

    if (pool.length === 0) { res.json({ dateKey, setId: set!.id, questions: [] }); return }

    // For authenticated users: exclude questions seen in the last 30 days
    if (req.user) {
      const cutoff = new Date(Date.now() - 30 * 86_400_000)
      const recentAttempts = await QuizAttempt.find({
        userId: req.user.id,
        createdAt: { $gte: cutoff },
      }).select('answers').lean()

      const seenIds = new Set<string>()
      for (const attempt of recentAttempts) {
        for (const a of attempt.answers) seenIds.add(String(a.questionId))
      }

      const fresh = pool.filter(q => !seenIds.has(String((q as any)._id)))
      // If enough fresh questions exist, restrict pool to those; otherwise allow repeats
      if (fresh.length >= QUIZ_SIZE) pool = fresh
      else if (fresh.length > 0) {
        // Pad with least-recently-seen questions to reach QUIZ_SIZE
        const stale = pool.filter(q => seenIds.has(String((q as any)._id)))
        pool = [...fresh, ...shuffle(stale).slice(0, QUIZ_SIZE - fresh.length)]
      }
    }

    let questions = pool

    // Adaptive selection: weight toward weakest skills
    if (req.user) {
      const profile = await JourneyProfile.findOne({ userId: req.user.id, isActive: true })
      if (profile) {
        const skillsRaw = profile.skills as unknown as Record<string, number>
        const [weak1, weak2] = getWeakestSkills(skillsRaw)

        const fromWeak1 = pool.filter(q => q.skillTag === weak1)
        const fromWeak2 = pool.filter(q => q.skillTag === weak2)
        const rest      = pool.filter(q => q.skillTag !== weak1 && q.skillTag !== weak2)

        if (fromWeak1.length > 0 || fromWeak2.length > 0) {
          const slot1 = pick(fromWeak1, 4)  // 4 from weakest skill
          const slot2 = pick(fromWeak2, 2)  // 2 from 2nd weakest skill
          const picked = new Set([...slot1, ...slot2].map(q => String((q as any)._id)))
          const remaining = shuffle([...rest, ...fromWeak1, ...fromWeak2]).filter(
            q => !picked.has(String((q as any)._id)),
          )
          const slot3 = remaining.slice(0, Math.max(0, QUIZ_SIZE - slot1.length - slot2.length))
          const adaptive = [...slot1, ...slot2, ...slot3]
          if (adaptive.length > 0) questions = adaptive
        } else {
          questions = pick(pool, QUIZ_SIZE)
        }
      } else {
        questions = pick(pool, QUIZ_SIZE)
      }
    } else {
      questions = pick(pool, QUIZ_SIZE)
    }

    // Final cap to QUIZ_SIZE
    questions = shuffle(questions).slice(0, QUIZ_SIZE)

    // ── Check if the user already completed today's quiz ──────────────────────
    if (req.user) {
      const existing = await QuizAttempt.findOne({ userId: req.user.id, dateKey }).lean()
      if (existing) {
        // Enrich the stored answers with explanation + correctIndex from question docs
        const enriched = []
        for (const a of existing.answers) {
          const q = await QuizQuestion.findById(a.questionId)
            .select('slug topic difficulty prompt choices correctIndex explanation skillTag')
            .lean()
          if (q) enriched.push({
            ...(q as any),
            // include what the user answered for review
            userChoiceIndex: a.choiceIndex,
            userCorrect:     a.correct,
          })
        }
        return res.json({
          dateKey,
          setId:            String(set!._id),
          questions:        enriched,
          alreadyCompleted: true,
          existingResult: {
            correct:  existing.correctCount,
            total:    existing.total,
          },
        })
      }
    }

    res.json({ dateKey, setId: set!.id, questions })
  } catch (e) { next(e) }
}

// ─── submitQuiz ──────────────────────────────────────────────────────────────

export async function submitQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const dateKey = String(req.body.dateKey ?? todayKey())
    const userId = req.user!.id

    // Prevent re-submission for the same day
    const alreadyAttempted = await QuizAttempt.findOne({ userId, dateKey }).lean()
    if (alreadyAttempted) {
      res.status(409).json({ message: "You've already completed today's quiz. Come back tomorrow!" })
      return
    }

    const answers = Array.isArray(req.body.answers)
      ? req.body.answers as { questionId: string; choiceIndex: number }[]
      : []

    let correctCount = 0
    const details: { questionId: string; choiceIndex: number; correct: boolean; skillTag?: string }[] = []

    for (const a of answers) {
      const q = await QuizQuestion.findById(a.questionId)
      if (!q) continue
      const ok = q.correctIndex === a.choiceIndex
      if (ok) correctCount++
      details.push({
        questionId: q.id,
        choiceIndex: a.choiceIndex,
        correct: ok,
        skillTag: q.skillTag || undefined,
      })
    }

    const attempt = await QuizAttempt.create({
      userId,
      dateKey,
      setId: req.body.setId,
      answers: details.map(d => ({
        questionId: d.questionId,
        choiceIndex: d.choiceIndex,
        correct: d.correct,
      })),
      correctCount,
      total: details.length,
    })

    // ── Revisit bank ──────────────────────────────────────────────────────────
    await Promise.all(
      details.map(d => {
        if (!d.correct) {
          // Wrong answer → add to revisit bank; always update userChoiceIndex to the latest wrong pick
          return QuizRevisit.updateOne(
            { userId, questionId: d.questionId, isResolved: false },
            {
              $set:      { userChoiceIndex: d.choiceIndex },
              $setOnInsert: { userId, questionId: d.questionId, addedAt: new Date() },
            },
            { upsert: true },
          )
        } else {
          // Correct answer → resolve any existing revisit entry
          return QuizRevisit.updateOne(
            { userId, questionId: d.questionId, isResolved: false },
            { $set: { isResolved: true, reviewedAt: new Date() } },
          )
        }
      }),
    )

    // ── Skill deltas ──────────────────────────────────────────────────────────
    const skillDeltas: Partial<Record<string, number>> = {}
    for (const d of details) {
      if (d.correct && d.skillTag) {
        skillDeltas[d.skillTag] = (skillDeltas[d.skillTag] ?? 0) + 1
      }
    }

    let interviewReadiness: number | undefined
    if (Object.keys(skillDeltas).length > 0) {
      const result = await applySkillDeltas(userId, 'quiz', skillDeltas)
      interviewReadiness = result.interviewReadiness
    }

    // ── Enrich details with explanation/correctIndex ──────────────────────────
    const enriched = []
    for (const d of details) {
      const q = await QuizQuestion.findById(d.questionId)
      enriched.push({
        ...d,
        explanation: q?.explanation ?? '',
        correctIndex: q?.correctIndex,
      })
    }

    res.json({
      attemptId: attempt.id,
      correct: correctCount,
      total: details.length,
      details: enriched,
      skillDeltas,
      interviewReadiness,
    })
  } catch (e) { next(e) }
}

// ─── getQuizStreak ────────────────────────────────────────────────────────────

export async function getQuizStreak(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id

    // Get all distinct dateKeys for this user (sorted desc)
    const attempts = await QuizAttempt.find({ userId })
      .select('dateKey')
      .sort({ dateKey: -1 })
      .lean()

    const dateSet = new Set<string>(attempts.map(a => a.dateKey))
    const sortedDates = Array.from(dateSet).sort().reverse() // newest first

    // Compute current streak (consecutive days ending today or yesterday)
    let currentStreak = 0
    const today = todayKey()

    // Walk back day by day from today
    const msPerDay = 86_400_000
    let cursor = new Date(today)
    while (true) {
      const key = cursor.toISOString().slice(0, 10)
      if (dateSet.has(key)) {
        currentStreak++
        cursor = new Date(cursor.getTime() - msPerDay)
      } else {
        break
      }
    }

    // Longest streak (global, over all history)
    let longestStreak = 0
    let runLen = 0
    const allDatesAsc = Array.from(dateSet).sort()
    for (let i = 0; i < allDatesAsc.length; i++) {
      if (i === 0) {
        runLen = 1
      } else {
        const prev = new Date(allDatesAsc[i - 1]).getTime()
        const curr = new Date(allDatesAsc[i]).getTime()
        if (curr - prev === msPerDay) {
          runLen++
        } else {
          runLen = 1
        }
      }
      if (runLen > longestStreak) longestStreak = runLen
    }

    // Last 30 days (kept for backward compat)
    const last30Days: string[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(new Date(today).getTime() - i * msPerDay)
      const key = d.toISOString().slice(0, 10)
      if (dateSet.has(key)) last30Days.push(key)
    }

    // Last 365 days (for contribution heatmap)
    const last365Days: string[] = []
    for (let i = 0; i < 365; i++) {
      const d = new Date(new Date(today).getTime() - i * msPerDay)
      const key = d.toISOString().slice(0, 10)
      if (dateSet.has(key)) last365Days.push(key)
    }

    res.json({
      currentStreak,
      longestStreak,
      totalDays: dateSet.size,
      last30Days,
      last365Days,
    })
  } catch (e) { next(e) }
}

// ─── getLeaderboard ───────────────────────────────────────────────────────────

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user?.id

    // Aggregate QuizAttempt by userId
    const agg = await QuizAttempt.aggregate([
      {
        $group: {
          _id: '$userId',
          totalCorrect: { $sum: '$correctCount' },
          totalAttempts: { $sum: 1 },
          totalQuestions: { $sum: '$total' },
        },
      },
      { $sort: { totalCorrect: -1 } },
    ])

    // Get user info for top entries
    const userIds = agg.map(a => String(a._id))
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email')
      .lean()
    const userMap = new Map(users.map(u => [String(u._id), u]))

    const rows = agg.map((a, idx) => {
      const u = userMap.get(String(a._id))
      return {
        rank: idx + 1,
        userId: String(a._id),
        name: u?.name ?? u?.email ?? 'Anonymous',
        totalCorrect: a.totalCorrect as number,
        totalAttempts: a.totalAttempts as number,
        accuracy:
          a.totalQuestions > 0
            ? Math.round((a.totalCorrect / a.totalQuestions) * 100)
            : 0,
      }
    })

    const top20 = rows.slice(0, 20)
    let currentUserEntry = undefined
    if (currentUserId) {
      currentUserEntry = rows.find(r => r.userId === currentUserId)
    }

    res.json({ leaderboard: top20, currentUser: currentUserEntry ?? null })
  } catch (e) { next(e) }
}

// ─── getRevisitBank ───────────────────────────────────────────────────────────

export async function getRevisitBank(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id

    const revisits = await QuizRevisit.find({ userId, isResolved: false })
      .populate('questionId')
      .sort({ addedAt: -1 })
      .lean()

    const questions = revisits
      .filter(r => r.questionId)
      .map(r => ({
        ...(r.questionId as any),
        userChoiceIndex: r.userChoiceIndex ?? null,
      }))

    res.json({ questions, count: questions.length })
  } catch (e) { next(e) }
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export async function adminListQuestions(_req: Request, res: Response, next: NextFunction) {
  try {
    const questions = await QuizQuestion.find().sort({ updatedAt: -1 }).lean()
    res.json({ questions })
  } catch (e) { next(e) }
}

export async function adminCreateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await QuizQuestion.create(req.body)
    res.status(201).json(q)
  } catch (e) { next(e) }
}

export async function adminUpdateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await QuizQuestion.findByIdAndUpdate(paramId(req.params.id), req.body, { new: true })
    if (!q) throw createError('Not found', 404)
    res.json(q)
  } catch (e) { next(e) }
}

export async function adminDeleteQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    await QuizQuestion.findByIdAndDelete(paramId(req.params.id))
    res.json({ ok: true })
  } catch (e) { next(e) }
}
