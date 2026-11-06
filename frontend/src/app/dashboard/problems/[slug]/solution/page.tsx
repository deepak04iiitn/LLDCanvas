'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ProblemSolutionView } from '@/components/problems/ProblemSolutionView'
import { getProblemSolution } from '@/content/problem-solutions'
import { api } from '@/lib/api'
import type { ProblemDetail } from '@/types'

function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {children}
    </div>
  )
}

export default function ProblemSolutionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params?.slug ?? '')
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const solution = slug ? getProblemSolution(slug) : undefined

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)
    api.problems
      .get(slug)
      .then(res => {
        if (cancelled) return
        setProblem(res.problem)
      })
      .catch(() => {
        if (!cancelled) setError('Problem not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <FullPage>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
        </div>
      </FullPage>
    )
  }

  if (error || !problem) {
    return (
      <FullPage>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-ink-muted">{error ?? 'Problem not found'}</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/problems')}
            className="text-sm font-medium text-brand hover:underline"
          >
            Back to problems
          </button>
        </div>
      </FullPage>
    )
  }

  if (!solution) {
    return (
      <FullPage>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-serif text-xl font-bold text-ink">Solution coming soon</p>
          <p className="max-w-md text-sm text-ink-muted">
            We&apos;re publishing official LLD solutions in batches. This problem doesn&apos;t have one yet.
          </p>
          <Link
            href={`/dashboard/problems/${slug}`}
            className="text-sm font-medium text-brand hover:underline"
          >
            Back to problem brief
          </Link>
        </div>
      </FullPage>
    )
  }

  return (
    <FullPage>
      <div className="min-h-screen">
        <ProblemSolutionView
          problem={{
            slug: problem.slug,
            title: problem.title,
            difficulty: problem.difficulty,
            category: problem.category,
            description: problem.description,
            functionalRequirements: problem.functionalRequirements ?? [],
            nonFunctionalRequirements: problem.nonFunctionalRequirements ?? [],
          }}
          solution={solution}
          backHref={`/dashboard/problems/${slug}`}
        />
      </div>
    </FullPage>
  )
}
