import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { adminController } from '../controllers/admin.controller'
import {
  listFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  feedbackStats,
} from '../controllers/feedback.controller'

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
router.post('/problems',                      adminController.createProblem)
router.patch('/problems/:id',                 adminController.updateProblem)
router.patch('/problems/:id/toggle',          adminController.toggleProblem)
router.delete('/problems/:id',                adminController.deleteProblem)

// Revision notes
router.get('/revision-notes',                 adminController.listRevisionNotes)
router.post('/revision-notes',                adminController.createRevisionNote)
router.patch('/revision-notes/:id',           adminController.updateRevisionNote)
router.patch('/revision-notes/:id/toggle',    adminController.toggleRevisionNote)
router.delete('/revision-notes/:id',          adminController.deleteRevisionNote)

// Collaboration
router.get('/collab-invites',                 adminController.listCollabInvites)
router.patch('/collab-invites/:id/revoke',    adminController.revokeCollabInvite)
router.get('/comments',                       adminController.listComments)
router.delete('/comments/:id',                adminController.deleteComment)

// Code execution
router.get('/code/stats',                     adminController.getCodeStats)
router.get('/code/executions',                adminController.listCodeExecutions)
router.get('/code/executions/:userId/daily',  adminController.getUserCodeDaily)
router.get('/code/bans',                      adminController.listCodeBans)
router.patch('/code/bans/:userId',            adminController.toggleCodeBan)

// Billing & subscriptions
router.get('/billing/overview',               adminController.getBillingOverview)
router.get('/billing/subscriptions',          adminController.listSubscriptions)
router.get('/billing/revenue',                adminController.getRevenueStats)
router.patch('/billing/subscriptions/:id/plan', adminController.overridePlan)
router.post('/billing/subscriptions/:id/cancel', adminController.adminCancelSubscription)
router.post('/billing/subscriptions/manual',  adminController.createManualSubscription)

// Feedback & bug reports
router.get   ('/feedback/stats', feedbackStats)
router.get   ('/feedback',       listFeedback)
router.get   ('/feedback/:id',   getFeedback)
router.patch ('/feedback/:id',   updateFeedback)
router.delete('/feedback/:id',   deleteFeedback)

export default router
