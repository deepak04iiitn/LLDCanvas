import { Request, Response, NextFunction } from 'express'
import {
  getSession,
  listPublishedPacks,
  saveRefactor,
  startSession,
  submitRefactor,
} from '../../services/studio/challenge-session.service'
import { applySkillDeltas } from '../../utils/skill-updater'
import { withChallengeLocks } from '../../utils/challenge-gate'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function listRefactorPacks(req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await listPublishedPacks('refactor')
    res.json({ packs: withChallengeLocks('refactor', req.user?.plan, packs) })
  } catch (e) {
    next(e)
  }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, 'refactor', req.user!.plan)
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
    const result = await saveRefactor(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.diagramData ?? {},
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await submitRefactor(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.diagramData ?? {},
    )
    const passed = !!(result.result as { accepted?: boolean })?.accepted
    const skillDeltas: Record<string, number> = passed
      ? { coupling: 4, cohesion: 4, extensibility: 3, responsibilities: 2 }
      : { coupling: 1 }
    let interviewReadiness: number | undefined
    try {
      const skillResult = await applySkillDeltas(req.user!.id, 'studio_refactor', skillDeltas)
      interviewReadiness = skillResult.interviewReadiness
    } catch { /* skill update must never crash the submit */ }
    res.json({ ...result, skillDeltas, interviewReadiness })
  } catch (e) {
    next(e)
  }
}
