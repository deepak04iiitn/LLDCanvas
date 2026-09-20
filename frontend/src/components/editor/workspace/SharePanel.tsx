'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { communityApi } from '@/lib/community-api'

export interface SharePanelProps {
  diagramId?: string | null
  defaultTitle?: string
  className?: string
}

/**
 * Share tab — publish the current diagram to the Community Gallery.
 */
export function SharePanel({
  diagramId = null,
  defaultTitle = '',
  className,
}: SharePanelProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [summary, setSummary] = useState('')
  const [replayEnabled, setReplayEnabled] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)

  const canPublish =
    Boolean(diagramId && diagramId !== 'local') && title.trim().length > 0 && !publishing

  const handlePublish = async () => {
    if (!diagramId || diagramId === 'local') {
      toast.error('Save this diagram first to publish')
      return
    }
    setPublishing(true)
    try {
      const doc = await communityApi.publish({
        diagramId,
        title: title.trim(),
        summary: summary.trim(),
        replayEnabled,
      })
      setPublishedSlug(doc.slug)
      toast.success('Published to Community Gallery')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-y-auto bg-paper', className)}>
      <div className="border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Share
        </p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Publish to the Community Gallery so others can study and fork your design.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {!diagramId || diagramId === 'local' ? (
          <p className="rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink-muted">
            Save this diagram to your account before publishing.
          </p>
        ) : null}

        <label className="block">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-ink-faint">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
            placeholder="Design title"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-ink-faint">
            Summary
          </span>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink outline-none focus:border-brand"
            placeholder="What should viewers learn from this design?"
          />
        </label>

        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={replayEnabled}
            onChange={e => setReplayEnabled(e.target.checked)}
            className="rounded border-hairline"
          />
          Enable design replay for viewers
        </label>

        <button
          type="button"
          disabled={!canPublish}
          onClick={() => void handlePublish()}
          className="rounded-md bg-brand px-3 py-2 text-[13px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? 'Publishing…' : 'Publish to Gallery'}
        </button>

        {publishedSlug && (
          <p className="text-[13px] text-ink-muted">
            Live at{' '}
            <Link
              href={`/community/d/${publishedSlug}`}
              className="font-medium text-brand hover:underline"
            >
              /community/d/{publishedSlug}
            </Link>
          </p>
        )}

        <Link
          href="/community"
          className="text-[13px] font-medium text-brand hover:underline"
        >
          Browse Community Gallery →
        </Link>
      </div>
    </div>
  )
}
