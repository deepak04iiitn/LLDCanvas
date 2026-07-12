import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { exportController } from '../controllers/export.controller'

const router = Router()

router.use(requireAuth)

router.post('/:id/export', exportController.exportDiagram)

export default router
