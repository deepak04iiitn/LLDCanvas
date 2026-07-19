import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'
import { authRateLimit } from '../middleware/rateLimit'

const router = Router()

router.post('/signup', authRateLimit, authController.signUp)
router.post('/login',  authRateLimit, authController.signIn)
router.post('/google',  authRateLimit, authController.google)
router.get('/me', requireAuth, authController.me)

export default router
