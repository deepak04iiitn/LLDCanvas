import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as c from '../controllers/artifact/artifact.controller'

const router = Router()

router.use(requireAuth)

router.get('/:id', c.getArtifact)
router.patch('/:id', c.patchArtifact)

router.post('/:id/versions', c.postVersion)
router.get('/:id/versions', c.getVersions)

router.post('/:id/replay/events', c.postReplayEvents)
router.get('/:id/replay', c.getReplay)

router.post('/:id/score', c.postScore)
router.get('/:id/analysis/node/:elementId', c.analyzeNode)
router.get('/:id/dependency-graph', c.getDependencyGraph)
router.post('/:id/budget', c.postBudget)

export default router
