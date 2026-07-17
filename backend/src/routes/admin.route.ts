import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { adminController } from '../controllers/admin.controller'

const router = Router()

router.use(requireAuth, requireAdmin)

// Overview + live analytics
router.get('/overview',                       adminController.getOverview)
router.get('/analytics',                      adminController.getAnalytics)
router.get('/feature-stats',                  adminController.getNewFeatureStats)

// Users
router.get('/users',                          adminController.listUsers)
router.get('/users/:id',                      adminController.getUser)
router.patch('/users/:id/block',              adminController.toggleBlock)
router.delete('/users/:id',                   adminController.deleteUser)

// Diagrams
router.get('/diagrams',                       adminController.listDiagrams)
router.delete('/diagrams/:id',                adminController.deleteDiagram)

// Sessions
router.get('/sessions',                       adminController.listSessions)
router.delete('/sessions/:id',                adminController.deleteSession)

// Problems
router.get('/problems',                       adminController.listProblems)
router.patch('/problems/:id/toggle',          adminController.toggleProblem)

// Revision notes
router.get('/revision-notes',                 adminController.listRevisionNotes)
router.patch('/revision-notes/:id/toggle',    adminController.toggleRevisionNote)

// Collaboration
router.get('/collab-invites',                 adminController.listCollabInvites)
router.patch('/collab-invites/:id/revoke',    adminController.revokeCollabInvite)
router.get('/comments',                       adminController.listComments)
router.delete('/comments/:id',                adminController.deleteComment)

export default router
