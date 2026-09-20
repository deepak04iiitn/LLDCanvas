import { Request, Response, NextFunction } from 'express'
import { DetectiveScenario } from '../../models/learn/detective-scenario.model'
import { createError } from '../../middleware/error'
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
      .select('slug title mode difficulty stem choices order')
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
        explanation: scenario.explanation,
        answer: scenario.answer,
      },
    })
  } catch (e) {
    next(e)
  }
}
