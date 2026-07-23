import { Router } from 'express'
import { analyticsController } from '../controllers/analytics.controller'
import { heartbeatRateLimit } from '../middleware/rateLimit'

const router = Router()

// Public — no auth required (anonymous users are tracked too)
router.post('/heartbeat', heartbeatRateLimit, analyticsController.heartbeat)

export default router
