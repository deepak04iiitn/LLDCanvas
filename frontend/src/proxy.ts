import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isDown = process.env.MAINTENANCE_MODE === 'true'

  // Pass through when the site is up
  if (!isDown) return NextResponse.next()

  const { pathname } = request.nextUrl

  // Always allow the maintenance page and its static dependencies
  if (
    pathname === '/maintenance' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_health') ||  // health-check bypass if needed
    /\.(png|jpe?g|gif|svg|ico|webp|woff2?|ttf|otf)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Redirect every other URL to /maintenance
  const url = request.nextUrl.clone()
  url.pathname = '/maintenance'
  return NextResponse.redirect(url)
}

export const config = {
  // Run on every route except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
