import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as quiz from '../controllers/learn/quiz.controller'
import * as score from '../controllers/learn/score.controller'
import * as detective from '../controllers/learn/detective.controller'
import * as roguelike from '../controllers/learn/roguelike.controller'
import * as debugger_ from '../controllers/learn/debugger.controller'

const router = Router()

// ── Quiz ──────────────────────────────────────────────────────────────────────
router.get('/quiz/today', requireAuth, quiz.getTodayQuiz)
router.post('/quiz/submit', requireAuth, quiz.submitQuiz)

// ── Score ─────────────────────────────────────────────────────────────────────
router.post('/score/:artifactId', requireAuth, score.runScore)
router.get('/score/config', requireAuth, score.getActiveConfig)

// ── Detective ─────────────────────────────────────────────────────────────────
/** Public browse — start still requires auth. */
router.get('/detective', detective.listDetective)
router.post('/detective/:id/start', requireAuth, detective.startDetective)

// ── Roguelike (new) ───────────────────────────────────────────────────────────
router.get('/roguelike/scenarios', roguelike.listScenarios)
router.get('/roguelike/scenarios/:slug', roguelike.getScenario)

router.post('/roguelike/runs', requireAuth, roguelike.startRun)
router.get('/roguelike/runs', requireAuth, roguelike.listRuns)
router.get('/roguelike/runs/:runId', requireAuth, roguelike.getRun)
router.post('/roguelike/runs/:runId/stage', requireAuth, roguelike.submitStage)
router.post('/roguelike/runs/:runId/checkpoint', requireAuth, roguelike.restoreCheckpoint)
router.post('/roguelike/runs/:runId/end', requireAuth, roguelike.endRun)

// ── Legacy roguelike (backward-compat) ────────────────────────────────────────
router.post('/roguelike/start', requireAuth, roguelike.startRun)
router.get('/roguelike/:runId', requireAuth, roguelike.getRun)

// ── Debugger ──────────────────────────────────────────────────────────────────
router.get('/debugger', debugger_.listChallenges)
router.get('/debugger/:id', debugger_.getChallenge)
router.post('/debugger/:id/solve', requireAuth, debugger_.recordSolve)

export default router
