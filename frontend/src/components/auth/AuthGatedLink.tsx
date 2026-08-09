'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { useAuthModal } from '@/lib/auth-modal-store'

interface AuthGatedLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

/**
 * A button that behaves like a link but gates on authentication.
 * - Logged in  → navigates directly to `href`
 * - Logged out → opens the auth modal; after successful login the user is
 *               automatically redirected to `href`
 */
export function AuthGatedLink({ href, className, children }: AuthGatedLinkProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { openAuthModal } = useAuthModal()

  function handleClick() {
    if (session) {
      router.push(href)
    } else {
      openAuthModal(href, 'signin')
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
