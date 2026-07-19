import { Request, Response, NextFunction } from 'express'
import { Problem } from '../models/problem.model'
import { ProblemPost } from '../models/problem-post.model'
import { createError } from '../middleware/error'

export const problemPostsController = {

  // GET /problems/:slug/posts?page=1&sort=newest&type=
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!problem) throw createError('Problem not found', 404)

      const page  = Math.max(1, Number(req.query.page) || 1)
      const limit = 15
      const sort  = req.query.sort === 'oldest' ? 1 : -1
      const type  = typeof req.query.type === 'string' && req.query.type ? req.query.type : null

      const match: Record<string, unknown> = { problemId: problem._id }
      if (type) match.type = type

      const [total, posts] = await Promise.all([
        ProblemPost.countDocuments(match),
        ProblemPost.find(match)
          .sort({ createdAt: sort })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ])

      const userId = req.user!.id
      const enriched = posts.map(p => ({
        ...p,
        upvoteCount:  p.upvotes.length,
        hasUpvoted:   p.upvotes.includes(userId),
        replyCount:   p.replies.length,
        isOwn:        p.authorId === userId,
      }))

      res.json({ posts: enriched, total, page, totalPages: Math.ceil(total / limit) })
    } catch (err) { next(err) }
  },

  // POST /problems/:slug/posts
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await Problem.findOne({ slug: req.params.slug, isActive: true }).select('_id').lean()
      if (!problem) throw createError('Problem not found', 404)

      const { title, content, code, codeLanguage, type } = req.body as {
        title: string; content: string
        code?: string; codeLanguage?: string
        type?: 'question' | 'discussion' | 'solution'
      }

      if (!title?.trim())   throw createError('Title is required', 400)
      if (!content?.trim()) throw createError('Content is required', 400)
      if (title.length > 200) throw createError('Title too long (max 200 chars)', 400)

      const post = await ProblemPost.create({
        problemId:    problem._id,
        authorId:     req.user!.id,
        authorName:   req.user!.name ?? 'Anonymous',
        authorImage:  (req.user as { image?: string }).image ?? null,
        title:        title.trim(),
        content:      content.trim(),
        code:         code?.trim() || null,
        codeLanguage: codeLanguage || null,
        type:         ['question', 'discussion', 'solution'].includes(type ?? '') ? type : 'discussion',
        upvotes:      [],
        replies:      [],
      })

      res.status(201).json({
        post: {
          ...post.toObject(),
          upvoteCount: 0,
          hasUpvoted: false,
          replyCount: 0,
          isOwn: true,
        },
      })
    } catch (err) { next(err) }
  },

  // PATCH /problems/:slug/posts/:postId/upvote
  toggleUpvote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await ProblemPost.findById(req.params.postId)
      if (!post) throw createError('Post not found', 404)

      const userId   = req.user!.id
      const hasVoted = post.upvotes.includes(userId)

      if (hasVoted) {
        post.upvotes = post.upvotes.filter(id => id !== userId)
      } else {
        post.upvotes.push(userId)
      }
      await post.save()

      res.json({ upvoteCount: post.upvotes.length, hasUpvoted: !hasVoted })
    } catch (err) { next(err) }
  },

  // POST /problems/:slug/posts/:postId/replies
  addReply: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await ProblemPost.findById(req.params.postId)
      if (!post) throw createError('Post not found', 404)

      const { content, code, codeLanguage } = req.body as {
        content: string; code?: string; codeLanguage?: string
      }
      if (!content?.trim()) throw createError('Reply content is required', 400)

      const reply = {
        authorId:     req.user!.id,
        authorName:   req.user!.name ?? 'Anonymous',
        authorImage:  (req.user as { image?: string }).image ?? null,
        content:      content.trim(),
        code:         code?.trim() || null,
        codeLanguage: codeLanguage || null,
      }

      post.replies.push(reply as never)
      await post.save()

      const added = post.replies[post.replies.length - 1]
      res.status(201).json({ reply: added })
    } catch (err) { next(err) }
  },

  // DELETE /problems/:slug/posts/:postId
  deletePost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await ProblemPost.findById(req.params.postId)
      if (!post) throw createError('Post not found', 404)

      const isAdmin = (req.user as { isAdmin?: boolean }).isAdmin
      if (post.authorId !== req.user!.id && !isAdmin) {
        throw createError('Not authorised', 403)
      }

      await post.deleteOne()
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  // DELETE /problems/:slug/posts/:postId/replies/:replyId
  deleteReply: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await ProblemPost.findById(req.params.postId)
      if (!post) throw createError('Post not found', 404)

      const replyIdx = post.replies.findIndex(r => r._id.toString() === req.params.replyId)
      if (replyIdx === -1) throw createError('Reply not found', 404)

      const reply = post.replies[replyIdx]
      const isAdmin = (req.user as { isAdmin?: boolean }).isAdmin
      if (reply.authorId !== req.user!.id && !isAdmin) {
        throw createError('Not authorised', 403)
      }

      post.replies.splice(replyIdx, 1)
      await post.save()
      res.json({ ok: true })
    } catch (err) { next(err) }
  },
}
