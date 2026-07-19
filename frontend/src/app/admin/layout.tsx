'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return
    if (!session) { router.replace('/'); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session.user as any).isAdmin) router.replace('/dashboard')
  }, [session, isPending, router])

  if (isPending || !session) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session.user as any).isAdmin) return null

  return <AdminShell>{children}</AdminShell>
}
