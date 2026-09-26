'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface SharePanelProps {
  diagramId?: string | null
  defaultTitle?: string
  className?: string
}

/**
 * Share tab — copy a shareable link for the current diagram.
 */
export function SharePanel({
  diagramId = null,
  defaultTitle = '',
  className,
}: SharePanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url =
      diagramId && diagramId !== 'local'
        ? `${window.location.origin}/design-studio/editor/${diagramId}`
        : window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-y-auto bg-paper', className)}>
      <div className="border-b border-hairline px-4 py-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Share
        </p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Copy a shareable link to this diagram.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {(!diagramId || diagramId === 'local') && (
          <p className="rounded-md border border-hairline bg-paper-elevated px-3 py-2 text-[13px] text-ink-muted">
            Save this diagram to your account to get a shareable link.
          </p>
        )}

        <button
          type="button"
          disabled={!diagramId || diagramId === 'local'}
          onClick={() => void handleCopy()}
          className="rounded-md bg-brand px-3 py-2 text-[13px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}
