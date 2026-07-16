import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { shareController } from '../controllers/share.controller'

const router = Router()

// All share routes require authentication
router.use(requireAuth)

// ── Check a share-link token (called by the editor on page load when ?share= is present)
router.get('/:token', shareController.checkAccess)

export default router
