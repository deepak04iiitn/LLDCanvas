import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as skills from '../controllers/skills.controller'

const router = Router()
router.post('/update', requireAuth, skills.updateSkills)
router.get('/readiness', requireAuth, skills.getReadinessScore)
export default router
