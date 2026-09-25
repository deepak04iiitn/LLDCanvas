import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import type { ChallengePackType } from '../models/studio/challenge-pack.model'
import {
  getSession,
  listPublishedPacks,
  saveChange,
  saveEvolution,
  startSession,
  submitChange,
  submitDebugger,
  submitEvolutionStage,
  submitStructuralChallenge,
  getEvolutionJourney,
} from '../services/studio/challenge-session.service'
import * as debuggerCtrl from '../controllers/studio/debugger.controller'
import * as refactorCtrl from '../controllers/studio/refactor.controller'
import * as changeOneCtrl from '../controllers/studio/change-one.controller'
import * as evolutionCtrl from '../controllers/studio/evolution.controller'

const router = Router()

function paramId(id: string | string[]) {
  return Array.isArray(id) ? id[0] : id
}

/** Public — browse published packs without signing in. */
router.get('/packs', async (req, res, next) => {
  try {
    const type = req.query.type as ChallengePackType | undefined
    const packs = await listPublishedPacks(type)
    res.json({ packs })
  } catch (e) {
    next(e)
  }
})

router.get('/debugger/packs', debuggerCtrl.listDebuggerPacks)
router.get('/refactor/packs', refactorCtrl.listRefactorPacks)
router.get('/change-one/packs', changeOneCtrl.listChangeOnePacks)
router.get('/evolution/packs', evolutionCtrl.listEvolutionPacks)

/** Auth required for sessions / attempts. */
router.post('/start', requireAuth, async (req, res, next) => {
  try {
    const type = String(req.body.type ?? 'debugger') as ChallengePackType
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, type)
    res.status(201).json(session)
  } catch (e) {
    next(e)
  }
})

/** Alias: open by pack slug (resume in-progress or create). */
router.post('/open', requireAuth, async (req, res, next) => {
  try {
    const type = String(req.body.type ?? 'debugger') as ChallengePackType
    const packId = String(req.body.packId ?? req.body.slug ?? '')
    const session = await startSession(req.user!.id, packId, type)
    res.status(201).json(session)
  } catch (e) {
    next(e)
  }
})

router.get('/attempts/:attemptId', requireAuth, async (req, res, next) => {
  try {
    const data = await getSession(paramId(req.params.attemptId), req.user!.id)
    res.json(data)
  } catch (e) {
    next(e)
  }
})

router.post('/debugger/:attemptId/submit', requireAuth, async (req, res, next) => {
  try {
    const marks = Array.isArray(req.body.marks) ? req.body.marks : []
    const result = await submitDebugger(paramId(req.params.attemptId), req.user!.id, marks)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

router.post('/refactor/:attemptId/submit', requireAuth, async (req, res, next) => {
  try {
    const result = await submitStructuralChallenge(
      paramId(req.params.attemptId),
      req.user!.id,
      req.body.diagramData ?? {},
      ['refactor'],
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

router.post('/change/:attemptId/submit', requireAuth, async (req, res, next) => {
  try {
    const result = await submitChange(
      paramId(req.params.attemptId),
      req.user!.id,
      req.body.diagramData ?? {},
      req.body.prediction ?? null,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

router.post('/change/:attemptId/save', requireAuth, async (req, res, next) => {
  try {
    const result = await saveChange(
      paramId(req.params.attemptId),
      req.user!.id,
      req.body.diagramData ?? {},
      req.body.prediction ?? null,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

router.post('/evolution/:attemptId/save', requireAuth, async (req, res, next) => {
  try {
    const result = await saveEvolution(
      paramId(req.params.attemptId),
      req.user!.id,
      req.body.diagramData ?? {},
      req.body.draft ?? null,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

router.post('/evolution/:attemptId/submit-stage', requireAuth, async (req, res, next) => {
  try {
    const result = await submitEvolutionStage(paramId(req.params.attemptId), req.user!.id, {
      decision: req.body.decision === 'noop' ? 'noop' : 'change',
      pressures: Array.isArray(req.body.pressures) ? req.body.pressures : [],
      classify: req.body.classify ?? {},
      diagram: req.body.diagramData ?? req.body.diagram,
      why: Array.isArray(req.body.why) ? req.body.why : [],
      whyNote: typeof req.body.whyNote === 'string' ? req.body.whyNote : undefined,
      tradeoffsAck: Array.isArray(req.body.tradeoffsAck) ? req.body.tradeoffsAck : [],
      debtActions: Array.isArray(req.body.debtActions) ? req.body.debtActions : [],
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
})

router.get('/evolution/:attemptId/journey', requireAuth, async (req, res, next) => {
  try {
    const data = await getEvolutionJourney(paramId(req.params.attemptId), req.user!.id)
    res.json(data)
  } catch (e) {
    next(e)
  }
})

router.post('/evolution/start', requireAuth, evolutionCtrl.start)
router.get('/evolution/:sessionId', requireAuth, evolutionCtrl.get)

// Type-specific aliases (sessionId = attemptId)
router.post('/debugger/start', requireAuth, debuggerCtrl.start)
router.get('/debugger/:sessionId', requireAuth, debuggerCtrl.get)
router.post('/debugger/:sessionId/mark', requireAuth, debuggerCtrl.mark)
router.post('/debugger/:sessionId/diagnose', requireAuth, debuggerCtrl.diagnose)
router.post('/debugger/:sessionId/hint', requireAuth, debuggerCtrl.hint)
router.post('/debugger/:sessionId/repair', requireAuth, debuggerCtrl.repair)
router.post('/debugger/:sessionId/submit', requireAuth, debuggerCtrl.submit)
router.get('/debugger/:sessionId/reveal', requireAuth, debuggerCtrl.reveal)

router.post('/refactor/start', requireAuth, refactorCtrl.start)
router.get('/refactor/:sessionId', requireAuth, refactorCtrl.get)
router.post('/refactor/:sessionId/save', requireAuth, refactorCtrl.save)
router.post('/refactor/:sessionId/submit', requireAuth, refactorCtrl.submit)

router.post('/change-one/start', requireAuth, changeOneCtrl.start)
router.get('/change-one/:sessionId', requireAuth, changeOneCtrl.get)
router.post('/change-one/:sessionId/save', requireAuth, changeOneCtrl.save)
router.post('/change-one/:sessionId/submit', requireAuth, changeOneCtrl.submit)

export default router
