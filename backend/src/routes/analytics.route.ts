import { Router } from 'express'
import { analyticsController } from '../controllers/analytics.controller'

const router = Router()

// Public — no auth required (anonymous users are tracked too)
router.post('/heartbeat', analyticsController.heartbeat)

export default router
