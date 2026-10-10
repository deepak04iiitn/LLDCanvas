import { Request, Response, NextFunction } from 'express'
import {
  getEvolutionJourney,
  getSession,
  listPublishedPacks,
  saveEvolution,
  startSession,
  submitEvolutionStage,
} from '../../services/studio/challenge-session.service'
import type { EvolutionStageSubmission } from '../../services/studio/evolutionGrade'
import { applySkillDeltas } from '../../utils/skill-updater'
import { withChallengeLocks } from '../../utils/challenge-gate'

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

export async function listEvolutionPacks(req: Request, res: Response, next: NextFunction) {
  try {
    const packs = await listPublishedPacks('evolution')
    res.json({ packs: withChallengeLocks('evolution', req.user?.plan, packs) })
  } catch (e) {
    next(e)
  }
}

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, 'evolution', req.user!.plan)
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
    const result = await saveEvolution(
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
    const submission: EvolutionStageSubmission = {
      decision: req.body.decision === 'noop' ? 'noop' : 'change',
      pressures: Array.isArray(req.body.pressures) ? req.body.pressures : [],
      classify: req.body.classify ?? {},
      diagram: req.body.diagramData ?? req.body.diagram,
      why: Array.isArray(req.body.why) ? req.body.why : [],
      whyNote: typeof req.body.whyNote === 'string' ? req.body.whyNote : undefined,
      tradeoffsAck: Array.isArray(req.body.tradeoffsAck) ? req.body.tradeoffsAck : [],
      debtActions: Array.isArray(req.body.debtActions) ? req.body.debtActions : [],
    }
    const result = await submitEvolutionStage(
      paramId(req.params.sessionId),
      req.user!.id,
      submission,
    )
    const passed = !!result.grade?.accepted
    const skillDeltas: Record<string, number> = passed
      ? { tradeoffReasoning: 3, extensibility: 3, coupling: 1 }
      : { tradeoffReasoning: 1 }
    let interviewReadiness: number | undefined
    try {
      const skillResult = await applySkillDeltas(req.user!.id, 'studio_evolution', skillDeltas)
      interviewReadiness = skillResult.interviewReadiness
    } catch { /* skill update must never crash the submit */ }
    res.json({ ...result, skillDeltas, interviewReadiness })
  } catch (e) {
    next(e)
  }
}

export async function journey(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getEvolutionJourney(paramId(req.params.sessionId), req.user!.id)
    res.json(data)
  } catch (e) {
    next(e)
  }
}
