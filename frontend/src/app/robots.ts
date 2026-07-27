import type { MetadataRoute } from 'next'

const SITE_URL = 'https://lldcanvas.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/editor/',
          '/settings/',
          '/api/',
          '/collab/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
