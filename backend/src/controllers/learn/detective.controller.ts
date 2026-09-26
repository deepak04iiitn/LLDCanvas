import { Request, Response, NextFunction } from 'express'
import { DetectiveScenario } from '../../models/learn/detective-scenario.model'
import { DetectiveAttempt } from '../../models/learn/detective-attempt.model'
import { createError } from '../../middleware/error'
import { applySkillDeltas } from '../../utils/skill-updater'
import { randomBytes } from 'crypto'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

async function findPublished(idOrSlug: string) {
  let scenario = null
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    scenario = await DetectiveScenario.findOne({ _id: idOrSlug, status: 'published' })
  }
  if (!scenario) {
    scenario = await DetectiveScenario.findOne({ slug: idOrSlug, status: 'published' })
  }
  if (!scenario) throw createError('Scenario not found', 404)
  return scenario
}

export async function listDetective(req: Request, res: Response, next: NextFunction) {
  try {
    const scenarios = await DetectiveScenario.find({ status: 'published' })
      .select('slug title mode difficulty stem choices diagramSnapshot status order')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json({ scenarios })
  } catch (e) {
    next(e)
  }
}

export async function startDetective(req: Request, res: Response, next: NextFunction) {
  try {
    const scenario = await findPublished(paramId(req.params.id))
    const attemptId = `det_${randomBytes(8).toString('hex')}`
    res.status(201).json({
      attemptId,
      scenario: {
        id: scenario.id,
        slug: scenario.slug,
        title: scenario.title,
        mode: scenario.mode,
        difficulty: scenario.difficulty,
        stem: scenario.stem,
        choices: scenario.choices,
        diagramSnapshot: scenario.diagramSnapshot,
        // suggest mode
        problemContext: scenario.problemContext,
        // compare mode — expose prompt fields but NOT keyTradeoffs
        patternA: scenario.patternA,
        patternB: scenario.patternB,
        comparisonContext: scenario.comparisonContext,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function submitDetective(req: Request, res: Response, next: NextFunction) {
  try {
    const { scenarioId, answer, timeTakenSeconds } = req.body as {
      attemptId?: string
      scenarioId: string
      answer: string
      timeTakenSeconds: number
    }
    const userId = (req as any).user?.id ?? (req as any).userId ?? ''

    if (!scenarioId || !answer) {
      return next(createError('scenarioId and answer are required', 400))
    }

    // Fetch scenario with answer for comparison
    const scenario = await DetectiveScenario.findById(scenarioId)
    if (!scenario || scenario.status !== 'published') {
      return next(createError('Scenario not found', 404))
    }

    // ── Grade based on mode ──────────────────────────────────────────────────
    let isCorrect = false
    let partialCredit = false
    let matchedKeywords: string[] = []

    if (scenario.mode === 'suggest') {
      // Accept if the answer contains any of the valid pattern names
      const keyPatterns = scenario.keyPatterns ?? []
      isCorrect = keyPatterns.some(p =>
        answer.trim().toLowerCase().includes(p.toLowerCase()),
      )
    } else if (scenario.mode === 'compare') {
      // Accept if at least 2 tradeoff keywords appear in the answer
      const keyTradeoffs = scenario.keyTradeoffs ?? []
      matchedKeywords = keyTradeoffs.filter(k =>
        answer.toLowerCase().includes(k.toLowerCase()),
      )
      isCorrect = matchedKeywords.length >= 2
      partialCredit = !isCorrect && matchedKeywords.length === 1
    } else {
      // identify / detect / explain — exact match
      isCorrect = answer.trim().toLowerCase() === scenario.answer.trim().toLowerCase()
    }

    // Persist the attempt
    await DetectiveAttempt.create({
      userId,
      scenarioId: scenario._id,
      answer: answer.trim(),
      isCorrect,
      timeTakenSeconds: timeTakenSeconds ?? 0,
    })

    // Apply skill deltas (partial credit for compare mode)
    const deltas = partialCredit
      ? { patterns: 2 }
      : isCorrect
        ? { patterns: 4 }
        : { patterns: 1 }
    const { interviewReadiness } = await applySkillDeltas(userId, 'detective', deltas)

    res.json({
      correct: isCorrect,
      partialCredit,
      correctAnswer: scenario.answer,
      explanation: scenario.explanation,
      skillDeltas: deltas,
      interviewReadiness,
      // compare mode — reveal keywords after submission so user can learn
      ...(scenario.mode === 'compare' && {
        matchedKeywords,
        keyTradeoffs: scenario.keyTradeoffs ?? [],
      }),
    })
  } catch (e) {
    next(e)
  }
}

export async function getAttemptHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id ?? (req as any).userId ?? ''

    const rawAttempts = await DetectiveAttempt.find({ userId })
      .populate<{ scenarioId: { _id: unknown; title: string; slug: string; answer: string } }>(
        'scenarioId',
        'title slug answer',
      )
      .sort({ timestamp: -1 })
      .lean()

    // Group by scenario
    const byScenario = new Map<
      string,
      {
        scenarioId: string
        title: string
        slug: string
        attempts: typeof rawAttempts
        correctCount: number
        totalCount: number
      }
    >()

    const patternMastery: Record<string, { correct: number; total: number }> = {}

    for (const attempt of rawAttempts) {
      const populated = attempt.scenarioId as unknown as {
        _id: unknown
        title: string
        slug: string
        answer: string
      } | null

      if (!populated) continue

      const sid = String(populated._id)
      const slug = populated.slug ?? sid
      const title = populated.title ?? slug

      if (!byScenario.has(sid)) {
        byScenario.set(sid, {
          scenarioId: sid,
          title,
          slug,
          attempts: [],
          correctCount: 0,
          totalCount: 0,
        })
      }

      const group = byScenario.get(sid)!
      group.attempts.push(attempt)
      group.totalCount += 1
      if (attempt.isCorrect) group.correctCount += 1

      // Pattern mastery keyed by slug (pattern name)
      if (!patternMastery[slug]) patternMastery[slug] = { correct: 0, total: 0 }
      patternMastery[slug].total += 1
      if (attempt.isCorrect) patternMastery[slug].correct += 1
    }

    res.json({
      attempts: Array.from(byScenario.values()),
      patternMastery,
    })
  } catch (e) {
    next(e)
  }
}
