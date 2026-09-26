import { Request, Response, NextFunction } from 'express'
import {
  getSession,
  listPublishedPacks,
  saveChange,
  startSession,
  submitChange,
} from '../../services/studio/challenge-session.service'
import { applySkillDeltas } from '../../utils/skill-updater'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function listChangeOnePacks(_req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await listPublishedPacks('change_one')
    res.json({ packs })
  } catch (e) {
    next(e)
  }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, 'change_one')
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
    const result = await saveChange(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.diagramData ?? {},
      req.body.prediction ?? null,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await submitChange(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.diagramData ?? {},
      req.body.prediction ?? null,
    )
    const passed = !!(result.result as { accepted?: boolean })?.accepted
    const skillDeltas: Record<string, number> = passed
      ? { designThinking: 4, coupling: 3, extensibility: 2 }
      : { designThinking: 1 }
    let interviewReadiness: number | undefined
    try {
      const skillResult = await applySkillDeltas(req.user!.id, 'studio_change_one', skillDeltas)
      interviewReadiness = skillResult.interviewReadiness
    } catch { /* skill update must never crash the submit */ }
    res.json({ ...result, skillDeltas, interviewReadiness })
  } catch (e) {
    next(e)
  }
}
