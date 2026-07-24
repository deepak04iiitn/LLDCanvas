import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { blogController } from '../controllers/blog.controller'

const router = Router()

// Public routes (no auth required)
router.get ('/',                      blogController.list)
router.get ('/categories',            blogController.categories)
router.get ('/tags',                  blogController.tags)
router.get ('/:slug',                 blogController.get)
router.get ('/:slug/comments',        blogController.listComments)

// Auth-required routes
router.post('/:slug/react',           requireAuth, blogController.react)
router.get ('/:slug/my-reaction',     requireAuth, blogController.myReaction)
router.post('/:slug/comments',        requireAuth, blogController.addComment)
router.patch('/comments/:id',         requireAuth, blogController.updateComment)
router.delete('/comments/:id',        requireAuth, blogController.deleteComment)
router.post('/comments/:id/report',   requireAuth, blogController.reportComment)

export default router
