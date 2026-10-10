'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth'

// Auth guard for all /dashboard/* pages.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isPending || session) return
    // Redirect to the dedicated sign-in page with a ?next= param so the
    // user lands back here after successful authentication.
    router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`)
  }, [isPending, session, pathname, router])

  if (isPending || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
      </div>
    )
  }

  return <>{children}</>
}
