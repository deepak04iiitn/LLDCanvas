import { Request, Response, NextFunction } from 'express'
import {
  getBudgetReport,
  getSession,
  listPublishedPacks,
  saveBudget,
  startSession,
  submitBudgetStage,
} from '../../services/studio/challenge-session.service'
import type { BudgetStageSubmission } from '../../services/studio/budgetGrade'
import { applySkillDeltas } from '../../utils/skill-updater'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function listBudgetPacks(_req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await listPublishedPacks('budget')
    res.json({ packs })
  } catch (e) {
    next(e)
  }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, 'budget')
    res.status(201).json(session)
  } catch (e) {
    next(e)
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSession(paramId(req.params.sessionId), req.user!.id)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export async function save(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await saveBudget(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.diagramData ?? {},
      req.body.draft ?? null,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export async function submitStage(req: Request, res: Response, next: NextFunction) {
  try {
    const submission: BudgetStageSubmission = {
      picks: Array.isArray(req.body.picks) ? req.body.picks : [],
      reserved: typeof req.body.reserved === 'number' ? req.body.reserved : 0,
      deferredPressureIds: Array.isArray(req.body.deferredPressureIds)
        ? req.body.deferredPressureIds
        : [],
      customInvestments: Array.isArray(req.body.customInvestments)
        ? req.body.customInvestments
        : [],
      diagram: req.body.diagramData ?? req.body.diagram,
    }
    const result = await submitBudgetStage(
      paramId(req.params.sessionId),
      req.user!.id,
      submission,
    )
    const passed = !!result.grade?.accepted
    const skillDeltas: Record<string, number> = passed
      ? { tradeoffReasoning: 5, extensibility: 2 }
      : { tradeoffReasoning: 1 }
    let interviewReadiness: number | undefined
    try {
      const skillResult = await applySkillDeltas(req.user!.id, 'studio_budget', skillDeltas)
      interviewReadiness = skillResult.interviewReadiness
    } catch { /* skill update must never crash the submit */ }
    res.json({ ...result, skillDeltas, interviewReadiness })
  } catch (e) {
    next(e)
  }
}

export async function report(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getBudgetReport(paramId(req.params.sessionId), req.user!.id)
    res.json(data)
  } catch (e) {
    next(e)
  }
}
