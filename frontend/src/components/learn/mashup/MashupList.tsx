'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type MashupRecipe } from '@/lib/learn-api'

export function MashupList() {
  const [recipes, setRecipes] = useState<MashupRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.mashup.list()
        if (!cancelled) setRecipes(data.recipes ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load mashups')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CategoryShell
      title="Architecture Mashup"
      subtitle="Combine problem constraints into one design challenge"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : recipes.length === 0 ? (
          <p className="text-center text-[14px] text-ink-muted">
            No mashup recipes yet. Seed with{' '}
            <code className="font-mono text-[12px]">seed-learn-modes.ts</code>.
          </p>
        ) : (
          <ul className="space-y-3">
            {recipes.map(r => {
              const id = r.slug || r._id || r.id || ''
              return (
                <li key={id}>
                  <Link
                    href={`/learn/mashup/${id}`}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-hairline bg-paper-elevated p-5 transition-all hover:border-brand/30"
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                        {r.difficulty}
                        {r.problemLabels?.length
                          ? ` · ${r.problemLabels.join(' × ')}`
                          : ''}
                      </p>
                      <h2 className="mt-1 font-serif text-lg font-medium text-ink group-hover:text-brand">
                        {r.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-[13px] text-ink-muted">
                        {r.summary}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="mt-1 shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </CategoryShell>
  )
}
