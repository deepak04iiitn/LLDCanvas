import type { MetadataRoute } from 'next'

const SITE_URL = 'https://lldcanvas.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/editor', '/settings'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
