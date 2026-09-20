import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as c from '../controllers/artifact/artifact.controller'

const router = Router()

router.use(requireAuth)

router.get('/:id', c.getArtifact)
router.patch('/:id', c.patchArtifact)

router.post('/:id/versions', c.postVersion)
router.get('/:id/versions', c.getVersions)
router.get('/:id/diff', c.getDiff)

router.post('/:id/replay/events', c.postReplayEvents)

router.get('/:id/decisions', c.listDecisions)
router.post('/:id/decisions', c.createDecision)
router.patch('/:id/decisions/:decisionId', c.updateDecision)
router.delete('/:id/decisions/:decisionId', c.deleteDecision)

router.post('/:id/score', c.postScore)
router.get('/:id/analysis/node/:elementId', c.analyzeNode)
router.get('/:id/dependency-graph', c.getDependencyGraph)
router.post('/:id/story', c.postStory)
router.post('/:id/budget', c.postBudget)

export default router
