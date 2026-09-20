import { Request, Response, NextFunction } from 'express'
import { QuizQuestion } from '../../models/learn/quiz-question.model'
import { DailyQuizSet } from '../../models/learn/daily-quiz-set.model'
import { QuizAttempt } from '../../models/learn/quiz-attempt.model'
import { createError } from '../../middleware/error'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const dateKey = todayKey()
    let set = await DailyQuizSet.findOne({ dateKey, status: 'published' })
    if (!set) {
      // Fallback: pick 5 published questions and materialize today's set
      const questions = await QuizQuestion.find({ status: 'published' }).limit(5).lean()
      if (questions.length === 0) {
        res.json({ dateKey, questions: [] })
        return
      }
      set = await DailyQuizSet.findOneAndUpdate(
        { dateKey },
        {
          dateKey,
          questionIds: questions.map(q => q._id),
          status: 'published',
        },
        { upsert: true, new: true },
      )
    }

    const questions = await QuizQuestion.find({ _id: { $in: set!.questionIds }, status: 'published' })
      .select('slug topic difficulty prompt choices')
      .lean()

    res.json({ dateKey, setId: set!.id, questions })
  } catch (e) { next(e) }
}

export async function submitQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const dateKey = String(req.body.dateKey ?? todayKey())
    const answers = Array.isArray(req.body.answers)
      ? req.body.answers as { questionId: string; choiceIndex: number }[]
      : []

    let correctCount = 0
    const details: { questionId: string; choiceIndex: number; correct: boolean }[] = []
    for (const a of answers) {
      const q = await QuizQuestion.findById(a.questionId)
      if (!q) continue
      const ok = q.correctIndex === a.choiceIndex
      if (ok) correctCount++
      details.push({ questionId: q.id, choiceIndex: a.choiceIndex, correct: ok })
    }

    const attempt = await QuizAttempt.create({
      userId: req.user!.id,
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

    // Enrich with explanations
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
    })
  } catch (e) { next(e) }
}

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
