'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth'

interface AuthGatedLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

/**
 * A button that behaves like a link but gates on authentication.
 * - Logged in  → navigates directly to `href`
 * - Logged out → redirects to /sign-in?next=<href> so the user lands back
 *               on the intended page after successful authentication
 */
export function AuthGatedLink({ href, className, children }: AuthGatedLinkProps) {
  const router = useRouter()
  const { data: session } = useSession()

  function handleClick() {
    if (session) {
      router.push(href)
    } else {
      router.push(`/sign-in?next=${encodeURIComponent(href)}`)
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
