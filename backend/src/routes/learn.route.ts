import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth'
import * as quiz from '../controllers/learn/quiz.controller'
import * as score from '../controllers/learn/score.controller'
import * as detective from '../controllers/learn/detective.controller'
import * as roguelike from '../controllers/learn/roguelike.controller'
import * as debugger_ from '../controllers/learn/debugger.controller'

const router = Router()

// ── Quiz ──────────────────────────────────────────────────────────────────────
router.get('/quiz/today', optionalAuth, quiz.getTodayQuiz)
router.post('/quiz/submit', requireAuth, quiz.submitQuiz)
router.get('/quiz/streak', requireAuth, quiz.getQuizStreak)
router.get('/quiz/leaderboard', optionalAuth, quiz.getLeaderboard)
router.get('/quiz/revisit', requireAuth, quiz.getRevisitBank)

// ── Score ─────────────────────────────────────────────────────────────────────
// history/trends MUST come before /:artifactId to avoid param collisions
router.get('/score/history', requireAuth, score.getScoreHistory)
router.get('/score/trends', requireAuth, score.getScoreTrends)
router.post('/score/:artifactId', requireAuth, score.runScore)
router.get('/score/config', requireAuth, score.getActiveConfig)

// ── Detective ─────────────────────────────────────────────────────────────────
/** Public browse — start/submit/history require auth. */
router.get('/detective', detective.listDetective)
// history MUST come before /:id to avoid param collision
router.get('/detective/history', requireAuth, detective.getAttemptHistory)
router.post('/detective/:id/start', requireAuth, detective.startDetective)
router.post('/detective/:id/submit', requireAuth, detective.submitDetective)

// ── Roguelike (new) ───────────────────────────────────────────────────────────
router.get('/roguelike/featured', roguelike.getFeaturedScenario)
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

// ── Debugger (code bugs) ──────────────────────────────────────────────────────
router.get('/debugger',                               debugger_.listChallenges)
// history BEFORE /:id to avoid param collision
router.get('/debugger/history',    requireAuth,        debugger_.getSolveHistory)
router.get('/debugger/:id',                            debugger_.getChallenge)
router.post('/debugger/:id/solve', requireAuth,        debugger_.recordSolve)

// ── Debug Lab — design bugs ───────────────────────────────────────────────────
router.get('/debuglab/design',                         debugger_.listDesignBugs)
router.get('/debuglab/design/:id',                     debugger_.getDesignBug)
router.post('/debuglab/design/:id/submit', requireAuth, debugger_.submitDesignBug)

export default router
