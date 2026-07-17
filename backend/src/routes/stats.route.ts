import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getStats, syncStats, getAdvancedStats } from '../controllers/stats.controller'

const router = Router()

router.use(requireAuth)

router.get('/',          getStats)
router.get('/advanced',  getAdvancedStats)
router.post('/sync',     syncStats)

export default router
