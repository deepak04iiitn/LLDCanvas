import type { BlogBlock } from '../../../types/blog-content'
import type { IBlogFaq } from '../../../models/blog.model'

/**
 * Seed-ready blog definition for feature SEO posts.
 * Mirror of the shape used by seed-blogs.ts — do not invent fields.
 */
export interface FeatureBlogSeed {
  /** Maps to the public feature page, e.g. /features/plannr */
  featurePath: string
  featureName: string
  /** SEO planning notes — not stored in Mongo */
  seoPlan: {
    primaryKeyword: string
    secondaryKeywords: string[]
    searchIntent: string
    suggestedCoverAlt: string
  }
  slug: string
  title: string
  subtitle: string
  excerpt: string
  category: string
  tags: string[]
  isFeatured: boolean
  relatedSlugs: string[]
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  faq: IBlogFaq[]
  content: BlogBlock[]
}
