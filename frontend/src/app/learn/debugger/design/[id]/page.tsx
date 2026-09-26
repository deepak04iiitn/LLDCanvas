'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { DesignBugSession } from '@/components/learn/debugger/DesignBugSession'
import { Loader2 } from 'lucide-react'

async function fetchDesignBug(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
  const r = await fetch(`${base}/learn/debuglab/design/${id}`, { credentials: 'include' })
  if (!r.ok) return null
  return r.json()
}

const BREADCRUMB = [
  { label: 'Learn', href: '/learn' },
  { label: 'Design Bug Hunt', href: '/learn/debugger/design' },
  { label: 'Problems', href: '/learn/debugger/design/problems' },
]

export default function DesignBugSessionPage() {
  const params = useParams()
  const id = params?.id as string
  const [bug, setBug] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchDesignBug(id).then(setBug).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-ink-faint" />
      </div>
    )
  }

  if (!bug) {
    return (
      <div className="flex h-full items-center justify-center text-ink-muted text-sm">
        Challenge not found.
      </div>
    )
  }

  return (
    <CategoryShell
      title={bug.title}
      subtitle={bug.description}
      backHref="/learn/debugger/design/problems"
      backLabel="Design Bugs"
      breadcrumb={BREADCRUMB}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <DesignBugSession bug={bug} />
      </div>
    </CategoryShell>
  )
}
