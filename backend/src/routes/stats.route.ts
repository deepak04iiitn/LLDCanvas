import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getStats, syncStats } from '../controllers/stats.controller'

const router = Router()

router.use(requireAuth)

router.get('/',       getStats)
router.post('/sync',  syncStats)

export default router
