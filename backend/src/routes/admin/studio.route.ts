import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth'
import * as c from '../../controllers/admin/studio/challenge-pack.controller'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/packs', c.adminListPacks)
router.post('/packs', c.adminCreatePack)
router.patch('/packs/:id', c.adminUpdatePack)
router.delete('/packs/:id', c.adminDeletePack)
router.post('/packs/:id/publish', c.adminPublishPack)
router.post('/packs/bulk-delete', c.adminBulkDeletePacks)

export default router
