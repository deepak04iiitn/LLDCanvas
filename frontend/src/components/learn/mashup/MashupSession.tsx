'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi, type MashupRecipe } from '@/lib/learn-api'

export function MashupSession() {
  const params = useParams()
  const id = String(params.id ?? '')
  const [recipe, setRecipe] = useState<MashupRecipe | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await learnApi.mashup.start(id)
        if (!cancelled) {
          setRecipe(data.recipe)
          setSessionId(data.sessionId)
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to start mashup')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <CategoryShell
      title={recipe?.title ?? 'Architecture Mashup'}
      subtitle={recipe ? recipe.difficulty : 'Loading…'}
      backHref="/learn/mashup"
      backLabel="Mashups"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : !recipe ? (
          <p className="text-center text-[14px] text-ink-muted">Recipe not found.</p>
        ) : (
          <div className="space-y-6">
            {sessionId && (
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                Session {sessionId}
              </p>
            )}
            <p className="text-[15px] leading-relaxed text-ink">{recipe.summary}</p>
            {recipe.problemLabels?.length > 0 && (
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                  Combined problems
                </p>
                <p className="mt-1 text-[14px] text-ink">
                  {recipe.problemLabels.join(' × ')}
                </p>
              </div>
            )}
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Constraints
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] text-ink-muted">
                {(recipe.constraints ?? []).map(c => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <p className="rounded-xl border border-hairline bg-paper-elevated p-4 text-[13px] text-ink-muted">
              Open the editor and sketch a design that satisfies every constraint.
              Submission grading lands in a later pass — this session is practice
              brief only.
            </p>
          </div>
        )}
      </div>
    </CategoryShell>
  )
}
