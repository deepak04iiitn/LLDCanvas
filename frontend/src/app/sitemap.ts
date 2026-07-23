import type { MetadataRoute } from 'next'
import { publicApi } from '@/lib/public-api'

const SITE_URL = 'https://lldcanvas.com'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',                            priority: 1.0, changeFrequency: 'weekly' },
  { path: '/pricing',                    priority: 0.8, changeFrequency: 'monthly' },
  { path: '/docs',                       priority: 0.6, changeFrequency: 'monthly' },
  { path: '/playground',                 priority: 0.7, changeFrequency: 'monthly' },
  { path: '/features',                     priority: 0.9, changeFrequency: 'weekly' },
  { path: '/features/editor',              priority: 0.8, changeFrequency: 'monthly' },
  { path: '/features/draft-notation',      priority: 0.8, changeFrequency: 'monthly' },
  { path: '/features/interview-mode',      priority: 0.8, changeFrequency: 'monthly' },
  { path: '/features/interview-questions', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/features/revision-notes',      priority: 0.9, changeFrequency: 'weekly' },
  { path: '/features/code-execution',      priority: 0.8, changeFrequency: 'monthly' },
  { path: '/features/collaboration',       priority: 0.8, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [problemsRes, notesRes] = await Promise.all([
    publicApi.problems.list(),
    publicApi.revisionNotes.list(),
  ])

  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const problemEntries: MetadataRoute.Sitemap = (problemsRes?.problems ?? []).map(p => ({
    url: `${SITE_URL}/features/interview-questions/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const noteEntries: MetadataRoute.Sitemap = (notesRes?.notes ?? []).map(n => ({
    url: `${SITE_URL}/features/revision-notes/${n.categorySlug}/${n.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...problemEntries, ...noteEntries]
}
