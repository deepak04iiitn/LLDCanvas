import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth'

import * as quiz      from '../../controllers/learn/quiz.controller'
import * as score     from '../../controllers/learn/score.controller'
import * as detective from '../../controllers/admin/learn/detective.controller'
import * as debugger_ from '../../controllers/admin/learn/debugger.controller'
import * as roguelike from '../../controllers/admin/learn/roguelike.controller'

const router = Router()
router.use(requireAuth, requireAdmin)

// ─── Daily Quiz ───────────────────────────────────────────────────────────────

router.get   ('/quiz',              quiz.adminListQuestions)
router.post  ('/quiz',              quiz.adminCreateQuestion)
router.patch ('/quiz/:id',          quiz.adminUpdateQuestion)
router.delete('/quiz/:id',          quiz.adminDeleteQuestion)

// ─── Score config ─────────────────────────────────────────────────────────────

router.get   ('/score/config',      score.adminGetConfig)
router.patch ('/score/config',      score.adminUpsertConfig)

// ─── Pattern Detective ────────────────────────────────────────────────────────

router.get   ('/detective/stats',              detective.adminGetStats)
router.get   ('/detective',                    detective.adminListScenarios)
router.post  ('/detective',                    detective.adminCreateScenario)
router.post  ('/detective/bulk-delete',        detective.adminBulkDeleteScenarios)
router.patch ('/detective/:id',                detective.adminUpdateScenario)
router.post  ('/detective/:id/publish',        detective.adminPublishScenario)
router.delete('/detective/:id',                detective.adminDeleteScenario)

// ─── Debug Lab ────────────────────────────────────────────────────────────────

router.get   ('/debugger/stats',               debugger_.adminGetStats)
router.get   ('/debugger',                     debugger_.adminListChallenges)
router.post  ('/debugger',                     debugger_.adminCreateChallenge)
router.post  ('/debugger/bulk-delete',         debugger_.adminBulkDeleteChallenges)
router.patch ('/debugger/:id',                 debugger_.adminUpdateChallenge)
router.post  ('/debugger/:id/publish',         debugger_.adminPublishChallenge)
router.delete('/debugger/:id',                 debugger_.adminDeleteChallenge)

// ─── LLD Roguelike ────────────────────────────────────────────────────────────

router.get   ('/roguelike/stats',              roguelike.adminGetStats)
router.get   ('/roguelike/runs',               roguelike.adminListRuns)
router.get   ('/roguelike/scenarios',          roguelike.adminListScenarios)
router.post  ('/roguelike/scenarios',          roguelike.adminCreateScenario)
router.post  ('/roguelike/scenarios/bulk-delete', roguelike.adminBulkDeleteScenarios)
router.get   ('/roguelike/scenarios/:id',      roguelike.adminGetScenario)
router.patch ('/roguelike/scenarios/:id',      roguelike.adminUpdateScenario)
router.post  ('/roguelike/scenarios/:id/publish', roguelike.adminPublishScenario)
router.delete('/roguelike/scenarios/:id',      roguelike.adminDeleteScenario)

export default router
