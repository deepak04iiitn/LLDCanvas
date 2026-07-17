import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { collabController } from '../controllers/collab.controller'

const router = Router()

router.use(requireAuth)

// Diagram-level invite management (owner only)
router.get('/:diagramId/invites',          collabController.list)
router.post('/:diagramId/invite',          collabController.invite)
router.patch('/:diagramId/:inviteId/role', collabController.updateRole)
router.delete('/:diagramId/:inviteId',     collabController.revoke)
router.patch('/:diagramId/link',           collabController.updateLink)

// Accept / join
router.post('/accept/:token',              collabController.accept)
router.post('/join/:token',                collabController.joinLink)

// Access check
router.get('/my-access/:diagramId',        collabController.myAccess)

// Comments (REST fallback)
router.get('/comments/:diagramId',         collabController.listComments)

export default router
