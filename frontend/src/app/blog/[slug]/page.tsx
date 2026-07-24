import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { BlogDetailClient } from '@/components/blog/BlogDetailClient'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${BASE}/blog/${slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getBlog(slug)
  if (!data?.blog) return { title: 'Blog | LLDCanvas' }

  const { blog } = data
  return {
    title: blog.seo?.metaTitle || `${blog.title} | LLDCanvas Blog`,
    description: blog.seo?.metaDescription || blog.excerpt,
    keywords: blog.seo?.keywords ?? blog.tags,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      url: `/blog/${blog.slug}`,
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      tags: blog.tags,
      authors: [blog.author?.name ?? 'LLDCanvas Team'],
      ...(blog.coverImage ? { images: [{ url: blog.coverImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
    },
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getBlog(slug)
  if (!data?.blog) notFound()

  const { blog, related } = data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    author: { '@type': 'Organization', name: blog.author?.name ?? 'LLDCanvas Team', url: 'https://lldcanvas.com' },
    publisher: { '@type': 'Organization', name: 'LLDCanvas', url: 'https://lldcanvas.com' },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    url: `https://lldcanvas.com/blog/${blog.slug}`,
    ...(blog.coverImage ? { image: blog.coverImage } : {}),
    articleSection: blog.category,
    keywords: blog.tags?.join(', '),
    ...(blog.faq?.length > 0 ? {
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: blog.faq.map((f: { q: string; a: string }) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    } : {}),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lldcanvas.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://lldcanvas.com/blog' },
          { '@type': 'ListItem', position: 3, name: blog.title, item: `https://lldcanvas.com/blog/${blog.slug}` },
        ],
      }} />
      <BlogDetailClient blog={blog} related={related ?? []} />
    </>
  )
}
