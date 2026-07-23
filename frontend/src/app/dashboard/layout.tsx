'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth'

// Every /dashboard/* page previously rendered with zero auth-gating — an
// anonymous visitor saw full dashboard chrome around a broken "not found"
// state (the underlying API calls 401, but nothing redirected). This guard
// wraps the whole tree once, following the same postLoginRedirect + ?auth=1
// pattern already used by editor/[id]/page.tsx and collab/accept/page.tsx.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isPending || session) return
    sessionStorage.setItem('postLoginRedirect', pathname)
    router.replace('/?auth=1')
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
