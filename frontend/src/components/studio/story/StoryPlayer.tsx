'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StoryResult } from '@/lib/graph/storyWalk'
import { cn } from '@/lib/utils'

export interface StoryPlayerProps {
  story: StoryResult | null
  onStepChange?: (elementIds: string[]) => void
  className?: string
}

export function StoryPlayer({ story, onStepChange, className }: StoryPlayerProps) {
  const [index, setIndex] = useState(0)

  if (!story || story.steps.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center p-6 text-center', className)}>
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Explain as a Story
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">
            Can&apos;t find a path yet — add connected types to generate a walkthrough.
          </p>
        </div>
      </div>
    )
  }

  const step = story.steps[Math.min(index, story.steps.length - 1)]
  const go = (next: number) => {
    const i = Math.max(0, Math.min(story.steps.length - 1, next))
    setIndex(i)
    onStepChange?.(story.steps[i].elementIds)
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Explain as a Story
        </p>
        <h3 className="mt-1 font-serif text-base font-medium text-ink">{story.title}</h3>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between p-4">
        <p className="text-[14px] leading-relaxed text-ink-muted">{step.text}</p>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-ink-muted transition-colors hover:bg-hairline/50 disabled:opacity-40"
            aria-label="Previous step"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-[11px] text-ink-faint">
            {index + 1} / {story.steps.length}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index >= story.steps.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-ink-muted transition-colors hover:bg-hairline/50 disabled:opacity-40"
            aria-label="Next step"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
