'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryShell } from '@/components/studio/shell/CategoryShell'
import { learnApi } from '@/lib/learn-api'

export function RoguelikeLobby() {
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  async function start() {
    setStarting(true)
    try {
      const data = await learnApi.roguelike.start()
      router.push(`/learn/roguelike/${data.runId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start run')
      setStarting(false)
    }
  }

  return (
    <CategoryShell
      title="LLD Roguelike"
      subtitle="Run-based practice with modifiers and escalating levels"
      backHref="/learn"
      backLabel="Learn"
    >
      <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
        <p className="font-serif text-2xl font-medium text-ink">
          Start a new run
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          Each run rolls modifiers (composition-only, max classes, required
          patterns) and advances through level prompts. MVP tracks the run
          server-side — sketch designs in the editor between levels.
        </p>
        <button
          type="button"
          disabled={starting}
          onClick={start}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {starting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Begin run
        </button>
      </div>
    </CategoryShell>
  )
}
