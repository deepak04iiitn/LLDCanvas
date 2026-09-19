import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { adminController } from '../controllers/admin.controller'
import {
  listFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  bulkDeleteFeedback,
  feedbackStats,
} from '../controllers/feedback.controller'
import {
  listTestimonials,
  updateTestimonial,
  deleteTestimonial,
  bulkDeleteTestimonials,
  testimonialStats,
} from '../controllers/testimonial.controller'
import { adminBlogController } from '../controllers/blog.controller'

const router = Router()

router.use(requireAuth, requireAdmin)

// Overview + live analytics
router.get('/overview',                       adminController.getOverview)
router.get('/analytics',                      adminController.getAnalytics)
router.get('/feature-stats',                  adminController.getNewFeatureStats)

// Users
router.get('/users',                          adminController.listUsers)
router.post('/users/bulk-delete',             adminController.bulkDeleteUsers)
router.get('/users/:id',                      adminController.getUser)
router.patch('/users/:id/block',              adminController.toggleBlock)
router.delete('/users/:id',                   adminController.deleteUser)

// Diagrams
router.get('/diagrams',                       adminController.listDiagrams)
router.post('/diagrams/bulk-delete',          adminController.bulkDeleteDiagrams)
router.delete('/diagrams/:id',                adminController.deleteDiagram)

// Sessions
router.get('/sessions',                       adminController.listSessions)
router.post('/sessions/bulk-delete',          adminController.bulkDeleteSessions)
router.delete('/sessions/:id',                adminController.deleteSession)

// Problems
router.get('/problems',                       adminController.listProblems)
router.post('/problems',                      adminController.createProblem)
router.post('/problems/bulk-delete',          adminController.bulkDeleteProblems)
router.patch('/problems/:id',                 adminController.updateProblem)
router.patch('/problems/:id/toggle',          adminController.toggleProblem)
router.delete('/problems/:id',                adminController.deleteProblem)

// Revision notes
router.get('/revision-notes',                 adminController.listRevisionNotes)
router.post('/revision-notes',                adminController.createRevisionNote)
router.post('/revision-notes/bulk-delete',    adminController.bulkDeleteRevisionNotes)
router.patch('/revision-notes/:id',           adminController.updateRevisionNote)
router.patch('/revision-notes/:id/toggle',    adminController.toggleRevisionNote)
router.delete('/revision-notes/:id',          adminController.deleteRevisionNote)

// Collaboration
router.get('/collab-invites',                 adminController.listCollabInvites)
router.post('/collab-invites/bulk-delete',    adminController.bulkDeleteCollabInvites)
router.patch('/collab-invites/:id/revoke',    adminController.revokeCollabInvite)
router.get('/comments',                       adminController.listComments)
router.post('/comments/bulk-delete',          adminController.bulkDeleteComments)
router.delete('/comments/:id',                adminController.deleteComment)

// Code execution
router.get('/code/stats',                     adminController.getCodeStats)
router.get('/code/executions',                adminController.listCodeExecutions)
router.post('/code/executions/bulk-delete',   adminController.bulkDeleteCodeExecutions)
router.get('/code/executions/:userId/daily',  adminController.getUserCodeDaily)
router.get('/code/bans',                      adminController.listCodeBans)
router.post('/code/bans/bulk-delete',         adminController.bulkDeleteCodeBans)
router.patch('/code/bans/:userId',            adminController.toggleCodeBan)

// Billing & subscriptions
router.get('/billing/overview',               adminController.getBillingOverview)
router.get('/billing/subscriptions',          adminController.listSubscriptions)
router.get('/billing/revenue',                adminController.getRevenueStats)
router.patch('/billing/subscriptions/:id/plan', adminController.overridePlan)
router.post('/billing/subscriptions/:id/cancel', adminController.adminCancelSubscription)
router.post('/billing/subscriptions/bulk-delete', adminController.bulkDeleteSubscriptions)
router.post('/billing/subscriptions/manual',  adminController.createManualSubscription)

// Feedback & bug reports
router.get   ('/feedback/stats', feedbackStats)
router.get   ('/feedback',       listFeedback)
router.post  ('/feedback/bulk-delete', bulkDeleteFeedback)
router.get   ('/feedback/:id',   getFeedback)
router.patch ('/feedback/:id',   updateFeedback)
router.delete('/feedback/:id',   deleteFeedback)

// Testimonials
router.get   ('/testimonials/stats', testimonialStats)
router.get   ('/testimonials',       listTestimonials)
router.post  ('/testimonials/bulk-delete', bulkDeleteTestimonials)
router.patch ('/testimonials/:id',   updateTestimonial)
router.delete('/testimonials/:id',   deleteTestimonial)

// Blog management
router.get   ('/blog/analytics',       adminBlogController.analytics)
router.get   ('/blog/comments',        adminBlogController.listComments)
router.delete('/blog/comments/:id',    adminBlogController.deleteComment)
router.get   ('/blog',                 adminBlogController.list)
router.post  ('/blog',                 adminBlogController.create)
router.post  ('/blog/bulk-delete',     adminBlogController.bulkDelete)
router.get   ('/blog/:id',             adminBlogController.get)
router.patch ('/blog/:id',             adminBlogController.update)
router.patch ('/blog/:id/publish',     adminBlogController.publish)
router.patch ('/blog/:id/unpublish',   adminBlogController.unpublish)
router.post  ('/blog/:id/duplicate',   adminBlogController.duplicate)
router.delete('/blog/:id',             adminBlogController.delete)

export default router
