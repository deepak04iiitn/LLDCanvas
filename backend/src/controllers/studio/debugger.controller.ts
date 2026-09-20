import { Request, Response, NextFunction } from 'express'
import {
  diagnoseDebugger,
  getSession,
  hintDebugger,
  listPublishedPacks,
  markDebuggerIssue,
  repairDebugger,
  revealDebugger,
  startSession,
  submitDebugger,
} from '../../services/studio/challenge-session.service'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function listDebuggerPacks(_req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await listPublishedPacks('debugger')
    res.json({ packs })
  } catch (e) { next(e) }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, 'debugger')
    res.status(201).json(session)
  } catch (e) { next(e) }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSession(paramId(req.params.sessionId), req.user!.id)
    res.json(data)
  } catch (e) { next(e) }
}

export async function mark(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await markDebuggerIssue(paramId(req.params.sessionId), req.user!.id, {
      elementId: String(req.body.elementId ?? ''),
      category: String(req.body.category ?? 'Other'),
      why: String(req.body.why ?? ''),
    })
    res.json(result)
  } catch (e) { next(e) }
}

export async function diagnose(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await diagnoseDebugger(paramId(req.params.sessionId), req.user!.id)
    res.json(result)
  } catch (e) { next(e) }
}

export async function hint(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await hintDebugger(
      paramId(req.params.sessionId),
      req.user!.id,
      req.body.elementId ? String(req.body.elementId) : undefined,
    )
    res.json(result)
  } catch (e) { next(e) }
}

export async function repair(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repairDebugger(
      paramId(req.params.sessionId),
      req.user!.id,
      (req.body.diagramData ?? {}) as Record<string, unknown>,
    )
    res.json(result)
  } catch (e) { next(e) }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const marks = Array.isArray(req.body.marks) ? req.body.marks : []
    const result = await submitDebugger(paramId(req.params.sessionId), req.user!.id, marks)
    res.json(result)
  } catch (e) { next(e) }
}

export async function reveal(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await revealDebugger(paramId(req.params.sessionId), req.user!.id)
    res.json(result)
  } catch (e) { next(e) }
}
