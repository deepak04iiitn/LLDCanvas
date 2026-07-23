import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { interviewSyncRateLimit } from '../middleware/rateLimit'
import {
  createSession,
  listSessions,
  getSession,
  updateSession,
  deleteSession,
} from '../controllers/interview.controller'

const router = Router()

router.use(requireAuth)

router.post('/',        createSession)
router.get('/',         listSessions)
router.get('/:id',      getSession)
router.patch('/:id',    interviewSyncRateLimit, updateSession)
router.delete('/:id',   deleteSession)

export default router
