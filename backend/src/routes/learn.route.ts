import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as quiz from '../controllers/learn/quiz.controller'
import * as score from '../controllers/learn/score.controller'
import * as detective from '../controllers/learn/detective.controller'
import * as mashup from '../controllers/learn/mashup.controller'
import * as roguelike from '../controllers/learn/roguelike.controller'
import * as umlCode from '../controllers/learn/uml-code.controller'

const router = Router()

router.get('/quiz/today', requireAuth, quiz.getTodayQuiz)
router.post('/quiz/submit', requireAuth, quiz.submitQuiz)

router.post('/score/:artifactId', requireAuth, score.runScore)
router.get('/score/config', requireAuth, score.getActiveConfig)

/** Public browse — start still requires auth. */
router.get('/detective', detective.listDetective)
router.post('/detective/:id/start', requireAuth, detective.startDetective)

router.get('/mashup', mashup.listMashup)
router.post('/mashup/:id/start', requireAuth, mashup.startMashup)

router.post('/roguelike/start', requireAuth, roguelike.startRoguelike)
router.get('/roguelike/:runId', requireAuth, roguelike.getRoguelike)

router.post('/uml-code/generate', requireAuth, umlCode.generateUmlCode)

export default router
