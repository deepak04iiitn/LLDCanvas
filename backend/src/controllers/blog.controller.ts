import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Blog } from '../models/blog.model'
import { BlogComment } from '../models/blog-comment.model'
import { BlogReaction } from '../models/blog-reaction.model'
import { BLOG_BLOCK_TYPES } from '../types/blog-content'
import { calcReadingTime, buildTocAndIds } from '../utils/blog-content'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const blogBlockSchema = z.object({ type: z.enum(BLOG_BLOCK_TYPES) }).passthrough()
const blogContentSchema = z.array(blogBlockSchema)

/** Validates + normalises req.body.content in place, computing toc/readingTime. Returns an error message, or null if OK. */
function prepareContent(data: Record<string, unknown>): string | null {
  const parsed = blogContentSchema.safeParse(data.content)
  if (!parsed.success) return 'Invalid content: expected an array of typed blocks'
  const { blocks, toc } = buildTocAndIds(parsed.data as never)
  data.content = blocks
  data.toc = toc
  data.readingTime = calcReadingTime(blocks as never)
  return null
}

const PUBLIC_FIELDS = {
  content: 0,          // excluded from list — heavy field
}

const LIST_SELECT = 'slug title subtitle excerpt coverImage author category tags status publishedAt isFeatured readingTime views likes dislikes seo.metaTitle seo.metaDescription relatedSlugs'

const COMMENTS_PAGE_SIZE = 8
const REPLIES_PAGE_SIZE  = 3

// ─── Public endpoints ─────────────────────────────────────────────────────────

