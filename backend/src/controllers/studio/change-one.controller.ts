import { Request, Response, NextFunction } from 'express'
import {
  getSession,
  listPublishedPacks,
  startSession,
  submitStructuralChallenge,
} from '../../services/studio/challenge-session.service'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function listChangeOnePacks(_req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await listPublishedPacks('change_one')
    res.json({ packs })
  } catch (e) { next(e) }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, 'change_one')
    res.status(201).json(session)
  } catch (e) { next(e) }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSession(paramId(req.params.sessionId), req.user!.id)
    res.json(data)
  } catch (e) { next(e) }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await submitStructuralChallenge(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.diagramData ?? {},
      ['change_one'],
    )
    res.json(result)
  } catch (e) { next(e) }
}
