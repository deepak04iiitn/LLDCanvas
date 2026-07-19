import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { problemsController } from '../controllers/problems.controller'
import { problemPostsController } from '../controllers/problem-posts.controller'

const router = Router()
router.use(requireAuth)

// Problem listing + detail
router.get('/',                           problemsController.list)
router.get('/categories',                 problemsController.categories)
router.get('/stats/me',                   problemsController.myStats)
router.get('/:slug',                      problemsController.getOne)
router.get('/:slug/hints',                problemsController.getHints)

// Solutions
router.get('/:slug/my-solution',          problemsController.getMySolution)
router.post('/:slug/solutions',           problemsController.startSolution)
router.patch('/:slug/solutions/submit',   problemsController.submitSolution)
router.get('/:slug/solutions',            problemsController.listSolutions)

// Community discussions
router.get ('/:slug/posts',                              problemPostsController.list)
router.post('/:slug/posts',                              problemPostsController.create)
router.patch('/:slug/posts/:postId/upvote',              problemPostsController.toggleUpvote)
router.post ('/:slug/posts/:postId/replies',             problemPostsController.addReply)
router.delete('/:slug/posts/:postId',                    problemPostsController.deletePost)
router.delete('/:slug/posts/:postId/replies/:replyId',   problemPostsController.deleteReply)

export default router
