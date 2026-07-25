import { readdirSync, type Dirent } from 'fs'
import { join } from 'path'
import type { MetadataRoute } from 'next'
import { publicApi } from '@/lib/public-api'

const SITE_URL = 'https://lldcanvas.com'

// Auth-required or internal directories — excluded from public sitemap.
// Simply add a directory name here to keep it out of search engines.
const PRIVATE_DIRS = new Set([
  'admin', 'dashboard', 'editor', 'collab', 'settings', 'api', 'auth',
])

function routePriority(path: string): number {
  if (path === '/') return 1.0
  if (['/features', '/blog', '/pricing'].includes(path)) return 0.9
  if (path.startsWith('/features/')) return 0.8
  if (['/docs', '/playground'].includes(path)) return 0.7
  return 0.6
}

function routeChangeFreq(
  path: string,
): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (['/', '/features', '/blog'].includes(path)) return 'weekly'
  return 'monthly'
}

/**
 * Recursively walk `src/app` and collect every URL path that has a page.tsx
 * but no dynamic segment (`[…]`). Route groups `(name)` are transparent to
 * the URL. Private directories listed in PRIVATE_DIRS are skipped entirely.
 *
 * Because this runs at build-time on the server, adding a new public page
 * anywhere under `src/app` automatically appears in the sitemap — no manual
 * entry required.
 */
function discoverStaticRoutes(appDir: string): string[] {
  const routes: string[] = []

  function walk(dir: string, urlPath: string) {
    let entries: Dirent<string>[]
    try {
      entries = readdirSync(dir, { withFileTypes: true }) as Dirent<string>[]
    } catch {
      return
    }

    const hasPage = entries.some(
      e => e.isFile() && (e.name === 'page.tsx' || e.name === 'page.ts'),
    )
    // Dynamic segments are fetched from the API — skip them here
    if (hasPage && !urlPath.includes('[')) {
      routes.push(urlPath || '/')
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const name = entry.name

      if (PRIVATE_DIRS.has(name)) continue
      if (name.startsWith('_') || name.startsWith('.')) continue
      if (name.startsWith('[')) continue // dynamic — handled by API fetches below

      // Route groups like `(marketing)` are URL-transparent
      const segment =
        name.startsWith('(') && name.endsWith(')') ? '' : `/${name}`
      walk(join(dir, name), urlPath + segment)
    }
  }

  walk(appDir, '')
  return [...new Set(routes)].sort()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appDir = join(process.cwd(), 'src', 'app')
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const now = new Date()

  // Auto-discovered static public routes
  const staticRoutes = discoverStaticRoutes(appDir)

  // Dynamic content fetched from the API
  const [problemsRes, notesRes, blogsRes] = await Promise.all([
    publicApi.problems.list().catch(() => ({ problems: [] })),
    publicApi.revisionNotes.list().catch(() => ({ notes: [] })),
    fetch(`${BASE}/blog?limit=500`).then(r => r.json()).catch(() => ({ blogs: [] })),
  ])

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: routeChangeFreq(path),
    priority: routePriority(path),
  }))

  const problemEntries: MetadataRoute.Sitemap = (
    (problemsRes as { problems?: { slug: string; updatedAt?: string }[] })?.problems ?? []
  ).map(p => ({
    url: `${SITE_URL}/features/interview-questions/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const noteEntries: MetadataRoute.Sitemap = (
    (notesRes as { notes?: { categorySlug: string; slug: string; updatedAt?: string }[] })?.notes ?? []
  ).map(n => ({
    url: `${SITE_URL}/features/revision-notes/${n.categorySlug}/${n.slug}`,
    lastModified: n.updatedAt ? new Date(n.updatedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const blogEntries: MetadataRoute.Sitemap = (
    (blogsRes as { blogs?: { slug: string; updatedAt?: string }[] })?.blogs ?? []
  ).map(b => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...problemEntries, ...noteEntries, ...blogEntries]
}
