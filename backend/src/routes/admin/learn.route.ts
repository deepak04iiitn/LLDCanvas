import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth'
import * as quiz from '../../controllers/learn/quiz.controller'
import * as score from '../../controllers/learn/score.controller'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/quiz', quiz.adminListQuestions)
router.post('/quiz', quiz.adminCreateQuestion)
router.patch('/quiz/:id', quiz.adminUpdateQuestion)
router.delete('/quiz/:id', quiz.adminDeleteQuestion)

router.get('/score/config', score.adminGetConfig)
router.patch('/score/config', score.adminUpsertConfig)

export default router
