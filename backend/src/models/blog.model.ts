import { Schema, model, Document } from 'mongoose'
import { BlogBlock } from '../types/blog-content'

export interface IBlogToc {
  id:    string
  text:  string
  level: number
}

export interface IBlogFaq {
  q: string
  a: string
}

export interface IBlog extends Document {
  slug:        string
  title:       string
  subtitle:    string
  excerpt:     string
  content:     BlogBlock[]
  coverImage?: string
  coverImageAlt?: string

  author: {
    name:    string
    role:    string
    avatar?: string
  }

  category:    string
  tags:        string[]

  status:      'draft' | 'published' | 'scheduled'
  scheduledAt?: Date
  publishedAt?: Date

  isFeatured:  boolean
  readingTime: number        // minutes

  seo: {
    metaTitle:       string
    metaDescription: string
    keywords:        string[]
    ogImage?:        string
  }

  faq:          IBlogFaq[]
  toc:          IBlogToc[]
  relatedSlugs: string[]

  views:    number
  likes:    number
  dislikes: number

  createdAt: Date
  updatedAt: Date
}

const tocSchema = new Schema<IBlogToc>({ id: String, text: String, level: Number }, { _id: false })
const faqSchema = new Schema<IBlogFaq>({ q: String, a: String }, { _id: false })

const blogSchema = new Schema<IBlog>(
  {
    slug:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    title:   { type: String, required: true },
    subtitle: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    content: { type: [Schema.Types.Mixed], required: true } as unknown as { type: BlogBlock[] },
    coverImage:    { type: String },
    coverImageAlt: { type: String },

    author: {
      name:   { type: String, required: true },
      role:   { type: String, default: 'LLDCanvas Team' },
      avatar: { type: String },
    },

    category: { type: String, required: true },
    tags:     { type: [String], default: [] },

    status:      { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },

    isFeatured:  { type: Boolean, default: false },
    readingTime: { type: Number, default: 5 },

    seo: {
      metaTitle:       { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords:        { type: [String], default: [] },
      ogImage:         { type: String },
    },

    faq:          { type: [faqSchema], default: [] },
    toc:          { type: [tocSchema], default: [] },
    relatedSlugs: { type: [String], default: [] },

    views:    { type: Number, default: 0 },
    likes:    { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { timestamps: true },
)

blogSchema.index({ status: 1, publishedAt: -1 })
blogSchema.index({ category: 1 })
blogSchema.index({ tags: 1 })
blogSchema.index({ isFeatured: 1 })
blogSchema.index({ views: -1 })
blogSchema.index({ likes: -1 })
blogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' })

export const Blog = model<IBlog>('Blog', blogSchema)
