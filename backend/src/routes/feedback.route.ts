import { Router } from 'express'
import { optionalAuth } from '../middleware/auth'
import { submitFeedback } from '../controllers/feedback.controller'

const router = Router()

// Public (auth optional — logged-in users get their info pre-filled)
router.post('/', optionalAuth, submitFeedback)

export default router