export const blogController = {

  /** GET /blog  — public listing with filters, sorting, pagination */
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        category, tag, q,
        sort = 'latest',
        page = '1',
        limit = '12',
        featured,
      } = req.query as Record<string, string>

      const pageNum  = Math.max(1, parseInt(page)  || 1)
      const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12))
      const skip     = (pageNum - 1) * limitNum

      const filter: Record<string, unknown> = { status: 'published' }
      if (category)  filter.category = category
      if (tag)       filter.tags = tag
      if (featured === 'true') filter.isFeatured = true
      if (q) {
        filter.$text = { $search: q }
      }

      const sortMap: Record<string, Record<string, 1 | -1>> = {
        latest:   { publishedAt: -1 },
        popular:  { views: -1 },
        liked:    { likes: -1 },
        trending: { views: -1, likes: -1 },
      }
      const sortObj = sortMap[sort] ?? sortMap.latest

      const [blogs, total] = await Promise.all([
        Blog.find(filter)
          .select(LIST_SELECT)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Blog.countDocuments(filter),
      ])

      res.json({ blogs, total, page: pageNum, pages: Math.ceil(total / limitNum) })
    } catch (err) { next(err) }
  },

  /** GET /blog/categories  — list distinct categories with counts */
  categories: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const agg = await Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      res.json(agg.map((a: { _id: string; count: number }) => ({ category: a._id, count: a.count })))
    } catch (err) { next(err) }
  },

  /** GET /blog/tags  — list popular tags */
  tags: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const agg = await Blog.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
      ])
      res.json(agg.map((a: { _id: string; count: number }) => ({ tag: a._id, count: a.count })))
    } catch (err) { next(err) }
  },

  /** GET /blog/:slug  — full blog detail + increment view */
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await Blog.findOneAndUpdate(
        { slug: req.params.slug, status: 'published' },
        { $inc: { views: 1 } },
        { new: true },
      ).lean()
      if (!blog) { res.status(404).json({ error: 'Blog not found' }); return }

      // Fetch related blogs (lightweight)
      const related = blog.relatedSlugs?.length
        ? await Blog.find({ slug: { $in: blog.relatedSlugs }, status: 'published' })
            .select(LIST_SELECT)
            .lean()
        : []

      res.json({ blog, related })
    } catch (err) { next(err) }
  },

  /** POST /blog/:slug/react  — like or dislike (auth required) */
  react: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const blog   = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      if (!blog) { res.status(404).json({ error: 'Blog not found' }); return }

      const { type } = req.body as { type: 'like' | 'dislike' }
      if (!['like', 'dislike'].includes(type)) {
        res.status(400).json({ error: 'type must be like or dislike' }); return
      }

      const existing = await BlogReaction.findOne({ blogId: blog._id, userId })

      if (existing) {
        if (existing.type === type) {
          // Toggle off
          await existing.deleteOne()
          await Blog.updateOne({ _id: blog._id }, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: -1 } })
          res.json({ action: 'removed', type })
        } else {
          // Switch type
          const oldField = existing.type === 'like' ? 'likes' : 'dislikes'
          const newField = type === 'like' ? 'likes' : 'dislikes'
          existing.type = type
          await existing.save()
          await Blog.updateOne({ _id: blog._id }, { $inc: { [oldField]: -1, [newField]: 1 } })
          res.json({ action: 'switched', type })
        }
      } else {
        await BlogReaction.create({ blogId: blog._id, userId, type })
        await Blog.updateOne({ _id: blog._id }, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: 1 } })
        res.json({ action: 'added', type })
      }
    } catch (err) { next(err) }
  },

  /** GET /blog/:slug/my-reaction  — current user's reaction */
  myReaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const blog   = await Blog.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!blog) { res.json({ reaction: null }); return }
      const reaction = await BlogReaction.findOne({ blogId: blog._id, userId }).lean()
      res.json({ reaction: reaction?.type ?? null })
    } catch (err) { next(err) }
  },

  // ─── Comments ──────────────────────────────────────────────────────────────

  /** GET /blog/:slug/comments?page=&limit=  — paginated top-level comments, each with its first page of replies */
  listComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await Blog.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!blog) { res.json({ comments: [], total: 0, page: 1, pages: 0 }); return }

      const page  = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || COMMENTS_PAGE_SIZE))

      const filter = { blogId: blog._id, parentId: null, isDeleted: false }
      const [comments, total] = await Promise.all([
        BlogComment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        BlogComment.countDocuments(filter),
      ])

      // First page of replies per comment on this page, plus each comment's total reply count —
      // bounded by this page's comments, not the whole post's reply history.
      const ids = comments.map(c => c._id)
      const replyGroups = ids.length ? await BlogComment.aggregate([
        { $match: { parentId: { $in: ids }, isDeleted: false } },
        { $sort: { createdAt: 1 } },
        { $group: { _id: '$parentId', total: { $sum: 1 }, replies: { $push: '$$ROOT' } } },
        { $project: { total: 1, replies: { $slice: ['$replies', REPLIES_PAGE_SIZE] } } },
      ]) : []
      const replyMap = new Map(replyGroups.map(g => [g._id.toString(), g]))

      const result = comments.map(c => {
        const g = replyMap.get(c._id.toString())
        return { ...c, replies: g?.replies ?? [], repliesTotal: g?.total ?? 0 }
      })

      res.json({ comments: result, total, page, pages: Math.ceil(total / limit) })
    } catch (err) { next(err) }
  },

  /** GET /blog/comments/:id/replies?skip=&limit=  — further replies under one comment */
  listReplies: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skip  = Math.max(0, parseInt(req.query.skip as string) || 0)
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || REPLIES_PAGE_SIZE))
      const filter = { parentId: req.params.id, isDeleted: false }

      const [replies, total] = await Promise.all([
        BlogComment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
        BlogComment.countDocuments(filter),
      ])

      res.json({ replies, total })
    } catch (err) { next(err) }
  },

  /** POST /blog/:slug/comments  — add comment or reply */
  addComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id
      const { content, parentId } = req.body as { content: string; parentId?: string }

      if (!content?.trim()) { res.status(400).json({ error: 'content is required' }); return }
      if (content.length > 4000) { res.status(400).json({ error: 'comment too long' }); return }

      const blog = await Blog.findOne({ slug: req.params.slug }).select('_id').lean()
      if (!blog) { res.status(404).json({ error: 'Blog not found' }); return }

      const user = req.user!
      const comment = await BlogComment.create({
        blogId:     blog._id,
        parentId:   parentId ?? null,
        authorId:   userId,
        authorName: (user as { name?: string }).name ?? 'Anonymous',
        authorImage:(user as { image?: string }).image,
        content:    content.trim(),
      })

      res.status(201).json({ comment })
    } catch (err) { next(err) }
  },

  /** PATCH /blog/comments/:id  — edit own comment */
  updateComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user!.id
      const { content } = req.body as { content: string }
      if (!content?.trim()) { res.status(400).json({ error: 'content is required' }); return }

      const comment = await BlogComment.findById(req.params.id)
      if (!comment || comment.isDeleted) { res.status(404).json({ error: 'Not found' }); return }
      if (comment.authorId !== userId) { res.status(403).json({ error: 'Forbidden' }); return }

      comment.content = content.trim()
      await comment.save()
      res.json({ comment })
    } catch (err) { next(err) }
  },

  /** DELETE /blog/comments/:id  — soft-delete own comment */
  deleteComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId  = req.user!.id
      const comment = await BlogComment.findById(req.params.id)
      if (!comment) { res.status(404).json({ error: 'Not found' }); return }
      if (comment.authorId !== userId) { res.status(403).json({ error: 'Forbidden' }); return }
      comment.isDeleted = true
      comment.content   = '[deleted]'
      await comment.save()
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  /** POST /blog/comments/:id/report */
  reportComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await BlogComment.findById(req.params.id)
      if (!comment) { res.status(404).json({ error: 'Not found' }); return }
      comment.isReported = true
      await comment.save()
      res.json({ ok: true })
    } catch (err) { next(err) }
  },
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export const adminBlogController = {

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, page = '1', limit = '20' } = req.query as Record<string, string>
      const pageNum  = Math.max(1, parseInt(page) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
      const filter: Record<string, unknown> = {}
      if (status) filter.status = status
      const [blogs, total] = await Promise.all([
        Blog.find(filter).select('-content').sort({ updatedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
        Blog.countDocuments(filter),
      ])
      res.json({ blogs, total, page: pageNum, pages: Math.ceil(total / limitNum) })
    } catch (err) { next(err) }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await Blog.findById(req.params.id).lean()
      if (!blog) { res.status(404).json({ error: 'Not found' }); return }
      res.json(blog)
    } catch (err) { next(err) }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body
      const error = prepareContent(data)
      if (error) { res.status(400).json({ error }); return }
      const blog = await Blog.create(data)
      res.status(201).json(blog)
    } catch (err) { next(err) }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body
      if (data.content) {
        const error = prepareContent(data)
        if (error) { res.status(400).json({ error }); return }
      }
      const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: data }, { new: true })
      if (!blog) { res.status(404).json({ error: 'Not found' }); return }
      res.json(blog)
    } catch (err) { next(err) }
  },

  publish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: { status: 'published', publishedAt: new Date() } },
        { new: true },
      )
      if (!blog) { res.status(404).json({ error: 'Not found' }); return }
      res.json(blog)
    } catch (err) { next(err) }
  },

  unpublish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: { status: 'draft' } }, { new: true })
      if (!blog) { res.status(404).json({ error: 'Not found' }); return }
      res.json(blog)
    } catch (err) { next(err) }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Blog.findByIdAndDelete(req.params.id)
      await BlogComment.deleteMany({ blogId: req.params.id })
      await BlogReaction.deleteMany({ blogId: req.params.id })
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  duplicate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const original = await Blog.findById(req.params.id).lean()
      if (!original) { res.status(404).json({ error: 'Not found' }); return }
      const { _id, createdAt, updatedAt, views, likes, dislikes, ...rest } = original as Record<string, unknown>
      void _id; void createdAt; void updatedAt; void views; void likes; void dislikes
      const copy = await Blog.create({
        ...rest,
        slug:   `${rest.slug}-copy-${Date.now()}`,
        title:  `${rest.title} (Copy)`,
        status: 'draft',
        publishedAt: null,
      })
      res.status(201).json(copy)
    } catch (err) { next(err) }
  },

  // Blog analytics
  analytics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        totalBlogs,
        publishedBlogs,
        topViewed,
        topLiked,
        categoryBreakdown,
      ] = await Promise.all([
        Blog.countDocuments(),
        Blog.countDocuments({ status: 'published' }),
        Blog.find({ status: 'published' }).select('title slug views likes category publishedAt').sort({ views: -1 }).limit(10).lean(),
        Blog.find({ status: 'published' }).select('title slug views likes category publishedAt').sort({ likes: -1 }).limit(10).lean(),
        Blog.aggregate([
          { $match: { status: 'published' } },
          { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
          { $sort: { totalViews: -1 } },
        ]),
      ])

      const totalViews = topViewed.reduce((s, b) => s + (b.views ?? 0), 0)
      const totalLikes = topLiked.reduce((s, b) => s + (b.likes ?? 0), 0)

      res.json({ totalBlogs, publishedBlogs, totalViews, totalLikes, topViewed, topLiked, categoryBreakdown })
    } catch (err) { next(err) }
  },

  // Admin comment management
  listComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reported, page = '1' } = req.query as Record<string, string>
      const filter: Record<string, unknown> = {}
      if (reported === 'true') filter.isReported = true
      const comments = await BlogComment.find(filter).sort({ createdAt: -1 }).skip((parseInt(page) - 1) * 20).limit(20).lean()
      const total = await BlogComment.countDocuments(filter)
      res.json({ comments, total })
    } catch (err) { next(err) }
  },

  deleteComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await BlogComment.findByIdAndDelete(req.params.id)
      res.json({ ok: true })
    } catch (err) { next(err) }
  },
}
